# Accessibility contract: Button

- **APG pattern:** [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- **Deviations:** none
- **Native elements used:** `<button>`. Activation, the Tab stop and form submission are the browser's own.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `button.test.tsx` next to this file. `button.stories.tsx` in `apps/storybook/src/components/button/`.

A Button performs an action. Navigation is a Link. `Button` defaults to `type="button"`, so it never submits a form by accident. A disabled button can stay focusable (`focusableWhenDisabled`), so keyboard and screen-reader users can still find it and read why it's disabled.

## Roles, states, properties

| Part   | Element / role         | ARIA                                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------ | ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button | `<button>` → `button`  | none by default                                 | `type="button"` unless `type` is given. Name from its content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|        | disabled               | native `disabled`                               | Not focusable, not activatable. `data-disabled`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|        | disabled and focusable | `aria-disabled="true"`, no `disabled` attribute | Stays in the Tab order. Click, Enter, Space and implicit form submission are blocked: the `onClick` is not called, and the default (form submission) is prevented. `data-disabled`. `aria-disabled` can't be passed directly: it's set only through `disabled` with `focusableWhenDisabled`, or through `busy`                                                                                                                                                                                                                                                                                                                           |
|        | busy                   | `aria-disabled="true"`, no `disabled` attribute | The action is running (`busy`). Stays in the Tab order and keeps focus when `busy` turns on (2.4.3). Click, Enter, Space and implicit submission are blocked like a focusable disabled button. `data-busy`, no `data-disabled`. The name never changes (2.5.3). No `aria-busy`. `disabled` wins when both are set. While busy a decorative `<span class="kv-spinner" aria-hidden="true">` is the first child (it shows at once, and it loops while busy, resting under reduced motion: see the 2.2.2 point under What you need to do). The Button announces nothing: pair it with a `Progress` beside it, without a `Progress.Indicator` |
|        | keyboard focus         | none                                            | `data-focus-visible` while the button matches `:focus-visible`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|        | no accessible name     | –                                               | A dev warning when the button has no `aria-label`, `aria-labelledby`, `title` or `<label>`, and no content outside `aria-hidden`: an icon-only button with only a decorative `Icon` (4.1.2)                                                                                                                                                                                                                                                                                                                                                                                                                                              |

`useButton` gives the same `buttonProps` for your own `<button>`. Pass your click handler as `useButton({ onClick })`, so it is blocked while disabled.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

A native `<button>`: one Tab stop, in DOM order, with no `tabindex`. Enter and Space are native.

| Key       | Context                          | Action                                                                                               | Test                                                                                                            |
| --------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Tab       | Button                           | Moves focus to the button                                                                            | `button.test.tsx › keyboard › Tab moves focus to the button`                                                    |
| Shift+Tab | Button                           | Moves focus to the previous focusable element, and off the button                                    | `button.test.tsx › keyboard › Shift+Tab moves focus off the button`                                             |
| Tab       | Disabled button                  | Skips the button                                                                                     | `button.test.tsx › disabled › is natively disabled, marked with data-disabled and skipped by Tab`               |
| Tab       | Focusable disabled button        | Moves focus to the button, which is announced as unavailable                                         | `button.test.tsx › focusable when disabled › uses aria-disabled instead of disabled and stays in the Tab order` |
| Enter     | Button                           | Activates. Focus stays on the button                                                                 | `button.test.tsx › rendering › Enter and Space activate the button and keep focus on it`                        |
| Enter     | Focusable disabled button        | Blocked. Focus stays on the button                                                                   | `button.test.tsx › focusable when disabled › click, Enter and Space call no handler, and focus stays`           |
| Space     | Button                           | Activates on key up, not on key down. Focus stays on the button                                      | `button.test.tsx › keyboard › Space activates the button on key up`                                             |
| Space     | Focusable disabled button        | Blocked. Focus stays on the button                                                                   | `button.test.tsx › focusable when disabled › click, Enter and Space call no handler, and focus stays`           |
| Enter     | Submit button in a form          | Submits the form                                                                                     | `button.test.tsx › keyboard › Enter on a submit button submits the form`                                        |
| Enter     | Default button in a form         | Activates the button without submitting the form (`type="button"`)                                   | `button.test.tsx › keyboard › Enter on a default button does not submit the form`                               |
| Tab       | Busy button                      | Moves focus to the button, which is read as unavailable                                              | `button.test.tsx › busy › Tab lands on a busy button`                                                           |
| Enter     | Busy button                      | Blocked: no handler, no submit. Focus stays on the button                                            | `button.test.tsx › busy › click, Enter and Space call no handler, and focus stays`                              |
| Space     | Busy button                      | Blocked: no handler, no submit. Focus stays on the button                                            | `button.test.tsx › busy › click, Enter and Space call no handler, and focus stays`                              |
| –         | `busy` turns on while focused    | Focus stays on the button                                                                            | `button.test.tsx › busy › focus stays on the button when busy turns on and off`                                 |
| –         | Busy submit, implicit submission | Blocked, like a click                                                                                | `button.test.tsx › busy › a busy submit button submits nothing, not even by implicit submission`                |
| –         | Pointer                          | A click on a disabled button, focusable or not, calls no handler                                     | `button.test.tsx › disabled › …`, `button.test.tsx › focusable when disabled › …`                               |
| –         | Form, implicit submission        | Enter in a text field doesn't submit through a focusable disabled submit                             | `button.test.tsx › focusable when disabled › blocks implicit submission from a text field`                      |
| –         | Handler while disabled           | A focusable disabled button blocks the `onClick` prop on click, Enter, Space and implicit submission | `button.test.tsx › handlers on a focusable disabled button › …`                                                 |

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
- When a button is disabled, tell users why in text near it, and link that text with `aria-describedby` if the button is focusable. Prefer not disabling at all: let the user submit and show the errors (advice from the GOV.UK Design System; 3.3.1 Error Identification).
- Pass your click handler to `Button` or to `useButton({ onClick })`. Don't merge your own `onClick` on top of `buttonProps`: it wouldn't be blocked while disabled.
- Disable a button that may have focus with `focusableWhenDisabled`. A natively disabled button loses focus, and focus drops to `body` (2.4.3). This matters most for a button that disables itself when pressed.
- Style `[data-disabled]` and `[data-focus-visible]` (or `:focus-visible`). Never remove the focus ring without a replacement.
- **2.2.2 Pause, Stop, Hide (A).** The indicators (spinner, bar sheen, busy Button, job Toast, FileUpload track, Table busy sweep) move for as long as the wait lasts, which can be more than 5 s. The theme honours `prefers-reduced-motion: reduce` and shows a still shape, but that setting alone is not a control on the page. An indicator that can keep moving for more than 5 seconds alongside other content needs a visible control on the page that stops or hides it. One that is the only content during a wait where nothing else can be done is exempt. The library ships no such control, so the app offers its own and applies the CSS that stops the indicators. [Moving indicators and WCAG 2.2.2](/foundation/theming#moving-indicators). The Progress beside the button carries the wait.

## Visual / modes

- Focus indicator: headless. The browser's native ring by default. The default theme restyles it to at least 2px at 3:1 (2.4.7 Focus Visible, level AA; 2.4.13 Focus Appearance, level AAA). The ring's contrast against its surroundings is checked in every theme.
- Target size: headless. The default theme makes buttons at least 24 × 24 CSS px (2.5.8), in both densities, and a story asserts that threshold.
- forced-colors behaviour: a native `<button>`, so the system's `ButtonText` / `ButtonFace` apply. The disabled state isn't conveyed only by colour in the default theme: it has a dashed edge (1.4.1). The forced-colours sweep checks that every button keeps a visible edge and shows a focus indicator when it has focus (1.4.11).
- Compact (`kv-button--compact`): at least 24 × 24 CSS px at every width, so it meets 2.5.8 only (not the 44px of the AAA target size). It is shorter on wide screens (from 64rem) and taller on narrow ones, where a touch is likelier. A story asserts the 24px threshold.
- Link look (`kv-button--link`): at least 24px tall at every width (2.5.8), the normal focus ring (2.4.7), underlined on hover only. Disabled is `text-muted` with a dashed underline as the non-colour cue (1.4.1); on a filled top bar it is the bar's on-colour with the dashed underline. In forced colours it takes the system link colour, and the forced-colours sweep checks its edge and focus indicator like any other button. A story asserts the 24px threshold.
- reduced-motion behaviour: the button itself has no motion. The spinner of a busy button rests under reduced motion, and the reduced-motion sweep checks that no animation keeps looping (2.3.3).
- Reflow and text spacing: the reflow sweep runs every story at 320 CSS px and fails on horizontal overflow (1.4.10 Reflow, AA). The text-spacing sweep applies the 1.4.12 spacing and fails when a box clips its text.

## WCAG SCs covered

- 2.1.1 Keyboard (A): native `<button>`, Enter and Space (Keyboard rows above).
- 2.4.3 Focus Order (A), 2.4.7 Focus Visible (AA): native Tab order, `data-focus-visible`.
- 2.5.3 Label in Name (A): while busy, the name stays the visible text.
- 2.5.8 Target Size (Minimum) (AA): the default theme makes buttons at least 24 × 24 CSS px. Keep that if you restyle.
- 3.2.2 On Input (A): a Button never sends a form unless you give it `type="submit"`, so a stray button inside a form doesn't send it.
- 4.1.2 Name, Role, Value (A): role `button`, name from content, `disabled` / `aria-disabled` exposed (`button.test.tsx`).

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                 |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                       |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | button.stories.tsx, every story, 4 themes                                                                             |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `button.test.tsx` (axe and role, name and state): `uses aria-disabled instead of disabled and stays in the Tab order` |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 18 rows, each names a test in `button.test.tsx`                                                                       |
| Focus order and management                                                 | pass        | n/a         | pass    | `button.test.tsx`: `Enter and Space activate the button and keep focus on it`                                         |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI         |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                       |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                       |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                       |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                       |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                       |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                       |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                       |

### What to check

With a screen reader and the keyboard, try:

- Tab to the button: the focus ring shows, and the name and "button" are read.
- Press Enter, then Space. Each runs the action once, and focus stays on the button.
- A focusable disabled button is reached and read as unavailable. Enter and Space do nothing.
- A busy button keeps focus and its name. Presses do nothing.
- An icon-only button reads its `aria-label`.

## Known issues

- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. WebKit is not covered by the automated tests, so check Safari with your own users and assistive technology. Safari doesn't focus buttons on click, which doesn't affect this contract.
