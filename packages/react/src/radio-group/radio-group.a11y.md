# Accessibility contract: RadioGroup (RadioGroup.Root, .Radio, .Legend, .Prose, .Hint, .ErrorMessage)

- **APG pattern:** [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/). Native: `<input type="radio">` elements that share a `name` already give the pattern's keys (one Tab stop, arrows move and check, Space checks) and its roles, so no ARIA and no key handler are added. The group is a `<fieldset>` with a `<legend>` instead of `role="radiogroup"`.
- **Deviations:** none from APG. Decisions (forms skill): Fieldset wiring, option labels carry no optional marker, **no `aria-invalid` on radios**, no form state.
- **Native elements used:** `<fieldset>` and `<legend>` (`RadioGroup.Root` and `RadioGroup.Legend`), `<input type="radio">` (`RadioGroup.Radio`), `<label for>` (`Field.Label`).
- **Status:** alpha candidate (Plan 0013, Phase 2). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `radio-group.test.tsx` next to this file. `radio-group.stories.tsx` and `radio-group.e2e.ts` in `apps/storybook/src/components/radio-group/`. The fieldset parts (`RadioGroup.Legend`, `RadioGroup.ErrorMessage`, `RadioGroup.Prose` as the description and `RadioGroup.Hint` as the hint): `fieldset.a11y.md`. They are the Fieldset's parts under the group's name.

A RadioGroup is one question with exactly one answer ("Hur länge behöver du tillståndet?": 1, 6 or 12 månader). `RadioGroup.Root` renders the `<fieldset>` and acts as a `Fieldset.Root` with `group` set; `RadioGroup.Radio` is a native radio. It holds no form state: the selected value is the `value` prop, and each change is reported up.

## Roles, states, properties

