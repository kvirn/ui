import type { AddressResult, GeocoderProvider } from '@kvirn-ui/core'

const DEFAULT_LIMIT = 6
const CACHE_SIZE = 50

export interface NominatimOptions {
  /** The Nominatim server, for example your own. The library names none. Its `/search` endpoint is called. */
  url: string | URL
  /** Who receives the text, named in the privacy notice. Default: the server's host name. */
  name?: string | undefined
  /** Most results asked for. Default 6, so all of them show without scrolling. */
  limit?: number | undefined
  /** Restricts the search to these countries (ISO 3166-1 alpha-2), for example `['se']`. */
  countryCodes?: readonly string[] | undefined
}

interface NominatimPlace {
  place_id: number
  display_name: string
  lat: string
  lon: string
  boundingbox?: [string, string, string, string]
  address?: {
    house_number?: string
    road?: string
    postcode?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    hamlet?: string
    country_code?: string
  }
}

function toResult(place: NominatimPlace): AddressResult {
  const { address } = place
  const city =
    address?.city ?? address?.town ?? address?.village ?? address?.municipality ?? address?.hamlet
  const hasStreet = address?.road !== undefined && city !== undefined
  const line1 = [address?.road, address?.house_number].filter(Boolean).join(' ')
  const label = hasStreet
    ? `${line1}, ${[address.postcode, city].filter(Boolean).join(' ')}`
    : place.display_name
  const [south, north, west, east] = (place.boundingbox ?? []).map(Number)
  return {
    id: String(place.place_id),
    label,
    position: { longitude: Number(place.lon), latitude: Number(place.lat) },
    ...(south === undefined || north === undefined || west === undefined || east === undefined
      ? {}
      : { bounds: { south, north, west, east } }),
    ...(hasStreet
      ? {
          address: {
            line1,
            postalCode: address.postcode ?? '',
            city,
            country: (address.country_code ?? '').toUpperCase(),
          },
        }
      : {}),
  }
}

/**
 * A geocoder for a Nominatim server (OpenStreetMap data). The public server's usage policy
 * forbids autocomplete from the browser and asks for no personal data, so this adapter searches
 * on request only (`suggest: false`), asks for 6 results, caches the answers of the session and
 * sends nothing but the query, the language and the country filter: no cookies, no headers of
 * your own. A self-hosted server or your own proxy is the production path.
 *
 * @example
 * <AddressSearch geocoder={nominatim({ url: '/geocode' })} onResult={show} />
 */
export function nominatim({
  url,
  name,
  limit = DEFAULT_LIMIT,
  countryCodes,
}: NominatimOptions): GeocoderProvider {
  const endpoint = new URL(url, typeof location === 'undefined' ? undefined : location.href)
  endpoint.pathname = `${endpoint.pathname.replace(/\/+$/, '')}/search`
  const cache = new Map<string, AddressResult[]>()
  return {
    name: name ?? endpoint.hostname,
    attribution: '© OpenStreetMap contributors',
    suggest: false,
    async search(query, { signal, locale }) {
      const key = `${locale ?? ''}\n${query}`
      const cached = cache.get(key)
      if (cached !== undefined) {
        return cached
      }
      const search = new URL(endpoint)
      search.searchParams.set('q', query)
      search.searchParams.set('format', 'jsonv2')
      search.searchParams.set('addressdetails', '1')
      search.searchParams.set('limit', String(limit))
      if (countryCodes !== undefined && countryCodes.length > 0) {
        search.searchParams.set('countrycodes', countryCodes.join(','))
      }
      const response = await fetch(search, {
        ...(signal === undefined ? {} : { signal }),
        credentials: 'omit',
        referrerPolicy: 'strict-origin-when-cross-origin',
        ...(locale === undefined ? {} : { headers: { 'Accept-Language': locale } }),
      })
      if (!response.ok) {
        throw new Error(`Address search failed (${response.status})`)
      }
      const results = ((await response.json()) as NominatimPlace[]).map(toResult)
      if (cache.size >= CACHE_SIZE) {
        cache.delete(cache.keys().next().value as string)
      }
      cache.set(key, results)
      return results
    },
  }
}
