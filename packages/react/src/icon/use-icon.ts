import { useContext, useMemo } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { KvirnConfigContext } from '../provider/provider-context.ts'
import { builtInIcons } from './built-in-icons.tsx'
import { readIconEntry } from './icon-registry.ts'
import type { IconComponent, IconName } from './icon-registry.ts'

/** A size step. `sm` 1em, `md` 1.25em, `lg` 1.5em: 16, 20 and 24px next to 16px text. */
export type IconSizeStep = 'sm' | 'md' | 'lg'

/** A step, pixels as a number, or a length that the `width` attribute accepts. */
export type IconSize = IconSizeStep | number | `${number}em` | `${number}rem` | `${number}px`

/** Defaults for every Icon below a `KvirnProvider`. Instance props win. */
export interface IconDefaults {
  /** Default `'md'`. */
  size?: IconSize | undefined
  /** Unset by default: each icon keeps its own (the built-in set draws 1.5). */
  strokeWidth?: number | string | undefined
}

export interface UseIconOptions extends IconDefaults {
  /** A built-in or registered icon. */
  name?: IconName | undefined
  /**
   * Sets `currentColor` for the icon, so it works with every library. Default: the text colour
   * around it. A custom property works: `color="var(--kv-color-danger)"`.
   */
  color?: string | undefined
  /** The root `<svg>`'s `fill`. Shapes that set their own fill keep it. */
  fill?: string | undefined
  /** The root `<svg>`'s `stroke`. With Tabler, use `color`: its `stroke` prop is the width. */
  stroke?: string | undefined
  /**
   * Makes the icon an image with this name, from your own translations. Leave it
   * out when text next to the icon says the same thing: the icon is then hidden from
   * assistive technology.
   */
  label?: string | undefined
  /**
   * Flip the icon in right-to-left text. Default: the registry entry's, else the built-in icon's
   * of the same name, else `false`.
   */
  mirrorInRtl?: boolean | undefined
}

/** Spread on the root `<svg>`, or pass to an icon component. Attributes only, never `style`. */
export interface IconPartProps {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS. */
  className: 'kv-icon'
  width: string | number
  height: string | number
  /** The size step, when the size is one. */
  'data-size'?: IconSizeStep
  'data-mirror-in-rtl'?: ''
  strokeWidth?: number | string
  color?: string
  fill?: string
  stroke?: string
  /** `'true'` for a decorative icon. Present as `undefined` otherwise, which clears a library's own. */
  'aria-hidden': 'true' | undefined
  role?: 'img'
  'aria-label'?: string
}

export interface UseIconResult {
  iconProps: IconPartProps
  /** The registered or built-in component for `name`. `undefined` without a name, or for an unknown one. */
  component: IconComponent | undefined
  /** `true` unless the icon has a `label`. */
  isDecorative: boolean
}

const sizeSteps: Readonly<Record<IconSizeStep, string>> = Object.freeze({
  sm: '1em',
  md: '1.25em',
  lg: '1.5em',
})

const isSizeStep = (size: IconSize): size is IconSizeStep =>
  typeof size === 'string' && size in sizeSteps

/**
 * An icon's props, and the component for its name (contract: icon.a11y.md). The
 * icon is decorative unless it has a `label`.
 *
 * @example
 * const icon = useIcon({ name: 'close' })
 * const CloseIcon = icon.component
 * <CloseIcon {...icon.iconProps} />
 */
export function useIcon({
  name,
  size,
  strokeWidth,
  color,
  fill,
  stroke,
  label,
  mirrorInRtl,
}: UseIconOptions = {}): UseIconResult {
  const { icons, iconDefaults } = useContext(KvirnConfigContext)
  const appEntry = name === undefined ? undefined : icons[name]
  const builtInEntry = name === undefined ? undefined : builtInIcons[name]
  const entryToUse = appEntry ?? builtInEntry
  const entry = entryToUse === undefined ? undefined : readIconEntry(entryToUse)
  // Mirroring belongs to the name: a plain override of a built-in keeps the built-in's.
  const entryMirrorInRtl =
    entry?.mirrorInRtl ??
    (builtInEntry === undefined ? undefined : readIconEntry(builtInEntry).mirrorInRtl)

  if (name !== undefined && entry === undefined) {
    warnOnce(
      `unknown-icon:${name}`,
      `<Icon name="${name}"> isn't a built-in icon or registered in a KvirnProvider, so it renders an empty <svg>. Add it with defineIcons and pass the registry to <KvirnProvider icons>.`,
    )
  }

  const resolvedSize = size ?? iconDefaults.size ?? 'md'
  const resolvedStrokeWidth = strokeWidth ?? iconDefaults.strokeWidth
  const isMirroredInRtl = mirrorInRtl ?? entryMirrorInRtl ?? false
  const isDecorative = label === undefined

  const iconProps = useMemo<IconPartProps>(() => {
    const length = isSizeStep(resolvedSize) ? sizeSteps[resolvedSize] : resolvedSize
    return {
      className: 'kv-icon',
      width: length,
      height: length,
      ...(isSizeStep(resolvedSize) ? { 'data-size': resolvedSize } : {}),
      ...(isMirroredInRtl ? { 'data-mirror-in-rtl': '' } : {}),
      ...(resolvedStrokeWidth === undefined ? {} : { strokeWidth: resolvedStrokeWidth }),
      ...(color === undefined ? {} : { color }),
      ...(fill === undefined ? {} : { fill }),
      ...(stroke === undefined ? {} : { stroke }),
      // The key stays when labelled: as `undefined`, it overrides a library's own aria-hidden.
      'aria-hidden': isDecorative ? 'true' : undefined,
      ...(isDecorative ? {} : { role: 'img', 'aria-label': label }),
    }
  }, [resolvedSize, isMirroredInRtl, resolvedStrokeWidth, color, fill, stroke, isDecorative, label])

  return { iconProps, component: entry?.component, isDecorative }
}
