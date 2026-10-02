import type { FileRejection } from '../file-upload-types.ts'
import type { FileLike } from './accept.ts'

const isLimit = (limit: number | undefined): limit is number =>
  limit !== undefined && !Number.isNaN(limit)

export function checkMaxFileSize(
  file: FileLike,
  limit: number | undefined,
): FileRejection | undefined {
  return isLimit(limit) && file.size > limit ? { kind: 'tooLarge', limit } : undefined
}

export function checkMinFileSize(
  file: FileLike,
  limit: number | undefined,
): FileRejection | undefined {
  return isLimit(limit) && file.size < limit ? { kind: 'tooSmall', limit } : undefined
}

/**
 * Whether one more file fits. `currentCount` is how many files the list
 * already holds, including the ones accepted earlier in the same selection.
 */
export function checkMaxFiles(
  currentCount: number,
  maxFiles: number | undefined,
): FileRejection | undefined {
  return isLimit(maxFiles) && currentCount >= maxFiles ? { kind: 'tooMany', maxFiles } : undefined
}

/** Runs the consumer's `validate`. A non-empty string is the reason. */
export function checkCustom(
  file: File,
  validate: ((file: File) => string | null | undefined | void) | undefined,
): FileRejection | undefined {
  const message = validate?.(file)
  return typeof message === 'string' && message !== '' ? { kind: 'custom', message } : undefined
}
