import type { Direction } from '../locale/resolve-direction.ts'

/** A rectangle in viewport coordinates. Plain numbers, so a `DOMRect` fits and Node tests need no DOM. */
export interface OverlayRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface OverlaySize {
  readonly width: number
  readonly height: number
}

/**
 * Which side of the anchor the popup sits on. `start` and `end` are logical: they follow the
 * reading direction, so `start` is on the left in `ltr` and on the right in `rtl`.
 */
export type PlacementSide = 'top' | 'bottom' | 'start' | 'end'

/** How the popup lines up with the anchor along the other axis. Also logical, in the inline axis. */
export type PlacementAlignment = 'start' | 'center' | 'end'

/** A side, optionally with an alignment: `'bottom'`, `'bottom-start'`, `'end-center'`. No alignment means centered. */
export type Placement = PlacementSide | `${PlacementSide}-${PlacementAlignment}`

export interface PlacementOptions {
  /** Where to put the popup when there is room. Default `'bottom-start'`. */
  placement?: Placement | undefined
  /** The reading direction, which resolves `start` and `end`. Default `'ltr'`. */
  direction?: Direction | undefined
  /** The gap between the anchor and the popup, in pixels. Default 0. */
  offset?: number | undefined
  /** The space to keep between the popup and the viewport edge, in pixels. Default 0. */
  padding?: number | undefined
  /** Make the popup exactly as wide as the anchor (a Select or Combobox listbox). Default `false`. */
  matchAnchorWidth?: boolean | undefined
  /** The popup is never narrower than this, unless the viewport is. Default 0. */
  minWidth?: number | undefined
}

export interface ComputedPlacement {
  /** The left edge of the popup in viewport coordinates. */
  x: number
  /** The top edge of the popup in viewport coordinates. */
  y: number
  /**
   * The placement actually used, in the same vocabulary as the input (no `-center` suffix). It
   * differs from the requested one when the popup flipped, or fell back to the top or bottom
   * because it did not fit beside the anchor.
   */
  placement: Placement
  /** The tallest the popup may be here. The room left on its side of the anchor, never below 0 and never above the viewport minus `padding`. */
  maxHeight: number
  /** The width the popup should have: never wider than the viewport minus `padding`. */
  width: number
}

interface Bounds {
  left: number
  right: number
  top: number
  bottom: number
}

type PhysicalSide = 'top' | 'bottom' | 'left' | 'right'

const oppositeSides: Record<PlacementSide, PlacementSide> = {
  top: 'bottom',
  bottom: 'top',
  start: 'end',
  end: 'start',
}

