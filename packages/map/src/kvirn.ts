import type { AddressResult, GeocoderProvider, LngLat, MapBounds } from '@kvirn-ui/core'
import type { MapLibreBaseMap } from './maplibre.ts'

const DEFAULT_LIMIT = 6
const CACHE_SIZE = 50
const MIN_LIMIT = 1
const MAX_LIMIT = 50
const MIN_QUERY_LENGTH = 2

export interface KvirnGeocoderOptions {
  /** The service's base URL: an origin, or a path on your own proxy. The library names none. */
  url: string | URL
  /** Who receives the typed text, named in the privacy notice. Default: the host name. */
  name?: string | undefined
  /** Credit text. Default '© OpenStreetMap contributors'; `/v1/attribution` gives the exact text per country. */
  attribution?: string | undefined
  /** Most results asked for, 1 to 50 (clamped). Default 6, so all of them show without scrolling. */
  limit?: number | undefined
  /** Restricts the search to these countries (ISO 3166-1 alpha-2), for example `['se']`. */
  countries?: readonly string[] | undefined
  /** Ranks ties nearer this point higher, never filters. */
  focus?: LngLat | undefined
  /** Limits results to this box. */
  bounds?: MapBounds | undefined
}

interface KvirnPlace {
  id: string
  label: string
  position: { lat: number; lon: number }
  bbox?: [number, number, number, number] | null
  address?: {
    line1: string
    postalCode: string | null
    city: string
    country: string
  } | null
}

function toResult(place: KvirnPlace): AddressResult {
  const { address, bbox } = place
  return {
    id: place.id,
    label: place.label,
    position: { longitude: place.position.lon, latitude: place.position.lat },
    ...(bbox === undefined || bbox === null
      ? {}
      : { bounds: { west: bbox[0], south: bbox[1], east: bbox[2], north: bbox[3] } }),
    ...(address === undefined || address === null
      ? {}
      : {
          address: {
            line1: address.line1,
            postalCode: address.postalCode ?? '',
            city: address.city,
            country: address.country.toUpperCase(),
          },
        }),
  }
}

/**
 * A geocoder for the Kvirn map service. The service is built for a request per pause in typing
 * (`suggest: true`), so the text goes to it as you type: name it in your privacy notice. It sends
 * the query, the language, the country filter, the limit and, when you set them, `focus` and
 * `bounds`, with no cookies and no headers of your own, and caches the answers of the session.
 *
 * @example
 * <AddressSearch geocoder={kvirnGeocoder({ url: '/geocode', countries: ['se'] })} onResult={show} />
 */
export function kvirnGeocoder({
  url,
  name,
  attribution = '© OpenStreetMap contributors',
  limit = DEFAULT_LIMIT,
  countries,
  focus,
  bounds,
}: KvirnGeocoderOptions): GeocoderProvider {
  const base = new URL(url, typeof location === 'undefined' ? undefined : location.href)
  const basePath = base.pathname.replace(/\/+$/, '')
  const cache = new Map<string, AddressResult[]>()
  return {
    name: name ?? base.hostname,
    attribution,
    suggest: true,
    async search(query, { signal, locale, intent }) {
      const text = query.trim()
      if (text.length < MIN_QUERY_LENGTH) {
        return []
      }
      const key = `${intent ?? 'submit'}\n${locale ?? ''}\n${text}`
      const cached = cache.get(key)
      if (cached !== undefined) {
        return cached
      }
      const endpoint = new URL(base)
      endpoint.pathname = `${basePath}/v1/geocode/${intent === 'suggest' ? 'autocomplete' : 'search'}`
      endpoint.searchParams.set('q', text)
      endpoint.searchParams.set(
        'limit',
        String(Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.round(limit)))),
      )
      if (countries !== undefined && countries.length > 0) {
        endpoint.searchParams.set('country', countries.map((code) => code.toLowerCase()).join(','))
      }
      if (focus !== undefined) {
        endpoint.searchParams.set('focus', `${focus.longitude},${focus.latitude}`)
      }
      if (bounds !== undefined) {
        endpoint.searchParams.set(
          'bbox',
          `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
        )
      }
      const language = locale?.split('-')[0]?.toLowerCase()
      if (language) {
        endpoint.searchParams.set('lang', language)
      }
      const response = await fetch(endpoint, {
        ...(signal === undefined ? {} : { signal }),
        credentials: 'omit',
        referrerPolicy: 'strict-origin-when-cross-origin',
      })
      if (!response.ok) {
        throw new Error(`Address search failed (${response.status})`)
      }
      const { results } = (await response.json()) as { results: KvirnPlace[] }
      const mapped = results.map(toResult)
      if (cache.size >= CACHE_SIZE) {
        cache.delete(cache.keys().next().value as string)
      }
      cache.set(key, mapped)
      return mapped
    },
  }
}

export interface KvirnBaseMapOptions {
  /** The service's base URL: an origin, or a path on your own proxy. The library names none. */
  url: string | URL
  /** Default 'kvirn'. */
  id?: string | undefined
  /** Shown in the map type switch. Default: the provider's `map.defaultBaseMapLabel`. */
  label?: string | undefined
  /** Credit text. Default '© OpenStreetMap contributors'. */
  attribution?: string | undefined
}

/**
 * The Kvirn map service's style as one base map. Its style follows the page theme: light or
 * dark, and the high-contrast variant when contrast is `more` or colours are forced. The library
 * names no URL: you pass your own service or proxy.
 *
 * @example
 * maplibre({ baseMaps: [kvirnBaseMap({ url: '/tiles' }), satellite] })
 */
export function kvirnBaseMap({
  url,
  id = 'kvirn',
  label,
  attribution = '© OpenStreetMap contributors',
}: KvirnBaseMapOptions): MapLibreBaseMap {
  const base = new URL(url, typeof location === 'undefined' ? undefined : location.href)
  const basePath = base.pathname.replace(/\/+$/, '')
  return {
    id,
    ...(label === undefined ? {} : { label }),
    attribution,
    style: ({ colorScheme, contrast }) => {
      const endpoint = new URL(base)
      endpoint.pathname = `${basePath}/styles/${colorScheme}${contrast === 'more' ? '-contrast' : ''}.json`
      return endpoint.href
    },
  }
}
