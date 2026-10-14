# Plan 0119: Map performance, a million places

- **Status:** In progress (approved 2026-10-14)
- **Owner:** lead / component-engineer
- **Created:** 2026-10-14 · **Target:** alpha
- **Related:** [plan 0118](0118-map-layers-and-clusters.md), [plan 0117](0117-map-and-address-search.md), `overlays-and-lists` skill (virtualization)

## Goal

`Map.Root` stays smooth (no main-thread task over 50 ms while panning or zooming, first markers under 2 s) with 1,000,000 places on a mid-range laptop, keeping every marker a DOM button and every place reachable without the canvas.

## Measured today (node, 2026-10-14, `clusterPlaces`, radius 48)

| Places    | Zoom 5    | Zoom 8   | Zoom 11 | Zoom 14 | Heap for the place objects |
| --------- | --------- | -------- | ------- | ------- | -------------------------- |
| 100,000   | 193 ms    | 93 ms    | 74 ms   | 104 ms  | 30 MB                      |
| 1,000,000 | 25,671 ms | 2,455 ms | 698 ms  | 970 ms  | 208 MB                     |

Other hot paths at 1M: `visiblePlaces` and `placesInView` re-filter every place on every render; `Map.Layers` counts with `places.filter` per layer per render; `Map.List` renders a DOM row per place in view (up to every place at low zoom); every marker re-renders through React on each engine `move` frame.

## Why the DOM can stay

After clustering, a viewport holds at most about (width × height) / radius² items: about 300 at 1000×700 and 48px. The DOM is never the bottleneck; the work before it is. So markers stay buttons (one accessibility implementation for every engine, plan 0117), and the fix is data structures and scheduling.

## Design

### 1. A static spatial index in core (`core/src/map/index/`)

- `kd-index.ts`: a flat KD-tree over `Float64Array` coordinates (the KDBush layout: ids `Uint32Array`, coords interleaved, node size 64). `range(minX, minY, maxX, maxY)` and `within(x, y, r)`. About 120 lines, our own code (no dependency, plan 0117 approval).
- `cluster-tree.ts`: the Supercluster algorithm. Points are projected once to Mercator `[0,1]²`. For each zoom from `maxZoom` down to 0, cluster the level below with `radius / (TILE_SIZE · 2^z)` using that level's KD index; each cluster records its children, count and first leaf. Build is O(n log n) once; a view query is `range` on one level, O(log n + k).
- `getClusters(bounds, zoom)`, `getChildren(clusterId)`, `getLeaves(clusterId, limit, offset)`, `getExpansionZoom(clusterId)`.
- One tree per layer, so clusters never mix layers (plan 0118) and toggling a layer needs no rebuild: hidden trees are skipped.
- `clusterPlaces` keeps its signature for small sets and is reimplemented on the tree.
- Node tests against the current greedy results on small sets, plus a timing test kept out of CI (`bench` file, run by hand).

Target: build 1M in about 1.5 s, query under 2 ms.

### 2. Places as a source, not only an array

`places` stays for everyday use. For millions, `source` takes columns so no object per place exists until one is shown:

```ts
interface MapPlaceSource<Data = unknown> {
  count: number
  /** Interleaved longitude, latitude: length `count * 2`. */
  positions: Float64Array
  /** Index into `layers` per place, when there are layers. */
  layers?: Uint16Array
  /** The place at an index, built when a marker, popup or row needs it. May be async (a server call). */
  get: (index: number) => MapPlace<Data> | Promise<MapPlace<Data>>
}
```

`places` is turned into a source internally, so every part reads one path.

### 3. Build off the critical path

Option A (recommended): build in a Web Worker shipped as `@kvirn-ui/map/worker` and opted into with `indexIn="worker"`; the columns are transferred, not copied. Option B: time-sliced on the main thread (`scheduler.yield` / 8 ms slices), always available, the default. Both show `map.indexing` (polite, once) and keep the viewport usable meanwhile.

### 4. No React render per frame

- Markers subscribe to the engine's `move` and write `--kv-map-x/y` to their buttons in one `requestAnimationFrame` per frame (a ref map), instead of a React render of every marker.
- The item set (which clusters and places are drawn) is queried per frame from the tree (cheap) and React re-renders only when the set's ids change.
- `markersInView` stays the public result, now memoised on the set's ids.

### 5. Long lists

