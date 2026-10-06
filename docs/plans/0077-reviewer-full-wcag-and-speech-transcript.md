# 0077 — Reviewer: every WCAG 2.2 A/AA criterion and a screen-reader transcript

Status: Implemented. accessibility-reviewer APPROVE (round 3, 2026-10-06). AT matrix pending; `vp pack` verified for both entries.

## Goal

`accessibility-reviewer` accounts for every WCAG 2.2 Level A and AA success criterion (55, since 4.1.1 is obsolete) on each diff, and can read an approximation of what a screen reader would announce, without claiming NVDA or JAWS behaviour.

## Facts (scout)

- Reviewer: `.claude/agents/accessibility-reviewer.md:20-31` checks 10 items; item 6 names 11 SC. It is read-only and may not run commands (rule 12).
- `.claude/skills/accessibility/references/wcag-22-checklist.md` lists about 36 SC, merged in pairs. Missing: 1.2.5, 2.4.1, 2.5.4, 2.5.6, 3.1.1, 3.2.3, 3.2.4, 3.3.4, 3.3.5, and every Level A time-based media SC (1.2.x), 1.4.2, 1.4.4 as its own row, 2.3.1, 2.4.2, 2.4.4, 2.5.x, 3.2.x, 4.1.x as separate rows.
- No speech helper exists. `dom-accessibility-api@0.5.16` and `aria-query@5.3.0` are transitive only. `packages/testing` depends on `axe-core` alone.

## Design

### Part A — full SC coverage (no dependency)

1. The checklist lists all 55 SC, one row each, grouped by principle, with level (A/AA), the KvirnUI-specific thing to look for, and the layer that proves it (`axe`, `test`, `story`, `theme:check`, `manual AT`).
2. Every row is answered `Pass | Fail | N/A + reason`. A bare "N/A" is not accepted. A row proved only by `manual AT` stays `pending` (AGENTS.md, gate 6); `manual review` rows (content or wording) are Pass or Fail from the reviewer's reading; `consumer` rows say what the adopter owns.
3. The reviewer's output gains a `WCAG 2.2 A/AA` section: one line per SC, 55 lines, so none is skipped.

### Part B — screen-reader transcript (needs a decision)

Real NVDA and JAWS cannot be emulated: they differ per browser, version and verbosity setting. What can be produced is an approximate announcement transcript (role, accessible name, state, description, live-region text) for each contract row. It is labelled "approximation" everywhere and never counts as the AT matrix.

Options:

- B1 `@guidepup/virtual-screen-reader` as a pinned dev dependency of `packages/testing`: walks the DOM like a screen reader and logs spoken phrases and live-region output. Most complete; new dev dependency.
- B2 `dom-accessibility-api` pinned as a dev dependency, plus a small in-house `speak(element)` that renders `role, name, state, description`. Smaller and ours to maintain, no traversal or live regions.
- B3 no dependency: the reviewer derives announcements by reading.

Either B1 or B2 adds `packages/testing` helper `readAloud(element)`, tests asserting expected phrases per announcement row of each `<name>.a11y.md`, and a reviewer step that reads the transcript from the gate output.

## Tasks

- [x] A1 Rewrite `wcag-22-checklist.md` with all 55 SC (component-engineer)
- [x] A2 Update `accessibility-reviewer.md` check 6, the output format and a pointer to the checklist (component-engineer)
- [x] A3 `accessibility` skill: say the checklist is exhaustive and how `manual AT` rows are marked (component-engineer)
- [x] B0 Research done; maintainer approved a spike of `@guidepup/virtual-screen-reader` (MIT, 0.33.0) as a pinned dev dep
- [x] B2 Spike: GO. Bare import runs in Chromium browser mode, no config change. Role, name, state, level, description and live region (`polite: Saved`) spoken. Modality not enforced, so the transcript can't prove containment. MIT, no install scripts, 4 runtime deps.
- [x] B3 `readAloud` helper, tests, `docs/accessibility.md` and `testing` skill updated, changeset if `packages/testing` is public
- [x] B4 Reviewer reads transcripts; `a11y.md` template gets an "Announcements" column

## Draft contract

Not a component. Acceptance: a reviewer run on a sample diff prints 55 SC lines; `readAloud` on a `<button aria-expanded="false">` reads "button, <name>, not expanded" in a named test (a real Disclosure and the provider Announcer are covered when a component adopts the helper).

## Decisions

