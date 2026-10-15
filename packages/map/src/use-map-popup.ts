import { MAX_ZOOM, viewWithPositionAt } from '@kvirn-ui/core'
import type { LngLat, MapCluster, MapHandle, MapPlace, MapStore, MapView } from '@kvirn-ui/core'
import { useEffect, useRef, useState } from 'react'

// Where an opened place or cluster sits in the viewport, so its popup has room above it (map.md, Details).
const OPENED_BLOCK_FRACTION = 0.85
// Opening a place zooms in to at least here, so it is shown apart from its neighbours.
const PLACE_ZOOM = 12
const DEFAULT_MOVE_MILLISECONDS = 240

/** The view animates only under no-preference and while the app has not chosen reduced motion (DESIGN.md, Map view motion). */
export function readMoveAnimation(): { animate: boolean; duration: number } {
  const allowed =
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches &&
    document.documentElement.dataset.kvMotion !== 'reduce'
  const token = getComputedStyle(document.documentElement)
    .getPropertyValue('--kv-duration-slow')
    .trim()
  const parsed = Number.parseFloat(token)
  const duration = Number.isFinite(parsed)
    ? token.endsWith('ms')
      ? parsed
      : parsed * 1000
    : DEFAULT_MOVE_MILLISECONDS
  return { animate: allowed, duration }
}

export interface UseMapPopupOptions<Data> {
  store: MapStore
  view: MapView
  selectedPlaceId: string | null
  openedClusterId: string | null
  findPlace: (placeId: string) => MapPlace<Data> | undefined
  /** A cluster at the current zoom step, in view or not: a pan never closes a popup. */
  getCluster: (clusterId: string) => MapCluster<Data> | null
  hiddenLayerIds: readonly string[]
  handle: MapHandle | null
  moveTo: (view: MapView, motion?: { animate: boolean; duration: number }) => void
  ids: { detailsTitle: string; clusterPopupTitle: string; listHeading: string; viewport: string }
}

export function useMapPopup<Data>({
  store,
  view,
  selectedPlaceId,
  openedClusterId,
  findPlace,
  getCluster,
  hiddenLayerIds,
  handle,
  moveTo,
  ids,
}: UseMapPopupOptions<Data>) {
  const [isPopupReady, setPopupReady] = useState(true)
  const readyTimer = useRef<number | null>(null)
  const openerId = useRef<string | null>(null)
  const focusPopupOnOpen = useRef(false)
  const openedClusterLayer = useRef<string | undefined>(undefined)
  const selectedPlace = selectedPlaceId === null ? null : (findPlace(selectedPlaceId) ?? null)
  const openedCluster = openedClusterId === null ? null : getCluster(openedClusterId)

  useEffect(() => {
    if (selectedPlaceId !== null || openedClusterId !== null) {
      if (focusPopupOnOpen.current && isPopupReady) {
        const titleId = selectedPlaceId !== null ? ids.detailsTitle : ids.clusterPopupTitle
        document.getElementById(titleId)?.focus()
        focusPopupOnOpen.current = false
      }
      return
    }
    focusPopupOnOpen.current = false
    const opener = openerId.current
    if (opener === null) {
      return
    }
    openerId.current = null
    const target =
      document.getElementById(opener) ??
      document.getElementById(ids.listHeading) ??
      document.getElementById(ids.viewport)
    target?.focus()
  }, [
    selectedPlaceId,
    openedClusterId,
    isPopupReady,
    ids.detailsTitle,
    ids.clusterPopupTitle,
    ids.listHeading,
    ids.viewport,
  ])

  // A popup whose place or cluster is gone closes. When a layer was hidden, focus is already on its
  // checkbox and stays there, so the opener is forgotten.
  useEffect(() => {
    const isHidden = (layer: string | undefined) =>
      layer !== undefined && hiddenLayerIds.includes(layer)
    if (selectedPlace && isHidden(selectedPlace.layer)) {
      openerId.current = null
      store.actions.selectPlace(null)
    }
    if (openedClusterId !== null && openedCluster === null) {
      if (isHidden(openedClusterLayer.current)) {
        openerId.current = null
      }
      store.actions.openCluster(null)
    }
  }, [store, selectedPlace, openedClusterId, openedCluster, hiddenLayerIds])

  useEffect(
    () => () => {
      if (readyTimer.current !== null) window.clearTimeout(readyTimer.current)
    },
    [],
  )

  const clearReadyTimer = () => {
    if (readyTimer.current !== null) {
      window.clearTimeout(readyTimer.current)
      readyTimer.current = null
    }
  }

  // Puts the opened place or cluster low in the viewport and holds its popup until the camera is there.
  const moveLow = (position: LngLat | undefined, zoom: number) => {
    clearReadyTimer()
    if (!position || !handle) {
      setPopupReady(true)
      return
    }
    const motion = readMoveAnimation()
    moveTo(
      viewWithPositionAt(position, zoom, handle.getSize(), { x: 0.5, y: OPENED_BLOCK_FRACTION }),
      motion,
    )
    if (!motion.animate) {
      setPopupReady(true)
      return
    }
    setPopupReady(false)
    readyTimer.current = window.setTimeout(() => {
      readyTimer.current = null
      setPopupReady(true)
    }, motion.duration + 60)
  }

  return {
    selectedPlace,
    openedCluster,
    isPopupReady,
    select: (placeId: string, opener?: string) => {
      openerId.current = opener ?? null
      focusPopupOnOpen.current = true
      const place = findPlace(placeId)
      moveLow(place?.position, Math.min(MAX_ZOOM, Math.max(view.zoom, PLACE_ZOOM)))
      store.actions.selectPlace(placeId)
    },
    close: () => store.actions.selectPlace(null),
    openCluster: (clusterId: string | null, opener?: string) => {
      if (clusterId === null) {
        store.actions.openCluster(null)
        return
      }
      openerId.current = opener ?? null
      focusPopupOnOpen.current = true
      const cluster = getCluster(clusterId)
      openedClusterLayer.current = cluster?.layer
      // Same zoom: the cluster's id belongs to this zoom step, so it must not change.
      moveLow(cluster?.position, view.zoom)
      store.actions.openCluster(clusterId)
    },
  }
}
