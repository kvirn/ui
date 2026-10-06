import { createTypeahead, getRovingTarget } from '@kvirn-ui/core'
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, RefObject } from 'react'
import { useFocusReturn } from '../focus/focus-return.ts'
import { isInsideElement, useDismissableLayer } from '../popup/use-dismissable-layer.ts'
import { usePopup } from '../popup/use-popup.ts'
import type { Placement, PopupPartProps } from '../popup/use-popup.ts'
import { useEnv } from '../provider/use-env.ts'
import { useLocale } from '../provider/use-locale.ts'

/** Why the menu opened or closed, in the second argument of `onOpenChange`. */
export type MenuChangeReason =
  | 'trigger-press'
  | 'key'
  | 'item-press'
  | 'escape'
  | 'outside-press'
  | 'light-dismiss'
  | 'tab'
  | 'focus-out'

export interface MenuChangeDetails {
  reason: MenuChangeReason
  /** The native event behind the change. */
  event: Event
}

export interface UseMenuOptions {
  /** Controlled: whether the menu is open. Pair it with `onOpenChange`. */
  open?: boolean | undefined
  /** Uncontrolled: whether the menu starts open. Default `false`. */
  defaultOpen?: boolean | undefined
  /**
   * Called when the user opens or closes the menu. It only reports: with `open` set, you change
   * `open` yourself. `details.reason` says why: `'trigger-press'` (a pointer press), `'key'`
   * (Enter, Space or an arrow on the trigger), `'item-press'` (an item ran), `'escape'`,
   * `'outside-press'`, `'light-dismiss'` (the platform hid it, for example because another auto
   * popover opened) `'tab'` (focus left with Tab or Shift+Tab) or `'focus-out'` (focus went to an element outside the menu some other way).
   */
  onOpenChange?: ((open: boolean, details: MenuChangeDetails) => void) | undefined
  /** Where the popup goes when there is room. Default `'bottom-start'`. It flips when it doesn't fit. */
  placement?: Placement | undefined
  /** The gap between the trigger and the popup, in pixels. Default 4. */
  offset?: number | undefined
  /** The space kept to the edge of the viewport, in pixels. Default 8. */
  padding?: number | undefined
}

export type MenuItemKind = 'item' | 'checkbox' | 'radio'

export interface MenuItemOptions {
  /** Focusable and reachable by keys, but not activatable. */
  disabled?: boolean | undefined
  /** Whether running the item closes the menu. Default `true`. */
  closeOnSelect?: boolean | undefined
  /** Runs when the item is activated. `event.preventDefault()` keeps the menu open. */
  onSelect?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined
  /** The item's label for typeahead. Default: its trimmed text. */
  textValue?: string | undefined
  /**
   * Whether the item has focus. The focused item is the one tabbable element (`tabindex="0"`), the
   * rest are `-1`: a scrolling menu then has keyboard access (axe `scrollable-region-focusable`),
   * and Tab and Shift+Tab still leave the menu from the item.
   */
  isCurrent?: boolean | undefined
  /** For a checkbox or radio item: whether it is checked. */
  checked?: boolean | undefined
}

/** Spread on the element that opens the menu: a `<button>`. */
export interface MenuTriggerPartProps {
  className: 'kv-menu-trigger'
  type: 'button'
  id: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string
  'data-open': '' | undefined
  ref: RefObject<HTMLButtonElement | null>
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}

/** Spread on the popup: a `<div>` with `role="menu"`, named by the trigger unless you name it. */
export interface MenuPopupPartProps extends PopupPartProps {
  className: 'kv-menu-popup'
  id: string
  role: 'menu'
  'aria-labelledby': string
  ref: RefObject<HTMLDivElement | null>
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  onKeyUp: (event: KeyboardEvent<HTMLDivElement>) => void
  onFocus: () => void
  onBlur: (event: FocusEvent<HTMLDivElement>) => void
}

