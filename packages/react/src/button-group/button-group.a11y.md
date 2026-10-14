# Accessibility contract: ButtonGroup

- **APG pattern:** none of its own. The WAI-ARIA `group` role, for related controls ([Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) uses it to group controls). Outside a toolbar it is layout, and the buttons keep [Button](../button/button.a11y.md)'s pattern.
- **Deviations:** none
- **Native elements used:** `<div>`. `role="group"` only when it has a name.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `button-group.test.tsx` next to this file. `button-group.stories.tsx` in `apps/storybook/src/components/button-group/`.

A ButtonGroup is a row of related Buttons: the footer of a Card, the actions of a form, or the groups in a [Toolbar](../toolbar/toolbar.a11y.md) (where it is `Toolbar.Group`). It holds no state and handles no keys.

## Roles, states, properties

| Part        | Element / role    | ARIA                              | Notes                                                                                                                                              |
| ----------- | ----------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ButtonGroup | `<div>` → `group` | `aria-label` or `aria-labelledby` | `role="group"` only when it has a name, so a screen reader says "Ärendet, group" as focus enters it. Test: `button-group.test.tsx › role and name` |
|             | without a name    | no role                           | A plain `<div>`: an unnamed Card footer adds no empty group to the accessibility tree                                                              |
|             | in a Toolbar      | name required                     | A dev warning when a group in a `Toolbar.Root` has no name (1.3.1, 4.1.2). Test: `button-group.test.tsx › inside a Toolbar`                        |
|             | `className`       | add `kv-button-group--attached`   | Joins the buttons into one strip. Look only: no role, ARIA or key changes. Test: `button-group.test.tsx › attached`                                |

`useButtonGroup({ isNamed })` gives the same `groupProps` for your own element.

## Keyboard

This component has no focusable parts and handles no keys.

The group is not a Tab stop, and it has no `tabindex`. Its buttons are Buttons: each is its own Tab stop, in DOM order, and [Button's contract](../button/button.a11y.md) owns their keys. Inside a Toolbar, the toolbar's contract owns them.

| Key       | Context        | Action                                                       | Test                                                                                                                      |
| --------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Tab       | before a group | Moves focus to its first button. Each button is one Tab stop | `button-group.test.tsx › Tab and Shift+Tab move through its buttons in DOM order, one stop each, and the group adds none` |
| Shift+Tab | in a group     | Moves focus to the previous button, and on out of the group  | `button-group.test.tsx › Tab and Shift+Tab move through its buttons in DOM order, one stop each, and the group adds none` |

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: ButtonGroup renders no overlay.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

ButtonGroup has no strings of its own: its name is the consumer's `aria-label` or `aria-labelledby`.

## Consumer responsibilities

- In a Toolbar, always name the group, from your translations (`aria-label`) or by pointing `aria-labelledby` at visible text. A name that repeats the toolbar's adds nothing: say what the buttons are ("Textstil"), not "Grupp".
- Outside a toolbar a name is optional. A group is worth naming when the buttons need a shared context that their own labels don't give. A Card footer that wants it uses `aria-labelledby` pointing at the card's heading.
- Keep one main (primary) button per view. The group doesn't order or style by importance.
- A group that must be one Tab stop with the arrow keys is a Toolbar, not a ButtonGroup.

## Visual / modes

- Focus indicator: each button's own (2.4.7 Focus Visible (AA); 2.4.13 Focus Appearance (AAA)). In an attached group the focused button is raised above its neighbours, and a halo in the page colour fills the gap between the ring and the button, so the ring never sits on a neighbouring pressed fill (in forced colours the ring uses the system's text colour). Two pressed buttons in a row keep a divider between them. Test: `button-group.stories.tsx › AttachedFocusNextToPressed`, `AttachedTwoPressed`.
- Target size: each button's own. The default theme keeps a small gap between buttons: smaller in a spaced toolbar group than outside a toolbar. An attached group has no gap: each button keeps its own size, and the borders only overlap (2.5.8 Target Size (Minimum) (AA)).
- forced-colors behaviour: the buttons draw their own edges. The group draws none, and the thin line between groups in a toolbar uses the system's disabled-text colour and is decoration only. The shared edges of an attached group are the buttons' own edges in the system's button-text colour (a pressed toggle uses the system's highlight colour). Test: `button-group.stories.tsx › AttachedForcedColors`. The Toolbar's `ForcedColors` story shows the thin line.
- reduced-motion behaviour: no motion.
- Reflow: an attached group never stacks or wraps, and a button wraps its own label (1.4.10). A spaced group outside a toolbar stacks its buttons at full width below 40rem. In a toolbar the groups wrap one by one, so there is no horizontal scrolling at 320 CSS px (1.4.10).

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): the group role and its name say which buttons belong together.
- 2.1.1 Keyboard (A), 2.4.3 Focus Order (A): every button is a Tab stop in DOM order (the Tab rows above).
- 4.1.2 Name, Role, Value (A): `role="group"` with a name.

## AT test record

| AT + browser + OS                        | Agent check | Human check | Result  | Notes |
| ---------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**             |             |             |         |       |
| Windows Contrast Themes + Edge           | pending     | pending     | pending |       |
| Keyboard only / 400% zoom / 320px reflow | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS               | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android              | pending     | pending     | pending |       |
| NVDA + Chrome + Windows                  | pending     | pending     | pending |       |
| NVDA + Firefox + Windows                 | pending     | pending     | pending |       |
| Narrator + Edge + Windows                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)**  |             |             |         |       |
| JAWS + Chrome + Windows                  | pending     | pending     | pending |       |
| Dragon / Voice Control                   | pending     | pending     | pending |       |

## Known issues

- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. A WebKit run is not automated, and the manual AT matrix is `pending`.
