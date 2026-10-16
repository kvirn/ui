# Plan 0127: Icon variant, stroke classes and the spinner in Icons/Library

- **Status:** Done (agents; recognition and the usability test of the thinner ring stay with people)
- **Owner:** lead · `component-engineer` builds
- **Created:** 2026-10-17 · **Target:** alpha
- **Related:** [icon-variant-and-stroke.md](../icon-variant-and-stroke.md) (the spec, `ux-designer`), [0124 icon library](0124-icon-library.md), [0126 spinner icon](0126-spinner-icon.md), [loading-indicators.md](../loading-indicators.md), `docs/design/icon.md`

## Goal

Maintainer request, 2026-10-17: (1) the story-only `color` control becomes `variant`, and `Icon` takes a `variant` (a class `kv-icon--<variant>`), per hard rule 14; (2) the CSS spinner and the library `spinner` icon get the same variation; (3) stroke 1, 1.5 or 2 through classes, 1.5 the default; (4) `Icons/Loading spinner` becomes a story inside `Icons/Library`.

## Non-goals

- A `color` or `stroke` prop. Stroke is classes only; colour is only the variant.
- A new token (every variant already uses a measured token).
- Migrating Button busy, Progress, toast and Map status to the icon spinner (Plan 0126 revisit).

## Design

The spec decides everything: variants `primary secondary accent muted info success warning danger` (the default adds no class, `currentColor`); `kv-icon--stroke-1`, `kv-icon--stroke-2`, `kv-icon--stroke-1-5`; `kv-spinner--<variant>` and `kv-spinner--stroke-1|2`; `variant` is a prop on `useIcon`/`Icon` with an exported `IconVariant` and a dev warning for an unknown value. A meaningful icon is at least 20px (24px with `stroke-1`).

### Accessibility contract (draft)

No focusable part, no keyboard rows. Icons stay decorative without `label`; a variant never replaces words (1.4.1); variant colours are at least 3:1 on canvas, surface and surface-raised in all four themes (`theme:check`, group `iconVariantPairs`); forced colours collapse variants to `CanvasText`/`ButtonText`; motion only under `prefers-reduced-motion: no-preference`.

## Decisions

- Lead, 2026-10-17: the CSS ring stays its current size (no inset to match the icon arc: it would shrink every spinner); the 1.5 default stroke reaches the components' spinners now, as the maintainer asked (at 1.25em the ring goes from 2px to 1.25px).

## Tasks

- [x] 1. **Library and theme** (`component-engineer`): `variant` option in `use-icon.ts`/`Icon` + `IconVariant` + dev warning, theme.css classes (icon variants, stroke classes, spinner variants and stroke units, forced colours last), `iconVariantPairs` in the theme check, tests, docs: DESIGN.md `### Icons`, icon.md §6.2-6.5, `icon.tsx` comment, `icon.a11y.md`, loading-indicators.md L6 and §6.4, the theme.css section comment. _Done 2026-10-17: `kv-icon--<variant>` and `kv-icon--stroke-1|1-5|2`, `kv-spinner--<variant>` and `--stroke-1|2`, forced-colours rules after them, `--lg` override dropped. `iconVariantPairs` dedupes identical requirements only (an existing test needs the 3:1 `danger` entry beside its text pair). The `spinner` icon needs no test of its own (not built in)._
- [x] 2. **Stories** (`component-engineer`, after 1): `Icons/Library` gets `variant` and `stroke` controls (no `color`), a `Variants` story, a `LoadingSpinner` story (sizes, still arc, in context, RTL); delete `loading-spinner.stories.tsx`; one Progress story for the CSS spinner variant and stroke.
  - Done: `LoadingSpinner` is one story (sizes animated and at rest, in context, long label) plus `LoadingSpinnerRtl` for the global `dir`; the Progress story is `SpinnerVariants`. `Variants` uses the status icons for info, success, warning, danger (`error`) and the `name` control's icon for the rest.
- [x] 3. **Review** (2026-10-17: `accessibility-reviewer`, no finding on the variant, stroke or forced-colours rules; one story blocker fixed; `theme:check` 690 pairs green): `accessibility-reviewer` on the diff; `vp run theme:check`.
- [x] 4. **Record** (roadmap, plans index): roadmap line, plans README row.

## Gates

`vp check <files>` → `vp test run <changed tests and the icon story files>` → `vp run theme:check` → `vp run i18n:check` (no strings change).
