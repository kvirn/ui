# Plan 0149: AddressInput street autocomplete, on the shared address lookup

- **Status:** Done (review APPROVE 2026-10-22; full run and sweeps in CI)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-22 · **Target:** map alpha
- **Related:** spec [address-input-autocomplete.md](../address-input-autocomplete.md), plans 0117 and 0147 (AddressSearch, Kvirn geocoder), skills forms, keyboard, overlays-and-lists, api-conventions

## Goal

A resident filling an address form can type part of their address in "Find your address", pick it, and get the
street, postal code and city filled in; the boxes stay ordinary, autofillable fields they can check and correct.

## Non-goals

- Changing how AddressSearch looks or behaves for its users (it moves onto the shared lookup, same contract).
- A map in AddressInput. Geocoders stay in `@kvirn-ui/map` (`kvirnGeocoder`, `nominatim`, `googlePlaces`).
- Country, locale or language props on the Root beyond the existing `country` (they come from `KvirnProvider`).

## Background

- AddressInput (`packages/react/src/address-input/`): parts Root, Line1, Line2, PostalCode, City, each a bare TextInput
  (`address-input.tsx:128-153`); Root takes `country` and `autoComplete` (`:16-29`).
- AddressSearch's lookup is one React hook, `packages/map/src/use-address-search.ts:93-503` (engine `:93-417`, field
  `:420-503`). It imports only `@kvirn-ui/react` (+ `/internal`), core and i18n: nothing map-specific. 42 tests in
  `packages/map/src/address-search.test.tsx` cover it. Strings are in `addressSearch.*` (`i18n/src/types.ts:782-808`);
  `pickedFilled` (`:807`) exists and is unused.
- Geocoder types: `packages/core/src/map/types.ts:80-122` (`AddressDetails`, `AddressResult`, `AddressSuggestion`,
  `GeocoderProvider` suggest/search/resolve), exported at `core/src/index.ts:484-488`.

## Design

Spec: [address-input-autocomplete.md](../address-input-autocomplete.md) (model b). Where the plan and the spec differ, the
plan wins.

```tsx
<Fieldset.Root>
  <Fieldset.Legend>Home address</Fieldset.Legend>
  <AddressInput.Root geocoder={kvirnGeocoder({ url })}>
    <AddressInput.Country />{' '}
    {/* optional: first; the country to search in and the postal code format */}
    <Field.Root>
      <Field.Label>Street address</Field.Label>
      <AddressInput.Line1 />
    </Field.Root>
    …PostalCode, City as today
  </AddressInput.Root>
</Fieldset.Root>
```

1. **Shared lookup in react.** `use-address-search.ts` moves to `packages/react/src/address-lookup/` (hook, Status and
   Notice parts, their CSS from `map.css` to `theme.css`). `@kvirn-ui/map`'s AddressSearch imports it; its public API and
   its 42 tests don't change.
2. **Line1 is the autocomplete** (revised 2026-10-22, replaces the separate Lookup): with a `geocoder` on the Root,
   `AddressInput.Line1` is the ARIA 1.2 combobox from the shared lookup, labelled by the consumer's `Field.Label`
   ("Street address"). It keeps `autocomplete="address-line1"` (browser autofill keeps working) and its `name`; it stays a
   free-text field: the lookup helps, never decides. A pick puts the result's street (with its number when the result has
   one) in Line1 and fills PostalCode and City, never Line2; a value an earlier pick left and the new result lacks is
   emptied; a value the user typed stays. Focus stays in Line1 with the caret at the end, so a missing number is typed
   straight after the street; typing on may offer house-level matches. A `street` result (no house numbers mapped) is
   filled the same way and the note and announcement say to add the house number.
3. **`AddressInput.Country`** (optional, first): a native `<select>` of countries named with `Intl.DisplayNames` in the
   provider's locale. Its value is the search country and the postal code format; a pick in another country sets it.
   Without it, the search country is the Root's `country` (provider default) and another country is only named.
4. **Core types**: optional `precision?: 'address' | 'street' | 'place'` on `AddressSuggestion`/`AddressResult` (no
   house number = not `address`), optional `country?` in `GeocoderSearchOptions` (rank that country first, list all).
   The three geocoders fill them where their data allows.

### Accessibility contract (draft)

Keyboard and announcements: spec §7, Line1's rows (with a geocoder) are AddressSearch's (`address-search.a11y.md`) plus the
approved Enter deviation; Country is a native select (browser keys). Tab order: Country, Line1, its Search button,
Line2, PostalCode, City.

- Roles / ARIA: Line1 = combobox + listbox (ARIA 1.2) with a geocoder; the privacy notice sits above Line1 and describes it (read before typing, never under the popup), then its help text and the fill note in `aria-describedby`; boxes keep
  their `autocomplete` tokens (`address-line1`, `postal-code`, `address-level2`), Country `country`.
