'use client'
import { Map } from '@kvirn-ui/map'
import { useMapTexts } from './texts.ts'
import { DocsMap } from './use-docs-provider.tsx'

const initialView = { center: { longitude: 18.07, latitude: 59.33 }, zoom: 13 }

export function RecyclingMap() {
  const { texts } = useMapTexts()
  return (
    <DocsMap>
      {(provider) => (
        <Map.Root
          provider={provider}
          label={texts.stationsLabel}
          places={texts.stations}
          initialView={initialView}
        >
          <Map.Skip />
          <Map.Viewport>
            <Map.Markers />
            <Map.Controls />
          </Map.Viewport>
          <Map.List headingLevel="h3" />
          <Map.Details />
        </Map.Root>
      )}
    </DocsMap>
  )
}
