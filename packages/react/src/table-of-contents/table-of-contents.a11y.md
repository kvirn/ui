# Accessibility contract: TableOfContents

- **APG pattern:** none needed. A labelled `<nav>` landmark around a nested list of in-page links is plain HTML. It is not a composite widget, not a tree and not the [Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) pattern: nothing here opens or closes. Never `role="menu"` or `role="tree"`.
- **Deviations:** none
- **Native elements used:** `<nav>` (the `navigation` landmark), `<ul>` and `<li>`, and native `<a href="#id">` links. The page's own headings are the targets.
- **Status:** in progress (Plan 0049). Gates 1–5 pending, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `table-of-contents.test.tsx` next to this file, and the pure maths in `packages/core/src/table-of-contents/`. `table-of-contents.stories.tsx` and `table-of-contents.e2e.ts` in `apps/storybook/src/components/table-of-contents/`. Design spec: `docs/design/table-of-contents.md`.

TableOfContents lists the headings of a long page as plain links, and marks the one the reader is in. It adds no `tabindex`, no key handling, no live region and no focus movement: the links are native, they are the focusable parts, and the browser owns what following one does. It is not a composite widget, so every link is a Tab stop and the arrow keys do nothing.

## Roles, states, properties

| Part                 | Element / role                  | ARIA                                                                                                                 | Notes                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TableOfContents.Root | `<nav>` → `navigation` landmark | `aria-label` from `tableOfContents.label`, or the consumer's `aria-labelledby` (a prop, or `labelledBy` on the hook) | `class="kv-table-of-contents"`. Never both names (2.4.1, 2.4.6). A visible heading with `aria-labelledby` is preferred, and it replaces the message. An `aria-label` of your own wins over the message. Empty `items` render nothing, so there is no empty landmark and a title drawn in its function child goes with it. Also exported as `TableOfContentsRoot` |
| TableOfContents.List | `<ul>` → `list`                 | none                                                                                                                 | `class="kv-table-of-contents-list"`. A nested level is another list inside an item: a native nested list, so the depth and the count are announced (1.3.1). No `role="list"`. Also exported as `TableOfContentsList`                                                                                                                                             |
| TableOfContents.Item | `<li>` → `listitem`             | none                                                                                                                 | `class="kv-table-of-contents-item"`. Holds a Link, and optionally a nested List. Also exported as `TableOfContentsItem`                                                                                                                                                                                                                                          |
| TableOfContents.Link | `<a href="#id">` → `link`       | `aria-current="location"` on the link of the heading being read, and on no other                                     | `class="kv-link"`, `data-current` on the same link and `data-focus-visible` while it has keyboard focus. Always a plain hash link: never `Link.Root`, never the registered router link, and no click handler, so it works before the script has run. The text is the entry's `label`. Also exported as `TableOfContentsLink`                                     |
| the trail            | the current link's ancestors    | none                                                                                                                 | The headings above the current one in the tree get no attribute: the trail is visual only (a `:has()` rule in the theme), and weight 600 is not colour alone (1.4.1)                                                                                                                                                                                             |
| every part           | `render` (element, function)    | the rendered element's own                                                                                           | One element per part. A `render` element's own props are kept and the part's are merged in: `className` joins, `style` merges, refs merge. Root must stay a `<nav>` (or `role="navigation"`), and a Link an `<a>` with an `href`                                                                                                                                 |
| every part           | attributes                      | passed through                                                                                                       | `id`, `lang`, `data-*`, `aria-*` reach the element. The part's class is its own: a `className` prop and a `render` element's class join it, never replace it                                                                                                                                                                                                     |
| every part           | never                           | no `role`, no `tabindex`, no `aria-hidden`                                                                           | No heading, no live region, no `aria-live`, no sticky positioning and no scrolling of its own. `tableOfContents.label` is the only string, and a visible title is the consumer's                                                                                                                                                                                 |
| Root                 | an entry whose id is on no page | –                                                                                                                    | Dev warning `table-of-contents-missing-heading:<id>`, once per id: the link goes nowhere. The link stays in the list                                                                                                                                                                                                                                             |
| List, Item, Link     | outside a Root                  | –                                                                                                                    | Dev warning `table-of-contents-<part>-outside-root`, once per part: it renders, but is in no named landmark and nothing is ever marked as current in it                                                                                                                                                                                                          |

`useTableOfContents({ items, offset, labelledBy, messages })` gives `rootProps` (the class and the name), `listProps`, `itemProps`, `tree`, `activeId` and `getLinkProps(item)` for your own elements.

### The current heading

