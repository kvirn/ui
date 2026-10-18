> Research only. The outcome of every candidate (drawn, cut or alias) is in `icon-wanted.md`.

<!-- kv-lang-ok-file: the research quotes the Nordic and EU service names found on municipal and agency sites -->

# Municipal icon candidates (research, not an inventory)

A list of the icons a Nordic/EU municipality site needs that Lucide, Heroicons and Material lack or get wrong, and what each must represent. Feeds the open families of Plan 0124 (`icon-library.md` §6). Nothing here is drawn, named for good, or approved. **The verified result, checked against the catalogue, is `icon-wanted.md`.**

Researched 2026-10-16 from municipal sites (SE, FI, NO, DK, NL, DE, FR, IE) and the icon sets of DSFR, NL Design System (Utrecht), Amsterdam, Suomi.fi, Nav Aksel, ISO 7001/7010 and ARASAAC. "Seen" means the service area is listed on the site, not that the site draws an icon for it. The gap against Lucide and Material is from memory and file names: **check each name against the sets before drawing.**

**Scope:** `U` one universal icon, the label is per country · `V` the concept differs per country, so a variant may be needed · `W` words only, no icon.

**Rules every row obeys** (Plan 0124): no letters, numerals, flags or colour meaning. That kills the "P" of parking, the "T" of the hearing loop, "€", "112", waste-fraction colours, and any national logo. The icon never carries the service name: it always comes with words.

## Language and reading

| Name                      | Must represent                                                             | Scope | Note                                                                                                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `easy-read`               | This page has an easy-to-read version (lättläst, selkokieli, lettlest, LL) | U / W | Generic marker only: a page with short, widely spaced lines. The official marks (Inclusion Europe, Selkokeskus, LL-center, Netzwerk) are licensed, unmodifiable: shown as supplied images, never redrawn. Reads as `document`. |
| `sign-language`           | Content or service in sign language                                        | U     | Two hands signing. The label names the language: Svenskt teckenspråk, viittomakieli and norsk tegnspråk are different languages. Reads as wave or applause.                                                                    |
| `interpreter`             | Book a spoken-language interpreter (tolk, tulkki)                          | U     | Two speech bubbles with a two-way arrow, no glyphs (Lucide `languages` shows letters). Overlaps `language` globe.                                                                                                              |
| `other-languages`         | Separate pages in other languages (not the switcher)                       | U     | Stack of bubbles. Only worth drawing if the globe stays "switch this page".                                                                                                                                                    |
| `read-aloud`              | Listen to this page                                                        | U     | Text lines plus sound arcs. Reads as volume.                                                                                                                                                                                   |
| `transcript`              | Text version of audio or video                                             | U     | Lines plus arcs, the lines on the other side from `read-aloud`.                                                                                                                                                                |
| `audio-description`       | Narration of what is on screen (syntolkning)                               | U / W | Weakest on the list: eye plus arcs. Text first.                                                                                                                                                                                |
| `hearing-loop`            | Induction loop / assistive listening available                             | U / W | ISO's mark needs a "T". Needs an ear plus loop curl, no slash (`ear-off` reads as "deaf"). Drop to words if it can't read.                                                                                                     |
| `braille`                 | Braille available                                                          | U     | 2×3 dots. Disappears at 16px, reads as dice.                                                                                                                                                                                   |
| `relay-service`           | Video relay for deaf users (förmedlingstjänst, kuvapuhelu)                 | U     | Video frame plus hands. Overlaps `sign-language`.                                                                                                                                                                              |
| `accessibility-statement` | Link to the accessibility statement (WAD)                                  | U     | Document plus the universal-access figure. Must not read as wheelchair only.                                                                                                                                                   |

## Physical access

| Name                | Must represent          | Scope | Note                                                                                          |
| ------------------- | ----------------------- | ----- | --------------------------------------------------------------------------------------------- |
| `step-free-access`  | Ramp or level entrance  | U     | ISO 7001 AC 002. The ISA wheelchair is a learned convention; check it isn't a protected mark. |
| `lift`              | Accessible lift         | U     | Reads as `arrows-up-down`.                                                                    |
| `accessible-toilet` | Accessible toilet       | U     | Low priority.                                                                                 |
| `assistance-dog`    | Assistance dogs welcome | U     | Low priority.                                                                                 |
| `public-toilet`     | A public toilet         | U     | A bowl, not the loaded male/female figures.                                                   |

