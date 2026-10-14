import { describe, expect, test } from 'vite-plus/test'
import { createMapStore } from './map-store.ts'

const view = { center: { longitude: 18, latitude: 59.3 }, zoom: 10 }

describe('map store popups', () => {
  test('selecting a place closes the open cluster', () => {
    const store = createMapStore({ view })
    store.actions.openCluster('c1')
    store.actions.selectPlace('p1')
    expect(store.getState().openedClusterId).toBeNull()
    expect(store.getState().selectedPlaceId).toBe('p1')
  })

  test('opening a cluster clears the selected place', () => {
    const store = createMapStore({ view, selectedPlaceId: 'p1' })
    store.actions.openCluster('c1')
    expect(store.getState().selectedPlaceId).toBeNull()
    expect(store.getState().openedClusterId).toBe('c1')
  })

  test('closing one popup leaves the other state alone', () => {
    const store = createMapStore({ view })
    store.actions.openCluster('c1')
    store.actions.selectPlace(null)
    expect(store.getState().openedClusterId).toBe('c1')
    store.actions.openCluster(null)
    expect(store.getState().openedClusterId).toBeNull()
  })
})

describe('map store layers', () => {
  test('setHiddenLayers replaces the hidden layers', () => {
    const store = createMapStore({ view, hiddenLayerIds: ['a'] })
    store.actions.setHiddenLayers(['b', 'c'])
    expect(store.getState().hiddenLayerIds).toEqual(['b', 'c'])
  })
})
