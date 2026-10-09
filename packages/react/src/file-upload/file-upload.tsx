'use client'
import type { FileUploadEntry as FileUploadItemData } from '@kvirn-ui/core'
import {
  createElement,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ComponentPropsWithRef, MouseEventHandler, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { useDescriptionPart } from '../field/use-description-part.ts'
import { joinIds } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'
import { FileUploadContext, FileUploadItemContext } from './file-upload-context.ts'
import type { FileUploadItemContextValue, FileUploadItemPartName } from './file-upload-context.ts'
import { isImageFile } from './file-upload-format.ts'
import { useFileUpload } from './use-file-upload.ts'
import type { UseFileUploadOptions, UseFileUploadResult } from './use-file-upload.ts'

/** A file in the list, as `List` and `Item` hand it to you. */
export type { FileUploadItemData }

export interface FileUploadRootProps
  extends UseFileUploadOptions, Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children?: ReactNode
}

export type FileUploadDropZoneProps = ComponentPropsWithRef<'div'>

export type FileUploadTriggerProps = Omit<
  ComponentPropsWithRef<'button'>,
  'id' | 'type' | 'disabled' | 'aria-disabled' | 'aria-required' | 'aria-labelledby'
>

/**
 * `name`, `capture` and `form` pass through. `accept`, `multiple`, `type` and `id` come from the
 * Root and the Field, and `required` is never set: the Field's error carries "required".
 */
export type FileUploadInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  | 'type'
  | 'accept'
  | 'multiple'
  | 'value'
  | 'defaultValue'
  | 'required'
  | 'id'
  | 'disabled'
  | 'tabIndex'
  | 'aria-hidden'
>

export type FileUploadDropHintProps = ComponentPropsWithRef<'p'>

/** The Limits is a description of the Field: it takes a `<p>`'s props, but not the `id`. */
export type FileUploadLimitsProps = Omit<ComponentPropsWithRef<'p'>, 'id'>

export type FileUploadRejectionsProps = ComponentPropsWithRef<'div'>

export type FileUploadSummaryProps = ComponentPropsWithRef<'p'>

export interface FileUploadListProps extends Omit<ComponentPropsWithRef<'ul'>, 'children'> {
  /**
   * A function that renders one Item per file, called with the file and its index, or your own
   * nodes. The ready-made Item needs the file: `<FileUpload.Item item={item}>`.
   */
  children?: ReactNode | ((item: FileUploadItemData, index: number) => ReactNode)
}

export interface FileUploadItemProps extends ComponentPropsWithRef<'li'> {
  /** The file this item shows, from `FileUpload.List`'s children function. */
  item: FileUploadItemData
}

export type FileUploadPreviewProps = ComponentPropsWithRef<'span'>

export type FileUploadNameProps = ComponentPropsWithRef<'bdi'>

export type FileUploadTypeProps = ComponentPropsWithRef<'span'>

export type FileUploadSizeProps = ComponentPropsWithRef<'span'>

export type FileUploadStatusProps = Omit<ComponentPropsWithRef<'p'>, 'id'>

export type FileUploadItemErrorProps = Omit<ComponentPropsWithRef<'p'>, 'id'>

export type FileUploadProgressProps = Omit<
  ComponentPropsWithRef<'progress'>,
  'value' | 'max' | 'aria-label'
>

export type FileUploadActionsProps = ComponentPropsWithRef<'div'>

export type FileUploadItemButtonProps = Omit<ComponentPropsWithRef<'button'>, 'type' | 'aria-label'>
export type FileUploadCancelButtonProps = FileUploadItemButtonProps
export type FileUploadRetryButtonProps = FileUploadItemButtonProps
export type FileUploadRemoveButtonProps = FileUploadItemButtonProps

/** The Root's hook, with the one development warning for a part outside a Root. */
function useRoot(part: string): UseFileUploadResult | null {
  const fileUpload = useContext(FileUploadContext)
  useEffect(() => {
    if (fileUpload === null) {
      warnOnce(
        `file-upload-${part.toLowerCase()}-outside-root`,
        `A FileUpload.${part} is outside a FileUpload.Root, so it has no files, no limits and no wiring to the Trigger. Put it inside <FileUpload.Root>.`,
      )
    }
  }, [fileUpload, part])
  return fileUpload
}

