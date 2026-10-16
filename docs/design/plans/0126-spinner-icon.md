# Plan 0126: The spinner is a library icon

- **Status:** In progress (scope narrowed by the maintainer 2026-10-17, see D1)
- **Owner:** lead
- **Created:** 2026-10-17 · **Target:** alpha
- **Related:** [loading-indicators.md](../loading-indicators.md) (motion spec, §6 and §8.2), [0124 icon library](0124-icon-library.md), `docs/design/icon.md`, skills `iconography`, `theme-css`

## Goal

`spinner` is an icon in `@kvirn-ui/icons` like every other: `<Icon name="spinner" size="24" />` draws a still ¾ arc with the same `size` option. A class the consumer adds, `kv-animate-spinner`, makes it crawl for a loading state. The Storybook story `Icons/Library` → `LoadingSpinner` (it was `Icons/Loading spinner` until Plan 0127) shows that icon animated.

## Non-goals

- A new Icon prop (the only option is `size`).
- Built-in icon (stays 25) and migrating Button busy, Progress, toast and Map status. They keep the CSS `kv-spinner` because they must work with no icon set registered. Revisit in a later plan.
- Changing `in-progress` drawing.

## Background

- `loading` and `spinner` are aliases of `in-progress` today (`packages/icons/catalog.json:411`, `docs/design/icon-library.md:569`). They move to the new icon.
- Library icons are SVG files in `packages/icons/svg/`, listed in `catalog.json`, generated to modules by `packages/icons/scripts/generate.mjs`; the consumer registers them with `KvirnProvider icons={allIcons}`.
- The motion spec (`docs/design/loading-indicators.md`, amended by ux-designer) designs the drawing and crawl: path `M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18`, stroke 1.5, round caps, `pathLength="100"`, `stroke-dasharray="75 25"` (still ¾ arc), svg turns once per 2400 ms, head/tail `@property` numbers 10→110 and 0→100 on today's easings, all inside `prefers-reduced-motion: no-preference`; the theme sets only animation, `rotate` and the dash properties, never stroke/colour/fill. **Its hook (`data-icon`) and its built-in/consumer parts are superseded by D1–D3.**

## Design

```tsx
<Icon name="spinner" size="24" />                              // still ¾ arc
<Icon name="spinner" size="24" className="kv-animate-spinner" /> // crawls
```

### Accessibility contract (draft)

No focusable part, no keyboard rows. As every Icon: decorative `aria-hidden` without `label`. Never `progressbar`: words carry the meaning. Motion only under `no-preference`; the rest shape is the still arc, never a full circle (WCAG 2.2.2 stop is the app's duty; 2.3.3; 1.4.11 arc 3:1; 1.1.1). Forced colours: stroke `CanvasText` (existing icon rule).

### i18n strings

`icons.spinner` label key in all 5 locales: en "Loading", sv "Laddar", fi "Ladataan", nb "Laster", nn "Lastar".

### Theming surface

Class `kv-animate-spinner` (consumer-added, section 10 of `theme.css`). Reuses `--kv-duration-loop`, `--kv-easing-standard`. `kv-spinner` CSS is untouched.

## Tasks

- [x] 1 `ux-designer`: motion spec (loading-indicators.md, icon.md §6.5, design README)
- [x] 2 Library icon: `svg/spinner.svg` (attributes per spec), `catalog.json` entry (category status, aliases `loading`, `busy`; drop `loading`, `spinner` from `in-progress`), regenerate, `icons.spinner` in `packages/i18n` (types + 5 locales), `icon-library.md`/`icon-catalog.md` rows, count tests (`icons.test.ts`, `gaps.test.ts`). Owner: component-engineer
- [x] 3 Theme (selector `.kv-icon.kv-animate-spinner > path[pathLength='100']`, direct child, no `<g>`): `.kv-animate-spinner` animation in `theme.css` §10 under `no-preference`, `@property` head/tail for the icon (separate names from the `kv-spinner` ones), `theme:check` green; update the Icon CSS comment. Owner: component-engineer
- [x] 4 Docs: reconcile `loading-indicators.md` and `icon.md` with D1–D3 (remove data-icon, built-in, migration parts); add the class to `icon.md`/Icon docs page notes. Owner: component-engineer
- [x] 5 Stories: `Icons/Loading spinner`: Default = `<Icon name="spinner">` with `kv-animate-spinner` and a `size` control with the icon sizes, no wrapper, no words; update the other stories to use the icon where they showed `kv-spinner`, keep the `kv-spinner` comparison. Owner: component-engineer
- [ ] 6 Gates, accessibility-reviewer, roadmap line. Owner: lead

Tasks 2 and 3 are independent files and can run in parallel; 4 and 5 after.

## Decisions

- D1 (maintainer): spinner is library only; Button, Progress, toast and Map keep `kv-spinner` (they need no registered icon set). Replaces the earlier "migrate all".
- D2 (maintainer): the icon is still; animation is an opt-in add-on class for the loading state. Look: Crawl via stroke-dash.
- D3: the hook is a consumer-added class `kv-animate-spinner` (a choice, so a class, per the maintainer's rule), not `data-icon`. ux-designer's concern that a name-keyed hook would break a replacement icon registered as `spinner` is moot: the consumer adds the class to the icon they mean. Document that it targets the library drawing (`pathLength`, dash).
- D4: stroke is 1.5 as every icon (ux-designer, thinner than `kv-spinner`'s 2px; `strokeWidth` makes it heavier). Not a token change.
- D6: `generate.mjs` allows only `d` on `<path>`. Chosen: allow `pathLength` and `stroke-dasharray` there (with a generator test), so the still ¾ arc needs no CSS and the crawl dash works without pixel maths. Rejected: plain SVG + CSS-only dash (full circle without the theme) and the open arc (the dash can't travel round the whole circle). Tooling allowlist, not a gate.
- D5: the new rule mirrors the `kv-spinner` loops' gate (media query plus `:where(:root:not([data-kv-motion='reduce']))`), so one motion switch stops both. ux-designer's open question 1 (that attribute vs spec L4 "no data-* motion attribute") is outside this plan; noted for the maintainer.
- D6 (maintainer): the generator allows `pathLength` and `stroke-dasharray` (only these) on `<path>`; the module emits `pathLength` and `strokeDasharray`. Root attributes stay locked; a generator test covers allowed and rejected.

## Risks & open questions

- Two spinners exist until a follow-up plan migrates the components (needs a built-in icon, 25 → 26).
- Dash animation in the Icon section: confirm `pathLength` on the svg works in Chromium and Firefox in the story.

## Testing strategy

No CSS tests (rule 13). Icon library tests count and shape checks; stories: axe in every theme, `play` asserts the svg is `aria-hidden` and no `progressbar`.

## Rollout

Pre-alpha; no changeset. Public API: new icon name `spinner`, `loading` alias moves, new class `kv-animate-spinner`.
