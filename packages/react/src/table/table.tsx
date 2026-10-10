'use client'
import { renderTemplate } from '@kvirn-ui/core'
import type {
  Cell,
  CellContext,
  Env,
  Header,
  HeaderContext,
  HeaderGroup,
  Row,
  RowData,
  TableFeatures,
} from '@kvirn-ui/core'
import {
  createElement,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useEnv } from '../provider/use-env.ts'
import {
  getScrollAreaProps,
  hasAccessibleName,
  withoutNameUnlessRegion,
} from '../scroll-area/scroll-area-props.ts'
import { useScrollOverflow } from '../scroll-area/use-scroll-overflow.ts'
import { TableContext, TableSectionContext, useTableContext } from './table-context.ts'
import type { TableSection } from './table-context.ts'
import { hasRowExpanding } from './table-features.ts'
import { getHeaderRowIndex } from './use-table.ts'
import type {
  TableCellPartProps,
  TableExpandButtonPartProps,
  TableRegion,
  TableRowPartProps,
  TableSortDirection,
  UseTableResult,
} from './use-table.ts'

export interface TableRootProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends ComponentPropsWithRef<'table'> {
  /**
   * The result of `useTable()`. Without it every part is the plain native element with its class,
   * so a small static table needs no TanStack Table at all.
   */
  table?: UseTableResult<TFeatures, TData> | undefined
}

export interface TableScrollRegionProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends ComponentPropsWithRef<'div'> {
  /** The same `useTable()` result as the Root, so the region is named by its caption and is the virtualizer's scroll element. */
  table?: UseTableResult<TFeatures, TData> | undefined
  /**
   * When the region is a named `region` landmark. `'overflow'` (default): only while the table
   * doesn't fit and scrolls, otherwise a plain `<div>`. `'always'`: whether it scrolls or not.
   * It is a Tab stop only while it scrolls, in both. With `table`, this wins over `useTable`'s `region`.
   */
  region?: TableRegion | undefined
}

export type TableCaptionProps = ComponentPropsWithRef<'caption'>

export type TableHeadProps = ComponentPropsWithRef<'thead'>

export interface TableBodyProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends Omit<ComponentPropsWithRef<'tbody'>, 'children'> {
  /**
   * A function that renders one Row per row of the row model, called with the row and its place
   * in it (rows outside the window are left out with `virtualize`, and spacer rows are added), or
   * your own rows. The function needs `table` on the Root.
   */
  children?: ReactNode | ((row: Row<TFeatures, TData>, index: number) => ReactNode)
}

export type TableFootProps = ComponentPropsWithRef<'tfoot'>

export interface TableRowProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends ComponentPropsWithRef<'tr'> {
  /** The row of the row model: sets `data-selected`, `data-expanded` and, virtualized, `aria-rowindex`. */
  row?: Row<TFeatures, TData> | undefined
  /** In the head: the header group the row shows, for `aria-rowindex` when the table is virtualized. */
  headerGroup?: HeaderGroup<TFeatures, TData> | undefined
}

export interface TableColumnHeaderProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends ComponentPropsWithRef<'th'> {
  /**
   * The header from `table.getHeaderGroups()`: sets `colSpan` and `aria-sort`, and without
   * children renders the column's `header` template. Leave it out for a column you add yourself.
   */
  header?: Header<TFeatures, TData, unknown> | undefined
}

export type TableRowHeaderProps = ComponentPropsWithRef<'th'>

export interface TableCellProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends ComponentPropsWithRef<'td'> {
  /**
   * The cell from `row.getAllCells()`. It is a `<th scope="row">` for the `rowHeader` column and
   * a `<td>` otherwise, and without children renders the column's `cell` template.
   */
  cell?: Cell<TFeatures, TData, unknown> | undefined
}

export interface TableSortButtonProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  /** The header whose column it sorts: from `table.getHeaderGroups()`. */
  header?: Header<TFeatures, TData, unknown> | undefined
}

export interface TableSelectCheckboxProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'children'> {
  /** The row it selects. Its name is "Select" and the row's header cell, or "Select row 3". */
  row?: Row<TFeatures, TData> | undefined
}

