# Plan 0147: Kvirn map service adapters

- **Status:** In progress (phase 1 done 2026-10-21; phase 2 T3 built, T4 next; the live check waits for S1)
- **Owner:** lead / component-engineer
- **Created:** 2026-10-21 · **Target:** map alpha
- **Related:** [0117](0117-map-and-address-search.md) (map, AddressSearch, the provider contract), `docs/design/geocoder-providers.md`, `docs/design/address-search.md`, skills `api-conventions`, `testing`, `regulations`

## Goal

A team can point AddressSearch at the Kvirn map service (`https://geo.kvirn.com`, OpenAPI at `/v1/openapi.json`) with one call. Later, the same entry gives MapLibre base maps in the four themes, and the docs site's Map examples run on it.

## Non-goals

- A default URL. `url` is required, as for `nominatim` (maintainer, 2026-10-21).
- Reverse, structured geocoding, `/v1/places`, `/v1/regions`, `/v1/layers`. Each needs public API that 0117 didn't approve (a `reverse` on `GeocoderProvider`, a place-layer loader), so they get a later plan.
- Per-query `city` and `postcode` filters.

## Background

Service facts, probed 2026-10-21:

- Live: `/v1/geocode/autocomplete|search`, `/v1/attribution`, `/sprites/{name}`, `/fonts/{stack}/{range}`.
- Not live: all four `/styles/{light|dark|light-contrast|dark-contrast}.json` return 404 (nginx). `/tiles/{set}/…` isn't in the OpenAPI spec, and the set name is unknown.
- **No CORS:** `OPTIONS` returns 404 and `GET` has no `Access-Control-Allow-Origin`, so no browser can call the service yet.
- `info.license`: "To be decided before any use outside Kvirn". It sets no cookies and reads no credentials (`credentials: 'omit'`). Errors are `application/problem+json`. Language comes from `lang`, then `Accept-Language`, then the country's language.
- Result shape (`AddressResults`): `{ results: [{ id, label, position: { lat, lon }, bbox?: [minLon, minLat, maxLon, maxLat], precision, address: { line1, postalCode (null when unknown, despite the schema), city, country (lower case) } }] }`.
- `autocomplete` and `search` take `q, country (comma list), lang, limit (1–50), focus (lon,lat), bbox (minLon,minLat,maxLon,maxLat)`. `search` works from two characters.

## Design

### API sketch

```ts
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'

<AddressSearch
  geocoder={kvirnGeocoder({ url: 'https://geo.kvirn.com', countries: ['se', 'no'] })}
  onResult={show}
/>
```

```ts
export interface KvirnGeocoderOptions {
  /** The service's origin, e.g. your own deployment. The library names none. */
  url: string | URL
  /** Who receives the typed text, named in the privacy notice. Default: the host name. */
  name?: string | undefined
  /** Credit text. Default '© OpenStreetMap contributors'; `/v1/attribution` gives the exact text per country. */
  attribution?: string | undefined
  /** Most results. Default 6. */
  limit?: number | undefined
  /** ISO 3166-1 alpha-2, e.g. ['se']. */
  countries?: readonly string[] | undefined
  /** Ranks ties nearer this point higher, never filters. */
  focus?: LngLat | undefined
  /** Limits results to this box. */
  bounds?: MapBounds | undefined
}
export function kvirnGeocoder(options: KvirnGeocoderOptions): GeocoderProvider
```

Behaviour:

- `suggest: true`: the service is built for a request per pause in typing.
- `intent: 'suggest'` calls `/v1/geocode/autocomplete`, and `'submit'` or none calls `/v1/geocode/search`. A trimmed query under 2 characters returns `[]` without a request.
- `locale` is sent as `lang` (the BCP 47 language subtag, lower case), not as a header.
- `fetch` is called with `credentials: 'omit'`, `referrerPolicy: 'strict-origin-when-cross-origin'` and the `signal`. A non-ok response throws `Error('Address search failed (<status>)')`.
- Mapping: `position {lon, lat}` becomes `{ longitude, latitude }`; `bbox` becomes `bounds { west, south, east, north }`; `postalCode: null` becomes `''`; `country` is upper case (as `nominatim`). Every result has a position, so there's no `resolve`.
- `url` is a base URL: an origin, or a path on your own proxy, which is kept. `limit` is clamped to the service's 1–50.
- What is sent, for the consumer's privacy notice: the query, the language, the country filter, the limit and, when set, `focus` and `bounds`.
- A session cache of 50 answers, keyed by intent, locale and query (as `nominatim`).

### Accessibility contract (draft)

No new UI and no keyboard rows. The adapter feeds AddressSearch, whose contract (`address-search.a11y.md`) is unchanged. It must not break that contract's privacy notice, which names `name` and `attribution`.

### i18n strings

None. The credit text is a licence string, not UI copy (as in `nominatim`).

