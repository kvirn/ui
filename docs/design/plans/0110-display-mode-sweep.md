# Plan 0110: Display-mode sweep in Vitest browser mode

- **Status:** Draft
- **Owner:** maintainer, main session
- **Created:** 2026-10-13 · **Target:** before `beta`
- **Related:** Plan 0051 (retired the Playwright e2e sweep; this was its last open item), `testing` skill, `docs/accessibility.md` (agent check), WCAG 1.4.10, 1.4.11, 1.4.12, 2.3.3

## Goal

Every story is checked automatically in forced colours, with reduced motion, at 320 CSS px and with WCAG 1.4.12 text spacing, so the contract claims that the e2e suite used to back ("a later sweep checks it") are proved by a test that re-runs.

## Non-goals

- Visual snapshots or computed-style assertions (hard rule 13): assert the outcome, not CSS values.
- A new test runner: Vitest browser mode only.

## Background

Plan 0051 deleted the Playwright sweep. Nothing runs these modes today (`docs/roadmap.md`, the display-mode sweep row). The Vitest browser provider is Playwright, so its context options (`forcedColors`, `reducedMotion`, `viewport`) are available without a new dependency.

## Design

- Vitest browser projects (or one project with per-mode instances) built on the existing `storybook*` projects in `vite.config.ts`, with the Playwright context options for each mode.
- Per mode, the assertion is the outcome: forced colours, every focusable part and boundary stays visible (a non-`transparent` system colour or a border); 320px, no horizontal scroll on the story root; text spacing, no clipped text (scroll size equals client size on text containers); reduced motion, no running animation longer than the reduced duration.
- Prove it on one component first (Button), then widen.
- Adding the projects is a gate change: the maintainer approves the design before the tasks start, and the `testing` skill and `AGENTS.md` (Quality gates) change in the same PR.

## Tasks

- [ ] Maintainer approves the design (a gate change)
- [ ] One mode, one component: the project config and a passing test
- [ ] All four modes on Button; record run time in CI
- [ ] Widen to every story; triage failures into per-component fixes
- [ ] `testing` skill, `AGENTS.md` Quality gates, contracts' "a later sweep checks it" lines updated
- [ ] Gates green; `accessibility-reviewer` on the diff
