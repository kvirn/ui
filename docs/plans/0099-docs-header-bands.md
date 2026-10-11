# Plan 0099: Docs site header in three primary bands

- **Status:** In progress
- **Owner:** lead
- **Created:** 2026-10-10 · **Target:** alpha
- **Related:** spec [docs-header-bands.md](../design/docs-header-bands.md) (§6 tokens and parts, §7 accessibility), [0095](0095-storybook-patterns-and-content-types.md) (the patterns), [0090](0090-docs-header-and-landing.md), `design`, `theme-css`, `accessibility`, `keyboard` skills

## Goal

Every docs page opens with the primary Site header of `@kvirn-ui/patterns`, as in the reference layout (Designers Italia): a darker top bar with Latest, GitHub and Display settings, a masthead with the name, the Badge and Display settings, and the navigation band with the site sections and a bar under the current one.

## Non-goals

- Search (maintainer decision): no `SiteSearch` in the docs header.
- A Storybook link: no deployed URL. Added when one is given.
- A mark: the docs site has no mark asset, so the application logo is the name only.
- The landing hero, breadcrumbs and page bands from the reference.
- Translating the docs catalog: it stays en-only (spec Q5).

## Decisions

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                      | Why                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| D1  | Storybook first: the header was designed and approved as the Site header `Primary` story, then composed in the docs from the patterns                                                                                                                                                                                                                                                                         | The docs-only attempt passed its tests and looked wrong           |
| D2  | `SiteHeader.Root variant="primary"` > `TopBar.Root` > `SiteHeader.Masthead` (`ApplicationLogo` + Badge + Display settings) > `SiteHeader.Menu` (`MainMenu`). The header's own rule makes its first band `primary-hover`, whatever the TopBar variant                                                                                                                                                          | One header, styled in `patterns.css`, not in `docs.css`           |
| D3  | The sidebar opens from its own `DocsDisclosure` below 64rem, named by the section, placed before it. The Menu holds only the Site navigation                                                                                                                                                                                                                                                                  | `SiteHeader.Menu` owns one panel; no new pattern API              |
| D4  | `docs.css` keeps only the Badge row (`docs-brand`), the outlined Display settings button (`docs-band-button`), the Display panel and the sidebar button                                                                                                                                                                                                                                                       | The bands, links, bars and rings come from `theme.css`            |
| D5  | `apps/docs` depends on `@kvirn-ui/patterns` (`workspace:*`, private); `theme.css` imports `patterns.css`, and the build's `@kvirn-ui/docs^...` step builds the patterns                                                                                                                                                                                                                                       | Maintainer approved using the patterns in the docs                |
| Q1  | "Latest" links to `/docs#status`                                                                                                                                                                                                                                                                                                                                                                              | No changelog page yet                                             |
| Q2  | No "Documentation" tool: the site sections already lead to the docs (maintainer)                                                                                                                                                                                                                                                                                                                              | 3.2.4                                                             |
| D6  | `TopBar.Root` takes `variant="primary"                                                                                                                                                                                                                                                                                                                                                                        | "secondary"                                                       | "accent"`(maintainer's request in session); it only picks`kv-top-bar--<variant>`; no variant keeps the plain look | Rule 14 |
| D7  | New semantic tokens `on-secondary` and `on-accent` (4 themes, forced colours, `theme:check` pairs, DESIGN.md). Confirmed by the maintainer in session (2026-10-11), with the request to see every header part in light, dark and both contrast themes                                                                                                                                                         | `secondary`/`accent` had no on-colour, so no fill could hold text |
| D8  | New patterns `TopBar`, `ApplicationLogo`, `SiteSearch`. `SiteHeader` lost `Notice`, `Brand`, `Logo`, `Service` and `Search`; `Topbar` is now `Masthead` (the API of a private package)                                                                                                                                                                                                                        | "Top bar" means one thing; each part has its own story            |
| D9  | The Main menu story moved to Components / Navigation / Primary navigation; the `MainMenu` component keeps its name and package                                                                                                                                                                                                                                                                                | Maintainer's request                                              |
| D11 | **DisplaySettings is a component** (`@kvirn-ui/react`, hook `useDisplaySettings`, stories under Components / Choice and overlays, `displaySettings` messages in all five locales; sv, fi, nb and nn are drafts for native review). Layouts `Inline` (Disclosure), `Floating` (Popover) and `Compact` (segments in a Popover), and the free `Panel` and `CompactPanel`. No notes of its own: they are children | Maintainer's request in session; two layouts and a free panel     |
| D12 | The docs header puts `DisplaySettings.Compact` in the TopBar next to the Tools navigation, with the storage note as its child; the masthead's end is a `SiteSearch` that GETs `/search?q=`. The search page filters page titles and one-line jobs of the site on the server: no index, no third-party service                                                                                                 | Maintainer's request; a search form needs a results page          |
| D10 | **Patterns have no unit tests** (maintainer's decision in session): their WCAG proof is axe in every story state in every theme, plus their `*.a11y.md`. `tooling/keyboard-docs` asks a pattern's Keyboard rows for no test names; AGENTS.md and the `testing` and `keyboard` skills say so                                                                                                                   | "We test components, not patterns; WCAG only"                     |
| Q8  | Current bar is `--kv-indicator-width`                                                                                                                                                                                                                                                                                                                                                                         | No new token                                                      |

### Accessibility contract

No new keys. Links: Enter. Display settings, Menu and the sidebar button are Disclosures (Enter/Space; the Menu also closes on Escape, as the pattern's contract). One `banner`; `nav` "Tools" and `nav` "Site" are named; one `aria-current` per nav; GitHub's name includes the new-tab notice; the ring, current bar and button edges are `on-primary` in the bands. Tab order: skip link, Latest, GitHub, Display settings, KvirnUI, the search field, Search, Menu, the sidebar button.

### Strings (`apps/docs/messages/en.ts`, en-only)

`header.home`, `header.status`, `header.navLabel`, `header.toolsLabel`, `header.latest({ status })`, `header.tools.docs`, `header.tools.github`, `nav.menuButton`, `display.button`, the section labels; `link.newTabNotice` from `@kvirn-ui/i18n`.

## Tasks

- [x] 1. Patterns: SiteHeader `primary` variant, TopBar, ApplicationLogo, Masthead; Storybook stories; DESIGN.md per spec §6.4
- [x] 2. `site-shell.tsx` composed from the patterns (D2, D3); `@kvirn-ui/patterns` in `apps/docs/package.json`
- [x] 3. `docs.css`: the header, band, Menu and Site navigation rules removed (D4)
- [x] 4. `site-shell.test.tsx`: one test per spec §7 row (banner, named navs, one `aria-current` each, GitHub notice, no Storybook link or search, Latest href, Menu `aria-controls`, sidebar button, Tab order, axe)
- [ ] 5. Docs build and the whole-tree gates (orchestrator)
- [ ] 6. `accessibility-reviewer` on the diff; `docs/roadmap.md` row

## Testing strategy

Behaviour and accessibility only (rule 13). Contrast is `theme:check`'s job. The look is checked by eye against the Storybook `Primary` story, on the docs site at 320, 768, 1024 and 1440 in light and dark.

## Risks & open questions

- The header is about five rows at 320px; it is not sticky.
- The usability test (spec §8) is `pending`.

## Done when

- [ ] `vp check`, `vp test run`, `i18n:check`, `theme:check` and the docs build green
- [ ] `accessibility-reviewer` APPROVE
- [ ] Plan ticked, `docs/roadmap.md` updated