export type TableSelectAllCheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'children'>

export interface TableExpandButtonProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  /** The row it shows and hides the details of. */
  row?: Row<TFeatures, TData> | undefined
}

export interface TableDetailRowProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends ComponentPropsWithRef<'tr'> {
  /** The row it belongs to. It is rendered only while the row is expanded. */
  row?: Row<TFeatures, TData> | undefined
  /** Without a `table`: how many columns the detail cell spans. */
  colSpan?: number | undefined
}

export interface TableEmptyProps extends ComponentPropsWithRef<'tbody'> {
  /** What the cell says. Default: the `empty` message. Say something useful: what to do next. */
  children?: ReactNode
  /** Without a `table`: how many columns the cell spans. */
  colSpan?: number | undefined
}

const subscribeNever = () => () => {}

/** Nothing to put inside: `undefined`, `null`, `false` or an empty string, as a ternary leaves it. */
const isEmptyContent = (children: ReactNode): boolean =>
  children === undefined || children === null || children === false || children === ''

/**
 * A data table (contract: table.a11y.md). It renders a native `<table>`, so
 * screen readers read its headers, rows and columns, and nothing here changes a table element's
 * `display`. Give it a name with `Table.Caption`, or `aria-labelledby` on the Root. With the result
 * of `useTable()` it sorts, selects, expands and can virtualize; without it, every part is a plain
 * native element, so a small static table needs no TanStack Table.
 *
 * @example
 * <Table.ScrollRegion table={cases}>
 *   <Table.Root table={cases}>
 *     <Table.Caption>Öppna ärenden</Table.Caption>
 *     <Table.Head>
 *       {cases.table.getHeaderGroups().map((headerGroup) => (
 *         <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
 *           {headerGroup.headers.map((header) => (
 *             <Table.ColumnHeader key={header.id} header={header}>
 *               {header.column.getCanSort() ? <Table.SortButton header={header} /> : null}
 *             </Table.ColumnHeader>
 *           ))}
 *         </Table.Row>
 *       ))}
 *     </Table.Head>
 *     <Table.Body>
 *       {(row) => (
 *         <Table.Row key={row.id} row={row}>
 *           {row.getAllCells().map((cell) => <Table.Cell key={cell.id} cell={cell} />)}
 *         </Table.Row>
 *       )}
 *     </Table.Body>
 *     <Table.Empty />
 *   </Table.Root>
 * </Table.ScrollRegion>
 */
export function TableRoot<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  ...otherProps
}: TableRootProps<TFeatures, TData>): ReactElement {
  // A table without a name isn't announced as anything in a list of tables (1.3.1, 4.1.2). Checked
  // when the table is attached, which is after its caption is in it.
  const checkName = useCallback((element: HTMLTableElement | null) => {
    if (
      element !== null &&
      element.caption === null &&
      !element.hasAttribute('aria-label') &&
      !element.hasAttribute('aria-labelledby')
    ) {
      warnOnce(
        'table-without-name',
        'A Table has no name. Add a <Table.Caption>, or `aria-labelledby` on <Table.Root> pointing at a visible heading, so screen reader users can tell tables apart (WCAG 1.3.1, 4.1.2).',
      )
    }
  }, [])

  return (
    <TableContext.Provider value={table ?? null}>
      {createElement(
        'table',
        mergeProps(otherProps, table?.tableProps ?? { className: 'kv-table' }, {
          ref: checkName,
        }),
      )}
    </TableContext.Provider>
  )
}
TableRoot.displayName = 'Table.Root'

/**
 * Internal. A region without `useTable` measures its own `<thead>`, which the theme makes sticky, and
 * sets `--kv-table-head-block-size` on the region. The theme reads it for `scroll-padding-block-start`,
 * so scrolling to a focused control leaves it clear of the head (2.4.11). `useTable` does the same
 * for a region that has `table`. A head that mounts after the region (a table that appears when its
 * data arrives) is found as it is added, and measured from then on.
 */
