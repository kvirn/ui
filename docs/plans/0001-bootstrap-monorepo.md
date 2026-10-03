# Plan 0001: Bootstrap the monorepo (M0)

- **Status:** Done
- **Owner:** Maintainer
- **Created:** 2026-09-30 · **Target:** M0 Foundation
- **Related:** Plan 0002, Plan 0003

## Goal

A contributor (human or agent) can run every command in AGENTS.md and get a real result, and the Stop hook actually gates work. Today the repo is docs-only: no `package.json`, no git, no `vp`.

## Non-goals

- Any component. KvirnProvider (Plan 0002) and Button/Link (Plan 0003) prove the gates, replacing Disclosure as the M0 proof component.
- Docs site content. Only an empty `apps/docs` skeleton.
- Publishing to npm.

## Background

- Toolchain is fixed (see docs/engineering.md): pnpm workspaces + catalogs, Vite+ (`vp`), Oxlint + Oxfmt, Vitest browser mode, Playwright, Storybook (Vite builder), Changesets.
- `engineering.md` requires verifying `vp` command names against viteplus.dev during bootstrap.
- `.claude/hooks/verify.sh` no-ops until `package.json` exists. Once it does, every session with code changes is gated.

## Design

```
package.json  pnpm-workspace.yaml (catalogs)  vite.config.ts  .changeset/
tooling/tsconfig/  tooling/vite-preset/
packages/core      src/store/create-component-store.ts   (only importer of @tanstack/store)
packages/react     src/store/use-store-selector.ts       (useSyncExternalStore)
packages/i18n      src/{en,sv,fi,nb,nn,se}.ts + types     scripts/i18n-check
packages/theme     tokens (empty tiers)                   scripts/theme-check
packages/testing   expectNoA11yViolations (axe, WCAG 2.2 AA tags)
apps/storybook     a11y addon, globals: locale, dir, forcedColors
apps/docs          Next.js skeleton
```

Catalog pins: React 19, TypeScript (strict), `@tanstack/store` (exact), Vitest 4, Playwright, `@axe-core/playwright`, `axe-core`, Storybook, Next.

Playwright projects: `chromium`, `firefox`, `webkit`, `chromium-forced-colors`, `mobile-safari`, `mobile-chrome`, `reflow-320`.

## Tasks

- [x] `git init`, `.gitignore`, default branch `main`
- [x] Install Vite+ and verify every command in AGENTS.md against viteplus.dev. Fix `AGENTS.md` and `engineering.md` if names differ
- [x] Root `package.json`, `pnpm-workspace.yaml` with catalogs, `vite.config.ts`
- [x] `tooling/tsconfig` (strict, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) and `tooling/vite-preset`
- [x] Oxlint with `react` + `jsx-a11y`. List missing jsx-a11y rules in `engineering.md`
- [x] Package skeletons with `exports` maps, ESM only, `sideEffects: false`, `vp pack`
- [x] `core`: `createComponentStore` + unit tests. Lint rule or check that `@tanstack/store` is imported only in `core/src/store/`
- [x] `core`: `Env` type and `getDefaultEnv()` (resolved lazily, never at module scope)
- [x] `react`: `useStoreSelector` + test
- [x] `testing`: `expectNoA11yViolations` + test that it fails on a known violation
- [x] `i18n:check` (every key in all 6 locales) and `theme:check` (4.5:1 text, 3:1 UI/focus) scripts
- [x] Storybook app with locale, dir and forced-colors globals
- [x] Playwright config with all 7 projects
- [x] Changesets
- [x] CI workflow running gates 1–4 (GitHub Actions). Written, not yet run: needs a GitHub remote
- [x] `apps/docs` Next.js skeleton, no third-party requests
- [x] Update `docs/roadmap.md`: M0 proof component is Button (Plan 0003), not Disclosure

## Risks & open questions

- Vite+ is young. Command names or browser-mode config may differ from the docs. Mitigated by the verify task.
- Agents mustn't mark M0 done until Plan 0003 is green on all gates.

## Done when

- [x] `vp check`, `vp test run`, `vp run e2e`, `vp run i18n:check`, `vp run theme:check` all run and pass on the skeleton
- [x] The Stop hook blocks on a deliberately failing test (verified once, then reverted)

Verified 2026-09-30. `vp run e2e` passes on every project except `webkit` and `mobile-safari`. Those can't launch on the maintainer's machine until WebKit's system libraries are installed (needs `sudo`). CI installs them. `i18n:check` and `theme:check` pass on empty catalogs and palettes, and a probe proved each fails on bad input.
