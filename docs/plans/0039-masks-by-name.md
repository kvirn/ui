# Plan 0039: Masks by name, optional masks, and a pattern

- **Status:** In progress
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M2
- **Related:** [0014](0014-input-masks-and-one-time-code.md), [0032](0032-date-mask-and-masked-stories.md), [0033](0033-text-input-and-number-input.md), `forms`, `api-conventions` skills

## Goal

A team writes `<TextInput mask="personal-identity-number" />` and gets the Swedish, Finnish or Norwegian mask the provider's locale implies. Nobody imports `masks` or passes a country for the common case. Custom masks stay possible, and a NumberInput's masking is optional and documented.

## Non-goals

- No new masks. The preset list in `core/src/mask/masks.ts` stays.
- `masks.*` and `createMask` stay public. They are the typed, explicit form and the form `core` users need.
- DateInput's three boxes stay unmasked (plan 0040 handles their focus behaviour).

## Background

Today `mask` takes a built `Mask` object (`text-input.tsx:45`). `country` is a required option on `personalIdentityNumber`, `postalCode` and `organisationNumber`, and the provider carries only `locale` (no country). `useMaskedInput` already calls `mask.withLocale(locale)` (`use-mask.ts:99`), so the locale reaches the mask. NumberInput builds `masks.number()` unconditionally (`use-number-input.ts:104-113`) and has no `mask` prop. The native `pattern` attribute exists on every `<input>`, so a `pattern` prop would clash.

## Design

### API sketch

```tsx
<TextInput mask="personal-identity-number" />            // country from the provider
<TextInput mask="postal-code" />
<TextInput mask={{ preset: 'postal-code', country: 'FI' }} />   // per-instance override
<TextInput mask={{ pattern: '999 99' }} />               // custom pattern (PatternMaskOptions allowed)
<TextInput mask={/^[A-Z]{0,2}\d{0,6}$/} />               // custom regexp
<TextInput mask={masks.postalCode({ country: 'SE' })} /> // still works
<NumberInput decimals={2} />                              // number mask, as today
<NumberInput mask={false} />                              // plain numeric input, no filtering
```

`mask` is `Mask | MaskName | MaskPresetOptions | MaskPatternOptions | RegExp`. No new `pattern` prop, so the native attribute stays free.

**Names (kebab-case, one per preset):** `digits`, `letters`, `letters-and-digits`, `personal-identity-number`, `organisation-number`, `postal-code`, `date`, `iban`, `email`, `telephone`. `ssi` is a documented short alias for `personal-identity-number` (the maintainer's wording). `number` is not a name: NumberInput owns it.

**Country resolution** (new core helper `maskCountryFromLocale(locale)`, next to `date-order.ts`): the region of the tag first (`sv-FI` → `FI`), then the language (`sv` → `SE`, `fi` → `FI`, `nb`, `nn`, `no`, `se` → `NO`), else a dev warning and no country mask (the preset falls back to `digits`). The provider gets an optional `country` prop that wins over the derivation. Reading it: `useLocale()` grows `country`.

### Accessibility contract (draft)

No key or ARIA change: the mask handlers and attributes are the ones that exist. The `text-input-mask-without-description` dev warning keeps working for named masks (resolve before reading `mask.attributes`).

### i18n strings

None.

## Tasks

- [x] core: `MaskName`, `resolveMask(definition, {locale, country})`, `maskCountryFromLocale` + tests (incl. `sv-FI`, bare tags, unknown locale)
- [x] react: `useMaskedInput` accepts the union and resolves it in its `useMemo`; `TextInput` mask prop type and the warning code read the resolved mask
- [x] react: KvirnProvider `country` prop, `useLocale().country`
- [x] NumberInput `mask` prop (`false` turns the filtering off, a `Mask` or name replaces `masks.number`), documented, with the `unmaskedValue` meaning stated for each case
- [x] Docs: `text-input.md`, `number-input.md` (a "Masks are optional" section), `kvirn-provider.md`, `forms/SKILL.md`, `forms/references/masks.md`
- [x] Stories: replace `masks.*({country})` calls in `mask.fixture.tsx` and `text-input.fixture.tsx` with names, keep one story for the explicit form; a NumberInput story without a mask
- [x] Changeset (minor: additive)

## Decisions

- **One `mask` prop with a union**, not a second `pattern` prop, because of the native attribute.
- **Country from locale, overridable on the provider and per instance.** No hidden default: an unresolvable country warns.
- **NumberInput `mask={false}` is "masks optional"** (maintainer approved). The number mask stays the default, since a NumberInput that takes letters would be a TextInput. With `false` the input keeps `type="text"` and the keypad (`inputMode` from `decimals` and `allowNegative`), reports `{ reason, event }` only (no `unmaskedValue`, no `rejected`) and announces nothing. A name, `{ preset }`, `{ pattern }`, `RegExp` or `Mask` replaces the number mask and its `unmaskedValue`. `useNumberInput().mask` becomes `Mask | undefined`.
- **`ssi` alias** of `personal-identity-number` (maintainer approved).
- **`resolveMask` is pure and returns `{ mask, missingCountryFor }`.** `core` can't warn, so the hook reads `missingCountryFor` and calls `warnOnce('mask-country-unresolved:<name>:<locale>')`. The fallback is `digits`.
- **An unknown name warns and runs no mask** (review fix). `unknownMaskName(input)` in core (pure) names a string or `{ preset }` that isn't in `maskNames`; the hook warns once (`mask-unknown-name:<name>`) and skips `resolveMask`, so nothing is guessed. `NumberInput` with its own `mask` (not `false`) warns `number-input-mask-without-description` in a Field with no hint (3.3.2), as a masked TextInput does. `maskCountryFromLocale` stops at the first single-character subtag (`x-`, `u-`).
- **The hook resolves the mask, and `TextInput` reads the resolved one** (`useMaskedInput` returns `mask`; `useMask` still returns only `inputProps`, `format` and `unmask`). The resolve memo depends on the `mask` value, so an inline object re-resolves each render: cheap and stateless, and not worth a stability key.
- **A nested provider inherits the parent's `country` prop.** It doesn't re-derive from its own `locale`. Set `country` again where a section changes country.
- **Stories:** the mask and TextInput examples are Swedish whatever the toolbar's language (hints show `123 45`), so their decorators set `country="SE"` on a provider; the FI and NO identifier fields use `{ preset, country }`. One story (`ExplicitMask`) keeps `masks.postalCode({ country })`.
- **Unknown region falls through to the language** (`sv-GB` is `SE`), as the plan's "region first, then language" reads.

## Risks & open questions

- `sv-FI` and `se` (Northern Sami, mostly NO) are the ambiguous tags. The provider `country` prop is the escape hatch.
- Type-level: `MaskName` must autocomplete while still accepting objects.

## Testing strategy

Unit tests in core for resolution. Component tests prove a named mask equals the explicit one under `sv`, `fi` and `nb` providers. No e2e change: keys are unchanged.

## Rollout

Additive. No migration.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
