# Plan 0023: Heading and Prose

- **Status:** Done (alpha. Manual AT pending before beta. ADR-0052 still to be accepted)
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-03 · **Target:** M1
- **Related:** ADR-0052 (Proposed), ADR-0044

## Goal

Adopters write a page's text with two components instead of raw tags and a class: `Heading` with a required level, and `Prose` for the text set for reading. The Section example in Storybook then reads `<Section><Prose><Heading level={2}>…`.

## Non-goals

- Components for paragraphs, lists or links. `Link` exists, and the rest is plain HTML in Prose.
- Automatic heading levels from context. A required `level` is the decision (ADR-0052).
- New tokens. The CSS reuses the type role tokens.
- Margins outside Prose.

## Design

```tsx
<Prose>
  <Heading level={2} id="kontakt">
    Kontakta oss
  </Heading>
  <p>Vi svarar vardagar 9–16.</p>
</Prose>
```

- `Heading`: `level` 1 to 6 (required) is the element. `size` (`display`, `heading-1`, `heading-2`, `heading-3`) is the look, with levels 1 to 3 defaulting to their own. Classes `kv-heading` and `kv-heading--<size>`, no role or ARIA. `render` changes the element and the function form reads `state.level` and `state.size`. `useHeading({ level, size })` gives `element`, `size` and `rootProps`.
- `Prose` (also `Prose.Root`, `ProseRoot`) and `useProse()`: one `<div class="kv-prose">`, like Section. `render` changes the element. No role or ARIA.

### Accessibility contract (draft)

No keys and no focusable part for either. Contracts: `heading.a11y.md`, `prose.a11y.md`. Consumer responsibilities: the outline (one `h1`, no skipped levels) and the content's own semantics.

### i18n strings

None.

### Theming surface

`theme.css` section 9a: `kv-heading` (colour, family, the h4 to h6 look) and `kv-heading--display|heading-1|heading-2|heading-3` (the type role tokens). Prose already has the other roles: body, `--large`, `p.kv-lead`, captions, code, numeric.

## Tasks

- [x] `packages/react/src/heading/` and `prose/`: component, hook (Prose), docs and contract
- [x] `theme.css` 9a: `kv-heading` and the four size modifiers
- [x] Light tests: element per level, size classes, `render`, class joins, axe
- [x] Stories: `Components/Heading` (Default, Sizes, Outline) and `Components/Prose` (Default, Large). The Section stories use them
- [x] The `Foundation/Prose` stories moved to `Components/Prose` (`components-prose--docs`): one Prose, one page. Links and the sidebar order updated
- [x] Exports in `index.ts`, ADR-0052, roadmap rows, changeset
- [ ] Manual AT matrix: `pending`

## Verification

`vp check` and `vp test run` on the changed files, the keyboard-docs check and `theme:check`. No e2e: nothing is focusable or keyed.
