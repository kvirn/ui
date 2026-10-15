import type { MapPlace } from '@kvirn-ui/core'
import { useContext, useEffect, useMemo, useState } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { MapListPresenceContext, useMapContext } from './map-context.ts'
import { useVirtualRows } from './use-virtual-rows.ts'

// A row: the name and an address or two.
const ROW_ESTIMATE = 72

const withoutFullStop = (text: string) => text.replace(/[.。]$/, '')

export interface MapListProps<Data = unknown> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  /** A decorative swatch before each row, such as the place's marker icon. It is not read. */
  icon?: ((place: MapPlace<Data>) => ReactNode) | undefined
  /** A class on each row, such as the one the place's marker has. */
  rowClassName?: ((place: MapPlace<Data>) => string | undefined) | undefined
  /**
   * Extra facts under a place's name: address, distance. Keep them non-interactive: the whole row
   * is the button. A node with `kv-map-list-aside` sits at the row's inline end.
   */
  children?: ((place: MapPlace<Data>) => ReactNode) | undefined
  /** The heading's level, so the list fits the page's outline. Default `h2`. */
  headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | undefined
}

/**
 * The places in the map view as a list, with a heading that states the count. It is the
 * screen reader user's equivalent of the map and is hidden while a place's details are open.
 */
export function MapList<Data = unknown>({
  icon,
  rowClassName,
  children,
  headingLevel: Heading = 'h2',
  className,
  ...otherProps
}: MapListProps<Data>): ReactElement | null {
  const map = useMapContext<Data>('List')
  const presence = useContext(MapListPresenceContext)
  const setHasList = presence?.setHasList
  const [anchorId, setAnchorId] = useState<string | null>(null)
  useEffect(() => {
    setHasList?.(true)
    return () => setHasList?.(false)
  }, [setHasList])
  if (map.selectedPlace) {
    return null
  }
  const { messages } = map
  const heading =
    map.placesInViewCount === map.visibleCount
      ? messages.placesAll({ count: map.visibleCount })
      : messages.placesInView({ count: map.placesInViewCount })
  return (
    <div {...otherProps} className={joinClassNames('kv-map-list-region', className)}>
      <Heading id={map.ids.listHeading} tabIndex={-1} className="kv-map-list-heading">
        {withoutFullStop(heading)}
      </Heading>
      {map.placesInViewCount === 0 ? (
        <p>{messages.listEmpty}</p>
      ) : (
        <MapListRows
          anchorId={anchorId}
          setAnchorId={setAnchorId}
          icon={icon}
          rowClassName={rowClassName}
        >
          {children}
        </MapListRows>
      )}
    </div>
  )
}
MapList.displayName = 'Map.List'

interface MapListRowsProps<Data> {
  /** The row the user is on or came from: it stays rendered and is scrolled to when the list returns. */
  anchorId: string | null
  setAnchorId: (placeId: string) => void
  icon: MapListProps<Data>['icon']
  rowClassName: MapListProps<Data>['rowClassName']
  children: ((place: MapPlace<Data>) => ReactNode) | undefined
}

function MapListRows<Data>({
  anchorId,
  setAnchorId,
  icon,
  rowClassName,
  children,
}: MapListRowsProps<Data>) {
  const map = useMapContext<Data>('List')
  const { getPlaceInView, getPlaceInViewKey, getPlaceInViewPosition, placesInViewCount } = map
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)
  const anchorIndex = useMemo(
    () => (anchorId === null ? -1 : getPlaceInViewPosition(anchorId)),
    [getPlaceInViewPosition, anchorId],
  )
  const getKey = getPlaceInViewKey
  const virtual = useVirtualRows({
    count: placesInViewCount,
    estimateSize: ROW_ESTIMATE,
    getKey,
    getRequiredIndexes: () => (anchorIndex < 0 ? [] : [anchorIndex]),
    scrollElement,
    initialIndex: anchorIndex < 0 ? undefined : anchorIndex,
    activeIndex: anchorIndex,
    onActiveChange: (index) => {
      const place = getPlaceInView(index)
      if (place) {
        setAnchorId(place.id)
      }
    },
  })
  return (
    <div
      ref={setScrollElement}
      className="kv-map-list-scroll"
      data-virtualized={virtual.isVirtual ? '' : undefined}
      {...{ onKeyDown: virtual.onKeyDown }}
    >
      <ul role="list" className="kv-map-list" style={virtual.listStyle}>
        {virtual.rows.map((row) => {
          const place = getPlaceInView(row.index)
          if (!place) {
            return null
          }
          return (
            <li
              key={row.key}
              className={joinClassNames('kv-map-list-item', rowClassName?.(place))}
              data-highlighted={map.highlightedPlaceId === place.id ? '' : undefined}
              {...{
                onFocus: () => setAnchorId(place.id),
                onMouseEnter: () => map.setHighlightedPlaceId(place.id),
                onMouseLeave: () => map.setHighlightedPlaceId(null),
              }}
              {...virtual.getRowProps(row)}
            >
              {icon ? (
                <span className="kv-map-list-swatch" aria-hidden="true">
                  {icon(place)}
                </span>
              ) : null}
              <button
                id={map.rowId(place.id)}
                type="button"
                className="kv-map-list-trigger"
                aria-expanded={false}
                aria-controls={map.ids.details}
                onClick={() => {
                  setAnchorId(place.id)
                  map.select(place.id, map.rowId(place.id))
                }}
              >
                {place.name}
              </button>
              {place.address ? <span className="kv-map-list-address">{place.address}</span> : null}
              {children?.(place)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
