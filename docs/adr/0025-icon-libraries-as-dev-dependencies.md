# ADR-0025: Lucide, Heroicons and Phosphor as devDependencies for Icon's tests and stories

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Maintainer (Plan 0009)
- **Tags:** tooling, compliance

## Context

`Icon` promises to work with icon libraries through the registry (ADR-0024). Each library builds its `<svg>` differently: Lucide's `color` sets `stroke`, Phosphor's sets `fill`, and Heroicons always sets `aria-hidden` (Plan 0009, Background). A test against a hand-written stand-in proves nothing when a library changes how it applies props. Hard rule 6 requires an ADR for any new dependency.

## Decision drivers

- Test against the real components adopters use
- No runtime dependency (hard rule 6), and no network calls (hard rule 7)
- Licences compatible with MIT
- A library release that changes prop order shows up as a reviewed version bump, not as a broken adopter

## Options considered

### Option A: The real libraries as devDependencies, pinned exactly in the catalog

- ✅ Tests and stories exercise the real prop handling and accessibility defaults
- ❌ Three more packages in the lockfile and the supply-chain review

### Option B: Hand-written stand-ins that mimic each library

- ✅ No new packages
- ❌ They drift from the real libraries, and the tests would test the stand-ins

## Decision

We will use Option A: `lucide-react` 1.49.0, `@heroicons/react` 2.2.0 and `@phosphor-icons/react` 2.1.10, pinned exactly in the pnpm catalog and added as **devDependencies** of `@kvirn-ui/react` (component tests) and `@kvirn-ui/storybook` (stories). No published package depends on them.

Checked on 2026-10-01 in the published packages:

| Package                 | Licence | Dependencies | Network calls              | Install scripts |
| ----------------------- | ------- | ------------ | -------------------------- | --------------- |
| `lucide-react`          | ISC     | none         | none (no `fetch`, no URLs) | none            |
| `@heroicons/react`      | MIT     | none         | none                       | none            |
| `@phosphor-icons/react` | MIT     | none         | none                       | none            |

ISC and MIT are compatible with KvirnUI's MIT licence. Nothing from them ships in `@kvirn-ui/*`, so they're not part of the published packages' SBOM. The built-in icons are original drawings, not copies of any library's paths.

## Accessibility impact

Positive: the tests prove that a labelled icon from each library loses the library's own `aria-hidden`, and that a decorative one is hidden (Plan 0009).

## Consequences

- Positive: compatibility claims in the docs are backed by tests against the real libraries.
- Negative / trade-offs: three devDependencies to keep current. A bump can break a compatibility test, which is the point.
- Follow-ups: add Tabler or react-icons only if adopters ask, with the known traps (Plan 0009) as tests.

## Validation

`icon.test.tsx › library compatibility` and `› accessibility` pass with the pinned versions. Revisit on each major release of the three libraries.

## References

- Plan 0009, ADR-0024, ADR-0003 (sanctioned runtime dependencies)
- [lucide-react](https://www.npmjs.com/package/lucide-react), [@heroicons/react](https://www.npmjs.com/package/@heroicons/react), [@phosphor-icons/react](https://www.npmjs.com/package/@phosphor-icons/react)
