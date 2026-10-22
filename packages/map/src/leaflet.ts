'use client'

import {
  boundsOfView,
  clampLatitude,
  normalizeLongitude,
  type MapBaseMap,
  type MapHandle,
  type MapProvider,
  type MapProviderEventName,
  type MapProviderEvents,
  type MapView,
} from '@kvirn-ui/core'
import {
  map as createMap,
  tileLayer,
  type LeafletMap,
  type LeafletEvent,
  type TileLayer,
} from 'leaflet'

interface LeafletTiles {
  /** A URL template with `{z}`, `{x}` and `{y}` (and `{s}` with `subdomains`), from your tile host. The library names none. */
  tiles: string
  /** 256 (the default) or 512. */
  tileSize?: 256 | 512
  minzoom?: number
  maxzoom?: number
  subdomains?: string | string[]
}

export interface LeafletBaseMap extends MapBaseMap, LeafletTiles {}

export interface LeafletSingleOptions extends LeafletTiles {}

export interface LeafletBaseMapsOptions {
  /** The map types the visitor can switch between: `Map.BaseMapSwitch` lists them. */
  baseMaps: readonly LeafletBaseMap[]
  /** The id to start with. Default: the first. */
  defaultBaseMap?: string
}

export type LeafletOptions = LeafletSingleOptions | LeafletBaseMapsOptions

// The shared camera counts zoom from a 512px world (as the core's geometry does), Leaflet from 256px.
const zoomOffset = 1
const wheelZoomPerPixel = 1 / 120

const readView = (map: LeafletMap): MapView => {
  const center = map.getCenter()
  return {
    center: { longitude: normalizeLongitude(center.lng), latitude: clampLatitude(center.lat) },
    zoom: map.getZoom() - zoomOffset,
  }
}

const createTileLayer = ({ tiles, tileSize = 256, minzoom, maxzoom, subdomains }: LeafletTiles) =>
  tileLayer(tiles, {
    tileSize,
    zoomOffset: tileSize === 512 ? -1 : 0,
    ...(minzoom === undefined ? {} : { minZoom: minzoom + zoomOffset }),
    ...(maxzoom === undefined ? {} : { maxZoom: maxzoom + zoomOffset }),
    ...(subdomains === undefined ? {} : { subdomains }),
  })

