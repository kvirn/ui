# Checkbox

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [checkbox.a11y.md](checkbox.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** Checkbox is a native `<input type="checkbox">`. It shows the `checked` you give it and reports changes through `onCheckedChange`. It never copies the state into state of its own, and it doesn't validate.

A Checkbox is one yes-or-no answer: a declaration, a consent, or a "select all" in a staff table. For several answers to one question, use a [CheckboxGroup](../checkbox-group/checkbox-group.md). For exactly one answer out of several, use a [RadioGroup](../radio-group/radio-group.md). For a choice from a long list, use a [Listbox](../listbox/listbox.md).

- A native checkbox: the browser supplies the role, the Space key, the label click and form submission. Checkbox adds the Field's wiring, the part class, `indeterminate` and `data-state`.
- It sits directly in a [Field](../field/field.md), before the `Field.Label`. The Field gives it its `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled`. The label is the checkbox's name and the whole row is the click target.
- **Controlled:** pass `checked` and `onCheckedChange(checked, { reason: 'input', event })`. **Uncontrolled:** pass `defaultChecked` and `name`, and the browser keeps the state until a form submit reads it. `onChange` and every other native input prop, `name` and `ref` pass through.
- **Indeterminate** is the mixed state of a "select all" box. It is a DOM property, so a screen reader hears "mixed", and the prop decides: a click checks the box, and you pass `indeterminate={false}` once the user has chosen.
- Inside a [CheckboxGroup](../checkbox-group/checkbox-group.md) it takes its `name` and its checked state from the group, by its `value`.
- Headless: no CSS. It renders `kv-checkbox`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported it is styled.

## API

Checkbox is a single part, `<Checkbox>`, and it renders an `<input type="checkbox">`. `type` is fixed. There are no sub-parts: the label, hint and error are the [Field's](../field/field.md).

| Prop              | Type                                            | Meaning                                                                                                                                                    |
| ----------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checked`         | `boolean`                                       | Controlled: the state from your form logic. Pair it with `onCheckedChange`                                                                                 |
| `defaultChecked`  | `boolean`                                       | Uncontrolled: the browser keeps the state, and a form submit sends it                                                                                      |
| `indeterminate`   | `boolean`                                       | The mixed state, set as the DOM property after render. It is never cleared by a click: you pass `false` once the user chooses                              |
| `value`           | `string`                                        | What a form submit sends when checked, and this option's value inside a CheckboxGroup (required there)                                                     |
| `name`            | `string`                                        | The name a form submit uses. Inside a CheckboxGroup, the group's `name` is the default and your own wins                                                   |
| `disabled`        | `boolean`                                       | Native `disabled`: skipped by Tab. A disabled Field disables it too. Sets `data-disabled`                                                                  |
| `onCheckedChange` | `(checked, { reason: 'input', event }) => void` | Called on every change with the new state. It only reports. `onChange` still works too                                                                     |
| `render`          | `(props, state) => ReactElement`                | Another element. It must still be an `<input type="checkbox">`. `state` is `isInvalid`, `isRequired`, `isDisabled`, `isFocusVisible` and `isIndeterminate` |

| State attribute      | When                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `data-state`         | Always: `checked`, `unchecked` or `indeterminate`. It follows the props when controlled, and the native state after each change when not |
| `data-invalid`       | The Field is `invalid`, or the CheckboxGroup is                                                                                          |
| `data-required`      | The Field is `required`                                                                                                                  |
| `data-disabled`      | The Field, the group or the prop disables it                                                                                             |
| `data-focus-visible` | Focus came from the keyboard                                                                                                             |

- **ARIA it sets:** `aria-invalid="true"` and `aria-required="true"` from the Field, and `aria-describedby` with the option's hint, then the error, followed by your own ids. A Checkbox in an invalid group gets only `data-invalid`, never `aria-invalid`. `aria-checked` is never written: the native state is the truth.
- **Class:** `kv-checkbox`, always. Your `className` joins it.
- **Dev warnings (once):** a Checkbox in a Field with no `Field.Label`; an `id` inside a Field (set `controlId` on the Field instead); a Checkbox in a CheckboxGroup with no `value`; and `checked` or `defaultChecked` next to the group's (the group wins).
- **No message keys.** Checkbox has no strings of its own. The Field's optional marker and error prefix are `field.optional` and `field.errorPrefix`, see [Field](../field/field.md).

## Component

```tsx
import { Checkbox, Field } from '@kvirn-ui/react'

;<Field.Root required invalid={errors.declaration !== undefined}>
  <Checkbox name="declaration" checked={declaration} onCheckedChange={setDeclaration} />
  <Field.Label>Jag intygar att uppgifterna är korrekta</Field.Label>
  <Field.ErrorMessage>{errors.declaration}</Field.ErrorMessage>
</Field.Root>
```

Your part:

- **Put the Checkbox directly in `Field.Root`, before the `Field.Label`,** so the box is at the inline start and the theme's choice layout applies.
- **Write the label as a sentence that can be answered "yes".** For a declaration or a consent, the label is the whole sentence ("Jag intygar att uppgifterna är korrekta"). Always show a visible label.
- **Set `required` on the Field for a single consent or declaration,** so the label has no "(optional)" and the box is `aria-required`; or use `marker="none"`. Inside a group, an option never carries an optional marker.
- **Set `invalid` and render a `Field.ErrorMessage` together,** with text that says what to do ("Bekräfta att uppgifterna är korrekta"). Validate on submit, and move focus to the first invalid control.
- **A hint for one option** is a `Field.Hint` in that option's Field, outside the label. It is part of the box's description, so keep it to a short plain sentence with no links.
- **Own `indeterminate`.** Set it from your data (some, but not all, children are checked), and pass `false` once the user has chosen. Don't use it for a box that was never answered. The first server-rendered paint is unchecked, because the DOM property can only be set after render.
- **Don't use a checkbox where a switch or a button is meant,** and don't use one for a yes-or-no question that needs both answers: use a RadioGroup.
- **After `form.reset()`** an uncontrolled box keeps a stale `data-state` until its next change. The theme styles `:checked` and `:indeterminate`, so the look is right. Read the native state, not the attribute, in your own code.

A "select all" with a mixed state:

```tsx
const someChecked = rows.some((row) => row.selected)
const allChecked = rows.every((row) => row.selected)

;<Field.Root marker="none">
  <Checkbox
    checked={allChecked}
    indeterminate={someChecked && !allChecked}
    onCheckedChange={(checked) => selectAll(checked)}
  />
  <Field.Label>Markera alla rader</Field.Label>
</Field.Root>
```

## Hook

```tsx
import { useCheckbox } from '@kvirn-ui/react'

function AllRows({ someChecked, allChecked }: { someChecked: boolean; allChecked: boolean }) {
  const checkbox = useCheckbox({ checked: allChecked, indeterminate: someChecked && !allChecked })
  return <input {...checkbox.inputProps} name="all" />
}
```

`useCheckbox` takes the same options as the props above (`checked`, `defaultChecked`, `indeterminate`, `value`, `name`, `disabled`, `onCheckedChange`) and returns `inputProps`, `isIndeterminate`, `isInvalid`, `isRequired`, `isDisabled` and `isFocusVisible`. Spread `inputProps` on your own `<input type="checkbox">`, next to your form library's props. It includes a `ref` that sets the DOM `indeterminate` property, so merge it with yours. It holds no state and reads the nearest Field and CheckboxGroup.
