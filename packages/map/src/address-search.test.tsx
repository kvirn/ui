// kv-lang-ok-file: the fixture holds Swedish, Finnish and Norwegian addresses and the Swedish catalog proves translated strings
import { sv } from '@kvirn-ui/i18n/sv'
import type {
  AddressResult,
  AddressSuggestion,
  GeocoderProvider,
  GeocoderSearchOptions,
} from '@kvirn-ui/core'
import { KvirnProvider } from '@kvirn-ui/react'
import { readAloud, readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { useState } from 'react'
import { afterEach, beforeAll, describe, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { AddressSearch } from './address-search.tsx'
import type { AddressSearchProps } from './address-search.tsx'
import { Map } from './map.tsx'
import { useMapState } from './map-context.ts'
import { createMemoryProvider } from './memory-provider.ts'

// Contract: address-search.a11y.md. The keys, roles and states that AddressSearch inherits from
// Autocomplete are proved in autocomplete.test.tsx and not repeated here. The geocoder is a fake
// in memory: no test calls the network. Component tests load no theme, so the fixture sizes the
// buttons itself.

const malmo: AddressResult = {
  id: 'malmo',
  label: 'Storgatan 1, 211 22 Malmö',
  position: { longitude: 13.0, latitude: 55.6 },
  address: { line1: 'Storgatan 1', postalCode: '211 22', city: 'Malmö', country: 'SE' },
}
const goteborg: AddressResult = {
  id: 'goteborg',
  label: 'Storgatan 1, 411 38 Göteborg',
  position: { longitude: 11.97, latitude: 57.7 },
  bounds: { west: 11.96, south: 57.69, east: 11.98, north: 57.71 },
  address: { line1: 'Storgatan 1', postalCode: '411 38', city: 'Göteborg', country: 'SE' },
}
const helsinki: AddressResult = {
  id: 'helsinki',
  label: 'Mannerheimintie 1, 00100 Helsinki',
  position: { longitude: 24.94, latitude: 60.17 },
  address: { line1: 'Mannerheimintie 1', postalCode: '00100', city: 'Helsinki', country: 'FI' },
}
const addresses: readonly AddressResult[] = [malmo, goteborg, helsinki]

interface FakeGeocoderOptions {
  suggest?: boolean
  name?: string
  attribution?: string
  delay?: (query: string) => number
  honorsAbort?: boolean
  answers?: Record<string, readonly AddressSuggestion[]>
  resolve?: GeocoderProvider['resolve']
}

interface Call {
  query: string
  options: GeocoderSearchOptions
}

function createFakeGeocoder(fake: FakeGeocoderOptions = {}) {
  const calls: Call[] = []
  const geocoder: GeocoderProvider = {
    ...(fake.name === undefined ? {} : { name: fake.name }),
    ...(fake.attribution === undefined ? {} : { attribution: fake.attribution }),
    suggest: fake.suggest ?? false,
    ...(fake.resolve === undefined ? {} : { resolve: fake.resolve }),
    search: (query, options) => {
      calls.push({ query, options })
      return new Promise((resolve, reject) => {
        if (query.includes('broken')) {
          reject(new Error('Address search failed (500)'))
          return
        }
        const answer =
          fake.answers?.[query] ??
          (query.includes('nowhere')
            ? []
            : addresses.filter((address) =>
                address.label.toLowerCase().includes(query.toLowerCase().split(',')[0] ?? ''),
              ))
        const delay = fake.delay?.(query) ?? 0
        const timer = Number.isFinite(delay)
          ? window.setTimeout(() => resolve([...answer]), delay)
          : undefined
        if (fake.honorsAbort !== false) {
          options.signal?.addEventListener('abort', () => {
            window.clearTimeout(timer)
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }
      })
    },
  }
  return { geocoder, calls }
}

const fixtureStyle = `
  .kv-address-lookup-submit, .kv-autocomplete-clear { min-block-size: 2rem; min-inline-size: 2rem; }
  .fixture-viewport { position: relative; inline-size: 800px; block-size: 400px; }
  .kv-map-search-result { position: absolute; inset-inline-start: var(--kv-map-x); inset-block-start: var(--kv-map-y); }
`

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = fixtureStyle
  document.head.append(style)
})

afterEach(() => {
  vi.restoreAllMocks()
})

type HarnessProps = Partial<AddressSearchProps> & {
  geocoder: GeocoderProvider
  inForm?: boolean
  onSubmit?: () => void
  swedish?: boolean
}

function Harness({ inForm = false, onSubmit, swedish = false, ...searchProps }: HarnessProps) {
  const search = <AddressSearch debounce={20} {...searchProps} />
  return (
    <KvirnProvider locale={swedish ? 'sv-SE' : 'en'} messages={swedish ? sv : undefined}>
      <button type="button" className="kv-address-lookup-submit">
        Before
      </button>
      {inForm ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit?.()
          }}
        >
          {search}
          <button type="submit" className="kv-address-lookup-submit">
            Send
          </button>
        </form>
      ) : (
        search
      )}
    </KvirnProvider>
  )
}

