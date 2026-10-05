# Plan 0050: Agent token budget

- **Status:** Done
- **Owner:** maintainer, main session
- **Created:** 2026-10-05 · **Target:** tooling
- **Related:** `AGENTS.md`, `CLAUDE.md`, `.claude/agents/*`, `.claude/hooks/guard-subagent-checks.sh`, the `testing` skill

## Goal

Agents stop over-exploring and over-commenting: a small fixed context per spawn, a cheap read-only lookup agent, and a test loop that closes inside the Sonnet engineer instead of the Opus orchestrator.

## Non-goals

- Shortening the skills or `DESIGN.md`. Agents now read sections, not files.
- Changing any test, threshold or CI run.

## Decisions (maintainer, 2026-10-05)

- **Rule 12:** `component-engineer` may run `vp check <files>` and `vp test run <file>` on its own files through `guard-test-runner.mjs`, with the quiet window off (`KVIRN_TEST_QUIET_SECONDS=0`: its own edits are what it tests). Sweeps, builds, chains and path-less runs stay blocked, and the orchestrator still runs the final gates once.
- **Effort per agent** instead of inheriting the session's `xhigh`: `test-runner` low, `component-engineer` medium, `accessibility-reviewer` and `ux-designer` high. `scout` runs on Haiku.
- **No preloaded skills** on the engineer, the test-runner and scout. The reviewer keeps `accessibility` and `keyboard`, the designer `design` and `accessibility`. Subagents load the rest with the Skill tool when the brief names it.
- **No agent memory** (`memory: project` removed): the plan, the skills and git history are the memory.
- **`omitClaudeMd`** on scout and the test-runner: their prompts are self-contained and the guard enforces their rules.
- **Agents never create worktrees or branches.** Rule 11 offered `isolation: "worktree"`; the maintainer's global hook denies it.
- AGENTS.md drops the Skills and Agents tables (Claude Code injects those descriptions) and states rule 12 once. Every agent has a fixed, short report format and a comment rule: why, not what.

## Tasks

- [x] `scout` agent (Haiku, read-only, 15 turns)
- [x] `component-engineer`, `test-runner`, `accessibility-reviewer` and `ux-designer` rewritten: effort, no memory, report formats, comment rules
- [x] `guard-subagent-checks.sh` routes `component-engineer` through `guard-test-runner.mjs`; `test-preflight.mjs` treats `KVIRN_TEST_QUIET_SECONDS=0` as off
- [x] AGENTS.md and CLAUDE.md: routing, brief format, rules 11 and 12
- [x] `testing` skill and `references/test-runner-guard.md`
- [x] Plan template and README: the 250-line budget

## Done when

- [x] Guard simulation: scoped runs pass for `component-engineer`; sweeps, chains, `vp fmt` and builds are blocked; other subagents stay blocked
- [x] `vp check` on the hooks and the edited Markdown; `scout` frontmatter validated (an agent registers at session start, so the first spawn is the smoke run)
