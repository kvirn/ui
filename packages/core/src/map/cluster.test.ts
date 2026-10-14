import { describe, expect, test } from 'vite-plus/test'
import { clusterPlaces } from './cluster.ts'
import type { MapPlace } from './types.ts'

const place = (id: string, longitude: number, latitude: number, layer?: string): MapPlace => ({
  id,
  name: id,
  position: { longitude, latitude },
  ...(layer ? { layer } : {}),
})

const near = [place('a', 18.0, 59.3), place('b', 18.0001, 59.3001), place('c', 18.0002, 59.3)]
const far = place('z', 19.5, 59.9)

const clusters = (items: ReturnType<typeof clusterPlaces>) =>
  items.filter((item) => item.type === 'cluster')

describe('clusterPlaces', () => {
  test('near points cluster and far points stay places', () => {
    const items = clusterPlaces([...near, far], { zoom: 11, radius: 60 })
    expect(items).toHaveLength(2)
    expect(clusters(items)).toHaveLength(1)
    expect(items.filter((item) => item.type === 'place')).toHaveLength(1)
  })

  test('a group of one is a place', () => {
    expect(clusterPlaces([far], { zoom: 11, radius: 60 })).toEqual([{ type: 'place', place: far }])
  })

  test('layers never mix', () => {
    const items = clusterPlaces([place('a', 18, 59.3, 'x'), place('b', 18, 59.3, 'y')], {
      zoom: 11,
      radius: 60,
    })
    expect(clusters(items)).toHaveLength(0)
  })

  test('a layer with cluster: false is never clustered', () => {
    const items = clusterPlaces(
      near.map((p) => ({ ...p, layer: 'x' })),
      { zoom: 11, radius: 60, layers: [{ id: 'x', cluster: false }] },
    )
    expect(items).toHaveLength(3)
  })

  test('keep excludes a place from clusters', () => {
    const items = clusterPlaces(near, { zoom: 11, radius: 60, keep: (p) => p.id !== 'a' })
    expect(items).toHaveLength(2)
    expect(clusters(items)[0]?.type === 'cluster' && clusters(items)[0]).toBeTruthy()
  })

  test('cluster id, position and bounds', () => {
    const [item] = clusterPlaces(near, { zoom: 11.7, radius: 60 })
    if (item?.type !== 'cluster') throw new Error('expected a cluster')
    expect(item.cluster.id).toBe(':11:a')
    expect(item.cluster.position.longitude).toBeCloseTo(18.0001, 6)
    expect(item.cluster.bounds).toEqual({ west: 18, east: 18.0002, south: 59.3, north: 59.3001 })
  })

  test('fractional zoom within a step gives the same clusters', () => {
    const at = (zoom: number) => clusterPlaces([...near, far], { zoom, radius: 60 })
    expect(at(11.1)).toEqual(at(11.9))
  })

  test('ids are stable when the input is the same set at the same zoom (a pan)', () => {
    const ids = (list: MapPlace[]) =>
      clusters(clusterPlaces(list, { zoom: 12, radius: 60 })).map(
        (i) => i.type === 'cluster' && i.cluster.id,
      )
    expect(ids([...near, far])).toEqual(ids([...near]))
  })

  test('zooming in splits a cluster', () => {
    const items = clusterPlaces([place('a', 18, 59.3), place('b', 18.01, 59.3)], {
      zoom: 8,
      radius: 60,
    })
    const deeper = clusterPlaces([place('a', 18, 59.3), place('b', 18.01, 59.3)], {
      zoom: 14,
      radius: 60,
    })
    expect(clusters(items)).toHaveLength(1)
    expect(clusters(deeper)).toHaveLength(0)
  })
})
