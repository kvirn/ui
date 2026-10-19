# Plan 0144: Icon additions (reversed cuts, missing counterparts, social marks)

- **Status:** In progress
- **Owner:** lead → iconographer ×3 batches, then component-engineer
- **Created:** 2026-10-18 · **Target:** alpha
- **Related:** Plan 0124 (library), `docs/design/icon-library.md`, `icon.md` §6.1, `icon-wanted.md`

## Goal

Fill the gaps in the icon set: the missing counterparts of existing icons, the icons cut earlier that the maintainer now wants, and a set of social-network marks.

## Non-goals

- No tests, stories-state sweeps or gates until every icon is drawn (maintainer, 2026-10-18). Gates run once at the end.
- No colour, fill or brand colour: every mark is one outline stroke on the 24 grid.
- Not re-drawing existing icons.

## Decisions (maintainer, 2026-10-18)

- Reversed cuts (icon-library.md "Cut or merged", icon-wanted.md "Still out"): `zoom-in`, `zoom-out`, `expand`, `collapse`, `pin-off`, `heart`, `star`, and brand logos. Reason: requested by the maintainer.
- Already covered, **no new icon**: `remove` (minus), `delete` (trash), `mail-off`, `video-call-off`. Add the aliases `trash`, `minus` where missing.
- Brand marks: simplified original outline marks in the house stroke, one per network. `LICENSING.md` states that the trademarks belong to their owners and use follows their brand guidelines. **Never claim endorsement or legal compliance.** (Lead's recommendation, taken because the maintainer did not answer the question.) Tell the maintainer this is open to reversal.
- `save` stops being only an alias of `download`: it gets its own icon; the iconographer picks the metaphor (a floppy disk is dated; test a tray/checkmark or a document with a corner tick).
- Parallelism: 5 iconographers at once (a batch each; maintainer's order, 2026-10-18), SVGs only in their own batch, so no file collides.
- Brand marks keep the house radius 2 (recommended; radius 4 would add a second corner radius, the maintainer's call). Letterforms inside marks (`f`, `in`, `m`, `X`) are allowed in category `social` only: add this "brand glyph" exception to the `iconography` skill and `icon.md` §6.1 in the docs step. Open to reversal by the maintainer.
- Marks are used at 20px and up, always beside the network's name (`bluesky` reads as a cat's head at 16px). Say so in the docs.
- Review fixes (accessibility-reviewer): `save`, `hang-up`, `like`, `star`, `heart`, `bookmark` have `label: null` and no `icons.*` key (actions carry no label, icon-library.md decision 6; a label is a noun phrase, icon.md §7); only `rss` keeps `icons.rss` (nb "Nyhetsstrøm", nn "Nyheitsstraum"). `unpin` dropped from `pin-off`; `add`/`remove` meanings lose "zoom".
- `attachment-remove` redrawn: the inline-end run now stops at y 10.5 (was 13), so it shares the host of `attachment-add` and the two swap in place. `like` is recorded as a second gesture exception beside `easy-read-thumbs-up` in `SKILL.md` rule 5 and `qa-checklist.md`.

- 2026-10-19, maintainer asked for `bankid`, `digital-signage`, `visa`, `mastercard`, `payment-card`, `klarna`, `2fa`. `payment-card` is not drawn: `payment` is already a bank card (aliases `card`, `bank-card`), so `payment-card` becomes an alias of it (a second near-identical card would confuse). `2fa` → `two-factor` (aliases `2fa`, `mfa`, `two-step`). Marks of services (`bankid`, `visa`, `mastercard`, `klarna`) go in a new category `service-marks` and follow the social-mark rules (simplified originals, radius 2, 20px and up, beside the name, never the only text, brand-glyph letterform exception extended to this category). BankID, Visa, Mastercard and Klarna publish strict brand guidelines: these simplified marks are for lists and "we accept" rows, never in place of the official button or logo where the owner requires it (state this in LICENSING.md).

- 2026-10-19, maintainer asked for icons for everyday topics: listen, easy-read (lättläst), sign language, other languages, car, clothes, travel, tools, mobiles, subscriptions, food, house, furniture "and ...". Dedupe: `listen` is an alias of `read-aloud`, `globe` of `language`, `easy-read` and `car` exist. Inventory (wave 1, 73 icons, batches F1–F6; the list is open-ended, more can follow):
  - F1 language, hearing, subscriptions (`access-language`, `money`): `ear` (alias `hearing`), `headphones`, `volume`, `volume-off`, `microphone`, `microphone-off`, `hearing-loop`, `sign-language`, `multilingual`; `subscription`, `renew`, `membership`, `newsletter`, `cancel-subscription`.
  - F2 car, tools (`mobility-environment`; tools → new `home-living`): `electric-car`, `ev-charging`, `parking`, `fuel`, `taxi`, `truck`, `motorcycle`, `driving-licence`; `hammer`, `screwdriver`, `drill`, `saw`, `toolbox`, `paint-roller`.
  - F3 travel, clothes (`mobility-environment`; clothes → new `food-clothing`): `suitcase`, `plane`, `passport`, `hotel`, `tent`, `boarding-pass`; `shirt`, `trousers`, `jacket`, `shoe`, `hat`, `clothes-hanger`, `laundry`. No gendered garments (no dress).
  - F4 devices, food (`communication`; food → `food-clothing`): `tablet`, `laptop`, `desktop`, `smartwatch`, `wifi`, `bluetooth`, `battery`; `restaurant`, `cooking`, `groceries`, `cart`, `bread`, `coffee`, `vegetarian`.
  - F5 house (`home-living`): `door`, `window`, `roof`, `fence`, `mailbox`, `heating`, `plug`, `lightbulb`, `stairs`, `elevator`.
  - F6 furniture (`home-living`): `sofa`, `chair`, `dining-table` (never `table`: that is the data table), `bed`, `wardrobe`, `lamp`, `shelf`, `bathtub`.
  - `visa` (travel visa or residence permit) is open: the maintainer has not answered; the drawn `visa` stays the card mark.

## Open for the maintainer (none blocks; each stands as drawn unless reversed)

- Larger lens kit part for `zoom-in`/`zoom-out` (ring r 7.5, handle (15.75,15.75)→(20.5,20.5)).
- Named kit part "star points" for `star` (slopes not 45°/90°).
- `x` band slopes 3:4 (exception to 45°/90°, brand mark).
- Radius 4 for brand marks (`youtube`, `mastodon`, `instagram`); kept at 2.
- `filter-off` uses the badge cross, not the slash; rename to `clear-filters` with `filter-off` as alias?
- `like` joins `easy-read-thumbs-up` in the sensitivity-review list (icon-library.md §8).
- Dropped aliases now owned by new icons: `zoom-in`, `zoom-out` (of add/remove), `expand`, `collapse` (of chevrons), `save` (of download), `pin-off` if present.

## Inventory

| Batch                        | Icons (name → note)                                                                                                                                                                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A, interface and movement    | `zoom-in`, `zoom-out` (lens-free: `add`/`remove` ring or frame idea; the earlier cut was a glyph inside the lens, find another), `expand`, `collapse` (single-item counterparts of `expand-all`/`collapse-all`), `pin-off`, `sort-ascending`, `sort-descending` (`sort` exists: keep the family), `filter-off` |
| B, actions and communication | `attachment-add`, `hang-up` (end a call; alias `call-end`), `chat-off`, `save`, `heart` (aliases `favourite`), `star`, `bookmark`, `like` (thumbs-up; if it can't be told from `easy-read-thumbs-up` at 16px, make it an alias of `heart` and say so)                                                          |
| C, social marks 1            | `x` (alias `twitter`), `facebook`, `instagram`, `linkedin`                                                                                                                                                                                                                                                     |
| D, social marks 2            | `youtube`, `tiktok`, `mastodon`                                                                                                                                                                                                                                                                                |
| E, social marks 3            | `bluesky`, `rss` (generic feed, category `communication`)                                                                                                                                                                                                                                                      |

New category for C, D and E (not `rss`): `social` ("Social media", marks of networks; always with words, never the only link text). Others go in their nearest existing category.

## Brief rules for every iconographer

- Read `docs/design/icon.md` §6.1, `docs/design/icon-library.md` (parts kit, family rules) and the `iconography` skill. Check 16px legibility and distinction from the look-alikes on a contact sheet.
- Write only `packages/icons/svg/<name>.svg`. **Do not edit `catalog.json`, `mirror-in-rtl.json` or any doc.** Write the batch's catalog entries (same fields as `catalog.json`: name, category, aliases, tags, meaning, status `drawn`, mirrorInRtl, label) to `docs/design/plans/0144-batch-<X>.json` and one line per icon on the family and look-alikes.
- Don't run `vp`, tests or the generator. The lead merges the entries and component-engineer generates.
- Brand marks: simplified, original geometry; not a copy of any vector file; no colour; say plainly in the entry's `meaning` that it is the network's mark.

## Tasks

- [x] A1 ✓ · A2 ✓ · B1 ✓ (all drawn and merged into catalog.json, 289 icons) · B2 ✓ · C ✓ · D ✓ · E ✓ (batch files `0144-batch-<X>.json`; A/B/C were split into A1/A2/B1/B2/C after the first agents were interrupted)
- [x] F1 ✓ (14) · F2 ✓ (14) · F3 ✓ (13) · F4 ✓ (14) · F5 ✓ (10) · F6 ✓ (8): all 73 drawn and merged (371 icons, 21 categories), documented in `icon-library.md` ("Plan 0144 batch F additions", "Proposed parts", §8)
- [x] Merge batch entries into `catalog.json` (lead); `mirror-in-rtl.json`: none mirror, no change
- Scratch files `docs/design/plans/0144-batch-{A1,A2,B1,B2,C,D,E}.json`: delete before commit; the notes live in `icon-library.md`.
- [x] component-engineer: `node scripts/generate.mjs` (via `vp run` if wired), i18n labels in 5 locales where an entry has a `label`, new count (264 → N) in `icons.stories.tsx:137` and in `icon-library.md`/`icon-catalog.md`, `icon-wanted.md` "Still out" and "Cut or merged" lines, `LICENSING.md` brand note, gallery/docs pages, category `social`
- [ ] Storybook gallery and docs-site icon library show the new icons (check whether generated from `catalog.json`)
- [ ] Final gates once: `vp check` → `vp run test` → `vp run i18n:check` → `vp run theme:check`; fix tests that hard-code the count
- [ ] accessibility-reviewer on the diff

- Decision: `settings-6` (a six-tooth `settings`, category `interface`, no label, no RTL mirror) added by the maintainer 2026-10-19; count 290. The evenly spaced gear (side teeth at slope 3:5) is a proposed grid exception, maintainer to confirm.
- Decision: `database-add` and `database-remove` (badged counterparts of `database`, category `tables-data`, no label, no RTL mirror) added by the maintainer 2026-10-19; count 292. The band stub (the middle band keeps only its start-side 5.25 units) is a proposed part, maintainer to confirm.
- Decision: the key badge (a small key, ring r 2.83, in the badge position; `two-factor`) is a proposed part, proposed, maintainer to confirm.
- Decision: the shortened landscape screen on a pole (`digital-signage`) is a proposed part, proposed, maintainer to confirm.
- Decision: the Visa V arms at slope 2:1 (`visa`) is a proposed part, proposed, maintainer to confirm.
- Decision: `mastercard` is unboxed, because a plate would break the 2-unit gap; `visa` and `klarna` reuse the plate of `payment`; `bankid` is separated from `bold` only by the plate. Count 298 in 19 categories; the 2026-10-19 category `service-marks` and its LICENSING.md section are documented; `payment-card` is an alias of `payment`.

- Decision (batch F, 2026-10-19): labels stay null for all 73 icons (decision 6: the button or text carries the name); no `icons.*` keys.
- Decision (batch F): `bluetooth` is in `service-marks`, not `communication`, because it is the Bluetooth SIG's mark (20px and up, beside the word; see `LICENSING.md`). `sign-language` and `bluetooth` join the §8 sensitivity list.
- Decision (batch F): `cart` is not mirrored (an object; the maintainer may prefer a vehicle that faces the reading direction).
- Decision (batch F): the aliases `pants` (of `trousers`) and `computer` (of `desktop`) are dropped to keep each name unambiguous.
- Decision (batch F): `volume-off` uses a cross where the arcs were, like `filter-off`; the kit slash crossed the cone and both arcs and left fragments.
- Decision (batch F): `parking` is a car under a roof, not a letter P, and may read as a garage: always with words.
- Decision (batch F): sixteen new kit parts (heat waves, roof band, wing 1:2, tent 2:1, hanger 1:2, lamp shade 2:1, pump post, tool on the anti-diagonal, saw teeth, leaf quarter arcs, arc fan, loop badge, pill capsule, envelope pocket slope, volume-off cross, shelf with 5 strokes) are proposed, maintainer to confirm.
- Scratch files `0144-batch-F1…F6.json` are deleted; their notes live in `icon-library.md`.

## Risks

- Brand marks at 24px one-stroke can lose their identity (Instagram, TikTok, Bluesky); the iconographer may report PARTIAL with the reason rather than force a bad mark.
- `x` as an icon name next to `close`: alias care, never alias `close` to `x`.
