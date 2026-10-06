# Accessibility contract: Switch

- **APG pattern:** [Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/). The native form: a checkbox with `role="switch"`. The state is the native `checked`; `aria-checked` is never written.
- **Deviations:** none from APG. Decisions (Plan 0069): Enter does not toggle (APG makes it optional); no `required` (a consent is a Checkbox); no strings of its own.
- **Native elements used:** `<input type="checkbox" role="switch">`, named by a `<label for>` (Field.Label).
- **Status:** alpha candidate (Plan 0069). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `switch.test.tsx` next to this file. `switch.stories.tsx` in `apps/storybook/src/components/switch/`.

A Switch is mainly a setting that takes effect at once, with no Save or Send button ("Få meddelanden som sms"). Submitting it in a plain form also works natively, but in a public-sector e-service form prefer a Checkbox (declaration, consent) or a RadioGroup (yes or no). It is a native input, so the browser supplies the Space key, the label click, form submission, `form.reset()` and `disabled`. Switch adds the `switch` role, the Field's wiring, the part class and `data-state`. It holds no form state: pass `checked` and `onCheckedChange` from your logic, or `defaultChecked` and `name` for a plain form.

## Roles, states, properties

| Part        | Element / role                             | ARIA / state                                                                                                                                                                                                                             | Notes                                                                                                                                                                                                                                                                                            |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Switch      | `<input type="checkbox" role="switch">`    | Native `checked`; `aria-checked` is never written. `id`, `aria-describedby` (help text, then the error) and `aria-invalid="true"` from the Field. Native `disabled`. `data-state`, `data-invalid`, `data-disabled`, `data-focus-visible` | Class `kv-switch`. Props: `checked`, `defaultChecked`, `onCheckedChange(checked, { reason: 'input', event })`, `value`, `name`, `disabled`, `render`, native input props except `type`, `role`, `required`, `indeterminate`. It must be a direct child of `Field.Root`, before the `Field.Label` |
| Field.Label | `<label for>`, the switch's name           | The whole label is the click target (native). The name never changes with the state                                                                                                                                                      | A standalone Field shows "(optional)": use `<Field.Label marker="none">`                                                                                                                                                                                                                         |
| `useSwitch` | the same attributes, for your own elements | `inputProps`, `isInvalid`, `isDisabled`, `isFocusVisible`                                                                                                                                                                                | Spread `inputProps` on your `<input>`                                                                                                                                                                                                                                                            |

Rules, tested in `switch.test.tsx`:

- **A native checkbox with the switch role.** `type="checkbox"`, `role="switch"`, class `kv-switch`, no `aria-checked` and no `aria-required`.
- **Named by its label.** In a Field the label's `for` matches the input's `id`; the accessible name is the label text, with "(optional)" in a standalone Field unless the label has `marker="none"`. The help text describes it.
- **Not required.** `required` is not a prop. A required Field gives no `aria-required` and no `data-required`, and warns once (`switch-required`): off is a valid answer, and a consent is a Checkbox.
- **Optional marker.** A Switch whose label shows "(optional)" warns once (`switch-optional-marker`): it makes no sense for a setting. Use `<Field.Label marker="none">`.
- **`data-state`** is `checked` or `unchecked`. It follows the props when controlled, and the native state after each change when not.
- **No form state.** `defaultChecked` and `name` work in a plain form: checked sends `name=value` (`on` by default), off sends nothing, `form.reset()` restores `defaultChecked`. The switch never copies `checked` into state.
- **Disabled.** A Field's `disabled` or the prop gives native `disabled` and `data-disabled`. Never disable the focused switch while saving (a disabled element loses focus, 2.4.3).
- **`render`** changes the element and must stay an `<input type="checkbox">`. Refs merge, `className` joins the part class.
- **Dev warnings (once):** a Switch in a Field with no Field.Label; a Switch outside a Field with no accessible name; an `id` inside a Field (ignored: set `controlId` on the Field); `switch-required`; `switch-optional-marker`.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Each switch is its own Tab stop. Nothing is intercepted: Space, Enter and Tab keep their native behaviour.

