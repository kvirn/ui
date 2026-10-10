# Accessibility contract: Page frame

- **APG pattern:** none: native landmarks and a skip link ([SkipLink](../../../react/src/skip-link/skip-link.a11y.md)).
- **Deviations:** none
- **Native elements used:** `<a href="#main">`, `<header>`, `<main id>`, `<footer>`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** the pattern adds no behaviour of its own: each Keyboard row names the shipped SkipLink's test. `page-frame.stories.tsx` in `apps/storybook/src/patterns/site-chrome/`.

## Roles, states, properties

| Part                | Element / role           | ARIA / state | Notes                                                                  |
| ------------------- | ------------------------ | ------------ | ---------------------------------------------------------------------- |
| `PageFrame.Root`    | `<div lang>`             | `lang`       | The page's language, with the provider's locale and catalog (3.1.1)    |
| Skip link           | `<a href="#main">`       | none         | First in the DOM, written by the root. Moves focus to `main`           |
| `PageFrame.Main`    | `<main id>`              | none         | One per page, `id` from the root's `mainId`. The only `h1` goes here   |
| `PageFrame.Body`    | `<div>` in a `Container` | none         | Only with a sidebar: holds `PageFrame.Sidebar` and `PageFrame.Main`    |
| `PageFrame.Sidebar` | `<nav>` or `<aside>`     | a name       | Before `Main` in the DOM: beside it from 64rem, stacked above it below |

Header, alert, breadcrumb and footer are children of the root, in the order written. DOM order is reading and focus order at every width: skip link, banner, alert, breadcrumb, main, contentinfo. No `order`, nothing sticky.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context       | Action                                                       | Test                                                                                       |
| --------- | ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Tab       | page load     | First stop is the skip link, visible on focus                | `skip-link.test.tsx › the first Tab stop is the skip link`                                 |
| Shift+Tab | in the header | Goes back to the skip link from the first link of the header | `skip-link.test.tsx › Shift+Tab from the skip link leaves the document`                    |
| Enter     | skip link     | Moves focus to `main`                                        | `skip-link.test.tsx › Enter moves focus to the target and the next Tab continues after it` |

The frame handles no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: the skip link moves focus to `main`.
- Never obscured by: nothing is sticky (2.4.11).

## Announcements

None.

## Consumer responsibilities

- One `h1` in `main`, named repeated landmarks, and `lang` on passages in another language.
- Write the children in reading order: the frame never reorders them.

## Visual / modes

- Focus indicator: the token ring on every link and button.
- Target size: at least 24px (2.5.8); navigation items are 44px.
- forced-colors behaviour: sections keep a `CanvasText` border; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the row starts at the right.

## WCAG SCs covered

1.3.1, 1.3.2, 2.4.1, 2.4.3, 2.4.11, 3.1.1.

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
