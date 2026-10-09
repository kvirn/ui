# Accessibility contract: DateRangePicker

- **APG pattern:** [Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) (a modal dialog around a grid), after two typed fields. APG has no range pattern: a range is two ordinary selections. The grid is [calendar.a11y.md](../calendar/calendar.a11y.md) (range mode); the dialog is [dialog.a11y.md](../dialog/dialog.a11y.md); the single-date sibling is [date-picker.a11y.md](../date-picker/date-picker.a11y.md).
- **Deviations:** none new, and no key is added. From the APG example: no OK and Cancel buttons (the second press closes; Close and Escape cancel); the month is announced by Announcer on a button press; Tab leaves the modal to the browser's own UI before wrapping (the Dialog's approved deviation). Decisions: design spec `docs/design/date-range.md` (D2, D3, D9, D10, D12, D13), approved 2026-10-06, and Plan 0089.
- **Native elements used:** `<button type="button">` (trigger and Close), a native `<dialog>` shown with `showModal()`, `<h2>` (title), and the Calendar's `<table role="grid">` (two of them from 64rem).
- **Status:** alpha candidate (Plan 0089). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `date-range-picker.test.tsx` next to this file. `date-range-picker.stories.tsx` in `apps/storybook/src/components/date-range-picker/`.

DateRangePicker is an **add-on to two typed fields** (a From and a To, each one `masks.date()` TextInput, or each a DateInput): typing always works, and the dialog is the slower path for keyboard and screen reader users. It is a separate component from DatePicker because the Dialog wiring, the draft, the open step, focus return and the post-close announcement are accessibility-critical and identical for everyone. It is controlled only (v1): the fields' range goes in as `value` (`{ start, end }`, ISO strings, `''` for an empty end) and the chosen range comes out once, through `onValueChange`, for the consumer to write into both fields. The one masked field per end is the default composition; the three-box DateInput per end is supported with every feature. There is no `defaultOpen`: a picker never starts open.

## Roles, states, properties

| Part     | Element / role                              | ARIA                                                                                                                 | Notes                                                                                                                                                                 |
| -------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root     | none (renders no element)                   | none                                                                                                                 | Owns the open state, the draft range and the Dialog's context                                                                                                         |
| Trigger  | `<button type="button">` → button           | name = its visible text `dateRangePicker.trigger`; `aria-haspopup="dialog"`; `aria-expanded` `true`/`false`          | One, after both fields. The calendar icon is decorative (`aria-hidden`). Classes `kv-button kv-date-range-picker-trigger`; `data-open` while open                     |
| Popup    | native `<dialog>` → dialog                  | `aria-modal="true"` while open; `aria-labelledby` → Title                                                            | Class `kv-dialog kv-date-range-picker-popup`. Top layer; the page behind is inert                                                                                     |
| Title    | `<h2>` (`tabindex="-1"`)                    | none                                                                                                                 | `dateRangePicker.title`, replaceable with the question. Names the dialog                                                                                              |
| Close    | `<button>` icon button                      | name = `dialog.close`                                                                                                | The Dialog's own Close                                                                                                                                                |
| Calendar | `div.kv-calendar` with the Calendar's parts | as [calendar.a11y.md](../calendar/calendar.a11y.md) range mode: `aria-multiselectable`, `aria-selected` on the range | Mounted only while the dialog is open. `visibleMonths` 2 (two grids from 64rem, one below). The step line (`rangeChooseStart`, `rangeChooseEnd`) is in the range hint |

Rules, tested in `date-range-picker.test.tsx`:

- **Opens on** the typed start, else the typed end, else today, kept inside `minimum`–`maximum`. The step follows: a start only gives the end step; an end only gives the start step; both give a finished range (a press starts a new one); an end before the start shows as the start alone and is never rewritten. A partial or impossible text counts as no date and gives no error from the picker: the form validates.
- **Press 1** sets the draft start (fields unchanged, dialog open, "Startdatum … Välj slutdatum." announced in the dialog). **Press 2** on a possible end closes at once, calls `onValueChange` **once** with the finished range, and the consumer writes both fields. A day that can't be the end (before the start, too short, too long, past an unavailable day) becomes the new start and says so (restart, not swap). An unavailable day does nothing.
- **Escape and Close** drop the draft: both fields stay as they were, `onValueChange` is not called, and the next opening starts from the typed range.
- **Dev warnings (once):** `date-range-picker-invalid-value` (an end that is not `YYYY-MM-DD`); `date-range-picker-<part>-outside-root`.

