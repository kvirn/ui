# Plan 0102: Breadcrumb separator

- **Status:** Approved
- **Owner:** orchestrator / component-engineer
- **Created:** 2026-10-11 · **Target:** alpha
- **Related:** `packages/react/src/breadcrumb/breadcrumb.a11y.md`, Alert's `icon` prop (prior art), AGENTS.md rule 14

## Goal

A breadcrumb's separator can be chosen: a ready-made `variant`, or any element (an `<Icon>`, a component) passed in.

## Non-goals

- No free-form string prop and no inline `style`. No i18n strings (the separator is never read).
- No collapsing, no change to the trail's wrapping, links or `aria-current`.

## Options weighed

1. `separator` string prop: rejected. Rule 14: a marker is a class, never a prop.
2. `variant` only: within rule 14, but can't take an icon.
3. **Chosen:** `variant` (`'chevron' | 'slash'`, picks `kv-breadcrumb--slash`; chevron adds none) plus `separator?: ReactNode` on `Breadcrumb.Root`. The latter is content, not presentation, the same as Alert's `icon: ReactNode`; the maintainer asked for it.

## Design

### API sketch

```tsx
<Breadcrumb.Root variant="slash">…</Breadcrumb.Root>
<Breadcrumb.Root separator={<Icon name="chevron-right" />}>…</Breadcrumb.Root>

const breadcrumb = useBreadcrumb({ variant: 'slash' })
// rootProps.className: 'kv-breadcrumb' | 'kv-breadcrumb kv-breadcrumb--slash'
// separatorProps: { className: 'kv-breadcrumb-separator', 'aria-hidden': true }
```

- `useBreadcrumb({ variant })` returns frozen `rootProps` per variant, plus `separatorProps`.
- `Breadcrumb.Root({ variant, separator })` puts `separator` in an internal `BreadcrumbContext` (as `alert-context.ts`).
  `Breadcrumb.Item` renders `<span {...separatorProps}>{separator}</span>` before its content when `separator` is set. `null` outside a root.
- Theme: `.kv-breadcrumb--slash` swaps the generated `/` (empty alternative text, same as the chevron). An item holding a
  `.kv-breadcrumb-separator` turns its generated chevron off (`:has`), and `.kv-breadcrumb-item:first-child > .kv-breadcrumb-separator`
  is `display: none`: the first item has no separator. Forced colours keep the separator in `CanvasText`.
- A custom separator is drawn in the muted text colour (`.kv-breadcrumb-separator`) and mirrors only if the consumer's element does.
  Say in the docs that a directional icon needs its own RTL handling.

### Accessibility contract (draft)

No key changes: the links own the keys. Add to `breadcrumb.a11y.md`:

- The separator is never in the accessibility tree: generated content with an empty alternative, or an element with `aria-hidden="true"`. It is never the only cue between items (1.4.1): items are also separate list items.
- A consumer's `separator` must be decorative. If it needs a name, it is not a separator.
- WCAG SCs: 1.1.1 (decorative), 1.3.1 (the list carries the structure), 2.4.8, 1.4.11 (a custom one is decoration, so no contrast need).

### Tests (`breadcrumb.test.tsx`, one named test per row)

- `variant: 'slash'` adds `kv-breadcrumb--slash` to the nav; default adds no modifier class.
- `separator` renders one `aria-hidden` `.kv-breadcrumb-separator` per item and the links keep their accessible names.
- Hook: `separatorProps` is `{ className, 'aria-hidden': true }` and the result is stable per variant.
- axe: 0 violations with `variant="slash"` and with a `separator` icon (stories cover every theme).

## Tasks

- [x] Hook: `variant`, `separatorProps`, types; context file; `Breadcrumb.Root`/`Item` (`.tsx`) and the `index.ts` exports of new types
- [x] Tests (browser) for the rows above
- [x] `theme.css` section 8c: the slash variant, custom-separator rules, forced colours (`theme:check` green)
- [x] Stories: Slash and CustomSeparator (+ RTL in the existing RTL story's matrix) in `breadcrumb.stories.tsx`
- [x] Docs: `breadcrumb.md`, `breadcrumb.a11y.md`, `apps/docs/content/breadcrumb.api.ts`, one example in `apps/docs/examples/breadcrumb/`
- [ ] Gates: `vp check`, `vp test run`, `theme:check`; `accessibility-reviewer` on the diff

## Decisions taken during implementation

- `BreadcrumbContext` holds the `separator` ReactNode itself (`undefined` outside a root); `separatorProps` comes from `useBreadcrumb()` in `Item`. `undefined`, `null` and `false` count as no separator.
- `useBreadcrumb` also exports `BreadcrumbVariant` and `BreadcrumbSeparatorPartProps`; `rootProps` is memoised on `[name, variant]` (the label varies), `separatorProps` is one frozen object.
- Slash is `'/'` in both directions (a slash isn't mirrored); the custom-separator and first-item rules use `.kv-breadcrumb .kv-breadcrumb-item:has(> …)` to beat the chevron rules' specificity.
- Extra story `RTLVariants`; docs example `custom-separator.tsx` with a use case on the Breadcrumb page.
- Review fixes: `RTLVariants` and `ForcedColors` render a slash and an icon-separator trail; the duplicate slash axe test and default-class assertions were dropped; docs say the separator is rendered in every item (the theme hides the first), is never interactive, and that `chevron-forward` mirrors itself while own icons need `mirrorInRtl`; api-conventions rule 14 notes ReactNode content slots.
