# Accessibility contract: CheckboxGroup (CheckboxGroup.Root, .Legend, .Prose, .Hint, .ErrorMessage)

- **APG pattern:** [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), in a labelled group. The APG's checkbox examples group related boxes with `role="group"` and a label; the native equivalent is `<fieldset>` and `<legend>`, which is what Root renders. There is no composite keyboard model: each checkbox is its own Tab stop.
- **Deviations:** none from APG. Decisions (forms skill): Fieldset wiring, option labels carry no optional marker, a group's `invalid` doesn't cascade, no form state.
- **Native elements used:** `<fieldset>` and `<legend>` (`CheckboxGroup.Root` and `CheckboxGroup.Legend`), `<input type="checkbox">` (Checkbox), `<label for>` (`Field.Label`).
- **Status:** alpha candidate (Plan 0013, Phase 2). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `checkbox-group.test.tsx` next to this file. `checkbox-group.stories.tsx` and `checkbox-group.e2e.ts` in `apps/storybook/src/components/checkbox-group/`. The box itself: `checkbox.a11y.md`. The fieldset parts (`CheckboxGroup.Legend`, `CheckboxGroup.ErrorMessage`, `CheckboxGroup.Prose` as the description and `CheckboxGroup.Hint` as the hint): `fieldset.a11y.md`. They are the Fieldset's parts under the group's name.

A CheckboxGroup is one question with several answers that can all be true ("Hur vill du bli kontaktad?": e-post, sms, brev). `CheckboxGroup.Root` renders the `<fieldset>` and acts as a `Fieldset.Root` with `group` set, so `CheckboxGroup.Legend`, a description (`CheckboxGroup.Prose`), a hint (`CheckboxGroup.Hint`) and `CheckboxGroup.ErrorMessage` work inside it. It holds no form state: the selected values are the `value` prop, and each change is reported up.

## Roles, states, properties

