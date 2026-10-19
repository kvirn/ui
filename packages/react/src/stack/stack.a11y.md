# Accessibility contract: Stack

- **APG pattern:** none. Stack is not a widget, so there is no APG pattern.
- **Deviations:** none
- **Native elements used:** `<div>` by default. The consumer picks another with `as` (allowed elements below), and the element's own semantics apply.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `stack.test.tsx` next to this file. `stack.stories.tsx` in `apps/storybook/src/components/stack/`.

Stack is its children one below the other with an even space between them. It adds no ARIA, no text, no `tabindex` and no behaviour, and it has no `data-*` state. The one exception: when it renders a `ul` or `ol`, it adds `role="list"`, because WebKit (Safari's engine) and VoiceOver drop the list role when the list has no markers (`list-style: none`). A `role` you pass yourself wins. Everything a user perceives comes from the consumer's children, which keep their own semantics and focus order.

## Roles, states, properties

| Part  | Element / role      | ARIA                                                                        | Notes                                                                                                                                                      |
| ----- | ------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack | `<div>` → `generic` | `role="list"` on `ul`/`ol` only                                             | The consumer adds a gap class (`kv-stack--gap-2`, `-4` or `-8`) for another gap; the default adds none. `as="ul"` or `"ol"` with `<li>` children is a list |
| Stack | `as`                | the chosen element's own                                                    | One element, chosen with a string. A value outside the list is a type error. `className` joins, other attributes and refs pass through                     |
| Stack | attributes          | passed through                                                              | `aria-*`, `id` and every other attribute reach the element unchanged                                                                                       |
| Stack | never adds          | no `tabindex`, `inert` or `aria-hidden`; no role except `list` on `ul`/`ol` | No handler, no heading, no live region, no text                                                                                                            |

`useStack()` gives the same frozen props object (only `className`) for your own element.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1 Info and Relationships, A; 4.1.2 Name, Role, Value, A). `as` is a string, so it works from a Server Component.

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
- Never obscured by: Stack renders no overlay and sets no `overflow`, so a child's focus ring is never clipped (2.4.11 Focus Not Obscured (Minimum), AA).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Stack renders no text, so it has no message keys.

## Consumer responsibilities

- **Gap.** `kv-stack--gap-2`, `-4` and `-8` set the gap, from small to large. With none, the gap sits between `-4` and `-8`. Group related blocks with a smaller gap and separate sections with a larger one.
- **Landmarks.** Stack has none to give: a landmark is a `Container` (`main`, `section`) or a `Section` (`nav`, `aside`), always named. A page has one `main`.
- **A list is `as="ul"` or `"ol"`.** Stack sets `role="list"` itself, because WebKit and VoiceOver drop the list role without markers. Don't write it. If you spread `useStack()` on your own `ul` or `ol`, add `role="list"` yourself: the hook returns only the class name.
- **DOM order is the visual order.** Write children in the order they are read and focused (1.3.2 Meaningful Sequence, A; 2.4.3 Focus Order, A). There is no way to reorder them visually.
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2 Language of Parts, AA).

## Visual / modes

Headless: Stack ships no CSS. With the default theme (`@kvirn-ui/theme/theme.css`):

- Focus indicator, target size, contrast: not applicable. Stack has no colour, no edge and no control of its own.
- forced-colors behaviour: not applicable, nothing is drawn.
- reduced-motion behaviour: no motion.
- Reflow and text spacing: a flex column with a gap: children keep their natural width and wrap their own text (1.4.10 Reflow, AA). No fixed heights (1.4.12 Text Spacing, AA). The reflow sweep checks every story at 320 CSS pixels for sideways scrolling, and the text-spacing sweep checks that no box clips text.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A): a div has no role, and a `ul` or `ol` has `role="list"`.
- 1.3.2 Meaningful Sequence (A), 2.4.3 Focus Order (A): DOM order equals reading and focus order (the keyboard rows).
- 1.4.10 Reflow (AA): no fixed sizes (the reflow sweep checks that nothing scrolls sideways at 320 CSS pixels). 1.4.12 Text Spacing (AA): no fixed heights, and the text-spacing sweep applies the wider spacing to every story and fails on a box that clips text.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                         |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                               |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | stack.stories.tsx, every story, 4 themes                                                                      |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | stack.test.tsx › adds role="list" to a ul and an ol, and no role to a div; expectNoA11yViolations             |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | stack.test.tsx › keyboard › is not a Tab stop and keeps the children in DOM order                             |
| Focus order and management                                                 | pass        | n/a         | pass    | `stack.test.tsx` asserts focus                                                                                |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI |
| **Core (required for beta)**                                               |             |             |         |                                                                                                               |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                               |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                               |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                               |

### What to check

- Move through a page in reading order with NVDA or VoiceOver: the order matches what you see, at wide and narrow widths.
- As a `ul` with `li` Items, it is read as "list, N items".
- A named `nav` or `aside` Item is found in the landmarks list by its name.
- At 400% zoom nothing needs sideways scrolling.

## Known issues

- None.
