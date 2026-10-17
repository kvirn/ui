import { chevronDown } from '@kvirn-ui/icons'
import { Field, Icon, Popover, RadioGroup } from '@kvirn-ui/react'
import type { MapBaseMap } from '@kvirn-ui/core'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'
import { useMapOverlayRef } from './map-overlay.tsx'

export interface MapBaseMapSwitchState {
  baseMaps: readonly MapBaseMap[]
  baseMap: string
  setBaseMap: (id: string) => void
  /** The legend text, `map.baseMapLabel`, for a render function's own group name. */
  label: string
}

export interface MapBaseMapSwitchProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** A decorative preview of a base map, such as a tile image. It is not read. Default: a token-drawn preview. */
  icon?: ((baseMap: MapBaseMap) => ReactNode) | undefined
  /** Replaces the trigger and the tiles, for example with a native select in a Field. */
  children?: ((state: MapBaseMapSwitchState) => ReactNode) | undefined
}

function BaseMapPreview({
  baseMap,
  icon,
}: {
  baseMap: MapBaseMap
  icon: MapBaseMapSwitchProps['icon']
}): ReactElement {
  return (
    <span className="kv-map-base-map-preview" aria-hidden="true">
      {icon ? icon(baseMap) : <span className="kv-map-base-map-art" />}
    </span>
  )
}

/**
 * Lets the visitor choose the map type (standard, satellite, terrain): a button showing the current
 * map that opens a popover of preview tiles, one native radio per base map under the legend
 * `map.baseMapLabel`. Put it inside `Map.Viewport`: it floats on the map and is panned clear of a
 * focused marker. It renders nothing with fewer than two base maps.
 */
export function MapBaseMapSwitch({
  icon,
  children,
  className,
  ref,
  ...otherProps
}: MapBaseMapSwitchProps): ReactElement | null {
  const map = useMapContext('BaseMapSwitch')
  const overlayRef = useMapOverlayRef(ref)
  if (map.baseMaps.length < 2 || map.baseMap === null) {
    return null
  }
  const current = map.baseMaps.find((baseMap) => baseMap.id === map.baseMap) ?? map.baseMaps[0]!
  return (
    <div {...otherProps} ref={overlayRef} className={joinClassNames('kv-map-base-maps', className)}>
      {children ? (
        children({
          baseMaps: map.baseMaps,
          baseMap: map.baseMap,
          setBaseMap: map.setBaseMap,
          label: map.messages.baseMapLabel,
        })
      ) : (
        <Popover.Root placement="top-start">
          <Popover.Trigger className="kv-map-base-maps-trigger">
            <BaseMapPreview baseMap={current} icon={icon} />
            {map.messages.baseMapLabel}
            <span className="kv-map-base-maps-chevron" aria-hidden="true">
              <Icon name="chevron-down" icon={chevronDown} size="16" />
            </span>
          </Popover.Trigger>
          <Popover.Popup aria-label={map.messages.baseMapLabel} className="kv-map-base-maps-popup">
            <RadioGroup.Root value={map.baseMap} onValueChange={map.setBaseMap}>
              <RadioGroup.Legend marker="none">{map.messages.baseMapLabel}</RadioGroup.Legend>
              <div className="kv-map-base-maps-options">
                {map.baseMaps.map((baseMap) => (
                  <Field.Root key={baseMap.id}>
                    <RadioGroup.Radio value={baseMap.id} />
                    <Field.Label>
                      <BaseMapPreview baseMap={baseMap} icon={icon} />
                      {baseMap.label}
                    </Field.Label>
                  </Field.Root>
                ))}
              </div>
            </RadioGroup.Root>
          </Popover.Popup>
        </Popover.Root>
      )}
    </div>
  )
}
MapBaseMapSwitch.displayName = 'Map.BaseMapSwitch'
