# Accessibility contract: Service link

- **APG pattern:** none: a native link in the service look.
- **Deviations:** none
- **Native elements used:** `<div>`, `<p>`, `<a href>`, an inset `<div>` with `<p>` for the closed state.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** a pattern adds no behaviour of its own, so each Keyboard row names the shipped component's test. Axe runs on every story in `service-link.stories.tsx` (`apps/storybook/src/patterns/navigation-and-promotion/`).

## Roles, states, properties

| Part                      | Element / role     | ARIA / state | Notes                                                                                                                                 |
| ------------------------- | ------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ServiceLink.Root`        | `<div>`            | none         | One service link per view                                                                                                             |
| `ServiceLink.Link`        | `<a href>`         | none         | A link, never a button. The arrow is decorative (`aria-hidden`) and mirrors in RTL. The text starts with a verb and names the service |
| `ServiceLink.Closed`      | `<div>` with `<p>` | none         | The children are the sentence. No link, nothing dimmed or disabled: the words carry the state                                         |
| `ServiceLink.Alternative` | `<div>`            | none         | Other ways to apply, or what to do meanwhile                                                                                          |

Every part takes the props of its element and its own `className`; the link parts take `as` (a router link). Props are behaviour and state only: names, labels and links are children, in DOM order.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context        | Action                               | Test                                                 |
| --------- | -------------- | ------------------------------------ | ---------------------------------------------------- |
| Tab       | in the pattern | Moves through the links in DOM order | `link.test.tsx › Tab moves focus to the link`        |
| Shift+Tab | in the pattern | Moves back through the links         | `link.test.tsx › Shift+Tab moves focus off the link` |

The link handles no other key. The closed state has no focusable part of its own.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None. The closed state is on the page from load, so it is read in the page's order.

## Consumer responsibilities

- Say when the service is closed and what to do meanwhile; render `ServiceLink.Closed` instead of the link, never a dimmed link.

## Visual / modes

- Focus indicator: the token ring on every link and button.
- Target size: at least 24px (2.5.8); the service link is at least 44px high and full width at 320px.
- forced-colors behaviour: links are `LinkText`; borders are `CanvasText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the column starts at the right.

## WCAG SCs covered

1.3.1, 1.4.1, 2.4.4, 2.5.3, 2.5.8.

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
