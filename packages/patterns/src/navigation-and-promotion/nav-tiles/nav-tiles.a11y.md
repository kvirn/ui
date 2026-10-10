# Accessibility contract: Nav tiles

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<ul>`, `<li>`, `<h2>`/`<h3>`, `<a href>`, `<p>`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** a pattern adds no behaviour of its own, so each Keyboard row names the shipped component's test. Axe runs on every story in `nav-tiles.stories.tsx` (`apps/storybook/src/patterns/navigation-and-promotion/`).

## Roles, states, properties

| Part               | Element / role                                | ARIA / state | Notes                                 |
| ------------------ | --------------------------------------------- | ------------ | ------------------------------------- |
| `NavTiles.Root`    | `<ul role="list">`                            | none         | The count is announced                |
| `NavTiles.Tile`    | `<li>` card                                   | none         | Not clickable                         |
| `NavTiles.Heading` | `<h2>` (`level`: `h3`) holding one `<a href>` | none         | The heading's text is the link's name |
| `NavTiles.Text`    | `<p>`                                         | none         | One sentence                          |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action                                     | Test                                                 |
| --------- | ----------- | ------------------------------------------ | ---------------------------------------------------- |
| Tab       | on the page | Moves through the tiles links in DOM order | `link.test.tsx › Tab moves focus to the link`        |
| Shift+Tab | on the page | Moves back to the previous tile            | `link.test.tsx › Shift+Tab moves focus off the link` |

The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Set `level` to the page outline: `h2` on a subpage, `h3` under a section heading.
- One link per tile, in the heading. Never wrap the card in a link.

## Visual / modes

- Focus indicator: the token ring on every link.
- Target size: at least 24px (2.5.8); list rows are 44px.
- forced-colors behaviour: cards keep their 1px `CanvasText` border; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the picture and the columns follow the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing has a fixed height.

## WCAG SCs covered

1.3.1, 1.3.2, 1.4.10, 2.4.4, 2.4.6, 2.5.8.

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

## Known issues

- none
