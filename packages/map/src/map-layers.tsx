import { Checkbox, Field, Fieldset } from '@kvirn-ui/react'
import type { MapLayer } from '@kvirn-ui/core'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'
import { useMapOverlayRef } from './map-overlay.tsx'

export interface MapLayersState {
  layers: readonly MapLayer[]
  hiddenLayerIds: readonly string[]
  setLayerHidden: (id: string, hidden: boolean) => void
  /** The places in each layer in the map view, by layer id, for chips and badges. */
  counts: Readonly<Record<string, number>>
}

export interface MapLayersProps extends Omit<ComponentPropsWithRef<'fieldset'>, 'children'> {
  /** A decorative swatch before the label, such as the layer's marker icon. It is not read. */
  icon?: ((layer: MapLayer) => ReactNode) | undefined
  /** A class on each layer's row, such as the one its markers have, so a swatch can match them. */
  layerClassName?: ((layer: MapLayer) => string | undefined) | undefined
  /** Replaces the checkboxes, for example with a switch per layer. */
  children?: ((state: MapLayersState) => ReactNode) | undefined
}

/**
 * Lets the visitor show and hide layers: a fieldset under the legend `map.layersLegend`, one
 * checkbox per layer named with its place count ("Hotels 100"), drawn as stacked chips. Put it inside
 * `Map.Viewport`: it floats on the map and is panned clear of a focused marker. It renders nothing
 * without layers.
 */
export function MapLayers({
  icon,
  layerClassName,
  children,
  className,
  ref,
  ...otherProps
}: MapLayersProps): ReactElement | null {
  const map = useMapContext('Layers')
  const overlayRef = useMapOverlayRef(ref)
  if (map.layers.length === 0) {
    return null
  }
  return (
    <Fieldset.Root
      group
      {...otherProps}
      ref={overlayRef}
      className={joinClassNames('kv-map-layers', className)}
    >
      <Fieldset.Legend marker="none">{map.messages.layersLegend}</Fieldset.Legend>
      {children
        ? children({
            layers: map.layers,
            hiddenLayerIds: map.hiddenLayerIds,
            setLayerHidden: map.setLayerHidden,
            counts: map.layerCounts,
          })
        : map.layers.map((layer) => {
            const count = map.layerCounts[layer.id] ?? 0
            return (
              <Field.Root key={layer.id} className={layerClassName?.(layer)}>
                <Checkbox
                  checked={!map.hiddenLayerIds.includes(layer.id)}
                  onCheckedChange={(checked) => map.setLayerHidden(layer.id, !checked)}
                />
                <Field.Label>
                  {icon ? (
                    <span className="kv-map-layer-swatch" aria-hidden="true">
                      {icon(layer)}
                    </span>
                  ) : null}
                  <span className="kv-map-layer-name">{layer.label}</span>{' '}
                  <span className="kv-map-layer-count">
                    {map.messages.layerCountValue({ count })}
                  </span>
                </Field.Label>
                {layer.description ? <Field.HelpText>{layer.description}</Field.HelpText> : null}
              </Field.Root>
            )
          })}
    </Fieldset.Root>
  )
}
MapLayers.displayName = 'Map.Layers'
