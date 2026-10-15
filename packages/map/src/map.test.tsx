import { describe, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import type { ComponentProps } from 'react'
import { Icon } from '@kvirn-ui/react'
import { Map } from './map.tsx'
import { mapIcons } from './map-icons.tsx'
import { createMemoryProvider } from './memory-provider.ts'
import type { MapPlace } from './index.ts'

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
  name: 'Förskolan Björken',
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
        label="Karta"
        places={[place]}
        initialView={{ center: centre, zoom }}
      >
        <Map.Viewport className="fixture-viewport">
          <Map.Markers />
          {chrome === 'overlay' ? (
            <Map.Overlay data-testid="overlay" style={leftColumn}>
              <label>
                Sök
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
        label="Karta"
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

const marker = () => page.getByRole('button', { name: 'Förskolan Björken' })

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
      label="Karta"
      places={[placeAtPixelsEast(600)]}
      layers={[{ id: 'a', label: 'Tankställen' }]}
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
        label="Karta"
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
    const chip = page.getByRole('checkbox', { name: /Tankställen/ })
    await expect.element(chip).toBeChecked()
    chip.element().focus()
    await userEvent.keyboard(' ')
    await expect.element(chip).not.toBeChecked()
  })

  const renderLayers = (layersProps: ComponentProps<typeof Map.Layers> = {}) =>
    render(
      <Map.Root
        provider={createMemoryProvider()}
        label="Karta"
        places={[placeAtPixelsEast(600)]}
        layers={[
          { id: 'a', label: 'Tankställen' },
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
          label="Karta"
          places={[
            {
              id: 'forskola',
              name: 'Förskolan Björken',
              description: 'Lång beskrivning. '.repeat(120),
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
    name: `Plats ${index}`,
    layer: 'hotels',
  }))
  const renderClusters = (cluster?: () => string, icon: boolean = true) =>
    render(
      <>
        <style>{fixtureStyle}</style>
        <Map.Root
          provider={createMemoryProvider()}
          label="Karta"
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
        label="Karta"
        places={[placeAtPixelsEast(0)]}
        layers={[{ id: 'a', label: 'Tankställen', icon: <span>L</span> }]}
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
      .getByRole('checkbox', { name: /Tankställen/ })
      .element()
      .closest('.kv-field')
    const wrapper = swatch?.querySelector('.kv-map-layer-swatch')
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true')
    expect(wrapper?.textContent).toBe('L')
  })

  test('the icon prop of Map.Layers wins over the layer icon', async () => {
    await renderLayers(() => 'P')
    await expect.element(page.getByRole('checkbox', { name: /Tankställen/ })).toBeVisible()
    expect(document.querySelector('.kv-map-layer-swatch')?.textContent).toBe('P')
  })
})

describe('Map with the memory provider', () => {
  const place = placeAtPixelsEast(0)
  const renderList = (headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6') =>
    render(
      <Map.Root
        provider={createMemoryProvider()}
        label="Karta"
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
        label="Karta"
        initialView={{ center: centre, zoom }}
      >
        <Map.Viewport data-testid="viewport" className="fixture-viewport" />
      </Map.Root>,
    )
    await expect.element(page.getByTestId('viewport')).toHaveAttribute('data-status', 'ready')
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
