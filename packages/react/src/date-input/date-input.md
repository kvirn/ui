# DateInput

> **Draft** (Plan 0013, Phase 3). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [date-input.a11y.md](date-input.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md) §6.6, and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** DateInput renders what it's given. It keeps no value, never parses the date and doesn't validate it: the value is three strings in your form state, or in the native inputs.

A DateInput asks for a date in three text boxes: day, month and year, in the order the user's region writes dates in. Use it for a date people know by heart, such as a date of birth or the date on a letter. For a date picked from a calendar near today, use the DatePicker when it exists (planned, M4); it will also accept typed input. When you want the date in one field, use `Input` with `masks.date()` (see "One field instead of three" below).

- Four parts: `DateInput.Root` (a `<div>`, the row of boxes) and `DateInput.Day`, `DateInput.Month` and `DateInput.Year`. Each box is a Field with a visible label and a native text `Input`. Each is also exported on its own (`DateInputRoot`, `DateInputDay`, `DateInputMonth`, `DateInputYear`), which is the form to import in a React Server Component, and the hook is `useDateInput`.
- It goes inside a `Fieldset.Root` (use `group`) whose `Fieldset.Legend` asks the question, then the boxes, a `Fieldset.Hint` under them with an example, and a `Fieldset.ErrorMessage`. The legend names the group, and the hint and the error describe it. Without a group the Root warns, and it warns when the Fieldset is neither `group` nor `required`: an optional date shows "(valfritt)" only on a `group` legend.
- **The order follows the region.** `sv-SE` is year, month, day. `sv-FI`, `fi`, `nb`, `nn` and `en-GB` are day, month, year. A result that starts with the month (`en`, `en-US`) becomes day first, because month first reads as day first for the EU readers this library serves. The order comes from `Intl`, so we keep no data of our own.
- **Three Tab stops, in that order.** Filling a box never moves focus to the next (3.2.2), and the arrow keys never step a value: numbers are text.
- **Every value is a string, as typed.** `007`, `13` and letters stay as they are. You validate the date and write the error.
- Headless: no CSS. The parts render `kv-date-input`, `kv-date-input-day`, `kv-date-input-month` and `kv-date-input-year`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## API

| Part              | Renders                                                                      | Props                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DateInput.Root`  | `<div class="kv-date-input">`                                                | `name`, `value`, `defaultValue`, `onValueChange`, `autoComplete`, `order`, `required`, `disabled`, `readOnly`, `invalidParts`, `messages`, `render`, `ref` and every div prop |
| `DateInput.Day`   | `<div class="kv-field kv-date-input-day">` with a `<label>` and an `<input>` | `invalid`, `render` (for the input), `ref` (the input) and every `Input` prop except `type`, `value`, `defaultValue`, `onValueChange` and `mask`. Spread on the `<input>`     |
| `DateInput.Month` | the same, `kv-date-input-month`                                              | the same                                                                                                                                                                      |
| `DateInput.Year`  | the same, `kv-date-input-year`                                               | the same                                                                                                                                                                      |

Props the controls can't show:

| Prop            | On               | What it does                                                                                                                              |
| --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | Root             | Controlled: `{ year, month, day }`, all strings (`''` for an empty box). Pair it with `onValueChange`                                     |
| `defaultValue`  | Root             | Uncontrolled: any of `year`, `month` and `day`, as the text each box starts with                                                          |
| `onValueChange` | Root             | `(value, { reason: 'input', part, event })`. `value` is the whole date as the boxes show it, `part` the box that changed. It only reports |
| `order`         | Root             | `['year', 'month', 'day']` and so on. Replaces the locale's order when the Root renders the boxes itself                                  |
| `invalidParts`  | Root             | The wrong boxes, for the boxes the Root renders itself: `['year']`. With your own children, set `invalid` on each box                     |
| `invalid`       | Day, Month, Year | This box is wrong. The Fieldset's `invalid` marks none of the boxes                                                                       |
| `render`        | all              | Another element. On Day, Month and Year it changes the `<input>`, which it must still render                                              |

What the parts do on their own:

- Without children, the Root renders Day, Month and Year in the locale's order. With children, the order is yours.
- Every box is a Field, so it gets `id`, a `<label for>` and `data-*` state from its own Field. The Root puts the boxes in a group Field, so a label never ends with "(valfritt)".
- `required` and `disabled` default to the Fieldset's. `required` is `aria-required="true"` on the three boxes, and `disabled` is native `disabled`.
- `name="birth"` gives the boxes `birth-day`, `birth-month` and `birth-year`. A `name` on one box wins.
- `autoComplete="bday"` gives `bday-day`, `bday-month` and `bday-year`.
- Every box has `inputMode="numeric"` and `spellCheck={false}`. There is no `maxLength`, no `pattern` and no placeholder.

| State attribute      | On                               | When                                                                                 |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| `data-invalid`       | the box's field, label and input | The box is `invalid` or in `invalidParts`. The input also gets `aria-invalid="true"` |
| `data-required`      | the box's field and label        | The Fieldset or the Root is `required`                                               |
| `data-disabled`      | the box's field, label and input | The Fieldset or the Root is `disabled`                                               |
| `data-focus-visible` | the input                        | Keyboard focus (the `Input`'s own)                                                   |

| Classes for the default theme          | On              | Sets                                                                         |
| -------------------------------------- | --------------- | ---------------------------------------------------------------------------- |
| `kv-date-input`                        | Root            | A row that wraps, 16px between the boxes (12px with `kv-compact` from 64rem) |
| `kv-date-input-day`, `-month`, `-year` | the box's field | The box's width: two characters for the day and the month, four for the year |

| Message key       | sv      | en      | Used for              |
| ----------------- | ------- | ------- | --------------------- |
| `dateInput.day`   | `Dag`   | `Day`   | The day box's label   |
| `dateInput.month` | `Månad` | `Month` | The month box's label |
| `dateInput.year`  | `År`    | `Year`  | The year box's label  |

Override them with `messages` on the Root, per provider, or in your catalog. `se` is English.

## Component

```tsx
import { DateInput, Fieldset } from '@kvirn-ui/react'

