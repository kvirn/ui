// kv-lang-ok-file: the fake geocoder holds Swedish, Finnish and Norwegian addresses
import { en } from '@kvirn-ui/i18n/en'
import { AddressSearch, Map, useMapState } from '@kvirn-ui/map'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'
import type {
  AddressResult,
  AddressSearchProps,
  AddressSuggestion,
  GeocoderProvider,
} from '@kvirn-ui/map'
import { AddressInput, Button, Field, Fieldset } from '@kvirn-ui/react'
import { useMemo, useState } from 'react'
import { initialView, places, useProvider } from './map.fixture.tsx'

// A fake geocoder in memory: no story calls a third party. It matches every word of the text
// against the address, answers after a simulated delay, and honours the abort signal like a
// real service does.

export const addresses: readonly AddressResult[] = [
  {
    id: 'stockholm',
    label: 'Storgatan 5, 111 23 Stockholm',
    position: { longitude: 18.0686, latitude: 59.3293 },
    address: { line1: 'Storgatan 5', postalCode: '111 23', city: 'Stockholm', country: 'SE' },
  },
  {
    id: 'goteborg',
    label: 'Storgatan 1, 411 38 Göteborg',
    position: { longitude: 11.9746, latitude: 57.7089 },
    bounds: { west: 11.96, south: 57.7, east: 11.99, north: 57.72 },
    address: { line1: 'Storgatan 1', postalCode: '411 38', city: 'Göteborg', country: 'SE' },
  },
  {
    id: 'malmo',
    label: 'Storgatan 12, 211 22 Malmö',
    position: { longitude: 13.0038, latitude: 55.605 },
    address: { line1: 'Storgatan 12', postalCode: '211 22', city: 'Malmö', country: 'SE' },
  },
  {
    id: 'helsinki',
    label: 'Mannerheimintie 1, 00100 Helsinki',
    position: { longitude: 24.9384, latitude: 60.1699 },
    address: { line1: 'Mannerheimintie 1', postalCode: '00100', city: 'Helsinki', country: 'FI' },
  },
  {
    id: 'tampere',
    label: 'Hämeenkatu 6, 33100 Tampere',
    position: { longitude: 23.761, latitude: 61.4978 },
    address: { line1: 'Hämeenkatu 6', postalCode: '33100', city: 'Tampere', country: 'FI' },
  },
  {
    id: 'oslo',
    label: 'Karl Johans gate 22, 0159 Oslo',
    position: { longitude: 10.7389, latitude: 59.9139 },
    address: { line1: 'Karl Johans gate 22', postalCode: '0159', city: 'Oslo', country: 'NO' },
  },
  {
    id: 'bergen',
    label: 'Torgallmenningen 3, 5014 Bergen',
    position: { longitude: 5.3221, latitude: 60.3913 },
    address: { line1: 'Torgallmenningen 3', postalCode: '5014', city: 'Bergen', country: 'NO' },
  },
]

export interface FakeGeocoderOptions {
  /** Declares `suggest: true`: a search per pause in typing. */
  suggest?: boolean | undefined
  /** Milliseconds before an answer. The text `slow` never gets one until it is aborted. */
  delayMilliseconds?: number | undefined
  /** Suggestions carry the text only, and `resolve` adds the position and the parts on a pick. */
  needsResolve?: boolean | undefined
}

const wait = (milliseconds: number, signal: AbortSignal | undefined) =>
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
 * The text `error` fails, `slow` never answers, and `nowhere` has no address. Anything else is
 * matched word by word against the address list.
 */
export function createFakeGeocoder({
  suggest = false,
  delayMilliseconds = 300,
  needsResolve = false,
}: FakeGeocoderOptions = {}): GeocoderProvider {
  return {
    name: 'the story’s address list',
    attribution: 'Addresses are made up for this story.',
    suggest,
    search: async (query, { signal }) => {
      const words = query
        .toLowerCase()
        .split(/[\s,]+/)
        .filter(Boolean)
      await wait(words.includes('slow') ? Infinity : delayMilliseconds, signal)
      if (words.includes('error')) {
        throw new Error('Address search failed (500)')
      }
      return addresses
        .filter(({ label }) => words.every((word) => label.toLowerCase().includes(word)))
        .slice(0, 6)
        .map((address): AddressSuggestion =>
          needsResolve ? { id: address.id, label: address.label } : address,
        )
    },
    ...(needsResolve
      ? {
          resolve: async (suggestion: AddressSuggestion, { signal }) => {
            await wait(delayMilliseconds, signal)
            const found = addresses.find(({ id }) => id === suggestion.id)
            if (found === undefined) {
              throw new Error('Unknown address')
            }
            return found
          },
        }
      : {}),
  }
}

export type AddressSearchDemoProps = Omit<AddressSearchProps, 'geocoder'> & FakeGeocoderOptions

