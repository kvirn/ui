---
version: alpha
name: KvirnUI default theme
description: Calm, precise and plain. A quiet, product-grade interface for Nordic and EU public services, where the content and the next step are always the loudest thing on the page.
colors:
  canvas: '#ffffff'
  surface: '#f6f7f9'
  surface-raised: '#ffffff'
  border-subtle: '#e3e5ea'
  border-control: '#767b88'
  text: '#15161a'
  text-muted: '#555a66'
  primary: '#4c56d0'
  primary-hover: '#3d46b3'
  on-primary: '#ffffff'
  primary-subtle: '#eef0fd'
  focus-ring: '#4c56d0'
  danger: '#b3273f'
  danger-subtle: '#fdeef0'
  success: '#1d7048'
  success-subtle: '#e9f6ef'
  warning: '#8a5300'
  warning-subtle: '#fff4dc'
typography:
  display:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: 2.5rem
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.022em
  heading-1:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  heading-2:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.015em
  heading-3:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  body-large:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: '"cv05", "cv08"'
  body:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: '"cv05", "cv08"'
  body-small:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: '"cv05", "cv08"'
  label:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.4
  numeric:
    fontFamily: 'Inter Variable, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: '"tnum", "cv05", "cv08"'
  code:
    fontFamily: 'ui-monospace, SF Mono, Cascadia Code, Menlo, Consolas, monospace'
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 10px
  xl: 14px
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
    padding: 0 20px
    height: 44px
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  button-secondary:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.text}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 0 20px
    height: 44px
  button-danger:
    backgroundColor: '{colors.danger}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 0 20px
    height: 44px
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
    padding: 24px
  popup:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.text}'
    rounded: '{rounded.xl}'
    padding: 8px
  badge:
    backgroundColor: '{colors.primary-subtle}'
    textColor: '{colors.primary}'
    typography: '{typography.body-small}'
    rounded: '{rounded.full}'
    padding: 2px 10px
---

# KvirnUI design language

This file is the visual and interaction source of truth for everything in KvirnUI that has a look: the default theme (`@kvirn-ui/theme`), the styled blocks (`@kvirn-ui/blocks`), Storybook stories and the docs site. The headless packages ship zero CSS and are not bound by it (AGENTS.md hard rule 5).

