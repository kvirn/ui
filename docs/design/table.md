# Design spec: Table, default theme

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-03
- **Plan:** [Plan 0026](../plans/0026-table-and-virtualization.md)
- **Type:** component default styling

The parts, the behaviour and the accessibility contract are decided in the Table decisions and Plan 0026. This spec decides **what the Table looks like** in `packages/theme/theme.css`, so an engineer can write the `kv-table-*` section without guessing. It also lists the few places where the look needs something from the React layer (§6.18) and the decisions the maintainer must take (§9).

What this spec decides, in short:

1. Native table display everywhere, `border-collapse: separate` with `border-spacing: 0`, and one `border-subtle` divider under each row. No zebra stripes, no row hover, no outer frame.
2. Comfortable rows are 48px (12px padding around a 24px line), compact rows are 32px (4px around 24px). Text stays 16px in both densities.
3. Tabular figures across the whole table. A consumer marks a quantity column with the part modifiers `kv-table-column-header--numeric` and `kv-table-cell--numeric`, which align it to the inline end.
4. The sort button fills the header cell. Its icon sits right after the text (before it in a numeric column): `chevron-up` for ascending, `chevron-down` for descending, and a new `sort` icon (both chevrons) for sortable but unsorted.
5. Selected rows are `primary-subtle` behind a checked box: the tick carries the state, the fill helps.
6. Controls inside the table get an inset focus ring, so the sticky header and the scroll region can't clip or cover it. Checkboxes keep their own outer ring.
7. The header sticks inside `Table.ScrollRegion`. It has an opaque fill and a 1px divider, and in forced colours a `Canvas` fill and a `CanvasText` line. It never uses a shadow.

## 1. Brief

- **Users:** both.
  - **Residents** read small static tables: payments they've received, fees, opening hours, decision dates. They come once, often on a phone, sometimes at 400% zoom.
  - **Staff** work in case lists, payment runs and registers all day on a desktop: they sort, select and expand rows, often in compact density, often with the keyboard only.
- **Hardest-case users:**
  1. A resident with low vision at 400% zoom (320 CSS px), checking their housing allowance payments. They see two columns at a time. They must be able to tell the table scrolls, reach the hidden columns with the keyboard, and keep the column names in view.
  2. A case worker who uses a screen reader (NVDA or JAWS) and the keyboard only. They sort by "Received", select twelve cases and open one case's details. They need every control named after its row and every change announced.
  3. A case worker with a hand tremor using a mouse in a compact staff tool. Small checkboxes in dense rows must still be hit on the first try.
  4. A Windows Contrast Themes user. They must see which rows are selected, which column is sorted, where the header ends and where focus is, without the theme's colours.
  5. A Finnish-speaking resident. Headers such as "Hakemuksen vastaanottopäivä" are about twice as long as the English ones and must wrap without breaking the layout.
- **Job to be done:**
  - Resident: when I get a letter or a payment, I want to find the row that's about me and read its figures correctly, so I can check that it's right.
  - Staff: when I start my day, I want to find, order and act on the cases that need me, so I don't miss a deadline.
- **Context:** residents rarely, on any device, sometimes stressed about money or a decision. Staff daily, on a desktop, for hours, so density and keyboard speed matter. The same accessibility bar applies to both.
- **Constraints:**
  - Headless packages ship zero CSS (hard rule 5). The one exception is the layout-critical inline geometry of virtualization.
  - `display` is never changed on table elements.
  - Only DESIGN.md tokens. Every visible or announced string comes from `@kvirn-ui/i18n` (hard rule 4).
- **Success criteria:**
  - Every story has 0 axe violations in all four themes.
  - Sort buttons and checkboxes have targets of at least 44×44px in comfortable density and at least 24×24px in compact density.
  - No page-level horizontal scroll at 320px: only the region scrolls.
  - A focused control is never under the sticky header (2.4.11, checked in e2e).
  - In the usability test (pending), participants identify the sorted column and its direction, and say which rows are selected, without help.
- **Evidence:** none from KvirnUI users. The prior art in §2 is evidence of convention, not of what our users need. Everything else is an assumption.
- **Assumptions and research questions:**
  - Assumption: people read an up chevron as "ascending" (smallest, earliest or A first). → RQ: after sorting, ask participants which row comes first and why.
  - Assumption: the double chevron tells sighted users that a column can be sorted before they try it. → RQ: do participants find "sort by amount" without being told the header is a button?
  - Assumption: the checked box, without a strong row fill, is enough to see which rows are selected. → RQ: after scrolling a selected list, can participants count the selected rows?
  - Assumption: without row hover, staff can still follow a row across a wide table. → RQ: ask staff to read the value in the last column of a named row in a 10-column table, with and without a temporary hover prototype.
  - Assumption: residents at 400% zoom understand that a cut-off table scrolls sideways. → RQ: observe whether they find the hidden columns.

## 2. Prior art

