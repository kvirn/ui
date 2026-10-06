# Accessibility contract: Navigation

- **APG pattern:** none needed for a list of links. A labelled `<nav>` landmark around a list of links is plain HTML, and it is not the [Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) pattern: nothing here opens or closes (that is NavigationMenu, M4). Never `role="menu"`.
- **Deviations:** none
- **Native elements used:** `<nav>` (the `navigation` landmark), `<ul>` and `<li>`. The links are [Link](../link/link.a11y.md): native `<a href>`.
- **Status:** alpha candidate (Plan 0043, with the T3 look and the horizontal class of Plan 0047, and `Navigation.Label` of Plan 0061). Gates green 2026-10-06, accessibility-reviewer pending, and it reads the whole contract. Manual AT is `pending`.
- **Tests:** `navigation.test.tsx` next to this file. `navigation.stories.tsx` and `navigation.fixture.tsx` in `apps/storybook/src/components/navigation/`. Design specs: `docs/design/navigation.md` (the structure and the service link) and `docs/design/navigation-link-options.md` (the look: the current page, the trail and the horizontal bar).

Navigation is a named landmark around a list of page links, with the current page marked and an optional second level. It adds no `tabindex`, no key handling, no state and no announcement: the links are the focusable parts and own the keys ([link.a11y.md](../link/link.a11y.md)). It is not a composite widget, so every link is a Tab stop and the arrow keys do nothing. It is a vertical list by default and a row that wraps with the class `kv-navigation--horizontal` on the root. Orientation is a look and not behaviour, so it is a class and not a prop, and it changes no role, key or name.

## Roles, states, properties

| Part                                      | Element / role                            | ARIA                                                                                       | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Navigation.Root                           | `<nav>` → `navigation` landmark           | `aria-label` from `label`, or the consumer's `aria-labelledby`                             | `class="kv-navigation"`. A name is required (2.4.1, 2.4.6): `label`, or `aria-labelledby` pointing at a visible heading, which is preferred where a heading exists. Also exported as `NavigationRoot`                                                                                                                                                                                                                                                                                                                    |
| Navigation.List                           | `<ul>` → `list`                           | `role="list"`                                                                              | `class="kv-navigation-list"`. A nested `Navigation.List` inside an `Navigation.Item` is a native nested list, so the level and the count are announced (1.3.1). The explicit `role="list"` keeps the list announced in Safari/VoiceOver, which drops it from a list with `list-style: none` (1.3.1). Also exported as `NavigationList`                                                                                                                                                                                   |
| Navigation.Item                           | `<li>` → `listitem`                       | none                                                                                       | `class="kv-navigation-item"`. Holds a Link, and optionally a nested `Navigation.List`. Also exported as `NavigationItem`                                                                                                                                                                                                                                                                                                                                                                                                 |
| Navigation.Label                          | `<span>`, plain text, no role             | the nested `Navigation.List` in the same item gets `aria-labelledby` with the label's `id` | `class="kv-navigation-label"`. A group's name (Plan 0061, design spec G8): the list is announced "Komponenter, list, 3 items" (1.3.1, 4.1.2). Not a heading, not a link, no `tabindex`, no handler. A list's own `aria-label` or `aria-labelledby` wins. The label registers in an effect, so the name is set on hydration and not in server HTML. Dev warnings `navigation-label-without-list` and `navigation-label-outside-item`. Also exported as `NavigationLabel`. Tests: `navigation.test.tsx › Navigation.Label` |
| the link in an item                       | `Link.Root` → `link`                      | `aria-current` from `current` on the Link                                                  | Owned by Link ([link.a11y.md](../link/link.a11y.md)). **Exactly one link per navigation has it**: `"page"` when the page is listed, otherwise `"true"` (`current` with no value) on the deepest item shown. Never on an ancestor of a listed page, and never on a link inside a `hidden` group. The default theme draws it as a solid fill at weight 600, so it is never shown by colour alone (1.4.1)                                                                                                                   |
| the ancestors of the current link (trail) | the same `link`s                          | none                                                                                       | Visual only: a quiet fill and weight 600, found by CSS `:has()`, so there is nothing to mark. Not announced, and never `aria-current`: ARIA allows one current item per set, and the nesting of the lists carries the hierarchy for assistive technology                                                                                                                                                                                                                                                                 |
| Navigation.List with `hidden`             | `<ul hidden>`                             | the consumer's `hidden` attribute                                                          | A group you collapse is rendered with `hidden` and never unmounted: its links leave the Tab sequence and the accessibility tree, and the default theme keeps it collapsed without `reset.css`. The toggle that opens it is the consumer's. Test: `navigation.test.tsx › Tab skips a collapsed group`                                                                                                                                                                                                                     |
| Navigation.Root with the horizontal class | `className="kv-navigation--horizontal"`   | none                                                                                       | A look: the top level in a row that wraps. No `aria-orientation` and no arrow keys. Every link is still a Tab stop in DOM order, and there is no `orientation` prop                                                                                                                                                                                                                                                                                                                                                      |
| every part                                | `render` (element, function)              | the rendered element's own                                                                 | One element per part. A `render` element's own props are kept and the part's are merged in: `className` joins, `style` merges, refs merge. Root must stay a `<nav>` (or `role="navigation"`), or the landmark is gone                                                                                                                                                                                                                                                                                                    |
| every part                                | attributes                                | passed through                                                                             | `id`, `lang`, `hidden`, `data-*`, `aria-*` reach the element. The part's class is its own: a `className` prop and a `render` element's class join it, never replace it                                                                                                                                                                                                                                                                                                                                                   |
| every part                                | never                                     | no `role` other than the list's (the elements have it), no `tabindex`, no `aria-hidden`    | No click handler, no heading, no live region, no text. `label` is the only string, and it is the consumer's                                                                                                                                                                                                                                                                                                                                                                                                              |
| Root                                      | no name                                   | –                                                                                          | Dev warning `navigation-without-name`. An empty or whitespace-only `label` counts as no name                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Root                                      | another `nav` landmark with the same name | –                                                                                          | Dev warning `navigation-duplicate-name:<name>`, once per name. Any `<nav>` or `role="navigation"` on the page counts, not only Navigation's                                                                                                                                                                                                                                                                                                                                                                              |
| Root                                      | more than one link with `aria-current`    | –                                                                                          | Dev warning `navigation-multiple-current:<name>`, once per name, checked in an effect after commit (4.1.2, 1.3.1). Every `aria-current` other than `"false"` counts, a nested link and a link inside a `hidden` group too. Tests: `navigation.test.tsx › development warnings`                                                                                                                                                                                                                                           |

