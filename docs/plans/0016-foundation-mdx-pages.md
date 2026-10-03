# Plan 0016: Foundation reference pages in MDX

- **Status:** In progress
- **Owner:** Maintainer / Claude
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** Plan 0006, design spec [foundations-and-prose.md](../design/foundations-and-prose.md) §6.6

## Goal

A reader who wants to know what a foundation is, which tokens it has and how to use it opens one page with the same sections as every other Foundation page, written like the Introduction.

## Non-goals

- Colors, Typography, Prose and KvirnProvider stay as they are.
- No token, theme or component changes.

## Design

One template for Overview, Spacing, Radius, Borders and elevation, Focus ring, Motion, Density, Layout and Theming: title and lead, `## Tokens`, `## Usage`, `## Accessibility`, `## Customising`, `## Related`. Theming and Overview have no `## Tokens` table of their own, so they use the sections that fit (the three levels, the classes you add).

### Accessibility contract (draft)

Docs pages only, with no interactive parts. Tables use Markdown, so they get headers. Links have text that says where they go. Each page's Accessibility section names the SCs its tokens serve.

## Tasks

- [x] Nine MDX pages, replacing nine stories
- [x] `tooling/foundation-docs` test: tokens and values match `theme.css`
- [x] Decision recorded, design spec note, README link
- [ ] Look at each page in Storybook in light, dark and the two high-contrast themes (manual)

## Risks & open questions

- Docs pages aren't stories, so axe doesn't run on them.
- The Storybook `?path=` links between pages can't be checked by the test.

## Testing strategy

`vp test run`, with the new node test. `vp check`. A Storybook build, to prove the MDX compiles and every title is unique.

## Done when

- [ ] `vp check` and `vp test run` pass
- [ ] Plan tasks ticked
