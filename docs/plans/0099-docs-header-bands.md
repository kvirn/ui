# Plan 0099: Docs site header in three primary bands

- **Status:** Approved
- **Owner:** lead
- **Created:** 2026-10-10 · **Target:** alpha
- **Related:** spec [docs-header-bands.md](../design/docs-header-bands.md) (the design; this plan doesn't repeat it), [0090](0090-docs-header-and-landing.md), `design`, `theme-css`, `accessibility`, `keyboard` skills

## Goal

Every docs page opens with a header in three bands, as in the reference (Designers Italia layout): a top bar with the latest status and the tools (documentation, GitHub), a band with the brand and the display settings, and a band with the site sections and a bar under the current one.

## Non-goals

- Search. The slot is reserved in the layout; nothing ships (maintainer decision).
- A Storybook tab: no deployed URL exists in the repo. Added when one is given.
- The landing hero, breadcrumbs and page bands from the reference.
- A `patterns.css` variant of the header (spec Q6).
- Translating the docs catalog: it stays en-only (spec Q5).

## Design

The spec owns structure (§5), parts and tokens (§6), states, contrast (§6.2), modes (§6.3) and accessibility (§7). Styles stay in `apps/docs/app/docs.css`; `--kv-color-*` is never redefined on the header.

### Decisions taken (from spec §9)

| #   | Decision                                                                                                                              | Why                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Q1  | "Latest" links to `/docs#status`; add `id="status"` to the status text on the Get started page. A changelog page comes later          | No changelog or roadmap page exists in the docs |
| Q2  | The tool tab reads "Documentation" and links `/`; never two links named "Docs"                                                        | 3.2.4, link lists                               |
| Q4  | Menu and Display settings are outlined `on-primary` buttons, no depth                                                                 | Depth tints are tuned for surfaces              |
| Q7  | Keep "Latest: Pre-alpha" and the Badge                                                                                                |                                                 |
| Q8  | Current bar uses `--kv-indicator-width` (4px)                                                                                         | No new token                                    |
| I1  | No brand mark: the docs site has no mark asset, so the brand link is text only (spec §5 lists a decorative mark)                      | Nothing invented; add with the asset            |
| I2  | Menu `aria-controls` follows width with `matchMedia('(width >= 40rem)')`; with no sidebar the Menu is hidden by CSS from 40rem (`docs-menu-toggle--nav-only`) | Spec §5 width table                             |
| I3  | Display settings trigger and Menu are `docs-band-button` (one outlined class); `docs-disclosure` stays for the JS-off hide            | Q4                                              |

**Maintainer-approved rule change** (the primary fill, answered in session): DESIGN.md changes per spec §6.4, in the same PR. No token value changes.

### Accessibility contract (draft)

No new keys: links Enter; Menu and Display settings keep the existing Disclosure contract (Enter/Space, no Escape, no arrows). One `banner`; `nav` "Tools" and `nav` "Site" are named; `aria-current` once per nav; GitHub's name includes the new-tab notice; focus ring, current bar and button edges are `on-primary` inside the bands (≥ 4.70:1). Tab order per spec §7.

### i18n strings (`apps/docs/messages/en.ts`, en-only)

`header.toolsLabel`, `header.latest({ status })`, `header.tools.docs`, `header.tools.github`. Reused: `header.status`, `header.navLabel`, `nav.menuButton`, `display.button`, `link.newTabNotice`.

## Tasks

- [x] 1. DESIGN.md per spec §6.4; `theme:check` pairs updated if the check lists them
- [x] 2. `site-shell.tsx`: three bands, DOM order per spec §5; Tools nav from a data array in `site-sections.ts` (Storybook entry absent)
- [x] 3. `docs.css`: bands, nav items, current bar, ring, forced colours, 320px wrap, the JS-off fallback (replaces the old header rules at :38–79 and :331–354)
- [x] 4. Messages (en), `id="status"` on Get started
- [x] 5. Tests in `site-shell.test.tsx` (new): landmarks and names, one `aria-current` per nav, GitHub new-tab notice, no Storybook link, Menu `aria-controls` by width rule, Tab order; axe on the header
- [ ] 6. `docs-landing-and-header.md` §5.1 note stays pointing at the spec; roadmap row

## Testing strategy

Behaviour and accessibility only (rule 13): no computed colours or layout. Contrast is `theme:check`'s job. Visual check by running the docs site at 320px, 1024px and 1440px in the four themes.

## Risks & open questions

- Header ≈ 4–5 rows at 320px; the spec accepts it (not sticky).
- The usability test is `pending`.

## Done when

- [ ] `vp check`, `vp test run` on the changed files, `i18n:check`, `theme:check` green
- [ ] `accessibility-reviewer` APPROVE
- [ ] Plan ticked, `docs/roadmap.md` updated
