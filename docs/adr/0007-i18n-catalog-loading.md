# ADR-0007: Explicit catalog imports, English built in

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** i18n, architecture

## Context

`architecture.md` says `react` depends on `i18n` for types only, but also that `en` is the fallback locale. Components can't fall back to strings they don't have. Bundling all six catalogs costs every adopter bytes for languages they don't serve.

## Options considered

- **A: Explicit import, `en` built in.** `import { sv } from '@kvirn-ui/i18n/sv'` → `<KvirnProvider messages={sv}>`. `react` depends at runtime on `@kvirn-ui/i18n/en` only.
- **B: Resolve by locale string.** `locale="sv"` is enough, but all catalogs are bundled.
- **C: Types only, and the consumer always passes a catalog.** Pure, but components render nothing sensible without a provider.

## Decision

We will use Option A. The dependency rule becomes: `react → core, i18n (types + en catalog)`. This is an internal workspace package, not a new third-party dependency.

## Accessibility impact

Components never render empty names or announcements when no provider is present.

## Consequences

- Positive: tree-shakable, and works without a provider.
- Negative: `en` is always in the bundle (small).
- Follow-ups: ✓ Updated the dependency line in `docs/architecture.md`.
