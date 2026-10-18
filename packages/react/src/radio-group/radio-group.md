# RadioGroup

> **Draft** (Plan 0013). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [radio-group.a11y.md](radio-group.a11y.md), the design spec is [docs/design/form-fields.md](../../../../docs/design/form-fields.md), and the decisions are in the forms skill.

**KvirnUI holds no form state; bring your own form logic.** RadioGroup renders the value you give it and reports the radio the user chose through `onValueChange`. It never stores the selection (the one exception is UI state for a `RadioGroup.Reveal`, below), and it doesn't validate.

A RadioGroup is one question with exactly one answer: "How long do you need the permit?" with 1, 6 or 12 months. It groups native radios under a legend, with an optional description, help text and error. For several answers that can all be true, use a [CheckboxGroup](../checkbox-group/checkbox-group.md). For a single yes-or-no answer, use a [Checkbox](../checkbox/checkbox.md). For a choice from a long list, use a [Listbox](../listbox/listbox.md).

- `RadioGroup.Root` renders the native `<fieldset>` and acts as a [Fieldset](../fieldset/fieldset.md) with `group` set, instead of `role="radiogroup"`. The `RadioGroup.Legend` is its accessible name.
- Each option is a `RadioGroup.Radio` with a `value`, directly in its own `RadioGroup.Option`, before the `Field.Label`. The group gives it a shared `name` (generated when you give none, so the browser groups them), its checked state from `value`, and reports the change. An Option has no optional marker and no error message of its own: the marker belongs to the question, so the legend ends with the optional text (in `en`, "(optional)") when the group isn't `required`.
- **Controlled:** pass `value` (the checked radio's value, or `null` for none) and `onValueChange(value, { reason: 'input', event })`. **Uncontrolled:** pass `defaultValue` and `name`, and the browser keeps the state until a form submit reads it.
- The browser does the keys. The group is one Tab stop, and the arrow keys move focus and check, mirrored in right-to-left. No key handler is added.
- **A radio never gets `aria-invalid`.** ARIA doesn't support it on `radio`. An invalid group marks every radio with `data-invalid` for the theme, and the group's error reaches users through the fieldset's description.
- Headless: no CSS. It renders `kv-radio-group` next to `kv-fieldset`, and each radio renders `kv-radio`. Your `className` joins them. With `@kvirn-ui/theme/theme.css` imported it is styled.

## API

Eight parts. Each is also exported on its own (`RadioGroupRoot`, `RadioGroupOption`, `RadioGroupRadio`, `RadioGroupReveal`, `RadioGroupLegend`, `RadioGroupProse`, `RadioGroupHelpText`, `RadioGroupErrorMessage`), which is the form to import in a React Server Component, because a server component can't dot into a client module. The flat `Radio` still works but is **deprecated**: write `RadioGroup.Radio`. It is removed in 1.0.

| Part                      | Renders                      | What it is                                                                                                                                                                                     |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RadioGroup.Root`         | `<fieldset>`                 | The group. Takes the props below and every fieldset prop.                                                                                                                                      |
| `RadioGroup.Legend`       | `<legend>`                   | The question and the group's name. Put it first. `marker` is `'optional'` (the default in a group that isn't `required`) or `'none'`                                                           |
| `RadioGroup.Option`       | `<div>`                      | One answer: wires its `Field.Label` and `Field.HelpText` to the radio. `disabled`, `controlId` (the radio's id, for an error summary link), `as` (`div` or `li`). No optional marker, no error |
| `RadioGroup.Radio`        | `<input type="radio">`       | One option. Directly in a `RadioGroup.Option`, before the label, inside a `RadioGroup.Root`                                                                                                    |
| `RadioGroup.Prose`        | a [Prose](../prose/prose.md) | The description: what the user must read before answering, above the options, in 16px                                                                                                          |
| `RadioGroup.HelpText`     | `<p>`                        | A short instruction that helps while answering, under the options, in 14px                                                                                                                     |
| `RadioGroup.ErrorMessage` | `<p>`                        | The error. It renders only when the group is `invalid`, and behaves like [Field's](../field/field.md). One per group                                                                           |

`RadioGroup.Prose`, `.HelpText` and `.ErrorMessage` and `.Legend` are the [Fieldset's](../fieldset/fieldset.md) parts under the group's name.

`RadioGroup.Root` props:

| Prop            | Type                                                  | Meaning                                                                                                                                               |
| --------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`          | `string`                                              | The name every radio shares, so the browser groups them. Default: generated                                                                           |
| `value`         | `string \| null`                                      | Controlled: the value of the checked radio. `null` means controlled with nothing checked                                                              |
| `defaultValue`  | `string`                                              | Uncontrolled: the value checked at the start                                                                                                          |
| `onValueChange` | `(value: string, { reason: 'input', event }) => void` | Called with the value of the radio the user chose. It only reports                                                                                    |
| `invalid`       | `boolean`                                             | `data-invalid` on the group's parts and on every radio, for styling, and the `ErrorMessage` renders. It does not cascade to the Fields' own `invalid` |
| `required`      | `boolean`                                             | `data-required`, and no optional text in the legend                                                                                                   |
| `disabled`      | `boolean`                                             | Native `fieldset[disabled]`: every radio is disabled and skipped by Tab and the arrow keys. `data-disabled` on every radio                            |
| `messages`      | `Partial<KvirnMessages['field']>`                     | Per-instance overrides of the legend's optional text and the error prefix: `field.optional` and `field.errorPrefix`                                   |

`RadioGroup.Radio` props:

| Prop             | Type      | Meaning                                                                                                      |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `value`          | `string`  | This option's value, and what a form submit sends when it is checked. Required inside a group                |
| `disabled`       | `boolean` | Native `disabled`: skipped by Tab and the arrow keys. A disabled Field disables it too. Sets `data-disabled` |
| `name`           | `string`  | Outside a group only. Inside one, the group's name is the default and yours wins                             |
| `checked`        | `boolean` | Outside a group only. Inside one, the group's `value` sets it and this is ignored                            |
| `defaultChecked` | `boolean` | Outside a group only. Inside one, the group's `defaultValue` sets it                                         |

`type` is fixed, and every other native input prop (`onChange`, `form`, `ref`) passes through. There is no `onCheckedChange`: use the group's `onValueChange`.

| State attribute | Where and when                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-invalid`  | On the fieldset, the legend, the help text and the error, and on every radio, when the group (or the radio's Field) is `invalid`            |
| `data-required` | On the fieldset and its legend, when `required`                                                                                             |
| `data-disabled` | On the fieldset and on every radio, when `disabled`                                                                                         |
| `data-state`    | On a radio whose state is known from props: `checked` or `unchecked`. An uncontrolled radio has none: style `:checked` for the native state |

- **ARIA it sets:** `aria-describedby` on the fieldset lists every description and help text in DOM order and then the error, only for parts that are rendered. A radio's `aria-describedby` lists its own option help text, followed by your own ids. There is **no `aria-invalid` and no `aria-required`** on the fieldset or the radios.
- **Classes:** `kv-radio-group kv-fieldset` on the root, `kv-fieldset-legend` on the legend, `kv-radio` on each radio, `kv-radio-group-reveal` on a reveal.
- **Dev warnings (once):** a Radio in the group with no `value`; `checked` or `defaultChecked` on a Radio next to the group's (the group wins); two error messages in one group; a Radio in a Field with no `Field.Label`.
- **Messages.** The optional text and the error prefix are `field.optional` and `field.errorPrefix`, resolved like Field's. The Reveal's announcement is `radioGroup.revealShown`. Override them per provider, or per instance with `messages`.

## Component

```tsx
import { Field, RadioGroup } from '@kvirn-ui/react'

;<RadioGroup.Root
  name="duration"
  value={duration}
  onValueChange={setDuration}
  required
  invalid={errors.duration !== undefined}
>
  <RadioGroup.Legend>How long do you need the permit?</RadioGroup.Legend>
  <RadioGroup.Prose>
    <p>Choose one. The permit applies from the day you apply.</p>
  </RadioGroup.Prose>
  <RadioGroup.Option>
    <RadioGroup.Radio value="1" />
    <Field.Label>1 month</Field.Label>
  </RadioGroup.Option>
  <RadioGroup.Option>
    <RadioGroup.Radio value="12" />
    <Field.Label>12 months</Field.Label>
    <Field.HelpText>Cheapest per month.</Field.HelpText>
  </RadioGroup.Option>
  <RadioGroup.HelpText>You can apply for an extension later.</RadioGroup.HelpText>
  <RadioGroup.ErrorMessage>{errors.duration}</RadioGroup.ErrorMessage>
</RadioGroup.Root>
```

The default order is the legend, the description, the options, the help text, then the error, so the visual order is the spoken order.

Your part:

- **Put the `RadioGroup.Legend` first.** It asks the question.
- **Give every Radio a `value`.** The group can't tell the options apart without it.
- **Pre-select nothing unless you know the answer.** With no `defaultValue` and `value` of `null`, nothing is checked, and Tab enters the group at its first radio. A pre-selected default makes an unanswered question look answered. A controlled group starts empty with `value={null}` and stays controlled: it shows the `value` it is given after each `onValueChange`.
- **A radio outside a RadioGroup** is a `RadioGroup.Radio` with its own `name`, `value` and `checked` (or `defaultChecked`), in a `Fieldset.Root` with a legend. A controlled radio carries `data-state="checked"` or `"unchecked"`; an uncontrolled one has none, so style `:checked`. Radios that share a `name` are one group for the whole document, so give each question its own.
- **Don't do anything harmful or slow on `change`.** The arrow keys check the radio they move to, so a keyboard user changes the answer just by moving (WCAG 3.2.2). Don't navigate or submit from `onValueChange`.
- **A description and a help text are text.** The accessible description is the text content, so a heading, list or link inside it loses its structure for a screen-reader user. Keep a help text to one or two short sentences with no links. A help text for a single option is a `Field.HelpText` in that `RadioGroup.Option`.
- **Set `invalid` and render a `RadioGroup.ErrorMessage` together,** with text that says what's wrong and how to fix it. Because a radio has no `aria-invalid`, the error message is the only thing that tells a screen-reader user. On submit, move focus to the first radio of the group, since the group never moves focus.
- **A required group isn't announced as required.** `aria-required` isn't supported on `group` or `radio`, so `required` only removes the optional text (in `en`, "(optional)") from the legend and sets `data-required`. Say what is required in the legend or the description. The assistive-technology test run decides whether a fallback is needed.
- **A radio has no focus state of its own** (no `data-focus-visible`). A re-render while a radio has focus makes React write its `name` again, and Chromium then stops treating the group as one Tab stop, so style focus with `:focus-visible`.
- **An "Other, please specify" field is a `RadioGroup.Reveal`.** Put `<RadioGroup.Reveal value="other">` with a `Field.Root` and a `TextInput` right after the "Other" radio's `RadioGroup.Option`. It is `hidden` until that radio is checked, focus stays on the radio (Tab then reaches the field), the radio gets `aria-controls`, and a polite announcement says a field appeared. It is never unmounted, so the typed text survives switching options and a plain form still submits it: ignore or clear it when another option is chosen. An uncontrolled group goes back to `defaultValue` on a form reset.
- **A Field in a Reveal is its own question.** It keeps its optional marker and required state, and its help text is its own description, not the group's.
- **When the announcement is silent.** A controlled `value` that your code commits after an await or in a transition shows the field without an announcement: only a radio the user checked announces. Browser form restoration (back navigation) can check a radio before the group's mirrored value knows; the field then follows the next change. Both are known limits.
- **Browsers differ on Shift+Tab into an unchecked group:** Chrome and Firefox focus the last radio, Safari the first.

## Hook

```tsx
import { useFieldset, useRadioGroup } from '@kvirn-ui/react'

function Duration({
  value,
  setValue,
}: {
  value: string | null
  setValue: (value: string) => void
}) {
  const fieldset = useFieldset({ group: true })
  const group = useRadioGroup({ value, onValueChange: setValue })
  return (
    <fieldset {...fieldset.fieldsetProps}>
      <legend {...fieldset.legendProps}>How long do you need the permit?</legend>
      <input type="radio" value="1" {...group.getRadioProps('1')} />
      <input type="radio" value="12" {...group.getRadioProps('12')} />
    </fieldset>
  )
}
```

`useRadioGroup` takes `name`, `value`, `defaultValue`, `onValueChange`, `invalid` and `disabled`, and returns `name` (the one given, else a generated one) and `getRadioProps(value)`, which gives `name`, `checked` or `defaultChecked`, `onChange` and the `data-*` attributes. Pair it with `useFieldset({ group: true })` for the legend, help text and error. It holds no form state, only the UI state that decides which reveal is open (the radio the user chose, from `defaultValue`).

For your own reveal markup: spread `getRevealProps(value)` (`id`, `hidden`, `data-state`) on the element after the radio's field, call `registerReveal(value)` from an effect while it is mounted (the radio then gets `aria-controls`; it returns the cleanup), announce with `useAnnouncer().announce` when `consumeUserChoice(value)` is `true` as the reveal opens (it is `true` once, only when the user checked the radio), and call `resetSelection()` on the form's `reset` event. `RadioGroup.Reveal` does exactly this.

`useRadio({ value, name, disabled, checked, defaultChecked })` returns `inputProps`, `isChecked`, `isInvalid` and `isDisabled`, for your own `<input type="radio">` wired to the nearest Field and RadioGroup. Spread `inputProps` on it.
