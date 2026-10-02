# ADR-0049: The file upload drop zone has a dashed edge, the one that doesn't mean disabled

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike (accepted in principle, design spec `docs/design/file-upload.md` §9 Q7, pending this ADR and `theme:check`)
- **Tags:** design | theming | a11y

## Context

DESIGN.md uses a dashed edge as the non-colour cue for **disabled** controls (buttons, inputs). The FileUpload drop zone (ADR-0038, Plan 0021) needs an edge too, and the dashed box is the convention residents already know from other services: it says "drop a file here". Two readings of one edge on one page would collide, for example when the Trigger inside a droppable zone is disabled at the file limit, and both are dashed.

## Decision drivers

- A drop target must look like one to a pointer user, in every theme and in forced colours.
- Disabled must stay recognisable (1.4.1: shape, not colour).
- No new token and no new colour pair (every pair is already required in `contrast-requirements.ts`).
- State is never colour alone: style, width and words change together.

## Options considered

### Option A: a solid edge for the drop zone

- ✅ Keeps "dashed means disabled" without exceptions.
- ❌ A solid box reads as a control or a card, and loses the convention, so residents are less likely to notice they can drop.

### Option B: a dashed edge for the drop zone, and a rule that says why it is the exception (chosen)

- ✅ Matches the convention (GOV.UK, Aksel and most upload patterns).
- ✅ The zone isn't a control: it is never focused or clicked, so there is no control to read as disabled. The button inside it carries the disabled look when it applies.
- ❌ One more rule to remember. The wording below limits it to the drop zone.

## Decision

We will use Option B. DESIGN.md (Components) gets one rule:

> **File upload.** A drop zone has a 1px dashed `border-control` edge at rest, and a 2px solid `primary` edge with a `primary-subtle` fill while a file is dragged over it. It's the one dashed edge that doesn't mean disabled: it's a target, not a control, and the button inside it carries the disabled look when it applies.

1. **Rest:** 1px dashed `border-control` on a transparent background, `md` radius. Drawn only with `data-droppable` (a precise pointer, or a file dragged over the page), and never when the Field is disabled.
2. **Dragging over the zone:** 2px solid `primary` with 1px less padding (so nothing moves) and the `primary-subtle` fill, and the hint's words change. Style, width and text change, so it never relies on colour.
3. **Invalid:** 2px solid `danger`, with 1px less padding, only where the box is drawn. The error text and icon carry it where there is no box.
4. **Forced colours:** dashed `CanvasText` at rest, solid 2px `Highlight` while dragging (an explicit `forced-colors` rule), solid 2px `CanvasText` when invalid. The fill is lost, and style, width and words carry the state.
5. **Scope:** only the drop zone. Any other control keeps "dashed means disabled".
6. **Fill.** `primary-subtle` as the drag fill is a state fill, like the navigation item's current state and a button's hover. It isn't a status background, so the Don't about `-subtle` backgrounds (which is about status colour on surfaces) isn't changed.

## Accessibility impact

- Positive: no state depends on colour alone, the dragged state survives forced colours, and the drop zone is never the only way to add a file (the Trigger is, 2.5.7).
- Contrast: no new pair. The lowest are `primary` on `primary-subtle` (3.32:1 in dark, needs 3:1) and the secondary Trigger's edge on that fill (3.13:1), both already in `contrast-requirements.ts` and enforced by `theme:check`. A rebrand of `--kv-primary-*` breaks them first.
- Risk: a dashed disabled Trigger inside a dashed zone looks alike. The words ("Välj filer", the Summary that says the limit is reached) and `aria-disabled` carry the meaning, not the edge alone.

## Consequences

- Positive: a familiar drop target, with every state carried by more than colour.
- Negative: DESIGN.md has one exception to the dashed rule.
- Follow-ups: the orchestrator runs `vp run theme:check` once the theme section lands. A usability check that pointer users find the zone (design spec §8).

## References

- `docs/design/file-upload.md` §6.1, §6.3, §6.4, §9 Q7, ADR-0038, ADR-0013 (classes and data attributes), DESIGN.md (Components, Buttons)
