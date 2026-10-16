# Plan 0125: Wider heading scale (h1–h6)

- **Status:** Done (scale approved by the maintainer 2026-10-16; 320px visual check pending)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-16 · **Target:** alpha
- **Related:** [heading-scale.md](../heading-scale.md) (the spec, owns the table), `theme-css` skill, `DESIGN.md` typography, `packages/react/src/heading/heading.a11y.md`

## Goal

Headings h1–h6 are told apart at a glance by size, not only by weight. The span is wider and the prose margins follow Tailwind Typography's rhythm.

## Non-goals

- Body, lead, label and code sizes, colours, contrast pairs, fonts.
- The `Heading` API (`as`, `size`) and `.kv-heading--*` class names.
- Moving h2 to weight 600 (noted in the spec, not decided).

## Background

Today h4–h6 are all 1rem and h3 is 1.125rem, so the six levels look alike. Tailwind `prose` puts h1 at 2.25× body with larger top than bottom margins. Facts and rejected options are in the spec.

## Design

### Scale (token change, approved)

| Role      | Desktop       | Mobile (<40rem) | Weight | Line height | Prose margin top / bottom     |
| --------- | ------------- | --------------- | ------ | ----------- | ----------------------------- |
| display   | 3rem (48)     | 2.25rem (36)    | 600    | 1.2         | none                          |
| heading-1 | 2.25rem (36)  | 1.875rem (30)   | 600    | 1.2         | 0 / space-8                   |
| heading-2 | 1.875rem (30) | 1.625rem (26)   | 500    | 1.25        | prose-space-section / space-4 |
| heading-3 | 1.5rem (24)   | 1.375rem (22)   | 600    | 1.3         | space-8 / space-3             |
| heading-4 | 1.25rem (20)  | same            | 600    | 1.4         | space-6 / space-2             |
| heading-5 | 1rem (16)     | same            | 500    | 1.4         | space-5 / space-2             |
| heading-6 | 0.875rem (14) | same            | 500    | 1.5         | space-5 / space-2             |

h6 keeps tracking 0.03em. rem margins (space tokens), not em, so prose size classes keep working.

### Consumers of the heading size tokens (pinned to today's size)

- Calendar heading, map list heading and details title, the logo name at `patterns.css:680` → `--kv-font-body-size` (16px). Header-primary logo name (`patterns.css:277, 427`) → literal 1.375rem / 1.75rem (today's size).
- Steps marker (`theme.css:3440`) → `--kv-font-body-large-size` (18px).
- Dialog title and close button (`theme.css:5596, 5658`) → heading-3 (24px, 22px mobile).
- Fieldset legend heading (`theme.css:6258`) keeps following h1.

### Accessibility contract (draft)

No keyboard change. WCAG: 1.3.1 (level stays semantic; `.kv-heading` size is independent of the tag), 1.4.4 and 1.4.10 (rem sizes, long compounds wrap), 1.4.12 (line heights hold), 1.4.3 unchanged. **A11y trade-off, maintainer-approved:** h6 is 14px, below the body size. WCAG sets no minimum font size; h6 keeps weight 500, the heading family and a 1.5 line height.

### Theming surface

`--kv-font-heading-N-size` / `-line-height` values change; no new tokens.

## Tasks

- [x] ux-designer: spec revised for the 14px floor (owner: ux-designer)
- [x] A (component-engineer): `theme.css` scale, mobile steps, prose margins, `text-wrap: balance` on h3 and `--heading-3`, consumer remaps; `map.css`, `patterns.css` remaps
- [x] B (component-engineer): `DESIGN.md` (159, 165, 167, 171–175; fix 171), `heading.a11y.md:50`, `docs/design/typography-ibm-plex.md:62–68`, `docs/design/foundations-and-prose.md:169`, `typography.stories.tsx` (mobile list, Heading levels text), `apps/docs/components/heading-page.tsx:120`, `apps/storybook/.storybook/preview.css:603` check
- [x] Gates: vp check ✓, theme:check ✓, packages/theme + heading tests 88 ✓, 8 story files in all themes (axe) 424 ✓
- [x] accessibility-reviewer on the diff (APPROVE, no blocking; doc drift being fixed)
- [x] `vp fmt` on changed files; roadmap line; README row

## Decisions

- Option A scale, h1 = 2.25× body (Tailwind), ~1.2 steps down. Rejected: a pure 1.2 scale (h5 = lead size, h1 too big), Tailwind as-is (h4–h6 same size), em margins (don't follow prose size tokens, off the 4px grid).
- Floor lowered from 16px to 14px by the maintainer (h6 14, h5 16, h4 20). A trade-off, approved.
- Non-heading consumers are pinned to today's sizes (maintainer chose this).
- Header-primary logo name is pinned to its literal 1.375rem / 1.75rem (it followed heading-2 / heading-1); the other logo, calendar and map titles use body size. My brief first sent all three to body size and shrank the header logo; fixed.
- Side effects, recorded: the dialog title moves from weight 500 to 600 (heading-3 tokens); two `level={n}` → `as="hN"` doc fixes (`packages/theme/README.md:44`, the theme.css heading comment) were included; standalone `.kv-heading` (heading-4 look) grows 16 → 20px; the fieldset legend heading follows h1 (36px, 30px mobile) and wraps.
- Reviewer (accessibility-reviewer): APPROVE, conditional on green tests and axe. Non-blocking doc drift fixed by a follow-up docs pass.
- display/h1 keep line height 1.2 so Å clears the line above.

## Risks & open questions

- Storybook axe and layout in every theme: larger headings can overflow narrow cards. Check the Card, Dialog, Alert and Section stories.
- Docs-site pages use prose headings and will grow; check the page chrome at 320px.

## Testing strategy

No new tests: no test pins heading sizes (rule 13). The existing heading, prose and theme tests and the storybook axe projects must stay green; `theme:check` for contrast.

## Rollout

Visual change in the default theme; no API change, no changeset (off until alpha).

## Done when

- [x] Scoped gates pass (whole-tree run is CI)
- [ ] Plan tasks ticked, `docs/roadmap.md` updated
