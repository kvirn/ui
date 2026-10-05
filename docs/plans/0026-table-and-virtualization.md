# Plan 0026: Table, and virtualized Listbox, Combobox and Autocomplete

- **Status:** In progress
- **Owner:** Maintainer, with component-engineer and ux-designer
- **Created:** 2026-10-03 · **Target:** M3 (Table), M2 follow-up (virtualization)
- **Related:** design spec `docs/design/table.md`

## Goal

People using public-sector services can read, sort and select rows in a data table with any assistive technology, and pick from lists of thousands of options without the page slowing down, while screen readers still know how big the list is and where they are in it.

## Non-goals

- `role="grid"`, cell-by-cell arrow navigation and editable cells (a future DataGrid needs its own decision).
- Column resizing, column reordering by drag, column virtualization, and pinned columns.
- A Pagination component (M3, its own plan). Pagination works through TanStack's feature, and a story shows the recipe.
- ScrollArea. `Table.ScrollRegion` covers the table's need until it exists.
- Virtualized groups in Listbox, expansion combined with virtualization in Table, and multi-sort.
- Virtualizing the touch-native `<select>` rendering of Listbox.

## Background

- APG: Table pattern and Sortable Table example; Listbox and Combobox patterns.
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
- **Parts**, each one element, each a named export, `render` prop as everywhere:
  - `Table.Root` `<table>`, `Table.Caption` `<caption>`, `Table.Head` `<thead>`, `Table.Body` `<tbody>`, `Table.Foot` `<tfoot>`, `Table.Row` `<tr>`.
  - `Table.ColumnHeader` `<th scope="col">`: with `header`, sets `colSpan` and `aria-sort`, and renders the header template when it has no children.
  - `Table.RowHeader` `<th scope="row">` for static tables.
  - `Table.Cell`: with `cell`, renders `<th scope="row">` for the `rowHeader` column and `<td>` otherwise, and renders the cell template when it has no children.
  - `Table.SortButton` `<button type="button">`: the header text plus a decorative sort icon (`aria-hidden`), `data-sort`.
  - `Table.SelectCheckbox`, `Table.SelectAllCheckbox`: native `<input type="checkbox">`.
  - `Table.ExpandButton` `<button type="button" aria-expanded aria-controls>`, and `Table.DetailRow` (`<tr>` with one cell spanning every column).
  - `Table.Empty`: one row, one cell spanning every column, shown only when there are no rows.
  - `Table.ScrollRegion` `<div>`: `role="region"` named by the caption (`aria-labelledby`) only while it overflows, or always with `region="always"` (decision 2026-10-04); a plain `<div>` otherwise. `tabIndex={0}` only while it overflows, in both modes, `kv-scroll-region` behaviour. It's the virtualizer's scroll element.
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

- Roles / ARIA: native `table`, `caption`, `th scope`, `aria-sort` on the sorted column only, native checkboxes, `aria-expanded`/`aria-controls` on expand buttons, `aria-busy`, `aria-rowcount`/`aria-rowindex` when virtualized, `aria-hidden` spacer rows, `role="region"` with a name on the scroll region while it overflows (always with `region="always"`).
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

`rowDetails` replaces the earlier `expandRow`/`collapseRow`: the button's name stays the same and `aria-expanded` carries the state. fi, nb, nn and se get translations (se may start from the English placeholder, as other namespaces do).

### Theming surface

- Classes: `kv-table`, `kv-table-caption`, `kv-table-head`, `kv-table-body`, `kv-table-foot`, `kv-table-row`, `kv-table-column-header`, `kv-table-row-header`, `kv-table-cell`, `kv-table-sort-button`, `kv-table-sort-icon`, `kv-table-select-checkbox`, `kv-table-expand-button`, `kv-table-detail-row`, `kv-table-empty`, `kv-table-spacer`, `kv-table-scroll-region`, and (design spec) `kv-table-expand-icon`, the consumer's `kv-table-column-header--numeric`, `kv-table-cell--numeric`, `kv-table-row-header--numeric`, and `kv-table-visually-hidden`. The select checkboxes also render `kv-checkbox`, and the region `kv-scroll-region`.
- State: `data-sort="ascending|descending"` (sort button and column header), `data-selected`, `data-expanded`, `data-busy`, `data-virtualized` (Root), `data-overflowing` (ScrollRegion). Properties: `--kv-table-scroll-region-max-block-size` (consumer), `--kv-table-head-block-size` (set on the region).
- Listbox: `data-virtualized` on the list, `kv-listbox-virtual-sizer`.
- Default theme per `docs/design/table.md` (ux-designer): sticky header in a scroll region, `table-layout: fixed` when virtualized, compact density, forced-colours borders.

