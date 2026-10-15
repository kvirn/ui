import { createMapStore } from '@kvirn-ui/core'
import type {
  MapCluster,
  MapLayer,
  MapMarkerItem,
  AddressResult,
  ResolvedMessages,
  MapBaseMap,
  MapBounds,
  MapHandle,
  MapPlace,
  MapPlaceSource,
  MapProvider,
  MapView,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  useQuietAnnouncer,
  useMessages,
  warnAnnouncerMissing,
  warnOnce,
} from '@kvirn-ui/react/internal'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { useMapCamera } from './use-map-camera.ts'
import type { MapGestureHint, MapPanDirection, MapStatus } from './use-map-camera.ts'
import { useMapClearance } from './use-map-clearance.ts'
import { useMapPopup } from './use-map-popup.ts'
import { useMapPlaces } from './use-map-places.ts'
import type { MapIndexer } from './use-map-places.ts'

export type { MapGestureHint, MapIndexer, MapPanDirection, MapStatus }

const ADDRESS_ZOOM = 15
// A cluster centre drifts toward its members, so a radius of 64 keeps two centres about 44px (one target) apart (WCAG 2.5.8).
const DEFAULT_CLUSTER_RADIUS = 64
// More buttons than this in view is a page that struggles, whatever the engine.
const MAX_COMFORTABLE_MARKERS = 2000
const noLayers: readonly MapLayer[] = []
const noPlaces: readonly MapPlace<never>[] = []
const noHiddenLayers: readonly string[] = []

export interface UseMapOptions<Data = unknown> {
  /** The engine adapter, for example `maplibre({ style })` from `@kvirn-ui/map/maplibre`. Keep it stable. */
  provider: MapProvider
  /** The map's accessible name: `Karta över förskolor`. Yours, so it is in your language. */
  label: string
  /** The places. Keep the array stable between renders. For many places use `source`. */
  places?: readonly MapPlace<Data>[] | undefined
  /**
   * The places as columns, for tens of thousands to millions: no object exists per place until
   * one is shown. Use it instead of `places`, and keep it stable.
   */
  source?: MapPlaceSource<Data> | undefined
  /**
   * Where the cluster index is built for a large `source`: `'main'` (default) in 8 ms slices on the
   * page, or `createMapWorker` from `@kvirn-ui/map/worker` to build it in a worker. The map creates the worker when it needs one and stops it when it is done.
   */
  indexIn?: 'main' | (() => MapIndexer) | undefined
  /** Where the map starts, and where Reset returns to. */
  initialView: MapView
  /** The active base map's id. Set it to control the map type; without it the map keeps its own. */
  baseMap?: string | undefined
  /** The base map to start on when `baseMap` isn't set. Falls back to the provider's, then the first. */
  defaultBaseMap?: string | undefined
  /** Called with the id when a user picks a map type. */
  onBaseMapChange?: ((id: string) => void) | undefined
  /** The layers the places belong to, by `place.layer`. Keep the array stable. */
  layers?: readonly MapLayer[] | undefined
  /** The ids of the hidden layers. Set it to control which layers show; without it the map keeps its own. */
  hiddenLayers?: readonly string[] | undefined
  /** The layers to start hidden when `hiddenLayers` isn't set. */
  defaultHiddenLayers?: readonly string[] | undefined
  /** Called with the next hidden ids when a user toggles a layer. */
  onHiddenLayersChange?: ((ids: readonly string[]) => void) | undefined
  /** Group nearby places into clusters so markers of a layer never overlap. Default on, radius 64 CSS pixels; `false` turns it off. */
  cluster?: boolean | { radius?: number | undefined } | undefined
  /** Per-instance message overrides. */
  messages?: Partial<KvirnMessages['map']> | undefined
}

