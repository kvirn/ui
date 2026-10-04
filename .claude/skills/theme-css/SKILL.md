---
name: theme-css
description: Engineering procedure for editing `packages/theme/theme.css` and `reset.css` - the single cascade layer, the two token tiers, the raw-colour rule, class naming, contrast pairs and `theme:check`, forced colours, the prose boundary and its not-prose list, hyphenation, and self-hosted fonts. Use when you change, add or review any theme CSS, a token, a `kv-*` class or a contrast pair. DESIGN.md owns the look and the token values; this skill owns how to change the CSS safely.
when_to_use: edit theme.css, add styles for a new component part, new kv- class, modifier class, new token, change a colour or contrast pair, theme:check fails, raw colour lint fails, forced colours, high contrast theme, prose or kv-not-prose, hyphens, long words, font, @font-face, reset.css, rebrand, theme override, copy theme.css
---

# Theme CSS

`packages/theme/theme.css` is one hand-written, readable file. It is the source of truth: no generator, no `tokens.css`, no `tailwind.css`. The headless packages ship no CSS. The theme styles them through the class each part renders and through `data-*` state.

- **What it looks like** (tokens, values, themes, type, depth): [DESIGN.md](../../../DESIGN.md), sections Colors, Typography, Layout, Elevation, Shapes, Components and Theming. Don't copy token tables here or into the CSS comments.
- **The class contract** (parts, modifiers, state): `docs/architecture.md`, Styling contract.
- **Behaviour and contrast rules**: the `accessibility` and `design` skills.

Load `accessibility` together with this skill when you change colour, focus, motion or target size.

## Files and layers

- `theme.css` is opt-in. `KvirnProvider` never loads CSS. The docs site and Storybook import `theme.css` the way an adopter does. Removing the import unstyles every component.
- `reset.css` (`@kvirn-ui/theme/reset.css`) is separate and optional. `theme.css` does not import it, and the theme works with or without it.
- Everything is inside a cascade layer, so unlayered consumer CSS always wins whatever its specificity.
  - `theme.css` uses `@layer kv`. `reset.css` uses `@layer kv-reset`.
  - Both files declare `@layer kv-reset, kv;` first, so import order never matters and the reset stays lowest.
  - A new rule goes inside `@layer kv`. Nothing sits outside it.
- `theme.css` is numbered sections (palette, themes, fallbacks, forced colours, density, then one section per component). Put new rules in the section of their component. Add a section only for a new component, and list it in the file header.

## Two token tiers

1. **Palette.** Role-named scales `neutral`, `primary`, `secondary`, `accent`, `danger`, `success`, `warning`, each `50` to `950`, plus `--kv-white` and `--kv-black`. They are named for their role, never their hue.
   - `secondary` steps point at `neutral` steps. `accent` is unused by the default theme, to keep one accent.
   - The first `:root` block is the palette. It holds nothing but palette steps. It is the only place raw colour values exist.
2. **Semantic.** `--kv-color-*` tokens point at palette steps, per theme. Components use only semantic tokens, never the palette.
   - The four themes (`light`, `dark`, `light-contrast`, `dark-contrast`) only remap semantic colour tokens (and the button edge tints and the two shadow tokens that depend on them).
   - Every non-colour token (space, radius, type roles, durations, prose, control size) is declared once on `:root` and is the same in every theme.

A new or changed token needs the maintainer's approval, with DESIGN.md updated in the same PR. Add a colour token only when no existing one fits. A new colour token means: the name in `colorTokenNames`, a value in all four themes, all four OS-fallback blocks and the forced-colours block, and its pairs in `contrast-requirements.ts`. Then run `theme:check`.

### Selecting a theme

- `data-kv-color-scheme` (`light`/`dark`) and `data-kv-contrast` (`standard`/`more`) on `<html>`, set by `KvirnProvider` and `KvirnThemeScript`. Each theme also sets `color-scheme`.
- Without the attributes (no JavaScript, no provider), `prefers-color-scheme` and `prefers-contrast` choose the theme. Each fallback block repeats its attribute theme exactly, and `theme:check` fails when they differ.
- Write theme selectors flat (`:root[data-kv-color-scheme='dark']`). The checker reads only selectors that start with `:root`.

### Rebranding and overrides

- Rebrand by redefining the eleven `--kv-primary-*` steps on `:root`, or by pointing one semantic token at another step, or by copying `theme.css`. All four themes follow.
- Scales can only be overridden on `:root`. A wrapper-level override does not reach the semantic tokens, because a custom property resolves where it is declared.
- A swapped scale can break contrast (white on `primary-500` fails with the accent scale). Always run `checkThemeCss()` on the result. Margins on some pairs are thin (about 4.7:1).
- Site-wide defaults an adopter sets (`--kv-font-family-body`, `--kv-font-family-heading`, `--kv-card-radius-default`, the `--kv-button-*` and `--kv-table-*` tokens) are read with the theme value as the fallback, so they work on `:root` or on any container. Keep that shape for a new default.
- `colorTokenNames` is public API. Changing it needs a changeset.

