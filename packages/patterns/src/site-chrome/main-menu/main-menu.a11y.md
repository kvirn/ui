# Accessibility contract: Mega menu (`MainMenu`)

- **APG pattern:** [Disclosure Navigation Menu](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/): buttons that toggle lists of links. It is never `role="menu"`, `menubar` or `menuitem`, and nothing has `aria-haspopup`: the items are page links.
- **Deviations:** the APG example's optional arrow keys, Home and End are not adopted (plan 0095, D3 and spec section 5.2): `Disclosure` and `Navigation` handle none, a list of links is learned with Tab, and an arrow on a link scrolls the page for a zoomed keyboard user. Adding them later is additive. Escape and the focus-out close are the composition's own handlers.
- **Native elements used:** `<nav>`, `<ul>`, `<li>`, `<button type="button">` (Disclosure.Trigger), `<div>` (Disclosure.Panel), `<a href>`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** none of its own: patterns aren't unit tested. WCAG is proved by axe in every story state in every theme (`primary-navigation.stories.tsx`); the keys and parts are proved in the components' tests that the rows below name.

## Roles, states, properties

| Part                   | Element / role           | ARIA / state                                                                                | Notes                                                                                                      |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `MainMenu.Root`        | `<nav>` (navigation)     | `aria-label` from its required `label` prop                                                 | Class `kv-mega-menu`. Distinct from the other navs of the page (2.4.1)                                     |
| `MainMenu.TopicButton` | `<button type="button">` | `aria-expanded`, `aria-controls` (the panel), `data-trail` on the topic that holds the page | Its text never changes with the state. A decorative chevron follows it. Not `aria-haspopup`                |
| `MainMenu.TopicPanel`  | `<div>`, no role         | `hidden` while closed                                                                       | Starts with `MainMenu.Overview`, because the trigger is a button and not a link. Not `until-found`         |
| `MainMenu.Link`        | `<a href>` in a list     | `aria-current="page"` only while its panel is shown, never inside a `hidden` group          | One `aria-current` per nav. The trigger's trail is visual and is not announced: the Breadcrumb is the path |
| `MainMenu.Link` (top)  | `<a href>`               | `aria-current` as any navigation link                                                       | A topic with no sub-pages is a plain link, not a button                                                    |

Rules (the focus-out and outside-press closes and the Escape focus return are shown in `primary-navigation.stories.tsx`):

- **Activation only.** A panel opens and closes on click, tap, Enter and Space. There is no hover-open, no focus-open and no delay.
- **Wide (from 64rem):** opening one topic closes any other. A panel closes when focus leaves the nav and when a press lands outside it, so it never covers the element that has focus (2.4.11). Resizing keeps the state, except that crossing to wide keeps one open topic: the one that holds focus, else the last opened.
- **Escape, wide:** with focus elsewhere in the nav after Tab left an open panel, Escape closes the open panel and focus stays where it is.
- **Narrow (below 64rem):** panels are in flow and independent, and nothing closes on focus-out.
- **Following a link** closes every panel. The `SiteHeader.Menu` around it closes too.
- **`data-trail`** is set on a topic's button while a link inside it is `current`, whether its panel is open or not.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key               | Context                                  | Action                                                                                              | Test                                                                    |
| ----------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Tab               | in the nav                               | Moves through the topic buttons and, when a panel is open, into and through its links, in DOM order | `disclosure.test.tsx › Tab skips the content of a closed panel`         |
| Shift+Tab         | in the nav                               | Moves back through the topic buttons and links                                                      | `disclosure.test.tsx › Shift+Tab leaves the trigger backwards`          |
| Enter             | topic button                             | Opens its panel. Focus stays on the button. Wide: closes any other panel                            | `disclosure.test.tsx › Enter and Space on the trigger toggle the panel` |
| Space             | topic button                             | Opens its panel, or closes it. Focus stays on the button                                            | `disclosure.test.tsx › Enter and Space on the trigger toggle the panel` |
| Tab               | on an open topic button                  | Moves into the panel: the overview link first, then the children                                    | `disclosure.test.tsx › Tab goes from the trigger into an open panel`    |
| Enter             | link in a panel                          | Follows the link; every panel closes                                                                | `link.test.tsx › Enter activates the link; Space does not`              |
| Escape            | on an open topic button, or in its panel | Closes that panel; focus to its button                                                              | `primary-navigation.stories.tsx › Keyboard`                             |
| Tab               | focus leaves the nav, wide, a panel open | The panel closes. Below 64rem nothing closes on focus-out                                           | `primary-navigation.stories.tsx › Keyboard`                             |
| Arrows, Home, End | anywhere                                 | Not handled: they scroll the page and are not prevented                                             | `navigation.test.tsx › Arrow keys, Home and End are not handled`        |

Escape in the open Menu panel (below 64rem, no topic open) closes the Menu and returns focus to it: that row is in `site-header.a11y.md`.

## Focus management

- Initial focus: not moved. Opening a panel keeps focus on its button.
- Trap: no.
- Restore to: Escape returns focus to the topic's button. A followed link moves the page; the app routes focus to the `h1` (`useRouteFocus`).
- Never obscured by: wide, the panel overlays the page but closes on focus-out, so it never covers the focused element (2.4.11). Nothing is sticky.

## Announcements

None. The state is `aria-expanded`.

## Consumer responsibilities

- One name per nav on the page, and at most seven topics. Each topic has its overview link text written in full ("All about children and education"), not templated.
- `current="page"` on the page's link comes from your router: pass `current` on that `MainMenu.Link`. The topic's `data-trail` follows it.

## Visual / modes

- Focus indicator: the token ring on every trigger and link.
- Target size: the nav-item height (44px, 32px compact from 64rem), at least 24px.
- forced-colors behaviour: the panel keeps a `CanvasText` border (the shadow drops); the trail keeps weight 600.
- reduced-motion behaviour: nothing animates.
- RTL: the row starts at the right, the chevrons are vertical and do not mirror.

## WCAG SCs covered

1.3.1, 1.3.2, 1.4.10, 1.4.13 (not applicable: nothing appears on hover or focus), 2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.11, 2.5.3, 4.1.2.

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
