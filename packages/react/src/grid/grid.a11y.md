# Accessibility contract: Grid

- **APG pattern:** none. Grid is a layout, not a widget, and it is not the ARIA `grid` role.
- **Deviations:** none
- **Native elements used:** `<div>` by default. `Grid.Root` takes `ul` or `ol`, and `Grid.Item` takes `li`, `article`, `section`, `nav`, `aside` or `main`, with `as`. The element's own semantics apply.
- **Tests:** `grid.test.tsx` next to this file. `grid.stories.tsx` in `apps/storybook/src/components/grid/`.

Grid lays children out on explicit column tracks chosen with classes (`kv-grid--cols-12`, `kv-grid--md-cols-2`, `kv-grid--fit-md`, `kv-grid-item--lg-span-8`). It adds no ARIA, no text, no `tabindex` and no behaviour, and it has no `data-*` state. As a `ul` or `ol` Root it adds `role="list"`, because WebKit and VoiceOver drop the list role under `list-style: none`. Everything a user perceives comes from the consumer's children, which keep their own semantics and focus order.

## Roles, states, properties

| Part           | Element / role                               | ARIA                                            | Notes                                                                                                                                                                       |
| -------------- | -------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grid.Root      | internal `<div class="kv-grid-container">`   | none                                            | The query container around the grid element. No role, no ARIA, no attribute beyond its class. Grid renders a wrapper and the grid element, so a container query can size it |
| Grid.Root      | `<div>` → `generic`, or `<ul>`/`<ol>` → list | `role="list"` on `ul`/`ol` only                 | `class="kv-grid"`. Every prop, the ref and `className` go here. `as="ul"` with `<li>` Items is a list, and its count is announced                                           |
| Grid.Item      | `<div>` → `generic`                          | none. The consumer adds it with the element     | `class="kv-grid-item"`. Optional: any direct child is a cell. Outside a Root it warns once in development                                                                   |
| Grid.Root/Item | `as`                                         | the chosen element's own                        | A value outside the list is a type error. `className` joins, refs pass                                                                                                      |
| both           | never                                        | no `tabindex`, `inert`, `aria-hidden`, `data-*` | No handler, no heading, no live region, no text                                                                                                                             |

`useGrid()` gives the same frozen props objects (only `className`): `containerProps`, `rootProps` and `itemProps`.

## Allowed elements

A tag outside the list changes the page's outline or meaning (1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)). `as` is a string, so it works from a Server Component.

| Part      | `as`                                                                | Why                                                                                                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grid.Root | `div` (default), `ul`, `ol`                                         | `ul` and `ol` with `li` Items are lists whose count is announced. No landmark element: use Container or Section                                                                                                                                               |
| Grid.Item | `div` (default), `li`, `article`, `section`, `nav`, `aside`, `main` | `li` inside a `ul`/`ol` Root. A named `section`, `nav` (navigation) or `aside` (related content) is a landmark, and one without a name is noise. `main` (one per page) is the consumer's choice, never the default. `article` only for self-contained content |

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context            | Action                                                | Test                                                                               |
| --------- | ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Tab       | any layout element | Not a Tab stop; the children's order is the DOM order | `grid.test.tsx › keyboard › is not a Tab stop and keeps the children in DOM order` |
| Shift+Tab | any layout element | Not a Tab stop; the reverse DOM order                 | `grid.test.tsx › keyboard › Shift+Tab walks the children in reverse DOM order`     |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Strategy: native. Grid never moves focus and renders no `tabindex`. Its children keep their own order, which is the DOM order.
- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Grid renders no overlay and sets no `overflow`, `position: sticky` or fixed height, so a child's focus ring is never clipped (2.4.11 Focus Not Obscured (Minimum) (AA); 2.4.13 Focus Appearance (AAA), not counted toward AA).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Grid renders no text, so it has no message keys.

### Read aloud