`useNavigation({ label })` gives the same `rootProps` (class and `aria-label`), `listProps` and `itemProps` for your own elements.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Each link is a native `<a href>` and its own Tab stop, in DOM order, which is also the visual order: in a horizontal bar too, where right to left the order starts at the right. There is no roving tabindex and no arrow-key navigation: this is a list of links, not a menu. The links own Enter ([link.a11y.md](../link/link.a11y.md)). Navigation never moves focus. A group rendered with `hidden` is out of the Tab sequence.

| Key                                                       | Context                        | Action                                                                                     | Test                                                                                       |
| --------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Tab                                                       | before or in the navigation    | Moves to the next link, nested links in DOM order included, then out of the nav            | `navigation.test.tsx › Tab moves through the links in DOM order, nested ones included`     |
| Tab                                                       | a group rendered with `hidden` | Skips it: its links are not Tab stops                                                      | `navigation.test.tsx › Tab skips a collapsed group`                                        |
| Tab                                                       | a group's label                | The label is no Tab stop: focus goes from the link before it to the first link of its list | `navigation.test.tsx › the label is no Tab stop: Tab goes from link to link past it`       |
| Shift+Tab                                                 | on a link                      | Moves to the previous link, then out of the navigation                                     | `navigation.test.tsx › Shift+Tab moves back through the links, then out of the navigation` |
| Enter                                                     | on a link                      | Follows the link                                                                           | `navigation.test.tsx › Enter follows the link`                                             |
| ArrowUp / ArrowDown / ArrowLeft / ArrowRight / Home / End | on a link                      | Arrow keys, Home and End are not handled: focus stays on the link                          | `navigation.test.tsx › Arrow keys, Home and End are not handled`                           |

Space, Escape and the arrow keys are not handled. Space scrolls the page, as on any link. A horizontal bar has the same keys: Left and Right do nothing there either.

## Focus management