| Key       | Context           | Action                                                          | Test                                                                          |
| --------- | ----------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Tab       | before the switch | Moves focus to the switch. Each switch is one Tab stop          | `switch.test.tsx › Tab moves to each switch, one stop each`                   |
| Shift+Tab | on a switch       | Moves focus to the previous focusable element                   | `switch.test.tsx › Shift+Tab moves to the previous switch`                    |
| Tab       | disabled switch   | Skips it (native `disabled` leaves the Tab sequence)            | `switch.test.tsx › Tab skips a disabled switch`                               |
| Space     | on a switch       | Toggles it, and reports `onCheckedChange` (native)              | `switch.test.tsx › Space toggles the switch and reports the new state`        |
| Enter     | on a switch       | Doesn't toggle it. In a form the browser may submit it (native) | `switch.test.tsx › Enter does not toggle the switch and is not intercepted`   |
| –         | label or pointer  | A click on the label or the row toggles it and focuses it       | `switch.test.tsx › clicking the label text toggles the switch and focuses it` |

The arrow keys, Home and End do nothing on a switch (native). The keys are the same in RTL.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: the focus ring is drawn outside the track, and nothing around clips it (2.4.11, 2.4.13). Consumers with a sticky header set `scroll-padding`.

## Announcements

None from the component. On focus a screen reader reads the label, "switch" and its on or off state, and the description. The toggle itself is announced from the role. A switch that saves on change confirms or reports a failed save through an always-mounted live region (`<output>` or the `Announcer`, 4.1.3), with the consumer's own string.

## Consumer responsibilities

- Put the Switch directly in `Field.Root`, before a `<Field.Label marker="none">`.
- The label names the setting, a noun phrase that reads correctly with "on" or "off" after it ("Påminnelser via sms"). Never "På" or "Av" in it, and never a label that changes with the state.
- A switch takes effect at once: say so ("Ändringar sparas direkt"), keep it enabled and focused while saving, put it back and show an error if the save fails, and never navigate or move focus on change (3.2.2).
- A not-available switch is `disabled`, with the reason in the help text, never in a tooltip.
- Use a Checkbox for an answer sent with a form, a declaration or a consent, and a Toggle for a button with a direct visible effect on the page.

## Visual / modes

- Focus indicator: a `focus-ring` outline outside the track, following its pill shape.
- Target size: the track is 44×24px (2.5.8). The whole row is the target: the label spans the row, at least 44px high (32px in `kv-compact`).
- Colour: on and off differ in the thumb's position and a tick, not only in colour (1.4.1); edges meet 3:1 (1.4.11). Invalid is a 2px `danger` edge plus the error message. Disabled is dashed (off) or muted (on).
- forced-colors behaviour: off `ButtonBorder` edge on `Field`; on `Highlight` fill with a `HighlightText` thumb; disabled `GrayText`.
- reduced-motion behaviour: the thumb slides only under `no-preference`.
- RTL: the track is at the right and the thumb moves right to left; the tick doesn't mirror.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: native checkbox with the switch role, label `for`.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: thumb position, the tick, the edge and the invalid width.
- 1.4.10 Reflow, 1.4.12 Text Spacing: the label wraps beside the track.
- 2.1.1 Keyboard, 2.4.3 Focus Order: native Tab and Space.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance.
- 2.5.3 Label in Name, 2.5.8 Target Size (Minimum): the visible label is the name; the row is at least 32px.
- 3.2.2 On Input: a switch never changes context.
- 3.3.1 Error Identification, 3.3.2 Labels or Instructions: the Field's error and help text.

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

Research questions for the AT run: is `role="switch"` on a native checkbox announced as "switch" or "checkbox" in each screen reader, and is the on or off state spoken? Can a resident tell the state without colour in a contrast theme?

## Known issues

- **The thumb and tick are not tested automatically.** They are drawn with `::before`, `::after` and `clip-path` on the input. Nothing automated shows that Firefox and WebKit draw them, or that on and off differ visibly. They are reviewed by eye and checked in the manual AT matrix (the Windows Contrast Themes row). A hidden indicator element is the fallback.
- **`data-state` after `form.reset()`.** For an uncontrolled switch it's updated on change events, not on a form reset. The theme styles `:checked`, so the look is right; read the native state, not the attribute.
- **Some screen readers announce `role="switch"` as a checkbox or a toggle button.** The state is still spoken. Manual AT is `pending`.
