# Design spec: docs site header in three primary bands

> **Status note (2026-10-11):** the structure is built by the patterns: `SiteHeader` `variant="primary"`, `TopBar` and `ApplicationLogo` in `@kvirn-ui/patterns`, composed in `apps/docs` (Plan 0099). §6 (tokens, parts, states, contrast) is still the visual contract.

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-10
- **Plan:** to be written (links this spec in its Design section)
- **Type:** docs page chrome + design-language change (no new token; a maintainer-approved rule change, §6.4)
- **Changes:** supersedes [docs-landing-and-header.md](docs-landing-and-header.md) §5.1, the Header and Site nav rows of §6, and the header lines of §7 and §11. Its sections data, `aria-current` rule, Menu contract, route focus, nothing-sticky rule and JS-off fallbacks stand.

## 1. Brief

- **Users:** evaluators and returning integrators (docs-landing-and-header.md §1). **Hardest case:** the Finnish accessibility consultant on NVDA at 400% zoom (320 CSS px), English as a second language.
- **Job:** _When I land on any docs page, I want to see what this is, how mature it is, and where the code and examples live, so I can decide and move on in one step._
- **Layout model:** the Designers Italia header (screenshots in the brief) as built in Bootstrap Italia: slim bar, centre band, nav band. Layout only: no Italian brand, content, hero, breadcrumb, social links or search.
- **Maintainer decisions (not reopened):** all three bands are `primary` fills with `on-primary` content; top bar is `primary-hover`; top bar holds Latest + tool tabs; middle band holds brand + Badge and Display settings; bottom band holds the site navigation with an underline marker for the current section.
- **Success:** in the test (§8, `pending`), ≥ 80% say correctly what stage KvirnUI is at and reach GitHub or a section in one step; 0 lose the focus indicator in the header.
- **Assumptions:** a coloured header reads as "official site chrome" and separates it from content → RQ: do participants mistake band links for page content? The top bar's tools are useful enough to cost 2–3 Tab stops per page → RQ: do keyboard users mind them before the brand?

## 2. Prior art

