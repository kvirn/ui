# ADR-0044: Section is the level 1 container, and Card is level 2 only

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike (direction: a plain padded container with `render`, following convention), proposed with Plan 0018
- **Tags:** api, theming, a11y
- **Amends:** ADR-0020 (Decision 5)

## Context

DESIGN.md has an elevation ladder: level 1 is "sections and sidebars" (`surface`), level 2 is "cards" (`surface-raised`). Only Card exists, so a text block in a sidebar is a `Card.Root` with `kv-card--surface`, and a card on a `surface` band is `kv-card--canvas`. Storybook and the docs then say "surface" and "card" for the same thing. A sidebar drawn as a rounded, bordered card also reads as an object, which is wrong for a region of the page.

## Decision drivers

- One name per elevation level, so the docs can say which to use.
- Native semantics first (AGENTS.md hard rule 2): a region has no role of its own.
- Choices are modifier classes, not props (ADR-0013). Headless packages ship no CSS.
- Keep it small: nothing but a container.

## Options considered

### Option A: a `Section` component, and Card loses its surface classes (chosen)

- ✅ Level 1 and level 2 each have one component, and one decision table (design spec §6.9) tells which to use.
- ✅ No behaviour, ARIA or strings to get wrong.
- ❌ A breaking change to Card (`kv-card--surface` and `kv-card--canvas` go). Nothing is published (`0.0.0`), so it is free now.

### Option B: keep Card for both, and only document when to use which

- ✅ No new API.
- ❌ The same markup for two jobs, and a sidebar still looks like an object.

### Option C: a `Surface` component with a `surface` prop

- ✅ Matches the token name.
- ❌ Props for choices break ADR-0013, and "surface" is the word that is already confusing.

## Decision

We will use Option A:

1. **One part.** `Section` (also `SectionRoot` and `Section.Root`) and `useSection()` returning `rootProps`. It renders one `<div class="kv-section">`, passes children through, and has no role, ARIA, strings or behaviour. `render` changes the element (`<aside aria-labelledby>`, `<section aria-labelledby>`, `<li>`). The default is a `<div>` because a bare `<section>` is not a landmark, and any landmark is the consumer's choice and must be named.
2. **Choices are classes** (ADR-0013): `kv-section--surface` (default) and `kv-section--canvas`, and `kv-section--padding-none|sm|md|lg` (default `md`, Card's steps, stepping down in compact density). No `data-*`, because a section has no state.
3. **Look.** Square, no shadow, no overflow clipping, and a 1px `transparent` border on all four sides that is `CanvasText` in forced colours. Level 1 has no visible hairline. New tokens are only the aliases `--kv-section-padding-sm|md|lg`. No new colour and no new contrast pair.
4. **Card is level 2 only.** `kv-card--surface` and `kv-card--canvas` are removed, and a Card is always `surface-raised`. A Card on a Section keeps its default look.
5. **Name.** `Section`. A first round named it `Panel`, which was dropped: it collides with the shared part name `Panel` (`Disclosure.Panel`, `Tabs.Panel`), and a bordered, non-entity "panel" would only duplicate Card. `Section` can be confused with the HTML `<section>` element, so it renders a `<div>` and the docs say so. Status (info, success, warning, danger) is not a variant of Section or Card: it is a separate Notification component.
6. **One decision table** (design spec §6.9), with the card rules (one entity, one primary destination, never a form section) as docs only, is reused word for word in the docs pages, the stories, Foundation/Borders and elevation, and DESIGN.md.

## Accessibility impact

- Neutral to positive: no role and no landmark unless the consumer renders one and names it. No focusable parts, so no keys and no focus changes.
- Contrast: every text and control pair on `surface` and `canvas` is already in `contrast-requirements.ts`, so `theme:check` covers Section.
- Forced colours: the edge is `CanvasText`, so the boundary survives.
- Known trade-off: in the contrast themes a sidebar has no visible edge (1.06–1.10:1 from the page). The spec's open question 1 proposes a `border-region` token if research shows it matters.

## Consequences

- Positive: each ladder level has one component, and the docs can say which to use.
- Negative: Card's surface classes disappear, so Card's docs, contract, stories and ADR-0020's Decision 5 change (list in the design spec §9). `.changeset/card.md` is amended, and a Section changeset is added.
- Follow-ups: the open questions in the design spec §10 (a region edge in the contrast themes, a one-edge class, a shared padding set, a site-wide default, moving the docs site's sidebar).

## Validation

- Component tests: one `<div>` with its class, a prop's or a `render` element's class joins it, `render` changes the element, `useSection` gives the same props, axe.
- Stories with axe in four themes, forced colours and RTL, and e2e: reflow at 320px, the edge visible in forced colours, no role by default.
- `theme:check` unchanged and green. Theme CSS tests: Card has no surface rules.

## References

- Plan 0018, design spec `docs/design/section.md`
- ADR-0013, ADR-0020, ADR-0022, DESIGN.md (Elevation, Components)
