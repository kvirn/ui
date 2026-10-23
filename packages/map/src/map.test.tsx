import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import { cdp, page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import type { ComponentProps } from 'react'
import { Icon, KvirnProvider } from '@kvirn-ui/react'
import { Map } from './map.tsx'
import { mapIcons } from './map-icons.ts'
import { createMemoryProvider } from './memory-provider.ts'
import type { MapBaseMap, MapPlace, MapProvider, MapTheme } from '@kvirn-ui/core'
import type { Env } from '@kvirn-ui/core'

// Contract: map.a11y.md. This file proves the focus-not-obscured row (WCAG 2.4.11). Component
// tests load no theme, so the fixture positions the viewport, the markers and the chrome itself.

const zoom = 10
const centre = { longitude: 18, latitude: 59 }
const degreesPerPixel = 360 / (512 * 2 ** zoom)

const fixtureStyle = `
  .fixture-viewport { position: relative; inline-size: 800px; block-size: 600px; }
  .kv-map-popup-slot { position: absolute; inset: 0; pointer-events: none; }
  .kv-map-popup { position: absolute; left: var(--kv-map-popup-x, 0); top: var(--kv-map-popup-y, 0); inline-size: 300px; }
  .kv-map-popup > dialog { position: static; inline-size: auto; max-block-size: var(--kv-map-popup-max-block-size, none); overflow: auto; }
  .kv-map-marker { position: absolute; inset-inline-start: var(--kv-map-x); inset-block-start: var(--kv-map-y); inline-size: 24px; block-size: 24px; }
`
const leftColumn = {
  position: 'absolute',
  insetInlineStart: 0,
  insetBlockStart: 0,
  inlineSize: 500,
  blockSize: 600,
} as const

const placeAtPixelsEast = (pixels: number): MapPlace => ({
  id: 'forskola',
  name: 'Birch Preschool',
  position: { ...centre, longitude: centre.longitude + pixels * degreesPerPixel },
})

function CaseMap({
  provider,
  place,
  chrome,
}: {
  provider: ReturnType<typeof createMemoryProvider>
  place: MapPlace
  chrome: 'overlay' | 'controls'
}) {
  return (
    <>
      <style>{fixtureStyle}</style>
      <Map.Root
        provider={provider}
        label="Map"
        places={[place]}
        initialView={{ center: centre, zoom }}
      >
        <Map.Viewport className="fixture-viewport">
          <Map.Markers />
          {chrome === 'overlay' ? (
            <Map.Overlay data-testid="overlay" style={leftColumn}>
              <label>
                Search
                <input />
              </label>
            </Map.Overlay>
          ) : null}
          {chrome === 'controls' ? (
            <Map.Controls data-testid="controls" style={leftColumn} />
          ) : null}
        </Map.Viewport>
      </Map.Root>
    </>
  )
}

function MarkerContentMap({ children }: { children?: () => null | string }) {
  return (
    <>
      <style>{fixtureStyle}</style>
      <Map.Root
        provider={createMemoryProvider()}
        label="Map"
        places={[placeAtPixelsEast(0)]}
        initialView={{ center: centre, zoom }}
      >
        <Map.Viewport className="fixture-viewport">
          <Map.Markers>{children}</Map.Markers>
        </Map.Viewport>
      </Map.Root>
    </>
  )
}

const marker = () => page.getByRole('button', { name: 'Birch Preschool' })

async function tabToMarker() {
  await expect.element(marker()).toBeVisible()
  await userEvent.tab()
  await userEvent.tab()
  await expect.element(marker()).toHaveFocus()
}

const overlaps = (first: Element, second: Element) => {
  const a = first.getBoundingClientRect()
  const b = second.getBoundingClientRect()
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

describe('Map focus is not obscured', () => {
  test('a marker focused by keyboard under an overlay is panned clear of it', async () => {
    await render(
      <CaseMap provider={createMemoryProvider()} place={placeAtPixelsEast(0)} chrome="overlay" />,
    )
    const overlay = page.getByTestId('overlay').element()
    expect(overlaps(marker().element(), overlay)).toBe(true)
    await tabToMarker()
    await expect.poll(() => overlaps(marker().element(), overlay)).toBe(false)
  })

  test('a focused marker clear of the overlays does not move the view', async () => {
    const provider = createMemoryProvider()
    await render(<CaseMap provider={provider} place={placeAtPixelsEast(150)} chrome="overlay" />)
    const overlay = page.getByTestId('overlay').element()
    expect(overlaps(marker().element(), overlay)).toBe(false)
    const before = provider.handle?.getView()
    await tabToMarker()
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(provider.handle?.getView()).toEqual(before)
  })

  test('Map.Controls count as an overlay', async () => {
    await render(
      <CaseMap provider={createMemoryProvider()} place={placeAtPixelsEast(0)} chrome="controls" />,
    )
    const controls = page.getByTestId('controls').element()
    expect(overlaps(marker().element(), controls)).toBe(true)
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(marker()).toHaveFocus()
    await expect.poll(() => overlaps(marker().element(), controls)).toBe(false)
  })
})

const baseMaps = [
  { id: 'standard', label: 'Standard', attribution: 'a' },
  { id: 'satellite', label: 'Satellite', attribution: 'b' },
]

function ChromeMap({ onBaseMapChange }: { onBaseMapChange?: (id: string) => void }) {
  return (
    <Map.Root
      provider={createMemoryProvider({ baseMaps })}
      label="Map"
      places={[placeAtPixelsEast(600)]}
      layers={[{ id: 'a', label: 'Fuel stops' }]}
      initialView={{ center: centre, zoom }}
      {...(onBaseMapChange ? { onBaseMapChange } : {})}
    >
      <Map.Viewport className="fixture-viewport">
        <Map.Layers />
        <Map.BaseMapSwitch />
        <Map.Controls />
      </Map.Viewport>
    </Map.Root>
  )
}

describe('Map chrome', () => {
  test('Tab moves through zoom in, zoom out, the four pan buttons and Whole map', async () => {
    await render(
      <Map.Root
        provider={createMemoryProvider()}
        label="Map"
        initialView={{ center: centre, zoom }}
      >
        <Map.Viewport className="fixture-viewport">
          <Map.Controls />
        </Map.Viewport>
      </Map.Root>,
    )
    await userEvent.tab()
    const names = ['Zoom in', 'Zoom out', 'Move the map north', 'Move the map west']
    const order: string[] = []
    for (let step = 0; step < 7; step += 1) {
      await userEvent.tab()
      order.push(
        document.activeElement?.getAttribute('aria-label') ??
          document.activeElement?.textContent ??
          '',
      )
    }
    expect(order.slice(0, 4)).toEqual(names)
    expect(order[6]).toBe('Whole map')
  })

  test('a layer checkbox toggles with Space', async () => {
    await render(<ChromeMap />)
    const chip = page.getByRole('checkbox', { name: /Fuel stops/ })
    await expect.element(chip).toBeChecked()
    chip.element().focus()
    await userEvent.keyboard(' ')
    await expect.element(chip).not.toBeChecked()
  })

  const renderLayers = (layersProps: ComponentProps<typeof Map.Layers> = {}) =>
    render(
      <Map.Root
        provider={createMemoryProvider()}
        label="Map"
        places={[placeAtPixelsEast(600)]}
        layers={[
          { id: 'a', label: 'Fuel stops' },
          { id: 'b', label: 'Laddstationer' },
        ]}
        defaultHiddenLayers={['a']}
        initialView={{ center: centre, zoom }}
      >
        <Map.Viewport className="fixture-viewport">
          <Map.Layers {...layersProps} />
        </Map.Viewport>
      </Map.Root>,
    )

  test('Enter and Space on the layers button collapse and open the layers', async () => {
    await renderLayers()
    const trigger = page.getByRole('button', { name: /Show on the map/ })
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
    trigger.element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard(' ')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  test('defaultOpen false starts with the layer checkboxes out of the Tab order and not exposed', async () => {
    await renderLayers({ defaultOpen: false })
    await expect
      .element(page.getByRole('button', { name: /Show on the map/ }))
      .toHaveAttribute('aria-expanded', 'false')
    expect(page.getByRole('checkbox').elements()).toHaveLength(0)
    page
      .getByRole('button', { name: /Show on the map/ })
      .element()
      .focus()
    await userEvent.tab()
    expect(document.activeElement?.getAttribute('type')).not.toBe('checkbox')
  })

  test('open and onOpenChange control the layers card', async () => {
    const changes: boolean[] = []
    await renderLayers({ open: true, onOpenChange: (next) => changes.push(next) })
    const trigger = page.getByRole('button', { name: /Show on the map/ })
    await userEvent.click(trigger)
    await expect.poll(() => changes).toEqual([false])
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  test('a collapsed layers card with one layer hidden shows "1 hidden"', async () => {
    await renderLayers({ defaultOpen: false })
    await expect
      .element(page.getByRole('button', { name: 'Show on the map 1 hidden' }))
      .toBeVisible()
  })

  test('collapsible false renders the layers with no button', async () => {
    await renderLayers({ collapsible: false })
    expect(page.getByRole('button', { name: /Show on the map/ }).elements()).toHaveLength(0)
    await expect.element(page.getByRole('group', { name: 'Show on the map' })).toBeVisible()
    expect(page.getByRole('checkbox').elements()).toHaveLength(2)
  })

  test('Map type opens from its button, an arrow key changes the map, Escape returns focus', async () => {
    const changed: string[] = []
    await render(<ChromeMap onBaseMapChange={(id) => changed.push(id)} />)
    const trigger = page.getByRole('button', { name: 'Map type' })
    await userEvent.click(trigger)
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
    const standard = page.getByRole('radio', { name: 'Standard' })
    standard.element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => changed).toEqual(['satellite'])
    await userEvent.keyboard('{Escape}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect.element(trigger).toHaveFocus()
  })
})

describe('Map popup room', () => {
  test('the details popup stays inside the map row when the viewport has more rows below it', async () => {
    const rowHeight = 300
    const latitudeOffset = 90 * degreesPerPixel * Math.cos((centre.latitude * Math.PI) / 180)
    await render(
      <>
        <style>{fixtureStyle}</style>
        <Map.Root
          provider={createMemoryProvider({ size: { width: 800, height: rowHeight } })}
          label="Map"
          places={[
            {
              id: 'forskola',
              name: 'Birch Preschool',
              description: 'Long description. '.repeat(120),
              position: { ...centre, latitude: centre.latitude + latitudeOffset },
            },
          ]}
          initialView={{ center: centre, zoom }}
        >
          <Map.Viewport className="fixture-viewport">
            <Map.Markers />
            <Map.Details />
          </Map.Viewport>
        </Map.Root>
      </>,
    )
    await expect.element(marker()).toBeVisible()
    const engine = document.querySelector('.kv-map-engine') as HTMLElement
    engine.style.cssText = `position:absolute;inset-block-start:0;inset-inline:0;block-size:${rowHeight}px`
    await userEvent.click(marker())
    await expect.element(page.getByRole('dialog')).toBeVisible()
    const room = engine.getBoundingClientRect()
    await expect
      .poll(() => {
        const popup = document.querySelector('.kv-map-popup')?.getBoundingClientRect()
        return popup !== undefined && popup.bottom <= room.bottom + 1 && popup.top >= room.top - 1
      })
      .toBe(true)
  })
})

describe('Map cluster layer cue', () => {
  const layerIcon = <Icon icon={mapIcons.marker} size="16" data-testid="layer-icon" />
  const closePlaces: MapPlace[] = [0, 1].map((index) => ({
    ...placeAtPixelsEast(index),
    id: `place-${index}`,
    name: `Place ${index}`,
    layer: 'hotels',
  }))
  const renderClusters = (cluster?: () => string, icon: boolean = true) =>
    render(
      <>
        <style>{fixtureStyle}</style>
        <Map.Root
          provider={createMemoryProvider()}
          label="Map"
          places={closePlaces}
          layers={[{ id: 'hotels', label: 'Hotell', ...(icon ? { icon: layerIcon } : {}) }]}
          initialView={{ center: centre, zoom }}
        >
          <Map.Viewport className="fixture-viewport">
            <Map.Markers cluster={cluster} />
          </Map.Viewport>
        </Map.Root>
      </>,
    )
  const clusterButton = () => page.getByRole('button', { name: /Hotell/ })

  test('a cluster of a layer with an icon draws it before the count, hidden from the name', async () => {
    await renderClusters()
    await expect.element(clusterButton()).toBeVisible()
    const button = clusterButton().element()
    const iconWrapper = button.querySelector('.kv-map-cluster-icon')
    expect(iconWrapper?.getAttribute('aria-hidden')).toBe('true')
    expect(iconWrapper?.nextElementSibling?.textContent).toBe('2')
    expect(button.getAttribute('aria-label')).toBe('Hotell: 2 places')
  })

  test('a layer without an icon keeps the count alone', async () => {
    await renderClusters(undefined, false)
    await expect.element(clusterButton()).toBeVisible()
    expect(clusterButton().element().querySelector('.kv-map-cluster-icon')).toBeNull()
  })

  test('the cluster render function replaces the default icon', async () => {
    await renderClusters(() => 'X')
    await expect.element(clusterButton()).toBeVisible()
    expect(clusterButton().element().textContent).toBe('X')
  })
})

describe('Map layer swatch', () => {
  const renderLayers = (layersIcon?: () => string) =>
    render(
      <Map.Root
        provider={createMemoryProvider()}
        label="Map"
        places={[placeAtPixelsEast(0)]}
        layers={[{ id: 'a', label: 'Fuel stops', icon: <span>L</span> }]}
        initialView={{ center: centre, zoom }}
      >
        <Map.Viewport className="fixture-viewport">
          <Map.Layers icon={layersIcon} />
        </Map.Viewport>
      </Map.Root>,
    )

  test("a layer's icon is the decorative swatch when Map.Layers has no icon prop", async () => {
    await renderLayers()
    const swatch = page
      .getByRole('checkbox', { name: /Fuel stops/ })
      .element()
      .closest('.kv-field')
    const wrapper = swatch?.querySelector('.kv-map-layer-swatch')
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true')
    expect(wrapper?.textContent).toBe('L')
  })

  test('the icon prop of Map.Layers wins over the layer icon', async () => {
    await renderLayers(() => 'P')
    await expect.element(page.getByRole('checkbox', { name: /Fuel stops/ })).toBeVisible()
    expect(document.querySelector('.kv-map-layer-swatch')?.textContent).toBe('P')
  })
})

describe('Map with the memory provider', () => {
  const place = placeAtPixelsEast(0)
  const renderList = (headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6') =>
    render(
      <Map.Root
        provider={createMemoryProvider()}
        label="Map"
        places={[place]}
        initialView={{ center: centre, zoom }}
      >
        <Map.Skip />
        <Map.Viewport className="fixture-viewport" />
        <Map.List headingLevel={headingLevel} />
        <Map.Details />
      </Map.Root>,
    )

  test('the viewport reaches ready, so it stops saying the map is loading', async () => {
    await render(
      <Map.Root
        provider={createMemoryProvider()}
        label="Map"
        initialView={{ center: centre, zoom }}
      >
        <Map.Viewport data-testid="viewport" className="fixture-viewport" />
      </Map.Root>,
    )
    await expect.element(page.getByTestId('viewport')).toHaveAttribute('data-status', 'ready')
  })

  test('when the tiles fail the viewport says so and the list still opens a place', async () => {
    const base = createMemoryProvider()
    const failing: MapProvider = {
      mount: (container, options) => {
        const handle = base.mount(container, options)
        return {
          ...handle,
          on: (name, listener) => {
            if (name === 'error') {
              queueMicrotask(() => (listener as (error: Error) => void)(new Error('tiles')))
            }
            return handle.on(name, listener)
          },
        }
      },
    }
    await render(
      <Map.Root
        provider={failing}
        label="Map"
        places={[place]}
        initialView={{ center: centre, zoom }}
      >
        <Map.Viewport data-testid="viewport" className="fixture-viewport" />
        <Map.List />
        <Map.Details />
      </Map.Root>,
    )
    await expect.element(page.getByTestId('viewport')).toHaveAttribute('data-status', 'failed')
    await expect.element(page.getByText("The map can't be shown right now")).toBeVisible()
    await page.getByRole('button', { name: place.name }).click()
    await expect.element(page.getByRole('dialog')).toBeVisible()
  })

  test('opening a place from the list logs no warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await renderList()
    await page.getByRole('button', { name: place.name }).click()
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: /list|details|places/i }))
      .toHaveAttribute('href', expect.stringContaining('-details-title'))
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  test('the list heading is an h2 by default and takes the level headingLevel sets', async () => {
    const screen = await renderList()
    await expect.element(page.getByRole('heading', { level: 2 })).toBeVisible()
    await screen.unmount()
    await renderList('h4')
    await expect.element(page.getByRole('heading', { level: 4 })).toBeVisible()
    expect(document.querySelector('h2')).toBeNull()
  })
})

describe('Map marker content', () => {
  test('a marker with no children shows a decorative pin and keeps the place name', async () => {
    await render(<MarkerContentMap />)
    await expect.element(marker()).toBeVisible()
    const icon = marker().element().querySelector('svg')
    expect(icon).not.toBeNull()
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
  })

  test('children replace the default pin, also when they render nothing', async () => {
    const { unmount } = await render(<MarkerContentMap>{() => 'B'}</MarkerContentMap>)
    await expect.element(marker()).toBeVisible()
    expect(marker().element().querySelector('svg')).toBeNull()
    expect(marker().element().textContent).toBe('B')
    await unmount()
    await render(<MarkerContentMap>{() => null}</MarkerContentMap>)
    await expect.element(marker()).toBeVisible()
    expect(marker().element().querySelector('svg')).toBeNull()
  })

  test('mapIcons lists the marker and the control icons, frozen', () => {
    expect(Object.keys(mapIcons)).toEqual([
      'marker',
      'locate',
      'remove',
      'arrow-north',
      'arrow-south',
      'arrow-west',
      'arrow-east',
    ])
    expect(Object.isFrozen(mapIcons)).toBe(true)
  })
})

const keyboardStyle = `${fixtureStyle}
  .kv-map-cluster { position: absolute; inset-inline-start: var(--kv-map-x); inset-block-start: var(--kv-map-y); }
  .kv-map-list-scroll { block-size: 300px; overflow: auto; }
  .kv-map-cluster-places-scroll { block-size: 224px; overflow: auto; }
`
const hotelLayers = [{ id: 'hotels', label: 'Hotell' }]

const placesEast = (count: number, spacing: number, firstOffset = 0, layer?: string) =>
  Array.from({ length: count }, (_, index): MapPlace => ({
    id: `place-${index}`,
    name: `Place ${index}`,
    position: {
      ...centre,
      longitude: centre.longitude + (firstOffset + index * spacing) * degreesPerPixel,
    },
    ...(layer ? { layer } : {}),
  }))

function KeyboardCase({
  provider = createMemoryProvider(),
  places = [],
  layers,
  clustered = false,
  markers = false,
  list = false,
  controls = false,
  dir,
  icons,
}: {
  provider?: ReturnType<typeof createMemoryProvider>
  places?: MapPlace[]
  layers?: ComponentProps<typeof Map.Root>['layers']
  clustered?: boolean
  markers?: boolean
  list?: boolean
  controls?: boolean
  dir?: 'rtl'
  icons?: ComponentProps<typeof KvirnProvider>['icons']
}) {
  return (
    <KvirnProvider icons={icons}>
      <style>{keyboardStyle}</style>
      <div dir={dir}>
        <button type="button">Before</button>
        <Map.Root
          provider={provider}
          label="Map"
          places={places}
          cluster={clustered}
          initialView={{ center: centre, zoom }}
          {...(layers ? { layers } : {})}
        >
          <Map.Skip />
          <Map.Viewport data-testid="viewport" className="fixture-viewport">
            {markers ? <Map.Markers /> : null}
            {controls ? <Map.Controls /> : null}
          </Map.Viewport>
          {list ? <Map.List /> : null}
          <Map.Details />
          <Map.ClusterPopup />
        </Map.Root>
        <button type="button">After</button>
      </div>
    </KvirnProvider>
  )
}

const viewport = () => page.getByTestId('viewport')
const button = (name: string | RegExp) => page.getByRole('button', { name, exact: true })
const place = (index: number) => button(`Place ${index}`)
const settle = () => new Promise((resolve) => setTimeout(resolve, 100))

const currentView = (provider: ReturnType<typeof createMemoryProvider>) => {
  const view = provider.handle?.getView()
  if (!view) {
    throw new Error('The map has not mounted')
  }
  return view
}

async function focusViewport() {
  await expect.element(viewport()).toHaveAttribute('data-status', 'ready')
  viewport().element().focus()
  await expect.element(viewport()).toHaveFocus()
}

describe('Map keyboard: viewport', () => {
  test('Tab reaches the skip link and the viewport', async () => {
    await render(<KeyboardCase places={placesEast(1, 0)} list />)
    await expect.element(viewport()).toBeVisible()
    button('Before').element().focus()
    await userEvent.tab()
    await expect
      .element(page.getByRole('link', { name: 'Skip the map, go to the list of places' }))
      .toHaveFocus()
    await userEvent.tab()
    await expect.element(viewport()).toHaveFocus()
  })

  test('Shift+Tab leaves the viewport backwards', async () => {
    await render(<KeyboardCase places={placesEast(1, 0)} list />)
    await focusViewport()
    await userEvent.tab({ shift: true })
    await expect
      .element(page.getByRole('link', { name: 'Skip the map, go to the list of places' }))
      .toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(button('Before')).toHaveFocus()
  })

  const panAllWays = async (dir?: 'rtl') => {
    const provider = createMemoryProvider()
    await render(<KeyboardCase provider={provider} {...(dir ? { dir } : {})} />)
    await focusViewport()
    const start = currentView(provider).center
    const step = 150 * degreesPerPixel
    await userEvent.keyboard('{ArrowRight}')
    await expect
      .poll(() => currentView(provider).center.longitude)
      .toBeCloseTo(start.longitude + step, 5)
    await settle()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.poll(() => currentView(provider).center.longitude).toBeCloseTo(start.longitude, 5)
    await settle()
    await userEvent.keyboard('{ArrowLeft}')
    await expect
      .poll(() => currentView(provider).center.longitude)
      .toBeCloseTo(start.longitude - step, 5)
    await settle()
    await userEvent.keyboard('{ArrowUp}')
    await expect.poll(() => currentView(provider).center.latitude).toBeGreaterThan(start.latitude)
    await settle()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => currentView(provider).center.latitude).toBeCloseTo(start.latitude, 5)
    await settle()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => currentView(provider).center.latitude).toBeLessThan(start.latitude)
    return { start, end: currentView(provider).center }
  }

  test('the arrows pan the map', async () => {
    const { start, end } = await panAllWays()
    expect(end.longitude).toBeCloseTo(start.longitude - 150 * degreesPerPixel, 5)
  })

  test('the arrows pan the same way in RTL', async () => {
    const { start, end } = await panAllWays('rtl')
    expect(end.longitude).toBeCloseTo(start.longitude - 150 * degreesPerPixel, 5)
  })

  test('plus zooms in', async () => {
    const provider = createMemoryProvider()
    await render(<KeyboardCase provider={provider} />)
    await focusViewport()
    await userEvent.keyboard('+')
    await expect.poll(() => currentView(provider).zoom).toBe(zoom + 1)
    await settle()
    await userEvent.keyboard('=')
    await expect.poll(() => currentView(provider).zoom).toBe(zoom + 2)
    await settle()
    await userEvent.keyboard('{Control>}+{/Control}')
    await settle()
    expect(currentView(provider).zoom).toBe(zoom + 2)
  })

  test('minus zooms out', async () => {
    const provider = createMemoryProvider()
    await render(<KeyboardCase provider={provider} />)
    await focusViewport()
    await userEvent.keyboard('-')
    await expect.poll(() => currentView(provider).zoom).toBe(zoom - 1)
    await settle()
    await userEvent.keyboard('{Control>}-{/Control}')
    await settle()
    expect(currentView(provider).zoom).toBe(zoom - 1)
  })

  test('Escape hides the keyboard hint', async () => {
    await render(<KeyboardCase />)
    await focusViewport()
    const hint = page.getByText('Move the map with the arrow keys. Zoom with + and −.')
    await expect.element(hint).not.toHaveAttribute('data-dismissed')
    await userEvent.keyboard('{Escape}')
    await expect.element(hint).toHaveAttribute('data-dismissed')
  })
})

describe('Map keyboard: markers', () => {
  const threePlaces = placesEast(3, 100)

  test('the markers are one Tab stop', async () => {
    await render(<KeyboardCase places={threePlaces} markers />)
    await focusViewport()
    await expect.element(place(0)).toBeVisible()
    await userEvent.tab()
    await expect.element(place(0)).toHaveFocus()
    await userEvent.tab()
    await expect.element(button('After')).toHaveFocus()
  })

  test('the arrows move between the markers', async () => {
    await render(<KeyboardCase places={threePlaces} markers />)
    await focusViewport()
    await userEvent.tab()
    await expect.element(place(0)).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(place(1)).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(place(2)).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(place(0)).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(place(2)).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(place(1)).toHaveFocus()
  })

  test('the arrows move between the markers in RTL', async () => {
    await render(<KeyboardCase places={threePlaces} markers dir="rtl" />)
    await focusViewport()
    await userEvent.tab()
    await expect.element(place(0)).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(place(1)).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(place(0)).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(place(2)).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(place(1)).toHaveFocus()
  })

  test('Home and End move to the first and last marker', async () => {
    await render(<KeyboardCase places={threePlaces} markers />)
    await focusViewport()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(place(1)).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect.element(place(2)).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect.element(place(0)).toHaveFocus()
  })

  test('Enter and Space open the details', async () => {
    await render(<KeyboardCase places={threePlaces} markers />)
    await focusViewport()
    await userEvent.tab()
    await expect.element(place(0)).toHaveFocus()
    for (const key of ['{Enter}', ' ']) {
      await userEvent.keyboard(key)
      await expect.element(page.getByRole('dialog')).toBeVisible()
      await expect.element(page.getByRole('heading', { name: 'Place 0' })).toHaveFocus()
      await userEvent.keyboard('{Escape}')
      await expect.element(place(0)).toHaveFocus()
    }
  })

  test('clusters and markers share the one Tab stop', async () => {
    const places = [...placesEast(2, 1, 0, 'hotels'), ...placesEast(1, 0, 300, 'hotels')].map(
      (entry, index) => ({ ...entry, id: `place-${index}`, name: `Place ${index}` }),
    )
    await render(<KeyboardCase places={places} layers={hotelLayers} clustered markers />)
    await focusViewport()
    await expect.poll(() => document.querySelectorAll('[data-kv-map-marker]').length).toBe(2)
    const [first, second] = [...document.querySelectorAll<HTMLElement>('[data-kv-map-marker]')]
    await userEvent.tab()
    expect(document.activeElement).toBe(first)
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(second)
    await userEvent.keyboard('{ArrowLeft}')
    await userEvent.tab()
    await expect.element(button('After')).toHaveFocus()
  })
})

describe('Map keyboard: controls', () => {
  test('the control buttons zoom, pan and reset', async () => {
    const provider = createMemoryProvider()
    await render(<KeyboardCase provider={provider} places={placesEast(3, 100)} controls />)
    await focusViewport()
    const announced = () =>
      [...document.querySelectorAll('[aria-live]')].map((element) => element.textContent).join(' ')
    button('Zoom in').element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => currentView(provider).zoom).toBe(zoom + 1)
    await expect.poll(announced, { timeout: 3000 }).toMatch(/\d+ places?( in the map view)?\./)
    await settle()
    button('Move the map north').element().focus()
    await userEvent.keyboard(' ')
    await expect.poll(() => currentView(provider).center.latitude).toBeGreaterThan(centre.latitude)
    await settle()
    button('Whole map').element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => currentView(provider)).toEqual({ center: centre, zoom })
  })
})

describe('Map controls icons', () => {
  test('the map controls draw their icons with no registry', async () => {
    await render(
      <KeyboardCase provider={createMemoryProvider()} places={placesEast(1, 0)} controls />,
    )
    const icon = button('Move the map north').element().querySelector('svg')
    expect(icon?.querySelector('path, circle, line, polyline')).not.toBeNull()
  })
})

describe('Map controls registered icons', () => {
  test('a registered name replaces a map control icon', async () => {
    const Replacement = (props: ComponentProps<'svg'>) => (
      <svg {...props} data-testid="replacement" />
    )
    await render(
      <KeyboardCase
        provider={createMemoryProvider()}
        places={placesEast(1, 0)}
        controls
        icons={{ add: Replacement }}
      />,
    )
    expect(button('Zoom in').element().querySelector('[data-testid="replacement"]')).not.toBeNull()
    expect(button('Zoom out').element().querySelector('[data-testid="replacement"]')).toBeNull()
  })
})

describe('Map keyboard: list and details', () => {
  const onePlace = placesEast(1, 0)

  const openRowFromList = async (key: string) => {
    await expect.element(place(0)).toBeVisible()
    place(0).element().focus()
    await userEvent.keyboard(key)
  }

  test('a list row opens the details', async () => {
    await render(<KeyboardCase places={onePlace} list />)
    for (const key of ['{Enter}', ' ']) {
      await openRowFromList(key)
      await expect.element(page.getByRole('dialog')).toBeVisible()
      await expect.element(page.getByRole('heading', { name: 'Place 0' })).toHaveFocus()
      await userEvent.keyboard('{Escape}')
      await expect.element(place(0)).toHaveFocus()
    }
  })

  test('Escape closes the details and returns focus', async () => {
    await render(<KeyboardCase places={onePlace} list />)
    await openRowFromList('{Enter}')
    await expect.element(page.getByRole('heading', { name: 'Place 0' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => page.getByRole('dialog').elements()).toHaveLength(0)
    await expect.element(place(0)).toHaveFocus()
  })

  test('Close closes the details and returns focus', async () => {
    await render(<KeyboardCase places={onePlace} list />)
    for (const key of ['{Enter}', ' ']) {
      await openRowFromList('{Enter}')
      await expect.element(page.getByRole('dialog')).toBeVisible()
      const close = button(/^Close/)
      close.element().focus()
      await userEvent.keyboard(key)
      await expect.poll(() => page.getByRole('dialog').elements()).toHaveLength(0)
      await expect.element(place(0)).toHaveFocus()
    }
  })

  const openFromMarker = async () => {
    await render(<KeyboardCase places={onePlace} markers list />)
    await expect.poll(() => document.querySelectorAll('[data-kv-map-marker]').length).toBe(1)
    const marker = document.querySelector<HTMLElement>('[data-kv-map-marker]')
    marker?.focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByRole('heading', { name: 'Place 0' })).toHaveFocus()
    marker?.removeAttribute('id')
  }

  test('Escape closes the details and returns focus to the list heading when the opener is gone', async () => {
    await openFromMarker()
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => page.getByRole('dialog').elements()).toHaveLength(0)
    await expect.element(page.getByRole('heading', { level: 2 })).toHaveFocus()
  })

  test('Close closes the details and returns focus to the list heading when the opener is gone', async () => {
    await openFromMarker()
    button(/^Close/)
      .element()
      .focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => page.getByRole('dialog').elements()).toHaveLength(0)
    await expect.element(page.getByRole('heading', { level: 2 })).toHaveFocus()
  })
})

