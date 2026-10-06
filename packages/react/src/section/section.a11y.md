# Accessibility contract: Section

- **APG pattern:** none. A section is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` by default. The consumer picks `<aside>`, `<section>`, `<nav>` or `<li>` with `render`, and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0018). Gates pending. Manual AT is `pending`.
- **Tests:** `section.test.tsx` next to this file. `section.stories.tsx` in `apps/storybook/src/components/section/`.

Section is a plain container for a region of the page, such as a sidebar or a band of content. It adds no role, no ARIA, no text, no `tabindex` and no behaviour. Everything a user perceives inside a section comes from the consumer's children, which keep their own semantics and focus order. A section is not the `Section` part of Disclosure or Tabs: those are parts of another component.

## Roles, states, properties

| Part    | Element / role               | ARIA                                                    | Notes                                                                                                                                                                                                                                                        |
| ------- | ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Section | `<div>` → `generic`          | none. The consumer adds it with the element             | `class="kv-section"`. `render={<aside aria-labelledby>}`, `<section aria-labelledby>` or `<nav aria-labelledby>` give it a landmark role, and `<li>` a list item. `Section.Root` is a deprecated alias of the same component. Also exported as `SectionRoot` |
| Section | `render` (element, function) | the rendered element's own                              | One element. An element keeps its own props, and the part's are merged in: `className` joins, `style` merges, refs merge                                                                                                                                     |
| Section | attributes                   | passed through                                          | `aria-*`, `id`, `lang`, `data-*` and every other attribute reach the element unchanged. The part's class is its own: a `className` prop and a `render` element's own `className` join it, never replace it. In the `render` function form, keep `className`  |
| Section | never                        | no `role`, `aria-*`, `tabindex`, `inert`, `aria-hidden` | No click handler, no heading, no live region, no text                                                                                                                                                                                                        |

`useSection()` gives the same `rootProps` (only `className`) for your own element.

## Keyboard

This component has no focusable parts and handles no keys.

Section is never a Tab stop and never changes the Tab order. Its children handle their own keys. These rows prove Tab passes over the section.

| Key       | Context                         | Action                                                          | Test                                                                                             |
| --------- | ------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Tab       | Section with focusable children | Moves through the children in DOM order. The section is skipped | `section.test.tsx › the section is skipped by Tab: focus goes through its children in DOM order` |
| Shift+Tab | Section with focusable children | Moves back through the children in reverse DOM order            | `section.test.tsx › the section is skipped by Tab: focus goes through its children in DOM order` |
| –         | Root                            | No `tabindex` is rendered, so the section never receives focus  | `section.test.tsx › rendering › adds no role, ARIA or tabindex`                                  |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Initial focus: not moved. Section never moves focus.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Section renders no overlay. The default theme never sets `overflow` on a section, so a child's focus ring (2px, 2px offset) is never clipped (2.4.11, 2.4.13).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Section renders no text, so it has no message keys.

## Consumer responsibilities

- **Headings.** Put a heading at the top of the section, at the level the page outline needs: `h2` for a sidebar or a band under the page's `h1`. Section can't know it (2.4.6, 1.3.1).
- **Landmarks are opt-in, and named.** The default `<div>` is not a landmark. `render={<aside aria-labelledby={headingId} />}` is complementary content, `render={<section aria-labelledby={headingId} />}` is a region worth jumping to, and `render={<nav aria-labelledby={headingId} />}` is a sidebar of navigation. A `<section>` without a name is `generic` (HTML-AAM), so it is useless as a landmark. Keep landmarks few: never make every band a landmark. A top-level `<header>` or `<footer>` becomes `banner` or `contentinfo`, so only one of each.
- **Reading and focus order.** The children's DOM order. A sidebar that sits on the inline end at `64rem` comes after the main content in the DOM. Never reorder with `order` or grid placement against the DOM (1.3.2, 2.4.3).
- **Lists.** A list of sections is a `<ul>` with each section rendered as `<li>` (`render={<li />}`). The default theme draws no marker, and Safari can then expose the `<ul>` as a plain group: `role="list"` on the `<ul>` keeps it a list there (same open question as Card, see the Card contract). Check it in VoiceOver + Safari in the manual AT run.
- **Nesting.** A Card on a Section, yes. A Section inside a Card, no (a region inside a thing). A Section inside a Section only to switch between `surface` and `canvas`.
- **Scrolling.** Never `overflow` on the Section. A sidebar that scrolls on its own goes in a `kv-scroll-region` with a name and `tabindex="0"`. A sticky sidebar needs `scroll-padding` (2.4.11).
- **Not empty.** Don't render a Section with no content: it still has padding and a surface.
- **Language.** `lang` on any section in another language (3.1.2).

## Visual / modes

Headless: Section ships no CSS. With `@kvirn-ui/theme/theme.css` (design spec `docs/design/section.md`):

- Focus indicator: none of its own (a section is never focused). Children keep their own rings, never clipped.
- Target size: not applicable. Section has no controls of its own (2.5.8).
- Contrast: text, links, muted text, control edges and focus rings are held to their minimums on `surface` and `canvas` by `theme:check` (1.4.3, 1.4.11). The section's own boundary is decorative (1.06–1.10:1 from the page): the region is identified by its position, its heading and, where it is worth it, its landmark.
- forced-colors behaviour: `surface` and `canvas` both become `Canvas`, and the section's 1px border is `CanvasText` on all four sides.
- reduced-motion behaviour: no motion. No hover, transition or pointer style.
- Reflow and text spacing: no fixed sizes, no `overflow`, `overflow-wrap: break-word`, and the section can shrink in a grid (reviewed in the Section stories, not by a CSS test). Media directly in the section never get wider than it. No horizontal scrolling at 320 CSS px with the Finnish fixture (1.4.10), and with the 1.4.12 text-spacing overrides the section grows and nothing is clipped: both are checked in the reflow sweep.
- `kv-section--padding-none` with a focusable child flush to a viewport edge would push the ring's outer 4px off-screen: `none` is for frames whose children pad themselves, and for media.

## WCAG SCs covered

- 1.3.1 Info and Relationships: no role of its own, so the consumer's element and children decide the semantics (`section.test.tsx`).
- 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: DOM order equals reading and focus order (the Tab rows above).
- 1.4.3 Contrast (Minimum), 1.4.6, 1.4.11 Non-text Contrast: `theme:check` pairs on `surface` and `canvas`.
- 1.4.10 Reflow: the reflow sweep, the Finnish fixture story, and a wide image at 320px.
- 1.4.12 Text Spacing: the sweep with the text-spacing overrides at 320px.
- 2.4.1 Bypass Blocks: a named landmark helps screen-reader users skip to it, where the consumer opts in.
- 2.4.11 Focus Not Obscured (Minimum), 2.4.13 Focus Appearance: no clipping (reviewed in the stories).
- 4.1.2 Name, Role, Value: no role or name of its own to get wrong. A landmark's name is the consumer's.

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

- **No visible region edge in the contrast themes.** `surface` on `canvas` is 1.06:1 in light-contrast and 1.10:1 in dark-contrast, the same as the standard themes, so a sidebar there has no visible edge unless the consumer colours one (`border-inline-end-color: var(--kv-color-border-subtle)`). Decorative for WCAG, but a usability question (design spec §10.1). Usability test result: `pending`.
- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. A WebKit run is not automated, and the manual AT matrix is `pending`.
