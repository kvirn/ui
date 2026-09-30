# AGENTS.md

This is the working agreement for AI agents and humans. It loads every session, so it stays lean: the detail lives in `docs/` and in the skills.

**KvirnUI** is a headless, accessibility-first React library for the Nordic and EU public sector. It follows TanStack's approach: a typed, framework-agnostic core with thin React bindings, and the consumer owns the markup. **The bar is WCAG 2.2 AA on every component. An accessibility regression is a release blocker.**

## Repo map

```
DESIGN.md          visual language: tokens, themes, typography, layout (default theme, blocks, docs)
apps/docs  apps/storybook
packages/core      state machines. NO React, NO DOM at import time
packages/react     useX hooks + X.Root/X.Trigger components
packages/i18n      sv fi nb nn se en
packages/theme     --kv-* tokens, default theme, Tailwind preset
packages/blocks    styled public-sector patterns
packages/testing   a11y test helpers
docs/              vision · architecture · accessibility · compliance · engineering · roadmap · adr/ · plans/ · design/
.claude/           skills, agents, hooks (plain Markdown, readable by any agent)
```

## Commands

Use pnpm only. `vp` is the single CLI. Don't use ESLint or Prettier.

```sh
vp check                    # fmt + lint + types
vp test run [--changed]     # Vitest unit/component + axe
vp run e2e [file] [--project <name>]  # Playwright (no `--` before args)
vp run i18n:check           # all locales complete
vp run theme:check          # token contrast
pnpm changeset
```

## Workflow

1. **Explore.** Read the relevant docs and ADRs, and the closest existing component. Use a subagent for broad searches, and don't edit anything yet.
2. **Plan.** For a new component or any multi-file change, write `docs/plans/NNNN-*.md` from the template, including the draft accessibility contract and the verification steps. For a block, a flow or a visual change, `ux-designer` writes the design spec (`docs/design/`) first and the plan links it. If the user needs to make a decision, ask now. Skip this step only if the whole diff fits in one sentence.
3. **Select.** Pick a workflow from the table below and load its skills.
4. **Execute.** Turn the contract into failing tests first, then implement, and stay inside the plan's scope.
5. **Verify.** Pass every quality gate, and show the commands you ran and their output as evidence.
6. **Record.** Put every decision in an ADR (`docs/adr/`, status _Proposed_). Tick off the plan, update the status in `docs/roadmap.md`, and add a changeset.

| Workflow                 | Skills                                                         | Agents                                                    |
| ------------------------ | -------------------------------------------------------------- | --------------------------------------------------------- |
| New component            | accessibility, testing (+ design for default-theme styling)    | component-engineer → accessibility-reviewer               |
| New block, flow or page  | design, accessibility, testing (+ regulations if legal)        | ux-designer → component-engineer → accessibility-reviewer |
| Visual or token change   | design, accessibility                                          | ux-designer (ADR + `theme:check`)                         |
| A11y defect              | accessibility, testing                                         | component-engineer → accessibility-reviewer               |
| Bug fix                  | testing (+ accessibility if keyboard, focus or AT is involved) | component-engineer                                        |
| Refactor / tooling       | testing                                                        | – (ADR if tooling changes)                                |
| Decision                 | accessibility or regulations, as relevant                      | – (ADR only)                                              |
| Docs, claims, compliance | regulations, accessibility                                     | –                                                         |
| Review a diff or PR      | accessibility, testing                                         | accessibility-reviewer                                    |
| Design review            | design, accessibility                                          | ux-designer (review mode)                                 |

## Skills (`.claude/skills/<name>/SKILL.md`)

| Skill             | Use when                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **accessibility** | Designing, changing or reviewing roles, ARIA, keyboard, focus, announcements, labels, contrast, motion or target size. Also for writing a `<name>.a11y.md` contract           |
| **testing**       | Writing or fixing tests or stories, running gates, or debugging a failure                                                                                                     |
| **design**        | Designing or reviewing anything users see: flows, content, layout, states, tokens and themes, blocks, stories and docs pages. Also for writing a design spec (`docs/design/`) |
| **regulations**   | Any statement about law or conformance, statement, feedback or consent blocks, docs copy, or adding a dependency or external service                                          |

