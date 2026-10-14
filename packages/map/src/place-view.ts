import { boundsContains } from '@kvirn-ui/core'
import type { ClusterTree, MapBounds, MapCluster, MapMarkerItem, MapPlace } from '@kvirn-ui/core'
import type { PlaceResolver } from './place-resolver.ts'

// Above this step every place is its own marker; below it nearby places share a cluster.
export const MAX_CLUSTER_ZOOM = 21
const CLUSTER_ID_SEPARATOR = ':'
const CLUSTER_LEVELS = 32
const MAX_CACHED_CLUSTERS = 2000
export const WORLD: MapBounds = {
  west: -180,
  east: 180,
  south: -85.0511287798,
  north: 85.0511287798,
}

export interface PlaceGroup {
  /** The layer's id, or '' for places in no layer: the prefix of its cluster ids. */
  key: string
  layer: string | undefined
  positions: Float64Array
  /** The source index of each position; `null` when the group is the whole source. */
  indices: Uint32Array | null
  count: number
  clustered: boolean
}

export interface VisibleTree {
  group: PlaceGroup
  tree: ClusterTree
}

export interface ViewQuery<Data> {
  bounds: MapBounds | null
  /** Changes when an async place arrives, so a place that was pending is looked up again. */
  resolutions: number
  selectedPlace: MapPlace<Data> | null
  hiddenLayerIds: readonly string[]
}

export const sourceIndexOf = (group: PlaceGroup, index: number) =>
  group.indices ? group.indices[index]! : index

const markerSignature = <Data>(items: readonly MapMarkerItem<Data>[]) =>
  items
    .map((item) =>
      item.type === 'place' ? item.place.id : `${item.cluster.id}#${item.cluster.count}`,
    )
    .join('|')

function makeCluster<Data>(
  { group, tree }: VisibleTree,
  resolver: PlaceResolver<Data>,
  numeric: number,
  count: number,
  longitude: number,
  latitude: number,
): MapCluster<Data> {
  let bounds: MapBounds | undefined
  let places: MapPlace<Data>[] | undefined
  return {
    id: `${group.key}${CLUSTER_ID_SEPARATOR}${numeric}`,
    ...(group.layer === undefined ? {} : { layer: group.layer }),
    position: { longitude, latitude },
    count,
    get bounds() {
      return (bounds ??= tree.getClusterBounds(numeric))
    },
    get places() {
      return (places ??= tree
        .getLeaves(numeric)
        .flatMap((leaf) => resolver.get(sourceIndexOf(group, leaf)) ?? []))
    },
  }
}

/**
 * What the visible trees answer at one zoom step, with the caches that make a repeated question
 * free: clusters by id (stable objects), the leaves of the last opened cluster, the places in the
 * last bounds asked about, and the last set of markers (the same array while its ids are the same).
 * Make a new one when the trees, the places or the zoom step change.
 */