| Part              | Element / role                                       | ARIA / state                                                                                                                                                                                                                                                                                                                                                                              | Notes                                                                                                                                                                                                                                                                          |
| ----------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RadioGroup.Root   | `<fieldset>` → `group`                               | As Fieldset: `aria-describedby` = descriptions, then the error. Native `disabled`. `data-invalid`, `data-required`, `data-disabled`. No `aria-invalid` and no `aria-required`                                                                                                                                                                                                             | Classes `kv-radio-group kv-fieldset`. Props: `name` (generated when missing), `value`, `defaultValue`, `onValueChange(value, { reason: 'input', event })`, `invalid`, `required`, `disabled`, `messages`, `render`, and every fieldset prop. `render` must stay a `<fieldset>` |
| RadioGroup.Legend | `<legend>`, the group's name                         | As in `fieldset.a11y.md`                                                                                                                                                                                                                                                                                                                                                                  | Ends with "(valfritt)" in a group that isn't `required`                                                                                                                                                                                                                        |
| Field + Radio     | `<div>` with an `<input type="radio">` and its label | The option's name is its label. No "(optional)" on an option. The option's own hint (a `Field.Hint` in its Field, outside the label) is in that radio's `aria-describedby`. Native `checked`, native grouping by `name`. `data-state` when controlled                                                                                                                                     | A Field inside a group defaults to `marker="none"`. The radio gets the group's `name`, `checked` from `value`, and `value` from its prop                                                                                                                                       |
| RadioGroup.Radio  | `<input type="radio">` → `radio`                     | `data-state="checked" \| "unchecked"` only when the radio is controlled (the group has a `value`, so the state is known from props; an uncontrolled radio has none: style `:checked`), `data-invalid` and `data-disabled` (styling only). No `data-focus-visible`: focus is the native `:focus-visible`. **Never `aria-invalid`**, not even when its Field is invalid. No `aria-required` | Class `kv-radio`. Props: `value` (required), `disabled`, `onCheckedChange` is not offered (use the group's `onValueChange`), `render`, and every native input prop. It must be a direct child of `Field.Root`, before the label                                                |
| `useRadioGroup`   | the logic, for your own fieldset                     | returns `name`, `getRadioProps(value)`                                                                                                                                                                                                                                                                                                                                                    | Options: `name`, `value`, `defaultValue`, `onValueChange`, `invalid`, `disabled`. Use it with `useFieldset({ group: true })` and your own markup                                                                                                                               |
| `useRadio`        | the same attributes, for your own elements           | `inputProps`, `isChecked`, `isInvalid`, `isDisabled`. No `isFocusVisible`                                                                                                                                                                                                                                                                                                                 | Spread `inputProps` on your `<input type="radio">`                                                                                                                                                                                                                             |

Rules, tested in `radio-group.test.tsx`:

- **The group is named by its legend and described by its hint and error** (`radio-group.test.tsx › the group is named by its legend and described by its hint and error`). The description is a `RadioGroup.Prose` above the options and the hint a `RadioGroup.Hint` under them (the `Fieldset.Hint` under the group's name): the description is the text content, so keep both short and plain, and a hint has no links. A Prose or Hint directly in the group describes the group, one inside an option's Field describes that radio, and a Prose that isn't a description goes outside the group. An option's hint is a `Field.Hint` in the option's Field, 14px, in column 2 directly under the label's box and outside the target (`radio-group.test.tsx › an option hint is a Field.Hint in that option’s Field, outside its label, and has no axe violations`). `RadioGroup.Hint` is listed after the description and before the error (`radio-group.test.tsx › RadioGroup.Hint is the group’s hint: after the description, before the error`).
- **One name, native grouping.** Every radio has the group's `name`, so the browser groups them. Without `name`, the group generates one (`useId`) (`radio-group.test.tsx › every radio gets the group’s name, generated when missing`).
- **Controlled by `value`.** The radio whose `value` equals the group's `value` is checked. `null` means "controlled, nothing selected". A change calls `onValueChange(value, { reason: 'input', event })` with the radio's value. The group never stores it (`radio-group.test.tsx › a controlled group checks the radio whose value it is given`).
- **Uncontrolled without `value`.** `defaultValue` sets `defaultChecked` on one radio; the browser keeps the state and a form submit sends it (`radio-group.test.tsx › uncontrolled: defaultValue and the form submit`).
- **No `aria-invalid` on radios** (ARIA 1.2 doesn't support it on `radio`). An invalid group sets `data-invalid` on the fieldset, its parts and every radio for the 2px `danger` edge; the error reaches users through the fieldset's `aria-describedby` (`radio-group.test.tsx › invalid styles every radio and sets no aria-invalid`).
- **`required`** removes "(valfritt)" from the legend and sets `data-required`. No `aria-required` (not supported on `group` or `radio`); see Known issues.
- **`disabled`** on the group is native `fieldset[disabled]`. A single disabled `Radio` is skipped by Tab and by the arrow keys (native) (`radio-group.test.tsx › a disabled radio is natively disabled`).
- **No key handler.** Roving focus, wrapping and checking on arrow keys are the browser's, and tested end to end in the Keyboard table below (for example `radio-group.e2e.ts › Tab leaves the group after one stop` and `radio-group.e2e.ts › ArrowDown and ArrowRight move to the next radio and check it, wrapping`). No page handler cancels a key.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** yes (native: an arrow key moves focus and checks the radio; instant and harmless, as the APG allows)
- **Arrows wrap:** yes (native: from the last radio back to the first, and the reverse)
- **Shortcuts:** none

The group is one Tab stop (a composite widget). The browser's own roving is used instead of `tabindex`: the checked radio, or the first (last, going backwards) when none is checked, is the stop. Home and End do nothing; they are not part of the APG radio group.

| Key                    | Context                        | Action                                                                                                                                                                        | Test                                                                                                                                                                                                   |
| ---------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tab                    | before the group, none checked | Moves focus to the first radio. The rest of the group is skipped                                                                                                              | `radio-group.e2e.ts › Tab enters the group at the first radio when none is checked`                                                                                                                    |
| Tab                    | before the group, one checked  | Moves focus to the checked radio                                                                                                                                              | `radio-group.e2e.ts › Tab enters the group at the checked radio`                                                                                                                                       |
| Tab                    | on a radio                     | Leaves the group, to the next focusable element. A controlled group stays one Tab stop after an arrow key                                                                     | `radio-group.e2e.ts › Tab leaves the group after one stop`, `radio-group.e2e.ts › a controlled group is still one Tab stop after an arrow key`                                                         |
| Shift+Tab              | after the group, none checked  | Moves focus to the last radio                                                                                                                                                 | `radio-group.e2e.ts › Shift+Tab enters the group at the last radio when none is checked`                                                                                                               |
| Shift+Tab              | on a radio                     | Leaves the group, to the previous focusable element                                                                                                                           | `radio-group.e2e.ts › Shift+Tab leaves the group after one stop`                                                                                                                                       |
| ArrowDown / ArrowRight | on a radio                     | Moves focus to the next radio and checks it. From the last it wraps to the first. Right is the next in left-to-right text, and Left in right-to-left (the browser mirrors it) | `radio-group.e2e.ts › ArrowDown and ArrowRight move to the next radio and check it, wrapping`, `radio-group.e2e.ts › right to left: ArrowLeft moves to the next radio and ArrowRight to the previous`  |
| ArrowUp / ArrowLeft    | on a radio                     | Moves focus to the previous radio and checks it. From the first it wraps to the last. Left is the previous in left-to-right text, and Right in right-to-left                  | `radio-group.e2e.ts › ArrowUp and ArrowLeft move to the previous radio and check it, wrapping`, `radio-group.e2e.ts › right to left: ArrowLeft moves to the next radio and ArrowRight to the previous` |
| ArrowDown / ArrowUp    | next radio is disabled         | Skips the disabled radio (native)                                                                                                                                             | `radio-group.e2e.ts › Arrow keys skip a disabled radio`                                                                                                                                                |
| Space                  | on an unchecked radio          | Checks the focused radio. On a checked radio it does nothing (native)                                                                                                         | `radio-group.e2e.ts › Space checks the focused radio`                                                                                                                                                  |

Arrow keys check the radio they move to, so the page must not do anything harmful or slow on `change` (3.2.2). A native radio's change event is instant. Clicking the label, or the padding around the circle, checks and focuses the radio (`radio-group.e2e.ts › clicking the label text selects the radio`).

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- On error: the group never moves focus. The error summary block (M4) will, and until then the consumer moves focus to the checked radio, or the first one, of the invalid group.
- Never obscured by: nothing around the circles clips the ring.

## Announcements

None. Nothing is live. On entering the group a screen reader reads the legend, "group", the hint and, when invalid, "Fel: …"; then the radio's label, "radio button", "1 of 3" (from the native grouping) and its state.

## Consumer responsibilities

- A `RadioGroup.Legend` that asks the question, first in the Root; a `Field.Root` with a direct-child `RadioGroup.Radio` and a `Field.Label` per option; a `value` on every Radio.
- Offer an answer for everyone. If "none" or "I don't know" is valid, it's an option; the group has no deselect.
- Preselecting an option is a decision with consequences (residents rarely change a default): do it only when one answer is overwhelmingly common and harmless.
- Pass `value` and `onValueChange` from your form state, or `defaultValue` and `name` for a plain `<form>`.
- Set `invalid` and render a `RadioGroup.ErrorMessage`. On submit, move focus to the checked radio or the first one of an invalid group (or to the error summary).
- Don't use a radio group for a long list: from about 7 options, a Listbox is shorter to scan.

## Visual / modes

- Focus indicator: a 2px `focus-ring` outline, 2px offset, around the circle.
- Target size: the circle is 24×24px (2.5.8). The whole row is the target: the label spans the row and is at least 44px high (32px in `kv-compact`).
- Colour: a 1px `border-control` edge. Checked is a `primary` edge and a 12px `primary` dot on `canvas`, so the shape (a dot in a ring) carries the state. Invalid is a 2px `danger` edge plus the error message. Disabled is a dashed edge on `surface`; a checked disabled radio keeps its dot in `text-muted`.
- forced-colors behaviour: the dot is drawn on a `background-color` with `border-radius`, and the colours are set explicitly: checked `Highlight` edge and dot on `Field`; invalid `CanvasText` at 2px; disabled `GrayText` (`radio-group.e2e.ts › forced colours keep the radio edge visible in every state (1.4.11)`).
- reduced-motion behaviour: edge and fill transition only under `no-preference`; the dot appears instantly.
- Reflow: no horizontal scrolling at 320px with the long Finnish legend and options (`radio-group.e2e.ts › no horizontal scrolling at 320px with the long Finnish legend and options (1.4.10)`).
- RTL: the circles are at the right of their labels; the arrow keys are mirrored by the browser (see Keyboard).

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: native radios grouped by `name`, in a fieldset with a legend.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: the dot's shape, the edge, the invalid width.
- 2.1.1 Keyboard, 2.4.3 Focus Order, 3.2.2 On Input: one Tab stop, arrows, Space, no context change.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance.
- 2.5.3 Label in Name, 2.5.8 Target Size (Minimum).
- 3.3.1, 3.3.2, 3.3.3: the legend asks, the hint helps, the error says what to do.

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

Research questions for the AT run: without `aria-invalid` on radios, is the group's error read on entering the group? Is a required group's missing "(valfritt)" enough, or do users need "required" announced? Are the arrow keys right in right-to-left in NVDA, JAWS and VoiceOver (the browser mirrors them)?

## Known issues

- **A required group isn't announced as required.** `aria-required` isn't supported on `group` or `radio`, and KvirnUI prefers `aria-required` over native `required`. The group's legend loses "(valfritt)" and gets `data-required`. If the AT run shows a gap: `role="radiogroup"` on the fieldset (allowed on `<fieldset>`, and it supports `aria-required` and `aria-invalid`), or native `required` on the radios. Open question in Plan 0013.
- **A radio has no focus state of its own.** `useRadio` returns no `isFocusVisible` and `RadioGroup.Radio` sets no `data-focus-visible`: a re-render while a radio has focus makes React write its `name` again, and Chromium then stops treating the group as one Tab stop. The theme styles focus with the native `:focus-visible` (the 2px `focus-ring`).
- **`aria-describedby` on a `<fieldset>` isn't announced consistently by TalkBack.** See `fieldset.a11y.md`.
- **Shift+Tab into an unchecked group.** Browsers differ on which radio gets focus: Chrome and Firefox focus the last, Safari the first. The e2e runs on Chromium; the optional engines run in CI.
- **`se` (Northern Sámi) is a placeholder in the fixtures.** See `field.a11y.md`.
