import { TILE_SIZE } from './geometry.ts'
import { createKdIndex, createKdIndexBuilder } from './kd-index.ts'
import type { KdCoords, KdIndex, KdIndexBuilder, KdIndexData } from './kd-index.ts'
import type { LngLat, MapBounds } from './types.ts'

const LEVEL_BITS = 32
const MAX_LATITUDE = 85.0511287798
const TIME_CHECK_INTERVAL = 128
// How many of the top zoom steps skip the neighbour search for places that have no neighbour in reach.
const NEAREST_LEVELS = 5

export interface ClusterTreeOptions {
  /** Places closer than this, in CSS pixels at a whole zoom step, share a cluster. */
  radius: number
  /** Above this zoom step every place is its own marker. Default 16, at most 31. */
  maxZoom?: number
  /** Number of places. Default: half the length of `positions`. */
  count?: number
  /** Turns off the shortcut for places with no neighbour in reach. The result is the same; only tests need it. */
  searchEveryPlace?: boolean
}

export interface ClusterTreeLevel {
  /** The node of each item in the level's index. Empty on the top level, where item i is place i. */
  nodes: Uint32Array
  index: KdIndexData
}

/** Plain typed arrays, so the tree can be sliced across tasks or transferred between a worker and the page. */
export interface ClusterTreeData {
  count: number
  maxZoom: number
  /** Mercator x, y in [0, 1] per node: the places first, then the clusters. */
  positions: Float32Array
  /** Places under each node. */
  counts: Uint32Array
  /** The zoom step each cluster was formed at. */
  clusterZooms: Uint8Array
  /** `children[childOffsets[c]..childOffsets[c + 1]]` are the nodes merged into cluster c. */
  childOffsets: Uint32Array
  children: Uint32Array
  /** Indexed by zoom step, 0 to `maxZoom + 1`. */
  levels: ClusterTreeLevel[]
}

export interface ClusterTreeBuilder {
  /** Works until `deadlineMs` (a `performance.now()` time; `Infinity` runs to the end). Returns true when done. */
  step: (deadlineMs: number) => boolean
  result: () => ClusterTreeData
}

export interface ClusterTreeItems {
  /** A place's index, or a cluster's id. */
  ids: number[]
  longitudes: number[]
  latitudes: number[]
  /** 1 for a place, at least 2 for a cluster. */
  counts: number[]
}

/** A cluster id is `clusterIndex * 32 + zoomStep`, so a caller's layer prefix keeps ids from several trees apart. */
export interface ClusterTree {
  /** Items for the whole zoom step (`Math.floor(zoom)`), top to bottom, then left to right. */
  getItems: (
    bounds: MapBounds,
    zoom: number,
    skip?: (placeIndex: number) => boolean,
  ) => ClusterTreeItems
  /** Place indices under a cluster, depth first. */
  getLeaves: (clusterId: number, offset?: number, limit?: number) => number[]
  getLeafCount: (clusterId: number) => number
  /** How many places lie inside the bounds, without listing them. */
  countPlaces: (bounds: MapBounds) => number
  /** The indices of the places inside the bounds, in ascending order. */
  getPlaceIndices: (bounds: MapBounds) => Uint32Array
  /** The zoom step at which the cluster has split. */
  getExpansionZoom: (clusterId: number) => number
  getClusterBounds: (clusterId: number) => MapBounds
  getClusterPosition: (clusterId: number) => LngLat
}

const toMercatorX = (longitude: number) => (longitude + 180) / 360

function toMercatorY(latitude: number) {
  const sine = Math.sin((Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, latitude)) * Math.PI) / 180)
  return Math.min(1, Math.max(0, 0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)))
}

const fromMercatorX = (x: number) => x * 360 - 180
const fromMercatorY = (y: number) =>
  (360 / Math.PI) * Math.atan(Math.exp((0.5 - y) * 2 * Math.PI)) - 90

