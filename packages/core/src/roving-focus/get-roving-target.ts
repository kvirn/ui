import type { Direction } from '../locale/resolve-direction.ts'

/** The axis the arrow keys move along: `horizontal` uses Left and Right, `vertical` Up and Down. */
export type RovingOrientation = 'horizontal' | 'vertical'

export interface RovingTargetInput {
  /** `KeyboardEvent.key`. */
  key: string
  /** The index of the item that has focus, or `-1` when none has. */
  currentIndex: number
  /** How many items there are, in DOM order. */
  count: number
  orientation: RovingOrientation
  /** The reading direction. Left and Right flip in `rtl`, Up and Down never do. */
  direction: Direction
  /** Whether the arrows wrap from the last item to the first, and back. */
  loop: boolean
}

/**
 * Where focus goes inside a composite widget with a roving tabindex (APG Toolbar, and later
 * Tabs, Menu and RadioGroup-like widgets). Pure index maths, with no DOM.
 *
 * - **Returns the index to focus,** which is `currentIndex` when the key is owned but there is
 *   nowhere to go (an end without `loop`), so the caller can still stop the key's default.
 * - **Returns `null`** for a key it doesn't own, and when there are no items: leave the event alone.
 * - Owns `Home` and `End` always, and the two arrows of the `orientation`. Left and Right mean
 *   previous and next in the reading direction, so they flip in `rtl`.
 * - With no current item (`-1`), forward goes to the first item and backward to the last
 *   (or the first without `loop`).
 *
 * @example
 * getRovingTarget({ key: 'ArrowRight', currentIndex: 3, count: 4, orientation: 'horizontal', direction: 'ltr', loop: true }) // 0
 */
export function getRovingTarget({
  key,
  currentIndex,
  count,
  orientation,
  direction,
  loop,
}: RovingTargetInput): number | null {
  if (count <= 0) {
    return null
  }
  if (key === 'Home') {
    return 0
  }
  if (key === 'End') {
    return count - 1
  }

  const step = stepFor(key, orientation, direction)
  if (step === null) {
    return null
  }

  const lastIndex = count - 1
  const index = Math.min(currentIndex, lastIndex)
  if (step === 1) {
    if (index < lastIndex) {
      return index + 1
    }
    return loop ? 0 : lastIndex
  }
  if (index > 0) {
    return index - 1
  }
  // From the first item, or from no item at all.
  return loop ? lastIndex : 0
}

/** `1` for next, `-1` for previous, `null` when the key isn't an arrow of this orientation. */
function stepFor(key: string, orientation: RovingOrientation, direction: Direction): 1 | -1 | null {
  if (orientation === 'vertical') {
    if (key === 'ArrowDown') {
      return 1
    }
    return key === 'ArrowUp' ? -1 : null
  }
  if (key !== 'ArrowRight' && key !== 'ArrowLeft') {
    return null
  }
  const isForward = (key === 'ArrowRight') === (direction === 'ltr')
  return isForward ? 1 : -1
}