- Part A needs no dependency and proceeds now.
- Part B is a new dev dependency and an optional peer (a runtime dependency under rule 6), so the maintainer decides (rule 6). Maintainer chose the virtual screen reader direction but asked for research first: Vitest browser-mode compatibility foremost, standalone tools considered, free/open-source (MIT preferred) only. No dependency is added until the research is reported and confirmed.
- Part A: 55 SC verified (31 A, 24 AA); "proved by" tags are the engineer's judgement per row (consumer: media, page title, 2.4.5, 3.1.1, 3.2.3, 3.2.6, 3.3.4; manual AT: 1.3.3, 2.4.6, 3.2.4).
- Research (rejected or kept as a layer): `@guidepup/guidepup` and `@guidepup/playwright` drive real NVDA or VoiceOver but need Windows or macOS runners and a Playwright test runner (no e2e layer here), so they stay out. `dom-accessibility-api` alone gives no transcript. The installed `@vitest/browser` already ships `toMatchAriaSnapshot` (role, name, state), the zero-dependency fallback and the cheap per-component layer. Orca (Linux) and NVDA (Windows VM) stay manual and `pending`.
- Spike go/no-go: `@guidepup/virtual-screen-reader` must run in Chromium browser mode, log a live-region change and a modal dialog. If not, remove it and use the fallback.
- Packaging (maintainer): `readAloud` and `readAnnouncements` ship as the sub-entry `@kvirn-ui/testing/read-aloud`; `@guidepup/virtual-screen-reader` is an optional peer (externalised) and a pinned dev dependency, so the main entry stays 2.5 kB instead of 814 kB. Bundling would ship third-party code to every consumer. The engineer edited `packages/testing/vite.config.ts` (entry list, neverBundle) for the second entry.
- Superseded: `vp pack` was blocked by the root tsconfig pulling in unrelated files (see the build fix below).
- Review 1 (CHANGES REQUIRED): `readAloud` detected the wrap by phrase text and deduped repeats, so identical adjacent controls were lost; fixed by node-based wrap detection, no dedupe, and a throw on `maxSteps` overrun. Peer range is `~0.33.0` (catalog: would publish an exact pin). Scope widened to `docs/architecture.md`, `docs/engineering.md` and the `regulations` skill, because a peer is a rule 6 dependency. `AGENTS.md` rule 6 gained one clause with the maintainer's approval (see Review 2).
- Checklist: 1.3.3, 2.4.6, 3.2.4 are `manual review` (closed by the reviewer's reading, not the AT matrix); 2.4.1 is `consumer`; 2.2.2 names the essential exception for progress and loading. A row proved only by `manual AT` is `pending`.
- Not done, follow-up: a `readAnnouncements` test against the provider Announcer (clear then set) needs the react package, so it lands with the first component that uses the helper.
- Review 2: `readAloud` wrap check also compares the phrase (a container's end entry shares the DOM node of its start entry), with a nav-then-button test. AGENTS.md rule 6 now lists the optional peer: the maintainer approved the line on 2026-10-06 and chose "add to rule 6" over an exemption. Round 3: APPROVE.
- Dry run (2026-10-06, scratch tests, since deleted) on Field, Disclosure and Announcer/Toast: no component defect; transcripts matched the contracts (Field: `textbox, Telefonnummer (optional), <description> Error: …, invalid`; Disclosure: panel read only when expanded; toast: one `polite: Success: <title> <body>`). It found three real `readAnnouncements` bugs, now fixed and re-checked on the real Announcer: the empty clear phrase counted as the announcement, a second announcement lost (new `settle` option, default 100 ms), and leakage between calls (limit documented: wait for earlier changes before the next call). Library quirk: clear-then-set on a region already holding the same text in one tick logs the phrase twice.
- Dry-run friction: browser-mode Vitest swallows `console.info`, so transcripts are best asserted, not printed; `@kvirn-ui/testing/read-aloud` can't resolve until `vp pack` emits `.mjs` (blocked by unrelated TS errors); `readAloud` transcripts always end with the provider's empty `status` and `alert` regions, so tests should scope the container.
- Reviewer dry run on `field` (whole component, no diff): CHANGES REQUIRED for one item, 3.1.2 (se locale strings are English placeholders, `se.ts:17`), a Known issue in `field.a11y.md:137` with no recorded waiver. The full 55-row sweep is what found it. Process notes applied to the reviewer definition: whole-component mode, a `pending` status for a missing proving layer, `Pass (needs <gate>)`, wrapper parts cite the owning contract, waivers count only with a recorded path, a missing Read aloud table blocks only new or changed announcements, N/A ranges.
- Field follow-ups from the dry run (not part of this change, no edits made): add a Read aloud table and `readAloud` tests; assert Prose and ErrorMessage non-focusable (`field.a11y.md:51`); assert where Shift+Tab lands (`field.test.tsx:574`); fix the contract's test reference (`messages` vs `messages resolution`); decide whether the error prefix is "hidden" or visible (stories vs contract); fix the Keyboard story JSDoc; add nb, nn, se to the message-key table; 1.4.12 has no evidence (Plan 0051).
- Open for the maintainer: the se placeholders are a project-wide 3.1.2 Fail on every component with a string. A standing decision, recorded in a plan or the regulations skill, would settle it.
- Build fix (maintainer approved, 2026-10-06): the engineer's `vp pack` wiped the gitignored `packages/testing/dist` and left only CJS, which broke `@kvirn-ui/testing` types in `apps/docs` and Storybook (TS2307). Cause: `packages/testing` had no `tsconfig.json`, so the dts step used the root one, which includes `apps/storybook/src`, where `tag.stories.tsx` (committed) has TS2883. Fix: `packages/testing/tsconfig.json` (src only, tests excluded). `vp pack` now emits `.mjs`, `.cjs`, `.d.mts` and `.d.cts` for both entries; the main entry has no guidepup code. Other packages have the same fragility; not changed here.