## Agents (`.claude/agents/`)

- **component-engineer** implements a planned change: tests first, then code, then gates.
- **ux-designer** frames the problem and writes the design spec (flow, content, layout, states, tokens, accessibility annotations), and reviews stories, blocks and pages against `DESIGN.md`. It never writes code.
- **accessibility-reviewer** is a read-only review in fresh context that sees only the diff, the plan and the contract. Its blocking findings must be fixed, or waived in an ADR.

## Quality gates

Nothing is done until all of these pass. A Stop hook enforces gates 1–2.

1. `vp check` is clean.
2. `vp test run` passes, with 0 axe violations in every story state (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`).
3. `vp run e2e`: every keyboard-contract row is tested, and the forced-colors, reduced-motion and 320px reflow projects are green.
4. `i18n:check` and `theme:check` pass.
5. The component has a hook, a compound component, stories (every state, plus RTL and forced-colors), and a complete `<name>.a11y.md` that matches the tests.
6. accessibility-reviewer returns APPROVE.
7. The manual AT matrix (`docs/accessibility.md`) must pass before `beta`. **Agents mark this `pending` and never claim it.**

## Hard rules

1. **Never weaken a gate.** No `.skip` or `.only`, no disabled axe rules, no loosened thresholds, no unread snapshot updates, and no `@ts-expect-error` over real errors. If a gate is wrong, write an ADR.
2. **Use native semantics first and follow the APG pattern.** Deviations need an ADR.
3. **`core` stays pure:** no React, and no `window` or `document` at module scope.
4. **No hard-coded visible or announced strings.** Every string exists in all 6 locales and can be overridden per provider and per instance (ADR-0007).
5. **Headless packages ship zero CSS.** State is exposed via `data-*`.
6. **No runtime dependencies other than the sanctioned ones:** React as a peer, and `@tanstack/store` in `core` only, imported only in `core/src/store/` (ADR-0003). Any new dependency needs an ADR.
7. **No telemetry and no third-party network calls,** including in the docs site.
8. **Never claim legal compliance.** Say "designed and tested to meet WCAG 2.2 AA".
9. **Public API changes** need a changeset and a docs update.
10. **Stay in scope.** No drive-by refactors. If the plan is wrong, update the plan first.

## Conventions

- Follow the API conventions in `docs/architecture.md#api-conventions`. In short: no abbreviated or single-letter names (`disclosure`, not `d`), prop objects named after their part (`triggerProps`), shared part names (Root, Trigger, Panel, Popup), locality of behaviour, and `render` instead of `asChild`.
- TypeScript strict and inference-first. Export `UseXOptions`, `UseXResult` and `XPartProps` types.
- Visual decisions follow `DESIGN.md`. Changing a token or rule there needs an ADR and a passing `theme:check`.
- Use kebab-case files, co-located as `x.test.tsx`, `x.stories.tsx`, `x.e2e.ts` and `x.a11y.md`.
- **Every commit follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)** (ADR-0012): `<type>[optional scope][!]: <description>`, then an optional body and footers after a blank line.
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
  - Scope is a lower-case package or area: `feat(react): add Button`, `fix(core/store): keep selection on reset`.
  - Breaking changes use `!` after the type or scope, or a `BREAKING CHANGE: <description>` footer.
  - The description is imperative, at most 100 characters in the header, and has no trailing period.
  - The `commit-msg` hook and CI enforce this, and so does the PR title for squash merges. Never bypass the hook (`--no-verify`, `-n`, `VP_GIT_HOOKS=0`).
- One concern per PR.
- When spec and AT behaviour disagree, choose what works for users and record why in an ADR.
