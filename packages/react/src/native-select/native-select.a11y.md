# Accessibility contract: NativeSelect

- **APG pattern:** none. NativeSelect is the browser's own `<select>`, not an APG pattern: the role (`combobox`, or `listbox` with a `size`), the keys and the list come from the browser and the platform. The custom Select, Combobox and Autocomplete (ADR-0037) follow APG Select-Only Combobox and Combobox and are a separate plan.
- **Deviations:** none. Decisions: ADR-0037 (item 2: NativeSelect is the first recommendation for short lists and touch-heavy services), ADR-0029 (Field wiring, no form state) and ADR-0039 (keyboard).
- **Native elements used:** `<select>` with `<option>` and `<optgroup>` children, named by a `<label for>` (Field.Label).
- **Status:** alpha candidate (Plan 0013, Phase 2b). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `native-select.test.tsx` next to this file. `native-select.stories.tsx` and `native-select.e2e.ts` in `apps/storybook/src/components/native-select/`.

A NativeSelect is a single choice from a short list (about 5 to 20 options): a municipality, a language, a number of years. On phones the browser shows its own picker, which is better than anything custom. It renders only the `<select>`, wired to its Field. It holds no form state: pass `value` and `onValueChange` from your form logic, or `defaultValue` and `name` for a plain form (ADR-0029, item 0). For choices that must be typed, filtered or virtualized, use Combobox when it ships (ADR-0037); never `<select multiple>`: use a CheckboxGroup.

## Roles, states, properties

| Part              | Element / role                               | ARIA / state                                                                                                                                                                                                   | Notes                                                                                                                                                                                                                                                                                                 |
| ----------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NativeSelect      | `<select>` → `combobox` (single, no `size`)  | `id` and `aria-describedby` (description, then error), `aria-invalid="true"`, `aria-required="true"` from the Field. Native `disabled`. `data-invalid`, `data-required`, `data-disabled`, `data-focus-visible` | Class `kv-native-select`. Props: `value`, `defaultValue`, `onValueChange(value, { reason: 'input', event })`, `disabled`, `render`, and every native select prop (`name`, `autoComplete`, `onChange`, `ref`). `multiple` and `size` are not accepted. Children are plain `<option>` and `<optgroup>`. |
| Field.Label       | `<label for>`, the select's name             | The whole label is the click target (native)                                                                                                                                                                   | "(valfritt)" unless the Field is `required` or `marker="none"`                                                                                                                                                                                                                                        |
| `useNativeSelect` | the same attributes, for your own `<select>` | `selectProps`, `isInvalid`, `isRequired`, `isDisabled`, `isFocusVisible`                                                                                                                                       | Options: `disabled`, `onValueChange`. Reads the nearest Field                                                                                                                                                                                                                                         |

Rules, tested in `native-select.test.tsx`:

- **A native `<select>`** with its class and the browser's role (`native-select.test.tsx › renders a native <select> with its class, outside a Field`).
- **Named by its label, described by its hint and error** (`native-select.test.tsx › the Field’s label is the name, and the description and error describe it`). A dev warning fires when a select in a Field has no Field.Label, or has no name at all (1.3.1, 4.1.2).
- **No placeholder option as the only label.** The label is always visible. A first option such as "Välj kommun" is allowed as an instruction, but it must be a real `<option value="">` and the form must validate it (the select has no placeholder prop; a `disabled hidden` first option makes the field unreadable for some users, so don't).
- **No form state.** `defaultValue` goes to the native `<select>` and a form submit sends the choice; `value` with `onValueChange` is controlled. The select never copies the value into state (`native-select.test.tsx › works in a plain form`, `native-select.test.tsx › a controlled select shows the value it is given`).
- **Invalid, required, disabled** come from the Field: `aria-invalid="true"`, `aria-required="true"` (not native `required`, ADR-0029) and native `disabled` (`native-select.test.tsx › invalid, required and disabled come from the Field`).
- **`render`** changes the element and must stay a `<select>` (`native-select.test.tsx › render as a function gets the part’s props and the state`). Refs merge, `className` joins the part class.
- **`multiple` and `size`** aren't in the props type. A JavaScript caller who passes them gets a dev warning (ADR-0037, item 2).

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** no
- **Shortcuts:** none

The select is one Tab stop. Its keys are the browser's and the platform's: the rows below are what Chromium does on Windows and Linux, which the e2e runs. On macOS and in Safari the arrow keys, Space and Enter open the list instead of changing the value; Firefox's behaviour follows its platform too. Nothing is intercepted.

| Key           | Context              | Action                                                                                                             | Test                                                                            |
| ------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Tab           | before the select    | Moves focus to the select                                                                                          | `native-select.e2e.ts › Tab moves to the select, one stop`                      |
| Shift+Tab     | on the select        | Moves focus to the previous focusable element                                                                      | `native-select.e2e.ts › Shift+Tab leaves the select backwards`                  |
| Tab           | disabled select      | Skips it (native `disabled`)                                                                                       | `native-select.e2e.ts › Tab skips a disabled select`                            |
| ArrowDown     | on the closed select | Chooses the next option and reports `onValueChange` (no wrap). Where the platform opens the list instead, it opens | `native-select.e2e.ts › ArrowDown chooses the next option`                      |
| ArrowUp       | on the closed select | Chooses the previous option (no wrap)                                                                              | `native-select.e2e.ts › ArrowUp chooses the previous option`                    |
| Home / End    | on the closed select | Chooses the first and the last option                                                                              | `native-select.e2e.ts › Home and End choose the first and the last option`      |
| any character | on the closed select | Typeahead: chooses the next option that starts with the typed text                                                 | `native-select.e2e.ts › typing a letter chooses the option that starts with it` |
| Alt+ArrowDown | on the closed select | Opens the list without changing the value                                                                          | `native-select.e2e.ts › Alt+ArrowDown opens the list and Escape closes it`      |
| Escape        | on the open list     | Closes the list and keeps the value                                                                                | `native-select.e2e.ts › Alt+ArrowDown opens the list and Escape closes it`      |

Space and Enter open the list on most platforms, and Enter in the open list chooses the highlighted option and closes it (native). Clicking the label focuses the select (`native-select.e2e.ts › clicking the label focuses the select`).

## Focus management

- Initial focus: not moved.
- Trap: no. The open list is the browser's popup, closed by Escape, a choice or a click away; focus stays on the select.
- Restore to: the select (it never lost focus).
- Never obscured by: the focus ring is drawn around the box, outside it, and nothing around clips it (2.4.11, 2.4.13).

## Announcements

None from us. The browser and the screen reader announce the chosen option and the list. Nothing is live (ADR-0029). On focus a screen reader reads the label, "combobox" or "pop-up button", the chosen option, "required" when `aria-required` is set, and the description ("Fel: …" when invalid).

## Consumer responsibilities

- A `Field.Label` with a visible question, always. A placeholder-style first option isn't a label.
- Keep the list short, in a meaningful order (alphabetical, or most common first), and use `<optgroup label>` for groups.
- Put the choice that means "no answer" in the list as a real option, if "no answer" is valid.
- Pass `value` and `onValueChange`, or `defaultValue` and `name` for a plain `<form>`; validate and set `invalid` yourself, with an ErrorMessage that says what to do ("Välj en kommun").
- Don't change the page, submit or move focus when the value changes (3.2.2): use a button.
- Long option text wraps in the open list on mobile but is cut in the closed box on desktop: keep labels short.

## Visual / modes

- Focus indicator: a 2px `focus-ring` outline, 2px offset, around the box.
- Target size: 44px high (32px in `kv-compact`), full width or a width class (2.5.8).
- Colour: the Input's look: 1px `border-control` edge, `canvas` fill, 2px `danger` edge when invalid, dashed edge on `surface` when disabled. The chevron is drawn in `text` (`text-muted` when disabled) and is not the only cue of a select: the edge and the chosen value are.
- forced-colors behaviour: the theme gives the select back to the browser's native appearance, so the chevron is drawn in a system colour. The edge is `ButtonBorder`, invalid `CanvasText` at 2px, disabled dashed `GrayText` (`native-select.e2e.ts › forced colours: the select keeps its edge, its invalid width and a native chevron`).
- reduced-motion behaviour: the edge and fill transition only under `no-preference` (`native-select.e2e.ts › reduced motion: the select does not transition`).
- Reflow: the select is as wide as its column and no wider; a long Finnish label wraps (`native-select.e2e.ts › no horizontal scrolling at 320px with the long Finnish label (1.4.10)`).
- RTL: the chevron is at the left and the text starts at the right (`native-select.e2e.ts › right to left: the chevron is at the inline end, on the left`).

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: native select, label `for`, description and error.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: edge and invalid width.
- 2.1.1 Keyboard, 2.4.3 Focus Order, 3.2.2 On Input: native keys, no context change.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance.
- 2.5.3 Label in Name, 2.5.8 Target Size (Minimum).
- 3.3.1, 3.3.2, 3.3.3: the Field's label, hint and error. 1.3.5: `autoComplete` for country, language and similar.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta, ADR-0004)**   |         |        |        |       |
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

Research questions for the AT run: is the description read before or after the chosen option in each screen reader? Does a Voice Control user open the list and choose an option by name?

## Known issues

- **The open list is the browser's.** Its colours, size and font follow the OS and can't be styled to the theme's contrast tokens. In `forced-colors` and in the high-contrast themes it follows the user's colours.
- **The chevron is two CSS gradients on the select.** A `<select>` takes no pseudo-element, and a wrapper would change the markup. In forced colours the theme returns to the native appearance, which draws its own arrow.
- **Keys differ by platform.** The Keyboard rows describe Chromium on Windows and Linux (tested); macOS and Safari open the list for the arrow keys. The AT run covers macOS.
- **WebKit not run locally.** CI runs the `webkit` and `mobile-safari` projects.
- **`se` (Northern Sámi) is a placeholder in the fixtures.** See `field.a11y.md`.
