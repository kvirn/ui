'use client'
import { useContext, useEffect, useRef } from 'react'
import type { ElementType, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import type { AsComponent } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { DialogContext, useDialogAnnouncer } from '../dialog/dialog-context.ts'
import {
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '../dialog/dialog.tsx'
import type {
  DialogActionsProps,
  DialogBodyProps,
  DialogDescriptionProps,
  DialogPopupProps,
  DialogTitleProps,
  DialogTriggerProps,
} from '../dialog/dialog.tsx'
import { useModalDialog } from '../dialog/use-dialog.ts'
import type { UseAlertDialogOptions } from './use-alert-dialog.ts'

export type { DialogChangeDetails as AlertDialogChangeDetails } from '../dialog/dialog.tsx'
export type { DialogChangeReason as AlertDialogChangeReason } from '../dialog/dialog.tsx'

export interface AlertDialogRootProps extends UseAlertDialogOptions {
  children?: ReactNode
}

export type AlertDialogTriggerProps = DialogTriggerProps
export type AlertDialogPopupProps = DialogPopupProps
export type AlertDialogTitleProps = DialogTitleProps
export type AlertDialogDescriptionProps = DialogDescriptionProps
export type AlertDialogBodyProps = DialogBodyProps
export type AlertDialogActionsProps = DialogActionsProps

/** `as` is a component that renders a button, such as `as={Button}`; its props are plain props of the close. */
export type AlertDialogCloseProps<Component extends ElementType = 'button'> = AsComponent<Component>

const withClass = (own: string, className: string | undefined) =>
  className === undefined ? own : `${own} ${className}`

/**
 * Owns the open state of a modal alert dialog (contract: alert-dialog.a11y.md): a message that
 * needs an answer. It is a Dialog with `role="alertdialog"` that a press on the backdrop never
 * closes. Escape reports `'escape'`: answer it with the safe outcome, and keep the dialog open to
 * refuse. Pass `initialFocusRef` for the least destructive or the primary action. Its actions are
 * your own buttons, which close it by setting `open` (or with `onOpenChange` in controlled mode).
 *
 * @example
 * <AlertDialog.Root open={isWarning} onOpenChange={onChange} initialFocusRef={keepRef}>
 *   <AlertDialog.Popup>
 *     <AlertDialog.Title>Vill du ta bort utkastet?</AlertDialog.Title>
 *     <AlertDialog.Description>Det går inte att ångra.</AlertDialog.Description>
 *     <AlertDialog.Actions>…</AlertDialog.Actions>
 *   </AlertDialog.Popup>
 * </AlertDialog.Root>
 */
export function AlertDialogRoot({ children, ...options }: AlertDialogRootProps): ReactElement {
  const dialog = useModalDialog(options, 'alertdialog')
  const announcer = useDialogAnnouncer(dialog.isOpen)
  return (
    <DialogContext.Provider value={{ dialog, isShown: dialog.isShown, announcer }}>
      {children}
    </DialogContext.Provider>
  )
}
AlertDialogRoot.displayName = 'AlertDialog.Root'

/** The optional `<button>` that opens the alert dialog, with `aria-haspopup="dialog"` and `data-open`. */
export function AlertDialogTrigger({ className, ...otherProps }: DialogTriggerProps): ReactElement {
  return (
    <DialogTrigger {...otherProps} className={withClass('kv-alert-dialog-trigger', className)} />
  )
}
AlertDialogTrigger.displayName = 'AlertDialog.Trigger'

/** The popup: a native `<dialog role="alertdialog">` shown with `showModal()`. See `Dialog.Popup`. */
export function AlertDialogPopup({ className, ...otherProps }: DialogPopupProps): ReactElement {
  return <DialogPopup {...otherProps} className={withClass('kv-alert-dialog', className)} />
}
AlertDialogPopup.displayName = 'AlertDialog.Popup'

/** The title, an `<h2>` that names the dialog. See `Dialog.Title`. */
export function AlertDialogTitle({ className, ...otherProps }: DialogTitleProps): ReactElement {
  return <DialogTitle {...otherProps} className={withClass('kv-alert-dialog-title', className)} />
}
AlertDialogTitle.displayName = 'AlertDialog.Title'

/** The description, a `<p>` with the consequence. Required: it is read out with the title. */
export function AlertDialogDescription({
  className,
  ...otherProps
}: DialogDescriptionProps): ReactElement {
  return (
    <DialogDescription
      {...otherProps}
      className={withClass('kv-alert-dialog-description', className)}
    />
  )
}
AlertDialogDescription.displayName = 'AlertDialog.Description'

/** The content between the description and the actions. */
export function AlertDialogBody({ className, ...otherProps }: DialogBodyProps): ReactElement {
  return <DialogBody {...otherProps} className={withClass('kv-alert-dialog-body', className)} />
}
AlertDialogBody.displayName = 'AlertDialog.Body'

/** The actions: your buttons, the primary one first, with `initialFocusRef` on the safe one. */
export function AlertDialogActions({ className, ...otherProps }: DialogActionsProps): ReactElement {
  return (
    <DialogActions {...otherProps} className={withClass('kv-alert-dialog-actions', className)} />
  )
}
AlertDialogActions.displayName = 'AlertDialog.Actions'

/**
 * A plain `<button type="button">` that closes the alert dialog (reason `'close-press'`) and
 * returns focus. Its children are its name: say what it does ("Behåll utkastet"). It has no icon
 * and no default text, and the consumer styles it. It is an ordinary action, so it can also be
 * the `initialFocusRef`.
 */
export function AlertDialogClose<Component extends ElementType = 'button'>(
  props: AlertDialogCloseProps<Component>,
): ReactElement
export function AlertDialogClose({
  as,
  ref,
  ...otherProps
}: AlertDialogCloseProps<'button'>): ReactElement {
  const context = useContext(DialogContext)
  const elementRef = useRef<HTMLElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  useEffect(() => {
    const element = elementRef.current
    if (
      element !== null &&
      (element.textContent ?? '').trim() === '' &&
      !element.hasAttribute('aria-label') &&
      !element.hasAttribute('aria-labelledby')
    ) {
      warnOnce(
        'alert-dialog-close-without-name',
        'An AlertDialog.Close has no name: it has no default text and no icon. Give it children that say what it does ("Behåll utkastet"), or aria-label (WCAG 4.1.2, 2.5.3).',
      )
    }
  })
  useEffect(() => {
    if (context === null) {
      warnOnce(
        'alert-dialog-close-outside-root',
        'An AlertDialog.Close is outside an AlertDialog.Root, so it does nothing. Put it inside <AlertDialog.Root>.',
      )
    }
  }, [context])
  return renderPart({
    as,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, {
        className: 'kv-alert-dialog-close',
        type: 'button' as const,
        onClick: context?.dialog.closeProps.onClick,
      }),
      ref: mergedRef,
    },
  })
}
AlertDialogClose.displayName = 'AlertDialog.Close'

/** A modal alert dialog: a message that needs an answer, and that a press outside never dismisses. */
export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Popup: AlertDialogPopup,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Body: AlertDialogBody,
  Actions: AlertDialogActions,
  Close: AlertDialogClose,
} as const
