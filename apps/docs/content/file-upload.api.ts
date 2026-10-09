import type {
  FileUploadCancelButtonProps,
  FileUploadDropHintProps,
  FileUploadInputProps,
  FileUploadItemErrorProps,
  FileUploadItemProps,
  FileUploadLimitsProps,
  FileUploadListProps,
  FileUploadNameProps,
  FileUploadPreviewProps,
  FileUploadRejectionsProps,
  FileUploadRootProps,
  FileUploadSizeProps,
  FileUploadStatusProps,
  FileUploadSummaryProps,
  FileUploadTriggerProps,
  FileUploadTypeProps,
  UseFileUploadOptions,
  UseFileUploadResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow, PropRow } from '../components/api-block.tsx'
import type { StringKeySpec } from '../components/strings-block.tsx'

const childrenRow = (replaces: string): PropRow => ({
  type: 'ReactNode',
  default: '–',
  description: `Replaces ${replaces}.`,
})

const stateAttribute = (name: string, meaning: string): AttributeRow => ({
  name,
  values: 'present or absent',
  meaning,
})

const optionRows = propRows<UseFileUploadOptions>({
  accept: {
    type: 'string',
    default: '–',
    description:
      'The accepted types, comma separated: extensions (.pdf), MIME types and wildcards (image/*). It filters the file dialog and checks dropped files. Not security.',
  },
  maxFileSize: {
    type: 'number',
    default: '–',
    description: 'The largest file, in bytes. A larger one is refused as tooLarge.',
  },
  minFileSize: {
    type: 'number',
    default: '–',
    description: 'The smallest file, in bytes. A smaller one is refused as tooSmall.',
  },
  maxFiles: {
    type: 'number',
    default: '–',
    description:
      'How many files the list holds. At the limit the Trigger is aria-disabled and says why. Ignored when multiple is off.',
  },
  multiple: {
    type: 'boolean',
    default: 'true',
    description:
      'Off is single-file mode: a new file replaces the current one and the Trigger text changes.',
  },
  allowDuplicates: {
    type: 'boolean',
    default: 'false',
    description:
      'Off refuses a file with the same name, size and last-modified time as one in the list.',
  },
  validate: {
    type: '(file: File) => string | null | undefined | void',
    default: '–',
    description:
      'Your own check, run last. A returned string refuses the file and is shown as its message.',
  },
  upload: {
    type: '(file: File, context: { signal: AbortSignal; onProgress: (fraction: number) => void }) => Promise<Result>',
    default: '–',
    description:
      'Sends the file wherever you want: KvirnUI makes no network calls. Report progress from 0 to 1, honour the signal, and reject to mark the file failed. Without it, files stay pending and go with the form.',
  },
  concurrency: {
    type: 'number',
    default: '3',
    description: 'How many uploads run at once.',
  },
  autoUpload: {
    type: 'boolean',
    default: 'true',
    description: 'Off keeps files pending until uploadAll() is called.',
  },
  previews: {
    type: 'boolean',
    default: 'false',
    description:
      'Gives image files a previewUrl on their item, for your own thumbnail. FileUpload.Preview makes its own, so you don’t need it for that.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Native disabled on the Trigger and the input, no drop zone and no item buttons. A disabled Field does the same.',
  },
  onFilesChange: {
    type: '(items: readonly FileUploadEntry<Result>[]) => void',
    default: '–',
    description:
      'Called when the list changes: a file is added or removed, an upload finishes or fails, or an item is retried. Not on every progress step.',
  },
  onFilesReject: {
    type: '(rejections: readonly FileUploadRejection[]) => void',
    default: '–',
    description:
      'Called when an add refused files, with the reasons as data. The component already shows and announces them.',
  },
  messages: {
    type: 'Partial<KvirnMessages["fileUpload"]>',
    default: '–',
    description: 'Overrides the component’s strings for this instance.',
  },
})

export type FileUploadRootDocumentedProps = Pick<FileUploadRootProps, keyof UseFileUploadOptions>

export const fileUploadRootRows = propRows<FileUploadRootDocumentedProps>({
  ...optionRows,
})

export const fileUploadRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-file-upload',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  stateAttribute('data-drag-active', 'A file is dragged over the page.'),
  stateAttribute('data-full', 'maxFiles files are in the list.'),
  stateAttribute('data-invalid', 'The Field is invalid.'),
  stateAttribute('data-disabled', 'The Field or the disabled option disables it.'),
]

