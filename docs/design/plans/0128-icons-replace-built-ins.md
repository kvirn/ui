# Plan 0128: Default icons come from `@kvirn-ui/icons`

- **Status:** In progress (review: CHANGES, fixes running) (direction chosen by the maintainer 2026-10-17; package split below awaits a nod)
- **Owner:** lead
- **Created:** 2026-10-17 · **Target:** alpha
- **Related:** [0124 icon library](0124-icon-library.md) (supersedes its "25 built-ins stay in react" decision), [0126](0126-spinner-icon.md), [0127](0127-icon-variant-and-stroke.md), `docs/design/icon-library.md`, skill `api-conventions` (Registries)

## Goal

Every default icon a KvirnUI component draws is a `@kvirn-ui/icons` icon. React owns no drawings. The icon interfaces are framework-neutral, so a Vue binding could render the same data. Docs and Storybook show one icon list: the library.

## Non-goals

- Redrawing icons: all 25 defaults already exist in the catalog by exact name, none missing.
- Icon names, `Register`/`defineIcons` semantics and the label (`icons.<key>`) messages.
- `packages/map` (`map-icons.tsx`) and `packages/rich-text` (`icons.tsx`) own sets: a follow-up (T7) once we know which names the catalog covers.
- A Vue package.

## Background

Today `packages/react/src/icon/built-in-icons.tsx:11-81` draws 25 icons; `use-icon.ts:138-146` falls back to them; `@kvirn-ui/icons` (257 modules, `sideEffects: false`) imports types from `@kvirn-ui/react` (`create-icon.ts:2`, each `src/icons/*.ts:3`). So react can't import icons (cycle), and the icon types are React-typed (`icon-registry.ts:1-34`). 13 of the 25 library drawings differ from react's (arrow-back/forward, external, check, info, success, warning, error, calendar, document, delete, eye, eye-off); the library's are the corrected ones (`icon-library.md:190`).

Tree-shaking: the package is built for it (named re-exports, one module per icon, `sideEffects: false`; `./all` is a separate entry). Nothing proves it (`roadmap.md:133`, planned).

## Design

### Package split (dependencies point downward)

```
icons     IconData + export const add    plain data, depends on NOTHING; `./react` renders it (React optional peer)
react     <Icon> renders IconData        depends on core, i18n, icons (D12 moves the types out of core)
```

```ts
// core: packages/core/src/icon/icon-data.ts
export type IconShape = readonly [
  tag: 'path' | 'line' | 'polyline' | 'circle' | 'ellipse' | 'rect',
  attributes: Readonly<Record<string, string>>,
]
export interface IconData {
  readonly shapes: readonly IconShape[]
  readonly mirrorInRtl?: boolean
}
```

```ts
// icons: packages/icons/src/icons/add.ts (generated)
import type { IconData } from '@kvirn-ui/core'
export const add: IconData = { shapes: [...] }
```

```tsx
// react: registry entry widens, nothing is removed
type IconRegistryEntry =
  IconData | IconComponent | { component: IconComponent; mirrorInRtl?: boolean }
// defaults: packages/react/src/icon/default-icons.ts imports the 25 by name from '@kvirn-ui/icons'
```

`<Icon name="close">` keeps working: the name resolves registry first, then `defaultIcons` (the 25 library icons), then warns. RTL mirroring reads `IconData.mirrorInRtl` (generated from `mirror-in-rtl.json`), replacing the hard-coded set at `built-in-icons.tsx:87-93`. `BuiltInIconName` stays exported as the type of those 25 names (now derived from `defaultIcons`).

### Accessibility contract

Unchanged: same `<svg>`, `aria-hidden` unless labelled, `role="img"` + `aria-label` from `label` or `icons.<key>`, RTL mirror for directional icons, `currentColor`, forced colours. The only visible change is the 13 redrawn glyphs. WCAG SCs: 1.1.1, 1.4.11, 1.4.1 (no colour-only meaning), 1.3.2/1.4.10 (RTL, reflow) as before.

### i18n strings

None added. `icon-labels.test.ts` keeps catalog and locales in step.

## Tasks

