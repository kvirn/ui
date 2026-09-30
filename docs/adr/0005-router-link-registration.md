# ADR-0005: Router links via provider registration

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** api, architecture

## Context

Link, Breadcrumb, Pagination, NavigationMenu and the header/footer blocks all render links. In Next.js, TanStack Router and React Router, links must go through the framework's `Link` to get client navigation, prefetching and typed routes. The React package must not depend on any router.

## Decision drivers

- A native `<a href>` in the DOM, always (2.1.1, 4.1.2)
- Keep framework features: prefetch, typed `to`/`params`
- Configure once, and override per instance
- No router dependency, and type-safe by inference

## Options considered

### Option A: Register the component in the provider, with a `Register` interface

`<KvirnProvider linkComponent={NextLink}>`, plus `declare module '@kvirn-ui/react' { interface Register { linkComponent: typeof NextLink } }`. `LinkProps` is derived from the registered component's props.

- ✅ Framework features and typed routes kept. One-time setup. TanStack-style
- ❌ Module augmentation is unfamiliar to some teams. Without it, props fall back to `<a>` props

### Option B: `navigate(href)` + `useHref` (React Aria)

- ✅ Kvirn always owns the `<a>`. Works with any router
- ❌ Loses prefetch and typed routes. Click interception has to handle modifier keys, `target` and `download` itself

### Option C: `render` prop only

- ✅ No new API
- ❌ Repeated on every link. Blocks would need it threaded through

## Decision

We will use Option A, with the per-instance `render` prop (C) as the override, because it keeps each framework's own Link behaviour and typing with one line of setup. The registered component must forward its ref and render an `<a>`. A dev warning fires if it doesn't.

## Accessibility impact

None negative, because the DOM stays a native `<a href>`. Kvirn adds `aria-current`, `rel` for new tabs and a translated new-tab notice (3.2.5 G201).

## Consequences

- Positive: all link-rendering components and blocks become router-aware for free.
- Negative: `Register` augmentation is a global type. Only one router per app is typed.
- Follow-ups: Plan 0002 (provider), Plan 0003 (Link).

## Validation

Stories and tests with a mock router component. Docs recipes for Next.js and TanStack Router verified in a sample app before 0.x.

## References

- TanStack Router `Register` interface. React Aria `RouterProvider`. Base UI `render` prop.
