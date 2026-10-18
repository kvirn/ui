# Plan 0124: Icon library (`@kvirn-ui/icons`, 150+ outline icons)

- **Status:** Done for agents (265 icons drawn, reviewed twice, all fixes in; open for people: recognition tests, native-speaker labels, AT, the sensitivity review, the `icons:check` gate, the forced-colours stories, the built-ins sync)
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

| Question | Chosen                                                                                                                                                                            | Why                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Home     | New package `@kvirn-ui/icons`, one module per icon. The 25 built-ins stay in react as base layer. (Superseded by Plan 0128: react draws nothing; the defaults are library icons.) | Tree-shaking; 150 path strings don't belong in every consumer's react bundle; own gallery. |
| Source   | `packages/icons/svg/<name>.svg` plus a generator (no dependency) emitting typed modules.                                                                                          | The designer reviews real SVGs and a contact sheet; the checker can read files.            |
| Variants | Outline only, 24 grid.                                                                                                                                                            | One weight rule is the smallest surface to keep consistent. Fix 16px by redrawing.         |

Taken during implementation (lead, 2026-10-16):

- Start with a construction grid (`packages/icons/grid/`) and the 25 built-ins redrawn as the pilot; showcase in Storybook only, no docs-site page yet. The package is public (maintainer, 2026-10-18); human review checks stay pending.
- Generated modules are committed (Storybook and the workspace alias read `src`); a package test fails if they drift from `svg/`.
- Colour in the stories is a story-only control on a wrapper, as the Icon `Colors` story does. Icon takes no colour or variant prop (AGENTS.md rule 14, `use-icon.ts` omits colour); a colour class would be a new theme/API decision for the maintainer.
- Engineer decisions: `delete` is reserved, so its module exports `deleteIcon` (registry key stays `'delete'`); a hand-written `src/create-icon.ts` wraps shapes like `createBuiltInIcon`; the generator's root `<svg>` check is strict (viewBox, fill, stroke, stroke-width, linecap, linejoin exact; only `xmlns` extra); `all.ts` also exports `LibraryIconName`; stories reuse `kv-story-icon-gallery` and `kv-story-icon-cell` from `preview.css`; devDependencies `react`, `@types/react`, `vite-plus` are existing catalog entries, no new dependency. `packages/icons` added to the node test project glob (`vite.config.ts:262`).
- Maintainer, 2026-10-16: ink density is a per-class band (open glyph, object) of ±40% and a warning, not a gate; single segments and dots are exempt from the originality grep; the landscape keyline (x 3–21, y 5–19) joins `icon.md` §6.1; syncing the react built-ins to the redrawn 25 is a separate later change.
- Generator emits `vp fmt`-stable text (100 columns); `scripts/generate.d.mts` types it for the test.
- Maintainer, 2026-10-16 (after the design review): a meaningful or status icon is 20px or larger and 16px is decorative only; other angles than 45/90 only for named kit parts at 2:1, 1:1 or 1:2 slopes (`icon.md` §6.1). Label keys are camelCase (`icons.chevronDown`); trigger-part chevrons and arrows have no default label; `external` uses `link.newTabNotice`. Story colours follow `icon.md` §6.3 (no `secondary`).
- Maintainer, 2026-10-16 (batch 2: toolbar, rich text and map icons, about 70): no letters or numerals in any icon, so bold, italic, underline, strike, heading and numbered-list are drawn abstractly; the library marker is an outline pin drawn as ONE path (teardrop and ring as two subpaths) so the end product can fill it with CSS (`fill: currentColor; fill-rule: evenodd`) and keep the hole; the large dot (stroked circle r 0.5, painted 2.5 wide) is approved for `more`, pagination and bullets. The map keeps its own solid marker. Map arrows are compass names (`arrow-north/south/east/west`), never mirrored; `arrow-up`/`arrow-down` alias north/south.
- Lead, 2026-10-16 (inventory review, `icon-library.md` "Inventory, batch 2", 60 icons in families A–F): cut heading, paragraph, subscript, superscript, horizontal-rule, compass and others that need a letter, numeral or colour. Accepted: tally ticks for numbered-list (recognition `pending`); an inner arm of run 3.5 for code-block, indent and merge/split; the badge cut for pin-add (outline broken, no CSS fill needed); slopes 2:1 (italic lean bar) and 1:2 (layer sheet, folded map); large dot for drag-handle, more-vertical and locate's centre; checklist does not mirror; `remove` is the name, `minus` its alias; no left/right aliases (the map's arrow-left/right map to west/east when the map is synced). Drawing spawns write only their SVG files and report; they don't edit `icon-library.md` (one consolidation at the end), and each renders into its own `/tmp/kv-icons-<family>`.
- Lead, family B: accepted a third ink class "lines" (line-built glyphs: menu, lists, alignment; warning only); tally ticks are 2.5 long (row ±1.25), not 3 (kit change for the consolidation); checklist does not mirror (a check mark must not flip), so its markers stay on the left in RTL: `ux-designer` reviews this at the end.
- Lead, family E (map navigation, 9 drawn): `pin` proven with the CSS fill (hole stays open at 16px); the target ring is r 6.5 so `locate-off` can keep its host whole and reduce the slash to an inner bar (kit part "inner bar", precedent eye-off); a badge may shift its host by up to 3 units (pin-add) when the host drawing is unchanged; `arrow-east`/`arrow-west` are byte-identical twins of arrow-forward/back that never mirror.
- Lead, family A (text formatting, 10 drawn; bold/italic as a bar between two text lines, rejected candidates in /tmp/kv-icons-A/candidates for you to compare): the code-block brackets use a bracket arm of run 3 (run 3.5 fused into a hexagon at 16px); indent/outdent and table merge/split keep the inner arm of run 3.5 unless their pairs fail. New kit parts for the consolidation: Highlighter, Baseline `M5 20.5h14`, heavy bar, lean bar `M7 9h13l-3 6h-13Z`, word box 14 × 8, drop r 5.66. `quote` and the other mirrors go into `mirror-in-rtl.json` when I regenerate.
- Lead, family C1 (insert and history, 8 drawn): accepted the kit changes (chain-link end arcs r 4.24, paper clip runs 4.5 apart, scissors crossing at y 12.5, image sun as the vertex-handle ring r 1.5, which becomes an approved kit part); undo/redo joins the mirror list; undo/redo ink is +73% over the open median and stays a warning (loop arrows are their own case in the consolidation).
- Lead, family D (toolbar and controls, 10 drawn): a stroked circle r 0.5 leaves a hole at stroke 1.5 and 2 (seen in Chromium and Firefox, WebKit untested), so the large dot is drawn as that circle plus a plain dot in the same path (`M7 11.5a.5 .5 0 0 1 0 1 .5 .5 0 0 1 0-1ZM7 12h.01`); applied to `bullet-list` and `locate` by the lead, `more`, `more-vertical` and `drag-handle` have it. Settings is an 8-tooth gear (sliders rejected: they read as filter). A "dots" ink class covers `more` (-57% against open) for the warning; `settings` +44% is accepted like `language`. `sort`, `fullscreen` and `fullscreen-exit` are class "lines".
- Lead, family C2 (table, 7 drawn): accepted table rules at y 9 and 14 (the badge needs 3.5 clear), add hosts 1 unit above the remove hosts (centring trade-off), merge drawn as two arrows into a broken column, `table` +51% and `table-merge` +46% ink as warnings; `table-column-add` and `table-column-remove` mirror. `code-block` keeps its run-3 bracket arm (named exception), every other inner arm is 3.5.
- Lead, review of batch 2: `accessibility-reviewer` APPROVE (no blockers; forced-colours and AT checks of the library gallery are still pending, not run). Open for `ux-designer`: checklist's markers stay left in RTL, and the badge of column-add/remove mirrors while row-add/remove does not. Task 6 still open: an RTL story for the 16 mirrored library icons and a forced-colours run.
- Lead, ux-designer review of batch 2 (CHANGES REQUIRED, no blockers): `table-column-add` and `table-column-remove` leave the mirror list, so no badged icon ever mirrors (supersedes the family C2 note); italic takes the 45° candidate and bold's text lines move to y 5.5/18.5 (no more 2:1 lean bar); underline's rule is no wider than its box; table-split is redrawn as the mirror of table-merge; satellite is redrawn with fewer parts; directions drops its end ring for an arrowhead; area keeps three rings; locate-off tries the kit slash. Accepted: terrain peaks 2:1 as a named part, settings as a named exception at stroke 2, zoom-to-fit stays. Recognition test scope (pending): bold, italic, clear-formatting, numbered-list, underline, zoom-to-fit, directions, locate-off. Open question for the maintainer: a direction-specific drawing for checklist in RTL (the registry can't express it today).
- Lead, final state of batch 2: `satellite` dropped (five redraws read as "0o0" or a chain; `terrain` and `map` remain; the option's label names the type); 84 icons in the package (25 pilot, 59 new); `ux-designer` re-check APPROVE; `accessibility-reviewer` APPROVE (before the redraws, which change no rule it checked). Pending, not run: recognition tests (bold first), forced-colours and AT checks of the gallery, an RTL story for the 16 mirrored icons, i18n locales for the label keys, syncing the react and map and rich-text built-ins to these drawings, and the remaining families of the 150.
- Lead, 2026-10-16 (municipal research, two rounds): `docs/design/icon-municipal-candidates.md` (research, 180 names) and `docs/design/icon-wanted.md` (verified against `catalog.json` and `icon-catalog.md`): 39 new icons proposed (13 priority 2, 26 priority 3) plus 3 pending the `school`/`education` split, 91 already covered, 17 already cut by the maintainer, 33 words only. Nothing is added to `catalog.json` until the maintainer approves the list (open: the priority-2 rows, the new category `leisure-culture`, the `school` split, the `building` container).
- Maintainer, 2026-10-16: **no icon budget** (v1 has a vague target, not a number). Draw the whole catalogue: the 99 planned and the 42 added from `icon-wanted.md` (13 priority 2, 26 priority 3, plus `school`, `preschool`, `university`). New category `leisure-culture`; `school` leaves the aliases of `education` (`university` is the cap). Cuts in `icon-catalog.md` stay cut. No new parts-kit part or grid change without the maintainer. Run several `iconographer` spawns in parallel (3 at a time), one batch each, writing only `svg/*.svg`; the lead runs `generate` once per wave. Tests stay small and targeted: `icons.test.ts` per wave, the gallery story file once at the end. Batches: T transit (11), E environment and utilities (13), C city, places and leisure (15); then people and identity, documents and communication, care and education, safety and civic, language and access, time and money, direction/actions/status/interface/data. The gallery shows the icons grouped by catalogue category.
- Maintainer, 2026-10-17: the named 1:2 and 2:1 slopes and the 28 degree points of `new` are accepted (kit parts and slopes in `icon-library.md` §2 'Proposed' become approved). Similar-looking icons are fine and variants will always be needed: no redraw of the whole set, only the most obvious problems. The remaining open design questions (add/remove host rule, building variants, gender-fluid, tolerated near-misses, verb labels, vote/sign-language as words) are left to the agents: `ux-designer` reviews the set and decides what needs feedback, `iconographer` fixes what it flags, `accessibility-reviewer` re-checks. Remaining code to-dos go to `component-engineer`: Icon label wiring (Task 7), gallery RTL story (Task 6), docs-site Icons page. Human checks (recognition tests, native-speaker labels, AT) stay with people.
- Lead, 2026-10-17 (Icon label wiring, a public API addition for the maintainer to confirm): options weighed: (a) `Icon` reads `icons.*` by itself, rejected because it would label icons silently, and most sit beside visible text (a double read, 1.1.1); (b) a new `Icon` prop such as `labelKey`, rejected as a second way to label; (c) chosen: a hook `useIconLabel(name, messages?)` in `@kvirn-ui/react`, used as `label={useIconLabel('city-hall')}`. `Icon` props are unchanged and an icon stays decorative unless the app passes a label. `name` is the kebab-case catalogue name, typed as `IconLabelName` (derived from the `icons` message keys, so a name without a label key does not compile); the result is `string | undefined`. Per-instance override is the second argument (`messages`, the `useMessages` convention), per-provider is `KvirnProvider messages`. No new dev warning: the under-20px labelled-icon warning does not exist in `use-icon.ts`, so none was added either (icon.md §7 is guidance only). Tests: `use-icon-label.test.tsx`.
- Lead, catalogue (`packages/icons/catalog.json` is the source for the docs Icons page, `docs/design/icon-catalog.md` the readable view; 183 icons: 84 drawn, 99 planned in 16 categories): maintainer decided 2026-10-16 that pending, in-progress, blocked, new, attention and help are glyph-only with no container (the four status shapes stay the only containers); `contrast` is a circle with a hatched half, outline only; dark-mode (half-moon disc), help (lifebuoy), sign-language (only if it meets the detail budget and the no-gestures rule at 20px, else cut) and text-size (stepped bars) stay planned and join the recognition test; `navigation` is an alias of `menu` only; `marker` stays the map's own and out of the catalogue. Still to do: an engineer test that keeps the catalogue and `svg/` in sync, then the docs Icons page (menu entry, search, category filter).
- Lead, 2026-10-16 (follow-up list, 23 icons: ambulance police firetruck tram subway government wheelchair gender-male gender-female gender-non-binary gender-fluid tag hashtag direct-message pin-remove cash wallet theatre translate sign-language view-columns skip-next skip-previous): 22 drawn, `sign-language` cut a second time. Aliases added: user, users, commenting, security, save, update, grid, list, time, date, loading, spinner. Brand logos, like, heart and star stay out. Outcomes of the municipal list are in `icon-wanted.md`; the catalogue is `catalog.json` (242 drawn, 17 categories).
- `"."` exports named icons (tree-shakeable); `"./all"` exports `allIcons` and `iconNames` for registries and galleries.

- Maintainer, 2026-10-18: **`easy-read` is reopened** (vital on municipal sites); drawn without letters, one drawing, the label per locale. [Plan 0137](0137-easy-read-icon.md).

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

- [~] 1. **Library spec** (batch 2 inventory first: toolbar, rich text and map, then the rest) (`iconographer` → `ux-designer` review): `docs/design/icon-library.md` with the parts kit, optical rules, file format, the inventory of 150+ names across the families in the skill's taxonomy, cut to what components and e-services need. Maintainer approves the inventory.
- [~] 2. **Package scaffold** (done: package, generator, subpath exports, test, AGENTS.md repo-map line, `docs/architecture.md` entry; open: the "nothing outside the package" import check, no lint rule or test proves it yet) (`component-engineer`): `packages/icons` in the workspace, AGENTS.md repo map and `docs/architecture.md` line, generator from `svg/*.svg` to typed modules, subpath exports, `sideEffects: false`, import check that nothing outside the package is pulled in.
- [~] 3. **Checker and contact sheet** (done 2026-10-17: `packages/icons/scripts/check-gaps.mjs` checks centre-line gaps with eight rules and an exact allow-list, `gaps.test.ts`, clean on all 256; open: the rest of the §6.1 rules (allow-listed elements and attributes are in `parseIcon`; live area, grid and angles are not scripted), the contact sheet, and wiring `vp run icons:check`, which awaits the maintainer) (`component-engineer`): script that fails on the §6.1 rules (allow-listed elements, forbidden attributes, 0.25 grid, live area, angles) and renders a contact sheet at 16/20/24/32 in light, dark and greyscale.
- [x] 4. **Pilot batch** (25 built-ins redrawn and in Storybook, reviewed) (`iconographer`): the 25 built-ins re-expressed as SVG files (proves the pipeline reproduces today's drawings), then Family 1 (direction, 14). `ux-designer` reviews the contact sheet; drift decisions made before scaling.
- [x] 5. **Batches** (2026-10-16, no budget). **All 256 icons of the catalogue are drawn** (220 after the first waves, 22 of the follow-up list below, then 14 add/remove/off variants: V1 person-remove, calendar-remove; V2 document and folder add/remove; V3 mail-add, mail-remove, mail-off; V4 video-call-off, mobile-off; V5 image-add, image-remove, attachment-remove; 8 cut). Cut after real attempts: `building-add`, `building-remove` (no room for the door beside the badge; a 'Building, badged' kit part awaits the maintainer), `phone-off` (the kit slash can't cut the handset), `zoning-plan`, `litter` (now an alias of `waste`), `sign-language`, `vote`, `place-offer` (alias of `mail` with words). Batches: pilot 25; batch 2 59; T transit 11; C city, places, leisure 14; E environment 12; P people 15; D documents and communication 14 (+ `send`, provisional); N1 direction, actions, status 14; N2 interface and data 9; N3 time 8; N4 money 6; L language and access 9; S safety and civic 7; H care and education 16. The lead synced `catalog.json` and `mirror-in-rtl.json` after each report. **Pending the maintainer:** kit parts and named slopes (see Open), the cuts, recognition tests for every new icon.
- [x] 6. **Gallery story** (done 2026-10-16: `Icons/Library` has `Default`, `AllIcons` and one story per catalogue category, 17; its play function proves the catalogue and the generated set agree; `vp test run` on the file 76/76. 2026-10-17: `Rtl` story (23 mirrored icons, `data-mirror-in-rtl` proved) and the docs page `/components/icons` (client search, catalogue-driven) added, `@kvirn-ui/icons` was linked as a workspace dependency of apps/docs (first-party, like the other seven; lockfile +3 lines, `pnpm install --offline`, 2026-10-17) and the page type-checks; not yet opened in a browser or built with Next;. Open: the forced-colours story, which needs the opt-in project config (a gate change)) (`component-engineer`): every icon in `Components/Icon` gallery, LTR and RTL, forced colours; docs page lists name, meaning, label key, RTL; Docs shows how to register and tree-shake.
- [~] 7. **i18n** (done 2026-10-16: `icons` message group, 142 keys in sv fi nb nn en, `icon-labels.test.ts` proves the catalogue and the five locales agree, `vp run i18n:check` green when last run (the key count has grown since). Open: native-speaker check of the labels the engineer flagged (sv Kommunhus, Medborgarkontor, Politiskt sammanträde; fi Luottamuselimen kokous, Varhaiskasvatus, Lukitus avattu; nb/nn Servicetorg, Flyttemelding, Tryggleik, Attvinning); `Icon` stays unchanged; wiring done 2026-10-17 as the hook `useIconLabel(name, messages?)`, see Decisions) (`component-engineer`): label keys in all 5 locales, `vp run i18n:check`. <!-- kv-lang-ok: the labels under native-speaker review are the subject -->
- [x] 8. **Review** (2026-10-17: `ux-designer` design review, `docs/design/icon-library-review-2026-10.md`, CHANGES REQUIRED, all twelve fixes done; `accessibility-reviewer` final review of the whole set, CHANGES REQUIRED with one story blocker (two moving indicators in `LoadingSpinner`), fixed and re-verified by the lead; the gate output is green. Human checks stay open: recognition tests, native-speaker labels, AT, the sensitivity review): `accessibility-reviewer` on the diff of each batch's gallery and on the package; `ux-designer` on the final contact sheet.
- [x] 9. **Record** (2026-10-16): `docs/roadmap.md` Icon library row and the stale keyboard-docs row, `api-conventions` Registries note, AGENTS.md and `docs/architecture.md`, `icon-wanted.md` as the record of outcomes. The `iconography` skill said nothing false, so it is unchanged. Re-record when Tasks 2, 3, 8 close.

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
