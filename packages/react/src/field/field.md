# Field

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [field.a11y.md](field.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** Field renders what it's given and wires it together. It doesn't validate, and it doesn't keep a value, a touched flag or an error. You set `invalid`, `required` and `disabled` from your form library (TanStack Form, React Hook Form) or from your own code, and you write the error message.

A Field joins one control to its label, an optional description (a `Prose`), an optional help text (a `HelpText`) and an error message, so the accessible name, the description and the invalid state are right without you wiring ids.

- Five parts: `<Field.Root>` is the root (`<div>`), `<Field.Label>` is the `<label for>`, `<Field.Prose>` is the description, `<Field.HelpText>` is the help text (`<p>`) and `<Field.ErrorMessage>` is the `<p>`. Each part is also exported on its own (`FieldRoot`, `FieldLabel`, `FieldProse`, `FieldHelpText`, `FieldErrorMessage`), which is the form to import in a React Server Component, because a server component can't dot into a client module. The description is a [Prose](../prose/prose.md): it registers with the Field, so inside a Field write `<Field.Prose>`, not a bare `<Prose>`. The older flat names `Label` and `ErrorMessage`, and the callable `Field`, still work but are deprecated.
- The label names the control, and clicking it focuses the control. The descriptions, the help texts and the error are in the control's `aria-describedby`: every description and help text in DOM order, then the error, and only the parts that are rendered.
- **A description and a help text are different things.** A description (`Field.Prose`) is what the user must read before they answer: what to answer, why we ask, where to find it. It goes above the control, in body type (16px), and may hold paragraphs, lists and links. A help text (`Field.HelpText`) is a short instruction that helps while typing: a format, an example or a limit, such as "12 siffror, ÅÅÅÅMMDD-NNNN". It goes under the control, in 14px (`body-small`). When in doubt: if the user must read it before they start, it's a description. If it helps while typing, it's a help text.
- A field can have several descriptions and help texts. Each has its own id.
- **A help text is plain text.** The accessible description is the text content, so a heading, list or link inside it loses its structure for a screen-reader user, and a link in it can't be followed from there. Keep a help text to one or two short sentences or a format example, with no links. Anything with structure goes in a `Field.Prose`. A help text is never the only place a format lives: the error repeats it. A help text never moves focus, is never a live region, and keeps its look when the field is invalid, disabled or read-only: the error carries the invalid state, and a disabled field's help text stays readable because it often says why. Every `Prose` and `HelpText` inside a Field, at any depth, registers as a description. A `HelpText` outside a Field or Fieldset warns in development and renders a plain paragraph with no id.
- `invalid` puts `aria-invalid="true"` on the control and `data-invalid` on every part, and the Field.ErrorMessage renders. Without `invalid` the Field.ErrorMessage renders nothing, so a stale error is never referenced.
- `required` puts `aria-required="true"` on the control, never native `required`: the browser shows no validation bubble of its own, in its own language. Required fields carry no visible marker. A field that isn't required ends its label with the `field.optional` text, "(valfritt)" in Swedish, which is part of the accessible name. `<Field.Label marker="none">` leaves it out. If you also want the browser's native validation, put `required` on the control _and_ keep it on Field, or the label says "(optional)" while assistive technology announces "required".
- The error starts with the `field.errorPrefix` text ("Fel:") and an error icon. The theme hides the prefix visually, so screen-reader users hear "Fel: Ange ditt namn" without relying on the colour. Errors are not live regions: they are read when the user reaches the control. On submit, move focus to the first invalid field (until the error summary block ships).
- Headless: no CSS. The parts render `kv-field`, `kv-field-label`, `kv-field-help-text`, `kv-field-error-message`, `kv-field-error-prefix` and `kv-field-optional`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## API

| Part                 | Renders                                                       | What it is                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Field.Root`         | `<div class="kv-field">`                                      | The field. Takes `invalid`, `required`, `disabled`, `controlId`, `messages` and every `<div>` prop. Gives the control inside it its id, `aria-*` and `disabled` |
| `Field.Label`        | `<label for class="kv-field-label">`                          | The visible label. `marker` is `'optional'` (the default) or `'none'`, and `'none'` in a group. It must stay a `<label>`                                        |
| `Field.Prose`        | a [Prose](../prose/prose.md) (`<div class="kv-prose">`)       | The description, above the control: what to answer, why we ask, where to find it. Registers with the Field, so write `Field.Prose` and not a bare `Prose`       |
| `Field.HelpText`     | `<p class="kv-field-help-text">`                              | The help text, under the control: a format, an example or a limit. Plain text                                                                                   |
| `Field.ErrorMessage` | `<p class="kv-field-error-message">` with the icon and prefix | The error. It renders only while the Field is invalid. One per Field                                                                                            |

| State attribute | Where and when                                                             |
| --------------- | -------------------------------------------------------------------------- |
| `data-invalid`  | On every part and on the control, when `invalid`                           |
| `data-required` | On every part except the descriptions, and on the control, when `required` |
| `data-disabled` | On every part and on the control, when `disabled`                          |

- **ARIA it sets on the control:** `id` (the `controlId`, else generated), `aria-describedby` (every description and help text in DOM order, then the error, then the ids you pass yourself), `aria-invalid="true"` and `aria-required="true"`, and native `disabled`. On the label: `for` and an `id` (`<controlId>-label`).
- **Ids:** the label is `<controlId>-label`, the error `<controlId>-error` and each description `<controlId>-description-<generated>`. Don't give a control inside a Field its own `id`.
- **`render`** on every part receives the Field's state (`isInvalid`, `isRequired`, `isDisabled`).
- **Classes:** `kv-field`, `kv-field-label`, `kv-field-optional` (the optional text in the label), `kv-field-help-text`, `kv-field-error-message` and `kv-field-error-prefix`. Your `className` joins them.
- **Messages (`messages`):** `optional` (the text after a label that isn't required: "(valfritt)") and `errorPrefix` (the hidden word before an error: "Fel:"). Both are in `@kvirn-ui/i18n` in six languages.
- **Dev warnings (once):** a `Field.Label` outside a `Field.Root` (`field-label-outside-field`) renders a plain `<label>` that names nothing; a `Field.ErrorMessage` outside a Field or Fieldset (`field-error-message-outside-field`) always shows and describes nothing; a `Field.HelpText` outside one (`help-text-outside-field`) or before its control (`help-text-before-control`); two error messages in one Field; a control with an `id` of its own; a control with no label.

## Component

```tsx
import { Field, TextInput } from '@kvirn-ui/react'

;<Field.Root invalid={errors.phone !== undefined}>
  <Field.Label>Telefonnummer</Field.Label>
  <Field.Prose>
    <p>Vi ringer bara om något är fel.</p>
  </Field.Prose>
  <TextInput name="phone" type="tel" autoComplete="tel" />
  <Field.HelpText>Till exempel 070-123 45 67</Field.HelpText>
  <Field.ErrorMessage>{errors.phone}</Field.ErrorMessage>
</Field.Root>
```

### The default order

Render the parts in this order: **label, description, control, help text, then the error**. The reading order, the DOM order and the visual order are then the same, and the theme spaces every part one gap from the next.

```tsx
<Field.Root invalid={errors.registration !== undefined}>
  <Field.Label>Fordonets registreringsnummer</Field.Label>
  <Field.Prose>
    <p>Det står på registreringsbeviset.</p>
  </Field.Prose>
  <TextInput name="registration" className="kv-input--width-10" />
  <Field.HelpText>Till exempel ABC 123</Field.HelpText>
  <Field.ErrorMessage>{errors.registration}</Field.ErrorMessage>
</Field.Root>
```

- **The description, above the control:** what to answer, why we ask and where to find it: anything the user needs before they start typing. It may have paragraphs, a list or a link. It is 16px wherever it sits. Most fields have no description at all.
- **The help text, under the control:** a format example or a limit that helps while typing. It is 14px. Never the only instruction: a magnifier user may not see under the box until they've typed, so the error repeats the format when the format is the problem. A help text never goes above the control: text above the control is read before answering, which makes it a description. A `Field.HelpText` rendered before its control gives a dev warning (`help-text-before-control`).
- **The error goes last,** after the help text, so the spoken order is the visual order and nothing moves when the error appears.
- **Each description and help text has its own id.** The control's `aria-describedby` lists them in DOM order, then the error's, whatever the visual order: a screen-reader user hears the description, the help text, then "Fel: …". Don't give one an `id` of your own: the Field's wins, and a dev warning says so.
- **One error per Field.** Two `Field.ErrorMessage`s share an id, so a dev warning fires. Put all the text in one.
- **The order is yours.** The library doesn't enforce it, except for one dev warning when a help text comes before its control: render the parts in another order and the spacing and the description still work. Put the error above the control, or a help text after the error, if your service needs it.
- **An option's help text.** A checkbox or radio in its own Field takes a `Field.HelpText` under its label, for example "Lägst pris per månad." It lines up with the label's text, sits directly under the label's box and outside the click target, and describes that option's input and not the group. An option that needs more than a help text puts a `Field.Prose` there instead.

### Focus on submit, on a phone

With the error under the control, the on-screen keyboard or an autocomplete list can cover it when the field gets focus. So:

- **On submit, move focus** to the error summary (when the block ships, M4), or until then to the first invalid field.
- **Keep `scroll-padding` on the page's scroll container,** so the browser scrolls the field far enough up when it gets focus. The start value is the height of a sticky header (2.4.11), and the end value leaves room for the message under the field. `scroll-padding-block-end: 8rem` is a starting point.

```css
html {
  scroll-padding-block: 4rem 8rem;
}
```

iOS doesn't always honour `scroll-padding` for its keyboard, so this is listed as an open usability question, not a solved problem.

Your part:

- **A visible label on every control.** A placeholder isn't a label (3.3.2). Put examples in a `Field.HelpText`.
- **Say what's wrong and how to fix it,** in the field's own words, without blaming the user: "Ange ditt fullständiga namn", not "Ogiltigt värde". Plain text: the icon, the prefix and the text lay out as one line. Set `invalid` and render the Field.ErrorMessage together.
- **Validate on submit, not on every key,** so content doesn't move under a magnifier. Keep what the user typed.
- **`controlId`** gives the control the id you need to link to it, for example from an error summary. Don't pass an `id` to a control inside a Field: the Field's id wins, and a dev warning says so.
- **`lang`** on a label whose text is in another language (3.1.2).
- **Messages.** `field.optional` and `field.errorPrefix` come from `@kvirn-ui/i18n` in six languages, and can be overridden per provider and per instance: `<Field.Root messages={{ optional: '(frivilligt)' }}>`.
- **A checkbox or radio** must be a direct child of `Field.Root` (later phase): the default theme finds its layout from `.kv-field:has(> .kv-checkbox, > .kv-radio)`.

### Classes for the default theme

| Class                                         | On                                                           | Sets                                                            |
| --------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `kv-field-label--heading`                     | Field.Label                                                  | the label is the page's `h1`: `<h1><Field.Label className="…">` |
| `kv-input--width-2`, `-4`, `-6`, `-10`, `-20` | TextInput (see [text-input.md](../text-input/text-input.md)) | a width by expected characters                                  |

The default theme styles the parts as described in the design spec: labels 16px at weight 500 (14px in `kv-compact`), descriptions (a Prose) 16px and help texts (`kv-field-help-text`) 14px (`body-small`), both in the text colour and in both densities, errors 16px in `danger`. Errors never go below 16px, and a description or help text is never muted. The size follows the part and never its position. The theme doesn't style `data-invalid` or `data-disabled` on a help text: the attributes are there for your own CSS. A `Prose` under a control used to be 14px and is now 16px: switch it to `Field.HelpText`.

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

The description props carry the class `kv-prose`, so a description on your own element is styled as prose, like a `Field.Prose` in a Field. For a help text on your own element, spread them and set the help text's class: `<p {...field.getDescriptionProps('format')} className="kv-field-help-text">`.

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
      <p {...field.getDescriptionProps('format')} className="kv-field-help-text">
        Till exempel ABC 123
      </p>
      {invalid ? <p {...field.errorMessageProps}>{field.errorPrefix} Ange ett nummer</p> : null}
    </div>
  )
}
```

- `descriptions` and `hasDescription` can be combined: the `hasDescription` one (`descriptionProps`) comes first. For new code, use `descriptions` only.
- Only list a name you render. A name with no element leaves `aria-describedby` pointing at a missing id.
- `useFieldset` has the same `descriptions` option and `getDescriptionProps(name)`.

### `render`

Every part takes `render` to change its element. The part's props are merged into yours: class names join, handlers chain and refs merge. The Field.Label must stay a `<label>`, so the control keeps its name.

```tsx
<Field.Prose render={<p />}>Som det står i ditt pass.</Field.Prose>
<Field.Prose render={(props) => <p {...props} />}>Som det står i ditt pass.</Field.Prose>
<Field.HelpText render={<div />}>Till exempel ABC 123</Field.HelpText>
```

A Prose is a `<div>` by default, so a description can hold several paragraphs. `render={<p />}` makes a one-line description a paragraph. A `Field.HelpText` is a `<p>` by default, and `render={<div />}` changes it. Keep it a non-interactive element.