export interface UseMapResult<Data = unknown> {
  label: string
  view: MapView
  bounds: MapBounds | null
  status: MapStatus
  /** Set while the engine's wheel or one-finger gesture was ignored, until the next move or Escape. */
  gestureHint: MapGestureHint | null
  /** The provider's base maps. Fewer than two: nothing to switch. */
  baseMaps: readonly MapBaseMap[]
  /** The active base map's id, or `null` without base maps. */
  baseMap: string | null
  activeBaseMap: MapBaseMap | null
  isKeyboardHintDismissed: boolean
  /** The `places` array you gave: empty when you gave a `source`. */
  places: readonly MapPlace<Data>[]
  /** True while the cluster index of a large source is being built. Markers appear when it is done. */
  indexing: boolean
  /** The places on a visible layer. A count, not a list: nothing is materialised for it. */
  visibleCount: number
  /** The places inside the bounds, on a visible layer. */
  placesInViewCount: number
  /** The place at a position in the list of places in view (ascending source order), once it exists. */
  getPlaceInView: (index: number) => MapPlace<Data> | undefined
  /** Where a place sits in that list, or -1. */
  getPlaceInViewPosition: (placeId: string) => number
  /** A stable key for that row. */
  getPlaceInViewKey: (index: number) => string
  /** The place at a position in a cluster's list, once it exists. */
  getClusterPlace: (clusterId: string, index: number) => MapPlace<Data> | undefined
  /** How many places each layer has, by layer id. Counted once per source. */
  layerCounts: Readonly<Record<string, number>>
  /** Every place on a visible layer. Builds all of them: for a short list only, prefer `visibleCount`. */
  readonly visiblePlaces: MapPlace<Data>[]
  /** The places in view. Builds all of them: for a short list only, prefer `getPlaceInView`. */
  readonly placesInView: MapPlace<Data>[]
  /** The layers you gave, so a part can name a cluster's layer. */
  layers: readonly MapLayer[]
  hiddenLayerIds: readonly string[]
  /** The clusters and places drawn as markers: those inside the bounds, on a visible layer. */
  markersInView: MapMarkerItem<Data>[]
  /** The key of the one marker or cluster in the Tab order: a place's or a cluster's id. */
  tabStopKey: string | null
  selectedPlace: MapPlace<Data> | null
  openedCluster: MapCluster<Data> | null
  highlightedPlaceId: string | null
  activeMarkerId: string | null
  canZoomIn: boolean
  canZoomOut: boolean
  /** The engine handle once mounted: markers read `project` from it. */
  handle: MapHandle | null
  messages: ResolvedMessages<KvirnMessages['map']>
  ids: {
    summary: string
    keyboardHint: string
    details: string
    detailsTitle: string
    clusterPopup: string
    clusterPopupTitle: string
    listHeading: string
    viewport: string
  }
  /** Where the popup is portalled: an element right after the markers, set by `Map.Markers`. */
  popupSlot: HTMLElement | null
  setPopupSlot: (element: HTMLElement | null) => void
  /** False while the camera moves to a place or cluster just opened: its popup waits for it. */
  isPopupReady: boolean
  /** Ref callback for the element the engine draws into. */
  setEngineElement: (element: HTMLElement | null) => void
  markerId: (placeId: string) => string
  clusterMarkerId: (clusterId: string) => string
  rowId: (placeId: string) => string
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  /** Swaps the tiles, keeps the camera and announces the new map type. */
  setBaseMap: (id: string) => void
  pan: (direction: MapPanDirection) => void
  /** Opens a place's details. `openerId` is the element focus returns to on close. */
  select: (placeId: string, openerId?: string) => void
  close: () => void
  /** Opens a cluster's popup, or closes it with `null`. `openerId` is the element focus returns to on close. */
  openCluster: (clusterId: string | null, openerId?: string) => void
  /** Hides or shows a layer. Closes the popup of a place or cluster on it and announces the new count. */
  setLayerHidden: (layerId: string, hidden: boolean) => void
  /** Centres the map on a place or an address without moving focus (WCAG 3.2.2). */
  show: (target: MapPlace<Data> | AddressResult) => void
  setHighlightedPlaceId: (placeId: string | null) => void
  setActiveMarkerId: (placeId: string | null) => void
  dismissKeyboardHint: () => void
  /** Registers an element floating over the map; returns the function that unregisters it. */
  registerOverlay: (element: HTMLElement) => () => void
  /** For a focused marker: after the frame, pans the map just enough to clear it of the overlays. Keyboard focus only. */
  keepClear: (element: HTMLElement) => void
  /** For the viewport: the next settled view is announced, as the user pressed a key or button. */
  announceNextSettle: () => void
}

