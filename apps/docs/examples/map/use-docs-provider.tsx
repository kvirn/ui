'use client'
import type { MapProvider } from '@kvirn-ui/map'
import { AlertInfo, AlertTitle } from '@kvirn-ui/react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { useMapTexts } from './texts.ts'

const backgroundStyle = {
  version: 8 as const,
  sources: {},
  layers: [
    { id: 'background', type: 'background' as const, paint: { 'background-color': '#dfe6ea' } },
  ],
}
const backgroundAttribution = 'Background only, no map data'

// The URLs match the Storybook fixture. OpenStreetMap, Esri and OpenTopoMap each have usage
// policies: a real site uses its own or a licensed tile host.
const tileBaseMaps = [
  {
    id: 'standard',
    tiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxzoom: 19,
    attribution: '© OpenStreetMap contributors',
  },
  {
    id: 'satellite',
    tiles:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxzoom: 19,
    attribution: 'Tiles © Esri',
  },
  {
    id: 'terrain',
    tiles: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    maxzoom: 17,
    attribution: '© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)',
  },
]

// The engine is imported on the client only, so the server render never touches the DOM.
async function createProvider(withTiles: boolean, labels: MapTypeLabels): Promise<MapProvider> {
  const { maplibre, rasterStyle } = await import('@kvirn-ui/map/maplibre')
  // The bundler moves the engine away from its worker: pass the worker's address.
  const workerUrl = new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href
  if (!withTiles) {
    // No sources: a real, draggable engine that requests nothing. One map type, so no switch.
    return maplibre({
      workerUrl,
      baseMaps: [
        {
          id: 'plain',
          label: labels.plain,
          style: backgroundStyle,
          attribution: backgroundAttribution,
        },
      ],
    })
  }
  return maplibre({
    workerUrl,
    baseMaps: tileBaseMaps.map(({ id, tiles, maxzoom, attribution }) => ({
      id,
      label: labels[id as keyof MapTypeLabels],
      attribution,
      style: rasterStyle({ tiles: [tiles], maxzoom, attribution }),
    })),
    defaultBaseMap: 'standard',
  })
}

type MapTypeLabels = { standard: string; satellite: string; terrain: string; plain: string }

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
  const { texts } = useMapTexts()
  const { mapTypeStandard: standard, mapTypeSatellite: satellite } = texts
  const { mapTypeTerrain: terrain, mapTypePlain: plain } = texts
  const [loaded, setLoaded] = useState<{ withTiles: boolean; provider: MapProvider } | null>(null)

  useEffect(() => {
    let current = true
    void createProvider(withTiles, { standard, satellite, terrain, plain }).then((provider) => {
      if (current) setLoaded({ withTiles, provider })
    })
    return () => {
      current = false
    }
  }, [withTiles, standard, satellite, terrain, plain])

  return loaded && loaded.withTiles === withTiles ? (
    // A new provider is a new engine: remount the map rather than swap one under it.
    <div key={String(withTiles)}>{children(loaded.provider)}</div>
  ) : null
}
