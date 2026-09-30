# ADR-0010: Mark the whole `@kvirn-ui/react` entry as `"use client"`

- **Status:** Proposed
- **Date:** 2026-09-30
- **Deciders:** Maintainer (proposed by component-engineer during Plan 0002)
- **Tags:** tooling, architecture

## Context

Plan 0002 makes `KvirnProvider` a client component. `vp pack` (tsdown / Rolldown) bundles `@kvirn-ui/react` into one `dist/index.mjs`, and bundling drops module-level directives. The build logs `MODULE_LEVEL_DIRECTIVE` and the published file has no `"use client"`.

Without the directive, a React Server Component that imports anything from `@kvirn-ui/react`, for example `KvirnThemeScript` in a Next.js `app/layout.tsx`, evaluates the module on the server. The module calls `createContext` at module scope, which fails in the `react-server` environment.

## Decision drivers

- `KvirnThemeScript` must be usable from a server layout (Plan 0002 docs)
- No new dependency or build plugin
- One entry point, as today

## Options considered

### Option A: Add `'use client'` as a JS banner to the react package's pack config, and to `src/index.ts`

- ✅ One line of config. Every export is client code today (hooks and context)
- ✅ The source entry (used inside the monorepo) and `dist` behave the same
- ❌ A future server-only export would need a separate entry

### Option B: Unbundled output (`unbundle: true`) that keeps per-file directives

- ✅ Per-module precision
- ❌ Changes the shared pack preset and output layout for one package

### Option C: A separate server entry (`@kvirn-ui/react/server`) for `KvirnThemeScript`

- ✅ `KvirnThemeScript` stays a server component
- ❌ A new subpath export for one component, and it can't be `"use client"`-free while it shares code with the client entry

## Decision

We will use Option A, because every export is client code and it needs no new entry or plugin. `KvirnThemeScript` becomes a client component that server layouts can still render: it has no state, and its output is in the server HTML.

## Accessibility impact

None.

## Consequences

- Positive: `@kvirn-ui/react` works when imported from React Server Components.
- Negative / trade-offs: Rolldown still logs `MODULE_LEVEL_DIRECTIVE` for the source directives. The build succeeds and the banner restores the directive.
- Follow-ups: revisit if a server-only export is added.

## Validation

`head -1 packages/react/dist/index.mjs` is `'use client'` after `vp run build`. A Next.js sample app check is still to do, together with the ADR-0005 recipes.

## References

- [React: 'use client'](https://react.dev/reference/rsc/use-client), [Rolldown directives](https://rolldown.rs/in-depth/directives)
