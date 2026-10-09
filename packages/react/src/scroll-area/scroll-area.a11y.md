# Accessibility contract: ScrollArea

- **APG pattern:** none. A scrollable region with native scrolling: the [`region` role](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/region.html) and a Tab stop only while it scrolls, so a keyboard user can scroll it (2.1.1).
- **Deviations:** none. Decisions (Plan 0079): native scrollbars only, never hidden or thinned; no `orientation` prop, because the native `overflow` already scrolls whichever axis overflows; `Table.ScrollRegion` is the first use and shares this logic.
- **Native elements used:** `<div>` (or `<section>` with `as`) that is a `role="region"` while it scrolls, or always with `region="always"`.
- **Status:** alpha candidate (Plan 0079). Gates pass once accessibility-reviewer returns APPROVE. Manual AT is `pending`.
- **Tests:** `scroll-area.test.tsx` next to this file. `scroll-area.stories.tsx` in `apps/storybook/src/components/scroll-area/`. `Table.ScrollRegion` is tested in `table.test.tsx`.

A ScrollArea holds content that may be wider or taller than its box, such as a wide table, a long code sample or a pasted block, and scrolls it with the browser's own scrollbars. While the content doesn't fit it is a named region you can Tab to and scroll with the arrow keys. When everything fits it is a plain `<div>`.

## Roles, states, properties

| Part            | Element / role                                                       | ARIA / state                                                                                                                                                                                                      | Notes                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ScrollArea      | `<div>`, `<div role="region">` while it scrolls or `region="always"` | `role="region"` only while the area is one: it overflows, or `region="always"`. `tabindex="0"` and `data-overflowing` only while it overflows. Not a region (nothing overflows): no role, no name, no `tabindex`. | Classes `kv-scroll-region kv-scroll-area`. Name it with your own `aria-labelledby` or `aria-label`, applied only once it is a region. A region with no name: a development warning |
| `useScrollArea` | the same attributes, for your own element                            | `scrollAreaProps`, `isOverflowing`, `isRegion`, `element`                                                                                                                                                         | Option `region`: `'overflow'` (default) or `'always'`. Spread `scrollAreaProps` on the element that scrolls                                                                        |

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1, 4.1.2). `as` is a string, so it works from a Server Component.

| Part       | `as`                       | Why                                                                                                                                                                                                                                                                                                                                     |
| ---------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ScrollArea | `div` (default), `section` | A scroll container is a `region` while it scrolls, so `section` adds nothing but is harmless. No landmark element (`nav`, `aside`, `main`) and no list: the area holds content, it is not content. A value outside the list is a type error and, in JS, warns once (`as-not-allowed:ScrollArea:<tag>`) and renders the default element. |

## Keyboard

- **Focus strategy:** native: the area is one Tab stop while it overflows, and scrolls with the browser's own keys
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key                    | Context             | Action                                                                           | Test                                                                                                                                                                                                                                 |
| ---------------------- | ------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tab                    | before the area     | Moves to the area when it overflows, and past it when nothing scrolls            | `scroll-area.test.tsx › Tab focuses the area when it overflows`, `scroll-area.test.tsx › Tab skips the area when nothing scrolls`                                                                                                    |
| Shift+Tab              | after the area      | Moves back to the area when it overflows, and to the element before it otherwise | `scroll-area.test.tsx › Shift+Tab moves back to the area when it overflows`                                                                                                                                                          |
| ArrowDown / ArrowUp    | on the focused area | Scrolls the area down or up (native)                                             | `scroll-area.test.tsx › ArrowDown scrolls the focused area`, `scroll-area.test.tsx › ArrowUp scrolls the focused area back up`                                                                                                       |
| ArrowRight / ArrowLeft | on the focused area | Scrolls the area sideways (native, flips in RTL)                                 | `scroll-area.test.tsx › ArrowRight scrolls the focused area sideways`, `scroll-area.test.tsx › ArrowLeft scrolls the area sideways in right-to-left`, `scroll-area.test.tsx › ArrowRight scrolls the area sideways in right-to-left` |
| PageDown / PageUp      | on the focused area | Scrolls the area a page down or up (native)                                      | `scroll-area.test.tsx › PageDown scrolls the focused area a page`, `scroll-area.test.tsx › PageUp, Home and End scroll the focused area`                                                                                             |
| Home / End             | on the focused area | Scrolls to the start or the end (native)                                         | `scroll-area.test.tsx › PageUp, Home and End scroll the focused area`                                                                                                                                                                |
| Space                  | on the focused area | Scrolls the area a page down (native)                                            | `scroll-area.test.tsx › Space scrolls the focused area a page`                                                                                                                                                                       |
| Escape and letters     | on the focused area | Nothing. There is no type-ahead and no shortcut                                  | `scroll-area.test.tsx › Escape and letters do nothing`                                                                                                                                                                               |

