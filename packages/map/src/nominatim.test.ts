import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { nominatim } from './nominatim.ts'

// Contract: the provider contract in address-search.md and plan 0149. `fetch` is stubbed:
// nothing leaves the process.

const place = {
  place_id: 1,
  display_name: 'Storgatan 1, Stockholm, Sweden',
  lat: '59.33',
  lon: '18.06',
  addresstype: 'building',
  address: {
    road: 'Storgatan',
    house_number: '1',
    postcode: '111 22',
    city: 'Stockholm',
    country_code: 'se',
  },
}

function stubFetch(body: unknown = [place]) {
  const fetchMock = vi.fn<() => Promise<Response>>(async () => new Response(JSON.stringify(body)))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const create = () => nominatim({ url: 'https://nominatim.example.test' })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('nominatim', () => {
  test('maps position, label, address and an upper-case country', async () => {
    stubFetch()
    const [result] = await create().search('stor', {})
    expect(result).toMatchObject({
      id: '1',
      label: 'Storgatan 1, 111 22 Stockholm',
      position: { longitude: 18.06, latitude: 59.33 },
      address: { line1: 'Storgatan 1', postalCode: '111 22', city: 'Stockholm', country: 'SE' },
    })
  })

  test('precision is address for a house number, street for a road and place for other types', async () => {
    stubFetch([
      place,
      {
        ...place,
        place_id: 2,
        addresstype: 'road',
        address: { road: 'Storgatan', city: 'Stockholm' },
      },
      { ...place, place_id: 3, addresstype: 'city', address: { city: 'Stockholm' } },
    ])
    const results = await create().search('stor', {})
    expect(results.map((result) => result.precision)).toEqual(['address', 'street', 'place'])
  })

  test('precision is left out when the server sends no addresstype and no house number', async () => {
    const { addresstype: _addresstype, ...untyped } = place
    stubFetch([{ ...untyped, address: { road: 'Storgatan', city: 'Stockholm' } }])
    const [result] = await create().search('stor', {})
    expect(result).not.toHaveProperty('precision')
  })

  test('the country option ranks that country first and keeps the others in order', async () => {
    const other = (id: number, country_code: string) => ({
      ...place,
      place_id: id,
      address: { ...place.address, country_code },
    })
    stubFetch([other(1, 'no'), other(2, 'se'), other(3, 'fi'), other(4, 'se')])
    const results = await create().search('stor', { country: 'SE' })
    expect(results.map((result) => result.id)).toEqual(['2', '4', '1', '3'])
  })
})