## Tasks

Phase 1, now:

- [x] T1 `component-engineer` (2026-10-21, 13 tests): `packages/map/src/kvirn.ts` + `kvirn.test.ts` (fetch mocked), `./kvirn` in `packages/map/package.json` exports and the `vite.config.ts` entry list, a `/kvirn` section in `packages/map/src/address-search.md`, a row in `geocoder-providers.md` §5
- [x] T2 lead (2026-10-21: check and test green, reviewer APPROVE after one round): gates (`vp check`, `vp test run` on the files), `accessibility-reviewer` on the diff, roadmap line

Phase 2, blocked on the service (needs the maintainer):

- Service state, probed 2026-10-21 23:50: the four styles are live (MapLibre v8, one vector source `nordic` at `<origin>/tiles/nordic/{z}/{x}/{y}.mvt`, z0–14, glyphs `<origin>/fonts/{fontstack}/{range}.pbf` with Noto Sans Regular and SemiBold, sprite `<origin>/sprites/<theme>`, 17 layers, `metadata["kvirn:generated-from"] = "@kvirn-ui/theme/theme.css"`). Every tile returns 404 "Archive not found". Tiles send `Access-Control-Allow-Origin: *`; styles, sprites, fonts and `/v1/*` send none. The style URLs are absolute to geo.kvirn.com, so a consumer's proxy is bypassed for tiles.
- [ ] S1 service: CORS on styles, sprites, fonts and `/v1/*` (tiles have it), the `nordic` tile archive deployed, ~~styles live~~ (done), the tile path in the OpenAPI spec, style URLs that follow the requesting host (or a base parameter) so a proxy works, `postalCode` either nullable in the schema or always a string
- [x] T3-spec `ux-designer`: [`docs/design/kvirn-base-maps.md`](../kvirn-base-maps.md) (2026-10-21)
- [x] T3 `component-engineer` (2026-10-22): the theme reaches the engine, and `kvirnBaseMaps`, per §Phase 2 design below
- [x] T4 `component-engineer`, after T3: docs site and Storybook on the Kvirn map + Plain; Esri, OpenTopoMap and the opt-in removed. In the same change: rule 7 in `AGENTS.md`, `docs/compliance.md:13`, the `regulations` skill (:43, :53), `apps/docs/messages/en.ts:683`, `apps/docs/components/map-page.tsx:394`, `apps/docs/examples/map/{use-docs-provider.tsx,texts.ts,map-types.tsx}` and `apps/storybook/src/components/map/map.fixture.tsx:113-170`
- [ ] T5 lead: gates, `accessibility-reviewer` (incl. spec §7 on the live styles once tiles load), roadmap

### Phase 2 design (T3)

Spec decisions D1–D4 apply. API, all optional and non-breaking (maintainer, 2026-10-21: through the map types):

```ts
// core/map/types.ts
export interface MapTheme { colorScheme: 'light' | 'dark'; contrast: 'standard' | 'more' } // forced colours ⇒ 'more'
MapMountOptions.theme?: MapTheme
MapHandle.setTheme?: (theme: MapTheme) => void   // swap at once, keep camera; a failed swap keeps the old style
MapBaseMap.label?: string                        // was required; absent ⇒ messages.map.defaultBaseMapLabel ('Map')
// maplibre.ts
MapLibreBaseMap.style: string | StyleSpecification | ((theme: MapTheme) => string | StyleSpecification)
// kvirn.ts
export function kvirnBaseMap(options: { url: string | URL; id?: string /* 'kvirn' */; label?: string; attribution?: string }): MapLibreBaseMap
// usage: maplibre({ baseMaps: [kvirnBaseMap({ url }), plain] })
```

- `useMap` reads `useTheme()` (`resolvedColorScheme`, `resolvedContrast`, `isForcedColors`), passes `theme` on mount and calls `handle.setTheme` on a change. No announcement, no focus move, nothing on screen but the new style (spec D1).
- Style URL: `<url>/styles/<light|dark>[-contrast].json`. `kvirn.ts` keeps type-only imports from `maplibre-gl`.
- New i18n key `map.defaultBaseMapLabel` in all 5 locales; every place that reads `baseMap.label` (switch, `baseMapChanged`) falls back to it.
- Credit: a static `attribution`, default '© OpenStreetMap contributors', which is the style source's credit today. Reading it from the loaded style (spec D4) would need a new handle event, so it waits until a second source exists.

## Decisions

