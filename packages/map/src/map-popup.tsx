import { computePlacement } from '@kvirn-ui/core'
import { useMergedRef } from '@kvirn-ui/react/internal'
import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  KeyboardEvent,
  ReactNode,
} from 'react'
import { useMapContext } from './map-context.ts'
import { useMapFrame } from './use-map-frame.ts'

export type MapPopupSide = 'top' | 'bottom'

export interface MapPopupProps extends Omit<ComponentPropsWithRef<'section'>, 'children'> {
  as?: ElementType | undefined
  /** The id of the element the popup sits beside: it clears all of it, and the caret points at it. */
  anchorId: string
  dialogId: string
  /** The id of the title the dialog is named by. */
  labelledBy: string
  onClose: () => void
  children: (state: { side: MapPopupSide }) => ReactNode
}

interface PopupLayout {
  anchorId: string
  x: number
  y: number
  side: MapPopupSide
  caretX: number
  /** The room on its side of the anchor: the popup scrolls inside it rather than cover the anchor. */
  maxBlockSize: number
}

// The caret is 0.5rem tall, plus a small gap, and the popup keeps `space-2` from the viewport edge.
const POPUP_OFFSET = 12
const POPUP_EDGE = 8
const CARET_INSET = 16

function unionRect(elements: readonly Element[]) {
  const rects = elements.map((element) => element.getBoundingClientRect())
  const left = Math.min(...rects.map((rect) => rect.left))
  const top = Math.min(...rects.map((rect) => rect.top))
  const right = Math.max(...rects.map((rect) => rect.right))
  const bottom = Math.max(...rects.map((rect) => rect.bottom))
  return { left, top, right, bottom }
}

/**
 * The frame every map popup shares: a non-modal dialog portalled into the popup slot, placed above
 * its anchor (below when there is no room above), with a caret, and closed by Escape.
 */
export function MapPopup({
  as: Root = 'dialog',
  anchorId,
  dialogId,
  labelledBy,
  onClose,
  children,
  ref: consumerRef,
  onKeyDown,
  ...otherProps
}: MapPopupProps) {
  const map = useMapContext('Popup')
  const { view, bounds, handle } = map
  const viewportId = map.ids.viewport
  const [storedLayout, setLayout] = useState<PopupLayout | null>(null)
  const sectionElement = useRef<HTMLElement | null>(null)
  const mergedRef = useMergedRef(consumerRef, sectionElement)
  const [scrollbarSize, setScrollbarSize] = useState(0)

  const layout: PopupLayout =
    storedLayout?.anchorId === anchorId
      ? storedLayout
      : { anchorId, x: 0, y: 0, side: 'top', caretX: 0, maxBlockSize: 0 }

  const place = () => {
    if (!sectionElement.current) {
      return
    }
    // Measured at its natural size: the cap below only applies once there is a layout.
    const size = {
      width: sectionElement.current.offsetWidth,
      height: sectionElement.current.scrollHeight,
    }
    const viewportElement = document.getElementById(viewportId)
    const originElement = sectionElement.current.parentElement?.offsetParent ?? viewportElement
    const anchorElement = document.getElementById(anchorId)
    if (viewportElement && originElement && anchorElement) {
      const origin = originElement.getBoundingClientRect()
      const originLeft = origin.left + originElement.clientLeft
      const originTop = origin.top + originElement.clientTop
      // The map row, not the viewport: below 40rem the controls sit in the same grid and the popup must not cover them.
      const roomElement =
        viewportElement.querySelector(':scope > .kv-map-engine') ?? viewportElement
      const roomRect = roomElement.getBoundingClientRect()
      // The marker's content can be taller than its 44px box (a pin): the popup clears all of it.
      const bounds = unionRect([anchorElement, ...anchorElement.children])
      const anchor = {
        x: bounds.left - originLeft,
        y: bounds.top - originTop,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
      }
      const placed = computePlacement(
        anchor,
        size,
        {
          x: roomRect.left + roomElement.clientLeft - originLeft,
          y: roomRect.top + roomElement.clientTop - originTop,
          width: roomElement.clientWidth,
          height: roomElement.clientHeight,
        },
        { placement: 'top', offset: POPUP_OFFSET, padding: POPUP_EDGE },
      )
      const center = anchor.x + anchor.width / 2
      const next: PopupLayout = {
        anchorId,
        x: Math.round(placed.x),
        y: Math.round(placed.y),
        side: placed.placement === 'bottom' ? 'bottom' : 'top',
        caretX: Math.round(
          Math.min(Math.max(center - placed.x, CARET_INSET), placed.width - CARET_INSET),
        ),
        maxBlockSize: Math.floor(placed.maxHeight),
      }
      setLayout((current) =>
        current && JSON.stringify(current) === JSON.stringify(next) ? current : next,
      )
    }
  }
  const placeRef = useRef(place)
  useLayoutEffect(() => {
    placeRef.current = place
  })
  useLayoutEffect(() => {
    placeRef.current()
    // The anchor moves with the camera and the viewport resizes with the bounds: nothing else changes the placement.
  }, [anchorId, viewportId, view, bounds, handle])
  // The dialog is the scroller: Close sits outside it, so it needs to know how wide the scrollbar is.
  useLayoutEffect(() => {
    const element = sectionElement.current
    if (!element) {
      return
    }
    const measure = () => {
      const style = getComputedStyle(element)
      const borders =
        parseFloat(style.borderInlineStartWidth) + parseFloat(style.borderInlineEndWidth)
      setScrollbarSize(Math.max(0, element.offsetWidth - element.clientWidth - borders))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  // The camera moves every frame, the view in the store only now and then: the popup follows the frame.
  useMapFrame(handle, () => placeRef.current())

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event)
    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.stopPropagation()
      onClose()
    }
  }

  const target = map.popupSlot ?? document.getElementById(map.ids.viewport)
  if (!target) {
    return null
  }
  const popupStyle = {
    '--kv-map-popup-x': `${layout.x}px`,
    '--kv-map-popup-y': `${layout.y}px`,
    '--kv-map-caret-x': `${layout.caretX}px`,
    '--kv-map-popup-scrollbar-size': `${scrollbarSize}px`,
    '--kv-map-popup-max-block-size': layout.maxBlockSize > 0 ? `${layout.maxBlockSize}px` : 'none',
  } as CSSProperties
  return createPortal(
    <div className="kv-map-popup" data-side={layout.side} style={popupStyle}>
      <Root
        {...otherProps}
        {...(Root === 'dialog' ? { open: true } : { role: 'dialog' })}
        ref={mergedRef}
        id={dialogId}
        aria-labelledby={labelledBy}
        onKeyDown={handleKeyDown}
      >
        {children({ side: layout.side })}
      </Root>
      <span className="kv-map-popup-caret" aria-hidden="true" />
    </div>,
    target,
  )
}
MapPopup.displayName = 'Map.Popup'
