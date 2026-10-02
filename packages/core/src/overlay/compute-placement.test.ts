import { describe, expect, test } from 'vite-plus/test'
import { computePlacement } from './compute-placement.ts'
import type { OverlayRect, OverlaySize, Placement } from './compute-placement.ts'

const viewport: OverlayRect = { x: 0, y: 0, width: 1000, height: 800 }
const anchor: OverlayRect = { x: 100, y: 100, width: 200, height: 40 }
const popup: OverlaySize = { width: 150, height: 200 }
const narrow320: OverlayRect = { x: 0, y: 0, width: 320, height: 480 }

describe('computePlacement: default placement', () => {
  test('puts the popup below the anchor, start-aligned, when there is room', () => {
    expect(computePlacement(anchor, popup, viewport)).toEqual({
      x: 100,
      y: 140,
      placement: 'bottom-start',
      maxHeight: 660,
      width: 150,
    })
  })

  test('leaves a gap of `offset` between the anchor and the popup', () => {
    const result = computePlacement(anchor, popup, viewport, { offset: 8 })
    expect(result.y).toBe(148)
    expect(result.maxHeight).toBe(652)
  })

  test('treats a negative or non-finite offset and padding as 0', () => {
    const result = computePlacement(anchor, popup, viewport, {
      offset: -5,
      padding: Number.NaN,
    })
    expect(result.y).toBe(140)
    expect(result.maxHeight).toBe(660)
  })

  test('aligns to the center and to the end', () => {
    expect(computePlacement(anchor, popup, viewport, { placement: 'bottom' })).toMatchObject({
      x: 125,
      placement: 'bottom',
    })
    expect(computePlacement(anchor, popup, viewport, { placement: 'bottom-end' })).toMatchObject({
      x: 150,
      placement: 'bottom-end',
    })
  })
})

describe('computePlacement: flip', () => {
  const lowAnchor: OverlayRect = { x: 100, y: 700, width: 200, height: 40 }

  test('flips above the anchor when it does not fit below and the top has more room', () => {
    expect(computePlacement(lowAnchor, popup, viewport)).toEqual({
      x: 100,
      y: 500,
      placement: 'top-start',
      maxHeight: 700,
      width: 150,
    })
  })

  test('keeps the gap when flipped', () => {
    const result = computePlacement(lowAnchor, popup, viewport, { offset: 10 })
    expect(result.placement).toBe('top-start')
    expect(result.y).toBe(490)
    expect(result.maxHeight).toBe(690)
  })

  test('flips by the padded viewport, not the raw one', () => {
    // Bottom room: 800 - 10 - 740 = 50, top room: 700 - 10 = 690.
    const result = computePlacement(lowAnchor, popup, viewport, { padding: 10 })
    expect(result.placement).toBe('top-start')
    expect(result.maxHeight).toBe(690)
  })

  test('stays below when the opposite side has less room', () => {
    const shortViewport: OverlayRect = { x: 0, y: 0, width: 1000, height: 400 }
    const result = computePlacement(
      { x: 100, y: 150, width: 200, height: 40 },
      { width: 150, height: 300 },
      shortViewport,
    )
    // Below: 400 - 190 = 210, above: 150. Neither fits, below has more.
    expect(result).toMatchObject({ placement: 'bottom-start', y: 190, maxHeight: 210 })
  })

  test('does not flip when the preferred side fits', () => {
    const result = computePlacement(lowAnchor, { width: 150, height: 40 }, viewport)
    expect(result.placement).toBe('bottom-start')
  })

  test('flips a top placement below when there is no room above', () => {
    const result = computePlacement(anchor, popup, viewport, {
      placement: 'top-start',
      padding: 90,
    })
    // Above: 100 - 90 = 10, below: 710 - 140 = 570.
    expect(result.placement).toBe('bottom-start')
  })

  test('flips end to start beside the anchor', () => {
    const result = computePlacement(
      { x: 800, y: 300, width: 100, height: 40 },
      { width: 150, height: 100 },
      viewport,
      { placement: 'end-start' },
    )
    expect(result).toMatchObject({ placement: 'start-start', x: 650, y: 300 })
  })
})

describe('computePlacement: shift', () => {
  test('shifts left to stay inside the right edge', () => {
    const result = computePlacement({ x: 900, y: 100, width: 80, height: 40 }, popup, viewport)
    expect(result.x).toBe(850)
    expect(result.y).toBe(140)
  })

  test('keeps `padding` from the right edge', () => {
    const result = computePlacement({ x: 900, y: 100, width: 80, height: 40 }, popup, viewport, {
      padding: 8,
    })
    expect(result.x).toBe(842)
  })

  test('shifts right to stay inside the left edge', () => {
    const result = computePlacement({ x: -20, y: 100, width: 80, height: 40 }, popup, viewport)
    expect(result.x).toBe(0)
  })

  test('shifts vertically beside the anchor to stay inside the viewport', () => {
    const result = computePlacement(
      { x: 400, y: 760, width: 100, height: 30 },
      { width: 150, height: 200 },
      viewport,
      { placement: 'end-start' },
    )
    expect(result).toMatchObject({ placement: 'end-start', x: 500, y: 600 })
  })
})

