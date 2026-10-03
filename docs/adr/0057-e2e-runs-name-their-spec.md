# ADR-0057: An e2e run must name its spec

- **Status:** Accepted
- **Date:** 2026-10-03
- **Deciders:** Magnus Vike
- **Tags:** tooling | testing | process

## Context

ADR-0043 says to test only what you changed, and ADR-0048 made the full sweep a dedicated workload. Nothing enforced it: a path-less `vp run e2e` still ran every spec in the main session, which takes a lot of CPU, memory and time.

## Decision

- **A PreToolUse hook blocks an e2e run with no spec.** `.claude/hooks/guard-e2e-scope.sh` blocks `vp run e2e`, `pnpm e2e` and `playwright test` (also via `pnpm exec`, `pnpm` and `npx`) unless a spec path or filter is given. A filter that still matches every spec (`.`, `e2e`, `apps/storybook/src/components`) is blocked too. Flags such as `--project`, `--grep` and `E2E_BROWSERS=` don't count as a spec. It applies to the main session and to subagents.
- **Run one spec on one project:** `vp run e2e apps/storybook/src/components/<name>/<name>.e2e.ts --project chromium`, and only if story, fixture or keyboard behaviour changed.
- **The full run belongs to CI and the WCAG sweep specialist.** CI runs `vp run e2e` over the whole suite, and the maintainer or sweep agent runs `E2E_BROWSERS=sweep|all` before a release, from their own terminal. The hook only guards Claude's Bash tool.

## Consequences

- ✅ Agents can't start a whole-suite run by accident.
- ⚠️ The sweep specialist can't run the whole suite through Claude's Bash tool. They run it from a terminal, or in CI.
- ⚠️ The hook parses the command text, so a wrapper script that runs Playwright isn't caught.
- Amends AGENTS.md gate 3 and ADR-0048's "full sweep" bullet.

## References

- ADR-0042, ADR-0043, ADR-0048, `.claude/hooks/guard-e2e-scope.sh`, `.github/workflows/ci.yml`
