# Table

> **Draft** (Plan 0026). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [table.a11y.md](table.a11y.md), the design spec is [docs/design/table.md](../../../../docs/design/table.md), and the decisions are in the overlays-and-lists skill.

A Table shows data in rows and columns: cases, payments, decisions, statistics. It renders a **native `<table>`**, so a screen reader can read it by row and column and say which header a cell belongs to. KvirnUI adds what is easy to get wrong: a name, the sort state and its announcement, a different name for every row checkbox, and an honest size for a table too big to render.

- Parts: `Table.Root`, `.ScrollRegion`, `.Caption`, `.Head`, `.Body`, `.Foot`, `.Row`, `.ColumnHeader`, `.RowHeader`, `.Cell`, `.SortButton`, `.SelectCheckbox`, `.SelectAllCheckbox`, `.ExpandButton`, `.DetailRow` and `.Empty`. Each is also exported on its own (`TableRoot`, …), and the hook is `useTable`.
- **It is not a grid.** There is no `role="grid"` and no arrow-key navigation between cells. Links, buttons and checkboxes in cells are in the Tab order, in reading order, as people expect on a web page. A spreadsheet-like editor would be a different component.
- **Nothing changes the `display` of a table element.** Some browsers drop the table semantics when it is changed, so none of the parts or the theme does.
- **Name it.** Use `Table.Caption`, or `aria-labelledby` on `Table.Root`, pointing at a visible heading. A table with neither warns in development.
- Headless: no CSS. The parts render `kv-table` and one class per part, with state as `data-*` attributes (`data-sort`, `data-selected`, `data-expanded`, `data-busy`, `data-virtualized`), and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## When to use it

Use a Table when the data has more than one value per row that people compare, scan or sort: a list of cases with a number, a date and a status. Don't use it for layout, and don't use it for a single column: that is a list. For a few facts about one thing, use a description list or a card.

If the rows are links to something, make the row header the link and keep the other cells as text. If a row has actions, put them in one menu. Every control in a cell is a Tab stop, and a table of fifty rows with three buttons each is a hundred and fifty of them.

## A static table

A small table that never changes needs no TanStack Table. Every part is the plain native element with its class when it has no `table`.

```tsx
import { Table } from '@kvirn-ui/react'

;<Table.Root>
  <Table.Caption>Avgifter</Table.Caption>
  <Table.Head>
    <Table.Row>
      <Table.ColumnHeader>Tjänst</Table.ColumnHeader>
      <Table.ColumnHeader>Avgift</Table.ColumnHeader>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.RowHeader>Pass</Table.RowHeader>
      <Table.Cell>350 kr</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

`Table.ColumnHeader` is `<th scope="col">` and `Table.RowHeader` is `<th scope="row">`. Mark the column that names each row as a row header: screen readers read it first, as the row's title.

## With `useTable`

`useTable` is TanStack Table with KvirnUI's accessible defaults. You say which features the table has, with `tableFeatures`, and write the columns with `createColumnHelper`. Everything comes from `@kvirn-ui/react`, so you install nothing else.

```tsx
import {
  Table,
  createColumnHelper,
  createLocaleSortFn,
  createSortedRowModel,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@kvirn-ui/react'

// Outside the component: the features and the columns are made once.
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { locale: createLocaleSortFn('sv') },
  rowSelectionFeature,
})
const column = createColumnHelper<typeof features, Case>()
const columns = column.columns([
  column.accessor('name', { header: 'Namn', sortFn: 'locale' }),
  column.accessor('caseNumber', { header: 'Ärendenummer' }),
  column.accessor('received', { header: 'Inkom', cell: (info) => formatDate(info.getValue()) }),
])

