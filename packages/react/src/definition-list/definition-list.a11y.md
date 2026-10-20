# Accessibility contract: DefinitionList

- **APG pattern:** none. A native description list (`<dl>`), the same pattern as GOV.UK's [Summary list](https://design-system.service.gov.uk/components/summary-list/).
- **Deviations:** none.
- **Native elements used:** `<dl>`, `<div>` row groups, `<dt>`, `<dd>` and `<a>` (the Change link).
- **Tests:** `definition-list.test.tsx` next to this file. `definition-list.stories.tsx` in `apps/storybook/src/components/definition-list/`.

Rows of a term, a description and optional actions: the answers on a check-your-answers page, a contact card, a case card. It is read-only: a description you can edit is a Field, and the row's action is a link to where it is changed.

## Roles, states, properties

| Part        | Element / role        | ARIA                                               | Notes                                                                                                                                                                                                                                                                     |
| ----------- | --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root        | `<dl>` (no role)      | none                                               | `<div>` rows are allowed inside a `<dl>`, and keep each term with its descriptions                                                                                                                                                                                        |
| Row         | `<div>`, generic      | none                                               | One term and one or more descriptions. Gives its Term an id for the Change link, or follows the Term's own `id`                                                                                                                                                           |
| Term        | `<dt>` → `term`       | none                                               | The label. A consumer `id` is kept and registered with the Row, so the Change link's `aria-labelledby` follows it. If no element has that id the Change link warns once in development.                                                                                   |
| Description | `<dd>` → `definition` | none                                               | The answer. Wraps, never truncates                                                                                                                                                                                                                                        |
| Actions     | `<dd>` → `definition` | none                                               | Holds links. A second definition of the same term                                                                                                                                                                                                                         |
| Change      | `<a>` → `link`        | `aria-labelledby` = its own id, then the Term's id | Visible text is `definitionList.change` ("Change"). The accessible name is "Change" plus the term, so the link's purpose is clear when links are listed on their own (2.4.4 Link Purpose (In Context), A) and the name contains the visible text (2.5.3 Label in Name, A) |

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
- Never obscured by: nothing is sticky. The link shows a focus ring (2.4.7 Focus Visible, AA).

## Announcements

None. It is static content.

## Consumer responsibilities

- **Every row has a Term.** The Change link's name is built from it.
- **A Change link goes to where the answer is changed** (`href`), not `history.back()`, and returns to the page after saving (3.3.7 Redundant Entry, A, asks you not to make people re-enter what they gave).
- **A Description with no answer says so** ("Not provided"), never an empty `<dd>`.
- **Headings** for a list of lists are yours: the component renders none.
- **Don't put a `Field` inside a row**: it is for display, not for editing.

## Visual / modes

- Focus indicator: the same focus ring as every Link (2.4.7 Focus Visible, AA).
- Target size: the Change link is at least 24 CSS pixels high (2.5.8 Target Size (Minimum), AA).
- forced-colors behaviour: the row dividers use the system's text colour, and links keep the system's link colour.
- reduced-motion behaviour: nothing animates.
- Reflow: on a narrow screen the rows stack (term, description, actions), and the reflow sweep checks that nothing scrolls sideways at 320 CSS pixels (1.4.10 Reflow, AA).

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): native `dl`, `dt`, `dd`.
- 2.4.4 Link Purpose (In Context) (A), 2.5.3 Label in Name (A): the name is "Change" plus the term and starts with the visible text.
- 2.4.7 Focus Visible (AA): the link shows a focus ring. The ring itself is checked by eye.
- 2.5.8 Target Size (Minimum) (AA): the Change link is at least 24 CSS pixels high, from the theme. This is checked by eye.
- 3.3.7 Redundant Entry (A): your duty (Consumer responsibilities): the Change link returns to the page after saving. This is not checked automatically.
- 1.4.10 Reflow (AA): the stacked layout. The reflow sweep checks that nothing scrolls sideways at 320 CSS pixels.
- Axe finds no violations in any story.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                      |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                            |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | definition-list.stories.tsx, every story, 4 themes                                                                         |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `definition-list.test.tsx` (axe and role, name and state): `it adds no role, no tabindex and no data attribute of its own` |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 4 rows, each names a test in `definition-list.test.tsx`                                                                    |
| Focus order and management                                                 | pass        | n/a         | pass    | `definition-list.test.tsx`: `keyboard › Tab moves through the Change links in row order`                                   |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI              |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                            |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                            |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                            |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                            |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                            |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                            |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                            |

### What to check

- Tab through the page: focus stops on each Change link in row order, and on nothing else in the list.
- Each Change link reads "Change" plus its row's label ("Change Name"), never just "Change", also in the links list.
- With the screen reader's list and term commands, each term is read with its answer(s). In a row with two answers, both are read after the term.
- Press Enter on a Change link: it goes to the step where the answer is changed.
- At 400% zoom or 320px, the rows stack, term first, and nothing is cut off.

## Known issues

- In server-rendered HTML the link is named just “Change” until the page script has loaded, when the Term has an `id` you set yourself. Use the generated id, or accept the short name.
