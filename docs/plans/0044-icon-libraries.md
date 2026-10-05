# Plan 0044: Using Lucide and Heroicons with Icon

- **Status:** In progress
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M2
- **Related:** [0009](0009-icon.md), `docs/design/icon.md`, `api-conventions`, `storybook-docs` skills

## Goal

A developer who wants Lucide or Heroicons finds the answer in Storybook in under a minute, and the one-off case is one line.

## Non-goals

- No bundled icon library and no sprite (the roadmap row "sprite entries" stays planned).
- No `startIcon`/`endIcon` on Button (plan 0009 non-goal).

## Background

It already works, but it isn't visible:

- **Registry:** `defineIcons({ search: Search, 'arrow-forward': { component: ArrowRight, mirrorInRtl: true } })`, `declare module '@kvirn-ui/react' { interface Register { icons: typeof icons } }`, `<KvirnProvider icons={icons}>`. Documented in `icon.md`, shown only in the `LibraryIconsViaTheRegistry` story (`icon.stories.tsx:597`, which mixes Lucide, Heroicons and Phosphor).
- **One-off:** `<Icon render={<Search />} />` is tested (`icon.test.tsx:506`) but has no story, and an element's own props win over Icon's (`<Search size={30} />` beats `size="lg"`).
- A bare component reference (`<Icon icon={Search} />`) does not exist. No docs-site page exists.

## Design

### API sketch

```tsx
import { Search } from 'lucide-react'
import { MapPinIcon } from '@heroicons/react/24/outline'

<Icon icon={Search} label="Sök" />                      // new: a component reference, typed IconComponent
<Icon icon={MapPinIcon} size="lg" />
<Icon name="location" />                                  // via the registry, as today
```

`icon` takes an `IconComponent` and renders it with Icon's size, colour, `aria-*` and `className`, so Icon's props win (no footgun). `name`, `icon`, `render` and `children` are mutually exclusive: a dev warning if two are given.

### Accessibility contract (draft)

Unchanged: decorative by default (`aria-hidden`), `img` with `label`. WCAG SCs: 1.1.1, 1.4.11.

## Tasks

- [x] Failing tests: `icon` with a Lucide and a Heroicons component, size/label/colour win, the exclusive-props warning, RTL mirroring via `icon` is not offered (the registry owns `mirrorInRtl`)
- [x] `use-icon.ts` and `icon.tsx`: the `icon` prop and its types
- [x] Stories: `Lucide` and `Heroicons` (one-off `icon`, and a provider registry that overrides built-in names), rendered by functions in `icon.fixture.tsx` with `showSource`, so Show code is the real source; the install line and a note that library defaults like `strokeWidth` go in `iconDefaults` are in the description; the `Register` recipe lives in `icon.md` only
- [x] `icon.md` recipe section rewritten around the three routes: `icon`, `name` + registry, `render`
- [x] Docs-site Icon page (Phase 2 docs) as a follow-up row in the roadmap
- [x] Changeset (minor)

## Decisions

- **Add `icon={Component}`.** It is the shortest honest path and removes the `render` size footgun. The alternative (docs only) is cheaper but leaves the footgun. **A public API addition: needs the maintainer's approval.**
- **Approved by the maintainer:** `icon={Component}` (typed `IconComponent`). Icon's size, colour, label/aria and className win. `name`, `icon`, `render` and `children` are mutually exclusive in the types, with a `warnOnce` dev warning (`icon-exclusive-props:<names>`, in an effect) for JavaScript or casts. `render` + `children` was allowed by the types before and is now exclusive too, as the plan says.
- **Implementation:** `icon` lives on `Icon` only, not in `useIcon` (the hook still resolves names). `IconProps` is now a four-way union. The warning is in `icon.tsx`, listed in `dev-warnings.md`.
- **Mirroring:** `icon` sets no `data-mirror-in-rtl`; the existing `mirrorInRtl` prop works on it, and the registry entry stays the place for a direction.
- **Stories:** `Lucide` and `Heroicons` show the one-off `icon` route and a provider registry that overrides built-in names (`search`, `delete`, `arrow-forward`), so no `Register` augmentation or cast is needed in Storybook. The `Register` + `declare module` recipe is in `icon.md` only (a story cannot augment the app's types, and a hand-written code string drifts). Each story's Show code is the real source of its fixture functions through `showSource`; the module-level `defineIcons` constants sit beside them in the fixture and are not part of Show code. `LibraryIconsViaTheRegistry` is unchanged: its Show code is the real API.
- `icon` can't cross from a server component (functions don't serialise): documented in `icon.md`.
- Lucide and Heroicons stay dev dependencies only (already in the catalog). No new dependency.

## Risks & open questions

- Libraries pass `size` as a number and `strokeWidth`. Icon passes `width` and `height` as it does for registry components today, so behaviour matches.

## Done when

- [x] All quality gates in AGENTS.md pass (2026-10-05: `vp check`, `vp test run`, every `vp run e2e` spec on chromium, `i18n:check`, `theme:check` green)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