function useStickyHeadSize(element: HTMLElement | null, env: Env | undefined): void {
  useEffect(() => {
    if (element === null || env === undefined) {
      return undefined
    }
    let head: HTMLTableSectionElement | null = null
    const measure = () => {
      if (head !== null) {
        element.style.setProperty(
          '--kv-table-head-block-size',
          `${Math.ceil(head.getBoundingClientRect().height)}px`,
        )
      }
    }
    const resizeObserver = new env.window.ResizeObserver(measure)
    // Looks for the head again, and watches the one it finds instead of the one it had.
    const findHead = () => {
      const found = element.querySelector('thead')
      if (found === head) {
        return
      }
      if (head !== null) {
        resizeObserver.unobserve(head)
      }
      head = found
      if (head === null) {
        element.style.removeProperty('--kv-table-head-block-size')
      } else {
        resizeObserver.observe(head)
        measure()
      }
    }
    findHead()
    const mutationObserver = new env.window.MutationObserver(findHead)
    mutationObserver.observe(element, { childList: true, subtree: true })
    return () => {
      mutationObserver.disconnect()
      resizeObserver.disconnect()
      element.style.removeProperty('--kv-table-head-block-size')
    }
  }, [element, env])
}

/**
 * The `<div>` around a wide table. While the table scrolls it is a named `region` and a Tab stop, so a
 * keyboard user can scroll sideways (1.4.10, 2.1.1); when everything fits it is a plain `<div>`.
 * `region="always"` makes it a named region whether it scrolls or not (it is a Tab stop only while
 * it scrolls). It is also the scroll element of a virtualized table. Named by the caption, through
 * the `table` prop. Without `table`, name it yourself with `aria-labelledby` or `aria-label`. Your
 * own `aria-labelledby` and `tabIndex` win.
 */
export function TableScrollRegion<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  region,
  ref: consumerRef,
  ...otherProps
}: TableScrollRegionProps<TFeatures, TData>): ReactElement {
  const env = useEnv()
  const [element, setElement] = useState<HTMLElement | null>(null)
  const ownOverflow = useScrollOverflow(table === undefined ? element : null, env)
  useStickyHeadSize(table === undefined ? element : null, env)
  const { ref: hookRef, ...hookProps } = (region === undefined
    ? table?.scrollRegionProps
    : table?.getScrollRegionProps(region)) ?? {
    ...getScrollAreaProps({
      className: 'kv-scroll-region kv-table-scroll-region',
      isOverflowing: ownOverflow,
      region,
    }),
    ref: undefined,
  }
  // One ref for the hook's, this component's and the consumer's, stable so it isn't re-attached each render.
  const ownRef = useMergedRef(hookRef, setElement)
  const regionRef = useMergedRef(consumerRef, ownRef)
  // The consumer's own props come last, so a name of their own replaces the caption's.
  const mergedProps = mergeProps(hookProps, otherProps, { ref: regionRef })
  const isRegion = mergedProps.role === 'region'
  const partProps = withoutNameUnlessRegion(mergedProps)

  // A region is named by `aria-label`, or by an element its `aria-labelledby` points at: the
  // caption, through `table`, or the consumer's own. Checked after commit, when the caption is in,
  // and again when the region becomes one (it starts to scroll).
  useEffect(() => {
    if (isRegion && element !== null && !hasAccessibleName(element)) {
      warnOnce(
        'table-scroll-region-without-name',
        'A Table.ScrollRegion is a region (it scrolls, or has `region="always"`) and has no name. Add a <Table.Caption> and pass `table`, or `aria-labelledby` or `aria-label`. A region without a name is read as an unlabelled landmark (WCAG 4.1.2).',
      )
    }
  }, [element, isRegion])

  return createElement('div', partProps)
}
TableScrollRegion.displayName = 'Table.ScrollRegion'

/** The table's name, and the name of the scroll region. A `<caption>` is the first child of the table. */
export function TableCaption({ ...otherProps }: TableCaptionProps): ReactElement {
  const table = useTableContext()
  return createElement(
    'caption',
    mergeProps(otherProps, table?.captionProps ?? { className: 'kv-table-caption' }),
  )
}
TableCaption.displayName = 'Table.Caption'

