# Plan 0146: Icons for toilets, dentist and health centre

- **Status:** Done (gates green, reviewer APPROVE 2026-10-20; recognition test and AT pending, human checks)
- **Owner:** lead (orchestrator)
- **Requested:** by the maintainer, 2026-10-20

## Goal

Three new outline icons in `@kvirn-ui/icons`: `toilets`, `dentist` and `health-centre`, drawn to `docs/design/icon.md` §6.1 and recorded like the Plan 0144 batches in `docs/design/icon-library.md`.

| Name            | Category               | Meaning                                                   | Tags                                               |
| --------------- | ---------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| `toilets`       | `mobility-environment` | Public toilets: a place to use a toilet.                  | toilet, wc, restroom, lavatory, public convenience |
| `dentist`       | `care-education`       | A dentist: dental care.                                   | dentist, dental, tooth, teeth, oral health         |
| `health-centre` | `care-education`       | Primary health care: a health centre or doctor's surgery. | health centre, clinic, doctor, surgery, legekontor |

## Constraints

- No letters or numerals (§6.1, `icon.md:200`): no "WC". No gendered figures (the reason `toilet` was cut, `icon-catalog.md:658`): a bowl or fixture, not the male/female pictogram.
- `dentist` reads differently from `health` (stethoscope) at 20px, and the tooth stays legible at 16px (the reason `dental` was cut, `icon-catalog.md:657`).
- `health-centre` is distinct from `health` (the stethoscope stays the general/hospital health-care icon) and from `dentist`. No cross: it reads as the protected Red Cross emblem (`first-aid` cut).
- Every icon is an object: none mirrors in RTL. Label key None, as Plan 0144 batch G: the button or text carries the name. No i18n change.

## Decisions

- 2026-10-20: the maintainer reverses the cuts of `toilet` and `dental` (`icon-catalog.md` Cuts and merges) by requesting these icons; the reasons are met by the constraints above, as with the 2026-10-19 reversals in Plan 0144. Names as the maintainer gave them; `toilet`, `public-toilet` and `dental` become aliases if the iconographer agrees they don't collide.
- Plan number 0146: 0145 was used by commit 1bb12dd6.
- 2026-10-20 (T1): metaphors: `toilets` a toilet in profile (cistern, bowl, pedestal); `dentist` a molar, one closed path; `health-centre` the kit's public building with the kit's pulse blip across the wall. The roof is 1 unit higher than `hotel` (eaves y 8) so the band and the door stay open at 16px: accepted, a per-icon construction choice, not a keyline change.
- Aliases: `toilets` → `toilet`, `public-toilet`, `restroom`; `dentist` → `dental`, `tooth`; `health-centre` → `health-center`, `clinic`, `primary-care`. `surgery` (an operation in US English) and `doctor` (a person) stay tags only. None collides (checked by the iconographer).
- The `health-centre` search tags hold no Swedish service name: `packages/icons/src/icons.test.ts:119` keeps aliases and tags ASCII. The maintainer chose (2026-10-20) to drop the tag: no `vardcentral`, no test change. `clinic`, `health centre` and `primary-care` find the icon.
- `health` keeps its `doctor` and `clinic` tags: removing them changes an existing icon's search, out of this plan's scope. Both icons match those searches.
- The maintainer keeps the pulse blip (2026-10-20), although it may read as a crack at large sizes; it goes first in the recognition test. `icon-catalog.md` says "Always with words; from 20px" (reviewer, non-blocking). Recognition testing pending for all three: a human check, never claimed by an agent.

## Tasks

- [x] 1. `iconographer`: draw the three SVGs in `packages/icons/svg/`, viewed at 16/20/24px beside `health`, `medication`, `vaccination`, `health-record`, `care`, `water`, `waste`; record them as a "Plan 0146 additions" table in `docs/design/icon-library.md` (after batch G, `:1034`) and in §6 Inventory.
- [x] 2. `component-engineer`: `catalog.json` entries (shape of `health`, `catalog.json:1640`), run the generator, update `icon-catalog.md` (rows in the care and mobility tables, move `toilet` and `dental` out of the cut list as reversed 2026-10-20), the icon story count if it has one, and any check-gaps or count test.
- [x] 3. lead: gates (`vp check`, `vp test run` on the icons package and icons story), then `accessibility-reviewer` on the diff.
- [x] 4. lead: record, `vp fmt`, delete this plan in the finishing change, commit message proposed.
