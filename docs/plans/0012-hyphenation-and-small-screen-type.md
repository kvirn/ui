# Plan 0012: Hyphenate long words, and smaller large type below 40rem

- **Status:** Done (design review pending)
- **Owner:** Main session
- **Created:** 2026-10-02 · **Target:** default theme 0.x
- **Related:** `docs/design/foundations-and-prose.md` (open question 3), `docs/design/card.md`

## Goal

A long compound in a card or in prose, in body text or in a heading, breaks at a real hyphenation point with a visible hyphen, and never overflows at 320px. On small screens the large type roles are a few pixels smaller.

## Non-goals

- Changing body, body-large, heading-3 or any control size.
- Shipping hyphenation dictionaries or JavaScript.
- Styling headings outside prose. The tokens change, so whatever uses them follows.

## Design

`packages/theme/theme.css` only:

- `:where(.kv-prose)` and `.kv-card`: `hyphens: auto; hyphenate-limit-chars: 10 4 4;` before the existing `overflow-wrap: break-word`.
- `:where(.kv-prose, .kv-card) :where(code, kbd, samp, pre) { hyphens: manual }`.
- `@media (width < 40rem) { :root { … } }`: display 2rem (tracking 0em), heading-1 1.5rem, heading-2 1.25rem, lead 1.125rem.

### Accessibility contract (draft)

- No horizontal scroll at 320px with a 40-letter compound in a card heading and in prose (1.4.10). The fallback wraps words with no hyphenation point.
- Sizes stay in rem and body text never shrinks (1.4.4).
- Hierarchy holds below 40rem: display > heading-1 > heading-2 > heading-3, lead ≥ body-large.
- Code is never hyphenated.

## Verification

- [x] `packages/theme/src/theme-css.test.ts`: hyphenation and the fallback on prose and card, `manual` on code, the exact small-screen tokens, and that the order and body size hold. Written failing first.
- [x] `vp run theme:check`, `vp test run packages/theme` and `vp check`.
- [ ] Visual check at 320px in Chromium, Firefox and Safari with fi, sv and se text: `pending` (ux-designer design review).
- [ ] Manual AT matrix: `pending`.
