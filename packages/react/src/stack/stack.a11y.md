# Accessibility contract: Stack

- **APG pattern:** none. Stack is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` by default. The consumer picks `<main>`, `<section>`, `<nav>`, `<aside>`, `<ul>` or another element with `render`, and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0056). Gates 1–5 pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `stack.test.tsx` next to this file. `stack.stories.tsx` in `apps/storybook/src/components/stack/`.

Stack is its children one below the other with a `space` step between them. It adds no role, no ARIA, no text, no `tabindex` and no behaviour, and it has no `data-*` state. Everything a user perceives comes from the consumer's children, which keep their own semantics and focus order.

## Roles, states, properties

| Part  | Element / role               | ARIA                                          | Notes                                                                                                                                                        |
| ----- | ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stack | `<div>` → `generic`          | none. The consumer adds it with the element   | `class="kv-stack"`, with `kv-stack--gap-2`, `-4` or `-8` for `gap` (the default `6` adds none). `render={<ul role="list" />}` with `<li>` children is a list |
| Stack | `render` (element, function) | the rendered element's own                    | One element. An element keeps its own props, and the part's are merged in: `className` joins, `style` merges, refs merge                                     |
| Stack | attributes                   | passed through                                | `aria-*`, `id`, `lang` and every other attribute reach the element unchanged                                                                                 |
| Stack | never                        | no `role`, `tabindex`, `inert`, `aria-hidden` | No handler, no heading, no live region, no text                                                                                                              |

`useStack()` gives the same frozen props object (only `className`) for your own element.

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context            | Action                                                | Test                                                                                |
| --------- | ------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Tab       | any layout element | Not a Tab stop; the children's order is the DOM order | `stack.test.tsx › keyboard › is not a Tab stop and keeps the children in DOM order` |
| Shift+Tab | any layout element | Not a Tab stop; the reverse DOM order                 | `stack.test.tsx › keyboard › Shift+Tab walks the children in reverse DOM order`     |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Strategy: native. Stack never moves focus and renders no `tabindex`. Its children keep their own order, which is the DOM order.
- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Stack renders no overlay and sets no `overflow`, so a child's focus ring is never clipped (2.4.11, 2.4.13).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Stack renders no text, so it has no message keys.

## Consumer responsibilities

- **Gap.** `'2'`, `'4'`, `'6'` (default) and `'8'` are `space` steps. Group related blocks with a smaller gap and separate sections with a larger one.
- **Landmarks.** `render={<main />}`, `<nav aria-label>`, `<aside aria-labelledby>` or `<section aria-labelledby>` only for a region a user would want to jump to, always named. A page has one `main`.
- **A list is `<ul role="list">`.** Without markers WebKit and VoiceOver drop the list role. The repo's lint allows it on a `ul` only (`jsx-a11y/no-redundant-roles`, see the Card contract, Lists), and the stories use it.
- **DOM order is the visual order.** Write children in the order they are read and focused (1.3.2, 2.4.3). There is no way to reorder them visually.
- **Language.** `lang` on any text in another language (3.1.2).

## Visual / modes

Headless: Stack ships no CSS. With `@kvirn-ui/theme/theme.css` (DESIGN.md, Layout):

- Focus indicator, target size, contrast: not applicable. Stack has no colour, no edge and no control of its own.
- forced-colors behaviour: not applicable, nothing is drawn.
- reduced-motion behaviour: no motion.
- Reflow and text spacing: a flex column with a `gap`: children keep their natural width and wrap their own text (1.4.10). No fixed heights (1.4.12). The 320px story with a long Finnish word proves it with axe; the sweep is Plan 0051's.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: no role of its own, so the consumer's element decides (`stack.test.tsx › rendering › adds no role, ARIA, tabindex, inert or data attribute`).
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
