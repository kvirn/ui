# ADR-0051: One git worktree per feature, and the Stop hook checks the whole tree

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike
- **Tags:** tooling | process

## Context

ADR-0043 let several agents and the maintainer work in one tree on different plans. To keep them apart it added a `SessionStart` snapshot (`session-start.sh`, `session-scope.sh`) and a Stop hook that gated only the files that differed from that snapshot, plus rules about failures in other people's files. That was a workaround for the shared tree: it was about 70 lines of scoping logic, it couldn't tell this session's edits from another agent's made during the session, and it only ran the tests next to the changed files.

Each feature can instead live in its own git worktree and branch, so a tree has exactly one owner.

## Decision

- **One worktree and one branch per feature or plan** (`git worktree add ../kvirn-<feature> -b <feature>`, or `isolation: "worktree"` for a subagent). Run `pnpm install` in each. Merge through a PR.
- **The Stop hook checks the whole tree.** `verify.sh` runs `vp check --no-fmt` and `vp test run --changed` when the tree has changes in the code paths, and skips when the code is byte-identical to the last green run. The `SessionStart` hook and the snapshot are removed.
- **Pass paths while working** (`vp check <files>`, `vp test run <files>`, `vp run e2e <spec> --project chromium`) and run the whole-tree gates once at the end. This is for speed, not for keeping other people's files safe.
- **Subagents of one session still share that session's tree.** They never run checks (AGENTS.md rule 12, `guard-subagent-checks.sh`), and they never discard changes they didn't make.
- **A failing file is the session's problem to fix**, since the tree has one owner. The "failure in a file you didn't change isn't yours" rule is dropped. If the failure predates the branch, say so in the report.
- **Unchanged:** `guard-git.sh`, `format.sh`, the CI gates, and ADR-0048.

## Consequences

- ✅ `verify.sh` is about half the size, and the hook has one meaning: the tree is green.
- ✅ The Stop hook now sees tests that import a shared file (i18n catalogs, `theme.css`, the React index), which the scoped version skipped.
- ⚠️ Each worktree needs its own install, and parallel Storybook or Playwright runs need distinct ports.
- ⚠️ Two sessions in one working directory is no longer supported. The Stop hook will block on the other session's unfinished files.
- ⚠️ Shared files (`packages/react/src/index.ts`, the i18n catalogs, `docs/roadmap.md`, the ADR index) conflict on merge. Rebase often, and take ADR numbers from `main` just before merging.

## References

- Supersedes ADR-0043. ADR-0048, `.claude/hooks/verify.sh`, AGENTS.md (Hard rules)
