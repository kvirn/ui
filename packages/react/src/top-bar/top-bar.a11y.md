# Accessibility contract: Top bar

- **APG pattern:** none: a plain `<div>` around your text and a [Navigation](../navigation/navigation.a11y.md).
- **Deviations:** none
- **Native elements used:** `<div>`; inside it the elements you write (a `<p>`, a `<nav>`, `<a href>`).
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `top-bar.test.tsx` next to this file (keys, the hook, the roles, axe in each variant). `top-bar.stories.tsx` in `apps/storybook/src/components/top-bar/`: axe in every story state in every theme, and the theme's own checks that need `theme.css`: every bar item at least 24 × 24 px (`expectTopBarTargetSizes`, 2.5.8) and the band at least 48px tall (`expectTopBarBandHeight`), at every width. The 48px band is a maintainer requirement (DESIGN.md, Site chrome patterns, top bar), a plan requirement and not a WCAG success criterion.

## Roles, states, properties

| Part               | Element / role   | ARIA / state | Notes                                                                                                                                                                                               |
| ------------------ | ---------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TopBar`           | `<div>`, no role | none         | No landmark of its own: a `Navigation` inside is the landmark, named by its `label`. Test: `top-bar.test.tsx › the root is a plain div with no role, and the Navigation inside it is the landmark`. |
| `TopBar` `variant` | class only       | none         | `primary`, `secondary` or `accent` adds `kv-top-bar--<variant>`; none adds no class. Tests: `top-bar.test.tsx › variant %s renders the class "%s"`, `› useTopBar`.                                  |
| children           | yours            | yours        | Laid out at the start and the end in DOM order, so reading and focus order are the visual order (1.3.2, 2.4.3).                                                                                     |

The navigation's own rows (`aria-current` on one link) are the Navigation's. `useTopBar({ variant })` gives the same frozen `topBarProps` (only `className`) for your own element.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context            | Action                                   | Test                                                              |
| --------- | ------------------ | ---------------------------------------- | ----------------------------------------------------------------- |
| Tab       | in the bar         | Moves through its bar items in DOM order | `top-bar.test.tsx › Tab moves through the bar items in DOM order` |
| Shift+Tab | in the bar         | Moves back through its bar items         | `top-bar.test.tsx › Shift+Tab moves back through the bar items`   |
| Enter     | a link             | Follows it                               | `top-bar.test.tsx › Enter follows a link`                         |
| Enter     | a link-look button | Activates it                             | `top-bar.test.tsx › Enter or Space activates a link-look button`  |
| Space     | a link-look button | Activates it                             | `top-bar.test.tsx › Enter or Space activates a link-look button`  |

The bar handles no key itself: arrows, Home and End do nothing (`top-bar.test.tsx › the bar handles no key itself: arrows, Home and End move nothing`). The links and buttons keep their native keys ([Link](../link/link.a11y.md), [Button](../button/button.a11y.md)).

### Read aloud

| State or action    | Expected phrase(s) as read aloud                                        | Live region politeness | Test                                                                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The bar            | its children in DOM order, no banner, region or group phrase of its own | none                   | `top-bar.test.tsx › the bar reads in DOM order with no phrase of its own, the navigation by its label, the current tool as the current item, a link-look button as a button` |
| The navigation     | `navigation, Verktyg`                                                   | none                   | the same test                                                                                                                                                                |
| The current tool   | `link, Dokumentation, current item`                                     | none                   | the same test                                                                                                                                                                |
| A link-look button | `button, Visningsinställningar`                                         | none                   | the same test                                                                                                                                                                |

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
- Write a sentence in a `<p>`, never a bare `<div>`: a link directly in a div of the bar is a bar item and loses its resting underline.

## Visual / modes

- No fill by default: the page's colours. `primary`, `secondary` and `accent` fill the bar with `primary`, `secondary` or `accent`, and its text, text links (a link in a sentence stays underlined at rest), focus ring and current navigation bar are `on-primary`, `on-secondary` or `on-accent` (`focus-ring` is about 1:1 on a fill). Measured by `theme:check` at 4.5:1, 7:1 in the contrast themes. On the primary Site header it is the darker `primary-hover` band, its text links are `on-primary` (a link in a sentence stays underlined at rest), its ring is `on-primary`, and the current navigation item has the `on-primary` bar.
- A bar without a fill marks its current tool with weight 600, a straight `primary` bar at the item's block end (flush on the band's edge from 64rem) and the `text` colour, never the Navigation's solid fill; in forced colours the item is `LinkText` and the theme's own bar marks it.
- No type rules of its own: the text takes its size from what it sits on; bar items (a link that is a direct child of the bar or of a side, a Navigation item, a `kv-button--link` button) are at least 24px tall at every width (2.5.8), in the bar's on-colour, underlined on hover only, with no hover background. A link in a sentence is not a bar item: it keeps its underline at rest (1.4.1). A popup opened from the bar keeps its own tokens.
- 320px: the two sides wrap onto their own rows, nothing is hidden (1.4.10).
- forced-colors behaviour: links are `LinkText`. A variant's fill drops to `Canvas` with a 1px `CanvasText` edge, the ring is `Highlight` and the theme's `LinkText` bar marks the current item; so does the primary Site header's band.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the text is at the right and the navigation at the left.

## WCAG SCs covered

1.3.1, 1.3.2, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 2.4.3, 2.4.7, 4.1.2.

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

- none