function TableSectionProvider({
  section,
  children,
}: {
  section: TableSection
  children: ReactNode
}): ReactElement {
  return <TableSectionContext.Provider value={section}>{children}</TableSectionContext.Provider>
}

/** The header rows, a `<thead>`. A virtualized table keeps it in the DOM and measures it, so the theme can make it sticky. */
export function TableHead({ children, ...otherProps }: TableHeadProps): ReactElement {
  const table = useTableContext()
  return (
    <TableSectionProvider section="head">
      {createElement(
        'thead',
        mergeProps(otherProps, table?.headProps ?? { className: 'kv-table-head' }, {
          children,
        }),
      )}
    </TableSectionProvider>
  )
}
TableHead.displayName = 'Table.Head'

/**
 * The body rows, a `<tbody>`. Give it a function and it renders one row per row of the row model
 * (only the rows near the scroll position with `virtualize`, between spacer rows), or give it
 * your own rows. Rows are `aria-hidden` spacers only where rows aren't rendered.
 */
export function TableBody<TFeatures extends TableFeatures, TData extends RowData>({
  children,
  ...otherProps
}: TableBodyProps<TFeatures, TData>): ReactElement {
  const table = useTableContext<TFeatures, TData>()
  const renderRows = typeof children === 'function' ? children : undefined
  useEffect(() => {
    if (renderRows !== undefined && table === null) {
      warnOnce(
        'table-body-function-without-table',
        'A Table.Body has a function as its children but its Table.Root has no `table`, so there are no rows to call it with. Pass `table={useTable(…)}` to the Root, or give the Body your own rows.',
      )
    }
  }, [renderRows, table])

  let content: ReactNode = typeof children === 'function' ? null : children
  if (renderRows !== undefined && table !== null) {
    content = table.rows.map((entry) =>
      entry.type === 'row' ? (
        <Fragment key={entry.key}>{renderRows(entry.row, entry.index)}</Fragment>
      ) : (
        <TableSpacer key={entry.key} size={entry.size} columnCount={table.columnCount} />
      ),
    )
  }
  return (
    <TableSectionProvider section="body">
      {createElement(
        'tbody',
        mergeProps(otherProps, table?.bodyProps ?? { className: 'kv-table-body' }, {
          children: content,
        }),
      )}
    </TableSectionProvider>
  )
}
TableBody.displayName = 'Table.Body'

/** Internal. The space of the rows that aren't rendered: a row that is hidden from assistive technology. */
function TableSpacer({ size, columnCount }: { size: number; columnCount: number }): ReactElement {
  return (
    // Its block size is the one thing virtualization can't work without.
    <tr aria-hidden="true" className="kv-table-spacer" style={{ blockSize: size }}>
      <td aria-hidden="true" colSpan={columnCount} />
    </tr>
  )
}

/** The footer rows, a `<tfoot>`. */
export function TableFoot({ children, ...otherProps }: TableFootProps): ReactElement {
  const table = useTableContext()
  return (
    <TableSectionProvider section="foot">
      {createElement(
        'tfoot',
        mergeProps(otherProps, table?.footProps ?? { className: 'kv-table-foot' }, {
          children,
        }),
      )}
    </TableSectionProvider>
  )
}
TableFoot.displayName = 'Table.Foot'

/**
 * A `<tr>`. Give it `row` in the body for `data-selected`, `data-expanded` and, virtualized,
 * `aria-rowindex`. In the head, give it `headerGroup` for `aria-rowindex` of a header row. A head
 * row without it and a row in the foot find their number from where they are in the table.
 */
