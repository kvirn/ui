# ADR-0026: Buttons have gentle depth ("Grounded")

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Maintainer (chose variation D in the button-depth exploration). Proposed by the ux-designer agent.
- **Tags:** theming, a11y

## Context

The owner asked for buttons that "look like buttons: slight highlights and shade, gentle, subtle". The design spec [`docs/design/button-depth.md`](../design/button-depth.md) and its prototype (`docs/design/prototypes/button-depth.html`) explored five variations, A to E, against today's flat button. The owner chose **D, Grounded**.

Today `DESIGN.md` says depth comes from the surface ladder "instead of shadows", that the look is flat, and that in dark themes "raised surfaces get lighter, not shadowed". Shadows exist only at elevation levels 3 and 4 (popups and dialogs), and only in light. A shadow under a button breaks the first rule and, in dark, the second, so the rules need a scoped exception.

Three accessibility problems came with D in the exploration:

1. **The focus ring over the shadow.** The ring sits 2px outside the button, where its adjacent colour is the page. With D's hover shadow under that gap, the ring's adjacent colour gets darker: `focus-ring` against the shadowed gap is 3.23:1 on `canvas` and **3.04:1 on `surface`** in light (both shadow layers at full alpha), against 4.70 and 4.42 without it. That passes 3:1 by 0.04. `theme:check` can't see it, because it measures token pairs, not blurred shadows, and a rebranded `--kv-primary-*` scale could drop it below 3:1 without any check failing.
2. **The dark bottom edge.** The first prototype darkened the bottom edge in dark too. Measured, that edge was 1.80–2.20:1 on `canvas`, `surface` and `surface-raised`, below the 3:1 a control edge needs (1.4.11). It was fixed in the spec before this decision: in dark only the top edge changes (lighter), and the bottom keeps the token edge.
3. **The contrast themes and forced colours.** Users who ask for more contrast, or who set a Windows contrast theme, need the boundary to come from the solid token edge and fill, not from soft effects.

There is no user research on button recognisability in KvirnUI (see Validation).

## Decision drivers

- A button should read as "press me" at a glance, for residents with low digital confidence and on any background (`canvas`, `surface`, `surface-raised`).
- Labels and control edges keep their measured contrast: 4.5:1 for labels (7:1 in the contrast themes), and 3:1 for edges (1.4.11).
- The focus ring keeps exactly today's measured contrast, and `theme:check` stays the whole truth for it (2.4.7, and the default theme's 2.4.13 target).
- Depth is never the only boundary or state cue: it disappears in forced colours.
- It survives a rebrand: every new colour pair can be measured by `checkThemeCss()`.
- Raw colours stay in the palette block (ADR-0013, ADR-0018).
- No motion for users who ask for reduced motion.

## Options considered

The values for each are in `docs/design/button-depth.md`, section 6.

### Flat (today)

- ✅ No new pairs, nothing for `theme:check` to miss, and the strongest fit with "calm, precise, plain".
- ❌ Doesn't answer the owner's request. A flat outlined secondary button is close in look to a card or an input.

### A. Soft lift (inner highlight and a soft shadow)

- ✅ Clear in light.
- ❌ Weak in dark, where it relies on a highlight. The same ring-over-shadow problem as D, with no tinted edge to carry the cue in dark.

### B. Gentle gradient

- ✅ Labels only ever get darker stops, so contrast rises.
- ❌ Conflicts with the Don't "add gradients … behind text". Any future lighter stop behind a white label fails 4.5:1 (4% white over `primary` is 4.37:1). Gradients band on some screens.

### C. Hairline bevel (inner lines only)

- ✅ Nothing paints outside the border box, so the focus ring is untouched. Matches "raised gets lighter" in dark. It was the designer's recommendation.
- ❌ The least obvious of the five. The light outlined bevel is barely visible.

### D. Grounded (ambient shadow and a tinted edge) (chosen)

- ✅ Clear in light: the button sits on the page. In dark, a lighter top edge carries the cue, which follows "raised gets lighter".
- ✅ The tinted edges only raise contrast: they are darker than the token in light and lighter in dark (measured below).
- ❌ Breaks "instead of shadows" for one control. The ring-over-shadow problem (resolved below). Tinted edges are new colours that `theme:check` must learn to measure.
- ❌ The weakest dark result of the five, because a shadow on near-black can't be seen.

### E. Tactile press (a solid ledge, and the button moves when pressed)

- ✅ The strongest affordance, and proven on GOV.UK.
- ❌ The largest change: a 4px focus offset for buttons only, a 2px ledge that breaks baseline alignment with inputs, and movement that can jitter in sticky footers and button groups.

## Decision

We will give the three existing button kinds, base or secondary (`.kv-button`), `kv-button--primary` and `kv-button--danger`, the **Grounded** depth in the standard light and dark themes, and keep them flat everywhere else. The owner chose it as the best balance between a clear "press me" cue in light and a small visual change.

