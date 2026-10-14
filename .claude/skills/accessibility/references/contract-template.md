# Accessibility contract: <Component>

- **APG pattern:** <link>
- **Deviations:** none, or the deviation and where it is recorded (`keyboard` key tables for keys, `accessibility/references/apg-patterns.md` for roles and states), approved by the maintainer
- **Native elements used:** …
- **Status:** alpha | beta | stable
- **Tests:** `<name>.test.tsx` next to this file. `<name>.stories.tsx` in `apps/storybook/src/components/<name>/`.

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

| Key                    | Context | Action | Test                  |
| ---------------------- | ------- | ------ | --------------------- |
| Tab                    |         |        | `<name>.test.tsx › …` |
| Shift+Tab              |         |        |                       |
| Enter / Space          |         |        |                       |
| Escape                 |         |        |                       |
| Arrow keys (RTL flips) |         |        |                       |
| Home / End             |         |        |                       |

## Focus management

- Initial focus:
- Trap: yes (modal) / no
- Restore to:
- Never obscured by:

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |

### Read aloud

| State or action | Expected phrase(s) as read aloud | Live region politeness    | Test                  |
| --------------- | -------------------------------- | ------------------------- | --------------------- |
|                 | `button, Menu, not expanded`     | none / polite / assertive | `<name>.test.tsx › …` |

Each row has a named test using `readAloud` or `readAnnouncements` (`@kvirn-ui/testing/read-aloud`). The phrases are the virtual screen reader's approximation, not NVDA or JAWS wording, and it does not prove modality or focus containment; that stays a component test. The manual AT matrix stays `pending`.

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

- none
