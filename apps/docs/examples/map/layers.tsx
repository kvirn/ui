'use client'
import { Map, createMemoryProvider } from '@kvirn-ui/map'
import { Icon } from '@kvirn-ui/react'
import type { IconName } from '@kvirn-ui/react'
import { useMapTexts } from './texts.ts'

const provider = createMemoryProvider({ size: { width: 640, height: 400 } })

const initialView = { center: { longitude: 18.07, latitude: 59.33 }, zoom: 13 }

// A shape for each layer, so colour is never the only difference between them (1.4.1).
const layerIcons: Readonly<Record<string, IconName>> = {
  recycling: 'delete',
  hazardous: 'warning',
  reuse: 'info',
}
const iconOf = (layerId: string | undefined): IconName =>
  (layerId === undefined ? undefined : layerIcons[layerId]) ?? 'info'

export function WasteMap() {
  const { texts } = useMapTexts()
  return (
    <Map.Root
      provider={provider}
      label={texts.wasteLabel}
      places={texts.wastePlaces}
      layers={texts.layers}
      initialView={initialView}
    >
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers>{(place) => <Icon name={iconOf(place.layer)} size="16" />}</Map.Markers>
        <Map.Layers icon={(layer) => <Icon name={iconOf(layer.id)} size="16" />} />
        <Map.Controls />
      </Map.Viewport>
      <Map.List headingLevel="h4" icon={(place) => <Icon name={iconOf(place.layer)} size="16" />} />
      <Map.Details />
    </Map.Root>
  )
}
