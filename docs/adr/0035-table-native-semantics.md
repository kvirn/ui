# ADR-0035: Table renders a native `<table>`, with TanStack Table bindings and opt-in row virtualization

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for a table component used with TanStack Table, and TanStack Virtual for large data. The details below are proposed and open to change.
- **Tags:** api, a11y, i18n, theming

## Context

Public-sector services show tabular data everywhere: case lists, payments, decisions, statistics. Adopters already use TanStack Table for the data model (ADR-0034). What goes wrong is the markup:

- `<div>` grids without table semantics, so screen readers can't navigate by row and column or announce headers.
- `display: grid` or `display: block` on `<table>` elements, which makes some browsers drop the table semantics. TanStack Virtual's table examples do this.
- `role="grid"` on read-only data, which turns off the screen reader's table navigation and adds a keyboard model users don't expect.
- Sort controls as clickable `<th>` without a button, and `aria-sort` changes that are never announced.
- Selection checkboxes all named "Select" or not named at all.
- `aria-selected` on table rows, which ARIA 1.2 only allows in `grid` and `treegrid`.

The roadmap has no Table yet. The APG has a Table pattern and a Sortable Table example, and a separate Grid pattern for interactive widgets.

## Decision drivers

- Native semantics first (hard rule 2): `<table>`, `<caption>`, `<th scope>`.
- Works with a TanStack Table instance, and also without one, for a small static table.
- Large data stays usable for keyboard and screen-reader users (ADR-0034, item 5).
- Reflow at 320px (1.4.10) without breaking table semantics.
- All strings in six locales (ADR-0007).

## Options considered

### Option A: native `<table>` parts, plus TanStack bindings (chosen)

- ✅ Screen-reader table navigation, header announcement and row and column counts work out of the box.
- ✅ Interactive content in cells (links, buttons, checkboxes) stays in the normal tab order, as users expect on a web page.
- ❌ A table with many interactive cells has many tab stops.

### Option B: APG Grid (`role="grid"`) with roving focus

- ✅ One tab stop, and arrow-key cell navigation.
- ❌ Overrides screen-reader table reading for read-only data, and needs a keyboard model most web users don't know. Only right for spreadsheet-like editing. Rejected for now; a future DataGrid needs its own ADR.

### Option C: cards on small screens (`display: block` on cells)

- ❌ Drops table semantics in some browsers. Rejected. Consumers who want cards on small screens render a list for that breakpoint.

## Decision

We will use Option A:

1. **Parts.** `Table.Root` (`<table>`, `kv-table`), `Table.Caption` (`<caption>`), `Table.Head` (`<thead>`), `Table.Body` (`<tbody>`), `Table.Foot` (`<tfoot>`), `Table.Row` (`<tr>`), `Table.ColumnHeader` (`<th scope="col">`), `Table.RowHeader` (`<th scope="row">`), `Table.Cell` (`<td>`), `Table.SortButton` (`<button>` inside a column header), `Table.SelectCheckbox` (native checkbox) and `Table.Empty` (one row with a cell spanning every column). Each part is also a named export. The hook is `useTable()`. Exact names are settled in the plan.
2. **Native display is never changed.** The theme and the virtualization never set `display` on table elements. Without it, nothing needs explicit `role="table"`, `row` or `cell`.
3. **A name is required.** `Table.Caption`, or `aria-labelledby` on Root pointing at a visible heading. Without one, a development warning is logged. Each row should have a row header (`Table.RowHeader`) for the column that identifies the row, such as the name or case number.
4. **Sorting** follows the APG Sortable Table example:
   - The column's header text is inside a `<button>`. The sort icon is decorative (`aria-hidden`), and its direction is also shown with `data-sort="ascending|descending"`.
   - `aria-sort` is set only on the column that's currently sorted. With multi-sort, it goes on the primary column, and the caption or a status says the rest.
   - Changes are announced through the shared Announcer: `table.sortedAscending` / `table.sortedDescending` ("Sorted by Name, ascending"), because `aria-sort` changes aren't reliably announced.
5. **Row selection** uses native checkboxes in the first cell:
   - Each checkbox is named by a visually hidden `table.selectRow` text plus the row header, through `aria-labelledby` ("Select Anna Svensson").
   - The header checkbox is `table.selectAllRows`, with `indeterminate` when some rows are selected. Whether "all" means this page or every row is the consumer's choice, and the message says which.
   - Selected rows get `data-selected` for styling, never `aria-selected` (not allowed on `row` in a table).
   - The selected count is announced when it changes from the header checkbox ("12 rows selected").
