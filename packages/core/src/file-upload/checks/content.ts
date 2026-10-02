import type { FileRejection } from '../file-upload-types.ts'

/** What tells two files apart without reading them: the browser gives no content hash. */
export interface FileIdentity {
  readonly name: string
  readonly size: number
  readonly lastModified: number
}

/** A directory entry. The adapter sets the flag, because a `File` can't say it is a folder. */
export function checkFolder(file: {
  readonly isDirectory?: boolean | undefined
}): FileRejection | undefined {
  return file.isDirectory === true ? { kind: 'folder' } : undefined
}

export function checkEmpty(file: { readonly size: number }): FileRejection | undefined {
  return file.size === 0 ? { kind: 'empty' } : undefined
}

/** The same name, size and last-modified time as a file already in `existing`. */
export function checkDuplicate(
  file: FileIdentity,
  existing: readonly FileIdentity[],
): FileRejection | undefined {
  return existing.some(
    (other) =>
      other.name === file.name &&
      other.size === file.size &&
      other.lastModified === file.lastModified,
  )
    ? { kind: 'duplicate' }
    : undefined
}
