# ADR-0013: Deliver the default theme as one hand-written `theme.css` that styles part attributes

- **Status:** Proposed
- **Date:** 2026-10-01 (revised the same day after the maintainer's review of the Phase 1 prototype)
- **Deciders:** Maintainer (first proposed by the ux-designer agent, design specs `docs/design/default-theme-button-link.md`, `docs/design/docs-site.md`, `docs/design/storybook-presentation.md`; revised by the component-engineer agent on the maintainer's direction)
- **Tags:** theming, architecture, api

## Context

DESIGN.md defines the default theme. The docs site (`apps/docs`) and Storybook need to show KvirnProvider, Button and Link in the default look, in four themes and forced colours. The headless packages ship zero CSS (AGENTS.md hard rule 5), and no new runtime dependency is allowed without an ADR (hard rule 6). `theme:check` must enforce every contrast pair users actually see.

The first prototype generated `tokens.css` and `tailwind.css` from `tokens.ts`, plus opt-in recipe classes (`kv-button`, `kv-button-primary`, `kv-nav-item`, …). The maintainer found that too much ceremony for adopters: four files to import, class names to learn on top of the components, and a generated file nobody could edit. The direction: import one file and everything is styled, remove it and nothing is.

## Decision drivers

- **Simple DX:** one import to style, one variable to rebrand, one file to copy and own
- One source of truth for colours, so that what `theme:check` measures is what users see
- The docs site and Storybook render a component identically
- Headless packages stay CSS-free, and there is no new runtime dependency
- The four themes (ADR-0006) work before JavaScript runs, and forced colours always win

## Options considered

### Option A (first prototype): generated `tokens.css`, `tailwind.css` and opt-in recipe classes

- ✅ One TypeScript source, and Tailwind v4 utilities for the tokens
- ❌ Four files, a class vocabulary on top of the components, and generated CSS that adopters can't read or edit
- ❌ A build step and a sync test for generated files

### Option B: one hand-written `theme.css` that styles stable part attributes

- ✅ `import '@kvirn-ui/theme/theme.css'` styles everything. Removing it unstyles everything
- ✅ The file is the documentation: readable, copyable, editable
- ✅ No build step, no generator, and no class names: variants are plain `data-*` attributes
- ❌ The fallback blocks repeat each theme (a test keeps them equal), and `data-kv` part names become public API

### Option C: local CSS in `apps/docs` and `apps/storybook`

- ❌ Two copies drift, and the values sit outside `theme:check`

## Decision

We will use Option B:

- **One file, `@kvirn-ui/theme/theme.css`, hand-written and the source of truth.** No generator, no `tokens.css`, no `tailwind.css`, no recipe files.
- **Everything is in `@layer kv`.** Any unlayered consumer CSS, and any layer declared after `kv`, wins regardless of specificity.
- **Two tiers of tokens.**
  - A palette, Tailwind-style: `--kv-gray-50` … `--kv-gray-950` and the same eleven steps for `indigo`, `red`, `green`, `amber` and `teal`, plus `--kv-white` and `--kv-black`. The palette block is the only place with raw colour values.
  - Semantic tokens (`--kv-color-primary`, `--kv-color-text`, …) that point at palette steps. The four themes only remap semantic tokens to steps. Non-colour tokens (spacing, radii, type, focus ring, motion, control size) are the same in every theme.
- **Themes** are selected by `data-kv-color-scheme` and `data-kv-contrast` on `<html>`, with `prefers-color-scheme` and `prefers-contrast` fallbacks when the attributes are absent, and a `color-scheme` per theme. Forced colours map every semantic token to a system colour.
- **Part attributes.** Each headless part renders a stable `data-kv` name: `data-kv="button"`, `data-kv="link"`, `data-kv="link-new-tab-notice"`. The theme selects on it, together with the state attributes the components already render (`data-disabled`, `data-focus-visible`, `data-current`). `data-kv` is in the hooks' part props too, so `useButton` on your own `<button>` gets the same look. This is the only change to `@kvirn-ui/react`, and it ships no CSS.
- **Consumer choices are plain attributes, not props or classes.**
  - `data-variant="primary"` or `"danger"` on a Button. The base is the secondary look, so a primary button is always an explicit choice (DESIGN.md: one primary per view).
  - `data-kv-button-group` on a container of buttons.
  - `data-kv-nav` on a list inside a labelled `<nav>`: its Links become navigation items.
  - `data-kv-density="compact"` on any container: 32px controls from 64rem.
- **Overrides are trivial.** Rebrand with `:root { --kv-color-primary: var(--kv-teal-600) }`, or redefine a palette step on `:root`. For more, copy `theme.css`, edit it and import the copy, or skip it and style `[data-kv]` and the `data-*` attributes with Tailwind or your own CSS.
- **`theme:check` reads `theme.css`.** It resolves every `var()` per theme (attributes and OS fallbacks), and measures the contrast pairs listed in `packages/theme/src/contrast-requirements.ts`. `checkThemeCss()` does the same for an adopter's copy or overrides. A lint test fails on raw colour values outside the palette block and in the app CSS.
- **`KvirnProvider` never loads CSS.** Styling is opt-in by import.
- The docs site and Storybook consume `theme.css`. Storybook's Theme toolbar has a "None (unstyled)" option that takes the file off the page again.

## Accessibility impact

Positive:

- Contrast (1.4.3, 1.4.6, 1.4.11) and focus appearance (2.4.13) are enforced on the file users load.
- The media-query fallbacks honour OS settings without JavaScript, and a test keeps them equal to the attribute themes.
- The component styles handle forced colours explicitly and never use `forced-color-adjust: none`.
- Variants are attributes, never a change of element: a Button stays a `<button>`, a Link an `<a href>`.

There is no APG deviation.

## Consequences

- Positive: one import, one readable file, no build step, and the same styling path for the docs site, Storybook and adopters.
- Negative / trade-offs:
  - `data-kv` names and the `data-variant`, `data-kv-nav`, `data-kv-button-group` and `data-kv-density` attributes are public API, so they need semver and changesets.
  - The OS fallback blocks repeat their theme. `checkThemeCss` reports any drift.
  - No Tailwind `@theme` file. Tailwind users style the attributes directly (`data-disabled:…`) or reference `var(--kv-*)`. A Tailwind mapping can come back as a documented snippet if adopters ask.
- Follow-ups: ADR-0014 (visual direction), ADR-0017 (implementation details), Plan 0005.

## Validation

- `theme:check` is green for all four themes.
- axe reports 0 violations in every Storybook story, including the fixed-theme and unstyled ones.
- The e2e forced-colours, reduced-motion and `reflow-320` projects are green for the component stories.
- A design review of screenshots matches the spec.

## Addendum (2026-10-01): role-named scales

The maintainer asked for palette scales named by role, not hue, so a consumer can rebrand without refactoring. The hues above are renamed, with the same hex values: `gray` → `neutral`, `indigo` → `primary`, `red` → `danger`, `green` → `success`, `amber` → `warning` and `teal` → `accent`. A new `secondary` scale aliases the neutral steps, and a new semantic token, `--kv-color-secondary`, is the secondary button's edge. The rebrand is now "override one scale on `:root`" (`--kv-primary-*`), and every theme follows. See ADR-0019 (Proposed).

## References

- DESIGN.md, ADR-0006, ADR-0011, ADR-0014, ADR-0017
- `packages/theme/theme.css`, `packages/theme/README.md`
- `docs/design/default-theme-button-link.md`
