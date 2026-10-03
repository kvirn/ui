import { createComponentStore } from '../store/create-component-store.ts'
import { checkFile } from './checks/check-file.ts'
import type { FileIdentity } from './checks/content.ts'
import type {
  FileUpload,
  FileUploadActions,
  FileUploadAddResult,
  FileUploadEnv,
  FileUploadItem,
  FileUploadOptions,
  FileUploadRejection,
  FileUploadState,
} from './file-upload-types.ts'
import { toUploadError } from './upload-failure.ts'

/** How many uploads run at once when `concurrency` isn't given. */
export const defaultFileUploadConcurrency = 3

interface Run {
  readonly controller: AbortController
}

function resolveConcurrency(concurrency: number | undefined): number {
  if (concurrency === undefined) {
    return defaultFileUploadConcurrency
  }
  return Number.isNaN(concurrency) || concurrency < 1 ? 1 : Math.floor(concurrency)
}

const isImage = (file: File) => file.type.toLowerCase().startsWith('image/')

/**
 * The file list and upload queue behind FileUpload. It checks each added file against
 * the limits (typed reasons, no text), keeps rejected files out of the list (they are in the add
 * result and in `rejections`, for the latest add only), and runs the consumer's
 * `upload` with at most `concurrency` at once. It does no network calls and has no timeouts
 * (hard rule 7, WCAG 2.2.1), and strings come from the adapter's i18n.
 *
 * `options` can be a function: it's read again on every action, so an adapter can pass the latest
 * props without rebuilding the store. `env` is `undefined` while server rendering: no previews.
 */