## Identity, mandates and post

| Name                | Must represent                                                  | Scope | Note                                                                                                                              |
| ------------------- | --------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| `e-id`              | Strong electronic identification                                | U     | Person with a shield. BankID, Freja, MitID, ID-porten, Suomi.fi tunnistus are brands: use their official button, never draw them. |
| `id-card`           | An identity card                                                | U     | Check Lucide first.                                                                                                               |
| `passport`          | Passport and ID services                                        | U     | Booklet, no crest.                                                                                                                |
| `delegation`        | Acting on someone's behalf (fullmakt, valtuus)                  | U     | Two people with a hand-over; the arrow mirrors in RTL. Reads as `users` or `share`.                                               |
| `signature`         | Sign a document                                                 | U     | Document plus a scribble line.                                                                                                    |
| `official-seal`     | Official, stamped, verified                                     | U     | Scalloped seal.                                                                                                                   |
| `digital-mailbox`   | Secure government inbox (Digital Post, Kivra, Suomi.fi Viestit) | V     | Envelope plus lock. Mailbox shapes and the post horn differ per country: avoid both.                                              |
| `change-of-address` | Report a move (flyttanmälan, muuttoilmoitus)                    | U     | Two houses plus an arrow.                                                                                                         |

## Democracy and administration

| Name                  | Must represent                                                     | Scope | Note                                                                                            |
| --------------------- | ------------------------------------------------------------------ | ----- | ----------------------------------------------------------------------------------------------- |
| `town-hall`           | The municipality's building (rådhus, kaupungintalo)                | V     | Columns read as bank/court/museum, flags as national. Plain pediment plus small tower or clock. |
| `council-meeting`     | Council or committee meeting (kommunfullmäktige, nämnd)            | U     | People around a table from above, or a semicircle of seats. Reads as `users`.                   |
| `minutes`             | Meeting minutes and decisions (protokoll, pöytäkirja)              | U     | Document with a signature line.                                                                 |
| `vote`                | Election, voting                                                   | U     | Hand dropping a paper into a ballot box (a pencil-on-box is Dutch). Lucide `vote` may suffice.  |
| `notice-board`        | Official online notice board (anslagstavla, ilmoitustaulu)         | U     | Board with pinned sheets. A pushpin reads as `pin`.                                             |
| `public-records`      | Request public records / case files (allmän handling, innsyn)      | U     | Document plus eye. The legal concept is Nordic, the icon isn't.                                 |
| `citizen-proposal`    | Resident's proposal / petition (medborgarförslag, kuntalaisaloite) | U     | Nobody draws it. Document plus raised hand. Reads as feedback.                                  |
| `public-consultation` | Consultation / hearing (samråd, høring, inspraak)                  | U     | Bubbles plus document. Hard to tell from the petition.                                          |
| `appeal`              | Right to appeal a decision (överklaga, valitus, klage)             | U     | Document plus return arrow. Scales mean "court".                                                |
| `court`               | Courts and legal matters                                           | U     | Scales (a gavel is Anglo-US).                                                                   |
| `whistleblower`       | Whistleblower channel (EU directive)                               | U     | Whistle reads as sport. Low priority.                                                           |
| `tender`              | Public procurement notice (upphandling, hankinta)                  | U     | Document plus stamp or inbox. No metaphor.                                                      |
| `service-desk`        | Citizen service counter (medborgarkontor, Borgerservice)           | U     | Counter window plus person. Reads as reception bell or `info`.                                  |
| `waiting-room`        | Appointment / queue / opening hours                                | U     | Clock plus seated person. `calendar` covers dates only.                                         |
| `memorial`            | Monument, remembrance                                              | U     | Plain obelisk. Low priority.                                                                    |
| `tax`                 | Municipal tax and fees                                             | V     | No "€" or "%". Document plus stamp. What a municipality levies differs per country.             |

## Life events and register

