---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add `PhoneInput` and `usePhoneInput` for a phone number. It is a native `<input type="tel">` with `inputMode="tel"`, `spellCheck={false}`, `dir="ltr"` and `autoComplete="tel"` set once (each is overridable by a prop of yours), with no length limit and no `pattern`. It never formats: the value is the text the user typed, pasted or autofilled, and `onValueChange(value, details)` reports it as shown. By default it has no mask, so a correctly typed number is never refused; `mask="telephone"` or your own mask is an explicit choice. The classes are `kv-input kv-input--numeric kv-phone-input`, and `@kvirn-ui/theme` makes `kv-phone-input` 20 characters wide (a `kv-input--width-*` class of yours wins). It has no strings of its own, and warns in development for no accessible name (`phone-input-without-name`, `phone-input-in-field-without-label`), an `id` in a Field (`phone-input-id-in-field`) and your own mask in a Field with no help text (`phone-input-mask-without-description`).

New exports: `PhoneInput`, `usePhoneInput`, and the types `PhoneInputProps`, `PhoneInputPartProps`, `UsePhoneInputOptions` and `UsePhoneInputResult`.
