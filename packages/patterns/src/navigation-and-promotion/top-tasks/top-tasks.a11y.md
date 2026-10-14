# Accessibility contract: Top tasks

- **Scope:** The tasks residents do most, as one list of links. A recipe: a heading and a Grid rendered as a list.
- **APG pattern:** none: native elements: [Grid](../../../../react/src/grid/grid.a11y.md) as a list and [Link](../../../../react/src/link/link.a11y.md).
- **Deviations:** none
- **Native elements used:** `<h2>`, `<ul>`, `<li>`, `<a href>`.
- **Status:** in progress (plan 0095 T5). Reviewer and manual AT are `pending`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `top-tasks.stories.tsx` (`apps/storybook/src/patterns/navigation-and-promotion/`).

## Roles, states, properties

| Part                | Element / role | ARIA / state | Notes                                               |
| ------------------- | -------------- | ------------ | --------------------------------------------------- |
| `Heading`           | `<h1>`–`<h6>`  | none         | Level chosen for the page outline; no skipped level |
| `Grid.Root as="ul"` | `<ul>`         | none         | The count is announced; not a `nav` landmark        |
| `Grid.Item as="li"` | `<li>`         | none         | One per task                                        |
| `Link`              | `<a href>`     | none         | A verb phrase that makes sense alone                |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                       | Test                                 |
| --------- | ----------- | ---------------------------- | ------------------------------------ |
| Tab       | in the list | Every task link in DOM order | Native; the shipped part's own tests |
| Shift+Tab | in the list | The reverse order            | Native; the shipped part's own tests |

The `Keyboard` story shows the keys. The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Six to eight tasks; more is a menu.
- Each link text makes sense alone.
- Cell text wraps and never truncates (`LongFinnish`).

## Visual / modes

- Focus indicator: the token ring on every focusable part.
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 1.4.10 Reflow (AA)
- 2.4.4 Link Purpose (In Context) (A)
- 2.4.6 Headings and Labels (AA)

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
