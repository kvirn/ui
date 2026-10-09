# Accessibility contract: ErrorSummary

- **APG pattern:** none. It applies the GOV.UK [Error summary](https://design-system.service.gov.uk/components/error-summary/) pattern and WCAG technique [G139](https://www.w3.org/WAI/WCAG22/Techniques/general/G139) (create a mechanism that allows users to jump to errors), with [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22)'s alternative (a focus move) in place of a live region.
- **Deviations:** none. It is not `role="alert"`: the focus move is the announcement (Plan 0063, decision 1).
- **Native elements used:** `<ul>`, `<li>`, `<a href="#id">`, `<h2>` (from `Alert.Title`; `as` picks `h3` to `h6`), and `<ol>` with `as` on the List.
- **Status:** alpha candidate (Plan 0063). Gates pending, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `error-summary.test.tsx` next to this file. `error-summary.stories.tsx` in `apps/storybook/src/components/error-summary/`.

An [Alert.Danger](../alert/alert.a11y.md) at the top of a form, shown after a failed submit, that lists every problem as a link to its field. Focus moves to it once, so the screen reader reads it and a keyboard user starts at the list.

## Roles, states, properties

| Part  | Element / role                   | ARIA                               | Notes                                                                                                                                        |
| ----- | -------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Root  | `<div>` (Alert.Danger) → `group` | `aria-labelledby` = the Title's id | `tabindex="-1"`: focusable by script, not a Tab stop. No `aria-live`, no `role="alert"`. Icon, status word and colour come from Alert.Danger |
| Title | `<h2>` (Alert.Title) → `heading` | `id`                               | Default text `errorSummary.title`. The status word ("Error:") comes first                                                                    |
| List  | `<ul>` → `list`                  | `role="list"`                      | One item per problem. `role="list"` is explicit: the theme draws no markers, and Safari would drop the list semantics without it             |
| Item  | `<li>` → `listitem`              | none                               |                                                                                                                                              |
| Link  | `<a href="#controlId">` → `link` | none                               | Its text is the field's error text, so it reads the same as the message under the field                                                      |

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1, 4.1.2). `as` is a string, so it works from a Server Component.

| Part       | `as`                                   | Why                                                                                                                          |
| ---------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Root       | none                                   | The Root is an `Alert.Danger`, a named group that takes focus                                                                |
| Title      | `h2` (default), `h3`, `h4`, `h5`, `h6` | The level the page's outline needs. No `h1` (the page's title) and no `p` (the summary needs a heading for the group's name) |
| List       | `ul` (default), `ol`                   | A list of problems, optionally numbered                                                                                      |
| Item, Link | none                                   | `<li>` and `<a href="#id">`: the link must stay a link (4.1.2)                                                               |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

The summary is not a widget. Focus is moved to it by script, once per submit; then the links are native Tab stops in DOM order. A link's activation focuses the field. The component never intercepts a key.

| Key       | Context               | Action                                                                                   | Test                                                                                                    |
| --------- | --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Tab       | the summary has focus | Moves to the first link in the list                                                      | `error-summary.test.tsx › keyboard › Tab from the summary moves to the first link`                      |
| Tab       | on a link             | Moves to the next link, and after the last one on into the page (the form's first field) | `error-summary.test.tsx › keyboard › Tab moves through the links and then out of the summary`           |
| Shift+Tab | on the first link     | Moves to the stop before the summary: the summary itself is not a Tab stop               | `error-summary.test.tsx › keyboard › Shift+Tab from the first link goes to the stop before the summary` |
| Enter     | on a link             | Moves focus to the field and scrolls its label into view                                 | `error-summary.test.tsx › keyboard › Enter on a link moves focus to its field`                          |

## Focus management

- Initial focus: on mount, and each time `focusKey` changes, the summary root takes focus (`focus()` on `tabindex="-1"`). With no `focusKey`, once on mount. It is rendered only while there are errors and never updates while the user types.
- A link: `preventDefault`, `focus({ preventScroll: true })` on the control with that id, then the control's label (`label[for]`) or its fieldset's legend is scrolled into view. Never smooth scrolling. A click with Ctrl, Meta, Shift, Alt or a non-primary button, and a link whose target is missing, are left to the browser (the hash navigation).
- A link whose control can't take focus (hidden, disabled, not focusable): `focus()` leaves `document.activeElement` elsewhere, so the link does not `preventDefault` and the browser's own hash jump runs. A development warning `error-summary-control-unfocusable:<id>` is shown once per id (`error-summary.test.tsx › links › a link whose control cannot take focus is left to the browser and warns once`). After a native jump to a non-focusable target focus can fall to `body`; point the link at the focusable control.
- A group of options: link to the first option's id.
- Trap: no. Restore to: not applicable. After a fix the consumer removes the summary on the next submit; focus then moves to the new one or, with no errors, to where the submit goes.
- Never obscured by: the summary is scrolled into view by `focus()`. Pair it with `scroll-padding-top` for a sticky header and `scroll-padding-bottom` for the on-screen keyboard (2.4.11).
- The ring shows under `:focus-visible` (the theme's `:where([tabindex='-1']:focus-visible)` rule).

## Announcements

None through a live region. The focus move makes the screen reader read the group's name (the Title, with the status word), once. Whether it also reads the content (the list of links) is not assured: screen readers usually read only the name of a focused `role="group"`. That is `pending` the manual AT run. Setting `announce` on the Alert as well would read it twice and is never done.

| Event                 | Message key (i18n)                                      | Politeness |
| --------------------- | ------------------------------------------------------- | ---------- |
| the summary is shown  | `errorSummary.title` (the name, read by the focus move) | n/a: focus |
| `prefixDocumentTitle` | `errorSummary.titlePrefix` (in `document.title`)        | n/a        |

## Consumer responsibilities

- **Render it only after a failed submit,** at the top of `main`, before the step caption and the form, and pass the submit count as `focusKey` so a second failed submit moves focus again.
- **Each Link's `controlId` is the id of the control** (`Field.Root controlId`, the `forms` skill) or, for a group, of its first option. Its text is the same words as the field's error, including what to do (3.3.3).
- **Keep the field's own error** under the control (3.3.1): the summary adds to it.
- **Update `document.title` with `prefixDocumentTitle`** unless a router owns the title, then do it there with `errorSummary.titlePrefix`.
- **Remove the summary** when the form has no errors; never show it while the user types.

## Visual / modes

- Focus indicator: the token ring on the root under `:focus-visible`; links have the Link ring.
- Target size: the links are inline links in a list with the theme's spacing (24px minimum, 2.5.8).
- forced-colors behaviour: the Alert's bar is `CanvasText`-based, the status icon and word still say danger.
- reduced-motion behaviour: scrolling is instant, never smooth.

## WCAG SCs covered

- 3.3.1 Error Identification, 3.3.3 Error Suggestion: each problem is named in text, linked to its field (`links › each link goes to its control id and reads the field error text`).
- 2.4.3 Focus Order: focus moves to the summary on a failed submit and then to the field (`focus › moves focus to the summary on mount`, `› again when focusKey changes`, `› a link moves focus to the field`).
- 4.1.3 Status Messages: met by the focus move, with no live region (`announcements › nothing is said in the Announcer`).
- 1.3.1, 4.1.2: native list and links, a named group. 2.4.2: the prefix on the page title (`document title › prefixes`).
- Axe: no violations with the summary focused (`accessibility › no axe violations with the summary focused`).

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

## Known issues

- none
