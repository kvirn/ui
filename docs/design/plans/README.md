# Plans

Plans describe **how** we will build something. Decisions live in the skills and docs they change. A plan records the options it weighed and the one it chose. Write a plan before any work that spans several PRs or packages, or before a new component.

- Copy `0000-template.md` to `NNNN-short-title.md`.
- Statuses: `Draft` → `Approved` → `In progress` → `Done` | `Abandoned`.
- Keep the task checklist current. Agents should tick items off as they go.
- A plan is deleted in the change that finishes its code and gates. Review and the manual AT matrix are Beta blockers in `docs/roadmap.md`, not plan tasks; its decisions live in the skill or doc that owns them, and `git log -- docs/design/plans/NNNN-*.md` has the plan itself.
- Keep a plan under 250 lines: a Sonnet agent reads it at every spawn. Link prior art instead of pasting it.

## Index

| #                                           | Title                                                            | Status        |
| ------------------------------------------- | ---------------------------------------------------------------- | ------------- |
| [0088](0088-read-aloud.md)                  | ReadAloud (text to speech player and selection reader)           | In progress   |
| [0118](0118-docs-back-to-top.md)            | Back to top on the docs site                                     | Done          |
| [0122](0122-quick-exit.md)                  | QuickExit (leave a sensitive page in one action)                 | In progress   |
| [0123](0123-english-only-prose.md)          | English-only prose, examples and fixtures                        | Done          |
| [0124](0124-icon-library.md)                | Icon library (`@kvirn-ui/icons`, 257 outline icons)              | Done (agents) |
| [0125](0125-heading-scale.md)               | Wider heading scale (h1–h6)                                      | Done          |
| [0126](0126-spinner-icon.md)                | The spinner is an icon (`<Icon name="spinner">`)                 | Done (agents) |
| [0127](0127-icon-variant-and-stroke.md)     | Icon variant, stroke classes, spinner in Icons/Library           | Done (agents) |
| [0128](0128-icons-replace-built-ins.md)     | Default icons come from `@kvirn-ui/icons`, no built-ins in react | Draft         |
| [0129](0129-map-richtext-library-icons.md)  | Map and rich-text on library icons; `@kvirn-ui/icons` public     | In progress   |
| [0130](0130-icon-name-registry-only.md)     | No default icons; `name` resolves only the app's registry        | Done (agents) |
| [0131](0131-letterform-text-style-icons.md) | Bold, italic, underline, strike icons as B/I/U/S letterforms     | Done (agents) |
| [0133](0133-heading-levels.md)              | Heading icons H1–H6; levels 2–6 in the text type picker          | Done (agents) |
