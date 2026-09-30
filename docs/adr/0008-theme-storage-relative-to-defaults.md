# ADR-0008: Theme storage is relative to the configured defaults

- **Status:** Proposed
- **Date:** 2026-09-30
- **Deciders:** Maintainer (proposed by component-engineer during Plan 0002)
- **Tags:** theming, compliance, api
- **Amends:** ADR-0006 (its storage rule "only non-`system` values are written")

## Context

ADR-0006 and Plan 0002 say: "Only non-`system` values are written, and the key is removed when both are `system`." The approved API also has `theme={{ defaultColorScheme, defaultContrast }}`, so an app can default to, for example, `dark`.

The two rules conflict when a default isn't `system`. With `defaultColorScheme: 'dark'`, a user who explicitly chooses "follow the system" gets nothing stored. On the next visit the default applies again and they get `dark`, not the OS setting they chose. The storage rule also stores a non-`system` default the user never chose, for example `contrast: 'more'` from `defaultContrast`, as soon as they change the other axis.

## Decision drivers

- A user's explicit choice must survive a reload (ADR-0006)
- Store nothing the user didn't ask for (GDPR/ePrivacy, ADR-0006)
- Keep the plan's behaviour unchanged for the default configuration (`system` / `system`)
- The blocking script and the store must resolve identically (ADR-0006)

## Options considered

### Option A: Store only the axes that differ from the configured default

- ✅ With `system` defaults it is exactly the plan's rule: only non-`system` values are written, and choosing `system` on both axes removes the key
- ✅ An explicit `system` is stored when the default isn't `system`, so it survives a reload
- ✅ An untouched default is never written
- ❌ If an app later changes its default, users whose choice equalled the old default follow the new one

### Option B: Keep the plan's rule literally

- ✅ No deviation
- ❌ "Follow the system" is lost on reload whenever the default isn't `system`

### Option C: Store every explicit selection, including `system`

- ✅ Choices survive default changes
- ❌ Choosing `system` with `system` defaults would write a value, which contradicts "selecting `system` removes the key" and stores something with no effect

## Decision

We will use Option A, because it keeps the plan's behaviour for the default configuration and makes every explicit choice survive a reload, while never storing a value equal to the default. `KvirnThemeScript` receives the same defaults as props and applies the same rule. A browser test runs both for every preference × system × defaults combination.

## Accessibility impact

Positive. A user who chooses to follow their OS contrast or colour setting keeps that choice (1.4.3, 1.4.6). No change to focus or announcements.

## Consequences

- Positive: explicit choices persist under any defaults. Nothing is stored for untouched defaults.
- Negative / trade-offs:
  - A choice equal to the current default isn't stored. If the app later changes its default, those users follow the new default, even though they had explicitly chosen the old value.
  - The stored value depends on the defaults, so `KvirnThemeScript` must receive the same defaults as the provider (documented).
- Follow-ups: none. This ADR amends ADR-0006's storage rule; ADR-0006 itself is unchanged.

## Validation

`packages/core/src/theme/theme-store.test.ts › keeps an explicit system choice when the configured default is not system (ADR-0008)`, and `packages/react/src/provider/kvirn-theme-script.test.tsx` (script ↔ store across three default sets).

## References

- ADR-0006, Plan 0002
