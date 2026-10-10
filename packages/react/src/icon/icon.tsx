'use client'
import { useEffect } from 'react'
import type { ElementType, ReactElement, ReactNode, Ref, SVGProps } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { IconComponent, IconName } from './icon-registry.ts'
import { useIcon } from './use-icon.ts'
import type { UseIconOptions } from './use-icon.ts'

/**
 * The accessible name comes from `label` only, so `aria-label`, `aria-hidden` and `role` are
 * left out, and so are `color`, `fill`, `stroke` and `strokeWidth`: an icon draws with
 * `currentColor`, so colour it with a class or `style` on a wrapper. Icon's own options replace the
 * SVG attributes of the same name.
 */
interface IconBaseProps
  extends
    Omit<
      SVGProps<SVGSVGElement>,
      | keyof UseIconOptions
      | 'ref'
      | 'children'
      | 'width'
      | 'height'
      | 'aria-label'
      | 'aria-hidden'
      | 'role'
      | 'color'
      | 'fill'
      | 'stroke'
      | 'strokeWidth'
    >,
    Omit<UseIconOptions, 'name'> {
  ref?: Ref<SVGSVGElement> | undefined
}

interface IconByNameProps {
  /** A built-in or registered icon. */
  name: IconName
  icon?: never
  as?: never
  children?: never
}

interface IconByComponentProps {
  name?: never
  /**
   * A component from an icon library, or your own: `icon={Search}`. It needs no registration.
   * Icon's `size` and `label` replace the component's own, and `className` is joined with it.
   */
  icon: IconComponent
  as?: never
  children?: never
}

interface IconByAsProps {
  name?: never
  icon?: never
  /**
   * A one-off icon that isn't registered, such as a municipality's mark: `as={MunicipalityMark}`.
   * It gets Icon's props as plain props (`width`, `height`, `aria-hidden`, `role`, `className`),
   * and Icon's own options (`size`, `label`) do not reach it under their own names. It
   * must spread them on its `<svg>` and take a `ref`.
   */
  as: ElementType
  children?: never
}

interface IconByChildrenProps {
  name?: never
  icon?: never
  as?: never
  /** Your own shapes, with Icon as the `<svg>`. Pass a `viewBox` too. */
  children?: ReactNode
}

/** One source for the drawing: `name`, `icon`, `as` or `children`. */
export type IconProps = IconBaseProps &
  (IconByNameProps | IconByComponentProps | IconByAsProps | IconByChildrenProps)

const unknownNameProps = Object.freeze({ viewBox: '0 0 24 24' })

/**
 * An icon: built-in, registered by name in `KvirnProvider`, a library component (`icon`), or
 * your own SVG (contract: icon.a11y.md). Decorative unless it has a `label`.
 *
 * @example
 * <Icon name="close" />
 * <Icon icon={Search} label={messages.search} />
 * <Icon name="warning" label={messages.warning} size="24" />
 * <Button><Icon name="add" />Lägg till</Button>
 */
export function Icon({
  name,
  icon: iconComponent,
  size,
  label,
  mirrorInRtl,
  as,
  children,
  ref,
  ...otherProps
}: IconProps): ReactElement {
  const icon = useIcon({ name, size, label, mirrorInRtl })
  const elementRef = useMergedRef(ref, null)

  const sources = [
    name !== undefined && 'name',
    iconComponent !== undefined && 'icon',
    as !== undefined && 'as',
    children !== undefined && 'children',
  ].filter((source) => source !== false)
  const givenSources = sources.join(', ')
  useEffect(() => {
    if (givenSources.includes(',')) {
      warnOnce(
        `icon-exclusive-props:${givenSources}`,
        `<Icon> got ${givenSources} together, and it can draw only one. Which one wins is not a contract, so the icon may change. Give name (a registered icon), icon (a component), as (your own component) or children, not several.`,
      )
    }
  }, [givenSources])

  // An unknown name's empty placeholder keeps the icon's box: without a viewBox, CSS such as
  // `block-size: auto` would give it a replaced element's default height.
  const placeholderProps =
    name !== undefined && icon.component === undefined ? unknownNameProps : {}

  return renderPart({
    as,
    defaultElement: iconComponent ?? icon.component ?? 'svg',
    partProps: {
      ...mergeProps(otherProps, placeholderProps, icon.iconProps),
      ...(children === undefined ? {} : { children }),
      ref: elementRef,
    },
  })
}
Icon.displayName = 'Icon'
