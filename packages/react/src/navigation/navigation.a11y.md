# Accessibility contract: Navigation

- **APG pattern:** none needed for a list of links. A labelled `<nav>` landmark around a list of links is plain HTML, and it is not the [Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) pattern: nothing here opens or closes (that is NavigationMenu, M4). Never `role="menu"`.
- **Deviations:** none
- **Native elements used:** `<nav>` (the `navigation` landmark), `<ul>` and `<li>`. The links are [Link](../link/link.a11y.md): native `<a href>`.
- **Status:** alpha candidate (Plan 0043). Gates 1–5 pending, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `navigation.test.tsx` next to this file. `navigation.stories.tsx` and `navigation.e2e.ts` in `apps/storybook/src/components/navigation/`. Design spec: `docs/design/navigation.md`.

Navigation is a named landmark around a list of page links, with the current page marked and an optional second level. It adds no `tabindex`, no key handling, no state and no announcement: the links are the focusable parts and own the keys ([link.a11y.md](../link/link.a11y.md)). It is not a composite widget, so every link is a Tab stop and the arrow keys do nothing.

## Roles, states, properties

| Part                | Element / role                            | ARIA                                                              | Notes                                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation.Root     | `<nav>` → `navigation` landmark           | `aria-label` from `label`, or the consumer's `aria-labelledby`    | `class="kv-navigation"`. A name is required (2.4.1, 2.4.6): `label`, or `aria-labelledby` pointing at a visible heading, which is preferred where a heading exists. Also exported as `NavigationRoot`                 |
| Navigation.List     | `<ul>` → `list`                           | none                                                              | `class="kv-navigation-list"`. A nested `Navigation.List` inside an `Navigation.Item` is a native nested list, so the level and the count are announced (1.3.1). No `role="list"`. Also exported as `NavigationList`   |
| Navigation.Item     | `<li>` → `listitem`                       | none                                                              | `class="kv-navigation-item"`. Holds a Link, and optionally a nested `Navigation.List`. Also exported as `NavigationItem`                                                                                              |
| the link in an item | `Link.Root` → `link`                      | `aria-current="page"` from `current` on the Link                  | Owned by Link ([link.a11y.md](../link/link.a11y.md)). One current page per navigation. The default theme shows it with a bar and weight as well as colour (1.4.1)                                                     |
| every part          | `render` (element, function)              | the rendered element's own                                        | One element per part. A `render` element's own props are kept and the part's are merged in: `className` joins, `style` merges, refs merge. Root must stay a `<nav>` (or `role="navigation"`), or the landmark is gone |
| every part          | attributes                                | passed through                                                    | `id`, `lang`, `data-*`, `aria-*` reach the element. The part's class is its own: a `className` prop and a `render` element's class join it, never replace it                                                          |
| every part          | never                                     | no `role` (the elements have it), no `tabindex`, no `aria-hidden` | No click handler, no heading, no live region, no text. `label` is the only string, and it is the consumer's                                                                                                           |
| Root                | no name                                   | –                                                                 | Dev warning `navigation-without-name`. An empty or whitespace-only `label` counts as no name                                                                                                                          |
| Root                | another `nav` landmark with the same name | –                                                                 | Dev warning `navigation-duplicate-name:<name>`, once per name. Any `<nav>` or `role="navigation"` on the page counts, not only Navigation's                                                                           |

`useNavigation({ label })` gives the same `rootProps` (class and `aria-label`), `listProps` and `itemProps` for your own elements.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Each link is a native `<a href>` and its own Tab stop, in DOM order, which is also the visual order. There is no roving tabindex and no arrow-key navigation: this is a list of links, not a menu. The links own Enter ([link.a11y.md](../link/link.a11y.md)). Navigation never moves focus.

| Key       | Context                     | Action                                                                          | Test                                                                                     |
| --------- | --------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Tab       | before or in the navigation | Moves to the next link, nested links in DOM order included, then out of the nav | `navigation.e2e.ts › Tab moves through the links in DOM order, nested ones included`     |
| Shift+Tab | on a link                   | Moves to the previous link, then out of the navigation                          | `navigation.e2e.ts › Shift+Tab moves back through the links, then out of the navigation` |
| Enter     | on a link                   | Follows the link                                                                | `navigation.e2e.ts › Enter follows the link`                                             |
| –         | on a link                   | Arrow keys, Home and End are not handled: focus stays on the link               | `navigation.e2e.ts › Arrow keys, Home and End are not handled`                           |

Space, Escape and the arrow keys are not handled. Space scrolls the page, as on any link.

## Focus management

