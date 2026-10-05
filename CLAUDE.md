# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- Skills live in `.claude/skills/<name>/` and load per the table in AGENTS.md. Subagents load them on demand, so a brief names the ones it needs.
- Agents (`.claude/agents/`), cheapest first:
  - `scout` (Haiku, read-only, 15 turns, no CLAUDE.md): every "where is / how does / which files" question, 1–3 per spawn, answered as `path:line` facts. Use it before every brief and plan. Fall back to Explore (`model: "sonnet"`) only after it reports NOT FOUND.
  - `component-engineer` (Sonnet, medium effort): the default for any code change, planned or not, including docs, stories and tooling. It runs scoped `vp check` and `vp test run` on its own files; the final gates are yours.
  - `test-runner` (Sonnet, low effort, no CLAUDE.md): one scoped gate, a verdict in a few lines. For triage (real, flaky, pre-existing) and to keep raw test output out of this context.
  - `accessibility-reviewer` and `ux-designer` (Opus, high effort): judgement work, once per change. `Plan` stays on Opus.
  - Do a change you can make in one or two Edits yourself: spawning costs more than it saves. Don't upgrade a model without a reason. 2–3 parallel subagents at most.
- Briefs. A subagent explores only what the brief leaves out, so give it everything, from scout's facts:

  ```
  Goal: <one sentence>
  Plan: docs/plans/NNNN-x.md (§Design, §Tasks 3–5)      ← or the bug, with a repro
  Read: <exact paths, with line ranges where they matter; the reference component>
  Change: <files to create or edit>
  Skills: <which, and which section>                   ← omit if none
  Don't: <out of scope>
  Done: a named test per contract row; `vp check <files>` and `vp test run <file>` green
  ```

  For a gate failure, continue the same agent with SendMessage (its context is intact) and paste only the failing test names and error lines. Respawn only when its context is stale.

- Gates run on the main thread, once, after every subagent reports done, scoped to the changed files and in order: `vp check <files>` → `vp test run <files>` → `vp run i18n:check` → `vp run theme:check`. A failure goes back to the engineer; re-run only that gate. Use `test-runner` when the output would be long or needs triage.
- Plan mode for Explore and Plan. Save plans to `docs/plans/` (under 250 lines), not only in the session.
- No Claude hook enforces scope or git rules, so rules 11 and 12 are on you. Format what you edit with `vp fmt <files>`. The `commit-msg` hook and CI reject commits that aren't Conventional Commits. Agents never create branches or worktrees.
- This session is the orchestrator: read ranges, not whole files; keep conclusions, not file dumps; don't re-read what scout or an agent already reported.
- When compacting, keep the plan path, the modified files, failing gate output and open decisions.
