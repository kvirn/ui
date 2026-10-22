'use client'

import {
  boundsOfView,
  clampLatitude,
  normalizeLongitude,
  type LngLat,
  type MapBaseMap,
  type MapHandle,
  type MapProvider,
  type MapProviderEventName,
  type MapProviderEvents,
  type MapView,
} from '@kvirn-ui/core'

export type GoogleMapTypeId = 'roadmap' | 'satellite' | 'terrain' | 'hybrid'

interface GoogleLatLng {
  lat: () => number
  lng: () => number
}

interface GoogleListener {
  remove: () => void
}

interface GoogleMap {
  getCenter: () => GoogleLatLng | undefined
  getZoom: () => number | undefined
  moveCamera: (camera: { center: { lat: number; lng: number }; zoom: number }) => void
  panTo: (center: { lat: number; lng: number }) => void
  fitBounds: (
    bounds: { east: number; north: number; south: number; west: number },
    padding?: number,
  ) => void
  setMapTypeId: (id: string) => void
  addListener: (event: string, listener: () => void) => GoogleListener
}

/** The part of `google.maps` the adapter uses: what `await google.maps.importLibrary('maps')` returns. */
export interface GoogleMapsApi {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => GoogleMap
}

export interface GoogleBaseMap extends MapBaseMap {
  mapTypeId: GoogleMapTypeId
}

interface GoogleCommonOptions {
  /**
   * Resolves the Google Maps API when the map mounts, never before. Load the SDK yourself
   * (your script tag or `@googlemaps/js-api-loader`) and return
   * `google.maps.importLibrary('maps')`. Set this or `apiKey`.
   */
  loader?: () => Promise<GoogleMapsApi>
  /**
   * Your Maps JavaScript API key. The adapter then adds Google's script tag when the map mounts
   * (`https://maps.googleapis.com/maps/api/js`), which sends the visitor's address to Google
   * and may set cookies: your consent and privacy text covers that.
   */
  apiKey?: string
  /** A Cloud-based map style id. A vector map (fractional zoom) needs one. */
  mapId?: string
}

export interface GoogleSingleOptions extends GoogleCommonOptions {
  mapTypeId?: GoogleMapTypeId
}

export interface GoogleBaseMapsOptions extends GoogleCommonOptions {
  baseMaps: readonly GoogleBaseMap[]
  /** The id to start with. Default: the first. */
  defaultBaseMap?: string
}

export type GoogleOptions = GoogleSingleOptions | GoogleBaseMapsOptions

// The shared camera counts zoom from a 512px world (as the core's geometry does), Google from 256px.
const zoomOffset = 1
const worldSize = (zoom: number) => 512 * 2 ** zoom
const radians = (degrees: number) => (degrees * Math.PI) / 180

const worldPoint = ({ longitude, latitude }: LngLat, zoom: number) => {
  const sine = Math.sin(radians(clampLatitude(latitude)))
  return {
    x: ((longitude + 180) / 360) * worldSize(zoom),
    y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * worldSize(zoom),
  }
}

const unprojectWorld = (x: number, y: number, zoom: number): LngLat => ({
  longitude: (x / worldSize(zoom)) * 360 - 180,
  latitude: (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / worldSize(zoom)))) * 180) / Math.PI,
})

