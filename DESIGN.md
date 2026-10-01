---
version: alpha
name: KvirnUI default theme
description: Calm, precise and plain. A quiet, product-grade interface for Nordic and EU public services. Near-black and near-white canvases, a surface ladder with hairline dividers, one lavender accent, and tight Inter typography, with contrast, focus and target size held to WCAG 2.2 AA or better.
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
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 2.5rem
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.025em
  heading-1:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.021em
  heading-2:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1.375rem
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.018em
  heading-3:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0em
  body-large:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: '"cv05", "cv08"'
  lead:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: '"cv05", "cv08"'
  body:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: '"cv05", "cv08"'
  body-small:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: '"cv05", "cv08"'
  label:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.4
  label-compact:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.3
  numeric:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: '"tnum", "cv05", "cv08"'
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
- a ladder of slightly lifted surfaces instead of shadows, with 1px hairline dividers
- one lavender accent (`#5e6ad2`), used sparingly
- tight Inter typography with negative tracking on large headings
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

| Token            | light           | dark            | light-contrast  | dark-contrast   | Use                                                                                        |
| ---------------- | --------------- | --------------- | --------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `canvas`         | `white`         | `black`         | `white`         | `black`         | Page background                                                                            |
| `surface`        | `neutral-50`    | `neutral-950`   | `neutral-50`    | `neutral-950`   | Sections, sidebars, table headers, code                                                    |
| `surface-raised` | `white`         | `neutral-900`   | `white`         | `neutral-900`   | Cards, popups, dialogs, hovered navigation items                                           |
| `border-subtle`  | `neutral-100`   | `neutral-800`   | `neutral-500`   | `neutral-400`   | Hairline dividers and decorative outlines only                                             |
| `border-control` | `neutral-500`   | `neutral-500`   | `neutral-700`   | `neutral-200`   | Borders that identify a control (inputs, checkboxes)                                       |
| `secondary`      | `secondary-500` | `secondary-500` | `secondary-700` | `secondary-200` | The secondary button's edge. Equal to `border-control` until `--kv-secondary-*` gets a hue |
| `text`           | `neutral-950`   | `neutral-50`    | `black`         | `white`         | Body text                                                                                  |
| `heading`        | `neutral-950`   | `neutral-50`    | `black`         | `white`         | Headings in prose. The same step as `text` by default, so a site can set its own           |
| `text-muted`     | `neutral-600`   | `neutral-400`   | `neutral-700`   | `neutral-200`   | Secondary text, hints, metadata                                                            |
| `primary`        | `primary-500`   | `primary-500`   | `primary-800`   | `primary-200`   | Primary button background, selected state, current-page indicator                          |
| `primary-hover`  | `primary-600`   | `primary-600`   | `primary-900`   | `primary-100`   | Hover and pressed state of `primary`                                                       |
| `on-primary`     | `white`         | `white`         | `white`         | `black`         | Text and icons on `primary`                                                                |
| `primary-subtle` | `primary-50`    | `primary-950`   | `primary-50`    | `primary-950`   | Current navigation item, secondary button hover, selected rows, info backgrounds           |
| `link`           | `primary-600`   | `primary-400`   | `primary-800`   | `primary-200`   | Link text, badge text                                                                      |
| `link-hover`     | `primary-700`   | `primary-300`   | `primary-900`   | `primary-100`   | Link hover and pressed                                                                     |
| `focus-ring`     | `primary-500`   | `primary-400`   | `primary-800`   | `primary-200`   | Focus indicator                                                                            |
| `danger`         | `danger-600`    | `danger-300`    | `danger-700`    | `danger-200`    | Errors, destructive actions                                                                |
| `danger-hover`   | `danger-700`    | `danger-200`    | `danger-800`    | `danger-100`    | Hover and pressed state of `danger`                                                        |
| `on-danger`      | `white`         | `black`         | `white`         | `black`         | Text and icons on `danger`                                                                 |
| `danger-subtle`  | `danger-50`     | `danger-950`    | `danger-50`     | `danger-950`    | Error summary and message backgrounds                                                      |
| `success`        | `success-700`   | `success-300`   | `success-800`   | `success-200`   | Confirmation, completed steps                                                              |
| `success-subtle` | `success-50`    | `success-950`   | `success-50`    | `success-950`   | Confirmation panel backgrounds                                                             |
| `warning`        | `warning-700`   | `warning-300`   | `warning-800`   | `warning-200`   | Warnings, deadlines                                                                        |
| `warning-subtle` | `warning-50`    | `warning-950`   | `warning-50`    | `warning-950`   | Warning panel backgrounds                                                                  |

