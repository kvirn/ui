# Accessibility contract: TableOfContents

- **APG pattern:** none needed. A labelled `<nav>` landmark around a nested list of in-page links is plain HTML. It is not a composite widget, not a tree and not the [Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) pattern: nothing here opens or closes. Never `role="menu"` or `role="tree"`.
- **Deviations:** none
- **Native elements used:** `<nav>` (the `navigation` landmark), `<ul>` and `<li>`, and native `<a href="#id">` links. The page's own headings are the targets.
- **Status:** alpha candidate. Reviewer findings fixed 2026-10-06 (role list), accessibility-reviewer re-review pending. Manual AT is `pending`.
- **Tests:** `table-of-contents.test.tsx` next to this file, and the pure maths in `packages/core/src/table-of-contents/`. `table-of-contents.stories.tsx` in `apps/storybook/src/components/table-of-contents/`. Design spec: `docs/design/table-of-contents.md`.

TableOfContents lists the headings of a long page as plain links, and marks the one the reader is in. It adds no `tabindex`, no key handling, no live region and no focus movement: the links are native, they are the focusable parts, and the browser owns what following one does. It is not a composite widget, so every link is a Tab stop and the arrow keys do nothing.

## Roles, states, properties

| Part                 | Element / role                  | ARIA                                                                                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TableOfContents.Root | `<nav>` → `navigation` landmark | `aria-label` from `tableOfContents.label`, or the consumer's `aria-labelledby` (a prop, or `labelledBy` on the hook) | `class="kv-table-of-contents"`. Never both names (2.4.1 Bypass Blocks, A; 2.4.6 Headings and Labels, AA). A visible heading with `aria-labelledby` is preferred, and it replaces the message. An `aria-label` of your own wins over the message. Empty `items` render nothing, so there is no empty landmark and a title drawn in its function child goes with it. Also exported as `TableOfContentsRoot` |
| TableOfContents.List | `<ul>` → `list`                 | `role="list"`                                                                                                        | `class="kv-table-of-contents-list"`. A nested level is another list inside an item: a native nested list, so the depth and the count are announced (1.3.1 Info and Relationships, A). The explicit `role="list"` keeps the list announced in Safari/VoiceOver, which drops it from a list with `list-style: none` (1.3.1 Info and Relationships, A). Also exported as `TableOfContentsList`               |
| TableOfContents.Item | `<li>` → `listitem`             | none                                                                                                                 | `class="kv-table-of-contents-item"`. Holds a Link, and optionally a nested List. Also exported as `TableOfContentsItem`                                                                                                                                                                                                                                                                                   |
| TableOfContents.Link | `<a href="#id">` → `link`       | `aria-current="location"` on the link of the heading being read, and on no other                                     | `class="kv-link"`, `data-current` on the same link and `data-focus-visible` while it has keyboard focus. Always a plain hash link: never `Link.Root`, never the registered router link, and no click handler, so it works before the script has run. The text is the entry's `label`. Also exported as `TableOfContentsLink`                                                                              |
| the trail            | the current link's ancestors    | none                                                                                                                 | The headings above the current one in the tree get no attribute: the trail is visual only (the default theme styles it with a CSS rule), and bold text is not colour alone (1.4.1 Use of Color, A)                                                                                                                                                                                                        |
| List                 | `as`                            | the chosen element's own                                                                                             | One element, chosen with a string: only the List takes `as`. A value outside the list is a type error and, in JS, warns once in development and renders the default element. `className` joins, refs pass                                                                                                                                                                                                 |
| every part           | attributes                      | passed through                                                                                                       | `id`, `data-*`, `aria-*` reach the element. The part's class is its own: a `className` prop joins it, never replaces it                                                                                                                                                                                                                                                                                   |
| every part           | never                           | no `role` other than the list's, no `tabindex`, no `aria-hidden`                                                     | No heading, no live region, no `aria-live`, no sticky positioning and no scrolling of its own. `tableOfContents.label` is the only string, and a visible title is the consumer's                                                                                                                                                                                                                          |
| Root                 | an entry whose id is on no page | –                                                                                                                    | A warning in development, once per id, names the missing id: the link goes nowhere. The link stays in the list                                                                                                                                                                                                                                                                                            |
| List, Item, Link     | outside a Root                  | –                                                                                                                    | A warning in development, once per part: it renders, but is in no named landmark and nothing is ever marked as current in it                                                                                                                                                                                                                                                                              |

