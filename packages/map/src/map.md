# Map

> **Draft** (Plan 0117). English only for now. The accessibility contract is [map.a11y.md](map.a11y.md), and the design is in `docs/design/map.md`.

A Map shows where places are: a camera over a base map with a marker for each place, and the same places as a list. It draws with an engine you choose (a provider) and ships no tiles, no engine CSS and no URL.

- **When to use it:** when position is the point (find the nearest preschool, see which recycling stations are in a district). The list is always there, so a place is never reachable only by the map.
- **When not:** for a single address, write the address as text with a link to a map service. For a long list with no spatial question, use a list or a table.
- Parts: `Map.Root` (a `div` that owns the state), `Map.Skip`, `Map.Viewport`, `Map.Markers` (with `Map.Cluster` and `Map.Marker`), `Map.Controls`, `Map.Attribution`, `Map.BaseMapSwitch`, `Map.Layers`, `Map.List`, `Map.Details` with `Map.DetailsImage`, `Map.DetailsTitle`, `Map.DetailsBody`, `Map.DetailsAddress` and `Map.DetailsClose`, and `Map.ClusterPopup` with `Map.ClusterPopupTitle`, `Map.ClusterPopupPlaces` and `Map.ClusterPopupClose`. The hooks are `useMap` and `useMapState`.
- **The viewport is one keyboard region.** Arrows pan, `+` and `-` zoom, the markers in view are a single Tab stop, and every gesture has a button.
- **Every place is in the list,** and the list follows the view, so a screen reader user gets the same answer as the map.

## API

