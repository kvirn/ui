# Plan 0131: Letterform icons for bold, italic, underline and strike

- **Status:** Done (agents)
- **Owner:** lead / iconographer
- **Created:** 2026-10-17 · **Target:** alpha
- **Related:** [0124](0124-icon-library.md), [0129](0129-map-richtext-library-icons.md), `iconography` skill, `docs/design/icon-library.md` §Batch 2 A

## Goal

The rich text toolbar's four text-style buttons show the glyphs every editor user already knows (a bold **B**, a slanted _I_, an underlined U, a struck-through S), so they are recognised at a glance.

## Non-goals

- Any other icon. `clear-formatting`, `text-color` and the rest keep the no-letter rule.
- Names, aliases, label keys, `mirrorInRtl` or the toolbar's API: all unchanged.

## Background

Batch 2 (2026-10-16) drew `bold`, `italic`, `underline` and `strike` without letters (heavy bar, lean bar, word box). In use they read as abstract shapes: the B/I/U/S letterforms are a decades-old convention across word processors, mail clients and CMS editors.

## Decisions

- **Exception to "no letters or numerals"** for exactly these four (maintainer, 2026-10-17). Reason: the letterform _is_ the established symbol, not language text; recognition beats the abstract metaphor. Recorded where the rule lives: `iconography` skill, `references/metaphor-and-naming.md`, `icon-library.md`.
- **WCAG 1.4.5:** the glyphs are a pictographic convention for a function, not text conveying information; the accessible name still comes from the button's `richText.*` label, and the icon stays `aria-hidden`. Latin B/I/U/S is used in every locale (sv, fi, nb, nn, en editors all use it), so no per-locale variants.
- **Drawing:** outline letterforms on the 24 grid, same stroke (1.5), caps and joins as the library. One stroke weight (rule 1 holds): the letter B itself says bold, as in every editor; italic is a leaning I with serifs, underline a U with a rule beneath, strike an S with a rule through. Same cap height and baseline for all four so they line up in the toolbar. The iconographer records keylines in `icon-library.md`.

## Tasks

- [x] T1 `iconographer`: redraw `packages/icons/svg/{bold,italic,underline,strike}.svg`; update their rows (metaphor, keyline) in `icon-library.md` §Batch 2 A, the keylines table and the decisions table; `catalog.json` `meaning` fields; contact sheet at 16/20/24 against the Text family
- [x] T2 `lead`: record the exception in `.claude/skills/iconography/SKILL.md` and `references/metaphor-and-naming.md`
- [x] T3 `lead`: `pnpm --filter @kvirn-ui/icons generate`; gates on `packages/icons` and `rich-text-toolbar.test.tsx`
- [x] T4 `accessibility-reviewer` on the diff: APPROVE (on the 13-tall draft; the redraw changes only geometry). Non-blocking: `clear-formatting` meaning fixed; its visual link to `bold` is gone, note for a later redraw; commit only the line-19 hunk of the iconography SKILL.md (other hunks belong to in-flight work)
- [x] T5 `lead`: roadmap line, `vp fmt`, commit message

## Implementation notes

- Letters 12 tall (B/I/S cap y 6, baseline y 18; U and its rule raised 1.5 so the pair centres), 9 wide (x 7.5–16.5); B and S share bowls (r 2.75 / r 3.25); italic leans 2:1 (45° read as Z). Painted centres within 0.25 of (12,12). Contact sheet: `/tmp/kv-letters/out/contact-text-family-12-dpr2.png`.
- Maintainer 2026-10-17: letters redrawn 12 tall and centred within the 0.5 nudge (the first draw was 13 tall, 1 above centre, rejected); the 2:1 "Letter I stem" slope approved.
- Out of scope, left: the `lines` ink median still counts the old bold/italic; catalog `tags` keep "heavy"/"slanted". `icon-catalog.md` rows updated by hand (the generator doesn't write it).
- Gates: `vp check` on the 4 generated modules ✓; `vp test run packages/icons/src …/rich-text-toolbar.test.tsx` 107/107 ✓ (re-run after the 12-tall redraw); i18n and theme not touched.
