import type {
  RowData,
  TableBodyProps,
  TableCellProps,
  TableColumnHeaderProps,
  TableDetailRowProps,
  TableEmptyProps,
  TableExpandButtonProps,
  TableFeatures,
  TableRootProps,
  TableRowProps,
  TableScrollRegionProps,
  TableSelectCheckboxProps,
  TableSortButtonProps,
  UseTableExtraOptions,
  UseTableOptions,
  UseTableResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

type Features = TableFeatures
type Data = RowData

const tableProp = {
  type: 'UseTableResult',
  default: '–',
  description:
    'The result of useTable(). Without it the part is the plain native element with its class, so a small static table needs no TanStack Table.',
} as const

export const tableRootRows = propRows<Pick<TableRootProps<Features, Data>, 'table'>>({
  table: tableProp,
})

export const tableScrollRegionRows = propRows<
  Pick<TableScrollRegionProps<Features, Data>, 'table' | 'region'>
>({
  table: {
    ...tableProp,
    description:
      'The same useTable() result as the Root: the region is named by the table’s caption and is the virtualizer’s scroll element.',
  },
  region: {
    type: "'overflow' | 'always'",
    default: "'overflow'",
    description:
      'When the region is a named region landmark: only while the table scrolls, or always. It is a Tab stop only while it scrolls. With table, this wins over the region option of useTable.',
  },
})

export const tableBodyRows = propRows<Pick<TableBodyProps<Features, Data>, 'children'>>({
  children: {
    type: 'ReactNode | ((row, index) => ReactNode)',
    default: '–',
    description:
      'Your own rows, or a function that renders one Row per row of the row model. The function needs table on the Root. Virtualized, only the rows near the scroll position are rendered, with spacer rows between.',
  },
})

export const tableRowRows = propRows<Pick<TableRowProps<Features, Data>, 'row' | 'headerGroup'>>({
  row: {
    type: 'Row',
    default: '–',
    description:
      'The row of the row model: sets data-selected, data-expanded and, virtualized, aria-rowindex.',
  },
  headerGroup: {
    type: 'HeaderGroup',
    default: '–',
    description: 'In the head: the header group the row shows, for aria-rowindex when virtualized.',
  },
})

export const tableColumnHeaderRows = propRows<
  Pick<TableColumnHeaderProps<Features, Data>, 'header'>
>({
  header: {
    type: 'Header',
    default: '–',
    description:
      'The header from table.getHeaderGroups(): sets colSpan and aria-sort, and without children renders the column’s header template. Leave it out for a column you add yourself.',
  },
})

export const tableCellRows = propRows<Pick<TableCellProps<Features, Data>, 'cell'>>({
  cell: {
    type: 'Cell',
    default: '–',
    description:
      'The cell from row.getAllCells(). It is a <th scope="row"> for the rowHeader column and a <td> otherwise, and without children renders the column’s cell template.',
  },
})

export const tableSortButtonRows = propRows<Pick<TableSortButtonProps<Features, Data>, 'header'>>({
  header: {
    type: 'Header',
    default: '–',
    description: 'The header whose column it sorts: from table.getHeaderGroups().',
  },
})

export const tableSelectRows = propRows<Pick<TableSelectCheckboxProps<Features, Data>, 'row'>>({
  row: {
    type: 'Row',
    default: '–',
    description:
      'Table.SelectCheckbox only: the row it selects. Its name is "Select" and the row’s header cell, or "Select row 3". Table.SelectAllCheckbox takes no row.',
  },
})

export const tableExpandButtonRows = propRows<Pick<TableExpandButtonProps<Features, Data>, 'row'>>({
  row: {
    type: 'Row',
    default: '–',
    description: 'The row it shows and hides the details of.',
  },
})

export const tableDetailRowRows = propRows<
  Pick<TableDetailRowProps<Features, Data>, 'row' | 'colSpan'>
>({
  row: {
    type: 'Row',
    default: '–',
    description: 'The row it belongs to. It is rendered only while the row is expanded.',
  },
  colSpan: {
    type: 'number',
    default: '–',
    description: 'Without a table on the Root: how many columns the detail cell spans.',
  },
})

export const tableEmptyRows = propRows<Pick<TableEmptyProps, 'children' | 'colSpan'>>({
  children: {
    type: 'ReactNode',
    default: 'the empty message',
    description:
      'What the cell says. Say something useful: why there are no rows and what to do next.',
  },
  colSpan: {
    type: 'number',
    default: '–',
    description: 'Without a table on the Root: how many columns the cell spans.',
  },
})

export const tableRootAttributes: readonly AttributeRow[] = [
  { name: 'kv-table', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-busy',
    values: '"true" or absent',
    meaning: 'Rows are loading (isLoading).',
  },
  { name: 'data-busy', values: 'present or absent', meaning: 'Rows are loading (isLoading).' },
  { name: 'data-virtualized', values: 'present or absent', meaning: 'virtualize is on.' },
  {
    name: 'aria-rowcount',
    values: 'a number',
    meaning: 'Virtualized only: the header rows, every row of the data and the rows of Table.Foot.',
  },
]

export const tableScrollRegionAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-scroll-region kv-table-scroll-region',
    values: 'always',
    meaning: 'The part classes.',
  },
  {
    name: 'role',
    values: '"region" or absent',
    meaning: 'A named region while the table scrolls, or always with region="always".',
  },
  {
    name: 'aria-labelledby',
    values: 'the caption’s id',
    meaning: 'Names the region, while it is one and the table has a caption. Yours replaces it.',
  },
  {
    name: 'tabindex',
    values: '"0" or absent',
    meaning: 'A Tab stop only while the table scrolls, so a keyboard user can scroll it.',
  },
  { name: 'data-overflowing', values: 'present or absent', meaning: 'The table scrolls.' },
  {
    name: '--kv-table-head-block-size',
    values: 'a length in px',
    meaning: 'Set on the region: the height of the head, which the theme uses as scroll padding.',
  },
]