### Depth by state

| State               | Shadow                     | Top edge                    | Bottom edge                 |
| ------------------- | -------------------------- | --------------------------- | --------------------------- |
| Rest                | `--kv-shadow-button`       | tinted (dark only)          | tinted (light only)         |
| Hover               | `--kv-shadow-button-hover` | tinted (dark only)          | tinted (light only)         |
| Pressed (`:active`) | none                       | the token edge              | the token edge              |
| Focus-visible (any) | **none**                   | tinted, as in rest or hover | tinted, as in rest or hover |
| Disabled            | none                       | the dashed `border-control` | the dashed `border-control` |

"The token edge" is the edge a button has today in that state: `secondary` (rest) or `primary` (hover, pressed) for the base button, `transparent` (rest) or `primary` (hover, pressed) for primary, and `transparent` for danger. A tinted edge mixes that colour, or the fill where the edge is transparent, with the shade or highlight.

### Tokens

| Token                        | light                                         | dark                       | light-contrast, dark-contrast, forced colours |
| ---------------------------- | --------------------------------------------- | -------------------------- | --------------------------------------------- |
| `--kv-shadow-button`         | `0 1px 2px` ink 6%, `0 2px 6px -1px` ink 12%  | `0 1px 2px` black 60%      | `none`                                        |
| `--kv-shadow-button-hover`   | `0 1px 2px` ink 6%, `0 4px 10px -2px` ink 12% | `0 2px 6px` black 60%      | `none`                                        |
| `--kv-button-edge-shade`     | `var(--kv-neutral-950) 35%`                   | `var(--kv-neutral-950) 0%` | `var(--kv-neutral-950) 0%`                    |
| `--kv-button-edge-highlight` | `var(--kv-white) 0%`                          | `var(--kv-white) 25%`      | `var(--kv-white) 0%`                          |

"Ink" is `--kv-neutral-950` and "black" is `--kv-black`, both through `color-mix(in srgb, <colour> N%, transparent)`, as `--kv-shadow-popup` does. The edge tokens are a colour and a percentage, the second argument of `color-mix(in srgb, <edge>, <token>)`, so the palette stays out of the component rules and `0%` turns the tint off.

### The focus ring: the shadow goes on keyboard focus

On `:focus-visible` (and `[data-focus-visible]`) the outer shadow is removed, in every state including hover. The tinted edges stay, so a focused button still looks like a button and doesn't look pressed (pressed resets the edges). The ring's adjacent colour is then the plain page again, so its contrast is exactly today's: 4.70, 4.42 and 4.70 on `canvas`, `surface` and `surface-raised` in light, and 7.27, 6.64 and 6.14 in dark. `theme:check` already measures those pairs, so it stays the whole truth for focus, including for rebrands.

Alternatives for the ring, rejected:

- **Keep the shadow and add a check.** The worst case is 3.04:1, a 0.04 margin. A check would have to model a blurred, offset, two-layer shadow, and a slightly lighter brand `primary` would fail it.
- **A larger ring offset.** The hover shadow reaches about 12px below the button. An offset that clears it detaches the ring from the button, so it reads less clearly as "this one".
- **A two-tone ring (an inner white halo).** It would change the focus language for one component, and a `box-shadow` halo disappears in forced colours, so the outline would still carry the meaning alone.
- **Weaker shadows.** They weaken the chosen look and are still unmeasured.

Mouse users don't get `:focus-visible` when they click a button, so they see the shadow as designed. A keyboard user sees the button settle onto the page while it has focus. That is a visual change only, never the focus indicator (the ring is), so it doesn't conflict with the Don't "rely on a shadow to show focus".

### Where it doesn't apply

- **Disabled:** flat, exactly today's dashed button. Losing the depth is one more non-colour cue.
- **The contrast themes** (`data-kv-contrast='more'` and `prefers-contrast: more`): flat, with the token edge on all four sides. Users who asked for more contrast get the solid fill and edge only, and every pair is the measured 7:1 or 3:1 token pair.
- **Forced colours:** no shadow, and all four edges are the system colour, as today (`ButtonText`, `Highlight` on hover and pressed, dashed `GrayText` when disabled).
- **Reduced motion:** `box-shadow` joins the transition list only under `prefers-reduced-motion: no-preference`. Under `reduce`, every change is instant.
- **Everything that isn't a button:** cards, inputs, badges, navigation items, links and popups get no button depth. Depth means "press me".

## Accessibility impact

