# Plan 0124: Icon library (`@kvirn-ui/icons`, 150+ outline icons)

- **Status:** In progress
- **Owner:** lead · `iconographer` draws, `component-engineer` builds the package
- **Created:** 2026-10-16 · **Target:** alpha
- **Related:** `docs/design/icon.md` (the 25 built-ins, grid, keylines), Plan 0009, `.claude/skills/iconography/`

## Goal

A public-sector icon library of 150+ outline icons that look drawn by one hand: one 24 grid, one stroke, one corner rule, and every icon proven legible at 16px, distinct from its look-alikes, and correct in RTL and forced colours. Adopters import only the icons they use.

## Non-goals

- Filled, duotone or size-specific variants (decided 2026-10-16: outline only, one drawing).
- Brand marks, flags, emblems, logos. The consumer supplies those.
- Changing the grid, keylines, stroke or the size scale of `docs/design/icon.md`.
- Recognition testing with residents (stays `pending`; a human check).

## Decisions (maintainer, 2026-10-16)

| Question | Chosen                                                                                            | Why                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Home     | New package `@kvirn-ui/icons`, one module per icon. The 25 built-ins stay in react as base layer. | Tree-shaking; 150 path strings don't belong in every consumer's react bundle; own gallery. |
| Source   | `packages/icons/svg/<name>.svg` plus a generator (no dependency) emitting typed modules.          | The designer reviews real SVGs and a contact sheet; the checker can read files.            |
| Variants | Outline only, 24 grid.                                                                            | One weight rule is the smallest surface to keep consistent. Fix 16px by redrawing.         |

Taken during implementation (lead, 2026-10-16):

- Start with a construction grid (`packages/icons/grid/`) and the 25 built-ins redrawn as the pilot; showcase in Storybook only, no docs-site page yet. The package is `private` until reviewed.
- Generated modules are committed (Storybook and the workspace alias read `src`); a package test fails if they drift from `svg/`.
- Colour in the stories is a story-only control on a wrapper, as the Icon `Colors` story does. Icon takes no colour or variant prop (AGENTS.md rule 14, `use-icon.ts` omits colour); a colour class would be a new theme/API decision for the maintainer.
- Engineer decisions: `delete` is reserved, so its module exports `deleteIcon` (registry key stays `'delete'`); a hand-written `src/create-icon.ts` wraps shapes like `createBuiltInIcon`; the generator's root `<svg>` check is strict (viewBox, fill, stroke, stroke-width, linecap, linejoin exact; only `xmlns` extra); `all.ts` also exports `LibraryIconName`; stories reuse `kv-story-icon-gallery` and `kv-story-icon-cell` from `preview.css`; devDependencies `react`, `@types/react`, `vite-plus` are existing catalog entries, no new dependency. `packages/icons` added to the node test project glob (`vite.config.ts:262`).
- Maintainer, 2026-10-16: ink density is a per-class band (open glyph, object) of ±40% and a warning, not a gate; single segments and dots are exempt from the originality grep; the landscape keyline (x 3–21, y 5–19) joins `icon.md` §6.1; syncing the react built-ins to the redrawn 25 is a separate later change.
- Generator emits `vp fmt`-stable text (100 columns); `scripts/generate.d.mts` types it for the test.
- Maintainer, 2026-10-16 (after the design review): a meaningful or status icon is 20px or larger and 16px is decorative only; other angles than 45/90 only for named kit parts at 2:1, 1:1 or 1:2 slopes (`icon.md` §6.1). Label keys are camelCase (`icons.chevronDown`); trigger-part chevrons and arrows have no default label; `external` uses `link.newTabNotice`. Story colours follow `icon.md` §6.3 (no `secondary`).
- `"."` exports named icons (tree-shakeable); `"./all"` exports `allIcons` and `iconNames` for registries and galleries.

Pending (maintainer): add `vp run icons:check` (drawing-rule checker, §Tasks 3) as a gate and to CI. A new gate is the maintainer's call.

## Design

### Drawing system

Law and process are in the `iconography` skill; grid, keylines, gaps and markup in `docs/design/icon.md` §6.1. Task 1 adds `docs/design/icon-library.md`: the parts kit with coordinates, optical-correction notes, the inventory (name, concept, family, keyline, metaphor, aliases, RTL, label key, status) and the file format. Any keyline, grid or stroke change found necessary goes to the maintainer, not into the spec.

### Package sketch

```
packages/icons/
  svg/<name>.svg            source of truth, one icon per file
  src/<name>.ts             generated: export const <camelName> = { name, shapes, mirrorInRtl }
  src/index.ts              generated barrel; each icon also importable by subpath
  scripts/                  generate, check, contact-sheet (Node, no dependency)
```