| Name          | Must represent                      | Scope | Note                                                                          |
| ------------- | ----------------------------------- | ----- | ----------------------------------------------------------------------------- |
| `birth`       | Register a birth                    | U     | Wrapped baby.                                                                 |
| `marriage`    | Civil wedding / partnership         | U     | Two interlocked rings (the heart means favourite).                            |
| `death`       | Death, estate                       | U     | Plain stone.                                                                  |
| `cemetery`    | Burial ground, grave plots          | V     | No cross, crescent or star (religion). Plain rounded slab. Reads as a tablet. |
| `dog-licence` | Dog registration / tax (DE, NL, IE) | V     | Tag or collar. Not used in SE/FI.                                             |

## Children, school and care

| Name                   | Must represent                                               | Scope | Note                                                              |
| ---------------------- | ------------------------------------------------------------ | ----- | ----------------------------------------------------------------- |
| `preschool`            | Preschool / kindergarten (förskola, päiväkoti, barnehage)    | U     | Swing or slide; blocks. Reads as toy.                             |
| `school`               | School as a place                                            | U     | Building with a clock. The mortarboard means university.          |
| `after-school-care`    | Fritidshem, SFO, iltapäivätoiminta                           | V     | Child plus sun/clock. Reads as preschool.                         |
| `school-lunch`         | School meal and menu                                         | U     | Tray plus plate. Fork and knife reads as restaurant.              |
| `child-health-clinic`  | BVC, neuvola, helsestasjon                                   | V     | Baby plus heart. No cross (protected emblem).                     |
| `home-care`            | Home help / home nursing (hemtjänst, kotihoito)              | U     | House plus hand. A heart reads as favourite.                      |
| `care-home`            | Residential care for older people (äldreboende)              | V     | Bed inside a house outline. No stooped figure with a cane.        |
| `safety-alarm`         | Personal alarm (trygghetslarm, turvahälytys)                 | U     | Pendant plus waves. Reads as bell.                                |
| `walking-aid`          | Assistive devices (hjälpmedel, apuvälineet)                  | U     | Rollator. Reads as old age.                                       |
| `accessible-transport` | Special transport (färdtjänst)                               | U     | Van plus ramp. Reads as ambulance.                                |
| `meal-delivery`        | Meals on wheels                                              | V     | Low priority.                                                     |
| `dementia`             | Dementia support                                             | W     | The puzzle piece is contested. Words.                             |
| `benefits`             | Income support, grants (ekonomiskt bistånd, toimeentulotuki) | U     | Cupped hands (hand plus coin reads as donate). No currency glyph. |
| `housing-queue`        | Municipal housing queue (bostadskö, boligkø)                 | V     | House plus a line of dots (no numerals).                          |
| `shelter-support`      | Homelessness, refugee, integration services                  | W     | No neutral icon: a suitcase or boat stigmatises. Words.           |

## Waste, water, streets