- Initial focus: not moved. Navigation never moves focus.
- Trap: no. Tab always leaves the navigation.
- Restore to: not applicable. Where focus goes after a link is followed is the router's or the app's job (for example, to the new page's `h1`).
- Never obscured by: Navigation renders no overlay and sets no `overflow`, so a link's focus ring is never clipped (2.4.11, 2.4.13).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Navigation announces nothing. The current page is announced by the browser through `aria-current="page"` on its link, and the level of a nested list by its native list semantics.

### Message keys

None. The name is the consumer's `label` or `aria-labelledby`, in the consumer's own translations. A new-tab notice in a link is Link's (`link.newTabNotice`).

## Consumer responsibilities

- **Name every navigation, and give each a different name** (2.4.1, 2.4.6): "Huvudmeny", "I det här avsnittet". Prefer `aria-labelledby` pointing at a visible heading where there is one. Don't put "navigation" or "meny" in the label when the landmark role already says it, unless the name would be empty without it.
- **Mark the current page** with `current="page"` on its `Link`. Navigation doesn't detect it from the router. One current page per navigation (4.1.2).
- **Link text** says where the link goes, in context (2.4.4). No "click here".
- **Two levels at most on resident pages.** A deeper tree, or a menu that opens and closes, is NavigationMenu (M4), not a longer list.
- **A group label inside a navigation** is a heading or text of your own, outside the list, for now. There is no `Navigation.Group` part (design spec §10).
- **Don't wrap a link in anything focusable.** Each item holds one link and an optional nested list.
- **Skip link and landmark order** belong to the page, not the component (2.4.1).

## Visual / modes

Headless: Navigation ships no CSS. With `@kvirn-ui/theme/theme.css` (design spec `docs/design/navigation.md`):

- Focus indicator: the `.kv-link` ring, 2px at 3:1 (2.4.7, 2.4.13). Test: `navigation.e2e.ts › a key-focused navigation link shows a focus indicator (2.4.7)`.
- Target size: every item is at least 24 × 24 CSS px, 44px by default and 32px in compact density (2.5.8). Test: `navigation.stories.tsx › CompactDensity` (play) asserts the 24px threshold.
- Current page: a background, a 4px inline-start bar and weight 600, so it is never shown by colour alone (1.4.1). In forced colours only the current item keeps its bar, in `LinkText`.
- Contrast: every pair is in `theme:check` (1.4.3, 1.4.11): `text` on `surface-raised` and `primary-subtle`, and `primary` as the bar.
- reduced-motion behaviour: the link's colour and background transition only under `prefers-reduced-motion: no-preference`.
- RTL: logical properties only. The bar and the nested indent sit at the inline end.
- Reflow and text spacing: a vertical list at every width, with `overflow-wrap: break-word`. No horizontal scrolling at 320 CSS px with the Finnish fixture (`reflow-320`, `navigation.e2e.ts › no horizontal scrolling at 320px with the Finnish text (1.4.10)`).

## WCAG SCs covered

- 1.3.1 Info and Relationships: a `<nav>` landmark, native lists and nesting (`navigation.test.tsx › renders a named navigation landmark …`, `› a nested list sits inside an item …`).
- 1.4.1 Use of Color: the current page has a bar and weight as well as colour (default theme).
- 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast: `theme:check` pairs.
- 1.4.10 Reflow, 1.4.12 Text Spacing: the Finnish fixture at 320px, `overflow-wrap`, no fixed heights.
- 2.4.1 Bypass Blocks, 2.4.6 Headings and Labels: a named landmark, with a dev warning for no name and for a duplicate name (`navigation.test.tsx › development warnings`).
- 2.1.1 Keyboard, 2.4.3 Focus Order: native links in DOM order (e2e rows above).
- 2.4.4 Link Purpose (In Context): the consumer's link text.
- 2.4.7 Focus Visible, 2.4.13 Focus Appearance: the link ring.
- 2.5.8 Target Size (Minimum): the 24px threshold in the compact story.
- 4.1.2 Name, Role, Value: the landmark's name, `aria-current` on the link.

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
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

## Known issues

- **List semantics in Safari.** The default theme draws no list marker, and Safari (VoiceOver) can drop the list semantics of a list without visible markers. The spec (§7) expects WebKit to keep them inside a `<nav>`, so there is no `role="list"`. Check "list, 4 items" and the nested level in VoiceOver + Safari in the manual AT run.
- **No parent-of-current cue.** Only the page itself is marked, never its ancestor section (design spec §10).
- **WebKit not run locally.** The `webkit` and `mobile-safari` Playwright projects need system libraries that aren't installed on the development machine. CI runs them.
