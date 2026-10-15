'use client'
import { Map, useMapState, createMemoryProvider } from '@kvirn-ui/map'
import { Icon } from '@kvirn-ui/react'
import { useMapTexts } from './texts.ts'

const provider = createMemoryProvider({ size: { width: 640, height: 400 } })

const initialView = { center: { longitude: 18.07, latitude: 59.33 }, zoom: 13 }
const headingId = 'station-list-heading'

function StationList() {
  const map = useMapState()
  const { texts } = useMapTexts()
  if (map.selectedPlace) {
    return null
  }
  return (
    <div>
      <h4 id={headingId} tabIndex={-1}>
        {texts.ownListHeading(map.placesInViewCount, map.visibleCount)}
      </h4>
      <ul>
        {map.placesInView.map((place) => (
          <li key={place.id}>
            <button
              id={`station-${place.id}`}
              type="button"
              className="kv-button"
              aria-expanded={false}
              aria-controls={map.ids.details}
              onClick={() => map.select(place.id, `station-${place.id}`)}
            >
              {place.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function OwnListMap() {
  const { texts } = useMapTexts()
  return (
    <Map.Root
      provider={provider}
      label={texts.stationsLabel}
      places={texts.stations}
      initialView={initialView}
      cluster={false}
    >
      <Map.Skip href={`#${headingId}`} />
      <Map.Viewport>
        <Map.Markers>{() => <Icon name="info" size="16" />}</Map.Markers>
        <Map.Controls />
      </Map.Viewport>
      <StationList />
      <Map.Details />
    </Map.Root>
  )
}
