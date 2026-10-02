# Plan 0018: Section

- **Status:** Draft
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** ADR-0044 (Proposed), ADR-0013, ADR-0020, design spec [section.md](../design/section.md)

## Goal

Adopters lay out a page with one plain container for a region (a sidebar, a band of content), and the docs say when to use it and when to use Card. Card is then only the level 2 object.

## Non-goals

- Header, Body or Footer parts, a title, or any behaviour. A Section is a container and nothing else.
- Landmarks by default. A landmark is the consumer's choice via `render`, and it must be named.
- A region edge in the contrast themes, a one-edge class, a site-wide padding default, and moving the docs site's sidebar (spec §10, later).

## Background

- No APG pattern. Native `<div>` by default.
- WCAG: 1.3.1 (the consumer's semantics survive), 1.4.3 and 1.4.11 (pairs on `surface` and `canvas` are already in `contrast-requirements.ts`), 1.4.10 (320px reflow), 1.4.12, forced colours.
- Prior art: Aksel `Box`, Radix Themes `Section`.

## Design

Design spec: [docs/design/section.md](../design/section.md) (ux-designer, Draft). Section is elevation level 1: `surface` by default or `kv-section--canvas`; padding `kv-section--padding-none|sm|md|lg` (default `md`, Card's steps, compact step-down); square, no shadow, a 1px transparent border that is `CanvasText` in forced colours; renders a `<div>`, and landmarks are opt-in and named via `render`. Card loses `kv-card--surface` and `kv-card--canvas` and is `surface-raised` only. No new contrast pairs. Every reference to update is in spec §9, and the stories and tests are in §7. Open questions are in spec §10.

Decisions (2026-10-02, maintainer: "follow convention"): choices are classes, not props (ADR-0013). The name is `Section`, rendering a `<div>`. The look is the spec's. The spec's open questions 1–5 stay open and out of scope.

### API sketch

```tsx
<Section render={<aside aria-labelledby="contact" />} className="kv-section--padding-lg">
  <h2 id="contact">Kontakta oss</h2>
  <p>Vi svarar vardagar 9–16.</p>
</Section>

// Hook, for your own element
const section = useSection()
<nav {...section.rootProps} aria-label="Ärenden">…</nav>
```

Exports: `Section` (`Root`), `SectionRoot`, `useSection`. Types: `SectionRootProps`, `SectionElementProps`, `SectionState`, `SectionPartProps`, `UseSectionResult`.

### Accessibility contract (draft)

| Part | Element (default) | ARIA                                        | Class        |
| ---- | ----------------- | ------------------------------------------- | ------------ |
| Root | `<div>`           | none. The consumer adds it with the element | `kv-section` |

- Keyboard: none of its own, no focusable parts. Tab order is the children's DOM order.
- Focus: never moved, and a child's focus ring is never clipped.
- Announcements: none.
- Consumer responsibilities: headings, and a name on any landmark element it renders.

### i18n strings

None.

### Theming surface

Classes `kv-section`, `kv-section--surface|canvas`, `kv-section--padding-none|sm|md|lg`. Tokens `--kv-section-padding-sm|md|lg`.

## Tasks

- [x] Design spec `docs/design/section.md` (ux-designer)
- [ ] ADR-0044 accepted by the maintainer
- [ ] `section.a11y.md` contract from the draft above
- [ ] Component tests first (`section.test.tsx`): one `<div>` with its class, `render` (element and function), `useSection` props, ref forwarding, class merging, axe
- [ ] `useSection` and `Section` in `packages/react/src/section/`, exported from `index.ts`, with `section.md`
- [ ] Section styles in `theme.css` per spec §6, `kv-section` in prose's margins-only list, tokens, forced colours; remove Card's surface rules; theme CSS tests
- [ ] Card changes (spec §6.7, §9): docs, contract, JSDoc, test, stories, fixture, e2e
- [ ] Stories (`Components/Section`: every surface and padding, `SurfaceLayers` moved from Card, a named `aside`, four themes, RTL, forced colours) and e2e (reflow, forced-colours edge, no role by default)
- [ ] The §6.9 decision table in `section.md`, `card.md`, both Docs pages, Foundation/Borders and elevation, and DESIGN.md. Fix the hairline contrast sentence in DESIGN.md (spec §10.6)
- [ ] Amend ADR-0020 (revision note), `.changeset/card.md`, add `.changeset/section.md`, roadmap row
- [ ] accessibility-reviewer APPROVE
- [ ] `vp check`, `vp test run`, `vp run e2e`, `theme:check`, `i18n:check` green

## Risks & open questions

- Card's surface classes are removed (breaking). Safe while the packages are `0.0.0` and `.changeset/card.md` is pending.
- No visible region edge in the contrast themes (spec §10.1). The usability test plan asks about it. Result `pending`.
- Prose: a Section is not a prose boundary, so a full-width band must put `kv-prose` on an inner element (spec §6.6).

## Testing strategy

Standard pyramid. No core machine: Section has no state.

## Rollout

Alpha in the next 0.x, together with Card's change.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
