# Accessibility contract: SummaryList

- **APG pattern:** none. A native description list (`<dl>`), the same pattern as GOV.UK's [Summary list](https://design-system.service.gov.uk/components/summary-list/).
- **Deviations:** none.
- **Native elements used:** `<dl>`, `<div>` row groups, `<dt>`, `<dd>` and `<a>` (the Change link).
- **Status:** alpha candidate (Plan 0063). Gates pending, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `summary-list.test.tsx` next to this file. `summary-list.stories.tsx` in `apps/storybook/src/components/summary-list/`.

Rows of a label, a value and optional actions: the answers on a check-your-answers page, a contact card, a case card. It is read-only: a value you can edit is a Field, and the row's action is a link to where it is changed.

## Roles, states, properties

| Part    | Element / role        | ARIA                                              | Notes                                                                                                                                                                               |
| ------- | --------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root    | `<dl>` (no role)      | none                                              | `<div>` rows are allowed inside a `<dl>`, and keep each key with its values                                                                                                         |
| Row     | `<div>`, generic      | none                                              | One key and one or more values. Gives its Key an id for the Change link                                                                                                             |
| Key     | `<dt>` → `term`       | none                                              | The label.                                                                                                                                                                          |
| Value   | `<dd>` → `definition` | none                                              | The answer. Wraps, never truncates                                                                                                                                                  |
| Actions | `<dd>` → `definition` | none                                              | Holds links. A second definition of the same term                                                                                                                                   |
| Change  | `<a>` → `link`        | `aria-labelledby` = its own id, then the Key's id | Visible text is `summaryList.change` ("Change"). The accessible name is "Change" plus the key, so the purpose is clear out of context (2.4.4) and contains the visible text (2.5.3) |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

The list is not a widget. Its only focusable parts are the Change links (and any links you put in a Value), in DOM order. The component adds no Tab stop, no key handler and no `tabindex`.

| Key       | Context          | Action                                                           | Test                                                                                 |
| --------- | ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Tab       | before the list  | Moves focus to the first Change link, skipping the text          | `summary-list.test.tsx › keyboard › Tab moves through the Change links in row order` |
| Tab       | on a Change link | Moves to the next row's Change link, then on into the page       | `summary-list.test.tsx › keyboard › Tab moves through the Change links in row order` |
| Shift+Tab | on a Change link | Moves to the previous row's Change link, then to the stop before | `summary-list.test.tsx › keyboard › Shift+Tab moves back through the Change links`   |
| Enter     | on a Change link | Follows the link (native)                                        | `summary-list.test.tsx › keyboard › Enter on a Change link follows it`               |

## Focus management

- Initial focus: none. Nothing moves focus.
- Trap: no. Restore to: not applicable.
- Never obscured by: nothing is sticky. The link's ring is the theme's.

## Announcements

None. It is static content.

## Consumer responsibilities

- **Every row has a Key.** The Change link's name is built from it.
- **A Change link goes to where the answer is changed** (`href`), not `history.back()`, and returns to the page after saving (3.3.7 asks you not to make people re-enter what they gave).
- **A Value with no answer says so** ("Ej angivet"), never an empty `<dd>`.
- **Headings** for a list of lists are yours: the component renders none.
- **Don't put a `Field` inside a row**: it is for display, not for editing.

## Visual / modes

- Focus indicator: the Link's ring (the theme's `kv-link`).
- Target size: the Change link is a Link with the theme's 24px minimum target.
- forced-colors behaviour: the row divider is `CanvasText`-based, links keep the system link colour.
- reduced-motion behaviour: nothing animates. Below `40rem` the rows stack (key, value, actions) and nothing overflows at 320px.

## WCAG SCs covered

- 1.3.1 Info and Relationships: native `dl`, `dt`, `dd` (`summary list › the list is a description list: a term per key and definitions per value`).
- 2.4.4 Link Purpose, 2.5.3 Label in Name: `Change link › the name is "Change" plus the key and starts with the visible text`.
- 2.4.7 Focus Visible: the link ring, from the theme.
- 1.4.10 Reflow: the stacked layout (`SummaryList` stories, `Narrow`).
- Axe: no violations (`accessibility › no axe violations`).

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
