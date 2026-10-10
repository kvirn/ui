# Accessibility contract: Site header

- **APG pattern:** none: a composition of native landmarks, [Navigation](../../../../react/src/navigation/navigation.a11y.md) and [Disclosure](../../../../react/src/disclosure/disclosure.a11y.md). The main navigation is the [Main menu](../main-menu/main-menu.a11y.md), a list of links or topics that open lists of links, written as children of `SiteHeader.Menu`.
- **Deviations:** none
- **Native elements used:** `<header>` (banner), `<search>` with a `<form method="get">`, `<nav>`, `<button type="button">` (the Menu button), `<a href>`, `<input type="search">`, `<button type="submit">`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** `site-header.test.tsx` next to this file proves Escape returning focus to Menu; the parts are proved in their own components' tests. `site-header.stories.tsx` in `apps/storybook/src/patterns/site-chrome/`.

## Roles, states, properties

| Part                    | Element / role               | ARIA / state                                               | Notes                                                                                                                                       |
| ----------------------- | ---------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `SiteHeader.Root`       | `<header>` (banner)          | none                                                       | One per page. Holds no heading: the page's `h1` is in `main`. Content is its children                                                       |
| `SiteHeader.Brand`      | `<a href>`                   | `aria-current="page"` on the start page                    | The name is the visible text, written as children. `SiteHeader.Logo` is `alt=""`                                                            |
| `LanguageLinks.Root`    | `<nav>`                      | `aria-label` from its required `label`                     | See `language-links.a11y.md`                                                                                                                |
| `SiteHeader.Utility`    | `<nav>`                      | `aria-label` from its required `label`                     | Same links in the same order on every page (3.2.6)                                                                                          |
| `SiteHeader.Search`     | `<search>` (search landmark) | none; the field is named by the `Field.Label` you write    | Only a GET form around your `Field`, `TextInput` and `Button`. The button says Search in words (2.5.3)                                      |
| `SiteHeader.MenuButton` | `<button>`                   | `aria-expanded`, `aria-controls`                           | Its text is its name, written as children, never an icon alone. Not shown from 64rem                                                        |
| `SiteHeader.MenuPanel`  | `<div>`                      | `hidden` while closed (below 64rem); open from 64rem       | Holds the `MainMenu`. Escape and a followed link close it. Rendered open before hydration, so a wide or no-JavaScript visitor has the links |
| `MainMenu.Root`         | `<nav>`                      | `aria-label` from its required `label`; one `aria-current` | The deepest item shown has `aria-current="true"` when the page is not listed                                                                |
| `SiteHeader.Service`    | `<span>`                     | none                                                       | A transaction header's service name, text after the brand                                                                                   |

Every part takes the props of its element and its own `className`; the link parts take `as` (a router link). Props are behaviour and state only (`current`, `defaultOpen`, `action`): visible text and links are children, and a landmark's name is its required `label`, in DOM order.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context                                         | Action                                                                   | Test                                                                                 |
| ------------- | ----------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Tab           | in the header                                   | Brand, language links, shortcuts, search field, Search, Menu, navigation | `link.test.tsx › Tab moves focus to the link`                                        |
| Shift+Tab     | in the header                                   | The reverse order                                                        | `link.test.tsx › Shift+Tab moves focus off the link`                                 |
| Enter / Space | Menu                                            | Opens the main navigation, or closes it. Focus stays on Menu             | `disclosure.test.tsx › Enter and Space on the trigger toggle the panel`              |
| Enter         | link in the open Menu                           | Follows the link; the Menu closes                                        | `link.test.tsx › Enter activates the link; Space does not`                           |
| Escape        | in the open Menu panel, no topic open (< 64rem) | Closes the Menu; focus to Menu                                           | `site-header.test.tsx › Escape in the open Menu closes it and returns focus to Menu` |

The mega menu's own keys are in `main-menu.a11y.md`. The header handles no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: Escape returns focus to Menu or to the topic button.
- Never obscured by: nothing is sticky. Below 64rem the Menu panel is in flow and pushes the page down.

## Announcements

None.

## Consumer responsibilities

- A `lang` on a link that is in another language than the page, through `LanguageLinks.Link`'s `lang`.
- Up to seven topics. A label that is long in Finnish wraps and never clips.
- Route focus to the `h1` after navigation (`useRouteFocus`).

## Visual / modes

- Focus indicator: the token ring on every link and button.
- Target size: at least 24px (2.5.8); navigation items are 44px.
- forced-colors behaviour: sections keep a `CanvasText` border; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the row starts at the right.

## WCAG SCs covered

1.3.1, 1.3.2, 1.4.10, 1.4.12, 2.1.1, 2.4.1, 2.4.3, 2.4.5, 2.4.11, 2.5.3, 2.5.8, 3.1.2, 3.2.3, 3.2.6, 4.1.2.

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
