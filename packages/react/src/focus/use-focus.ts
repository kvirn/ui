import { useEffect, useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent, RefObject } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { isInsideElement } from '../popup/use-dismissable-layer.ts'
import { useEnv } from '../provider/use-env.ts'
import { focusFirstAvailable, isFocusTarget, useFocusReturn } from './focus-return.ts'
import { moveFocusOn } from './move-on.ts'

export interface FocusMoveOn {
  /** Focus moves when this changes, never on the first render: a step number, a route's pathname plus search. */
  key: string
  /** The element to focus. Defaults to `h1`. */
  selector?: string | undefined
  /** Where to look for `selector`. Defaults to the document. */
  containerRef?: RefObject<Element | null> | undefined
}

export interface UseFocusOptions {
  /** Whether the scope is showing. Focus moves in when this becomes `true` and returns when it becomes `false`. */
  active?: boolean | undefined
  /** Return focus when `active` ends (2.4.3). Default `true`. Focus the user moved elsewhere is never taken. */
  restore?: boolean | undefined
  /** Where focus returns first. Then `triggerRef`, then the element that had focus before the scope, never `body`. */
  finalFocusRef?: RefObject<HTMLElement | null> | undefined
  /** The element that opened the scope, when it is not the one that had focus. */
  triggerRef?: RefObject<HTMLElement | null> | undefined
  /**
   * Where focus goes when `active` becomes `true`: `'first'` (default) is the first Tab stop in
   * the scope, `'container'` the scope itself, `'none'` leaves it, a selector string or a ref names
   * an element. A target that is gone or disabled falls through to the first Tab stop, then the
   * container.
   */
  initialFocus?: string | RefObject<HTMLElement | null> | undefined
  /**
   * `'loop'` wraps Tab and Shift+Tab at the scope's ends (the APG dialog). `'inert'` makes the
   * rest of the page `inert` while active, so Tab stays in the scope without any wrapping. Both
   * need a way out: pass `onEscape` (2.1.2). Native `<dialog>.showModal()` needs neither.
   */
  contain?: false | 'loop' | 'inert' | undefined
  /** Called on Escape inside the scope when `contain` is set. You close the scope. */
  onEscape?: ((event: KeyboardEvent<HTMLElement>) => void) | undefined
  /** Moves focus when `moveOn.key` changes: a wizard step or a route. Works with or without `active`. */
  moveOn?: FocusMoveOn | undefined
  /** Called when nothing could take focus: the return found no target, or `moveOn` found no element. */
  onLost?: (() => void) | undefined
}

export interface FocusScopePartProps {
  ref: RefObject<HTMLElement | null>
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
}

export interface UseFocusResult {
  /** Spread on the scope's element: its ref, and the keys for `contain` and `onEscape`. */
  scopeProps: FocusScopePartProps
  /** Call it just before showing the scope when focus is read earlier than `active` flips. Optional: `active` captures it too. */
  captureOpener: () => void
  /** `true` once focus was in the scope or a real opener existed. */
  wasFocusSeen: () => boolean
  /** Focuses the first candidate that takes focus, never `body`. `false` when none does. */
  focusFirstAvailable: typeof focusFirstAvailable
  /** Whether an element can take focus now: in the document, enabled and not inert. */
  isFocusTarget: typeof isFocusTarget
}

const tabbableSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',')

// Live regions and the toast region stay reachable: a screen reader user must still hear them.
const keepReachableSelector = '[aria-live], [role="alert"], [role="status"], .kv-toast-region'

function getTabbables(scope: HTMLElement): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>(tabbableSelector)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      element.closest('[inert]') === null &&
      element.checkVisibility({ visibilityProperty: true }),
  )
}

/** Marks every sibling of the scope and of its ancestors `inert`, and returns the undo. */
function makeSurroundingsInert(scope: HTMLElement): () => void {
  const marked: Element[] = []
  for (
    let node: Element | null = scope;
    node !== null && node !== scope.ownerDocument.body;
    node = node.parentElement
  ) {
    const parent: Element | null = node.parentElement
    if (parent === null) {
      break
    }
    for (const sibling of Array.from(parent.children)) {
      if (
        sibling === node ||
        sibling.hasAttribute('inert') ||
        sibling.matches(keepReachableSelector) ||
        sibling.querySelector(keepReachableSelector) !== null
      ) {
        continue
      }
      sibling.setAttribute('inert', '')
      marked.push(sibling)
    }
  }
  return () => {
    for (const element of marked) {
      element.removeAttribute('inert')
    }
  }
}

