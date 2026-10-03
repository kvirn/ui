# ADR-0058: Test runs cap their workers

- **Status:** Accepted
- **Date:** 2026-10-03
- **Deciders:** Magnus Vike (the test runs made the machine unusable)
- **Tags:** tooling

## Context

Vitest starts a worker per core in each project, and Playwright half the cores. On a 28-thread machine that is dozens of Chrome pages at once: six Vitest projects (four with Chrome) and 14 e2e pages against one Storybook dev server. The machine became unusable, and the timing-based tests (announcement throttles, 15s timeouts, a click on a button) failed under the load and passed alone.

## Decision

1. **Vitest: `maxWorkers` is 2 per project**, set in each project because a project doesn't inherit the root option. `VITEST_MAX_WORKERS` overrides it for a one-off.
2. **Playwright: `workers` is 3.** `E2E_WORKERS` overrides it for a one-off.
3. The caps are in config, so the Stop hook and every agent get them. They are a floor for politeness, not a gate: no test, threshold or timeout changes.

## Consequences

- Positive: a full run no longer takes the machine. Measured on a six-folder browser run: 3 Chrome renderers instead of 9, in the same time.
- Positive: fewer load-induced flakes.
- Negative: a full run takes longer. Up to about 12 Vitest workers can still run at once, because the cap is per project.

## Validation

Peak Chrome renderer count under one run, with and without `VITEST_MAX_WORKERS`. `Running N tests using 3 workers` in the Playwright output.

## References

- ADR-0043, ADR-0048, ADR-0051, ADR-0057
