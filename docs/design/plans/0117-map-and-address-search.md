# Plan 0117: Map, layers and AddressSearch

- **Status:** In progress (approved 2026-10-14; map, layers, clusters, MapLibre done; AddressSearch and Leaflet/Google adapters open)
- **Owner:** lead / component-engineer
- **Created:** 2026-10-14 · **Target:** alpha
- **Related:** [design spec](../map.md) (the contract, visuals and §9 open questions), [combobox spec](../combobox.md), `overlays-and-lists`, `forms`, `regulations` skills

## Goal

A municipality can put a map on a page: pan, zoom, touch and keyboard, places as markers with consumer-made content, a details panel when one is chosen, layers with toggles, and an address lookup that works with or without the map. A screen-reader or keyboard user gets the same answers through a list, never only through the canvas. The renderer is a provider (MapLibre, Leaflet, Google, later our own) behind one KvirnUI API.

## Non-goals

- Drawing, measuring, routing, isochrones, 3D, rotate and pitch: later plans (§Later).
- A default tile source or geocoder. No URL ships in the library (rule 7, GDPR).
- A base-map switcher, paging of long place lists, and offline tiles: open in the spec §9, later plans.
- Claiming legal compliance. We say "designed and tested to meet WCAG 2.2 AA".

## Background

No map, geo or geocoding code exists. `Address` (`packages/react/src/address`) is a postal block only. `AddressInput` is a roadmap row (`docs/roadmap.md:220`) and the natural target of an address pick (3.3.7). `Autocomplete` is the base of AddressSearch. Package shape follows `rich-text` (own package, engine as peer, `'use client'` banner) and `testing/read-aloud` (optional-peer sub-entries, one file per engine). No APG map pattern exists: the keyboard model is ours and needs approval (spec §9 D2, D4). Prior art: Defra flood map, MapLibre `KeyboardHandler`, Leaflet keyboard.

## Design

### Architecture

```
packages/core/src/map/        pure: geo maths, view state, selection, layer visibility,
                               in-view filter, grid clustering, provider types (types only)
packages/map  @kvirn-ui/map    React hooks and parts, AddressSearch, memory provider, 'use client'
  src/index.ts                 useMap, Map.*, useAddressSearch, AddressSearch, types, createMemoryProvider
  src/maplibre.ts   sub-entry  MapLibre GL adapter    (peer maplibre-gl, optional)
  src/leaflet.ts    sub-entry  Leaflet adapter        (peer leaflet, optional)
  src/google.ts     sub-entry  Google Maps adapter    (loads the SDK only when the consumer mounts it)
  src/nominatim.ts  sub-entry  GeocoderProvider over fetch, URL given by the consumer
```

The provider draws tiles and reports the camera (`center`, `zoom`, `bounds`) and gestures. KvirnUI owns everything else: markers, clusters, details, list, controls, layers and announcements are DOM parts, not engine widgets, so one a11y implementation covers every engine. The engine canvas is `aria-hidden`; the viewport region (spec §7) is ours.

### API sketch

```tsx
import { Map, AddressSearch } from '@kvirn-ui/map'
import { maplibre } from '@kvirn-ui/map/maplibre'

const provider = maplibre({ style: 'https://tiles.example.se/style.json', attribution })

<Map.Root provider={provider} label="Preschools" places={places} layers={layers}
          defaultView={{ center: [18.07, 59.33], zoom: 11 }}>
  <Map.Skip />
  <Map.Viewport>
    <Map.Markers>{(place) => <Map.Marker place={place}><PreschoolIcon /></Map.Marker>}</Map.Markers>
    <Map.Controls /><Map.Attribution />
  </Map.Viewport>
  <Map.Layers />
  <Map.List renderItem={(p) => <Facts place={p} />} />
  <Map.Details>{(place) => <PreschoolDetails place={place} />}</Map.Details>
</Map.Root>

<AddressSearch geocoder={nominatim({ url })} onResult={(r) => map.show(r)} />
```

Types: `MapPlace {id, position, name, layer?, address?}`, `MapLayer {id, label, description?, icon}`, `MapView`, `MapProvider`, `GeocoderProvider {search(query, {signal}) → AddressResult[]}`. Exports `UseMapOptions`, `UseMapResult`, `MapViewportProps` etc. (api-conventions). Presentation is classes (`kv-map-*`) and `variant`/`size` only (rule 14); marker look is the consumer's icon child and class.

### Accessibility contract (draft)

The full tables live in spec §7: roles and names, tab order, keys, pointer, AddressSearch, announcements. Summary of the rows each needs a named test in `map.test.tsx`:

| Part          | Rows                                                                              |
| ------------- | --------------------------------------------------------------------------------- |
| Viewport      | Tab in/out, arrows pan, `+`/`=`/`-` zoom, Escape hides hint, Ctrl/Cmd never taken |
| Marker set    | one Tab stop, arrows and Home/End move (flip in RTL), Enter/Space opens details   |
| Cluster       | Enter/Space zooms in, focus lands on a place, count announced                     |
| Details       | focus to heading, Escape and Close return focus to the opener                     |
| Controls      | zoom limits `aria-disabled` with focus kept, Locate flow (finding, found, denied) |
| Layers        | checkbox toggles markers and the list, count announced                            |
| AddressSearch | Autocomplete table, debounce and min length, Enter standalone vs in a form        |

Focus never lands on `body`. Announcements are polite, settle about 500 ms after the view, never during a drag. WCAG SCs: 1.1.1, 1.3.1, 1.4.1, 1.4.10, 1.4.11, 1.4.13, 2.1.1, 2.1.2, 2.4.3, 2.4.11, 2.5.1, 2.5.7, 2.5.8, 3.2.1, 3.2.2, 3.3.7, 4.1.2, 4.1.3.

### i18n strings

`map.*` and `addressSearch.*` keys from spec §4, in all 5 locales, overridable per provider and per instance (rule 4). Norwegian (nb, nn) are drafts for a native reviewer.

### Theming surface

`kv-map-viewport|marker|cluster|controls|pan|hint|status|attribution|list|details|search-result|location`, modifiers `kv-map--flush`. State as `data-*`: `data-selected`, `data-highlighted`, `data-busy`. One custom property `--kv-map-block-size`. No new colour pair.

## Tasks

Phase 0 is the gate: nothing past it starts before the approvals below.