/**
 * Moves, holds and returns focus for a scope of your own, such as a drawer or a wizard step
 * (contract: focus.a11y.md). Prefer a native `<dialog>` with `showModal()` or the `inert`
 * attribute: this is for what they don't cover. It adds no role and no ARIA.
 *
 * @example
 * const { scopeProps } = useFocus({ active: open, contain: 'loop', onEscape: close })
 * <aside {...scopeProps}>…</aside>
 */
export function useFocus(options: UseFocusOptions = {}): UseFocusResult {
  const {
    active = false,
    restore = true,
    finalFocusRef,
    triggerRef,
    contain = false,
    onEscape,
    moveOn,
  } = options
  const env = useEnv()
  const scopeRef = useRef<HTMLElement | null>(null)
  const emptyTriggerRef = useRef<HTMLElement | null>(null)
  const skipReturnRef = useRef(false)
  const latest = useRef(options)

  useLayoutEffect(() => {
    latest.current = options
    skipReturnRef.current = !restore
  })

  // Declared before the effects that move focus or isolate the page: the return runs after both
  // are undone.
  const focusReturn = useFocusReturn({
    active,
    scopeRef,
    triggerRef: triggerRef ?? emptyTriggerRef,
    finalFocusRef,
    skipReturnRef,
    onLost: () => latest.current.onLost?.(),
  })

  // The opener is read before the isolation below moves focus off it.
  useLayoutEffect(() => {
    if (active) {
      focusReturn.captureOpener()
    }
  }, [active, focusReturn])

  // A layout effect, so its cleanup runs before the return in the passive phase.
  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!active || contain !== 'inert' || scope === null) {
      return
    }
    return makeSurroundingsInert(scope)
  }, [active, contain])

  useEffect(() => {
    if (env === undefined || !active) {
      return
    }
    const scope = scopeRef.current
    const { initialFocus = 'first' } = latest.current
    if (scope === null || initialFocus === 'none') {
      return
    }
    const current = env.document.activeElement
    if (current !== env.document.body && isInsideElement(scope, current)) {
      return
    }
    const firstTabbable = getTabbables(scope)[0]
    let named: HTMLElement | null | undefined
    if (typeof initialFocus === 'object') {
      named = initialFocus.current
    } else if (initialFocus !== 'first' && initialFocus !== 'container') {
      named = scope.querySelector<HTMLElement>(initialFocus)
    }
    const candidates = initialFocus === 'container' ? [scope] : [named, firstTabbable, scope]

    // A scope with no Tab stop takes focus itself, without becoming one.
    const addedTabIndex = !scope.hasAttribute('tabindex')
    if (addedTabIndex) {
      scope.setAttribute('tabindex', '-1')
    }
    focusFirstAvailable(candidates)
    if (addedTabIndex) {
      if (env.document.activeElement === scope) {
        scope.addEventListener('blur', () => scope.removeAttribute('tabindex'), { once: true })
      } else {
        scope.removeAttribute('tabindex')
      }
    }
  }, [active, env])

  const previousMoveKey = useRef<string>(undefined)
  const moveKey = moveOn?.key
  useEffect(() => {
    if (env === undefined || moveKey === undefined) {
      previousMoveKey.current = undefined
      return
    }
    if (previousMoveKey.current === undefined || previousMoveKey.current === moveKey) {
      previousMoveKey.current = moveKey
      return
    }
    previousMoveKey.current = moveKey
    const { selector = 'h1', containerRef } = latest.current.moveOn ?? {}
    const result = moveFocusOn(env, selector, containerRef?.current)
    if (result.status === 'missing') {
      latest.current.onLost?.()
    }
  }, [env, moveKey])

  const warnsNoExit = contain !== false && onEscape === undefined
  useEffect(() => {
    if (warnsNoExit) {
      warnOnce(
        'focus-scope-no-exit',
        'A focus scope with `contain` has no `onEscape`, so a keyboard user has no way out of it (2.1.2). Pass `onEscape` and close the scope in it.',
      )
    }
  }, [warnsNoExit])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const scope = scopeRef.current
    if (!active || contain === false || scope === null || event.defaultPrevented) {
      return
    }
    if (event.key === 'Escape') {
      onEscape?.(event)
      return
    }
    if (
      contain !== 'loop' ||
      event.key !== 'Tab' ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return
    }
    // Read now, not at mount: the scope's stops change while it is open.
    const tabbables = getTabbables(scope)
    const first = tabbables[0]
    const last = tabbables[tabbables.length - 1]
    const current = scope.ownerDocument.activeElement
    if (first === undefined || last === undefined) {
      event.preventDefault()
    } else if (event.shiftKey && (current === first || current === scope)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && current === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return {
    scopeProps: { ref: scopeRef, onKeyDown },
    captureOpener: focusReturn.captureOpener,
    wasFocusSeen: focusReturn.wasFocusSeen,
    focusFirstAvailable,
    isFocusTarget,
  }
}
