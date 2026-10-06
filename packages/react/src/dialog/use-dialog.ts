import { createScrollLock } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent, RefCallback, RefObject, SyntheticEvent } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useDismissableLayer } from '../popup/use-dismissable-layer.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'
import { ParentDialogContext } from './dialog-context.ts'
import { focusFirstAvailable, useFocusReturn } from './focus-return.ts'

/** Why the dialog opened or closed, in the second argument of `onOpenChange`. */
export type DialogChangeReason =
  | 'trigger-press'
  | 'close-press'
  | 'escape'
  | 'outside-press'
  | 'native-close'

export interface DialogChangeDetails {
  reason: DialogChangeReason
  /** The native event behind the change. */
  event: Event
}

export interface UseDialogOptions {
  /** Controlled: whether the dialog is open. Pair it with `onOpenChange`. */
  open?: boolean | undefined
  /** Uncontrolled: whether the dialog starts open. Default `false`. */
  defaultOpen?: boolean | undefined
  /**
   * Called when the user opens or closes the dialog. It only reports: with `open` set, you change
   * `open` yourself, and if you keep it open the dialog stays. `details.reason` says why:
   * `'trigger-press'`, `'close-press'`, `'escape'`, `'outside-press'`, or `'native-close'` (the
   * browser closed it, for example a `<form method="dialog">`).
   */
  onOpenChange?: ((open: boolean, details: DialogChangeDetails) => void) | undefined
  /** Where focus goes when the dialog opens. Default: the first tabbable that is not Close, else the title. */
  initialFocusRef?: RefObject<HTMLElement | null> | undefined
  /** Where focus goes when the dialog closes. Default: the trigger, else what had focus before it opened. */
  finalFocusRef?: RefObject<HTMLElement | null> | undefined
  /**
   * Whether a press on the backdrop closes the dialog (reason `'outside-press'`). Default `false`:
   * a stray tap or a tremor must not lose what someone typed.
   */
  dismissOnOutsidePress?: boolean | undefined
  /** Overrides for this dialog's strings: `close`, the name of an icon-only close button. */
  messages?: Partial<KvirnMessages['dialog']> | undefined
}