const loadScript = (apiKey: string): Promise<GoogleMapsApi> =>
  new Promise((resolve, reject) => {
    const callbackName = `__kvirnGoogleMaps${Date.now().toString(36)}`
    const scope = globalThis as unknown as Record<string, unknown>
    scope[callbackName] = () => {
      delete scope[callbackName]
      const maps = (
        scope.google as { maps: { importLibrary: (name: 'maps') => Promise<GoogleMapsApi> } }
      ).maps
      maps.importLibrary('maps').then(resolve, reject)
    }
    const script = document.createElement('script')
    script.async = true
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({
      key: apiKey,
      loading: 'async',
      callback: callbackName,
    })}`
    script.onerror = () => reject(new Error('The Google Maps script failed to load.'))
    document.head.append(script)
  })

export function google(options: GoogleOptions): MapProvider {
  const baseMaps = 'baseMaps' in options ? options.baseMaps : []
  const defaultBaseMap = 'baseMaps' in options ? options.defaultBaseMap : undefined
  const mapTypeOf = (id: string | undefined): GoogleMapTypeId =>
    'baseMaps' in options
      ? ((baseMaps.find((baseMap) => baseMap.id === id) ?? baseMaps[0])?.mapTypeId ?? 'roadmap')
      : (options.mapTypeId ?? 'roadmap')
  const load = () => {
    if (options.loader) return options.loader()
    if (options.apiKey) return loadScript(options.apiKey)
    return Promise.reject(new Error('The google() adapter needs a loader or an apiKey.'))
  }

  return {
    baseMaps: baseMaps.map(({ id, label, attribution }) => ({
      id,
      ...(label === undefined ? {} : { label }),
      ...(attribution === undefined ? {} : { attribution }),
    })),
    ...(defaultBaseMap === undefined ? {} : { defaultBaseMap }),
    mount(container, { view, baseMap, signal }) {
      // The SDK arrives after `mount` returns: until then the handle holds the camera itself.
      let camera = view
      let mapTypeId = mapTypeOf(baseMap ?? defaultBaseMap)
      let engine: GoogleMap | undefined
      let destroyed = false
      const engineListeners: GoogleListener[] = []

      const listeners = new Map<MapProviderEventName, Set<(payload: never) => void>>()
      const emit = <Name extends MapProviderEventName>(
        name: Name,
        payload: MapProviderEvents[Name],
      ) => {
        for (const listener of listeners.get(name) ?? []) listener(payload as never)
      }

      const readView = (): MapView => {
        const center = engine?.getCenter()
        const zoom = engine?.getZoom()
        if (!center || zoom === undefined) return camera
        camera = {
          center: {
            longitude: normalizeLongitude(center.lng()),
            latitude: clampLatitude(center.lat()),
          },
          zoom: zoom - zoomOffset,
        }
        return camera
      }
      const cameraOf = (next: MapView) => ({
        center: { lat: next.center.latitude, lng: next.center.longitude },
        zoom: next.zoom + zoomOffset,
      })

      load().then(
        ({ Map: GoogleMapConstructor }) => {
          if (destroyed) return
          engine = new GoogleMapConstructor(container, {
            ...cameraOf(camera),
            mapTypeId,
            ...(options.mapId === undefined ? {} : { mapId: options.mapId }),
            isFractionalZoomEnabled: true,
            // One finger scrolls the page and the wheel zooms only with Ctrl or Command (WCAG 1.4.10, 2.5.1).
            gestureHandling: 'cooperative',
            // The viewport owns the keyboard, the camera and the announcements.
            keyboardShortcuts: false,
            disableDefaultUI: true,
            clickableIcons: false,
            disableDoubleClickZoom: true,
          })
          engineListeners.push(
            engine.addListener('bounds_changed', () => emit('move', readView())),
            engine.addListener('idle', () => emit('moveend', readView())),
            engine.addListener('tilesloaded', () => emit('tilesloaded', undefined)),
          )
        },
        (error: unknown) => {
          if (!destroyed) emit('error', error instanceof Error ? error : new Error(String(error)))
        },
      )

      // The engine's own hint is Google's and in Google's language: the viewport adds KvirnUI's.
      let touchAnnounced = false
      const onWheel = (event: WheelEvent) => {
        if (!event.ctrlKey && !event.metaKey) emit('gesture', 'wheel')
      }
      const onTouchMove = (event: TouchEvent) => {
        if (event.touches.length !== 1 || touchAnnounced) return
        touchAnnounced = true
        emit('gesture', 'touch')
      }
      const onTouchEnd = (event: TouchEvent) => {
        if (event.touches.length === 0) touchAnnounced = false
      }
      // Google draws its logo, Terms and error-report links inside the aria-hidden container, and adds
      // them after the SDK loads: keep them out of the Tab order, as the other adapters do (2.1.1, 4.1.2).
      // Only `tabindex` is watched and only a change is written: writing the same value still
      // queues a mutation record, and the observer would call itself forever.
      const leaveTabOrder = () => {
        for (const element of container.querySelectorAll<HTMLElement>(
          'a[href]:not([tabindex="-1"]), button:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
        ))
          element.tabIndex = -1
      }
      const tabOrderObserver = new MutationObserver(leaveTabOrder)
      tabOrderObserver.observe(container, {
        childList: true,
        subtree: true,
        attributeFilter: ['tabindex'],
      })
      container.addEventListener('wheel', onWheel, { passive: true })
      container.addEventListener('touchmove', onTouchMove, { passive: true })
      container.addEventListener('touchend', onTouchEnd)
      container.addEventListener('touchcancel', onTouchEnd)

      const handle: MapHandle = {
        setView: (next, moveOptions) => {
          const previous = camera
          camera = next
          if (!engine) return
          if (moveOptions?.animate && previous.zoom === next.zoom) {
            engine.panTo(cameraOf(next).center)
          } else {
            engine.moveCamera(cameraOf(next))
          }
        },
        getView: readView,
        getSize: () => {
          const { clientWidth, clientHeight } = container
          return { width: clientWidth, height: clientHeight }
        },
        getBounds: () => boundsOfView(readView(), handle.getSize()),
        fitBounds: (bounds, fitOptions) => {
          if (!engine) return
          engine.fitBounds(
            { west: bounds.west, south: bounds.south, east: bounds.east, north: bounds.north },
            fitOptions?.padding ?? 0,
          )
        },
        setBaseMap: (id) => {
          const next = baseMaps.find((candidate) => candidate.id === id)
          if (!next) return
          mapTypeId = next.mapTypeId
          engine?.setMapTypeId(mapTypeId)
        },
        project: (position) => {
          const current = readView()
          const { width, height } = handle.getSize()
          const centre = worldPoint(current.center, current.zoom)
          const point = worldPoint(position, current.zoom)
          return { x: point.x - centre.x + width / 2, y: point.y - centre.y + height / 2 }
        },
        unproject: (point) => {
          const current = readView()
          const { width, height } = handle.getSize()
          const centre = worldPoint(current.center, current.zoom)
          return unprojectWorld(
            centre.x + point.x - width / 2,
            centre.y + point.y - height / 2,
            current.zoom,
          )
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
          tabOrderObserver.disconnect()
          container.removeEventListener('wheel', onWheel)
          container.removeEventListener('touchmove', onTouchMove)
          container.removeEventListener('touchend', onTouchEnd)
          container.removeEventListener('touchcancel', onTouchEnd)
          for (const engineListener of engineListeners) engineListener.remove()
          listeners.clear()
          container.replaceChildren()
        },
      }

      signal?.addEventListener('abort', handle.destroy, { once: true })
      return handle
    },
  }
}
