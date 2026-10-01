# Architecture Decision Records

We record significant decisions as ADRs using a lightweight MADR-style format.

- Copy `0000-template.md` to `NNNN-short-title.md`, using the next free number.
- Statuses: `Proposed` → `Accepted` | `Rejected`, and later `Deprecated` or `Superseded by ADR-NNNN`.
- ADRs are immutable once accepted. To change a decision, write a new ADR that supersedes the old one.
  - **Suspended during planning (maintainer decision, 2026-09-30).** Until the maintainer declares planning done, accepted ADRs may be edited, merged or renumbered in place. On 2026-09-30, the toolchain details were merged into ADR-0002 and catalog loading into ADR-0003, and message overrides moved to ADR-0007.

## When to write one

- Adding a runtime dependency or a new package
- Deviating from a WAI-ARIA APG pattern
- Changing a public API convention (props, data attributes, naming)
- Changing tooling, the build or the release process
- Any accessibility trade-off (for example, choosing between two AT behaviours)

## Index

| #                                                          | Title                                                                          | Status   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| [0001](0001-record-architecture-decisions.md)              | Record architecture decisions                                                  | Accepted |
| [0002](0002-vite-plus-pnpm-monorepo.md)                    | Vite+ and pnpm monorepo                                                        | Accepted |
| [0003](0003-framework-agnostic-core-react-only-adapter.md) | Framework-agnostic core, React-only adapter                                    | Accepted |
| [0004](0004-wcag-2-2-aa-baseline.md)                       | WCAG 2.2 AA as release baseline                                                | Accepted |
| [0005](0005-router-link-registration.md)                   | Router links via provider registration                                         | Accepted |
| [0006](0006-theme-preference-store.md)                     | Theme preference store and persistence                                         | Accepted |
| [0007](0007-message-overrides.md)                          | Every string has a default and can be overridden                               | Accepted |
| [0008](0008-theme-storage-relative-to-defaults.md)         | Theme storage is relative to the configured defaults                           | Proposed |
| [0009](0009-message-value-types.md)                        | Message value types and resolved message shape                                 | Proposed |
| [0010](0010-react-entry-use-client.md)                     | Mark the whole `@kvirn-ui/react` entry as `"use client"`                       | Proposed |
| [0011](0011-design-md-and-ux-design-workflow.md)           | DESIGN.md design language and a UX design workflow                             | Proposed |
| [0012](0012-conventional-commits-enforced.md)              | Conventional Commits, enforced by hook and CI                                  | Proposed |
| [0013](0013-default-theme-delivery.md)                     | Default theme as one hand-written theme.css on part attributes                 | Accepted |
| [0014](0014-default-theme-visual-direction-linear.md)      | Default theme visual direction: Linear-inspired                                | Accepted |
| [0015](0015-merge-props-and-render-semantics.md)           | `mergeProps` and `render` merge semantics                                      | Proposed |
| [0016](0016-button-and-link-api-details.md)                | Button and Link API details                                                    | Proposed |
| [0017](0017-default-theme-prototype-implementation.md)     | Default-theme prototype implementation details                                 | Accepted |
| [0018](0018-prose-styles-and-foundation-tokens.md)         | Prose styles by attribute, and prose, lead and shadow tokens                   | Accepted |
| [0019](0019-role-named-palette-scales.md)                  | Palette scales named by role, a secondary edge token, and an unused accent     | Accepted |
| [0020](0020-card-container.md)                             | Card is a plain container with Header, Body and Footer parts                   | Proposed |
| [0021](0021-primary-button-hover-edge.md)                  | A hovered primary button keeps a `primary` edge                                | Proposed |
| [0022](0022-card-implementation-details.md)                | Card implementation details                                                    | Proposed |
| [0024](0024-icon-registry-and-svg-attributes.md)           | Icons through a typed name registry, rendered as SVG attributes                | Proposed |
| [0025](0025-icon-libraries-as-dev-dependencies.md)         | Lucide, Heroicons and Phosphor as devDependencies for Icon's tests and stories | Proposed |
| [0026](0026-button-depth-grounded.md)                      | Buttons have gentle depth ("Grounded")                                         | Proposed |
| [0027](0027-ibm-plex-typefaces.md)                         | IBM Plex Sans for text and IBM Plex Serif for headings                         | Proposed |
| [0028](0028-hyphenation-and-small-screen-type.md)          | Hyphenate long words, and step the large type roles down below 40rem           | Proposed |
