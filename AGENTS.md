# AGENTS.md

The working agreement for agents and humans. It loads every session, so it stays short: procedures live in `.claude/skills/<name>/SKILL.md`, long-form facts in `docs/`, each agent in `.claude/agents/`, and routing and briefs in `CLAUDE.md`.

**KvirnUI** is a headless, accessibility-first React library for the Nordic and EU public sector: a typed, framework-agnostic core with thin React bindings, and the consumer owns the markup. **The bar is WCAG 2.2 AA on every component. An accessibility regression is a release blocker.**

## Repo map

```
DESIGN.md          visual language: tokens, themes, typography, layout
apps/docs  apps/storybook
packages/core      state machines. NO React, NO DOM at import time
packages/react     useX hooks + X.Root/X.Trigger components
packages/rich-text the rich text editor on Tiptap (peers). The only package that imports @tiptap/*
packages/i18n      sv fi nb nn se en
packages/theme     theme.css: --kv-* palette + tokens, default styles (opt-in)
packages/testing   a11y test helpers
tooling/           repo checks (commit messages, keyboard docs, Foundation docs, raw colours), shared tsconfig and vite presets
docs/              vision · architecture · accessibility · compliance · engineering · roadmap · plans/ · design/
.claude/           skills and agents (plain Markdown, readable by any agent)
```

## Commands

Use pnpm only. `vp` is the single CLI. Don't use ESLint or Prettier.

```sh
vp check [files]            # fmt + lint + types. Formatting is advisory
vp test run [files]         # Vitest: core (node), components (Chromium browser mode) and every story
vp run test                 # the whole tree: the same projects, the four Storybook ones in series
vp run i18n:check           # all locales complete
vp run theme:check          # token contrast
pnpm changeset
```

While working, pass your files. The whole tree runs once, at the end.

## Workflow

1. **Explore.** `scout` finds the files; read only the sections you need.
2. **Plan.** A new component or any multi-file change gets `docs/plans/NNNN-*.md` from the template (under 250 lines, with the draft accessibility contract). A block, flow or visual change gets a `ux-designer` spec in `docs/design/` first, and the plan links it. Ask the user now if a decision is theirs. Skip the plan only when the whole diff fits in one sentence.
3. **Execute.** Brief `component-engineer` (format in `CLAUDE.md`): contract, failing tests, then code, inside the plan's scope.
4. **Verify.** The orchestrator runs the gates once, scoped to the change, and shows the commands and output.
5. **Review.** `accessibility-reviewer` on the diff, once, at the end.
6. **Record.** Each changed fact goes to the skill or doc that owns it, the plan is ticked, `docs/roadmap.md` updated, a changeset added.

| Work                                          | Skills                                                                                                                     | Agents                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| New or changed component                      | api-conventions, accessibility, keyboard, testing, storybook-docs (+ forms, overlays-and-lists, theme-css for their areas) | component-engineer → accessibility-reviewer               |
| Block, flow, page, visual or token change     | design, theme-css, accessibility (+ keyboard, forms, regulations)                                                          | ux-designer → component-engineer → accessibility-reviewer |
| Bug or a11y defect                            | testing, accessibility, keyboard, the area's skill                                                                         | component-engineer (→ accessibility-reviewer for a11y)    |
| Refactor, tooling, decision, docs, compliance | testing, or regulations, or the skill that owns the fact                                                                   | – (maintainer approval if a gate or tool changes)         |
| Review a diff, design review                  | accessibility, keyboard, testing / design                                                                                  | accessibility-reviewer / ux-designer                      |

## Tests

Vitest is the only runner: `node` for core, `browser` (Chromium, real key events) for components, and four `storybook*` projects that run every story in every theme. Each contract row, ARIA state and announcement is proved once, in the cheapest layer (`testing` skill). **Keyboard rows are tested in `<name>.test.tsx`.** There is no e2e layer.

## Quality gates

Nothing is done until all of these pass. The orchestrator runs them, once, at the end; CI is the whole-tree gate.

1. `vp check`: no lint or type errors. Formatting is advisory: `vp fmt <files>` on what you commit.
2. `vp run test` (the whole tree): green, with 0 axe violations in every story state (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) and a named test for every keyboard-contract row.
3. `vp run i18n:check` and `vp run theme:check`.
4. The component has a hook, a compound component, stories (every state, RTL, forced-colors, and a `Keyboard` story if it has a focusable part) and a `<name>.a11y.md` that matches the tests. Its Docs page shows the contract's Keyboard section.
5. `accessibility-reviewer` returns APPROVE.
6. The manual AT matrix (`docs/accessibility.md`) passes before `beta`. **Agents mark it `pending` and never claim it.**

Forced colours, reduced motion and 320px reflow are not gated per change; a Vitest sweep for them is planned (Plan 0051).

## Hard rules

