/** Spread on one part's element. Only the part's class: Grid adds no role, ARIA or state. */
export interface GridPartProps<
  ClassName extends string = 'kv-grid-container' | 'kv-grid' | 'kv-grid-item',
> {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-grid-container`, `.kv-grid`,
   * `.kv-grid-item`. Add a class of your own next to it with `mergeProps`: class names join.
   * `kv-grid--lg-cols-3` and `kv-grid-item--md-span-2` choose tracks and spans.
   */
  className: ClassName
}

export interface UseGridResult {
  /** The query container around the grid element. */
  containerProps: GridPartProps<'kv-grid-container'>
  rootProps: GridPartProps<'kv-grid'>
  itemProps: GridPartProps<'kv-grid-item'>
}

// The same object every time, frozen, so nothing a consumer does can change another grid.
const result: UseGridResult = Object.freeze({
  containerProps: Object.freeze({ className: 'kv-grid-container' }),
  rootProps: Object.freeze({ className: 'kv-grid' }),
  itemProps: Object.freeze({ className: 'kv-grid-item' }),
})

/**
 * A grid's part classes for your own elements (contract: grid.a11y.md). It adds no role, ARIA or
 * `tabindex`. DOM order is the visual order: there is no way to reorder. Put `containerProps` on
 * an element that wraps only the grid element, because the container answers the grid's width.
 *
 * @example
 * const grid = useGrid()
 * <div {...grid.containerProps}>
 *   <ul {...mergeProps({ className: 'kv-grid--fit-md' }, grid.rootProps)} role="list">…</ul>
 * </div>
 */
export function useGrid(): UseGridResult {
  return result
}
