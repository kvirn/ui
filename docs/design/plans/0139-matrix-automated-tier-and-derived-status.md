# Plan 0139: Automated tier, `n/a` rows and a status derived from the matrix

- **Status:** Done (agents)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-18 · **Target:** pre-alpha
- **Related:** Plan 0138 (status wording removed), `docs/accessibility.md` §Assistive technology matrix, `apps/docs/lib/contract-parser.ts`

## Goal

A component page shows how well it is tested without any hand-written status. The AT test record gets a new first tier, **Automated**, that counts the regular tests we already run (Vitest browser tests, axe on every story in four themes). A row that cannot apply to a decorative component is `n/a` with a reason. The page's status word and counts are computed from the table.

## Non-goals

- No new dependency, no HTML validator (maintainer decision 2026-10-18). Markup validity is covered by axe's structure, name and id rules plus the component's own role/state tests.
- No change to the Core and Release rows, the human-check rule, or "agents never write a human check".
- No new gate tool. A tooling check that "pass" rows name real tests is a follow-up.

## Design

### Table shape (same columns, parser unchanged for headers)

`| AT + browser + OS | Agent check | Human check | Result | Notes |` with three bold tier rows, in this order:

| Tier row                                  | Rows (label → what proves it)                                                                                                                                                                                                                                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `**Automated (re-runnable tests)**`       | `axe, WCAG 2.2 A and AA, every story, 4 themes` · `Markup and ARIA (roles, names, ids, states)` · `Keyboard contract rows (Vitest browser)` · `Focus order and management` · `Display modes (forced colours, 320px reflow, text spacing, reduced motion)` (Button and SkipPanel only have the sweep, others stay `pending`) |
| `**Core (required for beta)**`            | unchanged                                                                                                                                                                                                                                                                                                                   |
| `**Release (before 1.0 and each minor)**` | unchanged                                                                                                                                                                                                                                                                                                                   |

Automated rows: Human check is `n/a` (a person is not required), Agent check is `pass` or `pending`, Notes name the test file or story (`button.test.tsx`, `Keyboard` story). `pass` only when a named test re-runs green.

### Cell vocabulary

`pending` · `pass` · `agent-verified` (agent only, Core/Release) · `n/a` (needs a non-empty Notes reason; the reviewer must agree; `ContractError` if Notes is empty).

### Derived status (computed in the parser, shown in the page header facts)

Per tier: done = rows whose Result is `pass` or `n/a`, total = rows. Counts shown as `Automated 5 of 5, Core 0 of 8, Release 0 of 2`. One word, the highest that holds:

| Word             | When                                                   |
| ---------------- | ------------------------------------------------------ |
| (none)           | Automated tier not all done: counts only               |
| `Automated`      | every Automated row done                               |
| `Agent-verified` | Automated done and every Core row has Agent check done |
| `AT-verified`    | Automated done and every Core row has Result done      |
| `Release-tested` | AT-verified and every Release row Result done          |

Added rule (reviewer finding, lead decision 2026-10-18, maintainer may overrule): `AT-verified` and `Release-tested` also need at least one row in that tier with Human check `pass`; `Agent-verified` cannot come from an all-`n/a` Core tier. A tier of only `n/a` rows shows `Core n/a` / `Release n/a` in the counts and earns no word (the word stays at the highest one that holds, `Automated` if that tier is done).

No hand-written status anywhere; the `**Status:**` header bullet stays internal and unrendered. The words replace `alpha`/`beta` on public pages; `docs/roadmap.md` keeps its internal ladder, mapped in one line.

### Which components get what

- Interactive components: all rows apply; Automated rows `pass` only where the evidence exists today (stories exist → axe row; `tooling/keyboard-docs` green for the contract → keyboard row; `expectNoA11yViolations` in the component test → markup row).
- Decorative or static (Divider, Stack, Container, VisuallyHidden, Kbd, Badge, Prose, Heading, List, EmptyState, ...): human AT rows may be `n/a` with a reason such as "native `<hr>`, nothing to operate"; Windows Contrast Themes and Keyboard/zoom/reflow rows stay unless the component has no visible or focusable part. Component-by-component, reviewed.

