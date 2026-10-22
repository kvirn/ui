'use client'
import type { MapProvider } from '@kvirn-ui/map'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useMapTexts } from './texts.ts'

// Transparent, so the map's surface shows through and follows the theme.
const plainStyle = {
  version: 8 as const,
  sources: {},
  layers: [{ id: 'background', type: 'background' as const, paint: { 'background-opacity': 0 } }],
}

// The engine is imported on the client only, so the server render never touches the DOM.
async function createProvider(plainLabel: string): Promise<MapProvider> {
  const { maplibre } = await import('@kvirn-ui/map/maplibre')
  const { kvirnBaseMap } = await import('@kvirn-ui/map/kvirn')
  // The bundler moves the engine away from its worker: pass the worker's address.
  const workerUrl = new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href
  return maplibre({
    workerUrl,
    baseMaps: [
      kvirnBaseMap({ url: 'https://geo.kvirn.com' }),
      {
        id: 'plain',
        label: plainLabel,
        style: plainStyle,
        attribution: 'No map data',
      },
    ],
  })
}

/** The docs examples' provider: the Kvirn map service, and a plain background as a second type. */
export function DocsMap({ children }: { children: (provider: MapProvider) => ReactNode }) {
  const { texts } = useMapTexts()
  const plain = texts.mapTypePlain
  const [provider, setProvider] = useState<MapProvider | null>(null)

  useEffect(() => {
    let current = true
    void createProvider(plain).then((created) => {
      if (current) setProvider(created)
    })
    return () => {
      current = false
    }
  }, [plain])

  return provider ? <div>{children(provider)}</div> : null
}