/** The Item a part sits in, with the development warning for one outside an Item. */
function useItem(part: string) {
  const itemContext = useContext(FileUploadItemContext)
  useEffect(() => {
    if (itemContext === null) {
      warnOnce(
        `file-upload-${part.toLowerCase()}-outside-item`,
        `A FileUpload.${part} is outside a FileUpload.Item, so it has no file to show. Put it inside <FileUpload.Item item={item}>.`,
      )
    }
  }, [itemContext, part])
  return itemContext
}

/**
 * The file upload of a form question (contract: file-upload.a11y.md). Put it in a
 * Field with a label and say the limits (`FileUpload.Limits`). A native button opens the system
 * dialog and a hidden native input receives the files, so the keyboard, voice, switch, touch and
 * screen readers all work. The drop zone is an extra. Each file is checked against the limits,
 * and a refused file never enters the list: `FileUpload.Rejections` says which and why. It holds
 * no form state and makes no network calls: `upload` is yours.
 *
 * @example
 * <Field.Root>
 *   <Field.Label>Bilagor</Field.Label>
 *   <FileUpload.Root accept=".pdf,image/jpeg" multiple maxFiles={5} maxFileSize={10_000_000}>
 *     <FileUpload.Limits />
 *     <FileUpload.DropZone>
 *       <FileUpload.Trigger />
 *       <FileUpload.DropHint />
 *     </FileUpload.DropZone>
 *     <FileUpload.Rejections />
 *     <FileUpload.Summary />
 *     <FileUpload.List>
 *       {(item) => (
 *         <FileUpload.Item item={item}>
 *           <FileUpload.Name /> <FileUpload.Size /> <FileUpload.Status />
 *           <FileUpload.Actions><FileUpload.RemoveButton /></FileUpload.Actions>
 *         </FileUpload.Item>
 *       )}
 *     </FileUpload.List>
 *     <FileUpload.Input name="attachments" />
 *   </FileUpload.Root>
 * </Field.Root>
 */
export function FileUploadRoot({
  accept,
  multiple,
  maxFiles,
  maxFileSize,
  minFileSize,
  allowDuplicates,
  validate,
  upload,
  concurrency,
  autoUpload,
  previews,
  disabled,
  onFilesChange,
  onFilesReject,
  messages,
  ref,
  children,
  ...otherProps
}: FileUploadRootProps): ReactElement {
  const fileUpload = useFileUpload({
    accept,
    multiple,
    maxFiles,
    maxFileSize,
    minFileSize,
    allowDuplicates,
    validate,
    upload,
    concurrency,
    autoUpload,
    previews,
    disabled,
    onFilesChange,
    onFilesReject,
    messages,
  })
  const mergedRef = useMergedRef(ref, null)
  // The hidden input is part of the contract: when no FileUpload.Input is rendered, the Root adds
  // one after it mounts. Not on the server, which has no use for it before the Trigger works.
  const isMounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
  const showFallbackInput = isMounted && !fileUpload.isPartRegistered('input')

  return (
    <FileUploadContext.Provider value={fileUpload}>
      {createElement(
        'div',
        {
          ...mergeProps(otherProps, fileUpload.rootProps),
          ref: mergedRef,
        },
        <>
          {children}
          {showFallbackInput ? <HiddenInput /> : null}
        </>,
      )}
    </FileUploadContext.Provider>
  )
}
FileUploadRoot.displayName = 'FileUpload.Root'

/** For `useSyncExternalStore`: nothing ever changes, only server and client differ. */
const subscribeNever = () => () => {}

/**
 * The one control that adds files: a native `<button>` that opens the system dialog. It carries the
 * Field's control id, so the label and an error-summary link reach a visible control. Its name is
 * its own text then the Field label ("Choose files Attachments (optional)"), so it starts with
 * the visible text (2.5.3). At `maxFiles` it is `aria-disabled` and does nothing, from Enter,
 * Space, a click and a click on the label, but stays focusable and says why in its description.
 * Never `aria-required`: a button doesn't allow it.
 */
