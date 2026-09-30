# Contributing

```sh
corepack enable && pnpm install   # also installs the git hooks (vp config)
vp check && vp test run
```

Humans and AI agents follow the same workflow, quality gates and hard rules. They're all in [AGENTS.md](AGENTS.md). In short:

1. Start with an issue. For new components or multi-file work, write a plan (`docs/plans/`).
2. Record decisions such as dependencies, API conventions or APG deviations as ADRs (`docs/adr/`).
3. Create a branch named `feat/<component>` or `fix/<component>-<issue>`, and use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), for example `feat(react): add Button` or `fix(i18n): add missing Sámi string`. The `commit-msg` hook and CI reject anything else (ADR-0012), and the PR title must follow the same format.
4. Meet every quality gate and add a changeset (`pnpm changeset`).

Be kind. Accessibility work is about people.