| Name                    | Must represent                                             | Scope | Note                                                                                                   |
| ----------------------- | ---------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------ |
| `recycling-centre`      | Staffed drop-off site (återvinningscentral, Wertstoffhof)  | U     | Yard plus arrows. Reads as the loop or a factory.                                                      |
| `waste-sorting`         | Sorting waste into fractions                               | U     | Several compartments. The fractions are named in words, never by icon colour.                          |
| `wheelie-bin`           | Kerbside household bin (kärl, rolcontainer)                | U     | Lid and wheels, or it is the `delete` bin.                                                             |
| `bulky-waste`           | Large items (grovavfall, grofvuil, Sperrmüll)              | U     | Sofa plus arrow. Reads as furniture.                                                                   |
| `hazardous-waste`       | Chemicals, batteries, paint                                | U     | No skull or flame (CLP diamond is coloured). Reads as warning or flask.                                |
| `electronic-waste`      | WEEE: electrical items to collection point                 | U     | EU-defined crossed-out bin; the cross reads as "forbidden". Draw the item.                             |
| `food-waste`            | Kitchen/bio waste                                          | U     | Apple core plus leaf.                                                                                  |
| `reuse`                 | Second-hand / reuse depot (ombruk, kringloop)              | U     | Reads as the recycle loop.                                                                             |
| `bottle-bank`           | Neighbourhood glass/paper collection point                 | V     | Shapes differ per country. Bottle plus slot.                                                           |
| `underground-container` | Street-level drop for underground waste container          | V     | Niche. Reads as manhole.                                                                               |
| `waste-collection`      | Collection round and day                                   | U     | Truck lifting a bin, or calendar plus bin.                                                             |
| `drinking-water`        | Tap water / water utility                                  | U     | Glass under a tap. Pairs with `text-color` drop.                                                       |
| `sewage`                | Wastewater, drains (avlopp, viemäri)                       | U     | Pipe plus downward flow. Reads as drain or tap.                                                        |
| `water-leak`            | Water leak or disruption                                   | U     | Pipe plus drop.                                                                                        |
| `meter-reading`         | Submit a water/energy meter reading                        | U     | Gauge. Reads as speedometer.                                                                           |
| `report-fault`          | Report a fault in public space (felanmälan, Mängelmelder)  | U     | Highest risk: pin plus wrench/bubble reads as `pin`, `warning` or `settings`. Needs a strong metaphor. |
| `street-light`          | Lamp out of order                                          | U     | Check Lucide.                                                                                          |
| `road-damage`           | Pothole / cracked road                                     | U     |                                                                                                        |
| `road-works`            | Street works, diversions (vägarbete)                       | U     | Cone or barrier. The warning triangle is a coloured sign.                                              |
| `snow-clearing`         | Snow plough, gritting (snöröjning, brøyting, Winterdienst) | V     | Nordic/DE. Plough front plus snow.                                                                     |
| `chimney-sweep`         | Chimney and stove inspection (feiing)                      | V     | NO/DK/DE/FI/SE. Chimney plus brush.                                                                    |
| `ev-charging`           | Charging point                                             | U     | Check Lucide `plug-zap`.                                                                               |

## Planning, property, transport

| Name                | Must represent                                      | Scope | Note                                                                                                   |
| ------------------- | --------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------ |
| `building-permit`   | Apply for a building permit (bygglov, rakennuslupa) | U     | House plus document plus check. Nobody draws it.                                                       |
| `zoning-plan`       | Detailed plan / land use (detaljplan, asemakaava)   | U     | Very high risk of reading as `map`, `layers` or `area`. Plot grid plus footprint plus dashed boundary. |
| `property-boundary` | Plot, lot (tomt, tontti)                            | U     | Reads as `area`.                                                                                       |
| `parking-permit`    | Resident/visitor parking permit                     | U     | No "P". Car in a bay plus card.                                                                        |
| `parking-disc`      | Time-limited parking disc                           | V     | Clock face only; reads as a clock. Candidate for words.                                                |
| `park-and-ride`     | Car park linked to transit                          | U     | Car plus train, no "P".                                                                                |
| `low-emission-zone` | Zone with entry rules                               | V     | Area plus car plus leaf. Reads as `area`.                                                              |
| `travel-card`       | Public transport pass                               | U     | Card plus tap waves. Reads as credit card.                                                             |

## Crisis, culture, leisure

| Name                | Must represent                                | Scope | Note                                                                                   |
| ------------------- | --------------------------------------------- | ----- | -------------------------------------------------------------------------------------- |
| `public-alert`      | Warning to the public (VMA, "Hesa Fredrik")   | V     | Pole, horn and waves. Lucide `siren` is a vehicle beacon. Reads as `megaphone`/`bell`. |
| `emergency-call`    | Call emergency services (112)                 | U     | Phone plus alert mark; the number is text. Reads as `phone`.                           |
| `shelter`           | Public shelter (skyddsrum, väestönsuoja)      | V     | Enclosed room plus person. The sign is a coloured triangle: reads as warning.          |
| `assembly-point`    | Emergency meeting point                       | U     | People inside four inward arrows (ISO 7010 E007 relies on green).                      |
| `preparedness-kit`  | Household emergency kit (egenberedskap)       | U     | No cross, no plus. Reads as toolbox.                                                   |
| `out-of-hours-care` | Emergency medical service (legevakt, jour)    | V     | Moon plus health symbol. Reads as night mode.                                          |
| `sports-hall`       | Hall for booking                              | U     | Arched hall plus ball. Reads as hangar.                                                |
| `ice-rink`          | Ice rink (ishall, jäähalli)                   | V     | Skate boot. Nordic/NL.                                                                 |
| `ski-trail`         | Groomed cross-country track (latu, skidspår)  | V     | Niche. Reads as road.                                                                  |
| `allotment`         | Allotment garden (koloniträdgård, kolonihave) | V     | SE, DK, DE, NL, FI.                                                                    |
| `playground`        | Playground (lekplats)                         | U     | Check Material first.                                                                  |

