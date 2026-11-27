import {
  AddIcon,
  ArrowEastIcon,
  ArrowNorthIcon,
  ArrowSouthIcon,
  ArrowWestIcon,
  RemoveIcon,
} from '@kvirn/icons/react'
import { Tooltip } from '@kvirn/ui'
import type { IconName } from '@kvirn/ui'
import { LibraryIcon } from '@kvirn/ui/internal'
import type { LibraryIconProps } from '@kvirn/ui/internal'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'
import { useMapOverlayRef } from './map-overlay.tsx'

function ControlButton({
  label,
  name,
  icon,
  disabled,
  onPress,
  className,
}: {
  label: string
  name: IconName
  icon: LibraryIconProps['icon']
  disabled?: boolean
  onPress: () => void
  className?: string
}): ReactElement {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        className={joinClassNames('kv-button kv-button--icon-only', className)}
        type="button"
        aria-label={label}
        aria-disabled={disabled ? true : undefined}
        onClick={onPress}
      >
        <LibraryIcon name={name} icon={icon} />
      </Tooltip.Trigger>
      <Tooltip.Popup>
        <Tooltip.Name>{label}</Tooltip.Name>
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}

/** Zoom, the pan disc and Reset: every pointer gesture as a single-pointer button (WCAG 2.5.7). */
export function MapControls({
  className,
  ref,
  ...otherProps
}: Omit<ComponentPropsWithRef<'div'>, 'children'>): ReactElement {
  const map = useMapContext('Controls')
  const overlayRef = useMapOverlayRef(ref)
  const { messages } = map
  const groupProps = {
    className: joinClassNames('kv-map-controls', className),
    role: 'group',
    'aria-label': messages.controlsLabel,
  }
  return (
    <div {...otherProps} {...groupProps} ref={overlayRef}>
      <div className="kv-map-zoom">
        <ControlButton
          label={messages.zoomIn}
          name="add"
          icon={AddIcon}
          disabled={!map.canZoomIn}
          onPress={map.zoomIn}
        />
        <ControlButton
          label={messages.zoomOut}
          name="remove"
          icon={RemoveIcon}
          disabled={!map.canZoomOut}
          onPress={map.zoomOut}
        />
      </div>
      <div className="kv-map-pan">
        <ControlButton
          label={messages.panNorth}
          className="kv-map-pan-north"
          name="arrow-north"
          icon={ArrowNorthIcon}
          onPress={() => map.pan('north')}
        />
        <ControlButton
          label={messages.panWest}
          className="kv-map-pan-west"
          name="arrow-west"
          icon={ArrowWestIcon}
          onPress={() => map.pan('west')}
        />
        <ControlButton
          label={messages.panEast}
          className="kv-map-pan-east"
          name="arrow-east"
          icon={ArrowEastIcon}
          onPress={() => map.pan('east')}
        />
        <ControlButton
          label={messages.panSouth}
          className="kv-map-pan-south"
          name="arrow-south"
          icon={ArrowSouthIcon}
          onPress={() => map.pan('south')}
        />
      </div>
      <button type="button" className="kv-button kv-map-reset" onClick={map.reset}>
        {messages.reset}
      </button>
    </div>
  )
}
MapControls.displayName = 'Map.Controls'
