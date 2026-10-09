# Accessibility contract: Slider

- **APG pattern:** [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), single thumb. The native form: `<input type="range">`, whose implicit role is `slider` and whose `aria-valuemin`, `aria-valuemax` and `aria-valuenow` are native.
- **Deviations:** none from APG. Decisions (Plan 0072): no `role="slider"` div (native semantics first); no visible value part (a NumberInput beside it is the visible, exact value); no track fill; no `required`.
- **Native elements used:** `<input type="range">`, named by a `<label for>` (Field.Label) or by `aria-labelledby`.
- **Status:** alpha candidate (Plan 0072). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `slider.test.tsx` next to this file. `slider.stories.tsx` in `apps/storybook/src/components/slider/`.

A Slider is for an approximate value (a search radius, a volume). It is never the only way to enter a number that matters: an exact value is a NumberInput, and a slider beside one (Pattern A) gives a resident both. It is a native input, so the browser supplies every key, the drag, a press on the track, form submission, `form.reset()` and `disabled`. Slider adds the Field's wiring, `aria-valuetext`, the part class and `data-*` state. It holds no form state: pass `value` and `onValueChange`, or `defaultValue` and `name` for a plain form.

## Roles, states, properties

| Part        | Element / role                             | ARIA / state                                                                                                                                                                                                                | Notes                                                                                                                                                                                                                                                         |
| ----------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slider      | `<input type="range">`, implicit `slider`  | Native value, min and max. `aria-valuetext` always. `id`, `aria-describedby` (help text, then the error) and `aria-invalid="true"` from the Field. Native `disabled`. `data-invalid`, `data-disabled`, `data-focus-visible` | Class `kv-slider`. Props: `value`, `defaultValue`, `min` (0), `max` (100), `step` (1), `name`, `disabled`, `onValueChange(value, { reason: 'input', event })`, `valueText`, `aria-labelledby`, `render`, native input props except `type`, `role`, `required` |
| Field.Label | `<label for>`, the slider's name           | The name never changes with the value                                                                                                                                                                                       | Pattern B and a plain Field. Pattern A: see below                                                                                                                                                                                                             |
| `useSlider` | the same attributes, for your own elements | `inputProps`, `isInvalid`, `isDisabled`, `isFocusVisible`, `value`, `valueText`                                                                                                                                             | Spread `inputProps` on your `<input>`                                                                                                                                                                                                                         |

Rules, tested in `slider.test.tsx`:

- **A native range.** `type="range"`, class `kv-slider`, no `role` and no `aria-valuenow` written by the component, no `aria-required`.
- **`aria-valuetext` is always set.** It is `valueText(value)`, or the number formatted with the provider's locale. It follows the value, controlled or not. Say the unit in `valueText` (`15 km`).
- **Named by its label.** In a Field the label's `for` matches the input's `id`. The help text describes it.
- **Pattern A (Slider beside a NumberInput).** An explicit `aria-labelledby` opts the Slider out of the Field: it gets no `id`, no `aria-describedby`, no `aria-invalid` and no `data-invalid` from it. The NumberInput owns the Field's id, the label's `for` and the error. The Field's label and help text take no `id`, so wrap their text in a `<span id>` and point `aria-labelledby` and `aria-describedby` at it. Pass `aria-describedby` yourself for the help text. A disabled Field still disables the Slider.
- **Controlled and uncontrolled.** `value` is a `number`; `onValueChange` gets `Number(event.currentTarget.value)`. A form submit sends `name=value` as a string; `form.reset()` restores `defaultValue`.
- **Disabled.** A Field's `disabled` or the prop gives native `disabled` and `data-disabled`.
- **Dev warnings (once):** a Slider in a Field with no Field.Label; a Slider outside a Field with no accessible name (`aria-label` or `aria-labelledby` count); an `id` inside a Field; `min >= max` (`slider-min-max`); a `value` or `defaultValue` outside the range (`slider-value-out-of-range`).

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
| PageUp                 | on the slider      | Increases by a larger step (native, 10% of the range)      | `slider.test.tsx › PageUp and PageDown move by a larger step`         |
| PageDown               | on the slider      | Decreases by a larger step (native)                        | `slider.test.tsx › PageUp and PageDown move by a larger step`         |
| ArrowLeft / ArrowRight | right-to-left page | The browser reverses them: Left increases, Right decreases | `slider.test.tsx › in a right-to-left page the arrows are reversed`   |

