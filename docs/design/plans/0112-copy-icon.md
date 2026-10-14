# Plan 0112: `copy` built-in icon, and the icon-only Copy code button

- **Status:** Approved (maintainer, in session, 2026-10-14)
- **Owner:** lead / component-engineer
- **Created:** 2026-10-14 · **Target:** next
- **Related:** [docs-code.md](../docs-code.md) D1, D8, D9 · [icon.md](../icon.md) §4.1 row 25 · DESIGN.md Icons · [copy-button.md](../copy-button.md) · [tooltip.md](../tooltip.md)

## Goal

The docs-site code block copies from a small icon-only button with a Tooltip, inside the expanded code. For that, the library gets a 25th built-in icon, `copy`.

## Non-goals

- A `sort` icon or raising the 25-icon cap (see Risks).
- Changing `CopyButton` / `CodeBlock.Copy` in `packages/react`: the docs site composes them with `<Icon name="copy" />`.
- New strings: the name is the existing `docs.code.copy` ("Copy code").

## Design

### API

Public API change: `BuiltInIconName` gains `'copy'` (derived from `shapes`, so no type edit). `<Icon name="copy" />` works with no registration. Not mirrored in RTL (an object, the offset shows depth).

### Icon (icon.md §4.1 row 25)

24×24 viewBox, same stroke, caps and joins as its neighbours. Two 11.5 × 11.5 sheets, radius 2, offset 4.5 on both axes, filling the 4–20 keyline.

- Front, closed: `M6 8.5h7.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7.5a2 2 0 0 1 2-2Z`
- Back, open, only the part outside the front: `M8.5 8.5V6a2 2 0 0 1 2-2H18a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-2.5`

The engineer writes the `shapes` entry in the file's own form (look at the neighbours), and the paths above must not match any Heroicons path (icon.md originality rule).

### Docs-site button (docs-code.md §5–§7, D8)

Covered by the spec; this plan does not repeat it. In short: Copy code is a small icon-only `Button` plus `Tooltip` in a tools row above the code, inside the panel, with the status beside it; the title bar holds the file name, note and the Code toggle. On `(hover: none) and (pointer: coarse)` the text "Copy code" shows beside the icon.

### Accessibility contract (draft)

| Key           | Action                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------- |
| Tab           | Code toggle → Copy code (only while the code is open) → code region (only while it overflows) |
| Shift+Tab     | The reverse                                                                                   |
| Enter / Space | On Copy code: copy; the status and the polite announcement follow                             |
| Escape        | On the focused Copy code with its Tooltip open: closes the Tooltip only                       |

- Roles / ARIA: native `button`; accessible name "Copy code"; the icon is `aria-hidden`; the Tooltip is hidden from screen readers (the name is read once).
- Announcements: unchanged, polite `docs.code.copied` / `docs.code.copyFailed`.
- WCAG SCs: 1.4.11, 1.4.13, 2.1.1, 2.4.7, 2.5.3, 2.5.8, 4.1.2, 4.1.3.

### i18n strings

None new.

## Tasks

- [x] `packages/react/src/icon/built-in-icons.tsx`: add `copy` as #25 to `shapes`, not in `mirroredInRtl`
- [x] `packages/react/src/icon/icon.test.tsx`: add `copy` to the name list (~81–106) and the "24 icons" title; the mirror test stays at five names
- [x] `packages/react/src/icon/icon.md`: table row + counts; `icon.a11y.md:51`: icon-only names close, search, copy (with a Tooltip). Flag, don't fix, the existing "menu" entry that DESIGN.md doesn't allow
- [x] `apps/docs/examples/icon/built-in-set.tsx`: add `copy`; Storybook Icon stories: grid of 25 and `copy` in the icon-only row
- [x] `docs/design/read-aloud.md:175`: the "slot held for `sort`" line is out of date
- [x] Docs site: `example-frame.tsx`, `code-block.tsx`, `docs.css`, `example-frame.test.tsx`, `code-block.test.tsx` per docs-code.md §11 (icon-only button, Tooltip, tools row, touch text, CodeBlock the same)
- [x] Tests: named test per row: name "Copy code", Tooltip text equals the name and is not a second reading, Tab order, Enter/Space copies and announces, failed status persists, copy is unreachable while collapsed
- [ ] Gates: `vp check`, `vp test run` on touched files, `vp run i18n:check`, `vp run theme:check`; `accessibility-reviewer` once

## Decisions

- **Library icon, not a docs-local one** (maintainer): other products need the same affordance, and the set already holds the other clipboard-adjacent shapes. Weighed: docs-local `defineIcons` entry (no API change), text-only button.
- **Icon-only exception is general** (maintainer): copy joins close and search, always with a Tooltip and an accessible name. DESIGN.md Icons updated in the same change.
- **Touch shows the word** (maintainer): no hover means no Tooltip, so the name is visible on `(hover: none) and (pointer: coarse)`.
- **Two steps** (maintainer): open, then copy; a short page of previews matters more than one extra press.

- **Implementation:** the Icon fixture gains `button.copy` (5 locales) for the icon-only row; `onFailed` no longer opens the panel (already open), so `useCodeCopy` keeps the option unused by ExampleFrame; no-JS rule hides `.docs-code-tools`; the tools row is `align-items: center` (a wrapped status centres the button).

## Risks & open questions

- `icon.a11y.md` lists `menu` as an icon-only name, which DESIGN.md does not allow: left as it was, for the maintainer.
- `copy` takes the last slot under the 25-icon cap, so a later `sort` icon needs the cap raised (a maintainer decision then).
- Touch layout and the Tooltip's keyboard behaviour on the button have no gate: manual check at 320px and on a real phone.
- AT matrix for the icon-only button stays `pending` (no agent claims a human check).

## Testing strategy

Standard pyramid. The Icon `test.each(builtInIconNames)` and the Storybook Icon axe sweep cover `copy` automatically once it is in `shapes`; no CSS or path-data assertion.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` updated if it lists the icon count
