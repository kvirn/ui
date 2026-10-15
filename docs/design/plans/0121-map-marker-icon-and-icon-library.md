# Plan 0121: Default map marker icon and the whole icon library

- **Status:** In progress (asked by the maintainer 2026-10-15)
- **Owner:** lead / component-engineer
- **Related:** [icon spec](../icon.md), [map spec](../map.md), [plan 0120](0120-map-chrome.md)

## Goal

1. A `Map.Markers` with no children shows a standard map-pin icon, so a map works with no customization.
2. The icon library shows every icon the design system draws, not only the 25 built-ins: the Map's and the rich text editor's too.

## Design

**Marker.** `MarkerIcon` is a solid teardrop pin with a round hole (24 grid, tip on the bottom edge) in `map-icons.tsx`. `MapMarker` renders it when `children === undefined`, through `<Icon icon={MarkerIcon} className="kv-map-marker-pin" />` (decorative, `aria-hidden`). The marker button keeps its `aria-label` from the place name, so the icon adds no name. The pin has no disc: its tip is the coordinate, and hover, highlighted, selected and focus styles act on the pin and the 44px button. Any `children` (even a function result of `null`) replaces it and keeps the disc. Clusters are unchanged.

**Built-in cap.** The built-in set stays at 25 (icon.md §4.1; the 26th needs the cap raised, open question 4). The pin is a Map icon, like the controls' arrows (`map-icons.tsx`).

**Library.**

- `@kvirn-ui/map` exports `mapIcons`: a frozen record `{ marker, locate, remove, 'arrow-north', 'arrow-south', 'arrow-west', 'arrow-east' }` of `IconComponent`s. It can go in `KvirnProvider icons` and in `<Icon icon>`.
- `@kvirn-ui/rich-text` exports `richTextIconNames`, derived from its `shapes`; `ToolbarIcon` already draws them.
- Docs Icon page: three sets, "Built-in", "Map" and "Rich text editor", each with the name beside each icon. The Map and rich text lists derive from the exports, so a new icon shows with no edit.
- Storybook `BuiltInSet` gallery gains `MapSet` and `RichTextSet` stories on the same cells, axe-clean in every theme.

## Tasks

- [x] T1 `MarkerIcon` in `map-icons.tsx`, default in `MapMarker`, `mapIcons` export, tests (default pin is present and hidden, name still from the place, children replace it)
- [x] T2 `richTextIconNames` export
- [x] T3 Docs Icon page: Map and Rich text sets
- [x] T4 Storybook: `MapSet`, `RichTextSet`; map stories keep passing axe
- [x] T5 Docs: `map.md` markers section, `map.a11y.md` if the marker's contents are described, the rich text package doc, icon.md §4 note on package icons
- [ ] T6 Gates, then `accessibility-reviewer`

## Decisions during implementation

- The four arrows are `arrow-north/south/west/east`, not `arrow-up/back/…`: they pan the map, never flip in RTL, and must not collide with the built-in names (`arrow-back`/`arrow-forward` mirror by name). From the accessibility review.

- Bare solid pin, no disc (maintainer, 2026-10-15; reverses "pin inside the disc"): the familiar teardrop with a round hole, the tip on the coordinate. The 44px button stays the hit area, standing above the tip; a canvas outline keeps it legible on any base map. A marker with its own children keeps the disc.
- Two small public exports (`mapIcons`, `richTextIconNames`) rather than deep imports, so the docs site can list them without a hand-kept array.
- `mapIcons` is `Object.freeze` of an object `satisfies Record<string, IconComponent>`; `richTextIconNames` is a frozen array of `RichTextIconName`.
- Story cells for the rich text set show one 20px drawing: `ToolbarIcon` has a fixed size. The Map set shows 16, 20 and 24 like `BuiltInSet`.
- `icon.md` (design spec §4.1) and the package `icon.md` carry the note that package icons are outside the cap.

## Decision: collapsible Map.Layers

- `Map.Layers` collapses behind a Disclosure (`collapsible`, `defaultOpen`, `open`, `onOpenChange`), open by default; `layersHiddenValue` shows the hidden count while collapsed.
- Group name: the outer `<fieldset role="none">` is only the card (keeps the overlay ref and `disabled`); the Disclosure panel holds an inner `<fieldset aria-label="map.layersLegend">`. A collapsed card has one name (the button's), an open one names the group once. A button inside a `<legend>` was rejected: it announces the title twice when collapsed.
- `sv fi nb nn` now override `map.layersHiddenValue`; the rest of `map` still falls back to `en.map`.
