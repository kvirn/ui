# Plan 0026: Table, and virtualized Listbox, Combobox and Autocomplete

- **Status:** In progress
- **Owner:** Maintainer, with component-engineer and ux-designer
- **Created:** 2026-10-03 · **Target:** M3 (Table), M2 follow-up (virtualization)
- **Related:** ADR-0059 (supersedes ADR-0034), ADR-0035, ADR-0037, ADR-0050, design spec `docs/design/table.md`

## Goal

People using public-sector services can read, sort and select rows in a data table with any assistive technology, and pick from lists of thousands of options without the page slowing down, while screen readers still know how big the list is and where they are in it.

## Non-goals

- `role="grid"`, cell-by-cell arrow navigation and editable cells (ADR-0035 Option B; a future DataGrid needs its own ADR).
- Column resizing, column reordering by drag, column virtualization, and pinned columns.
- A Pagination component (M3, its own plan). Pagination works through TanStack's feature, and a story shows the recipe.
- ScrollArea (ADR-0036). `Table.ScrollRegion` covers the table's need until it exists.
- Virtualized groups in Listbox (ADR-0037 item 11), expansion combined with virtualization in Table, and multi-sort.
- Virtualizing the touch-native `<select>` rendering of Listbox.

## Background

- APG: Table pattern and Sortable Table example; Listbox and Combobox patterns (ADR-0037, ADR-0050).
- The Listbox and Combobox cores already navigate by index (`entries`, `size`, `activeIndex`, `getRequiredRenderKeys()` in `create-listbox.ts`). The React layer mounts every option and scrolls the active one with a per-option `scrollIntoView` (`listbox.tsx` `ListboxOption` effect). Option ids come from the data index (`getOptionId`), so they survive virtualization.
- Prior art: GOV.UK Table, Adrian Roselli's sortable tables, React Aria's virtualized ListBox and Table, TanStack's own virtualized-table examples.
- DESIGN.md: tables use `numeric` for figures, `surface` for the header row, `border-subtle` row dividers, no zebra stripes, and sortable headers are buttons with a visible sort indicator. Compact density (32px) is allowed for tables.

## Design

### API sketch: virtualization

```tsx
// Listbox, Combobox and Autocomplete take the same option.
<Listbox.Root items={municipalities} virtualize>
  …
</Listbox.Root>

<Combobox.Root items={streets} virtualize={{ estimateSize: 44, overscan: 8 }}>
  …
</Combobox.Root>
```

Core, in `packages/core/src/virtual/` (the only place that imports `@tanstack/virtual-core`):

```ts
interface ListVirtualizerOptions {
  count: number
  getScrollElement: () => HTMLElement | null
  estimateSize: (index: number) => number
  getRequiredIndexes: () => readonly number[] // active, selected, focused: always rendered
  getItemKey?: (index: number) => string | number
  overscan?: number // default 5
  scrollPaddingStart?: number // sticky table header
  onChange: () => void
}
interface ListVirtualizer {
  getVirtualItems(): readonly VirtualListItem[] // { index, key, start, end, size }, sorted, required included
  getSegments(): readonly VirtualSegment[] // items and gaps, in order: { type: 'item', item } | { type: 'gap', size }
  getTotalSize(): number
  isRendered(index: number): boolean
  scrollToIndex(index: number, options?: { align?: 'auto' | 'start' | 'center' | 'end' }): void
  measureElement(element: Element | null): void // reads data-index
  setOptions(options: Partial<ListVirtualizerOptions>): void
  mount(): () => void
}
function createListVirtualizer(options: ListVirtualizerOptions): ListVirtualizer
```

React behaviour when `virtualize` is on:

- The `role="listbox"` element is the scroll element. It contains one sizer `<div>` (inline `position: relative; block-size: <total>px`), and each rendered option is absolutely positioned inside it (inline `position: absolute; inset-inline: 0; transform: translateY(<start>px)`), with `data-index` and `measureElement` as its ref, so options that wrap are measured.
- Required indexes are `getRequiredRenderKeys()` (active, then selected) mapped to indexes.
- Every rendered option gets `aria-setsize={size}` and `aria-posinset={index + 1}`.
- When the active index changes because of a key (not the pointer, same rule as today's `shouldScrollToActive()`), the hook calls `scrollToIndex(activeIndex)` instead of the option's `scrollIntoView`. On open, the selected option is scrolled to as today.
- `virtualize` with `groups`: a `warnOnce` development warning, and the list renders in full.
- Touch-native Listbox rendering ignores `virtualize`.
- `use-popup.ts` keeps restoring the list's `scrollTop` after it re-measures. The virtualizer reads that scroll position.

### API sketch: Table

```tsx
import {
  Table,
  useTable,
  tableFeatures,
  rowSortingFeature,
  createSortedRowModel,
  rowSelectionFeature,
  createLocaleSortFn,
  createColumnHelper,
} from '@kvirn-ui/react'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { locale: createLocaleSortFn('sv') },
  rowSelectionFeature,
})
const column = createColumnHelper<typeof features, Case>()
const columns = column.columns([
  column.accessor('name', { header: 'Name', sortFn: 'locale' }),
  column.accessor('caseNumber', { header: 'Case number' }),
  column.accessor('received', { header: 'Received', cell: (info) => formatDate(info.getValue()) }),
])

function Cases({ data }: { data: Case[] }) {
  const cases = useTable({ features, columns, data, getRowId: (row) => row.id, rowHeader: 'name' })
  return (
    <Table.ScrollRegion table={cases}>
      <Table.Root table={cases}>
        <Table.Caption>Open cases</Table.Caption>
        <Table.Head>
          {cases.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
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

- **`useTable(options)`** takes the TanStack table options (`features`, `columns`, `data`, `getRowId`, `state`, `on*Change`, `initialState`, …) plus KvirnUI's: `rowHeader?: string` (the column id whose cells render as `<th scope="row">`), `virtualize?`, `isLoading?`, `messages?: Partial<KvirnMessages['table']>`. It creates the instance once through core's `createTable`, keeps options in sync with `table.setOptions`, and re-renders on `table.store` changes through `useStoreSelector`.
- **`UseTableResult`**: `table` (the TanStack instance) and the prop getters `tableProps`, `captionProps`, `scrollRegionProps`, `headProps`, `bodyProps`, `getColumnHeaderProps(header?)`, `getSortButtonProps(header)`, `getRowProps(row)`, `getCellProps(cell)`, `getSelectCheckboxProps(row)`, `getSelectAllCheckboxProps()`, `getExpandButtonProps(row)`, `getDetailRowProps(row)`, `emptyProps`, and `rows` (what `Table.Body` iterates: the row model, or the virtual segments).
- **Parts** (ADR-0035 item 1), each one element, each a named export, `render` prop as everywhere:
  - `Table.Root` `<table>`, `Table.Caption` `<caption>`, `Table.Head` `<thead>`, `Table.Body` `<tbody>`, `Table.Foot` `<tfoot>`, `Table.Row` `<tr>`.
  - `Table.ColumnHeader` `<th scope="col">`: with `header`, sets `colSpan` and `aria-sort`, and renders the header template when it has no children.
  - `Table.RowHeader` `<th scope="row">` for static tables.
  - `Table.Cell`: with `cell`, renders `<th scope="row">` for the `rowHeader` column and `<td>` otherwise, and renders the cell template when it has no children.
  - `Table.SortButton` `<button type="button">`: the header text plus a decorative sort icon (`aria-hidden`), `data-sort`.
  - `Table.SelectCheckbox`, `Table.SelectAllCheckbox`: native `<input type="checkbox">`.
  - `Table.ExpandButton` `<button type="button" aria-expanded aria-controls>`, and `Table.DetailRow` (`<tr>` with one cell spanning every column).
  - `Table.Empty`: one row, one cell spanning every column, shown only when there are no rows.
  - `Table.ScrollRegion` `<div>`: `role="region"`, named by the caption (`aria-labelledby`), `tabIndex={0}` only while it overflows, `kv-scroll-region` behaviour. It's the virtualizer's scroll element.
- **Without `table`**, every part is the plain native element with its class, so a small static table needs no TanStack at all.
- **Templates.** Core exports `renderTemplate(template, context)` (a string, or a function called with the context). React renders `header`/`cell` templates through it; no `flexRender` dependency.
- **Name.** `Table.Caption`, or `aria-labelledby` on Root. Without either, `warnOnce` in development.
- **Virtualization** (`virtualize` on): `Table.Body` renders a top spacer, the rendered rows, a spacer for each gap, and a bottom spacer. Spacers are `<tr aria-hidden="true" class="kv-table-spacer"><td colSpan={n}>` with an inline block size. Root gets `aria-rowcount` (header rows plus all body rows) and each rendered row `aria-rowindex`. The row that contains focus is a required index, so it stays mounted (tracked with `focusin`/`focusout` on the body). The scroll padding equals the sticky header's height. `table-layout: fixed` comes from the theme. Virtualization with `rowExpandingFeature`: `warnOnce`, and rows render in full.
- **Sorting.** `enableMultiSort: false` by default. The sort button toggles TanStack's sort cycle. Each change is announced (`sortedAscending`, `sortedDescending`, `sortCleared`) with the column label: the header when it's a string, otherwise the sort button's text.
- **Selection.** The row checkbox is named by a visually hidden `selectRow` text plus the row's header cell (`aria-labelledby`), for example "Select Anna Svensson". With no `rowHeader`, it uses `selectRowNumber` ("Select row 3"). The select-all checkbox is `selectAllRows`, `indeterminate` when some rows are selected. Selected rows get `data-selected`, never `aria-selected`. Toggling select-all announces `selectedCount`.
- **States.** `isLoading` sets `aria-busy="true"` and `data-busy` on Root and announces `loading`. A filter change announces `rowCount`, debounced by 500 ms. An empty row model shows `Table.Empty` with `empty`.

### Accessibility contract (draft)

Virtualization changes no keys. The Listbox, Combobox and Autocomplete contracts gain a "Virtualization" section and rows proving existing keys reach unrendered options.

| Component | Key            | Context           | Action                                                                  |
| --------- | -------------- | ----------------- | ----------------------------------------------------------------------- |
| Listbox   | End            | open, virtualized | Moves to the last option, scrolled into view                            |
| Listbox   | PageDown       | open, virtualized | Moves ten options down, rendered and announced with its position        |
| Listbox   | a letter       | open, virtualized | Typeahead reaches an option that wasn't rendered                        |
| Combobox  | ArrowDown, End | open, virtualized | Same, with `aria-activedescendant` always pointing at a rendered option |

Table: **Focus strategy:** native. **Selection follows focus:** n/a. **Arrows wrap:** n/a. **Shortcuts:** none.

| Key        | Context                      | Action                                                                                    |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| Tab        | before the table             | Moves to the scroll region when it overflows, otherwise to the first control in the table |
| Tab        | in the table                 | Moves through sort buttons, checkboxes, expand buttons and links in reading order         |
| Shift+Tab  | in the table                 | Moves back through the same controls                                                      |
| Enter      | on a sort button             | Sorts by that column, or changes its direction, and announces it                          |
| Space      | on a sort button             | Same as Enter                                                                             |
| Space      | on a row checkbox            | Selects or deselects the row                                                              |
| Space      | on the select-all checkbox   | Selects or deselects every row, and announces the count                                   |
| Enter      | on an expand button          | Shows or hides the row's details                                                          |
| Space      | on an expand button          | Same as Enter                                                                             |
| ArrowDown  | on the focused scroll region | Scrolls the table (native)                                                                |
| ArrowRight | on the focused scroll region | Scrolls sideways (native, flips in RTL)                                                   |
| PageDown   | on the focused scroll region | Scrolls a page (native)                                                                   |

- Roles / ARIA: native `table`, `caption`, `th scope`, `aria-sort` on the sorted column only, native checkboxes, `aria-expanded`/`aria-controls` on expand buttons, `aria-busy`, `aria-rowcount`/`aria-rowindex` when virtualized, `aria-hidden` spacer rows, `role="region"` with a name on the scroll region.
- Focus management: focus is never moved by the table. A focused row stays mounted while virtualized. The sticky header never covers the focused control (2.4.11).
- Announcements: sort, select-all count, loading and filtered row count, through the shared Announcer.
- WCAG SCs: 1.3.1, 1.3.2, 1.4.10 (data tables are exempt, but the region is reachable and scrollable), 1.4.11, 2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.5.8, 4.1.2, 4.1.3.

### i18n strings (`table` namespace)

| Key              | en                                | sv                                    |
| ---------------- | --------------------------------- | ------------------------------------- |
| sortedAscending  | Sorted by {column}, ascending.    | Sorterad efter {column}, stigande.    |
| sortedDescending | Sorted by {column}, descending.   | Sorterad efter {column}, fallande.    |
| sortCleared      | No longer sorted by {column}.     | Inte längre sorterad efter {column}.  |
| selectRow        | Select                            | Välj                                  |
| selectRowNumber  | Select row {index}                | Välj rad {index}                      |
| selectAllRows    | Select all rows                   | Välj alla rader                       |
| selectedCount    | {count} row(s) selected. (plural) | {count} rad/rader markerade. (plural) |
| rowCount         | {count} row(s). (plural)          | {count} rad/rader. (plural)           |
| loading          | Loading rows.                     | Laddar rader.                         |
| empty            | No rows to show.                  | Det finns inga rader att visa.        |
| rowDetails       | Details                           | Detaljer                              |

`rowDetails` replaces ADR-0035's `expandRow`/`collapseRow`: the button's name stays the same and `aria-expanded` carries the state. fi, nb, nn and se get translations (se may start from the English placeholder, as other namespaces do).

### Theming surface

- Classes: `kv-table`, `kv-table-caption`, `kv-table-head`, `kv-table-body`, `kv-table-foot`, `kv-table-row`, `kv-table-column-header`, `kv-table-row-header`, `kv-table-cell`, `kv-table-sort-button`, `kv-table-sort-icon`, `kv-table-select-checkbox`, `kv-table-expand-button`, `kv-table-detail-row`, `kv-table-empty`, `kv-table-spacer`, `kv-table-scroll-region`, and (design spec) `kv-table-expand-icon`, the consumer's `kv-table-column-header--numeric`, `kv-table-cell--numeric`, `kv-table-row-header--numeric`, and `kv-table-visually-hidden`. The select checkboxes also render `kv-checkbox`, and the region `kv-scroll-region`.
- State: `data-sort="ascending|descending"` (sort button and column header), `data-selected`, `data-expanded`, `data-busy`, `data-virtualized` (Root), `data-overflowing` (ScrollRegion). Properties: `--kv-table-scroll-region-max-block-size` (consumer), `--kv-table-head-block-size` (set on the region).
- Listbox: `data-virtualized` on the list, `kv-listbox-virtual-sizer`.
- Default theme per `docs/design/table.md` (ux-designer): sticky header in a scroll region, `table-layout: fixed` when virtualized, compact density, forced-colours borders.

## Tasks

Phase 0 (orchestrator)

- [x] ADR-0059, this plan, ADR index and status lines (0034 superseded; 0035 and 0037 amended)
- [x] AGENTS.md rule 6, `docs/architecture.md`, `docs/vision.md`
- [x] Catalog pins, `@kvirn-ui/core` dependencies, lint boundaries, `pnpm install`

Phase 1 (parallel)

- [x] **Virtualization** (component-engineer A): `core/src/virtual/` + unit tests; Listbox, Combobox and Autocomplete `virtualize`; component tests; `Virtualized` stories (10 000 options); e2e rows; contracts and `*.md` docs
- [x] **Table design spec** (ux-designer): `docs/design/table.md`
- [x] **Table core and React** (component-engineer B): `core/src/table/` (`createTable`, `createLocaleSortFn`, `renderTemplate`, curated re-exports) + unit tests; `useTable` and parts; i18n in six locales; component tests with axe; `table.a11y.md`; `table.md`

Phase 2

- [x] **Table theme, stories and e2e** (component-engineer B): theme section per the spec; stories (Static, Sortable, Selectable, Expandable, Empty, Loading, Paginated recipe, Virtualized 10 000 rows, NarrowScreen, RightToLeft, ForcedColors, Keyboard) with `parameters.a11yContract`; `table.e2e.ts`, one test per Keyboard row

Phase 3 (orchestrator)

- [ ] Gates, scoped then whole tree; accessibility-reviewer; ux-designer design review of the stories
- [x] Roadmap rows, changesets, plan ticked

## Risks & open questions

- **`aria-activedescendant` in virtualized lists** has known VoiceOver and TalkBack gaps (ADR-0037). Manual AT pending.
- **`aria-rowcount` support** varies; NVDA and JAWS report it, VoiceOver partly. Manual AT pending.
- **TanStack v9 type depth.** Re-exported generic types may slow type-checking. Measure `vp check` time before and after.
- **`use-popup.ts` measurement** sets the popup's max height from its natural height. With the sizer, the natural height is the total size, which the existing `--kv-popup-height-limit` clamps. Verify the popup opens at the right size.
- **Sticky header and `scroll-padding`**: if the header's height changes (wrapping), the padding is re-measured with a `ResizeObserver` through the Env.

## Testing strategy

- Core: virtualizer range with required indexes far outside the window, segments sum to the total size, `setOptions` with a changed count; `createTable` defaults, store adapter, locale sort (å after z in `sv`, `fi`, `nb`).
- Component (Vitest browser + axe): every story state; options' `aria-setsize`/`aria-posinset`; `aria-activedescendant` resolves to an element after End; table names, `aria-sort` on one column only, checkbox names, `data-selected` without `aria-selected`, announcements, empty and busy.
- e2e (chromium): every Keyboard row; RTL rows for the scroll region; the 10 000-item lists and table.
- Existing `LongList` tests that count 300 mounted options stay as they are: they don't turn on `virtualize`.

## Rollout

Minor bumps for `core`, `react`, `i18n` and `theme`. Table and virtualization ship as `alpha`. No migration: `virtualize` is new and off by default.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT is `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
