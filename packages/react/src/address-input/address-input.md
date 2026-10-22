# AddressInput

**KvirnUI holds no form state; bring your own form logic.** AddressInput renders what it's given. It keeps no value and validates nothing. It looks an address up only when you give the Root a `geocoder`: `AddressInput.Line1` then suggests addresses.

An AddressInput asks for a postal address in separate boxes: street, line 2, postal code and city, in the Nordic order. Use it for an address the user types or autofill fills in one action. For showing an address the service already knows, use [Address](../address/address.md) (the static `<address>`) in a summary with a change link. For a foreign address of unknown format, use a `Textarea`.

- Six parts: `AddressInput.Root` (a `<div>`, the layout) and `AddressInput.Line1`, `.Line2`, `.PostalCode` and `.City`, plus the optional `.Country` (a native select, first). Each box is a native text `TextInput`, so it goes inside your own `Field.Root` with a `Field.Label`, and has its own help text and error. Each is also exported on its own (`AddressInputRoot`, `AddressInputLine1`, `AddressInputLine2`, `AddressInputPostalCode`, `AddressInputCity`, `AddressInputCountry`), and the hook is `useAddressInput`.
- It goes inside a **plain** `Fieldset.Root` (not `group`) whose `Fieldset.Legend` names the address. An address is four answers: each Field marks itself, and Line 2 shows "(optional)". The Root warns inside a `group` Fieldset, and outside any group.
- **The boxes hold no text.** Every label, help text and error is yours. Only the lookup has strings: `addressInput.*` and the `addressSearch.*` keys it reuses, in all five locales.
- **Autofill fills every box in one action.** The tokens are `address-line1`, `address-line2`, `postal-code` and `address-level2`. The Root's `autoComplete` is `off` for someone else's address, or a prefix such as `section-postal` or `shipping` for a second address on the page. A part's own `autoComplete` wins.
- **The country sets the postal code.** `country` (ISO alpha-2, default the provider's `country`, then the locale's) gives SE `123 45`, FI `00100` and NO `1234` through the `postal-code` mask, a numeric keypad and a box of 6, 6 or 4 characters. Any other country has no mask: the box takes what is typed, asks phone keyboards for capital letters and is ten characters wide. Changing `country` never rewrites what was typed.
- **No auto-advance.** A full postal code never moves focus (3.2.2), and the city is never derived from the postal code (no bundled postal data). Without a `geocoder` the component makes no network call.
- Headless: no CSS. The parts render `kv-address-input`, `kv-address-input-line1`, `-line2`, `-postal-code` and `-city`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## API

| Part                      | Renders                                                                                                       | Props                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AddressInput.Root`       | `<div class="kv-address-input">`                                                                              | `country`, `autoComplete`, `geocoder`, `onLookupResult`, `ref` and every div prop                                                                                                                   |
| `AddressInput.Country`    | `<select class="kv-listbox-native kv-address-input-country">`                                                 | `value`, `defaultValue`, `onChange`, `ref` and every select prop except `children`                                                                                                                  |
| `AddressInput.Line1`      | `<input class="kv-input kv-address-input-line1">`; with a `geocoder`, a combobox in an `Autocomplete` control | `ref` and every `TextInput` prop except `type`, `mask` and `announceRejections`; with a `geocoder` also `messages`, `minLength` (3), `debounce` (400 ms or `false`), `timeoutMilliseconds` (10 000) |
| `AddressInput.Line2`      | the same, `kv-address-input-line2`                                                                            | the same                                                                                                                                                                                            |
| `AddressInput.PostalCode` | `<input class="kv-input kv-address-input-postal-code kv-input--width-*">`                                     | `mask` (`false` or your own, which wins), `ref` and every `TextInput` prop except `type`                                                                                                            |
| `AddressInput.City`       | the same, `kv-address-input-city`                                                                             | the same as Line1                                                                                                                                                                                   |

What the parts do on their own:

- Line1, Line2 and City have `spellCheck={false}` and `autoCorrect="off"`.
- PostalCode has `dir="ltr"`. With a country mask: `inputMode="numeric"`, `kv-input--numeric` and `kv-input--width-6` (SE, FI) or `-4` (NO). Without one: `inputMode="text"`, `autoCapitalize="characters"` and `kv-input--width-10`.
- A part outside a Root still gets its token and attributes, with the provider's or locale's country, and warns.

| Classes for the default theme                               | On                                  | Sets                                                                                                                    |
| ----------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `kv-address-input`                                          | Root                                | The fields stacked, 24px apart (16px with `kv-compact` from 64rem); the postal code and the city share a row from 22rem |
| `kv-address-input-line1`, `-line2`, `-postal-code`, `-city` | the part's input                    | The part the layout finds its Field by                                                                                  |
| `kv-address-input-country`                                  | Country                             | The Country field as wide as its content                                                                                |
| `kv-address-input-lookup-note`                              | the fill note                       | Small text with a check icon under Line 1                                                                               |
| `kv-address-lookup-submit`, `-status`, `-notice`            | Search, status line, privacy notice | Shared with AddressSearch                                                                                               |

## Address lookup

`geocoder` on the Root turns the lookup on: `AddressInput.Line1` becomes a combobox that suggests addresses as the visitor types. Geocoders come from `@kvirn-ui/map` (`kvirnGeocoder`, `nominatim`, `googlePlaces`); AddressInput imports none of them. Without a `geocoder` Line 1 is the plain text box.

```tsx
import { AddressInput, Field, Fieldset } from '@kvirn-ui/react'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'

