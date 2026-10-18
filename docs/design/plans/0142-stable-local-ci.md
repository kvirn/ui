# Plan 0142: Stable local CI

- **Status:** Done (agents), 2026-10-18: runner and gate-guard shipped; no five-run proof, by decision
- **Owner:** lead
- **Created:** 2026-10-18 · **Target:** before local CI runs become routine
- **Related:** `docs/engineering.md` (Vitest projects, CI), `testing` skill (One run at a time, Worker caps), `.github/workflows/ci.yml`, `vite.config.ts:98-103,281-332`

## Goal

`vp run ci` (or equivalent) runs exactly what `ci.yml` `gates` runs, on a developer machine, and gives the same verdict every time, whatever else the machine is doing. A red run means a real defect, not load or a concurrent run.

## Non-goals

- Changing any test, threshold, timeout or axe rule (rule 1). No retries to hide flakes.
- Replacing GitHub Actions. CI stays the whole-tree gate.
- Running the AT matrix human checks.

## Background

Observed 2026-10-18 on the maintainer's machine (28 threads, 30 GB):

| Symptom                                                                                      | Cause (evidence)                                                                                                                                                  | Fix class          |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 7 story files `Failed to fetch dynamically imported module`, all other 1480 tests green      | Another `vp test` and file edits ran during the whole-tree run. All 7 pass alone (36 files, 336 tests). No `cacheDir` is set, so every run shares Vite's default. | Isolation          |
| `rich-text-editor.test.tsx > Tab in a list item says the new level` fails once in 5749 tests | Passes 3/3 alone. Key sequence (`click`, `Ctrl+End`, `Tab`) races the editor's focus and the announcement throttle under load.                                    | Test robustness    |
| Whole tree takes 106-138 s, serial                                                           | `package.json:12` runs 5 `vp test run` calls in series because two `storybookTest()` projects in one process flake (`docs/engineering.md:62`)                     | Throughput (later) |

Facts: 8 Vitest projects, one config (`vite.config.ts:281-328`), `maxWorkers` 2 each (`:103`), no `cacheDir`/`optimizeDeps` anywhere, no Docker/devcontainer/runner in the repo, `ci.yml` is one `gates` job, serial steps (`:46-57`).

## Options weighed

1. **Host only: one entry point with its own lock, per-run cache dir.** `tooling/ci/` script takes `flock /tmp/kvirn-gate.lock`, sets `cacheDir` per project and per run, runs the `gates` steps in `ci.yml` order. Cheap, no new tool. Still shares CPU with whatever else you run, so timing flakes remain possible.
2. **Container with fixed CPU and memory.** A `Dockerfile` (Node 24, vp, Playwright Chromium, same versions as `ci.yml`) and `vp run ci:docker`: `docker run --cpus=N --memory=M` on a bind-mounted copy, own cache inside. Same result regardless of host load, and N containers can run side by side (shards of the Storybook projects) because nothing is shared. Needs Docker on the machine, a new tooling file, and keeping the image in step with `ci.yml`.
3. **`act` to run `ci.yml` itself.** One source of truth, but a third-party tool and Docker anyway, slow image, and `act` handles `setup-vp` and Playwright browsers poorly.

**Chosen by the maintainer: 2, container first.** The container has its own cache and a fixed CPU and memory budget, so no `vite.config.ts` change is needed to stop shared-cache collisions (the per-project `cacheDir` in option 1 becomes optional and is dropped from this plan). Not 3.

## Design

### Contract (what "stable" means, each row gets a check)

| Row | Requirement                                                                                                                                                   | Proved by                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1   | The container runs the `ci.yml` `gates` steps, same commands, same order                                                                                      | `tooling` test parses `ci.yml` and the step list  |
| 2   | It runs the working tree as it is now (uncommitted edits included) in a private copy: no `node_modules` or cache is shared with the host or another container | script test on the copy step                      |
| 3   | It stops at the first red step, names it, and exits non-zero                                                                                                  | script test with a stub step                      |
| 4   | Node, Playwright and base image are pinned (Playwright to the catalog version, image by tag and digest); no floating tags                                     | tooling test reads the catalog and the Dockerfile |
| 5   | CPU, memory and shm are flags with defaults; the same budget gives the same verdict                                                                           | five green whole-tree runs recorded under Results |

### Shape

- `tooling/ci/Dockerfile`: `mcr.microsoft.com/playwright` image at the catalog's Playwright version (Chromium and its system deps included), Node 24, pnpm and `vp` from the repo's own `packageManager` and `vite-plus` pin.
- `tooling/ci/docker-ci.ts` plus a root script `ci:docker`: builds the image if its inputs changed, then `docker run --rm --cpus --memory --shm-size --ipc=host`, repo bind-mounted read-only; the entrypoint copies the tree (no `node_modules`, `.git` objects not needed) to the container's own disk, `pnpm install --frozen-lockfile` against a named pnpm-store volume (read-only cache of tarballs), then the `gates` steps. `--step <name>` runs one step. Defaults `--cpus 4 --memory 6g`, overridable by env. The host's Docker VM has 7.75 GiB, so two containers at once is the ceiling until measured.
- Parallel containers (one Vitest project each) are a follow-up after task 4 proves a single run stable.
- Docs: `docs/engineering.md` CI section, `testing` skill (One run at a time), `CLAUDE.md` gates line.

