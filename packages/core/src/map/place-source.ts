import type { MapPlace } from './types.ts'

/** Places as columns, so no object per place exists until one is shown. */
export interface MapPlaceSource<Data = unknown> {
  count: number
  /** Interleaved longitude, latitude: length `count * 2`. */
  positions: Float64Array
  /** Index into the layers per place, when there are layers. `NO_LAYER` marks a place in none. */
  layers?: Uint16Array
  /** The place at an index, built when a marker, popup or row needs it. May be async (a server call). */
  get: (index: number) => MapPlace<Data> | Promise<MapPlace<Data>>
}

export const NO_LAYER = 0xffff

export function placesToSource<Data = unknown>(
  places: readonly MapPlace<Data>[],
  layers?: readonly { id: string }[],
): MapPlaceSource<Data> {
  const positions = new Float64Array(places.length * 2)
  const layerIndexes = layers ? new Uint16Array(places.length).fill(NO_LAYER) : undefined
  const layerOf = layers ? new Map(layers.map((layer, index) => [layer.id, index])) : undefined
  places.forEach((place, index) => {
    positions[2 * index] = place.position.longitude
    positions[2 * index + 1] = place.position.latitude
    if (layerIndexes && place.layer !== undefined) {
      layerIndexes[index] = layerOf?.get(place.layer) ?? NO_LAYER
    }
  })
  return {
    count: places.length,
    positions,
    ...(layerIndexes ? { layers: layerIndexes } : {}),
    get: (index) => places[index]!,
  }
}
