'use client'
import type { MapProvider } from '@kvirn-ui/map'
import { AlertInfo, AlertTitle } from '@kvirn-ui/react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { useMapTexts } from './texts.ts'

// The engine is imported on the client only, so the server render never touches the DOM.
async function createProvider(withTiles: boolean): Promise<MapProvider> {
  const { maplibre, rasterStyle } = await import('@kvirn-ui/map/maplibre')
  // The bundler moves the engine away from its worker: pass the worker's address.
  const workerUrl = new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href
  if (withTiles) {
    return maplibre({
      workerUrl,
      style: rasterStyle({
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        maxzoom: 19,
        attribution: '© OpenStreetMap contributors',
      }),
    })
  }
  // No sources: a real, draggable engine that requests nothing.
  return maplibre({
    workerUrl,
    attribution: 'Background only, no map data',
    style: {
      version: 8,
      sources: {},
      layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#dfe6ea' } }],
    },
  })
}

// One choice for the whole page: the alert's button turns the pictures on for every map.
let picturesOn = false
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function loadPictures() {
  picturesOn = true
  listeners.forEach((listener) => listener())
}

function usePicturesOn() {
  return useSyncExternalStore(
    subscribe,
    () => picturesOn,
    () => false,
  )
}

/** The one button on the page: no request goes out until the visitor presses it. */
export function MapPicturesAlert() {
  const { texts } = useMapTexts()
  const withTiles = usePicturesOn()
  return (
    <AlertInfo>
      <AlertTitle as="p">{texts.picturesTitle}</AlertTitle>
      <p>{withTiles ? texts.picturesLoaded : texts.loadPicturesNote}</p>
      {withTiles ? null : (
        <p>
          <button type="button" className="kv-button" onClick={loadPictures}>
            {texts.loadPictures}
          </button>
        </p>
      )}
    </AlertInfo>
  )
}

/** The docs examples' provider: a plain background until the page's button is pressed. */
export function DocsMap({ children }: { children: (provider: MapProvider) => ReactNode }) {
  const withTiles = usePicturesOn()
  const [loaded, setLoaded] = useState<{ withTiles: boolean; provider: MapProvider } | null>(null)

  useEffect(() => {
    let current = true
    void createProvider(withTiles).then((provider) => {
      if (current) setLoaded({ withTiles, provider })
    })
    return () => {
      current = false
    }
  }, [withTiles])

  return loaded && loaded.withTiles === withTiles ? (
    // A new provider is a new engine: remount the map rather than swap one under it.
    <div key={String(withTiles)}>{children(loaded.provider)}</div>
  ) : null
}