| Part                 | Element / role                                      | ARIA / state                                                                                                                                                                                             | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CheckboxGroup.Root   | `<fieldset>` → `group`                              | As Fieldset: `aria-describedby` = descriptions, then the error. Native `disabled`. `data-invalid`, `data-required`, `data-disabled`. No `aria-invalid` and no `aria-required` (not supported on `group`) | Classes `kv-checkbox-group kv-fieldset`. Props: `name`, `value`, `defaultValue`, `onValueChange(value, { reason: 'input', event })`, `invalid`, `required`, `disabled`, `messages`, `render`, and every fieldset prop. `render` must stay a `<fieldset>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CheckboxGroup.Legend | `<legend>`, the group's name                        | As in `fieldset.a11y.md`                                                                                                                                                                                 | Ends with "(valfritt)" in a group that isn't `required`: the marker belongs to the question                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Field + Checkbox     | `<div>` with an `<input type="checkbox">` and label | The option's name is its label. No "(optional)" on an option. The option's own hint (a `Field.Hint` in its Field, outside the label) is in that checkbox's `aria-describedby`                            | A Field inside a group defaults to `marker="none"`. The checkbox gets the group's `name` and `checked` from `value`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Checkbox in a group  | `<input type="checkbox">`                           | `data-invalid` and `data-disabled` from the group, for styling. **No `aria-invalid`**: the group's error reaches users through the fieldset's `aria-describedby`                                         | `value` is required on a Checkbox in a group; a dev warning fires when it's missing, or when `checked` or `defaultChecked` are given next to the group's (the group's wins). `indeterminate` and `onCheckedChange` still work on a Checkbox in a group. A "select all" box in the group is an option like the others: it needs a `value`, so its value is in the group's `value` while it is checked. A click calls the group's `onValueChange` first, with that value added or removed, then the box's own `onCheckedChange` (`checkbox-group.test.tsx › a "select all" Checkbox in a group: onValueChange first, with its value added, then its own onCheckedChange`). A box without a `value` warns and gets no name or state from the group (an uncontrolled group without a `name` still reads every checked box in the fieldset, so it reports such a box as `"on"`): put a select-all box outside the CheckboxGroup if its value shouldn't be in the group's |
| `useCheckboxGroup`   | the logic, for your own fieldset                    | returns `name`, `groupRef`, `getCheckboxProps(value)`                                                                                                                                                    | Options: `name`, `value`, `defaultValue`, `onValueChange`, `invalid`, `disabled`. Use it with `useFieldset({ group: true })` and your own markup. Attach `groupRef` to your `<fieldset>` so an uncontrolled group can report its next value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

Rules, tested in `checkbox-group.test.tsx`:

- **The group is named by its legend and described by its hint and error** (`checkbox-group.test.tsx › the group is named by its legend and described by its hint and error`). The legend is the first child.
- **Controlled by `value`.** With `value={['email']}`, the checkbox with `value="email"` is checked and the others aren't. A change calls `onValueChange` with the next array: the current `value` with the value added at the end, or removed (`checkbox-group.test.tsx › onValueChange reports the next array from the value prop`). The group never stores it; if the parent doesn't update `value`, the box stays as it was.
- **Uncontrolled without `value`.** `defaultValue` sets the initial boxes (`defaultChecked`), the browser keeps the state, and a form submit sends every checked box under the group's `name` (`FormData.getAll`). `onValueChange` still fires, with the checked values read from the group's own `<fieldset>` at that moment (`checkbox-group.test.tsx › uncontrolled: defaultValue, the form submit and onValueChange`).
- **`name`** goes on every checkbox in the group. A `name` on a Checkbox wins.
- **`invalid` marks the group's own parts** (legend, hint, error: `data-invalid`) and every option input (`data-invalid`, styling only). It doesn't cascade to the Fields' `invalid`, and no checkbox gets `aria-invalid` from it (`checkbox-group.test.tsx › invalid styles every option and sets no aria-invalid`).
- **`required`** removes "(valfritt)" from the legend and sets `data-required`. A group has no `aria-required`; see Known issues.
- **`disabled`** is native `fieldset[disabled]`: every checkbox inside is disabled and leaves the Tab sequence (`checkbox-group.test.tsx › disabled disables every checkbox natively`).
- **No arrow-key model.** The root attaches no key handler (`checkbox-group.e2e.ts › Arrow keys do not move focus between checkboxes`). Each checkbox is its own Tab stop, in DOM order (`checkbox-group.e2e.ts › Tab moves through every checkbox in DOM order`).

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Checkboxes are independent, so each is its own Tab stop; the group is not a composite widget and arrow keys do nothing. The keys of one box are in `checkbox.a11y.md`.

| Key                                          | Context          | Action                                                                                    | Test                                                                                    |
| -------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Tab                                          | before the group | Moves focus to the first checkbox. Each checkbox in the group is a Tab stop, in DOM order | `checkbox-group.e2e.ts › Tab moves through every checkbox in DOM order`                 |
| Shift+Tab                                    | on a checkbox    | Moves focus to the previous checkbox, then out of the group                               | `checkbox-group.e2e.ts › Shift+Tab moves back through the checkboxes`                   |
| Space                                        | on a checkbox    | Toggles that checkbox only, and reports the next `value` (native)                         | `checkbox-group.e2e.ts › Space toggles the focused checkbox and reports the next value` |
| ArrowDown / ArrowUp / ArrowLeft / ArrowRight | on a checkbox    | Nothing: focus and the checked boxes stay (native, not a composite)                       | `checkbox-group.e2e.ts › Arrow keys do not move focus between checkboxes`               |
| Tab                                          | disabled group   | Skips every checkbox of a disabled group (native `fieldset[disabled]`)                    | `checkbox-group.e2e.ts › Tab skips the checkboxes of a disabled group (native)`         |

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- On error: the group never moves focus. The error summary block (M4) will, and until then the consumer moves focus to the first checkbox of the group.
- Never obscured by: nothing around the boxes clips the ring.

## Announcements

None. Nothing is live. Entering the group, a screen reader reads the legend, "group", the hint and, when invalid, "Fel: …". Each checkbox is then read as in `checkbox.a11y.md`.

## Consumer responsibilities

- A `CheckboxGroup.Legend` that asks the question, first in the Root. Say how many answers are allowed in a `CheckboxGroup.Prose` above the options ("Välj alla som passar"): it is read before answering, so it is a description. Use a `CheckboxGroup.Hint` under the options only for what helps while answering ("Du kan ändra dig senare under Mina sidor"). Both are text: the accessible description is the text content, so keep them short and plain, with no link in a hint. A Prose or Hint directly in the group, not inside an option's Field, describes the group; a Prose that isn't a description goes outside the group. An option's hint is a `Field.Hint` in the option's Field: 14px, in column 2 directly under the label's box and outside the target (`checkbox-group.test.tsx › an option hint is a Field.Hint in that option’s Field, outside its label, and has no axe violations`). `CheckboxGroup.Hint` is listed after the description and before the error (`checkbox-group.test.tsx › CheckboxGroup.Hint is the group’s hint: after the description, before the error`).
- A `Field.Root` with a direct-child `Checkbox` and a `Field.Label` for each option; `value` on every Checkbox.
- Keep the list short. About 15 options is the limit before a search or a different pattern is better. Never `<select multiple>`.
- Pass `value` and `onValueChange` from your form state, or `defaultValue` and `name` for a plain `<form>`.
- Set `invalid` and render a `CheckboxGroup.ErrorMessage`, then move focus to the first checkbox of the group on submit (or to the error summary).
- "None of the above" is an option the consumer adds and handles; the group has no exclusive option.

## Visual / modes

- As Fieldset (`fieldset.a11y.md`) and Checkbox (`checkbox.a11y.md`). The options are one `--kv-field-gap` apart (8px, 4px in `kv-compact`), the legend is 16px above the description.
- forced-colors behaviour: as Checkbox. The group has no border of its own.
- Reflow: a long Finnish legend and option labels wrap. No horizontal scrolling at 320px (`checkbox-group.e2e.ts › no horizontal scrolling at 320px with the long Finnish legend and options (1.4.10)`).
- RTL: the boxes are at the inline start, the right.

## WCAG SCs covered

- 1.3.1 Info and Relationships: native fieldset and legend, the group's hint and error in its description.
- 3.3.1, 3.3.2, 3.3.3: the legend asks the question, the hint says how many, the error says what to do.
- 2.1.1 Keyboard, 2.4.3 Focus Order, 3.2.2 On Input: native keys, nothing moves focus when a box is checked.
- All the Checkbox SCs, for each option.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

Research questions for the AT run: is the group's hint and error read when the user enters the group in each screen reader (TalkBack is known to be inconsistent)? Without `aria-invalid` on the boxes, do users still understand which group is wrong?

## Known issues

- **A required group isn't announced as required.** `aria-required` isn't supported on `group` (ARIA 1.2), and KvirnUI chooses `aria-required` over native `required`, so a required group has no "(valfritt)" in its legend and `data-required`, and nothing else. If the AT run shows a gap, the options are `role="radiogroup"` on the fieldset for RadioGroup (allowed on `<fieldset>`), or native `required` on one checkbox. Open question in Plan 0013.
- **`aria-describedby` on a `<fieldset>` isn't announced consistently by TalkBack.** See `fieldset.a11y.md`.
- **Uncontrolled `onValueChange` reads the DOM.** It reads the checked boxes of the group's `<fieldset>` when a box changes. A custom `render` that isn't a `<fieldset>` breaks that (and warns).
