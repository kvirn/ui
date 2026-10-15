# Plan 0118: Back to top on the docs site

- **Status:** Done (gates green, reviewer APPROVE 2026-10-15; browser focus-scroll check and AT run `pending`)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-15 · **Target:** docs site
- **Related:** `apps/docs/components/site-shell.tsx`, WCAG 2.4.11, 2.4.3, 2.5.8, 2.3.3

## Goal

A reader of a long component page can return to the top from anywhere with one control that stays in view, without scrolling back by hand.

## Non-goals

- A library component or a pattern in `@kvirn-ui/patterns`: this is docs-site chrome only.
- Landing pages (short, no article). Article layout only.
- A contents-list link, a scroll-progress indicator, a "jump to next section" control.
- Translating the docs shell: its strings are one English object `apps/docs/messages/en.ts`.

## Background

- Shell: `site-shell.tsx:185-193` renders `<main id="main" ref={mainRef}>`; the `article` layout is `className="docs-main"`. The contents list is already sticky at >= 64rem (`docs.css:486`).
- No back-to-top exists. `site-footer.a11y.md:39` says the Site footer pattern has none: still true, this lives in the docs shell, not the pattern.
- The comment at `site-shell.tsx:92` says "Nothing is sticky (2.4.11)". It is already wrong for the contents list and is updated here.
- Icons: built-in `chevron-up` (`built-in-icons.tsx:13`). There is no arrow-up and no IconButton: use `Button` with an `Icon` and a visible label.

## Design

### Behaviour

A native `<button type="button">` rendered once, after `<main>` and before the footer, in the `article` layout only. Fixed at the block-end, inline-end corner. Not rendered into the tab order until the page is scrolled past 1.5 viewport heights (`hidden` attribute off); hidden again at the top. Visible label "Back to top" with a decorative `chevron-up`, so it needs no tooltip.

Activating it scrolls to the top and moves focus to `<main>` (`tabindex="-1"`, same target as the "Skip to main content" link), so focus is never lost to `<body>` when the button hides.

### Accessibility contract (draft)

| Key         | Action                                                   |
| ----------- | -------------------------------------------------------- |
| Tab         | Reaches the button once visible, after the page content  |
| Shift+Tab   | Back to the last control in the content                  |
| Enter/Space | Scroll to the top; focus moves to main; the button hides |

- Role: native button, name "Back to top". No ARIA, no live region (it appears on scroll, a status announcement would be noise).
- Hidden state: `hidden`, so it is out of the tab order and the accessibility tree at the top.
- Focus management: on activation focus goes to `main`, never to `body`.
- Motion: `scrollTo` uses `behavior: 'smooth'` unless `prefers-reduced-motion: reduce`, then `auto` (2.3.3).
- 2.4.11 Focus Not Obscured: `scroll-padding-block-end` on the root is at least the button's block size plus its offset, so a focused control scrolled into view is never hidden behind it. Decision approved by the maintainer with this safeguard.
- 2.5.8 target size: at least 44px high, 24px minimum.
- 1.4.10 reflow: at 320px the label stays, the button stays within the viewport and wraps nothing.
- Print and forced colours: not rendered in print (`@media print`); the Button's own forced-colours styling applies.
- WCAG SCs: 2.4.11, 2.4.3, 2.5.8, 2.3.3, 1.4.10, 2.1.1.

### i18n strings

| Key (`messages/en.ts`) | en          |
| ---------------------- | ----------- |
| `backToTop`            | Back to top |

Docs shell strings are English only (see Non-goals); `i18n:check` covers `packages/i18n`, not this.

### Theming surface

Class `docs-back-to-top` in `docs.css` (docs-only). Tokens only: `--kv-space-*`, existing Button classes. No new token, no `theme.css` change, no raw colours.

## Tasks

- [x] `apps/docs/components/back-to-top.tsx`: component, takes `mainRef`, visibility from scroll position (passive listener or IntersectionObserver on a sentinel: the engineer picks, records why)
- [x] `apps/docs/components/back-to-top.test.tsx`: hidden at top; appears after scroll; activation scrolls to top and focuses main; reduced motion uses `auto`; axe clean in both states
- [x] Render it in `SiteShell` article layout only, update the `site-shell.tsx:92` comment; extend `site-shell.test.tsx` only for "present in article layout, absent in landing"
- [x] `docs.css`: `.docs-back-to-top` fixed position, `scroll-padding-block-end` on the root, `@media print` hide
- [x] `messages/en.ts`: `backToTop`
- [x] Gates (`vp check`, `vp test run` scoped), `accessibility-reviewer` on the diff

## Decisions

- **Floating button, not a link in the contents list or both** (user, 2026-10-15): the only option that follows the reader on phones and narrow windows; the contents list is sticky only at >= 64rem. The a11y trade-off (a fixed element near 2.4.11) is accepted with the safeguards above.
- **Button + `scrollTo` + focus main, not `<a href="#main">`**: no URL hash churn on every use; focus is moved on purpose.
- **Article layout only**: landing pages are short and have no article.
- **No `ux-designer` spec**: one existing Button in one corner, no new tokens or flow. `accessibility-reviewer` covers the visual a11y.
- **No test of `scroll-padding` or position**: CSS, out of scope per rule 13. It is checked by the reviewer and in the real page.
- **Visibility by a passive `scroll` listener on `window`, not IntersectionObserver** (engineer): the threshold is 1.5 viewport heights, which a sentinel cannot express without a resize-dependent offset; one cheap `scrollY` compare is simpler and also runs once on mount.
- **The button stays rendered while it has focus** (reviewer): scrolling to the top with Home or the wheel would otherwise hide a focused control and drop focus to `body` (2.4.3).
- **`main` gets `tabindex="-1"` on activation if it has none**, so focus lands on it whether or not `useRouteFocus` set it.
- **Test fixture puts the last link after the spacer** (lead, 2026-10-15): with the link at the top, `focus()` scrolled to it, the button hid and Tab had nowhere to go, an intermittent failure when two browser files ran in parallel. The focus-on-hide test now waits two frames so it fails on the old rule (checked by mutation).

## Risks & open questions

- The button can cover the end of a line of text on narrow screens while it is visible. Accepted; the control is small and at the inline-end edge.
- Code blocks scroll horizontally on their own; the button must not cover their scroll area's focus ring. Reviewer to check.

## Testing strategy

Browser-mode component test in the docs app. Scroll is simulated by setting `window.scrollY`/document height or via real scrolling in Chromium; axe on both states. No story (docs site has none).

## Rollout

Docs site only. No public API, no changeset.

## Done when

- [x] `vp check` and `vp test run` green on the changed files
- [x] `accessibility-reviewer` APPROVE
- [x] Plan ticked, row in the README. No `docs/roadmap.md` line: the roadmap tracks library components, and no docs-site row fits
