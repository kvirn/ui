# Input

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [input.a11y.md](input.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in ADR-0029 (fields) and ADR-0030 (numbers and dates).

**KvirnUI holds no form state; bring your own form logic.** Input is a native `<input>`. It renders the `value` you give it and reports changes up through `onValueChange`. It never copies the value into state of its own, and it doesn't validate. Use it with TanStack Form, React Hook Form, your own `useState`, or a plain `<form>`.

- A native `<input>` with a text-like `type`: `text` (the default), `email`, `tel`, `url`, `password` or `search`. The browser supplies the role, the keyboard, selection, paste and autofill.
- Inside a [Field](../field/field.md) it takes its `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from it. Outside a Field it needs `aria-label` or `aria-labelledby`: a dev warning says so.
- **Controlled:** pass `value` and `onValueChange(value, { reason: 'input', event })`. **Uncontrolled:** pass `defaultValue` and `name`, and the browser keeps the value until a form submit reads it. `onChange` and every other native prop, `name` and `ref` pass through.
- **Numbers are text** (ADR-0030): `type="text"` with `inputMode="numeric"` or `"decimal"`, and `spellCheck={false}`. `type="number"` and `type="date"` aren't accepted. See Numbers below.
- Headless: no CSS. It renders `kv-input`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported it is styled.

## Component

```tsx
import { Field, Input } from '@kvirn-ui/react'

// Controlled by your own state. The value lives in your useState, not in Input.
const [name, setName] = useState('')

<Field.Root required>
  <Field.Label>Fullständigt namn</Field.Label>
  <Input name="name" autoComplete="name" value={name} onValueChange={setName} />
</Field.Root>
```

### With TanStack Form

TanStack Form owns the value, the validity and the errors. Input and Field show them:

```tsx
<form.Field name="email">
  {(field) => (
    <Field.Root invalid={!field.state.meta.isValid} required>
      <Field.Label>E-postadress</Field.Label>
      <Input
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
  <Field.Root required>
    <Field.Label>Fullständigt namn</Field.Label>
    <Input name="name" autoComplete="name" />
  </Field.Root>
  <Field.Root required>
    <Field.Label>E-postadress</Field.Label>
    <Input name="email" type="email" autoComplete="email" />
  </Field.Root>
  <Button type="submit">Skicka</Button>
</form>
```

`noValidate` on the form keeps the browser's own validation bubbles (in the browser's language, gone after a moment, and not linked to the field) from replacing your messages.

### Hints and errors: the order

The default order (ADR-0031) is label, hint, input, a second hint under the input, then the error ([Field](../field/field.md#the-default-order)). Put what to answer above the input, and a format example under it:

```tsx
<Field.Root invalid={invalid}>
  <Field.Label>Fordonets registreringsnummer</Field.Label>
  <Field.Description>Det står på registreringsbeviset.</Field.Description>
  <Input name="registration" className="kv-input--width-10" />
  <Field.Description>Till exempel ABC 123</Field.Description>
  <Field.ErrorMessage>{error}</Field.ErrorMessage>
</Field.Root>
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

### Your part

- **A visible label** in a Field. The placeholder is not the label: put examples in the Description (3.3.2).
- **`autoComplete`** on every input that asks for the user's own data (`name`, `email`, `tel`, `postal-code`, `bday`): 1.3.5. Never `autocomplete="off"` on a password, and never block paste.
- **Read-only and disabled** are for staff tools. In a resident form, explain on submit instead, and say why in the Description if you must use them.
- **Don't pass `id`** to an Input inside a Field: the Field's id wins. Set `controlId` on `Field.Root`.

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