export const tableSimpleAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-caption', values: 'always', meaning: 'Table.Caption: the table’s name.' },
  { name: 'kv-table-head', values: 'always', meaning: 'Table.Head.' },
  { name: 'kv-table-foot', values: 'always', meaning: 'Table.Foot.' },
  {
    name: 'kv-table-row-header',
    values: 'always',
    meaning: 'Table.RowHeader: renders <th scope="row">.',
  },
]

export const tableBodyAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-body', values: 'always', meaning: 'The part class.' },
  {
    name: 'kv-table-spacer',
    values: 'on a row you do not render',
    meaning:
      'Virtualized only: a row with aria-hidden="true" stands in for each gap of unrendered rows.',
  },
]

export const tableRowAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-row', values: 'always', meaning: 'The part class.' },
  { name: 'data-selected', values: 'present or absent', meaning: 'The row is selected.' },
  { name: 'data-expanded', values: 'present or absent', meaning: 'The row’s details are shown.' },
  {
    name: 'data-index',
    values: 'a number',
    meaning: 'Virtualized only: the row’s place in the data.',
  },
  {
    name: 'aria-rowindex',
    values: 'a number',
    meaning: 'Virtualized only: the row’s number, counting the header rows.',
  },
]

export const tableColumnHeaderAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-column-header', values: 'always', meaning: 'The part class.' },
  {
    name: 'kv-table-column-header--numeric',
    values: 'class you add',
    meaning: 'Aligns a column of quantities to the end. Add kv-table-cell--numeric to its cells.',
  },
  { name: 'scope', values: '"col" or "colgroup"', meaning: 'Colgroup when colSpan is above 1.' },
  {
    name: 'aria-sort',
    values: '"ascending" or "descending"',
    meaning: 'On the sorted column only.',
  },
  {
    name: 'data-sort',
    values: '"ascending" or "descending"',
    meaning: 'The same, for styling.',
  },
]