;<Fieldset.Root group required invalid={error !== undefined}>
  <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
  <DateInput.Root name="birth" autoComplete="bday" invalidParts={error?.parts} />
  <Fieldset.Hint>Till exempel 1990 3 27</Fieldset.Hint>
  <Fieldset.ErrorMessage>{error?.message}</Fieldset.ErrorMessage>
</Fieldset.Root>
```

The question is the legend. The hint is under the boxes, and the error is the last part, so the visual order is the `aria-describedby` order. The boxes are in the order of the page's locale, set by the nearest `KvirnProvider`.

### The hint is yours, in the order of the boxes

KvirnUI supplies the names of the boxes ("Dag", "Månad", "År"), not the example. The hint is yours, and its example follows the order the boxes are in (3.3.2). The default order is the region's, so write one example per order:

| Locale        | Order            | Hint example           |
| ------------- | ---------------- | ---------------------- |
| `sv-SE`, `sv` | year, month, day | Till exempel 1990 3 27 |
| `sv-FI`       | day, month, year | Till exempel 27 3 1990 |
| `fi`          | day, month, year | Esimerkiksi 27 3 1990  |
| `nb`, `nn`    | day, month, year | For eksempel 27 3 1990 |
| `en`, `en-GB` | day, month, year | For example, 27 3 1990 |

Read the order with the hook, so the hint and the boxes can't disagree:

```tsx
const { order } = useDateInput()

;<>
  <DateInput.Root name="birth" autoComplete="bday" />
  <Fieldset.Hint>
    {order[0] === 'year' ? 'Till exempel 1990 3 27' : 'Till exempel 27 3 1990'}
  </Fieldset.Hint>
</>
```

### Your own order

A service that must match a paper form writes the parts itself. The hint then follows the order it chose.

```tsx
<DateInput.Root name="birth" autoComplete="bday">
  <DateInput.Day />
  <DateInput.Month />
  <DateInput.Year />
</DateInput.Root>
```

### One field instead of three

Three boxes suit a date people know by heart. Ask in one field when people read the date off a document, are used to typing `19850412`, or when you need a text field for another component. Use an `Input` with `masks.date()` inside a `Field`, not a DateInput:

```tsx
import { Field, Input, masks, checks } from '@kvirn-ui/react'

