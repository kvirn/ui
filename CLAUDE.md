# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- Skills: `.claude/skills/{accessibility,keyboard,testing,storybook-docs,regulations,design,api-conventions,forms,overlays-and-lists,theme-css}`, loaded per the workflow table in AGENTS.md. `api-conventions` for hooks and parts, `forms` for Field, Fieldset, masks, OneTimeCode, InputGroup and FileUpload, `overlays-and-lists` for popovers, Listbox, Combobox, Autocomplete, virtualization and Table, `theme-css` for `theme.css` and `reset.css`. Subagents load skills on demand, so the brief names them instead of preloading.
- Agents (`.claude/agents/`), cheapest first:
  - `scout` (Haiku, read-only, 15 turns, no CLAUDE.md): every "where is / how does / which files" question. 1–3 precise questions per spawn; it returns `path:line` facts. Use it before every brief and plan. Fall back to Explore (`model: "sonnet"`) only after scout reports NOT FOUND.
  - `component-engineer` (Sonnet, medium effort): the default for any code change, planned or not, including docs, stories and tooling. It runs scoped `vp check` and `vp test run` on its own files; the final gates are yours.
  - `test-runner` (Sonnet, low effort, no CLAUDE.md): one scoped gate, a verdict in a few lines. For triage (real, flaky, pre-existing) and for keeping raw test output out of this context.
  - `accessibility-reviewer` and `ux-designer` (Opus, high effort): judgement work, once per change. `Plan` stays on Opus.
  - Do a change you can make in one or two Edits yourself; spawning costs more than it saves. Don't upgrade a model without a reason.
- Briefs. A subagent explores only what the brief leaves out, so give it everything, from scout's facts:

  ```
  Goal: <one sentence>
  Plan: docs/plans/NNNN-x.md (§Design, §Tasks 3–5)      ← or the bug, with a repro
  Read: <exact paths, with line ranges where they matter; the reference component>
  Change: <files to create or edit>
  Skills: <which, and which section>                   ← omit if none
  Don't: <out of scope>
  Done: tests named per contract row; `vp check <files>` and `vp test run <file>` green
  ```

  For a gate failure, continue the same agent with SendMessage (its context is intact) and paste only the failing test names and error lines, never the whole output. Respawn only when its context is stale.

- Gates run on the main thread, once, after every subagent reports done, scoped to the changed files and sequential: `vp check <files>` → `vp test run <files>` → `vp run e2e <spec> --project chromium` → `vp run i18n:check` → `vp run theme:check`. A failure goes back to the engineer; re-run only that gate. Use `test-runner` when a gate's output would be long or needs triage. Hooks enforce the scope: `guard-subagent-checks.sh` blocks checks in subagents, except `component-engineer` and `test-runner` through `guard-test-runner.mjs` (one module, real paths, foreground; `test-preflight.mjs` waits for other runs), and `guard-e2e-scope.sh` demands a spec from everyone. 2–3 parallel subagents at most.
- Plan mode for Explore/Plan. Save plans to `docs/plans/` (under 250 lines), not only in the session.
- Hooks (`.claude/settings.json`): edits are auto-formatted. No Stop hook: run the gates yourself, once, at the end. `guard-git.sh` blocks bypassing git hooks, and `commit-msg` rejects commits that aren't Conventional Commits. Agents never create branches or worktrees.
- This session is the orchestrator: read ranges, not whole files; keep conclusions, not file dumps; don't re-read what scout or an agent already reported.
- When compacting, keep the plan path, the modified files, failing gate output and open decisions.
