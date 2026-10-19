# Design spec: Icon and spinner variant (colour) and stroke width

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-17
- **Plan:** to be written (amends [icon.md](icon.md) §6.2–6.6, [loading-indicators.md](loading-indicators.md) L6 and §6.4, Plan 0126)
- **Type:** component default styling (theme classes, one `variant` prop). No new colour token.

## 1. Brief

- **Request (maintainer, 2026-10-17):** (1) `Icon` gets a `variant`, a colour chosen by a class, never a `color` prop; (2) the spinner gets the same; (3) stroke 1, 1.5 or 2 through classes, 1.5 the default.
- **Users:** both. Hardest case: a low-vision resident at 200% zoom, or in forced colours, who must not lose an icon or read meaning from its colour alone.
- **Constraints:** AGENTS.md rule 14 (`variant` only picks `kv-<part>--<option>`; the default adds none), role-named colours, 1.4.11, 1.4.1. **Assumption:** a 1.25px default spinner is still noticed (research question in loading-indicators.md §9, pending).

## 2. Prior art

- Reused: `kv-icon--size-<px>` and `kv-alert--<status>` (a prop picks one class, the theme maps tokens); the CSS `kv-spinner`'s contextual colours (Plan 0080). Lucide's `strokeWidth` and Phosphor's weights show stroke as a per-icon choice; here it is a class, not a prop (rule 14).

## 3. Decisions

| #   | Decision                                                                                                                                                     | Reason                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a   | Icon variants: `primary`, `secondary`, `accent`, `muted`, `info`, `success`, `warning`, `danger`; default `undefined` adds no class and stays `currentColor` | Role names (DESIGN.md Colors) plus the four statuses Alert uses. `muted` because `text-muted` is a text token, not a role. No `surface`/`neutral`: an icon in `surface` on `surface` is 1:1, and neutral text is the inherited default                                                |
| b   | `kv-spinner--<variant>`, same eight values; the ring reads `var(--kv-spinner-variant-color, var(--kv-spinner-color))`                                        | Context rules keep setting `--kv-spinner-color` untouched; a variant is only present when the consumer adds it, then it wins with no specificity fight. Forced colours ignore it (§5)                                                                                                 |
| c   | `kv-icon--stroke-1`, `kv-icon--stroke-2`, and `kv-icon--stroke-1-5`; `kv-spinner--stroke-1`, `kv-spinner--stroke-2`                                          | 1.5 is the drawing's attribute and needs no class. `-1-5` exists for icons only, to bring a registered set drawn at another width (Lucide's 2) to the library's 1.5. It is not a cascade reset: unlayered consumer CSS beats `@layer kv` anyway. The spinner has nothing to normalise |
| d   | `variant` is a prop on `useIcon` and `Icon` (`IconVariant` type, exported), not a provider default; stroke is classes only                                   | Typed values, one documented choice, same shape as `size`. A provider-wide colour would tint every icon. The CSS spinner is a class-only part, so its variant is a class                                                                                                              |
| e   | `Icons/Loading spinner` becomes the story `LoadingSpinner` in `Icons/Library`; `color` becomes `variant`, plus a `stroke` control                            | One place for the library; the story-only wrapper colour taught the wrong API (§6)                                                                                                                                                                                                    |
| f   | Variants decorate; words carry meaning                                                                                                                       | 1.4.1, 1.4.11 and the 20px rule (§5)                                                                                                                                                                                                                                                  |

## 4. Content

No new strings or i18n keys. The unknown-variant dev warning is developer text, like the unknown-size one.

## 5. Visual specification

**Icon variant classes** (theme section 10, after the size classes and before its forced-colours block):

