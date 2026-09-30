# ADR-0003: Framework-agnostic core, React-only adapter

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** architecture, api

## Context

TanStack libraries separate a framework-agnostic core from thin adapters. We only ship React, but we still want:

- logic that can be unit-tested without a DOM
- SSR safety
- a predictable subscription model
- the option to add another adapter later

## Options considered

- **A: Core + React adapter.** Logic lives in pure TypeScript, and React adds hooks and components on top.
- **B: React-only.** Logic lives in hooks, as in Headless UI and Radix.

State storage, for option A:

- **Hand-rolled store.** Zero dependencies, but we own and maintain it.
- **`@tanstack/store`.** A proven, framework-agnostic store from the ecosystem we're modelled on. It has no dependencies, is side-effect-free and MIT-licensed, but it's pre-1.0 (0.11.x at the time of writing).

## Decision

- **Option A.** `@kvirn-ui/core` holds the state, transitions and interaction logic. It must not import React or touch `window` or `document` at module scope, and all DOM access goes through an injected `Env`.
- **State uses `@tanstack/store`.** This is the one sanctioned runtime dependency, and it's allowed in `core` only.
  - Each component exposes a store plus typed actions (`open()`, `close()`, `select(option)`). Consumers never call `setState` directly.
  - `@tanstack/store` is only imported inside `core/src/store/`. Components depend on our wrapper (`createComponentStore`), so the library can be swapped without API changes.
  - The version is pinned exactly in the pnpm catalog. Upgrades are deliberate and go through the full gates.
- **The React adapter binds with React's own `useSyncExternalStore`,** through an internal `useStoreSelector(store, selector)`. It does not depend on `@tanstack/react-store`, so `react` has no dependencies besides React.
- **Only `@kvirn-ui/react` is shipped and supported.** Other adapters are a non-goal (see `docs/vision.md`).

## Consequences

- **Positive:**
  - Machines are testable in Node.
  - Consumers can subscribe to fine-grained state with selectors, so they avoid unnecessary re-renders.
  - The approach fits the TanStack philosophy.
  - There's a clear boundary for a future adapter.
- **Negative:**
  - There's an extra layer between React and the logic.
  - We take on a pre-1.0 dependency.
  - Effects and refs need bridging in the adapter.
- **Follow-ups:**
  - ✓ Updated the no-dependency rule in AGENTS.md and the principles to name this exception.
  - Add a bundle budget for `core` that includes the store.