`useTableOfContents({ items, offset, labelledBy, messages })` gives `rootProps` (the class and the name), `listProps`, `itemProps`, `tree`, `activeId` and `getLinkProps(item)` for your own elements.

### The current heading

- It is the last heading, in document order, above the line: the line is `offset` px plus 20% of the viewport height below `offset` (the top 20% band, as on most docs sites), and a heading counts when its top is at most 1px below it, for sub-pixel layout. Before any heading is that high, it is the first heading that is visible (its top is above the bottom of the viewport). At the end of a page that scrolls, it is the last heading, because a last section shorter than the viewport can never scroll its heading up to the line, unless a heading sits exactly on the line (a jump put it there), which is then current.
- Nothing is current only while no heading is visible, so a section on screen is never left without a current link.
- A heading that is `display: none` is skipped: it has no place on the page, so it would read as being above the line. A heading with no element at all warns.
- It is found in the browser after mount, by an `IntersectionObserver` (a browser feature that reports when an element comes into view) and passive `scroll` and `resize` listeners that only wake the measuring, at most once per animation frame. On the server, during hydration and where there is no `IntersectionObserver`, the list renders and nothing is current.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1 Info and Relationships, A; 4.1.2 Name, Role, Value, A). `as` is a string, so it works from a Server Component.

| Part             | `as`                 | Why                                                                                                                                                     |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List             | `ul` (default), `ol` | A contents list, optionally numbered; `role="list"` stays                                                                                               |
| Root, Item, Link | none                 | `<nav>` is the landmark (2.4.1 Bypass Blocks, A), `<li>` and `<a href>` are the structure (1.3.1 Info and Relationships, A; 4.1.2 Name, Role, Value, A) |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Each link is a native `<a href>` and its own Tab stop, in DOM order, which is also the visual order. There is no roving tabindex and no arrow-key navigation: this is a list of links, not a menu or a tree. The component never moves focus. When the current heading changes while the reader scrolls, focus stays where it is.

