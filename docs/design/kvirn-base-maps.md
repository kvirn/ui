# Design spec: Kvirn base maps and the docs Map examples

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-21
- **Plan:** [0147](plans/0147-kvirn-map-service.md) T3 (`kvirnBaseMaps`) and T4 (docs site), waiting on S1
- **Type:** component default behaviour (`@kvirn-ui/map/kvirn`) and docs page

## 1. Brief

- **Users:** residents finding a place on a council map (a recycling station, a polling station), staff, and developers on the docs Map page. Hardest cases: a low-vision resident in dark-contrast with 400% zoom; a Windows contrast-theme (forced colours) user; a light-sensitive user whose dark page must not hold a bright white map; a screen-reader user who must lose nothing when the theme changes.
- **Job:** "When I've set my display to dark or high contrast, the map should be readable in the same way, without me finding a second setting."
- **Constraints:** rule 4 (strings), rule 7 (reworded in T4, maintainer-approved), OSM ODbL credit, the service's open licence (plan Risks). The four styles are generated from `theme.css` but served from geo.kvirn.com, so `theme:check` never sees them.
- **Evidence:** none from our users. **Assumption:** contrast-preference users expect the map to follow the page → research question in §8.

## 2. Prior art

| Source                                                                      | Reuse                                          | Change and why                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| Apple Maps, Google Maps (Android): follow the OS appearance                 | Dark follows the system, not a map-type choice | We also follow contrast and forced colours, and the page's own setting    |
| Esri basemap gallery: "Dark Gray Canvas" is its own basemap                 | -                                              | Rejected: makes the user set dark twice, and a mismatch is one click away |
| KvirnUI `map.md`: Map type popover, halo, Attribution part                  | Unchanged parts, recipe and placement          | Nothing new in the chrome                                                 |
| KvirnUI theme store (`useTheme`: resolved scheme, contrast, forced colours) | The single source of the page theme            | -                                                                         |

