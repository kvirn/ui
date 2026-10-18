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
- [x] Merge batch entries into `catalog.json` (lead); `mirror-in-rtl.json`: none mirror, no change
- Scratch files `docs/design/plans/0144-batch-{A1,A2,B1,B2,C,D,E}.json`: delete before commit; the notes live in `icon-library.md`.
- [x] component-engineer: `node scripts/generate.mjs` (via `vp run` if wired), i18n labels in 5 locales where an entry has a `label`, new count (264 → N) in `icons.stories.tsx:137` and in `icon-library.md`/`icon-catalog.md`, `icon-wanted.md` "Still out" and "Cut or merged" lines, `LICENSING.md` brand note, gallery/docs pages, category `social`
- [ ] Storybook gallery and docs-site icon library show the new icons (check whether generated from `catalog.json`)
- [ ] Final gates once: `vp check` → `vp run test` → `vp run i18n:check` → `vp run theme:check`; fix tests that hard-code the count
- [ ] accessibility-reviewer on the diff

## Risks

- Brand marks at 24px one-stroke can lose their identity (Instagram, TikTok, Bluesky); the iconographer may report PARTIAL with the reason rather than force a bad mark.
- `x` as an icon name next to `close`: alias care, never alias `close` to `x`.
