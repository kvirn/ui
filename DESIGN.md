# KvirnUI design language

The visual and interaction source of truth for everything in KvirnUI that has a look: the default theme (`@kvirn-ui/theme`), the styled blocks (planned, M4), Storybook stories and the docs site. The headless packages ship zero CSS and are not bound by it (AGENTS.md hard rule 5).

It is a default, not a brand (`docs/vision.md`, non-goals). A municipality rebrands by overriding the `--kv-*` custom properties ([Theming](#theming)), and everything here is written so a rebrand stays accessible.

|                     |                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**          | Accepted. The values are the direction the maintainer chose after the Plan 0005 prototype (Linear-inspired).                                                                                             |
| **Values**          | Every token value lives in `theme.css`, not here. This file holds the rules and the role each token plays. The four themes map to palette steps in the [semantic table](#semantic-tokens).               |
| **Implementation**  | `packages/theme/theme.css`, hand-written, is the source of truth for values. `vp run theme:check` enforces every contrast pair.                                                                          |
| **Changing a rule** | Needs the maintainer's approval, `theme.css` in the same change and a green `theme:check`. The reason goes in the commit body and the PR. Process: the `design` skill. CSS: `.claude/skills/theme-css/`. |
| **Behaviour**       | Roles, keys and focus live in each component's `<name>.a11y.md`, never here.                                                                                                                             |

## Overview

**Calm, precise, plain.** The interface is quiet so the content and the next step are loud. Nothing decorative competes with the task.

- Near-black and near-white canvases, and a ladder of slightly lifted surfaces with 1px hairlines instead of shadows.
- One lavender accent (`--kv-primary-500`), used sparingly.
- IBM Plex Sans for text and controls, IBM Plex Serif for headings, no negative tracking below the display size.
- `--kv-radius-md` on controls.
- Depth only on the button, which sits on the page with a soft shadow and a tinted edge so it reads as "press me".

### Who we design for

- **Residents** using e-services (applications, bookings, reports, payments), often once, often on a phone, sometimes stressed. They include older people, people with cognitive, visual or motor disabilities, people with low digital confidence and people reading in their second language. Some read Northern Sámi, Finnish, Swedish or Norwegian, and Finland and Norway publish in two languages.
- **Case workers and staff** using internal tools every day on a desktop. They need speed, density and keyboard efficiency, under the same accessibility bar, because staff have disabilities too.

### Principles, in priority order

1. **Clarity over cleverness.** Everyone understands what the page is, what to do and what happens next, without prior knowledge.
2. **Accessible by construction.** Contrast, focus, target size and reflow are properties of the tokens, not a later fix. WCAG 2.2 AA is the floor. The default theme also meets 2.4.13 Focus Appearance for keyboard focus and 2.5.5 Target Size (Enhanced) in comfortable density.
3. **Quiet interface, loud content.** Neutral chrome, one accent, colour used for meaning and never for decoration.
4. **Precision.** A 4px grid, consistent radii, 1px lines, aligned edges. Precision reads as trustworthiness, and public services need trust.
5. **Density fits the context.** Comfortable for residents by default. Compact is opt-in for staff tools and never below AA.
6. **Respect the user's settings.** OS colour scheme, contrast, forced colours, reduced motion, zoom and text spacing always win.

### Keep the look, change the value

Where a look like this usually relies on low-contrast greys, faint control borders, a lighter hover behind white text or small labels, we keep the look and change the value until it passes WCAG 2.2 AA (7:1 for text in the contrast themes). Each deviation is stated where it applies. In short:

| Usual habit                     | What we do instead                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| The accent as text              | A separate `link` token (the accent is 4.44:1 as text on dark)                                                        |
| Faint hairline control borders  | `border-control`, at 3:1 or more                                                                                      |
| Lighter hover behind white text | Filled buttons darken on hover                                                                                        |
| Glow or thin focus              | A solid ring, at least 2px thick and offset (`--kv-focus-ring-width`, `--kv-focus-ring-offset`)                       |
| Small captions, eyebrows, caps  | None: `body`-size controls (`body-small` only for help text, `label-compact` only in compact), sentence case, no caps |
| Tight or negative tracking      | None on body text, none under 20px                                                                                    |
| Muted text for help and hints   | `text`: instructions are content                                                                                      |

## Colors

A neutral grey with a faint cool tint, a ladder from canvas to raised surface, and one lavender accent. The accent means "interactive or selected". The status colours mean danger, success and warning. Status is never conveyed by colour alone (1.4.1): it always comes with words and, where useful, an icon.

### Two token tiers

Both are CSS custom properties in `theme.css`.

- **Palette** (`--kv-<role>-<step>`). Role scales from 50 (lightest) to 950 (darkest), named by role and never by hue, so a rebrand swaps a scale without a refactor. The palette is the only place with raw colour values.

  | Scale                                               | Default               | Use                                                       |
  | --------------------------------------------------- | --------------------- | --------------------------------------------------------- |
  | `--kv-neutral-*`                                    | Grey, faint cool tint | Canvases, surfaces, borders, text                         |
  | `--kv-primary-*`                                    | Lavender              | The one accent: primary buttons, links, focus, selection  |
  | `--kv-secondary-*`                                  | The neutral steps     | The secondary button's edge, so a brand can give it a hue |
  | `--kv-accent-*`                                     | Teal                  | Unused by the default theme. A brand's second colour      |
  | `--kv-danger-*`, `--kv-success-*`, `--kv-warning-*` | Red, green, amber     | Status                                                    |
  | `--kv-white`, `--kv-black`                          | White and near-black  | Extremes                                                  |

- **Semantic tokens** (`--kv-color-<name>`). Components use only these. Each theme points them at palette steps. Four themes come from two preference axes, colour scheme and contrast, and only remap semantic tokens.

### Semantic tokens

| Token            | light           | dark            | light-contrast  | dark-contrast   | Use                                                                                                                                                                        |
| ---------------- | --------------- | --------------- | --------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canvas`         | `white`         | `black`         | `white`         | `black`         | Page background, and a canvas section (`kv-section--canvas`)                                                                                                               |
| `surface`        | `neutral-50`    | `neutral-950`   | `neutral-50`    | `neutral-950`   | Sections (`Section`), sidebars, table headers, code                                                                                                                        |
| `surface-raised` | `white`         | `neutral-900`   | `white`         | `neutral-900`   | Cards, popups and dialogs                                                                                                                                                  |
| `border-subtle`  | `neutral-100`   | `neutral-800`   | `neutral-500`   | `neutral-400`   | Hairline dividers and decorative outlines only                                                                                                                             |
| `border-control` | `neutral-500`   | `neutral-500`   | `neutral-700`   | `neutral-200`   | Borders that identify a control (inputs, checkboxes)                                                                                                                       |
| `border-focus`   | `primary-600`   | `primary-400`   | `primary-800`   | `primary-200`   | A field's edge while it has focus, a click included. A step darker than `focus-ring` in light                                                                              |
| `secondary`      | `secondary-500` | `secondary-500` | `secondary-700` | `secondary-200` | The secondary button's edge. Equal to `border-control` until `--kv-secondary-*` gets a hue                                                                                 |
| `text`           | `neutral-950`   | `neutral-50`    | `black`         | `white`         | Body text                                                                                                                                                                  |
| `heading`        | `neutral-950`   | `neutral-50`    | `black`         | `white`         | Headings in prose. The same step as `text` by default, so a site can set its own                                                                                           |
| `text-muted`     | `neutral-600`   | `neutral-400`   | `neutral-700`   | `neutral-200`   | Secondary text and metadata, and the fill of a disabled pressed toggle (with `surface` on it). Never help texts or descriptions: they are instructions, so they use `text` |
| `primary`        | `primary-500`   | `primary-500`   | `primary-800`   | `primary-200`   | Primary button background, selected state, the current navigation item's fill and the table of contents' current heading, info alert bar and icon                          |
| `primary-hover`  | `primary-600`   | `primary-600`   | `primary-900`   | `primary-100`   | Hover and pressed state of `primary`                                                                                                                                       |
| `on-primary`     | `white`         | `white`         | `white`         | `black`         | Text and icons on `primary`                                                                                                                                                |
| `primary-subtle` | `primary-50`    | `primary-950`   | `primary-50`    | `primary-950`   | The navigation and table-of-contents trail (the current item's ancestors), secondary button hover, selected rows, info alerts                                              |
| `accent`         | `accent-600`    | `accent-400`    | `accent-800`    | `accent-200`    | The end of the loading indicators' gradient (`primary` to `accent`); never text, never a status                                                                            |
| `link`           | `primary-600`   | `primary-400`   | `primary-800`   | `primary-200`   | Link text, badge text                                                                                                                                                      |
| `link-hover`     | `primary-700`   | `primary-300`   | `primary-900`   | `primary-100`   | Link hover and pressed                                                                                                                                                     |
| `focus-ring`     | `primary-500`   | `primary-400`   | `primary-800`   | `primary-200`   | Focus indicator                                                                                                                                                            |
| `danger`         | `danger-600`    | `danger-300`    | `danger-700`    | `danger-200`    | Errors, destructive actions, danger alert bar and icon                                                                                                                     |
| `danger-hover`   | `danger-700`    | `danger-200`    | `danger-800`    | `danger-100`    | Hover and pressed state of `danger`                                                                                                                                        |
| `on-danger`      | `white`         | `black`         | `white`         | `black`         | Text and icons on `danger`                                                                                                                                                 |
| `danger-subtle`  | `danger-50`     | `danger-950`    | `danger-50`     | `danger-950`    | Danger alerts, including the error summary                                                                                                                                 |
| `success`        | `success-700`   | `success-300`   | `success-800`   | `success-200`   | Confirmation, completed steps, success alert bar and icon                                                                                                                  |
| `success-subtle` | `success-50`    | `success-950`   | `success-50`    | `success-950`   | Success alerts                                                                                                                                                             |
| `warning`        | `warning-700`   | `warning-300`   | `warning-800`   | `warning-200`   | Warnings, deadlines, warning alert bar and icon                                                                                                                            |
| `warning-subtle` | `warning-50`    | `warning-950`   | `warning-50`    | `warning-950`   | Warning alerts                                                                                                                                                             |

The theme paints `body` with `canvas`, `text` and the `body` role at zero specificity (`:where(body)`), so any CSS of yours overrides it and the page never shows the browser's own canvas behind KvirnUI text.

### Contrast floors

`vp run theme:check` measures every pair below, in every theme, and is the source for the numbers. These are the floors it enforces.

| What                                                                                                                                   | Standard themes | Contrast themes | On                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------- | ------------------------------------------------------------------------------ |
| Text tokens (`text`, `heading`, `text-muted`, `link`, `danger`, `success`, `warning`)                                                  | 4.5:1           | 7:1             | `canvas`, `surface`, `surface-raised` and each `-subtle` background it sits on |
| `on-primary` on `primary`, `on-danger` on `danger`, and on their hover fills                                                           | 4.5:1           | 7:1             | The button fills                                                               |
| `border-control`, `border-focus`, `secondary`, `focus-ring`, `primary` as a selected or current marker, `accent` as the gradient's end | 3:1             | 3:1             | `canvas`, `surface`, `surface-raised`, `primary-subtle`                        |
| Tinted button edges (see [Button depth](#button-depth))                                                                                | 3:1             | n/a (flat)      | The three surfaces and the four alert backgrounds                              |
| Pressed toggle fill                                                                                                                    | 3:1             | 3:1             | The three surfaces and a hovered button beside it                              |
| `link` against `text`, so a link is told from body text without an underline (1.4.1)                                                   | 3:1             | not reachable   | Body text. The contrast themes and forced colours keep the underline at rest   |

### Rules

- **`border-subtle` never identifies a control.** Anything a user must perceive to operate (input edges, checkbox boxes) uses `border-control`, and a secondary button's outline uses `secondary`, both at 3:1 (1.4.11). Hairlines are only 1.15–1.36:1 in the standard themes, so they are decoration and dividers.
- **Filled buttons get darker on hover, never lighter.** White on a lighter `#828fff` is 2.87:1.
- **The focus ring has an offset.** `focus-ring` on `primary` is about 1:1, so the ring sits `--kv-focus-ring-offset` outside the element, where the adjacent colour is the background.
- **Links use `link` and underline on hover only.** The contrast themes and forced colours can't reach 3:1 against `text`, so they keep the underline at rest. So does a link in grey or red text (a caption, `small`, help text, an error message, a count). In dark themes `link` is lighter than `primary`, because `#5e6ad2` as text on the dark canvas is 4.44:1.
- **Navigation and `TableOfContents` may drop the underline** and use `text`, because position in a labelled `<nav>` list is the cue. See [Navigation](#navigation-and-table-of-contents).
- **Dark themes are not inverted light themes.** Raised surfaces get lighter instead of casting a shadow. The one exception is the button: its depth in dark is a lighter top edge, and its bottom edge never darkens (it would drop to 1.80–2.20:1).
- **`heading` is held to everything `text` is.** A site that gives headings their own colour keeps the floors on every background body text sits on. In forced colours both are `CanvasText`.
- **Forced colours** (`forced-colors: active`) use system colours (`Canvas`, `CanvasText`, `LinkText`, `ButtonText`, `Highlight`, `GrayText`). Every surface and control keeps a 1px border even if it is transparent in the normal theme, so boundaries survive. Selected and current states get a non-colour cue: a border, a check mark or an underline.

## Typography

One sans family for text and controls, one serif family for headings, each with a system fallback, and one monospace family for reference numbers and code. Each role (`display`, `heading-1` to `heading-6`, `body-large`, `lead`, `body`, `body-small`, `label`, `label-compact`, `numeric`, `code`) is a set of `--kv-font-<role>-size`, `-weight`, `-line-height` and `-letter-spacing` tokens in `theme.css`.

### Families

| Use                                                             | Token                      | Falls back to              | Default font   |
| --------------------------------------------------------------- | -------------------------- | -------------------------- | -------------- |
| Prose, buttons, labels, navigation, tables, captions            | `--kv-font-family-body`    | `--kv-font-family-sans`    | IBM Plex Sans  |
| Headings `h1`–`h6`, and wherever you apply the `display` tokens | `--kv-font-family-heading` | `--kv-font-family-serif`   | IBM Plex Serif |
| Reference numbers and code                                      | `--kv-font-family-mono`    | The system monospace stack | System mono    |

The theme sets neither override. A link keeps the font around it. The serif is only for real headings: anything users operate or scan as data stays sans, and hierarchy never depends on the family alone. An alert's title is the exception that stays sans (weight 600, at `--kv-alert-title-size`): it is a message label, and a serif at that size would read as new page structure.

Each brand stack ends in the matching system stack, `--kv-font-family-system` (`system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif`) or `--kv-font-family-system-serif` (`ui-serif, Cambria, 'Noto Serif', Georgia, serif`). `--kv-font-family-sans` and `-serif` are IBM Plex in front of them. A replacement font must cover the Sámi letters as well as å ä ö æ ø: check the Glyphs story in Foundation/Typography.

### Why IBM Plex

Plex Sans's capitals sit in the middle of the line box, and its vertical metrics are the same on every OS (`hhea` = `win`, 1025/275), so labels sit the same way everywhere. It tells l, I and 1 apart without features and covers every Northern Sámi letter. Plex Serif shares its metrics and gives headings a calm, distinct voice. Both are SIL OFL 1.1 with "Plex" a Reserved Font Name: use IBM's files unmodified, never subset or rename them. Spec: `docs/design/typography-ibm-plex.md`.

### Loading

The theme never loads a font (GDPR, AGENTS.md hard rule 7). The docs site and Storybook self-host IBM's split woff2 files (Latin1, Latin2, Pi). Adopters self-host the same files, from [IBM Plex's GitHub releases](https://github.com/IBM/plex/releases) or copied from `apps/docs/fonts/ibm-plex/` with `OFL.txt`, or rely on the system fallback. The `@ibm/plex-sans` and `@ibm/plex-serif` npm packages send IBM telemetry from a `postinstall` script: don't install them as dependencies. Fetch them with `npm pack`, or set `IBM_TELEMETRY_DISABLED=true` if you must install them.

### Roles and weights

- **Weights.** Sans 400 (text, and navigation items at rest), 500 (labels and controls), 600 (`strong`, the current navigation item and its trail). Serif 500 (`heading-2`, `heading-5`, `heading-6`) and 600 (the other headings). Upright only: italics are synthesised. Nothing uses 700.
- **`body`** is the base size and never below 1rem for essential content. Long resident-facing text uses `body-large`.
- **`lead`** (weight 400, no tracking) is only for the lead paragraph of large prose. Default prose uses `body-large` for its lead. A lead is essential content: `text`, never `text-muted`.
- **`body-small`** is for metadata and the help text (`Field.HelpText`), never for errors or descriptions. See [Forms](#forms).
- **`label-compact`** (weight 500) is only for control labels in compact density. Navigation items in compact are `body-small`-sized at weight 400, and 600 when current or on the trail.
- **`numeric`** (tabular figures) for tables, amounts, dates and reference numbers.
- **Prose sizes.** `kv-prose--small` (14px, for notes and metadata only, never for text a resident must read), `--large` (18px), `--xl` (20px), `--2xl` (24px), and `--full` lifts the 70ch measure. Headings keep their type roles in every size.
- **No 12px or 13px size.** There are no small captions or eyebrows.
- **Below `40rem`** the large roles step down in `rem` media queries, never `clamp()` with `vw`, so text-only zoom works: `display` (which also loses its tracking), `heading-1`, `heading-2` and `lead` each get a smaller `--kv-font-<role>-size`. `heading-3` to `heading-6` and the body roles never change. The `--kv-font-<role>-size` tokens hold the sizes from `40rem` up.

### Headings

Six levels, `h1` to `h6`, each a role (`heading-1` to `heading-6`), with `display` above `heading-1` for a page title. Weight 600, except `heading-2` at 500.

- `heading-4`, `heading-5` and `heading-6` all use the `body` size, because essential content is never below it. They are told apart by `-weight`, `-line-height` and `-letter-spacing`, never by shrinking: `heading-4` is the heaviest with the tighter line height, `heading-5` is lighter, and only `heading-6` has tracking. They never step down on a small screen.
- The three are close in look, and a hierarchy never depends on weight alone, so resident-facing text stops at `h3` where it can. In the large prose sizes they are smaller than the body, which is why `h4` to `h6` don't belong there.
- `display` has slight negative tracking and a line height set so the ring on Å clears the descenders above it. Below 40px there is no tracking: negative tracking crowds serifs, and it reverses under the 1.4.12 overrides anyway.

### Reading and spacing

- **Line length** 60–75 characters (`--kv-prose-measure`, `70ch`, on prose).
- **Sentence case** everywhere. No all-caps labels, headings or eyebrows: they read slower and some screen readers spell them out.
- **Disambiguation.** No feature settings are needed. Don't turn on the slashed zero (`zero`, `ss03`): it reads as Ø in Danish and Norwegian. Set codes where O and 0 matter in `code` (mono), or add `'ss04'` (the dotted zero). A brand font that needs features for l, I and 1 sets them in the `--kv-font-*-feature-settings` tokens (Inter: `'cv05', 'cv08'`).
- **Text spacing (1.4.12).** Everything keeps working with line height 1.5, paragraph spacing 2em, letter spacing 0.12em and word spacing 0.16em. No fixed heights on text containers: control heights, such as 44px, are minimum block sizes.
- **Sizes in `rem`**, so browser zoom and font-size settings work (1.4.4).
- **One family, or keep Inter.** One family: `--kv-font-family-heading: var(--kv-font-family-sans)`. To keep Inter, set both family tokens and the body feature settings.

## Layout

- **Grid.** Everything sits on a 4px grid. The spacing scale is `--kv-space-<step>` in `theme.css`, and most layouts use steps 2, 4, 6 and 8.
- **Reading column.** Resident-facing services use one column, at most `40rem` for forms and `45rem` for prose. One question or topic per page wherever possible.
- **Staff tools and the docs site** may use a sidebar (a `Section`) and a content area. The sidebar collapses behind a disclosure below `64rem`.
- **Breakpoints** are content-driven, with reference points at `40rem`, `64rem` and `80rem`. Mobile first.
- **Reflow (1.4.10).** Everything works at 320 CSS px wide and at 400% zoom with no horizontal scrolling, except data tables, which scroll inside their own named region (`kv-scroll-region`), a Tab stop only while it overflows.
- **Direction.** Logical properties (`margin-inline-start`, `padding-block`), so RTL works.
- **Sticky elements** (headers, action bars) never cover the focused element (2.4.11). Use `scroll-padding` to match their height.

### Layout components

> **Maintainer review (Plan 0056):** this section (the `80rem`, `45rem` and `40rem` measures, the `space-4`/`6`/`10` page padding, the column minimums, the sidebar widths and the `64rem` break) is new text. Remove this note when approved.

Four components in `@kvirn-ui/react` place content with typed choices and no CSS of the adopter's own: `Container`, `Stack`, `Columns` and `SidebarLayout`. They draw nothing (no colour, edge or shadow) and add no role, landmark or name. The widths below are layout constants, not tokens; the gaps are `space` steps.

| Component       | Choice                  | Values                                                                                                                                                                                                            |
| --------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`     | `size`                  | `page` (default): centred, at most `80rem`, inline padding `space-4`, `space-6` from `40rem`, `space-10` from `64rem`. `reading`: `45rem`. `form`: `40rem`. The two measures are start-aligned and add no padding |
| `Stack`         | `gap`                   | `space-2`, `space-4`, `space-6` (default), `space-8`                                                                                                                                                              |
| `Columns`       | `minColumnWidth`, `gap` | `sm` `14rem`, `md` `18rem` (default), `lg` `24rem`; gap `space-4`, `space-6` (default), `space-8`. Tracks are `minmax(min(<width>, 100%), 1fr)`, so there is one column at 320px                                  |
| `SidebarLayout` | `sidebarWidth`          | `sm` `16rem`, `md` `20rem` (default). One column below `64rem`; from `64rem` the sidebar track and the content, with a `space-10` gap                                                                             |

- **DOM order is visual order.** Whichever part comes first is at inline start. There is no `reverse`, `order` or dense packing (1.3.2, 2.4.3), and RTL mirrors by logical properties.
- **A form never gets a sidebar** and a list of results is one column at `45rem` (`Container size="reading"`); a card grid is for entry points, not results.
- **Nothing sticky.** A layout component never sets `position: sticky`, a fixed height or `overflow`, so a focused element is never covered or clipped (2.4.11) and text spacing never cuts text off (1.4.12).
- **No landmark of its own.** `render` picks the element (`ul` for a list of links, `nav` and `main` with a name); a page has one `main`.
- A site changes these values in its own CSS (`.kv-container { max-inline-size: 72rem }`), not in props.

### Text expansion and hyphenation

Finnish and Northern Sámi strings can be 30–50% longer than English, and Finnish compounds are long.

- Buttons and labels wrap. Never set a fixed width on anything containing text. `overflow-wrap: anywhere` is a last resort, and truncation is not an option.
- Prose, cards, alerts and headings (`kv-heading`) hyphenate words of 10 letters or more at the dictionary's points (`hyphens: auto`, `hyphenate-limit-chars: 10 4 4`), never inside code. Where there is no dictionary (Northern Sámi) they fall back to `overflow-wrap: break-word`.
- Hyphenation follows `lang`: set it on `<html>` and on every passage in another language.
- Browsers differ (measured 2026-10-02: Chromium lacks Finnish and Northern Sámi, Firefox lacks Northern Sámi), so only soft hyphens give the same result everywhere. Hyphenation is visual only, and at 200% zoom headings grow less than 2x, which is accepted. An adopter turns it off with `hyphens: manual`.

### Density

Set on a container with `class="kv-compact"`. Comfortable is the default and needs no class. On `<html>` or `<body>`, the class makes a whole staff tool compact.

| Density               | Control min height | Label type      | Min target | Use                                                                                                           |
| --------------------- | ------------------ | --------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| Comfortable (default) | 44px               | `label`         | 44×44px    | Everything resident-facing, and every primary action. Meets 2.5.5 Target Size (Enhanced)                      |
| Compact (opt-in)      | 32px               | `label-compact` | 24×24px    | Staff tools, tables, and the docs site chrome at 64rem and wider. Meets 2.5.8 only, and is documented as such |

- Below `64rem`, where touch input is likely, compact chrome returns to comfortable.
- A toolbar has no density of its own: its controls follow the density around them. A toolbar that can sit in a resident-facing form, such as an editor's, is comfortable unless its container is compact.

## Elevation & Depth

Depth comes from the surface ladder (`canvas` → `surface` → `surface-raised`) and 1px hairlines, not shadows. The look is flat and precise. The one exception is the button, which isn't a surface level: see [Button depth](#button-depth).

| Level | Surface          | Border                                             | Shadow                                                               | Use                            |
| ----- | ---------------- | -------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------ |
| 0     | `canvas`         | none                                               | none                                                                 | Page                           |
| 1     | `surface`        | 1px `transparent` (`CanvasText` in forced colours) | none                                                                 | Sections, sidebars (`Section`) |
| 2     | `surface-raised` | `border-subtle`                                    | none                                                                 | Cards (`Card`)                 |
| 3     | `surface-raised` | `border-subtle`                                    | `--kv-shadow-popup` (light only: dark relies on its lighter surface) | Popups, menus, popovers        |
| 4     | `surface-raised` | `border-subtle`                                    | `--kv-shadow-dialog` (light only)                                    | Dialogs (with a backdrop)      |

- The shadow tokens mix `--kv-neutral-950` with `color-mix()`, so the palette stays the only place with raw colours.
- Shadows are never the only boundary, because they disappear in forced colours.
- A dialog backdrop dims the page without reducing the dialog's own contrast. Content behind a modal is `inert`.
- An alert isn't a level: it is a tinted block in the content at the level of whatever it sits on, with no shadow, and its edge is its indicator bar.
- Level 1 has no visible edge: its 1px border is `transparent`. A region is identified by its position, its heading and, where worth it, a named landmark. A consumer may colour the one edge that meets content with `border-subtle`, for example `border-inline-end-color` on a sidebar.

### Button depth

> **Status: implemented in `theme.css` (Plan 0010). The usability test and the manual AT visual check are pending.** Spec: `docs/design/button-depth.md` (variation D, "Grounded").

Buttons (`kv-button`, `kv-button--primary`, `kv-button--danger`) sit on the page: a soft ambient shadow, and a 1px edge tinted darker at the bottom in light and lighter at the top in dark. Depth means "press me", so nothing else gets it.

| State                    | Shadow                     | Edges                                                                                 |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------- |
| Rest                     | `--kv-shadow-button`       | Tinted: the bottom edge in light, the top edge in dark. The others are the token edge |
| Hover                    | `--kv-shadow-button-hover` | Tinted, following the hover edge (`primary` on the base and primary buttons)          |
| Pressed (`:active`)      | none                       | The token edge on all four sides                                                      |
| Focus-visible, any state | **none**                   | Tinted, as at rest or on hover                                                        |
| Disabled                 | none                       | Dashed `border-control` on all four sides                                             |

- **Tinting.** An edge is `color-mix(in srgb, <edge>, var(--kv-button-edge-shade))` at the bottom and `color-mix(in srgb, <edge>, var(--kv-button-edge-highlight))` at the top. `<edge>` is the button's token edge in that state (`secondary`, `primary` or `transparent`). Over a transparent edge the mix shows over the fill, so a filled button's bottom edge is its fill with some ink. A tinted edge never lowers a boundary: it is held to 3:1 on `canvas`, `surface` and `surface-raised` (1.4.11), and on the four alert backgrounds, because an alert's Actions hold buttons. `theme:check` measures all 56 combinations per theme.
- **Focus.** The shadow goes on keyboard focus, so the ring's adjacent colour is the plain page and its contrast is exactly the measured `focus-ring` pair. With the hover shadow under the ring it was 3.04:1 on `surface` in light, and unmeasured. Focus is shown only by the ring, never the shadow.
- **Dark.** Only the top edge changes, and it gets lighter.
- **Contrast themes and forced colours: flat.** Both shadows `none` and both edge tokens `0%`, so every edge is the measured token on all four sides. In forced colours the edges are `ButtonText`, `Highlight` on hover and pressed, and dashed `GrayText` when disabled.
- **Motion.** `box-shadow` transitions with the other button properties over `--kv-duration-fast`, only under `prefers-reduced-motion: no-preference`.
- **Never the only cue.** Fill, edge and label carry the button without depth.

| Token                        | light                                      | dark                              | contrast themes, forced colours |
| ---------------------------- | ------------------------------------------ | --------------------------------- | ------------------------------- |
| `--kv-shadow-button`         | A two-layer soft shadow of `neutral-950`   | A single `black` shadow           | `none`                          |
| `--kv-shadow-button-hover`   | The same, lifted a little                  | The same, lifted a little         | `none`                          |
| `--kv-button-edge-shade`     | `neutral-950` mixed in, at the bottom edge | 0%                                | 0%                              |
| `--kv-button-edge-highlight` | 0%                                         | `white` mixed in, at the top edge | 0%                              |

The shadows mix the palette with `color-mix(in srgb, <colour> N%, transparent)`. The edge tokens are a colour and a percentage, the second argument of `color-mix()`. The values are in `theme.css`, and `theme:check` measures every tinted edge against the 3:1 floor.

## Motion

Durations are `--kv-duration-fast` (hover, press), `--kv-duration-medium` (popups, disclosures) and `--kv-duration-slow` (dialogs, page-level). Easing is `--kv-easing-standard`.

- Motion only runs under `prefers-reduced-motion: no-preference`. Otherwise state changes are instant.
- No parallax, no auto-playing carousels, nothing that flashes, and no animation longer than 5 seconds without a pause control (2.2.2): the loading indicators are the exception the app must cover itself (below).
- **Loading indicators loop for as long as a wait lasts** (`--kv-duration-loop`, 1600ms: the spinner's arc and the bars' sweep). `prefers-reduced-motion` shows the rest shape (a three-quarter arc, a hatch, a plain gradient) and the library honours that. They move for more than 5 seconds, so **WCAG 2.2.2 (Pause, Stop, Hide) applies, and the app must offer a way to stop them**: the OS setting is read by the library, but 2.2.2 asks for a mechanism on the page, so an app needs its own "reduce motion" control. The library ships none, by decision; `docs/design/loading-indicators.md` ("Consumer duty for 2.2.2") has the CSS to switch the loops off. The toast timer ring, fades and transitions are timers or under 5 seconds.

## Shapes

### Radii

Small and consistent.

| Token              | Use                                              |
| ------------------ | ------------------------------------------------ |
| `--kv-radius-sm`   | Badges inside controls, checkboxes, tags, alerts |
| `--kv-radius-md`   | Buttons, inputs, navigation items, tooltips      |
| `--kv-radius-lg`   | Cards and example frames                         |
| `--kv-radius-xl`   | Popups and dialogs                               |
| `--kv-radius-full` | Pills and avatars                                |

Radio buttons are always circles and checkboxes always rounded squares, so the shape tells them apart.

### Lines

- Lines are 1px. The indicator bar (`--kv-indicator-width`) marks a blockquote and an alert, a selected tab, and, in forced colours only, the current navigation item. It is a straight `::before`, never a border on a rounded box, which would follow the corners.
- Control borders are 1px `border-control`. An invalid input switches to a heavy `danger` edge (`--kv-control-border-width-invalid`: 2px, never 1px, and also the width of the focus and drag-over edges below) plus an error message, never colour alone.

### Focus ring

A solid `focus-ring` at `--kv-focus-ring-width` (never below 2px, which 2.4.13 needs), offset by `--kv-focus-ring-offset` (at least 2px, so the adjacent colour is the background), following the element's radius. It is restyled and never removed, and shown only for keyboard focus (`:focus-visible`, `data-focus-visible`). A thinner or glow-style focus is not used.

- It meets 2.4.13 (AAA) for focus that starts from the keyboard.
- Text inputs match `:focus-visible` on a click too, so for them the script decides (`data-focus-visible`, with `:focus-visible` as the fallback before it runs). A click shows a heavy `border-focus` edge instead (1px `Highlight` in forced colours, where a heavy edge alone means invalid). That edge is not claimed against 2.4.13.

### Icons

Outline style, a 1.5 stroke on a 24 grid with round caps and joins, in `currentColor`. `@kvirn-ui/react` ships 24 built-in icons with semantic names, in the style of Heroicons outline but drawn from our own keylines (`docs/design/icon.md`). An app that registers the same name in `KvirnProvider` replaces a built-in, and Kvirn's components follow it. Icons are inline SVG: no icon fonts and none from third-party servers.

- **Size** is a step of Tailwind's `size-*` scale (`size={4}`), and a step is 0.25em, so an icon grows with the text: step 4 is 1em, 5 (default) 1.25em, 6 1.5em (16, 20, 24px next to 16px text). Use 5 in buttons, because it equals their line height. A string is a CSS length (`size="48px"`). Size, stroke and colour are SVG attributes: the theme never sets them, except in forced colours, where an icon takes its parent's system colour.
- **Meaning.** An icon is decorative (`aria-hidden`) unless it has a `label` from i18n. A status icon always comes with the status in words, and the four statuses differ in shape as well as colour: info a square, success a circle, warning a triangle, error an octagon. A meaningful icon has 3:1 contrast against its background.
- **Direction.** Name by meaning (`chevron-forward`, `arrow-back`). Only icons that show horizontal direction mirror in RTL (`mirrorInRtl`). Check marks, status icons, objects and `search` never mirror.
- **Icon-only buttons** (`kv-button--icon-only`) are square, at least the button's minimum height, with `--kv-space-2` padding. Use them only for close and search, with an accessible name from i18n and, from M2, a visible tooltip with the same text. The menu toggle on resident-facing pages shows the word "Menu" too.

## Components

Visual rules for the default theme. Style parts and variants through classes and state through `data-*` attributes (`docs/architecture.md#styling-contract`): `.kv-button`, `.kv-button--primary`, `[data-disabled]`. The class names are listed under [Theming](#class-contract). Each component links its design spec in the [index](#design-spec-index) at the end.

### Words we use

Each word means one thing, in this file, the docs, Storybook, specs and code comments.

| Word               | Means                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Surface**        | A background colour token (`canvas`, `surface`, `surface-raised`, the `-subtle` backgrounds). Not a box or a component.                                                                                     |
| **Section**        | A region of the page: elevation level 1.                                                                                                                                                                    |
| **Card**           | One thing people read, compare or act on as a unit: elevation level 2.                                                                                                                                      |
| **Alert**          | A status message in the content: `Alert.Info`, `.Success`, `.Warning`, `.Danger`. The name is the component, not the ARIA role (Plan 0042).                                                                 |
| **Toast**          | A transient message that floats over the page and goes away (a later component). It reuses the Alert look and status words.                                                                                 |
| **Progress**       | A wait shown as text first, with a spinner (unknown wait) or a native gradient bar (known value). The indicators are decorative and loop; the app owns the 2.2.2 stop control (Plan 0080).                  |
| **Busy**           | A button whose action is running: `aria-disabled` and `data-busy`, still focused, every press blocked. Not disabled.                                                                                        |
| **Empty state**    | The words that stand in for content that isn't there yet, or a search with no result: classes on your own markup (`kv-empty-state`), not a component.                                                       |
| **`role="alert"`** | The ARIA role of an assertive live region: an Announcer detail, never put on an Alert box. `AlertDialog` (a later component) is a separate, modal dialog. An Alert announces only when you pass `announce`. |

"Panel" is retired (say Section). "Banner" and "callout" aren't KvirnUI words (`banner` is the ARIA landmark of the site header). Say Alert for a status and Section for a region.

### Actions

#### Buttons

- One primary button per view, for the main next step. Secondary buttons use `surface-raised` with a `border-control` outline.
- Destructive actions use `button-danger` and a confirmation step.
- Labels are verbs ("Send application", "Book time").
- Disabled buttons keep their label readable, with a dashed border as the non-colour cue. Prefer keeping them enabled and explaining what's missing on submit.
- Depth, tinted edges and flat cases (disabled, contrast themes, forced colours, a button inside an input group): see [Button depth](#button-depth).
- A hovered or pressed primary button keeps a `primary` edge around its `primary-hover` fill, so its boundary stays at 3:1 on `surface-raised` in dark. `theme:check` tests that a hovered filled button's edge (its border, or its fill when transparent) reaches 3:1 on `canvas`, `surface` and `surface-raised`.
- Size follows the density. A site sizes every button without touching other controls with `--kv-button-min-block-size`, `--kv-button-padding-inline`, `--kv-button-font-size`, `--kv-button-font-weight` and `--kv-button-line-height`, which fall back to the `--kv-control-*` tokens. Set, they win over density, but the height never goes below 24px (2.5.8) and resident-facing buttons stay at 44px.
- `kv-button-group` lays buttons out start-aligned, primary first.
- A busy button (`data-busy`, `aria-disabled`) keeps its look and depth, with the `progress` cursor. It is not the dashed disabled look: the label beside it says what is happening.

**Toggle** (`kv-toggle`, `aria-pressed`) is a button that is on or off.

- Off, it is a button. On, it is a pressed-in primary button: a solid `primary` fill with `on-primary` text or icon, a `primary` edge on all four sides, no depth, and flat in a toolbar.
- The state is a filled tile that is there or not, and the icon or label changes colour with it, so it never rests on hue alone (1.4.1).
- A disabled pressed toggle keeps its tile in grey (`text-muted` fill, `surface` icon or label, inside the dashed disabled edge), so it still says it is on.
- In forced colours it is a `Highlight` fill with `HighlightText`. The name never changes with the state.

#### Links

- Links look like links (`link`, underlined on hover) and buttons look like buttons. Never swap the two. Hover adds a thicker underline and uses `link-hover`.
- **The service link** (`kv-link--service`) is the one link per view that starts an e-service: a `link` label with a `primary` edge and, with a `Link.Icon` first, a `primary` block holding an `on-primary` icon (`link-service`, `link-service-icon`). It is flat, because depth means "press me" and this navigates. It is a link, never a button, and has no disabled state: an unavailable e-service is text, not a dimmed link.

#### Skip link and visually hidden text

- **The skip link** (`kv-skip-link`) is the first Tab stop in the body. Hidden (clipped, never `display: none`) until it has focus, then in the flow of the page, never an overlay, so it can't cover the header's own focused element. `link` on `canvas`, underlined, with the token focus ring and a target of at least 24px. Forced colours: `LinkText` on `Canvas` and a `Highlight` ring.
- **Visually hidden text** (`kv-visually-hidden`) is the clip rule for text only a screen reader gets. Never put anything focusable in it.

### Navigation

#### Navigation and table of contents

Navigation (`Navigation.Root`) and `TableOfContents` share one item look.

| Part               | Look                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `nav-item`         | `text` at weight 400, no fill, underline on hover. Control height, `--kv-control-min-block-size`                               |
| `nav-item-current` | Solid `primary` fill, `on-primary` label, weight 600: a shape at 3:1 against the surface, plus `aria-current`                  |
| `nav-item-trail`   | Every ancestor of the current item: `primary-subtle` and weight 600, so it differs from the others in weight, not colour alone |
| Forced colours     | The fills drop. The current item gets a straight `LinkText` bar and the trail keeps its weight                                 |

- **`aria-current`.** Exactly one link per navigation has it: `page` when the page is listed, otherwise `true` on the deepest item shown. Never on an ancestor of a listed page or on a link inside a `hidden` group. The theme finds the trail with `:has()`, so it needs no prop.
- **Nesting.** A nested list is indented one step (`--kv-space-4`), two levels at most on resident pages. A collapsed group is rendered with `hidden`, never unmounted.
- **Horizontal** (`kv-navigation--horizontal`): the top level is a row that wraps, items sized to their labels, `--kv-space-3` on each side, `--kv-space-2` apart, with the same heights, fills and weights, and one level per bar. A second level is a second, separately named navigation, never a second row.
- **Group label** (`kv-navigation-label`, a `Navigation.Label` in an item, naming its nested list). It is text, not a link or a heading, so it is the opposite of an item: no fill, no underline, no hover and no focus. `label-compact` type in `text-muted` at every density, `--kv-space-2` above and below, its text lined up with the links' text, and `--kv-space-4` above it from the second item on. `text-muted` on `surface` is measured already, so there is no new token or pair. Forced colours: `CanvasText`.

  > **Maintainer review (Plan 0061).** The group label's look (compact type at every density, the text-aligned inset, the `space-4` gap between groups) follows docs-site.md section 6 and is new text here. Remove this note when approved.

- **`TableOfContents`** lists the headings of a long page as plain `#id` links in a named `<nav>`, with `aria-current="location"` on the heading being read. Nothing is current until the reader passes the first heading. It is never sticky, never smooth-scrolls and never moves focus: where it sits is the page's layout. Its title is a real heading the consumer renders, in `text` and never muted (the `heading-4` look beside an article), and names the `<nav>` with `aria-labelledby`. Levels indent `--kv-space-4`. Resident pages list `h2` and `h3`, and `h4` at most.

#### Tabs

`kv-tabs` shows one panel at a time with a list of tabs to switch between. Tabs change content on the same page: links to other pages are a navigation.

- **Tab:** `text` at weight 400, no fill, underline on hover, at the control height (`--kv-control-min-block-size`), `--kv-space-4` on each side.
- **Selected tab:** weight 600 and a straight `primary` indicator bar at its block-end edge (inline-end when vertical), drawn as a pseudo-element, never a border on a rounded box. It is never a solid fill, because a solid `primary` fill already means a pressed toggle or the active option of a listbox, and it never rests on colour alone.
- **List:** a `border-subtle` hairline runs along it. It wraps and never scrolls (1.4.10), and each row's selected tab keeps its own bar at its own edge.
- **Disabled** (`aria-disabled`, still focusable): `text-muted`, no hover.
- **Focus:** a tab and the panel (`tabindex="0"`) each have the focus ring.
- **Vertical** (`data-orientation="vertical"`): a row of the list and the panel, stacking below `40rem`.
- **Forced colours:** the bar and the hairline are `CanvasText`, the text `ButtonText`, the ring `Highlight`.

#### Disclosure and Accordion

> **Maintainer review (Plan 0058):** this subsection and the class contract lines below are a proposal, from docs/design/docs-site-components.md section 5 (G3) and municipality-reference-site.md (B12). It reuses existing tokens only (no new token, no new colour pair). Remove this note when approved.

`kv-disclosure-trigger` is a button that shows and hides one panel. `kv-accordion` is a stack of them with headings, for a FAQ. A disclosure changes content on the same page: links to other pages are a navigation.

- **Trigger:** a quiet text button like a tab: `text` at weight 400, no fill, the 2px link underline on hover and press, at the control height (`--kv-control-min-block-size`), `--kv-space-2` on each side, `--kv-space-2` before the chevron.
- **The open look:** a decorative chevron at the inline end that points down while closed and up while open. The state is a shape, never colour alone, and `aria-expanded` carries it for assistive technology. The trigger's text never changes with the state. No fill and no rotation animation: nothing animates.
- **Panel:** in flow, `--kv-space-2` above and on each side. It has no `display` rule, so `hidden` wins.
- **Accordion:** a `border-subtle` hairline above the stack and one under each item. The trigger is the whole row at weight 600, text at the start and chevron at the end, and wraps (1.4.10). The heading around it has no look of its own. The hairlines are not the only cue: the heading and the chevron mark each row.
- **Focus:** the ring on the trigger.
- **Forced colours:** hairlines are `CanvasText`, the text `CanvasText` (`GrayText` when disabled), the chevron `currentColor`, the ring `Highlight`.

#### Breadcrumb and pagination

> **Maintainer review (Plan 0062):** this subsection and the class contract lines below are a proposal. It reuses existing tokens only (no new token, no new colour pair). Remove this note when approved.

`kv-breadcrumb` is where you are and the way up. `kv-pagination` moves through a long list. Both are a named `<nav>` around a list of real links (Link, so a registered router link is used).

- **Breadcrumb.** A row that wraps and never collapses into "…": a hidden level is a hidden way out. Items are `text` in the control type with `--kv-space-2` between; the separator is a chevron in `text-muted`, drawn as generated content with empty alternative text, so it is never read, and it mirrors in RTL. The links keep the `link` look and are at least 24px tall. The current page is the last item, plain text at weight 600 with `aria-current="page"`, never a link to itself.
- **Pagination.** Targets at the control height (`--kv-control-min-block-size`, 44px), `--kv-space-3` on each side and `--kv-space-2` apart, in a row that wraps. A page number is a navigation item (`text`, weight 400, underline on hover). The current page is the Navigation current look: a solid `primary` fill, `on-primary` number, weight 600, a shape and `aria-current="page"` and never colour alone. Previous and Next keep the link colour and underline, with a decorative arrow (mirrored in RTL). The gap is the text `…`.
- **Narrow.** Below `40rem` the page numbers and gaps are hidden and the row is Previous, the status text (`Sida 2 av 9`) and Next. From `40rem` the status is hidden.
- **Forced colours.** The fill drops: the current page keeps a straight `LinkText` bar under its number. Separators and text are `CanvasText`.

### Forms

#### Text inputs and fields

The order is fixed, in the theme, the stories and the docs: a visible **label**, an optional **description**, the **input**, an optional **help text**, the **error message**. The error comes last so the visual order is the spoken order. No placeholder-only labels. The input width reflects the expected answer (a postcode field is short).

| Part                         | What it is                                                                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label                        | `label` type (`label-compact` in compact). A field that isn't required ends with "(optional)" in weight 400, which is part of its name. Required fields carry no marker      |
| Description (`Field.Prose`)  | A `Prose` above the input, at `body` in `text`, for what to answer, why and where to find it. May hold paragraphs, lists and links                                           |
| Help text (`Field.HelpText`) | A short instruction, format example or limit under the input, at `body-small` in `text` (never `text-muted`), plain text with no links. Never changes with the field's state |
| Error message                | `label` type in `danger`, with the error icon and a visually hidden "Error:" prefix. Repeats the format when the format is the problem                                       |

- **One size per part, wherever it sits.** A Prose is `body` and a HelpText is `body-small`, in both densities. Anything the user must read before answering is a description above the control, never a help text. A help text goes under the control, never above it.
- **Wiring.** Parts: `Field.Root` with `Field.Label`, `Field.Prose`, the control (`TextInput`), `Field.HelpText` and `Field.ErrorMessage`, and `Fieldset.Root` with `Fieldset.Legend` and the same parts for a group. KvirnUI holds no form state: the form logic sets `invalid`, `required` and `disabled`, and writes the messages. A Prose or HelpText registers as a description (a field can have several), and `aria-describedby` lists them in DOM order, then the error.
- **On submit,** move focus to the error summary (or the first invalid field) and keep `scroll-padding` on the page, so the on-screen keyboard doesn't cover the message under the field.

**The input**

| State                | Look                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rest                 | Control height, a 1px `border-control` edge, `--kv-radius-md`, `--kv-control-padding-inline`, `body` text in both densities                         |
| Hover                | The edge darkens to `text`                                                                                                                          |
| Focus (any)          | A heavy `border-focus` edge (the padding gives the pixel back, so nothing moves). Keyboard focus adds the ring                                      |
| Invalid              | A heavy `danger` edge with 1px less padding, so the text doesn't move, plus the error message: never colour alone. Keeps its `danger` edge in focus |
| Disabled / read-only | A dashed edge on `surface` with `text-muted` text / a solid edge on `surface`                                                                       |

The theme draws these from `data-invalid`, `aria-invalid="true"`, `:disabled` and `[readonly]`, never from `:invalid`.

**Width and format**

- `kv-input--width-2`, `-4`, `-6`, `-10` and `-20` count characters (a day or a number of children, a year, a postcode, a registration number, a phone number or a personal identity number). They include the 1.4.12 letter-spacing allowance and the 2px invalid edge. Without one, the input is full width.
- `kv-input--numeric` gives tabular figures. Numbers are text with `inputMode`, never `type="number"`.
- `kv-field-label--heading` and `kv-fieldset-legend--heading` make the label or legend the page's `h1` in `heading-1`, for one question per page.

#### Input group

`InputGroup.Root` (`kv-input-group`) is the box: the input's edge, fill, radius and states, and the focus ring around the whole group when its input has keyboard focus. The input inside has no edge or ring of its own. Width classes stay on the input, and the group fits around it.

- `InputGroup.Addon` holds a short unit or symbol ("kr", "%", "km", at most 4 characters) or a decorative icon, in `body` and `text`, with no fill or separator. Addons are hidden from screen readers, so the label always names the unit ("Månadshyra i kronor"). An addon before the input sits at the start, on the right in right-to-left.
- A button in a group (clear, show password) is a flat segment with a 1px `border-control` divider, as tall as the box, with `primary-subtle` on hover and its own focus ring.

#### Date input

Three boxes in a `Fieldset.Root group`: the legend asks the question and holds the help text, `DateInput.Root` (`kv-date-input`) is a row that wraps with `--kv-space-4` between the boxes (`--kv-space-3` in compact), then the one error.

- Each box is a field (`-day`, `-month`, `-year`) with its label above it in weight 400 at the control font size, so the legend reads as the question and Day, Month, Year as its parts.
- The boxes are `kv-input` with tabular figures, 2, 2 and 4 characters wide, in the order of the locale, with no separators drawn.
- Only the wrong box takes the heavy `danger` edge.

#### One-time code

One native input. The theme draws the code over it as a row of boxes, one per character of its pattern, with a drawn dash wherever the pattern has a `-`.

- **Boxes:** squares at the control height that narrow on a small screen, `--kv-space-2` apart (`--kv-space-1` in compact), `md` radius, 1px `border-control` edge, `numeric` figures. A dash is a narrow cell with no edge or fill, in `text`.
- **Interaction:** boxes and dashes are hidden from assistive technology and can't be pressed: every press goes to the input. On keyboard focus the ring goes around the whole row. A click shows only the active box's edge.
- **Active box:** where the next character goes, a heavy `focus-ring` edge and a static caret. Selected characters get a `primary-subtle` fill with the same edge.
- **Invalid:** a heavy `danger` edge on every box plus the error message under the row. Complete has no look of its own.
- **Direction:** the row reads left to right in every direction.
- **Limits:** 4 to 10 characters in up to 3 groups (two dashes). In forced colours, when the row doesn't fit at the narrow box width, outside those limits, or before the script runs, it shows a plain input as wide as the pattern, with the same value (dashes included) and focus.

#### Checkboxes and radios

At least 24px, with the whole label clickable, grouped in a `fieldset` with a `legend` question. An option's help text is a `Field.HelpText` in the option's Field: `body-small`, lined up with the label's text and directly under the label's box, outside the target. A group's error goes under the options and any group help text. A single checkbox's goes under its label and help text.

#### Error summary

An `Alert.Danger` at the top of `main` with the heading "Det finns ett problem" and a list of links to each invalid field, worded like the field errors. It receives focus on submit and isn't announced.

> **Maintainer review (Plan 0063).** The looks below are a proposal and reuse existing tokens only (no new token, no new colour pair). Remove this note when approved.
>
> `ErrorSummary.Root` is the Alert's danger look plus `kv-error-summary`: the `danger-subtle` fill, the `danger` bar, the icon and the status word. Its list (`kv-error-summary-list`) has no markers and `space-1` between items. Each link (`kv-error-summary-link`) is in the `text` colour, weight 600, always underlined: the link colour is not a measured pair on `danger-subtle`, and the underline carries the link without colour. It wraps anywhere and is 24px tall at least. The focused summary shows the token ring under `:focus-visible` (the `tabindex="-1"` rule). In forced colours the links are `LinkText`. Not announced: focus is the announcement.

#### Calendar and date picker

Spec: [date-picker-and-calendar](docs/design/date-picker-and-calendar.md), approved 2026-10-06. A month as a `table role="grid"`, an add-on to typed entry and never the only way to give a date. The heading is `heading-4` between two quiet icon buttons (control size, `md` radius, chevrons mirrored in RTL); below 40rem it takes its own row. Days of other months are empty.

- **Day cell:** the control size square (44px, 32px compact), `md` radius, a 4px grid spacing equal to the focus ring's width plus offset so a ring never covers a neighbour. **Below 40rem it is 40px (36px with week numbers):** a recorded exception to the 44px comfortable target (D10), because seven 44px cells and their gaps are 332px, more than a 320px screen holds. 2.5.8 is met; 2.5.5 (AAA) is not at 320px.
- **States, never colour alone:** selected is a `primary` fill, `on-primary` text and weight 600; today is a 1px inset `border-control` edge and weight 600; unavailable and outside the range are `text-muted` with a strike-through; hover is `primary-subtle`; focus is the 2px ring. Forced colours (edges are borders, since a shadow is dropped): selected `Highlight` plus a 2px `CanvasText` edge, today a 1px `CanvasText` edge, hover a 1px `Highlight` edge, unavailable `GrayText`.
- **Week numbers** are `body-small` in `text-muted`, only with a Monday start. No new token and no new colour pair.
- **Range mode (Plan 0087, [date-range](docs/design/date-range.md)):** start and end are the selected look, their corners that face the band squared; days between are a `primary-subtle` band with 1px `primary` edges at block-start and block-end (borders, never a shadow, so forced colours keeps them), bridging the 4px gap but never a row or an empty cell; the preview of a pending end is the same band with dashed edges, the candidate end a dashed edge all round; an impossible end (`selects="end"`) is unavailable. The band alone (about 1.1:1) is never the cue: `aria-selected`, the names and the edges are. Two months sit side by side from 64rem (`space-8` apart), one below. No new token and no new colour pair.
- **Date picker (Plan 0084):** a modal Dialog (`kv-date-picker-popup`) around the Calendar, opened by a `kv-button` with the `calendar` icon and "Choose date" (`kv-date-picker-trigger`) that is the last item in the `kv-date-input` row, at the block end, wrapping below the boxes at 320px. The popup is `fit-content` wide from 40rem and the Dialog's sheet below it, with `space-2` inline padding so the 40px cells fit. Selecting closes the dialog at once. No new token and no new colour pair.
- **Date range picker (Plan 0089):** one `kv-button` with the `calendar` icon and "Choose dates" (`kv-date-range-picker-trigger`) after both fields, in a wrapping row (`kv-date-range-row`, `space-4` gap, items at the block end): side by side from 40rem, stacked below it with the trigger last, and with a group per end (three boxes) stacked below 64rem. The modal Dialog (`kv-date-range-picker-popup`) is `fit-content` wide from 40rem, so two months fit side by side from 64rem (the Calendar decides), and the Dialog's sheet with `space-2` inline padding below 40rem. Choosing the end closes it at once. No new token and no new colour pair.

#### File upload

- **Drop zone:** a 1px dashed `border-control` edge at rest, a heavy solid `primary` edge with a `primary-subtle` fill while a file is dragged over it, a heavy solid `danger` edge when invalid. It is the one dashed edge that doesn't mean disabled: it's a target, not a control, and the button inside carries the disabled look. The box is drawn only where a file can be dropped (a precise pointer, or while a file is dragged over the page).
- **Each file** is a row with an inline-start indicator bar that is `danger` only when the upload failed, a name that wraps anywhere, a type and size line in `text-muted`, a status in words (with an icon only for uploaded and cancelled), and a native `<progress>` that is a static hatch when the size is unknown, never animated.
- **Forced colours:** the zone's edge is `CanvasText` at rest, a solid heavy `Highlight` edge while dragged over, and a heavy `CanvasText` edge when invalid.

### Content and status

#### Alerts

Status messages in the content: `Alert.Info`, `.Success`, `.Warning`, `.Danger`. Each renders its status class, its icon (square, circle, triangle, octagon) and a status word at the start of the title (visually hidden, from i18n), so colour, icon and word always agree. Never colour alone.

- **Look:** only CSS on the status class (`kv-alert--info|success|warning|danger`): the `-subtle` background and an inline-start indicator bar in the status colour, through `--kv-alert-background` and `--kv-alert-accent`. The `sm` radius, padding from `--kv-alert-padding-block` and `-inline` (tighter below `40rem` and in compact from `64rem`), a sans title at `--kv-alert-title-size` and weight 600, no shadow.
- **Title:** a heading at the consumer's level, or a `<p>` for one sentence.
- **`Alert.Root`** is the plain base with no status, for your own design: you bring the icon and the word.
- **Dismissing** is optional (maintainer, 2026-10-05, Plan 0045): `Alert.Close` is a quiet icon button (`kv-alert-close`, the `close` icon, at the control size) at the inline end of the first line. The consumer removes the alert and moves focus on.
- **Announced** only with `announce`, through the Announcer.

#### Cards

Elevation level 2: `surface-raised`, a `border-subtle` edge, the `lg` radius, no shadow. A card is a plain container and is never interactive: no hover, shadow or pointer style, because those suggest the whole card is clickable. It is always `surface-raised`: a region of the page is a Section.

- **Choices on the Root:** the radius (`lg` by default, `kv-card--radius-md` for a card nested in a card, `kv-card--radius-none` for a card flush with an edge) and `kv-card--dividers` (a `border-subtle` line between parts).
- **Padding** goes on the Root for every part (`kv-card--padding-none`, `-sm`, `-lg`) or on one part (`kv-card-header--padding-none`, and likewise body and footer, in all four steps). `md` is the default and steps down below `40rem` and in compact from `64rem`. The sizes are `--kv-card-padding-sm|md|lg`, and `none` is for full-bleed media. Use `none` on a part only, so the other parts' edges line up.
- **Parts** are direct children of the Root. A Root without parts pads itself, and adjacent parts share one padding.
- **Site defaults:** `--kv-card-padding-default` and `--kv-card-radius-default`. `kv-card--padding-md` or `kv-card--radius-lg` takes one card back to the theme's step. A default set on `:root` as `var(--kv-card-padding-lg)` is resolved there, so it doesn't step down inside a `kv-compact` container: set it on `.kv-card` or on the container instead.
- **Overflow:** never hidden, so focus rings are never clipped. Media that touch a rounded corner get its inner radius.
- **Footer actions** use `kv-button-group` on the footer: start-aligned, primary first, one primary per view. A card's one link goes in its heading. Navigation is a Link.
- **Never** use `primary-subtle` or a status `-subtle` background as a card surface: status belongs in an Alert, with an icon and a status word.
- **Border:** every card keeps it, so its edge survives forced colours. On resident pages nest one level at most, with `md` for the inner card. A card on a section keeps its default look.

#### Summary list

> **Maintainer review (Plan 0063).** This subsection is new text and a proposal. It reuses existing tokens only (no new token, no new colour pair). Remove this note when approved.

A native `<dl>` of rows for the answers on a check-your-answers page, a contact card, a case card. Read-only: the value is text, the action a link.

- **Rows:** a 1px `border-subtle` line under every row and above the first, `space-3` block padding, no fill and no zebra. The text is `body` in `text`; the key is weight 600.
- **From `40rem`** a row has three columns: the key, the value (twice as wide) and the actions at the inline end. A row with no actions gives the value the last column too. The column gap is `space-6`.
- **Below `40rem` and at 320px** a row stacks: key, value, then the actions at the start. A long word wraps anywhere and a value is never truncated.
- **Change link:** a plain `kv-link` with the word "Ändra" visible; its name adds the key ("Ändra Namn"). 24px tall at least. Several actions are `space-4` apart.
- **Prose** leaves the list alone. In forced colours the row lines are `CanvasText`.

#### Sections

Elevation level 1: a region of the page, such as a sidebar or a band of content. A section is a plain container, never interactive, and renders a `<div>`: a landmark is the consumer's choice (`<aside>`, `<section>`, `<nav>`) and must be named.

- **Choices on the Root:** the surface (`surface` by default, or `kv-section--canvas` for a region that looks like the page again inside a `surface` one) and the padding (`kv-section--padding-none|sm|md|lg`: `md` is the default and steps down below `40rem` and in compact from `64rem`; the sizes are `--kv-section-padding-sm|md|lg`; `none` is for a frame whose children pad themselves and for full-bleed media).
- **Square, no shadow, no overflow,** so focus rings are never clipped. The 1px border is `transparent` so the background paints under it, and `CanvasText` in forced colours. No hairline by default: a region doesn't look like an object.
- **Not a prose boundary:** a section in prose gets prose's block margins on its own element, and its content stays prose. Put `kv-prose` on a sidebar section, and inside a full-width band.

Section and Card sit on elevation levels 1 and 2 (Storybook: Foundation / Borders and elevation).

#### Prose

`kv-prose` goes on the element around content you don't control, such as an article from a CMS or Markdown. It uses `body`, and `kv-prose kv-prose--large` uses `body-large` for long resident-facing text. There is no smaller size for resident text. `kv-lead` marks the lead paragraph.

- **Boundary.** Prose never styles a component part (an explicit list in `theme.css`: `kv-button`, `kv-link`, `kv-link-new-tab-notice`, `kv-link-icon`, the card parts) or anything inside `kv-not-prose`, `kv-navigation`, `kv-table-of-contents`, `kv-button-group`, a card, an alert, a field or a fieldset. Its rules have zero specificity, so any other CSS wins. A card, alert, field or fieldset in prose gets prose's block margins only. `kv-prose` on a card or an alert, or inside one, turns prose on again.
- **Semantics survive.** It keeps list markers and table display. Code blocks wrap instead of scrolling, and wide tables go in a `kv-scroll-region` with a name, focusable only while it overflows.
- **Inset and steps** (Plan 0076, `docs/design/prose-content-types.md`; classes only, no new token or colour pair). `kv-inset` sets content apart: a `surface` fill, a 4px `border-control` bar at the inline start (a 1px edge on the other sides, drawn in forced colours, where the bar is `CanvasText`), `radius-sm`, `space-4` padding. It has no role, icon or announcement; start it with a word such as "Viktigt:" or a stating heading, because the bar alone reads as a quote. **Inset or Alert:** content that is part of the article and must not be missed is an inset; a legal or money consequence or a lost-rights deadline is `Alert.Warning`; the state of something is an Alert; a quotation is a `blockquote`. `kv-steps` goes on an `ol` only: the native `::marker` is large (`heading-3` size), bold, tabular, in `heading`, and steps are `space-6` apart. It never uses `list-style: none`, so the list keeps its role in WebKit. **Steps or Stepper:** `kv-steps` describes a whole process in the content; the step indicator shows the current step on a form page. Neither is a prose boundary, and a figure gets no class (`alt` and `figcaption` guidance in the Prose contract). Video and audio are native elements with captions, never an embed. Print is not styled yet (Plan 0076, open decision).
- **Headings.** Stop at `h3` in resident-facing text. `h4` to `h6` keep their own roles in every prose size, so in the large sizes they are smaller than the body text.

#### Tables

`numeric` for figures, `surface` for the header row, `border-subtle` row dividers, no zebra stripes or frame unless you opt in (`kv-table--striped`, `kv-table--card`). Sortable headers are buttons with a visible sort indicator.

#### Badges and tags

For status or metadata, never for interactive elements.

> **Maintainer review (Plan 0059).** `kv-badge` is a static `<span>` pill: `body-small` text, `radius-full`, padding `space-1` by `space-2`, a 1px edge, no depth, no hover and no focus style. Choices by role: neutral (the bare class; `text` on `surface`, a `border-control` edge), `primary` (`link` on `primary-subtle`), `info` (`text` on `primary-subtle`), `success`, `warning` and `danger` (`text` on their `-subtle`). The words always carry the status and the colour only adds to them. It never wraps. Forced colours: a `CanvasText` edge. No new token or pair.

> **Maintainer review (Plan 0075).** `kv-tag` is the chip for a short fact, such as an applied filter (`docs/design/tag-and-filters.md`). A static tag is `body` text in `text` on `surface`, a 1px `border-subtle` hairline (decorative, so allowed), the `sm` radius, padding `space-1` by `space-3`, with no cross, no hover and no focus. A removable tag is one button, `kv-tag-remove`, the whole chip: flat (no depth, so Clear all stays the one button that looks like an action), a `border-control` edge, the same radius and type, `--kv-control-min-block-size` high (44px, 32px compact) and wide, and a 0.875rem cross at the inline end drawn with 2px `currentColor` borders so forced colours keep it. Hover is a `primary-subtle` fill with a `primary` edge, focus the 2px `focus-ring`. Text wraps and hyphenates and is never truncated. Forced colours: `ButtonText` edge and text, `Highlight` on hover; a static tag has a `CanvasText` edge. `kv-tag-group` is a wrapping row of label, list, empty text and a Clear all `kv-button`. Badge stays static and is never put in a tag group. No new token or pair.

#### Code block and copy button

> **Maintainer review (Plan 0060).** This subsection is new text. `kv-code-block` is a wrapping row: a `kv-code-block-label` (`body-small`, label weight, `text`) and the code take a full row each, then the copy button and its status share the last row. The code (`kv-code-block-code`) is the prose `pre`: `text` on `surface`, a 1px `border-subtle` edge, the `md` radius, `space-4` padding, the mono family at the code size. It wraps and never scrolls, is never hyphenated, and is never highlighted: no colour carries meaning. The copy button is a plain `kv-button`; its name stays "Copy" (2.5.3) and the result is announced and drawn. The status is a new class, `kv-copy-status` (`docs/design/copy-button.md`): a `span` after the button (also after a standalone CopyButton), 16px `body` in `text`, with a decorative `check` or `warning` icon in `text` colour (never tinted: colour is not the cue) and the words `copyButton.copied` or `copyButton.failed`. `copied` clears after 5 seconds or on the next press; `failed` stays until the next press. It wraps below the button at 320px, has no motion, and uses logical properties; the icons don't mirror. Forced colours: a `CanvasText` edge on the code, `CanvasText` on the status. No new token or pair.

#### Progress and empty state

> **Maintainer review (Plan 0074).** `kv-progress` is plain text first: a `body` label in `text` (never `text-muted`) that wraps and is never truncated, with the percent after it when the value is known, and a slow sentence added after ten seconds. Plan 0080 supersedes the first release's "no spinner" and "nothing moves" rules (`docs/design/loading-indicators.md`): an unknown wait gets `kv-spinner` (a masked ring in `primary`, 1.25em, `currentColor` in a button, the alert accent in a toast) beside the label, and an unknown size gets `kv-progress-track`, a decorative span; both are `aria-hidden`, never a `<progress>` without a value. `kv-progress-bar` is the file-upload bar made general: a native `<progress>`, 8px high, a `border-control` edge on a `surface` track, a `primary` to `accent` gradient value with a sheen of at most 20 % `on-primary`, the `sm` radius, rendered only with a known value; it eases only under `no-preference`. The indicators loop under `no-preference` only, and show their rest shape otherwise; the app owns the 2.2.2 stop control. It sits on `canvas`, `surface` or `surface-raised`, never inside an alert's `-subtle` fill. Forced colours: `CanvasText` text and edge, `Canvas` track, `Highlight` value. `kv-empty-state` is a start-aligned block with `space-6` block padding, no border, no fill and no illustration, never centred; its title is the consumer's heading in the `heading` colour, its body is `body` text in `text` at the prose measure, and its actions are an ordinary `kv-button-group` with at most one primary. A busy button keeps its look and depth and the `progress` cursor, and shows a `kv-spinner` at its inline start after 1000 ms. New: the `accent` colour (four themes, measured on the same backgrounds as `primary`) and `--kv-duration-loop` (`docs/design/status-patterns.md`, `docs/design/loading-indicators.md`).

### Overlays

- **Popups** (menus, listboxes, popovers): level 3 elevation, `xl` radius, `--kv-space-2` padding, items at least the control height.
- **Tooltips:** level 3 with the `md` radius, `body` text and `--kv-space-1` by `--kv-space-2` padding (a one-line box with the `xl` radius reads as a pill; decided 2026-10-04). They hold text and keys only, never essential information.

#### Stepper

Where the user is in a multi-page form, as one line of text: "Step 2 of 5: Your vehicle" (`docs/design/stepper.md`, Plan 0083). `kv-stepper` is `body` text in `text` with no margin, so the layout owns the rhythm; it sits directly under the page heading as its own element, never inside the heading, a label or a legend. It wraps and hyphenates and is never truncated. No dots, bar, segments, border or fill: the words carry it (1.4.1). It is a position, not navigation: no list, no links, no live region. Forced colours: plain `CanvasText`. No new token or colour pair.

### Patterns

- **Command menus and shortcuts** are welcome in staff tools, but every shortcut has a visible menu or button equivalent and single-character shortcuts can be turned off (2.1.4).

### Design spec index

Each component's design spec, in `docs/design/`. The accessibility contract is in `packages/react/src/<name>/<name>.a11y.md`.

| Component or topic                 | Spec                                                                  |
| ---------------------------------- | --------------------------------------------------------------------- |
| Button and Link                    | `default-theme-button-link.md`, `button-depth.md`                     |
| Navigation, table of contents      | `navigation.md`, `navigation-link-options.md`, `table-of-contents.md` |
| Tabs                               | `tabs.md`                                                             |
| Form fields, date input, help text | `form-fields.md`, `field-help-text.md`                                |
| One-time code, file upload         | `one-time-code.md`, `file-upload.md`                                  |
| Combobox, table                    | `combobox.md`, `table.md`                                             |
| Prose, Card, Section, Alert        | `foundations-and-prose.md`, `card.md`, `section.md`, `alert.md`       |
| Tooltip, Kbd, Icon                 | `tooltip.md`, `kbd.md`, `icon.md`                                     |
| Rich text editor                   | `rich-text-editor.md`                                                 |
| Progress, busy, empty state        | `status-patterns.md`                                                  |
| Typography                         | `typography-ibm-plex.md`                                              |
| Docs site, Storybook               | `docs-site.md`, `storybook-presentation.md`                           |

## Theming

### How it works

- **Two files, opt-in by import.** `import '@kvirn-ui/theme/reset.css'` then `import '@kvirn-ui/theme/theme.css'`. The reset is Tailwind's Preflight in plain CSS (lists keep their markers, an Icon stays inline): it is the baseline the theme is designed on, and Storybook and the docs run on both files. Skip the reset only if you already run Tailwind v4. The theme styles every component on the page, and removing it unstyles them. Nothing loads CSS for you, and `KvirnProvider` never does. See [reset-baseline](docs/design/reset-baseline.md).
- **Part classes select components, `data-*` is state.** Each part renders its own class and the consumer's `className` joins it. Choices are classes the consumer adds.
- **Override variables, not selectors.** Rebrand by overriding a role scale on `:root` (`--kv-primary-50` … `--kv-primary-950`), or set a single semantic token (`:root { --kv-color-link: var(--kv-primary-700) }`). Scales go on `:root`, where the semantic tokens are declared. To change one theme only, target the same selectors `theme.css` uses (`:root[data-kv-color-scheme='dark']`).
- **Your CSS always wins.** Everything in `theme.css` is in `@layer kv`, so any unlayered CSS, or any layer declared after `kv`, overrides it regardless of specificity.
- **Own it, or skip it.** Copy `theme.css` into your project and import your copy, or skip it and style the `kv-*` classes and `data-*` attributes with Tailwind or your own CSS.
- After any colour change, run `vp run theme:check`, or `checkThemeCss()` from `@kvirn-ui/theme` on your own file.

### Rebranding for a municipality

- **Give `--kv-primary-*` the brand's eleven steps,** and every semantic token and all four themes follow. Each theme uses different steps (light 500 and 600, dark 500 and 400, the contrast themes 800 and 200), so swapping a scale can break contrast. Check a customised copy with `checkThemeCss()` or `vp run theme:check`, or on the live Foundation/Theming page. If the coat-of-arms colour fails, use it in the header band or the logo and build the scale from a darker or lighter shade of it.
- **Give `--kv-secondary-*` a hue** to colour the secondary button's edge. `--kv-accent-*` is free for a brand's second colour.
- **Point one semantic token at another step** (`--kv-color-link: var(--kv-primary-700)`) for a single change.
- **Override `danger` and `danger-hover` together,** if at all. Never reuse a brand red for `danger` or a brand green for `success`: users will read the brand colour as a status.
- **Button depth follows the scales.** The tinted edges mix the current edge or fill with `--kv-button-edge-shade` or `--kv-button-edge-highlight`, so they change with a rebrand, and `checkThemeCss()` measures them (56 per theme). For flat buttons set `--kv-shadow-button` and `--kv-shadow-button-hover` to `none` and both edge tokens to `0%` (`var(--kv-neutral-950) 0%`, `var(--kv-white) 0%`).

### Site-wide defaults

Custom properties, set once, on `:root` or any container. `theme.css` leaves the font, card and button ones unset: it reads each where it's used, with its own value as the fallback (`var(--kv-font-family-body, var(--kv-font-family-sans))`). The alert spacing ones it does declare on `:root`, so override those there.

| Property                                                                                      | Sets                            |
| --------------------------------------------------------------------------------------------- | ------------------------------- |
| `--kv-font-family-body`, `--kv-font-family-heading`                                           | The two font families           |
| `--kv-card-padding-default`, `--kv-card-radius-default`                                       | Every card's padding and radius |
| `--kv-button-min-block-size`, `-padding-inline`, `-font-size`, `-font-weight`, `-line-height` | Every button's size             |
| `--kv-alert-padding-block`, `--kv-alert-padding-inline`, `--kv-alert-gap`                     | Every alert's spacing           |
| `class="kv-compact"` on `<html>`                                                              | Compact density everywhere      |

A value that refers to another token (`var(--kv-card-padding-lg)`) is resolved where it's declared, so put those on the element that should resolve them. `--kv-color-heading` is a semantic token like the rest, set per theme.

### Class contract

Parts render these classes, choices are classes the consumer adds, and state is `data-*` or ARIA.

- **Button:** `kv-button`. Choices `kv-button--primary`, `--danger`, `--icon-only`, and `kv-button-group`. State `[data-disabled]`.
- **Link:** `kv-link`, `kv-link-new-tab-notice`, `kv-link-icon`. Choice `kv-link--service`.
- **Navigation:** `kv-navigation`, `-list`, `-item`, `-label`, with `kv-link` on its links. Choice `kv-navigation--horizontal`. State `aria-current`.
- **Table of contents:** `kv-table-of-contents`, `-list`, `-item`, with `kv-link` on its links. State `aria-current`.
- **Tabs:** `kv-tabs`, `-list`, `-tab`, `-panel`. State `aria-selected`, `aria-disabled`, `data-orientation`.
- **Disclosure:** `kv-disclosure-trigger`, `-panel`, `-icon`. State `aria-expanded`, `data-open`, `data-disabled`.
- **Accordion:** `kv-accordion`, `-item`, `-heading`, `-trigger`, `-panel`, with the disclosure classes on the trigger and the panel. State `aria-expanded`, `data-open`, `data-disabled`.
- **Breadcrumb:** `kv-breadcrumb`, `-list`, `-item`, `-link`, `-current`, with `kv-link` on its links. State `aria-current` on the current page.
- **Pagination:** `kv-pagination`, `-list`, `-item`, `-link`, `-previous`, `-next`, `-ellipsis`, `-status`, with `kv-link` on its links. State `aria-current`.
- **Stepper:** `kv-stepper`. No state.
- **Summary list:** `kv-summary-list`, `-row`, `-key`, `-value`, `-actions`, and `kv-link kv-summary-list-change`. No state.
- **Error summary:** `kv-error-summary` (with `kv-alert kv-alert--danger`), `-list`, `-item`, and `kv-link kv-error-summary-link`. No state.
- **Prose:** choices `kv-prose`, `kv-prose--large`, `kv-lead`, `kv-not-prose`, `kv-scroll-region`, `kv-inset`, `kv-steps`.
- **Card:** `kv-card`, `kv-card-header`, `-body`, `-footer`. Choices `kv-card--radius-lg|md|none`, `kv-card--padding-none|sm|md|lg`, `kv-card-header--padding-*` (and body, footer) and `kv-card--dividers`.
- **Section:** `kv-section`. Choices `kv-section--surface|canvas` and `kv-section--padding-none|sm|md|lg`.
- **Alert:** `kv-alert`, `-icon`, `-title`, `-status`, `-body`, `-actions`, `-close`. Choices are the status classes `kv-alert--info|success|warning|danger`, which `Alert.Info`, `.Success`, `.Warning` and `.Danger` render themselves (`Alert.Root` renders `kv-alert` only).
- **Field and fieldset:** `kv-field`, `-label`, `-optional`, `-help-text`, `-error-message`, `-error-prefix`, `kv-fieldset`, `-legend`. Choices `kv-field-label--heading`, `kv-fieldset-legend--heading`. State `data-invalid` or `aria-invalid="true"`.
- **Input:** `kv-input`. Choices `kv-input--width-2|4|6|10|20`, `kv-input--numeric`. State `data-invalid`, `aria-invalid="true"`.
- **Input group:** `kv-input-group`, `kv-input-group-addon`. State `data-disabled`, `data-focus-visible`.
- **Date input:** `kv-date-input`, `-day`, `-month`, `-year`.
- **One-time code:** `kv-one-time-code`, `-input`, `-slot`, `-separator`. Root state `data-ready`, `-complete`, `-invalid`, `-disabled`, `-character-count`, `-separator-count`. Slot state `data-filled`, `-active`, `-caret`, `-selected`, `-invalid`. A separator has none.

- The description is a `kv-prose` that is a direct child of `kv-field` or `kv-fieldset`, in `body` and `text` wherever it sits.
- The help text (`Field.HelpText`, `Fieldset.HelpText`) takes `data-invalid` and `data-disabled`, which the theme doesn't style.
- The other classes `theme.css` styles (tables, listbox, combobox, toolbar, kbd, checkbox, radio, file upload, tooltip, heading) follow the same rules: part classes, `--` choices, `data-*` state. Read them in `theme.css`.

## Content & Voice

Content is design. Most failures in public services are unclear words, not unclear pixels.

- Write in plain language (_klarspråk_ in Sweden and Norway, _selkeä kieli_ in Finland): short sentences, common words, active voice, "you" and "we". Key services also need an easy-to-read version (_lättläst_, _selkokieli_).
- Lead with what the user needs to do and by when. Put the exception at the end.
- Headings and buttons describe the task: "Apply for parking permit", not "Parking permit form".
- Errors say what went wrong and how to fix it: "Enter a date in the format 31.12.2026", not "Invalid input".
- Every visible or announced string comes from `@kvirn-ui/i18n` in all six locales (AGENTS.md hard rule 4). Designs show the Swedish and Finnish strings side by side to catch length and wrapping issues.
- Dates, numbers and currency use `Intl` for the active locale (`31.12.2026` in fi, `2026-12-31` in sv).

## Do's and Don'ts

**Do**

- Use one accent colour, and let whitespace, weight and the surface ladder create the hierarchy.
- Put one thing on each page for residents, and make the next step obvious.
- Pair every status colour with words and, where useful, an icon.
- Keep 44px targets for resident-facing controls and every primary action.
- Test every design at 320px, at 200% text size, in dark and contrast themes and in forced colours before calling it done.
- Show real content in real languages in mock-ups, including the longest Finnish string.

**Don't**

- Use `text-muted` for anything the user must read to complete the task.
- Use `border-subtle` (the hairline) as the only edge of a control.
- Use a status `-subtle` background (`danger`, `success`, `warning`) for anything but an alert, or any `-subtle` as a card surface.
- Put `role="alert"` on an alert: it is announced through the Announcer (`announce`).
- Put a status class on a plain `Alert.Root`: use the ready-made root, which brings the icon and the word.
- Lighten a filled button on hover behind white text.
- Remove focus outlines, or rely on a glow, a shadow or a background change to show focus.
- Give button depth (a shadow or a tinted edge) to anything that isn't a button: cards, inputs, badges, navigation items or links.
- Use low-contrast "ghost" text, grey-on-grey placeholders or disabled-looking active controls, even though they look elegant.
- Add gradients, glows or glass effects behind text. Decorative effects are allowed only on marketing surfaces of the docs site, and never reduce text contrast.
- Put essential information in tooltips, hover states or images of text.
- Use all caps, justified text, italic paragraphs, or text smaller than 16px for errors, descriptions or an instruction above a control. The help text (`body-small`) is the one 14px instruction, and it goes under the control.
- Load fonts, icons or images from third-party servers.
- Claim that a design "is compliant". Say "designed and tested to meet WCAG 2.2 AA".
