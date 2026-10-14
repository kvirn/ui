import { Icon, Tooltip } from '@kvirn-ui/react'
import type { IconComponent, IconName } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { joinClassNames } from './class-names.ts'
import { useMapContext } from './map-context.ts'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  RemoveIcon,
} from './map-icons.tsx'

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

/** Zoom, Reset and the pan cross: every pointer gesture as a single-pointer button (WCAG 2.5.7). */
export function MapControls({
  className,
  ...otherProps
}: Omit<ComponentPropsWithRef<'div'>, 'children'>): ReactElement {
  const map = useMapContext('Controls')
  const { messages } = map
  const groupProps = {
    className: joinClassNames('kv-map-controls', className),
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
