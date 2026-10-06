import { describe, expect, test } from 'vite-plus/test'
import { isPointInsideRect } from './point-in-rect.ts'

const rect = { left: 10, top: 20, right: 110, bottom: 220 }

describe('isPointInsideRect', () => {
  test('a point inside is inside', () => {
    expect(isPointInsideRect({ x: 50, y: 100 }, rect)).toBe(true)
  })

  test('the edges and corners are inside', () => {
    expect(isPointInsideRect({ x: 10, y: 100 }, rect)).toBe(true)
    expect(isPointInsideRect({ x: 110, y: 100 }, rect)).toBe(true)
    expect(isPointInsideRect({ x: 50, y: 20 }, rect)).toBe(true)
    expect(isPointInsideRect({ x: 50, y: 220 }, rect)).toBe(true)
    expect(isPointInsideRect({ x: 110, y: 220 }, rect)).toBe(true)
  })

  test('a point past any side is outside', () => {
    expect(isPointInsideRect({ x: 9, y: 100 }, rect)).toBe(false)
    expect(isPointInsideRect({ x: 111, y: 100 }, rect)).toBe(false)
    expect(isPointInsideRect({ x: 50, y: 19 }, rect)).toBe(false)
    expect(isPointInsideRect({ x: 50, y: 221 }, rect)).toBe(false)
  })
})
