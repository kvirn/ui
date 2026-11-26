# Plan 0157: ESM-only packages, and one file per icon

- **Status:** In progress
- **Owner:** lead / component-engineer
- **Created:** 2026-11-26 · **Target:** before alpha; `@kvirn/icons` 0.2.0
- **Related:** `docs/engineering.md` (package format), `tooling/vite-preset/pack.ts`, the `@kvirn` scope rename (0.1.0 icons publish, 2026-11-26)

## Goal

Every published package ships ESM only, with one set of types. `@kvirn/icons` ships one module per icon, so its output mirrors `src` and no shared chunk is named after a random icon (`zoom-to-fit-*.mjs` in 0.1.0).

## Non-goals

- No new subpath exports (no `@kvirn/icons/icons/*`): the public entries stay `.`, `./all`, `./react` and every other package's existing subpaths.
- No change to what any entry exports, to the source or to the tests' behaviour.
- Unbundled output for packages other than icons.

## Background

- Every maintained Node line (22, 24, 26) can `require()` an ES module without a flag (Node 20.19+ also could; Node 20 reached end of life in April 2026). The repo already requires Node ≥26. Vite, Rolldown, webpack 5, Next and Storybook consume ESM-only packages.
- Dual output doubles `dist`, and lets one app load two copies of a package (the dual-package hazard: `react.ts` in icons keeps a `WeakMap` cache, and `@kvirn/react` has providers and registries a second copy would split).
- Only `@kvirn/icons` is on npm (0.1.0). The other packages aren't published, so dropping CJS breaks no consumer.
- `vp pack` (tsdown in vite-plus-core 8.3.8001) has `unbundle?: boolean` ("output files will mirror the input file structure").

## Design

- `tooling/vite-preset/pack.ts`: `format: ['esm']`, comment updated. `packages/map`'s worker pack is already ESM-only.
- `packages/icons/vite.config.ts`: `unbundle: true`.
- Every `packages/*/package.json` with a build (core, i18n, icons, map, patterns, react, read-aloud, rich-text, testing, theme):
  - every `exports` entry becomes `{ "types": "./dist/x.d.mts", "default": "./dist/x.mjs" }` (no `import`/`require` split);
  - `main` → `./dist/index.mjs`, `types` → `./dist/index.d.mts`, `module` removed (redundant with `main` and `exports`).
- `@kvirn/icons` → `0.2.0`.

## Tasks

- [x] 1. Preset, icons `unbundle`, every package.json, `tooling/react-server-entry/react-server-entry.test.ts` (:35, :51 expect `.cjs`) → `.mjs`; `docs/engineering.md:20` and `packages/react/README.md:14` say ESM only, with the reason; icons version 0.2.0 (component-engineer)
- [x] 2. Gates: `vp check` on changed files, `vp test run` on the react-server-entry and icons tests, then `vp run build` and a check that each `exports` path exists in `dist` (lead)
- [x] 3. Review: no a11y surface, so no `accessibility-reviewer` pass; lead reviews the diff
- [ ] 4. Publish `@kvirn/icons@0.2.0` (maintainer, 2FA), then the consumer check from the 0.1.0 publish (ESM, `require(esm)`, React render, types) against 0.2.0 (lead)
- [ ] 5. Roadmap line, plan Done

## Decisions

- **ESM only, every package** (maintainer, 2026-11-26). Weighed: keep dual output (the Radix / React Aria practice when Node 20 was alive; costs double output and the dual-package hazard), ESM only for icons alone (inconsistent presets for no gain), ESM only everywhere (chosen: all supported Node lines `require()` ESM, nothing else is published yet). A build change: maintainer-approved, `docs/engineering.md` changes in the same PR.
- **Unbundle icons only** (maintainer, 2026-11-26). An icon package is a set of leaf modules; mirroring `src` keeps tree-shaking working even when the consumer doesn't bundle (dev servers) and makes `dist` readable. Other packages keep bundled entries.
- **`main` and `types` stay** pointing at the ESM files, for tools that predate `exports`; `module` goes.
- **Plan number 0157:** the roadmap cites a Plan 0156 (scope rename) that has no file; 0157 avoids the clash.

## Risks & open questions

- Jest's CommonJS runtime can't load ESM without its ESM mode or a transform; documented in `docs/engineering.md`, not worked around.
- `unbundle` also emits `dist/icons/*.d.mts` per icon; the `.` entry's types must still resolve (checked by the consumer test in Task 4).

## Testing strategy

The existing tests cover behaviour (`tree-shaking.test.ts` builds from `src`). The packaging is proved by the build plus the out-of-repo consumer check against the published tarball.

## Rollout

`@kvirn/icons` 0.2.0 (0.x: a format change is a minor). The other packages ship ESM-only from their first publish.

## Done when

- [x] Gates in Task 2 green, `vp run build` builds every package
- [ ] `@kvirn/icons@0.2.0` on npm and the consumer check passes
- [ ] Plan ticked, `docs/roadmap.md` updated

## Implementation notes (2026-11-26)

- `tooling/vite-preset/workspace-source.ts` read `exports[x].import`; it now reads `exports[x].default`, or the Storybook and Vitest source aliases would have broken.
- `@kvirn/map`'s `./worker` entry (import-only before) is now `{ types, default }` like the rest.
- Icons `dist`: `index`, `all`, `react` entries plus `dist/icons/` (421 icons × `.mjs`, `.d.mts`, `.mjs.map`).
- Verified: `vp check` on 18 files, `vp run build` 17/17, all 93 `main`/`types`/`exports` paths exist and none is CJS, `vp test run` on react-server-entry, icons and Button (6 files, 89 tests), and the 0.2.0 tarball in a clean consumer: ESM, `require()` from CJS, React render, types under `nodenext` and `bundler`.
