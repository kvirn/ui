# Accessibility contract: Table

- **Scope:** A static data table with a caption and a scroll region, for comparing figures. A recipe: the shipped Table.
- **APG pattern:** none: [Table](../../../../react/src/table/table.a11y.md), static.
- **Deviations:** none
- **Native elements used:** `<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope>`, `<td>`, a scroll region `<div>`.
- **Tests:** a recipe has no package code and adds no behaviour of its own, so its Keyboard rows name no test. Axe runs on every story in `table.stories.tsx` (`apps/storybook/src/patterns/content-and-media/`).

## Roles, states, properties

| Part                 | Element / role               | ARIA / state | Notes                                                            |
| -------------------- | ---------------------------- | ------------ | ---------------------------------------------------------------- |
| `Table.Caption`      | `<caption>`                  | none         | Names the table; the scroll region and the table are named by it |
| `Table.ColumnHeader` | `<th scope="col">`           | none         | The unit goes in the header once                                 |
| `Table.RowHeader`    | `<th scope="row">`           | none         | Lets a screen reader say which headers a cell belongs to         |
| `Table.Cell`         | `<td>`                       | none         | Numeric columns carry the `numeric` classes                      |
| `Table.ScrollRegion` | `<div>` named by the caption | none         | Focusable only while the table overflows (`OverflowAt320`)       |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key        | Context       | Action                                                                          | Test                                                |
| ---------- | ------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| Tab        | in the table  | The scroll region when the table overflows; otherwise the table has no Tab stop | Native; the shipped part's own tests                |
| Shift+Tab  | in the table  | The reverse order                                                               | Native; the shipped part's own tests                |
| Arrow keys | scroll region | Scroll the table sideways                                                       | Native; the browser scrolls a focused scroll region |

The `Keyboard` story shows the overflowing table. The table has no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Always give the table a caption and name the scroll region by it.
- Never turn the table into cards.
- Put the unit in the column header once.

## Visual / modes

- Focus indicator: the token ring on every focusable part.
- forced-colors behaviour: the `ForcedColors` story; nothing depends on colour alone.
- reduced-motion behaviour: nothing in the recipe animates.
- RTL: the `RTL` story; logical properties.
- 320px / 400% zoom: the `Narrow` story asserts no sideways scroll.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 1.4.10 Reflow (AA)
- 2.1.1 Keyboard (A)
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
