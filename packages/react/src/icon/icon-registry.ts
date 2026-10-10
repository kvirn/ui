import type { ComponentType, Ref } from 'react'
import type { Register } from '../provider/register.ts'
import type { BuiltInIconName } from './built-in-icons.tsx'

/**
 * What Icon passes to an icon component: attributes for the root `<svg>`, and a ref.
 * Optional fields are values or absent, so components that type them strictly (Phosphor) fit.
 */
export interface IconComponentProps {
  ref?: Ref<SVGSVGElement>
  className?: string
  width?: string | number
  height?: string | number
  role?: 'img'
  /** `undefined` clears a library's own `aria-hidden` on a labelled icon. */
  'aria-hidden'?: 'true' | undefined
  'aria-label'?: string
  'data-mirror-in-rtl'?: ''
}

/**
 * Any component that spreads SVG props onto one `<svg>` and forwards its ref: Lucide,
 * Heroicons, Phosphor, Tabler, SVGR output, or your own.
 */
export type IconComponent = ComponentType<IconComponentProps>

/** One registry entry: the component, or the component with options. */
export type IconRegistryEntry =
  | IconComponent
  | {
      component: IconComponent
      /** Flip this icon in right-to-left text: arrows and chevrons, never logos or ticks. */
      mirrorInRtl?: boolean | undefined
    }

/** Icon names mapped to entries. Pass it to `KvirnProvider icons`. */
export type IconRegistry = Readonly<Record<string, IconRegistryEntry>>

/** The icons a `Register`-shaped interface names, or none. */
export type IconsOf<Registration> = Registration extends { icons: infer Icons } ? Icons : {}

/** The icon names a `Register`-shaped interface allows: the built-in set plus its own. */
export type IconNameOf<Registration> = BuiltInIconName | (keyof IconsOf<Registration> & string)

/**
 * A name `<Icon name>` accepts: a built-in icon, or one the app registered.
 *
 * ```ts
 * declare module '@kvirn-ui/react' {
 *   interface Register {
 *     icons: typeof icons
 *   }
 * }
 * ```
 */
export type IconName = IconNameOf<Register>

/**
 * Types and freezes an icon registry for `KvirnProvider icons`. Register its type
 * once, so `<Icon name>` checks names.
 *
 * @example
 * export const icons = defineIcons({
 *   'arrow-forward': { component: ArrowRight, mirrorInRtl: true },
 *   delete: TrashIcon,
 * })
 */
export function defineIcons<const Icons extends IconRegistry>(icons: Icons): Icons {
  return Object.freeze({ ...icons })
}

/** Internal. An entry's component and options, whichever form it was registered in. */
export function readIconEntry(entry: IconRegistryEntry): {
  component: IconComponent
  mirrorInRtl: boolean | undefined
} {
  return typeof entry === 'object' && 'component' in entry
    ? { component: entry.component, mirrorInRtl: entry.mirrorInRtl }
    : { component: entry, mirrorInRtl: undefined }
}