## The raw-colour rule

`theme.css` (outside the palette block), the docs site CSS and the Storybook CSS use only `var(--kv-*)`, system colours, `transparent` and `currentColor`. No hex, no `rgb()`, no named colours.

- `color-mix()` over `var(--kv-*)` is fine (the shadow and button edge tokens do it).
- A lint test (`tooling/raw-colours`) fails the run on any raw colour in `packages/theme/theme.css`, `apps/docs/**/*.css`, `apps/storybook/.storybook/*.css` and `apps/storybook/src/**/*.css`. The Storybook `preview.css` canvas colour is checked too.
- Why: an override of a token must reach everything, and `theme:check` must measure what users see.

## Class naming

- `kv-<part>`: a stable class on every part. Hooks put it in their part props `className`, so it is also there for a headless adopter. A consumer `className` joins it through `mergeProps` and never replaces it.
- `kv-<part>--<option>`: a choice the consumer adds (`kv-button--primary`, `kv-section--canvas`, `kv-input--width-6`, `kv-prose--large`). A modifier changes the look only, never the element.
- `kv-<name>`: a context the consumer sets on a container (`kv-compact`, `kv-nav`, `kv-button-group`, `kv-prose`, `kv-not-prose`, `kv-scroll-region`).
- `data-*` is state only (`data-disabled`, `data-invalid`, `data-focus-visible`, `data-current`, `data-open`, `data-active`, `data-selected`). The component sets it, the consumer never does.
- Part, modifier and state names are public API: renaming one is a breaking change that needs a changeset.
- One import styles everything. Never require a consumer to add a class or a prop for the default look. Choices (primary, danger, compact) are classes, never props.
- The base button is the secondary look. `kv-button--primary` is the one main action, `kv-button--danger` a destructive one.

## Rules every section follows

These rules are reviewed, not tested. Don't add tests that read `theme.css` for properties or values: `theme:check` (contrast, fallbacks, forced-colour mapping) is the only theme test, and the WCAG outcomes (target size, reflow, text spacing, forced colours) are measured in the browser (testing skill, "What we test, and what we never test").

- **Logical properties only** (`margin-inline`, `inset-inline-start`, `padding-block`), so right to left works. No `left`/`right` except where the content is always `ltr`.
- **Never clip, never fix a height.** No `overflow: hidden` that cuts text, no `height` or `max-height` on text containers, so text spacing overrides fit (1.4.12) and focus rings are never cut off (2.4.11).
- **Focus** is `outline` with the `focus-ring` token, offset by `--kv-focus-ring-offset`. Never remove an outline. A focused composite shows its ring on the box when the focus comes from the keyboard (2.4.7, 2.4.13). A click-focused text field shows the `border-focus` edge instead, which is not claimed against 2.4.13.
  - Text inputs (`kv-input`, `kv-one-time-code-input`, the Combobox and Autocomplete input, and their boxes) draw the ring on `[data-focus-visible]` or `:focus-visible:where(:not([data-focused]))`, because browsers match `:focus-visible` on a click in them. `:where()` keeps the specificity, so the input inside a box still has no ring. Any focus (`:focus`) turns the edge to 2px `border-focus` (the edge-width variable, so the padding gives the pixel back; 1px `Highlight` in forced colours, where 2px alone means invalid) and replaces the browser's ring with a transparent one, which forced colours paint (plan 0031). That holds on a standalone input. Inside a box (InputGroup, the Combobox and Autocomplete Control) the input has `outline: 0`, so a click shows only the 1px `Highlight` edge there (Plan 0031 follow-up a).
- **Motion.** Transitions run only inside `@media (prefers-reduced-motion: no-preference)`. Nothing animates a caret or position. Placement of popups is never animated.
- **Never style from `:invalid` or `:user-invalid`.** Invalid is drawn from `data-invalid` and `aria-invalid="true"`, because the consumer decides when a field is invalid.
- **Target size.** A control is at least 24px (2.5.8). Comfortable density is 44px, `kv-compact` is 32px from `64rem` and stays 44px below it.
- **Responsive steps** use rem media queries (`40rem`, `64rem`), never `vw`, so text-only zoom works.
- **Status is never colour alone** (1.4.1). Pair colour with an icon, text, shape or a bar.
- **A dashed edge means disabled.** The file upload drop zone is the one exception (it is a target, not a control).
- **Variants never change the element.** Only the class changes.
- **Depth is only for buttons.** Button depth is flat in the contrast themes and in forced colours. Turn it off by setting both `--kv-shadow-button*` tokens to `none` and both `--kv-button-edge-*` tints to `0%`.

