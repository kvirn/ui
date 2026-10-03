import type { RowData, TableFeatures } from '@kvirn-ui/core'
import { createContext, useContext } from 'react'
import type { UseTableResult } from './use-table.ts'

// Internal. How the Table parts find the `useTable()` result that `Table.Root` was given.

/**
 * The `useTable()` result of the Root, or `null` for a table with no `table` (plain native
 * elements). Held as an object, because the result is generic in the table's features and data,
 * and one context can't be both. `useTableContext` gives it its types back.
 */
export const TableContext = createContext<object | null>(null)

/** Which section a Row, a header cell or a Cell sits in. `null` outside one. */
export type TableSection = 'head' | 'body' | 'foot'
export const TableSectionContext = createContext<TableSection | null>(null)

function isTableResult<TFeatures extends TableFeatures, TData extends RowData>(
  value: object | null,
): value is UseTableResult<TFeatures, TData> {
  return value !== null && 'table' in value && 'tableProps' in value
}

/**
 * The Root's `useTable()` result, typed by the features and data you write at the part: a part
 * gets them from the row, cell or header it was given, which come from that same table.
 */
export function useTableContext<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(): UseTableResult<TFeatures, TData> | null {
  const value = useContext(TableContext)
  return isTableResult<TFeatures, TData>(value) ? value : null
}