export function FileUploadTrigger({
  onClick,
  'aria-describedby': ownDescribedBy,
  ref,
  children,
  ...otherProps
}: FileUploadTriggerProps): ReactElement {
  const fileUpload = useRoot('Trigger')
  const mergedRef = useMergedRef(ref, fileUpload?.triggerProps.ref ?? null)
  const isBlocked = fileUpload?.isFull === true || fileUpload?.isDisabled === true

  const triggerProps = fileUpload?.triggerProps
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    // A blocked Trigger runs none of the consumer's handlers: aria-disabled alone blocks nothing.
    if (!isBlocked) {
      onClick?.(event)
    }
    // The hook's handler blocks a full or disabled Trigger, and opens the dialog otherwise.
    triggerProps?.onClick(event)
  }
  const describedBy = joinIds(triggerProps?.['aria-describedby'], ownDescribedBy)

  const partProps: ComponentPropsWithRef<'button'> = {
    ...mergeProps(otherProps, triggerProps ?? {}),
    ...(triggerProps === undefined
      ? { className: 'kv-button kv-file-upload-trigger', type: 'button' as const }
      : {}),
    ...(describedBy === undefined ? {} : { 'aria-describedby': describedBy }),
    onClick: handleClick,
    // The text sits in its own element, and the name points at it (and at the Field label), so the
    // name starts with the visible text whatever the engine does with a button that names itself.
    children: (
      <>
        {children === undefined ? <Icon name="upload" size={5} /> : null}
        <span id={fileUpload?.triggerTextId}>{children ?? fileUpload?.triggerText}</span>
      </>
    ),
    ref: mergedRef,
  }

  return createElement('button', partProps)
}
FileUploadTrigger.displayName = 'FileUpload.Trigger'

/** Internal. The hidden native `<input type="file">`: out of the accessibility tree, never required. */
function HiddenInput({ ref, ...otherProps }: FileUploadInputProps): ReactElement {
  const fileUpload = useContext(FileUploadContext)
  const mergedRef = useMergedRef(ref, fileUpload?.inputProps.ref ?? null)

  return createElement('input', {
    ...mergeProps(otherProps, fileUpload?.inputProps ?? { type: 'file' }),
    ref: mergedRef,
  })
}

/**
 * The native `<input type="file">`, visually hidden and out of the accessibility tree
 * (`aria-hidden`, `tabIndex={-1}`, never `display: none`, never `required`): the Trigger is the one
 * control. Pass `name` to send the files with a plain `<form>`, and `capture` to open the camera.
 * If you don't render one, the Root adds it.
 */
export function FileUploadInput(props: FileUploadInputProps): ReactElement {
  const fileUpload = useRoot('Input')
  const registerPart = fileUpload?.registerPart
  useLayoutEffect(() => registerPart?.('input'), [registerPart])
  return <HiddenInput {...props} />
}
FileUploadInput.displayName = 'FileUpload.Input'

/**
 * The drop zone, an enhancement: a `<div>` with no role that is never focusable. The keyboard path
 * is the Trigger inside it. The handlers are always attached, and the theme draws the box when
 * `data-droppable` is set (a precise pointer, or a file dragged over the page).
 */
export function FileUploadDropZone({ ref, ...otherProps }: FileUploadDropZoneProps): ReactElement {
  const fileUpload = useRoot('DropZone')
  const mergedRef = useMergedRef(ref, null)
  return createElement('div', {
    ...mergeProps(
      otherProps,
      fileUpload?.dropZoneProps ?? { className: 'kv-file-upload-drop-zone' },
    ),
    ref: mergedRef,
  })
}
FileUploadDropZone.displayName = 'FileUpload.DropZone'

/**
 * "or drop files here": advice for pointer users, shown while the zone is drawn and the list isn't
 * full, and "Drop the files to add them" while a file is over the zone. It's in no description:
 * the Trigger does the same for everyone else.
 */
