---
'@kvirn-ui/theme': minor
---

Add the default theme (Plan 0005, ADR-0013 and ADR-0014): one hand-written, readable `@kvirn-ui/theme/theme.css`. Import it and every KvirnUI component is styled. Remove the import and they are unstyled again. The headless packages still ship no CSS.

- A palette of role scales, Tailwind-style, named by role and never by hue (ADR-0019), so a rebrand needs no refactor: `--kv-neutral-50` … `--kv-neutral-950` and the same eleven steps for `primary` (lavender by default), `secondary` (the neutral steps by default, by `var()`), `accent` (teal, unused by the default theme, for a brand's second colour), `danger`, `success` and `warning`, plus `--kv-white` and `--kv-black`.
- Semantic tokens (`--kv-color-primary`, `--kv-color-text`, …, and `--kv-color-secondary` for the secondary button's edge) that point at palette steps in the light, dark and two high-contrast themes, selected by `data-kv-color-scheme` and `data-kv-contrast`, with `prefers-color-scheme` and `prefers-contrast` fallbacks, `color-scheme`, forced-colours system colours and compact density (`kv-compact`, 64rem and wider).
- Button and Link styles on the part classes the components render: `.kv-button` (secondary by default, `kv-button--primary` or `kv-button--danger` for a variant), `.kv-button-group`, `.kv-link`, and navigation items inside `.kv-nav`. State comes from the components' `data-*` attributes (`data-disabled`, `data-focus-visible`, `data-current`).
- Everything is in `@layer kv`, so unlayered consumer CSS always wins. Rebrand by overriding one scale on `:root`, such as the eleven `--kv-primary-*` steps with your brand's colours, and all four themes follow. Swapping a scale can break contrast, so run `checkThemeCss()` on your customised copy. Or copy the file and import your copy.
- JS: `checkThemeCss(css)` checks a theme file (the default or your copy) in all four themes: every colour token defined, OS fallbacks equal to their themes, and every contrast pair (284 in the four themes). Also `checkTheme`, `resolveThemeColors`, `readRootProperties`, `contrastRatio`, `contrastRequirements`, `colorTokenNames` and `themeNames`.