## Round 2 (interest groups, schools, agencies, transit, maintenance)

Researched the same way, 2026-10-16. Many pages 404'd or blocked (listed per area in the agents' notes, not repeated): treat "seen" as "listed on the site", and re-check each name against `packages/icons/catalog.json` (183 planned names) before drawing. Scope key as above. Rows marked **draw** are the ones with a clear object at 16-24px; the rest are a composition of existing icons plus words.

### Education and childcare

| Name                     | Must represent                                                           | Scope | Note                                                                                |
| ------------------------ | ------------------------------------------------------------------------ | ----- | ----------------------------------------------------------------------------------- |
| `open-preschool`         | Drop-in play with the parent staying (öppen förskola, perhetalo)         | V     | Adult and child on a mat. Reads as `preschool`. Else words.                         |
| `family-day-care`        | Childminder's home (pedagogisk omsorg, perhepäivähoito)                  | U     | House outline plus one small figure. Reads as `home`.                               |
| `place-offer`            | Accept, decline or keep an offered place (childcare, school, university) | U     | **Draw**: the same screen exists in three sectors. Envelope plus a two-way choice.  |
| `calculator`             | Work out a fee, merit value or repayment                                 | U     | Dot grid under a screen bar; no keys with numerals. Check Lucide first.             |
| `exam`                   | Take or book an exam, national tests                                     | U     | Sheet with answer boxes plus pencil; no marks or grades.                            |
| `grades`                 | Results, transcript                                                      | U / W | No "A+", numerals or stars. Rows with level marks, or `certificate` plus words.     |
| `timetable`              | Weekly lesson or lecture schedule                                        | U     | Week grid with blocks. Reads as `calendar`/`table`. Unconfirmed on the pages read.  |
| `term-dates`             | School term, holidays                                                    | U     | Calendar with a marked span. A sun clashes with `light-mode`.                       |
| `school-transport`       | Free or subsidised travel to school (skolskjuts)                         | V     | `bus` plus words. Taxi in FI, pass in NL. Shared with transit.                      |
| `school-catchment`       | The school your address belongs to; school choice                        | V     | School plus dashed boundary. High risk of reading as `area`/`pin`.                  |
| `student-loan`           | Study loan and repayment                                                 | V     | Needs a return arrow, no "€". Grant alone: `benefit`.                               |
| `research`               | Research, doctoral studies                                               | U     | Microscope. Reads as `search`. A flask reads as hazard.                             |
| `university`             | Higher education                                                         | U     | The mortarboard is the stable symbol but must not stand for schools (see decision). |
| `arts-school`            | Municipal music/arts school (kulturskola)                                | V     | One instrument, no clef. Same row as `culture-school` in round 1: merge.            |
| `apprenticeship`         | Learning on the job (lärling, læreplass)                                 | V     | Tool plus open book; no hard hat.                                                   |
| `credential-recognition` | Foreign diploma checked                                                  | U     | `certificate` plus two-way arrow. Low priority.                                     |

Words plus an existing icon: `special-support`, `adult-education`, `language-course`, `folk-high-school` (not a "high school": never label it so), `pupil-welfare`, `absence-report`, `bullying-report` (no figures hitting or crying), `mother-tongue`, `exchange-studies`. Brand portals (Wilma, Skolplattformen, Ladok, Studielink, Vigo) are never drawn.

### Associations, sports, culture