- Focus: stays in Line1 after a pick (caret at the end); never moved on result, error or offline.
- Announcements: AddressSearch's (searching, result count, no results, error, offline), then `pickedFilled` on a pick.
- WCAG: 1.3.1, 1.3.5, 2.1.1, 2.4.3, 3.3.2, 3.3.7, 4.1.2, 4.1.3.

### i18n strings

The spec's 11 `addressInput.*` keys (§4) in all 5 locales; reused: `addressSearch.submit`, `privacy`, `tooShort`,
`searching`, `resultCount`, `pickedFilled`. Country names come from `Intl.DisplayNames`, not the catalog.

## Tasks

- [x] T1 component-engineer: core types (precision, country option) + the three geocoders fill them + tests (`packages/core/src/map/types.ts`, `packages/map/src/{kvirn,nominatim,google-places}.ts` and their tests)
- [x] T2 component-engineer: move the lookup to `packages/react/src/address-lookup/` (+ CSS to theme.css); map's AddressSearch on it; AddressSearch's 42 tests green unchanged
- [x] T3 component-engineer (first build, separate Lookup; superseded by T3b): `AddressInput.Lookup` + `AddressInput.Country` + the fill rules, tests per contract row, i18n (5 locales), `address-input.a11y.md`, `.md`, stories (every state, RTL, forced colours, Keyboard)
- [x] T3b component-engineer: rebuild as Line1 combobox (Design 2); remove `AddressInput.Lookup` and its strings that no longer apply; tests, a11y.md, md, stories follow
- [ ] T4: the `keyboard` skill records the Enter deviation for both lookups (done, lead); docs site AddressInput page (Keyboard section, docs-writer after T3)
- [x] T7 component-engineer: live geo.kvirn.com examples (docs site + Storybook)
- [x] T8 component-engineer: Country select hydration (AddressInput + PhoneInput)
- [x] T9a component-engineer: core `city`/`postalCode` options and `structured?`; kvirnGeocoder sends them and calls /structured; tests
- [x] T9b component-engineer: AddressInput narrows by PostalCode/City and runs the structured lookup after a street pick; tests, a11y.md, stories
- [ ] T5 lead: gates (check → test → i18n → theme), Storybook through `tooling/storybook-run`
- [ ] T6 accessibility-reviewer: this change, together with the map work (aadf715f) and the every-theme helper (f045b190)

T1 and T2 run in parallel (no shared file). T3 after both. T4 with T3.

## Decisions

- Placement: in AddressInput, with the lookup moved to react (maintainer, 2026-10-22).
- ~~Model (b), a separate Lookup~~ (maintainer, 2026-10-22), **revised the same day by the maintainer to model (a)**: the
  street field is the autocomplete. The lookup is a helper, not the deciding factor; streets without mapped numbers are
  common, so the resident completes the street in the same field.
- **Accessibility trade-off approved** (maintainer, 2026-10-22): Line1 keeps `autocomplete="address-line1"` while it is a
  combobox, so browser autofill and 1.3.5 stay; a browser may show its own autofill list beside ours.
- **APG deviation approved** (maintainer, 2026-10-22): in Line1 with a geocoder, Enter with no active option searches and never
  submits the form, as AddressSearch (approved 2026-10-19). `keyboard` skill updated in the same PR.
- Core types `precision` and `country` option approved (maintainer, 2026-10-22).
- T1: Kvirn passes the service's required `precision` (`address`|`street`) through; Nominatim `addresstype` and `address.house_number`; Google prediction `types` (kept through `resolve`). `country` re-sorts stably for Kvirn and Nominatim (no bias parameter used) and is sent as `regionCode` to Google.
- No controllable country on the Root: country comes from the provider like language; an optional `AddressInput.Country`
  part chooses the country to search in (maintainer, 2026-10-22).
- Overwrite on pick without a confirm step (spec §3); revisit if the usability research says otherwise.
- Spec D6 (lead, 2026-10-22): without `AddressInput.Country` the lookup offers only addresses in the Root's country, since
  the form can't record another one (a foreign postal code would be reshaped by the Root's mask). With the part, every
  country is listed, the selected one first, and a pick in another country switches the select. The spec's `otherCountry`
  note is then unused without the part; T3 drops it if nothing needs it.

- T2 (2026-10-22): the lookup is `useAddressLookup` (+ engine/field hooks and types) in `packages/react/src/address-lookup/`,
  exported from `@kvirn-ui/react/internal` only; `useAddressSearch` in map is a thin alias (signature unchanged). Classes
  renamed `kv-address-search-{submit,status,notice}` → `kv-address-lookup-*` (rules moved to theme.css); AddressSearch's
  Submit, Status and Notice parts stay in map (they read its context). Messages stay `addressSearch.*`.

