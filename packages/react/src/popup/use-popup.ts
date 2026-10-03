import { computePlacement } from '@kvirn-ui/core'
import type { Placement } from '@kvirn-ui/core'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useEnv } from '../provider/use-env.ts'

export type { Placement } from '@kvirn-ui/core'

export interface UsePopupOptions {
  /** Whether the popup is showing. The popup element must stay rendered, so it can be shown and hidden. */
  open: boolean
  /** What the popup sits next to: a Popover's trigger, a Combobox's input. Never covered (2.4.11). */
  anchorRef: RefObject<Element | null>
  /** The popup's own element. Its ref goes on the element that gets `popupProps`. */
  popupRef: RefObject<HTMLElement | null>
  /**
   * Where the popup goes when there is room, such as `'bottom-start'` (the default) or `'end'`.
   * `start` and `end` follow the reading direction, so they flip in right-to-left text. It flips
   * to the other side when it does not fit.
   */
  placement?: Placement | undefined
  /** The gap between the anchor and the popup, in pixels. Default 0. */
  offset?: number | undefined
  /** The space kept between the popup and the edge of the viewport, in pixels. Default 0. */
  padding?: number | undefined
  /** Make the popup as wide as the anchor, such as a listbox under its input. Default `false`. */
  matchAnchorWidth?: boolean | undefined
  /**
   * The native `popover` mode (ADR-0046). `'auto'` (default) lets the platform close the popup
   * on Escape and a press outside, and when another auto popup opens. `'manual'` leaves the
   * closing to you and to `useDismissableLayer`: use it where focus stays elsewhere, in a
   * Combobox's input, so the platform's light dismiss doesn't take part.
   */
  popover?: 'auto' | 'manual' | undefined
  /**
   * Called when the platform hid the popup although `open` is still `true`: a light dismiss, or
   * another auto popup that opened. Set `open` to `false` here so your state matches the page.
   */
  onNativeDismiss?: ((event: Event) => void) | undefined
}

/** Spread on the popup element, next to its `ref`. */
export interface PopupPartProps {
  /** Puts the popup in the top layer: no z-index, and no clipping by an ancestor's `overflow`. */
  popover: 'auto' | 'manual'
  /** Present while the popup is open. */
  'data-open'?: '' | undefined
  /** The side the popup is on now, after it flipped: `bottom-start`, `top`, `end-start`. */
  'data-placement': Placement
  /**
   * Present while the anchor is entirely outside the viewport (scrolled away). The popup is then
   * `visibility: hidden`, so it doesn't float over unrelated content, and it comes back when the
   * anchor does.
   */
  'data-detached'?: '' | undefined
}

export interface UsePopupResult {
  popupProps: PopupPartProps
  /** The placement in use. It differs from the one asked for when the popup flipped. */
  placement: Placement
  /** Measures and places the popup again. It repositions itself on scroll and resize, so this is for content you changed. */
  reposition: () => void
}

/** Whether the browser has the Popover API. Without it, the popup is shown and hidden with `hidden`. */
function supportsPopover(element: HTMLElement): boolean {
  return 'showPopover' in element
}

function isPopoverOpen(popup: HTMLElement): boolean {
  try {
    return popup.matches(':popover-open')
  } catch {
    // The selector is unknown to this browser.
    return false
  }
}

function setPopupShown(popup: HTMLElement, shown: boolean): void {
  if (!supportsPopover(popup)) {
    popup.hidden = !shown
    return
  }
  try {
    if (shown && !isPopoverOpen(popup)) {
      popup.showPopover()
    } else if (!shown && isPopoverOpen(popup)) {
      popup.hidePopover()
    }
  } catch {
    // InvalidStateError: the popup isn't in the document, or the platform already changed it.
  }
}

