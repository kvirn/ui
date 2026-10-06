import { hasElementWithId } from './has-element-with-id.ts'

/** When a scroll area is a named `region`: only while it overflows (default), or always. */
export type ScrollAreaRegion = 'overflow' | 'always'

/**
 * Internal. The attributes every scroll container shares, for `ScrollArea` and `Table.ScrollRegion`:
 * a `region` while it overflows (or always), and a Tab stop with `data-overflowing` only while it
 * overflows (2.1.1). Not overflowing, with the default `region`, nothing is added.
 */
export function getScrollAreaProps<TClassName extends string>({
  className,
  isOverflowing,
  region,
}: {
  className: TClassName
  isOverflowing: boolean
  region: ScrollAreaRegion | undefined
}) {
  return {
    className,
    ...(region === 'always' || isOverflowing ? { role: 'region' as const } : {}),
    ...(isOverflowing ? { tabIndex: 0 as const, 'data-overflowing': '' as const } : {}),
  }
}

/**
 * Internal. A name on a `<div>` with no role is not allowed (ARIA), so a plain `<div>` carries none:
 * the consumer's `aria-label` or `aria-labelledby` is applied once it is a region.
 */
export function withoutNameUnlessRegion<TProps extends { role?: string | undefined }>(
  props: TProps,
): TProps {
  return props.role === undefined
    ? { ...props, 'aria-label': undefined, 'aria-labelledby': undefined }
    : props
}

/** Internal. `aria-label`, or an `aria-labelledby` with at least one id that is in the document. */
export function hasAccessibleName(element: HTMLElement): boolean {
  if (element.hasAttribute('aria-label')) {
    return true
  }
  const ids = (element.getAttribute('aria-labelledby') ?? '').split(/\s+/)
  return ids.some((id) => id !== '' && hasElementWithId(element, id))
}