const input = () => page.getByRole('combobox', { name: 'Find an address' })
const searchButton = () => page.getByRole('button', { name: 'Search', exact: true })
const optionCount = () => page.getByRole('option').elements().length
const statusLine = (text: string) => page.getByText(text)

async function type(text: string) {
  await userEvent.click(input())
  await userEvent.keyboard(text)
}

function recordAnnouncements() {
  const messages: string[] = []
  const region = () => document.querySelector('output[aria-live="polite"]')
  let previous = region()?.textContent ?? ''
  const observer = new MutationObserver(() => {
    const text = region()?.textContent ?? ''
    if (text !== '' && previous === '') {
      messages.push(text)
    }
    previous = text
  })
  observer.observe(document.body, { subtree: true, childList: true, characterData: true })
  return { messages, stop: () => observer.disconnect() }
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

// Longer than the announcement debounce (500 ms), so a message that is going to be said has been.
const afterAnnouncements = () => wait(900)

describe('AddressSearch structure', () => {
  test('renders the ARIA 1.2 combobox, named by the visible label and described by the help text, then the notice', async () => {
    const { geocoder } = createFakeGeocoder({ name: 'Test service', attribution: '© Test data' })
    await render(<Harness geocoder={geocoder} />)
    await expect.element(input()).toBeVisible()
    const element = input().element()
    const descriptions = (element.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent)
    expect(descriptions).toEqual([
      'Type a street and number, a postal code or a place. Then press Search.',
      'What you type is sent to Test service to find the address. © Test data',
    ])
    const label = document.querySelector(`label[for="${element.id}"]`)
    expect(label?.textContent).toBe('Find an address')
  })

  test('nothing is sent on mount, focus or with empty text', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await render(<Harness geocoder={geocoder} />)
    await userEvent.click(input())
    await userEvent.keyboard('{Enter}')
    await wait(200)
    expect(calls).toHaveLength(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('AddressSearch as you type', () => {
  test('below minLength no request is sent and nothing is announced', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    await render(<Harness geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await type('St')
    await afterAnnouncements()
    expect(calls).toHaveLength(0)
    expect(announced.messages).toEqual([])
    announced.stop()
  })

  test('one request after the debounce of no typing, not one per keystroke', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    await render(<Harness geocoder={geocoder} debounce={150} />)
    await type('Storg')
    await expect.poll(() => calls.length).toBe(1)
    await wait(300)
    expect(calls).toHaveLength(1)
    expect(calls[0]?.query).toBe('Storg')
  })

  test('a new keystroke aborts the request in flight and a late answer for old text is never shown', async () => {
    const { geocoder, calls } = createFakeGeocoder({
      suggest: true,
      honorsAbort: false,
      delay: (query) => (query === 'Stor' ? 500 : 10),
      answers: { Stor: [malmo], Storg: [goteborg] },
    })
    await render(<Harness geocoder={geocoder} />)
    await type('Stor')
    await expect.poll(() => calls.length).toBe(1)
    await userEvent.keyboard('g')
    await expect.poll(() => calls.length).toBe(2)
    expect(calls[0]?.options.signal?.aborted).toBe(true)
    await expect.poll(optionCount).toBe(1)
    await wait(700)
    await expect.poll(optionCount).toBe(1)
    await expect.element(page.getByRole('option', { name: goteborg.label })).toBeVisible()
  })

  test('passes the intent suggest as you type and submit for Enter, with the provider locale', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    await render(<Harness geocoder={geocoder} />)
    await type('Storgatan')
    await expect.poll(() => calls.length).toBe(1)
    expect(calls[0]?.options.intent).toBe('suggest')
    expect(calls[0]?.options.locale).toBe('en')
    await userEvent.keyboard(' 1{Enter}')
    await expect.poll(() => calls.length).toBe(2)
    expect(calls[1]?.options.intent).toBe('submit')
    expect(searchButton().elements()).toHaveLength(0)
  })
})

describe('AddressSearch on request', () => {
  test('typing sends nothing, and Enter or Search sends one request (a geocoder without suggest)', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} />)
    await type('Storgatan')
    await wait(300)
    expect(calls).toHaveLength(0)
    await userEvent.click(searchButton())
    await expect.poll(() => calls.length).toBe(1)
    expect(calls[0]?.options.intent).toBe('submit')
    await userEvent.click(input())
    await userEvent.keyboard(' 1{Enter}')
    await expect.poll(() => calls.length).toBe(2)
    expect(calls.map((call) => call.query)).toEqual(['Storgatan', 'Storgatan 1'])
  })

  test('typing sends nothing with debounce={false} although the geocoder suggests', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    await render(<Harness geocoder={geocoder} debounce={false} />)
    await type('Storgatan')
    await wait(300)
    expect(calls).toHaveLength(0)
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => calls.length).toBe(1)
    await expect.element(searchButton()).toBeVisible()
  })

  test('Enter or Search below minLength shows and announces tooShort and sends nothing', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await type('St')
    await userEvent.click(searchButton())
    await expect.element(statusLine('Type at least 3 characters to search.')).toBeVisible()
    await expect
      .poll(() => announced.messages, { timeout: 3000 })
      .toEqual(['Type at least 3 characters to search.'])
    expect(calls).toHaveLength(0)
    await userEvent.click(input())
    await userEvent.keyboard('{Enter}')
    expect(calls).toHaveLength(0)
    announced.stop()
  })
})

