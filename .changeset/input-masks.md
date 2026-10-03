---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
---

Input masks (Plan 0014, Phases 1 and 2). A mask shapes what the user types and keeps the control a native `<input>`: paste, autofill and undo work, nothing is clamped or corrected, and dropped characters are announced.

- `@kvirn-ui/core`: `createMask(definition)` and the pure engine behind it (pattern, regexp, function and locale-aware number definitions; `apply`, `format`, `unmask`, `withLocale`), the presets `masks.digits`, `letters`, `lettersAndDigits`, `number`, `personalIdentityNumber` (SE, FI, NO), `postalCode`, `organisationNumber`, `iban`, `email`, `telephone`, `pattern`, `regexp` and `oneTimeCode`, and the helpers `checks.personalIdentityNumber`, `checks.organisationNumber` and `checks.iban`, which return `{ isValid, reason }`.
- `@kvirn-ui/react`: `Input` takes `mask`, `announceRejections` and `messages`. `useMask({ mask, onValueChange, announceRejections?, messages? })` returns `inputProps` for your own `<input>`, plus `format` and `unmask` for the provider's locale. `InputChangeDetails` gains the optional `unmaskedValue`, `isComplete`, `isWithinRange` and `rejected`, and its `event` can now also be the `CompositionEvent` of a masked input. `masks` and `checks` are re-exported. Rejections go to the shared Announcer, politely, at most once every three seconds per field: the `KvirnProvider` is required for them. Development warnings: a masked Input in a Field without a description (3.3.2), and a mask other than `masks.email()` on `type="email"`.
- `@kvirn-ui/i18n`: `mask.characterNotAllowed` (per allowed kind: digits, letters, letters and digits, other) and `mask.maximumLength` in all six locales. `fi`, `nn` and `se` need translator review (`se` is English until a native speaker provides it).
