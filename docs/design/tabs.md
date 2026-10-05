# Design spec: Tabs

- **Status:** Draft
- **Designer:** the maintainer's look decisions (2026-10-05), written down by component-engineer · **Date:** 2026-10-05
- **Plan:** [0048](../plans/0048-tabs.md)
- **Type:** component default styling

## 1. Brief

- **Users:** both. Hardest case: a resident on a 320px phone, in Finnish with long labels and 200% text, who has to find which tab holds the decision on their case, and a keyboard or screen-reader user who must reach the selected panel with one Tab after the list.
- **Job to be done:** When I look at one case, I want to switch between its parts (details, documents, history), so I can see one at a time without leaving the page.
- **Constraints:** WAD (EN 301 549). No new colour and no new token. Tabs change content on the same page: links to other pages are a navigation.
- **Assumption:** a quiet tab, with a weight and a straight bar as the selected cue, reads as "selected" without a fill, and is told apart from a navigation item by the bar. → Research question: do residents find the selected tab at once in a wrapped list?

## 2. Look

The look is a navigation item turned into a tab: quiet, in the text colour, with the selected state as a shape and a weight. Nothing animates.

| Part         | Element and class              | Tokens, by role                                                                                                                                                      |
| ------------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tabs.Root`  | `<div class="kv-tabs">`        | none. `data-orientation="vertical"`: a row of the list and the panel                                                                                                 |
| `Tabs.List`  | `<div class="kv-tabs-list">`   | flex, wraps, `space-1` gap. A 1px `border-subtle` hairline at its block end (inline end when vertical)                                                               |
| `Tabs.Tab`   | `<button class="kv-tabs-tab">` | `tab`: `text`, no fill or border, the control size (44px, 32px in compact from 64rem), `0 space-4` padding, the control type at weight 400, `radius-sm` for the ring |
| `Tabs.Panel` | `<div class="kv-tabs-panel">`  | `space-4` above (beside the list when vertical). Its own focus ring. No `display` rule: it would beat `hidden`                                                       |

### States

| State                      | Look                                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| rest                       | `text`, weight 400, no underline                                                                                                                           |
| hover and press            | The 2px link underline in the `text` colour, no fill (as a navigation item). Not on a disabled tab                                                         |
| selected (`aria-selected`) | Weight 600 and a straight 4px (`--kv-indicator-width`) `primary` bar at the tab's block-end edge, across the whole tab (the inline-end edge when vertical) |
| focus-visible              | The ring of a link: 2px `focus-ring`, 2px offset. The panel has it too, because it has `tabindex="0"`                                                      |
| disabled (`aria-disabled`) | `text-muted`, no hover underline, `not-allowed` cursor. Still focusable. A selected disabled tab keeps its bar                                             |

**Why a bar and not a fill.** A solid `primary` fill already means a pressed Toggle and the active option of a Listbox. The bar is drawn with `::after`, never as a border on a rounded box, so it is straight at the edge. The selected state is a shape and a weight, never colour alone (1.4.1).

## 3. Contrast pairs (`theme:check`)

No new token and no new pair: every pair is already in `packages/theme/src/contrast-requirements.ts`, and `contrast-requirements.ts` is unchanged.

| Pair                                                  | Where                              | Required by                                                                    |
| ----------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| `text` on `canvas`, `surface`, `surface-raised`       | a tab at rest, selected, hovered   | `textPairs` (4.5:1, 7:1 in the contrast themes)                                |
| `text-muted` on `canvas`, `surface`, `surface-raised` | a disabled tab                     | `textPairs` (4.5:1, 7:1 in the contrast themes)                                |
| `primary` on `canvas`, `surface`, `surface-raised`    | the selected bar                   | `nonTextPairs` (3:1, 1.4.11)                                                   |
| `focus-ring` on `canvas`, `surface`, `surface-raised` | the ring on a tab and on the panel | `nonTextPairs` (3:1, 2.4.13)                                                   |
| `border-subtle`                                       | the hairline                       | none: decorative, never the only boundary. The text and the bar identify a tab |

## 4. Modes

- **Forced colours:** the bar is `CanvasText` with `forced-color-adjust: none` (a background is replaced otherwise), the hairline `CanvasText`, text `ButtonText`, a disabled tab `GrayText` and the ring `Highlight`. The selected tab keeps its weight and its bar, so the state doesn't rest on a colour.
- **Right to left:** logical properties only. The bar of a vertical tab and the vertical hairline sit at the inline end. The arrow keys flip (the contract).
- **Dark and contrast themes:** the tokens remap, nothing is theme-specific.
- **320px, 400% zoom, text spacing:** the list wraps and never scrolls (1.4.10). A label wraps inside its tab with `overflow-wrap: anywhere`, so a Finnish compound doesn't widen the list. Nothing has a fixed height, so the text-spacing overrides (1.4.12) fit.
- **Density:** the control tokens: 44px tabs and 16px type, and 32px with 14px type inside `kv-compact` from 64rem. Padding is `space-4` on each side in both. Never under 24 × 24 (2.5.8).
- **Motion:** none.

### Q-T1: how a wrapped list marks the selected tab

Each wrapped row's selected tab keeps its own bar, at its own block-end edge. Only the selected tab has one, so the list shows one bar, in the row that holds it, and the hairline runs under the last row. The tabs of a row stretch to the row's height, so a bar sits at the bottom of its row even beside a tab whose label wraps to two lines.

### Vertical

`data-orientation="vertical"` on the root makes it a row: the list as a column (its hairline at the inline end, tabs start-aligned, at most 40% of the row so a long label wraps inside it), then the panel (`flex: 1`, `min-inline-size: 0`, `space-4` of padding at its inline start). The bar moves to the tab's inline-end edge. **Below 40rem it stacks:** the list on top, still a column, with its hairline under it, and the panel gets `space-4` above. A list beside a panel does not fit at 320px.

## 5. Decisions the plan did not settle

- Vertical stacks below 40rem (the library's small-screen breakpoint), because a column beside a panel does not fit at 320px with long labels.
- The vertical list is at most 40% of the row, and the panel's padding moves from above to the inline start.
- `padding-inline` is `space-4` in every density, as written; only the height and the type step down in compact.
- Tabs are not added to the prose not-prose lists: prose styles paragraphs, lists, headings, links and tables, and never a `<button>` or a `<div>`, so the tab list and the tabs need no boundary. A panel in prose is prose, as a section's content is.
- A disabled tab in forced colours is `GrayText`, as a disabled Button.

## 6. Accessibility annotations

Behaviour, roles and keys are in the contract, [tabs.a11y.md](../../packages/react/src/tabs/tabs.a11y.md).

- Names: the list is named by the consumer when a page has more than one. A tab's name is its visible text, and the panel is named by its tab.
- Focus: one Tab stop, at the selected tab, then the panel. The ring is visible on both (2.4.7, 2.4.13).
- WCAG SCs of note: 1.3.1, 1.4.1, 1.4.10, 1.4.11, 2.1.1, 2.4.3, 2.4.7, 2.5.8, 4.1.2.

## 7. Validation

- [x] Contrast pairs: all already required, so nothing new to measure.
- [ ] Review of the stories in the four themes, by eye (the look is never tested).
- [ ] Usability test plan. Result: `pending`.

## 8. Open questions

- Does a wrapped list need a hairline under every row to read as one list? Q-T1 chose one bar per selected tab and one hairline under the last row.
