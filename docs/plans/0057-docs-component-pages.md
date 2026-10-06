# Plan 0057: A docs page for every component

- **Status:** In progress (template and Button reference page first)
- **Owner:** orchestrator / component-engineer
- **Created:** 2026-10-06 · **Target:** before `beta`
- **Related:** [0052](0052-docs-on-built-packages.md), [0053](0053-docs-as-municipality-site.md), `docs/design/docs-component-page.md`

## Goal

Every public component has a page in the Next.js docs app, in one fixed order: name; description (what, when, where); main example; use-case examples, each with its detailed API and source code; accessibility tips and implementation notes; keyboard; announcements (only if the component has any); detailed API and child components. Notes (cards) give "Did you know", "Implement like this" and "Don't forget". Every docs page has a table of contents.

## Non-goals

- Storybook Docs pages (they keep their own template).
- New components. A page for a component that doesn't exist waits for the library (Plan 0053).

## Design

The spec is `docs/design/docs-component-page.md`. The template is `ComponentPage` (apps/docs/components). Accessibility, Keyboard and Announcements are parsed from each `<name>.a11y.md` at build time and fail the build on any unknown structure. Examples live in `apps/docs/examples/<name>/` and the page shows each file's own text. API rows are typed, so a missing or extra prop is a type error. Button is the reference page, and its checklist is in the spec.

## Tasks

- [x] Spec, template (`ComponentPage`, `Note`, `UseCase`, `ApiBlock`), contract parser and sections
- [ ] Button reference page, Foundation Theming page, Installation on Home
- [ ] Navigation lists every page (one change, after the pages exist)
- [ ] Pages, one per component (a writer owns `app/components/<name>/` and `examples/<name>/`; none edits navigation, `en.ts` or adds a test):
  - [ ] Actions: button-group, toggle, toolbar, link
  - [ ] Content: card, section, heading, prose, kbd, icon, alert
  - [ ] Layout: container, stack, columns, sidebar-layout, visually-hidden, skip-link, route-focus
  - [ ] Navigation: navigation, tabs, table-of-contents
  - [ ] Forms: field, fieldset, text-input, textarea, number-input, input-group, date-input, one-time-code, checkbox, checkbox-group, radio-group, file-upload
  - [ ] Choice and overlays: listbox, combobox, autocomplete, popover, tooltip
  - [ ] Data and behaviour: table, announcer
- [ ] `docs/roadmap.md` (Docs site row) updated

## Decisions

- Page status stays a typed field on the page; the contract template is unchanged (maintainer: no change).
- Installation and Styling leave the component page (Home and a Foundation Theming page).
- **`apps/docs` has no tests** (maintainer, 2026-10-06). Docs are read-only; components are tested in their packages and in Storybook. The build fails on a contract it can't parse, and typed API rows fail `vp check`.
- Where a contract opens with the no-keys sentence, the Keyboard section is one sentence and its rows are not shown.

## Risks & open questions

- A doc and the source can disagree. The writer lists it and does not edit `packages/*`; the orchestrator decides.
- A component with no `.a11y.md` (`mask`, `character-count`) has no page until its contract exists.

- **Library parts adopted (2026-10-06):** the template status line uses `Badge`, and `CodeBlock` wraps the library part with the same `code` prop plus an optional `label`.

## Done when

- [ ] Every row above has a page built from the template. API rows are typed against the real props, so a missing prop fails `vp check`. **No tests in `apps/docs`** (maintainer)
- [ ] `vp check`, the docs tests and the docs build green; reviewer APPROVE once at the end
