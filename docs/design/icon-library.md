# Icon library: grid, parts kit, file format and inventory

The construction facts for `@kvirn-ui/icons` (Plan 0124). The fixed numbers (grid, keylines, gaps, markup rules) are in [`icon.md` §6.1](icon.md#61-drawing-rules-for-the-built-ins); how to decide and check is the `iconography` skill. This file holds what the two share in practice: the grid files, the parts with their coordinates, the file format and the inventory.

## 1. The grid

Three files in `packages/icons/grid/`. They are design-tool assets, not icons: the generator reads only `svg/`.

| File                 | What it is                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `icon-grid.svg`      | The construction grid, 24 × 24 units (rendered at 960px). Import it as a locked bottom layer      |
| `icon-grid-fine.svg` | The 0.5 and 0.25 sub-grid only, transparent. Lay it over the grid when you place or check a point |
| `icon-template.svg`  | The starter: the root attributes from §6.1 and one empty `<path d=""/>`. Copy it for a new icon   |

**Layers in `icon-grid.svg`** (each is a named `<g>`, so Figma, Illustrator and Inkscape show them as layers):

| Layer                         | Colour  | Meaning                                                                                        |
| ----------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `grid-1-unit`                 | #e3e7ec | 1-unit lines, faint                                                                            |
| `centre-cross-and-diagonals`  | #c9d0d8 | x 12, y 12 and both 45° diagonals: the axes of symmetry and of every 45° stroke                |
| `circles-r3-r6`               | #c9d0d8 | Concentric guides for inner glyphs (pupil r 3, lens about r 6.5)                               |
| `keyline-circle-r9`           | #f29bb0 | The circle keyline, centre 12,12, r 9                                                          |
| `keyline-square`              | #86bdf7 | The square keyline, 4–20, radius 2                                                             |
| `keyline-octagon`             | #f5c287 | The octagon keyline (§6.1 vertices)                                                            |
| `keyline-triangle`            | #9fd69f | Apex 12,3.25, base y 20.25 from x 2.75 to 21.25                                                |
| `keyline-portrait`            | #c3a9f2 | x 5.5–18.5, y 3–21, radius 2                                                                   |
| `keyline-landscape`           | #7fd3cb | x 3–21, y 5–19, radius 2 (from the skill's kit; not yet in the §6.1 table, see open questions) |
| `centreline-limit-2.75-21.25` | dashed  | Where stroke centrelines must stay, so the painted edge stays inside the live area             |
| `live-area-2-22`              | #5b6573 | The live area. Nothing painted crosses it, caps and joins included                             |
| `corner-ticks`                | #5b6573 | Crop marks at the live-area corners, visible when the frame is hidden                          |
| `stroke-preview-1.5`          | grey    | A 1.5 band with round caps in the top margin: the painted width of one stroke                  |

**How to use it.** Draw at stroke 1.5 on the grid, from a keyline and the parts below. Keylines are the outer limits of a shape's centreline, not a size every icon must fill.

> **Align to the grid as best you can, always.** Every horizontal and vertical centreline sits on a whole or half unit. Every endpoint, corner and arc end sits on the 0.25 grid. Any exception is justified in the construction note (§5).

Known, accepted exceptions: a dot ends at `+0.01` (the dot part); the triangle keyline's base is y 20.25 and its sides are about 61.5°, both set by §6.1; an arc radius is a length, not a coordinate, and may have two decimals (`eye`, r 9.48).

## 2. Parts kit (with coordinates)

Derived from the 25 built-ins as redrawn in the pilot batch. Two icons that share an idea use the part at these coordinates, unchanged.

| Part                   | Coordinates                                                                                                                                                  | Used by                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Container, square      | 4–20, radius 2: `M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z`                                                                | `info`                                           |
| Container, square, low | The square with its top at y 5.5 (room for rings above): x 4–20, y 5.5–20, radius 2                                                                          | `calendar`                                       |
| Container, circle      | Centre 12,12, r 9, two half arcs from the top: `M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18Z`                                                                        | `success`, `language`                            |
| Container, octagon     | §6.1 vertices: `M8.5 3.5h7l5 5v7l-5 5h-7l-5-5v-7Z`                                                                                                           | `error`                                          |
| Container, triangle    | §6.1: `M12 3.25l9.25 17h-18.5Z`                                                                                                                              | `warning`                                        |
| Page                   | Portrait x 5.5–18.5, y 3–21, radius 2, top inline-end corner cut 5 × 5. Fold (13.5,3) → (13.5,8) → (18.5,8)                                                  | `document`                                       |
| Sheet pair             | Two 11.5 sheets, radius 2, offset 4.5: front x 4–15.5, y 8.5–20; back x 8.5–20, y 4–15.5, open, joining the front's straight edges                           | `copy`                                           |
| Frame (open)           | x 4–17, y 7–20, radius 2, open at the top inline-end corner: top edge stops at x 11, end edge starts at y 13                                                 | `external`                                       |
| Arm                    | 45°, run 7 on each axis (true length 9.9): `chevron-down` (5,8.5) → (12,15.5) → (19,8.5). The four chevrons are this one rotated about 12,12                 | chevrons, arrow heads                            |
| Arrow                  | The arm plus a shaft. Shaft (4.5,12) → (19.5,12), 15 long; head (12.5,5) → (19.5,12) → (12.5,19). The shaft ends on the tip (shared coordinate)              | `arrow-forward`, `arrow-back`                    |
| Arrow, compound        | Inside a compound the arrow is smaller. Vertical shaft x 12, y 4 → 15.5 (11.5); arm run 4.5 (true 6.36). On a 45° arrow, the head's H/V legs are 6.5         | `upload`, `download`, `external`                 |
| Tray                   | Sides x 4 and 20 from y 15, floor y 20, radius 2: `M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3`                                                                | `upload`, `download`                             |
| Check                  | (4.5,12) → (9.5,17) → (19.5,7): legs 5 and 10, both at 45°, ratio 1:2                                                                                        | `check`                                          |
| Cross and plus         | × (6,6) → (18,18) and (18,6) → (6,18), 12 across. + 14 long, (12,5) → (12,19) and (5,12) → (19,12), to match the ×'s diagonal                                | `close`, `add`                                   |
| Status glyph           | Inside a status container, never the full-size part. × 6 across, (9,9) → (15,15) (50% of `close`). Check (7.5,12) → (10.5,15) → (16.5,9) (60%, legs 3 and 6) | `error`, `success`                               |
| Stem                   | A vertical stroke on x 12 under or over a dot: `info` y 11 → 16.5, `warning` y 10 → 13                                                                       | `info`, `warning`                                |
| Dot                    | `M x y h.01`, never a filled circle. **Clear of its stem by 2** (the rule's minimum is 1.5, but 1.5 straddles a pixel at 16px and fills in)                  | `info` (12,7.5), `warning` (12,16.5), `calendar` |
| Dot row                | Dots 4 apart: (8,15), (12,15), (16,15)                                                                                                                       | `calendar`                                       |
| Rule line              | A full-width horizontal x 4 → 20: `menu` y 6, 12, 18 (6 apart); `calendar` header y 10.5; `delete` lid y 6.5                                                 | `menu`, `calendar`, `delete`                     |
| Text line              | 6 long, x 9 → 15, **4 apart**: `document` y 12.5 and 16.5                                                                                                    | `document`                                       |
| Lens                   | Circle centre 10.5,10.5, r 6.5; handle 45° from (15.25,15.25) to (20.25,20.25), starting inside the ring's stroke                                            | `search`                                         |
| Eye                    | Almond of two arcs r 9.48 through (3,12) and (21,12), apex y 5.5 and 18.5; pupil r 3 at 12,12 (gap to the lids exactly 2)                                    | `eye`, `eye-off`                                 |
| Slash                  | (4.5,4.5) → (19.5,19.5). The host breaks so its end caps clear the slash's edge by at least 2 (centreline at least 3.5 from the slash line)                  | `eye-off`                                        |
| Handle (small)         | Radius 1 corners: `delete` x 9.5–14.5, up to y 4                                                                                                             | `delete`                                         |
| Badge cut              | Not in the 25 yet. Proposed for the first host that needs it: badge glyph centred on (17.5,17.5), 7 across (`add` at 50%), host broken 2 clear               | none yet                                         |
| Head and shoulders     | Not in the 25 yet. The skill's start: circle r 3.25 at 12,8 over a shoulder arc                                                                              | none yet                                         |

**Radius.** 2 on containers, pages, sheets, frames and the tray. 1 on small inner corners: the bin handle and the bin foot (§6.1).

**Where today's built-ins disagreed with each other** (fixed in the pilot SVGs, listed in §6):

- Arm length: chevrons ran 7, arrow heads 6.5, `upload`/`download` 4.5, `external`'s legs 6. Now: one arm (run 7) for chevrons and arrow heads, and one compound arm (run 4.5, legs 6.5).
- Angles: the long leg of `check` (47.7°) and of `success` (51.6°) were not 45°.
- Grid: `delete`'s tapered body (6.9, 19.1, 17.1) and `eye-off`'s break points (10.36, 5.41 and others) were off the 0.25 grid; `calendar`'s header (y 10.25) and `info`'s dot (y 7.75) were on quarter units.
- Dot gap: 1.5 in `info` and `warning`, 2.5 in `calendar`. At 16px, 1.5 merged `i` and `!` into one bar.
- Curves: `eye` was cubic splines; the kit asks for arcs.
- Path order: `document`, `search`, `add` and the globe's meridian started at different points and ran counterclockwise.
- The skill's kit says a shaft ends 0.5 inside the tip, but every arrow ends on the tip, which follows the join rule (meeting strokes share one coordinate). The kit text needs updating (open question).
- The skill says text lines are 3.5 apart, but at 16px they fill in. 4 apart is clean, and still inside the "6–7 long" rule.

## 3. Optical corrections in use

| Icon       | Correction                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| `warning`  | Glyph above the triangle's centroid (glyph painted y 9.25–17.25, centre 13.25; centroid 14.6), so it reads as centred |
| `calendar` | Painted box y 2.75–20.75 (centre 11.75): rings y 3.5 → 7, so the box sits within 0.5 of centre                        |
| `search`   | Painted box centre 12.12 (the handle runs to 21). Within the 0.5 band                                                 |

No other icon is nudged. Arrows and chevrons are centred exactly on 12,12 (no tail shift).

## 4. File format

One file per icon, `packages/icons/svg/<name>.svg`, kebab-case, two-space indent, one element per line, final newline.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z"/>
</svg>
```

- Root attributes exactly as above, and no others. Shapes carry only their geometry (`d`, or `cx`/`cy`/`r` and so on) and inherit everything else.
- Prefer `path`: one per connected stroke. Absolute `M`, then relative commands; at most two decimals; closed shapes end in `Z`.
- A closed shape starts at its top-left straight edge and runs clockwise. An open path starts at the end nearer the top-left.
- A full circle is two half arcs from its top (`M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18Z`).
- None of: `id`, `class`, `style`, `transform`, `opacity`, `fill` or `stroke` on a shape, `defs`, `use`, `mask`, `clip-path`, `title`, comments, editor metadata.
- Mirroring is not in the file: it is the name's entry in `packages/icons/mirror-in-rtl.json`.

## 5. Construction notes (only what isn't obvious)

| Icon       | Note                                                                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `eye`      | Arcs of r 9.48 (the circle through (3,12), (12,5.5) and (21,12) has r 9.4808; written to two decimals, it differs by under 0.001). The apex at y 5.5 leaves exactly 2 to the pupil                                                                           |
| `eye-off`  | The eye's arcs, broken at grid points within 0.013 of the arc: (11.5,5.5) and (19.75,14.5), and their 180° turns (12.5,18.5) and (4.25,9.5). Clear gaps to the slash are 2.74 and 2.21. The pupil lies wholly inside the slash's clearance, so it's left out |
| `delete`   | Straight sides x 6 and 18 instead of a taper: a 1-unit taper is 0.67px at 16px (invisible) and put every foot coordinate off the grid and off 45°/90°                                                                                                        |
| `info`     | Dot (12,7.5), stem 11 → 16.5: dot gap 2, glyph painted 6.75–17.25, centred on 12                                                                                                                                                                             |
| `warning`  | Stem 10 → 13, dot 16.5: dot gap 2. The stem top clears the sides by 1.73, within the 1.5 apex allowance                                                                                                                                                      |
| `document` | Text lines y 12.5 and 16.5: 3 clear above (fold) and below (page), centred in the page below the fold                                                                                                                                                        |
| `language` | Its ink density is +67% over the object median: the circle and the meridian alone give about 0.25. Kept, because a lighter globe (equator only) gained just 10% and read less like a globe                                                                   |

## 6. Inventory

Status: `drawn` = render matrix viewed, measured, pairs and originality checked (pilot batch, 2026-10-16). Recognition testing with residents: **pending** for every row. Label keys are proposals; the engineer adds the five locales.

| Name              | Concept                        | Family    | Keyline     | Metaphor                                               | Aliases                   | Mirrors in RTL (why)                           | Label key: English                   | Status |
| ----------------- | ------------------------------ | --------- | ----------- | ------------------------------------------------------ | ------------------------- | ---------------------------------------------- | ------------------------------------ | ------ |
| `chevron-down`    | Open, expand, show below       | Direction | Free, arm   | A chevron pointing down                                | `expand`                  | No: vertical                                   | `icons.chevron-down`: Expand         | drawn  |
| `chevron-up`      | Close, collapse, show above    | Direction | Free, arm   | A chevron pointing up                                  | `collapse`                | No: vertical                                   | `icons.chevron-up`: Collapse         | drawn  |
| `chevron-back`    | Previous, towards inline start | Direction | Free, arm   | A chevron pointing to the inline start                 | `previous`                | Yes: horizontal reading direction              | `icons.chevron-back`: Previous       | drawn  |
| `chevron-forward` | Next, towards inline end       | Direction | Free, arm   | A chevron pointing to the inline end                   | `next`                    | Yes: horizontal reading direction              | `icons.chevron-forward`: Next        | drawn  |
| `arrow-back`      | Go back                        | Direction | Free, arrow | An arrow with a shaft, pointing to the inline start    | `back`                    | Yes: horizontal reading direction              | `icons.arrow-back`: Back             | drawn  |
| `arrow-forward`   | Go on, start, continue         | Direction | Free, arrow | An arrow with a shaft, pointing to the inline end      | `continue`                | Yes: horizontal reading direction              | `icons.arrow-forward`: Continue      | drawn  |
| `external`        | Opens somewhere else (new tab) | Direction | Square      | An arrow leaving an open frame at its inline-end top   | `open-in-new`, `new-tab`  | Yes: the exit points to the inline end         | `icons.external`: Opens in a new tab | drawn  |
| `close`           | Close, dismiss, clear          | Actions   | Free        | Two crossed diagonal strokes                           | `x`, `cross`, `dismiss`   | No: symmetric                                  | `icons.close`: Close                 | drawn  |
| `menu`            | Open the navigation menu       | Controls  | Square      | Three equal horizontal lines                           | `hamburger`, `navigation` | No: symmetric, no direction                    | `icons.menu`: Menu                   | drawn  |
| `search`          | Search                         | Actions   | Circle      | A magnifying glass, handle to the lower inline end     | `magnifier`, `find`       | No: an object (Codex doesn't flip it)          | `icons.search`: Search               | drawn  |
| `add`             | Add, add another               | Actions   | Free        | A plus                                                 | `plus`                    | No: symmetric                                  | `icons.add`: Add                     | drawn  |
| `check`           | Selected, completed            | Actions   | Free        | A check mark                                           | `tick`, `selected`        | No: never mirror check marks                   | `icons.check`: Selected              | drawn  |
| `info`            | Information, good to know      | Status    | Square      | A rounded square with an "i" made of a dot and stem    | `information`             | No: status                                     | `icons.info`: Information            | drawn  |
| `success`         | Success, done                  | Status    | Circle      | A circle with a check mark                             | `check-circle`            | No: status                                     | `icons.success`: Success             | drawn  |
| `warning`         | Warning, take care             | Status    | Triangle    | A triangle with an exclamation mark                    | `alert`, `caution`        | No: status                                     | `icons.warning`: Warning             | drawn  |
| `error`           | Error, something is wrong      | Status    | Octagon     | An octagon with a small ×                              | `danger`, `x-octagon`     | No: status                                     | `icons.error`: Error                 | drawn  |
| `calendar`        | A date, choosing a date        | Time      | Square, low | A page with two binding rings, a header and three dots | `date`                    | No: an object                                  | `icons.calendar`: Calendar           | drawn  |
| `upload`          | Send a file from the device    | Actions   | Square      | An arrow rising out of an open tray                    | –                         | No: vertical                                   | `icons.upload`: Upload               | drawn  |
| `download`        | Save a file to the device      | Actions   | Square      | An arrow descending into an open tray                  | –                         | No: vertical                                   | `icons.download`: Download           | drawn  |
| `document`        | A document, a file             | Documents | Portrait    | A page with a folded corner and two text lines         | `file`                    | No: an object; the fold is a detail            | `icons.document`: Document           | drawn  |
| `delete`          | Delete, remove permanently     | Actions   | Square      | A waste bin with a lid and handle                      | `trash`, `bin`            | No: an object                                  | `icons.delete`: Delete               | drawn  |
| `language`        | Change language                | Language  | Circle      | A globe with a meridian and two latitude lines         | `globe`, `locale`         | No: an object. Never a flag                    | `icons.language`: Language           | drawn  |
| `eye`             | Show (a hidden value)          | Controls  | Free        | An open eye                                            | `show`, `visible`         | No: symmetric object                           | `icons.eye`: Show                    | drawn  |
| `eye-off`         | Hide (a shown value)           | Controls  | Free        | An open eye with a diagonal slash                      | `hide`, `hidden`          | No: the slash is the "off" part, not direction | `icons.eye-off`: Hide                | drawn  |
| `copy`            | Copy to the clipboard          | Actions   | Square      | Two equal sheets, one in front, offset diagonally      | `duplicate`               | No: the offset is depth, not direction         | `icons.copy`: Copy                   | drawn  |

Aliases are proposals for the registry (a second name, not a second drawing). `eye` and `eye-off` are labelled by the action a resident takes ("Show", "Hide"); a component that labels the button itself (`button.showPassword`) uses its own message, not these.
