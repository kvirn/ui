---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
---

Masks by name, optional masks and a provider country (Plan 0039). Additive: `masks.*` and `createMask` work as before.

- `@kvirn-ui/react`: `mask` on `TextInput` and `useMask` takes a name (`"digits"`, `"letters"`, `"letters-and-digits"`, `"personal-identity-number"` with the alias `"ssi"`, `"organisation-number"`, `"postal-code"`, `"date"`, `"iban"`, `"email"`, `"telephone"`), `{ preset, country? }`, `{ pattern, ...options }`, a `RegExp`, or a `Mask` from `masks`. The country masks read the country from the provider: its new `country` prop, else the region of the locale (`sv-FI` is `FI`), else its language (`sv` is `SE`, `fi` is `FI`, `nb`, `nn`, `no` and `se` are `NO`). With no country a country mask only takes digits and warns once, and a name that isn't a mask name (`mask-unknown-name:<name>`) warns once and runs no mask. A `NumberInput` with its own `mask` in a Field with no hint warns (`number-input-mask-without-description`). `useLocale()` also returns `country`. New types: `MaskInput`, `MaskName`, `MaskPresetOptions`, `MaskPatternOptions` and `MaskCountry`.
- `NumberInput` and `useNumberInput` take `mask`: `false` makes the masking optional (a plain numeric text box that reports no `unmaskedValue`), and another mask or name replaces the number mask. `useNumberInput().mask` is now `Mask | undefined` (`undefined` only for `mask={false}`). `TextInputProps['mask']` widens from `Mask` to `MaskInput`.
- `@kvirn-ui/core`: `resolveMask(input, { locale, country? })`, `maskCountryFromLocale(locale)`, `maskNames`, `unknownMaskName(input)` and the types `MaskInput`, `MaskName`, `MaskPresetOptions`, `MaskPatternOptions`, `ResolveMaskContext` and `ResolvedMask`.
