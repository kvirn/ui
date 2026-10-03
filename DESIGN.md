---
version: alpha
name: KvirnUI default theme
description: Calm, precise and plain. A quiet, product-grade interface for Nordic and EU public services. Near-black and near-white canvases, a surface ladder with hairline dividers, one lavender accent, and IBM Plex typography (Plex Sans for text, Plex Serif for headings), with contrast, focus and target size held to WCAG 2.2 AA or better.
colors:
  canvas: '#ffffff'
  surface: '#f7f8f8'
  surface-raised: '#ffffff'
  border-subtle: '#e4e5e7'
  border-control: '#6b7079'
  secondary: '#6b7079'
  text: '#0f1011'
  heading: '#0f1011'
  text-muted: '#5d6169'
  primary: '#5e6ad2'
  primary-hover: '#4f5ac0'
  on-primary: '#ffffff'
  primary-subtle: '#eff0fb'
  link: '#4f5ac0'
  link-hover: '#434db3'
  focus-ring: '#5e6ad2'
  danger: '#b3273f'
  danger-hover: '#962034'
  on-danger: '#ffffff'
  danger-subtle: '#fdeef0'
  success: '#1d7048'
  success-subtle: '#e9f6ef'
  warning: '#8a5300'
  warning-subtle: '#fff4dc'
typography:
  display:
    fontFamily: 'IBM Plex Serif, ui-serif, Cambria, Noto Serif, Georgia, serif'
    fontSize: 2.5rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  heading-1:
    fontFamily: 'IBM Plex Serif, ui-serif, Cambria, Noto Serif, Georgia, serif'
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0em
  heading-2:
    fontFamily: 'IBM Plex Serif, ui-serif, Cambria, Noto Serif, Georgia, serif'
    fontSize: 1.375rem
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0em
  heading-3:
    fontFamily: 'IBM Plex Serif, ui-serif, Cambria, Noto Serif, Georgia, serif'
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0em
  body-large:
    fontFamily: 'IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: 'IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: 'IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: 'IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.4
  label-compact:
    fontFamily: 'IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.3
  numeric:
    fontFamily: 'IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: '"tnum"'
  code:
    fontFamily: 'ui-monospace, SF Mono, Cascadia Code, Menlo, Consolas, monospace'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  '0': 0px
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  '16': 64px
  '24': 96px
components:
  # Buttons also have gentle depth (a shadow and a tinted edge) in light and dark, and none in the
  # contrast themes. The DESIGN.md format has no shadow property, so it's in prose: see
  # "Elevation & Depth", "Button depth" (ADR-0026).
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 0 16px
    height: 44px
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  button-secondary:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.text}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 0 16px
    height: 44px
  button-secondary-hover:
    backgroundColor: '{colors.primary-subtle}'
  button-danger:
    backgroundColor: '{colors.danger}'
    textColor: '{colors.on-danger}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 0 16px
    height: 44px
  button-danger-hover:
    backgroundColor: '{colors.danger-hover}'
  button-compact:
    typography: '{typography.label-compact}'
    rounded: '{rounded.md}'
    padding: 0 12px
    height: 32px
  button-icon-only:
    padding: 8px
    width: 44px # minimum, equal to the button's minimum height; 32px in compact density
  link:
    textColor: '{colors.link}'
  link-hover:
    textColor: '{colors.link-hover}'
  nav-item:
    backgroundColor: transparent
    textColor: '{colors.text}'
    typography: '{typography.label-compact}'
    rounded: '{rounded.md}'
    padding: 0 12px
    height: 32px
  nav-item-current:
    backgroundColor: '{colors.primary-subtle}'
    textColor: '{colors.text}'
  input:
    backgroundColor: '{colors.canvas}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: 0 12px
    height: 44px
  card:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.text}'
    rounded: '{rounded.lg}'
    # 16px below 40rem, and in compact density from 64rem (Plan 0007).
    padding: 24px
  section:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.none}'
    # 16px below 40rem, and in compact density from 64rem (Plan 0018).
    padding: 24px
  notification:
    # Per status class: primary-subtle, success-subtle, warning-subtle, danger-subtle. Surface without one.
    backgroundColor: '{colors.primary-subtle}'
    textColor: '{colors.text}'
    rounded: '{rounded.sm}'
    # 12px inline below 40rem. 12px block and inline in compact density from 64rem (Plan 0020).
    padding: 16px
  popup:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.text}'
    rounded: '{rounded.xl}'
    padding: 8px
  badge:
    backgroundColor: '{colors.primary-subtle}'
    textColor: '{colors.link}'
    typography: '{typography.body-small}'
    rounded: '{rounded.full}'
    padding: 2px 10px
---

# KvirnUI design language

This file is the visual and interaction source of truth for everything in KvirnUI that has a look: the default theme (`@kvirn-ui/theme`), the styled blocks (`@kvirn-ui/blocks`), Storybook stories and the docs site. The headless packages ship zero CSS and are not bound by it (AGENTS.md hard rule 5).

