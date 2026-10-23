'use client'
import { AddressSearch, Map, useMapState } from '@kvirn-ui/map'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'
import { DocsMap } from '../map/use-docs-provider.tsx'
import { useAddressSearchTexts } from './texts.ts'

const initialView = { center: { longitude: 18.07, latitude: 59.33 }, zoom: 13 }

const geocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  countries: ['se'],
})

// The search must sit inside Map.Root to reach the map, and before the map in the page.
function FindAddress() {
  const map = useMapState()
  return (
    <search>
      <AddressSearch
        geocoder={geocoder}
        onResult={(result) => (result ? map.show(result) : map.clearResult())}
      />
    </search>
  )
}

export function RecyclingStationSearch() {
  const { texts } = useAddressSearchTexts()
  return (
    <DocsMap>
      {(provider) => (
        <Map.Root
          provider={provider}
          label={texts.mapLabel}
          places={texts.stations}
          initialView={initialView}
        >
          <FindAddress />
          <Map.Skip />
          <Map.Viewport>
            <Map.Markers />
            <Map.Controls />
            <Map.Attribution />
          </Map.Viewport>
          <Map.List headingLevel="h4" />
          <Map.Details />
        </Map.Root>
      )}
    </DocsMap>
  )
}
