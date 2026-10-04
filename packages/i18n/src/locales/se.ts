import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

// se: English placeholders, except the combobox and notification messages.
export const se = {
  link: { newTabNotice: '(opens in a new tab)' },
  field: { optional: '(optional)', errorPrefix: 'Error:' },
  dateInput: { day: 'Day', month: 'Month', year: 'Year' },
  notification: {
    infoPrefix: 'Dieđut:',
    successPrefix: 'Gárvvis:',
    warningPrefix: 'Váruhus:',
    dangerPrefix: 'Boasttuvuohta:',
  },
  combobox: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 boađus', other: `${format.number(count)} boađusa` }),
    noResults: 'Ii leat boađusat',
    loading: 'Viežžá boađusiid',
    removeValue: ({ label }) => `Váldde eret ${label}`,
    clear: 'Sihko',
    showOptions: 'Čájet molssaeavttuid',
  },
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
  fileUpload: {
    chooseFiles: 'Choose files',
    chooseFile: 'Choose file',
    replaceFile: 'Replace file',
    dropHint: ({ multiple }) => (multiple ? 'or drop files here' : 'or drop a file here'),
    dropHintActive: ({ multiple }) =>
      multiple ? 'Drop the files to add them' : 'Drop the file to add it',
    limitsMaxFiles: ({ count }, format) =>
      format.plural(count, {
        one: 'You can add 1 file.',
        two: 'You can add up to 2 files.',
        other: `You can add up to ${format.number(count)} files.`,
      }),
    limitsTypes: ({ allowed, multiple }, format) => {
      const types = format.list(allowed, { type: 'disjunction' })
      return multiple ? `The files must be ${types}.` : `The file must be ${types}.`
    },
    limitsMaxSize: ({ limit, multiple }, format) =>
      multiple
        ? `Each file can be up to ${formatFileSize(format, limit)}.`
        : `The file can be up to ${formatFileSize(format, limit)}.`,
    summary: ({ count }, format) =>
      format.plural(count, {
        one: '1 file added',
        two: '2 files added',
        other: `${format.number(count)} files added`,
      }),
    summaryOfMax: ({ count, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${format.number(count)} of 1 file added`,
        two: `${format.number(count)} of 2 files added`,
        other: `${format.number(count)} of ${format.number(maxFiles)} files added`,
      }),
    summaryFull: ({ maxFiles }, format) =>
      format.plural(maxFiles, {
        one: '1 of 1 file added. Remove the file if you want to add a different one.',
        two: '2 of 2 files added. Remove a file if you want to add a different one.',
        other: `${format.number(maxFiles)} of ${format.number(maxFiles)} files added. Remove a file if you want to add a different one.`,
      }),
    rejectedHeading: ({ count }, format) =>
      format.plural(count, {
        one: '1 file couldn’t be added:',
        two: '2 files couldn’t be added:',
        other: `${format.number(count)} files couldn’t be added:`,
      }),
    statusReady: 'Added. It will be sent with the form',
    statusQueued: 'Waiting to upload',
    statusUploading: 'Uploading',
    statusUploadingPercent: ({ percent }, format) =>
      `Uploading, ${format.number(percent / 100, { style: 'percent' })}`,
    statusComplete: 'Uploaded',
    statusFailed: 'Upload failed',
    statusCancelled: 'Upload cancelled',
    typeUnknown: 'Unknown type',
    remove: 'Remove',
    cancel: 'Cancel',
    retry: 'Try again',
    duplicateName: ({ name, number }) => `${name} (${number})`,
    errorType: ({ name, allowed }, format) =>
      `${name} isn’t a type of file we can accept. Choose a file in ${format.list(allowed, { type: 'disjunction' })} format.`,
    errorTooLarge: ({ name, size, limit }, format) =>
      `${name} is ${formatFileSize(format, size)}. Choose a file that is ${formatFileSize(format, limit)} or smaller. To make a photo or scan smaller, save or scan it again at a lower resolution.`,
    errorTooSmall: ({ name, size, limit }, format) =>
      `${name} is ${formatFileSize(format, size)}. Choose a file that is at least ${formatFileSize(format, limit)}.`,
    errorEmpty: ({ name }) => `${name} is empty. Check that you chose the right file.`,
    errorTooMany: ({ name, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${name} wasn’t added. You can add only 1 file.`,
        two: `${name} wasn’t added. You can add up to 2 files. Remove a file if you want to add a different one.`,
        other: `${name} wasn’t added. You can add up to ${format.number(maxFiles)} files. Remove a file if you want to add a different one.`,
      }),
    errorDuplicate: ({ name }) => `${name} is already in the list.`,
    errorFolder: ({ name }) => `${name} is a folder. Open the folder and choose the files in it.`,
    uploadFailedMessage: ({ name }) =>
      `We couldn’t upload ${name}. If it keeps failing, contact us.`,
    rejectedFilePosition: ({ position, total, message }) =>
      `File ${position} of ${total}, ${message}`,
    removeFile: ({ name }) => `Remove ${name}`,
    cancelFile: ({ name }) => `Cancel upload of ${name}`,
    retryFile: ({ name }) => `Try again with ${name}`,
    uploadingFile: ({ name }) => `Uploading ${name}`,
    fileAdded: ({ name }) => `${name} added.`,
    filesAdded: ({ count }, format) =>
      format.plural(count, {
        one: '1 file added.',
        two: '2 files added.',
        other: `${format.number(count)} files added.`,
      }),
    filesRejected: ({ count }, format) =>
      format.plural(count, {
        one: '1 file couldn’t be added.',
        two: '2 files couldn’t be added.',
        other: `${format.number(count)} files couldn’t be added.`,
      }),
    uploadsStarted: ({ count }, format) =>
      format.plural(count, {
        one: 'Uploading 1 file.',
        two: 'Uploading 2 files.',
        other: `Uploading ${format.number(count)} files.`,
      }),
    uploadComplete: ({ name }) => `${name} uploaded.`,
    uploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: '1 file uploaded.',
        two: '2 files uploaded.',
        other: `${format.number(count)} files uploaded.`,
      }),
    allUploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: 'The file has been uploaded.',
        two: 'Both files have been uploaded.',
        other: `All ${format.number(count)} files uploaded.`,
      }),
    uploadFailed: ({ name }) => `${name} couldn’t be uploaded.`,
    uploadsFailed: ({ count }, format) =>
      format.plural(count, {
        one: '1 file couldn’t be uploaded.',
        two: '2 files couldn’t be uploaded.',
        other: `${format.number(count)} files couldn’t be uploaded.`,
      }),
    fileRemoved: ({ name }) => `${name} removed.`,
    announcementForField: ({ label, message }) => `${label}: ${message}`,
  },
  table: {
    sortedAscending: ({ column }) => `Sorted by ${column}, ascending.`,
    sortedDescending: ({ column }) => `Sorted by ${column}, descending.`,
    sortCleared: ({ column }) => `No longer sorted by ${column}.`,
    selectRow: 'Select',
    selectRowNumber: ({ index }, format) => `Select row ${format.number(index)}`,
    selectAllRows: 'Select all rows',
    selectedCount: ({ count }, format) =>
      format.plural(count, {
        one: '1 row selected.',
        two: '2 rows selected.',
        other: `${format.number(count)} rows selected.`,
      }),
    rowCount: ({ count }, format) =>
      format.plural(count, {
        one: '1 row.',
        two: '2 rows.',
        other: `${format.number(count)} rows.`,
      }),
    loading: 'Loading rows.',
    empty: 'No rows to show.',
    rowDetails: 'Details',
  },
} satisfies KvirnMessages