;<Field.Root required>
  <Field.Label>Startdatum</Field.Label>
  <Input
    name="start"
    mask={masks.date()}
    className="kv-input--width-10"
    onValueChange={(value, details) => {
      // details.unmaskedValue is '2026-10-04' once the date is complete, else ''.
      checks.date(details.unmaskedValue, { min: '2026-01-01' }) // { isValid, reason }
    }}
  />
  <Field.Hint>Till exempel 2026-10-27</Field.Hint>
</Field.Root>
```

The mask follows the page's locale like the boxes do (`2026-10-27` in sv, `27.10.2026` in fi and nb, `27/10/2026` in en), and the hint gives an example in that form. A separator typed after a day or month closes it (`4.10.2026`), a pasted or autofilled ISO date is reformatted, and the value you store is the ISO date. The mask checks the shape only: validate the day and any range with `checks.date`. It is a native text input with one Tab stop and the keys of [Input](../input/input.md). The calendar DatePicker is a later component and will use `masks.date()` for its text field. Don't set `autoComplete="bday"` on a one-field date of birth: use DateInput, whose boxes map to `bday-day`, `bday-month` and `bday-year`.

### Errors

One message for the whole date in `Fieldset.ErrorMessage`, under the boxes, and `invalid` on the wrong boxes only. "Födelsedatumet måste innehålla ett år" marks the Year box. "Födelsedatumet måste vara ett riktigt datum" marks all three. Say what is wrong and how to fix it, in the user's words ("Ange ditt födelsedatum", not "Ogiltigt värde"). On submit, move focus to the first invalid box, or to the first box when the whole date is wrong.

The Fieldset's `invalid` is the group's: it shows the message and marks the legend and hint, but none of the boxes. A box that is `invalid` is not linked to the message of its own (the date has one message, in the group's description).

### The value

Pass `value` and `onValueChange` from your form state, or `defaultValue` and `name` for a plain `<form>`. TanStack Form, React Hook Form and the like fit the same way: the value is a plain object of three strings.

```tsx
const [birth, setBirth] = useState<DateInputValue>({ year: '', month: '', day: '' })

<DateInput.Root value={birth} onValueChange={setBirth} />
```

Nothing is padded, cut or checked: `3` stays `3`, and `31` in the month box stays `31` until your form says it is wrong.

### Your part

- A `Fieldset.Legend` that asks the question, first in the Fieldset. Use `group`, so an optional date gets "(valfritt)" on its legend.
- A date of birth gets `autoComplete="bday"`. Any other date gets none (1.3.5).
- Validate the date yourself, and write the messages in the user's words.
- Don't move focus to the next box when one is full, and don't change the value with the arrow keys. DateInput doesn't, and a handler of yours would break paste, autofill and dictation (3.2.2).
- Don't use `type="date"`: its format and picker follow the browser, not the page language.

## Hook

For your own markup, `useDateInput` returns the props:

```tsx
import { Field, Fieldset, Input, useDateInput } from '@kvirn-ui/react'

function Birth() {
  const dateInput = useDateInput({ name: 'birth', autoComplete: 'bday' })
  return (
    <Fieldset.Root group required>
      <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
      <div {...dateInput.rootProps}>
        {dateInput.order.map((part) => (
          <Field.Root key={part} {...dateInput.getBoxProps(part)}>
            <Field.Label>{dateInput.labels[part]}</Field.Label>
            <Input {...dateInput.getInputProps(part)} />
          </Field.Root>
        ))}
      </div>
    </Fieldset.Root>
  )
}
```

`useDateInput({ name, value, defaultValue, onValueChange, autoComplete, order, readOnly, messages })` returns `order`, `labels`, `rootProps`, `getBoxProps(part)` (the class that sizes the box) and `getInputProps(part)` (`name`, `inputMode`, `spellCheck`, `autoComplete`, `value` or `defaultValue`, `readOnly`, `onChange` and a `ref` that lets it read the other two boxes). Mark an invalid box with `aria-invalid` and `data-invalid` yourself.

### `render`

`DateInput.Root` takes `render` to change its element, and Day, Month and Year to change their `<input>`. The part's props are merged into yours: class names join, handlers chain and refs merge.

```tsx
<DateInput.Day render={(props) => <input {...props} data-testid="day" />} />
```
