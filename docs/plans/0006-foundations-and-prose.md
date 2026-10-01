# Plan 0006: Foundations and prose

- **Status:** Done (heavy-development gates; e2e and reviewers deferred)
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-01 · **Target:** M0 / M1
- **Related:** ADR-0013, ADR-0014, ADR-0017, ADR-0018, ADR-0019 (all Accepted 2026-10-01), Plan 0005

## Goal

Designers and developers get a complete foundation to build on. `data-kv-prose` styles CMS and Markdown content, and the Storybook Foundation section documents the palette, semantic colours, text-on-surface contrast, type, spacing, radius, elevation, focus, motion, density and theming, reading live values from `theme.css`.

## Non-goals

- New components.
- Video in the sample article.
- Translated article texts for fi, nb, nn and se. They fall back to English, marked `lang="en"`, until a translator delivers them.

## Design

**Design spec:** [foundations-and-prose.md](../design/foundations-and-prose.md) (Draft).

- Prose is set with `data-kv-prose` in `theme.css` (§6.1–6.5).
- Tokens follow ADR-0018 (Accepted).
- The Storybook Foundation pages follow §6.6.
- Accessibility annotations and the tests derived from them are in §7.
- Usability testing: `pending`.

### Defaults for the spec's open questions

The maintainer can change these at any time.

1. `data-kv-prose` is 16px, and `data-kv-prose="large"` is 18px, the same model as `prose` and `prose-lg`.
2. At the large size, h4 may match h3. The docs advise stopping at h3.
3. No `hyphens: auto`. Hyphenate by hand with `&shy;`, and set `overflow-wrap: anywhere` on long words.
4. No visited-link style yet.
5. The Theming story uses a rebrand that passes in all four themes. The dark theme maps to lighter teal steps, and the live check shows it passing. (Since ADR-0019 the rebrand is a teal brand scale for `--kv-primary-*`, and the theme picks its steps.)
6. No video. The figure uses a local SVG.
7. Yes: the docs site's article content moves to `data-kv-prose`, so the docs use it themselves.
8. Aligning number columns in tables is left to consumer CSS.

## Tasks

- [x] ADR-0018 tokens and the `lead` role in `theme.css`, plus the new contrast pairs in `contrast-requirements.ts`
- [x] The prose rules in `theme.css` (`data-kv-prose`, `data-kv-lead`, `data-kv-not-prose`, `data-kv-scroll-region`)
- [x] `story-canvas.css`: scope the canvas rules, and retire `.kv-story-prose`
- [x] Foundation stories in `apps/storybook/src/foundation/` (§6.6)
- [x] The docs site uses `data-kv-prose` for its article content
- [x] DESIGN.md updated for ADR-0018, and a changeset

## Done when

- [x] `vp check` is clean, the tests for touched files pass, and `theme:check` passes. Heavy-development mode: e2e and reviewers are deferred to the release pass.