describe('Map keyboard: virtualized list', () => {
  const manyPlaces = placesEast(60, 10, -300)
  const rowHeight = 72

  async function renderManyAndEnter() {
    await render(<KeyboardCase places={manyPlaces} list />)
    await focusViewport()
    await userEvent.tab()
    await expect.element(place(0)).toHaveFocus()
  }

  test('a virtualized list is one Tab stop', async () => {
    await renderManyAndEnter()
    await userEvent.tab()
    await expect.element(button('After')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(place(0)).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(viewport()).toHaveFocus()
  })

  test('the arrows move between virtualized rows', async () => {
    await renderManyAndEnter()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(place(0)).toHaveFocus()
    for (let index = 1; index <= 25; index += 1) {
      await userEvent.keyboard('{ArrowDown}')
      await expect.element(place(index)).toHaveFocus()
    }
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(place(24)).toHaveFocus()
  })

  test('Home and End move to the first and last virtualized row', async () => {
    await renderManyAndEnter()
    await userEvent.keyboard('{End}')
    await expect.element(place(59)).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(place(59)).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect.element(place(0)).toHaveFocus()
  })

  test('PageUp and PageDown move by a page of rows', async () => {
    await renderManyAndEnter()
    const scroll = document.querySelector('.kv-map-list-scroll') as HTMLElement
    const pageSize = Math.floor(scroll.clientHeight / rowHeight)
    expect(pageSize).toBeGreaterThan(1)
    await userEvent.keyboard('{PageDown}')
    await expect.element(place(pageSize)).toHaveFocus()
    await userEvent.keyboard('{PageUp}')
    await expect.element(place(0)).toHaveFocus()
  })
})

describe('Map keyboard: cluster popup', () => {
  const closePlaces = placesEast(2, 1, 0, 'hotels')
  const clusterName = 'Hotell: 2 places'
  const cluster = () => button(clusterName)
  const popup = () => page.getByRole('dialog', { name: clusterName })

  async function renderCluster() {
    const screen = await render(
      <KeyboardCase places={closePlaces} layers={hotelLayers} clustered markers />,
    )
    await expect.element(cluster()).toBeVisible()
    return screen
  }

  async function openClusterWith(key: string) {
    cluster().element().focus()
    await userEvent.keyboard(key)
    await expect.element(popup()).toBeVisible()
    await expect.element(page.getByRole('heading', { name: clusterName })).toHaveFocus()
  }

  test('Enter and Space open the cluster popup', async () => {
    await renderCluster()
    for (const key of ['{Enter}', ' ']) {
      await openClusterWith(key)
      await expect.element(cluster()).toHaveAttribute('aria-expanded', 'true')
      await userEvent.keyboard('{Escape}')
      await expect.element(cluster()).toHaveFocus()
    }
  })

  test('Tab moves through the cluster popup', async () => {
    await renderCluster()
    await openClusterWith('{Enter}')
    await userEvent.tab()
    await expect.element(button(/^Close/)).toHaveFocus()
    await userEvent.tab()
    await expect.element(place(0)).toHaveFocus()
    await userEvent.tab()
    await expect.element(place(1)).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(place(0)).toHaveFocus()
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(button('After')).toHaveFocus()
  })

  test('a place in a cluster opens its details', async () => {
    for (const key of ['{Enter}', ' ']) {
      const screen = await renderCluster()
      await openClusterWith('{Enter}')
      place(0).element().focus()
      await userEvent.keyboard(key)
      await expect.poll(() => popup().elements()).toHaveLength(0)
      await expect.element(page.getByRole('dialog', { name: 'Place 0' })).toBeVisible()
      await expect.element(page.getByRole('heading', { name: 'Place 0' })).toHaveFocus()
      await screen.unmount()
    }
  })

  test('Escape closes the cluster popup and returns focus', async () => {
    await renderCluster()
    await openClusterWith('{Enter}')
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => popup().elements()).toHaveLength(0)
    await expect.element(cluster()).toHaveFocus()
  })

  test('Close closes the cluster popup and returns focus', async () => {
    await renderCluster()
    for (const key of ['{Enter}', ' ']) {
      await openClusterWith('{Enter}')
      button(/^Close/)
        .element()
        .focus()
      await userEvent.keyboard(key)
      await expect.poll(() => popup().elements()).toHaveLength(0)
      await expect.element(cluster()).toHaveFocus()
    }
  })

  test('Escape closes the cluster popup and returns focus to the list heading when the cluster is gone', async () => {
    await render(<KeyboardCase places={closePlaces} layers={hotelLayers} clustered markers list />)
    await expect.element(cluster()).toBeVisible()
    await openClusterWith('{Enter}')
    cluster().element().removeAttribute('id')
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => popup().elements()).toHaveLength(0)
    await expect.element(page.getByRole('heading', { level: 2 })).toHaveFocus()
  })

  test('Close closes the cluster popup and returns focus to the list heading when the cluster is gone', async () => {
    await render(<KeyboardCase places={closePlaces} layers={hotelLayers} clustered markers list />)
    await expect.element(cluster()).toBeVisible()
    await openClusterWith('{Enter}')
    cluster().element().removeAttribute('id')
    button(/^Close/)
      .element()
      .focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => popup().elements()).toHaveLength(0)
    await expect.element(page.getByRole('heading', { level: 2 })).toHaveFocus()
  })
})

