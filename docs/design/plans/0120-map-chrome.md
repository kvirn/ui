# Plan 0120: Map chrome, a nicer default and five examples

- **Status:** In progress (asked by the maintainer 2026-10-15)
- **Owner:** lead / component-engineer
- **Related:** [design spec](../map.md)

## Goal

Map type, Show on the map, the list and the popups look finished in the default theme, every part stays easy to restyle or replace, and five Storybook examples show the options side by side.

## Design

The design is [map.md](../map.md). What the maintainer decided (2026-10-15):

- Segmented Map type (still a native radio group) and layer rows (still checkboxes) are the new defaults.
- The popup's Close is pinned at the top right and stays put while the content scrolls. Default size stays at today's, and the radius is `md`. 44px Close, radius `sm` and the sidebar layout are variations, not defaults.
- New custom properties: `--kv-map-popup-inline-size` (20rem) and `--kv-map-popup-scrollbar-size` (set by the popup).
- The list keeps hiding while a popup is open.

API additions (no presentation props, rule 14): `Map.Layers` `layerClassName` and `counts` in its state; `kv-map-layer-name` / `kv-map-layer-count` with `map.layerCountValue`; `Map.BaseMapSwitch` `icon` and `label` in its state; `Map.List` `icon` and `rowClassName`; the popup's scrollbar size property; `kv-map-details-footer`, `kv-map-list-aside`; `kv-map--sidebar` and `kv-map-panel` classes. Roles and keys are unchanged.

## Outcome

The floating chrome shipped as the one default: layer chips in a card at the top inline start, a Map type thumbnail that opens a popover of tiles, a zoom pill, a pan disc and Whole map at the inline end, the attribution at the bottom inline end, and below 40rem of the map's own width a bar above the map and rows under it. `Map.Overlay` (G1) keeps a keyboard-focused marker clear of floating chrome (2.4.11). The popup is a hero card with a pinned Close and a sticky footer. Everything else (segmented strip, layer plate, sidebar and panel layout, Close and radius variations, the prototype stories) was removed. The look is specified in [map.md](../map.md).

## Tasks

- [x] T1 API additions and default looks in `theme.css`, `theme:check` green
- [ ] T2 Stories E1–E4 and E5 `Variations`
- [x] T3 `map.md` override section, `map.a11y.md` unchanged roles confirmed, DESIGN.md exception for the segmented radios
- [x] T5 G1: `Map.Overlay` and overlay-aware marker focus, first rows of `map.test.tsx`
- [ ] T6 D2 polish loop: screenshots, design pass, build, review
- [x] T7 Floating as the library default, prototypes and unused CSS removed
- [ ] T4 Gates, then the design review (`ux-designer`) against map.md

## Decisions during implementation

- `map.layerCount` is retired (nothing else used it); `map.layerCountValue` replaces it. The default label is `<span name> <span count>`, a space between so the name reads "Hotels 100".
- `layerClassName` and `rowClassName` go on the row (`Field.Root`, `li`), not the swatch, so one class styles swatch, name and count by descendant selectors.
- Map type gets a wrapper `kv-map-base-maps-options` inside the fieldset (the track), because a border on the fieldset itself would notch around the legend. The layer plate is the rows' own fill and edge, for the same reason.
- `kv-map--sidebar` is a flex-wrap on the root (viewport `flex: 999 1 30rem`, panel `flex: 1 1 18rem`) instead of a container query: the root can't query itself, and this wraps on its own width.
- The Close variation is `kv-map-details-close--large` (44px); the radius is `--kv-map-popup-radius` (default `md`); both are variations only.
- `Map.Popup` measures the dialog's scrollbar after every render into `--kv-map-popup-scrollbar-size`; the header wrapper `kv-map-details-header` is gone, the two story fixtures that used it were updated.

## Decisions (T5)

- `Map.Overlay` registers its element in a Set held by `useMapClearance` (inside `useMap`), exposed as `registerOverlay` and `keepClear` on `UseMapResult`. `Map.Controls` and `Map.Attribution` register through the same `useMapOverlayRef`.
- Markers and clusters call `keepClear` from `onFocus`; it checks `:focus-visible` one frame later, so a pointer press never pans.
- Padding is 8px (3px ring plus gap). Candidate shifts are the obstacle edges and the viewport fit on each axis; the smallest valid one wins, else the marker is centred. The pan uses the popup's motion preference and does not call `announceNextSettle`.
- `packages/map` joins the `browser` project in `vite.config.ts` and gets the catalog `vitest-browser-react` as a dev dependency (same version as react and patterns; lockfile updated).

## Round 3 (Floating, maintainer feedback)

- Chips stacked one per row; gallery dropped (default `Map.List`); D1, D3, D4 removed, one `Floating` story. Popup art is soft, no stripes. Map type card is one 44px row.
- Controls: pan centre gets a dot and the button shadow (theme.css); the zoom/pan joined-group look stays.
- Cluster overlap, root cause: layers cluster in separate trees (cross-layer clusters never see each other, by design), and a cluster centre drifts toward its members, so same-layer centres sat 35 to 46px apart at radius 48 while every button is 44px. Not width- or zoom-step related (same at 375 and 1280, zoom 11). Fix: default radius 64 (same-layer centres at least 56px in the story). Cross-layer touching remains and is now documented in map.md.
- "Map type empty legend at 375" in Default: not real; a screenshot crop.

## Decisions (T7)

- Layers, BaseMapSwitch, Controls and Attribution register as overlays through `useMapOverlayRef`; the floating card styles apply to them as direct children of `Map.Viewport`.
- The narrow layout queries the root (`.kv-map { container-type: inline-size }`, `@container (width < 40rem)`), not the viewport, so a map in a narrow column behaves like a phone.
- Map type default: `Popover` with the consumer's `icon` for each preview, else one neutral token-drawn placeholder (the three demo previews live in the Storybook demo, not in `map.css`). Radios stay native; DESIGN.md exception updated (tiles with a ring and a check disc, chips with a plus and a check).
- Default popup width is 22rem (`--kv-map-popup-inline-size` fallback). The hero is capped at 9rem or 30% of the popup's max height; the footer is sticky. The library renders no Badge or links: those are consumer content (the rich popup story uses the footer slot).
- The keyboard hint moved to the bottom centre on the canvas so it clears the layers card.
- Removed: segmented strip, layer plate, `kv-map--sidebar`, `kv-map-panel`, `kv-map-details-close--large`, the old `max-width: 40rem` media block. Kept: `kv-map-list-aside` (documented list hook), `--kv-map-popup-radius`, `--kv-map-popup-inline-size`, `--kv-map-popup-scrollbar-size`.
- CSS split (maintainer, 2026-10-15): every `kv-map-` rule moved to `packages/theme/map.css` and every `kv-rich-text-` rule (with the `kv-toolbar--attached` rules only the editor uses) to `rich-text.css`, each in `@layer kv`, opt-in and not imported by `theme.css`. `package.json` `files` and `exports` list both; the raw-colour lint reads both; `theme:check` counts declared pairs (654 before and after), so it needed no change; Storybook's preview and the docs rich-text page import them.
