# Accessibility contract: Panel

- **APG pattern:** none. A panel is not a widget, so there is no APG pattern (ADR-0044).
- **Deviations:** none
- **Native elements used:** `<div>` by default. The consumer picks `<aside>`, `<section>`, `<nav>` or `<li>` with `render`, and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0018). Gates pending. Manual AT is `pending`.
- **Tests:** `panel.test.tsx` next to this file. `panel.stories.tsx` and `panel.e2e.ts` in `apps/storybook/src/components/panel/`.

Panel is a plain container for a region of the page, such as a sidebar or a band of content. It adds no role, no ARIA, no text, no `tabindex` and no behaviour. Everything a user perceives inside a panel comes from the consumer's children, which keep their own semantics and focus order. A panel is not the `Panel` part of Disclosure or Tabs: those are parts of another component.

## Roles, states, properties

| Part       | Element / role               | ARIA                                                    | Notes                                                                                                                                                                                                                                                       |
| ---------- | ---------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel.Root | `<div>` → `generic`          | none. The consumer adds it with the element             | `class="kv-panel"`. `render={<aside aria-labelledby>}`, `<section aria-labelledby>` or `<nav aria-labelledby>` give it a landmark role, and `<li>` a list item. `Panel` and `Panel.Root` are the same component. Also exported as `PanelRoot`               |
| Panel.Root | `render` (element, function) | the rendered element's own                              | One element. An element keeps its own props, and the part's are merged in: `className` joins, `style` merges, refs merge (ADR-0015)                                                                                                                         |
| Panel.Root | attributes                   | passed through                                          | `aria-*`, `id`, `lang`, `data-*` and every other attribute reach the element unchanged. The part's class is its own: a `className` prop and a `render` element's own `className` join it, never replace it. In the `render` function form, keep `className` |
| Panel.Root | never                        | no `role`, `aria-*`, `tabindex`, `inert`, `aria-hidden` | No click handler, no heading, no live region, no text                                                                                                                                                                                                       |

`usePanel()` gives the same `rootProps` (only `className`) for your own element.

## Keyboard

This component has no focusable parts and handles no keys.

Panel is never a Tab stop and never changes the Tab order. Its children handle their own keys. These rows prove Tab passes over the panel.

| Key       | Context                       | Action                                                        | Test                                                          |
| --------- | ----------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| Tab       | Panel with focusable children | Moves through the children in DOM order. The panel is skipped | `panel.e2e.ts › Tab moves through the children in DOM order`  |
| Shift+Tab | Panel with focusable children | Moves back through the children in reverse DOM order          | `panel.e2e.ts › Shift+Tab moves back through the children`    |
| –         | Root                          | No `tabindex` is rendered, so the panel never receives focus  | `panel.test.tsx › rendering › adds no role, ARIA or tabindex` |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Initial focus: not moved. Panel never moves focus.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Panel renders no overlay. The default theme never sets `overflow` on a panel, so a child's focus ring (2px, 2px offset) is never clipped (2.4.11, 2.4.13). Test: `panel.e2e.ts › the focus ring of a link at the edge of a small panel is not clipped`.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Panel renders no text, so it has no message keys.

## Consumer responsibilities

- **Headings.** Put a heading at the top of the panel, at the level the page outline needs: `h2` for a sidebar or a band under the page's `h1`. Panel can't know it (2.4.6, 1.3.1).
- **Landmarks are opt-in, and named.** The default `<div>` is not a landmark. `render={<aside aria-labelledby={headingId} />}` is complementary content, `render={<section aria-labelledby={headingId} />}` is a region worth jumping to, and `render={<nav aria-labelledby={headingId} />}` is a sidebar of navigation. A `<section>` without a name is `generic` (HTML-AAM), so it is useless as a landmark. Keep landmarks few: never make every band a landmark. A top-level `<header>` or `<footer>` becomes `banner` or `contentinfo`, so only one of each.
- **Reading and focus order.** The children's DOM order. A sidebar that sits on the inline end at `64rem` comes after the main content in the DOM. Never reorder with `order` or grid placement against the DOM (1.3.2, 2.4.3).
- **Lists.** A list of panels is a `<ul>` with each panel rendered as `<li>` (`render={<li />}`). The default theme draws no marker, and Safari can then expose the `<ul>` as a plain group: `role="list"` on the `<ul>` keeps it a list there (same open question as Card, see ADR-0022). Check it in VoiceOver + Safari in the manual AT run.
- **Nesting.** A Card on a Panel, yes. A Panel inside a Card, no (a region inside a thing). A Panel inside a Panel only to switch between `surface` and `canvas`.
- **Scrolling.** Never `overflow` on the Panel. A sidebar that scrolls on its own goes in a `kv-scroll-region` with a name and `tabindex="0"`. A sticky sidebar needs `scroll-padding` (2.4.11).
- **Not empty.** Don't render a Panel with no content: it still has padding and a surface.
- **Language.** `lang` on any panel in another language (3.1.2).

