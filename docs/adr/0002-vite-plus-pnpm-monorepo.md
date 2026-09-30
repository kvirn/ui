# ADR-0002: Vite+ and pnpm monorepo

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** tooling

## Context

KvirnUI needs one fast, consistent toolchain across the library packages, Storybook and a Next.js docs app, with as few moving parts as possible for a solo maintainer.

## Options considered

- **Vite+ (`vp`) + pnpm.** One CLI for dev, build, `pack` (tsdown), `test` (Vitest), `lint` (Oxlint), `fmt` (Oxfmt) and cached tasks (`vp run`).
- **Turborepo + ESLint + Prettier + tsup.** Mature, but four tools to configure and keep aligned.
- **Nx.** Powerful, but heavy for a library monorepo.

## Decision

- Use **pnpm workspaces with catalogs**, and **Vite+** as the single toolchain.
- **No ESLint and no Prettier.** Oxlint (with the `react` and `jsx-a11y` plugins) and Oxfmt are the only lint and format tools.
- **Accept Oxlint's jsx-a11y rule gaps.** Gaps are documented in `docs/engineering.md`, and are covered by axe (Vitest and Playwright), keyboard e2e tests and `accessibility-reviewer`. We don't add ESLint to cover them.
- **Next.js (docs) keeps its own build** and is orchestrated through `vp run docs` / `vp run build`. Storybook uses the Vite builder.

## Accessibility impact

Static linting is the weakest of our accessibility checks. Runtime axe and keyboard tests are the gates that matter, so a missing lint rule is acceptable.

## Consequences

- **Positive:** one config surface (`vite.config.ts`), fast feedback, native Vitest browser mode, cached tasks.
- **Negative:** Vite+ is young, so there is a risk of CLI churn. The docs app does not share the Vite pipeline.
- **Mitigations:**
  - Pin Vite+ in the catalog.
  - Keep command names only in `AGENTS.md` and `docs/engineering.md`, so a rename touches two files.
- **Follow-ups (bootstrap):**
  - Verify `vp` command names.
  - List any missing jsx-a11y rules in `docs/engineering.md`.
