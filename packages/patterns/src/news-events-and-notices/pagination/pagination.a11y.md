# Accessibility contract: Pagination

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<nav>`, `<ul>`, `<li>`, `<a href>`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `pagination.stories.tsx` (`apps/storybook/src/patterns/news-events-and-notices/`).

## Roles, states, properties

| Part                            | Element / role | ARIA / state                                                    | Notes                                                                                |
| ------------------------------- | -------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Pagination.Root`               | `<nav>`        | named "Pages" by the library                                    | Distinct from the main navigation                                                    |
| `Pagination.Link`               | `<a href>`     | `aria-label` "Page N", `aria-current="page"` on the current one | Every page is a real URL                                                             |
| `Pagination.Previous` / `.Next` | `<a href>`     | none                                                            | Left out, not disabled, on the first and last page                                   |
| `Pagination.Ellipsis`           | `<li>`         | none                                                            | One for each gap                                                                     |
| `Pagination.Status`             | text           | none                                                            | Always rendered: below `40rem` the numbers collapse to Previous, the status and Next |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                                                                                                 | Test           |
| --------- | ----------- | ------------------------------------------------------------------------------------------------------ | -------------- |
| Tab       | on the page | Moves to each page link in order, the current page included; the ellipsis and the status are not stops | Keyboard story |
| Shift+Tab | on the page | Moves to the previous link                                                                             | Keyboard story |

The links handle no other key.

## Focus management

- Initial focus: not moved. The component never moves focus.
- Trap: no.
- Restore to: not needed. The app's route handling moves focus after a client-side navigation.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None from the component. After a client-side navigation the app says the new page.

## Consumer responsibilities

- Make every page a real URL, so Back, a bookmark and "open in new tab" work.
- Move focus and announce the change after a client-side navigation.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 2.4.3, 2.4.4, 2.5.8.

- 1.3.1 Info and Relationships (A)
- 2.4.3 Focus Order (A)
- 2.4.4 Link Purpose (In Context) (A)
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
