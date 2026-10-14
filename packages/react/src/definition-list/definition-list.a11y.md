# Accessibility contract: DefinitionList

- **APG pattern:** none. A native description list (`<dl>`), the same pattern as GOV.UK's [Summary list](https://design-system.service.gov.uk/components/summary-list/).
- **Deviations:** none.
- **Native elements used:** `<dl>`, `<div>` row groups, `<dt>`, `<dd>` and `<a>` (the Change link).
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `definition-list.test.tsx` next to this file. `definition-list.stories.tsx` in `apps/storybook/src/components/definition-list/`.

Rows of a term, a description and optional actions: the answers on a check-your-answers page, a contact card, a case card. It is read-only: a description you can edit is a Field, and the row's action is a link to where it is changed.

## Roles, states, properties

| Part        | Element / role        | ARIA                                               | Notes                                                                                                                                                                                                                                                                                                                                                            |
| ----------- | --------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root        | `<dl>` (no role)      | none                                               | `<div>` rows are allowed inside a `<dl>`, and keep each term with its descriptions                                                                                                                                                                                                                                                                               |
| Row         | `<div>`, generic      | none                                               | One term and one or more descriptions. Gives its Term an id for the Change link, or follows the Term's own `id`                                                                                                                                                                                                                                                  |
| Term        | `<dt>` → `term`       | none                                               | The label. A consumer `id` is kept and registered with the Row, so the Change link's `aria-labelledby` follows it (`Change link › a Term with its own id keeps it and still names the Change link`). If no element has that id the Change link warns once in development (`Change link › a Change link whose Term is not in the row warns once in development`). |
| Description | `<dd>` → `definition` | none                                               | The answer. Wraps, never truncates                                                                                                                                                                                                                                                                                                                               |
| Actions     | `<dd>` → `definition` | none                                               | Holds links. A second definition of the same term                                                                                                                                                                                                                                                                                                                |
| Change      | `<a>` → `link`        | `aria-labelledby` = its own id, then the Term's id | Visible text is `definitionList.change` ("Change"). The accessible name is "Change" plus the term, so the link's purpose is clear when links are listed on their own (2.4.4 Link Purpose (In Context), A) and the name contains the visible text (2.5.3 Label in Name, A)                                                                                        |

## Allowed elements

No part takes `as`: a `ul` or `span` instead would drop the term and definition relationship (1.3.1 Info and Relationships, A; 4.1.2 Name, Role, Value, A).

| Part       | `as` | Why                                                                                                                                                                                                                                       |
| ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every part | none | The `<dl>`, `<div>`, `<dt>` and `<dd>` are the structure of the term and its definitions (1.3.1 Info and Relationships, A), and Change is an `<a href>`. A list or a router link is built from `useDefinitionList` with your own elements |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

The list is not a widget. Its only focusable parts are the Change links (and any links you put in a Description), in DOM order. The component adds no Tab stop, no key handler and no `tabindex`.

| Key       | Context          | Action                                                           | Test                                                                                    |
| --------- | ---------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Tab       | before the list  | Moves focus to the first Change link, skipping the text          | `definition-list.test.tsx › keyboard › Tab moves through the Change links in row order` |
| Tab       | on a Change link | Moves to the next row's Change link, then on into the page       | `definition-list.test.tsx › keyboard › Tab moves through the Change links in row order` |
| Shift+Tab | on a Change link | Moves to the previous row's Change link, then to the stop before | `definition-list.test.tsx › keyboard › Shift+Tab moves back through the Change links`   |
| Enter     | on a Change link | Follows the link (native)                                        | `definition-list.test.tsx › keyboard › Enter on a Change link follows it`               |

## Focus management

- Initial focus: none. Nothing moves focus.
- Trap: no. Restore to: not applicable.
- Never obscured by: nothing is sticky. The link's ring is the theme's.

## Announcements

None. It is static content.

## Consumer responsibilities

- **Every row has a Term.** The Change link's name is built from it.
- **A Change link goes to where the answer is changed** (`href`), not `history.back()`, and returns to the page after saving (3.3.7 Redundant Entry, A, asks you not to make people re-enter what they gave).
- **A Description with no answer says so** ("Ej angivet", Swedish for "Not provided"), never an empty `<dd>`.
- **Headings** for a list of lists are yours: the component renders none.
- **Don't put a `Field` inside a row**: it is for display, not for editing.

## Visual / modes

- Focus indicator: the same focus ring as every Link (2.4.7 Focus Visible, AA).
- Target size: the Change link is at least 24 CSS pixels high (2.5.8 Target Size (Minimum), AA).
- forced-colors behaviour: the row dividers use the system's text colour, and links keep the system's link colour.
- reduced-motion behaviour: nothing animates.
- Reflow: on screens narrower than 40rem the rows stack (term, description, actions), and a story checks that nothing scrolls sideways in a narrow column (1.4.10 Reflow, AA).

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): native `dl`, `dt`, `dd` (`definition list › the list is a description list: a term per row and its descriptions`).
- 2.4.4 Link Purpose (In Context) (A), 2.5.3 Label in Name (A): `Change link › the name is "Change" plus the term and starts with the visible text`.
- 2.4.7 Focus Visible (AA): the link ring, from the theme. No named test checks the ring itself.
- 2.5.8 Target Size (Minimum) (AA): the Change link is at least 24 CSS pixels high, from the theme. No named test checks it.
- 3.3.7 Redundant Entry (A): your duty (Consumer responsibilities): the Change link returns to the page after saving. Not tested here.
- 1.4.10 Reflow (AA): the stacked layout, asserted by `definition-list.stories.tsx › Reflow320` (`expectNoHorizontalOverflow` at 320px).
- Axe: no violations (`accessibility › no axe violations`).

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

- A consumer `Term` id is registered with the Row in a layout effect, so server-rendered HTML has the Change link's `aria-labelledby` pointing at the generated id, which is absent. The link is named just "Change" until hydration (`definition-list.test.tsx › a Term with its own id is not yet followed by the Change link in server HTML`). The API is unchanged.
