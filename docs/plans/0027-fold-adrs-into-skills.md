# Plan 0027: Fold the ADRs into skills and docs, then delete them

- **Status:** Done
- **Owner:** Maintainer / Claude
- **Created:** 2026-10-04 · **Target:** M1
- **Related:** [Appendix: fold-in inventory](0027-adr-fold-inventory.md), Plans 0028–0030

## Goal

An agent or a contributor learns how KvirnUI works by reading current facts in one place per topic, not by replaying 63 decisions with their history. Git is the history.

## Non-goals

- No change to code behaviour. Only docs, skills, agents, comments and hook messages change.
- No rewrite of what the rules say. A fact moves, in the present tense, and stays as strict as before.
- No renumbering of plans. Plans stay. They are the working record of a change in flight.

## Background

- **The ADRs:**
  - `docs/adr/` holds 63 ADRs: 18 accepted, 2 superseded, and the rest proposed and never ratified.
  - Many amend each other: ADR-0034 is superseded by 0059, and 0048 supersedes part of 0042.
  - About 1,750 `ADR-NNNN` references sit in about 355 files.
- **Agents load the ADRs to learn the rules,** and get the history with them.
- **Nothing reads `docs/adr/` as a path.** That includes the scripts, CI, hooks, Storybook and the docs site. The only risk is dangling references (appendix, section 4).
- **The maintainer's direction** (2026-10-04): "our git is source … fold important stuff like preferences into the agents/skills, new skills even, and delete the ADRs."

## Design

### Where facts live

One home per topic, written in the present tense, with no "we decided" and no dates.

| Home                                                                                       | Holds                                                                                                                                                 |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                                                                | The working agreement, hard rules and gates (as today, minus the ADR wording)                                                                         |
| `docs/architecture.md`, `engineering.md`, `accessibility.md`, `compliance.md`, `vision.md` | The human-facing reference: package layout, tooling and CI, the AT matrix, legal claims and scope                                                     |
| `DESIGN.md`                                                                                | The visual language and tokens                                                                                                                        |
| Existing skills (accessibility, keyboard, testing, storybook-docs, design, regulations)    | Procedures, with the facts each needs                                                                                                                 |
| **New skill `api-conventions`**                                                            | Naming (Plan 0028), parts and `render`, `mergeProps`, hooks that block handlers, messages and `TextMessage`, registries, dev warnings, `'use client'` |
| **New skill `forms`**                                                                      | Field and Fieldset wiring, Prose and Hint (Plan 0029), markers, masks, numbers and dates, OneTimeCode, InputGroup, FileUpload validation              |
| **New skill `overlays-and-lists`**                                                         | Native popover, the dismissable layer stack, Listbox, Combobox and Autocomplete, rich options (Plan 0030), virtualization, Table                      |
| **New skill `theme-css`**                                                                  | Editing `theme.css` and `reset.css`: layers, tokens, class naming, the raw-colour rule, contrast pairs, forced colours, prose boundaries              |
| Agents (`.claude/agents/*.md`)                                                             | Each agent's own role rules and the maintainer's preferences that bear on its work                                                                    |
| Component `<name>.md` and `<name>.a11y.md`                                                 | Facts about one component only                                                                                                                        |

- **Maintainer preferences** (rows marked PREF in the appendix) go into the skill or agent where they apply, in a short "Maintainer preferences" section. That covers naming taste, copy style and visual choices.
- **Unratified proposals:**
  - A proposed ADR whose rule matches the code is folded as a fact.
  - One that doesn't match the code (DateInput, ScrollArea) becomes a roadmap row, not a fact.
- **Conflicts** (appendix, section 5): the fact follows the code. Each conflict is fixed in the doc, or becomes a roadmap or plan item. Don't paper over one.

### What replaces "write an ADR"

A decision changes the fact in its home, in the same PR, with the maintainer's approval. The reason goes in the commit body and the PR description, where git keeps it. A change large enough to plan records its options and the chosen one in its plan.

The ~40 rules that say "needs an ADR" (appendix, section 3) become one of:

