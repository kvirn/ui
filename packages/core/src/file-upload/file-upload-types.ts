import type { ComponentStore } from '../store/create-component-store.ts'

/**
 * Why a file was refused. These are data, not text: the React layer turns each into a sentence
 * from i18n, naming the file and what is allowed (WCAG 3.3.1, 3.3.3). A refused file
 * never enters the list (design spec D4).
 */
export type FileRejection =
  /** Not in `accept`. `allowed` lists the accepted entries, trimmed and lower-case (`.pdf`, `image/*`). */
  | { readonly kind: 'type'; readonly allowed: readonly string[] }
  /** Larger than `maxFileSize`. `limit` is in bytes. */
  | { readonly kind: 'tooLarge'; readonly limit: number }
  /** Smaller than `minFileSize`. `limit` is in bytes. */
  | { readonly kind: 'tooSmall'; readonly limit: number }
  /** The list is full: `maxFiles` files are already in it. In single-file mode `maxFiles` is 1. */
  | { readonly kind: 'tooMany'; readonly maxFiles: number }
  /** The file has no content (size 0). */
  | { readonly kind: 'empty' }
  /** A file with the same name, size and last-modified time is already in the list. */
  | { readonly kind: 'duplicate' }
  /** A directory was dropped (the adapter marks it with `isDirectory`). */
  | { readonly kind: 'folder' }
  /** Refused by the consumer's `validate(file)`. `message` is the consumer's own text. */
  | { readonly kind: 'custom'; readonly message: string }

/**
 * Why an item is `failed`: its upload rejected. `cause` is what it threw. `retryable` is `false`
 * only when the consumer said so (a virus, a server-side type check): then there is no Retry and
 * `message` tells the user what to do. `message` is the consumer's own text, already translated.
 */
export interface FileUploadError {
  readonly kind: 'uploadFailed'
  readonly cause: unknown
  readonly retryable: boolean
  readonly message: string | undefined
}

/**
 * What `upload` can reject with to say more than "it failed". Any other rejection is a failure
 * that can be retried, with no message of its own.
 */
export interface FileUploadFailure {
  /** `false` for a permanent failure: the item shows only Remove. Default `true`. */
  readonly retryable?: boolean | undefined
  /** The consumer's text for the user: what went wrong and what to do. Name the file. */
  readonly message?: string | undefined
}

export type FileUploadStatus = 'pending' | 'uploading' | 'complete' | 'failed' | 'cancelled'

/**
 * A file the adapter hands to `add`. A plain `File` works. The adapter sets `isDirectory` on the
 * entry it got from a dropped folder (`webkitGetAsEntry().isDirectory`), which a `File` can't say.
 */
export type FileUploadInput = File & { readonly isDirectory?: boolean | undefined }

/** One accepted file in the list, with its status and progress. */
export interface FileUploadEntry<Result = unknown> {
  /** Unique within one store. Stable for the item's life: use it as the list key. */
  readonly id: string
  readonly file: File
  /** `pending`: waiting for a slot, for `uploadAll()`, or (with no `upload`) for the form. */
  readonly status: FileUploadStatus
  /**
   * Whole percent, `0` to `100`, so assistive tech that reports progress sees at most 100 changes.
   * `undefined` while the size is unknown (indeterminate), and before an upload starts.
   */
  readonly progress: number | undefined
  /** Set for `failed`. */
  readonly error: FileUploadError | undefined
  /** What the upload promise resolved with, for `complete`. */
  readonly result: Result | undefined
  /** An object URL for an image preview, only when `previews` is on. Revoked on remove and reset. */
  readonly previewUrl: string | undefined
}

/** @deprecated Renamed to `FileUploadEntry`, because `FileUploadItem` is also a React component. */
export type FileUploadItem<Result = unknown> = FileUploadEntry<Result>

/** A file that was refused, and why. It is not in the list. */
export interface FileUploadRejection {
  readonly file: File
  readonly reason: FileRejection
}

export interface FileUploadState<Result = unknown> {
  /** Accepted files only. Rejected files never enter the list. */
  readonly items: readonly FileUploadEntry<Result>[]
  /**
   * The files refused by the latest `add`, in the order given. Replaced by the next `add`, and
   * cleared by `remove` and `reset`.
   */
  readonly rejections: readonly FileUploadRejection[]
  /** `true` while files are dragged over the drop zone. Set by the adapter. */
  readonly isDragging: boolean
}