describe('AddressSearch states and announcements', () => {
  test('searching shows the status, announces searching and keeps the earlier options in place', async () => {
    const { geocoder } = createFakeGeocoder({
      delay: (query) => (query === 'Storgatan 1' ? Number.POSITIVE_INFINITY : 0),
    })
    await render(<Harness geocoder={geocoder} />)
    await type('Storgatan{Enter}')
    await expect.poll(optionCount).toBe(2)
    const announced = recordAnnouncements()
    await userEvent.keyboard(' 1')
    await userEvent.click(searchButton())
    await expect.element(statusLine('Searching for addresses')).toBeVisible()
    await expect.poll(optionCount).toBe(2)
    await expect
      .poll(() => announced.messages, { timeout: 3000 })
      .toEqual(['Searching for addresses'])
    announced.stop()
  })

  test('n results are listed, the count is announced once after the answer and nothing is active', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await type('Storgatan{Enter}')
    await expect.poll(optionCount).toBe(2)
    expect(input().element().getAttribute('aria-expanded')).toBe('true')
    expect(input().element().hasAttribute('aria-activedescendant')).toBe(false)
    await afterAnnouncements()
    expect(announced.messages).toEqual(['2 addresses found'])
    announced.stop()
  })

  test('no results shows and announces noResults with the query, reports collapsed and is not invalid', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await type('nowhere street{Enter}')
    const message = 'No address found for “nowhere street”. Check the spelling, or add the town.'
    await expect.element(statusLine(message)).toBeVisible()
    expect(input().element().getAttribute('aria-expanded')).toBe('false')
    expect(input().element().hasAttribute('aria-invalid')).toBe(false)
    await expect.poll(() => announced.messages, { timeout: 3000 }).toEqual([message])
    announced.stop()
  })

  test('a rejection shows and announces error, and the text stays', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await type('broken street{Enter}')
    const message = 'The address search isn’t working right now. Try again in a moment.'
    await expect.element(statusLine(message)).toBeVisible()
    await expect.poll(() => announced.messages, { timeout: 3000 }).toEqual([message])
    await expect.element(input()).toHaveValue('broken street')
    announced.stop()
  })

  test('no answer within the timeout shows and announces error', async () => {
    const { geocoder } = createFakeGeocoder({ delay: () => Number.POSITIVE_INFINITY })
    await render(<Harness geocoder={geocoder} timeoutMilliseconds={150} />)
    await type('Storgatan{Enter}')
    await expect
      .element(statusLine('The address search isn’t working right now. Try again in a moment.'))
      .toBeVisible()
    await expect.element(input()).toHaveValue('Storgatan')
  })

  test('offline shows and announces offline and sends no request', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const { geocoder, calls } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await type('Storgatan{Enter}')
    const message = 'You’re offline. Connect to the internet, then search again.'
    await expect.element(statusLine(message)).toBeVisible()
    await expect.poll(() => announced.messages, { timeout: 3000 }).toEqual([message])
    expect(calls).toHaveLength(0)
    announced.stop()
  })
})

