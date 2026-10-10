# DateInput

> **Draft** (Plan 0013, Phase 3). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [date-input.a11y.md](date-input.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md) §6.6, and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** DateInput renders what it's given. It keeps no value, never parses the date and doesn't validate it: the value is three strings in your form state, or in the native inputs.

**Prefer one input.** For most dates, ask in one `TextInput` with `masks.date()` (see "One field instead of three" below, and the first story). The user knows the date by heart and types it in one go, there is one Tab stop instead of three, a pasted or autofilled date is reformatted, and a mobile keyboard shows digits. The three boxes below stay fully supported, for when you want separate labelled day, month and year, for screen reader users who prefer them, for a date of birth with `autoComplete="bday"`, and for auto-advance.

A DateInput asks for a date in three text boxes: day, month and year, in the order the user's region writes dates in. Use it for a date people know by heart, such as a date of birth or the date on a letter. For a date picked from a calendar near today, add a [DatePicker](../date-picker/date-picker.md) button after either form.

- Four parts: `DateInput.Root` (a `<div>`, the row of boxes) and `DateInput.Day`, `DateInput.Month` and `DateInput.Year`. Each box is a Field with a visible label and a native text `TextInput`. Each is also exported on its own (`DateInputRoot`, `DateInputDay`, `DateInputMonth`, `DateInputYear`), which is the form to import in a React Server Component, and the hook is `useDateInput`.
- It goes inside a `Fieldset.Root` (use `group`) whose `Fieldset.Legend` asks the question, then the boxes, a `Fieldset.HelpText` under them with an example, and a `Fieldset.ErrorMessage`. The legend names the group, and the hint and the error describe it. Without a group the Root warns, and it warns when the Fieldset is neither `group` nor `required`: an optional date shows "(valfritt)" only on a `group` legend.
- **The order follows the region.** `sv-SE` is year, month, day. `sv-FI`, `fi`, `nb`, `nn` and `en-GB` are day, month, year. A result that starts with the month (`en`, `en-US`) becomes day first, because month first reads as day first for the EU readers this library serves. The order comes from `Intl`, so we keep no data of our own.
- **Three Tab stops, in that order, and typing a full box moves on.** When the user's typing fills a box (two digits for day and month, four for year), focus moves to the next box with its text selected, so a date is typed without Tab. It is on by default, with a visible hint under the boxes that is part of the group's description, and `autoAdvance={false}` turns both off. The arrow keys never step a value: numbers are text. See "Auto-advance" below.
- **Every value is a string, as typed.** `007`, `13` and letters stay as they are. You validate the date and write the error.
- Headless: no CSS. The parts render `kv-date-input`, `kv-date-input-day`, `kv-date-input-month` and `kv-date-input-year`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## API

