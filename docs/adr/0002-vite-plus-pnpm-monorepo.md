# ADR-0002: Vite+ and pnpm monorepo

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** tooling

## Context

KvirnUI needs one fast, consistent toolchain across the library packages, Storybook and a Next.js docs app, with as few moving parts as possible for a solo maintainer.

## Options considered

- **Vite+ (`vp`) + pnpm.** One CLI for dev, build, `pack` (tsdown), `test` (Vitest), `lint` (Oxlint), `fmt` (Oxfmt) and cached tasks (`vp run`).
- **Turborepo + ESLint + Prettier + tsup.** Mature, but four tools to configure and keep aligned.
- **Nx.** Powerful, but heavy for a library monorepo.

## Decision

- Use **pnpm workspaces with catalogs**, and **Vite+** as the single toolchain.
- **No ESLint and no Prettier.** Oxlint (with the `react` and `jsx-a11y` plugins) and Oxfmt are the only lint and format tools.
- **Accept Oxlint's jsx-a11y rule gaps.** Gaps are documented in `docs/engineering.md`, and are covered by axe (Vitest and Playwright), keyboard e2e tests and `accessibility-reviewer`. We don't add ESLint to cover them.
- **Next.js (docs) keeps its own build** and is orchestrated through `vp run docs` / `vp run build`. Storybook uses the Vite builder.

### Toolchain details (bootstrap, Plan 0001)

1. **Versions.** Vite+ 1.0.0 is pinned exactly and bundles Vitest 5, Oxlint 1.85, Oxfmt and tsdown. TypeScript 7 (tsgo) does the type checking, through `vp check` with `typeAware` and `typeCheck` on. pnpm 12 comes from `devEngines`. Catalogs run in `strict` mode.
2. **Test projects in the root `vite.config.ts`.**
   - `node` runs `core`, `i18n` and `theme`.
   - `browser` runs `react` and `testing` in Chromium through Vitest browser mode.
   - `storybook` runs every story through `@storybook/addon-vitest`. The a11y addon is set to `test: 'error'` with the WCAG 2.2 AA tags, so every story state is an axe test inside `vp test run`. This replaces a separate Storybook test runner.
3. **Source-first package exports.** `exports` point to `src/*.ts`, so the workspace, tests and Storybook use source without a build step. `publishConfig.exports` point to `dist` for publishing. `vp pack` doesn't rewrite `exports`.
4. **Lint strictness.**
   - All 36 Oxlint jsx-a11y rules are errors, plus `react/iframe-missing-sandbox`.
   - `@tanstack/store` may only be imported in `core/src/store/`.
   - `core` may not import React or use `window`, `document`, `navigator`, storage or `matchMedia` globals, except in `core/src/env/` (ADR-0003).
   - `.only`, `.skip`, `any` and ts-comment suppressions are errors.
5. **pnpm settings.**
   - `dedupePeers: true` keeps a single Vitest copy. Without it, Storybook's optional peers split Vitest into two instances and story tests fail with "Vitest failed to find the runner".
   - `allowBuilds` allows only `esbuild`'s install script.
   - Storybook 10.6's optional `vite-plus` peer (`^0.1 || ^0.2`) is allowed to be 1.0.
6. **Playwright** has a `chromium-reduced-motion` project, because AGENTS.md gate 3 names reduced motion. That makes 8 projects. Since ADR-0042 only the four Chromium ones run by default.
7. **CI** pins GitHub Actions to commit SHAs, uses read-only `contents` permissions, and installs its browsers itself (Chromium only since ADR-0042).
8. **Hooks** find `vp` on `PATH`, then the global install, then `node_modules/.bin`. If none is found, the Stop hook **blocks**, so a missing toolchain can never silently pass the gate. Before the first commit it runs the full test suite instead of `--changed`.
9. **Test budget (maintainer request, 2026-09-30).** Test runs are targeted, and the full gates run once per change (the testing skill's "Test budget" section).
   - While iterating, run only the touched files, with no stress reruns.
   - The implementing agent runs the final gates once, stopping at the first failure. The reviewer verifies its findings with targeted runs, and the main session doesn't repeat them.
   - The Stop hook fingerprints the code (HEAD, the diff and untracked files under the code paths). It skips when the fingerprint matches the last green run, and records a fingerprint only after `vp check` and `vp test run` pass. Root `tsconfig.json` and toolchain versions aren't part of the fingerprint, so after changing them, run the gates by hand.
10. **No telemetry:** Storybook's telemetry is disabled in config, and Next.js's through `NEXT_TELEMETRY_DISABLED=1` in every script. Vite+ and Playwright send none.

## Accessibility impact

Static linting is the weakest of our accessibility checks. Runtime axe and keyboard tests are the gates that matter, so a missing lint rule is acceptable. Even so, every available jsx-a11y rule is on, and axe runs on every story in the default `vp test run`, not just in e2e.

## Consequences

- **Positive:**
  - One config surface (`vite.config.ts`), fast feedback, native Vitest browser mode and cached tasks.
  - A single `vp test run` covers unit, browser, story and axe tests.
  - Library source is used directly, so tests never run against a stale `dist`.
- **Negative:**
  - Vite+ is young, so there is a risk of CLI churn.
  - The docs app does not share the Vite pipeline.
  - `dedupePeers` and the `vite-plus` peer allowance are workarounds, to review when Storybook declares Vite+ 1.x support.
  - Local WebKit on Linux needs `sudo` to install system libraries.
- **Mitigations:**
  - Pin Vite+ in the catalog.
  - Keep command names only in `AGENTS.md` and `docs/engineering.md`, so a rename touches two files.
- **Follow-ups:**
  - ✓ Verified the `vp` command names against viteplus.dev on 2026-09-30. `vp run e2e <args>` takes no `--`.
  - ✓ Listed the jsx-a11y gaps in `docs/engineering.md`. Only rules that ESLint itself deprecated are missing.
  - Configure the `core` coverage threshold (90%) and per-component bundle budgets in CI.
  - Run CI for the first time once the repo has a GitHub remote.

## Validation

Verified on 2026-09-30:

- **Lint and type checking:** `vp check` fails on a deliberate type error, a `@tanstack/store` import outside `core/src/store/`, a React import in `core` and `window` in `core`.
- **Stories:** `vp test run` fails on a story with a nameless button (axe `button-name`).
- **Stop hook:** it blocks on a failing test.
- **Checks:** `i18n:check` and `theme:check` fail on a missing key and on a 2.85:1 pair.
