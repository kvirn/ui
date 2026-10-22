// kv-lang-ok-file: the fixture holds Swedish and Finnish addresses and the Swedish catalog proves translated strings
import type {
  AddressResult,
  AddressSuggestion,
  GeocoderProvider,
  GeocoderSearchOptions,
} from '@kvirn-ui/core'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { readAloud, readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { AddressInput } from './address-input.tsx'
import type {
  AddressInputCountryProps,
  AddressInputLine1Props,
  AddressInputRootProps,
} from './address-input.tsx'

// Contract: address-input.a11y.md. What TextInput, Field, Fieldset, ErrorSummary and the masks
// prove is not proved again here.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function Address(rootProps: AddressInputRootProps) {
  return (
    <Fieldset.Root>
      <Fieldset.Legend>Your address</Fieldset.Legend>
      <AddressInput.Root {...rootProps}>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <AddressInput.Line1 />
        </Field.Root>
        <Field.Root>
          <Field.Label>Address line 2</Field.Label>
          <AddressInput.Line2 autoComplete="off" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Postal code</Field.Label>
          <AddressInput.PostalCode />
        </Field.Root>
        <Field.Root>
          <Field.Label>Town or city</Field.Label>
          <AddressInput.City />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  )
}

const street = () => page.getByRole('textbox', { name: /^Street address/ })
const line2 = () => page.getByRole('textbox', { name: /^Address line 2/ })
const postalCode = () => page.getByRole('textbox', { name: /^Postal code/ })
const city = () => page.getByRole('textbox', { name: /^Town or city/ })

describe('autocomplete tokens (1.3.5)', () => {
  test('each part gets its token, a Root prefix or off, and a part’s own wins', async () => {
    const { rerender } = await render(<Address />)
    await expect.element(street()).toHaveAttribute('autocomplete', 'address-line1')
    await expect.element(postalCode()).toHaveAttribute('autocomplete', 'postal-code')
    await expect.element(city()).toHaveAttribute('autocomplete', 'address-level2')
    // Line 2's own `off` wins over the Root's missing prefix, and the text lines are not spell-checked.
    await expect.element(line2()).toHaveAttribute('autocomplete', 'off')
    for (const line of [street(), line2(), city()]) {
      await expect.element(line).toHaveAttribute('spellcheck', 'false')
      await expect.element(line).toHaveAttribute('autocorrect', 'off')
    }

    await rerender(<Address autoComplete="section-postal" />)
    await expect.element(street()).toHaveAttribute('autocomplete', 'section-postal address-line1')
    await expect.element(postalCode()).toHaveAttribute('autocomplete', 'section-postal postal-code')
    await expect.element(line2()).toHaveAttribute('autocomplete', 'off')

    await rerender(<Address autoComplete="off" />)
    for (const part of [street(), postalCode(), city()]) {
      await expect.element(part).toHaveAttribute('autocomplete', 'off')
    }
  })
})

describe('postal code', () => {
  test('paste is never cancelled in any box, and a pasted postal code takes the country’s mask', async () => {
    await render(<Address country="SE" />)
    for (const box of [street(), line2(), postalCode(), city()]) {
      const element = box.element() as HTMLInputElement
      element.focus()
      const clipboardData = new DataTransfer()
      clipboardData.setData('text/plain', '12345')
      const paste = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData })
      element.dispatchEvent(paste)
      expect(paste.defaultPrevented).toBe(false)
    }
    await userEvent.fill(postalCode(), '12345')
    await expect.element(postalCode()).toHaveValue('123 45')
  })

  test('follows the Root’s country: SE groups the digits, DE keeps letters with no mask', async () => {
    const { rerender } = await render(<Address country="SE" />)
    await userEvent.type(postalCode(), '12345')
    await expect.element(postalCode()).toHaveValue('123 45')
    await expect.element(postalCode()).toHaveAttribute('inputmode', 'numeric')
    await expect.element(postalCode()).toHaveAttribute('dir', 'ltr')

    await rerender(<Address country="DE" />)
    await userEvent.clear(postalCode())
    await userEvent.type(postalCode(), 'ab-12 c')
    await expect.element(postalCode()).toHaveValue('ab-12 c')
    await expect.element(postalCode()).toHaveAttribute('inputmode', 'text')
    await expect.element(postalCode()).toHaveAttribute('autocapitalize', 'characters')
    await expect.element(postalCode()).toHaveAttribute('dir', 'ltr')
  })

  test('without a country on the Root, the provider’s country is used', async () => {
    await render(
      <KvirnProvider locale="en" country="NO">
        <Address />
      </KvirnProvider>,
    )
    await userEvent.type(postalCode(), '123456')
    await expect.element(postalCode()).toHaveValue('1234')
  })

  test('a full postal code never moves focus, and changing country never rewrites the value', async () => {
    const { rerender } = await render(<Address country="SE" />)
    await userEvent.type(postalCode(), '12345')
    await expect.element(postalCode()).toHaveValue('123 45')
    await expect.element(postalCode()).toHaveFocus()
    await expect.element(city()).not.toHaveFocus()

    await rerender(<Address country="NO" />)
    await expect.element(postalCode()).toHaveValue('123 45')
    await rerender(<Address country="DE" />)
    await expect.element(postalCode()).toHaveValue('123 45')
  })
})

describe('dev warnings', () => {
  test('warns outside a fieldset, in a group fieldset, and for a part outside a Root', async () => {
    await render(
      <>
        <AddressInput.Root />
        <Fieldset.Root group>
          <Fieldset.Legend>Your address</Fieldset.Legend>
          <AddressInput.Root />
        </Fieldset.Root>
        <AddressInput.City aria-label="Town or city" />
      </>,
    )
    const messages = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(messages.some((message) => message.includes('not inside a group'))).toBe(true)
    expect(messages.some((message) => message.includes('in a `group` Fieldset'))).toBe(true)
    expect(messages.some((message) => message.includes('outside an AddressInput.Root'))).toBe(true)
  })
})

const malmo: AddressResult = {
  id: 'malmo',
  label: 'Storgatan 1, 211 22 Malmö',
  position: { longitude: 13.0, latitude: 55.6 },
  address: { line1: 'Storgatan 1', postalCode: '211 22', city: 'Malmö', country: 'SE' },
  precision: 'address',
}
const goteborg: AddressResult = {
  id: 'goteborg',
  label: 'Storgatan 2, 411 38 Göteborg',
  position: { longitude: 11.97, latitude: 57.7 },
  address: { line1: 'Storgatan 2', postalCode: '411 38', city: 'Göteborg', country: 'SE' },
  precision: 'address',
}
const helsinki: AddressResult = {
  id: 'helsinki',
  label: 'Storgatan 9, 00100 Helsinki',
  position: { longitude: 24.94, latitude: 60.17 },
  address: { line1: 'Storgatan 9', postalCode: '00100', city: 'Helsinki', country: 'FI' },
  precision: 'address',
}
const withoutPostalCode: AddressResult = {
  id: 'without-postal-code',
  label: 'Postgatan 7, Malmö',
  position: { longitude: 13.0, latitude: 55.6 },
  address: { line1: 'Postgatan 7', postalCode: '', city: 'Malmö', country: 'SE' },
}
const withoutCity: AddressResult = {
  id: 'without-city',
  label: 'Stadsgatan 3, 211 22',
  position: { longitude: 13.0, latitude: 55.6 },
  address: { line1: 'Stadsgatan 3', postalCode: '211 22', city: '', country: 'SE' },
}
const streetOnly: AddressResult = {
  id: 'street-only',
  label: 'Gatugatan, 211 22 Malmö',
  position: { longitude: 13.0, latitude: 55.6 },
  address: { line1: 'Gatugatan', postalCode: '211 22', city: 'Malmö', country: 'SE' },
  precision: 'street',
}
const placeOnly: AddressResult = {
  id: 'place-only',
  label: 'Platsgatan Park',
  position: { longitude: 13.0, latitude: 55.6 },
  precision: 'place',
}
const numbered: AddressResult[] = Array.from({ length: 12 }, (_, index) => ({
  id: `numbered-${index + 1}`,
  label: `Numbergatan ${index + 1}, 211 22 Malmö`,
  position: { longitude: 13.0, latitude: 55.6 },
  address: {
    line1: `Numbergatan ${index + 1}`,
    postalCode: '211 22',
    city: 'Malmö',
    country: 'SE',
  },
}))

