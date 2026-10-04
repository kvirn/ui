---
'@kvirn-ui/core': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/react': minor
---

Add `NumberInput` and `useNumberInput` for a quantity or an amount. It is a native text box (`type="text"`, never `type="number"` and never a spin button) with `masks.number()` built in, in the provider's locale: `decimals`, `allowNegative`, `grouping`, `min` and `max`, plus everything `TextInput` takes except `type` and `mask`. `inputMode` follows the mask, and the classes are `kv-input kv-input--numeric`. A letter is left out and announced, `min` and `max` are reported as `details.isWithinRange` and never enforced, and the arrow keys never step the value. It warns in development when `decimals` is above 0 and the Field has no hint (`number-input-decimals-without-hint`), and works inside an `InputGroup.Root` next to an `InputGroup.Addon`. For codes with leading zeros, use a `TextInput` with a mask.

New exports: `NumberInput`, `useNumberInput`, and the types `NumberInputProps`, `NumberInputState`, `NumberInputPartProps`, `UseNumberInputOptions` and `UseNumberInputResult`.

A digit past `decimals` is now refused with a new rejection reason, `decimals` (`MaskRejectionReason`, in `details.rejected`; it was `length`), and announced with a new message, `mask.maximumDecimals`: "No more decimals can be entered here." It is in all six locales and can be overridden per provider or per instance (`messages`). Other masks are unchanged. If your code reads `rejected` and checks for `length` on a number mask, check for `decimals` as well.
