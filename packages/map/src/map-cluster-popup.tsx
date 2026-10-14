import { Icon } from '@kvirn-ui/react'
import type { MapCluster, MapPlace } from '@kvirn-ui/core'
import { createContext, useCallback, useContext, useState } from 'react'
import type { ComponentPropsWithRef, ElementType, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'
import { MapPopup } from './map-popup.tsx'
import { useVirtualRows } from './use-virtual-rows.ts'

// A row: the name and an address.
const ROW_ESTIMATE = 56

export interface MapClusterPopupState<Data = unknown> {
  cluster: MapCluster<Data>
  close: () => void
  /** Closes the popup and opens that place's details. */
  select: (placeId: string) => void
  /** The id and `tabIndex={-1}` the library moves focus to and names the dialog from: put them on your title. */
  titleProps: ComponentPropsWithRef<'h3'>
  /** Which side of the cluster the popup sits on. */
  side: 'top' | 'bottom'
}

export interface MapClusterPopupProps<Data = unknown> extends Omit<
  ComponentPropsWithRef<'section'>,
  'children'
> {
  /** The element or component to render. Default `dialog`, rendered open and non-modal. */
  as?: ElementType | undefined
  /**
   * Without children: the title with its close button and the list of places. With nodes: exactly
   * those, composed from the `Map.ClusterPopup*` parts. With a function: the whole template.
   */
  children?: ReactNode | ((state: MapClusterPopupState<Data>) => ReactNode)
}

interface MapClusterPopupContextValue {
  cluster: MapCluster
  getPlace: (index: number) => MapPlace | undefined
  close: () => void
  select: (placeId: string) => void
  titleProps: ComponentPropsWithRef<'h3'>
  title: string
  closeId: string
  closeLabel: string
}

const MapClusterPopupContext = createContext<MapClusterPopupContextValue | null>(null)

export interface MapClusterPopupTitleProps extends ComponentPropsWithRef<'h3'> {
  as?: ElementType | undefined
}

/** The cluster's name and count as the heading the dialog is named by and focus moves to. */
export function MapClusterPopupTitle({
  as: Root = 'h3',
  className,
  children,
  ...otherProps
}: MapClusterPopupTitleProps): ReactElement | null {
  const popup = useContext(MapClusterPopupContext)
  if (!popup) {
    return null
  }
  return (
    <Root
      {...otherProps}
      {...popup.titleProps}
      className={joinClassNames('kv-map-details-title', className)}
    >
      {children ?? popup.title}
    </Root>
  )
}
MapClusterPopupTitle.displayName = 'Map.ClusterPopupTitle'

export interface MapClusterPopupPlacesProps extends Omit<ComponentPropsWithRef<'ul'>, 'children'> {
  /** Replaces a row's content. Call `select` to open that place's details. */
  renderPlace?: ((place: MapPlace, select: () => void) => ReactNode) | undefined
}

/** The cluster's places as a list: each row a button with the name, and the address under it. */
export function MapClusterPopupPlaces({
  renderPlace,
  className,
  ...otherProps
}: MapClusterPopupPlacesProps): ReactElement | null {
  const popup = useContext(MapClusterPopupContext)
  const getPlace = popup?.getPlace
  const count = popup?.cluster.count ?? 0
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const getKey = useCallback(
    (index: number) => getPlace?.(index)?.id ?? `index-${index}`,
    [getPlace],
  )
  const virtual = useVirtualRows({
    count,
    estimateSize: ROW_ESTIMATE,
    getKey,
    getRequiredIndexes: () => (focusedIndex < 0 ? [] : [focusedIndex]),
    scrollElement,
    activeIndex: focusedIndex,
    onActiveChange: setFocusedIndex,
  })
  if (!popup) {
    return null
  }
  return (
    <div
      ref={setScrollElement}
      className="kv-map-cluster-places-scroll"
      data-virtualized={virtual.isVirtual ? '' : undefined}
      {...{ onKeyDown: virtual.onKeyDown }}
    >
      <ul
        {...otherProps}
        role="list"
        className={joinClassNames('kv-map-cluster-places', className)}
        style={{ ...otherProps.style, ...virtual.listStyle }}
      >
        {virtual.rows.map((row) => {
          const place = popup.getPlace(row.index)
          if (!place) {
            return null
          }
          return (
            <li
              key={row.key}
              className="kv-map-cluster-place"
              {...{ onFocus: () => setFocusedIndex(row.index) }}
              {...virtual.getRowProps(row)}
            >
              {renderPlace ? (
                renderPlace(place, () => popup.select(place.id))
              ) : (
                <>
                  <button
                    type="button"
                    className="kv-map-cluster-place-trigger"
                    onClick={() => popup.select(place.id)}
                  >
                    {place.name}
                  </button>
                  {place.address ? (
                    <span className="kv-map-cluster-place-address">{place.address}</span>
                  ) : null}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
MapClusterPopupPlaces.displayName = 'Map.ClusterPopupPlaces'

export interface MapClusterPopupCloseProps extends ComponentPropsWithRef<'button'> {}

/** The icon-only close button, named "Close" plus the title. Closing returns focus to the cluster. */
export function MapClusterPopupClose({
  className,
  children,
  onClick,
  ...otherProps
}: MapClusterPopupCloseProps): ReactElement | null {
  const popup = useContext(MapClusterPopupContext)
  if (!popup) {
    return null
  }
  return (
    <button
      id={popup.closeId}
      type="button"
      aria-label={popup.closeLabel}
      aria-labelledby={`${popup.closeId} ${popup.titleProps.id}`}
      {...otherProps}
      className={joinClassNames(
        'kv-button kv-button--icon-only kv-button--compact kv-map-details-close',
        className,
      )}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          popup.close()
        }
      }}
    >
      {children ?? <Icon name="close" />}
    </button>
  )
}
MapClusterPopupClose.displayName = 'Map.ClusterPopupClose'

/**
 * The opened cluster as a non-modal dialog above its button: its places as a list, each opening
 * that place's details. It sits right after the markers in the tab order wherever you put
 * `Map.ClusterPopup`. Escape and Close return focus to the cluster.
 */
export function MapClusterPopup<Data = unknown>({
  as,
  children,
  className,
  ...otherProps
}: MapClusterPopupProps<Data>): ReactElement | null {
  const map = useMapContext<Data>('ClusterPopup')
  const cluster = map.openedCluster
  if (!cluster || !map.isPopupReady) {
    return null
  }

  const layerLabel = map.layers.find((layer) => layer.id === cluster.layer)?.label
  const { count } = cluster
  const title =
    layerLabel === undefined
      ? map.messages.clusterTitle({ count })
      : map.messages.clusterLayerTitle({ count, layer: layerLabel })
  const markerId = map.clusterMarkerId(cluster.id)
  const close = () => map.openCluster(null)
  const select = (placeId: string) => map.select(placeId, markerId)
  const titleProps = {
    id: map.ids.clusterPopupTitle,
    tabIndex: -1,
    className: 'kv-map-details-title',
  }
  return (
    <MapPopup
      {...otherProps}
      as={as}
      anchorId={markerId}
      dialogId={map.ids.clusterPopup}
      labelledBy={map.ids.clusterPopupTitle}
      onClose={close}
      className={joinClassNames('kv-map-cluster-popup', className)}
    >
      {({ side }) => (
        <MapClusterPopupContext.Provider
          value={{
            cluster: cluster as MapCluster,
            getPlace: (index) => map.getClusterPlace(cluster.id, index) as MapPlace | undefined,
            close,
            select: select,
            titleProps,
            title,
            closeId: `${map.ids.clusterPopup}-close`,
            closeLabel: map.messages.clusterClose,
          }}
        >
          {typeof children === 'function' ? (
            children({ cluster, close, select, titleProps, side })
          ) : children !== undefined && children !== null ? (
            children
          ) : (
            <div className="kv-map-details-content">
              <div className="kv-map-details-header">
                <MapClusterPopupTitle />
                <MapClusterPopupClose />
              </div>
              <MapClusterPopupPlaces />
            </div>
          )}
        </MapClusterPopupContext.Provider>
      )}
    </MapPopup>
  )
}
MapClusterPopup.displayName = 'Map.ClusterPopup'
