'use client'
import { book, playground, swimmingPool } from '@kvirn-ui/icons'
import type { IconData } from '@kvirn-ui/icons'
import { Map } from '@kvirn-ui/map'
import { Field, Icon, Switch } from '@kvirn-ui/react'
import { useMapTexts } from './texts.ts'
import { DocsMap } from './use-docs-provider.tsx'

// One icon per layer, so colour is never the only difference between the kinds of place.
const layerIcons: Record<string, IconData> = {
  playgrounds: playground,
  libraries: book,
  pools: swimmingPool,
}

function LayerIcon({ layer }: { layer: string | undefined }) {
  const icon = layerIcons[layer ?? '']
  return icon ? <Icon icon={icon} size="16" /> : null
}

const initialView = { center: { longitude: 18.07, latitude: 59.328 }, zoom: 13 }

export function FamilyMap() {
  const { texts } = useMapTexts()
  return (
    <DocsMap>
      {(provider) => (
        <Map.Root
          provider={provider}
          label={texts.familyLabel}
          places={texts.familyPlaces}
          layers={texts.familyLayers}
          initialView={initialView}
        >
          <Map.Skip />
          <Map.Viewport>
            <Map.Layers>
              {({ layers, hiddenLayerIds, setLayerHidden, counts }) =>
                layers.map((layer) => (
                  <Field.Root key={layer.id}>
                    <Switch
                      checked={!hiddenLayerIds.includes(layer.id)}
                      onCheckedChange={(checked) => setLayerHidden(layer.id, !checked)}
                    />
                    <Field.Label marker="none">
                      {layer.label} ({counts[layer.id] ?? 0})
                    </Field.Label>
                  </Field.Root>
                ))
              }
            </Map.Layers>
            <Map.BaseMapSwitch />
            <Map.Markers
              label={(place, layer) => `${place.name}, ${layer?.label}`}
              markerClassName={(place) => `family-marker family-marker--${place.layer}`}
              cluster={(cluster, { layer }) => (
                <span className="family-cluster">
                  <LayerIcon layer={layer?.id} /> {cluster.count}
                </span>
              )}
            >
              {(place) => (
                <>
                  <LayerIcon layer={place.layer} />
                  {place.layer === 'libraries' ? (
                    <span className="kv-map-marker-label">{place.name}</span>
                  ) : null}
                </>
              )}
            </Map.Markers>
            <Map.Controls />
            <Map.Attribution />
          </Map.Viewport>
          <Map.List headingLevel="h4" />
          <Map.Details>
            {({ place, titleProps }) => (
              <div className="kv-map-details-content family-details">
                <h3 {...titleProps}>{place.name}</h3>
                <Map.DetailsClose />
                <p>
                  <strong>{texts.openingHours}:</strong> {texts.familyHours[place.id]}
                </p>
                <p>{place.address}</p>
                <a
                  className="kv-button kv-button--primary"
                  href={`https://www.openstreetmap.org/directions?to=${place.position.latitude}%2C${place.position.longitude}`}
                >
                  {texts.directions}
                </a>
              </div>
            )}
          </Map.Details>
          <Map.ClusterPopup>
            <div className="kv-map-details-content">
              <Map.ClusterPopupTitle />
              <Map.ClusterPopupClose />
              <Map.ClusterPopupPlaces
                renderPlace={(place, select) => (
                  <button type="button" className="kv-map-cluster-place-trigger" onClick={select}>
                    <LayerIcon layer={place.layer} /> {place.name}
                  </button>
                )}
              />
            </div>
          </Map.ClusterPopup>
        </Map.Root>
      )}
    </DocsMap>
  )
}
