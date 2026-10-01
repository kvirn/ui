# Plan 0010: Button depth ("Grounded")

- **Status:** Done. The owner accepted the visual result on 2026-10-02 and skipped the reviews below
- **Owner:** main session → component-engineer
- **Created:** 2026-10-01 · **Target:** next `@kvirn-ui/theme` minor
- **Related:** ADR-0026 (Proposed), design spec [`docs/design/button-depth.md`](../design/button-depth.md) (section 10 is the handoff), prototype `docs/design/prototypes/button-depth.html`

## Goal

Buttons in the default theme read as pressable objects: a gentle ambient shadow and a tinted 1px edge (darker bottom in light, lighter top in dark). The shadow lifts on hover and disappears when the button is pressed or focused. Users who choose contrast themes or forced colours keep today's flat button.

## Non-goals

- New button kinds (filled secondary, outlined primary). These are an open question for the owner.
- Depth on other controls (inputs, selects, checkboxes, cards, links, navigation).
- Fixing the ADR-0021 forced-colours hover defect. This change must not make it worse.
- Any change to `@kvirn-ui/react`, the a11y contract's behaviour rows or i18n. There are no new strings.

## Background

The owner chose variation D from five prototypes. The rules are in `DESIGN.md` → "Elevation & Depth" → "Button depth". The tokens, selectors, expected edge colours and contrast are in spec section 10, and that section is the source of truth for implementation.

## Design

### Theming surface

New tokens. Each one is declared in every theme block, the section 4 OS fallbacks and section 5 forced colours included:

| Token                        | light                                     | dark                       | contrast themes, forced colours |
| ---------------------------- | ----------------------------------------- | -------------------------- | ------------------------------- |
| `--kv-shadow-button`         | `0 1px 2px` ink 6%, `0 2px 6px -1px` 12%  | `0 1px 2px` black 60%      | `none`                          |
| `--kv-shadow-button-hover`   | `0 1px 2px` ink 6%, `0 4px 10px -2px` 12% | `0 2px 6px` black 60%      | `none`                          |
| `--kv-button-edge-shade`     | `var(--kv-neutral-950) 35%`               | `var(--kv-neutral-950) 0%` | `… 0%`                          |
| `--kv-button-edge-highlight` | `var(--kv-white) 0%`                      | `var(--kv-white) 25%`      | `… 0%`                          |

There is also an internal `--kv-button-edge` on `.kv-button`. Every state sets that property instead of `border-color`. Only the pressed, disabled and forced-colours rules set `border-color` directly.

### Accessibility contract (unchanged behaviour, new visual guarantees)

- The focus ring always sits on the plain background, because `box-shadow` is `none` on `:focus-visible` / `[data-focus-visible]`, hover included. Ring contrast is unchanged: at least 4.42:1 in light and 6.14:1 in dark (1.4.11, 2.4.7, 2.4.13).
- Every tinted edge keeps at least 3:1 against canvas, surface and surface-raised (1.4.11). The lowest is 5.78:1.
- Labels are unchanged. The lowest is still `on-primary` on `primary`, 4.70:1 (1.4.3).
- Disabled buttons, the contrast themes and forced colours are flat, and all four edges are equal.
- `box-shadow` only transitions under `prefers-reduced-motion: no-preference` (2.3.3).

## Tasks

- [x] Failing tests first: `theme-css.test.ts` (tokens in every theme, flat values in contrast and forced colours, fallbacks equal to their themes) and `check-theme` tests for the new edge pairs
- [x] Extend `checkThemeCss()`: parse the edge tokens, compute the sRGB mixes and require 3:1 against canvas, surface and surface-raised (96 pairs)
- [x] `packages/theme/theme.css`: tokens (sections 2–5), button rules (section 7) per the spec's selector table, and comments
- [x] e2e in `apps/storybook/src/components/button/button.e2e.ts`, per spec section 10 "Tests" (light, keyboard focus, dark, contrast themes, disabled, forced colours, reduced motion)
- [x] Stories: every kind at rest, with keyboard focus and disabled on all three surfaces, in all four themes (the four Vitest projects), in the `Depth` story. RTL and forced colours are covered by the general `RTL` and `ForcedColors` Button stories and by e2e forced-colors emulation. Hover, pressed and focus+hover can't be forced statically without a pseudo-state addon (a new dependency, so an ADR): `button.e2e.ts` covers them with real pointer and keyboard input, and they can be tried by hand in Storybook
- [x] Docs: `packages/theme/README.md` (tokens, how to turn depth off). Remove the "not yet in theme.css / not yet by theme:check" notes from `DESIGN.md` and update the pair count
- [x] Changeset for `@kvirn-ui/theme`
- [ ] accessibility-reviewer: APPROVE (skipped by the owner on 2026-10-02, not run)
- [ ] ux-designer review of the stories against `DESIGN.md` (skipped by the owner on 2026-10-02, not run)

## Risks & open questions

- **Cascade order.** Hover, focus, pressed, disabled and forced colours all touch `box-shadow` or the borders, so order and specificity are the main risk. The e2e tests pin each combination.
- **Rebrands.** A brand `--kv-primary-*` changes the tinted edges. `checkThemeCss()` covers this.
- Touch hover (gating hover behind `@media (hover: hover)`) is an open question for the owner and out of scope here.

## Testing strategy

The theme unit tests and `theme:check` cover tokens and contrast. Playwright reads computed styles for every state and theme. The depth is subtle and axe can't judge it, so a person (ux-designer review) must look at the stories.

## Rollout

`@kvirn-ui/theme` minor. Every button changes visually. Adopters can opt out by setting both shadows to `none` and both edge tokens to `0%`.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`). Gates 1–4 pass, except WebKit and mobile-safari e2e, which could not run on this host. Gate 6 (accessibility-reviewer) was skipped by the owner
- [x] Plan tasks ticked, `docs/roadmap.md` status updated, ADR-0026 stays Proposed until the owner accepts it
