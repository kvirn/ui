import { panBy } from '@kvirn-ui/core'
import type { MapHandle, MapView } from '@kvirn-ui/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { readMoveAnimation } from './use-map-popup.ts'

// The focus ring (3px) plus a small gap, so the ring itself is never under chrome (WCAG 2.4.11).
const CLEARANCE = 8
const TOLERANCE = 0.5

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

const intersects = (a: Box, b: Box) =>
  a.left < b.right - TOLERANCE &&
  a.right > b.left + TOLERANCE &&
  a.top < b.bottom - TOLERANCE &&
  a.bottom > b.top + TOLERANCE

const isInside = (inner: Box, outer: Box) =>
  inner.left >= outer.left - TOLERANCE &&
  inner.right <= outer.right + TOLERANCE &&
  inner.top >= outer.top - TOLERANCE &&
  inner.bottom <= outer.bottom + TOLERANCE

const shifted = (box: Box, x: number, y: number): Box => ({
  left: box.left + x,
  right: box.right + x,
  top: box.top + y,
  bottom: box.bottom + y,
})

const boxOf = (rect: DOMRect): Box => ({
  left: rect.left,
  top: rect.top,
  right: rect.right,
  bottom: rect.bottom,
})

/**
 * The smallest shift of `box` (screen pixels) that puts it inside `viewport` and clear of every
 * obstacle, or the one that centres it when there is no room for it.
 */
export function clearingShift(
  box: Box,
  viewport: Box,
  obstacles: readonly Box[],
): { x: number; y: number } {
  const fitX = Math.max(0, viewport.left - box.left) + Math.min(0, viewport.right - box.right)
  const fitY = Math.max(0, viewport.top - box.top) + Math.min(0, viewport.bottom - box.bottom)
  const xs = new Set([0, fitX])
  const ys = new Set([0, fitY])
  for (const obstacle of obstacles) {
    xs.add(obstacle.left - box.right)
    xs.add(obstacle.right - box.left)
    ys.add(obstacle.top - box.bottom)
    ys.add(obstacle.bottom - box.top)
  }
  let best: { x: number; y: number } | null = null
  for (const x of xs) {
    for (const y of ys) {
      const candidate = shifted(box, x, y)
      if (
        isInside(candidate, viewport) &&
        !obstacles.some((obstacle) => intersects(candidate, obstacle)) &&
        (best === null || Math.hypot(x, y) < Math.hypot(best.x, best.y))
      ) {
        best = { x, y }
      }
    }
  }
  return (
    best ?? {
      x: (viewport.left + viewport.right) / 2 - (box.left + box.right) / 2,
      y: (viewport.top + viewport.bottom) / 2 - (box.top + box.bottom) / 2,
    }
  )
}

export interface UseMapClearanceOptions {
  handle: MapHandle | null
  viewportId: string
  moveTo: (view: MapView, motion?: { animate: boolean; duration: number }) => void
}

/**
 * Floating chrome registers here, and a marker focused by keyboard asks to be kept clear of it
 * (WCAG 2.4.11). The pan is not announced: a focus move is not a view change the user asked for.
 */
export function useMapClearance({ handle, viewportId, moveTo }: UseMapClearanceOptions) {
  const [overlays] = useState(() => new Set<HTMLElement>())
  const frame = useRef(0)
  const latest = useRef({ handle, viewportId, moveTo })
  useEffect(() => {
    latest.current = { handle, viewportId, moveTo }
  })
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const registerOverlay = useCallback(
    (element: HTMLElement) => {
      overlays.add(element)
      return () => {
        overlays.delete(element)
      }
    },
    [overlays],
  )

  const keepClear = useCallback(
    (element: HTMLElement) => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const { handle: engine, viewportId: id, moveTo: move } = latest.current
        const viewportElement = document.getElementById(id)
        if (
          !engine ||
          !viewportElement ||
          !element.isConnected ||
          !element.matches(':focus-visible')
        ) {
          return
        }
        const viewport = boxOf(viewportElement.getBoundingClientRect())
        const rect = element.getBoundingClientRect()
        const box = {
          left: rect.left - CLEARANCE,
          top: rect.top - CLEARANCE,
          right: rect.right + CLEARANCE,
          bottom: rect.bottom + CLEARANCE,
        }
        const obstacles = [...overlays]
          .filter((overlay) => overlay.isConnected)
          .map((overlay) => boxOf(overlay.getBoundingClientRect()))
        if (isInside(box, viewport) && !obstacles.some((obstacle) => intersects(box, obstacle))) {
          return
        }
        const shift = clearingShift(box, viewport, obstacles)
        const size = engine.getSize()
        // The content moves with the camera the other way.
        move(
          panBy(engine.getView(), { x: -shift.x / size.width, y: -shift.y / size.height }, size),
          readMoveAnimation(),
        )
      })
    },
    [overlays],
  )

  return { registerOverlay, keepClear }
}
