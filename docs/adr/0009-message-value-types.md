# ADR-0009: Message value types and resolved message shape

- **Status:** Proposed
- **Date:** 2026-09-30
- **Deciders:** Maintainer (proposed by component-engineer during Plan 0002)
- **Tags:** i18n, api

## Context

Plan 0002 fixes the catalog depth at `namespace.key`, defines `PartialMessages` as `Partial<KvirnMessages[N]>` per namespace, and types function keys as `(values: V, format: MessageFormat) => string`. It leaves three details open:

1. **Text keys with a function value.** ADR-0007 §5 and the plan's own example override a key without parameters with a function: `newTabNotice: () => t('kvirn.link.newTabNotice')`. If text keys are typed `string`, that example is a type error.
2. **What `useMessages` returns for a function key.** The caller has values, but not the provider's `format` helper.
3. **`zero` in `plural`.** `Intl.PluralRules` never returns `zero` for sv, fi, nb, nn, se or en, so a `zero` form would never be used.

## Decision drivers

- The plan's and ADR-0007's examples must type-check as written
- Components shouldn't have to find the locale's formatter themselves
- No ICU runtime, `Intl.*` only (ADR-0007)

## Decision

1. **Text keys are typed `TextMessage = string | (() => string)`.** Shipped catalogs use strings, and `i18n:check` still requires a non-empty string in every locale. An app can pass a parameterless function to route the string through its own i18n system. It is called during render, and an empty result falls through like an empty string.
2. **Resolved messages bind `format`.** `useMessages` returns text keys as `string`, and function keys as `(values) => string`, with the active locale's formatter and `timeZone` already bound. The layers are called in order, and the first non-empty result wins.
3. **`plural` uses `forms.zero` for exactly `0` when it's given,** otherwise the `Intl.PluralRules` category, falling back to `other`.

Also recorded here, as parts of the same message API:

- `core` names its formatter type `MessageFormatter`. `i18n`'s `MessageFormat` has the same shape, and a type test in `react` checks that each extends the other.
- Dev warnings detect production with the literal `process.env.NODE_ENV`, which the consumer's bundler replaces. When `process` doesn't exist and nothing replaced it (for example Vitest browser mode), the ReferenceError is treated as development.

## Accessibility impact

Positive: an empty value from an app's own i18n function falls through instead of producing an empty accessible name (4.1.2).

## Consequences

- Positive: ADR-0007's external-i18n example works unchanged, and components write `linkMessages.newTabNotice` or `searchMessages.resultCount({ count })`.
- Negative / trade-offs: `KvirnMessages` text keys aren't plain `string`, so code reading a catalog directly (not through `useMessages`) must handle the function case.
- Follow-ups: if accepted, add the `TextMessage` rule to `docs/architecture.md#internationalisation`.

## Validation

Type tests in `packages/i18n/src/define-messages.test.ts` and `packages/react/src/provider/provider-types.test.ts`. Unit tests in `packages/core/src/messages/`. Browser tests for function values in `kvirn-provider.test.tsx`.

## References

- ADR-0007, Plan 0002, [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)
