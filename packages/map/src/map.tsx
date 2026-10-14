import { Field, Icon, RadioGroup, SkipLink, Tooltip } from '@kvirn-ui/react'
import type { MapBaseMap, MapPlace } from '@kvirn-ui/core'
import type { IconComponent, IconName } from '@kvirn-ui/react'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  RemoveIcon,
} from './map-icons.tsx'
import { useContext } from 'react'
import type {
  ComponentPropsWithRef,
  CSSProperties,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from 'react'
import { MapContext } from './map-context.ts'
import { useMap } from './use-map.ts'
import type { MapPanDirection, UseMapOptions, UseMapResult } from './use-map.ts'

function useMapContext(partName: string): UseMapResult {
  const map = useContext(MapContext)
  if (map === null) {
    throw new Error(`Map.${partName} must be rendered inside Map.Root.`)
  }
  return map
}

const withoutFullStop = (text: string) => text.replace(/[.。]$/, '')
const hasModifier = (event: KeyboardEvent) => event.ctrlKey || event.metaKey || event.altKey

export interface MapRootProps
  extends ComponentPropsWithRef<'div'>, Omit<UseMapOptions, 'messages'> {
  messages?: UseMapOptions['messages']
}

/**
 * Owns the map's state and mounts the engine into `Map.Viewport`. Put `Map.Skip`,
 * `Map.Viewport` and, beside it, `Map.List` and `Map.Details` inside.
 *
 * @example
 * <Map.Root provider={provider} label="Karta över förskolor" places={places} initialView={view}>
 *   <Map.Skip />
 *   <Map.Viewport><Map.Markers /><Map.Controls /></Map.Viewport>
 *   <Map.List /><Map.Details />
 * </Map.Root>
 */
export function MapRoot({
  provider,
  label,
  places,
  initialView,
  baseMap,
  defaultBaseMap,
  onBaseMapChange,
  messages,
  children,
  ...otherProps
}: MapRootProps): ReactElement {
  const map = useMap({
    provider,
    label,
    places,
    initialView,
    baseMap,
    defaultBaseMap,
    onBaseMapChange,
    messages,
  })
  return (
    <MapContext.Provider value={map}>
      <div {...otherProps} className={['kv-map', otherProps.className].filter(Boolean).join(' ')}>
        {children}
      </div>
    </MapContext.Provider>
  )
}
MapRoot.displayName = 'Map.Root'

/** A skip link to the list of places (WCAG 2.4.1). Put it before the viewport. */
export function MapSkip({ children }: { children?: ReactNode }): ReactElement {
  const map = useMapContext('Skip')
  const target = map.selectedPlace ? map.ids.detailsTitle : map.ids.listHeading
  return <SkipLink href={`#${target}`}>{children ?? map.messages.skipToList}</SkipLink>
}
MapSkip.displayName = 'Map.Skip'

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
  const { messages } = map

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
    className: ['kv-map-viewport', className].filter(Boolean).join(' '),
    role: 'region',
    tabIndex: 0,
    'aria-label': map.label,
    'aria-roledescription': messages.roleDescription,
    'aria-describedby': `${map.ids.summary} ${map.ids.keyboardHint}`,
    'data-status': map.status,
    onKeyDown: handleKeyDown,
  }

  return (
    <div {...otherProps} {...viewportProps}>
      <div ref={map.engineRef} className="kv-map-engine" aria-hidden="true" />
      <span id={map.ids.summary} className="kv-visually-hidden">
        {messages.summary({ count: map.visiblePlaces.length })}
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
      {children}
    </div>
  )
}
MapViewport.displayName = 'Map.Viewport'

export interface MapMarkerProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  place: MapPlace
  children?: ReactNode
}

/** One place as a button over the map. Use `Map.Markers`, which renders the set. */
export function MapMarker({ place, children, className, onClick, ...otherProps }: MapMarkerProps) {
  const map = useMapContext('Marker')
  const point = map.handle?.project(place.position)
  const isSelected = map.selectedPlace?.id === place.id
  const isTabStop =
    (map.activeMarkerId ?? map.selectedPlace?.id ?? map.placesInView[0]?.id) === place.id
  if (!point) {
    return null
  }
  const style = { '--kv-map-x': `${point.x}px`, '--kv-map-y': `${point.y}px` } as CSSProperties
  return (
    <button
      {...otherProps}
      id={map.markerId(place.id)}
      type="button"
      className={['kv-map-marker', className].filter(Boolean).join(' ')}
      style={style}
      tabIndex={isTabStop ? 0 : -1}
      aria-label={place.name}
      aria-expanded={isSelected}
      aria-controls={map.ids.details}
      data-kv-map-marker=""
      data-highlighted={map.highlightedPlaceId === place.id ? '' : undefined}
      onClick={(event) => {
        onClick?.(event)
        map.select(place.id, map.markerId(place.id))
      }}
      onMouseEnter={() => map.setHighlightedPlaceId(place.id)}
      onMouseLeave={() => map.setHighlightedPlaceId(null)}
      onFocus={() => map.setActiveMarkerId(place.id)}
    >
      {children}
    </button>
  )
}
MapMarker.displayName = 'Map.Marker'

