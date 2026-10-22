import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MapTheme } from '@kvirn-ui/core'

// Contract: themed base maps in map.md and plan 0147. The engine is mocked at its boundary:
// nothing is drawn and nothing leaves the process.

const setStyle = vi.fn<(style: unknown) => void>()
const constructed = vi.fn<(options: unknown) => void>()
const engineListeners = vi.hoisted(() => new globalThis.Map<string, ((event: unknown) => void)[]>())
const fire = (name: string, event: unknown = {}) => {
  for (const listener of engineListeners.get(name) ?? []) listener(event)
}

vi.mock('maplibre-gl', () => ({
  setWorkerUrl: vi.fn<() => void>(),
  Map: class {
    constructor(options: unknown) {
      constructed(options)
    }
    touchZoomRotate = { disableRotation: vi.fn<() => void>() }
    getCanvas = () => document.createElement('canvas')
    setStyle = setStyle
    on = (name: string, listener: (event: unknown) => void) => {
      engineListeners.set(name, [...(engineListeners.get(name) ?? []), listener])
    }
    once = this.on
    off = vi.fn<() => void>()
  },
}))

const { maplibre } = await import('./maplibre.ts')

const view = { center: { longitude: 18, latitude: 59 }, zoom: 8 }
const dark: MapTheme = { colorScheme: 'dark', contrast: 'standard' }
const styleFor = ({ colorScheme, contrast }: MapTheme) => `${colorScheme}-${contrast}.json`

afterEach(() => {
  setStyle.mockClear()
  constructed.mockClear()
  engineListeners.clear()
})

function mount(options: Parameters<typeof maplibre>[0], theme?: MapTheme) {
  return maplibre(options).mount(document.createElement('div'), {
    view,
    ...(theme ? { theme } : {}),
  })
}

describe('maplibre themed styles', () => {
  test('a style function is resolved with the theme given on mount', () => {
    mount({ style: styleFor }, dark)
    expect(constructed).toHaveBeenCalledWith(
      expect.objectContaining({ style: 'dark-standard.json' }),
    )
  })

  test('a style function is resolved with the light standard theme when none is given', () => {
    mount({ style: styleFor })
    expect(constructed).toHaveBeenCalledWith(
      expect.objectContaining({ style: 'light-standard.json' }),
    )
  })

  test('setTheme calls setStyle once with the style of the new theme', () => {
    const handle = mount({ style: styleFor })
    handle.setTheme?.(dark)
    expect(setStyle).toHaveBeenCalledTimes(1)
    expect(setStyle).toHaveBeenCalledWith('dark-standard.json')
  })

  test('setTheme does not call setStyle when the style is the same', () => {
    const handle = mount({ style: () => 'one.json' })
    handle.setTheme?.(dark)
    expect(setStyle).not.toHaveBeenCalled()
  })

  test('setBaseMap resolves the new base map with the current theme', () => {
    const handle = mount(
      {
        baseMaps: [
          { id: 'a', style: styleFor },
          { id: 'b', style: (theme) => `b-${styleFor(theme)}` },
        ],
      },
      dark,
    )
    handle.setBaseMap('b')
    expect(setStyle).toHaveBeenCalledWith('b-dark-standard.json')
  })

  test('setTheme re-resolves the current base map, not the first', () => {
    const handle = mount({
      baseMaps: [
        { id: 'a', style: styleFor },
        { id: 'b', style: (theme) => `b-${styleFor(theme)}` },
      ],
    })
    handle.setBaseMap('b')
    setStyle.mockClear()
    handle.setTheme?.(dark)
    expect(setStyle).toHaveBeenCalledWith('b-dark-standard.json')
  })
})

describe('maplibre failed style swap', () => {
  test('an error from a theme swap after the first load is kept from the error listener', () => {
    const handle = mount({ style: styleFor })
    const errors: Error[] = []
    handle.on('error', (error) => errors.push(error))
    fire('load')
    handle.setTheme?.(dark)
    fire('error', { error: new Error('style failed') })
    expect(errors).toEqual([])
  })

  test('an error from a base map swap after the first load is kept from the error listener', () => {
    const handle = mount({
      baseMaps: [
        { id: 'a', style: 'a.json' },
        { id: 'b', style: 'b.json' },
      ],
    })
    const errors: Error[] = []
    handle.on('error', (error) => errors.push(error))
    fire('load')
    handle.setBaseMap('b')
    fire('error', { error: new Error('style failed') })
    expect(errors).toEqual([])
  })

  test('an error after the swap has settled is forwarded', () => {
    const handle = mount({ style: styleFor })
    const errors: Error[] = []
    handle.on('error', (error) => errors.push(error))
    fire('load')
    handle.setTheme?.(dark)
    fire('idle')
    fire('error', { error: new Error('tile failed') })
    expect(errors).toHaveLength(1)
  })

  test('an error before the first load is forwarded', () => {
    const handle = mount({ style: styleFor })
    const errors: Error[] = []
    handle.on('error', (error) => errors.push(error))
    handle.setTheme?.(dark)
    fire('error', { error: new Error('style failed') })
    expect(errors).toHaveLength(1)
  })
})
