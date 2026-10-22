import { MAX_ZOOM, MIN_ZOOM, panBy, zoomBy } from '@kvirn-ui/core'
import type {
  MapBaseMap,
  MapBounds,
  MapHandle,
  MapProvider,
  MapTheme,
  MapView,
} from '@kvirn-ui/core'
import type { MapStore } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import type { ResolvedMessages } from '@kvirn-ui/core'
import { useTheme } from '@kvirn-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'

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
// While the engine moves, the store (and so React) follows this often: markers and the popup
// follow every frame without it (`useMapFrame`).
const MOVE_SYNC_MILLISECONDS = 150
const noBaseMaps: readonly MapBaseMap[] = []

/** A base map whose label is always set: the consumer's, else `map.defaultBaseMapLabel`. */
export type MapNamedBaseMap = MapBaseMap & { label: string }

export interface UseMapCameraOptions {
  store: MapStore
  view: MapView
  bounds: MapBounds | null
  provider: MapProvider
  initialView: MapView
  baseMap: string | undefined
  defaultBaseMap: string | undefined
  onBaseMapChange: ((id: string) => void) | undefined
  messages: ResolvedMessages<KvirnMessages['map']>
  say: (text: string, key: string, throttleMilliseconds?: number) => void
  baseId: string
  placesInViewCount: number
  visibleCount: number
}