- Initial focus: not moved. Navigation never moves focus.
- Trap: no. Tab always leaves the navigation.
- Restore to: not applicable. Where focus goes after a link is followed is the router's or the app's job (for example, to the new page's `h1`).
- Never obscured by: Navigation renders no overlay and sets no `overflow`, so a link's focus ring is never clipped (2.4.11, 2.4.13). In a horizontal bar the 8px gaps keep one item's ring clear of the next item's fill.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Navigation announces nothing. The current page is announced by the browser through `aria-current` on its link, and the level of a nested list by its native list semantics. The trail is not announced.

### Message keys

None. The name is the consumer's `label` or `aria-labelledby`, in the consumer's own translations. A new-tab notice in a link is Link's (`link.newTabNotice`).

## Consumer responsibilities

- **Name every navigation, and give each a different name** (2.4.1, 2.4.6): "Huvudmeny", "I det här avsnittet". Prefer `aria-labelledby` pointing at a visible heading where there is one. Don't put "navigation" or "meny" in the label when the landmark role already says it, unless the name would be empty without it.
- **Mark exactly one current link per navigation** (4.1.2). `current="page"` goes on the link to the page. When the page isn't in the navigation (a case page, a menu that stops above it, a header bar of sections), `current` with no value goes on the deepest item shown, which gives `aria-current="true"` (GOV.UK's "active" item). Never on an ancestor of a listed page, and never on a link inside a `hidden` group: when the page is inside a collapsed group, the deepest item shown takes it. Navigation doesn't detect the page from the router, and a development warning fires when two links have it.
- **Collapse a group with `hidden`, never by unmounting it.** Its links stay in the DOM but leave the Tab sequence and the accessibility tree. The toggle that opens it is yours (a `Button` with `aria-expanded` and `aria-controls`): Navigation has no toggle, and a disclosure that Navigation manages is NavigationMenu (M4).
- **A horizontal bar is one level.** A nested list stays a column under its item. Give a section's sub-links a second `Navigation` with its own name. Flyouts and collapsing are NavigationMenu.
- **Link text** says where the link goes, in context (2.4.4). No "click here".
- **Two levels at most on resident pages.** A staff or CMS sidebar may go deeper, with the trail showing the way (four levels in the `ActiveTrail` story). A menu that opens and closes is NavigationMenu (M4), not a longer list.
- **A group label** is a `Navigation.Label` in the `Navigation.Item`, next to the nested list it names, with text from your own translations (`lang` is yours too). Don't use a heading or a fake link for it. There is no `Navigation.Group` part (Plan 0047).
- **Don't wrap a link in anything focusable.** Each item holds one link and an optional nested list.
- **Skip link and landmark order** belong to the page, not the component (2.4.1).

## Visual / modes

Headless: Navigation ships no CSS. With `@kvirn-ui/theme/theme.css` (design specs `docs/design/navigation.md` and `docs/design/navigation-link-options.md`):

- Focus indicator: the `.kv-link` ring, 2px at 3:1, 2px outside the item (2.4.7, 2.4.13). Around the solid fill the offset band is what tells the ring from the fill. Test: `navigation.stories.tsx › FocusVisible` (play) for the current page.
- Target size: every item is at least 24 × 24 CSS px, in a list and in a bar: 44px high by default and 32px in compact density (2.5.8). Test: `navigation.stories.tsx › CompactDensity` and `› Horizontal` (play) assert the 24px threshold.
- Current page: a solid `primary` fill with an `on-primary` label at weight 600. The fill is a shape at 3:1 or more against the surface, and 600 against 400 is a second cue, so it is never shown by colour alone (1.4.1). The trail, every ancestor of it, is the quiet `primary-subtle` fill at weight 600, found with `:has()`. Everything else is `text` at weight 400, with no fill and the link's 2px underline on hover and press.
- Forced colours: the fills drop (`Canvas`, with `LinkText` labels). The current item gets a straight `LinkText` bar, never a border on the rounded box: at the inline start of a list item and under the label in a horizontal bar. The trail keeps weight 600. The weight cue has no automated check (it would read the computed weight, which hard rule 13 forbids): it is checked by eye in the `ForcedColors` story.
- Group label: `label-compact` type in `text-muted`, at every density, aligned with the links' text, with `space-4` above it from the second item on. `text-muted` on `surface` is already measured in `theme:check` (1.4.3). Forced colours: `CanvasText`.
- Contrast: every pair is in `theme:check` (1.4.3, 1.4.11): `on-primary` on `primary` (4.70:1, the lowest text pair, at 14px and weight 600 in compact density: it passes with no margin), `text` on `primary-subtle`, `text` on the plain backgrounds for the hover underline, and `primary` against the canvas, a surface and a raised surface as the fill.
- reduced-motion behaviour: the link's colour, underline and background transition only under `prefers-reduced-motion: no-preference`.
- RTL: logical properties only. The nested indent and the forced-colours bar sit at the inline start (the right), and a horizontal bar starts at the right.
- Horizontal (`kv-navigation--horizontal`): the top level is a row that wraps with 8px gaps. Each item is as wide as its label, up to the row, so a longer label wraps inside its item. One level: a nested list stays an indented column under its item.
- Collapsed groups: a `hidden` group is `display: none`, so it stays collapsed without `reset.css`.
- Reflow and text spacing: a vertical list by default and a row that wraps in a bar, with `overflow-wrap: anywhere`. No horizontal scrolling at 320 CSS px with the Finnish fixtures, vertical and horizontal (the `LongFinnishText` and `HorizontalLongFinnishText` stories, in the dedicated sweep).