export function FileUploadDropHint({
  children,
  ref,
  ...otherProps
}: FileUploadDropHintProps): ReactElement | null {
  const fileUpload = useRoot('DropHint')
  const mergedRef = useMergedRef(ref, null)
  if (fileUpload !== null && (!fileUpload.isDroppable || fileUpload.isFull)) {
    return null
  }
  return createElement(
    'p',
    {
      ...mergeProps(otherProps, { className: 'kv-file-upload-drop-hint' }),
      ref: mergedRef,
    },
    children ?? fileUpload?.dropHintText,
  )
}
FileUploadDropHint.displayName = 'FileUpload.DropHint'

/**
 * The limits that are set (how many files, which types, how large), built from the Root's props so
 * the text can't disagree with them (3.3.2). A description of the Field, like a `Prose` in it: the
 * Trigger is described by it.
 */
export function FileUploadLimits({
  children,
  ...otherProps
}: FileUploadLimitsProps): ReactElement | null {
  const fileUpload = useRoot('Limits')
  const registerPart = fileUpload?.registerPart
  useLayoutEffect(() => registerPart?.('limits'), [registerPart])
  const text = children ?? fileUpload?.limitsText
  if (text === undefined || text === '') {
    return null
  }
  return <LimitsDescription {...otherProps} text={text} />
}

/** Internal. Only mounted when there is text, so no id is listed for an element that isn't there. */
function LimitsDescription({
  text,
  ref,
  ...otherProps
}: FileUploadLimitsProps & { text: ReactNode }): ReactElement {
  const description = useDescriptionPart<HTMLParagraphElement>(ref)
  return createElement(
    'p',
    {
      ...mergeProps(otherProps, description.partProps, { className: 'kv-file-upload-limits' }),
      ref: description.ref,
    },
    text,
  )
}
FileUploadLimits.displayName = 'FileUpload.Limits'

/**
 * The files the latest add refused, one line each: which file and what to do (3.3.1, 3.3.3). It
 * isn't a live region: the add is announced once. Not in the list, and not the Field's error. It
 * is cleared by the next add, a removal and `reset()`, and kept when the dialog is cancelled.
 * The Trigger's description lists it while it shows.
 */
export function FileUploadRejections({
  children,
  ref,
  ...otherProps
}: FileUploadRejectionsProps): ReactElement | null {
  const fileUpload = useRoot('Rejections')
  const field = useContext(FieldContext)
  const fieldMessages = useMessages('field', field?.messages)
  const mergedRef = useMergedRef(ref, null)
  const registerPart = fileUpload?.registerPart
  const hasRejections = (fileUpload?.rejections.length ?? 0) > 0
  useLayoutEffect(
    () => (hasRejections ? registerPart?.('rejections') : undefined),
    [hasRejections, registerPart],
  )
  if (fileUpload === null || !hasRejections) {
    return null
  }
  return createElement(
    'div',
    {
      ...mergeProps(otherProps, fileUpload.rejectionsProps),
      ref: mergedRef,
    },
    children ?? (
      <>
        <p>
          <Icon name="error" size={5} />
          <span className="kv-field-error-prefix">{fieldMessages.errorPrefix}</span>{' '}
          {fileUpload.messages.rejectedHeading({ count: fileUpload.rejections.length })}
        </p>
        <ul>
          {fileUpload.rejectionLines.map((line, index) => (
            <li key={`${index}-${line.file.name}`}>{line.text}</li>
          ))}
        </ul>
      </>
    ),
  )
}
FileUploadRejections.displayName = 'FileUpload.Rejections'

/**
 * How many files are added ("2 of 5 files added"), and at the limit what to do next. The Trigger
 * is described by it when the list is full. Not shown in single-file mode: the one item says it.
 */
export function FileUploadSummary({
  children,
  ref,
  ...otherProps
}: FileUploadSummaryProps): ReactElement | null {
  const fileUpload = useRoot('Summary')
  const mergedRef = useMergedRef(ref, null)
  const registerPart = fileUpload?.registerPart
  const isShown =
    fileUpload !== null && fileUpload.items.length > 0 && fileUpload.summaryText !== ''
  useLayoutEffect(() => (isShown ? registerPart?.('summary') : undefined), [isShown, registerPart])
  if (fileUpload === null || !isShown) {
    return null
  }
  return createElement(
    'p',
    {
      ...mergeProps(otherProps, fileUpload.summaryProps),
      ref: mergedRef,
    },
    children ?? fileUpload.summaryText,
  )
}
FileUploadSummary.displayName = 'FileUpload.Summary'

