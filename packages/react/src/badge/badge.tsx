'use client'
import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useBadge } from './use-badge.ts'
import type { BadgeVariant } from './use-badge.ts'

const badgeTags = ['span', 'strong', 'em'] as const

interface BadgeOwnProps {
  /** The role of the badge. Default `neutral`. The words are yours: the colour is never the only cue. */
  variant?: BadgeVariant | undefined
}

/** `as` is `span` (default), `strong` or `em`. Its own semantics apply. */
export type BadgeProps = AsTag<(typeof badgeTags)[number], 'span', BadgeOwnProps>

/**
 * A short status or category in words (contract: badge.a11y.md): one
 * `<span class="kv-badge">`, drawn as a pill by the theme. It has no role, ARIA or behaviour, is
 * not a Tab stop and announces nothing. For something that acts, use a Button.
 *
 * @example
 * <Badge variant="success">Beviljad</Badge>
 */
export function Badge({ variant = 'neutral', as, ref, ...otherProps }: BadgeProps): ReactElement {
  const badge = useBadge({ variant })
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as: resolveAsTag({ part: 'Badge', as, allowedTags: badgeTags }),
    defaultElement: badge.element,
    partProps: { ...mergeProps(otherProps, badge.rootProps), ref: elementRef },
  })
}
Badge.displayName = 'Badge'
