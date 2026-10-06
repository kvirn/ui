# Accessibility contract: Calendar

- **APG pattern:** [Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/), its grid and keys. A standalone Calendar is the grid with its month buttons; the modal dialog belongs to DatePicker (Plan 0084).
- **Deviations:** none from the APG keys. Decisions (design spec `docs/design/date-picker-and-calendar.md`, approved 2026-10-06): the month is announced through the Announcer on a button press only, not by a live heading; days of other months are empty cells; the year buttons are optional parts; cells are 40px (36px with week numbers) below 40rem, an exception to the 44px comfortable target (2.5.8 met, 2.5.5 not at 320px).
- **Native elements used:** `<table role="grid">` with `<th scope>` headers, `<td role="gridcell">` days, `<button>` month and year buttons, `<h3>`, `<p>`.
- **Status:** alpha candidate (Plan 0082). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `calendar.test.tsx` next to this file. `calendar.stories.tsx` in `apps/storybook/src/components/calendar/`. The date arithmetic is tested in `@kvirn-ui/core` (`calendar-keys.test.ts`).

A month as a grid of days for choosing one date near today: a booking, a start date. It is a companion to typed entry (DateInput), never the only way to give a date. Calendar holds the visible month, the focused day and the chosen day in a core store; the consumer owns the chosen value (`value` and `onValueChange`, or `defaultValue`).

## Roles, states, properties

| Part                   | Element / role                           | ARIA / state                                                                                                                                                                                                                                                                                            | Notes                                                                                                                |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Calendar.Root          | `<div class="kv-calendar">`              | none                                                                                                                                                                                                                                                                                                    | Holds the state. No role: the grid is the widget                                                                     |
| Calendar.Heading       | `<h3 class="kv-calendar-heading">`       | `id`, which names the grid. `lang` when the browser writes the month in another language                                                                                                                                                                                                                | Not live. Change the level with `render`                                                                             |
| Month and year buttons | `<button type="button">`                 | Name from `calendar.previousMonth`, `nextMonth`, `previousYear`, `nextYear`; `aria-disabled="true"` and `data-disabled` at the edge of the range (stays focusable, activation blocked: native `disabled` would drop focus to `body`). A Tooltip shows the name on hover and focus (never the only name) | Classes `kv-calendar-previous-month`, `-next-month`, `-previous-year`, `-next-year`. Year buttons are optional parts |
| Calendar.RangeHint     | `<p class="kv-calendar-range">`          | `id`, which describes the grid                                                                                                                                                                                                                                                                          | Renders only with a `minimum` or `maximum`. Visible text, an instruction (3.3.2)                                     |
| Calendar.Grid          | `<table role="grid">`                    | `aria-labelledby` the Heading; `aria-describedby` the RangeHint when there is a range                                                                                                                                                                                                                   | Class `kv-calendar-grid`                                                                                             |
| Column header          | `<th scope="col">`                       | Short weekday `aria-hidden`, long weekday visually hidden                                                                                                                                                                                                                                               | In the order of the week start                                                                                       |
| Week number            | `<th scope="row">`, a rowheader          | `aria-label` `calendar.weekName` (`Vecka 42`). Over it a column header `Wk` (hidden) and `Week` (read)                                                                                                                                                                                                  | Only with `weekNumbers` and a Monday start                                                                           |
| Day                    | `<td role="gridcell">`, `tabindex` 0/-1  | `aria-label` `calendar.dayName` (`onsdag 14 oktober 2026, idag, <description>`); `aria-selected="true"` on the chosen day only; `aria-current="date"` on today; `aria-disabled="true"` when unavailable or outside the range. `data-selected`, `data-today`, `data-unavailable`, `data-outside-range`   | Class `kv-calendar-day`. Focusable even when unavailable, so a user finds out why                                    |
| Empty cell             | `<td class="kv-calendar-empty">`         | `aria-hidden="true"`, no `tabindex`, no name                                                                                                                                                                                                                                                            | Days of other months are not shown                                                                                   |
| `useCalendar`          | the same attributes, for your own markup | `rootProps`, `headingProps`, `previousMonthProps`, `nextMonthProps`, `previousYearProps`, `nextYearProps`, `rangeHintProps`, `gridProps`, `weeks`, `getDayProps(date)`                                                                                                                                  | Spread `getDayProps(date)` on each day's `<td>`                                                                      |

Rules, tested in `calendar.test.tsx`:

- **The grid is named and described.** By the Heading, and by the RangeHint when there is a range. A missing Heading or RangeHint warns once (`calendar-heading-missing`, `calendar-range-hint-missing`).
- **Status is never colour alone.** Selected is a fill, bold text and `aria-selected`; today is an edge, bold text and the name; unavailable is a strike-through, `aria-disabled` and the name.
- **Min and max.** A key's target is clamped to the range. Days outside it are `aria-disabled` and are not selectable. A `minimum` after the `maximum` throws a `RangeError`.
- **Week numbers** are ISO 8601 and need a Monday start; another start hides them and warns once (`calendar-week-numbers-need-monday`).
- **Month and weekday names** come from `Intl` with the Gregorian calendar and Latin digits. A browser without data for `se` writes them in fi, sv or nb by region, and the Heading and each column header get `lang` (3.1.2); the grid does not, because the day names stay in the provider's language.

