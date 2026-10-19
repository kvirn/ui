# Plans

Plans describe **how** we will build something. Decisions live in the skills and docs they change. A plan records the options it weighed and the one it chose. Write a plan before any work that spans several PRs or packages, or before a new component.

- Copy `0000-template.md` to `NNNN-short-title.md`.
- Statuses: `Draft` → `Approved` → `In progress` → `Done` | `Abandoned`.
- Keep the task checklist current. Agents should tick items off as they go.
- A plan is deleted in the change that finishes its code and gates. Review and the manual AT matrix are Beta blockers in `docs/roadmap.md`, not plan tasks; its decisions live in the skill or doc that owns them, and `git log -- docs/design/plans/NNNN-*.md` has the plan itself.
- Keep a plan under 250 lines: a Sonnet agent reads it at every spawn. Link prior art instead of pasting it.

## Index

| #                                                        | Title                                                             | Status      |
| -------------------------------------------------------- | ----------------------------------------------------------------- | ----------- |
| [0117](0117-map-and-address-search.md)                   | Map, layers and AddressSearch                                     | In progress |
| [0088](0088-read-aloud.md)                               | ReadAloud (text to speech player and selection reader)            | In progress |
| [0122](0122-quick-exit.md)                               | QuickExit (leave a sensitive page in one action)                  | In progress |
| [0128](0128-icons-replace-built-ins.md)                  | Default icons come from `@kvirn-ui/icons`, no built-ins in react  | Draft       |
| [0129](0129-map-richtext-library-icons.md)               | Map and rich-text on library icons; `@kvirn-ui/icons` public      | In progress |
| [0135](0135-skip-panel-docs-site.md)                     | SkipPanel on the docs site, HelpLink, `mod`, shortcuts setting    | In progress |
| [0136](0136-divider.md)                                  | Divider (`<hr>` with CSS-variable margin, width, colour)          | In progress |
| [0139](0139-matrix-automated-tier-and-derived-status.md) | Automated matrix tier, `n/a` rows, status derived from the matrix | Approved    |
| [0140](0140-smaller-at-matrix.md)                        | A smaller AT matrix: most common screen readers only              | Approved    |
| [0141](0141-sweeps-in-ci-and-testing-upkeep.md)          | Display-mode sweeps in CI; Testing upkeep in the docs workflow    | Approved    |
| [0143](0143-status-badge.md)                             | A coloured testing status badge on component pages                | In progress |
| [0144](0144-icon-additions.md)                           | Icon additions: reversed cuts, counterparts, social marks         | In progress |
