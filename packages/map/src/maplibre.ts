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
import { Map as MapLibreMap, setWorkerUrl, type StyleSpecification } from 'maplibre-gl'

export interface MapLibreBaseMap extends MapBaseMap {
  /** A style document or the URL of one. */
  style: string | StyleSpecification
}

interface MapLibreCommonOptions {
  /**
   * The URL of `maplibre-gl/dist/maplibre-gl-worker.mjs`. A bundler that pre-bundles dependencies
   * (Vite dev) moves the engine away from its worker, so pass it: in Vite
   * `import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'`.
   */
  workerUrl?: string
  /** Attribution the style's sources don't already carry. KvirnUI renders attribution itself. */
  attribution?: string
}

export interface MapLibreSingleOptions extends MapLibreCommonOptions {
  /** A style document or the URL of one. There is no default: the adopter chooses the tile source. */
  style: string | StyleSpecification
}

export interface MapLibreBaseMapsOptions extends MapLibreCommonOptions {
  /** The map types the visitor can switch between: `Map.BaseMapSwitch` lists them. */
  baseMaps: readonly MapLibreBaseMap[]
  /** The id to start with. Default: the first. */
  defaultBaseMap?: string
}

export type MapLibreOptions = MapLibreSingleOptions | MapLibreBaseMapsOptions

const readView = (map: MapLibreMap): MapView => {
  const center = map.getCenter()
  return {
    center: { longitude: normalizeLongitude(center.lng), latitude: clampLatitude(center.lat) },
    zoom: map.getZoom(),
  }
}

export interface RasterStyleOptions {
  /** URL templates with `{z}`, `{x}` and `{y}`, from your tile host. The library names none. */
  tiles: string[]
  tileSize?: number
  minzoom?: number
  maxzoom?: number
  /** The source's licence text, plain. Render it with links in `Map.Attribution`. */
  attribution: string
}

/** A style with one raster source from your tile URLs, for `maplibre({ style })`. */
export function rasterStyle({
  tiles,
  tileSize = 256,
  minzoom,
  maxzoom,
  attribution,
}: RasterStyleOptions): StyleSpecification {
  return {
    version: 8,
    sources: {
      tiles: {
        type: 'raster',
        tiles,
        tileSize,
        attribution,
        ...(minzoom === undefined ? {} : { minzoom }),
        ...(maxzoom === undefined ? {} : { maxzoom }),
      },
    },
    layers: [{ id: 'tiles', type: 'raster', source: 'tiles' }],
  }
}

export function maplibre(options: MapLibreOptions): MapProvider {
  const baseMaps = 'baseMaps' in options ? options.baseMaps : []
  const defaultBaseMap = 'baseMaps' in options ? options.defaultBaseMap : undefined
  const styleOf = (id: string | undefined) =>
    'baseMaps' in options
      ? (baseMaps.find((baseMap) => baseMap.id === id) ?? baseMaps[0])?.style
      : options.style

  return {
    baseMaps: baseMaps.map(({ id, label, attribution }) => ({
      id,
      label,
      ...(attribution === undefined ? {} : { attribution }),
    })),
    ...(defaultBaseMap === undefined ? {} : { defaultBaseMap }),
    mount(container, { view, baseMap, signal }) {
      if (options.workerUrl) setWorkerUrl(options.workerUrl)
      const map = new MapLibreMap({
        container,
        style: styleOf(baseMap ?? defaultBaseMap) as string | StyleSpecification,
        center: [view.center.longitude, view.center.latitude],
        zoom: view.zoom,
        attributionControl: false,
        // The viewport owns the keyboard, the camera and the announcements.
        keyboard: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        // One finger scrolls the page and the wheel zooms only with Ctrl or Command (WCAG 1.4.10, 2.5.1).
        cooperativeGestures: true,
      })
      map.touchZoomRotate.disableRotation()

      const canvas = map.getCanvas()
      canvas.setAttribute('aria-hidden', 'true')
      canvas.tabIndex = -1
      // The engine's overlay text is English only: the viewport shows KvirnUI's own hint.
      const engineHint = container.querySelector<HTMLElement>(
        '.maplibregl-cooperative-gesture-screen',
      )
      if (engineHint) engineHint.style.display = 'none'

      const engineEvents: Record<Exclude<MapProviderEventName, 'gesture'>, string> = {
        move: 'move',
        moveend: 'moveend',
        error: 'error',
        tilesloaded: 'idle',
      }

      const handle: MapHandle = {
        setView: (next) =>
          map.jumpTo({
            center: [next.center.longitude, next.center.latitude],
            zoom: next.zoom,
          }),
        getView: () => readView(map),
        getSize: () => {
          const { clientWidth, clientHeight } = container
          return { width: clientWidth, height: clientHeight }
        },
        getBounds: () => boundsOfView(readView(map), handle.getSize()),
        fitBounds: (bounds, fitOptions) =>
          map.fitBounds(
            [
              [bounds.west, bounds.south],
              [bounds.east, bounds.north],
            ],
            { padding: fitOptions?.padding ?? 0, animate: false },
          ),
        setBaseMap: (id) => {
          const style = baseMaps.find((candidate) => candidate.id === id)?.style
          if (style !== undefined) map.setStyle(style)
        },
        project: (position) => {
          const point = map.project([position.longitude, position.latitude])
          return { x: point.x, y: point.y }
        },
        unproject: (point) => {
          const position = map.unproject([point.x, point.y])
          return { longitude: position.lng, latitude: position.lat }
        },
        on: <Name extends MapProviderEventName>(
          name: Name,
          listener: (payload: MapProviderEvents[Name]) => void,
        ) => {
          if (name === 'gesture') {
            const gestureListener = (event: { gestureType: string }) =>
              listener((event.gestureType === 'wheel_zoom' ? 'wheel' : 'touch') as never)
            map.on('cooperativegestureprevented', gestureListener)
            return () => {
              map.off('cooperativegestureprevented', gestureListener)
            }
          }
          const engineListener = (event: unknown) => {
            if (name === 'error') {
              const error = (event as { error?: unknown }).error
              listener((error instanceof Error ? error : new Error(String(error))) as never)
            } else if (name === 'tilesloaded') {
              listener(undefined as never)
            } else {
              listener(readView(map) as never)
            }
          }
          const engineName = engineEvents[name as keyof typeof engineEvents]
          map.on(engineName as 'move', engineListener)
          return () => {
            map.off(engineName as 'move', engineListener)
          }
        },
        destroy: () => map.remove(),
      }

      signal?.addEventListener('abort', handle.destroy, { once: true })
      return handle
    },
  }
}
