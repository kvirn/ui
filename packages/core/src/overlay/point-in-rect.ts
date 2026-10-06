export interface PointerPoint {
  x: number
  y: number
}

export interface PointerRect {
  left: number
  top: number
  right: number
  bottom: number
}

/** Whether `point` is in `rect`, edges included. */
export function isPointInsideRect(point: PointerPoint, rect: PointerRect): boolean {
  return (
    point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
  )
}
