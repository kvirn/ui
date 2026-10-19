import { pin } from '@kvirn-ui/icons'
import { Icon } from '@kvirn-ui/react'
import { useRef } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { useMapContext } from './map-context.ts'
import { useMapFrame } from './use-map-frame.ts'

/**
 * The pin that `show(address)` draws. `Map.Viewport` renders it: it is decoration (the
 * announcement and the search field carry the meaning), so it takes no focus and no press.
 */
export function MapSearchResult(): ReactElement | null {
  const map = useMapContext('SearchResult')
  const { handle, searchResult } = map
  const elementRef = useRef<HTMLSpanElement | null>(null)
  useMapFrame(handle, () => {
    const point = searchResult === null ? undefined : handle?.project(searchResult.position)
    if (elementRef.current && point) {
      elementRef.current.style.setProperty('--kv-map-x', `${point.x}px`)
      elementRef.current.style.setProperty('--kv-map-y', `${point.y}px`)
    }
  })
  const point = searchResult === null ? undefined : handle?.project(searchResult.position)
  if (!point) {
    return null
  }
  const style = { '--kv-map-x': `${point.x}px`, '--kv-map-y': `${point.y}px` } as CSSProperties
  return (
    <span ref={elementRef} className="kv-map-search-result" style={style} aria-hidden="true">
      <Icon icon={pin} className="kv-map-search-result-pin" />
    </span>
  )
}