## Focus management

- **Initial focus:** none. The area never moves focus.
- **Trap:** no. Tab always leaves the area.
- **Restore to:** n/a.
- **The area stays a region and a Tab stop while it holds focus,** even if the content stops overflowing (a wider window, zooming out): taking the role and the tab stop from the focused element would drop focus to the page. It lets go once focus leaves.
- **Never obscured by:** nothing. The theme draws a focus ring on the area, and a focused control inside it scrolls into view natively.

## Announcements

None. The role and name are the announcement.

### Read aloud

| State or action                     | Expected phrase(s) as read aloud | Live region politeness | Test     |
| ----------------------------------- | -------------------------------- | ---------------------- | -------- |
| The content fits                    | the content only, no region      | none                   | none yet |
| The content overflows               | `region, <name>`                 | none                   | none yet |
| `region="always"`, the content fits | `region, <name>`                 | none                   | none yet |
| Tab onto the overflowing area       | `<name>, region`                 | none                   | none yet |

These rows are read from the DOM (role, name, state) and are not tested with `readAloud` until the `@kvirn-ui/testing/read-aloud` helper ships (Plan 0077). The role, name and Tab stop are asserted in `scroll-area.test.tsx`. The manual AT matrix stays `pending`.

## Consumer responsibilities

- **Without the theme, set `overflow: auto`** (the theme's `kv-scroll-region` does it). The component sets no style, so an unstyled area doesn't scroll.
- **Name it** with `aria-labelledby` (a heading or caption) or `aria-label`, and say what is inside. A region without a name is read as an unlabelled landmark (4.1.2).
- **Limit its height with CSS** (`max-block-size`) to scroll down as well as sideways. The component sets no size.
- **Keep the content reachable:** controls inside keep their own Tab stops, so don't hide the scrollbars or turn off native scrolling.
- **Don't scroll the page's main content inside a nested area** without a reason: a scroll area inside a scroll area is hard to use.

## Visual / modes

- **Focus indicator:** the default theme draws a focus ring on `kv-scroll-region` (2.4.7, 2.4.11), a `Highlight` outline in forced colours.
- **Target size:** n/a, native scrollbars.
- **forced-colors:** the focus ring is `Highlight`. Native scrollbars follow the system colours.
- **reduced-motion:** no motion.
- **Reflow and zoom:** the area scrolls its own content, so a wide table doesn't make the page scroll sideways at 320 px (1.4.10).
- **RTL:** native: the scroll origin and the arrow keys flip.

## WCAG SCs covered

| SC     | Name                   | How                                                                                       |
| ------ | ---------------------- | ----------------------------------------------------------------------------------------- |
| 1.3.1  | Info and Relationships | A named region only while it scrolls                                                      |
| 1.4.10 | Reflow                 | Content that is wider than the viewport scrolls inside the area                           |
| 2.1.1  | Keyboard               | A Tab stop while it scrolls, and the native scroll keys                                   |
| 2.4.7  | Focus Visible          | A focus ring on the area                                                                  |
| 2.4.11 | Focus Not Obscured     | Nothing covers the area                                                                   |
| 4.1.2  | Name, Role, Value      | `role="region"` and a name from the consumer, with a development warning when it has none |

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

What the manual run must check: the region is announced with its name only while it scrolls, and a keyboard user can scroll it.

## Known issues

- Safari doesn't make a scrollable `<div>` a Tab stop by itself, which is why the area sets `tabindex="0"` while it scrolls.
