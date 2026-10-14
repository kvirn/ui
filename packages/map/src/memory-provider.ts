import { boundsOfView, panBy } from '@kvirn-ui/core'
import type {
  MapBaseMap,
  MapBounds,
  MapHandle,
  MapProvider,
  MapProviderEventName,
  MapProviderEvents,
  MapSize,
  MapView,
} from '@kvirn-ui/core'

export interface MemoryProvider extends MapProvider {
  /** The handle of the last `mount`, so a test can read the camera. */
  readonly handle: MapHandle | null
}

export interface CreateMemoryProviderOptions {
  size?: MapSize
  baseMaps?: readonly MapBaseMap[]
  defaultBaseMap?: string
}

/** A provider with no engine and no network: it tracks the camera and draws nothing. */
export function createMemoryProvider(options: CreateMemoryProviderOptions = {}): MemoryProvider {
  const size = options.size ?? { width: 800, height: 600 }
  let lastHandle: MapHandle | null = null

  return {
    ...(options.baseMaps ? { baseMaps: options.baseMaps } : {}),
    ...(options.defaultBaseMap ? { defaultBaseMap: options.defaultBaseMap } : {}),
    get handle() {
      return lastHandle
    },
    mount(_container, { view: initialView, signal }) {
      let view = initialView
      const listeners = new Map<MapProviderEventName, Set<(payload: never) => void>>()

      const emit = <Name extends MapProviderEventName>(
        name: Name,
        payload: MapProviderEvents[Name],
      ) => {
        for (const listener of listeners.get(name) ?? []) listener(payload as never)
      }
      const moveTo = (next: MapView) => {
        view = next
        emit('move', view)
        emit('moveend', view)
      }

      const handle: MapHandle = {
        setView: moveTo,
        getView: () => view,
        getSize: () => size,
        getBounds: () => boundsOfView(view, size),
        fitBounds: (bounds: MapBounds) =>
          moveTo({
            zoom: view.zoom,
            center: {
              longitude: (bounds.west + bounds.east) / 2,
              latitude: (bounds.south + bounds.north) / 2,
            },
          }),
        setBaseMap: () => {},
        project: (position) => {
          const origin = panBy(view, { x: -0.5, y: -0.5 }, size).center
          return {
            x: ((position.longitude - origin.longitude) / 360) * 512 * 2 ** view.zoom,
            y: ((origin.latitude - position.latitude) / 180) * 512 * 2 ** view.zoom,
          }
        },
        unproject: (point) => ({
          longitude:
            view.center.longitude + (point.x - size.width / 2) / ((512 * 2 ** view.zoom) / 360),
          latitude:
            view.center.latitude - (point.y - size.height / 2) / ((512 * 2 ** view.zoom) / 180),
        }),
        on: (name, listener) => {
          const set = listeners.get(name) ?? new Set()
          set.add(listener as (payload: never) => void)
          listeners.set(name, set)
          return () => set.delete(listener as (payload: never) => void)
        },
        destroy: () => {
          listeners.clear()
          if (lastHandle === handle) lastHandle = null
        },
      }

      signal?.addEventListener('abort', handle.destroy, { once: true })
      lastHandle = handle
      return handle
    },
  }
}
