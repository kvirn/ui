# Accessibility contract: Checkbox

- **APG pattern:** [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/). Dual-state and tri-state ("mixed") are both covered, with the native element: `<input type="checkbox">` and its `indeterminate` property. No ARIA is added.
- **Deviations:** none from APG. Choices made: Field wiring, no form state, option labels have no optional marker.
- **Native elements used:** `<input type="checkbox">`, named by a `<label for>` (Field.Label).
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `checkbox.test.tsx` next to this file. `checkbox.stories.tsx` in `apps/storybook/src/components/checkbox/`. A Checkbox inside a group: `checkbox-group.a11y.md`.

A Checkbox is one yes-or-no answer: a declaration, a consent, a "select all" in a staff table. It is a native input, so the browser supplies the role, the Space key, the label click and form submission. Checkbox adds the Field's wiring, the part class, `indeterminate` and `data-state`. It holds no form state: pass `checked` and `onCheckedChange` from your form logic, or `defaultChecked` and `name` for a plain form.

## Roles, states, properties

| Part          | Element / role                             | ARIA / state                                                                                                                                                                                                                                                                                                                                                                                  | Notes                                                                                                                                                                                                                                                                                                        |
| ------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Checkbox      | `<input type="checkbox">` → `checkbox`     | Native `checked`. `indeterminate` is the DOM property, so assistive technology hears "mixed" (`aria-checked` is never written). `id` and `aria-describedby` (the option's help text, then the error) from the Field. `aria-invalid="true"` and `aria-required="true"` from the Field. Native `disabled`. `data-state`, `data-invalid`, `data-required`, `data-disabled`, `data-focus-visible` | Class `kv-checkbox`. Props: `checked`, `defaultChecked`, `onCheckedChange(checked, { reason: 'input', event })`, `indeterminate`, `value`, `disabled`, and every native input prop (`name`, `form`, `onChange`, `ref`). `type` is fixed. It must be a direct child of `Field.Root`, before the `Field.Label` |
| Field.Label   | `<label for>`, the checkbox's name         | The whole label is the click target (native)                                                                                                                                                                                                                                                                                                                                                  | In a standalone Field the label shows "(optional)" unless the Field is `required` or `marker="none"`. In a group it shows nothing (`checkbox-group.a11y.md`)                                                                                                                                                 |
| `useCheckbox` | the same attributes, for your own elements | `inputProps`, `isIndeterminate`, `isInvalid`, `isRequired`, `isDisabled`, `isFocusVisible`                                                                                                                                                                                                                                                                                                    | Spread `inputProps` on your `<input type="checkbox">`. It includes a `ref` that sets the DOM `indeterminate` property                                                                                                                                                                                        |

Rules, tested in `checkbox.test.tsx`:

- **A native checkbox.** `<input type="checkbox">`, class `kv-checkbox`, no ARIA role and no `aria-checked` (`checkbox.test.tsx › renders a native <input type="checkbox">, outside a Field`).
- **Named by its label.** In a Field the label's `for` matches the input's `id`; the accessible name is the label text, with "(optional)" in a standalone, non-required Field (`checkbox.test.tsx › the Field’s label is the name, and the description is the option’s help text`). The help text is a `Field.HelpText` in the option's Field, outside the label: its description is its text content, so keep it short and plain.
- **`indeterminate` is a DOM property** set after render (it can't be set in markup): the checkbox exposes "mixed" and `data-state="indeterminate"`. The first server-rendered paint is unchecked. A click or Space toggles the underlying `checked` state and calls `onCheckedChange` with it: with `checked={false}`, as in the docs example, that is `true`, so it checks the box. Whether it stays indeterminate is the `indeterminate` prop's decision, not the browser's (`checkbox.test.tsx › indeterminate is the DOM property and data-state`).
- **`data-state`** is `checked`, `unchecked` or `indeterminate`. It follows the props for a controlled checkbox, and the native state after each change for an uncontrolled one. The default theme styles `:checked` and `:indeterminate` first, so nothing depends on this attribute after a `form.reset()` (`checkbox.test.tsx › data-state follows the native state`).
- **No form state.** `defaultChecked` and `name` work in a plain form (`FormData` has the value); `checked` and `onCheckedChange` give a controlled checkbox. The checkbox never copies `checked` into state (`checkbox.test.tsx › works in a plain form: the browser keeps the state and FormData has it`, `checkbox.test.tsx › a controlled checkbox shows the checked it is given`).
- **`aria-invalid` on a standalone Checkbox** when its Field is `invalid`. A Checkbox in a group gets only `data-invalid` from the group (`checkbox-group.a11y.md`).
- **The error of a standalone checkbox** (a declaration) is the Field.ErrorMessage, under the row, in `aria-describedby` after the option's help text.
- **Disabled.** A Field's `disabled` or the prop gives native `disabled` and `data-disabled`. The label of a disabled choice is muted by the theme, never hidden.
- **Dev warnings (once):** a Checkbox in a Field with no Field.Label (no accessible name, 1.3.1/4.1.2); an `id` inside a Field (ignored: set `controlId` on the Field).

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Each checkbox is its own Tab stop, also inside a CheckboxGroup: checkboxes are independent, not a composite. Nothing is intercepted: Space, Enter and Tab keep their native behaviour.

| Key       | Context                 | Action                                                                                              | Test                                                                            |
| --------- | ----------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Tab       | before the checkbox     | Moves focus to the checkbox. Each checkbox is one Tab stop                                          | `checkbox.test.tsx › Tab moves to each checkbox, one stop each`                 |
| Shift+Tab | on a checkbox           | Moves focus to the previous focusable element                                                       | `checkbox.test.tsx › Shift+Tab moves to the previous checkbox`                  |
| Tab       | disabled checkbox       | Skips it (native `disabled` leaves the Tab sequence)                                                | `checkbox.test.tsx › Tab skips a disabled checkbox`                             |
| Space     | on a checkbox           | Toggles it, and reports `onCheckedChange` (native)                                                  | `checkbox.test.tsx › Space toggles the checkbox`                                |
| Space     | on an indeterminate box | Toggles the underlying state (native); with `checked={false}`, as in the docs example, it checks it | `checkbox.test.tsx › Space on an indeterminate checkbox checks it`              |
| Enter     | on a checkbox           | Doesn't toggle it. In a form the browser may submit it (native, never prevented)                    | `checkbox.test.tsx › Enter does not toggle the checkbox and is not intercepted` |

The arrow keys, Home and End do nothing on a checkbox (native). Clicking the label, or the padding around the box, toggles it and focuses it (`checkbox.test.tsx › clicking the label text toggles the checkbox and focuses it`).

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: the focus ring is drawn around the box, outside it, and nothing around clips it (2.4.11 Focus Not Obscured (Minimum) (AA); 2.4.13 Focus Appearance (AAA)). Consumers with a sticky header set `scroll-padding`.

## Announcements

None. Nothing is live. On focus a screen reader reads the label, "checkbox", the checked or "mixed" state, "required" when `aria-required` is set, and the description: the option's help text, then the error when the standalone checkbox is invalid, after the error prefix ("Error:" in English, "Fel:" in Swedish).

## Consumer responsibilities

- Put the Checkbox directly in `Field.Root`, before the `Field.Label`, so the box is at the inline start and the theme's choice layout applies.
- A visible label always. The label is the whole sentence for a declaration ("Jag intygar att uppgifterna är korrekta", Swedish for "I confirm that the information is correct"), written so it can be answered "yes".
- For a single consent or declaration, set `required` on the Field, so the label has no "(optional)" and the field is `aria-required`; or `marker="none"`.
- Own `indeterminate`: set it from your data (some, not all, children are checked) and pass `false` once the user has chosen. Don't use it for a checkbox that was never answered.
- Validate and set `invalid` yourself; render a Field.ErrorMessage that says what to do ("Bekräfta att uppgifterna är korrekta", Swedish for "Confirm that the information is correct").
- On a failed send, move focus to the ErrorSummary or to the first invalid field. The Checkbox's error is not live and is read only when the box gets focus (3.3.1 Error Identification (A), 4.1.3 Status Messages (AA)).
- Don't use a checkbox where a [Switch](/components/switch) or a button is meant (a setting that is saved at once is a Switch), and don't use one for "yes or no" questions that need both answers: use a [RadioGroup](/components/radio-group).

## Visual / modes

- Focus indicator: on keyboard focus, a ring at least 2px thick, set off from the box, with at least 3:1 contrast against the adjacent colours, drawn around the box (2.4.7 Focus Visible (AA); 2.4.13 Focus Appearance (AAA)).
- Target size: the box is 24 × 24 CSS px, the minimum of 2.5.8 Target Size (Minimum) (AA). The whole row is the target: the label spans the row and is 44px high in the default theme (32px in the compact density).
- Colour: the box's edge has at least 3:1 contrast against its background (1.4.11 Non-text Contrast (AA)). Checked and indeterminate boxes are filled, with a drawn tick or dash in a contrasting colour. Unchecked and checked differ in shape (a mark appears), not only in colour (1.4.1 Use of Color (A)). An invalid box has a thicker edge plus the error message, never colour alone. A disabled box has a dashed edge, and its label is muted, never hidden.
- forced-colors behaviour (Windows contrast themes): the tick and dash are drawn as shapes and take the system's colours. Checked and indeterminate boxes use the highlight colour for fill and edge, with a highlight-text mark. An invalid box has a thick edge in the text colour. A disabled box has a dashed edge in the disabled-text colour.
- reduced-motion behaviour: the edge and fill change with a transition only when motion is allowed. The mark appears instantly.
- RTL: the box is at the right, the check mark doesn't mirror.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A): native checkbox, label `for`, mixed state from the DOM property.
- 1.4.1 Use of Color (A), 1.4.11 Non-text Contrast (AA): the mark's shape, the edge and the invalid width.
- 1.4.3 Contrast (Minimum) (AA): the label, help and error text use the theme's text colours, whose pairs `theme:check` measures.
- 2.1.1 Keyboard (A), 2.4.3 Focus Order (A): native Tab and Space.
- 2.4.7 Focus Visible (AA), 2.4.11 Focus Not Obscured (Minimum) (AA), 2.4.13 Focus Appearance (AAA, not counted toward the AA bar).
- 2.5.3 Label in Name (A), 2.5.8 Target Size (Minimum) (AA): the visible label is the name; the box is 24 × 24 CSS px and the whole row is the target.
- 3.3.1 Error Identification (A), 3.3.2 Labels or Instructions (A), 3.3.3 Error Suggestion (AA): the Field's error and help text.

## AT test record

| AT + browser + OS                        | Agent check | Human check | Result  | Notes |
| ---------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**             |             |             |         |       |
| Windows Contrast Themes + Edge           | pending     | pending     | pending |       |
| Keyboard only / 400% zoom / 320px reflow | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS               | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android              | pending     | pending     | pending |       |
| NVDA + Chrome + Windows                  | pending     | pending     | pending |       |
| NVDA + Firefox + Windows                 | pending     | pending     | pending |       |
| Narrator + Edge + Windows                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)**  |             |             |         |       |
| JAWS + Chrome + Windows                  | pending     | pending     | pending |       |
| Dragon / Voice Control                   | pending     | pending     | pending |       |

Questions for the manual testing with assistive technology: is "mixed" announced on an indeterminate checkbox in each screen reader? Is the standalone checkbox's error read after the help text on focus? Does a Voice Control user check the box by saying its visible label?

## Known issues

- **`indeterminate` can't be server-rendered.** The DOM property is set in a layout effect, so the first paint of server markup is unchecked, and a mixed box looks unchecked until the script runs. The component test covers the client (the DOM property and `data-state`). No automated test checks the drawn mark: it is reviewed by eye, and checked in the manual testing (the Windows Contrast Themes row).
- **`data-state` after `form.reset()`.** For an uncontrolled checkbox it's updated on change events, not on a form reset. The theme styles `:checked` and `:indeterminate`, so the look is right; read the native state, not the attribute, in your own code.
- **The check and dash marks are not tested automatically.** They are drawn with `::before` and `clip-path` on the input. The browser tests that checked the marks were removed, so nothing automated shows that Firefox and WebKit (Safari's engine, not run locally) draw them, or that checked and indeterminate differ visibly from unchecked. The marks are reviewed by eye and checked in the manual testing (the Windows Contrast Themes row). A hidden indicator element is the fallback if a browser doesn't draw them.
