# DatePicker

> **Draft** (Plan 0084). This page moves to the docs site. The accessibility contract is [date-picker.a11y.md](date-picker.a11y.md) and the design spec is [docs/design/date-picker-and-calendar.md](../../../../docs/design/date-picker-and-calendar.md).

A "Choose date" button next to a typed date. It opens a modal dialog holding a [Calendar](../calendar/calendar.md), so a day near today (a booking, a start date, "last Thursday") can be picked instead of typed. **Typing always works**: DatePicker is an add-on to a [DateInput](../date-input/date-input.md) or to one `masks.date()` field, never the only way to give a date.

## When not to use

- **A date of birth, or any date far from today.** Scrolling months to 1957 is slower than typing. Use only the DateInput.
- **Many days are unavailable** (a few open days a month). A grid of struck-through days is hard to read: offer the open days as radio buttons.
- **A bounded range of a few months with typing not needed:** the Calendar alone is allowed there.

## How it works

- The picker is **controlled only**: it holds no date. Pass the field's date as `value` (`YYYY-MM-DD`, or `''` while it is partial) and write the chosen day back in `onValueChange`. Four functions bridge the field and the ISO date: `dateInputValueToIsoDate` and `isoDateToDateInputValue` for DateInput's `{ year, month, day }` strings (no leading zeros are written), `maskedDateToIsoDate` and `isoDateToMaskedDate` for `masks.date()`.
- The dialog opens on the typed date when it is a real date, else on today, and stays inside `minimum`–`maximum`. A partial or impossible date gives no error from the picker: the form validates it (`checks.date`).
- Choosing an available day (click, Enter or Space) closes the dialog at once, fills the field, returns focus to the trigger (else the first box) and says "{date} selected" politely on the page, after the dialog has closed. Escape and Close change nothing and also return focus to the trigger.
- Put the range in the field's help text as well: the dialog's range hint shows only once it is open.
- Replace the title with the question: `<DatePicker.Title>Choose the date of your visit</DatePicker.Title>`.

**Prefer one input.** The main example is one `masks.date()` field with the trigger beside it: one Tab stop, paste works, and a mobile keyboard shows digits. The three boxes below it stay fully supported.

```tsx
import {
  DatePicker,
  Field,
  TextInput,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useLocale,
} from '@kvirn-ui/react'

const { locale } = useLocale()
;<DatePicker.Root
  value={maskedDateToIsoDate(text, locale)}
  onValueChange={(isoDate) => setText(isoDateToMaskedDate(isoDate, locale))}
>
  <div className="kv-date-picker-row">
    <Field.Root>
      <Field.Label>Start date</Field.Label>
      <TextInput mask={masks.date()} value={text} onValueChange={setText} />
      <Field.HelpText>For example, 2026-10-27</Field.HelpText>
    </Field.Root>
    <DatePicker.Trigger />
  </div>
  <DatePicker.Popup />
</DatePicker.Root>
```

With the three boxes of a [DateInput](../date-input/date-input.md):

```tsx
import {
  DateInput,
  DatePicker,
  Fieldset,
  dateInputValueToIsoDate,
  isoDateToDateInputValue,
} from '@kvirn-ui/react'

;<DatePicker.Root
  value={dateInputValueToIsoDate(date)}
  onValueChange={(isoDate) => setDate(isoDateToDateInputValue(isoDate))}
  minimum="2026-10-01"
  maximum="2026-12-31"
>
  <Fieldset.Root group>
    <Fieldset.Legend>Date of the visit</Fieldset.Legend>
    <DateInput.Root name="visit" value={date} onValueChange={setDate}>
      <DateInput.Day />
      <DateInput.Month />
      <DateInput.Year />
      <DatePicker.Trigger />
    </DateInput.Root>
    <Fieldset.HelpText>
      For example, 27 3 2026. Dates from 1 October to 31 December.
    </Fieldset.HelpText>
  </Fieldset.Root>
  <DatePicker.Popup />
</DatePicker.Root>
```

A DatePicker is mounted closed and never starts open: there is no `defaultOpen`. To show a Calendar without a dialog, render a [Calendar](../calendar/calendar.md) inline in the page.

Put the trigger last in the DateInput row (it wraps below the boxes on a narrow screen). Put the `DatePicker.Popup` outside any page `<form>`: a dialog keeps its content mounted while it is closed. For a masked field put the field and the trigger in `<div className="kv-date-picker-row">`.

## API

| Prop                                                            | Meaning                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`                                                         | The field's date, `YYYY-MM-DD`, or `''`. A value that is not an ISO date warns and opens on today                                                                                                                                                                                      |
| `onValueChange`                                                 | `(date) => void`: an available day was chosen. Write it into the field                                                                                                                                                                                                                 |
| `open`, `onOpenChange`                                          | A DatePicker is mounted closed and never starts open; pass `open` only when you must drive it. `onOpenChange(open, { reason, event })`; `reason` is `'trigger-press'`, `'select'`, `'close-press'`, `'escape'` or `'native-close'` (a press on the backdrop does not close the picker) |
| `minimum`, `maximum`, `isDateUnavailable`, `getDateDescription` | As [Calendar](../calendar/calendar.md)                                                                                                                                                                                                                                                 |
| `weekStart`, `weekNumbers`, `today`                             | As Calendar. `today` is for tests; else the clock, read each time the dialog opens (without a provider `timeZone` a popup that opens after mount starts on the browser's date, with no switch)                                                                                         |
| `messages`                                                      | `datePicker.trigger` and `datePicker.title`                                                                                                                                                                                                                                            |
| `calendarMessages`                                              | Calendar strings, and "{date} selected" after the dialog has closed                                                                                                                                                                                                                    |

Parts: `DatePicker.Root` (no element), `DatePicker.Trigger` (`<button class="kv-button kv-date-picker-trigger">` with the calendar icon and "Choose date"; `aria-haspopup="dialog"`, `aria-expanded`), `DatePicker.Popup` (the Dialog's popup, `kv-date-picker-popup`; without children it holds the Title, Close and the Calendar), `DatePicker.Title` (`<h2>`), `DatePicker.Calendar` (a `Calendar.Root` with the picker's range and value, mounted only while the dialog is open). Messages: `datePicker.trigger`, `datePicker.title`.

## Hook

`useDatePicker(options)` returns `triggerProps`, `popupProps`, `titleProps`, `closeProps`, `registerTitle`, `calendarProps` (spread on `Calendar.Root` while `isOpen`), `triggerText` and `titleText` for your own markup.

## Dev warnings

`date-picker-invalid-value` and `date-picker-<part>-outside-root` are listed on Foundation / Dev warnings.
