# ADR-0052: Heading takes a level and a type-role size, and Prose is `kv-prose` as a component

- **Status:** Proposed
- **Date:** 2026-10-03
- **Deciders:** Magnus Vike (asked for a Heading and a Prose component), proposed with Plan 0023
- **Tags:** api, a11y

## Context

Examples wrote `<h2>` and `className="kv-prose"` by hand. An `h2` carries a level the author picks by habit, and the class is easy to forget. The library had Section and Card but no component for the text inside them.

## Decision drivers

- Native semantics first (AGENTS.md hard rule 2): the heading element is the semantics.
- Headings follow the page's outline, which a component can't know.
- Keep it small: no new CSS, no new tokens.

## Decision

1. **`Heading` has a required `level` (1 to 6) and renders `<h1>` to `<h6>`.** There is no default and no automatic level: a wrong guess damages the outline (1.3.1, 2.4.6), and the compiler asks for the decision. It adds no role or ARIA. `render` changes the element, with `state.level` and `state.size` for the function form.
2. **`size` is the look, apart from the level.** It takes the type roles `display`, `heading-1`, `heading-2` and `heading-3`, and the component adds `kv-heading` and `kv-heading--<size>` (ADR-0013: the theme styles classes). Levels 1 to 3 default to `heading-1` to `heading-3`. Levels 4 to 6 have no modifier and keep prose's look for h4 to h6: the body size in the heading-3 weight. The modifier works in prose and outside it, and it sets type only: margins stay with `kv-prose`.
3. **`useHeading({ level, size })`** returns `element`, `size` and `rootProps` (the classes), for your own element.
4. **`Prose` is one `<div class="kv-prose">`**, with `Prose.Root`, `ProseRoot` and `useProse()`, built like Section (ADR-0044). The class joins a consumer's, and `render` changes the element. No role, ARIA or strings.

## Consequences

- Positive: `<Heading level={2}>` is checked by the types, and prose is one import.
- Positive: a page's `h1` can be `display` and a card's `h3` can look like heading-2, with the outline intact.
- Negative: more to type than `<h2>`, by design. Margins aren't set outside Prose: a Heading there has the browser's margins until you set yours.
- The other type roles (body, body-large, lead, body-small, label, numeric, code) are not Heading's: Prose styles them (`kv-prose--large`, `p.kv-lead` and its elements).

## Validation

Light component tests (element per level, size classes, `render`, class join, axe), `theme:check`, Storybook stories, and the keyboard-docs check.

## References

- Plan 0023, ADR-0044, `docs/design/foundations-and-prose.md`
