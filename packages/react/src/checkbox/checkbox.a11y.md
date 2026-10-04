# Accessibility contract: Checkbox

- **APG pattern:** [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/). Dual-state and tri-state ("mixed") are both covered, with the native element: `<input type="checkbox">` and its `indeterminate` property. No ARIA is added.
- **Deviations:** none from APG. Decisions (forms skill): Field wiring, no form state, option labels have no optional marker.
- **Native elements used:** `<input type="checkbox">`, named by a `<label for>` (Field.Label).
- **Status:** alpha candidate (Plan 0013, Phase 2). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `checkbox.test.tsx` next to this file. `checkbox.stories.tsx` and `checkbox.e2e.ts` in `apps/storybook/src/components/checkbox/`. A Checkbox inside a group: `checkbox-group.a11y.md`.

A Checkbox is one yes-or-no answer: a declaration, a consent, a "select all" in a staff table. It is a native input, so the browser supplies the role, the Space key, the label click and form submission. Checkbox adds the Field's wiring, the part class, `indeterminate` and `data-state`. It holds no form state: pass `checked` and `onCheckedChange` from your form logic, or `defaultChecked` and `name` for a plain form.

## Roles, states, properties

| Part          | Element / role                             | ARIA / state                                                                                                                                                                                                                                                                                                                                                                                  | Notes                                                                                                                                                                                                                                                                                                                  |
| ------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkbox      | `<input type="checkbox">` → `checkbox`     | Native `checked`. `indeterminate` is the DOM property, so assistive technology hears "mixed" (`aria-checked` is never written). `id` and `aria-describedby` (the option's help text, then the error) from the Field. `aria-invalid="true"` and `aria-required="true"` from the Field. Native `disabled`. `data-state`, `data-invalid`, `data-required`, `data-disabled`, `data-focus-visible` | Class `kv-checkbox`. Props: `checked`, `defaultChecked`, `onCheckedChange(checked, { reason: 'input', event })`, `indeterminate`, `value`, `disabled`, `render`, and every native input prop (`name`, `form`, `onChange`, `ref`). `type` is fixed. It must be a direct child of `Field.Root`, before the `Field.Label` |
| Field.Label   | `<label for>`, the checkbox's name         | The whole label is the click target (native)                                                                                                                                                                                                                                                                                                                                                  | In a standalone Field the label shows "(optional)" unless the Field is `required` or `marker="none"`. In a group it shows nothing (`checkbox-group.a11y.md`)                                                                                                                                                           |
| `useCheckbox` | the same attributes, for your own elements | `inputProps`, `isChecked`, `isIndeterminate`, `isInvalid`, `isRequired`, `isDisabled`, `isFocusVisible`                                                                                                                                                                                                                                                                                       | Spread `inputProps` on your `<input type="checkbox">`. It includes a `ref` that sets the DOM `indeterminate` property                                                                                                                                                                                                  |

Rules, tested in `checkbox.test.tsx`:

- **A native checkbox.** `<input type="checkbox">`, class `kv-checkbox`, no ARIA role and no `aria-checked` (`checkbox.test.tsx › renders a native <input type="checkbox">, outside a Field`).
- **Named by its label.** In a Field the label's `for` matches the input's `id`; the accessible name is the label text, with "(optional)" in a standalone, non-required Field (`checkbox.test.tsx › the Field’s label is the name, and the description is the option’s help text`). The help text is a `Field.HelpText` in the option's Field, outside the label: its description is its text content, so keep it short and plain.
- **`indeterminate` is a DOM property** set after render (it can't be set in markup): the checkbox exposes "mixed" and `data-state="indeterminate"`. The first server-rendered paint is unchecked. A click or Space toggles the underlying `checked` state and calls `onCheckedChange` with it: with `checked={false}`, as in the docs example, that is `true`, so it checks the box. Whether it stays indeterminate is the `indeterminate` prop's decision, not the browser's (`checkbox.test.tsx › indeterminate is the DOM property and data-state`).
- **`data-state`** is `checked`, `unchecked` or `indeterminate`. It follows the props for a controlled checkbox, and the native state after each change for an uncontrolled one. The default theme styles `:checked` and `:indeterminate` first, so nothing depends on this attribute after a `form.reset()` (`checkbox.test.tsx › data-state follows the native state`).
- **No form state.** `defaultChecked` and `name` work in a plain form (`FormData` has the value); `checked` and `onCheckedChange` give a controlled checkbox. The checkbox never copies `checked` into state (`checkbox.test.tsx › works in a plain form: the browser keeps the state and FormData has it`, `checkbox.test.tsx › a controlled checkbox shows the checked it is given`).
- **`aria-invalid` on a standalone Checkbox** when its Field is `invalid`. A Checkbox in a group gets only `data-invalid` from the group (`checkbox-group.a11y.md`).
- **The error of a standalone checkbox** (a declaration) is the Field.ErrorMessage, under the row, in `aria-describedby` after the option's help text.
- **Disabled.** A Field's `disabled` or the prop gives native `disabled` and `data-disabled`. The label of a disabled choice is muted by the theme, never hidden.
- **`render`** changes the element and must stay an `<input type="checkbox">`. Refs merge, `className` joins the part class.
- **Dev warnings (once):** a Checkbox in a Field with no Field.Label (no accessible name, 1.3.1/4.1.2); an `id` inside a Field (ignored: set `controlId` on the Field).

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Each checkbox is its own Tab stop, also inside a CheckboxGroup: checkboxes are independent, not a composite. Nothing is intercepted: Space, Enter and Tab keep their native behaviour.

| Key       | Context                 | Action                                                                                              | Test                                                                          |
| --------- | ----------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Tab       | before the checkbox     | Moves focus to the checkbox. Each checkbox is one Tab stop                                          | `checkbox.e2e.ts › Tab moves to each checkbox, one stop each`                 |
| Shift+Tab | on a checkbox           | Moves focus to the previous focusable element                                                       | `checkbox.e2e.ts › Shift+Tab moves to the previous checkbox`                  |
| Tab       | disabled checkbox       | Skips it (native `disabled` leaves the Tab sequence)                                                | `checkbox.e2e.ts › Tab skips a disabled checkbox`                             |
| Space     | on a checkbox           | Toggles it, and reports `onCheckedChange` (native)                                                  | `checkbox.e2e.ts › Space toggles the checkbox`                                |
| Space     | on an indeterminate box | Toggles the underlying state (native); with `checked={false}`, as in the docs example, it checks it | `checkbox.e2e.ts › Space on an indeterminate checkbox checks it`              |
| Enter     | on a checkbox           | Doesn't toggle it. In a form the browser may submit it (native, never prevented)                    | `checkbox.e2e.ts › Enter does not toggle the checkbox and is not intercepted` |

The arrow keys, Home and End do nothing on a checkbox (native). Clicking the label, or the padding around the box, toggles it and focuses it (`checkbox.e2e.ts › clicking the label text and the padding beside the box toggles it`).

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: the focus ring is drawn around the 24px box, outside it, and nothing around clips it (2.4.11, 2.4.13). Consumers with a sticky header set `scroll-padding`.

## Announcements

None. Nothing is live. On focus a screen reader reads the label, "checkbox", the checked or "mixed" state, "required" when `aria-required` is set, and the description (the option's help text, then "Fel: …" when the standalone checkbox is invalid).

## Consumer responsibilities

- Put the Checkbox directly in `Field.Root`, before the `Field.Label`, so the box is at the inline start and the theme's choice layout applies.
- A visible label always. The label is the whole sentence for a declaration ("Jag intygar att uppgifterna är korrekta"), written so it can be answered "yes".
- For a single consent or declaration, set `required` on the Field, so the label has no "(optional)" and the field is `aria-required`; or `marker="none"`.
- Own `indeterminate`: set it from your data (some, not all, children are checked) and pass `false` once the user has chosen. Don't use it for a checkbox that was never answered.
- Validate and set `invalid` yourself; render a Field.ErrorMessage that says what to do ("Bekräfta att uppgifterna är korrekta").
- Don't use a checkbox where a switch or a button is meant, and don't use one for "yes or no" questions that need both answers: use a RadioGroup.

## Visual / modes

- Focus indicator: a 2px `focus-ring` outline, 2px offset, around the box (`sm` radius plus offset).
- Target size: the box is 24×24px (2.5.8). The whole row is the target: the label spans the row and is at least 44px high (32px in `kv-compact`).
- Colour: the 1px `border-control` edge (3:1); checked and indeterminate are filled `primary` with a drawn `on-primary` mark. Unchecked and checked differ in shape (a mark appears), not only in colour (1.4.1). Invalid is a 2px `danger` edge plus the error message (never colour alone). Disabled is a dashed edge on the `surface` colour.
- forced-colors behaviour: the marks are drawn with `clip-path` on a `background-color`, and the colours are set explicitly: checked and indeterminate `Highlight` fill and edge with a `HighlightText` mark; invalid `CanvasText` at 2px; disabled dashed `GrayText` (`checkbox.e2e.ts › forced colours keep the box edge visible in every state (1.4.11)`).
- reduced-motion behaviour: the edge and fill transition only under `no-preference`. The mark appears instantly.
- Reflow: a label of three lines keeps the box beside its first line; no horizontal scrolling at 320px with the Finnish label (`checkbox.e2e.ts › no horizontal scrolling at 320px with the long Finnish label (1.4.10)`).
- RTL: the box is at the right, the check mark doesn't mirror.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: native checkbox, label `for`, mixed state from the DOM property.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: the mark's shape, the edge and the invalid width.
- 2.1.1 Keyboard, 2.4.3 Focus Order: native Tab and Space.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance.
- 2.5.3 Label in Name, 2.5.8 Target Size (Minimum): the visible label is the name; the row is at least 32px.
- 3.3.1 Error Identification, 3.3.2 Labels or Instructions, 3.3.3 Error Suggestion: the Field's error and help text.

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

Research questions for the AT run: is "mixed" announced on an indeterminate checkbox in each screen reader? Is the standalone checkbox's error read after the help text on focus? Does a Voice Control user check the box by saying its visible label?

## Known issues

- **`indeterminate` can't be server-rendered.** The DOM property is set in a layout effect, so the first paint of server markup is unchecked. The component test covers the client (the DOM property and `data-state`). No automated test checks the drawn mark: it is reviewed by eye, and checked in the manual AT matrix (the Windows Contrast Themes row).
- **`data-state` after `form.reset()`.** For an uncontrolled checkbox it's updated on change events, not on a form reset. The theme styles `:checked` and `:indeterminate`, so the look is right; read the native state, not the attribute, in your own code.
- **The check and dash marks are not tested automatically.** They are drawn with `::before` and `clip-path` on the input. The e2e tests that checked the marks were removed in commit 383f811, so nothing automated shows that Firefox and WebKit (WebKit is not run locally) draw them, or that checked and indeterminate differ visibly from unchecked. The marks are reviewed by eye and checked in the manual AT matrix (the Windows Contrast Themes row). A hidden indicator element is the fallback if a browser doesn't draw them (Plan 0013, open question 11).
