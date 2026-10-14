# Plan 0118: Map layers, clusters and a cleaner package

- **Status:** In progress (asked by the maintainer 2026-10-14)
- **Owner:** lead / component-engineer
- **Created:** 2026-10-14 · **Target:** alpha
- **Related:** [plan 0117](0117-map-and-address-search.md) (P3 of it, and its sequencing decision), [design spec](../map.md), `overlays-and-lists`, `forms`, `api-conventions` skills

## Goal

Layers a consumer configures and a user toggles, clustering that keeps markers apart (2.5.8), a cluster popup that lists its places, and a `@kvirn-ui/map` package whose code reads as well as the rest of the repo. The main demo shows 100 fuel stations and 100 hotels, each its own layer, all on by default.

## Non-goals

- Layer loading and error states (spec §3 "A layer fails"), GeoJSON sources, AddressSearch, Leaflet and Google adapters: still plan 0117.
- `sv fi nb nn` strings, `map.test.tsx` and the gates on the React parts: owed under plan 0117's sequencing decision (English first, no tests until the map works). Core gets node tests now, as it is pure and cheap.
- Animated cluster transitions.

## Design

### 1. Package layout (refactor, no behaviour change)

`map.tsx` (1009 lines) becomes one file per part, `map.tsx` keeps only the `Map` namespace:

```
packages/map/src/
  map.tsx                 Map = { Root, Skip, Viewport, ... } and re-exports
  map-context.ts          MapContext, useMapContext(partName), useMapState, list presence
  map-root.tsx            MapRoot
  map-skip.tsx            MapSkip
  map-viewport.tsx        MapViewport (keys, hint, gesture, status)
  map-markers.tsx         MapMarkers, MapMarker, MapCluster, roving arrow keys
  map-controls.tsx        MapControls, ControlButton
  map-attribution.tsx     MapAttribution
  map-base-map-switch.tsx MapBaseMapSwitch
  map-layers.tsx          MapLayers (new)
  map-list.tsx            MapList
  map-popup.tsx           MapPopup frame: portal, placement, caret, Escape, focus-on-open (shared)
  map-details.tsx         MapDetails + DetailsImage/Title/Body/Address/Close
  map-cluster-popup.tsx   MapClusterPopup + ClusterPopupTitle/Places/Close (new)
  use-map.ts              useMap: composes the hooks below, owns the result object
  use-map-camera.ts       mount, view, bounds, status, gestures, zoom/pan/reset, settle announcements
  use-map-popup.ts        open place or cluster, opener, focus return chain
  class-names.ts          joinClassNames, shared by every part
```

Rules for the split: one exported part per file plus its private helpers; `joinClassNames` everywhere (no inline `filter(Boolean).join`); no orphan doc comments (`UseMapResult` has one for a removed field); each hook returns a typed object; `index.ts` exports are unchanged plus the new names.

### 2. Core (`packages/core/src/map/`)

- `cluster.ts`: `clusterPlaces(places, { zoom, radius, keep? }) → MapCluster[] | MapPlace[]` as `MapMarkerItem[]`:
  - Projects to Web Mercator world pixels at `Math.floor(zoom)` (every engine is Web Mercator), so clusters only change on whole zoom steps and never jitter while panning.
  - Greedy radius clustering in a stable order (input order), neighbours found through a grid index of cell size `radius`: O(n).
  - Never mixes layers: a cluster belongs to one layer (or to no layer), so it reads "Hotels: 12 places" and takes the layer's look.
  - `keep(place)` keeps a place out of clusters: the selected place is always its own marker, so its details anchor to it.
  - A group of one is a place. Cluster `id` = `${layer ?? ''}:${zoomStep}:${firstMemberId}`; `position` = mean of members; `bounds` from `boundsFromPlaces`.
