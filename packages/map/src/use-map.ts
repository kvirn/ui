import {
  MAX_ZOOM,
  MIN_ZOOM,
  createMapStore,
  panBy,
  selectPlacesInView,
  selectVisiblePlaces,
  zoomBy,
} from '@kvirn-ui/core'
import type {
  AddressResult,
  ResolvedMessages,
  MapBaseMap,
  MapBounds,
  MapHandle,
  MapPlace,
  MapProvider,
  MapView,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useQuietAnnouncer, useMessages, warnAnnouncerMissing } from '@kvirn-ui/react/internal'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

export type MapPanDirection = 'north' | 'south' | 'east' | 'west'
export type MapStatus = 'loading' | 'ready' | 'failed'
export type MapGestureHint = 'touch' | 'wheel'

const panFractions: Record<MapPanDirection, { x: number; y: number }> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
}
// A quarter of the viewport's shorter side per press (map.md §7).
const PAN_STEP = 0.25
const SETTLE_MILLISECONDS = 500
const ADDRESS_ZOOM = 15
const noBaseMaps: readonly MapBaseMap[] = []

export interface UseMapOptions {
  /** The engine adapter, for example `maplibre({ style })` from `@kvirn-ui/map/maplibre`. Keep it stable. */
  provider: MapProvider
  /** The map's accessible name: `Karta över förskolor`. Yours, so it is in your language. */
  label: string
  /** The places. Keep the array stable between renders. */
  places?: readonly MapPlace[] | undefined
  /** Where the map starts, and where Reset returns to. */
  initialView: MapView
  /** The active base map's id. Set it to control the map type; without it the map keeps its own. */
  baseMap?: string | undefined
  /** The base map to start on when `baseMap` isn't set. Falls back to the provider's, then the first. */
  defaultBaseMap?: string | undefined
  /** Called with the id when a user picks a map type. */
  onBaseMapChange?: ((id: string) => void) | undefined
  /** Per-instance message overrides. */
  messages?: Partial<KvirnMessages['map']> | undefined
}

export interface UseMapResult {
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
  places: readonly MapPlace[]
  visiblePlaces: MapPlace[]
  placesInView: MapPlace[]
  selectedPlace: MapPlace | null
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
    listHeading: string
  }
  /** Ref callback for the element the engine draws into. */
  engineRef: (element: HTMLElement | null) => void
  markerId: (placeId: string) => string
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
  /** Centres the map on a place or an address without moving focus (WCAG 3.2.2). */
  show: (target: MapPlace | AddressResult) => void
  setHighlightedPlaceId: (placeId: string | null) => void
  setActiveMarkerId: (placeId: string | null) => void
  dismissKeyboardHint: () => void
  /** For the viewport: the next settled view is announced, as the user pressed a key or button. */
  announceNextSettle: () => void
}

