# Accessibility contract: Filter

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<form>`, `<fieldset>`/`<legend>`, `<input type="checkbox">`, `<input role="combobox">` (Combobox), `<select>` (native Listbox), `<button>`, `<ul>`.
- **Status:** in progress (plan 0095 T5). A recipe: the story is the code, there is no package code. Reviewer and manual AT are `pending`.
- **Tests:** a recipe adds no behaviour of its own, so the Keyboard rows name no test of their own: each part's keys are proved by its component's tests. Axe runs on every story in `filter.stories.tsx` (`apps/storybook/src/patterns/search-and-forms/`).

## Roles, states, properties

| Part                            | Element / role                  | ARIA / state               | Notes                                                                                                                     |
| ------------------------------- | ------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Filter `form`                   | `<form>` named by the heading   | `aria-labelledby`          | Reading order is Tab order                                                                                                |
| `CheckboxGroup`                 | `<fieldset>` / `<legend>`       | group name from the legend | The type                                                                                                                  |
| `Combobox` (multiple)           | `combobox`, `listbox`, `option` | APG combobox states        | The year, a long facet                                                                                                    |
| `Listbox.Root native="always"`  | `<select>` in its `Field`       | label via `Field.Label`    | The sort                                                                                                                  |
| `TagGroup` / `Tag`              | remove `<button>`s              | each names its tag         | The applied filters, with Clear all                                                                                       |
| Results `List`, count `Heading` | `<ol>`, `<h2>`                  | `aria-busy` while updating | While loading, a visible "Updating results" and `aria-busy` on the list; when to show it (over a second) is the app's     |
| `Alert.Danger`                  | `<div>`                         | none                       | A failed update, with Try again; the old results stay. Not a live region: the failure is announced through the announcer. |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key                         | Context                         | Action                                                                                                                                                                                                                                                                                        | Test           |
| --------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Tab                         | on the page                     | Moves through the Disclosure trigger (narrow stories only), the checkboxes, the year combobox (its chosen years show once, as applied tags, so there is no second set of remove buttons), the sort select, Show results, the remove buttons and Clear all, then the results, in reading order | Keyboard story |
| Shift+Tab                   | on the page                     | The same, backwards                                                                                                                                                                                                                                                                           | Keyboard story |
| Space                       | on a checkbox                   | Toggles it (native)                                                                                                                                                                                                                                                                           | Keyboard story |
| Arrow keys / Enter / Escape | in the year combobox            | As the Combobox contract: open and move through options, choose, close                                                                                                                                                                                                                        | Keyboard story |
| Enter / Space               | on a remove button or Clear all | Removes the filter or all of them                                                                                                                                                                                                                                                             | Keyboard story |

The parts keep their own keys (Combobox, Tag); the recipe adds none.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed. With JavaScript the results change in place and focus stays where it was.
- Never obscured by: nothing (nothing is sticky).
- A removed tag moves focus to the next remove button, or the tag group's label when none is left (never `body`).

## Announcements

Each change is said once, politely, through the provider's announcer: the count for a tick, the removal and the count for a tag, "All filters cleared" and the count for Clear all (the tag group's own removal message is off, since the live region keeps only the last). The message comes after the results have arrived, never before. A failed update announces `filters.loadFailed` instead of the count, so nobody hears a new count for a list that did not change. "Updating results" is plain text, not a live region, because the count is announced after. Nothing is announced on load.

## Consumer responsibilities

- Change the results and say the count through `useAnnouncer`; the recipe holds no search state.
- Keep the filters in the URL so the no-JS "Show results" submit works.
- Show "Updating results" when loading takes over a second, and a visible error with Try again when it fails.

## Visual / modes

- Focus indicator: the token ring on every link, button and control.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: borders and the status words stay; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the layout follows the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing scrolls sideways.

## WCAG SCs covered

1.3.1, 1.3.2, 1.4.10, 2.1.1, 2.4.3, 2.4.6, 3.2.2, 3.3.2, 4.1.2, 4.1.3.

- 1.3.1 Info and Relationships (A)
- 1.3.2 Meaningful Sequence (A)
- 1.4.10 Reflow (AA)
- 2.1.1 Keyboard (A)
- 2.4.3 Focus Order (A)
- 2.4.6 Headings and Labels (AA)
- 3.2.2 On Input (A)
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