## Contrast pairs and `theme:check`

`vp run theme:check` (and `checkThemeCss()` for adopters) reads the theme file for each of the four themes and checks:

- every `--kv-color-*` token is defined and resolves to a hex colour;
- each OS fallback equals its attribute theme (colours and button edge tints);
- every pair in `packages/theme/src/contrast-requirements.ts` meets its minimum: 4.5:1 for text, 3:1 for control edges, focus rings and indicators, 7:1 for text in both contrast themes;
- every tinted button edge keeps 3:1 on `canvas`, `surface` and `surface-raised`.

When you use a colour on a new background, add the pair to `contrast-requirements.ts`. That file lists the pairs, and `theme:check` prints the count.

- `heading` is held to everything `text` is. `secondary` (the secondary button edge) is held to everything `border-control` is. Use `border-control` for the edge of inputs and checkboxes, never a hairline (`border-subtle`).
- Links use the `link` and `link-hover` tokens, not `primary`, because primary as text can fall under 4.5:1.
- A hovered filled primary button keeps a 1px `--kv-color-primary` edge around the `primary-hover` fill, so its boundary stays at least 3:1 on `canvas`, `surface` and `surface-raised` in all four themes. `primary-hover` alone is not required on `surface-raised`.
- `danger-hover` on the three plain surfaces must be 3:1. If it drops below, give the danger button the same edge.
- `status` colours (`danger`, `success`, `warning`) and their `-subtle` backgrounds are held to the text minimum wherever prose, links or controls sit on a notification.
- A new surface that content sits on needs its text, edge and focus pairs.
- Colours are reviewed for look by eye, never by test. The test checks only contrast, fallbacks and forced-colour mapping.

The checker is a small CSS reader (`read-theme.ts`). It resolves `var()`, `@layer`, `@media` with `and` and `(feature: value)` conditions, and rules whose selector starts with `:root` (attributes, `:not()`, `:is()`, `:where()`). Range queries (`width >= 64rem`) never choose a theme. A copy of `theme.css` must keep theme selectors in that shape to be read correctly.

## Forced colours

- The `forced-colors: active` block maps **every** semantic colour token to a system colour (`Canvas`, `CanvasText`, `ButtonBorder`, `Highlight`, `HighlightText`, `LinkText`). A test fails when a colour token is missing there. Status colours become `CanvasText`.
- Its selector is `:root:is(*, [data-kv-color-scheme][data-kv-contrast])`, specificity (0,3,0), so it beats every theme selector.
- Edges carry meaning in forced colours, because shadows and fills vanish. Give every control, card, section, popup and sticky head a visible `border` (use `CanvasText`, `ButtonBorder` or `Highlight`). Keep widths the same so nothing moves. Selected, active and dragging states use `Highlight` with a shape change, not colour alone.
- Do not use `forced-color-adjust: none` to keep your own colours. The only uses are on an active Listbox option and the file upload progress fill, and both set system colours (`Highlight`, `HighlightText`) themselves.
- Buttons are flat in forced colours; hover changes the edge to `Highlight`.

## Prose and the boundary list

`kv-prose` styles content you don't control (CMS, Markdown). Related classes: `kv-lead` (a lead paragraph), `kv-scroll-region` (a wide table's named, focusable region), `kv-not-prose` (opt out).

- Every prose rule is a zero-specificity `:where()` rule in `@layer kv`, so component rules and consumer CSS win.
- Prose never styles a component part. The explicit list of part classes (first line of the `:not(...)` list in section 9: button, link, card parts, input group, checkbox, radio, native listbox) is written in one place. **When you add a part or a consumer class that appears inside prose, add it to that list.**
- Prose also skips anything inside `kv-not-prose`, `kv-nav`, `kv-button-group` and `kv-table`.
- A card, notification, field or fieldset Root in prose gets prose's block margins only. They are boundaries: nothing inside them is prose-styled unless a `kv-prose` sits between the element and the boundary. The nearest boundary or `kv-prose` wins, for two levels of nesting. Three levels are not supported. A Section is not a boundary.
- The description of a field or fieldset is a `kv-prose` that is a direct child, so it is prose again, in `body` (16px) wherever it sits. The hint (`kv-field-hint`, `Field.Hint`) is a plain paragraph in `body-small` (14px): its size belongs to the part, so no rule sizes a Prose by position, and the theme never styles a hint by `data-invalid` or `data-disabled`. An option's hint is the one spacing exception (column 2, 0 gap under its label).
- Unlayered page CSS beats prose, so scope it away from prose.
- Prose never removes list markers, never changes the `display` of a list or table, wraps `pre`, and fixes no heights. Markers, captions and lead text are at least 4.5:1 (7:1 in the contrast themes).
- Sizes are token swaps on `.kv-prose`: default, `--small` (14px, never for essential text), `--large`, `--xl`, `--2xl` and `--full` (lifts the 70ch measure). `--xl` and `--2xl` step down below `40rem`. Colour roles are `--kv-prose-color-<role>`, declared on `.kv-prose`, never on `:root` (each theme needs its own value).
- Prose matches `@tailwindcss/typography` element for element in our tokens (logical properties, no Tailwind, nothing imported). Differences: no generated quote marks or backticks, no italic or shadowed blockquote or `kbd`, `dd` has no indent, `pre` wraps, heading sizes are type roles.
- Tokens: `--kv-prose-measure` (70ch), `-space`, `-space-item`, `-space-block`, `-space-section`, `-list-indent`, `-list-item-indent`, `-code-size`, the size and `--kv-prose-lead-*` aliases, and the type role `lead`. `--kv-shadow-popup` and `--kv-shadow-dialog` are `color-mix` over `neutral-950`, and `none` in the dark themes.
- `kv-kbd` and prose `kbd` share one zero-specificity rule (section 9b), so a key looks the same in and out of prose.
- The nested-boundary selector could collapse into `@scope` once Safari 17.0 to 17.3 leave the support range.