export const tableCellAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-cell', values: 'always', meaning: 'The part class.' },
  {
    name: 'kv-table-cell--numeric',
    values: 'class you add',
    meaning: 'Aligns a quantity to the end.',
  },
  {
    name: 'kv-table-row-header',
    values: 'on the rowHeader column',
    meaning: 'The cell is a <th scope="row"> instead of a <td>.',
  },
]

export const tableSortButtonAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-sort-button', values: 'always', meaning: 'The part class.' },
  {
    name: 'data-sort',
    values: '"ascending" or "descending"',
    meaning: 'The column is sorted. The state a screen reader reads is aria-sort on the header.',
  },
  {
    name: 'kv-table-sort-icon',
    values: 'on the svg inside',
    meaning: 'The decorative icon: two chevrons while sortable, one up or down while sorted.',
  },
]

export const tableSelectAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-checkbox kv-table-select-checkbox',
    values: 'always',
    meaning: 'The part classes. A native checkbox.',
  },
  {
    name: 'indeterminate',
    values: 'DOM property',
    meaning: 'Table.SelectAllCheckbox only: some rows are selected.',
  },
]

export const tableExpandButtonAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-expand-button', values: 'always', meaning: 'The part class.' },
  { name: 'aria-expanded', values: '"true" or "false"', meaning: 'The details are shown.' },
  {
    name: 'aria-controls',
    values: 'the detail row’s id',
    meaning: 'Present while the details are shown.',
  },
  { name: 'data-expanded', values: 'present or absent', meaning: 'The details are shown.' },
  {
    name: 'kv-table-expand-icon',
    values: 'on the svg inside',
    meaning: 'The decorative chevron: down while hidden, up while shown.',
  },
]

export const tableDetailRowAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-detail-row', values: 'always', meaning: 'The part class.' },
  { name: 'data-expanded', values: 'present', meaning: 'The row is shown only while expanded.' },
]

export const tableEmptyAttributes: readonly AttributeRow[] = [
  { name: 'kv-table-empty', values: 'always', meaning: 'The part class.' },
]

