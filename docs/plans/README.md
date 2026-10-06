# Plans

Plans describe **how** we will build something. Decisions live in the skills and docs they change. A plan records the options it weighed and the one it chose. Write a plan before any work that spans several PRs or packages, or before a new component.

- Copy `0000-template.md` to `NNNN-short-title.md`.
- Statuses: `Draft` → `Approved` → `In progress` → `Done` | `Abandoned`.
- Keep the task checklist current. Agents should tick items off as they go.
- A finished plan (`Done`) is deleted in the change that completes it: its decisions live in the skill or doc that owns them, and `git log -- docs/plans/NNNN-*.md` has the plan itself.
- Keep a plan under 250 lines: a Sonnet agent reads it at every spawn. Link prior art instead of pasting it.

## Index

| #                                                 | Title                                                                        | Status                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| [0005](0005-default-theme-storybook-docs.md)      | Default theme, styled Storybook and docs site                                | In progress                           |
| [0008](0008-storybook-story-conventions.md)       | Storybook story conventions (args-first, autodocs, themes as test projects)  | Implemented                           |
| [0009](0009-icon.md)                              | Icon                                                                         | In progress                           |
| [0013](0013-form-fields.md)                       | Form fields: Field, Fieldset, Input, Checkbox, RadioGroup and DateInput      | Implemented (AT pending)              |
| [0016](0016-foundation-mdx-pages.md)              | Foundation reference pages in MDX                                            | In progress                           |
| [0021](0021-file-upload.md)                       | FileUpload                                                                   | In progress                           |
| [0022](0022-listbox-combobox-autocomplete.md)     | Popover, Listbox, Combobox and Autocomplete                                  | In progress                           |
| [0026](0026-table-and-virtualization.md)          | Table, and virtualized Listbox, Combobox and Autocomplete                    | In progress                           |
| [0030](0030-rich-listbox-options.md)              | Rich Listbox options                                                         | Implemented (review pending)          |
| [0031](0031-pointer-focus-on-text-inputs.md)      | Pointer focus on text inputs                                                 | In progress                           |
| [0036](0036-rich-text-editor.md)                  | Rich text editor (`@kvirn-ui/rich-text`, Tiptap)                             | Approved                              |
| [0037](0037-tooltip.md)                           | Tooltip                                                                      | In progress                           |
| [0038](0038-stories-show-the-real-api.md)         | Stories show the real API                                                    | Draft                                 |
| [0040](0040-date-input-auto-advance.md)           | DateInput moves to the next box when one is full                             | Accepted                              |
| [0043](0043-navigation-and-service-link.md)       | Navigation as its own component, and a service link                          | Implemented (reviewer and AT pending) |
| [0044](0044-icon-libraries.md)                    | Using Lucide and Heroicons with Icon                                         | In progress                           |
| [0047](0047-navigation-t3c-and-horizontal.md)     | Navigation: the T3 C look and a horizontal bar                               | Accepted                              |
| [0048](0048-tabs.md)                              | Tabs                                                                         | Accepted                              |
| [0049](0049-table-of-contents.md)                 | TableOfContents with scroll-spy                                              | Accepted                              |
| [0051](0051-retire-playwright-e2e.md)             | Retire Playwright e2e, test in Vitest browser mode                           | In progress (sweep open)              |
| [0052](0052-docs-on-built-packages.md)            | The docs site consumes the built packages and uses the components as shipped | Draft                                 |
| [0053](0053-docs-as-municipality-site.md)         | The docs site is also a reference municipality site                          | Draft                                 |
| [0054](0054-skip-link-and-visually-hidden.md)     | SkipLink and VisuallyHidden                                                  | In progress                           |
| [0055](0055-route-focus.md)                       | Route focus (`useRouteFocus`)                                                | Draft                                 |
| [0056](0056-layout-components.md)                 | Layout components: Container, Stack, Columns, SidebarLayout                  | In progress                           |
| [0057](0057-docs-component-pages.md)              | A docs page for every component                                              | In progress                           |
| [0058](0058-disclosure-and-accordion.md)          | Disclosure and Accordion                                                     | Approved                              |
| [0059](0059-badge.md)                             | Badge: a static status or category label                                     | In progress                           |
| [0060](0060-copy-button-and-code-block.md)        | CopyButton and CodeBlock                                                     | Approved                              |
| [0061](0061-listbox-lang-and-navigation-label.md) | Listbox `itemToLang` and `Navigation.Label`                                  | In progress                           |
| [0062](0062-breadcrumb-and-pagination.md)         | Breadcrumb and Pagination                                                    | Approved                              |
| [0063](0063-summary-list-and-error-summary.md)    | SummaryList and ErrorSummary                                                 | Approved                              |
| [0064](0064-docs-code-and-example-frame.md)       | Docs-only CodeBlock and ExampleFrame with a highlighter                      | Approved                              |
| [0072](0072-slider.md)                            | Slider (native range input)                                                  | Approved                              |
| [0073](0073-toast-timer-ms-and-ring.md)           | Toast `autoDismiss` in ms and a timer ring                                   | Done                                  |