| Source                                                                                                                     | Reuse                                                                                                                                                    | Change and why                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Bootstrap Italia [Header](https://italia.github.io/bootstrap-italia/docs/menu-di-navigazione/header/) (fetched 2026-10-10) | Three parts in one `header`: slim, centre, navbar; each `nav` named; `aria-current="page"`; burger with `aria-expanded`/`aria-controls` on small screens | No `aria-label` on links (visible text is the name, 2.5.3); new-tab links say so (their social links don't); no dropdowns in the nav band |
| GOV.UK [Service navigation](https://design-system.service.gov.uk/components/service-navigation/)                           | Section links behind "Menu" on small screens; current marked by a bar, not colour                                                                        | `page` vs `true` per DESIGN.md Navigation                                                                                                 |
| KvirnUI `Navigation` horizontal, Tabs indicator, `Disclosure`, `Badge`, `Link.NewTabNotice`, `kv-application-logo` metrics | Item heights and spacing, the straight indicator bar (`--kv-indicator-width`), brand size and weight                                                     | On a `primary` fill the current fill can't show, so the current item gets the bar in `on-primary` (§6.4)                                  |
| `packages/theme/patterns.css` P2 site header                                                                               | Not used. It is a canvas header still in maintainer review (Plan 0095), and the primary fill is a docs-site choice, not a library pattern                | Stays in `apps/docs/app/docs.css`. Promoting a primary-fill header variant to `patterns.css` is Q6                                        |

## 3. Flow and unhappy paths

1. Any page → read status in the top bar or the Badge → follow Latest, a tool tab, or a section link (1 step each).
2. Below 40rem: Menu → site nav (and the sidebar) opens in flow under the bands.

| Case                   | Behaviour                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript off         | All three bands render; the site nav is shown at every width; Menu and Display settings are hidden (existing `:root:not([data-kv-color-scheme])` fallback). No dead control |
| No Storybook URL       | The Storybook tab is not rendered (no URL in the repo today: Q3). The tools nav still has ≥ 2 items                                                                         |
| GitHub opens a new tab | Visible `Link.NewTabNotice` ("(opens in a new tab)") in the link text; `rel` added by Link                                                                                  |
| Display settings open  | Panel (existing Card) in flow, full width, between the middle and bottom bands; pushes the page down; not an overlay                                                        |
| Client navigation      | Menu closes, focus to the page `h1` (`useRouteFocus`, unchanged)                                                                                                            |
| Deep link `#id`        | Header isn't sticky; nothing covers the target (2.4.11)                                                                                                                     |
| Search added later     | Goes in the middle band's end group, before Display settings (§5). Band height is set by the brand row, which already fits a 44px field, so nothing shifts                  |

## 4. Content

The docs catalog (`apps/docs/messages/en.ts`) is English-only by decision (docs-site.md §4). sv, fi, nb, nn below are agent-written proposals for when the site is translated (Q5); native review `pending`.

| Key (`docs.header.*`)     | en                                  | sv                 | fi (longest)            | nb / nn                             | Notes                                              |
| ------------------------- | ----------------------------------- | ------------------ | ----------------------- | ----------------------------------- | -------------------------------------------------- |
| `toolsLabel` **new**      | Tools                               | Verktyg            | Työkalut                | Verktøy / Verktøy                   | Top-bar `nav` name: "Tools, navigation"            |
| `navLabel` (exists)       | Site                                | Webbplats          | Sivusto                 | Nettsted / Nettstad                 | Bottom-band `nav` name                             |
| `latest` **new**          | `({ status }) => Latest: ${status}` | Senaste: ${status} | Uusin versio: ${status} | Siste: ${status} / Siste: ${status} | One link; name = visible text                      |
| `status` (exists)         | Pre-alpha                           | Pre-alfa           | Esialfa                 | Pre-alfa / Pre-alfa                 | Reused by `latest` and the Badge                   |
| `tools.docs` **new**      | Documentation                       | Dokumentation      | Dokumentaatio           | Dokumentasjon / Dokumentasjon       | → `/`; not "Docs", which is a section (Q2)         |
| `tools.storybook` **new** | Storybook                           | Storybook          | Storybook               | Storybook                           | Only with a deployed URL (Q3)                      |
| `tools.github` **new**    | GitHub                              | GitHub             | GitHub                  | GitHub                              | → `https://github.com/kvirn/ui`, `target="_blank"` |
| `home` (exists)           | KvirnUI                             | –                  | –                       | –                                   | Brand link; the mark is decorative                 |

Reused: `docs.nav.menuButton` "Menu", `docs.display.button` "Display settings", `link.newTabNotice` from `@kvirn-ui/i18n` (all locales). `docs.nav.sections.*` unchanged.

## 5. Structure (DOM order = visual order at every width; no CSS `order`)

```
[skip link]                                    first Tab stop, on canvas (unchanged)
[header: banner]  one element, three bands as divs (no extra landmarks)
  band 1  top bar (primary-hover)
    a "Latest: Pre-alpha" → /docs#status (Q1)
    nav "Tools": ul role=list › Documentation (aria-current="true") · [Storybook] · GitHub (opens in a new tab)
  band 2  middle (primary)
    a.brand [mark aria-hidden] "KvirnUI"  +  Badge "Pre-alpha"
    end group: [search slot, later] · Menu button (when rendered) · Display settings trigger
    Display settings panel (Card, hidden until open; full row width)
  band 3  bottom (primary), id docs-site-nav
    nav "Site" (Navigation.Root): Home · Docs · Components · Patterns · Content types · Theming
[sidebar nav "<section>"] · [main#main] · [footer]
```

| Width    | Band 1                                                                        | Band 2                                                                                  | Band 3                                                     | Menu controls                      |
| -------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------- |
| < 40rem  | Wraps: Latest, then the tools row (≈ 2–3 rows of 44px). Never hidden: 3 links | Row 1 brand + Badge; row 2 Menu, Display settings (wraps)                               | Hidden until Menu opens; then a wrapping row of 44px items | `docs-site-nav` (+ `docs-sidebar`) |
| 40–64rem | One row: Latest at start, tools at end; wraps if Finnish needs it             | One row: brand + Badge at start, Menu (only with a sidebar) and Display settings at end | Always shown, wraps                                        | `docs-sidebar` only                |
| ≥ 64rem  | One thin row, compact (32px items)                                            | One row, comfortable height from the brand                                              | One row, compact                                           | – (no Menu)                        |

Why the top bar doesn't collapse into Menu at 320px: its links sit before Menu in the DOM, so revealing them from Menu would open content behind the user's focus; duplicating them inside the Menu would give two navs with the same links. Three short links wrapping costs one extra row.

## 6. Visual specification

All parts are `apps/docs/app/docs.css` classes. **Don't redefine `--kv-color-*` on the header**: the Display settings panel inside it must keep its normal tokens. Style band parts by class.

| Part                   | Tokens                                                                                                                           | Density / size                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Header                 | No `border-subtle` edge (the fill ends the header); inner width `--docs-page-max`, inline padding as today's `docs-header-inner` | Not sticky                                                                        |
| Band 1 fill            | `primary-hover`                                                                                                                  | Items at control height; `kv-compact` from 64rem (32px), comfortable below (44px) |
| Band 1 text            | `on-primary`, `body` role (no `body-small`: these are essential links)                                                           |                                                                                   |
| Latest link            | `on-primary`, **underlined at rest** (not in a nav, and `link` colour is unusable here)                                          | 24px min target at 64rem+, 44px below                                             |
| Bands 2 and 3 fill     | `primary`                                                                                                                        | Band 2 block padding `space-4`; band 3 none (items carry height)                  |
| Brand                  | `kv-application-logo` metrics: `heading-4` size, weight 600, serif; colour `on-primary`; mark 2.5rem in `currentColor`           | Underline on hover only (nav-like position cue: brand slot)                       |
| Badge                  | Unchanged neutral `kv-badge` (`text` on `surface`, `border-control` edge): its own measured pair, independent of the band        | –                                                                                 |
| Menu, Display settings | Transparent, 1px `on-primary` edge, `radius-md`, `on-primary` label weight 600, chevron at inline end; no depth (Q4)             | Control height                                                                    |
| Nav items (bands 1, 3) | `on-primary`, weight 400, no underline at rest, `--kv-space-3` each side, `--kv-space-2` apart                                   | `kv-navigation--horizontal` metrics                                               |
| Current item           | Weight 600 + straight `on-primary` bar, `--kv-indicator-width` high, at the item's block-end, label width, drawn as `::after`    | Bar, not a fill: a fill can't show on `primary`                                   |
| Display settings panel | Existing `Card` (`surface-raised`, `border-subtle`), every part with its normal tokens and the normal `focus-ring`               | `space-4` block margin inside band 2                                              |

### 6.1 States

| Part            | default                    | hover                                            | focus-visible                                                | active / open                       | current                          |
| --------------- | -------------------------- | ------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------- | -------------------------------- |
| Nav item, brand | `on-primary`, no underline | 2px underline (link hover thickness)             | 2px `on-primary` ring, `--kv-focus-ring-offset`, item radius | –                                   | weight 600 + bar, `aria-current` |
| Latest link     | `on-primary`, underline    | thicker underline                                | same ring                                                    | –                                   | –                                |
| Menu, Display   | edge, no fill              | `primary-hover` fill (darker in standard themes) | same ring                                                    | chevron up + `aria-expanded="true"` | –                                |
| Panel contents  | normal tokens              | normal                                           | normal `focus-ring`                                          | –                                   | –                                |

No disabled, invalid, loading or empty states: nothing in the header has them. No motion.

### 6.2 Contrast (computed with `contrast.ts`'s formula; `theme:check` to confirm)

| Pair                                                     | light | dark | light-contrast | dark-contrast | Floor       |
| -------------------------------------------------------- | ----- | ---- | -------------- | ------------- | ----------- |
| `on-primary` on `primary` (text, bar, ring, button edge) | 4.70  | 4.70 | 9.89           | 11.14         | 4.5 / 7 ✓   |
| `on-primary` on `primary-hover` (band 1, button hover)   | 5.91  | 5.91 | 12.65          | 13.97         | 4.5 / 7 ✓   |
| `focus-ring` on `primary` (**why the ring changes**)     | 1.00  | 1.42 | 1.00           | 1.00          | 3 ✗         |
| `primary` vs `primary-hover` (band edge, decorative)     | 1.26  | 1.26 | 1.28           | 1.25          | none needed |
| `primary` vs `canvas` (header vs page, decorative)       | 4.70  | 4.44 | 9.89           | 11.14         | none needed |

`on-primary` on both fills is already a measured floor (DESIGN.md Contrast floors, "on their hover fills"). New uses only: as a focus ring, a current bar and a button edge (3:1 needed, ≥ 4.70 measured). dark-contrast: `primary-hover` is the lighter step (`primary-100`), so band 1 is lighter there, with black text.

### 6.3 Modes

- **Forced colours:** fills drop to `Canvas`. Each band gets a 1px `CanvasText` block-end edge so the bands stay apart; text `LinkText` (links) and `ButtonText` (buttons, with `ButtonText` edge); current bar `LinkText` (as the existing Navigation forced-colours bar); ring `Highlight`; Badge keeps its `CanvasText` edge.
- **320px / 400% / 1.4.12:** everything wraps, no fixed heights, labels hyphenate per DESIGN.md; header ≈ 4–5 rows closed at 320px, scrolls away (not sticky).
- **RTL:** logical properties; the bar and chevron follow. **Motion:** none.

### 6.4 DESIGN.md changes (maintainer-approved rule change; no token value changes)

| Line / section                      | Change                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| :20 Overview, :34 Principle 3       | "used sparingly" → add "; the docs site header is the one large `primary` area (three bands)". Principle 3: "Neutral chrome" gets the same exception                          |
| :88–90 semantic table               | `primary`: + "the docs header bands". `primary-hover`: + "the docs header's top bar". `on-primary`: "Text, icons, the current-item bar and the focus ring on `primary` fills" |
| :114 Contrast floors                | Add `on-primary` as ring, bar and edge on `primary`/`primary-hover`: 3:1 (covered by the existing 4.5/7 text floor)                                                           |
| :124 Rules, focus ring              | + "On a `primary` fill the offset gap shows `primary` too, so the ring is `on-primary` there."                                                                                |
| :309 Lines; :390 `nav-item-current` | Indicator bar also marks "the current item of a navigation on a `primary` fill"; add a row: on `primary`, current = weight 600 + `on-primary` bar, no fill                    |
| :434 brand link                     | "in `text`" → "in `text`, or `on-primary` on a `primary` fill"                                                                                                                |

## 7. Accessibility annotations

- **Landmarks:** one `banner`; `nav` "Tools" (band 1), `nav` "Site" (band 3), sidebar `nav`, `main`, `contentinfo`. Bands are plain `div`s. No unnamed `nav`; no `role="menu"`.
- **Names:** visible text = name everywhere (2.5.3). GitHub's name includes "(opens in a new tab)". Mark `aria-hidden`; brand name "KvirnUI". Badge is static text after the link.
- **`aria-current`:** one per nav. Tools: `true` on Documentation on every docs page. Site: unchanged (`page` on a section index, `true` below it).
- **Tab order (≥ 64rem, component page):** skip link → Latest → Documentation → [Storybook] → GitHub → KvirnUI → Display settings → (panel radios, when open) → Home … Theming → sidebar → main.
- **Tab order (< 40rem):** skip link → Latest → tools → KvirnUI → Menu → Display settings → (open: Site links → sidebar) → main. Menu's content is one stop after it (Display settings sits visually between them in the same row).
- **Keys:** links Enter. Menu and Display settings: the existing Disclosure contract, Enter/Space toggle, no Escape (in flow, not an overlay), no arrow keys (APG Disclosure Navigation). Panel radios: native arrows.
- **Focus moves:** none on open/close; route change → `h1` (unchanged). Nothing announced.
- **SCs of note:** 1.3.1, 1.3.2, 1.4.1 (bar + weight + `aria-current`), 1.4.3, 1.4.10, 1.4.11, 2.4.1, 2.4.3, 2.4.7, 2.4.11, 2.4.13 (ring ≥ 4.70:1), 2.5.3, 2.5.8, 3.2.3, 3.2.4 (Q2), 3.2.5 (AAA, new-tab notice).

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blockers (ring re-coloured on fills; current not by colour; no `body-small` for essential links; 44px below 64rem; nothing sticky; every string keyed).
- [x] New pairs computed (§6.2); `vp run theme:check` to be run by the orchestrator once DESIGN.md/`theme:check` pairs are updated.
- [ ] Usability test plan. Result: `pending`.

**Test plan (`pending`):** 6 participants: 2 keyboard-only, 1 NVDA, 1 ZoomText at 400%, 1 Windows contrast theme, 1 second-language reader (fi). Tasks: (1) Is KvirnUI ready for production? (2) Open the source code. (3) Go to Components from a Theming page. (4) Make the site dark. Measure: completion, lost focus indicator (target 0), confusion between Documentation and Docs (Q2), new-tab surprise.

## 9. Open decisions for the maintainer

| #   | Decision                                                                                             | Recommendation                                                                          |
| --- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Q1  | Latest target: no changelog or roadmap page exists in `apps/docs`                                    | `/docs#status` (add `id="status"` to Get started's status text); a changelog page later |
| Q2  | Tool tab "Docs" vs section "Docs": two links, same name, different targets (3.2.4, link lists)       | Tab text "Documentation" → `/`, or drop the tab; never two "Docs"                       |
| Q3  | Storybook: no deployed URL anywhere in the repo                                                      | Omit the tab until there is one; give the URL to add it                                 |
| Q4  | Menu/Display settings as outlined on-primary buttons (no depth) vs today's raised Button             | Outlined: depth's tinted edges are tuned for surfaces, not `primary`                    |
| Q5  | Translate the new keys now (catalog is en-only) or keep the proposals for later                      | Keep en-only, as docs-site.md §4                                                        |
| Q6  | A primary-fill variant of `kv-site-header` in `patterns.css`                                         | Not now; revisit after Plan 0095 review                                                 |
| Q7  | "Latest: Pre-alpha" duplicates the Badge; "Status: Pre-alpha" is plainer for second-language readers | Keep both (decided) but consider "Status"                                               |
| Q8  | Indicator thickness: brief says ~3px; existing token is 4px                                          | Use `--kv-indicator-width` (4px): no new token                                          |
