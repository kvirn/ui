# Wanted icons: municipal and public-sector candidates, verified against the catalogue

<!-- kv-lang-ok-file: the research quotes the Nordic and EU service names found on municipal and agency sites -->

Record of outcomes, 2026-10-16. The candidates came from `icon-municipal-candidates.md` (research) and were checked against `packages/icons/catalog.json` and `docs/design/icon-catalog.md`. **The JSON stays the source of truth.** The maintainer approved drawing the whole list (Plan 0124, no icon budget): the catalogue now has 256 drawn icons in 17 categories, including the new category `leisure-culture`. The sections below keep the verdicts of the first check (when the catalogue had 183 icons) and add each outcome.

## Result

| Verdict                           | Count | Meaning                                                                                                                |
| --------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| **Wanted, new**                   | 39    | No catalogue icon carries it without a second idea: proposed as `planned` entries (13 at priority 2, 26 at priority 3) |
| **Pending a maintainer decision** | 3     | Depends on splitting `school` from `education`                                                                         |
| **Covered by the catalogue**      | 91    | Already an icon, an alias, or an existing icon plus words                                                              |
| **Cut by the maintainer**         | 17    | Letter, numeral, emblem, stereotype or national mark (icon-catalog.md "Cuts and merges")                               |
| **Words only**                    | 33    | No honest object, or a regional service                                                                                |

Total candidates checked: 180. Every candidate lands in exactly one row.

**Outcome.** No icon budget (maintainer, 2026-10-16). Of the 39 wanted rows, 35 are drawn under their proposed name, `swimming-lanes` became an alias of the drawn `swimming-pool`, and 3 were cut after real attempts (`zoning-plan`, `place-offer`, `litter`; reasons in the Outcome column). The 3 pending rows (`school`, `preschool`, `university`) are drawn, and `school` left the aliases of `education`.

## Wanted: new

The 39 rows proposed on 2026-10-16, each with its outcome. `label` and `mirrorInRtl` are in `catalog.json`.

Proposed `planned` entries in catalogue form. `label` and `mirrorInRtl` are left to the engineer and the inventory review. Every name and alias was checked: none equals an existing name or alias, and no two rows share one.

### People and identity

| Name                 | Priority | Meaning (what it depicts)                                                                          | Proposed aliases               | Note                                                                                           | Outcome |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- | ------- |
| `delegation`         | 2        | Acting on someone's behalf (fullmakt, valtuus): two figures with a hand-over.                      | `mandate`, `power-of-attorney` | Arrow mirrors in RTL. Reads as `people`/`share`.                                               | drawn   |
| `association`        | 2        | Non-profit membership club (förening, yhdistys): a ring of three people sharing one shape.         | `club`, `society`, `forening`  | Reads as `people`. Needs words.                                                                | drawn   |
| `credentials-wallet` | 2        | Digital wallet for credentials (EU Digital Identity Wallet, Kivra ID): a phone with a card inside. | `digital-wallet`, `eudi`       | Conflict: `payment` already has the alias `wallet`. Keep this name; never alias `wallet` here. | drawn   |
| `service-desk`       | 3        | Citizen service counter (medborgarkontor, Borgerservice): counter window plus person.              | `service-point`, `front-desk`  | Reads as a reception bell or `info`.                                                           | drawn   |
| `marriage`           | 3        | Civil wedding / partnership: two interlocked rings.                                                | `wedding`, `vigsel`            | Sensitive-neutral: rings only, no heart.                                                       | drawn   |

### Maps and places

| Name                | Priority | Meaning (what it depicts)                                                                 | Proposed aliases               | Note                                                                           | Outcome                                                                                                     |
| ------------------- | -------- | ----------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `change-of-address` | 2        | Report a move (flyttanmälan, muuttoilmoitus): two houses and an arrow.                    | `moving-house`, `move`         | Top life event on every municipal site. Arrow direction needs an RTL decision. | drawn                                                                                                       |
| `zoning-plan`       | 2        | Detailed plan / land use (detaljplan, asemakaava): plot grid, footprint, dashed boundary. | `land-use-plan`, `detail-plan` | Hardest to draw: very likely to read as `map`, `layers` or `area`.             | cut: every candidate read as `map`, `table`, `document` or corner marks; use `map` or `document` plus words |
| `cemetery`          | 3        | Burial ground: a plain rounded slab; no cross, crescent or star.                          | `graveyard`, `burial`          | Religion risk: maintainer judges the slab.                                     | drawn                                                                                                       |

