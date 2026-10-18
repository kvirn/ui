# Accessibility contract: Search results

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<search>`, `<form method="get">`, `<label>`, `<input type="search">`, `<button>`, `<h2>`, `<h3>`, `<ol>`, `<a href>`, `<mark>`, `<nav>` (Pagination).
- **Status:** in progress (plan 0095 T5). A recipe: the story is the code, there is no package code. Reviewer and manual AT are `pending`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `search-results.stories.tsx` (`apps/storybook/src/patterns/search-and-forms/`).

## Roles, states, properties

| Part                                | Element / role                                           | ARIA / state                            | Notes                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `<search>`                          | `search` landmark                                        | `aria-label` distinct from the header's | Around the GET form                                                                                                                          |
| `Field` / `TextInput type="search"` | `<label>` and `<input>`                                  | visible label ("Search for")            | The label is visible, not a placeholder                                                                                                      |
| `Button`                            | `<button>`                                               | named "Search"                          | Submits the form                                                                                                                             |
| Count `Heading`                     | `<h2>`                                                   | none                                    | The count; choose the level for the outline                                                                                                  |
| Filter                              | `<form>` named by its heading, `<fieldset>` / `<legend>` |                                         | `aria-labelledby`; a CheckboxGroup (type), Show results, then the applied filters as a `TagGroup` with Clear all. No Combobox, no Disclosure |
| `List.Root` ordered                 | `<ol>`                                                   | list count announced                    | Each hit: the title as the only link (`h3`), the path and date as text, an excerpt                                                           |
| `<mark>`                            | `<mark>`                                                 | none                                    | The searched word in the excerpt                                                                                                             |
| `Pagination`                        | `<nav>`                                                  | named "Pages" by the library            | Follows a long list                                                                                                                          |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context             | Action                                                                                                                                            | Test           |
| --------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Tab       | on the page         | Moves through the field, Search, the type checkboxes, Show results, the remove buttons and Clear all, then one link for each hit, then Pagination | Keyboard story |
| Shift+Tab | on the page         | The same, backwards                                                                                                                               | Keyboard story |
| Enter     | in the search field | Submits the form (native)                                                                                                                         | Keyboard story |

Nothing is intercepted: native keys only.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed. With JavaScript the results change in place and focus stays where it was.
- Never obscured by: nothing (nothing is sticky).

## Announcements

A client-side count change is said once, politely, through the announcer. Nothing is announced on load, and an empty query is a prompt, not an error.

## Consumer responsibilities

- Give the `search` landmark a name that differs from the header's search.
- Say the count through `useAnnouncer` when results change in the page.
- Offer spelling advice, popular pages and the contact centre when there are no results.
- Choose the heading levels for the page's outline.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 1.3.2, 1.4.1, 1.4.10, 2.4.4, 2.4.6, 3.3.2, 4.1.3.

- 1.3.1 Info and Relationships (A)
- 1.3.2 Meaningful Sequence (A)
- 1.4.1 Use of Color (A)
- 1.4.10 Reflow (AA)
- 2.4.4 Link Purpose (In Context) (A)
- 2.4.6 Headings and Labels (AA)
- 3.3.2 Labels or Instructions (A)
- 4.1.3 Status Messages (AA)

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