## Keyboard

- **Focus strategy:** roving tabindex
- **Selection follows focus:** no (Enter or Space selects)
- **Arrows wrap:** no (they cross into the next or previous month)
- **Shortcuts:** none

The month and year buttons are Tab stops; the grid is one Tab stop, on the focused day (the chosen day, else the typed day, else today, kept inside the range). A key with Control, Alt or Meta is never taken.

| Key                           | Context                  | Action                                                                                  | Test                                                                                                     |
| ----------------------------- | ------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Tab                           | Calendar                 | Month (and year) buttons, then the grid as one stop on the focused day, then out        | `calendar.test.tsx › Tab moves from before the calendar through the month buttons to the grid, one stop` |
| Shift+Tab                     | grid                     | Back to the month and year buttons, then out                                            | `calendar.test.tsx › Shift+Tab moves from the grid back to the month buttons`                            |
| ArrowRight                    | day                      | Next day, into the next month at the end of one (flips in RTL)                          | `calendar.test.tsx › ArrowRight moves focus to the next day and the key is not left native`              |
| ArrowLeft                     | day                      | Previous day, into the previous month at the start of one (flips in RTL)                | `calendar.test.tsx › ArrowLeft moves focus to the previous day`                                          |
| ArrowRight / ArrowLeft        | day, RTL                 | Previous and next day: the arrows follow the reading direction                          | `calendar.test.tsx › ArrowRight and ArrowLeft flip in RTL`                                               |
| ArrowDown / ArrowUp           | day                      | Same weekday next and previous week (never flips)                                       | `calendar.test.tsx › ArrowDown and ArrowUp move a week and do not flip in RTL`                           |
| ArrowRight                    | last day                 | Crosses into the next month; the heading follows                                        | `calendar.test.tsx › an arrow past the last day crosses into the next month and the heading follows`     |
| Home / End                    | day                      | First and last day of the week, by the week start                                       | `calendar.test.tsx › Home and End go to the first and last day of the week by the week start`            |
| Home / End                    | day, Sunday start        | The same with the week starting on Sunday                                               | `calendar.test.tsx › Home and End follow a Sunday week start`                                            |
| PageDown / PageUp             | day                      | Same day next and previous month, cut to its length                                     | `calendar.test.tsx › PageDown and PageUp move a month`                                                   |
| Shift+PageDown / Shift+PageUp | day                      | Same day next and previous year                                                         | `calendar.test.tsx › Shift+PageDown and Shift+PageUp move a year`                                        |
| (any move)                    | at min or max            | The target is clamped to the range; at the edge focus stays and the key is still taken  | `calendar.test.tsx › at the edge of the range the key is still taken and focus stays`                    |
| Control, Alt or Meta + key    | day                      | Not taken: the browser's own shortcut (Alt+ArrowLeft is Back)                           | `calendar.test.tsx › a key with Control, Alt or Meta is left native`                                     |
| Enter                         | available day            | Chooses the day and reports it                                                          | `calendar.test.tsx › Enter selects an available day and reports it`                                      |
| Space                         | available day            | Chooses the day; the page does not scroll                                               | `calendar.test.tsx › Space selects an available day and does not scroll the page`                        |
| Enter / Space                 | unavailable day          | Nothing; focus stays                                                                    | `calendar.test.tsx › Enter and Space on an unavailable day select nothing`                               |
| Enter                         | month button             | Shows that month; focus stays on the button; the focused day moves to the same day, cut | `calendar.test.tsx › Enter on a month button shows that month and focus stays on the button`             |
| Space                         | year button              | Shows the same month a year on or before; focus stays                                   | `calendar.test.tsx › Space on a year button shows the same month a year on`                              |
| Enter / Space                 | month button at the edge | Nothing; focus stays                                                                    | `calendar.test.tsx › Enter on a month button at the edge does nothing and focus stays`                   |
| Escape                        | day                      | Not handled. In DatePicker (Plan 0084) the Dialog closes                                | `calendar.test.tsx › Escape is not handled by a standalone calendar`                                     |

A click on an available day chooses it (`a click selects a day, and a click on one outside the range does not`).

## Focus management

- Initial focus: not moved. The Tab stop is the chosen day, else `defaultFocusedDate`, else today, clamped to the range.
- After a key move: focus follows to the new day's cell, in the new month when it crosses. After a month or year button: focus stays on the button.
- Trap: no (a standalone Calendar). DatePicker's modal Dialog traps.
- Restore to: not applicable. DatePicker returns focus to its trigger.
- Never obscured by: the focus ring is drawn outside the cell with a gap of the grid's spacing, so it never covers a neighbour (2.4.11, 2.4.13).

## Announcements

| Event                  | Message key (i18n)                          | Politeness |
| ---------------------- | ------------------------------------------- | ---------- |
| A month or year button | none: the new heading text, `Intl`          | polite     |
| A day is chosen        | `calendar.selected`                         | polite     |
| A key moves the focus  | none: the day's name carries month and year | n/a        |

