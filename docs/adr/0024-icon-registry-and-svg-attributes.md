# ADR-0024: Icons through a typed name registry, rendered as SVG attributes

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Maintainer (registry chosen 2026-10-01, Plan 0009)
- **Tags:** api, a11y, theming

## Context

Plan 0009 adds an `Icon` component that works with the adopter's own SVGs and with icon libraries (Lucide, Heroicons, Phosphor and others). The libraries name their props differently: Lucide's `color` sets `stroke`, Phosphor's sets `fill`, Tabler's `stroke` prop is the stroke width, and react-icons applies its own `size` last (Plan 0009, Background). Writing `<Icon render={<Trash2 />} />` at every call site repeats the library import everywhere and ties every file to one library.

Adopters asked for a shorter form, `<Icon name="arrow-forward" size="sm" />`, set up once in the provider. ADR-0005 already registers the router's link component in `KvirnProvider` and types it through the `Register` interface.

Kvirn's own future components (Select, Dialog, Accordion, the error summary) also need icons, and they should follow the library the app chose.

## Decision drivers

- Short call sites, with names checked by TypeScript
- Only the icons an app uses are bundled. No runtime dependency on any icon library (hard rule 6)
- Works with server rendering, React Server Components and a strict CSP
- Explicit props always win over the theme
- Decorative by default, so an icon never adds noise for screen-reader users (1.1.1)

## Options considered

### Option A: A registry of named components in `KvirnProvider`, typed with `Register`

`defineIcons({ close: X, 'arrow-forward': { component: ArrowRight, mirrorInRtl: true } })`, passed as `<KvirnProvider icons={icons}>` and registered with `declare module '@kvirn-ui/react' { interface Register { icons: typeof icons } }`.

- ✅ Typed names, synchronous, works with server rendering, libraries mix, switching library means editing one file
- ✅ The same mechanism and setup as ADR-0005. `name` is a string, so server components can use it
- ❌ The app lists each icon once. Every registered icon is in the bundle that holds the provider

### Option B: A resolver function, `iconResolver={(name) => lucide[pascalCase(name)]}`

- ✅ No per-icon setup
- ❌ `import * as lucide` bundles every icon (about 1,600 in Lucide). Name mangling differs per library. An async resolver renders an empty frame first, shifts the layout and breaks server rendering

### Option C: Adapter packages (`@kvirn-ui/icons-lucide`) with ready-made semantic registries

- ✅ No setup
- ❌ One package per library to maintain, tracking upstream renames. Can be built on A later

### Option D: An SVG sprite (`<use href="/icons.svg#close">`)

- ✅ No JavaScript per icon, cached
- ❌ Needs a build step. Can be a later entry type in A

### Rendering: SVG presentation attributes or inline `style`

- Attributes (`width`, `height`, `stroke-width`, `fill`, `stroke`, `color`) reach every library's root `<svg>` and work under a strict CSP. They sit below all CSS, so a consumer's CSS can still override them.
- Inline `style` beats CSS, but server-rendered `style=""` is blocked by a CSP without `'unsafe-inline'`, and React doesn't repair it on hydration.

## Decision

We will use **Option A**, with `render` and children kept for one-off icons, because it gives typed, short call sites with the same setup adopters already know from ADR-0005, and it bundles only what the app registers.

1. `defineIcons(entries)` returns its argument, typed and frozen. An entry is an icon component, or `{ component, mirrorInRtl }`.
2. `KvirnProvider` takes `icons` and `iconDefaults` (`size`, `strokeWidth`). A nested provider merges `icons` by name and `iconDefaults` by field. `Register['icons']` adds its names to `IconName` (decision 9).
3. Precedence, lowest first: the library's defaults, `iconDefaults`, the entry, the instance's props.
4. `name`, `render` and children are exclusive (a union props type).
5. An unknown name renders an empty, sized `<svg aria-hidden="true" viewBox="0 0 24 24">` and warns once in development.
6. **Icon renders every value as an attribute on the root `<svg>`**, never as inline `style`. The theme never sets an icon's size, stroke, fill or colour, so explicit props are never overridden.
7. Sizes are `sm`, `md` and `lg` (1em, 1.25em, 1.5em), a number in pixels, or a typed `em`, `rem` or `px` length. The default is `md`.
8. An icon is decorative by default (`aria-hidden="true"`). `label` gives `role="img"` and `aria-label`, and removes a library's own `aria-hidden`.

9. **A built-in set is the registry's base layer** (decided 2026-10-01). `@kvirn-ui/react` ships 24 original outline icons in the style of Heroicons, named by meaning (`close`, `chevron-forward`, `warning`, …), so KvirnUI's own components have icons with no setup (design spec: `docs/design/icon.md` §4.1). An app that registers the same name replaces the built-in everywhere, so components follow the app's library. Without a `Register` augmentation, `IconName` is the built-in names, not `string`, like Link falls back to `<a>` (ADR-0005).
10. **Mirroring belongs to the name.** An entry that sets `mirrorInRtl` wins. A plain component registered under a built-in name keeps the built-in's `mirrorInRtl`, so an override can't silently break right-to-left text. Precedence, lowest first: the drawing's own defaults, the built-in's mirroring, `iconDefaults`, the app's entry, the instance's props.

11. **DESIGN.md Iconography** is replaced by the design spec's text (§6.7): the built-in set, the size steps, status shapes, mirroring by meaning, and `kv-button--icon-only` (square, at least the button's minimum height, 8px padding, for close and search only). The front matter gains `button-icon-only`. No new tokens or colour pairs.

## Accessibility impact

- 1.1.1 and 4.1.2: decorative by default, named with `label`. Labels come from the app's translations (ADR-0007), so Icon has no strings.
- 1.4.4 and 1.4.10: the `em` steps scale with text.
- Forced colours: `currentColor` follows system colours, and the theme replaces hard-coded colours on `.kv-icon` in forced-colours mode (Plan 0009).
- RTL: `mirrorInRtl` on an entry flips that icon everywhere it's used.
- No APG deviation. No pattern applies.

## Consequences

- Positive: one line per icon at setup, short typed call sites, libraries swappable in one file, CSP-safe, and a place for Kvirn's own components to get their icons.
- Negative / trade-offs: module augmentation is unfamiliar to some teams, and without it only the built-in names type-check. The registry must live in a `'use client'` module, because it holds components. Registered icons are bundled whether a page uses them or not.
- Bundle: the 24 built-ins are about 1.5 KB of path data (the module is about 2 KB gzipped), bundled wherever Icon is.
- Follow-ups: sprite entries (Option D) if adopters ask. The icon-only Button class and name warning get their own decision after the design spec.

## Validation

Plan 0009's registry and type tests: a registered `name` type-checks and a typo doesn't, nested providers merge, precedence holds, and an unknown name warns. Component tests with real Lucide, Heroicons and Phosphor components. e2e in WebKit for `var()` in presentation attributes (Chromium and Firefox checked during research).

## References

- Plan 0009, ADR-0005, ADR-0007, ADR-0015
- [Lucide React](https://lucide.dev/guide/packages/lucide-react), [Heroicons](https://github.com/tailwindlabs/heroicons), [Phosphor React](https://github.com/phosphor-icons/react)
- [CSP `style-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src), [SVG presentation attributes](https://www.w3.org/TR/SVG2/styling.html#PresentationAttributes)
