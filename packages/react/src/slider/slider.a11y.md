# Accessibility contract: Slider

- **APG pattern:** [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), single thumb. The native form: `<input type="range">`, whose implicit role is `slider` and whose `aria-valuemin`, `aria-valuemax` and `aria-valuenow` are native.
- **Deviations:** none from APG.
- **Native elements used:** `<input type="range">`, named by a `<label for>` (Field.Label) or by `aria-labelledby`.
- **Status:** alpha candidate. Native range, gates green, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `slider.test.tsx` next to this file. `slider.stories.tsx` in `apps/storybook/src/components/slider/`.

A Slider is for an approximate value (a search radius, a volume). It is never the only way to enter a number that matters: an exact value is a NumberInput, and a slider beside one gives a resident both. It is a native input, so the browser supplies every key, the drag, a press on the track, form submission, `form.reset()` and `disabled`. Slider adds the Field's wiring, `aria-valuetext`, the part class and `data-*` state. It holds no form state: pass `value` and `onValueChange`, or `defaultValue` and `name` for a plain form.

## Roles, states, properties

| Part        | Element / role                             | ARIA / state                                                                                                                                                                                                                | Notes                                                                                                                                                                                                                                               |
| ----------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slider      | `<input type="range">`, implicit `slider`  | Native value, min and max. `aria-valuetext` always. `id`, `aria-describedby` (help text, then the error) and `aria-invalid="true"` from the Field. Native `disabled`. `data-invalid`, `data-disabled`, `data-focus-visible` | Class `kv-slider`. Props: `value`, `defaultValue`, `min` (0), `max` (100), `step` (1), `name`, `disabled`, `onValueChange(value, { reason: 'input', event })`, `valueText`, `aria-labelledby`, native input props except `type`, `role`, `required` |
| Field.Label | `<label for>`, the slider's name           | The name never changes with the value                                                                                                                                                                                       | A Slider that owns the Field, or a plain Field. A Slider beside a NumberInput: see the rules below                                                                                                                                                  |
| `useSlider` | the same attributes, for your own elements | `inputProps`, `isInvalid`, `isDisabled`, `isFocusVisible`, `value`, `valueText`                                                                                                                                             | Spread `inputProps` on your `<input>`                                                                                                                                                                                                               |

Rules, each with an automated test:

- **A native range.** `type="range"`, class `kv-slider`, no `role` and no `aria-valuenow` written by the component, no `aria-required`.
- **`aria-valuetext` is always set.** It is `valueText(value)`, or the number formatted with the provider's locale. It follows the value, controlled or not. Say the unit in `valueText` (`15 km`).
- **Named by its label.** In a Field the label's `for` matches the input's `id`. The help text describes it.
- **A Slider beside a NumberInput.** An explicit `aria-labelledby` opts the Slider out of the Field: it gets no `id`, no `aria-describedby`, no `aria-invalid` and no `data-invalid` from it. The NumberInput owns the Field's id, the label's `for` and the error. The Field's label and help text take no `id`, so wrap their text in a `<span id>` and point `aria-labelledby` and `aria-describedby` at it. Pass `aria-describedby` yourself for the help text. A disabled Field still disables the Slider.
- **Controlled and uncontrolled.** `value` is a `number`; `onValueChange` gets `Number(event.currentTarget.value)`. A form submit sends `name=value` as a string; `form.reset()` restores `defaultValue`.
- **Disabled.** A Field's `disabled` or the prop gives native `disabled` and `data-disabled`.
- **Dev warnings (once):** a Slider in a Field with no Field.Label; a Slider outside a Field with no accessible name (`aria-label` or `aria-labelledby` count); an `id` inside a Field; a `min` that is not below `max`; a `value` or `defaultValue` outside the range.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** no
- **Shortcuts:** none

Each slider is one Tab stop. Nothing is intercepted: every key keeps its native behaviour.

| Key                    | Context            | Action                                                     | Test                                                                  |
| ---------------------- | ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| Tab                    | before the slider  | Moves focus to the slider. One Tab stop                    | `slider.test.tsx › Tab moves to the slider, one stop`                 |
| Shift+Tab              | on the slider      | Moves focus to the previous focusable element              | `slider.test.tsx › Shift+Tab moves to the previous focusable element` |
| Tab                    | disabled slider    | Skips it (native `disabled` leaves the Tab sequence)       | `slider.test.tsx › Tab skips a disabled slider`                       |
| ArrowRight / ArrowUp   | on the slider      | Increases by `step`                                        | `slider.test.tsx › ArrowRight and ArrowUp increase by one step`       |
| ArrowLeft / ArrowDown  | on the slider      | Decreases by `step`                                        | `slider.test.tsx › ArrowLeft and ArrowDown decrease by one step`      |
| Home                   | on the slider      | Sets `min`                                                 | `slider.test.tsx › Home sets the minimum`                             |
| End                    | on the slider      | Sets `max`                                                 | `slider.test.tsx › End sets the maximum`                              |
| PageUp                 | on the slider      | Increases by a larger step (a step the browser sets)       | `slider.test.tsx › PageUp and PageDown move by a larger step`         |
| PageDown               | on the slider      | Decreases by a larger step (a step the browser sets)       | `slider.test.tsx › PageUp and PageDown move by a larger step`         |
| ArrowLeft / ArrowRight | right-to-left page | The browser reverses them: Left increases, Right decreases | `slider.test.tsx › in a right-to-left page the arrows are reversed`   |