/**
 * The shared mechanics of a floating popup (ADR-0046): Popover, Menu, Select, Combobox. It puts
 * the popup in the top layer with the native `popover` attribute, shows and hides it when `open`
 * changes, and places it next to the anchor with `computePlacement` from `@kvirn-ui/core`.
 *
 * - **Placement:** the popup flips to the other side when it doesn't fit, shifts to stay inside
 *   the viewport, and never covers the anchor. It is placed again on scroll (any scroller) and
 *   resize, when the anchor or the popup changes size, and when the anchor moves (checked once per frame while open). Position is inline `position: fixed`
 *   with `left` and `top`: it never animates.
 * - **CSS variables** on the popup: `--kv-popup-width`, `--kv-popup-max-height` (the room left,
 *   so a long popup scrolls inside instead of leaving the screen, 1.4.10) and `--kv-anchor-width`.
 * - **Attributes:** `data-open` and `data-placement` for your styles.
 * - **No focus changes.** It doesn't move focus or manage dismissal: pair it with
 *   `useDismissableLayer`.
 * - **Server rendering:** nothing reads `window` while rendering. Everything happens in effects.
 *
 * @example
 * const popup = usePopup({ open: isOpen, anchorRef: triggerRef, popupRef })
 * <div ref={popupRef} {...popup.popupProps}>…</div>
 */
