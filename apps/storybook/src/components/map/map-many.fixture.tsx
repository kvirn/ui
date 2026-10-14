import { Map } from '@kvirn-ui/map'
import type { MapPlaceSource, MapRootProps } from '@kvirn-ui/map'
import { createMapWorker } from '@kvirn-ui/map/worker'
import { useMemo } from 'react'
import { demoLayers } from './map.data.ts'
import { useProvider } from './map.fixture.tsx'

export interface ManyPlacesDemoProps extends Pick<
  MapRootProps,
  'label' | 'defaultHiddenLayers' | 'messages'
> {
  count: number
  indexIn: 'main' | 'worker'
  showList?: boolean
}

// Where the places gather: longitude, latitude and a share of the places.
const cities = [
  [18.07, 59.33, 5],
  [11.97, 57.71, 3],
  [13.0, 55.6, 3],
  [10.75, 59.91, 4],
  [24.94, 60.17, 4],
  [12.57, 55.68, 3],
  [5.32, 60.39, 2],
  [23.76, 61.5, 2],
  [17.64, 59.86, 2],
  [10.4, 63.43, 1],
] as const
const totalShare = cities.reduce((sum, [, , share]) => sum + share, 0)
const streets = ['Storgatan', 'Kyrkogatan', 'Industrivägen', 'Hamngatan', 'Skolgatan', 'Parkvägen']
const hotelNames = ['Hotell Nord', 'Stadshotellet', 'Fjord Inn', 'Hotell Linné', 'Pensionat Vik']
const stationNames = ['Mack', 'Tank', 'Pump', 'Laddstopp', 'Bensin']

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

/** Places as columns: a seeded set clumped around cities, with no object per place until one is shown. */
export function createManyPlaces(count: number): MapPlaceSource {
  const random = mulberry32(2024)
  const positions = new Float64Array(count * 2)
  const layers = new Uint16Array(count)
  for (let index = 0; index < count; index += 1) {
    layers[index] = random() < 0.6 ? 0 : 1
    if (random() < 0.08) {
      positions[2 * index] = 5 + random() * 24
      positions[2 * index + 1] = 56 + random() * 9
      continue
    }
    let pick = random() * totalShare
    const city = cities.find(([, , share]) => (pick -= share) < 0) ?? cities[0]
    // The sum of three uniforms makes a dense core with a soft edge.
    const spread = (random() + random() + random() - 1.5) * 0.35
    const turn = random() * Math.PI * 2
    positions[2 * index] = city[0] + Math.cos(turn) * spread * 1.6
    positions[2 * index + 1] = city[1] + Math.sin(turn) * spread
  }
  return {
    count,
    positions,
    layers,
    get: (index) => {
      const isStation = layers[index] === 0
      const names = isStation ? stationNames : hotelNames
      return {
        id: `place-${index}`,
        name: `${names[index % names.length]} ${index + 1}`,
        position: { longitude: positions[2 * index]!, latitude: positions[2 * index + 1]! },
        layer: isStation ? 'fuel' : 'hotels',
        address: `${streets[index % streets.length]} ${(index % 97) + 1}`,
      }
    },
  }
}

/** The index builds in time slices, or in a worker the map creates and stops. */
export function ManyPlacesDemo({
  count,
  indexIn,
  showList = false,
  defaultHiddenLayers,
  ...mapProps
}: ManyPlacesDemoProps) {
  const provider = useProvider(true)
  const source = useMemo(() => createManyPlaces(count), [count])
  return (
    <Map.Root
      key={`${count}|${indexIn}|${JSON.stringify(defaultHiddenLayers)}`}
      {...mapProps}
      provider={provider}
      defaultHiddenLayers={defaultHiddenLayers}
      source={source}
      layers={demoLayers}
      indexIn={indexIn === 'worker' ? createMapWorker : 'main'}
      initialView={{ center: { longitude: 14, latitude: 59 }, zoom: 5 }}
    >
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers
          markerClassName={(place) => `story-marker--${place.layer}`}
          clusterClassName={(cluster) => `story-cluster--${cluster.layer}`}
        />
        <Map.Controls />
        <Map.Attribution />
      </Map.Viewport>
      <Map.Layers />
      {showList ? <Map.List /> : null}
      <Map.Details />
      <Map.ClusterPopup />
    </Map.Root>
  )
}