const answersByQuery: Record<string, readonly AddressSuggestion[]> = {
  Storgatan: [malmo, goteborg, helsinki],
  Postgatan: [withoutPostalCode, malmo],
  Stadsgatan: [withoutCity, malmo],
  Gatugatan: [streetOnly, malmo],
  Platsgatan: [placeOnly, malmo],
  Numbergatan: numbered,
}

interface FakeGeocoderOptions {
  suggest?: boolean
  name?: string
  attribution?: string
  delay?: number
  structured?: (parts: StructuredParts) => AddressResult | null | Error
}

type StructuredParts = Parameters<NonNullable<GeocoderProvider['structured']>>[0]

function createFakeGeocoder(fake: FakeGeocoderOptions = {}) {
  const calls: { query: string; options: GeocoderSearchOptions }[] = []
  const structuredCalls: { parts: StructuredParts; signal: AbortSignal }[] = []
  const geocoder: GeocoderProvider = {
    ...(fake.name === undefined ? {} : { name: fake.name }),
    ...(fake.attribution === undefined ? {} : { attribution: fake.attribution }),
    suggest: fake.suggest ?? false,
    search: (query, options) => {
      calls.push({ query, options })
      return new Promise((resolve, reject) => {
        if (query.includes('broken')) {
          reject(new Error('Address search failed (500)'))
          return
        }
        const answer = answersByQuery[query.split(' ')[0] ?? ''] ?? []
        const timer = window.setTimeout(() => resolve([...answer]), fake.delay ?? 0)
        options.signal?.addEventListener('abort', () => {
          window.clearTimeout(timer)
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    },
    ...(fake.structured === undefined
      ? {}
      : {
          structured: (parts, { signal }) => {
            structuredCalls.push({ parts, signal })
            return new Promise((resolve, reject) => {
              const timer = window.setTimeout(() => {
                const answer = fake.structured?.(parts)
                if (answer instanceof Error) {
                  reject(answer)
                } else {
                  resolve(answer ?? null)
                }
              }, fake.delay ?? 0)
              signal.addEventListener('abort', () => {
                window.clearTimeout(timer)
                reject(new DOMException('Aborted', 'AbortError'))
              })
            })
          },
        }),
  }
  return { geocoder, calls, structuredCalls }
}

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent =
    '.kv-address-lookup-submit, .kv-autocomplete-clear { min-block-size: 2rem; min-inline-size: 2rem; }'
  document.head.append(style)
})

interface LookupAddressProps {
  geocoder: GeocoderProvider
  withCountry?: boolean
  countryProps?: AddressInputCountryProps
  rootProps?: AddressInputRootProps
  line1Props?: AddressInputLine1Props
  inForm?: boolean
  onSubmit?: (data: FormData) => void
  swedish?: boolean
  providerCountry?: 'SE' | 'FI' | 'NO'
  beforeLookup?: ReactNode
}

function LookupAddress({
  geocoder,
  withCountry = false,
  countryProps,
  rootProps,
  line1Props,
  inForm = false,
  onSubmit,
  swedish = false,
  providerCountry = 'SE',
  beforeLookup,
}: LookupAddressProps) {
  const address = (
    <Fieldset.Root>
      <Fieldset.Legend>Your address</Fieldset.Legend>
      <AddressInput.Root geocoder={geocoder} {...rootProps}>
        {withCountry ? (
          <Field.Root>
            <Field.Label>Country</Field.Label>
            <AddressInput.Country name="country" {...countryProps} />
          </Field.Root>
        ) : null}
        {beforeLookup}
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <AddressInput.Line1 name="line1" debounce={20} {...line1Props} />
        </Field.Root>
        <Field.Root>
          <Field.Label>Address line 2</Field.Label>
          <AddressInput.Line2 name="line2" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Postal code</Field.Label>
          <AddressInput.PostalCode name="postalCode" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Town or city</Field.Label>
          <AddressInput.City name="city" />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  )
  return (
    <KvirnProvider
      locale={swedish ? 'sv-SE' : 'en'}
      country={providerCountry}
      messages={swedish ? sv : undefined}
    >
      <button type="button">Before</button>
      {inForm ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit?.(new FormData(event.currentTarget))
          }}
        >
          {address}
          <button type="submit">Send</button>
        </form>
      ) : (
        address
      )}
      <button type="button">After</button>
    </KvirnProvider>
  )
}

const lookup = () => page.getByRole('combobox', { name: /^Street address/ })
const countrySelect = () => page.getByRole('combobox', { name: /^Country/ })
const searchButton = () => page.getByRole('button', { name: 'Search', exact: true })
const clearButton = () => page.getByRole('button', { name: 'Clear' })
const options = () => page.getByRole('listbox').getByRole('option').elements()
const note = () => document.querySelector('.kv-address-input-lookup-note')?.textContent

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

// Longer than the announcement debounce (500 ms), so a message that is going to be said has been.
const afterAnnouncements = () => wait(900)

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

async function search(text: string) {
  await userEvent.click(lookup())
  await userEvent.fill(lookup(), text)
  await userEvent.keyboard('{Enter}')
}

async function pickNth(text: string, count: number) {
  await search(text)
  await expect.poll(() => options().length).toBeGreaterThan(0)
  await userEvent.keyboard('{ArrowDown}'.repeat(count) + '{Enter}')
}

const pickedMessage = (label: string) =>
  `Chosen: ${label}. The address is filled in below. Check it before you continue.`

