---
name: iconography
description: The craft of drawing KvirnUI's icons - one system for 150+ outline SVGs on a 24 grid: the parts kit, stroke and corner rules, optical balance, detail budget, metaphor and naming, accessibility of an icon (small sizes, forced colours, RTL, meaning without colour), drawing in families, and the render-and-compare process that proves a set looks like one hand drew it. Use when you draw, revise, name, review or inventory an icon. The grid, keylines and the drawing rules are in docs/design/icon.md section 6.1; the library system is in docs/design/icon-library.md.
when_to_use: new icon, icon set, SVG icon, redraw an icon, icon looks off, icon too detailed, icon metaphor, icon naming, icon family, contact sheet, icon review, pictogram, RTL mirroring of an icon, 16px legibility, stroke weight, optical alignment
---

# Iconography

Icons here are a language, not decoration. A resident meets one once, at 16px, under stress, in Windows Contrast Themes or a second language. **If an icon needs decoding, redraw it or drop it.** Consistency is the feature: 150 icons must look like one hand drew them in one afternoon.

Where facts live: the grid, keylines, gaps, markup rules (first written for the 25 icons the components draw) are `docs/design/icon.md` §6.1 (don't restate them, read them). The library's parts kit, taxonomy and inventory are `docs/design/icon-library.md`. How to _decide and check_ is this skill. How an icon is rendered, registered and mirrored is `packages/react/src/icon/icon.md`.

## The five laws

1. **One stroke, one grid.** Stroke 1.5 on a 24 grid, round caps and joins, live area 2–22, 0.25 coordinate grid, 45° and 90° angles. Never scale a path to fit, never outline a stroke, never vary weight inside an icon.
2. **Parts before geometry.** Build from the parts kit (container, arm, head, dot, tray, badge cut). A new shape is a proposal to the kit, not a one-off. Two icons that share an idea (every arrow, every document, every person) share the same part, drawn at the same coordinates.
3. **Equal weight, not equal size.** A circle, a square and a triangle of the same measured size look unequal. Draw to the keylines (circle largest, triangle widest) and prove it by measurement (ink density, below), not by eye.
4. **Detail is a budget.** At most 4 strokes of content inside a container, and no feature smaller than the gap rule. A detail that fills in at 16px is deleted, not thinned. Fewer parts reads faster.
5. **Meaning without colour or text.** An icon works in greyscale and in forced colours, holds a single concept, carries no letters or numerals (language-bound, 1.4.5 images of text; the exceptions are the B/I/U/S letterforms of `bold`, `italic`, `underline` and `strike` (Plan 0131) and the H + numeral of `heading-1`…`heading-6` (Plan 0133), conventions users know from every editor, maintainer 2026-10-17; and the **brand glyph** exception below), no gesture beyond the two recorded exceptions (`easy-read-thumbs-up` and `like`, category `actions`, Plan 0144; both in the sensitivity review in `icon-library.md` §8, always with words), and is never the only carrier of information (1.4.1, 1.1.1).

## Process (every icon, every time)

1. **Concept.** One sentence: what it means, where it appears, who sees it. Search the inventory: an existing icon, or an alias, beats a new drawing. One concept, one icon: no synonyms.
2. **Metaphor.** Pick the most concrete, widely understood object. Test it against [metaphor rules](references/metaphor-and-naming.md): no culture-bound gestures, flags, brands, gender or ability stereotypes, no abstract symbols a resident has to learn. Prior art is for the metaphor only; never trace.
3. **Sketch on the keyline.** Choose the keyline (circle, square, octagon, triangle, portrait) or the free-form rule from [drawing-craft](references/drawing-craft.md); assemble from parts; start the path at the top-left, run it clockwise, one `<path>` per connected stroke, fewest commands.
4. **Write the SVG** in the file format of the library spec: root attributes only on `<svg>`, shapes inherit, no `transform`, `style`, `id`, `defs`, `mask`, `clip-path`, opacity or fill, no editor metadata, coordinates to two decimals on the 0.25 grid.
5. **Render and look.** Chromium, PNG, at 16, 20, 24 and 32px, stroke 1, 1.5 and 2, light and dark, then greyscale. Read the images. A check you didn't look at isn't a check.
6. **Measure.** Ink density, live-area fit and gaps per the [QA checklist](references/qa-checklist.md). Outside the band: redraw the outlier, don't loosen the band.
7. **Compare in family.** Put the icon beside six neighbours from its family and six from other families on a contact sheet. Size, weight, corner radius, optical centre and level of detail must match. Then the confusable pairs.
8. **Record.** Inventory row, construction note for anything non-obvious, RTL decision, label key. Never claim recognition testing happened: mark it `pending`.

## Working in batches

Draw in families of 8–12 (all arrows, all documents, all people), because consistency is judged side by side. After each batch regenerate the whole contact sheet and compare against the first batch: **drift is the failure mode of a long project.** Fix an outlier by redrawing it. A rule that needs an exception becomes a kit change, proposed to the maintainer, applied to the whole set in one pass.

## Accessibility of an icon

- Decorative (`aria-hidden`) unless it has a `label`. The label names the _concept_ ("Delete"), never the shape ("Trash can"), and every label is an i18n key in all 5 locales.
- A status never rests on colour or an icon alone: the four statuses differ in container shape, and come with words.
- A meaningful icon reaches 3:1 against its background (1.4.11) at the smallest size we ship.
- Icons follow `currentColor` so forced colours work. Never two colours, never a fill that ignores the theme.
- Mirror only what shows horizontal direction (`mirrorInRtl`): arrows, chevrons, back/forward, list indent, text alignment. Never check marks, status icons, clocks, objects, charts, or `search`. Decide per icon and write down why.
- No icon animates or flashes by itself. Motion belongs to the component and respects `prefers-reduced-motion`.

## Don't

- Don't add a keyline, grid size, stroke width or corner radius: those are `docs/design/icon.md` decisions and the maintainer's.
- Don't draw brand marks, logos, flags or emblems, except the **brand glyph** exception: categories `social` and `service-marks` only (maintainer 2026-10-18 and 2026-10-19, Plan 0144), where a simplified original mark may hold a letterform (`f`, `in`, `m`, `X`, `B`, `V`, `K`), with radius 2, no colour, used at 20px and up beside the network's or service's name and never as the only link text. A municipal emblem is still an asset the consumer supplies.
- Don't use a filled shape, a gradient, a second colour or a shadow.
- Don't trace or paste from another set, and don't ship a path string equal to one in Heroicons or Lucide: grep before handing off.
- Don't draw a variant at a size (a "16px version"). If 16px fails, redraw the one drawing.

## References

- [drawing-craft.md](references/drawing-craft.md): the parts kit, corner and joint rules, optical corrections, detail budget, SVG file hygiene.
- [metaphor-and-naming.md](references/metaphor-and-naming.md): choosing a metaphor, names, aliases, RTL, taxonomy and indicative counts for the 150+.
- [qa-checklist.md](references/qa-checklist.md): render matrix, the measurements and their bands, family comparison, pairs, sign-off.