## Tasks

- [x] A. Definitions: `docs/accessibility.md` (tiers, `n/a`, derived status, "When a row passes"), `AGENTS.md` gate 6 wording, `docs/roadmap.md:3` ladder mapping, `accessibility` skill contract template, `docs-pages` skill and `docs-writer` (status is derived, shown from the table). Owner: component-engineer
- [x] B. Parser, view and messages: `apps/docs/lib/contract-parser.ts` (tier detection by label prefix, `n/a` validation, status computation, export `deriveStatus`), `contract-sections-view.tsx` and `component-page.tsx` (word + counts in the header facts), `messages/en.ts`. Owner: component-engineer
- [x] C. Contracts: add the Automated tier to every rendered contract (react, map, rich-text), fill `pass`/`pending`/`n/a` from evidence, never guess. Split by directory. Owner: component-engineer ×2
- [x] D. (gates green; reviewer findings fixed, not re-reviewed) Gates, then `accessibility-reviewer` once (is any `pass` or `n/a` unproven?)

## Decisions

- Status is computed from the table, shown as tier counts plus one word (user, 2026-10-18).
- `n/a` is a valid Result with a required reason (user, 2026-10-18). Changes gate 6 and `docs/accessibility.md` in the same change.
- No HTML validator: the user chose to count the existing test suite as the Automated tier instead (2026-10-18).
- Parser (task B): bold rows other than Automated, Core and Release (`**Component-specific**` in route-focus, one-time-code, listbox) are neither counted nor validated. `ComponentPage` reads the status from its `contract` element, so no page edits. Header fact is "Testing".
- Row 4 is labelled `Focus order and management`: no test proves a visible focus ring except the Display-modes sweep, so "visible" is claimed only there.
- `n/a` for Core/Release human rows is a separate pass after C, reviewed per component; C touches only the Automated tier.
- C results: 75 contracts got the Automated tier; Display modes `pass` only for button and skip-panel; Keyboard rows naming tests in a sibling file count as `pass` because `tooling/keyboard-docs` is green; route-focus axe row cites `focus/route-focus.stories.tsx`; kbd and stepper Markup `pass` rests on attribute-set assertions plus axe (reviewer to confirm).
- Review fixes: tier renamed `Automated (re-runnable tests)` because the four display-mode sweeps are opt-in, not in CI (they were run by hand 2026-10-18: 35/35 green each); provider Display modes and phone-input Keyboard set to `pending`; static components' Keyboard `n/a` became `pass` citing a Tab test; parser rejects forged rows and counts Component-specific rows in Core; word `Verified` became `AT-verified`.
- Result: 5 of 77 contracts reach the word `Automated`; the rest wait on the Display modes row, which only Button and SkipPanel have a sweep for.
- Keeps Plan 0138: no authored status text; the AT table stays on pages.

## Risks & open questions

- `pass` on an Automated row without a named test would overstate. C must cite the file; the reviewer samples.
- Display-modes row is `pending` for all but Button and SkipPanel, so few components reach `Automated` until the sweeps widen. Honest, and a prompt to extend `sweepExclude`.
- Any contract with a custom table shape fails the build: C runs the parser over all contracts (`/tmp/parse-all.ts` approach).

## Testing strategy

`apps/docs` has no tests. `deriveStatus` is pure; put it in a small module and cover it with a `tooling/` or package test only if the maintainer wants one (it would be new test surface in the docs app: not added). Verify by parsing all contracts and by `vp check`.

## Done when

- [ ] Every rendered contract has the Automated tier and parses
- [ ] Page header shows word + counts; no hand-written status remains
- [ ] Gates green, reviewer APPROVE, docs updated in the same change
