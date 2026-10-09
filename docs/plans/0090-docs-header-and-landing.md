# Plan 0090: Docs site header, sections and landing page

- **Status:** Implemented (reviewer APPROVE; AT and browser pass `pending`) (maintainer answers on Q3, Q6, Q7 recorded below)
- **Owner:** lead
- **Created:** 2026-10-08 · **Target:** docs site, pre-alpha
- **Related:** [design spec](../design/docs-landing-and-header.md), [prose-content-types](../design/prose-content-types.md), Plan 0076 (`kv-inset`, `kv-steps`), `regulations` skill

## Goal

Visitors reach Home, Docs, Components, Content types and Theming from one header on every page, and Home proves the claim "Accessibility is hard. Navigating the web without it is harder." with live demos made of KvirnUI itself, in our own voice and without naming anyone else.

## Non-goals

- Patterns section (maintainer deferred; no `/patterns` route, no menu item). Blocks, reference site (Plan 0053), search, component index summaries/status (Q8, later).
- New tokens, theme.css changes, new dependencies, moving existing URLs.
- Claiming AT results or legal compliance. Wording: "designed and tested to meet WCAG 2.2 AA"; manual AT matrix `pending`.

## Background

Today's header (`site-shell.tsx:26-53`) has brand, Menu and Display settings; the sidebar (`site-navigation.tsx`) lists Introduction, Foundation and 7 component groups; Home (`app/page.tsx`) is a placeholder. The spec holds the research (internal, never in site copy), IA, copy, visual spec, annotations and contract. Read it; this plan only records scope and decisions.

## Design