## Tasks

Phase 0 (orchestrator)

- [x] The bundling decision, this plan and status lines
- [x] AGENTS.md rule 6, `docs/architecture.md`, `docs/vision.md`
- [x] Catalog pins, `@kvirn-ui/core` dependencies, lint boundaries, `pnpm install`

Phase 1 (parallel)

- [x] **Virtualization** (component-engineer A): `core/src/virtual/` + unit tests; Listbox, Combobox and Autocomplete `virtualize`; component tests; `Virtualized` stories (10 000 options); e2e rows; contracts and `*.md` docs
- [x] **Table design spec** (ux-designer): `docs/design/table.md`
- [x] **Table core and React** (component-engineer B): `core/src/table/` (`createTable`, `createLocaleSortFn`, `renderTemplate`, curated re-exports) + unit tests; `useTable` and parts; i18n in six locales; component tests with axe; `table.a11y.md`; `table.md`

Phase 2

- [x] **Table theme, stories and e2e** (component-engineer B): theme section per the spec; stories (Static, Sortable, Selectable, Expandable, Empty, Loading, Paginated recipe, Virtualized 10 000 rows, NarrowScreen, RightToLeft, ForcedColors, Keyboard) with `parameters.a11yContract`; `table.e2e.ts`, one test per Keyboard row

Phase 3 (orchestrator)

- [x] Scoped gates, 2026-10-04: `vp check` clean; `vp test` 94 component + 56 story tests (axe in four themes) and `tooling/component-naming`; e2e chromium table 32/32, listbox 116, combobox 85, autocomplete 72
- [x] accessibility-reviewer: APPROVE on re-review, 2026-10-04 (after the fixes in the review section below)
- [ ] Whole-tree gates; ux-designer design review of the stories
- [x] Roadmap rows, changesets, plan ticked

## Risks & open questions

- **`aria-activedescendant` in virtualized lists** has known VoiceOver and TalkBack gaps. Manual AT pending.
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

- [x] All quality gates in AGENTS.md pass (manual AT is `pending`): 2026-10-05, `vp check`, the scoped tests of core, i18n, the Table, the three list components and their stories, `i18n:check`, `theme:check`, and the table, combobox and autocomplete e2e on chromium (listbox: the virtualization tests; the listbox stories and spec were being edited in another session). The ux-designer review of the stories is still open
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated

## Review 2026-10-04

The accessibility review of this plan returned findings. Fixed:

- **2.4.11, static region.** A `Table.ScrollRegion` without `table` never measured its head, so `--kv-table-head-block-size` was unset while the theme makes `.kv-table-head` sticky in every `.kv-table-scroll-region`. The region now measures its own `<thead>` with a `ResizeObserver` and sets the variable (`table.tsx`, `useStickyHeadSize`), as `useTable` does for a region with `table`. New story `StaticScrolling` (a static, height-limited table with a link in each row) and e2e `the sticky head never covers a focused link in a static table (2.4.11)`. `table.a11y.md` and `docs/design/table.md` §6.18 #2 say the region sets the variable with or without `table`.
- **2.4.3, virtualized Tab row.** The e2e test that the contract cites for the virtualized Tab row now presses Tab after scrolling (focus goes to a control in the rows in view, not `body`) and Shift+Tab. Decision: the kept-alive row is released once focus has left it (the body's `onBlur` clears the required index only when focus leaves the body, and `onFocus` of the next row replaces it), so Shift+Tab goes to the previous control that is rendered (the checkbox of the row above, in the rows in view), not back to the unmounted row. Verified in the e2e run on 2026-10-04. The contract row says so.
- **Rule 13, CSS values.** Deleted: the spacer `style.blockSize`, the region's `--kv-table-head-block-size` and the column `inlineSize` tests in `table.test.tsx`, and the sizer `style.blockSize` assertion in `listbox-virtual.test.tsx`. The behaviour is proved by `scrolling to the end renders the last rows with the right aria-rowindex` and by the e2e tests.
- **Rule 13, each fact once.** Keyboard rows live in e2e only; deleted the component duplicates (table: Enter and Space on sort, Space on a row checkbox, Space on select-all, Enter and Space on expand, focused row stays mounted, both scroll-region Tab-stop tests; listbox: End, Home, PageDown, typeahead; combobox: ArrowUp, PageDown, typing filters; autocomplete: ArrowUp, PageDown, typing narrows). The three part-class tests of `table.test.tsx` are one. The 2.5.8 checkbox size is asserted once, in the `Selectable` story.
- **Region name (non-blocking).** With `table` but no `Table.Caption`, the region's `aria-labelledby` pointed at a missing id and the "no name" warning did not fire. `useTable` now leaves `aria-labelledby` out while no caption is in the document, and `Table.ScrollRegion` warns after commit when neither `aria-label` nor an `aria-labelledby` that resolves names it. `TableScrollRegionPartProps['aria-labelledby']` is optional.

Follow-ups (open):

- [x] Expand-button name fallback when there is no `rowHeader`: the name is `table.rowDetailsNumber` ("Details row 3", a new message in six locales), which starts with the visible text (2.5.3). Your own children or your own `aria-label` replace it (2026-10-05).
- [x] `aria-rowindex` on a header row without `headerGroup` (numbered by its place in the head) and on footer rows (after every other row), and `aria-rowcount` counting the rows of `Table.Foot`. New on the hook: `footProps` and `footRowOffset` (2026-10-05).
- [x] Pass `scrollMargin` (how far the first row is from the start of the region: the caption and the head) to the virtualizer. `createListVirtualizer` gets a `scrollMargin` option; item offsets and segments stay relative to the list, and `useTable` measures the body's place (not the head's, which moves while it is sticky) (2026-10-05).
- [x] A forced-colours assertion for the sticky head's line: the e2e emulates forced colours itself, so it runs in the baseline project and needs no sweep. It asserts the line is drawn and is not the colour of the head's fill (2026-10-05).
- [x] The `fits: bottom <= innerHeight` assertions in the listbox, combobox and autocomplete e2e (virtualization window tests): kept, with the rationale in a comment at each. They assert a WCAG threshold (the popup stays inside the viewport, so no option is out of reach, 1.4.10 and 2.4.11), not a value of the theme (2026-10-05).
- [x] Maintainer decision: is `Table.ScrollRegion` a named region always, or only while it overflows? Decided 2026-10-04: a region only while it overflows, by default; `region="always"` makes it always one. (Maintainer: "you should be able to choose and explicit is nice, but region scroll=true is fine".) Done below under "Scroll region as a region only while it overflows".
- [x] Approved by the maintainer 2026-10-04: the `ed91091` Stop-hook removal and the `.claude/settings.json` worktree permissions (a gate change outside this plan).
- [x] Accepted by the maintainer 2026-10-04: the virtualized Tab trade-off: rows between the kept row and the rows in view can't be reached by Tab until the user scrolls (documented in the contract; an accessibility trade-off per AGENTS.md).
- [x] Ids are looked up through the element's own root (`getRootNode()`, the internal `hasElementWithId`), so a caption inside a shadow root is found (2026-10-05).
- [x] `useStickyHeadSize` watches the region with a `MutationObserver` and measures a head that is added later. New story `StaticLateHead` and an e2e test that fails without it (2026-10-05).
- [x] `table.md` ~199: say how to name a region with no `table` or no caption (`aria-labelledby` or `aria-label`), matching the new warning. Done in the Narrow screens section (2026-10-04).