export function leaflet(options: LeafletOptions): MapProvider {
  const baseMaps = 'baseMaps' in options ? options.baseMaps : []
  const defaultBaseMap = 'baseMaps' in options ? options.defaultBaseMap : undefined
  const tilesOf = (id: string | undefined): LeafletTiles | undefined =>
    'baseMaps' in options ? (baseMaps.find((baseMap) => baseMap.id === id) ?? baseMaps[0]) : options

  return {
    baseMaps: baseMaps.map(({ id, label, attribution }) => ({
      id,
      ...(label === undefined ? {} : { label }),
      ...(attribution === undefined ? {} : { attribution }),
    })),
    ...(defaultBaseMap === undefined ? {} : { defaultBaseMap }),
    mount(container, { view, baseMap, signal }) {
      const map = createMap(container, {
        center: [view.center.latitude, view.center.longitude],
        zoom: view.zoom + zoomOffset,
        zoomSnap: 0,
        zoomControl: false,
        attributionControl: false,
        // The viewport owns the keyboard, the camera and the announcements.
        keyboard: false,
        // Dragging, the wheel and the double click are below, so one finger and the bare wheel
        // leave the page scrolling (WCAG 1.4.10, 2.5.1).
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        tapHold: false,
        touchZoom: true,
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
        inertia: false,
      })

      const mapPane = map.getPanes().mapPane
      mapPane.setAttribute('aria-hidden', 'true')
      container.style.touchAction = 'pan-x pan-y'

      const listeners = new Map<MapProviderEventName, Set<(payload: never) => void>>()
      const emit = <Name extends MapProviderEventName>(
        name: Name,
        payload: MapProviderEvents[Name],
      ) => {
        for (const listener of listeners.get(name) ?? []) listener(payload as never)
      }

      let tiles: TileLayer | undefined
      const onTilesLoaded = () => emit('tilesloaded', undefined)
      const onTileError = (event: LeafletEvent) => {
        const error = event.error
        emit('error', error instanceof Error ? error : new Error('A map tile failed to load.'))
      }
      const showBaseMap = (id: string | undefined) => {
        const next = tilesOf(id)
        if (!next) return
        tiles?.off('load', onTilesLoaded).off('tileerror', onTileError).remove()
        tiles = createTileLayer(next).on('load', onTilesLoaded).on('tileerror', onTileError)
        tiles.addTo(map)
      }
      showBaseMap(baseMap ?? defaultBaseMap)

      const onWheel = (event: WheelEvent) => {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          const lines = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 40 : 1
          map.setZoomAround(
            map.mouseEventToContainerPoint(event),
            map.getZoom() - event.deltaY * lines * wheelZoomPerPixel,
            { animate: false },
          )
        } else {
          emit('gesture', 'wheel')
        }
      }

      let dragPointer: { id: number; x: number; y: number } | undefined
      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === 'touch' || event.button !== 0) return
        dragPointer = { id: event.pointerId, x: event.clientX, y: event.clientY }
        container.setPointerCapture(event.pointerId)
      }
      const onPointerMove = (event: PointerEvent) => {
        if (dragPointer?.id !== event.pointerId) return
        map.panBy([dragPointer.x - event.clientX, dragPointer.y - event.clientY], {
          animate: false,
        })
        dragPointer = { id: event.pointerId, x: event.clientX, y: event.clientY }
      }
      const onPointerEnd = (event: PointerEvent) => {
        if (dragPointer?.id === event.pointerId) dragPointer = undefined
      }

      let touchAnnounced = false
      const onTouchMove = (event: TouchEvent) => {
        if (event.touches.length !== 1 || touchAnnounced) return
        touchAnnounced = true
        emit('gesture', 'touch')
      }
      const onTouchEnd = (event: TouchEvent) => {
        if (event.touches.length === 0) touchAnnounced = false
      }

      container.addEventListener('wheel', onWheel, { passive: false })
      container.addEventListener('pointerdown', onPointerDown)
      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerup', onPointerEnd)
      container.addEventListener('pointercancel', onPointerEnd)
      container.addEventListener('touchmove', onTouchMove, { passive: true })
      container.addEventListener('touchend', onTouchEnd)
      container.addEventListener('touchcancel', onTouchEnd)

      for (const name of ['move', 'moveend'] as const) {
        map.on(name, () => emit(name, readView(map)))
      }

      let destroyed = false
      const handle: MapHandle = {
        setView: (next, moveOptions) => {
          map.setView(
            [next.center.latitude, next.center.longitude],
            next.zoom + zoomOffset,
            moveOptions?.animate
              ? { animate: true, duration: (moveOptions.duration ?? 240) / 1000 }
              : { animate: false },
          )
        },
        getView: () => readView(map),
        getSize: () => {
          const { clientWidth, clientHeight } = container
          return { width: clientWidth, height: clientHeight }
        },
        getBounds: () => boundsOfView(readView(map), handle.getSize()),
        fitBounds: (bounds, fitOptions) => {
          const padding = fitOptions?.padding ?? 0
          const east = bounds.west > bounds.east ? bounds.east + 360 : bounds.east
          map.fitBounds(
            [
              [bounds.south, bounds.west],
              [bounds.north, east],
            ],
            { padding: [padding, padding], animate: false },
          )
        },
        setBaseMap: (id) => {
          if (baseMaps.some((candidate) => candidate.id === id)) showBaseMap(id)
        },
        project: (position) => {
          const point = map.latLngToContainerPoint([position.latitude, position.longitude])
          return { x: point.x, y: point.y }
        },
        unproject: (point) => {
          const position = map.containerPointToLatLng([point.x, point.y])
          return { longitude: position.lng, latitude: position.lat }
        },
        on: <Name extends MapProviderEventName>(
          name: Name,
          listener: (payload: MapProviderEvents[Name]) => void,
        ) => {
          const set = listeners.get(name) ?? new Set()
          listeners.set(name, set)
          set.add(listener as (payload: never) => void)
          return () => {
            set.delete(listener as (payload: never) => void)
          }
        },
        destroy: () => {
          if (destroyed) return
          destroyed = true
          container.removeEventListener('wheel', onWheel)
          container.removeEventListener('pointerdown', onPointerDown)
          container.removeEventListener('pointermove', onPointerMove)
          container.removeEventListener('pointerup', onPointerEnd)
          container.removeEventListener('pointercancel', onPointerEnd)
          container.removeEventListener('touchmove', onTouchMove)
          container.removeEventListener('touchend', onTouchEnd)
          container.removeEventListener('touchcancel', onTouchEnd)
          listeners.clear()
          map.remove()
        },
      }

      signal?.addEventListener('abort', handle.destroy, { once: true })
      return handle
    },
  }
}
