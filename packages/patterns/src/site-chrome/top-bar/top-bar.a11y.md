# Accessibility contract: Top bar

- **APG pattern:** none: a plain `<div>` around your text and a [Navigation](../../../../react/src/navigation/navigation.a11y.md).
- **Deviations:** none
- **Native elements used:** `<div>`; inside it the elements you write (a `<p>`, a `<nav>`, `<a href>`).
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** none of its own: patterns aren't unit tested. WCAG is proved by axe in every story state in every theme (`top-bar.stories.tsx`); the keys and parts are proved in the components' tests that the rows below name.

## Roles, states, properties

| Part                    | Element / role   | ARIA / state | Notes                                                                                                              |
| ----------------------- | ---------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `TopBar.Root`           | `<div>`, no role | none         | No landmark of its own: a `Navigation` inside is the landmark, named by its `label`. Proved by axe in the stories. |
| `TopBar.Root` `variant` | class only       | none         | `primary`, `secondary` or `accent` adds `kv-top-bar--<variant>`; none adds no class. Proved by axe in the stories. |
| children                | yours            | yours        | Laid out at the start and the end in DOM order, so reading and focus order are the visual order (1.3.2, 2.4.3).    |

The navigation's own rows (`aria-current` on one link) are the Navigation's.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context    | Action                               | Test                                                                                       |
| --------- | ---------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Tab       | in the bar | Moves through its links in DOM order | `navigation.test.tsx › Tab moves through the links in DOM order, nested ones included`     |
| Shift+Tab | in the bar | Moves back through its links         | `navigation.test.tsx › Shift+Tab moves back through the links, then out of the navigation` |
| Enter     | a link     | Follows it                           | `link.test.tsx › Enter activates the link; Space does not`                                 |

The bar handles no key itself.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing: it is not sticky.

## Announcements

None.

## Consumer responsibilities

- Text first, the navigation last, each a child of the bar.
- Name the navigation with its `label`, and mark the current link.
- A link in the text says where it goes.

## Visual / modes

- No fill by default: the page's colours. `primary`, `secondary` and `accent` fill the bar with `primary`, `secondary` or `accent`, and its text, text links (underlined at rest), focus ring and current navigation bar are `on-primary`, `on-secondary` or `on-accent` (`focus-ring` is about 1:1 on a fill). Measured by `theme:check` at 4.5:1, 7:1 in the contrast themes. On the primary Site header it is the darker `primary-hover` band, its text links are `on-primary` and underlined at rest, its ring is `on-primary`, and the current navigation item has the `on-primary` bar.
- No type rules of its own: the text takes its size from what it sits on; a navigation inside keeps its 44px items (2.5.8).
- 320px: the two sides wrap onto their own rows, nothing is hidden (1.4.10).
- forced-colors behaviour: links are `LinkText`. A variant's fill drops to `Canvas` with a 1px `CanvasText` edge, the ring is `Highlight` and the theme's `LinkText` bar marks the current item; so does the primary Site header's band.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the text is at the right and the navigation at the left.

## WCAG SCs covered

1.3.1, 1.3.2, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 2.4.3, 2.4.7, 4.1.2.

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
