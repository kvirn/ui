import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'
import { boundsContains } from './geometry.ts'
import type { MapBounds, MapPlace, MapView } from './types.ts'

export interface MapState {
  view: MapView
  bounds: MapBounds | null
  selectedPlaceId: string | null
  openedClusterId: string | null
  hiddenLayerIds: readonly string[]
}

export interface MapActions {
  setView: (view: MapView) => void
  setBounds: (bounds: MapBounds) => void
  selectPlace: (placeId: string | null) => void
  openCluster: (clusterId: string | null) => void
  setLayerHidden: (layerId: string, hidden: boolean) => void
  setHiddenLayers: (layerIds: readonly string[]) => void
}

export type MapStore = ComponentStore<MapState, MapActions>

export interface CreateMapStoreOptions {
  view: MapView
  selectedPlaceId?: string | null
  hiddenLayerIds?: readonly string[]
}

export function createMapStore(options: CreateMapStoreOptions): MapStore {
  return createComponentStore<MapState, MapActions>(
    {
      view: options.view,
      bounds: null,
      selectedPlaceId: options.selectedPlaceId ?? null,
      openedClusterId: null,
      hiddenLayerIds: options.hiddenLayerIds ?? [],
    },
    ({ update }) => ({
      setView: (view) => update((state) => ({ ...state, view })),
      setBounds: (bounds) => update((state) => ({ ...state, bounds })),
      selectPlace: (selectedPlaceId) =>
        update((state) => ({
          ...state,
          selectedPlaceId,
          openedClusterId: selectedPlaceId === null ? state.openedClusterId : null,
        })),
      openCluster: (openedClusterId) =>
        update((state) => ({
          ...state,
          openedClusterId,
          selectedPlaceId: openedClusterId === null ? state.selectedPlaceId : null,
        })),
      setHiddenLayers: (hiddenLayerIds) => update((state) => ({ ...state, hiddenLayerIds })),
      setLayerHidden: (layerId, hidden) =>
        update((state) => {
          const others = state.hiddenLayerIds.filter((id) => id !== layerId)
          return { ...state, hiddenLayerIds: hidden ? [...others, layerId] : others }
        }),
    }),
  )
}

export function selectVisiblePlaces<Place extends MapPlace>(
  state: MapState,
  places: readonly Place[],
): Place[] {
  return places.filter((place) => !place.layer || !state.hiddenLayerIds.includes(place.layer))
}

/** Places that are on a visible layer and inside the current bounds. All visible places until the bounds are known. */
export function selectPlacesInView<Place extends MapPlace>(
  state: MapState,
  places: readonly Place[],
): Place[] {
  const visible = selectVisiblePlaces(state, places)
  const { bounds } = state
  return bounds ? visible.filter((place) => boundsContains(bounds, place.position)) : visible
}