export function useMap({
  provider,
  label,
  places = [],
  initialView,
  baseMap: baseMapProp,
  defaultBaseMap,
  onBaseMapChange,
  messages: messageOverrides,
}: UseMapOptions): UseMapResult {
  const messages = useMessages('map', messageOverrides)
  const { announce, isAvailable } = useQuietAnnouncer()
  const baseId = useId()
  const [store] = useState(() => createMapStore({ view: initialView }))
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)
  const [engineContainer, setEngineContainer] = useState<HTMLElement | null>(null)
  const [handle, setHandle] = useState<MapHandle | null>(null)
  const [status, setStatus] = useState<MapStatus>('loading')
  const baseMaps = provider.baseMaps ?? noBaseMaps
  const fallbackBaseMap = provider.defaultBaseMap ?? baseMaps[0]?.id ?? null
  const [ownBaseMap, setOwnBaseMap] = useState<string | null>(defaultBaseMap ?? null)
  const requestedBaseMap = baseMapProp ?? ownBaseMap
  const baseMap =
    requestedBaseMap !== null && baseMaps.some((candidate) => candidate.id === requestedBaseMap)
      ? requestedBaseMap
      : fallbackBaseMap
  const baseMapRef = useRef(baseMap)
  const appliedBaseMap = useRef(baseMap)
  const [gestureHint, setGestureHint] = useState<MapGestureHint | null>(null)
  const [isKeyboardHintDismissed, setKeyboardHintDismissed] = useState(false)
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null)
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null)

  const initialViewRef = useRef(initialView)
  const openerId = useRef<string | null>(null)
  const focusDetailsOnOpen = useRef(false)
  const announceOnSettle = useRef(false)

  const ids = useMemo(
    () => ({
      summary: `${baseId}-summary`,
      keyboardHint: `${baseId}-keyboard-hint`,
      details: `${baseId}-details`,
      detailsTitle: `${baseId}-details-title`,
      listHeading: `${baseId}-list-heading`,
    }),
    [baseId],
  )
  const markerId = useCallback((placeId: string) => `${baseId}-marker-${placeId}`, [baseId])
  const rowId = useCallback((placeId: string) => `${baseId}-row-${placeId}`, [baseId])

  const visiblePlaces = useMemo(() => selectVisiblePlaces(state, places), [state, places])
  const placesInView = useMemo(() => selectPlacesInView(state, places), [state, places])
  const selectedPlace = places.find((place) => place.id === state.selectedPlaceId) ?? null

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

  useEffect(() => {
    if (engineContainer === null) {
      return
    }
    const controller = new AbortController()
    const mounted = provider.mount(engineContainer, {
      view: store.getState().view,
      ...(baseMapRef.current === null ? {} : { baseMap: baseMapRef.current }),
      signal: controller.signal,
    })
    const sync = (view: MapView) => {
      store.actions.setView(view)
      store.actions.setBounds(mounted.getBounds())
    }
    const unsubscribers = [
      mounted.on('move', sync),
      mounted.on('moveend', (view) => {
        sync(view)
        setGestureHint(null)
      }),
      mounted.on('tilesloaded', () => setStatus('ready')),
      mounted.on('error', () => setStatus('failed')),
      mounted.on('gesture', setGestureHint),
    ]
    sync(mounted.getView())
    setHandle(mounted)
    return () => {
      for (const unsubscribe of unsubscribers) unsubscribe()
      controller.abort()
      setHandle(null)
      setStatus('loading')
    }
  }, [provider, engineContainer, store])

  const placesInViewCount = placesInView.length
  const visibleCount = visiblePlaces.length
  useEffect(() => {
    if (!announceOnSettle.current) {
      return
    }
    const timer = window.setTimeout(() => {
      announceOnSettle.current = false
      say(
        placesInViewCount === visibleCount
          ? messages.placesAll({ count: visibleCount })
          : messages.placesInView({ count: placesInViewCount }),
        `${baseId}-view`,
      )
    }, SETTLE_MILLISECONDS)
    return () => window.clearTimeout(timer)
  }, [state.view, state.bounds, placesInViewCount, visibleCount, messages, say, baseId])

  useEffect(() => {
    if (status === 'failed') {
      say(messages.tilesFailedTitle, `${baseId}-failed`)
    }
  }, [status, messages, say, baseId])

  useEffect(() => {
    if (baseMap === null || baseMap === appliedBaseMap.current) {
      return
    }
    appliedBaseMap.current = baseMap
    baseMapRef.current = baseMap
    handle?.setBaseMap(baseMap)
    const next = baseMaps.find((candidate) => candidate.id === baseMap)
    if (next !== undefined) {
      say(messages.baseMapChanged({ label: next.label }), `${baseId}-base-map`)
    }
  }, [baseMap, baseMaps, handle, messages, say, baseId])

  const selectedPlaceId = state.selectedPlaceId
  useEffect(() => {
    if (selectedPlaceId !== null) {
      if (focusDetailsOnOpen.current) {
        document.getElementById(ids.detailsTitle)?.focus()
      }
      focusDetailsOnOpen.current = false
      return
    }
    const opener = openerId.current
    if (opener === null) {
      return
    }
    openerId.current = null
    const target = document.getElementById(opener) ?? document.getElementById(ids.listHeading)
    target?.focus()
  }, [selectedPlaceId, ids.detailsTitle, ids.listHeading])

  const moveTo = (view: MapView) => {
    if (handle) {
      handle.setView(view)
    } else {
      store.actions.setView(view)
    }
  }

  const zoomBounded = (delta: number) => {
    announceOnSettle.current = true
    const atLimit = delta > 0 ? state.view.zoom >= MAX_ZOOM : state.view.zoom <= MIN_ZOOM
    if (atLimit) {
      announceOnSettle.current = false
      say(delta > 0 ? messages.zoomLimitIn : messages.zoomLimitOut, `${baseId}-limit`)
      return
    }
    moveTo(zoomBy(state.view, delta))
  }

  return {
    label,
    view: state.view,
    bounds: state.bounds,
    status,
    gestureHint,
    baseMaps,
    baseMap,
    activeBaseMap: baseMaps.find((candidate) => candidate.id === baseMap) ?? null,
    isKeyboardHintDismissed,
    places,
    visiblePlaces,
    placesInView,
    selectedPlace,
    highlightedPlaceId,
    activeMarkerId,
    canZoomIn: state.view.zoom < MAX_ZOOM,
    canZoomOut: state.view.zoom > MIN_ZOOM,
    handle,
    messages,
    ids,
    engineRef: setEngineContainer,
    markerId,
    rowId,
    zoomIn: () => zoomBounded(1),
    zoomOut: () => zoomBounded(-1),
    reset: () => {
      announceOnSettle.current = true
      moveTo(initialViewRef.current)
    },
    setBaseMap: (id) => {
      if (id === baseMap || !baseMaps.some((candidate) => candidate.id === id)) {
        return
      }
      if (baseMapProp === undefined) {
        setOwnBaseMap(id)
      }
      onBaseMapChange?.(id)
    },
    pan: (direction) => {
      announceOnSettle.current = true
      const size = handle?.getSize() ?? { width: 800, height: 600 }
      const shorter = Math.min(size.width, size.height)
      const fraction = panFractions[direction]
      moveTo(
        panBy(
          state.view,
          {
            x: (fraction.x * PAN_STEP * shorter) / size.width,
            y: (fraction.y * PAN_STEP * shorter) / size.height,
          },
          size,
        ),
      )
    },
    select: (placeId, opener) => {
      openerId.current = opener ?? null
      focusDetailsOnOpen.current = true
      store.actions.selectPlace(placeId)
    },
    close: () => store.actions.selectPlace(null),
    show: (target) => {
      const position = target.position
      if ('bounds' in target && target.bounds && handle) {
        handle.fitBounds(target.bounds)
      } else {
        moveTo({ center: position, zoom: Math.max(state.view.zoom, ADDRESS_ZOOM) })
      }
      if ('name' in target) {
        store.actions.selectPlace(target.id)
      }
    },
    setHighlightedPlaceId,
    setActiveMarkerId,
    dismissKeyboardHint: () => {
      setKeyboardHintDismissed(true)
      setGestureHint(null)
    },
    announceNextSettle: () => {
      announceOnSettle.current = true
    },
  }
}
