# Plan 0130: No default icons; `name` is the app's registry

- **Status:** Done (agents), 2026-10-17. The whole-tree `vp run test` is CI's
- **Owner:** lead
- **Created:** 2026-10-17 · **Target:** alpha
- **Related:** [0128](0128-icons-replace-built-ins.md) (supersedes D1 in part, D5, D15), [0129](0129-map-richtext-library-icons.md), [0124](0124-icon-library.md), skill `api-conventions` (Registries)

## Goal

`@kvirn-ui/react` has no default icons. Every icon is a `@kvirn-ui/icons` import, so an app bundles only the icons it, and the components it uses, draw. `<Icon name>` resolves only names the app registers once in `KvirnProvider`. Every example in Storybook and the docs site uses `<Icon name>`.

## Non-goals

- New or redrawn icons. The icon data format. `SvgIcon` in `@kvirn-ui/icons/react`.
- `packages/rich-text` (its own `RichTextIconName` set on library icons, Plan 0129).
- Icon's size, variant, stroke and label API (unchanged).

## Background

`packages/react/src/icon/default-icons.ts:30` imports 25 icons into a frozen map that `use-icon.ts:141-146` falls back to, so all 25 ship in every app that renders any Icon. `BuiltInIconName` (`default-icons.ts:59`, re-exported `index.ts:624`) is part of `IconName` (`icon-registry.ts:46`). Library components call `<Icon name="close">` in 13 react files, 3 map files and 4 patterns (scout list in the session, kept in T1–T2 briefs). Storybook (`.storybook/preview.tsx:120`) and the docs site (`app/(docs)/providers.tsx:25-29`) register no icons, and 0128 D15 moved their examples to `icon={add}`.

## Design

Options weighed: (A) the `icon` prop only, (B) an app registry, (C) a build plugin rewriting `name` to imports, (D) lazy `import()` per name, (E) an SVG sprite. A string name can't be tree-shaken on its own, because the lookup table imports everything in it. Chosen: A + B. The import is the table, either per call (`icon`) or once per app (`defineIcons`). C needs a new dependency per toolchain. D is code-split, not tree-shaken, and flashes. E needs a hosted asset.

### API sketch

```tsx
// app, once
import { close, search, add } from '@kvirn-ui/icons'
export const icons = defineIcons({ close, search, add })
declare module '@kvirn-ui/react' { interface Register { icons: typeof icons } }
<KvirnProvider icons={icons}>…</KvirnProvider>

<Icon name="search" />            // registered name
<Icon icon={search} />            // no registration
<Icon name="close" icon={close} /> // registered `close` wins, else the import (how components draw)
```

- Resolution: `registry[name]`, then `icon`, then an empty `aria-hidden` `<svg>` with the existing dev warning (only when no `icon` either).
- `IconName`: the registered names. With no `icons` in `Register`, `string`, so untyped and JavaScript apps work and the dev warning catches typos.
- Removed: `defaultIcons`, `BuiltInIconName`. `mirrorInRtl` reads the entry, then `IconData.mirrorInRtl`, then `false`.
- Library components import their own icon and pass both props, so a registered name still swaps the icon across the library (D2).
- `MapControl` `icon` widens to `IconName | IconRegistryEntry` (0128 T14).

### Accessibility contract (draft)

Unchanged rows: same `<svg>`, `aria-hidden` unless labelled, `role="img"` + `aria-label` from `label` or `icons.<key>`, RTL mirror for directional icons, `currentColor`, forced colours. New row: an unregistered `name` with an `icon` renders the `icon` with no warning. SCs: 1.1.1, 1.4.1, 1.4.11, 1.3.2 as before. Every component's default icon stays decorative, as today.

### i18n strings

None.

### Theming surface

None.

## Tasks

