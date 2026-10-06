import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { isInsideElement } from '../popup/use-dismissable-layer.ts'
import { useEnv } from '../provider/use-env.ts'

/** Internal. Whether `element` can take focus now: in the document, enabled and not inert. */
export function isFocusTarget(element: HTMLElement | null | undefined): element is HTMLElement {
  return (
    element !== null &&
    element !== undefined &&
    element.isConnected &&
    !element.matches(':disabled') &&
    element.closest('[inert]') === null
  )
}

/** Internal. Focuses the first candidate that takes focus, in order. `false` when none does: focus is never sent to `body`. */
export function focusFirstAvailable(candidates: ReadonlyArray<HTMLElement | null | undefined>) {
  for (const candidate of candidates) {
    if (isFocusTarget(candidate)) {
      candidate.focus()
      if (candidate.ownerDocument.activeElement === candidate) {
        return true
      }
    }
  }
  return false
}

export interface UseFocusReturnOptions {
  /** Whether the scope (a modal) is showing. Focus returns when this goes from `true` to `false`. */
  active: boolean
  /** The scope's element: focus inside it, or lost to `body`, is what gets returned. */
  scopeRef: RefObject<Element | null>
  /** The element that opened the scope, when there is one. */
  triggerRef: RefObject<HTMLElement | null>
  /** The consumer's choice of where focus goes: first in line. */
  finalFocusRef?: RefObject<HTMLElement | null> | undefined
  /** Called when nothing could take focus. */
  onLost: () => void
}

/**
 * Internal, built for extraction as a FocusScope. Returns focus when `active` ends: to
 * `finalFocusRef`, else the trigger, else the element that had focus before it began, each only if
 * it is still in the document and takes focus. Focus the user moved elsewhere is never taken, and
 * `body` is never a target (`onLost` says nothing was left).
 *
 * Call the function it returns just before showing the scope (the opener is read then, which is
 * later than the render when a scope waits for its parent). Declare the hook before the effect that
 * hides the scope (the return runs in a passive effect, after the scope is closed and the page behind it
 * is no longer inert).
 */
export function useFocusReturn({
  active,
  scopeRef,
  triggerRef,
  finalFocusRef,
  onLost,
}: UseFocusReturnOptions): () => void {
  const env = useEnv()
  /** `undefined` while inactive, `null` when focus was on nothing useful before the scope began. */
  const openerRef = useRef<HTMLElement | null | undefined>(undefined)
  const shouldReturnRef = useRef(false)
  const latest = useRef({ finalFocusRef, onLost })

  useLayoutEffect(() => {
    latest.current = { finalFocusRef, onLost }
  })

  /** Call it just before the scope is shown: only then is the element that had focus the real opener. */
  const captureOpener = useCallback(() => {
    if (env === undefined || openerRef.current !== undefined) {
      return
    }
    const { document } = env
    const current = document.activeElement
    openerRef.current =
      current !== document.body && current instanceof env.window.HTMLElement ? current : null
  }, [env])

  useLayoutEffect(() => {
    if (env === undefined || active || openerRef.current === undefined) {
      return
    }
    const { document } = env
    const current = document.activeElement
    // A native close (`<form method="dialog">`) has already moved focus back to the opener: ours still.
    shouldReturnRef.current =
      current === null ||
      current === document.body ||
      current === openerRef.current ||
      isInsideElement(scopeRef.current, current)
  }, [active, env, scopeRef])

  useEffect(() => {
    if (active || openerRef.current === undefined) {
      return
    }
    const opener = openerRef.current
    openerRef.current = undefined
    if (!shouldReturnRef.current) {
      return
    }
    const returned = focusFirstAvailable([
      latest.current.finalFocusRef?.current,
      triggerRef.current,
      opener,
    ])
    if (!returned) {
      latest.current.onLost()
    }
  }, [active, triggerRef])

  return captureOpener
}
