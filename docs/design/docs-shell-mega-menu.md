# Design spec: docs shell, concept C: mark, mega menu, search in the masthead, page intro, no sidebar outside Get started

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-11
- **Plan:** to be written (links this spec in its Design section)
- **Type:** docs page chrome (`apps/docs` only; no library, token or `DESIGN.md` change)
- **Reference:** the prototype below is the visual reference wherever this spec is silent. Its mention of `docs-shell-concepts.md` and the footer's concept links are prototype-only and not built.
- **Source:** [prototypes/docs-shell-c-mega-menu.html](prototypes/docs-shell-c-mega-menu.html), chosen by the maintainer (2026-10-11), with its shared CSS and JS.
- **Supersedes:** [docs-header-bands.md](docs-header-bands.md) §5 (three bands become two: the nav moves into the masthead); the sidebar of [docs-landing-and-header.md](docs-landing-and-header.md) §5 and [docs-site.md](docs-site.md) §5 in every section except Get started (§5.1); the "nothing sticky" rule of docs-header-bands.md §3 for the contents column only. Their tokens and contrast (docs-header-bands.md §6), Display settings, route focus and new-tab rules stand.

## 1. Brief

- **Users:** evaluators and integrators (docs-site.md §1). **Hardest case:** a Finnish accessibility consultant on NVDA, keyboard only, at 400% zoom (320 CSS px), English as a second language, looking for one component's keyboard contract.
- **Job:** _When I land on a component page, I want to see what it is, how mature it is and where it sits, then jump to any other component without hunting through a sidebar._
- **Maintainer decisions (not reopened):** the mark in a rounded square; the topics open mega panels (MainMenu, APG Disclosure Navigation); search at the end of the masthead row; a page intro band (breadcrumb, `h1`, lead, facts); **no left sidebar, except Get started, which keeps three columns** (sidebar, article, contents); facts with a Pattern row (as the prototype); Status kept; a sticky contents column (as the prototype); the footer and the previous/next pager from the prototype; a first-draft mark and favicon ([assets/](assets/)), to iterate on.
- **Success:** in the test (§8, `pending`), ≥ 80% reach a named component from another component page in ≤ 2 activations; 0 lose focus inside an open panel; ≥ 80% can say where they are (breadcrumb) and whether the component is ready.
- **Assumptions → research questions:**
  - Losing the sidebar doesn't hurt wayfinding inside a section, because the panel, breadcrumb and pager replace it → RQ: do participants find a sibling page without the sidebar?
  - 60+ links in the Components panel are scannable as 7 labelled columns → RQ: time to find "DateRangePicker" in the panel vs the search.

## 2. Prior art

