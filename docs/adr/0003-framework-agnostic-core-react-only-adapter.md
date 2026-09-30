# ADR-0003: Framework-agnostic core, React-only adapter

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** architecture, api, i18n

## Context

TanStack libraries separate a framework-agnostic core from thin adapters. We only ship React, but we still want:

- logic that can be unit-tested without a DOM
- SSR safety
- a predictable subscription model
- the option to add another adapter later

Components also need their built-in strings. English is the fallback locale, so components can't be left without strings when no provider is present. Bundling all six catalogs, though, would cost every adopter bytes for languages they don't serve.

## Options considered

- **A: Core + React adapter.** Logic lives in pure TypeScript, and React adds hooks and components on top.
- **B: React-only.** Logic lives in hooks, as in Headless UI and Radix.

State storage, for option A:

- **Hand-rolled store.** Zero dependencies, but we own and maintain it.
- **`@tanstack/store`.** A proven, framework-agnostic store from the ecosystem we're modelled on. It has no dependencies, is side-effect-free and MIT-licensed, but it's pre-1.0 (0.11.x at the time of writing).

Message catalogs, for `@kvirn-ui/react`:

- **Explicit import, `en` built in.** `import { sv } from '@kvirn-ui/i18n/sv'` → `<KvirnProvider messages={sv}>`. `react` depends at runtime on `@kvirn-ui/i18n/en` only.
- **Resolve by locale string.** `locale="sv"` is enough, but all catalogs are bundled.
- **Types only, and the consumer always passes a catalog.** Pure, but components render nothing sensible without a provider.

## Decision

- **Option A.** `@kvirn-ui/core` holds the state, transitions and interaction logic. It must not import React or touch `window` or `document` at module scope, and all DOM access goes through an injected `Env`.
- **State uses `@tanstack/store`.** This is the one sanctioned runtime dependency, and it's allowed in `core` only.
  - Each component exposes a store plus typed actions (`open()`, `close()`, `select(option)`). Consumers never call `setState` directly.
  - `@tanstack/store` is only imported inside `core/src/store/`. Components depend on our wrapper (`createComponentStore`), so the library can be swapped without API changes.
  - The version is pinned exactly in the pnpm catalog. Upgrades are deliberate and go through the full gates.
- **The React adapter binds with React's own `useSyncExternalStore`,** through an internal `useStoreSelector(store, selector)`. It does not depend on `@tanstack/react-store`.
- **`react`'s dependencies are React (peer), `core`, and `i18n` (types plus the `en` catalog).**
  - Consumers import any other locale explicitly and pass it as `messages`, so only the languages they use are bundled.
  - `i18n` is an internal workspace package, not a new third-party dependency.
- **Only `@kvirn-ui/react` is shipped and supported.** Other adapters are a non-goal (see `docs/vision.md`).

## Accessibility impact

Components never render empty names or announcements when no provider is present, because `en` is always available.

## Consequences

- **Positive:**
  - Machines are testable in Node.
  - Consumers can subscribe to fine-grained state with selectors, so they avoid unnecessary re-renders.
  - The approach fits the TanStack philosophy.
  - There's a clear boundary for a future adapter.
  - Catalogs are tree-shakable, and components work without a provider.
- **Negative:**
  - There's an extra layer between React and the logic.
  - We take on a pre-1.0 dependency.
  - Effects and refs need bridging in the adapter.
  - `en` is always in the bundle (small).
- **Follow-ups:**
  - ✓ Updated the no-dependency rule in AGENTS.md and the principles to name this exception.
  - ✓ Updated the dependency line in `docs/architecture.md` for the `en` catalog.
  - ✓ The import and globals boundaries are enforced by lint (ADR-0002).
  - Add a bundle budget for `core` that includes the store.
