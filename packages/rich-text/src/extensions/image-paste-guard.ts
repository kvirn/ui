import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { isAllowedImageSource } from './image-sources.ts'
import type { ImageSourceOptions } from './image-sources.ts'

/** Why an image was left out: a file or `data:` image can't be pasted, an address isn't allowed. */
export type RefusedImageReason = 'file' | 'source'

export interface ImagePasteGuardOptions extends ImageSourceOptions {}

/**
 * What the editor's owner (the `Root`) hooks into. Set on `editor.storage.imagePasteGuard` after
 * the editor is created, so the extension list stays plain data.
 */
export interface ImagePasteGuardStorage {
  /** An image in a paste or a drop was refused. Called once per paste or drop. */
  onRefused: ((reason: RefusedImageReason) => void) | undefined
}

declare module '@tiptap/core' {
  interface Storage {
    imagePasteGuard: ImagePasteGuardStorage
  }
}

function getRefusedReason(
  data: DataTransfer | null,
  options: ImageSourceOptions,
): RefusedImageReason | undefined {
  if (data === null) {
    return undefined
  }
  const html = data.getData('text/html')
  if (html !== '') {
    const sources = Array.from(
      new DOMParser().parseFromString(html, 'text/html').querySelectorAll('img[src]'),
      (element) => element.getAttribute('src'),
    )
    if (sources.length > 0) {
      // The file in the same clipboard is the same picture: the markup decides.
      const refused = sources.filter((source) => !isAllowedImageSource(source, options))
      if (refused.length === 0) {
        return undefined
      }
      return refused.some((source) => source?.trim().toLowerCase().startsWith('data:'))
        ? 'file'
        : 'source'
    }
  }
  return Array.from(data.files).some((file) => file.type.startsWith('image/')) ? 'file' : undefined
}

/**
 * Says so when a pasted or dropped image is refused (WCAG 3.3.1): the schema leaves it out of the
 * text, and nothing else would tell the writer. It reads the clipboard first, so it sees what the
 * Image node's `parseHTML` is about to drop, and it never blocks the text that came with it.
 */
export const ImagePasteGuard = Extension.create<ImagePasteGuardOptions, ImagePasteGuardStorage>({
  name: 'imagePasteGuard',
  priority: 1000,

  addOptions() {
    return {}
  },

  addStorage() {
    return { onRefused: undefined }
  },

  addProseMirrorPlugins() {
    const storage = this.storage
    const options = this.options
    const check = (data: DataTransfer | null, event: Event) => {
      const reason = getRefusedReason(data, options)
      if (reason === undefined) {
        return false
      }
      storage.onRefused?.(reason)
      // A file alone has nothing to insert: the browser must not navigate to it or insert it.
      const hasText =
        data !== null && (data.getData('text/html') !== '' || data.getData('text/plain') !== '')
      if (!hasText) {
        event.preventDefault()
        return true
      }
      return false
    }
    return [
      new Plugin({
        key: new PluginKey('imagePasteGuard'),
        props: {
          handleDOMEvents: {
            // Nothing is pasted or dropped into a text that can't be edited: no message either.
            paste: (view, event) => view.editable && check(event.clipboardData, event),
            drop: (view, event) => view.editable && check(event.dataTransfer, event),
          },
        },
      }),
    ]
  },
})