export function TableRow<TFeatures extends TableFeatures, TData extends RowData>({
  row,
  headerGroup,
  ref,
  ...otherProps
}: TableRowProps<TFeatures, TData>): ReactElement {
  const table = useTableContext<TFeatures, TData>()
  const section = useContext(TableSectionContext)
  // A header row without its group, and a footer row, are numbered by their place in their section,
  // which only the DOM knows. Body rows never need it: they are numbered by their row.
  const isNumberedByPlace =
    table?.isVirtualized === true &&
    row === undefined &&
    (section === 'foot' || (section === 'head' && headerGroup === undefined))
  const [rowElement, setRowElement] = useState<HTMLTableRowElement | null>(null)
  const mergedRef = useMergedRef(ref, isNumberedByPlace ? setRowElement : null)
  // Read like the columns of the table: checked again after every commit.
  const placeInSection = useSyncExternalStore(
    subscribeNever,
    () => (isNumberedByPlace ? rowElement?.sectionRowIndex : undefined),
    () => undefined,
  )

  let hookProps: TableRowPartProps = { className: 'kv-table-row' }
  if (table !== null && row !== undefined) {
    hookProps = table.getRowProps(row)
  } else if (table?.isVirtualized === true && section === 'head') {
    const rowIndex =
      headerGroup === undefined
        ? placeInSection === undefined
          ? undefined
          : placeInSection + 1
        : getHeaderRowIndex(headerGroup)
    hookProps = {
      className: 'kv-table-row',
      ...(rowIndex === undefined ? {} : { 'aria-rowindex': rowIndex }),
    }
  } else if (table?.isVirtualized === true && section === 'foot' && placeInSection !== undefined) {
    hookProps = {
      className: 'kv-table-row',
      'aria-rowindex': table.footRowOffset + placeInSection + 1,
    }
  }
  return createElement('tr', mergeProps(otherProps, hookProps, { ref: mergedRef }))
}
TableRow.displayName = 'Table.Row'

/**
 * The sort indicator, drawn here and not from the icon set (a built-in `sort` icon would change
 * the icon API): two small chevrons while the column is sortable but not sorted, one up
 * chevron for ascending and one down chevron for descending, so the three states differ in shape.
 * Decorative: `aria-sort` on the header carries the state.
 */
function SortIcon({ sort }: { sort: TableSortDirection | undefined }): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1.25em"
      height="1.25em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="kv-table-sort-icon"
    >
      {sort === 'ascending' ? (
        <path d="M5 15.5 12 8.5 19 15.5" />
      ) : sort === 'descending' ? (
        <path d="M5 8.5 12 15.5 19 8.5" />
      ) : (
        <>
          <path d="M7 9.5 12 4.5 17 9.5" />
          <path d="M7 14.5 12 19.5 17 14.5" />
        </>
      )}
    </svg>
  )
}

/**
 * A column header, `<th scope="col">`, with `aria-sort` on the sorted column only (a column
 * group, a `colSpan` above 1, is `scope="colgroup"`). Give it `header`, and it renders the column's
 * `header` template when it has no children. Put a `Table.SortButton` in it for a sortable column.
 */
export function TableColumnHeader<TFeatures extends TableFeatures, TData extends RowData>({
  header,
  children,
  ...otherProps
}: TableColumnHeaderProps<TFeatures, TData>): ReactElement {
  const table = useTableContext<TFeatures, TData>()
  const hookProps = table?.getColumnHeaderProps(header) ?? {
    className: 'kv-table-column-header',
    scope: 'col',
    ...(header !== undefined && header.colSpan > 1 ? { colSpan: header.colSpan } : {}),
  }
  const content =
    isEmptyContent(children) && header !== undefined && !header.isPlaceholder
      ? renderTemplate<HeaderContext<TFeatures, TData, unknown>, ReactNode>(
          header.column.columnDef.header,
          header.getContext(),
        )
      : children
  return createElement('th', mergeProps(otherProps, hookProps, { children: content }))
}
TableColumnHeader.displayName = 'Table.ColumnHeader'

/** A row header for a static table: `<th scope="row">`. With `useTable`, `Table.Cell` renders it for the `rowHeader` column. */
export function TableRowHeader({ ...otherProps }: TableRowHeaderProps): ReactElement {
  return createElement(
    'th',
    mergeProps(otherProps, { className: 'kv-table-row-header', scope: 'row' }),
  )
}
TableRowHeader.displayName = 'Table.RowHeader'

/**
 * A cell. Give it `cell` from `row.getAllCells()`: it is `<th scope="row">` for the `rowHeader`
 * column and `<td>` otherwise, and renders the column's `cell` template when it has no children.
 * Without `cell` it is a plain `<td>`.
 */
