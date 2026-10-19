import type { ComponentPropsWithRef, KeyboardEvent, ReactElement } from 'react'
import { joinClassNames } from './class-names.ts'
import { hasModifier } from './has-modifier.ts'
import { useMapContext } from './map-context.ts'
import { MapSearchResult } from './map-search-result.tsx'
import type { MapPanDirection } from './use-map.ts'

const panKeys: Record<string, MapPanDirection> = {
  ArrowUp: 'north',
  ArrowDown: 'south',
  ArrowRight: 'east',
  ArrowLeft: 'west',
}

export type MapViewportProps = Omit<
  ComponentPropsWithRef<'div'>,
  'role' | 'tabIndex' | 'aria-label' | 'aria-roledescription' | 'aria-describedby'
>

/**
 * The map's region: focusable, with the keyboard that drives the camera (arrows pan, + and -
 * zoom, Escape hides the hint). The engine draws into it; its other parts are its children.
 */
export function MapViewport({
  children,
  onKeyDown,
  className,
  ...otherProps
}: MapViewportProps): ReactElement {
  const map = useMapContext('Viewport')
  const { messages, setEngineElement } = map

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.target !== event.currentTarget || hasModifier(event)) {
      return
    }
    const direction = panKeys[event.key]
    if (direction) {
      event.preventDefault()
      map.pan(direction)
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      map.zoomIn()
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      map.zoomOut()
    } else if (event.key === 'Escape' && (!map.isKeyboardHintDismissed || map.gestureHint)) {
      map.dismissKeyboardHint()
    }
  }

  const modifier =
    typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') ? 'Command' : 'Ctrl'

  const viewportProps = {
    className: joinClassNames('kv-map-viewport', className),
    role: 'region',
    tabIndex: 0,
    'aria-label': map.label,
    'aria-roledescription': messages.roleDescription,
    'aria-describedby': `${map.ids.summary} ${map.ids.keyboardHint}`,
    id: map.ids.viewport,
    'data-status': map.status,
    onKeyDown: handleKeyDown,
  }

  return (
    <div {...otherProps} {...viewportProps}>
      <div ref={setEngineElement} className="kv-map-engine" aria-hidden="true" />
      <span id={map.ids.summary} className="kv-visually-hidden">
        {messages.summary({ count: map.visibleCount })}
      </span>
      <p
        id={map.ids.keyboardHint}
        className="kv-map-hint"
        data-dismissed={map.isKeyboardHintDismissed ? '' : undefined}
      >
        {messages.keyboardHint}
      </p>
      {map.gestureHint ? (
        <p className="kv-map-hint kv-map-hint--gesture" data-gesture={map.gestureHint}>
          {map.gestureHint === 'touch'
            ? messages.gestureTouch
            : messages.gestureWheel({ modifier })}
        </p>
      ) : null}
      {map.status === 'loading' ? (
        <p className="kv-map-status" data-state="loading">
          <span className="kv-spinner" aria-hidden="true" />
          {messages.loading}
        </p>
      ) : null}
      {map.status === 'failed' ? (
        <div className="kv-map-status" data-state="failed">
          <strong>{messages.tilesFailedTitle}</strong>
          <p>{messages.tilesFailedBody}</p>
        </div>
      ) : null}
      <MapSearchResult />
      {children}
    </div>
  )
}
MapViewport.displayName = 'Map.Viewport'
