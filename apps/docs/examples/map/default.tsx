'use client'
import { Map, createMemoryProvider } from '@kvirn-ui/map'
import { Icon } from '@kvirn-ui/react'
import { useMapTexts } from './texts.ts'

const provider = createMemoryProvider({ size: { width: 640, height: 400 } })

const initialView = { center: { longitude: 18.07, latitude: 59.33 }, zoom: 13 }

export function RecyclingMap() {
  const { texts } = useMapTexts()
  return (
    <Map.Root
      provider={provider}
      label={texts.stationsLabel}
      places={texts.stations}
      initialView={initialView}
    >
      <Map.Skip />
      <Map.Viewport>
        <Map.Markers>{() => <Icon name="info" size="16" />}</Map.Markers>
        <Map.Controls />
      </Map.Viewport>
      <Map.List headingLevel="h3" />
      <Map.Details />
    </Map.Root>
  )
}
