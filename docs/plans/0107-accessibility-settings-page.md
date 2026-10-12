# Plan 0107: Accessibility settings page (docs site)

- **Status:** Approved
- **Owner:** lead / component-engineer
- **Created:** 2026-10-12 · **Target:** docs site
- **Related:** spec [docs/design/accessibility-settings-page.md](../design/accessibility-settings-page.md) (the source of truth for copy, structure and states), plans 0092, 0099, 0106; skills accessibility, keyboard, regulations

## Goal

A reader of the docs site finds one "Accessibility settings" page that sets colour scheme, contrast and motion. The same page lists the keys the site uses, explains the skip links, and shows how to zoom and where the device settings are. A second skip link, "Skip to site navigation", is on every page.

## Non-goals

- No change to `packages/react`, `packages/core`, `packages/theme` or `packages/patterns` components ("don't touch the original components").
- No single-key shortcuts, no in-page text-size control, no overlay or widget features (spec §9 Q4, reviewer P3).
- No "Screen readers" section yet (Q7a). No translations: the docs catalog is en-only (Q8).
- No accessibility statement: this page isn't one and must not claim compliance.

## Background

- The top bar mounts `DisplaySettings.Compact` at `apps/docs/components/site-shell.tsx:110-112`. The only skip link is at `:96`.
- `SiteHeader.Menu` (`packages/patterns/src/site-chrome/site-header/site-header.tsx:127-146`) spreads `...otherProps` onto `div.kv-site-header-menu`, which is rendered at every width. So an `id` passed from site-shell lands on an always-visible element that holds the Menu button and the Site nav, with no package change.
- Pages: `PageWithContents` (`apps/docs/components/page-contents.tsx:73`) wraps `DocsPage`. Titles come from `messages.docs.meta.title({ page })` (`apps/docs/messages/en.ts:7`), as in `apps/docs/app/search/page.tsx:14`. Search lists pages through `allPages()` in `search/page.tsx` and `apps/docs/lib/search-index.ts:227`.
- Strings: `apps/docs/messages/en.ts`: header `:90`, `noScript` `:12`, `display.storageNote` `:139`. `DocsMessages` (`:313`) is `typeof messages.docs`.
- No viewport export in `apps/docs/app/layout.tsx`, so there is no `maximum-scale` (zoom is allowed).
- Shell tests: `apps/docs/components/site-shell.test.tsx` (`:112` checks the Tab order and includes "Display settings"; `:131` runs axe).

## Design

### Changes

1. **site-shell.tsx**
   - Remove `DisplaySettings.Compact`.
   - Add the link `Accessibility settings` → `/accessibility-settings` in the Tools nav after GitHub, with `aria-current="page"` on that route.
   - Add a second `<SkipLink href="#site-navigation">` after the main one, with the docs string as its children.
   - Give `SiteHeader.Menu` `id="site-navigation"`.
2. **site-footer.tsx:** add the same link to the "Project" list.
3. **New route `apps/docs/app/accessibility-settings/page.tsx`**, plus a component in `apps/docs/components/accessibility-settings-page.tsx`. It has six h2 sections, in the spec §5 order:
   - Display: a Card with `DisplaySettings.Panel` and its notes as children.
   - Keyboard: a table.
   - Skip links.
   - Zoom and text size: a table and three h3s.
   - Settings on your device: an Accordion of 4.
   - Report a problem: the GitHub link and `mailto:support@kvirn.com`.
4. **No JavaScript:**
   - The Panel is hidden and the `kv-alert kv-alert--info` note shows instead.
   - Key the hiding on `:root:not([data-kv-color-scheme])`, the pattern at `docs.css:456-466`.
   - Prefer a solution that doesn't edit `docs.css`, which has the maintainer's uncommitted edits. If that file has to change, the engineer reports it and doesn't commit.
5. **Strings:** every visible string goes in `apps/docs/messages/en.ts` under `docs.header.accessibilitySettings`, `docs.skipLinks.navigation` and `docs.accessibility.*` (spec §4). Key names (`accessibility.keys.*`) and the combinator "and" are strings too.
6. **Search:** register the page so `/search` and the index find it.
7. **Docs that change:**
   - `docs/design/docs-header-bands.md:148-149` and `docs/design/docs-shell-mega-menu.md:168-170`: update the Tab order.
   - `DESIGN.md:363` and `:437`: replace the "Display settings" example wording (no token change).
   - `docs/design/README.md`: add a row for the spec.

### Accessibility contract (draft)

No new keys. Native links, radios (DisplaySettings contract) and Accordion (its contract).

| Key       | Action                                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Tab       | From page load: Skip to main content → Skip to site navigation → Latest → GitHub → Accessibility settings → KvirnUI → …             |
| Enter     | On "Skip to site navigation": focus moves to `#site-navigation` at every width, so the next Tab is Menu (<64rem) or the first topic |
| Shift+Tab | Reverse                                                                                                                             |

- Roles / ARIA:
  - The entry link is an `<a>`; its visible text is its name. `aria-current="page"` appears only on `/accessibility-settings`, in the top bar and the footer.
  - The tables have header cells. Keys are in `<kbd>`.