export function createFileUpload<Result = unknown>(
  options: FileUploadOptions<Result> | (() => FileUploadOptions<Result>),
  env: FileUploadEnv | undefined,
): FileUpload<Result> {
  type Item = FileUploadItem<Result>
  const readOptions = typeof options === 'function' ? options : () => options

  return createComponentStore<FileUploadState<Result>, FileUploadActions<Result>>(
    { items: [], rejections: [], isDragging: false },
    ({ getState, update }) => {
      let nextId = 1
      /** Uploads in flight. A settled promise only counts while its run is still in here. */
      const running = new Map<string, Run>()
      /** Pending item ids waiting for a slot, in the order they were queued. */
      let queue: string[] = []

      const find = (id: string): Item | undefined => getState().items.find((item) => item.id === id)

      const patchItem = (id: string, patch: Partial<Item>) => {
        update((state) => ({
          ...state,
          items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        }))
      }

      const revoke = (item: Item) => {
        if (item.previewUrl !== undefined) {
          env?.window.URL.revokeObjectURL(item.previewUrl)
        }
      }

      const settle = (id: string, run: Run, patch: Partial<Item>) => {
        if (running.get(id) !== run) {
          return
        }
        running.delete(id)
        patchItem(id, patch)
        pump()
      }

      const start = (item: Item) => {
        const upload = readOptions().upload
        if (upload === undefined) {
          return
        }
        const run: Run = { controller: new AbortController() }
        running.set(item.id, run)
        patchItem(item.id, { status: 'uploading', progress: undefined, error: undefined })

        const onProgress = (fraction: number) => {
          if (running.get(item.id) !== run || Number.isNaN(fraction)) {
            return
          }
          // Whole percent, and no update when it didn't change: at most 100 changes per upload.
          const percent = Math.round(Math.min(1, Math.max(0, fraction)) * 100)
          if (find(item.id)?.progress !== percent) {
            patchItem(item.id, { progress: percent })
          }
        }
        // Wrapped, so a function that throws before it returns a promise fails the item too.
        new Promise<Result>((resolve) => {
          resolve(upload(item.file, { signal: run.controller.signal, onProgress }))
        }).then(
          (result) => {
            settle(item.id, run, { status: 'complete', progress: 100, result, error: undefined })
          },
          (cause: unknown) => {
            settle(item.id, run, { status: 'failed', error: toUploadError(cause) })
          },
        )
      }

      /** Starts waiting items while there are free slots. */
      function pump() {
        const limit = resolveConcurrency(readOptions().concurrency)
        while (running.size < limit && queue.length > 0) {
          const id = queue.shift()
          const item = id === undefined ? undefined : find(id)
          if (item !== undefined && item.status === 'pending') {
            start(item)
          }
        }
      }

      const enqueue = (id: string) => {
        if (readOptions().upload !== undefined && !queue.includes(id) && !running.has(id)) {
          queue.push(id)
        }
      }

      /** Aborts a running upload and takes a waiting item out of the queue. */
      const stop = (id: string): boolean => {
        const run = running.get(id)
        const wasQueued = queue.includes(id)
        if (run !== undefined) {
          running.delete(id)
          run.controller.abort()
        }
        queue = queue.filter((queuedId) => queuedId !== id)
        return run !== undefined || wasQueued
      }

      const add: FileUploadActions<Result>['add'] = (files) => {
        const selected = Array.from(files)
        if (selected.length === 0) {
          return { accepted: [], rejected: [] }
        }
        const currentOptions = readOptions()
        const single = currentOptions.multiple === false
        const current = getState().items
        // Single-file mode replaces the list, so the file being replaced takes no room. It still
        // counts for duplicates: choosing the same file again changes nothing.
        let count = single ? 0 : current.length
        const identities: FileIdentity[] = current.map((item) => item.file)
        const accepted: Item[] = []
        const rejected: FileUploadRejection[] = []

        for (const file of selected) {
          const reason = checkFile(file, currentOptions, count, identities)
          if (reason !== undefined) {
            rejected.push({ file, reason })
            continue
          }
          count += 1
          identities.push(file)
          const previewUrl =
            currentOptions.previews === true && env !== undefined && isImage(file)
              ? env.window.URL.createObjectURL(file)
              : undefined
          const id = String(nextId)
          nextId += 1
          accepted.push({
            id,
            file,
            status: 'pending',
            progress: undefined,
            error: undefined,
            result: undefined,
            previewUrl,
          })
        }

        // An accepted file replaces the current one: cancel and revoke it first.
        const replaced = single && accepted.length > 0 ? current : []
        for (const item of replaced) {
          stop(item.id)
          revoke(item)
        }
        update((state) => ({
          ...state,
          items: single && accepted.length > 0 ? accepted : [...state.items, ...accepted],
          rejections: rejected,
        }))

        if (currentOptions.autoUpload !== false) {
          for (const item of accepted) {
            enqueue(item.id)
          }
        }
        // Also frees the slots of a replaced upload.
        pump()
        return { accepted, rejected } satisfies FileUploadAddResult<Result>
      }

      const remove: FileUploadActions<Result>['remove'] = (id) => {
        const item = find(id)
        if (item === undefined) {
          return
        }
        stop(id)
        revoke(item)
        update((state) => ({
          ...state,
          items: state.items.filter((other) => other.id !== id),
          rejections: [],
        }))
        pump()
      }

      const cancel: FileUploadActions<Result>['cancel'] = (id) => {
        const item = find(id)
        if (item === undefined || (item.status !== 'uploading' && item.status !== 'pending')) {
          return
        }
        if (stop(id)) {
          patchItem(id, { status: 'cancelled' })
          pump()
        }
      }

      const retry: FileUploadActions<Result>['retry'] = (id) => {
        const item = find(id)
        const retryable =
          item?.status === 'cancelled' ||
          (item?.status === 'failed' && item.error?.retryable !== false)
        if (item === undefined || !retryable) {
          return
        }
        patchItem(id, { status: 'pending', progress: undefined, error: undefined })
        enqueue(id)
        pump()
      }

      const uploadAll: FileUploadActions<Result>['uploadAll'] = () => {
        for (const item of getState().items) {
          if (item.status === 'pending') {
            enqueue(item.id)
          }
        }
        pump()
      }

      const setDragging: FileUploadActions<Result>['setDragging'] = (isDragging) => {
        if (getState().isDragging !== isDragging) {
          update((state) => ({ ...state, isDragging }))
        }
      }

      const reset: FileUploadActions<Result>['reset'] = () => {
        for (const run of running.values()) {
          run.controller.abort()
        }
        running.clear()
        queue = []
        for (const item of getState().items) {
          revoke(item)
        }
        update(() => ({ items: [], rejections: [], isDragging: false }))
      }

      return { add, remove, cancel, retry, uploadAll, setDragging, reset }
    },
  )
}