/** Spread on an item: a `<button>` with a menu item role. */
export interface MenuItemPartProps {
  className: 'kv-menu-item' | 'kv-menu-checkbox-item' | 'kv-menu-radio-item'
  type: 'button'
  role: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio'
  tabIndex: 0 | -1
  'aria-disabled': true | undefined
  'aria-checked': boolean | undefined
  'data-disabled': '' | undefined
  'data-checked': '' | undefined
  'data-highlighted': '' | undefined
  'data-text-value': string | undefined
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void
}

export interface UseMenuResult {
  isOpen: boolean
  /** The placement in use. It differs from the one asked for when the popup flipped. */
  placement: Placement
  triggerProps: MenuTriggerPartProps
  popupProps: MenuPopupPartProps
  /** The props of one item. */
  getItemProps: (kind: MenuItemKind, options?: MenuItemOptions) => MenuItemPartProps
}

const itemSelector = '[role^="menuitem"]'

const itemClassNames = {
  item: 'kv-menu-item',
  checkbox: 'kv-menu-checkbox-item',
  radio: 'kv-menu-radio-item',
} as const

const itemRoles = {
  item: 'menuitem',
  checkbox: 'menuitemcheckbox',
  radio: 'menuitemradio',
} as const

function getLabel(item: HTMLElement): string {
  return item.dataset.textValue ?? item.textContent.trim()
}

/**
 * A menu button's props for your own elements (contract: menu.a11y.md): a trigger, a popup in the
 * top layer and the items in it. For actions, never for navigation.
 *
 * - The trigger gets `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`. A press, Enter,
 *   Space or ArrowDown opens the menu on the first item, ArrowUp on the last.
 * - The popup is `popover="auto"` and `role="menu"`, named by the trigger. Focus moves onto the
 *   items (the focused one is `tabindex="0"`, the rest `-1`): arrows wrap, Home and End jump, a character
 *   moves to the next item that starts with it. The menu is never a Tab stop, and Tab leaves it
 *   and closes it.
 * - **Escape and a press outside close it,** and focus returns to the trigger. Running an item
 *   closes the menu unless `closeOnSelect` is `false`.
 * - A disabled item stays focusable with `aria-disabled` and cannot be run.
 *
 * @example
 * const menu = useMenu()
 * <button {...menu.triggerProps}>Åtgärder</button>
 * <div {...menu.popupProps}><button {...menu.getItemProps('item')}>Skriv ut</button></div>
 */
