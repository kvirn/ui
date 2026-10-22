# AddressSearch

> AddressSearch messages ship in Swedish, Finnish, Norwegian (both written standards) and English. The accessibility contract is [address-search.a11y.md](address-search.a11y.md), and the design is in `docs/design/address-search.md`.

An AddressSearch looks an address up. The visitor types a street, a postal code or a place, searches, and picks an address from the list. You get the address with its position and decide what happens: move a [Map](map.md), or fill the boxes of an address form. It is an Autocomplete over the answers of a geocoder you choose.

**KvirnUI names no service and sends nothing on its own.** Nothing is sent before the visitor types and, unless the geocoder allows search as you type, presses Search. The text goes only to your geocoder: name it in your privacy notice.

**Styling is opt-in.** Import `@kvirn-ui/theme/theme.css` and `@kvirn-ui/theme/map.css`.

- **When to use it:** to find a place by its address on a map, or to fill an address form in one step.
- **When not:** to collect an address the visitor knows by heart (use AddressInput alone: a lookup adds a step and a third party), when the answer must come from your own register (use a Combobox), or for site search.
- **On request, or as you type.** A geocoder searches on request: Enter or the Search button. Only a geocoder that declares `suggest: true` is searched as you type, 400 ms after the last key, and `debounce={false}` turns that off.
- **Enter searches and never submits a form.** The text is a lookup, not an answer. The form's own button sends it.
- **Nothing moves focus.** A pick, a result and a map that moves leave focus in the field.
- **Parts:** `AddressSearch.Root`, `Label`, `Control` (with `Input`, `Clear` and `Submit`), `HelpText`, `Notice` and `Popup` (with `Status`, `List` and `Option`). `AddressSearch` is all of them in the default order. The hook is `useAddressSearch`.

## API

| Prop                  | Default               | Meaning                                                                                                                                                                                                                                                                                  |
| --------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `geocoder`            | required              | A `GeocoderProvider`: `{ name?, attribution?, suggest?, search(query, { signal, locale, intent }), resolve?(suggestion, { signal, locale }) }`. `search` answers `AddressSuggestion[]`: `{ id, label, position?, bounds?, address? }`. Without a `position`, `resolve` adds it on a pick |
| `onResult`            | none                  | `(result: AddressResult \| null)`: the pick with its position, or `null` when the text is cleared. It never moves focus                                                                                                                                                                  |
| `minLength`           | `3`                   | The fewest characters, trimmed, before a search is sent                                                                                                                                                                                                                                  |
| `debounce`            | `400`                 | Milliseconds of no typing before a search as you type. `false`, or a geocoder without `suggest: true`, searches on request                                                                                                                                                               |
| `timeoutMilliseconds` | `10000`               | How long to wait for an answer before it counts as failed                                                                                                                                                                                                                                |
| `label`               | `addressSearch.label` | The visible label's text                                                                                                                                                                                                                                                                 |
| `disabled`, `id`      | `false`               | Disables the field and the Search button; the input's id outside a Field                                                                                                                                                                                                                 |
| `messages`            | provider's catalog    | Per-instance overrides of the `addressSearch` strings                                                                                                                                                                                                                                    |

`AddressResult` is `{ id, label, position: { longitude, latitude }, bounds?, address?: { line1, postalCode, city, country } }`. A result without `address` fills nothing in a form.

With a map, `useMapState().show(result)` centres the map (or fits `bounds`), draws a result pin and says "The map shows the address"; `clearResult()` removes the pin.

```tsx
<search>
  <AddressSearch
    geocoder={geocoder}
    onResult={(result) => (result ? map.show(result) : map.clearResult())}
  />
</search>
```

| State attribute | On   | When                                                                                   |
| --------------- | ---- | -------------------------------------------------------------------------------------- |
| `data-status`   | Root | `idle`, `too-short`, `searching`, `results`, `empty`, `error`, `offline` or `selected` |

Stable classes: `kv-address-search`, `kv-address-lookup-submit`, `kv-address-lookup-status`, `kv-address-lookup-notice`, and the Autocomplete's. There are no variation classes. Your `className` joins the part's.

Messages (`messages`, per instance, or the provider's `addressSearch` catalog): `label`, `helpSuggest`, `helpRequest`, `submit`, `privacy`, `privacyUnnamed`, `tooShort`, `searching`, `resultCount`, `noResults`, `error`, `offline`, `picked` and `pickedFilled` (the text to pass as `picked` when a form is filled in).

## Geocoders

`@kvirn-ui/map/kvirn` exports `kvirnGeocoder({ url, countries?, focus?, bounds?, limit?, name?, attribution? })` for the Kvirn map service. `url` is required, because the library names no service. Pass the address of your deployment or proxy. The service allows search as you type, so the geocoder declares `suggest: true` and the typed text goes to it after each pause in typing: name it in your privacy notice, and pass a readable `name` (for example "the Kvirn map service"), since a screen reader reads the default host name as a web address. It sends the query, the language, the country filter, the limit and, when you set them, `focus` and `bounds`, with no cookies. Keep `minLength` at 2 or more, because the service needs two characters and a shorter query would be announced as "no address found". The credit defaults to "© OpenStreetMap contributors"; `/v1/attribution` on the service gives the exact text per country.

`@kvirn-ui/map/google-places` exports `googlePlaces({ loader?, apiKey?, countries?, bounds?, name?, attribution? })` on Google Places Autocomplete (New). Load the SDK yourself and pass `loader: () => google.maps.importLibrary('places')`, the same contract as the `/google` map adapter, or pass an `apiKey` and the geocoder adds Google's script tag on the first search. Nothing loads before the first search. The geocoder declares `suggest: true`, so the typed text goes to Google as you type: name it in your privacy notice (the default name is "Google"). Google's list has no positions, so a pick calls Place Details once to add the position, the bounds and the address; the keystrokes and the pick share one session token, which is renewed after each pick. Google's terms decide what you may keep: the geocoder caches no answer, and you may store only the place id and a latitude and longitude for at most 30 days. The Notice shows "Powered by Google" (`attribution`); Google prefers its logo where there is no map, which you can render as a child of the Notice. Restrict the key to your site's origin. Outside the EEA, Google's content may be shown only with a Google map. With a billing address in the EEA, it may be shown with another map only as latitude, longitude and place id, and whether a list next to a map counts as "visually associated" with it is a legal question for you. **Not recommended for resident forms until the legal review (O7).**
