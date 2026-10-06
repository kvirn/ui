import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

export const en = {
  link: { newTabNotice: '(opens in a new tab)' },
  field: { optional: '(optional)', errorPrefix: 'Error:' },
  dateInput: {
    day: 'Day',
    month: 'Month',
    year: 'Year',
    autoAdvanceHint: 'Focus moves to the next box when a box is full.',
  },
  alert: {
    infoPrefix: 'Information:',
    successPrefix: 'Success:',
    warningPrefix: 'Warning:',
    dangerPrefix: 'Error:',
    close: 'Close message',
  },
  dialog: { close: 'Close dialog' },
  combobox: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 result', other: `${format.number(count)} results` }),
    noResults: 'No results',
    loading: 'Loading results',
    removeValue: ({ label }) => `Remove ${label}`,
    clear: 'Clear',
    showOptions: 'Show options',
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
    maximumDecimals: 'No more decimals can be entered here.',
  },
  characterCount: {
    limit: ({ limit }, format) => `You can enter up to ${format.number(limit)} characters.`,
    remaining: ({ count }, format) =>
      format.plural(count, {
        one: 'You have 1 character remaining.',
        other: `You have ${format.number(count)} characters remaining.`,
      }),
    over: ({ count }, format) =>
      format.plural(count, {
        one: 'You have 1 character too many.',
        other: `You have ${format.number(count)} characters too many.`,
      }),
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
      format.plural(count, { one: '1 file added', other: `${format.number(count)} files added` }),
    summaryOfMax: ({ count, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${format.number(count)} of 1 file added`,
        other: `${format.number(count)} of ${format.number(maxFiles)} files added`,
      }),
    summaryFull: ({ maxFiles }, format) =>
      format.plural(maxFiles, {
        one: '1 of 1 file added. Remove the file if you want to add a different one.',
        other: `${format.number(maxFiles)} of ${format.number(maxFiles)} files added. Remove a file if you want to add a different one.`,
      }),
    rejectedHeading: ({ count }, format) =>
      format.plural(count, {
        one: '1 file couldn’t be added:',
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
      format.plural(count, { one: '1 file added.', other: `${format.number(count)} files added.` }),
    filesRejected: ({ count }, format) =>
      format.plural(count, {
        one: '1 file couldn’t be added.',
        other: `${format.number(count)} files couldn’t be added.`,
      }),
    uploadsStarted: ({ count }, format) =>
      format.plural(count, {
        one: 'Uploading 1 file.',
        other: `Uploading ${format.number(count)} files.`,
      }),
    uploadComplete: ({ name }) => `${name} uploaded.`,
    uploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: '1 file uploaded.',
        other: `${format.number(count)} files uploaded.`,
      }),
    allUploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: 'The file has been uploaded.',
        other: `All ${format.number(count)} files uploaded.`,
      }),
    uploadFailed: ({ name }) => `${name} couldn’t be uploaded.`,
    uploadsFailed: ({ count }, format) =>
      format.plural(count, {
        one: '1 file couldn’t be uploaded.',
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
        other: `${format.number(count)} rows selected.`,
      }),
    rowCount: ({ count }, format) =>
      format.plural(count, { one: '1 row.', other: `${format.number(count)} rows.` }),
    loading: 'Loading rows.',
    empty: 'No rows to show.',
    rowDetails: 'Details',
    rowDetailsNumber: ({ index }, format) => `Details row ${format.number(index)}`,
  },
  richText: {
    toolbar: 'Formatting',
    groupHistory: 'Undo and redo',
    groupTextStyle: 'Text style',
    groupLists: 'Lists',
    groupInsert: 'Insert',
    groupTable: 'Table',
    undo: 'Undo',
    redo: 'Redo',
    blockType: 'Text type',
    blockParagraph: 'Normal text',
    blockHeading2: 'Heading 2',
    blockHeading3: 'Heading 3',
    blockHeading4: 'Heading 4',
    blockQuote: 'Quote',
    blockCode: 'Code block',
    blockMixed: 'Several types',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strike: 'Strikethrough',
    code: 'Code',
    bulletList: 'Bulleted list',
    orderedList: 'Numbered list',
    indent: 'Increase indent',
    outdent: 'Decrease indent',
    link: 'Link',
    image: 'Image',
    table: 'Table',
    clearFormatting: 'Clear formatting',
    addRowAbove: 'Add row above',
    addRowBelow: 'Add row below',
    addColumnLeft: 'Add column to the left',
    addColumnRight: 'Add column to the right',
    deleteRow: 'Delete row',
    deleteColumn: 'Delete column',
    deleteTable: 'Delete table',
    headerRow: 'Header row',
    linkAddTitle: 'Add link',
    linkEditTitle: 'Edit link',
    linkUrl: 'Web address',
    linkUrlHint: 'For example, https://www.example.com',
    linkText: 'Link text',
    linkTextHint: 'Say where the link goes, for example Apply for a parking permit.',
    linkAdd: 'Add link',
    save: 'Save',
    linkRemove: 'Remove link',
    cancel: 'Cancel',
    linkUrlMissing: 'Enter a web address.',
    linkUrlInvalid: 'Enter the web address like https://www.example.com',
    linkTextMissing: 'Enter the link text.',
    imageAddTitle: 'Add image',
    imageEditTitle: 'Edit image',
    imageUrl: 'Image web address',
    imageUrlHint: 'For example, https://www.example.com/map.png',
    imageAlt: 'What does the image show?',
    imageAltHint: 'This is read out to people who can’t see the image.',
    imageDecorative: 'The image is only decoration',
    imageDecorativeHint: 'It shows nothing that needs describing.',
    imageAdd: 'Add image',
    imageRemove: 'Remove image',
    imageUrlMissing: 'Enter the image’s web address.',
    imageUrlInvalid: 'Enter the web address like https://www.example.com/map.png',
    imageUrlNotAllowed:
      'Images from that address aren’t allowed here. Enter a different web address.',
    imageAltMissing: 'Describe what the image shows, or tick that it’s only decoration.',
    linkAdded: 'Link added.',
    linkUpdated: 'Link changed.',
    linkRemoved: 'Link removed.',
    imageAdded: 'Image added.',
    imageUpdated: 'Image changed.',
    imageRemoved: 'Image removed.',
    tableInserted: ({ columns, rows }, format) =>
      `Table with ${format.plural(columns, { one: '1 column', other: `${format.number(columns)} columns` })} and ${format.plural(rows, { one: '1 row', other: `${format.number(rows)} rows` })} added.`,
    rowAdded: 'Row added.',
    columnAdded: 'Column added.',
    rowDeleted: 'Row deleted.',
    columnDeleted: 'Column deleted.',
    tableDeleted: ({ shortcut }) => `Table deleted. Undo with ${shortcut}.`,
    listLevel: ({ level }) => `Level ${level}`,
    formattingCleared: 'Formatting cleared.',
    undone: 'Undone.',
    redone: 'Redone.',
    formatOn: ({ name }) => `${name} on`,
    formatOff: ({ name }) => `${name} off`,
    imagePasteNotSupported: 'Images can’t be pasted. Use the Image button.',
    imageSourceNotAllowed:
      'The pasted image wasn’t added, because it comes from an address that isn’t allowed.',
  },
  tableOfContents: { label: 'On this page' },
  skipLink: { label: 'Skip to main content' },
  breadcrumb: { label: 'You are here' },
  pagination: {
    label: 'Pages',
    previous: 'Previous page',
    next: 'Next page',
    status: ({ page, total }, format) => `Page ${format.number(page)} of ${format.number(total)}`,
    page: ({ page }, format) => `Page ${format.number(page)}`,
  },
  routeFocus: { navigated: ({ title }) => `Navigated to ${title}` },
  copyButton: {
    label: 'Copy',
    copied: 'Copied',
    failed: 'Could not copy. Select the text and copy it yourself.',
  },
  errorSummary: { title: 'There is a problem', titlePrefix: 'Error:' },
  summaryList: { change: 'Change' },
  toast: { regionLabel: 'Messages' },
  stepper: {
    status: ({ current, total }, format) =>
      `Step ${format.number(current)} of ${format.number(total)}`,
    statusWithName: ({ current, total, name }, format) =>
      `Step ${format.number(current)} of ${format.number(total)}: ${name}`,
  },
  progress: {
    loading: 'Loading.',
    slow: 'This is taking longer than usual. Keep this page open.',
    valueText: ({ label, percent }, format) =>
      `${label}, ${format.number(percent / 100, { style: 'percent' })}`,
  },
  tag: { remove: ({ label }) => `Remove ${label}`, removed: ({ label }) => `${label} removed.` },
  filters: {
    heading: 'Filter',
    disclosure: ({ count }, format) =>
      format.plural(count, {
        zero: 'Filters',
        one: 'Filters, 1 applied',
        other: `Filters, ${format.number(count)} applied`,
      }),
    applied: 'Applied filters',
    none: 'No filters applied',
    appliedValue: ({ group, value }) => `${group}: ${value}`,
    clearAll: 'Clear all filters',
    apply: 'Show results',
    sortLabel: 'Sort by',
    sortRelevance: 'Most relevant',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    sortNameAscending: 'Name, A to Z',
    resultCount: ({ count }, format) =>
      format.plural(count, {
        zero: 'No results',
        one: '1 result',
        other: `${format.number(count)} results`,
      }),
    removedResultCount: ({ label, count }, format) =>
      `${label} removed. ${format.plural(count, { zero: 'No results', one: '1 result', other: `${format.number(count)} results` })}.`,
    clearedResultCount: ({ count }, format) =>
      `All filters cleared. ${format.plural(count, { zero: 'No results', one: '1 result', other: `${format.number(count)} results` })}.`,
    noResults: 'No results match these filters.',
    noResultsHint: 'Try removing a filter, or clear all filters.',
    loading: 'Updating results',
    loadFailed: 'The results couldn’t be updated.',
    retry: 'Try again',
  },
  calendar: {
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    dayName: ({ date, isToday, rangePosition, rangeNote, description }) =>
      [date, isToday ? 'today' : undefined, rangePosition, rangeNote, description]
        .filter((part) => part !== undefined)
        .join(', '),
    weekHeader: 'Wk',
    weekHeaderLong: 'Week',
    weekName: ({ week }, format) => `Week ${format.number(week)}`,
    rangeHint: ({ min, max }) =>
      min !== undefined && max !== undefined
        ? `Dates from ${min} to ${max}`
        : min !== undefined
          ? `Dates from ${min}`
          : `Dates up to ${max}`,
    selected: ({ date }) => `${date} selected`,
  },
  datePicker: {
    trigger: 'Choose date',
    title: 'Choose a date',
  },
} satisfies KvirnMessages
    rangeStart: 'start date',
    rangeEnd: 'end date',
    rangeStartAndEnd: 'start and end date',
    rangeLength: ({ days }, format) =>
      format.plural(days, { one: '1 day', other: `${format.number(days)} days` }),
    rangeTooShort: ({ minimum }, format) =>
      `fewer than ${format.plural(minimum, { one: '1 day', other: `${format.number(minimum)} days` })}`,
    rangeTooLong: ({ maximum }, format) =>
      `more than ${format.plural(maximum, { one: '1 day', other: `${format.number(maximum)} days` })}`,
    rangeBlocked: 'an unavailable day is in between',
    rangeBeforeStart: 'before the start date',
    rangeSpanHint: ({ minimum, maximum }, format) =>
      minimum !== undefined && maximum !== undefined
        ? `${format.number(minimum)} to ${format.plural(maximum, { one: '1 day', other: `${format.number(maximum)} days` })}`
        : minimum !== undefined
          ? `at least ${format.plural(minimum, { one: '1 day', other: `${format.number(minimum)} days` })}`
          : `up to ${format.plural(maximum ?? 0, { one: '1 day', other: `${format.number(maximum ?? 0)} days` })}`,
    rangeChooseStart: 'Choose the start date.',
    rangeChooseEnd: ({ start }) => `Start date ${start}. Choose the end date.`,
    rangeSelected: ({ start, end, length }) => `${start} to ${end} selected, ${length}`,
    rangeEndSelected: ({ date }) => `End date ${date} selected.`,
    rangeEndCleared: 'End date cleared.',
    visibleMonths: ({ first, last }) => `${first} and ${last}`,
  dateRangePicker: {
    trigger: 'Choose dates',
    title: 'Choose the dates',
  },