export function TableCell<TFeatures extends TableFeatures, TData extends RowData>({
  cell,
  children,
  ...otherProps
}: TableCellProps<TFeatures, TData>): ReactElement {
  const table = useTableContext<TFeatures, TData>()
  const hookProps: TableCellPartProps =
    table !== null && cell !== undefined ? table.getCellProps(cell) : { className: 'kv-table-cell' }
  const content =
    isEmptyContent(children) && cell !== undefined
      ? renderTemplate<CellContext<TFeatures, TData, unknown>, ReactNode>(
          cell.column.columnDef.cell,
          cell.getContext(),
        )
      : children
  return createElement(
    hookProps.scope === 'row' ? 'th' : 'td',
    mergeProps(otherProps, hookProps, { children: content }),
  )
}
TableCell.displayName = 'Table.Cell'

/**
 * The button of a sortable column header: the header's text and a decorative sort icon. It sorts
 * by the column, or changes its direction, and announces it (the sort cycle of TanStack Table:
 * the first direction, the other, then none). One column at a time. The state is `aria-sort` on
 * the header and `data-sort` here, never the icon alone.
 */
export function TableSortButton<TFeatures extends TableFeatures, TData extends RowData>({
  header,
  children,
  ...otherProps
}: TableSortButtonProps<TFeatures, TData>): ReactElement {
  const table = useTableContext<TFeatures, TData>()
  const hookProps =
    table !== null && header !== undefined
      ? table.getSortButtonProps(header)
      : ({ type: 'button', className: 'kv-table-sort-button' } as const)
  const sort = 'data-sort' in hookProps ? hookProps['data-sort'] : undefined
  const content =
    isEmptyContent(children) && header !== undefined
      ? renderTemplate<HeaderContext<TFeatures, TData, unknown>, ReactNode>(
          header.column.columnDef.header,
          header.getContext(),
        )
      : children
  return createElement(
    'button',
    mergeProps(otherProps, hookProps, {
      children: (
        <>
          {content}
          <SortIcon sort={sort} />
        </>
      ),
    }),
  )
}
TableSortButton.displayName = 'Table.SortButton'

/**
 * A row's native checkbox. Named "Select" and the row header ("Select Anna Svensson"), or "Select
 * row 3" when the table has no `rowHeader`. The selected row has `data-selected`, never
 * `aria-selected`, which a row in a table can't have.
 */
export function TableSelectCheckbox<TFeatures extends TableFeatures, TData extends RowData>({
  row,
  ...otherProps
}: TableSelectCheckboxProps<TFeatures, TData>): ReactElement {
  const table = useTableContext<TFeatures, TData>()
  const hookProps =
    table !== null && row !== undefined
      ? table.getSelectCheckboxProps(row)
      : ({ type: 'checkbox', className: 'kv-checkbox kv-table-select-checkbox' } as const)
  return createElement('input', mergeProps(otherProps, hookProps))
}
TableSelectCheckbox.displayName = 'Table.SelectCheckbox'

/**
 * The checkbox of the header that selects every row: "Select all rows", `indeterminate` while some
 * rows are selected. Toggling it announces how many rows are selected.
 */
export function TableSelectAllCheckbox({
  ...otherProps
}: TableSelectAllCheckboxProps): ReactElement {
  const table = useTableContext()
  const hookProps = table?.getSelectAllCheckboxProps() ?? {
    type: 'checkbox',
    className: 'kv-checkbox kv-table-select-checkbox',
  }
  return createElement('input', mergeProps(otherProps, hookProps))
}
TableSelectAllCheckbox.displayName = 'Table.SelectAllCheckbox'

/**
 * A row's disclosure button: the text "Details" and a chevron, `aria-expanded` for the state.
 * Its name is its text and the row header ("Details Anna Svensson"), the same open and closed:
 * only `aria-expanded` changes. With no `rowHeader` the name is "Details row 3", so the buttons
 * of a table can be told apart. The chevron points down while the details are hidden and up while
 * they are shown, and never rotates. Give it children and they replace the text and the chevron:
 * your text names it instead, with the row header after it, and with no `rowHeader` it is yours
 * to make different on each row (or give it an `aria-label`).
 */
