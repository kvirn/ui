'use client'
import type { ReactElement, ReactNode, Ref, RefCallback, SVGProps } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import type { IconName } from './icon-registry.ts'
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
  render?: never
  children?: never
}

interface IconOneOffProps {
  name?: never
  /**
   * A one-off icon that isn't registered: `render={<TrashIcon />}`, or a function that spreads
   * the props on its own `<svg>`.
   */
  render?: RenderProp<IconElementProps, IconState> | undefined
  /** Your own shapes, with Icon as the `<svg>`. Pass a `viewBox` too. */
  children?: ReactNode
}

export type IconProps = IconBaseProps & (IconByNameProps | IconOneOffProps)

const unknownNameProps = Object.freeze({ viewBox: '0 0 24 24' })

/**
 * An icon: built-in, registered by name in `KvirnProvider`, a library component, or your own
 * SVG (contract: icon.a11y.md). Decorative unless it has a `label`.
 *
 * @example
 * <Icon name="close" />
 * <Icon name="warning" label={messages.warning} size="lg" />
 * <Button><Icon name="add" />Lägg till</Button>
 */
export function Icon({
  name,
  size,
  strokeWidth,
  color,
  fill,
  stroke,
  label,
  mirrorInRtl,
  render,
  ref,
  ...otherProps
}: IconProps): ReactElement {
  const icon = useIcon({ name, size, strokeWidth, color, fill, stroke, label, mirrorInRtl })
  const elementRef = useMergedRef(ref, null)

  // An unknown name's empty placeholder keeps the icon's box: without a viewBox, CSS such as
  // `block-size: auto` would give it a replaced element's default height.
  const placeholderProps =
    name !== undefined && icon.component === undefined ? unknownNameProps : {}

  return renderPart({
    render,
    defaultElement: icon.component ?? 'svg',
    partProps: { ...mergeProps(otherProps, placeholderProps, icon.iconProps), ref: elementRef },
    state: { isDecorative: icon.isDecorative },
  })
}
Icon.displayName = 'Icon'