The palette values are in `theme.css`, section 1. Measured contrast (2026-10-01, `vp run theme:check`, 81 pairs per theme):

- **Text.**
  - Every text token (`text`, `heading`, `text-muted`, `link`, `danger`, `success`, `warning`) is at least 4.5:1 on `canvas`, `surface`, `surface-raised` and the `-subtle` backgrounds it's used on in the standard themes. The lowest pairs are `on-primary` on `primary` (4.70:1) and `text-muted` on `primary-subtle` in dark (4.80:1).
  - In the contrast themes the minimum is 7:1. The lowest pair is `danger` on `danger-subtle` in light-contrast (7.31:1).
- **Control borders and focus.** `border-control`, `secondary`, `focus-ring` and `primary` (used as a selected or current indicator) are at least 3:1 against `canvas`, `surface`, `surface-raised` and `primary-subtle` in every theme. The lowest pairs are `border-control` and `secondary` on `primary-subtle` in dark (3.13:1).
- **Labels on filled buttons.** `on-primary` on `primary` is at least 4.70:1, and on `primary-hover` at least 5.91:1. `on-danger` on `danger` is at least 6.40:1, and on `danger-hover` at least 8.23:1.

Rules:

- **`border-subtle` never identifies a control.** Anything a user must perceive to operate (input edges, checkbox boxes) uses `border-control`, and a secondary button's outline uses `secondary`, both held to 3:1 (1.4.11). Hairlines are 1.36–1.96:1, so they are `border-subtle` only.
- **The focus ring has an offset.** `focus-ring` on `primary` is about 1:1, so the ring sits 2px outside the element, where the adjacent colour is the background.
- **Filled buttons get darker on hover, never lighter.** A lighter hover behind white text fails 4.5:1: white on `#828fff` is 2.87:1.
- **Links use `link` and are underlined** in running text. In dark themes `link` is lighter than `primary`, because `#5e6ad2` as text on the dark canvas is only 4.44:1.
- **Navigation lists** may drop the underline and use the `text` colour, because position in a labelled `<nav>` list is the cue. The current item always has a non-colour cue: an inline-start bar and weight 600, plus `aria-current`.
- **Dark themes are not inverted light themes.** Raised surfaces get lighter, not shadowed.
- **`heading` is held to everything `text` is.** A site that gives headings their own colour keeps 4.5:1 (7:1 in the contrast themes) on every background body text sits on, and `theme:check` measures it. In forced colours both are `CanvasText`.
- **Forced colours** (`forced-colors: active`): use system colours (`Canvas`, `CanvasText`, `LinkText`, `ButtonText`, `Highlight`, `GrayText`). Every surface and control keeps a 1px border, even if it is transparent in the normal theme, so boundaries survive. Selected and current states get a non-colour cue such as a border, a check mark or `text-decoration`.

Rebranding for a municipality:

- Override one scale on `:root`: give `--kv-primary-*` the brand's eleven steps, and every semantic token and all four themes follow. Each theme uses different steps (light 500 and 600, dark 500 and 400, the contrast themes 800 and 200), so swapping a scale can break contrast. Check a customised copy with `checkThemeCss()` (or `vp run theme:check`), or on the live Foundation/Theming page. If the coat-of-arms colour fails, use it in the header band or the logo, and build the scale from a darker or lighter shade of it.
- Give `--kv-secondary-*` a hue to colour the secondary button's edge. `--kv-accent-*` is free for a brand's second colour.
- Pointing one semantic token at another step (`--kv-color-link: var(--kv-primary-700)`) also works, for a single change.
- Override `danger` and `danger-hover` together, if at all.
- Never reuse a brand red for `danger` or a brand green for `success`, because users will read the brand colour as a status.

## Typography

One sans-serif family with a system fallback, and one monospace family for reference numbers and code.

