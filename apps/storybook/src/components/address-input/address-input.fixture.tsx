// kv-lang-ok-file: the fake geocoder holds Swedish and Finnish addresses
import type { AddressResult, GeocoderProvider } from '@kvirn-ui/core'
import { en } from '@kvirn-ui/i18n/en'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'
import { AddressInput, Button, Field, Fieldset } from '@kvirn-ui/react'
import { useState } from 'react'
import { InLanguage } from '../../fixture-language.tsx'

// Story fixture for Components/Forms/AddressInput (docs/design/phone-and-address-inputs.md §4,
// §8.1). The component holds no text: the labels, help texts and errors below are the consumer's,
// in English here. The Swedish, Finnish and Norwegian fixtures are literal JSX in the stories.
// Nothing here validates: an invalid part sets `invalid` and writes its message itself.

/**
 * The keys of the contract: a button before the address, the four parts and a submit button in a
 * form. Tab goes part to part, a full postal code keeps focus, and Enter submits.
 */
export function KeyboardAddress() {
  const [submits, setSubmits] = useState(0)
  return (
    <InLanguage locale="en" messages={en}>
      <form
        className="kv-story-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setSubmits((count) => count + 1)
        }}
      >
        <div className="kv-button-group">
          <Button type="button">Back</Button>
        </div>
        <Fieldset.Root>
          <Fieldset.Legend>Your address</Fieldset.Legend>
          <AddressInput.Root country="SE">
            <Field.Root required>
              <Field.Label>Street address</Field.Label>
              <AddressInput.Line1 name="line1" />
            </Field.Root>
            <Field.Root>
              <Field.Label>Address line 2</Field.Label>
              <AddressInput.Line2 name="line2" />
              <Field.HelpText>For example c/o and a name</Field.HelpText>
            </Field.Root>
            <Field.Root required>
              <Field.Label>Postal code</Field.Label>
              <AddressInput.PostalCode name="postalCode" />
              <Field.HelpText>For example 123 45</Field.HelpText>
            </Field.Root>
            <Field.Root required>
              <Field.Label>Town or city</Field.Label>
              <AddressInput.City name="city" />
            </Field.Root>
          </AddressInput.Root>
        </Fieldset.Root>
        <div className="kv-button-group">
          <Button type="submit" className="kv-button--primary">
            Send
          </Button>
        </div>
        <p className="kv-story-form-output" data-testid="submits">
          Sent: {submits}
        </p>
      </form>
    </InLanguage>
  )
}

/**
 * Filled, optional, wrong and group-wrong in one column: a filled street, an empty optional line 2,
 * a wrong postal code with its own message, and the whole address marked under the parts. The RTL
 * and ForcedColors stories render it.
 */
export function AddressStates() {
  return (
    <InLanguage locale="en" messages={en}>
      <div className="kv-story-form">
        <Fieldset.Root invalid>
          <Fieldset.Legend>Your address</Fieldset.Legend>
          <AddressInput.Root country="SE">
            <Field.Root required>
              <Field.Label>Street address</Field.Label>
              <AddressInput.Line1 name="line1" defaultValue="Storgatan 12" />
            </Field.Root>
            <Field.Root>
              <Field.Label>Address line 2</Field.Label>
              <AddressInput.Line2 name="line2" />
              <Field.HelpText>For example c/o and a name</Field.HelpText>
            </Field.Root>
            <Field.Root required invalid>
              <Field.Label>Postal code</Field.Label>
              <AddressInput.PostalCode name="postalCode" defaultValue="123 4" />
              <Field.HelpText>For example 123 45</Field.HelpText>
              <Field.ErrorMessage>
                Enter a postal code with 5 digits, like 123 45
              </Field.ErrorMessage>
            </Field.Root>
            <Field.Root required>
              <Field.Label>Town or city</Field.Label>
              <AddressInput.City name="city" defaultValue="Kvirnby" />
            </Field.Root>
          </AddressInput.Root>
          <Fieldset.ErrorMessage>
            We couldn’t find this address. Check the street address and postal code.
          </Fieldset.ErrorMessage>
        </Fieldset.Root>
      </div>
    </InLanguage>
  )
}

const lookupAddresses: readonly AddressResult[] = [
  {
    id: 'malmo',
    label: 'Storgatan 1, 211 22 Malmö',
    position: { longitude: 13.0038, latitude: 55.605 },
    address: { line1: 'Storgatan 1', postalCode: '211 22', city: 'Malmö', country: 'SE' },
    precision: 'address',
  },
  {
    id: 'goteborg',
    label: 'Storgatan 2, 411 38 Göteborg',
    position: { longitude: 11.9746, latitude: 57.7089 },
    address: { line1: 'Storgatan 2', postalCode: '411 38', city: 'Göteborg', country: 'SE' },
    precision: 'address',
  },
  {
    id: 'helsinki',
    label: 'Storgatan 9, 00100 Helsinki',
    position: { longitude: 24.9384, latitude: 60.1699 },
    address: { line1: 'Storgatan 9', postalCode: '00100', city: 'Helsinki', country: 'FI' },
    precision: 'address',
  },
  {
    id: 'without-postal-code',
    label: 'Postgatan 7, Malmö',
    position: { longitude: 13.0038, latitude: 55.605 },
    address: { line1: 'Postgatan 7', postalCode: '', city: 'Malmö', country: 'SE' },
    precision: 'address',
  },
  {
    id: 'street-only',
    label: 'Gatugatan, 211 22 Malmö',
    position: { longitude: 13.0038, latitude: 55.605 },
    address: { line1: 'Gatugatan', postalCode: '211 22', city: 'Malmö', country: 'SE' },
    precision: 'street',
  },
  {
    id: 'place-only',
    label: 'Platsgatan Park',
    position: { longitude: 13.0038, latitude: 55.605 },
    precision: 'place',
  },
]

