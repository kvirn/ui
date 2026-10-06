# Accessibility contract: Button

- **APG pattern:** [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- **Deviations:** none
- **Native elements used:** `<button>`. Activation, the Tab stop and form submission are the browser's own.
- **Status:** alpha candidate (Plan 0003). Gates 1–5 pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `button.test.tsx` next to this file. `button.stories.tsx` in `apps/storybook/src/components/button/`.

A Button performs an action. Navigation is a Link. `Button` defaults to `type="button"`, so it never submits a form by accident. A disabled button can stay focusable (`focusableWhenDisabled`), so keyboard and screen-reader users can still find it and read why it's disabled.

## Roles, states, properties

| Part   | Element / role         | ARIA                                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------ | ---------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button | `<button>` → `button`  | none by default                                 | `type="button"` unless `type` is given. Name from its content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|        | disabled               | native `disabled`                               | Not focusable, not activatable. `data-disabled`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|        | disabled and focusable | `aria-disabled="true"`, no `disabled` attribute | Stays in the Tab order. Click, Enter, Space and implicit form submission are blocked: neither the Button's `onClick` nor a `render` element's own `onClick` is called, and the default (form submission) is prevented. `data-disabled`. `aria-disabled` can't be passed directly: it's set only through `disabled` with `focusableWhenDisabled`, or through `busy`                                                                                                                                                                                                                                                                                                |
|        | busy                   | `aria-disabled="true"`, no `disabled` attribute | The action is running (`busy`). Stays in the Tab order and keeps focus when `busy` turns on (2.4.3). Click, Enter, Space and implicit submission are blocked like a focusable disabled button. `data-busy`, no `data-disabled`. The name never changes (2.5.3). No `aria-busy`. `disabled` wins when both are set. While busy a decorative `<span class="kv-spinner" aria-hidden="true">` is the first child (Plan 0080; its 1000 ms delay is CSS, and it loops while busy, resting under reduced motion: see Consumer responsibilities for 2.2.2). The Button announces nothing: pair it with a `Progress` beside it, without a `Progress.Indicator` (Plan 0074) |
|        | keyboard focus         | none                                            | `data-focus-visible` while the button matches `:focus-visible`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|        | `render`               | must still render a `<button>`                  | A dev warning names the element when it doesn't. Use Link for navigation. An element's own `onClick` is gated like the Button's                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|        | no accessible name     | –                                               | A dev warning when the button has no `aria-label`, `aria-labelledby`, `title` or `<label>`, and no content outside `aria-hidden`: an icon-only button with only a decorative `Icon` (4.1.2, Plan 0009). Test: `button.test.tsx › icon-only button name`                                                                                                                                                                                                                                                                                                                                                                                                           |

`useButton` gives the same `buttonProps` for your own `<button>`. Pass your click handler as `useButton({ onClick })`, so it is blocked while disabled.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

A native `<button>`: one Tab stop, in DOM order, with no `tabindex`. Enter and Space are native.

| Key       | Context                          | Action                                                                                                        | Test                                                                                                            |
| --------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Tab       | Button                           | Moves focus to the button                                                                                     | `button.test.tsx › keyboard › Tab moves focus to the button`                                                    |
| Shift+Tab | Button                           | Moves focus to the previous focusable element, and off the button                                             | `button.test.tsx › keyboard › Shift+Tab moves focus off the button`                                             |
| Tab       | Disabled button                  | Skips the button                                                                                              | `button.test.tsx › disabled › is natively disabled, marked with data-disabled and skipped by Tab`               |
| Tab       | Focusable disabled button        | Moves focus to the button, which is announced as unavailable                                                  | `button.test.tsx › focusable when disabled › uses aria-disabled instead of disabled and stays in the Tab order` |
| Enter     | Button                           | Activates. Focus stays on the button                                                                          | `button.test.tsx › rendering › Enter and Space activate the button and keep focus on it`                        |
| Enter     | Focusable disabled button        | Blocked. Focus stays on the button                                                                            | `button.test.tsx › focusable when disabled › click, Enter and Space call no handler, and focus stays`           |
| Space     | Button                           | Activates on key up, not on key down. Focus stays on the button                                               | `button.test.tsx › keyboard › Space activates the button on key up`                                             |
| Space     | Focusable disabled button        | Blocked. Focus stays on the button                                                                            | `button.test.tsx › focusable when disabled › click, Enter and Space call no handler, and focus stays`           |
| Enter     | Submit button in a form          | Submits the form                                                                                              | `button.test.tsx › keyboard › Enter on a submit button submits the form`                                        |
| Enter     | Default button in a form         | Activates the button without submitting the form (`type="button"`)                                            | `button.test.tsx › keyboard › Enter on a default button does not submit the form`                               |
| Tab       | Busy button                      | Moves focus to the button, which is read as unavailable                                                       | `button.test.tsx › busy › Tab lands on a busy button`                                                           |
| Enter     | Busy button                      | Blocked: no handler, no submit. Focus stays on the button                                                     | `button.test.tsx › busy › click, Enter and Space call no handler, and focus stays`                              |
| Space     | Busy button                      | Blocked: no handler, no submit. Focus stays on the button                                                     | `button.test.tsx › busy › click, Enter and Space call no handler, and focus stays`                              |
| –         | `busy` turns on while focused    | Focus stays on the button                                                                                     | `button.test.tsx › busy › focus stays on the button when busy turns on and off`                                 |
| –         | Busy submit, implicit submission | Blocked, like a click                                                                                         | `button.test.tsx › busy › a busy submit button submits nothing, not even by implicit submission`                |
| –         | Pointer                          | A click on a disabled button, focusable or not, calls no handler                                              | `button.test.tsx › disabled › …`, `button.test.tsx › focusable when disabled › …`                               |
| –         | Form, implicit submission        | Enter in a text field doesn't submit through a focusable disabled submit                                      | `button.test.tsx › focusable when disabled › blocks implicit submission from a text field`                      |
| –         | `render` element handler         | A focusable disabled button blocks the element's own `onClick` on click, Enter, Space and implicit submission | `button.test.tsx › handlers on a render element › …`                                                            |

Escape, arrow keys and Home / End are not handled.

## Focus management

- Initial focus: not moved. Button never moves focus.
- Trap: no.
- Restore to: not applicable. After an activation attempt on a focusable disabled button, focus stays on it.
- Never obscured by: Button renders no overlay.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Button has no strings of its own. Its name is its content, which the consumer provides.

## Consumer responsibilities

- Give the button a visible text label, or an `aria-label` from your own translations for an icon-only button (4.1.2, 2.5.3). Keep the icon decorative: `<Button className="kv-button--icon-only" aria-label={messages.close}><Icon name="close" /></Button>`.
- Use `type="submit"` for the button that submits a form.
- When a button is disabled, tell users why in text near it, and link that text with `aria-describedby` if the button is focusable. Prefer not disabling at all: let the user submit and show the errors (GOV.UK, 3.3.1).
- Pass your click handler to `Button` (or to the `render` element), or to `useButton({ onClick })`. Don't merge your own `onClick` on top of `buttonProps`: it wouldn't be blocked while disabled.
- With the `render` function form, spread `buttonProps` and never override `buttonProps.onClick`. It is what blocks activation while disabled.
- Disable a button that may have focus with `focusableWhenDisabled`. A natively disabled button loses focus, and focus drops to `body` (2.4.3). This matters most for a button that disables itself when pressed.
- Keep `render` on a `<button>`. For navigation, use Link.
- Style `[data-disabled]` and `[data-focus-visible]` (or `:focus-visible`). Never remove the focus ring without a replacement.
- **WCAG 2.2.2 (Pause, Stop, Hide).** The indicators (spinner, bar sheen, busy Button, job Toast, FileUpload track, Table busy sweep) move for as long as the wait lasts, which can be more than 5 s. `prefers-reduced-motion: reduce` is honoured and shows a still rest shape, but to meet WCAG 2.2.2 the app must also offer its own visible control that stops moving content (the library ships none) and applies the stop CSS. [Moving indicators and WCAG 2.2.2](/foundation/theming#moving-indicators). The text, the percent and the 10 s slow sentence carry the wait.

## Visual / modes

- Focus indicator: headless. The browser's native ring by default. The default theme restyles it to at least 2px at 3:1 (2.4.7, 2.4.13). Test: `button.stories.tsx › Focus visible`, and `theme:check` for the ring's contrast.
- Target size: headless. The default theme makes buttons at least 24 × 24 CSS px (2.5.8), in both densities. Test: `button.stories.tsx › Default`, `› Compact density`.
- forced-colors behaviour: a native `<button>`, so the system's `ButtonText` / `ButtonFace` apply. The disabled state isn't conveyed only by colour in the default theme: it has a dashed edge (1.4.1, `button.stories.tsx › States`).
- reduced-motion behaviour: no motion.
- Reflow: no horizontal scrolling at 320 CSS px (`reflow-320`, 1.4.10).

## WCAG SCs covered

- 2.1.1 Keyboard: native `<button>`, Enter and Space (Keyboard rows above).
- 2.4.3 Focus Order, 2.4.7 Focus Visible: native Tab order, `data-focus-visible`.
- 2.5.8 Target Size (Minimum): consumer and default theme.
- 3.2.2 On Input: `type="button"` by default, so no unexpected form submission.
- 4.1.2 Name, Role, Value: role `button`, name from content, `disabled` / `aria-disabled` exposed (`button.test.tsx`).

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

## Known issues

- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. A WebKit run is not automated, and the manual AT matrix is `pending`. Safari doesn't focus buttons on click, which doesn't affect this contract.
