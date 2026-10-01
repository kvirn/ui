# ADR-0014: Default theme visual direction: Linear-inspired, held to WCAG 2.2 AA

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Maintainer (proposed by the ux-designer agent; the decision waits for the Plan 0005 prototype)
- **Tags:** theming, a11y
- **Amends:** ADR-0011 (visual direction only, not the process). It includes the earlier proposal for `danger-hover` and the link-underline tokens.
- **Note:** ADR-0017 (decision 8) moved a few values in the table below onto palette steps. `theme.css` holds the current values.

## Context

The maintainer chose a visual target for the default theme: the Linear-inspired DESIGN.md at [shadcn.io/design/linear](https://www.shadcn.io/design/linear), raw source at `https://www.shadcn.io/design/linear/raw`, fetched 2026-10-01. What the reference defines:

- **Colour:** a dark-only palette:
  - canvas `#010102`
  - the surface ladder `#0f1011`, `#141516`, `#18191a`, `#191a1b`
  - hairlines `#23252a`, `#34343a`, `#3e3e44`
  - ink `#f7f8f8`, `#d0d6e0`, `#8a8f98`, `#62666d`
  - the lavender accent `#5e6ad2`, with hover `#828fff` and pressed `#5e69d1`
  - `on-primary` `#ffffff`, and success `#27a644`
- **Type:** Linear's own fonts, with Inter 500, 600 and 700 as the substitute. Tracking runs from -3.0px at 80px, through -1.0px at 40px, -0.6px at 28px and -0.4px at 22px, to -0.05px at 16px. Buttons are 14px, weight 500. There is a 12px caption and a 13px eyebrow with +0.4px tracking.
- **Radius:** 4, 6, 8 (base), 12, 16 and 24px, plus pill.
- **Spacing:** steps of 4px, up to 96px.
- **Buttons:** padding 8px 14px, which makes them about 33px tall.
- **Top navigation:** 56px tall.
- **Depth:** no shadows. Depth comes from surfaces and hairlines.

What the source says is missing, so it had to be inferred:

- A light theme (the source: "Light mode is not documented").
- Form validation and error styling.
- Focus ring thickness (the source only says the lavender is used "on focus rings").
- Link styling beyond "link emphasis".
- Motion.

DESIGN.md (ADR-0011) must stay accessible: WCAG 2.2 AA as the floor, 2.4.13 Focus Appearance, 44px comfortable targets and 7:1 text in the contrast themes. `theme:check` enforces the pairs.

## Decision drivers

- The maintainer's target look: near-black and near-white canvases, a surface ladder, hairlines, a single lavender accent, tight Inter, 8px radii and density
- WCAG 2.2 AA is non-negotiable: text 4.5:1, control boundaries 3:1 (1.4.11), focus 3:1 with a 2px-thick area (2.4.13), text 7:1 in the contrast themes (1.4.6), targets at least 24px (2.5.8), and 44px for primary actions
- Keep churn small where the reference has no opinion (status colours, the contrast themes)
- Self-hosted fonts only (hard rule 7)

## Options considered

### Option A: adopt the reference literally

- ✅ The closest match to the target
- ❌ It fails AA:
  - white on the hover `#828fff` is 2.87:1
  - `#5e6ad2` as text on the dark canvas is 4.44:1, and 4.05:1 on `#0f1011`
  - `ink-tertiary` is 3.62:1
  - the hairline control edges are 1.36–1.96:1
- ❌ It has no light or contrast themes, and no error styling

### Option B: Linear-inspired, with every failing value adjusted and the gaps inferred (chosen)

- ✅ Keeps the look: canvas, ladder, hairlines, the accent hue and white-on-lavender buttons, Inter, the radii and the tracking ramp
- ✅ Passes every pair (measured below)
- ❌ It needs four new colour tokens (`link`, `link-hover`, `on-danger`, `danger-hover`), and the hover direction differs from Linear

### Option C: keep the current DESIGN.md palette

- ✅ No work
- ❌ Not the look the maintainer asked for

## Decision

We will use Option B and update DESIGN.md accordingly. It stays Proposed until the maintainer approves the Plan 0005 prototype.

### Colour tokens, old → new, with measured contrast

Measured 2026-10-01 with `packages/theme/src/contrast.ts`. Ratios are light / dark / light-contrast / dark-contrast. Every pair meets its minimum, and 0 of the 168 required pairs fail (42 per theme), and the four `primary`-on-`primary-subtle` indicator pairs pass too. Only values that change are listed. `danger-subtle`, `warning`, `warning-subtle`, `success` and `success-subtle` are unchanged in every theme.

| Token                | Theme         | Old       | New                                           | Key pair: ratio                                                                                       |
| -------------------- | ------------- | --------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `canvas`             | dark          | `#0e0f12` | `#010102`                                     | `text` 19.61                                                                                          |
| `canvas`             | dark-contrast | `#000000` | `#010102`                                     | `text` 20.86                                                                                          |
| `surface`            | light / lc    | `#f6f7f9` | `#f6f7f7`                                     | `text` 17.75 / 19.57                                                                                  |
| `surface`            | dark          | `#15161a` | `#0f1011`                                     | `text-muted` 5.86                                                                                     |
| `surface`            | dark-contrast | `#0b0c0e` | `#0f1011`                                     | `text-muted` 13.04                                                                                    |
| `surface-raised`     | dark          | `#1c1d22` | `#18191a`                                     | `text-muted` 5.42, `border-control` 3.54                                                              |
| `surface-raised`     | dark-contrast | `#15161a` | `#18191a`                                     | `text-muted` 12.05                                                                                    |
| `border-subtle`      | light         | `#e3e5ea` | `#e4e5e7`                                     | decorative (1.26 on canvas)                                                                           |
| `border-subtle`      | dark          | `#2a2c33` | `#23252a`                                     | decorative (1.36 on canvas), Linear `hairline`                                                        |
| `border-subtle`      | dark-contrast | `#8a8f9c` | `#8a8f98`                                     | decorative (6.42)                                                                                     |
| `border-control`     | light         | `#767b88` | `#7c808a`                                     | on canvas 3.95, surface 3.68, `primary-subtle` 3.49                                                   |
| `border-control`     | dark          | `#72778a` | `#6b7079`                                     | on canvas 4.19, surface 3.83, raised 3.54, `primary-subtle` 3.13                                      |
| `text`               | light         | `#15161a` | `#0f1011`                                     | on canvas 19.05                                                                                       |
| `text`               | dark          | `#f3f4f6` | `#f7f8f8`                                     | on canvas 19.61, Linear `ink`                                                                         |
| `text-muted`         | light         | `#555a66` | `#5d6169`                                     | lowest: on `primary-subtle` 5.48                                                                      |
| `text-muted`         | dark          | `#a3a8b4` | `#8a8f98`                                     | lowest: on `primary-subtle` 4.80 (raised 5.42). Linear `ink-subtle`                                   |
| `text-muted`         | dark-contrast | `#d6d9df` | `#d0d6e0`                                     | lowest: on `primary-subtle` 10.68. Linear `ink-muted`                                                 |
| `primary`            | light         | `#4c56d0` | `#5e6ad2`                                     | `on-primary` 4.70. As an indicator: on surface 4.38, on `primary-subtle` 4.15                         |
| `primary`            | dark          | `#8f97ff` | `#5e6ad2`                                     | `on-primary` 4.70. As an indicator: on canvas 4.44, surface 4.05, `primary-subtle` 3.32               |
| `primary-hover`      | light         | `#3d46b3` | `#4f5ac0`                                     | `on-primary` 5.91. Step from `primary`: 1.26                                                          |
| `primary-hover`      | dark          | `#a8aeff` | `#4d58c0`                                     | `on-primary` 6.05. Step: 1.29 (darker, see deviations)                                                |
| `on-primary`         | dark          | `#0e0f12` | `#ffffff`                                     | 4.70 on `primary`                                                                                     |
| `on-primary`         | dark-contrast | `#000000` | `#010102`                                     | 11.14 on `primary`                                                                                    |
| `primary-subtle`     | light         | `#eef0fd` | `#eff0fb`                                     | `link` 4.68, `text` 16.80                                                                             |
| `link` (new)         | all           | –         | `#5561cb` / `#828fff` / `#2c35a0` / `#b3b8ff` | lowest: light on `primary-subtle` 4.68. Dark on canvas 7.27, raised 6.14, contrast themes 8.72 / 8.33 |
| `link-hover` (new)   | all           | –         | `#434db3` / `#a3acff` / `#1f2780` / `#cdd0ff` | on canvas 7.12 / 9.84 / 12.65 / 13.97                                                                 |
| `focus-ring`         | light         | `#4c56d0` | `#5e6ad2`                                     | on canvas 4.70, surface 4.38                                                                          |
| `focus-ring`         | dark          | `#8f97ff` | `#828fff`                                     | on canvas 7.27, surface 6.64, raised 6.14                                                             |
| `danger-hover` (new) | all           | –         | `#962034` / `#ffb0ba` / `#700a1d` / `#ffd4d9` | `on-danger` 8.23 / 12.09 / 12.00 / 15.57. Step from `danger`: 1.28 / 1.30 / 1.27 / 1.26               |
| `on-danger` (new)    | all           | –         | `#ffffff` / `#010102` / `#ffffff` / `#010102` | on `danger` 6.40 / 9.29 / 9.47 / 12.35                                                                |

The light-contrast and dark-contrast accents (`#2c35a0`, `#b3b8ff`) are unchanged. Neither Linear hue reaches 7:1 behind white text, or against the black canvas as an indicator.

### Other tokens, old → new

| Token                 | Old                      | New                                                | Source                                                       |
| --------------------- | ------------------------ | -------------------------------------------------- | ------------------------------------------------------------ |
| `display`             | 2.5rem, -0.022em         | 2.5rem, -0.025em                                   | Linear `display-md`, 40px at -1.0px                          |
| `heading-1`           | 2rem, -0.02em            | 1.75rem, -0.021em                                  | `headline`, 28px at -0.6px                                   |
| `heading-2`           | 1.5rem, 600, -0.015em    | 1.375rem, 500, -0.018em                            | `card-title`, 22px, 500, -0.4px                              |
| `heading-3`           | 1.25rem, -0.01em         | 1.125rem, 600, 0em                                 | Inferred (Linear's `subhead` is 400: too weak for a heading) |
| `label-compact` (new) | –                        | 0.875rem, 500, 1.3                                 | Linear `button`, 14px, 500                                   |
| `code`                | 0.9375rem, 1.5           | 0.875rem, 1.6                                      | Linear `mono` is 13px. We use 14px                           |
| `rounded`             | sm 4, md 6, lg 10, xl 14 | sm 4, md 8, lg 12, xl 16                           | Linear `xs` 4, `md` 8, `lg` 12, `xl` 16                      |
| buttons               | padding 0 20px, 44px     | padding 0 16px, min 44px; compact 0 12px, min 32px | Linear 8px 14px (~33px). Comfortable keeps 44px              |
| underline             | unspecified              | 1px, hover 2px, offset 0.15em                      | Inferred. Keeps a non-colour hover cue                       |

Spacing, motion and elevation are unchanged. Linear's spacing is a subset of ours. It has no shadows, which matches our dark theme and flat look. Motion is unspecified in the source.

### Deviations from the target, and why

| Target                                                                      | Ours                                                                                                 | Reason                                                                                                                      |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Hover lightens the primary to `#828fff`                                     | Hover **darkens** (`#4f5ac0` light, `#4d58c0` dark)                                                  | White on `#828fff` is 2.87:1 (1.4.3)                                                                                        |
| `#5e6ad2` for link emphasis                                                 | A separate `link` token: `#5561cb` light, `#828fff` dark                                             | `#5e6ad2` as text is 4.38 on the light surface, and 4.44 / 4.05 on the dark canvas and surface (1.4.3)                      |
| Hairline edges on inputs and secondary buttons (`#23252a`–`#3e3e44`)        | Hairlines only as dividers. Controls use `border-control` (3.13:1 or more)                           | 1.36–1.96:1 fails 1.4.11 for control boundaries. DESIGN.md also applies the rule to secondary buttons, for low-vision users |
| `ink-tertiary` `#62666d`                                                    | Not used                                                                                             | 3.62:1                                                                                                                      |
| The focus ring (thickness not documented)                                   | 2px solid, 2px offset, `#828fff` in dark                                                             | 2.4.13 (and 2.4.11). `#828fff` is more visible on near-black (7.27 vs 4.44)                                                 |
| 14px, ~33px buttons everywhere                                              | 16px, 44px by default. 14px and 32px only in compact density                                         | Primary actions for residents meet 2.5.5. Compact meets 2.5.8 and is opt-in                                                 |
| 12px caption, 13px eyebrow with positive tracking                           | Not adopted. The smallest text is 14px, in sentence case                                             | DESIGN.md: no essential text under 14px, no all-caps                                                                        |
| -0.05px body tracking                                                       | 0                                                                                                    | Legibility. No negative tracking under 20px                                                                                 |
| Dark only                                                                   | Four themes. Light and both contrast themes are inferred, and contrast themes keep their 7:1 accents | ADR-0006. The contrast themes can't use `#5e6ad2` (white on it is 4.70, below 7)                                            |
| Current navigation shown by a background change only (Linear app, inferred) | Background plus a bar, weight 600 and `aria-current`                                                 | 1.4.1, forced colours                                                                                                       |
| Mono 13px (Linear Mono / JetBrains Mono)                                    | 14px system `ui-monospace` stack                                                                     | Readability. No extra font download                                                                                         |

## Accessibility impact

Neutral to positive against the current DESIGN.md:

- All text pairs pass 4.5:1, and 7:1 in the contrast themes. The lowest pairs in the standard themes (4.68 and 4.70) are closer to the minimum than before (5.22). This is the cost of the target hue.
- Control borders pass 3:1 or more. The lowest is 3.13, before it was 3.78.
- Focus rings pass 3:1 or more. The lowest is 4.38.
- Comfortable targets stay at 44px. Compact density is documented as 2.5.8-only.
- The dark theme moves from dark text on a light accent to white text on `#5e6ad2`, at 4.70:1. This passes, but it has less margin than before (7.34). An adopter who rebrands must re-run `theme:check`.

## Consequences

- Positive: the look the maintainer asked for, with every pair enforced.
- Negative / trade-offs:
  - Four more colour tokens (`link`, `link-hover`, `on-danger`, `danger-hover`) and one type token (`label-compact`).
  - Thinner contrast margins on the accent.
  - The light theme is our inference, not Linear's.
- Follow-ups:
  - Plan 0005 builds the prototype.
  - If it's approved, set this ADR and ADR-0013 to Accepted, and implement `tokens.ts` with every pair in `contrastRequirements`.

## Validation

- `theme:check` covers every pair in the table above.
- axe reports 0 violations in the four fixed-theme stories.
- A ux-designer design review compares the prototype with the reference, using screenshots at 320px and 1280px in all four themes.
- The maintainer approves the prototype.

## References

- https://www.shadcn.io/design/linear (fetched 2026-10-01, raw DESIGN.md at `/design/linear/raw`)
- DESIGN.md, ADR-0006, ADR-0011, ADR-0013
- `docs/design/default-theme-button-link.md`, `docs/design/docs-site.md`
