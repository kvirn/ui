# NumberInput

> **Draft** (Plan 0033). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [number-input.a11y.md](number-input.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in the forms skill.

A quantity or an amount in a form: how many children live with you, the monthly rent, the distance to school in kilometres. A native text box that takes digits and the decimal mark of the page's language, and leaves everything else out. **For a code with leading zeros (a postcode, a case number, a personal identity number) use a [TextInput](../text-input/text-input.md) with a mask**, because a number drops the leading zeros: see its masked examples. For a date, use [DateInput](../date-input/date-input.md).

- Renders a native `<input type="text">` with the number mask built in, the keypad that fits (`inputmode`), `spellcheck="false"` and the classes `kv-input kv-input--numeric`. Your `className` joins them.
- A text box, not a spin button: the arrow keys move the caret and never step the value, and there are no spinner buttons. It never uses `type="number"`, which changes on the mouse wheel, drops leading zeros, rounds silently and reads the decimal mark by the browser's language.
- Inside a [Field](../field/field.md) it takes its `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from it. Outside a Field it needs `aria-label` or `aria-labelledby`: a dev warning says so.
- A character the mask can't take is left out and announced politely, for example "Här kan du bara skriva siffror." Paste and autofill still work: "1 250,50", "1250.50" and " 2 " are all read.
- **Reported, never enforced.** `min` and `max` become `details.isWithinRange` in `onValueChange`. The value is never clamped or corrected, and `min` and `max` aren't written as attributes, because they're invalid on a text input. Your form validates and writes the message.
- **KvirnUI holds no form state; bring your own form logic.** It renders the `value` you give it and reports changes through `onValueChange`, or keeps the value in the native input for a plain form.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported it is styled.

## API

### Parts

| Part        | Renders                                   | Props                                                                                                                                                                                                                            |
| ----------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NumberInput | `<input type="text">` (flat, one element) | `decimals`, `allowNegative`, `grouping`, `min`, `max`, `value`, `defaultValue`, `onValueChange`, `announceRejections`, `messages`, `render`, and every native input prop except `type`, `min`, `max`, `value` and `defaultValue` |

`decimals` is the digits after the decimal mark (default 0, which accepts no mark), `allowNegative` accepts a leading minus sign (default `false`), `grouping` writes the whole digits in threes (default `false`), and `min` and `max` are numbers. They are the options of `masks.number()`, in the provider's locale: the mark is a comma in sv, fi, nb, nn and se, and a point in en. A typed `,` or `.` is read as the page's mark.

### `onValueChange(value, details)`

`value` is the number as shown, such as `1 250,50`. `details` is the same object as TextInput's with a mask:

| Detail          | Meaning                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| `reason`        | Always `'input'`                                                                        |
| `event`         | The change event, or the composition event at the end of an IME or dead key composition |
| `unmaskedValue` | The machine form, `-1234.5`. Parse this, never the shown value                          |
| `isWithinRange` | Whether the number is within `min` and `max`. Only present when one of them is set      |
| `isComplete`    | The shape is complete. It doesn't mean the number is right                              |
| `rejected`      | The characters that were left out, by reason                                            |

### What it sets on the `<input>`

| Attribute                                                 | Value                                                                                                                                                 |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`, `spellcheck`                                      | `text`, `false`                                                                                                                                       |
| `inputmode`                                               | `numeric`, `decimal` with `decimals`, or `text` when `allowNegative` is on, because iOS's numeric keypads have no minus sign. Yours wins              |
| `id`, `aria-describedby`, `aria-invalid`, `aria-required` | From the nearest Field. Your own `aria-describedby` ids come after the Field's, and your `id` is ignored in a Field (use `controlId` on `Field.Root`) |
| `disabled`                                                | Natively, from `disabled` or a disabled Field                                                                                                         |

| State attribute      | When                                           |
| -------------------- | ---------------------------------------------- |
| `data-invalid`       | The Field is invalid                           |
| `data-required`      | The Field is required                          |
| `data-disabled`      | The input or the Field is disabled             |
| `data-focused`       | While it has focus, however it got it          |
| `data-focus-visible` | While it has focus that came from the keyboard |

### Classes

| Class                                         | Sets                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `kv-input`                                    | The text box's look, shared with TextInput                           |
| `kv-input--numeric`                           | Tabular figures, so digits line up. NumberInput always sets it       |
| `kv-input--width-2`, `-4`, `-6`, `-10`, `-20` | A width by expected characters. Without one, the input is full width |

A width class is a hint, never a limit: no `maxlength` comes from it.

### Strings

NumberInput has no strings of its own. It uses the mask's three messages, in all six locales: `characterNotAllowed` ("Här kan du bara skriva siffror."), `maximumDecimals` ("Du kan inte skriva fler decimaler.", when a digit is past `decimals`) and `maximumLength` ("Du har skrivit alla 3 tecken.", for other masks). Override them per provider, or per instance with `messages={{ characterNotAllowed: () => '…' }}`. `announceRejections={false}` turns the announcements off, for example when you show your own message. **The `KvirnProvider` is required for announcements and for the page's decimal mark:** without one the mask still works in English, nothing is announced, and a development warning says so once.

### `render`

`render` takes an element or a function `(inputProps, state)`, where `state` is `{ isInvalid, isRequired, isDisabled, isFocusVisible }`. It must still render an `<input>`. Spread the props: they hold the Field's wiring, the number mask's handlers and the classes.

### Development warnings

Keyed `number-input-*`, English, for the developer only: no accessible name (`number-input-without-name`, `number-input-in-field-without-label`), an `id` inside a Field (`number-input-id-in-field`), and `decimals` above 0 in a Field with no hint (`number-input-decimals-without-hint`). A whole number needs no format hint, so it doesn't warn.

## Component

```tsx
import { Field, NumberInput } from '@kvirn-ui/react'

;<Field.Root required>
  <Field.Label>Hur många barn bor hos dig?</Field.Label>
  <NumberInput name="children" min={0} max={12} className="kv-input--width-2" />
  <Field.Hint>Ett heltal från 0 till 12, till exempel 2.</Field.Hint>
</Field.Root>
```

## Amounts

With `decimals`, a number has a decimal mark that is a comma in some languages and a point in others, so the hint says it with an example (3.3.2). A NumberInput with `decimals` above 0 in a Field with no hint warns. Leave the currency sign out of the box and say it in the label or the hint ("Skriv beloppet utan valutatecken, till exempel 1 250,50."): a sign typed anyway is a letter to the mask and is left out.

```tsx
<Field.Root required>
  <Field.Label>Hur mycket hyra betalar du per månad?</Field.Label>
  <NumberInput name="rent" decimals={2} grouping min={0} className="kv-input--width-10" />
  <Field.Hint>Skriv beloppet utan valutatecken, till exempel 1 250,50.</Field.Hint>
</Field.Root>
```

## Units in the box

A unit ("kr", "%", "km") goes in an [InputGroup](../input-group/input-group.md) next to the NumberInput. Addons are hidden from screen readers, so the label must still say the unit.

```tsx
<Field.Root required>
  <Field.Label>Månadshyra i kronor</Field.Label>
  <InputGroup.Root>
    <NumberInput name="rent" grouping className="kv-input--width-10" />
    <InputGroup.Addon>kr</InputGroup.Addon>
  </InputGroup.Root>
  <Field.Hint>Till exempel 8 450</Field.Hint>
</Field.Root>
```

## Ranges and errors

`min` and `max` are never enforced and never clamped: the number the user typed stays as typed. `details.isWithinRange` tells your form, which validates after submit and writes an error under the field that says what's wrong and how to fix it. The mask can't know the limit your service has, so state the range in the hint too (a screen reader doesn't read `min` and `max`, because they aren't attributes).

```tsx
<Field.Root required invalid={!isWithinRange}>
  <Field.Label>Hur många barn bor hos dig?</Field.Label>
  <NumberInput
    name="children"
    min={0}
    max={12}
    onValueChange={(value, details) => setIsWithinRange(details.isWithinRange !== false)}
  />
  <Field.Hint>Ett heltal från 0 till 12, till exempel 2.</Field.Hint>
  <Field.ErrorMessage>
    Ange antalet barn som ett tal från 0 till 12, till exempel 2
  </Field.ErrorMessage>
</Field.Root>
```

Validate on submit rather than while the user types, so the error doesn't appear and move the content mid-answer.

## Codes are not numbers

A reference number, a postcode or a personal identity number is a code: `004512` is not 4512, and a Finnish postcode `00100` starts with zeros. Use a [TextInput](../text-input/text-input.md) with `masks.digits()`, `masks.postalCode()` or `masks.personalIdentityNumber()`. Its page has them as masked examples.

## With a form library

Parse `details.unmaskedValue` (the machine form `1250.5`), never the shown value, and keep it in your form state. To show a stored number the way the page writes it, use `useNumberInput`'s `format` (see Hook below) and pass it as `value`. A form submit sends the number as shown, so parse it on the server with the same rules, or send the unmasked value from your state.

```tsx
<form.Field name="rent">
  {(field) => (
    <Field.Root invalid={!field.state.meta.isValid} required>
      <Field.Label>Hur mycket hyra betalar du per månad?</Field.Label>
      <NumberInput
        name={field.name}
        decimals={2}
        grouping
        onValueChange={(value, details) => field.handleChange(details.unmaskedValue ?? '')}
        onBlur={field.handleBlur}
      />
      <Field.Hint>Skriv beloppet utan valutatecken, till exempel 1 250,50.</Field.Hint>
      <Field.ErrorMessage>{field.state.meta.errors.join(', ')}</Field.ErrorMessage>
    </Field.Root>
  )}
</form.Field>
```

### Your part

- A visible label in a Field, and a hint with the format when there are decimals. A placeholder is not the label (3.3.2).
- `autoComplete` where a token exists, never `pattern`, and never block paste (3.3.8).
- Put the unit in the label or the hint, and an Addon only as a visual repeat.
- The `KvirnProvider` around the app, so a left-out character is announced.

## Hook

```tsx
import { mergeProps, useNumberInput } from '@kvirn-ui/react'

function RentInput() {
  const rent = useNumberInput({
    decimals: 2,
    grouping: true,
    onValueChange: (value, details) => form.setValue('rent', details.unmaskedValue),
  })
  // Your own props last, so they win over the mask's suggestions. The handlers chain.
  return <input {...mergeProps(rent.inputProps, { name: 'rent', autoComplete: 'off' })} />
}
```

`useNumberInput` reads the nearest Field and returns `inputProps` (the Field's wiring, `kv-input kv-input--numeric`, `type="text"`, `inputmode`, `spellcheck={false}`, the mask's change, focus and composition handlers and a `ref` that tracks the value before each edit), the `mask` (`masks.number()` before the provider's locale is applied), `format` and `unmask` for the provider's locale, and the state (`isInvalid`, `isRequired`, `isDisabled`, `isFocusVisible`). It takes the same options as the component, except the native input props.