| State or action                    | Expected phrase(s) as read aloud                                           | Live region politeness | Test                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| A `div` Root with Items            | only the children's phrases in DOM order; none for the wrapper or the grid | none                   | `grid.test.tsx › read aloud › a div Root reads only its children in DOM order`        |
| `as="ul"` Root with `li` Items     | `list`, `listitem`, `<text>`, `end of list` for each item                  | none                   | `grid.test.tsx › read aloud › a ul Root with li Items reads as a list with its items` |
| An Item `as="main"`                | `main`                                                                     | none                   | `grid.test.tsx › read aloud › a main Item reads as main`                              |
| A named `nav` Item                 | `navigation, <name>`                                                       | none                   | `grid.test.tsx › read aloud › a named nav Item reads as a navigation`                 |
| An Item `as="section"` with a name | `region, <name>`                                                           | none                   | `grid.test.tsx › read aloud › a named section Item reads as a region`                 |

## Consumer responsibilities

- **A list of links or cards is a list.** `as="ul"` or `"ol"` with `<li>` children (`Grid.Item as="li"`), so the count is announced (1.3.1 Info and Relationships (A)). Grid sets `role="list"` itself; don't write it.
- **No reordering.** There is no `order-*` and no dense packing (1.3.2 Meaningful Sequence (A), 2.4.3 Focus Order (A)). `start-*`, `end-*` and `row-start-*` place an item on a line: placing a later item before an earlier one makes the visual order differ from the DOM, reading and focus order. Keep line placement in DOM order. (An accessibility trade-off.)
- **Start at one track.** A bare `cols-n` (n > 1), `flow-col` without `rows-n`, or `auto-cols-min|max` keeps its tracks at 320px, so the cells squeeze and content overflows or overlaps (1.4.10 Reflow (AA)). Start with `kv-grid--cols-1` or `kv-grid--fit-*` and add columns with a breakpoint form (`kv-grid--md-cols-n`). `fit-*` uses `min(…, 100%)` and never overflows.
- **Name the landmarks.** A `nav`, `aside` or `section` Item needs `aria-label` or `aria-labelledby`, in the page's language. A page has one `main`: Grid never renders one by default.
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2 Language of Parts (AA)).

## Visual / modes

Headless: Grid ships no CSS. With `@kvirn-ui/theme/theme.css`:

- Focus indicator, target size, contrast: not applicable. Grid has no colour, no edge and no control of its own.
- forced-colors behaviour: not applicable, nothing is drawn.
- reduced-motion behaviour: no motion.
- Reflow (1.4.10 Reflow (AA)): the reflow sweep checks every story at 320 CSS pixels for sideways scrolling. Text spacing (1.4.12 Text Spacing (AA)): Grid sets no fixed height, `overflow` or clip, and the text-spacing sweep applies the wider spacing to every story and fails on a box that clips text.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A): a div has no role, and a `ul` or `ol` has `role="list"`.
- 1.3.2 Meaningful Sequence (A), 2.4.3 Focus Order (A): DOM order equals reading and focus order (the keyboard rows).
- 1.4.10 Reflow (AA): the reflow sweep checks that nothing scrolls sideways at 320 CSS pixels. 1.4.12 Text Spacing (AA): no fixed height, overflow or clip, and the text-spacing sweep fails on a box that clips text.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                           |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                 |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | grid.stories.tsx, every story, 4 themes                                                                         |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `grid.test.tsx` (axe and role, name and state): `adds role="list" to a ul and an ol Root, and no role to a div` |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 2 rows, each names a test in `grid.test.tsx`                                                                    |
| Focus order and management                                                 | pass        | n/a         | pass    | `grid.test.tsx` asserts focus                                                                                   |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI   |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                 |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                 |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                 |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                 |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                 |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                 |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                 |

### What to check

- Move through a page in reading order with NVDA or VoiceOver: the order matches what you see, at wide and narrow widths.
- As a `ul` with `li` Items, it is read as "list, N items".
- A named `nav` or `aside` Item is found in the landmarks list by its name.
- At 400% zoom nothing needs sideways scrolling.

## Known issues

- **Grid in a shrink-to-fit parent.** In an inline-flex parent, a float or a flex item with no grow, the grid gets no width, so its cells overflow. Put Grid in a block-level parent, or give the flex item a size. It follows from Grid's two-element Root, and there is no other workaround.