## Keyboard

- **Focus strategy:** native for the fields, the trigger and the dialog's buttons; roving tabindex in the grids (Calendar), one Tab stop across both months
- **Selection follows focus:** no (Enter or Space selects)
- **Arrows wrap:** no (they cross months and the two grids, as in Calendar)
- **Shortcuts:** none

The grids' own keys (arrows, Home, End, Page keys, month buttons, the two-month crossings and the press outcomes) are in the Calendar contract and are proved in `calendar-range.test.tsx`; only what the dialog adds is listed here. A key with Control, Alt or Meta is never taken.

| Key                          | Context                           | Action                                                                                                           | Test                                                                                                                                                                  |
| ---------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab                          | From field                        | Moves to the To field                                                                                            | `date-range-picker.test.tsx › keyboard › Tab moves from the From field to the To field and on to the trigger`                                                         |
| Tab                          | To field                          | Moves to the one trigger, after both fields                                                                      | `date-range-picker.test.tsx › keyboard › Tab moves from the From field to the To field and on to the trigger`                                                         |
| Shift+Tab                    | trigger                           | Moves back to the To field, then the From field                                                                  | `date-range-picker.test.tsx › keyboard › Shift+Tab moves from the trigger back to the To field and the From field`                                                    |
| Tab / Shift+Tab              | open dialog                       | Close, the month buttons, then both grids as one stop; Shift+Tab goes back; the browser's UI sits between rounds | `date-range-picker.test.tsx › keyboard › Shift+Tab from the day goes through the month buttons to Close, and Tab goes back`                                           |
| Enter                        | trigger                           | Opens the dialog; focus on the start, else the end, else today (both fields empty)                               | `date-range-picker.test.tsx › keyboard › Enter on the trigger opens the dialog with focus on today when both fields are empty`                                        |
| Space                        | trigger                           | Opens the dialog, as Enter                                                                                       | `date-range-picker.test.tsx › keyboard › Space on the trigger opens the dialog`                                                                                       |
| Enter                        | trigger, a typed range            | Opens on the typed start, the typed range selected                                                               | `date-range-picker.test.tsx › keyboard › the dialog opens on the typed start, with the whole typed range selected`                                                    |
| Enter                        | trigger, a start only             | Opens on the start at the end step                                                                               | `date-range-picker.test.tsx › keyboard › with only a start typed the dialog opens on it at the end step`                                                              |
| Enter                        | trigger, an end only              | Opens on the end at the start step                                                                               | `date-range-picker.test.tsx › keyboard › with only an end typed the dialog opens on it at the start step`                                                             |
| Enter                        | trigger, an end before the start  | Opens on the start at the end step; nothing is rewritten                                                         | `date-range-picker.test.tsx › keyboard › an end typed before the start opens on the start at the end step, nothing rewritten`                                         |
| Enter                        | trigger, partial text             | Counts as no date: opens on today                                                                                | `date-range-picker.test.tsx › keyboard › partial text counts as no date: the dialog opens on today`                                                                   |
| Control, Alt or Meta + Enter | trigger                           | Not taken                                                                                                        | `date-range-picker.test.tsx › keyboard › a key with Control, Alt or Meta on the trigger does not open the dialog`                                                     |
| ArrowRight                   | day                               | Moves to the next day inside the dialog (the rest as Calendar)                                                   | `date-range-picker.test.tsx › keyboard › an arrow key moves between days inside the dialog`                                                                           |
| Enter                        | available day, start step         | Sets the start; the dialog stays open; the step line says to choose the end                                      | `date-range-picker.test.tsx › keyboard › Enter on a day sets the start: the dialog stays open, the fields are unchanged and the step line says to choose the end`     |
| Enter                        | possible end                      | Chooses it: closes, fills both fields, focus to the trigger                                                      | `date-range-picker.test.tsx › keyboard › Enter on the end closes the dialog, fills both fields and returns focus to the trigger`                                      |
| Space                        | possible end                      | The same as Enter                                                                                                | `date-range-picker.test.tsx › keyboard › Space on the end chooses it and closes the dialog`                                                                           |
| Enter                        | start again, end step             | A one-day range; closes                                                                                          | `date-range-picker.test.tsx › keyboard › Enter on the start again makes a one-day range and closes`                                                                   |
| Enter                        | day before the start              | Becomes the new start, announced; the dialog stays open                                                          | `date-range-picker.test.tsx › keyboard › a day before the start restarts: it becomes the new start and the dialog stays open`                                         |
| Enter                        | day that makes the range too long | Becomes the new start, announced; its name says why                                                              | `date-range-picker.test.tsx › keyboard › a day that makes the range too long restarts, says so in its name, and the dialog stays open`                                |
| Enter / Space                | unavailable day                   | Nothing; the dialog stays open                                                                                   | `date-range-picker.test.tsx › keyboard › Enter on an unavailable day does nothing and the dialog stays open`                                                          |
| Escape                       | open dialog, a start pressed      | Closes; the half-chosen range is dropped; both fields unchanged; focus to the trigger                            | `date-range-picker.test.tsx › keyboard › Escape after the first press discards the half-chosen range: both fields stay as they were and focus returns to the trigger` |
| Escape                       | reopened                          | Opens on the typed range again, not on the dropped start                                                         | `date-range-picker.test.tsx › keyboard › the dialog reopens on the typed range, not on the half-chosen one dropped by Escape`                                         |
| Enter / Space                | Close                             | Closes; the draft is dropped; focus to the trigger                                                               | `date-range-picker.test.tsx › keyboard › the Close button discards the half-chosen range and returns focus to the trigger`                                            |