;<Fieldset.Root>
  <Fieldset.Legend>Your address</Fieldset.Legend>
  <AddressInput.Root geocoder={kvirnGeocoder({ url })}>
    <Field.Root>
      <Field.Label>Country</Field.Label>
      <AddressInput.Country name="country" />
    </Field.Root>
    <Field.Root required>
      <Field.Label>Street address</Field.Label>
      <AddressInput.Line1 name="line1" />
    </Field.Root>
    {/* Line2, PostalCode and City in their Fields, as below */}
  </AddressInput.Root>
</Fieldset.Root>
```

- **The street box stays free text.** The lookup helps, it never decides: the resident can ignore the list and keep typing, and a street whose house numbers aren't mapped is completed in the same box. Line 1 keeps your `Field.Label`, its `name` and `autocomplete="address-line1"`, so browser autofill and a saved address keep working. A browser may show its own autofill list beside ours. Neither autofill nor the fill described below starts a search.
- **A pick fills three boxes.** Line 1 gets the result's street (with its number when it has one), and the postal code and the city are filled, as typing writes them: a controlled `value`, a form library's `input` listener and the DOM value all see it. Line 2 is never touched (the service can't know "c/o" or a flat). A pick replaces what was typed in those three boxes: it is an explicit request to fill. A box the result has no value for keeps a value the visitor typed and is emptied if an earlier pick left its value, so addresses never mix. Focus stays in Line 1 with the caret at the end, so a missing house number is typed straight after the street, and typing on may offer house-level matches.
- **It says what it did.** A note under Line 1 ("Filled in from the address search. Check the address.") and one announcement say the address was filled in and to check it, and add what is missing (the house number of a street, the postal code, the town) and a changed country. The note names no address, so an edit never makes it stale.
- **Search as you type or on request.** With a geocoder that declares `suggest: true` (`kvirnGeocoder`) it searches after `debounce` ms of no typing, from `minLength` characters. Otherwise only Enter or the Search button send a request. Enter in Line 1 with no suggestion active searches and never submits the form.
- **Privacy.** What is typed in Line 1, and the visitor's IP address, reach the geocoder, and nothing is sent below `minLength`. The notice above Line 1 says where it goes and shows the geocoder's attribution; it is read before typing and is first in Line 1's description. Name the geocoder in your service's privacy notice (GDPR).
- **Which country.** Without `AddressInput.Country` the lookup offers only addresses in the Root's country (`country`, else the provider's), since the form can't record another, and the help text names it. Add `AddressInput.Country` when the service takes addresses in more than one country: first in the Root, in its own Field. It lists every country, named in the page's language, the Root's country first, and it sets the country the lookup searches in and the postal code's mask and width. A pick in another country switches it, the mask follows, and the note and announcement say "The country is now Finland."
- **It narrows by the postal code and the city, and looks up a house number.** Once the postal code or the city holds a value (typed, autofilled or from a pick), Line 1's searches send it as `postalCode` / `city`, trimmed and left out when empty; filling those boxes starts no search. After a pick that is a street without a number, typing a house number after the street ("Storgatan 12", "Storgatan 12 B") calls the geocoder's `structured` lookup (after `debounce`, cancelled by the next keystroke) with the street, the number, the postal code, the city and the country. An exact answer fills the postal code and the city, writes only a box that is empty or still holds what the pick left (a value the visitor corrected stays), keeps Line 1 as typed and says one message naming what was filled ("Postal code and town filled in from the address search. Check the address."), in place of the count of the search for the same text; no answer, a street-level answer or an error changes nothing and says nothing. A geocoder without `structured` does nothing.
- **`onLookupResult(result)`** gets the whole `AddressResult` of a pick, for its position or id.
- **Strings** are `addressInput.lookupHelpSuggest`, `lookupHelpRequest`, `lookupScope`, `lookupNoResults`, `lookupError`, `lookupOffline`, `noAddressDetails`, `filledNote`, `filledPostalCodeAndCity`, `filledPostalCode`, `filledCity`, `missingPostalCode`, `missingCity`, `missingHouseNumber` and `countryChanged`, plus `addressSearch.submit`, `privacy`, `privacyUnnamed`, `tooShort`, `searching`, `resultCount` and `pickedFilled`. Override them per instance with Line 1's `messages`, or per provider.

## Component

```tsx
import { AddressInput, Field, Fieldset } from '@kvirn-ui/react'

