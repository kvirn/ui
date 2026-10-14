import { Icon } from '@kvirn-ui/react'
import type { MapPlace } from '@kvirn-ui/core'
import { createContext, useContext } from 'react'
import type { ComponentPropsWithRef, ElementType, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'
import { MapPopup } from './map-popup.tsx'

export interface MapDetailsState<Data = unknown> {
  place: MapPlace<Data>
  close: () => void
  /** The id and `tabIndex={-1}` the library moves focus to and names the dialog from: put them on your title. */
  titleProps: ComponentPropsWithRef<'h3'>
  /** Which side of the marker the popup sits on. */
  side: 'top' | 'bottom'
}

export interface MapDetailsProps<Data = unknown> extends Omit<
  ComponentPropsWithRef<'section'>,
  'children'
> {
  /** The element or component to render. Default `dialog`, rendered open and non-modal. */
  as?: ElementType | undefined
  /**
   * Without children: image, title with close button, body and address, each only when the place
   * has it. With nodes: exactly those, composed from the `Map.Details*` parts or your own markup.
   * With a function: the whole template from the place, `close` and `titleProps`.
   */
  children?: ReactNode | ((state: MapDetailsState<Data>) => ReactNode)
}

interface MapDetailsContextValue {
  place: MapPlace
  close: () => void
  titleProps: ComponentPropsWithRef<'h3'>
  closeId: string
  closeLabel: string
}

const MapDetailsContext = createContext<MapDetailsContextValue | null>(null)

export interface MapDetailsImageProps extends Omit<ComponentPropsWithRef<'img'>, 'children'> {
  as?: ElementType | undefined
}

/** The place's `image`, as an `img` with its `alt`. Renders nothing when the place has none. */
export function MapDetailsImage({
  as: Root = 'img',
  className,
  ...otherProps
}: MapDetailsImageProps): ReactElement | null {
  const details = useContext(MapDetailsContext)
  const image = details?.place.image
  if (!image) {
    return null
  }
  return (
    <Root
      src={image.src}
      alt={image.alt}
      loading="lazy"
      {...otherProps}
      className={joinClassNames('kv-map-details-image', className)}
    />
  )
}
MapDetailsImage.displayName = 'Map.DetailsImage'

export interface MapDetailsTitleProps extends ComponentPropsWithRef<'h3'> {
  /** Another tag or component than the default `h3`: the list's heading is the `h2`. */
  as?: ElementType | undefined
}

/** The place's name as the heading the dialog is named by and focus moves to. */
export function MapDetailsTitle({
  as: Root = 'h3',
  className,
  children,
  ...otherProps
}: MapDetailsTitleProps): ReactElement | null {
  const details = useContext(MapDetailsContext)
  if (!details) {
    return null
  }
  return (
    <Root
      {...otherProps}
      {...details.titleProps}
      className={joinClassNames('kv-map-details-title', className)}
    >
      {children ?? details.place.name}
    </Root>
  )
}
MapDetailsTitle.displayName = 'Map.DetailsTitle'

export interface MapDetailsBodyProps extends ComponentPropsWithRef<'p'> {
  as?: ElementType | undefined
}

/** The place's `description`. Renders nothing when the place has none and there are no children. */
export function MapDetailsBody({
  as: Root = 'p',
  className,
  children,
  ...otherProps
}: MapDetailsBodyProps): ReactElement | null {
  const details = useContext(MapDetailsContext)
  const content = children ?? details?.place.description
  if (!content) {
    return null
  }
  return (
    <Root {...otherProps} className={joinClassNames('kv-map-details-body', className)}>
      {content}
    </Root>
  )
}
MapDetailsBody.displayName = 'Map.DetailsBody'

export interface MapDetailsAddressProps extends ComponentPropsWithRef<'p'> {
  as?: ElementType | undefined
}

/** The place's `address`. Renders nothing when the place has none and there are no children. */
export function MapDetailsAddress({
  as: Root = 'p',
  className,
  children,
  ...otherProps
}: MapDetailsAddressProps): ReactElement | null {
  const details = useContext(MapDetailsContext)
  const content = children ?? details?.place.address
  if (!content) {
    return null
  }
  return (
    <Root {...otherProps} className={joinClassNames('kv-map-details-address', className)}>
      {content}
    </Root>
  )
}
MapDetailsAddress.displayName = 'Map.DetailsAddress'

export interface MapDetailsCloseProps extends ComponentPropsWithRef<'button'> {}

/** The icon-only close button, named "Close" plus the title. Closing returns focus to the opener. */
export function MapDetailsClose({
  className,
  children,
  onClick,
  ...otherProps
}: MapDetailsCloseProps): ReactElement | null {
  const details = useContext(MapDetailsContext)
  if (!details) {
    return null
  }
  return (
    <button
      id={details.closeId}
      type="button"
      aria-label={details.closeLabel}
      aria-labelledby={`${details.closeId} ${details.titleProps.id}`}
      {...otherProps}
      className={joinClassNames(
        'kv-button kv-button--icon-only kv-button--compact kv-map-details-close',
        className,
      )}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          details.close()
        }
      }}
    >
      {children ?? <Icon name="close" />}
    </button>
  )
}
MapDetailsClose.displayName = 'Map.DetailsClose'

/**
 * The selected place as a non-modal dialog, a popup in the viewport above its marker (below when
 * there is no room above). It never covers the marker: with little room it scrolls inside. It sits
 * right after the markers in the tab order wherever you put `Map.Details`. Escape and Close return
 * focus to the opener.
 */
export function MapDetails<Data = unknown>({
  as,
  children,
  className,
  ...otherProps
}: MapDetailsProps<Data>): ReactElement | null {
  const map = useMapContext<Data>('Details')
  const place = map.selectedPlace
  if (!place || !map.isPopupReady) {
    return null
  }

  const closeId = `${map.ids.details}-close`
  const titleProps = {
    id: map.ids.detailsTitle,
    tabIndex: -1,
    className: 'kv-map-details-title',
  }
  return (
    <MapPopup
      {...otherProps}
      as={as}
      anchorId={map.markerId(place.id)}
      dialogId={map.ids.details}
      labelledBy={map.ids.detailsTitle}
      onClose={map.close}
      className={joinClassNames('kv-map-details', className)}
    >
      {({ side }) => (
        <MapDetailsContext.Provider
          value={{
            place,
            close: map.close,
            titleProps,
            closeId,
            closeLabel: map.messages.detailsClose,
          }}
        >
          {typeof children === 'function' ? (
            children({ place, close: map.close, titleProps, side })
          ) : children !== undefined && children !== null ? (
            children
          ) : (
            <>
              <MapDetailsImage />
              <div className="kv-map-details-content">
                <div className="kv-map-details-header">
                  <MapDetailsTitle />
                  <MapDetailsClose />
                </div>
                <MapDetailsBody />
                <MapDetailsAddress />
              </div>
            </>
          )}
        </MapDetailsContext.Provider>
      )}
    </MapPopup>
  )
}
MapDetails.displayName = 'Map.Details'
