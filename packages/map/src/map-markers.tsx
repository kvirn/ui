import type { MapCluster as MapClusterData, MapLayer, MapPlace } from '@kvirn-ui/core'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ComponentPropsWithRef, CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { hasModifier } from './has-modifier.ts'
import { useMapContext } from './map-context.ts'
import { useMapFrame } from './use-map-frame.ts'

export interface MapMarkerProps<Data = unknown> extends ComponentPropsWithRef<'button'> {
  place: MapPlace<Data>
}

/** One place as a button over the map. Use `Map.Markers`, which renders the set. */
export function MapMarker<Data = unknown>({
  place,
  children,
  className,
  onClick,
  onFocus,
  'aria-label': ariaLabel,
  ...otherProps
}: MapMarkerProps<Data>) {
  const map = useMapContext<Data>('Marker')
  const point = map.handle?.project(place.position)
  const isSelected = map.selectedPlace?.id === place.id
  const isTabStop = map.tabStopKey === place.id
  if (!point) {
    return null
  }
  const style = { '--kv-map-x': `${point.x}px`, '--kv-map-y': `${point.y}px` } as CSSProperties
  return (
    <button
      {...otherProps}
      id={map.markerId(place.id)}
      type="button"
      className={joinClassNames('kv-map-marker', className)}
      style={style}
      tabIndex={isTabStop ? 0 : -1}
      aria-label={ariaLabel ?? place.name}
      aria-expanded={isSelected}
      aria-controls={map.ids.details}
      data-kv-map-marker=""
      data-selected={isSelected ? '' : undefined}
      data-highlighted={map.highlightedPlaceId === place.id ? '' : undefined}
      onClick={(event) => {
        onClick?.(event)
        map.select(place.id, map.markerId(place.id))
      }}
      onMouseEnter={() => map.setHighlightedPlaceId(place.id)}
      onMouseLeave={() => map.setHighlightedPlaceId(null)}
      onFocus={(event) => {
        onFocus?.(event)
        map.setActiveMarkerId(place.id)
        map.keepClear(event.currentTarget)
      }}
    >
      {children}
    </button>
  )
}
MapMarker.displayName = 'Map.Marker'

export interface MapClusterProps<Data = unknown> extends Omit<
  ComponentPropsWithRef<'button'>,
  'children'
> {
  cluster: MapClusterData<Data>
  /** The visible content. Default: the number of places. */
  children?: ReactNode
}

/** A group of nearby places as one button: pressing it opens the cluster popup. Use `Map.Markers`, which renders them. */
export function MapCluster<Data = unknown>({
  cluster,
  children,
  className,
  onClick,
  onFocus,
  'aria-label': ariaLabel,
  ...otherProps
}: MapClusterProps<Data>) {
  const map = useMapContext<Data>('Cluster')
  const point = map.handle?.project(cluster.position)
  if (!point) {
    return null
  }
  const { count } = cluster
  const layerLabel = map.layers.find((layer) => layer.id === cluster.layer)?.label
  const name =
    layerLabel === undefined
      ? map.messages.clusterLabel({ count })
      : map.messages.clusterLayerLabel({ count, layer: layerLabel })
  const style = { '--kv-map-x': `${point.x}px`, '--kv-map-y': `${point.y}px` } as CSSProperties
  const markerId = map.clusterMarkerId(cluster.id)
  return (
    <button
      {...otherProps}
      id={markerId}
      type="button"
      className={joinClassNames('kv-map-cluster', className)}
      style={style}
      tabIndex={map.tabStopKey === cluster.id ? 0 : -1}
      aria-label={ariaLabel ?? name}
      aria-haspopup="dialog"
      aria-expanded={map.openedCluster?.id === cluster.id}
      aria-controls={map.ids.clusterPopup}
      data-kv-map-marker=""
      onClick={(event) => {
        onClick?.(event)
        map.openCluster(cluster.id, markerId)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        map.setActiveMarkerId(cluster.id)
        map.keepClear(event.currentTarget)
      }}
    >
      {children ?? <span className="kv-map-cluster-count">{count}</span>}
    </button>
  )
}
MapCluster.displayName = 'Map.Cluster'

export interface MapMarkerState {
  selected: boolean
  highlighted: boolean
  /** The place's layer, so its look and name can follow the layer's. */
  layer: MapLayer | undefined
}

export interface MapClusterState {
  opened: boolean
  /** The cluster's layer: a cluster never mixes layers. */
  layer: MapLayer | undefined
}

