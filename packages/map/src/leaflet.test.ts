import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MapHandle, MapProvider } from '@kvirn-ui/core'
import { leaflet } from './leaflet.ts'

// Contract: the provider contract in map.md. The real engine runs; the tile URL is an inline
// image, so nothing leaves the page.

const blankTile = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
const view = { center: { longitude: 18, latitude: 59 }, zoom: 8 }

const containers: HTMLElement[] = []
const controllers: AbortController[] = []

function mountProvider(provider: MapProvider = leaflet({ tiles: blankTile })) {
  const container = document.createElement('div')
  container.style.cssText = 'position: relative; width: 400px; height: 300px'
  document.body.append(container)
  containers.push(container)
  const controller = new AbortController()
  controllers.push(controller)
  const handle = provider.mount(container, { view, signal: controller.signal })
  return { container, controller, handle }
}

afterEach(() => {
  for (const controller of controllers.splice(0)) controller.abort()
  for (const container of containers.splice(0)) container.remove()
})

function recordViews(handle: MapHandle, name: 'move' | 'moveend') {
  const views: unknown[] = []
  handle.on(name, (payload) => views.push(payload))
  return views
}

describe('leaflet adapter', () => {
  test('importing the entry makes no network request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    vi.resetModules()
    await import('./leaflet.ts')
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  test('mount starts at the given camera', () => {
    const { handle } = mountProvider()
    expect(handle.getView().zoom).toBeCloseTo(8)
    expect(handle.getView().center.longitude).toBeCloseTo(18)
    expect(handle.getView().center.latitude).toBeCloseTo(59)
  })

  test('mount turns the engine keyboard, controls and attribution off and hides its panes from AT', () => {
    const { container } = mountProvider()
    expect(container.getAttribute('tabindex')).toBeNull()
    expect(container.querySelector('.leaflet-control-zoom')).toBeNull()
    expect(container.querySelector('.leaflet-control-attribution')).toBeNull()
    expect(container.querySelector('.leaflet-map-pane')?.getAttribute('aria-hidden')).toBe('true')
  })

  test('setView and getView round-trip', () => {
    const { handle } = mountProvider()
    handle.setView({ center: { longitude: 10, latitude: 55 }, zoom: 5.5 })
    expect(handle.getView().zoom).toBeCloseTo(5.5)
    expect(handle.getView().center.longitude).toBeCloseTo(10)
    expect(handle.getView().center.latitude).toBeCloseTo(55)
  })

  test('getBounds surrounds the camera centre', () => {
    const { handle } = mountProvider()
    const bounds = handle.getBounds()
    expect(bounds.west).toBeLessThan(18)
    expect(bounds.east).toBeGreaterThan(18)
    expect(bounds.south).toBeLessThan(59)
    expect(bounds.north).toBeGreaterThan(59)
  })

  test('move and moveend write the new camera back', () => {
    const { handle } = mountProvider()
    const moves = recordViews(handle, 'move')
    const ends = recordViews(handle, 'moveend')
    handle.setView({ center: { longitude: 12, latitude: 56 }, zoom: 6 })
    expect(moves.at(-1)).toMatchObject({ zoom: 6 })
    expect(ends.at(-1)).toMatchObject({ center: { longitude: expect.closeTo(12, 3) } })
  })

  test('a removed listener hears nothing more', () => {
    const { handle } = mountProvider()
    const listener = vi.fn<() => void>()
    handle.on('moveend', listener)()
    handle.setView({ center: { longitude: 12, latitude: 56 }, zoom: 6 })
    expect(listener).not.toHaveBeenCalled()
  })

  test('fitBounds shows the whole box', () => {
    const { handle } = mountProvider()
    handle.fitBounds({ west: 10, south: 55, east: 20, north: 60 })
    const bounds = handle.getBounds()
    expect(bounds.west).toBeLessThanOrEqual(10.5)
    expect(bounds.east).toBeGreaterThanOrEqual(19.5)
  })

  test('project and unproject are inverses', () => {
    const { handle } = mountProvider()
    const point = handle.project({ longitude: 18.5, latitude: 59.2 })
    const position = handle.unproject(point)
    expect(position.longitude).toBeCloseTo(18.5, 2)
    expect(position.latitude).toBeCloseTo(59.2, 2)
  })

  test('the wheel with Ctrl zooms and without it only reports a wheel gesture', () => {
    const { container, handle } = mountProvider()
    const gestures: unknown[] = []
    handle.on('gesture', (kind) => gestures.push(kind))
    container.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true }))
    expect(gestures).toEqual(['wheel'])
    expect(handle.getView().zoom).toBeCloseTo(8)
    const zoomed = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, cancelable: true })
    container.dispatchEvent(zoomed)
    expect(zoomed.defaultPrevented).toBe(true)
    expect(handle.getView().zoom).toBeCloseTo(9)
    expect(gestures).toEqual(['wheel'])
  })

  test('one finger moving reports a touch gesture once and leaves the camera', () => {
    const { container, handle } = mountProvider()
    const gestures: unknown[] = []
    handle.on('gesture', (kind) => gestures.push(kind))
    const touch = new Touch({ identifier: 1, target: container, clientX: 10, clientY: 10 })
    for (let step = 0; step < 3; step += 1) {
      container.dispatchEvent(new TouchEvent('touchmove', { touches: [touch], bubbles: true }))
    }
    expect(gestures).toEqual(['touch'])
    expect(handle.getView().center.longitude).toBeCloseTo(18)
  })

  test('a mouse drag pans the camera', () => {
    const { container, handle } = mountProvider()
    const before = handle.getView().center.longitude
    const init = { pointerId: 1, pointerType: 'mouse', button: 0, bubbles: true }
    container.dispatchEvent(
      new PointerEvent('pointerdown', { ...init, clientX: 100, clientY: 100 }),
    )
    container.dispatchEvent(
      new PointerEvent('pointermove', { ...init, clientX: 150, clientY: 100 }),
    )
    container.dispatchEvent(new PointerEvent('pointerup', { ...init, clientX: 150, clientY: 100 }))
    expect(handle.getView().center.longitude).toBeLessThan(before)
  })

  test('setBaseMap swaps the tiles, keeps the camera and ignores an unknown id', () => {
    const provider = leaflet({
      baseMaps: [
        { id: 'streets', label: 'Streets', tiles: blankTile },
        { id: 'aerial', label: 'Aerial', tiles: blankTile, attribution: 'Aerial licence' },
      ],
      defaultBaseMap: 'streets',
    })
    expect(provider.baseMaps?.map((baseMap) => baseMap.id)).toEqual(['streets', 'aerial'])
    const { container, handle } = mountProvider(provider)
    handle.setView({ center: { longitude: 12, latitude: 56 }, zoom: 6 })
    handle.setBaseMap('aerial')
    handle.setBaseMap('missing')
    expect(container.querySelectorAll('.leaflet-tile-pane .leaflet-layer')).toHaveLength(1)
    expect(handle.getView().zoom).toBeCloseTo(6)
  })

  test('aborting the signal removes the engine and its listeners', () => {
    const { container, controller, handle } = mountProvider()
    const listener = vi.fn<() => void>()
    handle.on('move', listener)
    controller.abort()
    expect(container.querySelector('.leaflet-map-pane')).toBeNull()
    container.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, ctrlKey: true }))
    expect(listener).not.toHaveBeenCalled()
  })
})
