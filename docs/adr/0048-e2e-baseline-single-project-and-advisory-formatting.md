# ADR-0048: The e2e baseline is one project, and formatting never blocks

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike
- **Tags:** tooling | testing | process

## Context

ADR-0042 made the baseline four Chromium projects. Every e2e test runs in every project, so three small specs (153 tests) became 612 runs. Most of those repeat work: the axe and per-theme tests are identical under forced colours, reduced motion and 320px, and none of the tests check which project they run in. Separately, `vp check` includes a format check, so format drift fails CI and the Stop hook, and blocks real work for noise.

## Decision

- **The e2e baseline is `chromium` only.** `vp run e2e` runs one project. It covers the keyboard contract, focus and every story state with axe. AGENTS.md gate 3 means this.
- **The display-mode projects are off by default.** `chromium-forced-colors`, `chromium-reduced-motion` and `reflow-320` stay defined. `E2E_BROWSERS=sweep` turns them on, and `E2E_BROWSERS=all` turns on every project, including `firefox`, `webkit`, `mobile-safari` and `mobile-chrome`. A name still turns on one project.
- **The full sweep is a dedicated workload.** A WCAG sweep agent or the maintainer runs it (`E2E_BROWSERS=all vp run e2e`), before a release or after a change to focus, colour, motion or layout. Component work doesn't run it.
- **Formatting is advisory.** `vp check --no-fmt` (lint and types) blocks in CI and in the Stop hook. CI also runs `vp fmt --check` with `continue-on-error`, so drift shows as a warning. Format the files you commit with `vp fmt <files>` before committing. It is a courtesy, not a gate. The edit hook still formats each file an agent edits.

## Consequences

- ✅ An e2e run is a quarter of the size.
- ✅ Format drift never blocks a merge or an agent's turn.
- ⚠️ A forced-colours, reduced-motion or 320px regression isn't caught by the default run or CI. The sweep must run before a release.
- ⚠️ Unformatted code can land on `main`. The advisory CI step shows it.
- Supersedes the baseline list in ADR-0042 (four projects). Amends AGENTS.md gates 1 and 3.

## References

- ADR-0042, ADR-0043, `playwright.config.ts`, `.github/workflows/ci.yml`, `.claude/hooks/verify.sh`