export interface MapMarkersProps<Data = unknown> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  /**
   * The marker's content for a place: a 16px icon, an image or text. It sits inside the one
   * native button, so it is not read: the button is named from `label`.
   */
  children?: ((place: MapPlace<Data>, state: MapMarkerState) => ReactNode) | undefined
  /** The accessible name of a marker. Default: the place's `name`. */
  label?: ((place: MapPlace<Data>, layer: MapLayer | undefined) => string) | undefined
  /** Classes added to every marker button: one string, or one per place (a layer or category). */
  markerClassName?:
    | string
    | ((place: MapPlace<Data>, layer: MapLayer | undefined) => string)
    | undefined
  /** The content of a cluster's button. Default: the number of places. */
  cluster?: ((cluster: MapClusterData<Data>, state: MapClusterState) => ReactNode) | undefined
  /** The accessible name of a cluster. Default: `map.clusterLabel`, or `map.clusterLayerLabel` for a layer's. */
  clusterLabel?:
    | ((cluster: MapClusterData<Data>, layer: MapLayer | undefined) => string)
    | undefined
  /** Classes added to every cluster button: one string, or one per cluster (its layer). */
  clusterClassName?:
    | string
    | ((cluster: MapClusterData<Data>, layer: MapLayer | undefined) => string)
    | undefined
}

/**
 * The set of markers for the places in view: one Tab stop, then the arrow keys, Home and End move
 * between them (map.md §7).
 */
export function MapMarkers<Data = unknown>({
  children,
  label,
  markerClassName,
  cluster,
  clusterLabel,
  clusterClassName,
  className,
  onKeyDown,
  ...otherProps
}: MapMarkersProps<Data>) {
  const map = useMapContext<Data>('Markers')
  const { setPopupSlot, handle } = map

  // Markers follow the camera frame by frame by their own style, so a move is not a React render.
  const [elements] = useState(() => new Map<string, HTMLElement>())
  const [elementRefs] = useState(() => new Map<string, (element: HTMLElement | null) => void>())
  const drawn = useRef(map.markersInView)
  useLayoutEffect(() => {
    drawn.current = map.markersInView
  })
  useMapFrame(handle, () => {
    for (const item of drawn.current) {
      const key = item.type === 'place' ? item.place.id : item.cluster.id
      const point = handle?.project(
        item.type === 'place' ? item.place.position : item.cluster.position,
      )
      const element = elements.get(key)
      if (element && point) {
        element.style.setProperty('--kv-map-x', `${point.x}px`)
        element.style.setProperty('--kv-map-y', `${point.y}px`)
      }
    }
  })
  const registerElement = (key: string) => {
    let register = elementRefs.get(key)
    if (!register) {
      register = (element) => {
        if (element) {
          elements.set(key, element)
        } else {
          elements.delete(key)
          elementRefs.delete(key)
        }
      }
      elementRefs.set(key, register)
    }
    return register
  }

  if (map.markersInView.length === 0 || !map.handle) {
    return null
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || hasModifier(event)) {
      return
    }
    const buttons = [
      ...event.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-kv-map-marker]'),
    ]
    const current = buttons.findIndex((button) => button === document.activeElement)
    if (current === -1) {
      return
    }
    const isRtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight'
    const backwardKey = isRtl ? 'ArrowRight' : 'ArrowLeft'
    let next: number | null = null
    if (event.key === forwardKey || event.key === 'ArrowDown') {
      next = (current + 1) % buttons.length
    } else if (event.key === backwardKey || event.key === 'ArrowUp') {
      next = (current - 1 + buttons.length) % buttons.length
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = buttons.length - 1
    }
    if (next !== null) {
      event.preventDefault()
      buttons[next]?.focus()
    }
  }

  const layerOf = (id: string | undefined) =>
    id === undefined ? undefined : map.layers.find((layer) => layer.id === id)

  const groupProps = {
    className: joinClassNames('kv-map-markers', className),
    role: 'group',
    'aria-label': map.messages.markersLabel,
    onKeyDown: handleKeyDown,
  }

  return (
    <>
      <div {...otherProps} {...groupProps}>
        {map.markersInView.map((item) => {
          if (item.type === 'cluster') {
            const layer = layerOf(item.cluster.layer)
            return (
              <MapCluster
                key={item.cluster.id}
                ref={registerElement(item.cluster.id)}
                cluster={item.cluster}
                aria-label={clusterLabel?.(item.cluster, layer)}
                className={
                  typeof clusterClassName === 'function'
                    ? clusterClassName(item.cluster, layer)
                    : clusterClassName
                }
              >
                {cluster?.(item.cluster, {
                  opened: map.openedCluster?.id === item.cluster.id,
                  layer,
                })}
              </MapCluster>
            )
          }
          const { place } = item
          const layer = layerOf(place.layer)
          const state = {
            selected: map.selectedPlace?.id === place.id,
            highlighted: map.highlightedPlaceId === place.id,
            layer,
          }
          return (
            <MapMarker
              key={place.id}
              ref={registerElement(place.id)}
              place={place}
              aria-label={label?.(place, layer)}
              className={
                typeof markerClassName === 'function'
                  ? markerClassName(place, layer)
                  : markerClassName
              }
            >
              {children?.(place, state)}
            </MapMarker>
          )
        })}
      </div>
      <div ref={setPopupSlot} className="kv-map-popup-slot" />
    </>
  )
}
MapMarkers.displayName = 'Map.Markers'