export const fileUploadTriggerRows = propRows<Pick<FileUploadTriggerProps, 'children'>>({
  children: childrenRow('the text, which is “Choose files”, “Choose file” or “Replace file”'),
})

export const fileUploadTriggerAttributes: readonly AttributeRow[] = [
  { name: 'kv-button kv-file-upload-trigger', values: 'always', meaning: 'The part classes.' },
  stateAttribute('data-full', 'maxFiles files are in the list.'),
  stateAttribute('data-invalid', 'The Field is invalid. aria-invalid="true" is set with it.'),
  stateAttribute('data-disabled', 'Disabled.'),
  {
    name: 'aria-disabled',
    values: '"true" or absent',
    meaning: 'Set at maxFiles. The button stays focusable and its description says why.',
  },
  {
    name: 'aria-describedby',
    values: 'ids',
    meaning:
      'Set for you: the Field’s descriptions and error, then the Rejections, then the Summary when the list is full.',
  },
]

export const fileUploadInputRows = propRows<Pick<FileUploadInputProps, 'name'>>({
  name: {
    type: 'string',
    default: '–',
    description:
      'Posts the files with a plain form, under this name. capture and form also pass through.',
  },
})

export const fileUploadDropZoneAttributes: readonly AttributeRow[] = [
  { name: 'kv-file-upload-drop-zone', values: 'always', meaning: 'The part class.' },
  stateAttribute(
    'data-droppable',
    'The zone is drawn: a precise pointer is attached, or a file is over the page.',
  ),
  stateAttribute('data-dragging', 'A file is over the zone itself. Never on a disabled zone.'),
  stateAttribute('data-invalid', 'The Field is invalid.'),
  stateAttribute('data-disabled', 'Disabled.'),
]

export const fileUploadDropHintRows = propRows<Pick<FileUploadDropHintProps, 'children'>>({
  children: childrenRow('the hint, “or drop files here”'),
})

export const fileUploadLimitsRows = propRows<Pick<FileUploadLimitsProps, 'children'>>({
  children: childrenRow('the text built from accept, maxFiles and maxFileSize'),
})

export const fileUploadRejectionsRows = propRows<Pick<FileUploadRejectionsProps, 'children'>>({
  children: childrenRow('the heading and one line per refused file'),
})

export const fileUploadSummaryRows = propRows<Pick<FileUploadSummaryProps, 'children'>>({
  children: childrenRow('the text, for example “2 of 5 files added”'),
})

export const fileUploadListRows = propRows<Pick<FileUploadListProps, 'children'>>({
  children: {
    type: 'ReactNode | ((item: FileUploadEntry, index: number) => ReactNode)',
    default: '–',
    description:
      'A function that renders one FileUpload.Item per file, or your own nodes. Use item.id as the key.',
  },
})

export const fileUploadItemRows = propRows<Pick<FileUploadItemProps, 'item'>>({
  item: {
    type: 'FileUploadEntry',
    description:
      'The file this item shows, from the List’s function: id, file, status, progress, error, result and previewUrl.',
  },
})

export const fileUploadItemAttributes: readonly AttributeRow[] = [
  { name: 'kv-file-upload-item', values: 'always', meaning: 'The part class.' },
  {
    name: 'data-status',
    values: '"pending", "uploading", "complete", "failed" or "cancelled"',
    meaning: 'The file’s state.',
  },
  {
    name: 'tabindex',
    values: '"-1"',
    meaning:
      'Only so a script can keep focus in place when a button goes away. It is not a Tab stop.',
  },
]

export const fileUploadPreviewRows = propRows<Pick<FileUploadPreviewProps, 'children'>>({
  children: childrenRow('the document icon shown for a file that is not an image'),
})

export const fileUploadFileDetailRows = propRows<
  Pick<FileUploadNameProps & FileUploadTypeProps & FileUploadSizeProps, 'children'>
>({
  children: childrenRow('the file’s name, type or size'),
})

export const fileUploadStatusRows = propRows<Pick<FileUploadStatusProps, 'children'>>({
  children: childrenRow('the status text, for example “Uploading, 45 %”'),
})

export const fileUploadStatusAttributes: readonly AttributeRow[] = [
  { name: 'kv-file-upload-status', values: 'always', meaning: 'The part class.' },
  {
    name: 'data-status',
    values: '"pending", "uploading", "complete", "failed" or "cancelled"',
    meaning: 'The file’s state.',
  },
]