describe('AddressSearch keyboard', () => {
  test('Enter with no suggestion active, standalone, searches now and flushes the debounce', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    await render(<Harness geocoder={geocoder} debounce={5000} />)
    await type('Storgatan')
    expect(calls).toHaveLength(0)
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => calls.length).toBe(1)
    expect(calls[0]?.options.intent).toBe('submit')
    await expect.poll(optionCount).toBe(2)
  })

  test('Enter with no suggestion active, inside a form, searches now and the form does not submit', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    const onSubmit = vi.fn<() => void>()
    await render(<Harness geocoder={geocoder} inForm onSubmit={onSubmit} />)
    await type('Storgatan{Enter}')
    await expect.poll(() => calls.length).toBe(1)
    await expect.poll(optionCount).toBe(2)
    await wait(200)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('Enter on text unchanged since the last answer reopens the list without activating it and says the count again', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await type('Storgatan{Enter}')
    await expect.poll(optionCount).toBe(2)
    await expect.poll(() => announced.messages.length, { timeout: 3000 }).toBe(1)
    await userEvent.keyboard('{Escape}')
    await expect.poll(optionCount).toBe(0)
    await userEvent.keyboard('{Enter}')
    await expect.poll(optionCount).toBe(2)
    expect(input().element().hasAttribute('aria-activedescendant')).toBe(false)
    await expect
      .poll(() => announced.messages, { timeout: 3000 })
      .toEqual(['2 addresses found', '2 addresses found'])
    expect(calls).toHaveLength(1)
    announced.stop()
  })

  test('Search is a native type=button, one Tab stop after the input, searches on Enter and on Space, and never submits a form', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    const onSubmit = vi.fn<() => void>()
    await render(<Harness geocoder={geocoder} inForm onSubmit={onSubmit} />)
    await type('Storgatan')
    await userEvent.tab()
    await expect.element(searchButton()).toHaveFocus()
    expect(searchButton().element().tagName).toBe('BUTTON')
    expect(searchButton().element().getAttribute('type')).toBe('button')
    await userEvent.keyboard(' ')
    await expect.poll(() => calls.map((call) => call.query)).toEqual(['Storgatan'])
    await expect.poll(optionCount).toBe(2)
    await userEvent.tab({ shift: true })
    await expect.element(input()).toHaveFocus()
    await userEvent.keyboard('{End} 1')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => calls.map((call) => call.query)).toEqual(['Storgatan', 'Storgatan 1'])
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Send' })).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await expect.element(input()).toHaveFocus()
  })
})