| Part              | Renders                                                                      | Props                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DateInput.Root`  | `<div class="kv-date-input">`                                                | `name`, `value`, `defaultValue`, `onValueChange`, `autoComplete`, `required`, `disabled`, `readOnly`, `autoAdvance`, `invalidParts`, `messages`, `ref` and every div prop |
| `DateInput.Day`   | `<div class="kv-field kv-date-input-day">` with a `<label>` and an `<input>` | `invalid`, `ref` (the input) and every `TextInput` prop except `type`, `value`, `defaultValue`, `onValueChange` and `mask`. Spread on the `<input>`                       |
| `DateInput.Month` | the same, `kv-date-input-month`                                              | the same                                                                                                                                                                  |
| `DateInput.Year`  | the same, `kv-date-input-year`                                               | the same                                                                                                                                                                  |

Props the controls can't show:

| Prop            | On               | What it does                                                                                                                              |
| --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | Root             | Controlled: `{ year, month, day }`, all strings (`''` for an empty box). Pair it with `onValueChange`                                     |
| `defaultValue`  | Root             | Uncontrolled: any of `year`, `month` and `day`, as the text each box starts with                                                          |
| `onValueChange` | Root             | `(value, { reason: 'input', part, event })`. `value` is the whole date as the boxes show it, `part` the box that changed. It only reports |
| `autoAdvance`   | Root, hook       | Default `true`: focus moves to the next box when typing fills a box, and the hint shows. `false`: typing never moves focus, no hint       |
| `invalidParts`  | Root             | The wrong boxes, for the boxes the Root renders itself: `['year']`. With your own children, set `invalid` on each box                     |
| `invalid`       | Day, Month, Year | This box is wrong. The Fieldset's `invalid` marks none of the boxes                                                                       |

What the parts do on their own:

- Without children, the Root renders Day, Month and Year in the locale's order. With children, the order is yours.
- Every box is a Field, so it gets `id`, a `<label for>` and `data-*` state from its own Field. The Root puts the boxes in a group Field, so a label never ends with "(valfritt)".
- `required` and `disabled` default to the Fieldset's. `required` is `aria-required="true"` on the three boxes, and `disabled` is native `disabled`.
- `name="birth"` gives the boxes `birth-day`, `birth-month` and `birth-year`. A `name` on one box wins.
- `autoComplete="bday"` gives `bday-day`, `bday-month` and `bday-year`.
- While `autoAdvance` is on, the Root renders the hint (`<p class="kv-field-help-text">`) right after the row of boxes and registers it as one of the Fieldset's descriptions, so the group's `aria-describedby` lists it in DOM order, before your own `Fieldset.HelpText`. Outside a Fieldset (a native `<fieldset>` of your own) it is plain text with no id.
- Every box has `inputMode="numeric"` and `spellCheck={false}`. There is no native `maxlength`, no `pattern` and no placeholder. Typing stops at the box's own number of digits (two for day and month, four for year): the key that would go past it is refused. A paste is never cut, so the consumer validates it.

| State attribute      | On                               | When                                                                                 |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| `data-invalid`       | the box's field, label and input | The box is `invalid` or in `invalidParts`. The input also gets `aria-invalid="true"` |
| `data-required`      | the box's field and label        | The Fieldset or the Root is `required`                                               |
| `data-disabled`      | the box's field, label and input | The Fieldset or the Root is `disabled`                                               |
| `data-focus-visible` | the input                        | Keyboard focus (the `TextInput`'s own)                                               |

| Classes for the default theme          | On              | Sets                                                                         |
| -------------------------------------- | --------------- | ---------------------------------------------------------------------------- |
| `kv-date-input`                        | Root            | A row that wraps, 16px between the boxes (12px with `kv-compact` from 64rem) |
| `kv-date-input-day`, `-month`, `-year` | the box's field | The box's width: two characters for the day and the month, four for the year |

| Message key                 | sv                                                   | en                                                | Used for                                                                                |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `dateInput.day`             | `Dag`                                                | `Day`                                             | The day box's label                                                                     |
| `dateInput.month`           | `Månad`                                              | `Month`                                           | The month box's label                                                                   |
| `dateInput.year`            | `År`                                                 | `Year`                                            | The year box's label                                                                    |
| `dateInput.autoAdvanceHint` | `Fokus flyttas till nästa ruta när en ruta är full.` | `Focus moves to the next box when a box is full.` | The visible hint under the boxes, in the group's description, while `autoAdvance` is on |

Override them with `messages` on the Root, per provider, or in your catalog.

## Component

```tsx
import { DateInput, Fieldset } from '@kvirn-ui/react'

;<Fieldset.Root group required invalid={error !== undefined}>
  <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
  <DateInput.Root name="birth" autoComplete="bday" invalidParts={error?.parts} />
  <Fieldset.HelpText>Till exempel 1990 3 27</Fieldset.HelpText>
  <Fieldset.ErrorMessage>{error?.message}</Fieldset.ErrorMessage>
</Fieldset.Root>
```

The question is the legend. The help text is under the boxes, and the error is the last part, so the visual order is the `aria-describedby` order. The boxes are in the order of the page's locale, set by the nearest `KvirnProvider`.

### The help text is yours, in the order of the boxes

KvirnUI supplies the names of the boxes ("Dag", "Månad", "År"), not the example. The help text is yours, and its example follows the order the boxes are in (3.3.2). The default order is the region's, so write one example per order:

| Locale        | Order            | Help text example      |
| ------------- | ---------------- | ---------------------- |
| `sv-SE`, `sv` | year, month, day | Till exempel 1990 3 27 |
| `sv-FI`       | day, month, year | Till exempel 27 3 1990 |
| `fi`          | day, month, year | Esimerkiksi 27 3 1990  |
| `nb`, `nn`    | day, month, year | For eksempel 27 3 1990 |
| `en`, `en-GB` | day, month, year | For example, 27 3 1990 |

Read the order with the hook, so the help text and the boxes can't disagree:

```tsx
const { order } = useDateInput()

;<>
  <DateInput.Root name="birth" autoComplete="bday" />
  <Fieldset.HelpText>
    {order[0] === 'year' ? 'Till exempel 1990 3 27' : 'Till exempel 27 3 1990'}
  </Fieldset.HelpText>
</>
```

### Your own order

A service that must match a paper form writes the parts itself. The help text then follows the order it chose.

```tsx
<DateInput.Root name="birth" autoComplete="bday">
  <DateInput.Day />
  <DateInput.Month />
  <DateInput.Year />
</DateInput.Root>
```

### One field instead of three

Three boxes suit a date people know by heart. Ask in one field when people read the date off a document, are used to typing `19850412`, or when you need a text field for another component. Use a `TextInput` with `masks.date()` inside a `Field`, not a DateInput:

```tsx
import { Field, TextInput, masks, checks } from '@kvirn-ui/react'

