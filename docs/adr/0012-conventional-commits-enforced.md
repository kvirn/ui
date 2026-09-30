# ADR-0012: Conventional Commits, enforced by hook and CI

- **Status:** Proposed
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** tooling

## Context

`CONTRIBUTING.md` and `AGENTS.md` already asked for Conventional Commits, but nothing checked it. Humans and AI agents both commit here. Consistent messages make history readable and changelogs reviewable, and they tell reviewers of a public-sector library what kind of change they are looking at.

## Decision drivers

- Every commit follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/), from humans and agents alike
- No new dependency if the toolchain can already do it (AGENTS.md hard rule 6)
- Fails early and locally, with a helpful message, and can't be skipped silently
- Squash merges use the PR title as the commit message

## Options considered

### Option A: commitlint with Husky or lefthook

- ✅ Widely used, configurable
- ❌ Two or more new dev dependencies, and a second hook manager next to Vite+

### Option B: Vite+ hook dispatcher, a small in-repo validator and a CI check

- ✅ Zero new dependencies. `vp config` already manages git hooks (`.vite-hooks/`)
- ✅ The validator is ~80 lines, unit-tested and shared by the hook and CI
- ❌ We maintain the rules ourselves

### Option C: CI check only

- ✅ Simplest
- ❌ Feedback comes after the push, and rewriting history is more work than fixing a message

## Decision

We will use Option B:

- **Rules** (`tooling/commit-message/check-commit-message.ts`):
  - Header `<type>[optional scope][!]: <description>`, with types `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` and `revert`.
  - The scope is lower-case letters, digits, `-` or `/`.
  - The description is not empty and has no trailing period. The header is at most 100 characters.
  - A blank line separates the header from the body. A breaking change is written as `!` or as the footer `BREAKING CHANGE: <description>`.
  - Git-generated messages (`Merge …`, `Revert "…"`, `fixup!`, `squash!`, `amend!`) are let through, and comments and the scissors section are ignored, as git ignores them.
- **Local:** `.vite-hooks/commit-msg` runs the validator. The `prepare` script (`vp config --hooks --no-agent`) installs the dispatcher on `pnpm install`. `--no-agent` stops Vite+ from rewriting `AGENTS.md`.
- **CI:** a `commits` job checks every commit in a pull request and the PR title.
- **Agents:** a Claude Code `PreToolUse` guard (`.claude/hooks/guard-git.sh`) blocks `--no-verify`, `git commit -n`, `VP_GIT_HOOKS=0`, `HUSKY=0`, changes to `core.hooksPath` and `vp hooks disable`.

## Accessibility impact

None.

## Consequences

- Positive: consistent history for humans and agents, with no new dependency.
- Negative / trade-offs: the first commit (`initial commit`) predates the rule and stays as it is. The validator is ours to maintain.
- Follow-ups: when a Changesets release workflow is added, set its commit message and PR title to `chore(release): version packages`. The action's default ("Version Packages") would fail the check. Consider requiring the `commits` CI job in branch protection.

## Validation

`tooling/commit-message/check-commit-message.test.ts` covers valid and invalid messages. The hook was verified end to end in a scratch repository: `initial commit` was rejected, and `chore: add tooling` with a `Co-Authored-By` trailer was accepted.

## References

- Conventional Commits 1.0.0: https://www.conventionalcommits.org/en/v1.0.0/
- Vite+ commit hooks: https://viteplus.dev/guide/commit-hooks
- ADR-0002 (Vite+ toolchain)
