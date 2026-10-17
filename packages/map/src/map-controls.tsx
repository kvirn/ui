import { arrowEast, arrowNorth, arrowSouth, arrowWest, remove } from '@kvirn-ui/icons'
import type { IconData } from '@kvirn-ui/icons'
import { Icon, Tooltip } from '@kvirn-ui/react'
import type { IconName } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'
import { useMapOverlayRef } from './map-overlay.tsx'

function ControlButton({
  label,
  icon,
  disabled,
  onPress,
  className,
}: {
  label: string
  icon: IconName | IconData
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
        {typeof icon === 'string' ? <Icon name={icon} /> : <Icon icon={icon} />}
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
          icon="add"
          disabled={!map.canZoomIn}
          onPress={map.zoomIn}
        />
        <ControlButton
          label={messages.zoomOut}
          icon={remove}
          disabled={!map.canZoomOut}
          onPress={map.zoomOut}
        />
      </div>
      <div className="kv-map-pan">
        <ControlButton
          label={messages.panNorth}
          className="kv-map-pan-north"
          icon={arrowNorth}
          onPress={() => map.pan('north')}
        />
        <ControlButton
          label={messages.panWest}
          className="kv-map-pan-west"
          icon={arrowWest}
          onPress={() => map.pan('west')}
        />
        <ControlButton
          label={messages.panEast}
          className="kv-map-pan-east"
          icon={arrowEast}
          onPress={() => map.pan('east')}
        />
        <ControlButton
          label={messages.panSouth}
          className="kv-map-pan-south"
          icon={arrowSouth}
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