describe('AddressSearch pick and clear', () => {
  async function searchStorgatan(onResult = vi.fn<(result: AddressResult | null) => void>()) {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} onResult={onResult} />)
    const announced = recordAnnouncements()
    await type('Storgatan{Enter}')
    await expect.poll(optionCount).toBe(2)
    await expect.poll(() => announced.messages.length, { timeout: 3000 }).toBe(1)
    return { onResult, calls, announced }
  }

  async function expectPicked(
    onResult: ReturnType<typeof vi.fn<(result: AddressResult | null) => void>>,
    announced: ReturnType<typeof recordAnnouncements>,
  ) {
    await expect.element(input()).toHaveValue(goteborg.label)
    expect(onResult).toHaveBeenCalledTimes(1)
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ id: 'goteborg' }))
    await expect.element(input()).toHaveFocus()
    await expect
      .poll(() => announced.messages.at(-1), { timeout: 3000 })
      .toBe(`Chosen: ${goteborg.label}.`)
    announced.stop()
  }

  test('pick with Enter: the text becomes the label, onResult is called once, focus stays and picked is announced', async () => {
    const { onResult, announced } = await searchStorgatan()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    await expectPicked(onResult, announced)
  })

  test('pick with Alt+ArrowUp: the text becomes the label, onResult is called once, focus stays and picked is announced', async () => {
    const { onResult, announced } = await searchStorgatan()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Alt>}{ArrowUp}{/Alt}')
    await expectPicked(onResult, announced)
  })

  test('pick by press: the text becomes the label, onResult is called once, focus stays and picked is announced', async () => {
    const { onResult, announced } = await searchStorgatan()
    await userEvent.click(page.getByRole('option', { name: goteborg.label }))
    await expectPicked(onResult, announced)
  })

  test('Clear empties the text, calls onResult(null) and leaves focus on the input', async () => {
    const { onResult } = await searchStorgatan()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onResult).toHaveBeenCalledTimes(1)
    await userEvent.click(page.getByRole('button', { name: 'Clear' }))
    await expect.element(input()).toHaveValue('')
    expect(onResult).toHaveBeenLastCalledWith(null)
    await expect.element(input()).toHaveFocus()
  })

  test('a suggestion without a position is resolved on pick: searching shows, resolve runs once and onResult gets the position', async () => {
    const resolve = vi.fn<NonNullable<GeocoderProvider['resolve']>>(async (suggestion) => {
      await wait(400)
      return { ...suggestion, position: helsinki.position }
    })
    const { geocoder } = createFakeGeocoder({
      answers: { Mannerheim: [{ id: 'place-1', label: helsinki.label }] },
      resolve,
    })
    const onResult = vi.fn<(result: AddressResult | null) => void>()
    await render(<Harness geocoder={geocoder} onResult={onResult} />)
    await type('Mannerheim{Enter}')
    await userEvent.click(page.getByRole('option', { name: helsinki.label }))
    await expect.element(statusLine('Searching for addresses')).toBeVisible()
    await expect.poll(() => onResult.mock.calls.length).toBe(1)
    expect(resolve).toHaveBeenCalledTimes(1)
    expect(resolve.mock.calls[0]?.[1]?.locale).toBe('en')
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'place-1', position: helsinki.position }),
    )
    await expect.element(input()).toHaveFocus()
  })

  test('a resolve that fails shows error and calls no onResult', async () => {
    const { geocoder } = createFakeGeocoder({
      answers: { Mannerheim: [{ id: 'place-1', label: helsinki.label }] },
      resolve: () => Promise.reject(new Error('Place details failed (500)')),
    })
    const onResult = vi.fn<(result: AddressResult | null) => void>()
    await render(<Harness geocoder={geocoder} onResult={onResult} />)
    await type('Mannerheim{Enter}')
    await userEvent.click(page.getByRole('option', { name: helsinki.label }))
    await expect
      .element(statusLine('The address search isn’t working right now. Try again in a moment.'))
      .toBeVisible()
    expect(onResult).not.toHaveBeenCalled()
  })
})

const readSpoken = (container: HTMLElement, act: () => Promise<void>) =>
  readAnnouncements(container, act, { timeout: 3000, settle: 1500 })

async function typeInto(text: string) {
  await userEvent.click(input())
  await userEvent.keyboard(text)
}

