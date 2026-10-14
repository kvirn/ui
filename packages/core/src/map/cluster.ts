import { TILE_SIZE, boundsFromPlaces } from './geometry.ts'
import type { MapCluster, MapLayer, MapMarkerItem, MapPlace } from './types.ts'

export interface ClusterPlacesOptions<Data = unknown> {
  zoom: number
  /** Places closer than this, in screen pixels at the whole zoom step, share a cluster. */
  radius: number
  /** Return false to keep a place out of every cluster, such as the selected one. */
  keep?: (place: MapPlace<Data>) => boolean
  /** A layer with `cluster: false` is never clustered. */
  layers?: readonly Pick<MapLayer, 'id' | 'cluster'>[]
}

function toWorldPixels({ longitude, latitude }: MapPlace['position'], zoomStep: number) {
  const size = TILE_SIZE * 2 ** zoomStep
  const sine = Math.sin(
    (Math.max(-85.0511287798, Math.min(85.0511287798, latitude)) * Math.PI) / 180,
  )
  return {
    x: ((longitude + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * size,
  }
}

/** Groups nearby places per layer. Clusters change on whole zoom steps only, so a pan never reshuffles them. */
export function clusterPlaces<Data = unknown>(
  places: readonly MapPlace<Data>[],
  { zoom, radius, keep, layers = [] }: ClusterPlacesOptions<Data>,
): MapMarkerItem<Data>[] {
  const zoomStep = Math.floor(zoom)
  const unclustered = new Set(layers.filter((layer) => layer.cluster === false).map((l) => l.id))
  const cells = new Map<string, number[]>()
  const projected = places.map((place) => toWorldPixels(place.position, zoomStep))
  const groupOf: number[] = []
  const groups: number[][] = []
  const cellOf = (index: number, offsetX = 0, offsetY = 0) =>
    `${places[index]?.layer ?? ''}|${Math.floor(projected[index]!.x / radius) + offsetX}|${Math.floor(projected[index]!.y / radius) + offsetY}`

  places.forEach((place, index) => {
    const alone =
      (place.layer !== undefined && unclustered.has(place.layer)) || keep?.(place) === false
    if (alone || radius <= 0) {
      groupOf[index] = groups.push([index]) - 1
      return
    }
    let found = -1
    for (let offsetX = -1; offsetX <= 1 && found < 0; offsetX += 1) {
      for (let offsetY = -1; offsetY <= 1 && found < 0; offsetY += 1) {
        for (const other of cells.get(cellOf(index, offsetX, offsetY)) ?? []) {
          const dx = projected[other]!.x - projected[index]!.x
          const dy = projected[other]!.y - projected[index]!.y
          if (Math.hypot(dx, dy) <= radius) {
            found = groupOf[other]!
            break
          }
        }
      }
    }
    if (found < 0) found = groups.push([]) - 1
    groups[found]!.push(index)
    groupOf[index] = found
    const key = cellOf(index)
    cells.set(key, [...(cells.get(key) ?? []), index])
  })

  return groups.map((members): MapMarkerItem<Data> => {
    const [first, ...rest] = members.map((index) => places[index]!)
    if (!first || rest.length === 0) return { type: 'place', place: first! }
    const group = [first, ...rest]
    const cluster: MapCluster<Data> = {
      id: `${first.layer ?? ''}:${zoomStep}:${first.id}`,
      ...(first.layer === undefined ? {} : { layer: first.layer }),
      position: {
        longitude: group.reduce((sum, { position }) => sum + position.longitude, 0) / group.length,
        latitude: group.reduce((sum, { position }) => sum + position.latitude, 0) / group.length,
      },
      bounds: boundsFromPlaces(group)!,
      count: group.length,
      places: group,
    }
    return { type: 'cluster', cluster }
  })
}
