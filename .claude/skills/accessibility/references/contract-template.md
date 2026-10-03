# Accessibility contract: <Component>

- **APG pattern:** <link>
- **Deviations:** none, or the deviation and where it is recorded (`keyboard` key tables for keys, `accessibility/references/apg-patterns.md` for roles and states), approved by the maintainer
- **Native elements used:** …
- **Status:** alpha | beta | stable
- **Tests:** `<name>.test.tsx` next to this file. `<name>.stories.tsx` and `<name>.e2e.ts` in `apps/storybook/src/components/<name>/`.

## Roles, states, properties

| Part    | Element / role | ARIA | Notes |
| ------- | -------------- | ---- | ----- |
| Root    |                |      |       |
| Trigger |                |      |       |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. With no focusable part, replace everything below with: This component has no focusable parts and handles no keys. -->

- **Focus strategy:** native | roving tabindex | aria-activedescendant
- **Selection follows focus:** n/a | yes | no (Enter or Space selects)
- **Arrows wrap:** n/a | yes | no
- **Shortcuts:** none

| Key                    | Context | Action | Test                |
| ---------------------- | ------- | ------ | ------------------- |
| Tab                    |         |        | `<name>.e2e.ts › …` |
| Shift+Tab              |         |        |                     |
| Enter / Space          |         |        |                     |
| Escape                 |         |        |                     |
| Arrow keys (RTL flips) |         |        |                     |
| Home / End             |         |        |                     |

## Focus management

- Initial focus:
- Trap: yes (modal) / no
- Restore to:
- Never obscured by:

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |

## Consumer responsibilities

What the consumer must provide, such as a label, a heading level or an error text.

## Visual / modes

- Focus indicator:
- Target size:
- forced-colors behaviour:
- reduced-motion behaviour:

## WCAG SCs covered

…

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

- none