function Cases({ data }: { data: Case[] }) {
  const cases = useTable({ features, columns, data, getRowId: (row) => row.id, rowHeader: 'name' })
  return (
    <Table.ScrollRegion table={cases}>
      <Table.Root table={cases}>
        <Table.Caption>Öppna ärenden</Table.Caption>
        <Table.Head>
          {cases.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              <Table.ColumnHeader>
                <Table.SelectAllCheckbox />
              </Table.ColumnHeader>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader key={header.id} header={header}>
                  {header.column.getCanSort() ? <Table.SortButton header={header} /> : null}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <Table.Body>
          {(row) => (
            <Table.Row key={row.id} row={row}>
              <Table.Cell>
                <Table.SelectCheckbox row={row} />
              </Table.Cell>
              {row.getAllCells().map((cell) => (
                <Table.Cell key={cell.id} cell={cell} />
              ))}
            </Table.Row>
          )}
        </Table.Body>
        <Table.Empty />
      </Table.Root>
    </Table.ScrollRegion>
  )
}
```

`useTable` takes TanStack Table's options (`features`, `columns`, `data`, `getRowId`, `state`, `on…Change`, `initialState`, …) and four of its own: `rowHeader`, `virtualize`, `isLoading` and `region` (see [Narrow screens](#narrow-screens)), plus `messages` for per-instance strings. It creates the table once, keeps its options in sync on every render and re-renders when the table's state changes, so a sort or a selection shows without any wiring. `table` in its result is the TanStack Table instance: `table.getHeaderGroups()`, `table.setPageIndex(2)`, `table.getSelectedRowIds()`.

Give the Root and the ScrollRegion the same result (`table={cases}`). The `rowHeader` is the id of the column whose cells are `<th scope="row">`.

What is supported is what `@kvirn-ui/react` exports: sorting, row selection, expanding, pagination, column and global filtering and column visibility, with their row models and the built-in sort and filter functions. Define the features and the columns outside the component, so they keep their identity between renders.

## Sorting

A sortable column's header holds a `Table.SortButton`: the header text and a sort icon that is decorative. Its state is `aria-sort` on the column header, on the sorted column only, and `data-sort` for the theme. Each press sorts by that column, or changes its direction, and says so politely: "Sorterad efter Namn, stigande." The cycle is the first direction for the column's data, the other, then none.

**One column at a time.** Multi-sort needs Shift+click, a key the table pattern doesn't define, so it is off and can't be turned on.

**Sort with the locale.** TanStack's own sort functions compare code points, so "Åsa" comes before "Zack" in a table in Swedish, where å comes after z. `createLocaleSortFn(locale)` sorts with `Intl.Collator`: å, ä and ö after z in Swedish, Finnish and Norwegian, case ignored, and "Ärende 2" before "Ärende 10". Register it under a name in `sortFns` and name it in the columns that hold text.

## Selection

Add `rowSelectionFeature`, a `Table.SelectCheckbox` in each row and a `Table.SelectAllCheckbox` in the header. They are native checkboxes.

- **Each checkbox is named by its row:** "Välj Anna Svensson". The name is "Välj" and the row header cell, so choose a `rowHeader`. Without one the name is "Välj rad 3".
- **A selected row has `data-selected`** for styling and never `aria-selected`, which a row in a table can't have. The checkbox says whether it is selected.
- **Select-all is indeterminate** while some rows are selected, and toggling it says how many rows are selected: "12 rader markerade." It selects every row of the table, including the rows on other pages, so say that near a paginated table, or change `messages.selectAllRows`.

Selection is state like any other in TanStack Table. Give `useTable` a `getRowId` that returns a stable id, so a selection survives a sort or a filter, and read it with `cases.table.getSelectedRowIds()`.

## Expanding a row

Add `rowExpandingFeature` and `getRowCanExpand: () => true`. Put a `Table.ExpandButton` in the row, and a `Table.DetailRow` after it.

```tsx
<Table.Body>
  {(row) => (
    <>
      <Table.Row key={row.id} row={row}>
        <Table.Cell>
          <Table.ExpandButton row={row} />
        </Table.Cell>
        {row.getAllCells().map((cell) => (
          <Table.Cell key={cell.id} cell={cell} />
        ))}
      </Table.Row>
      <Table.DetailRow row={row}>{row.original.description}</Table.DetailRow>
    </>
  )}
</Table.Body>
```

The button shows the text "Detaljer" and a chevron that points down while the details are hidden and up while they are shown. It has `aria-expanded` and, while the details are shown, `aria-controls`. Its name is its text and the row header ("Detaljer Anna Svensson"), so every button in the list has its own name, and it stays the same open and closed: only `aria-expanded` changes. Give the expand column a header with the same text visually hidden (`<span className="kv-table-visually-hidden">{cases.expandButtonText}</span>`), so it isn't an empty header. Put the column first, after the checkbox column: on a small screen the first columns are the ones in view. The detail row has one cell that spans every column, and is rendered only while the row is expanded. Expanding can't be combined with `virtualize`.

## Filtering and pagination

Add `columnFilteringFeature` with `filteredRowModel: createFilteredRowModel()`, and `rowPaginationFeature` with `paginatedRowModel: createPaginatedRowModel()`. The filter and the page controls are your own: `cases.table.setColumnFilters(…)`, `cases.table.nextPage()`.

- **A filter change is announced** after 500 ms without another one, with the number of rows left: "3 rader." A filter that leaves nothing shows `Table.Empty`. Replace its text with something useful.
- **Pagination is the recommended answer to a large table.** Each page is its own small table. Say where the user is, in the caption or in a status near the controls ("Rader 21–40 av 312"), and keep the page controls after the table so they come in the Tab order where people look for them. A Pagination component is planned for M3.

## Large data

**Paginate or filter first. Virtualize last.** With `virtualize`, only the rows near the scroll position are in the DOM, with a spacer for the rest.

```tsx
const cases = useTable({ features, columns, data, virtualize: { estimateSize: 44, overscan: 8 } })
```

Give the scroll region a height (`max-block-size`). Virtualizing keeps what matters accessible, and has costs you should know before turning it on:

- **The table says how big it is.** `aria-rowcount` is the number of header rows plus every row of the data, and each rendered row has `aria-rowindex`, so a screen reader can say "row 4,512 of 10,001". Support for them varies between screen readers.
- **The row that holds focus stays rendered,** wherever the table is scrolled to, so focus is never lost.
- **The sticky header never covers the focused row.** The scroll padding is the header's height, measured and kept up to date.
- **Unrendered rows are out of reach.** Find-in-page can't find them, the browser doesn't print them, a screen reader's browse mode doesn't list them, and Tab can't reach a control in a row that isn't rendered. Give people a search or a filter.
- **Columns must not jump.** The theme uses `table-layout: fixed` for a virtualized table, so column widths come from the header row.
- Rows are measured, so `estimateSize` only has to be close, and a row that wraps is the right height.

## Numeric columns

Align a column of quantities to the end, so the figures line up: add `kv-table-column-header--numeric` to its `Table.ColumnHeader` and `kv-table-cell--numeric` to each of its cells (`kv-table-row-header--numeric` for a row header that is a quantity). Its sort icon then comes before the text, so the label's end edge lines up with the figures. Use it for amounts, counts and percentages. Case numbers, personal identity numbers and dates are read, not compared by magnitude: they stay at the start. Put the unit in the header once ("Belopp (kr)"), never in every cell. Every column has tabular figures already. With `useTable`, pass `className` per column:

```tsx
<Table.Cell
  cell={cell}
  className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
/>
```

## Narrow screens

Put the table in `Table.ScrollRegion`. A data table that needs two dimensions is exempt from reflow (WCAG 1.4.10), but it must still be reachable and scrollable. By default the region is a named `region` and a Tab stop only while the table overflows, so a keyboard user can scroll it with the arrow keys and Page Down, and meets no empty stop when nothing scrolls. When everything fits it is a plain `<div>`: no role, no name and no `tabindex`, so a page of short tables doesn't list an empty landmark for each.

**`region`** chooses when the scroll region is a landmark. `'overflow'` (the default) is what the paragraph above describes. `'always'` makes it a named region whether it scrolls or not, for a page where a table should be something screen reader users can list and jump to. It is a Tab stop only while it scrolls, in both. Set it on `Table.ScrollRegion` (`<Table.ScrollRegion table={cases} region="always">`), or on `useTable({ region: 'always' })`, where `scrollRegionProps` follow it. The prop on the part wins. The server render and the first client render are the same markup (a plain `<div>`, unless `region="always"`), and the role follows once the region has been measured.

**Name the region.** While it is a region it needs a name (WCAG 4.1.2). With `table={cases}` and a `Table.Caption` the caption names it. A table with no caption has no name to give it, so name the region yourself, with `aria-labelledby` pointing at a visible heading or with `aria-label`; without a name a development warning says so once the region is one. Name the table the same way, with `aria-labelledby` on `Table.Root`.

```tsx
<h2 id="fees-heading">Avgifter</h2>
<Table.ScrollRegion aria-labelledby="fees-heading">
  <Table.Root aria-labelledby="fees-heading">…</Table.Root>
</Table.ScrollRegion>
```

The head sticks inside the region only while the region scrolls vertically, which needs a height limit: a virtualized table gets `80svh`, and for any other table set `--kv-table-scroll-region-max-block-size` on the region or a parent. Without a limit the region grows with the table, and its head scrolls with the page, because a container that scrolls sideways is the head's scroll container. In a flex or grid parent, give the region's parent `min-inline-size: 0`, or the table can widen the page. Keep captions short: a caption as wide as the table can run past the region's edge at 320px.

Don't turn rows into cards with `display: block` on cells: some browsers then drop the table semantics. If you want cards on a small screen, render a list for that breakpoint.

## States

- **Loading.** `isLoading` sets `aria-busy="true"` and `data-busy` on the table and announces "Laddar rader." Rows already on screen stay at full contrast, and the head gets a static hatched bar, so the table never looks dimmed. A first load with no rows yet shows "Laddar rader." in the empty row instead of the empty text, so the table never says there is nothing while rows are on their way. A reload with rows is the one case where words matter: show the status near the table, such as in the caption or a `Notification.Info`.
- **Empty.** `Table.Empty` is one row with one cell that spans every column, shown when there are no rows. Its text is "Det finns inga rader att visa." Pass children to say something useful: why, and what to do next.

## Announcements

Through the shared Announcer (`KvirnProvider`), politely: a sort, the count after select-all, the row count after a filter, and loading. Selecting a single row isn't announced: its checkbox says it. Without a provider nothing is announced and a development warning says so.

## Strings

The component's names and announcements are in the `table` namespace of all six locales, and can be overridden per provider and per instance (`messages`). **The caption, the headers and the cells are yours.** Northern Sámi starts as English.

## Hook

`useTable(options)` returns `table` (the TanStack Table instance), the prop objects `tableProps`, `captionProps`, `scrollRegionProps` (follows the `region` option, and has no `role` while the region isn't one), `headProps`, `bodyProps` and `emptyProps`, the getters `getScrollRegionProps(region)` (`scrollRegionProps` for another `region`, which `Table.ScrollRegion`'s own `region` prop uses), `getColumnHeaderProps(header?)`, `getSortButtonProps(header)`, `getRowProps(row)`, `getCellProps(cell)`, `getSelectCheckboxProps(row)`, `getSelectAllCheckboxProps()`, `getExpandButtonProps(row)` and `getDetailRowProps(row)`, and `rows`, `isVirtualized`, `isLoading`, `isEmpty`, `columnCount`, `emptyText`, `loadingText` and `expandButtonText`. Spread each on your own element. See `table.a11y.md` for what each must carry.

## `render`

Every part takes `render` (an element or a function) to change the element it renders. Class names and handlers merge, and refs are merged. Keep the native element for the table, the rows and the cells: a `render` that swaps them for a `div` removes the table semantics.

## Your own look

The Table is headless: it sets no CSS of its own except the inline geometry a virtualized table can't work without (the block size of a spacer row and the width of a column). Style the classes below, or copy the theme's Table section into your project and change it. Never set `display` on a table element, a row or a cell: some browsers then drop the table semantics.

## Classes for the default theme

`kv-table`, `kv-table-caption`, `kv-table-head`, `kv-table-body`, `kv-table-foot`, `kv-table-row`, `kv-table-column-header`, `kv-table-row-header`, `kv-table-cell`, `kv-table-sort-button`, `kv-table-sort-icon`, `kv-table-select-checkbox` (with `kv-checkbox`), `kv-table-expand-button`, `kv-table-expand-icon`, `kv-table-detail-row`, `kv-table-empty`, `kv-table-spacer` and `kv-table-scroll-region` (with `kv-scroll-region`). You add `kv-table-column-header--numeric`, `kv-table-cell--numeric`, `kv-table-row-header--numeric` and `kv-table-visually-hidden`, and `kv-compact` on a container for 32px rows from 64rem. State: `data-sort` (on the header and its button), `data-selected`, `data-expanded`, `data-busy`, `data-virtualized` and `data-overflowing`. Properties: `--kv-table-scroll-region-max-block-size` (yours, to limit the height), and `--kv-table-head-block-size`, `--kv-table-cell-padding-block` and `--kv-table-cell-padding-inline` (set by the table and the theme).