/**
 * The accepted files: a `<ul role="list">` named by the Field label ("Attachments, list, 3
 * items"). Renders only when there's at least one file. Give it a function to render each file.
 * It has no inner scroll box: it grows with the page.
 */
export function FileUploadList({
  children,
  ref,
  ...otherProps
}: FileUploadListProps): ReactElement | null {
  const fileUpload = useRoot('List')
  const mergedRef = useMergedRef(ref, null)
  if (fileUpload === null || fileUpload.items.length === 0) {
    return null
  }
  const labelled = fileUpload.labelId === undefined ? {} : { 'aria-labelledby': fileUpload.labelId }
  return createElement(
    'ul',
    {
      ...mergeProps(otherProps, { className: 'kv-file-upload-list', role: 'list' }, labelled),
      ref: mergedRef,
    },
    typeof children === 'function'
      ? fileUpload.items.map((item, index) => (
          <Fragment key={item.id}>{children(item, index)}</Fragment>
        ))
      : children,
  )
}
FileUploadList.displayName = 'FileUpload.List'

/**
 * One file: an `<li>` with `tabIndex={-1}`, only so focus can land on it. When the element holding
 * focus goes away (Remove, Cancel or Retry pressed, an upload ended), focus goes to the item, never
 * to another button. It isn't a control, so a repeated Enter on it does nothing.
 */
export function FileUploadItem({
  item,
  ref,
  children,
  ...otherProps
}: FileUploadItemProps): ReactElement {
  const fileUpload = useRoot('Item')
  const itemProps = fileUpload?.getItemProps(item)
  const mergedRef = useMergedRef(ref, itemProps?.ref ?? null)
  const [partCounts, setPartCounts] = useState<Readonly<Record<FileUploadItemPartName, number>>>({
    status: 0,
    error: 0,
  })
  const name = fileUpload?.getItemName(item) ?? item.file.name
  const index = fileUpload?.items.findIndex((candidate) => candidate.id === item.id) ?? 0
  // Stable, so a part that registers in a layout effect doesn't register again on every change.
  const registerPart = useCallback((part: FileUploadItemPartName) => {
    setPartCounts((counts) => ({ ...counts, [part]: counts[part] + 1 }))
    return () => {
      setPartCounts((counts) => ({ ...counts, [part]: counts[part] - 1 }))
    }
  }, [])
  const context = useMemo<FileUploadItemContextValue>(
    () => ({
      item,
      name,
      index,
      registerPart,
      isPartRegistered: (part) => partCounts[part] > 0,
    }),
    [item, name, index, registerPart, partCounts],
  )

  return (
    <FileUploadItemContext.Provider value={context}>
      {createElement(
        'li',
        {
          ...mergeProps(otherProps, itemProps ?? { className: 'kv-file-upload-item' }),
          ref: mergedRef,
        },
        children,
      )}
    </FileUploadItemContext.Provider>
  )
}
FileUploadItem.displayName = 'FileUpload.Item'

/** Object URL for an image preview when the Root didn't make one (`previews`). Revoked on unmount. */
function usePreviewUrl(item: FileUploadItemData | undefined): string | undefined {
  const env = useEnv()
  const [own, setOwn] = useState<{ file: File; url: string } | undefined>(undefined)
  const file = item?.file
  const previewUrl = item?.previewUrl
  useEffect(() => {
    if (file === undefined || previewUrl !== undefined || env === undefined || !isImageFile(file)) {
      return undefined
    }
    const url = env.window.URL.createObjectURL(file)
    setOwn({ file, url })
    return () => {
      env.window.URL.revokeObjectURL(url)
    }
  }, [env, file, previewUrl])
  return previewUrl ?? (own !== undefined && own.file === file ? own.url : undefined)
}

