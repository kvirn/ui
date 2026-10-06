# Plan 0052: The docs site consumes the built packages, and uses the components as they ship

- **Status:** In progress (A and B built, gates running, C open)
- **Owner:** orchestrator / component-engineer
- **Created:** 2026-10-06 · **Target:** before `beta`
- **Related:** [0005](0005-default-theme-storybook-docs.md), [0047](0047-navigation-t3c-and-horizontal.md), [0048](0048-tabs.md), [0049](0049-table-of-contents.md), `docs/design/docs-site.md`

## Goal

`apps/docs` is built the way an end user builds an app: it reads the packages' built `dist` through their real `exports` (ESM and CJS, with types), and its UI is made from `@kvirn-ui/react` and `theme.css` as they are. Every flaw in packaging or in a component shows up in the docs first.

## Non-goals

- Publishing, a registry, Verdaccio (rejected: new dev dependency and moving parts).
- Redesigning the docs site. `docs/design/docs-site.md` owns the look.
- New components in this plan. A gap found in Phase C gets its own plan (and a `ux-designer` spec when visual).

## Background

Before this plan `apps/docs` depended on `workspace:*` with `transpilePackages`, because `exports` pointed at `./src/*.ts` and a `publishConfig` swap applied only on publish. A broken `dist` or `exports` map would have passed every gate. The docs also hand-roll about 250 lines of CSS and a dozen parts that the library covers or should cover (audit in Phase C).

A tarball prototype showed that the docs build passes against compiled output, and that stripping `'use client'` from the react build makes it fail, so building docs on `dist` is a real guard.

## Design

### Phase A: the packages export `dist`, the docs are a plain consumer

Each package's `exports` point to its built `dist` (`import` and `require`, each with its own types, plus `main`, `module`, `types`), exactly as published. There is no `publishConfig` swap and no custom install tooling.

- `apps/docs` depends on `workspace:*` and reads `dist` through `exports`, like an adopter's app. `vp run build` builds the packages before it. No `transpilePackages`, no alias, no `paths`.
- Storybook and Vitest alias `@kvirn-ui/*` to `src` with `tooling/vite-preset/workspace-source.ts` (derived from `exports`: `./dist/x.mjs` is built from `./src/x.ts`), so they run without a build. The root `tsconfig.json` has matching `paths` for `vp check`.
- `agentRules: false` in `next.config.ts` stops `next dev` writing `AGENTS.md` and `CLAUDE.md` into the app.
- What this doesn't exercise: `files` filtering, since a workspace link exposes every file. `pnpm pack` lists the tarball, and publint and attw would check it (not added: no new dependencies).

### Phase B: packaging flaws the prototype found

| Where                                               | Flaw                                                                                                                   | Fix                                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| repo root, `packages/*`                             | `license: MIT` declared, no LICENSE file in any tarball                                                                | LICENSE at the root, copied or linked into each package's `files`                            |
| `packages/react`, `packages/i18n`                   | no README (core, theme have one)                                                                                       | add a short README each                                                                      |
| `packages/react/package.json:51-52`                 | `react-dom` is a peer but `dist` never imports it                                                                      | drop from peers, or record why it stays                                                      |
| `publishConfig.exports` of core, react, i18n, theme | only `types` and `import`, no `default`, no `main`/`types`                                                             | Done: dual ESM and CJS (`import`/`require`, each with types, plus `main`, `module`, `types`) |
| `packages/react/vite.config.ts:11`                  | `'use client'` banner duplicates the preserved directive in `index.mjs`; 39 `MODULE_LEVEL_DIRECTIVE` warnings per pack | keep the banner (chunks rely on it), silence the warning for that rule                       |
| tarballs                                            | `*.map` with `sourcesContent`, react's is about 1 MB                                                                   | optional: ship without `sourcesContent`                                                      |

A changeset covers anything that touches a published `package.json`.

### Phase C: use the components as they are

From the audit (`apps/docs`, `docs.css` is 466 lines, about 55% restyles or reimplements library parts). **Replace with what exists:**

