import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FocusEvent, FocusEventHandler } from 'react'

export interface FocusVisibleProps {
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseFocusVisibleResult {
  /** `true` while the element has focus, however it got it. */
  isFocused: boolean
  /** `true` while it matches `:focus-visible`, except a text input focused by a pointer (see `isKeyboardFocus`). */
  isFocusVisible: boolean
  focusVisibleProps: FocusVisibleProps
}

const modifierKeys = new Set(['Alt', 'AltGraph', 'Control', 'Meta', 'Shift'])

// A pointer went down, and the focus it moves hasn't happened yet. Reset when that focus has
// reached every handler, and one task after the click (or a cancelled press), so a click on page
// text never marks a later focus (a screen reader's, an access key's, a script's): that one follows
// the browser and shows the ring.
let isPointerBeforeFocus = false
let isTracking = false

// A screen reader's "click" arrives as a synthesised pointer event with no real pointer behind it
// (as in React Aria): it is the keyboard's kind of focus, so the ring shows.
function isAndroid(): boolean {
  const { userAgentData } = navigator as Navigator & { userAgentData?: { platform?: string } }
  return userAgentData?.platform === 'Android' || /android/i.test(navigator.userAgent)
}

function isVirtualPointerDown(event: PointerEvent): boolean {
  // Some Android devices report a real tap as 0 by 0.
  if (event.width === 0 && event.height === 0 && !isAndroid()) {
    return true
  }
  return (
    event.width === 1 &&
    event.height === 1 &&
    event.pressure === 0 &&
    event.detail === 0 &&
    event.pointerType === 'mouse'
  )
}

function isVirtualClick(event: MouseEvent): boolean {
  // Firefox marks a trusted synthesised click with mozInputSource 0 (unknown).
  if (event.isTrusted && (event as MouseEvent & { mozInputSource?: number }).mozInputSource === 0) {
    return true
  }
  return event.detail === 0 && !(event as PointerEvent).pointerType
}

function onPointerDown(event: PointerEvent) {
  isPointerBeforeFocus = !isVirtualPointerDown(event)
}

function onKeyDown(event: KeyboardEvent) {
  // A modifier alone moves no focus. A chord does count: Ctrl+K to a search field is the keyboard.
  if (!modifierKeys.has(event.key)) {
    isPointerBeforeFocus = false
  }
}

function clearPointer() {
  isPointerBeforeFocus = false
}

/** After the click's own focus: a label's, or one a click handler moves. */
function onClick(event: MouseEvent) {
  if (isVirtualClick(event)) {
    isPointerBeforeFocus = false
    return
  }
  setTimeout(clearPointer)
}

/**
 * Starts tracking pointer presses for the whole document, once. Called from an effect only, so
 * nothing reads the page at import time or while rendering (SSR-safe).
 */
export function trackModality(): void {
  if (isTracking || typeof document === 'undefined') {
    return
  }
  isTracking = true
  document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true })
  document.addEventListener('pointercancel', clearPointer, { capture: true, passive: true })
  document.addEventListener('click', onClick, { capture: true, passive: true })
  document.addEventListener('keydown', onKeyDown, { capture: true, passive: true })
  // Bubble phase on the document: after React's own focus handlers on the root have read it.
  document.addEventListener('focusin', clearPointer, { passive: true })
}

// A contenteditable takes text too (the rich text editor, Plan 0036): browsers match `:focus-visible`
// on a click in it, as they do in a text input.
export const textEntrySelector =
  'textarea, [contenteditable]:not([contenteditable="false"]), input:not([type="button"], [type="checkbox"], [type="color"], [type="file"], [type="hidden"], [type="image"], [type="radio"], [type="range"], [type="reset"], [type="submit"])'

/**
 * Whether the focus on `element` should show the focus ring. Browsers match `:focus-visible` on
 * an element that takes text even when a click moved the focus there, so for those this also asks
 * that no pointer went down since the last focus. Every other element follows the browser.
 */
export function isKeyboardFocus(element: Element): boolean {
  if (!element.matches(':focus-visible')) {
    return false
  }
  return !(isPointerBeforeFocus && element.matches(textEntrySelector))
}

/**
 * Internal. Focus state for `data-focused` and `data-focus-visible`. Reads the page only inside
 * event handlers and effects, so it is SSR-safe.
 */
export function useFocusVisible(): UseFocusVisibleResult {
  const [isFocused, setIsFocused] = useState(false)
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(trackModality, [])

  const onFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    setIsFocused(true)
    setIsFocusVisible(isKeyboardFocus(event.currentTarget))
  }, [])
  const onBlur = useCallback(() => {
    setIsFocused(false)
    setIsFocusVisible(false)
  }, [])

  return useMemo(
    () => ({ isFocused, isFocusVisible, focusVisibleProps: { onFocus, onBlur } }),
    [isFocused, isFocusVisible, onFocus, onBlur],
  )
}
