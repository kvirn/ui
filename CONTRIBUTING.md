# Contributing

```sh
corepack enable && pnpm install   # also installs the git hooks (vp config)
vp check && vp run test
```

Humans and AI agents follow the same workflow, quality gates and hard rules. They're all in [AGENTS.md](AGENTS.md). In short:

1. Start with an issue. For new components or multi-file work, write a plan (`docs/plans/`).
2. There are no decision records. A decision changes the fact in the skill or doc that owns it (`.claude/skills/`, `docs/`), in the same PR and with the maintainer's approval. That covers a new dependency, an API convention, an APG deviation, a token or a gate. The reason goes in the commit body and the PR description. See [AGENTS.md](AGENTS.md#decisions).
3. Create a branch named `feat/<component>` or `fix/<component>-<issue>`, and use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), for example `feat(react): add Button` or `fix(i18n): add missing Sámi string`. The `commit-msg` hook and CI reject anything else, and the PR title must follow the same format.
4. Meet every quality gate and add a changeset (`pnpm changeset`).

5. Contributions are licensed under the AGPL, and you grant the maintainer the right to relicense them, including commercially ([LICENSING.md](LICENSING.md#contributions)).

Be kind. Accessibility work is about people.
