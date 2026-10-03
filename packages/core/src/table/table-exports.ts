/**
 * The only module that re-exports `@tanstack/table-core`, together with
 * `create-table.ts`: nothing else in the repository imports it. What is listed here is what
 * KvirnUI tests and supports: sorting, row selection, expanding, pagination, column and global
 * filtering and column visibility, their row models, the built-in sort and filter functions, and
 * the helpers and types you write columns with. What isn't listed isn't supported.
 */

// Registering features, and writing columns.
export { createColumnHelper, tableFeatures } from '@tanstack/table-core'

// Features and their row models.
export {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
} from '@tanstack/table-core'

// Built-in sort functions. Register the ones you use under `sortFns`.
export {
  sortFn_alphanumeric,
  sortFn_alphanumericCaseSensitive,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  sortFn_textCaseSensitive,
} from '@tanstack/table-core'

// Built-in filter functions. Register the ones you use under `filterFns`.
export {
  filterFn_arrHas,
  filterFn_arrIncludes,
  filterFn_arrIncludesAll,
  filterFn_arrIncludesSome,
  filterFn_between,
  filterFn_betweenInclusive,
  filterFn_empty,
  filterFn_endsWith,
  filterFn_equals,
  filterFn_equalsString,
  filterFn_equalsStringSensitive,
  filterFn_greaterThan,
  filterFn_greaterThanOrEqualTo,
  filterFn_inDateRange,
  filterFn_inNumberRange,
  filterFn_includesString,
  filterFn_includesStringSensitive,
  filterFn_lessThan,
  filterFn_lessThanOrEqualTo,
  filterFn_notEmpty,
  filterFn_startsWith,
  filterFn_weakEquals,
} from '@tanstack/table-core'

export type {
  AccessorFn,
  Cell,
  CellContext,
  CellData,
  Column,
  ColumnDef,
  ColumnFilter,
  ColumnFiltersState,
  ColumnHelper,
  ColumnSort,
  ColumnVisibilityState,
  Column_RowSorting,
  ExpandedState,
  FilterFn,
  Header,
  HeaderContext,
  HeaderGroup,
  OnChangeFn,
  PaginationState,
  Row,
  RowData,
  RowModel,
  RowSelectionState,
  Row_RowExpanding,
  Row_RowSelection,
  SortDirection,
  SortFn,
  SortingState,
  Table as TanStackTable,
  TableFeatures,
  TableOptions as TanStackTableOptions,
  TableState,
  Table_RowSelection,
  Updater,
} from '@tanstack/table-core'