export function TableExpandButton<TFeatures extends TableFeatures, TData extends RowData>({
  row,
  children,
  ...otherProps
}: TableExpandButtonProps<TFeatures, TData>): ReactElement {
  const table = useTableContext<TFeatures, TData>()
  const hookProps: Pick<TableExpandButtonPartProps, 'type' | 'className'> &
    Partial<TableExpandButtonPartProps> =
    table !== null && row !== undefined
      ? table.getExpandButtonProps(row)
      : ({ type: 'button', className: 'kv-table-expand-button' } as const)
  // "Details row 3" names the button that shows the default text. Your children are the visible
  // text instead (2.5.3), and a name of your own replaces it.
  const { 'aria-label': defaultName, ...restHookProps } = hookProps
  const keepsDefaultName =
    isEmptyContent(children) &&
    otherProps['aria-label'] === undefined &&
    otherProps['aria-labelledby'] === undefined
  const isExpanded = row !== undefined && hasRowExpanding(row) && row.getIsExpanded()
  return createElement(
    'button',
    mergeProps(
      otherProps,
      restHookProps,
      keepsDefaultName && defaultName !== undefined ? { 'aria-label': defaultName } : {},
      {
        children: isEmptyContent(children) ? (
          <>
            {table?.expandButtonText}
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size="20"
              className="kv-table-expand-icon"
            />
          </>
        ) : (
          children
        ),
      },
    ),
  )
}
TableExpandButton.displayName = 'Table.ExpandButton'

/**
 * The details of an expanded row: a `<tr>` with one cell that spans every column, rendered only
 * while the row is expanded. Put it right after the row. `aria-level` is not used: it isn't allowed
 * outside a tree grid.
 */
export function TableDetailRow<TFeatures extends TableFeatures, TData extends RowData>({
  row,
  colSpan,
  children,
  ...otherProps
}: TableDetailRowProps<TFeatures, TData>): ReactElement | null {
  const table = useTableContext<TFeatures, TData>()
  if (table !== null && row !== undefined && !(hasRowExpanding(row) && row.getIsExpanded())) {
    return null
  }
  const hookProps =
    table !== null && row !== undefined
      ? table.getDetailRowProps(row)
      : { className: 'kv-table-detail-row' }
  return createElement(
    'tr',
    mergeProps(otherProps, hookProps, {
      children: <td colSpan={table?.columnCount ?? colSpan ?? 1}>{children}</td>,
    }),
  )
}
TableDetailRow.displayName = 'Table.DetailRow'

/**
 * What a table says when there are no rows: a `<tbody>` with one row and one cell that spans every
 * column, shown only when the row model is empty. Its text is the `empty` message: replace it with
 * something useful, say why and what to do next. While the table loads its first rows it says
 * "Loading rows." instead, so it never claims there is nothing.
 */
export function TableEmpty({
  colSpan,
  children,
  ...otherProps
}: TableEmptyProps): ReactElement | null {
  const table = useTableContext()
  if (table !== null && !table.isEmpty) {
    return null
  }
  return createElement(
    'tbody',
    mergeProps(otherProps, table?.emptyProps ?? { className: 'kv-table-empty' }, {
      children: (
        <tr>
          <td colSpan={table?.columnCount ?? colSpan ?? 1}>
            {table?.isLoading === true ? table.loadingText : (children ?? table?.emptyText)}
          </td>
        </tr>
      ),
    }),
  )
}
TableEmpty.displayName = 'Table.Empty'

/** A data table: a native `<table>` with sorting, selection, expanding and virtualization. */
export const Table = {
  Root: TableRoot,
  ScrollRegion: TableScrollRegion,
  Caption: TableCaption,
  Head: TableHead,
  Body: TableBody,
  Foot: TableFoot,
  Row: TableRow,
  ColumnHeader: TableColumnHeader,
  RowHeader: TableRowHeader,
  Cell: TableCell,
  SortButton: TableSortButton,
  SelectCheckbox: TableSelectCheckbox,
  SelectAllCheckbox: TableSelectAllCheckbox,
  ExpandButton: TableExpandButton,
  DetailRow: TableDetailRow,
  Empty: TableEmpty,
} as const