describe('AddressSearch with a map', () => {
  const view = { center: { longitude: 18, latitude: 59 }, zoom: 8 }

  function MapBridge({ geocoder }: { geocoder: GeocoderProvider }) {
    const map = useMapState()
    return (
      <AddressSearch
        geocoder={geocoder}
        debounce={20}
        onResult={(result) => (result ? map.show(result) : map.clearResult())}
      />
    )
  }

  function MapHarness({
    geocoder,
    provider,
  }: {
    geocoder: GeocoderProvider
    provider: ReturnType<typeof createMemoryProvider>
  }) {
    return (
      <KvirnProvider locale="en">
        <Map.Root provider={provider} label="Map" initialView={view}>
          <MapBridge geocoder={geocoder} />
          <Map.Viewport className="fixture-viewport" />
        </Map.Root>
      </KvirnProvider>
    )
  }

  test('show(result) fits the bounds or centres, draws the pin, keeps focus and announces addressShown once settled', async () => {
    const { geocoder } = createFakeGeocoder()
    const provider = createMemoryProvider()
    await render(<MapHarness geocoder={geocoder} provider={provider} />)
    const announced = recordAnnouncements()
    await type('Storgatan{Enter}')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    await expect.poll(() => provider.handle?.getView().center.longitude).toBeCloseTo(11.97, 1)
    expect(provider.handle?.getView().center.latitude).toBeCloseTo(57.7, 1)
    await expect.poll(() => document.querySelector('.kv-map-search-result')).not.toBeNull()
    expect(document.querySelector('.kv-map-search-result')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    await expect.element(input()).toHaveFocus()
    await expect
      .poll(() => announced.messages.filter((message) => message.startsWith('The map shows')), {
        timeout: 3000,
      })
      .toEqual(['The map shows the address. 0 places.'])
    announced.stop()
  })

  test('a pick with a map says which address was chosen, then that the map shows it', async () => {
    const { geocoder } = createFakeGeocoder()
    const provider = createMemoryProvider()
    const { container } = await render(<MapHarness geocoder={geocoder} provider={provider} />)
    await typeInto('Storgatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(optionCount).toBe(2)
    await wait(900)
    expect(
      await readSpoken(container, () => userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')),
    ).toEqual([
      `polite: Chosen: ${goteborg.label}.`,
      'polite: The map shows the address. 0 places.',
    ])
  })

  test('show(result) of the address already shown still announces addressShown, and a later move does not repeat it', async () => {
    const provider = createMemoryProvider()
    function ShowAgain() {
      const map = useMapState()
      return (
        <button type="button" onClick={() => map.show(goteborg)}>
          Show again
        </button>
      )
    }
    await render(
      <KvirnProvider locale="en">
        <Map.Root provider={provider} label="Map" initialView={view}>
          <ShowAgain />
          <Map.Viewport className="fixture-viewport" />
        </Map.Root>
      </KvirnProvider>,
    )
    const announced = recordAnnouncements()
    await userEvent.click(page.getByRole('button', { name: 'Show again' }))
    await expect.poll(() => announced.messages.length, { timeout: 3000 }).toBe(1)
    await afterAnnouncements()
    await userEvent.click(page.getByRole('button', { name: 'Show again' }))
    await expect
      .poll(
        () => announced.messages.filter((message) => message.startsWith('The map shows')).length,
        {
          timeout: 3000,
        },
      )
      .toBe(2)
    announced.stop()
  })

  test('clearResult removes the pin and announces nothing', async () => {
    const { geocoder } = createFakeGeocoder()
    const provider = createMemoryProvider()
    await render(<MapHarness geocoder={geocoder} provider={provider} />)
    const shown = recordAnnouncements()
    await type('Storgatan{Enter}')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect.poll(() => document.querySelector('.kv-map-search-result')).not.toBeNull()
    await expect
      .poll(() => shown.messages.some((message) => message.startsWith('The map shows')), {
        timeout: 3000,
      })
      .toBe(true)
    shown.stop()
    await afterAnnouncements()
    const announced = recordAnnouncements()
    await userEvent.click(page.getByRole('button', { name: 'Clear' }))
    await expect.poll(() => document.querySelector('.kv-map-search-result')).toBeNull()
    await afterAnnouncements()
    expect(announced.messages).toEqual([])
    announced.stop()
  })
})

describe('AddressSearch in a form', () => {
  function FormExample({ geocoder }: { geocoder: GeocoderProvider }) {
    const [address, setAddress] = useState({ line1: '', postalCode: '', city: '' })
    return (
      <KvirnProvider locale="en">
        <AddressSearch
          geocoder={geocoder}
          onResult={(result) => {
            if (result?.address) {
              setAddress({
                line1: result.address.line1,
                postalCode: result.address.postalCode,
                city: result.address.city,
              })
            }
          }}
        />
        <label>
          Street
          <input
            value={address.line1}
            onChange={(event) => setAddress({ ...address, line1: event.target.value })}
          />
        </label>
        <label>
          Postal code
          <input
            value={address.postalCode}
            onChange={(event) => setAddress({ ...address, postalCode: event.target.value })}
          />
        </label>
        <label>
          City
          <input
            value={address.city}
            onChange={(event) => setAddress({ ...address, city: event.target.value })}
          />
        </label>
      </KvirnProvider>
    )
  }

  test('the result address fills the boxes, which stay editable', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<FormExample geocoder={geocoder} />)
    await type('Storgatan{Enter}')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    const street = page.getByRole('textbox', { name: 'Street' })
    await expect.element(street).toHaveValue('Storgatan 1')
    await expect.element(page.getByRole('textbox', { name: 'Postal code' })).toHaveValue('211 22')
    await expect.element(page.getByRole('textbox', { name: 'City' })).toHaveValue('Malmö')
    await userEvent.fill(page.getByRole('textbox', { name: 'Postal code' }), '211 23')
    await expect.element(page.getByRole('textbox', { name: 'Postal code' })).toHaveValue('211 23')
  })
})

describe('AddressSearch Root options', () => {
  const root = () => document.querySelector('.kv-address-search')
  const optionNames = ['country', 'limitToCountry', 'describePick', 'initialText']
  const expectNoOptionAttributes = () =>
    expect(
      root()
        ?.getAttributeNames()
        .filter((name) =>
          optionNames.some((option) => option.toLowerCase() === name.toLowerCase()),
        ),
    ).toEqual([])

  test('country is sent to the geocoder and is not a DOM attribute', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} country="SE" />)
    await type('Storgatan{Enter}')
    await expect.poll(() => calls.length).toBe(1)
    expect(calls[0]?.options.country).toBe('SE')
    expectNoOptionAttributes()
  })

  test('limitToCountry drops the answers in another country and is not a DOM attribute', async () => {
    const { geocoder } = createFakeGeocoder({ answers: { Storgatan: [malmo, helsinki] } })
    await render(<Harness geocoder={geocoder} country="SE" limitToCountry />)
    await type('Storgatan{Enter}')
    await expect.poll(optionCount).toBe(1)
    await expect.element(page.getByRole('option', { name: malmo.label })).toBeVisible()
    expectNoOptionAttributes()
  })

  test('initialText is the text the input starts with and is not a DOM attribute', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} initialText="Storgatan 1" />)
    await expect.element(input()).toHaveValue('Storgatan 1')
    expectNoOptionAttributes()
  })
})

