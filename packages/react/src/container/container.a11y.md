# Accessibility contract: Container

- **APG pattern:** none. Container is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` by default. The consumer picks another with `as` (allowed elements below), and the element's own semantics apply.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `container.test.tsx` next to this file. `container.stories.tsx` in `apps/storybook/src/components/container/`.

Container is a centred block that limits the width of the page's content. It adds no role, no ARIA, no text, no `tabindex` and no behaviour, and it has no `data-*` state. Everything a user perceives comes from the consumer's children, which keep their own semantics and focus order.

## Roles, states, properties

| Part      | Element / role      | ARIA                                          | Notes                                                                                                                                                                                                        |
| --------- | ------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Container | `<div>` → `generic` | none. The consumer adds it with the element   | `class="kv-container"`, with `kv-container--reading` or `kv-container--form` for `size`. `as="main"` or `as="section"` with `aria-labelledby` give it a role                                                 |
| Container | `as`                | the chosen element's own                      | One element, chosen with a string. A value outside the list is a type error and, in JavaScript, warns once in development and renders the default element. `className` joins and the ref reaches the element |
| Container | attributes          | passed through                                | `aria-*`, `id` and every other attribute reach the element unchanged                                                                                                                                         |
| Container | never               | no `role`, `tabindex`, `inert`, `aria-hidden` | No handler, no heading, no live region, no text                                                                                                                                                              |

`useContainer()` gives the same frozen props object (only `className`) for your own element.

## Allowed elements

A tag outside the list changes the page's outline or meaning (1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)). `as` is a string, so it works from a Server Component.

| Part      | `as`                                          | Why                                                                                                                               |
| --------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Container | `div` (default), `main`, `section`, `article` | `main` (one per page) and `section` with a name are landmarks, `article` a self-contained piece. No `nav` or `aside`: use Section |

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context            | Action                                                | Test                                                                                    |
| --------- | ------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Tab       | any layout element | Not a Tab stop; the children's order is the DOM order | `container.test.tsx › keyboard › is not a Tab stop and keeps the children in DOM order` |
| Shift+Tab | any layout element | Not a Tab stop; the reverse DOM order                 | `container.test.tsx › keyboard › Shift+Tab walks the children in reverse DOM order`     |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Strategy: native. Container never moves focus and renders no `tabindex`. Its children keep their own order, which is the DOM order.
- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Container renders no overlay and sets no `overflow`, so a child's focus ring is never clipped (2.4.11 Focus Not Obscured (Minimum) (AA); 2.4.13 Focus Appearance (AAA), not counted toward AA).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Container renders no text, so it has no message keys.

## Consumer responsibilities

- **Size.** `'page'` (default, `80rem`, padded) is the page; `'reading'` (`45rem`) is prose; `'form'` (`40rem`) is a form. They are start-aligned and add no padding: nest a `page` container outside if the page needs the gutter.
- **Landmarks.** `as="main"` or `as="section"` with `aria-labelledby` only for a region a user would want to jump to, always named. A page has one `main`.
- **DOM order is the visual order.** Write children in the order they are read and focused (1.3.2 Meaningful Sequence (A), 2.4.3 Focus Order (A)). There is no way to reorder them visually.
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2 Language of Parts (AA)).

## Visual / modes

Headless: Container ships no CSS. With `@kvirn-ui/theme/theme.css` (DESIGN.md, Layout):

- Focus indicator, target size, contrast: not applicable. Container has no colour, no edge and no control of its own.
- forced-colors behaviour: not applicable, nothing is drawn.
- reduced-motion behaviour: no motion.
- Reflow and text spacing: the container sets a maximum width, never a fixed one, so it is never wider than the screen and nothing scrolls sideways at 320px or at 400% zoom (1.4.10 Reflow (AA)). It has no fixed height (1.4.12 Text Spacing (AA)). A 320px story with a long Finnish word checks that nothing scrolls sideways; a sweep of all components is planned.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A): no role of its own, so the element you choose decides (`container.test.tsx › rendering › adds no role, ARIA, tabindex, inert or data attribute`).
- 1.3.2 Meaningful Sequence (A), 2.4.3 Focus Order (A): DOM order equals reading and focus order (the keyboard rows).
- 1.4.10 Reflow (AA): a maximum width, never a fixed one (the 320px story checks that nothing scrolls sideways). 1.4.12 Text Spacing (AA): no fixed heights, by reading; no automated check yet.

## AT test record

| AT + browser + OS                        | Agent check | Human check | Result  | Notes |
| ---------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**             |             |             |         |       |
| Windows Contrast Themes + Edge           | pending     | pending     | pending |       |
| Keyboard only / 400% zoom / 320px reflow | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS               | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android              | pending     | pending     | pending |       |
| NVDA + Chrome + Windows                  | pending     | pending     | pending |       |
| NVDA + Firefox + Windows                 | pending     | pending     | pending |       |
| Narrator + Edge + Windows                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)**  |             |             |         |       |
| JAWS + Chrome + Windows                  | pending     | pending     | pending |       |
| Dragon / Voice Control                   | pending     | pending     | pending |       |

## Known issues

- None.
