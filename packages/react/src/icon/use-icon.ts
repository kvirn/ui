import { useContext, useMemo } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { KvirnConfigContext } from '../provider/provider-context.ts'
import { defaultIcons } from './default-icons.ts'
import { readIconEntry } from './icon-registry.ts'
import type { IconComponent, IconName, IconRegistryEntry } from './icon-registry.ts'

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

/**
 * A colour from the theme, picked by the class `kv-icon--<variant>`. Without one the icon keeps
 * the text colour around it (`currentColor`). It decorates: words carry the meaning.
 */
export type IconVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'muted'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

/** Defaults for every Icon below a `KvirnProvider`. Instance props win. */
export interface IconDefaults {
  /** Default `'20'` (1.25rem). */
  size?: IconSize | undefined
}

export interface UseIconOptions extends IconDefaults {
  /** A default or registered icon. */
  name?: IconName | undefined
  /** A drawing from `@kvirn-ui/icons` or a component, used instead of a name. It needs no registration. */
  icon?: IconRegistryEntry | undefined
  /**
   * Makes the icon an image with this name, from your own translations. Leave it
   * out when text next to the icon says the same thing: the icon is then hidden from
   * assistive technology.
   */
  label?: string | undefined
  /**
   * The icon's colour, from the theme. Default: none, so the icon follows the text colour. It never
   * changes the icon's name or role, and it never replaces words (1.4.1).
   */
  variant?: IconVariant | undefined
  /**
   * Flip the icon in right-to-left text. Default: the registry entry's, else the default icon's
   * of the same name, else `false`.
   */
  mirrorInRtl?: boolean | undefined
}

/** Spread on the root `<svg>`, or pass to an icon component. Attributes only, never `style`. */
export interface IconPartProps {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS. */
  className:
    | `kv-icon kv-icon--size-${IconSize}`
    | `kv-icon kv-icon--size-${IconSize} kv-icon--${IconVariant}`
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
  /** The registered or default component for `name` or `icon`. `undefined` without either, or for an unknown name. */
  component: IconComponent | undefined
  /** `true` unless the icon has a `label`. */
  isDecorative: boolean
}

const pixelsPerRem = 16
const defaultSize: IconSize = '20'
const iconSizes: readonly string[] = [
  '12',
  '14',
  '16',
  '20',
  '24',
  '28',
  '32',
  '40',
  '48',
  '56',
  '64',
  '80',
  '96',
] satisfies IconSize[]
const iconVariants: readonly string[] = [
  'primary',
  'secondary',
  'accent',
  'muted',
  'info',
  'success',
  'warning',
  'danger',
] satisfies IconVariant[]

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
  icon,
  size,
  label,
  variant,
  mirrorInRtl,
}: UseIconOptions = {}): UseIconResult {
  const { icons, iconDefaults } = useContext(KvirnConfigContext)
  // Own properties only: `name="constructor"` must not find `Object.prototype.constructor`.
  const appEntry = name !== undefined && Object.hasOwn(icons, name) ? icons[name] : undefined
  const builtInEntry =
    name !== undefined && Object.hasOwn(defaultIcons, name)
      ? (defaultIcons as Readonly<Record<string, IconRegistryEntry>>)[name]
      : undefined
  const entryToUse = icon ?? appEntry ?? builtInEntry
  const entry = entryToUse === undefined ? undefined : readIconEntry(entryToUse)
  // Mirroring belongs to the name: a plain override of a default keeps the default's.
  const entryMirrorInRtl =
    entry?.mirrorInRtl ??
    (icon !== undefined || builtInEntry === undefined
      ? undefined
      : readIconEntry(builtInEntry).mirrorInRtl)

  if (name !== undefined && icon === undefined && entry === undefined) {
    warnOnce(
      `unknown-icon:${name}`,
      `<Icon name="${name}"> isn't a default icon or registered in a KvirnProvider, so it renders an empty <svg>. Add it with defineIcons and pass the registry to <KvirnProvider icons>.`,
    )
  }

  const requestedSize = size ?? iconDefaults.size ?? defaultSize
  // A JS consumer, or a cast, can pass a size the theme has no class for.
  const isKnownSize = iconSizes.includes(requestedSize)
  const resolvedSize = isKnownSize ? requestedSize : defaultSize

  if (!isKnownSize) {
    warnOnce(
      `unknown-icon-size:${String(requestedSize)}`,
      `<Icon size={${JSON.stringify(requestedSize)}}> isn't one of the sizes ${iconSizes.join(', ')}, so it renders at ${defaultSize}. size is the pixel size as a string, and another size is a class you add.`,
    )
  }
  // A JS consumer, or a cast, can pass a variant the theme has no class for.
  const resolvedVariant =
    variant !== undefined && iconVariants.includes(variant) ? variant : undefined

  if (variant !== undefined && resolvedVariant === undefined) {
    warnOnce(
      `unknown-icon-variant:${String(variant)}`,
      `<Icon variant={${JSON.stringify(variant)}}> isn't one of the variants ${iconVariants.join(', ')}, so it adds no colour class. Leave variant out for the text colour, and a colour of your own is a class you add.`,
    )
  }
  const isMirroredInRtl = mirrorInRtl ?? entryMirrorInRtl ?? false
  const isDecorative = label === undefined

  const iconProps = useMemo<IconPartProps>(() => {
    const length = `${Number(resolvedSize) / pixelsPerRem}rem`
    return {
      className:
        resolvedVariant === undefined
          ? `kv-icon kv-icon--size-${resolvedSize}`
          : `kv-icon kv-icon--size-${resolvedSize} kv-icon--${resolvedVariant}`,
      width: length,
      height: length,
      ...(isMirroredInRtl ? { 'data-mirror-in-rtl': '' } : {}),
      // The key stays when labelled: as `undefined`, it overrides a library's own aria-hidden.
      'aria-hidden': isDecorative ? 'true' : undefined,
      ...(isDecorative ? {} : { role: 'img', 'aria-label': label }),
    }
  }, [resolvedSize, resolvedVariant, isMirroredInRtl, isDecorative, label])

  return { iconProps, component: entry?.component, isDecorative }
}