### Time and date

| Name            | Priority | Meaning (what it depicts)                                   | Proposed aliases                                     | Note                                                                           | Outcome |
| --------------- | -------- | ----------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | ------- |
| `book-facility` | 2        | Book a hall, pitch or room: a calendar with a door or key.  | `facility-booking`, `room-booking`, `season-booking` | Recurs on every culture-and-leisure site. Recurring slot = this plus `repeat`. | drawn   |
| `timetable`     | 3        | Weekly lesson or lecture schedule: a week grid with blocks. | `schedule-week`, `lesson-plan`                       | Reads as `calendar`/`table`. Unconfirmed on the sites read.                    | drawn   |

### Money and payments

| Name         | Priority | Meaning (what it depicts)                                                               | Proposed aliases | Note                                                                    | Outcome |
| ------------ | -------- | --------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------- | ------- |
| `calculator` | 2        | Work out a fee, merit value or repayment: dot grid under a screen bar, no numeral keys. | `fee-calculator` | Check Lucide/Material first; our own drawing is still needed for style. | drawn   |
| `refund`     | 3        | Money paid back (skatteåterbäring): a plain coin with a U-turn arrow.                   | `repayment`      | Must not mirror. Reads as `undo`.                                       | drawn   |

### Care, health and education

| Name            | Priority | Meaning (what it depicts)                                                                                 | Proposed aliases            | Note                                        | Outcome                                                                                          |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `place-offer`   | 2        | Accept, decline or keep an offered place (childcare, school, university): envelope with a two-way choice. | `accept-place`, `offer`     | Same screen in three sectors.               | cut: a choice can't be drawn under an envelope; `accept-place` and `offer` are aliases of `mail` |
| `health-record` | 2        | Your journal and results (1177, Helsenorge, OmaKanta): a page with a pulse line.                          | `journal`, `patient-record` | The peak must read at 16px.                 | drawn                                                                                            |
| `exam`          | 3        | Take or book an exam: sheet with answer boxes and a pencil; no marks.                                     | `test`, `tentamen`          | Reads as `form`/`checklist`.                | drawn                                                                                            |
| `research`      | 3        | Research and doctoral studies: a microscope.                                                              | `science`, `lab`            | Reads as `search`. A flask reads as hazard. | drawn                                                                                            |
| `sick-leave`    | 3        | Absence through illness (sjukpenning): a thermometer.                                                     | `sick-pay`                  | Reads as weather/fever. Words always.       | drawn                                                                                            |
| `business`      | 3        | Start or run a business: a shopfront with an awning.                                                      | `company`, `enterprise`     | Test against `building`.                    | drawn                                                                                            |

### Mobility and environment

| Name              | Priority | Meaning (what it depicts)                                            | Proposed aliases                     | Note                                                                              | Outcome                                                                   |
| ----------------- | -------- | -------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `ticket`          | 2        | A ticket or travel pass: a notched ticket, no price glyph.           | `travel-card`, `season-pass`, `pass` | One icon for single, period and card. Reads as `receipt`.                         | drawn                                                                     |
| `live-departures` | 2        | Next departures in real time: list rows with a signal arc.           | `departures`, `timetable-live`       | Reads as `notification`/wifi.                                                     | drawn                                                                     |
| `detour`          | 2        | Service or street diverted: a line bending around a break.           | `diversion`, `reroute`               | Also covers street diversions. Reads as `directions`/`roadworks`.                 | drawn                                                                     |
| `lost-property`   | 2        | Lost and found: a bag or umbrella with a magnifier; no suitcase.     | `lost-and-found`, `found-items`      | Recurs in transit and police pages.                                               | drawn                                                                     |
| `bulky-waste`     | 3        | Large items (grovavfall, Sperrmüll): a sofa with an arrow.           | `large-waste`                        | Sofa reads as furniture/living room.                                              | drawn                                                                     |
| `food-waste`      | 3        | Kitchen / bio waste: apple core with a leaf.                         | `bio-waste`, `organic-waste`         | Reads as fruit.                                                                   | drawn                                                                     |
| `street-light`    | 3        | A lamp post (fault reports, lighting).                               | `lamp-post`, `lighting`              | Check against `light-mode` (sun).                                                 | drawn                                                                     |
| `litter`          | 3        | Litter or an overflowing bin on a street: loose items by a post bin. | `overflowing-bin`                    | Amsterdam: over a third of 500,000 public-space reports are waste or cleanliness. | cut: eight drafts read as a lamp, trophy, pot or camera; alias of `waste` |
| `noise`           | 3        | Noise complaint (buller): sound waves with a jagged edge.            | `noise-complaint`                    | Reads as `read-aloud`/volume.                                                     | drawn                                                                     |
| `transit-stop`    | 3        | A stop or station: a pole and shelter, no number or letter.          | `bus-stop`, `station`                | Reads as `pin`/flag.                                                              | drawn                                                                     |

