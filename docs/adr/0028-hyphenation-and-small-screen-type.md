# ADR-0028: Hyphenate long words, and step the large type roles down below 40rem

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer (asked for both). Recorded by the main session.
- **Tags:** theming, typography, a11y
- **Amends:** `docs/design/foundations-and-prose.md` open question 3 (`hyphens` stayed `manual`), and `docs/design/card.md` (the Root's wrapping). Plan 0012. Revised 2026-10-02 (Plan 0020, ADR-0047): notifications hyphenate like prose and cards.

## Context

Finnish, Swedish and Norwegian compounds are long ("työttömyysturvaetuushakemus", "arbetsmarknadsutbildning"), and so are some Northern Sámi words. Prose and cards had only `overflow-wrap: break-word`. That keeps them inside 320px (1.4.10), but it splits a word at whatever letter reaches the edge, with no hyphen: "arbetsmarknadsutbil / dning". The reader can't tell that the word goes on. At heading sizes a phone line holds 15–20 letters, so it happens in nearly every card title with a compound.

The headings were also the same size at 320px as on a desktop: display 40px and heading-1 28px. That made more words break, and a heading take three or four lines.

## Decision drivers

- No horizontal scrolling and no clipping at 320px and 400% zoom (1.4.10).
- A word that has to break shows that it goes on, at a point a reader recognises.
- Some readers with dyslexia find frequent hyphenation harder to read, so hyphenate as little as possible.
- Text still grows with the browser's text size (1.4.4). Body text is never made smaller.
- No JavaScript and no dictionary in the theme (hard rules 5 and 6).

## Decision

1. **Hyphenate long words.** `kv-prose` and `kv-card` set `hyphens: auto` and `hyphenate-limit-chars: 10 4 4`. Words of 10 letters or more may split at the browser's hyphenation points for the element's `lang`, with at least 4 letters each side. Shorter words never split.
2. **Keep `overflow-wrap: break-word` as the fallback**, for languages the browser has no dictionary for (Northern Sámi in most browsers), for a missing `lang`, and for strings with no hyphenation point.
3. **Never hyphenate code.** `code`, `kbd`, `samp` and `pre` in prose or a card set `hyphens: manual`, because a hyphen in a command or a reference number reads as part of it. Inline code keeps `overflow-wrap: anywhere`.
4. **Step the large roles down below `40rem`** by overriding the tokens on `:root`: `display` 2.5rem to 2rem (with tracking 0, since DESIGN.md has no tracking below 40px), `heading-1` 1.75rem to 1.5rem, `heading-2` 1.375rem to 1.25rem, and `lead` 1.25rem to 1.125rem. `heading-3`, `body-large`, `body` and the smaller roles don't change. Everything that reads the tokens follows, and an adopter's override of a token on `:root` outside a media query still wins at every width, because the theme is in `@layer kv`.
5. Steps, not `clamp()` with `vw`. A viewport unit doesn't grow with text-only zoom, so it can fail 1.4.4. A rem step inside a rem media query follows both kinds of zoom.

## Consequences

- Hyphenation depends on `lang`. It needs `<html lang>` (already required, 3.1.1) and `lang` on passages in another language (3.1.2). We document this. It can't be enforced in CSS.
- Browsers differ. Chromium supports `hyphenate-limit-chars`. An engine that doesn't still hyphenates with `hyphens: auto` but ignores the limit, so it may split shorter words.
- **Chromium has no Finnish dictionary.** Measured on 2026-10-02 (Playwright Chromium 153 and Firefox 155, Linux): Chromium hyphenates sv, nb, nn and en but not fi or se. Firefox hyphenates fi, sv, nb, nn and en but not se. Safari is unverified. So in Chrome, Edge and Brave a Finnish compound that doesn't fit still breaks at a letter with no hyphen (the fallback in decision 2). Only soft hyphens (`&shy;`, U+00AD) in the text fix that in every engine. Dictionaries also differ by browser and platform, so the break points aren't identical everywhere. The fallback in decision 2 holds in every browser.
- Hyphenation is visual only. Screen readers, search, find-in-page and copy get the whole word.
- On a desktop at about 200% zoom the viewport drops below 40rem, so headings grow less than 2× there (heading-1: 28px at 100%, 48px at 200%). Body text grows the full 200%. This is the same responsive type scale GOV.UK uses. Nothing is lost or clipped, and the reason for the step is reflow at high zoom.
- An adopter who doesn't want hyphenation sets `hyphens: manual` on `.kv-prose` or `.kv-card` in their own CSS, which beats the layered theme.

## Alternatives considered

- **`hyphens: manual` with `&shy;`** (the previous proposal). It only works for strings someone has marked up, and CMS and translated content isn't.
- **Hyphenate headings only.** Long words in body text inside a narrow card break at random letters too.
- **`overflow-wrap: anywhere`.** It also changes min-content sizing, but it still splits words with no hyphen.
- **Fluid type with `clamp()` and `vw`.** See decision 5.