- **1.4.3 and 1.4.6, labels:** unchanged. The shadow is outside the border box and the edge tint is in the 1px border, and labels sit at least 4px inside it on the flat token fill. The lowest label pair is still `on-primary` on `primary`, 4.70:1.
- **1.4.11, edges:** the tinted edges only raise the boundary, measured with `packages/theme/src/contrast.ts` (sRGB mix, which equals compositing the shade over a transparent edge's fill):

  | Tinted edge                                    | light, bottom (canvas / surface / surface-raised) | dark, top (canvas / surface / surface-raised) |
  | ---------------------------------------------- | ------------------------------------------------- | --------------------------------------------- |
  | Base button at rest (`secondary`)              | 8.33 / 7.83 / 8.33 (`#4b4e55`)                    | 6.85 / 6.25 / 5.78 (`#90949b`)                |
  | Base hover, primary rest and hover (`primary`) | 7.99 / 7.51 / 7.99 (`#424b8e`)                    | 6.94 / 6.34 / 5.86 (`#868fdd`)                |
  | Danger at rest (`danger` fill)                 | 10.17 / 9.56 / 10.17 (`#7a1f2f`)                  | 11.36 / 10.37 / 9.58 (`#ffa7b3`)              |
  | Danger hover (`danger-hover` fill)             | 11.97 / 11.25 / 11.97 (`#671a28`)                 | 14.13 / 12.90 / 11.92 (`#ffc6ce`)             |

  The untouched edges keep today's pairs (lowest: `secondary` 3.54:1 on `surface-raised` in dark, and a hovered primary's `primary` edge 3.75:1 there, ADR-0021). The contrast themes use the token edges, already measured by `theme:check`.

- **2.4.7 and 2.4.13 (the default theme's target):** the ring is unchanged, and its contrast is exactly today's (above), because the shadow is removed on keyboard focus.
- **2.4.11:** nothing covers the ring. The shadow is gone while focused, and a neighbour's hover shadow is a fading tail at most, lighter than the measured worst case.
- **2.5.8:** sizes are unchanged.
- **Forced colours:** depth is never the only cue. Without it, the button is today's button.
- **Pressed** is a visual state only, not `aria-pressed`.
- **APG:** no change. It's still a native `<button>`.

## Consequences

- Positive:
  - Buttons stand apart from cards, inputs and text, especially in light.
  - The tinted edges raise every edge pair they touch.
  - Sites can turn depth off with four custom properties (both shadows `none`, both edge tokens at `0%`).
- Negative / trade-offs:
  - `DESIGN.md` gets its first control-level shadow, and an exception to "dark raised surfaces get lighter, not shadowed" (the dark shadow is nearly invisible, and the lighter top edge does the work).
  - Two kinds of new value for `theme:check` to understand: the edge tokens (a colour and a percentage).
  - Keyboard focus changes the look of the button (the shadow goes). It's intentional, and it's not the focus indicator.
  - Buttons inside a container with `overflow: hidden` have their shadow clipped. That's cosmetic only.
  - Dark gets the weakest cue of the five variations.
- `DESIGN.md` changes: Overview (the surfaces bullet), Colors (the dark-theme rule, the measured pairs and rebranding), Elevation & Depth (a new "Button depth" subsection), Components (Buttons) and Do's and Don'ts. The front matter gets a comment only, because the DESIGN.md format has no shadow property.
- Follow-ups:
  - An engineering plan to implement the tokens and selectors in `packages/theme/theme.css`, extend `checkThemeCss()` to measure the tinted edges, add theme and e2e tests, and update the Button stories (handoff: `docs/design/button-depth.md`, section 10).
  - The forced-colours hover specificity defect noted in ADR-0021 still applies to the variant hover rules. The implementation must not make it worse, and fixing it stays a separate a11y defect.
  - New kinds (a filled secondary, an outlined primary) are out of scope and an open question in the spec.

## Validation

- `vp run theme:check` passes with the tinted-edge pairs added, in all four themes.
- e2e: on keyboard focus the computed `box-shadow` is `none`, at rest and while hovered. In forced colours and the contrast themes it's `none` and all four edges are equal. Under reduced motion there's no `box-shadow` transition.
- Usability testing: `pending`. The test plan is in `docs/design/button-depth.md`, section 8 (a first-click test of today's flat button against D, in light and dark, in sv and fi, with residents with low digital confidence, older users, a magnification user and a Windows contrast-theme user).
- Manual AT and visual check in the AT matrix (`docs/accessibility.md`): `pending`.
- Review: if testing shows D isn't recognised better than flat, or dark users don't see the cue, revisit with C or E (the spec's fallbacks).

## References

- `docs/design/button-depth.md` and `docs/design/prototypes/button-depth.html`
- ADR-0006 (themes), ADR-0013 and ADR-0018 (raw colours only in the palette, shadow tokens), ADR-0014 (visual direction), ADR-0019 (palette scales), ADR-0021 (primary hover edge)
- [GOV.UK Design System, Button](https://design-system.service.gov.uk/components/button/) (prior art for E)
- WCAG 2.2: 1.4.3, 1.4.6, 1.4.11, 2.4.7, 2.4.11, 2.4.13, 2.5.8