| Name                                                              | Must represent                                         | Scope | Note                                                                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------ | ----- | ----------------------------------------------------------------------------------------------------------- |
| `association`                                                     | A non-profit membership club (förening, yhdistys)      | V     | Ring of three people sharing one shape. Reads as `people`.                                                  |
| `book-facility`                                                   | Book a hall, pitch or room once                        | U     | **Draw**: `calendar` plus a door or key. Recurs on every site.                                              |
| `season-booking`                                                  | A recurring weekly slot for a season                   | V     | `calendar` plus repeat. Separate from `book-facility`.                                                      |
| `meeting-room`                                                    | A room to hire                                         | U     | Table and chairs. Clashes with `council-meeting`; decide one.                                               |
| `community-hall`                                                  | Village/association hall (bygdegård, dorpshuis)        | V     | Gabled hall, wide door. Reads as `sports-hall`/`city-hall`.                                                 |
| `youth-centre`                                                    | Drop-in youth space (fritidsgård)                      | V     | Likely words. Sofa/table football reads as `home`.                                                          |
| `meeting-place`                                                   | Drop-in social place, esp. seniors (mötesplats)        | V     | Cup on a small table. Never an elder figure.                                                                |
| `sports-pitch`                                                    | Marked outdoor pitch from above                        | U     | **Draw**: rectangle, centre line and circle. Reads as `area`. Sport names are words.                        |
| `outdoor-gym`                                                     | Free outdoor training equipment                        | U     | **Draw**: pull-up frame. Hard to tell from `playground`.                                                    |
| `trail`                                                           | Marked foot/exercise route (vandringsled, motionsspår) | U     | **Draw**: dotted path past waypoints. Reads as `directions`/`distance`. No paint-blaze colour.              |
| `harbour`                                                         | Guest harbour or boat berth                            | U     | **Draw**: small boat at a quay with a bollard.                                                              |
| `running-track`                                                   | Athletics oval                                         | U     | Concentric ovals. Low priority.                                                                             |
| `event`                                                           | An event or festival                                   | U     | Marquee tent (bunting reads as flags). Reads as `camping`.                                                  |
| `market`                                                          | Flea market, street trade                              | U     | Awning stall. Low priority; distinct from `reuse`.                                                          |
| `music`, `theatre`, `arts-and-crafts`, `museum`, `swimming-lanes` | Culture and pool                                       | U     | Generic in other sets: check first. No masks (Western, emoji-like); the museum temple reads as `city-hall`. |

Sports icons are object-based and few: a ball means football only (it also reads as basketball or korfball). Group icons only (`sports-pitch`, `sports-hall`, `swimming-lanes`, `trail`); every sport name is words. Bandy, floorball, skis, skates, curling are Nordic: words.

Words only: `association-grant`, `premises-grant`, `attendance`, `volunteering` (heart and helping hand read as favourite/benefit), `membership`, `background-check`, `study-circle`, `right-of-access`, scouts (the fleur-de-lis is a protected mark), pensioner associations.

### Agencies' tasks

Most collapse to words plus an existing icon. Worth a drawing:

| Name                 | Must represent                                        | Scope | Note                                                                                      |
| -------------------- | ----------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------- |
| `credentials-wallet` | Digital wallet (EU Digital Identity Wallet, Kivra ID) | U     | **Draw**: phone with a card inside. The EU wallet makes it recurring. Reads as `payment`. |
| `refund`             | Money paid back (skatteåterbäring)                    | U     | Plain coin with a U-turn arrow; must not mirror. Reads as `undo`.                         |
| `parental-leave`     | Family benefits (föräldrapenning, barsel)             | U     | A pram, not a child figure. Pair with `birth` at 16px.                                    |
| `sick-leave`         | Absence through illness (sjukpenning)                 | U     | Thermometer. Reads as weather. Words always.                                              |
| `driving-licence`    | Driving licence                                       | U     | Card with a steering wheel. Only the wheel separates it from `id-card` at 16px.           |
| `business`           | Start or run a business                               | U     | Shopfront with an awning. Test against `building`.                                        |
| `health-record`      | Your journal and results (1177, Helsenorge, OmaKanta) | U     | Page with a pulse line. The peak must be clear at 16px.                                   |
| `lab-results`        | Samples and test results                              | U     | Test tube. Reads as flask/`hazardous-waste`. Medium priority.                             |
| `prescription`       | Renew or collect a prescription                       | U     | Slip with a capsule, no "Rx". Draw only if `medication` can't serve.                      |
| `title-deed`         | Register property ownership (lagfart)                 | V     | House plus sealed page. Merge with `building-permit` if they don't differ at 16px.        |
| `road-charge`        | Congestion charge/toll                                | V     | Gantry over a lane. Medium-low priority.                                                  |

