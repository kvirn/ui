# Plan 0129: Map and rich-text use library icons; `@kvirn-ui/icons` goes public

- **Status:** Done for agents (open: licence wording, visual check of the pin, human review checks)
- **Owner:** lead
- **Created:** 2026-10-17 · **Target:** alpha
- **Related:** [0128](0128-icons-replace-built-ins.md), [0124](0124-icon-library.md), `docs/design/map.md`, `docs/design/rich-text-editor.md`

## Goal

Every icon in KvirnUI is a `@kvirn-ui/icons` icon, each package imports only the ones it uses (so no build holds all 257), and the library can be installed on its own from npm.

## Non-goals

- Redrawing: 21 of the 22 map/rich-text icons exist by exact name. The map's `marker` becomes the library's `pin` (maintainer, 2026-10-17).
- Human review results: recognition tests, native-speaker labels, AT and sensitivity review stay pending and are shown as pending (never claimed).

## Design

### A. Map and rich-text on library icons

| Package   | Icons (library name)                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| map       | `marker` → `pin`; `locate`, `remove`, `arrow-north`, `arrow-south`, `arrow-west`, `arrow-east`                                       |
| rich-text | undo, redo, bold, italic, underline, strike, code, bullet-list, numbered-list, indent, outdent, link, image, table, clear-formatting |

Both add `@kvirn-ui/icons` as a workspace dependency and import each icon by name, never `./all`. `mapIcons` and `richTextIconNames` keep their public names and keys if tests and docs need them, now built from named imports of `IconData`. The packages' own drawings (`map-icons.tsx` shapes, rich-text `icons.tsx` shapes) are deleted. Rendering goes through `@kvirn-ui/icons/react` (`SvgIcon`/`createIconComponent`) or react's `Icon`, whichever keeps the current DOM and accessibility (decorative by default; the default map pin stays decorative). A bundle test per package proves a consumer's build holds only that package's icons.

### B. `@kvirn-ui/icons` public

Remove `private`; add `LICENSING.md` (same shape as the other packages), `publishConfig: { access: public }`, a real `description`. The catalog status stays `drawn`; the Icons page and Icons/Library docs say which human checks are pending. No claim of review beyond what is done.

### Accessibility contract

Unchanged: same roles, names, keyboard and RTL behaviour. The visible change is the map marker (`pin`) and any redrawn glyph.

## Tasks

- [x] T1 (engineer H) B: icons package metadata, `LICENSING.md`, pending-checks note on the Icons page and in Icons/Library
- [x] T2 (engineer I) A: map and rich-text on library icons, deps, tests, bundle tests, docs and stories references
- [x] T3 (lead) facts: `AGENTS.md` repo map, `docs/architecture.md`, `api-conventions` skill, `docs/roadmap.md`
- [ ] Gates, `accessibility-reviewer`

## Decisions

- D1 (maintainer): `@kvirn-ui/icons` is public with react (option A); human checks pending and stated as pending.
- D2 (maintainer): map `marker` = library `pin`.
- D3 (lead): map and rich-text depend on icons by workspace link; both already never-bundle `@kvirn-ui/*`.
- D4 (engineer I): `mapIcons` is plain `IconData`; `ToolbarIcon` renders through `SvgIcon` at 1.25rem; bundle tests live in `tooling/icon-bundles/` (package-level tests run in the browser project, not node).
- D5 (reviewer, lead): behaviour notes: `numbered-list` now mirrors in RTL (the library flag; it matches `rich-text-editor.md:532,727`); `<ToolbarIcon name="undo" paths=...>` no longer mirrors by name, only with an explicit `mirrorInRtl`; the default map marker is the library `pin` drawn filled by `map.css:150-169` (28px, head about 13px, tip about 3px above the coordinate: open). The rich-text bundle bound stays at 1/2 (15 icons plus SvgIcon is about 1/3 of all icons, unminified; 1/5 fails), so the sampled absent icons are the real proof: widen the sample if it ever matters. Review: APPROVE, no blocking findings.
- D6 (lead): no `repository` field on icons, like every sibling package; dropped from §B.
- D7 (maintainer 2026-10-17, lead): the default map pin is 2.25rem (was 1.75rem) so its head is at least 24px tall (the library `pin` head is 16 of 24 units), shifted down by the 2.75 empty units under its tip (`translate`) with `transform-origin` on the tip, so the tip sits on the coordinate again and the expanded scale keeps it there. The 44px button target is unchanged. `map.css`, `map.md:70`, `docs/design/map.md:75` updated.

## Risks & open questions

- A public icons package ships `icons.<key>` labels that no native speaker has reviewed: marked pending, decorative by default.
- `packages/map` is still `private`; rich-text is public and now depends on icons.
- Dirty tree: `docs/roadmap.md`, `plans/README.md`, `plans/0124` hold maintainer edits; no `vp fmt` on them.

## Done when

- [ ] Gates green; `accessibility-reviewer` APPROVE; plan ticked