export interface FileUploadContext {
  /** Aborted when the upload is cancelled, or its item is removed or reset. */
  readonly signal: AbortSignal
  /**
   * Reports how far the upload has got, as a fraction `0` to `1`. Out of range values are clamped.
   * The item's `progress` is this rounded to whole percent.
   */
  readonly onProgress: (fraction: number) => void
}

export interface FileUploadOptions<Result = unknown> {
  /**
   * What the file picker suggests, and what dropped files are checked against: a comma-separated
   * list of extensions (`.pdf`), MIME types (`image/png`) and wildcards (`image/*`), in any case.
   * No entries means every file is accepted. Not security: the server must check again.
   */
  accept?: string | undefined
  /** In bytes. A larger file is rejected as `tooLarge`. */
  maxFileSize?: number | undefined
  /** In bytes. A smaller file is rejected as `tooSmall`. */
  minFileSize?: number | undefined
  /**
   * How many files the list holds. Files that don't fit are rejected as `tooMany`, in the order
   * given. Rejected files never count. Ignored in single-file mode, where it is 1.
   */
  maxFiles?: number | undefined
  /**
   * `false` is single-file mode: `add` replaces the current file (cancelling it first) instead of
   * appending, and `maxFiles` is 1. Default `true`.
   */
  multiple?: boolean | undefined
  /** `true` allows a file with the same name, size and last-modified time as one in the list. Default `false`. */
  allowDuplicates?: boolean | undefined
  /** Return a message to reject the file as `custom`, or nothing to accept it. Runs last. */
  validate?: ((file: File) => string | null | undefined | void) | undefined
  /**
   * Sends the file wherever the consumer wants: the library does no network calls. Resolve with
   * a result to store on the item (for example a server id), reject to mark it `failed`. Reject
   * with a `FileUploadFailure` (`retryable`, `message`) to say more. Without it, files stay `pending` for the form to submit.
   */
  upload?: ((file: File, context: FileUploadContext) => Promise<Result>) | undefined
  /** At most this many uploads run at once. Default 3. */
  concurrency?: number | undefined
  /** `false` keeps files `pending` until `uploadAll()`. Default `true`. */
  autoUpload?: boolean | undefined
  /** Give image files a `previewUrl`. Needs an `env`. Default `false`. */
  previews?: boolean | undefined
}

/**
 * What the store needs from the page to make previews. `Env` satisfies it (the real
 * `window.URL`), and a Node test can pass two functions. `undefined` while server
 * rendering: no previews.
 */
export interface FileUploadEnv {
  readonly window: {
    readonly URL: {
      readonly createObjectURL: (object: Blob) => string
      readonly revokeObjectURL: (url: string) => void
    }
  }
}

export interface FileUploadAddResult<Result = unknown> {
  /** The files that passed every check, as new items (as they were when added: read the store for their status now). */
  readonly accepted: readonly FileUploadEntry<Result>[]
  /** The files that failed a check, with the reason. They are not in the list. */
  readonly rejected: readonly FileUploadRejection[]
}

export interface FileUploadActions<Result = unknown> {
  /**
   * Checks each file and adds the ones that pass to the list, then starts uploads when
   * `autoUpload` is on. A second selection appends, except in single-file mode (`multiple: false`),
   * where an accepted file replaces the current one. A file that fails a check is not added: it is
   * in the result and in `state.rejections` (latest add only).
   */
  add: (
    files: Iterable<FileUploadInput> | ArrayLike<FileUploadInput>,
  ) => FileUploadAddResult<Result>
  /**
   * Removes the item. An upload in progress is cancelled first. Revokes its preview URL. Clears
   * `rejections`.
   */
  remove: (id: string) => void
  /** Cancels an upload in progress, or one waiting for a slot. The item becomes `cancelled`. */
  cancel: (id: string) => void
  /**
   * Queues a `failed` item (unless its error says `retryable: false`) or a `cancelled` one again,
   * even with `autoUpload` off.
   */
  retry: (id: string) => void
  /** Queues every `pending` item. For `autoUpload={false}`. */
  uploadAll: () => void
  setDragging: (isDragging: boolean) => void
  /** Cancels every upload, revokes every preview URL, and empties the list and `rejections`. For unmount. */
  reset: () => void
}

export type FileUpload<Result = unknown> = ComponentStore<
  FileUploadState<Result>,
  FileUploadActions<Result>
>