- `types.ts`: `MapCluster<Data> { id; layer?; position; bounds; places: MapPlace<Data>[] }`, `MapMarkerItem<Data> = { type: 'place'; place } | { type: 'cluster'; cluster }`. `MapLayer` gains `cluster?: boolean` (default true).
- `map-store.ts`: `openedClusterId: string | null`, `openCluster(id | null)` (opening one popup closes the other: `selectPlace` clears `openedClusterId` and back), `setHiddenLayers(ids)`.
- `cluster.test.ts`, `map-store.test.ts`: node tests (near points cluster, far don't, layers never mix, `keep`, stable ids across a pan, whole-zoom steps, antimeridian not required).

### 3. React API

```tsx
const layers: MapLayer[] = [
  { id: 'fuel', label: 'Fuel stations', description: 'Open 24 hours marked' },
  { id: 'hotels', label: 'Hotels' },
]

<Map.Root provider={provider} label="Fuel and hotels" places={places} layers={layers}
          defaultHiddenLayers={[]} cluster={{ radius: 48 }} initialView={view}>
  <Map.Skip />
  <Map.Viewport>
    <Map.Markers
      markerClassName={(place) => `demo-marker--${place.layer}`}
      clusterClassName={(cluster) => `demo-marker--${cluster.layer}`}
    >
      {(place) => layerIcon[place.layer]}
    </Map.Markers>
    <Map.Controls /><Map.Attribution />
  </Map.Viewport>
  <Map.Layers icon={(layer) => layerIcon[layer.id]} />
  <Map.Details />
  <Map.ClusterPopup />
</Map.Root>
```

- **Root / `useMap` options:** `layers?: readonly MapLayer[]`; `hiddenLayers` + `defaultHiddenLayers` + `onHiddenLayersChange(ids)` (controlled pair like `baseMap`); `cluster?: boolean | { radius?: number }`, default on with radius 48 (one 44px target plus a gap, so markers never overlap: 2.5.8).
- **Result additions:** `layers`, `hiddenLayerIds`, `setLayerHidden(id, hidden)`, `markersInView: MapMarkerItem[]` (clusters and places in the bounds; `placesInView` stays the list's source), `openedCluster`, `openCluster(id, openerId)`, `clusterMarkerId(id)`.
- **`Map.Markers`:** renders `markersInView`. New props: `cluster?: (cluster, state) => ReactNode` (default: the count, tabular), `clusterLabel?: (cluster) => string`, `clusterClassName?: string | ((cluster) => string)`. Clusters are in the same roving group as markers (one Tab stop, arrows, Home/End).
- **`Map.Cluster`** (exported like `Map.Marker`): `<button class="kv-map-cluster">`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` the cluster popup, named `map.clusterLabel` / `map.clusterLayerLabel`, visible count first in the name (2.5.3). Press opens the cluster popup; it does not zoom.
- **`Map.ClusterPopup`:** the shared popup frame anchored on the cluster. Default content: title `map.clusterTitle` ("12 places" / "Hotels: 12 places"), Close, and a list: each row a `<button>` with the place name (the clickable title) and the address under it. Pressing a title closes the popup and opens that place's details (`select(id, clusterMarkerId)`), the map moves to it and focus goes to the details heading. Render function `children({ cluster, close, titleProps, select, side })` and sub-parts `ClusterPopupTitle`, `ClusterPopupPlaces` (`renderPlace?`), `ClusterPopupClose`, mirroring `Map.Details`.
- **`Map.Layers`:** `Fieldset` + one `Checkbox` per layer, legend `map.layersLegend`, the layer's `description` as help text, `icon?: (layer) => ReactNode` as a decorative swatch before the label, the shown count after it ("Hotels (100)") via `map.layerCount`. Render function `children({ layers, hiddenLayerIds, setLayerHidden })` replaces the checkboxes, like `BaseMapSwitch`. Nothing with zero layers.
- **Popups:** one open at a time. A hidden layer closes an open popup of its place or cluster, focus stays on the checkbox. A cluster that no longer exists after a zoom closes its popup; focus follows the existing fallback chain (opener, list heading, viewport).

### 4. Accessibility contract deltas (spec §7, to `map.a11y.md`)

| Part          | Row                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------- |
| Cluster       | Enter/Space or click opens the cluster popup; focus to its title; `aria-expanded` true      |
| Cluster popup | Tab through place buttons and Close; Escape and Close return focus to the cluster           |
| Cluster popup | A place button opens that place's details, focus to the details heading                     |
| Layers        | Space toggles a layer: its markers, clusters and list rows go; `map.placesInView` announced |
| Marker set    | Clusters and markers share the one Tab stop and the arrow keys                              |

Spec §7 row "Cluster: Enter/Space zooms to its places" changes to the popup (maintainer, 2026-10-14). Zooming stays with `+` and the controls.

### 5. Strings (English now, plan 0117 sequencing)

`clusterLabel` ({count}) "{count} places", `clusterLayerLabel` ({count}, {layer}) "{layer}: {count} places", `clusterTitle` = same pair, `clusterClose` "Close", `layersLegend` "Show on the map", `layerCount` ({label}, {count}) "{label} ({count})". In `types.ts`; `sv fi nb nn` keep the `en.map` placeholder.

### 6. Theme

`kv-map-cluster` per spec §5 row (surface-raised, 2px text edge, canvas halo, tabular count, 44px min); `kv-map-cluster-popup` reuses the `kv-map-popup` frame; `kv-map-cluster-places` list rows (title as a link-styled button, address in `text-subtle`); `kv-map-layers` swatch. Forced colours as spec §5. No new token or colour pair.

### 7. Demo (Storybook)

- `map.data.ts`: `fuelStations` and `hotels`, 100 each, generated with a seeded PRNG (stable across runs) over greater Stockholm, each with `id`, `name`, `address` (street, number, postcode, area), `layer`. Neutral names, no real brands.
- `MapDemo` (Default, Offline, Keyboard) shows both layers on by default, `Map.Layers` beside the map with a fuel and a bed icon, distinct per-layer marker classes, clusters on, `Map.ClusterPopup` and `Map.Details`. Other demos keep the preschool places.
- Controls: `cluster` and `defaultHiddenLayers` on the meta args.

## Tasks

- [x] T1 Core: `cluster.ts`, types, store actions, node tests (`component-engineer` A)
- [x] T2 Demo data `map.data.ts` (A)
- [x] T3 Split `map.tsx` and `use-map.ts` per §1, behaviour unchanged (`component-engineer` B, parallel to A)
- [x] T4 Layers: options, result, `Map.Layers`, theme (B, after T1)
- [x] T5 Clusters: `markersInView`, `Map.Cluster`, `Map.ClusterPopup` on the shared `MapPopup`, theme (B)
- [x] T6 Demo, stories, `map.md` API, `map.a11y.md` rows (Test `pending`), spec §7 cluster row (B)
- [x] T7 Gates on the changed files: `vp check`, `vp test run` core map tests and the map stories, `theme:check`
- [x] T8 Plan 0117 P3 ticked, decisions recorded

## Decisions

- **Flat `places` with `layer` ids over places nested in layers:** one source for selection, list and clusters; data from two APIs is concatenated once. Layers are descriptions, visibility is state.
- **Clusters per layer over mixed clusters:** a cluster keeps its layer's look and name; mixed ones would need a neutral look and a "3 hotels, 2 fuel" name.
- **Own greedy radius clustering in core over `supercluster`:** no new dependency (plan 0117 approval), engine-agnostic, ~100 lines.
- **Cluster press opens a list popup over zooming in** (maintainer's ask): every place stays reachable in two presses at any zoom, coincident places included; zoom stays a separate action.
- **Selected place kept out of clusters:** its details always anchor on its own marker.
- **Clustering on by default:** markers that would overlap fail 2.5.8 spacing; the radius is a prop, `cluster={false}` turns it off.

- T1: `clusterPlaces` radius is CSS px at Math.floor(zoom), same tile size as geometry.ts.
- T4–T6: the controlled `hiddenLayers` pair is held in React state (like `baseMap`), not read from the store's `hiddenLayerIds`, so a controlled value never lags a render. `visiblePlaces` and `placesInView` are filtered in `useMap` for the same reason, and depend on the hidden ids rather than the store state, so a pan does not recompute the clusters.
- T4–T6: `clusterTitle` has a layer twin, `clusterLayerTitle`, like the label pair (plan §5 said "same pair"). The cluster popup reuses the `kv-map-details-title`, `-header`, `-content` and `-close` classes; only its root (`kv-map-cluster-popup`), list and rows are new.
- T4–T6: hiding a layer closes its popup from an effect in `useMapPopup` that forgets the opener first, so focus stays on the checkbox; a controlled `hiddenLayers` change from outside takes the same path.
- T4–T6: the Tab stop is `tabStopKey` in the result (active marker, else selected, else first), and falls back when the active marker is gone after a recluster. Cluster ids are used as keys beside place ids.
- T4–T6: `MapPopup`'s layout effect now has a dependency list (anchor, viewport id, view, bounds, handle). A late image load no longer re-measures it, as before: only a render did.
- T4–T6: `engineRef` is `setEngineElement`; destructuring the callback before `ref=` clears the React Compiler `refs` warnings.
- T4–T6: the demo's other stories pass `cluster={false}`; the main stories take `layeredArgs`. Per-layer looks are in `map.fixture.css`, tokens only.
