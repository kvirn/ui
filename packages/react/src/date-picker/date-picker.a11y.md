# Accessibility contract: DatePicker

- **APG pattern:** [Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) (a modal dialog around a grid), after a typed field. The grid is [calendar.a11y.md](../calendar/calendar.a11y.md); the dialog is [dialog.a11y.md](../dialog/dialog.a11y.md).
- **Deviations:** none new. From the APG example: no OK and Cancel buttons (Enter selects, Close and Escape cancel); the month is announced by Announcer on a button press, not by a live heading (Calendar contract); Tab leaves the modal to the browser's own UI before wrapping (the Dialog's approved deviation). Decisions: design spec `docs/design/date-picker-and-calendar.md` §3 (D1, D2, D4), approved 2026-10-06, and Plan 0084.
- **Native elements used:** `<button type="button">` (trigger and Close), a native `<dialog>` shown with `showModal()`, `<h2>` (title), and the Calendar's `<table role="grid">`.
- **Status:** alpha candidate (Plan 0084). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `date-picker.test.tsx` next to this file. `date-picker.stories.tsx` in `apps/storybook/src/components/date-picker/`.

DatePicker is an **add-on to a typed field** (a DateInput, or one `masks.date()` TextInput): typing always works, and the dialog is the slower path for keyboard and screen reader users. It is controlled only (v1): the field's date goes in as `value` (ISO), and the chosen day comes out through `onValueChange` for the consumer to write into the field. There is no date range (v2).

## Roles, states, properties

| Part     | Element / role                              | ARIA                                                                                                   | Notes                                                                                                                                               |
| -------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root     | none (renders no element)                   | none                                                                                                   | Owns the open state, the range and the Dialog's context                                                                                             |
| Trigger  | `<button type="button">` → button           | name = its visible text `datePicker.trigger`; `aria-haspopup="dialog"`; `aria-expanded` `true`/`false` | The calendar icon is decorative (`aria-hidden`). Classes `kv-button kv-date-picker-trigger`; `data-open` while open. Last item in the DateInput row |
| Popup    | native `<dialog>` → dialog                  | `aria-modal="true"` while open; `aria-labelledby` → Title                                              | Class `kv-dialog kv-date-picker-popup`. Top layer; the page behind is inert                                                                         |
| Title    | `<h2>` (`tabindex="-1"`)                    | none                                                                                                   | `datePicker.title`, replaceable with the question. Names the dialog                                                                                 |
| Close    | `<button>` icon button                      | name = `dialog.close`                                                                                  | The Dialog's own Close                                                                                                                              |
| Calendar | `div.kv-calendar` with the Calendar's parts | as [calendar.a11y.md](../calendar/calendar.a11y.md)                                                    | Mounted only while the dialog is open, so it reads the typed date and today afresh each time. `aria-selected` on the typed date                     |

Rules, tested in `date-picker.test.tsx`:

- **Opens on** the selected (typed) date when the field holds a real date, else on today; a date outside `minimum`–`maximum` opens on the nearest day inside it. A partial or impossible date gives no error from the picker: the form validates with `checks.date`.
- **Choosing an available day** closes the dialog at once, calls `onValueChange` with the ISO date, and the consumer writes it into the boxes without leading zeros (`isoDateToDateInputValue`) or into the masked field (`isoDateToMaskedDate`). An unavailable day does nothing and the dialog stays open.
- **Dev warnings (once):** `date-picker-invalid-value` (a `value` that is not `YYYY-MM-DD`); `date-picker-<part>-outside-root`.

## Keyboard

- **Focus strategy:** native for the trigger and the dialog's buttons; roving tabindex in the grid (Calendar)
- **Selection follows focus:** no (Enter or Space selects)
- **Arrows wrap:** no (they cross months, as in Calendar)
- **Shortcuts:** none

The grid's own keys (arrows, Home, End, Page keys, month buttons) are in the Calendar contract and are proved in `calendar.test.tsx`; only what the dialog adds is listed here. A key with Control, Alt or Meta is never taken.

