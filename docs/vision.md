# Vision & principles

## Why

This is the component library a Nordic municipality can adopt without an accessibility consultant telling them to rip it out.

- Public-sector sites must meet EN 301 549, which today means WCAG 2.1 AA, and WCAG 2.2 is coming. Most component libraries treat accessibility as best-effort and never document it.
- Headless UI is solid but small. Tailwind Plus is paid, styled and not built for the public sector. Radix, React Aria and Ark are strong, but none targets Nordic languages, procurement or EU rules.
- Municipalities keep rebuilding the same patterns: e-service forms, accessibility statements, consent banners and language switchers.

**Who it's for:** frontend teams at municipalities, regions and agencies in SE, FI and NO, and more broadly across the EU. Also the suppliers who build for them, and private companies in scope of the EAA.

**Positioning:** best-in-class accessibility you can verify. Every component publishes its contract, its test evidence and its known issues.

**Non-goals:** other frameworks (the core stays agnostic, but we ship React only), React versions before 19, a brand or full design system, and data grids or charts.

**Success:** at least 3 public-sector adopters within 12 months of 1.0, zero open A/AA defects, and being referenced in tenders.

## Principles (higher wins on conflict)

1. **Accessibility is correctness.** An inaccessible component is broken. If a pattern can't be made accessible, we don't ship it.
2. **Headless core, you own the markup.** Logic lives in a typed, framework-agnostic core with thin React bindings. We ship no styles and no imposed DOM beyond what the semantics require.
3. **Hooks first, components as sugar.** `useX()` returns prop objects named after their part (`triggerProps`, `panelProps`), and `X.Root` / `X.Trigger` are built on it. Anything a component can do, the hook can do.
4. **Semantics before ARIA.** Use native elements first. Behaviour must hold with real assistive technology, not just pass axe.
5. **Type-safe by inference.** Consumers rarely write generics. Invalid states should be unrepresentable where that's practical.
6. **Controlled or uncontrolled, always.** Every stateful value supports `value` / `defaultValue` / `onValueChange`.
7. **Compose, don't configure.** Small primitives over large prop surfaces. For example, Combobox is built from Popover, Listbox and Field.
8. **Zero cost you didn't ask for.** The only runtime dependency is `@tanstack/store` (ADR-0003). Everything is ESM and tree-shakable, with per-component bundle budgets.
9. **Local by default.** Nordic locales, text direction and `Intl` formatting are first-class.
10. **Boring, stable APIs.** Strict semver, deprecate before removing, codemods for breaking changes, and an LTS policy that public budgets can plan around.