function nonNegative(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : 0
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function parsePlacement(placement: Placement): {
  side: PlacementSide
  alignment: PlacementAlignment
} {
  const [side, alignment] = placement.split('-') as [PlacementSide, PlacementAlignment | undefined]
  return { side, alignment: alignment ?? 'center' }
}

function formatPlacement(side: PlacementSide, alignment: PlacementAlignment): Placement {
  return alignment === 'center' ? side : `${side}-${alignment}`
}

/** The viewport shrunk by `padding`. On a viewport smaller than the padding it collapses to a point. */
function insetViewport(viewport: OverlayRect, padding: number): Bounds {
  let left = viewport.x + padding
  let right = viewport.x + viewport.width - padding
  let top = viewport.y + padding
  let bottom = viewport.y + viewport.height - padding
  if (right < left) {
    left = right = (left + right) / 2
  }
  if (bottom < top) {
    top = bottom = (top + bottom) / 2
  }
  return { left, right, top, bottom }
}

/**
 * Works out where a popup goes next to its anchor. Pure: pass measured rectangles in,
 * apply `x`, `y`, `width` and `maxHeight` to the popup.
 *
 * - It starts on the requested side and **flips** to the opposite one when the popup does not fit
 *   there and the other side has more room.
 * - A popup placed beside the anchor (`start` and `end`) that fits on neither side falls back to
 *   the top or bottom, whichever has more room, so it never ends up squeezed or off-screen (1.4.10).
 * - It **shifts** along the other axis to stay inside the viewport, keeping `padding` from the edges.
 * - It limits `maxHeight` to the room on the chosen side, and never to more than the viewport
 *   minus `padding` (an anchor scrolled out of view leaves more room than the screen has). A
 *   popup that is still too tall is expected to scroll inside.
 * - It never overlaps the anchor, so the control the user is working in is never covered (2.4.11).
 *   This holds even when the anchor is partly outside the viewport.
 */
export function computePlacement(
  anchor: OverlayRect,
  popup: OverlaySize,
  viewport: OverlayRect,
  options: PlacementOptions = {},
): ComputedPlacement {
  const { placement = 'bottom-start', direction = 'ltr', matchAnchorWidth = false } = options
  const offset = nonNegative(options.offset)
  const padding = nonNegative(options.padding)
  const minWidth = nonNegative(options.minWidth)
  const rightToLeft = direction === 'rtl'

  const bounds = insetViewport(viewport, padding)
  const anchorRight = anchor.x + anchor.width
  const anchorBottom = anchor.y + anchor.height

  const width = Math.min(
    Math.max(matchAnchorWidth ? anchor.width : popup.width, minWidth),
    bounds.right - bounds.left,
  )
  const popupHeight = nonNegative(popup.height)

  /** The room on each physical side of the anchor, after the gap. Negative when the anchor is out of view. */
  const space: Record<PhysicalSide, number> = {
    top: anchor.y - offset - bounds.top,
    bottom: bounds.bottom - (anchorBottom + offset),
    left: anchor.x - offset - bounds.left,
    right: bounds.right - (anchorRight + offset),
  }
  const physicalSide = (side: PlacementSide): PhysicalSide => {
    if (side === 'start') {
      return rightToLeft ? 'right' : 'left'
    }
    if (side === 'end') {
      return rightToLeft ? 'left' : 'right'
    }
    return side
  }
  const isVertical = (side: PlacementSide) => side === 'top' || side === 'bottom'

  const chooseSide = (preferred: PlacementSide): PlacementSide => {
    const needed = isVertical(preferred) ? popupHeight : width
    const preferredSpace = space[physicalSide(preferred)]
    const otherSpace = space[physicalSide(oppositeSides[preferred])]
    return preferredSpace < needed && otherSpace > preferredSpace
      ? oppositeSides[preferred]
      : preferred
  }

  const requested = parsePlacement(placement)
  let side = chooseSide(requested.side)
  if (!isVertical(side) && space[physicalSide(side)] < width) {
    // Beside the anchor on neither side: go above or below instead of squeezing.
    side = chooseSide('bottom')
  }
  const { alignment } = requested

  if (isVertical(side)) {
    // The room on that side, but never more than the padded viewport: with the anchor scrolled out
    // of view, the room on the far side is taller than the screen.
    const maxHeight = clamp(space[side as 'top' | 'bottom'], 0, bounds.bottom - bounds.top)
    const height = Math.min(popupHeight, maxHeight)
    const y = side === 'bottom' ? anchorBottom + offset : anchor.y - offset - height
    const startX = rightToLeft ? anchorRight - width : anchor.x
    const endX = rightToLeft ? anchor.x : anchorRight - width
    const alignedX =
      alignment === 'start'
        ? startX
        : alignment === 'end'
          ? endX
          : anchor.x + (anchor.width - width) / 2
    return {
      x: clamp(alignedX, bounds.left, bounds.right - width),
      y,
      placement: formatPlacement(side, alignment),
      maxHeight,
      width,
    }
  }

  const maxHeight = bounds.bottom - bounds.top
  const height = Math.min(popupHeight, maxHeight)
  const x = physicalSide(side) === 'left' ? anchor.x - offset - width : anchorRight + offset
  // Beside the anchor, start and end align the block axis: top edges and bottom edges.
  const alignedY =
    alignment === 'start'
      ? anchor.y
      : alignment === 'end'
        ? anchorBottom - height
        : anchor.y + (anchor.height - height) / 2
  return {
    x,
    y: clamp(alignedY, bounds.top, bounds.bottom - height),
    placement: formatPlacement(side, alignment),
    maxHeight,
    width,
  }
}
