# Accessibility contract: SidebarLayout

- **APG pattern:** none. SidebarLayout is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` for every part by default. The consumer picks `<nav aria-label>`, `<aside aria-labelledby>`, `<main>` or `<section aria-labelledby>` with `render`, and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0056). Gates 1–5 pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `sidebar-layout.test.tsx` next to this file. `sidebar-layout.stories.tsx` in `apps/storybook/src/components/sidebar-layout/`.

SidebarLayout is a side column and a content column: stacked below `64rem`, side by side from it. It adds no role, no ARIA, no text, no `tabindex` and no behaviour, and it has no `data-*` state. Collapsing a sidebar behind a button is Disclosure's job, not the layout's.

## Roles, states, properties

| Part                  | Element / role               | ARIA                                          | Notes                                                                                                                                                                             |
| --------------------- | ---------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SidebarLayout.Root    | `<div>` → `generic`          | none                                          | `class="kv-sidebar-layout"`, with `kv-sidebar-layout--sidebar-sm` for `sidebarWidth="sm"`. Also exported as `SidebarLayoutRoot`                                                   |
| SidebarLayout.Sidebar | `<div>` → `generic`          | none. The consumer adds it with the element   | `class="kv-sidebar-layout-sidebar"`. `render={<nav aria-label="…" />}` is a navigation landmark and must be named. Also exported as `SidebarLayoutSidebar`                        |
| SidebarLayout.Content | `<div>` → `generic`          | none                                          | `class="kv-sidebar-layout-content"`. **Not `<main>` by default:** a page has one `main`, so `render={<main />}` is the consumer's choice. Also exported as `SidebarLayoutContent` |
| every part            | `render` (element, function) | the rendered element's own                    | One element per part. `className` joins, `style` merges, refs merge                                                                                                               |
| every part            | attributes                   | passed through                                | `aria-*`, `id`, `lang` and every other attribute reach the element unchanged                                                                                                      |
| every part            | never                        | no `role`, `tabindex`, `inert`, `aria-hidden` | No handler, no heading, no live region, no text                                                                                                                                   |

`useSidebarLayout()` gives the same frozen `rootProps`, `sidebarProps` and `contentProps` (only `className`). A Sidebar or Content outside a Root warns once (`sidebar-layout-<part>-outside-root`).

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context            | Action                                                | Test                                                                                         |
| --------- | ------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Tab       | any layout element | Not a Tab stop; the children's order is the DOM order | `sidebar-layout.test.tsx › keyboard › is not a Tab stop and keeps the children in DOM order` |
| Shift+Tab | any layout element | Not a Tab stop; the reverse DOM order                 | `sidebar-layout.test.tsx › keyboard › Shift+Tab walks the children in reverse DOM order`     |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Strategy: native. SidebarLayout never moves focus and renders no `tabindex`. The sidebar is first in the DOM and so first in the Tab order, at inline start, at every width.
- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: SidebarLayout renders no overlay, nothing is sticky and it sets no `overflow`, so a child's focus ring is never clipped (2.4.11, 2.4.13).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

SidebarLayout renders no text, so it has no message keys.

## Consumer responsibilities

- **Name the landmarks.** `<nav>` and `<aside>` need `aria-label` or `aria-labelledby`, in the page's language. One `main` per page, and it is the Content or an element around the layout.
- **Order.** Whichever part comes first in the DOM is at inline start (the left in LTR, the right in RTL) and is read and focused first. Write it first only if it should be: there is no `order` or `reverse` (1.3.2, 2.4.3).
- **A long sidebar on small screens** is stacked above the content and can push it far down. Put a Disclosure inside the Sidebar for a long navigation (WCAG 2.4.1 bypass blocks: also offer a skip link).
- **Language.** `lang` on any text in another language (3.1.2).

## Visual / modes

Headless: SidebarLayout ships no CSS. With `@kvirn-ui/theme/theme.css` (DESIGN.md, Layout):

- Focus indicator, target size, contrast: not applicable.
- forced-colors behaviour: not applicable, nothing is drawn.
- reduced-motion behaviour: no motion.
- Reflow and text spacing: one column below `64rem`, so there is no horizontal scrolling at 320px or 400% zoom (1.4.10); from `64rem` two tracks `<sidebar width> minmax(0, 1fr)` with logical properties, so RTL mirrors. No fixed heights (1.4.12). The stack is by viewport width, so a story in a wide page can't show it: the `LongWord` and RTL stories run axe, and the 320px check is manual (`pending`) and Plan 0051's sweep.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: no role of its own (`sidebar-layout.test.tsx › rendering › adds no role, ARIA, tabindex, inert or data attribute`).
- 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: DOM order equals reading and focus order (the keyboard rows, the RTL order test).
- 1.4.10 Reflow, 1.4.12 Text Spacing: the stack below `64rem`, no fixed sizes (the manual 320px check).

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

- None.
