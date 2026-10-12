# Accessibility contract: Grid

- **APG pattern:** none. Grid is a layout, not a widget, and it is not the ARIA `grid` role.
- **Deviations:** none
- **Native elements used:** `<div>` by default. `Grid.Root` takes `ul` or `ol`, and `Grid.Item` takes `li`, `article`, `section`, `nav`, `aside` or `main`, with `as`. The element's own semantics apply.
- **Status:** alpha candidate (Plan 0108). Gates 1–5 pass (accessibility-reviewer APPROVE, 2026-10-12). Manual AT is `pending`.
- **Tests:** `grid.test.tsx` next to this file. `grid.stories.tsx` in `apps/storybook/src/components/grid/`.

Grid lays children out on explicit column tracks chosen with classes (`kv-grid--cols-12`, `kv-grid--md-cols-2`, `kv-grid--fit-md`, `kv-grid-item--lg-span-8`). It adds no ARIA, no text, no `tabindex` and no behaviour, and it has no `data-*` state. As a `ul` or `ol` Root it adds `role="list"`, because WebKit and VoiceOver drop the list role under `list-style: none`. Everything a user perceives comes from the consumer's children, which keep their own semantics and focus order.

## Roles, states, properties

| Part           | Element / role                               | ARIA                                            | Notes                                                                                                                                                                                              |
| -------------- | -------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grid.Root      | internal `<div class="kv-grid-container">`   | none                                            | The query container around the grid element. No role, no ARIA, no attribute beyond its class. This is the one approved exception to "one part, one element" (Plan 0108)                            |
| Grid.Root      | `<div>` → `generic`, or `<ul>`/`<ol>` → list | `role="list"` on `ul`/`ol` only                 | `class="kv-grid"`. Every prop, the ref and `className` go here. `as="ul"` with `<li>` Items is a list, and its count is announced                                                                  |
| Grid.Item      | `<div>` → `generic`                          | none. The consumer adds it with the element     | `class="kv-grid-item"`. Optional: any direct child is a cell. Outside a Root it warns once (`grid-item-outside-root`)                                                                              |
| Grid.Root/Item | `as`                                         | the chosen element's own                        | A value outside the list is a type error and, in JS, warns once (`as-not-allowed:Grid.Root:<tag>`, `as-not-allowed:Grid.Item:<tag>`) and renders the default element. `className` joins, refs pass |
| both           | never                                        | no `tabindex`, `inert`, `aria-hidden`, `data-*` | No handler, no heading, no live region, no text                                                                                                                                                    |

`useGrid()` gives the same frozen props objects (only `className`): `containerProps`, `rootProps` and `itemProps`.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1, 4.1.2). `as` is a string, so it works from a Server Component.

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
- Never obscured by: Grid renders no overlay and sets no `overflow`, `position: sticky` or fixed height, so a child's focus ring is never clipped (2.4.11, 2.4.13).

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

- **A list of links or cards is a list.** `as="ul"` or `"ol"` with `<li>` children (`Grid.Item as="li"`), so the count is announced (1.3.1). Grid sets `role="list"` itself; don't write it.
- **No reordering.** There is no `order-*` and no dense packing (1.3.2, 2.4.3). `start-*`, `end-*` and `row-start-*` place an item on a line: placing a later item before an earlier one makes the visual order differ from the DOM, reading and focus order. Keep line placement in DOM order. (Accessibility trade-off, approved 2026-10-12.)
- **Start at one track.** A bare `cols-n` (n > 1), `flow-col` without `rows-n`, or `auto-cols-min|max` keeps its tracks at 320px, so the cells squeeze and content overflows or overlaps (1.4.10). Start with `kv-grid--cols-1` or `kv-grid--fit-*` and add columns with a breakpoint form (`kv-grid--md-cols-n`). `fit-*` uses `min(…, 100%)` and never overflows.
- **Name the landmarks.** A `nav`, `aside` or `section` Item needs `aria-label` or `aria-labelledby`, in the page's language. A page has one `main`: Grid never renders one by default.
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2).

## Visual / modes

Headless: Grid ships no CSS. With `@kvirn-ui/theme/theme.css` (DESIGN.md, Layout):

- Focus indicator, target size, contrast: not applicable. Grid has no colour, no edge and no control of its own.
- forced-colors behaviour: not applicable, nothing is drawn.
- reduced-motion behaviour: no motion.
- Reflow (1.4.10): the Reflow320 story's `expectNoHorizontalOverflow` play function. Text spacing (1.4.12): by reading, with no fixed height, `overflow` or clip; the proof is `pending` the Plan 0051 sweep.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: a div has no role, and a `ul` or `ol` has `role="list"` (`grid.test.tsx › as › adds role="list" to a ul and an ol Root, and no role to a div`).
- 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: DOM order equals reading and focus order (the keyboard rows).
- 1.4.10 Reflow: the Reflow320 story's `expectNoHorizontalOverflow` play function. 1.4.12 Text Spacing: by reading (no fixed height, overflow or clip), proof `pending` the Plan 0051 sweep.

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

- In a shrink-to-fit parent (inline-flex, a float, a flex item with no grow), the wrapper's `container-type: inline-size` gives the grid no inline size, so cells overflow. Put Grid in a block-level parent or give the flex item a size. A consequence of the two-element Root (Plan 0108, decision 5); there is no mitigation.