| Key                                                       | Context               | Action                                                                                                                                                                | Test                                                                                             |
| --------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Tab                                                       | before or in the list | Moves to the next link, nested ones in DOM order included, then out of the list                                                                                       | `table-of-contents.test.tsx › Tab moves through the links in DOM order, nested ones included`    |
| Shift+Tab                                                 | on a link             | Moves to the previous link, then out of the list                                                                                                                      | `table-of-contents.test.tsx › Shift+Tab moves back through the links, then out of the contents`  |
| Enter                                                     | on a link             | Follows the hash, natively: the page scrolls to the heading (below a sticky header, by the page's `scroll-padding-top`), and the next Tab continues after the heading | `table-of-contents.test.tsx › Enter scrolls to the heading, and the next Tab continues after it` |
| ArrowUp / ArrowDown / ArrowLeft / ArrowRight / Home / End | on a link             | Not handled: they scroll the page, as anywhere. Focus stays on the link                                                                                               | `table-of-contents.test.tsx › Arrow keys, Home and End are not handled`                          |

Space and Escape are not handled. Space scrolls the page, as on any link.

Following a link to a heading is the browser's own fragment navigation (HTML, "scroll to the fragment"): it scrolls the heading into view, honours the page's `scroll-padding-top` and `scroll-behavior` (which the page sets to `smooth` only under `prefers-reduced-motion: no-preference`), and, because a heading isn't focusable, focus falls back to the viewport (`document.activeElement` is `body`) and the sequential focus starting point moves to the heading. This is native skip-link behaviour: the next Tab goes to the first focusable element after the heading, and Back returns to the previous position. The component adds nothing to it, and you should check it with your users' screen readers.

## Focus management

- Initial focus: not moved. TableOfContents never moves focus: not on load, not when the current heading changes, not on a click.
- Trap: no. Tab always leaves the list.
- Restore to: not applicable. What focus does when a link is followed is the browser's (see above), and Back returns to where the reader was.
- Never obscured by: it renders no overlay and is never sticky: where it sits is the page's layout. A sticky header the page adds can cover a heading a link scrolls to, and any focused element (Shift+Tab to a link above the viewport), so set `html { scroll-padding-top: <the header's height> }` (WCAG technique C43) and the same value as `offset` (2.4.11 Focus Not Obscured (Minimum), AA). A `scroll-margin-top` on the headings is an optional extra for the headings only: a heading never takes focus. A sticky column taller than the viewport scrolls on its own, or isn't sticky.

## Announcements

| Event                                 | Message key (i18n) | Politeness |
| ------------------------------------- | ------------------ | ---------- |
| the current heading changes (scrolls) | none               | –          |

Nothing is announced and nothing is live: there is no live region, because the current heading is state, not an event. A screen reader says "current location" when it reaches that link, and the level of a nested list by its native list semantics. A message for every heading the reader passes would be noise, and nothing here is a status message the reader needs (4.1.3 Status Messages, AA).

### Message keys

`tableOfContents.label`: the landmark's name when there is no `aria-labelledby`, for example `On this page` (English), `På den här sidan` (Swedish), `Tällä sivulla` (Finnish), `På denne siden` (Norwegian Bokmål) and `På denne sida` (Norwegian Nynorsk). Override it per provider and per instance (`messages={{ label }}`). The text of a visible title is the consumer's own. <!-- kv-lang-ok: the catalog strings of each locale -->

## Consumer responsibilities

- **Name it, and prefer a visible title** (2.4.1 Bypass Blocks, A; 2.4.6 Headings and Labels, AA). Render a real heading yourself, normally an `h2` with the words "On this page", the same words as the message (2.5.3 Label in Name, A), never muted, and point `aria-labelledby` at its id. TableOfContents renders no title. Two navigations on a page need two names.
- **Unique heading ids, and in the list too.** The id is the link's target (`#id`). A missing one warns in development and the link goes nowhere.
- **The link text is the heading's text** (2.4.4 Link Purpose (In Context), A; 2.4.6 Headings and Labels, AA), so the list reads as the page's outline. Write headings that say what the section is about ("Fees for building permits", not "More information").
- **Items in document order, and memoized.** A constant or `useMemo`. The order is the order on the page, not alphabetical.
- **`offset` equals `scroll-padding-top` on `html`,** which equals any sticky header's height (plus any `scroll-margin-top` you also put on the headings). If they differ, a heading a link scrolls to lands below the line and the one above it stays current.
- **No `<base href>`.** `#id` links would resolve against it and leave the page.
- **Two levels on resident pages** (`h2` and `h3`), and `h4` at most as a third. A page that needs more is split. Fewer than three sections need no list. One contents list per page.
- **Put it first in the DOM,** right after the page's `h1` and lead, so keyboard and screen reader users meet it before the article. In a side column from 64rem, at the inline start, so the DOM order and the visual order are the same. Below 64rem it stays above the article and is never sticky.
- **Smooth scrolling is the page's choice,** and only under `prefers-reduced-motion: no-preference`. The component never sets `scroll-behavior`.
- **Don't hide it from assistive technology** and don't make its links anything but links.

## Visual / modes

Headless: TableOfContents ships no CSS. With the default theme it uses the same rules as the navigation items:

- Focus indicator: the link's focus ring is at least 2px wide with 3:1 contrast (2.4.7 Focus Visible, AA). 2.4.13 Focus Appearance is AAA and is not counted toward AA. The ring is checked by eye.
- Target size: every item is at least 24 by 24 CSS pixels, in both densities (2.5.8 Target Size (Minimum), AA). The size is checked by eye in the compact density.
- The table of contents is always compact: small rows and small labels. The current heading is underlined and bold, with `aria-current`, and has no fill, so it is never colour alone (1.4.1 Use of Color, A). The headings above it, the trail, stay bold with no fill.
- Contrast: the theme draws no fill for it, so the only pair is the text colour on the page's background colours, which the theme already measures (1.4.3 Contrast (Minimum), AA). The underline is the text colour too (1.4.11 Non-text Contrast, AA).
- Reduced motion: the component never scrolls the page. The underline of the current heading changes over a short time only when the reader has not asked for reduced motion.
- Right-to-left languages: the indent sits at the start side, which is the right.
- Reflow and text spacing: a vertical list at every width, with long words allowed to break and nothing of a fixed size. The reflow sweep checks every story at 320 CSS pixels for sideways scrolling.
- If you restyle it, keep the focus ring, the target size and a mark for the current heading that is not colour alone.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): a `<nav>` landmark, native lists and nesting.
- 1.4.1 Use of Color (A): the current heading has an underline and weight, and the trail has weight (default theme).
- 1.4.3 Contrast (Minimum) (AA), 1.4.11 Non-text Contrast (AA): the colours are measured by the theme's automated contrast check.
- 1.4.10 Reflow (AA): the reflow sweep checks every story at 320 CSS pixels for sideways scrolling, with words allowed to break. 1.4.12 Text Spacing (AA): no fixed heights, and the text-spacing sweep applies the wider spacing to every story and fails on a box that clips text.
- 2.1.1 Keyboard (A), 2.4.3 Focus Order (A): native links in DOM order (the Keyboard rows above).
- 2.4.1 Bypass Blocks (A): a named landmark of links to the sections (WCAG technique G64, providing a table of contents), with a warning in development for a link that has no target.
- 2.4.4 Link Purpose (In Context) (A), 2.4.6 Headings and Labels (AA): the link text is the heading's text, and the landmark has a name.
- 2.4.7 Focus Visible (AA): the link ring. 2.4.13 Focus Appearance (AAA) is not counted toward AA.
- 2.4.11 Focus Not Obscured (Minimum) (AA): with `scroll-padding-top` on `html` equal to the sticky header's height, a focused link or a heading reached by a link is never under the header (the consumer's part; checked by eye).
- 2.5.8 Target Size (Minimum) (AA): the 24px threshold, checked by eye in the compact density.
- 3.2.1 On Focus (A): nothing moves focus and nothing changes context when the current heading changes.
- 4.1.2 Name, Role, Value (A): the landmark's name, `aria-current="location"` on the link.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                              |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                                    |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | table-of-contents.stories.tsx, every story, 4 themes                                                                               |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | table-of-contents.test.tsx › renders a navigation landmark named by aria-labelledby, with no aria-label; expectNoA11yViolations    |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 4 rows, each names a test (table-of-contents.test.tsx › Tab moves through the links in DOM order, nested ones included)            |
| Focus order and management                                                 | pass        | n/a         | pass    | table-of-contents.test.tsx asserts focus (toHaveFocus); first rule: Tab moves through the links in DOM order, nested ones included |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI                      |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                                    |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                    |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                                    |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                                    |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                    |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                                    |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                                    |

### What to check

- Tab through the list with NVDA + Chrome and VoiceOver + Safari: each link is read as a link with the heading text, in page order.
- Scroll slowly: the link of the section you are in is read as "current location" when you reach it, and nothing is announced while you scroll.
- Press Enter on a link: the page scrolls to the heading, the reading position moves there, and the next Tab continues after the heading.
- In a two-level list, the screen reader says it is a list and says when you enter the nested level.
- With a sticky header, follow a link and press Shift+Tab back: neither the heading nor the focused link is hidden.
- At 320px and 200% text, the list is one column with no sideways scroll.

## Known issues

- **Focus after a followed link is the browser's.** A heading isn't focusable, so after someone follows a link, focus falls back to the page (`document.activeElement` is `body`) and the browser moves the place Tab continues from to the heading. Check with NVDA, JAWS and VoiceOver in your target browsers that the reading position lands on the heading and the next Tab continues after it. Following a link moves the place Tab continues from, so this is not a failure. Workaround: if your own check shows that the reading position doesn't move, give the target headings `tabindex="-1"` (never `0`). The browser then focuses the heading and the theme's focus ring shows on it. Don't set `outline: none` on them.
- **List semantics in Safari.** The default theme draws no list marker, and Safari (VoiceOver) drops the list semantics of such a list, so the lists carry `role="list"`. Check that VoiceOver with Safari says "list, 3 items" and announces the nested level. The workaround is already in place: `role="list"` on every list. If you draw your own markup with the hook, keep `role="list"` on the lists.
- **People who use a keyboard may mistake the highlighted link for where their keyboard is.** The link to the section you're reading is underlined, and the underline moves as you scroll, so it can look like the focus ring. Test it with your users; a quiet background fill is the alternative.
- **`IntersectionObserver` does not report the last pixels of a scroll,** so passive `scroll` and `resize` listeners also wake the same measuring. The behaviour in WebKit and mobile Safari is checked by eye.