- **"Needs the maintainer's approval, and the owning skill or doc updated in the same PR"**: new dependency, gate change, APG deviation, token change, waiving a blocking review finding.
- **"Record it in the plan"**: decisions taken during implementation.

The plan template's `Related: ADR-NNNN` becomes `Related: plans, skills`. The design spec template drops its ADR column. The a11y contract template's `Deviations: none or ADR-NNNN` becomes `Deviations: none, or the rule in the keyboard skill that allows it`.

### References

- In code, tests, config, hooks and stories:
  - Replace `ADR-NNNN` with a pointer to the home, for example `(api-conventions skill: render)`, where the comment needs the rule.
  - Otherwise drop the tag and keep the sentence.
- Hook messages that cite ADR-0012 and ADR-0057 cite the AGENTS.md section instead.
- In docs, skills, plans, design specs and pending changesets, do the same. Done plans are history: their ADR tags are dropped mechanically.
- Fix the broken links: `docs/README.md`, the `../adr/` links in the 13 design specs, `AGENTS.md`'s repo map, and `keyboard/SKILL.md:82`.
- **Enforcement:** a tooling test fails on any `ADR-\d{4}` or `docs/adr` in the tree. This plan file and its appendix are exempt until they are closed.

### Accessibility contract (draft)

No change to any component. The a11y rules move from ADR-0039 and others into the accessibility and keyboard skills word for word in substance, so no gate gets weaker. accessibility-reviewer checks the moved a11y rules against the deleted ADRs before the deletion lands.

### i18n strings

None.

### Theming surface

None.

## Tasks

Run this before Plans 0028 to 0030, so they record their rules in the new homes. Do it on its own branch, in two PRs.

**PR 1: fold**

- [x] Write the four new skills (front matter with `description` and `when_to_use`, as the existing skills have), and add them to the skill tables in AGENTS.md and CLAUDE.md
- [x] Fold every appendix row into its home, and tick the row off in the appendix
- [x] Add maintainer preferences to the skills and agents
- [x] Rewrite the "needs an ADR" rules (appendix, section 3), and the plan, design-spec and contract templates
- [x] Resolve the conflicts in appendix section 5. Fix the doc, or add a roadmap row (DateInput, ScrollArea, the CI coverage and budget claims)
- [x] Remove `packages/blocks` from the repo map. It doesn't exist
- [x] accessibility-reviewer: confirm that no a11y or keyboard rule was lost or weakened

**PR 2: delete**

- [x] Replace or drop every `ADR-NNNN` reference (about 1,750 matches, mechanical, done by area)
- [x] Delete `docs/adr/` and the appendix
- [x] Add the enforcement test
- [x] Update `docs/plans/README.md` ("Plans describe how. Decisions live in the skills and docs they change.") and `docs/design/README.md`

## Risks & open questions

- **Concurrent work.** Another session is adding ADR-0063 (the test-runner agent), along with changes to AGENTS.md, CLAUDE.md and the testing skill. Land that first, and fold ADR-0063 in PR 1.
- **A rule lost in the move.** Mitigation: the appendix is a row-by-row checklist, and the reviewer compares it against the ADRs before deletion. Git keeps the originals.
- **Skill sprawl.** Ten skills load by description. Keep each new skill's description sharp, and add rows to the AGENTS.md workflow table so the right ones load.
- **Dev dependencies.** Rule 6 is ambiguous about them. Proposed fact: a runtime dependency needs the maintainer's approval, and a dev dependency is recorded in the PR description.

## Testing strategy

- `vp check` and `vp test run` on the touched code files. Comment edits must not change behaviour.
- The enforcement test.
- A Storybook build: MDX pages may cite ADRs.

## Rollout

Internal only, so no changeset. CONTRIBUTING.md tells contributors where decisions live now.

## Done when

- [x] Every appendix row is folded or recorded as "dropped: history only"
- [x] `docs/adr/` is gone, and the enforcement test passes
- [x] All quality gates in AGENTS.md pass
- [x] Plan tasks ticked, `docs/roadmap.md` status updated