/** Spread on the element that opens the dialog: a `<button>`. */
export interface DialogTriggerPartProps {
  className: 'kv-dialog-trigger'
  type: 'button'
  'aria-haspopup': 'dialog'
  'data-open': '' | undefined
  ref: RefObject<HTMLButtonElement | null>
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

/** Spread on the popup: a `<dialog>`. Name it with a title (`aria-labelledby`) or `aria-label`. */
export interface DialogPopupPartProps {
  className: 'kv-dialog'
  role: 'dialog' | 'alertdialog'
  'aria-modal': true | undefined
  'aria-labelledby': string | undefined
  'aria-describedby': string | undefined
  'data-open': '' | undefined
  ref: RefObject<HTMLDialogElement | null>
  onCancel: (event: SyntheticEvent<HTMLDialogElement>) => void
  onClose: (event: SyntheticEvent<HTMLDialogElement>) => void
}

/** Spread on the title: an `<h2>`. It takes focus when nothing better does, so it has `tabindex="-1"`. */
export interface DialogTitlePartProps {
  className: 'kv-dialog-title'
  id: string
  tabIndex: -1
  ref: RefObject<HTMLHeadingElement | null>
}

/** Spread on the description: a `<p>`. */
export interface DialogDescriptionPartProps {
  className: 'kv-dialog-description'
  id: string
}

/** Spread on a button inside the popup that closes it. Drop `aria-label` when it has visible text. */
export interface DialogClosePartProps {
  className: 'kv-dialog-close'
  type: 'button'
  /** The resolved `dialog.close` message, for an icon-only button. */
  'aria-label': string
  ref: RefCallback<HTMLButtonElement>
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

export interface UseDialogResult {
  isOpen: boolean
  triggerProps: DialogTriggerPartProps
  popupProps: DialogPopupPartProps
  titleProps: DialogTitlePartProps
  descriptionProps: DialogDescriptionPartProps
  closeProps: DialogClosePartProps
  /** Call it from an effect in your title element: `aria-labelledby` appears while one is registered. Returns the cleanup. */
  registerTitle: () => () => void
  /** Call it from an effect in your description element: `aria-describedby` appears while one is registered. Returns the cleanup. */
  registerDescription: () => () => void
}

/** Ref-counted across every dialog on the page, so a nested one locks the page once. Pure state, no DOM. */
const scrollLock = createScrollLock()

const scrollLockAttribute = 'data-kv-scroll-locked'

const tabbableSelector = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',')

function isParentDialogShown(dialog: HTMLDialogElement): boolean {
  const parentDialog = dialog.parentElement?.closest('dialog')
  return parentDialog === null || parentDialog === undefined || parentDialog.open
}

function showModalAndFocus(
  dialog: HTMLDialogElement,
  role: 'dialog' | 'alertdialog',
  initialFocus: HTMLElement | null | undefined,
  title: HTMLElement | null,
  closeElements: ReadonlySet<HTMLElement>,
  beforeShow: () => void,
): void {
  beforeShow()
  dialog.showModal()
  const candidates = Array.from(dialog.querySelectorAll<HTMLElement>(tabbableSelector))
  const firstTabbable = candidates.find(
    (candidate) => !closeElements.has(candidate) && isTabbable(candidate),
  )
  // An alert dialog with no chosen start begins at its message: the first control may be the destructive one.
  const fallbacks = role === 'alertdialog' ? [title, firstTabbable] : [firstTabbable, title]
  focusFirstAvailable([initialFocus, ...fallbacks])
}

function isTabbable(element: HTMLElement): boolean {
  return (
    element.tabIndex >= 0 &&
    !element.matches(':disabled') &&
    element.closest('[inert]') === null &&
    element.getClientRects().length > 0
  )
}

function useRegistration(): [boolean, () => () => void, RefObject<number>] {
  const countRef = useRef(0)
  const [count, setCount] = useState(0)
  const register = useCallback(() => {
    countRef.current += 1
    setCount((previous) => previous + 1)
    return () => {
      countRef.current -= 1
      setCount((previous) => previous - 1)
    }
  }, [])
  return [count > 0, register, countRef]
}

/** Internal. The hook behind `useDialog` and `useAlertDialog`: they differ in role and outside-press rule only. */
export function useModalDialog(
  {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    initialFocusRef,
    finalFocusRef,
    dismissOnOutsidePress = false,
    messages,
  }: UseDialogOptions,
  role: 'dialog' | 'alertdialog',
): UseDialogResult & { isShown: boolean } {
  const env = useEnv()
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLDialogElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  /** Every Close button: initial focus skips all of them, however many the dialog has. */
  const closeElementsRef = useRef(new Set<HTMLElement>())
  const closeRef = useCallback((element: HTMLButtonElement | null) => {
    const closeElements = closeElementsRef.current
    for (const known of closeElements) {
      if (!known.isConnected) {
        closeElements.delete(known)
      }
    }
    if (element !== null) {
      closeElements.add(element)
    }
  }, [])
  /** How many `close` events our own `close()` calls are still to cause: they are not the browser's doing. */
  const programmaticCloseRef = useRef(0)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  /** Bumped when the browser closed the dialog, so the effect shows it again if the owner kept it open. */
  const [nativeCloseCount, setNativeCloseCount] = useState(0)
  const [hasTitle, registerTitle, titleCountRef] = useRegistration()
  const [hasDescription, registerDescription, descriptionCountRef] = useRegistration()
  const closeMessages = useMessages('dialog', messages)
  const isControlled = openProp !== undefined
  // Content stays mounted while a dialog is closed, so a dialog inside another does not unmount
  // with it: it is closed whenever its parent is, and the browser's close() runs for it first.
  const parent = useContext(ParentDialogContext)
  const parentIsOpen = parent?.isOpen ?? true
  if (!parentIsOpen && !isControlled && uncontrolledOpen) {
    setUncontrolledOpen(false)
  }
  /** A dialog inside another is shown, and joins the layer stack, only after its parent is. */
  const [hasShownAfterParent, setHasShownAfterParent] = useState(false)
  const isOpen = (isControlled ? openProp : uncontrolledOpen) && parentIsOpen
  if (!isOpen && hasShownAfterParent) {
    setHasShownAfterParent(false)
  }
  const isShown = isOpen && (parent === null || hasShownAfterParent)

  const change = (next: boolean, details: DialogChangeDetails) => {
    if (next === isOpen) {
      return
    }
    if (!isControlled) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next, details)
  }