export function useMapCamera({
  store,
  view,
  bounds,
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
}: UseMapCameraOptions) {
  const [engineContainer, setEngineContainer] = useState<HTMLElement | null>(null)
  const [handle, setHandle] = useState<MapHandle | null>(null)
  const [status, setStatus] = useState<MapStatus>('loading')
  const providerBaseMaps = provider.baseMaps ?? noBaseMaps
  const baseMaps = useMemo(
    (): readonly MapNamedBaseMap[] =>
      providerBaseMaps.map((candidate) => ({
        ...candidate,
        label: candidate.label ?? messages.defaultBaseMapLabel,
      })),
    [providerBaseMaps, messages.defaultBaseMapLabel],
  )
  const fallbackBaseMap = provider.defaultBaseMap ?? baseMaps[0]?.id ?? null
  const [ownBaseMap, setOwnBaseMap] = useState<string | null>(defaultBaseMap ?? null)
  const requestedBaseMap = baseMapProp ?? ownBaseMap
  const baseMap =
    requestedBaseMap !== null && baseMaps.some((candidate) => candidate.id === requestedBaseMap)
      ? requestedBaseMap
      : fallbackBaseMap
  const baseMapRef = useRef(baseMap)
  const appliedBaseMap = useRef(baseMap)
  const { resolvedColorScheme, resolvedContrast, isForcedColors } = useTheme()
  const themeContrast = resolvedContrast === 'more' || isForcedColors ? 'more' : 'standard'
  const theme: MapTheme = { colorScheme: resolvedColorScheme, contrast: themeContrast }
  const themeRef = useRef(theme)
  useEffect(() => {
    themeRef.current = theme
  })
  const [gestureHint, setGestureHint] = useState<MapGestureHint | null>(null)
  const [isKeyboardHintDismissed, setKeyboardHintDismissed] = useState(false)
  const initialViewRef = useRef(initialView)
  const announceOnSettle = useRef(false)
  // A request to announce can come with no view change (the same address shown twice): the token reruns the settle effect.
  const [announceRequest, setAnnounceRequest] = useState(0)
  const settlePrefix = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (engineContainer === null) {
      return
    }
    const controller = new AbortController()
    const mounted = provider.mount(engineContainer, {
      view: store.getState().view,
      ...(baseMapRef.current === null ? {} : { baseMap: baseMapRef.current }),
      theme: themeRef.current,
      signal: controller.signal,
    })
    const sync = (nextView: MapView) => {
      store.actions.setView(nextView)
      store.actions.setBounds(mounted.getBounds())
    }
    let lastSync = 0
    let syncTimer = 0
    let pendingView = mounted.getView()
    const syncNow = () => {
      window.clearTimeout(syncTimer)
      syncTimer = 0
      lastSync = performance.now()
      sync(pendingView)
    }
    const unsubscribers = [
      mounted.on('move', (nextView) => {
        pendingView = nextView
        const wait = MOVE_SYNC_MILLISECONDS - (performance.now() - lastSync)
        if (wait <= 0) {
          syncNow()
        } else if (syncTimer === 0) {
          syncTimer = window.setTimeout(syncNow, wait)
        }
      }),
      mounted.on('moveend', (nextView) => {
        pendingView = nextView
        syncNow()
        setGestureHint(null)
      }),
      mounted.on('tilesloaded', () => setStatus('ready')),
      mounted.on('error', () => setStatus('failed')),
      mounted.on('gesture', setGestureHint),
    ]
    syncNow()
    setHandle(mounted)
    return () => {
      window.clearTimeout(syncTimer)
      for (const unsubscribe of unsubscribers) unsubscribe()
      controller.abort()
      setHandle(null)
      setStatus('loading')
    }
  }, [provider, engineContainer, store])

  useEffect(() => {
    if (!announceOnSettle.current) {
      return
    }
    const timer = window.setTimeout(() => {
      announceOnSettle.current = false
      const count =
        placesInViewCount === visibleCount
          ? messages.placesAll({ count: visibleCount })
          : messages.placesInView({ count: placesInViewCount })
      const prefix = settlePrefix.current
      settlePrefix.current = undefined
      // A prefix is the answer to an explicit request, such as showing the same address again:
      // the key's throttle is for camera chatter and must not swallow it.
      if (prefix === undefined) say(count, `${baseId}-view`)
      else say(`${prefix} ${count}`, `${baseId}-view`, 0)
    }, SETTLE_MILLISECONDS)
    return () => window.clearTimeout(timer)
  }, [view, bounds, placesInViewCount, visibleCount, messages, say, baseId, announceRequest])

  useEffect(() => {
    if (status === 'failed') {
      say(messages.tilesFailedTitle, `${baseId}-failed`)
    }
  }, [status, messages, say, baseId])

  useEffect(() => {
    handle?.setTheme?.({ colorScheme: resolvedColorScheme, contrast: themeContrast })
  }, [handle, resolvedColorScheme, themeContrast])

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

  const moveTo = (nextView: MapView, motion?: { animate: boolean; duration: number }) => {
    if (handle) {
      handle.setView(nextView, motion)
    } else {
      store.actions.setView(nextView)
    }
  }

  const zoomBounded = (delta: number) => {
    announceOnSettle.current = true
    const atLimit = delta > 0 ? view.zoom >= MAX_ZOOM : view.zoom <= MIN_ZOOM
    if (atLimit) {
      announceOnSettle.current = false
      say(delta > 0 ? messages.zoomLimitIn : messages.zoomLimitOut, `${baseId}-limit`)
      return
    }
    moveTo(zoomBy(view, delta))
  }

  return {
    status,
    gestureHint,
    handle,
    baseMaps,
    baseMap,
    activeBaseMap: baseMaps.find((candidate) => candidate.id === baseMap) ?? null,
    isKeyboardHintDismissed,
    canZoomIn: view.zoom < MAX_ZOOM,
    canZoomOut: view.zoom > MIN_ZOOM,
    setEngineElement: setEngineContainer,
    moveTo,
    zoomIn: () => zoomBounded(1),
    zoomOut: () => zoomBounded(-1),
    reset: () => {
      announceOnSettle.current = true
      moveTo(initialViewRef.current)
    },
    setBaseMap: (id: string) => {
      if (id === baseMap || !baseMaps.some((candidate) => candidate.id === id)) {
        return
      }
      if (baseMapProp === undefined) {
        setOwnBaseMap(id)
      }
      onBaseMapChange?.(id)
    },
    pan: (direction: MapPanDirection) => {
      announceOnSettle.current = true
      const size = handle?.getSize() ?? { width: 800, height: 600 }
      const shorter = Math.min(size.width, size.height)
      const fraction = panFractions[direction]
      moveTo(
        panBy(
          view,
          {
            x: (fraction.x * PAN_STEP * shorter) / size.width,
            y: (fraction.y * PAN_STEP * shorter) / size.height,
          },
          size,
        ),
      )
    },
    dismissKeyboardHint: () => {
      setKeyboardHintDismissed(true)
      setGestureHint(null)
    },
    announceNextSettle: (prefix?: string) => {
      announceOnSettle.current = true
      settlePrefix.current = prefix
      setAnnounceRequest((request) => request + 1)
    },
  }
}