export interface MapMarkersProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The marker's content for a place: your 16px icon. */
  children?: ((place: MapPlace) => ReactNode) | undefined
}

/**
 * The set of markers for the places in view: one Tab stop, then the arrow keys, Home and End move
 * between them (map.md §7).
 */
export function MapMarkers({ children, className, onKeyDown, ...otherProps }: MapMarkersProps) {
  const map = useMapContext('Markers')
  if (map.placesInView.length === 0 || !map.handle) {
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

  const groupProps = {
    className: ['kv-map-markers', className].filter(Boolean).join(' '),
    role: 'group',
    'aria-label': map.messages.markersLabel,
    onKeyDown: handleKeyDown,
  }

  return (
    <div {...otherProps} {...groupProps}>
      {map.placesInView.map((place) => (
        <MapMarker key={place.id} place={place}>
          {children?.(place)}
        </MapMarker>
      ))}
    </div>
  )
}
MapMarkers.displayName = 'Map.Markers'

function ControlButton({
  label,
  icon,
  disabled,
  onPress,
  className,
}: {
  label: string
  icon: IconName | IconComponent
  disabled?: boolean
  onPress: () => void
  className?: string
}): ReactElement {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        className={['kv-button kv-button--icon-only', className].filter(Boolean).join(' ')}
        type="button"
        aria-label={label}
        aria-disabled={disabled ? true : undefined}
        onClick={onPress}
      >
        {typeof icon === 'string' ? <Icon name={icon} /> : <Icon icon={icon} />}
      </Tooltip.Trigger>
      <Tooltip.Popup>
        <Tooltip.Name>{label}</Tooltip.Name>
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}

/** Zoom, Reset and the pan cross: every pointer gesture as a single-pointer button (WCAG 2.5.7). */
export function MapControls({
  className,
  ...otherProps
}: Omit<ComponentPropsWithRef<'div'>, 'children'>): ReactElement {
  const map = useMapContext('Controls')
  const { messages } = map
  const groupProps = {
    className: ['kv-map-controls', className].filter(Boolean).join(' '),
    role: 'group',
    'aria-label': messages.controlsLabel,
  }
  return (
    <div {...otherProps} {...groupProps}>
      <ControlButton
        label={messages.zoomIn}
        icon="add"
        disabled={!map.canZoomIn}
        onPress={map.zoomIn}
      />
      <ControlButton
        label={messages.zoomOut}
        icon={RemoveIcon}
        disabled={!map.canZoomOut}
        onPress={map.zoomOut}
      />
      <button type="button" className="kv-button" onClick={map.reset}>
        {messages.reset}
      </button>
      <div className="kv-map-pan">
        <ControlButton
          label={messages.panNorth}
          className="kv-map-pan-north"
          icon={ArrowUpIcon}
          onPress={() => map.pan('north')}
        />
        <ControlButton
          label={messages.panWest}
          className="kv-map-pan-west"
          icon={ArrowLeftIcon}
          onPress={() => map.pan('west')}
        />
        <ControlButton
          label={messages.panEast}
          className="kv-map-pan-east"
          icon={ArrowRightIcon}
          onPress={() => map.pan('east')}
        />
        <ControlButton
          label={messages.panSouth}
          className="kv-map-pan-south"
          icon={ArrowDownIcon}
          onPress={() => map.pan('south')}
        />
      </div>
    </div>
  )
}
MapControls.displayName = 'Map.Controls'

export interface MapAttributionProps extends Omit<ComponentPropsWithRef<'p'>, 'children'> {
  /** Your text and links, or a function of the active base map. Default: its `attribution`. */
  children?: ReactNode | ((baseMap: MapBaseMap) => ReactNode)
}

/** The data source's attribution and licence: your text and links, named `map.attributionLabel`. */
export function MapAttribution({
  children,
  className,
  ...otherProps
}: MapAttributionProps): ReactElement | null {
  const map = useMapContext('Attribution')
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
      className={['kv-map-attribution', className].filter(Boolean).join(' ')}
      aria-label={map.messages.attributionLabel}
    >
      {content}
    </p>
  )
}
MapAttribution.displayName = 'Map.Attribution'

export interface MapBaseMapSwitchProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/**
 * Lets the visitor choose the map type (standard, satellite, terrain): a radio group under the
 * legend `map.baseMapLabel`, one radio per base map. Put it beside the viewport, next to
 * `Map.List`, not over the canvas. It renders nothing with fewer than two base maps.
 */