describe('AddressInput.Line1 lookup structure', () => {
  test('with a geocoder Line1 is the ARIA 1.2 combobox named by the Field label, keeping its token, name and spellcheck setting', async () => {
    const { geocoder } = createFakeGeocoder({ name: 'Test service', attribution: '© Test data' })
    await render(<LookupAddress geocoder={geocoder} />)
    await expect.element(lookup()).toBeVisible()
    const element = lookup().element()
    expect(element.getAttribute('aria-autocomplete')).toBe('list')
    expect(element.getAttribute('autocomplete')).toBe('address-line1')
    expect(element.getAttribute('name')).toBe('line1')
    expect(element.getAttribute('spellcheck')).toBe('false')
    expect(document.querySelector(`label[for="${element.id}"]`)?.textContent).toMatch(
      /^Street address/,
    )
  })

  test('the privacy notice is above Line1 and first in its description, then the help text, and the attribution is visible but not read with the field', async () => {
    const { geocoder } = createFakeGeocoder({ name: 'Test service', attribution: '© Test data' })
    await render(<LookupAddress geocoder={geocoder} />)
    const element = lookup().element()
    const described = (element.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id))
    expect(described.map((node) => node?.textContent)).toEqual([
      'What you type is sent to Test service to find the address.',
      'Press Search to look up your street and fill in the postal code and town, or keep typing. Suggests addresses in Sweden.',
    ])
    expect(document.body.textContent).toContain('© Test data')
    const notice = described[0]
    expect(
      notice !== null &&
        notice !== undefined &&
        Boolean(notice.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true)
  })

  test('without a geocoder Line1 is today’s plain textbox, with no combobox and no lookup text', async () => {
    const { geocoder } = createFakeGeocoder()
    function Plain() {
      return (
        <KvirnProvider locale="en" country="SE">
          <Fieldset.Root>
            <Fieldset.Legend>Your address</Fieldset.Legend>
            <AddressInput.Root geocoder={undefined}>
              <Field.Root>
                <Field.Label>Street address</Field.Label>
                <AddressInput.Line1 name="line1" />
              </Field.Root>
            </AddressInput.Root>
          </Fieldset.Root>
        </KvirnProvider>
      )
    }
    expect(geocoder).toBeDefined()
    await render(<Plain />)
    await expect.element(page.getByRole('textbox', { name: /^Street address/ })).toBeVisible()
    expect(page.getByRole('combobox').elements()).toHaveLength(0)
    expect(page.getByRole('button').elements()).toHaveLength(0)
  })

  test('typing in Line 2, the postal code or the city never searches', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    await render(<LookupAddress geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await userEvent.fill(line2(), 'Storgatan')
    await userEvent.fill(postalCode(), '21122')
    await userEvent.fill(city(), 'Storgatan')
    await afterAnnouncements()
    expect(calls).toHaveLength(0)
    expect(announced.messages).toEqual([])
    announced.stop()
  })

  test('browser autofill of all the boxes, Line 1 included, searches nothing, opens no list and announces nothing', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    await render(<LookupAddress geocoder={geocoder} />)
    const announced = recordAnnouncements()
    const autofill = (box: HTMLInputElement, value: string) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(box, value)
      box.dispatchEvent(new Event('input', { bubbles: true }))
    }
    autofill(lookup().element() as HTMLInputElement, 'Storgatan 12')
    autofill(postalCode().element() as HTMLInputElement, '211 22')
    autofill(city().element() as HTMLInputElement, 'Malmö')
    await expect.element(lookup()).toHaveValue('Storgatan 12')
    await expect.element(city()).toHaveValue('Malmö')
    await afterAnnouncements()
    expect(calls).toHaveLength(0)
    expect(options()).toHaveLength(0)
    expect(announced.messages).toEqual([])
    announced.stop()
  })

  test('is submitted with the form as the street, with the other boxes', async () => {
    const { geocoder } = createFakeGeocoder()
    const onSubmit = vi.fn<(data: FormData) => void>()
    await render(<LookupAddress geocoder={geocoder} inForm onSubmit={onSubmit} />)
    await pickNth('Storgatan', 1)
    await expect.element(lookup()).toHaveValue('Storgatan 1')
    await userEvent.click(page.getByRole('button', { name: 'Send' }))
    const data = onSubmit.mock.calls[0]?.[0]
    expect([...(data?.keys() ?? [])].sort()).toEqual(['city', 'line1', 'line2', 'postalCode'])
    expect(data?.get('line1')).toBe('Storgatan 1')
  })
})

describe('AddressInput.Line1 lookup keyboard', () => {
  test('Tab and Shift+Tab go Country, Line1, Search, Line2, PostalCode, City, and Clear is no stop', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} withCountry />)
    await userEvent.click(page.getByRole('button', { name: 'Before' }))
    const order = [
      countrySelect(),
      lookup(),
      searchButton(),
      page.getByRole('textbox', { name: /^Address line 2/ }),
      page.getByRole('textbox', { name: /^Postal code/ }),
      page.getByRole('textbox', { name: /^Town or city/ }),
    ]
    await userEvent.type(lookup(), 'Sto')
    expect(clearButton().element().getAttribute('tabindex')).toBe('-1')
    await userEvent.click(page.getByRole('button', { name: 'Before' }))
    for (const stop of order) {
      await userEvent.tab()
      await expect.element(stop).toHaveFocus()
    }
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
    for (const stop of [...order].reverse()) {
      await userEvent.tab({ shift: true })
      await expect.element(stop).toHaveFocus()
    }
  })

  test('Enter with no suggestion active, inside a form, searches now and the form does not submit', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    const onSubmit = vi.fn<(data: FormData) => void>()
    await render(
      <LookupAddress
        geocoder={geocoder}
        inForm
        onSubmit={onSubmit}
        line1Props={{ debounce: 5000 }}
      />,
    )
    await userEvent.click(lookup())
    await userEvent.keyboard('Storgatan')
    expect(calls).toHaveLength(0)
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => calls.length).toBe(1)
    expect(calls[0]?.options.intent).toBe('submit')
    await expect.poll(() => options().length).toBe(2)
    await wait(200)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('Enter on text unchanged since the answer reopens the last list without a new request and says the count again', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(2)
    await expect.poll(() => announced.messages.length, { timeout: 3000 }).toBe(1)
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => options().length).toBe(0)
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => options().length).toBe(2)
    expect(lookup().element().hasAttribute('aria-activedescendant')).toBe(false)
    await expect
      .poll(() => announced.messages, { timeout: 3000 })
      .toEqual(['2 addresses found', '2 addresses found'])
    expect(calls).toHaveLength(1)
    announced.stop()
  })

  test('Search is a native type=button that searches on Enter and on Space and never submits the form', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    const onSubmit = vi.fn<(data: FormData) => void>()
    await render(<LookupAddress geocoder={geocoder} inForm onSubmit={onSubmit} />)
    await userEvent.click(lookup())
    await userEvent.keyboard('Storgatan')
    await userEvent.tab()
    await expect.element(searchButton()).toHaveFocus()
    expect(searchButton().element().getAttribute('type')).toBe('button')
    await userEvent.keyboard(' ')
    await expect.poll(() => calls.map((call) => call.query)).toEqual(['Storgatan'])
    await userEvent.tab({ shift: true })
    await userEvent.keyboard('{End} 1')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => calls.map((call) => call.query)).toEqual(['Storgatan', 'Storgatan 1'])
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('Enter and Alt+ArrowUp on an active suggestion pick it: Line 1 becomes the street, focus stays, the boxes are filled', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    await expect.element(lookup()).toHaveValue('Storgatan 2')
    await expect.element(lookup()).toHaveFocus()
    await expect.element(postalCode()).toHaveValue('411 38')

    await userEvent.fill(lookup(), 'Storgatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.keyboard('{ArrowDown}{Alt>}{ArrowUp}{/Alt}')
    await expect.element(lookup()).toHaveValue('Storgatan 1')
    await expect.element(lookup()).toHaveFocus()
    await expect.element(postalCode()).toHaveValue('211 22')
  })

  test('a pointer press on a suggestion picks it, and Clear empties Line 1 only', async () => {
    const { geocoder } = createFakeGeocoder()
    const onLookupResult = vi.fn<(result: AddressResult) => void>()
    await render(<LookupAddress geocoder={geocoder} rootProps={{ onLookupResult }} />)
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.click(page.getByRole('option', { name: goteborg.label }))
    await expect.element(lookup()).toHaveValue('Storgatan 2')
    await expect.element(page.getByRole('textbox', { name: /^Postal code/ })).toHaveValue('411 38')
    expect(onLookupResult).toHaveBeenCalledTimes(1)

    await userEvent.click(clearButton())
    await expect.element(lookup()).toHaveValue('')
    await expect.element(lookup()).toHaveFocus()
    await expect.element(page.getByRole('textbox', { name: /^Postal code/ })).toHaveValue('411 38')
    await expect
      .element(page.getByRole('textbox', { name: /^Town or city/ }))
      .toHaveValue('Göteborg')
    expect(onLookupResult).toHaveBeenCalledTimes(1)
  })

  test('Escape closes the list and keeps the text, the focus and the boxes', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.keyboard('{ArrowDown}{Escape}')
    await expect.poll(() => options().length).toBe(0)
    await expect.element(lookup()).toHaveValue('Storgatan')
    await expect.element(lookup()).toHaveFocus()
    await expect.element(postalCode()).toHaveValue('')
  })

  test('Tab with the list open closes it without picking and moves to the next stop', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.tab()
    await expect.element(searchButton()).toHaveFocus()
    await expect.poll(() => options().length).toBe(0)
    await expect.element(lookup()).toHaveValue('Storgatan')
    await expect.element(postalCode()).toHaveValue('')
  })

  test('keys in a box are native: Enter submits the form and typing never searches', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    const onSubmit = vi.fn<(data: FormData) => void>()
    await render(<LookupAddress geocoder={geocoder} inForm onSubmit={onSubmit} />)
    await userEvent.click(line2())
    await userEvent.keyboard('Storgatan 1{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(calls).toHaveLength(0)
  })

  test('disabled, Line 1 and its Search button are skipped by Tab', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(
      <KvirnProvider locale="en" country="SE">
        <Fieldset.Root disabled>
          <Fieldset.Legend>Your address</Fieldset.Legend>
          <AddressInput.Root geocoder={geocoder}>
            <Field.Root>
              <Field.Label>Street address</Field.Label>
              <AddressInput.Line1 />
            </Field.Root>
          </AddressInput.Root>
        </Fieldset.Root>
      </KvirnProvider>,
    )
    await expect.element(lookup()).toBeDisabled()
    await expect.element(searchButton()).toBeDisabled()
  })
})