- T3 (2026-10-22): `Lookup` is one part (no sub-parts, as spec §5): it owns a `Field` with the Autocomplete parts and renders Status and Notice inline, so react needs no exported Status/Notice. The engine is created in the Lookup, not the Root; the Root holds only the geocoder, `onLookupResult`, the country state and the box registry (`use-address-fill.ts`). `useAddressLookup` stays internal: AddressInput's API doesn't need it.
- T3: the shared engine gained `country`, `limitToCountry` (D6 without Country: drops results whose `address.country` differs, keeps ones with no address) and `describePick(result, messages)` returning `{ announcement }` or `{ rejected }`; `rejected` is a new state `'rejected'` that keeps the list open (a place with no postal address) and says `addressInput.noAddressDetails`. AddressSearch passes none of them, so its behaviour and 42 tests are unchanged.
- T3: the Lookup's strings reach the engine as `addressSearch` overrides built from `addressInput.*` (label, help with `lookupScope` appended, noResults, error, offline); `submit`, `privacy`, `tooShort`, `searching`, `resultCount` and `pickedFilled` are the reused keys. The spec's 13 `addressInput.*` keys (the plan says 11) are all in the catalog; `otherCountry` isn't needed and isn't added.
- T3: the fill writes the boxes in a layout effect after the Country switch, so the postal code's mask is the new country's. It sets values with the prototype setter and dispatches `input` (`change` for the select), as a user's edit reaches a controlled `value`, a form library and the DOM value alike. The select is controlled by the Root's country state unless `value` is given; `defaultValue` seeds it.
- T3: the missing-part sentences refine the spec: "Add the postal code/town" is said only when the box is empty after the fill (a typed value stays and is not called missing). `precision: 'street'` adds `missingHouseNumber`; a `'place'` that has an address just fills what it has.
- T3: `AddressInput.Country` options reuse `countryOptions`' sort through a new `countryNameOptions` (names only, no calling code) and `countryName` in `phone-input/country-options.ts`. The Root's `onLookupResult` is called on picks only (not on Clear), with the whole `AddressResult`.
- T3: `getInputProps('country')` was added to `useAddressInput` (token `country`, class `kv-address-input-country`) so the Root's `autoComplete` prefix and `off` apply to the select.

- Spec revision (lead, 2026-10-22): privacy notice above Line1 as its description; the fill note joins Line1's
  `aria-describedby`; Line1 gets the result's `address.line1`, not its label; neither autofill nor our fill starts a search.

- T3b (2026-10-22): `AddressInput.Lookup`, `AddressInputLookupProps/Messages` and `addressInput.lookupLabel` are removed. `AddressInput.Line1` with a `geocoder` renders `AddressInputLine1Lookup` (`address-input-line1-lookup.tsx`): the combobox in the consumer's Field, the privacy notice as a `Field.Prose` above it, a Clear and a Search button (on request) in an Autocomplete control, the lookup help and the fill note as help texts under it (so the description is notice, help, note, then the consumer's help and error), and the popup. Without a geocoder Line1 is the unchanged `TextInput`. Line1 gained `messages`, `minLength`, `debounce`, `timeoutMilliseconds`.
- T3b: autofill and the form fill are told from typing by the `input` event's missing typing `inputType` (as the mask does): the engine's new `markProgrammatic(value)` makes `handleValueChange` set the text and search nothing. The engine also gained `initialText` and `syncText` (a controlled `value` changed from outside). A rejected pick (a place) restores the text typed before the pick, since a selection puts the label in the box.
- T3b: the fill always writes Line 1 (even to empty), because a selection leaves the label there; when the street equals what is already in the box, the write resets React's value tracker so the consumer still hears the change (`writeInputValue(..., force)`). Clear in Line 1 empties Line 1 only and tells the consumer through the same event.
- T3b: strings reworded per spec §4 in 5 locales (fallbacks say "keep typing"; `lookupScope` is "Suggests addresses in {country}."; `filledNote` "Check the address."; `missingHouseNumber` "Type your house number after the street name."). The dev warning `address-input-lookup-without-geocoder` is removed; the Country warnings stay.

- **Hard rule 7 extended** (maintainer, 2026-10-22): the docs site's and Storybook's address examples look up at
  geo.kvirn.com, only once a visitor types in a lookup (AGENTS.md, regulations skill, docs/compliance.md, docs CSP comment
  and privacy page). Tests keep the fake geocoder; live stories are excluded from test runs.
