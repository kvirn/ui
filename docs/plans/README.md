# Plans

Plans describe **how** we will build something. Decisions live in the skills and docs they change. A plan records the options it weighed and the one it chose. Write a plan before any work that spans several PRs or packages, or before a new component.

- Copy `0000-template.md` to `NNNN-short-title.md`.
- Statuses: `Draft` → `Approved` → `In progress` → `Done` | `Abandoned`.
- Keep the task checklist current. Agents should tick items off as they go.
- A plan is deleted in the change that finishes its code and gates. Review and the manual AT matrix are Beta blockers in `docs/roadmap.md`, not plan tasks; its decisions live in the skill or doc that owns them, and `git log -- docs/plans/NNNN-*.md` has the plan itself.
- Keep a plan under 250 lines: a Sonnet agent reads it at every spawn. Link prior art instead of pasting it.

## Index

| #                                             | Title                                                                        | Status                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| [0005](0005-default-theme-storybook-docs.md)  | Default theme, styled Storybook and docs site                                | In progress                                      |
| [0009](0009-icon.md)                          | Icon                                                                         | In progress (API follow-up open)                 |
| [0031](0031-pointer-focus-on-text-inputs.md)  | Pointer focus on text inputs                                                 | In progress (5 follow-ups)                       |
| [0051](0051-retire-playwright-e2e.md)         | Retire Playwright e2e, test in Vitest browser mode                           | In progress (sweep open)                         |
| [0052](0052-docs-on-built-packages.md)        | The docs site consumes the built packages and uses the components as shipped | In progress                                      |
| [0053](0053-docs-as-municipality-site.md)     | The docs site is also a reference municipality site                          | Draft                                            |
| [0054](0054-skip-link-and-visually-hidden.md) | SkipLink and VisuallyHidden                                                  | In progress (docs adoption open)                 |
| [0056](0056-layout-components.md)             | Layout components: Container, Stack, Columns, SidebarLayout                  | In progress (docs adoption open)                 |
| [0057](0057-docs-component-pages.md)          | A docs page for every component                                              | In progress                                      |
| [0064](0064-docs-code-and-example-frame.md)   | Docs-only CodeBlock and ExampleFrame with a highlighter                      | Approved                                         |
| [0066](0066-react-compiler-lint-warnings.md)  | React Compiler lint warnings                                                 | Draft                                            |
| [0080](0080-loading-indicators.md)            | Loading indicators: spinner and animated gradient bar                        | Implemented (engineering check Q7, spec §8 open) |
| [0088](0088-read-aloud.md)                    | ReadAloud: text to speech player and selection reader (browser engine)       | Approved                                         |