## WCAG SCs covered

- 1.3.1 Info and Relationships: a `<nav>` landmark, native lists and nesting (`navigation.test.tsx › renders a named navigation landmark …`, `› a nested list sits inside an item …`). The trail is visual, and the list nesting carries the hierarchy.
- 1.4.1 Use of Color: the current page is a fill and weight 600, and the trail is weight 600 (default theme). In forced colours the current page is a bar and weight, and the trail is weight.
- 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast: `theme:check` pairs.
- 1.4.10 Reflow, 1.4.12 Text Spacing: the Finnish fixtures at 320px, vertical and horizontal, `overflow-wrap`, no fixed heights or widths.
- 2.4.1 Bypass Blocks, 2.4.6 Headings and Labels: a named landmark and a named group (`Navigation.Label`), with a dev warning for no name and for a duplicate name (`navigation.test.tsx › development warnings`).
- 2.1.1 Keyboard, 2.4.3 Focus Order: native links in DOM order, and a `hidden` group skipped (the Keyboard rows above).
- 2.4.4 Link Purpose (In Context): the consumer's link text.
- 2.4.7 Focus Visible, 2.4.13 Focus Appearance: the link ring.
- 2.5.8 Target Size (Minimum): the 24px threshold in the compact and horizontal stories.
- 4.1.2 Name, Role, Value: the landmark's name, and exactly one `aria-current` per navigation, with a dev warning for two (`navigation.test.tsx › development warnings`).

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

- **List semantics in Safari.** The default theme draws no list marker, and Safari (VoiceOver) drops the list semantics of such a list, so the lists carry `role="list"`. Check "list, 4 items" and the nested level in VoiceOver + Safari in the manual AT run.
- **The trail is visual only.** The ancestors of the current page are drawn as a quiet bold trail, but never marked with `aria-current` and not announced. A screen reader user gets the hierarchy from the list nesting, and a Breadcrumb (M3) is the announced path. How well the nesting reads is part of the manual AT run, which is `pending`.
- **A solid fill can be read as keyboard focus.** A Listbox's active option and a pressed Toggle are solid `primary` too. The ring sits 2px outside the fill. The usability test (design spec `navigation-link-options.md` §16) is `pending`, and the fallback is the quiet fill with a connector line, which is its own plan.
- **Two solid fills at once.** A header bar whose section carries `current` (`aria-current="true"`) next to a list whose page carries `"page"` draws two solid items. Whether `"true"` should draw the trail look is the design spec's open question Q-N2, and the approved rule stands as written. A bar has no second row for the trail branch either (Q-N1): give the section's sub-links a second `Navigation`.
- **`:has()` cost on very large trees** is not measured. The theme finds the trail with `:has()`, and a very large CMS tree could make it slow.
- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. A WebKit run is not automated, and the manual AT matrix is `pending`.
- **The group's name is set after hydration.** `Navigation.Label` registers in a layout effect, so the nested list gets `aria-labelledby` on the client and not in the server HTML. Without JavaScript the list has no name, though the label text still comes before it in reading order.
