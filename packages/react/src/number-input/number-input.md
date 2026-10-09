# NumberInput

> **Draft** (Plan 0033). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [number-input.a11y.md](number-input.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in the forms skill.

A quantity or an amount in a form: how many children live with you, the monthly rent, the distance to school in kilometres. A native text box that takes digits and the decimal mark of the page's language, and leaves everything else out. **For a code with leading zeros (a postcode, a case number, a personal identity number) use a [TextInput](../text-input/text-input.md) with a mask**, because a number drops the leading zeros: see its masked examples. For a date, use [DateInput](../date-input/date-input.md).

- Renders a native `<input type="text">` with the number mask by default (`mask={false}` turns it off, another `mask` replaces it), the keypad that fits (`inputmode`), `spellcheck="false"` and the classes `kv-input kv-input--numeric`. Your `className` joins them.
- A text box, not a spin button: the arrow keys move the caret and never step the value, and there are no spinner buttons. It never uses `type="number"`, which changes on the mouse wheel, drops leading zeros, rounds silently and reads the decimal mark by the browser's language.
- Inside a [Field](../field/field.md) it takes its `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from it. Outside a Field it needs `aria-label` or `aria-labelledby`: a dev warning says so.
- With the default number mask, a character it can't take is left out and announced politely, for example "Här kan du bara skriva siffror." With `mask={false}` nothing is left out and nothing is announced. Paste and autofill still work: "1 250,50", "1250.50" and " 2 " are all read.
- **Reported, never enforced.** `min` and `max` become `details.isWithinRange` in `onValueChange`. The value is never clamped or corrected, and `min` and `max` aren't written as attributes, because they're invalid on a text input. Your form validates and writes the message.
- **KvirnUI holds no form state; bring your own form logic.** It renders the `value` you give it and reports changes through `onValueChange`, or keeps the value in the native input for a plain form.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported it is styled.

## API

### Parts

| Part        | Renders                                   | Props                                                                                                                                                                                                                          |
| ----------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NumberInput | `<input type="text">` (flat, one element) | `decimals`, `allowNegative`, `grouping`, `min`, `max`, `mask`, `value`, `defaultValue`, `onValueChange`, `announceRejections`, `messages`, and every native input prop except `type`, `min`, `max`, `value` and `defaultValue` |

`decimals` is the digits after the decimal mark (default 0, which accepts no mark), `allowNegative` accepts a leading minus sign (default `false`), `grouping` writes the whole digits in threes (default `false`), and `min` and `max` are numbers. They are the options of `masks.number()`, in the provider's locale: the mark is a comma in sv, fi, nb, nn and se, and a point in en. A typed `,` or `.` is read as the page's mark. `mask` replaces the number mask or turns it off: see Masks are optional below.

### `onValueChange(value, details)`

`value` is the number as shown, such as `1 250,50`. `details` is the same object as TextInput's with a mask:

| Detail          | Meaning                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `reason`        | Always `'input'`                                                                                                                    |
| `event`         | The change event, or the composition event at the end of an IME or dead key composition                                             |
| `unmaskedValue` | The machine form, `-1234.5`. Parse this, never the shown value. Not set with `mask={false}`, and the mask's own with another `mask` |
| `isWithinRange` | Whether the number is within `min` and `max`. Only present when one of them is set                                                  |
| `isComplete`    | The shape is complete. It doesn't mean the number is right                                                                          |
| `rejected`      | The characters that were left out, by reason                                                                                        |

### What it sets on the `<input>`

| Attribute                                                 | Value                                                                                                                                                                                                                                     |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`, `spellcheck`                                      | `text`, `false`                                                                                                                                                                                                                           |
| `inputmode`                                               | `numeric`, `decimal` with `decimals`, or `text` when `allowNegative` is on, because iOS's numeric keypads have no minus sign. Also with `mask={false}`, from the same props. With a custom `mask`, the one that mask suggests. Yours wins |
| `id`, `aria-describedby`, `aria-invalid`, `aria-required` | From the nearest Field. Your own `aria-describedby` ids come after the Field's, and your `id` is ignored in a Field (use `controlId` on `Field.Root`)                                                                                     |
| `disabled`                                                | Natively, from `disabled` or a disabled Field                                                                                                                                                                                             |

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

A width class is a help text, never a limit: no `maxlength` comes from it.

### Strings

NumberInput has no strings of its own. The number mask, and a custom `mask`, use the mask's three messages, in all six locales (`mask={false}` uses none): `characterNotAllowed` ("Här kan du bara skriva siffror."), `maximumDecimals` ("Du kan inte skriva fler decimaler.", when a digit is past `decimals`) and `maximumLength` ("Du har skrivit alla 3 tecken.", for other masks). Override them per provider, or per instance with `messages={{ characterNotAllowed: () => '…' }}`. `announceRejections={false}` turns the announcements off, for example when you show your own message. **The `KvirnProvider` is required for announcements and for the page's decimal mark:** without one the mask still works in English, nothing is announced, and a development warning says so once.

### Your own element

The NumberInput renders a native `<input>`. To build your own, use `useNumberInput()` and spread `inputProps`: they hold the Field's wiring, the number mask's handlers and the classes.

### Development warnings

Keyed `number-input-*`, English, for the developer only: no accessible name (`number-input-without-name`, `number-input-in-field-without-label`), an `id` inside a Field (`number-input-id-in-field`), `decimals` above 0 in a Field with no help text (`number-input-decimals-without-help-text`), and a custom `mask` in a Field with no help text (`number-input-mask-without-description`, because a mask shapes the input but doesn't explain the format). A whole number with the default mask needs no format help text, and `mask={false}` applies no format, so neither warns. A `mask` that isn't a mask name warns once (`mask-unknown-name:<name>`) and runs no mask, and a country mask by name with no resolvable country warns (`mask-country-unresolved:<name>:<locale>`, then it takes digits only).

## Masks are optional

The number mask is the default, because a NumberInput that takes letters would be a TextInput. The `mask` prop changes that, and what `details.unmaskedValue` means follows the mask:

| `mask`                                                                    | What the input does                                                                                      | `details.unmaskedValue`                                         |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Not set                                                                   | `masks.number()` from `decimals`, `allowNegative`, `grouping`, `min` and `max`, in the provider's locale | The machine form, `-1234.5`                                     |
| `false`                                                                   | A plain numeric text box. Nothing is left out or announced, and no mask details are reported             | Not set. Read `value`, a string as typed, and parse it yourself |
| A name, `{ preset }`, `{ pattern }`, a `RegExp`, or a `Mask` from `masks` | That mask replaces the number mask, with its separators, filter and announcements                        | That mask's: for `digits`, the digits typed                     |

- **`mask={false}`** keeps the keypad (`inputmode` still follows `decimals` and `allowNegative`), `type="text"`, the Field's wiring and the classes. `decimals`, `allowNegative`, `grouping`, `min` and `max` do nothing then, so there is no `isWithinRange`, and the decimal mark isn't applied: say in the help text what format you expect. Neither the `decimals` help text warning nor the mask help text warning is raised. Use it when your form library or your own code reads the typed value and the number mask's filtering is in the way, for instance an amount pasted from a spreadsheet.
- **Another `mask`** ignores the number options too, and a NumberInput in a Field with no help text warns, as a masked TextInput does (3.3.2): say the format and an example in a `Field.HelpText`. A code with leading zeros is still better as a [TextInput](../text-input/text-input.md) with `mask="digits"`.
- **`useNumberInput().mask`** is the mask that runs, before the provider's locale is applied, and `undefined` for `mask={false}`.

## Component

```tsx
import { Field, NumberInput } from '@kvirn-ui/react'

;<Field.Root required>
  <Field.Label>Hur många barn bor hos dig?</Field.Label>
  <NumberInput name="children" min={0} max={12} className="kv-input--width-2" />
  <Field.HelpText>Ett heltal från 0 till 12, till exempel 2.</Field.HelpText>
</Field.Root>
```

## Amounts

With `decimals`, a number has a decimal mark that is a comma in some languages and a point in others, so the help text says it with an example (3.3.2). A NumberInput with `decimals` above 0 in a Field with no help text warns. Leave the currency sign out of the box and say it in the label or the help text ("Skriv beloppet utan valutatecken, till exempel 1 250,50."): a sign typed anyway is a letter to the mask and is left out.

```tsx
<Field.Root required>
  <Field.Label>Hur mycket hyra betalar du per månad?</Field.Label>
  <NumberInput name="rent" decimals={2} grouping min={0} className="kv-input--width-10" />
  <Field.HelpText>Skriv beloppet utan valutatecken, till exempel 1 250,50.</Field.HelpText>
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
  <Field.HelpText>Till exempel 8 450</Field.HelpText>
</Field.Root>
```

## Ranges and errors

`min` and `max` are never enforced and never clamped: the number the user typed stays as typed. `details.isWithinRange` tells your form, which validates after submit and writes an error under the field that says what's wrong and how to fix it. The mask can't know the limit your service has, so state the range in the help text too (a screen reader doesn't read `min` and `max`, because they aren't attributes).

```tsx
<Field.Root required invalid={!isWithinRange}>
  <Field.Label>Hur många barn bor hos dig?</Field.Label>
  <NumberInput
    name="children"
    min={0}
    max={12}
    onValueChange={(value, details) => setIsWithinRange(details.isWithinRange !== false)}
  />
  <Field.HelpText>Ett heltal från 0 till 12, till exempel 2.</Field.HelpText>
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
      <Field.HelpText>Skriv beloppet utan valutatecken, till exempel 1 250,50.</Field.HelpText>
      <Field.ErrorMessage>{field.state.meta.errors.join(', ')}</Field.ErrorMessage>
    </Field.Root>
  )}
</form.Field>
```

### Your part

- A visible label in a Field, and a help text with the format when there are decimals. A placeholder is not the label (3.3.2).
- `autoComplete` where a token exists, never `pattern`, and never block paste (3.3.8).
- Put the unit in the label or the help text, and an Addon only as a visual repeat.
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

`useNumberInput` reads the nearest Field and returns `inputProps` (the Field's wiring, `kv-input kv-input--numeric`, `type="text"`, `inputmode`, `spellcheck={false}`, the mask's change, focus and composition handlers and a `ref` that tracks the value before each edit), the `mask` (the mask that runs, `masks.number()` by default, before the provider's locale is applied; `undefined` for `mask={false}`), `format` and `unmask` for the provider's locale, and the state (`isInvalid`, `isRequired`, `isDisabled`, `isFocusVisible`). It takes the same options as the component, except the native input props.
