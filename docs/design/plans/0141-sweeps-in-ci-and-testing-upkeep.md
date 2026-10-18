# Plan 0141: Display-mode sweeps in CI, and Testing upkeep in the docs workflow

- **Status:** Approved
- **Owner:** lead → component-engineer ×2
- **Created:** 2026-10-18 · **Target:** pre-alpha
- **Related:** Plans 0139, 0140; `vite.config.ts` (sweeps), `.github/workflows/ci.yml`, `.claude/agents/docs-writer.md`

## Goal

The Display modes row can be `pass` for many components and means something: the four sweeps (forced colours, reduced motion, 320px reflow, text spacing) run in CI, so the Automated tier can complete and the page word moves. The docs agent keeps each page's Testing record true as part of its normal workflow.

## Non-goals

- No claim of a human check by an agent; Core and Release rows move only when the maintainer supplies a recorded result.
- No loosened thresholds, `.skip` or excluded stories to make a sweep pass (AGENTS.md rule 1): a failing component stays `pending` and is reported.

## Design

### Part 1: sweeps in CI (gate change, approved by the user 2026-10-18)

1. Experiment: widen `sweepExclude` in `vite.config.ts` from Button and SkipPanel to every component story (still not patterns, foundation, content-types), run the four `storybook-*` sweep projects, and list per component what fails and why (real defect, story issue, or a sweep assumption that does not fit a component).
2. Components that pass join the sweep list (an explicit allow list of component directories, so a failing one is visible and not silently excluded). Failing components stay out, each recorded in the plan with the defect.
3. CI runs the four projects as steps in `.github/workflows/ci.yml` after `vp run test`, or inside the root `test` script if that is the repo's pattern. They are in CI, so `AGENTS.md` Quality gates, `docs/accessibility.md`, the `testing` skill, the vite config comment and the contract Notes that say "not in CI" are corrected.
4. Contracts: Display modes becomes `pass` (Notes: the sweep names) only for components the sweep covers and that pass; the rest stay `pending` (or `n/a` where nothing is drawn).

### Part 2: Testing upkeep in the docs workflow

`docs-writer` gets a step per page audit:

1. Re-derive the Automated rows from evidence by the rules in `docs/accessibility.md` (story file for axe, a test with axe and role/state assertions for Markup, named keyboard tests for Keyboard, `toHaveFocus` tests for Focus, a sweep that includes the component for Display modes). Never `pass` without a named test or story that exists.
2. For each interactive component, write a short "what to check" list under the record (`### What to check`, 3–6 plain checks drawn from its Keyboard table and Announcements) so a person can run the Core rows. It is a script, not a result.
3. Record a Core or Release result only from a result the maintainer gives (tester, date, versions, outcome). Agents never write or claim a human check.

## Tasks

- [ ] A. Experiment, allow list, CI wiring and "not in CI" corrections (Part 1). Owner: component-engineer
- [x] B. `docs-writer` and `docs-pages` workflow step (Part 2). Owner: component-engineer
- [ ] C. Contracts: Display modes rows per the sweep result. Owner: component-engineer, after A
- [ ] D. Gates (including the four sweep projects, now in CI), reviewer once

## Decisions

- Sweeps go into CI (user, 2026-10-18). Gate change: `AGENTS.md`, `docs/accessibility.md` and the `testing` skill change in the same change.
- Failing components are listed, not excluded silently or fixed in this plan.

## Risks & open questions

- CI time: four extra Storybook runs. The Button and SkipPanel runs took about 4 s each, so measure after widening.
- Some sweep assumptions (reduced motion, text spacing) may not fit every component; each failure is the user's call: fix the component, fix the story, or keep the row `pending`.

## Done when

- [ ] CI runs the sweeps green; docs no longer say "not in CI"
- [ ] Display modes rows match the allow list
- [ ] docs-writer workflow has the Testing upkeep step
