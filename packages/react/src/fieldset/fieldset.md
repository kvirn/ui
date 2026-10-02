# Fieldset

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [fieldset.a11y.md](fieldset.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in ADR-0029.

**KvirnUI holds no form state; bring your own form logic.** Fieldset renders what it's given. `invalid`, `required` and `disabled` come from your form library or your own code, and you write the error message.

A native `<fieldset>` with a `<legend>`: it groups related questions (an address) or the controls of one question (the options of a radio group, the three boxes of a date), under one accessible name. Its hint and error describe the group.

- Four parts: `Fieldset.Root` (`<fieldset>`), `Fieldset.Legend` (`<legend>`), and `Fieldset.Description` and `Fieldset.ErrorMessage`, which are the same components as [Field's](../field/field.md). Each is also exported on its own (`FieldsetRoot`, `FieldsetLegend`, …).
- The legend is the group's name, and the browser maps the fieldset to the `group` role. `aria-describedby` on the fieldset lists every hint in DOM order and then the error, only for parts that are rendered. A fieldset can have several hints, each with its own id (ADR-0031), and one error: two `Fieldset.ErrorMessage`s give a dev warning.
- `disabled` is native `fieldset[disabled]`: every control inside is disabled and skipped by Tab.
- `invalid` marks the fieldset's own parts (`data-invalid`) and renders its ErrorMessage. It does **not** pass down to the Fields inside, so one message for the group doesn't mark every control: set `invalid` on each Field that is wrong. There is no `aria-invalid` on a fieldset, because ARIA doesn't support it on `group`: the error reaches users through the description.
- `group` is for one question answered with several controls. The legend then ends with "(valfritt)" when the group isn't `required`, and the Fields inside drop their own marker: an option or a date box is never "(optional)". A plain Fieldset only groups questions, so its legend has no marker, and its Fields mark themselves.
- Headless: no CSS. It renders `kv-fieldset` and `kv-fieldset-legend`. With `@kvirn-ui/theme/theme.css` imported it is styled: no border, and a gap between the parts.

## Component

```tsx
import { Field, Fieldset, Input } from '@kvirn-ui/react'

;<Fieldset.Root invalid={errors.address !== undefined}>
  <Fieldset.Legend>Var bor du?</Fieldset.Legend>
  <Fieldset.Description>Adressen där du är folkbokförd.</Fieldset.Description>
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
  <Fieldset.ErrorMessage>{errors.address}</Fieldset.ErrorMessage>
</Fieldset.Root>
```

The default order (ADR-0031) is the legend, the hint, the controls, then the error under them. Render another order and the spacing and the description still work. On submit, move focus to the first invalid control or the error summary, and keep `scroll-padding` on the page, so the message under the controls isn't hidden by the on-screen keyboard (see [Field](../field/field.md)).

Your part:

- **Put the Legend first** inside the Fieldset. It asks the question or names the group.
- **A legend that is the page's heading:** `<Fieldset.Legend className="kv-fieldset-legend--heading"><h1>Var bor du?</h1></Fieldset.Legend>`. One question per page, as in a service flow.
- **Don't wrap every Field in a fieldset.** A fieldset announces itself, and nested ones get noisy. Use one for options and for one question asked in several controls.
- **Set `invalid` and render an ErrorMessage together,** with text that says what's wrong and how to fix it. Until the error summary block ships, move focus to the first invalid control on submit.
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
<p {...fieldset.getDescriptionProps('format')}>Gatan och numret, till exempel Storgatan 12.</p>
```