export const fileUploadItemErrorRows = propRows<Pick<FileUploadItemErrorProps, 'children'>>({
  children: childrenRow('your message from the rejected upload, or the neutral sentence'),
})

export const fileUploadItemButtonRows = propRows<Pick<FileUploadCancelButtonProps, 'children'>>({
  children: childrenRow('the visible text'),
})

export const fileUploadItemButtonAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button kv-file-upload-cancel',
    values: 'class',
    meaning:
      'On the Cancel button. The Retry and Remove buttons have kv-file-upload-retry and kv-file-upload-remove.',
  },
  {
    name: 'aria-label',
    values: 'text',
    meaning: 'Set for you: the visible text, then the file name (“Remove report.pdf”).',
  },
]

export const useFileUploadHook: ApiHook = {
  name: 'useFileUpload',
  options: optionRows,
  result: propRows<UseFileUploadResult>({
    rootProps: {
      type: 'FileUploadRootPartProps',
      default: '–',
      description: 'Spread on the root <div>.',
    },
    dropZoneProps: {
      type: 'FileUploadDropZonePartProps',
      default: '–',
      description: 'Spread on the drop zone <div>.',
    },
    triggerProps: {
      type: 'FileUploadTriggerPartProps',
      default: '–',
      description: 'Spread on the Trigger <button>.',
    },
    inputProps: {
      type: 'FileUploadInputPartProps',
      default: '–',
      description: 'Spread on the hidden <input type="file">.',
    },
    rejectionsProps: {
      type: 'FileUploadRejectionsPartProps',
      default: '–',
      description: 'Spread on your rejections element, and call registerPart("rejections").',
    },
    summaryProps: {
      type: 'FileUploadSummaryPartProps',
      default: '–',
      description: 'Spread on your summary element, and call registerPart("summary").',
    },
    getItemProps: {
      type: '(item) => FileUploadItemPartProps',
      default: '–',
      description: 'Spread on each <li>.',
    },
    getProgressProps: {
      type: '(item) => FileUploadProgressPartProps',
      default: '–',
      description: 'Spread on an item’s <progress>.',
    },
    getStatusProps: {
      type: '(item) => FileUploadStatusPartProps',
      default: '–',
      description: 'Spread on an item’s status element.',
    },
    getItemErrorProps: {
      type: '(item) => FileUploadItemErrorPartProps',
      default: '–',
      description: 'Spread on an item’s error element, shown while it is failed.',
    },
    getRemoveButtonProps: {
      type: '(item) => FileUploadItemButtonPartProps',
      default: '–',
      description: 'Spread on an item’s Remove button.',
    },
    getCancelButtonProps: {
      type: '(item) => FileUploadItemButtonPartProps',
      default: '–',
      description: 'Spread on an item’s Cancel button.',
    },
    getRetryButtonProps: {
      type: '(item) => FileUploadItemButtonPartProps',
      default: '–',
      description: 'Spread on an item’s Retry button.',
    },
    items: {
      type: 'readonly FileUploadEntry[]',
      default: '–',
      description: 'The accepted files, in order. Refused files never enter the list.',
    },
    rejections: {
      type: 'readonly FileUploadRejection[]',
      default: '–',
      description: 'The files the latest add refused, as data.',
    },
    rejectionLines: {
      type: 'readonly RejectionLine[]',
      default: '–',
      description: 'One sentence per refused file: which file and what to do.',
    },
    triggerText: {
      type: 'string',
      default: '–',
      description: 'The Trigger’s text: choose, or replace in single-file mode with a file chosen.',
    },
    triggerTextId: {
      type: 'string',
      default: '–',
      description:
        'The id of the element that holds the Trigger’s text, so its name starts with the visible text.',
    },
    limitsText: {
      type: 'string',
      default: '–',
      description: 'The limits that are set, as one text. Empty when none is set.',
    },
    summaryText: {
      type: 'string',
      default: '–',
      description: 'The summary, for example “2 of 5 files added”. Empty in single-file mode.',
    },
    dropHintText: {
      type: 'string',
      default: '–',
      description: 'The drop hint, or the dragging one while a file is over the zone.',
    },
    getItemName: {
      type: '(item) => string',
      default: '–',
      description: 'The name the list shows, with “(2)” when two items share a file name.',
    },
    getItemSize: {
      type: '(item) => string',
      default: '–',
      description: 'The size in the provider’s locale, in decimal units.',
    },
    getItemType: {
      type: '(item) => string',
      default: '–',
      description: 'The extension in capitals, never the MIME type.',
    },
    getItemStatusText: {
      type: '(item) => string',
      default: '–',
      description: 'The status as text.',
    },
    getItemErrorText: {
      type: '(item) => string | undefined',
      default: '–',
      description:
        'A failed upload’s text: yours, else a neutral one. Undefined unless the item is failed.',
    },
    getItemActions: {
      type: '(item) => { cancel: boolean; retry: boolean; remove: boolean }',
      default: '–',
      description: 'Which buttons an item shows: one action per state.',
    },
    messages: {
      type: 'FileUploadMessages',
      default: '–',
      description: 'The resolved fileUpload messages.',
    },
    labelId: {
      type: 'string | undefined',
      default: '–',
      description:
        'The Field label’s id, for aria-labelledby on the list. Undefined outside a Field.',
    },
    isMultiple: {
      type: 'boolean',
      default: '–',
      description: 'Whether more than one file is allowed.',
    },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether it is disabled.' },
    isInvalid: { type: 'boolean', default: '–', description: 'Whether the Field is invalid.' },
    isFull: {
      type: 'boolean',
      default: '–',
      description: 'Whether maxFiles files are in the list.',
    },
    isDragging: {
      type: 'boolean',
      default: '–',
      description: 'Whether a file is dragged over the zone.',
    },
    isDragActive: {
      type: 'boolean',
      default: '–',
      description: 'Whether a file is dragged over the page.',
    },
    isDroppable: {
      type: 'boolean',
      default: '–',
      description:
        'Whether the zone is drawn: a precise pointer is attached, or a file is over the page.',
    },
    add: {
      type: '(files, source?) => FileUploadAddResult',
      default: '–',
      description:
        'Checks and adds files like the dialog or a drop does. Returns who was accepted and refused.',
    },
    remove: {
      type: '(id: string) => void',
      default: '–',
      description: 'Removes an item, cancelling its upload first, and announces it.',
    },
    cancel: { type: '(id: string) => void', default: '–', description: 'Cancels an upload.' },
    retry: {
      type: '(id: string) => void',
      default: '–',
      description: 'Starts a failed or cancelled upload again.',
    },
    uploadAll: {
      type: '() => void',
      default: '–',
      description: 'Starts every pending upload, for autoUpload off, and announces how many.',
    },
    reset: {
      type: '() => void',
      default: '–',
      description:
        'Empties the list and cancels every upload. Focus in the list goes to the Trigger.',
    },
    registerPart: {
      type: '(part) => () => void',
      default: '–',
      description:
        'Tells the hook a part is rendered, so the Trigger’s description lists it. Call it in a layout effect.',
    },
    isPartRegistered: {
      type: '(part) => boolean',
      default: '–',
      description: 'Whether that part is rendered.',
    },
  }),
}

