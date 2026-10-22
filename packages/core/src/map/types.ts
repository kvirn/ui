export interface LngLat {
  longitude: number
  latitude: number
}

export interface MapView {
  center: LngLat
  zoom: number
}

/** A box in degrees. `west > east` means it crosses the antimeridian. */
export interface MapBounds {
  west: number
  south: number
  east: number
  north: number
}

export interface MapSize {
  width: number
  height: number
}

export interface MapLayer {
  id: string
  label: string
  description?: string
  /** Group nearby places of this layer into clusters. Default: true. */
  cluster?: boolean
}

/** The page theme a base map can follow: the resolved colour scheme and contrast, forced colours included as `more`. */
export interface MapTheme {
  colorScheme: 'light' | 'dark'
  contrast: 'standard' | 'more'
}

export interface MapBaseMap {
  id: string
  /** Shown in the map type switch. The consumer's text, in the consumer's language. Default: `map.defaultBaseMapLabel`. */
  label?: string
  /** Plain-text licence of this base map, shown by `Map.Attribution` while it is active. */
  attribution?: string
}

export interface MapPlace<Data = unknown> {
  id: string
  position: LngLat
  name: string
  layer?: string
  address?: string
  /** The body of the details popup. */
  description?: string
  /** Shown at the top of the details popup. `alt` is yours and required: `''` marks it decorative. */
  image?: { src: string; alt: string }
  /** Your own object for this place, handed back to every render function. */
  data?: Data
}

export interface MapCluster<Data = unknown> {
  id: string
  layer?: string
  /** The mean position of its places. */
  position: LngLat
  bounds: MapBounds
  /** How many places it holds. Read this, not `places.length`: it costs nothing. */
  count: number
  /**
   * Its places. For a cluster from a `source` this is built on first read and can be large, so a
   * long list uses `Map.ClusterPopupPlaces`, which reads a row at a time.
   */
  places: MapPlace<Data>[]
}

export type MapMarkerItem<Data = unknown> =
  | { type: 'place'; place: MapPlace<Data> }
  | { type: 'cluster'; cluster: MapCluster<Data> }

/** The parts of a postal address, for filling in a form from a pick (WCAG 3.3.7). */
export interface AddressDetails {
  line1: string
  postalCode: string
  city: string
  /** ISO 3166-1 alpha-2, upper case: `SE`. */
  country: string
}

export interface AddressResult {
  id: string
  label: string
  position: LngLat
  bounds?: MapBounds
  address?: AddressDetails
}

/** What a geocoder lists. A service that answers with text only leaves out `position`, and `resolve` adds it on a pick. */
export type AddressSuggestion = Omit<AddressResult, 'position'> & { position?: LngLat }

/** `'suggest'`: a request per pause in typing. `'submit'`: the visitor pressed Enter or Search. */
export type GeocoderIntent = 'suggest' | 'submit'

export interface GeocoderSearchOptions {
  signal?: AbortSignal
  /** The provider's BCP 47 locale. */
  locale?: string
  intent?: GeocoderIntent
}

export interface GeocoderProvider {
  /** Who receives the typed text. Named in the privacy notice. */
  name?: string
  /** The credit text that the service's terms ask for. Shown beside the privacy notice. */
  attribution?: string
  /** `true` only if the service's terms allow a request per pause in typing. Otherwise AddressSearch searches on request. */
  suggest?: boolean
  search: (query: string, options: GeocoderSearchOptions) => Promise<AddressSuggestion[]>
  /** Adds the position to a suggestion that has none. Called once, on a pick. */
  resolve?: (
    result: AddressSuggestion,
    options: { signal?: AbortSignal; locale?: string },
  ) => Promise<AddressResult>
}

export interface MapMountOptions {
  view: MapView
  /** The base map to start with. Default: the provider's `defaultBaseMap`. */
  baseMap?: string
  /** The page theme to start with, for a base map that follows it. Default: light, standard contrast. */
  theme?: MapTheme
  signal?: AbortSignal
}

export type MapProviderEventName = 'move' | 'moveend' | 'error' | 'tilesloaded' | 'gesture'

export interface MapProviderEvents {
  move: MapView
  moveend: MapView
  error: Error
  tilesloaded: undefined
  /** The engine ignored a gesture that would scroll the page: one finger, or the wheel without the modifier key. */
  gesture: 'touch' | 'wheel'
}

/**
 * An engine adapter. KvirnUI owns the keyboard, the camera and the announcements: an adapter
 * must turn the engine's own keyboard, wheel-zoom and one-finger touch pan handlers off, so the
 * viewport drives the camera through `setView` and `fitBounds` only.
 */
export interface MapHandle {
  /** Moves the camera. `animate` eases over `duration` ms; the caller decides, from the motion preferences. */
  setView: (view: MapView, options?: { animate?: boolean; duration?: number }) => void
  getView: () => MapView
  getSize: () => MapSize
  getBounds: () => MapBounds
  fitBounds: (bounds: MapBounds, options?: { padding?: number }) => void
  /** Swaps the tiles and keeps the camera. An unknown id is ignored. */
  setBaseMap: (id: string) => void
  /** Restyles a base map that follows the page theme and keeps the camera. Absent for an engine with no themed styles. */
  setTheme?: (theme: MapTheme) => void
  project: (position: LngLat) => { x: number; y: number }
  unproject: (point: { x: number; y: number }) => LngLat
  on: <Name extends MapProviderEventName>(
    name: Name,
    listener: (payload: MapProviderEvents[Name]) => void,
  ) => () => void
  destroy: () => void
}

export interface MapProvider {
  /** The base maps it was configured with. Fewer than two: no map type switch. */
  baseMaps?: readonly MapBaseMap[]
  defaultBaseMap?: string
  mount: (container: HTMLElement, options: MapMountOptions) => MapHandle
}
