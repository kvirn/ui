# Plan 0100: Galleries for Components, Patterns and Content types

- **Status:** Approved (maintainer, 2026-10-10: recommendations of spec §10 accepted)
- **Owner:** lead
- **Created:** 2026-10-10 · **Target:** alpha
- **Related:** spec [component-gallery.md](../design/component-gallery.md) (the design; this plan doesn't repeat it), [0095](0095-storybook-patterns-and-content-types.md) (D12 shell and content type), [0099](0099-docs-header-bands.md) (same files), `design`, `accessibility`, `storybook-docs` skills

## Goal

`/components`, `/patterns` and `/content-types` are one gallery: groups as `h2`, a card per page with a picture, a name and a one-line job. Today `/components` is a bare list of links and the other two are blank `h1` pages.

## Non-goals

- Live renders in the cards, a filter or search, a status badge on cards (spec Q1, Q7).
- New tokens, new `@kvirn-ui/i18n` keys or a new library component. The gallery is docs-only (`apps/docs`), its CSS in `apps/docs/app/gallery.css`.
- Moving the docs app onto `@kvirn-ui/patterns` (0095, D2).

## Options weighed

| Question       | Chosen                                                            | Rejected                                                                |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Card preview   | Inline SVG schematic, no text, per item (Q1)                      | Live `inert` render: client JS for 64 trees, hydration risk, some empty |
| Card link      | Picture and name in one heading link, one Tab stop (Q2)           | Stretched link: DESIGN.md change, blocks text selection                 |
| Prose pieces   | Three use cases on the Prose page (Q3)                            | `/patterns/*` under Content and media                                   |
| Item pages     | Minimal `ComponentPage` per shipped pattern and content type (Q4) | A gallery that links to nothing                                         |
| Card text      | `summary` on `SitePage`, the lead's first sentence moved (Q5)     | A second copy of the sentence in the gallery                            |
| Empty sections | Hidden from the header until they have an item page (Q6)          | Blank `h1` pages in the nav                                             |

## Design

The spec is the design. Rules this plan adds on top of D12:

- A content-type card's wireframe shows the shell greyed and the content type outlined between header and footer, so the rule is visible and the lead states it in words.
- `Contact card` is not a page type, so its file leaves `content-types/` (Q9). Its story title was already under Patterns.
- The interaction patterns of the landing spec (form errors, waiting and empty states) join Patterns › Search and forms when they are written (Q8). No work now.

## Tasks

Order: G1 first; G2 and G4 in parallel; G3 after G2; G5 and G6 after G1 and G2; G7 any time. **Start G1 only after plan 0099 is committed**: both edit `site-sections.ts`, `docs.css` and `messages/en.ts`.

- [x] **G1 Data** (component-engineer): `summary` on `SitePage`, `patternGroups`, content-type items in `site-sections.ts`; the first lead sentence of the 64 page files moves to data; `component-page.tsx` composes the lead from it
- [x] **G2 Gallery, Components** (component-engineer): `components/gallery/gallery.tsx`, `app/gallery.css`, `app/components/page.tsx`; works without pictures. Decisions: the group `h2` stays a plain `Heading` with its id (not `AnchoredHeading`, no extra Tab stop), no `section` per group (spec §7), `PageContents` reused over the 7 groups; CSS under `:where()` for zero specificity.
- [ ] **G3 Previews, Components** (component-engineer, one PR per 2–3 groups): `components/gallery/previews/*.tsx` and the registry; hidden from AT, no text, forced-colours block
- [x] **G4 Prose use cases** (component-engineer, parallel with G2): Inset text, Steps, Images and media on the Prose page (`/components/prose#…`), 7 use cases. Decisions: order is article, larger-text, field-description, inset-text, steps, images-and-media, own-element; notes lead with "Inset or Alert:", "Steps or Stepper:", "Captions, never an embed:"; the figure is an `<img>` with an inline `data:` SVG (an inline `<svg role="img">` trips the `prefer-tag-over-role` lint; the CSP allows `data:`); the test reads the ids from the page source, because a render needs the contract; `ProseTexts` has en and sv only, and `prose-content-types.md` lists fi too (left). No `/content-types` prose pages existed, so nothing was deleted.
- [ ] **G5 Patterns** (component-engineer, after G1 and G2): `app/patterns/page.tsx` on the gallery; one minimal page per shipped pattern; only patterns with a page are listed
- [ ] **G6 Content types** (component-engineer, after G1 and G2): `app/content-types/page.tsx`; four type pages (Start page, Subpage, Content page, Documentation page); wireframe previews
- [x] **G7 Contact card**: its title was already `Patterns/Places and contacts/Contact card`, so only the file moved, from `content-types/` to `patterns/places-and-contacts/`; no story id changed

## Testing strategy

Behaviour and accessibility only (rule 13), once, in the cheapest layer: per gallery, one `h1`, one `h2` per group with its id, list roles and item count from data, one link per card with a name unique out of context, the contents list resolves, previews hidden from AT, axe clean in four themes. No CSS or layout tests.

## Risks & open questions

- **Server components and compound parts.** A docs page that is a server component must use the flat part names (`CardRoot`, not `Card.Root`): `Card` comes from a `'use client'` module, so `Card.Root` is `undefined` across the boundary and the page answers 500 in `next dev`, while a browser-mode test (no boundary) passes. Found on G2; G3, G5 and G6 take the same care.
- **Same tree as 0099.** Both plans edit `site-sections.ts`, `docs.css` and `messages/en.ts`; one concern per PR, so 0099 lands first.
- **64 page files in G1.** A mechanical edit, but every docs page moves once; the component-engineer runs `vp check` on the changed files only, and the orchestrator runs the whole docs test project once.
- **About 80 drawings in G3** are authoring work, not engineering; slices ship alone and a card is complete without its picture.
- Usability and AT testing of the gallery is `pending` (spec §9).

## Done when

- [ ] G1 to G7 ticked; the three pages read as one gallery in the docs app
- [ ] `vp check`, `vp test run` on the changed files, `i18n:check`, `theme:check` green
- [ ] `accessibility-reviewer` APPROVE
- [ ] `docs/roadmap.md` updated; this plan deleted in the change that finishes it