describe('AddressSearch status attributes', () => {
  const rootStatus = () => document.querySelector('.kv-address-search')?.getAttribute('data-status')
  const lineState = () =>
    document.querySelector('.kv-address-lookup-status')?.getAttribute('data-state')

  test('Root data-status follows the state, and Status data-state names the state its words describe', async () => {
    const { geocoder } = createFakeGeocoder({
      delay: (query) => (query === 'Storgatan 1' ? Number.POSITIVE_INFINITY : 0),
    })
    const onlineSpy = vi.spyOn(navigator, 'onLine', 'get')
    await render(
      <Harness
        geocoder={geocoder}
        describePick={(result) =>
          result.id === 'malmo' ? { rejected: 'Choose a street address.' } : { announcement: 'ok' }
        }
      />,
    )
    expect(rootStatus()).toBe('idle')
    expect(lineState()).toBeUndefined()

    await type('St{Enter}')
    await expect.poll(rootStatus).toBe('too-short')
    expect(lineState()).toBe('too-short')

    await userEvent.keyboard('orgatan{Enter}')
    await expect.poll(rootStatus).toBe('results')
    await expect.poll(optionCount).toBe(2)
    expect(lineState()).toBeUndefined()

    await userEvent.keyboard(' 1{Enter}')
    await expect.poll(rootStatus).toBe('searching')
    expect(lineState()).toBe('searching')

    await userEvent.keyboard('{Backspace}{Backspace}{Enter}')
    await expect.poll(rootStatus).toBe('results')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect.poll(rootStatus).toBe('rejected')
    expect(lineState()).toBe('rejected')

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    await expect.poll(rootStatus).toBe('selected')
    expect(lineState()).toBeUndefined()

    await userEvent.keyboard('{Control>}a{/Control}nowhere{Enter}')
    await expect.poll(rootStatus).toBe('empty')
    expect(lineState()).toBe('empty')

    await userEvent.keyboard('{Control>}a{/Control}broken{Enter}')
    await expect.poll(rootStatus).toBe('error')
    expect(lineState()).toBe('error')

    onlineSpy.mockReturnValue(false)
    await userEvent.keyboard('{Control>}a{/Control}Storgatan{Enter}')
    await expect.poll(rootStatus).toBe('offline')
    expect(lineState()).toBe('offline')
  })
})

describe('AddressSearch strings', () => {
  test('every string comes from addressSearch.* and is overridable per instance', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<Harness geocoder={geocoder} swedish />)
    await expect.element(page.getByRole('combobox', { name: 'Hitta en adress' })).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Sök', exact: true })).toBeVisible()
    await expect
      .element(
        page.getByText(
          'Skriv en gata och ett nummer, ett postnummer eller en ort. Tryck sedan på Sök.',
        ),
      )
      .toBeVisible()
  })

  test('a per-instance message replaces the catalog text', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(
      <Harness
        geocoder={geocoder}
        label="Find your address"
        messages={{ submit: 'Look up', tooShort: ({ min }) => `Give ${min} letters or more.` }}
      />,
    )
    await expect.element(page.getByRole('combobox', { name: 'Find your address' })).toBeVisible()
    await userEvent.click(page.getByRole('button', { name: 'Look up' }))
    await expect.element(statusLine('Give 3 letters or more.')).toBeVisible()
  })
})

