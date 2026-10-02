import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

// Northern Sámi. Every string here is English until a native speaker provides it, except the
// notification words, which are machine-drafted Sámi (below). Plan 0002, listed under Known
// issues in kvirn-provider.a11y.md.
export const se = {
  // TODO(native-review): Northern Sámi translation of "(opens in a new tab)".
  link: { newTabNotice: '(opens in a new tab)' },
  // TODO(native-review): Northern Sámi translation of "(optional)" and "Error:".
  field: { optional: '(optional)', errorPrefix: 'Error:' },
  // Machine-drafted Northern Sámi (docs/design/notification.md §4.1, ADR-0047): a native speaker
  // must verify these four status words before they are relied on.
  notification: {
    infoPrefix: 'Dieđut:',
    successPrefix: 'Gárvvis:',
    warningPrefix: 'Váruhus:',
    dangerPrefix: 'Boasttuvuohta:',
  },
  // TODO(native-review): machine-drafted Northern Sámi for the combobox messages (Plan 0022). A
  // native speaker must verify the plural forms, which `se` gives as one, two and other.
  combobox: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 boađus', other: `${format.number(count)} boađusa` }),
    noResults: 'Ii leat boađusat',
    loading: 'Viežžá boađusiid',
    removeValue: ({ label }) => `Váldde eret ${label}`,
    clear: 'Sihko',
    showOptions: 'Čájet molssaeavttuid',
  },
  // TODO(native-review): Northern Sámi translation of the two mask messages (Plan 0014).
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Only digits can be entered here.',
        letters: 'Only letters can be entered here.',
        lettersAndDigits: 'Only letters and digits can be entered here.',
        other: 'That character can’t be entered here.',
      })[allowed],
    maximumLength: ({ length }) => `You’ve entered all ${length} characters.`,
  },
  // English placeholders for the whole `fileUpload` namespace (Plan 0021). A native speaker must
  // translate every entry before `beta`. `se` has the plural forms one, two and other, so the
  // plural entries already carry `two`.
  fileUpload: {
    // TODO(native-review)
    chooseFiles: 'Choose files',
    // TODO(native-review)
    chooseFile: 'Choose file',
    // TODO(native-review)
    replaceFile: 'Replace file',
    // TODO(native-review)
    dropHint: ({ multiple }) => (multiple ? 'or drop files here' : 'or drop a file here'),
    // TODO(native-review)
    dropHintActive: ({ multiple }) =>
      multiple ? 'Drop the files to add them' : 'Drop the file to add it',
    // TODO(native-review)
    limitsMaxFiles: ({ count }, format) =>
      format.plural(count, {
        one: 'You can add 1 file.',
        two: 'You can add up to 2 files.',
        other: `You can add up to ${format.number(count)} files.`,
      }),
    // TODO(native-review)
    limitsTypes: ({ allowed, multiple }, format) => {
      const types = format.list(allowed, { type: 'disjunction' })
      return multiple ? `The files must be ${types}.` : `The file must be ${types}.`
    },
    // TODO(native-review)
    limitsMaxSize: ({ limit, multiple }, format) =>
      multiple
        ? `Each file can be up to ${formatFileSize(format, limit)}.`
        : `The file can be up to ${formatFileSize(format, limit)}.`,
    // TODO(native-review)
    summary: ({ count }, format) =>
      format.plural(count, {
        one: '1 file added',
        two: '2 files added',
        other: `${format.number(count)} files added`,
      }),
    // TODO(native-review)
    summaryOfMax: ({ count, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${format.number(count)} of 1 file added`,
        two: `${format.number(count)} of 2 files added`,
        other: `${format.number(count)} of ${format.number(maxFiles)} files added`,
      }),
    // TODO(native-review)
    summaryFull: ({ maxFiles }, format) =>
      format.plural(maxFiles, {
        one: '1 of 1 file added. Remove the file if you want to add a different one.',
        two: '2 of 2 files added. Remove a file if you want to add a different one.',
        other: `${format.number(maxFiles)} of ${format.number(maxFiles)} files added. Remove a file if you want to add a different one.`,
      }),
    // TODO(native-review)
    rejectedHeading: ({ count }, format) =>
      format.plural(count, {
        one: '1 file couldn’t be added:',
        two: '2 files couldn’t be added:',
        other: `${format.number(count)} files couldn’t be added:`,
      }),
    // TODO(native-review)
    statusReady: 'Added. It will be sent with the form',
    // TODO(native-review)
    statusQueued: 'Waiting to upload',
    // TODO(native-review)
    statusUploading: 'Uploading',
    // TODO(native-review)
    statusUploadingPercent: ({ percent }, format) =>
      `Uploading, ${format.number(percent / 100, { style: 'percent' })}`,
    // TODO(native-review)
    statusComplete: 'Uploaded',
    // TODO(native-review)
    statusFailed: 'Upload failed',
    // TODO(native-review)
    statusCancelled: 'Upload cancelled',
    // TODO(native-review)
    typeUnknown: 'Unknown type',
    // TODO(native-review)
    remove: 'Remove',
    // TODO(native-review)
    cancel: 'Cancel',
    // TODO(native-review)
    retry: 'Try again',
    // TODO(native-review)
    duplicateName: ({ name, number }) => `${name} (${number})`,
    // TODO(native-review)
    errorType: ({ name, allowed }, format) =>
      `${name} isn’t a type of file we can accept. Choose a file in ${format.list(allowed, { type: 'disjunction' })} format.`,
    // TODO(native-review)
    errorTooLarge: ({ name, size, limit }, format) =>
      `${name} is ${formatFileSize(format, size)}. Choose a file that is ${formatFileSize(format, limit)} or smaller. To make a photo or scan smaller, save or scan it again at a lower resolution.`,
    // TODO(native-review)
    errorTooSmall: ({ name, size, limit }, format) =>
      `${name} is ${formatFileSize(format, size)}. Choose a file that is at least ${formatFileSize(format, limit)}.`,
    // TODO(native-review)
    errorEmpty: ({ name }) => `${name} is empty. Check that you chose the right file.`,
    // TODO(native-review)
    errorTooMany: ({ name, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${name} wasn’t added. You can add only 1 file.`,
        two: `${name} wasn’t added. You can add up to 2 files. Remove a file if you want to add a different one.`,
        other: `${name} wasn’t added. You can add up to ${format.number(maxFiles)} files. Remove a file if you want to add a different one.`,
      }),
    // TODO(native-review)
    errorDuplicate: ({ name }) => `${name} is already in the list.`,
    // TODO(native-review)
    errorFolder: ({ name }) => `${name} is a folder. Open the folder and choose the files in it.`,
    // TODO(native-review)
    uploadFailedMessage: ({ name }) =>
      `We couldn’t upload ${name}. If it keeps failing, contact us.`,
    // TODO(native-review)
    rejectedFilePosition: ({ position, total, message }) =>
      `File ${position} of ${total}, ${message}`,
    // TODO(native-review)
    removeFile: ({ name }) => `Remove ${name}`,
    // TODO(native-review)
    cancelFile: ({ name }) => `Cancel upload of ${name}`,
    // TODO(native-review)
    retryFile: ({ name }) => `Try again with ${name}`,
    // TODO(native-review)
    uploadingFile: ({ name }) => `Uploading ${name}`,
    // TODO(native-review)
    fileAdded: ({ name }) => `${name} added.`,
    // TODO(native-review)
    filesAdded: ({ count }, format) =>
      format.plural(count, {
        one: '1 file added.',
        two: '2 files added.',
        other: `${format.number(count)} files added.`,
      }),
    // TODO(native-review)
    filesRejected: ({ count }, format) =>
      format.plural(count, {
        one: '1 file couldn’t be added.',
        two: '2 files couldn’t be added.',
        other: `${format.number(count)} files couldn’t be added.`,
      }),
    // TODO(native-review)
    uploadsStarted: ({ count }, format) =>
      format.plural(count, {
        one: 'Uploading 1 file.',
        two: 'Uploading 2 files.',
        other: `Uploading ${format.number(count)} files.`,
      }),
    // TODO(native-review)
    uploadComplete: ({ name }) => `${name} uploaded.`,
    // TODO(native-review)
    uploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: '1 file uploaded.',
        two: '2 files uploaded.',
        other: `${format.number(count)} files uploaded.`,
      }),
    // TODO(native-review)
    allUploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: 'The file has been uploaded.',
        two: 'Both files have been uploaded.',
        other: `All ${format.number(count)} files uploaded.`,
      }),
    // TODO(native-review)
    uploadFailed: ({ name }) => `${name} couldn’t be uploaded.`,
    // TODO(native-review)
    uploadsFailed: ({ count }, format) =>
      format.plural(count, {
        one: '1 file couldn’t be uploaded.',
        two: '2 files couldn’t be uploaded.',
        other: `${format.number(count)} files couldn’t be uploaded.`,
      }),
    // TODO(native-review)
    fileRemoved: ({ name }) => `${name} removed.`,
    // TODO(native-review)
    announcementForField: ({ label, message }) => `${label}: ${message}`,
  },
} satisfies KvirnMessages