export function createClusterTreeBuilder(
  positions: Float64Array,
  {
    radius,
    maxZoom = 16,
    count = positions.length / 2,
    searchEveryPlace = false,
  }: ClusterTreeOptions,
): ClusterTreeBuilder {
  const topZoom = Math.min(LEVEL_BITS - 1, Math.max(0, Math.floor(maxZoom)))
  const nodePositions = new Float32Array(Math.max(0, 4 * count))
  const nodeCounts = new Uint32Array(Math.max(0, 2 * count))
  const clusterZooms = new Uint8Array(count)
  const childOffsets = new Uint32Array(count + 1)
  const children = new Uint32Array(2 * count)
  const levels: ClusterTreeLevel[] = []
  const emptyNodes = new Uint32Array(0)

  let phase: 'project' | 'index' | 'nearest' | 'cluster' | 'done' = 'project'
  let projected = 0
  let nodeFill = count
  let clusterFill = 0
  let childFill = 0

  let level = topZoom + 1
  let currentNodes: Uint32Array | undefined
  let currentCount = count
  let indexBuilder: KdIndexBuilder
  let currentIndex: KdIndex
  // Items are visited in tree order, so neighbours sit close in memory and the next index starts nearly sorted.
  let currentOrder: Uint32Array = new Uint32Array(0)
  let currentCoords: KdCoords = new Float32Array(0)
  let visited = new Uint8Array(0)
  let nextNodes = new Uint32Array(0)
  let nextFill = 0
  let cursor = 0
  let zoom = 0
  let clusterRadius = 0

  let sumWeight = 0
  let sumX = 0
  let sumY = 0

  // A place alone within twice a level's radius cannot join anything there: a cluster formed at a
  // deeper step sits within that step's radius of its seed, and the offsets sum to at most the level's radius.
  const nearestSquared = new Float64Array(count).fill(Infinity)
  const nearestReach = searchEveryPlace
    ? 0
    : (2 * radius) / (TILE_SIZE * 2 ** Math.max(0, topZoom - NEAREST_LEVELS + 1))
  let nearestItem = 0
  let nearestX = 0
  let nearestY = 0
  let skipThreshold = 0

  const visitNearest = (other: number) => {
    if (other === nearestItem) return
    const dx = nodePositions[2 * other]! - nearestX
    const dy = nodePositions[2 * other + 1]! - nearestY
    const squared = dx * dx + dy * dy
    if (squared < nearestSquared[nearestItem]!) nearestSquared[nearestItem] = squared
  }

  const visitNeighbor = (item: number) => {
    if (visited[item]) return
    visited[item] = 1
    const node = currentNodes ? currentNodes[item]! : item
    const weight = nodeCounts[node]!
    sumWeight += weight
    sumX += nodePositions[2 * node]! * weight
    sumY += nodePositions[2 * node + 1]! * weight
    children[childFill] = node
    childFill += 1
  }

  const startIndex = () => {
    const coords = new Float32Array(currentCount * 2)
    for (let item = 0; item < currentCount; item += 1) {
      const node = currentNodes ? currentNodes[item]! : item
      coords[2 * item] = nodePositions[2 * node]!
      coords[2 * item + 1] = nodePositions[2 * node + 1]!
    }
    indexBuilder = createKdIndexBuilder(coords)
    phase = 'index'
  }

  const startCluster = (nextZoom: number) => {
    zoom = nextZoom
    clusterRadius = radius / (TILE_SIZE * 2 ** nextZoom)
    skipThreshold =
      !searchEveryPlace && 2 * clusterRadius <= nearestReach ? (2 * clusterRadius) ** 2 : Infinity
    visited = new Uint8Array(currentCount)
    nextNodes = new Uint32Array(currentCount)
    nextFill = 0
    cursor = 0
    phase = 'cluster'
  }

  const clusterItem = (item: number, x: number, y: number) => {
    visited[item] = 1
    const node = currentNodes ? currentNodes[item]! : item
    if (node < count && nearestSquared[node]! > skipThreshold) {
      nextNodes[nextFill] = node
      nextFill += 1
      return
    }
    const weight = nodeCounts[node]!
    const childStart = childFill
    children[childFill] = node
    childFill += 1
    sumWeight = weight
    sumX = x * weight
    sumY = y * weight
    if (clusterRadius > 0) currentIndex.within(x, y, clusterRadius, visitNeighbor)
    if (childFill - childStart < 2) {
      childFill = childStart
      nextNodes[nextFill] = node
    } else {
      const cluster = nodeFill
      nodePositions[2 * cluster] = sumX / sumWeight
      nodePositions[2 * cluster + 1] = sumY / sumWeight
      nodeCounts[cluster] = sumWeight
      clusterZooms[clusterFill] = zoom
      childOffsets[clusterFill] = childStart
      clusterFill += 1
      childOffsets[clusterFill] = childFill
      nodeFill += 1
      nextNodes[nextFill] = cluster
    }
    nextFill += 1
  }

  return {
    step(deadlineMs) {
      for (;;) {
        if (phase === 'project') {
          while (projected < count) {
            nodePositions[2 * projected] = toMercatorX(positions[2 * projected]!)
            nodePositions[2 * projected + 1] = toMercatorY(positions[2 * projected + 1]!)
            nodeCounts[projected] = 1
            projected += 1
            if (projected % 4096 === 0 && performance.now() > deadlineMs) return false
          }
          startIndex()
        } else if (phase === 'index') {
          if (!indexBuilder.step(deadlineMs)) return false
          const index = indexBuilder.result()
          levels[level] = { nodes: currentNodes ?? emptyNodes, index }
          if (level === 0) {
            phase = 'done'
          } else {
            currentIndex = createKdIndex(index)
            currentOrder = index.ids
            currentCoords = index.coords
            if (level === topZoom + 1 && radius > 0 && !searchEveryPlace) {
              cursor = 0
              phase = 'nearest'
            } else {
              startCluster(level - 1)
            }
          }
        } else if (phase === 'nearest') {
          while (cursor < currentCount) {
            nearestItem = currentOrder[cursor]!
            nearestX = currentCoords[2 * cursor]!
            nearestY = currentCoords[2 * cursor + 1]!
            currentIndex.within(nearestX, nearestY, nearestReach, visitNearest)
            cursor += 1
            if (cursor % TIME_CHECK_INTERVAL === 0 && performance.now() > deadlineMs) return false
          }
          startCluster(level - 1)
        } else if (phase === 'cluster') {
          while (cursor < currentCount) {
            const item = currentOrder[cursor]!
            if (!visited[item])
              clusterItem(item, currentCoords[2 * cursor]!, currentCoords[2 * cursor + 1]!)
            cursor += 1
            if (cursor % TIME_CHECK_INTERVAL === 0 && performance.now() > deadlineMs) return false
          }
          level = zoom
          if (nextFill === currentCount) {
            levels[zoom] = levels[zoom + 1]!
            if (zoom === 0) phase = 'done'
            else startCluster(zoom - 1)
          } else {
            currentNodes = nextNodes.slice(0, nextFill)
            currentCount = nextFill
            startIndex()
          }
        } else {
          return true
        }
      }
    },
    result() {
      if (phase !== 'done') throw new Error('The tree is not built yet')
      return {
        count,
        maxZoom: topZoom,
        positions: nodePositions.slice(0, 2 * nodeFill),
        counts: nodeCounts.slice(0, nodeFill),
        clusterZooms: clusterZooms.slice(0, clusterFill),
        childOffsets: childOffsets.slice(0, clusterFill + 1),
        children: children.slice(0, childFill),
        levels,
      }
    },
  }
}

