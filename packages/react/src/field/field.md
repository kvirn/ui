# Field

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [field.a11y.md](field.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in ADR-0029.

**KvirnUI holds no form state; bring your own form logic.** Field renders what it's given and wires it together. It doesn't validate, and it doesn't keep a value, a touched flag or an error. You set `invalid`, `required` and `disabled` from your form library (TanStack Form, React Hook Form) or from your own code, and you write the error message.

A Field joins one control to its label, an optional hint and an error message, so the accessible name, the description and the invalid state are right without you wiring ids (ADR-0029).

- Four parts: `Field.Root` (`<div>`), `Field.Label` (`<label for>`), `Field.Description` (`<p>`) and `Field.ErrorMessage` (`<p>`). Each is also exported on its own (`FieldRoot`, `FieldLabel`, `FieldDescription`, `FieldErrorMessage`).
- The label names the control, and clicking it focuses the control. The hints and the error are in the control's `aria-describedby`: every hint in DOM order, then the error, and only the parts that are rendered.
- A field can have several hints: one above the control and one under it (ADR-0031). Each `Field.Description` has its own id.
- `invalid` puts `aria-invalid="true"` on the control and `data-invalid` on every part, and the ErrorMessage renders. Without `invalid` the ErrorMessage renders nothing, so a stale error is never referenced.
- `required` puts `aria-required="true"` on the control, never native `required`: the browser shows no validation bubble of its own, in its own language. Required fields carry no visible marker. A field that isn't required ends its label with the `field.optional` text, "(valfritt)" in Swedish, which is part of the accessible name. `<Field.Label marker="none">` leaves it out. If you also want the browser's native validation, put `required` on the control _and_ keep it on Field.Root, or the label says "(optional)" while assistive technology announces "required".
- The error starts with the `field.errorPrefix` text ("Fel:") and an error icon. The theme hides the prefix visually, so screen-reader users hear "Fel: Ange ditt namn" without relying on the colour. Errors are not live regions: they are read when the user reaches the control. On submit, move focus to the first invalid field (until the error summary block ships).
- Headless: no CSS. The parts render `kv-field`, `kv-field-label`, `kv-field-description`, `kv-field-error-message`, `kv-field-error-prefix` and `kv-field-optional`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## Component

```tsx
import { Field, Input } from '@kvirn-ui/react'

;<Field.Root invalid={errors.phone !== undefined}>
  <Field.Label>Telefonnummer</Field.Label>
  <Field.Description>Vi ringer bara om något är fel.</Field.Description>
  <Input name="phone" type="tel" autoComplete="tel" />
  <Field.ErrorMessage>{errors.phone}</Field.ErrorMessage>
</Field.Root>
```

### The default order

Render the parts in this order (ADR-0031): **label, hint, control, a second hint under the control, then the error**. The reading order, the DOM order and the visual order are then the same, and the theme spaces every part one gap from the next.

```tsx
<Field.Root invalid={errors.registration !== undefined}>
  <Field.Label>Fordonets registreringsnummer</Field.Label>
  <Field.Description>Det står på registreringsbeviset.</Field.Description>
  <Input name="registration" className="kv-input--width-10" />
  <Field.Description>Till exempel ABC 123</Field.Description>
  <Field.ErrorMessage>{errors.registration}</Field.ErrorMessage>
</Field.Root>
```

- **Above the control:** what to answer and where to find it, anything the user needs before they start typing. Most fields have only this hint.
- **Under the control:** a format example or a limit that helps while typing. Never the only instruction: a magnifier user may not see under the box until they've typed.
- **Each hint has its own id.** The control's `aria-describedby` lists them in DOM order, then the error's, whatever the visual order: a screen-reader user hears both hints, then "Fel: …". Don't give a Description an `id` of your own.
- **One error per Field.** Two `Field.ErrorMessage`s share an id, so a dev warning fires. Put all the text in one.
- **The order is yours.** The library doesn't enforce it: render the parts in another order and the spacing and the description still work. Put a hint after the error, or the error above the control, if your service needs it.

### Focus on submit, on a phone

With the error under the control, the on-screen keyboard or an autocomplete list can cover it when the field gets focus. So:

- **On submit, move focus** to the error summary (when the block ships, M4), or until then to the first invalid field.
- **Keep `scroll-padding` on the page's scroll container,** so the browser scrolls the field far enough up when it gets focus. The start value is the height of a sticky header (2.4.11), and the end value leaves room for the message under the field. `scroll-padding-block-end: 8rem` is a starting point.

```css
html {
  scroll-padding-block: 4rem 8rem;
}
```

iOS doesn't always honour `scroll-padding` for its keyboard, so this is listed as an open usability question (ADR-0031), not a solved problem.

Your part:

- **A visible label on every control.** A placeholder isn't a label (3.3.2). Put examples in a Description.
- **Say what's wrong and how to fix it,** in the field's own words, without blaming the user: "Ange ditt fullständiga namn", not "Ogiltigt värde". Plain text: the icon, the prefix and the text lay out as one line. Set `invalid` and render the ErrorMessage together.
- **Validate on submit, not on every key,** so content doesn't move under a magnifier. Keep what the user typed.
- **`controlId`** gives the control the id you need to link to it, for example from an error summary. Don't pass an `id` to a control inside a Field: the Field's id wins, and a dev warning says so.
- **`lang`** on a label whose text is in another language (3.1.2).
- **Messages.** `field.optional` and `field.errorPrefix` come from `@kvirn-ui/i18n` in six languages, and can be overridden per provider and per instance: `<Field.Root messages={{ optional: '(frivilligt)' }}>` (ADR-0007).
- **A checkbox or radio** must be a direct child of `Field.Root` (later phase): the default theme finds its layout from `.kv-field:has(> .kv-checkbox, > .kv-radio)`.

### Classes for the default theme

| Class                                         | On                                        | Sets                                                            |
| --------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| `kv-field-label--heading`                     | Label                                     | the label is the page's `h1`: `<h1><Field.Label className="…">` |
| `kv-input--width-2`, `-4`, `-6`, `-10`, `-20` | Input (see [input.md](../input/input.md)) | a width by expected characters                                  |

The default theme styles the parts as described in the design spec: labels 16px at weight 500 (14px in `kv-compact`), hints 16px in the text colour, errors 16px in `danger`. Hints and errors never go below 16px.

## Hook

For your own elements, `useField` returns the wiring:

```tsx
import { useField } from '@kvirn-ui/react'

function NameField({ invalid }: { invalid: boolean }) {
  const field = useField({ invalid, required: true, hasDescription: true })
  return (
    <div {...field.rootProps}>
      <label {...field.labelProps}>Namn</label>
      <p {...field.descriptionProps}>Som det står i ditt pass.</p>
      <input {...field.controlProps} name="name" />
      {invalid ? <p {...field.errorMessageProps}>{field.errorPrefix} Ange ditt namn</p> : null}
    </div>
  )
}
```

`useField` also returns `optionalMarker` (the text to put after the label, or `undefined`) and `errorPrefix`. Set `hasDescription` from the first render, so server-rendered markup has `aria-describedby`. The Root component learns about its parts when they mount, so it associates them after hydration.

### Several descriptions

For more than one description, list their names in `descriptions`, in the order you render them, and spread `getDescriptionProps(name)` on each. Every description gets its own id (`<controlId>-description-<name>`). `aria-describedby` lists them in the order of the array, then the error. Because the names are known on the first render, the server-rendered markup is complete.

```tsx
function RegistrationField({ invalid }: { invalid: boolean }) {
  const field = useField({ invalid, required: true, descriptions: ['where', 'format'] })
  return (
    <div {...field.rootProps}>
      <label {...field.labelProps}>Fordonets registreringsnummer</label>
      <p {...field.getDescriptionProps('where')}>Det står på registreringsbeviset.</p>
      <input {...field.controlProps} name="registration" className="kv-input--width-10" />
      <p {...field.getDescriptionProps('format')}>Till exempel ABC 123</p>
      {invalid ? <p {...field.errorMessageProps}>{field.errorPrefix} Ange ett nummer</p> : null}
    </div>
  )
}
```

- `descriptions` and `hasDescription` can be combined: the `hasDescription` one (`descriptionProps`) comes first. For new code, use `descriptions` only.
- Only list a name you render. A name with no element leaves `aria-describedby` pointing at a missing id.
- `useFieldset` has the same `descriptions` option and `getDescriptionProps(name)`.

### `render`

Every part takes `render` to change its element. The part's props are merged into yours: class names join, handlers chain and refs merge (ADR-0015). The Label must stay a `<label>`, so the control keeps its name.

```tsx
<Field.Description render={<div />}>Som det står i ditt pass.</Field.Description>
<Field.Description render={(props) => <div {...props} />}>Som det står i ditt pass.</Field.Description>
```