export function useMap<Data = unknown>({
  provider,
  label,
  places,
  source: sourceProp,
  indexIn = 'main',
  initialView,
  baseMap: baseMapProp,
  defaultBaseMap,
  onBaseMapChange,
  layers = noLayers,
  hiddenLayers,
  defaultHiddenLayers = noHiddenLayers,
  onHiddenLayersChange,
  cluster = true,
  messages: messageOverrides,
}: UseMapOptions<Data>): UseMapResult<Data> {
  const messages = useMessages('map', messageOverrides)
  const { announce, isAvailable } = useQuietAnnouncer()
  const baseId = useId()
  const [store] = useState(() => createMapStore({ view: initialView }))
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null)
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null)
  const [popupSlot, setPopupSlot] = useState<HTMLElement | null>(null)

  const ids = useMemo(
    () => ({
      summary: `${baseId}-summary`,
      keyboardHint: `${baseId}-keyboard-hint`,
      details: `${baseId}-details`,
      detailsTitle: `${baseId}-details-title`,
      clusterPopup: `${baseId}-cluster-popup`,
      clusterPopupTitle: `${baseId}-cluster-popup-title`,
      listHeading: `${baseId}-list-heading`,
      viewport: `${baseId}-viewport`,
    }),
    [baseId],
  )
  const markerId = useCallback((placeId: string) => `${baseId}-marker-${placeId}`, [baseId])
  const clusterMarkerId = useCallback(
    (clusterId: string) => `${baseId}-cluster-${clusterId}`,
    [baseId],
  )
  const rowId = useCallback((placeId: string) => `${baseId}-row-${placeId}`, [baseId])

  const [ownHiddenLayers, setOwnHiddenLayers] = useState(defaultHiddenLayers)
  const hiddenLayerIds = hiddenLayers ?? ownHiddenLayers
  const bounds = state.bounds

  const clusterRadius =
    cluster === false
      ? null
      : cluster === true
        ? DEFAULT_CLUSTER_RADIUS
        : (cluster.radius ?? DEFAULT_CLUSTER_RADIUS)
  const zoomStep = Math.floor(state.view.zoom)
  const selectedPlaceId = state.selectedPlaceId
  const placeState = useMapPlaces<Data>({
    places,
    source: sourceProp,
    layers,
    hiddenLayerIds,
    clusterRadius,
    indexIn,
    bounds,
    zoomStep,
    selectedPlaceId,
  })
  const { markersInView, visibleCount, placesInViewCount, indexing } = placeState
  const markerKeys = markersInView.map((item) =>
    item.type === 'place' ? item.place.id : item.cluster.id,
  )
  const tabStopKey =
    [activeMarkerId, selectedPlaceId, markerKeys[0]].find(
      (key) => key != null && markerKeys.includes(key),
    ) ?? null

  const say = useCallback(
    (text: string, key: string) => {
      if (!isAvailable) {
        warnAnnouncerMissing()
        return
      }
      announce(text, { key })
    },
    [announce, isAvailable],
  )

  const markerCount = markersInView.length
  useEffect(() => {
    if (markerCount > MAX_COMFORTABLE_MARKERS) {
      warnOnce(
        'map-many-markers',
        `Map shows ${markerCount} markers at once. Keep clustering on, or set cluster: false only on small layers (layer.cluster) so a zoomed-out map groups its places.`,
      )
    }
  }, [markerCount])

  const announcedIndexing = useRef(false)
  useEffect(() => {
    if (!indexing) {
      announcedIndexing.current = false
    } else if (!announcedIndexing.current) {
      announcedIndexing.current = true
      say(messages.indexing, `${baseId}-indexing`)
    }
  }, [indexing, say, messages, baseId])

  const { moveTo, ...camera } = useMapCamera({
    store,
    view: state.view,
    bounds: state.bounds,
    provider,
    initialView,
    baseMap: baseMapProp,
    defaultBaseMap,
    onBaseMapChange,
    messages,
    say,
    baseId,
    placesInViewCount,
    visibleCount,
  })
  const popup = useMapPopup<Data>({
    store,
    view: state.view,
    selectedPlaceId,
    openedClusterId: state.openedClusterId,
    findPlace: placeState.findPlace,
    getCluster: placeState.getCluster,
    hiddenLayerIds,
    handle: camera.handle,
    moveTo,
    ids,
  })

  const clearance = useMapClearance({
    handle: camera.handle,
    viewportId: ids.viewport,
    moveTo,
  })

  return {
    label,
    view: state.view,
    bounds: state.bounds,
    ...camera,
    ...popup,
    ...clearance,
    places: places ?? noPlaces,
    indexing,
    visibleCount,
    placesInViewCount,
    getPlaceInView: placeState.getPlaceInView,
    getPlaceInViewPosition: placeState.getPlaceInViewPosition,
    getPlaceInViewKey: placeState.getPlaceInViewKey,
    getClusterPlace: placeState.getClusterPlace,
    layerCounts: placeState.layerCounts,
    get visiblePlaces() {
      return placeState.getVisiblePlaces()
    },
    get placesInView() {
      return placeState.getPlacesInView()
    },
    layers,
    hiddenLayerIds,
    markersInView,
    tabStopKey,
    highlightedPlaceId,
    activeMarkerId,
    messages,
    ids,
    popupSlot,
    setPopupSlot,
    markerId,
    clusterMarkerId,
    rowId,
    setLayerHidden: (layerId, hidden) => {
      if (hiddenLayerIds.includes(layerId) === hidden) {
        return
      }
      const next = hidden
        ? [...hiddenLayerIds, layerId]
        : hiddenLayerIds.filter((id) => id !== layerId)
      if (hiddenLayers === undefined) {
        setOwnHiddenLayers(next)
      }
      onHiddenLayersChange?.(next)
      camera.announceNextSettle()
    },
    show: (target) => {
      const position = target.position
      if ('bounds' in target && target.bounds && camera.handle) {
        camera.handle.fitBounds(target.bounds)
      } else {
        moveTo({ center: position, zoom: Math.max(state.view.zoom, ADDRESS_ZOOM) })
      }
      if ('name' in target) {
        store.actions.selectPlace(target.id)
      }
    },
    setHighlightedPlaceId,
    setActiveMarkerId,
  }
}
