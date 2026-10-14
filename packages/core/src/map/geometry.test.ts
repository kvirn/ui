import { describe, expect, it } from 'vite-plus/test'
import { boundsOfView, viewWithPositionAt } from './geometry.ts'

describe('viewWithPositionAt', () => {
  const position = { longitude: 18.07, latitude: 59.33 }
  const size = { width: 800, height: 600 }

  it('centres the position at the middle anchor', () => {
    const view = viewWithPositionAt(position, 15, size, { x: 0.5, y: 0.5 })
    expect(view.zoom).toBe(15)
    expect(view.center.longitude).toBeCloseTo(position.longitude, 6)
    expect(view.center.latitude).toBeCloseTo(position.latitude, 6)
  })

  it('draws the position below the middle for a low anchor, with room above it', () => {
    const view = viewWithPositionAt(position, 15, size, { x: 0.5, y: 0.85 })
    const bounds = boundsOfView(view, size)
    const fromTop = (bounds.north - position.latitude) / (bounds.north - bounds.south)
    expect(fromTop).toBeGreaterThan(0.8)
    expect(fromTop).toBeLessThan(0.9)
    expect(position.longitude).toBeGreaterThan(bounds.west)
    expect(position.longitude).toBeLessThan(bounds.east)
  })
})
