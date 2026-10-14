# Accessibility contract: News list

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<h2>`, `<ul>`, `<li>`, `<h3>`, `<a href>`, `<time datetime>`, `<img alt="">`, `<nav>` (Pagination).
- **Status:** in progress (plan 0095 T5). A recipe: the story is the code, there is no package code. Reviewer and manual AT are `pending`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `news-list.stories.tsx` (`apps/storybook/src/patterns/news-events-and-notices/`).

## Roles, states, properties

| Part                      | Element / role             | ARIA / state                 | Notes                                                |
| ------------------------- | -------------------------- | ---------------------------- | ---------------------------------------------------- |
| `Heading`                 | `<h2>`                     | none                         | The list's heading; choose the level for the outline |
| `List.Root`               | `<ul>`                     | list count announced         | One column at `45rem`, not a card grid               |
| Item `Heading` and `Link` | `<h3>` with one `<a href>` | none                         | The only link in the item                            |
| `<time dateTime>`         | `<time>`                   | none                         | Written with `useFormat`, never only "2 days ago"    |
| Image                     | `<img alt="">`             | none                         | Optional, decorative, last in the DOM                |
| `Pagination`              | `<nav>`                    | named "Pages" by the library | Follows a long list                                  |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                                              | Test           |
| --------- | ----------- | --------------------------------------------------- | -------------- |
| Tab       | on the page | Moves to each item's link in order, then Pagination | Keyboard story |
| Shift+Tab | on the page | Moves to the previous link                          | Keyboard story |

The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Write the date with `useFormat` and keep a one-sentence summary.
- Make each title say what the item is about, since it is the link text.
- Say so in text when the list is empty.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.1.1, 1.3.1, 1.3.2, 1.4.10, 2.4.4, 2.4.6.

- 1.1.1 Non-text Content (A)
- 1.3.1 Info and Relationships (A)
- 1.3.2 Meaningful Sequence (A)
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
