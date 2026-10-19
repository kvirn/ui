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

Stable classes: `kv-address-search`, `kv-address-search-submit`, `kv-address-search-status`, `kv-address-search-notice`, and the Autocomplete's. There are no variation classes. Your `className` joins the part's.

Messages (`messages`, per instance, or the provider's `addressSearch` catalog): `label`, `helpSuggest`, `helpRequest`, `submit`, `privacy`, `privacyUnnamed`, `tooShort`, `searching`, `resultCount`, `noResults`, `error`, `offline`, `picked` and `pickedFilled` (the text to pass as `picked` when a form is filled in).
