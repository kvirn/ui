'use client'
import { Map } from '@kvirn-ui/map'
import { useMapTexts } from './texts.ts'
import { DocsMap } from './use-docs-provider.tsx'

const initialView = { center: { longitude: 18.07, latitude: 59.33 }, zoom: 13 }

export function PreschoolMap() {
  const { texts } = useMapTexts()
  return (
    <DocsMap>
      {(provider) => (
        <Map.Root
          provider={provider}
          label={texts.preschoolsLabel}
          places={texts.preschools}
          initialView={initialView}
        >
          <Map.Skip />
          <Map.Viewport>
            <Map.Markers />
            <Map.Controls />
            <Map.Attribution />
          </Map.Viewport>
          <Map.List headingLevel="h4">
            {(place) => <span className="kv-map-list-aside">{texts.hours[place.id]}</span>}
          </Map.List>
          <Map.Details />
        </Map.Root>
      )}
    </DocsMap>
  )
}
