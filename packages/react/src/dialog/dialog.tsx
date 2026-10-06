'use client'
import { useContext, useEffect, useLayoutEffect, useMemo } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { Announcer } from '../announcer/announcer.tsx'
import { AnnouncerContext } from '../announcer/announcer-context.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useMessages } from '../provider/use-messages.ts'
import { renderPart } from '../render/render-part.ts'
import { ToolbarContext } from '../toolbar/toolbar-context.ts'
import type { RenderProp } from '../render/render-part.ts'
import { DialogContext, ParentDialogContext, useDialogAnnouncer } from './dialog-context.ts'
import { useModalDialog } from './use-dialog.ts'
import type { UseDialogOptions } from './use-dialog.ts'
import type { KvirnMessages } from '@kvirn-ui/i18n'

export type { DialogChangeDetails, DialogChangeReason } from './use-dialog.ts'

/** What `render` receives as its second argument, for every part. */
export interface DialogState {
  isOpen: boolean
}

export interface DialogRootProps extends UseDialogOptions {
  children?: ReactNode
}

export interface DialogTriggerProps extends ComponentPropsWithRef<'button'> {
  render?: RenderProp<ComponentPropsWithRef<'button'>, DialogState> | undefined
}

export interface DialogPopupProps extends ComponentPropsWithRef<'dialog'> {
  render?: RenderProp<ComponentPropsWithRef<'dialog'>, DialogState> | undefined
}

export interface DialogTitleProps extends ComponentPropsWithRef<'h2'> {
  render?: RenderProp<ComponentPropsWithRef<'h2'>, DialogState> | undefined
}

export interface DialogDescriptionProps extends ComponentPropsWithRef<'p'> {
  render?: RenderProp<ComponentPropsWithRef<'p'>, DialogState> | undefined
}

export interface DialogBodyProps extends ComponentPropsWithRef<'div'> {
  render?: RenderProp<ComponentPropsWithRef<'div'>, DialogState> | undefined
}

export interface DialogActionsProps extends ComponentPropsWithRef<'div'> {
  render?: RenderProp<ComponentPropsWithRef<'div'>, DialogState> | undefined
}

export interface DialogCloseProps extends ComponentPropsWithRef<'button'> {
  /** Overrides for this button's name: `close`. Used when it has no visible text. */
  messages?: Partial<KvirnMessages['dialog']> | undefined
  render?: RenderProp<ComponentPropsWithRef<'button'>, DialogState> | undefined
}

function useOutsideRootWarning(isOutside: boolean, part: string): void {
  useEffect(() => {
    if (isOutside) {
      warnOnce(
        `dialog-${part.toLowerCase()}-outside-root`,
        `A Dialog.${part} is outside a Dialog.Root, so it does nothing. Put it inside <Dialog.Root>.`,
      )
    }
  }, [isOutside, part])
}

/**
 * Owns the open state of a modal dialog (contract: dialog.a11y.md). It renders no element: put an
 * optional `Dialog.Trigger` and a `Dialog.Popup` inside it. Open it from state with `open` and
 * `onOpenChange`, or let it keep its own with `defaultOpen`. It also hosts the live regions for
 * announcements inside the dialog, because the provider's are inert while a modal is open.
 *
 * @example
 * <Dialog.Root>
 *   <Dialog.Trigger>Ändra telefonnummer</Dialog.Trigger>
 *   <Dialog.Popup>
 *     <Dialog.Title>Ändra telefonnummer</Dialog.Title>
 *     <Dialog.Description>Vi skickar en kod med sms.</Dialog.Description>
 *     <Dialog.Close>Avbryt</Dialog.Close>
 *   </Dialog.Popup>
 * </Dialog.Root>
 */
export function DialogRoot({ children, ...options }: DialogRootProps): ReactElement {
  const dialog = useModalDialog(options, 'dialog')
  const announcer = useDialogAnnouncer(dialog.isOpen)
  return (
    <DialogContext.Provider value={{ dialog, isShown: dialog.isShown, announcer }}>
      {children}
    </DialogContext.Provider>
  )
}
DialogRoot.displayName = 'Dialog.Root'

/**
 * The `<button>` that opens the dialog, with `aria-haspopup="dialog"` and `data-open` while it is
 * open. Optional: a dialog opened by state has none, and then focus returns to what had it before.
 */
export function DialogTrigger({ render, ref, ...otherProps }: DialogTriggerProps): ReactElement {
  const context = useContext(DialogContext)
  useOutsideRootWarning(context === null, 'Trigger')
  const mergedRef = useMergedRef(ref, context?.dialog.triggerProps.ref ?? null)
  return renderPart({
    render,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, context?.dialog.triggerProps ?? { type: 'button' as const }),
      ref: mergedRef,
    },
    state: { isOpen: context?.dialog.isOpen ?? false },
  })
}
DialogTrigger.displayName = 'Dialog.Trigger'

/**
 * The popup: a native `<dialog>` shown with `showModal()`, so it is in the top layer, the page
 * behind it is inert and no portal or `z-index` is needed. It is always rendered, and the browser hides it
 * while closed, with its children mounted: typed values are kept until the dialog reopens. **Name it** with a `Dialog.Title`, or `aria-label`. Escape closes it,
 * a press on the backdrop only with `dismissOnOutsidePress`, and focus returns to the trigger.
 */