- [x] T1 (engineer A) core `icon/icon-data.ts` + export; icons: generator emits `IconData`, delete `create-icon.ts` React code, drop `@kvirn-ui/react` from icons deps, regenerate, update `icons.test.ts`. Files: `packages/core/src/icon/**`, `packages/core/src/index.ts`, `packages/icons/**`
- [x] T2 (engineer B, after T1) react: render `IconData` into the `<svg>` (same attrs as `create-icon.ts` today), `default-icons.ts`, delete `built-in-icons.tsx`, widen `icon-registry.ts`, `use-icon.ts`, `package.json` dep on `@kvirn-ui/icons`, update `icon.test.tsx` (names, order, RTL set, types). Files: `packages/react/src/icon/**`, `packages/react/package.json`, `packages/react/src/index.ts`
- [x] T3 (engineer C, after T2) Storybook: remove `BuiltInSet` story and `icon.fixture.tsx` built-in reads from `Components/Content/Icon`; Docs page points to Icons/Library (`icons-library--docs`). Files: `apps/storybook/src/components/icon/**`
- [x] T4 (engineer D, after T2, parallel with T3) Docs site: delete `examples/icon/built-in-set.tsx`, change `icon-page.tsx:98-104` to link `/components/icons`. Files: `apps/docs/components/icon-page.tsx`, `apps/docs/examples/icon/**`, `apps/docs/app/(docs)/components/icon/page.tsx`
- [~] T5 (lead; done 2026-10-17: `icon.md` supersession note, `docs-code.md:242`, `roadmap.md:148`; `architecture.md`/`api-conventions` done in T10; left alone: `CLAUDE.md:15`, `iconographer.md`, historical plans) Facts (also `icon.a11y.md`/`icon.md` describe `icon` as component only; stale `built-in-icons.tsx` mentions in `docs/design/docs-code.md:242`, `CLAUDE.md:15`, `.claude/agents/iconographer.md:23,32,38`: the last two are the maintainer's files, flag only): `docs/architecture.md:15,20,92-103`, `api-conventions` skill (Registries), `regulations` skill (workspace dependency, no external), plan 0124 lines 23/33/46, `docs/design/icon.md` (§6.1 built-ins), `docs/roadmap.md`
- [x] T6 (engineer E) tree-shaking proof: a test that bundles `import { add } from '@kvirn-ui/icons'` with the toolchain already in the repo and asserts a different icon is absent; no new dependency (stop and ask if one is needed)
- [x] T8 (engineer F) icons stands alone (D12): `IconData`/`IconShape` defined in `packages/icons/src/icon-data.ts` and exported from `.`; no `@kvirn-ui/*` import anywhere in `packages/icons` src, scripts output or built `.d.ts`; `package.json` has no `dependencies` and no `@kvirn-ui/*` anywhere; new subpath `./react` (`src/react.ts`) exporting `SvgIcon` (a server-component-safe function component, no hooks, no `'use client'`) and `createIconComponent(data)`; `react` is an optional peer only for that subpath. Files: `packages/icons/**`
- [x] T9 (engineer G, after T8) react imports `IconData` types and the svg renderer from `@kvirn-ui/icons` (`/react` for the renderer, no duplicate); delete `packages/core/src/icon/` and its export; update tests. Files: `packages/react/src/icon/**`, `packages/core/src/index.ts`, `packages/core/src/icon/**`
- [x] T10 (lead) docs: `architecture.md` (icons depends on nothing), `api-conventions` skill, icons README/usage in the docs site Icons page ("use it without KvirnUI"), plan wording
- [x] T11 (engineer H; 14 files, `vp check` and story tests green) Storybook stories and fixtures outside `icon/`, `icons/`, `map/` use explicit imports: `import { add } from '@kvirn-ui/icons'` + `<Icon icon={add} />`, no `name="…"` strings. Files: `apps/storybook/src/components/{alert,autocomplete,breadcrumb,button,combobox,input-group,link,listbox,navigation,toggle,tooltip,patterns}/**`
- [x] T12 (engineer I; 13 files, icon 42/42 and map 10/10 green; `vp fmt` may have reformatted others' dirty files in apps/docs/components and apps/docs/app, formatting only) (engineer I) Storybook `icon/` and `map/` (drop `BuiltInIconName`/`builtInIconNames` types in the Icon story and fixture, keep the lucide/heroicons/phosphor interop demo, the library icons are the primary examples), `foundation/dev-warnings.mdx:165` wording; docs-site chrome (`home/hero|start|contact`, `back-to-top`, `code-block`, `docs-disclosure`, reference site `feedback-form`, `apply-parts`, `sign-in/page`) to explicit imports
- [x] T13 (docs-writer; 34 files + new `examples/icon/by-name.tsx`; `vp check` green; unproven: `icon={arrowForward}` mirrors, `icon` route without provider → test added by engineer J) (docs-writer) docs-site component pages and examples (icon, kvirn-provider, breadcrumb, button, field, input-group, link, listbox, map, toggle, tooltip, visually-hidden), `content/icon.api.ts` and `breadcrumb.api.ts` wording, and package docs (`icon.md`, `kvirn-provider.md:453`, `link.md:50`, `toolbar.md`, `alert.md`): no "built-in", examples import from `@kvirn-ui/icons`
- [ ] T7 follow-up: scout which `map-icons.tsx` / rich-text `icons.tsx` names the catalog covers; plan the rest (iconographer for gaps)
- [x] Gates (lead, 2026-10-17, scoped to T11–T13): `vp check` 0 errors; react icon/breadcrumb/provider 251 tests; storybook 27 files / 376 tests; i18n, theme. `accessibility-reviewer`: CHANGES (D18), all findings fixed, gates re-run green; no second pass (fixes were test dedupe, Show code and import aliases)
- [ ] T14 (maintainer call) widen `packages/map/src/map-controls.tsx:23` `icon` to `IconRegistryEntry`; commit with Plan 0129

## Decisions

- D1 (maintainer, 2026-10-17): no drawings in react; defaults come from the icons package; interfaces framework-neutral (Vue in mind). Weighed: sync drawings in react (kept the cycle-free split but duplicated art), consumer registers icons (breaks zero-config). Chosen: move.
- D2 (lead): icon data, not components, is the shared shape. Reason: a React component can't be shared with Vue, and `architecture.md:20` already documents icons as plain objects. Consumer `IconComponent` entries keep working.
- D3 (lead): the type lives in `core` (pure types), not in icons, so react and a future vue depend on icons only for the drawings.
- D4 (lead): the library's 13 redrawn glyphs replace react's; no goldens or snapshots exist for them.
- D5 (lead): keep `BuiltInIconName` as the type of the 25 defaults (alpha: breaking is allowed, but nothing gained by renaming).

- D6 (engineer A): icons depends on core as `dependencies` (`workspace:*`, like map); react and @types/react removed; `neverBundle` is `[/^@kvirn-ui\//]`.
- D7 (engineer A): shape attribute keys are SVG names (`'stroke-dasharray'`), not React's; react maps them when rendering. The root `<svg>` attrs (xmlns, viewBox, fill none, stroke currentColor, strokeWidth 1.5, round caps/joins) move to react.
- D8 (engineer B): `useIcon`/`<Icon>` gain an `icon` option typed `IconRegistryEntry`; `IconData` becomes a component via a per-object WeakMap cache; `builtInIconNames` dropped (tests use `Object.keys(defaultIcons)`); shape keys convert kebab to camelCase generically.
- D9 (lead): react's pack `neverBundle` lists `@kvirn-ui/icons` so a consumer's own icon imports share one copy.
- D10 (engineer C): the fixture's `builtInIconNames` and `mirroredIconNames` are literal lists typed `satisfies readonly BuiltInIconName[]`; the Icon Docs description links `?path=/docs/icons-library--docs`.
- D11 (engineer E): `tree-shaking.test.ts` bundles `import { add }` from the source index in memory with `build` from `vite-plus` (no new dependency) and asserts other icons' shapes are absent; proved able to fail with `import * as`. It checks source through the bundler, not `dist` or the exports map.
- D12 (maintainer, 2026-10-17): `@kvirn-ui/icons` must stand alone: usable in any Next.js app with no `@kvirn-ui/*` and no other dependency. Revises D3: the icon types live in icons (zero-dependency data), not in core; react and a future vue import them from icons. Lead's calls: a `./react` subpath with `SvgIcon` (React as an optional peer for that subpath only) so a plain app can render the data, with no `'use client'` so it works in Server Components; react reuses the same renderer instead of keeping its own. `SvgIcon` is decorative (`aria-hidden`) unless `aria-label`, `aria-labelledby` or `title` is passed, then `role="img"`.
- D13 (T8): `title` renders a `<title>` child (SVG has no title attribute); `size` is width/height (number = px, default 24). `react` devDependencies added from the existing catalog; `neverBundle` is now `react` only. `mirrorInRtl` is a hint, `SvgIcon` never flips.
- D14 (reviewer 2026-10-17, lead): fixes: SvgIcon contract rows + axe/readAloud test in react (`icon.a11y.md`, `svg-icon.test.tsx`; the icons package keeps node tests only so it needs no `@kvirn-ui/testing`); an empty `aria-label`/`title` stays decorative; the `as IconComponent` cast typed away if possible; docs API rows say `IconRegistryEntry`. Also `.gitignore` gains `packages/icons/src/**/*.d.ts` (a dependent's type build emits there, like core, i18n, react) and `icons.test.ts` skips `.d.ts`.
- D15 (maintainer, 2026-10-17, lead's reading): every icon in Storybook and the docs comes from `@kvirn-ui/icons`, imported explicitly (`<Icon icon={add} />`, tree-shaken). `<Icon name>` keeps working for the 25 defaults and for any set a `KvirnProvider icons={…}` registers (e.g. `allIcons`); a consumer may still register Lucide or others. No change to `Icon`'s API. Weighed: keeping `name` strings (works, but hides the library), registering `allIcons` globally (pulls all 257 into every bundle).
- D16 (engineer H): the library's `document` export is imported as `document as documentIcon` so it doesn't shadow the global; Show code reads `<Icon icon={documentIcon} />`. Docs examples should do the same.
- D17 (engineer I): the Icon story controls drive `icon` via `libraryIconChoices`; the `name` + `defineIcons` demos keep registering Lucide/Heroicons/Phosphor (a `{component, mirrorInRtl}` entry needs a component); `UnknownName` stays.
- Follow-up T14 (found by engineer I): `packages/map/src/map-controls.tsx:23` types `icon: IconName | IconComponent`, so library `IconData` isn't accepted by map controls. Widen to `IconRegistryEntry` (public API change, maintainer call).
- D18 (review 2026-10-17, lead): `accessibility-reviewer` returned CHANGES (one rule-13 duplicate test, now merged into "an icon renders a component or data"; non-blocking: Show code for IconData args, Icon control key, unaliased `document` imports: fixed). `icon-page.tsx:145,163` claim map and rich-text icons come from the library: true only with the uncommitted Plan 0129 work (`packages/map/src/map-icons.ts`); commit them together. `icon-library-page.tsx:31-36` "What is not done yet" is honest, kept.
- Open for the maintainer: `SvgIcon` `size` writes width/height (rule 14: no theme in this package); `@kvirn-ui/icons` is `private`; CLAUDE.md:15 and `.claude/agents/iconographer.md` mention the deleted `built-in-icons.tsx`.

## Risks & open questions

- **`@kvirn-ui/icons` is `private: true`** (`package.json:4`) and "private until reviewed". A published `@kvirn-ui/react` can't depend on it: icons must be published first or alongside. Maintainer's call, before any publish.
- Every react consumer now bundles the 25 defaults (as before) plus the registry data; the other 232 stay out only if tree-shaking holds, hence T6.
- Plan 0126/0127 and a dirty tree touch icon files: before T1/T2, confirm with `git status` that nothing under `packages/react/src/icon` or `packages/icons` is uncommitted by others, and re-read 0126 D1.
- Public API change (`IconRegistryEntry` widens, icon modules become data): docs update in T4/T5.

## Testing strategy

Cheapest layer: icons data and generator drift in `icons.test.ts`; Icon rendering, RTL mirroring, registry order and types in `icon.test.tsx`; axe over every Icon story in every theme stays. No test of drawn geometry beyond shape-count/format.

## Rollout

Alpha, breaking allowed, no changeset (off until alpha).

## Done when

- [ ] `vp check`, `vp run test`, `vp run i18n:check`, `vp run theme:check` pass; 0 axe violations
- [ ] No `built-in-icons` in the tree; Components/Content/Icon has no built-in list; docs link to the library
- [ ] `accessibility-reviewer` APPROVE; plan ticked, roadmap updated