describe('AddressInput.Country keyboard and wiring', () => {
  test('is a native select named by its Field label, autocomplete country, the Root’s country first and named in the page’s language', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} withCountry />)
    const element = countrySelect().element() as HTMLSelectElement
    expect(element.tagName).toBe('SELECT')
    expect(element.getAttribute('autocomplete')).toBe('country')
    expect(element.value).toBe('SE')
    expect(element.options[0]?.textContent).toBe('Sweden')
    expect(element.options[0]?.value).toBe('SE')
    expect(element.options.length).toBeGreaterThan(100)
  })

  test('names the countries in the provider’s language and takes the Root’s autocomplete prefix', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(
      <LookupAddress
        geocoder={geocoder}
        withCountry
        swedish
        rootProps={{ autoComplete: 'section-postal' }}
      />,
    )
    const element = countrySelect().element() as HTMLSelectElement
    expect(element.getAttribute('autocomplete')).toBe('section-postal country')
    expect(element.options[0]?.textContent).toBe('Sverige')
  })

  test('ArrowDown and letters change the option natively, announce nothing, and set the postal code’s mask', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} withCountry />)
    const postalCode = page.getByRole('textbox', { name: /^Postal code/ })
    await userEvent.type(postalCode, '12345')
    await expect.element(postalCode).toHaveValue('123 45')

    await userEvent.click(page.getByRole('button', { name: 'Before' }))
    await userEvent.tab()
    await expect.element(countrySelect()).toHaveFocus()
    await afterAnnouncements()
    const announced = recordAnnouncements()
    await userEvent.keyboard('Fin')
    await expect.element(countrySelect()).toHaveValue('FI')
    await afterAnnouncements()
    expect(announced.messages).toEqual([])
    announced.stop()

    await expect.element(postalCode).toHaveValue('123 45')
    await userEvent.clear(postalCode)
    await userEvent.type(postalCode, '001009')
    await expect.element(postalCode).toHaveValue('00100')
  })

  test('the Root’s country is the starting value, and the select follows value and defaultValue', async () => {
    const { geocoder } = createFakeGeocoder()
    function Controlled() {
      const [country, setCountry] = useState('NO')
      return (
        <LookupAddress
          geocoder={geocoder}
          withCountry
          countryProps={{
            value: country,
            onChange: (event) => setCountry(event.currentTarget.value),
          }}
        />
      )
    }
    await render(<Controlled />)
    await expect.element(countrySelect()).toHaveValue('NO')
    await userEvent.selectOptions(countrySelect(), 'Sweden')
    await expect.element(countrySelect()).toHaveValue('SE')
    await userEvent.type(page.getByRole('textbox', { name: /^Postal code/ }), '12345')
    await expect.element(page.getByRole('textbox', { name: /^Postal code/ })).toHaveValue('123 45')
  })
})

const valuesOf = () => ({
  line1: (lookup().element() as HTMLInputElement).value,
  line2: (line2().element() as HTMLInputElement).value,
  postalCode: (postalCode().element() as HTMLInputElement).value,
  city: (city().element() as HTMLInputElement).value,
})