Arrows stop at `min` and `max`. The value is announced natively; there is no live region.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: the focus ring is drawn on the input's box, outside the track, and nothing around clips it (2.4.11, 2.4.13). Consumers with a sticky header set `scroll-padding`.

## Announcements

None from the component. On focus a screen reader reads the label, "slider", `aria-valuetext` and the description. A change is announced from the native value. Results that update as the value moves are announced once, debounced, through the `Announcer` (4.1.3), never per step.

## Consumer responsibilities

- Name the quantity and its unit in the label ("Avstånd i kilometer"); never a label that changes with the value.
- Say the unit in `valueText` ("15 km", "40 procent"): a bare number is right only when it has no unit.
- State the ends of the range in the help text. Never "Drag the slider" as the only instruction.
- Never the only way in for an exact number: pair it with a NumberInput (Pattern A), where the NumberInput owns the Field and the Slider has `aria-labelledby`, and a use of a value with legal effect is a NumberInput alone (2.5.7).
- Updating results on input is fine, but never navigate or move focus on change (3.2.2).
- A not-available slider is `disabled`, with the reason in the help text.

## Visual / modes

- Focus indicator: a `focus-ring` outline on the input box.
- Target size: the box is at least 44px high (32px in `kv-compact`) and the thumb is 24px (2.5.8); on a coarse pointer the thumb's hit box is 44px.
- Colour: the thumb is `primary`, the track edge `border-control`, both at least 3:1 (1.4.11). Invalid is a 2px `danger` edge plus the message. Disabled is dashed with a muted thumb.
- forced-colors behaviour: track `Field` with a `ButtonBorder` edge, thumb `Highlight`, disabled `GrayText`, invalid `CanvasText` 2px.
- reduced-motion behaviour: the track's border colour transitions only under `no-preference`; the thumb never animates.
- RTL: the browser reverses the range; nothing in the theme depends on direction.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: native range, label `for`, `aria-valuetext`.
- 1.4.11 Non-text Contrast: the track edge, the thumb and the focus ring.
- 1.4.10 Reflow, 1.4.12 Text Spacing: full width, the label wraps.
- 2.1.1 Keyboard, 2.4.3 Focus Order: native Tab and the range keys.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance.
- 2.5.7 Dragging Movements: dragging a native range is the user agent's own, unmodified behaviour, which the criterion excepts. The alternative is the keys, and in Pattern A the NumberInput beside it.
- 2.5.8 Target Size (Minimum): the box and the thumb.
- 3.2.2 On Input: a slider never changes context.
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

Research questions for the AT run: is `aria-valuetext` spoken on every step on VoiceOver iOS (swipe up and down) and TalkBack? Does Safari reverse the range in RTL? Can a resident on iOS Safari move the thumb without a drag, and is the NumberInput in Pattern A enough?

## Known issues

- **The thumb and track are not tested automatically.** They are the input's own pseudo-elements, styled per engine. They are reviewed by eye and in the Windows Contrast Themes row of the manual matrix.
- **A value between steps.** The browser snaps the thumb to the nearest step; in Pattern A the NumberInput keeps the typed number.
- **`form.reset()` and `aria-valuetext`.** For an uncontrolled slider the text follows the native value after each change and after a form reset (read back in the next task, since the reset runs after its event).
- **A controlled `value` off the step or outside the range.** The browser snaps the thumb and `aria-valuenow`, but `aria-valuetext` is built from the `value` you passed, so the two can disagree. Pass a value on a step and inside `min` and `max`.
