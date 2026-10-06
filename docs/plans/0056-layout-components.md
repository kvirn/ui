# Plan 0056: Layout components (Container, Stack, Columns, SidebarLayout)

- **Status:** In progress (code, stories and records done; reviewer, docs adoption and manual AT pending)
- **Owner:** orchestrator → ux-designer (if values change) → component-engineer → accessibility-reviewer
- **Created:** 2026-10-06 · **Target:** M1
- **Related:** [design spec](../design/municipality-reference-site.md) §3 and §10.3, [0053](0053-docs-as-municipality-site.md), `docs/architecture.md#api-conventions`, `api-conventions`, `accessibility`, `keyboard`, `testing`, `storybook-docs`, `theme-css` skills

## Goal

A site author lays out a page (centred container, vertical rhythm, a card or link grid, a sidebar and content) with typed choices and no CSS of their own, and the page reflows at 320px and 400% zoom with the DOM order as the reading and focus order.

## Non-goals

- `Cluster` (rejected: header and footer blocks lay out their own rows, `ButtonGroup` covers buttons; revisit at a third use) and `Grid` (rejected name: it reads as the ARIA `grid`).
- Responsive prop objects, `style`-like props (`padding="13px"`), `reverse`, `order`, dense packing.
- Behaviour: no state, no `data-*`, no hook logic, no client code (usable in a server component). Collapsing a sidebar is Disclosure's job.
- A landmark, role, name or `tabindex`: the consumer chooses the element with `render` and names it.
- Sticky layout.

## Background

None of these exists; the docs shell lays out in `docs.css` (max-width wrappers, the 64rem grid with a sidebar column). The reference site (0053) needs five templates from the same four primitives (spec §3). Naming: namespace for parts, flat for a single element, flat part exports for server components (`architecture.md#api-conventions`). Layout of a small flat component: `packages/react/src/card/` and `heading/` (`use-x.ts`, `x.tsx`, `x.md`, `x.a11y.md`, `x.test.tsx`), `Section` for the existing sibling.

## Design

### API sketch

```tsx
<Container>
  <Stack gap="8">
    <Heading level={1}>Kvirnby kommun</Heading>
    <Columns render={<ul />} minColumnWidth="md" gap="6">
      <li><Card.Root>…</Card.Root></li>
    </Columns>
  </Stack>
</Container>

<SidebarLayout.Root sidebarWidth="md">
  <SidebarLayout.Sidebar render={<nav aria-label="I det här avsnittet" />}>…</SidebarLayout.Sidebar>
  <SidebarLayout.Content>…</SidebarLayout.Content>
</SidebarLayout.Root>
```