| Docs today                                                                         | Use                                                              |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Display-settings `<fieldset>` and radios (`display-settings.tsx:24-53`)            | `Fieldset` + `RadioGroup`                                        |
| Raw `<select>` + `.docs-select` (`example-frame.tsx:67-86`)                        | `Listbox` with `native="always"`, in a `Field`                   |
| `<div class="kv-button-group">` (`button-examples.tsx:14`)                         | `ButtonGroup`                                                    |
| Headings as raw `<h1>`/`<h2>`/`<h3>` (`page-heading.tsx`, `button/page.tsx`)       | `Heading`                                                        |
| Header bar, nav group label, menu toggle (`site-shell.tsx`, `site-navigation.tsx`) | horizontal `Navigation` (0047), `Card`/`Popover` for the panel   |
| No contents list on the page                                                       | `TableOfContents` (0049)                                         |
| Chevron SVG (`chevron-icon.tsx`)                                                   | `Icon` + `defineIcons`                                           |
| Figure/frame/toolbar (`example-frame.tsx:64-92`)                                   | `Card` (Header, Body, Footer), if it fits; otherwise it is a gap |

**Gaps to record, one plan each, not built here:** Disclosure, Badge, VisuallyHidden and SkipLink, CodeBlock (copy button), Heading focus-on-navigate (route focus), a Link brand variant, Footer. Where a replacement is awkward, keep the docs wrapper, note why under Decisions, and list the flaw in `docs/roadmap.md`.

**Rule for the docs CSS:** layout glue only (grid, measure, spacing). No focus rings, no outline removal, no forced-colors blocks, no restyling of `kv-*` parts. Remove `.docs-h1:focus` and `.docs-main:focus` outline rules by giving the library the missing behaviour, not by hiding it. Tabs on the component page (Example, Usage, Styling) conflict with in-page anchors: a `ux-designer` question, not decided here.

## Tasks

Phase A

- [x] Dist `exports` in all six packages, alias helper for Storybook and Vitest, `paths` in the root tsconfig
- [x] Docs on the built packages: `transpilePackages` removed, `agentRules: false`
- [x] Whole tree green: `vp run build`, `vp check`, `vp run test` (one rich-text test is flaky under load, green alone)
- [x] `vp run docs` builds the dependencies, then watches them (`vp pack --watch`) beside `next dev`: a react source edit reaches the page in about 5 seconds
- [ ] Update README.md, docs/engineering.md (done), the plans index

Phase B

- [x] LICENSE, READMEs, `react-dom` peer, dual ESM and CJS
- [x] Directive warning silenced (the banner restores it). `.map` size left
- [x] Changeset

Phase C

- [x] `ux-designer` spec: [docs-site-components.md](../design/docs-site-components.md) (accepted, decisions in its §9)
- [x] C1 theme: card and section `[hidden]` fix (F1) and the zero-specificity `body` base (G2), `theme:check`
- [x] C2 docs swaps R1, R2, R4-R15 (R3 waits for G5, R17 for G2), contents in a third column at 80rem+
- [ ] Swap each row above, one concern per commit, `docs.css` shrinks with it
- [ ] One plan or roadmap line per gap
- [ ] `accessibility-reviewer` on the final diff

## Decisions

- **Mechanism: dist `exports` plus a workspace app.** The first attempt packed tarballs into a generated install with a custom script (`tooling/docs-consumer`); the maintainer found it non-standard and it was deleted. Weighed: that script, `file:` deps in the workspace (lockfile churn, overrides leak), injected deps (skip `publishConfig.exports`), Verdaccio, and keeping source-first `exports` with a `publishConfig` swap (the docs would not consume the published form). Chosen by the maintainer, 2026-10-06.
- **Format: dual ESM and CJS** (maintainer: as flexible as possible). Radix, React Aria and Base UI ship both; shadcn/ui copies source and publishes no runtime package. Cost: a consumer that loads both formats gets two copies. Verified: `require()` loads every entry.
- **`react-dom` peer dropped** (maintainer): `dist` never imports it.
- **Phase C decisions** (maintainer, 2026-10-06): token ring on a script-focused target; `theme.css` styles `body` at zero specificity; `surface-raised` example stage; contents in a third column at 80rem and wider; the `h2` hairline is dropped; G2 before G3. No Tabs for page sections.
- **SSR:** the packages stay `'use client'` (hooks and context) and server-render as client components.
- **No new dependencies** (maintainer declined publint and attw). **CI left as is.**
- Publishing is to npm (changesets). Packagist is PHP's registry and doesn't apply.

## Risks & open questions

- `files` filtering isn't exercised by a workspace link (see Phase A).

## Testing strategy

The docs `next build` against the built `dist` is the proof; no new Vitest layer. `apps/docs` has no tests (maintainer, 2026-10-06): components are tested in their packages and Storybook.

## Done when

- [ ] `vp run build` builds docs from the packages' `dist` with no `transpilePackages`
- [ ] `docs.css` has no focus-ring, outline-removal or forced-colors rules; every swap row done or recorded as a gap
- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` updated, changeset added
