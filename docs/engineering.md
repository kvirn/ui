# Engineering

## Toolchain

| Concern             | Tool                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Package manager     | pnpm workspaces + catalogs                                                                                                     |
| Unified CLI         | Vite+ 1.0 (`vp`): `check`, `lint` (Oxlint + jsx-a11y), `fmt` (Oxfmt), `test` (Vitest 5), `pack` (tsdown), `run` (cached tasks) |
| Browser tests, a11y | Vitest browser mode (Playwright provider), axe-core                                                                            |
| Workbench / docs    | Storybook 10 (Vite builder, `addon-vitest`), Next.js                                                                           |
| Commit messages     | Conventional Commits 1.0.0, checked by a Vite+ `commit-msg` hook (`.vite-hooks/`) and in CI                                    |
| Versioning          | Changesets                                                                                                                     |
| CI                  | GitHub Actions (EU-hosted runners preferred)                                                                                   |

Config lives in the root `vite.config.ts` (fmt, lint, test projects). Each package's `vite.config.ts` only adds `pack`, from `tooling/vite-preset/pack.ts`. The Next.js docs site keeps its own build (`next build`, run by `vp run build`; `vp run docs` starts its dev server), and Storybook uses the Vite builder. Don't use ESLint or Prettier.

- **pnpm:** `pnpm-workspace.yaml` catalogs pin every version, in strict mode, and exact pins are the default. pnpm itself comes from `devEngines` in the root `package.json`. `dedupePeers: true` keeps one Vitest copy for Vite+ and Storybook. `allowBuilds` lists only `esbuild`: a dependency that runs install scripts needs supply-chain review. Storybook's optional `vite-plus` peer is allowed at 1.0.
- **Type checking** runs inside `vp check` (tsgolint, TypeScript 7), not as a separate `tsc` step.
- **Tests import from `vite-plus/test`**, and browser APIs from `vite-plus/test/browser`, never from `vitest` directly.
- **Source-first exports.** A package's `exports` point to `src/*.ts`, so the workspace needs no build to run tests and Storybook. `publishConfig.exports` point to `dist`, and `vp pack` doesn't rewrite `exports`.
- **TypeScript:** the library keeps `exactOptionalPropertyTypes` on (`tooling/tsconfig/base.json`). `apps/docs/tsconfig.json` sets it to `false` for now, and uses `jsx: react-jsx`.
- **Lint boundaries** (root `vite.config.ts`):
  - All 36 jsx-a11y rules in Oxlint, plus `react/iframe-missing-sandbox`, are errors. Turning one off needs the maintainer's approval.
  - `@tanstack/store` is importable only in `core/src/store/`, `@tanstack/virtual-core` only in `core/src/virtual/` and `@tanstack/table-core` only in `core/src/table/`.
  - `prosemirror-*` is importable nowhere: ProseMirror comes only through `@tiptap/pm/*`, so the editor has one copy of it. `@tiptap/*` is importable only in `packages/rich-text` and `apps/storybook`. Tiptap is a peer and a pinned dev dependency of `@kvirn-ui/rich-text`, so `@kvirn-ui/react` and `core` contain no Tiptap code.
  - `core` imports no React and uses no `window`, `document`, `navigator`, `localStorage`, `sessionStorage` or `matchMedia` outside `core/src/env/`.
  - `.only`, `.skip`, `any` and `@ts-ignore` / `@ts-expect-error` are errors.