```tsx
import { defineIcons } from '@kvirn-ui/react'
import { documentCheck, calendar } from '@kvirn-ui/icons'

const icons = defineIcons({ 'document-check': documentCheck, calendar })
<KvirnProvider icons={icons}>…</KvirnProvider>
```

The shape of an entry matches `IconRegistryEntry` (`packages/react/src/icon/icon-registry.ts`). The package depends on no runtime package; `@kvirn-ui/react` is a peer only if the entry type is imported.

### Accessibility contract (draft)

An icon is not a widget: no keyboard row, no Tab stop.

- Decorative by default (`aria-hidden`); meaningful only with a `label` from i18n in all 5 locales.
- `currentColor` only; survives forced colours; meaningful icons reach 3:1 (1.4.11).
- Status icons differ in container shape and always come with words (1.4.1).
- `mirrorInRtl` decided per icon with a reason; check, status, search, clock, charts and objects never mirror.
- No text in any icon (1.4.5). No flashing or self-animation (2.3.1, 2.2.2).
- Every icon in the gallery has 0 axe violations (`wcag2a`..`wcag22aa`) in every theme.

### i18n strings

One label key per icon that may be used meaningfully, `icons.<name>` in all 5 locales, overridable per provider and per instance. Proposed by `iconographer` in the inventory; the engineer adds the locales.

## Tasks

Batches are 8–12 icons of one family. Parallel briefs never touch the same file: `iconographer` owns `svg/` and the spec, `component-engineer` owns everything else.

- [ ] 1. **Library spec** (`iconographer` → `ux-designer` review): `docs/design/icon-library.md` with the parts kit, optical rules, file format, the inventory of 150+ names across the families in the skill's taxonomy, cut to what components and e-services need. Maintainer approves the inventory.
- [~] 2. **Package scaffold** (done: package, generator, subpath exports, test; open: AGENTS.md repo-map line, `docs/architecture.md` line, "nothing outside the package" import check) (`component-engineer`): `packages/icons` in the workspace, AGENTS.md repo map and `docs/architecture.md` line, generator from `svg/*.svg` to typed modules, subpath exports, `sideEffects: false`, import check that nothing outside the package is pulled in.
- [ ] 3. **Checker and contact sheet** (`component-engineer`): script that fails on the §6.1 rules (allow-listed elements, forbidden attributes, 0.25 grid, live area, angles) and renders a contact sheet at 16/20/24/32 in light, dark and greyscale. Wire as `vp run icons:check` once approved.
- [~] 4. **Pilot batch** (25 built-ins redrawn and in Storybook; Family 1 and review pending) (`iconographer`): the 25 built-ins re-expressed as SVG files (proves the pipeline reproduces today's drawings), then Family 1 (direction, 14). `ux-designer` reviews the contact sheet; drift decisions made before scaling.
- [ ] 5. **Batches** (`iconographer`, one family per spawn, contact sheet regenerated and compared against the pilot after each): actions, status, controls, documents, communication, people, time, places, money and case handling, health and social care, learning and work, mobility and environment, safety and civic, language and access, data.
- [ ] 6. **Gallery story and docs page** (`component-engineer`): every icon in `Components/Icon` gallery, LTR and RTL, forced colours; docs page lists name, meaning, label key, RTL; Docs shows how to register and tree-shake.
- [ ] 7. **i18n** (`component-engineer`): label keys in all 5 locales, `vp run i18n:check`.
- [ ] 8. **Review**: `accessibility-reviewer` on the diff of each batch's gallery and on the package; `ux-designer` on the final contact sheet.
- [ ] 9. **Record**: `docs/roadmap.md` line, skill `api-conventions` Register section (icons package), the `iconography` skill if a rule changed.

## Gates (orchestrator, scoped)

`vp check <files>` → `vp test run <gallery story and any package test>` → `vp run i18n:check` → `vp run theme:check` (only if a token changes; none planned). The icon checker is part of the story project until `icons:check` is approved.

## Tests

Behaviour and requirements only. The pilot covers: generated modules in sync, no stale modules, `parseIcon` rejections; the inventory/label-key/mirror-decision tests arrive with the inventory (Tasks 1 and 7). The package test: every file in `svg/` becomes a module, no duplicate names, every name has an inventory row and a label key, every entry has a mirror decision. The rule checker (Task 3) proves the drawing rules. The gallery story proves axe and RTL. Visual weight and recognition are judged on the contact sheet by a person, not asserted.

## Risks

| Risk                         | Mitigation                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Style drift across 150 icons | Parts kit, ink-density band, pilot batch, contact sheet after every batch     |
| Metaphors that don't travel  | Metaphor rules in the skill; `ux-designer` review; recognition test `pending` |
| Bundle weight                | One module per icon, `sideEffects: false`, subpath exports                    |
| Name churn                   | Inventory approved before drawing; names are public API once shipped          |