- **One `/kvirn` sub-entry** for the geocoder now and the base maps later, rather than adding to `/nominatim` or `/maplibre`: one service, one import, and the MapLibre peer stays out of a geocoder-only bundle (the entry imports only types from `maplibre-gl`).
- **`url` required** (maintainer, 2026-10-21): keeps rule 7 as written, and the service's licence isn't settled for use outside Kvirn.
- **Phase 1 is the geocoder only** (maintainer, 2026-10-21): the styles and tiles aren't live.
- **Docs site drops the map opt-in** once it switches (maintainer, 2026-10-21): the host is first-party, in the EU and sets no cookies. Visitor IPs reach geo.kvirn.com on page load, so rule 7 is reworded in that change (T4). This is a privacy trade-off, approved by the maintainer.
- **Static `attribution` with an OSM default**, rather than fetching `/v1/attribution` at runtime: `GeocoderProvider.attribution` is a plain string, and a fetch would be a second request the consumer didn't ask for. Every current source is OSM. Revisit when the service adds a national register (see Risks).
- **T1 (engineer):** the query is trimmed before it is sent and before the cache key is made; a `bbox` or `address` that is null or absent maps to no `bounds` or no `address`; `address-search.md` had no Nominatim section, so a short "Geocoders" section was added at its end.
- **`lang` as a query parameter**, not `Accept-Language`: a simple request with no custom header is CORS-safelisted and stays cacheable.

- **Phase 2 (maintainer, 2026-10-21):** the theme reaches the engine through optional map types, not by the adapter reading the document's theme store (which would ignore a `KvirnProvider`'s own store). Storybook drops Esri and OpenTopoMap as well, so rule 7 names one host. A rebranded palette in the map is a later service feature (a palette parameter or self-hosted styles), not this plan.
- **Phase 2 (lead):** one base map whose style follows the theme (spec D1–D2), not four base maps: a contrast style is a reading preference, not a map type. `kvirnBaseMap` is singular and returns one entry. A consumer can't pin one style (for print or a kiosk) until someone asks, keeping the API small. The credit is static (see the T3 design) instead of read from the style (spec D4).

- **T4 (engineer):** docs and Storybook import `kvirnBaseMap` from `/kvirn`, and the root `tsconfig.json` gets the `@kvirn-ui/map/kvirn` alias. Storybook's Kvirn map keeps the id `standard`, so its `baseMap` arg and controls still match. Plain is `background-opacity: 0`, credited "No map data". The offline/test branch is unchanged, so no request is made. The fixture's custom select falls back to 'Map' for an unlabelled entry, as consumer code would.
- **T4 (lead):** removed "we receive nothing from the request" from the privacy copy (`apps/docs/messages/en.ts:683`): Kvirn runs geo.kvirn.com, so the claim depends on the service's logging, which the copy will state once the maintainer gives it.
- **Gates (lead, maintainer approved 2026-10-22):** deleted 724 stale, gitignored `.d.ts` files emitted next to the sources in `packages/{core,i18n,icons,react}/src` by a tsc run on 2026-10-20. The bundler read them instead of the `.ts`, which broke the core and map builds (`MapTheme` missing).

## Risks & open questions

- Pre-existing, not this plan: `address-search.test.tsx` "show(result) of the address already shown…" fails because the settle effect doesn't fire when the view is unchanged (`use-map.ts:~403`). Owned by Plan 0117 P4b.
- The privacy copy needs the service's request-log retention from the maintainer.

- Once the service imports national registers, the OSM default credit is wrong. T3's attribution work should give the geocoder the same source of truth.
- Without CORS, phase 1 can only be proved with a mocked fetch. A live check in Storybook waits for S1.
- The licence must be settled before `@kvirn-ui/map` is un-privated, or the docs must say the service is for Kvirn only.

## Testing strategy

`kvirn.test.ts` in the map package's node project, with `fetch` stubbed: the endpoint per intent, the query parameters (country, limit, focus, bbox, lang), `credentials: 'omit'`, signal passed, no request under 2 characters, mapping (null postal code, bbox order, upper-case country), an error on non-ok, a cache hit with no second request. AddressSearch's own tests already cover the UI.

## Rollout

`@kvirn-ui/map` is private. Changesets are off until alpha.

## Done when

- [x] Phase 1: gates green, reviewer APPROVE, roadmap line
- [ ] Phase 2: S1 done, then T3 and T4 planned and gated

## Implementation decisions (T3)

- The theme is read in `use-map-camera.ts` (where the mount lives), not in `use-map.ts`; a ref carries the mount theme so a theme change never re-mounts.
- Forced colours map to contrast `more`; resolved contrast `less` maps to `standard`.
- `setBaseMap` ignores an unknown id and resolves with the current theme; `setTheme` compares the resolved style by identity or string, so a function that returns a fresh object each call restyles on every change.
- `kvirnBaseMap` takes `url: string | URL` like the geocoder, and `label` stays unset so the switch falls back to `map.defaultBaseMapLabel`.
- Tests: `kvirn.test.ts` (base map), `maplibre.test.ts` (engine mocked), `map.test.tsx` (theme change, unlabelled name). The memory provider is unchanged: the test wraps `mount` to attach a `setTheme` spy.
