# Accessibility contract: Hero

- **APG pattern:** none: native elements, composed from shipped parts.
- **Deviations:** none
- **Native elements used:** `<div>` band, `<h1>`, `<p>`, `<a href>`, `<img alt="">`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** a pattern adds no behaviour of its own, so each Keyboard row names the shipped component's test. Axe runs on every story in `hero.stories.tsx` (`apps/storybook/src/patterns/navigation-and-promotion/`).

## Roles, states, properties

| Part           | Element / role                                | ARIA / state | Notes                                                     |
| -------------- | --------------------------------------------- | ------------ | --------------------------------------------------------- |
| `Hero.Root`    | `<div class="kv-section">` with a `Container` | none         | A band, not a landmark                                    |
| `Hero.Heading` | `<h1>`                                        | none         | The only `h1` of the page, at the `display` size          |
| `Hero.Lead`    | `<p>`                                         | none         | One sentence                                              |
| `Hero.Action`  | `<a href>`                                    | none         | One. `service` adds the arrow (decorative, `aria-hidden`) |
| `Hero.Image`   | `<img alt="">`                                | none         | Decorative by default; last in the DOM                    |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context     | Action              | Test                                                 |
| --------- | ----------- | ------------------- | ---------------------------------------------------- |
| Tab       | on the page | Moves to the action | `link.test.tsx › Tab moves focus to the link`        |
| Shift+Tab | on the page | Leaves the action   | `link.test.tsx › Shift+Tab moves focus off the link` |

The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None.

## Consumer responsibilities

- Exactly one `h1` per page, and the image carries no information. Pass an `alt` only if it does.
- No text over the image, no carousel, no minimum height.

## Visual / modes

- Focus indicator: the token ring on every link.
- Target size: at least 24px (2.5.8); list rows are 44px.
- forced-colors behaviour: cards keep their 1px `CanvasText` border; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the picture and the columns follow the writing direction.
- 320px / 400% zoom: one column, everything wraps, nothing has a fixed height.

## WCAG SCs covered

1.1.1, 1.3.1, 1.3.2, 1.4.10, 1.4.12, 2.4.4, 2.4.6.

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