describe('Map keyboard: virtualized cluster popup', () => {
  const crowdedPlaces = placesEast(60, 0, 0, 'hotels')
  const clusterName = 'Hotell: 60 places'
  const rowHeight = 56
  const clusterPlace = (index: number) =>
    page.getByRole('dialog', { name: clusterName }).getByRole('button', {
      name: `Place ${index}`,
      exact: true,
    })

  async function renderCrowdedAndEnterRows() {
    await render(<KeyboardCase places={crowdedPlaces} layers={hotelLayers} clustered markers />)
    const cluster = button(clusterName)
    await expect.element(cluster).toBeVisible()
    cluster.element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByRole('heading', { name: clusterName })).toHaveFocus()
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(clusterPlace(0)).toHaveFocus()
  }

  test('the arrows move between virtualized rows in the cluster popup', async () => {
    await renderCrowdedAndEnterRows()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(clusterPlace(0)).toHaveFocus()
    for (let index = 1; index <= 25; index += 1) {
      await userEvent.keyboard('{ArrowDown}')
      await expect.element(clusterPlace(index)).toHaveFocus()
    }
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(clusterPlace(24)).toHaveFocus()
  })

  test('Home and End move to the first and last virtualized row in the cluster popup', async () => {
    await renderCrowdedAndEnterRows()
    await userEvent.keyboard('{End}')
    await expect.element(clusterPlace(59)).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(clusterPlace(59)).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect.element(clusterPlace(0)).toHaveFocus()
  })

  test('PageUp and PageDown move by a page of rows in the cluster popup', async () => {
    await renderCrowdedAndEnterRows()
    const scroll = document.querySelector('.kv-map-cluster-places-scroll') as HTMLElement
    const pageSize = Math.floor(scroll.clientHeight / rowHeight)
    expect(pageSize).toBeGreaterThan(1)
    await userEvent.keyboard('{PageDown}')
    await expect.element(clusterPlace(pageSize)).toHaveFocus()
    await userEvent.keyboard('{PageUp}')
    await expect.element(clusterPlace(0)).toHaveFocus()
  })
})