export function DialogPopup({
  render,
  ref,
  children,
  ...otherProps
}: DialogPopupProps): ReactElement {
  const context = useContext(DialogContext)
  useOutsideRootWarning(context === null, 'Popup')
  const mergedRef = useMergedRef(ref, context?.dialog.popupProps.ref ?? null)
  const isOpen = context?.dialog.isOpen ?? false
  const isShown = context?.isShown ?? false
  const parentValue = useMemo(() => ({ isOpen, isShown }), [isOpen, isShown])
  const popup = renderPart({
    render,
    defaultElement: 'dialog',
    partProps: {
      ...mergeProps(otherProps, context?.dialog.popupProps ?? {}),
      ref: mergedRef,
      children: (
        <>
          {children}
          {isOpen && context !== null ? <Announcer announcer={context.announcer} /> : null}
        </>
      ),
    },
    state: { isOpen },
  })
  // The popup holds a form or other content, never toolbar items: a Dialog trigger can be a
  // Toolbar.Item, which would put the popup in the toolbar's React tree.
  return (
    <ToolbarContext.Provider value={null}>
      {context === null ? (
        popup
      ) : (
        <ParentDialogContext.Provider value={parentValue}>
          <AnnouncerContext.Provider value={context.announcer}>{popup}</AnnouncerContext.Provider>
        </ParentDialogContext.Provider>
      )}
    </ToolbarContext.Provider>
  )
}
DialogPopup.displayName = 'Dialog.Popup'

/**
 * The dialog's title, an `<h2>` (change it with `render`) that names the dialog. It has
 * `tabindex="-1"` and takes focus on open when nothing in the dialog is a better start, so a
 * dialog that is mostly reading starts at its beginning. It is never a Tab stop.
 */
export function DialogTitle({ render, ref, ...otherProps }: DialogTitleProps): ReactElement {
  const context = useContext(DialogContext)
  useOutsideRootWarning(context === null, 'Title')
  const mergedRef = useMergedRef(ref, context?.dialog.titleProps.ref ?? null)
  const registerTitle = context?.dialog.registerTitle
  useLayoutEffect(() => registerTitle?.(), [registerTitle])
  return renderPart({
    render,
    defaultElement: 'h2',
    partProps: {
      ...mergeProps(otherProps, context?.dialog.titleProps ?? {}),
      ref: mergedRef,
    },
    state: { isOpen: context?.dialog.isOpen ?? false },
  })
}
DialogTitle.displayName = 'Dialog.Title'

/** The dialog's description, a `<p>`: one or two sentences with the consequence. It is the popup's `aria-describedby`. */
export function DialogDescription({
  render,
  ref,
  ...otherProps
}: DialogDescriptionProps): ReactElement {
  const context = useContext(DialogContext)
  useOutsideRootWarning(context === null, 'Description')
  const mergedRef = useMergedRef(ref, null)
  const registerDescription = context?.dialog.registerDescription
  useLayoutEffect(() => registerDescription?.(), [registerDescription])
  return renderPart({
    render,
    defaultElement: 'p',
    partProps: {
      ...mergeProps(otherProps, context?.dialog.descriptionProps ?? {}),
      ref: mergedRef,
    },
    state: { isOpen: context?.dialog.isOpen ?? false },
  })
}
DialogDescription.displayName = 'Dialog.Description'

/** The dialog's content: fields, prose or an Alert. A `<div>` with the class `kv-dialog-body`. */
export function DialogBody({ render, ref, ...otherProps }: DialogBodyProps): ReactElement {
  const context = useContext(DialogContext)
  useOutsideRootWarning(context === null, 'Body')
  const mergedRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, { className: 'kv-dialog-body' }), ref: mergedRef },
    state: { isOpen: context?.dialog.isOpen ?? false },
  })
}
DialogBody.displayName = 'Dialog.Body'

/** The dialog's actions: your buttons, the primary one first. A `<div>` with the class `kv-dialog-actions`. */
export function DialogActions({ render, ref, ...otherProps }: DialogActionsProps): ReactElement {
  const context = useContext(DialogContext)
  useOutsideRootWarning(context === null, 'Actions')
  const mergedRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: { ...mergeProps(otherProps, { className: 'kv-dialog-actions' }), ref: mergedRef },
    state: { isOpen: context?.dialog.isOpen ?? false },
  })
}
DialogActions.displayName = 'Dialog.Actions'

/**
 * A `<button>` that closes the dialog (reason `'close-press'`). With no children it is an icon
 * button named by `dialog.close` ("Stäng dialogrutan"); with children, they are its visible name.
 * Put it after the Title in the DOM. Focus goes back to where it was before.
 */
export function DialogClose({
  messages,
  render,
  ref,
  children,
  ...otherProps
}: DialogCloseProps): ReactElement {
  const context = useContext(DialogContext)
  useOutsideRootWarning(context === null, 'Close')
  const ownMessages = useMessages('dialog', messages)
  const mergedRef = useMergedRef(ref, context?.dialog.closeProps.ref ?? null)
  const name =
    messages?.close === undefined && context !== null
      ? context.dialog.closeProps['aria-label']
      : ownMessages.close
  // `null`, `false` and `''` render nothing, so they leave the icon and the name in place.
  const hasVisibleText =
    children !== undefined && children !== null && children !== false && children !== ''
  const closeProps = context?.dialog.closeProps
  const ownProps =
    closeProps === undefined
      ? { type: 'button' as const }
      : { className: closeProps.className, type: closeProps.type, onClick: closeProps.onClick }
  return renderPart({
    render,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(hasVisibleText ? ownProps : { ...ownProps, 'aria-label': name }, otherProps),
      ref: mergedRef,
      children: hasVisibleText ? children : <Icon name="close" />,
    },
    state: { isOpen: context?.dialog.isOpen ?? false },
  })
}
DialogClose.displayName = 'Dialog.Close'

/** A modal dialog: a trigger that opens a native `<dialog>` the page behind cannot reach. */
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Popup: DialogPopup,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Actions: DialogActions,
  Close: DialogClose,
} as const