Arrows stop at `min` and `max`. The value is announced natively; there is no live region.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: the focus ring is drawn on the input's box, outside the track, and nothing around clips it (2.4.11 Focus Not Obscured (Minimum), AA; 2.4.13 Focus Appearance, AAA). Consumers with a sticky header set `scroll-padding`.

## Announcements

None from the component. On focus a screen reader reads the label, "slider", `aria-valuetext` and the description. A change is announced from the native value.

## Consumer responsibilities

- Name the quantity and its unit in the label ("Distance in kilometres"); never a label that changes with the value.
- Say the unit in `valueText` ("15 km", "40 percent"): a bare number is right only when it has no unit.
- State the ends of the range in the help text. Never "Drag the slider" as the only instruction.
- Never the only way in for an exact number: pair it with a NumberInput beside it, where the NumberInput owns the Field and the Slider has `aria-labelledby`. A value with legal effect is a NumberInput alone. This is a KvirnUI rule for precision and for touch users without keys, not a WCAG requirement: dragging a native range is excepted from 2.5.7 Dragging Movements (AA), and its keys meet 2.1.1 Keyboard (A).
- Results that update as the value moves are announced once, debounced, through the `Announcer` (4.1.3 Status Messages, AA), never per step. This is your code: the Slider announces nothing itself.
- Updating results on input is fine, but never navigate or move focus on change (3.2.2 On Input, A).
- A not-available slider is `disabled`, with the reason in the help text.

## Visual / modes

- Focus indicator: a ring around the input box with at least 3:1 contrast against the colours next to it (2.4.7 Focus Visible, AA; 2.4.13 Focus Appearance, AAA).
- Target size: the box is tall enough to press, and the thumb is at least 24px (2.5.8 Target Size (Minimum), AA). On a coarse pointer, such as a finger, the thumb's hit area is larger.
- Colour: the thumb and the track edge each have at least 3:1 contrast against their background (1.4.11 Non-text Contrast, AA). An invalid slider has a heavier error-coloured edge plus the message. A disabled slider has a dashed edge and a muted thumb.
- Forced colours (the system's own colour scheme): the track uses the system field colour with a button-border edge, the thumb uses the system highlight colour, a disabled slider is grey, and an invalid one has a heavier edge in the system text colour. The forced-colours sweep runs every story and checks the boundaries and the focus ring; the thumb and track colours themselves are checked by eye.
- Reduced motion: the track's border colour changes gradually only when the person has not asked for reduced motion. The thumb never animates.
- Right-to-left (RTL) pages: the browser reverses the range, and nothing in the theme depends on direction.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A): native range, label `for`, `aria-valuetext`.
- 1.4.11 Non-text Contrast (AA): the track edge, the thumb and the focus ring.
- 1.4.10 Reflow (AA), 1.4.12 Text Spacing (AA): full width, the label wraps.
- 2.1.1 Keyboard (A), 2.4.3 Focus Order (A): native Tab and the range keys.
- 2.4.7 Focus Visible (AA), 2.4.11 Focus Not Obscured (Minimum) (AA), 2.4.13 Focus Appearance (AAA, not counted toward the AA bar).
- 2.5.7 Dragging Movements (AA): dragging a native range is the user agent's own, unmodified behaviour, which the criterion excepts. The alternative is the keys, and, with a NumberInput beside it, that box.
- 2.5.8 Target Size (Minimum) (AA): the box and the thumb.
- 3.2.2 On Input (A): a slider never changes context.
- 3.3.1 Error Identification (A), 3.3.2 Labels or Instructions (A): the Field's error and help text.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                         |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                               |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | slider.stories.tsx, every story, 4 themes                                                                     |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | slider.test.tsx › valueText sets aria-valuetext, and it follows each change; expectNoA11yViolations           |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 10 rows, each names a test (slider.test.tsx › Tab moves to the slider, one stop)                              |
| Focus order and management                                                 | pass        | n/a         | pass    | slider.test.tsx asserts focus (toHaveFocus); first rule: Tab moves to the slider, one stop                    |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI |
| **Core (required for beta)**                                               |             |             |         |                                                                                                               |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                               |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                               |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                               |

### What to check

- Tab to the slider: you hear the label, "slider", the value with its unit and the help text.
- Press Right or Up, then Left or Down: the value moves one step each time and the new value is spoken with its unit.
- Press Home and End: the value jumps to the ends. Press Page Up and Page Down: it jumps by a larger step.
- With a NumberInput beside it, type a number: the slider moves. Click the label: the number box is focused.
- Disable the Field: Tab skips the slider and the help text says why.
- On a phone with a screen reader, change the value without dragging: the value text is spoken, and the NumberInput works.

## Known issues

- **The thumb and track colours are checked by eye.** They are parts the browser draws itself, styled separately for each browser engine, so the automated forced-colours check covers the boundaries and the focus ring but not these. Check them in Windows Contrast Themes yourself.
- **A value between steps.** The browser snaps the thumb to the nearest step; beside a NumberInput, the NumberInput keeps the typed number.
- **`form.reset()` and `aria-valuetext`.** For an uncontrolled slider the text follows the native value after each change and after a form reset.
- **A controlled `value` off the step or outside the range.** The browser snaps the thumb and `aria-valuenow`, but `aria-valuetext` is built from the `value` you passed, so the two can disagree. Pass a value on a step and inside `min` and `max`.
