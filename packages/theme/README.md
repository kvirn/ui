# @kvirn-ui/theme

The optional default theme for KvirnUI: one hand-written, readable CSS file, `theme.css`. The headless packages ship no CSS. This file styles them through the classes they render and their state attributes.

> **Pre-alpha.** The look is a proposal (ADR-0013 and ADR-0014, both Proposed). It is designed and tested to meet WCAG 2.2 AA, but check your own service.

## Three ways to use it

### 1. Import it

```sh
pnpm add @kvirn-ui/theme
```

```ts
// Once, for example in your root layout.
import '@kvirn-ui/theme/theme.css'
```

Every KvirnUI component on the page is now styled. Remove the import, and they are unstyled again.

- Every component part renders its own class: `kv-button`, `kv-link`, `kv-link-new-tab-notice`, `kv-card`, `kv-card-header`, `kv-card-body` and `kv-card-footer`. Your `className` joins it, never replaces it. The theme selects on it.
- State comes from the components as `data-*` attributes: `data-disabled`, `data-focus-visible`, `data-current`. Classes style, `data-*` is state.
- Choices are classes you add:
  - `<Button className="kv-button--primary">` for the one main action per view, `kv-button--danger` for a destructive one. Without one, a Button is secondary.
  - `<div class="kv-button-group">` lays buttons out in a row, stacked on narrow screens.
  - `<ul class="kv-nav">` inside a labelled `<nav>` turns its Links into navigation items, with the current page marked.
  - `kv-compact` on any container gives 32px controls for staff tools (from 64rem wide), and less padding in cards. On `<html>` or `<body>` it makes the whole site compact.
  - On a `Card.Root`: `kv-card--surface` or `kv-card--canvas` (the default is `surface-raised`), `kv-card--radius-md` or `kv-card--radius-none` (the default is `lg`, and `kv-card--radius-lg` takes a card back to it), and `kv-card--dividers` for a line between parts. `kv-card--padding-none`, `-sm`, `-md` or `-lg` on the Root sets every part's padding (the default is `md`). A part's own class overrides it, in all four steps: `<Card.Header className="kv-card-header--padding-none">` around a full-bleed image, and likewise `kv-card-body--padding-*` and `kv-card-footer--padding-*`. Parts must be direct children of the Root.
  - `kv-prose` styles content you don't control, and `kv-prose kv-prose--large` is the 18px size. It stops at a card, unless you put `kv-prose` on the card or inside it. Inside prose, `kv-lead` marks the lead paragraph, `kv-scroll-region` a wide table's labelled scroll region, and `kv-not-prose` anything prose shouldn't style.
- The theme follows `data-kv-color-scheme` and `data-kv-contrast`, which `KvirnProvider` and `KvirnThemeScript` set on `<html>`. Without them, it follows the OS settings. Forced colours always win.

### 2. Override variables

`theme.css` has two tiers of custom properties:

- a **palette** of role scales, Tailwind-style, each with eleven steps from 50 (lightest) to 950 (darkest). They are named for what they do, not for their hue, so a rebrand never needs a refactor:

  | Scale              | Default hue                                      | Used for                                                        |
  | ------------------ | ------------------------------------------------ | --------------------------------------------------------------- |
  | `--kv-neutral-*`   | grey with a faint cool tint                      | canvases, surfaces, borders, text                               |
  | `--kv-primary-*`   | lavender (`#5e6ad2` is 500)                      | primary buttons, links, focus rings, selection, current page    |
  | `--kv-secondary-*` | the neutral steps (`var(--kv-neutral-500)` etc.) | the secondary button's edge                                     |
  | `--kv-accent-*`    | teal                                             | nothing in the default theme: there for your brand's 2nd colour |
  | `--kv-danger-*`    | red                                              | errors, destructive actions                                     |
  | `--kv-success-*`   | green                                            | confirmation                                                    |
  | `--kv-warning-*`   | amber                                            | warnings, deadlines                                             |

  plus `--kv-white` and `--kv-black`. The palette is the only place with raw colour values.

