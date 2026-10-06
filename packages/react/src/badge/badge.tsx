'use client'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useBadge } from './use-badge.ts'
import type { BadgeVariant } from './use-badge.ts'

/** What `render` receives as its second argument. */
export interface BadgeState {
  variant: BadgeVariant
}

/** What a `render` function gets to spread: your attributes, the class and a callback ref. */
export interface BadgeElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

export interface BadgeProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement> | undefined
  /** The role of the badge. Default `neutral`. The words are yours: the colour is never the only cue. */
  variant?: BadgeVariant | undefined
  /** Change the element: `render={<strong />}`. Its own semantics apply. */
  render?: RenderProp<BadgeElementProps, BadgeState> | undefined
}

/**
 * A short status or category in words (contract: badge.a11y.md): one
 * `<span class="kv-badge">`, drawn as a pill by the theme. It has no role, ARIA or behaviour, is
 * not a Tab stop and announces nothing. For something that acts, use a Button.
 *
 * @example
 * <Badge variant="success">Beviljad</Badge>
 */
export function Badge({
  variant = 'neutral',
  render,
  ref,
  ...otherProps
}: BadgeProps): ReactElement {
  const badge = useBadge({ variant })
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    render,
    defaultElement: badge.element,
    partProps: { ...mergeProps(otherProps, badge.rootProps), ref: elementRef },
    state: { variant },
  })
}
Badge.displayName = 'Badge'
