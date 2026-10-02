import type { FileRejection, FileUploadInput, FileUploadOptions } from '../file-upload-types.ts'
import { checkAccept } from './accept.ts'
import { checkDuplicate, checkEmpty, checkFolder } from './content.ts'
import type { FileIdentity } from './content.ts'
import { checkCustom, checkMaxFileSize, checkMaxFiles, checkMinFileSize } from './limits.ts'

/**
 * Runs every check on one file and returns the first reason, or `undefined` when it passes. The
 * order is the order the user can act on: the file itself (folder, type, empty, size, duplicate,
 * `validate`) before the list's room, so a wrong file is never told "too many".
 *
 * `currentCount` is how many files the list holds, counting the ones accepted earlier in the same
 * selection. `existing` are the files a duplicate is compared with, the same ones plus the
 * list's. In single-file mode (`multiple: false`) the room is 1.
 */
export function checkFile(
  file: FileUploadInput,
  options: FileUploadOptions<unknown>,
  currentCount: number,
  existing: readonly FileIdentity[] = [],
): FileRejection | undefined {
  const maxFiles = options.multiple === false ? 1 : options.maxFiles
  return (
    checkFolder(file) ??
    checkAccept(file, options.accept) ??
    checkEmpty(file) ??
    checkMaxFileSize(file, options.maxFileSize) ??
    checkMinFileSize(file, options.minFileSize) ??
    (options.allowDuplicates === true ? undefined : checkDuplicate(file, existing)) ??
    checkCustom(file, options.validate) ??
    checkMaxFiles(currentCount, maxFiles)
  )
}
