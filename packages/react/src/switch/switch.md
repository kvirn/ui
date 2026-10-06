# Switch

> **Draft** (Plan 0069). This page moves to the docs site. The accessibility contract is [switch.a11y.md](switch.a11y.md) and the design spec is [docs/design/switch.md](../../../../docs/design/switch.md).

**KvirnUI holds no form state; bring your own form logic.** Switch is a native `<input type="checkbox" role="switch">`. It shows the `checked` you give it and reports changes through `onCheckedChange`. It never copies the state into state of its own, and it doesn't validate.

A Switch is a setting that takes effect at once, with no Save button ("Få meddelanden som sms").

| Use a                               | When                                                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Switch**                          | A setting on or off that takes effect at once, and both states are safe to try                                                   |
| [Checkbox](../checkbox/checkbox.md) | An answer sent with a form, a declaration, a consent, a required choice, or a "select all". For several answers, a CheckboxGroup |
| [Toggle](../toggle/toggle.md)       | A button with `aria-pressed` for a direct, visible effect on the page ("Show map"), not a labelled setting in a field            |

- A native checkbox with the switch role: the browser supplies Space, the label click, form submission, `form.reset()` and `disabled`.
- It sits directly in a [Field](../field/field.md), before the `Field.Label`. The Field gives it its `id`, `aria-describedby`, `aria-invalid` and `disabled`. The label is the switch's name and the whole row is the click target.
- **Space toggles. Enter does not**, and is never prevented: in a form the browser may submit it. APG makes Enter optional.
- **Controlled:** pass `checked` and `onCheckedChange(checked, { reason: 'input', event })`. **Uncontrolled:** pass `defaultChecked` and `name`. Checked sends `name=value` (`on` by default); off sends nothing.
- **Not required.** `required` is not a prop: off is a valid answer, and a consent is a Checkbox. A required Field gives no `aria-required` and warns once.
- Headless: no CSS. It renders `kv-switch`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported it is styled.

## API

Switch is a single part, `<Switch>`. `type` and `role` are fixed. There are no sub-parts: the label, help text and error are the [Field's](../field/field.md).

| Prop              | Type                                            | Meaning                                                                                                                |
| ----------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `checked`         | `boolean`                                       | Controlled: the state from your logic. Pair it with `onCheckedChange`                                                  |
| `defaultChecked`  | `boolean`                                       | Uncontrolled: the browser keeps the state, and a form submit sends it                                                  |
| `value`           | `string`                                        | What a form submit sends when on (`on` by default)                                                                     |
| `name`            | `string`                                        | The name a form submit uses                                                                                            |
| `disabled`        | `boolean`                                       | Native `disabled`: skipped by Tab. A disabled Field disables it too. Sets `data-disabled`                              |
| `onCheckedChange` | `(checked, { reason: 'input', event }) => void` | Called on every change with the new state. It only reports. `onChange` still works too                                 |
| `render`          | `(props, state) => ReactElement`                | Another element. It must still be an `<input type="checkbox">`. `state` is `isInvalid`, `isDisabled`, `isFocusVisible` |

| State attribute      | When                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `data-state`         | Always: `checked` or `unchecked`. It follows the props when controlled, the native state when not |
| `data-invalid`       | The Field is `invalid`                                                                            |
| `data-disabled`      | The Field or the prop disables it                                                                 |
| `data-focus-visible` | Focus came from the keyboard                                                                      |

- **ARIA it sets:** `role="switch"`, `aria-invalid="true"` from the Field, and `aria-describedby` with the help text, then the error, followed by your own ids. `aria-checked` and `aria-required` are never written.
- **Class:** `kv-switch`, always. Your `className` joins it.
- **Dev warnings (once):** a Switch in a Field with no `Field.Label`; a Switch outside a Field with no accessible name; an `id` inside a Field (set `controlId` on the Field); a required Field (`switch-required`); a label that shows "(optional)" (`switch-optional-marker`).
- **No message keys.** Switch has no strings of its own: the label is the only text.

## Component

```tsx
import { Field, Switch } from '@kvirn-ui/react'

;<Field.Root>
  <Switch name="sms" checked={sms} onCheckedChange={setSms} />
  <Field.Label marker="none">Få meddelanden som sms</Field.Label>
  <Field.HelpText>Du kan ändra detta när som helst.</Field.HelpText>
</Field.Root>
```

Your part:

- **Put the Switch directly in `Field.Root`, before a `<Field.Label marker="none">`,** so the track is at the inline start, the theme's choice layout applies and the label has no "(optional)".
- **The label names the setting,** a noun phrase that reads correctly with "on" or "off" after it. Never "På"/"Av" in it, and never a label that changes with the state.
- **Say that it saves at once** ("Ändringar sparas direkt") and confirm the result through an always-mounted live region (`<output>` or the `Announcer`, 4.1.3). Keep the switch enabled and focused while saving: a disabled element loses focus (2.4.3). If the save fails, put the switch back, show an error and announce it.
- **Never change context on input** (3.2.2): a switch doesn't navigate, reload or move focus.
- **A switch that isn't available** is `disabled`, with the reason in the help text.
- **Prefer a Checkbox or RadioGroup in a submitted e-service form.** A plain form submits switches natively (secondary use), but a "yes or no" answer is a RadioGroup, a declaration is a Checkbox.
- **A group of settings** is a `Fieldset.Root group` of Fields, one Switch each.

## Hook

```tsx
import { useSwitch } from '@kvirn-ui/react'

function SmsSwitch({ sms, setSms }: { sms: boolean; setSms: (checked: boolean) => void }) {
  const switchControl = useSwitch({ checked: sms, onCheckedChange: setSms })
  return <input {...switchControl.inputProps} name="sms" />
}
```

`useSwitch` takes `checked`, `defaultChecked`, `value`, `name`, `disabled` and `onCheckedChange`, and returns `inputProps`, `isInvalid`, `isDisabled` and `isFocusVisible`. Spread `inputProps` on your own `<input>`, next to your form library's props. It holds no state and reads the nearest Field.