;<Fieldset.Root invalid={errors.address !== undefined}>
  <Fieldset.Legend>Your address</Fieldset.Legend>
  <AddressInput.Root country="SE">
    <Field.Root controlId="address-line1" required invalid={errors.line1 !== undefined}>
      <Field.Label>Street address</Field.Label>
      <AddressInput.Line1 name="line1" />
      <Field.ErrorMessage>{errors.line1}</Field.ErrorMessage>
    </Field.Root>
    <Field.Root controlId="address-line2">
      <Field.Label>Address line 2</Field.Label>
      <AddressInput.Line2 name="line2" />
      <Field.HelpText>For example c/o and a name</Field.HelpText>
    </Field.Root>
    <Field.Root controlId="address-postal-code" required>
      <Field.Label>Postal code</Field.Label>
      <AddressInput.PostalCode name="postalCode" />
      <Field.HelpText>For example 123 45</Field.HelpText>
    </Field.Root>
    <Field.Root controlId="address-city" required>
      <Field.Label>City</Field.Label>
      <AddressInput.City name="city" />
    </Field.Root>
  </AddressInput.Root>
  <Fieldset.ErrorMessage>{errors.address}</Fieldset.ErrorMessage>
</Fieldset.Root>
```

Your part:

- **Write the labels, the postal code's example in the country's form, and the errors.** A postal code error repeats the format ("Enter a postal code with 5 digits, for example 123 45").
- **Errors per part** in its Field (`invalid` and `Field.ErrorMessage`); `Fieldset.ErrorMessage` only for a whole-address error ("We couldn't find this address"), linked from an `ErrorSummary` to Line1.
- **Keep the order**: street, line 2, postal code, city. c/o goes on line 2, where autofill stores it.
- **A country control**, if the service takes more than one country, is `AddressInput.Country` first in the Root, in its own Field with a `Field.Label` and a `name`. It has `autoComplete="country"`, and the postal code and the lookup follow it.
- **Two addresses** on a page: `autoComplete="section-postal"` (or another `section-*`) on each Root, and `off` for someone else's.
- **Eastern Arabic digits** are refused by the `postal-code` mask. Where those keyboards are expected, set `mask={false}` on `AddressInput.PostalCode`.

## Hook

```tsx
import { Field, Fieldset, TextInput, useAddressInput } from '@kvirn-ui/react'

function Address() {
  const address = useAddressInput({ country: 'SE' })
  return (
    <Fieldset.Root>
      <Fieldset.Legend>Your address</Fieldset.Legend>
      <div {...address.rootProps}>
        <Field.Root>
          <Field.Label>Postal code</Field.Label>
          <TextInput {...address.getInputProps('postalCode')} mask={address.postalCodeMask} />
        </Field.Root>
      </div>
    </Fieldset.Root>
  )
}
```

`useAddressInput({ country, autoComplete })` returns `country` (upper case), `postalCodeMask` (`undefined` for a country without a mask), `rootProps` and `getInputProps(part)` with `'line1' | 'line2' | 'postalCode' | 'city' | 'country'` (the last for the select's token and class).