Spec: [docs-landing-and-header.md](../design/docs-landing-and-header.md) §3 (IA), §4 (copy), §5 (structure), §6 (visual), §7 (annotations), §11 (contract). Summary: sections come from one data file (`components/site-sections.ts`); the sidebar shows only the active section; a section with no pages is not rendered; every href has a route file. Home is proof-first: hero with the fixed headline beside a transcript of what a screen reader may announce, counted facts, three live demos (keyboard and error recovery, six languages, the user's own display settings), breadth, method, honest pre-alpha status.

**Header items (5):** Home `/`, Docs `/docs` (new Get started; `/foundation/kvirn-provider`, `/foundation/locales`), Components `/components` (new index; 56 pages), Content types `/content-types` (new; inset text, steps, images and media), Theming `/foundation/theming`.

### Accessibility contract

The header-navigation and landing tables in spec §11 are the contract (landmarks, one `aria-current` per nav, Menu `aria-expanded`/`aria-controls`, no arrow keys on the nav, ErrorSummary focus in the keyboard demo, polite `Alert.Success` only). Delta from the spec: no Patterns row.

### i18n strings

Docs-app catalog only (`messages/en.ts`, `messages/home.ts`, `messages/content-types.ts`); the docs site is English. No library strings added. Demos use existing library messages (`alert.warningPrefix`, error summary) per locale.

## Tasks

- [x] Design spec (ux-designer), research internal only
- [x] **T1 Shell, sections, Docs and Components indexes** (component-engineer). Per spec §8 T1; no Patterns entry in `site-sections.ts`.
- [x] **T2 Landing** (component-engineer, after T1). Per spec §8 T2 with the Q7 change below (no screen-reader test), no tests at all (maintainer). `vp check` of its files green; page not yet rendered or axe-run.
- [x] **T3 Content types** (component-engineer, after T1, parallel with T2). Per spec §8 T3.
- [ ] `DESIGN.md`: add the docs landing's decorative bar to the `accent` use (lead, one Edit)
- [ ] Gates: `vp check`, `vp test run` (changed files), `i18n:check`, `theme:check`
- [ ] `accessibility-reviewer` on the diff
- [ ] `docs/design/README.md` row done; `docs/roadmap.md` line; `vp fmt`
- [ ] Manual AT matrix and usability test: `pending`

## Decisions

- **Plan number 0090.** `docs/roadmap.md:82` already cites 0089 for DateRangePicker.
- **Q2 keep URLs.** `/foundation/*` stays; membership is data. Redirects later if wanted.
- **Q3 Patterns deferred (maintainer).** Five menus. The roadmap puts patterns at M4. The data-file guard means adding it later is one entry plus pages.
- **Q4 "Get started" uses the service-link look** (`kv-link--service`): it is the one start action and must not look like a button. Lead's call, no token change.
- **Q5 landing-only hero size** (3.5rem from 64rem, 2.75rem from 40rem) in the docs app's CSS, not theme.css. Docs-only override, no token; lead's call.
- **Q6 `accent` in the decorative hero bar (maintainer: yes).** Add the use to `DESIGN.md`. `theme.css` untouched, no new pair; decorative, carries no information.
- **Q7 no `@guidepup/virtual-screen-reader` in apps/docs (maintainer: no, "it's just a test").** The transcript is hand-kept, labelled as an example of what a screen reader may announce ("approximately"), and not asserted equal to a screen-reader read. No dependency changes.
- **T1 implementation.** `SiteSection.pages` includes the index page; the guard "no pages, not rendered" filters on it, and Home is a one-page section. `SiteShell` takes optional `sections` and `layout` (default `landing` at `/`); `findActiveSection` matches exact paths. The Menu always renders; CSS hides it from 64rem, and from 40rem when the section has no sidebar (`data-sidebar`). The route guard lives in node test `site-sections.test.ts` (fs), with the four Content types hrefs as a named pending exception until T3. Axe is not run in `site-shell.test.tsx` (no theme CSS there, so target-size fails); stories and the sweep cover it.
- **Q8 deferred.** The Components index lists names by group only.
- **Honest numbers.** Facts (56 components, 6 locales, 4 themes, 3 dependencies, 0 CSS, 0 tracking) are derived from source in tests (sections data, i18n locales, core dependencies), and Sámi is shown as mostly English placeholders. Dependency count comes from the core `package.json`.
- **T3 content types.** One shared `ContentTypePage` outline; copy in `messages/content-types.ts`. Live examples sit in `kv-prose` with `lang="en"` (the stage takes the example locale). Step headings in the example are `h3`, the same level as the frame caption. The figure example uses an inline SVG data URI (no file, no request). The index links Prose at `/components/prose`. Not added to `site-sections.ts` (T1 owns it).
- **T2 implementation.** Files in `components/home/` (band, hero, transcript, facts, keyboard, languages and settings demos, breadth, method, start, demo wrapper), `messages/home.ts`, `app/home.css`, `lib/home-facts.ts` (server-only, counts core's dependencies from its `package.json`). Counts: components from `componentGroups`, languages from `localeCodes`, dependencies from core; themes (4) and the zeros are constants. `ExampleErrorBoundary` is exported from `example-frame.tsx` for the demos. Each demo sits in `Demo`: an error boundary, and CSS swaps it for `home.noScript` while `<html>` has no `data-kv-color-scheme` (no JavaScript). The transcript lines are built from the site's own data (section labels, header strings, `en.skipLink.label`), kept by hand otherwise. The transcript `ol` and the language transcript `ol` keep their numbers (lint allows `role="list"` on `ul` only). Spec copy changed: `transcriptNote` (not recorded with a screen reader, Q7); facts split into a number and a sentence; Table, Rich text editor and Read aloud split into name and description so only the name links. The Components group cards link `/components#<group id>`, which exist as `h2` ids on the index. The keyboard form keeps the form mounted and shows `Alert.Success` below Continue, so focus is never lost; Start again re-keys the form and focuses the registration field. Not rendered, axe-run or visually checked yet.
- **No competitor names or comparisons** in any copy; the research table stays in the spec marked internal.

- **Review round 1 fixes.** Transcript `figcaption` is the first direct child of the Card's `figure`. The Sámi demo tests `Intl.DateTimeFormat.supportedLocalesOf('se')` at runtime; if unsupported the date takes the browser locale in `lang` and the note drops "and the date" (`languages.samiNoteNoDate`). The settings specimen link is "About the Link component" → `/components/link`, and the specimen is a `fieldset` with a `legend` (lint forbids `role="group"` on a div). Two Menu buttons share state; CSS shows one: below 40rem it controls site nav + sidebar, from 40–64rem only the sidebar (rendered only when a sidebar exists). Get started copy lives in `messages.docs.getStartedPage`. Nav targets are already 44px below 64rem (`kv-compact` applies from 64rem in theme.css), so no change.
- **Hydration fix (maintainer's browser run, 2026-10-08).** `Band` and the other `components/home/*` files were Server Components passing `render={<section />}` (and `<ul>`, `<li>`, `<p>`, `<figure>`) to client parts; the element was dropped on the client, so the server's `<section>` hydrated against a `<div>`. All `components/home/*.tsx` are now `'use client'`, as `SiteShell` already was. `countCoreDependencies` stays in `app/page.tsx` (server). The keyboard demo's `Field.HelpText` moved after `TextInput` (the library's own dev warning, 1.3.2).
- **Docs pages, maintainer requests 2026-10-09 (lead, no agent tool):** (1) the sidebar's surface bleeds to the screen edge from 64rem (`.docs-sidebar::before`, decorative); (2) "On this page" is sticky from 80rem (`position: sticky`, scrolls within the viewport) and lists the `h3`s under each `h2` as a nested level (`PageSection.children`; `contractSectionList` adds the Accessibility sub-sections, the Keyboard headings and "Change the text"); the current heading was already marked by the library's `TableOfContents` (`aria-current="location"`, primary fill); (3) every section heading with an id gets its own link (`AnchoredHeading`: a `#` link inside the heading named "Link to <section>", shown on hover and focus, always shown without hover and in forced colours; inside the heading so prose's `h2 + *` spacing holds). Follow-up: the 25 `level={3} id=` headings written directly in `*-page.tsx` files still use plain `Heading`; switch them to `AnchoredHeading` page by page.
- **Contents highlighting, verified in Chromium with Playwright (2026-10-09):** the current entry lagged one section behind because a jump lands a heading at 40px (html `scroll-padding` 16px + the heading's `scroll-margin` 24px) while the list's `offset` was 0, so the jumped-to heading never counted as reached. `offset={40}` now equals the landing position. Two core fixes in `getActiveHeading`: at the end of the page a heading sitting exactly on the line wins over "the last heading" (the Locales page's "Change the text" used to light "Use a language"); documented in `table-of-contents.md` and `.a11y.md`, tested, changeset added. Probe result: every jump and click marks its own entry; plain scrolling tracks.
- **Pre-existing build warning, not this plan:** Turbopack warns on `::highlight(kv-read-aloud)` in `theme.css:3683,3689` (Plan 0088). Unchanged here.

## Risks & open questions

- Landing is large for one brief; if T2 stalls, split demos (`components/home/demos`) from static sections, same file ownership rule.
- Hand-kept transcript could drift from real announcements; the label "an example" and its source note keep it honest.
- Fact "4 themes" and the Sámi note must be re-checked against source at T2 time.
- Header at 320px with 5 items plus Menu and Display settings: verify wrap and 44px targets in review.

## Testing strategy

**No new tests in the docs site (maintainer, 2026-10-08).** The tests T1 and T3 wrote were deleted. Quality comes from `vp check`, the existing library gates, and `accessibility-reviewer`.

## Scope changes (maintainer, 2026-10-08)

- **Six menus again:** Home, Docs, Components, Patterns, Content types, Theming. Patterns and Content types ship as blank pages (an `h1` only) for now; the inset text, steps and images pages, their components and messages were removed. This supersedes the Q3 "defer" answer and the T3 task.
- **T2 (landing)**: the first run was stopped by the maintainer before it wrote anything; the maintainer then said "t2, no tests" and it was restarted with no tests. The Non-goals line about Patterns and the Q3 and T1 lines above are superseded by this section: six menus, Patterns and Content types are blank pages.

## Rollout

Docs app only, no package change, no changeset.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] `accessibility-reviewer` APPROVE
- [ ] Plan ticked, `docs/roadmap.md` and `docs/plans/README.md` current
