import type { Env, FileUploadInput } from '@kvirn-ui/core'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

// Internal. Drag-and-drop helpers for FileUpload (design spec D2 and §3). Drag
// and drop is only ever an extra: the Trigger is the keyboard and single-pointer path (2.5.7).

const anyFinePointerQuery = '(any-pointer: fine)'

/** `true` when the drag carries files. Dragging text or a link carries other types only. */
export function dragCarriesFiles(dataTransfer: DataTransfer | null): boolean {
  return dataTransfer !== null && Array.from(dataTransfer.types).includes('Files')
}

function withDirectoryFlag(file: File, isDirectory: boolean): FileUploadInput {
  if (isDirectory) {
    Object.defineProperty(file, 'isDirectory', { value: true })
  }
  return file
}

/**
 * The files of a drop, in the order given. A dropped folder comes through as a `File` with no
 * content, so `webkitGetAsEntry()` is asked and the file gets `isDirectory` for the core to
 * reject as `folder`. Read synchronously: `dataTransfer.items` is empty once the event is over.
 */
export function readDroppedFiles(dataTransfer: DataTransfer): FileUploadInput[] {
  const items = Array.from(dataTransfer.items)
  if (items.length === 0) {
    return Array.from(dataTransfer.files)
  }
  const files: FileUploadInput[] = []
  for (const item of items) {
    if (item.kind !== 'file') {
      continue
    }
    const file = item.getAsFile()
    if (file === null) {
      continue
    }
    const entry = typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null
    files.push(withDirectoryFlag(file, entry?.isDirectory === true))
  }
  return files
}

/** Duck-typed, so it works for elements of another window (an iframe) too. */
function isNativeFileInput(target: EventTarget | null): boolean {
  if (target === null || !('matches' in target)) {
    return false
  }
  const element = target as Element
  return typeof element.matches === 'function' && element.matches('input[type="file"]')
}

/**
 * Listens for files dragged over the page, for as long as a FileUpload is mounted, and reports
 * whether one is (`data-drag-active`, so a touch device shows the zone too).
 *
 * It also stops the browser from opening a file that is dropped outside the zone, which would
 * leave the page and lose the form. `preventDefault` is only called when the drag carries files,
 * no one else has handled the event (another drop target) and the target isn't a native file
 * input. Dragging text into a text area, and drops on other drop targets, keep working.
 */
export function listenForPageFileDrags(
  hostWindow: Window,
  onActiveChange: (isActive: boolean) => void,
): () => void {
  const shouldHandle = (event: DragEvent): boolean => {
    if (event.defaultPrevented || !dragCarriesFiles(event.dataTransfer)) {
      return false
    }
    return !isNativeFileInput(event.target)
  }

  const onDragOver = (event: DragEvent) => {
    if (dragCarriesFiles(event.dataTransfer)) {
      onActiveChange(true)
    }
    if (shouldHandle(event)) {
      event.preventDefault()
      if (event.dataTransfer !== null) {
        // Shows "not allowed" instead of "copy": nothing happens here.
        event.dataTransfer.dropEffect = 'none'
      }
    }
  }
  const onDrop = (event: DragEvent) => {
    if (shouldHandle(event)) {
      event.preventDefault()
    }
    onActiveChange(false)
  }
  const onDragLeave = (event: DragEvent) => {
    // Leaving the window: no element receives the pointer.
    if (event.relatedTarget === null) {
      onActiveChange(false)
    }
  }
  const onDragEnd = () => {
    onActiveChange(false)
  }

  hostWindow.addEventListener('dragover', onDragOver)
  hostWindow.addEventListener('drop', onDrop)
  hostWindow.addEventListener('dragleave', onDragLeave)
  hostWindow.addEventListener('dragend', onDragEnd)
  return () => {
    hostWindow.removeEventListener('dragover', onDragOver)
    hostWindow.removeEventListener('drop', onDrop)
    hostWindow.removeEventListener('dragleave', onDragLeave)
    hostWindow.removeEventListener('dragend', onDragEnd)
  }
}

/** `true` while a file is dragged over the page. `false` on the server. */
export function usePageFileDrag(env: Env | undefined): boolean {
  const [isActive, setIsActive] = useState(false)
  useEffect(() => {
    if (env === undefined) {
      return undefined
    }
    const stop = listenForPageFileDrags(env.window, setIsActive)
    return () => {
      stop()
      setIsActive(false)
    }
  }, [env])
  return isActive
}

/**
 * `true` when any attached pointer is precise, such as a mouse or a trackpad. `pointer` reports
 * only the primary one, so a touchscreen laptop would lose the drop hint (design spec D2). `false`
 * on the server and where `matchMedia` is missing.
 */
export function useAnyFinePointer(env: Env | undefined): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (env === undefined || typeof env.window.matchMedia !== 'function') {
        return () => {}
      }
      const query = env.window.matchMedia(anyFinePointerQuery)
      query.addEventListener('change', onChange)
      return () => {
        query.removeEventListener('change', onChange)
      }
    },
    [env],
  )
  const getSnapshot = useCallback(
    () =>
      env !== undefined &&
      typeof env.window.matchMedia === 'function' &&
      env.window.matchMedia(anyFinePointerQuery).matches,
    [env],
  )
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