Words plus an existing icon: `bank-account`, `tax-account`, `tax-card`, `income-statement`, `household-deduction` (ROT/RUT, national), `pension` (no stigma-free object), `disability-allowance`, `activity-report`, `referral`, `choose-doctor`, `organ-donor`, `extract` (`certificate` means "granted", not "a copy"), `residence-permit`, `report-incident`, `event-permit`, `lost-property`, `debt-relief`, `vehicle-registration` (plate needs letters), `inheritance`, `case-status`, `abroad`, `scam-warning`. Asylum, citizenship, firearms, handcuffs: stigma or a loaded image, words only. BankID, MitID, Freja, ID-porten, the orange envelope, the EU emblem: never drawn.

### Transit

| Name                                                                     | Must represent                                  | Scope | Note                                                                                           |
| ------------------------------------------------------------------------ | ----------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------- |
| `live-departures`                                                        | Next departures in real time                    | U     | **Draw**: list rows with a signal arc. Reads as `notification`/wifi.                           |
| `detour`                                                                 | Service or street diverted                      | U     | **Draw**: a line bending around a break. Reads as `directions`/`roadworks`.                    |
| `replacement-bus`                                                        | Bus replaces a train                            | U     | Bus plus swap arrows.                                                                          |
| `transit-stop`                                                           | A stop or station (pole and shelter, no number) | U     | Reads as `pin`/flag.                                                                           |
| `ticket`                                                                 | A ticket or fare product                        | U     | Notched ticket, no price glyph. Reads as `receipt`.                                            |
| `zone`                                                                   | A fare zone                                     | V     | Nested rings. HSL names zones by letter: banned. Reads as `area`.                              |
| `tap-in`                                                                 | Check in/out or tap to board                    | V     | Card plus short tap. NL, DK and parts of FI/SE. Reads as `travel-card`.                        |
| `on-demand-transport`                                                    | Book a demand-responsive bus (närtrafik, flex)  | V     | Small bus plus phone or pin. Reads as `accessible-transport`.                                  |
| `tram`, `metro`                                                          | Tram; underground                               | U / V | Wire is the only `tram`/`train` difference at 16px. Metro marks are letters (T, M, U): banned. |
| `bike-share`, `bike-parking`, `bike-on-board`, `cycle-path`, `e-scooter` | Cycling and micro-mobility                      | U / V | Reads as `bike`. Rules differ per city: words.                                                 |
| `lost-property`                                                          | Report or find a lost item                      | U     | Strongest recurrence in transit and police. Bag or umbrella plus magnifier; no suitcase.       |
| `patient-travel`                                                         | Subsidised travel to a medical visit (sjukresa) | V     | Nordic. Reads as `ambulance`. Words.                                                           |

Words only: season pass, ticket inspection (punitive), reduced fares for senior/student/youth (stigma), compensation, penalty fee, quiet carriage.

### Streets, utilities, environment

| Name                                                                                                           | Must represent                            | Scope | Note                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| `litter`                                                                                                       | Litter or an overflowing bin on a street  | U     | **Draw**: loose items by a post bin. Amsterdam: over a third of 500,000 public-space reports are waste or cleanliness. |
| `litter-bin`                                                                                                   | A public street bin (open top, on a post) | U     | Differs from `wheelie-bin` and from `delete`.                                                                          |
| `street-cleaning`                                                                                              | Sweeping, street cleaning                 | U     | Broom plus road. Reads as `clear-formatting`.                                                                          |
| `tree-felling`                                                                                                 | Permit to fell or prune a tree            | V     | Tree plus saw/stump. Rules differ per country.                                                                         |
| `storm-drain`                                                                                                  | Street gully, grate                       | U     | Grate plus drop. Slots read as a menu.                                                                                 |
| `noise`                                                                                                        | Noise complaint (buller)                  | U     | Jagged sound waves. Reads as `read-aloud`/volume.                                                                      |
| `boil-water-notice`                                                                                            | Boil your water before drinking           | V     | Mostly Nordic. Pot, steam, drop. Reads as `water`.                                                                     |
| `water-sample`                                                                                                 | Bathing/drinking water test               | V     | Vial plus drop. Never show fit/unfit by colour.                                                                        |
| `power-outage`                                                                                                 | Electricity cut                           | U     | Plug/bolt with a break. Not found in research: from memory.                                                            |
| `fire-ban`                                                                                                     | Open fire banned                          | V     | `fire` plus `blocked`. Words carry the order.                                                                          |
| `abandoned-vehicle`, `illegal-dumping`, `graffiti`, `pest-control`, `invasive-species`, `bridge`, `cycle-path` | Nuisance and upkeep                       | U / V | Low priority; most are `report-fault` plus a subject.                                                                  |