const waitFor = (milliseconds: number, signal: AbortSignal | undefined) =>
  new Promise<void>((resolve, reject) => {
    const timer = Number.isFinite(milliseconds)
      ? window.setTimeout(resolve, milliseconds)
      : undefined
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

/**
 * A fake geocoder in memory: no story calls a third party. `Storgatan` finds three addresses (two
 * in Sweden, one in Finland), `Postgatan` one with no postal code, `Gatugatan` a street without a
 * number (a house number typed after it is looked up: `Gatugatan 12` is in 211 24) and `Platsgatan` a place with no postal address. The text `nowhere` finds nothing,
 * `error` fails and `slow` never answers.
 */
export function createAddressGeocoder(suggest = false): GeocoderProvider {
  return {
    name: 'the story’s address list',
    attribution: 'Addresses are made up for this story.',
    suggest,
    search: async (query, { signal }) => {
      const words = query
        .toLowerCase()
        .split(/[\s,]+/)
        .filter(Boolean)
      await waitFor(words.includes('slow') ? Infinity : 300, signal)
      if (words.includes('error')) {
        throw new Error('Address search failed (500)')
      }
      return lookupAddresses.filter(({ label }) =>
        words.every((word) => label.toLowerCase().includes(word)),
      )
    },
    structured: async ({ street, number }, { signal }) => {
      await waitFor(300, signal)
      return street === 'Gatugatan'
        ? {
            id: `gatugatan-${number}`,
            label: `Gatugatan ${number}, 211 24 Malmö`,
            position: { longitude: 13.0038, latitude: 55.605 },
            address: {
              line1: `Gatugatan ${number}`,
              postalCode: '211 24',
              city: 'Malmö',
              country: 'SE',
            },
            precision: 'address',
          }
        : null
    },
  }
}

const liveGeocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  attribution: null,
  countries: ['se', 'no'],
})

export interface AddressLookupProps {
  /** Looks up real addresses at Kvirn's map service (geo.kvirn.com) instead of the fake list. */
  live?: boolean
  /** `AddressInput.Country` first in the Root. */
  withCountry?: boolean
  /** The Root's country. Default `SE`. */
  country?: string
  /** The whole address disabled. */
  disabled?: boolean
  /** Compact density. */
  compact?: boolean
  /** The boxes already hold an address, as autofill leaves them. The lookup is not used. */
  autofilled?: boolean
  /** The geocoder declares `suggest: true`: a search per pause in typing. */
  suggest?: boolean
  /** `false` leaves out Line 1's privacy notice; the street box's help text says where the text goes instead. */
  privacyNotice?: boolean
}

/**
 * An address with a lookup: Country (optional) and the four boxes in a form, Line 1 suggesting
 * addresses. A pick puts the street in Line 1, fills the postal code and the city and keeps focus in Line 1. Try
 * `Storgatan`, `Postgatan`, `Gatugatan`, `Platsgatan`, `nowhere`, `error` and `slow`.
 */
export function AddressLookup({
  withCountry = false,
  country = 'SE',
  disabled = false,
  compact = false,
  autofilled = false,
  suggest = false,
  live = false,
  privacyNotice = true,
}: AddressLookupProps) {
  const [fakeGeocoder] = useState(() => createAddressGeocoder(suggest))
  const geocoder = live ? liveGeocoder : fakeGeocoder
  const [submits, setSubmits] = useState(0)
  return (
    <InLanguage locale="en" messages={en}>
      <form
        className={compact ? 'kv-story-form kv-compact' : 'kv-story-form'}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setSubmits((count) => count + 1)
        }}
      >
        <Fieldset.Root disabled={disabled}>
          <Fieldset.Legend>Your address</Fieldset.Legend>
          <AddressInput.Root country={country} geocoder={geocoder}>
            {withCountry ? (
              <Field.Root>
                <Field.Label>Country</Field.Label>
                <AddressInput.Country name="country" />
              </Field.Root>
            ) : null}
            <Field.Root required>
              <Field.Label>Street address</Field.Label>
              <AddressInput.Line1
                name="line1"
                defaultValue={autofilled ? 'Storgatan 12' : ''}
                privacyNotice={privacyNotice}
              />
              {privacyNotice ? null : (
                <Field.HelpText>
                  What you type is sent to the address service to find it.
                </Field.HelpText>
              )}
            </Field.Root>
            <Field.Root>
              <Field.Label>Address line 2</Field.Label>
              <AddressInput.Line2 name="line2" />
              <Field.HelpText>For example c/o and a name</Field.HelpText>
            </Field.Root>
            <Field.Root required>
              <Field.Label>Postal code</Field.Label>
              <AddressInput.PostalCode
                name="postalCode"
                defaultValue={autofilled ? '123 45' : ''}
              />
              <Field.HelpText>For example 123 45</Field.HelpText>
            </Field.Root>
            <Field.Root required>
              <Field.Label>Town or city</Field.Label>
              <AddressInput.City name="city" defaultValue={autofilled ? 'Kvirnby' : ''} />
            </Field.Root>
          </AddressInput.Root>
        </Fieldset.Root>
        <div className="kv-button-group">
          <Button type="submit" className="kv-button--primary">
            Send
          </Button>
        </div>
        <p className="kv-story-form-output" data-testid="submits">
          Sent: {submits}
        </p>
        {live ? <p>Address data © OpenStreetMap contributors</p> : null}
      </form>
    </InLanguage>
  )
}
