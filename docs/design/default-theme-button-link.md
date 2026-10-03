# Design spec: Default theme for Button and Link, and how the theme is delivered

- **Status:** Draft. Revised 2026-10-01 for the Linear-inspired direction
- **Designer:** ux-designer agent · **Date:** 2026-10-01
- **Plan:** Plan 0005, a visible prototype (to be written; [docs-site.md](docs-site.md) §10 has the proposed Design section and tasks) · builds on [Plan 0003](../plans/0003-button-and-link.md) and [Plan 0004](../plans/0004-design-md-and-ux-designer.md)
- **Type:** component default styling + theme/token change
- **Companion specs:** [storybook-presentation.md](storybook-presentation.md) and [docs-site.md](docs-site.md). Both use what this spec defines.

> **Update 2026-10-01 (revised):** the recipe files in this spec became one `theme.css`, and the components render their part class themselves: `kv-button` and `kv-link`. The consumer adds only the choices: `kv-button--primary` or `kv-button--danger` (the spec's earlier `kv-button-primary` and `kv-button-danger`), `kv-button-group`, and `kv-nav` on a navigation list, whose links become navigation items (the spec's earlier `kv-nav-list` and `kv-nav-item`). Density is `kv-compact`. `data-*` attributes are only state. The visual rules are unchanged, apart from the palette values in the later role-scale palette.

This spec answers three questions:

1. **How the docs site and Storybook get their styling**, when `tokens.ts` is empty and the headless packages ship zero CSS.
2. **What the visual direction is.** The maintainer's target is the [Linear-inspired DESIGN.md](https://www.shadcn.io/design/linear), adjusted to WCAG 2.2 AA.
3. **What Button (primary, secondary, danger) and Link look like** in every state, theme, density and mode.

## 1. Brief

- **Users:**
  - Developers and designers at Nordic and EU municipalities and agencies, who evaluate KvirnUI in the docs site and Storybook and then copy the styling. Some use assistive technology, and some read English as a second language.
  - Maintainers, who use Storybook as a workbench.
  - The maintainer, who decides the theme delivery and visual direction decisions from the prototype.
  - Indirectly, the residents and staff who use adopters' services.
- **Hardest-case user:** a developer with low vision who uses the dark theme at 200% zoom, or Windows Contrast Themes. Linear's near-black canvas and faint hairlines are exactly where low-vision users lose control edges and focus. If our Linear look only works for people with typical vision, it has failed.
- **Job to be done:** When I evaluate KvirnUI, I want to see Button and Link in a modern, calm look that still meets WCAG 2.2 AA in all four themes, so I can adopt it without an accessibility consultant telling me to restyle it.
- **Context:** desktop and phone. The user forms a trust judgement quickly.
- **Constraints:**
  - Headless packages ship zero CSS (hard rule 5), and the provider loads no CSS.
  - No third-party requests, fonts included (hard rule 7).
  - No new runtime dependency (hard rule 6).
  - Tokens come from DESIGN.md, and every pair is enforced by `theme:check`.
- **Success criteria:**
  - The maintainer can judge the direction from the prototype.
  - 0 axe violations in all four fixed-theme stories.
  - `theme:check` covers every pair.
  - One CSS source for the docs site and Storybook.
  - No raw colour outside `tokens.ts`.
- **Evidence:** none from users. The visual target is the maintainer's choice. The a11y constraints come from WCAG 2.2 and DESIGN.md.
- **Assumptions and research questions:**
  - Assumption: the Linear look increases adopters' trust and adoption, and doesn't read as "a tech startup, not a public service". → Research question: in the usability sessions, how do municipal evaluators describe the look, and would they put it in front of residents?
  - Assumption: white-on-lavender at 4.70:1 is comfortable to read for low-vision users. It passes AA with less margin than the previous 5.92. → Research question: include it in the low-vision sessions.
  - Assumption: a secondary look as the unmarked default discourages several primary buttons per view.

## 2. Prior art