A click on a day presses it the same way (`a click on the start and on the end chooses the range the same way`). With the trigger gone, focus goes to the first box of the group around it (`with the trigger gone, focus goes to the end's first box, the nearest group around the trigger, never to body`).

## Focus management

- Without a provider `timeZone`, "today" is the UTC date on first paint only. The Calendars mount in the popup on every open, so a popup that opens after mount starts on the browser's date (no switch) and initial focus lands on the cell marked `aria-current="date"`.
- Initial focus: the day with the Tab stop (the typed start, else the typed end, else today, kept inside the range), through the Dialog's `initialFocusRef`. Not the first month button.
- Trap: yes, native modal (the page behind is `inert`). Tab leaves to the browser's UI before wrapping (the Dialog's approved deviation), so there is no keyboard trap (2.1.2).
- Restore to: the trigger, for the end, Escape and Close alike. If the trigger is gone, the first input in the trigger's nearest `fieldset`, group or field: with two masked fields in one row that is the From field; with a Fieldset per end it is the end's first box (the closer landing spot). Never `body`.
- Never obscured by: nothing inside is sticky; the sheet scrolls (2.4.11).

## Announcements

| Event                     | Message key (i18n)        | Politeness                                                     |
| ------------------------- | ------------------------- | -------------------------------------------------------------- |
| The start is pressed      | `calendar.rangeChooseEnd` | polite, in the dialog's own Announcer (the page is inert)      |
| A day restarts the range  | `calendar.rangeChooseEnd` | polite, in the dialog's own Announcer                          |
| The end is chosen         | `calendar.rangeSelected`  | polite, on the **page** Announcer, after the dialog has closed |
| A month button is pressed | `calendar.visibleMonths`  | polite, in the dialog's own Announcer                          |
| Opening, closing, Escape  | none                      | the focus moves announce them                                  |

An inert page drops an announcement, so the completion waits for the dialog to close. The Calendar's own completion announcement and its finished-range step line are switched off inside the picker (`calendarProps.messages.rangeSelected` returns `''`), so it is not said twice; the length comes from `calendar.rangeLength` with the days counted inclusively. Without a provider nothing is announced and the hook warns, as for Calendar.

### Read aloud