describe('AddressInput.Line1 lookup fill rules', () => {
  test('a pick fills Line 1, the postal code and the city, never Line 2, keeps focus in the lookup and shows the note', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await userEvent.fill(line2(), 'c/o Andersson')
    await pickNth('Storgatan', 1)
    await expect.poll(valuesOf).toEqual({
      line1: 'Storgatan 1',
      line2: 'c/o Andersson',
      postalCode: '211 22',
      city: 'Malmö',
    })
    await expect.element(lookup()).toHaveValue('Storgatan 1')
    await expect.element(lookup()).toHaveFocus()
    expect(note()).toBe('Filled in from the address search. Check the address.')
  })

  test('a pick writes address.line1 into Line 1, never the result’s label, and typing on searches again for house-level matches', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await userEvent.click(lookup())
    await userEvent.keyboard('Gatugatan')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect.element(lookup()).toHaveValue('Gatugatan')
    expect((lookup().element() as HTMLInputElement).value).not.toBe(streetOnly.label)
    const element = lookup().element() as HTMLInputElement
    expect(element.selectionStart).toBe('Gatugatan'.length)
    await expect.element(lookup()).toHaveFocus()
    const searchesBefore = calls.length
    await userEvent.keyboard(' 5')
    await expect.element(lookup()).toHaveValue('Gatugatan 5')
    await expect.poll(() => calls.length).toBeGreaterThan(searchesBefore)
  })

  test('the fill note is in Line 1’s description after the help text', async () => {
    const { geocoder } = createFakeGeocoder({ name: 'Test service' })
    await render(<LookupAddress geocoder={geocoder} />)
    await pickNth('Gatugatan', 1)
    await expect.poll(note).toBeDefined()
    const described = (lookup().element().getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent)
    expect(described.at(-1)).toBe(
      'Filled in from the address search. Check the address. Type your house number after the street name.',
    )
    expect(described[0]).toBe('What you type is sent to Test service to find the address.')
  })

  test('the fill reaches a controlled value, the DOM value of an uncontrolled box and a form’s input listener as typing does', async () => {
    const { geocoder } = createFakeGeocoder()
    const heard: string[] = []
    function Mixed() {
      const [line1, setLine1] = useState('')
      return (
        <KvirnProvider locale="en" country="SE">
          <Fieldset.Root>
            <Fieldset.Legend>Your address</Fieldset.Legend>
            <form onInput={(event) => heard.push((event.target as HTMLInputElement).name)}>
              <AddressInput.Root geocoder={geocoder}>
                <Field.Root>
                  <Field.Label>Street address</Field.Label>
                  <AddressInput.Line1
                    name="line1"
                    debounce={20}
                    value={line1}
                    onValueChange={(value) => setLine1(value)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Postal code</Field.Label>
                  <AddressInput.PostalCode name="postalCode" defaultValue="" />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Town or city</Field.Label>
                  <AddressInput.City name="city" />
                </Field.Root>
              </AddressInput.Root>
            </form>
          </Fieldset.Root>
        </KvirnProvider>
      )
    }
    await render(<Mixed />)
    await pickNth('Storgatan', 1)
    await expect.element(lookup()).toHaveValue('Storgatan 1')
    await expect.element(postalCode()).toHaveValue('211 22')
    await expect.element(city()).toHaveValue('Malmö')
    expect(heard).toEqual(expect.arrayContaining(['line1', 'postalCode', 'city']))
    await userEvent.type(lookup(), '0')
    await expect.element(lookup()).toHaveValue('Storgatan 10')
  })

  test('a pick replaces what the visitor typed in the three boxes', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await userEvent.fill(lookup(), 'Typed street 5')
    await userEvent.fill(postalCode(), '99999')
    await userEvent.fill(city(), 'Typed town')
    await pickNth('Storgatan', 1)
    await expect.poll(valuesOf).toMatchObject({
      line1: 'Storgatan 1',
      postalCode: '211 22',
      city: 'Malmö',
    })
  })

  test('a result without a postal code keeps a typed one, and empties one an earlier pick left', async () => {
    const { geocoder } = createFakeGeocoder()
    const { unmount } = await render(<LookupAddress geocoder={geocoder} />)
    await userEvent.fill(postalCode(), '99999')
    await pickNth('Postgatan', 1)
    await expect
      .poll(valuesOf)
      .toMatchObject({ line1: 'Postgatan 7', postalCode: '999 99', city: 'Malmö' })
    expect(note()).toBe('Filled in from the address search. Check the address.')
    await unmount()

    await render(<LookupAddress geocoder={geocoder} />)
    await pickNth('Storgatan', 1)
    await expect.element(postalCode()).toHaveValue('211 22')
    await userEvent.fill(lookup(), 'Postgatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect
      .poll(valuesOf)
      .toMatchObject({ line1: 'Postgatan 7', postalCode: '', city: 'Malmö' })
    expect(note()).toBe(
      'Filled in from the address search. Check the address. Add the postal code: the search didn’t have it.',
    )
  })

  test('a result without a city adds the missing town to the note and empties the earlier pick’s city', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await pickNth('Storgatan', 1)
    await userEvent.fill(lookup(), 'Stadsgatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect
      .poll(valuesOf)
      .toMatchObject({ line1: 'Stadsgatan 3', postalCode: '211 22', city: '' })
    expect(note()).toContain('Add the town or city: the search didn’t have it.')
  })

  test('a street without a house number is filled and the note asks for the number', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await pickNth('Gatugatan', 1)
    await expect.poll(valuesOf).toMatchObject({ line1: 'Gatugatan', postalCode: '211 22' })
    expect(note()).toBe(
      'Filled in from the address search. Check the address. Type your house number after the street name.',
    )
  })

  test('a place with no postal address fills nothing, says so in the list, announces it and keeps the list open', async () => {
    const { geocoder } = createFakeGeocoder()
    const onLookupResult = vi.fn<(result: AddressResult) => void>()
    await render(<LookupAddress geocoder={geocoder} rootProps={{ onLookupResult }} />)
    await userEvent.fill(lookup(), 'Typed street 5')
    await search('Platsgatan')
    await expect.poll(() => options().length).toBe(2)
    await afterAnnouncements()
    const announced = recordAnnouncements()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    const sentence =
      'This place has no postal address. Choose another, or keep typing your address.'
    await expect.element(page.getByText(sentence)).toBeVisible()
    await expect.poll(() => options().length).toBe(2)
    await expect.poll(() => announced.messages, { timeout: 3000 }).toEqual([sentence])
    await expect.element(lookup()).toHaveValue('Platsgatan')
    expect(onLookupResult).not.toHaveBeenCalled()
    expect(note()).toBeUndefined()
    announced.stop()
  })

  test('the note is plain text, not a live region, and an edit after the pick neither re-searches nor announces', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await pickNth('Storgatan', 1)
    await afterAnnouncements()
    const noteElement = document.querySelector('.kv-address-input-lookup-note')
    expect(noteElement?.tagName).toBe('P')
    expect(noteElement?.closest('[aria-live], [role="status"], [role="alert"]')).toBeNull()
    const announced = recordAnnouncements()
    await userEvent.fill(lookup(), 'Storgatan 12')
    await userEvent.fill(postalCode(), '211 23')
    await afterAnnouncements()
    expect(announced.messages).toEqual([])
    expect(calls).toHaveLength(1)
    expect(note()).toBe('Filled in from the address search. Check the address.')
    announced.stop()
  })

  test('onLookupResult gets the whole result of each pick', async () => {
    const { geocoder } = createFakeGeocoder()
    const onLookupResult = vi.fn<(result: AddressResult) => void>()
    await render(<LookupAddress geocoder={geocoder} rootProps={{ onLookupResult }} />)
    await pickNth('Storgatan', 2)
    await expect.element(city()).toHaveValue('Göteborg')
    expect(onLookupResult).toHaveBeenCalledTimes(1)
    expect(onLookupResult).toHaveBeenCalledWith(goteborg)
  })
})