- It is the last heading, in document order, that has reached the line: its top is at most `offset` px from the top of the viewport, plus 1px for sub-pixel layout. At the end of a page that scrolls, it is the last heading, because a last section shorter than the viewport can never scroll its heading up to the line.
- Nothing is current until the reader has passed the first heading, and when they scroll back above it.
- A heading that is `display: none` is skipped: it has no place on the page, so it would read as being above the line. A heading with no element at all warns.
- It is found in the browser after mount, by an `IntersectionObserver` and one passive `scroll` listener that only wake the measuring, at most once per animation frame. On the server, during hydration and where there is no `IntersectionObserver`, the list renders and nothing is current. The effect is keyed by the ids and `offset`, never by the array, and it disconnects on unmount.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Each link is a native `<a href>` and its own Tab stop, in DOM order, which is also the visual order. There is no roving tabindex and no arrow-key navigation: this is a list of links, not a menu or a tree. The component never moves focus. When the current heading changes while the reader scrolls, focus stays where it is.

| Key               | Context               | Action                                                                                                                                              | Test                                                                                           |
| ----------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Tab               | before or in the list | Moves to the next link, nested ones in DOM order included, then out of the list                                                                     | `table-of-contents.e2e.ts › Tab moves through the links in DOM order, nested ones included`    |
| Shift+Tab         | on a link             | Moves to the previous link, then out of the list                                                                                                    | `table-of-contents.e2e.ts › Shift+Tab moves back through the links, then out of the contents`  |
| Enter             | on a link             | Follows the hash, natively: the page scrolls to the heading (below a sticky header, by the page's `scroll-padding-top`), and the next Tab continues after the heading | `table-of-contents.e2e.ts › Enter scrolls to the heading, and the next Tab continues after it` |
| Arrows, Home, End | on a link             | Not handled: they scroll the page, as anywhere. Focus stays on the link                                                                             | `table-of-contents.e2e.ts › Arrow keys, Home and End are not handled`                          |

Space and Escape are not handled. Space scrolls the page, as on any link.

Following a link to a heading is the browser's own fragment navigation (HTML, "scroll to the fragment"): it scrolls the heading into view, honours the page's `scroll-padding-top` and `scroll-behavior` (which the page sets to `smooth` only under `prefers-reduced-motion: no-preference`), and, because a heading isn't focusable, focus falls back to the viewport (`document.activeElement` is `body`) and the sequential focus starting point moves to the heading. This is native skip-link behaviour: the next Tab goes to the first focusable element after the heading, and Back returns to the previous position. The component adds nothing to it, and the manual AT matrix checks it in each browser and screen reader pair.

## Focus management

- Initial focus: not moved. TableOfContents never moves focus: not on load, not when the current heading changes, not on a click.
- Trap: no. Tab always leaves the list.
- Restore to: not applicable. What focus does when a link is followed is the browser's (see above), and Back returns to where the reader was.
- Never obscured by: it renders no overlay and is never sticky: where it sits is the page's layout. A sticky header the page adds can cover a heading a link scrolls to, and any focused element (Shift+Tab to a link above the viewport), so set `html { scroll-padding-top: <the header's height> }` (technique C43) and the same value as `offset` (2.4.11). A `scroll-margin-top` on the headings is an optional extra for the headings only: a heading never takes focus. A sticky column taller than the viewport scrolls on its own, or isn't sticky.

## Announcements

| Event                                 | Message key (i18n) | Politeness |
| ------------------------------------- | ------------------ | ---------- |
| the current heading changes (scrolls) | none               | –          |

Nothing is announced and nothing is live: there is no live region, because the current heading is state, not an event. A screen reader says "current location" when it reaches that link, and the level of a nested list by its native list semantics. A message for every heading the reader passes would be noise, and nothing here is a status message the reader needs (4.1.3).

### Message keys

`tableOfContents.label`: the landmark's name when there is no `aria-labelledby`, for example `On this page`, `På den här sidan`, `Tällä sivulla`, `På denne siden` and `På denne sida`. `se` is an English placeholder that needs a native review (`pending`). Override it per provider and per instance (`messages={{ label }}`). The text of a visible title is the consumer's own.

## Consumer responsibilities

- **Name it, and prefer a visible title** (2.4.1, 2.4.6). Render a real heading yourself, normally an `h2` with the words "På den här sidan" (the same as the message, 2.5.3), never muted, and point `aria-labelledby` at its id. TableOfContents renders no title. Two navigations on a page need two names.
- **Unique heading ids, and in the list too.** The id is the link's target (`#id`). A missing one warns in development and the link goes nowhere.
- **The link text is the heading's text** (2.4.4, 2.4.6), so the list reads as the page's outline. Write headings that say what the section is about ("Avgifter för bygglov", not "Mer information").
- **Items in document order, and memoized.** A constant or `useMemo`. The order is the order on the page, not alphabetical.
- **`offset` equals `scroll-padding-top` on `html`,** which equals any sticky header's height (plus any `scroll-margin-top` you also put on the headings). If they differ, a heading a link scrolls to lands below the line and the one above it stays current.
- **No `<base href>`.** `#id` links would resolve against it and leave the page.
- **Two levels on resident pages** (`h2` and `h3`), and `h4` at most as a third. A page that needs more is split. Fewer than three sections need no list. One contents list per page.
- **Put it first in the DOM,** right after the page's `h1` and lead, so keyboard and screen reader users meet it before the article. In a side column from 64rem, at the inline start, so the DOM order and the visual order are the same. Below 64rem it stays above the article and is never sticky.
- **Smooth scrolling is the page's choice,** and only under `prefers-reduced-motion: no-preference`. The component never sets `scroll-behavior`.
- **Don't hide it from assistive technology** and don't make its links anything but links.

