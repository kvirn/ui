# ADR-0020: Card is a plain container with Header, Body and Footer parts

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Maintainer (direction and the three choices below), proposed with Plan 0007
- **Tags:** api, a11y, theming

## Context

Adopters need one container for content on a surface: a text block on a surface background in a sidebar, or an image, a heading, some text and a couple of action buttons. Without it, each adopter hand-rolls `div`s with their own padding, radii and surfaces, outside `theme:check`. DESIGN.md already defines the look (elevation level 2: `surface-raised`, a 1px `border-subtle` edge, `lg` radius, 24px padding), but there's no component that carries it.

APG has no card pattern. The common accessibility failures with cards are a whole card wrapped in one `<a>` (a long link name, and no room for buttons), two links to the same place (the image and the title), and `<header>`/`<footer>` inside a card that become page landmarks.

## Decision drivers

- Native semantics first: a card is not a widget and needs no role (AGENTS.md hard rule 2).
- Consumer choices are plain attributes, not props or classes (ADR-0013).
- Headless packages ship no CSS. The theme styles `data-kv` parts (ADR-0013).
- Keep the first version small. A clickable card needs its own accessibility decisions.

## Options considered

### Option A: a plain container with Root, Header, Body and Footer (chosen)

- ✅ No behaviour, ARIA or strings to get wrong. The consumer's children keep their own semantics.
- ✅ The element can be changed with `render` (`<article>`, `<section>`, `<li>`), as on every part.
- ❌ No automatic labelling and no whole-card click. Both are left to the consumer or a later ADR.

### Option B: also a Title part that labels the card, and a stretched title link

- ✅ Automatic `aria-labelledby`, one Tab stop for a clickable card.
- ❌ A heading level the component can't know, and a stretched link that blocks text selection. The maintainer chose to leave both out for now.

### Option C: no component, only theme attributes on the consumer's own `div`s

- ✅ Even less API.
- ❌ No `render`, no typed parts, and no `data-kv` names unless the consumer types them, which breaks "import the theme and everything is styled".

## Decision

We will use Option A:

1. **Parts:** `Card.Root`, `Card.Header`, `Card.Body` and `Card.Footer`, also as named exports (`CardRoot`, …), and `useCard()` for your own elements (`rootProps`, `headerProps`, `bodyProps`, `footerProps`). Each part renders one `<div>` by default, with `data-kv="card"`, `card-header`, `card-body` or `card-footer`.
2. **Header and Footer are `<div>`, never `<header>`/`<footer>`.** At the top level those become `banner` and `contentinfo` landmarks.
3. **No role, no ARIA, no strings, no behaviour.** Children are whatever the consumer passes. To make a card a landmark or a list item, the consumer renders it as `<section aria-labelledby>`, `<article>` or `<li>`.
4. **No Title part and no clickable card** in this version. A future ADR can add them.
5. **Look by attribute.** The default theme gives a card with no attributes the DESIGN.md card look. The consumer changes surface, radius and padding with plain `data-*` attributes on the Root (defaults for all parts) and padding per part. The names and values are in the design spec, `docs/design/card.md`.

## Accessibility impact

- Positive: no landmark or role surprises, and the consumer's headings, links and buttons keep their native semantics and focus order.
- Contrast: every surface a card allows is in `contrast-requirements.ts` for `text`, `text-muted`, `link` and the secondary button edge, so `theme:check` covers text and buttons on cards.
- Forced colours: a card keeps a 1px border, so its boundary survives (DESIGN.md).
- Focus rings of focusable children are never clipped by the card (2.4.11, 2.4.13).
- No APG deviation: there is no APG pattern for a card.

## Consequences

- Positive: one container for every surface use, styled by the same `theme.css` import.
- Negative / trade-offs: the `data-kv` part names and the card's attributes become public API (semver). The consumer must pick the right element and heading level.
- Follow-ups: a clickable card (stretched title link) and a Title part, if adopters ask; status panels (Notification) as their own component, not a card surface.

## Validation

- Component tests: each part renders one `<div>` with its `data-kv`, `render` changes the element, `useCard` gives the same props.
- Stories with axe in all four themes, forced colours and RTL, and e2e reflow at 320px.
- `theme:check` with the card surfaces.

## References

- Plan 0007, `docs/design/card.md`
- ADR-0013, ADR-0015, DESIGN.md (Elevation, Shapes, Components)
- Heydon Pickering, Inclusive Components: Cards
