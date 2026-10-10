# Accessibility contract: Section nav

- **APG pattern:** none: [Disclosure](../../../../react/src/disclosure/disclosure.a11y.md) holding a [Navigation](../../../../react/src/navigation/navigation.a11y.md); the 64rem rule follows the docs shell.
- **Deviations:** none
- **Native elements used:** `<div>`, `<button type="button">`, `<nav>`, `<ul>`, `<li>`, `<a href>`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** a pattern adds no behaviour of its own, so each Keyboard row names the shipped component's test. Axe runs on every story in `section-nav.stories.tsx` (`apps/storybook/src/patterns/navigation-and-promotion/`).

## Roles, states, properties

| Part                    | Element / role                  | ARIA / state                                                                   | Notes                                                                                                                                                                                                                    |
| ----------------------- | ------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SectionNav.Root`       | `<div>` around a Disclosure     | `aria-expanded`, `aria-controls`; the nav is named by the root's `label`       | `label` is required and names the nav; the trigger's children are the button's visible name, the same words (2.5.3). Below 64rem the panel is closed until pressed; from 64rem the button is not shown and the panel is. |
| `SectionNav.Trigger`    | `<button>`                      | `aria-expanded`, `aria-controls`                                               | Children are the name. Not shown from 64rem                                                                                                                                                                              |
| `SectionNav.Panel`      | `<div>` with `<nav>` and `<ul>` | none                                                                           | Named by the root's `label`                                                                                                                                                                                              |
| `SectionNav.Link`       | `<li>` with `<a href>`          | `aria-current="page"` (`true` on the deepest item when the page is not listed) | Exactly one in the whole nav, never an ancestor                                                                                                                                                                          |
| `SectionNav.Group`      | `<li>`                          | none                                                                           | A page with pages under it: one `GroupLink` and one `GroupItems`. Two levels on a resident page                                                                                                                          |
| `SectionNav.GroupLink`  | `<a href>`                      | none                                                                           | The group's own page                                                                                                                                                                                                     |
| `SectionNav.GroupItems` | nested `<ul>`                   | none                                                                           | Holds `SectionNav.Link`s                                                                                                                                                                                                 |

Every part takes the props of its element and its own `className`; the link parts take `as` (a router link). Props are behaviour and state only: names, labels and links are children, in DOM order.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context            | Action                                                     | Test                                                                    |
| ------------- | ------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Tab           | in the section nav | The button, then every link in the open panel in DOM order | `disclosure.test.tsx › Tab goes from the trigger into an open panel`    |
| Shift+Tab     | in the section nav | The reverse order                                          | `disclosure.test.tsx › Shift+Tab leaves the trigger backwards`          |
| Enter / Space | button             | Opens the panel or closes it; focus stays on the button    | `disclosure.test.tsx › Enter and Space on the trigger toggle the panel` |

The links handle no other key. Escape is not handled: the panel is in the page's flow and pushes it down.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing (nothing is sticky).

## Announcements

None. `aria-expanded` carries the state.

## Consumer responsibilities

- Mark one link `current`; keep to two levels; place it in the sidebar, before the page's content.

## Visual / modes

- Focus indicator: the token ring on every link and button.
- Target size: at least 24px (2.5.8); the button and the links are 44px high.
- forced-colors behaviour: links are `LinkText`; borders are `CanvasText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the column starts at the right.

## WCAG SCs covered

1.3.1, 2.1.1, 2.4.1, 2.4.4, 2.4.6, 2.5.3, 2.5.8, 4.1.2.

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
