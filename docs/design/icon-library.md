# Icon library: grid, parts kit, file format and inventory

The construction facts for `@kvirn-ui/icons` (Plan 0124). The fixed numbers (grid, keylines, gaps, markup rules, angles) are in [`icon.md` §6.1](icon.md#61-drawing-rules-for-the-built-ins); how to decide and check is the `iconography` skill. This file holds what the two share in practice: the grid files, the parts with their coordinates, the file format and the inventory.

## 1. The grid

Three files in `packages/icons/grid/`. They are design-tool assets, not icons: the generator reads only `svg/`.

| File                 | What it is                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `icon-grid.svg`      | The construction grid, 24 × 24 units (rendered at 960px). Import it as a locked bottom layer                    |
| `icon-grid-fine.svg` | The 0.5 and 0.25 sub-grid only, transparent. Lay it over the grid when you place or check a point               |
| `icon-template.svg`  | The starter: the root attributes from §6.1 and one placeholder dot at 12,12 (so editors keep the path). Copy it |

**Layers in `icon-grid.svg`** (each is a named `<g>`, so Figma, Illustrator and Inkscape show them as layers):

| Layer                          | Look                 | Meaning                                                                         |
| ------------------------------ | -------------------- | ------------------------------------------------------------------------------- |
| `grid-1-unit`                  | faint grey           | 1-unit lines                                                                    |
| `centre-cross-and-diagonals`   | grey                 | x 12, y 12 and both 45° diagonals: the axes of symmetry and of every 45° stroke |
| `guide-pupil-r3-and-lens-r6-5` | grey                 | The pupil (12,12) r 3 and the lens (10.5,10.5) r 6.5                            |
| `keyline-circle-r9`            | rose, solid          | Centre 12,12, r 9                                                               |
| `keyline-square`               | blue, long dash      | 4–20, radius 2                                                                  |
| `keyline-octagon`              | orange, short dash   | The §6.1 vertices                                                               |
| `keyline-triangle`             | green, dash-dot      | Apex 12,3.25, base y 20.25 from x 2.75 to 21.25                                 |
| `keyline-portrait`             | violet, dotted       | x 5.5–18.5, y 3–21, radius 2                                                    |
| `keyline-landscape`            | teal, very long dash | x 3–21, y 5–19, radius 2                                                        |
| `centreline-limit-2-75-21-25`  | grey, fine dots      | Where stroke centrelines must stay, so the painted edge stays in the live area  |
| `live-area-2-22`               | dark grey            | The live area. Nothing painted crosses it, caps and joins included              |
| `corner-ticks`                 | dark grey            | Crop marks at the live-area corners, visible when the frame is hidden           |
| `stroke-preview-1-5`           | grey band            | A 1.5 band with round caps in the top margin: the painted width of one stroke   |
| `legend`                       | bottom margin        | The six keyline names, each with its colour and dash                            |

`icon-grid-fine.svg` has `grid-0-25-unit` (faintest) and `grid-0-5-unit` (a step darker, so half units stand out).

**How to use it.** Draw at stroke 1.5 on the grid, from a keyline and the parts below. Keylines are the outer limits of a shape's centreline, not a size every icon must fill.

> **Align to the grid as best you can, always.** Every horizontal and vertical centreline sits on a whole or half unit. Every endpoint, corner and arc end sits on the 0.25 grid. Any exception is justified in the construction note (§5).

Accepted exceptions: a dot ends at `+0.01`, and a dot is a point on the 0.25 grid (`warning`'s dot at y 16.75); the triangle keyline (§6.1); an arc radius is a length, not a coordinate, and may have two decimals (`eye`, r 9.48); arc break points may sit within 0.02 of the arc they split.

**Sizes.** A meaningful or status icon is at least **20px**; 16px is for decorative icons beside text (§6.1, maintainer 2026-10-16). Stroke 1 to 2 holds at 20px and up. At 16px, stroke 1.5 at most: at stroke 2 the globe and the document's text lines fill in.

## 2. Parts kit (with coordinates)

Derived from the 25 built-ins as redrawn in the pilot batch. Two icons that share an idea use the part at these coordinates, unchanged.

| Part                   | Coordinates                                                                                                                                                                                                                                                                         | Used by                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Container, square      | 4–20, radius 2: `M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z`                                                                                                                                                                                       | `info`                                            |
| Container, square, low | x 4–20, y 5.5–20, radius 2 (room for rings above)                                                                                                                                                                                                                                   | `calendar`                                        |
| Container, circle      | Centre 12,12, r 9, two half arcs from the top: `M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18Z`                                                                                                                                                                                               | `success`, `language`                             |
| Container, octagon     | `M8.5 3.5h7l5 5v7l-5 5h-7l-5-5v-7Z`                                                                                                                                                                                                                                                 | `error`                                           |
| Container, triangle    | `M12 3.25l9.25 17h-18.5Z`                                                                                                                                                                                                                                                           | `warning`                                         |
| Container, landscape   | x 3–21, y 5–19, radius 2                                                                                                                                                                                                                                                            | (mail, image, chart)                              |
| Page                   | Portrait x 5.5–18.5, y 3–21, radius 2, top inline-end corner cut 5 × 5. Fold (13.5,3) → (13.5,8) → (18.5,8)                                                                                                                                                                         | `document`                                        |
| Sheet pair             | Two 11.5 sheets, radius 2, offset 4.5: front x 4–15.5, y 8.5–20; back x 8.5–20, y 4–15.5, open, joining the front's straight edges                                                                                                                                                  | `copy`                                            |
| Frame (open)           | x 4–17, y 7–20, radius 2. The top edge stops at x 11, the end edge starts at y 13                                                                                                                                                                                                   | `external`                                        |
| Arm                    | 45°, run 7 (true length 9.9): `chevron-down` (5,8.5) → (12,15.5) → (19,8.5). The four chevrons are this one rotated about 12,12                                                                                                                                                     | chevrons, arrow heads                             |
| Arrow                  | Arm plus shaft: shaft (4.5,12) → (19.5,12); head (12.5,5) → (19.5,12) → (12.5,19). The shaft ends on the tip (shared coordinate)                                                                                                                                                    | `arrow-forward`, `arrow-back`                     |
| Arrow, compound        | Shaft x 12, y 4 → 15.5; arm run 4.5 (true 6.36). On a 45° arrow, the head's H/V legs are 6.5                                                                                                                                                                                        | `upload`, `download`, `external`                  |
| Tray                   | `M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3`                                                                                                                                                                                                                                         | `upload`, `download`                              |
| Check                  | (4.5,12) → (9.5,17) → (19.5,7): legs 5 and 10, both 45°                                                                                                                                                                                                                             | `check`                                           |
| Cross, plus, minus     | × (6,6) ↔ (18,18) and (18,6) ↔ (6,18), 12 across. + 14 long, (12,5) ↔ (12,19) and (5,12) ↔ (19,12). − (5,12) ↔ (19,12)                                                                                                                                                              | `close`, `add`, (remove)                          |
| Small glyph            | **One scale, about 60% of the full part, snapped to the half unit.** × 7 across (58%), check legs 3 and 6 (60%), + and − 8 long (57%)                                                                                                                                               | status glyphs, badges                             |
| Status glyph           | The small glyph centred in its container: × (8.5,8.5) ↔ (15.5,15.5); check (7.5,12) → (10.5,15) → (16.5,9)                                                                                                                                                                          | `error`, `success`                                |
| Badge                  | The small glyph centred on (16.5,16.5): + (16.5,12.5) ↔ (16.5,20.5) and (12.5,16.5) ↔ (20.5,16.5); × (13,13) ↔ (20,20); check (12,16.5) → (15,19.5) → (21,13.5); − (12.5,16.5) ↔ (20.5,16.5). The host stroke stops with its centreline 3.5 from the glyph's (gap 2), as open paths | (badged hosts)                                    |
| Stem                   | Vertical on x 12 with a dot: `info` y 11 → 16.5 (dot above), `warning` y 9.75 → 13.25 (dot below)                                                                                                                                                                                   | `info`, `warning`                                 |
| Dot                    | `M x y h.01`, never a filled circle, **clear of its stem by 2** (the rule's minimum is 1.5, but 1.5 straddles a pixel at 16px)                                                                                                                                                      | `info` (12,7.5), `warning` (12,16.75), `calendar` |
| Dot row                | Dots 4 apart: (8,15), (12,15), (16,15)                                                                                                                                                                                                                                              | `calendar`                                        |
| Large dot (proposed)   | For a standalone dot row only: a circle r 0.5 (painted ⌀ 2.5 at stroke 1.5), as `M x 11.5a.5 .5 0 0 1 0 1 .5 .5 0 0 1 0-1Z`. The plain dot fades to grey at 20px                                                                                                                    | (more)                                            |
| More                   | Three large dots on y 12, 5 apart: x 7, 12, 17                                                                                                                                                                                                                                      | (more)                                            |
| Rule line              | Full-width horizontal x 4 → 20: `menu` y 6, 12, 18 (6 apart); `calendar` header y 10.5; `delete` lid y 6.5                                                                                                                                                                          | `menu`, `calendar`, `delete`                      |
| Text line              | 6 long, x 9 → 15, 4 apart: `document` y 12.5 and 16.5                                                                                                                                                                                                                               | `document`                                        |
| Lens                   | Circle (10.5,10.5) r 6.5; handle (15.25,15.25) → (20.25,20.25), starting inside the ring's stroke                                                                                                                                                                                   | `search`                                          |
| Eye                    | Two arcs r 9.48 through (3,12) and (21,12), apex y 5.5 and 18.5; pupil r 3 at 12,12 (gap 2 to the lids)                                                                                                                                                                             | `eye`, `eye-off`                                  |
| Slash                  | (4.5,4.5) → (19.5,19.5). The host breaks so its end caps clear the slash's edge by at least 2 (centreline 3.5 from the slash line)                                                                                                                                                  | `eye-off`                                         |
| Handle (small)         | Radius 1 corners: `delete` x 9.5–14.5, up to y 4                                                                                                                                                                                                                                    | `delete`                                          |
| Head and shoulders     | Not drawn yet. The skill's start: circle r 3.25 at 12,8 over a shoulder arc                                                                                                                                                                                                         | (people)                                          |

**Family 1 parts (direction and movement)**, sketched in `/tmp` at 20, 24 and 48px before the batch:

| Part               | Coordinates                                                                                                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arc arrow (rotate) | Arc r 7.07 (5√2) about 12,12, so its 45° points (7,7), (17,7), (7,17), (17,17) are on the grid. The head sits at a 45° point, where the tangent is 45°, so its legs are horizontal and vertical, 4 long. Refresh: arc (7,17) → (17,17) clockwise the long way, head (21,17) → (17,17) → (17,13). No slope exception |
| U-turn arrow       | Undo: head (9,4.5) → (4.5,9) → (9,13.5) (the compound arm); shaft (4.5,9) → (14.5,9); a half circle r 5 to (14.5,19); tail to (9,19). Redo is its mirror. Painted y 3.75–19.75                                                                                                                                      |
| First / last bar   | Bar x 7, y 5 → 19 (the arm's height); chevron (17.5,5) → (10.5,12) → (17.5,19), tip 3.5 from the bar (gap 2). Last is its mirror. Painted centre x 12.25                                                                                                                                                            |
| Expand / collapse  | Two compound chevrons (run 4.5, 9 wide). Expand points away: (7.5,8.5) → (12,4) → (16.5,8.5) and (7.5,15.5) → (12,20) → (16.5,15.5). Collapse points in: (7.5,4) → (12,8.5) → (16.5,4) and (7.5,20) → (12,15.5) → (16.5,20). Gap 5.5                                                                                |

**Named parts allowed other slopes** (§6.1, maintainer 2026-10-16). Slope is rise:run. These are the only places the exception applies, each at 2:1, 1:1 or 1:2 with endpoints on the 0.25 grid. A new one is added here before it's drawn.

| Part             | Slope       | Coordinates                                                                                                                                                                  |
| ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Envelope flap    | 1:2         | In the landscape container: (6.5,8.5) → (12,11.25) → (17.5,8.5). It floats 2 clear of the container: a flap that meets an edge at 26.6° makes an acute sliver that fills in  |
| Roof, wide       | 1:2         | Public buildings: eaves (3,9) → ridge (12,4.5) → (21,9). A house roof is 1:1 (eaves (3.5,12), ridge (12,3.5)) and needs no exception                                         |
| Pin              | 2:1         | Head arc r 5.59 (2.5√5) about (12,8.75) from (7,11.25) over the top to (17,11.25); sides tangent at those points down to the tip (12,21.25); hole r 2 at (12,8.75), gap 2.09 |
| Play triangle    | 1:2         | (6,5) → (20,12) → (6,19); apex 53°, round-joined. Painted x 5.25–20.75, centroid x 10.7: it reads centred                                                                    |
| Triangle keyline | about 61.5° | Set by §6.1 (`warning`); not a slope of this rule                                                                                                                            |

The funnel needs no exception: top (4,5) → (20,5), sides 1:1 to the neck at (10,11) and (14,11).

**Radius.** 2 on containers, pages, sheets, frames and the tray. 1 on small inner corners: the bin handle and the bin foot (§6.1).

**Where today's react built-ins disagreed with each other** (fixed in the pilot SVGs):

- Arm length: chevrons ran 7, arrow heads 6.5, `upload`/`download` 4.5, `external`'s legs 6. Now one arm (run 7) and one compound arm (run 4.5, legs 6.5).
- Angles: the long leg of `check` (47.7°) and of `success` (51.6°).
- Grid: `delete`'s taper (6.9, 19.1, 17.1) and `eye-off`'s break points (10.36, 5.41 and others) were off the 0.25 grid; `calendar`'s header (y 10.25) and `info`'s dot (y 7.75) were on quarter units.
- Small glyphs: the error × was 6 across (50%) and the success check about 60%. Now one scale.
- Dot gap: 1.5 in `info` and `warning`, 2.5 in `calendar`. At 16px, 1.5 merged `i` and `!` into one bar.
- Curves: `eye` was cubic splines. Path order: `document`, `search`, `add` and the globe's meridian started at different points.

## 3. Optical corrections in use

| Icon       | Correction                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `warning`  | Glyph above the triangle's centroid (glyph painted y 9–17.5, centre 13.25; centroid 14.6), so it reads as centred |
| `calendar` | Painted box y 2.75–20.75 (centre 11.75): rings y 3.5 → 7                                                          |
| `search`   | Painted box centre 12.12 (the handle runs to 21)                                                                  |

No other icon is nudged. Arrows and chevrons are centred exactly on 12,12.

## 4. File format

One file per icon, `packages/icons/svg/<name>.svg`, kebab-case, two-space indent, one element per line, final newline.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z"/>
</svg>
```

- Root attributes exactly as above, and no others. Shapes carry only their geometry and inherit everything else.
- Prefer `path`: one per connected stroke. Absolute `M`, then relative commands; at most two decimals; closed shapes end in `Z`.
- A closed shape starts at its top-left straight edge and runs clockwise. An open path starts at the end nearer the top-left. A full circle is two half arcs from its top.
- None of: `id`, `class`, `style`, `transform`, `opacity`, `fill` or `stroke` on a shape, `defs`, `use`, `mask`, `clip-path`, `title`, comments, editor metadata.
- Mirroring is not in the file: it is the name's entry in `packages/icons/mirror-in-rtl.json`.

## 5. Construction notes (only what isn't obvious)

| Icon       | Note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eye`      | Arcs of r 9.48 (the circle through (3,12), (12,5.5) and (21,12) has r 9.4808). The apex at y 5.5 leaves exactly 2 to the pupil                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `eye-off`  | **Kept: pupil whole, slash broken.** The lids break at (11.5,5.5)/(19.75,14.5) and (12.5,18.5)/(4.25,9.5) (within 0.013 of the arc; gaps 2.74 and 2.21). The slash stops 2.22 clear of the pupil: (4.5,4.5) → (7.25,7.25) and (16.75,16.75) → (19.5,19.5). The pilot (no pupil, full slash) read as ⊘ at 16 and 20 in greyscale. **Rejected:** slash moved to (5,4) → (20,19) with the pupil reduced to the arc (9.25,13.25) → (10.75,14.75) (gap 2.04): the pupil became a blip, the lower lid lost (12.5,18.5) → (20.5,13.25), and it still read as ⊘ |
| `delete`   | Straight sides x 6 and 18 instead of a taper: a 1-unit taper is 0.67px at 16px and put the foot off the grid and off the allowed slopes                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `info`     | Dot (12,7.5), stem 11 → 16.5: dot gap 2, glyph centred on 12                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `warning`  | Stem 9.75 → 13.25, dot 16.75: dot gap 2, dot to base 2. The stem top clears the sides by 1.61, within the 1.5 apex allowance                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `error`    | × 7 across at the small-glyph scale. Its ends clear the octagon's diagonal edges by 2.04                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `document` | Text lines y 12.5 and 16.5: 3 clear of the fold and the page bottom                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `language` | Ink +67% over the object median: the circle and meridian alone give about 0.25. A globe with the equator only gained 10% and read less like a globe                                                                                                                                                                                                                                                                                                                                                                                                     |

## 6. Inventory

Status: `drawn` = render matrix viewed, measured, pairs and originality checked (pilot batch, 2026-10-16). Recognition testing with residents: **pending** for every row. Ink class: `open` (a glyph with no enclosing outline) or `object`; the density band is judged within the class. Labels are noun phrases (§7) and proposals; the engineer adds the five locales. **None:** the icon is a part of a control or link that carries the name, so it is always decorative.

| Name              | Concept                        | Family    | Keyline     | Ink    | Metaphor                                               | Aliases                   | Mirrors in RTL (why)                           | Label key: English                       | Status |
| ----------------- | ------------------------------ | --------- | ----------- | ------ | ------------------------------------------------------ | ------------------------- | ---------------------------------------------- | ---------------------------------------- | ------ |
| `chevron-down`    | Open, expand, show below       | Direction | Free, arm   | open   | A chevron pointing down                                | `expand`                  | No: vertical                                   | None: a trigger part                     | drawn  |
| `chevron-up`      | Close, collapse, show above    | Direction | Free, arm   | open   | A chevron pointing up                                  | `collapse`                | No: vertical                                   | None: a trigger part                     | drawn  |
| `chevron-back`    | Previous, towards inline start | Direction | Free, arm   | open   | A chevron pointing to the inline start                 | `previous`                | Yes: horizontal reading direction              | None: a trigger part                     | drawn  |
| `chevron-forward` | Next, towards inline end       | Direction | Free, arm   | open   | A chevron pointing to the inline end                   | `next`                    | Yes: horizontal reading direction              | None: a trigger part                     | drawn  |
| `arrow-back`      | Go back                        | Direction | Free, arrow | open   | An arrow with a shaft, pointing to the inline start    | `back`                    | Yes: horizontal reading direction              | None: a link or button part              | drawn  |
| `arrow-forward`   | Go on, start, continue         | Direction | Free, arrow | open   | An arrow with a shaft, pointing to the inline end      | `continue`                | Yes: horizontal reading direction              | None: a link or button part              | drawn  |
| `external`        | Opens somewhere else (new tab) | Direction | Square      | object | An arrow leaving an open frame at its inline-end top   | `open-in-new`, `new-tab`  | Yes: the exit points to the inline end         | None: the link has `link.newTabNotice`   | drawn  |
| `close`           | Close, dismiss, clear          | Actions   | Free        | open   | Two crossed diagonal strokes                           | `x`, `cross`, `dismiss`   | No: symmetric                                  | None: the button carries the name        | drawn  |
| `menu`            | Open the navigation menu       | Controls  | Square      | open   | Three equal horizontal lines                           | `hamburger`, `navigation` | No: symmetric, no direction                    | `icons.menu`: Menu                       | drawn  |
| `search`          | Search                         | Actions   | Circle      | object | A magnifying glass, handle to the lower inline end     | `magnifier`, `find`       | No: an object (Codex doesn't flip it)          | `icons.search`: Search                   | drawn  |
| `add`             | Add, add another               | Actions   | Free        | open   | A plus                                                 | `plus`                    | No: symmetric                                  | None: the button carries the name        | drawn  |
| `check`           | Selected, completed            | Actions   | Free        | open   | A check mark                                           | `tick`, `selected`        | No: never mirror check marks                   | None: state is `aria-selected`/`checked` | drawn  |
| `info`            | Information, good to know      | Status    | Square      | object | A rounded square with an "i" made of a dot and stem    | `information`             | No: status                                     | `icons.info`: Information                | drawn  |
| `success`         | Success, done                  | Status    | Circle      | object | A circle with a check mark                             | `check-circle`            | No: status                                     | `icons.success`: Success                 | drawn  |
| `warning`         | Warning, take care             | Status    | Triangle    | object | A triangle with an exclamation mark                    | `alert`, `caution`        | No: status                                     | `icons.warning`: Warning                 | drawn  |
| `error`           | Error, something is wrong      | Status    | Octagon     | object | An octagon with a small ×                              | `danger`, `x-octagon`     | No: status                                     | `icons.error`: Error                     | drawn  |
| `calendar`        | A date, choosing a date        | Time      | Square, low | object | A page with two binding rings, a header and three dots | `date`                    | No: an object                                  | `icons.calendar`: Calendar               | drawn  |
| `upload`          | Send a file from the device    | Actions   | Square      | object | An arrow rising out of an open tray                    | –                         | No: vertical                                   | `icons.upload`: Upload                   | drawn  |
| `download`        | Save a file to the device      | Actions   | Square      | object | An arrow descending into an open tray                  | –                         | No: vertical                                   | `icons.download`: Download               | drawn  |
| `document`        | A document, a file             | Documents | Portrait    | object | A page with a folded corner and two text lines         | `file`                    | No: an object; the fold is a detail            | `icons.document`: Document               | drawn  |
| `delete`          | Delete, remove permanently     | Actions   | Square      | object | A waste bin with a lid and handle                      | `trash`, `bin`            | No: an object                                  | None: the button carries the name        | drawn  |
| `language`        | Change language                | Language  | Circle      | object | A globe with a meridian and two latitude lines         | `globe`, `locale`         | No: an object. Never a flag                    | `icons.language`: Language               | drawn  |
| `eye`             | Show (a hidden value)          | Controls  | Free        | object | An open eye                                            | `show`, `visible`         | No: symmetric object                           | None: always with "Show …" text (§7)     | drawn  |
| `eye-off`         | Hide (a shown value)           | Controls  | Free        | object | An open eye, the slash broken around the pupil         | `hide`, `hidden`          | No: the slash is the "off" part, not direction | None: always with "Hide …" text (§7)     | drawn  |
| `copy`            | Copy to the clipboard          | Actions   | Square      | object | Two equal sheets, one in front, offset diagonally      | `duplicate`               | No: the offset is depth, not direction         | `icons.copy`: Copy                       | drawn  |

Aliases are proposals for the registry (a second name, not a second drawing).
