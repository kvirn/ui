# ADR-0041: Foundation reference pages are MDX with static tables

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike
- **Tags:** docs | storybook

## Context

The Foundation pages for Overview, Spacing, Radius, Borders and elevation, Focus ring, Motion, Density, Layout and Theming were React stories that read their values live from the page (ADR-0023, design spec §6.6). They were demos, with a play function each, and axe ran on them in four themes. But these pages are reference material: they explain what a token is, what it's for and what it means for accessibility. The Introduction is already MDX and reads well as a document. The stories were long to write, hard to read as prose, and inconsistent with each other.

## Decision

- The nine pages are MDX files in `apps/storybook/src/foundation/`, titled `Foundation/<Name>`, and each has a Docs page and no story.
- They follow one template: a title and a short lead, then `## Tokens` (tables), `## Usage`, `## Accessibility`, `## Customising` and `## Related`. A page leaves a section out only when it has nothing to say there.
- Values are static, in Markdown tables. A test, `tooling/foundation-docs/foundation-docs.test.ts`, checks that every token in a `## Tokens` table exists on `:root` in `theme.css` and that its first code cell is its value (a `var()` is resolved), so a change to `theme.css` fails the test instead of leaving the page stale.
- Tables need GitHub-flavoured Markdown, which MDX doesn't parse by itself. `remark-gfm` is added as a devDependency of `apps/storybook` only, pinned exactly in the catalog, and enabled through `mdxPluginOptions` in `.storybook/main.ts`. It is build tooling: no package ships it, and it makes no network calls.
- Colors, Typography, Prose and KvirnProvider stay stories: they measure and render things, such as contrast, glyphs and an article.

## Consequences

- ✅ Pages read as documents, and a maintainer can edit them without React.
- ✅ A renamed or changed token fails `vp test run`.
- ⚠️ The pages no longer show an override live: they describe `theme.css`, not the page's own theme.
- ⚠️ The play functions are gone with the stories: the focus ring on each background, the control heights at 24px and the no-sideways-scroll check. The contrast pairs are still guarded by `vp run theme:check`, and the components' sizes and focus rings by their own tests and the e2e projects. The Docs pages aren't stories, so axe doesn't run on them. Review them by hand, in the four themes.
- Supersedes the parts of design spec §6.6 and ADR-0019 (item 6) that describe the live Theming demo.

## References

- ADR-0023 (story conventions), ADR-0019 (role scales), `docs/design/foundations-and-prose.md` §6.6
