import type { FileUploadError } from './file-upload-types.ts'

/**
 * Turns what `upload` rejected with into the item's error. `retryable` is `false` only when the
 * thrown object says `retryable: false`. `message` is read only from an object that opted in to
 * the `FileUploadFailure` shape: a plain object, or an `Error` that sets `retryable`. A bare
 * `Error('Failed to fetch')` is a technical message, never text for the user.
 */
export function toUploadError(cause: unknown): FileUploadError {
  if (typeof cause !== 'object' || cause === null) {
    return { kind: 'uploadFailed', cause, retryable: true, message: undefined }
  }
  const { retryable, message } = cause as { retryable?: unknown; message?: unknown }
  const optedIn = !(cause instanceof Error) || typeof retryable === 'boolean'
  return {
    kind: 'uploadFailed',
    cause,
    retryable: retryable !== false,
    message: optedIn && typeof message === 'string' && message !== '' ? message : undefined,
  }
}
