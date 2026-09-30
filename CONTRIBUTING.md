# Contributing

```sh
corepack enable && pnpm install
vp check && vp test run
```

Humans and AI agents follow the same workflow, quality gates and hard rules. They're all in [AGENTS.md](AGENTS.md). In short:

1. Start with an issue. For new components or multi-file work, write a plan (`docs/plans/`).
2. Record decisions such as dependencies, API conventions or APG deviations as ADRs (`docs/adr/`).
3. Create a branch named `feat/<component>` or `fix/<component>-<issue>`, and use Conventional Commits.
4. Meet every quality gate and add a changeset (`pnpm changeset`).

Be kind. Accessibility work is about people.
