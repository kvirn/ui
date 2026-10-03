import { useId, useMemo, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent, RefObject } from 'react'
import { isInsideElement, useDismissableLayer } from '../popup/use-dismissable-layer.ts'
import { usePopup } from '../popup/use-popup.ts'
import type { Placement, PopupPartProps } from '../popup/use-popup.ts'
import { useEnv } from '../provider/use-env.ts'

/** Why the popover opened or closed, in the second argument of `onOpenChange`. */
export type PopoverChangeReason =
  | 'trigger-press'
  | 'close-press'
  | 'escape'
  | 'outside-press'
  | 'light-dismiss'

export interface PopoverChangeDetails {
  reason: PopoverChangeReason
  /** The native event behind the change. */
  event: Event
}

export interface UsePopoverOptions {
  /** Controlled: whether the popover is open. Pair it with `onOpenChange`. */
  open?: boolean | undefined
  /** Uncontrolled: whether the popover starts open. Default `false`. */
  defaultOpen?: boolean | undefined
  /**
   * Called when the user opens or closes the popover. It only reports: with `open` set, you
   * change `open` yourself. `details.reason` says why: `'trigger-press'`, `'close-press'`,
   * `'escape'`, `'outside-press'`, or `'light-dismiss'` (the platform hid it, for example
   * because another auto popover opened).
   */
  onOpenChange?: ((open: boolean, details: PopoverChangeDetails) => void) | undefined
  /** Where the popup goes when there is room. Default `'bottom-start'`. It flips when it doesn't fit. */
  placement?: Placement | undefined
  /** The gap between the trigger and the popup, in pixels. Default 4. */
  offset?: number | undefined
  /** The space kept to the edge of the viewport, in pixels. Default 8. */
  padding?: number | undefined
  /** Make the popup as wide as the trigger. Default `false`. */
  matchAnchorWidth?: boolean | undefined
}

/** Spread on the element that opens the popover: a `<button>`. */
export interface PopoverTriggerPartProps {
  className: 'kv-popover-trigger'
  type: 'button'
  'aria-expanded': boolean
  'aria-controls': string
  'aria-haspopup': 'dialog'
  'data-open': '' | undefined
  ref: RefObject<HTMLButtonElement | null>
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

/** Spread on the popup: a `<div>` with `role="dialog"`, which you name with `aria-label` or `aria-labelledby`. */
export interface PopoverPopupPartProps extends PopupPartProps {
  className: 'kv-popover-popup'
  id: string
  role: 'dialog'
  ref: RefObject<HTMLDivElement | null>
}

/** Spread on a button inside the popup that closes it. */
export interface PopoverClosePartProps {
  className: 'kv-popover-close'
  type: 'button'
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

export interface UsePopoverResult {
  isOpen: boolean
  /** The placement in use. It differs from the one asked for when the popup flipped. */
  placement: Placement
  triggerProps: PopoverTriggerPartProps
  popupProps: PopoverPopupPartProps
  closeProps: PopoverClosePartProps
}

/**
 * A popover's props for your own elements (contract: popover.a11y.md): a trigger
 * button, a popup in the top layer and an optional close button.
 *
 * - The trigger gets `aria-expanded`, `aria-controls` and `aria-haspopup="dialog"`, and toggles
 *   the popup on every press and on Enter and Space.
 * - The popup is `popover="auto"` and `role="dialog"`. **Name it** with `aria-label` or
 *   `aria-labelledby` (4.1.2). Render it right after the trigger, so Tab goes into it.
 * - **Escape and a press outside close it**, and focus returns to the trigger if it was in the
 *   popup (or lost). A press on the trigger itself is a toggle, not an outside press.
 * - **Opening never moves focus.** Move it yourself, in an effect after `isOpen` is true, if the pattern calls for it.
 * - No inert page behind it: a popover isn't modal. Use a Dialog for that.
 *
 * @example
 * const popover = usePopover()
 * <button {...popover.triggerProps}>Help</button>
 * <div {...popover.popupProps} aria-label="Help">…<button {...popover.closeProps}>Close</button></div>
 */
export function usePopover({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement,
  offset = 4,
  padding = 8,
  matchAnchorWidth,
}: UsePopoverOptions = {}): UsePopoverResult {
  const env = useEnv()
  const popupId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  /** Whether a mouse or touch press found the popup open: the platform may close it before the click. */
  const openAtPressRef = useRef<boolean | undefined>(undefined)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : uncontrolledOpen

  /** Back to the trigger when focus was inside the popup, or lost to the page. Never steals it from another control. */
  const restoreFocus = () => {
    const trigger = triggerRef.current
    if (trigger === null || env === undefined) {
      return
    }
    const active = env.document.activeElement
    const isLost = active === null || active === env.document.body
    if (isLost || isInsideElement(popupRef.current, active)) {
      trigger.focus()
    }
  }

  const change = (next: boolean, details: PopoverChangeDetails) => {
    if (next === isOpen) {
      return
    }
    if (!isControlled) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next, details)
    if (!next && details.reason !== 'trigger-press') {
      restoreFocus()
    }
  }

  const popup = usePopup({
    open: isOpen,
    anchorRef: triggerRef,
    popupRef,
    placement,
    offset,
    padding,
    matchAnchorWidth,
    popover: 'auto',
    onNativeDismiss: (event) => change(false, { reason: 'light-dismiss', event }),
  })

  // The trigger is the anchor, not outside: its own press toggles the popover.
  const ignore = useMemo(
    () => [(target: unknown) => isInsideElement(triggerRef.current, target)],
    [],
  )
  useDismissableLayer({
    open: isOpen,
    ref: popupRef,
    ignore,
    onDismiss: (reason, event) => change(false, { reason, event }),
  })

  return {
    isOpen,
    placement: popup.placement,
    triggerProps: {
      className: 'kv-popover-trigger',
      type: 'button',
      'aria-expanded': isOpen,
      'aria-controls': popupId,
      'aria-haspopup': 'dialog',
      'data-open': isOpen ? '' : undefined,
      ref: triggerRef,
      onPointerDown: () => {
        openAtPressRef.current = isOpen
      },
      onClick: (event) => {
        if (event.defaultPrevented) {
          return
        }
        // A mouse or touch click (detail > 0) toggles from what the press found: the platform's
        // own light dismiss may have closed the popup between the press and the click, and the
        // click must not open it again. Enter and Space (detail 0) toggle from the current state.
        const pressed = openAtPressRef.current
        openAtPressRef.current = undefined
        const wasOpen = event.detail > 0 && pressed !== undefined ? pressed : isOpen
        change(!wasOpen, { reason: 'trigger-press', event: event.nativeEvent })
      },
    },
    popupProps: {
      ...popup.popupProps,
      className: 'kv-popover-popup',
      id: popupId,
      role: 'dialog',
      ref: popupRef,
    },
    closeProps: {
      className: 'kv-popover-close',
      type: 'button',
      onClick: (event) => {
        if (!event.defaultPrevented) {
          change(false, { reason: 'close-press', event: event.nativeEvent })
        }
      },
    },
  }
}