  const initialFocusRefLatest = useRef(initialFocusRef)
  useLayoutEffect(() => {
    initialFocusRefLatest.current = initialFocusRef
  })

  const { captureOpener } = useFocusReturn({
    active: isOpen,
    scopeRef: popupRef,
    triggerRef,
    finalFocusRef,
    onLost: () =>
      parentIsOpen &&
      warnOnce(
        'dialog-return-focus-lost',
        'A dialog closed and nothing could take focus back: it has no Trigger in the document, no finalFocusRef, and no element had focus before it opened, so focus is lost (WCAG 2.4.3). Render a Trigger, or pass finalFocusRef.',
      ),
  })

  useLayoutEffect(() => {
    const dialog = popupRef.current
    if (dialog === null || env === undefined) {
      return
    }
    if (!isOpen) {
      if (dialog.open) {
        programmaticCloseRef.current += 1
        dialog.close()
      }
      return
    }
    // Shown after its parent: the layout effects of a dialog inside run first, and a modal
    // shown under its parent would end up below it in the top layer. The passive effect retries.
    if (!dialog.open && isParentDialogShown(dialog)) {
      showModalAndFocus(
        dialog,
        role,
        initialFocusRefLatest.current?.current,
        titleRef.current,
        closeElementsRef.current,
        captureOpener,
      )
    }
  }, [isOpen, env, nativeCloseCount, role, captureOpener])

  const parentIsShown = parent?.isShown ?? true
  useEffect(() => {
    const dialog = popupRef.current
    if (!isOpen || dialog === null || env === undefined || !parentIsShown) {
      return
    }
    if (!dialog.open && isParentDialogShown(dialog)) {
      showModalAndFocus(
        dialog,
        role,
        initialFocusRefLatest.current?.current,
        titleRef.current,
        closeElementsRef.current,
        captureOpener,
      )
    }
    if (dialog.open) {
      setHasShownAfterParent(true)
    }
  }, [isOpen, env, nativeCloseCount, role, parentIsShown, captureOpener])

  useEffect(() => {
    if (!isOpen || env === undefined) {
      return
    }
    const root = env.document.documentElement
    if (scrollLock.acquire(id)) {
      root.setAttribute(scrollLockAttribute, '')
    }
    return () => {
      if (scrollLock.release(id)) {
        root.removeAttribute(scrollLockAttribute)
      }
    }
  }, [isOpen, env, id])

  useDismissableLayer({
    open: isShown,
    ref: popupRef,
    backdrop: true,
    dismissOnOutsidePress: role === 'dialog' && dismissOnOutsidePress,
    onDismiss: (reason, event) => change(false, { reason, event }),
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const popup = popupRef.current
    const hasConsumerName =
      popup?.hasAttribute('aria-label') === true || popup?.hasAttribute('aria-labelledby') === true
    if (!hasConsumerName && titleCountRef.current === 0) {
      warnOnce(
        'dialog-without-name',
        'A dialog has no accessible name. Its role is "dialog" or "alertdialog", which needs one (WCAG 4.1.2): render a Title, or give the popup aria-label or aria-labelledby.',
      )
    }
    if (role === 'alertdialog') {
      if (descriptionCountRef.current === 0) {
        warnOnce(
          'alert-dialog-without-description',
          'An AlertDialog has no Description. An alert dialog is read out with the message that needs an answer, so it needs one (APG Alert Dialog).',
        )
      }
      if (initialFocusRefLatest.current === undefined) {
        warnOnce(
          'alert-dialog-without-initial-focus',
          'An AlertDialog has no initialFocusRef. Focus should start on the least destructive or the primary action, not on the first control by chance (APG Alert Dialog).',
        )
      }
    }
  }, [isOpen, role, titleCountRef, descriptionCountRef])

