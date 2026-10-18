# Accessibility contract: Address and visit

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<h2>`, `<address>`, `<a href>`, `<dl>`, `<dt>`, `<dd>`, `Alert.Warning`.
- **Status:** in progress (plan 0095 T5). A recipe: the story is the code, there is no package code. Reviewer and manual AT are `pending`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `address-and-visit.stories.tsx` (`apps/storybook/src/patterns/places-and-contacts/`).

## Roles, states, properties

| Part             | Element / role | ARIA / state            | Notes                                                                                                                  |
| ---------------- | -------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Heading`        | `<h2>`         | none                    | Names the section                                                                                                      |
| `Address`        | `<address>`    | none                    | The visiting address                                                                                                   |
| `Link`           | `<a href>`     | none                    | Directions: a plain link out to a map service the adopter names. No embed and no third-party request on load           |
| `DefinitionList` | `<dl>`         | none                    | Access facts, each a statement: entrance, parking, hearing loop, lift, bus stop. A fact you cannot confirm is left out |
| `Alert.Warning`  | `<div>`        | none, not a live region | A closed entrance, said before the facts; not announced on load                                                        |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                                      | Test           |
| --------- | ----------- | ------------------------------------------- | -------------- |
| Tab       | on the page | Moves to the directions link (the one stop) | Keyboard story |
| Shift+Tab | on the page | Moves to the previous focusable element     | Keyboard story |

The link handles no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Name the map service in the link text, and say that it opens elsewhere if it does.
- State an access fact as a statement and leave out one you cannot confirm.
- Say a closed entrance in words, never by dimming a link.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 1.4.10, 2.4.4, 2.4.6.

- 1.3.1 Info and Relationships (A)
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
