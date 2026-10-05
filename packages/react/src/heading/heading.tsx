'use client'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useHeading } from './use-heading.ts'
import type { HeadingLevel, HeadingSize } from './use-heading.ts'

/** What `render` receives as its second argument. */
export interface HeadingState {
  level: HeadingLevel
  /** The size that applies: the one given, or the level's own. */
  size: HeadingSize
}

/** What a `render` function gets to spread: your attributes, the classes and a callback ref. */
export interface HeadingElementProps extends HTMLAttributes<HTMLHeadingElement> {
  ref: RefCallback<HTMLHeadingElement>
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * The level the page's outline needs: `1` to `6`. Required, because Heading can't know where it
   * sits (2.4.6, 1.3.1). It renders `<h1>` to `<h6>`.
   */
  level: HeadingLevel
  /**
   * The look, apart from the level: `display` or `heading-1` to `heading-6`, the type roles.
   * Each level looks like the role of its number (`level={4}` is `heading-4`) unless you say
   * otherwise.
   */
  size?: HeadingSize | undefined
  ref?: Ref<HTMLHeadingElement> | undefined
  /**
   * Change the element: `render={<legend />}`. Its own semantics apply, and `level` is then only
   * what the function form reads from `state`.
   */
  render?: RenderProp<HeadingElementProps, HeadingState> | undefined
}

export type { HeadingLevel, HeadingSize }

/**
 * A heading with its level as a required prop, and its look as an optional one (contract:
 * heading.a11y.md): `<Heading level={3} size="heading-2">` is an `<h3>` set as heading-2. It adds
 * `kv-heading` and a size class, and no role or ARIA. Choose the level for the page's outline,
 * not for size.
 *
 * @example
 * <Heading level={1} size="display" id="start">Välkommen till Kvirnby</Heading>
 */
export function Heading({ level, size, render, ref, ...otherProps }: HeadingProps): ReactElement {
  const heading = useHeading({ level, size })
  // The classes join a prop's and a render element's own class names (mergeProps), so neither
  // can remove them and the theme keeps styling the heading.
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: heading.element,
    partProps: { ...mergeProps(otherProps, heading.rootProps), ref: elementRef },
    state: { level, size: heading.size },
  })
}
Heading.displayName = 'Heading'
