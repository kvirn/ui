import { Checkbox, Disclosure, Field, Fieldset } from '@kvirn-ui/react'
import type { MapLayer } from '@kvirn-ui/core'
import { useState } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'
import { useMapOverlayRef } from './map-overlay.tsx'

export interface MapLayersState {
  layers: readonly MapLayer[]
  hiddenLayerIds: readonly string[]
  setLayerHidden: (id: string, hidden: boolean) => void
  /** The places in each layer in the map view, by layer id, for badges. */
  counts: Readonly<Record<string, number>>
}

export interface MapLayersProps extends Omit<ComponentPropsWithRef<'fieldset'>, 'children'> {
  /** A decorative swatch before the label, such as the layer's marker icon. It is not read. */
  icon?: ((layer: MapLayer) => ReactNode) | undefined
  /** A class on each layer's row, such as the one its markers have, so a swatch can match them. */
  layerClassName?: ((layer: MapLayer) => string | undefined) | undefined
  /** Replaces the checkboxes, for example with a switch per layer. */
  children?: ((state: MapLayersState) => ReactNode) | undefined
  /** Lets the visitor collapse the card behind its title. Default `true`; `false` keeps it always open. */
  collapsible?: boolean | undefined
  /** Controlled: whether the layers are shown. Pair it with `onOpenChange`. */
  open?: boolean | undefined
  /** Uncontrolled: whether the layers start shown. Default `true`. */
  defaultOpen?: boolean | undefined
  /** Called when the visitor opens or closes the card, with the new state. */
  onOpenChange?: ((open: boolean) => void) | undefined
}

/**
 * Lets the visitor show and hide layers: a card titled `map.layersLegend` that collapses behind a
 * disclosure button (open by default), with one checkbox per layer named with its place count
 * ("Hotels 100"). Put it inside
 * `Map.Viewport`: it floats on the map and is panned clear of a focused marker. It renders nothing
 * without layers.
 */
export function MapLayers({
  icon,
  layerClassName,
  children,
  collapsible = true,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  ref,
  ...otherProps
}: MapLayersProps): ReactElement | null {
  const map = useMapContext('Layers')
  const overlayRef = useMapOverlayRef(ref)
  const [ownOpen, setOwnOpen] = useState(defaultOpen)
  if (map.layers.length === 0) {
    return null
  }
  const isOpen = open ?? ownOpen
  const hiddenCount = map.layers.filter((layer) => map.hiddenLayerIds.includes(layer.id)).length
  const rows = children
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
              <span className="kv-map-layer-count">{map.messages.layerCountValue({ count })}</span>
            </Field.Label>
            {layer.description ? <Field.HelpText>{layer.description}</Field.HelpText> : null}
          </Field.Root>
        )
      })

  if (!collapsible) {
    return (
      <Fieldset.Root
        group
        {...otherProps}
        ref={overlayRef}
        className={joinClassNames('kv-map-layers', className)}
      >
        <Fieldset.Legend marker="none">{map.messages.layersLegend}</Fieldset.Legend>
        {rows}
      </Fieldset.Root>
    )
  }

  // The fieldset is only the card (and passes `disabled` down); the group's name is on the inner fieldset,
  // so a collapsed card has one name, the button's, and an open one names the group once.
  return (
    <Fieldset.Root
      group
      role="none"
      {...otherProps}
      ref={overlayRef}
      className={joinClassNames('kv-map-layers', className)}
    >
      <Disclosure.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(nextOpen) => {
          setOwnOpen(nextOpen)
          onOpenChange?.(nextOpen)
        }}
      >
        <Disclosure.Trigger className="kv-map-layers-trigger">
          <span className="kv-map-layers-title">{map.messages.layersLegend}</span>{' '}
          {!isOpen && hiddenCount > 0 ? (
            <span className="kv-map-layers-hidden">
              {map.messages.layersHiddenValue({ count: hiddenCount })}
            </span>
          ) : null}
        </Disclosure.Trigger>
        <Disclosure.Panel className="kv-map-layers-panel">
          <Fieldset.Root
            group
            aria-label={map.messages.layersLegend}
            className="kv-map-layers-group"
          >
            {rows}
          </Fieldset.Root>
        </Disclosure.Panel>
      </Disclosure.Root>
    </Fieldset.Root>
  )
}
MapLayers.displayName = 'Map.Layers'