## Tasks

- [x] 0. Maintainer approves: container first; rich-text flake fix by waiting on the real condition. (2026-10-18)
- [x] 1. Done by lead, then changed by the maintainer (2026-10-18): root cause was Ctrl+End racing the empty paragraph the editor adds after a list, and a click-based rewrite passed 3/3 quiet; the maintainer then said to drop the test, so `Tab in a list item says the new level` is removed from `rich-text-editor.test.tsx`. The Tab-nests rows stay covered by `kvirn-keymap.test.tsx`. (Original task: rich-text flake. Find why Tab after `Ctrl+End` can run before the editor is ready; wait on the real condition, keep the assertion and timeouts. Prove: 20 runs of the file with `VITEST_MAX_WORKERS=6`.)
- [x] 2. `component-engineer`: `tooling/ci/` Dockerfile, `docker-ci.ts`, `steps.ts`, tests for rows 1-4 (9 tests green). Smoke: `ci:docker --step i18n:check` green, 45.7 s with the image build.
- [x] 3. (host split done by the engineer, 13 tooling tests) Lead: `vp check` on the changed files, `vp fmt`. A first containerised whole-tree run.
- [ ] 4. (dropped, see Decisions: no more local whole-tree runs) Lead: five whole-tree `ci:docker` runs in a row; record the times and verdicts under Results.
- [ ] 5. Lead: docs and skill updates (Docker becomes the way to run CI locally); decide the parallel-container follow-up from the timings.

## Decisions

- No retries, no longer timeouts, no `.skip` (rule 1). A flaky test gets a cause, not a rerun.
- Stability comes from isolation and a fixed resource budget, not from lowering worker counts further.
- Docker is a developer-machine tool, not a repo dependency: nothing is added to `package.json` or the catalog (rule 6). The maintainer approved using it.
- `pnpm-lock.yaml` and `pnpm-workspace.yaml` are modified in the working tree by someone else; `--frozen-lockfile` fails if they disagree. The runner reports that, it doesn't fix it.

- Implementation (task 2): base `mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30…`; image tag `kvirn-ci:<hash of Dockerfile + pnpm version>`; the same `docker-ci.ts` runs on the host and, with `--inside`, in the container; copy by `tar` excluding node_modules, .git, caches, dist, coverage; `pnpm install --frozen-lockfile` with the volume `kvirn-ci-pnpm-store` replaces `vp install` and `playwright install`; steps `build check fmt test sweep i18n:check theme:check`; env `KVIRN_CI_CPUS=4`, `KVIRN_CI_MEMORY=6g`, `KVIRN_CI_SHM=1g`. `tsconfig.json` now includes `tooling/ci` (needed for types).
- Known weakness: `ci.yml` is read with a line regex (no YAML dependency), so row 1's test breaks loudly if the `gates` job layout changes. That is the intended failure mode.

- Memory default is 6g, not 4g: the `build` step (parallel `tsgo` type-declaration builds) was OOM-killed at 4g (SIGKILL) and passes at 6g in 2m43s. Docker's VM has 7.75 GiB, so only one container runs at a time until that is raised; parallel containers are off the table for now.
- Rich-text editor tests are the maintainer's to add later (2026-10-18). Removed at his request, as flaky in CI: `rich-text-editor.test.tsx › Tab in a list item says the new level` (the level announcement stays covered by `kvirn-keymap.test.tsx › Tab and Shift+Tab report the new level, from 1`) and `kvirn-keymap.test.tsx › the arrow keys, Home and End move the caret in the text`. The latter's row in `rich-text-editor.a11y.md` (Arrow keys, Home, End, PageUp, PageDown) was dropped with it, because `tooling/keyboard-docs` requires every row to name a real test. Restore the row with the test. Cause seen for the Home/End one: the key is a no-op when it races ProseMirror's 20 ms post-focus selection re-sync (fails about 1 in 3 on the host, more in the container).

- Scope change 2026-10-18 (maintainer): a container run with host tests next to it, plus my own load experiments, froze the workstation. Added `tooling/gate-guard` (a PreToolUse hook in `.claude/settings.json`, 14 tests): heavy commands must use the gate lock, no loops or background around a gate, and no identical re-run on an unchanged tree. `vp test`, `vp run test` and `pnpm test` (also under `flock`) moved to the `ask` list in `.claude/settings.json`; `vp check` and `vp fmt` stay allowed. Rule 12 in `AGENTS.md` and the hooks line in `CLAUDE.md` updated. The local container work stops here: the Storybook step still loses Chromium in the container (memory, CPU, cache, shm and limits ruled out), whole-tree runs belong on CI, and the half-finished host-split edit of `tooling/ci` is not continued.

## Results

(task 4)

## Done when

Five consecutive whole-tree `ci:docker` runs on the maintainer's machine are green, a host `vp test` running at the same time doesn't change the verdict, and the docs name the one command.