| Key             | Context                                 | Action                                                                                                         | Test                                                                                                                                                    |
| --------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab             | last box                                | Moves to the trigger, the last item in the row                                                                 | `date-picker.test.tsx › keyboard › Tab moves from the last box to the trigger`                                                                          |
| Shift+Tab       | trigger                                 | Moves back to the last box                                                                                     | `date-picker.test.tsx › keyboard › Shift+Tab moves from the trigger back to the last box`                                                               |
| Tab / Shift+Tab | open dialog                             | Close, the month buttons, then the grid as one stop; Shift+Tab goes back; the browser's UI sits between rounds | `date-picker.test.tsx › keyboard › Shift+Tab from the day goes through the month buttons to Close, and Tab goes back`                                   |
| Enter           | trigger                                 | Opens the dialog; focus on the selected date, else today                                                       | `date-picker.test.tsx › keyboard › Enter on the trigger opens the dialog with focus on today when the field is empty`                                   |
| Space           | trigger                                 | Opens the dialog, as Enter                                                                                     | `date-picker.test.tsx › keyboard › Space on the trigger opens the dialog`                                                                               |
| Enter           | trigger, typed date                     | Opens on the typed date, which has `aria-selected`                                                             | `date-picker.test.tsx › keyboard › the dialog opens on the typed date when the field holds a real date`                                                 |
| Enter           | trigger, a typed date outside the range | Opens on the nearest day inside the range                                                                      | `date-picker.test.tsx › keyboard › a typed date outside the range opens inside it`                                                                      |
| ArrowRight      | day                                     | Moves to the next day inside the dialog (the rest as Calendar)                                                 | `date-picker.test.tsx › keyboard › an arrow key moves between days inside the dialog`                                                                   |
| Enter           | available day                           | Chooses it, closes, fills the field, focus to the trigger                                                      | `date-picker.test.tsx › keyboard › Enter on an available day closes the dialog, fills the boxes without leading zeros and returns focus to the trigger` |
| Space           | available day                           | The same as Enter                                                                                              | `date-picker.test.tsx › keyboard › Space on an available day chooses it and closes the dialog`                                                          |
| Enter / Space   | unavailable day                         | Nothing; the dialog stays open                                                                                 | `date-picker.test.tsx › keyboard › Enter on an unavailable day does nothing and the dialog stays open`                                                  |
| Escape          | open dialog                             | Closes without choosing; the field is unchanged; focus to the trigger                                          | `date-picker.test.tsx › keyboard › Escape closes without choosing and returns focus to the trigger`                                                     |
| Enter / Space   | Close                                   | Closes without choosing; focus to the trigger                                                                  | `date-picker.test.tsx › keyboard › the Close button closes without choosing and returns focus to the trigger`                                           |

A click on a day chooses it the same way (`a click on a day chooses it and writes a day and month without leading zeros`). The dialog reopens on a date typed since it closed (`the dialog reopens on a date typed since it closed`).

## Focus management