### Safety, law and civic life

| Name              | Priority | Meaning (what it depicts)                                                      | Proposed aliases       | Note                                                       | Outcome |
| ----------------- | -------- | ------------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------- | ------- |
| `council-meeting` | 3        | Council or committee meeting: people around a table, or a semicircle of seats. | `committee`, `council` | Reads as `people`. Drop `meeting-room` as a separate icon. | drawn   |

### Language and access

| Name          | Priority | Meaning (what it depicts)                                                               | Proposed aliases    | Note                            | Outcome |
| ------------- | -------- | --------------------------------------------------------------------------------------- | ------------------- | ------------------------------- | ------- |
| `interpreter` | 3        | Book a spoken-language interpreter: two speech bubbles with a two-way arrow, no glyphs. | `tolk`, `translate` | Overlaps `language` and `chat`. | drawn   |

### **New category** Leisure, culture and community (`leisure-culture`)

| Name             | Priority | Meaning (what it depicts)                                           | Proposed aliases                   | Note                                                     | Outcome                            |
| ---------------- | -------- | ------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------- | ---------------------------------- |
| `sports-pitch`   | 3        | Marked outdoor pitch from above: rectangle, centre line, circle.    | `pitch`, `field`, `sports-field`   | Reads as `area`. Sport names are words.                  | drawn                              |
| `sports-hall`    | 3        | Indoor hall for booking: an arched hall with court lines, no ball.  | `hall`, `gym-hall`                 | A ball reads as football only.                           | drawn                              |
| `swimming-lanes` | 3        | Swimming hall: pool with lanes and a ladder.                        | `pool`, `swimming-hall`            | Generic in other sets; ours must match.                  | alias of the drawn `swimming-pool` |
| `playground`     | 3        | Playground: a swing or slide.                                       | `play-area`                        | Check Material first. Reads as `outdoor-gym`.            | drawn                              |
| `outdoor-gym`    | 3        | Free outdoor training equipment: a pull-up frame.                   | `calisthenics`                     | Hard to tell from `playground`.                          | drawn                              |
| `trail`          | 3        | Marked foot or exercise route: dotted path past waypoints.          | `hiking-trail`, `route-marked`     | Reads as `directions`/`distance`. No paint-blaze colour. | drawn                              |
| `harbour`        | 3        | Guest harbour or boat berth: a small boat at a quay with a bollard. | `guest-harbour`, `berth`, `marina` | Not an anchor or ship (reads as `ferry`).                | drawn                              |
| `music`          | 3        | Music: one note (not a pair, which reads as audio).                 | `concert`, `choir`                 | Generic; check first.                                    | drawn                              |
| `museum`         | 3        | Museum: a framed object on a plinth (no temple front).              | `gallery`                          | Temple fronts read as `city-hall`/`law`.                 | drawn                              |

The catalogue has no sports, culture or leisure icon, while every municipal site has a "Kultur och fritid" section. Hence the one new category, `leisure-culture`; sports icons are group icons only (pitch, hall, pool, trail), and sport names stay words.

## Pending a decision (decided: split, all three drawn)

| Name         | Category       | Why                                                                                                                                                                     |
| ------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `school`     | care-education | The catalogue merges `school` into `education` (a graduation cap, which means university). A school building drawing needs the alias `school` removed from `education`. |
| `preschool`  | care-education | Only if a building container/`school` drawing exists; otherwise `education` plus words.                                                                                 |
| `university` | care-education | The cap stays `education`/becomes `university` if `school` is split off.                                                                                                |

## Conflicts to resolve in the catalogue