export function MapBaseMapSwitch({
  className,
  ...otherProps
}: MapBaseMapSwitchProps): ReactElement | null {
  const map = useMapContext('BaseMapSwitch')
  if (map.baseMaps.length < 2 || map.baseMap === null) {
    return null
  }
  return (
    <div {...otherProps} className={['kv-map-base-maps', className].filter(Boolean).join(' ')}>
      <RadioGroup.Root value={map.baseMap} onValueChange={map.setBaseMap}>
        <RadioGroup.Legend marker="none">{map.messages.baseMapLabel}</RadioGroup.Legend>
        {map.baseMaps.map((baseMap) => (
          <Field.Root key={baseMap.id}>
            <RadioGroup.Radio value={baseMap.id} />
            <Field.Label>{baseMap.label}</Field.Label>
          </Field.Root>
        ))}
      </RadioGroup.Root>
    </div>
  )
}
MapBaseMapSwitch.displayName = 'Map.BaseMapSwitch'

export interface MapListProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Extra facts under a place's name: address, distance. */
  children?: ((place: MapPlace) => ReactNode) | undefined
}

/**
 * The places in the map view as a list, with a heading that states the count. It is the
 * screen reader user's equivalent of the map and is hidden while a place's details are open.
 */
export function MapList({ children, className, ...otherProps }: MapListProps): ReactElement | null {
  const map = useMapContext('List')
  if (map.selectedPlace) {
    return null
  }
  const { messages } = map
  const heading =
    map.placesInView.length === map.visiblePlaces.length
      ? messages.placesAll({ count: map.visiblePlaces.length })
      : messages.placesInView({ count: map.placesInView.length })
  return (
    <div {...otherProps} className={['kv-map-list-region', className].filter(Boolean).join(' ')}>
      <h2 id={map.ids.listHeading} tabIndex={-1} className="kv-map-list-heading">
        {withoutFullStop(heading)}
      </h2>
      {map.placesInView.length === 0 ? (
        <p>{messages.listEmpty}</p>
      ) : (
        <ul role="list" className="kv-map-list">
          {map.placesInView.map((place) => (
            <li
              key={place.id}
              className="kv-map-list-item"
              data-highlighted={map.highlightedPlaceId === place.id ? '' : undefined}
              {...{
                onMouseEnter: () => map.setHighlightedPlaceId(place.id),
                onMouseLeave: () => map.setHighlightedPlaceId(null),
              }}
            >
              <button
                id={map.rowId(place.id)}
                type="button"
                className="kv-map-list-trigger"
                aria-expanded={false}
                aria-controls={map.ids.details}
                onClick={() => map.select(place.id, map.rowId(place.id))}
              >
                {place.name}
              </button>
              {place.address ? <span className="kv-map-list-address">{place.address}</span> : null}
              {children?.(place)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
MapList.displayName = 'Map.List'

export interface MapDetailsProps extends Omit<ComponentPropsWithRef<'section'>, 'children'> {
  /** Another title than the place's name. */
  title?: string | undefined
  /** The heading level of the title. Default `h3`, as the list's heading is the `h2`. */
  titleAs?: 'h2' | 'h3' | 'h4' | undefined
  /** The body, from the selected place: yours. */
  children?: ReactNode | ((place: MapPlace) => ReactNode)
}

/** The selected place as a card in the list's slot. Escape and Close return focus to the opener. */
export function MapDetails({
  title,
  titleAs: TitleTag = 'h3',
  children,
  className,
  onKeyDown,
  ...otherProps
}: MapDetailsProps): ReactElement | null {
  const map = useMapContext('Details')
  const place = map.selectedPlace
  if (!place) {
    return null
  }
  const closeId = `${map.ids.details}-close`
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event)
    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.stopPropagation()
      map.close()
    }
  }
  return (
    <section
      {...otherProps}
      id={map.ids.details}
      className={['kv-card', 'kv-map-details', className].filter(Boolean).join(' ')}
      aria-labelledby={map.ids.detailsTitle}
      {...{ onKeyDown: handleKeyDown }}
    >
      <div className="kv-card-header kv-map-details-header">
        <TitleTag id={map.ids.detailsTitle} tabIndex={-1} className="kv-map-details-title">
          {title ?? place.name}
        </TitleTag>
        <button
          id={closeId}
          type="button"
          className="kv-button kv-button--icon-only"
          aria-label={map.messages.detailsClose}
          aria-labelledby={`${closeId} ${map.ids.detailsTitle}`}
          onClick={map.close}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="kv-card-body">
        {typeof children === 'function' ? children(place) : children}
      </div>
    </section>
  )
}
MapDetails.displayName = 'Map.Details'

export const Map = {
  Root: MapRoot,
  Skip: MapSkip,
  Viewport: MapViewport,
  Markers: MapMarkers,
  Marker: MapMarker,
  Controls: MapControls,
  Attribution: MapAttribution,
  BaseMapSwitch: MapBaseMapSwitch,
  List: MapList,
  Details: MapDetails,
} as const