/**
 * A thumbnail beside the name, opt-in by rendering it. An image the browser can decode shows as an
 * `<img alt="">` from an object URL that is revoked when the item goes away. Other files, and
 * images that can't be decoded (HEIC), show the document icon. Both are decorative: the name is
 * right next to it. No other file content is read.
 */
export function FileUploadPreview({
  children,
  ref,
  ...otherProps
}: FileUploadPreviewProps): ReactElement | null {
  const itemContext = useItem('Preview')
  const mergedRef = useMergedRef(ref, null)
  const url = usePreviewUrl(itemContext?.item)
  const [failedUrl, setFailedUrl] = useState<string | undefined>(undefined)
  if (itemContext === null) {
    return null
  }
  const showImage = url !== undefined && failedUrl !== url

  return showImage
    ? createElement('img', {
        ...mergeProps(otherProps, { className: 'kv-file-upload-preview' }),
        src: url,
        alt: '',
        onError: () => {
          setFailedUrl(url)
        },
        ref: mergedRef,
      })
    : createElement(
        'span',
        {
          ...mergeProps(otherProps, { className: 'kv-file-upload-preview' }),
          ref: mergedRef,
        },
        children ?? <Icon name="document" size={6} />,
      )
}
FileUploadPreview.displayName = 'FileUpload.Preview'

/** The file's name, in `<bdi>`, so a Latin name stays intact on an Arabic page. Wraps anywhere. */
export function FileUploadName({
  children,
  ref,
  ...otherProps
}: FileUploadNameProps): ReactElement | null {
  const itemContext = useItem('Name')
  const mergedRef = useMergedRef(ref, null)
  if (itemContext === null) {
    return null
  }
  return createElement(
    'bdi',
    {
      ...mergeProps(otherProps, { className: 'kv-file-upload-name' }),
      ref: mergedRef,
    },
    children ?? itemContext.name,
  )
}
FileUploadName.displayName = 'FileUpload.Name'

/** The type as a short label from the extension ("PDF"), never the MIME type. */
export function FileUploadType({
  children,
  ref,
  ...otherProps
}: FileUploadTypeProps): ReactElement | null {
  const fileUpload = useRoot('Type')
  const itemContext = useItem('Type')
  const mergedRef = useMergedRef(ref, null)
  if (fileUpload === null || itemContext === null) {
    return null
  }
  return createElement(
    'span',
    {
      ...mergeProps(otherProps, { className: 'kv-file-upload-type' }),
      ref: mergedRef,
    },
    children ?? fileUpload.getItemType(itemContext.item),
  )
}
FileUploadType.displayName = 'FileUpload.Type'

/** The size in the provider's locale and decimal units ("2,4 MB"), like the limits are. */
export function FileUploadSize({
  children,
  ref,
  ...otherProps
}: FileUploadSizeProps): ReactElement | null {
  const fileUpload = useRoot('Size')
  const itemContext = useItem('Size')
  const mergedRef = useMergedRef(ref, null)
  if (fileUpload === null || itemContext === null) {
    return null
  }
  return createElement(
    'span',
    {
      ...mergeProps(otherProps, { className: 'kv-file-upload-size' }),
      ref: mergedRef,
    },
    children ?? fileUpload.getItemSize(itemContext.item),
  )
}
FileUploadSize.displayName = 'FileUpload.Size'

/**
 * The item's status as text, never colour alone (1.4.1): "Uploading, 45 %", "Uploaded", "Upload
 * failed". The item's buttons are described by it.
 */
export function FileUploadStatus({
  children,
  ref,
  ...otherProps
}: FileUploadStatusProps): ReactElement | null {
  const fileUpload = useRoot('Status')
  const itemContext = useItem('Status')
  const mergedRef = useMergedRef(ref, null)
  const registerPart = itemContext?.registerPart
  useLayoutEffect(() => registerPart?.('status'), [registerPart])
  if (fileUpload === null || itemContext === null) {
    return null
  }
  const { item } = itemContext
  const icon =
    item.status === 'complete' ? 'success' : item.status === 'cancelled' ? 'warning' : undefined

  return createElement(
    'p',
    {
      ...mergeProps(otherProps, fileUpload.getStatusProps(item)),
      ref: mergedRef,
    },
    <>
      {icon === undefined ? null : <Icon name={icon} size={4} />}
      {children ?? fileUpload.getItemStatusText(item)}
    </>,
  )
}
FileUploadStatus.displayName = 'FileUpload.Status'

