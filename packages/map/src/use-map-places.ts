import {
  NO_LAYER,
  buildClusterTree,
  createClusterTree,
  createClusterTreeBuilder,
  placesToSource,
} from '@kvirn-ui/core'
import type {
  ClusterTree,
  ClusterTreeData,
  ClusterTreeOptions,
  MapBounds,
  MapLayer,
  MapPlace,
  MapPlaceSource,
} from '@kvirn-ui/core'
import { useEffect, useMemo, useReducer, useState } from 'react'
import { createPlaceResolver } from './place-resolver.ts'
import { MAX_CLUSTER_ZOOM, createPlaceView, sourceIndexOf } from './place-view.ts'
import type { PlaceGroup, VisibleTree } from './place-view.ts'

/** Builds the cluster trees away from the page. `createMapWorker` from `@kvirn-ui/map/worker` makes one. */
export interface MapIndexer {
  build: (positions: Float64Array, options: ClusterTreeOptions) => Promise<ClusterTreeData>
  terminate: () => void
}

// Above this many places the trees are built in time slices instead of inside the render.
const SYNC_BUILD_LIMIT = 20_000
const SLICE_MILLISECONDS = 8

interface GroupPlan {
  groups: PlaceGroup[]
  /** Places per layer id. */
  layerCounts: Readonly<Record<string, number>>
  radius: number | null
}

function planGroups(
  source: MapPlaceSource<unknown>,
  layers: readonly MapLayer[],
  radius: number | null,
): GroupPlan {
  const layerIndexes = source.layers
  if (layers.length === 0 || !layerIndexes) {
    return {
      groups: [
        {
          key: '',
          layer: undefined,
          positions: source.positions,
          indices: null,
          count: source.count,
          clustered: radius !== null,
        },
      ],
      layerCounts: {},
      radius,
    }
  }
  const slots = layers.length + 1
  const slotOf = (index: number) => {
    const layer = layerIndexes[index]!
    return layer === NO_LAYER || layer >= layers.length ? layers.length : layer
  }
  const counts = new Uint32Array(slots)
  for (let index = 0; index < source.count; index += 1) counts[slotOf(index)]! += 1
  const members = Array.from({ length: slots }, (_, slot) => new Uint32Array(counts[slot]!))
  const filled = new Uint32Array(slots)
  for (let index = 0; index < source.count; index += 1) {
    const slot = slotOf(index)
    members[slot]![filled[slot]!++] = index
  }
  const groups: PlaceGroup[] = []
  const layerCounts: Record<string, number> = {}
  members.forEach((indices, slot) => {
    const layer = layers[slot]
    if (layer) layerCounts[layer.id] = indices.length
    if (indices.length === 0) return
    const positions = new Float64Array(indices.length * 2)
    indices.forEach((sourceIndex, position) => {
      positions[2 * position] = source.positions[2 * sourceIndex]!
      positions[2 * position + 1] = source.positions[2 * sourceIndex + 1]!
    })
    groups.push({
      key: layer?.id ?? '',
      layer: layer?.id,
      positions,
      indices,
      count: indices.length,
      clustered: radius !== null && layer?.cluster !== false,
    })
  })
  return { groups, layerCounts, radius }
}

// A group that isn't clustered still needs the index to find its places in the view.
const optionsFor = (group: PlaceGroup, radius: number | null): ClusterTreeOptions =>
  group.clustered && radius !== null
    ? { radius, maxZoom: MAX_CLUSTER_ZOOM }
    : { radius: 0, maxZoom: 0 }

function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler
  if (scheduler?.yield) {
    return scheduler.yield()
  }
  return new Promise((resolve) => {
    if (typeof MessageChannel === 'undefined') {
      setTimeout(resolve, 0)
      return
    }
    const channel = new MessageChannel()
    channel.port1.onmessage = () => {
      channel.port1.close()
      resolve()
    }
    channel.port2.postMessage(null)
  })
}

async function buildGroupsAsync(
  plan: GroupPlan,
  indexer: MapIndexer | null,
  isCancelled: () => boolean,
): Promise<ClusterTree[] | null> {
  const trees: ClusterTree[] = []
  for (const group of plan.groups) {
    const options = optionsFor(group, plan.radius)
    if (indexer) {
      trees.push(createClusterTree(await indexer.build(group.positions, options)))
    } else {
      const builder = createClusterTreeBuilder(group.positions, options)
      while (!builder.step(performance.now() + SLICE_MILLISECONDS)) {
        await yieldToMain()
        if (isCancelled()) return null
      }
      trees.push(createClusterTree(builder.result()))
    }
    if (isCancelled()) return null
  }
  return trees
}

