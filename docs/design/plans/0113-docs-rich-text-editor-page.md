# Plan 0113: RichTextEditor page on the docs site

- **Status:** Done (page shipped; the refused-image announcement and a compact toolbar move to Plan 0114)
- **Owner:** lead / component-engineer / docs-writer
- **Created:** 2026-10-14 · **Target:** next
- **Related:** [docs-component-page.md](../docs-component-page.md) · `docs-pages` skill · Plan 0036 RichTextEditor (`docs/roadmap.md`) · `packages/rich-text/src/rich-text-editor.md`, `rich-text-editor.a11y.md`

## Goal

`/components/rich-text-editor` exists on the docs site and follows the component page template, with live, runnable examples of the editor. Today the editor has Storybook stories only.

## Non-goals

- Changing `@kvirn-ui/rich-text`, its contract or its tests. A wrong contract goes back to `component-engineer` as a bug, not into this plan.
- Docs pages for `@kvirn-ui/patterns` or the Storybook stories.
- Claiming AT results: the AT matrix rows stay `pending` (AGENTS.md gate 6).

## Background

- `apps/docs` depends on `core`, `i18n`, `patterns`, `react`, `theme` only. `@kvirn-ui/rich-text` and Tiptap are not in it.
- `apps/docs/lib/contract.ts` resolves a contract only from `packages/react/src/<name>/`; the editor's contract is `packages/rich-text/src/rich-text-editor.a11y.md`.
- Page recipe, from `progress`: `app/(docs)/components/<name>/page.tsx` + `components/<name>-page.tsx` + `content/<name>.api.ts` + `examples/<name>/*.tsx`, then a card in `components/site-sections.ts` and the API module in `lib/search-index.ts`.
- Every other component page is `packages/react`; this is the first page for another package, so the docs must say which package to install and that Tiptap is a peer.

## Design

### Dependencies (maintainer-approved)

Add to `apps/docs/package.json` `dependencies`: `@kvirn-ui/rich-text: workspace:*` and the seven Tiptap packages as `catalog:`, the same seven `packages/rich-text` lists as devDependencies (`core`, `pm`, `react`, `starter-kit`, `extension-table`, `extension-image`, `extensions`). Next.js resolves peers from the app, so they are declared explicitly (`apps/storybook` declares only `@tiptap/core`). No new versions: the catalog pins them. The docs build already builds workspace deps first (`apps/docs` `build` script). Licence, network and install-script check is the same as for `packages/rich-text`; record it in the PR.

### Contract lookup

`contractPath(name)` gains a second root: `packages/rich-text/src/<name>.a11y.md` when `packages/react/src/<name>/` has none. Keep the error message for an unknown name. `lib/search-index.ts` and the `/search` `outputFileTracingIncludes` in `next.config.ts` add `../../packages/rich-text/src/**/*.a11y.md`.

### Page (docs-writer, per the `docs-pages` template)

Sections follow the template; the page-specific content:

- **Install**: the package and its Tiptap peers, one line each.
- **Main example**: `RichTextEditor` in a `Field` with a label, as in the Storybook `Default` story (read `rich-text-editor.fixture.tsx`).
- **Use cases** (public sector, real): a case-handling note for a caseworker; a news item for an editor; a message to a citizen with a Finnish/Swedish toggle is out of scope.
- **Options**: controlled JSON value, form field with hidden input, read-only, disabled and invalid, character count, without tables and images, custom extension, own toolbar (`DefaultControls`, `CommandButton`, `CommandToggle`).
- **API**: `useRichTextEditor`, `RichTextEditor.Root/Toolbar/Content`, `DefaultControls`, helpers `defaultExtensions`, `isAllowedLinkAddress`, `isAllowedImageSource`, `isDocumentEmpty`, `describeShortcut`.
- **Keyboard** and **Accessibility**: rendered from the contract by `ContractSectionsView`, not retyped.
- **Strings**: from `@kvirn-ui/i18n` via `StringsBlock`.
- **Known issues**: the AT matrix is `pending`; no claim beyond "designed and tested to meet WCAG 2.2 AA".

### Examples (live)

`examples/rich-text-editor/`: `default.tsx`, `in-a-form.tsx`, `controlled.tsx`, `own-toolbar.tsx`, `without-tables-and-images.tsx`, `character-count.tsx`, plus `texts.ts`. Client components (the package entry is `'use client'`). Every string comes from `texts.ts`/`messages`, never inline (hard rule 4).

### Files

| File                                                           | Change                             |
| -------------------------------------------------------------- | ---------------------------------- |
| `apps/docs/package.json`, `pnpm-lock.yaml`                     | dependencies above                 |
| `apps/docs/lib/contract.ts` (+ its test)                       | second contract root               |
| `apps/docs/next.config.ts`                                     | trace the rich-text contract       |
| `apps/docs/content/rich-text-editor.api.ts`                    | prop and attribute rows            |
| `apps/docs/components/rich-text-editor-page.tsx`               | the page                           |
| `apps/docs/app/(docs)/components/rich-text-editor/page.tsx`    | route                              |
| `apps/docs/examples/rich-text-editor/*`                        | live examples                      |
| `apps/docs/components/site-sections.ts`, `lib/search-index.ts` | card in Forms (or nearest), search |
| `apps/docs/messages/en.ts`                                     | page copy                          |
| `docs/roadmap.md`                                              | docs row                           |

## Tasks

- [x] Dependencies added, `pnpm install` lockfile updated (orchestrator)
- [x] `contractPath` resolves the rich-text contract, with a test (component-engineer)
- [x] `rich-text-editor.api.ts`, examples and page (docs-writer, then component-engineer for wiring)
- [x] Card in `site-sections.ts`, search index, next.config trace
- [x] `vp check`, `vp test run` on changed files, `i18n:check`, `theme:check`
- [x] `accessibility-reviewer` on the diff
- [x] `docs/roadmap.md` updated

## Decisions

- **Live examples need deps in `apps/docs`.** Alternative: code blocks only (rejected by the maintainer, 2026-10-14). Approved.
- **Second contract root in `contract.ts`**, not copying the contract into `packages/react`: one owner per fact. `packages/react` wins on a name clash; the rich-text path is the fallback.

- **Examples**: `small-toolbar.tsx` added (`labels="icon-and-text"`, `DefaultControls include`); the own-toolbar example is a Line break button, because `@tiptap/*` imports are lint-restricted outside `packages/rich-text` and `apps/storybook` (no gate change). No read-only, disabled or custom-extension example: they stay in Storybook.
- **Refused pasted image is silent** (maintainer, 2026-10-14): a Known issue in the contract and on the page; the announcement is Plan 0114. The contract row and its two keys are removed from the Announcements table meanwhile.
- **No `lang` mark**: language is the provider's (rule 14); nothing is documented as an issue. Docs and examples are English only.

## Risks & open questions

- Tiptap in a Next.js server-rendered page: the editor must render on the client only or SSR-safely; verify `immediatelyRender` handling in `use-rich-text-editor.ts` before writing examples.
- The page's bundle grows by Tiptap; examples should load only on this route (they do, route-level).
- Which section holds the card is a maintainer call if no "Forms" section fits.

## Testing strategy

The contract resolver (`lib/contract.test.ts`), and `examples/rich-text-editor/in-a-form.test.tsx`: empty submit, the ErrorSummary and its link focus the editor, 0 axe violations in the error state. A full `next build` proves the server render. No CSS tests (rule 13).

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT stays `pending`)
- [x] Plan tasks ticked, `docs/roadmap.md` updated