- **semantic tokens** that point at the steps per theme: `--kv-color-primary: var(--kv-primary-500)` in light, `--kv-color-text: var(--kv-neutral-50)` in dark, `--kv-color-secondary: var(--kv-secondary-500)` for the secondary button's edge. `--kv-color-text` is the body text colour, and `--kv-color-heading` the colour of prose headings, the same step as `text` in every theme until you change it.

Components only use the semantic tokens. Everything is inside `@layer kv`, so any CSS you write outside a layer wins, whatever its specificity.

**Rebrand by overriding one scale.** Give `--kv-primary-*` your brand's eleven steps on `:root`, and all four themes follow:

```css
/* A teal brand. It passes theme:check in all four themes. */
:root {
  --kv-primary-50: #edfafa;
  --kv-primary-100: #cdf0f0;
  --kv-primary-200: #9be0e2;
  --kv-primary-300: #5fc6cb;
  --kv-primary-400: #26a4ac;
  --kv-primary-500: #007d86;
  --kv-primary-600: #00707a;
  --kv-primary-700: #005a62;
  --kv-primary-800: #00474e;
  --kv-primary-900: #003a40;
  --kv-primary-950: #00262a;
}
```

Each theme uses different steps of a scale. For primary: 500 for the button and 600 for links in light, 500 and 400 in dark, 800 in light high contrast and 200 in dark high contrast. So **swapping a scale can break contrast**: a step that carries white text in light may not show against the dark canvas. The default `--kv-accent-*` (teal) is an example: copied into `--kv-primary-*` as it is, white text on its 500 is 4.37:1, below 4.5:1. That's why the brand scale above has a darker 500. Always run `checkThemeCss()` on your customised copy (see [Check your colours](#check-your-colours)), or read the live Foundation/Theming and Colors/Text on surface pages in Storybook.

Override scales on `:root`, where `theme.css` declares the semantic tokens. A custom property is resolved where it's declared, so a scale overridden on a wrapper element doesn't reach the semantic tokens inside it.

To give the secondary button's edge a hue, override `--kv-secondary-*` the same way. Smaller changes:

```css
/* Point one semantic token at another step. */
:root {
  --kv-color-link: var(--kv-primary-700);
}

/* One theme only: use the same selector as theme.css. */
:root[data-kv-color-scheme='dark'] {
  --kv-color-link: var(--kv-primary-300);
}
```

If a brand colour fails as a fill, use it in the header band or the logo, and build the scale from a darker or lighter shade of it (DESIGN.md, Colors). Never reuse a brand red for `danger` or a brand green for `success`.

### 3. Replace it, or skip it

- **Your own copy.** Copy `node_modules/@kvirn-ui/theme/theme.css` into your project, edit it, and import your copy instead. It's meant to be read: numbered sections, the palette first, then the themes, then each component.
- **No theme.** Skip it, and style `.kv-button`, `[data-disabled]`, `[data-focus-visible]`, `.kv-button--primary` and so on with Tailwind or your own CSS.

## Site-wide defaults

Some choices are made once for a whole site. Set these in your own CSS instead of adding a class to every element. `theme.css` sets none of them, so without them the look is the default one.

| Custom property              | Used by                                       | Without it                    |
| ---------------------------- | --------------------------------------------- | ----------------------------- |
| `--kv-font-family-body`      | body text in prose, buttons, navigation items | `--kv-font-family-sans`       |
| `--kv-font-family-heading`   | prose headings                                | `--kv-font-family-sans`       |
| `--kv-card-padding-default`  | every card without a padding class            | `--kv-card-padding-md`        |
| `--kv-card-radius-default`   | every card without a radius class             | `--kv-radius-lg`              |
| `--kv-button-min-block-size` | every button. Never below 24px (2.5.8)        | `--kv-control-min-block-size` |
| `--kv-button-padding-inline` | every button                                  | `--kv-control-padding-inline` |
| `--kv-button-font-size`      | every button                                  | `--kv-control-font-size`      |
| `--kv-button-font-weight`    | every button                                  | `--kv-control-font-weight`    |
| `--kv-button-line-height`    | every button                                  | `--kv-control-line-height`    |