It is a default, not a brand (see `docs/vision.md`, non-goals). A municipality rebrands by overriding the semantic tokens, and everything here is written so that a rebrand stays accessible. The front matter follows the [DESIGN.md format](https://github.com/google-labs-code/design.md) and holds the **light** theme. The other three themes are in the tables below. The implementation lives in `packages/theme/src/tokens.ts` and every contrast pair is enforced by `vp run theme:check`.

Changing a token or a rule here is a decision: write an ADR and update `tokens.ts` in the same change.

## Overview

**Calm, precise, plain.** The interface is quiet so that the content and the next step are loud. Think of a well-made professional tool: a restrained neutral palette with a faint cool tint, one confident accent, crisp 1px lines, tight, deliberate typography and generous whitespace. Nothing decorative competes with the task.

Who we design for:

- **Residents** using e-services (applications, bookings, reports, payments), often once, often on a phone, sometimes stressed. They include older people, people with cognitive, visual or motor disabilities, people with low digital confidence and people reading in their second language. Some read Northern Sámi, Finnish, Swedish or Norwegian, and Finland and Norway publish in two languages.
- **Case workers and staff** using internal tools every day on a desktop. They need speed, density and keyboard efficiency, but the same accessibility bar applies, because staff have disabilities too.

Principles, in priority order:

1. **Clarity over cleverness.** Everyone should understand what the page is, what they need to do and what happens next, without prior knowledge.
2. **Accessible by construction.** Contrast, focus, target size and reflow are properties of the tokens, not a later fix. WCAG 2.2 AA is the floor, and the default theme also meets 2.4.13 Focus Appearance and 2.5.5 Target Size (Enhanced).
3. **Quiet interface, loud content.** Neutral chrome, one accent, colour used for meaning, never for decoration.
4. **Precision.** A 4px grid, consistent radii, 1px lines, aligned edges and optical balance. Precision reads as trustworthiness, and public services need trust.
5. **Density fits the context.** Comfortable for residents by default. Compact is opt-in for staff tools and never below AA.
6. **Respect the user's settings.** OS colour scheme, contrast, forced colours, reduced motion, zoom and text spacing always win (ADR-0006).

## Colors

The palette is neutral grey with a slight cool (blue) tint, plus one indigo accent. Colour carries meaning: the accent means "interactive or selected", and the status colours mean danger, success and warning. Status is never conveyed by colour alone (1.4.1): it is always paired with text and, where useful, an icon.

Tokens are exposed as `--kv-color-<name>`. Four themes come from two preference axes, colour scheme and contrast (ADR-0006).

| Token            | light     | dark      | light-contrast | dark-contrast | Use                                                                    |
| ---------------- | --------- | --------- | -------------- | ------------- | ---------------------------------------------------------------------- |
| `canvas`         | `#ffffff` | `#0e0f12` | `#ffffff`      | `#000000`     | Page background                                                        |
| `surface`        | `#f6f7f9` | `#15161a` | `#f6f7f9`      | `#0b0c0e`     | Sections, sidebars, table headers                                      |
| `surface-raised` | `#ffffff` | `#1c1d22` | `#ffffff`      | `#15161a`     | Cards, popups, dialogs                                                 |
| `border-subtle`  | `#e3e5ea` | `#2a2c33` | `#6b7080`      | `#8a8f9c`     | Dividers and decorative outlines only                                  |
| `border-control` | `#767b88` | `#72778a` | `#3a3d45`      | `#c4c8d0`     | Borders that identify a control (inputs, checkboxes, secondary button) |
| `text`           | `#15161a` | `#f3f4f6` | `#000000`      | `#ffffff`     | Body text and headings                                                 |
| `text-muted`     | `#555a66` | `#a3a8b4` | `#33363d`      | `#d6d9df`     | Secondary text, hints, metadata                                        |
| `primary`        | `#4c56d0` | `#8f97ff` | `#2c35a0`      | `#b3b8ff`     | Links, primary buttons, selected state                                 |
| `primary-hover`  | `#3d46b3` | `#a8aeff` | `#1f2780`      | `#cdd0ff`     | Hover and pressed state of `primary`                                   |
| `on-primary`     | `#ffffff` | `#0e0f12` | `#ffffff`      | `#000000`     | Text and icons on `primary`                                            |
| `primary-subtle` | `#eef0fd` | `#1e2140` | `#eef0fd`      | `#1e2140`     | Selected rows, highlighted options, info backgrounds                   |
| `focus-ring`     | `#4c56d0` | `#8f97ff` | `#2c35a0`      | `#b3b8ff`     | Focus indicator                                                        |
| `danger`         | `#b3273f` | `#ff8a9a` | `#8c1026`      | `#ffb3bd`     | Errors, destructive actions                                            |
| `danger-subtle`  | `#fdeef0` | `#2e161b` | `#fdeef0`      | `#2e161b`     | Error summary and message backgrounds                                  |
| `success`        | `#1d7048` | `#5fd49a` | `#0f5132`      | `#8ae6b6`     | Confirmation, completed steps                                          |
| `success-subtle` | `#e9f6ef` | `#12261c` | `#e9f6ef`      | `#12261c`     | Confirmation panel backgrounds                                         |
| `warning`        | `#8a5300` | `#f0b453` | `#5c3700`      | `#ffd08a`     | Warnings, deadlines                                                    |
| `warning-subtle` | `#fff4dc` | `#2a2012` | `#fff4dc`      | `#2a2012`     | Warning panel backgrounds                                              |

Measured contrast (2026-09-30, `packages/theme/src/contrast.ts`):

- Every text token on `canvas`, `surface` and its own `-subtle` background is at least **4.5:1** in the standard themes (lowest: `primary` on `primary-subtle`, 5.22:1) and at least **7:1** in the contrast themes (lowest: `danger` on `danger-subtle`, 8.42:1).
- `border-control` and `focus-ring` are at least **3:1** against `canvas` and `surface` in every theme (lowest: 3.95:1).
- `on-primary` on `primary` is at least 5.92:1.

Rules:

- **`border-subtle` never identifies a control.** Anything a user must perceive to operate (input edges, checkbox boxes, a secondary button's outline) uses `border-control` (1.4.11).
- **The focus ring has an offset.** `focus-ring` on `primary` is 1:1, so the ring sits 2px outside the element, where the adjacent colour is the background.
- **Links are `primary` and underlined** in running text. Navigation lists may drop the underline if another cue (position, weight, icon) remains.
- **Dark themes are not inverted light themes.** Raised surfaces get lighter, not shadowed, and the accent is lightened so it keeps its contrast.
- **Forced colours** (`forced-colors: active`): use system colours (`Canvas`, `CanvasText`, `LinkText`, `ButtonText`, `Highlight`, `GrayText`). Every surface and control keeps a 1px border, even if it is transparent in the normal theme, so boundaries survive. Selected and current states get a non-colour cue such as a border, a check mark or `text-decoration`.

Rebranding for a municipality:

- Override `primary`, `primary-hover`, `on-primary`, `primary-subtle` and `focus-ring` together, then run `vp run theme:check`. If the coat-of-arms colour fails, use it in the header band or the logo and use a darker or lighter shade of it for `primary`.
- Never reuse a brand red for `danger` or a brand green for `success`, because users will read the brand colour as a status.

## Typography

One sans-serif family with a system fallback, and one monospace family for reference numbers and code.

- **Family.** The stack starts with Inter (SIL OFL), which is legible at small sizes and covers every Northern Sámi letter (á č đ ŋ š ŧ ž). The theme never loads a font from a third-party server (GDPR, AGENTS.md hard rule 7). Adopters self-host Inter or fall back to the system UI font. A replacement brand font must cover the Sámi letters as well as å ä ö æ ø.
- **Disambiguation.** Enable Inter's `cv05` (l with a tail) and `cv08` (I with serifs) for body text so that l, I and 1 are distinct. This matters for case numbers, codes and names. Verify the feature tags against the self-hosted Inter version.
- **Numbers.** Use `numeric` (tabular figures) for tables, amounts, dates and reference numbers.
- **Scale.** `body` is 1rem (16px) and never smaller for essential content. Long resident-facing text uses `body-large`. `body-small` is only for metadata and never for instructions, errors or labels.
- **Headings.** Weight 600 with slightly negative tracking gives the crisp, tight look. Negative letter spacing is only used at 20px and larger, where it doesn't hurt legibility.
- **Line length** is 60–75 characters (`max-inline-size: 70ch` on prose).
- **Sentence case** everywhere. No all-caps labels or headings, because they are slower to read and some screen readers spell them out.
- **Text spacing (1.4.12).** Everything must keep working with line height 1.5, paragraph spacing 2em, letter spacing 0.12em and word spacing 0.16em. No fixed heights on text containers.
- **Sizes in `rem`,** so browser zoom and font-size settings work (1.4.4).

## Layout

- **Grid.** Everything sits on a 4px grid, and the spacing scale is in the front matter (`--kv-space-<step>`). Most layouts use steps 2, 4, 6 and 8.
- **Reading column.** Resident-facing services use a single column of at most `40rem` for forms and `45rem` for prose. One question or one topic per page wherever possible.
- **Staff tools** may use a sidebar and a content area. The sidebar collapses behind a disclosure below `64rem`.
- **Breakpoints** are content-driven, but the reference points are `40rem`, `64rem` and `80rem`. Design mobile first.
- **Reflow (1.4.10).** Everything works at 320 CSS px wide and at 400% zoom without horizontal scrolling, except data tables, which scroll inside their own labelled, focusable region.
- **Text expansion.** Finnish and Northern Sámi strings can be 30–50% longer than English, and Finnish compounds are long. Buttons and labels wrap. Never set a fixed width on anything containing text, and use `overflow-wrap: anywhere` as a last resort, not truncation.
- **Direction.** Use logical properties (`margin-inline-start`, `padding-block`) so RTL works.
- **Sticky elements** (headers, action bars) must never cover the focused element (2.4.11). Use `scroll-padding` to match their height.

### Density

| Density               | Control height | Min target | Use                                                                           |
| --------------------- | -------------- | ---------- | ----------------------------------------------------------------------------- |
| Comfortable (default) | 44px           | 44×44px    | Everything resident-facing. Meets 2.5.5 Target Size (Enhanced)                |
| Compact (opt-in)      | 32px           | 24×24px    | Staff tools, tables and toolbars. Meets 2.5.8 only, and is documented as such |

## Elevation & Depth

Depth comes from layered surfaces and 1px lines, not from shadows. The look is flat and precise.

| Level | Surface          | Border          | Shadow                                                              | Use                       |
| ----- | ---------------- | --------------- | ------------------------------------------------------------------- | ------------------------- |
| 0     | `canvas`         | none            | none                                                                | Page                      |
| 1     | `surface`        | `border-subtle` | none                                                                | Sections, sidebars        |
| 2     | `surface-raised` | `border-subtle` | none                                                                | Cards                     |
| 3     | `surface-raised` | `border-subtle` | light: `0 8px 24px -4px #15161a1f`, dark: none (surface is lighter) | Popups, menus, popovers   |
| 4     | `surface-raised` | `border-subtle` | light: `0 24px 48px -8px #15161a33`, dark: none                     | Dialogs (with a backdrop) |

- A dialog backdrop dims the page, so it must not reduce the dialog's own contrast. Content behind a modal is `inert`.
- Shadows are never the only boundary, because they disappear in forced colours.
- **Motion.** Durations are 120ms (hover, press), 180ms (popups, disclosures) and 240ms (dialogs, page-level). Easing is `cubic-bezier(0.2, 0, 0, 1)`. Motion only runs under `prefers-reduced-motion: no-preference`, and otherwise state changes are instant. No parallax, no auto-playing carousels, nothing that flashes, and no animation longer than 5 seconds without a pause control (2.2.2).

## Shapes

- **Radii** are small and consistent: `sm` (4px) for badges inside controls, checkboxes and tags; `md` (6px) for buttons and inputs; `lg` (10px) for cards; `xl` (14px) for popups and dialogs; `full` for pills and avatars. Radio buttons are always circles and checkboxes always rounded squares, so the shape tells them apart.
- **Lines** are 1px. Control borders are 1px `border-control`, and invalid inputs switch to 2px `danger` plus an error message, never colour alone.
- **Focus ring**: 2px solid `focus-ring`, 2px offset, following the element's radius. It is restyled, never removed, and only shown for keyboard focus (`:focus-visible`, `data-focus-visible`). This meets 2.4.13.
- **Icons**: outline style, 1.5px stroke on a 24px grid, rendered at 16px, 20px or 24px, using `currentColor`. An icon next to text is `aria-hidden`. An icon-only button needs an accessible name from i18n and a visible tooltip, and is used only for universally known actions (close, search, menu). Icons are inline SVG and the theme has no icon dependency.

## Components

Visual rules for the default theme. Behaviour, roles and keyboard are defined in each component's `<name>.a11y.md`, never here. Style state through the `data-*` attributes (`docs/architecture.md#styling-contract`).

- **Buttons.** One primary button per view, for the main next step. Secondary buttons have a `border-control` outline. Destructive actions use `button-danger` and a confirmation step. Labels are verbs ("Send application", "Book time"). Disabled buttons keep their label readable, and prefer keeping them enabled and explaining what's missing on submit.
- **Links** look like links (underlined `primary`) and buttons look like buttons. Never swap the two.
- **Text inputs.** A visible label above the input, hint text between the label and the input, and the error message directly above the input. No placeholder-only labels. The input width reflects the expected answer (a postcode field is short).
- **Checkboxes and radios** are at least 24px, with the whole label clickable, and are grouped in a `fieldset` with a `legend` question.
- **Error summary.** At the top of the form, `danger` border with `danger-subtle` background, a heading and a list of links to each invalid field. It receives focus on submit.
- **Notifications and panels** use the `-subtle` background with a 4px inline-start border in the status colour, an icon, and a heading that states the status in words.
- **Popups** (menus, listboxes, popovers) use level 3 elevation and `xl` radius, with 8px padding and items at least 44px high (32px in compact).
- **Tables** use `numeric` for figures, `surface` for the header row, `border-subtle` row dividers and no zebra stripes. Sortable headers are buttons with a visible sort indicator.
- **Step indicator** shows "Step 2 of 5" in text, not only as dots.
- **Badges and tags** are for status or metadata, never for interactive elements.
- **Command menus and shortcuts** are welcome in staff tools, but every shortcut has a visible menu or button equivalent and single-character shortcuts can be turned off (2.1.4).

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

- Use one accent colour and let whitespace and weight create the hierarchy.
- Put one thing on each page for residents, and make the next step obvious.
- Pair every status colour with words and, where useful, an icon.
- Keep 44px targets for resident-facing controls.
- Test every design at 320px, at 200% text size, in dark and contrast themes and in forced colours before calling it done.
- Show real content in real languages in mock-ups, including the longest Finnish string.

Don't:

- Use `text-muted` for anything the user must read to complete the task.
- Use `border-subtle` as the only edge of a control.
- Remove focus outlines, or rely on a shadow or background change to show focus.
- Use low-contrast "ghost" text, grey-on-grey placeholders or disabled-looking active controls, even though they look elegant.
- Add gradients, glows or glass effects behind text. Decorative effects are allowed only on marketing surfaces of the docs site, and never reduce text contrast.
- Put essential information in tooltips, hover states or images of text.
- Use all caps, justified text, italic paragraphs or text smaller than 16px for instructions.
- Load fonts, icons or images from third-party servers.
- Claim that a design "is compliant". Say "designed and tested to meet WCAG 2.2 AA".