It is a default, not a brand (see `docs/vision.md`, non-goals). A municipality rebrands by overriding the `--kv-*` custom properties (see [Theming](#theming)), and everything here is written so that a rebrand stays accessible. The front matter follows the [DESIGN.md format](https://github.com/google-labs-code/design.md) and holds the **light** theme. The other three themes are in the semantic mapping below. The implementation is `packages/theme/theme.css`, a hand-written file that is the source of truth for values, and every contrast pair is enforced by `vp run theme:check`.

Changing a token or a rule here is a decision: write an ADR and update `theme.css` in the same change.

> **Status: Accepted (ADR-0014, 2026-10-01).** The values here are the visual direction the maintainer chose after reviewing the Plan 0005 prototype. `theme.css` implements them (ADR-0013, ADR-0017, ADR-0018, ADR-0019), and ADR-0011 still describes the process.

## Overview

**Calm, precise, plain.** The interface is quiet so that the content and the next step are loud. The look:

- a near-black dark canvas and a near-white light one
- a ladder of slightly lifted surfaces instead of shadows, with 1px hairline dividers. The one control with depth is the button, which sits on the page with a gentle shadow and a tinted edge so it reads as "press me" (ADR-0026)
- one lavender accent (`#5e6ad2`), used sparingly
- IBM Plex Sans for text and controls, and IBM Plex Serif for headings, with no negative tracking below the display size
- 8px control radii

Nothing decorative competes with the task.

KvirnUI serves public services. Wherever a look like this usually relies on low-contrast greys, faint control borders, a lighter hover behind white text, or small labels on resident-facing controls, we keep the look and change the value until it passes WCAG 2.2 AA (and 7:1 for text in the contrast themes). Each deviation is listed in ADR-0014.

Who we design for:

- **Residents** using e-services (applications, bookings, reports, payments), often once, often on a phone, sometimes stressed. They include older people, people with cognitive, visual or motor disabilities, people with low digital confidence and people reading in their second language. Some read Northern Sámi, Finnish, Swedish or Norwegian, and Finland and Norway publish in two languages.
- **Case workers and staff** using internal tools every day on a desktop. They need speed, density and keyboard efficiency, but the same accessibility bar applies, because staff have disabilities too.

Principles, in priority order:

1. **Clarity over cleverness.** Everyone should understand what the page is, what they need to do and what happens next, without prior knowledge.
2. **Accessible by construction.** Contrast, focus, target size and reflow are properties of the tokens, not a later fix. WCAG 2.2 AA is the floor. The default theme also meets 2.4.13 Focus Appearance, and 2.5.5 Target Size (Enhanced) in comfortable density.
3. **Quiet interface, loud content.** Neutral chrome, one accent, colour used for meaning, never for decoration.
4. **Precision.** A 4px grid, consistent radii, 1px lines, aligned edges and optical balance. Precision reads as trustworthiness, and public services need trust.
5. **Density fits the context.** Comfortable for residents by default. Compact is opt-in for staff tools and developer surfaces, and never below AA.
6. **Respect the user's settings.** OS colour scheme, contrast, forced colours, reduced motion, zoom and text spacing always win (ADR-0006).

## Colors

The palette is neutral grey with a faint cool tint, a four-step ladder from canvas to raised surface, and one lavender accent (the primary scale). Colour carries meaning: the accent means "interactive or selected", and the status colours mean danger, success and warning. Status is never conveyed by colour alone (1.4.1): it is always paired with text and, where useful, an icon.

Colours come in two tiers, both CSS custom properties in `theme.css`:

- **Palette.** Role scales, Tailwind-style, from 50 (lightest) to 950 (darkest), each step darker than the last. They are named by role, never by hue, so a rebrand overrides a scale without a refactor (ADR-0019):
  - `--kv-neutral-*`: grey with a faint cool tint. Canvases, surfaces, borders and text.
  - `--kv-primary-*`: lavender by default, `#5e6ad2` is `primary-500`. The one accent: primary buttons, links, focus, selection.
  - `--kv-secondary-*`: the neutral steps by default (`--kv-secondary-500: var(--kv-neutral-500)`). The secondary button's edge, so a brand can give it a hue.
  - `--kv-accent-*`: teal by default. Not used by the default theme, which keeps one accent. It's there for a brand's second colour.
  - `--kv-danger-*` (red), `--kv-success-*` (green) and `--kv-warning-*` (amber).
  - `--kv-white` and `--kv-black` (`#010102`).

  The palette is the only place with raw colour values.

- **Semantic tokens,** `--kv-color-<name>`. Components use only these. Each theme points them at palette steps. Four themes come from two preference axes, colour scheme and contrast (ADR-0006), and only remap semantic tokens.

| Token            | light           | dark            | light-contrast  | dark-contrast   | Use                                                                                               |
| ---------------- | --------------- | --------------- | --------------- | --------------- | ------------------------------------------------------------------------------------------------- |
| `canvas`         | `white`         | `black`         | `white`         | `black`         | Page background, and a canvas section (`kv-section--canvas`)                                      |
| `surface`        | `neutral-50`    | `neutral-950`   | `neutral-50`    | `neutral-950`   | Sections (`Section`), sidebars, table headers, code                                               |
| `surface-raised` | `white`         | `neutral-900`   | `white`         | `neutral-900`   | Cards, popups, dialogs, hovered navigation items                                                  |
| `border-subtle`  | `neutral-100`   | `neutral-800`   | `neutral-500`   | `neutral-400`   | Hairline dividers and decorative outlines only                                                    |
| `border-control` | `neutral-500`   | `neutral-500`   | `neutral-700`   | `neutral-200`   | Borders that identify a control (inputs, checkboxes)                                              |
| `secondary`      | `secondary-500` | `secondary-500` | `secondary-700` | `secondary-200` | The secondary button's edge. Equal to `border-control` until `--kv-secondary-*` gets a hue        |
| `text`           | `neutral-950`   | `neutral-50`    | `black`         | `white`         | Body text                                                                                         |
| `heading`        | `neutral-950`   | `neutral-50`    | `black`         | `white`         | Headings in prose. The same step as `text` by default, so a site can set its own                  |
| `text-muted`     | `neutral-600`   | `neutral-400`   | `neutral-700`   | `neutral-200`   | Secondary text and metadata. Not hints: a hint is an instruction, so it uses `text`               |
| `primary`        | `primary-500`   | `primary-500`   | `primary-800`   | `primary-200`   | Primary button background, selected state, current-page indicator, info notification bar and icon |
| `primary-hover`  | `primary-600`   | `primary-600`   | `primary-900`   | `primary-100`   | Hover and pressed state of `primary`                                                              |
| `on-primary`     | `white`         | `white`         | `white`         | `black`         | Text and icons on `primary`                                                                       |
| `primary-subtle` | `primary-50`    | `primary-950`   | `primary-50`    | `primary-950`   | Current navigation item, secondary button hover, selected rows, info notifications                |
| `link`           | `primary-600`   | `primary-400`   | `primary-800`   | `primary-200`   | Link text, badge text                                                                             |
| `link-hover`     | `primary-700`   | `primary-300`   | `primary-900`   | `primary-100`   | Link hover and pressed                                                                            |
| `focus-ring`     | `primary-500`   | `primary-400`   | `primary-800`   | `primary-200`   | Focus indicator                                                                                   |
| `danger`         | `danger-600`    | `danger-300`    | `danger-700`    | `danger-200`    | Errors, destructive actions, danger notification bar and icon                                     |
| `danger-hover`   | `danger-700`    | `danger-200`    | `danger-800`    | `danger-100`    | Hover and pressed state of `danger`                                                               |
| `on-danger`      | `white`         | `black`         | `white`         | `black`         | Text and icons on `danger`                                                                        |
| `danger-subtle`  | `danger-50`     | `danger-950`    | `danger-50`     | `danger-950`    | Danger notifications, including the error summary                                                 |
| `success`        | `success-700`   | `success-300`   | `success-800`   | `success-200`   | Confirmation, completed steps, success notification bar and icon                                  |
| `success-subtle` | `success-50`    | `success-950`   | `success-50`    | `success-950`   | Success notifications                                                                             |
| `warning`        | `warning-700`   | `warning-300`   | `warning-800`   | `warning-200`   | Warnings, deadlines, warning notification bar and icon                                            |
| `warning-subtle` | `warning-50`    | `warning-950`   | `warning-50`    | `warning-950`   | Warning notifications                                                                             |

The palette values are in `theme.css`, section 1. Measured contrast (2026-10-01, `vp run theme:check`, 81 contrast pairs and, since Plan 0020, 56 tinted button edges per theme):

- **Text.**
  - Every text token (`text`, `heading`, `text-muted`, `link`, `danger`, `success`, `warning`) is at least 4.5:1 on `canvas`, `surface`, `surface-raised` and the `-subtle` backgrounds it's used on in the standard themes. The lowest pairs are `on-primary` on `primary` (4.70:1) and `text-muted` on `primary-subtle` in dark (4.80:1).
  - In the contrast themes the minimum is 7:1. The lowest pair is `danger` on `danger-subtle` in light-contrast (7.31:1).
- **Control borders and focus.** `border-control`, `secondary`, `focus-ring` and `primary` (used as a selected or current indicator) are at least 3:1 against `canvas`, `surface`, `surface-raised` and `primary-subtle` in every theme. The lowest pairs are `border-control` and `secondary` on `primary-subtle` in dark (3.13:1).
- **Labels on filled buttons.** `on-primary` on `primary` is at least 4.70:1, and on `primary-hover` at least 5.91:1. `on-danger` on `danger` is at least 6.40:1, and on `danger-hover` at least 8.23:1.
- **Tinted button edges** (ADR-0026; `theme:check` measures all 56 per theme: 4 bases, tinted by the shade and by the highlight, on 3 surfaces and the 4 notification backgrounds, because a notification's Actions hold buttons, ADR-0047). They only raise the boundary: the light bottom edge is at least 7.51:1 and the dark top edge at least 5.78:1 on `canvas`, `surface` and `surface-raised`, and each is held to 3:1 on `primary-subtle`, `success-subtle`, `warning-subtle` and `danger-subtle` too. The full table is in [Button depth](#button-depth).

Rules:

- **`border-subtle` never identifies a control.** Anything a user must perceive to operate (input edges, checkbox boxes) uses `border-control`, and a secondary button's outline uses `secondary`, both held to 3:1 (1.4.11). Hairlines are 1.15–1.36:1 in the standard themes (4.68–6.42:1 in the contrast themes), so they are `border-subtle` only.
- **The focus ring has an offset.** `focus-ring` on `primary` is about 1:1, so the ring sits 2px outside the element, where the adjacent colour is the background.
- **Filled buttons get darker on hover, never lighter.** A lighter hover behind white text fails 4.5:1: white on `#828fff` is 2.87:1.
- **Links use `link` and are underlined** in running text. In dark themes `link` is lighter than `primary`, because `#5e6ad2` as text on the dark canvas is only 4.44:1.
- **Navigation lists** may drop the underline and use the `text` colour, because position in a labelled `<nav>` list is the cue. The current item always has a non-colour cue: an inline-start bar and weight 600, plus `aria-current`.
- **Dark themes are not inverted light themes.** Raised surfaces get lighter, not shadowed. The one exception is the button (ADR-0026): its depth in dark comes from a lighter top edge, and its ambient shadow is barely visible on near-black. Its bottom edge never gets darker in dark, because a darkened edge drops to 1.80–2.20:1 there.
- **`heading` is held to everything `text` is.** A site that gives headings their own colour keeps 4.5:1 (7:1 in the contrast themes) on every background body text sits on, and `theme:check` measures it. In forced colours both are `CanvasText`.
- **Forced colours** (`forced-colors: active`): use system colours (`Canvas`, `CanvasText`, `LinkText`, `ButtonText`, `Highlight`, `GrayText`). Every surface and control keeps a 1px border, even if it is transparent in the normal theme, so boundaries survive. Selected and current states get a non-colour cue such as a border, a check mark or `text-decoration`.

Rebranding for a municipality:

- Override one scale on `:root`: give `--kv-primary-*` the brand's eleven steps, and every semantic token and all four themes follow. Each theme uses different steps (light 500 and 600, dark 500 and 400, the contrast themes 800 and 200), so swapping a scale can break contrast. Check a customised copy with `checkThemeCss()` (or `vp run theme:check`), or on the live Foundation/Theming page. If the coat-of-arms colour fails, use it in the header band or the logo, and build the scale from a darker or lighter shade of it.
- Give `--kv-secondary-*` a hue to colour the secondary button's edge. `--kv-accent-*` is free for a brand's second colour.
- Pointing one semantic token at another step (`--kv-color-link: var(--kv-primary-700)`) also works, for a single change.
- Override `danger` and `danger-hover` together, if at all.
- Button depth follows the scales: the tinted edges mix the current edge or fill with `--kv-button-edge-shade` or `--kv-button-edge-highlight`, so they change with a rebrand. `checkThemeCss()` will measure them once ADR-0026 is implemented. For flat buttons, set `--kv-shadow-button` and `--kv-shadow-button-hover` to `none` and both edge tokens to `0%` (`var(--kv-neutral-950) 0%`, `var(--kv-white) 0%`).
- Never reuse a brand red for `danger` or a brand green for `success`, because users will read the brand colour as a status.

## Typography

One sans-serif family for text and controls, one serif family for headings, each with a system fallback, and one monospace family for reference numbers and code.

- **Families.** Body text and controls (prose, buttons, labels, navigation, tables and captions) use `--kv-font-family-body`, which falls back to `--kv-font-family-sans`. Prose headings (`h1`–`h6`) use `--kv-font-family-heading`, which falls back to `--kv-font-family-serif`. Use the same family wherever you apply the `display` tokens. The theme sets neither override. A link keeps the font around it, and code stays `--kv-font-family-mono`. The serif is only for real headings: anything users operate or scan as data stays sans, and hierarchy never depends on the family alone. A notification's title is the exception that stays sans (weight 600, 18px): it is a message label, not a section heading, and a serif at that size would read as new page structure.
- **Why IBM Plex.** Plex Sans's capitals sit in the middle of the line box, and its vertical metrics are the same on every OS (`hhea` = `win`, 1025/275), so labels sit the same way on every OS. It tells l, I and 1 apart without features, and it covers every Northern Sámi letter. Plex Serif shares its metrics and gives headings a distinct, calm voice. Both are SIL OFL 1.1, with "Plex" a Reserved Font Name: use IBM's files unmodified, and never subset or rename them.
- **Weights.** Sans 400 (text), 500 (labels and controls) and 600 (`strong`, the current item). Serif 500 (`heading-2`) and 600 (the other headings). Upright only: italics are synthesised. Nothing uses 700.
- **System stacks.** `--kv-font-family-system` is `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif`, and `--kv-font-family-sans` is `'IBM Plex Sans'` in front of it. `--kv-font-family-system-serif` is `ui-serif, Cambria, 'Noto Serif', Georgia, serif`, and `--kv-font-family-serif` is `'IBM Plex Serif'` in front of it. End a brand stack with the matching system stack, and check the Glyphs story in Foundation/Typography.
- **Loading.** The theme never loads a font (GDPR, AGENTS.md hard rule 7). The docs site and Storybook self-host IBM's split woff2 files (Latin1, Latin2, Pi). Adopters either self-host the same files, from [IBM Plex's GitHub releases](https://github.com/IBM/plex/releases) or copied from `apps/docs/fonts/ibm-plex/` with `OFL.txt`, or rely on the system fallback. The `@ibm/plex-sans` and `@ibm/plex-serif` npm packages send IBM telemetry from a `postinstall` script. Don't install them as dependencies: fetch them with `npm pack`, or set `IBM_TELEMETRY_DISABLED=true` if you must install them. A replacement brand font must cover the Sámi letters as well as å ä ö æ ø.
- **Disambiguation.** No feature settings are needed: Plex's `I` has serifs, its `l` a tail and its `1` a flag and a foot. Don't turn on the slashed zero (`zero`, `ss03`), which reads as Ø in Danish and Norwegian. Set codes where O and 0 matter in `code` (mono), or add `'ss04'` (the dotted zero). A brand font that needs features for l, I and 1 sets them in the `--kv-font-*-feature-settings` tokens (Inter: `'cv05', 'cv08'`).
- **Numbers.** Use `numeric` (tabular figures) for tables, amounts, dates and reference numbers.
- **Scale.**
  - `body` is 1rem (16px) and never smaller for essential content. Long resident-facing text uses `body-large`.
  - `lead` (20px, weight 400, no tracking) is only for the lead paragraph of large prose. The lead of default prose uses `body-large`. A lead is essential content, so it is always `text`, never `text-muted`.
  - `body-small` (14px) is for metadata, and never for instructions or errors.
  - `label-compact` (14px, weight 500) is only for control labels in compact density: staff tools, and the docs site's navigation and header controls.
  - There is no 12px or 13px size, so there are no small captions or eyebrows.
  - **Below `40rem`** the large roles step down (ADR-0028): `display` 32px with no tracking, `heading-1` 24px, `heading-2` 20px and `lead` 18px. `heading-3` and the body roles never change. The front matter holds the sizes from `40rem` up.
- **Headings.** Weight 600 (500 for `heading-2`). `display` has −0.01em tracking and line height 1.2, so the ring on Å clears the descenders above it. Below 40px there is no tracking: negative tracking crowds the serifs, and it reverses under the 1.4.12 overrides anyway.
- **One family, or keep Inter.** For a single family, set `--kv-font-family-heading: var(--kv-font-family-sans)`. To keep Inter, set both family tokens and the body feature settings.
- **Line length** is 60–75 characters (`--kv-prose-measure`, `70ch`, on prose).
- **Sentence case** everywhere. No all-caps labels, headings or eyebrows, because they are slower to read and some screen readers spell them out.
- **Text spacing (1.4.12).** Everything must keep working with line height 1.5, paragraph spacing 2em, letter spacing 0.12em and word spacing 0.16em. No fixed heights on text containers. The `height` values in the front matter are minimum block sizes.
- **Sizes in `rem`,** so browser zoom and font-size settings work (1.4.4).

## Layout

- **Grid.** Everything sits on a 4px grid, and the spacing scale is in the front matter (`--kv-space-<step>`). Most layouts use steps 2, 4, 6 and 8.
- **Reading column.** Resident-facing services use a single column of at most `40rem` for forms and `45rem` for prose. One question or one topic per page wherever possible.
- **Staff tools and the docs site** may use a sidebar (a `Section`) and a content area. The sidebar collapses behind a disclosure below `64rem`.
- **Breakpoints** are content-driven, but the reference points are `40rem`, `64rem` and `80rem`. Design mobile first.
- **Reflow (1.4.10).** Everything works at 320 CSS px wide and at 400% zoom without horizontal scrolling, except data tables, which scroll inside their own labelled, focusable region.
- **Text expansion.** Finnish and Northern Sámi strings can be 30–50% longer than English, and Finnish compounds are long. Buttons and labels wrap. Never set a fixed width on anything containing text, and use `overflow-wrap: anywhere` as a last resort, not truncation. Prose, cards and notifications hyphenate words of 10 letters or more at the dictionary's points (`hyphens: auto`, `hyphenate-limit-chars: 10 4 4`), never inside code, and fall back to `overflow-wrap: break-word` where there's no dictionary, as for Northern Sámi (ADR-0028). Hyphenation follows `lang`, so set it on `<html>` and on every passage in another language.
- **Direction.** Use logical properties (`margin-inline-start`, `padding-block`) so RTL works.
- **Sticky elements** (headers, action bars) must never cover the focused element (2.4.11). Use `scroll-padding` to match their height.

### Density

Density is set on a container with `class="kv-compact"`. Comfortable is the default, and needs no class. On `<html>` or `<body>`, the class makes a whole staff tool compact.

| Density               | Control min height | Label type      | Min target | Use                                                                                                                     |
| --------------------- | ------------------ | --------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Comfortable (default) | 44px               | `label` (16px)  | 44×44px    | Everything resident-facing, and every primary action. Meets 2.5.5 Target Size (Enhanced)                                |
| Compact (opt-in)      | 32px               | `label-compact` | 24×24px    | Staff tools, tables, toolbars, and the docs site chrome at 64rem and wider. Meets 2.5.8 only, and is documented as such |

Below `64rem`, where touch input is likely, compact chrome returns to comfortable.

## Elevation & Depth

Depth comes from the surface ladder (`canvas` → `surface` → `surface-raised`) and 1px hairlines, not from shadows. The look is flat and precise. The one exception is the button, which isn't a surface level: see [Button depth](#button-depth).

| Level | Surface          | Border                                             | Shadow                                                                                              | Use                            |
| ----- | ---------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------ |
| 0     | `canvas`         | none                                               | none                                                                                                | Page                           |
| 1     | `surface`        | 1px `transparent` (`CanvasText` in forced colours) | none                                                                                                | Sections, sidebars (`Section`) |
| 2     | `surface-raised` | `border-subtle`                                    | none                                                                                                | Cards (`Card`)                 |
| 3     | `surface-raised` | `border-subtle`                                    | `--kv-shadow-popup`. Light: `0 8px 24px -4px` `neutral-950` at 12%. Dark: none (surface is lighter) | Popups, menus, popovers        |
| 4     | `surface-raised` | `border-subtle`                                    | `--kv-shadow-dialog`. Light: `0 24px 48px -8px` `neutral-950` at 20%. Dark: none                    | Dialogs (with a backdrop)      |

- The shadow tokens mix `--kv-neutral-950` with `color-mix()`, so the palette block stays the only place with raw colours (ADR-0013, ADR-0018). Both are `none` in the dark themes.

- A dialog backdrop dims the page, so it must not reduce the dialog's own contrast. Content behind a modal is `inert`.
- Shadows are never the only boundary, because they disappear in forced colours.
- A notification isn't a level. It is a tinted block in the content, at the level of whatever it sits on, with no shadow, and its edge is its 4px bar.
- Level 1 has no visible edge: its 1px border is `transparent`, and `CanvasText` in forced colours. A region is identified by its position, its heading and, where it is worth it, a named landmark. A consumer may colour the one edge that meets content with `border-subtle`, for example `border-inline-end-color` on a sidebar.
- **Motion.** Durations are 120ms (hover, press), 180ms (popups, disclosures) and 240ms (dialogs, page-level). Easing is `cubic-bezier(0.2, 0, 0, 1)`. Motion only runs under `prefers-reduced-motion: no-preference`, and otherwise state changes are instant. No parallax, no auto-playing carousels, nothing that flashes, and no animation longer than 5 seconds without a pause control (2.2.2).

### Button depth

> **Status: Proposed (ADR-0026, 2026-10-01), implemented in `theme.css` (plan 0010).** The design spec is `docs/design/button-depth.md` (variation D, "Grounded").

Buttons (`.kv-button`, `kv-button--primary`, `kv-button--danger`) sit on the page: a soft ambient shadow, and a 1px edge that's tinted darker at the bottom in light and lighter at the top in dark. Depth means "press me", so nothing else gets it.

| State                    | Shadow                     | Edges                                                                                 |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------- |
| Rest                     | `--kv-shadow-button`       | Tinted: the bottom edge in light, the top edge in dark. The others are the token edge |
| Hover                    | `--kv-shadow-button-hover` | Tinted, following the hover edge (`primary` on the base and primary buttons)          |
| Pressed (`:active`)      | none                       | The token edge on all four sides                                                      |
| Focus-visible, any state | **none**                   | Tinted, as at rest or on hover                                                        |
| Disabled                 | none                       | Today's dashed `border-control` on all four sides                                     |

- **Tinting.** An edge is `color-mix(in srgb, <edge>, var(--kv-button-edge-shade))` at the bottom and `color-mix(in srgb, <edge>, var(--kv-button-edge-highlight))` at the top. `<edge>` is the button's token edge in that state (`secondary`, `primary` or `transparent`). Over a transparent edge the mix shows over the fill, so a filled button's bottom edge is its fill with 35% ink. A tinted edge must never lower a boundary: it's held to 3:1 on `canvas`, `surface` and `surface-raised` (1.4.11).
- **Focus.** The shadow goes on keyboard focus, so the ring's adjacent colour is the plain page and its contrast is exactly the measured `focus-ring` pair. With the hover shadow under the ring, it was 3.04:1 on `surface` in light, unmeasured by `theme:check`. Focus is still shown only by the ring, never by the shadow.
- **Dark.** Only the top edge changes, and it gets lighter. The bottom keeps the token edge (see Colors).
- **Contrast themes:** flat. Both shadows are `none` and both edge tokens `0%`, so every edge is the measured token on all four sides.
- **Forced colours:** no shadow, and all four edges are the system colour (`ButtonText`, `Highlight` on hover and pressed, dashed `GrayText` when disabled). The same as without depth.
- **Motion:** `box-shadow` transitions with the other button properties over `--kv-duration-fast`, only under `prefers-reduced-motion: no-preference`.
- **Never the only cue.** Depth disappears in forced colours and the contrast themes, so the fill, the edge and the label carry the button on their own, as before.

| Token                        | light                                                                   | dark                       | light-contrast, dark-contrast, forced colours |
| ---------------------------- | ----------------------------------------------------------------------- | -------------------------- | --------------------------------------------- |
| `--kv-shadow-button`         | `0 1px 2px` `neutral-950` at 6%, `0 2px 6px -1px` `neutral-950` at 12%  | `0 1px 2px` `black` at 60% | `none`                                        |
| `--kv-shadow-button-hover`   | `0 1px 2px` `neutral-950` at 6%, `0 4px 10px -2px` `neutral-950` at 12% | `0 2px 6px` `black` at 60% | `none`                                        |
| `--kv-button-edge-shade`     | `var(--kv-neutral-950) 35%`                                             | `var(--kv-neutral-950) 0%` | `var(--kv-neutral-950) 0%`                    |
| `--kv-button-edge-highlight` | `var(--kv-white) 0%`                                                    | `var(--kv-white) 25%`      | `var(--kv-white) 0%`                          |

The shadows mix the palette with `color-mix(in srgb, <colour> N%, transparent)`, like `--kv-shadow-popup`. The edge tokens are a colour and a percentage, the second argument of `color-mix()`.

Measured tinted edges (contrast against `canvas` / `surface` / `surface-raised`):

| Edge                                           | light, bottom         | dark, top             |
| ---------------------------------------------- | --------------------- | --------------------- |
| Base button at rest (`secondary`)              | 8.33 / 7.83 / 8.33    | 6.85 / 6.25 / 5.78    |
| Base hover, primary rest and hover (`primary`) | 7.99 / 7.51 / 7.99    | 6.94 / 6.34 / 5.86    |
| Danger at rest (`danger` fill)                 | 10.17 / 9.56 / 10.17  | 11.36 / 10.37 / 9.58  |
| Danger hover (`danger-hover` fill)             | 11.97 / 11.25 / 11.97 | 14.13 / 12.90 / 11.92 |

## Shapes

- **Radii** are small and consistent:
  - `sm` (4px) for badges inside controls, checkboxes, tags and notifications.
  - `md` (8px) for buttons, inputs and navigation items.
  - `lg` (12px) for cards and example frames.
  - `xl` (16px) for popups and dialogs.
  - `full` for pills and avatars.

  Radio buttons are always circles and checkboxes always rounded squares, so the shape tells them apart.

- **Lines** are 1px. The 4px indicator bar (`--kv-indicator-width`) marks the current navigation item, a blockquote and a notification. Control borders are 1px `border-control`, and invalid inputs switch to 2px `danger` plus an error message, never colour alone.
- **Focus ring**: 2px solid `focus-ring`, 2px offset, following the element's radius. It is restyled, never removed, and only shown for keyboard focus (`:focus-visible`, `data-focus-visible`). This meets 2.4.13. A thinner or glow-style focus is not used.
- **Icons**: outline style, a 1.5 stroke on a 24 grid with round caps and joins, in `currentColor`. `@kvirn-ui/react` ships 24 built-in icons with semantic names, in the style of Heroicons outline but drawn from our own keylines (`docs/design/icon.md`). An app that registers the same name in `KvirnProvider` replaces a built-in, and Kvirn's components follow it.
  - **Sizes** are `sm` 1em, `md` 1.25em (default) and `lg` 1.5em: 16, 20 and 24px next to 16px text, and they grow with the text. Use `md` in buttons, because it equals their line height. Size, stroke and colour are SVG attributes. The theme never sets them, except in forced colours, where an icon takes its parent's system colour.
  - **Meaning.** An icon is decorative (`aria-hidden`) unless it has a `label` from i18n. A status icon always comes with the status in words, and the four statuses differ in shape as well as colour: info a square, success a circle, warning a triangle, error an octagon. A meaningful icon has 3:1 contrast against its background.
  - **Direction.** Name by meaning (`chevron-forward`, `arrow-back`). Only icons that show horizontal direction mirror in RTL (`mirrorInRtl`). Check marks, status icons, objects and `search` never mirror.
  - **Icon-only buttons** (`kv-button--icon-only`) are square, at least the button's minimum height, with 8px padding. Use them only for close and search, with an accessible name from i18n and, from M2, a visible tooltip with the same text. The menu toggle on resident-facing pages shows the word "Menu" too.
  - Icons are inline SVG. No icon fonts, and no icons from third-party servers.

## Components

Visual rules for the default theme. Behaviour, roles and keyboard are defined in each component's `<name>.a11y.md`, never here. Style parts and variants through classes, and state through the `data-*` attributes (`docs/architecture.md#styling-contract`): `.kv-button`, `.kv-button--primary`, `[data-disabled]`. `theme.css` implements Button, Link, prose, Card, Section and Notification. The design specs are `docs/design/default-theme-button-link.md`, `docs/design/foundations-and-prose.md`, `docs/design/card.md`, `docs/design/section.md` and `docs/design/notification.md`.

**Words we use.** Each of these words means one thing, in this file, the docs, Storybook, specs, ADRs and code comments:

- **Surface** is a background colour token (`canvas`, `surface`, `surface-raised` and the `-subtle` backgrounds), not a box or a component.
- **Section** is a region of the page: elevation level 1.
- **Card** is one thing people read, compare or act on as a unit: elevation level 2.
- **Notification** is a status message in the content: `Notification.Info`, `.Success`, `.Warning` and `.Danger`.
- **Toast** is a transient notification that floats over the page and goes away (a later component). It reuses the Notification look and status words.
- **Alert** is only the ARIA role `alert` and the `AlertDialog` component. It is never a status component.

"Panel" is retired (say Section), and "banner" and "callout" aren't KvirnUI words (`banner` is the ARIA landmark of the site header). Say Notification for a status and Section for a region.

- **Buttons.**
  - One primary button per view, for the main next step. Secondary buttons use `surface-raised` with a `border-control` outline. A hairline edge doesn't reach 3:1.
  - Destructive actions use `button-danger` and a confirmation step.
  - Labels are verbs ("Send application", "Book time").
  - Disabled buttons keep their label readable, with a dashed border as the non-colour cue. Prefer keeping them enabled and explaining what's missing on submit.
  - A hovered or pressed primary button keeps a 1px `primary` edge around its `primary-hover` fill, so its boundary stays at 3:1 on `surface-raised` in dark (ADR-0021).
  - Buttons have gentle depth in light and dark: a soft shadow that lifts a little on hover and goes on press and on keyboard focus, and a tinted edge. Disabled buttons, the contrast themes and forced colours are flat. So is a button inside an input group, which is part of the box. See [Button depth](#button-depth) (proposed, ADR-0026).
  - Size follows the density. A site can size every button without touching other controls with `--kv-button-min-block-size`, `--kv-button-padding-inline`, `--kv-button-font-size`, `--kv-button-font-weight` and `--kv-button-line-height`, which fall back to the `--kv-control-*` tokens. Set, they win over density, so the height never goes below 24px (2.5.8), and resident-facing buttons stay at 44px.
- **Links** look like links (underlined `link`) and buttons look like buttons. Never swap the two. The hover state thickens the underline to 2px and uses `link-hover`.
- **Sections** are elevation level 1: a region of the page, such as a sidebar or a band of content. A section is a plain container, never interactive, and it renders a `<div>`: a landmark is the consumer's choice (`<aside>`, `<section>` or `<nav>`) and must be named.
  - Choose with classes on the Root: the surface (`surface` by default, or `kv-section--canvas` for a region that looks like the page again inside a `surface` one) and the padding (`kv-section--padding-none`, `-sm`, `-md` or `-lg`). `md` (the default) is 24px, and 16px below `40rem` and in compact density from `64rem`. `sm` is 12px, `lg` is 32px (24px where `md` is 16px), and `none` is for a frame whose children pad themselves, and for full-bleed media.
  - Square, no shadow, and no overflow, so focus rings are never clipped. The 1px border is `transparent`, so the background paints under it, and `CanvasText` in forced colours. There is no hairline by default: a region doesn't look like an object. A consumer colours the one edge that meets the content with `border-subtle` if they want it.
  - Not a prose boundary: a section in prose gets prose's block margins on its own element, and its content stays prose. Put `kv-prose` on a sidebar section, and inside a full-width band.
  - A card on a section keeps its default look. The design spec is `docs/design/section.md`.

  A card is never interactive and has no shadow (ADR-0020). Section and Card sit on elevation levels 1 and 2 (Storybook: Foundation / Borders and elevation).

- **Cards** are elevation level 2: `surface-raised`, a 1px `border-subtle` edge, the `lg` radius and no shadow. A card is a plain container and is never interactive: no hover, shadow or pointer style, because those suggest the whole card is clickable.
  - A card is always `surface-raised`: a region of the page is a Section. Choose with classes on the Root: the radius (`lg` by default, `kv-card--radius-md` for a card nested in a card, `kv-card--radius-none` for a card flush with an edge) and `kv-card--dividers` (a `border-subtle` line between parts).
  - Padding goes on the Root, for every part (`kv-card--padding-none`, `-sm` or `-lg`), or on one part (`kv-card-header--padding-none`, and likewise for the body and footer, in all four steps): `md` (the default) is 24px, and 16px below `40rem` and in compact density from `64rem`. `sm` is 12px, `lg` is 32px (24px where `md` is 16px), and `none` is for full-bleed media. Use `none` on a part only, so the other parts' edges line up.
  - Parts are direct children of the Root. A Root without parts pads itself, and adjacent parts share one padding.
  - A site sets its own default for every card with `--kv-card-padding-default` and `--kv-card-radius-default`, and `kv-card--padding-md` or `kv-card--radius-lg` takes one card back to the theme's step. A default set on `:root` as `var(--kv-card-padding-lg)` is resolved there, so it doesn't step down inside a `kv-compact` container: set it on `.kv-card` or on the container instead.
  - A card never hides overflow, so focus rings are never clipped. Media that touch a rounded corner get its inner radius instead.
  - Footer actions use `kv-button-group` on the footer: start-aligned, primary first, and one primary per view. A card's one link goes in its heading. Navigation is a Link.
  - Never use `primary-subtle` or a status `-subtle` background as a card surface: status belongs in a [Notification](#components), with an icon and a status word.
  - Every card keeps its border, so its edge survives forced colours. Nest one level at most on resident-facing pages: `md` for the inner card. A card on a section keeps its default look.
- **Navigation items** use `nav-item`. The current item uses `primary-subtle`, weight 600, a `primary` inline-start bar and `aria-current`.
- **Text inputs.** A visible label above the input, then the hint, then the input. A second hint can go directly under the input, for a format or a character limit, and the error message comes last, under the input and any hint under it (ADR-0031). No placeholder-only labels. The input width reflects the expected answer (a postcode field is short).
  - Parts: `Field.Root` with `Field.Label`, a `Prose` for the hint, `Field.ErrorMessage` and the control (`Input`), and `Fieldset.Root` with `Fieldset.Legend` for a group (ADR-0029). KvirnUI holds no form state: the form logic sets `invalid`, `required` and `disabled`, and writes the messages. The hint is a `Prose` directly in the Field or Fieldset (ADR-0054), which is registered as the description, and a field can have several, one above and one under the control. This order is the default in the theme, the stories and the docs. The consumer owns the markup, and `aria-describedby` always lists the descriptions in DOM order, then the error. On submit, move focus to the error summary (or the first invalid field) and keep `scroll-padding` on the page, so the on-screen keyboard doesn't cover the message under the field.
  - The input is 44px high (32px in compact from 64rem) with a 1px `border-control` edge, the `md` radius, `0 12px` padding and `body` text at 16px in both densities. Hover darkens the edge to `text`. Focus is the 2px ring.
  - Invalid is a 2px `danger` edge with 1px less padding, so the text doesn't move, plus the error message under the input: never colour alone. Disabled is a dashed edge on `surface` with `text-muted` text, and read-only a solid edge on `surface`. The theme draws these from `data-invalid`, `aria-invalid="true"`, `:disabled` and `[readonly]`, never from `:invalid`.
  - The label is `label` type (`label-compact` in compact). A field that isn't required ends its label with "(optional)" in weight 400, which is part of its name. Required fields carry no marker. A hint above the input is `body` (16px) and a hint under it is `body-small` (14px, ADR-0054), both in `text` and never `text-muted`. Errors are `label` type at 16px in `danger` with the error icon and a visually hidden "Error:" prefix.
  - Width classes: `kv-input--width-2`, `-4`, `-6`, `-10` and `-20` count characters (a day or a number of children, a year, a postcode, a registration number, a phone number or a personal identity number), and include the 1.4.12 letter-spacing allowance and the 2px invalid edge. Without one, the input is full width. `kv-input--numeric` gives tabular figures. Numbers are text with `inputMode` (ADR-0030), never `type="number"`.
  - `kv-field-label--heading` and `kv-fieldset-legend--heading` make the label or legend the page's `h1` in `heading-1`, for one question per page. The design spec is `docs/design/form-fields.md`.
  - Units and icons inside the box use an input group (ADR-0031). `InputGroup.Root` (`kv-input-group`) is the box: the input's edge, fill, radius and states, and the focus ring around the whole group when its input has keyboard focus. The input inside has no edge or ring of its own. `InputGroup.Addon` (`kv-input-group-addon`) holds a short unit or symbol ("kr", "%", "km", at most 4 characters) or a decorative icon, in `body` type and `text` colour, with no fill or separator. Addons are hidden from screen readers, so the label always names the unit ("Månadshyra i kronor"). An Addon before the input is at the start, on the right in right-to-left. A button in a group (clear, show password) is a flat segment with a 1px `border-control` divider, as tall as the box (44px, 32px in compact), with `primary-subtle` on hover and its own focus ring. Width classes stay on the input, and the group fits around it.
  - A one-time code (ADR-0033, ADR-0045) is one native input. The theme draws the code over it as a row of boxes, one per character of its pattern, with a drawn dash wherever the pattern has a `-`: 44px squares (32px in compact) that shrink to 32px wide on a narrow screen, 8px apart (4px in compact), with the `md` radius, a 1px `border-control` edge and `numeric` figures. A dash is a 12px cell with no edge or fill, in `text`. Boxes and dashes are hidden from assistive technology and can't be pressed: every press goes to the input. The focus ring goes around the whole row. The box where the next character goes has a 2px `focus-ring` edge and a static caret, and selected characters a `primary-subtle` fill with the same edge. Invalid is a 2px `danger` edge on every box plus the error message under the row. Complete has no look of its own. The row reads left to right in every direction. The theme draws 4 to 10 characters in up to 3 groups (two dashes). In forced colours, when the row doesn't fit at 32px boxes, outside those limits, or before the script runs, it shows a plain input as wide as the pattern, with the same value (dashes included) and focus instead.
- **Checkboxes and radios** are at least 24px, with the whole label clickable, and are grouped in a `fieldset` with a `legend` question. A group's error message goes under the options, and a single checkbox's under its label.
- **Error summary.** A `Notification.Danger` at the top of `main` with the heading "Det finns ett problem" and a list of links to each invalid field, worded like the field errors. It receives focus on submit and isn't announced.
- **Notifications** are status messages in the content. Use `Notification.Info`, `.Success`, `.Warning` or `.Danger`: each renders its status class (`kv-notification--info|success|warning|danger`), its icon (square, circle, triangle, octagon) and a status word at the start of the title (visually hidden, from i18n), so colour, icon and word always agree. The look is only CSS on the class: the `-subtle` background and a 4px inline-start bar in the status colour, through `--kv-notification-background` and `--kv-notification-accent`. The `sm` radius, 16px padding, a sans title at 18px weight 600, no shadow. `Notification.Root` is the plain base, with no status, for your own design: you bring the icon and the word. Never colour alone. The title is a heading at the consumer's level, or a `<p>` for one sentence. Not dismissible. Announced only with `announce`, through the Announcer. The design spec is `docs/design/notification.md` (ADR-0047).
- **File upload.** A drop zone has a 1px dashed `border-control` edge at rest, and a 2px solid `primary` edge with a `primary-subtle` fill while a file is dragged over it. It's the one dashed edge that doesn't mean disabled: it's a target, not a control, and the button inside it carries the disabled look when it applies. Invalid is a 2px solid `danger` edge. The box is drawn only where a file can be dropped (a precise pointer, or while a file is dragged over the page). Each file is a row with a 4px inline-start bar that is `danger` only when the upload failed, a name that wraps anywhere, a type and size line in `text-muted`, a status in words (with an icon only for uploaded and cancelled), and a native `<progress>` that is a static hatch when the size is unknown, never animated. The design spec is `docs/design/file-upload.md` (ADR-0049).
- **Popups** (menus, listboxes, popovers) use level 3 elevation and `xl` radius, with 8px padding and items at least 44px high (32px in compact).
- **Prose.** Put `kv-prose` on the element around content you don't control, such as an article from a CMS or Markdown. It uses `body` (16px), and `kv-prose kv-prose--large` uses `body-large` (18px) for long resident-facing text. There is no smaller size. `kv-lead` marks the lead paragraph. Prose never styles a component part (an explicit list in `theme.css`: `kv-button`, `kv-link`, `kv-link-new-tab-notice` and the card parts) or anything inside `kv-not-prose`, `kv-nav`, `kv-button-group`, a card (`kv-card`), a notification (`kv-notification`), a field (`kv-field`) or a fieldset (`kv-fieldset`), and its rules have zero specificity, so any other CSS wins. A card, a notification, a field or a fieldset in prose gets prose's block margins only. A section in prose gets prose's block margins on its own element, and its content stays prose. `kv-prose` on a card or a notification, or inside one, turns prose on again. It keeps list markers and table display, so semantics survive. Code blocks wrap instead of scrolling, and wide tables go in a `kv-scroll-region` with a name and `tabindex="0"`. Stop at `h3` in resident-facing text: in large prose, `h4` looks like `h3`. The design spec is `docs/design/foundations-and-prose.md`.
- **Tables** use `numeric` for figures, `surface` for the header row, `border-subtle` row dividers and no zebra stripes. Sortable headers are buttons with a visible sort indicator.
- **Step indicator** shows "Step 2 of 5" in text, not only as dots.
- **Badges and tags** are for status or metadata, never for interactive elements.
- **Command menus and shortcuts** are welcome in staff tools, but every shortcut has a visible menu or button equivalent and single-character shortcuts can be turned off (2.1.4).

## Theming

- **One file, opt-in by import.** `import '@kvirn-ui/theme/theme.css'` styles every component on the page, and removing it unstyles them. Nothing loads CSS for you, and `KvirnProvider` never does.
- **Components are selected by part classes,** and state by `data-*` attributes: `.kv-button`, `.kv-link`, `[data-disabled]`. Each part renders its own class, and the consumer's `className` joins it. Choices are classes the consumer adds: `kv-button--primary` or `kv-button--danger`, `kv-button--icon-only`, `kv-button-group`, `kv-nav`, `kv-compact`, for prose `kv-prose` (plus `kv-prose--large`), `kv-lead`, `kv-not-prose` and `kv-scroll-region`, for cards `kv-card--radius-lg|md|none`, `kv-card--padding-none|sm|md|lg`, `kv-card-header--padding-*` (and body and footer) and `kv-card--dividers`, for sections `kv-section--surface|canvas` and `kv-section--padding-none|sm|md|lg`, for notifications the status classes `kv-notification--info|success|warning|danger`, which `Notification.Info`, `.Success`, `.Warning` and `.Danger` render themselves (`Notification.Root` renders `kv-notification` only), and for form fields `kv-field-label--heading`, `kv-fieldset-legend--heading`, `kv-input--width-2|4|6|10|20` and `kv-input--numeric`. A section renders `kv-section`. The notification parts render `kv-notification`, `kv-notification-icon`, `kv-notification-title`, `kv-notification-status`, `kv-notification-body` and `kv-notification-actions`, and its site-wide properties are `--kv-notification-padding-block`, `--kv-notification-padding-inline` and `--kv-notification-gap`. The form parts render `kv-field`, `kv-field-label`, `kv-field-optional`, `kv-field-error-message`, `kv-field-error-prefix`, `kv-fieldset`, `kv-fieldset-legend`, `kv-input`, `kv-input-group`, `kv-input-group-addon`, `kv-one-time-code`, `kv-one-time-code-input`, `kv-one-time-code-slot` and `kv-one-time-code-separator`, and the invalid state is `data-invalid` or `aria-invalid="true"`. The hint is a `kv-prose` that is a direct child of `kv-field` or `kv-fieldset` (ADR-0054), which the theme sets in body type and the text colour in every density. An input group also takes `data-disabled` and `data-focus-visible`. A one-time code's boxes take `data-filled`, `data-active`, `data-caret`, `data-selected` and `data-invalid`, its separators none, and its root `data-ready`, `data-complete`, `data-invalid`, `data-disabled`, `data-character-count` and `data-separator-count`.
- **Override variables, not selectors.** Rebrand by overriding a role scale on `:root` (`--kv-primary-50` … `--kv-primary-950`), or set a single semantic token (`:root { --kv-color-link: var(--kv-primary-700) }`). Scales go on `:root`, where the semantic tokens are declared. To change one theme only, target the same selectors `theme.css` uses (`:root[data-kv-color-scheme='dark']`).
- **Site-wide defaults are custom properties, set once.** `--kv-font-family-body`, `--kv-font-family-heading`, `--kv-card-padding-default`, `--kv-card-radius-default` and the five `--kv-button-*` sizes (`min-block-size`, `padding-inline`, `font-size`, `font-weight`, `line-height`), plus `class="kv-compact"` on `<html>`. `theme.css` sets none of them: it reads each where it's used, with its own value as the fallback (`var(--kv-font-family-body, var(--kv-font-family-sans))`), so they work on `:root` or on any container. A value that refers to another token (`var(--kv-card-padding-lg)`) is resolved where it's declared, so put those on the element that should resolve them. `--kv-color-heading` is a semantic token like the rest, set per theme.
- **Your CSS always wins.** Everything in `theme.css` is in `@layer kv`. Any unlayered CSS you write, or any layer you declare after `kv`, overrides it regardless of specificity.
- **Own it, or skip it.** Copy `theme.css` into your project and import your copy, or skip it and style the `kv-*` classes and the `data-*` state attributes with Tailwind or your own CSS.
- After any colour change, run `vp run theme:check`, or `checkThemeCss()` from `@kvirn-ui/theme` on your own file.

## Content & Voice

Content is design. Most failures in public services are unclear words, not unclear pixels.

- Write in plain language (_klarspråk_ in Sweden and Norway, _selkeä kieli_ in Finland): short sentences, common words, active voice, "you" and "we". Key services also need an easy-to-read version (_lättläst_, _selkokieli_).
- Lead with what the user needs to do and by when. Put the exception at the end.
- Headings and buttons describe the task: "Apply for parking permit", not "Parking permit form".
- Errors say what went wrong and how to fix it: "Enter a date in the format 31.12.2026", not "Invalid input".
- Every visible or announced string comes from `@kvirn-ui/i18n` in all six locales (AGENTS.md hard rule 4). Designs show the Swedish and Finnish strings side by side to catch length and wrapping issues.
- Dates, numbers and currency use `Intl` for the active locale (`31.12.2026` in fi, `2026-12-31` in sv).

## Do's and Don'ts

Do:

- Use one accent colour and let whitespace, weight and the surface ladder create the hierarchy.
- Put one thing on each page for residents, and make the next step obvious.
- Pair every status colour with words and, where useful, an icon.
- Keep 44px targets for resident-facing controls and every primary action.
- Test every design at 320px, at 200% text size, in dark and contrast themes and in forced colours before calling it done.
- Show real content in real languages in mock-ups, including the longest Finnish string.

Don't:

- Use `text-muted` for anything the user must read to complete the task.
- Use `border-subtle` (the hairline) as the only edge of a control.
- Use a `-subtle` background for anything but a notification.
- Put `role="alert"` on a notification: it is announced through the Announcer (`announce`).
- Put a status class on a plain `Notification.Root`: use the ready-made root, which brings the icon and the word.
- Lighten a filled button on hover behind white text.
- Remove focus outlines, or rely on a glow, a shadow or a background change to show focus.
- Give button depth (a shadow or a tinted edge) to anything that isn't a button: cards, inputs, badges, navigation items or links. Depth means "press me".
- Use low-contrast "ghost" text, grey-on-grey placeholders or disabled-looking active controls, even though they look elegant.
- Add gradients, glows or glass effects behind text. Decorative effects are allowed only on marketing surfaces of the docs site, and never reduce text contrast.
- Put essential information in tooltips, hover states or images of text.
- Use all caps, justified text, italic paragraphs or text smaller than 16px for instructions.
- Load fonts, icons or images from third-party servers.
- Claim that a design "is compliant". Say "designed and tested to meet WCAG 2.2 AA".
