import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useVisuallyHidden } from './use-visually-hidden.ts'

const visuallyHiddenTags = ['span', 'div', 'p', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

/**
 * `as` is `span` (default), `div`, `p`, or `h2` to `h6` for a heading nobody sees but the outline
 * has. No `h1`: the page's title is visible. Its own semantics apply.
 */
export type VisuallyHiddenProps = AsTag<(typeof visuallyHiddenTags)[number], 'span'>

/**
 * Text for screen readers that is not drawn (contract: visually-hidden.a11y.md): one
 * `<span class="kv-visually-hidden">`. The text stays in the accessibility tree, so it is read
 * and found. It has no role, ARIA or behaviour. Never put a focusable element inside it: a
 * focused control must be visible (2.4.7). For a bypass link, use SkipLink.
 *
 * @example
 * <p>Sökträffar<VisuallyHidden>, 3 resultat</VisuallyHidden></p>
 *
 * @example
 * <VisuallyHidden as="h2">Meny</VisuallyHidden>
 */
export function VisuallyHidden({ as, ref, ...otherProps }: VisuallyHiddenProps): ReactElement {
  const { visuallyHiddenProps } = useVisuallyHidden()
  const elementRef = useMergedRef(ref, null)
  return renderPart({
    as: resolveAsTag({ part: 'VisuallyHidden', as, allowedTags: visuallyHiddenTags }),
    defaultElement: 'span',
    partProps: { ...mergeProps(otherProps, visuallyHiddenProps), ref: elementRef },
  })
}
VisuallyHidden.displayName = 'VisuallyHidden'
