import { describe, expect, test, vi } from 'vite-plus/test'
import { googlePlaces, type GooglePlacesApi } from './google-places.ts'

// Contract: the geocoder contract in address-search.md. `google.maps.places` is a fake at the SDK
// boundary: no script is loaded and nothing leaves the page.

const latLng = (lat: number, lng: number) => ({ lat: () => lat, lng: () => lng })

function createFakePlaces() {
  const requests: Record<string, unknown>[] = []
  const placeRequests: { id: string; requestedLanguage?: string }[] = []
  const fetchedFields: string[][] = []
  const tokens: object[] = []
  const pending = { answer: undefined as undefined | (() => Promise<unknown>) }

  class FakeToken {
    constructor() {
      tokens.push(this)
    }
  }
  class FakePlace {
    location = latLng(59.33, 18.07)
    viewport = {
      getNorthEast: () => latLng(59.34, 18.08),
      getSouthWest: () => latLng(59.32, 18.06),
    }
    formattedAddress = 'Drottninggatan 1, 111 51 Stockholm, Sweden'
    addressComponents = [
      { longText: '1', shortText: '1', types: ['street_number'] },
      { longText: 'Drottninggatan', shortText: 'Drottninggatan', types: ['route'] },
      { longText: '111 51', shortText: '111 51', types: ['postal_code'] },
      { longText: 'Stockholm', shortText: 'Stockholm', types: ['postal_town'] },
      { longText: 'Sweden', shortText: 'SE', types: ['country'] },
    ]
    constructor(options: { id: string; requestedLanguage?: string }) {
      placeRequests.push(options)
    }
    async fetchFields(request: { fields: string[] }) {
      fetchedFields.push(request.fields)
    }
  }
  const api: GooglePlacesApi = {
    AutocompleteSessionToken: FakeToken,
    AutocompleteSuggestion: {
      async fetchAutocompleteSuggestions(request) {
        requests.push(request)
        if (pending.answer) {
          return pending.answer() as never
        }
        return {
          suggestions: [
            { placePrediction: { placeId: 'p1', text: { text: 'Drottninggatan 1, Stockholm' } } },
            { placePrediction: null },
          ],
        }
      },
    },
    Place: FakePlace,
  }
  return { api, requests, placeRequests, fetchedFields, tokens, pending }
}

describe('googlePlaces', () => {
  test('the loader is called on the first search, never at creation', async () => {
    const fake = createFakePlaces()
    const loader = vi.fn<() => Promise<GooglePlacesApi>>(async () => fake.api)
    const geocoder = googlePlaces({ loader })
    expect(loader).not.toHaveBeenCalled()
    await geocoder.search('drott', {})
    await geocoder.search('drottning', {})
    expect(loader).toHaveBeenCalledTimes(1)
  })

  test('a search sends the input, region codes, language and session token', async () => {
    const fake = createFakePlaces()
    const geocoder = googlePlaces({ loader: async () => fake.api, countries: ['SE', 'NO'] })
    await geocoder.search('  drott ', { locale: 'sv-SE' })
    expect(fake.requests[0]).toMatchObject({
      input: 'drott',
      includedRegionCodes: ['se', 'no'],
      language: 'sv',
      sessionToken: fake.tokens[0],
    })
  })

  test('bounds become a location restriction', async () => {
    const fake = createFakePlaces()
    const bounds = { west: 10, south: 55, east: 25, north: 70 }
    await googlePlaces({ loader: async () => fake.api, bounds }).search('drott', {})
    expect(fake.requests[0]?.locationRestriction).toEqual(bounds)
  })

  test('suggestions are mapped with no position', async () => {
    const fake = createFakePlaces()
    const suggestions = await googlePlaces({ loader: async () => fake.api }).search('drott', {})
    expect(suggestions).toEqual([{ id: 'p1', label: 'Drottninggatan 1, Stockholm' }])
  })

  test('a query under two characters sends nothing', async () => {
    const fake = createFakePlaces()
    const loader = vi.fn<() => Promise<GooglePlacesApi>>(async () => fake.api)
    expect(await googlePlaces({ loader }).search('d', {})).toEqual([])
    expect(loader).not.toHaveBeenCalled()
  })

  test('resolve maps position, bounds and address', async () => {
    const fake = createFakePlaces()
    const geocoder = googlePlaces({ loader: async () => fake.api })
    const result = await geocoder.resolve!({ id: 'p1', label: 'x' }, { locale: 'sv' })
    expect(fake.placeRequests[0]).toEqual({ id: 'p1', requestedLanguage: 'sv' })
    expect(fake.fetchedFields[0]).toEqual([
      'location',
      'viewport',
      'formattedAddress',
      'addressComponents',
    ])
    expect(result).toEqual({
      id: 'p1',
      label: 'Drottninggatan 1, 111 51 Stockholm, Sweden',
      position: { longitude: 18.07, latitude: 59.33 },
      bounds: { west: 18.06, south: 59.32, east: 18.08, north: 59.34 },
      address: {
        line1: 'Drottninggatan 1',
        postalCode: '111 51',
        city: 'Stockholm',
        country: 'SE',
      },
    })
  })

  test('the session token is kept across searches and renewed after resolve', async () => {
    const fake = createFakePlaces()
    const geocoder = googlePlaces({ loader: async () => fake.api })
    await geocoder.search('dr', {})
    await geocoder.search('drott', {})
    expect(fake.tokens).toHaveLength(1)
    await geocoder.resolve!({ id: 'p1', label: 'x' }, {})
    await geocoder.search('drott', {})
    expect(fake.tokens).toHaveLength(2)
    expect(fake.requests[2]?.sessionToken).toBe(fake.tokens[1])
  })

  test('a late answer after abort is dropped', async () => {
    const fake = createFakePlaces()
    let release: () => void = () => {}
    fake.pending.answer = () =>
      new Promise((resolve) => {
        release = () =>
          resolve({ suggestions: [{ placePrediction: { placeId: 'p', text: { text: 'late' } } }] })
      })
    const controller = new AbortController()
    const search = googlePlaces({ loader: async () => fake.api }).search('drott', {
      signal: controller.signal,
    })
    const settled = expect(search).rejects.toMatchObject({ name: 'AbortError' })
    await vi.waitFor(() => expect(fake.requests).toHaveLength(1))
    controller.abort()
    release()
    await settled
  })

  test('an SDK rejection rejects with Address search failed', async () => {
    const fake = createFakePlaces()
    fake.pending.answer = () => Promise.reject(new Error('quota'))
    await expect(
      googlePlaces({ loader: async () => fake.api }).search('drott', {}),
    ).rejects.toThrow('Address search failed')
  })

  test('a loader rejection rejects with Address search failed', async () => {
    const geocoder = googlePlaces({ loader: () => Promise.reject(new Error('blocked')) })
    await expect(geocoder.search('drott', {})).rejects.toThrow('Address search failed')
  })

  test('without a loader or an apiKey a search rejects', async () => {
    await expect(googlePlaces({}).search('drott', {})).rejects.toThrow('Address search failed')
  })

  test('suggest, name and attribution default', () => {
    const geocoder = googlePlaces({ loader: async () => createFakePlaces().api })
    expect(geocoder).toMatchObject({
      suggest: true,
      name: 'Google',
      attribution: 'Powered by Google',
    })
  })
})
