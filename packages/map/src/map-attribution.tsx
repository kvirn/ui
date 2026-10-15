import type { MapBaseMap } from '@kvirn-ui/core'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'
import { useMapOverlayRef } from './map-overlay.tsx'

export interface MapAttributionProps extends Omit<ComponentPropsWithRef<'p'>, 'children'> {
  /** Your text and links, or a function of the active base map. Default: its `attribution`. */
  children?: ReactNode | ((baseMap: MapBaseMap) => ReactNode)
}

/** The data source's attribution and licence: your text and links, named `map.attributionLabel`. */
export function MapAttribution({
  children,
  className,
  ref,
  ...otherProps
}: MapAttributionProps): ReactElement | null {
  const map = useMapContext('Attribution')
  const overlayRef = useMapOverlayRef(ref)
  const content =
    typeof children === 'function'
      ? map.activeBaseMap === null
        ? null
        : children(map.activeBaseMap)
      : (children ?? map.activeBaseMap?.attribution)
  if (content === null || content === undefined || content === false) {
    return null
  }
  return (
    <p
      {...otherProps}
      ref={overlayRef}
      className={joinClassNames('kv-map-attribution', className)}
      aria-label={map.messages.attributionLabel}
    >
      {content}
    </p>
  )
}
MapAttribution.displayName = 'Map.Attribution'
