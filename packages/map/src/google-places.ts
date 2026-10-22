import type {
  AddressDetails,
  AddressResult,
  AddressSuggestion,
  GeocoderProvider,
  MapBounds,
} from '@kvirn-ui/core'

interface GooglePlacesLatLng {
  lat: () => number
  lng: () => number
}

interface GooglePlacesAddressComponent {
  longText: string | null
  shortText: string | null
  types: string[]
}

interface GooglePlace {
  location?: GooglePlacesLatLng | null
  viewport?: {
    getNorthEast: () => GooglePlacesLatLng
    getSouthWest: () => GooglePlacesLatLng
  } | null
  formattedAddress?: string | null
  addressComponents?: GooglePlacesAddressComponent[] | null
  fetchFields: (request: { fields: string[] }) => Promise<unknown>
}

/** The part of `google.maps` the geocoder uses: what `await google.maps.importLibrary('places')` returns. */
export interface GooglePlacesApi {
  AutocompleteSessionToken: new () => object
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: Record<string, unknown>) => Promise<{
      suggestions: {
        placePrediction?: {
          placeId: string
          text: { text: string }
          types?: string[]
        } | null
      }[]
    }>
  }
  Place: new (options: { id: string; requestedLanguage?: string }) => GooglePlace
}

export interface GooglePlacesOptions {
  /**
   * Resolves the Places library on the first search, never before. Load the SDK yourself (your
   * script tag or `@googlemaps/js-api-loader`) and return `google.maps.importLibrary('places')`.
   * Set this or `apiKey`.
   */
  loader?: () => Promise<GooglePlacesApi>
  /**
   * Your Maps JavaScript API key, restricted to your site's origin. The geocoder then adds Google's
   * script tag on the first search (`https://maps.googleapis.com/maps/api/js`), which sends the
   * visitor's address to Google and may set cookies: your consent and privacy text covers that.
   */
  apiKey?: string
  /** Restricts the search to these countries (ISO 3166-1 alpha-2), for example `['se']`. */
  countries?: readonly string[]
  /** Limits results to this box. */
  bounds?: MapBounds
  /** Who receives the typed text, named in the privacy notice. Default 'Google'. */
  name?: string
  /** Google's credit, which its terms require beside the results. Default 'Powered by Google'. */
  attribution?: string
}

const MIN_QUERY_LENGTH = 2
const RESOLVE_FIELDS = ['location', 'viewport', 'formattedAddress', 'addressComponents']