| Class                                       | `color:`                     | Floor measured today (`contrast-requirements.ts`)                                                               |
| ------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `kv-icon--primary`                          | `var(--kv-color-primary)`    | 3:1 non-text on canvas, surface, surface-raised, primary-subtle, status bgs                                     |
| `kv-icon--secondary`                        | `var(--kv-color-secondary)`  | 3:1 non-text on the same four and the status bgs                                                                |
| `kv-icon--accent`                           | `var(--kv-color-accent)`     | 3:1 non-text on canvas, surface, surface-raised, primary-subtle                                                 |
| `kv-icon--muted`                            | `var(--kv-color-text-muted)` | text floor (4.5:1, 7:1 contrast themes) on the three surfaces and every alert bg                                |
| `kv-icon--info`                             | `var(--kv-color-primary)`    | as primary. Its own class so a future `info` token remaps it alone (the info alert's accent is `primary` today) |
| `kv-icon--success`, `--warning`, `--danger` | `var(--kv-color-<status>)`   | text floor on the three surfaces, `primary-subtle` and their own `-subtle`                                      |

- The class sets `color` only; the drawing's `stroke="currentColor"` follows. Never `stroke` or `fill`, so a two-tone registered logo keeps its child colours.
- **Pairs:** every variant/background pair on `surface` (and canvas, surface-raised) is already required in all four themes, so **no pair is missing**. The engineer adds one named group, `iconVariantPairs`: the eight variant tokens × `plainBackgrounds` at 3:1, so the variants stay required if a token's other reason is removed (accent stops ending the gradient). Duplicates of existing pairs must not double-report.
- Variants are for the three plain surfaces. Inside an alert or on a filled button the part colours its own icon; don't add a variant there (`primary` on a `primary` fill is 1:1).
- `primary` means interactive, selected or current (DESIGN.md Colors); `accent` is never a status (DESIGN.md token table). Status icons keep their four shapes.
- icon.md §6.3 "Never: `secondary`" is lifted: `secondary` is now a role (the TopBar fill), measured at 3:1.

**Spinner variant classes:** `.kv-spinner--<variant> { --kv-spinner-variant-color: <same token as the icon> }`. Default and context unchanged: `primary`, `currentColor` in `.kv-button`, `--kv-alert-accent` in `.kv-alert`. The library `spinner` icon takes `variant` like any icon; without one it stays `currentColor` (L6).

**Stroke.** The library's `<svg>` root carries `stroke-width="1.5"` and no child sets its own (checked: none of the 257 svgs, nor the built-ins). A CSS `stroke-width` on the root beats the presentation attribute and the children inherit it.

| Class                                        | Icon (root `<svg>`) | CSS spinner                      |
| -------------------------------------------- | ------------------- | -------------------------------- |
| (none)                                       | attribute 1.5       | `--kv-spinner-stroke-units: 1.5` |
| `kv-icon--stroke-1` / `kv-spinner--stroke-1` | `stroke-width: 1`   | `--kv-spinner-stroke-units: 1`   |
| `kv-icon--stroke-1-5`                        | `stroke-width: 1.5` | –                                |
| `kv-icon--stroke-2` / `kv-spinner--stroke-2` | `stroke-width: 2`   | `--kv-spinner-stroke-units: 2`   |

- CSS spinner: `--kv-spinner-stroke: max(1px, var(--kv-spinner-size) * var(--kv-spinner-stroke-units, 1.5) / 24)`, the icon's grid scaled by the ring size. `--kv-spinner-stroke` stays a length a consumer can still set. `kv-spinner--lg` drops its `--kv-indicator-width` override and follows the formula.
- **What the default does:** 1.25em ring, 16px text: 2px → 1.25px (−37%), the same as the icon spinner at `'20'` (loading-indicators.md §6.4). `--sm` (16px): 2px → 1px. `--lg` (48px): 4px → 3px. Button, Progress, toast and Map status get lighter. Decorative and beside words (L5), so 1.4.11 does not apply; the noticing question stays pending. `stroke-2` gives 1.67px at 20px; today's exact 2px is `--kv-spinner-stroke: 2px`.
- **Stroke range** (icon.md §6.1): 1 to 2 at `'20'` and up. At `'16'` and below, 1.5 only (stroke 2 fills the globe in). A meaningful icon with `stroke-1` is at least `'24'` (1px; 0.83px at 20 greys out below 3:1).

**Modes**

- **Forced colours:** icon variants collapse to `color: inherit` (the parent's system colour: `CanvasText`, `ButtonText` in a button, `LinkText` in a link, `GrayText` disabled). The existing `.kv-icon { color: inherit }` wins by order at equal specificity, so variant rules sit before it. Spinner: in the forced block, `.kv-spinner::before { border-color: var(--kv-spinner-color) }`, so the variant drops and the existing `CanvasText`/`ButtonText` apply. Stroke classes stay (shape, not colour). **Themes:** tokens only. **RTL:** unaffected. **Reduced motion:** unchanged; variant and stroke never animate.

## 6. Storybook (`Icons/Library`)

| Story                                                      | Change                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| meta                                                       | args `variant: 'none'`, `stroke: '1.5'`; argTypes `variant` select (none + the eight), `stroke` select `1`, `1.5`, `2` → `kv-icon--stroke-1`, no class, `kv-icon--stroke-2`. `color`, `colorOptions` and the wrapper `<span style>` go: `variant` is passed to `Icon`                                                       |
| `Default`, `AllIcons`, the 17 category stories, `Rtl`      | Read `variant` and `stroke`; no other change                                                                                                                                                                                                                                                                                |
| `Variants` (new)                                           | `info`, `success`, `warning`, `danger` icons at `'24'`, each with its name as visible text beside it; plus default and the other four. Stroke 1, 1.5, 2 rows                                                                                                                                                                |
| `LoadingSpinner` (new, from `loading-spinner.stories.tsx`) | The animated spinner at 16, 20, 24, 48; the still arc (no `kv-animate-spinner`); in context with words ("Loading…" from the existing fixture) in a Button and a Progress line; one `dir="rtl"` row (no mirror). Controls `size`, `variant`, `stroke` drive the first. Keeps the decorative and no-`progressbar` play checks |

- `loading-spinner.stories.tsx` is deleted; its ID becomes `icons-library--loading-spinner`. Update links in loading-indicators.md, Plan 0126 and the docs site.
- The CSS `kv-spinner` variants and strokes get one story where the ring lives today (Progress), not in Icons.

## 7. Accessibility annotations

- **Contrast:** 3:1 for a meaningful icon (1.4.11), text floor for status and muted tokens; the theme measures, the spec never states numbers by hand.
- **Decorative by default:** no `label`, `aria-hidden="true"`; `variant` and stroke never change name, role or state.
- **1.4.1:** a variant never replaces words. A status icon has the status in text and its own shape; story `Variants` shows the names.
- **20px rule:** a meaningful or status icon is at least `'20'`, `'24'` with `stroke-1`.
- **Motion:** only `kv-animate-spinner` under `prefers-reduced-motion: no-preference`; 2.2.2 stays the app's duty (L4).
- **Docs to change in the same PR:** DESIGN.md Icons ("The theme never sets stroke or colour" → "only through the variant and stroke classes, and in forced colours"), icon.md §6.2–6.5, the theme section-10 comment, `icon.tsx`'s doc comment, `icon.a11y.md`, loading-indicators.md L6 and §6.4.

## 8. Validation

- Self-check against review-checklist.md: no new token, all variant pairs measured, forced colours specified. `vp run theme:check` after the pair group is added (orchestrator).
- Usability test (**pending**): 5 residents incl. 2 low-vision and 1 screen-reader user; find the status of 4 messages with status icons in each variant; notice the 1.25px CSS spinner in a Button and a Progress line at 100% and 200% zoom.

## 9. Open questions

1. Diameter: the CSS ring's outer edge fills its box, the icon arc's is 19.5/24 of it, so at the same size the ring looks 23% larger. Inset `::before` by `size × 2.25 / 24` for an exact match? It shrinks every component spinner (maintainer's call).
2. Should the thinner default reach the components now, or wait for the components' migration to the icon (loading-indicators.md §8.3)?
