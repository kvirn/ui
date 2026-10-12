# Plans

Plans describe **how** we will build something. Decisions live in the skills and docs they change. A plan records the options it weighed and the one it chose. Write a plan before any work that spans several PRs or packages, or before a new component.

- Copy `0000-template.md` to `NNNN-short-title.md`.
- Statuses: `Draft` → `Approved` → `In progress` → `Done` | `Abandoned`.
- Keep the task checklist current. Agents should tick items off as they go.
- A plan is deleted in the change that finishes its code and gates. Review and the manual AT matrix are Beta blockers in `docs/roadmap.md`, not plan tasks; its decisions live in the skill or doc that owns them, and `git log -- docs/plans/NNNN-*.md` has the plan itself.
- Keep a plan under 250 lines: a Sonnet agent reads it at every spawn. Link prior art instead of pasting it.

## Index

| #                                                    | Title                                                                           | Status                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| [0009](0009-icon.md)                                 | Icon                                                                            | In progress                  |
| [0031](0031-pointer-focus-on-text-inputs.md)         | Pointer focus on text inputs                                                    | In progress                  |
| [0051](0051-retire-playwright-e2e.md)                | Retire Playwright e2e, test in Vitest browser mode                              | In progress                  |
| [0052](0052-docs-on-built-packages.md)               | The docs site consumes the built packages, and uses the components as they ship | In progress                  |
| [0053](0053-docs-as-municipality-site.md)            | The docs site is also a reference municipality site                             | In progress                  |
| [0064](0064-docs-code-and-example-frame.md)          | Docs-only CodeBlock and ExampleFrame with a highlighter                         | In progress                  |
| [0066](0066-react-compiler-lint-warnings.md)         | Clear the React Compiler lint warnings                                          | In progress                  |
| [0080](0080-loading-indicators.md)                   | Loading indicators (spinner, animated gradient bar)                             | In progress                  |
| [0088](0088-read-aloud.md)                           | ReadAloud (text to speech player and selection reader)                          | In progress                  |
| [0090](0090-docs-header-and-landing.md)              | Docs site header, sections and landing page                                     | In progress                  |
| [0091](0091-landing-v2-evidence.md)                  | Landing v2, proof over adjectives                                               | In progress                  |
| [0092](0092-motion-preference.md)                    | Motion as a theme preference                                                    | In progress                  |
| [0093](0093-as-prop-replaces-render.md)              | `as` replaces `render`                                                          | In progress                  |
| [0095](0095-storybook-patterns-and-content-types.md) | Storybook Patterns and Content types, the shell of the reference site           | In progress                  |
| [0096](0096-variation-and-provider-language.md)      | One rule for variation, and language only from the provider                     | In progress                  |
| [0097](0097-icon-size-in-pixels.md)                  | Icon `size` is a pixel string, converted to rem by a class                      | In progress                  |
| [0100](0100-docs-galleries.md)                       | Galleries for Components, Patterns and Content types                            | In progress                  |
| [0102](0102-breadcrumb-separator.md)                 | Breadcrumb separator                                                            | In progress                  |
| [0103](0103-docs-shell-mega-menu.md)                 | Docs shell, mega menu in the masthead and the PageHeader pattern                | In progress                  |
| [0104](0104-top-bar-component.md)                    | Top bar as a component in @kvirn-ui/react                                       | In progress                  |
| [0107](0107-accessibility-settings-page.md)          | Accessibility settings page (docs site)                                         | In progress                  |
| [0108](0108-grid.md)                                 | Grid                                                                            | Done (remove once committed) |
