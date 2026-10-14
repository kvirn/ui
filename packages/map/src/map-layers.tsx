import { Checkbox, Field, Fieldset } from '@kvirn-ui/react'
import type { MapLayer } from '@kvirn-ui/core'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'

export interface MapLayersState {
  layers: readonly MapLayer[]
  hiddenLayerIds: readonly string[]
  setLayerHidden: (id: string, hidden: boolean) => void
}

export interface MapLayersProps extends Omit<ComponentPropsWithRef<'fieldset'>, 'children'> {
  /** A decorative swatch before the label, such as the layer's marker icon. It is not read. */
  icon?: ((layer: MapLayer) => ReactNode) | undefined
  /** Replaces the checkboxes, for example with a switch per layer. */
  children?: ((state: MapLayersState) => ReactNode) | undefined
}

/**
 * Lets the visitor show and hide layers: a fieldset under the legend `map.layersLegend`, one
 * checkbox per layer with its place count. Put it beside the viewport, next to `Map.List`. It
 * renders nothing without layers.
 */
export function MapLayers({
  icon,
  children,
  className,
  ...otherProps
}: MapLayersProps): ReactElement | null {
  const map = useMapContext('Layers')
  if (map.layers.length === 0) {
    return null
  }
  return (
    <Fieldset.Root group {...otherProps} className={joinClassNames('kv-map-layers', className)}>
      <Fieldset.Legend marker="none">{map.messages.layersLegend}</Fieldset.Legend>
      {children
        ? children({
            layers: map.layers,
            hiddenLayerIds: map.hiddenLayerIds,
            setLayerHidden: map.setLayerHidden,
          })
        : map.layers.map((layer) => {
            const count = map.layerCounts[layer.id] ?? 0
            return (
              <Field.Root key={layer.id}>
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
                  {map.messages.layerCount({ label: layer.label, count })}
                </Field.Label>
                {layer.description ? <Field.HelpText>{layer.description}</Field.HelpText> : null}
              </Field.Root>
            )
          })}
    </Fieldset.Root>
  )
}
MapLayers.displayName = 'Map.Layers'
