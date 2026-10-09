# Plan 0092: Motion as a theme preference

- **Status:** Implemented (gates green; stories and AT `pending`)
- **Owner:** lead
- **Created:** 2026-10-09 · **Target:** core, react, theme, docs site
- **Related:** [Plan 0091](0091-landing-v2-evidence.md) (asked for the toggle in the docs header), `theme-css` skill, `packages/react/src/provider/kvirn-provider.md`

## Goal

A person can choose "less motion" inside the site, not only in the operating system, and the default theme honours it exactly as it honours `prefers-reduced-motion: reduce`.

## Non-goals

Per-component motion options; a "force motion on" override of the OS beyond the explicit `full` choice; any token change.

## Design

A third theme axis beside colour scheme and contrast, built the same way:

- **core** (`theme-constants.ts`, `theme-store.ts`, `theme-script.ts`): `motionPreferences = ['full', 'reduce', 'system']`, `motionQuery = '(prefers-reduced-motion: reduce)'`, `motionAttribute = 'data-kv-motion'`. `ThemePreference`, `SystemTheme`, `ResolvedTheme`, `StoredThemePreference`, `ThemeOptions.defaultMotion`, `ThemeActions.selectMotion`. The no-flash script resolves and writes the attribute like the other two. Stored only when it differs from the default; synced across tabs; validated like the others.
- **react**: `useTheme()` returns `motion`, `resolvedMotion`, `selectMotion`; `KvirnProvider theme.defaultMotion`; `KvirnThemeScript defaultMotion`. The provider fixture gets a third fieldset (sv, fi, en).
- **theme.css**: every `@media (prefers-reduced-motion: no-preference)` block's rules now sit inside a zero-specificity gate `:where(:root:not([data-kv-motion='reduce'])) { … }` (`@keyframes` kept outside the gate; the one nested `&:where(a)` rule gets `:where(:root:not([data-kv-motion='reduce']) *)` appended). The two `prefers-reduced-motion: reduce` blocks are repeated under `:where(:root[data-kv-motion='reduce'])`. Specificity of every rule is unchanged, so the cascade is unchanged. 18 blocks, transformed by script and parsed clean by lightningcss.
- **docs site**: Display settings gains a Motion group (Same as my device / Less motion / Full motion) with one line explaining it.

### Accessibility contract (delta)

Same as the theme switcher recipe: native radios in a `fieldset`/`legend`, arrows change the value, focus stays, nothing is announced; the checked radio is the feedback. WCAG 2.3.3 (AAA, animation from interactions) is what the setting serves; 2.2.2 for loops stays the app's duty.

## Tasks

- [x] core: constants, store, script, exports; tests updated and extended (`theme-store.test.ts` 38 ✓, `theme-script.test.ts`)
- [x] react: hook, provider, script component, fixture; tests (`use-theme.test.tsx` 18 ✓ incl. a motion test, `kvirn-theme-script.test.tsx` every preference × system combination incl. motion ✓)
- [x] theme.css gated; `theme:check` ✓ (646 pairs, 4 themes); lightningcss 0 warnings
- [x] docs site Display settings + `messages/en.ts`
- [x] `kvirn-provider.md`, `DESIGN.md` Motion, `theme-css` skill, changeset (minor × 3)
- [ ] Storybook: the provider/theme stories run in CI (not run here); `accessibility-reviewer` on the diff
- [ ] Manual AT matrix: `pending`

## Decisions

- **Three preferences, not a boolean.** `full | reduce | system` mirrors the other axes, so the API, storage, script and tests follow one pattern, and a user whose OS is locked to "reduce" can still choose `full`.
- **Gate with `:where()`, not `!important` or a kill-switch.** A global `* { animation: none !important }` would be simpler but would override consumers' own CSS and break the "one layer, no !important" rule; the gate keeps every rule's specificity and only adds an ancestor condition.
- **Implemented by the lead in one session** because no agent tool was available; CI's whole-tree run is the first full gate.

## Done when

- [ ] Whole-tree `vp run test` green in CI (stories in four themes)
- [ ] Reviewer APPROVE