| Source                                                                                                                | What we reuse                                                                                                                                                                                                                                              | What we change and why                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KvirnUI prose tables (`theme.css` §9, `foundations-and-prose.md` §6)                                                  | Body size, `caption-side: top`, caption weight 600 at the start, `surface` head, `border-subtle` dividers, `vertical-align: top` in the body and `bottom` in the head, tabular figures, `display` never changed, the `kv-scroll-region` behaviour          | The first and last columns keep their inline padding: a component table has a filled head, and text flush against its edge looks clipped, and a control's focus ring would be clipped by the region. `separate` borders instead of `collapse`, so the head's line sticks with it. The last body row keeps its divider |
| [APG Sortable Table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)                 | The header text is the button. The icon is `aria-hidden`. Unsorted sortable columns show an icon (the example's optional diamond). The focus indicator covers both the label and the icon                                                                  | A drawn icon from our set instead of characters (▲ ▼ ♢), so it follows the icon registry and forced colours                                                                                                                                                                                                           |
| [GOV.UK Design System: Table](https://design-system.service.gov.uk/components/table/)                                 | Numeric columns as a modifier on the header and the cells (`govuk-table__header--numeric`, `govuk-table__cell--numeric`): end-aligned, tabular figures. Captions at the start. No zebra stripes. A small table on a resident page needs nothing but markup | Our modifiers are named after our parts (`kv-table-column-header--numeric`, `kv-table-cell--numeric`). We keep 12px inline padding on the first column (GOV.UK aligns flush, but has no head fill)                                                                                                                    |
| [MOJ Pattern Library: Sortable table](https://design-patterns.service.justice.gov.uk/components/sortable-table/)      | Sorting on top of the GOV.UK table, `aria-sort` on the sorted column                                                                                                                                                                                       | –                                                                                                                                                                                                                                                                                                                     |
| [Designsystemet (NO): Table](https://designsystemet.no/en/components/docs/table/overview)                             | End-aligned figures with tabular numbers. A sort indicator for none, ascending and descending                                                                                                                                                              | Designsystemet recommends zebra stripes as a reading aid. DESIGN.md says no zebra: stripes compete with the selected fill and turn into noise in compact density. Open question 5 covers the cost for wide tables                                                                                                     |
| Adrian Roselli, "Tables, CSS Display Properties, and ARIA" and "Sortable Table Columns" (cited in the Table decision) | Never change `display` on table elements. Sort buttons inside `th`, with the state in `aria-sort` plus an announcement                                                                                                                                     | –                                                                                                                                                                                                                                                                                                                     |
| KvirnUI Checkbox (`form-fields.md` §6.5), Combobox toggle (`combobox.md` §6.1), `icon.md` §4.1                        | The 24px box, the tick and dash, the states and the forced-colours rules. An inset ring on a flat button that fills its slot (`outline-offset: -2px`). `chevron-up` and `chevron-down` already reserved for sort, and slot 25 held for `sort`              | The checkbox's hit area grows to the row's control size with a pseudo-element, because a table cell has no label to click                                                                                                                                                                                             |

## 3. Flow

A table is not a flow, but each job has steps and unhappy paths.

**Staff: find and act on cases**

1. Tab reaches the scroll region (only when it overflows), then the first control: the select-all checkbox, then the sort buttons in reading order.
2. Enter on "Inkommet" → sorted ascending. The icon changes to a single up chevron, `aria-sort` moves, and "Sorterad efter Inkommet, stigande." is announced. Enter again → descending. Enter a third time → back to unsorted ("Inte längre sorterad efter Inkommet.").
3. Tab into the body → each row's checkbox, expand button and link, row by row. Space selects a row. The row fills with `primary-subtle` behind its tick.
4. Enter on "Detaljer" → the detail row opens under the row. Focus stays on the button.

**Resident: read a payment**

1. The caption names the table ("Utbetalt bostadsbidrag 2026").
2. On a phone at 400%, the region shows the month and the date. The resident scrolls sideways with a swipe, or Tabs to the region and uses the arrow keys, to reach the amount.

**Unhappy paths**

| Condition                                | What the user gets                                                                                                                                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No rows at all                           | The head stays, and one row spanning every column says why, in `text`, at the start: the consumer's message ("Du har inga öppna ärenden.") or `table.empty`                                                                                     |
| A filter leaves no rows                  | The same row, with a message that says what to do ("Inga ärenden matchar sökningen. Ändra sökningen eller rensa filtret."). The new count is announced (`table.rowCount`), debounced                                                            |
| First load, no rows yet                  | The empty row shows the loading text instead of "No rows to show" (decision D3). `aria-busy`, and `table.loading` is announced                                                                                                                  |
| Reload with rows on screen               | Rows stay at full contrast (never dimmed). A static hatched bar runs along the head's lower edge and the body shows the progress cursor. `table.loading` is announced. The consumer should also show the status in words near the table (§6.10) |
| Loading fails                            | The consumer's `Notification.Danger` above the table says what failed and what to do. The table keeps its last rows, or shows the empty row with the consumer's message. The table has no error state of its own                                |
| Too many rows                            | Pagination is the recommended default. Virtualization only when people must scroll through everything                                                                                                                                           |
| Wider than the screen                    | Only the region scrolls sideways. It becomes a named region and a Tab stop, and its ring shows on focus                                                                                                                                         |
| Focus goes under the sticky header       | It can't: the region's `scroll-padding-block-start` equals the head's height (§6.11)                                                                                                                                                            |
| Virtualized: the focused row scrolls out | It stays mounted (plan). Nothing visual changes. It comes back into view when it's focused again                                                                                                                                                |
| No theme loaded                          | A native table with browser defaults. Spacer rows still have their height (inline geometry), and the table is correct, only plain                                                                                                               |

## 4. Content

### 4.1 Library strings (`table` namespace, from Plan 0026)

The `fi` column is a **draft for length checks only**. The translator confirms fi, nb, nn and se.

| i18n key                 | en                                | sv                                    | fi (draft, longest)                           | Seen or heard        | Notes                                                                                                                                           |
| ------------------------ | --------------------------------- | ------------------------------------- | --------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `table.sortedAscending`  | Sorted by {column}, ascending.    | Sorterad efter {column}, stigande.    | Lajiteltu sarakkeen {column} mukaan, nouseva. | Announced            | –                                                                                                                                               |
| `table.sortedDescending` | Sorted by {column}, descending.   | Sorterad efter {column}, fallande.    | Lajiteltu sarakkeen {column} mukaan, laskeva. | Announced            | –                                                                                                                                               |
| `table.sortCleared`      | No longer sorted by {column}.     | Inte längre sorterad efter {column}.  | Ei enää lajiteltu sarakkeen {column} mukaan.  | Announced            | –                                                                                                                                               |
| `table.selectRow`        | Select                            | Välj                                  | Valitse                                       | Name (hidden text)   | "Välj Anna Svensson" through `aria-labelledby`                                                                                                  |
| `table.selectRowNumber`  | Select row {index}                | Välj rad {index}                      | Valitse rivi {index}                          | Name                 | Only without a row header                                                                                                                       |
| `table.selectAllRows`    | Select all rows                   | Välj alla rader                       | Valitse kaikki rivit                          | Name                 | –                                                                                                                                               |
| `table.selectedCount`    | {count} row(s) selected. (plural) | {count} rad/rader markerade. (plural) | {count} rivi/riviä valittu. (plural)          | Announced            | –                                                                                                                                               |
| `table.rowCount`         | {count} row(s). (plural)          | {count} rad/rader. (plural)           | {count} rivi/riviä. (plural)                  | Announced            | –                                                                                                                                               |
| `table.loading`          | Loading rows.                     | Laddar rader.                         | Ladataan rivejä.                              | Announced, and shown | Shown in the empty row during a first load (D3)                                                                                                 |
| `table.empty`            | No rows to show.                  | Det finns inga rader att visa.        | Ei näytettäviä rivejä.                        | Shown                | A fallback. The docs tell consumers to replace it with what happened and what to do                                                             |
| `table.rowDetails`       | Details                           | Detaljer                              | Lisätiedot                                    | Shown (button text)  | The expand button's visible text. Its name adds the row header (§7, recommendation R1). Also the hidden text of the expand column's header (R2) |

No new keys are needed for the look. If D3 is rejected, `table.loading` stays announced only.

### 4.2 Consumer copy the docs and stories model

| Where                       | sv                                                                               | en                                                                  | Why                                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Caption, resident           | Utbetalt bostadsbidrag 2026                                                      | Housing allowance paid in 2026                                      | Says what the rows are. Short: a caption as wide as the table can scroll out of view at 320px (open question 3)                 |
| Caption, staff              | Öppna ärenden                                                                    | Open cases                                                          | –                                                                                                                               |
| Paginated caption or status | Öppna ärenden, rad 21–40 av 312                                                  | Open cases, rows 21–40 of 312                                       | The Table decision. Fixture copy until the Pagination component brings its own strings                                          |
| Column header with a unit   | Belopp (kr)                                                                      | Amount (SEK)                                                        | The unit goes in the header once, never in every cell                                                                           |
| Long header (length check)  | Datum då ansökan kom in                                                          | Date the application was received                                   | fi: "Hakemuksen vastaanottopäivä". The header wraps. The sort icon stays on the first line                                      |
| Empty, no data              | Du har inga öppna ärenden.                                                       | You have no open cases.                                             | Says what's true, not "no data"                                                                                                 |
| Empty, after a filter       | Inga ärenden matchar sökningen. Ändra sökningen eller rensa filtret.             | No cases match your search. Change your search or clear the filter. | Says what to do                                                                                                                 |
| A cell with no value        | – (and the column header or a note explains it, e.g. "Ej beslutat")              | – ("Not decided")                                                   | A blank cell reads as "nothing" to a screen reader, or isn't announced at all. Prefer words, such as "Ej beslutat", in the cell |
| Numbers and dates           | `Intl.NumberFormat('sv')` → "12 600", `Intl.DateTimeFormat('sv')` → "2026-03-25" | –                                                                   | `Intl` groups with no-break spaces in sv, fi and nb, so a figure never wraps in the middle                                      |

## 5. Structure

### 5.1 Anatomy

```
div.kv-scroll-region.kv-table-scroll-region   role=region + named by the caption only while it overflows (or always, with region="always"), tabindex=0 only while it overflows
└ table.kv-table                              [data-busy] [data-virtualized]
  ├ caption.kv-table-caption                  "Öppna ärenden"
  ├ thead.kv-table-head                       sticky inside the region
  │ └ tr.kv-table-row
  │   ├ th.kv-table-column-header             └ input.kv-checkbox.kv-table-select-checkbox   (select all)
  │   ├ th.kv-table-column-header             └ hidden "Detaljer" text (R2)
  │   ├ th.kv-table-column-header[aria-sort][data-sort]
  │   │   └ button.kv-table-sort-button[data-sort]  "Namn" + svg.kv-table-sort-icon (aria-hidden)
  │   └ th.kv-table-column-header.kv-table-column-header--numeric
  │       └ button.kv-table-sort-button       svg.kv-table-sort-icon + "Belopp (kr)"   (icon first, visually)
  ├ tbody.kv-table-body
  │ ├ tr.kv-table-spacer (aria-hidden)        virtualized only: an inline block size, nothing visible
  │ ├ tr.kv-table-row[data-selected][data-expanded]
  │ │ ├ td.kv-table-cell                      └ input.kv-checkbox.kv-table-select-checkbox
  │ │ ├ td.kv-table-cell                      └ button.kv-table-expand-button  "Detaljer" + chevron
  │ │ ├ th.kv-table-row-header (scope=row)    └ a.kv-link "Anna Svensson"
  │ │ └ td.kv-table-cell.kv-table-cell--numeric  "12 600"
  │ ├ tr.kv-table-detail-row                  └ td (colspan = all)  consumer content
  │ └ tr.kv-table-empty                       └ td (colspan = all)  "Inga ärenden matchar …"   (only with no rows)
  └ tfoot.kv-table-foot
    └ tr.kv-table-row > th.kv-table-row-header "Totalt", td.kv-table-cell--numeric "12 600"
```

Class names are the plan's ("Theming surface"). This spec adds the numeric modifiers (§6.3) and one icon class for the expand button, `kv-table-expand-icon` (§6.8). §6.18 lists both. The plan's `Table.Empty` is "one row, one cell": the spec assumes the row has `kv-table-empty` and the cell has no class of its own.

### 5.2 Per breakpoint

**320px (resident, comfortable):** the region is as wide as the column. The table keeps its min-content width (the longest word in each column, plus padding), so it's usually wider than the region, and the region scrolls sideways. Headers wrap. Compact density doesn't apply below 64rem, so rows are 48px even inside `kv-compact`.

```
Utbetalt bostadsbidrag 2026          ← caption, at the start, scrolls with the table
┌─────────────────────────────┐╌╌╌╌╌╌╌╌╌╌╌┐
│ Månad      │ Utbetal-  ˄˅  │ Belopp    ╎   ← head: surface fill, 600, wraps, sticks when the region scrolls vertically
│            │ ningsdag      │ (kr)      ╎
├────────────┼───────────────┼───────────╌
│ Januari    │ 2026-01-23    │    1 050  ╎   ← 48px rows, a hairline under each
│ Februari   │ 2026-02-25    │    1 050  ╎
└─────────────────────────────┘╌╌╌╌╌╌╌╌╌╌╌┘
  region edge: the cut-off column is the cue that it scrolls. Tab stop + ring when focused
```

**40rem (resident or staff, comfortable):** the same. Most resident tables fit, so the region isn't a Tab stop.

**64rem and wider, `kv-compact` (staff):** 32px rows, 8px inline padding. The virtualized case list sits in a region limited to `80svh` (§6.11), with the head stuck at the top.

```
Öppna ärenden
┌────┬───────────┬─────────────────┬──────────────┬─────────────┬──────────────┐
│ ⊟  │           │ Namn ˄          │ Ärendenummer │ Inkommet ˄˅ │ ˄˅ Belopp (kr) │  ← sticky head, 32px. ⊟ = select all, mixed
├────┼───────────┼─────────────────┼──────────────┼─────────────┼──────────────┤
│ ☑  │ Detaljer ˅│ Anna Svensson   │ BN 2026-0412 │ 2026-03-02  │       12 600 │  ← selected: primary-subtle behind the tick
│ ☐  │ Detaljer ˄│ Matti Virtanen  │ BN 2026-0415 │ 2026-03-04  │        4 200 │  ← expanded: no divider under it
│    │  Handläggare: … · Beslut: …                                              │  ← detail row
│ ☐  │ Detaljer ˅│ Elle Sara       │ BN 2026-0419 │ 2026-03-05  │          850 │
└────┴───────────┴─────────────────┴──────────────┴─────────────┴──────────────┘
(vertical lines drawn here only to show columns: the theme draws none)
```

Reading order equals Tab order equals visual order: region, select all, sort buttons left to right (right to left in RTL), then each row's checkbox, expand button and link.

## 6. Visual specification

All values are DESIGN.md tokens (`--kv-space-*`, `--kv-color-*`, `--kv-font-*`, `--kv-radius-*`, `--kv-border-width`, `--kv-indicator-width`, `--kv-focus-ring-*`, `--kv-control-min-block-size`, `--kv-choice-size`, `--kv-duration-fast`, `--kv-easing-standard`). Everything is in `@layer kv`, like the rest of the theme.

### 6.1 Parts

| Part (class)                                                        | What the theme draws                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root `kv-table`                                                     | `inline-size: 100%`, `border-collapse: separate`, `border-spacing: 0`, no margin, no outer border or radius. `color: text`, `font-size`/`line-height` of `body`, tabular figures: `font-feature-settings: var(--kv-font-numeric-feature-settings)` on the whole table (head, body and foot). `table-layout: auto`, and `fixed` under `[data-virtualized]` (§6.12) |
| Caption `kv-table-caption`                                          | §6.13                                                                                                                                                                                                                                                                                                                                                             |
| Head `kv-table-head`                                                | `surface` fill. Sticky inside a scroll region (§6.11)                                                                                                                                                                                                                                                                                                             |
| Body `kv-table-body`, Foot `kv-table-foot`                          | No fill: they show what's behind the table (`canvas`, or a card's `surface-raised`)                                                                                                                                                                                                                                                                               |
| Row `kv-table-row`                                                  | Nothing of its own: the cells draw everything, because `tr` backgrounds and borders are unreliable across browsers. States are `data-selected` and `data-expanded` (§6.6, §6.8)                                                                                                                                                                                   |
| Column header `kv-table-column-header`                              | Cell padding (§6.2), `surface` fill, `text`, weight 600, `text-align: start`, `vertical-align: bottom`, a 1px `border-subtle` block-end border. With a sort button inside: padding 0, and the button takes the padding (§6.5)                                                                                                                                     |
| Row header `kv-table-row-header`                                    | Cell padding, `text`, weight 600, `text-align: start`, `vertical-align: top`, the row divider                                                                                                                                                                                                                                                                     |
| Cell `kv-table-cell`                                                | Cell padding, `text`, weight 400, `text-align: start`, `vertical-align: top`, the row divider. `overflow-wrap: break-word` (it doesn't lower the column's min-content width, so auto layout still sizes columns to whole words), no `hyphens`, never truncated or clipped                                                                                         |
| Sort button `kv-table-sort-button`, icon `kv-table-sort-icon`       | §6.5                                                                                                                                                                                                                                                                                                                                                              |
| Select checkboxes `kv-checkbox kv-table-select-checkbox`            | The Checkbox look, plus §6.6. **Both** select parts must also render `kv-checkbox` (§6.18)                                                                                                                                                                                                                                                                        |
| Expand button `kv-table-expand-button`, icon `kv-table-expand-icon` | §6.8                                                                                                                                                                                                                                                                                                                                                              |
| Detail row `kv-table-detail-row`                                    | §6.8                                                                                                                                                                                                                                                                                                                                                              |
| Empty row `kv-table-empty`                                          | §6.9                                                                                                                                                                                                                                                                                                                                                              |
| Spacer row `kv-table-spacer`                                        | §6.12                                                                                                                                                                                                                                                                                                                                                             |
| Scroll region `kv-scroll-region kv-table-scroll-region`             | §6.11                                                                                                                                                                                                                                                                                                                                                             |

**Never** set `display` on `table`, `caption`, `thead`, `tbody`, `tfoot`, `tr`, `th` or `td`, in any media query, density, mode or state. Spacer rows are hidden by having no visible parts, never by `display: none` (that would collapse their height).

### 6.2 Spacing and density

Two internal custom properties on `.kv-table`, stepped down for compact density in the same place and the same way as the card padding (`@media (width >= 64rem) { .kv-compact … }`, after the `:root` declaration):

| Property                         | Comfortable (default) | Compact (`kv-compact`, from 64rem) | Used by                                                            |
| -------------------------------- | --------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| `--kv-table-cell-padding-block`  | `--kv-space-3` (12px) | `--kv-space-1` (4px)               | Every header, row header and cell, the sort button, the detail row |
| `--kv-table-cell-padding-inline` | `--kv-space-3` (12px) | `--kv-space-2` (8px)               | The same, the first and the last column included                   |

These are internal names, like the input group's. Whether to document them as site-wide properties, like `--kv-notification-padding-block`, is open question 6.

Resulting sizes (16px text, line height 1.5, so one line is 24px):

| Measure                            | Comfortable                                            | Compact                       | Rule                                                                                               |
| ---------------------------------- | ------------------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| One-line row (body, head, foot)    | 48px                                                   | 32px                          | Derived from padding. Never a fixed `block-size` (1.4.12): rows grow with wrapped text             |
| Sort button                        | The whole cell: at least 48px high, at least 44px wide | At least 32px high, 32px wide | Block: padding plus a line. Inline: `min-inline-size: var(--kv-control-min-block-size)`            |
| Checkbox box                       | 24×24px (`--kv-choice-size`)                           | 24×24px                       | The Checkbox                                                                                       |
| Checkbox target                    | **44×44px**                                            | **32×32px** (at least 24×24)  | A centred hit area of `--kv-control-min-block-size` (§6.6). Comfortable meets 2.5.5, compact 2.5.8 |
| Expand button                      | 44px high, at least 44px wide                          | 32px high, at least 32px wide | `--kv-control-min-block-size`. Negative block margins keep the row at 48px or 32px (§6.8)          |
| Text to sort icon, text to chevron | 8px (`--kv-space-2`)                                   | 8px                           | Like Button                                                                                        |
| Caption to table                   | 8px (`--kv-space-2`)                                   | 8px                           | Like prose                                                                                         |
| Empty row padding, block           | 24px (`--kv-space-6`)                                  | 16px (`--kv-space-4`)         | §6.9                                                                                               |
| Detail row padding, block end      | 24px (2 × cell padding)                                | 8px                           | §6.8                                                                                               |

Below 64rem a `kv-compact` table is comfortable, like every other compact control (DESIGN.md Density): touch is likely there.

**Text size never drops in compact.** Cell data, headers and the caption stay `body` (16px). `label-compact` is for control labels in staff chrome, and table data is essential content (DESIGN.md: 16px and never smaller for essential content). The expand button's label is a control label but stays 16px too, so it lines up with the row's text.

### 6.3 Typography and numeric columns

- **Families and sizes:** `--kv-font-family-body` (falling back to sans), `body` size and line height everywhere. Weights: 400 in cells, 600 in column headers, row headers, the caption and the foot's row header, 500 in the expand button's label (a control label). No serif: a table is data, not page structure (DESIGN.md Typography).
- **Tabular figures** on the whole table, from `--kv-font-numeric-feature-settings` (`'tnum'`). IBM Plex figures are already tabular, so this is for brand fonts. It applies to every column, so dates and reference numbers line up even when they're start-aligned.
- **Numeric columns: a class modifier, not a `data-*` attribute.** Alignment is a choice the consumer makes per column, not a state (classes style, `data-*` is state). It's the same kind of choice as `kv-input--numeric`.

| Class (consumer adds it)          | On                                                                                         | What it does                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `kv-table-column-header--numeric` | `Table.ColumnHeader`                                                                       | `text-align: end`. Its sort button reverses: the icon goes before the text, so the label's end edge lines up with the figures (§6.5) |
| `kv-table-cell--numeric`          | `Table.Cell` (whether it renders `td` or the row header's `th`), and cells in `Table.Foot` | `text-align: end`                                                                                                                    |
| `kv-table-row-header--numeric`    | `Table.RowHeader` (static tables)                                                          | `text-align: end`. Rare: a row header that is a quantity                                                                             |

- Use it for **quantities people compare**: amounts, counts and percentages. Don't use it for **identifiers and dates**: a case number, a personal identity number or a date stays start-aligned (it's read, not compared by magnitude), and gets tabular figures anyway. This follows GOV.UK.
- **How a consumer applies it.** On a static table, put the class on the header and on each cell of the column. With `useTable`, pass `className` per column: `<Table.Cell cell={cell} className={numericColumns.has(cell.column.id) ? 'kv-table-cell--numeric' : undefined} />`, and the same for the header. A shorthand that reads TanStack's `columnDef.meta` is an API decision for the plan, not the theme (open question 4).
- No `white-space: nowrap`: `Intl` groups digits and separates currency with no-break spaces, so a figure never wraps in the middle, and forced no-wrap would overflow fixed-layout columns.
- **Sentence case** in headers and captions. No all caps (DESIGN.md).

### 6.4 Lines and surfaces

- **The head row** is `surface` on every header cell, and on `thead` itself, so no gap shows. Its block-end border is 1px `border-subtle`.
- **Row dividers:** 1px `border-subtle` on the block-end side of every body cell and row header, **including the last body row**, so the table has an end. The spacer rows have none (§6.12). The foot has no border of its own: the last body row's divider sits above it.
- **Foot:** no fill. The row header ("Totalt") is weight 600, and cells are weight 400 by default. A consumer who wants bold totals uses `<strong>` in the cell.
- **No zebra stripes** (DESIGN.md Tables). **No vertical lines** between columns. **No outer frame.** Columns are separated by their padding and alignment. A table in a card or on the page gets its edge from that container.
- **Why `separate` and not `collapse`:** with `border-collapse: collapse`, the head's border belongs to the grid, not to the sticky cell, and in some engines it scrolls away from the stuck head. With `separate` and `border-spacing: 0`, each cell owns its block-end border, so the head's line moves with the head, and every divider is exactly 1px because only one side is drawn.
- **On a `surface` background** (inside a `Section`), the head's fill disappears. The head still reads through weight 600 and its divider. Recommend a card around a table on a section, so the head fill shows against `surface-raised`.

### 6.5 Sort button

The whole header text is the button, and the button fills the header cell, so the cell is the target.

- **Element:** `button.kv-table-sort-button[type=button]` in `th.kv-table-column-header`. The cell's padding becomes 0 (`.kv-table-column-header:has(> .kv-table-sort-button)`), and the button has the cell padding.
- **Box:** `display: flex`, `align-items: flex-start`, `gap: var(--kv-space-2)`, `inline-size: 100%`, `min-inline-size: var(--kv-control-min-block-size)`, `padding: var(--kv-table-cell-padding-block) var(--kv-table-cell-padding-inline)`, no border, `border-radius: 0` (it fills a square cell), transparent background, `font: inherit` (16px, weight 600, line height 1.5), `color: inherit`, `text-align: start`, `cursor: pointer`. No button depth: it isn't a standalone button, and depth inside a header row would read as a toolbar (the button-depth decision is for `.kv-button` only).
- **Label:** the header text, wrapping normally. The icon stays on the first line.
- **Icon** `svg.kv-table-sort-icon`, `aria-hidden`, always rendered by the component when the column can be sorted:

| State                                     | `data-sort` on button and `th` | `aria-sort` on `th` | Icon (built-in name)                                                            | Icon colour  |
| ----------------------------------------- | ------------------------------ | ------------------- | ------------------------------------------------------------------------------- | ------------ |
| Sortable, not sorted                      | absent                         | absent              | `sort`: a small up chevron above a small down chevron. **New built-in, see D1** | `text-muted` |
| Sorted ascending (A–Ö, 1–9, oldest first) | `ascending`                    | `ascending`         | `chevron-up`                                                                    | `text`       |
| Sorted descending                         | `descending`                   | `descending`        | `chevron-down`                                                                  | `text`       |
| Not sortable                              | –                              | –                   | No button and no icon: plain header text                                        | –            |

- Size `md` (1.25em, 20px next to 16px text), set by the component as an SVG attribute (the theme never sizes icons). The theme sets `flex: none` and `margin-block-start: calc((1lh - 1.25em) / 2)` so the 20px icon is centred on the 24px first line, however many lines the label wraps to.
- The three states differ in **shape** (two small chevrons, one up chevron, one down chevron), so colour is never the only difference (1.4.1). `text-muted` on `surface` is a measured text pair (at least 4.5:1, DESIGN.md), so the unsorted icon also clears 3:1 for graphics (1.4.11), and it stays visible.
- None of the three mirror in RTL: they show vertical direction (icon.md mirroring rule).
- Proposed `sort` drawing for the icon spec, on the 24 grid with the 1.5 stroke: an up chevron `M7 9.5 12 4.5 17 9.5` and a down chevron `M7 14.5 12 19.5 17 14.5`. That's 10 wide, 5 high, 5 apart, centred on 12,12. The engineer checks it against `icon.md` §6.1 (keylines, the 16px legibility check) and that it doesn't equal a Heroicons path.
- **Placement:** right after the text at the inline end (APG, Roselli). In a numeric column (`kv-table-column-header--numeric`), `flex-direction: row-reverse` and `text-align: end`, so the icon comes visually **before** the text and the label's end edge lines up with the figures below it. The DOM order is the same (text, then icon), and the icon is hidden from assistive technology, so the order doesn't change what's read.

**States** (the button):

| State                                                    | Look                                                                                                                                                                                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rest                                                     | Transparent on the head's `surface`, label `text`, icon per the table above                                                                                                                                                       |
| Hover                                                    | `primary-subtle` fill across the cell, the unsorted icon goes to `text`. Not essential (the icon already says "sortable")                                                                                                         |
| Pressed (`:active`)                                      | `primary-subtle`, as hover                                                                                                                                                                                                        |
| Focus-visible (`:focus-visible`, `[data-focus-visible]`) | 2px `focus-ring` outline, **inset**: `outline-offset: calc(-1 * var(--kv-focus-ring-width))`, so the ring lies just inside the cell's edge (see §6.14 for why). Against `surface` or `primary-subtle`, both measured at least 3:1 |
| Sorted                                                   | Only the icon changes (shape and `text` colour). No fill, no weight change (600 already, and a change in weight would shift column widths)                                                                                        |
| Disabled                                                 | Not designed: a column that can't be sorted renders no button                                                                                                                                                                     |

Motion: `background-color` moves over `--kv-duration-fast` with `--kv-easing-standard`, only under `prefers-reduced-motion: no-preference`. The icon swaps, it never rotates.

### 6.6 Selection

**Checkboxes** (`Table.SelectCheckbox`, `Table.SelectAllCheckbox`) render `class="kv-checkbox kv-table-select-checkbox"`, so they get the Checkbox look and every state for free: a 24px box with the `sm` radius, a 1px `border-control` edge, a hover edge in `text`, a `primary` fill with a white tick when checked, a dash when indeterminate (select all, some rows), a dashed edge when disabled, and the outer ring on focus. The table adds:

- **Position:** `margin: 0` (the Checkbox's top margin is for a field row, where it centres on a 44px label line). The table's `vertical-align: top` and the 24px line put the box on the first line of the row.
- **Hit area:** `.kv-table-select-checkbox::after`: `content: ''`, `position: absolute`, `inset: calc((var(--kv-choice-size) - var(--kv-control-min-block-size)) / 2)`. That's −10px in comfortable (a 44×44px target) and −4px in compact (32×32px). The Checkbox is already `position: relative`, and its `::before` is the tick, so `::after` is free. A table cell has no `<label>` to click (the name comes from `aria-labelledby`), so the pseudo-element is the only way to reach the density's target size without growing the visible box. It fits inside the cell's padding (12px inline, 12px block in comfortable, and 8px and 4px in compact), so neighbouring targets never overlap. The e2e target-size test checks it (§6.17).
- **Column width:** `.kv-table-column-header:has(> .kv-table-select-checkbox)` and `.kv-table-cell:has(> .kv-table-select-checkbox)` get `inline-size: calc(var(--kv-choice-size) + 2 * var(--kv-table-cell-padding-inline))` (48px comfortable, 40px compact). In fixed layout, the header's width sets the column (§6.12).

**Selected row** (`tr[data-selected]`):

- Every cell and row header in the row gets a `primary-subtle` fill (DESIGN.md: `primary-subtle` is for "selected rows").
- **The non-colour cue is the checked box** in the row: a filled box with a tick, a shape that unchecked boxes don't have. The fill is a help, not the signal. That's why the fill can be as light as `primary-subtle` (about 1.1:1 against `canvas` in light, too light to carry the state on its own).
- No weight change, no bar, no border change: each would either shift column widths or need a forced-colours exception that adds nothing the tick doesn't already show.
- Text on the fill: `text`, `text-muted`, `link` and `link-hover` on `primary-subtle` are measured pairs. A status word in a cell (`danger`, `success`, `warning` text) on `primary-subtle` is **not measured yet**. Computed by hand from the palette (to be confirmed by `theme:check`): light 5.65, 5.35 and 5.58:1, dark 6.95, 8.44 and 8.43:1, light-contrast 7.26, 8.26 and 9.26:1, dark-contrast 9.23, 10.45 and 10.87:1. All pass. Recommend adding the three pairs to `contrast-requirements.ts` (§6.18).
- Controls in a selected row: `border-control`, `primary` and `focus-ring` on `primary-subtle` are measured at 3:1 or more (DESIGN.md: lowest 3.13:1, `border-control` in dark).
- **Never `aria-selected`** on the row. The state for assistive technology is the checkbox's checked state.

### 6.7 Hover

**Rows have no hover.** A row isn't interactive: only its controls are. A hover fill on a row says "press the row", which does nothing (the DESIGN.md card rule: no hover on things you can't press). It would also compete with the selected fill. Hover belongs to the controls: the sort button and expand button get `primary-subtle`, the checkbox edge goes to `text`, and links thicken their underline.

The reading-aid argument for row hover in wide tables is real, and it's an assumption to test (§1, open question 5).

### 6.8 Expand button and detail row

**Where:** its own narrow column at the **start**, after the checkbox column and before the row header. At 320px the start columns are the ones in view, so the control is reachable without scrolling sideways. The column has a header with the visually hidden `table.rowDetails` text (R2), so it isn't an empty header.

**Expand button** `button.kv-table-expand-button[type=button][aria-expanded][aria-controls]`:

- Flat, like the sort button and the Combobox toggle: no edge, no fill at rest, no depth. It's identified by its visible text and the chevron (both `text`, at least 4.5:1).
- `display: inline-flex`, `align-items: center`, `gap: var(--kv-space-2)`, `min-block-size: var(--kv-control-min-block-size)`, `min-inline-size: var(--kv-control-min-block-size)`, `padding-inline: var(--kv-space-2)`, `border-radius: var(--kv-radius-md)`, transparent background, `color: text`, `font: inherit` with weight 500, `cursor: pointer`.
- `margin-block: calc((1lh - var(--kv-control-min-block-size)) / 2)` (−10px comfortable, −4px compact), so a 44px or 32px button sits in a 48px or 32px row without growing it. It overlaps only the cell's own padding.
- `margin-inline-start: calc(-1 * var(--kv-space-2))`, so its text lines up with the cell's text edge.
- Label: `table.rowDetails` ("Detaljer"), then the chevron `svg.kv-table-expand-icon` (`aria-hidden`, size `md`, `flex: none`). The component swaps the icon: **`chevron-down` when collapsed, `chevron-up` when expanded**, read from its own state. It never rotates (no motion to reduce) and never mirrors.
- States: hover and pressed `primary-subtle`. Focus-visible gives a 2px inset ring (`outline-offset: calc(-1 * var(--kv-focus-ring-width))`, §6.14). Expanded changes only the icon. `aria-expanded` carries the state for assistive technology.

**Expanded row** (`tr.kv-table-row[data-expanded]`): its cells' block-end divider becomes `transparent`, so the row and its details read as one unit. The divider under the detail row closes the unit.

**Detail row** `tr.kv-table-detail-row > td[colspan]`:

- `padding-block: 0 calc(2 * var(--kv-table-cell-padding-block))`, `padding-inline: var(--kv-table-cell-padding-inline)`. The parent row's bottom padding is the gap above.
- No fill, `text`, weight 400, `vertical-align: top`, the 1px `border-subtle` divider below.
- If the parent row is selected, the detail row stays unfilled: the selection belongs to the row with the checkbox. (If the engineer finds the detail row should follow, that's a plan change: it would need `data-selected` from `getDetailRowProps`.)
- The content is the consumer's (often a description list). The cell isn't prose. A consumer who wants prose spacing puts `kv-prose` inside.

### 6.9 Empty row

`tr.kv-table-empty > td[colspan]`:

- `padding-block: var(--kv-space-6)` (24px), and `--kv-space-4` (16px) in compact. `padding-inline: var(--kv-table-cell-padding-inline)`.
- `body` in **`text`**, never `text-muted`: it explains why there's nothing to act on, and it's essential.
- **`text-align: start`**, not centred. In a table wider than its region, a centred message can sit off screen. At the start it's always in view.
- The row divider below, like any row. No icon, no illustration.
- The head stays, so the columns still say what would be there. Behaviour (from the plan, not the theme): the select-all checkbox has nothing to select, so the engineer decides whether it's disabled or not rendered. Both are styled already.

### 6.10 Busy (`[data-busy]` on Root)

**Rows already on screen stay at full contrast.** Never dim them with `opacity` or a muted colour: people keep reading while a sort or a page loads, and dimmed text fails 1.4.3.

- **A static bar:** every `.kv-table-column-header` gets a hatched band along its block-end edge, as a background layer over the `surface` fill: `repeating-linear-gradient(-45deg, var(--kv-color-primary) 0 4px, transparent 4px 8px)`, `background-size: 100% var(--kv-indicator-width)` (4px), at the block end, no repeat. It's the same hatch as an indeterminate FileUpload progress bar (DESIGN.md File upload), so it means "working, with no known end" everywhere. It never moves, in any motion setting (2.2.2). `primary` on `surface` is a measured 3:1 pair. It sits in the head's bottom padding (12px comfortable, 4px compact), so it never touches the label. Because the head is sticky, the bar stays in view while the region scrolls.
- `cursor: progress` on the body.
- **Words carry the state, not the bar.** The announcement (`table.loading`) is for screen-reader users. For sighted users:
  - During a **first load with no rows**, the empty row shows `table.loading` instead of `table.empty` (decision D3, a behaviour change in `Table.Empty`).
  - During a **reload with rows**, the docs tell the consumer to show the status in words near the table, such as in the caption's status line or a `Notification.Info`. A dedicated status part is out of scope (open question 7).
- Forced colours drop gradient backgrounds, so there the head cells' block-end border becomes `dashed` in `Highlight` instead (same 1px width, so nothing moves).

### 6.11 Scroll region and sticky header

`Table.ScrollRegion` renders `div.kv-scroll-region.kv-table-scroll-region` (§6.18): both classes, so it inherits the prose margin rule, the sideways scroll and the ring of `kv-scroll-region`, and the table adds the rest.

| Property                     | Value                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| From `kv-scroll-region`      | `max-inline-size: 100%`, `overflow-x: auto`, `border-radius: var(--kv-radius-sm)` (the head's top corners are rounded by it), and on `:focus-visible` / `[data-focus-visible]` the 2px `focus-ring` outline with a 2px **outer** offset (`Highlight` in forced colours)                                                                                                                                                                        |
| `overflow-y`                 | `auto` (it computes to `auto` anyway once `overflow-x` is `auto`, so set it explicitly for clarity)                                                                                                                                                                                                                                                                                                                                            |
| `max-block-size`             | `var(--kv-table-scroll-region-max-block-size, none)`. **Virtualized** (`:has(> .kv-table[data-virtualized])`): `var(--kv-table-scroll-region-max-block-size, 80svh)`, with `80vh` declared first as the fallback. The virtualizer needs a bounded scroll element. `svh` (the small viewport) doesn't resize when a phone's address bar shows or hides, so the virtualizer doesn't re-measure on every scroll. The property is new: decision D2 |
| `scroll-padding-block-start` | `var(--kv-table-head-block-size, 0px)`: the head's measured height, set inline on the region by `Table.ScrollRegion` (§6.18). Browsers respect it when they scroll a focused element into view, so a control is never left under the stuck head (2.4.11)                                                                                                                                                                                       |

**Sticky head:** `.kv-table-scroll-region .kv-table-head` gets `position: sticky`, `inset-block-start: 0`, `z-index: 1`, and the `surface` fill on the `thead` itself.

- It's on `thead`, not on each `th`, so several header rows (TanStack header groups) stick together.
- `z-index: 1` keeps it above the body's positioned descendants: the checkbox is `position: relative` and would otherwise paint over a stuck head.
- The fill is **opaque**, so rows disappear under the head instead of showing through it.
- The edge between the head and the rows passing under it is the head's 1px `border-subtle` divider (§6.4). **No shadow**, in any theme: DESIGN.md never uses a shadow as a boundary, and the Table decision requires a visible border in forced colours (`CanvasText`, §Modes).
- The head only actually sticks when the region scrolls vertically: when virtualized, or when a consumer sets `--kv-table-scroll-region-max-block-size`. An unbounded region scrolls with the page, and its head scrolls with it, because a sideways-scrolling container is the head's scroll container. That's a CSS limit, documented in `table.md`.

**Overflow edge (decision D5, optional):** when the region overflows, the cut-off column is the only visual cue on systems with overlay scrollbars (macOS, iOS, Android). If the plan adds a `data-overflowing` state on `Table.ScrollRegion` (set together with `tabIndex={0}`), the theme gives the region a 1px `border-subtle` edge while it's present. It's decorative and doesn't identify a control, so `border-subtle` is right, and in forced colours it becomes `CanvasText`. Without D5, there's no edge.

### 6.12 Virtualized (`[data-virtualized]` on Root)

- `table-layout: fixed`. Columns then take their widths from the **first row**, which is the head. The column headers must carry widths from TanStack's column sizes as inline `inline-size` (layout-critical geometry under the Table-bundling decision, §6.18). The select and expand columns get theirs from §6.6 and from their content's minimum (the engineer sets the expand column's size in the fixture: at least the fi label "Lisätiedot" plus the icon and padding, about 9rem). Without widths, fixed layout splits the table evenly, which is wrong but readable.
- The table stays `inline-size: 100%`. If the column widths add up to more, the table is wider and the region scrolls sideways.
- Cells wrap with `overflow-wrap: break-word`. In fixed layout this breaks a word that doesn't fit, rather than letting it overflow into the next column. Never `overflow: hidden` and never an ellipsis (DESIGN.md: no truncation).
- **Spacer rows** `tr.kv-table-spacer` (`aria-hidden`), and their single `td`: `padding: 0`, `border: 0`, transparent background, `font-size: 0`, `line-height: 0`. The block size is the inline style. Nothing is visible in any theme, in forced colours (no border means nothing to force), or when a row above or below is selected. No hover (rows have none anyway). They're never focusable.

### 6.13 Caption

- `caption-side: top`, `text-align: start`, `padding-block-end: var(--kv-space-2)`, `padding-inline: 0` (the text lines up with the head fill's edge), `body` size at weight 600, `text`. It looks the same as a prose caption, so tables look alike in and out of prose.
- No serif and no heading look: the caption names the table. The page's own heading, if any, comes before it.
- It's inside the region, above the head, so it scrolls away vertically while the head stays. Sideways it's as wide as the table: a long caption on a table wider than the region can run past the region's edge at 320px (open question 3). The docs recommend short captions.
- It names both the table and the region (`aria-labelledby`). With `aria-labelledby` on Root instead (a visible heading outside), there's no caption, so the consumer names the region the same way (`aria-labelledby` or `aria-label` on `Table.ScrollRegion`).

### 6.14 Focus rings

| Control                                    | Ring                                                                        | Why                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scroll region                              | 2px `focus-ring`, 2px **outer** offset (existing `kv-scroll-region` rule)   | It sits on the page, like any control                                                                                                                                                                                                                                                                         |
| Sort button                                | 2px `focus-ring`, **inset**, offset `calc(-1 * var(--kv-focus-ring-width))` | It fills its cell. An outer ring would be clipped by the region at the top and the inline edges, and covered by the next sticky header cell's fill. Inset, the ring's 2px lies on the cell's edge, so its area equals a 2px perimeter (2.4.13), against `surface` or `primary-subtle` (measured at least 3:1) |
| Expand button                              | 2px inset, as the sort button                                               | Its negative margins put its edge 2px from the row's edge. An outer ring would cross into the next row, and be clipped at the region's bottom on the last row                                                                                                                                                 |
| Checkboxes                                 | The Checkbox's own: 2px, 2px outer offset                                   | The 4px around the box fits inside the cell's padding in both densities (12px, or 4px block in compact), so it's never clipped or covered                                                                                                                                                                     |
| Links and other consumer controls in cells | Their own (`kv-link`: 2px outer)                                            | Inside the padding, as above. A consumer control that fills its cell should use the inset ring too (documented)                                                                                                                                                                                               |

Every ring is `Highlight` in forced colours. A ring is never replaced by a fill, a shadow or a colour change.

### 6.15 State matrix

| Part           | default                                               | hover                         | focus-visible | active           | disabled                      | loading (`data-busy`)                   | selected (`data-selected`)          | open (`data-expanded`)            | empty                    |
| -------------- | ----------------------------------------------------- | ----------------------------- | ------------- | ---------------- | ----------------------------- | --------------------------------------- | ----------------------------------- | --------------------------------- | ------------------------ |
| Column header  | `surface`, 600, divider                               | –                             | –             | –                | –                             | hatched 4px band at the block end       | –                                   | –                                 | stays                    |
| Sort button    | transparent, icon per §6.5                            | `primary-subtle`, icon `text` | inset ring    | `primary-subtle` | no button                     | works (sorting while busy is allowed)   | –                                   | –                                 | stays                    |
| Body row cells | no fill, divider                                      | **none**                      | –             | –                | –                             | full contrast, `cursor: progress`       | `primary-subtle` fill + checked box | parent row: divider `transparent` | –                        |
| Checkbox       | Checkbox look                                         | edge `text`                   | outer ring    | –                | dashed edge on `surface`      | –                                       | `primary` fill, tick                | –                                 | select all: per §6.9     |
| Expand button  | flat, "Detaljer" + `chevron-down`                     | `primary-subtle`              | inset ring    | `primary-subtle` | not designed (always enabled) | –                                       | –                                   | `chevron-up`                      | –                        |
| Detail row     | –                                                     | –                             | –             | –                | –                             | –                                       | not filled                          | shown, divider below              | –                        |
| Empty row      | –                                                     | –                             | –             | –                | –                             | shows `table.loading` with no rows (D3) | –                                   | –                                 | message in `text`, start |
| Scroll region  | no edge (D5: `border-subtle` edge while it overflows) | –                             | outer ring    | –                | –                             | –                                       | –                                   | –                                 | –                        |

### Modes

- **Dark, light-contrast, dark-contrast:** every colour is a semantic token, so there's nothing theme-specific. In the contrast themes `border-subtle` is `neutral-500` or `neutral-400` (4.68–6.42:1), so the dividers and the head's line get stronger on their own. In dark, `primary-subtle` is `primary-950` on a black canvas: visible, and the tick still carries the state.
- **Forced colours** (`@media (forced-colors: active)`). System colours, set explicitly so nothing depends on a background the browser drops:
  - **Head:** `thead` and its cells `background-color: Canvas` (opaque, so rows still disappear under a stuck head), `color: CanvasText`, block-end border `CanvasText`. That's the visible border the Table decision asks for.
  - **Dividers:** `border-subtle` borders turn into the system line colour on their own. Set the expanded row's divider to `Canvas` explicitly (a `transparent` border would otherwise show as a line).
  - **Sort and expand buttons:** `background-color: ButtonFace`, `color: ButtonText` (the icon is `currentColor`). The system pair guarantees contrast, and `ButtonFace` marks them as buttons. Hover changes nothing (it isn't essential). The inset ring is `Highlight`.
  - **Sorted state:** the icon's shape (one chevron instead of two). The unsorted icon's `text-muted` becomes `ButtonText` like the rest, so only the shape differs, and the shape is enough.
  - **Selected rows:** the fill is dropped. The checked box is a `Highlight` fill with a `HighlightText` tick (existing Checkbox rule), which is the cue.
  - **Busy:** the head cells' block-end border becomes `dashed` in `Highlight` (§6.10).
  - **Focus:** every ring `Highlight`.
  - **Spacers:** nothing to draw.
  - **Overflow edge (D5):** `CanvasText`.
- **RTL:** only logical properties: `padding-inline`, `margin-inline-start`, `text-align: start | end`, `border-block-end`, `inset-block-start`, `inset-inline`. In RTL the caption and text sit on the right, numeric columns on the left (the end), the checkbox and expand columns on the right, and the sort icon to the left of its text (to the right of the text in a numeric column). Chevrons and the `sort` icon don't mirror. The region starts scrolled to the inline start (the browser does this), and ArrowRight and ArrowLeft scroll in reading direction (plan, native).
- **Motion:** only `background-color` on the sort and expand buttons, over `--kv-duration-fast`, under `prefers-reduced-motion: no-preference`. Icons swap and never rotate. The busy hatch is static. No `scroll-behavior: smooth` (the virtualizer's `scrollToIndex` and focus scrolling stay instant). With reduced motion, everything is instant.
- **320px, 400% zoom, text spacing (1.4.12):**
  - The page never scrolls sideways. Only the region does (DESIGN.md Layout's one exception, 1.4.10). The region's `max-inline-size: 100%` needs a parent that can shrink: in a flex or grid parent the consumer sets `min-inline-size: 0` (documented).
  - Headers and cells wrap. Rows grow. No fixed `block-size` on any row or cell.
  - With the 1.4.12 overrides (line height 1.5, letter spacing 0.12em, word spacing 0.16em), the 24px line grows, so rows, the sort button and the hit areas grow with it. The icon offset uses `1lh`, so it stays centred on the first line. The negative margins of the expand button use `1lh` too, so they shrink as the line grows and never pull it out of its row.
  - At 400% the virtualized region is `80svh` tall, about 160px on a 1280×800 screen. That's the head plus one or two rows. Usable, but it's why pagination is the default (open question 2).

### 6.16 Prose

- A `kv-table` inside `kv-prose` keeps the Table look. Add `.kv-table` to prose's list of component parts it leaves alone (margin only, like `.kv-scroll-region` and `.kv-card`), so prose's `:where(th, td)` rules (zero inline padding on the first and last column, `heading` colour on `th`) don't leak in where the Table sets nothing (§6.18).
- A plain `<table>` in prose keeps the prose look. The two are meant to look alike: same caption, same head fill and divider, same type. They differ in the first-column padding and the borders model, both explained in §2.

### 6.17 Stories

Every story runs in the four themes (Vitest projects) and has `parameters.a11yContract` (the Table contract). The fixtures use Swedish copy. The library strings come from i18n.

| Story                       | What it must show                                                                                                                                                                                                                                                                                                                                    | Assertions the play function or e2e should make                                                                                                                                                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Static**                  | Resident table without `useTable`: "Utbetalt bostadsbidrag 2026". Row headers (Månad), a start-aligned date column (Utbetalningsdag), a numeric column (Belopp (kr)) with `kv-table-column-header--numeric` and `kv-table-cell--numeric`, and a `Table.Foot` "Totalt". Comfortable. In a `Table.ScrollRegion` that doesn't overflow at desktop width | Computed `display` is `table`, `table-cell`, `table-row`, `table-header-group` (unchanged). The numeric cell has `text-align: end`. Tabular figures are set. The region has no `tabindex` at 1280px. No `aria-sort` anywhere                                                |
| **Sortable**                | Case list "Öppna ärenden", comfortable. Four sortable columns and one that isn't. Sorted by Namn ascending at first, so one header shows `chevron-up`, the others show `sort`, and the plain header shows no icon. Belopp is numeric, with its icon before the text                                                                                  | `aria-sort` on one `th` only. `data-sort` on that button and its `th`. Every icon `aria-hidden`. Sort button box at least 44×44px. Activating it announces `table.sortedAscending`/`Descending`/`sortCleared`                                                               |
| **Selectable**              | The case list in **`kv-compact`** (a staff tool) at 1280px: two rows selected, so select all is indeterminate. A link in the row header                                                                                                                                                                                                              | Selected rows have `data-selected` and no `aria-selected`. Checkbox names "Välj Anna Svensson". Checkbox box 24×24px, and in e2e a click 4px outside the box still toggles it (the 32×32px hit area). Selected cells have the `primary-subtle` background                   |
| **Expandable**              | The case list, comfortable, with the expand column at the start. One row expanded, with a description list in its detail row                                                                                                                                                                                                                         | `aria-expanded`/`aria-controls` resolve. The expanded row's icon is `chevron-up`. The expanded row's cells have a transparent block-end border. The detail cell spans every column. Button box at least 44×44px                                                             |
| **Empty**                   | A filter that leaves nothing: the head, and the empty row with the consumer's message "Inga ärenden matchar sökningen. Ändra sökningen eller rensa filtret."                                                                                                                                                                                         | The empty cell spans every column, is `text-align: start`, and its colour is `text`. Select all is disabled or absent, as the plan decides                                                                                                                                  |
| **Loading**                 | Two tables: a **reload** with rows (data-busy: the hatched band, rows at full contrast) and a **first load** with no rows (the empty row says "Laddar rader.", if D3 is accepted). Each has its own caption                                                                                                                                          | `aria-busy="true"` and `data-busy` on Root. Body cell colour is the same as when not busy (no dimming). `table.loading` announced once                                                                                                                                      |
| **Paginated recipe**        | 312 rows, 20 a page. Caption "Öppna ärenden, rad 21–40 av 312" (fixture copy). Previous and next `Button`s in a `kv-button-group` under the table, start-aligned, until Pagination exists                                                                                                                                                            | No `aria-rowcount`. Focus stays on the button that changed the page                                                                                                                                                                                                         |
| **Virtualized 10 000 rows** | The case list in `kv-compact`, `virtualize` on, with column sizes. The region is `80svh` and the head is stuck. Spacer rows are invisible                                                                                                                                                                                                            | `table-layout: fixed`. Head `position: sticky`. Spacer cells have 0 padding and border and no background. `aria-rowcount` and `aria-rowindex` correct. In e2e, Tab into a row below the head after scrolling: the focused control's top is below the head's bottom (2.4.11) |
| **NarrowScreen**            | 320px viewport, `fi` locale, with the long header "Hakemuksen vastaanottopäivä". The table is wider than the region. Comfortable, even though the container is `kv-compact` (below 64rem)                                                                                                                                                            | Document `scrollWidth` ≤ `clientWidth` (no page scroll). The region's `scrollWidth` > `clientWidth`, and its `tabIndex` is 0. Its name equals the caption. Rows are 48px. The focus ring is visible on the region                                                           |
| **RightToLeft**             | The Sortable and Selectable fixture with `dir: 'rtl'`                                                                                                                                                                                                                                                                                                | `direction: rtl`. The numeric cell's `text-align` is `end` (computed left). The sort icon is to the left of its text. Icons aren't mirrored (no `data-mirror-in-rtl`). In e2e, ArrowLeft scrolls the region forward                                                         |
| **ForcedColors**            | One table with everything: sorted and unsorted headers, two selected rows, one expanded row, `data-busy`, an overflowing region with a sticky head                                                                                                                                                                                                   | Head background is `Canvas` (computed). Head border colour is `CanvasText`. Sort buttons use `ButtonFace`/`ButtonText`. Checked boxes use `Highlight`. The busy border is dashed. Rings are `Highlight`. The e2e `chromium-forced-colors` project screenshots it            |
| **Keyboard**                | The e2e fixture: comfortable, a region narrower than the table (so it's a Tab stop), select all, two sortable headers, row checkboxes, expand buttons and a link per row. The JSDoc says to try the keys in the contract's table                                                                                                                     | One e2e test per Keyboard row (`table.e2e.ts`)                                                                                                                                                                                                                              |

No new stories beyond the plan's list. Compact density is shown in Selectable and Virtualized, comfortable in the others.

### 6.18 What the theme needs from the React layer and the plan

These aren't theme rules, but the theme can't work without them. Each is small. Items 1–5 are plan amendments for the orchestrator, and 6 is a test change.

1. **`Table.SelectCheckbox` and `Table.SelectAllCheckbox` render `kv-checkbox` as well as `kv-table-select-checkbox`.** Then they get the whole Checkbox look and its forced-colours rules without copying them.
2. **`Table.ScrollRegion` renders `kv-scroll-region` as well as `kv-table-scroll-region`,** and sets `--kv-table-head-block-size` inline (in px) from a `ResizeObserver` on the head, with `table` (measured by `useTable`) and without it (the region measures its own `<thead>`), because the theme makes the head sticky in every `kv-table-scroll-region`. That's the same as the plan's scroll-padding risk, and the same kind of inline geometry property as `--kv-popup-width` in `use-popup.ts`. The theme turns it into `scroll-padding-block-start`.
3. **Column widths when virtualized:** `getColumnHeaderProps(header)` sets `inline-size` inline from `header.getSize()`, only when `virtualize` is on (layout-critical geometry).
4. **New classes:** the numeric modifiers `kv-table-column-header--numeric`, `kv-table-cell--numeric` and `kv-table-row-header--numeric` (consumer-applied, in `table.md` and DESIGN.md Theming), and `kv-table-expand-icon` on the expand button's icon. Add them to the plan's "Theming surface".
5. **Optional, decisions D3 and D5:** `Table.Empty` renders `table.loading` while busy, and `Table.ScrollRegion` sets `data-overflowing`.
6. **`contrast-requirements.ts`:** add `danger`, `success` and `warning` on `primary-subtle` as text pairs (status text in a selected row, §6.6).
7. **Prose:** add `.kv-table` to the component parts that prose leaves alone (§6.16).

### New or changed tokens

**No new colour, spacing, type or radius token.** Two new things need the maintainer's decision:

| Item                                                                                           | Value                                                                                        | Contrast                                                                                                             | Decision                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--kv-table-scroll-region-max-block-size` (site-wide property, like `--kv-popup-height-limit`) | Not set by the theme. The theme reads it with fallbacks: `none`, or `80svh` when virtualized | n/a                                                                                                                  | D2. A component sizing property, not a DESIGN.md token. Add it to DESIGN.md Theming's list of site-wide properties. No decision needed unless the maintainer wants the `80svh` default recorded |
| `sort` built-in icon (slot 25)                                                                 | Two chevrons, drawing in §6.5                                                                | `currentColor`: `text-muted` on `surface` (at least 4.5:1, measured), `text` on `primary-subtle` on hover (measured) | D1. Fills the slot `icon.md` held for it (its open question 4). It changes the icon set's public API: amend the Icon API decision or `icon.md`, as the maintainer prefers                       |

`--kv-table-cell-padding-block`, `--kv-table-cell-padding-inline` and `--kv-table-head-block-size` are internal properties that point at existing tokens (or are measured), not tokens.

**Proposed DESIGN.md wording** (Components → Tables), for when the theme lands. Not applied by this spec:

> **Tables** use `numeric` for figures, `surface` for the header row, `border-subtle` row dividers and no zebra stripes, vertical lines or row hover. Rows are 48px (32px in compact, from 64rem), text stays 16px. Quantities align to the end with `kv-table-column-header--numeric` and `kv-table-cell--numeric`, identifiers and dates stay at the start. Sortable headers are a button filling the cell with a visible indicator in every state: two chevrons (sortable), an up chevron (ascending) and a down chevron (descending), after the text, before it in a numeric column. A selected row is `primary-subtle` behind a checked box. Controls that fill a cell get the inset focus ring. The header sticks inside the table's scroll region with an opaque fill and a 1px line, `CanvasText` in forced colours, never a shadow. `display` is never changed on table elements. The design spec is `docs/design/table.md`.

## 7. Accessibility annotations

Draft input for `packages/react/src/table/table.a11y.md`. The plan's contract table stands, and this adds the visual and naming details.

- **Accessible names (2.5.3: the visible label is in the name):**
  - The table is named by `Table.Caption`, or by `aria-labelledby` on Root pointing at a visible heading. The region is named by the caption too, while it is a region (decision, 2026-10-04: only while it overflows, or always with `region="always"`); with no caption the consumer names it.
  - Sort button: its visible text (the icon is `aria-hidden`).
  - Row checkbox: "Välj" + the row header ("Välj Anna Svensson"), or `selectRowNumber`. Select all: `selectAllRows`.
  - **R1 (recommendation): the expand button is named like the checkbox,** `aria-labelledby` = [its own text, the row header] → "Detaljer Anna Svensson". Today every expand button would be called "Detaljer", which is ambiguous in a list of buttons (2.4.6) and in a screen reader's list of controls. The visible text comes first, so 2.5.3 holds. It needs no new string.
  - **R2: the expand column has a header** with the visually hidden `table.rowDetails` text, so the column isn't an empty header. The select column's header holds select all. If a consumer leaves select all out, that header gets the visually hidden `table.selectRow`.
- **Roles and native elements:** as in the plan (native `table`, `caption`, `th scope`, `aria-sort` on the sorted column only, native checkboxes, `aria-expanded` and `aria-controls`, `aria-busy`, `aria-rowcount` and `aria-rowindex` when virtualized, `aria-hidden` spacer rows, `role="region"` on the scroll region while it overflows, or always with `region="always"`). The look adds no roles. `data-selected`, `data-sort`, `data-expanded`, `data-busy` and `data-virtualized` are styling only.
- **Keyboard** (plan, unchanged):
  - **Focus strategy:** native. **Selection follows focus:** n/a. **Arrows wrap:** n/a. **Shortcuts:** none.
  - **Tab stops, in order:** the scroll region (only while it overflows), select all, each sort button from the inline start, then for each row its checkbox, expand button and the consumer's links or buttons. The expand column at the start keeps this order equal to the visual order.
  - Keys: Enter and Space on a sort button (sort, announce), Space on the checkboxes, Enter and Space on an expand button, and the native scroll keys on the focused region (ArrowRight and ArrowLeft flip in RTL). One e2e test per row.
- **Focus moves:** none. The table never moves focus. Sorting keeps focus on the sort button, expanding on the expand button, and selection on the checkbox. Paging (recipe) keeps focus on the page button.
- **Focus visibility (2.4.7, 2.4.11, 2.4.13):** the rings in §6.14. The region's `scroll-padding-block-start` keeps a focused control out from under the sticky head. In virtualized tables the focused row stays mounted (plan).
- **Announcements (4.1.3, through the Announcer):** `sortedAscending`, `sortedDescending`, `sortCleared`, `selectedCount` (from select all), `loading`, `rowCount` (after a filter, debounced). Nothing visual is announced twice: the empty and loading text in the empty row is content, read when the user reaches it.
- **Target size (2.5.5 in comfortable, 2.5.8 in compact):** the sort button fills its cell (at least 44×44px, or 32×32px in compact), checkboxes have 44×44px (32×32px) hit areas, and expand buttons are 44px (32px). Links in cells are inline text inside a 48px row: they meet 2.5.8 through spacing, and the theme doesn't grow consumer links.
- **Non-colour cues (1.4.1):** sort direction is the icon's shape, selection is the tick, expanded is the chevron's direction plus `aria-expanded`, busy is words (D3, docs) plus the hatch's pattern, empty is words.
- **WCAG SCs of note:** 1.3.1, 1.3.2, 1.4.1, 1.4.3, 1.4.10 (data tables are exempt, but the region is reachable and scrollable), 1.4.11, 1.4.12, 2.1.1, 2.4.3, 2.4.6, 2.4.7, 2.4.11, 2.4.13, 2.5.3, 2.5.8, 4.1.2, 4.1.3.

## 8. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`. No open blockers. Notes:
  - Targets: 44×44px in comfortable and at least 24×24px in compact for every Table control (§6.2, §6.6). The checkbox's extended hit area depends on `::after` hit-testing on an `appearance: none` input. The Checkbox already relies on `::before` there, but the e2e click test in Selectable must confirm it in each engine before the claim stands.
  - Colour alone: none (§7).
  - Focus never hidden: scroll padding plus inset rings (§6.11, §6.14). e2e in Virtualized.
  - Reflow: only the region scrolls (NarrowScreen).
  - Forced colours: head border and fill, buttons and states (Modes).
  - Strings: every visible and announced string has a key (§4.1). Fixture copy is fixture copy.
- [x] Contrast: no new colour token. Every pair used is measured by `theme:check` today, except status text on `primary-subtle` (computed by hand in §6.6, all pass). **Ask the orchestrator to add the three pairs and run `vp run theme:check`** (§6.18 item 6).
- [ ] Screenshots of the built stories in four themes, at 320px and 1280px, and forced colours: at the design review in Phase 3.
- [ ] Usability test plan written. Result: **`pending`**. No testing has happened.
- [ ] Manual AT matrix (`docs/accessibility.md`): **`pending`**.

### Usability test plan (pending)

- **Participants (8–10):**
  - Staff (5): two screen-reader users (NVDA and JAWS) who use the keyboard only, one screen-magnifier user at 300–400%, one user with a tremor or reduced dexterity who uses a mouse, and one experienced case worker with no disability (the speed baseline).
  - Residents (4): one older person with low digital confidence, one person reading Swedish as a second language, one VoiceOver user on iPhone, and one Finnish speaker using the `fi` locale at 320px.
- **Tasks:**
  1. (Staff) "Sort the open cases so the oldest is first. Which case is first?" Measures whether the up chevron is read as "oldest first", and whether the sorted column is found.
  2. (Staff) "Before you sort: which columns can you sort by?" Measures whether the unsorted `sort` icon is understood.
  3. (Staff, compact) "Select the three cases from Matti, Elle and Anna." Measures checkbox misses (tremor), and whether selection is visible after scrolling.
  4. (Staff) "Open the details for Matti Virtanen's case and read who handles it." Measures whether the expand button is found at the start, and its name with a screen reader.
  5. (Staff, 10 columns) "What's the amount for case BN 2026-0419?" Measures losing the row without row hover (open question 5).
  6. (Resident, phone or 400%) "How much housing allowance did you get in March?" Measures whether the hidden column is found, and the region's discoverability (D5).
  7. (Resident) Show a filtered table with no rows. "What happened, and what can you do now?" Measures the empty message.
  8. (All) During a slow reload: "Is the list finished updating?" Measures whether the busy state is noticed without words (D3, open question 7).
- **What we measure:** task completion, errors (wrong row, wrong sort direction, missed checkbox), time on task for staff, and quotes about the sort icons and the busy state. For screen-reader users: whether the sort announcement and the row-named controls were heard and understood.

## 9. Open questions and decisions for the maintainer

**Decisions (the theme can't be finished without these):**

- **D1. The `sort` icon.** Add `sort` (two chevrons) as built-in 25, the slot `icon.md` held for it, and record it in `icon.md` or an amendment to the Icon API decision. The alternative is drawing the unsorted indicator in CSS, which breaks the "icons come from the registry" rule and can't be overridden by an app's icon library. Recommendation: add the icon.
- **D2. `--kv-table-scroll-region-max-block-size`,** a new site-wide property with an `80svh` fallback for virtualized tables only. The alternative is no default, where a virtualized table without a consumer-set height renders every row or breaks. Recommendation: accept, and list it in DESIGN.md Theming.
- **D3. `Table.Empty` shows `table.loading` while busy and empty.** Without it, a first load shows "No rows to show" while rows are on their way, which is false and alarming. It's a small behaviour change in the plan. Recommendation: accept.
- **D4. Numeric columns as part modifiers** (`kv-table-column-header--numeric`, `kv-table-cell--numeric`, `kv-table-row-header--numeric`) rather than `data-align`. This follows the theme-delivery decision and `kv-input--numeric`. Recommendation: accept.
- **D5. Optional overflow edge:** `data-overflowing` on `Table.ScrollRegion` and a `border-subtle` edge while it's present. Recommendation: accept, because it helps the hardest-case user find hidden columns on overlay-scrollbar systems. Fine to defer.

**Open questions:**

1. Does the inset ring on cell-filling controls (sort and expand buttons) need a line in DESIGN.md's focus rule ("2px offset")? The Combobox toggles already do it. Recommend a sentence: "Controls that fill a slot, such as a table header button or a combobox toggle, draw the ring inside their edge."
2. Is `80svh` right at 400% zoom (about 160px tall on a laptop)? An alternative is `max(80svh, 16rem)`, which is taller than the viewport at 400% and so needs page scroll. Test with the magnifier participant.
3. A long caption on a table wider than its region can run past the region's edge at 320px. Accept and document "keep captions short", or have the engineer prototype a caption that stays in view (a sticky inner span, if Table.Caption gains one)?
4. API shorthand for numeric columns: should `Table.Cell` and `Table.ColumnHeader` read `columnDef.meta` (for example `meta: { numeric: true }`) and add the modifier themselves? That's a plan decision. The theme works either way.
5. No zebra stripes and no row hover (DESIGN.md). If task 5 in the test shows staff losing rows in wide tables, revisit with a measured, non-colour reading aid, not stripes.
6. Should `--kv-table-cell-padding-block` and `--kv-table-cell-padding-inline` be documented site-wide properties, like the notification's?
7. Busy with rows: is a visible status the consumer's job (docs), or should the table get a status part later?
