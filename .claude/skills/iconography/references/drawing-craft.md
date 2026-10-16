# Drawing craft

Numbers that are fixed (grid, keylines, gaps, live area) are in `docs/design/icon.md` §6.1. This file is how to apply them. Coordinates for each named part are in `docs/design/icon-library.md` (the parts kit); the names here are the vocabulary.

## The parts kit

Build every icon from these. If you need something else twice, propose a part.

| Part               | Rule                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container          | A keyline shape, radius 2. Square, circle, octagon, triangle, portrait, landscape (x 3–21, y 5–19). Never a bare rectangle with sharp corners.                                                                                                                                                                                                                               |
| Arm                | A chevron or arrow-head arm: 45°, run 7, round cap. Every arrow, chevron and disclosure uses the same arm. A compound arm of run 4.5 is for tray and frame heads (upload, download, external).                                                                                                                                                                               |
| Shaft              | A straight stroke on a whole or half unit, 15 long for arrows, ending on the head's tip so the strokes join at one point.                                                                                                                                                                                                                                                    |
| Dot                | `M x y h.01`: a 0.01 round-capped segment. Never a filled circle.                                                                                                                                                                                                                                                                                                            |
| Tray               | The open bottom (sides x 4 and 20, floor y 20, radius 2). All upload, download, share and save icons.                                                                                                                                                                                                                                                                        |
| Text line          | A horizontal stroke, 6–7 long, 4 apart (3.5 merges at 16px). Lists, documents, messages and notes use the same lines.                                                                                                                                                                                                                                                        |
| Head and shoulders | One person: circle r 3.25 at 12,8 over a shoulder arc. Groups repeat it, offset, with the rear figure open so its stroke never touches the front.                                                                                                                                                                                                                            |
| Badge cut          | A modifier (plus, minus, check, cross, off) at the inline-end bottom of a host. The host stroke stops 2 units clear of the badge, drawn as open paths, never a mask. Badge glyphs are the small glyphs: the `add`, `close` and `check` parts at the one small-glyph scale (about 60%, snapped to the grid; coordinates in `icon-library.md`), the same as the status glyphs. |
| Slash              | (4.5,4.5) → (19.5,19.5), host broken 2 units each side. Only for "off" and "disabled".                                                                                                                                                                                                                                                                                       |

## Joints and corners

- **Join or keep the gap; no near-misses.** Strokes that meet share one coordinate, or cross. Strokes that don't touch keep at least 2 units edge to edge.
- **Radius is 2 on outer corners, 1 on small inner ones.** Nested corners are concentric: the inner radius is the outer radius minus the distance between them, never less than 1, and never a sharp inner corner on a rounded outer one.
- **Arcs, not splines.** Circles and corners are `a` arcs (r, 90° or 180°). A freehand curve is a design smell; if you need one, justify it in the construction note.
- **Sharp joins only at 90° or less**, and always round-joined. Never an acute sliver: a join under 45° fills in at 16px.

## Optical corrections (allowed, noted, small)

| Situation                                       | Correction                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Circle beside a square                          | Use the keylines: circle r 9 against square 16 wide. Never both at the same measured width.              |
| Triangle                                        | Full width (2.75–21.25), glyph about 1.4 above the centroid so it reads as centred.                      |
| Arrow or chevron (a shape pointing to one side) | Centre the painted box on 12,12, then shift up to 0.5 toward the tail so the point doesn't look cramped. |
| Diagonal strokes look lighter than horizontals  | Don't thicken. Lengthen the diagonal by up to 0.5, or add a join, to restore weight.                     |
| Dense lower half (bin, bag, cup)                | Lift the mass 0.5 to 1 so the optical centre sits at 12.                                                 |
| Thin extremes (a pin's point, a pencil's tip)   | Stop at the live-area edge (2 or 22) rather than overshoot; caps already add 0.75.                       |

Corrections are at most 0.5 unit, noted in the construction row, and applied to the whole family if one icon needs them.

## Detail budget

- At most 4 content strokes inside a container (the container is not counted).
- A feature narrower than the gap rule (2 units, 1.5 for a dot) is removed, not nudged.
- Prefer one clear silhouette to texture. Ribs, folds and lines exist only to separate two objects or to name the object (the bin's ribs, the page's fold).
- Reading order of the idea: silhouette first, then the one telling detail. If the silhouette alone is ambiguous, change the metaphor, not the detail count.

## Family consistency

- All icons in a family share container, arm, line length and dot position. Compare coordinates, not impressions.
- The same object keeps the same drawing in every compound: `document`, `document-add`, `document-check`, `document-search` all contain the identical document outline.
- Pairs that differ by one idea differ only in that idea (`eye`/`eye-off`, `bell`/`bell-off`).

## SVG file format

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="…"/>
</svg>
```

- One file per icon, `<name>.svg`, kebab-case, final newline, two-space indent, one element per line.
- Only `path`, `line`, `polyline`, `circle`, `ellipse`, `rect` as the spec allows; prefer `path`. Elements inherit all presentation attributes from the root.
- Path data: absolute `M`, then relative commands, 0.25 grid, at most two decimals, no redundant commands, closed shapes end in `Z`. Start top-left, run clockwise, so diffs stay readable.
- No `id`, `class`, `data-*`, `title`, `desc`, `xmlns:*` extras, comments, editor metadata, `transform`, `style`, `opacity`, `fill` on a shape, or a second colour.
