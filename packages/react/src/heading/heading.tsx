'use client'
import type { HTMLAttributes, ReactElement, Ref } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useHeading } from './use-heading.ts'
import type { HeadingLevel, HeadingSize } from './use-heading.ts'

export type HeadingTag = `h${HeadingLevel}`

const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const satisfies readonly HeadingTag[]

const levels = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 } as const satisfies Record<
  HeadingTag,
  HeadingLevel
>

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * The element, and so the level the page's outline needs: `h1` to `h6`. Required, because
   * Heading can't know where it sits (2.4.6, 1.3.1). For a `<legend>` or another element, use
   * `useHeading` with your own element.
   */
  as: HeadingTag
  /**
   * The look, apart from the level: `display` or `heading-1` to `heading-6`, the type roles.
   * Each level looks like the role of its number (`as="h4"` is `heading-4`) unless you say
   * otherwise.
   */
  size?: HeadingSize | undefined
  ref?: Ref<HTMLHeadingElement> | undefined
}

export type { HeadingLevel, HeadingSize }

/**
 * A heading with its element as a required prop, and its look as an optional one (contract:
 * heading.a11y.md): `<Heading as="h3" size="heading-2">` is an `<h3>` set as heading-2. It adds
 * `kv-heading` and a size class, and no role or ARIA. Choose the element for the page's outline,
 * not for size.
 *
 * @example
 * <Heading as="h1" size="display" id="start">Välkommen till Kvirnby</Heading>
 */
export function Heading({ as, size, ref, ...otherProps }: HeadingProps): ReactElement {
  // A JS caller can pass any string. The outline can't be guessed, so the fallback is h2 and warns.
  const tag = resolveAsTag({ part: 'Heading', as, allowedTags: headingTags }) ?? 'h2'
  const heading = useHeading({ level: levels[tag], size })
  // The classes join a prop's own class names (mergeProps), so a prop can't remove them and the
  // theme keeps styling the heading.
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as: tag,
    defaultElement: heading.element,
    partProps: { ...mergeProps(otherProps, heading.rootProps), ref: elementRef },
  })
}
Heading.displayName = 'Heading'
