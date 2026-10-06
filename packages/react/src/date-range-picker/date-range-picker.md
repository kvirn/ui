# DateRangePicker

> **Draft** (Plan 0089). This page moves to the docs site. The accessibility contract is [date-range-picker.a11y.md](date-range-picker.a11y.md) and the design spec is [docs/design/date-range.md](../../../../docs/design/date-range.md).

One "Choose dates" button after a **From** and a **To** date. It opens a modal dialog holding a range [Calendar](../calendar/calendar.md): two months side by side from 64rem, one below. A stay, a leave or a closure can be picked in two presses instead of typed. **Typing always works**: DateRangePicker is an add-on to two typed fields, never the only way to give a range.

## When not to use

- **A range far from today** (a date of birth, an old period). Scrolling months is slower than typing: use only the fields.
- **Many days are unavailable** (a few open days a month). Offer the open days as radio buttons.
- **One date.** Use [DatePicker](../date-picker/date-picker.md).
- **A range that is always the same length** (a week, a month). Ask for the start and compute the end.

## How it works

- **Controlled only.** The picker holds no date. Pass the fields' range as `value` (`{ start, end }`, `YYYY-MM-DD`, `''` for an empty end) and write the chosen range back in `onValueChange`, which is called **once**, when the end is chosen. The bridge functions work per end: `maskedDateToIsoDate` and `isoDateToMaskedDate` for `masks.date()`, `dateInputValueToIsoDate` and `isoDateToDateInputValue` for DateInput's `{ year, month, day }`.
- **Two presses.** The first press sets the start, the second the end (Enter, Space or a click). The step line in the dialog says which is next, and the first press is announced: "Startdatum fredag 16 oktober 2026. Välj slutdatum."
- **The end closes the dialog at once,** fills both fields, returns focus to the trigger (else the first box of the group around it) and says "{start} to {end} selected, {length}" on the page, after the dialog has closed. There is no Done button.
- **A day that can't be the end starts a new range:** before the start, too short, too long, or past an unavailable day. It becomes the new start, and the day's own name said why before it was pressed. The first field never gets a day the user did not press as a start.
- **Escape and Close discard the half-chosen range.** Both fields stay as they were and the next opening starts from the typed range.
- **It opens on** the typed start, else the typed end, else today. A start only opens at the end step; an end only, at the start step; an end typed before the start opens on the start and is never rewritten. A partial or impossible text counts as no date: the form validates it.
- **Limits.** `minimum` and `maximum` bound the days; `minimumDays` and `maximumDays` bound the span **in days, both ends counted** (a one-day range is 1). A booking of 14 nights is `maximumDays={15}`. Say the limit in the help text, in the user's unit. Unavailable days block a range unless `allowUnavailableInRange` is set (leave across a holiday).
- **The picker never produces a reversed or over-long range;** a typed one can be, and validating it is the form's job. Put the error on the To field.
- **No `defaultOpen`.** The picker is mounted closed; only a controlled `open` can open it from outside.

**Prefer one input per end.** The main example is two `masks.date()` fields with the trigger after both: one Tab stop each, paste works, and a mobile keyboard shows digits. Each field keeps its own label and its own example.

```tsx
import {
  DateRangePicker,
  Field,
  Fieldset,
  TextInput,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useLocale,
} from '@kvirn-ui/react'

const { locale } = useLocale()
;<DateRangePicker.Root
  value={{ start: maskedDateToIsoDate(from, locale), end: maskedDateToIsoDate(to, locale) }}
  onValueChange={(range) => {
    setFrom(isoDateToMaskedDate(range.start, locale))
    setTo(isoDateToMaskedDate(range.end, locale))
  }}
  maximumDays={15}
>
  <Fieldset.Root group>
    <Fieldset.Legend>Dates of your stay</Fieldset.Legend>
    <div className="kv-date-range-row">
      <Field.Root>
        <Field.Label>Arrival</Field.Label>
        <TextInput mask={masks.date()} value={from} onValueChange={setFrom} />
        <Field.HelpText>For example, 2026-10-27</Field.HelpText>
      </Field.Root>
      <Field.Root>
        <Field.Label>Departure</Field.Label>
        <TextInput mask={masks.date()} value={to} onValueChange={setTo} />
        <Field.HelpText>For example, 2026-10-27</Field.HelpText>
      </Field.Root>
      <DateRangePicker.Trigger />
    </div>
    <Fieldset.HelpText>Up to 14 nights.</Fieldset.HelpText>
  </Fieldset.Root>
  <DateRangePicker.Popup />
</DateRangePicker.Root>
```

**The three-box alternative** is fully supported: an outer group Fieldset (the question) holding two group Fieldsets ("Start date", "End date"), each a [DateInput](../date-input/date-input.md) with its own help text and error, and the trigger after the end's boxes. The row stacks below 64rem.

```tsx
<DateRangePicker.Root
  value={{ start: dateInputValueToIsoDate(from), end: dateInputValueToIsoDate(to) }}
  onValueChange={(range) => {
    setFrom(isoDateToDateInputValue(range.start))
    setTo(isoDateToDateInputValue(range.end))
  }}
>
  <Fieldset.Root group>
    <Fieldset.Legend>Dates of your stay</Fieldset.Legend>
    <Fieldset.Root group>
      <Fieldset.Legend>Start date</Fieldset.Legend>
      <DateInput.Root value={from} onValueChange={setFrom}>
        <DateInput.Day /> <DateInput.Month /> <DateInput.Year />
      </DateInput.Root>
    </Fieldset.Root>
    <Fieldset.Root group>
      <Fieldset.Legend>End date</Fieldset.Legend>
      <DateInput.Root value={to} onValueChange={setTo}>
        <DateInput.Day /> <DateInput.Month /> <DateInput.Year />
        <DateRangePicker.Trigger />
      </DateInput.Root>
    </Fieldset.Root>
  </Fieldset.Root>
  <DateRangePicker.Popup />
</DateRangePicker.Root>
```

## Parts

| Part                       | Renders                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `DateRangePicker.Root`     | nothing: owns the open state and the draft range                        |
| `DateRangePicker.Trigger`  | the one `<button>` after both fields, "Choose dates"                    |
| `DateRangePicker.Popup`    | the modal `<dialog>`: Title, Close and the Calendar (mounted only open) |
| `DateRangePicker.Title`    | the dialog's `<h2>`; replace it with the question                       |
| `DateRangePicker.Calendar` | the range Calendar with the picker's draft and limits; compose your own |

The hook `useDateRangePicker` returns the same props for your own markup. Messages: `dateRangePicker.trigger` and `dateRangePicker.title`, and the Calendar's own through `calendarMessages` (`rangeSelected` for the sentence said after the dialog closes). The default theme styles the row (`kv-date-range-row`) and the popup (`kv-date-range-picker-popup`), and adds no token.
