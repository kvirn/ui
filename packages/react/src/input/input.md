# Input

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [input.a11y.md](input.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** Input is a native `<input>`. It renders the `value` you give it and reports changes up through `onValueChange`. It never copies the value into state of its own, and it doesn't validate. Use it with TanStack Form, React Hook Form, your own `useState`, or a plain `<form>`.

- A native `<input>` with a text-like `type`: `text` (the default), `email`, `tel`, `url`, `password` or `search`. The browser supplies the role, the keyboard, selection, paste and autofill.
- Inside a [Field](../field/field.md) it takes its `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from it. Outside a Field it needs `aria-label` or `aria-labelledby`: a dev warning says so.
- **Controlled:** pass `value` and `onValueChange(value, { reason: 'input', event })`. **Uncontrolled:** pass `defaultValue` and `name`, and the browser keeps the value until a form submit reads it. `onChange` and every other native prop, `name` and `ref` pass through.
- **Numbers are text**: `type="text"` with `inputMode="numeric"` or `"decimal"`, and `spellCheck={false}`. `type="number"` and `type="date"` aren't accepted. See Numbers below.
- **Masks** (Plan 0014): `mask={masks.personalIdentityNumber({ country: 'SE' })}` shapes what is typed. It stays a native `<input>`: paste, autofill and undo work, nothing is clamped or corrected, and a refused character is announced. See Masks below.
- Headless: no CSS. It renders `kv-input`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported it is styled.

## Component

```tsx
import { ErrorMessage, Field, Input, Label, Prose } from '@kvirn-ui/react'

// Controlled by your own state. The value lives in your useState, not in Input.
const [name, setName] = useState('')

<Field required>
  <Label>Fullständigt namn</Label>
  <Input name="name" autoComplete="name" value={name} onValueChange={setName} />
</Field>
```

### With TanStack Form

TanStack Form owns the value, the validity and the errors. Input and Field show them:

```tsx
<form.Field name="email">
  {(field) => (
    <Field invalid={!field.state.meta.isValid} required>
      <Label>E-postadress</Label>
      <Input
        type="email"
        autoComplete="email"
        value={field.state.value}
        onValueChange={field.handleChange}
        onBlur={field.handleBlur}
        name={field.name}
      />
      <ErrorMessage>{field.state.meta.errors.join(', ')}</ErrorMessage>
    </Field>
  )}
</form.Field>
```

Validate on submit, so the error doesn't appear and move the content while the user types. React Hook Form's `register('email')` spreads onto Input the same way (`name`, `ref`, `onChange` and `onBlur` reach the native input).

### In a plain form

No `value`, no handlers: each Input is uncontrolled, and the form's `FormData` has what was typed, by `name`.

```tsx
<form
  noValidate
  onSubmit={(event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    save({ name: data.get('name'), email: data.get('email') })
  }}
>
  <Field required>
    <Label>Fullständigt namn</Label>
    <Input name="name" autoComplete="name" />
  </Field>
  <Field required>
    <Label>E-postadress</Label>
    <Input name="email" type="email" autoComplete="email" />
  </Field>
  <Button type="submit">Skicka</Button>
</form>
```

`noValidate` on the form keeps the browser's own validation bubbles (in the browser's language, gone after a moment, and not linked to the field) from replacing your messages.

### Hints and errors: the order

The default order is label, hint, input, a second hint under the input, then the error ([Field](../field/field.md#the-default-order)). Put what to answer above the input, and a format example under it:

```tsx
<Field invalid={invalid}>
  <Label>Fordonets registreringsnummer</Label>
  <Prose>
    <p>Det står på registreringsbeviset.</p>
  </Prose>
  <Input name="registration" className="kv-input--width-10" />
  <Prose>
    <p>Till exempel ABC 123</p>
  </Prose>
  <ErrorMessage>{error}</ErrorMessage>
</Field>
```

With the error under the input, the on-screen keyboard can cover it on a phone. On submit, move focus to the first invalid field (or the error summary), and keep `scroll-padding-block-end` on the page, so the browser scrolls the message into view.

### Units and icons in the box

A unit ("kr", "%"), a decorative icon or a button inside the input's box goes in an [InputGroup](../input-group/input-group.md). The Input inside it has no edge or ring of its own: the group draws them.

### Numbers

```tsx
// Whole numbers and codes: leading zeros are kept.
<Input name="children" inputMode="numeric" spellCheck={false} className="kv-input--width-2" />
// Amounts: a decimal comma or point, and no currency sign in the box.
<Input name="rent" inputMode="decimal" spellCheck={false} className="kv-input--width-10 kv-input--numeric" />
```

`type="number"` changes its value on the mouse wheel, drops leading zeros (a case number `004512` becomes `4512`), rounds silently and shows spinners that are hard to hit. So use text with `inputMode`, which brings up the numeric keypad. Also:

- Put the unit in the label ("Månadshyra i kronor"), or in the hint ("without a currency sign"). To also show it in the box, use an [InputGroup](../input-group/input-group.md) Addon: Addons are hidden from screen readers, so the label must still say it.
- Set `autoComplete` where a value exists (`postal-code`, `tel`).
- No `pattern`: it triggers the browser's validation message, in the browser's language.
- Never filter keys or block paste (3.3.8). Your form parses what people type ("1 250,50", "1250.50", " 2 ") and validates it.
- A width class is a hint, never a limit: no `maxlength` comes from it.

### Masks

A mask shapes what the user types: it drops characters that can't be valid, puts separators in as the user types past them, and limits the length. The control stays a native `<input>`, so paste, autofill, undo and dictation keep working.

```tsx
import { ErrorMessage, Field, Input, Label, masks, Prose } from '@kvirn-ui/react'

;<Field invalid={errors.personalIdentityNumber !== undefined} required>
  <Label>Personnummer</Label>
  {/* The hint says the format. The mask doesn't (3.3.2): a masked Input without one warns. */}
  <Prose>
    <p>Tio eller tolv siffror, till exempel 19900101-2385.</p>
  </Prose>
  <ErrorMessage>{errors.personalIdentityNumber}</ErrorMessage>
  <Input
    name="personalIdentityNumber"
    mask={masks.personalIdentityNumber({ country: 'SE' })}
    onValueChange={(value, details) =>
      form.setValue('personalIdentityNumber', details.unmaskedValue)
    }
  />
</Field>
```

Presets (all from `masks`, re-exported by `@kvirn-ui/react`):

| Preset                                                                                         | Shapes                                                                                                                                             |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `digits({ length? })`, `letters()`, `lettersAndDigits()`                                       | Filters. `letters()` isn't for names: names have spaces, hyphens and apostrophes                                                                   |
| `number({ decimals?, allowNegative?, grouping?, min?, max? })`                                 | A number with the page's decimal separator. `min` and `max` are reported as `isWithinRange`, never clamped                                         |
| `personalIdentityNumber({ country })`                                                          | SE: 10 or 12 digits and `-` or `+`. FI: `DDMMYY`, the century sign and `NNNC`, in capitals. NO: 11 digits                                          |
| `organisationNumber({ country })`, `postalCode({ country })`, `iban()`                         | `556000-0001`, `123 45`, `SE45 5000 0000 0583 9825 7466`                                                                                           |
| `email()`, `telephone()`                                                                       | Filters: spaces out of an address, and digits, `+`, space, `-`, `(`, `)` for a number. No national format                                          |
| `pattern('aa-9999', { transform? })`, `regexp(/^[A-Z]{0,3}\d{0,3}$/, { allowed?, complete? })` | Your own. In a pattern `9` is a digit, `a` a letter (å, ø, đ, ŋ count), `*` either, and the rest are literals. A regexp must accept partial values |
| `oneTimeCode({ pattern })`                                                                     | For a one-time code: `9` digit, `*` letter or digit, `a` letter, `A` and `&` upper-case, `-` a separator. ASCII only                               |

A preset suggests `inputMode`, `autoCapitalize`, `spellCheck={false}` and, for identifiers, `dir="ltr"`. Your own props win. It never sets `autocomplete`: that depends on the question.

What a mask does, and doesn't:

- **Lenient.** A pasted `19900101 2385`, `199001012385` or `19900101-2385` all end as `19900101-2385`. A typed literal is accepted once. There are no placeholder characters in the value, and no `maxlength` or `pattern`.
- **Backspace and Delete always remove a character**, also next to a separator. The caret stays after the character the user typed. A dead key or IME composition is left alone until it ends.
- **The value is written back only when the mask changed it**, so plain typing keeps the browser's undo history. When the mask inserts a separator, undo for that step is lost.
- **Reported, never enforced.** `onValueChange(value, details)` gets `details.unmaskedValue`, `isComplete` (the shape is complete, not that the number exists), `isWithinRange` (number masks) and `rejected` (the characters dropped, grouped by reason). Check the number yourself when you validate, with `checks.personalIdentityNumber(value, { country })`, `checks.organisationNumber` and `checks.iban`: each returns `{ isValid, reason }` with `reason` `'format'`, `'date'`, `'checkDigit'` (and `'country'` for an IBAN), so you can write a specific message.
- **A controlled `value` is rendered as given and never rewritten.** For a stored, unmasked value use the mask's `format`: `value={mask.format(stored)}`. A form submit sends the formatted value, and `mask.unmask(value)` gives the plain one.
- **Rejected characters are announced** (4.1.3): a polite message from the shared Announcer, "Här kan du bara skriva siffror." or "Du har skrivit alla 12 tecken.", at most once every three seconds per field. The strings are in all six locales (`mask.characterNotAllowed`, `mask.maximumLength`), and you can override them per provider or per instance: `messages={{ characterNotAllowed: () => '…' }}`. `announceRejections={false}` turns it off, for example when you show your own message. **The `KvirnProvider` is required for announcements:** without one the mask still works, nothing is announced, and a development warning says so once.
- **Numbers** use the provider's locale for the separator (a comma in sv, fi, nb, nn and se), whichever one is typed. Pass `useMask`'s `format` or `mask.withLocale(locale)` to show a stored number the same way.
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

`useMask` returns `inputProps` (`onChange`, `onFocus`, `onCompositionStart`, `onCompositionEnd`, a `ref` that tracks the value before each edit, and the suggested attributes), plus `format` and `unmask` for the provider's locale. Inside a Field, spread `useInput`'s props too: they read the Field.

### Your part

- **A visible label** in a Field. The placeholder is not the label: put examples in a hint (3.3.2).
- **`autoComplete`** on every input that asks for the user's own data (`name`, `email`, `tel`, `postal-code`, `bday`): 1.3.5. Never `autocomplete="off"` on a password, and never block paste.
- **Read-only and disabled** are for staff tools. In a resident form, explain on submit instead, and say why in the hint if you must use them.
- **A hint with the format** for every masked Input, and the `KvirnProvider` around the app, so a refused character is announced.
- **Don't pass `id`** to an Input inside a Field: the Field's id wins. Set `controlId` on `Field`.

### Classes for the default theme

| Class                                         | On    | Sets                                                                 |
| --------------------------------------------- | ----- | -------------------------------------------------------------------- |
| `kv-input--width-2`, `-4`, `-6`, `-10`, `-20` | Input | a width by expected characters. Without one, the input is full width |
| `kv-input--numeric`                           | Input | tabular figures, for amounts and reference numbers                   |

The width follows the text size, and includes the 1.4.12 letter-spacing allowance and the 2px invalid edge, so the expected answer stays visible. It shrinks to fit a 320px screen. Inputs are 44px high (32px in `kv-compact` from 64rem), and the value text stays 16px. An invalid input has a 2px `danger` edge, drawn from `data-invalid` or `aria-invalid="true"`, never from `:invalid`.

## Hook

```tsx
import { useInput } from '@kvirn-ui/react'

function PhoneInput() {
  const input = useInput({ type: 'tel', onValueChange: (value) => form.setValue('phone', value) })
  return <input {...input.inputProps} name="phone" autoComplete="tel" />
}
```

`useInput` reads the nearest Field, and returns `inputProps` with the Field's wiring, `kv-input` and the change and focus handlers. Spread your form library's props next to it.

### `render`

```tsx
<Input render={(inputProps) => <MyInput {...inputProps} />} />
```

The element must still be an `<input>`. Spread the props: they hold the Field's wiring and the class.