The month is not a live heading: that would speak on every key that crosses a month and double the day's name. Both messages go through the nearest Announcer and replace one that is still waiting. Without a provider nothing is announced and a development warning says so.

### Read aloud

| State or action               | Expected phrase(s) as read aloud                                             | Live region politeness | Test                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| Today (`aria-current="date"`) | `grid, oktober 2026`, `gridcell, onsdag 14 oktober 2026, idag, current date` | none                   | `calendar.test.tsx › today reads as a gridcell with its full date, idag and the current date` |
| The chosen day                | `gridcell, fredag 16 oktober 2026, selected`                                 | none                   | `calendar.test.tsx › the chosen day reads as selected`                                        |
| An unavailable day            | `gridcell, fredag 16 oktober 2026, Återvinningen stängd, disabled`           | none                   | `calendar.test.tsx › an unavailable day reads its reason and as disabled`                     |
| A month button at the edge    | `button, Föregående månad, disabled`                                         | none                   | `calendar.test.tsx › a month button at the edge reads as a disabled button`                   |
| The range                     | `grid, oktober 2026, Datum från 1 oktober 2026`                              | none                   | `calendar.test.tsx › a range is the grid description`                                         |
| A week number                 | `rowheader, Vecka 42`                                                        | none                   | `calendar.test.tsx › a week number reads as a row header named Vecka 42`                      |
| Next month pressed            | `polite: november 2026`                                                      | polite                 | `calendar.test.tsx › Next month announces the new month, politely`                            |
| A day chosen                  | `polite: fredag 16 oktober 2026 vald`                                        | polite                 | `calendar.test.tsx › choosing a day announces it, politely`                                   |

Each row has a named test using `readAloud` or `readAnnouncements` (`@kvirn-ui/testing/read-aloud`). The phrases are the virtual screen reader's approximation, not NVDA or JAWS wording: it says `disabled` where real readers say "dimmed" or "unavailable", and it does not prove modality or focus containment. A real screen reader may say today twice ("idag" in the name and "current date" from `aria-current`); the manual AT run checks whether that is noise.

## Consumer responsibilities

- Offer typed entry beside the Calendar (a DateInput): the Calendar is slower for keyboard and screen reader users. Don't use it for a date of birth, and prefer radios when many days are unavailable.
- Say why a day is unavailable in `getDateDescription`, and keep the visible range text (RangeHint) when there is a `minimum` or `maximum`.
- Render the Heading; it names the grid.
- Set `weekStart` on the KvirnProvider (or the Calendar) explicitly for server rendering: the locale-derived default reads `Intl`, which can differ between server and browser.
- Wrap the app in a KvirnProvider: it holds the Announcer.

## Visual / modes

- Focus indicator: a 2px `focus-ring` outline with a 2px offset, inside a 4px grid gap.
- Target size: day cells 44px square (32px in `kv-compact`, from 64rem); below 40rem 40px, 36px with week numbers (the recorded exception, 2.5.8 met). Month buttons are the control size.
- forced-colors behaviour: today a `CanvasText` edge; selected `Highlight` fill with `HighlightText` and a `CanvasText` edge; unavailable `GrayText` with a strike-through; hover a `Highlight` edge. The edges are borders, because forced colours drops a shadow.
- reduced-motion behaviour: no motion.
- RTL: logical properties; the columns and the chevrons mirror, the arrows follow the direction.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: the grid, headers and gridcells, names and states.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: the cues for selected, today and unavailable.
- 1.4.10 Reflow, 1.4.12 Text Spacing: 320px with 36px cells; at 200% text the cells grow with their text.
- 2.1.1 Keyboard, 2.1.4 Character Key Shortcuts (none), 2.4.3 Focus Order, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured.
- 2.5.3 Label in Name, 2.5.8 Target Size (Minimum).
- 3.1.2 Language of Parts: `lang` on a month written in a fallback language.
- 3.3.2 Labels or Instructions: the range hint.
- 4.1.3 Status Messages: the month and the chosen day.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

Research questions: do screen reader users read the week numbers or find them noise? Is the month announcement heard after a button press, and does the day name give enough on a key that crosses a month? Is an empty gridcell skipped or announced as blank?

## Known issues

- **Mixed languages under the `se` fallback.** When the browser has no `se` data, the month and weekdays are written in fi, sv or nb and marked with `lang` (the Heading and each column header). A day's name stays in the provider's language: the words for today, the week names, the consumer's `getDateDescription`, the RangeHint and the "selected" announcement are not in the fallback language, and an `aria-label` or an Announcer message can't carry `lang`.
- **A controlled `value` that changes while mounted** moves the Tab stop and the visible month to it. A change of `minimum` or `maximum` that moves the focused day to another month keeps focus in the grid.
- **"Today" is read once, on mount.** A Calendar open across midnight keeps yesterday as today.
- **Empty cells are `aria-hidden`.** A screen reader's table commands may count fewer cells in the first and last week than the seven columns.
