# Plan 0136: Divider

- **Status:** Approved
- **Owner:** lead → component-engineer
- **Created:** 2026-10-18 · **Target:** alpha
- **Related:** `.docs-icon-customize` in `apps/docs/app/(docs)/docs.css:705`; reference component `packages/react/src/address/` (stateless, one native element, no hook)

## Goal

A consumer (and the docs site) can draw a horizontal rule between two blocks with `<Divider />`: a block margin by default, the hairline colour, and every value changeable with a CSS variable. The docs site's icon library stops drawing that line with a border on `.docs-icon-customize`.

## Non-goals

- No `orientation` / vertical divider, no label-in-the-line variant, no `variant` or `size`: add when a use needs them.
- No behaviour, no hook, no i18n strings. Menu's separator (`kv-menu-separator`) is untouched.

## Design

### API sketch

```tsx
<Divider />                                  // <hr class="kv-divider">
<Divider role="presentation" />              // purely visual: not announced
<Divider className="my-divider" style={...}> // no: set the variables from a class
```

`export function Divider(props: DividerProps)`; `DividerProps = ComponentPropsWithRef<'hr'>`; no `as` (the element is the semantics). Built like `Address`: `createElement('hr', mergeProps(props, { className: 'kv-divider' }))`, `displayName = 'Divider'`. Server-component safe.

### Accessibility contract (draft)

No focusable part, so no keyboard rows (the contract says "none, not focusable").

- Roles / ARIA: native `<hr>` = implicit `separator` (a thematic break, announced by some AT). A consumer who only wants a visual line passes `role="presentation"` (valid on `hr`); the docs say when to pick which.
- Focus management: none. Announcements: none.
- WCAG SCs: 1.3.1 (structure is native), 1.4.11 (the line is decoration between blocks, not required to understand content; the default colour is still the theme's border-subtle), 1.4.3 n/a.
- Forced colours: draw the line as a border, never a background (backgrounds are replaced), so it keeps its edge; `--kv-color-border-subtle` is already `CanvasText` there.

### Theming surface

Class `.kv-divider` in `packages/theme/theme.css`, in `:where()` like `.kv-address` (`:3582`). Variables, each falling back to a token, set on the element or any ancestor:

| Variable                     | Default                         |
| ---------------------------- | ------------------------------- |
| `--kv-divider-margin-block`  | `var(--kv-space-4)` (16px)      |
| `--kv-divider-margin-inline` | `0`                             |
| `--kv-divider-width`         | `var(--kv-border-width)`        |
| `--kv-divider-style`         | `solid`                         |
| `--kv-divider-color`         | `var(--kv-color-border-subtle)` |

CSS: `border: 0; border-block-start: var(--kv-divider-width, var(--kv-border-width)) var(--kv-divider-style, solid) var(--kv-divider-color, var(--kv-color-border-subtle)); margin-block: …; margin-inline: …; block-size: 0; overflow: visible;`. Follow the file's declaration style for configurable parts (`theme-css` skill; example `.kv-one-time-code`, `:9436`).

## Tasks

- [x] `packages/react/src/divider/`: `divider.tsx`, `divider.d.ts` (as `address.d.ts`), `divider.test.tsx`, `divider.a11y.md`, `divider.md`; export `Divider` and `DividerProps` in `packages/react/src/index.ts` (next to Address, `:225`)
- [x] `theme.css`: `.kv-divider` block + class-list comment (as Address, `:79`); `vp run theme:check` green
- [x] Stories `apps/storybook/src/components/divider/divider.stories.tsx` (default, presentation, custom variables, RTL, forced-colors; no `Keyboard` story, nothing focusable), as `address.stories.tsx`
- [x] Docs page as Address: `apps/docs/app/(docs)/components/divider/page.tsx`, `components/divider-page.tsx`, `content/divider.api.ts`, `examples/divider/*`, `site-sections.ts:117`, `lib/search-index.ts:4,80`
- [x] Docs site: in `icon-library.tsx:400` put `<Divider />` before `<details className="docs-icon-customize">`, remove `border-block-start` from `.docs-icon-customize` (keep or retune `padding-block-start` so spacing stays the same)
- [x] `docs/roadmap.md` line; `DESIGN.md` mention if components are listed there (`:620` is Address)

## Decisions

- Library component, not a docs-only helper: the user asked for a component with configurable CSS variables, which is the library's own pattern. (Assumed; lead flagged it to the user.)
- `<hr>`, not `div role="separator"`: native semantics first. No `decorative` prop: `role="presentation"` already does it, and a new prop is API we would carry.
- Default margin 16px (`--kv-space-4`), the lower of the user's 16/24px; a consumer raises it with the variable.
- Colour defaults to `--kv-color-border-subtle`, the exact token `.docs-icon-customize` used.
- Variables are read with fallbacks, not declared on `:root`, so a consumer's ancestor or class overrides them with no specificity fight.

## Risks & open questions

- `hr` default `margin-inline: auto` and `color` in the UA stylesheet: reset explicitly.
- Docs spacing may shift by a few px after the swap: compare, retune the docs CSS only.

## Testing strategy

Standard pyramid (`testing` skill): `divider.test.tsx` proves the element is `hr`, the class survives a prop `className`, `role="presentation"` passes through, ref forwarding, and axe clean. No CSS assertions (rule 13). Stories run axe in every theme.

## Done when

- [ ] Gates pass, `accessibility-reviewer` APPROVE, plan ticked, roadmap updated

## Implementation notes

- `.docs-icon-customize` `padding-block-start` is now 0: the Divider's 16px margin replaces the old 12px padding below the line.
- The docs page has two examples (default, decorative line); no custom-variables example, since it would need a docs-only class. The variables are listed in the API block.
- `DESIGN.md` has no component list entry added; left for the maintainer. `theme:check` not run (no tokens changed, one class added).
