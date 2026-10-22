# Plan 0150: Geocoder country fix and CI smoke tests

- **Status:** Done
- **Owner:** lead · component-engineer · docs-writer
- **Created:** 2026-10-22 · **Target:** alpha
- **Related:** Plan 0117 (map and address search), `docs/design/kvirn-geocoder-data-report.md`

## Goal

The address examples on the docs site and in Storybook find real addresses at geo.kvirn.com again. A broken request to the service (an unsupported country, a changed response) fails CI instead of reaching a visitor.

## Non-goals

- Monitoring the service. geo.kvirn.com has its own monitoring, so there's no nightly or scheduled job here.
- Data quality on the service. A street result's `city` holding the municipality ("Kils kommun") and missing house numbers are fixed in the service's data, not here. The library handles them as well as it can.
- The "Kvirnby" fixture wording in `address-input.md` and `.a11y.md`. It's fine as test data (maintainer).

## Background

- The docs geocoder sent `country=se,fi,no,de`. The service answered 400 `unknown-country` (it accepts `se, no, fi, dk, is`), so every lookup on the AddressInput page failed. No test touches the live service, and the OpenAPI spec types `country` as a plain string, so a spec-based test would not have caught it.
- The service's supported countries are in `GET /health` → `sources[].countries`, currently `se, no`. `fi`, `dk` and `is` are accepted but return nothing.
- `kvirnGeocoder.search` sends the whole `countries` list and ignores the per-search `country`. The service reads `postcode` in the first listed country, so a Norwegian postal code fails when `se` is listed first (`country=se,no&postcode=0154` → 400, `country=no,se` → 200).

## Design

### Adapter (`packages/map/src/kvirn.ts`)

- The `country` param is the per-search `country` first, then the rest of `countries`, without duplicates. Cross-country results still work.
- A per-search country outside a set `countries` list is not added.
- With `countries` unset, the per-search country is sent alone only when a postcode is sent.

### Smoke tests (CI only)

- A few live requests to geo.kvirn.com: `/health`, autocomplete, search, structured and reverse, each through `kvirnGeocoder` where it has a method. Each asserts HTTP 200 and a JSON body that parses with the expected top-level shape (`results` array, `sources` array). No assertions on data content.
- One assertion ties the repo to the service: every `countries` list in `apps/` geocoder configs is a subset of `/health` `sources[].countries`. That's the check that would have caught `de`.
- A separate Vitest project (`smoke`), outside `vp run test`, so local runs and the per-change gates never touch the network. CI runs it in its own step.

## Tasks

- [x] T1 lead: drop `de` from the docs geocoder and the Storybook live fixture, and `fi` from the fixtures (`/health` lists `se, no`)
- [x] T2 docs-writer: AddressInput page lookup use cases against the live service (address-lookup reworded, new `address-in-postal-area`, `address-abroad` → Nordic move NO↔SE)
- [x] T3 component-engineer: adapter honours the per-search country (5 tests in `kvirn.test.ts`; a postcode with no `country` gets 400 `invalid-postcode`, which confirms the unset-countries rule. The structured lookup already sends one country, so it's unchanged)
- [x] T4 component-engineer: `smoke` Vitest project, smoke test file, CI step, testing skill and `docs/engineering.md`
- [x] T5 lead: gates on the changed files, accessibility review of the docs-page examples, roadmap line
- [x] T6 component-engineer (library): `kvirnGeocoder({ attribution: null })` leaves the credit out; `AddressInput.Line1 privacyNotice={false}` leaves the notice above the street box out; tests, `.a11y.md`, `.md`, the live Storybook geocoders credit OSM once
- [x] T8 component-engineer (docs): the three autocomplete examples turn both off and put the privacy sentence in the street box's help text; the page credits OSM once and reminds adopters to add both themselves
- [x] T7 component-engineer: a "Good to know" info alert above each autocomplete example on the AddressInput docs page ("What you type is sent to Kvirn’s map service to find the address."), through a new optional `notice` slot on the docs `UseCase` (maintainer, 2026-10-23)

## Decisions

- **API-break tests: a few live smoke tests in CI only** (status 200 and the JSON parses), no nightly job (maintainer, 2026-10-22). This is a gate change approved by the maintainer. Rejected: a spec-snapshot test (the spec has no country enum) and a nightly job (the service has its own monitoring).
- **Supported countries come from `/health`** at test time, not from a constant in the repo, so the repo follows the service (maintainer).
- **The adapter puts the chosen country first rather than sending it alone**, so a Swedish result can still be picked while Norway is selected (docs `address-abroad` case).
- **No Finnish use case** on the docs page: the service has no Finnish data yet.
- **The house-number lookup** (structured after a street pick) is described on the page in a sentence, not as a "try this". Results depend on source data.

- **Docs fixes made along the way:** `docs/engineering.md` said the display-mode sweep "is not built yet" and "isn't run by any workflow", but `ci.yml` runs it. It was corrected in the same CI section as the smoke step (reviewer finding 5).
- **Review follow-ups (APPROVE, non-blocking):** (2) a chosen country outside `countries` drops `postcode`, so it can't 400 (fixed here). (3) The lookup case links Announcements again (fixed). (1) With a Country part, Line1's help "Suggests addresses in <country>" is inaccurate, because other countries' results show too. It should read "Searches <country> first." in all 5 locales: follow-up, a component string change outside this plan. (4) The demo forms don't validate (as `address-lookup` already didn't): left as is, `errors-per-box` shows validation.

- **The OSM credit appears once per page or story, not under every field** (maintainer, 2026-10-23). It's still visible, because ODbL requires crediting OSM where its data is shown. Rejected: removing it entirely (licence) and moving it into the suggestions popup. `kvirnGeocoder` takes `attribution: null` to leave the field credit out, a small public API addition. The default stays `© OpenStreetMap contributors`.

- **The notice and the credit can be turned off** (maintainer, 2026-10-23, accessibility trade-off approved): `privacyNotice={false}` on `AddressInput.Line1` and `attribution: null` on `kvirnGeocoder`. Then the consumer must say where the text goes and credit the data themselves. The docs examples put the notice in the street box's own help text, which keeps it in Line1's description, so a screen reader still reads it on focus, but after the lookup help, not first. The page reminds adopters. The defaults are unchanged. This replaces the T6 "credit once per page" approach.

## Risks & open questions

- The smoke step fails when geo.kvirn.com is down. That's accepted: it should block a release that ships broken examples.

## Testing strategy

- T3: node unit tests with mocked fetch, one per adapter rule.
- T4: the smoke project, never in `vp run test`.
- Smoke tests import `kvirnGeocoder` by relative path and add `tooling/geo-smoke` to the root `tsconfig.json` include. `/v1/geocode/reverse` answers `{ result }` (one place), not `results`; the adapter has no reverse method, so the test uses raw `fetch`.

## Rollout

No public API change. The adapter fix is a behaviour fix with no option added.
