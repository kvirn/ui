---
'@kvirn-ui/react': minor
'@kvirn-ui/core': minor
'@kvirn-ui/theme': patch
---

`PhoneInput` gains an optional calling-code select. `PhoneInput` is now a namespace: `PhoneInput.Root` (a `div` with `country`, `defaultCountry` and `onCountryChange`; the country is its prop, then `KvirnProvider`'s `country`, then the locale's), `PhoneInput.Country` (a native `<select>` of calling codes, `autoComplete="tel-country-code"`, no text of its own) and `PhoneInput.Number` (the previous `PhoneInput`; `tel-national` next to a Country, `tel` otherwise). The number is never prefixed or rewritten, and `onValueChange` details carry `country` and `callingCode`. New exports: `PhoneInputRoot`, `PhoneInputCountry`, `PhoneInputNumber`, `usePhoneInputRoot` and their types; `PhoneInputProps` is now `PhoneInputNumberProps`. `@kvirn-ui/core` exports `callingCodeFor` and `callingCodeCountries`. `@kvirn-ui/theme` adds `kv-phone-input-group` and `kv-phone-input-country`.
