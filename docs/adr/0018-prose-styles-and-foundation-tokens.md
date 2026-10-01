# ADR-0018: Prose styles by attribute, and prose, lead and shadow tokens

- **Status:** Accepted (2026-10-01, by the maintainer)
- **Date:** 2026-10-01
- **Deciders:** Maintainer (proposed by the ux-designer agent)
- **Tags:** theming, api

## Context

The maintainer asked for Tailwind-typography-style prose and a Storybook Foundation section. Articles from a CMS or Markdown have no classes and no KvirnUI components, so today each adopter styles `h2`, `ul`, `table` and so on by hand. That is where contrast, list semantics, reflow and 1.4.12 break. DESIGN.md defines type roles and a 70ch measure, but it has no prose spacing, no lead role, and no tokens for its level 3 and 4 shadows. The design spec is `docs/design/foundations-and-prose.md`.

## Decision drivers

- Consistency with ADR-0013: no class vocabulary, and consumer choices are `data-kv-*` attributes
- Components inside prose keep their own look
- No text under 16px for essential content (DESIGN.md)
- WCAG 2.2 AA: 1.3.1 (list and table semantics survive), 1.4.10, 1.4.12, 1.4.3
- Raw colours only in the palette block (ADR-0013)

## Options considered

### Option A: a `.kv-prose` class, like Tailwind's `.prose`

- ✅ Familiar to Tailwind users
- ❌ It brings back the class vocabulary ADR-0013 removed, and clashes with Tailwind's own `.prose`

### Option B: a `data-kv-prose` attribute, with `data-kv-not-prose`, `data-kv-lead` and `data-kv-scroll-region`

- ✅ The same shape as `data-kv-density` and `data-kv-nav`. No clash with Tailwind
- ❌ Four more public attributes to version

### Option C: no prose, only documentation

- ❌ Every adopter repeats the work, and the accessibility details are the part they get wrong

## Decision

We will use Option B:

- **`data-kv-prose`** has two sizes, the default (`body`) and `"large"` (`body-large`). There is no small size.
- **Zero-specificity `:where()` rules** in `@layer kv`. They never style `[data-kv]` elements, `[data-kv-not-prose]` subtrees, or the contents of `[data-kv-nav]` and `[data-kv-button-group]`.
- **Tokens:**
  - `--kv-prose-measure` (70ch)
  - `--kv-prose-space` (space-5, or space-6 in large)
  - `--kv-prose-space-item` (space-2)
  - `--kv-prose-space-block` (space-8, or space-10 in large)
  - `--kv-prose-space-section` (space-10, or space-12 in large)
  - `--kv-prose-list-indent` (1.75em)
  - `--kv-prose-code-size` (0.875em)
  - the size-variant aliases `--kv-prose-font-size`, `-line-height`, `-feature-settings` and `--kv-prose-lead-*`
  - a new type role, `lead` (1.25rem, 400, 1.5, no tracking)
  - `--kv-shadow-popup` and `--kv-shadow-dialog`, with DESIGN.md's level 3 and 4 values written with `color-mix()` over `--kv-neutral-950` (`--kv-gray-950` before ADR-0019 renamed the scales by role), and `none` in the dark themes

The two em values are new, relative values. They're relative so that the list indent and code size scale with the heading or the size variant.

## Accessibility impact

- Positive:
  - List markers and `display` on tables and lists are never removed, so semantics survive, including in Safari with VoiceOver.
  - `pre` wraps instead of scrolling (no unfocusable scroller), and tables scroll in a labelled, focusable region.
  - Nothing has a fixed height (1.4.12).
  - Markers, captions and the lead meet 4.5:1, or 7:1 in the contrast themes.
- No new colours. The prose-on-panel pairs were measured on 2026-10-01 (in the spec, §6.5), and all pass. They are in `contrast-requirements.ts`.
- No APG deviation.

## Consequences

- Positive:
  - One wrapper styles CMS content accessibly.
  - The Storybook canvas and the docs site can drop their own article CSS.
- Negative / trade-offs:
  - Four new public attributes, and the not-prose list in `theme.css` must grow with each new consumer attribute.
  - Unlayered page CSS such as `.kv-story-canvas p` overrides prose, and must be scoped away.
  - Prose inside `data-kv-not-prose` isn't re-enabled.
- Follow-ups:
  - Done: DESIGN.md has the `lead` role, a Prose entry under Components, the shadow tokens and the attributes under Theming. `theme.css` implements it (Plan 0006).
  - A test that every consumer `data-kv-*` attribute in `theme.css` is on prose's not-prose list, so the list can't fall behind.

## Validation

- `theme:check` is green, with the added panel pairs.
- axe reports 0 violations on the Prose stories in the four fixed themes.
- The e2e `reflow-320`, forced-colours and text-spacing checks pass.
- Design review of screenshots.
- AT check of the prose article: `pending`.

## References

- `docs/design/foundations-and-prose.md`
- ADR-0013, ADR-0014, ADR-0017, DESIGN.md
- [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography)
