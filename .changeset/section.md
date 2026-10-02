---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add Section, the level 1 container, and make Card level 2 only (Plan 0018, ADR-0044).

- `@kvirn-ui/react`: `Section` (also `Section.Root` and `SectionRoot`) and `useSection()` with `rootProps`. A plain container for a region of the page, such as a sidebar or a band of content: it renders one `<div class="kv-section">` with no role, ARIA, text or behaviour. A `className` prop or a `render` element's own class joins `kv-section`, never replaces it. `render` changes the element (`<aside aria-labelledby>`, `<section aria-labelledby>`, `<nav aria-labelledby>`, `<li>`), so a landmark is the consumer's choice and must be named. Refs are forwarded to any element, and `className` and `style` merge. Types: `SectionRootProps`, `SectionElementProps` (what a `render` function spreads), `SectionState`, `SectionPartProps` and `UseSectionResult`.
- `@kvirn-ui/theme`: section styles. Elevation level 1: `surface`, square, no shadow, and a 1px `transparent` border (`CanvasText` in forced colours), so there is no visible edge by default. Modifier classes `kv-section--surface` (the default) and `kv-section--canvas`, and `kv-section--padding-none`, `-sm`, `-lg` and `-md` (the default). New tokens `--kv-section-padding-sm`, `--kv-section-padding-md` and `--kv-section-padding-lg`: the same steps as a card's, `md` is 24px, and 16px below 40rem and in compact density. A section never hides overflow, so focus rings aren't clipped. It is not a prose boundary: a section in prose gets prose's block margins on its own element, and its content stays prose. No new colour and no new contrast pair.
- `@kvirn-ui/theme`: `kv-card--surface` and `kv-card--canvas` are removed, and a card is always `surface-raised`. A card on a section keeps its default look. A text block in a sidebar is a `Section` rendered as a named `<aside>` instead of a card with `kv-card--surface`.
