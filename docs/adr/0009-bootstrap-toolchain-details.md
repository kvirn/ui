# ADR-0009: Toolchain details chosen at bootstrap

- **Status:** Proposed
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** tooling

## Context

ADR-0002 chose Vite+ and pnpm. Plan 0001 turned that into a working repo, and several smaller decisions came up on the way that affect every contributor.

## Decision

1. **Versions.** Vite+ 1.0.0 is pinned exactly and bundles Vitest 5, Oxlint 1.85, Oxfmt and tsdown. TypeScript 7 (tsgo) does the type checking, through `vp check` with `typeAware` and `typeCheck` on. pnpm 12 comes from `devEngines`. Catalogs run in `strict` mode.
2. **Test projects in the root `vite.config.ts`.**
   - `node` runs `core`, `i18n` and `theme`.
   - `browser` runs `react` and `testing` in Chromium through Vitest browser mode.
   - `storybook` runs every story through `@storybook/addon-vitest`. The a11y addon is set to `test: 'error'` with the WCAG 2.2 AA tags, so every story state is an axe test inside `vp test run`. This replaces the separate Storybook test runner named in `engineering.md`.
3. **Source-first package exports.** `exports` point to `src/*.ts`, so the workspace, tests and Storybook use source without a build step. `publishConfig.exports` point to `dist` for publishing. `vp pack` doesn't rewrite `exports`.
4. **Lint strictness.**
   - All 36 Oxlint jsx-a11y rules are errors, plus `react/iframe-missing-sandbox`.
   - `@tanstack/store` may only be imported in `core/src/store/`.
   - `core` may not import React or use `window`, `document`, `navigator`, storage or `matchMedia` globals, except in `core/src/env/`.
   - `.only`, `.skip`, `any` and ts-comment suppressions are errors.
5. **pnpm settings.**
   - `dedupePeers: true` keeps a single Vitest copy. Without it, Storybook's optional peers split Vitest into two instances and story tests fail with "Vitest failed to find the runner".
   - `allowBuilds` allows only `esbuild`'s install script.
   - Storybook 10.6's optional `vite-plus` peer (`^0.1 || ^0.2`) is allowed to be 1.0.
6. **Playwright** adds a `chromium-reduced-motion` project, because AGENTS.md gate 3 names reduced motion but `engineering.md` had no project for it. That makes 8 projects.
7. **CI** pins GitHub Actions to commit SHAs, uses read-only `contents` permissions, and installs WebKit's system dependencies itself.
8. **Hooks** find `vp` on `PATH`, then the global install, then `node_modules/.bin`. If none is found, the Stop hook **blocks**, so a missing toolchain can never silently pass the gate. Before the first commit it runs the full test suite instead of `--changed`.
9. **No telemetry:** Storybook's telemetry is disabled in config, and Next.js's through `NEXT_TELEMETRY_DISABLED=1` in every script.

## Accessibility impact

Positive: axe runs on every story in the default `vp test run`, not just in e2e. All static jsx-a11y rules are on.

## Consequences

- Positive: a single `vp test run` covers unit, browser, story and axe. Library source is used directly, with no stale `dist` in tests.
- Negative:
  - `dedupePeers` and the `vite-plus` peer allowance are workarounds, to review when Storybook declares Vite+ 1.x support.
  - Local WebKit on Linux needs `sudo` to install system libraries.
- Follow-ups:
  - `core` coverage threshold (90%) and per-component bundle budgets in CI (engineering.md). Not yet configured.
  - The first CI run happens once the repo has a GitHub remote.

## Validation

Verified on 2026-09-30:

- **Lint and type checking:** `vp check` fails on a deliberate type error, a `@tanstack/store` import outside `core/src/store/`, a React import in `core` and `window` in `core`.
- **Stories:** `vp test run` fails on a story with a nameless button (axe `button-name`).
- **Stop hook:** it blocks on a failing test.
- **Checks:** `i18n:check` and `theme:check` fail on a missing key and on a 2.85:1 pair.
