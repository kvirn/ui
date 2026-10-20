# Accessibility contract: Contact card

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<div>` card, `<h2>`, `<p>`, `<dl>`, `<dt>`, `<dd>`, `<address>`, `<a href="tel:">` and `<a href="mailto:">`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `contact-card.stories.tsx` (`apps/storybook/src/patterns/places-and-contacts/`).

## Roles, states, properties

| Part                      | Element / role | ARIA / state | Notes                                                                             |
| ------------------------- | -------------- | ------------ | --------------------------------------------------------------------------------- |
| `Card.Root` / `Card.Body` | `<div>`        | none         | Not a landmark                                                                    |
| `Heading`                 | `<h2>`         | none         | Names the card; the level is the page's choice                                    |
| `DefinitionList`          | `<dl>`         | none         | Labelled rows such as phone, email, phone hours. A row you leave out is not drawn |
| `Address`                 | `<address>`    | none         | The visiting address                                                              |
| `Link`                    | `<a href>`     | none         | Phone and email values, each with its own `tel:` or `mailto:` `href`              |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                                                                                          | Test           |
| --------- | ----------- | ----------------------------------------------------------------------------------------------- | -------------- |
| Tab       | on the page | Moves to the first link, then each link in order. The card is not a stop; text rows are skipped | Keyboard story |
| Shift+Tab | on the page | Moves to the previous link                                                                      | Keyboard story |

The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- The link text is the number or address itself, so the purpose is clear out of context.
- A phone line that is closed today is said in text; the number stays a link or becomes text, never a dimmed link.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 1.4.10, 2.4.4, 2.4.6, 2.5.8.

- 1.3.1 Info and Relationships (A)
- 1.4.10 Reflow (AA)
- 2.4.4 Link Purpose (In Context) (A)
- 2.4.6 Headings and Labels (AA)
- 2.5.8 Target Size (Minimum) (AA)

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