| Component          | Parts                        | Props (typed choices)                                                                                                                                                        | Classes                                                                         |
| ------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Container` (flat) | –                            | `size`: `'page'` (default, centred, max `80rem`, inline padding `space-4`/`6`/`10`) · `'reading'` (`45rem`) · `'form'` (`40rem`); the measures are start-aligned, no padding | `kv-container`, `--reading`, `--form`                                           |
| `Stack` (flat)     | –                            | `gap`: `'2'` · `'4'` · `'6'` (default) · `'8'`                                                                                                                               | `kv-stack`, `kv-stack--gap-2/4/6/8`                                             |
| `Columns` (flat)   | –                            | `minColumnWidth`: `'sm'` 14rem · `'md'` 18rem (default) · `'lg'` 24rem; `gap`: `'4'` · `'6'` (default) · `'8'`                                                               | `kv-columns`, `--min-sm/md/lg`, `--gap-4/6/8`                                   |
| `SidebarLayout`    | `Root`, `Sidebar`, `Content` | Root `sidebarWidth`: `'sm'` 16rem · `'md'` 20rem (default); the side follows DOM order, the first part is at inline start                                                    | `kv-sidebar-layout`, `--sidebar-sm/md`, `kv-sidebar-layout-sidebar`, `-content` |

- Each renders a `<div>` by default and supports `render` and the ref; attributes (`id`, `lang`, `aria-*`) pass through. Hooks `useContainer`, `useStack`, `useColumns`, `useSidebarLayout` return the frozen `*Props` objects (`className` only), as `useCard` does. Export `UseXOptions`, `UseXResult` and `XPartProps` for each; `SidebarLayoutPartProps`. Flat part exports (`SidebarLayoutRoot`, `SidebarLayoutSidebar`, `SidebarLayoutContent`) for server components. Parts outside Root warn (`sidebar-layout-<part>-outside-root`).
- Defaults render the base class only; a choice adds one modifier (`kv-stack kv-stack--gap-8`). The `size`, `gap`, `minColumnWidth` and `sidebarWidth` values are validated by their TypeScript union, not at runtime.

### Accessibility contract (draft, one `<name>.a11y.md` each)

APG: none. Layout adds no widget, role, landmark, name, focusable part or key. Focus strategy: native; nothing is a Tab stop and nothing handles a key.

| Key       | Context            | Action                                                | Test (`container.test.tsx ›`, same name per component)  |
| --------- | ------------------ | ----------------------------------------------------- | ------------------------------------------------------- |
| Tab       | any layout element | Not a Tab stop; the children's order is the DOM order | `is not a Tab stop and keeps the children in DOM order` |
| Shift+Tab | any layout element | Not a Tab stop; the reverse DOM order                 | `Shift+Tab walks the children in reverse DOM order`     |

- Roles and ARIA: none implied, none added (a `<div>` has no role). `render={<ul />}` with `<li>` children gives the list role and an announced count; `render={<nav aria-label />}` is a landmark that must be named. `Content` is not `<main>` (one `main` per page).
- Focus: not moved, no `tabindex`. DOM order equals visual order at every width: no `reverse`, `order` or dense-packing prop (1.3.2, 2.4.3).
- Reflow: tracks are `minmax(min(<width>, 100%), 1fr)` and the sidebar stacks below `64rem`, so nothing scrolls sideways at 320px or 400% zoom (1.4.10); no fixed heights (1.4.12).
- Announcements: none.
- WCAG SCs: 1.3.1, 1.3.2, 1.4.10, 1.4.12, 2.4.3 (in the DOM-order test), 4.1.2 (no false role).

### i18n strings

None: layout renders no text and has no `messages` option. A `SidebarLayout.Sidebar` that is a `nav` takes the consumer's own label (they pass it, in their locale).

| Key  | en  | sv  | fi  | nb  | nn  | se  |
| ---- | --- | --- | --- | --- | --- | --- |
| none | –   | –   | –   | –   | –   | –   |

### Theming surface

Classes only (rule 5: zero CSS in the packages; `theme.css` styles them), no `data-*`. `theme.css` gets one section for the four components (zero-specificity `:where()` where it can, in `@layer kv`): `kv-container` (`margin-inline: auto`, `max-inline-size`, `padding-inline` by breakpoint), `kv-stack` (flex column, `gap` from the `space` tokens), `kv-columns` (`display: grid`, `repeat(auto-fit, minmax(min(var(--width), 100%), 1fr))`), `kv-sidebar-layout` (one column; from `64rem` two tracks `<sidebar-width> minmax(0, 1fr)` with logical properties so RTL mirrors). All four classes join the not-prose lists (`theme.css` header and the comment near the not-prose rule, and `theme-css/SKILL.md`) so prose margins never fight the gap. Only existing `space` tokens: no new token, no colour, no pair (`theme:check` unchanged). The two container measures and the column and sidebar widths are layout constants (not tokens): they live as rem values in the section, named in the DESIGN.md text.

## Tasks

- [x] Failing tests first: one `*.test.tsx` per component (the two rows, element and `render` (`ul`, `nav`), no role or `tabindex` added, attributes and ref pass through, each choice adds only its modifier class, defaults, parts outside Root warn, `renderToString` in a server render, axe, RTL order), plus `naming.test.tsx` and `tooling/component-naming/component-naming.test.ts`
- [x] `packages/react/src/container/`, `stack/`, `columns/`, `sidebar-layout/`: `use-x.ts`, `x.tsx`, `x.md`, `x.a11y.md` (the layout of `card/`); the `SidebarLayout` namespace with flat part exports; exports in `index.ts`
- [x] `theme.css`: the four classes, the not-prose lists, the header list; `vp run theme:check`
- [x] **`DESIGN.md` "Layout" section (needs maintainer approval at review):** containers `80rem`/`45rem`/`40rem`, the page padding steps, the `space` steps for gaps, column minimums, the sidebar widths and the `64rem` break, DOM order is visual order, nothing sticky
- [x] Storybook `components/container/`, `stack/`, `columns/`, `sidebar-layout/` (one stories file each): Default, every choice, as a list (`Columns render={<ul />}`), as `nav` (`SidebarLayout`), Reflow320 (a long Finnish word), RTL, ForcedColors, `parameters.a11yContract`; no `Keyboard` story (no focusable part, stated in the contract)
- [ ] Docs: `api-conventions/SKILL.md` (flat and namespace lists), `theme-css/SKILL.md`, `dev-warnings.md`, a "Layout" docs page with the rejected `Cluster`/`Grid` and the order rule; `docs/design/README.md` link
- [ ] Docs site adoption (`apps/docs`, follow-up to 0052/0053): replace the `docs.css` wrappers and the 64rem grid with `Container` and `SidebarLayout`
- [x] Changeset `.changeset/layout-components.md` (react, theme minor), roadmap row (layout components), `docs/plans/README.md`
- [ ] Orchestrator: the gates, then `accessibility-reviewer`; the 320px and zoom check by hand `pending`

## Decisions

- **React components, not bare theme classes:** maintainer, spec §10.3, 2026-10-06.
- **Four, not five:** `Cluster` and `Grid` rejected (spec §3). `Columns` rather than `Grid`: "grid" reads as the ARIA role.
- **Typed choices, no free CSS and no responsive props:** a site changes values in CSS, so the choices stay a small, tested set.
- **Flat for single elements, namespace for `SidebarLayout`:** `architecture.md` naming rule, with flat part exports for server components.
- **No hook behaviour and no `'use client'`:** a `use-x.ts` returns frozen class props only (as `useCard`), so the components are server-safe. Exception, decided in review: `sidebar-layout.tsx` keeps `'use client'` because its outside-Root warning (a context and an effect) needs it. The other layout components stay server-safe.
- **`.Content` is not `<main>`:** a page has one `main`; `render` picks the element.
- **DOM order is the only order:** no `reverse` or `order` (1.3.2, 2.4.3).
- **Values are layout constants, not tokens:** containers and column minimums are rem measures, not part of the token budget; the `DESIGN.md` "Layout" section records them. Needs the maintainer's approval at review (a DESIGN.md rule).
- **Contracts use the no-keys sentence (implementation):** the focus-strategy line moved from the Keyboard section to Focus management, because `tooling/keyboard-docs` wants either the sentence or the four focus lines. The Tab rows stay, each with a named test.
- **`SidebarLayout` has no 320px wrapper story (implementation):** it stacks by viewport width (`64rem`), so a 320px column in a wide page stays two-column. The story is `LongWord` (wrapping, DOM order, axe); the 320px check stays manual and Plan 0051's.
- **Stories outline the layouts with `Card` (implementation):** the layouts draw nothing.

## Risks & open questions

- Question (maintainer): are `80rem`, `45rem`, `40rem` and the `space-4/6/10` padding steps final? They come from the spec, not from a measured DESIGN.md rule; the DESIGN.md task makes them one.
- `render={<ul />}` on `Columns` leaves `list-style` and padding to the theme; the prose and not-prose rule must reset them (a test for the `ul` list role stays in the browser, not for the CSS).
- Container queries or `:has()` would be nicer than the viewport break for `SidebarLayout`; viewport `64rem` is kept to match the docs shell.

## Testing strategy

Rule 13: no computed styles. The tests prove the element, role (none implied), classes as the API, `render`, DOM and focus order, no extra Tab stops, SSR output and axe. Reflow is proved by a story at 320px with axe; the sweep for 320px and zoom is Plan 0051's.

## Rollout

`.changeset/layout-components.md`: `@kvirn-ui/react` and `@kvirn-ui/theme` minor.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT and the manual zoom check may be `pending`)
- [ ] The maintainer approved the `DESIGN.md` "Layout" section at review
- [ ] accessibility-reviewer APPROVE
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