- Bug found on the docs site: `Intl.DisplayNames` names differ between the server's and the browser's ICU, so the Country
  selects (AddressInput and PhoneInput) failed hydration. Fixed in one shared place, with a hydration test each.

- **Spec features approved** (maintainer, 2026-10-22), from https://geo.kvirn.com/v1/openapi.json:
  (1) narrow by the boxes: optional `city` / `postalCode` in `GeocoderSearchOptions`; AddressInput passes PostalCode's
  and City's values, `kvirnGeocoder` sends `city` / `postcode` (the service narrows and ranks unrecorded ones below);
  (2) structured lookup: optional `GeocoderProvider.structured?(parts, options) → AddressResult | null`;
  `kvirnGeocoder` calls `/v1/geocode/structured` (street, number, postcode, city, country, lang); after a `street` pick,
  a house number typed after the street is looked up, found → postal code, city and position filled, not found → the
  typed text stays and nothing is announced as an error. Typing uses `/autocomplete`, Enter `/search` (as the spec says).

- T9a (2026-10-22): `structured` returns null when the service answers 200 with no results (the spec has no 404) and
  throws on any non-ok status; the service requires `country` (from the parts, else the geocoder's first `countries`,
  else null without a request); precision passes through, so AddressInput fills only an `address` result as found; city
  and postcode are trimmed, sent only when set, and part of the search cache key; `structured` isn't cached.

- Lead, from the review (2026-10-22): `expectNoA11yViolationsInEveryTheme` throws on an empty `themes` list (it passed
  without a check). Scope note: three Swedish labels ("E-postadress") in text-input.md and text-input.test.tsx became
  "Email address", because this change's new Swedish catalog strings made the English-only check see them; no
  behaviour changed. Stray `.d.ts` in src: `tooling/clean-src-dts` runs before `vp pack` in core, i18n, icons, react.

## Risks & open questions

- Follow-ups (review APPROVE, non-blocking, 2026-10-22): announcement tests duplicated by the read-aloud tests
  (`address-input.test.tsx` :1394/:1502, :1164/:1480, :983/:1515, :1070/:1526) should merge (rule 13); a rare race
  can still give two messages if the suggest count is spoken before the house-number answer arrives.

- Follow-up (review, non-blocking): with two or more base maps without a label, the Map switch shows several radios
  named "Map"; a dev warning for duplicate or missing labels belongs to the map work (plan 0147).
- Not run (maintainer asked to stop re-testing): full `vp run test` and the four display-mode sweeps for `address-input`
  and `map`; CI runs them. Manual AT checks (autofill list beside ours, dictation vs `inputType`, description length)
  are pending in the AT matrix.

- The move must not change AddressSearch's DOM or announcements: its tests and stories are the proof.
- Does each geocoder's result label include the country? T1 reports it; the note names the country either way.
- `.kv-address-input > .kv-field` margin fix (theme.css, uncommitted) ships with this change.

## Testing strategy

Pick and fill rules in `address-input.test.tsx` with a fake geocoder (as `address-search.test.tsx:28-30`). No network.

- T8 (2026-10-22): the hydration tests now also select the server-named option after hydrating (`FK`), proving it stays selectable.
- T9b (2026-10-22): narrowing is read at search time from the boxes (`narrowing` on the internal engine, `fill.valueOf`); the public `useAddressLookup` options are unchanged. The structured lookup lives in `AddressInputLine1Lookup`: it follows a `street` pick, cancels on each keystroke, uses Line 1's `debounce`/`timeoutMilliseconds` defaults, accepts a number token of digits plus an optional letter, and fills with `line1` set to the typed text. It announces `filledNote` (+ sentences) through the Announcer and does not call `onLookupResult` (that is the pick's result). The normal suggest search still runs on the typed number.
- Review fixes, 2026-10-22: (1) the structured fill says one message naming what was filled (new keys `filledPostalCodeAndCity`, `filledPostalCode`, `filledCity` in all 5 locales); the engine's `announceInstead` silences the search announcements of the same text, so a `suggest: true` geocoder gives exactly one message. (2) Read aloud table in the contract, nine rows with named tests. (3) Generic Autocomplete keyboard rows cite `autocomplete.test.tsx`; the two duplicate tests in address-input.test.tsx are deleted and the missing rows added. (4) 3.3.7 is the consumer's. (5) Prose says an edit after a pick is silent on request and says only the new count as you type. (6) `fillBlanks` writes only boxes that are empty or still hold what a pick left. (7) `LookupOffline` fakes `onLine` in play with try/finally. (8) `LookupKeyboard` points to the Keyboard table. (9) `LookupCompact` asserts Search and Clear at least 24px. (10) AT row and a test name corrected. (11) The attribution renders in its own paragraph after the notice, outside Line 1's description.
