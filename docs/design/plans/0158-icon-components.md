# Plan 0158: one React component per icon in `@kvirn/icons/react`

- **Status:** In progress
- **Owner:** lead / component-engineer
- **Created:** 2026-11-26 · **Target:** `@kvirn/icons` 0.2.0, with Plan 0157
- **Related:** Plan 0157 (ESM only, unbundled icons), `packages/icons/README.md`, `apps/docs/components/icon-usage-page.tsx`

## Goal

A React developer draws an icon as its own component, `<ArrowForwardIcon />`, `<ArrowForwardIcon size={20} />`, `<ArrowForwardIcon className="size-4" />`, and only the icons they import end up in their bundle.

## Non-goals

- No change to `SvgIcon`, `createIconComponent`, the icon data or `@kvirn/ui`'s `Icon`.
- No `cssClass` prop: `className` already passes through (maintainer, 2026-11-26).
- No RTL flipping in the component (still the caller's, as for `SvgIcon`).

## Design

### API sketch

```tsx
import { ArrowForwardIcon, MapIcon, type IconComponentProps } from '@kvirn/icons/react'

<ArrowForwardIcon />                          // decorative: aria-hidden, 24px
<ArrowForwardIcon size={20} />
<ArrowForwardIcon className="size-4" />
<MapIcon title="Map" />                       // named: role="img" with a <title>
```

- One component per icon, named PascalCase of the kebab file name plus `Icon` (`arrow-forward` → `ArrowForwardIcon`, `delete` → `DeleteIcon`, never `DeleteIconIcon` from the reserved-word camelCase). The suffix is on every name: bare names clash with 7 JS globals (`Map`, `Error`, `Image`, `Document`, `History`, `Lock`, `Notification`) and 42 `@kvirn/ui` components (`Table`, `Calendar`, `Search`…).
- Props: `IconComponentProps` = `Omit<SvgIconProps, 'icon' | 'tabIndex' | 'onClick' | 'aria-describedby'>` (`size`, `title`, `className`, `ref`, the other SVG props). Exported as a type. The omitted props would make an `aria-hidden` icon focusable or operable (4.1.2, 2.4.3); an icon that does something goes inside a `<button>` or `<a>`, which carries the name. `SvgIcon` keeps its props (amended after review, 2026-11-26).
- Each component is a named function declaration in its own generated module, `src/react/<name>.ts`, rendering `SvgIcon({ icon, ...props })`: tree-shakeable without a `/* @__PURE__ */` annotation, named in React DevTools, no hooks, so it works in a Server Component.
- `SvgIcon`, `createIconComponent` and `SvgIconProps` move from `src/react.ts` to `src/svg-icon.ts` (no cycle with the generated modules); `src/react.ts` becomes generated: it re-exports those and every component. The public `./react` entry is unchanged otherwise.

### Accessibility contract (draft)

Same as `SvgIcon`, since the component is `SvgIcon` with fixed data: no focusable part, no keyboard rows.

- Roles / ARIA: decorative by default (`aria-hidden="true"`, `focusable="false"`); `title`, `aria-label` or `aria-labelledby` makes it `role="img"` with that name.
- WCAG SCs: 1.1.1 (decorative vs named), 1.4.11 inherited from `currentColor`.

## Tasks

- [x] 1. Generator, `svg-icon.ts` split, generated `src/react/*.ts` and `src/react.ts`, tests, README and the docs usage page (component-engineer)
- [x] 2. Gates: `vp check` on changed files, `vp test run packages/icons/src`, build icons, consumer check on the tarball (lead)
- [x] 3. `accessibility-reviewer`: CHANGES REQUIRED 2026-11-26 (a duplicate test), all non-blocking findings taken (narrower props, README and docs-page notes, `icon.a11y.md`); APPROVE on re-review, 2026-11-26. The Icon AT matrix rows stay `pending` (their open reason is unrelated); NVDA and VoiceOver iOS reading of a `<title>`-only name is for the human check
- [ ] 4. Publish with Plan 0157 Task 4

## Decisions

- **`…Icon` suffix on every component** (maintainer, 2026-11-26). Weighed: bare names (clash with globals and `@kvirn/ui`), bare plus `…Icon` aliases (Lucide; twice the names), the suffix everywhere (chosen: one rule, no clash; Heroicons).
- **`className`, no `cssClass` alias** (maintainer, 2026-11-26): React's standard prop, already passed through.
- **Function declarations over `createIconComponent(data)` calls**: a top-level call is a side effect a bundler keeps unless annotated, and every component would be `DataIcon` in DevTools.

## Testing strategy

`react.test.ts`: a component renders what `SvgIcon` renders for its data; `size`, `className`, `title` pass through; decorative by default. `icons.test.ts`: generated `src/react/*` match the generator, none stale, no two component names equal, one per icon. `tree-shaking.test.ts`: importing `ArrowForwardIcon` from `react.ts` bundles that icon and no other.

## Rollout

Additive, in `@kvirn/icons` 0.2.0.

## Done when

- [x] Gates green, reviewer APPROVE
- [ ] Plan ticked, `docs/roadmap.md` updated

## Implementation notes (2026-11-26)

- `componentName(kebab)` is exported from `scripts/generate.mjs` (declared in `generate.d.mts`) so `icons.test.ts` checks names with the generator's own rule.
- `react.test.ts`'s standalone rule is now: `react` is imported only by `svg-icon.ts` and `src/react/*`, and no file imports another `@kvirn` package.
- README and the docs usage page lead with the components (`SearchIcon`, `AttentionIcon`); `SvgIcon` is shown for an icon picked at runtime (`allIcons[name]`).
- Verified: `vp check` on 12 files, `vp test run` on icons, `@kvirn/ui`'s Icon and the bundle tooling (9 files, 171 tests), `vp run build` 17/17, and the packed tarball in a clean consumer (render, `require()`, types under `nodenext`).
