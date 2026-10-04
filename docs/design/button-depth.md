# Design spec: Button depth

- **Status:** Draft. **Decision: D, Grounded** (Proposed, 2026-10-01). The engineering handoff is [section 10](#10-handoff-to-engineering-variation-d).
- **Designer:** ux-designer agent · **Date:** 2026-10-01
- **Plan:** to be written by the main session from section 10.
- **Type:** theme/token change (default-theme component styling)
- **Prototype:** [prototypes/button-depth.html](prototypes/button-depth.html). Open it from disk, with no build and no network. Its palette is a copy of `theme.css` section 1 from 2026-10-01.

The owner's request: "Buttons should look like buttons: slight highlights and shade, gentle, subtle. 5 variations of filled and outlined buttons, primary and secondary colors."

This spec records the five variations in the prototype, their exact values, measured contrast, how each one degrades, and a recommendation. **The owner chose D, Grounded** (2026-10-01), for the three existing kinds only. `DESIGN.md` ("Elevation & Depth", "Button depth") and the button-depth decision record the decision, and section 10 is the handoff to engineering. Sections 1 to 8 are kept as the record of the exploration.

## 1. Brief

- **Users:** both. Hardest case: a resident with low vision or low digital confidence, on a phone, who has to tell the one thing that submits the form from text, cards, badges and links. Second hardest: a Windows contrast-theme user, for whom every depth effect disappears.
- **Job to be done:** When I reach the end of a step, I want to see at once what I can press, so I can move on without guessing.
- **Context:** used once, often under stress. On light and dark canvases, and on `canvas`, `surface` and `surface-raised` backgrounds.
- **Constraints:** WCAG 2.2 AA (1.4.3, 1.4.11, 2.4.7, 2.4.11, 2.5.8, 2.3.3 motion), `DESIGN.md` (flat look, surface ladder, "dark raised surfaces get lighter, not shadowed", no gradients behind text), the four themes plus forced colours, and rebrandable primary and secondary scales.
- **Success criteria:** in a first-click test, more participants pick the primary action on the first try than with today's flat button, with no loss in the contrast themes or forced colours. No new contrast pair below its floor in `theme:check`.
- **Evidence:** none. There is no KvirnUI research on button recognisability.
- **Assumptions and research questions:**
  - Assumption: today's flat buttons are harder to recognise as buttons than buttons with gentle depth. → Research question: do residents with low digital confidence click the flat button as fast and as accurately as a bevelled one (C) or a ledged one (E)?
  - Assumption: in a flat interface, depth on buttons alone helps signal "this is interactive". → Research question: do participants read a shadowed popup or a card as clickable once buttons have depth?

## 2. Prior art

| Source                                                                                                             | What we reuse                                                                                                                                         | What we change and why                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| KvirnUI Button default theme (`theme.css` section 7, [default-theme-button-link.md](default-theme-button-link.md)) | Every colour token, the 44px height, hover darkens, the dashed disabled state, primary hover edge, and the 2px focus ring with a 2px offset           | Depth is added on top. No label ever sits on a lighter colour than its measured token.                                           |
| [GOV.UK Design System, Button](https://design-system.service.gov.uk/components/button/)                            | E copies its pattern: a solid 2px darker ledge under the button, and on press the button moves down onto it, with the hit area kept under the pointer | We use a tinted shade of the fill, not a fixed colour. The focus ring stays an outline with an offset, not GOV.UK's yellow fill. |
| APG Button pattern                                                                                                 | Native `<button>`. Nothing changes in behaviour.                                                                                                      | None. This is purely visual.                                                                                                     |

Designsystemet (NO) and the Suomi.fi design system were not checked in this session (see Open questions).

## 3. Flow

Not applicable. This is a visual change to an existing control, with no flow.

## 4. Content

There are no new visible or announced strings. Depth is purely visual, and labels and names don't change. The prototype's explanatory copy is English-only on purpose: it's a throwaway artefact for the owner and never ships.

## 5. Structure

Not applicable. Size, padding, gap and wrapping are today's (`min-block-size: 2.75rem`, `padding: 0.5rem 1rem`, `overflow-wrap: break-word`). E is the only variation that adds anything outside the box: a 2px ledge below the button, which a button group needs room for (see E).

## 6. Visual specification

### Shared by all variations (today's tokens, unchanged)

| Kind                                   | Fill: rest → hover/pressed          | Label                 | Edge: rest → hover/pressed |
| -------------------------------------- | ----------------------------------- | --------------------- | -------------------------- |
| Primary, filled (`kv-button--primary`) | `primary` → `primary-hover`         | `on-primary`          | transparent → `primary`    |
| Secondary, outlined (base `kv-button`) | `surface-raised` → `primary-subtle` | `text`                | `secondary` → `primary`    |
| Secondary, filled (**proposed**)       | `secondary` → `secondary-hover`*    | `on-secondary`*       | transparent → `secondary`  |
| Primary, outlined (**proposed**)       | `surface-raised` → `primary-subtle` | `link` → `link-hover` | `primary`                  |

`*` These are proposed tokens. `secondary-hover` is `secondary-600` (light and dark), `secondary-800` (light-contrast) or `secondary-100` (dark-contrast). `on-secondary` is `white`, except `black` in dark-contrast.

- **Focus-visible:** a 2px `focus-ring` outline with a 2px offset, in every variation except E, which uses a 4px offset.
- **Disabled:** flat in every variation. The fill is `surface`, the label `text-muted`, the edge a dashed `border-control`, with no shadow, no gradient and no movement. Losing the depth is one more non-colour cue.
- **Contrast themes:** flat in every variation (proposed). Every shadow, highlight and gradient is `none`, and D's tinted edges go back to the token edge.
- **Motion:** with `prefers-reduced-motion: no-preference`, `background-color, border-color, color, box-shadow, transform` transition over `--kv-duration-fast` (120ms) with `--kv-easing-standard`. Under `reduce`, every change is instant.

In the tables below, "ink" is `neutral-950` (`#0f1011`) in light and `black` (`#010102`) in dark. The prototype writes these as `rgb()` literals. In `theme.css` they must become `color-mix(in srgb, var(--kv-neutral-950) N%, transparent)` (or `--kv-black`, or `--kv-white`), so raw colours stay in the palette block.

### Baseline: today, flat

No `box-shadow` and no `background-image`. Depth comes only from the fill and the edge.

### A. Soft lift

A 1px inner highlight along the top and a short, soft shade below. When pressed, both give way to a faint inner shade. In dark the highlight carries the depth, because a shadow on near-black can't be seen.

| State   | Filled, light                                                  | Filled, dark                                 | Outlined, light           | Outlined, dark                              |
| ------- | -------------------------------------------------------------- | -------------------------------------------- | ------------------------- | ------------------------------------------- |
| Rest    | `inset 0 1px 0 white/20%, 0 1px 2px ink/12%, 0 1px 3px ink/6%` | `inset 0 1px 0 white/16%, 0 1px 2px ink/60%` | `0 1px 2px ink/8%`        | `inset 0 1px 0 white/6%, 0 1px 2px ink/60%` |
| Hover   | `inset 0 1px 0 white/20%, 0 2px 4px ink/12%, 0 1px 2px ink/6%` | `inset 0 1px 0 white/20%, 0 2px 4px ink/60%` | `0 2px 4px ink/10%`       | `inset 0 1px 0 white/8%, 0 2px 4px ink/60%` |
| Pressed | `inset 0 1px 2px ink/25%`                                      | `inset 0 1px 2px ink/45%`                    | `inset 0 1px 2px ink/10%` | `inset 0 1px 2px ink/50%`                   |

### B. Gentle gradient

The fill darkens towards the bottom edge, by 10% ink in light and 14% in dark. The top stop is the token itself, so the measured pair is the floor. On press the gradient flips. There are no shadows. The `background-image` sits over the token `background-color`.

| State          | Filled, light                 | Filled, dark                  | Outlined, light                | Outlined, dark                   |
| -------------- | ----------------------------- | ----------------------------- | ------------------------------ | -------------------------------- |
| Rest and hover | `to bottom, ink/0% → ink/10%` | `to bottom, ink/0% → ink/14%` | `to bottom, ink/0% → ink/3.5%` | `to bottom, white/5% → white/0%` |
| Pressed        | `to bottom, ink/10% → ink/0%` | `to bottom, ink/14% → ink/0%` | `to bottom, ink/3.5% → ink/0%` | `to bottom, ink/20% → ink/0%`    |

The dark outlined button is the only place where any variation puts a lighter stop behind a label. It's allowed there because the label is light on dark, so lighter makes the pair weaker but not by much (measured below). A lighter stop behind a white label is never allowed: even 4% white over `primary` drops `on-primary` to 4.37:1.

### C. Hairline bevel

Two inner 1px lines, lighter on top and darker at the bottom, with nothing outside the border box. On press the bevel inverts. Hover changes colour only.

| State          | Filled, light                                     | Filled, dark                                      | Outlined, light         | Outlined, dark                                   |
| -------------- | ------------------------------------------------- | ------------------------------------------------- | ----------------------- | ------------------------------------------------ |
| Rest and hover | `inset 0 1px 0 white/22%, inset 0 -1px 0 ink/20%` | `inset 0 1px 0 white/20%, inset 0 -1px 0 ink/30%` | `inset 0 -1px 0 ink/8%` | `inset 0 1px 0 white/8%, inset 0 -1px 0 ink/40%` |
| Pressed        | `inset 0 1px 0 ink/20%, inset 0 -1px 0 white/10%` | `inset 0 1px 0 ink/30%, inset 0 -1px 0 white/8%`  | `inset 0 1px 0 ink/10%` | `inset 0 1px 0 ink/40%, inset 0 -1px 0 white/5%` |

### D. Grounded (chosen)

Chosen with three changes from the exploration, all recorded in the button-depth decision and section 10: the shadow is removed on keyboard focus, the contrast themes and forced colours are flat, and it applies to the three existing kinds only.

An ambient drop shadow, plus a tinted 1px edge: darker at the bottom in light, lighter at the top in dark. Hover lifts the shadow a little, and pressing removes it and resets the edges.

| State   | Light (filled and outlined)                                                                                             | Dark (filled and outlined)                                                                         |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Rest    | `0 1px 2px ink/6%, 0 2px 6px -1px ink/12%`                                                                              | `0 1px 2px ink/60%`                                                                                |
| Hover   | `0 1px 2px ink/6%, 0 4px 10px -2px ink/12%`                                                                             | `0 2px 6px ink/60%`                                                                                |
| Pressed | `none`, edges back to the token                                                                                         | `none`, edges back to the token                                                                    |
| Edges   | `border-block-end-color: color-mix(in srgb, <edge> 65%, ink)`. With a transparent edge, that's ink at 35% over the fill | `border-block-start-color: color-mix(in srgb, <edge> 75%, white)`. The bottom keeps the token edge |

**Fixed in the prototype on 2026-10-01:** dark also darkened the bottom edge (`<edge> 60%` + black). Measured, that edge was 1.80–2.20:1 on `canvas`, `surface` and `surface-raised`. That breaks the DESIGN.md rule that a control's edge keeps 3:1 (1.4.11), and contradicts the variation's own description ("in dark the top edge gets lighter instead"). The rule is now removed, and the bottom keeps the token edge.

### E. Tactile press

A 2px solid ledge in a darker shade of the fill. When pressed, the button moves down 2px onto the ledge, and a `::before` hit area grows upwards by the same 2px, so a press near the top edge still fires. The focus ring offset is 4px (2px past the ledge), because the ring against the ledge would be 1.70:1.

| State          | Filled, light                                                 | Filled, dark                                                  | Outlined, light                              | Outlined, dark                                               |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| Rest and hover | `inset 0 1px 0 white/14%, 0 2px 0 color-mix(<fill> 65%, ink)` | `inset 0 1px 0 white/16%, 0 2px 0 color-mix(<fill> 55%, ink)` | `0 2px 0 color-mix(<edge> 40%, transparent)` | `inset 0 1px 0 white/6%, 0 2px 0 color-mix(<edge> 50%, ink)` |
| Pressed        | `inset 0 1px 1px ink/20%`, `translateY(2px)`                  | `inset 0 1px 1px ink/50%`, `translateY(2px)`                  | `inset 0 1px 1px ink/8%`, `translateY(2px)`  | `inset 0 1px 1px ink/50%`, `translateY(2px)`                 |

The ledge follows the fill on hover (`<fill>` is the current fill), so it darkens along with the fill.

### Measured contrast

Measured on 2026-10-01 with `packages/theme/src/contrast.ts`. Alpha layers were composited in sRGB over the background the label or edge actually sits on (`/tmp` script, not committed). "Worst stop" means the lowest pair anywhere the label or edge can sit.

**Labels (4.5:1, 7:1 in the contrast themes).** Only B puts a non-token colour behind the label. In A, C, D and E the effects are within 3px of the border, and the label has at least 8px of block padding, so the label always sits on the flat token.

| Pair                                                               | Light | Dark  | Light-contrast | Dark-contrast | Variations            |
| ------------------------------------------------------------------ | ----- | ----- | -------------- | ------------- | --------------------- |
| `on-primary` / `primary` (worst for every variation)               | 4.70  | 4.70  | 9.89           | 11.14         | all, and B's top stop |
| `on-primary` / `primary-hover`                                     | 5.91  | 5.91  | 12.65          | 13.97         | all                   |
| `on-secondary`* / `secondary`                                      | 4.98  | 4.98  | 10.86          | 14.28         | all (proposed kind)   |
| `link` / `surface-raised` (primary outlined*)                      | 5.91  | 6.14  | 9.89           | 9.40          | all (proposed kind)   |
| B, filled bottom stop: `on-primary` / `primary` + ink              | 5.44  | 5.98  | flat           | flat          | B                     |
| B, outlined bottom stop: `link` / white + 3.5% ink                 | 5.51  | –     | flat           | flat          | B (proposed kind)     |
| B, outlined hover: `link-hover` / `primary-subtle` + 3.5% ink      | 5.84  | –     | flat           | flat          | B (proposed kind)     |
| B, dark outlined top stop: `link` / `surface-raised` + 5% white    | –     | 5.36  | flat           | flat          | B (proposed kind)     |
| B, dark outlined top stop: `text` / `surface-raised` + 5% white    | –     | 14.45 | flat           | flat          | B                     |
| B, dark outlined hover: `link-hover` / `primary-subtle` + 5% white | –     | 6.37  | flat           | flat          | B (proposed kind)     |

So the worst label pair in every variation is the existing `on-primary` on `primary`, at 4.70:1. B never goes below it: its darker stops raise the pair, and the lighter dark-outlined stop costs `link` 0.78 (6.14 down to 5.36).

**Edges and boundaries (3:1).**

| Pair                                                  | Light                      | Dark                       | Notes                                                                                     |
| ----------------------------------------------------- | -------------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| `secondary` edge on canvas / surface / surface-raised | 4.98 / 4.68 / 4.98         | 4.19 / 3.83 / 3.54         | Unchanged in every variation                                                              |
| `primary` edge or fill on the same                    | 4.70 / 4.42 / 4.70         | 4.44 / 4.05 / 3.75         | Unchanged                                                                                 |
| `primary-hover` fill on `surface-raised`              | 5.91                       | **2.98**                   | Why the hover keeps a `primary` edge                                                      |
| `secondary-hover`* fill on `surface-raised`           | 6.21                       | **2.83**                   | The same fix: the proposed filled secondary keeps a `secondary` edge on hover             |
| D, light bottom edge (tinted darker)                  | ≥ 7.51                     | –                          | Only raises the boundary                                                                  |
| D, dark top edge (tinted lighter)                     | –                          | ≥ 5.78                     | Only raises the boundary                                                                  |
| D, dark bottom edge as first prototyped (now removed) | –                          | 1.80–2.20                  | Fixed: see D                                                                              |
| E, ledge on canvas                                    | 7.99 filled, 1.71 outlined | 2.01 filled, 1.80 outlined | Decorative, outside the border. The edge or fill carries the boundary at the values above |

**Focus ring (3:1 against adjacent colours).**

| Variation      | Light, canvas / surface                                                                                 | Dark, canvas / surface                        |
| -------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Baseline, B, C | 4.70 / 4.42                                                                                             | 7.27 / 6.64                                   |
| A and D        | **3.23 / 3.04** against the shadowed gap (hover, every shadow layer at full alpha); 3.63 / 3.42 at rest | 7.27 / 6.64 (a shadow on black can't be seen) |
| E (4px offset) | 4.70 / 4.42 (the ring never touches the ledge; ring against ledge would be 1.70)                        | 7.27 / 6.64                                   |

### Modes per variation

| Variation | Dark                                                                                                  | Contrast themes (proposed)                                                                 | Forced colours                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| A         | Highlight does the work. The shadow is invisible on near-black, so dark A ≈ C plus an inner highlight | Flat                                                                                       | Shadows dropped. `ButtonFace`, a 1px `ButtonText` edge, a `Highlight` edge on hover and pressed. The same as today |
| B         | Darker bottom on filled. Outlined gets a lighter top: the only lighter stop anywhere                  | Flat                                                                                       | Gradient dropped. The same as today                                                                                |
| C         | Works the same, and matches "raised gets lighter": the cue is a lighter top line, not a shadow        | Flat                                                                                       | Inset lines dropped. The same as today                                                                             |
| D         | Lighter top edge plus an invisible shadow. The weakest dark result after the fix                      | Flat, with the token edge on all four sides                                                | Shadow dropped, and the edges become `ButtonText`. The same as today                                               |
| E         | The ledge reads as a darker shelf. Visible, but it doesn't add contrast                               | Flat, no ledge. The prototype keeps the 2px move and the 4px ring offset (open question 3) | Ledge dropped. **The 2px move on press stays**, so pressed keeps a non-colour cue. The 4px ring offset stays       |

- **RTL:** every effect is vertical (block axis), so nothing mirrors.
- **320px, 400% zoom, text spacing:** no size change. Labels wrap as today. E's ledge adds 2px below, and the pressed move must not clip inside `overflow: hidden` parents.
- **Reduced motion:** every variation becomes an instant state change. E's 2px move stays, but instantly: a state change, not an animation (2.3.3 is AAA, and the move is 2px).

### Trade-offs

| Variation | Reads as a button                          | Fit with DESIGN.md                                                                            | Risks                                                                                                                                                        |
| --------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A         | Clearly, in light. Weak in dark            | Breaks "surfaces instead of shadows" for a level-0 control. Dark relies on the highlight      | The ring on a shadowed gap drops to 3.04:1 on `surface`. A rebranded `primary` scale can fall below 3:1 there, and `theme:check` doesn't measure shadow gaps |
| B         | Subtly. The least noticeable on outlined   | Conflicts with the Don't "add gradients … behind text", even though it only darkens           | Rebrands and the 4% white trap: any future lighter stop behind a white label fails. Gradients band on some screens                                           |
| C         | Subtly but crisply. Works the same in dark | The closest to "precise, hairline". The dark cue is "lighter top", which is today's dark rule | The least obvious of the five. The outlined light bevel (8% ink) is nearly invisible on its own                                                              |
| D         | Clearly, in light. Weakest in dark         | Breaks "surfaces instead of shadows". Also brings tinted edges (`color-mix` on edges)         | The same ring-gap risk as A. Tinted edges complicate rebrands. The dark bottom edge already failed once                                                      |
| E         | The most obvious. Proven on GOV.UK         | Needs a new focus offset for buttons and a new "pressed moves" rule                           | The move can jitter in sticky footers and button groups. The 2px ledge breaks baseline alignment with inputs (44px plus 2px). The strongest visual change    |

### Recommendation

> **Outcome:** the owner chose D, not the recommended C. D's two risks below are addressed in the button-depth decision: the ring-over-shadow pair goes away because the shadow is removed on keyboard focus, and the tinted edges get their own `theme:check` pairs, so rebrands are measured. D's weak dark result stays a known trade-off for usability testing.

The designer's recommendation before the decision: **C, Hairline bevel**, and if the owner wants a stronger cue in light, add **A's rest shade (`0 1px 2px ink/8–12%`) in light only**, with no hover lift.

Why C:

- Nothing paints outside the border box, so the focus ring keeps today's measured pairs (4.70 and 7.27) and `theme:check` stays the whole truth. A, D and E all add a pair that `theme:check` can't see.
- Labels never sit on anything but the measured token.
- In dark the cue is a lighter top line, which is the existing "raised gets lighter" rule, not a shadow.
- It degrades to exactly today's button in forced colours and (proposed) in the contrast themes.
- It's the smallest token addition (see below), and hover stays a pure colour change.

E is the strongest affordance and has public-sector precedent. If research shows C isn't recognised as a button by low-confidence users, test E next, not A, B or D. Its costs are in layout (the ledge and the move), not in contrast.

Not recommended: B (it conflicts with an explicit Don't, for the smallest gain) and D (the weakest in dark, with tinted edges that already broke 3:1 once).

### DESIGN.md rules that would change

| Rule today                                                                                                                                                       | A                                         | B                            | C                                  | D                                 | E                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------- | ---------------------------------- | --------------------------------- | ------------------------- |
| Overview and Elevation: "a ladder of slightly lifted surfaces instead of shadows" and "Depth comes from the surface ladder … not from shadows. The look is flat" | Yes                                       | Reword ("flat" fills)        | Reword (inner lines on controls)   | Yes                               | Yes                       |
| Elevation table: controls have no level. Shadows exist only at levels 3 and 4                                                                                    | Add a control level with a shadow         | –                            | Add a control "bevel" (inset only) | Add a control level with a shadow | Add a control ledge       |
| Colors: "Dark themes are not inverted light themes. Raised surfaces get lighter, not shadowed"                                                                   | Exception: a dark drop shadow (invisible) | Exception: a darker gradient | Holds                              | Exception: a dark drop shadow     | Exception: a darker ledge |
| Do's and Don'ts: "Add gradients, glows or glass effects behind text"                                                                                             | –                                         | **Conflicts**                | –                                  | –                                 | –                         |
| Do's and Don'ts: "rely on … a shadow … to show focus" (still holds: focus stays an outline)                                                                      | –                                         | –                            | –                                  | –                                 | –                         |
| Focus: 2px ring with a 2px offset                                                                                                                                | –                                         | –                            | –                                  | –                                 | 4px offset on buttons     |
| Components, Buttons: add "buttons have gentle depth; disabled is always flat; the contrast themes are flat"                                                      | Yes                                       | Yes                          | Yes                                | Yes                               | Yes                       |
| Components, Cards: "never interactive: no hover, shadow" (holds, and gets stronger: depth now means "press me")                                                  | –                                         | –                            | –                                  | –                                 | –                         |

### New or changed tokens (each needs the maintainer's approval and `theme:check` coverage)

| Token                                                                                                                        | Needed by                        | Value per theme                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--kv-shadow-button-filled`, `-filled-hover`, `-filled-active`                                                               | A, C, D, E                       | Light and dark from the tables above. `none` in both contrast themes                                                       |
| `--kv-shadow-button-outline`, `-outline-hover`, `-outline-active`                                                            | A, C, D, E                       | The same                                                                                                                   |
| `--kv-gradient-button-filled`, `-filled-active`, `-outline`, `-outline-active`                                               | B                                | The same                                                                                                                   |
| `--kv-button-edge-shade` (light, end edge) and `--kv-button-edge-highlight` (dark, start edge) as mix percentages or colours | D                                | Light: 35% ink. Dark: 25% white. Contrast themes: off                                                                      |
| `--kv-button-press-offset`                                                                                                   | E                                | `2px`. Possibly `0px` in the contrast themes (open question 3)                                                             |
| `--kv-button-focus-ring-offset`                                                                                              | E                                | `calc(var(--kv-focus-ring-offset) + var(--kv-button-press-offset))`                                                        |
| `--kv-color-secondary-hover`, `--kv-color-on-secondary`                                                                      | Filled secondary (any variation) | Section 6 shared table. Measured: 4.98 / 6.21 (light, dark), 10.86 / 15.33 (light-contrast), 14.28 / 16.55 (dark-contrast) |

For C alone, that's six `--kv-shadow-button-*` values per theme, and only four of them are distinct, because hover equals rest. For A or D it's six distinct values. `theme:check` should also gain a check for the focus ring against the composited shadow gap if A or D is chosen.

## 7. Accessibility annotations

- Names, roles, keyboard and focus moves don't change. It's still a native `<button>`. The `button.a11y.md` contract is unaffected, except for the visual rows.
- **1.4.3 / 1.4.6:** labels stay on the measured tokens (the worst is 4.70:1). B's other stops are at least 5.36:1.
- **1.4.11:** edges and fills keep their measured 3:1. Depth is never the only boundary: in forced colours and the contrast themes it's gone, and the button is today's button.
- **2.4.7 / 2.4.13 (AAA, the default theme's target):** focus is still the 2px outline. Depth never shows focus. In A and D the ring's adjacent colour drops to 3.04:1 (the reason for the recommendation).
- **2.4.11:** E's move and ledge never cover the ring (the 4px offset).
- **2.5.8:** at least 44px high in every variation. E's hit area follows the pointer during the move.
- **Pressed is a visual state only.** It is not `aria-pressed`, which belongs to toggle buttons.

## 8. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`. One blocker was found and fixed in the prototype (D dark bottom edge, 1.80–2.20:1).
- [x] Contrast of every new colour pair measured (section 6)
- [x] D's final values re-measured on 2026-10-01 with `packages/theme/src/contrast.ts` (section 10)
- [ ] `vp run theme:check` on an implemented theme: `pending` (nothing is implemented yet)
- [ ] Usability test plan written. Result: `pending`

### Usability test plan (`pending`, not run)

- **Participants:** 8–10 residents. At least two people with low digital confidence, two aged 70 or over, one magnification user, one screen-reader user (as a control for no visual change), one Windows contrast-theme user, two second-language users, and one person with a cognitive disability. 3–5 staff for the dense views.
- **Tasks:** on a realistic step page in sv or fi (with text, a card, a link, a badge and two buttons), "Send the application" and "Go back and change your address". A first-click test on static images of baseline, C and E in light and dark, in randomised order.
- **What we measure:** first-click accuracy on the primary action, time to first click, mis-clicks on cards or badges, and whether participants call the secondary button "a button". A preference is recorded but doesn't decide.

## 9. Open questions

1. ~~**Which variation, if any?**~~ Resolved 2026-10-01: D, Grounded. The usability test should now compare today's flat button with D.
2. **New button kinds (still open, out of scope for the button-depth decision).** The prototype shows a filled secondary and an outlined primary because the request named them. Neither exists today. Do we want them (new classes, plus `secondary-hover` and `on-secondary`)? An outlined primary next to a filled primary weakens "one primary button per view". A grey filled secondary must stay distinct from disabled, which it does today through its fill, white label and solid edge.
3. ~~**Contrast themes flat?**~~ Resolved for D: the contrast themes are fully flat. The rest of this question only applied to E. The proposal is that `prefers-contrast: more` users get no shadows, highlights, gradients or tinted edges. For E, the prototype drops the ledge but keeps the 2px move on press, which is a non-colour pressed cue. Keep the move, or make the contrast themes fully static? Confirm.
4. ~~**The DESIGN.md change and the decision.**~~ Done for D: The button-depth decision (Proposed) and `DESIGN.md` "Button depth". The engineering plan is next (section 10). No ring-on-shadow pair is needed: the shadow is removed on keyboard focus.
5. **Prior art.** Should Designsystemet (NO) and the Suomi.fi design system buttons be checked before the decision? They weren't reviewed here.
6. **Inputs and other controls.** `DESIGN.md` now says depth means only "a button" (a new Don't). If selects, checkboxes or segmented controls should follow, that's a new decision outside this brief.
7. **Touch hover.** On touch screens `:hover` can stick after a tap, so a tapped button keeps the hover shadow (as it keeps the hover fill today). Gate hover depth behind `@media (hover: hover)`? Not decided, and it applies to today's hover fill too.
8. **Dark result.** D's cue is weakest in dark. If the usability test shows dark users don't see it, consider a slightly stronger highlight (it only raises contrast), measured before any change.

## 10. Handoff to engineering (variation D)

The decision is the button-depth decision (Proposed), and the rules are in `DESIGN.md`, "Elevation & Depth" → "Button depth". This section is what the plan needs. It's the default theme only: no change to `@kvirn-ui/react`, the a11y contract's behaviour rows, or i18n (no new strings).

### Scope

- In: `.kv-button` (the base or secondary look), `kv-button--primary` and `kv-button--danger`, in every state, including `kv-button--icon-only` (it's a `.kv-button`).
- Out: new kinds (a filled secondary, an outlined primary: open question 2), links, navigation items, cards, inputs, and the forced-colours hover defect of the primary hover edge (separate fix, but don't make it worse).

### Tokens (`packages/theme/theme.css`)

Declare all four in every theme block, the OS fallbacks in section 4 included, so each fallback equals its theme.

| Where                                                                                                         | Values                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Section 2, `:root` (light), next to `--kv-shadow-popup`                                                       | `--kv-shadow-button: 0 1px 2px color-mix(in srgb, var(--kv-neutral-950) 6%, transparent), 0 2px 6px -1px color-mix(in srgb, var(--kv-neutral-950) 12%, transparent);`<br>`--kv-shadow-button-hover: 0 1px 2px color-mix(in srgb, var(--kv-neutral-950) 6%, transparent), 0 4px 10px -2px color-mix(in srgb, var(--kv-neutral-950) 12%, transparent);`<br>`--kv-button-edge-shade: var(--kv-neutral-950) 35%;`<br>`--kv-button-edge-highlight: var(--kv-white) 0%;` |
| Section 3 `:root[data-kv-color-scheme='dark']`, and its section 4 fallback                                    | `--kv-shadow-button: 0 1px 2px color-mix(in srgb, var(--kv-black) 60%, transparent);`<br>`--kv-shadow-button-hover: 0 2px 6px color-mix(in srgb, var(--kv-black) 60%, transparent);`<br>`--kv-button-edge-shade: var(--kv-neutral-950) 0%;`<br>`--kv-button-edge-highlight: var(--kv-white) 25%;`                                                                                                                                                                  |
| Section 3, both `[data-kv-contrast='more']` blocks, their section 4 fallbacks, and section 5 (forced colours) | `--kv-shadow-button: none;`<br>`--kv-shadow-button-hover: none;`<br>`--kv-button-edge-shade: var(--kv-neutral-950) 0%;`<br>`--kv-button-edge-highlight: var(--kv-white) 0%;`                                                                                                                                                                                                                                                                                       |

The light-contrast block must set them explicitly: today it inherits the light `:root` shadows (it does for `--kv-shadow-popup`), and buttons there must be flat.

The edge tokens are a colour and a percentage, the second argument of `color-mix(in srgb, <edge>, <token>)`. `0%` returns `<edge>` unchanged, a transparent edge included.

### Selectors (section 7)

The idea: every state sets one internal property, `--kv-button-edge` (declared on `.kv-button`, like `--kv-card-padding` on `.kv-card`), and the base rule derives the four edges from it. **Only the pressed, disabled and forced-colours rules may set `border-color` directly**, because a later `border-color` overrides the tinted longhands.

| Selector (today's, in section 7)                                                                            | Gets                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.kv-button`                                                                                                | `--kv-button-edge: var(--kv-color-secondary)`; `border: var(--kv-border-width) solid var(--kv-button-edge)`; `border-block-start-color: color-mix(in srgb, var(--kv-button-edge), var(--kv-button-edge-highlight))`; `border-block-end-color: color-mix(in srgb, var(--kv-button-edge), var(--kv-button-edge-shade))`; `box-shadow: var(--kv-shadow-button)` |
| `.kv-button:not(:disabled, [data-disabled]):hover`                                                          | `--kv-button-edge: var(--kv-color-primary)`; `background-color: var(--kv-color-primary-subtle)`; `box-shadow: var(--kv-shadow-button-hover)`                                                                                                                                                                                                                 |
| `.kv-button:not(:disabled, [data-disabled]):active` (split from hover, after it)                            | `--kv-button-edge: var(--kv-color-primary)`; `background-color: var(--kv-color-primary-subtle)`; `box-shadow: none`; `border-color: var(--kv-button-edge)` (all four sides, untinted)                                                                                                                                                                        |
| `.kv-button:not(:disabled, [data-disabled]):is(:focus-visible, [data-focus-visible])`, after the hover rule | `box-shadow: none`. The outline stays in today's focus rule. It must beat hover (same specificity, later), and the pressed rule's `border-color` must still apply when focused and pressed                                                                                                                                                                   |
| `.kv-button.kv-button--primary`                                                                             | `--kv-button-edge: transparent` instead of `border-color: transparent`                                                                                                                                                                                                                                                                                       |
| `.kv-button.kv-button--primary:not(…):is(:hover, :active)`                                                  | `--kv-button-edge: var(--kv-color-primary)` instead of `border-color` (the primary hover edge is unchanged)                                                                                                                                                                                                                                                  |
| `.kv-button.kv-button--danger` and its hover rule                                                           | `--kv-button-edge: transparent` instead of `border-color: transparent`                                                                                                                                                                                                                                                                                       |
| `.kv-button:is(:disabled, [data-disabled])`                                                                 | Today's rule plus `box-shadow: none`. Its `border-color` already resets all four edges. It must come after every state rule that sets `box-shadow`                                                                                                                                                                                                           |
| `@media (prefers-reduced-motion: no-preference) .kv-button`                                                 | `transition-property: background-color, border-color, color, box-shadow`. Nothing under `reduce`                                                                                                                                                                                                                                                             |
| `@media (forced-colors: active)`, the three button rules                                                    | Add `box-shadow: none`. Their `border-color` shorthand must win over the tinted longhands in every state (check specificity and order against the variant rules)                                                                                                                                                                                             |

Resulting edges, for the stories and tests:

| Kind    | State        | Light: top and sides; bottom                   | Dark: top; sides and bottom                      |
| ------- | ------------ | ---------------------------------------------- | ------------------------------------------------ |
| Base    | Rest         | `secondary`, `secondary` + 35% ink (`#4b4e55`) | `secondary` + 25% white (`#90949b`), `secondary` |
| Base    | Hover, focus | `primary`, `primary` + 35% ink (`#424b8e`)     | `primary` + 25% white (`#868fdd`), `primary`     |
| Primary | Rest         | transparent, fill + 35% ink (`#424b8e`)        | fill + 25% white (`#868fdd`), transparent        |
| Primary | Hover, focus | `primary`, `primary` + 35% ink (`#424b8e`)     | `primary` + 25% white (`#868fdd`), `primary`     |
| Danger  | Rest         | transparent, fill + 35% ink (`#7a1f2f`)        | fill + 25% white (`#ffa7b3`), transparent        |
| Danger  | Hover, focus | transparent, fill + 35% ink (`#671a28`)        | fill + 25% white (`#ffc6ce`), transparent        |
| Any     | Pressed      | the state's token edge on all four sides       | the same                                         |
| Any     | Disabled     | dashed `border-control` on all four sides      | the same                                         |

### What `theme:check` must additionally measure

Extend `checkThemeCss()` (`packages/theme/src/`), not just a repo test, so a rebranded copy is checked too (`DESIGN.md`, Rebranding).

1. **Parse the edge tokens** in all four themes, from attributes and from the system fallbacks: after `var()` resolution, each must match `<#rgb or #rrggbb> <number>%`, and the system fallback must equal the theme. Report anything else, as the hex check does for `--kv-color-*`.
2. **Compute each tinted edge** as an sRGB mix: per channel, `base × (1 − p) + partner × p` on the 0–255 values, rounded. That's what `color-mix(in srgb, …)` does for an opaque edge, and what compositing the partner at `p` over the fill does for a transparent edge.
3. **Require 3:1** for each tinted edge against `canvas`, `surface` and `surface-raised`, in all four themes. The bases are `secondary` (base at rest), `primary` (base hover, primary at rest and on hover), `danger` and `danger-hover` (danger fills), each tinted with the shade and with the highlight: 4 × 2 × 3 = 24 pairs per theme, 96 in all. At `0%` the result is the token, already required.

Expected values are in the "Resulting edges" table and in `DESIGN.md`. The lowest is 5.78:1 (dark, base at rest, on `surface-raised`).

No ring-over-shadow pair is needed: the shadow is `none` on keyboard focus, so the ring's existing `focus-ring` pairs stay the whole truth (4.70 / 4.42 / 4.70 in light and 7.27 / 6.64 / 6.14 in dark, on `canvas` / `surface` / `surface-raised`).

### Tests the plan must include

- **Theme tests** (`theme-css.test.ts`): the fallbacks equal their themes, and every tinted edge keeps 3:1 on canvas, surface and surface-raised. The token values and the flat contrast and forced-colours rules are reviewed in Storybook, not tested (AGENTS.md rule 13).
- **e2e** (`apps/storybook/src/components/button/button.e2e.ts`), for each kind, asserts the WCAG outcome and never the look (the shadow, the tinted edges and the transitions are reviewed by eye in Storybook, `testing` skill):
  - **Keyboard focus (2.4.7):** Tab to the button, then the outline is not `none`.
  - **Forced colours (1.4.11):** the border is not `none` and has a width, at rest and when disabled.
- **Stories:** each kind in rest, hover, pressed, focus-visible, focus-visible plus hover, and disabled, on `canvas`, `surface` and `surface-raised`, in all four themes plus forced colours and RTL. Look at them: the depth is subtle, and axe can't judge it.

### Docs

- `theme.css` comments: section 7's header (depth, and the "only pressed, disabled and forced colours set `border-color`" rule), and section 2's comment next to the new tokens.
- `packages/theme/README.md`: the four tokens, and how to turn depth off.
- `DESIGN.md`, when it ships: drop "Not yet in `theme.css`" from "Button depth", and "not yet by `theme:check`" from Colors, and update the pair count.
- A changeset for `@kvirn-ui/theme` (a visible change to every button).
