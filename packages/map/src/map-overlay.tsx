import { useMergedRef } from '@kvirn-ui/react/internal'
import { useCallback, useRef } from 'react'
import type { ComponentPropsWithRef, ElementType, ReactElement, Ref } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'

/** Declares an element as floating over the map, so a focused marker is panned out from under it. */
export function useMapOverlayRef<Instance extends HTMLElement>(
  consumerRef: Ref<Instance> | undefined,
): Ref<Instance> {
  const { registerOverlay } = useMapContext('Overlay')
  const unregister = useRef<(() => void) | null>(null)
  const ownRef = useCallback(
    (element: Instance | null) => {
      unregister.current?.()
      unregister.current = element ? registerOverlay(element) : null
    },
    [registerOverlay],
  )
  return useMergedRef(consumerRef, ownRef)
}

export interface MapOverlayProps extends ComponentPropsWithRef<'div'> {
  as?: ElementType | undefined
}

/**
 * Your chrome floating over the map, such as a search box or a legend. A marker you reach by
 * keyboard is panned out from under it (WCAG 2.4.11). Position it with your own classes.
 */
export function MapOverlay({
  as: Root = 'div',
  className,
  ref,
  ...otherProps
}: MapOverlayProps): ReactElement {
  const overlayRef = useMapOverlayRef(ref)
  return (
    <Root
      {...otherProps}
      ref={overlayRef}
      className={joinClassNames('kv-map-overlay', className)}
    />
  )
}
MapOverlay.displayName = 'Map.Overlay'
