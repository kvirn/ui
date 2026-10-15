import { SkipLink } from '@kvirn-ui/react'
import { useContext } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { MapListPresenceContext, useMapContext } from './map-context.ts'

export interface MapSkipProps {
  children?: ReactNode
  /** The target when you render your own list instead of `Map.List`: `#my-list-heading`. */
  href?: string | undefined
}

/**
 * A skip link to the list of places (WCAG 2.4.1). Put it before the viewport. It goes to the
 * details while a place is open, else to `Map.List`, else to your `href`. With none of them there
 * is nothing to skip to, and it renders nothing.
 */
export function MapSkip({ children, href }: MapSkipProps): ReactElement | null {
  const map = useMapContext('Skip')
  const presence = useContext(MapListPresenceContext)
  // The details title exists only once the popup is ready; until then the viewport is the target.
  const target = map.selectedPlace
    ? `#${map.isPopupReady ? map.ids.detailsTitle : map.ids.viewport}`
    : presence?.hasList
      ? `#${map.ids.listHeading}`
      : href
  if (target === undefined) {
    return null
  }
  return <SkipLink href={target}>{children ?? map.messages.skipToList}</SkipLink>
}
MapSkip.displayName = 'Map.Skip'