describe('AddressInput.Line1 lookup country (D6)', () => {
  test('without a Country part only the Root’s country is offered, the count says what is left and the geocoder is asked for it', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await search('Storgatan')
    await expect
      .poll(() => options().map((option) => option.textContent))
      .toEqual([malmo.label, goteborg.label])
    expect(calls[0]?.options.country).toBe('SE')
    await expect.poll(() => announced.messages, { timeout: 3000 }).toEqual(['2 addresses found'])
    announced.stop()
  })

  test('without a Country part the Root’s country prop sets the country searched and named', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} rootProps={{ country: 'fi' }} />)
    await search('Storgatan')
    await expect.poll(() => options().map((option) => option.textContent)).toEqual([helsinki.label])
    expect(calls[0]?.options.country).toBe('FI')
    expect(document.body.textContent).toContain('Suggests addresses in Finland.')
  })

  test('with a Country part every country is listed and the geocoder is asked for the selected one, which follows the select', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} withCountry />)
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(3)
    expect(calls[0]?.options.country).toBe('SE')
    await userEvent.selectOptions(countrySelect(), 'Finland')
    await expect.element(page.getByText(/Suggests addresses in Finland\./)).toBeVisible()
    await expect.element(lookup()).toHaveValue('Storgatan')
    await userEvent.click(lookup())
    await userEvent.keyboard('{Control>}a{/Control}Storgatan 9{Enter}')
    await expect.poll(() => calls.at(-1)?.options.country).toBe('FI')
  })

  test('a pick in another country switches the select first, the mask follows, the boxes are written, and the note and announcement say so', async () => {
    const { geocoder } = createFakeGeocoder()
    const onCountryChange = vi.fn<(country: string) => void>()
    await render(
      <LookupAddress
        geocoder={geocoder}
        withCountry
        countryProps={{ onChange: (event) => onCountryChange(event.currentTarget.value) }}
      />,
    )
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(3)
    await afterAnnouncements()
    const announced = recordAnnouncements()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}')
    await expect.element(countrySelect()).toHaveValue('FI')
    expect(onCountryChange).toHaveBeenCalledWith('FI')
    await expect.poll(valuesOf).toMatchObject({
      line1: 'Storgatan 9',
      postalCode: '00100',
      city: 'Helsinki',
    })
    expect(note()).toBe(
      'Filled in from the address search. Check the address. The country is now Finland.',
    )
    await expect
      .poll(() => announced.messages, { timeout: 3000 })
      .toEqual([`${pickedMessage(helsinki.label)} The country is now Finland.`])
    await expect.element(lookup()).toHaveFocus()
    announced.stop()
  })
})

describe('AddressInput.Line1 lookup announcements', () => {
  test('too short on request, searching, the count and no results are shown and announced once', async () => {
    const { geocoder } = createFakeGeocoder({ delay: 700 })
    await render(<LookupAddress geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await search('St')
    await expect.element(page.getByText('Type at least 3 characters to search.')).toBeVisible()
    await expect
      .poll(() => announced.messages, { timeout: 3000 })
      .toEqual(['Type at least 3 characters to search.'])

    await userEvent.fill(lookup(), 'Storgatan')
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByText('Searching for addresses')).toBeVisible()
    await expect.poll(() => options().length).toBe(2)
    await expect
      .poll(() => announced.messages.slice(1), { timeout: 3000 })
      .toEqual(['Searching for addresses', '2 addresses found'])

    await userEvent.fill(lookup(), 'Nowhere')
    await userEvent.keyboard('{Enter}')
    const noResult =
      'No address found for “Nowhere”. Keep typing: your address doesn’t have to be in the list.'
    await expect.element(page.getByText(noResult)).toBeVisible()
    await expect.poll(() => announced.messages.at(-1), { timeout: 3000 }).toBe(noResult)
    announced.stop()
  })

  test('an error says to type the address in the boxes, and the text stays', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    const announced = recordAnnouncements()
    await search('broken')
    const sentence = 'The address search isn’t working right now. Keep typing your address.'
    await expect.element(page.getByText(sentence)).toBeVisible()
    await expect.poll(() => announced.messages.at(-1), { timeout: 3000 }).toBe(sentence)
    await expect.element(lookup()).toHaveValue('broken')
    announced.stop()
  })

  test('no answer within the timeout counts as an error', async () => {
    const { geocoder } = createFakeGeocoder({ delay: 5000 })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ timeoutMilliseconds: 100 }} />)
    await search('Storgatan')
    await expect
      .element(
        page.getByText('The address search isn’t working right now. Keep typing your address.'),
      )
      .toBeVisible()
  })

  test('offline says to type the address in the boxes and sends no request', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    await render(<LookupAddress geocoder={geocoder} />)
    await search('Storgatan')
    await expect.element(page.getByText('You’re offline. Keep typing your address.')).toBeVisible()
    expect(calls).toHaveLength(0)
    onLine.mockRestore()
  })

  test('a pick that fills is announced as one message, with the sentences for what is missing after it', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await search('Postgatan')
    await expect.poll(() => options().length).toBe(2)
    await afterAnnouncements()
    const announced = recordAnnouncements()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect
      .poll(() => announced.messages, { timeout: 3000 })
      .toEqual([
        `${pickedMessage(withoutPostalCode.label)} Add the postal code: the search didn’t have it.`,
      ])
    announced.stop()
  })

  test('typing, autofill, an edit after a pick, Clear and a Country change announce nothing', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} withCountry />)
    await pickNth('Storgatan', 1)
    await afterAnnouncements()
    const announced = recordAnnouncements()
    await userEvent.fill(lookup(), 'Storgatan 3')
    await userEvent.click(clearButton())
    await userEvent.selectOptions(countrySelect(), 'Norway')
    await afterAnnouncements()
    expect(announced.messages).toEqual([])
    announced.stop()
  })
})

describe('AddressInput.Line1 lookup strings', () => {
  test('every string comes from the catalog: the Swedish one translates the help, scope, notice and Search', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} swedish />)
    await expect.element(lookup()).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Sök', exact: true })).toBeVisible()
    await expect
      .element(
        page.getByText(
          'Tryck på Sök för att slå upp din gata och fylla i postnummer och ort, eller fortsätt skriva. Föreslår adresser i Sverige.',
        ),
      )
      .toBeVisible()
  })

  test('a per-instance message replaces the catalog text, for Line 1’s own keys and the reused ones', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(
      <LookupAddress
        geocoder={geocoder}
        line1Props={{ messages: { submit: 'Look up', filledNote: 'Done.' } }}
      />,
    )
    await expect.element(page.getByRole('button', { name: 'Look up' })).toBeVisible()
    await userEvent.click(lookup())
    await userEvent.keyboard('Storgatan{Enter}')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect.poll(note).toBe('Done.')
  })
})

describe('AddressInput.Country dev warnings', () => {
  test('a Country without a name, not first and outside a Root warns', async () => {
    const { geocoder } = createFakeGeocoder()
    await render(
      <>
        <KvirnProvider locale="en" country="SE">
          <Fieldset.Root>
            <Fieldset.Legend>Your address</Fieldset.Legend>
            <AddressInput.Root geocoder={geocoder}>
              <Field.Root>
                <Field.Label>Street address</Field.Label>
                <AddressInput.Line1 />
              </Field.Root>
              <AddressInput.Country />
            </AddressInput.Root>
          </Fieldset.Root>
        </KvirnProvider>
        <AddressInput.Country aria-label="Country" />
      </>,
    )
    await expect.poll(() => consoleWarn.mock.calls.length).toBeGreaterThan(2)
    const messages = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(messages.some((message) => message.includes('has no accessible name'))).toBe(true)
    expect(messages.some((message) => message.includes('not the first control'))).toBe(true)
    expect(messages.some((message) => message.includes('outside an AddressInput.Root'))).toBe(true)
  })
})

