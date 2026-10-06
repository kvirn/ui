# Accessibility contract: ButtonGroup

- **APG pattern:** none of its own. The WAI-ARIA `group` role, for related controls ([Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) uses it to group controls). Outside a toolbar it is layout, and the buttons keep [Button](../button/button.a11y.md)'s pattern.
- **Deviations:** none
- **Native elements used:** `<div>`. `role="group"` only when it has a name.
- **Status:** alpha candidate (Plan 0035). Gates pass, accessibility-reviewer APPROVE (2026-10-04). Manual AT is `pending`.
- **Tests:** `button-group.test.tsx` next to this file. `button-group.stories.tsx` in `apps/storybook/src/components/button-group/`.

A ButtonGroup is a row of related Buttons: the footer of a Card, the actions of a form, or the groups in a [Toolbar](../toolbar/toolbar.a11y.md) (where it is `Toolbar.Group`). It holds no state and handles no keys.

## Roles, states, properties

| Part        | Element / role    | ARIA                              | Notes                                                                                                                                              |
| ----------- | ----------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ButtonGroup | `<div>` → `group` | `aria-label` or `aria-labelledby` | `role="group"` only when it has a name, so a screen reader says "Ärendet, group" as focus enters it. Test: `button-group.test.tsx › role and name` |
|             | without a name    | no role                           | A plain `<div>`: an unnamed Card footer adds no empty group to the accessibility tree                                                              |
|             | in a Toolbar      | name required                     | A dev warning when a group in a `Toolbar.Root` has no name (1.3.1, 4.1.2). Test: `button-group.test.tsx › inside a Toolbar`                        |
|             | `render`          | any element                       | It gets the class and, with a name, the role                                                                                                       |

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
- Keep one primary button per view (design skill). The group doesn't order or style by importance.
- A group that must be one Tab stop with the arrow keys is a Toolbar, not a ButtonGroup.

## Visual / modes

- Focus indicator: each button's own (2.4.7, 2.4.13).
- Target size: each button's own. The default theme keeps 4px between buttons in a toolbar and 12px outside it (2.5.8).
- forced-colors behaviour: the buttons draw their own edges. The group draws none, and the hairline between groups in a toolbar is `GrayText`, decoration only. **There is no `ForcedColors` story: ButtonGroup draws nothing of its own that a mode could change** (the same exemption as Kbd and Announcer). The Toolbar's `ForcedColors` story shows the hairline.
- reduced-motion behaviour: no motion.
- Reflow: outside a toolbar the group stacks at full width below 40rem. In a toolbar it wraps group by group, so there is no horizontal scrolling at 320 CSS px (1.4.10).

## WCAG SCs covered

- 1.3.1 Info and Relationships: the group role and its name say which buttons belong together.
- 2.1.1 Keyboard, 2.4.3 Focus Order: every button is a Tab stop in DOM order (the Tab rows above).
- 4.1.2 Name, Role, Value: `role="group"` with a name.

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

- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. A WebKit run is not automated, and the manual AT matrix is `pending`.
