# Accessibility contract: Application logo

- **APG pattern:** none: a native link ([Link](../../../../react/src/link/link.a11y.md)) with a decorative image and text.
- **Deviations:** none
- **Native elements used:** `<a href>`, `<img alt="">`, `<span>`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** none of its own: patterns aren't unit tested. WCAG is proved by axe in every story state in every theme (`application-logo.stories.tsx`); the keys and parts are proved in the components' tests that the rows below name.

## Roles, states, properties

| Part                     | Element / role | ARIA / state                                                                      | Notes                                                                    |
| ------------------------ | -------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `ApplicationLogo.Root`   | `<a href>`     | `aria-current="page"` from `current` on the start page                            | Proved by axe in the stories.                                            |
| `ApplicationLogo.Logo`   | `<img alt="">` | none: decorative                                                                  | The name beside it is the text.                                          |
| `ApplicationLogo.Name`   | `<span>`       | the link's name (`aria-labelledby` when a Slogan is there, the content otherwise) | Visible text, so the name a voice user says is the one they see (2.5.3). |
| `ApplicationLogo.Slogan` | `<span>`       | the link's description (`aria-describedby`)                                       | Read after the name, not part of it.                                     |

Every part takes the props of its element and its own `className`; the Root takes `as` (a router link) and `current`. The text is children.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context  | Action                       | Test                                                       |
| --------- | -------- | ---------------------------- | ---------------------------------------------------------- |
| Tab       | the page | Moves focus to the link      | `link.test.tsx › Tab moves focus to the link`              |
| Shift+Tab | the link | Moves focus off the link     | `link.test.tsx › Shift+Tab moves focus off the link`       |
| Enter     | the link | Follows it to the start page | `link.test.tsx › Enter activates the link; Space does not` |

The link handles no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing.

## Announcements

None.

## Consumer responsibilities

- Write the organisation's or service's name as text in `ApplicationLogo.Name`: never only an image of text.
- A slogan is short; it is read after the name on every page.

## Visual / modes

- Focus indicator: the token ring of every link; on a `primary` band of the Site header it is `on-primary`.
- Colour: it takes the colour of what it sits on (`text` on a canvas, `on-primary` on a primary band), so it has no variant. The name is the sans family at weight 600 and underlined on hover only.
- Target size: the link is at least the name's line and the mark's height (2.5.8).
- forced-colors behaviour: the link is `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the mark is at the inline start.

## WCAG SCs covered

1.1.1, 1.3.1, 2.4.4, 2.4.7, 2.5.3, 2.5.8, 4.1.2.

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
