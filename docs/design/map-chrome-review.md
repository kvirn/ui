# Design review: Map default chrome (plan 0120, T6)

- **Reviewed:** Storybook (default theme, light) `components-map--default`, `--offline`, `--layers-collapsed`, `--custom-popup`, `--custom-markers` at 1280x800, 375x700 and 320x700, with the details popup, the cluster popup, Map type, the keyboard hint and a keyboard-focused cluster open.
- **Against:** [map.md](map.md), plan 0120 (done) (§Outcome, Round 3, Decisions T7), `DESIGN.md`.
- **Not covered:** dark, contrast and forced-colours themes, RTL, hover states, 400% zoom on a real device. Usability and AT testing: `pending`.
- **Verdict:** CHANGES REQUIRED (findings 1 to 3).

## Findings

Severity: **must** (WCAG or the spec's own rule), **should** (users will struggle or DESIGN.md is broken), **nice** (polish).

### 1. must: below 40rem the markers and the popup escape the map row

- **Where:** cluster popup at 375 (it covers Map type and half the Hotels row); `offline-375` and `default-375` (a cluster pokes into the Map type row; a marker at the bottom edge sits on the controls row).
- **What:** `.kv-map-engine` is 420px, but `.kv-map-markers` and `.kv-map-popup-slot` measure 649px: an absolutely positioned grid child with `grid-row: 3` takes `auto` as its end line, which is the container's padding edge, so both layers run from row 3 to the bottom of the viewport. The popup's room is also the whole viewport (`map-popup.tsx:96-113` passes `viewportElement`), so it can be placed over the bar. The popup is non-modal and Tab goes popup → Layers → Map type: Map type is then entirely hidden behind it (2.4.11). A marker over the bar also steals taps from Map type (2.5.8 spacing).
- **Who:** phone residents; keyboard users at 400% zoom (the container query makes their map narrow too).
- **Fix:** in the `@container (width < 40rem)` block, `grid-row: 3 / 4` on the engine, markers, popup slot, hint and status, and `overflow: clip` on `.kv-map-markers`; in `map-popup.tsx`, measure the room from the engine element (the map row), not the viewport. Above 40rem nothing changes (the rows are the viewport).

### 2. must: in the Default story, a cluster's layer is shown by colour alone

- **Where:** `default-1280`, `offline-1280`, `default-375`: teal edge (Hotels) versus blue edge (Fuel stations) on otherwise identical white plates.
- **What:** map.md §6 says "colour never tells layers apart alone (add an icon or a shape)", and 1.4.1 applies. Cross-layer clusters overlap by design (Round 3), which is exactly where the reader needs to tell them apart. Markers are fine (pump versus bed icon).
- **Who:** colour-blind users, low-vision users, everyone on satellite imagery.
- **Fix:** in the Default and Offline stories, draw the layer's icon before the count through the `cluster` render function, as `CustomMarkers` already does, keeping the coloured edge as a second cue. If the library should do this by default when a layer has an `icon`, that is an engineering change for the plan.

### 3. must: map.md and DESIGN.md still describe chips and a disc that no longer ship

- **Where:** map.md §3 Layers (chips, plus and check, `primary` fill), §3 Markers (disc only), §4 forced colours ("a checked chip"); `DESIGN.md` line 314 (named exception for the layer chips).
- **What:** commit 9ca4bb8b made the layers plain checkboxes in a collapsible card with a hidden count (`map.layersHiddenValue`) and the default marker a teardrop pin. The spec says the code is the truth, so the spec is wrong.
- **Fix:** rewrite map.md §3 Layers (checkbox rows, the Disclosure trigger, "N hidden" while collapsed, `collapsible`/`defaultOpen`) and §3 Markers (pin by default, disc when a marker has children). **Maintainer decision:** drop the Show on the map half of the DESIGN.md line 314 exception, so checkboxes are rounded squares again with no exception.

### 4. should: cluster counts and marker labels are set in Arial

- **Where:** every screenshot: the cluster digits differ from "100" in the layers card. Computed `font-family: Arial` on `.kv-map-cluster` and `.kv-map-marker`.
- **What:** a `<button>` does not inherit the font; `.kv-map-cluster` sets size and weight but no family. This breaks the DESIGN.md typography rule (IBM Plex Sans), and a consumer's `kv-map-marker-label` inherits it too.
- **Fix:** `font-family: var(--kv-font-family-body, var(--kv-font-family-sans))` on `.kv-map-marker, .kv-map-cluster` (the same value `.kv-map-hint` uses).

### 5. should: the layers collapse trigger is 22px tall

- **Where:** `layers-collapsed-1280` (the collapsed card is 38px, next to a 44px Map type card), every 375 shot (trigger 317x22).
- **What:** `.kv-map-layers .kv-map-layers-trigger { min-block-size: 0 }`. It is the only chrome control under 44px; it passes 2.5.8 only through the spacing exception. Hardest case: a resident with a tremor.
- **Fix:** `min-block-size: var(--kv-control-min-block-size)` on the trigger, and move the card's bottom padding to `.kv-map-layers-panel`, so the collapsed card is one 44px row like Map type.

### 6. should: the narrow layout is taller than the phone screen

- **Where:** `offline-375` full page: bar 210px, map 420px, controls 196px, attribution 33px, 860px in all on a 700px screen; the list starts below the fold.
- **What:** below 40rem the zoom pill turns horizontal (88px wide), so Whole map no longer fits beside the disc and wraps onto a row of its own.
- **Fix:** remove `.kv-map-zoom { flex-direction: row }` and its corner-radius overrides from the `< 40rem` block. A vertical pill (44px), the disc (120px), Whole map (116px) and two `space-2` gaps take 296px, which fits the 317px row at 375px, so the controls row is 144px high (52px saved). At 320px it still wraps, which is fine.

### 7. nice: the popup's compact Close is 38x32, not square

- **Where:** popup at 1280 (`kv-button--icon-only kv-button--compact`); at 375 it is 44x44 and fine.
- **What:** `kv-button--compact` sets `--kv-button-padding-inline: space-3`, which overrides the icon-only padding. DESIGN.md: "Icon-only buttons are square". The cause is in Button, not the map.
- **Fix (Button, out of this plan's scope):** `.kv-button--compact.kv-button--icon-only { --kv-button-padding-inline: 0; inline-size: var(--kv-button-min-block-size) }` in `theme.css`. Raise it as its own task.

### 8. nice: three shapes in one control stack

- **Where:** controls at 1280: the zoom group has `radius-md` corners, the disc and Whole map are `radius-full`; map.md calls the group a "pill".
- **Fix:** `border-radius: var(--kv-radius-full)` on `.kv-map-zoom` and its end buttons (a 44px capsule), or change map.md to "zoom group". This is the maintainer's taste: either way the spec and the CSS should agree.

### 9. nice: layer counts are not baseline-aligned or in a column

- **Where:** layers card, every shot: "100" (14px) sits about 1px above the 16px name, and "Fuel stations 100" and "Hotels 100" start their counts at different x.
- **Fix:** `.kv-map-layer-name, .kv-map-layer-count { align-self: baseline }` and `margin-inline-start: auto` on `.kv-map-layer-count`, so tabular counts line up at the inline end.

### 10. nice: three label sizes in the floating chrome

- **Where:** at 1280 "Map type" is `body-small` (14px, 600), "Whole map" and "Show on the map" are `label` (16px, 600).
- **Fix:** `font-size: var(--kv-font-label-size)` on the 40rem+ `.kv-map-base-maps-trigger`. If the 14px label is wanted to keep the card small, write it in map.md.

## What works well (keep)

- **One surface recipe, aligned to the frame.** Every floating part is `surface-raised`, a hairline and `shadow-popup`, `space-2` from the edge; the layers card and zoom pill share a top line, and Map type and the attribution share a bottom line. The chrome reads as one family, apart from the content.
- **The halo carries everything over imagery.** Markers, clusters and the focus ring stay legible on OSM tiles and on the blank background. An open cluster's double ring and the selected marker's ring are shape cues, not colour. No text sits on tiles: the attribution is opaque.
- **Map type and the popups.** The trigger previews the current map; the tiles use a ring and a check disc; below 40rem it becomes a full-width row with a chevron. The details popup's hero, pinned Close and sticky footer (one primary, one secondary) and the edge-to-edge cluster rows are clear. The keyboard hint at the bottom centre clears both cards.

## Open questions

- Should the default cluster show its layer's icon when the layer has one (finding 2), so a consumer cannot ship the colour-only look by accident?
- The pan disc is the heaviest shape in the chrome, but 7.5rem is about the smallest disc whose four round 44px arrows do not overlap. Keep it, or offer a smaller arrow group below 40rem?
