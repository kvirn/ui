# Plan 0159: simpler gates — five scripts, one story theme, each fact tested once

- **Status:** In progress
- **Owner:** lead / component-engineer
- **Created:** 2026-11-26 · **Target:** now (pre-alpha)
- **Related:** AGENTS.md (Commands, Tests, Quality gates), CLAUDE.md (gates), `testing` skill, `docs/engineering.md`, `.github/workflows/ci.yml`, `vite.config.ts:198-233,339-398`

## Goal

A developer runs `pnpm run lint | format | check | test` day to day and `pnpm run ci` for everything, and each run costs what it proves: no fact is tested twice, and CI is green and acted on.

## Non-goals

- No change to what a contract row, keyboard row or WCAG criterion requires, only to where and how often it's proved.
- No new dependency, no new test layer.

## Background (2026-11-26)

- Stories run as axe tests in 4 Vitest projects, one per theme (`vite.config.ts:383-386`), about 1,600 exports × 4. The only theme-dependent axe rule is colour contrast, which `theme:check` proves over the token pairs, and `raw-colours` lints out every colour that isn't a token.
- 84 component test files (81 in react, 3 in rich-text) call `expectNoA11yViolations`, repeating the story axe runs.
- Story `play` functions repeat keyboard tests already in `<name>.test.tsx` (button, tabs, combobox checked).
- CI (`ci.yml`) runs on `main` and PRs only, as one job, and its last 8 runs on `main` failed (since 2026-10-19).

## Design

### Scripts (root `package.json`)

| Script   | Runs                                                                                                 | When                      |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------------------- |
| `lint`   | `vp lint`                                                                                            | day to day                |
| `format` | `vp fmt` (writes)                                                                                    | day to day                |
| `check`  | `vp check --no-fmt --no-lint` (types only)                                                           | day to day                |
| `test`   | Vitest `node` + `browser` + `storybook` (one theme: light, standard)                                 | day to day                |
| `ci`     | `vp fmt --check` → `lint` → `build` → `check` → `test` → `i18n:check` → `theme:check` → the 4 sweeps | CI, before a release      |
| `smoke`  | `vp test run --project smoke` (geo.kvirn.com)                                                        | nightly CI job, on demand |

`i18n:check`, `theme:check`, `build` stay. `ci` stops at the first failure.

### Vitest projects

- Keep `node`, `browser`, `storybook` (light, standard), `smoke`, and the 4 sweeps.
- Remove `storybook-dark`, `storybook-light-contrast`, `storybook-dark-contrast`. The themes stay in Storybook's toolbar for people.

### CI (`ci.yml`)

- Triggers: PRs, push to `main` and `development`; a nightly `schedule` job runs `pnpm run smoke` only.
- The gates job runs `pnpm run ci` (after `vp install` and the Playwright install). The commit-message job is unchanged.

### Where each fact is proved (testing skill)