| Source                                                                                                                                       | What we reuse                                                                                                                                                                                                                                                                          | What we change and why                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Linear-inspired DESIGN.md** ([shadcn.io/design/linear](https://www.shadcn.io/design/linear), raw `/design/linear/raw`, fetched 2026-10-01) | The near-black canvas `#010102` and the surface ladder `#0f1011`–`#18191a`. Hairline `#23252a`. Ink `#f7f8f8`, `#d0d6e0`, `#8a8f98`. The lavender `#5e6ad2` with white text. Inter as the substitute font. The tracking ramp. Radii 4, 8, 12, 16. 14px/500 compact buttons. No shadows | Every value that fails AA is adjusted ("Deviations"): the hover darkens, links get their own lighter or darker `link` token, control edges use `border-control`, the focus ring is 2px with an offset, and comfortable buttons stay 44px. The light and contrast themes are inferred, because the source is dark-only |
| DESIGN.md (components, colours, shapes)                                                                                                      | The component styles, focus ring, link rules and forced-colour rules                                                                                                                                                                                                                   | Values updated to the Linear direction. `height` in the front matter is a minimum                                                                                                                                                                                                                                     |
| KvirnUI Plan 0003 contract                                                                                                                   | Styling hooks `data-disabled`, `data-focus-visible` and `data-current`. `aria-disabled` for focusable disabled buttons                                                                                                                                                                 | Nothing                                                                                                                                                                                                                                                                                                               |
| APG Button pattern                                                                                                                           | Native `<button>`                                                                                                                                                                                                                                                                      | Visual only                                                                                                                                                                                                                                                                                                           |
| GOV.UK Design System: Button, Links                                                                                                          | Full-width stacked buttons on narrow screens, a thicker underline on link hover, and visible "(opens in new tab)" text                                                                                                                                                                 | Lavender and a 2px offset ring instead of GOV.UK's yellow focus fill                                                                                                                                                                                                                                                  |
| Base UI / Radix: styling via `data-*`                                                                                                        | State selectors on `data-*`                                                                                                                                                                                                                                                            | Variants are **classes**, and density is a context attribute                                                                                                                                                                                                                                                          |

## 3. Flow

There is no user flow here: this spec covers the styling. The flows are in the companion specs.

Unhappy states to cover:

- A disabled button, both native `disabled` and focusable `aria-disabled`.
- A label that wraps to two or three lines (Finnish).
- A link that wraps.
- A long Finnish new-tab notice.
- No JavaScript, so the media-query fallback applies.
- The font fails to load, so the system-ui fallback applies.
- Forced colours.
- Compact density on a touch screen below 64rem, which falls back to comfortable.
- A consumer override of `--kv-color-primary`, which must reach every recipe.

## 4. Content

The recipes add no strings. The example labels are in [storybook-presentation.md §4](storybook-presentation.md#4-content). The only library string involved is `link.newTabNotice`: en "(opens in a new tab)", sv "(öppnas i en ny flik)", and fi "(avautuu uuteen välilehteen)", the longest, which must wrap with the link text. It is always visible in default-theme examples.

## 5. Structure

```
320px (below 40rem)                   40rem and wider
[kv-button-group]                      [kv-button-group]
  [ Primary            full width ]      [ Primary ] [ Secondary ] [ Danger ]
  [ Secondary          full width ]      inline, wraps, gap space-3
  [ Danger             full width ]
  stacked, gap space-3
```

- DOM order equals visual order equals focus order. The primary action comes first, on the inline start.
- Danger appears next to primary only in the Variants example, to compare them. A real service needs a confirmation step.

## 6. Visual specification

### Delivery

**Tokens in `tokens.ts` generate `tokens.css`, and `tokens.ts` also generates `tailwind.css`. Opt-in recipes ship from `@kvirn-ui/theme`. Nothing is loaded automatically.**

| Export                               | Contents                                                                                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@kvirn-ui/theme/tokens.css`         | `@layer kv.tokens`: custom properties for the four themes, media-query fallbacks when the `data-kv-*` attributes are absent, `color-scheme` per theme, and the `.kv-compact` overrides. No element selectors |
| `@kvirn-ui/theme/recipes/button.css` | `@layer kv.recipes`: `.kv-button`, `.kv-button-primary`, `.kv-button-danger`, `.kv-button-group`                                                                                                             |
| `@kvirn-ui/theme/recipes/link.css`   | `@layer kv.recipes`: `.kv-link`, `.kv-nav-list`, `.kv-nav-item`                                                                                                                                              |
| `@kvirn-ui/theme/tailwind.css`       | `@theme inline { … }`. Every Tailwind variable maps to `var(--kv-*)` (`--color-kv-primary`, `--radius-kv-md`, `--spacing-kv-4`, `--font-kv-sans`, …)                                                         |
| `@kvirn-ui/theme` (JS)               | `colorTokens`, `contrastRequirements`, `checkTheme` and the other token objects                                                                                                                              |

Rules:

- Every file starts with `@layer kv.tokens, kv.recipes;`, so consumer CSS outside the `kv` layer always wins.
- Recipes use only `var(--kv-*)`. A check fails on raw colour values.
- `.kv-button` on its own gives the secondary look.
- **Theming** means overriding `--kv-*`. For example, `:root { --kv-color-primary: #…; --kv-color-primary-hover: #…; }` restyles every recipe, and the Tailwind utilities with it. Run `checkTheme()` afterwards.
- Links in a `.kv-nav` list replace the earlier `.kv-link-navigation`: Linear-style navigation items are pill rows, not underlined links.

### Token naming

| DESIGN.md                            | Custom property                                                                                                                                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| colors.`<name>`                      | `--kv-color-<name>`                                                                                                                                                                                                   |
| spacing.`<step>`                     | `--kv-space-<step>`                                                                                                                                                                                                   |
| rounded.`<name>`                     | `--kv-radius-<name>`                                                                                                                                                                                                  |
| typography.`<role>`                  | `--kv-font-<role>-size`, `-weight`, `-line-height`, `-letter-spacing`, `-feature-settings`. Families: `--kv-font-family-sans`, `--kv-font-family-mono`                                                                |
| Focus ring 2px, 2px offset           | `--kv-focus-ring-width`, `--kv-focus-ring-offset`                                                                                                                                                                     |
| Lines 1px                            | `--kv-border-width`                                                                                                                                                                                                   |
| Density (44 or 32px, label, padding) | `--kv-control-min-block-size` (2.75rem, or 2rem when compact), `--kv-control-font-size`, `--kv-control-font-weight`, `--kv-control-line-height`, `--kv-control-padding-inline` (`space-4`, or `space-3` when compact) |
| 4px indicator (panels, current bar)  | `--kv-indicator-width`                                                                                                                                                                                                |
| Motion                               | `--kv-duration-fast`, `-medium`, `-slow`, `--kv-easing-standard`                                                                                                                                                      |
| Link underline                       | `--kv-link-underline-thickness` (1px), `--kv-link-underline-thickness-hover` (2px), `--kv-link-underline-offset` (0.15em)                                                                                             |

Theme selection, following the theme decision:

- `:root` holds light.
- The `[data-kv-color-scheme]` and `[data-kv-contrast]` combinations select the other themes.
- The media-query fallbacks apply on `:root:not([data-kv-…])`.
- `color-scheme` is set per theme.
- Under `@media (forced-colors: active)`, the recipes switch to system colours.

### Button parts

| Part                  | Specification                                                                                                                                                                                                                                                                                                                                                                                           | Notes                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `.kv-button` (base)   | Secondary look: `surface-raised` bg, `text`, 1px solid `border-control`, radius `md` (8px). Font from `--kv-control-font-*` (comfortable: `label`, 16px/500. Compact: `label-compact`, 14px/500). `min-block-size: var(--kv-control-min-block-size)`, padding-block `space-2`, padding-inline `var(--kv-control-padding-inline)`. `inline-flex`, centred, `text-align: center`, `max-inline-size: 100%` | Comfortable: 44px, like Linear's buttons but taller. Compact: 32px, close to Linear's ~33px |
| `.kv-button--primary` | `primary` bg (`#5e6ad2`), `on-primary`, border `transparent` (1px)                                                                                                                                                                                                                                                                                                                                      | White on lavender, as in the reference (4.70:1)                                             |
| `.kv-button--danger`  | `danger` bg, `on-danger`, border `transparent`                                                                                                                                                                                                                                                                                                                                                          | `on-danger` is dark in the dark themes, where `danger` is light                             |
| `.kv-button-group`    | `flex`, `wrap`, gap `space-3`. Below 40rem: column, children full width                                                                                                                                                                                                                                                                                                                                 |                                                                                             |

Density:

- `kv-compact` on any ancestor switches the `--kv-control-*` tokens.
- Below 64rem, `tokens.css` resets compact to comfortable (`@media (width < 64rem)`), so touch targets stay 44px.
- Primary actions in resident-facing views are never compact. That's documented guidance, not enforced.

### Button states

`[disabled]`, `[aria-disabled="true"]` and `[data-disabled]` all select the disabled style.

| Part      | default                                    | hover                                                           | focus-visible                                                                                                                                           | active (pressed) | disabled                                                                                                 |
| --------- | ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| secondary | `surface-raised`, `text`, `border-control` | bg `primary-subtle`, border `primary`                           | `outline: var(--kv-focus-ring-width) solid var(--kv-color-focus-ring)`, offset `--kv-focus-ring-offset`, on `:focus-visible` and `[data-focus-visible]` | as hover         | bg `surface`, text `text-muted`, 1px **dashed** `border-control`, `cursor: not-allowed`, no hover change |
| primary   | `primary`, `on-primary`                    | bg `primary-hover` (**darker**, not Linear's lighter `#828fff`) | as secondary. The ring sits 2px outside, against the page                                                                                               | `primary-hover`  | same as secondary disabled                                                                               |
| danger    | `danger`, `on-danger`                      | bg `danger-hover`                                               | as secondary                                                                                                                                            | `danger-hover`   | same as secondary disabled                                                                               |

- A focusable disabled button shows the ring.
- Guidance: prefer enabled buttons that explain what's missing on submit. If you do disable one, put the visible reason next to it with `aria-describedby`.

### Link and navigation parts

| Part                                      | default                                                                                                                                                                                                                                                                                                 | hover                       | focus-visible                                    | current (`data-current` / `aria-current`)                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `.kv-link` (running text)                 | `link` colour, underline 1px, offset 0.15em. Inherits font size                                                                                                                                                                                                                                         | `link-hover`, underline 2px | ring, radius `sm`, `box-decoration-break: clone` | weight 600, underline kept                                                                                                            |
| `.kv-nav`                                 | `<ul>` reset, column, gap `space-1`                                                                                                                                                                                                                                                                     | –                           | –                                                | –                                                                                                                                     |
| `.kv-nav .kv-link` (a link in a nav list) | `display: flex`, `align-items: center`. `min-block-size` and font from `--kv-control-*` (compact in the docs sidebar at 64rem and wider: 32px, 14px/500). Padding-inline `space-3`, radius `md`, colour `text`, **no underline**, border-inline-start `--kv-indicator-width` solid `transparent`, inset | bg `surface-raised`         | ring, radius `md`                                | bg `primary-subtle`, weight 600, border-inline-start colour `primary`, and `aria-current="page"`. Three visual cues plus the AT state |
| `Link.NewTabNotice`                       | No own style. It inherits the link's colour and underline                                                                                                                                                                                                                                               | inherits                    | inherits                                         | –                                                                                                                                     |

Navigation items use `text`, not the accent, as in Linear's sidebar. DESIGN.md allows navigation lists to drop the underline and the link colour, because position in a labelled `<nav>` is the cue.

### Measured contrast (2026-10-01, `contrast.ts`, light / dark / light-contrast / dark-contrast)

Minimums: 4.5:1 for text (7:1 in the contrast themes), and 3:1 for UI and focus.

| Pair                                 | Used for                          | light | dark  | lc    | dc    |
| ------------------------------------ | --------------------------------- | ----- | ----- | ----- | ----- |
| `on-primary` on `primary`            | primary label                     | 4.70  | 4.70  | 9.89  | 11.14 |
| `on-primary` on `primary-hover`      | primary hover and pressed         | 5.91  | 6.05  | 12.65 | 13.97 |
| `on-danger` on `danger`              | danger label                      | 6.40  | 9.29  | 9.47  | 12.35 |
| `on-danger` on `danger-hover`        | danger hover and pressed          | 8.23  | 12.09 | 12.00 | 15.57 |
| `text` on `surface-raised`           | secondary label                   | 19.05 | 16.55 | 21.00 | 17.61 |
| `text` on `primary-subtle`           | secondary hover, current nav item | 16.80 | 14.66 | 18.52 | 15.59 |
| `border-control` on `surface-raised` | secondary edge (1.4.11)           | 3.95  | 3.54  | 10.86 | 10.50 |
| `border-control` on `primary-subtle` | secondary edge while hovered      | 3.49  | 3.13  | 9.58  | 9.30  |
| `primary` on `primary-subtle`        | hover edge, current-item bar      | 4.15  | 3.32  | 8.72  | 8.33  |
| `text-muted` on `surface`            | disabled label                    | 5.79  | 5.86  | 11.27 | 13.04 |
| `border-control` on `surface`        | disabled dashed edge              | 3.68  | 3.83  | 10.12 | 11.36 |
| `focus-ring` on `canvas`             | focus ring                        | 4.70  | 7.27  | 9.89  | 11.14 |
| `focus-ring` on `surface`            | focus ring on sidebar and code    | 4.38  | 6.64  | 9.21  | 10.17 |
| `focus-ring` on `surface-raised`     | focus ring in cards               | 4.70  | 6.14  | 9.89  | 9.40  |
| `link` on `canvas`                   | link                              | 5.31  | 7.27  | 9.89  | 11.14 |
| `link` on `surface`                  | link in sidebar or panels         | 4.94  | 6.64  | 9.21  | 10.17 |
| `link` on `primary-subtle`           | link in an info panel, badge      | 4.68  | 5.44  | 8.72  | 8.33  |
| `link-hover` on `canvas`             | link hover                        | 7.12  | 9.84  | 12.65 | 13.97 |
| `text` on `surface`                  | nav item                          | 17.75 | 17.90 | 19.57 | 19.05 |

Every pair passes. The full list of 168 pairs (42 per theme) is in the visual-direction decision, and every one goes into `contrastRequirements`.

Where the target was adjusted:

- White on Linear's hover `#828fff` is 2.87:1, so our hover darkens.
- `#5e6ad2` as link text is 4.44:1 on the dark canvas and 4.38:1 on the light surface, so links use `link`.
- The Linear hairlines are 1.36–1.96:1 as control edges, so controls use `border-control`.

### Modes

- **Four themes:** tokens only. The dark themes follow the Linear ladder. The contrast themes keep the 7:1 accents (`#2c35a0` light, `#b3b8ff` dark with a dark label).
- **Forced colours:**
  - Buttons get `ButtonText` borders and text on `ButtonFace`, with a `Highlight` border on hover and a `Highlight` outline.
  - Disabled uses `GrayText` and keeps its dashed border.
  - Links use `LinkText` and stay underlined.
  - The current nav item keeps its bar (`LinkText`) and weight.
  - Never `forced-color-adjust: none`.
- **RTL:** logical properties only.
- **Motion:** under `no-preference` only, `background-color`, `border-color`, `color` and `text-decoration-thickness` transition over 120ms with the standard easing. Otherwise changes are instant. No scale or glow.
- **320px, 400% zoom, text spacing:**
  - Labels wrap, with no fixed heights. Groups stack.
  - Wrapped links keep one ring per line.
  - The 1.4.12 overrides fit, because padding is the only constraint.
- **Font:** IBM Plex Sans for text and controls and IBM Plex Serif for headings, self-hosted by the docs site and Storybook (docs-site.md §6), with the system fonts as the fallback.

### New or changed tokens

Everything is in the visual-direction decision, with an old → new table and ratios. For this spec:

- New colours: `link`, `link-hover`, `on-danger`, `danger-hover`.
- New type token: `label-compact`.
- Changed: the neutrals, `primary` and its hover, `focus-ring`, the radii (md 8, lg 12, xl 16), and button padding (16px, or 12px compact).
- New non-colour tokens: the three link-underline tokens and the `--kv-control-*` density set.

## 7. Accessibility annotations

- **Names:** the visible label is the name (2.5.3). `Link.NewTabNotice` is always visible (G201, 3.2.5).
- **Roles:** never put `.kv-button` on `<a>` or `.kv-link` on `<button>`. Add a comment in the recipe.
- **Focus:** a 2px ring with a 2px offset, at 4.38:1 or more against adjacent colours in every theme (2.4.7, 2.4.11, 2.4.13). Keyboard focus only.
- **Colour:**
  - Disabled is dashed.
  - The current item has a bar, weight and `aria-current`.
  - Links are underlined in text.
  - Danger is identified by its label.
  - No state relies on colour alone (1.4.1).
- **Targets:**
  - Comfortable: 44px (2.5.5).
  - Compact: 32px, which meets 2.5.8's 24px with room to spare, and only at 64rem and wider.
  - Inline links fall under the inline exception.
- **SCs:** 1.4.1, 1.4.3, 1.4.6, 1.4.10, 1.4.11, 1.4.12, 2.4.7, 2.4.11, 2.4.13, 2.5.3, 2.5.5, 2.5.8, 3.2.5.

## 8. Validation

- [x] Self-review against `review-checklist.md`. No open blockers. The thinnest margins are listed as research questions.
- [x] Every pair measured (the table above and the visual-direction decision).
- [x] Usability test plan: shared with [docs-site.md §8](docs-site.md#8-validation), plus the low-vision white-on-lavender question. Result: `pending`.

## 9. Open questions

1. Once the maintainer has seen the prototype: accept the theme delivery and visual direction decisions?
2. **Visited links:** DESIGN.md has no visited colour. Should there be one?
3. **The light theme is our inference.** The Linear source is dark-only. Does the maintainer want a warmer or cooler light surface than `#f6f7f7`?
4. **The docs site's default colour scheme:** Linear is dark-first. We keep `system` (DESIGN.md principle 6). Should the docs default to `dark` for first-time visitors whose OS preference is light? Not recommended.
5. **A compile test for `tailwind.css`** needs `tailwindcss` as a dev dependency (needs the maintainer's approval).
6. **Compact on touch:** the reset uses a width media query. `(pointer: coarse)` would be more precise, but it's less predictable on hybrid devices.
