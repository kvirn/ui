# Accessibility contract: Case card

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<ul>`, `<li>`, `<h3>`, `<a href>`, `<dl>`, `<time datetime>`, `Badge`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `case-card.stories.tsx` (`apps/storybook/src/patterns/my-pages/`).

## Roles, states, properties

| Part                  | Element / role             | ARIA / state         | Notes                                                     |
| --------------------- | -------------------------- | -------------------- | --------------------------------------------------------- |
| `Grid.Root as="ul"`   | `<ul>`                     | list count announced | One column                                                |
| `Card.Root as="li"`   | `<li>`                     | none                 | One for each case                                         |
| `Heading` with `Link` | `<h3>` with one `<a href>` | none                 | No clickable card; the heading level is the page's choice |
| `Badge`               | `<span>`                   | none, text           | The status word                                           |
| `DefinitionList`      | `<dl>`                     | none                 | Case number, when it was sent, last change                |
| `<time dateTime>`     | `<time>`                   | none                 | Written with `useFormat`                                  |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                                                 | Test           |
| --------- | ----------- | ------------------------------------------------------ | -------------- |
| Tab       | on the page | Moves to one link in each card, in the order on screen | Keyboard story |
| Shift+Tab | on the page | Moves to the previous link                             | Keyboard story |

The links handle no other key. The card is not a stop.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Say status in words and a Badge, never by colour alone.
- When the resident must act, start the text with "Action needed:" and say what.
- Choose the heading level for the page's outline.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 1.4.1, 1.4.10, 2.4.4, 2.4.6.

- 1.3.1 Info and Relationships (A)
- 1.4.1 Use of Color (A)
- 1.4.10 Reflow (AA)
- 2.4.4 Link Purpose (In Context) (A)
- 2.4.6 Headings and Labels (AA)

## AT test record

| AT + browser + OS                       | Agent check | Human check | Result  | Notes |
| --------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**            |             |             |         |       |
| NVDA + Chrome + Windows                 | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)** |             |             |         |       |
| JAWS + Chrome + Windows                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android             | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS              | pending     | pending     | pending |       |

## Known issues

- none