- [x] T1 (engineer A) react: delete `default-icons.ts` and `BuiltInIconName`; `IconName` falls back to `string`; resolution and warning as above; every internal `<Icon name="x">` becomes `name="x" icon={x}`, including `file-upload.tsx:713`; tests: drop the 25-defaults rows in `icon.test.tsx`, add name/icon/registry rows, fix the alert, disclosure, table, toast rows that compare against an unprovided `<Icon name>`; package docs and JSDoc (`icon.md`, `icon.a11y.md`, `kvirn-provider.md:156,160,453`, `alert.md`, `link.md`, `toolbar.md`, `tooltip.md`, others the scout listed). Files: `packages/react/**`
- [x] T2 (engineer B, after T1) map and patterns: the same pairs (`map-base-map-switch.tsx:71`, `map-cluster-popup.tsx:190`, `map-details.tsx:176`, `form-page.tsx:150`, `hero.tsx:63`, `service-link.tsx:39`, `site-search.tsx:38`); `map-controls.tsx:18` widens. Files: `packages/map/**`, `packages/patterns/**`
- [x] T3 (engineer C, after T1) Storybook: register `allIcons` from `@kvirn-ui/icons/all` for every story (no `Register` augmentation, D12); the 18 files of D15 back to `<Icon name>`; Icon stories: `name` is primary, one story keeps `icon` without registration, Lucide/Heroicons/Phosphor and `UnknownName` stay. Files: `apps/storybook/**`
- [x] T4 (engineer D, after T1) docs site: `apps/docs/lib/icons.ts` (`defineIcons` of the names the site uses + `Register`), passed in `providers.tsx`; the 26 `icon={…}` files and `map-set.tsx`, `own-component.tsx` to `name`; the Icon page: no built-ins, a "Register your icons once" section first, `icon` as the no-registration route, `name` + `icon` as how to swap a component's icon; `icon.api.ts`, `kvirn-provider-page.tsx:52,504`, `icon-library-page.tsx:56`. Files: `apps/docs/**`
- [x] T5 (lead) facts: `DESIGN.md:330`, `architecture.md:103`, `api-conventions` SKILL:157, `docs/design/icon.md` §4.1 and §6.1 note, `docs-site-components.md:50`, `roadmap.md:40,158`, 0128 superseded note, plans README
- [x] Gates (lead, 2026-10-17): `vp check` on 99 files green; `packages/react/src` 3513/3516 (3 skip-links failures in `naming.test.tsx`, Plan 0132, not this plan); map 58/58; stories of every touched component 1920/1920 in 4 themes, changed pattern stories 112/112 (the full patterns run had file-load failures under dev-server load, none in touched files); `theme:check` pass, `i18n:check` pass (cached). `accessibility-reviewer`: CHANGES (D13), fixed, `icon.test.tsx` 100/100; no second pass (the maintainer asked to finish)

## Decisions