- Focus management: the route change focuses the h1 (existing). Choosing a radio moves no focus and announces nothing.
- Announcements: none (no toast, no live region).
- WCAG SCs: 1.3.1, 1.4.4, 1.4.10, 2.1.1, 2.1.4, 2.4.1, 2.4.2, 2.4.3, 2.4.4, 2.4.6, 2.5.3, 2.5.8, 3.2.3, 3.2.4, 3.2.6.

### i18n strings

Spec §4 is the table (en only). The heading, link and h1 text is "Accessibility settings". The second skip link is "Skip to site navigation".

### Theming surface

None new. No tokens, no contrast pairs; existing `kv-*` classes only.

## Tasks

- [x] Tests first in `site-shell.test.tsx`:
  - The Tab-order row is updated (Display settings → Accessibility settings, plus the second skip link).
  - Skip to site navigation moves focus to `#site-navigation` at narrow and wide widths.
  - `aria-current` is on the settings route.
- [x] Tests first in `apps/docs/components/accessibility-settings-page.test.tsx`:
  - title, h1 and the six h2s in order;
  - the Panel is present;
  - choosing an option moves no focus and announces nothing;
  - the GitHub and email links;
  - no "compliant" or "fully accessible" wording;
  - axe.
- [x] site-shell and site-footer changes
- [x] Route, page component, strings
- [x] Register the page in search
- [x] Docs: the header-bands and mega-menu Tab order, the DESIGN.md wording, the design README row
- [ ] Rerun test task 1 "Make the site dark" (spec §8): `pending`, manual

## Decisions

The maintainer's decisions from 2026-10-12, recorded in spec §9:

- **Q1, link only:** the Compact dropdown is removed. The reviewer's option B (keep Compact with a link inside it) was weighed and not taken. Display goes first on the page to limit the extra step.
- **Q2:** the second skip link targets the site navigation on every page, not the Get started sidebar.
- **Q3:** the route is `/accessibility-settings`, keeping `/accessibility` free for a future statement.
- **Q4 (revised 2026-10-12):** was "no shortcuts". Access keys (S, N, 0) were tried and removed by the maintainer: the `jsx-a11y/no-access-key` lint rule stands, and accesskey is largely abandoned on the modern web. Ctrl/Cmd+K stays, to focus and select the search box. Reason: maintainer request; a modifier chord, so 2.1.4 doesn't apply; it overrides the browser's web-search key, an accepted trade-off following the docs-site convention. Platform rules (accessibility review): Apple platforms take Command+K only (Control+K is "delete to end of line" there), others Control+K only, detected in the effect; `aria-keyshortcuts` is `Meta+K` or `Control+K` to match and is removed on cleanup; the key matches `event.key` k/K or `event.code` KeyK for non-Latin layouts; only text-entry targets (textarea, select, contenteditable, text-type inputs) and an already-prevented event block it, so radios, checkboxes and buttons don't. Tested on the non-Apple path and, with `navigator.platform` stubbed, on the Apple path.
- **Q5:** feedback goes through GitHub and support@kvirn.com.
- **Q7:** the AbilityNet "My Computer My Way" link is in; the Screen readers section comes later; no "Try it" button.
- **Q8:** en only.

Taken during implementation:

- **The link is a `siteTools` entry** (`accessibilitySettingsHref`), so the top bar and the footer's Project list share it. `SiteToolLink` takes `pathname` and sets `aria-current="page"` itself.
- **No-JS hiding without `docs.css`:** a new `app/accessibility-settings/accessibility-settings.css`, imported by the route only, hides `.docs-display-panel` on `:root:not([data-kv-color-scheme])`. The note is a `<noscript>` (as in `layout.tsx`), so it needs no CSS.
- **Accordion before hydration:** the server markup has every panel plain `hidden` (closed) and the triggers do nothing, so the same stylesheet shows `.docs-device-accordion .kv-accordion-panel[hidden]` while the attribute is absent. With JS they stay closed until opened.
- **Not a `section`:** the Display Card is a plain `div` under the h2 (`PageWithContents` renders headings and content as siblings).
- **Search:** `allPages()` in `search/page.tsx` adds the page; no change to `search-index.ts`.
- **Roadmap:** `docs/roadmap.md` has no line for plans 0106 or 0107, so none was edited.

## Risks & open questions

- **The extra step to dark mode:** users who can't set an OS preference now need one more page. Mitigation: Display goes first on the page; rerun the test task.
- **How screen readers read two adjacent skip links and focus on the `tabindex=-1` wrapper:** goes in the manual AT matrix, `pending`.
- **Accordion triggers without JS:** they still say "collapsed" while the stylesheet shows the panels. Accepted: the site relies on JS, and no code changes.
- **Stale browser menu paths:** the copy has no version numbers and says "search your settings".
- **Accordion before hydration:** closed before JS runs; reachable without JS through the stylesheet (see Decisions).

## Testing strategy

Browser-mode Vitest in `apps/docs` (already a project). The checks are behaviour and axe only; no CSS assertions.

## Rollout

Docs site only. No public API change.

## Done when

- [ ] `vp check`, the scoped `vp test run`, `i18n:check` and `theme:check` are green
- [ ] `accessibility-reviewer` returns APPROVE
- [ ] Plan tasks are ticked and `docs/roadmap.md` is updated
