'use client'
import { useEffect } from 'react'
import type { ReactElement, ReactNode, Ref, RefCallback, SVGProps } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import type { IconComponent, IconName } from './icon-registry.ts'
import { useIcon } from './use-icon.ts'
import type { UseIconOptions } from './use-icon.ts'

/** What `render` receives as its second argument. */
export interface IconState {
  isDecorative: boolean
}

/**
 * What a `render` function gets to spread on its `<svg>`: your attributes, the part's props
 * (`IconPartProps`) and a callback ref.
 */
export interface IconElementProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  ref: RefCallback<SVGSVGElement>
}

/**
 * The accessible name comes from `label` only, so `aria-label`, `aria-hidden` and `role` are
 * left out. Icon's own options replace the SVG attributes of the same name.
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
    >,
    Omit<UseIconOptions, 'name'> {
  ref?: Ref<SVGSVGElement> | undefined
}

interface IconByNameProps {
  /** A built-in or registered icon. */
  name: IconName
  icon?: never
  render?: never
  children?: never
}

interface IconByComponentProps {
  name?: never
  /**
   * A component from an icon library, or your own: `icon={Search}`. It needs no registration.
   * Icon's `size`, `color` and `label` replace the component's own, and `className` is joined with it.
   */
  icon: IconComponent
  render?: never
  children?: never
}

interface IconByRenderProps {
  name?: never
  icon?: never
  /**
   * A one-off icon that isn't registered, as an element (`render={<svg viewBox="0 0 24 24" />}`,
   * whose own props win over Icon's) or a function that spreads the props on its own `<svg>`.
   * For a library component use `icon`: an element such as `<TrashIcon />` carries its own
   * size, which wins over Icon's.
   */
  render: RenderProp<IconElementProps, IconState> | undefined
  children?: never
}

interface IconByChildrenProps {
  name?: never
  icon?: never
  render?: never
  /** Your own shapes, with Icon as the `<svg>`. Pass a `viewBox` too. */
  children?: ReactNode
}

/** One source for the drawing: `name`, `icon`, `render` or `children`. */
export type IconProps = IconBaseProps &
  (IconByNameProps | IconByComponentProps | IconByRenderProps | IconByChildrenProps)

const unknownNameProps = Object.freeze({ viewBox: '0 0 24 24' })

/**
 * An icon: built-in, registered by name in `KvirnProvider`, a library component (`icon`), or
 * your own SVG (contract: icon.a11y.md). Decorative unless it has a `label`.
 *
 * @example
 * <Icon name="close" />
 * <Icon icon={Search} label={messages.search} />
 * <Icon name="warning" label={messages.warning} size={6} />
 * <Button><Icon name="add" />Lägg till</Button>
 */
export function Icon({
  name,
  icon: iconComponent,
  size,
  strokeWidth,
  color,
  fill,
  stroke,
  label,
  mirrorInRtl,
  render,
  children,
  ref,
  ...otherProps
}: IconProps): ReactElement {
  const icon = useIcon({ name, size, strokeWidth, color, fill, stroke, label, mirrorInRtl })
  const elementRef = useMergedRef(ref, null)

  const sources = [
    name !== undefined && 'name',
    iconComponent !== undefined && 'icon',
    render !== undefined && 'render',
    children !== undefined && 'children',
  ].filter((source) => source !== false)
  const givenSources = sources.join(', ')
  useEffect(() => {
    if (givenSources.includes(',')) {
      warnOnce(
        `icon-exclusive-props:${givenSources}`,
        `<Icon> got ${givenSources} together, and it can draw only one. Which one wins is not a contract, so the icon may change. Give name (a registered icon), icon (a component), render or children, not several.`,
      )
    }
  }, [givenSources])

  // An unknown name's empty placeholder keeps the icon's box: without a viewBox, CSS such as
  // `block-size: auto` would give it a replaced element's default height.
  const placeholderProps =
    name !== undefined && icon.component === undefined ? unknownNameProps : {}

  return renderPart({
    render,
    defaultElement: iconComponent ?? icon.component ?? 'svg',
    partProps: {
      ...mergeProps(otherProps, placeholderProps, icon.iconProps),
      ...(children === undefined ? {} : { children }),
      ref: elementRef,
    },
    state: { isDecorative: icon.isDecorative },
  })
}
Icon.displayName = 'Icon'