describe('AddressSearch read aloud', () => {
  test('focus: the field is read with its label, help text, privacy notice and state, then the Search button', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<Harness geocoder={geocoder} />)
    const phrases = await readAloud(container)
    expect(phrases).toContain(
      'combobox, Find an address, Type a street and number, a postal code or a place. Then press Search. What you type is sent to an address service to find the address., has popup listbox, not expanded, autocomplete in list, 1 control',
    )
    expect(phrases).toContain('button, Search')
  })

  test('typing says nothing, and no request is sent', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    const { container } = await render(<Harness geocoder={geocoder} />)
    await expect(
      readAnnouncements(container, () => typeInto('Storgatan'), { timeout: 1500 }),
    ).rejects.toThrow('No live-region announcement')
    expect(calls).toHaveLength(0)
  })

  test('a slow search says it is searching', async () => {
    const { geocoder } = createFakeGeocoder({ delay: () => Number.POSITIVE_INFINITY })
    const { container } = await render(<Harness geocoder={geocoder} />)
    await typeInto('Storgatan')
    expect(await readSpoken(container, () => userEvent.click(searchButton()))).toEqual([
      'polite: Searching for addresses',
    ])
  })

  test('Search below minLength says what is missing', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<Harness geocoder={geocoder} />)
    await typeInto('St')
    expect(await readSpoken(container, () => userEvent.click(searchButton()))).toEqual([
      'polite: Type at least 3 characters to search.',
    ])
  })

  test('Search says the count, and the list is read as options', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<Harness geocoder={geocoder} />)
    await typeInto('Storgatan')
    expect(await readSpoken(container, () => userEvent.click(searchButton()))).toEqual([
      'polite: 2 addresses found',
    ])
    const phrases = await readAloud(container)
    expect(phrases.filter((phrase) => phrase.startsWith('option'))).toEqual([
      'option, Storgatan 1, 211 22 Malmö, not selected, position 1, set size 2',
      'option, Storgatan 1, 411 38 Göteborg, not selected, position 2, set size 2',
    ])
  })

  test('Clear says nothing', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<Harness geocoder={geocoder} />)
    await typeInto('Storgatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(optionCount).toBe(2)
    await wait(900)
    await expect(
      readAnnouncements(
        container,
        () => userEvent.click(page.getByRole('button', { name: 'Clear' })),
        { timeout: 1500 },
      ),
    ).rejects.toThrow('No live-region announcement')
  })

  test('no address found says what to check', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<Harness geocoder={geocoder} />)
    await typeInto('nowhere')
    expect(await readSpoken(container, () => userEvent.keyboard('{Enter}'))).toEqual([
      'polite: No address found for “nowhere”. Check the spelling, or add the town.',
    ])
  })

  test('an error says to try again', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<Harness geocoder={geocoder} />)
    await typeInto('broken')
    expect(await readSpoken(container, () => userEvent.keyboard('{Enter}'))).toEqual([
      'polite: The address search isn’t working right now. Try again in a moment.',
    ])
  })

  test('offline says to connect and search again', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<Harness geocoder={geocoder} />)
    await typeInto('Storgatan')
    expect(await readSpoken(container, () => userEvent.keyboard('{Enter}'))).toEqual([
      'polite: You’re offline. Connect to the internet, then search again.',
    ])
  })

  test('a pick says which address was chosen', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<Harness geocoder={geocoder} />)
    await typeInto('Storgatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(optionCount).toBe(2)
    await wait(900)
    expect(
      await readSpoken(container, () => userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')),
    ).toEqual([`polite: Chosen: ${goteborg.label}.`])
  })

  test('a pick that describePick rejects says the rejected text instead of choosing', async () => {
    const { geocoder } = createFakeGeocoder()
    const onResult = vi.fn<(result: AddressResult | null) => void>()
    const { container } = await render(
      <Harness
        geocoder={geocoder}
        onResult={onResult}
        describePick={() => ({ rejected: 'Choose a street address.' })}
      />,
    )
    await typeInto('Storgatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(optionCount).toBe(2)
    await wait(900)
    expect(await readSpoken(container, () => userEvent.keyboard('{ArrowDown}{Enter}'))).toEqual([
      'polite: Choose a street address.',
    ])
    await expect.element(statusLine('Choose a street address.')).toBeVisible()
    expect(onResult).not.toHaveBeenCalled()
  })

  test('a pick with describePick says its announcement in place of chosen', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(
      <Harness
        geocoder={geocoder}
        describePick={(result) => ({ announcement: `Using ${result.label}.` })}
      />,
    )
    await typeInto('Storgatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(optionCount).toBe(2)
    await wait(900)
    expect(
      await readSpoken(container, () => userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')),
    ).toEqual([`polite: Using ${goteborg.label}.`])
  })
})
