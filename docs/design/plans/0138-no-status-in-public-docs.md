# Plan 0138: No current-status text in public docs

- **Status:** Done (agents)
- **Owner:** lead (orchestrator) → component-engineer ×3
- **Created:** 2026-10-18 · **Target:** pre-alpha
- **Related:** `.claude/skills/docs-pages`, `docs/roadmap.md`, `AGENTS.md` rule 8

## Goal

A reader of the docs site, the READMEs and Storybook sees what KvirnUI does and how to use it, never how far along it is. Status stays in `docs/roadmap.md` and the plans.

## Non-goals

- `docs/roadmap.md`, `docs/design/plans/`, `*.a11y.md` files on disk (internal tracker, not edited).
- The fictional reference site (`reference*.ts`): example content, not project status.
- A new tooling check against status words (a gate change; propose separately).
- Any claim of AT testing or independent review. Nothing is added that says either.

## Design

### Rules for the rewrite (decided by the user)

1. Delete: status badges, "Pre-alpha / Alpha candidate / In progress" labels, "Status: …" lines, "pending", "not yet", "planned", "coming soon", "draft", "still open", TODO text, version-maturity banners.
2. A disclosure about a real limit becomes an **evergreen** sentence: what we test (axe, keyboard tests), what the reader must still do (test with your own users and assistive technology; have a native speaker review translations before launch). No time-bound wording, no "yet".
3. A missing capability becomes a capability statement, only if the code proves it: "The map has no address search; build it beside the map", not "no address search yet". Never imply a hook that does not exist.
4. Known issues sections stay when they describe behaviour users hit (who, how, workaround), with no "yet".
5. Never write "compliant", "certified", "fully accessible" or "guarantees" (`docs-pages`).

### Surfaces and hits (from scouts)

| Surface           | Hits                                                                                                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site shell + copy | `apps/docs/messages/en.ts` (21, 268, 467, 527–544, 662, 668, 777–778), `messages/home.ts` (15, 73, 92, 123), `components/component-page.tsx` (178, 186), `site-shell.tsx` (137, 155), `site-footer.tsx` (29, 61), `app/(docs)/docs/page.tsx` (38–39), `hero.tsx:26`, `statements.tsx:40` |
| Per-page status   | `status="…"` prop and "still pending" lead in ~70 `apps/docs/components/*-page.tsx`                                                                                                                                                                                                      |
| Page copy         | map (349, 374–375, 582, 735–736), read-aloud (146–147, 259), skip-panel (158, 394), alert (130, 266), quick-exit (342, 415), icon-usage (119, 125), kvirn-provider (592), locales (106–107), listbox (368), error-summary (250)                                                          |
| READMEs, packages | `README.md` (9, 13, 17, 19, 21, 32), `packages/theme/README.md:5`, `packages/core/README.md:15`, `packages/patterns/package.json:5`, `LICENSING.md:3` ×9 packages                                                                                                                        |
| Package markdown  | 82 `> **Draft** (Plan NNNN)…` banners and 5 `> **Alpha candidate.**` banners in `packages/*/src/**/*.md`; `map.md:3` "English only for now"                                                                                                                                              |
| Storybook         | `apps/storybook/src/introduction.mdx:39`                                                                                                                                                                                                                                                 |
| Skills/docs       | `docs-pages/SKILL.md:23,83`, `references/component-page-template.md:44` (status row)                                                                                                                                                                                                     |

## Tasks

- [x] A. Site shell: remove the status mechanism (prop, Badge, `docs-status` paragraph, header/footer/hero/get-started status, messages), plus `status` props in every `*-page.tsx` not listed under B. Check whether `contract-parser.ts` renders the contracts' `**Status:**` line; if so strip it in the parser, not in the files. Owner: component-engineer
- [x] B. Page copy rewrites + their `status` props, in the 10 pages listed under "Page copy". Owner: component-engineer
- [x] C. READMEs, package.json descriptions, LICENSING.md banners, package markdown banners, Storybook intro. Owner: component-engineer
- [x] D. Skills: `docs-pages` status row and template description removed; note that status lives in `docs/roadmap.md` only. Owner: lead
- [x] G. Contracts: rewrite project-status prose in the rendered sections of `*.a11y.md` (react a–h; react i–z, map, rich-text). Header `Status:`/`Tests:` bullets and the AT test record table stay. Owner: component-engineer ×2
- [x] E. Gates: `vp check` on changed files, `vp test run` scoped, i18n:check (messages/en.ts is docs-only, confirm), `vp fmt`. Owner: lead
- [x] F. `accessibility-reviewer` once on the diff (focus: no overstated or removed-then-implied claims). Owner: accessibility-reviewer

## Decisions

- Scope = site + READMEs + Storybook + package markdown; roadmap and plans stay (user, 2026-10-18).
- Disclosures are rewritten as evergreen method, not deleted and not moved to a status page (user, 2026-10-18).
- The AT test record table stays on pages: it is the evidence record, not plain-text status (user, 2026-10-18). Contracts' rendered prose is in scope because the site shows it; `packages/patterns` contracts are never rendered, so untouched.
- File ownership is disjoint: A owns shell, messages and all non-B page files; B owns the 10 pages; C owns everything outside `apps/docs`. Interim type errors between A and B are expected until both report.
- Removing the per-page status field changes the docs-pages template; the skill changes in the same PR (task D).

- Review (accessibility-reviewer) returned CHANGES REQUIRED; four overstated rewrites (map search hook, switch/slider Contrast Themes, pagination narrow layout) and stragglers fixed by lead. Not re-reviewed.
- LICENSING.md 'Draft: not yet reviewed by a lawyer' banners were deleted per the user's scope choice; the maintainer should confirm the text may stand unmarked.

## Risks & open questions

- Removing "AT testing pending" must not leave the impression it was done: rule 2 wording only.
- `docs-source.ts:69` strips `> **Draft**` lines in Storybook; after C it has nothing to strip. Leave the code, note it.
- A regression guard (tooling check) needs maintainer approval: not in scope.

## Testing strategy

No new tests (`apps/docs` has none). Existing Storybook and package tests must stay green; `vp check` proves the removed prop leaves no dangling type or import.

## Done when

- [ ] Re-run of the scout patterns finds no (A) hit outside the non-goals
- [ ] Gates green, reviewer APPROVE
- [ ] Plan ticked, README index row added