- D1 (maintainer, 2026-10-17): no built-in icons. All icons come from `@kvirn-ui/icons`, map and rich text included. Icon stays the one component for size, variant and stroke. Examples use `name`. Chosen A + B over C, D and E (Design).
- D2 (maintainer, the lead's recommendation): a registered name still replaces a library component's icon app-wide. Done with `name` + `icon` on Icon, not a new hook. The component's default import always ships, a few hundred bytes.
- D3 (lead): `IconName` is `string` without a registration, the exact names with one. Reason: an app that never registers types its own `name` strings and still gets the dev warning. `never` would make copied examples fail with an opaque type error.
- D4 (lead): Storybook registers `allIcons`, because it's a dev tool where every icon should work. The docs site registers only what it uses. Reason: it's a production site that should model the practice it teaches. Registering everything would add about 17 kB gzipped to every page (`dist/*.mjs`), and `Register` makes `vp check` fail on an unregistered example name. The Icons library page keeps its own `allIcons` provider (`icon-library.tsx:40`).
- D6 (engineer A): `IconByComponentProps.name` changes from `never` to `IconName`, so `<Icon name icon>` type-checks (D2). `name` together with `icon` counts as one source in the exclusive-props warning.
- D7 (engineer A): `file-upload` spreads a local `{ name, icon }` for its status icon. `document` is imported as `documentIcon`, `delete` as `deleteIcon`.
- D8 (lead, after the T1 report): `useAlert().iconProps` carries `icon` (the status data) next to `name`, so the documented `<Icon {...alert.iconProps} />` draws without a registry. Otherwise a hook user would get an empty icon and a warning. `useAlert` then ships the four status icons, the same ones `Alert` already imports. Done: `AlertIconPartProps` gains `icon: IconData` (public type addition), and `statusIcons` moves into `use-alert.ts`.
- D9 (engineer B, lead): `MapControl` `icon` is `IconName | IconRegistryEntry`; a string goes to `name`, anything else to `icon`. The internal ControlButton takes `name` + `icon`, so the library's own map controls are swappable by name (D2).
- D10 (engineer B; approved below): `packages/patterns` gains `"@kvirn-ui/icons": "workspace:*"`, the same internal dependency as map and rich-text. `pnpm-lock.yaml` needs `pnpm install` (lead, after the maintainer's nod).
- Note (lead): Plan 0131 (letterform icons) is running in another session. 0130 doesn't touch `packages/icons` or `rich-text`, so the gates are scoped to keep the two apart.
- D11 (engineer D): the D5 example is the new `examples/icon/by-import.tsx`; `map-set.tsx` (iterates `mapIcons` data) and `own-component.tsx` keep `icon=`, as does the library page. The site registry is `lib/icons.ts` (20 names), passed in `providers.tsx` and `reference-shell.tsx`; the content-type example shell draws no Icon by name.
- D12 (engineer C, lead): the global `KvirnProvider` in `StoryEnvironment` broke the toast (`Timer Ring`, `Reflow 320`), provider (`Theme Defaults And Storage`) and button (`Reset And Blocked Click`, a second `status`) stories, since it is the outermost provider. Storybook instead registers `allIcons` with the `withLibraryIcons` decorator (`apps/storybook/src/icons.tsx`; the lead removed its `Register` augmentation, because Storybook type-checks in one program with the packages and it narrowed `IconName` in `icon.test.tsx`) on the metas, or the single stories, that write `<Icon name>`. `icon.stories.tsx` passes `icons={allIcons}` to its own provider. Also: a plain component registered under `arrow-forward` no longer mirrors (the entry has no data), so `LibraryIcons` registers `{ component, mirrorInRtl: true }` (a bare `<Icon name>` still needs it; components are fixed by D13). Stories keep `icon=` only for `WithoutRegistration`, the Lucide/Heroicons one-offs, `MapSet` (map's own data), the map fixture's custom `layerIcons` and the rich text `RichTextEditor.Icon`.
- D5 (lead): the Icon docs page keeps one `icon={…}` example. Reason: it's public API (rule 9), and it's the route for code that renders outside a provider.
- D13 (review, lead): the review blocked on RTL. A plain component registered under a directional name lost the flip of the icon it replaced (contrary to `docs/design/icon.md` §4.2 "mirroring belongs to the name"). Fix: `use-icon.ts` falls back to the `icon` prop's `mirrorInRtl` when a registered entry has none. New row: "a plain registered component under a name keeps the mirroring of the icon it replaces". `icon.md` and `icon.a11y.md` updated. Non-blocking fixes: the a11y row for an unregistered `name` + `icon`, the Storybook comments, the map test name.
- D10 approved (maintainer, 2026-10-17: "run pnpm i"). `pnpm-lock.yaml` updated.

## Risks & open questions

- An outer `KvirnProvider` in Storybook's decorator becomes the outermost provider, so it would own the live regions, the toast region and the theme preference (`kvirn-provider.tsx:110-113`). T3 must prove that announcer, toast and theme stories stay green. If they don't, it passes `icons` to the existing per-fixture providers instead, and reports which.
- Breaking for consumers who rely on the 25 defaults. Alpha, no changeset.
- `vp fmt` in 0128 T12 touched other files: briefs scope `vp fmt` to their own files.

## Testing strategy

`icon.test.tsx`: resolution order (registry, then `icon`, then warning), `IconName` type rows, `mirrorInRtl` from data. Component tests keep their decorative-icon rows, now asserting against the imported data. `tree-shaking.test.ts` already proves per-icon imports. Axe over every story in every theme stays.

## Rollout

Alpha, breaking allowed, no changeset.

## Done when

- [x] No `defaultIcons` or `BuiltInIconName` in the tree. Every Storybook and docs example uses `<Icon name>`, apart from D5.
- [ ] `vp check`, scoped `vp test run`, `vp run i18n:check` and `vp run theme:check` pass. `accessibility-reviewer` APPROVE. Plan ticked, roadmap updated.
