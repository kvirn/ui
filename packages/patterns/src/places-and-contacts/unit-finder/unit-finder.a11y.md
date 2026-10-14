# Accessibility contract: Unit finder

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<form>`, `<select>` (native Listbox), `<fieldset>`/`<legend>` (CheckboxGroup), `<input type="checkbox">`, `<button>`, `<ul>`, `<h2>`, `<h3>`, `<a href>`, `<address>`, `<nav>` (Pagination).
- **Status:** in progress (plan 0095 T5). A recipe: the story is the code, there is no package code. Reviewer and manual AT are `pending`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `unit-finder.stories.tsx` (`apps/storybook/src/patterns/places-and-contacts/`).

## Roles, states, properties

| Part                                     | Element / role                | ARIA / state                       | Notes                                                        |
| ---------------------------------------- | ----------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Filter `form`                            | `<form>` named by the heading | `aria-labelledby`                  | Built like the Filter recipe                                 |
| `Listbox.Root native="always"`           | `<select>` in its `Field`     | label via `Field.Label`            | The area; a plain select, no popup                           |
| `CheckboxGroup`                          | `<fieldset>` / `<legend>`     | group name from the legend         | Language and opening hours                                   |
| `TagGroup` / `Tag` / `TagGroup.ClearAll` | list of remove `<button>`s    | each remove button names its tag   | The applied filters, with Clear all                          |
| `Disclosure`                             | `<button>` and panel          | `aria-expanded`                    | Narrow stories only: below 64rem the form is in it           |
| Count `Heading`, `List`                  | `<h2>`, `<ul>`                | none                               | The count is a heading; each result is an `h3` with one link |
| `Address`, `Pagination`                  | `<address>`, `<nav>`          | `nav` named "Pages" by the library | Pagination links are real URLs                               |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context                         | Action                                                                                                                                                                                                | Test           |
| ------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Tab           | on the page                     | Moves through the Disclosure trigger (narrow stories only), the area select, the checkboxes, Show results, the remove buttons and Clear all, then the result links, then Pagination, in reading order | Keyboard story |
| Shift+Tab     | on the page                     | The same, backwards                                                                                                                                                                                   | Keyboard story |
| Space         | on a checkbox                   | Toggles it (native)                                                                                                                                                                                   | Keyboard story |
| Enter / Space | on a remove button or Clear all | Removes the filter or all of them; focus moves to the next remove button, or the tag group label when none is left                                                                                    | Keyboard story |

Each control keeps its native keys; nothing is intercepted. The select has no popup of its own to build.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed. With JavaScript the results change in place and focus stays where it was.
- Never obscured by: nothing (nothing is sticky).
- A removed tag moves focus to the next remove button, or to the tag group's label when it was the last (never `body`).

## Announcements

Each change is said once, politely, through the provider's announcer: the count for a tick or a choice, the removal and the count for a tag, "All filters cleared" and the count for Clear all. Nothing is announced on load. No results keeps the applied row and Clear all in view.

## Consumer responsibilities

- Update the results and say the count through `useAnnouncer`; the pattern holds no search state.
- Make Pagination links real URLs, and keep the filters in the URL for the no-JS "Show results" submit.
- Choose the heading levels for the page's outline.
- No map, no "near me" and no location request: the area is the user's choice.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 1.3.2, 1.4.10, 2.1.1, 2.4.3, 2.4.6, 3.3.2, 4.1.2, 4.1.3.

- 1.3.1 Info and Relationships (A)
- 1.3.2 Meaningful Sequence (A)
- 1.4.10 Reflow (AA)
- 2.1.1 Keyboard (A)
- 2.4.3 Focus Order (A)
- 2.4.6 Headings and Labels (AA)
- 3.3.2 Labels or Instructions (A)
- 4.1.2 Name, Role, Value (A)
- 4.1.3 Status Messages (AA)

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

- Disclosure cannot be open from 64rem and closed below, so the narrow stories wrap the form in it always.
