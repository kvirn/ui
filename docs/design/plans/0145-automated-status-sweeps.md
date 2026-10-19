# Plan 0145: Display-mode sweeps for the common components, Automated status

- **Status:** In progress
- **Owner:** lead / component-engineer / docs-writer
- **Created:** 2026-10-19 · **Target:** alpha → Automated
- **Related:** [AT matrix](../../accessibility.md) (Automated tier), `testing` skill (sweeps), `vite.config.ts` `sweepComponents`

## Goal

Every component whose other four Automated rows are `pass` or `n/a` reaches the `Automated` word by passing the four display-mode sweeps (forced colours, reduced motion, 320px reflow, text spacing), with its AT record and docs page up to date.

## Non-goals

- No loosened thresholds or skipped stories. A story that fails is fixed, or its component stays out of the list with the reason recorded here.
- No human checks, no `Core`/`Release` rows, no claim beyond `Automated`.
- Components whose `ARIA` row is `pending` (Calendar, EmptyState, PhoneInput, Map, AddressInput/Address already swept) are separate work.

## Design

Candidates: the storybook directories of every component whose axe, ARIA, keyboard and focus rows are done and whose Display modes row is `pending`. Adding a directory to `sweepComponents` widens a gate; it weakens nothing.

The Display modes row of a component turns `pass` only after all four sweeps pass for its stories, with Notes naming the four projects (copy the Button row). Where a component has no visual surface or motion the row may be `n/a` with a reason the reviewer agrees with.

## Decisions

- 2026-10-19: add all candidates at once, run the four sweeps once, triage by directory; failing components are fixed (story or theme, by `component-engineer`, theme change needs the maintainer) or left out and listed under Open.
- 2026-10-19: run every sweep on one worker (`VITEST_MAX_WORKERS=1`), one project at a time (maintainer). With two workers, combobox, autocomplete, input-group, number-input, slider and rich-text-editor failed in the full run and passed alone; on one worker they pass.
- 2026-10-19: the first run of each sweep project re-optimizes dependencies and reloads, so its results are void; judge only a warm run.
- 2026-10-19: Playwright stays at 1.63.0. With 1.64.1 (Chromium 156) the browser connection closed partway through every Storybook run, sweep or not; on 1.63.0 the plain `storybook` project ran all 160 files.
- 2026-10-19 (maintainer, gate change): `expectNoHorizontalOverflow` skips the contents of a focusable `role="region"` that scrolls sideways (ScrollArea, Table) and still checks the region; 1.4.10 exempts two-dimensional content. Options weighed: keep table and scroll-area out of the sweeps, or restack tables to fit 320px (a design change). `testing` skill updated.
- 2026-10-19 (maintainer, gate change): the forced-colours focus check accepts a ring drawn by the nearest outlined wrapper of the focused part (InputGroup draws it on the group), but only if that outline goes away when focus leaves (`hasFocusRing` blurs, reads, refocuses). It replaces an unrecorded looser loop in the tree that accepted an outline on any ancestor. Options weighed: revert to own-outline only (InputGroup would fail), or keep the loose loop.
- 2026-10-19: stories that pin the wide (1280px) viewport or assert the wide layout use the existing `reflowOptOut`; each component keeps a narrow story in the sweep: top-bar (Narrow), primary navigation (Narrow Menu; Open Wide and Keyboard now also `wideGlobals`), pagination Keyboard (Reflow320 swept), date-picker Masked Text Input (the masked row is swept at 320px by Open and Swedish). display-settings Narrow used an undefined viewport key; now `reflow320`.
- 2026-10-19: real reflow fixes, layout only: the story icon row wraps (`preview.css`); an attached rich-text toolbar group of word buttons wraps (`rich-text.css`; icon-only groups stay one strip); wide `<pre>` demos in the Provider and rich-text fixtures sit in a labelled ScrollArea; the Prose table region is a `ScrollArea region="always"`.
- 2026-10-19 (maintainer): Prose inline code drops `box-decoration-break: clone` (it hung 2px past a 320px column under 1.4.12 spacing); a wrapped code reference loses its closed edge at the break. `docs/design/foundations-and-prose.md` updated.
- 2026-10-19: the Provider theme stories asserted the "in use" summary without forced colours and with full motion; they now read the media queries (`kvirn-provider.stories.tsx`, `themeCombination`).

## Tasks

- [x] Add the candidate directories to `sweepComponents` (52 added, 70 in all)
- [x] Run the four sweeps (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), triage failures per directory: all four green on one worker; the load flake (§Open) hit one file per run, each passed alone
- [x] Fix failing stories (or list the component under Open): none left out
- [x] Set the Display modes row to `pass` in each swept component's `*.a11y.md` (52 files)
- [ ] `docs-writer`: docs-site component pages match the code and the contract, in waves of three (maintainer, 2026-10-20); contract findings go to `component-engineer` in batches. Done: Button, Link, TextInput, Checkbox, CheckboxGroup, RadioGroup, Switch, Alert, Dialog, AlertDialog, Tabs (pages and contracts), Menu, Popover, Tooltip (pages)
- [ ] `docs/roadmap.md` and `docs/accessibility.md` note updated; `vp run test` green

## Open

- A random 1–5 story files per run fail to load ("Failed to fetch dynamically imported module", no server error, no file change during the run), a different set each run, sweep or not, before and after the toolchain update. Pre-existing; until it's fixed a sweep can't prove a directory in one run.
- `vp check` (or something in the same step) writes `.d.ts` files next to the sources in `packages/{core,i18n,icons,react}/src` (gitignored). Stale ones broke `vp pack` for core on 2026-10-19 (`MISSING_EXPORT GeocoderIntent`); 725 were deleted, and they came back at 22:23.
- Contract Keyboard tables cite exact test titles (tooling/keyboard-docs requires it), so the `(5.1)`, `(5.2)`, `(5.6)` and `%s` noise in TextInput's mask rows renders on the docs page until the tests in `use-mask.test.tsx` and `number-input.test.tsx` are renamed.
- Tag (with TagGroup) has a contract, component and stories but no docs-site page (no page, route, examples, `site-sections.ts` entry). Writing one is a separate task.
- `render/as-prop.ts` has no test: the `as` fallback to the default tag and its `as-not-allowed` dev warning are unproved for List and the other `as` parts; the docs pages no longer claim it.
- The docs example `examples/toolbar/vertical.tsx` lays its column out with an inline `style`, because the theme has no `kv-toolbar--vertical` class (AGENTS rule 14). A theme class needs a design decision.
- `docs-pages` skill: "Real examples" says use cases have no upper limit, the template checklist says 2–8; DateInput and RadioGroup have 10. Maintainer to choose (recommended: no upper limit).
- The Prose fixture's table region (`prose.fixture.tsx`) is a Tab stop even when it fits (`tabIndex` override; the `Article` story asserts it). The ScrollArea rule is a Tab stop only while it overflows. Not a regression; a separate change to the story and fixture.