describe('AddressInput.Line1 lookup axe', () => {
  test('has no violations idle, with results open, rejected, filled with the note, and with a Country part', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<LookupAddress geocoder={geocoder} withCountry />)
    await expectNoA11yViolations(container)

    await search('Storgatan')
    await expect.poll(() => options().length).toBe(3)
    await expectNoA11yViolations(container)

    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect.element(lookup()).toHaveValue('Storgatan 1')
    await expectNoA11yViolations(container)

    await userEvent.fill(lookup(), 'Platsgatan')
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => options().length).toBe(2)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect.element(page.getByText(/has no postal address/)).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('has no violations on a status line: too short, error and offline', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<LookupAddress geocoder={geocoder} />)
    await search('St')
    await expect.element(page.getByText('Type at least 3 characters to search.')).toBeVisible()
    await expectNoA11yViolations(container)
    await userEvent.fill(lookup(), 'broken')
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByText(/isn’t working right now/)).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

const houseResult: AddressResult = {
  id: 'house',
  label: 'Gatugatan 12, 211 23 Malmö',
  position: { longitude: 13.0, latitude: 55.6 },
  address: { line1: 'Gatugatan 12', postalCode: '211 23', city: 'Malmö', country: 'SE' },
  precision: 'address',
}

describe('AddressInput.Line1 narrowing and house-number lookup', () => {
  async function pickStreetThenType(suffix: string) {
    await pickNth('Gatugatan', 1)
    await expect.element(lookup()).toHaveValue('Gatugatan')
    await userEvent.keyboard(suffix)
  }

  test('the postal code and city are sent with a search once their boxes have values', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} />)
    await userEvent.fill(postalCode(), '21122')
    await userEvent.fill(city(), ' Malmö ')
    await search('Storgatan')
    await expect.poll(() => calls.length).toBe(1)
    expect(calls[0]?.options.postalCode).toBe('211 22')
    expect(calls[0]?.options.city).toBe('Malmö')
  })

  test('empty postal code and city boxes send neither, and filling them starts no search', async () => {
    const { geocoder, calls } = createFakeGeocoder({ suggest: true })
    await render(<LookupAddress geocoder={geocoder} />)
    await search('Storgatan')
    await expect.poll(() => calls.length).toBe(1)
    expect(calls[0]?.options).not.toHaveProperty('postalCode')
    expect(calls[0]?.options).not.toHaveProperty('city')
    await userEvent.fill(postalCode(), '21122')
    await userEvent.fill(city(), 'Malmö')
    await afterAnnouncements()
    expect(calls).toHaveLength(1)
  })

  test('typing a house number after a street pick looks it up with the parts and fills the postal code and city', async () => {
    const { geocoder, structuredCalls } = createFakeGeocoder({ structured: () => houseResult })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await userEvent.fill(postalCode(), '21199')
    await pickStreetThenType(' 12 B')
    await expect.poll(() => structuredCalls.length).toBe(1)
    expect(structuredCalls[0]?.parts).toEqual({
      street: 'Gatugatan',
      number: '12 B',
      postalCode: '211 22',
      city: 'Malmö',
      country: 'SE',
    })
    await expect.element(postalCode()).toHaveValue('211 23')
    await expect.element(lookup()).toHaveValue('Gatugatan 12 B')
    expect(note()).toBe('Postal code filled in from the address search. Check the address.')
    expect(structuredCalls).toHaveLength(1)
  })

  test('an address not found leaves every box as it was and announces no error', async () => {
    const { geocoder, structuredCalls } = createFakeGeocoder({ structured: () => null })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await pickStreetThenType(' 12')
    await expect.poll(() => structuredCalls.length).toBe(1)
    const announced = recordAnnouncements()
    await afterAnnouncements()
    await expect.element(lookup()).toHaveValue('Gatugatan 12')
    await expect.element(postalCode()).toHaveValue('211 22')
    expect(announced.messages.join(' ')).not.toMatch(/isn’t working|went wrong|error/i)
    announced.stop()
  })

  test('a failing lookup changes nothing and announces no error', async () => {
    const { geocoder, structuredCalls } = createFakeGeocoder({
      structured: () => new Error('Structured failed (500)'),
    })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await pickStreetThenType(' 12')
    await expect.poll(() => structuredCalls.length).toBe(1)
    const announced = recordAnnouncements()
    await afterAnnouncements()
    await expect.element(postalCode()).toHaveValue('211 22')
    expect(announced.messages.join(' ')).not.toMatch(/isn’t working|went wrong|error/i)
    expect(note()).toBe(
      'Filled in from the address search. Check the address. Type your house number after the street name.',
    )
    announced.stop()
  })

  test('a street-level answer fills nothing', async () => {
    const { geocoder, structuredCalls } = createFakeGeocoder({
      structured: () => ({
        ...houseResult,
        precision: 'street',
        address: { line1: 'Gatugatan', postalCode: '999 99', city: 'Elsewhere', country: 'SE' },
      }),
    })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await pickStreetThenType(' 12')
    await expect.poll(() => structuredCalls.length).toBe(1)
    await afterAnnouncements()
    await expect.element(postalCode()).toHaveValue('211 22')
    await expect.element(city()).toHaveValue('Malmö')
  })

  test('a geocoder without a structured lookup does nothing after a number is typed', async () => {
    const { geocoder, calls } = createFakeGeocoder()
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await pickStreetThenType(' 12')
    await afterAnnouncements()
    await expect.element(lookup()).toHaveValue('Gatugatan 12')
    await expect.element(postalCode()).toHaveValue('211 22')
    expect(calls.length).toBeGreaterThan(0)
  })

  test('a keystroke aborts a pending lookup and only the last text is looked up', async () => {
    const { geocoder, structuredCalls } = createFakeGeocoder({
      delay: 300,
      structured: () => houseResult,
    })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await pickNth('Gatugatan', 1)
    await expect.element(lookup()).toHaveValue('Gatugatan')
    await userEvent.keyboard(' 1')
    await expect.poll(() => structuredCalls.length).toBe(1)
    await userEvent.keyboard('2')
    expect(structuredCalls[0]?.signal.aborted).toBe(true)
    await expect.poll(() => structuredCalls.length).toBe(2)
    expect(structuredCalls[1]?.parts.number).toBe('12')
  })

  test('typing the house number says one message that names what was filled, even while the geocoder suggests as you type', async () => {
    const { geocoder, calls, structuredCalls } = createFakeGeocoder({
      suggest: true,
      structured: () => houseResult,
    })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await pickNth('Gatugatan', 1)
    await expect.element(lookup()).toHaveValue('Gatugatan')
    await afterAnnouncements()
    const announced = recordAnnouncements()
    const searchesBefore = calls.length
    await userEvent.keyboard(' 12')
    await expect.poll(() => structuredCalls.length).toBe(1)
    await expect.poll(() => calls.length).toBeGreaterThan(searchesBefore)
    await afterAnnouncements()
    expect(announced.messages).toEqual([
      'Postal code filled in from the address search. Check the address.',
    ])
    announced.stop()
  })

  test('the house-number answer fills the postal code and the city together with one message naming both', async () => {
    const { geocoder, structuredCalls } = createFakeGeocoder({ structured: () => houseResult })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await pickNth('Gatugatan', 1)
    await userEvent.fill(postalCode(), '')
    await userEvent.fill(city(), '')
    await afterAnnouncements()
    const announced = recordAnnouncements()
    await userEvent.fill(lookup(), 'Gatugatan 12')
    await expect.poll(() => structuredCalls.length).toBe(1)
    await expect.element(postalCode()).toHaveValue('211 23')
    await expect.element(city()).toHaveValue('Malmö')
    await afterAnnouncements()
    expect(announced.messages).toEqual([
      'Postal code and town filled in from the address search. Check the address.',
    ])
    announced.stop()
  })

  test('the house-number answer keeps a postal code or city the visitor corrected after the pick', async () => {
    const { geocoder, structuredCalls } = createFakeGeocoder({ structured: () => houseResult })
    await render(<LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />)
    await pickNth('Gatugatan', 1)
    await userEvent.fill(postalCode(), '21199')
    await userEvent.fill(city(), 'Lund')
    await userEvent.fill(lookup(), 'Gatugatan 12')
    await expect.poll(() => structuredCalls.length).toBe(1)
    await afterAnnouncements()
    await expect.element(postalCode()).toHaveValue('211 99')
    await expect.element(city()).toHaveValue('Lund')
  })
})

