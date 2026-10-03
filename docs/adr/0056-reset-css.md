# ADR-0056: An optional reset.css, ported from Tailwind's Preflight

- **Status:** Proposed
- **Date:** 2026-10-03
- **Deciders:** Magnus Vike (asked whether to use Tailwind's reset), proposed with ADR-0054
- **Tags:** theme, a11y

## Context

The theme had no reset. Each component sets its own `box-sizing`, border and type, and `kv-prose` styles the elements inside it. Elements outside both (a page's own headings, lists, images, form controls) keep the browser's styles. Tailwind's typography plugin sits on Preflight, which is that blank page.

## Decision drivers

- The theme works without a reset today, and must keep working.
- No new dependency (hard rule 6), no network (rule 7).
- Preflight is MIT: keep the notice.
- Don't weaken accessibility to get a blank page.

## Decision

1. **`@kvirn-ui/theme/reset.css` is a new, opt-in file.** It is Tailwind CSS v4's Preflight ported to plain CSS, with the MIT notice in the file. `theme.css` does not import it.
2. **It lives in `@layer kv-reset`, declared before `@layer kv`** in both files (`@layer kv-reset, kv;`), so it is the lowest layer in any import order, and the theme and unlayered CSS always win.
3. **Three changes from Preflight.** Lists keep their markers and a 1.5em start indent (`list-style: none` makes Safari with VoiceOver stop announcing a list, 1.3.1, and zero padding clips outside markers). `svg:not(.kv-icon)` is a block, so an Icon stays inline. The font stacks read `--kv-font-family-body` and `--kv-font-family-mono` with Preflight's stacks as the fallback, in place of Tailwind's `--theme()`.
4. **No focus styles.** The file sets no outline except Preflight's Firefox focus ring.

## Consequences

- Positive: one import gives the same blank page as Tailwind, and the typography parity (ADR-0054) lines up with it.
- Positive: nothing changes for anyone who doesn't import it.
- Negative: a second file to keep in step with Preflight. The test pins its shape, not its upstream version.
- Negative: Preflight makes a bare `<a>` look like its text (`color` and `text-decoration` inherit). Inside the theme's components and in `kv-prose` a link is styled, but a raw `<a>` elsewhere (in a card or a notification's actions) needs `kv-link` or your own CSS (1.4.1). No story loads the reset yet, so "works with or without it" is by design, not by test.
- Negative: with the reset, a bare `<h2>` outside prose is unstyled. That is its job, and `Heading` and `Prose` give the styles back.

## Validation

Tests that the file is plain CSS with the licence, that every rule is in the layer, that it keeps list markers and inline icons, and that `theme.css` declares the layer order. Not imported by Storybook or the docs site, so no visual change there.

## References

- ADR-0013, ADR-0054, [Tailwind Preflight](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/preflight.css)
