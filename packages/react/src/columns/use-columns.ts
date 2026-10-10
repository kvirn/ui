/** Spread on the columns' element. Only its class: Columns adds no role, ARIA or state. */
export interface ColumnsPartProps {
  /**
   * `.kv-columns`. Add a width or gap class (`kv-columns--min-lg`, `kv-columns--gap-8`) or one of
   * your own with `mergeProps`: class names join.
   */
  className: 'kv-columns'
}

export interface UseColumnsResult {
  columnsProps: ColumnsPartProps
}

// The same object every time, frozen, so nothing a consumer does can change another grid.
const result: UseColumnsResult = Object.freeze({
  columnsProps: Object.freeze({ className: 'kv-columns' }),
})

/**
 * The columns' class for your own element (contract: columns.a11y.md). It adds no role, ARIA or
 * `tabindex`. DOM order is the visual order: there is no way to reorder.
 *
 * @example
 * const columns = useColumns()
 * <ul {...mergeProps({ className: 'kv-columns--min-lg' }, columns.columnsProps)}>…</ul>
 */
export function useColumns(): UseColumnsResult {
  return result
}