## Visual / modes

Headless: Panel ships no CSS. With `@kvirn-ui/theme/theme.css` (design spec `docs/design/panel.md`):

- Focus indicator: none of its own (a panel is never focused). Children keep their own rings, never clipped.
- Target size: not applicable. Panel has no controls of its own (2.5.8).
- Contrast: text, links, muted text, control edges and focus rings are held to their minimums on `surface` and `canvas` by `theme:check` (1.4.3, 1.4.11). The panel's own boundary is decorative (1.06–1.10:1 from the page): the region is identified by its position, its heading and, where it is worth it, its landmark.
- forced-colors behaviour: `surface` and `canvas` both become `Canvas`, and the panel's 1px border is `CanvasText` on all four sides. Test: `panel.e2e.ts › the panel border is visible in forced colours` (`chromium-forced-colors`).
- reduced-motion behaviour: no motion. No hover, transition or pointer style.
- Reflow and text spacing: no fixed sizes, no `overflow`, `overflow-wrap: break-word`, and the panel can shrink in a grid (`theme-css.test.ts › never clips, never fixes a height, has no radius and no shadow`). Media directly in the panel never get wider than it. No horizontal scrolling at 320 CSS px with the Finnish fixture (`reflow-320`, `panel.e2e.ts › an image in a panel fits at 320px (1.4.10)`). With the 1.4.12 text-spacing overrides at 320px, the panel grows and nothing is clipped (`panel.e2e.ts › text spacing overrides clip nothing at 320px (1.4.12): <story>`).
- `kv-panel--padding-none` with a focusable child flush to a viewport edge would push the ring's outer 4px off-screen: `none` is for frames whose children pad themselves, and for media.

## WCAG SCs covered

- 1.3.1 Info and Relationships: no role of its own, so the consumer's element and children decide the semantics (`panel.test.tsx`).
- 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: DOM order equals reading and focus order (e2e rows above).
- 1.4.3 Contrast (Minimum), 1.4.6, 1.4.11 Non-text Contrast: `theme:check` pairs on `surface` and `canvas`.
- 1.4.10 Reflow: `reflow-320` e2e, the Finnish fixture story, and a wide image at 320px.
- 1.4.12 Text Spacing: e2e with the text-spacing overrides at 320px.
- 2.4.1 Bypass Blocks: a named landmark helps screen-reader users skip to it, where the consumer opts in.
- 2.4.11 Focus Not Obscured (Minimum), 2.4.13 Focus Appearance: no clipping (e2e).
- 4.1.2 Name, Role, Value: no role or name of its own to get wrong. A landmark's name is the consumer's.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta, ADR-0004)**   |         |        |        |       |
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

- **No visible region edge in the contrast themes.** `surface` on `canvas` is 1.06:1 in light-contrast and 1.10:1 in dark-contrast, the same as the standard themes, so a sidebar there has no visible edge unless the consumer colours one (`border-inline-end-color: var(--kv-color-border-subtle)`). Decorative for WCAG, but a usability question (design spec §10.1, ADR-0044). Usability test result: `pending`.
- **WebKit not run locally.** The `webkit` and `mobile-safari` Playwright projects need system libraries that aren't installed on the development machine. CI runs them.