- [x] P0 **APPROVAL:** dependencies, rule 7 wording, D2/D4 key model, D5 icon-only buttons, D6 halo, D7 motion, D8 height token (see Decisions)
- [x] P0 Rules 6–7, `docs/architecture.md`, `regulations` and `DESIGN.md` updated for what is approved
- [x] P1 `core/map` (geo maths, view state, clustering, kd index, provider types; node tests) and the `packages/map` scaffold with the memory provider
- [x] P2 `useMap` and the Map parts, i18n (5 locales), `map.css`, `map.test.tsx` (35 keyboard rows named), stories, `map.a11y.md`, docs page
- [x] P3 Layers, clustering (plans 0118, 0119); GeoJSON as an optional source still open
- [x] P5 MapLibre adapter (`/maplibre`, `/worker`)
- [x] P4a `ux-designer`: `docs/design/address-search.md` (states, content, announcements, standalone vs in a form, AddressInput hand-off)
- [ ] P4b `component-engineer`: built and gated 2026-10-19 (30 tests, 14 stories `Map/AddressSearch`, 5 locales, `nominatim`, `announceResults` on the combobox hook); first review CHANGES REQUIRED, fixes in progress: keyboard-skill entry for the Enter deviation, Read aloud table and tests, Space test on Search, Google SDK links under `aria-hidden`, a `Disabled` story, contract wording, status while resolving, `show()` on the same address, `map.md`. Then re-review on the delta
- [x] P4c `ux-designer` (research): which geocoders to support beyond `nominatim` (Google Places, Photon, Pelias/Geoapify, Mapbox, Nordic national services), their terms, and the open-adapter recipe so any provider plugs into `GeocoderProvider`; output `docs/design/geocoder-providers.md`; adapters follow as P4d
- [x] P5b `component-engineer`: Leaflet adapter (`/leaflet`, optional peer `leaflet`, catalog pin) then Google adapter (`/google`, SDK loaded by the consumer's call), against the provider contract; mocked at the engine boundary
- [ ] P4d `/google-places` geocoder entry (needs `resolve`, built in P4b); the docs recommend neither Google nor Nominatim for resident forms until the legal read of their terms (geocoder-providers.md O7). `/photon`, `/pelias`, `/kartverket` stay docs recipes unless the maintainer asks
- [ ] P5c Add `map` to `sweepComponents` in `vite.config.ts` and run the four sweeps (maintainer's gate list; reviewer recommends it)
- [ ] P6 Docs page and map.md updates for AddressSearch and the adapters; roadmap line
- [ ] P7 Gates, then `accessibility-reviewer` APPROVE. Manual AT questions for the matrix: "Chosen: …" heard twice, the pick and "The map shows the address" announcements cutting each other off, `aria-selected="false"` read on each option

## Decisions

Options weighed and chosen (taken with the maintainer, 2026-10-14):

- **Provider interface, optional-peer adapters** over one engine or an own renderer: Google and our own provider later are then just adapters. Chosen.
- **No default tile or geocoder URL**, over shipping OSM as default (visitor IPs would go to a third party by default). Chosen.
- **Scope:** map core, layers, AddressSearch. Drawing, measuring, routing deferred.

Approved by the maintainer on 2026-10-14 (spec §9 recommendations):

- **APPROVAL, dependencies:** `maplibre-gl` (BSD-3), `leaflet` (BSD-2) as optional peers, pinned in the catalog as dev dependencies, each with licence, network and install-script check. Google's SDK is loaded by the consumer's adapter call, never bundled. Clustering is our own grid code, so no `supercluster`.
- **APPROVAL, rule 7:** add "map tiles and geocoding are consumer-configured, off unless a provider is mounted; the library names no URL". Update architecture.md, `regulations`, rule text.
- **APPROVAL, keyboard (D2, D4):** one Tab stop for the markers in view, arrows between them; arrows pan, `+`/`-` zoom, Escape hides the hint. A deviation from "every marker a Tab stop" (Leaflet), recorded in the `keyboard` skill.
- **APPROVAL, DESIGN.md (D5–D8):** icon-only zoom and pan buttons, the halo rule, map-view motion, `--kv-map-block-size`. Four icons: `remove`, `arrow-up`, `arrow-down`, `locate`.
- D1 region + `aria-roledescription`; D3 focus to the details heading; D9 two-finger pan and Ctrl+wheel zoom; D10 pan buttons on; D11 list shows places in view; D12 AddressSearch on Autocomplete; D13 details in flow below 40rem. Approved by the maintainer as recommended.
- **Details popup at every width (maintainer, 2026-10-14):** `Map.Details` is a non-modal `role=dialog` popup anchored above the pressed marker (below if no room), portalled right after the markers so tab order follows them, with no panel below the map at any width and no hard focus trap (Escape and Close return focus to the opener). The marker moves to the bottom-centre on press. Replaces spec D13's in-flow panel; trade-off against 2.4.11 on 320px handled by capping the popup to the room above the marker so it never covers it.
- **Details fields and parts (maintainer, 2026-10-14):** `MapPlace` gains `image?: { src, alt }` and `description?`. `Map.Details` without children renders image, title with Close, body and address; with nodes exactly those; the function form stays. Parts `Map.DetailsImage|Title|Body|Address|Close` read the place from context and render nothing when empty. Look: 18rem max, full-bleed 16:9 image, `space-3` content padding, `kv-card` dropped, address in `text-muted`. `title` and `titleAs` props removed (use `Map.DetailsTitle as`).
- **Sequencing (maintainer, 2026-10-14):** English strings first, no tests until the map works. This defers, it doesn't waive: `sv fi nb nn` strings, `map.test.tsx` (every keyboard row), axe stories and the gates are owed before `accessibility-reviewer` and before the package is un-privated. `i18n:check` stays red until then.
- Pure logic in `core`, parts in `@kvirn-ui/map` (like `rich-text` on core): keeps rule 3 and one package for engines.

Taken during implementation (foundation and React slices):

- **maplibre-gl 6.14.0**, BSD-3-Clause, no install scripts (its `prepare` runs only in its own repo), 24 transitive packages, no network at import. Pinned in the catalog, a devDependency of `@kvirn-ui/map` and the Storybook app, an optional peer (`^6.14.0`) of the `/maplibre` entry.
- **Adapter:** `maplibre({ style })` takes the style from the consumer (no default URL). Keyboard off, rotate and pitch off, `cooperativeGestures` on so one finger scrolls the page and the wheel zooms with Ctrl/Command (D9). The engine's English overlay is hidden (`display: none`) and the `cooperativegestureprevented` event becomes the provider's `gesture` event: the viewport renders `map.gestureTouch` / `map.gestureWheel` itself. The canvas is `aria-hidden` and out of the tab order. Attribution control off: `Map.Attribution` renders the consumer's text.
- **Provider contract** gained `getSize`, `getBounds` and a `gesture` event; `MapProvider.mount` is the only place an engine is touched, and an `AbortSignal` destroys it.
- **Single source of truth for the camera:** commands call `handle.setView`; the engine's `move`/`moveend` events write the store. Motion always jumps (no animation) for now (D7).
- **i18n:** keys are `map.<key>` flat (`panNorth`, `tilesFailedTitle`), as the catalog depth is fixed. Only the English strings exist; `sv fi nb nn` carry `map: en.map` as a placeholder so types hold, so `i18n:check` passes falsely until real strings land: they are owed before un-privating.
- **Engine CSS:** the package ships none. A consumer imports `maplibre-gl/dist/maplibre-gl.css` for the engine's canvas and container rules (the Storybook story does).
- **Icons:** the built-in set stays at 25 (its cap and test are a gate). `remove`, `arrow-up`, `arrow-down`, `locate` are the map package's own icon components (`map-icons.tsx`), passed to `Icon icon={...}`: no consumer registration. The story marker uses the built-in `info` until a consumer brings a place icon.

Taken during the Docs page slice (English only, no tests):

- **Docs page:** `packages/map/src/map.md` (description, `## API`, notes with the rule 7 facts) and `map.a11y.md` (spec §7 as the contract; every Test cell is `pending`, no AT claim). `map.stories.tsx` has `meta.component: Map.Root`, `Default` first with controls for every Root prop, and a `Keyboard` story. The old OpenStreetMap, BaseMaps and MemoryProvider stories are folded into Default: MapLibre with the three real base maps (OSM, Esri, OpenTopoMap), tagged `!test` because it calls third parties. No story-only `engine` control. Coverage in the test run is `Offline` (a plain background style, no tile source), `Keyboard` and `OwnList`; `CustomBaseMapSwitch` switches real tiles, so it is `!test`. The memory provider stays a library export for tests and pages without an engine.
- **Offline and tiles stories expose the same three map types**, so `baseMap`, `defaultBaseMap` and the switch work in both. The story remounts the map when `defaultBaseMap` or `initialView` changes, since those are read once.
- **`baseMap` stays controlled only while the control is set:** the radios write back with `useArgs`; clearing it makes the map uncontrolled so `defaultBaseMap` shows.
- **Skip link target:** the list heading, or the details title while a place is open, so the target always exists.
- **Not yet:** focus pan under overlays (2.4.11), clusters, layers, Locate, offline notice, zoom-limit announcement from the buttons' own press is announced, details Close name check, Tooltip on markers, marker hover tooltip.
- **`rasterStyle({ tiles, attribution })`** builds a MapLibre raster style from the consumer's URL templates; no tile URL is in `packages/`. The `OpenStreetMap` story passes OSM's URL and is tagged `!test` (Storybook's own tag, honoured by addon-vitest), so no test run calls a third party. The repo's testing skill does not yet name this tag: add it there.
- **Base maps (spec §9 answered yes):** `MapBaseMap { id, label, attribution? }` in core; `MapProvider.baseMaps/defaultBaseMap` is read by `useMap` before mount, `MapHandle.setBaseMap(id)` swaps tiles (`map.setStyle`) and keeps camera and markers. `maplibre({ baseMaps, defaultBaseMap })` next to the single `style` option (no switcher). `Map.BaseMapSwitch` is a `RadioGroup` (a fieldset with legend `map.baseMapLabel`) beside the viewport, renders nothing under 2 base maps; `Map.Attribution` takes a node or `(baseMap) => node`, default the active `attribution`. Announces `map.baseMapChanged` on a switch only. No tile URL in `packages/`; the `BaseMaps` story (`!test`) holds OSM, Esri and OpenTopoMap URLs and the consumer owns the terms. No theme.css change (radio group styles suffice). No tests yet; English only.
- **BaseMapSwitch is templatable, the list is optional (maintainer, 2026-10-14):** `Map.BaseMapSwitch` takes a render function `({ baseMaps, baseMap, setBaseMap }) => ReactNode` that replaces the radios inside `div.kv-map-base-maps`; the consumer names the control; still nothing with fewer than two base maps. `useMapState()` is the public context reader (returns `UseMapResult`, throws outside `Map.Root`). `Map.Skip` renders only with details open, a mounted `Map.List` (registered in a root context) or an `href`; the focus-return fallback is opener, then list heading, then the viewport (it gets an `id`). Show or hide is whether you render the part: no `show*` props (rule 14), the story has controls only. The doc says the omitted list is the consumer's a11y duty.

### P5b decisions (Leaflet and Google adapters)

- Leaflet 1.9.4 pinned in the catalog (BSD-2-Clause, no install scripts: only a `prepare` for its own repo; the lockfile grew by 11 lines). No `@types/leaflet`: `leaflet-module.d.ts` declares the part used. Tests run the real engine in Chromium with an inline-image tile URL, so no mock and no network.
- The shared camera counts zoom from a 512px world, so both adapters add 1 to the engine's 256px zoom.
- Leaflet's own drag, wheel and double click are off. The adapter pans on a mouse drag, zooms on Ctrl/Cmd+wheel, and reports `gesture` for the bare wheel and one-finger touch; the container is `touch-action: pan-x pan-y` so one finger scrolls the page. Zoom and fade animation are off (reduced motion needs no extra check).
- Google: `mount` is sync, the SDK async, so the handle holds the camera until the SDK arrives and then applies it. A failed load is an `error` event. `gestureHandling: 'cooperative'` as briefed: Google exposes no "prevented gesture" event, so `gesture` comes from the container's own wheel and touch events and Google's English-or-locale overlay shows too (cannot be hidden). `project` and `unproject` are Web Mercator maths (no OverlayView). Attribution stays Google's (ToS), documented in `map.md`.
- `loader` returns `google.maps.importLibrary('maps')`; `apiKey` is the convenience path and names `https://maps.googleapis.com/maps/api/js`, the one URL Google requires.

AddressSearch (spec [address-search.md](../address-search.md), maintainer 2026-10-19):

- **Approved, keyboard deviation (D1):** Enter with nothing highlighted searches and never submits the form; `keyboard` skill updated in the same change.
- **Approved, API (D2–D4):** search on request (Enter or a Search button) by default, as-you-type only when the geocoder declares `suggest: true` (`nominatim` is false, per its usage policy). `GeocoderProvider` gains `name?`, `attribution?`, `suggest?`; `search` gains a `locale` option; `AddressResult` gains `address?` (`line1`, `postalCode`, `city`, `country`). `Map.show(result)` draws a non-interactive result pin and announces `map.addressShown`; new `clearResult()`.
- **Taken as recommended (D5–D8):** keep the "Chosen: {label}" announcement; Root renders a `div` (docs example wraps `<search>`); a form using only the lookup still imports `@kvirn-ui/map`; status text lives in the popup so Escape hides it.
- **Implementation (P4b):** the combobox hook gets `announceResults` (default `true`); AddressSearch sets it `false`, because empty `messages` fell through to the Autocomplete's own "No results" and "N results", which doubled ours (test in `combobox.test.tsx`). The Search button exists only on request, so the as-you-type intent test checks `submit` for Enter and that no button renders. The test recorder starts from the live region's current text, so a new recorder does not count an old message. Stories (`address-search.stories.tsx`) use the offline MapLibre provider from `map.fixture.tsx` (no tiles, no network) for WithMap, so the pin is visible. Each state is its own story, since one popup is open at a time.
- **Google adapter (maintainer):** keep `gestureHandling: 'cooperative'`; Google's own hint shows beside ours, documented in `map.md`.

## Risks & open questions

- **Engines fight for focus and wheel events.** MapLibre and Leaflet install their own keyboard and scroll handlers; the adapter disables them and the viewport drives the camera. Needs a spike in P1 before P2.
- **Imagery contrast can't be measured** (1.4.11): the halo pair is a rule, not a test. Raster tile text ignores text size (1.4.4): docs advise vector tiles.
- **Google terms:** its ToS bar hiding or restyling attribution, and the SDK sets cookies. The adapter documents this; consumer decides. Tracked as a docs item, not a library claim.
- **Nominatim's usage policy** forbids heavy autocomplete use: the default debounce (3 chars, delay TBD) and the docs say so; a self-hosted or paid geocoder is the production path.
- Open from the spec: base-map switcher, list paging, attribution wording owner, distance rounding per locale.
- Plain-language review and real AT runs (NVDA, VoiceOver, TalkBack) are `pending` human checks; agents never claim them.

## Testing strategy

Unit tests in `core` for geo maths, clustering and view state. Browser tests drive the memory provider (a static surface, no network) for every contract row. Stories use the memory provider too, so no story or test calls a third party. Axe in every story state and theme. Adapters are tested against the provider interface contract with the engine mocked at its boundary; one smoke test per engine in dev only if a pinned engine runs headless without network. Patterns: none (this is a component).

## Rollout

New package `@kvirn-ui/map`, private until the accessibility review returns APPROVE, then alpha. Changesets are off until alpha.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Every Core AT-matrix row has an agent check; human checks marked `pending`
- [ ] `accessibility-reviewer` returns APPROVE
- [ ] Plan tasks ticked, `docs/roadmap.md` updated, spec status set to Approved
