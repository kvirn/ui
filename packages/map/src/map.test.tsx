import { describe, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Map } from './map.tsx'
import { createMemoryProvider } from './memory-provider.ts'
import type { MapPlace } from './index.ts'

// Contract: map.a11y.md. This file proves the focus-not-obscured row (WCAG 2.4.11). Component
// tests load no theme, so the fixture positions the viewport, the markers and the chrome itself.

const zoom = 10
const centre = { longitude: 18, latitude: 59 }
const degreesPerPixel = 360 / (512 * 2 ** zoom)

const fixtureStyle = `
  .fixture-viewport { position: relative; inline-size: 800px; block-size: 600px; }
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

  test('a layer chip toggles with Space', async () => {
    await render(<ChromeMap />)
    const chip = page.getByRole('checkbox', { name: /Tankställen/ })
    await expect.element(chip).toBeChecked()
    chip.element().focus()
    await userEvent.keyboard(' ')
    await expect.element(chip).not.toBeChecked()
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
