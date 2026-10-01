# Accessibility contract: Button

- **APG pattern:** [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- **Deviations:** none
- **Native elements used:** `<button>`. Activation, the Tab stop and form submission are the browser's own.
- **Status:** alpha candidate (Plan 0003). Gates 1–5 pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `button.test.tsx` next to this file. `button.stories.tsx` and `button.e2e.ts` in `apps/storybook/src/components/button/`.

A Button performs an action. Navigation is a Link. `Button` defaults to `type="button"`, so it never submits a form by accident. A disabled button can stay focusable (`focusableWhenDisabled`), so keyboard and screen-reader users can still find it and read why it's disabled.

## Roles, states, properties

| Part   | Element / role         | ARIA                                            | Notes                                                                                                                                                                                                                                                                                                                                                      |
| ------ | ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button | `<button>` → `button`  | none by default                                 | `type="button"` unless `type` is given. Name from its content                                                                                                                                                                                                                                                                                              |
|        | disabled               | native `disabled`                               | Not focusable, not activatable. `data-disabled`                                                                                                                                                                                                                                                                                                            |
|        | disabled and focusable | `aria-disabled="true"`, no `disabled` attribute | Stays in the Tab order. Click, Enter, Space and implicit form submission are blocked: neither the Button's `onClick` nor a `render` element's own `onClick` is called, and the default (form submission) is prevented. `data-disabled`. `aria-disabled` can't be passed directly: it's set only through `disabled` with `focusableWhenDisabled` (ADR-0016) |
|        | keyboard focus         | none                                            | `data-focus-visible` while the button matches `:focus-visible`                                                                                                                                                                                                                                                                                             |
|        | `render`               | must still render a `<button>`                  | A dev warning names the element when it doesn't. Use Link for navigation. An element's own `onClick` is gated like the Button's                                                                                                                                                                                                                            |

`useButton` gives the same `buttonProps` for your own `<button>`. Pass your click handler as `useButton({ onClick })`, so it is blocked while disabled.

## Keyboard

| Key   | Context                   | Action                                                                                                        | Test                                                                                       |
| ----- | ------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Tab   | Button                    | Moves focus to the button                                                                                     | `button.e2e.ts › Tab moves focus to the button`                                            |
| Tab   | Disabled button           | Skips the button                                                                                              | `button.e2e.ts › Tab skips a disabled button`                                              |
| Tab   | Focusable disabled button | Moves focus to the button, which is announced as unavailable                                                  | `button.e2e.ts › Tab moves focus to a focusable disabled button`                           |
| Enter | Button                    | Activates. Focus stays on the button                                                                          | `button.e2e.ts › Enter activates the button and keeps focus`                               |
| Enter | Focusable disabled button | Blocked. Focus stays on the button                                                                            | `button.e2e.ts › Enter does not activate a focusable disabled button`                      |
| Space | Button                    | Activates on key up, not on key down. Focus stays on the button                                               | `button.e2e.ts › Space activates the button on key up`                                     |
| Space | Focusable disabled button | Blocked. Focus stays on the button                                                                            | `button.e2e.ts › Space does not activate a focusable disabled button`                      |
| Enter | Submit button in a form   | Submits the form                                                                                              | `button.e2e.ts › Enter on a submit button submits the form`                                |
| Enter | Default button in a form  | Activates the button without submitting the form (`type="button"`)                                            | `button.e2e.ts › Enter on a default button does not submit the form`                       |
| –     | Pointer                   | A click on a disabled button, focusable or not, calls no handler                                              | `button.test.tsx › disabled › …`, `button.test.tsx › focusable when disabled › …`          |
| –     | Form, implicit submission | Enter in a text field doesn't submit through a focusable disabled submit                                      | `button.test.tsx › focusable when disabled › blocks implicit submission from a text field` |
| –     | `render` element handler  | A focusable disabled button blocks the element's own `onClick` on click, Enter, Space and implicit submission | `button.test.tsx › handlers on a render element (ADR-0016) › …`                            |

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

- Give the button a visible text label, or an `aria-label` from your own translations for an icon-only button (4.1.2, 2.5.3).
- Use `type="submit"` for the button that submits a form.
- When a button is disabled, tell users why in text near it, and link that text with `aria-describedby` if the button is focusable. Prefer not disabling at all: let the user submit and show the errors (GOV.UK, 3.3.1).
- Pass your click handler to `Button` (or to the `render` element), or to `useButton({ onClick })`. Don't merge your own `onClick` on top of `buttonProps`: it wouldn't be blocked while disabled.
- With the `render` function form, spread `buttonProps` and never override `buttonProps.onClick`. It is what blocks activation while disabled.
- Disable a button that may have focus with `focusableWhenDisabled`. A natively disabled button loses focus, and focus drops to `body` (2.4.3). This matters most for a button that disables itself when pressed.
- Keep `render` on a `<button>`. For navigation, use Link.
- Style `[data-disabled]` and `[data-focus-visible]` (or `:focus-visible`). Never remove the focus ring without a replacement.

## Visual / modes

- Focus indicator: headless. The browser's native ring by default. The default theme restyles it to at least 2px at 3:1 (2.4.7, 2.4.13). Test: `button.stories.tsx › Focus visible`, and `theme:check` for the ring's contrast.
- Target size: headless. The default theme makes buttons at least 24 × 24 CSS px (2.5.8), in both densities. Test: `button.stories.tsx › Default`, `› Compact density`.
- forced-colors behaviour: a native `<button>`, so the system's `ButtonText` / `ButtonFace` apply. The disabled state isn't conveyed only by colour in the default theme: it has a dashed edge (1.4.1, `button.stories.tsx › States`). The e2e suite passes in `chromium-forced-colors`.
- reduced-motion behaviour: no motion. Passes in `chromium-reduced-motion`.
- Reflow: no horizontal scrolling at 320 CSS px (`reflow-320`, 1.4.10).

## WCAG SCs covered

- 2.1.1 Keyboard: native `<button>`, Enter and Space (e2e rows above).
- 2.4.3 Focus Order, 2.4.7 Focus Visible: native Tab order, `data-focus-visible`.
- 2.5.8 Target Size (Minimum): consumer and default theme.
- 3.2.2 On Input: `type="button"` by default, so no unexpected form submission.
- 4.1.2 Name, Role, Value: role `button`, name from content, `disabled` / `aria-disabled` exposed (`button.test.tsx`, e2e a11y tree).

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

## Known issues

- **WebKit not run locally.** The `webkit` and `mobile-safari` Playwright projects need system libraries that aren't installed on the development machine. CI runs them. Safari doesn't focus buttons on click, which doesn't affect this contract.