1. **`education` carries the aliases `school` and `training`** and is drawn as a graduation cap (university). To give schools a building drawing, `school` must leave `education`'s aliases (no alias may equal another icon's name).
2. **`payment` had the alias `wallet`**; `credentials-wallet` is a different thing (identity, not money). `wallet` is now its own drawn icon, `payment` no longer carries it, and `credentials-wallet` stays separate.
3. **`area` has the alias `zone`** (a map polygon). A fare zone or low-emission zone is words.
4. **`certificate` takes `permit`, `licence`, `diploma`.** Building, parking, driving and event permits therefore have no icon of their own. If a specific permit icon is wanted later, it must be a separate drawing, not an alias.
5. **`emergency` (a beacon) has the aliases `alarm`, `siren`.** An outdoor warning siren on a pole (public alert) is covered, not separate.
6. **The first round named four icons the catalogue already has:** `town-hall` is `city-hall`, `court` is `law`, `road-works` is `roadworks`, `recycling` is `recycle`. The catalogue names win.

## Cut by the maintainer (needs the maintainer to reopen)

- `tax`: `tax`: document or `invoice`.
- `passport`: `passport`: use `id-card`.
- `easy-read`: `easy-read`: national marks; the consumer supplies it.
- `hearing-loop`: `hearing-loop`: carries a "T".
- `audio-description`: `audio-description`: carries "AD".
- `shelter`: `shelter`: the civil-defence sign is national.
- `shelter-support`: `shelter`.
- `public-toilet`: `toilet`: gendered figures.
- `accessible-toilet`: `toilet`.
- `step-free-access`: `entrance`: accessible entrance is words with `accessibility`.
- `lift`: `entrance`.
- `parking-permit`: `parking`: "P"; words with `car`.
- `parking-disc`: `parking`.
- `park-and-ride`: `parking`.
- `ev-charging`: `charging`: energy and a car are two ideas.
- `report-incident`: `police`/`report`.
- `road-charge`: two ideas, no component need (not named in the catalogue).

Of these, `step-free-access`, `lift`, `public-toilet` and `accessible-toilet` are the ones the research found on real sites and the cuts removed; the catalogue's answer is words with `accessibility`. Reopen only with the maintainer.

## Covered by the catalogue

