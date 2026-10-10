# Accessibility contract: Language links

- **APG pattern:** none: [Navigation](../../../../react/src/navigation/navigation.a11y.md), horizontal.
- **Deviations:** none
- **Native elements used:** `<nav>`, `<ul>`, `<li>`, `<a href hreflang lang>`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** the pattern adds no behaviour: `navigation.test.tsx` and `link.test.tsx` in `packages/react/src` prove the parts, and `language-links.stories.tsx` (axe, every theme) the composition. `language-links.stories.tsx` in `apps/storybook/src/patterns/site-chrome/`.

## Roles, states, properties

| Part                 | Element / role | ARIA / state                                | Notes                                                                               |
| -------------------- | -------------- | ------------------------------------------- | ----------------------------------------------------------------------------------- |
| `LanguageLinks.Root` | `<nav>`        | `aria-label` from the required `label` prop | The name is written in the page's language by the author                            |
| `LanguageLinks.Link` | `<a href>`     | `lang`, `hreflang`; `aria-current="true"`   | Each language written in itself. One current. No flags, no select, no auto-redirect |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context | Action                                   | Test                                                                                       |
| --------- | ------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| Tab       | in nav  | Moves through the languages in DOM order | `navigation.test.tsx › Tab moves through the links in DOM order, nested ones included`     |
| Shift+Tab | in nav  | Moves back through the languages         | `navigation.test.tsx › Shift+Tab moves back through the links, then out of the navigation` |

The links handle no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing.

## Announcements

None.

## Consumer responsibilities

- Mark the current language, and say `English (start page)` in English when the page has no translation.

## Visual / modes

- Focus indicator: the token ring on every link and button.
- Target size: at least 24px (2.5.8); navigation items are 44px.
- forced-colors behaviour: sections keep a `CanvasText` border; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the row starts at the right.

## WCAG SCs covered

1.3.1, 2.4.1, 2.4.4, 3.1.2, 3.2.2.

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