function useClusterTrees(plan: GroupPlan, indexIn: 'main' | (() => MapIndexer)) {
  const total = plan.groups.reduce((sum, group) => sum + group.count, 0)
  const isSmall = total <= SYNC_BUILD_LIMIT
  const syncTrees = useMemo(
    () =>
      isSmall
        ? plan.groups.map((group) =>
            createClusterTree(buildClusterTree(group.positions, optionsFor(group, plan.radius))),
          )
        : null,
    [plan, isSmall],
  )
  const [built, setBuilt] = useState<{ plan: GroupPlan; trees: ClusterTree[] } | null>(null)
  useEffect(() => {
    if (isSmall) return
    let cancelled = false
    const indexer = indexIn === 'main' ? null : indexIn()
    buildGroupsAsync(plan, indexer, () => cancelled).then(
      (trees) => {
        if (trees && !cancelled) setBuilt({ plan, trees })
      },
      () => undefined,
    )
    return () => {
      cancelled = true
      indexer?.terminate()
    }
  }, [plan, isSmall, indexIn])
  const trees = isSmall ? syncTrees : built?.plan === plan ? built.trees : null
  return trees
}

export interface UseMapPlacesOptions<Data> {
  places: readonly MapPlace<Data>[] | undefined
  source: MapPlaceSource<Data> | undefined
  layers: readonly MapLayer[]
  hiddenLayerIds: readonly string[]
  clusterRadius: number | null
  indexIn: 'main' | (() => MapIndexer)
  bounds: MapBounds | null
  zoomStep: number
  selectedPlaceId: string | null
}

/**
 * Everything the map knows about its places, off the source and its cluster trees: what is drawn,
 * counted and listed for the view, and a place or cluster by id. Nothing here materialises every
 * place unless a caller asks for the lazy `visiblePlaces` or `placesInView`.
 */
export function useMapPlaces<Data>({
  places,
  source: sourceProp,
  layers,
  hiddenLayerIds,
  clusterRadius,
  indexIn,
  bounds,
  zoomStep,
  selectedPlaceId,
}: UseMapPlacesOptions<Data>) {
  const [resolutions, onResolve] = useReducer((renders: number) => renders + 1, 0)
  const source = useMemo(
    () => sourceProp ?? placesToSource(places ?? [], layers),
    [sourceProp, places, layers],
  )
  const resolver = useMemo(() => createPlaceResolver(source, places, onResolve), [source, places])
  const plan = useMemo(
    () => planGroups(source as MapPlaceSource<unknown>, layers, clusterRadius),
    [source, layers, clusterRadius],
  )
  const trees = useClusterTrees(plan, indexIn)

  const visible = useMemo<VisibleTree[]>(
    () =>
      plan.groups.flatMap((group, position) =>
        trees?.[position] && !(group.layer !== undefined && hiddenLayerIds.includes(group.layer))
          ? [{ group, tree: trees[position]! }]
          : [],
      ),
    [plan, trees, hiddenLayerIds],
  )
  const visibleCount = visible.reduce((sum, { group }) => sum + group.count, 0)
  const placesInViewCount = useMemo(
    () =>
      bounds ? visible.reduce((sum, { tree }) => sum + tree.countPlaces(bounds), 0) : visibleCount,
    [visible, bounds, visibleCount],
  )

  const view = useMemo(
    () => createPlaceView(visible, resolver, zoomStep),
    [visible, resolver, zoomStep],
  )
  const selectedPlace = selectedPlaceId === null ? null : (resolver.find(selectedPlaceId) ?? null)
  const markersInView = view.getMarkers({
    bounds,
    resolutions,
    selectedPlace,
    hiddenLayerIds,
  })
  const placeAt = (position: number) => {
    const sourceIndex = view.getInViewIndices(bounds)[position]
    return sourceIndex === undefined ? undefined : resolver.get(sourceIndex)
  }

  return {
    source,
    indexing: trees === null,
    layerCounts: plan.layerCounts,
    visibleCount,
    placesInViewCount,
    markersInView,
    selectedPlace,
    getCluster: view.getCluster,
    getClusterPlace: view.getClusterPlace,
    findPlace: (id: string) => resolver.find(id),
    getPlaceInView: placeAt,
    getPlaceInViewPosition: (placeId: string): number => {
      const sourceIndex = resolver.indexOf(placeId)
      if (sourceIndex === undefined) return -1
      const indices = view.getInViewIndices(bounds)
      let low = 0
      let high = indices.length - 1
      while (low <= high) {
        const middle = (low + high) >> 1
        if (indices[middle]! === sourceIndex) return middle
        if (indices[middle]! < sourceIndex) low = middle + 1
        else high = middle - 1
      }
      return -1
    },
    getPlaceInViewKey: (position: number): string => {
      const sourceIndex = view.getInViewIndices(bounds)[position]
      return sourceIndex === undefined
        ? String(position)
        : (resolver.get(sourceIndex)?.id ?? `index-${sourceIndex}`)
    },
    getVisiblePlaces: (): MapPlace<Data>[] => {
      const all: MapPlace<Data>[] = []
      for (const { group } of visible) {
        for (let index = 0; index < group.count; index += 1) {
          const place = resolver.get(sourceIndexOf(group, index))
          if (place) all.push(place)
        }
      }
      return all
    },
    getPlacesInView: (): MapPlace<Data>[] => {
      const all: MapPlace<Data>[] = []
      for (const sourceIndex of view.getInViewIndices(bounds)) {
        const place = resolver.get(sourceIndex)
        if (place) all.push(place)
      }
      return all
    },
  }
}