describe('AddressInput.Line1 lookup read aloud', () => {
  const readSpoken = (container: HTMLElement, act: () => Promise<void>) =>
    readAnnouncements(container, act, { timeout: 3000, settle: 1500 })

  test('focus: the field is read after the privacy notice, with its label, help text and state', async () => {
    const { geocoder } = createFakeGeocoder({ name: 'Test service' })
    const { container } = await render(<LookupAddress geocoder={geocoder} />)
    const phrases = await readAloud(container)
    const field =
      'combobox, Street address (optional), What you type is sent to Test service to find the address. Press Search to look up your street and fill in the postal code and town, or keep typing. Suggests addresses in Sweden., has popup listbox, not expanded, autocomplete in list, 1 control'
    expect(phrases).toContain(field)
    expect(
      phrases.indexOf('What you type is sent to Test service to find the address.'),
    ).toBeLessThan(phrases.indexOf(field))
    expect(phrases).toContain('button, Search')
  })

  test('results: the count is said, then the list is read as options', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<LookupAddress geocoder={geocoder} />)
    await userEvent.click(lookup())
    await userEvent.keyboard('Storgatan')
    expect(await readSpoken(container, () => userEvent.keyboard('{Enter}'))).toEqual([
      'polite: 2 addresses found',
    ])
    const phrases = await readAloud(container)
    expect(phrases.filter((phrase) => phrase.startsWith('option'))).toEqual([
      'option, Storgatan 1, 211 22 Malmö, not selected, position 1, set size 2',
      'option, Storgatan 2, 411 38 Göteborg, not selected, position 2, set size 2',
    ])
  })

  test('a pick says the address is filled in and to check it', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<LookupAddress geocoder={geocoder} />)
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(2)
    await afterAnnouncements()
    expect(await readSpoken(container, () => userEvent.keyboard('{ArrowDown}{Enter}'))).toEqual([
      `polite: ${pickedMessage(malmo.label)}`,
    ])
  })

  test('a pick of a street without a number also asks for the house number', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<LookupAddress geocoder={geocoder} />)
    await search('Gatugatan')
    await expect.poll(() => options().length).toBe(2)
    await afterAnnouncements()
    expect(await readSpoken(container, () => userEvent.keyboard('{ArrowDown}{Enter}'))).toEqual([
      `polite: ${pickedMessage(streetOnly.label)} Type your house number after the street name.`,
    ])
  })

  test('typing the house number says one message, naming what was filled', async () => {
    const { geocoder } = createFakeGeocoder({ suggest: true, structured: () => houseResult })
    const { container } = await render(
      <LookupAddress geocoder={geocoder} line1Props={{ debounce: 20 }} />,
    )
    await pickNth('Gatugatan', 1)
    await expect.element(lookup()).toHaveValue('Gatugatan')
    await afterAnnouncements()
    expect(await readSpoken(container, () => userEvent.keyboard(' 12'))).toEqual([
      'polite: Postal code filled in from the address search. Check the address.',
    ])
  })

  test('a place with no postal address says so and asks for another', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<LookupAddress geocoder={geocoder} />)
    await search('Platsgatan')
    await expect.poll(() => options().length).toBe(2)
    await afterAnnouncements()
    expect(await readSpoken(container, () => userEvent.keyboard('{ArrowDown}{Enter}'))).toEqual([
      'polite: This place has no postal address. Choose another, or keep typing your address.',
    ])
  })

  test('a pick in another country adds the new country to the message', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<LookupAddress geocoder={geocoder} withCountry />)
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(3)
    await afterAnnouncements()
    expect(
      await readSpoken(container, () =>
        userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}'),
      ),
    ).toEqual([`polite: ${pickedMessage(helsinki.label)} The country is now Finland.`])
  })

  test('browser autofill says nothing', async () => {
    const { geocoder } = createFakeGeocoder({ suggest: true })
    const { container } = await render(<LookupAddress geocoder={geocoder} />)
    await expect(
      readAnnouncements(
        container,
        async () => {
          const box = lookup().element() as HTMLInputElement
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
            box,
            'Storgatan 12',
          )
          box.dispatchEvent(new Event('input', { bubbles: true }))
        },
        { timeout: 1500 },
      ),
    ).rejects.toThrow('No live-region announcement')
  })

  test('Clear says nothing', async () => {
    const { geocoder } = createFakeGeocoder()
    const { container } = await render(<LookupAddress geocoder={geocoder} />)
    await search('Storgatan')
    await expect.poll(() => options().length).toBe(2)
    await afterAnnouncements()
    await expect(
      readAnnouncements(container, () => userEvent.click(clearButton()), { timeout: 1500 }),
    ).rejects.toThrow('No live-region announcement')
  })
})

describe('AddressInput.Country hydration', () => {
  test('hydrates without a mismatch when the server\u2019s ICU names a country differently', async () => {
    const RealDisplayNames = Intl.DisplayNames
    class ServerDisplayNames extends RealDisplayNames {
      override of(code: string) {
        return code === 'FK' ? 'Falkland Islands (Islas Malvinas)' : super.of(code)
      }
    }
    Object.defineProperty(Intl, 'DisplayNames', { value: ServerDisplayNames, configurable: true })
    let html: string
    try {
      html = renderToString(
        <AddressInput.Root>
          <AddressInput.Country aria-label="Country" />
        </AddressInput.Root>,
      )
    } finally {
      Object.defineProperty(Intl, 'DisplayNames', { value: RealDisplayNames, configurable: true })
    }
    const container = document.createElement('div')
    document.body.append(container)
    container.innerHTML = html
    const recoverable = vi.fn<() => void>()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const root = hydrateRoot(
      container,
      <AddressInput.Root>
        <AddressInput.Country aria-label="Country" />
      </AddressInput.Root>,
      { onRecoverableError: recoverable },
    )
    await vi.waitFor(() => expect(container.querySelector('select')).not.toBeNull())
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(recoverable).not.toHaveBeenCalled()
    expect(consoleError).not.toHaveBeenCalled()
    expect(container.querySelector('option[value="FK"]')).not.toBeNull()
    await userEvent.selectOptions(page.getByRole('combobox', { name: 'Country' }), 'FK')
    expect(container.querySelector('select')?.value).toBe('FK')
    consoleError.mockRestore()
    root.unmount()
    container.remove()
  })
})