## 3. Decisions

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                              | Why                                                                                                                                                                                                                                                                                                                                                                                                | SC                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| D1  | **The style follows the page theme; the four styles are never switch entries.** Style = `resolvedColorScheme` + `-contrast` when `resolvedContrast` is `more` **or** forced colours is active.                                                                                                                                                                                                                                        | The user has already chosen dark or contrast once, for the page; a second, per-map choice is redundant, defaults the contrast user to the standard map, and allows a glaring light map on a dark page. Four theme entries would also crowd the three-tile switch and announce "Map type: Dark contrast", which isn't a map type.                                                                   | 1.4.3, 1.4.11 (at the level the user chose) |
| D1a | **Forced colours:** the contrast style. Light or dark comes from the OS `prefers-color-scheme` (the browser reports the forced palette's lightness), not from a stored page choice.                                                                                                                                                                                                                                                   | Canvas pixels are never recoloured by forced colours, so the strongest label and line contrast is the closest we can get; the chrome already uses system colours (`map.md`).                                                                                                                                                                                                                       | 1.4.11                                      |
| D1b | **Live theme change:** the style swaps in place. Camera, selected place, open popup, base-map choice and focus are kept; nothing is announced; the swap is instant in every motion setting (no paint fade); the previous style stays on screen until the new one has loaded, and a failed swap keeps it silently (the map still works). First mount uses the resolved theme, so there is no flash of a light map on a dark page.      | Accessibility skill §9: a theme change moves no focus and announces nothing. It is not a `setBaseMap`, so `baseMapChanged` must not fire. Keeping the old style beats a blank or failed map.                                                                                                                                                                                                       | 2.4.3, 4.1.3, 2.3.1, 3.2.2                  |
| D2  | **One base map, id `kvirn`, default name "Map"** (new key `map.defaultBaseMapLabel`), overridable per provider (messages) and per instance (`kvirnBaseMaps({ label })`). The name follows a locale change without a remount.                                                                                                                                                                                                          | One map, four looks. The name is only seen when a consumer adds another map type (aerial photo, plain), and then "Map" beside "Aerial photo" is the plainest pair in a second language. Today `MapBaseMap.label` is a fixed consumer string, so T3 needs a way to resolve it from messages at render: an API point for the plan.                                                                   | 2.4.6, 3.1.5 (plain words), rule 4          |
| D3  | **Docs Map type example: "Map" (Kvirn) + "Plain" (a background that requests nothing).** No Esri, no OpenTopoMap, no opt-in anywhere. Plain draws a transparent background layer so the viewport's `surface` token shows through and it follows all four themes and forced colours (today it is a fixed `#dfe6ea`). A code-only snippet (not rendered) shows how a site adds its own aerial map from a host it has an agreement with. | The switch stays visible and real with zero third parties, so rule 7 names one host. A plain map is also a genuine option: markers without map clutter help some users with cognitive or visual impairments. Keeping Esri/OpenTopoMap would need either a third-party call without consent or a second opt-in pattern on one page.                                                                 | rule 7; 1.4.11 (Plain follows the theme)    |
| D4  | **Credit = the loaded style's source attribution** (the data actually drawn), shown in `Map.Attribution` (unchanged: bottom inline end, `body-small` on `surface-raised`, label `map.attributionLabel`). Until the style loads, and if it fails: "© OpenStreetMap contributors". `kvirnBaseMaps({ attribution })` overrides. **Not** `/v1/attribution` for base maps.                                                                 | It always matches the tiles, updates when the service adds a register, needs no extra request, no CORS on `/v1/*` and no guess at which country the view shows. `/v1/attribution` fits the geocoder better (results are per country). A licence string, so no i18n key (as `nominatim`); if the service ever returns a localised credit in another language than the page, it gets `lang` (3.1.2). | 3.1.2 (only if localised)                   |

## 4. Content

| Key / place                                               | en                                                                                                                                                                                                         | Notes                                                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `map.defaultBaseMapLabel` (library, 5 locales)            | Map                                                                                                                                                                                                        | Shown in the switch and in `baseMapChanged` ("Map type: Map."). Reusable by any adapter with a single unnamed map |
| docs `mapTypePlain` (exists)                              | Plain                                                                                                                                                                                                      |                                                                                                                   |
| docs `mapTypesNote` (rewrite)                             | The Map type button lists Map, from geo.kvirn.com, and Plain, a background that requests nothing. A site adds its own map types, such as aerial photos, from a tile host it has an agreement with.         | Replaces the opt-in note                                                                                          |
| docs `themeNote` (new, under the default example)         | Change the theme in Display settings: the map follows it.                                                                                                                                                  | Shows D1                                                                                                          |
| docs privacy `maps.body` (`apps/docs/messages/en.ts:683`) | The maps on the Map page load their pictures from geo.kvirn.com, KvirnUI's own map service, hosted in the EU. It receives your IP address, your browser details and the area you view. It sets no cookies. | `TODO(legal-verify)` stays with the regulations skill                                                             |
| docs `map-page.tsx:394` paragraph                         | The maps on this page come from KvirnUI's own map service; the privacy page says what it receives. Move the map with …                                                                                     | Drop the "Load map pictures" sentence                                                                             |
| Removed                                                   | `picturesTitle`, `loadPictures`, `loadPicturesNote`, `picturesLoaded`, `mapTypeStandard`, `mapTypeSatellite`, `mapTypeTerrain`, `MapPicturesAlert`                                                         |                                                                                                                   |

## 5. Structure and visual

No new part, token or layout. `map.md` §Structure and §Visual hold unchanged: the switch renders only with two or more maps, so every docs example except Map type shows none. Storybook (`map.fixture.tsx`) follows the docs: Kvirn + Plain, and the three-tile switch state is built from no-network styles (Plain plus two token-coloured variants), so no story calls a third party. Below 40rem the Attribution row wraps; a longer multi-register credit wraps, never truncates.

### Modes

- **Four themes:** D1 picks the style. Markers keep the halo rule (`map.md`), re-measured on the real tiles (§7).
- **Forced colours:** D1a. Chrome in system colours as today; Plain shows `Canvas` through the transparent layer.
- **RTL:** the map never mirrors (`map.md`); the credit is at the inline end.
- **Motion:** D1b, instant swap. **320px / 400% / 1.4.12:** unchanged from `map.md`.

## 6. Accessibility annotations

- No new focusable part, role, key or Tab stop; the Map type switch contract is unchanged.
- Theme change: no focus move, no announcement, no `baseMapChanged`; viewport name, selection and popup unchanged (contract rows for T3).
- Base-map change between Map and Plain: the existing `baseMapChanged` announcement.
- Attribution: plain text in `Map.Attribution`, not live; a credit that changes after the style loads is not announced.

## 7. What a reviewer checks that `theme:check` can't

The styles live on geo.kvirn.com. For **each of the four styles**, at about z6, z10 and z14 over a city, coast and forest (screenshots into `/tmp`, sampled pixel pairs):

| Check                                                                                     | Floor                                                                                                                        | SC                          |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Place, street and water labels against their halo, and the halo against the fill under it | 4.5:1 standard, 7:1 contrast styles (DESIGN.md floors; map labels may be exempt as "part of a picture", we hold them anyway) | 1.4.3, 1.4.6 target         |
| Roads against land, water edge, buildings at z14, admin boundaries                        | 3:1 to the neighbour                                                                                                         | 1.4.11                      |
| Boundaries and paths differ by dash or width, not hue alone                               | -                                                                                                                            | 1.4.1                       |
| POI sprite icons against the fill                                                         | 3:1                                                                                                                          | 1.4.11                      |
| Marker halo on the real tiles                                                             | 3:1                                                                                                                          | 1.4.11 (`map.md` halo rule) |
| `metadata["kvirn:generated-from"]` matches the release's `theme.css`                      | -                                                                                                                            | drift                       |
| Glyphs (Noto Sans) cover the Sámi and Nordic letters in place names                       | -                                                                                                                            | 1.3.1                       |
| Swap behaviour of D1b and forced colours of D1a (Windows contrast themes, light and dark) | -                                                                                                                            | 2.4.3, 4.1.3                |

Failures are service fixes (S1 or a new service task), never a repo token change.

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blockers in this spec; §7 is pending until the tiles are live.
- [x] No new colour pair in the repo. Map colours are measured per §7, not by `theme:check`.
- [ ] Usability test plan written. Result: `pending`

### Usability test plan (`pending`)

- **Participants:** forced-colours users (light and dark), a low-vision user with magnification in dark-contrast, a light-sensitive dark-mode user, a screen-reader user, a second-language reader, a resident with low digital confidence.
- **Tasks:** find the nearest recycling station in your usual display settings; change the theme in Display settings mid-task and carry on; switch to Plain and back; tell us who supplies the map data.
- **Measure:** completion, whether the theme change interrupted anything, label legibility ratings per style, whether anyone looked for a dark or contrast entry in Map type (tests the D1 assumption).

## 9. Open questions

1. **Plan T3 text** says "four MapLibre base maps"; this spec makes it one base map with four styles. Lead updates the plan; maintainer if he wants theme entries in the switch.
2. **Label from messages (D2):** `MapBaseMap.label` is a fixed string today; how T3 resolves `map.defaultBaseMapLabel` at render is an API point for the plan.
3. **Rebrand:** the styles come from the default `theme.css`, so a rebranded site gets the default map palette. Does the service take a palette (maintainer, service)?
4. **Pinning:** a consumer who wants one fixed style (a print view, a light-only kiosk). An option, or out of scope?
5. **Storybook:** dropping Esri and OpenTopoMap from Storybook too, as proposed in §5, is the maintainer's call under rule 7.
6. **Credit links:** OSM asks for a link to its copyright page; `MapBaseMap.attribution` is plain text. A later plan.
