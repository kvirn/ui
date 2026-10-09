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

| Part      | Renders   | Takes                                                                                                                                                                                     |
| --------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TextInput | `<input>` | `type`, `value`, `defaultValue`, `onValueChange`, `mask`, `announceRejections`, `messages`, `ref`, and the native props. `type` is never `number` (use NumberInput) or `date` (DateInput) |

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

A width class follows the text size, includes the 1.4.12 letter-spacing allowance and the 2px invalid edge, and shrinks to fit a 320px screen. Width is a help text, never a limit: no `maxlength` comes from it. Inputs are 44px high (32px in `kv-compact` from 64rem), and the value text stays 16px. An invalid input has a 2px `danger` edge, drawn from `data-invalid` or `aria-invalid="true"`, never from `:invalid`.

| Message key (`messages`)   | Says by default (en)                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `mask.characterNotAllowed` | "Only digits can be entered here." (by `allowed`: digits, letters, letters and digits, other) |
| `mask.maximumLength`       | "You've entered all 12 characters."                                                           |
| `mask.maximumDecimals`     | "No more decimals can be entered here." (a number mask with all its decimals)                 |

Only a masked TextInput announces anything. The strings are in all six locales.

What TextInput does on its own: it takes the control's `id` and `aria-describedby` from the Field (and ignores an `id` of its own inside one, with a dev warning, so the label stays linked); it keeps your own `aria-describedby` ids after the Field's; it moves no focus and handles no keys; with a `mask` it suggests `inputMode`, `autoCapitalize`, `spellCheck={false}` and, for identifiers, `dir="ltr"` (your own props win), warns once in development when a masked field in a Field has no help text, when `mask` is a name that doesn't exist (`mask-unknown-name:<name>`: no mask runs), and announces refused characters through the Announcer.

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

### HelpTexts and errors: the order

The default order is label, description, input, help text, then the error ([Field](../field/field.md#the-default-order)). Put what the user must read before answering in a description above the input, and a format example in a help text under it:

```tsx
<Field.Root invalid={invalid}>
  <Field.Label>Fordonets registreringsnummer</Field.Label>
  <Field.Prose>
    <p>Det står på registreringsbeviset.</p>
  </Field.Prose>
  <TextInput name="registration" className="kv-input--width-10" />
  <Field.HelpText>Till exempel ABC 123</Field.HelpText>
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
  {/* The help text says the format. The mask doesn't (3.3.2): a masked TextInput without one warns. */}
  <Field.HelpText>Tio eller tolv siffror, till exempel 19900101-2385.</Field.HelpText>
  <Field.ErrorMessage>{errors.personalIdentityNumber}</Field.ErrorMessage>
</Field.Root>
```

`mask` takes a name (`"postal-code"`), `{ preset, country? }`, `{ pattern, ...options }`, a `RegExp` or a mask from `masks`. `onValueChange(value, details)` reports `unmaskedValue`, `isComplete`, `isWithinRange` (number masks) and `rejected` (the characters dropped, by reason). **A controlled `value` is rendered as given and never rewritten**: for a stored, unmasked value use the mask's `format`, `value={mask.format(stored)}`. `announceRejections={false}` turns the announcement off, for a message of your own (put it in a live region), and `messages` overrides the strings per instance.

The names, the country rules, every preset, the checks (`checks.personalIdentityNumber`, `checks.organisationNumber`, `checks.iban`, `checks.date`, with their reasons) and `useMask` on your own input are on the [Mask](../mask/mask.md) page.

### Your part

- **A visible label** in a Field. The placeholder is not the label: put examples in a help text (3.3.2).
- **`autoComplete`** on every input that asks for the user's own data (`name`, `email`, `tel`, `postal-code`, `bday`): 1.3.5. Never `autocomplete="off"` on a password, and never block paste.
- **Read-only and disabled** are for staff tools. In a resident form, explain on submit instead, and say why in the help text if you must use them.
- **A help text with the format** for every masked TextInput, and the `KvirnProvider` around the app, so a refused character is announced.
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

### Your own element

The TextInput renders a native `<input>`. To build your own, use `useTextInput()` and spread `inputProps`: they hold the Field's wiring and the class.