| Source                                                                                                                                                                                                                  | Reuse                                                                           | Change and why                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `MainMenu` (`main-menu.a11y.md`), `SiteHeader` primary, `SiteSearch`, `ApplicationLogo` in `@kvirn-ui/patterns`; `TopBar` in `@kvirn-ui/react` (Plan 0104)                                                              | All behaviour: one topic open wide, Escape, focus-out close, `data-trail`, Menu | None to the patterns. The docs app composes `SiteHeader.Menu` **inside** the `Masthead` (§5) instead of as a third band |
| [APG Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)                                                                                                        | Buttons that show lists of links; no `menu` roles                               | No arrow keys (MainMenu's recorded deviation)                                                                           |
| `Breadcrumb` (`@kvirn-ui/react`), DESIGN.md Breadcrumb                                                                                                                                                                  | The trail, separator, `aria-current="page"`, its i18n label "You are here"      | Omitted where it would be one item                                                                                      |
| GOV.UK [Service navigation](https://design-system.service.gov.uk/components/service-navigation/) and [Pagination](https://design-system.service.gov.uk/components/pagination/) (block style for "previous / next page") | Previous and next as two labelled links with the page title under the direction | Card edge with `border-subtle`, as the prototype                                                                        |

## 3. Flow and unhappy paths

1. Component page → read breadcrumb, `h1`, lead, facts → **Components** (topic) → panel → a component (2 activations). Or Search → results.
2. Reading on → **Next page** card → the next component in panel order.
3. Below 64rem: **Menu** → topics in flow → Components → panel in flow → link.

| Case                                         | Behaviour                                                                                                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Panel open, Tab leaves it                    | Wide: the panel closes (focus-out), so it never covers the focused element (2.4.11). Narrow: in flow, nothing closes                                                                                                                 |
| Panel open, press elsewhere                  | Closes (wide)                                                                                                                                                                                                                        |
| Panel taller than viewport                   | Positioned in the document, not fixed: the page scrolls with it                                                                                                                                                                      |
| JavaScript off / not hydrated                | Menu panel renders open before hydration (site-header.a11y.md). Topic panels can't open without JS: the footer's **Sections** nav and each section index are the route. Engineer to confirm what `MainMenu` renders before hydration |
| Section with one page                        | Plain link, no topic (Patterns, Theming)                                                                                                                                                                                             |
| First / last page in section                 | Only Next / only Previous. The pager never crosses sections                                                                                                                                                                          |
| Section index, group page, home, search, 404 | No pager. Breadcrumb only when it has ≥ 2 items. 404: no trail, no breadcrumb                                                                                                                                                        |
| Empty search submit                          | Unchanged: the search page's hint (`docs.search.hint`)                                                                                                                                                                               |
| Deep link `#id`                              | Header not sticky. The contents column is sticky only beside the article from 80rem, never over it                                                                                                                                   |
| Get started page                             | Keeps its sidebar (its 4 pages), so siblings are one Tab stop group away, as today                                                                                                                                                   |

## 4. Content

The docs catalog (`apps/docs/messages/en.ts`) is English-only by decision (docs-site.md §4); no sv/fi rows needed. Longest strings checked against the prototype at 320px: "Testing with assistive technology" and "Choice and overlays" wrap cleanly.

| Key (`docs.*`)                                                                                                                  | en                                  | Notes                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `header.*`, `nav.menuButton`, `nav.sections.*`, `nav.allComponents`, `nav.componentGroups.*`, `nav.contentTypeGroups.*` (exist) | –                                   | Reused as is. `allComponents` is the Components overview link           |
| `nav.allContentTypes` **new**                                                                                                   | All content types                   | Content types overview link                                             |
| `nav.sidebarButton` (exists)                                                                                                    | Pages in Get started                | Kept: the Get started sidebar's button below 64rem                      |
| `pager.label` **new**                                                                                                           | Previous and next page              | `nav` name                                                              |
| `pager.previous` **new**                                                                                                        | Previous page                       | Small line above the title; the link's name is "Previous page Tabs"     |
| `pager.next` **new**                                                                                                            | Next page                           |                                                                         |
| `facts.package` **new**                                                                                                         | Package                             | `dt`                                                                    |
| `facts.pattern` **new**                                                                                                         | Pattern                             | `dt`; row omitted when the page gives no pattern                        |
| `facts.atTesting` **new**                                                                                                       | Testing with assistive technology   | `dt`                                                                    |
| `facts.pending` **new**                                                                                                         | Pending                             | `dd`. Never "Passed" until the AT matrix is recorded (AGENTS.md gate 6) |
| `status.label` + status words (exist)                                                                                           | Status · Alpha candidate …          | First fact (§6, Q3)                                                     |
| `footer.sectionsHeading` **new**                                                                                                | Sections                            | Footer `nav` name (`aria-labelledby` its `h2`)                          |
| `footer.projectHeading` **new**                                                                                                 | Project                             | Second footer `nav`                                                     |
| `footer.status` **new**                                                                                                         | `({ status }) => Status: ${status}` | → `/docs#status`                                                        |
| `breadcrumb.label` (`@kvirn-ui/i18n`)                                                                                           | You are here                        | Breadcrumb `nav` name, all 5 locales already                            |

## 5. Structure (DOM order = visual order; no CSS `order`)

```
[skip link → #main]
[header: banner]  SiteHeader.Root variant="primary"
  TopBar (primary-hover): "Latest: Pre-alpha" · nav "Tools" › Accessibility settings (Plan 0107; GitHub is in the footer)
  Masthead (primary):
    ApplicationLogo.Root › [svg mark, aria-hidden] Name "KvirnUI"  + Badge "Pre-alpha"
    SiteHeader.Menu › MenuButton "Menu" (< 64rem only) › MenuPanel (always shown ≥ 64rem)
      MainMenu.Root label "Site"
        Link Get started · Topic Components [panel] · Link Theming
    SiteSearch (search landmark) › label "Search the documentation" · field · Search
[main#main]
  intro band (surface, full width): Breadcrumb · h1 · p.kv-lead · dl facts · [status sentence]
  wrap: [article (Prose)] [contents column ≥ 80rem]      ← Get started: ["Pages in Get started" button < 64rem] [sidebar nav "Get started"] [article] [contents]
  nav "Previous and next page"
[footer: contentinfo] brand + licence/claim/no-tracking · nav "Sections" · nav "Project"
```

**Mega panel (Components):** `MainMenu.TopicPanel` → list: `MainMenu.Overview` "All components" (own row, weight 600), then one `<li>` per group: the group link (`/components/<group>`, weight 600; a group with no page is a `Navigation.Label`, never a `#` link) and a nested list of its components, in `site-sections.ts` order. Content types: "All content types", then "Page types" with its 4 pages. Same data as today's sidebar; nothing new to maintain.

**Pager order:** the section's leaf pages in panel order (Components: Actions → … → Data and behaviour, components inside each; Get started: Get started → KvirnProvider → Locales and strings → Rendering). Group and index pages are not in the chain. Example: Tabs → previous TableOfContents, next Calendar.

**Breadcrumb trail:** section index › group page (if any) › current (`aria-current="page"`, plain text). Components › Wayfinding › Tabs; Get started › KvirnProvider.

| Width    | Top bar        | Masthead                                                                                                    | Intro / body                                                  | Footer          |
| -------- | -------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------- |
| < 40rem  | Wraps (2 rows) | Row 1 brand + Badge; row 2 Menu (full width); open: topics as rows, panels in flow; row 3 search full width | Facts stack one per line; contents list above the article     | One column      |
| 40–64rem | One row        | Brand + Badge, Menu; search wraps to its own row (max 22rem, end-aligned)                                   | Facts wrap in a row                                           | One column      |
| 64–80rem | One row        | One row: brand + Badge · topics · search (flex 1, max 22rem, at the end); wraps if needed                   | Contents list above the article, article max 48rem            | 2fr / 1fr / 1fr |
| ≥ 80rem  | One row        | One row                                                                                                     | Article max 48rem + contents column 14rem at the end (sticky) | 2fr / 1fr / 1fr |

Wide panels: a full-width band directly under the masthead (the header is the positioning context), over the page; 7 columns at 80rem, wrapping from `minmax(9rem, 1fr)`.

### 5.1 Get started: three columns

The `docs` section (Get started, KvirnProvider, Locales and strings, Rendering) keeps today's sidebar (`SiteNavigation`, its `aria-current` rules and its "Pages in Get started" Disclosure below 64rem), inside the new intro and pager. `hasSidebar` becomes true for this section only. Get started stays a plain link in the menu.

| Width    | Columns                                                                                      |
| -------- | -------------------------------------------------------------------------------------------- |
| < 64rem  | One: the sidebar button, the sidebar in flow when open, the contents list, the article       |
| 64–80rem | Two: sidebar 15rem · article; contents list above the article                                |
| ≥ 80rem  | Three: sidebar 15rem · article `minmax(0, 48rem)` · contents 14rem (sticky); gaps `space-10` |

The intro band stays full width above all three columns, so the `h1` and breadcrumb line up with the other sections.

## 6. Visual specification

Existing tokens only. Classes in `apps/docs/app/docs.css`; the pattern classes keep their `patterns.css` look.

| Part             | Tokens / style                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bands            | Top bar `primary-hover`, masthead `primary`, `on-primary` content and ring (docs-header-bands.md §6, unchanged). Masthead block padding `space-4`, gaps `space-3` / `space-8`                                                                                                                                                                                                                                                                                                                                                                |
| Mark (new logo)  | First draft: [assets/kvirn-mark.svg](assets/kvirn-mark.svg), inlined, 28 × 28 viewBox, 1.75rem: rounded square (rx 6) in `currentColor` (`on-primary` here, `text` on the footer canvas), the K as 2.5 strokes in the colour behind it (`primary` in the header, `surface` in the footer). Not `ApplicationLogo.Logo` (an `<img>` can't follow the theme): a decorative `<svg aria-hidden focusable="false">` child of `ApplicationLogo.Root` before the Name, class `kv-application-logo-mark`. Set `--kv-mark-cut` to the colour behind it |
| Brand name       | `kv-application-logo` look, 1.25rem, weight 600, underline on hover                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Badge            | `kv-badge` neutral, unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Topic / top link | Weight 500, `on-primary`, nav-item height; chevron 1rem after the label. Trail (`data-trail`): weight 600 + `on-primary` bar at block-end (patterns.css primary header, exists)                                                                                                                                                                                                                                                                                                                                                              |
| Mega panel       | DESIGN.md mega panel: `surface-raised`, `border-subtle` above and below, `--kv-shadow-popup`, square, `space-6` block padding, columns gap `space-6`                                                                                                                                                                                                                                                                                                                                                                                         |
| Panel links      | `text`, no underline at rest (nav-item rule), underline on hover, `space-1` block padding (≥ 24px target). Current: weight 600 + 2px underline. Group link and overview: weight 600                                                                                                                                                                                                                                                                                                                                                          |
| Search           | `SiteSearch` as shipped in the primary header: `canvas` field, `border-control`, `radius-md` start corners, button keeps its word                                                                                                                                                                                                                                                                                                                                                                                                            |
| Intro band       | `surface`, full width, `border-subtle` below; padding `space-6` / `space-8`                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Breadcrumb       | DESIGN.md Breadcrumb (`link` items, `text-muted` chevron, current weight 600)                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `h1`             | `PageHeading size="display"`: serif, `display` role, `heading` colour, hyphenates; steps down below 40rem (DESIGN.md)                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Lead             | `kv-lead`, max 60ch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Facts            | `dl` in a wrapping row, gap `space-2` / `space-6`, `body-small`: `dt` `text-muted`, `dd` `text` weight 500, package in `font-family-mono`. Status `dd` is the existing Badge word                                                                                                                                                                                                                                                                                                                                                            |
| Status sentence  | `body`, `text`, under the facts (from `statusTexts`), only when the status isn't stable                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Contents column  | Existing `TableOfContents` look, sticky at `space-6` from 80rem                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Pager            | Two `Link` cards: `border-subtle` 1px, `radius-lg`, `space-4` padding; small line `body-small` `text`, title `body-large` weight 600 `link`; Next aligned to the end from 40rem; `space-12` above                                                                                                                                                                                                                                                                                                                                            |
| Footer           | `surface`, `border-subtle` above, `space-10` block padding, `body-small`; headings `body` weight 600 sans                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Favicon          | First draft: [assets/kvirn-icon.svg](assets/kvirn-icon.svg) → `apps/docs/app/icon.svg` (Next.js app icon). Static, so raw palette values: `primary-500` square, white K (5.57:1). A rebrand replaces the file                                                                                                                                                                                                                                                                                                                                |

### States

| Part           | default               | hover                             | focus-visible                 | open / current                                                        |
| -------------- | --------------------- | --------------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| Topic button   | weight 500            | 2px underline                     | `on-primary` ring with offset | chevron rotates 180°, `aria-expanded`; trail bar if it holds the page |
| Panel link     | `text`, no underline  | underline                         | normal `focus-ring`           | current: weight 600 + 2px underline, `aria-current="page"`            |
| Pager card     | `border-subtle`       | underline + `border-control` edge | normal ring with offset       | –                                                                     |
| Menu (< 64rem) | outlined `on-primary` | `primary-hover` fill              | `on-primary` ring             | `aria-expanded="true"`                                                |

No disabled, invalid, loading or empty states. **Motion:** none (the chevron flips without a transition).

### Modes

- **Dark / contrast themes:** every pair is an existing measured one; dark-contrast's `on-primary` is black, so the mark becomes a black square with a `primary-200` K, as intended.
- **Forced colours:** bands drop to `Canvas` with a `CanvasText` edge (exists); trail bar `LinkText` (exists); panel `CanvasText` border (exists); pager cards `LinkText` border; intro band `CanvasText` edge below. Mark: `rect { fill: currentColor }`, `path { stroke: Canvas }` so the K survives.
- **RTL:** logical properties; breadcrumb separator mirrors (shipped); chevrons don't mirror; Next sits at the inline end.
- **320px / 400% / 1.4.12:** everything wraps, no fixed heights; header ≈ 5 rows closed, scrolls away; panels in flow.

### New or changed tokens

None. Pairs reused, all measured by `theme:check`: `on-primary` on `primary` and `primary-hover` (DESIGN.md floor 4.5 / 7; light `#ffffff` on `#0066cc` is 5.57:1); the `canvas` search field against `primary` (non-text, 3:1, as already shipped in the primary header); `text-muted`, `link`, `text` on `surface` and `surface-raised` are DESIGN.md floors. The mark is decorative, part of a logotype (1.4.11 exempt).

## 7. Accessibility annotations

- **Landmarks:** `banner`; `nav` "Tools", `nav` "Site" (MainMenu), `search`; `main`; `nav` "You are here", `nav` "Get started" (sidebar, that section only), `nav` "On this page" (contents), `nav` "Previous and next page"; `contentinfo` with `nav` "Sections" and `nav` "Project". Every `nav` has a distinct name.
- **Names:** visible text = name (2.5.3). Mark `aria-hidden`; brand name "KvirnUI". Pager links: "Previous page TableOfContents". GitHub includes "(opens in a new tab)". `rel="prev"` / `rel="next"` on the pager.
- **`aria-current`:** one per nav. Site nav: `page` on a top link when it is the page, else the panel link (only while its panel is shown, MainMenu rule); the trail is visual. Breadcrumb: `page` on the last item. Contents: `location`.
- **Tab order ≥ 64rem (component page):** skip to main content → skip to site navigation → Latest → Accessibility settings → KvirnUI → Get started → Components → [open: All components → Actions → Button … Table] → Patterns → Content types → Theming → search field → Search → breadcrumb links → contents → article → Previous → Next → footer.
- **Tab order, Get started ≥ 64rem:** … Search → breadcrumb → sidebar nav "Get started" → contents → article → Previous → Next → footer. Below 64rem the "Pages in Get started" button comes before the contents.
- **Tab order < 64rem:** skip to main content → skip to site navigation → Latest → Accessibility settings → KvirnUI → Menu → [open: the five items, open panels in flow] → search field → Search → main.
- **Keys:** MainMenu and SiteHeader contracts unchanged (Enter/Space toggle, Escape closes and returns focus to the button, no arrows). Links: Enter.
- **Focus moves:** none on open; route change → `h1` (`useRouteFocus`); following a link closes every panel and the Menu.
- **Announcements:** none.
- **SCs:** 1.3.1, 1.3.2, 1.4.1 (current by weight + underline/bar), 1.4.3, 1.4.10, 1.4.11, 2.4.1, 2.4.3, 2.4.5 (search, menu, breadcrumb, pager), 2.4.8 (AAA, breadcrumb), 2.4.11, 2.5.3, 2.5.8, 3.2.3, 3.2.6.

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blockers (no hover-open; panel never covers focus; current not by colour; no new colour pair; every string keyed).
- [x] No new colour pair; orchestrator runs `vp run theme:check` and `vp run i18n:check` after the build.
- [ ] Usability test. Result: `pending`.

**Test plan (`pending`):** 6 participants: 2 keyboard-only, 1 NVDA + Firefox, 1 ZoomText at 400%, 1 Windows contrast theme, 1 second-language (fi) reader. Tasks: (1) From Tabs, open DateRangePicker. (2) Which group is Tabs in, and is it ready for a live service? (3) Read the next component after Tabs. (4) Find the component that uploads files without the menu (search). Measure: completion, activations, focus lost in an open panel (target 0), sidebar missed (think-aloud).

## 9. Decisions (maintainer, 2026-10-11)

| #   | Question                                | Decision                                                                                            |
| --- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Q1  | Get started's 4 pages without a sidebar | Get started keeps a three-column layout (§5.1); it stays a link in the menu                         |
| Q2  | A "Pattern" fact                        | Kept, as the prototype: optional `pattern` on `ComponentPage` ("APG Tabs"), row omitted when absent |
| Q3  | Status in the facts                     | Kept, with the status sentence                                                                      |
| Q4  | Sticky contents column                  | Allowed, as in the prototype                                                                        |
| Q5  | New logo for the footer and favicon     | Yes: first-draft SVGs in [assets/](assets/), to iterate on                                          |
| Q6  | The prototype's missing concepts doc    | The prototype itself is the reference                                                               |

## 10. Storybook patterns (maintainer, 2026-10-11)

The site header and the page header become `@kvirn-ui/patterns` patterns with stories, and the docs app composes them, so the library shows what the docs site uses. Pattern changes need a plan and updated `*.a11y.md` (AGENTS.md workflow); this is the design input.

### 10.1 Site header: the menu in the masthead (P2a change)

- **Layout:** `SiteHeader.Menu` may sit inside `SiteHeader.Masthead`, between the logo and `SiteSearch`. From 64rem the masthead is one wrapping row: logo + badge · topics · search (flex 1, max 22rem, at the end). Below 64rem, Menu is a full-width row and its panel opens in flow before the search. Two bands, not three. The three-band layout keeps working (no breaking change).
- **Grouped mega panel (P3 change):** a topic panel's list may hold groups: an `<li>` with a group link (or a `Navigation.Label` when the group has no page) and a nested list, laid out as columns `minmax(9rem, 1fr)`, gap `space-6`; overview on its own row. Group link weight 600; children as §6 Panel links.
- **Contract edits:** `site-header.a11y.md` row "three bands as plain divs in DOM order" also allows Menu inside Masthead; Tab order row: logo → topics (and open panel) → search field → Search. `main-menu.a11y.md`: nested group lists are lists of links; nothing else changes (no new keys).
- **DESIGN.md (maintainer approval):** Site chrome patterns, mega panel: "its children are nav items in columns" → "… in columns, optionally grouped under a group link or label at weight 600". No token change.
- **Stories** (`apps/storybook/src/patterns/site-chrome/site-header.stories.tsx`, its fictitious Kvirnby brand): `PrimaryMastheadMenu` (closed, 1280), `PrimaryMastheadMenuOpen` (a grouped topic open), `PrimaryMastheadMenuNarrow` (320, Menu open, a topic open), RTL and forced-colours variants. A `Keyboard` story already exists; extend it with Escape from a grouped panel.

### 10.2 Page header: a new pattern (P1a, `kv-page-header`)

| Part               | Element                                      | Notes                                                                                                 |
| ------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `PageHeader.Root`  | `<div>` (no landmark, no role)               | First child of `main`: the full-width `surface` band with a `Container` inside, `border-subtle` below |
| Breadcrumb         | the shipped `Breadcrumb`, as a child         | Optional; omitted when it would be one item                                                           |
| `PageHeader.Title` | `<h1>` (`Heading`, `display` size)           | The page's one `h1`; route focus target (`tabindex="-1"` from `useRouteFocus`)                        |
| `PageHeader.Lead`  | `<p class="kv-lead">`                        | Optional, max 60ch                                                                                    |
| `PageHeader.Facts` | `DefinitionList` with `kv-page-header-facts` | Optional; a wrapping row from 40rem, stacked below; `dt` `text-muted`, `dd` `text` 500, `body-small`  |

Visual as §6 (Intro band, Breadcrumb, `h1`, Lead, Facts); modes as §6 Modes. No keys of its own (links only). Text is children; no presentation props (AGENTS.md rule 14). Stories (`apps/storybook/src/patterns/site-chrome/page-header.stories.tsx`): `Default` (breadcrumb, title, lead, three facts), `TitleOnly`, `LongTitle` (Finnish compound, hyphenation at 320), RTL, forced colours. Docs: `ComponentPage` and the article pages render it instead of `PageHeading` + `kv-lead` + `StatusLine`.

## 11. Change (maintainer, 2026-10-11): Patterns and Content types inside Components

The Site menu is Get started · Components ▾ · Theming. The Components panel holds "All components", the 7 component groups, then **Patterns** (group link → `/patterns`; no children until pattern pages exist) and **Content types** (group link → `/content-types`, its 4 page types), last, so they wrap to their own row at 1280. The topic keeps the name "Components" and shows the trail on pattern and content-type pages too. The sections, breadcrumbs, pager and footer **Sections** list are unchanged. Open: rename the topic ("Library"?) if participants don't look for Patterns under Components (RQ for §8).

**Columns (maintainer, 2026-10-11):** the Components panel is 4 balanced columns from 64rem (2 from 40rem, 1 below). Groups flow down each column and then into the next, in DOM order (CSS multi-column, a group never split across columns), so there are no empty row gaps and the reading order is the visual order (1.3.2). A docs class on this panel, not a pattern change (AGENTS.md rule 14: columns are a consumer class).

## 13. Site search in the primary header (maintainer, 2026-10-11)

Five options were prototyped in [prototypes/search-in-header.html](prototypes/search-in-header.html): A tinted field, **B white pill (chosen)**, C white pill with an icon button, D search as a menu item opening a band, E a visible label. B: the rule in DESIGN.md Site chrome patterns ("The site search on a primary header"). It fixes the black (dark) or white (light) box that read as a hole in the band. Pairs: the white pill against `primary` 4.78:1 or more (1.4.11), `primary` text on `on-primary` 4.78:1 or more (1.4.3), the button's `on-primary` label on `primary` and `primary-hover` (existing pairs).

## 11. Built (Plan 0103; decisions taken during implementation)

- `MainMenu.Group` (`<li class="kv-mega-menu-group">`) and `MainMenu.GroupLink` (registers the trail like `MainMenu.Link`, is not a list item) exist because a group page can be the current page and its `data-trail` and only-while-shown rule must work. A group with no page uses `Navigation.Label`. Grouped-panel link underlines apply only to panels that hold a `MainMenu.Group`.
- The menu in the masthead is CSS on `.kv-site-header-masthead > .kv-site-header-menu`, no prop. Wide search wraps to its own row when the brand and topics fill the row; below 64rem it is full width.
- The intro band must sit outside the article and above the Get started sidebar, but pages render inside the shell's `main`. A portal (breaks server rendering) and a CSS breakout (fragile) were rejected: the shell passes sidebar, trail and pager down in a context and each page renders `DocsPage`.
- `SiteSection.groups` makes a section a topic, `overviewLabel` names its overview link, `sidebar: true` marks Get started. Menu, breadcrumb and pager all derive from `site-sections.ts`; the pager chain is a section's leaf pages (index and group pages have none).
- `PageHeader.Title` is `Heading as="h1" size="display"`; `Facts` is a `DefinitionList.Root`. `ComponentPage` takes `pattern` (only Tabs sets it) and keeps the status sentence under the facts unless the status is stable.
- Link look: `kv-button--link` is a class (Button has no `variant`). A top-bar fill sets the link look's on-colour in `patterns.css`; a disabled control in a fill keeps the on-colour with a dashed underline. Every `.kv-link` and `button` in a top bar is `inline-flex`, 24px minimum at every width, underlined on hover only.