export const useTableHook: ApiHook = {
  name: 'useTable',
  options: propRows<
    Pick<
      UseTableOptions<Features, Data>,
      'features' | 'columns' | 'data' | 'getRowId' | 'initialState' | 'state'
    > &
      UseTableExtraOptions
  >({
    features: {
      type: 'TableFeatures',
      description:
        'The TanStack Table features and row models, made with tableFeatures(). Only the features KvirnUI re-exports are supported.',
    },
    columns: {
      type: 'ColumnDef[]',
      description: 'The columns, made with createColumnHelper().',
    },
    data: { type: 'TData[]', description: 'The rows’ data.' },
    getRowId: {
      type: '(row: TData, index: number) => string',
      default: 'the index',
      description: 'A stable id for each row. Use it, so sorting and selection follow the row.',
    },
    initialState: {
      type: 'object',
      default: '–',
      description: 'The state at the start: sorting, rowSelection, expanded, pagination and so on.',
    },
    state: {
      type: 'object',
      default: '–',
      description: 'Controlled state. Pair each slice with its on…Change option.',
    },
    region: {
      type: "'overflow' | 'always'",
      default: "'overflow'",
      description:
        'When the scroll region is a named region. Table.ScrollRegion’s own region wins.',
    },
    rowHeader: {
      type: 'string',
      default: '–',
      description:
        'The id of the column whose cells are <th scope="row">: the one that names the row. It names the row’s checkbox and expand button too.',
    },
    virtualize: {
      type: 'boolean | { estimateSize?: number; overscan?: number }',
      default: 'false',
      description:
        'Renders only the rows near the scroll position. Estimate size defaults to 40 and overscan to 5. Ignored, with a development warning, with rowExpandingFeature.',
    },
    isLoading: {
      type: 'boolean',
      default: 'false',
      description: 'Rows are loading: aria-busy and data-busy, and "Loading rows." is announced.',
    },
    messages: {
      type: 'Partial<KvirnMessages["table"]>',
      default: '–',
      description: 'Replaces strings for this table only. See Strings.',
    },
  }),
  result: propRows<UseTableResult<Features, Data>>({
    table: {
      type: 'TanStackTable',
      default: '–',
      description:
        'The TanStack Table instance: getHeaderGroups(), getRowModel(), setPageIndex() and so on.',
    },
    tableProps: { type: 'TableRootPartProps', default: '–', description: 'Spread on <table>.' },
    captionProps: {
      type: 'TableCaptionPartProps',
      default: '–',
      description: 'Spread on <caption>.',
    },
    scrollRegionProps: {
      type: 'TableScrollRegionPartProps',
      default: '–',
      description: 'Spread on the <div> around the table, for the region option.',
    },
    getScrollRegionProps: {
      type: '(region: TableRegion) => TableScrollRegionPartProps',
      default: '–',
      description: 'The scroll region’s props for another region value.',
    },
    headProps: { type: 'TableHeadPartProps', default: '–', description: 'Spread on <thead>.' },
    bodyProps: { type: 'TableBodyPartProps', default: '–', description: 'Spread on <tbody>.' },
    footProps: { type: 'TableFootPartProps', default: '–', description: 'Spread on <tfoot>.' },
    getColumnHeaderProps: {
      type: '(header?: Header) => TableColumnHeaderPartProps',
      default: '–',
      description: 'Spread on <th> in the header row. Without a header: a column you add yourself.',
    },
    getSortButtonProps: {
      type: '(header: Header) => TableSortButtonPartProps',
      default: '–',
      description: 'Spread on the <button> in a sortable column header.',
    },
    getRowProps: {
      type: '(row: Row) => TableRowPartProps',
      default: '–',
      description: 'Spread on <tr>.',
    },
    getCellProps: {
      type: '(cell: Cell) => TableCellPartProps',
      default: '–',
      description: 'Spread on <td>, or <th scope="row"> for the rowHeader column.',
    },
    getSelectCheckboxProps: {
      type: '(row: Row) => TableSelectCheckboxPartProps',
      default: '–',
      description: 'Spread on a row’s <input type="checkbox">.',
    },
    getSelectAllCheckboxProps: {
      type: '() => TableSelectAllCheckboxPartProps',
      default: '–',
      description: 'Spread on the header’s <input type="checkbox">.',
    },
    getExpandButtonProps: {
      type: '(row: Row) => TableExpandButtonPartProps',
      default: '–',
      description: 'Spread on a row’s expand <button>.',
    },
    getDetailRowProps: {
      type: '(row: Row) => TableDetailRowPartProps',
      default: '–',
      description: 'Spread on the detail <tr>.',
    },
    emptyProps: {
      type: 'TableEmptyPartProps',
      default: '–',
      description: 'Spread on the empty <tbody>.',
    },
    rows: {
      type: 'TableBodyEntry[]',
      default: '–',
      description:
        'What Table.Body renders: every row, or with virtualize the rows near the scroll position and a spacer for the rest.',
    },
    isVirtualized: {
      type: 'boolean',
      default: '–',
      description: 'virtualize is on, and in effect.',
    },
    isLoading: { type: 'boolean', default: '–', description: 'The table is loading rows.' },
    isEmpty: { type: 'boolean', default: '–', description: 'The row model has no rows.' },
    columnCount: {
      type: 'number',
      default: '–',
      description:
        'How many columns are drawn, counting cells you add yourself: what a spacer, detail or empty row spans.',
    },
    footRowOffset: {
      type: 'number',
      default: '–',
      description:
        'Virtualized: how many rows come before the footer, for a footer row’s aria-rowindex.',
    },
    emptyText: { type: 'string', default: '–', description: 'The text of the empty row.' },
    loadingText: {
      type: 'string',
      default: '–',
      description: 'The text of the empty row while the table loads and has no rows yet.',
    },
    expandButtonText: {
      type: 'string',
      default: '–',
      description:
        'The visible text of an expand button, and the hidden text of the expand column’s header.',
    },
  }),
}
