'use client'
import { Map } from '@kvirn-ui/map'
import { useMapTexts } from './texts.ts'
import { DocsMap } from './use-docs-provider.tsx'

const initialView = { center: { longitude: 18.07, latitude: 59.33 }, zoom: 11 }

export function PollingStationMap() {
  const { texts } = useMapTexts()
  return (
    <DocsMap>
      {(provider) => (
        <Map.Root
          provider={provider}
          label={texts.pollingLabel}
          places={texts.pollingStations}
          initialView={initialView}
        >
          <Map.Skip />
          <Map.Viewport>
            <Map.Markers />
            <Map.Controls />
          </Map.Viewport>
          <Map.List headingLevel="h4" />
          <Map.Details />
          <Map.ClusterPopup />
        </Map.Root>
      )}
    </DocsMap>
  )
}
