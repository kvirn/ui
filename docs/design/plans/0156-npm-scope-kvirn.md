# Plan 0156: Move every package to the `@kvirn` npm scope, and make `@kvirn/icons` 0.1.0 ready to publish

- **Status:** Done
- **Owner:** lead
- **Created:** 2026-11-24 · **Target:** icons 0.1.0 on npm (the maintainer publishes)
- **Related:** HQ brief 0006 (HQ-D6, maintainer, 2026-11-24), `docs/architecture.md`, `docs/roadmap.md` (M3)

## Goal

Adopters install KvirnUI from the `@kvirn` npm org, which exists, instead of `@kvirn-ui`, which doesn't. `@kvirn/icons` 0.1.0 is ready for the maintainer to publish with `pnpm publish`.

## Non-goals

- Publishing, `npm login`, pushing, changesets, version bumps of any other package.
- Renaming the product (it stays "KvirnUI"), ui.kvirn.com, directories (`packages/react` stays), or any licence term.
- Any new dependency.

## Design

Mapping (maintainer-approved): `@kvirn-ui/react` → `@kvirn/ui`; every other `@kvirn-ui/<name>` → `@kvirn/<name>` (`core`, `theme`, `i18n`, `icons`, `rich-text`, `map`, `read-aloud`, `patterns`, `testing`). Private flags unchanged.

- **Public API:** every import path changes (`@kvirn-ui/react/internal` → `@kvirn/ui/internal`, `@kvirn-ui/theme/theme.css` → `@kvirn/theme/theme.css`, …). No export, prop or behaviour changes. Rule 9: the docs that name packages change with it (architecture, roadmap, DESIGN.md, READMEs, docs site install snippets, skills).
- **Source aliases** resolve by `package.json` `name` (`tooling/vite-preset/workspace-source.ts`), so they follow the rename. `tsconfig.json` `paths` are renamed key by key.
- **No accessibility contract:** no component behaviour, markup, string or token changes. Gates prove nothing regressed.

## Tasks

- [x] T1 Codemod (lead): one ordered replacement over tracked text files, `@kvirn-ui/react` → `@kvirn/ui` first (also its regex-escaped `@kvirn-ui\/react`), then `@kvirn-ui` → `@kvirn`. Lockfile excluded (regenerated).
- [x] T2 `pnpm install` regenerates `pnpm-lock.yaml`; no `node_modules/@kvirn-ui` left.
- [x] T3 `@kvirn/icons`: version `0.1.0`, `packages/icons/README.md` (install, plain-data and `/react` import, link to ui.kvirn.com, licence line matching `LICENSING.md`), `README.md` in `files`. (component-engineer)
- [x] T4 Prose fallout: sentences that read wrong after the mechanical rename (for example "the `@kvirn-ui` scope", sorting of import lines). (component-engineer)
- [x] T5 Gates: `vp check` → `vp run test` → `i18n:check` → `theme:check`, docs and storybook builds, `pnpm pack --dry-run` in `packages/icons`.
- [x] T6 `accessibility-reviewer` on the diff.
- [x] T7 Record: roadmap line, plan row, commit message, publish commands.

## Decisions

- **The two apps rename too:** `@kvirn-ui/docs` → `@kvirn/docs`, `@kvirn-ui/storybook` → `@kvirn/storybook` (private, not in the brief's table). The brief's Done is "no `@kvirn-ui/` left", and one scope per repo keeps `--filter` and `.changeset` ignore lists uniform.
- **Planned packages follow the scope:** `@kvirn-ui/dictation` (0152) and `@kvirn-ui/ai` (0155) become `@kvirn/dictation` and `@kvirn/ai`.
- **Codemod by the lead, not an engineer:** it is one deterministic command over a fixed mapping, cheaper and less error-prone than a brief; the judgement work (README, prose) goes to `component-engineer`.
- **Kept `@kvirn-ui/`:** none in the tree. Plans are deleted when done, so every plan here is live and renamed; there are no CHANGELOG files. History is git.
- **Licence files:** no repo rule makes them the maintainer's, and the brief allows names only. Only the package names change (`LICENSE`, `LICENSING.md`, `packages/*/LICENSE`, `packages/*/LICENSING.md`); the diff is shown to the maintainer in the report and goes on the lawyer-review list for `LICENSING.md`. Note for that review: `@kvirn` is the company-wide scope, so "the @kvirn/* packages in this repository" now relies on "in this repository" to exclude other Kvirn products.

- **T3 and T4 by the lead:** two edits (the README, the manifest) and a grep of the renamed prose, which read correctly, so no engineer spawn.
- **Gates (2026-11-24):** `vp check --no-fmt` 0 errors (1 `exhaustive-deps` warning in read-aloud from before); all 17 builds green; browser and storybook green, apart from load flakes that pass alone (Vite's "Failed to fetch dynamically imported module" after the new scope changed the optimizer cache; Chromium connection closed). Not this change, left for their own fix: the 4 `node` failures in `tooling/` (`dev-warnings` read-aloud codes, `docker-ci` smoke step, `english-only` Nordic prose) and the formatting of `docs/design/README.md` and `docs/design/read-aloud-concepts.md`, all already on `development`.
- **Review:** `accessibility-reviewer` APPROVE, no findings, 2026-11-24.
- **Maintainer, 2026-11-24:** commit this rename first, then update every dependency to latest (`@types/node` 26 included) as a separate change. A feature-vs-wide test split was raised; it's a gate change, for its own plan.

## Risks & open questions

- Stale `dist/` and `node_modules/@kvirn-ui` links could hide a missed import: T2 checks the links are gone, and the builds rebuild `dist`.
- Import order: `@kvirn/…` sorts differently from `@kvirn-ui/…`; formatting is advisory, `vp fmt` on the changed files.

## Rollout

No package has been published, so no consumer breaks. Only `@kvirn/icons` 0.1.0 is published early; the rest stay at their versions until "Public 0.x on npm" (M3).

## Done when

- [x] No `@kvirn-ui` in tracked files except this plan's mapping
- [x] Gates and both builds green, icons dry-run tarball clean, reviewer APPROVE
- [x] Roadmap updated, commit message and publish commands proposed