- **Telemetry is off:** Storybook (`core.disableTelemetry`) and Next.js (`NEXT_TELEMETRY_DISABLED=1` in every script). Vite+ and Playwright send none.
- **Browser tests run in Chromium only.** It is a floor for development, not a browser-support claim: a support claim needs a run with those browsers or the manual AT matrix. The WCAG display-mode sweep (forced colours, reduced motion, 320px reflow) is not built yet: it will be Vitest browser projects with Playwright context options (see the roadmap).
- **Worker caps.** Vitest `maxWorkers` is 2 per project (set in each project because it isn't inherited), and `VITEST_MAX_WORKERS` overrides it for a one-off. These are politeness for the machine, not gates: no test, threshold or timeout changes. A full run can still reach about 12 Vitest workers. For a whole-tree local run, run the Storybook projects one at a time.
- **Formatting is advisory.** CI runs `vp check --no-fmt`, and `vp fmt --check` only warns (`continue-on-error`). Run `vp fmt <files>` on what you commit. The edit hook formats each edited file.
- **Commits.** Every commit follows Conventional Commits 1.0.0, and `tooling/commit-message/check-commit-message.ts` holds the rules:
  - The header is `<type>[scope][!]: <description>`. Types are feat, fix, docs, style, refactor, perf, test, build, ci, chore and revert. A scope is lower-case letters, digits, `-` or `/`. The description is non-empty with no trailing period, and the header is at most 100 characters.
  - A blank line separates the header from the body. A breaking change is `!` or a `BREAKING CHANGE:` footer.
  - Git-generated messages (Merge, Revert ", fixup!, squash!, amend!) pass, and comments and scissors are ignored.
  - `.vite-hooks/commit-msg` runs the validator, and `prepare` is `vp config --hooks --no-agent` so Vite+ doesn't rewrite AGENTS.md. The CI job `commits` checks every PR commit and the PR title.
  - A Changesets release workflow must use `chore(release): version packages` as its commit.
- **One git worktree per feature.** Run `pnpm install` in each, give parallel Storybook runs distinct ports, and rebase often, because the React index, the i18n catalogs and the roadmap are shared files that conflict on merge. No hook runs the gates. Pass paths to `vp check` and `vp test run` while working, and never run `vp check --fix` or a path-less `vp fmt`. Subagents of one session share its tree, never run checks (AGENTS.md rule 12) and never discard changes they didn't make. A failing file is the session's problem to fix, since the tree has one owner. If the failure predates the branch, say so.
- **Dependencies.** Any new dependency, runtime or dev, needs the maintainer's approval. A runtime dependency also updates the docs that list it in the same PR. A dev dependency is pinned exactly in the catalog and recorded, with its licence, network and install-script check, in the PR description. The icon libraries `lucide-react`, `@heroicons/react` and `@phosphor-icons/react` are dev dependencies of `@kvirn-ui/react` (tests) and `@kvirn-ui/storybook` (stories) only: no published package depends on them. Their licences are ISC and MIT, they have no dependencies, no network calls and no install scripts, and they are not in the SBOM. Revisit them on each major release. Add Tabler or react-icons only on demand, with the known traps as tests. `remark-gfm` is a pinned dev dependency of `apps/storybook` only, for tables in the Foundation MDX pages.

**Known Oxlint jsx-a11y gaps** (vs eslint-plugin-jsx-a11y 6.x, verified 2026-09-30 against Oxlint 1.85): only the rules ESLint itself deprecated, which are `accessible-emoji`, `label-has-for` and `no-onchange`. `iframe-missing-sandbox` lives in Oxlint's `react` plugin. All the other 36 rules are enabled as errors. Static linting is the weakest accessibility check, and the gaps are covered by axe, the keyboard e2e and accessibility-reviewer.

Command names were verified against [viteplus.dev](https://viteplus.dev/guide/) on 2026-09-30 (Vite+ 1.0.0).

## Test layers

| Layer     | File                                                      | Runner                                                | Proves                                   |
| --------- | --------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| Machine   | `packages/core/src/<name>/<name>.test.ts`                 | Vitest (node)                                         | State logic                              |
| Component | `packages/react/src/<name>/<name>.test.tsx`               | Vitest browser mode                                   | Rendering, ARIA, keyboard rows, axe      |
| Stories   | `apps/storybook/src/components/<name>/<name>.stories.tsx` | `vp test run` (Storybook `addon-vitest` + a11y addon) | Every visual state, axe fails the test   |
| Manual AT | `packages/react/src/<name>/<name>.a11y.md`                | Humans                                                | See [accessibility.md](accessibility.md) |

Stories live in the Storybook app, so the packages ship no Storybook files and need no Storybook dependencies. The package keeps its unit and browser tests (with axe), its contract and its docs page.

Vitest projects in the root `vite.config.ts`:

- `node`: core, i18n, theme and tooling tests.
- `browser`: react and testing tests, plus the docs-site components (`apps/docs/components/**/*.test.tsx`), in Chromium. The docs shell is built on KvirnUI and tested like a component, and takes `pathname` as a prop.
- `storybook`, `storybook-dark`, `storybook-light-contrast` and `storybook-dark-contrast`: every story, once per theme, through `addon-vitest`. The a11y addon runs with `test: 'error'` and the WCAG 2.2 AA tags, so axe runs in `vp test run`.

## CI

`.github/workflows/ci.yml` pins Actions to commit SHAs, uses read-only `contents` permission and installs Chromium only (add browsers to the `playwright install` line to widen it). It runs:

- `commits`: every PR commit and the PR title against the Conventional Commits rules.
- `gates`: `vp check --no-fmt`, `vp fmt --check` (advisory), `vp test run`, `i18n:check`, `theme:check` and `vp run build` (every package, the Storybook build and the docs site).

These are the [AGENTS.md quality gates](../AGENTS.md#quality-gates) 1 to 3. The WCAG display-mode sweep isn't run by any workflow yet, and neither are core coverage nor per-component bundle budgets: see the roadmap, "Engineering".

## Release

1. PRs carry changesets.
2. The release PR runs full CI, and a manual AT check for changed components.
3. Publishing includes npm provenance, a CycloneDX SBOM, a conformance JSON and the changelog.
4. The docs site deploys to ui.kvirn.com on an EU host.