export function createPlaceView<Data>(
  visible: readonly VisibleTree[],
  resolver: PlaceResolver<Data>,
  zoomStep: number,
) {
  const clusters = new Map<string, MapCluster<Data>>()
  let leaves: { id: string; indices: number[] } | null = null
  let inView: { bounds: MapBounds; indices: Uint32Array } | null = null
  let markers: { query: ViewQuery<Data>; signature: string; items: MapMarkerItem<Data>[] } | null =
    null

  const locate = (id: string) => {
    const split = id.lastIndexOf(CLUSTER_ID_SEPARATOR)
    const key = id.slice(0, split)
    const numeric = Number(id.slice(split + 1))
    const entry = visible.find(({ group }) => group.key === key)
    return entry && Number.isFinite(numeric) ? { entry, numeric } : null
  }

  const clusterOf = (
    entry: VisibleTree,
    numeric: number,
    count: number,
    longitude: number,
    latitude: number,
  ) => {
    const id = `${entry.group.key}${CLUSTER_ID_SEPARATOR}${numeric}`
    let cluster = clusters.get(id)
    if (!cluster) {
      cluster = makeCluster(entry, resolver, numeric, count, longitude, latitude)
      if (clusters.size >= MAX_CACHED_CLUSTERS) clusters.clear()
      clusters.set(id, cluster)
    }
    return cluster
  }

  const queryItems = ({ bounds, selectedPlace, hiddenLayerIds }: ViewQuery<Data>) => {
    const found: { item: MapMarkerItem<Data>; longitude: number; latitude: number }[] = []
    const view = bounds ?? WORLD
    for (const entry of visible) {
      const result = entry.tree.getItems(view, zoomStep)
      result.ids.forEach((id, position) => {
        const longitude = result.longitudes[position]!
        const latitude = result.latitudes[position]!
        const count = result.counts[position]!
        if (count === 1) {
          const place = resolver.get(sourceIndexOf(entry.group, id))
          if (place) found.push({ item: { type: 'place', place }, longitude, latitude })
        } else {
          const cluster = clusterOf(entry, id, count, longitude, latitude)
          found.push({ item: { type: 'cluster', cluster }, longitude, latitude })
        }
      })
    }
    if (visible.length > 1) {
      found.sort(
        (first, second) => second.latitude - first.latitude || first.longitude - second.longitude,
      )
    }
    const items = found.map(({ item }) => item)
    if (
      selectedPlace &&
      !(selectedPlace.layer !== undefined && hiddenLayerIds.includes(selectedPlace.layer)) &&
      (!bounds || boundsContains(bounds, selectedPlace.position)) &&
      !items.some((item) => item.type === 'place' && item.place.id === selectedPlace.id)
    ) {
      items.push({ type: 'place', place: selectedPlace })
    }
    return items
  }

  return {
    /** The markers for a view. The same array comes back while the question or its answer's ids are unchanged. */
    getMarkers: (query: ViewQuery<Data>): MapMarkerItem<Data>[] => {
      if (
        markers &&
        markers.query.bounds === query.bounds &&
        markers.query.resolutions === query.resolutions &&
        markers.query.selectedPlace === query.selectedPlace &&
        markers.query.hiddenLayerIds === query.hiddenLayerIds
      ) {
        return markers.items
      }
      const items = queryItems(query)
      const signature = markerSignature(items)
      markers = {
        query,
        signature,
        items: markers?.signature === signature ? markers.items : items,
      }
      return markers.items
    },

    getCluster: (id: string): MapCluster<Data> | null => {
      const found = locate(id)
      if (!found) return null
      const { entry, numeric } = found
      const count = entry.tree.getLeafCount(numeric)
      const topLevel = Math.min(zoomStep, (entry.group.clustered ? MAX_CLUSTER_ZOOM : 0) + 1)
      if (!(count >= 2) || numeric % CLUSTER_LEVELS !== topLevel) return null
      const { longitude, latitude } = entry.tree.getClusterPosition(numeric)
      return clusterOf(entry, numeric, count, longitude, latitude)
    },

    getClusterPlace: (clusterId: string, index: number): MapPlace<Data> | undefined => {
      if (leaves?.id !== clusterId) {
        const found = locate(clusterId)
        leaves = {
          id: clusterId,
          indices: found
            ? found.entry.tree
                .getLeaves(found.numeric)
                .map((leaf) => sourceIndexOf(found.entry.group, leaf))
            : [],
        }
      }
      const sourceIndex = leaves.indices[index]
      return sourceIndex === undefined ? undefined : resolver.get(sourceIndex)
    },

    /** Source indices of the places in the bounds, ascending. */
    getInViewIndices: (bounds: MapBounds | null): Uint32Array => {
      const view = bounds ?? WORLD
      if (inView?.bounds === view) return inView.indices
      const lists = visible.map(({ tree }) => tree.getPlaceIndices(view))
      const indices = new Uint32Array(lists.reduce((sum, list) => sum + list.length, 0))
      let offset = 0
      lists.forEach((list, position) => {
        const { group } = visible[position]!
        for (const index of list) indices[offset++] = sourceIndexOf(group, index)
      })
      indices.sort()
      inView = { bounds: view, indices }
      return indices
    },
  }
}
