# ADR-0043: Agents check only their own changes

- **Status:** Superseded by ADR-0051
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike
- **Tags:** tooling | process

## Context

Several agents and the maintainer often work in the same tree at once, on different plans. An agent that runs a global formatter or linter (`vp check --fix`, `vp fmt` without paths) rewrites files another agent is editing, which makes that agent's edits stale and its diff noisy. An agent that runs the whole test suite sees another agent's half-finished work fail, and may "fix" it, which collides with the owner. This has happened more than once.

## Decision

- **Test and lint only what you changed.** While working and at the end, pass paths: `vp check <files>`, `vp test run <files>`, `vp test related <files>`, and `vp run e2e <spec> --project chromium`.
- **Never run a command that rewrites files outside your own.** No `vp check --fix` and no `vp fmt` without paths. The PostToolUse hook already formats each file an agent edits.
- **A failure in a file you didn't change isn't yours.** Don't fix it, don't skip it, and don't revert it. Name the files and say what they belong to, then continue or ask. This includes a Stop hook that fails on someone else's files.
- **Don't touch git state you didn't create.** No `git stash`, `git checkout -- <path>`, `git reset` or `git clean` over changes you didn't make.
- **The Stop hook checks only this session's changes.**
  - A `SessionStart` hook (`.claude/hooks/session-start.sh`) records the content hash of every changed or new file in the code paths, in `.git/kvirn-session/<session id>.base`. A resumed session keeps its first snapshot, and snapshots older than a week are deleted.
  - The Stop hook (`verify.sh`) finds the working-tree files whose content differs from that snapshot, and runs `vp check <those files>` and `vp test run <the tests of those files>`: the test and story files in that set, and the tests next to any other changed file (its directory, or `src/` for a package root). It no longer uses `vp test related`, which also ran every test that imports a shared changed file (the i18n catalogs, `theme.css`, the React index) and so pulled in other sessions' unfinished tests. Git is the source, so files changed through Bash are included.
  - Files that were already changed when the session started, such as another agent's work in progress, are left out. If none of the session's files is in the code paths, the hook passes.
  - Without a snapshot (a session from before this hook) or before the first commit, it checks the whole tree as before.
- **The full gates still exist.** `vp check`, `vp test run`, `vp run e2e`, `i18n:check` and `theme:check` run in CI and before a merge, over the whole tree, by one agent or the maintainer, when no one else is editing.
- The rule is written in AGENTS.md (Hard rules), the `testing` skill (Test budget) and both implementing and reviewing agents.

## Consequences

- ✅ Two agents no longer reformat or fail each other's files.
- ✅ Runs are smaller and faster.
- ⚠️ The snapshot can't tell this session's edits from another agent's edits made _during_ the session: both are in the working tree and differ from the start. Another agent's file can still block, so the rule to report it, not fix it, stays.
- ⚠️ The Stop hook runs only the tests next to what you changed. A change to a shared file can break a test elsewhere, and the hook won't see it: the whole-tree gates before a merge still matter, and you can run `vp test related <files>` yourself.
- ⚠️ `vp check <files>` still type-checks the whole project, so a type error in another agent's file can show up. Report it, don't fix it.

## References

- AGENTS.md (Hard rules), `.claude/skills/testing/SKILL.md`, ADR-0002 item 9 (test budget)
