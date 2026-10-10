# Accessibility contract: Stack

- **APG pattern:** none. Stack is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` by default. The consumer picks another with `as` (allowed elements below), and the element's own semantics apply.
- **Status:** alpha candidate (Plan 0056). Gates 1–5 pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `stack.test.tsx` next to this file. `stack.stories.tsx` in `apps/storybook/src/components/stack/`.

Stack is its children one below the other with a `space` step between them. It adds no ARIA, no text, no `tabindex` and no behaviour, and it has no `data-*` state. As a `ul` or `ol` it adds `role="list"` when it renders a `ul` or `ol`, because WebKit and VoiceOver drop the list role under `list-style: none`. Everything a user perceives comes from the consumer's children, which keep their own semantics and focus order.

## Roles, states, properties

| Part  | Element / role      | ARIA                                                                   | Notes                                                                                                                                                                                                       |
| ----- | ------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack | `<div>` → `generic` | `role="list"` on `ul`/`ol` only                                        | `class="kv-stack"`, plus `kv-stack--gap-2`, `-4` or `-8` for another gap, added by the consumer (the default adds none). `as="ul"` or `"ol"` with `<li>` children is a list                                 |
| Stack | `as`                | the chosen element's own                                               | One element, chosen with a string. A value outside the list is a type error and, in JS, warns once (`as-not-allowed:Stack:<tag>`) and renders the default element. `className` joins, `style` and refs pass |
| Stack | attributes          | passed through                                                         | `aria-*`, `id`, `lang` and every other attribute reach the element unchanged                                                                                                                                |
| Stack | never               | `role="list"` on `ul`/`ol` only; no `tabindex`, `inert`, `aria-hidden` | No handler, no heading, no live region, no text                                                                                                                                                             |

`useStack()` gives the same frozen props object (only `className`) for your own element.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1, 4.1.2). `as` is a string, so it works from a Server Component.

| Part  | `as`                                                 | Why                                                                                                                                                                                                                         |
| ----- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack | `div` (default), `ul`, `ol`, `li`, `section`, `form` | `ul` and `ol` with `<li>` children are lists, `li` a list item inside one, `section` with a name a region, `form` a form (name it for a landmark). No `main`, `nav`, `aside`: use Container or Section, which own landmarks |

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

- **Gap.** `kv-stack--gap-2`, `-4` and `-8` are `space` steps, and the default is `6`. Group related blocks with a smaller gap and separate sections with a larger one.
- **Landmarks.** Stack has none to give: a landmark is a `Container` (`main`, `section`) or a `Section` (`nav`, `aside`), always named. A page has one `main`.
- **A list is `as="ul"` or `"ol"`.** Stack sets `role="list"` itself, because WebKit and VoiceOver drop the list role without markers. Don't write it.
- **DOM order is the visual order.** Write children in the order they are read and focused (1.3.2, 2.4.3). There is no way to reorder them visually.
- **Language.** `lang` on any text in another language (3.1.2).

## Visual / modes

Headless: Stack ships no CSS. With `@kvirn-ui/theme/theme.css` (DESIGN.md, Layout):

- Focus indicator, target size, contrast: not applicable. Stack has no colour, no edge and no control of its own.
- forced-colors behaviour: not applicable, nothing is drawn.
- reduced-motion behaviour: no motion.
- Reflow and text spacing: a flex column with a gap: children keep their natural width and wrap their own text (1.4.10). No fixed heights (1.4.12). The 320px story with a long Finnish word proves it with axe; the sweep is Plan 0051's.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: a div has no role, and a `ul` or `ol` has `role="list"` (`stack.test.tsx › rendering › adds role="list" to a ul and an ol, and no role to a div`).
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
