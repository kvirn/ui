import { Map, useMapState } from '@kvirn-ui/map'
import type { MapPlace, MapProvider, MapRootProps, MapView } from '@kvirn-ui/map'
import { maplibre, rasterStyle } from '@kvirn-ui/map/maplibre'
import { Field, Icon, Listbox } from '@kvirn-ui/react'
import type { IconComponent, IconComponentProps } from '@kvirn-ui/react'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.fixture.css'
import { useMemo } from 'react'
import { demoLayers, fuelStations, hotels } from './map.data.ts'

// Inline SVG data URIs: the stories request no image from a third party.
function sampleImage(background: string, shape: string, alt: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="${background}"/>${shape}</svg>`
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, alt }
}

export const places: MapPlace[] = [
  {
    id: 'kungsholmen',
    name: 'Kungsholmens förskola',
    address: 'Fleminggatan 14',
    description: 'A preschool with four groups and a garden facing the water.',
    image: sampleImage(
      '#b9d4c7',
      '<path d="M40 150V80l60-40 60 40v70zM190 150V60l50-30 50 30v90z" fill="#3f6b57"/>',
      'Two green houses on a light green background',
    ),
    position: { longitude: 18.0, latitude: 59.333 },
  },
  {
    id: 'sodermalm',
    name: 'Södermalms förskola',
    address: 'Götgatan 50',
    description: 'Open 7:00 to 17:30. Call ahead to book a visit.',
    image: sampleImage('#d8c9e3', '<circle cx="160" cy="90" r="50" fill="#6a4a85"/>', ''),
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
    description: 'A small unit for children aged one to three.',
    position: { longitude: 17.94, latitude: 59.338 },
  },
]

function createIcon(paths: readonly string[]): IconComponent {
  return function LayerIcon({ ref, ...svgProps }: IconComponentProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...svgProps}
        ref={ref}
      >
        {paths.map((pathData) => (
          <path key={pathData} d={pathData} />
        ))}
      </svg>
    )
  }
}

const layerIcons: Record<string, IconComponent> = {
  fuel: createIcon([
    'M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16',
    'M3 21h14',
    'M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3',
    'M7 8h6',
  ]),
  hotels: createIcon([
    'M3 20V6',
    'M3 15h18v5',
    'M21 15v-2a3 3 0 0 0-3-3h-7v5',
    'M7 12.5a1.5 1.5 0 1 0 0-.01',
  ]),
}

/** Story args for the main example: 100 fuel stations and 100 hotels, one layer each. */
export const layeredArgs = {
  label: 'Map of fuel stations and hotels',
  places: [...fuelStations, ...hotels],
  layers: demoLayers,
}

export const initialView: MapView = { center: { longitude: 18.02, latitude: 59.322 }, zoom: 11 }

// The URLs are the story's, not the library's. OpenStreetMap, Esri and OpenTopoMap each have usage
// policies and terms for imagery: a real site uses its own or a licensed tile host, and the
// consumer answers for those terms. Visitors' IP addresses reach each host, so only the stories that
// are not `offline` request them (and they are tagged `!test`).
const baseMapDefinitions = [
  {
    id: 'standard',
    label: 'Standard',
    attribution: '© OpenStreetMap contributors',
    tiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxzoom: 19,
    background: '#dfe6ea',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    attribution: 'Tiles © Esri',
    tiles:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxzoom: 19,
    background: '#c9d3c4',
  },
  {
    id: 'terrain',
    label: 'Terrain',
    attribution: '© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)',
    tiles: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    maxzoom: 17,
    background: '#e6dfc8',
  },
]

export const baseMapIds = baseMapDefinitions.map((definition) => definition.id)

export function useProvider(offline: boolean): MapProvider {
  return useMemo(
    () =>
      maplibre({
        workerUrl,
        baseMaps: baseMapDefinitions.map(
          ({ id, label, attribution, tiles, maxzoom, background }) =>
            offline
              ? {
                  id,
                  label,
                  attribution: 'Background only, no map data',
                  style: {
                    version: 8 as const,
                    sources: {},
                    layers: [
                      {
                        id: 'background',
                        type: 'background' as const,
                        paint: { 'background-color': background },
                      },
                    ],
                  },
                }
              : {
                  id,
                  label,
                  attribution,
                  style: rasterStyle({ tiles: [tiles], maxzoom, attribution }),
                },
        ),
      }),
    [offline],
  )
}

export type MapDemoProps = Omit<MapRootProps, 'provider' | 'children'> & {
  /** Story only: a plain background and no tile source, so the story makes no network call. */
  offline?: boolean
  /** Story only: whether the page renders `Map.BaseMapSwitch`. Composition, not a prop of the map. */
  showBaseMapSwitch?: boolean
  /** Story only: whether the page renders `Map.List`. Composition, not a prop of the map. */
  showList?: boolean
}

const ownListHeadingId = 'own-list-heading'

// A page's own list, built from the map's state: the same behaviour as Map.List through the hook.
function OwnList() {
  const map = useMapState()
  if (map.selectedPlace) {
    return null
  }
  return (
    <div>
      <h2 id={ownListHeadingId} tabIndex={-1}>
        {`${map.placesInView.length} of ${map.visiblePlaces.length} places in view`}
      </h2>
      <ul>
        {map.placesInView.map((place) => (
          <li key={place.id}>
            <button
              id={`own-list-${place.id}`}
              type="button"
              className="kv-button"
              aria-expanded={false}
              aria-controls={map.ids.details}
              onClick={() => map.select(place.id, `own-list-${place.id}`)}
            >
              {place.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BaseMapSelect() {
  return (
    <Map.BaseMapSwitch>
      {({ baseMaps, baseMap, setBaseMap }) => (
        <Field.Root>
          <Field.Label>Map type</Field.Label>
          <Listbox.Root
            native="always"
            items={baseMaps}
            itemToString={(item) => item.label}
            itemToKey={(item) => item.id}
            value={baseMap}
            onValueChange={(id) => {
              if (id !== null) setBaseMap(id)
            }}
          />
        </Field.Root>
      )}
    </Map.BaseMapSwitch>
  )
}

export function MapDemo({
  offline = false,
  showBaseMapSwitch = true,
  showList = false,
  ...mapProps
}: MapDemoProps) {
  const provider = useProvider(offline)
  // A new provider, start or camera is a new engine: remount the map rather than swap one under it.
  const key = `${offline}|${mapProps.defaultBaseMap}|${JSON.stringify(mapProps.defaultHiddenLayers)}|${JSON.stringify(mapProps.initialView)}`
  return (
    <Map.Root key={key} provider={provider} {...mapProps}>
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers
          markerClassName={(place) => `story-marker--${place.layer}`}
          clusterClassName={(cluster) => `story-cluster--${cluster.layer}`}
        >
          {(place) => <Icon icon={layerIcons[place.layer ?? 'fuel']!} size="16" />}
        </Map.Markers>
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <Map.Layers icon={(layer) => <Icon icon={layerIcons[layer.id]!} size="16" />} />
      {showBaseMapSwitch ? <Map.BaseMapSwitch /> : null}
      {showList ? <Map.List /> : null}
      <Map.Details />
      <Map.ClusterPopup />
    </Map.Root>
  )
}

const clusterSize = (count: number) => (count < 5 ? 'small' : count < 10 ? 'medium' : 'large')

/**
 * A pin per layer and a ring per cluster, both drawn inside the default buttons: the content is
 * decorative, the buttons are named by `label` and `clusterLabel`, and the classes only restyle.
 */
export function CustomMarkersDemo({ offline = false, ...mapProps }: MapDemoProps) {
  const provider = useProvider(offline)
  return (
    <Map.Root provider={provider} {...mapProps}>
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers
          label={(place, layer) => `${place.name}, ${layer?.label ?? ''}`}
          markerClassName={(place) => `story-pin story-pin--${place.layer}`}
          clusterLabel={(cluster, layer) => `${layer?.label ?? ''}, ${cluster.count} places`}
          clusterClassName={(cluster) =>
            `story-ring story-ring--${cluster.layer} story-ring--${clusterSize(cluster.count)}`
          }
          cluster={(cluster) => (
            <>
              <Icon icon={layerIcons[cluster.layer ?? 'fuel']!} size="16" />
              <span className="story-ring-count">{cluster.count}</span>
            </>
          )}
        >
          {(place, state) => (
            <>
              <Icon icon={layerIcons[place.layer ?? 'fuel']!} size="16" />
              {state.highlighted && !state.selected ? (
                <span className="kv-map-marker-label">{place.name}</span>
              ) : null}
            </>
          )}
        </Map.Markers>
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <Map.Layers icon={(layer) => <Icon icon={layerIcons[layer.id]!} size="16" />} />
      <Map.List />
      <Map.Details />
      <Map.ClusterPopup />
    </Map.Root>
  )
}

/** Map.List replaced by a list built with `useMapState`, and a skip link to its heading. */
export function MapOwnListDemo({ offline = false, ...mapProps }: MapDemoProps) {
  const provider = useProvider(offline)
  return (
    <Map.Root provider={provider} {...mapProps} cluster={false}>
      <Map.Skip href={`#${ownListHeadingId}`} />
      <Map.Viewport>
        <Map.Markers>{() => <Icon name="info" size="16" />}</Map.Markers>
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <OwnList />
      <Map.Details />
    </Map.Root>
  )
}