## Visual / modes

Headless: TableOfContents ships no CSS. With `@kvirn-ui/theme/theme.css` (design spec `docs/design/table-of-contents.md`), it uses the navigation item rules:

- Focus indicator: the `.kv-link` ring, 2px at 3:1 (2.4.7, 2.4.13). Test: `table-of-contents.e2e.ts › a key-focused table of contents link shows a focus indicator (2.4.7)`.
- Target size: every item is at least 24 × 24 CSS px, 44px by default and 32px in compact density (2.5.8). Test: `table-of-contents.stories.tsx › CompactDensity` (play) asserts the 24px threshold.
- The current heading: a solid `primary` fill with an `on-primary` label at weight 600, and `aria-current`, so it is never colour alone (1.4.1). The headings above it, the trail, get the quiet fill at weight 600. In forced colours the fills drop: the current item gets a straight `LinkText` bar at the inline start and the trail keeps its weight.
- Contrast: every pair is Navigation's, already in `theme:check` (1.4.3, 1.4.11): `text` on `primary-subtle`, `on-primary` on `primary`, and `primary` on the plain backgrounds.
- reduced-motion behaviour: the component never scrolls the page. The current fill fades over 120ms only under `prefers-reduced-motion: no-preference`.
- RTL: logical properties only. The indent and the forced-colours bar sit at the inline start, on the right.
- Reflow and text spacing: a vertical list at every width, with `overflow-wrap: anywhere` and nothing fixed. No horizontal scrolling at 320 CSS px with the Finnish fixture (`table-of-contents.e2e.ts › no horizontal scrolling at 320px with the Finnish text (1.4.10)`).

## WCAG SCs covered

- 1.3.1 Info and Relationships: a `<nav>` landmark, native lists and nesting (`table-of-contents.test.tsx › nests the lists from the levels, so the depth is announced`, `› a skipped level nests one step`).
- 1.4.1 Use of Color: the current heading has a fill and weight as well as colour, and the trail has weight (default theme).
- 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast: `theme:check` pairs.
- 1.4.10 Reflow, 1.4.12 Text Spacing: the Finnish fixture at 320px, `overflow-wrap`, no fixed heights.
- 2.1.1 Keyboard, 2.4.3 Focus Order: native links in DOM order (e2e rows above).
- 2.4.1 Bypass Blocks: a named landmark of links to the sections (G124), with a dev warning for a link that has no target (`table-of-contents.test.tsx › a missing heading warns once, naming the id, and its link stays`).
- 2.4.4 Link Purpose (In Context), 2.4.6 Headings and Labels: the link text is the heading's text, and the landmark has a name (`table-of-contents.test.tsx › renders a navigation landmark named by aria-labelledby, with no aria-label`).
- 2.4.7 Focus Visible, 2.4.13 Focus Appearance: the link ring.
- 2.4.11 Focus Not Obscured: with `scroll-padding-top` on `html` equal to the sticky header's height, a focused link or a heading reached by a link is never under the header (the consumer's part; `table-of-contents.e2e.ts › StickyOffset: Shift+Tab after following a link is not under the header (2.4.11)`).
- 2.5.8 Target Size (Minimum): the 24px threshold in the compact story.
- 3.2.1 On Focus: nothing moves focus and nothing changes context when the current heading changes (`table-of-contents.e2e.ts › no focus movement and no live region on change`).
- 4.1.2 Name, Role, Value: the landmark's name, `aria-current="location"` on the link (`table-of-contents.test.tsx › scrolling to a heading makes its link the one aria-current="location"`).

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

- **Focus after a followed link is the browser's.** A heading isn't focusable, so focus falls back to the viewport (`document.activeElement` is `body`) and the sequential focus starting point moves to the heading. Check in the AT matrix that NVDA, JAWS and VoiceOver put the reading position at the heading, and that the next Tab continues after it, in each browser.
- **List semantics in Safari.** The default theme draws no list marker, and Safari (VoiceOver) can drop the list semantics of a list without visible markers. Check "list, 3 items" and the nested level in VoiceOver + Safari in the manual AT run.
- **"Mistaken for keyboard focus"** (design spec Q-C1). The solid fill of the current heading moves while the reader scrolls. The usability test, with the quiet fill and no trail as the fallback, is `pending`.
- **`IntersectionObserver` does not report the last pixels of a scroll,** so one passive `scroll` listener wakes the same measuring. WebKit and mobile Safari behaviour is checked in CI only and is `pending` here.
- **`se` is an English placeholder** for `tableOfContents.label` until a native review.