Not found in research (unproven, research separately if wanted): stroller space, grass cutting, fountains, benches, public wifi, stray animals, ice thickness, mosquitoes, district heating, broadband, flooding.

### Already planned in `packages/icons/catalog.json`

Round-1 rows that exist or overlap: `town-hall` = **`city-hall`**, `court` = **`law`**, `road-works` = **`roadworks`**, `recycling` = **`recycle`**, plus `id-card`, `vote`, `sign-language`, `read-aloud`, `signature`, `certificate`, `quick-exit`, `family`, `benefit`, `invoice`, `payment`, `medication`, `vaccination`, `education`, `care`, `shield`. Use the catalogue names; drop the duplicate.

## Decisions needed (round 2)

1. **`education` is planned as a graduation cap with aliases `school` and `training`.** The cap means university only: a nursery or primary-school link would show a degree cap. Either `education` becomes higher education and `school` gets its own building drawing, or the cap goes. Recommend: a separate `school`, and `university` as the cap.
2. **The `building` container** (round 1 question) now covers nine rows: city-hall, school, preschool, care-home, community-hall, youth-centre, museum, culture-school, library. Without it they clash at 16px.
3. **Two near-duplicates to settle:** `meeting-room` vs `council-meeting`, and `arts-school` vs `culture-school`.

## Not worth an icon

- National easy-read marks, BankID/Freja/MitID/ID-porten/Suomi.fi tunnistus, any country crest or flag: licensed or brand. Use the official asset or words.
- Language names: write them in their own language with `lang` (WCAG 3.1.2). The globe is drawn; flags are banned.
- Large print, text size, plain language (klarspråk), `CC`/`AD` letter marks: letters or a writing quality. Words.
- Person with a cane, `ear-slash`, "disabled" figures: stigma, read as a ban. Draw the positive feature (`braille`, `hearing-loop`).
- ARASAAC (CC BY-NC-SA 4.0), Widgit, PCS: do not copy or imitate.
- Generic, already in a standard set: library, job vacancies, ballot box, swimming, fire truck, taxi/bus, camping, EV charger.

## Lessons for our style

1. Letters hide inside conventions (P, T, €, "!"): `hearing-loop`, `parking-disc` need an object metaphor or ship as words. `easy-read` was reopened by the maintainer on 2026-10-18 and drawn without letters (Plan 0137).
2. Drop national, religious and legal-tradition markers: flags, crosses on graves, mayor's chain, gavel, temple columns, the Dutch red pencil.
3. Meaning in the sources sits in colour and fill, and the scenes are made for 36–80px. Ours must read at 16/20/24px in one stroke.
4. ARASAAC's "house outline plus one inner object" (book = library, bed = care home) is reusable: `town-hall`, `school`, `library`, `care-home`, `preschool`.
5. People icons carry stereotypes (stooped elder, puzzle head, wheelchair for all disability). Draw the service object.

## Open for the maintainer

- A `building` container in the parts kit (gabled house outline plus one inner glyph)? A kit change that touches the whole set.
- Drop `hearing-loop` and `parking-disc` to words only, given the no-letters rule? (`easy-read`: decided, drawn, Plan 0137.)
- Country variants: this research finds **one universal icon per concept** in nearly every case, with the label per country. A variant is only plausible for the `V` rows, and none of them is clearly worth a second drawing yet.
- ISO 7001 shapes (`sign-language`, `hearing-loop`, `step-free-access`): may they be redrawn in a library? `TODO(legal-verify)`, and compare against ISO 7001:2023, which was not read.
- Recognition testing with residents is pending for every row, as for the 84 drawn.