async function emulateSystem(features: { name: string; value: string }[]) {
  await cdp().send('Emulation.setEmulatedMedia', { features })
}

describe('Map theme and base map name', () => {
  // The OS preference is emulated through Chromium's DevTools protocol, as in use-theme.test.tsx;
  // a fresh document per test gives a fresh theme store.
  const createEnv = (): Env => ({
    window,
    document: document.implementation.createHTMLDocument(''),
  })

  beforeEach(async () => {
    localStorage.clear()
    await emulateSystem([
      { name: 'prefers-color-scheme', value: 'light' },
      { name: 'prefers-contrast', value: 'no-preference' },
    ])
  })

  afterEach(async () => {
    await emulateSystem([
      { name: 'prefers-color-scheme', value: 'light' },
      { name: 'prefers-contrast', value: 'no-preference' },
      { name: 'forced-colors', value: 'none' },
    ])
  })

  function themed(baseMapList: MapBaseMap[] = [{ id: 'one' }, { id: 'two', label: 'Plan' }]) {
    const provider = createMemoryProvider({ baseMaps: baseMapList })
    const setTheme = vi.fn<(theme: MapTheme) => void>()
    const mount = vi.fn<typeof provider.mount>((...args) => {
      const handle = provider.mount(...args)
      handle.setTheme = setTheme
      return handle
    })
    return { setTheme, mount, memory: provider, provider: { ...provider, mount } }
  }

  const lastTheme = (setTheme: ReturnType<typeof themed>['setTheme']) =>
    setTheme.mock.calls.at(-1)?.[0]

  test('a theme change keeps focus on the open details, the popup and the view, and announces nothing', async () => {
    const { provider, memory, setTheme, mount } = themed()
    await render(
      <KvirnProvider env={createEnv()}>
        <style>{fixtureStyle}</style>
        <Map.Root
          provider={provider}
          label="Map"
          places={[placeAtPixelsEast(0)]}
          initialView={{ center: centre, zoom }}
        >
          <Map.Viewport className="fixture-viewport">
            <Map.Markers />
            <Map.Details />
          </Map.Viewport>
        </Map.Root>
      </KvirnProvider>,
    )
    await userEvent.click(marker())
    const details = page.getByRole('dialog')
    await expect.element(details).toBeVisible()
    const focused = document.activeElement
    const viewBefore = memory.handle!.getView()
    await emulateSystem([{ name: 'prefers-color-scheme', value: 'dark' }])
    await expect.poll(() => lastTheme(setTheme)?.colorScheme).toBe('dark')
    expect(document.activeElement).toBe(focused)
    await expect.element(details).toBeVisible()
    expect(mount).toHaveBeenCalledTimes(1)
    expect(memory.handle!.getView()).toEqual(viewBefore)
    const announced = [...document.querySelectorAll('[aria-live]')]
      .map((element) => element.textContent)
      .join('')
    expect(announced).toBe('')
  })

  test('a theme change keeps focus on a focused marker', async () => {
    const { provider, setTheme } = themed()
    await render(
      <KvirnProvider env={createEnv()}>
        <style>{fixtureStyle}</style>
        <Map.Root
          provider={provider}
          label="Map"
          places={[placeAtPixelsEast(0)]}
          initialView={{ center: centre, zoom }}
        >
          <Map.Viewport className="fixture-viewport">
            <Map.Markers />
          </Map.Viewport>
        </Map.Root>
      </KvirnProvider>,
    )
    await tabToMarker()
    await emulateSystem([{ name: 'prefers-color-scheme', value: 'dark' }])
    await expect.poll(() => lastTheme(setTheme)?.colorScheme).toBe('dark')
    await expect.element(marker()).toHaveFocus()
  })

  test('forced colours give setTheme contrast more', async () => {
    const { provider, setTheme } = themed()
    await render(
      <KvirnProvider env={createEnv()}>
        <Map.Root provider={provider} label="Map" initialView={{ center: centre, zoom }}>
          <Map.Viewport className="fixture-viewport" />
        </Map.Root>
      </KvirnProvider>,
    )
    await emulateSystem([{ name: 'forced-colors', value: 'active' }])
    await expect.poll(() => lastTheme(setTheme)?.contrast).toBe('more')
  })

  test('resolved contrast more gives setTheme contrast more', async () => {
    const { provider, setTheme } = themed()
    await render(
      <KvirnProvider env={createEnv()}>
        <Map.Root provider={provider} label="Map" initialView={{ center: centre, zoom }}>
          <Map.Viewport className="fixture-viewport" />
        </Map.Root>
      </KvirnProvider>,
    )
    await emulateSystem([{ name: 'prefers-contrast', value: 'more' }])
    await expect.poll(() => lastTheme(setTheme)?.contrast).toBe('more')
  })

  test('resolved contrast less gives setTheme contrast standard', async () => {
    const { provider, setTheme } = themed()
    await render(
      <KvirnProvider env={createEnv()}>
        <Map.Root provider={provider} label="Map" initialView={{ center: centre, zoom }}>
          <Map.Viewport className="fixture-viewport" />
        </Map.Root>
      </KvirnProvider>,
    )
    await emulateSystem([{ name: 'prefers-contrast', value: 'less' }])
    await expect.poll(() => setTheme.mock.calls.length).toBeGreaterThan(0)
    expect(lastTheme(setTheme)?.contrast).toBe('standard')
  })

  test('a base map with no label is named Map in the switch and when picked', async () => {
    const { provider } = themed([{ id: 'plan', label: 'Plan' }, { id: 'one' }])
    await render(
      <KvirnProvider>
        <Map.Root provider={provider} label="Map" initialView={{ center: centre, zoom }}>
          <Map.Viewport className="fixture-viewport">
            <Map.BaseMapSwitch />
          </Map.Viewport>
        </Map.Root>
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Map type' }))
    await expect.element(page.getByRole('radio', { name: 'Plan' })).toBeVisible()
    await userEvent.click(page.getByRole('radio', { name: 'Map', exact: true }))
    await expect
      .poll(() =>
        [...document.querySelectorAll('[aria-live]')]
          .map((element) => element.textContent)
          .join(''),
      )
      .toContain('Map type: Map.')
  })
})