export function usePopup({
  open,
  anchorRef,
  popupRef,
  placement = 'bottom-start',
  offset,
  padding,
  matchAnchorWidth = false,
  popover = 'auto',
  onNativeDismiss,
}: UsePopupOptions): UsePopupResult {
  const env = useEnv()
  const [placed, setPlaced] = useState<Placement | undefined>(undefined)
  const [isDetached, setIsDetached] = useState(false)
  const openRef = useRef(open)
  const onNativeDismissRef = useRef(onNativeDismiss)
  const repositionRef = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    openRef.current = open
    onNativeDismissRef.current = onNativeDismiss
  })

  // Show and hide with the native API (or with `hidden` where it is missing).
  useLayoutEffect(() => {
    const popup = popupRef.current
    if (popup !== null) {
      setPopupShown(popup, open)
    }
  }, [open, popover, popupRef])

  // The platform can hide the popup on its own: light dismiss, or another auto popup opening.
  useEffect(() => {
    const popup = popupRef.current
    if (popup === null) {
      return
    }
    const handleToggle = (event: Event) => {
      if ('newState' in event && event.newState === 'closed' && openRef.current) {
        onNativeDismissRef.current?.(event)
      }
    }
    popup.addEventListener('toggle', handleToggle)
    return () => popup.removeEventListener('toggle', handleToggle)
  }, [popupRef])

  // Place the popup before the browser paints, and keep it placed while it is open.
  useLayoutEffect(() => {
    const popup = popupRef.current
    const anchor = anchorRef.current
    if (!open || env === undefined || popup === null || anchor === null) {
      return
    }
    const { window: hostWindow, document: hostDocument } = env

    const update = () => {
      const { style } = popup
      // The popup may scroll itself, or hold a listbox that does: measuring without a height limit
      // would otherwise leave either one scrolled back to the top.
      const scroller = popup.querySelector('[role="listbox"]')
      const scrollTop = popup.scrollTop
      const scrollerTop = scroller === null ? 0 : scroller.scrollTop
      const anchorRect = anchor.getBoundingClientRect()
      // An anchor that is scrolled out of view leaves nothing to point at: hide the popup, so it
      // doesn't float over other content. It is placed all the same, and shown when the anchor returns.
      const viewportWidth = hostDocument.documentElement.clientWidth
      const viewportHeight = hostDocument.documentElement.clientHeight
      const detached =
        anchorRect.bottom <= 0 ||
        anchorRect.top >= viewportHeight ||
        anchorRect.right <= 0 ||
        anchorRect.left >= viewportWidth
      style.visibility = detached ? 'hidden' : ''
      setIsDetached(detached)
      // Measure the popup at its natural size, in the corner and free of the last limits.
      style.position = 'fixed'
      style.boxSizing = 'border-box'
      style.margin = '0'
      style.top = '0px'
      style.left = '0px'
      style.right = 'auto'
      style.bottom = 'auto'
      style.maxWidth = 'none'
      // Your own height limit counts while measuring: a popup placed above the anchor is positioned
      // by its height, so measuring it taller than it ends up leaves a gap under it.
      style.maxHeight = 'var(--kv-popup-height-limit, none)'
      style.width = matchAnchorWidth ? `${anchorRect.width}px` : ''
      const { width, height } = popup.getBoundingClientRect()

      const result = computePlacement(
        anchorRect,
        { width, height },
        {
          x: 0,
          y: 0,
          width: viewportWidth,
          height: viewportHeight,
        },
        {
          placement,
          direction: hostWindow.getComputedStyle(anchor).direction === 'rtl' ? 'rtl' : 'ltr',
          offset,
          padding,
          matchAnchorWidth,
        },
      )
      style.setProperty('--kv-popup-width', `${result.width}px`)
      style.setProperty('--kv-popup-max-height', `${result.maxHeight}px`)
      style.setProperty('--kv-anchor-width', `${anchorRect.width}px`)
      style.left = `${result.x}px`
      style.top = `${result.y}px`
      style.width = matchAnchorWidth ? 'var(--kv-popup-width)' : ''
      style.maxWidth = 'var(--kv-popup-width)'
      // The room that is left, and your own limit if you set --kv-popup-height-limit (a length).
      style.maxHeight = 'min(var(--kv-popup-max-height), var(--kv-popup-height-limit, 100vh))'
      popup.scrollTop = scrollTop
      if (scroller !== null) {
        scroller.scrollTop = scrollerTop
      }
      setPlaced(result.placement)
    }
    update()
    repositionRef.current = update

    // A scroll inside the popup (a long list) doesn't move it.
    const handleScroll = (event: Event) => {
      if (!(event.target instanceof hostWindow.Node && popup.contains(event.target))) {
        update()
      }
    }
    hostWindow.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    hostWindow.addEventListener('resize', update)

    // A resize can come from our own measuring, so it is handled in the next frame.
    let frame: number | undefined
    const scheduleUpdate = () => {
      if (frame === undefined) {
        frame = hostWindow.requestAnimationFrame(() => {
          frame = undefined
          update()
        })
      }
    }
    let observer: ResizeObserver | undefined
    if ('ResizeObserver' in hostWindow) {
      observer = new hostWindow.ResizeObserver(scheduleUpdate)
      observer.observe(anchor)
      observer.observe(popup)
    }

    // The anchor can move without scrolling and without changing size: a Combobox's chosen values
    // appear or wrap above its field and push it down. Nothing reports that, so while the popup is
    // open the anchor's rectangle is compared once per frame (one measurement, and a placement
    // only when it changed), so the popup never ends up covering the anchor (2.4.11).
    let watchedFrame: number | undefined
    let watchedRect = anchor.getBoundingClientRect()
    const watchAnchor = () => {
      const rect = anchor.getBoundingClientRect()
      if (
        rect.x !== watchedRect.x ||
        rect.y !== watchedRect.y ||
        rect.width !== watchedRect.width ||
        rect.height !== watchedRect.height
      ) {
        watchedRect = rect
        update()
      }
      watchedFrame = hostWindow.requestAnimationFrame(watchAnchor)
    }
    watchedFrame = hostWindow.requestAnimationFrame(watchAnchor)

    return () => {
      popup.style.visibility = ''
      setIsDetached(false)
      hostWindow.removeEventListener('scroll', handleScroll, { capture: true })
      hostWindow.removeEventListener('resize', update)
      observer?.disconnect()
      if (frame !== undefined) {
        hostWindow.cancelAnimationFrame(frame)
      }
      if (watchedFrame !== undefined) {
        hostWindow.cancelAnimationFrame(watchedFrame)
      }
      repositionRef.current = () => {}
    }
  }, [open, env, anchorRef, popupRef, placement, offset, padding, matchAnchorWidth])

  const reposition = useCallback(() => repositionRef.current(), [])
  const currentPlacement = open && placed !== undefined ? placed : placement

  return {
    popupProps: {
      popover,
      'data-open': open ? '' : undefined,
      'data-placement': currentPlacement,
      'data-detached': open && isDetached ? '' : undefined,
    },
    placement: currentPlacement,
    reposition,
  }
}
