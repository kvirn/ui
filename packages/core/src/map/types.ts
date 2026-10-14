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

export interface MapBaseMap {
  id: string
  /** Shown in the map type switch. The consumer's text, in the consumer's language. */
  label: string
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

export interface AddressResult {
  id: string
  label: string
  position: LngLat
  bounds?: MapBounds
}

export interface GeocoderProvider {
  search: (query: string, options: { signal?: AbortSignal }) => Promise<AddressResult[]>
}

export interface MapMountOptions {
  view: MapView
  /** The base map to start with. Default: the provider's `defaultBaseMap`. */
  baseMap?: string
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
