'use client'
import { Map } from '@kvirn-ui/map'
import { useMapTexts } from './texts.ts'
import { DocsMap } from './use-docs-provider.tsx'

const initialView = { center: { longitude: 18.07, latitude: 59.33 }, zoom: 13 }

export function WasteMap() {
  const { texts } = useMapTexts()
  return (
    <DocsMap>
      {(provider) => (
        <Map.Root
          provider={provider}
          label={texts.wasteLabel}
          places={texts.wastePlaces}
          layers={texts.layers}
          initialView={initialView}
        >
          <Map.Skip />
          <Map.Viewport>
            <Map.Layers />
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
