import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MapHandle } from '@kvirn-ui/core'
import { google, type GoogleMapsApi } from './google.ts'

// Contract: the provider contract in map.md. `google.maps` is a fake at the engine boundary:
// no script is loaded and nothing leaves the page.

type Listener = () => void

function createFakeMaps() {
  const listeners = new Map<string, Set<Listener>>()
  const state = { center: { lat: 0, lng: 0 }, zoom: 0, mapTypeId: '' }
  const calls = { moveCamera: [] as unknown[], panTo: [] as unknown[], fitBounds: [] as unknown[] }
  let options: Record<string, unknown> = {}

  class FakeMap {
    constructor(_container: HTMLElement, initial: Record<string, unknown>) {
      options = initial
      state.center = initial.center as typeof state.center
      state.zoom = initial.zoom as number
      state.mapTypeId = initial.mapTypeId as string
    }
    getCenter() {
      return { lat: () => state.center.lat, lng: () => state.center.lng }
    }
    getZoom() {
      return state.zoom
    }
    moveCamera(camera: { center: typeof state.center; zoom: number }) {
      calls.moveCamera.push(camera)
      state.center = camera.center
      state.zoom = camera.zoom
    }
    panTo(center: typeof state.center) {
      calls.panTo.push(center)
      state.center = center
    }
    fitBounds(bounds: unknown, padding?: number) {
      calls.fitBounds.push({ bounds, padding })
    }
    setMapTypeId(id: string) {
      state.mapTypeId = id
    }
    addListener(event: string, listener: Listener) {
      const set = listeners.get(event) ?? new Set()
      listeners.set(event, set)
      set.add(listener)
      return { remove: () => set.delete(listener) }
    }
  }

  return {
    api: { Map: FakeMap } as unknown as GoogleMapsApi,
    calls,
    state,
    options: () => options,
    fire: (event: string) => {
      for (const listener of listeners.get(event) ?? []) listener()
    },
    listenerCount: (event: string) => listeners.get(event)?.size ?? 0,
  }
}

const view = { center: { longitude: 18, latitude: 59 }, zoom: 8 }
const containers: HTMLElement[] = []
const controllers: AbortController[] = []

function mountWith(
  fake: ReturnType<typeof createFakeMaps>,
  load = () => Promise.resolve(fake.api),
) {
  const container = document.createElement('div')
  container.style.cssText = 'width: 400px; height: 300px'
  document.body.append(container)
  containers.push(container)
  const controller = new AbortController()
  controllers.push(controller)
  const loader = vi.fn<() => Promise<GoogleMapsApi>>(load)
  const provider = google({ loader })
  const handle = provider.mount(container, { view, signal: controller.signal })
  return { container, controller, handle, loader, provider }
}

const ready = () => new Promise((resolve) => setTimeout(resolve, 0))

afterEach(() => {
  for (const controller of controllers.splice(0)) controller.abort()
  for (const container of containers.splice(0)) container.remove()
})

