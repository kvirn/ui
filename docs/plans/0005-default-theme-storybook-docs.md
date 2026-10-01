# Plan 0005: Default theme, styled Storybook and docs site

- **Status:** In progress (Phase 1: visible prototype)
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-01 · **Target:** M0 / M1
- **Related:** ADR-0013, ADR-0014, ADR-0017 (all Proposed), ADR-0006, ADR-0011, Plan 0002, Plan 0003, Plan 0004

## Goal

Evaluators and maintainers see KvirnProvider, Button and Link in a real, styled default theme, in Storybook and on a docs site built with KvirnUI itself. Adopters import one `theme.css` and every component is styled. They rebrand by overriding `--kv-*` variables, or copy the file and own it, while the headless packages stay CSS-free.

## Non-goals

- A styled React package. Styling is opt-in CSS (`theme.css`) or the consumer's own (Tailwind, CSS modules, wrappers).
- The provider loading CSS. CSS is opt-in by import.
- Blocks (M4), MDX, syntax highlighting, "Copy code" (needs the Announcer), translated docs copy.
- Accepting ADR-0013 and ADR-0014. The maintainer decides after seeing the Phase 1 prototype.

## Background

- Visual target from the maintainer: [shadcn.io/design/linear](https://www.shadcn.io/design/linear). Deviations for WCAG 2.2 AA are listed in ADR-0014.
- `packages/theme/src/tokens.ts` was empty (Plan 0004 follow-up). This plan implements it.

## Design

**Design specs:** [docs-site.md](../design/docs-site.md), [storybook-presentation.md](../design/storybook-presentation.md) and [default-theme-button-link.md](../design/default-theme-button-link.md) (Draft, revised 2026-10-01 for the Linear-inspired direction).

- **Visual direction (ADR-0014, Proposed):** Linear-inspired:
  - a near-black `#010102` and white canvas, and a surface ladder with hairlines and no shadows
  - lavender `#5e6ad2` with white labels, and Inter self-hosted
  - a tight heading tracking ramp and 8px and 12px radii
  - compact 14px/32px chrome for staff tools and the docs sidebar, while resident-facing controls stay 44px
- **Accessibility adjustments:** 168 pairs measured, 0 failures.
  - Hover darkens instead of lightening.
  - `link` is its own token.
  - Controls use `border-control` instead of hairlines.
  - The focus ring is 2px with a 2px offset.
- **Delivery (ADR-0013, Proposed, revised after the maintainer's review):**
  - One hand-written `@kvirn-ui/theme/theme.css`, the source of truth: a Tailwind-style palette (`gray`, `indigo`, `red`, `green`, `amber`, `teal`), semantic tokens that point at palette steps per theme, fallbacks, `color-scheme`, forced colours, `data-kv-density`, and the Button and Link styles.
  - The components render stable part attributes (`data-kv="button"`, `data-kv="link"`, `data-kv="link-new-tab-notice"`). Variants are plain attributes: `data-variant="primary"` or `"danger"`, `data-kv-button-group`, `data-kv-nav`.
  - Everything sits in `@layer kv`, so consumer CSS always wins. No `tokens.css`, `tailwind.css` or recipe classes.
  - `theme:check` reads `theme.css` and resolves `var()` per theme.
- **Docs site:** a Linear-style shell:
  - a 56px header, a `surface` sidebar with compact nav items, and content at 70ch
  - built with KvirnProvider, Link (`current="page"`), Button and `useTheme`
  - `<html lang="en">` and no third-party requests
- **Storybook:**
  - one set of stories per component (`Components/Button`, `Components/Link`, `Foundation/KvirnProvider`), styled by `theme.css`
  - a Theme toolbar with a "None (unstyled)" option that removes `theme.css`
  - fixed stories for each theme as the axe gate, plus Compact density, Theme override and Unstyled stories
  - an Introduction story
- **Accessibility annotations:** §7 of each spec. The usability plans are `pending`.

### Content system (C0)

TSX pages and a small first-party `.a11y.md` parser, with no new dependency. MDX is revisited, with an ADR, at about 10 pages.

## Tasks

The full detail is in [docs-site.md §10](../design/docs-site.md#10-handoff).

### Phase 1: visible prototype

- [x] A1. `tokens.ts` colour tokens for 4 themes, and all contrast pairs from ADR-0014, until `theme:check` is green
- [x] A2. Non-colour tokens
- [x] A3. Generated `tokens.css` (layers, fallbacks, density, forced colours) and a test that every token exists in every theme
- [x] A4. `recipes/button.css` and `recipes/link.css`
- [x] A5. Generated `tailwind.css` and a mapping-completeness test (no `tailwindcss` dependency)
- [x] A6. A check that fails on raw colour values outside `tokens.css`
- [x] A7. Changeset
- [x] B1–B5. Storybook: preview (Theme toolbar, sort, self-hosted Inter), decorator, example fixture, `Default theme/Button` and `Default theme/Link` stories, Introduction
- [x] C1. Docs wiring (KvirnThemeScript, Providers with NextLink and `Register`, theme CSS, `next/font/local` Inter)
- [x] C2. Docs shell (skip link, header, sidebar, Display settings, footer, 404, route-change focus) plus the Button page
- [ ] P1. ux-designer screenshot review, then the maintainer's decision on ADR-0013 and ADR-0014

### Phase 1 rework: simpler DX (maintainer's direction, 2026-10-01)

Replaces A3–A6 and B1–B5 where they differ.

- [x] R1. Palette scales (`gray`, `indigo`, `red`, `green`, `amber`, plus `teal` for rebrands) and semantic tokens that point at steps; `theme:check` green (ADR-0017, decision 8)
- [x] R1a. Scales renamed by role, same hexes (`neutral`, `primary`, `secondary` aliasing neutral, `accent`, `danger`, `success`, `warning`), `--kv-color-secondary` for the secondary button's edge, and the rebrand documented as one `--kv-primary-*` scale override; `theme:check` green, 284 pairs (ADR-0019, maintainer direction)
- [x] R2. One hand-written `theme.css` in `@layer kv`, with the Button and Link styles; `tokens.css`, `tailwind.css`, the recipes and the generator removed
- [x] R3. `theme:check` and `checkThemeCss()` read `theme.css`; the raw-colour check allows hex only in its palette block
- [x] R4. `data-kv` part attributes on Button, Link and Link.NewTabNotice, and `data-variant` passed through
- [x] R5. Storybook: `Components/*` stories merged from the headless and `Default theme/*` ones, Theme toolbar › "None (unstyled)", `Unstyled` stories, Introduction updated, e2e story IDs updated
- [x] R6. Docs site on `theme.css` and `data-variant`; the Button page's Installation and Styling text
- [x] R7. `packages/theme/README.md`, ADR-0013, ADR-0017, DESIGN.md, changesets

### Phase 2: after acceptance

- [ ] C3. The remaining template components and the `.a11y.md` parser
- [ ] C4. The Home, KvirnProvider and Link pages, and finishing the Button page
- [ ] B6. Storybook e2e (reflow-320, forced colours, reduced motion, focus ring)
- [ ] C5. The docs e2e harness (tooling ADR)
- [ ] C6. All gates, accessibility-reviewer, and set ADR-0013 and ADR-0014 to Accepted

Phase 1 notes (component-engineer, 2026-10-01):

- 192 contrast pairs (48 per theme) are enforced, a superset of ADR-0014's 42 per theme (ADR-0017).
- Inter is plain `@font-face` CSS rather than `next/font/local`, and the vendored subsets lack `cv05` and `cv08` (ADR-0017).
- The Button page has Example, When to use it, Installation and Usage. The contents list, Accessibility, Strings, Styling and API reference come in C3 and C4. The nav links to KvirnProvider and Link reach the 404 page until C4.
- The docs shell has Vitest browser tests (skip link, landmarks, disclosures, theme radios, current page, route-change focus, axe). Docs e2e is C5.

## Risks & open questions

- Compact 14px/32px docs navigation meets 2.5.8 but not 2.5.5. The fallback is 44px chrome everywhere.
- The rework ran `vp check` and the touched unit, browser and story tests only. The e2e specs (new story IDs), `vp run build` and the docs `next build` haven't run since.
- The light theme is inferred, because Linear has none. The maintainer judges it in P1.
- The white label on lavender is 4.70:1: it passes, with a thin margin.
- The `data-kv` part names and the `data-variant`, `data-kv-nav` and `data-kv-button-group` attributes become public API (semver).

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` and `docs/design/README.md` updated