### Scroll region as a region only while it overflows (2026-10-04)

Maintainer decision: "you should be able to choose and explicit is nice, but region scroll=true is fine". The code rendered `role="region"` on every `Table.ScrollRegion`, which the accessibility skill §8 and the overlays-and-lists skill disagreed with. Now:

- **Default:** a named `role="region"` (`aria-labelledby` the caption, or the consumer's own name) only while the table overflows, with `tabIndex=0` and `data-overflowing`. When it fits it is a plain `<div>`: no role, no name, no `tabindex`. A page of short tables doesn't list an empty landmark for each (1.3.1).
- **Explicit choice:** `region: 'overflow' | 'always'`, default `'overflow'`, on `Table.ScrollRegion` and as a `useTable` option (the part's prop wins, through the new `getScrollRegionProps(region)`). `'always'` is a named region whether it overflows or not. Being a Tab stop stays overflow-only in both.
- **Name chosen.** `region` after the role it controls, like the `current` prop of Link and the `virtualize` option: a noun for what the part becomes. Options considered: a boolean (`alwaysRegion`, `landmark`): two states today and a boolean leaves no room for a third (`'never'`, for a consumer who wants the plain `<div>` even when it scrolls: not offered, because an unnamed, unfocusable scroll container fails 2.1.1); `landmark`: names the ARIA concept rather than the role and reads oddly beside `role`; `scrollRegion` on `useTable`: repeats the part name, and `scrollRegionProps` already follows it. An enum with a string default also matches `virtualize`.
- **SSR and first render.** `useScrollOverflow` starts `false` and measures in an effect after mount, so the server render and the first client render are the same markup: a plain `<div>` for `'overflow'` and a named region for `'always'` (`'always'` doesn't depend on measuring). The role is added after the first measurement.
- **Dev warning.** "Table.ScrollRegion has no name" now fires only when the element is a region (it overflows or is `'always'`), and is re-checked when the role is added. A table that fits and is unnamed warns later, if it ever overflows.
- **Tests.** Component: a table that fits has no region role and no name; `region="always"` has both; `useTable({ region })` follows the option and `Table.ScrollRegion`'s `region` prop wins over it. The e2e for these were removed in review as duplicates of the `keyboard`-story Tab test and the `Static` and `AlwaysRegion` plays (rule 13). Story plays that expected a region on non-overflowing tables are updated.
- **Docs.** `table.a11y.md` (Roles, Consumer responsibilities, Narrow screens, 1.4.10), `table.md` (Narrow screens, Hook), `docs/design/table.md` (§6.18 tree, naming, a11y annotations) and both skills.
- **Done.** `TableRegion` is exported from `packages/react/src/index.ts`.

### Review of the `region` option, 2026-10-04

- accessibility-reviewer: the logic is correct (names only on a region, the Tab stop only while it overflows, matching markup on the server and the first client render, landmark noise). Three e2e tests repeated the `keyboard`-story Tab test and the `Static` and `AlwaysRegion` plays (rule 13): deleted, and the "no `aria-labelledby` while not a region" fact moved into the `Static` play. overlays-and-lists ~159 corrected for `'always'`. APPROVE once those were done.
- [x] Follow-up: when overflow stops while the region has focus (zoom out, a wider window), it keeps `tabIndex=0` and the role until focus leaves (`useScrollOverflow` tracks the region's own focus) (2026-10-05).
- [x] Follow-up: `AlwaysRegion`'s "Show code" shows the literal `region="always"`: it has its own fixture, `AlwaysRegionPayments` (2026-10-05).

### Staff lists name their table with a Heading (2026-10-05)

Maintainer decision: the staff cases tables ("Öppna ärenden") are titled by a visible `Heading` above the table, with the table and its region named by `aria-labelledby`, instead of a `Table.Caption`. The two small resident tables keep their caption, so both patterns are in the stories. The caption's own look is unchanged. `Heading` sets only the type, so the story class `kv-story-table-title` gives it the cells' inline padding and a gap to the table (`preview.css`).
