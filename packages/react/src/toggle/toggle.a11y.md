# Accessibility contract: Toggle

- **APG pattern:** [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), the toggle button (`aria-pressed`)
- **Deviations:** none
- **Native elements used:** `<button type="button">`. Activation, the Tab stop and the Enter and Space keys are the browser's own.
- **Status:** alpha candidate (Plan 0035). Gates pass, accessibility-reviewer APPROVE (2026-10-04). Manual AT is `pending`.
- **Tests:** `toggle.test.tsx` next to this file. `toggle.stories.tsx` and `toggle.e2e.ts` in `apps/storybook/src/components/toggle/`.

A Toggle is a Button that is on or off. Use it for a choice with a direct, visible effect on the page: bold text, "show only unread". It is not for an answer in a form (use a Checkbox or a radio group) or a setting that is saved (use a Switch, when there is one). It builds on [Button](../button/button.a11y.md): everything Button's contract says about `disabled`, `focusableWhenDisabled`, `render` and the missing-name warning holds here.

## Roles, states, properties

| Part   | Element / role                      | ARIA                                            | Notes                                                                                                                                                                              |
| ------ | ----------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toggle | `<button type="button">` → `button` | `aria-pressed="false"` or `"true"`              | Always present, so the button is a toggle button even while off. `data-pressed` while on. The name never changes with the state: a screen reader says it is on from `aria-pressed` |
|        | controlled                          | `pressed` + `onPressedChange`                   | Shows the `pressed` it is given and only reports a press. `defaultPressed` starts an uncontrolled toggle on                                                                        |
|        | disabled                            | native `disabled`                               | Not focusable, not activatable. `aria-pressed` and `data-disabled` stay, so a disabled pressed toggle still says it is on                                                          |
|        | disabled and focusable              | `aria-disabled="true"`, no `disabled` attribute | Stays in the Tab order. Click, Enter and Space change nothing and call neither `onPressedChange` nor `onClick`. `focusableWhenDisabled` is Button's                                |
|        | keyboard focus                      | none                                            | `data-focus-visible` while the toggle matches `:focus-visible`                                                                                                                     |
|        | `render`                            | must still render a `<button>`                  | A dev warning names the element when it doesn't. An element's own `onClick` is gated like the Toggle's                                                                             |
|        | no accessible name                  | –                                               | A dev warning when the only content is hidden from assistive technology, such as a decorative `Icon` (4.1.2). Test: `toggle.test.tsx › accessible name`                            |

`useToggle` gives the same `toggleProps` for your own `<button>`. It is `useButton` plus the pressed state, so a disabled toggle blocks activation there too.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

A native `<button>`: one Tab stop, in DOM order, with no `tabindex`. Enter and Space are native, and both switch it. In a [Toolbar](../toolbar/toolbar.a11y.md) it is one of the toolbar's items instead: the toolbar's contract owns the keys then.

| Key           | Context                        | Action                                                                                     | Test                                                                                                                           |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Tab           | before the toggle              | Moves focus to the toggle                                                                  | `toggle.e2e.ts › Tab moves to and from the toggle`                                                                             |
| Shift+Tab     | on the toggle                  | Moves focus to the previous focusable element, and off the toggle                          | `toggle.e2e.ts › Tab moves to and from the toggle`                                                                             |
| Enter / Space | Toggle                         | Switches it on or off: `aria-pressed` changes. The name is the same, and focus stays on it | `toggle.e2e.ts › Enter and Space switch pressed, name is kept`                                                                 |
| Enter / Space | Toggle, disabled and focusable | Nothing happens. Focus stays on the toggle                                                 | `toggle.e2e.ts › a focusable disabled toggle ignores Enter and Space`                                                          |
| –             | Pointer                        | A click on a disabled toggle, focusable or not, calls no handler                           | `toggle.test.tsx › a focusable disabled toggle uses aria-disabled, stays in the Tab order, and ignores press, Enter and Space` |

Escape, the arrow keys and Home and End are not handled.

## Focus management

- Initial focus: not moved. Toggle never moves focus.
- Trap: no.
- Restore to: not applicable. Switching it keeps focus on the toggle.
- Never obscured by: Toggle renders no overlay.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Toggle has no strings of its own and announces nothing: the screen reader reads the new `aria-pressed` on the focused button. Its name is its content or the consumer's `aria-label`.

## Consumer responsibilities

- Give the toggle a visible text label, or an `aria-label` from your own translations for an icon-only toggle (4.1.2, 2.5.3). **The name must not change with the state:** "Visa karta", never "Visa karta" and "Dölj karta" (APG).
- Use a Toggle for a choice with a direct, visible effect. A setting that turns something on or off for good is a Switch or a Checkbox, and an answer in a form is a Checkbox or a radio group.
- With `pressed`, update it in `onPressedChange`, or the toggle never changes.
- Keep `render` on a `<button>`. In the function form, spread `toggleProps` and never override `toggleProps.onClick`: it is what blocks activation while disabled and what switches the state.
- Style `[data-pressed]` and `[aria-pressed='true']`. The pressed state must never be shown by colour alone (1.4.1): the default theme fills the button and changes the icon or label colour.

## Visual / modes

- Focus indicator: as Button. The default theme draws the 2px ring (2.4.7, 2.4.13).
- Target size: as Button, at least 24 × 24 CSS px, 44px by default (2.5.8).
- Pressed (default theme): a solid `primary` fill with the `on-primary` icon or label, no depth, flat in a toolbar. The fill reaches 3:1 against its surroundings and the icon 4.5:1 or 3:1 on the fill (1.4.1, 1.4.11). `theme:check` measures the pairs.
- forced-colors behaviour: pressed is a `Highlight` fill with `HighlightText`, a `Highlight` edge, so it differs from an unpressed button without colour alone (`toggle.stories.tsx › ForcedColors`, `toggle.e2e.ts › forced colours: a pressed toggle is drawn differently from an unpressed one`).
- reduced-motion behaviour: the fill changes instantly.
- Reflow: a long label wraps inside the button, no horizontal scrolling at 320 CSS px (1.4.10).

## WCAG SCs covered

- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: the pressed state is a filled tile and a changed icon or label colour, measured by `theme:check`.
- 2.1.1 Keyboard: native `<button>`, Enter and Space (e2e rows above).
- 2.4.3 Focus Order, 2.4.7 Focus Visible: native Tab order, `data-focus-visible`.
- 2.5.3 Label in Name: the visible label is the name.
- 2.5.8 Target Size (Minimum): consumer and default theme.
- 4.1.2 Name, Role, Value: role `button`, `aria-pressed`, `aria-disabled` exposed (`toggle.test.tsx`).

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

- **WebKit not run locally.** The `webkit` and `mobile-safari` Playwright projects need system libraries that aren't installed on the development machine. CI runs them.
- The pressed look in the contrast themes is the same as a primary button at rest (they have no depth there). The context and `aria-pressed` tell them apart (design spec §9, Q16).
