import type { FileUploadItem, FileUploadRejection, ResolvedMessages } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'

// Internal. The pure helpers behind FileUpload's text: no React, no DOM.

/** Short labels for the MIME types people actually list in `accept`. */
const mimeLabels: Readonly<Record<string, string>> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
  'image/heic': 'HEIC',
  'image/svg+xml': 'SVG',
  'text/plain': 'TXT',
  'text/csv': 'CSV',
}

/**
 * Turns the accepted entries the core reports (`.pdf`, `image/jpeg`, `image/*`) into short labels
 * for a sentence ("PDF", "JPG", "image/*"), without repeating one. A wildcard can't be said in a
 * few letters, so it stays as written: say it your own way with a `messages` override.
 */
export function acceptLabels(entries: readonly string[]): string[] {
  const labels: string[] = []
  for (const entry of entries) {
    const trimmed = entry.trim()
    if (trimmed === '') {
      continue
    }
    const label = trimmed.startsWith('.')
      ? trimmed.slice(1).toUpperCase()
      : (mimeLabels[trimmed.toLowerCase()] ?? trimmed)
    if (!labels.includes(label)) {
      labels.push(label)
    }
  }
  return labels
}

/** The comma-separated entries of an `accept` string, trimmed and without the empty ones. */
export function acceptEntries(accept: string | undefined): string[] {
  return (accept ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry !== '')
}

/** The extension in capitals (`PDF`), or `undefined` when the name has none. Never the MIME type. */
export function fileTypeLabel(file: File): string | undefined {
  const dot = file.name.lastIndexOf('.')
  // A leading dot (`.gitignore`) is a hidden file's name, not an extension.
  if (dot <= 0 || dot === file.name.length - 1) {
    return undefined
  }
  const extension = file.name.slice(dot + 1)
  return /^[\p{L}\p{N}]{1,10}$/u.test(extension) ? extension.toUpperCase() : undefined
}

export function isImageFile(file: File): boolean {
  return file.type.toLowerCase().startsWith('image/')
}

type FileUploadMessages = ResolvedMessages<KvirnMessages['fileUpload']>

/** The names the list shows: the second and later items with one file name get "(2)", "(3)". */
export function displayNames(
  items: readonly FileUploadItem[],
  messages: Pick<FileUploadMessages, 'duplicateName'>,
): ReadonlyMap<string, string> {
  const seen = new Map<string, number>()
  const names = new Map<string, string>()
  for (const item of items) {
    const count = (seen.get(item.file.name) ?? 0) + 1
    seen.set(item.file.name, count)
    names.set(
      item.id,
      count === 1
        ? item.file.name
        : messages.duplicateName({ name: item.file.name, number: count }),
    )
  }
  return names
}

/** One line of Rejections: the text, and the file it is about. */
export interface RejectionLine {
  readonly file: File
  /** The full sentence: which file and what to do. Starts with its place when names repeat. */
  readonly text: string
}

/**
 * One sentence per rejected file, naming it and saying what to do (3.3.1, 3.3.3). When two or
 * more files of the same selection share a name, each line starts with the file's place in the
 * selection ("File 2 of 3, …"), because a screen-reader user has no thumbnail to tell them apart.
 */
export function rejectionLines(
  rejections: readonly FileUploadRejection[],
  selection: readonly File[],
  messages: FileUploadMessages,
): RejectionLine[] {
  return rejections.map(({ file, reason }) => {
    const name = file.name
    let text: string
    switch (reason.kind) {
      case 'type':
        text = messages.errorType({ name, allowed: acceptLabels(reason.allowed) })
        break
      case 'tooLarge':
        text = messages.errorTooLarge({ name, size: file.size, limit: reason.limit })
        break
      case 'tooSmall':
        text = messages.errorTooSmall({ name, size: file.size, limit: reason.limit })
        break
      case 'tooMany':
        text = messages.errorTooMany({ name, maxFiles: reason.maxFiles })
        break
      case 'empty':
        text = messages.errorEmpty({ name })
        break
      case 'duplicate':
        text = messages.errorDuplicate({ name })
        break
      case 'folder':
        text = messages.errorFolder({ name })
        break
      case 'custom':
        text = reason.message
        break
    }
    const position = selection.indexOf(file)
    const sharesName = selection.filter((other) => other.name === name).length > 1
    if (position !== -1 && sharesName) {
      text = messages.rejectedFilePosition({
        position: position + 1,
        total: selection.length,
        message: text,
      })
    }
    return { file, text }
  })
}

/** The status sentence of an item, for its Status part and the buttons' description. */
export function statusText(
  item: FileUploadItem,
  hasUpload: boolean,
  messages: FileUploadMessages,
): string {
  switch (item.status) {
    case 'pending':
      return hasUpload ? messages.statusQueued : messages.statusReady
    case 'uploading':
      return item.progress === undefined
        ? messages.statusUploading
        : messages.statusUploadingPercent({ percent: item.progress })
    case 'complete':
      return messages.statusComplete
    case 'failed':
      return messages.statusFailed
    case 'cancelled':
      return messages.statusCancelled
  }
}

/** The text of a failed item's error: the consumer's own message, else the neutral one. */
export function itemErrorText(
  item: FileUploadItem,
  name: string,
  messages: Pick<FileUploadMessages, 'uploadFailedMessage'>,
): string | undefined {
  if (item.status !== 'failed') {
    return undefined
  }
  return item.error?.message ?? messages.uploadFailedMessage({ name })
}

export type { FileUploadMessages }