function IndeterminateTrack({
  className,
  ref,
}: Pick<ComponentPropsWithRef<'span'>, 'className' | 'ref'>): ReactElement {
  return (
    <span
      className={className === undefined ? 'kv-progress-track' : `kv-progress-track ${className}`}
      aria-hidden="true"
      ref={ref}
    />
  )
}

/**
 * A native `<progress>`, named "Uploading report.pdf", rendered only while the file uploads. Its
 * value is whole percent, so a screen reader that reports changes sees at most 100. Without a known
 * size it renders no `<progress>` but a decorative `<span class="kv-progress-track" aria-hidden>`
 * (loops while the upload runs) and ignores every prop but `className`. It's never
 * announced: the percentage is visible in the Status.
 */
export function FileUploadProgress({
  ref,
  ...otherProps
}: FileUploadProgressProps): ReactElement | null {
  const fileUpload = useRoot('Progress')
  const itemContext = useItem('Progress')
  const mergedRef = useMergedRef(ref, null)
  if (fileUpload === null || itemContext === null || itemContext.item.status !== 'uploading') {
    return null
  }
  if (itemContext.item.progress === undefined) {
    return <IndeterminateTrack className={otherProps.className} ref={mergedRef} />
  }
  return createElement('progress', {
    ...mergeProps(otherProps, fileUpload.getProgressProps(itemContext.item)),
    ref: mergedRef,
  })
}
FileUploadProgress.displayName = 'FileUpload.Progress'

/**
 * Why a failed upload failed and what to do: the consumer's own message when `upload` rejected with
 * one, else a neutral sentence. Rendered only while `failed`, with the error icon and the hidden
 * "Fel:" prefix. The item's buttons are described by it.
 */
export function FileUploadItemError({
  children,
  ref,
  ...otherProps
}: FileUploadItemErrorProps): ReactElement | null {
  const fileUpload = useRoot('ItemError')
  const itemContext = useItem('ItemError')
  const field = useContext(FieldContext)
  const fieldMessages = useMessages('field', field?.messages)
  const mergedRef = useMergedRef(ref, null)
  const registerPart = itemContext?.registerPart
  const isShown = itemContext?.item.status === 'failed'
  useLayoutEffect(() => (isShown ? registerPart?.('error') : undefined), [isShown, registerPart])
  if (fileUpload === null || itemContext === null || !isShown) {
    return null
  }
  return createElement(
    'p',
    {
      ...mergeProps(otherProps, fileUpload.getItemErrorProps(itemContext.item)),
      ref: mergedRef,
    },
    <>
      <Icon name="error" size={5} />
      <span className="kv-field-error-prefix">{fieldMessages.errorPrefix}</span>{' '}
      {children ?? fileUpload.getItemErrorText(itemContext.item)}
    </>,
  )
}
FileUploadItemError.displayName = 'FileUpload.ItemError'

/** A layout wrapper for an item's buttons. */
export function FileUploadActions({
  ref,
  ...otherProps
}: FileUploadActionsProps): ReactElement | null {
  const itemContext = useItem('Actions')
  const mergedRef = useMergedRef(ref, null)
  if (itemContext === null) {
    return null
  }
  return createElement('div', {
    ...mergeProps(otherProps, { className: 'kv-file-upload-actions' }),
    ref: mergedRef,
  })
}
FileUploadActions.displayName = 'FileUpload.Actions'

type ItemButtonKind = 'cancel' | 'retry' | 'remove'