;<Field.Root required>
  <Field.Label>Startdatum</Field.Label>
  <TextInput
    name="start"
    mask={masks.date()}
    className="kv-input--width-10"
    onValueChange={(value, details) => {
      // details.unmaskedValue is '2026-10-04' once the date is complete, else ''.
      checks.date(details.unmaskedValue, { min: '2026-01-01' }) // { isValid, reason }
    }}
  />
  <Field.HelpText>Till exempel 2026-10-27</Field.HelpText>
</Field.Root>
```

The mask follows the page's locale like the boxes do (`2026-10-27` in sv, `27.10.2026` in fi and nb, `27/10/2026` in en), and the help text gives an example in that form. A separator typed after a day or month closes it (`4.10.2026`), a pasted or autofilled ISO date is reformatted, and the value you store is the ISO date. The mask checks the shape only: validate the day and any range with `checks.date`. It is a native text input with one Tab stop and the keys of [TextInput](../text-input/text-input.md). The [DatePicker](../date-picker/date-picker.md) takes this field's date with `maskedDateToIsoDate`. Don't set `autoComplete="bday"` on a one-field date of birth: use DateInput, whose boxes map to `bday-day`, `bday-month` and `bday-year`.

### Auto-advance

Typing a date without Tab is what people expect, so focus moves forward when a box is full. It deviates from the keyboard practice that typing never moves focus (3.2.2 On Input), so the maintainer approved it for DateInput only (Plan 0040), with these guards:

- It moves only when the user's own typing makes a box full, and never from the last box. The next box is the next one in the DOM, which is the Tab order, and never a disabled one.
- It never moves on paste, drop, autofill, deletion, a prefilled or controlled value, text that is not digits, or when the box was already full and the user edits it. Backspace and Delete never move focus, not even back from an empty box. Shift+Tab and Tab are the browser's.
- Users are told before they type: the hint under the boxes says it, in the group's description, in every locale. Never hide it.
- The next box's text is selected, so typing replaces a prefilled value.
- `autoAdvance={false}` is the opt-out for services that follow the stricter reading. OneTimeCode, TextInput and every other control never move focus on typing.

A year of fewer than four digits (`0999`) always needs Tab. People who dictate or use a switch trigger the advance the same way as with a keyboard.

```tsx
<DateInput.Root name="birth" autoAdvance={false} />
```

### Errors

One message for the whole date in `Fieldset.ErrorMessage`, under the boxes, and `invalid` on the wrong boxes only. "Födelsedatumet måste innehålla ett år" marks the Year box. "Födelsedatumet måste vara ett riktigt datum" marks all three. Say what is wrong and how to fix it, in the user's words ("Ange ditt födelsedatum", not "Ogiltigt värde"). On submit, move focus to the first invalid box, or to the first box when the whole date is wrong.

The Fieldset's `invalid` is the group's: it shows the message and marks the legend and help text, but none of the boxes. A box that is `invalid` is not linked to the message of its own (the date has one message, in the group's description).

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
- Don't add your own focus move between the boxes, and don't change the value with the arrow keys. DateInput advances by itself, and a handler of yours would double it or break paste, autofill and dictation (3.2.2).
- Don't use `type="date"`: its format and picker follow the browser, not the page language.

## Hook

For your own markup, `useDateInput` returns the props:

```tsx
import { Field, Fieldset, TextInput, useDateInput } from '@kvirn-ui/react'

function Birth() {
  const dateInput = useDateInput({ name: 'birth', autoComplete: 'bday' })
  return (
    <Fieldset.Root group required>
      <Fieldset.Legend>Födelsedatum</Fieldset.Legend>
      <div {...dateInput.rootProps}>
        {dateInput.order.map((part) => (
          <Field.Root key={part} {...dateInput.getBoxProps(part)}>
            <Field.Label>{dateInput.labels[part]}</Field.Label>
            <TextInput {...dateInput.getInputProps(part)} />
          </Field.Root>
        ))}
      </div>
      {dateInput.autoAdvanceHint === undefined ? null : (
        <Fieldset.HelpText>{dateInput.autoAdvanceHint}</Fieldset.HelpText>
      )}
    </Fieldset.Root>
  )
}
```

`useDateInput({ name, value, defaultValue, onValueChange, autoComplete, readOnly, autoAdvance, messages })` returns `order`, `labels`, `autoAdvanceHint` (the message while `autoAdvance` is on, else `undefined`: render it as visible text and list its id in the group's description), `rootProps`, `getBoxProps(part)` (the class that sizes the box) and `getInputProps(part)` (`name`, `inputMode`, `spellCheck`, `autoComplete`, `value` or `defaultValue`, `readOnly`, `onChange`, which also does the auto-advance, and a `ref` that lets it read the other two boxes and watch their `beforeinput`). Mark an invalid box with `aria-invalid` and `data-invalid` yourself.

### Your own element

The parts render fixed elements. To build your own, use `useDateInput()` and spread `rootProps` and `getInputProps(part)`.