- Axe: in stories only, once per story state, in one theme. A state that only a test reaches gets a story, not an axe call in the test.
- Keyboard rows: in `<name>.test.tsx` only. A `play` proves only what no test does (composition in a real story, a fixture's wiring). A play that repeats a test is removed; a contract row that named the play names the test.
- Contrast: `theme:check`, over every theme.

## Tasks

- [x] 1. Scripts, `vite.config.ts` projects, `ci.yml`, `tooling/storybook-run` (+ test), `tooling/ci` (+ test) if they name the removed projects, `apps/storybook/.storybook/preview.tsx` comments (:178-179) (component-engineer A)
- [x] 2. Remove `expectNoA11yViolations` from component tests where a story covers the state; add a story where none does (component-engineer B: react `accordion`–`listbox`; C: react `mask`–`visually-hidden` + rich-text)
- [x] 3. Play audit over every story file: remove plays that repeat a `<name>.test.tsx` test, fix contract rows that named them (3 batches, after Task 2)
- [x] 4. Docs: AGENTS.md (Commands, Tests, Quality gates), CLAUDE.md (gates), `testing` skill, `storybook-docs` skill where it says plays or 4 themes, `docs/engineering.md`, `docs/accessibility.md` if it says 4 themes (lead)
- [x] 5. Gates: `pnpm run ci` once, locally (lead); then CI green on `development`

## Decisions

- **Stories in one theme, axe on** (maintainer, 2026-11-26). Weighed: 4 themes everywhere (today; ~4× the story cost for contrast that `theme:check` already proves), 1 in `test` and 4 in `ci` (CI stays slow), no automated axe (drops the "0 axe violations in every story state" bar). Gate change: AGENTS.md and the testing skill change in this PR.
- **Axe in stories only** (maintainer, 2026-11-26): one place, the layer that renders every state (rule 13).
- **Sweeps in `ci`, network smoke separate and nightly** (maintainer, 2026-11-26): a service blip never fails a PR.
- **Audit plays now** (maintainer, 2026-11-26), not as touched.
- **CI on `development` too** (lead): it's where work lands; today nothing checks it.
- **`check` is types only:** `vp check` without `--no-fmt --no-lint` would repeat `format` and `lint`.

## Risks & open questions

- A test's axe call may cover a state no story renders (an open popup, an error). Task 2 adds the story rather than losing the check.
- `tooling/keyboard-docs` requires contract rows to name tests; a removed play that a row names fails it, as intended. Fix the row.
- CI is already red: Task 5 may surface failures that predate this plan. Those go to the owning component, reported, not fixed silently.

## Done when

- [ ] `pnpm run ci` green locally and on `development`
- [ ] Plan ticked, docs updated, then the plan is deleted

## Implementation notes

- Task 1 (2026-11-26): `build` runs before `check`, since the type check reads built workspace output. `ci.yml`'s gates job is install, Playwright, `pnpm run ci`; a `smoke` job runs on the nightly schedule and `workflow_dispatch`. `tooling/ci` (`ciSteps`, the Docker mirror) is tested to equal `scripts.ci`, `scripts.test` and `scripts.sweep`. Vitest accepts an unknown `--project` name silently (lists no files), so the removed theme names don't error.
- Task 4 (2026-11-26): AGENTS.md, CLAUDE.md, `docs/engineering.md`, `docs/accessibility.md`, the testing skill and template, the contract template, `storybook-docs` and the reviewer agent describe the new gates. The testing skill's standing exception (maintainer, 2026-10-04: a `play` may check a state a test also proves) is replaced by the plan's rule (maintainer confirmed, 2026-11-26). Formatting is no longer advisory: `ci` fails on it. Per-component `*.a11y.md` axe rows ("4 themes") are updated after Task 2.
- Task 2 (2026-11-26): about 380 `expectNoA11yViolations` calls removed from 82 react and 3 rich-text test files; stories added where none covered the state: table `SelectableWithoutRowHeader` (fixture prop `withoutRowHeader`), announcer `BothRegionsFilled`, alert-dialog `OverADialog`. Dropped without a story (lead accepted: no role or name changes): announcer with both regions empty, InputGroup in `sv`. Weakest "a story covers it" matches, for review: button-group named by `aria-labelledby` and unnamed, alert's plain Root with its own icon, listbox's virtualized two-line option, the `Toggle` button in combobox and autocomplete. Kept: `provider/a11y-in-every-theme.test.tsx` tests `@kvirn/testing`'s axe helpers themselves.
- Task 3, batch `accordion`–`map` (2026-11-26): plays that only re-proved a test are removed (about 120 of 480) and the `expect`s a test proves are trimmed (about 940 to 270 left, most of them inside `waitFor`, which waits for a state). Steps that bring a story into a state (open a popup, type, pick, choose files) stay so axe checks that state. Kept as unique: size and overflow checks (`theme-story-assertions`), fixture wiring (`stored`, `mirror`, `sent`, reason text, `closedDays`, `rangeDays`), real-library integrations (icon Lucide, Heroicons, registry, shadow DOM), range-picker and file-upload state steps, the focus `Loop`, `Restore`, `Inert` and `NativeFirst` compositions, `ErrorSummary` `OnSubmit`. Contract rows already named tests only; `error-summary` → `Default` and `focus` → `Loop` still name existing stories.
- Task 3 (2026-11-26): 80 component story files audited in two batches (accordion–map, mask–visually-hidden + rich-text-editor). Plays that only walk keys or re-assert a tested attribute are removed; kept plays reach a state for axe (open, loading, errors) or prove what no test does (target size, overflow and reflow, fixture wiring, composition, visibility, third-party icon integration). Patterns, content types, foundation and `navigation/primary-navigation.stories.tsx` (the MainMenu pattern) are not audited: their plays are the only proof. No contract row named a removed play. All 81 `*.a11y.md` axe rows now say "light theme"; `text-input.a11y.md` 2.5.8 cites `Compact`, whose play asserts it.
- Task 5 (2026-11-26): `pnpm run ci` on the whole tree. fmt, lint, build, check (2,710 files), i18n:check, theme:check (690 pairs × 4 themes) and storybook in one theme (168 s; four themes took about 4×) are green. Red, all predating this plan (maintainer: fix all three, each in its own commit): dev-warnings page out of step with the read-aloud codes, 30 unmarked Nordic lines (read-aloud texts and plan 0155), and 7 Map stories overflowing 320px in the reflow sweep (WCAG 1.4.10). Two docs files predating this plan were unformatted and are formatted.
- Map reflow (2026-11-26): the 7 failures are marker and cluster buttons within 22px of the map edge, overhanging an `overflow: hidden` viewport, so nothing scrolls. `expectNoHorizontalOverflow` ignored clipping. Weighed: clamp markers in CSS (pins show a wrong location), hide edge markers (list and count disagree), fix the helper (chosen, maintainer approved the gate correction): it measures a child clipped to its overflow-hidden or clip ancestors. WCAG 1.4.10 is about two-directional scrolling, and it exempts maps.
- Text spacing (2026-11-26): the map's clipped marker layer gives `.kv-map-viewport` a `scrollWidth` larger than its `clientWidth` with or without spacing. Weighed: exempt non-text overflow (cluster counts are text), drop the map from the sweep (loses its list and popups), compare before and after the spacing (chosen, maintainer approved): `expectNoClippedTextWithSpacing` fails only where the 1.4.12 spacing creates or grows clipping.
- Review (2026-11-26, CHANGES REQUIRED): 62 `*.a11y.md` "Markup and ARIA" cells still cited axe; fixed (lead). Stories added or restored: ButtonGroup named by `aria-labelledby`, a virtualized listbox with rich options, the open-state waits in three menu stories, the toast's done state, and the BothRegionsFilled JSDoc. Kept despite the Task 3 note, and tested elsewhere: the `Controlled` plays removed in menu, popover and tabs (their reasons are tested, e.g. menu.test.tsx:820), so the note's "fixture wiring kept" excludes those.
- Contrast claim (review item 5, 2026-11-26): `theme:check` proves every listed token pair in four themes. It doesn't reach map markers and halos over imagery, `color-mix()` of tokens, or raw colours in TSX `style`. Axe couldn't measure the imagery cases before either, so one theme loses no proof there. The gaps are two `docs/roadmap.md` lines; the map's 1.4.11 stays pending for a human check on real tiles. `error-summary.a11y.md` now cites `OnSubmit` (its play focuses the summary); `Default` never did.
- ReadAloud reflow (2026-11-26): 23 failures predating this plan, never seen because the sweep stopped earlier. The stories pin a 1280px viewport file-wide (`globals: wideGlobals`) with no `reflowOptOut`. The maintainer paused `read-aloud` in `sweepComponents`; Plan 0154 has the task to add it back.
- Re-review (2026-11-27, CHANGES REQUIRED): the clamp to any overflow-hidden ancestor would pass text a user loses (a long option cut off in `.kv-listbox-list` or `.kv-menu-popup`). WCAG 1.4.10 forbids loss of content as well as two-way scrolling, so the premise above was incomplete. Narrowed (lead, stricter than approved): both helpers clamp, and use the before/after baseline, only inside a region a story declares two-dimensional (`parameters.twoDimensional`, with a selector and a reason). Today only the Map meta declares one, `.kv-map-viewport`.
- Third review (2026-11-27, CHANGES REQUIRED): `.kv-map-viewport` also holds the controls, layers panel and attribution, which panning never reveals. The Map's region is now `.kv-map-markers` (the marker layer, `overflow: clip`). Reflow passes with it. Text spacing then shows a 21–22px pre-existing overflow on a clipping box outside the layer, being diagnosed.
- Final (2026-11-27): `.kv-map-viewport`'s 21–22px overflow was marker buttons overhanging it; `map.css` now clips the marker layer (`overflow: clip`, the viewport's padding box, so nothing new is hidden). Map, AddressSearch, AddressInput and Icon stories pass the sweeps; `pnpm run check` and all four sweeps are green on the whole tree. accessibility-reviewer: APPROVE (4th pass). ReadAloud 1.4.10/1.4.12 stay pending while it's paused; Map 1.4.11 over imagery stays pending (roadmap).
