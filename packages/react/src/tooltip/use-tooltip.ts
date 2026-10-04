import { createTooltipMachine } from '@kvirn-ui/core'
import type { TooltipChangeReason, TooltipGroup } from '@kvirn-ui/core'
import { useCallback, useEffect, useId, useLayoutEffect, useReducer, useRef, useState } from 'react'
import type { FocusEvent, PointerEvent, RefCallback, RefObject } from 'react'
import { isKeyboardFocus, trackModality } from '../focus-visible/use-focus-visible.ts'
import { useDismissableLayer } from '../popup/use-dismissable-layer.ts'
import { usePopup } from '../popup/use-popup.ts'
import type { Placement, PopupPartProps } from '../popup/use-popup.ts'
import { useEnv } from '../provider/use-env.ts'

export type { TooltipChangeReason, TooltipGroup } from '@kvirn-ui/core'

export interface TooltipChangeDetails {
  reason: TooltipChangeReason
}

/** What in the popup the trigger's `aria-describedby` points at. */
export type TooltipDescription = 'popup' | 'shortcut' | 'none'

export interface UseTooltipOptions {
  /** Controlled: whether the tooltip is open. Pair it with `onOpenChange`. */
  open?: boolean | undefined
  /** Uncontrolled: whether the tooltip starts open. Default `false`. */
  defaultOpen?: boolean | undefined
  /**
   * Called when the user opens or closes the tooltip. It only reports: with `open` set, you change
   * `open` yourself. `details.reason` says why: `'hover'`, `'focus'`, `'escape'`, `'pointer-leave'`,
   * `'blur'` or `'trigger-press'` (a press on the trigger, or the trigger opened its own popup).
   */
  onOpenChange?: ((open: boolean, details: TooltipChangeDetails) => void) | undefined
  /** Where the tooltip goes when there is room. Default `'top'`. It flips when it doesn't fit. */
  placement?: Placement | undefined
  /** The gap between the trigger and the tooltip, in pixels. Default 4. */
  offset?: number | undefined
  /** The space kept to the edge of the viewport, in pixels. Default 8. */
  padding?: number | undefined
  /** Milliseconds the pointer rests on the trigger before the tooltip opens. Default 500. Keyboard focus opens it at once. */
  delay?: number | undefined
  /** Milliseconds after the pointer leaves before the tooltip closes. Default 100. */
  closeDelay?: number | undefined
  /**
   * Where tooltips share their delay: once one has opened, the next opens at once. Default: one
   * group for the page. Make one with `createTooltipGroup()` from `@kvirn-ui/core`.
   */
  group?: TooltipGroup | undefined
  /**
   * What the trigger's `aria-describedby` points at. `'popup'` (default): the whole tooltip, for a
   * tooltip that only adds information. `'shortcut'`: only the part with `shortcutProps`, for a
   * tooltip that repeats the trigger's name (hidden from assistive technology with `nameProps`) and
   * adds a shortcut. `'none'`: no description, for a tooltip that only repeats the name: the
   * whole popup is then `aria-hidden` (its role stays), because it adds nothing for assistive technology.
   */
  description?: TooltipDescription | undefined
}

/** Spread on the element that the tooltip belongs to: a button, or any focusable control. */
export interface TooltipTriggerPartProps {
  /** Sets the trigger the tooltip is placed against. A callback, so it fits any element's ref type. Merge your own with `mergeProps`. */
  ref: RefCallback<HTMLElement>
  /** The id of what describes the trigger. Join it with your own `aria-describedby`, don't replace it. */
  'aria-describedby': string | undefined
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void
  onPointerLeave: (event: PointerEvent<HTMLElement>) => void
  onPointerDown: (event: PointerEvent<HTMLElement>) => void
  onFocus: (event: FocusEvent<HTMLElement>) => void
  onBlur: (event: FocusEvent<HTMLElement>) => void
}

/** Spread on the popup: a `<div role="tooltip">`, rendered right after the trigger. It is never focusable. */
export interface TooltipPopupPartProps extends PopupPartProps {
  className: 'kv-tooltip'
  id: string
  role: 'tooltip'
  /** `true` when the tooltip adds nothing for assistive technology (`description: 'none'`), else absent. */
  'aria-hidden': true | undefined
  ref: RefObject<HTMLDivElement | null>
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void
  onPointerLeave: (event: PointerEvent<HTMLElement>) => void
}

/** Spread on the part of the tooltip that repeats the trigger's name: hidden from assistive technology. */
export interface TooltipNamePartProps {
  className: 'kv-tooltip-name'
  'aria-hidden': true
}

/** Spread on the part of the tooltip that adds information, such as the shortcut. */
export interface TooltipShortcutPartProps {
  className: 'kv-tooltip-shortcut'
  id: string
  /** Key names are Latin script, read left to right, also in right-to-left text. */
  dir: 'ltr'
}

export interface UseTooltipResult {
  isOpen: boolean
  /** The placement in use. It differs from the one asked for when the tooltip flipped. */
  placement: Placement
  triggerProps: TooltipTriggerPartProps
  popupProps: TooltipPopupPartProps
  nameProps: TooltipNamePartProps
  shortcutProps: TooltipShortcutPartProps
}

