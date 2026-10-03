import type {
  Column_RowSorting,
  RowData,
  Row_RowExpanding,
  Row_RowSelection,
  TableFeatures,
  Table_RowSelection,
} from '@kvirn-ui/core'

// Internal. TanStack Table adds an API to a column, row or table only when its feature is
// registered, and types it the same way. The table parts work with any set of features, so they
// ask at run time whether the API is there. These guards narrow the type by that same check, so
// no cast is needed.

/** The column has the sorting API: `rowSortingFeature` is registered. */
export function hasColumnSorting<TColumn extends object>(
  column: TColumn,
): column is TColumn & Column_RowSorting<TableFeatures, RowData> {
  return (
    'getCanSort' in column &&
    typeof column.getCanSort === 'function' &&
    'getIsSorted' in column &&
    typeof column.getIsSorted === 'function'
  )
}

/** The row has the selection API: `rowSelectionFeature` is registered. */
export function hasRowSelection<TRow extends object>(row: TRow): row is TRow & Row_RowSelection {
  return 'getIsSelected' in row && typeof row.getIsSelected === 'function'
}

/** The row has the expanding API: `rowExpandingFeature` is registered. */
export function hasRowExpanding<TRow extends object>(row: TRow): row is TRow & Row_RowExpanding {
  return 'getIsExpanded' in row && typeof row.getIsExpanded === 'function'
}

/** The table has the selection API: `rowSelectionFeature` is registered. */
export function hasTableRowSelection<TTable extends object>(
  table: TTable,
): table is TTable & Table_RowSelection<TableFeatures, RowData> {
  return 'toggleAllRowsSelected' in table && typeof table.toggleAllRowsSelected === 'function'
}

/** The header has a column width: `columnSizingFeature` is registered. */
export function hasHeaderSize<THeader extends object>(
  header: THeader,
): header is THeader & { getSize: () => number } {
  return 'getSize' in header && typeof header.getSize === 'function'
}

/**
 * Makes a row id safe inside an element id. A row id can hold spaces or any other character, and
 * an id with a space breaks `aria-labelledby`, which is a space separated list. `_` is the escape,
 * so two row ids never give the same part.
 */
export function toIdPart(value: string): string {
  return value.replace(/[^A-Za-z0-9-]/g, (character) => `_${character.codePointAt(0)?.toString(16)}`)
}
