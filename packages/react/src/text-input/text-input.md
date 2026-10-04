# TextInput

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [text-input.a11y.md](text-input.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** TextInput is the text box of a [Field](../field/field.md): a native `<input>` for words and codes, such as a name, an email address, a phone number, a case number, a postcode or a personal identity number. It renders the `value` you give it, reports changes up through `onValueChange`, never copies the value into state of its own, and doesn't validate. Use it with TanStack Form, React Hook Form, your own `useState`, or a plain `<form>`.

For a quantity or an amount, use [NumberInput](../number-input/number-input.md). For a date, use [DateInput](../date-input/date-input.md). A code with leading zeros stays a TextInput with a mask, because a number would drop the zeros (see Codes and numbers below).

- A native `<input>` with a text-like `type`: `text` (the default), `email`, `tel`, `url`, `password` or `search`. The browser supplies the role, the keyboard, selection, paste and autofill.
- Inside a Field it takes its `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from it. Outside a Field it needs `aria-label` or `aria-labelledby`: a dev warning says so.
- **Controlled:** pass `value` and `onValueChange(value, { reason: 'input', event })`. **Uncontrolled:** pass `defaultValue` and `name`, and the browser keeps the value until a form submit reads it. `onChange` and every other native prop, `name` and `ref` pass through.
- **Masks:** `mask="personal-identity-number"` shapes what is typed, in the country the provider's locale implies. It stays a native `<input>`: paste, autofill and undo work, nothing is clamped or corrected, and a refused character is announced. See Masks below.
- Headless: no CSS. It renders `kv-input`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported it is styled.

## API

TextInput is one element, so it has no `.Root`. The props are the controls above, and every other native `<input>` prop passes through. `useTextInput` returns the same props for your own `<input>`.

| Part      | Renders   | Takes                                                                                                                                                                                               |
| --------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TextInput | `<input>` | `type`, `value`, `defaultValue`, `onValueChange`, `mask`, `announceRejections`, `messages`, `render`, `ref`, and the native props. `type` is never `number` (use NumberInput) or `date` (DateInput) |

`render` receives `(inputProps, state)`, where `state` is `{ isInvalid, isRequired, isDisabled, isFocusVisible }`. It must still render an `<input>`: spread the props, because they hold the Field's wiring and the class.

| State attribute      | When                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `data-invalid`       | The Field is invalid (also `aria-invalid="true"`)                                                  |
| `data-required`      | The Field is required (also `aria-required="true"`)                                                |
| `data-disabled`      | The input or its Field is disabled (also native `disabled`)                                        |
| `data-focused`       | It has focus, however it got it                                                                    |
| `data-focus-visible` | It has focus and the focus came from the keyboard (browsers match `:focus-visible` on a click too) |

| Class                                         | On        | Sets                                                                        |
| --------------------------------------------- | --------- | --------------------------------------------------------------------------- |
| `kv-input`                                    | TextInput | The part class. The theme styles the box, its edge, its ring and its states |
| `kv-input--width-2`, `-4`, `-6`, `-10`, `-20` | TextInput | A width by expected characters. Without one, the input is full width        |
| `kv-input--numeric`                           | TextInput | Tabular figures, for reference numbers and codes                            |

A width class follows the text size, includes the 1.4.12 letter-spacing allowance and the 2px invalid edge, and shrinks to fit a 320px screen. Width is a hint, never a limit: no `maxlength` comes from it. Inputs are 44px high (32px in `kv-compact` from 64rem), and the value text stays 16px. An invalid input has a 2px `danger` edge, drawn from `data-invalid` or `aria-invalid="true"`, never from `:invalid`.

| Message key (`messages`)   | Says by default (en)                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `mask.characterNotAllowed` | "Only digits can be entered here." (by `allowed`: digits, letters, letters and digits, other) |
| `mask.maximumLength`       | "You've entered all 12 characters."                                                           |
| `mask.maximumDecimals`     | "No more decimals can be entered here." (a number mask with all its decimals)                 |

Only a masked TextInput announces anything. The strings are in all six locales.

What TextInput does on its own: it takes the control's `id` and `aria-describedby` from the Field (and ignores an `id` of its own inside one, with a dev warning, so the label stays linked); it keeps your own `aria-describedby` ids after the Field's; it moves no focus and handles no keys; with a `mask` it suggests `inputMode`, `autoCapitalize`, `spellCheck={false}` and, for identifiers, `dir="ltr"` (your own props win), warns once in development when a masked field in a Field has no hint, when `mask` is a name that doesn't exist (`mask-unknown-name:<name>`: no mask runs), and announces refused characters through the Announcer.

## Component

```tsx
import { Field, TextInput } from '@kvirn-ui/react'

// Controlled by your own state. The value lives in your useState, not in TextInput.
const [name, setName] = useState('')

<Field.Root required>
  <Field.Label>Fullständigt namn</Field.Label>
  <TextInput name="name" autoComplete="name" value={name} onValueChange={setName} />
</Field.Root>
```

### With TanStack Form

TanStack Form owns the value, the validity and the errors. TextInput and Field show them:

```tsx
<form.Field name="email">
  {(field) => (
    <Field.Root invalid={!field.state.meta.isValid} required>
      <Field.Label>E-postadress</Field.Label>
      <TextInput
        type="email"
        autoComplete="email"
        value={field.state.value}
        onValueChange={field.handleChange}
        onBlur={field.handleBlur}
        name={field.name}
      />
      <Field.ErrorMessage>{field.state.meta.errors.join(', ')}</Field.ErrorMessage>
    </Field.Root>
  )}
</form.Field>
```

Validate on submit, so the error doesn't appear and move the content while the user types. React Hook Form's `register('email')` spreads onto TextInput the same way (`name`, `ref`, `onChange` and `onBlur` reach the native input).

### In a plain form

No `value`, no handlers: each TextInput is uncontrolled, and the form's `FormData` has what was typed, by `name`.

```tsx
<form
  noValidate
  onSubmit={(event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    save({ name: data.get('name'), email: data.get('email') })
  }}
>
  <Field.Root required>
    <Field.Label>Fullständigt namn</Field.Label>
    <TextInput name="name" autoComplete="name" />
  </Field.Root>
  <Field.Root required>
    <Field.Label>E-postadress</Field.Label>
    <TextInput name="email" type="email" autoComplete="email" />
  </Field.Root>
  <Button type="submit">Skicka</Button>
</form>
```

`noValidate` on the form keeps the browser's own validation bubbles (in the browser's language, gone after a moment, and not linked to the field) from replacing your messages.

### Hints and errors: the order

The default order is label, description, input, hint, then the error ([Field](../field/field.md#the-default-order)). Put what the user must read before answering in a description above the input, and a format example in a hint under it:

```tsx
<Field.Root invalid={invalid}>
  <Field.Label>Fordonets registreringsnummer</Field.Label>
  <Field.Prose>
    <p>Det står på registreringsbeviset.</p>
  </Field.Prose>
  <TextInput name="registration" className="kv-input--width-10" />
  <Field.Hint>Till exempel ABC 123</Field.Hint>
  <Field.ErrorMessage>{error}</Field.ErrorMessage>
</Field.Root>
```

With the error under the input, the on-screen keyboard can cover it on a phone. On submit, move focus to the first invalid field (or the error summary), and keep `scroll-padding-block-end` on the page, so the browser scrolls the message into view.

### Units and icons in the box

A unit ("kr", "%"), a decorative icon or a button inside the input's box goes in an [InputGroup](../input-group/input-group.md). The TextInput inside it has no edge or ring of its own: the group draws them.

### Codes and numbers

A quantity or an amount is a [NumberInput](../number-input/number-input.md): it takes digits, a decimal mark and a minus sign, and nothing else. A **code** is text that happens to be made of digits: a reference or case number, a postcode, a personal identity number. A number would drop its leading zeros (a case number `004512` becomes `4512`), so a code stays a TextInput, with a mask that keeps what it can't take out.

```tsx
// A reference number: digits only, leading zeros kept.
<TextInput name="caseNumber" mask={masks.digits()} autoComplete="off" className="kv-input--width-6 kv-input--numeric" />
// Without a mask, a keypad and no spell checking.
<TextInput name="reference" inputMode="numeric" spellCheck={false} className="kv-input--width-6" />
```

`type="number"` changes its value on the mouse wheel, drops leading zeros, rounds silently and shows spinners that are hard to hit, so TextInput doesn't accept it. Also:

- Set `autoComplete` where a value exists (`postal-code`, `tel`).
- No `pattern`: it triggers the browser's validation message, in the browser's language.
- Never block paste (3.3.8). Without a mask, your form parses what people type and validates it. With a mask, the mask drops a character it can't take and announces it politely, still reads pasted text, and your form still validates.

### Masks

A mask shapes what the user types: it drops characters that can't be valid, puts separators in as the user types past them, and limits the length. The control stays a native `<input>`, so paste, autofill, undo and dictation keep working.

```tsx
import { Field, TextInput } from '@kvirn-ui/react'

;<Field.Root invalid={errors.personalIdentityNumber !== undefined} required>
  <Field.Label>Personnummer</Field.Label>
  <TextInput
    name="personalIdentityNumber"
    mask="personal-identity-number"
    onValueChange={(value, details) =>
      form.setValue('personalIdentityNumber', details.unmaskedValue)
    }
  />
  {/* The hint says the format. The mask doesn't (3.3.2): a masked TextInput without one warns. */}
  <Field.Hint>Tio eller tolv siffror, till exempel 19900101-2385.</Field.Hint>
  <Field.ErrorMessage>{errors.personalIdentityNumber}</Field.ErrorMessage>
</Field.Root>
```

#### Masks by name

`mask` takes a name, so you don't import anything or pass a country for the common case. It is a union:

| `mask`                                                    | Is                                                                                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A name: `"digits"`, `"letters"`, `"letters-and-digits"`   | The filters of the same name                                                                                                                                                    |
| `"personal-identity-number"` (alias `"ssi"`), `"postal-code"`, `"organisation-number"` | The country mask for the country the provider implies (below)                                                                                         |
| `"date"`, `"iban"`, `"email"`, `"telephone"`              | The presets of the same name                                                                                                                                                    |
| `{ preset, country? }`                                    | A named preset with the country set for this one input: `{ preset: 'postal-code', country: 'FI' }`                                                                              |
| `{ pattern, ...options }`                                 | A custom pattern with the pattern options (`transform`, `completeLengths`, `attributes`): `{ pattern: '999 99' }`                                                              |
| A `RegExp`                                                | A custom filter that must accept partial values: `/^[A-Z]{0,2}\d{0,6}$/`                                                                                                       |
| A `Mask` from `masks`                                     | The explicit, typed form: `masks.postalCode({ country: 'SE' })`. It stays supported and is what `@kvirn-ui/core` users build                                                    |

`number` is not a name: a quantity or an amount is a [NumberInput](../number-input/number-input.md), which owns the number mask.

**Where the country comes from.** The input's own `{ preset, country }`, else the provider's `country` prop, else the region of the provider's locale (`sv-FI` is Finland), else its language (`sv` is Sweden, `fi` is Finland, `nb`, `nn`, `no` and `se` are Norway). Nothing is guessed beyond that: with no country (`en`, `da-DK`) a country mask only takes digits, and a development warning says so once (`mask-country-unresolved:<name>:<locale>`). Pass `{ preset, country }` or set `<KvirnProvider country>`. `useLocale().country` reads the result. A name is resolved in the input, so one `mask="postal-code"` follows the locale of the provider it sits in.

**A name keeps the preset's details.** `unmaskedValue`, `isComplete`, the suggested attributes and the announcements are the preset's, and the hint rule still holds (a masked TextInput in a Field without a hint warns).

#### Presets

Presets (all from `masks`, re-exported by `@kvirn-ui/react`; each preset has the kebab-case name above, such as `personalIdentityNumber` and `"personal-identity-number"`):

| Preset                                                                                                                 | Shapes                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `digits({ length? })`, `letters()`, `lettersAndDigits()`                                                               | Filters. `letters()` isn't for names: names have spaces, hyphens and apostrophes                                                                                                                                                                                                                                           |
| `number({ decimals?, allowNegative?, grouping?, min?, max? })` (for a quantity or an amount, NumberInput builds it in) | A number with the page's decimal separator. `min` and `max` are reported as `isWithinRange`, never clamped                                                                                                                                                                                                                 |
| `personalIdentityNumber({ country })`                                                                                  | SE: 10 or 12 digits and `-` or `+`. FI: `DDMMYY`, the century sign and `NNNC`, in capitals. NO: 11 digits                                                                                                                                                                                                                  |
| `date({ locale? })`                                                                                                    | A date in one field in the page's order and separator (`2026-10-04` in sv, `04.10.2026` in fi). A separator after a day or month closes it, a pasted ISO date is reformatted, and `unmaskedValue` is the ISO date once complete. The shape only: check it with `checks.date`. See [DateInput](../date-input/date-input.md) |
| `organisationNumber({ country })`, `postalCode({ country })`, `iban()`                                                 | `556000-0001`, `123 45`, `SE45 5000 0000 0583 9825 7466`                                                                                                                                                                                                                                                                   |
| `email()`, `telephone()`                                                                                               | Filters: spaces out of an address, and digits, `+`, space, `-`, `(`, `)` for a number. No national format                                                                                                                                                                                                                  |
| `pattern('aa-9999', { transform? })`, `regexp(/^[A-Z]{0,3}\d{0,3}$/, { allowed?, complete? })`                         | Your own. In a pattern `9` is a digit, `a` a letter (å, ø, đ, ŋ count), `*` either, and the rest are literals. A regexp must accept partial values                                                                                                                                                                         |
| `oneTimeCode({ pattern })`                                                                                             | For a one-time code: `9` digit, `*` letter or digit, `a` letter, `A` and `&` upper-case, `-` a separator. ASCII only                                                                                                                                                                                                       |

A preset suggests `inputMode`, `autoCapitalize`, `spellCheck={false}` and, for identifiers, `dir="ltr"`. Your own props win. It never sets `autocomplete`: that depends on the question.

What a mask does, and doesn't:

- **Lenient.** A pasted `19900101 2385`, `199001012385` or `19900101-2385` all end as `19900101-2385`. A typed literal is accepted once. There are no placeholder characters in the value, and no `maxlength` or `pattern`.
- **Backspace and Delete always remove a character**, also next to a separator. The caret stays after the character the user typed. A dead key or IME composition is left alone until it ends.
- **The value is written back only when the mask changed it**, so plain typing keeps the browser's undo history. When the mask inserts a separator, undo for that step is lost.
- **Reported, never enforced.** `onValueChange(value, details)` gets `details.unmaskedValue`, `isComplete` (the shape is complete, not that the number exists), `isWithinRange` (number masks) and `rejected` (the characters dropped, grouped by reason). Check the number yourself when you validate, with `checks.personalIdentityNumber(value, { country })`, `checks.organisationNumber`, `checks.iban` and `checks.date(isoValue, { min?, max? })`: each returns `{ isValid, reason }` with `reason` `'format'`, `'date'`, `'checkDigit'` (and `'country'` for an IBAN), and for a date `'format'`, `'date'` and `'range'`, so you can write a specific message.
- **A controlled `value` is rendered as given and never rewritten.** For a stored, unmasked value use the mask's `format`: `value={mask.format(stored)}`. A form submit sends the formatted value, and `mask.unmask(value)` gives the plain one.
- **Rejected characters are announced** (4.1.3): a polite message from the shared Announcer, "Här kan du bara skriva siffror." or "Du har skrivit alla 12 tecken.", at most once every three seconds per field. The strings are in all six locales (`mask.characterNotAllowed`, `mask.maximumLength`), and you can override them per provider or per instance: `messages={{ characterNotAllowed: () => '…' }}`. `announceRejections={false}` turns it off, for example when you show your own message. **The `KvirnProvider` is required for announcements:** without one the mask still works, nothing is announced, and a development warning says so once.
- **Numbers and dates** use the provider's locale for the separator (a comma in sv, fi, nb, nn and se) and for the order of a date, whichever separator is typed. Pass `useMask`'s `format` or `mask.withLocale(locale)` to show a stored number the same way.
- **Types.** A mask works on `type` `text`, `tel`, `search`, `url` and `password`. On `type="email"` there is no caret control, so use only `masks.email()` there: another mask warns in development.

#### `useMask` on your own `<input>`

```tsx
import { masks, mergeProps, useMask } from '@kvirn-ui/react'

const caseNumber = useMask({
  mask: masks.pattern('aa-9999', { transform: { a: (letter) => letter.toUpperCase() } }),
  onValueChange: (value, details) => setCaseNumber(details.unmaskedValue),
})
// Your own props last, so they win over the preset's suggestions. The handlers chain.
<input {...mergeProps(caseNumber.inputProps, { name: 'caseNumber', autoComplete: 'off' })} />
```

`useMask` takes the same `mask` values as TextInput (a name, `{ preset }`, `{ pattern }`, a `RegExp` or a `Mask`). It returns `inputProps` (`onChange`, `onFocus`, `onCompositionStart`, `onCompositionEnd`, a `ref` that tracks the value before each edit, and the suggested attributes), plus `format` and `unmask` for the provider's locale. Inside a Field, spread `useTextInput`'s props too: they read the Field.

### Your part

- **A visible label** in a Field. The placeholder is not the label: put examples in a hint (3.3.2).
- **`autoComplete`** on every input that asks for the user's own data (`name`, `email`, `tel`, `postal-code`, `bday`): 1.3.5. Never `autocomplete="off"` on a password, and never block paste.
- **Read-only and disabled** are for staff tools. In a resident form, explain on submit instead, and say why in the hint if you must use them.
- **A hint with the format** for every masked TextInput, and the `KvirnProvider` around the app, so a refused character is announced.
- **Don't pass `id`** to a TextInput inside a Field: the Field's id wins. Set `controlId` on `Field.Root`.

## Hook

```tsx
import { useTextInput } from '@kvirn-ui/react'

function PhoneInput() {
  const input = useTextInput({
    type: 'tel',
    onValueChange: (value) => form.setValue('phone', value),
  })
  return <input {...input.inputProps} name="phone" autoComplete="tel" />
}
```

`useTextInput` reads the nearest Field, and returns `inputProps` with the Field's wiring, `kv-input` and the change and focus handlers. Spread your form library's props next to it.

### `render`

```tsx
<TextInput render={(inputProps) => <MyInput {...inputProps} />} />
```

The element must still be an `<input>`. Spread the props: they hold the Field's wiring and the class.
