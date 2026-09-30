# Engineering

## Toolchain

| Concern           | Tool                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Package manager   | pnpm workspaces + catalogs                                                                                                     |
| Unified CLI       | Vite+ 1.0 (`vp`): `check`, `lint` (Oxlint + jsx-a11y), `fmt` (Oxfmt), `test` (Vitest 5), `pack` (tsdown), `run` (cached tasks) |
| E2E / a11y engine | Playwright, axe-core                                                                                                           |
| Workbench / docs  | Storybook 10 (Vite builder, `addon-vitest`), Next.js                                                                           |
| Versioning        | Changesets                                                                                                                     |
| CI                | GitHub Actions (EU-hosted runners preferred)                                                                                   |

Config lives in the root `vite.config.ts` (fmt, lint, test projects). Each package's `vite.config.ts` only adds `pack`, from `tooling/vite-preset/pack.ts`. `pnpm-workspace.yaml` catalogs pin every version, in strict mode. Details and reasons: ADR-0009.

- **Type checking** runs inside `vp check` (tsgolint, TypeScript 7), not as a separate `tsc` step.
- **Tests import from `vite-plus/test`**, and browser APIs from `vite-plus/test/browser`, never from `vitest` directly.
- **`vp run e2e <args>`** passes arguments straight to Playwright. Don't put `--` before them, or Playwright ignores the filters.
- **Telemetry is off:** Storybook (`core.disableTelemetry`) and Next.js (`NEXT_TELEMETRY_DISABLED=1`). Vite+ and Playwright send none.
- **Local WebKit on Linux** needs system libraries (`sudo pnpm exec playwright install-deps webkit`). CI installs them.

**Known Oxlint jsx-a11y gaps** (vs eslint-plugin-jsx-a11y 6.x, accepted in ADR-0002, verified 2026-09-30 against Oxlint 1.85): only the rules ESLint itself deprecated, which are `accessible-emoji`, `label-has-for` and `no-onchange`. `iframe-missing-sandbox` lives in Oxlint's `react` plugin. All the other 36 rules are enabled as errors.

Command names were verified against [viteplus.dev](https://viteplus.dev/guide/) on 2026-09-30 (Vite+ 1.0.0).

## Test layers

| Layer     | File                               | Runner                                                | Proves                                   |
| --------- | ---------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| Machine   | `core/src/<name>/<name>.test.ts`   | Vitest (node)                                         | State logic                              |
| Component | `react/src/<name>/<name>.test.tsx` | Vitest browser mode                                   | Rendering, ARIA, axe                     |
| Stories   | `<name>.stories.tsx`               | `vp test run` (Storybook `addon-vitest` + a11y addon) | Every visual state, axe fails the test   |
| E2E       | `<name>.e2e.ts`                    | Playwright                                            | Keyboard contract, focus, modes          |
| Manual AT | `<name>.a11y.md`                   | Humans                                                | See [accessibility.md](accessibility.md) |

Playwright projects: `chromium`, `firefox`, `webkit`, `chromium-forced-colors`, `chromium-reduced-motion`, `mobile-safari`, `mobile-chrome`, `reflow-320`.

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