/** Map.BaseMapSwitch with its radios replaced by a native select through the render function. */
export function MapSelectSwitchDemo({ offline = false, ...mapProps }: MapDemoProps) {
  const provider = useProvider(offline)
  return (
    <Map.Root provider={provider} {...mapProps} cluster={false}>
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers>{() => <Icon name="info" size="16" />}</Map.Markers>
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <BaseMapSelect />
      <Map.List />
      <Map.Details />
    </Map.Root>
  )
}

export function CustomPopupDemo({ offline = false, ...mapProps }: MapDemoProps) {
  const provider = useProvider(offline)
  return (
    <Map.Root provider={provider} {...mapProps} cluster={false}>
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers>{() => <Icon name="info" size="16" />}</Map.Markers>
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <Map.List />
      <Map.Details>
        <div className="kv-map-details-content">
          <Map.DetailsAddress className="story-popup-address" />
          <div className="kv-map-details-header">
            <Map.DetailsTitle as="h2" className="story-popup-title" />
            <Map.DetailsClose />
          </div>
          <Map.DetailsBody />
          <Map.DetailsImage className="story-popup-image" />
        </div>
      </Map.Details>
    </Map.Root>
  )
}

export function MapRenderFunctionPopupDemo({ offline = false, ...mapProps }: MapDemoProps) {
  const provider = useProvider(offline)
  return (
    <Map.Root provider={provider} {...mapProps} cluster={false}>
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers>{() => <Icon name="info" size="16" />}</Map.Markers>
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <Map.List />
      <Map.Details>
        {({ place, close, titleProps }) => (
          <div className="kv-map-details-content">
            <h3 {...titleProps}>{place.name}</h3>
            <p className="kv-map-details-address">{place.address}</p>
            <button type="button" className="kv-button" onClick={close}>
              Back to the map
            </button>
          </div>
        )}
      </Map.Details>
    </Map.Root>
  )
}