describe('computePlacement: maxHeight', () => {
  test('limits maxHeight to the room on the chosen side when the popup is taller', () => {
    const result = computePlacement(anchor, { width: 150, height: 1000 }, viewport)
    expect(result).toMatchObject({ placement: 'bottom-start', y: 140, maxHeight: 660 })
  })

  test('puts a clipped popup above the anchor against the anchor, not the viewport edge', () => {
    const result = computePlacement(
      { x: 100, y: 700, width: 200, height: 40 },
      { width: 150, height: 1000 },
      viewport,
    )
    expect(result.placement).toBe('top-start')
    expect(result.maxHeight).toBe(700)
    expect(result.y).toBe(0)
  })

  test('is the room below the anchor even when the popup would fit in less', () => {
    expect(computePlacement(anchor, { width: 150, height: 20 }, viewport).maxHeight).toBe(660)
  })

  test('is never more than the viewport minus padding, with the anchor scrolled far out of view', () => {
    const above = { x: 100, y: -1500, width: 200, height: 40 }
    const result = computePlacement(above, { width: 150, height: 3000 }, viewport, { padding: 8 })
    expect(result.placement).toBe('bottom-start')
    expect(result.maxHeight).toBe(800 - 2 * 8)
    const below = computePlacement(
      { x: 100, y: 2500, width: 200, height: 40 },
      { width: 150, height: 3000 },
      viewport,
      { padding: 8 },
    )
    expect(below.maxHeight).toBe(800 - 2 * 8)
  })

  test('is never negative when the anchor is out of view', () => {
    const result = computePlacement({ x: 100, y: 900, width: 200, height: 40 }, popup, viewport, {
      placement: 'bottom-start',
    })
    expect(result.maxHeight).toBeGreaterThanOrEqual(0)
  })
})

describe('computePlacement: right to left', () => {
  test('resolves bottom-start to the anchor end edge', () => {
    const result = computePlacement(anchor, popup, viewport, { direction: 'rtl' })
    expect(result.x).toBe(150)
    expect(result.placement).toBe('bottom-start')
  })

  test('resolves bottom-end to the anchor start edge', () => {
    const result = computePlacement(anchor, popup, viewport, {
      direction: 'rtl',
      placement: 'bottom-end',
    })
    expect(result.x).toBe(100)
  })

  test('ltr bottom-end aligns the right edges', () => {
    expect(computePlacement(anchor, popup, viewport, { placement: 'bottom-end' }).x).toBe(150)
  })

  test('start is on the left in ltr and on the right in rtl', () => {
    const middle: OverlayRect = { x: 400, y: 300, width: 100, height: 40 }
    const small: OverlaySize = { width: 150, height: 100 }
    expect(computePlacement(middle, small, viewport, { placement: 'start-start' })).toMatchObject({
      x: 250,
      y: 300,
    })
    expect(
      computePlacement(middle, small, viewport, { placement: 'start-start', direction: 'rtl' }),
    ).toMatchObject({ x: 500, y: 300 })
  })

  test('end is on the right in ltr and on the left in rtl', () => {
    const middle: OverlayRect = { x: 400, y: 300, width: 100, height: 40 }
    const small: OverlaySize = { width: 150, height: 100 }
    expect(computePlacement(middle, small, viewport, { placement: 'end-start' })).toMatchObject({
      x: 500,
    })
    expect(
      computePlacement(middle, small, viewport, { placement: 'end-start', direction: 'rtl' }),
    ).toMatchObject({ x: 250 })
  })

  test('flips logically in rtl', () => {
    // At the left edge in rtl, `end` is on the left and has no room, so it flips to `start` (the right).
    const result = computePlacement(
      { x: 20, y: 300, width: 100, height: 40 },
      { width: 150, height: 100 },
      viewport,
      { placement: 'end-start', direction: 'rtl' },
    )
    expect(result).toMatchObject({ placement: 'start-start', x: 120 })
  })
})

describe('computePlacement: width', () => {
  test('matchAnchorWidth makes the popup as wide as the anchor', () => {
    expect(computePlacement(anchor, popup, viewport, { matchAnchorWidth: true }).width).toBe(200)
  })

  test('minWidth raises the width, with or without matchAnchorWidth', () => {
    expect(computePlacement(anchor, popup, viewport, { minWidth: 300 }).width).toBe(300)
    expect(
      computePlacement(anchor, popup, viewport, { matchAnchorWidth: true, minWidth: 300 }).width,
    ).toBe(300)
    expect(
      computePlacement(anchor, { width: 50, height: 10 }, viewport, { minWidth: 120 }).width,
    ).toBe(120)
  })

  test('a wide popup is never wider than the viewport minus padding', () => {
    const narrow: OverlayRect = { x: 0, y: 0, width: 250, height: 800 }
    expect(
      computePlacement(anchor, popup, narrow, {
        matchAnchorWidth: true,
        minWidth: 300,
        padding: 8,
      }).width,
    ).toBe(234)
    expect(computePlacement(anchor, { width: 900, height: 50 }, narrow).width).toBe(250)
  })

  test('shifts a matched-width popup so it stays inside the viewport', () => {
    const result = computePlacement({ x: 150, y: 100, width: 200, height: 40 }, popup, narrow320, {
      matchAnchorWidth: true,
    })
    expect(result.width).toBe(200)
    expect(result.x).toBe(120)
  })
})

