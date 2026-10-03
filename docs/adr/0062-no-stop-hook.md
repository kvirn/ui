# ADR-0062: No Stop hook; the orchestrator runs the gates

- **Status:** Proposed
- **Date:** 2026-10-04
- **Deciders:** Maintainer
- **Tags:** tooling

Amends ADR-0051 (the Stop hook part).

## Context

ADR-0051 made a Stop hook (`.claude/hooks/verify.sh`) run `vp check --no-fmt` and `vp test run --changed` every time an agent ended a turn, and block the turn while they failed.

In Plan 0026 this broke down:

- A change to shared files (the React index, `theme.css`, the i18n catalogs) makes `--changed` select nearly the whole suite, including the four Storybook projects.
- Running those four Chrome projects in parallel fails a few suites with "Failed to fetch dynamically imported module" on every run, on a clean `main` too. It's a Vitest issue, not a test failure.
- So the hook was never green, never skipped, and ran about 40 seconds of tests after every reply, blocking each one, while subagents were still editing.

## Decision

Remove the Stop hook and `verify.sh`, and the edit tracking in `format.sh` that fed it. The orchestrator runs the gates once, scoped to the changed files, at the end of a change (AGENTS.md, Quality gates), as it already did. CI stays the whole-tree gate. The PreToolUse guards and the formatter are unchanged.

## Consequences

- ✅ No test run on every reply, and no blocked turns while subagents work.
- ⚠️ Nothing forces the gates locally before an agent says it's done. The quality-gate list in AGENTS.md and CI carry that.
- Follow-up: run the Storybook projects one at a time when a whole-tree local run is wanted, and leave the parallel import flake to Vitest.

## References

- ADR-0048, ADR-0051, ADR-0058; Plan 0026