describe('google adapter', () => {
  test('importing the entry loads no script and makes no network request', async () => {
    const scriptsBefore = document.querySelectorAll('script').length
    vi.resetModules()
    await import('./google.ts')
    expect(document.querySelectorAll('script')).toHaveLength(scriptsBefore)
  })

  test('the loader runs when the map mounts, not when the provider is made', () => {
    const loader = vi.fn<() => Promise<GoogleMapsApi>>(() => Promise.resolve(createFakeMaps().api))
    const provider = google({ loader })
    expect(loader).not.toHaveBeenCalled()
    const container = document.createElement('div')
    provider.mount(container, { view })
    expect(loader).toHaveBeenCalledTimes(1)
  })

  test('mount creates the map with cooperative gestures, the keyboard and default UI off', async () => {
    const fake = createFakeMaps()
    mountWith(fake)
    await ready()
    expect(fake.options()).toMatchObject({
      gestureHandling: 'cooperative',
      keyboardShortcuts: false,
      disableDefaultUI: true,
      zoom: 9,
      center: { lat: 59, lng: 18 },
    })
  })

  test('setView before the SDK is ready is applied once it is', async () => {
    const fake = createFakeMaps()
    const { handle } = mountWith(fake)
    handle.setView({ center: { longitude: 10, latitude: 55 }, zoom: 5 })
    expect(handle.getView().zoom).toBe(5)
    await ready()
    expect(fake.state).toMatchObject({ center: { lat: 55, lng: 10 }, zoom: 6 })
  })

  test('setView and getView round-trip once the map exists', async () => {
    const fake = createFakeMaps()
    const { handle } = mountWith(fake)
    await ready()
    handle.setView({ center: { longitude: 10, latitude: 55 }, zoom: 5 })
    expect(handle.getView()).toEqual({ center: { longitude: 10, latitude: 55 }, zoom: 5 })
    expect(fake.calls.moveCamera).toHaveLength(1)
  })

  test('an animated move at the same zoom pans, any other jumps', async () => {
    const fake = createFakeMaps()
    const { handle } = mountWith(fake)
    await ready()
    handle.setView({ center: { longitude: 19, latitude: 59 }, zoom: 8 }, { animate: true })
    expect(fake.calls.panTo).toHaveLength(1)
    handle.setView({ center: { longitude: 19, latitude: 59 }, zoom: 9 }, { animate: true })
    expect(fake.calls.moveCamera).toHaveLength(1)
  })

  test('getBounds surrounds the camera centre', async () => {
    const fake = createFakeMaps()
    const { handle } = mountWith(fake)
    await ready()
    const bounds = handle.getBounds()
    expect(bounds.west).toBeLessThan(18)
    expect(bounds.east).toBeGreaterThan(18)
    expect(bounds.south).toBeLessThan(59)
    expect(bounds.north).toBeGreaterThan(59)
  })

  test('bounds_changed and idle write the camera back as move and moveend', async () => {
    const fake = createFakeMaps()
    const { handle } = mountWith(fake)
    await ready()
    const moves: unknown[] = []
    const ends: unknown[] = []
    handle.on('move', (payload) => moves.push(payload))
    handle.on('moveend', (payload) => ends.push(payload))
    fake.state.center = { lat: 50, lng: 5 }
    fake.state.zoom = 4
    fake.fire('bounds_changed')
    fake.fire('idle')
    expect(moves).toEqual([{ center: { longitude: 5, latitude: 50 }, zoom: 3 }])
    expect(ends).toEqual(moves)
  })

  test('tilesloaded is forwarded', async () => {
    const fake = createFakeMaps()
    const { handle } = mountWith(fake)
    await ready()
    const listener = vi.fn<() => void>()
    handle.on('tilesloaded', listener)
    fake.fire('tilesloaded')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  test('a failing loader reports an error event', async () => {
    const fake = createFakeMaps()
    const container = document.createElement('div')
    const provider = google({ loader: () => Promise.reject(new Error('blocked')) })
    const handle = provider.mount(container, { view })
    const errors: Error[] = []
    handle.on('error', (error) => errors.push(error))
    await ready()
    expect(errors.map((error) => error.message)).toEqual(['blocked'])
    expect(fake.listenerCount('idle')).toBe(0)
  })

  test('without a loader or a key the mount reports an error', async () => {
    const container = document.createElement('div')
    const handle = google({}).mount(container, { view })
    const errors: Error[] = []
    handle.on('error', (error) => errors.push(error))
    await ready()
    expect(errors).toHaveLength(1)
  })

  test('the wheel without a modifier reports a wheel gesture, with Ctrl it does not', async () => {
    const fake = createFakeMaps()
    const { container, handle } = mountWith(fake)
    const gestures: unknown[] = []
    handle.on('gesture', (kind) => gestures.push(kind))
    container.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))
    container.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, ctrlKey: true }))
    expect(gestures).toEqual(['wheel'])
  })

  test('one finger moving reports a touch gesture once', async () => {
    const fake = createFakeMaps()
    const { container, handle } = mountWith(fake)
    const gestures: unknown[] = []
    handle.on('gesture', (kind) => gestures.push(kind))
    const touch = new Touch({ identifier: 1, target: container, clientX: 5, clientY: 5 })
    for (let step = 0; step < 3; step += 1) {
      container.dispatchEvent(new TouchEvent('touchmove', { touches: [touch], bubbles: true }))
    }
    expect(gestures).toEqual(['touch'])
  })

  test('project and unproject are inverses', async () => {
    const fake = createFakeMaps()
    const { handle } = mountWith(fake)
    await ready()
    const centre = handle.project(view.center)
    expect(centre.x).toBeCloseTo(200)
    expect(centre.y).toBeCloseTo(150)
    const position = handle.unproject(handle.project({ longitude: 18.5, latitude: 59.2 }))
    expect(position.longitude).toBeCloseTo(18.5, 6)
    expect(position.latitude).toBeCloseTo(59.2, 6)
  })

  test('setBaseMap switches the map type and ignores an unknown id', async () => {
    const fake = createFakeMaps()
    const container = document.createElement('div')
    const provider = google({
      loader: () => Promise.resolve(fake.api),
      baseMaps: [
        { id: 'map', label: 'Map', mapTypeId: 'roadmap' },
        { id: 'aerial', label: 'Aerial', mapTypeId: 'hybrid' },
      ],
    })
    const handle: MapHandle = provider.mount(container, { view })
    await ready()
    handle.setBaseMap('aerial')
    expect(fake.state.mapTypeId).toBe('hybrid')
    handle.setBaseMap('missing')
    expect(fake.state.mapTypeId).toBe('hybrid')
    expect(provider.baseMaps?.map((baseMap) => baseMap.id)).toEqual(['map', 'aerial'])
  })

  test('the links and buttons the SDK draws leave the Tab order, also when added later', async () => {
    const fake = createFakeMaps()
    const { container } = mountWith(fake)
    await ready()
    const logo = document.createElement('a')
    logo.href = 'https://www.google.com/maps'
    const report = document.createElement('button')
    const focusTarget = document.createElement('div')
    focusTarget.tabIndex = 0
    container.append(logo, report, focusTarget)
    await ready()
    expect([logo, report, focusTarget].map((element) => element.tabIndex)).toEqual([-1, -1, -1])
  })

  test('aborting the signal removes the engine listeners and ignores a late SDK', async () => {
    const fake = createFakeMaps()
    const { controller, handle } = mountWith(fake)
    await ready()
    expect(fake.listenerCount('idle')).toBe(1)
    controller.abort()
    expect(fake.listenerCount('idle')).toBe(0)
    expect(fake.listenerCount('bounds_changed')).toBe(0)
    handle.destroy()
  })

  test('aborting before the SDK arrives never creates the map', async () => {
    const fake = createFakeMaps()
    const { controller } = mountWith(fake)
    controller.abort()
    await ready()
    expect(fake.listenerCount('idle')).toBe(0)
  })
})
