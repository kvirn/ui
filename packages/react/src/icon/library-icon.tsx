'use client'
import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { renderPart } from '../render/render-part.ts'
import type { IconName, IconRegistryEntry } from './icon-registry.ts'
import { useIcon } from './use-icon.ts'
import type { UseIconOptions } from './use-icon.ts'

export interface LibraryIconProps extends Omit<UseIconOptions, 'name'> {
  /** The registry key an app registers to replace this icon, such as `close`. */
  name: IconName
  /** The library's own icon, drawn when the app has not registered `name`: `CloseIcon` from `@kvirn/icons/react`. */
  icon: IconRegistryEntry
  className?: string | undefined
}

/**
 * Internal. A KvirnUI component's own icon: the app's registered `name`, else `icon`. Registering
 * `close` swaps every component's close icon, and an unregistered name is not a mistake here.
 */
export function LibraryIcon({
  name,
  icon,
  size,
  label,
  variant,
  mirrorInRtl,
  className,
}: LibraryIconProps): ReactElement {
  const { component: IconComponent, iconProps } = useIcon({
    name,
    fallbackIcon: icon,
    fallbackMirrorInRtl: mirrorInRtl,
    size,
    label,
    variant,
  })
  return renderPart({
    as: undefined,
    defaultElement: IconComponent ?? 'svg',
    partProps: mergeProps({ className }, iconProps),
  })
}
LibraryIcon.displayName = 'LibraryIcon'