| Candidate                 | Existing icon   | How                                                                                                                         |
| ------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `e-id`                    | `id-card`       | alias already                                                                                                               |
| `town-hall`               | `city-hall`     | alias already                                                                                                               |
| `court`                   | `law`           | alias already                                                                                                               |
| `home-care`               | `care`          | alias already                                                                                                               |
| `waste-collection`        | `waste`         | alias already                                                                                                               |
| `snow-clearing`           | `snow`          | alias already                                                                                                               |
| `event`                   | `calendar`      | alias already (the festival tent is not needed)                                                                             |
| `prescription`            | `medication`    | alias already                                                                                                               |
| `tram`                    | `train`         | alias already                                                                                                               |
| `metro`                   | `train`         | alias already                                                                                                               |
| `zone`                    | `area`          | alias is the map polygon; a fare zone is words                                                                              |
| `sign-language`           | –               | cut on 2026-10-16 after attempts (a hand with a motion arc reads as a wave or stop); words, or a mark the consumer supplies |
| `read-aloud`              | `read-aloud`    | drawn                                                                                                                       |
| `id-card`                 | `id-card`       | drawn                                                                                                                       |
| `signature`               | `signature`     | drawn                                                                                                                       |
| `vote`                    | –               | cut on 2026-10-16 (a ballot box reads as `lock` or a bag); words or `form` plus words                                       |
| `accessibility-statement` | `accessibility` | `accessibility` plus words                                                                                                  |
| `digital-mailbox`         | `mail`          | `mail` (inbox merged) plus `lock`/words                                                                                     |
| `minutes`                 | `document`      | `document` plus words                                                                                                       |
| `notice-board`            | `news`          | `news` (announcement)                                                                                                       |
| `public-records`          | `archive`       | `archive` (records)                                                                                                         |
| `public-consultation`     | `chat`          | `chat` (feedback)                                                                                                           |
| `waiting-room`            | `pending`       | `pending`                                                                                                                   |
| `child-health-clinic`     | `health`        | `health`                                                                                                                    |
| `care-home`               | `care`          | `care` plus words                                                                                                           |
| `school-lunch`            | `meal`          | `meal` (school-meals alias)                                                                                                 |
| `meal-delivery`           | `meal`          | `meal` plus words                                                                                                           |
| `benefits`                | `benefit`       | `benefit` (allowance, grant)                                                                                                |
| `student-loan`            | `benefit`       | `benefit` plus words                                                                                                        |
| `housing-queue`           | `home`          | `home` plus `pending`                                                                                                       |
| `recycling-centre`        | `recycle`       | `recycle` plus words                                                                                                        |
| `waste-sorting`           | `recycle`       | `recycle` (alias sorting)                                                                                                   |
| `wheelie-bin`             | `waste`         | `waste` is a wheeled bin with a lid                                                                                         |
| `drinking-water`          | `water`         | `water`                                                                                                                     |
| `sewage`                  | `water`         | `water` plus words                                                                                                          |
| `water-leak`              | `water`         | `water` plus words                                                                                                          |
| `report-fault`            | `repair`        | `repair` (alias fault-report)                                                                                               |
| `road-damage`             | `roadworks`     | `roadworks`/`repair`                                                                                                        |
| `road-works`              | `roadworks`     | `roadworks`                                                                                                                 |
| `building-permit`         | `certificate`   | `certificate` (alias permit) plus `building`                                                                                |
| `driving-licence`         | `certificate`   | `certificate` (alias licence)                                                                                               |
| `dog-licence`             | `certificate`   | `certificate` plus words (regional)                                                                                         |
| `property-boundary`       | `area`          | `area`                                                                                                                      |
| `low-emission-zone`       | `area`          | `area` plus words                                                                                                           |
| `public-alert`            | `emergency`     | `emergency` (alias siren, alarm)                                                                                            |
| `emergency-call`          | `phone`         | `phone` plus `emergency`                                                                                                    |
| `safety-alarm`            | `emergency`     | `emergency` (alias alarm)                                                                                                   |
| `accessible-transport`    | `bus`           | `bus` plus `accessibility`                                                                                                  |
| `school-transport`        | `bus`           | `bus` plus `education`                                                                                                      |
| `replacement-bus`         | `bus`           | `bus` plus words                                                                                                            |
| `bike-share`              | `bike`          | `bike` plus words                                                                                                           |
| `bike-parking`            | `bike`          | `bike` plus words                                                                                                           |
| `bike-on-board`           | `bike`          | `bike` plus words                                                                                                           |
| `cycle-path`              | `bike`          | `bike`                                                                                                                      |
| `e-scooter`               | `bike`          | `bike` plus words                                                                                                           |
| `on-demand-transport`     | `bus`           | `bus` plus words                                                                                                            |
| `patient-travel`          | `bus`           | `bus` plus `health`                                                                                                         |
| `travel-card`             | `ticket`        | merged into `ticket` (wanted), alias travel-card                                                                            |
| `tap-in`                  | `ticket`        | `ticket` (wanted) plus words                                                                                                |
| `term-dates`              | `calendar`      | `calendar`                                                                                                                  |
| `season-booking`          | `calendar`      | `book-facility` (wanted) plus `repeat`                                                                                      |
| `tree-felling`            | `tree`          | `tree` plus words                                                                                                           |
| `power-outage`            | `energy`        | `energy` plus words                                                                                                         |
| `fire-ban`                | `fire`          | `fire` plus `blocked`                                                                                                       |
| `parental-leave`          | `family`        | `family` plus `benefit`                                                                                                     |
| `case-status`             | `folder`        | `folder` plus `pending`/`in-progress`                                                                                       |
| `family-day-care`         | `education`     | `education`/`care` plus words                                                                                               |
| `open-preschool`          | `education`     | `education` plus words                                                                                                      |
| `after-school-care`       | `education`     | `education` plus words                                                                                                      |
| `school-catchment`        | `education`     | `education` plus `area`                                                                                                     |
| `arts-school`             | `education`     | `education` plus `music`                                                                                                    |
| `apprenticeship`          | `job`           | `job` plus words                                                                                                            |
| `credential-recognition`  | `certificate`   | `certificate` plus words                                                                                                    |
| `title-deed`              | `certificate`   | `certificate` plus `building`                                                                                               |
| `bridge`                  | `roadworks`     | words (low priority)                                                                                                        |
| `street-cleaning`         | `repair`        | `repair` plus words                                                                                                         |
| `pest-control`            | `repair`        | `repair` plus words                                                                                                         |
| `abandoned-vehicle`       | `car`           | `car` plus `blocked`                                                                                                        |
| `illegal-dumping`         | `waste`         | `waste` plus `warning`                                                                                                      |
| `graffiti`                | `repair`        | `repair` plus words                                                                                                         |
| `hazardous-waste`         | `waste`         | `waste` plus `warning`                                                                                                      |
| `electronic-waste`        | `waste`         | `waste` plus words                                                                                                          |
| `reuse`                   | `recycle`       | `recycle` plus words                                                                                                        |
| `underground-container`   | `waste`         | `waste` plus words                                                                                                          |
| `bottle-bank`             | `recycle`       | `recycle` plus words                                                                                                        |
| `litter-bin`              | `waste`         | `waste` plus words                                                                                                          |
| `storm-drain`             | `water`         | `water` plus words                                                                                                          |
| `boil-water-notice`       | `water`         | `water` plus `attention`                                                                                                    |
| `water-sample`            | `water`         | `water` plus words                                                                                                          |
| `meter-reading`           | `energy`        | `energy`/`water` plus words                                                                                                 |
| `invasive-species`        | `tree`          | `tree` plus `warning`                                                                                                       |

