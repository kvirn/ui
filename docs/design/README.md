# Design specs

Design specs describe **what users see and do**: the flow, content, layout, states and accessibility annotations for a block, flow or visual change. Plans describe how we build it, and ADRs record why.

- The visual source of truth is [DESIGN.md](../../DESIGN.md). Specs use its tokens and never invent values.
- Copy `.claude/skills/design/references/spec-template.md` to `docs/design/<slug>.md`. The `ux-designer` agent does this as part of the `design` skill.
- Statuses: `Draft` → `In review` → `Approved`, and later `Superseded`.
- Every spec is linked from its plan's Design section.

## Index

| Spec                                                                                                                    | Plan                                                                                                   | Status    |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------- |
| [Default theme for Button and Link](default-theme-button-link.md)                                                       | [0005](../plans/0005-default-theme-storybook-docs.md)                                                  | Draft     |
| [Storybook presentation](storybook-presentation.md)                                                                     | [0005](../plans/0005-default-theme-storybook-docs.md)                                                  | Draft     |
| [Docs site shell, template and first pages](docs-site.md)                                                               | [0005](../plans/0005-default-theme-storybook-docs.md)                                                  | Draft     |
| [Prose styles and the Storybook Foundation section](foundations-and-prose.md)                                           | 0006 (to be written)                                                                                   | Draft     |
| [Card](card.md)                                                                                                         | [0007](../plans/0007-card.md)                                                                          | Draft     |
| [Icon and the built-in icon set](icon.md)                                                                               | [0009](../plans/0009-icon.md)                                                                          | Draft     |
| [IBM Plex Sans and Serif replace Inter](typography-ibm-plex.md)                                                         | [0011](../plans/0011-ibm-plex-typography.md)                                                           | Draft     |
| [Button depth: D, Grounded, chosen (ADR-0026)](button-depth.md)                                                         | to be written (handoff in section 10)                                                                  | Draft     |
| [Form fields: Field, Fieldset, Input, InputGroup, Checkbox, RadioGroup, DateInput (ADR-0031 order)](form-fields.md)     | [0013](../plans/0013-form-fields.md)                                                                   | Draft     |
| [OneTimeCode: one input with drawn boxes and separators from a pattern, and the plain-field fallback](one-time-code.md) | [0014](../plans/0014-input-masks-and-one-time-code.md), [0019](../plans/0019-one-time-code-pattern.md) | Draft     |
| [Notification: status messages (info, success, warning, danger), the vocabulary, and when to announce](notification.md) | [0020](../plans/0020-notification.md)                                                                  | Draft     |
| [Section: the level 1 container, and Card is level 2 only (ADR-0044)](section.md)                                       | [0018](../plans/0018-section.md)                                                                       | Draft     |
| [FileUpload: trigger, drop zone, file list, rejections, progress and the announcement timeline](file-upload.md)         | [0021](../plans/0021-file-upload.md)                                                                   | Draft     |
| [Listbox, Combobox, Autocomplete and the Popover popup: default theme and design review](combobox.md)                   | [0022](../plans/0022-listbox-combobox-autocomplete.md)                                                 | In review |
