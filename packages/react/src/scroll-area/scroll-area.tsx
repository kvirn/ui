'use client'
import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { hasAccessibleName, withoutNameUnlessRegion } from './scroll-area-props.ts'
import { useScrollArea } from './use-scroll-area.ts'
import type { ScrollAreaRegion } from './use-scroll-area.ts'

const scrollAreaTags = ['div', 'section'] as const

interface ScrollAreaOwnProps {
  /** `'overflow'` (default): a named region only while it scrolls. `'always'`: a named region either way. */
  region?: ScrollAreaRegion | undefined
}

/** `as` is `div` (default) or `section`. It is a `region` while it scrolls either way. */
export type ScrollAreaProps = AsTag<(typeof scrollAreaTags)[number], 'div', ScrollAreaOwnProps>

/**
 * A `<div>` that scrolls with the browser's own scrollbars. While its content doesn't fit it is a
 * named `region` and a Tab stop, so a keyboard user can scroll it (1.4.10, 2.1.1); when everything
 * fits it is a plain `<div>`. Name it with `aria-labelledby` or `aria-label` (a development
 * warning without one once it is a region). Limit its height with CSS to scroll down as well.
 * Your own `tabIndex` wins.
 *
 * @example
 * <ScrollArea aria-label="Fees">
 *   <table>…</table>
 * </ScrollArea>
 */
export function ScrollArea({
  region,
  as,
  ref: consumerRef,
  ...otherProps
}: ScrollAreaProps): ReactElement {
  const { scrollAreaProps, isRegion, element } = useScrollArea({ region })
  const { ref: hookRef, ...hookProps } = scrollAreaProps
  const mergedRef = useMergedRef(consumerRef, hookRef)
  const partProps = withoutNameUnlessRegion(mergeProps(hookProps, otherProps, { ref: mergedRef }))

  // Checked after commit, when the labelling element is in, and again when the area becomes a
  // region (it starts to scroll).
  useEffect(() => {
    if (isRegion && element !== null && !hasAccessibleName(element)) {
      warnOnce(
        'scroll-area-without-name',
        'A ScrollArea is a region (it scrolls, or has `region="always"`) and has no name. Add `aria-labelledby` or `aria-label`. A region without a name is read as an unlabelled landmark (WCAG 4.1.2).',
      )
    }
  }, [element, isRegion])

  return renderPart({
    as: resolveAsTag({ part: 'ScrollArea', as, allowedTags: scrollAreaTags }),
    defaultElement: 'div',
    partProps,
  })
}
ScrollArea.displayName = 'ScrollArea'