export function buildClusterTree(
  positions: Float64Array,
  options: ClusterTreeOptions,
): ClusterTreeData {
  const builder = createClusterTreeBuilder(positions, options)
  builder.step(Infinity)
  return builder.result()
}

/** The buffers to pass as the transfer list when posting the tree to or from a worker. */
export function clusterTreeTransferables(data: ClusterTreeData): ArrayBuffer[] {
  const arrays = [
    data.positions,
    data.counts,
    data.clusterZooms,
    data.childOffsets,
    data.children,
    ...data.levels.flatMap((level) => [level.nodes, level.index.ids, level.index.coords]),
  ]
  // Levels with nothing merged share their arrays, and a buffer may appear once in a transfer list.
  return [...new Set(arrays.map((array) => array.buffer as ArrayBuffer))]
}

export function createClusterTree(data: ClusterTreeData): ClusterTree {
  const { count, maxZoom, positions, counts, clusterZooms, childOffsets, children, levels } = data
  const indexes: (KdIndex | undefined)[] = []
  const indexOf = (level: number) => (indexes[level] ??= createKdIndex(levels[level]!.index))
  const clusterNode = (clusterId: number) => count + Math.floor(clusterId / LEVEL_BITS)

  const longitudeOf = (node: number) => fromMercatorX(positions[2 * node]!)
  const latitudeOf = (node: number) => fromMercatorY(positions[2 * node + 1]!)

  const collect = (
    items: ClusterTreeItems,
    order: number[],
    level: number,
    skip: ((placeIndex: number) => boolean) | undefined,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ) => {
    const nodes = levels[level]!.nodes
    const identity = nodes.length === 0
    indexOf(level).range(minX, minY, maxX, maxY, (item) => {
      const node = identity ? item : nodes[item]!
      const isPlace = node < count
      if (isPlace && skip?.(node)) return
      order.push(items.ids.length)
      items.ids.push(isPlace ? node : (node - count) * LEVEL_BITS + level)
      items.longitudes.push(longitudeOf(node))
      items.latitudes.push(latitudeOf(node))
      items.counts.push(counts[node]!)
    })
  }

  const leavesOf = (clusterId: number, offset: number, limit: number) => {
    const leaves: number[] = []
    let skipped = offset
    const stack = [clusterNode(clusterId)]
    while (stack.length > 0 && leaves.length < limit) {
      const node = stack.pop()!
      if (node < count) {
        if (skipped > 0) skipped -= 1
        else leaves.push(node)
      } else if (skipped >= counts[node]!) {
        skipped -= counts[node]!
      } else {
        const cluster = node - count
        for (
          let child = childOffsets[cluster + 1]! - 1;
          child >= childOffsets[cluster]!;
          child -= 1
        ) {
          stack.push(children[child]!)
        }
      }
    }
    return leaves
  }

  const forEachSpan = (
    bounds: MapBounds,
    run: (minX: number, minY: number, maxX: number, maxY: number) => void,
  ) => {
    const minY = toMercatorY(bounds.north)
    const maxY = toMercatorY(bounds.south)
    const west = toMercatorX(bounds.west)
    const east = toMercatorX(bounds.east)
    if (bounds.east - bounds.west >= 360) {
      run(0, minY, 1, maxY)
    } else if (west <= east) {
      run(west, minY, east, maxY)
    } else {
      run(west, minY, 1, maxY)
      run(0, minY, east, maxY)
    }
  }
  const placeLevel = maxZoom + 1

  return {
    countPlaces(bounds) {
      let found = 0
      forEachSpan(bounds, (minX, minY, maxX, maxY) =>
        indexOf(placeLevel).range(minX, minY, maxX, maxY, () => {
          found += 1
        }),
      )
      return found
    },
    getPlaceIndices(bounds) {
      const found: number[] = []
      forEachSpan(bounds, (minX, minY, maxX, maxY) =>
        indexOf(placeLevel).range(minX, minY, maxX, maxY, (item) => {
          found.push(item)
        }),
      )
      return Uint32Array.from(found).sort()
    },
    getItems(bounds, zoom, skip) {
      const level = Math.min(maxZoom + 1, Math.max(0, Math.floor(zoom)))
      const items: ClusterTreeItems = { ids: [], longitudes: [], latitudes: [], counts: [] }
      const order: number[] = []
      forEachSpan(bounds, (minX, minY, maxX, maxY) =>
        collect(items, order, level, skip, minX, minY, maxX, maxY),
      )
      order.sort(
        (first, second) =>
          items.latitudes[second]! - items.latitudes[first]! ||
          items.longitudes[first]! - items.longitudes[second]! ||
          items.ids[first]! - items.ids[second]!,
      )
      return {
        ids: order.map((item) => items.ids[item]!),
        longitudes: order.map((item) => items.longitudes[item]!),
        latitudes: order.map((item) => items.latitudes[item]!),
        counts: order.map((item) => items.counts[item]!),
      }
    },
    getLeaves: (clusterId, offset = 0, limit = Infinity) => leavesOf(clusterId, offset, limit),
    getLeafCount: (clusterId) => counts[clusterNode(clusterId)]!,
    getExpansionZoom: (clusterId) =>
      Math.min(maxZoom + 1, clusterZooms[clusterNode(clusterId) - count]! + 1),
    getClusterBounds(clusterId) {
      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity
      for (const leaf of leavesOf(clusterId, 0, Infinity)) {
        const x = positions[2 * leaf]!
        const y = positions[2 * leaf + 1]!
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
      return {
        west: fromMercatorX(minX),
        east: fromMercatorX(maxX),
        north: fromMercatorY(minY),
        south: fromMercatorY(maxY),
      }
    },
    getClusterPosition: (clusterId) => {
      const node = clusterNode(clusterId)
      return { longitude: longitudeOf(node), latitude: latitudeOf(node) }
    },
  }
}