6. **Expandable rows** use a disclosure button (`aria-expanded`, `aria-controls`) in the row. The detail is the next row, with one cell spanning every column. `aria-level` is not used, because it's only allowed in `treegrid`.
7. **States.** Loading sets `aria-busy="true"` on Root and announces `table.loading`. An empty result renders `Table.Empty` with `table.empty` ("No rows to show"), which the consumer overrides with something useful. Filtering announces the new row count, debounced (`table.rowCount`, plural).
8. **TanStack bindings** in `@kvirn-ui/react/tanstack-table` (ADR-0034): `const dataTable = useDataTable(table)` returns prop getters (`getColumnHeaderProps(header)`, `getSortButtonProps(header)`, `getRowProps(row)`, `getSelectCheckboxProps(row)`, `getSelectAllCheckboxProps()`, `getExpandButtonProps(row)`). They read sorting, selection and expansion from the instance and call its handlers. The consumer still renders cells with `flexRender`.
9. **Virtualization is opt-in, by rows only.** With a `virtualizer` on `Table.Body`:
   - Rows outside the range are replaced by one spacer row at the top and one at the bottom (`<tr aria-hidden="true">` with a height), so table layout and semantics stay native. No absolute positioning.
   - Root gets `aria-rowcount` (all rows, including header rows), and every rendered row gets `aria-rowindex`.
   - The header stays in the DOM and is sticky. `scroll-padding-top` on the scroll container keeps a focused row from being hidden under it (2.4.11).
   - Column widths are fixed (`table-layout: fixed`, from the column sizes) so the columns don't jump while scrolling.
   - A row that contains focus stays rendered (ADR-0034, item 5).
   - Column virtualization is out of scope.
10. **Pagination** is the recommended default for large data. Each page is its own table without `aria-rowcount`; the caption or a status says "Rows 21–40 of 312". The Pagination component (M3) provides the controls.
11. **Narrow screens.** Root goes inside a ScrollArea (ADR-0036), which is focusable and named after the caption, so it can be scrolled with the keyboard. 1.4.10 exempts data tables that need two dimensions, but the table must still be reachable and scrollable.
12. **Out of scope until a plan needs them:** column resizing (needs a keyboard and single-pointer alternative, 2.5.7), column reordering by drag, editable cells, and `role="grid"`. Column visibility is the consumer's, built from Popover and CheckboxGroup.
13. **Styling hooks.** Classes `kv-table`, `kv-table-caption`, `kv-table-row`, `kv-table-column-header`, `kv-table-row-header`, `kv-table-cell`, `kv-table-sort-button`, `kv-table-empty`. State as `data-sort`, `data-selected`, `data-expanded`, `data-busy`. Sticky header and pinned columns keep a visible border in forced colours, not only a shadow.

## Accessibility impact

- 1.3.1, 4.1.2: native table, caption, column and row headers. Selection and sort state in native controls and `aria-sort`.
- 4.1.3: sort, selection count, loading and filtered row count are announced through the Announcer, with strings from i18n.
- 2.4.11: the sticky header and pinned columns never cover the focused element.
- 1.4.10: horizontal scrolling inside a named, focusable ScrollArea.
- 2.5.8: sort buttons and checkboxes are at least 24×24px.
- Virtualization: `aria-rowcount` and `aria-rowindex` keep the size and position known. Support differs between screen readers, so the manual AT run checks it.
- No APG deviation: Table and the Sortable Table example. Grid is deliberately not used.

## Consequences

- Positive: TanStack's data features with correct table semantics and announcements, and the same parts for a small static table.
- Negative / trade-offs:
  - Spacer rows need a fixed table layout, so content-sized columns aren't available when virtualized.
  - Many interactive cells mean many tab stops. Docs recommend one link per row (in the row header) and actions in a row menu.
  - i18n keys to add in all six locales: `table.sortedAscending`, `table.sortedDescending`, `table.selectRow`, `table.selectAllRows`, `table.selectedCount`, `table.rowCount`, `table.loading`, `table.empty`, `table.expandRow`, `table.collapseRow`.
- Follow-ups: plan with the accessibility contract (`table.a11y.md`) and a design spec for the default-theme table (density, zebra rows or not, sticky header, sort icon). Roadmap row: Table, APG Table, M3.

## Validation

- Component tests: names, headers, `aria-sort` on one column only, checkbox names, `data-selected` without `aria-selected`, empty and busy states, announcements, and axe in every state.
- e2e: sorting and selection by keyboard, a focused row surviving virtual scroll, `aria-rowindex` on rendered rows, the sticky header not covering focus, and the forced-colors, RTL and 320px projects.
- Manual AT (pending): table navigation, header announcement, sort announcement and row count in NVDA, JAWS, VoiceOver and TalkBack, with and without virtualization.

## References

- WAI-ARIA APG: Table pattern, Sortable Table example, Grid pattern
- WAI-ARIA 1.2: `row` (`aria-selected` only in grid and treegrid), `aria-rowcount`, `aria-rowindex`
- Adrian Roselli, "Tables, CSS Display Properties, and ARIA" and "Sortable Table Columns"
- GOV.UK Design System: Table
- ADR-0007, ADR-0034, ADR-0036
