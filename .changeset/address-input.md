---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add AddressInput, an address of one text box per line (design spec `docs/design/phone-and-address-inputs.md`). Alpha.

- `@kvirn-ui/react`: `AddressInput` (also `AddressInput.Root`, `.Line1`, `.Line2`, `.PostalCode` and `.City`, each also a named export such as `AddressInputRoot`) and `useAddressInput({ country, autoComplete })` returning `rootProps`, `getInputProps(part)`, `country` and `postalCodeMask`. It goes inside a plain `Fieldset.Root`, each part in the consumer's own `Field.Root` with a `Field.Label`, so help texts and errors are per line. The parts get the autofill tokens `address-line1`, `address-line2`, `postal-code` and `address-level2`; the Root's `autoComplete` is `off` or a prefix such as `section-postal` and a part's own wins. The Root's `country` (default the provider's, then the locale's) gives the postal code the `postal-code` mask for SE, FI and NO, and no mask, `inputMode="text"`, upper case and a 10 character box for any other country. No auto-advance, no lookup, no text and no message keys. Dev warnings for a Root outside a group, a Root in a `group` Fieldset and a part outside a Root.
- `@kvirn-ui/theme`: `kv-address-input`, the fields stacked 24px apart (16px in `kv-compact` from 64rem), with the postal code and the city sharing a row from 22rem, and `kv-address-input-line1`, `-line2`, `-postal-code` and `-city` on the inputs. No new tokens.
