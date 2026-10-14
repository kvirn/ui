import { Field, RadioGroup } from '@kvirn-ui/react'
import type { MapBaseMap } from '@kvirn-ui/core'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'

export interface MapBaseMapSwitchState {
  baseMaps: readonly MapBaseMap[]
  baseMap: string
  setBaseMap: (id: string) => void
}

export interface MapBaseMapSwitchProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Replaces the radios, for example with a native select in a Field. */
  children?: ((state: MapBaseMapSwitchState) => ReactNode) | undefined
}

/**
 * Lets the visitor choose the map type (standard, satellite, terrain): a radio group under the
 * legend `map.baseMapLabel`, one radio per base map. Put it beside the viewport, next to
 * `Map.List`, not over the canvas. It renders nothing with fewer than two base maps.
 */
export function MapBaseMapSwitch({
  children,
  className,
  ...otherProps
}: MapBaseMapSwitchProps): ReactElement | null {
  const map = useMapContext('BaseMapSwitch')
  if (map.baseMaps.length < 2 || map.baseMap === null) {
    return null
  }
  return (
    <div {...otherProps} className={joinClassNames('kv-map-base-maps', className)}>
      {children ? (
        children({ baseMaps: map.baseMaps, baseMap: map.baseMap, setBaseMap: map.setBaseMap })
      ) : (
        <RadioGroup.Root value={map.baseMap} onValueChange={map.setBaseMap}>
          <RadioGroup.Legend marker="none">{map.messages.baseMapLabel}</RadioGroup.Legend>
          {map.baseMaps.map((baseMap) => (
            <Field.Root key={baseMap.id}>
              <RadioGroup.Radio value={baseMap.id} />
              <Field.Label>{baseMap.label}</Field.Label>
            </Field.Root>
          ))}
        </RadioGroup.Root>
      )}
    </div>
  )
}
MapBaseMapSwitch.displayName = 'Map.BaseMapSwitch'