- Without a provider `timeZone`, "today" is the UTC date on first paint only. The Calendar mounts in the popup on every open, so a popup that opens after mount starts on the browser's date (no switch) and initial focus lands on the cell marked `aria-current="date"`.
- Initial focus: the day with the Tab stop (the typed date, else today, kept inside the range), through the Dialog's `initialFocusRef`. Not the first month button.
- Trap: yes, native modal (the page behind is `inert`). Tab leaves to the browser's UI before wrapping (the Dialog's approved deviation), so there is no keyboard trap (2.1.2).
- Restore to: the trigger, for a choice, Escape and Close alike. If the trigger is gone, the first box of the field (the first input in the trigger's nearest `fieldset`, group or field). Never `body` (`with the trigger gone, focus goes to the first box of the field, never to body`).
- Never obscured by: nothing inside is sticky; the sheet scrolls (2.4.11).

## Announcements

| Event                     | Message key (i18n)         | Politeness                                                     |
| ------------------------- | -------------------------- | -------------------------------------------------------------- |
| A day is chosen           | `calendar.selected`        | polite, on the **page** Announcer, after the dialog has closed |
| A month button is pressed | the month heading (no key) | polite, in the dialog's own Announcer (the page is inert)      |
| Opening, closing, Escape  | none                       | the focus moves announce them                                  |

An inert page drops an announcement, so the choice waits for the dialog to close. The Calendar's own "selected" announcement is switched off inside the picker (`calendarProps.messages.selected` returns `''`), so it is not said twice. Without a provider nothing is announced and the hook warns, as for Calendar.

### Read aloud

| State or action             | Expected phrase(s) as read aloud                                                      | Live region politeness | Test                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Field and trigger           | the boxes `År`, `Månad`, `Dag` (sv order), then `button, Välj datum`, `not expanded`  | none                   | `date-picker.test.tsx › read aloud › reads the field, then the trigger as a button with a popup that is not expanded`         |
| Open dialog                 | `dialog, Välj ett datum` → heading → `grid, oktober 2026` → the typed day, `selected` | none                   | `date-picker.test.tsx › read aloud › reads the open dialog by its title, then the grid and the typed day as selected`         |
| A day chosen                | `polite: torsdag 15 oktober 2026 vald`                                                | polite                 | `date-picker.test.tsx › read aloud › says "{date} vald" as a polite announcement when a day is chosen`                        |
| Closed with Escape or Close | nothing                                                                               | none                   | `date-picker.test.tsx › announcements › closing with Escape announces nothing` and `… › closing with Close announces nothing` |

The phrases are the virtual screen reader's approximation, not NVDA or JAWS wording, and do not prove modality or focus containment (the component tests do).

## Consumer responsibilities

- **Keep the typed field.** DatePicker never replaces it: typing always works, and it keeps `autocomplete` (1.3.5) and avoids dragging (2.5.7). A DateInput stays in a `Fieldset` with a legend, help text with an example, and an error.
- **Bridge the value.** `value={dateInputValueToIsoDate(boxes)}` (or `maskedDateToIsoDate(text, locale)`) in, and `onValueChange={(date) => setBoxes(isoDateToDateInputValue(date))}` out. Validate the field yourself (`checks.date`, with its `range`).
- **Say the range.** Pass `minimum` and `maximum` and put them in the field's help text too (3.3.2): the dialog's range hint is only visible once it is open.
- **Name the task.** Replace the title with the question ("Välj dag för ditt besök").
- **Place the Popup outside a page `<form>`** (the Dialog keeps its content mounted) and the trigger inside the date's row.
- **Not for** a date of birth or any date far from today: type it. **Not when many days are unavailable:** use radio buttons.
- Everything in `calendar.a11y.md` and `dialog.a11y.md` applies.

## Visual / modes

- Focus indicator: the trigger and Close are Buttons (the 2px ring with an offset); the grid's is in the Calendar contract.
- Target size: the trigger is a Button (44px, 32px compact); day cells 44px, 40px below 40rem (design D10).
- Layout: the trigger is last in the `kv-date-input` row and wraps below the boxes at 320px or 200% text. The popup is as wide as its calendar (`fit-content`) from 40rem and a sheet below it.
- forced-colors behaviour: as the Dialog and the Calendar; the trigger is a Button.
- reduced-motion behaviour: the Dialog's own open motion only.

## WCAG SCs covered

- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.3 Focus Order: every row above; focus lands on the day and returns to the trigger.
- 1.3.1, 4.1.2: roles, names and states of the trigger, dialog and grid (`roles, names and states`, axe).
- 3.3.2 Labels or Instructions: the range hint and the field's help text. 3.3.7 Redundant Entry: the typed date is the starting point. 2.5.7 Dragging Movements: none.
- 4.1.3 Status Messages: `{date} selected` after the dialog has closed.
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

- Whether a screen reader says "{date} selected" after focus lands on the trigger, or drops it, is unproven until the manual matrix runs (design §7.4).
- Children you pass to `DatePicker.Popup` stay mounted while the dialog is closed (the default Calendar does not).
