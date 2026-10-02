import { createDismissableLayerStack } from '@kvirn-ui/core'
import type { DismissableLayerStack, LayerTargetCheck } from '@kvirn-ui/core'
import { useEffect, useId, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useEnv } from '../provider/use-env.ts'

/** Why a layer was dismissed. */
export type DismissReason = 'escape' | 'outside-press'

export interface UseDismissableLayerOptions {
  /** Whether the layer is showing. Only an open layer is on the stack and reacts to anything. */
  open: boolean
  /**
   * Called when the user dismisses the layer: Escape, or a press outside it. It only asks: the
   * owner closes the layer by setting `open` to `false`. `event` is the native event.
   */
  onDismiss: (reason: DismissReason, event: Event) => void
  /** The layer's element. A press inside it never dismisses it. */
  ref: RefObject<Element | null>
  /**
   * Targets that count as inside although they are outside the element: the anchor (a Popover's
   * trigger, a Combobox's input and button). A press on one never dismisses the layer.
   */
  ignore?: readonly LayerTargetCheck[] | undefined
  /** Whether Escape dismisses this layer. Default `true`. */
  dismissOnEscape?: boolean | undefined
  /** Whether a press outside dismisses this layer. Default `true`. */
  dismissOnOutsidePress?: boolean | undefined
}

interface LayerRegistry {
  stack: DismissableLayerStack
  /** The element of each layer on the stack, read when a press has to be placed inside or outside. */
  elements: Map<string, () => Element | null>
}

let layerRegistry: LayerRegistry | undefined

/** One stack for the whole page, created on first use so that importing the module touches nothing. */
function getLayerRegistry(): LayerRegistry {
  layerRegistry ??= { stack: createDismissableLayerStack(), elements: new Map() }
  return layerRegistry
}

/** A DOM node, told apart without `instanceof`, which fails for nodes of another window (an iframe). */
function isNode(target: unknown): target is Node {
  return typeof target === 'object' && target !== null && 'nodeType' in target
}

/** Internal. Whether a pointer target (an `EventTarget`, typed `unknown` by the layer stack) is in `element`. */
export function isInsideElement(element: Element | null | undefined, target: unknown): boolean {
  return element !== null && element !== undefined && isNode(target) && element.contains(target)
}

/**
 * Escape and outside presses for a floating layer (ADR-0046): a Popover, a Menu, a Combobox's
 * listbox. Open layers share one stack, and **only the top layer reacts**, so Escape closes the
 * innermost layer and a press outside everything closes the top one first. The hook only reports
 * (`onDismiss`): you close the layer and, where the pattern says so, return focus.
 *
 * - **Escape** is read on the document, after the page's own handlers: a handler that called
 *   `preventDefault()` on the key keeps the layer open, and so does a key during IME composition.
 *   When it dismisses a layer it calls `preventDefault()` itself, so the browser's own close
 *   request (a native popover or dialog) doesn't act on the same key and close the layer below.
 * - **A press outside** is read on `pointerdown`, before the page can stop it. A touch press is
 *   reported when the finger lifts (and not at all if the gesture becomes a scroll), so scrolling
 *   the page doesn't close the layer.
 * - A press inside `ref` or on an `ignore` target never dismisses the layer.
 * - It adds nothing to the DOM and reads no `window` at import time, so it is safe on the server.
 *
 * @example
 * const popupRef = useRef<HTMLDivElement>(null)
 * useDismissableLayer({ open: isOpen, onDismiss: () => setIsOpen(false), ref: popupRef })
 */
export function useDismissableLayer({
  open,
  onDismiss,
  ref,
  ignore,
  dismissOnEscape = true,
  dismissOnOutsidePress = true,
}: UseDismissableLayerOptions): void {
  const id = useId()
  const env = useEnv()
  const latest = useRef({ onDismiss, ignore, dismissOnEscape, dismissOnOutsidePress })

  // The newest options, read by the listeners. Written before they can run, never during render.
  useLayoutEffect(() => {
    latest.current = { onDismiss, ignore, dismissOnEscape, dismissOnOutsidePress }
  })

  useEffect(() => {
    if (!open || env === undefined) {
      return
    }
    const { stack, elements } = getLayerRegistry()
    elements.set(id, () => ref.current)
    // Pushed once per opening, so the layer keeps its place in the stack while the options change:
    // the getters hand the stack the newest values.
    const removeLayer = stack.push(id, {
      ignore: [(target) => latest.current.ignore?.some((isIgnored) => isIgnored(target)) === true],
      get dismissOnEscape() {
        return latest.current.dismissOnEscape
      },
      get dismissOnOutsidePress() {
        return latest.current.dismissOnOutsidePress
      },
    })

    const contains = (layerId: string, target: unknown) =>
      isInsideElement(elements.get(layerId)?.(), target)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) {
        return
      }
      if (stack.handleEscape() === id) {
        // Handled: the browser's own close request (a native popover, a dialog) must not also
        // act on this key. Closing this layer first would otherwise leave the next one under
        // the key's default action, and one Escape would close two layers.
        event.preventDefault()
        latest.current.onDismiss('escape', event)
      }
    }

    /** The touch press waiting for its finger to lift. */
    let pendingTouch: number | undefined
    const handlePointerDown = (event: PointerEvent) => {
      pendingTouch = undefined
      if (stack.handleOutsidePress(event.target, contains) !== id) {
        return
      }
      if (event.pointerType === 'touch') {
        pendingTouch = event.pointerId
        return
      }
      latest.current.onDismiss('outside-press', event)
    }
    const handlePointerUp = (event: PointerEvent) => {
      if (pendingTouch !== event.pointerId) {
        return
      }
      pendingTouch = undefined
      if (stack.handleOutsidePress(event.target, contains) === id) {
        latest.current.onDismiss('outside-press', event)
      }
    }
    const handlePointerCancel = (event: PointerEvent) => {
      if (pendingTouch === event.pointerId) {
        pendingTouch = undefined
      }
    }

    const { document } = env
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('pointerup', handlePointerUp, true)
    document.addEventListener('pointercancel', handlePointerCancel, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('pointerup', handlePointerUp, true)
      document.removeEventListener('pointercancel', handlePointerCancel, true)
      removeLayer()
      elements.delete(id)
    }
  }, [open, env, id, ref])
}