- **Body and heading families.** Body text and controls (prose, buttons, navigation items) use `--kv-font-family-body`, and prose headings `--kv-font-family-heading`. The theme sets neither: both fall back to `--kv-font-family-sans`, so by default there is one family. A site sets them once for a brand font (see [Theming](#theming)). A link in running text keeps the font around it, and code stays `--kv-font-family-mono`.
- **System stack.** `--kv-font-family-system` is `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif`, and `--kv-font-family-sans` is Inter in front of it. On Apple, Windows and Android, the font it finds first (San Francisco, Segoe UI, Roboto) covers å ä ö æ ø and the Northern Sámi letters. On Linux, `system-ui` is the desktop's font, with Noto Sans and Arial behind it. End a brand stack with it, and check the Glyphs story in Foundation/Typography.
- **Family.** The stack starts with Inter (SIL OFL). We use weights 400, 500 and 600. It is legible at small sizes and covers every Northern Sámi letter (á č đ ŋ š ŧ ž). The theme never loads a font. The docs site and Storybook self-host Inter Variable, and adopters self-host it or fall back to the system UI font (GDPR, AGENTS.md hard rule 7). A replacement brand font must cover the Sámi letters as well as å ä ö æ ø.
- **Disambiguation.** Enable Inter's `cv05` (l with a tail) and `cv08` (I with serifs) for body text so that l, I and 1 are distinct. This matters for case numbers, codes and names. Verify the feature tags against the self-hosted Inter version.
- **Numbers.** Use `numeric` (tabular figures) for tables, amounts, dates and reference numbers.
- **Scale.**
  - `body` is 1rem (16px) and never smaller for essential content. Long resident-facing text uses `body-large`.
  - `lead` (20px, weight 400, no tracking) is only for the lead paragraph of large prose. The lead of default prose uses `body-large`. A lead is essential content, so it is always `text`, never `text-muted`.
  - `body-small` (14px) is for metadata, and never for instructions or errors.
  - `label-compact` (14px, weight 500) is only for control labels in compact density: staff tools, and the docs site's navigation and header controls.
  - There is no 12px or 13px size, so there are no small captions or eyebrows.
- **Headings.** Weight 600 (500 for `heading-2`), with negative tracking that scales with size: -0.025em at 40px, -0.021em at 28px and -0.018em at 22px. There is no negative tracking below 20px, because it hurts legibility on body text and reverses under the 1.4.12 overrides anyway.
- **Line length** is 60–75 characters (`--kv-prose-measure`, `70ch`, on prose).
- **Sentence case** everywhere. No all-caps labels, headings or eyebrows, because they are slower to read and some screen readers spell them out.
- **Text spacing (1.4.12).** Everything must keep working with line height 1.5, paragraph spacing 2em, letter spacing 0.12em and word spacing 0.16em. No fixed heights on text containers. The `height` values in the front matter are minimum block sizes.
- **Sizes in `rem`,** so browser zoom and font-size settings work (1.4.4).

## Layout

- **Grid.** Everything sits on a 4px grid, and the spacing scale is in the front matter (`--kv-space-<step>`). Most layouts use steps 2, 4, 6 and 8.
- **Reading column.** Resident-facing services use a single column of at most `40rem` for forms and `45rem` for prose. One question or one topic per page wherever possible.
- **Staff tools and the docs site** may use a sidebar and a content area. The sidebar collapses behind a disclosure below `64rem`.
- **Breakpoints** are content-driven, but the reference points are `40rem`, `64rem` and `80rem`. Design mobile first.
- **Reflow (1.4.10).** Everything works at 320 CSS px wide and at 400% zoom without horizontal scrolling, except data tables, which scroll inside their own labelled, focusable region.
- **Text expansion.** Finnish and Northern Sámi strings can be 30–50% longer than English, and Finnish compounds are long. Buttons and labels wrap. Never set a fixed width on anything containing text, and use `overflow-wrap: anywhere` as a last resort, not truncation.
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

Depth comes from the surface ladder (`canvas` → `surface` → `surface-raised`) and 1px hairlines, not from shadows. The look is flat and precise.

| Level | Surface          | Border          | Shadow                                                                                              | Use                       |
| ----- | ---------------- | --------------- | --------------------------------------------------------------------------------------------------- | ------------------------- |
| 0     | `canvas`         | none            | none                                                                                                | Page                      |
| 1     | `surface`        | `border-subtle` | none                                                                                                | Sections, sidebars        |
| 2     | `surface-raised` | `border-subtle` | none                                                                                                | Cards                     |
| 3     | `surface-raised` | `border-subtle` | `--kv-shadow-popup`. Light: `0 8px 24px -4px` `neutral-950` at 12%. Dark: none (surface is lighter) | Popups, menus, popovers   |
| 4     | `surface-raised` | `border-subtle` | `--kv-shadow-dialog`. Light: `0 24px 48px -8px` `neutral-950` at 20%. Dark: none                    | Dialogs (with a backdrop) |

- The shadow tokens mix `--kv-neutral-950` with `color-mix()`, so the palette block stays the only place with raw colours (ADR-0013, ADR-0018). Both are `none` in the dark themes.

- A dialog backdrop dims the page, so it must not reduce the dialog's own contrast. Content behind a modal is `inert`.
- Shadows are never the only boundary, because they disappear in forced colours.
- **Motion.** Durations are 120ms (hover, press), 180ms (popups, disclosures) and 240ms (dialogs, page-level). Easing is `cubic-bezier(0.2, 0, 0, 1)`. Motion only runs under `prefers-reduced-motion: no-preference`, and otherwise state changes are instant. No parallax, no auto-playing carousels, nothing that flashes, and no animation longer than 5 seconds without a pause control (2.2.2).

## Shapes

- **Radii** are small and consistent:
  - `sm` (4px) for badges inside controls, checkboxes and tags.
  - `md` (8px) for buttons, inputs and navigation items.
  - `lg` (12px) for cards and example frames.
  - `xl` (16px) for popups and dialogs.
  - `full` for pills and avatars.

  Radio buttons are always circles and checkboxes always rounded squares, so the shape tells them apart.

- **Lines** are 1px. Control borders are 1px `border-control`, and invalid inputs switch to 2px `danger` plus an error message, never colour alone.
- **Focus ring**: 2px solid `focus-ring`, 2px offset, following the element's radius. It is restyled, never removed, and only shown for keyboard focus (`:focus-visible`, `data-focus-visible`). This meets 2.4.13. A thinner or glow-style focus is not used.
- **Icons**: outline style, 1.5px stroke on a 24px grid, rendered at 16px, 20px or 24px, using `currentColor`. An icon next to text is `aria-hidden`. An icon-only button needs an accessible name from i18n and a visible tooltip, and is used only for universally known actions (close, search, menu). Icons are inline SVG and the theme has no icon dependency.

## Components

Visual rules for the default theme. Behaviour, roles and keyboard are defined in each component's `<name>.a11y.md`, never here. Style parts and variants through classes, and state through the `data-*` attributes (`docs/architecture.md#styling-contract`): `.kv-button`, `.kv-button--primary`, `[data-disabled]`. `theme.css` implements Button, Link, prose and Card. The design specs are `docs/design/default-theme-button-link.md`, `docs/design/foundations-and-prose.md` and `docs/design/card.md`.

- **Buttons.**
  - One primary button per view, for the main next step. Secondary buttons use `surface-raised` with a `border-control` outline. A hairline edge doesn't reach 3:1.
  - Destructive actions use `button-danger` and a confirmation step.
  - Labels are verbs ("Send application", "Book time").
  - Disabled buttons keep their label readable, with a dashed border as the non-colour cue. Prefer keeping them enabled and explaining what's missing on submit.
  - A hovered or pressed primary button keeps a 1px `primary` edge around its `primary-hover` fill, so its boundary stays at 3:1 on `surface-raised` in dark (ADR-0021).
  - Size follows the density. A site can size every button without touching other controls with `--kv-button-min-block-size`, `--kv-button-padding-inline`, `--kv-button-font-size`, `--kv-button-font-weight` and `--kv-button-line-height`, which fall back to the `--kv-control-*` tokens. Set, they win over density, so the height never goes below 24px (2.5.8), and resident-facing buttons stay at 44px.
- **Links** look like links (underlined `link`) and buttons look like buttons. Never swap the two. The hover state thickens the underline to 2px and uses `link-hover`.
- **Cards** are elevation level 2: `surface-raised`, a 1px `border-subtle` edge, the `lg` radius and no shadow. A card is a plain container and is never interactive: no hover, shadow or pointer style, because those suggest the whole card is clickable.
  - Choose with classes on the Root: the surface (`surface-raised` by default, `kv-card--surface` for a block in a sidebar, `kv-card--canvas` on a `surface` section), the radius (`lg` by default, `kv-card--radius-md` for a card nested in a card, `kv-card--radius-none` for a card flush with an edge) and `kv-card--dividers` (a `border-subtle` line between parts).
  - Padding goes on the Root, for every part (`kv-card--padding-none`, `-sm` or `-lg`), or on one part (`kv-card-header--padding-none`, and likewise for the body and footer, in all four steps): `md` (the default) is 24px, and 16px below `40rem` and in compact density from `64rem`. `sm` is 12px, `lg` is 32px (24px where `md` is 16px), and `none` is for full-bleed media. Use `none` on a part only, so the other parts' edges line up.
  - Parts are direct children of the Root. A Root without parts pads itself, and adjacent parts share one padding.
  - A site sets its own default for every card with `--kv-card-padding-default` and `--kv-card-radius-default`, and `kv-card--padding-md` or `kv-card--radius-lg` takes one card back to the theme's step. A default set on `:root` as `var(--kv-card-padding-lg)` is resolved there, so it doesn't step down inside a `kv-compact` container: set it on `.kv-card` or on the container instead.
  - A card never hides overflow, so focus rings are never clipped. Media that touch a rounded corner get its inner radius instead.
  - Footer actions use `kv-button-group` on the footer: start-aligned, primary first, and one primary per view. A card's one link goes in its heading. Navigation is a Link.
  - Never use `primary-subtle` or a status `-subtle` background as a card surface: status belongs in a notification, with an icon and a heading.
  - Every card keeps its border, so its edge survives forced colours. Nest one level at most on resident-facing pages: `surface` and `md` for the inner card.
- **Navigation items** use `nav-item`. The current item uses `primary-subtle`, weight 600, a `primary` inline-start bar and `aria-current`.
- **Text inputs.** A visible label above the input, hint text between the label and the input, and the error message directly above the input. No placeholder-only labels. The input width reflects the expected answer (a postcode field is short).
- **Checkboxes and radios** are at least 24px, with the whole label clickable, and are grouped in a `fieldset` with a `legend` question.
- **Error summary.** At the top of the form, `danger` border with `danger-subtle` background, a heading and a list of links to each invalid field. It receives focus on submit.
- **Notifications and panels** use the `-subtle` background with a 4px inline-start border in the status colour, an icon, and a heading that states the status in words.
- **Popups** (menus, listboxes, popovers) use level 3 elevation and `xl` radius, with 8px padding and items at least 44px high (32px in compact).
- **Prose.** Put `kv-prose` on the element around content you don't control, such as an article from a CMS or Markdown. It uses `body` (16px), and `kv-prose kv-prose--large` uses `body-large` (18px) for long resident-facing text. There is no smaller size. `kv-lead` marks the lead paragraph. Prose never styles a component part (an explicit list in `theme.css`: `kv-button`, `kv-link`, `kv-link-new-tab-notice` and the card parts) or anything inside `kv-not-prose`, `kv-nav`, `kv-button-group` or a card (`kv-card`), and its rules have zero specificity, so any other CSS wins. A card in prose gets prose's block margins only. `kv-prose` on a card or inside one turns prose on again. It keeps list markers and table display, so semantics survive. Code blocks wrap instead of scrolling, and wide tables go in a `kv-scroll-region` with a name and `tabindex="0"`. Stop at `h3` in resident-facing text: in large prose, `h4` looks like `h3`. The design spec is `docs/design/foundations-and-prose.md`.
- **Tables** use `numeric` for figures, `surface` for the header row, `border-subtle` row dividers and no zebra stripes. Sortable headers are buttons with a visible sort indicator.
- **Step indicator** shows "Step 2 of 5" in text, not only as dots.
- **Badges and tags** are for status or metadata, never for interactive elements.
- **Command menus and shortcuts** are welcome in staff tools, but every shortcut has a visible menu or button equivalent and single-character shortcuts can be turned off (2.1.4).

## Theming

- **One file, opt-in by import.** `import '@kvirn-ui/theme/theme.css'` styles every component on the page, and removing it unstyles them. Nothing loads CSS for you, and `KvirnProvider` never does.
- **Components are selected by part classes,** and state by `data-*` attributes: `.kv-button`, `.kv-link`, `[data-disabled]`. Each part renders its own class, and the consumer's `className` joins it. Choices are classes the consumer adds: `kv-button--primary` or `kv-button--danger`, `kv-button-group`, `kv-nav`, `kv-compact`, for prose `kv-prose` (plus `kv-prose--large`), `kv-lead`, `kv-not-prose` and `kv-scroll-region`, and for cards `kv-card--surface`, `kv-card--canvas`, `kv-card--radius-lg|md|none`, `kv-card--padding-none|sm|md|lg`, `kv-card-header--padding-*` (and body and footer) and `kv-card--dividers`.
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
- Lighten a filled button on hover behind white text.
- Remove focus outlines, or rely on a glow, a shadow or a background change to show focus.
- Use low-contrast "ghost" text, grey-on-grey placeholders or disabled-looking active controls, even though they look elegant.
- Add gradients, glows or glass effects behind text. Decorative effects are allowed only on marketing surfaces of the docs site, and never reduce text contrast.
- Put essential information in tooltips, hover states or images of text.
- Use all caps, justified text, italic paragraphs or text smaller than 16px for instructions.
- Load fonts, icons or images from third-party servers.
- Claim that a design "is compliant". Say "designed and tested to meet WCAG 2.2 AA".
