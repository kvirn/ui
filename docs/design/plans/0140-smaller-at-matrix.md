# Plan 0140: A smaller AT matrix (most common screen readers only)

- **Status:** Done (agents)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-18 · **Target:** pre-alpha
- **Related:** Plan 0139 (Automated tier, derived status), `docs/accessibility.md` §Assistive technology matrix

## Goal

Human testing is manageable: about 5 human rows per component instead of 10, and none for components with nothing to operate or announce. The matrix keeps the screen readers most people use.

## Non-goals

- The Automated tier, `n/a` rules and derived status (Plan 0139) stay as built.
- No change to the rule that agents never write or claim a human check.
- No claim that dropped rows were tested.

## Design

### Rows kept (maintainer decision 2026-10-18, most common AT per the WebAIM screen reader survey)

| Tier    | Rows                                                                                     |
| ------- | ---------------------------------------------------------------------------------------- |
| Core    | `NVDA + Chrome + Windows` · `VoiceOver + Safari + iOS`                                   |
| Release | `JAWS + Chrome + Windows` · `TalkBack + Chrome + Android` · `VoiceOver + Safari + macOS` |

Dropped: `Windows Contrast Themes + Edge`, `Keyboard only / 400% zoom / 320px reflow` (both fold into the automated Display modes row), `NVDA + Firefox + Windows`, `Narrator + Edge + Windows`, `Dragon / Voice Control`. Record the trade-off in `docs/accessibility.md`: Contrast Themes and zoom are covered by emulated sweeps, not a person on the real setting.

### Static components

A component that renders only native static elements and has no role override, state, live region, focus or key handling gets `n/a` on every human row (Core and Release), with a reason naming that fact. Their Agent check rows (axe, markup test) stay in the Automated tier. Candidates, each confirmed against its contract by the engineer, the reviewer samples: divider, stack, container, kbd, badge, tag, prose, list, icon, heading, address, empty-state, section. Not static: visually-hidden, progress, stepper, kvirn-provider, anything with a role, state or announcement.

### Wording

Notes in the Display modes row must not say "yet": `not swept: the sweeps cover Button and SkipPanel`.

## Tasks

- [x] A. Definitions: `docs/accessibility.md` (matrix table, tiers, trade-off), `AGENTS.md` gate 6 if it names rows, contract template, `docs/roadmap.md:3` if it names rows, docs-pages skill/template, docs-writer. Owner: component-engineer
- [x] B. Contracts, mechanical: in every rendered contract replace the Core and Release rows with the five above (keep Component-specific rows, header bullets and every other section), reword the Display modes "not swept yet" Notes, and fix any prose that names a dropped row. Owner: component-engineer
- [x] C. Static components: `n/a` human rows with reasons, per the candidate list. Owner: component-engineer, after B
- [x] D. Gates, then `accessibility-reviewer` once (every `n/a` reason true; no row implies a human check)

## Decisions

- Most common rows only, 2 Core + 3 Release (user, 2026-10-18). Contrast Themes and keyboard/zoom/reflow fold into Display modes.
- Static components: all human rows `n/a` with a reason (user, 2026-10-18).
- Gate 6 and `docs/accessibility.md` change in the same change.
- AT-verified and Release-tested need a human pass; all-n/a tiers show n/a (reviewer finding, lead decision 2026-10-18, maintainer may overrule).

## Risks & open questions

- A static component whose contract has a role or state it forgot: the reviewer's sample is the check.
- Display modes stays `pending` for most components, so few reach the word `Automated`. Open from Plan 0139: extend the sweeps and run them in CI (gate change, user's call).

## Done when

- [ ] Every rendered contract has the 2 + 3 rows and parses; static components `n/a` with reasons
- [ ] Docs match; gates green; reviewer APPROVE
