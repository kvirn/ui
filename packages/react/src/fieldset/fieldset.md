# Fieldset

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [fieldset.a11y.md](fieldset.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in ADR-0029.

**KvirnUI holds no form state; bring your own form logic.** Fieldset renders what it's given. `invalid`, `required` and `disabled` come from your form library or your own code, and you write the error message.

A native `<fieldset>` with a `<legend>`: it groups related questions (an address) or the controls of one question (the options of a radio group, the three boxes of a date), under one accessible name. Its hint and error describe the group.

- Three parts: `<Fieldset>` is the root (`<fieldset>`), `<Legend>` is the `<legend>` and `<ErrorMessage>` is the same component as [Field's](../field/field.md). `Fieldset.Root`, `Fieldset.Legend`, `Fieldset.Prose` and `Fieldset.ErrorMessage` are aliases of the same components (ADR-0055), and each is also exported on its own (`FieldsetRoot`, `FieldsetLegend`, …). The hint is a [Prose](../prose/prose.md): a `<Prose>` inside the Fieldset (and not inside a Field in it) is the group's description, and `Fieldset.Prose` is the same component under a name that reads as part of the Fieldset (ADR-0054).
- **A hint is text.** The accessible description is the Prose's text content, so a heading, list or link inside it loses its structure for a screen-reader user. Keep a hint short. A Prose that isn't a hint goes outside the Fieldset.
- The legend is the group's name, and the browser maps the fieldset to the `group` role. `aria-describedby` on the fieldset lists every hint in DOM order and then the error, only for parts that are rendered. A fieldset can have several hints, each with its own id (ADR-0031), and one error: two `ErrorMessage`s give a dev warning.
- `disabled` is native `fieldset[disabled]`: every control inside is disabled and skipped by Tab.
- `invalid` marks the fieldset's own parts (`data-invalid`) and renders its ErrorMessage. It does **not** pass down to the Fields inside, so one message for the group doesn't mark every control: set `invalid` on each Field that is wrong. There is no `aria-invalid` on a fieldset, because ARIA doesn't support it on `group`: the error reaches users through the description.
- `group` is for one question answered with several controls. The legend then ends with "(valfritt)" when the group isn't `required`, and the Fields inside drop their own marker: an option or a date box is never "(optional)". A plain Fieldset only groups questions, so its legend has no marker, and its Fields mark themselves.
- Headless: no CSS. It renders `kv-fieldset` and `kv-fieldset-legend`. With `@kvirn-ui/theme/theme.css` imported it is styled: no border, and a gap between the parts.

## Component

```tsx
import { ErrorMessage, Field, Fieldset, Input, Label, Legend, Prose } from '@kvirn-ui/react'

;<Fieldset invalid={errors.address !== undefined}>
  <Legend>Var bor du?</Legend>
  <Prose>
    <p>Adressen där du är folkbokförd.</p>
  </Prose>
  <Field required>
    <Label>Gatuadress</Label>
    <Input name="street" autoComplete="street-address" />
  </Field>
  <Field required>
    <Label>Postnummer</Label>
    <Input
      name="postcode"
      inputMode="numeric"
      spellCheck={false}
      autoComplete="postal-code"
      className="kv-input--width-6"
    />
  </Field>
  <ErrorMessage>{errors.address}</ErrorMessage>
</Fieldset>
```

The default order (ADR-0031) is the legend, the hint, the controls, then the error under them. Render another order and the spacing and the description still work. On submit, move focus to the first invalid control or the error summary, and keep `scroll-padding` on the page, so the message under the controls isn't hidden by the on-screen keyboard (see [Field](../field/field.md)).

Your part:

- **Put the Legend first** inside the Fieldset. It asks the question or names the group.
- **A legend that is the page's heading:** `<Legend className="kv-fieldset-legend--heading"><h1>Var bor du?</h1></Legend>`. One question per page, as in a service flow.
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
