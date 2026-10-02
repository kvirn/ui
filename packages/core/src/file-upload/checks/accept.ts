import type { FileRejection } from '../file-upload-types.ts'

/** The parts of a `File` the checks read, so they run on plain objects too. */
export interface FileLike {
  readonly name: string
  readonly type: string
  readonly size: number
  /** Set by the adapter for a dropped folder. */
  readonly isDirectory?: boolean | undefined
}

/** The entries of an `accept` string: split on commas, trimmed, lower-cased, blanks dropped. */
export function parseAccept(accept: string | undefined): readonly string[] {
  if (accept === undefined) {
    return []
  }
  return accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry !== '')
}

function matchesEntry(entry: string, fileName: string, mimeType: string): boolean {
  if (entry.startsWith('.')) {
    return fileName.endsWith(entry)
  }
  if (entry === '*' || entry === '*/*') {
    return true
  }
  if (entry.endsWith('/*')) {
    return mimeType.startsWith(entry.slice(0, -1))
  }
  return mimeType === entry
}

/**
 * Whether the file matches an entry of `accept`: by extension (`.pdf`), by MIME type
 * (`application/pdf`) or by wildcard (`image/*`), in any case. The MIME type's parameters
 * (`;charset=utf-8`) are ignored. No entries means everything matches.
 */
export function matchesAccept(file: FileLike, entries: readonly string[]): boolean {
  if (entries.length === 0) {
    return true
  }
  const fileName = file.name.toLowerCase()
  const mimeType = (file.type.split(';')[0] ?? '').trim().toLowerCase()
  return entries.some((entry) => matchesEntry(entry, fileName, mimeType))
}

export function checkAccept(file: FileLike, accept: string | undefined): FileRejection | undefined {
  const entries = parseAccept(accept)
  return matchesAccept(file, entries) ? undefined : { kind: 'type', allowed: entries }
}
