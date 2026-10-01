---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add Card (Plan 0007, ADR-0020), and keep a `primary` edge on a hovered primary button (ADR-0021).

- `@kvirn-ui/react`: `Card.Root`, `Card.Header`, `Card.Body` and `Card.Footer` (also `CardRoot`, `CardHeader`, `CardBody` and `CardFooter`), and `useCard()` with `rootProps`, `headerProps`, `bodyProps` and `footerProps`. A plain container: each part renders one `<div>` with `data-kv="card"`, `"card-header"`, `"card-body"` or `"card-footer"`, and no role, ARIA, text or behaviour. Header and Footer are never `<header>` or `<footer>`. `render` changes the element (`<article>`, `<section aria-labelledby>`, `<li>`), refs are forwarded, and `className` and `style` merge. Types: `CardRootProps`, `CardHeaderProps`, `CardBodyProps`, `CardFooterProps`, `CardElementProps` (what a `render` function spreads), `CardState`, `CardPartProps` and `UseCardResult`.
- `@kvirn-ui/theme`: card styles. Elevation level 2 by default (`surface-raised`, a 1px `border-subtle` edge, `lg` radius, no shadow), with `data-surface` (`surface-raised`, `surface`, `canvas`), `data-radius` (`lg`, `md`, `none`), `data-padding` (`md`, `none`, `sm`, `lg`, on the Root or a part) and `data-dividers`. New tokens `--kv-card-padding-sm`, `--kv-card-padding-md` and `--kv-card-padding-lg`: `md` is 24px, and 16px below 40rem and in compact density. Full-bleed media get the card's inner corners, and the card never hides overflow, so focus rings aren't clipped.
- `@kvirn-ui/theme`: prose stops at a card. A card in prose gets prose's block margins and nothing inside it is prose-styled, unless `data-kv-prose` is on the card or inside it.
- `@kvirn-ui/theme`: a hovered or pressed primary button keeps a 1px `primary` border instead of a transparent one, so its edge stays at 3:1 on `surface-raised` in dark. `contrastRequirements` now requires `danger-hover` at 3:1 on `canvas`, `surface` and `surface-raised`.
