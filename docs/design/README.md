# Design specs

Design specs describe **what users see and do**: the flow, content, layout, states and accessibility annotations for a block, flow or visual change. Plans describe how we build it, and ADRs record why.

- The visual source of truth is [DESIGN.md](../../DESIGN.md). Specs use its tokens and never invent values.
- Copy `.claude/skills/design/references/spec-template.md` to `docs/design/<slug>.md`. The `ux-designer` agent does this as part of the `design` skill.
- Statuses: `Draft` → `In review` → `Approved`, and later `Superseded`.
- Every spec is linked from its plan's Design section.

## Index

| Spec                                                                          | Plan                                                  | Status |
| ----------------------------------------------------------------------------- | ----------------------------------------------------- | ------ |
| [Default theme for Button and Link](default-theme-button-link.md)             | [0005](../plans/0005-default-theme-storybook-docs.md) | Draft  |
| [Storybook presentation](storybook-presentation.md)                           | [0005](../plans/0005-default-theme-storybook-docs.md) | Draft  |
| [Docs site shell, template and first pages](docs-site.md)                     | [0005](../plans/0005-default-theme-storybook-docs.md) | Draft  |
| [Prose styles and the Storybook Foundation section](foundations-and-prose.md) | 0006 (to be written)                                  | Draft  |
| [Card](card.md)                                                               | [0007](../plans/0007-card.md)                         | Draft  |
| [Icon and the built-in icon set](icon.md)                                     | [0009](../plans/0009-icon.md)                         | Draft  |
