# ADR-0019: Palette scales named by role, a secondary edge token, and an unused accent

- **Status:** Accepted (2026-10-01, by the maintainer)
- **Date:** 2026-10-01
- **Deciders:** Maintainer (direction), proposed by the component-engineer agent
- **Tags:** theming, api

## Context

ADR-0013 shipped a Tailwind-style palette named by hue: `--kv-gray-*`, `--kv-indigo-*`, `--kv-red-*`, `--kv-green-*`, `--kv-amber-*` and an unused `--kv-teal-*`. A municipality whose brand is green either points semantic tokens at `--kv-teal-*`-style steps one by one, in every theme, or redefines `--kv-indigo-500` as green, which leaves a variable called "indigo" holding green. The maintainer's direction: "Colors need to be aliased like primary, secondary, accent, surface, neutrals, grays etc., not red, blue and green", so a consumer can rebrand without refactoring.

Contrast must not change: same hexes, new names, and `theme:check` green on every pair.

## Decision drivers

- A rebrand is one override (one scale), and all four themes follow.
- No change to any measured contrast value, and no change to the semantic token names components use.
- Keep DESIGN.md's "one accent" rule for the default theme.
- A swapped scale can fail contrast, so the documentation must send adopters to `checkThemeCss()`.

## Options considered

### Option A: rename the scales by role (chosen)

`neutral` (was gray), `primary` (was indigo), `secondary` (new, aliases neutral), `accent` (was teal), `danger` (was red), `success` (was green), `warning` (was amber), plus `--kv-white` and `--kv-black`.

- ✅ A rebrand is the eleven `--kv-primary-*` steps on `:root`. Every semantic token that uses the scale, in every theme, follows.
- ✅ No variable ever holds a colour that contradicts its name.
- ❌ Breaking for anyone who used the hue names. The theme is pre-alpha and unreleased, so nobody does yet.

### Option B: keep hue scales and add role aliases on top

- ✅ Not breaking.
- ❌ Three tiers instead of two, and an override of `--kv-primary-500` would not reach tokens that still point at `--kv-indigo-500`.

## Decision

We will use Option A, with these details:

1. **Same hexes.** The raw values move unchanged into the role scales. The palette block stays the only place with raw colours.
2. **`--kv-secondary-*` aliases neutral by reference.** Each step is `var(--kv-neutral-<step>)`, so a neutral override also reaches it, and a consumer can give secondary its own hue.
3. **A new semantic token, `--kv-color-secondary`, is the secondary button's edge.** The base `.kv-button` border uses it instead of `border-control`. It points at `secondary-500`, `secondary-500`, `secondary-700` and `secondary-200` in light, dark, light high contrast and dark high contrast: the same steps as `border-control`, so the default look and every ratio are unchanged. It is `ButtonBorder` in forced colours. `contrast-requirements.ts` holds it to everything `border-control` is held to (3:1 on `canvas`, `surface`, `surface-raised`, `primary-subtle` and the three status panels), which adds 7 pairs per theme (71 per theme, 284 in all). `border-control` stays neutral for inputs and checkboxes. The secondary button's text and hover are unchanged: text is `black`/`white` in the contrast themes, which isn't a scale step, and the hover uses the primary colours.
4. **`--kv-accent-*` (teal) stays unused by the default theme.** Giving it a role, such as `mark`, would add a second accent against DESIGN.md's "one accent" rule, and would change the yellow highlight readers expect and its measured contrast. It's documented as available for a brand's second colour.
5. **The documented rebrand is a teal brand scale for `--kv-primary-*`** (`#edfafa` … `#00262a`, with `500` `#007d86` and `600` `#00707a`). A test checks that it passes `checkThemeCss()` in all four themes. The accent scale copied into primary as it is fails (white on its 500 is 4.37:1), and the docs say so, as the example of why a customised copy must be checked.
6. **Scales are overridden on `:root`.** Custom properties are resolved where they're declared, and the semantic tokens are declared on `:root`, so a scale overridden on a wrapper element doesn't reach them. The Foundation/Theming story scopes its demo to a panel, so it also re-points the primary-scale semantic tokens there, generated from `theme.css`'s own mapping, and says why.

## Accessibility impact

- No change to any colour users see in the default theme: every semantic token resolves to the same hex in all four themes and the OS fallbacks.
- The secondary button edge is now checked as its own token, so a consumer who tints `--kv-secondary-*` gets a `theme:check` failure if the edge drops below 3:1 (1.4.11).
- A rebrand that swaps a whole scale can fail in a theme the adopter didn't look at. Mitigation: README, DESIGN.md, the docs Button page and the Theming story all point to `checkThemeCss()` and the live pages.

## Consequences

- Positive: rebranding is one documented override, without a refactor.
- Negative / trade-offs: one more semantic token (`secondary`) and seven more contrast pairs per theme. `colorTokenNames` is public API, so the change needs a changeset.
- Known limitation: a scale can only be overridden on `:root` (decision 6), so one part of a page can't carry a different brand. Supporting that, for example by also declaring the semantic tokens on a scoping attribute, needs its own ADR.
- Follow-ups: when inputs and checkboxes ship, decide whether they need their own role (they use `border-control` today).

## Validation

- `vp run theme:check`: 284 pairs in 4 themes, all passing.
- `packages/theme/src/theme-css.test.ts`: the brand scale passes `theme:check` in all four themes, and a raw accent swap fails with the expected message. The scales' shape is reviewed visually, not tested.

## References

- ADR-0013 (addendum), ADR-0014, ADR-0017, ADR-0018
- DESIGN.md, Colors and Theming
- `packages/theme/theme.css`, `packages/theme/README.md`