const allowed = ['.pdf', '.jpg']

export const fileUploadStringKeys: readonly StringKeySpec<'fileUpload'>[] = [
  { key: 'chooseFiles', meaning: 'The Trigger’s text with multiple.' },
  { key: 'chooseFile', meaning: 'The Trigger’s text in single-file mode with nothing chosen.' },
  { key: 'replaceFile', meaning: 'The Trigger’s text in single-file mode with a file chosen.' },
  {
    key: 'dropHint',
    meaning: 'The hint next to the Trigger on devices with a mouse.',
    values: { multiple: true },
  },
  {
    key: 'dropHintActive',
    meaning: 'The hint while a file is over the zone.',
    values: { multiple: true },
  },
  { key: 'limitsMaxFiles', meaning: 'Limits: how many files.', values: { count: 5 } },
  {
    key: 'limitsTypes',
    meaning: 'Limits: which types.',
    values: { allowed, multiple: true },
  },
  {
    key: 'limitsMaxSize',
    meaning: 'Limits: how large.',
    values: { limit: 10_000_000, multiple: true },
  },
  { key: 'summary', meaning: 'The Summary without maxFiles.', values: { count: 3 } },
  { key: 'summaryOfMax', meaning: 'The Summary with maxFiles.', values: { count: 2, maxFiles: 5 } },
  {
    key: 'summaryFull',
    meaning:
      'The Summary at the limit, with what to do next. It also ends the announcement of the add that filled the list.',
    values: { maxFiles: 5 },
  },
  { key: 'rejectedHeading', meaning: 'The first line of the Rejections.', values: { count: 1 } },
  { key: 'statusReady', meaning: 'An item whose destination is the form.' },
  { key: 'statusQueued', meaning: 'An item waiting for an upload slot.' },
  { key: 'statusUploading', meaning: 'An upload with no known size.' },
  {
    key: 'statusUploadingPercent',
    meaning: 'An upload with a known size.',
    values: { percent: 45 },
  },
  { key: 'statusComplete', meaning: 'A finished upload.' },
  { key: 'statusFailed', meaning: 'A failed upload.' },
  { key: 'statusCancelled', meaning: 'A cancelled upload.' },
  { key: 'typeUnknown', meaning: 'The Type part when the file has no extension.' },
  { key: 'remove', meaning: 'The visible text of the Remove button.' },
  { key: 'cancel', meaning: 'The visible text of the Cancel button.' },
  { key: 'retry', meaning: 'The visible text of the Retry button.' },
  {
    key: 'duplicateName',
    meaning: 'A file name when two items share it.',
    values: { name: 'image.jpg', number: 2 },
  },
  {
    key: 'errorType',
    meaning: 'Refused: not an accepted type.',
    values: { name: 'notes.txt', allowed },
  },
  {
    key: 'errorTooLarge',
    meaning: 'Refused: too large.',
    values: { name: 'scan.pdf', size: 12_000_000, limit: 10_000_000 },
  },
  {
    key: 'errorTooSmall',
    meaning: 'Refused: too small.',
    values: { name: 'scan.pdf', size: 500, limit: 1000 },
  },
  {
    key: 'errorEmpty',
    meaning: 'Refused: the file has no content.',
    values: { name: 'empty.pdf' },
  },
  {
    key: 'errorTooMany',
    meaning: 'Refused: the list is full.',
    values: { name: 'receipt.pdf', maxFiles: 5 },
  },
  {
    key: 'errorDuplicate',
    meaning: 'Refused: the same file is already in the list.',
    values: { name: 'receipt.pdf' },
  },
  { key: 'errorFolder', meaning: 'Refused: a folder was dropped.', values: { name: 'Documents' } },
  {
    key: 'uploadFailedMessage',
    meaning: 'A failed upload that supplies no text of its own. Neutral: it never says why.',
    values: { name: 'report.pdf' },
  },
  {
    key: 'rejectedFilePosition',
    meaning:
      'Starts a refusal line for a file that shares its name with another in the same selection.',
    values: { position: 2, total: 3, message: 'image.jpg isn’t a type of file we can accept.' },
  },
  {
    key: 'removeFile',
    meaning: 'The Remove button’s name. It starts with the visible text.',
    values: { name: 'report.pdf' },
  },
  { key: 'cancelFile', meaning: 'The Cancel button’s name.', values: { name: 'report.pdf' } },
  { key: 'retryFile', meaning: 'The Retry button’s name.', values: { name: 'report.pdf' } },
  { key: 'uploadingFile', meaning: 'The progress bar’s name.', values: { name: 'report.pdf' } },
  { key: 'fileAdded', meaning: 'Announced: one file was added.', values: { name: 'report.pdf' } },
  { key: 'filesAdded', meaning: 'Announced: several files were added.', values: { count: 3 } },
  { key: 'filesRejected', meaning: 'Announced: files were refused.', values: { count: 2 } },
  { key: 'uploadsStarted', meaning: 'Announced: uploads started.', values: { count: 3 } },
  {
    key: 'uploadComplete',
    meaning: 'Announced: one upload finished.',
    values: { name: 'report.pdf' },
  },
  { key: 'uploadsComplete', meaning: 'Announced: several uploads finished.', values: { count: 3 } },
  {
    key: 'allUploadsComplete',
    meaning: 'Announced: a batch emptied the queue with no failure.',
    values: { count: 3 },
  },
  { key: 'uploadFailed', meaning: 'Announced: one upload failed.', values: { name: 'report.pdf' } },
  { key: 'uploadsFailed', meaning: 'Announced: several uploads failed.', values: { count: 2 } },
  { key: 'fileRemoved', meaning: 'Announced: a file was removed.', values: { name: 'report.pdf' } },
  {
    key: 'announcementForField',
    meaning: 'Wraps an announcement with the Field label when several FileUploads are mounted.',
    values: { label: 'Attachments', message: '2 files uploaded.' },
  },
]
