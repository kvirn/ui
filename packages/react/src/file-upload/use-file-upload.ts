import { createFileUpload } from '@kvirn-ui/core'
import type {
  Env,
  FileUpload,
  FileUploadAddResult,
  FileUploadInput,
  FileUploadEntry,
  FileUploadOptions,
  FileUploadRejection,
  FileUploadState,
  FileUploadStatus,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { formatFileSize } from '@kvirn-ui/i18n'
import { useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type {
  ChangeEventHandler,
  CSSProperties,
  DragEvent,
  DragEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  RefCallback,
} from 'react'
import { AnnouncerContext } from '../announcer/announcer-context.ts'
import { warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { useButton } from '../button/use-button.ts'
import type { ButtonPartProps } from '../button/use-button.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import { KvirnConfigContext } from '../provider/provider-context.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'
import { useStoreSelector } from '../store/use-store-selector.ts'
import { getAnnouncementBuffer } from './file-upload-announcements.ts'
import type { AnnouncementHandle, HeldUploadResults } from './file-upload-announcements.ts'
import {
  dragCarriesFiles,
  readDroppedFiles,
  useAnyFinePointer,
  usePageFileDrag,
} from './file-upload-drag.ts'
import {
  acceptEntries,
  acceptLabels,
  displayNames,
  fileTypeLabel,
  itemErrorText,
  rejectionLines,
  statusText,
} from './file-upload-format.ts'
import type { FileUploadMessages, RejectionLine } from './file-upload-format.ts'

export interface UseFileUploadOptions<Result = unknown> extends FileUploadOptions<Result> {
  /**
   * Native `disabled` on the Trigger and the input, no drop zone and no item buttons. A disabled
   * Field disables it too.
   */
  disabled?: boolean | undefined
  /**
   * Called with the list when it changes: a file was added or removed, an upload finished or
   * failed, or an item was retried. Not on every progress step. The list holds accepted files
   * only, and an item carries what `upload` resolved with in `result`.
   */
  onFilesChange?: ((items: readonly FileUploadEntry<Result>[]) => void) | undefined
  /**
   * Called when an add refused files, with the reasons (data, not text). They are not in the
   * list. The component already shows and announces them: use this to log or to block a submit.
   */
  onFilesReject?: ((rejections: readonly FileUploadRejection[]) => void) | undefined
  /** Per-instance message overrides. */
  messages?: Partial<KvirnMessages['fileUpload']> | undefined
}

/** A part you render yourself that the Trigger's description or the hidden input depends on. */
export type FileUploadPartName = 'input' | 'limits' | 'rejections' | 'summary'

/** Where the files came from: the system dialog, a drop, or your own code. */
export type FileUploadAddSource = 'dialog' | 'drop' | 'program'

/** Spread on the root: a `<div>` that holds every part. */
export interface FileUploadRootPartProps {
  /** The part's class: `.kv-file-upload`. Add your own with `mergeProps`: class names join. */
  className: 'kv-file-upload'
  /** A file is dragged over the page, on any device. The theme then shows the zone. */
  'data-drag-active'?: ''
  /** `maxFiles` files are in the list. The Trigger does nothing until one is removed. */
  'data-full'?: ''
  'data-invalid'?: ''
  'data-disabled'?: ''
  /** Tracks which item holds focus, so focus can move to an item when its button goes away. */
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

/** Spread on the drop zone: a `<div>` with no role that is never focusable. */
export interface FileUploadDropZonePartProps {
  className: 'kv-file-upload-drop-zone'
  /** The zone is drawn: a precise pointer is attached, or a file is dragged over the page. */
  'data-droppable'?: ''
  /** A file is dragged over the zone. */
  'data-dragging'?: ''
  'data-invalid'?: ''
  'data-disabled'?: ''
  onDragEnter: DragEventHandler<HTMLElement>
  onDragOver: DragEventHandler<HTMLElement>
  onDragLeave: DragEventHandler<HTMLElement>
  onDrop: DragEventHandler<HTMLElement>
}

/**
 * Spread on the Trigger, a native `<button>`. It carries the Field's control id (so the label's
 * `for` and an error-summary link land on a visible control) and never `aria-required`, which a
 * button doesn't allow.
 */
export interface FileUploadTriggerPartProps extends Omit<ButtonPartProps, 'className'> {
  className: 'kv-button kv-file-upload-trigger'
  id: string
  /** The Trigger's own text, then the Field label: "Choose files Attachments (optional)". */
  'aria-labelledby'?: string
  /** The Field's descriptions and error, then Rejections, then the Summary when the list is full. */
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  'data-invalid'?: ''
  'data-full'?: ''
  ref: RefCallback<HTMLButtonElement>
}

/** Spread on the native `<input type="file">`: out of the accessibility tree, visually hidden. */
export interface FileUploadInputPartProps {
  type: 'file'
  accept?: string
  multiple: boolean
  disabled?: true
  /** The Trigger is the one control: the input is taken out of the accessibility tree. */
  'aria-hidden': 'true'
  tabIndex: -1
  /** Visually hidden, never `display: none`. Inline, so the headless packages ship no CSS. */
  style: CSSProperties
  ref: RefCallback<HTMLInputElement>
  onChange: ChangeEventHandler<HTMLInputElement>
}

/** Spread on each `<li>` of the list. `tabIndex={-1}` only so focus can land there. */
export interface FileUploadItemPartProps {
  className: 'kv-file-upload-item'
  tabIndex: -1
  'data-status': FileUploadStatus
  ref: RefCallback<HTMLLIElement>
}

/** Spread on an item's `<progress>`. No `value` means the size is unknown (indeterminate). */
export interface FileUploadProgressPartProps {
  className: 'kv-file-upload-progress'
  max: 100
  value?: number
  /** "Uploading report.pdf". */
  'aria-label': string
}

/** Spread on an item's Status, a `<p>`. */
export interface FileUploadStatusPartProps {
  className: 'kv-file-upload-status'
  id: string
  'data-status': FileUploadStatus
}

/** Spread on an item's error line, rendered while the item is `failed`. */
export interface FileUploadItemErrorPartProps {
  className: 'kv-file-upload-item-error'
  id: string
}

/** Spread on an item's Remove, Cancel or Retry button. */
export interface FileUploadItemButtonPartProps<ClassName extends string> {
  className: ClassName
  type: 'button'
  /** The visible text, then the file: "Remove report.pdf" (WCAG 2.5.3). */
  'aria-label': string
  onClick: MouseEventHandler<HTMLButtonElement>
}

export interface FileUploadRejectionsPartProps {
  className: 'kv-file-upload-rejections'
  id: string
}

export interface FileUploadSummaryPartProps {
  className: 'kv-file-upload-summary'
  id: string
}

export interface UseFileUploadResult<Result = unknown> {
  rootProps: FileUploadRootPartProps
  dropZoneProps: FileUploadDropZonePartProps
  triggerProps: FileUploadTriggerPartProps
  inputProps: FileUploadInputPartProps
  /** `id` is the one the Trigger's `aria-describedby` lists while you call `registerPart('rejections')`. */
  rejectionsProps: FileUploadRejectionsPartProps
  summaryProps: FileUploadSummaryPartProps
  getItemProps: (item: FileUploadEntry<Result>) => FileUploadItemPartProps
  getProgressProps: (item: FileUploadEntry<Result>) => FileUploadProgressPartProps
  getStatusProps: (item: FileUploadEntry<Result>) => FileUploadStatusPartProps
  getItemErrorProps: (item: FileUploadEntry<Result>) => FileUploadItemErrorPartProps
  getRemoveButtonProps: (
    item: FileUploadEntry<Result>,
  ) => FileUploadItemButtonPartProps<'kv-button kv-file-upload-remove'>
  getCancelButtonProps: (
    item: FileUploadEntry<Result>,
  ) => FileUploadItemButtonPartProps<'kv-button kv-file-upload-cancel'>
  getRetryButtonProps: (
    item: FileUploadEntry<Result>,
  ) => FileUploadItemButtonPartProps<'kv-button kv-file-upload-retry'>
  /** Accepted files only, in order. Rejected files never enter the list. */
  items: readonly FileUploadEntry<Result>[]
  /** The files the latest add refused, as data. */
  rejections: readonly FileUploadRejection[]
  /** One sentence per refused file: which file, and what to do. Start from `rejectedHeading`. */
  rejectionLines: readonly RejectionLine[]
  /** The text of the Trigger: choose, or replace in single-file mode with a file chosen. */
  triggerText: string
  /** The id of the element that holds the Trigger's text: wrap it, so the name starts with it (2.5.3). */
  triggerTextId: string
  /** The limits that are set, as one text (empty when none is set). */
  limitsText: string
  /** The Summary's text, for example "2 of 5 files added". Empty in single-file mode. */
  summaryText: string
  /** The drop hint, or the dragging one while a file is over the zone. */
  dropHintText: string
  /** The name the list shows: with "(2)" when two items share a file name. */
  getItemName: (item: FileUploadEntry<Result>) => string
  /** The size in the provider's locale, in decimal units: "2,4 MB". */
  getItemSize: (item: FileUploadEntry<Result>) => string
  /** The extension in capitals ("PDF"), never the MIME type. */
  getItemType: (item: FileUploadEntry<Result>) => string
  /** The status as text, for example "Uploading, 45 %". */
  getItemStatusText: (item: FileUploadEntry<Result>) => string
  /** The failed upload's text: the consumer's own, else a neutral one. `undefined` unless `failed`. */
  getItemErrorText: (item: FileUploadEntry<Result>) => string | undefined
  /** Which buttons an item shows: one action per state (Cancel only while uploading). */
  getItemActions: (item: FileUploadEntry<Result>) => {
    cancel: boolean
    retry: boolean
    remove: boolean
  }
  /** The resolved `fileUpload` messages. */
  messages: FileUploadMessages
  /** The Field label's id, for `aria-labelledby` on the list. `undefined` outside a Field. */
  labelId: string | undefined
  isMultiple: boolean
  isDisabled: boolean
  isInvalid: boolean
  /** `maxFiles` files are in the list. */
  isFull: boolean
  /** A file is dragged over the zone. */
  isDragging: boolean
  /** A file is dragged over the page. */
  isDragActive: boolean
  /** The zone is drawn: a precise pointer is attached, or a file is dragged over the page. */
  isDroppable: boolean
  /**
   * Checks and adds files, like the system dialog or a drop does: they are checked, refused ones
   * are shown and announced, and the rest enter the list. Returns who was accepted and refused.
   */
  add: (
    files: Iterable<FileUploadInput> | ArrayLike<FileUploadInput>,
    source?: FileUploadAddSource,
  ) => FileUploadAddResult<Result>
  /** Removes an item (cancelling its upload first) and announces it. */
  remove: (id: string) => void
  cancel: (id: string) => void
  retry: (id: string) => void
  /** Starts every pending upload, for `autoUpload={false}`, and announces how many. */
  uploadAll: () => void
  /** Empties the list and cancels every upload. Focus in the list goes to the Trigger. */
  reset: () => void
  /**
   * Tells the hook a part is rendered, so the Trigger's description lists it (`rejections`,
   * `summary`) and the root knows the input is there. Call it in a layout effect and return what it
   * returns. The ready-made parts do this themselves.
   */
  registerPart: (part: FileUploadPartName) => () => void
  /** `true` while the part registered with `registerPart` is rendered. */
  isPartRegistered: (part: FileUploadPartName) => boolean
}

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
}

const selectState = <Result>(state: FileUploadState<Result>) => state

/** The Field label's text without its optional marker, read at announcement time. */
function readFieldLabel(env: Env | undefined, labelId: string | undefined): string | undefined {
  if (env === undefined || labelId === undefined) {
    return undefined
  }
  const label = env.document.getElementById(labelId)
  const clone = label?.cloneNode(true)
  if (!(clone instanceof env.window.Element)) {
    return undefined
  }
  for (const marker of clone.querySelectorAll('.kv-field-optional')) {
    marker.remove()
  }
  const text = (clone.textContent ?? '').trim()
  return text === '' ? undefined : text
}

/** Compares the files in the native input with the list, so it's only written when it differs. */
function hasSameFiles(input: HTMLInputElement, files: readonly File[]): boolean {
  const current = Array.from(input.files ?? [])
  return current.length === files.length && current.every((file, index) => file === files[index])
}

/**
 * A file upload's behaviour for your own elements (contract: file-upload.a11y.md): one
 * native button that opens the system dialog, a hidden native input, an optional drop zone, the
 * list of accepted files, the upload queue and the announcements. It checks every file against
 * the limits (type, size, count, empty, duplicate, folder, your `validate`), keeps refused files out
 * of the list and tells the user which and why. It makes no network calls: `upload` is yours.
 *
 * @example
 * const fileUpload = useFileUpload({ accept: '.pdf', multiple: true, maxFiles: 5 })
 * <div {...fileUpload.rootProps}>
 *   <div {...fileUpload.dropZoneProps}>
 *     <button {...fileUpload.triggerProps}>
 *       <span id={fileUpload.triggerTextId}>{fileUpload.triggerText}</span>
 *     </button>
 *   </div>
 *   <input {...fileUpload.inputProps} name="attachments" />
 * </div>
 */
export function useFileUpload<Result = unknown>(
  options: UseFileUploadOptions<Result> = {},
): UseFileUploadResult<Result> {
  const field = useContext(FieldContext)
  const announcer = useContext(AnnouncerContext)
  const { format } = useContext(KvirnConfigContext)
  const env = useEnv()
  const messages = useMessages('fileUpload', options.messages)
  const baseId = useId()

  const optionsRef = useRef(options)
  const envRef = useRef(env)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const inputElements = useRef(new Set<HTMLInputElement>())
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemElements = useRef(new Map<string, HTMLElement>())
  const itemRefs = useRef(new Map<string, RefCallback<HTMLLIElement>>())
  /** The files of the latest add, in the order given: where a rejected file stood in it. */
  const [selection, setSelection] = useState<readonly File[]>([])
  const focusedItemId = useRef<string | null>(null)
  const previousItemIds = useRef<readonly string[]>([])
  const announcementHandle = useRef<AnnouncementHandle | null>(null)

  const [store] = useState<FileUpload<Result>>(() => {
    const urlApi = () => envRef.current?.window.URL ?? URL
    return createFileUpload<Result>(() => optionsRef.current, {
      window: {
        URL: {
          createObjectURL: (object) => urlApi().createObjectURL(object),
          revokeObjectURL: (url) => {
            urlApi().revokeObjectURL(url)
          },
        },
      },
    })
  })
  const state = useStoreSelector(store, selectState)
  const [partCounts, setPartCounts] = useState<Readonly<Record<FileUploadPartName, number>>>({
    input: 0,
    limits: 0,
    rejections: 0,
    summary: 0,
  })

  const isPageDragActive = usePageFileDrag(env)
  const hasFinePointer = useAnyFinePointer(env)

  const isMultiple = options.multiple !== false
  const maxFiles = isMultiple ? options.maxFiles : undefined
  const hasUpload = options.upload !== undefined
  const isDisabled = (field?.state.isDisabled ?? false) || options.disabled === true
  const isInvalid = field?.state.isInvalid ?? false
  const items = state.items
  const isFull = maxFiles !== undefined && items.length >= maxFiles
  const names = displayNames(items, messages)
  const getItemName = (item: FileUploadEntry<Result>) => names.get(item.id) ?? item.file.name

  // The newest values, for what runs outside a render: store subscriptions and announcements.
  const latest = useRef({ messages, env, labelId: field?.labelId, names })
  useLayoutEffect(() => {
    optionsRef.current = options
    envRef.current = env
    latest.current = { messages, env, labelId: field?.labelId, names }
  })

  const say = (message: string) => {
    if (announcer === null) {
      warnAnnouncerMissing()
      return
    }
    announcementHandle.current?.say(message)
  }

  // One buffer per Announcer, shared by every FileUpload under it (design spec §7.3).
  useEffect(() => {
    if (announcer === null) {
      return undefined
    }
    const handle = getAnnouncementBuffer(announcer).join({
      getLabel: () => readFieldLabel(latest.current.env, latest.current.labelId),
      wrapWithLabel: (label, message) =>
        latest.current.messages.announcementForField({ label, message }),
      summarizeResults: ({ completed, failed }: HeldUploadResults) => {
        const { messages: current } = latest.current
        const list = store.getState().items
        const sentences: string[] = []
        // A batch that emptied the queue with no failure is one sentence, counted from what's left.
        if (
          failed.length === 0 &&
          completed.length > 0 &&
          list.every((item) => item.status === 'complete')
        ) {
          sentences.push(current.allUploadsComplete({ count: list.length }))
        } else {
          if (completed.length === 1) {
            sentences.push(current.uploadComplete({ name: completed[0] ?? '' }))
          } else if (completed.length > 1) {
            sentences.push(current.uploadsComplete({ count: completed.length }))
          }
          if (failed.length === 1) {
            sentences.push(current.uploadFailed({ name: failed[0] ?? '' }))
          } else if (failed.length > 1) {
            sentences.push(current.uploadsFailed({ count: failed.length }))
          }
        }
        return sentences.join(' ')
      },
    })
    announcementHandle.current = handle
    return () => {
      handle.dispose()
      announcementHandle.current = null
    }
  }, [announcer, store])

  // Upload results are announced from the store, so every path (auto upload, retry, uploadAll)
  // goes the same way. Held sentences for an item that was cancelled, retried or removed drop.
  useEffect(() => {
    let previous = new Map(
      store.getState().items.map((item): [string, FileUploadStatus] => [item.id, item.status]),
    )
    return store.subscribe(() => {
      const list = store.getState().items
      const current = new Map(
        list.map((item): [string, FileUploadStatus] => [item.id, item.status]),
      )
      const handle = announcementHandle.current
      for (const item of list) {
        const before = previous.get(item.id)
        if (before === item.status) {
          continue
        }
        const name = latest.current.names.get(item.id) ?? item.file.name
        if (before === 'uploading' && item.status === 'complete') {
          handle?.reportUploadResult(item.id, name, 'complete')
        } else if (before === 'uploading' && item.status === 'failed') {
          handle?.reportUploadResult(item.id, name, 'failed')
        } else {
          handle?.forget(item.id)
        }
      }
      for (const id of previous.keys()) {
        if (!current.has(id)) {
          handle?.forget(id)
        }
      }
      previous = current
    })
  }, [store])

  // onFilesChange: when the list changes, not on every progress step.
  useEffect(() => {
    let previous = store.getState().items
    return store.subscribe(() => {
      const list = store.getState().items
      if (list === previous) {
        return
      }
      const before = previous
      previous = list
      const hasChanged =
        list.length !== before.length ||
        list.some((item, index) => {
          const other = before[index]
          return (
            other === undefined ||
            other.id !== item.id ||
            other.status !== item.status ||
            other.result !== item.result ||
            other.error !== item.error
          )
        })
      if (hasChanged) {
        optionsRef.current.onFilesChange?.(list)
      }
    })
  }, [store])

  // Last, so its cleanup runs after the subscriptions above are gone: unmounting reports nothing.
  useEffect(
    () => () => {
      store.actions.reset()
    },
    [store],
  )

  useEffect(() => {
    if (!isPageDragActive) {
      store.actions.setDragging(false)
    }
  }, [isPageDragActive, store])

  const registerPart = useCallback((part: FileUploadPartName) => {
    setPartCounts((counts) => ({ ...counts, [part]: counts[part] + 1 }))
    return () => {
      setPartCounts((counts) => ({ ...counts, [part]: counts[part] - 1 }))
    }
  }, [])
  const isPartRegistered = (part: FileUploadPartName) => partCounts[part] > 0

  // Form mode: keep the native input's files equal to the list (through DataTransfer), so a plain
  // <form> posts them, dropped files included. With `upload` the files go through it instead.
  const syncNativeInput = useCallback(() => {
    const input = inputRef.current
    if (input === null || optionsRef.current.upload !== undefined) {
      return
    }
    const files = store.getState().items.map((item) => item.file)
    if (hasSameFiles(input, files)) {
      return
    }
    if (files.length === 0) {
      input.value = ''
      return
    }
    try {
      const transfer = new DataTransfer()
      for (const file of files) {
        transfer.items.add(file)
      }
      input.files = transfer.files
    } catch {
      warnOnce(
        'file-upload-datatransfer',
        'This browser could not set the files of the native <input type="file"> (DataTransfer), so a plain <form> will post only the files chosen in the dialog, not dropped ones. Use `upload` to send the files yourself.',
      )
    }
  }, [store])

  // The input part's ref. Stable, so React doesn't detach and attach it on every render.
  const setInputElement = useCallback<RefCallback<HTMLInputElement>>(
    (element) => {
      if (element === null) {
        return undefined
      }
      inputElements.current.add(element)
      inputRef.current = element
      // Some browsers clear the input when the dialog is cancelled: put the list's files back.
      element.addEventListener('cancel', syncNativeInput)
      return () => {
        element.removeEventListener('cancel', syncNativeInput)
        inputElements.current.delete(element)
        inputRef.current = [...inputElements.current].at(-1) ?? null
      }
    },
    [syncNativeInput],
  )
  const setTriggerElement = useCallback<RefCallback<HTMLButtonElement>>((element) => {
    triggerRef.current = element
  }, [])
  useLayoutEffect(() => {
    syncNativeInput()
  })

  // A form reset empties the native input without an event: the list follows it.
  useEffect(() => {
    const form = inputRef.current?.form
    if (form === null || form === undefined) {
      return undefined
    }
    let timer: ReturnType<typeof setTimeout> | undefined
    const clearAfterReset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        store.actions.reset()
      }, 0)
    }
    form.addEventListener('reset', clearAfterReset)
    return () => {
      clearTimeout(timer)
      form.removeEventListener('reset', clearAfterReset)
    }
  }, [store, partCounts.input])

  // Focus never falls to <body> (2.4.3): when the focused element of an item goes away (Remove,
  // Cancel or Retry pressed, or an upload ended in the background), focus goes to the same item,
  // or when the item is gone to the next, else the previous, else the Trigger. Never to another
  // button: a held Enter would then act on a file the user never chose. When focus is elsewhere,
  // nothing moves (3.2.1).
  useLayoutEffect(() => {
    const ids = items.map((item) => item.id)
    const before = previousItemIds.current
    previousItemIds.current = ids
    const focusedId = focusedItemId.current
    const doc = env?.document
    if (focusedId === null || doc === undefined) {
      return
    }
    const active = doc.activeElement
    if (active !== null && active !== doc.body && active !== doc.documentElement) {
      return
    }
    let targetId: string | undefined
    if (ids.includes(focusedId)) {
      targetId = focusedId
    } else {
      const position = before.indexOf(focusedId)
      if (position !== -1) {
        targetId =
          before.slice(position + 1).find((id) => ids.includes(id)) ??
          before
            .slice(0, position)
            .reverse()
            .find((id) => ids.includes(id))
      }
    }
    const target =
      (targetId === undefined ? undefined : itemElements.current.get(targetId)) ??
      triggerRef.current
    target?.focus()
  })

  const findItemIdAt = (target: EventTarget): string | null => {
    if (!(target instanceof Node)) {
      return null
    }
    for (const [id, element] of itemElements.current) {
      if (element.contains(target)) {
        return id
      }
    }
    return null
  }

  const add: UseFileUploadResult<Result>['add'] = (files, source = 'program') => {
    const selected = Array.from(files)
    setSelection(selected)
    const result = store.actions.add(selected)
    if (selected.length === 0) {
      return result
    }
    if (result.rejected.length > 0) {
      optionsRef.current.onFilesReject?.(result.rejected)
    }
    const { accepted, rejected } = result
    const addedNames = displayNames(store.getState().items, messages)
    const sentences: string[] = []
    if (accepted.length === 1 && accepted[0] !== undefined) {
      sentences.push(
        messages.fileAdded({ name: addedNames.get(accepted[0].id) ?? accepted[0].file.name }),
      )
    } else if (accepted.length > 1) {
      sentences.push(messages.filesAdded({ count: accepted.length }))
    }
    if (rejected.length > 0) {
      if (source === 'dialog') {
        // Focus returns to the Trigger, which is described by the rejections: counts only.
        sentences.push(messages.filesRejected({ count: rejected.length }))
      } else {
        sentences.push(messages.rejectedHeading({ count: rejected.length }))
        for (const line of rejectionLines(rejected, selected, messages)) {
          sentences.push(line.text)
        }
      }
    }
    const isNowFull = maxFiles !== undefined && store.getState().items.length >= maxFiles
    if (accepted.length > 0 && isNowFull) {
      sentences.push(messages.summaryFull({ maxFiles }))
    }
    say(sentences.join(' '))
    return result
  }

  const remove = (id: string) => {
    const item = items.find((candidate) => candidate.id === id)
    if (item === undefined) {
      return
    }
    const name = getItemName(item)
    store.actions.remove(id)
    say(messages.fileRemoved({ name }))
  }

  const uploadAll = () => {
    const pending = items.filter((item) => item.status === 'pending').length
    store.actions.uploadAll()
    if (pending > 0) {
      say(messages.uploadsStarted({ count: pending }))
    }
  }

  const openPicker = () => {
    const input = inputRef.current
    if (input === null) {
      warnOnce(
        'file-upload-trigger-without-input',
        'The FileUpload Trigger was activated, but no <input type="file"> is rendered, so nothing opens. Render <FileUpload.Input /> inside <FileUpload.Root>.',
      )
      return
    }
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker()
      } else {
        input.click()
      }
    } catch {
      // showPicker() throws without a user gesture or in a cross-origin frame: click() still works.
      input.click()
    }
  }

  const { buttonProps } = useButton({
    // At the limit the Trigger stays focusable with aria-disabled and does nothing on Enter,
    // Space, a click or a click on the Field label. A disabled Field takes it out of the Tab order.
    disabled: isDisabled || isFull,
    focusableWhenDisabled: !isDisabled,
    onClick: openPicker,
  })

  const triggerId = field?.controlProps.id ?? `${baseId}-trigger`
  /** The Trigger's visible text. The name points at it, not at the button, so no engine has to decide between the button's own text and the Field's `<label for>`. */
  const triggerTextId = `${triggerId}-text`
  const rejectionsId = `${triggerId}-rejections`
  const summaryId = `${triggerId}-summary`
  const hasRejections = state.rejections.length > 0
  const describedBy = joinIds(
    field?.controlProps['aria-describedby'],
    hasRejections && isPartRegistered('rejections') ? rejectionsId : undefined,
    isFull && isPartRegistered('summary') ? summaryId : undefined,
  )
  const isReplacing = !isMultiple && items.length > 0
  const triggerText = isMultiple
    ? messages.chooseFiles
    : isReplacing
      ? messages.replaceFile
      : messages.chooseFile

  const isDroppable = !isDisabled && (hasFinePointer || isPageDragActive)

  const triggerProps: FileUploadTriggerPartProps = {
    ...buttonProps,
    className: 'kv-button kv-file-upload-trigger',
    id: triggerId,
    ...(field === null ? {} : { 'aria-labelledby': `${triggerTextId} ${field.labelId}` }),
    ...(describedBy === undefined ? {} : { 'aria-describedby': describedBy }),
    ...(isInvalid ? { 'aria-invalid': 'true', 'data-invalid': '' } : {}),
    ...(isFull ? { 'data-full': '' } : {}),
    ...(isDisabled ? { 'data-disabled': '' } : {}),
    ref: setTriggerElement,
  }

  const inputProps: FileUploadInputPartProps = {
    type: 'file',
    ...(options.accept === undefined ? {} : { accept: options.accept }),
    multiple: isMultiple,
    ...(isDisabled ? { disabled: true } : {}),
    'aria-hidden': 'true',
    tabIndex: -1,
    style: visuallyHidden,
    ref: setInputElement,
    onChange: (event) => {
      const input = event.currentTarget
      const files = Array.from(input.files ?? [])
      // Reset, so choosing the same file again fires a change (the native behaviour replaces it).
      input.value = ''
      if (files.length > 0) {
        add(files, 'dialog')
      }
      syncNativeInput()
    },
  }

  const rootProps: FileUploadRootPartProps = {
    className: 'kv-file-upload',
    ...(isPageDragActive ? { 'data-drag-active': '' } : {}),
    ...(isFull ? { 'data-full': '' } : {}),
    ...(isInvalid ? { 'data-invalid': '' } : {}),
    ...(isDisabled ? { 'data-disabled': '' } : {}),
    onFocus: (event) => {
      focusedItemId.current = findItemIdAt(event.target)
    },
    onBlur: (event) => {
      const next = event.relatedTarget
      if (next !== null) {
        // Focus moves on: a focus event inside updates it, one outside clears it.
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          focusedItemId.current = null
        }
        return
      }
      // Nothing takes focus: either the element was removed (keep, so focus can be moved) or the
      // user clicked away to the page (clear).
      const target = event.target
      const doc = event.currentTarget.ownerDocument
      setTimeout(() => {
        const active = doc.activeElement
        if (
          (active === null || active === doc.body) &&
          target instanceof Node &&
          target.isConnected
        ) {
          focusedItemId.current = null
        }
      }, 0)
    },
  }

  const dropZoneProps: FileUploadDropZonePartProps = {
    className: 'kv-file-upload-drop-zone',
    ...(isDroppable ? { 'data-droppable': '' } : {}),
    ...(state.isDragging && !isDisabled ? { 'data-dragging': '' } : {}),
    ...(isInvalid ? { 'data-invalid': '' } : {}),
    ...(isDisabled ? { 'data-disabled': '' } : {}),
    onDragEnter: (event) => {
      acceptDrag(event)
    },
    onDragOver: (event) => {
      acceptDrag(event)
    },
    onDragLeave: (event) => {
      const next = event.relatedTarget
      if (next instanceof Node && event.currentTarget.contains(next)) {
        return
      }
      store.actions.setDragging(false)
    },
    onDrop: (event) => {
      if (!dragCarriesFiles(event.dataTransfer)) {
        return
      }
      // Always, so a drop on a disabled zone doesn't open the file and leave the page.
      event.preventDefault()
      store.actions.setDragging(false)
      if (isDisabled) {
        return
      }
      add(readDroppedFiles(event.dataTransfer), 'drop')
    },
  }

  /** A drag with files over the zone: allow the drop, and show the zone's dragging state. */
  function acceptDrag(event: DragEvent<HTMLElement>) {
    if (!dragCarriesFiles(event.dataTransfer)) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = isDisabled ? 'none' : 'copy'
    if (!isDisabled) {
      store.actions.setDragging(true)
    }
  }

  const sharedItemRef = (id: string): RefCallback<HTMLLIElement> => {
    let callback = itemRefs.current.get(id)
    if (callback === undefined) {
      callback = (element) => {
        if (element === null) {
          return undefined
        }
        itemElements.current.set(id, element)
        return () => {
          itemElements.current.delete(id)
          itemRefs.current.delete(id)
        }
      }
      itemRefs.current.set(id, callback)
    }
    return callback
  }

  const statusId = (item: FileUploadEntry<Result>) => `${baseId}-item-${item.id}-status`
  const errorId = (item: FileUploadEntry<Result>) => `${baseId}-item-${item.id}-error`

  const limitsText = [
    maxFiles === undefined ? undefined : messages.limitsMaxFiles({ count: maxFiles }),
    options.accept === undefined || acceptEntries(options.accept).length === 0
      ? undefined
      : messages.limitsTypes({
          allowed: acceptLabels(acceptEntries(options.accept)),
          multiple: isMultiple,
        }),
    options.maxFileSize === undefined
      ? undefined
      : messages.limitsMaxSize({ limit: options.maxFileSize, multiple: isMultiple }),
  ]
    .filter((sentence): sentence is string => sentence !== undefined)
    .join(' ')

  const summaryText = !isMultiple
    ? ''
    : isFull && maxFiles !== undefined
      ? messages.summaryFull({ maxFiles })
      : maxFiles === undefined
        ? messages.summary({ count: items.length })
        : messages.summaryOfMax({ count: items.length, maxFiles })

  // Development: a limit that nobody tells the user about (3.3.2).
  const hasLimitProps =
    options.maxFiles !== undefined ||
    options.maxFileSize !== undefined ||
    options.accept !== undefined
  const hasLimits = partCounts.limits > 0 || field?.controlProps['aria-describedby'] !== undefined
  const limitsWarning = useRef({ hasLimitProps, hasLimits })
  useLayoutEffect(() => {
    limitsWarning.current = { hasLimitProps, hasLimits }
  })
  useEffect(() => {
    const timer = setTimeout(() => {
      if (limitsWarning.current.hasLimitProps && !limitsWarning.current.hasLimits) {
        warnOnce(
          'file-upload-limits-unsaid',
          'A FileUpload has `accept`, `maxFiles` or `maxFileSize`, but no <FileUpload.Limits /> and no hint, so users aren’t told the limits before they choose files (WCAG 3.3.2). Render <FileUpload.Limits /> or say them in a <Field.Hint> in the Field.',
        )
      }
    }, 0)
    return () => {
      clearTimeout(timer)
    }
  }, [])
  useEffect(() => {
    if (field === null) {
      warnOnce(
        'file-upload-outside-field',
        'A FileUpload is outside a Field.Root, so its Trigger has no label that says what to attach, and no description. Put it in <Field.Root> with a <Field.Label> (WCAG 1.3.1, 3.3.2).',
      )
    }
  }, [field])

  const named = (
    makeMessage: (values: { name: string }) => string,
    item: FileUploadEntry<Result>,
  ) => makeMessage({ name: getItemName(item) })

  return {
    rootProps,
    dropZoneProps,
    triggerProps,
    inputProps,
    rejectionsProps: { className: 'kv-file-upload-rejections', id: rejectionsId },
    summaryProps: { className: 'kv-file-upload-summary', id: summaryId },
    getItemProps: (item) => ({
      className: 'kv-file-upload-item',
      tabIndex: -1,
      'data-status': item.status,
      ref: sharedItemRef(item.id),
    }),
    getProgressProps: (item) => ({
      className: 'kv-file-upload-progress',
      max: 100,
      ...(item.progress === undefined ? {} : { value: item.progress }),
      'aria-label': named(messages.uploadingFile, item),
    }),
    getStatusProps: (item) => ({
      className: 'kv-file-upload-status',
      id: statusId(item),
      'data-status': item.status,
    }),
    getItemErrorProps: (item) => ({ className: 'kv-file-upload-item-error', id: errorId(item) }),
    getRemoveButtonProps: (item) => ({
      className: 'kv-button kv-file-upload-remove',
      type: 'button',
      'aria-label': named(messages.removeFile, item),
      onClick: () => {
        remove(item.id)
      },
    }),
    getCancelButtonProps: (item) => ({
      className: 'kv-button kv-file-upload-cancel',
      type: 'button',
      'aria-label': named(messages.cancelFile, item),
      onClick: () => {
        store.actions.cancel(item.id)
      },
    }),
    getRetryButtonProps: (item) => ({
      className: 'kv-button kv-file-upload-retry',
      type: 'button',
      'aria-label': named(messages.retryFile, item),
      onClick: () => {
        store.actions.retry(item.id)
      },
    }),
    items,
    rejections: state.rejections,
    rejectionLines: rejectionLines(state.rejections, selection, messages),
    triggerText,
    triggerTextId,
    limitsText,
    summaryText,
    dropHintText: state.isDragging
      ? messages.dropHintActive({ multiple: isMultiple })
      : messages.dropHint({ multiple: isMultiple }),
    getItemName,
    getItemSize: (item) => formatFileSize(format, item.file.size),
    getItemType: (item) => fileTypeLabel(item.file) ?? messages.typeUnknown,
    getItemStatusText: (item) => statusText(item, hasUpload, messages),
    getItemErrorText: (item) => itemErrorText(item, getItemName(item), messages),
    getItemActions: (item) => ({
      cancel: item.status === 'uploading',
      retry:
        item.status === 'cancelled' ||
        (item.status === 'failed' && item.error?.retryable !== false),
      remove: item.status !== 'uploading',
    }),
    messages,
    labelId: field?.labelId,
    isMultiple,
    isDisabled,
    isInvalid,
    isFull,
    isDragging: state.isDragging,
    isDragActive: isPageDragActive,
    isDroppable,
    add,
    remove,
    cancel: (id) => {
      store.actions.cancel(id)
    },
    retry: (id) => {
      store.actions.retry(id)
    },
    uploadAll,
    reset: () => {
      store.actions.reset()
    },
    registerPart,
    isPartRegistered,
  }
}
