# Design spec: Calendar and DatePicker

- **Status:** Approved 2026-10-06. Maintainer: `weekStart`/`weekNumbers` API, modal Dialog DatePicker, own date math in core and the 40px cells below 40rem (D10, a recorded exception to DESIGN.md's 44px target) were left to the lead and taken as recommended. §12: year buttons stay optional parts; DatePicker is controlled-only in v1; the Sámi month-name fallback stays; the month announcement uses Announcer on button presses only.
- **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** two, to be written: A "core date math and Calendar", then B "DatePicker" (§10)
- **Type:** component default styling and behaviour

## 1. Brief

- **Users:** both. Hardest case: a resident on a phone booking a visit to a recycling centre or a school meeting, in Finnish as a second language, with a screen reader or a tremor; staff picking dates fifty times a day in a compact case tool.
- **Job:** "When I have to pick a day near today (a booking, a start date, last Thursday), I want to see the days as a month, so I can choose one without working out the date myself."
- **Context:** once a year (residents) or daily (staff). Typed entry must always work: the calendar is the slower path for keyboard and screen reader users (MOJ, below).
- **Constraints:** no date library and no new dependency (AGENTS rule 6); date math pure in `packages/core`; six locales; Monday-first Nordic weeks, ISO week numbers.
- **Success:** a date chosen by typing or by the calendar with no wrong-date errors; no user stuck in the dialog; screen reader users name the chosen date back.
- **Evidence:** none of our own. MOJ reports the picker "can be slow for keyboard-only and screen reader users" and advises radios when many dates are unavailable.
- **Assumptions → research questions:**
  - Nordic residents expect week numbers → do they read them, or are they noise for screen reader users?
  - Browsers ship `se` month names → measure `Intl.DateTimeFormat.supportedLocalesOf('se')` in Chromium, Firefox and WebKit (Node 24 has them: "golggotmánnu 2026").

## 2. Prior art

| Source                                                                                                      | Reuse                                                                                                                                                                                 | Change and why                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [APG Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) | Modal dialog, `table role=grid`, roving `tabindex`, the key table, `aria-selected`, focus back to the button                                                                          | No OK/Cancel (Enter selects, Close and Escape cancel). Month announced through Announcer, not a live heading (§7). Year buttons optional |
| [MOJ date picker](https://design-patterns.service.justice.gov.uk/components/date-picker/)                   | Typed field plus button; min/max, excluded dates, week start (Monday default); strikethrough for excluded days                                                                        | We keep DateInput's three boxes as the typed field, not one text box                                                                     |
| GOV.UK Dates pattern                                                                                        | No picker for memorable dates (birth)                                                                                                                                                 | Docs say so, in "When not to use"                                                                                                        |
| KvirnUI                                                                                                     | DateInput, Dialog (sheet below 40rem, own Announcer), Button, Tooltip, Icon (`calendar`, `chevron-back`, `chevron-forward`), `useFormat`, `checks.date`, `masks.date()`, roving-focus | Nothing re-specified                                                                                                                     |

## 3. Decisions

| #   | Decision                                                                                                                                                     | Reason                                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **DatePicker is an add-on.** `DatePicker.Trigger` sits after a typed field: DateInput (default) or one `masks.date()` TextInput. No calendar-only date field | Typing always works (2.1.1, speed for AT users); no dragging (2.5.7); the boxes keep `bday`-style autofill (1.3.5, 3.3.7). Calendar alone is allowed only for a bounded range of a few months                                                                                                                                             |
| D2  | **Modal Dialog**, not Popover                                                                                                                                | The APG pattern is modal; the grid owns the arrows, so it is a mode; a modal stops the virtual cursor wandering into the page; below 40rem the Dialog sheet gives a full-width grid where an anchored popover would cover the field and fight the on-screen keyboard. Cost: the field is behind the backdrop, so the title names the task |
| D3  | **`table role=grid`, roving `tabindex` on day cells**                                                                                                        | Keyboard rule 2 (DOM focus can sit on the cell; no text input to keep focus in). `aria-activedescendant` gives nothing here                                                                                                                                                                                                               |
| D4  | **Select closes at once** (click, Enter, Space)                                                                                                              | APG. A wrong tap is cheap to fix: the boxes show it and the trigger is focused                                                                                                                                                                                                                                                            |
| D5  | **Days of other months are empty cells**, not shown                                                                                                          | Two "1"s in one grid confuse; the arrows still cross into the next month                                                                                                                                                                                                                                                                  |
| D6  | **Focus stays in min–max.** A key's target is clamped to it. Unavailable days inside it are focusable with `aria-disabled`                                   | Discoverable (keyboard rule 5), never a silent dead end beyond the range                                                                                                                                                                                                                                                                  |
| D7  | **Ranges** (start and end) are **v2**, out of scope                                                                                                          | One date covers bookings and deadlines; a range needs its own research                                                                                                                                                                                                                                                                    |
| D8  | **Week start: provider setting, Monday default** (§7.3)                                                                                                      | All six languages are Monday; `Intl` gives Sunday for bare `en`, which our EU English readers don't use (as DateInput's month-first rule)                                                                                                                                                                                                 |
| D9  | **No new tokens.** Every colour pair is already in `theme:check`                                                                                             | §6                                                                                                                                                                                                                                                                                                                                        |
| D10 | **Cells below 40rem: 40px, not 44px** (36px with week numbers). Needs approval: an exception to DESIGN.md's 44px comfortable target                          | 7 × 44px + 6 × 4px ring gaps = 332px, more than a 320px screen can hold. The popup's inline padding drops to `space-2` (still wider than the 4px ring) to reach 40px. 2.5.8 is met; 2.5.5 (AAA) is not at 320px. The alternative, 44px with an inset ring, puts the ring on the selected fill at about 1:1                                |

## 4. Flow

1. Resident reads the question (legend) and help text with the allowed range, types the date. Done, or:
2. Presses **Choose date** → Dialog opens; focus on the selected date, else the typed date if valid, else today; clamped to min–max.
3. Moves with arrows, PageUp/PageDown or the month buttons; the month heading changes.
4. Enter, Space or click on an available day → Dialog closes, boxes get the date (no leading zeros), focus on the trigger, polite "14 October 2026 selected".

Unhappy paths: **Escape or Close** → nothing changes, focus on the trigger · **unavailable day** → Enter does nothing, name says why (consumer's description) · **edge of range** → keys stop, Previous/Next month `aria-disabled` · **typed date invalid or partial** → opens on today, no error from the picker; the form validates with `checks.date` (`range`, `date`) · **many unavailable days** → docs: use radios · **date of birth** → no picker · **provider missing** → nothing announced (hook warns, as today) · **midnight while open** → "today" is read on open only.

## 5. Content (English; the six locales come in the plans)

| i18n key                                           | en                                                   | Notes                                                                                                            |
| -------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `datePicker.trigger`                               | Choose date                                          | Visible text with the `calendar` icon (decorative). fi "Valitse päivämäärä" (18): wraps below the boxes at 320px |
| `datePicker.title`                                 | Choose a date                                        | Dialog title (`h2`). Docs: overridable with the question ("Choose the date of your visit")                       |
| `calendar.previousMonth` / `nextMonth`             | Previous month / Next month                          | Names of the chevron buttons, and their Tooltip                                                                  |
| `calendar.previousYear` / `nextYear`               | Previous year / Next year                            | Only when the consumer renders the year buttons                                                                  |
| `calendar.dayName({ date, isToday, description })` | {date}, today, {description}                         | Cell name. `date` = `useFormat().date(iso, { dateStyle: 'full' })`. Parts drop when absent                       |
| `calendar.weekHeader` / `weekHeaderLong`           | Wk / Week                                            | Visible short (aria-hidden) and visually hidden long column header                                               |
| `calendar.weekName({ week })`                      | Week {week}                                          | Row header name                                                                                                  |
| `calendar.rangeHint({ min, max })`                 | Dates from {min} to {max} · from {min} · up to {max} | Visible line above the grid, the grid's description (3.3.2)                                                      |
| `calendar.selected({ date })`                      | {date} selected                                      | Polite, after a select                                                                                           |
| `dialog.close`                                     | (exists)                                             | The Dialog's Close                                                                                               |

From `Intl` with `calendar: 'gregory'`, `numberingSystem: 'latn'`: heading `{ month: 'long', year: 'numeric' }` (sv "oktober 2026", fi "lokakuu 2026", se-FI "golggotmánnu 2026"); weekdays `short` and `long`; cell dates `full`. If the locale isn't supported, `se-FI` falls back to `fi`, `se-SE` to `sv`, other `se` to `nb`, and every Intl string gets `lang` = the resolved locale (3.1.2).

## 6. Structure and visual specification

```
<dialog kv-dialog kv-date-picker-popup>      Dialog (sheet < 40rem)
  h2 Title                         [× Close]
  <div kv-calendar>                Calendar.Root
    h3 kv-calendar-heading "oktober 2026"      Calendar.Heading (id → grid name)
    [‹ Previous month] [Next month ›]          (+ optional « » year buttons, outer)
    p kv-calendar-range "Dates from … to …"    Calendar.RangeHint (grid description)
    table kv-calendar-grid role=grid           Calendar.Grid
      thead: [Wk] mån tis ons tors fre lör sön
      tbody: [42] ·  ·  1  2  3  4  5   ← empty td before the 1st
```

Trigger: last item in the DateInput row (`align-self: end`), so it wraps below the Year box at 320px or 200% text. Tab order: boxes in field order → Choose date.

| Part                         | Tokens / style                                                                                                                                       | Notes                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Popup `kv-date-picker-popup` | Dialog as is; `inline-size: fit-content` within the Dialog's max (component class, not a token)                                                      | The 40rem form measure is too wide for an 8-column grid                                                      |
| Heading                      | `heading-4` role, `heading` colour, `--kv-font-family-heading`                                                                                       | Between the buttons ≥ 40rem; own row above them below 40rem, so long Sámi months fit                         |
| Month buttons                | `kv-button` quiet icon style as `kv-dialog-close`: control-size square, `md` radius, `chevron-back`/`forward` (mirror in RTL), Tooltip with the name | Chevrons beside a month are the universal calendar convention; the name is i18n and shown on hover and focus |
| Range hint                   | `body`, `text` (an instruction, so not `body-small` or `text-muted`)                                                                                 |                                                                                                              |
| Grid                         | `border-spacing: --kv-space-1` (4px = ring width + offset, so a ring never covers a neighbour); `body`, `kv-input--numeric` figures                  |                                                                                                              |
| Column header                | `label-compact`, `text`, centred                                                                                                                     | Tells sighted users which column is which day: not muted                                                     |
| Week number                  | `body-small`, `text-muted`, column ≈ 2.5ch, not a target                                                                                             | Only when `weekNumbers` is on and the week starts Monday                                                     |
| Day cell                     | Inline and block size `--kv-control-min-block-size` (44px; 32px `kv-compact` ≥ 64rem); `md` radius; centred                                          | Below 40rem: 40px, 36px with week numbers (D10); the popup's inline padding `space-2`                        |

**States (day cell)**

| State                      | Look                                                               | Forced colours                                                |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| default                    | transparent, `text`                                                | `CanvasText`                                                  |
| hover (available)          | `primary-subtle` fill                                              | 1px `Highlight` edge                                          |
| focus-visible              | 2px `focus-ring`, 2px offset                                       | ring in `Highlight`                                           |
| today                      | 1px inset `border-control` edge, weight 600, `aria-current="date"` | 1px `CanvasText` edge                                         |
| selected                   | `primary` fill, `on-primary` text, weight 600                      | `Highlight` fill, `HighlightText`, plus 2px `CanvasText` edge |
| selected hover             | `primary-hover`                                                    | as selected                                                   |
| unavailable / out of range | `text-muted`, `line-through`, no hover fill, `cursor: not-allowed` | `GrayText`, `line-through`                                    |
| empty (other month)        | nothing drawn                                                      | nothing                                                       |
| month button at the edge   | Button disabled look, still focusable                              | `GrayText`                                                    |

Pairs used, all measured by `theme:check` today: `text`, `text-muted` on `surface-raised`; `text` on `primary-subtle`; `on-primary` on `primary` and `primary-hover`; `border-control`, `focus-ring`, `primary` (selected marker) on `surface-raised` and `primary-subtle`. Status is never colour alone: selected = fill + weight + `aria-selected`; today = edge + weight + name; unavailable = strikethrough + `aria-disabled` + name.

**Modes.** Dark and contrast themes: same roles. RTL: logical properties; columns and arrows follow `dir`. Motion: none on month change, the Dialog's own open motion only. 320px and 400% zoom: the sheet, 40px cells, 36px with week numbers (D10: 2.5.8 met, 2.5.5 not at 320px); at 200% text the table grows and scrolls inline inside the Dialog (a two-dimensional layout, the 1.4.10 exception), never clipped. 1.4.12: digits only, cells grow.

## 7. Accessibility annotations (draft contract)

### 7.1 Roles, names, states

| Part                 | Element / role                          | ARIA                                                                                                                                                                                                                                   |
| -------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger              | `<button type=button>`                  | Name = visible `datePicker.trigger`; `aria-haspopup="dialog"`, `aria-expanded`                                                                                                                                                         |
| Popup                | Dialog (native `showModal`)             | `aria-labelledby` → Title                                                                                                                                                                                                              |
| Heading              | `<h3>`                                  | `id` names the grid                                                                                                                                                                                                                    |
| Month / year buttons | `<button>`                              | Name from i18n; `aria-disabled="true"` at min/max (stays focusable, activation blocked: native `disabled` would drop focus to `body`)                                                                                                  |
| Grid                 | `<table role=grid>`                     | `aria-labelledby` → Heading; `aria-describedby` → RangeHint                                                                                                                                                                            |
| Column header        | `<th scope=col>`                        | short (aria-hidden) + long (visually hidden) weekday                                                                                                                                                                                   |
| Week number          | `<th scope=row>` → rowheader            | Name `calendar.weekName`                                                                                                                                                                                                               |
| Day                  | `<td role=gridcell>`, `tabindex` 0 / −1 | Name `calendar.dayName`; `aria-selected="true"` on the selected only; `aria-current="date"` on today; `aria-disabled="true"` when unavailable or out of range; `data-today`, `data-selected`, `data-unavailable`, `data-outside-range` |
| Empty                | `<td>`                                  | no `tabindex`, no name                                                                                                                                                                                                                 |

### 7.2 Keyboard (Calendar grid; Selection follows focus: no; Arrows wrap: no, they cross months; Shortcuts: none)

| Key                           | Context         | Action                                                                                                                                                                                      |
| ----------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab               | Calendar        | Month (and year) buttons, then the grid as one stop (the focused day), then out. In DatePicker: Close → buttons → grid → round again (native modal, the approved deviation: via browser UI) |
| ArrowRight / ArrowLeft        | day             | Next / previous day, into the next or previous month (flips in RTL)                                                                                                                         |
| ArrowDown / ArrowUp           | day             | Same weekday next / previous week                                                                                                                                                           |
| Home / End                    | day             | First / last day of the week, by the week start                                                                                                                                             |
| PageDown / PageUp             | day             | Same day next / previous month, clamped to its length (31 Jan → 28 Feb)                                                                                                                     |
| Shift+PageDown / Shift+PageUp | day             | Same day next / previous year (29 Feb → 28 Feb)                                                                                                                                             |
| (any move)                    | at min or max   | Target clamped to min–max; at the edge focus stays                                                                                                                                          |
| Enter / Space                 | available day   | Selects. In DatePicker: closes, writes the field, focus to the trigger                                                                                                                      |
| Enter / Space                 | unavailable day | Nothing; stays open                                                                                                                                                                         |
| Enter / Space                 | month button    | Shows that month; focus stays on the button; the focused day moves to the same day (clamped)                                                                                                |
| Escape                        | DatePicker      | Closes without selecting, focus to the trigger. Standalone Calendar: not handled                                                                                                            |
| Enter / Space                 | Trigger         | Opens; focus to the day in §4 step 2                                                                                                                                                        |

### 7.3 Week start and week numbers (public API, for approval)

- `KvirnProvider weekStart` and `Calendar.Root weekStart`: `1`–`7`, ISO weekday (1 = Monday). Order: instance › provider › locale with an explicit region via `Intl.Locale#getWeekInfo` where the runtime has it (`en-US` Sunday, `en-GB` Monday) › Monday. Bare `en` is Monday. This closes the roadmap row.
- `weekNumbers` (default off): ISO 8601 weeks (week 53, 1 Jan in last year's week). Only with Monday start; another start warns in dev and hides them, because a Sunday row spans two ISO weeks.

### 7.4 Focus and announcements

- Open: the day in §4 step 2. Close (select, Escape, Close): the Trigger. If it's gone, the first box of the field. Never `body`. Focus never obscured: the sheet scrolls, nothing sticky.
- Month change by a button: Announcer, polite, the heading text ("november 2026"); inside the Dialog its own Announcer (the page is inert). A key move needs none: the focused cell's name carries month and year. APG's example puts `aria-live` on the heading, which would also speak on every key that crosses a month, doubling the cell name.
- Select in DatePicker: `calendar.selected` on the page Announcer **after** the Dialog closes (an inert page drops it). Standalone Calendar: the same message on its nearest Announcer.
- Opening and closing are announced by the focus moves. Nothing else is live.
- SCs of note: 1.3.1, 1.4.1, 1.4.10, 1.4.11, 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 2.5.3, 2.5.7, 2.5.8, 3.1.2, 3.2.2, 3.3.2, 3.3.7, 4.1.2, 4.1.3.

## 8. Core date math: what "no library, no Temporal" costs

Pure integer functions on `{ year, month, day }` and ISO strings, never `Date` arithmetic (no zone or DST bugs): valid, compare (ISO strings sort), days in month, leap year, day of week, add days (days-from-civil), add months and years with clamping, ISO week, month grid by week start, clamp to min–max, parts ↔ ISO (for DateInput's `{year, month, day}`). Reuse `isCalendarDate` from `checks`. `Date.UTC` only to hand a date to `Intl` (with `setUTCFullYear`, as years 0–99 map to 19xx).
Costs: Gregorian only, years 1–9999; no other calendars or numbering systems (forced in `Intl`); "today" needs the provider's `timeZone` and an injected `today` for tests; about 200 lines and a table of known values (leap years, week 53, year turns) we maintain ourselves.

## 9. Stories

- **Calendar:** Default, Selected, MinMax (range hint, disabled month buttons), UnavailableDates (with descriptions), Today, WeekNumbers, WeekStartSunday (`en-US`), YearButtons, Locales (sv, sv-FI, fi, nb, nn, se, en), Compact, RTL, ForcedColors, Keyboard.
- **DatePicker:** WithDateInput, WithValue, Booking (min–max, unavailable days), MaskedTextInput, Invalid (the field's error, picker still opens), Narrow 320px (sheet), Locales, Compact, RTL, ForcedColors, Keyboard.

## 10. Task split

**Plan A: core date math and Calendar** (first)

1. `packages/core/src/calendar-date/`: §8 functions and node tests.
2. `packages/core/src/calendar/`: state (visible month, focused day, selected), key → target day (pure, RTL-aware, clamped), month change events.
3. Provider `weekStart` and its resolution (approval first, §7.3); changeset, docs, roadmap row closed.
4. `calendar.*` keys in six locales.
5. `useCalendar` and `Calendar.Root`, `.Heading`, `.PreviousMonth`, `.NextMonth`, `.PreviousYear`, `.NextYear`, `.RangeHint`, `.Grid` (with `weeks` and `getDayProps` for own markup); `calendar.a11y.md`; one test per §7.2 row plus RTL.
6. `kv-calendar*` in `theme.css`; DESIGN.md "Calendar and date picker" subsection (approval); keyboard key table: Home/End "by the week start", the month announcement.
7. Stories and Docs page.

**Plan B: DatePicker** (after A)

1. `useDatePicker`, `DatePicker.Root` (`value` ISO, `onValueChange`, `open`), `.Trigger`, `.Popup` (on Dialog), `.Title`; focus return and fallback.
2. Bridge to DateInput (`{year, month, day}` ↔ ISO) and to `masks.date()`; open on the typed date.
3. Announcement after close; `datePicker.*` keys in six locales.
4. Trigger placement in `kv-date-input`, `kv-date-picker-popup`; contract, tests, stories, docs ("When not to use": birth dates, many unavailable days).

## 11. Validation

- [x] Self-review against the review checklist. One open item: the 44px target at 320px (D10), awaiting approval
- [x] No new colour pair (§6)
- [ ] Usability test plan. Result: `pending`

**Usability test plan (`pending`).** Participants: 2 screen reader (NVDA, VoiceOver iOS), 1 magnification at 400%, 1 tremor or switch, 2 low digital confidence, 2 Finnish or Swedish as a second language, 2 staff. Tasks: book a visit 10 days ahead within a range; pick "last Thursday"; correct a wrong pick; find out why a day is unavailable; cancel. Measure: completion, wrong dates, time typed vs picked, whether week numbers are used, whether the month announcement is heard.

## 12. Open questions (maintainer)

1. Approve the 40px cells below 40rem (D10), an exception to the 44px comfortable target?
2. Approve `weekStart` on the provider and Calendar, and `weekNumbers` (new public API, §7.3)?
3. Approve announcing the month through Announcer on button presses only, instead of APG's live heading (§7.4)? Not a keyboard deviation, but it differs from the APG example.
4. Year buttons: optional parts, off in the default composition. Keep, or render by default?
5. DatePicker writes the field through the consumer's state (controlled). Should it also write uncontrolled DateInput boxes directly?
6. A visible "Today" button in the Dialog? Not specified: Home/End and the opening on today cover it.