describe('computePlacement: tiny viewport', () => {
  test('fits a large popup into a small viewport with padding', () => {
    const result = computePlacement(
      { x: 10, y: 10, width: 50, height: 20 },
      { width: 300, height: 300 },
      { x: 0, y: 0, width: 100, height: 100 },
      { padding: 8 },
    )
    // Width 100 - 16 = 84. Below: 92 - 30 = 62. Above: 10 - 8 = 2.
    expect(result).toEqual({ x: 8, y: 30, placement: 'bottom-start', maxHeight: 62, width: 84 })
  })

  test('collapses to zero size instead of returning NaN when padding exceeds the viewport', () => {
    const result = computePlacement(
      { x: 2, y: 2, width: 4, height: 4 },
      { width: 100, height: 100 },
      { x: 0, y: 0, width: 10, height: 10 },
      { padding: 8 },
    )
    expect(result.width).toBe(0)
    for (const value of [result.x, result.y, result.maxHeight, result.width]) {
      expect(Number.isFinite(value)).toBe(true)
    }
    expect(result.maxHeight).toBe(0)
  })

  test('falls back to below the anchor when a wide popup does not fit beside it', () => {
    const result = computePlacement(
      { x: 100, y: 100, width: 100, height: 40 },
      { width: 300, height: 100 },
      narrow320,
      { placement: 'end-start' },
    )
    // 300 wide fits in neither 120 on the right nor 100 on the left, so it goes below and shifts.
    expect(result).toMatchObject({ placement: 'bottom-start', x: 20, y: 140, width: 300 })
  })

  test('falls back above the anchor when the bottom has less room', () => {
    const result = computePlacement(
      { x: 100, y: 400, width: 100, height: 40 },
      { width: 300, height: 100 },
      narrow320,
      { placement: 'start-center' },
    )
    // Below: 480 - 440 = 40, above: 400. Neither fits 100, above has more.
    expect(result.placement).toBe('top')
    expect(result.y).toBe(300)
  })
})

describe('computePlacement: never covers the anchor (2.4.11)', () => {
  const sides = ['top', 'bottom', 'start', 'end'] as const
  const alignments = ['start', 'center', 'end'] as const
  const placements: Placement[] = sides.flatMap((side) => [
    side,
    ...alignments.map((alignment) => `${side}-${alignment}` as Placement),
  ])

  const scenarios: { viewport: OverlayRect; anchors: OverlayRect[] }[] = [
    {
      viewport,
      anchors: [20, 450, 880].flatMap((x) =>
        [20, 380, 700].map((y) => ({ x, y, width: 80, height: 40 })),
      ),
    },
    {
      viewport: narrow320,
      anchors: [20, 120, 220].flatMap((x) =>
        [20, 200, 420].map((y) => ({ x, y, width: 80, height: 40 })),
      ),
    },
  ]
  const popups: OverlaySize[] = [
    { width: 40, height: 20 },
    { width: 180, height: 300 },
    { width: 600, height: 900 },
  ]

  test('keeps the popup off the anchor and inside the viewport for every combination', () => {
    let checked = 0
    const failures: string[] = []
    for (const { viewport: area, anchors } of scenarios) {
      for (const anchorRect of anchors) {
        for (const size of popups) {
          for (const requested of placements) {
            for (const direction of ['ltr', 'rtl'] as const) {
              for (const matchAnchorWidth of [false, true]) {
                const options = { placement: requested, direction, offset: 4, padding: 8 }
                const result = computePlacement(anchorRect, size, area, {
                  ...options,
                  matchAnchorWidth,
                })
                const label = JSON.stringify({
                  anchorRect,
                  size,
                  area,
                  ...options,
                  matchAnchorWidth,
                  result,
                })
                const height = Math.min(size.height, result.maxHeight)
                const popupRect = { x: result.x, y: result.y, width: result.width, height }

                const overlaps =
                  popupRect.x < anchorRect.x + anchorRect.width &&
                  popupRect.x + popupRect.width > anchorRect.x &&
                  popupRect.y < anchorRect.y + anchorRect.height &&
                  popupRect.y + popupRect.height > anchorRect.y
                const inside =
                  popupRect.x >= 8 &&
                  popupRect.x + popupRect.width <= area.width - 8 &&
                  popupRect.y >= 8 &&
                  popupRect.y + popupRect.height <= area.height - 8
                if (overlaps || !inside) failures.push(label)
                checked++
              }
            }
          }
        }
      }
    }
    expect(failures).toEqual([])
    expect(checked).toBeGreaterThan(1000)
  })
})
