import { describe, expect, test } from 'vite-plus/test'
import { buildClusterTree, createClusterTree, createClusterTreeBuilder } from './cluster-tree.ts'
import type { MapBounds } from './types.ts'

function randomPositions(count: number, seed: number) {
  let state = seed
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
  const positions = new Float64Array(count * 2)
  for (let index = 0; index < count; index += 1) {
    positions[2 * index] = 10 + next() * 20
    positions[2 * index + 1] = 55 + next() * 8
  }
  return positions
}

const count = 3000
const positions = randomPositions(count, 11)
const options = { radius: 60, maxZoom: 12 }
const data = buildClusterTree(positions, options)
const tree = createClusterTree(data)
const world: MapBounds = { west: -180, east: 180, south: -85, north: 85 }
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const sorted = (values: number[]) => [...values].sort((first, second) => first - second)

describe('cluster tree', () => {
  test('counts sum to the number of places at every zoom step', () => {
    for (let zoom = 0; zoom <= 13; zoom += 1) {
      expect(sum(tree.getItems(world, zoom).counts)).toBe(count)
    }
  })

  test('the leaves of a cluster are exactly its members, each once', () => {
    const items = tree.getItems(world, 5)
    const all: number[] = []
    items.ids.forEach((id, item) => {
      if (items.counts[item]! < 2) return all.push(id)
      const leaves = tree.getLeaves(id)
      expect(leaves).toHaveLength(items.counts[item]!)
      expect(tree.getLeafCount(id)).toBe(items.counts[item])
      all.push(...leaves)
    })
    expect(sorted(all)).toEqual(Array.from({ length: count }, (_, index) => index))
  })

  test('leaves page with offset and limit', () => {
    const items = tree.getItems(world, 3)
    const id = items.ids[items.counts.findIndex((value) => value > 10)]!
    const all = tree.getLeaves(id)
    expect(tree.getLeaves(id, 4, 5)).toEqual(all.slice(4, 9))
  })

  test('at the expansion zoom the cluster is no longer one item', () => {
    const items = tree.getItems(world, 4)
    const item = items.counts.findIndex((value) => value > 1)
    const id = items.ids[item]!
    const zoom = tree.getExpansionZoom(id)
    expect(zoom).toBeGreaterThan(4)
    const members = sorted(tree.getLeaves(id))
    const groupsOf = (deeper: ReturnType<typeof tree.getItems>) =>
      deeper.ids.map((deeperId, index) =>
        sorted(deeper.counts[index]! < 2 ? [deeperId] : tree.getLeaves(deeperId)),
      )
    const isMembers = (group: number[]) => group.join() === members.join()
    expect(groupsOf(tree.getItems(world, zoom - 1)).some(isMembers)).toBe(true)
    expect(groupsOf(tree.getItems(world, zoom)).some(isMembers)).toBe(false)
  })

  test('above maxZoom every place is its own marker', () => {
    const items = tree.getItems(world, 20)
    expect(items.ids).toHaveLength(count)
    expect(Math.max(...items.counts)).toBe(1)
  })

  test('ids are stable for two views at the same zoom step', () => {
    const wide = tree.getItems(world, 6.2)
    const narrow = tree.getItems({ west: 15, east: 25, south: 57, north: 62 }, 6.9)
    const wideIds = new Set(wide.ids)
    expect(narrow.ids.length).toBeGreaterThan(0)
    expect(narrow.ids.every((id) => wideIds.has(id))).toBe(true)
  })

  test('a view across the antimeridian finds both sides', () => {
    const edge = Float64Array.from([179.9, 10, -179.9, 10, 0, 10])
    const edgeTree = createClusterTree(buildClusterTree(edge, { radius: 10, maxZoom: 8 }))
    const items = edgeTree.getItems({ west: 170, east: -170, south: 0, north: 20 }, 8)
    expect(sorted(items.ids)).toEqual([0, 1])
  })

  test('skip leaves a place out of the result', () => {
    const items = tree.getItems(world, 20, (index) => index === 5)
    expect(items.ids).toHaveLength(count - 1)
  })

  test('a build in steps equals a build in one go', () => {
    const builder = createClusterTreeBuilder(positions, options)
    let steps = 1
    while (!builder.step(performance.now() - 1)) steps += 1
    expect(steps).toBeGreaterThan(1)
    expect(builder.result()).toEqual(data)
  })

  test('cluster position and bounds describe the members', () => {
    const items = tree.getItems(world, 4)
    const id = items.ids[items.counts.findIndex((value) => value > 1)]!
    const { west, east, south, north } = tree.getClusterBounds(id)
    const { longitude, latitude } = tree.getClusterPosition(id)
    expect(longitude).toBeGreaterThanOrEqual(west)
    expect(longitude).toBeLessThanOrEqual(east)
    expect(latitude).toBeGreaterThanOrEqual(south)
    expect(latitude).toBeLessThanOrEqual(north)
  })

  test('no places gives no items', () => {
    const empty = createClusterTree(buildClusterTree(new Float64Array(0), options))
    expect(empty.getItems(world, 3).ids).toEqual([])
  })

  test('skipping places with no neighbour in reach changes nothing', () => {
    let state = 5
    const next = () => {
      state = (state * 1664525 + 1013904223) % 4294967296
      return state / 4294967296
    }
    const sets = [
      Float64Array.from({ length: 8000 }, (_, index) =>
        index % 2 ? 55 + next() * 8 : 10 + next() * 20,
      ),
      Float64Array.from({ length: 8000 }, (_, index) =>
        index % 2 ? 59 + next() * 0.3 : 18 + next() * 0.6,
      ),
      Float64Array.from({ length: 8000 }, (_, index) => {
        const clump = Math.floor(index / 2) % 10
        return index % 2 ? 58 + clump * 0.5 + next() * 0.05 : 12 + clump * 1.5 + next() * 0.05
      }),
    ]
    for (const set of sets) {
      expect(buildClusterTree(set, { radius: 48, maxZoom: 16 })).toEqual(
        buildClusterTree(set, { radius: 48, maxZoom: 16, searchEveryPlace: true }),
      )
    }
  })

  test('places in bounds are counted and listed in ascending order', () => {
    const view = { west: 15, east: 25, south: 57, north: 62 }
    const indices = tree.getPlaceIndices(view)
    expect(indices.length).toBe(tree.countPlaces(view))
    expect(indices.length).toBeGreaterThan(0)
    expect([...indices]).toEqual(sorted([...indices]))
    for (const index of indices) {
      const longitude = positions[2 * index]!
      const latitude = positions[2 * index + 1]!
      expect(longitude >= 15 && longitude <= 25 && latitude >= 57 && latitude <= 62).toBe(true)
    }
  })
})
