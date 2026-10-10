import { useContext, useMemo } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { KvirnConfigContext } from '../provider/provider-context.ts'
import { builtInIcons } from './built-in-icons.tsx'
import { readIconEntry } from './icon-registry.ts'
import type { IconComponent, IconName } from './icon-registry.ts'

/**
 * The size in pixels, as a string: `'20'` is 1.25rem. The theme turns it into rem with a class,
 * so it follows the root font size and not the surrounding text. Another size is a class you add.
 */
export type IconSize =
  | '12'
  | '14'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32'
  | '40'
  | '48'
  | '56'
  | '64'
  | '80'
  | '96'

/** Defaults for every Icon below a `KvirnProvider`. Instance props win. */
export interface IconDefaults {
  /** Default `'20'` (1.25rem). */
  size?: IconSize | undefined
}

export interface UseIconOptions extends IconDefaults {
  /** A built-in or registered icon. */
  name?: IconName | undefined
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
  className: `kv-icon kv-icon--size-${IconSize}`
  /** The size in rem, so an icon without the theme is still sized. */
  width: string
  height: string
  'data-mirror-in-rtl'?: ''
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

const pixelsPerRem = 16

/**
 * An icon's props, and the component for its name (contract: icon.a11y.md). The
 * icon is decorative unless it has a `label`.
 *
 * @example
 * const icon = useIcon({ name: 'close' })
 * const CloseIcon = icon.component
 * <CloseIcon {...icon.iconProps} />
 */
export function useIcon({ name, size, label, mirrorInRtl }: UseIconOptions = {}): UseIconResult {
  const { icons, iconDefaults } = useContext(KvirnConfigContext)
  // Own properties only: `name="constructor"` must not find `Object.prototype.constructor`.
  const appEntry = name !== undefined && Object.hasOwn(icons, name) ? icons[name] : undefined
  const builtInEntry =
    name !== undefined && Object.hasOwn(builtInIcons, name) ? builtInIcons[name] : undefined
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

  const resolvedSize = size ?? iconDefaults.size ?? '20'
  const isMirroredInRtl = mirrorInRtl ?? entryMirrorInRtl ?? false
  const isDecorative = label === undefined

  const iconProps = useMemo<IconPartProps>(() => {
    const length = `${Number(resolvedSize) / pixelsPerRem}rem`
    return {
      className: `kv-icon kv-icon--size-${resolvedSize}`,
      width: length,
      height: length,
      ...(isMirroredInRtl ? { 'data-mirror-in-rtl': '' } : {}),
      // The key stays when labelled: as `undefined`, it overrides a library's own aria-hidden.
      'aria-hidden': isDecorative ? 'true' : undefined,
      ...(isDecorative ? {} : { role: 'img', 'aria-label': label }),
    }
  }, [resolvedSize, isMirroredInRtl, isDecorative, label])

  return { iconProps, component: entry?.component, isDecorative }
}
