# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- Skills: `.claude/skills/{accessibility,testing,regulations,design}`. Load them per the workflow table in AGENTS.md.
- Subagents: `ux-designer` (design specs and design review, no code), `component-engineer` (implements) and `accessibility-reviewer` (independent read-only review). Use the built-in Explore agent for broad codebase searches.
- Use plan mode for Explore/Plan. Save plans to `docs/plans/`, not only in the session.
- Hooks (`.claude/settings.json`): edits are auto-formatted, and the Stop hook runs `vp check` plus changed tests and blocks finishing while they fail. Fix the cause. Never bypass the hook. A PreToolUse guard blocks bypassing git hooks, and the git `commit-msg` hook rejects commits that aren't Conventional Commits (ADR-0012).
- When compacting, preserve the plan path, the list of modified files, failing gate output and open decisions.
