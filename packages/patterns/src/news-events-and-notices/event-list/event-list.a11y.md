# Accessibility contract: Event list

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<h2>`, `<ul>`, `<li>`, `<h3>`, `<a href>`, `<dl>`, `<time datetime>`, `Badge`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `event-list.stories.tsx` (`apps/storybook/src/patterns/news-events-and-notices/`).

## Roles, states, properties

| Part                      | Element / role             | ARIA / state         | Notes                                              |
| ------------------------- | -------------------------- | -------------------- | -------------------------------------------------- |
| `Heading`                 | `<h2>`                     | none                 | The list's heading                                 |
| `List.Root`               | `<ul>`                     | list count announced | One event for each item                            |
| Item `Heading` and `Link` | `<h3>` with one `<a href>` | none                 | A cancelled event's title starts with "Cancelled:" |
| `DefinitionList`          | `<dl>`                     | none                 | When, where and cost                               |
| `Badge`                   | `<span>`                   | none, text           | A `danger` Badge repeats "Cancelled" in words      |
| `<time dateTime>`         | `<time>`                   | none                 | Dates and times written with `useFormat`           |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                              | Test           |
| --------- | ----------- | ----------------------------------- | -------------- |
| Tab       | on the page | Moves to each event's link in order | Keyboard story |
| Shift+Tab | on the page | Moves to the previous link          | Keyboard story |

The links handle no other key. A closed or unavailable action is text, so it is not a stop.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Say status in words first: "Cancelled:" in the title, a moved event's new date, a fully booked event in text.
- Make a closed or unavailable action text, never a dimmed link.

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
