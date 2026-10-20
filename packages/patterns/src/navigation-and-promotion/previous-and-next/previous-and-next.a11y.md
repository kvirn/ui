# Accessibility contract: Previous and next

- **Scope:** Links to the previous and next page of a sequence. A recipe: a Pagination with Previous and Next and no page numbers.
- **APG pattern:** none: native elements: [Pagination](../../../../react/src/pagination/pagination.a11y.md).
- **Deviations:** none
- **Native elements used:** `<nav>`, `<ul>`, `<li>`, `<a href>`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `previous-and-next.stories.tsx` (`apps/storybook/src/patterns/navigation-and-promotion/`).

## Roles, states, properties

| Part                  | Element / role         | ARIA / state | Notes                                                                      |
| --------------------- | ---------------------- | ------------ | -------------------------------------------------------------------------- |
| `Pagination.Root`     | `<nav>` with a `label` | none         | The label says what the sequence is, because the page has other navigation |
| `Pagination.Previous` | `<a href>`             | none         | Text names the page it goes to; first in the DOM                           |
| `Pagination.Next`     | `<a href>`             | none         | Text names the page it goes to; after Previous                             |
| First or last page    | one link only          | none         | The other link is left out, not dimmed (`First`, `Last`)                   |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context           | Action                                        | Test                                 |
| --------- | ----------------- | --------------------------------------------- | ------------------------------------ |
| Tab       | in the navigation | Previous, then Next; only the one that exists | Native; the shipped part's own tests |
| Shift+Tab | in the navigation | The reverse order                             | Native; the shipped part's own tests |

The `Keyboard` story shows the keys. The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Name the target page in each link text.
- Give the `nav` a `label` that says what the sequence is.
- Leave out the link that has nowhere to go.

## Visual / modes

- Focus indicator: the token ring on every focusable part.
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 1.3.2 Meaningful Sequence (A)
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
