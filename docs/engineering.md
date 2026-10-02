# Engineering

## Toolchain

| Concern           | Tool                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Package manager   | pnpm workspaces + catalogs                                                                                                     |
| Unified CLI       | Vite+ 1.0 (`vp`): `check`, `lint` (Oxlint + jsx-a11y), `fmt` (Oxfmt), `test` (Vitest 5), `pack` (tsdown), `run` (cached tasks) |
| E2E / a11y engine | Playwright, axe-core                                                                                                           |
| Workbench / docs  | Storybook 10 (Vite builder, `addon-vitest`), Next.js                                                                           |
| Commit messages   | Conventional Commits 1.0.0, checked by a Vite+ `commit-msg` hook (`.vite-hooks/`) and in CI (ADR-0012)                         |
| Versioning        | Changesets                                                                                                                     |
| CI                | GitHub Actions (EU-hosted runners preferred)                                                                                   |

Config lives in the root `vite.config.ts` (fmt, lint, test projects). Each package's `vite.config.ts` only adds `pack`, from `tooling/vite-preset/pack.ts`. `pnpm-workspace.yaml` catalogs pin every version, in strict mode. Details and reasons: ADR-0002.

- **Type checking** runs inside `vp check` (tsgolint, TypeScript 7), not as a separate `tsc` step.
- **Tests import from `vite-plus/test`**, and browser APIs from `vite-plus/test/browser`, never from `vitest` directly.
- **`vp run e2e <args>`** passes arguments straight to Playwright. Don't put `--` before them, or Playwright ignores the filters.
- **Telemetry is off:** Storybook (`core.disableTelemetry`) and Next.js (`NEXT_TELEMETRY_DISABLED=1`). Vite+ and Playwright send none.
- **Playwright runs Chromium only by default** (ADR-0042). Other browsers are opt-in with `E2E_BROWSERS`, such as `E2E_BROWSERS=firefox,webkit vp run e2e <spec> --project webkit`, or `E2E_BROWSERS=all`. WebKit on Linux also needs system libraries (`sudo pnpm exec playwright install-deps webkit`).
- **Check only your own changes** (ADR-0043). The Stop hook does: it checks the files that differ from a snapshot taken at session start (`.claude/hooks/session-start.sh`). By hand, pass paths to `vp check`, `vp test run` and `vp run e2e`, and never run `vp check --fix` or a path-less `vp fmt` while others may be editing.

**Known Oxlint jsx-a11y gaps** (vs eslint-plugin-jsx-a11y 6.x, accepted in ADR-0002, verified 2026-09-30 against Oxlint 1.85): only the rules ESLint itself deprecated, which are `accessible-emoji`, `label-has-for` and `no-onchange`. `iframe-missing-sandbox` lives in Oxlint's `react` plugin. All the other 36 rules are enabled as errors.

Command names were verified against [viteplus.dev](https://viteplus.dev/guide/) on 2026-09-30 (Vite+ 1.0.0).

## Test layers

| Layer     | File                                                      | Runner                                                | Proves                                   |
| --------- | --------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| Machine   | `packages/core/src/<name>/<name>.test.ts`                 | Vitest (node)                                         | State logic                              |
| Component | `packages/react/src/<name>/<name>.test.tsx`               | Vitest browser mode                                   | Rendering, ARIA, axe                     |
| Stories   | `apps/storybook/src/components/<name>/<name>.stories.tsx` | `vp test run` (Storybook `addon-vitest` + a11y addon) | Every visual state, axe fails the test   |
| E2E       | `apps/storybook/src/components/<name>/<name>.e2e.ts`      | Playwright                                            | Keyboard contract, focus, modes          |
| Manual AT | `packages/react/src/<name>/<name>.a11y.md`                | Humans                                                | See [accessibility.md](accessibility.md) |

Stories and e2e specs live in the Storybook app, so the packages ship no Storybook files and need no Storybook dependencies. The package keeps its unit and browser tests (with axe), its contract and its docs page.

Playwright projects: the baseline is `chromium`, `chromium-forced-colors`, `chromium-reduced-motion` and `reflow-320`. `firefox`, `webkit`, `mobile-safari` and `mobile-chrome` are defined and off until `E2E_BROWSERS` names them (ADR-0042).

## CI

CI runs the [AGENTS.md quality gates](../AGENTS.md#quality-gates), plus:

- `core` coverage of at least 90%
- per-component bundle budgets
- a Storybook build and test run

## Release

1. PRs carry changesets.
2. The release PR runs full CI, and a manual AT check for changed components.
3. Publishing includes npm provenance, a CycloneDX SBOM, a conformance JSON and the changelog.
4. The docs site deploys to kvirn-ui.com on an EU host.