| State or action             | Expected phrase(s) as read aloud                                                                                                          | Live region politeness | Test                                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| The fields and the trigger  | `Från`, `Till`, then `button, Välj datumen`, `not expanded`                                                                               | none                   | `date-range-picker.test.tsx › read aloud › reads the From field, the To field, then the trigger as a button with a popup that is not expanded` |
| Open dialog, typed range    | `dialog, Välj perioden` → heading → `grid, oktober 2026` → `grid, november 2026` → start `start date, selected`, end `end date, selected` | none                   | `date-range-picker.test.tsx › read aloud › reads the open dialog by its title, then both grids and the typed range as selected`                |
| The start is pressed        | `polite: Startdatum fredag 16 oktober 2026. Välj slutdatum.`                                                                              | polite                 | `date-range-picker.test.tsx › read aloud › says "Startdatum … Välj slutdatum." as a polite announcement when the start is pressed`             |
| The end is chosen           | after close: `polite: fredag 16 oktober 2026 till fredag 23 oktober 2026 valda, 8 dagar`                                                  | polite                 | `date-range-picker.test.tsx › read aloud › says "{start} till {end} valda, {length}" as a polite announcement when the end is chosen`          |
| Closed with Escape or Close | nothing                                                                                                                                   | none                   | `date-range-picker.test.tsx › announcements › closing with Escape announces nothing` and `… › closing with Close announces nothing`            |

The phrases are the virtual screen reader's approximation, not NVDA or JAWS wording, and do not prove modality or focus containment (the component tests do).

## Consumer responsibilities

- **Keep the typed fields.** DateRangePicker never replaces them: typing always works, and each keeps `autocomplete` where it applies (1.3.5) and avoids dragging (2.5.7). Put both in a group `Fieldset` with a legend ("Dates of your stay"), give each its own label and example, and put the error on the To field (`Field.ErrorMessage`, or the Fieldset's).
- **Bridge both ends.** `value={{ start: maskedDateToIsoDate(from, locale), end: maskedDateToIsoDate(to, locale) }}` (or `dateInputValueToIsoDate` per DateInput) in, and `onValueChange={(range) => …}` out, one `isoDateToMaskedDate` or `isoDateToDateInputValue` per end. Validate the order and the span yourself (the picker never produces a reversed or over-long range, but a typed one can be).
- **Say the limits.** Pass `minimum`, `maximum`, `minimumDays` and `maximumDays` and put them in the help text too (3.3.2); a booking says nights (14 nights is `maximumDays={15}`).
- **Name the task.** Replace the title with the question ("Välj datum för vistelsen").
- **Place the Popup outside a page `<form>`** (the Dialog keeps its content mounted) and the one trigger after both fields.
- **Not for** a range far from today (type it), nor when many days are unavailable (use radio buttons).
- Everything in `calendar.a11y.md` and `dialog.a11y.md` applies.

## Visual / modes

- Focus indicator: the trigger and Close are Buttons (the 2px ring with an offset); the grids' is in the Calendar contract.
- Target size: the trigger is a Button (44px, 32px compact); day cells 44px, 40px below 40rem.
- Layout: the fields and the trigger sit in `kv-date-range-row`, which wraps: side by side from 40rem, stacked below, the trigger last (at 320px or 200% text it wraps below the To field). The popup is as wide as its calendar (`fit-content`) from 40rem: two months from 64rem, one below it; a sheet below 40rem.
- forced-colors behaviour: as the Dialog and the Calendar; the trigger is a Button.
- reduced-motion behaviour: the Dialog's own open motion only.

## WCAG SCs covered

- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.3 Focus Order: every row above; focus lands on the day and returns to the trigger.
- 1.3.1, 4.1.2: roles, names and states of the trigger, dialog and grids (`roles, names and states`, axe).
- 3.3.2 Labels or Instructions: the range hint and the fields' help text. 3.3.7 Redundant Entry: the typed range is the starting point. 2.5.7 Dragging Movements: none.
- 4.1.3 Status Messages: the step and the finished range, the latter after the dialog has closed.
- 3.1.2 Language of Parts: the Calendar's `lang` when the browser has no data for the locale.
- 1.4.10, 1.4.12, 2.5.8: `pending` the Plan 0051 sweep; the sheet and 40px cells are in the stories.

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

## Known issues

- Whether a screen reader says the finished range after focus lands on the trigger, or drops it, is unproven until the manual matrix runs (design §7.3).
- `aria-selected` on every day between the ends may be noisy (design Q7): `pending` the manual AT run.
- Children you pass to `DateRangePicker.Popup` stay mounted while the dialog is closed (the default Calendar does not).
- A typed range that is already finished opens with an empty step line (and the grid's `aria-describedby` target is empty): the picker silences the completion by blanking `rangeSelected`, which also blanks the finished-range line. Follow-up: a Calendar option to silence only the completion announcement.
