import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { kvirnBaseMap, kvirnGeocoder, type KvirnGeocoderOptions } from './kvirn.ts'
import type { MapTheme } from '@kvirn-ui/core'

// Contract: the provider contract in address-search.md and plan 0147. `fetch` is stubbed:
// nothing leaves the process.

const place = {
  id: 'a1',
  label: 'Storgatan 1, 111 22 Stockholm',
  position: { lat: 59.33, lon: 18.06 },
  bbox: [18.0, 59.3, 18.1, 59.4],
  address: { line1: 'Storgatan 1', postalCode: '111 22', city: 'Stockholm', country: 'se' },
}

function stubFetch(body: unknown = { results: [place] }, status = 200) {
  const fetchMock = vi.fn<() => Promise<Response>>(
    async () => new Response(JSON.stringify(body), { status }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function lastRequest(fetchMock: ReturnType<typeof stubFetch>) {
  const [input, init] = fetchMock.mock.calls.at(-1) as unknown as [URL, RequestInit]
  return { url: new URL(input), init }
}

function create(options: Partial<KvirnGeocoderOptions> = {}) {
  return kvirnGeocoder({ url: 'https://maps.example.test', ...options })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('kvirnGeocoder', () => {
  test('intent suggest calls the autocomplete endpoint', async () => {
    const fetchMock = stubFetch()
    await create().search('stor', { intent: 'suggest' })
    expect(lastRequest(fetchMock).url.pathname).toBe('/v1/geocode/autocomplete')
  })

  test('intent submit and no intent call the search endpoint', async () => {
    const fetchMock = stubFetch()
    await create().search('stor', { intent: 'submit' })
    expect(lastRequest(fetchMock).url.pathname).toBe('/v1/geocode/search')
    await create().search('stor', {})
    expect(lastRequest(fetchMock).url.pathname).toBe('/v1/geocode/search')
  })

  test('a path on url is kept', async () => {
    const fetchMock = stubFetch()
    await create({ url: 'https://maps.example.test/proxy/' }).search('stor', {})
    expect(lastRequest(fetchMock).url.pathname).toBe('/proxy/v1/geocode/search')
  })

  test('sends q, limit, country, focus, bbox and lang as query parameters', async () => {
    const fetchMock = stubFetch()
    await create({
      limit: 3,
      countries: ['SE', 'No'],
      focus: { longitude: 18.06, latitude: 59.33 },
      bounds: { west: 10, south: 55, east: 25, north: 70 },
    }).search(' stor ', { locale: 'sv-SE' })
    const { searchParams } = lastRequest(fetchMock).url
    expect(Object.fromEntries(searchParams)).toEqual({
      q: 'stor',
      limit: '3',
      country: 'se,no',
      focus: '18.06,59.33',
      bbox: '10,55,25,70',
      lang: 'sv',
    })
  })

  test('limit defaults to 6 and optional parameters are left out', async () => {
    const fetchMock = stubFetch()
    await create().search('stor', {})
    expect(Object.fromEntries(lastRequest(fetchMock).url.searchParams)).toEqual({
      q: 'stor',
      limit: '6',
    })
  })

  test("limit is clamped to the service's 1 to 50", async () => {
    const fetchMock = stubFetch()
    await create({ limit: 500 }).search('stor', {})
    expect(lastRequest(fetchMock).url.searchParams.get('limit')).toBe('50')
    await create({ limit: 0 }).search('stor', {})
    expect(lastRequest(fetchMock).url.searchParams.get('limit')).toBe('1')
  })

  test('sends no credentials, a strict referrer policy and the signal', async () => {
    const fetchMock = stubFetch()
    const { signal } = new AbortController()
    await create().search('stor', { signal })
    const { init } = lastRequest(fetchMock)
    expect(init.credentials).toBe('omit')
    expect(init.referrerPolicy).toBe('strict-origin-when-cross-origin')
    expect(init.signal).toBe(signal)
    expect(init.headers).toBeUndefined()
  })

  test('a trimmed query under 2 characters returns no results and sends no request', async () => {
    const fetchMock = stubFetch()
    await expect(create().search(' s ', {})).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('maps position, bbox order, address and an upper-case country', async () => {
    stubFetch()
    const [result] = await create().search('stor', {})
    expect(result).toEqual({
      id: 'a1',
      label: 'Storgatan 1, 111 22 Stockholm',
      position: { longitude: 18.06, latitude: 59.33 },
      bounds: { west: 18.0, south: 59.3, east: 18.1, north: 59.4 },
      address: { line1: 'Storgatan 1', postalCode: '111 22', city: 'Stockholm', country: 'SE' },
    })
  })

  test('a null postal code becomes an empty string', async () => {
    stubFetch({ results: [{ ...place, address: { ...place.address, postalCode: null } }] })
    const [result] = await create().search('stor', {})
    expect(result?.address?.postalCode).toBe('')
  })

  test('a result without bbox or address has no bounds and no address', async () => {
    stubFetch({ results: [{ id: 'p', label: 'Place', position: { lat: 1, lon: 2 } }] })
    const [result] = await create().search('place', {})
    expect(result).toEqual({ id: 'p', label: 'Place', position: { longitude: 2, latitude: 1 } })
  })

  test('precision address and street are passed through', async () => {
    stubFetch({
      results: [
        { ...place, id: 'h', precision: 'address' },
        { ...place, id: 's', precision: 'street' },
      ],
    })
    const results = await create().search('stor', {})
    expect(results.map((result) => result.precision)).toEqual(['address', 'street'])
  })

  test('country is upper-cased into the address', async () => {
    stubFetch({ results: [{ ...place, address: { ...place.address, country: 'no' } }] })
    const [result] = await create().search('stor', {})
    expect(result?.address?.country).toBe('NO')
  })

  test('the country option ranks that country first and keeps the others in order', async () => {
    const other = (id: string, country: string) => ({
      ...place,
      id,
      address: { ...place.address, country },
    })
    stubFetch({
      results: [other('no1', 'no'), other('se1', 'se'), other('fi1', 'fi'), other('se2', 'se')],
    })
    const results = await create().search('stor', { country: 'SE' })
    expect(results.map((result) => result.id)).toEqual(['se1', 'se2', 'no1', 'fi1'])
  })

  test('a non-ok response throws Address search failed with the status', async () => {
    stubFetch({ title: 'Bad' }, 503)
    await expect(create().search('stor', {})).rejects.toThrow('Address search failed (503)')
  })

  test('the same intent, locale and query is answered from the cache', async () => {
    const fetchMock = stubFetch()
    const geocoder = create()
    await geocoder.search('stor', { locale: 'sv', intent: 'suggest' })
    await geocoder.search('stor', { locale: 'sv', intent: 'suggest' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await geocoder.search('stor', { locale: 'sv', intent: 'submit' })
    await geocoder.search('stor', { locale: 'en', intent: 'suggest' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  test('city and postal code are sent as city and postcode', async () => {
    const fetchMock = stubFetch()
    await create().search('stor', { city: 'Stockholm', postalCode: '111 22' })
    const { searchParams } = lastRequest(fetchMock).url
    expect(searchParams.get('city')).toBe('Stockholm')
    expect(searchParams.get('postcode')).toBe('111 22')
  })

  test('structured sends street, number, postcode, city, country and lang and maps the result', async () => {
    const fetchMock = stubFetch({ results: [{ ...place, precision: 'address' }] })
    const { signal } = new AbortController()
    const result = await create().structured?.(
      {
        street: 'Storgatan',
        number: '1 B',
        postalCode: '111 22',
        city: 'Stockholm',
        country: 'SE',
      },
      { signal, locale: 'sv-SE' },
    )
    const { url, init } = lastRequest(fetchMock)
    expect(url.pathname).toBe('/v1/geocode/structured')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      street: 'Storgatan',
      number: '1 B',
      postcode: '111 22',
      city: 'Stockholm',
      country: 'se',
      lang: 'sv',
    })
    expect(init.credentials).toBe('omit')
    expect(init.signal).toBe(signal)
    expect(result).toMatchObject({
      id: 'a1',
      precision: 'address',
      position: { longitude: 18.06, latitude: 59.33 },
      address: { line1: 'Storgatan 1', postalCode: '111 22', city: 'Stockholm', country: 'SE' },
    })
  })

  test('structured returns null when the service finds no such address', async () => {
    stubFetch({ results: [] })
    await expect(
      create().structured?.(
        { street: 'Nowhere', number: '9', country: 'SE' },
        { signal: new AbortController().signal },
      ),
    ).resolves.toBeNull()
  })

  test('structured throws Address lookup failed on a server error', async () => {
    stubFetch({ title: 'Bad' }, 503)
    await expect(
      create().structured?.(
        { street: 'Storgatan', number: '1', country: 'SE' },
        { signal: new AbortController().signal },
      ),
    ).rejects.toThrow('Address lookup failed (503)')
  })

  test('declares suggest, names the host and credits OpenStreetMap by default', () => {
    stubFetch()
    const geocoder = create()
    expect(geocoder.suggest).toBe(true)
    expect(geocoder.name).toBe('maps.example.test')
    expect(geocoder.attribution).toBe('© OpenStreetMap contributors')
    expect(create({ name: 'Maps', attribution: 'Credit' })).toMatchObject({
      name: 'Maps',
      attribution: 'Credit',
    })
  })
})

describe('kvirnBaseMap', () => {
  const styleOf = (url: string, theme: MapTheme) => {
    const { style } = kvirnBaseMap({ url })
    if (typeof style !== 'function') throw new Error('style is not a function')
    return style(theme)
  }

  test.each([
    [{ colorScheme: 'light', contrast: 'standard' }, 'light.json'],
    [{ colorScheme: 'dark', contrast: 'standard' }, 'dark.json'],
    [{ colorScheme: 'light', contrast: 'more' }, 'light-contrast.json'],
    [{ colorScheme: 'dark', contrast: 'more' }, 'dark-contrast.json'],
  ] as const)('the style for %j is %s', (theme, file) => {
    expect(styleOf('https://maps.example.test', theme)).toBe(
      `https://maps.example.test/styles/${file}`,
    )
  })

  test('a path on url is kept', () => {
    expect(styleOf('https://example.test/tiles/', { colorScheme: 'dark', contrast: 'more' })).toBe(
      'https://example.test/tiles/styles/dark-contrast.json',
    )
  })

  test('the id, label and credit default', () => {
    const baseMap = kvirnBaseMap({ url: 'https://maps.example.test' })
    expect(baseMap.id).toBe('kvirn')
    expect(baseMap.label).toBeUndefined()
    expect(baseMap.attribution).toBe('© OpenStreetMap contributors')
  })

  test('the id, label and credit can be set', () => {
    const baseMap = kvirnBaseMap({
      url: 'https://maps.example.test',
      id: 'plan',
      label: 'Plan',
      attribution: 'Credit',
    })
    expect([baseMap.id, baseMap.label, baseMap.attribution]).toEqual(['plan', 'Plan', 'Credit'])
  })
})
