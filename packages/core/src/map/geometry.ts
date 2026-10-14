import type { LngLat, MapBounds, MapPlace, MapSize, MapView } from './types.ts'

const EARTH_RADIUS_METRES = 6_371_008.8
export const TILE_SIZE = 512
const MAX_LATITUDE = 85.0511287798
export const MIN_ZOOM = 0
export const MAX_ZOOM = 22

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const toDegrees = (radians: number) => (radians * 180) / Math.PI

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

export function normalizeLongitude(longitude: number): number {
  const wrapped = ((((longitude + 180) % 360) + 360) % 360) - 180
  return wrapped === -180 && longitude > 0 ? 180 : wrapped
}

export function clampLatitude(latitude: number): number {
  return clamp(latitude, -MAX_LATITUDE, MAX_LATITUDE)
}

export function normalizeLngLat(position: LngLat): LngLat {
  return {
    longitude: normalizeLongitude(position.longitude),
    latitude: clampLatitude(position.latitude),
  }
}

export function clampZoom(zoom: number): number {
  return clamp(zoom, MIN_ZOOM, MAX_ZOOM)
}

/** Great-circle distance in metres. */
export function distanceBetween(from: LngLat, to: LngLat): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude)
  const longitudeDelta = toRadians(to.longitude - from.longitude)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.min(1, Math.sqrt(haversine)))
}

export function boundsContains(bounds: MapBounds, position: LngLat): boolean {
  const insideLatitude = position.latitude >= bounds.south && position.latitude <= bounds.north
  const insideLongitude =
    bounds.west <= bounds.east
      ? position.longitude >= bounds.west && position.longitude <= bounds.east
      : position.longitude >= bounds.west || position.longitude <= bounds.east
  return insideLatitude && insideLongitude
}

export function boundsFromPlaces(places: readonly Pick<MapPlace, 'position'>[]): MapBounds | null {
  const [first, ...rest] = places
  if (!first) return null
  const bounds: MapBounds = {
    west: first.position.longitude,
    east: first.position.longitude,
    south: first.position.latitude,
    north: first.position.latitude,
  }
  for (const { position } of rest) {
    bounds.west = Math.min(bounds.west, position.longitude)
    bounds.east = Math.max(bounds.east, position.longitude)
    bounds.south = Math.min(bounds.south, position.latitude)
    bounds.north = Math.max(bounds.north, position.latitude)
  }
  return bounds
}

const worldSize = (zoom: number) => TILE_SIZE * 2 ** zoom

function toWorldPixels(position: LngLat, zoom: number) {
  const size = worldSize(zoom)
  const sine = Math.sin(toRadians(clampLatitude(position.latitude)))
  return {
    x: ((position.longitude + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * size,
  }
}

function fromWorldPixels(point: { x: number; y: number }, zoom: number): LngLat {
  const size = worldSize(zoom)
  return normalizeLngLat({
    longitude: (point.x / size) * 360 - 180,
    latitude: toDegrees(Math.atan(Math.sinh(Math.PI * (1 - (2 * point.y) / size)))),
  })
}

/** Moves the camera by a fraction of the viewport: `{ x: 0.5, y: 0 }` pans half a viewport east. */
export function panBy(view: MapView, fraction: { x: number; y: number }, size: MapSize): MapView {
  const centre = toWorldPixels(view.center, view.zoom)
  return {
    zoom: view.zoom,
    center: fromWorldPixels(
      { x: centre.x + fraction.x * size.width, y: centre.y + fraction.y * size.height },
      view.zoom,
    ),
  }
}

export function zoomBy(view: MapView, delta: number): MapView {
  return { center: view.center, zoom: clampZoom(view.zoom + delta) }
}

/** The box a view shows in a viewport of the given size. */
export function boundsOfView(view: MapView, size: MapSize): MapBounds {
  const centre = toWorldPixels(view.center, view.zoom)
  const northWest = fromWorldPixels(
    { x: centre.x - size.width / 2, y: centre.y - size.height / 2 },
    view.zoom,
  )
  const southEast = fromWorldPixels(
    { x: centre.x + size.width / 2, y: centre.y + size.height / 2 },
    view.zoom,
  )
  return {
    west: northWest.longitude,
    north: northWest.latitude,
    east: southEast.longitude,
    south: southEast.latitude,
  }
}

/**
 * The view at `zoom` that draws `position` at `anchor`, a point of the viewport as fractions of its
 * size: `{ x: 0.5, y: 0.5 }` centres it, `{ x: 0.5, y: 0.85 }` puts it low with room above.
 */
export function viewWithPositionAt(
  position: LngLat,
  zoom: number,
  size: MapSize,
  anchor: { x: number; y: number },
): MapView {
  const target = toWorldPixels(position, zoom)
  return {
    zoom,
    center: fromWorldPixels(
      {
        x: target.x + (0.5 - anchor.x) * size.width,
        y: target.y + (0.5 - anchor.y) * size.height,
      },
      zoom,
    ),
  }
}
