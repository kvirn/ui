# ADR-0006: Theme preference store and persistence

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** theming, a11y, compliance

## Context

The default theme has four combinations: light, dark, light + high contrast and dark + high contrast. Users need a theme switcher whose choice persists across visits. Operating systems expose the two dimensions separately (`prefers-color-scheme`, `prefers-contrast`), and `forced-colors` overrides both. The headless packages ship zero CSS, and `core` must not touch the DOM except through `Env`.

## Decision drivers

- Respect OS settings until the user chooses (users set them for a reason)
- No wrong-theme flash, including in SSR and with strict public-sector CSP
- Headless: attributes only, and CSS lives in `@kvirn-ui/theme`
- GDPR/ePrivacy: store nothing the user didn't ask for

## Options considered

### Option A: Two axes, core store, pluggable storage

`colorScheme: 'light' | 'dark' | 'system'` and `contrast: 'standard' | 'more' | 'system'`, resolved against media queries and written as `data-kv-color-scheme` / `data-kv-contrast` on `<html>`.

- ✅ Each axis can follow the OS independently. A switcher can still offer the four combinations
- ✅ Store is testable in Node, and components subscribe via a selector
- ❌ Slightly bigger API than a single enum

### Option B: A single enum of four themes plus `system`

- ✅ Simple
- ❌ Can't follow the OS for contrast while forcing dark, or the reverse

### Option C: Theme in React state only

- ❌ Flash on SSR, re-renders the whole tree, and isn't usable outside React

## Decision

We will use Option A:

- The store lives in `core/src/theme/`, built on `createComponentStore`.
- `KvirnProvider` binds it and writes the resolved attributes to `<html>` through `Env`.
- Storage is pluggable: `'local'` (default, localStorage), `'none'`, or a `{ read, write }` adapter (for example a first-party cookie, for server rendering).
- Storage is written only on an explicit user selection, and choosing `system` removes the key.
- `KvirnThemeScript` sets the attributes before first paint and accepts a CSP `nonce`.
- `forced-colors: active` always wins in `@kvirn-ui/theme`.

## Accessibility impact

Positive: the high-contrast variants (1.4.6) become user-selectable, and OS preferences are honoured by default. A theme change moves no focus and makes no announcement.

## Consequences

- Positive: one source of truth for switchers, blocks and the docs site.
- Negative: an inline script, which needs a nonce under CSP. Writing to `<html>` is a documented global side effect, done by the provider only.
- Follow-ups: `TODO(legal-verify)` that storing an explicitly chosen UI preference is exempt from consent under ePrivacy Art. 5(3). Update `docs/compliance.md` (it says "no cookies"; localStorage is covered by the same article).

## Validation

Unit tests for resolution and storage. Browser tests for all four combinations, OS changes and hydration. `theme:check` on all four token sets.