1. **Never weaken a gate.** No `.skip` or `.only`, disabled axe rules, loosened thresholds, unread snapshot updates or `@ts-expect-error` over real errors. A wrong gate changes only with the maintainer's approval, and the skill or doc that describes it changes in the same PR.
2. **Native semantics first, then the APG pattern and the [APG keyboard practice](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)** (`keyboard` skill). Every key is in the contract and on the Docs page. A deviation needs the maintainer's approval and the `keyboard` skill updated in the same PR.
3. **`core` stays pure:** no React, and no `window` or `document` at module scope.
4. **No hard-coded visible or announced strings.** Every string exists in all 6 locales and can be overridden per provider and per instance (`api-conventions` skill).
5. **Headless packages ship zero CSS.** State is exposed as `data-*`.
6. **No runtime dependencies beyond the sanctioned ones** (`docs/architecture.md`): React as a peer; in `core` only `@tanstack/store`, `@tanstack/virtual-core` and `@tanstack/table-core`, each in its own directory; Tiptap as peers of `@kvirn-ui/rich-text` only; `@guidepup/virtual-screen-reader` as an optional peer of `@kvirn-ui/testing` (its `/read-aloud` sub-entry) only. Any new dependency, runtime or dev, needs the maintainer's approval. A runtime one also updates `docs/architecture.md` and the `regulations` skill. A dev one is pinned exactly in the pnpm catalog and recorded in the PR with its licence, network and install-script check.
7. **No telemetry and no third-party network calls,** the docs site included.
8. **Never claim legal compliance.** Say "designed and tested to meet WCAG 2.2 AA".
9. **Public API changes** need a changeset and a docs update.
10. **Stay in scope.** No drive-by refactors. If the plan is wrong, update the plan first.
11. **The tree has one owner.** One worktree and branch per feature, created by the maintainer (`git worktree add ../kvirn-<feature> -b <feature>`). Agents never create branches or worktrees, and never `git stash`, `checkout --`, `reset` or `clean` over changes they didn't make.
12. **Checks are scoped.** Subagents run only `vp check <files>` and `vp test run <file>` on their own files, one command at a time. Path-less runs, sweeps, builds, `vp check --fix` and a path-less `vp fmt` are the orchestrator's, once, after every subagent has reported done. No hook enforces this.
13. **Test behaviour, accessibility and requirements, never CSS.** Every test proves a contract row, a WCAG success criterion or a plan requirement, once, in the cheapest layer. No computed styles, layout or `theme.css` text. A visual WCAG criterion asserts its threshold, not the theme's value (`testing` skill).

## Conventions

- API: `docs/architecture.md#api-conventions`. Full names (`disclosure`, not `d`), prop objects named after their part (`triggerProps`), shared part names (Root, Trigger, Panel, Popup), `as` (a tag or a component, only on the parts that need it) instead of `asChild` or a `render` prop; every other part is one native element and the hook covers a different one. TypeScript strict and inference-first; export `UseXOptions`, `UseXResult` and `XPartProps`.
- Code reads like the file next to it. A comment says why, only where the code can't: no narration, no step markers, no JSDoc on internals. Agents report in the format their definition sets.
- Visual decisions follow `DESIGN.md`. A token or rule change needs the maintainer's approval, `theme.css` in the same change and a green `theme:check`.
- Kebab-case files. `x.test.tsx`, `x.a11y.md` and `x.md` sit with the component in its package; `x.stories.tsx` lives in `apps/storybook/src/components/<name>/`, so packages ship no Storybook files.
- Commits follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/): `<type>(<scope>)!: <imperative description, at most 100 characters, no trailing period>`; types `feat fix docs style refactor perf test build ci chore revert`; scope a lower-case package or area (`fix(core/store): keep selection on reset`); breaking changes with `!` or a `BREAKING CHANGE:` footer. The `commit-msg` hook (`tooling/commit-message/`), CI and the PR title enforce it. Never bypass a hook. One concern per PR.
- When spec and AT behaviour disagree, choose what works for users and give the reason in the commit body and the owning skill or doc.

## Decisions

No decision records: git history is the record of why. A decision changes the fact in its home (the owning skill or doc) in the same PR, with the reason in the commit body and the PR description. **The maintainer approves,** with the owning skill or doc updated in the same PR: a new dependency, a gate change, an APG deviation, an accessibility trade-off, a token change, and waiving a blocking reviewer finding. A plan records the options it weighed, the one chosen, and every decision taken during implementation. If a skill or doc and the code disagree, the code is the truth: fix the doc.

## Maintainer preferences

- Colours are named by role (primary, secondary, accent, surface, neutral), never by hue, so a brand can swap a scale without a refactor.
- Fewer ceremonies: one import styles everything, and removing it unstyles everything. Classes are for parts and choices, `data-*` is only state.
- The default theme is a rebrandable default, not a brand. Every value that fails AA is adjusted and the look is kept.
- Tokens are a budget: a tight brief in, a short report out, and no agent reads what the brief already says.