## Words only

`other-languages`, `transcript`, `braille`, `relay-service`, `assistance-dog`, `official-seal`, `citizen-proposal`, `appeal`, `whistleblower`, `tender`, `memorial`, `birth`, `death`, `walking-aid`, `dementia`, `chimney-sweep`, `assembly-point`, `preparedness-kit`, `out-of-hours-care`, `ice-rink`, `ski-trail`, `allotment`, `running-track`, `community-hall`, `youth-centre`, `meeting-place`, `meeting-room`, `arts-and-crafts`, `market`, `grades`, `lab-results`, `special-support`.

Reasons (from the research): no object without a stereotype, a brand, a letter or a legal system's image (`appeal`, `whistleblower`, `tender`, `dementia`, `walking-aid`); the picture does not survive 16px (`braille`); or the service is regional (`chimney-sweep`, `ice-rink`, `ski-trail`, `allotment`). `birth` and `death` fall under the catalogue's `child`/religion cuts. `meeting-room` folds into `council-meeting`.

## Follow-up list, 2026-10-16 (23 icons)

A second list for the sets a municipality site meets in emergency, transit, identity and media controls. 22 are drawn; `sign-language` was cut a second time, for the same reason as before.

| Outcome | Names                                                                                                                                                                                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| drawn   | `ambulance`, `police`, `firetruck`, `tram`, `subway`, `government`, `wheelchair`, `gender-male`, `gender-female`, `gender-non-binary`, `gender-fluid`, `tag`, `hashtag`, `direct-message`, `pin-remove`, `cash`, `wallet`, `theatre`, `translate`, `view-columns`, `skip-next`, `skip-previous` |
| cut     | `sign-language` (second time)                                                                                                                                                                                                                                                                   |

`police` and `theatre` were cut or words-only in the first check; they are drawn now on the maintainer's approval of this list. `tram` was an alias of `train` and now has its own drawing. `wallet` is a drawn icon and no longer an alias of `payment`; `credentials-wallet` stays separate.

Aliases added to existing icons: `user` and `users` (of `person` and `people`), `commenting` (`chat`), `security` (`shield`), `save` (`download`), `update` (`refresh`), `grid` (`view-grid`), `list` (`bullet-list`), `time` (`clock`), `date` (`calendar`) and `loading` and `spinner` (`in-progress`).

Still out: brand logos, and like, heart and star icons.

## Open for the maintainer (status after drawing)

1. Priority-2 and priority-3 lists: approved and drawn (Plan 0124, 2026-10-16).
2. The category `leisure-culture`: added.
3. `school` split from `education`, with `university` and `preschool`: done and drawn. The `building` container question is not needed by any drawn icon.
4. Reopening cuts (`step-free-access`, `public-toilet`, `passport`, `tax`): not reopened. `police` is drawn from the follow-up list.
5. Recognition testing with residents is pending for every drawn icon.

## Add, remove and off variants, 2026-10-16 (17 requested)

The maintainer asked for the missing add/remove/off pairs. Drawn (14): `person-remove`, `calendar-remove`, `document-add`, `document-remove`, `folder-add`, `folder-remove`, `mail-add`, `mail-remove`, `mail-off`, `video-call-off`, `mobile-off`, `image-add`, `image-remove`, `attachment-remove`. Cut after drawing attempts (3): `building-add` and `building-remove` (the badge leaves no room for the door; without it the building reads as a page), `phone-off` (the kit slash runs along the handset's spine; use `phone` with words). Badged and slashed variants never mirror. Details and open questions are in `icon-library.md` (§5, §8) and `icon-catalog.md`.
