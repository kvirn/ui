export type ColumnsMinColumnWidth = 'sm' | 'md' | 'lg'
export type ColumnsGap = '4' | '6' | '8'

export interface UseColumnsOptions {
  /** The narrowest a column gets before the row wraps: `'sm'` 14rem, `'md'` 18rem (default), `'lg'` 24rem. */
  minColumnWidth?: ColumnsMinColumnWidth | undefined
  /** The space between columns and rows, a `space` step in the theme. Default `'6'`. */
  gap?: ColumnsGap | undefined
}

/** Spread on the columns' element. Only its classes: Columns adds no role, ARIA or state. */
export interface ColumnsPartProps {
  /**
   * `.kv-columns`, and a modifier for each choice other than the default. Add a class of your
   * own next to it with `mergeProps`: class names join.
   */
  className: string
}

export interface UseColumnsResult {
  columnsProps: ColumnsPartProps
}

const columnsProps = new Map<string, UseColumnsResult>()

/**
 * The columns' class for your own element (contract: columns.a11y.md). It adds no role, ARIA or
 * `tabindex`. DOM order is the visual order: there is no way to reorder.
 *
 * @example
 * const columns = useColumns({ minColumnWidth: 'lg' })
 * <ul {...columns.columnsProps}>…</ul>
 */
export function useColumns({
  minColumnWidth = 'md',
  gap = '6',
}: UseColumnsOptions = {}): UseColumnsResult {
  const key = `${minColumnWidth}-${gap}`
  let result = columnsProps.get(key)
  if (result === undefined) {
    const classNames = ['kv-columns']
    if (minColumnWidth !== 'md') {
      classNames.push(`kv-columns--min-${minColumnWidth}`)
    }
    if (gap !== '6') {
      classNames.push(`kv-columns--gap-${gap}`)
    }
    result = Object.freeze({
      columnsProps: Object.freeze({ className: classNames.join(' ') }),
    })
    columnsProps.set(key, result)
  }
  return result
}
