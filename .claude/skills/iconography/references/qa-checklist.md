# QA checklist

Run it for every icon, and again for the whole set after every batch. The render script lives outside the repo until the library's generator ships (Plan 0124); once it does, use its contact sheet and checker, and this list is what they enforce.

## Render matrix

Chromium screenshots to `/tmp`, read with the image viewer:

| Axis      | Values                                                           |
| --------- | ---------------------------------------------------------------- |
| Size      | 16, 20, 24, 32 px (device pixel ratio 1 and 2)                   |
| Stroke    | 1, 1.5, 2                                                        |
| Mode      | light, dark, greyscale, forced colours (`forced-colors: active`) |
| Direction | LTR and RTL (mirrored ones only)                                 |
| Context   | on `surface`, on `primary`, in a 44×44 icon-only button          |

## Measurements and bands

| Measure         | How                                                                      | Band                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Live area       | Painted bounding box of the 24px render at 8× scale                      | Inside 2–22 on both axes, centred on 12,12 within 0.5                                                                                           |
| Ink density     | Share of non-transparent pixels at 24px, 8× scale                        | Within ±40% of the median of its class (open glyph, contained object). A warning, not a gate: look at the contact sheet, then redraw or justify |
| Gap             | Smallest clear distance between non-touching strokes, from the 8× render | At least 2 units (1.5 dot–stroke, 1.5 at a triangle apex)                                                                                       |
| Grid            | Every coordinate                                                         | On the 0.25 grid; centrelines of H/V strokes on whole or half units                                                                             |
| Angles          | Every straight segment                                                   | 0°, 45° or 90° (arcs excepted)                                                                                                                  |
| Elements        | Tag allow-list                                                           | `path line polyline circle ellipse rect` only                                                                                                   |
| Attributes      | On shapes                                                                | None of: fill, stroke, transform, style, opacity, id                                                                                            |
| Detail          | Content strokes inside the container                                     | At most 4                                                                                                                                       |
| Fill-in at 16px | 16px render at DPR 1: do any two strokes merge?                          | None                                                                                                                                            |

## Family comparison

On a contact sheet at 24px with neighbours:

- Same optical size and weight as the six nearest in the family, and as six from other families.
- Same corner radius, same line length, same dot position as its family's parts.
- The shared object (document, person, arrow) is identical in every compound.

## Pairs that must be told apart at 16px

At minimum the list in `docs/design/icon.md` §6.1, plus each new pair your icon creates (for example `person`/`people`, `lock`/`unlock`, `bell`/`bell-off`, `home`/`building`, `mail`/`message`, `document`/`form`, `clock`/`schedule`). Show each pair side by side at 16px, DPR 1, greyscale. If a stranger would hesitate, redraw one.

## Accessibility

- Decorative by default; meaningful ones have a label key in all 5 locales.
- Reaches 3:1 against its background at the smallest size shipped (measure with the theme's pair; ask the orchestrator for `theme:check`).
- Survives forced colours: single colour, `currentColor` only.
- RTL decision recorded with the reason.
- No text, no flag, no brand, no gesture, no gendered or ability-coded figure. Exceptions: category `social` (the brand glyph rule in `SKILL.md`) and the gesture `like` (category `actions`, Plan 0144) beside `easy-read-thumbs-up`; both stay in the sensitivity review (`icon-library.md` §8) and are always used with words.
- Originality: no path string equals a Heroicons or Lucide path (grep). Single straight segments and dots (`M4 12h16`, `M8 15h.01`) are exempt: on our grid they have one spelling. Every path with two or more segments or a curve must be unique.

## Sign-off row (in the inventory)

`drawn` → render matrix viewed, measurements in band, family compared, pairs checked, originality grepped. `reviewed` → `ux-designer` and `accessibility-reviewer` have seen the contact sheet. Recognition testing with residents stays `pending` until a human does it.
