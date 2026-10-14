# Map

> **Draft** (Plan 0117). English only for now. The accessibility contract is [map.a11y.md](map.a11y.md), and the design is in `docs/design/map.md`.

A Map shows where places are: a camera over a base map with a marker for each place, and the same places as a list. It draws with an engine you choose (a provider) and ships no tiles, no engine CSS and no URL.

- **When to use it:** when position is the point (find the nearest preschool, see which recycling stations are in a district). The list is always there, so a place is never reachable only by the map.
- **When not:** for a single address, write the address as text with a link to a map service. For a long list with no spatial question, use a list or a table.
- Parts: `Map.Root` (no extra element beyond a `div`, owns the state), `Map.Skip`, `Map.Viewport`, `Map.Markers`, `Map.Controls`, `Map.Attribution`, `Map.BaseMapSwitch`, `Map.List` and `Map.Details`. The hook is `useMap`.
- **The viewport is one keyboard region.** Arrows pan, `+` and `-` zoom, the markers in view are a single Tab stop, and every gesture has a button.
- **Every place is in the list,** and the list follows the view, so a screen reader user gets the same answer as the map.

## API

| Part                | Renders                                | Props it takes                                                                                                                                                                           |
| ------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Map.Root`          | `<div class="kv-map">`                 | The controls above, plus `provider` (required) and every `div` prop                                                                                                                      |
| `Map.Skip`          | a skip link                            | `children`: the link text, default `map.skipToList`. Goes to the list heading, or the details title while a place is open                                                                |
| `Map.Viewport`      | `<div role="region" tabindex="0">`     | `div` props except `role`, `tabIndex` and the `aria-*` it sets. Children are the markers, controls and attribution drawn over the engine. Shows the loading, failed and gesture messages |
| `Map.Markers`       | `<div role="group">`                   | `children`: a function `(place) => ReactNode`, the marker's content (a 16px icon). Renders nothing while no place is in view                                                             |
| `Map.Controls`      | `<div role="group">`                   | `div` props. Zoom in, zoom out, Whole map and four pan buttons                                                                                                                           |
| `Map.Attribution`   | `<p>`, named `map.attributionLabel`    | `children`: a node, or `(baseMap) => node`. Default: the active base map's `attribution`. Renders nothing without text                                                                   |
| `Map.BaseMapSwitch` | `<div>` with a radio group             | `div` props. One radio per base map, renders nothing with fewer than two                                                                                                                 |
| `Map.List`          | `<div>` with an `h2` and `<ul>`        | `children`: a function `(place) => ReactNode`, extra facts under the name. Hidden while details are open                                                                                 |
| `Map.Details`       | `<section class="kv-card">`            | `title` (default: the place's name), `titleAs` (`h2`, `h3` default, `h4`), `children`: a node or `(place) => ReactNode`. Renders nothing while no place is selected                      |

| State attribute                    | On                                   | When                                                         |
| ---------------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| `data-status`                      | Viewport                             | `loading`, `ready` or `failed`                               |
| `data-highlighted`                 | a marker and a list row              | The place is highlighted from the other                      |
| `data-dismissed`                   | the keyboard hint                    | The hint was hidden with Escape                              |
| `data-gesture`                     | the gesture hint                     | `touch` or `wheel`, the gesture the engine ignored           |

Stable classes: `kv-map`, `kv-map-viewport`, `kv-map-engine`, `kv-map-hint`, `kv-map-status`, `kv-map-markers`, `kv-map-marker`, `kv-map-controls`, `kv-map-pan`, `kv-map-attribution`, `kv-map-base-maps`, `kv-map-list-region`, `kv-map-list`, `kv-map-list-item`, `kv-map-details`. Your `className` joins the part's.

Messages (`messages`, per instance, or the provider's `map` catalog): `roleDescription`, `summary`, `keyboardHint`, `skipToList`, `controlsLabel`, `markersLabel`, `zoomIn`, `zoomOut`, `zoomLimitIn`, `zoomLimitOut`, `reset`, `panNorth`, `panSouth`, `panEast`, `panWest`, `placesInView`, `placesAll`, `loading`, `tilesFailedTitle`, `tilesFailedBody`, `gestureTouch`, `gestureWheel`, `detailsClose`, `listEmpty`, `attributionLabel`, `baseMapLabel` and `baseMapChanged`.

### Providers

- **`MapProvider`** is the engine adapter: `mount(container, { view, baseMap, signal })` returns a handle with `setView`, `project`, `getSize`, `getBounds`, `setBaseMap` and events (`move`, `moveend`, a tile `error`, a `gesture` hint). An `AbortSignal` destroys the engine. It may list `baseMaps` (`{ id, label, attribution? }`) and a `defaultBaseMap`. Keep the instance stable between renders.
- **`maplibre({ style | baseMaps, workerUrl })`** from `@kvirn-ui/map/maplibre`. `style` is a style document or a URL. `baseMaps` is a list of `{ id, label, attribution, style }` for a visitor-switchable map type, with `defaultBaseMap`. `workerUrl` is the URL of `maplibre-gl/dist/maplibre-gl-worker.mjs`, needed under Vite. `rasterStyle({ tiles, maxzoom, attribution })` builds a style from your own tile URL templates.
- **`createMemoryProvider({ baseMaps, defaultBaseMap })`** keeps the camera and draws nothing: for tests and for pages with no engine.
- **`GeocoderProvider`** turns text into `AddressResult`s. It is for the address search that is not part of this slice.

## Notes

- **There is no default tile source.** You pass a style or tile URL templates, so the library never decides who sees your visitors. The `Default` story's `tiles` engine uses OpenStreetMap, Esri and OpenTopoMap only to show map types: its tile policies and imagery terms are yours to check before you copy it.
- **The visitor's IP address reaches the host you pick** the moment a tile is requested. Choose a host you have an agreement with, and say so in your privacy notice. No map loads, and nothing is requested, until a `Map.Root` with a provider mounts.
- **Import the engine's CSS yourself:** `maplibre-gl/dist/maplibre-gl.css`. The package ships none. Under Vite pass `workerUrl` too, or the engine looks for its worker next to the pre-bundled file.
- **Vector tiles are better than raster.** Raster tiles are images of text that do not follow the visitor's text size (1.4.4, 1.4.5).
- **Attribution is yours to show.** `Map.Attribution` renders the text and links of the active map type. Leaving it out of a map that needs it is a licence problem, not an accessibility one.
- **`initialView` is where the map starts and where Whole map returns to.** Changing the prop later does not move the camera.
- **`baseMap` controls the map type, `defaultBaseMap` only starts it.** With `baseMap` set, you own the state: update it in `onBaseMapChange`. The camera and the markers stay when the map type changes, and the change is announced.
- **Places are `{ id, name, address?, position: { longitude, latitude } }`.** Keep the array stable between renders.
- **The map announces** the places in view after a key or a button moves it, a zoom limit, a failed tile source, and a changed map type. Opening details is announced by the focus move, not a message.
- **Put `Map.BaseMapSwitch` beside the viewport,** next to the list, not over the canvas.