export function useMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement,
  offset = 4,
  padding = 8,
}: UseMenuOptions = {}): UseMenuResult {
  const env = useEnv()
  const { locale, dir } = useLocale()
  const popupId = useId()
  const triggerId = `${popupId}-trigger`
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  /** Whether a mouse or touch press found the menu open: the platform may close it before the click. */
  const openAtPressRef = useRef<boolean | undefined>(undefined)
  /** Which item takes focus when the menu opens. */
  const openFocusRef = useRef<'first' | 'last'>('first')
  /** A Tab just went down in the menu: focus leaving it now is the Tab. Cleared once the key's default action is done. */
  const tabPressedRef = useRef(false)
  /** The menu closed by Tab: focus is where the browser put it, and the focus return leaves it alone. */
  const skipFocusReturnRef = useRef(false)
  const preventScrollRef = useRef(false)
  /** A Space went into a typeahead word: its key-up must not activate the item. */
  const swallowSpaceUpRef = useRef(false)
  const tabCloseTimerRef = useRef<number | undefined>(undefined)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : uncontrolledOpen
  const isOpenRef = useRef(isOpen)
  useLayoutEffect(() => {
    isOpenRef.current = isOpen
  })
  const typeahead = useMemo(() => createTypeahead({ env, locale }), [env, locale])

  const getItems = () =>
    Array.from(popupRef.current?.querySelectorAll<HTMLElement>(itemSelector) ?? [])

  const change = (next: boolean, details: MenuChangeDetails) => {
    if (next === isOpen) {
      return
    }
    if (!next) {
      // Set on every close request: one that the owner refuses must not leave it set for the next.
      skipFocusReturnRef.current = details.reason === 'tab' || details.reason === 'focus-out'
      preventScrollRef.current =
        details.reason === 'outside-press' || details.reason === 'light-dismiss'
    }
    if (!isControlled) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next, details)
    // Read now: the focus return resets it. A defaultOpen menu nobody touched has nothing to restore.
    if (!next && details.reason === 'outside-press' && env !== undefined && wasFocusSeen()) {
      // The press is still on its way to focus whatever it landed on, or to blur to `body`: the
      // focus return runs before that. Look again after it, and take focus back only if it is lost.
      env.window.setTimeout(() => {
        const active = env.document.activeElement
        if (active === null || active === env.document.body) {
          triggerRef.current?.focus({ preventScroll: true })
        }
      }, 0)
    }
  }

  const { captureOpener, wasFocusSeen } = useFocusReturn({
    active: isOpen,
    scopeRef: popupRef,
    triggerRef,
    skipReturnRef: skipFocusReturnRef,
    preventScrollRef,
    onLost: () => {},
  })

  // The opener is read just before the popup is shown, which also covers a controlled `open`
  // that is set from outside.
  useLayoutEffect(() => {
    if (isOpen) {
      skipFocusReturnRef.current = false
      preventScrollRef.current = false
      captureOpener()
    }
  }, [isOpen, captureOpener])

  const popup = usePopup({
    open: isOpen,
    anchorRef: triggerRef,
    popupRef,
    placement,
    offset,
    padding,
    popover: 'auto',
    onNativeDismiss: (event) => change(false, { reason: 'light-dismiss', event }),
  })

  // The trigger is the anchor, not outside: its own press toggles the menu.
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

  useEffect(() => {
    const hostWindow = env?.window
    return () => {
      if (tabCloseTimerRef.current !== undefined) {
        hostWindow?.clearTimeout(tabCloseTimerRef.current)
      }
    }
  }, [env])

  // After `usePopup` has shown the popup: focus on a hidden element does nothing. Only a menu that
  // is opened after mount takes focus: one that starts open must not move it on load (3.2.1), and
  // the ref also keeps a second effect run (StrictMode, the env resolving) from counting as an opening.
  const wasOpenRef = useRef<boolean | undefined>(undefined)
  useEffect(() => {
    typeahead.reset()
    const isOpening = isOpen && wasOpenRef.current === false
    wasOpenRef.current = isOpen
    if (!isOpening) {
      return
    }
    const items = getItems()
    const first = openFocusRef.current === 'last' ? items.at(-1) : items[0]
    openFocusRef.current = 'first'
    first?.focus()
  }, [isOpen, typeahead])

  const handlePopupKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const popupElement = popupRef.current
    if (
      event.defaultPrevented ||
      event.nativeEvent.isComposing ||
      popupElement === null ||
      !isInsideElement(popupElement, event.target)
    ) {
      return
    }
    // Not prevented: the browser moves focus, and the blur that follows closes the menu.
    if (event.key === 'Tab') {
      tabPressedRef.current = true
      env?.window.setTimeout(() => {
        tabPressedRef.current = false
      }, 0)
      return
    }
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return
    }
    const items = getItems()
    // A field or other control in the popup keeps its own keys: arrows, Home, End and typing.
    if (event.target !== popupElement && !items.some((item) => item === event.target)) {
      return
    }
    const currentIndex = items.findIndex((item) => item === event.target)
    const rovingTarget = getRovingTarget({
      key: event.key,
      currentIndex,
      count: items.length,
      orientation: 'vertical',
      direction: dir,
      loop: true,
    })
    if (rovingTarget !== null) {
      event.preventDefault()
      typeahead.reset()
      items[rovingTarget]?.focus()
      return
    }
    const isSpace = event.key === ' '
    if (isSpace && !typeahead.hasWord()) {
      return
    }
    if (isSpace || Array.from(event.key).length === 1) {
      // A consumed character must not also start the browser's find-as-you-type.
      event.preventDefault()
      if (isSpace) {
        swallowSpaceUpRef.current = true
      }
      const match = typeahead.type(
        event.key,
        items.map((item) => getLabel(item)),
        currentIndex,
      )
      if (match !== undefined) {
        items[match]?.focus()
      }
    }
  }

  return {
    isOpen,
    placement: popup.placement,
    triggerProps: {
      className: 'kv-menu-trigger',
      type: 'button',
      id: triggerId,
      'aria-haspopup': 'menu',
      'aria-expanded': isOpen,
      'aria-controls': popupId,
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
        openFocusRef.current = 'first'
        change(!wasOpen, {
          reason: event.detail > 0 ? 'trigger-press' : 'key',
          event: event.nativeEvent,
        })
      },
      onKeyDown: (event) => {
        if (
          event.defaultPrevented ||
          event.ctrlKey ||
          event.altKey ||
          event.metaKey ||
          (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
        ) {
          return
        }
        event.preventDefault()
        openFocusRef.current = event.key === 'ArrowUp' ? 'last' : 'first'
        if (isOpen) {
          const items = getItems()
          const target = openFocusRef.current === 'last' ? items.at(-1) : items[0]
          openFocusRef.current = 'first'
          target?.focus()
          return
        }
        change(true, { reason: 'key', event: event.nativeEvent })
      },
    },
    popupProps: {
      ...popup.popupProps,
      className: 'kv-menu-popup',
      id: popupId,
      role: 'menu',
      'aria-labelledby': triggerId,
      ref: popupRef,
      onKeyDown: handlePopupKeyDown,
      onFocus: () => {
        // Back in the menu after a refused Tab or focus-out close: the flag belonged to that one.
        skipFocusReturnRef.current = false
        preventScrollRef.current = false
      },
      onKeyUp: (event) => {
        // Space ran no item, it went into a typeahead word: the button must not click on release.
        if (event.key === ' ' && swallowSpaceUpRef.current) {
          swallowSpaceUpRef.current = false
          event.preventDefault()
        }
      },
      onBlur: (event) => {
        const next = event.relatedTarget
        const byTab = tabPressedRef.current
        // A move to the trigger is its own press (a toggle); a move to nowhere only counts for a
        // Tab (a click on blank page is an outside press, and a window switch keeps the menu).
        const leftMenu = next === null ? byTab : !isInsideElement(popupRef.current, next)
        if (!leftMenu || (!byTab && next === triggerRef.current)) {
          return
        }
        // Later, once focus has landed: closing now would find it on `body`, and the focus return
        // would take it back to the trigger from the element focus was going to.
        const nativeEvent = event.nativeEvent
        tabCloseTimerRef.current = env?.window.setTimeout(() => {
          if (!isOpenRef.current) {
            return
          }
          change(false, { reason: byTab ? 'tab' : 'focus-out', event: nativeEvent })
        }, 0)
      },
    },
    getItemProps: (
      kind,
      {
        disabled = false,
        closeOnSelect = true,
        onSelect,
        textValue,
        checked,
        isCurrent = false,
      } = {},
    ) => ({
      className: itemClassNames[kind],
      type: 'button',
      role: itemRoles[kind],
      tabIndex: isCurrent ? 0 : -1,
      'aria-disabled': disabled ? true : undefined,
      'aria-checked': kind === 'item' ? undefined : checked === true,
      'data-disabled': disabled ? '' : undefined,
      'data-checked': kind !== 'item' && checked === true ? '' : undefined,
      'data-highlighted': isCurrent ? '' : undefined,
      'data-text-value': textValue,
      onClick: (event) => {
        if (disabled) {
          event.preventDefault()
          return
        }
        onSelect?.(event)
        if (!event.defaultPrevented && closeOnSelect) {
          change(false, { reason: 'item-press', event: event.nativeEvent })
        }
      },
      onPointerMove: (event) => {
        // Only a real mouse move: a menu that opens under a still pointer must not steal the focus,
        // and a touch or pen move is a scroll or a stylus drag.
        if (event.pointerType !== 'mouse' || (event.movementX === 0 && event.movementY === 0)) {
          return
        }
        const item = event.currentTarget
        if (item.ownerDocument.activeElement !== item) {
          item.focus({ preventScroll: true })
        }
      },
    }),
  }
}
