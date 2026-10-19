# Accessibility contract: Toggle

- **APG pattern:** [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), the toggle button (`aria-pressed`)
- **Deviations:** none
- **Native elements used:** `<button type="button">`. Activation, the Tab stop and the Enter and Space keys are the browser's own.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `toggle.test.tsx` next to this file. `toggle.stories.tsx` in `apps/storybook/src/components/toggle/`.

A Toggle is a Button that is on or off. Use it for a choice with a direct, visible effect on the page: bold text, "show only unread". It is not for an answer in a form (use a Checkbox or a radio group) or a setting that is saved (use a Switch). It builds on Button: everything Button's contract says about `disabled`, `focusableWhenDisabled` and the missing-name warning holds here.

## Roles, states, properties

| Part   | Element / role                      | ARIA                                            | Notes                                                                                                                                                                              |
| ------ | ----------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toggle | `<button type="button">` → `button` | `aria-pressed="false"` or `"true"`              | Always present, so the button is a toggle button even while off. `data-pressed` while on. The name never changes with the state: a screen reader says it is on from `aria-pressed` |
|        | controlled                          | `pressed` + `onPressedChange`                   | Shows the `pressed` it is given and only reports a press. `defaultPressed` starts an uncontrolled toggle on                                                                        |
|        | disabled                            | native `disabled`                               | Not focusable, not activatable. `aria-pressed` and `data-disabled` stay, so a disabled pressed toggle still says it is on                                                          |
|        | disabled and focusable              | `aria-disabled="true"`, no `disabled` attribute | Stays in the Tab order. Click, Enter and Space change nothing and call neither `onPressedChange` nor `onClick`. `focusableWhenDisabled` is Button's                                |
|        | keyboard focus                      | none                                            | `data-focus-visible` while the toggle matches `:focus-visible`                                                                                                                     |
|        | no accessible name                  | –                                               | A dev warning when the only content is hidden from assistive technology, such as a decorative `Icon` (4.1.2).                                                                      |

`useToggle` gives the same `toggleProps` for your own `<button>`. It is `useButton` plus the pressed state, so a disabled toggle blocks activation there too.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

A native `<button>`: one Tab stop, in DOM order, with no `tabindex`. Enter and Space are native, and both switch it. In a Toolbar it is one of the toolbar's items instead: the toolbar's contract owns the keys then.

| Key           | Context                        | Action                                                                                     | Test                                                                                                                           |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Tab           | before the toggle              | Moves focus to the toggle                                                                  | `toggle.test.tsx › Tab moves to the toggle and Shift+Tab moves off it`                                                         |
| Shift+Tab     | on the toggle                  | Moves focus to the previous focusable element, and off the toggle                          | `toggle.test.tsx › Tab moves to the toggle and Shift+Tab moves off it`                                                         |
| Enter / Space | Toggle                         | Switches it on or off: `aria-pressed` changes. The name is the same, and focus stays on it | `toggle.test.tsx › Enter and Space switch it, the name stays and focus stays`                                                  |
| Enter / Space | Toggle, disabled and focusable | Nothing happens. Focus stays on the toggle                                                 | `toggle.test.tsx › a focusable disabled toggle uses aria-disabled, stays in the Tab order, and ignores press, Enter and Space` |
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

- Give the toggle a visible text label, or an `aria-label` from your own translations for an icon-only toggle (4.1.2 Name, Role, Value, A; 2.5.3 Label in Name, A). **The name must not change with the state:** "Show map" stays "Show map" and never becomes "Hide map" when it is on (APG).
- Use a Toggle for a choice with a direct, visible effect. A setting that turns something on or off for good is a Switch (saved at once) or a Checkbox, and an answer in a form is a Checkbox or a radio group.
- With `pressed`, update it in `onPressedChange`, or the toggle never changes.
- A toggle that changes a list or a result (a filter) needs a status message with the result count, such as "12 results", announced through `useAnnouncer` (4.1.3 Status Messages, AA). The press alone tells a screen reader user only that the button is pressed.
- Style `[data-pressed]` and `[aria-pressed='true']`. The pressed state must never be shown by colour alone (1.4.1 Use of Color, A): the default theme fills the button and changes the icon or label colour.

## Visual / modes

- Focus indicator: as Button. The default theme draws a focus ring that is at least 2px at 3:1 (2.4.7 Focus Visible, AA; 2.4.13 Focus Appearance, AAA).
- Target size: as Button, at least 24 × 24 CSS px in the default theme (2.5.8 Target Size (Minimum), AA).
- Pressed (default theme): a solid fill in the primary colour with a light icon or label, flat in a toolbar. The fill reaches 3:1 against its surroundings and the icon 4.5:1 or 3:1 on the fill (1.4.1 Use of Color, A; 1.4.11 Non-text Contrast, AA). The theme's contrast check measures the pairs.
- forced-colors behaviour: pressed uses the system's highlight colours for its fill, text and edge, so it differs from an unpressed button without colour alone (the forced-colours sweep also checks that every toggle keeps a visible boundary and shows a focus indicator when it has focus).
- reduced-motion behaviour: the fill changes instantly.
- Reflow: a long label wraps inside the button. No horizontal scrolling at 320 CSS px (1.4.10 Reflow, AA): the reflow sweep runs every story at 320 CSS px and fails on horizontal overflow.

## WCAG SCs covered

- 1.4.1 Use of Color (A), 1.4.11 Non-text Contrast (AA): the pressed state is a filled tile and a changed icon or label colour, measured by the theme's contrast check.
- 2.1.1 Keyboard (A): native `<button>`, Enter and Space (keyboard rows above).
- 2.4.3 Focus Order (A), 2.4.7 Focus Visible (AA): native Tab order, `data-focus-visible`.
- 2.4.13 Focus Appearance (AAA, not counted toward AA): the default theme's focus ring.
- 2.5.3 Label in Name (A): the visible label is the name.
- 2.5.8 Target Size (Minimum) (AA): consumer and default theme.
- 4.1.2 Name, Role, Value (A): role `button`, `aria-pressed`, `aria-disabled` exposed (`toggle.test.tsx`).

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                      |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | toggle.stories.tsx, every story, 4 themes                                                                            |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | toggle.test.tsx › is a native button with aria-pressed, off by default, and the part classes; expectNoA11yViolations |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 5 rows, each names a test (toggle.test.tsx › Tab moves to the toggle and Shift+Tab moves off it)                     |
| Focus order and management                                                 | pass        | n/a         | pass    | toggle.test.tsx asserts focus (toHaveFocus); first rule: Tab moves to the toggle and Shift+Tab moves off it          |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI        |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                      |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                      |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                      |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                      |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                      |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                      |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                      |

### What to check

With a screen reader and the keyboard, try:

- Tab to the toggle: its name, "toggle button" and the pressed state are read.
- Press Enter, then Space: the state change is read, the name stays the same, and focus stays.
- An icon-only toggle reads its label, not just "button".
- A disabled toggle with a reason (`focusableWhenDisabled`): Tab finds it, it is read as unavailable, the reason is read, and pressing changes nothing.
- A toggle that filters a list: switch it and check that the new result count is read.
- In forced colours or a high-contrast theme, pressed and not pressed differ without relying on colour.

## Known issues

- **Keyboard tests run in Chromium only.** The keyboard rows run in Vitest browser mode on Chromium, not in WebKit. Test in Safari with your own assistive technology.
- The pressed look in the high-contrast themes is the same as a primary button at rest (they have no depth there). The context and `aria-pressed` tell them apart.
