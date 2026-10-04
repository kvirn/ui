# Fieldset

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [fieldset.a11y.md](fieldset.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** Fieldset renders what it's given. `invalid`, `required` and `disabled` come from your form library or your own code, and you write the error message.

A native `<fieldset>` with a `<legend>`: it groups related questions (an address) or the controls of one question (the options of a radio group, the three boxes of a date), under one accessible name. Its description, hint and error describe the group.

- Five parts: `<Fieldset.Root>` is the root (`<fieldset>`), `<Fieldset.Legend>` is the `<legend>`, `<Fieldset.Prose>` is the description, `<Fieldset.Hint>` is the hint (`<p>`) and `<Fieldset.ErrorMessage>` behaves like [Field's](../field/field.md). Each part is also exported on its own (`FieldsetRoot`, `FieldsetLegend`, `FieldsetProse`, `FieldsetHint`, `FieldsetErrorMessage`), which is the form to import in a React Server Component, because a server component can't dot into a client module. The description is a [Prose](../prose/prose.md): inside the Fieldset (and not inside a Field in it) it is the group's description, so write `<Fieldset.Prose>`, not a bare `<Prose>`. The hint is [Field's](../field/field.md) `Hint` under the group's name. The older flat name `Legend`, and the callable `Fieldset`, still work but are deprecated.
- **A description and a hint are different things,** as in a Field. The description (`Fieldset.Prose`) is what the user must read before answering, above the controls, in 16px. The hint (`Fieldset.Hint`) is a short instruction that helps while answering, such as the format of a date ("Till exempel 2026-03-27"), under the controls, in 14px.
- **A description and a hint are text.** The accessible description is the text content, so a heading, list or link inside it loses its structure for a screen-reader user. Keep a hint to one or two short sentences or an example, with no links. A Prose that isn't a description goes outside the Fieldset. A `Fieldset.Hint` outside a Fieldset warns in development and renders a plain paragraph with no id.
- The legend is the group's name, and the browser maps the fieldset to the `group` role. `aria-describedby` on the fieldset lists every description and hint in DOM order and then the error, only for parts that are rendered. A fieldset can have several of each, each with its own id, and one error: two `Fieldset.ErrorMessage`s give a dev warning.
- `disabled` is native `fieldset[disabled]`: every control inside is disabled and skipped by Tab.
- `invalid` marks the fieldset's own parts (`data-invalid`) and renders its Fieldset.ErrorMessage. It does **not** pass down to the Fields inside, so one message for the group doesn't mark every control: set `invalid` on each Field that is wrong. There is no `aria-invalid` on a fieldset, because ARIA doesn't support it on `group`: the error reaches users through the description.
- `group` is for one question answered with several controls. The legend then ends with "(valfritt)" when the group isn't `required`, and the Fields inside drop their own marker: an option or a date box is never "(optional)". A plain Fieldset only groups questions, so its legend has no marker, and its Fields mark themselves.
- Headless: no CSS. It renders `kv-fieldset` and `kv-fieldset-legend`. With `@kvirn-ui/theme/theme.css` imported it is styled: no border, and a gap between the parts.

## Component

```tsx
import { Field, Fieldset, Input } from '@kvirn-ui/react'

;<Fieldset.Root invalid={errors.address !== undefined}>
  <Fieldset.Legend>Var bor du?</Fieldset.Legend>
  <Fieldset.Prose>
    <p>Adressen där du är folkbokförd.</p>
  </Fieldset.Prose>
  <Field.Root required>
    <Field.Label>Gatuadress</Field.Label>
    <Input name="street" autoComplete="street-address" />
  </Field.Root>
  <Field.Root required>
    <Field.Label>Postnummer</Field.Label>
    <Input
      name="postcode"
      inputMode="numeric"
      spellCheck={false}
      autoComplete="postal-code"
      className="kv-input--width-6"
    />
  </Field.Root>
  <Fieldset.Hint>Gatan och numret, till exempel Storgatan 12.</Fieldset.Hint>
  <Fieldset.ErrorMessage>{errors.address}</Fieldset.ErrorMessage>
</Fieldset.Root>
```

The default order is the legend, the description, the controls, the hint, then the error under them, so the visual order is the spoken order. Render another order and the spacing and the description still work. On submit, move focus to the first invalid control or the error summary, and keep `scroll-padding` on the page, so the message under the controls isn't hidden by the on-screen keyboard (see [Field](../field/field.md)).

Your part:

- **Put the Fieldset.Legend first** inside the Fieldset. It asks the question or names the group.
- **A legend that is the page's heading:** `<Fieldset.Legend className="kv-fieldset-legend--heading"><h1>Var bor du?</h1></Fieldset.Legend>`. One question per page, as in a service flow.
- **Don't wrap every Field in a fieldset.** A fieldset announces itself, and nested ones get noisy. Use one for options and for one question asked in several controls.
- **Set `invalid` and render a Fieldset.ErrorMessage together,** with text that says what's wrong and how to fix it. Until the error summary block ships, move focus to the first invalid control on submit.
- **Messages.** The optional text and the error prefix are `field.optional` and `field.errorPrefix`, resolved like Field's. Override per instance with `messages`.

A Fieldset renders a `<fieldset>` and nothing else may replace it: a dev warning says so if `render` returns another element.

## Hook

```tsx
import { useFieldset } from '@kvirn-ui/react'

function Group({ invalid }: { invalid: boolean }) {
  const fieldset = useFieldset({ invalid, hasDescription: true })
  return (
    <fieldset {...fieldset.fieldsetProps}>
      <legend {...fieldset.legendProps}>Var bor du?</legend>
      <p {...fieldset.descriptionProps}>Adressen där du är folkbokförd.</p>
      {/* the controls */}
      {invalid ? (
        <p {...fieldset.errorMessageProps}>{fieldset.errorPrefix} Ange din adress</p>
      ) : null}
    </fieldset>
  )
}
```

`useFieldset` returns `fieldsetProps`, `legendProps`, `descriptionProps`, `getDescriptionProps` and `errorMessageProps`, plus `optionalMarker` and `errorPrefix`.

For several descriptions, list their names in `descriptions` and spread `getDescriptionProps(name)` on each, as `useField` does ([Field](../field/field.md#several-descriptions)). `aria-describedby` lists them in the order of the array, then the error, and the markup is complete when rendered on the server.

```tsx
const fieldset = useFieldset({ invalid, descriptions: ['where', 'format'] })
<p {...fieldset.getDescriptionProps('where')}>Adressen där du är folkbokförd.</p>
<p {...fieldset.getDescriptionProps('format')} className="kv-field-hint">
  Gatan och numret, till exempel Storgatan 12.
</p>
```
