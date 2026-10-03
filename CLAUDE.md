# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- Skills: `.claude/skills/{accessibility,keyboard,testing,storybook-docs,regulations,design,api-conventions,forms,overlays-and-lists,theme-css}`. Load them per the workflow table in AGENTS.md. `api-conventions` is for authoring hooks and parts, `forms` for Field, Fieldset, masks, OneTimeCode, InputGroup and FileUpload, `overlays-and-lists` for popovers, Listbox, Combobox, Autocomplete, virtualization and Table, and `theme-css` for editing `theme.css` and `reset.css`.
- Subagents: `ux-designer` (design specs and design review, no code), `component-engineer` (implements), `test-runner` (scoped, sequential test runs and triage) and `accessibility-reviewer` (independent read-only review). Use the built-in Explore agent for broad codebase searches.
- Model routing: the main session (Opus) orchestrates and owns architecture, plans and decisions. Delegate the rest to cheaper subagents:
  - Exploration: Explore with `model: "sonnet"` (`haiku` for a single-file or single-symbol lookup). Fan out independent searches in parallel and keep only the conclusions.
  - Implementation: `component-engineer` (Sonnet). Test runs and failure triage: `test-runner` (Sonnet). Use `general-purpose` with `model: "sonnet"` for ad-hoc coding outside its scope.
  - Opus is reserved for `Plan`, `ux-designer` and `accessibility-reviewer`, where judgment matters more than cost. Don't upgrade other subagents to Opus without a reason.
  - Do the work inline instead when you already know the file and the change is small. Spawning costs more than it saves.
- Gates run on the main thread only. Subagents write code and report files changed. They never run `vp check`, `vp test`, `vp run e2e`, `i18n:check`, `theme:check` or builds (blocked by `.claude/hooks/guard-subagent-checks.sh`). The exception is `test-runner`: hand it the changed files when a module is done, one test-runner at a time. Its guard (`guard-test-runner.mjs`) allows scoped runs only, and waits for other runs and edits to finish (`test-preflight.mjs`). Wait until all subagents report done, then run the gates once, scoped to the changed files, and run them sequentially. Limit parallel subagents to 2-3 at a time. If a gate fails, pass the failure output to one subagent to fix, and re-run only that gate yourself.
- Use plan mode for Explore/Plan. Save plans to `docs/plans/`, not only in the session.
- Hooks (`.claude/settings.json`): edits are auto-formatted. There is no Stop hook: run the gates yourself, once, at the end of a change. A PreToolUse guard blocks bypassing git hooks, and the git `commit-msg` hook rejects commits that aren't Conventional Commits.
- When compacting, preserve the plan path, the list of modified files, failing gate output and open decisions.