```css
:root {
  /* End your own stack with the system one: it covers å ä ö æ ø and the Sámi letters. */
  --kv-font-family-body: 'Source Sans 3', var(--kv-font-family-system);
  --kv-font-family-heading: 'Merriweather', Georgia, serif;
  --kv-card-radius-default: var(--kv-radius-md);
  --kv-button-min-block-size: 2.5rem;
  --kv-button-font-weight: 600;
}

/* Resolved on each card, so the compact step-down still applies (see below). */
.kv-card {
  --kv-card-padding-default: var(--kv-card-padding-lg);
}
```

For compact controls on a whole staff tool, put `class="kv-compact"` on `<html>` or `<body>`: every control is 32px from 64rem, and 44px below it.

- **Where to set them.** `theme.css` reads each one where it's used, with its own value as the fallback: `font-family: var(--kv-font-family-body, var(--kv-font-family-sans))`. So you can set them on `:root` for the whole site, or on any container for one part of the page.
- **The one catch.** A custom property is resolved where it's declared. `:root { --kv-card-padding-default: var(--kv-card-padding-lg) }` takes `lg` as it is on `:root`: it still grows from 40rem, but the compact step-down inside a `kv-compact` container doesn't reach it. Set the default on `.kv-card` in your own CSS, as above, or on the compact container. `kv-compact` on `<html>` needs neither. Fixed values, such as `2.5rem` or a font name, have no catch.
- **Opting one card out.** The classes still win: `kv-card--padding-md` and `kv-card--radius-lg` take a single card back to the theme's steps when your default is different.
- **Buttons.** The `--kv-button-*` properties size buttons without touching other controls, and they win over density, the compact step and the 44px below 64rem included. Keep `--kv-button-min-block-size` at 24px or more, and enough `--kv-button-padding-inline` that a short label is at least 24px wide (2.5.8 Target Size (Minimum)). Resident-facing buttons should stay at 44px (2.5.5). `theme.css` doesn't clamp the values for you.
- **Fonts.** `--kv-font-family-system` is the system stack (`system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif`), and `--kv-font-family-sans` is Inter in front of it. A link in running text keeps the font around it, so it isn't affected by `--kv-font-family-body`. Code stays `--kv-font-family-mono`.
- **Heading colour.** `--kv-color-heading` is a semantic colour like the others, defined in each theme, so set it per theme with the selectors `theme.css` uses, and run `checkThemeCss()`: `theme:check` holds it to everything body text is held to. If you change `--kv-color-text` on a wrapper element, change `--kv-color-heading` there too.

## Check your colours

After changing colours, measure them. `checkThemeCss` reads a theme file the way a browser reads it for `<html>`, in all four themes, and checks that every colour token is defined, that each OS fallback matches its theme, and that every pair meets its WCAG minimum: 4.5:1 for text, 3:1 for control edges and focus, and 7:1 for text in the high-contrast themes.

```ts
import { readFileSync } from 'node:fs'
import { checkThemeCss } from '@kvirn-ui/theme'

const problems = checkThemeCss(readFileSync('src/styles/theme.css', 'utf8'))
// [] when everything passes, or messages like
// 'light: text-muted on canvas is 2.11:1, needs 4.5:1'
```

It checks one file. If you override variables in another file, append it: `checkThemeCss(themeCss + myOverrides)`.

In this repository, `vp run theme:check` runs it on `theme.css`.

## What's in theme.css

1. Palette: the role scales, the only place with raw colour values
2. The light theme: semantic colours and every non-colour token (spacing, radii, type, focus ring, motion, control size)
3. Dark, light high contrast and dark high contrast
4. System fallbacks from `prefers-color-scheme` and `prefers-contrast`
5. Forced colours
6. Compact density
7. Button (and its `--kv-button-*` sizing)
8. Link and navigation lists
9. Prose
10. Card (and the card defaults)

The site-wide defaults are listed at the top of the file.

The visual rules behind it are in `DESIGN.md` at the repository root.
