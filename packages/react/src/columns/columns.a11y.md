# Accessibility contract: Columns

- **APG pattern:** none. Columns is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` by default. The consumer picks another with `as` (allowed elements below), and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0056). Gates 1–5 pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `columns.test.tsx` next to this file. `columns.stories.tsx` in `apps/storybook/src/components/columns/`.

Columns is as many columns as fit, none narrower than `18rem`. It adds no ARIA, no text, no `tabindex` and no behaviour, and it has no `data-*` state. As a `ul` or `ol` it adds `role="list"` when it renders a `ul` or `ol`, because WebKit and VoiceOver drop the list role under `list-style: none`. Everything a user perceives comes from the consumer's children, which keep their own semantics and focus order.

## Roles, states, properties

| Part    | Element / role      | ARIA                                                                   | Notes                                                                                                                                                                                                                            |
| ------- | ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Columns | `<div>` → `generic` | none. The consumer adds it with the element                            | `class="kv-columns"`, with `kv-columns--min-sm` or `-lg` and `kv-columns--gap-4` or `-8` added by the consumer for a choice that differs from the defaults. `as="ul"` with `<li>` children is a list, and its count is announced |
| Columns | `as`                | the chosen element's own                                               | One element, chosen with a string. A value outside the list is a type error and, in JS, warns once (`as-not-allowed:Columns:<tag>`) and renders the default element. `className` joins, `style` and refs pass                    |
| Columns | attributes          | passed through                                                         | `aria-*`, `id`, `lang` and every other attribute reach the element unchanged                                                                                                                                                     |
| Columns | never               | `role="list"` on `ul`/`ol` only; no `tabindex`, `inert`, `aria-hidden` | No handler, no heading, no live region, no text                                                                                                                                                                                  |

`useColumns()` gives the same frozen props object (only `className`) for your own element.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1, 4.1.2). `as` is a string, so it works from a Server Component.

| Part    | `as`                        | Why                                                                                                                  |
| ------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Columns | `div` (default), `ul`, `ol` | `ul` and `ol` with `<li>` children are lists whose count is announced. No landmark element: use Container or Section |

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context            | Action                                                | Test                                                                                  |
| --------- | ------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Tab       | any layout element | Not a Tab stop; the children's order is the DOM order | `columns.test.tsx › keyboard › is not a Tab stop and keeps the children in DOM order` |
| Shift+Tab | any layout element | Not a Tab stop; the reverse DOM order                 | `columns.test.tsx › keyboard › Shift+Tab walks the children in reverse DOM order`     |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Strategy: native. Columns never moves focus and renders no `tabindex`. Its children keep their own order, which is the DOM order.
- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Columns renders no overlay and sets no `overflow`, so a child's focus ring is never clipped (2.4.11, 2.4.13).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Columns renders no text, so it has no message keys.

## Consumer responsibilities

- **A list of links or cards is a list.** `as="ul"` or `"ol"` with `<li>` children, so the count is announced (1.3.1). Columns sets `role="list"` itself: the theme draws no markers, and WebKit and VoiceOver then drop the list role. Don't write it.
- **No reordering.** The columns fill in DOM order, left to right (right to left in RTL). There is no `order`, `reverse` or dense packing (1.3.2, 2.4.3).
- **Landmarks.** Columns has none to give: a landmark is a `Container` (`main`, `section`) or a `Section` (`nav`, `aside`), always named. A page has one `main`.
- **DOM order is the visual order.** Write children in the order they are read and focused (1.3.2, 2.4.3). There is no way to reorder them visually.
- **Language.** `lang` on any text in another language (3.1.2).

## Visual / modes

Headless: Columns ships no CSS. With `@kvirn-ui/theme/theme.css` (DESIGN.md, Layout):

- Focus indicator, target size, contrast: not applicable. Columns has no colour, no edge and no control of its own.
- forced-colors behaviour: not applicable, nothing is drawn.
- reduced-motion behaviour: no motion.
- Reflow and text spacing: each track is `minmax(min(<width>, 100%), 1fr)`, so at 320px there is one column that never exceeds the viewport (1.4.10). The 320px story with a long Finnish word proves it with axe; the sweep is Plan 0051's.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: a div has no role, and a `ul` or `ol` has `role="list"` (`columns.test.tsx › rendering › adds role="list" to a ul and an ol, and no role to a div`).
- 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: DOM order equals reading and focus order (the keyboard rows).
- 1.4.10 Reflow, 1.4.12 Text Spacing: no fixed sizes or heights (the 320px story).

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
