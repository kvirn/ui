# Accessibility contract: Top bar

- **APG pattern:** none: a plain `<div>` around your text and a [Navigation](../navigation/navigation.a11y.md).
- **Deviations:** none
- **Native elements used:** `<div>`; inside it the elements you write (a `<p>`, a `<nav>`, `<a href>`).
- **Tests:** `top-bar.test.tsx` next to this file (keys, the hook, the roles, axe in each variant). `top-bar.stories.tsx` in `apps/storybook/src/components/top-bar/`: axe in every story state in every theme, and the theme's own checks that need `theme.css`: every bar item at least 24 × 24 px (`expectTopBarTargetSizes`, 2.5.8) and the band at least 48px tall (`expectTopBarBandHeight`), at every width. The 48px band is a maintainer requirement (DESIGN.md, Site chrome patterns, top bar), a plan requirement and not a WCAG success criterion.

## Roles, states, properties

| Part               | Element / role   | ARIA / state | Notes                                                                                                                                                 |
| ------------------ | ---------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TopBar`           | `<div>`, no role | none         | No landmark of its own: a `Navigation` inside is the landmark, named by its `label`.                                                                  |
| `TopBar` `variant` | class only       | none         | `primary`, `secondary` or `accent` adds `kv-top-bar--<variant>`; none adds no class.                                                                  |
| children           | yours            | yours        | Laid out at the start and the end in DOM order, so reading and focus order are the visual order (1.3.2 Meaningful Sequence, A; 2.4.3 Focus Order, A). |

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
| The navigation     | `navigation, Verktyg` (the label "Tools", in Swedish)                   | none                   | the same test                                                                                                                                                                | <!-- kv-lang-ok: the label the test gives the Navigation, read aloud as written --> |
| The current tool   | `link, Documentation, current item`                                     | none                   | the same test                                                                                                                                                                |
| A link-look button | `button, Display settings`                                              | none                   | the same test                                                                                                                                                                |

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing, as the bar is not sticky.

## Announcements

None.

## Consumer responsibilities

- Text first, the navigation last, each a child of the bar.
- Name the navigation with its `label`, and mark the current link.
- A link in the text says where it goes (2.4.4 Link Purpose (In Context), A).
- If you make the bar sticky, check that the focused control is not hidden behind it (2.4.11 Focus Not Obscured (Minimum), AA).
- Write a sentence in a `<p>`, never a bare `<div>`: a link directly in a div of the bar is a bar item and loses its resting underline.

## Visual / modes

- No fill by default: the page's colours. `primary`, `secondary` and `accent` fill the bar, and its text, text links (a link in a sentence stays underlined at rest), focus ring and current navigation bar take the colour made for that fill. Text meets 4.5:1 on every fill, and 7:1 in the contrast themes, checked automatically in every theme. The focus ring has about the same colour as the fill itself, so it uses the on-fill colour instead. The primary site header is a darker band with the same on-fill colours.
- A bar without a fill marks its current tool with bolder text and a straight bar at the item's block end, never the Navigation's solid fill. In forced colours the item takes the system link colour and the theme's own bar marks it.
- No type rules of its own: the text takes its size from what it sits on. Bar items (a link that is a direct child of the bar or of a side, a Navigation item, a link-look button) are at least 24 by 24 CSS px at every width (2.5.8 Target Size (Minimum), AA), in the bar's on-colour, underlined on hover only, with no hover background. A link in a sentence is not a bar item: it keeps its underline at rest (1.4.1 Use of Color, A). A popup opened from the bar keeps its own look.
- 320px: the two sides wrap onto their own rows, nothing is hidden (1.4.10 Reflow, AA). The text-spacing sweep applies the 1.4.12 spacing and fails on a box that clips its content.
- forced-colors behaviour: links take the system link colour. A variant's fill drops to the system background with a thin edge in the system text colour, the focus ring takes the highlight colour, and the theme's link-colour bar marks the current item; so does the primary site header's band.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the text is at the right and the navigation at the left.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A)
- 1.3.2 Meaningful Sequence (A)
- 1.4.1 Use of Color (A)
- 1.4.3 Contrast (Minimum) (AA)
- 1.4.10 Reflow (AA)
- 1.4.11 Non-text Contrast (AA)
- 1.4.12 Text Spacing (AA)
- 2.4.3 Focus Order (A)
- 2.4.4 Link Purpose (In Context) (A)
- 2.4.7 Focus Visible (AA)
- 2.5.8 Target Size (Minimum) (AA)
- 4.1.2 Name, Role, Value (A)

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                         |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                               |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | top-bar.stories.tsx, every story, 4 themes                                                                                    |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | top-bar.test.tsx › the root is a plain div with no role, and the Navigation inside it is the landmark; expectNoA11yViolations |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 5 rows, each names a test (top-bar.test.tsx › Tab moves through the bar items in DOM order)                                   |
| Focus order and management                                                 | pass        | n/a         | pass    | top-bar.test.tsx asserts focus (toHaveFocus); first rule: Tab moves through the bar items in DOM order                        |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI                 |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                               |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                               |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                               |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                               |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                               |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                               |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                               |

### What to check

With a screen reader and the keyboard, try:

- Tab goes through the bar in the order it is read: text links first, the tools last.
- The landmarks list does not show the bar. It shows its navigation, with its own name.
- The current tool is announced as current.
- A link-look button is announced as a button, and Enter and Space both press it.
- At 320px the two sides wrap, nothing is hidden, and there is no sideways scroll.
- On a filled bar in a high-contrast theme or forced colours, the text and the focus ring stay easy to see.

## Known issues

- none
