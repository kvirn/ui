# ADR-0021: A hovered primary button keeps a `primary` edge

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Maintainer (proposed by the ux-designer agent in the Card design spec, Plan 0007)
- **Tags:** theming, a11y

## Context

A primary button's boundary is its fill. On hover the fill changes to `primary-hover`, and `contrast-requirements.ts` already holds `primary-hover` to 3:1 on `canvas` and `surface` (1.4.11). Cards (Plan 0007) put buttons on `surface-raised`, and dialogs and popups will too. In the dark theme, `primary-hover` (`primary-600`, `#4f5ac0`) on `surface-raised` (`neutral-900`, `#18191a`) is 2.98:1, just under 3:1. The other three themes pass (5.91, 12.65 and 11.79).

## Decision drivers

- The button's boundary stays at 3:1 on every surface it can sit on, in every state.
- No change to the resting look, and the smallest change to the hover look.
- No new colour values (ADR-0014 contrast margins).

## Options considered

### Option A: keep a 1px `primary` border on hover (chosen)

- ✅ The edge is `primary` on the surface, a pair `theme:check` already holds to 3:1 (lowest 3.75:1 on `surface-raised` in dark).
- ✅ Barely visible in light, where `primary-hover` is darker than `primary`. A subtle lighter rim in dark.
- ❌ A small change to Button's hover look.

### Option B: a lighter `primary-hover` in dark

- ❌ White text on a lighter fill falls below 4.5:1 (ADR-0014: the hover darkens because white on `#828fff` is 2.87:1).

### Option C: exclude primary buttons from `surface-raised`

- ❌ Cards, dialogs and popups need a primary action.

## Decision

We will use Option A: `.kv-button.kv-button--primary` on hover and active has `border-color: var(--kv-color-primary)` instead of `transparent`.

What `theme:check` and the theme tests enforce (amended during Plan 0007 implementation, 2026-10-01):

- **The hovered primary edge is `primary` on the surface.** `primary` on `canvas`, `surface` and `surface-raised` was already required at 3:1, and stays required. A theme test (`theme-css.test.ts`) checks that a hovered filled button's edge (its border, or its fill when the border is transparent) reaches 3:1 on `canvas`, `surface` and `surface-raised` in all four themes.
- **`primary-hover` on `surface-raised` is not a requirement.** It's 2.98:1 in dark, so a hard 3:1 pair would fail `theme:check`, and the boundary doesn't rely on it. A comment in `contrast-requirements.ts` records the value and why the border exists. It isn't dropped silently, and the check isn't weakened.
- `primary-hover` on `canvas` and `surface` stays required at 3:1, as before.
- **`danger-hover` on `canvas`, `surface` and `surface-raised` is added as 3:1 requirements.** The danger button's hovered border is transparent, so its fill is the edge. Today it passes on every surface (lowest 7.73:1). If it ever drops below 3:1, the danger button gets the same border treatment.

## Accessibility impact

- 1.4.11: the primary button's boundary is at least 3:1 in every state on `canvas`, `surface` and `surface-raised`.
- Forced colours: this change doesn't fix them, and they're not correct today. The variant hover rules (`.kv-button.kv-button--primary` and `.kv-button.kv-button--danger` with `:not(…):is(:hover, :active)`, specificity 0,4,0) beat Button's forced-colours hover rule (0,3,0). So in forced colours a hovered primary button is `Highlight` with `ButtonText` (about 1.9–2.4:1), and a hovered danger button is `CanvasText` on `CanvasText`, which hides its label. This was already the case before this ADR, and it's outside Card's scope.

## Consequences

- Positive: buttons on cards, dialogs and popups keep a visible boundary on hover in dark.
- Negative: a 1px rim on a hovered primary button in dark.
- Follow-ups: a story state that shows the hovered primary button on `surface-raised`.
- Follow-up: Button a11y defect: variant hover rules override the forced-colours hover rule; separate fix.

## Validation

- `theme:check` green with the added `danger-hover` pairs (296 pairs in 4 themes).
- `theme-css.test.ts`: the hovered edge of the primary and danger buttons reaches 3:1 on every plain surface in all four themes.

## References

- `docs/design/card.md`, Plan 0007, ADR-0014, ADR-0020