- `Map.List` and the cluster popup's list are virtualized with the core virtualizer (TanStack Virtual, already sanctioned): rows have `aria-setsize` and `aria-posinset`, the heading says the count, and Home/End reach the ends.
- Or, cheaper: show the first 100 and "Zoom in to see all {count}" (zooms to the cluster's expansion zoom).
- Layer counts come from the tree, not a filter.

### 6. Out of scope

Server-side clustering and vector tiles for tens of millions: the consumer's tile server, documented as the next step. GPU (engine-drawn) markers: would drop the one-implementation accessibility model.

## Decisions

Taken with the maintainer, 2026-10-14:

1. **Indexing: both.** Time-sliced on the main thread by default (every bundler); `@kvirn-ui/map/worker` opt-in for the fastest build. So the core build is a resumable step function over typed arrays: the main thread runs it in slices, the worker runs it whole and transfers the tree's arrays back.
2. **Add `source`** (§2). `places` is adapted to a source internally.
3. **Virtualize long lists** (§5 first bullet), for `Map.List` and the cluster popup.
4. **Keyboard for virtualized lists** (maintainer, 2026-10-14): over 50 rows the list is one Tab stop (roving tabindex on the row buttons, set on the DOM so a custom `renderPlace` works) with Up/Down, Home/End, PageUp/PageDown, no wrap, not flipped in RTL. `keyboard` skill and `map.a11y.md` updated.

## Tasks

- [x] T1 `kd-index.ts`, `cluster-tree.ts`, `place-source.ts`, tests, bench script `core/src/map/bench/million-places.ts` (core). 1M, radius 48, maxZoom 16: build 1.85 s one-shot and sliced (slices <= 25 ms), queries < 0.1 ms, 219 MB, then 126 MB with Float32 tree coordinates
- [x] T2 `MapPlaceSource`, `places` adapter, per-layer trees, layer counts (`use-map-places.ts`)
- [x] T3 Index build scheduling (§3 per decision 1), `map.indexing` string (English); worker via `@kvirn-ui/map/worker` (`createMapWorker` passed as `indexIn`)
- [x] T4 Imperative marker positioning; the store syncs every 150 ms while moving and markers re-render only when the item set changes (`place-view.ts`)
- [x] T5 Long lists (§5 per decision 3): `Map.List` and the cluster popup, above 50 rows, in `kv-map-list-scroll` / `kv-map-cluster-places-scroll` (theme caps 32rem / 16rem). The anchor row (focused or last opened) stays rendered and is scrolled to on return
- [x] T6 `ManyPlaces` (1M, `!test`) and `ManyPlacesSmall` (50k) stories in `map-many.fixture.tsx`, `map.md` Performance section. Measured in the Storybook test browser (headless Chromium, 1M, from mount including generating the places to the first marker): about 3.4 s on the main thread and about 3.4 s with the worker. The worker keeps the page free; it is not faster.
- [x] T7 Gates (2026-10-14, scoped): `vp check` 177 files 0 warnings, 60 tests (core map + map stories), `i18n:check`, `theme:check`; `vp pack` ok, worker dist self-contained. Not run: the whole tree, a browser test of the built worker

Taken during T1:

4. `clusterPlaces` stays greedy (its ids are `layer:zoom:firstPlaceId`, which the tree cannot reproduce). The tree is for the source path.
5. Cluster ids are numbers: `clusterIndex * 32 + zoomStep`. Items are visited in kd order and the top 5 zoom steps skip the neighbour search for places with no neighbour within twice the radius (identical result, measured equal to the unskipped build).
6. `indexIn` is `'main' | (() => MapIndexer)`: pass `createMapWorker` itself and the map creates the worker in its effect and terminates it in the cleanup (StrictMode safe), not the string `'worker'`, so the main entry never imports the worker. Up to 20,000 places the trees build inside the render (no `indexing` flash); above that in 8 ms slices or in the worker.
7. Clusters from a source carry `count`; `bounds` and `places` are lazy getters. `visiblePlaces` and `placesInView` stay as lazy getters on the result; parts use `visibleCount`, `placesInViewCount`, `getPlaceInView(i)`, `getClusterPlace(id, i)`.
8. A layer with `cluster: false` (or `cluster={false}`) gets a tree with radius 0, and every place in view is a marker. Nothing bounds the DOM count there: it is the author's choice and stays a few hundred at street zoom, but zoomed out over a million places it would be a million buttons.
9. The worker ships as `dist/worker.mjs` plus a self-contained `dist/cluster-worker.mjs` (core bundled in), built by a second pack config in `packages/map/vite.config.ts` with a small plugin that rewrites the URL from `.ts` to `.mjs`; ESM only, so `./worker` has no `require` export.
10. A development warning (`map-many-markers`) fires past 2,000 markers in view; behaviour is not capped. Keyboard check on a virtualized `Map.List` (ManyPlacesSmall, 50k, zoomed out, a throwaway play test): Tab enters at row 1, End reaches the last row, Home the first, PageDown moves 7 rows, Tab leaves the list.