## Long words and small screens

- `kv-prose`, `kv-card`, `kv-notification`, `kv-field` and `kv-fieldset` set `hyphens: auto`, `hyphenate-limit-chars: 10 4 4` and `overflow-wrap: break-word`. The break-word fallback covers Northern Sámi and a missing `lang`.
- `code`, `kbd`, `samp` and `pre` use `hyphens: manual`.
- Hyphenation needs `lang` on `<html>` and on passages in another language. Browser dictionaries are incomplete (Northern Sámi has none, and Finnish was missing in Chromium when last measured), so only soft hyphens fix it everywhere. Hyphenation is visual only.
- Below `40rem`, `display` is 2rem (no tracking), `heading-1` 1.5rem, `heading-2` 1.25rem and `lead` 1.125rem. `heading-3` and the body roles never change. Never make a role smaller than the one below it. At 200% zoom, headings grow less than 2x.
- Do not use `clamp()` with `vw` for type.

## Fonts

- The theme loads no font. `--kv-font-family-sans` starts with `'IBM Plex Sans'` then `--kv-font-family-system`. `--kv-font-family-serif` starts with `'IBM Plex Serif'` then `--kv-font-family-system-serif`. Headings read `var(--kv-font-family-heading, var(--kv-font-family-serif))`, text reads `var(--kv-font-family-body, var(--kv-font-family-sans))`. Both overrides are adopter-only.
- The docs site and Storybook self-host IBM Plex from `apps/docs/fonts/ibm-plex/ibm-plex.css`, imported by the docs layout and the Storybook preview. No third-party font request.
  - Plain `@font-face` CSS, not `next/font/local`. One family name per typeface, split into Latin1, Latin2 and Pi by `unicode-range`. Latin1 covers å ä ö æ ø, Latin2 the Northern Sámi letters (á č đ ŋ š ŧ ž).
  - Sans 400, 500, 600 and Serif 500, 600, upright only, woff2.
  - Use IBM's own files, unmodified (the licence reserves the name "Plex"; the licence file sits beside them). Fetch them with `npm pack`. Never add the IBM packages as dependencies, because their `postinstall` sends telemetry.
- Every Nordic and Sámi letter must come from the font, not from a fallback.
- Any font an adopter chooses must cover those letters. Fonts that need `font-feature-settings` for `l`, `I` and `1` set their own role settings.

## reset.css

- It is Tailwind v4 Preflight in plain CSS, MIT licence notice kept in the file, in `@layer kv-reset`.
- Changes from Preflight: lists keep markers and a `1.5em` start indent (Safari with VoiceOver drops list semantics when markers go); `svg:not(.kv-icon)` is a block, so an Icon stays inline; fonts read `--kv-font-family-body` and `--kv-font-family-mono` with Preflight's stacks as fallback.
- It sets no focus styles, except Preflight's Firefox focus ring.
- Known cost: a bare `<a>` outside prose or a theme component looks like text (use `kv-link` or your own CSS, 1.4.1), and a bare `<h2>` outside prose is unstyled. No story loads the reset.

## Maintainer preferences

- No ceremony: one import styles everything, and removing it unstyles everything. Classes for parts and choices, `data-*` only for state.
- Colours are aliased by role (primary, secondary, accent, neutral), not by hue, so a brand rebrands without a refactor.
- Prose should read like Tailwind Typography, in our tokens, with a Foundation page in Storybook.
- Long words hyphenate, and large type steps down on small screens.

## Pending

- Plan 0028 (naming) changes some part aliases. Read it before you rename a class.
