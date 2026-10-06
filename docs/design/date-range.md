# Design spec: date range (Calendar range mode, DateRangePicker, inline Calendars)

- **Status:** Approved 2026-10-06. The maintainer asked for range selection (from/to side by side, inline Calendar, one masked input as the preferred way to type). The lead took the recommended answer to §12 Q1–Q9, except: Q6 `checks.dateRange` is deferred (not built in these plans) and Q5 `Calendar.ClearRange` is not added (clearing is the fields' job). Q7 (`aria-selected` on every day in the range) is taken as recommended and stays an open item for the manual AT run.
- **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** two, to be written: 1 "core range and Calendar range mode", then 2 "DateRangePicker" (§10)
- **Type:** component behaviour and default styling
- **Maintainer decisions taken (2026-10-06):** (1) a picker never starts open (no `defaultOpen`); (2) the Calendar may be inline, outside a dialog, one or two side by side; (3) range is in scope; (4) one `masks.date()` field per date is the preferred typed entry, the three-box DateInput stays fully supported.

## 1. Brief

- **Users:** both. Hardest case: a resident on a phone booking a cabin or a sports hall for some nights, in Finnish as a second language, with a screen reader or a tremor; staff entering leave (start and end) every day.
- **Job:** "When I need a period (a stay, leave, a closure), I want to give its first and last day and see the days in between, so I know what I am applying for."
- **Context:** once (residents) or daily (staff). Typing both dates always works; the calendar is the slower path for AT users (MOJ, in the parent spec).
- **Success:** a range given by typing or by the calendar with no reversed or over-long ranges submitted; no user stuck in a half-chosen state; screen reader users hear both dates and the length back.
- **Evidence:** none of our own. **Assumptions → research questions:** a resident expects "first press start, second press end" → do they, or do they expect each field to have its own picker (§12 Q8)? People count bookings in nights and leave in days → which wording do they read correctly?

## 2. Prior art

| Source                                                                                                      | Reuse                                                                                                                                     | Change and why                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [APG Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) | Grid, roving tabindex, every key                                                                                                          | **APG has no range pattern** and no range keys. We add no key: a range is two ordinary selections (§7.2) |
| [React Aria RangeCalendar](https://react-aria.adobe.com/RangeCalendar)                                      | Anchor then second press; `allowsNonContiguousRanges` (unavailable days block by default); several visible months, one focus              | A second press before the start **restarts** instead of reversing (D3)                                   |
| GOV.UK Dates pattern                                                                                        | Two labelled dates (start, end), the form validates the order                                                                             | One masked field per date, not three boxes (maintainer decision 4)                                       |
| KvirnUI                                                                                                     | Calendar, DatePicker (Dialog, focus return, announcement after close), `masks.date()`, DateInput, Field, Fieldset, Announcer, `useFormat` | Nothing re-specified                                                                                     |

## 3. Decisions

| #   | Decision                                                                                                                                                                                                                                                             | Reason                                                                                                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Value `{ start, end }`, ISO strings, `''` for none.** Partial ranges are valid states: start only, end only. A pair with end before start is shown as start only (the end is ignored for display, never rewritten)                                                 | Same `''` convention as Calendar and DatePicker; typed fields are partial while the user types                                                                                                                                     |
| D2  | **"Both" interaction:** press 1 sets the start, press 2 sets the end. Enter, Space or a click; selection never follows focus. A press after a complete range starts a new one                                                                                        | Two ordinary selections, no new keys, works by touch, switch and voice                                                                                                                                                             |
| D3  | **One rule: a day that can't be the end starts a new range.** Before the start, too short, too long, or past an unavailable day: it becomes the new start, announced. The start itself again: a one-day range when `minimumDays` ≤ 1                                 | Never a silent dead end (a struck-through day would look unavailable when it is a fine start). Restart, not swap: the "From" field never gets a day the user didn't press as a start, and the visible line says which step is next |
| D4  | **The start is always free; the end is limited by it.** In a Calendar that chooses only the end (`selects="end"`), impossible ends are `aria-disabled` with the reason; in one that chooses only the start, a start that breaks the range clears the end (announced) | One anchor, one direction. A dedicated end calendar can disable days because its label says what a press means                                                                                                                     |
| D5  | **Span limits in inclusive days:** `minimumDays`, `maximumDays` (a one-day range is 1). Messages get `{ days, nights }`, so a booking says "nights" (docs: 14 nights = `maximumDays={15}`)                                                                           | One unit in the API, the user's unit in the copy (Q4)                                                                                                                                                                              |
| D6  | **Unavailable days block a range by default;** `allowUnavailableInRange` lets it pass over them (leave across a closed day). Inside an allowed range they keep the strike-through                                                                                    | A booking across a taken night fails at the server; leave over a holiday is normal                                                                                                                                                 |
| D7  | **Preview** from the start to the hovered or focused candidate, visual only, while the end is pending. Screen readers get the length in each candidate's name instead (§7.1)                                                                                         | A preview changing on every arrow would be noise if announced                                                                                                                                                                      |
| D8  | **Clearing:** in the picker, by emptying the fields; Escape never clears. Inline, an optional `Calendar.ClearRange` button (Q5)                                                                                                                                      | A press can't un-choose, and Escape means cancel                                                                                                                                                                                   |
| D9  | **DateRangePicker = one trigger after both fields, one shared modal popup,** closing at once when the end is chosen (parent D4). Escape and Close discard the draft: both fields stay as they were. **No `defaultOpen`**                                             | One Tab stop, the whole range in view while choosing; consistent with DatePicker (Q2, Q8)                                                                                                                                          |
| D10 | **Two months side by side from 64rem, one below,** decided inside the Calendar (`visibleMonths={2}` is a maximum; one on the server, then the media query). One Tab stop and one focused day across both grids                                                       | 2 × 340px fits a dialog from 64rem; it can never break 320px or 400% zoom, whatever the consumer passes                                                                                                                            |
| D11 | **No new tokens, no new colour pair** (§6)                                                                                                                                                                                                                           | Every pair is already in `theme:check`                                                                                                                                                                                             |
| D12 | **Validation stays the form's.** The picker never produces a reversed or over-long range and opens on what is typed; errors are `Field.ErrorMessage` on the To field (§4)                                                                                            | Forms skill: controls hold no form state                                                                                                                                                                                           |
| D13 | **The masked field leads:** docs, the first example and the `Default` stories use two `masks.date()` fields; DateInput is the second section and its own story, with every feature                                                                                   | Maintainer decision 4                                                                                                                                                                                                              |

## 4. Flow

**DateRangePicker:** 1. reads the legend ("Dates of your stay") and help text (the limit), types From and To. Done, or 2. **Choose dates** → dialog; focus on the start, else the end, else today (clamped); the status line says the step. 3. Press a day → start; "Start date fredag 16 oktober 2026. Choose the end date." 4. Moves (arrows, Page keys, month buttons); preview follows. 5. Press the end → dialog closes, both fields written, focus on the trigger, "16 … to 23 …, 8 days selected".

Unhappy paths: **Escape or Close** → nothing changes · **a day that can't end it** → new start (D3) · **unavailable day** → nothing (parent D6) · **typed end before start** → the form's error on To ("The end date must be on or after the start date"); the picker opens on the start with the end step · **typed start only** → opens on the start, end step · **typed end only** → start step; a start on or before it completes the range, a later one clears it · **partial or impossible text** → as no date · **over the limit typed** → the form's error; the limit is in the help text · **trigger gone** → the From field, never `body`.

**Inline Calendar (range):** each press reports at once (`onValueChange({ start, end: '' })`), so fields beside it fill live; the step line and announcements as above, on the page Announcer.

## 5. Content (English; six locales in the plans; `fi` longest checked)

| i18n key                                                            | en                                                                           | Notes                                                                                                     |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `calendar.rangeStart` / `rangeEnd` / `rangeStartAndEnd`             | start date / end date / start and end date                                   | Name parts of the chosen days                                                                             |
| `calendar.rangeLength({ days, nights })`                            | 1 day · {days} days                                                          | Name part of each possible end while the end is pending; plural through `Intl.PluralRules` in each locale |
| `calendar.rangeTooShort({ minimum })` / `rangeTooLong({ maximum })` | fewer than {minimum} days / more than {maximum} days                         | Name part of a day that can't be the end                                                                  |
| `calendar.rangeBlocked`                                             | an unavailable day is in between                                             | As above                                                                                                  |
| `calendar.rangeBeforeStart`                                         | before the start date                                                        | `selects="end"` only, with `aria-disabled`                                                                |
| `calendar.rangeSpanHint({ minimum, maximum })`                      | {minimum} to {maximum} days · at least {minimum} days · up to {maximum} days | Range hint line (3.3.2)                                                                                   |
| `calendar.rangeChooseStart`                                         | Choose the start date.                                                       | Step line; fi "Valitse alkupäivä."                                                                        |
| `calendar.rangeChooseEnd({ start })`                                | Start date {start}. Choose the end date.                                     | Step line **and** the announcement after press 1 (one key, same words seen and heard)                     |
| `calendar.rangeSelected({ start, end, length })`                    | {start} to {end} selected, {length}                                          | Step line when complete and the completion announcement (same words seen and heard)                       |
| `calendar.rangeEndSelected({ date })` / `rangeEndCleared`           | End date {date} selected. / End date cleared.                                | `selects` start or end only                                                                               |
| `calendar.visibleMonths({ first, last })`                           | {first} and {last}                                                           | Announced by a month button with two months                                                               |
| `calendar.clearRange` / `rangeCleared`                              | Clear dates / Dates cleared                                                  | Only with `Calendar.ClearRange` (Q5)                                                                      |
| `dateRangePicker.trigger` / `title`                                 | Choose dates / Choose the dates                                              | sv "Välj datum" / "Välj datumen"; fi "Valitse päivämäärät" (19, wraps below the To field at 320px)        |

`calendar.dayName` gains two optional, already-translated parts: `{date}, today, {rangePosition}, {rangeNote}, {description}` (additive, overriding functions keep working). Dates in names and messages: `useFormat().date(iso, { dateStyle: 'full' })`, as `calendar.selected`. Field labels and the legend are the consumer's words (Field.Label, Fieldset.Legend), not keys.

## 6. Structure and visual specification

**Default composition (masked, D13).** A group Fieldset: legend → [Field From: label, `masks.date()` TextInput `kv-input--width-10`, HelpText "For example 16.10.2026"] [Field To: same] [Choose dates] → Fieldset.HelpText ("Up to 14 nights.") → Fieldset.ErrorMessage. Each field keeps its own example (the masked-field warning needs one per Field). Row class `kv-date-range-row` (a wrapping row like `kv-date-picker-row`, `space-4` gap, items at the block end). ≥ 40rem: side by side, trigger wraps when it doesn't fit. < 40rem: stacked, one per row, trigger last. Tab order = DOM: From → To → Choose dates.

**Three-box alternative.** An outer group Fieldset (the question) holding two group Fieldsets (legend "Start date", "End date"), each a DateInput with its auto-advance hint, its own HelpText and ErrorMessage; trigger after the end DateInput. Side by side from 64rem, stacked below. Auto-advance never jumps from the start's Year to the end's first box (DateInput rule: never from the last box). Bridges: `dateInputValueToIsoDate` / `isoDateToDateInputValue` per end.

**Popup.** Dialog (sheet < 40rem): `h2` Title, Close; Calendar with `visibleMonths={2}`. ≥ 64rem: `[‹] oktober 2026 · november 2026 [›]` above two grids, `space-8` apart; DOM: Previous, Heading 0, Heading 1, Next, RangeHint, Grid 0, Grid 1 (Tab: Close → ‹ → › → grid). The RangeHint holds the range line, the span line and the step line (body, `text`).

**Inline.** (a) One `Calendar mode="range"` beside or under the fields, one or two months. (b) A from/to pair: two Calendars on one `value`, `selects="start"` and `selects="end"`, each under the consumer's visible heading, whose id the Grid prepends to its `aria-labelledby` ("Start date, oktober 2026"); side by side from 64rem (Columns), stacked below. With no end chosen, the end Calendar's visible month follows the start (no focus move, nothing announced).

**Width budget** (border-spacing puts a 4px gap at both outer edges too: cells × size + 8 × 4px):

| Case                                          | Width                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| One month, ≥ 40rem, 44px                      | 7 × 44 + 32 = 340px                                                                                                 |
| Two months, ≥ 64rem                           | 2 × 340 + 32 gap = 712px; + Dialog padding ≈ 760px < 1024px. Compact 32px: 2 × 256 + 32 = 544px                     |
| One month, < 40rem, 40px (approved exception) | 7 × 40 + 32 = 312px: fits 320px inline. **In the sheet with `space-2` padding: 328px, 8px over** (Open question O1) |
| Week numbers, < 40rem, 36px                   | 2.5ch + 7 × 36 + 9 × 4 ≈ 310px                                                                                      |

**Day cell states (range additions; the parent §6 states still apply).**

| State                            | Look                                                                                                                                                                                                                            | Forced colours                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| start / end                      | as selected: `primary` fill, `on-primary`, 600. The corners facing the band are square (start: inline-end, end: inline-start); a one-day range keeps all four `md` corners                                                      | `Highlight` fill, `HighlightText`, 2px `CanvasText` border               |
| in range                         | a band: `primary-subtle` fill, square, with 1px `primary` edges at block-start and block-end, drawn by a decorative `::before` that also bridges the 4px gap to the next day in the week row (never across rows or empty cells) | the band's `::before` keeps `border-block: 1px solid Highlight`, no fill |
| preview (end pending)            | band fill with **dashed** 1px `primary` edges; the candidate end a 1px dashed `primary` edge all round, `md` radius                                                                                                             | dashed `Highlight` edges                                                 |
| hover inside a band              | 1px solid `primary` edge all round                                                                                                                                                                                              | 1px `Highlight` border (as hover)                                        |
| today in a band                  | the inset `border-control` edge and 600 stay inside the band edges                                                                                                                                                              | 1px `CanvasText` inline edges, 600                                       |
| unavailable in an allowed range  | band plus `text-muted` and line-through                                                                                                                                                                                         | band plus `GrayText`, line-through                                       |
| impossible end (`selects="end"`) | as unavailable (`text-muted`, line-through)                                                                                                                                                                                     | `GrayText`, line-through                                                 |
| focus-visible                    | the 2px `focus-ring`, 2px offset, over the band or the gap                                                                                                                                                                      | `Highlight` ring                                                         |

**Never colour alone (1.4.1, 1.4.11):** start and end = fill (`on-primary` 4.5:1) + weight + shape + position + name; in range = 1px `primary` edges at 3:1 on `primary-subtle` and `surface-raised` + `aria-selected`; preview = dashed vs solid; the band alone (`primary-subtle`, about 1.1:1) is never the only cue. Edges are borders, never box-shadow (forced colours drops a shadow, as the Calendar fix). **Pairs used, all measured by `theme:check` today:** `primary` as a marker on `canvas`, `surface`, `surface-raised`, `primary-subtle`; `text`, `text-muted` on `primary-subtle`; `on-primary` on `primary`, `primary-hover`; `focus-ring` on `primary-subtle`. Lines are 1px (DESIGN.md Lines); the band has square corners, so its edges never follow a radius.

**Modes.** Dark and contrast themes: same roles. RTL: logical properties; the band, square corners and arrows mirror. Motion: none; the preview changes without transition. 400% zoom and 320px: one month (D10), the sheet. 200% text: cells grow, the table scrolls inline inside the dialog (parent §6). 1.4.12: digits only.

## 7. Accessibility annotations (draft contract)

### 7.1 Roles, names, states

| Part                                                        | ARIA                                                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Grid (range mode)                                           | `aria-multiselectable="true"`; `aria-labelledby` = consumer heading id (inline pair) + Heading; `aria-describedby` → RangeHint |
| Start, end                                                  | `aria-selected="true"`; name `{date}, start date` / `end date` / `start and end date`; `data-range-start`, `data-range-end`    |
| Days between                                                | `aria-selected="true"`, `data-in-range`, no extra name part (the selected count would be noise)                                |
| Possible end (end pending, or `selects="end"` with a start) | name part `rangeLength` ("7 days"); `data-preview` / `data-preview-end` only drawn, never in ARIA                              |
| Day that can't end it (`selects` both)                      | name part `rangeTooShort`, `rangeTooLong` or `rangeBlocked`; stays available (it is a valid start)                             |
| Impossible end (`selects="end"`)                            | `aria-disabled="true"`, `data-unavailable`, name part with the reason                                                          |
| Trigger, Popup, Title, Close                                | as DatePicker; Trigger name `dateRangePicker.trigger`, `aria-haspopup="dialog"`, `aria-expanded`                               |
| ClearRange (optional)                                       | `<button>`, `calendar.clearRange`; `aria-disabled` when nothing is chosen (stays focusable)                                    |

### 7.2 Keyboard (roving tabindex; selection follows focus: no; arrows wrap: no, cross months; shortcuts: none)

APG has no range grid pattern, so no key is added: no Shift+Arrow extension (undiscoverable, and Shift+Page already means a year). The Calendar contract's rows stay; range rows:

| Key                        | Context                                             | Action                                                                                                          |
| -------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab            | two months                                          | One Tab stop for both grids (the focused day); order ‹ → › → grid                                               |
| ArrowRight / ArrowLeft     | last or first day of a grid, two months             | Crosses into the other grid; the view moves by one month only when the day leaves both (flips in RTL)           |
| PageDown / PageUp          | two months                                          | Same day next or previous month; the view moves only when the day leaves it                                     |
| Enter / Space              | available day, start step                           | Sets the start; step line and announcement say "choose the end"                                                 |
| Enter / Space              | possible end                                        | Sets the end. Inline: reports and announces the range. Picker: closes, writes both fields, focus to the trigger |
| Enter / Space              | start again, end step                               | One-day range when `minimumDays` ≤ 1, else a new start (the same day)                                           |
| Enter / Space              | day that can't end it (`selects` both)              | Becomes the new start, announced (D3)                                                                           |
| Enter / Space              | impossible end (`selects="end"`) or unavailable day | Nothing; focus stays                                                                                            |
| Enter / Space              | `selects="start"`, start after the end or too far   | Sets the start, clears the end, announces both                                                                  |
| Escape                     | picker                                              | Closes; both fields unchanged (the draft is dropped); focus to the trigger. Standalone: not handled             |
| Enter / Space              | ClearRange                                          | Clears both ends; focus stays; "Dates cleared"                                                                  |
| Enter / Space              | trigger                                             | Opens: focus on the start, else the end, else today; the step from §4                                           |
| Tab / Shift+Tab            | the fields                                          | From → To → trigger, and back                                                                                   |
| Control, Alt or Meta + key | day                                                 | Not taken                                                                                                       |

### 7.3 Focus and announcements

- Focus: the parent §7.4 rules. Picker close (end, Escape, Close): the trigger, else the From field (masked) or the start's first box. Never `body`.
- Announced, polite, through the nearest Announcer: press 1 (`rangeChooseEnd`, the dialog's own Announcer in the picker); completion (`rangeSelected`, in the picker on the **page** Announcer after close, like `calendar.selected`, which is switched off in range mode); `rangeEndSelected`, `rangeEndCleared`, `rangeCleared`; two-month button (`visibleMonths`). Nothing on arrows or preview. One message replaces a waiting one.

### 7.4 Read aloud (draft rows; tests use sv as the Calendar contract)

| State or action                  | Expected phrase(s)                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| Grid in range mode               | `grid, oktober 2026, multi-selectable` (wording is the virtual reader's)                 |
| Start                            | `gridcell, fredag 16 oktober 2026, start date, selected`                                 |
| A day between                    | `gridcell, lördag 17 oktober 2026, selected`                                             |
| End                              | `gridcell, fredag 23 oktober 2026, end date, selected`                                   |
| Possible end                     | `gridcell, torsdag 22 oktober 2026, 7 days`                                              |
| Too long                         | `gridcell, fredag 6 november 2026, more than 14 days`                                    |
| Impossible end (`selects="end"`) | `gridcell, torsdag 15 oktober 2026, before the start date, disabled`                     |
| Inline pair grid                 | `grid, End date, oktober 2026`                                                           |
| Press 1                          | `polite: Start date fredag 16 oktober 2026. Choose the end date.`                        |
| Completed in the picker          | after close: `polite: fredag 16 oktober 2026 to fredag 23 oktober 2026 selected, 8 days` |
| Escape                           | nothing                                                                                  |

SCs of note: 1.3.1, 1.4.1, 1.4.10, 1.4.11, 2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.5.7, 2.5.8, 3.2.2, 3.3.2, 3.3.7, 4.1.2, 4.1.3.

## 8. Smallest public API (recommended)

- **Calendar (Plan 1):** `mode: 'single' | 'range'` (a discriminated union, default single). Range: `value` / `defaultValue` `DateRange` (`{ start, end }`, exported from core), `onValueChange(range)`, `selects: 'both' | 'start' | 'end'` (default both), `minimumDays`, `maximumDays`, `allowUnavailableInRange`. Both modes: `visibleMonths: 1 | 2` (D10); `Calendar.Heading` and `Calendar.Grid` take `offset` (0 | 1); the RangeHint always renders in range mode; optional `Calendar.ClearRange` (Q5). `useCalendar` returns `months` (`{ headingText, weeks }[]`) beside today's fields. State attributes `data-range-start`, `data-range-end`, `data-in-range`, `data-preview`, `data-preview-end`.
- **DateRangePicker (Plan 2):** a separate component mirroring DatePicker, not a recipe: the Dialog wiring, the draft, the open step, focus return and the post-close announcement are accessibility-critical and identical for everyone. Parts Root (no element), Trigger, Popup, Title, Calendar; props `value` (`DateRange`, controlled only), `onValueChange` (once, on completion), `open` / `onOpenChange` (no `defaultOpen`), the Calendar's range props, `messages`, `calendarMessages`.
- **Core:** `calendar-range.ts`, pure: `countDays(start, end)`, `getRangePosition(date, range, preview)`, `getRangeEndAvailability(date, rules)` → `available | before-start | too-short | too-long | blocked | unavailable | outside-range`, `chooseRangeDate(range, date, selects, rules)` → `{ range, step, endCleared }`, and the blocked scan (from the start to the first unavailable day or the last visible day, never further). The store adds `mode`, `range`, `selects`, `previewDate` (set by React on hover and on grid focus, cleared on leave and blur), `visibleMonths` and the rules. Optional `checks.dateRange(range, { minimumDays, maximumDays })` → `order | too-short | too-long` for the form (Q6).

## 9. Stories

- **Calendar:** Range, RangeTwoMonths, RangeSpan (`maximumDays`, nights copy), RangeUnavailableBlocked, RangeUnavailableAllowed (leave), RangeFromToPair (`selects` start and end), RangeClear, RangeLocales, RangeRTL, RangeForcedColors, and the Keyboard story gains a range fixture.
- **DateRangePicker:** **Default (two masked fields, first)**, WithValue, Booking (min–max, `maximumDays`, blocked), Invalid (end before start, the error on To), Narrow 320px, TwoMonths (≥ 64rem), **DateInputs (three-box alternative, second)**, Inline (masked fields + inline two-month Calendar), Locales, Compact, RTL, ForcedColors, Keyboard.

## 10. Task split

**Plan 1: core range and Calendar range mode** (first)

1. `packages/core/src/calendar/calendar-range.ts` and node tests (§8; the restart rule, spans, the blocked scan, one-day ranges, end-only partials).
2. Store: range state, `previewDate`, two-month view and key moves across grids; `checks.dateRange` if approved.
3. `calendar.*` range keys in six locales; `dayName`'s new parts.
4. React: `mode`, `selects`, `visibleMonths` and its media query, `offset`, names, `aria-multiselectable`, `aria-selected`, the Grid's `aria-labelledby` merge, the RangeHint lines, announcements, `ClearRange` if approved.
5. `theme.css`: band, edges, preview, corners, two-month layout, forced colours; DESIGN.md "Calendar and date picker" range bullet (approval); keyboard skill `key-tables.md`: "no APG range pattern, no added keys".
6. Contract rows and tests (§7.2, §7.4), stories, `calendar.md`.

**Plan 2: DateRangePicker** (after 1): `useDateRangePicker` on DatePicker's internals (draft, open step, discard on Escape); parts; `kv-date-range-row`; bridges per end; `dateRangePicker.*` keys; post-close announcement; contract, tests, stories, docs page that leads with the masked fields (D13).

## 11. Validation

- [x] Self-review against the review checklist; no open blocker. O1 (the sheet's 8px at 320px) predates this spec
- [x] No new colour pair (§6)
- [ ] Usability test plan. Result: `pending`

**Usability test plan (`pending`).** Participants: 2 screen reader (NVDA, VoiceOver iOS), 1 magnification at 400%, 1 tremor or switch, 2 low digital confidence, 2 Finnish or Swedish as a second language, 2 staff. Tasks: book 5 nights within a 14-night limit; correct a start chosen too late; book across a taken night (expect the restart); type a range, then change only the end; enter leave across a holiday. Measure: completion, reversed or over-long ranges, whether the restart is understood, nights vs days errors, typed vs picked, whether the length in names is heard.

## 12. Maintainer questions (new public API or a11y trade-off)

1. Approve the Calendar range API: `mode="range"`, `DateRange` `{ start, end }`, `selects`, `minimumDays`, `maximumDays`, `allowUnavailableInRange` (default block), `visibleMonths` with `offset` on Heading and Grid?
2. A separate `DateRangePicker` (recommended) or `DatePicker mode="range"`?
3. D3: a day that can't be the end starts a new range (restart), instead of React Aria's reversal?
4. D5: span limits in inclusive days, with nights only in the copy?
5. Add the optional `Calendar.ClearRange` part, or leave clearing to the fields?
6. Add `checks.dateRange` for the form's order and span errors?
7. `aria-selected` on every day of the range with `aria-multiselectable` (a screen reader says "selected" on each day between): approve, pending the AT run?
8. D9: one trigger after both fields with a two-press popup, or one trigger per field (each a single choice with the range shown, `selects` start or end)? The second is simpler to understand, slower to use.
9. The picker closes at once when the end is chosen (parent D4), with no Done button?

**Open questions (not API):** O1: the parent D10 arithmetic counted 6 gaps; border-spacing gives 8, so the sheet is 312 + 2 × 8 = 328px at 320px. Check the Narrow story; fix in Plan 1 (padding `space-1` below 40rem, or drop the outer spacing). O2: DatePicker's docs still lead with DateInput; D13 suggests leading with the masked field there too. O3: a check-out day on a taken night (the end may be a day whose night is taken): does `isDateUnavailable` need to know the step?
