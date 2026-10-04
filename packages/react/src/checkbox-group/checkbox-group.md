# CheckboxGroup

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [checkbox-group.a11y.md](checkbox-group.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** CheckboxGroup renders the values you give it and reports each change up through `onValueChange`. It never stores the selection, and it doesn't validate.

A CheckboxGroup is one question with several answers that can all be true: "Hur vill du bli kontaktad?" with e-post, sms and brev. It groups [Checkbox](../checkbox/checkbox.md)es under a legend, with an optional description, hint and error. For a single yes-or-no answer, use a lone [Checkbox](../checkbox/checkbox.md) in a [Field](../field/field.md). For exactly one answer out of several, use a [RadioGroup](../radio-group/radio-group.md). For a choice from a long list, use a [Listbox](../listbox/listbox.md).

- `CheckboxGroup.Root` renders the native `<fieldset>` and acts as a [Fieldset](../fieldset/fieldset.md) with `group` set. The `CheckboxGroup.Legend` is its accessible name. Entering the group, a screen reader reads the legend, "group", the description and hint, and the error when it is invalid.
- Each option is a `Checkbox` with a `value`, directly in its own `Field.Root` before the `Field.Label`. The group gives it its `name` and its checked state, and reports the next values. A Field inside a group has no "(optional)" marker: the marker belongs to the question, so the legend ends with "(valfritt)" when the group isn't `required`.
- **Controlled:** pass `value` (an array of the checked values) and `onValueChange(values, { reason: 'input', event })`. **Uncontrolled:** pass `defaultValue` and `name`, and the browser keeps the state; a form submit sends every checked box under the group's `name` (`FormData.getAll`).
- Each checkbox is its own Tab stop. The group is not a composite widget, and the arrow keys do nothing.
- Headless: no CSS. It renders `kv-checkbox-group` next to `kv-fieldset`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported it is styled.

## API

Five parts. Each is also exported on its own (`CheckboxGroupRoot`, `CheckboxGroupLegend`, `CheckboxGroupProse`, `CheckboxGroupHint`, `CheckboxGroupErrorMessage`), which is the form to import in a React Server Component, because a server component can't dot into a client module. The options are [Checkbox](../checkbox/checkbox.md) and [Field](../field/field.md) parts, not parts of the group.

| Part                         | Renders                      | What it is                                                                                                                           |
| ---------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `CheckboxGroup.Root`         | `<fieldset>`                 | The group. Takes the props below and every fieldset prop. `render` must still return a `<fieldset>`: a dev warning says so           |
| `CheckboxGroup.Legend`       | `<legend>`                   | The question and the group's name. Put it first. `marker` is `'optional'` (the default in a group that isn't `required`) or `'none'` |
| `CheckboxGroup.Prose`        | a [Prose](../prose/prose.md) | The description: what the user must read before answering, above the options, in 16px                                                |
| `CheckboxGroup.Hint`         | `<p>`                        | A short instruction that helps while answering, under the options, in 14px                                                           |
| `CheckboxGroup.ErrorMessage` | `<p>`                        | The error. It renders only when the group is `invalid`, and behaves like [Field's](../field/field.md). One per group                 |

These are the [Fieldset's](../fieldset/fieldset.md) parts under the group's name.

`CheckboxGroup.Root` props:

| Prop            | Type                                                     | Meaning                                                                                                                                                                    |
| --------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`          | `string`                                                 | The name every checkbox in the group submits under. A Checkbox's own `name` wins                                                                                           |
| `value`         | `readonly string[]`                                      | Controlled: the values of the checked boxes                                                                                                                                |
| `defaultValue`  | `readonly string[]`                                      | Uncontrolled: the values checked at the start                                                                                                                              |
| `onValueChange` | `(values: string[], { reason: 'input', event }) => void` | Controlled, it is `value` with the changed box's value added at the end or removed. Uncontrolled, it is read from the group's checked boxes, in DOM order. It only reports |
| `invalid`       | `boolean`                                                | `data-invalid` on the group's parts and on every checkbox, for styling, and the `ErrorMessage` renders. It does not cascade to the Fields' own `invalid`                   |
| `required`      | `boolean`                                                | `data-required`, and no optional text in the legend                                                                                                                        |
| `disabled`      | `boolean`                                                | Native `fieldset[disabled]`: every checkbox is disabled and skipped by Tab. `data-disabled` on every checkbox                                                              |
| `messages`      | `Partial<KvirnMessages['field']>`                        | Per-instance overrides of the legend's optional text and the error prefix: `field.optional` and `field.errorPrefix`                                                        |
| `render`        | `(props, state) => ReactElement`                         | Another element. It must still be a `<fieldset>`                                                                                                                           |

| State attribute | Where and when                                                                             |
| --------------- | ------------------------------------------------------------------------------------------ |
| `data-invalid`  | On the fieldset, the legend, the hint and the error, and on every checkbox, when `invalid` |
| `data-required` | On the fieldset and its parts, when `required`                                             |
| `data-disabled` | On the fieldset and on every checkbox, when `disabled`                                     |

- **ARIA it sets:** `aria-describedby` on the fieldset lists every description and hint in DOM order and then the error, only for parts that are rendered. There is **no `aria-invalid` and no `aria-required`** on the fieldset, and no `aria-invalid` on a checkbox in the group, because ARIA doesn't support them on `group`: the error reaches users through the description.
- **Classes:** `kv-checkbox-group kv-fieldset` on the root, `kv-fieldset-legend` on the legend.
- **Dev warnings (once):** a Checkbox in the group with no `value`; `checked` or `defaultChecked` on a Checkbox next to the group's (the group wins); a `render` that isn't a `<fieldset>`; two error messages in one group.
- **Messages.** The optional text and the error prefix are `field.optional` and `field.errorPrefix`, resolved like Field's. Override them per provider, or per instance with `messages`.

## Component

```tsx
import { Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'

;<CheckboxGroup.Root
  name="contact"
  value={contact}
  onValueChange={setContact}
  invalid={errors.contact !== undefined}
>
  <CheckboxGroup.Legend>Hur vill du bli kontaktad?</CheckboxGroup.Legend>
  <CheckboxGroup.Prose>
    <p>Välj alla som passar. Vi kontaktar dig bara om beslutet.</p>
  </CheckboxGroup.Prose>
  <Field.Root>
    <Checkbox value="email" />
    <Field.Label>E-post</Field.Label>
    <Field.Hint>Beslutet kommer inom en vecka.</Field.Hint>
  </Field.Root>
  <Field.Root>
    <Checkbox value="sms" />
    <Field.Label>Sms</Field.Label>
  </Field.Root>
  <CheckboxGroup.Hint>Du kan ändra dig senare under Mina sidor.</CheckboxGroup.Hint>
  <CheckboxGroup.ErrorMessage>{errors.contact}</CheckboxGroup.ErrorMessage>
</CheckboxGroup.Root>
```

The default order is the legend, the description, the options, the hint, then the error, so the visual order is the spoken order.

Your part:

- **Put the `CheckboxGroup.Legend` first.** It asks the question. Make it a sentence a person can answer.
- **Give every Checkbox a `value`.** The group can't tell the options apart without it.
- **A description and a hint are text.** The accessible description is the text content, so a heading, list or link inside it loses its structure for a screen-reader user. Keep a hint to one or two short sentences with no links. A hint for a single option is a `Field.Hint` in that option's Field.
- **Set `invalid` and render a `CheckboxGroup.ErrorMessage` together,** with text that says what's wrong and how to fix it. `invalid` marks the group and its options for the theme (a 2px edge) but never turns on the options' own `invalid`. On submit, move focus to the first checkbox of the group, since the group never moves focus.
- **Don't nest groups,** and don't use a group for a single option. A lone declaration is a [Checkbox](../checkbox/checkbox.md) in a Field.
- **A required group isn't announced as required.** `aria-required` isn't supported on `group`, so `required` only removes "(valfritt)" from the legend and sets `data-required`. Say what is required in the legend or the description. The assistive-technology test run decides whether a fallback is needed.
- **Uncontrolled `onValueChange` reads the DOM** from the group's `<fieldset>` when a box changes, so keep the root a `<fieldset>`.

## Hook

```tsx
import { useCheckboxGroup, useFieldset } from '@kvirn-ui/react'

function Contact({ value, setValue }: { value: string[]; setValue: (value: string[]) => void }) {
  const fieldset = useFieldset({ group: true })
  const group = useCheckboxGroup({ name: 'contact', value, onValueChange: setValue })
  return (
    <fieldset {...fieldset.fieldsetProps} ref={group.groupRef}>
      <legend {...fieldset.legendProps}>Hur vill du bli kontaktad?</legend>
      <input type="checkbox" value="email" {...group.getCheckboxProps('email')} />
    </fieldset>
  )
}
```

`useCheckboxGroup` takes `name`, `value`, `defaultValue`, `onValueChange`, `invalid` and `disabled`, and returns `name`, `groupRef` and `getCheckboxProps(value)`. Spread `getCheckboxProps(value)` on each `<input type="checkbox">` (it gives `name`, `checked` or `defaultChecked`, `onChange` and the `data-*` attributes), and attach `groupRef` to your `<fieldset>` so an uncontrolled group can read its checked boxes. Pair it with `useFieldset({ group: true })` for the legend, hint and error. It holds no state.