| Part                     | Renders                                                 | Props it takes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Map.Root`               | `<div class="kv-map">`                                  | The controls above, plus `provider` (required), `source` and `indexIn` (see Performance) and every `div` prop                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Map.Skip`               | a skip link                                             | `children`: the link text, default `map.skipToList`; `href`: the target when you render your own list. Goes to the details title while a place is open, else to `Map.List`, else to `href`; renders nothing with none                                                                                                                                                                                                                                                                                            |
| `Map.Viewport`           | `<div role="region" tabindex="0">`                      | `div` props except `role`, `tabIndex` and the `aria-*` it sets. Children are the markers, controls and attribution drawn over the engine. Shows the loading, failed and gesture messages                                                                                                                                                                                                                                                                                                                         |
| `Map.Markers`            | `<div role="group">`                                    | `children`: a function `(place, state) => ReactNode`, the marker's content (a 16px icon); `label`, `markerClassName`; for clusters `cluster: (cluster, { opened, layer }) => ReactNode` (default the count), `clusterLabel` and `clusterClassName`. Every function also gets the place's or cluster's `layer` (the `MapLayer`, or `undefined`): in the state for `children` and `cluster`, as the second argument for the others. Clusters and places are one Tab stop. Renders nothing while nothing is in view |
| `Map.Controls`           | `<div role="group">`                                    | `div` props. Zoom in, zoom out, Whole map and four pan buttons                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `Map.Attribution`        | `<p>`, named `map.attributionLabel`                     | `children`: a node, or `(baseMap) => node`. Default: the active base map's `attribution`. Renders nothing without text                                                                                                                                                                                                                                                                                                                                                                                           |
| `Map.BaseMapSwitch`      | `<div>` with a radio group                              | `div` props, and `children`: a function `({ baseMaps, baseMap, setBaseMap }) => ReactNode` that replaces the radios. Renders nothing with fewer than two base maps, with or without it                                                                                                                                                                                                                                                                                                                           |
| `Map.Cluster`            | `<button class="kv-map-cluster">`                       | `cluster` (required), `className`, `button` props. Named `map.clusterLabel` (`map.clusterLayerLabel` for a layer's), `aria-haspopup="dialog"`, `aria-expanded`. Pressing it moves the map so the cluster sits low in the middle, keeping the zoom, then opens the cluster popup above it. Use `Map.Markers`, which renders them                                                                                                                                                                                  |
| `Map.Layers`             | `<fieldset class="kv-map-layers">`                      | `icon`: `(layer) => ReactNode`, a decorative swatch before the label; `children`: a function `({ layers, hiddenLayerIds, setLayerHidden }) => ReactNode` that replaces the checkboxes. Legend `map.layersLegend`, one checkbox per layer named `map.layerCount` ("Hotels (100)"), the layer's `description` as help text. Renders nothing without layers                                                                                                                                                         |
| `Map.ClusterPopup`       | `<dialog open class="kv-map-cluster-popup">` in a popup | `as`, `className`, and `children`. No children: title with Close, then the list of places. Nodes: exactly those. A function `({ cluster, close, select, titleProps, side }) => ReactNode`: the whole template. `select(placeId)` closes it and opens that place's details. Renders nothing while no cluster is open                                                                                                                                                                                              |
| `Map.ClusterPopupTitle`  | `<h3 class="kv-map-details-title">`                     | `as`, `className`, `children` (default `map.clusterTitle` / `map.clusterLayerTitle`). Carries the id and `tabindex="-1"` that focus and the dialog's name use                                                                                                                                                                                                                                                                                                                                                    |
| `Map.ClusterPopupPlaces` | `<ul class="kv-map-cluster-places">`                    | `renderPlace`: `(place, select) => ReactNode` replaces a row. Default: a button with the name, the address under it                                                                                                                                                                                                                                                                                                                                                                                              |
| `Map.ClusterPopupClose`  | `<button class="kv-map-details-close">`                 | `className`, `children`, `onClick`. Named `map.clusterClose` plus the title                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `Map.List`               | `<div>` with an `h2` and `<ul>`                         | `children`: a function `(place) => ReactNode`, extra facts under the name. Hidden while details are open. Past 50 places only the rows in view are rendered, each with `aria-setsize` and `aria-posinset`, in a scroll element with `data-virtualized`. It is then one Tab stop, and ArrowUp/ArrowDown, Home/End and PageUp/PageDown move between rows (the cluster popup's places too)                                                                                                                          |
| `Map.Details`            | `<dialog open class="kv-map-details">` in a popup       | `as`, `className`, and `children`. No children: image, then title with Close, body and address, each only when the place has it. Nodes: exactly those, in your order. A function `({ place, close, titleProps, side }) => ReactNode`: the whole template. Renders nothing while no place is selected                                                                                                                                                                                                             |
| `Map.DetailsImage`       | `<img class="kv-map-details-image">`                    | `as`, `className`, `img` props. The place's `image` (`src`, `alt`), lazy loaded, in a 16:9 box. Renders nothing without an image                                                                                                                                                                                                                                                                                                                                                                                 |
| `Map.DetailsTitle`       | `<h3 class="kv-map-details-title">`                     | `as` (for another level), `className`, `children` (default the place's `name`). Carries the id and `tabindex="-1"` that focus and the dialog's name use                                                                                                                                                                                                                                                                                                                                                          |
| `Map.DetailsBody`        | `<p class="kv-map-details-body">`                       | `as`, `className`, `children` (default the place's `description`). Renders nothing when empty                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Map.DetailsAddress`     | `<p class="kv-map-details-address">`                    | `as`, `className`, `children` (default the place's `address`). Renders nothing when empty                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Map.DetailsClose`       | `<button class="kv-map-details-close">`                 | `className`, `children` (default the close icon), `onClick`. Named `map.detailsClose` plus the title; compact and icon-only                                                                                                                                                                                                                                                                                                                                                                                      |

| State attribute    | On                      | When                                               |
| ------------------ | ----------------------- | -------------------------------------------------- |
| `data-status`      | Viewport                | `loading`, `ready` or `failed`                     |
| `data-highlighted` | a marker and a list row | The place is highlighted from the other            |
| `data-dismissed`   | the keyboard hint       | The hint was hidden with Escape                    |
| `data-gesture`     | the gesture hint        | `touch` or `wheel`, the gesture the engine ignored |

Stable classes: `kv-map`, `kv-map-viewport`, `kv-map-engine`, `kv-map-hint`, `kv-map-status`, `kv-map-markers`, `kv-map-marker`, `kv-map-marker-label`, `kv-map-controls`, `kv-map-pan`, `kv-map-attribution`, `kv-map-base-maps`, `kv-map-layers`, `kv-map-layer-swatch`, `kv-map-cluster`, `kv-map-cluster-count`, `kv-map-cluster-popup`, `kv-map-cluster-places-scroll`, `kv-map-cluster-places`, `kv-map-cluster-place`, `kv-map-cluster-place-trigger`, `kv-map-cluster-place-address`, `kv-map-list-region`, `kv-map-list-scroll`, `kv-map-list`, `kv-map-list-item`, `kv-map-details`, `kv-map-details-image`, `kv-map-details-content`, `kv-map-details-header`, `kv-map-details-title`, `kv-map-details-body`, `kv-map-details-address`, `kv-map-details-close`. Your `className` joins the part's.

Messages (`messages`, per instance, or the provider's `map` catalog): `roleDescription`, `summary`, `keyboardHint`, `skipToList`, `controlsLabel`, `markersLabel`, `zoomIn`, `zoomOut`, `zoomLimitIn`, `zoomLimitOut`, `reset`, `panNorth`, `panSouth`, `panEast`, `panWest`, `placesInView`, `placesAll`, `loading`, `tilesFailedTitle`, `tilesFailedBody`, `gestureTouch`, `gestureWheel`, `detailsClose`, `listEmpty`, `attributionLabel`, `baseMapLabel`, `baseMapChanged`, `clusterLabel`, `clusterLayerLabel`, `clusterTitle`, `clusterLayerTitle`, `clusterClose`, `layersLegend`, `layerCount` and `indexing` ("Loading the places", announced once while the index of a large source builds).

### Layers and clusters

- **`layers`** describes the groups (`{ id, label, description?, cluster? }`); a place joins one with `layer`. Keep the array stable. `Map.Layers` shows a checkbox per layer. `hiddenLayers` with `onHiddenLayersChange(ids)` controls them like `baseMap`; `defaultHiddenLayers` starts some hidden. Hiding a layer takes its markers, clusters and list rows away, closes a popup of one of its places, leaves focus on the checkbox and announces the new count.
- **`cluster`** is on by default with a radius of 48 CSS pixels, so markers never overlap (2.5.8). `cluster={{ radius }}` changes it, `cluster={false}` turns it off, and a layer with `cluster: false` is never clustered. A cluster holds places of one layer only, and the selected place is always its own marker. Clusters change on whole zoom steps, never while panning. Opening a place moves it low in the middle of the view and zooms in to at least zoom 12; opening a cluster moves it the same way without zooming. With reduced motion the map jumps instead of easing.
- A cluster opens a popup with its places; pressing one opens that place's details. Give the cluster and the places a look with `clusterClassName` and `markerClassName`.
- The result of `useMapState` adds `layers`, `hiddenLayerIds`, `setLayerHidden`, `markersInView`, `openedCluster`, `openCluster(id, openerId)` and `clusterMarkerId(id)`.

### Customizing markers, clusters and layers

Keep one record from layer id to icon and use it twice, so a layer looks the same on the map and in `Map.Layers`:

```tsx
const layerIcons = { fuel: FuelIcon, hotels: BedIcon } // your own SVG components

<Map.Markers>{(place) => <Icon icon={layerIcons[place.layer!]} size="16" />}</Map.Markers>
<Map.Layers icon={(layer) => <Icon icon={layerIcons[layer.id]} size="16" />} />
```

A custom point marker gets the place and its state. Show a name chip on hover, but not while its details are open (the popup already names it), and colour it per layer with `markerClassName`:

```tsx
<Map.Markers
  label={(place, layer) => `${place.name}, ${layer?.label}`}
  markerClassName={(place) => `pin pin--${place.layer}`}
>
  {(place, { selected, highlighted }) => (
    <>
      <Icon icon={layerIcons[place.layer!]} size="16" />
      {highlighted && !selected ? <span className="kv-map-marker-label">{place.name}</span> : null}
    </>
  )}
</Map.Markers>
```

A custom cluster is sized by its count and coloured by its layer:

```tsx
<Map.Markers
  cluster={(cluster) => <span className="ring-count">{cluster.count}</span>}
  clusterLabel={(cluster, layer) => `${layer?.label}, ${cluster.count} places`}
  clusterClassName={(cluster) => `ring ring--${cluster.layer} ring--${size(cluster.count)}`}
/>
```

- **The content is decoration.** It sits inside the one native button, so it is not read: the name comes from `label` and `clusterLabel` (default: the place's name and `map.clusterLabel`). Put the information in the name, and never let colour alone tell layers apart: add an icon or a shape. A visible name goes in `kv-map-marker-label`: the theme draws it as a chip under the mark and leaves its size alone (every other child is sized as a 16px icon).
- **Keep the button.** You never replace the marker or the cluster, only what is inside it and its classes. It stays a 44px target with a 24px mark; a bigger look is fine, a smaller one is not (2.5.8).
- **Restyle with classes and state.** Use `markerClassName`, `clusterClassName` and the `data-selected`, `data-highlighted` and `aria-expanded` state, never inline `style`: the library sets `--kv-map-x` and `--kv-map-y` for the position, and your CSS must leave them alone. A shape needs 3:1 against the map (1.4.11); in forced colours use system colours.
- **Your own icons** are components that take the SVG props: pass them with `<Icon icon={MyIcon} />`. In `Map.Layers` the icon is a swatch before the label (`kv-map-layer-swatch`), `aria-hidden`; the label and count are the name.

### Your own list: `useMapState`

`useMapState()` reads the map's state inside `Map.Root`, so you can build a part the library does not render, such as your own list of places. Its signature is `useMapState(): UseMapResult`, and it throws outside `Map.Root`. It returns `placesInView`, `visiblePlaces` (both build every place: see Performance), `visibleCount`, `placesInViewCount`, `getPlaceInView(index)`, `indexing`, `layerCounts`, `selectedPlace`, `baseMaps`, `baseMap`, `setBaseMap(id)`, `zoomIn()`, `zoomOut()`, `reset()`, `view`, `status`, `messages`, `select(placeId, openerId)`, `close()` and `setHighlightedPlaceId(placeId | null)`.

To behave like `Map.List`, render a button per place in `placesInView` with an `id` of your own. On click call `select(place.id, thatId)`: `Map.Details` takes focus, and closing it returns focus to your button. Set `aria-expanded` and `aria-controls` as the library's rows do, and give your list a heading with an `id` you also pass to `Map.Skip` as `href`. The places-in-view announcement comes from the map, not from `Map.List`, so you keep it.

### Providers

- **`MapProvider`** is the engine adapter: `mount(container, { view, baseMap, signal })` returns a handle with `setView`, `getView`, `getSize`, `getBounds`, `fitBounds`, `setBaseMap`, `project`, `unproject`, `on` (events `move`, `moveend`, `error`, `tilesloaded` and a `gesture` hint) and `destroy`. The `AbortSignal` destroys the engine when the map unmounts. It may list `baseMaps` (`{ id, label, attribution? }`) and a `defaultBaseMap`. Keep the instance stable between renders.
- **`maplibre({ style | baseMaps, workerUrl })`** from `@kvirn-ui/map/maplibre`. `style` is a style document or a URL. `baseMaps` is a list of `{ id, label, attribution, style }` for a visitor-switchable map type, with `defaultBaseMap`. `workerUrl` is the URL of `maplibre-gl/dist/maplibre-gl-worker.mjs`, needed under Vite. `rasterStyle({ tiles, maxzoom, attribution })` builds a style from your own tile URL templates.
- **`createMemoryProvider({ baseMaps, defaultBaseMap })`** keeps the camera and draws nothing: for tests and for pages with no engine.
- **`GeocoderProvider`** turns text into `AddressResult`s. It is for the address search that is not part of this slice.

### Performance

- **`places` or `source`.** Up to a few thousand places, pass `places` (an array of objects). For tens of thousands to millions, pass `source` instead: `{ count, positions: Float64Array (longitude, latitude interleaved), layers?: Uint16Array (an index into `layers`, `NO_LAYER` for none), get(index) }`. No object exists per place until a marker, row or popup needs it, and `get` may return a promise (the place shows once it resolves; a failed one is not retried). `placesToSource(places, layers)` from `@kvirn-ui/core` shows the shape.
- **The index.** The map builds one cluster index per layer. Measured in Node on one machine, 1,000,000 places take about 1.85 s to build in slices of at most 25 ms, hold about 126 MB, and answer a view in under 0.1 ms; in the Storybook test browser the first markers of the million-place story appeared after about 3.4 s on the page and in the worker alike. Up to 20,000 places the index builds during render. Above that `indexing` is true, the map announces "Loading the places" once, and markers appear when it is done.
- **`indexIn`.** `'main'` (default) builds in 8 ms slices on the page. `indexIn={createMapWorker}` builds in a Web Worker and transfers the result back; the map creates the worker when it builds and stops it afterwards, so you own nothing:

  ```tsx
  import { createMapWorker } from '@kvirn-ui/map/worker'

  // <Map.Root source={source} indexIn={createMapWorker} … />
  ```

  The worker entry is ESM only (a module worker is). `worker.mjs` loads `cluster-worker.mjs`, which has `@kvirn-ui/core` bundled in, so your bundler needs nothing inside it. Under Vite, if the worker URL breaks after dependency pre-bundling, exclude `@kvirn-ui/map` from `optimizeDeps`; this is the usual remedy for `new URL(..., import.meta.url)` in a dependency and is not verified here.

- **Do not read every place.** `visiblePlaces` and `placesInView` build all of them, so use `visibleCount`, `placesInViewCount` and `getPlaceInView(index)` (ascending source order). `Map.List` and the cluster popup already read a row at a time and are virtualized.
- **`cluster={false}` on a large source** puts every place in view on the page as a button. The map warns once in development past 2,000 markers; keep clustering on, or set `cluster: false` only on small layers. Behaviour is not capped.

## Notes

- **There is no default tile source.** You pass a style or tile URL templates, so the library never decides who sees your visitors. The `Default` story uses OpenStreetMap, Esri and OpenTopoMap only to show map types: its tile policies and imagery terms are yours to check before you copy it.
- **The visitor's IP address reaches the host you pick** the moment a tile is requested. Choose a host you have an agreement with, and say so in your privacy notice. No map loads, and nothing is requested, until a `Map.Root` with a provider mounts.
- **Import the engine's CSS yourself:** `maplibre-gl/dist/maplibre-gl.css`. The package ships none. Under Vite pass `workerUrl` too, or the engine looks for its worker next to the pre-bundled file.
- **Vector tiles are better than raster.** Raster tiles are images of text that do not follow the visitor's text size (1.4.4, 1.4.5).
- **Attribution is yours to show.** `Map.Attribution` renders the text and links of the active map type. Leaving it out of a map that needs it is a licence problem, not an accessibility one.
- **`initialView` is where the map starts and where Whole map returns to.** Changing the prop later does not move the camera.
- **`baseMap` controls the map type, `defaultBaseMap` only starts it.** With `baseMap` set, you own the state: update it in `onBaseMapChange`. The camera and the markers stay when the map type changes, and the change is announced.
- **Places are `{ id, name, position: { longitude, latitude }, address?, description?, image?: { src, alt } }`.** `name` is the popup's title, `description` its body. Keep the array stable between renders.
- **The map announces** the places in view after a key or a button moves it, a zoom limit, a failed tile source, and a changed map type. Opening details is announced by the focus move, not a message.
- **The list is the canvas for screen reader and keyboard users** (1.1.1, 2.1.1, 2.5.7). If you omit `Map.List` you must provide a list, or another way to reach and open every place. The library cannot check that you did. Without `Map.List`, `Map.Skip` renders nothing unless you pass `href`, and closing details with no opener returns focus to the viewport.
- **Alt text is yours.** `image.alt` is required and in your language; use `alt=""` for a picture that only decorates (1.1.1). The popup has no focus trap and is a popup at every width: above the marker, below when there is no room, scrolling inside the room it has. Compose it from the `Map.Details*` parts, keep a `Map.DetailsTitle` (the dialog is named by it), or use the function form for full control.
- **A custom `Map.BaseMapSwitch` child is yours to name.** Give the control a visible label (3.3.2) and keep it a native `select` or a radio group.
- **Put `Map.BaseMapSwitch` beside the viewport,** next to the list, not over the canvas.
