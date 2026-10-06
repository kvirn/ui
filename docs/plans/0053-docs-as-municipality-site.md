# Plan 0053: The docs site is also a reference municipality site

- **Status:** Draft
- **Owner:** orchestrator / ux-designer
- **Created:** 2026-10-06 · **Target:** M4 pilot
- **Related:** [0052](0052-docs-on-built-packages.md), [docs/roadmap.md](../roadmap.md) (Blocks, M4), `docs/design/docs-site.md`

## Goal

`apps/docs` serves two purposes at once. It is the documentation for people who evaluate and use KvirnUI, and it is a complete reference website for a Nordic municipality: the page types, layouts, blocks and patterns such a site needs, built only from `@kvirn-ui/*` and `theme.css`, the way an adopter builds theirs. An evaluator can open a reference page, see the real thing, and copy it. Every flaw we hit building it is a flaw in the library, and gets fixed there.

## Non-goals

- A real municipality's content or brand. The reference site uses a fictional municipality and the default theme (a rebrandable default, not a brand).
- Claiming compliance: say "designed and tested to meet WCAG 2.2 AA".
- Skipping the library. No block, pattern or page type exists first in `apps/docs`.

## Working rule: the library first

1. A page or pattern needs something that isn't in `@kvirn-ui/*` yet: build it there, in the order of [docs/roadmap.md](../roadmap.md) (primitives, then M4 blocks), with the usual gates, a `ux-designer` spec for anything visual, and stories.
2. The maintainer reviews it in Storybook.
3. Only then `apps/docs` uses it on a reference page, and its end-user documentation page is added to the docs app.
4. A thin docs wrapper is allowed for a missing piece (Plan 0052), and is listed as a gap with the plan that removes it.

## Design

The inventory (page types, layouts, blocks and patterns, each with the library parts it needs, what is missing against the roadmap, and a build order) is the `ux-designer` spec [docs/design/municipality-reference-site.md](../design/municipality-reference-site.md) (Accepted, 2026-10-06: Kvirnby kommun in sv and en, 22 page types, 6 templates, 4 layout components, slices S0–S7 in its §5, the maintainer's decisions in its §10). This plan links it, and takes its build order as the task list once the maintainer accepts it.

## Tasks

- [ ] `ux-designer` spec: `docs/design/municipality-reference-site.md`
- [ ] Maintainer accepts the inventory and the build order
- [ ] One task per slice of that order: library first, then Storybook review, then the docs app and its documentation page
- [ ] `docs/roadmap.md` rows updated as pieces land

## Decisions

- **Library first, docs second** (maintainer, 2026-10-06). The roadmap is the order.

## Risks & open questions

- Scope: a full municipality site is large. The spec ranks the slices by value, and each slice ships on its own.
- Reference content needs a fictional municipality and plain-language copy in the locales the site shows.

- **Docs adoption (2026-10-06):** `apps/docs` now uses Disclosure (Display settings, nav groups), Navigation.Label, Badge, CodeBlock and Listbox `native="always"` with `itemToLang`; only the Menu keeps `DocsDisclosure` (breakpoint panel unsupported by Disclosure).

## Done when

- [ ] Every page type and block in the accepted inventory exists in `@kvirn-ui/*`, in Storybook, and on a reference page in `apps/docs`, with its documentation
- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` updated
