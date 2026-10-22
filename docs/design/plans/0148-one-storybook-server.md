# Plan 0148: Storybook tests in serial batches, and an every-theme axe helper

- **Status:** In progress
- **Owner:** lead → component-engineer
- **Created:** 2026-10-22 · **Target:** before alpha
- **Related:** plan 0141 (sweeps in CI), `testing` skill, `docs/engineering.md`

## Goal

`vp run test` stops failing at random with "Failed to fetch dynamically imported module", and it starts
one Storybook test server instead of four. Every story is still checked by axe in all four themes.

## Non-goals

- The four display-mode sweep projects (forced colours, reduced motion, reflow, text spacing): unchanged.
- Fewer axe tags, fewer stories or a lower bar in any theme (hard rule 1).
- Raising `maxWorkers`: a separate, measured change once this lands.

## Background

- `package.json:12` runs five `vp test run` processes: node + browser, then `storybook`, `storybook-dark`,
  `storybook-light-contrast`, `storybook-dark-contrast` (`vite.config.ts:372-375`). Each starts its own Vite
  server and Chromium, and keeps its own pre-bundle cache (`node_modules/.cache/storybook/*/sb-vitest/vitest/<hash>`,
  four hashes for the four themes), so the same dependencies are bundled four times.
- They run one per process because "several `storybookTest()` servers in one process make story files fail
  to load at random" (`vite.config.ts:206-210`).