  return {
    isOpen,
    isShown,
    triggerProps: {
      className: 'kv-dialog-trigger',
      type: 'button',
      'aria-haspopup': 'dialog',
      'data-open': isOpen ? '' : undefined,
      ref: triggerRef,
      onClick: (event) => {
        if (!event.defaultPrevented) {
          change(true, { reason: 'trigger-press', event: event.nativeEvent })
        }
      },
    },
    popupProps: {
      className: 'kv-dialog',
      role,
      'aria-modal': isOpen ? true : undefined,
      'aria-labelledby': hasTitle ? titleId : undefined,
      'aria-describedby': hasDescription ? descriptionId : undefined,
      'data-open': isOpen ? '' : undefined,
      ref: popupRef,
      // `cancel` and `close` bubble through React's tree: a nested dialog's must not reach this one.
      onCancel: (event) => {
        if (event.target !== event.currentTarget) {
          return
        }
        // Escape that no key handler took (a close request from the system): the owner decides.
        event.preventDefault()
        change(false, { reason: 'escape', event: event.nativeEvent })
      },
      onClose: (event) => {
        if (event.target !== event.currentTarget) {
          return
        }
        if (programmaticCloseRef.current > 0) {
          programmaticCloseRef.current -= 1
          return
        }
        change(false, { reason: 'native-close', event: event.nativeEvent })
        setNativeCloseCount((previous) => previous + 1)
      },
    },
    titleProps: { className: 'kv-dialog-title', id: titleId, tabIndex: -1, ref: titleRef },
    descriptionProps: { className: 'kv-dialog-description', id: descriptionId },
    closeProps: {
      className: 'kv-dialog-close',
      type: 'button',
      'aria-label': closeMessages.close,
      ref: closeRef,
      onClick: (event) => {
        if (!event.defaultPrevented) {
          change(false, { reason: 'close-press', event: event.nativeEvent })
        }
      },
    },
    registerTitle,
    registerDescription,
  }
}

/**
 * A modal dialog's props for your own elements (contract: dialog.a11y.md): a trigger button, a
 * native `<dialog>` shown with `showModal()`, a title, a description and a close button.
 *
 * - **Native modal.** The popup is in the top layer, the page behind is inert, and Tab leaves to
 *   the browser's own UI before wrapping (an approved APG deviation). Nothing needs a portal.
 * - **Focus** moves in on open: `initialFocusRef`, else the first tabbable that is not Close, else
 *   the title. It returns to `finalFocusRef`, the trigger, or what had focus before, never `body`.
 * - **Escape** closes the innermost layer only. A press on the backdrop closes the dialog only with
 *   `dismissOnOutsidePress`. A controlled owner can refuse any of it.
 * - **Name it:** render the title (call `registerTitle` from an effect and spread `titleProps`), or
 *   give the popup `aria-label`. A closed `<dialog>` is hidden by the browser, so its children can
 *   stay mounted: typed values are kept until it reopens.
 * - **Scroll lock** is `data-kv-scroll-locked` on `<html>`, ref-counted. The theme styles it: without
 *   `@kvirn-ui/theme`, add your own CSS (`overflow: hidden`).
 * - **Nesting:** only `Dialog.Popup` tells a dialog inside it that its parent closed. With this hook
 *   alone, close an inner dialog yourself when the outer one closes.
 * - The provider's live regions are inert while a modal is open: for in-dialog announcements use
 *   `Dialog.Root`, which hosts its own, or render your own region.
 *
 * @example
 * const dialog = useDialog()
 * <button {...dialog.triggerProps}>Ändra</button>
 * <dialog {...dialog.popupProps} aria-label="Ändra telefonnummer">…</dialog>
 */
export function useDialog(options: UseDialogOptions = {}): UseDialogResult {
  return useModalDialog(options, 'dialog')
}
