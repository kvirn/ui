# Plan 0104: Top bar as a component in @kvirn-ui/react

- **Status:** In progress. Verified against the code 2026-10-13: Component built; open: the docs page (route, API, examples, site-sections, search, gallery), gates, the reviewer.
- **Owner:** component-engineer
- **Created:** 2026-10-12 · **Target:** alpha candidate
- **Related:** plan 0095 (the pattern), 0099, 0103; skills api-conventions, theme-css, keyboard, testing

## Goal

`TopBar` is a component of `@kvirn-ui/react`, filed in Storybook under Components/Navigation, with a hook, a compound part, a contract, tests, stories and the theme rules in `theme.css`. The Site header pattern and the docs shell keep working and look the same.

## Non-goals

- Look, tokens, DESIGN.md, the SiteHeader API. New props (only `variant`, rule 14), dependencies, i18n (no strings).
- The docs page (see Tasks: left open).

## Background

Plan 0095 built `TopBar` as a pattern in the private `@kvirn-ui/patterns`: a `<div>` of two sides, no landmark, `variant` for the fills. It has no composition of other parts, only a class and a layout, which is what a component is here (like Container and Section).

## Design

### API

```tsx
import { Link, Navigation, TopBar } from '@kvirn-ui/react'

;<TopBar.Root variant="accent">
  <p>A KvirnUI reference site.</p>
  <Navigation.Root label="Tools" className="kv-navigation--horizontal">
    …
  </Navigation.Root>
</TopBar.Root>

const topBar = useTopBar({ variant: 'accent' }) // { rootProps: { className } }, frozen per variant
```

Types: `UseTopBarOptions`, `UseTopBarResult`, `TopBarRootProps`, plus `TopBarRootPartProps` and `TopBarVariant`. Reference: `section/` and `container/` (hook with frozen props per option, `mergeProps` so a consumer class joins). No `as`: the root is one `<div>`.

### Accessibility contract (draft)

The contract moved with the component: `packages/react/src/top-bar/top-bar.a11y.md`. Focus strategy native, no shortcuts, the bar handles no key.

| Key       | Context            | Action                                   | Test (`top-bar.test.tsx ›`)                  |
| --------- | ------------------ | ---------------------------------------- | -------------------------------------------- |
| Tab       | in the bar         | Moves through its bar items in DOM order | Tab moves through the bar items in DOM order |
| Shift+Tab | in the bar         | Moves back through its bar items         | Shift+Tab moves back through the bar items   |
| Enter     | a link             | Follows it                               | Enter follows a link                         |
| Enter     | a link-look button | Activates it                             | Enter or Space activates a link-look button  |
| Space     | a link-look button | Activates it                             | Enter or Space activates a link-look button  |

- Roles / ARIA: a plain `<div>`, no role; the `Navigation` inside is the landmark.
- Focus management: none. Announcements: none.
- WCAG SCs: 1.3.1, 1.3.2, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 2.4.3, 2.4.7, 4.1.2. Target size 2.5.8 (24px) and the 48px band stay as story assertions (`expectTopBarTargetSizes`, `expectTopBarBandHeight`) because they need `theme.css`; the contract says so.

### Theming surface

`kv-top-bar`, `kv-top-bar--primary|secondary|accent`. The rules moved unchanged from `patterns.css` P2d to `theme.css` section 8d (after Link and Navigation, its neighbours). The rules for a top bar inside `kv-site-header--primary` stay in `patterns.css` P2a.

## Tasks

- [x] Plan
- [x] `useTopBar`, `TopBar.Root`, exports in `packages/react/src/index.ts`
- [x] Contract and `top-bar.md` moved and updated
- [x] Tests: `top-bar.test.tsx` (every keyboard row, no landmark role, hook mapping and merging, axe per variant, SSR, types)
- [x] Removed from `@kvirn-ui/patterns`; imports updated (site-shell, site-header stories)
- [x] CSS moved to `theme.css` 8d; header index lines updated
- [x] Stories moved to `apps/storybook/src/components/top-bar/`, title `Components/Navigation/Top bar`
- [x] Roadmap line
- [ ] Docs page `top-bar` in the Wayfinding group: more than a small page (route, `content/top-bar.api.ts`, examples, `site-sections.ts`, search index and gallery entries), so left for a follow-up
- [ ] Orchestrator gates, `accessibility-reviewer`, AT matrix (`pending`)

## Decisions

- **Move, not re-export.** Options: (a) keep it in patterns and re-export from react (a react to patterns dependency inversion: patterns depends on react), (b) move it. Chosen (b): pre-alpha and `@kvirn-ui/patterns` is private, so nothing outside the repo imports it; the three repo importers were updated.
- **Component, not pattern.** It composes no other part, so it joins Container and Section in `@kvirn-ui/react`, not patterns.
- **CSS section 8d in `theme.css`, not a new numbering.** It sits with Link and Navigation. Cascade order changed (patterns.css rules precede all of theme.css; the top bar now follows the Navigation rules). Verified no visual change: a temporary browser test dumped the computed style (and `::before`/`::after`) of every element of the plain bar, the three fills and a bar in the primary Site header, at 1200px and 500px, before and after the move: identical. Forced colours was not diffed (no emulation in that test).
- **Hook shape.** `useTopBar({ variant })` returns `{ rootProps }` from four frozen objects, like `useContainer`.
- **Unit-test axe uses a `<style>` for link size**, as navigation.test.tsx does, since the unit tests load no theme; the real 24px and 48px checks stay in the stories.

- **Section 8d is not verbatim HEAD's P2d.** It carries earlier uncommitted top bar fixes from this session (maintainer bug reports): the side-stretch `:has(> .kv-navigation--horizontal)` rules, the no-fill current-tool look, the P2a primary-header current-tool rules and `.kv-story-top-end`. The computed-style diff compared the working tree before and after the move, and the tree already had them.
- **Forced colours, plain bar's current tool** (review, blocking): the no-fill rule's `color: var(--kv-color-text)` beat the Navigation's forced `LinkText`, so 8d's forced-colours block sets `LinkText` for it.
- **Read aloud** table and test added to the contract (`readAloud`, virtual screen reader): the current tool reads `link, <name>, current item`.

## Risks & open questions

- `tooling/keyboard-docs` reports two pre-existing problems unrelated to this plan (contact-card stories, read-aloud row).
