import { createListVirtualizer, createTable } from '@kvirn-ui/core'
import type {
  Cell,
  Header,
  HeaderGroup,
  KvirnTableOptions,
  ListVirtualizer,
  Row,
  RowData,
  SortDirection,
  TableFeatures,
  TanStackTable,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type {
  ChangeEventHandler,
  CSSProperties,
  FocusEventHandler,
  MouseEventHandler,
  RefCallback,
} from 'react'
import { warnAnnouncerMissing, useQuietAnnouncer } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'
import { useStoreSelector } from '../store/use-store-selector.ts'
import {
  hasColumnSorting,
  hasRowExpanding,
  hasHeaderSize,
  hasRowSelection,
  hasTableRowSelection,
  toIdPart,
} from './table-features.ts'
import { hasElementWithId } from './has-element-with-id.ts'
import { useScrollOverflow } from './use-scroll-overflow.ts'

/** How tall a row is taken to be until it has been measured, in pixels. */
export const defaultTableRowEstimate = 40

/** A filter change is announced this long after the last change, so typing says it once. */
export const tableRowCountDelayMilliseconds = 500

/** `virtualize` in detail. Rows are measured, so `estimateSize` only has to be close. */
export interface TableVirtualizeOptions {
  /** The height of a row before it is measured, in pixels. Default 40. */
  estimateSize?: number | undefined
  /** Rows rendered beyond the visible ones, on each side. Default 5. */
  overscan?: number | undefined
}

/**
 * When the scroll region is a named `region` landmark: `'overflow'` (the default) only while the
 * table doesn't fit and scrolls, and `'always'` whether it scrolls or not. It is a Tab stop only
 * while it scrolls, in both.
 */
export type TableRegion = 'overflow' | 'always'

/** What KvirnUI adds to TanStack Table's options. */
export interface UseTableExtraOptions {
  /**
   * When `scrollRegionProps` make the scroll region a named `region`: `'overflow'` (default) only
   * while it scrolls, `'always'` for a landmark that screen reader users can list and jump to
   * whether it scrolls or not. `Table.ScrollRegion`'s own `region` prop wins.
   */
  region?: TableRegion | undefined
  /**
   * The id of the column whose cells are `<th scope="row">`: the one that names the row, such as
   * the name or the case number. It names the row's checkbox and expand button too.
   */
  rowHeader?: string | undefined
  /**
   * Render only the rows near the scroll position, with spacer rows for the rest. Off by default:
   * pagination or a filter is better, because unrendered rows can't be found with find-in-page,
   * aren't printed and are out of reach of a screen reader's browse mode. Rows keep
   * `aria-rowindex`, and the table `aria-rowcount`. Ignored, with a development warning, when
   * `rowExpandingFeature` is registered.
   */
  virtualize?: boolean | TableVirtualizeOptions | undefined
  /** Rows are loading: `aria-busy` and `data-busy` on the table, and "Loading rows." is announced. */
  isLoading?: boolean | undefined
  /** Per-instance message overrides. */
  messages?: Partial<KvirnMessages['table']> | undefined
}

/**
 * TanStack Table's options (`features`, `columns`, `data`, `getRowId`, `state`, `on…Change`,
 * `initialState`, …) and KvirnUI's. Multi-sort isn't an option.
 */
export type UseTableOptions<
  TFeatures extends TableFeatures,
  TData extends RowData,
> = KvirnTableOptions<TFeatures, TData> & UseTableExtraOptions

/** The direction of a sort as `aria-sort` and `data-sort` spell it. */
export type TableSortDirection = 'ascending' | 'descending'

/** Spread on `<table>`. */
export interface TableRootPartProps {
  className: 'kv-table'
  /** Virtualized only: the header rows and every row of the data, rendered or not. */
  'aria-rowcount'?: number
  'aria-busy'?: true
  'data-busy'?: ''
  'data-virtualized'?: ''
}

/** Spread on `<caption>`. The scroll region is named by its id. */
export interface TableCaptionPartProps {
  id: string
  className: 'kv-table-caption'
}

/**
 * Spread on the `<div>` around the table: a named region while it scrolls (or always, with
 * `region: 'always'`), a Tab stop only while it scrolls, and the virtualizer's scroll element.
 * Not scrolling, with the default `region`, it is a plain `<div>`: no role, no name, no tab stop.
 */
export interface TableScrollRegionPartProps {
  className: 'kv-scroll-region kv-table-scroll-region'
  /** Only while the region is one: it scrolls, or `region` is `'always'`. */
  role?: 'region'
  /** The caption's id, while the region is one and the table has a `Table.Caption`. Replace it when the table is named by something else. */
  'aria-labelledby'?: string
  /** The table is wider or taller than the region: it scrolls, and so it is a Tab stop. */
  tabIndex?: 0
  'data-overflowing'?: ''
  ref: RefCallback<HTMLElement>
}

/** Spread on `<thead>`. */
export interface TableHeadPartProps {
  className: 'kv-table-head'
  ref: RefCallback<HTMLTableSectionElement>
}

/** Spread on `<tfoot>`. */
export interface TableFootPartProps {
  className: 'kv-table-foot'
  ref: RefCallback<HTMLTableSectionElement>
}

/** Spread on `<tbody>`. */
export interface TableBodyPartProps {
  className: 'kv-table-body'
  /** Tracks the row that holds focus, so a virtualized table keeps it rendered. */
  onFocus: FocusEventHandler<HTMLTableSectionElement>
  onBlur: FocusEventHandler<HTMLTableSectionElement>
}

/** Spread on `<th>` in the header row. `aria-sort` is on the sorted column only. */
export interface TableColumnHeaderPartProps {
  className: 'kv-table-column-header'
  scope: 'col' | 'colgroup'
  colSpan?: number
  'aria-sort'?: TableSortDirection
  'data-sort'?: TableSortDirection
  /** Virtualized only: the column's width from TanStack's column sizes, which a fixed layout reads from the head. */
  style?: CSSProperties
}

/** Spread on the `<button>` inside a sortable column header. */
export interface TableSortButtonPartProps {
  type: 'button'
  className: 'kv-table-sort-button'
  'data-sort'?: TableSortDirection
  /** Sorts by the column, or changes its direction, and announces it. */
  onClick: MouseEventHandler<HTMLButtonElement>
}

/** Spread on `<tr>`. */
export interface TableRowPartProps {
  className: 'kv-table-row'
  'data-selected'?: ''
  'data-expanded'?: ''
  /** Virtualized only: the row's place in the whole row model, which `measureElement` reads. */
  'data-index'?: number
  /** Virtualized only: the row's number, counting the header rows. */
  'aria-rowindex'?: number
  /** Virtualized only: measures the row, so rows that wrap are the right height. */
  ref?: RefCallback<HTMLTableRowElement>
}

/** Spread on `<td>`. */
export interface TableDataCellPartProps {
  className: 'kv-table-cell'
  scope?: undefined
  id?: undefined
}

/** Spread on `<th scope="row">`: the cell of the `rowHeader` column. */
export interface TableRowHeaderCellPartProps {
  className: 'kv-table-row-header'
  scope: 'row'
  /** The row's checkbox and expand button are named by this cell. */
  id: string
}

/** What `getCellProps` returns: tell them apart by `scope`. */
export type TableCellPartProps = TableDataCellPartProps | TableRowHeaderCellPartProps

/**
 * Spread on a row's native `<input type="checkbox">`. Named "Select" then the row header cell
 * ("Select Anna Svensson"): `aria-labelledby` names the checkbox itself (its `aria-label`) and the
 * row header. With no `rowHeader` the name is "Select row 3".
 */
export interface TableSelectCheckboxPartProps {
  type: 'checkbox'
  className: 'kv-checkbox kv-table-select-checkbox'
  id: string
  checked: boolean
  disabled?: true
  'aria-label': string
  'aria-labelledby'?: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

/** Spread on the header's native `<input type="checkbox">`: indeterminate when some rows are selected. */
export interface TableSelectAllCheckboxPartProps {
  type: 'checkbox'
  className: 'kv-checkbox kv-table-select-checkbox'
  checked: boolean
  'aria-label': string
  onChange: ChangeEventHandler<HTMLInputElement>
  /** Sets the DOM property `indeterminate`, which has no attribute. */
  ref: RefCallback<HTMLInputElement>
}

/**
 * Spread on a row's `<button>`. Its visible text (`expandButtonText`, "Details") and the row
 * header name it ("Details Anna Svensson"): `aria-labelledby` points at the button itself, whose
 * text is its name, and at the row header cell. With no `rowHeader` the name is the `aria-label`
 * "Details row 3", which starts with the visible text.
 */
export interface TableExpandButtonPartProps {
  type: 'button'
  className: 'kv-table-expand-button'
  id: string
  'aria-expanded': boolean
  /** The detail row, while it is shown. */
  'aria-controls'?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  disabled?: true
  'data-expanded'?: ''
  onClick: MouseEventHandler<HTMLButtonElement>
}

/** Spread on the detail `<tr>`. */
export interface TableDetailRowPartProps {
  id: string
  className: 'kv-table-detail-row'
  'data-expanded': ''
}

/** Spread on the `<tbody>` that holds the empty row. */
export interface TableEmptyPartProps {
  className: 'kv-table-empty'
}

/** What `Table.Body` renders: a row, or the space of the rows that aren't rendered. */
export type TableBodyEntry<TFeatures extends TableFeatures, TData extends RowData> =
  | {
      readonly type: 'row'
      readonly key: string
      readonly row: Row<TFeatures, TData>
      /** The row's place in the whole row model. */
      readonly index: number
    }
  | { readonly type: 'spacer'; readonly key: string; readonly size: number }

export interface UseTableResult<TFeatures extends TableFeatures, TData extends RowData> {
  /** The TanStack Table instance: `table.getHeaderGroups()`, `table.getRowModel()`, `table.setPageIndex(…)`, … */
  table: TanStackTable<TFeatures, TData>
  tableProps: TableRootPartProps
  captionProps: TableCaptionPartProps
  /** The scroll region's props, for the `region` option (default `'overflow'`). */
  scrollRegionProps: TableScrollRegionPartProps
  /** The scroll region's props for a given `region`: what `Table.ScrollRegion` uses for its own `region` prop. */
  getScrollRegionProps: (region: TableRegion) => TableScrollRegionPartProps
  headProps: TableHeadPartProps
  bodyProps: TableBodyPartProps
  /** Spread on `<tfoot>`: virtualized, it counts the footer's rows in `aria-rowcount`. */
  footProps: TableFootPartProps
  /** Without a header: the cell of a column you add yourself, such as the select-all checkbox. */
  getColumnHeaderProps: (header?: Header<TFeatures, TData, unknown>) => TableColumnHeaderPartProps
  getSortButtonProps: (header: Header<TFeatures, TData, unknown>) => TableSortButtonPartProps
  getRowProps: (row: Row<TFeatures, TData>) => TableRowPartProps
  getCellProps: (cell: Cell<TFeatures, TData, unknown>) => TableCellPartProps
  getSelectCheckboxProps: (row: Row<TFeatures, TData>) => TableSelectCheckboxPartProps
  getSelectAllCheckboxProps: () => TableSelectAllCheckboxPartProps
  getExpandButtonProps: (row: Row<TFeatures, TData>) => TableExpandButtonPartProps
  getDetailRowProps: (row: Row<TFeatures, TData>) => TableDetailRowPartProps
  emptyProps: TableEmptyPartProps
  /**
   * What `Table.Body` renders: every row of the row model, or with `virtualize` the rows near the
   * scroll position and a spacer for the rest.
   */
  rows: readonly TableBodyEntry<TFeatures, TData>[]
  /** `virtualize` is on, and in effect. */
  isVirtualized: boolean
  isLoading: boolean
  /** The row model has no rows. */
  isEmpty: boolean
  /**
   * How many columns the table has as drawn, counting the cells you add yourself: what a spacer,
   * detail or empty row spans.
   */
  columnCount: number
  /**
   * Virtualized: how many rows come before the footer, the header rows and every row of the data.
   * A footer row's `aria-rowindex` is this plus its place in the footer, counting from 1.
   */
  footRowOffset: number
  /** The text of the empty row. */
  emptyText: string
  /** The text of the empty row while the table loads and has no rows yet. */
  loadingText: string
  /** The visible text of an expand button, and the hidden text of the expand column's header. */
  expandButtonText: string
}

const selectWholeState = <State>(state: State): State => state

const subscribeNever = () => () => {}

/** The columns of the last header row as drawn: its cells' `colSpan`, added up. */
function countDrawnColumns(head: HTMLTableSectionElement): number | undefined {
  const leafRow = head.rows[head.rows.length - 1]
  if (leafRow === undefined) {
    return undefined
  }
  let count = 0
  for (const cell of leafRow.cells) {
    count += cell.colSpan
  }
  return count
}

const toSortDirection = (sorted: false | SortDirection): TableSortDirection | undefined =>
  sorted === false ? undefined : sorted === 'desc' ? 'descending' : 'ascending'

/**
 * Creates the table for `Table.Root`, or for your own elements: TanStack Table with KvirnUI's
 * accessible defaults, and the props each native table element needs (contract: table.a11y.md). It re-renders when the table's state changes, so a sort or a
 * selection shows without any wiring. Sorting is one column at a time. Call it once per table.
 *
 * @example
 * const cases = useTable({ features, columns, data, getRowId: (row) => row.id, rowHeader: 'name' })
 * <table {...cases.tableProps}>
 *   <caption {...cases.captionProps}>Open cases</caption>
 *   …
 * </table>
 */
export function useTable<TFeatures extends TableFeatures, TData extends RowData>(
  options: UseTableOptions<TFeatures, TData>,
): UseTableResult<TFeatures, TData> {
  const { rowHeader, virtualize, isLoading = false } = options
  const baseId = useId()
  const messages = useMessages('table', options.messages)
  const { announce, isAvailable } = useQuietAnnouncer()
  const env = useEnv()

  // The instance is made once. Each render hands it the latest options before anything reads rows.
  const [instance] = useState(() => createTable<TFeatures, TData>(options))
  instance.updateOptions(options)
  const { table, store } = instance
  const state = useStoreSelector(store, selectWholeState)

  const rowModelRows = table.getRowModel().rows
  const isEmpty = rowModelRows.length === 0
  const rowPositionById = useMemo(() => {
    const positions = new Map<string, number>()
    for (const [index, row] of rowModelRows.entries()) {
      positions.set(row.id, index)
    }
    return positions
  }, [rowModelRows])

  // Virtualization -----------------------------------------------------------------------------
  const isVirtualizeRequested = virtualize !== undefined && virtualize !== false
  const hasExpanding = options.features.rowExpandingFeature !== undefined
  const isVirtualized = isVirtualizeRequested && !hasExpanding
  const virtualizeOptions = typeof virtualize === 'object' ? virtualize : undefined
  const estimateSize = virtualizeOptions?.estimateSize ?? defaultTableRowEstimate

  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null)
  const [headElement, setHeadElement] = useState<HTMLTableSectionElement | null>(null)
  const [footElement, setFootElement] = useState<HTMLTableSectionElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  // How far the first row is from the start of the scroll region: the caption and the head above it.
  const [firstRowOffset, setFirstRowOffset] = useState(0)
  // The header and footer rows as drawn, read from the DOM like the columns below: a header row
  // you add yourself counts, and so do the rows of `Table.Foot`. The snapshot is checked again
  // after every commit.
  const drawnHeaderRowCount = useSyncExternalStore(
    subscribeNever,
    () => headElement?.rows.length,
    () => undefined,
  )
  const headerRowCount = drawnHeaderRowCount ?? table.getHeaderGroups().length
  const footRowCount = useSyncExternalStore(
    subscribeNever,
    () => footElement?.rows.length ?? 0,
    () => 0,
  )
  const [, requestRender] = useReducer((count: number) => count + 1, 0)
  // The row that holds focus, tracked only while virtualized: it is a required index.
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null)

  // Made when `virtualize` turns on, and given the real options right below, in every render.
  const virtualizer = useMemo<ListVirtualizer | null>(
    () =>
      isVirtualized
        ? createListVirtualizer({
            count: 0,
            getScrollElement: () => null,
            estimateSize: () => defaultTableRowEstimate,
            getRequiredIndexes: () => [],
            onChange: requestRender,
          })
        : null,
    [isVirtualized],
  )
  // One stable ref for every row, so React doesn't detach and attach it on each render.
  const measureRow = useCallback(
    (element: HTMLTableRowElement | null) => virtualizer?.measureElement(element),
    [virtualizer],
  )
  // Stable between renders while their inputs are, so the virtualizer doesn't measure again for nothing.
  const estimateRowSize = useCallback(() => estimateSize, [estimateSize])
  const getRowKey = useCallback((index: number) => rowModelRows[index]?.id ?? index, [rowModelRows])
  // The row that holds focus stays rendered wherever it is scrolled to.
  const getRequiredRowIndexes = useCallback(() => {
    const position = focusedRowId === null ? undefined : rowPositionById.get(focusedRowId)
    return position === undefined ? [] : [position]
  }, [focusedRowId, rowPositionById])
  const getScrollElement = useCallback(() => scrollElement, [scrollElement])
  virtualizer?.setOptions({
    count: rowModelRows.length,
    getScrollElement,
    estimateSize: estimateRowSize,
    getItemKey: getRowKey,
    getRequiredIndexes: getRequiredRowIndexes,
    overscan: virtualizeOptions?.overscan,
    scrollPaddingStart: headerHeight,
    scrollMargin: firstRowOffset,
  })

  useEffect(
    () => (virtualizer === null ? undefined : virtualizer.mount()),
    [virtualizer, scrollElement],
  )

  // The sticky header covers the top of the scroll region: scrolling to a row, with a key or
  // with focus, leaves that much clear (2.4.11). The theme reads `--kv-table-head-block-size` for
  // `scroll-padding-block-start`. A virtualized table also measures how far its first row is from
  // the start of the region (the caption and the head scroll with the rows), which is what its
  // window needs to be right at every scroll position. The body's own place is read, not the
  // head's, because a sticky head moves as the region scrolls.
  useEffect(() => {
    if (env === undefined || headElement === null) {
      return undefined
    }
    const tableElement = headElement.closest('table')
    const measure = () => {
      setHeaderHeight(Math.ceil(headElement.getBoundingClientRect().height))
      const body = tableElement?.tBodies[0]
      if (isVirtualized && scrollElement !== null && body !== undefined) {
        setFirstRowOffset(
          Math.round(
            body.getBoundingClientRect().top -
              scrollElement.getBoundingClientRect().top -
              scrollElement.clientTop +
              scrollElement.scrollTop,
          ),
        )
      }
    }
    measure()
    const observer = new env.window.ResizeObserver(measure)
    observer.observe(headElement)
    if (isVirtualized && tableElement !== null) {
      observer.observe(tableElement)
      if (tableElement.caption !== null) {
        observer.observe(tableElement.caption)
      }
    }
    return () => observer.disconnect()
  }, [env, headElement, isVirtualized, scrollElement])

  useEffect(() => {
    if (scrollElement === null) {
      return undefined
    }
    scrollElement.style.setProperty('--kv-table-head-block-size', `${headerHeight}px`)
    return () => {
      scrollElement.style.removeProperty('--kv-table-head-block-size')
    }
  }, [scrollElement, headerHeight])

  const isOverflowing = useScrollOverflow(scrollElement, env)

  // Spacer, detail and empty rows span what is drawn, which includes cells that aren't columns.
  // The header row is read from the DOM like an external store: the snapshot is checked again
  // after every commit, so a column added later is counted in the next render.
  const measuredColumnCount = useSyncExternalStore(
    subscribeNever,
    () => (headElement === null ? undefined : countDrawnColumns(headElement)),
    () => undefined,
  )
  const columnCount = measuredColumnCount ?? Math.max(table.getAllLeafColumns().length, 1)

  // Announcements ------------------------------------------------------------------------------
  const say = (message: string) => {
    if (isAvailable) {
      announce(message)
    } else {
      warnAnnouncerMissing()
    }
  }
  // The newest values, for what runs later than a render: timers and effects.
  const latest = useRef({ say, messages, table })
  useLayoutEffect(() => {
    latest.current = { say, messages, table }
  })

  useEffect(() => {
    if (isLoading) {
      latest.current.say(latest.current.messages.loading)
    }
  }, [isLoading])

  // A filter changed: say how many rows are left, once the typing has stopped.
  const columnFilters = 'columnFilters' in state ? state.columnFilters : undefined
  const globalFilter = 'globalFilter' in state ? state.globalFilter : undefined
  const previousFilters = useRef({ columnFilters, globalFilter })
  useEffect(() => {
    const previous = previousFilters.current
    if (previous.columnFilters === columnFilters && previous.globalFilter === globalFilter) {
      return undefined
    }
    previousFilters.current = { columnFilters, globalFilter }
    const timer = setTimeout(() => {
      const current = latest.current
      current.say(
        current.messages.rowCount({ count: current.table.getPrePaginatedRowModel().rows.length }),
      )
    }, tableRowCountDelayMilliseconds)
    return () => clearTimeout(timer)
  }, [columnFilters, globalFilter])

  // Select-all changed the selection: say how many rows are selected, once the state has it.
  const rowSelection = 'rowSelection' in state ? state.rowSelection : undefined
  const isSelectAllPending = useRef(false)
  useEffect(() => {
    if (!isSelectAllPending.current) {
      return
    }
    isSelectAllPending.current = false
    const { say: sayNow, messages: currentMessages, table: currentTable } = latest.current
    if (hasTableRowSelection(currentTable)) {
      sayNow(currentMessages.selectedCount({ count: currentTable.getSelectedRowIds().length }))
    }
  }, [rowSelection])

  useEffect(() => {
    if (isVirtualizeRequested && hasExpanding) {
      warnOnce(
        'table-virtualize-with-expanding',
        'A table has `virtualize` and `rowExpandingFeature`. Virtualization needs rows of one measured height and spacer rows between them, which an expanded detail row breaks, so every row is rendered. Paginate instead, or turn one of them off.',
      )
    }
  }, [isVirtualizeRequested, hasExpanding])

  // Ids ----------------------------------------------------------------------------------------
  const captionId = `${baseId}-caption`
  // Whether a caption is in the document, read like the header row above: the region points at it
  // only while it exists, so a table without one doesn't reference a missing id.
  const hasCaption = useSyncExternalStore(
    subscribeNever,
    () => (scrollElement === null ? undefined : hasElementWithId(scrollElement, captionId)),
    () => undefined,
  )
  const rowPart = (row: Row<TFeatures, TData>) => toIdPart(row.id)
  const rowHeaderCellId = (row: Row<TFeatures, TData>) => `${baseId}-row-${rowPart(row)}-header`
  const selectCheckboxId = (row: Row<TFeatures, TData>) => `${baseId}-row-${rowPart(row)}-select`
  const expandButtonId = (row: Row<TFeatures, TData>) => `${baseId}-row-${rowPart(row)}-expand`
  const detailRowId = (row: Row<TFeatures, TData>) => `${baseId}-row-${rowPart(row)}-detail`
  /** Names a control by itself (its `aria-label`) and then by the row header cell. */
  const labelledByRowHeader = (row: Row<TFeatures, TData>, controlId: string) =>
    rowHeader === undefined ? {} : { 'aria-labelledby': `${controlId} ${rowHeaderCellId(row)}` }

  // Rows ---------------------------------------------------------------------------------------
  const nonVirtualEntries = useMemo(
    () =>
      rowModelRows.map((row, index): TableBodyEntry<TFeatures, TData> => ({
        type: 'row',
        key: row.id,
        row,
        index,
      })),
    [rowModelRows],
  )
  let rows: readonly TableBodyEntry<TFeatures, TData>[] = nonVirtualEntries
  if (virtualizer !== null) {
    const segments = virtualizer.getSegments()
    rows = segments.flatMap((segment, position): TableBodyEntry<TFeatures, TData>[] => {
      if (segment.type === 'gap') {
        const next = segments[position + 1]
        const key = next?.type === 'item' ? `spacer-before-${next.item.index}` : 'spacer-end'
        return [{ type: 'spacer', key, size: segment.size }]
      }
      const row = rowModelRows[segment.item.index]
      return row === undefined ? [] : [{ type: 'row', key: row.id, row, index: segment.item.index }]
    })
  }

  // Prop getters -------------------------------------------------------------------------------
  const tableProps: TableRootPartProps = {
    className: 'kv-table',
    ...(isVirtualized
      ? { 'aria-rowcount': headerRowCount + rowModelRows.length + footRowCount }
      : {}),
    ...(isLoading ? { 'aria-busy': true as const, 'data-busy': '' } : {}),
    ...(isVirtualized ? { 'data-virtualized': '' } : {}),
  }

  // A region while it scrolls, or always. Before the scroll region is measured (the server render
  // and the first client render) nothing overflows, so the default markup is a plain `<div>`.
  const getScrollRegionProps = (mode: TableRegion): TableScrollRegionPartProps => ({
    className: 'kv-scroll-region kv-table-scroll-region',
    ...(mode === 'always' || isOverflowing
      ? {
          role: 'region' as const,
          ...(hasCaption === false ? {} : { 'aria-labelledby': captionId }),
        }
      : {}),
    ...(isOverflowing ? { tabIndex: 0 as const, 'data-overflowing': '' } : {}),
    ref: setScrollElement,
  })
  const scrollRegionProps = getScrollRegionProps(options.region ?? 'overflow')

  const bodyProps: TableBodyPartProps = {
    className: 'kv-table-body',
    onFocus: (event) => {
      if (!isVirtualized) {
        return
      }
      const target = event.target
      const rowElement = target instanceof Element ? target.closest('tr[data-index]') : null
      const position = Number(rowElement?.getAttribute('data-index'))
      setFocusedRowId(rowModelRows[position]?.id ?? null)
    },
    onBlur: (event) => {
      if (!isVirtualized) {
        return
      }
      const next = event.relatedTarget
      if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
        setFocusedRowId(null)
      }
    },
  }

  const getColumnHeaderProps = (header?: Header<TFeatures, TData, unknown>) => {
    if (header === undefined) {
      return { className: 'kv-table-column-header', scope: 'col' } as const
    }
    const sort = hasColumnSorting(header.column)
      ? toSortDirection(header.column.getIsSorted())
      : undefined
    const spansColumns = header.colSpan > 1
    return {
      className: 'kv-table-column-header',
      scope: spansColumns ? 'colgroup' : 'col',
      ...(spansColumns ? { colSpan: header.colSpan } : {}),
      ...(sort === undefined ? {} : { 'aria-sort': sort, 'data-sort': sort }),
      // A fixed layout takes the widths of the columns from the head.
      ...(isVirtualized && hasHeaderSize(header)
        ? { style: { inlineSize: header.getSize() } }
        : {}),
    } satisfies TableColumnHeaderPartProps
  }

  const getSortButtonProps = (header: Header<TFeatures, TData, unknown>) => {
    const column = header.column
    const sort = hasColumnSorting(column) ? toSortDirection(column.getIsSorted()) : undefined
    return {
      type: 'button',
      className: 'kv-table-sort-button',
      ...(sort === undefined ? {} : { 'data-sort': sort }),
      onClick: (event) => {
        if (!hasColumnSorting(column) || !column.getCanSort()) {
          return
        }
        // One column at a time: no multi-sort, so a Shift+click is a plain click.
        const next = column.getNextSortingOrder(false)
        column.toggleSorting(undefined, false)
        const label =
          typeof column.columnDef.header === 'string'
            ? column.columnDef.header
            : (event.currentTarget.textContent?.trim() ?? column.id)
        say(
          next === 'asc'
            ? messages.sortedAscending({ column: label })
            : next === 'desc'
              ? messages.sortedDescending({ column: label })
              : messages.sortCleared({ column: label }),
        )
      },
    } satisfies TableSortButtonPartProps
  }

  const getRowProps = (row: Row<TFeatures, TData>) => {
    const position = rowPositionById.get(row.id)
    return {
      className: 'kv-table-row',
      ...(hasRowSelection(row) && row.getIsSelected() ? { 'data-selected': '' } : {}),
      ...(hasRowExpanding(row) && row.getIsExpanded() ? { 'data-expanded': '' } : {}),
      ...(virtualizer !== null && position !== undefined
        ? {
            'data-index': position,
            'aria-rowindex': headerRowCount + position + 1,
            ref: measureRow,
          }
        : {}),
    } satisfies TableRowPartProps
  }

  const getCellProps = (cell: Cell<TFeatures, TData, unknown>): TableCellPartProps =>
    rowHeader !== undefined && cell.column.id === rowHeader
      ? {
          className: 'kv-table-row-header',
          scope: 'row',
          id: rowHeaderCellId(cell.row),
        }
      : { className: 'kv-table-cell' }

  const getSelectCheckboxProps = (row: Row<TFeatures, TData>) => {
    const id = selectCheckboxId(row)
    const isSelectable = hasRowSelection(row)
    if (!isSelectable) {
      warnOnce(
        'table-select-without-feature',
        'A Table.SelectCheckbox needs `rowSelectionFeature` in the table features. Without it the checkbox does nothing and is disabled.',
      )
    }
    return {
      type: 'checkbox',
      className: 'kv-checkbox kv-table-select-checkbox',
      id,
      checked: isSelectable && row.getIsSelected(),
      ...(!isSelectable || !row.getCanSelect() ? { disabled: true as const } : {}),
      // With a row header: "Select" (this `aria-label`) then the header. Without: "Select row 3".
      'aria-label':
        rowHeader === undefined
          ? messages.selectRowNumber({ index: (rowPositionById.get(row.id) ?? row.index) + 1 })
          : messages.selectRow,
      ...labelledByRowHeader(row, id),
      onChange: (event) => {
        isSelectAllPending.current = false
        if (isSelectable) {
          row.toggleSelected(event.target.checked)
        }
      },
    } satisfies TableSelectCheckboxPartProps
  }

  const getSelectAllCheckboxProps = () => {
    const canSelect = hasTableRowSelection(table)
    const isAllSelected = canSelect && table.getIsAllRowsSelected()
    const isSomeSelected = canSelect && !isAllSelected && table.getIsSomeRowsSelected()
    return {
      type: 'checkbox',
      className: 'kv-checkbox kv-table-select-checkbox',
      checked: isAllSelected,
      'aria-label': messages.selectAllRows,
      onChange: (event) => {
        if (canSelect) {
          isSelectAllPending.current = true
          table.toggleAllRowsSelected(event.target.checked)
        }
      },
      ref: (element) => {
        if (element !== null) {
          element.indeterminate = isSomeSelected
        }
      },
    } satisfies TableSelectAllCheckboxPartProps
  }

  const getExpandButtonProps = (row: Row<TFeatures, TData>) => {
    const id = expandButtonId(row)
    const isExpandable = hasRowExpanding(row)
    const isExpanded = isExpandable && row.getIsExpanded()
    return {
      type: 'button',
      className: 'kv-table-expand-button',
      id,
      'aria-expanded': isExpanded,
      ...(isExpanded ? { 'aria-controls': detailRowId(row), 'data-expanded': '' } : {}),
      // With a row header: the button's own text, then the header. Without: "Details row 3".
      ...(rowHeader === undefined
        ? {
            'aria-label': messages.rowDetailsNumber({
              index: (rowPositionById.get(row.id) ?? row.index) + 1,
            }),
          }
        : labelledByRowHeader(row, id)),
      ...(!isExpandable || !row.getCanExpand() ? { disabled: true as const } : {}),
      onClick: () => {
        if (isExpandable) {
          row.toggleExpanded()
        }
      },
    } satisfies TableExpandButtonPartProps
  }

  const getDetailRowProps = (row: Row<TFeatures, TData>): TableDetailRowPartProps => ({
    id: detailRowId(row),
    className: 'kv-table-detail-row',
    'data-expanded': '',
  })

  return {
    table,
    tableProps,
    captionProps: { id: captionId, className: 'kv-table-caption' },
    scrollRegionProps,
    getScrollRegionProps,
    headProps: { className: 'kv-table-head', ref: setHeadElement },
    bodyProps,
    footProps: { className: 'kv-table-foot', ref: setFootElement },
    getColumnHeaderProps,
    getSortButtonProps,
    getRowProps,
    getCellProps,
    getSelectCheckboxProps,
    getSelectAllCheckboxProps,
    getExpandButtonProps,
    getDetailRowProps,
    emptyProps: { className: 'kv-table-empty' },
    rows,
    isVirtualized,
    isLoading,
    isEmpty,
    columnCount,
    footRowOffset: headerRowCount + rowModelRows.length,
    emptyText: messages.empty,
    loadingText: messages.loading,
    expandButtonText: messages.rowDetails,
  }
}

/** The header rows' place in `aria-rowindex` when a table is virtualized: row 1 is the first header row. */
export function getHeaderRowIndex<TFeatures extends TableFeatures, TData extends RowData>(
  headerGroup: HeaderGroup<TFeatures, TData> | undefined,
): number {
  return (headerGroup?.depth ?? 0) + 1
}
