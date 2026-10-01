# ADR-0017: Implementation details of the default-theme prototype (Plan 0005, Phase 1)

- **Status:** Accepted (2026-10-01, by the maintainer)
- **Date:** 2026-10-01
- **Deciders:** Maintainer (proposed by the component-engineer agent)
- **Tags:** theming, tooling
- **Revised:** 2026-10-01, with ADR-0013 (single `theme.css`). On acceptance: decision 4 now ships the full-feature Inter, decision 7 has an exit criterion, and ADR-0019 supersedes decision 9

## Context

Plan 0005 Phase 1 builds the prototype of ADR-0013 (delivery) and ADR-0014 (visual direction). The specs leave some implementation choices open, and a few spec details didn't survive contact with the tools. This ADR records those choices. It was accepted together with ADR-0013 and ADR-0014.

## Decision drivers

- One source of truth for tokens, and generated files that can't drift from it
- No new dependency, and no third-party request at build time or at runtime (hard rules 6 and 7)
- Every gate stays as strict as it is

## Decisions

Revised on 2026-10-01 after the maintainer's review, with ADR-0013 (single `theme.css`). Decisions 1, 2, 3 and 5 replace the first prototype's generated CSS.

1. **`theme.css` is hand-written, and `theme:check` reads it.**
   - `packages/theme/src/read-theme.ts` is a small reader for what a theme file needs: rules, `@layer`, `@media` with `and`, and `:root` selectors with attributes, `:not()`, `:is()` and `:where()`. It applies the matching rules by specificity and source order, and resolves `var()` chains, for a theme selected by attributes or by the OS.
   - `checkThemeCss()` checks that every colour token resolves to a hex colour, that each OS fallback equals its attribute theme, and every pair in `contrast-requirements.ts`. `theme-css.test.ts` runs it on the shipped file, and checks that every colour token maps to a system colour in forced colours. The look (palette shape, token values, density) is reviewed visually, not tested.
   - Rejected: a real CSS parser (a new dependency, ADR-0003) and keeping a TypeScript source (the file couldn't be the documentation).
2. **Forced colours** map every semantic token to a system colour in `theme.css`, with the selector `:root:is(*, [data-kv-color-scheme][data-kv-contrast])`. It always matches `:root`, and its specificity (0,3,0) beats every theme selector. The Button and Link sections add explicit system colours for their own parts.
3. **Contrast requirements** are a superset of ADR-0014's list: 48 pairs per theme (192 in total), not 42. The extra pairs are `link-hover` on `surface` and `surface-raised`, `primary-hover` on `canvas` and `surface`, `focus-ring` on `primary-subtle`, and `primary` on `primary-subtle`. All of them pass.
4. **Inter is plain `@font-face` CSS, not `next/font/local`.**
   - The vendored files are `latin` and `latin-ext` subsets of Inter Variable 4.001, cut with fontTools from `InterVariable.woff2` in the upstream Inter 4.1 release, with the SIL OFL 1.1 in `apps/docs/fonts/inter/OFL.txt`. The release was downloaded once, by hand, to build them. Nothing is fetched at build time or at runtime.
   - The subsets keep every OpenType feature, so `cv05` and `cv08` (DESIGN.md's l/I/1 disambiguation) and `tnum` work. The `opsz` axis is pinned to 14, the text design, which keeps the look of the first prototype's files and the size down (about 155 KB for both). The commands are in `inter.css`.
   - The Sámi letters need both subsets under one family name, split by `unicode-range`. `next/font/local` can't express that, because it gives each call its own family name and a size-adjusted fallback that would catch the Latin Extended-A letters first.
   - `apps/docs/fonts/inter/inter.css` is imported by the docs layout and by Storybook's `preview.tsx`. Both bundlers hash and self-host the files. Storybook doesn't use `staticDirs`.
5. **Storybook has one set of stories per component,** co-located in `packages/react` (`Components/Button`, `Components/Link`, `Foundation/KvirnProvider`).
   - The preview imports `theme.css?raw` and adds it as a `<style>` element, so the Theme toolbar's "None (unstyled)" option can remove it. The canvas decorator connects the theme store like a provider, and selects a fixed theme only for the fixed-theme stories.
   - The play checks of the old headless and `Default theme/*` stories are merged. Stories that the e2e specs open keep their names, so only the ID prefix changed. Each component has an `Unstyled` story, an axe test of the removed theme.
   - Shared play checks live in `packages/react/src/stories/theme-story-assertions.ts`. They check that a fixed theme reached `<html>`, the 24 × 24 target size (2.5.8) and reflow (1.4.10), never the look, so the stories don't import `@kvirn-ui/theme`.
   - The example texts in six languages moved to `apps/docs/components/example-texts.tsx`, because only the docs site uses them now. The stories use Swedish, Finnish and English fixture text inline, like the provider stories.
6. **The docs shell is tested like a component.** The Vitest `browser` project includes `apps/docs/components/**/*.test.tsx`, with the real theme and docs CSS loaded. The shell takes `pathname` as a prop, so the test doesn't need Next.js. The docs e2e harness stays Phase 2 (C5).
7. **The docs TypeScript program turns off `exactOptionalPropertyTypes`.**
   - `next build` type-checks the workspace packages' TypeScript source together with two ambient types: Next's `tw?: string` attribute (from `@vercel/og`) and the registered `NextLink`'s `as?: Url`.
   - Both leave out `| undefined`, so `mergeProps(...)` in `button.tsx` and `link.tsx` fails to type-check in that program only.
   - The library itself stays checked with the flag on by `vp check` (the root tsconfig). Published consumers compile against `.d.ts` files and aren't affected.
   - This is temporary. The flag returns to `true` in the docs tsconfig as soon as `mergeProps` and `renderPart` type-check with third-party props that omit `| undefined` (see Follow-ups).
   - The docs tsconfig also moves from `jsx: preserve` to `react-jsx`, which is what Next.js 16 requires, and which lets Vitest transform the docs files.

> **Note (2026-10-01):** the scales below were renamed by role in ADR-0019, with the same values: `gray` is now `neutral`, `indigo` is `primary`, `red` is `danger`, `green` is `success`, `amber` is `warning` and `teal` is `accent`. The documented rebrand in decision 9 is now an override of the `--kv-primary-*` scale.

8. **Palette consolidation changed a few measured values.** Eleven steps per hue can't hold every value of ADR-0014's table, so near-duplicates were merged onto one step. Every pair still passes `theme:check`, and the Linear reference values (`#010102`, `#0f1011`, `#18191a`, `#23252a`, `#f7f8f8`, `#5e6ad2`) are steps.
   - Light: `surface` `#f6f7f7` → `#f7f8f8` (gray-50), `border-control` `#7c808a` → `#6b7079` (gray-500, 4.53:1 on `primary-subtle` instead of 3.49:1), `link` `#5561cb` → `#4f5ac0` (indigo-600, 5.21:1 on `primary-subtle` instead of 4.68:1).
   - Dark: `primary-hover` `#4d58c0` → `#4f5ac0` (indigo-600), `danger-hover` `#ffb0ba` → `#ffb3bd` (red-200).
   - Light high contrast: `surface` → `#f7f8f8`, `border-subtle` `#6b7080` → `#6b7079`, `text` `#000000` → `#010102`, `text-muted` `#33363d` → `#3a3d45` (gray-700), `primary-subtle` `#eef0fd` → `#eff0fb`, `danger` `#8c1026` → `#962034` (red-700).
   - Dark high contrast: `border-control` `#c4c8d0` → `#d0d6e0` (gray-200).
   - New steps with no measured source (for example gray-300, red-400 and red-500, the green and amber middles) are interpolated.
9. **Superseded by ADR-0019.** ~~A `teal` scale ships unused, so the documented one-line rebrand, `--kv-color-primary: var(--kv-teal-600)`, works as written.~~ The teal scale is now the unused `accent` scale, and the documented rebrand is an override of the `--kv-primary-*` scale.
10. **Consumer classes are named `kv-nav`, `kv-button-group` and `kv-compact`:** `kv-<name>` for context the consumer sets on a container, `kv-<part>` for the class a component sets on its part, and `kv-<part>--<option>` for a choice the consumer adds to a part (`kv-button--primary`). `data-*` is only state. (Revised 2026-10-01 with ADR-0013, from `data-*` attributes to classes.)

## Accessibility impact

- Every pair still passes `theme:check`. The palette consolidation (decision 8) raised the light `border-control` and `link` contrast. Some margins shrank but stay above their minimum, the smallest being `danger` on `danger-subtle` in light high contrast (7.31:1, needs 7:1) and `on-primary` on `primary-hover` in dark (5.91:1, was 6.05:1).
- Each component's `Unstyled` story is an axe test of the components without the theme.
- The font fallback is unchanged (system-ui).
- `cv05` and `cv08` now take effect, so l, I and 1 are distinct in case numbers, codes and names.

## Consequences

- Positive: one readable source file, no generator, no new dependency, and the docs shell has behaviour tests before the e2e harness exists.
- Negative / trade-offs:
  - The theme reader supports only the CSS a theme file needs. An adopter's copy with, say, CSS nesting on `:root` isn't read correctly by `checkThemeCss`.
  - One cross-app import remains: Storybook loads the font CSS from `apps/docs/fonts/`.
  - Updating Inter means repeating the fontTools steps in `inter.css` by hand.
  - The docs program is less strict about optional properties than the library.
- Follow-ups:
  - Make `mergeProps` and `renderPart` type-check under `exactOptionalPropertyTypes` with third-party props, so the docs flag can return to `true` (a Plan 0003 follow-up).
  - The docs e2e harness in Phase 2 (Plan 0005, C5).

## References

- Plan 0005, ADR-0013, ADR-0014, ADR-0019, DESIGN.md
- `docs/design/default-theme-button-link.md`, `docs/design/storybook-presentation.md`, `docs/design/docs-site.md`