/** Internal. The shared body of the Cancel, Retry and Remove buttons. */
function ItemButton({
  kind,
  children,
  ref,
  ...otherProps
}: FileUploadItemButtonProps & { kind: ItemButtonKind }): ReactElement | null {
  const partName =
    kind === 'cancel' ? 'CancelButton' : kind === 'retry' ? 'RetryButton' : 'RemoveButton'
  const fileUpload = useRoot(partName)
  const itemContext = useItem(partName)
  const mergedRef = useMergedRef(ref, null)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  if (fileUpload === null || itemContext === null) {
    return null
  }
  const { item } = itemContext
  // One action per state, and none while the Field is disabled: a button that doesn't apply
  // isn't rendered, never `disabled`.
  if (fileUpload.isDisabled || !fileUpload.getItemActions(item)[kind]) {
    return null
  }
  const buttonProps =
    kind === 'cancel'
      ? fileUpload.getCancelButtonProps(item)
      : kind === 'retry'
        ? fileUpload.getRetryButtonProps(item)
        : fileUpload.getRemoveButtonProps(item)
  const describedBy = joinIds(
    itemContext.isPartRegistered('status') ? fileUpload.getStatusProps(item).id : undefined,
    itemContext.isPartRegistered('error') ? fileUpload.getItemErrorProps(item).id : undefined,
  )
  const visibleText =
    kind === 'cancel'
      ? fileUpload.messages.cancel
      : kind === 'retry'
        ? fileUpload.messages.retry
        : fileUpload.messages.remove

  return createElement(
    'button',
    {
      ...mergeProps(otherProps, buttonProps, focusVisibleProps),
      ...(describedBy === undefined ? {} : { 'aria-describedby': describedBy }),
      ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
      ref: mergedRef,
    },
    children ?? (
      <>
        {kind === 'remove' ? <Icon name="delete" size={5} /> : null}
        {visibleText}
      </>
    ),
  )
}

/**
 * Cancels an upload in progress. Rendered only while the file uploads, and then it's the item's
 * only button. Its name adds the file ("Cancel upload of report.pdf") and it is described by the
 * Status. When it goes away, focus goes to the item, never to another button.
 */
export function FileUploadCancelButton(props: FileUploadCancelButtonProps): ReactElement | null {
  return <ItemButton kind="cancel" {...props} />
}
FileUploadCancelButton.displayName = 'FileUpload.CancelButton'

/**
 * Tries the same file again, without the picker. Rendered for a `failed` upload (unless `upload`
 * rejected with `retryable: false`) and for a `cancelled` one. Its name adds the file ("Try again
 * with report.pdf") and it is described by the Status and the error. When it goes away, focus goes
 * to the item.
 */
export function FileUploadRetryButton(props: FileUploadRetryButtonProps): ReactElement | null {
  return <ItemButton kind="retry" {...props} />
}
FileUploadRetryButton.displayName = 'FileUpload.RetryButton'

/**
 * Removes the file from the list (cancelling it first if it uploads) and says so. Not rendered
 * while the file uploads: Cancel is the one action then. Its name adds the file ("Remove
 * report.pdf"). Focus goes to the next item, else the previous, else the Trigger: never to the
 * next Remove button, where a repeated Enter would delete a file the user didn't choose.
 */
export function FileUploadRemoveButton(props: FileUploadRemoveButtonProps): ReactElement | null {
  return <ItemButton kind="remove" {...props} />
}
FileUploadRemoveButton.displayName = 'FileUpload.RemoveButton'

/** A file upload: a native button and input, an optional drop zone, a checked list. */
export const FileUpload = {
  Root: FileUploadRoot,
  Trigger: FileUploadTrigger,
  Input: FileUploadInput,
  DropZone: FileUploadDropZone,
  DropHint: FileUploadDropHint,
  Limits: FileUploadLimits,
  Rejections: FileUploadRejections,
  Summary: FileUploadSummary,
  List: FileUploadList,
  Item: FileUploadItem,
  Preview: FileUploadPreview,
  Name: FileUploadName,
  Type: FileUploadType,
  Size: FileUploadSize,
  Status: FileUploadStatus,
  Progress: FileUploadProgress,
  ItemError: FileUploadItemError,
  Actions: FileUploadActions,
  CancelButton: FileUploadCancelButton,
  RetryButton: FileUploadRetryButton,
  RemoveButton: FileUploadRemoveButton,
} as const
