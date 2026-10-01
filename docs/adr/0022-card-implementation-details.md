# ADR-0022: Card implementation details

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** component-engineer agent, for the maintainer to confirm (Plan 0007)
- **Tags:** api, theming, a11y

## Context

ADR-0020 and the design spec (`docs/design/card.md`) decide what Card is and how it looks. Implementing them needed a few choices the spec leaves to the engineer ("the selector mechanics are the engineer's", §6.6), and one conflict between the spec and the repository's lint gate.

## Decision drivers

- A card's element changes with `render` (`<div>`, `<article>`, `<section>`, `<li>`), so its types mustn't assume a `<div>`.
- Prose stops at a card, and `data-kv-prose` inside a card turns it on again (spec §6.6), in CSS that works in Safari 17.0 (no `@scope`).
- Never weaken a gate (AGENTS.md hard rule 1).

## Decision

1. **Refs.** Every part takes `ref?: Ref<HTMLElement>`, so a ref to an `<li>` or a `<section>` fits. A `render` function gets a callback ref (`RefCallback<HTMLElement>`), which React types bivariantly, so `{...props}` spreads onto any element, a `<div>` included. Those props are exported as `CardElementProps`, like `LinkElementProps`. `CardState` is an empty object: a card has no state.
2. **The prose boundary is "nearest wins", for two levels of cards.** Inside prose, an element is prose-styled unless a card without `data-kv-prose` is nearer to it than any `data-kv-prose` inside that card. Without `@scope`, the selector spells out the alternation: inside a card, but not (inside prose inside a card, but not (inside a card inside that, but not inside prose inside that)). Three levels of nested cards with prose aren't supported. A card's Root in prose gets prose's block margins and nothing else, like `data-kv-not-prose`.
3. **The Root is `display: block`, or `flex` with parts.** So a card rendered as `<li>` draws no list marker. The design spec's `ul[role=list]` keeps Safari's list semantics, but the repository's jsx-a11y `no-redundant-roles` rule rejects `role="list"` on a `<ul>`, and the rule stays on. The stories use a plain `<ul>`. The docs (`card.md`, the JSDoc example), which aren't linted, show `<ul role="list">` and say why. A `render` element's own `data-kv` doesn't replace the part name either: the part re-applies it, scoped to Card, without changing the shared `renderPart`. Whether to allow `role="list"` on lists of cards (a lint configuration change, so its own ADR) is an open question for the maintainer.
4. **Full-bleed media.** A part without its own `data-padding`, in a Root with `data-padding="none"`, counts as a box without padding too, so its image is rounded. An image gets the top corners only when it's the first child of the first part (or of a Root without parts), and the bottom corners only when it's the last child of the last part.
5. **Card tokens live in the Card section of `theme.css`,** including the compact-density step, so section 6 keeps only the control tokens. Its comment points to section 10.

## Consequences

- Positive: one `ref` type for every element a card can be. Prose and cards behave as the spec's table says, tested in the `Prose and cards` and `Nested card, compact` stories.
- Negative: the prose scope selector is long. The comment above it explains it, and it can collapse into `@scope` once Safari 17.0–17.3 drop out of the support range.
- Follow-ups: a decision on `role="list"` and the lint rule. Check the list of cards in VoiceOver + Safari in the manual AT run.

## Validation

- `card.test.tsx` (refs to `<li>` and `<aside>`, `render` function form, `useCard`).
- `theme-css.test.ts` (prose scope, card rules), and the story play functions for prose in and around cards.

## References

- Plan 0007, ADR-0018, ADR-0020, `docs/design/card.md` §6.2, §6.3, §6.6
