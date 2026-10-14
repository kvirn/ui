import { Map, createMemoryProvider } from '@kvirn-ui/map'
import type { MapPlace, MapView } from '@kvirn-ui/map'
import { maplibre, rasterStyle } from '@kvirn-ui/map/maplibre'
import { Icon } from '@kvirn-ui/react'
import type { StyleSpecification } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMemo } from 'react'
import type { ReactNode } from 'react'

// A style with one background layer and no sources: nothing is fetched, so the story needs no
// network and no tile service. A consumer passes their own style URL.
const blankStyle: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#dfe6ea' } }],
}

export const places: MapPlace[] = [
  {
    id: 'kungsholmen',
    name: 'Kungsholmens förskola',
    address: 'Fleminggatan 14',
    position: { longitude: 18.0, latitude: 59.333 },
  },
  {
    id: 'sodermalm',
    name: 'Södermalms förskola',
    address: 'Götgatan 50',
    position: { longitude: 18.073, latitude: 59.314 },
  },
  {
    id: 'vasastan',
    name: 'Vasastans förskola',
    address: 'Odengatan 32',
    position: { longitude: 18.047, latitude: 59.343 },
  },
  {
    id: 'hagersten',
    name: 'Hägerstens förskola',
    address: 'Hägerstensvägen 90',
    position: { longitude: 17.96, latitude: 59.296 },
  },
  {
    id: 'bromma',
    name: 'Brommas förskola',
    address: 'Brommaplan 3',
    position: { longitude: 17.94, latitude: 59.338 },
  },
]

export const initialView: MapView = { center: { longitude: 18.02, latitude: 59.322 }, zoom: 11 }

function MapExample({
  provider,
  view = initialView,
  attribution = 'Kartdata: exempel, ingen källa',
}: {
  provider: ReturnType<typeof maplibre>
  view?: MapView
  attribution?: ReactNode
}) {
  return (
    <Map.Root provider={provider} label="Karta över förskolor" places={places} initialView={view}>
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers>{() => <Icon name="info" size="16" />}</Map.Markers>
        <Map.Controls />
        <Map.Attribution>{attribution}</Map.Attribution>
      </Map.Viewport>
      <Map.List />
      <Map.Details />
    </Map.Root>
  )
}

export function MapLibreExample() {
  const provider = useMemo(() => maplibre({ style: blankStyle, workerUrl }), [])
  return <MapExample provider={provider} />
}

export function MemoryExample() {
  const provider = useMemo(() => createMemoryProvider(), [])
  return <MapExample provider={provider} />
}

// The URL is the story's, not the library's: OpenStreetMap's tile policy allows light use only, so
// a real site uses its own or a paid tile host. Visitors' IP addresses reach that host.
export function OpenStreetMapExample() {
  const provider = useMemo(
    () =>
      maplibre({
        workerUrl,
        style: rasterStyle({
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          maxzoom: 19,
          attribution: '© OpenStreetMap contributors',
        }),
      }),
    [],
  )
  return (
    <MapExample
      provider={provider}
      attribution={
        <>
          © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>
        </>
      }
    />
  )
}

// The URLs are the story's, not the library's. OpenStreetMap, Esri and OpenTopoMap each have usage
// policies and terms for imagery: a real site uses its own or a licensed tile host, and the
// consumer answers for those terms. Visitors' IP addresses reach each host.
const baseMapOptions = [
  {
    id: 'standard',
    label: 'Standard',
    attribution: '© OpenStreetMap contributors',
    tiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxzoom: 19,
  },
  {
    id: 'satellite',
    label: 'Satellite',
    attribution: 'Tiles © Esri',
    tiles:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxzoom: 19,
  },
  {
    id: 'terrain',
    label: 'Terrain',
    attribution: '© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)',
    tiles: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    maxzoom: 17,
  },
]

export const baseMapIds = baseMapOptions.map((option) => option.id)
export const engines = ['maplibre', 'memory'] as const
export type Engine = (typeof engines)[number]

/** Both props are Storybook controls: `baseMap` follows the visitor's choice and `engine` swaps the provider. */
export function BaseMapsExample({
  baseMap,
  engine = 'maplibre',
  onBaseMapChange,
}: {
  baseMap?: string | undefined
  engine?: Engine | undefined
  onBaseMapChange?: ((id: string) => void) | undefined
}) {
  const provider = useMemo(() => {
    if (engine === 'memory') {
      return createMemoryProvider({
        baseMaps: baseMapOptions.map(({ id, label, attribution }) => ({ id, label, attribution })),
        defaultBaseMap: 'standard',
      })
    }
    return maplibre({
      workerUrl,
      defaultBaseMap: 'standard',
      baseMaps: baseMapOptions.map(({ id, label, attribution, tiles, maxzoom }) => ({
        id,
        label,
        attribution,
        style: rasterStyle({ tiles: [tiles], maxzoom, attribution }),
      })),
    })
  }, [engine])
  // A new provider is a new engine: remount the map rather than swap one under it.
  return (
    <Map.Root
      key={engine}
      provider={provider}
      label="Karta över förskolor"
      places={places}
      initialView={initialView}
      {...(baseMap === undefined ? {} : { baseMap })}
      {...(onBaseMapChange === undefined ? {} : { onBaseMapChange })}
    >
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers>{() => <Icon name="info" size="16" />}</Map.Markers>
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <Map.BaseMapSwitch />
      <Map.List />
      <Map.Details />
    </Map.Root>
  )
}