/**
 * A tooltip's props for your own elements (contract: tooltip.a11y.md, APG Tooltip, WCAG 1.4.13): a
 * trigger and a popup in the top layer.
 *
 * - **Opens** when the pointer has rested on the trigger for `delay` (not on touch), and at once on
 *   keyboard focus (focus that shows a focus ring: a click doesn't open it). The next tooltip opens
 *   at once when one is open or closed less than 300 ms ago.
 * - **Stays** while the pointer is on the trigger or the tooltip, or the trigger has keyboard
 *   focus. It never closes on a timer alone.
 * - **Closes** on Escape (through the dismissable layer stack, so a Popover underneath
 *   stays open), when the pointer leaves, when focus leaves, on a press on the trigger, and while the
 *   trigger's own popup is open (`aria-expanded="true"`).
 * - **The popup is always rendered** and hidden by the browser while closed, so `aria-describedby`
 *   always resolves. Render it right after the trigger.
 * - **A tooltip is never the only name.** The trigger needs its own accessible name.
 * - **Focus never moves.** The tooltip is never focusable and holds no interactive content.
 *
 * @example
 * const tooltip = useTooltip({ description: 'shortcut' })
 * <button {...tooltip.triggerProps} aria-label="Fetstil"><Icon name="bold" /></button>
 * <div {...tooltip.popupProps}>
 *   <span {...tooltip.nameProps}>Fetstil</span> <span {...tooltip.shortcutProps}>Ctrl+B</span>
 * </div>
 */
export function useTooltip({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = 'top',
  offset = 4,
  padding = 8,
  delay,
  closeDelay,
  group,
  description = 'popup',
}: UseTooltipOptions = {}): UseTooltipResult {
  const env = useEnv()
  const popupId = useId()
  const shortcutId = `${popupId}-shortcut`
  const triggerRef = useRef<HTMLElement | null>(null)
  // The element is state as well as a ref, so what watches it follows a trigger that `render` swaps.
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const setTriggerRef = useCallback((element: HTMLElement | null) => {
    triggerRef.current = element
    setTriggerElement(element)
  }, [])
  const popupRef = useRef<HTMLDivElement | null>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  // A controlled owner that refuses a change leaves `open` as it was: rendering again makes the machine follow it.
  const [, renderAgain] = useReducer((count: number) => count + 1, 0)
  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : uncontrolledOpen

  const latest = useRef({ isControlled, onOpenChange })
  useLayoutEffect(() => {
    latest.current = { isControlled, onOpenChange }
  })

  const [machine] = useState(() =>
    createTooltipMachine({
      delay,
      closeDelay,
      group,
      onOpenChange: (next, reason) => {
        const current = latest.current
        if (current.isControlled) {
          renderAgain()
        } else {
          setUncontrolledOpen(next)
        }
        current.onOpenChange?.(next, { reason })
      },
    }),
  )

  useLayoutEffect(() => {
    machine.configure({ delay, closeDelay, group })
  }, [machine, delay, closeDelay, group])
  // Every commit: the machine follows the state that was rendered.
  useLayoutEffect(() => {
    machine.sync(isOpen)
  })
  useEffect(() => () => machine.destroy(), [machine])
  useEffect(trackModality, [])

  // The trigger opened its own popup (a Popover, a Listbox): the tooltip closes and stays closed while it is open.
  useEffect(() => {
    const trigger = triggerElement
    if (trigger === null || env === undefined) {
      return
    }
    const update = () => machine.suppress(trigger.getAttribute('aria-expanded') === 'true')
    update()
    const observer = new env.window.MutationObserver(update)
    observer.observe(trigger, { attributes: true, attributeFilter: ['aria-expanded'] })
    return () => {
      observer.disconnect()
      machine.suppress(false)
    }
  }, [machine, env, triggerElement])

  const popup = usePopup({
    open: isOpen,
    anchorRef: triggerRef,
    popupRef,
    placement,
    offset,
    padding,
    popover: 'manual',
  })

  // Only Escape: a tooltip is never dismissed by a press, which the trigger and the pointer's leaving handle.
  useDismissableLayer({
    open: isOpen,
    ref: popupRef,
    dismissOnOutsidePress: false,
    passOutsidePressThrough: true,
    onDismiss: (reason) => {
      if (reason === 'escape') {
        machine.escape()
      }
    },
  })

  // A touch screen has no hover, and a long press is the system's. Nothing needed is only in a tooltip.
  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'touch') {
      machine.pointerEnter()
    }
  }
  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'touch') {
      machine.pointerLeave()
    }
  }

  const describedBy =
    description === 'popup' ? popupId : description === 'shortcut' ? shortcutId : undefined

  return {
    isOpen,
    placement: popup.placement,
    triggerProps: {
      ref: setTriggerRef,
      'aria-describedby': describedBy,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
      onPointerDown: () => machine.press(),
      onFocus: (event) => machine.focus(isKeyboardFocus(event.currentTarget)),
      onBlur: () => machine.blur(),
    },
    popupProps: {
      ...popup.popupProps,
      className: 'kv-tooltip',
      id: popupId,
      role: 'tooltip',
      'aria-hidden': description === 'none' ? true : undefined,
      ref: popupRef,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
    },
    nameProps: { className: 'kv-tooltip-name', 'aria-hidden': true },
    shortcutProps: { className: 'kv-tooltip-shortcut', id: shortcutId, dir: 'ltr' },
  }
}