const loadScript = (apiKey: string): Promise<GooglePlacesApi> =>
  new Promise((resolve, reject) => {
    const callbackName = `__kvirnGooglePlaces${Date.now().toString(36)}`
    const scope = globalThis as unknown as Record<string, unknown>
    scope[callbackName] = () => {
      delete scope[callbackName]
      const maps = (
        scope.google as { maps: { importLibrary: (name: 'places') => Promise<GooglePlacesApi> } }
      ).maps
      maps.importLibrary('places').then(resolve, reject)
    }
    const script = document.createElement('script')
    script.async = true
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({
      key: apiKey,
      loading: 'async',
      callback: callbackName,
    })}`
    script.onerror = () => reject(new Error('The Google Maps script failed to load.'))
    document.head.append(script)
  })

const componentOf = (place: GooglePlace, type: string, field: 'longText' | 'shortText') =>
  place.addressComponents?.find((component) => component.types.includes(type))?.[field] ?? undefined

function addressOf(place: GooglePlace): AddressDetails | undefined {
  const route = componentOf(place, 'route', 'longText')
  const number = componentOf(place, 'street_number', 'longText')
  const city =
    componentOf(place, 'postal_town', 'longText') ?? componentOf(place, 'locality', 'longText')
  const country = componentOf(place, 'country', 'shortText')
  if (route === undefined && city === undefined && country === undefined) {
    return undefined
  }
  return {
    line1: [route, number].filter(Boolean).join(' '),
    postalCode: componentOf(place, 'postal_code', 'longText') ?? '',
    city: city ?? '',
    country: (country ?? '').toUpperCase(),
  }
}

const ADDRESS_TYPES = new Set(['street_address', 'premise', 'subpremise'])

function precisionOf(types: readonly string[] | undefined): AddressResult['precision'] {
  if (types === undefined || types.length === 0) {
    return undefined
  }
  if (types.some((type) => ADDRESS_TYPES.has(type))) {
    return 'address'
  }
  return types.includes('route') ? 'street' : 'place'
}

const abortError = () => new DOMException('Aborted', 'AbortError')

/**
 * A geocoder on Google Places Autocomplete (New), loaded through your own Google loader like the
 * `google()` map adapter. It declares `suggest: true`, so the typed text goes to Google as you
 * type: name it in your privacy notice. A pick calls Place Details once for the position.
 *
 * Google's terms limit what you may keep: only the place id, and a latitude and longitude for at
 * most 30 days. The geocoder therefore caches no answer; do not store the address either. The
 * Notice shows Google's attribution. With a billing address in the EEA the content may not be
 * shown with a map other than latitude, longitude and place id; whether a list next to a map is
 * "visually associated" with it is for your own legal review. Restrict the key to your origin.
 *
 * @example
 * <AddressSearch
 *   geocoder={googlePlaces({ loader: () => google.maps.importLibrary('places'), countries: ['se'] })}
 *   onResult={fill}
 * />
 */
export function googlePlaces({
  loader,
  apiKey,
  countries,
  bounds,
  name = 'Google',
  attribution = 'Powered by Google',
}: GooglePlacesOptions): GeocoderProvider {
  let loading: Promise<GooglePlacesApi> | undefined
  // One token per search session: it bills the keystrokes and the pick as one request.
  let sessionToken: object | undefined

  const load = () => {
    loading ??= loader
      ? loader()
      : apiKey
        ? loadScript(apiKey)
        : Promise.reject(new Error('The googlePlaces() geocoder needs a loader or an apiKey.'))
    return loading
  }

  return {
    name,
    attribution,
    suggest: true,
    async search(query, { signal, locale, country }) {
      const text = query.trim()
      if (text.length < MIN_QUERY_LENGTH) {
        return []
      }
      try {
        const places = await load()
        sessionToken ??= new places.AutocompleteSessionToken()
        const language = locale?.split('-')[0]?.toLowerCase()
        const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: text,
          sessionToken,
          ...(countries !== undefined && countries.length > 0
            ? { includedRegionCodes: countries.map((code) => code.toLowerCase()) }
            : {}),
          ...(country === undefined ? {} : { regionCode: country.toLowerCase() }),
          ...(bounds === undefined ? {} : { locationRestriction: bounds }),
          ...(language ? { language } : {}),
        })
        if (signal?.aborted) {
          throw abortError()
        }
        return suggestions.flatMap(({ placePrediction }): AddressSuggestion[] => {
          if (!placePrediction) {
            return []
          }
          const precision = precisionOf(placePrediction.types)
          return [
            {
              id: placePrediction.placeId,
              label: placePrediction.text.text,
              ...(precision === undefined ? {} : { precision }),
            },
          ]
        })
      } catch (error) {
        if (signal?.aborted) {
          throw abortError()
        }
        throw new Error('Address search failed', { cause: error })
      }
    },
    async resolve(suggestion, { signal, locale }) {
      try {
        const places = await load()
        const language = locale?.split('-')[0]?.toLowerCase()
        const place = new places.Place({
          id: suggestion.id,
          ...(language ? { requestedLanguage: language } : {}),
        })
        await place.fetchFields({ fields: RESOLVE_FIELDS })
        sessionToken = undefined
        if (signal?.aborted) {
          throw abortError()
        }
        if (!place.location) {
          throw new Error('No position')
        }
        const northEast = place.viewport?.getNorthEast()
        const southWest = place.viewport?.getSouthWest()
        const address = addressOf(place)
        return {
          id: suggestion.id,
          label: place.formattedAddress ?? suggestion.label,
          position: { longitude: place.location.lng(), latitude: place.location.lat() },
          ...(northEast && southWest
            ? {
                bounds: {
                  west: southWest.lng(),
                  south: southWest.lat(),
                  east: northEast.lng(),
                  north: northEast.lat(),
                },
              }
            : {}),
          ...(address === undefined ? {} : { address }),
          ...(suggestion.precision === undefined ? {} : { precision: suggestion.precision }),
        } satisfies AddressResult
      } catch (error) {
        if (signal?.aborted) {
          throw abortError()
        }
        throw new Error('Address search failed', { cause: error })
      }
    },
  }
}