- "Failed to fetch dynamically imported module": **cause unknown.** Measured 2026-10-22 on `--project storybook`
  (160 files, 1466+ tests, every test that loads passes): cold cache 9 files fail; cold with `optimizeDeps.entries`
  11; warm (optimizer skipped, "Hash is consistent") 14; warm with `VITEST_MAX_WORKERS=1` 6. Different files each
  run, once the addon's own setup file. A middleware logging every response >= 400, every dropped connection,
  every HMR and watch event logged nothing. So it is not mid-run re-bundling and not page concurrency.
  Chromium's net log of a failing run (16 files): every module request got 200 or 304, no module request
  failed at the network level (only web fonts: ERR_FAILED); no ERR_NETWORK_CHANGED, so not vitest#11636;
  the refused connections are Chromium trying `[::1]` first while the server listens on 127.0.0.1 only.
  So Chromium rejects the import with no failed request behind it (a detached or reloaded tester iframe fits).
  Upstream: vitest#11171 is the same signature (warm cache, load-dependent), closed without a fix we can
  find. Not ours: vitest#11381 (only with `fsModuleCache`). Candidate: the 2026-10-19 bump `5c48360c`
  (Vitest 5.0.1 → 5.0.5: 5.0.4 "Run browser instances as workers" #11525, "One cdp session per tester" #11542).
- The theme reaches a story through the theme store: `preview.tsx:179-187` (initial globals from
  `VITE_STORYBOOK_MODE` / `_CONTRAST`), `preview.tsx:98-109` (layout effect selects it), and the store writes
  `data-kv-color-scheme` / `data-kv-contrast` on `<html>` (`core/src/theme/theme-store.ts:402-404`).
  JS consumers re-render through the store (`react/src/provider/use-theme.ts:80`): `use-display-settings.ts:51`,
  `map/src/use-map-camera.ts:89-91`.
- axe runs in `@storybook/addon-a11y` with `test: 'error'` and the five WCAG tags (`preview.tsx:213-217`,
  `testing/src/wcag-tags.ts:2`). The repo's own helper is `testing/src/expect-no-a11y-violations.ts:18-22`.

## Design

1. **Pre-bundle at startup.** The browser and Storybook projects set `optimizeDeps.entries` to the files
   they load (tests; stories and `.storybook/preview.tsx`), so Vite's scanner finds every dependency
   before the first page opens and from the file that imports it. `include` can't be used: under pnpm none
   of these packages resolves from the repo root.
2. **One Storybook project, four themes per story.** The story renders once in light/standard (addon-a11y
   checks it, as today). The preview's `afterEach` then selects dark/standard, light/more and dark/more through
   the theme store, waits for React to commit, and runs the repo's axe helper with the same tags in each.
   A violation names the theme. Stories with `parameters.themeStore === 'story'` own their theme and run once.
3. **Scripts.** `test` becomes `vp test run --project node --project browser && vp test run --project storybook`.
   If Task 1 holds, a later change may merge them into one process.

### Requirements (the contract for this change)

| #   | Requirement                                                                            | Proved by                                                                              |
| --- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| R1  | A violation that exists only in dark, or only in more contrast, fails the story run    | `packages/testing` browser test of the every-theme helper                              |
| R2  | The message names the theme it failed in                                               | same test                                                                              |
| R3  | After the loop the theme is back to the story's start, so the next story is unaffected | same test                                                                              |
| R4  | A JS theme consumer (`useTheme`) has re-rendered before axe runs                       | same test, with a component that renders from `useTheme()`                             |
| R5  | No story file fails to load, warm or cold                                              | `vp test run --project storybook` log: 0 "Failed to fetch dynamically imported module" |

## Tasks

- [x] T0 lead: reproduce. Reproduced; re-bundling refuted (Background)
- [ ] ~~T1 lead: `optimizeDeps.entries`~~ tried, no effect, reverted. Replaced by T1b
- [x] T1b lead: cause: Chromium shared-memory files pile up in the 16 GB /tmp tmpfs (Playwright `--disable-dev-shm-usage`, chromium 530892387); Vitest's GC only triggers below 4 GB free. Vitest 5.0.1 fails too (bisected). Tried `VITEST_CHROMIUM_GC_DISK_THRESHOLD_GB=1000`: maintainer's `pnpm run test` still failed 3 files and lost the browser connection; reverted. Root-cause work stopped at the maintainer's request (2026-10-22)
- [x] T1c component-engineer: `tooling/storybook-run/` runs each Storybook project and re-runs, once, only files that failed to load (or never ran); a real failure is never retried. `package.json` `test` uses it; testing skill updated
- [x] T2 component-engineer: `expectNoA11yViolationsInEveryTheme` (or a name that fits) in `packages/testing`, browser test R1–R4
- [ ] T3 component-engineer: call it from `apps/storybook/.storybook/preview.tsx` `afterEach`; drop the three theme projects from `vite.config.ts` and `package.json:12`
- [ ] T4 component-engineer: docs in the same change: `AGENTS.md:33,60`, `.claude/skills/testing/SKILL.md:48,52,78`, `docs/engineering.md:62`, `.claude/agents/test-runner.md:24`, `.claude/agents/component-engineer.md:24`, `vite.config.ts:206-210` comment
- [ ] T5 lead: gates (`vp check` on changed files → `vp run test` → i18n → theme), timings before/after
- [ ] T6 accessibility-reviewer: the gate still proves every story in every theme

## Decisions

- Load failures are re-run one file per process by default (`KVIRN_STORYBOOK_RERUN_BATCH`, maintainer 2026-10-22).
- **Gate change approved by the maintainer** (2026-10-22): re-run a story file once only when it failed to load; never a test or axe failure.
- **Gate change approved by the maintainer** (2026-10-22, in session): one Storybook server with a theme loop
  in place of four theme projects; mid-run re-bundling fixed by pre-scanning entries.
- ~~`optimizeDeps.entries`~~: tried, no effect (warm runs fail with the optimizer skipped), reverted.
- T2: `expectNoA11yViolationsInEveryTheme(element, { themeStore, themes? })` in `@kvirn-ui/testing`; the caller passes
  the store (testing doesn't depend on core); it connects the store for the call and restores the preference and the
  `<html>` attributes in `finally`. Its test is `packages/react/src/provider/a11y-in-every-theme.test.tsx`, because
  testing has no React in its deps.
- T1c: a project runs in `KVIRN_STORYBOOK_SHARDS` (default 8) `--shard=i/N` processes with `VITEST_MAX_WORKERS=1`, one JSON report per shard (`--outputFile.json=`). `vp test list` ignores `--shard`, so the full file list is read once and files absent from the union of the shard reports count as unloaded. The first real failure stops the run (exit 1). Unloaded files are re-run once at the end of the project, at most 20 per process; a second failure fails. CI's display-mode sweep step calls the same CLI. `tooling/storybook-run` is in the root `tsconfig.json` include so `vp check` can type it.
- R5 now reads: no story file fails to load on a warm or cold run.
- The first theme stays with addon-a11y; the loop adds the other three, so the Storybook UI's a11y panel is unchanged.

## Risks & open questions

- A theme switch that needs more than one commit (the map restyles its engine): the helper waits for the
  store and two animation frames; the map's canvas is decorative, so axe doesn't depend on its pixels.
- Run time: one render and four axe runs per story should beat four renders, but measure (T5).
- If T0 shows no re-bundling, Background is wrong: find the real cause before T1.

## Testing strategy

R1–R4 in `packages/testing` (browser project). R5 is a log check, recorded here with the run date.
