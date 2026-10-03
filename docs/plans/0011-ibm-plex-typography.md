# Plan 0011: IBM Plex Sans and IBM Plex Serif replace Inter

- **Status:** In progress
- **Owner:** Main session (plan, decision), ux-designer (spec), component-engineer (implementation)
- **Created:** 2026-10-01 · **Target:** default theme 0.x
- **Related:** design spec [`docs/design/typography-ibm-plex.md`](../design/typography-ibm-plex.md)

## Goal

Body text, labels and controls are set in IBM Plex Sans, and headings in IBM Plex Serif, in the default theme, the docs site and Storybook. Button labels sit centred in the maintainer's Brave on Ubuntu, where Inter drew them visibly high.

## Non-goals

- Italics. Like Inter today, the browser slants the roman. A later change can add Plex's real italics.
- Variable fonts or our own subsets. The licence reserves the name "Plex", so we ship IBM's files unmodified.
- Changing the type scale beyond what the spec justifies for Plex's metrics.
- `@ibm/plex-*` as dependencies: their `postinstall` sends IBM telemetry (hard rule 7).

## Background

- The maintainer saw button labels drawn high in Inter in Brave 1.96 on Ubuntu (GNOME, rgba antialiasing, medium hinting). The engine confirmed our self-hosted Inter was in use. Headless and headed test runs here couldn't reproduce it. In a side-by-side trial (temporary Storybook toolbar), Source Sans 3, IBM Plex Sans, Lato and the system font looked right, and Inter, Roboto, Noto Sans and Open Sans didn't. The maintainer chose Plex Sans, with Plex Serif for headings.
- Plex metrics (1000 units per em): ascent 1025, descent 275. `hhea` and `win` agree, so the line box is the same on every OS. Cap height 698, x-height 516 (Sans) and 522 (Serif). Inter: cap 727, x-height 546.
- Coverage: the official Latin1 subset has å ä ö æ ø, € and the punctuation; Latin2 has á č đ ŋ š ŧ ž, every Northern Sámi letter. Verified with fontTools.
- Plex figures are tabular by default. Plex has no `cv05` or `cv08`; its `l` has a tail and its `1` a flag and a foot.

## Design

The token values, the serif surfaces, the feature settings and the DESIGN.md wording are in the design spec. In short:

- Fonts: `apps/docs/fonts/ibm-plex/` (replaces `apps/docs/fonts/inter/`), with `ibm-plex.css` holding 15 `@font-face` blocks: Sans 400/500/600 and Serif 500/600, each in Latin1, Latin2 and Pi, under one family name per typeface (the self-hosted font CSS rule still holds).
- Theme: `--kv-font-family-sans` starts with `'IBM Plex Sans'`, a new `--kv-font-family-serif` is `'IBM Plex Serif', var(--kv-font-family-system-serif)` (new: `ui-serif, Cambria, 'Noto Serif', Georgia, serif`), and headings read `var(--kv-font-family-heading, var(--kv-font-family-serif))`. `--kv-font-family-body` and `--kv-font-family-heading` stay adopter overrides. The theme still loads no font.
- Body feature settings: Inter's `cv05`/`cv08` go. Numeric keeps `tnum` (a no-op in Plex, kept for a brand font).

### Accessibility contract (draft)

- l, I and 1, and O and 0, stay distinguishable in body text (DESIGN.md). Checked in the Glyphs story.
- Every Nordic and Sámi letter renders from the self-hosted font, not a fallback (Glyphs story).
- The 1.4.12 text-spacing overrides still clip nothing (existing prose and card tests).
- Contrast is font-independent (`theme:check` stays green).
- Button labels stay centred, and buttons stay 44px (32px compact) (button e2e).

### Theming surface

New tokens `--kv-font-family-serif` and `--kv-font-family-system-serif`. Changed: `--kv-font-family-sans`, the heading fallback and the body-role feature settings. No `data-*` changes.

## Tasks

- [x] Vendor the official woff2 and OFL into `apps/docs/fonts/ibm-plex/`, write `ibm-plex.css`
- [x] Design spec (ux-designer): `docs/design/typography-ibm-plex.md`
- [x] Decision recorded
- [x] The earlier theme decisions get an "Amended" note
- [x] `theme.css`: family tokens, heading fallback, feature settings, comments
- [x] Docs site (`apps/docs/app/layout.tsx`, `docs.css`) and Storybook (`preview.tsx`, `preview.css` text guide) import the new CSS; delete `apps/docs/fonts/inter/`
- [x] Remove the temporary font trial (`font-trial.tsx` and its uses in `preview.tsx`)
- [x] Storybook Foundation: Typography and Theming copy and tokens
- [x] DESIGN.md typography, `packages/theme/README.md`, and design docs that name Inter (`docs-site.md`, `storybook-presentation.md`, `foundations-and-prose.md`, `default-theme-button-link.md`, `icon.md`)
- [x] Changeset (`@kvirn-ui/theme`, minor: a new token and a changed default font)
- [x] Gates: `vp check`, `vp test run`, `vp run e2e` (button, typography, card, icon), `theme:check`
- [x] Design review (ux-designer, review mode) of the Typography stories and docs home

## Risks & open questions

- Plex's smaller x-height makes text look slightly smaller at the same size. The spec decides whether any role changes.
- The Icon's `vertical-align` was tuned to Inter's cap height. The spec gives the Plex value. Recheck the icon e2e.
- Plex Serif headings with Inter-tuned negative tracking. The spec sets new values.
- Line length: `--kv-prose-measure: 70ch` is about 92 characters, against DESIGN.md's 60–75, in Inter and Plex alike. Out of scope, its own change.
- Historical plans that mention Inter stay as written. They record what was true then.

## Testing strategy

The standard gates. Plus a check in the browser that the computed font of body text, a button and a prose heading is the self-hosted Plex (CDP `getPlatformFontsForNode`), and the label-centring measurement from the button investigation.

## Rollout

`@kvirn-ui/theme` minor (pre-1.0). Adopters who self-hosted Inter keep it by setting `--kv-font-family-body` and `--kv-font-family-heading`. The changeset says how.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