function describeResult(result: AddressResult | null) {
  return result === null
    ? 'Nothing chosen yet.'
    : `${result.label} (longitude ${result.position.longitude.toFixed(3)}, latitude ${result.position.latitude.toFixed(3)})`
}

/** An address search on its own, wrapped in `<search>`. What the visitor chose is written under it. */
export function AddressSearchDemo({
  suggest,
  delayMilliseconds,
  needsResolve,
  onResult,
  ...searchProps
}: AddressSearchDemoProps) {
  const [chosen, setChosen] = useState<AddressResult | null>(null)
  const geocoder = useMemo(
    () => createFakeGeocoder({ suggest, delayMilliseconds, needsResolve }),
    [suggest, delayMilliseconds, needsResolve],
  )
  return (
    <div className="kv-prose">
      <search>
        <AddressSearch
          {...searchProps}
          geocoder={geocoder}
          onResult={(result) => {
            setChosen(result)
            onResult?.(result)
          }}
        />
      </search>
      <p>Chosen address: {describeResult(chosen)}</p>
    </div>
  )
}

const liveGeocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  countries: ['se', 'fi', 'no'],
})

function MapAddressSearch({ geocoder }: { geocoder: GeocoderProvider }) {
  const map = useMapState()
  return (
    <search>
      <AddressSearch
        geocoder={geocoder}
        label="Find a preschool by its address"
        onResult={(result) => (result ? map.show(result) : map.clearResult())}
      />
    </search>
  )
}

/** The search beside a map: a pick centres the map, or fits its bounds, and draws a result pin. */
export function AddressSearchWithMapDemo({
  suggest,
  delayMilliseconds,
  needsResolve,
  offline = false,
  live = false,
}: FakeGeocoderOptions & { offline?: boolean; live?: boolean }) {
  const provider = useProvider(offline)
  const geocoder = useMemo(
    () => createFakeGeocoder({ suggest, delayMilliseconds, needsResolve }),
    [suggest, delayMilliseconds, needsResolve],
  )
  return (
    <Map.Root
      provider={provider}
      label="Map of preschools"
      initialView={initialView}
      places={places}
    >
      <MapAddressSearch geocoder={live ? liveGeocoder : geocoder} />
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers />
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <Map.List />
      <Map.Details />
    </Map.Root>
  )
}

const emptyAddress = { line1: '', line2: '', postalCode: '', city: '' }

/**
 * A lookup above the address boxes. A pick fills the boxes, which stay editable, and the Search
 * field is not a step the visitor must take. Enter in the search never sends the form.
 */
export function AddressSearchInFormDemo() {
  const [geocoder] = useState(() => createFakeGeocoder())
  const [address, setAddress] = useState(emptyAddress)
  const [country, setCountry] = useState('SE')
  const [sent, setSent] = useState<string | null>(null)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setSent([address.line1, address.line2, address.postalCode, address.city].join(', '))
      }}
    >
      <Fieldset.Root>
        <Fieldset.Legend>Your address</Fieldset.Legend>
        <AddressSearch
          geocoder={geocoder}
          label="Find your address"
          messages={{
            helpRequest:
              'Type a street and number, a postal code or a place. Then press Search, or type it in the boxes below.',
            picked: en.addressSearch.pickedFilled,
          }}
          onResult={(result) => {
            if (result?.address) {
              setCountry(result.address.country)
              setAddress({
                line1: result.address.line1,
                line2: '',
                postalCode: result.address.postalCode,
                city: result.address.city,
              })
            }
          }}
        />
        <AddressInput.Root country={country}>
          <Field.Root controlId="in-form-line1" required>
            <Field.Label>Street address</Field.Label>
            <AddressInput.Line1
              value={address.line1}
              onChange={(event) => setAddress({ ...address, line1: event.target.value })}
            />
          </Field.Root>
          <Field.Root controlId="in-form-line2">
            <Field.Label>Address line 2</Field.Label>
            <AddressInput.Line2
              value={address.line2}
              onChange={(event) => setAddress({ ...address, line2: event.target.value })}
            />
          </Field.Root>
          <Field.Root controlId="in-form-postal-code" required>
            <Field.Label>Postal code</Field.Label>
            <AddressInput.PostalCode
              value={address.postalCode}
              onChange={(event) => setAddress({ ...address, postalCode: event.target.value })}
            />
          </Field.Root>
          <Field.Root controlId="in-form-city" required>
            <Field.Label>City</Field.Label>
            <AddressInput.City
              value={address.city}
              onChange={(event) => setAddress({ ...address, city: event.target.value })}
            />
          </Field.Root>
        </AddressInput.Root>
      </Fieldset.Root>
      <Button type="submit">Send</Button>
      {sent === null ? null : <p>Sent: {sent}</p>}
    </form>
  )
}
