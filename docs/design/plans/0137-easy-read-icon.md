# Plan 0137: `easy-read` icon

- **Status:** Done for agents (recognition tests, sensitivity review, AT and native review of `nn` pending)
- **Owner:** lead → iconographer, component-engineer
- **Created:** 2026-10-18 · **Target:** alpha
- **Related:** [0124](0124-icon-library.md), `docs/design/icon-catalog.md` (Cuts and merges), `docs/design/icon-wanted.md` (Cut by the maintainer), `docs/design/icon-municipal-candidates.md:19`, `iconography` skill

## Goal

Municipal sites can mark "this page has an easy-to-read version" (lättläst, selkokieli, lettlest) with a library icon, and a screen reader hears the term in the page language.

## Non-goals

- Copying or imitating the official marks (Inclusion Europe, Selkokeskus, LL-center, Netzwerk). They are registered; consumers supply those as images.
- Per-language drawings: nothing in `packages/icons` supports them, and one language-neutral drawing plus a per-locale label covers the need. Revisit only if the drawing proves wrong in a locale.
- Letters in the drawing (`iconography` no-letters rule).

## Background

`easy-read` was cut in 0124 (registered marks, would read as `document`). The maintainer reopened it on 2026-10-18: it is a vital, often-used icon on municipal sites. Scout facts: an icon is a `svg/<name>.svg`, a `catalog.json` entry with `label`, `mirror-in-rtl.json` if it mirrors, `pnpm generate`, and `icons.<name>` in all five locales. The parity tests (`icons.test.ts`, `icon-labels.test.ts`) catch drift. There is no hard-coded icon count in the tests.

## Design

Generic marker: a page with short, widely spaced lines. It must be distinct from `document` at 16px (the iconographer picks the differentiator, e.g. fewer, longer-spaced lines with an accent mark) and carry no letters. Category `access-language`, `mirrorInRtl` decided by the drawing (a plain page with left-aligned lines mirrors; record the reason).

### Accessibility contract (draft)

Decorative by default, like every icon; meaning comes from the adjacent text or the label.

- Roles / ARIA: none by default. With a label, the existing icon rule applies (`role="img"` and `aria-label` from `icons.easyRead`).
- Keyboard: none, not focusable.
- WCAG SCs: 1.1.1, 1.4.11 (graphic, 3:1), 1.4.1 (meaning not by colour alone).

### i18n strings

| Key              | en           | sv       | fi         | nb       | nn        |
| ---------------- | ------------ | -------- | ---------- | -------- | --------- |
| `icons.easyRead` | Easy to read | Lättläst | Selkokieli | Lettlest | Lettlesen |

Wording to be confirmed against how each national term is used on public sites. Locale parity in `packages/i18n/src/types.ts:775` and the five locale files.

## Tasks

- [x] 1. iconographer: draw `packages/icons/svg/easy-read.svg`; prove it at 16/20/24px, distinct from `document` and `text-size`; record metaphor and RTL reason in `docs/design/icon-catalog.md`
- [x] 2. component-engineer: `catalog.json` entry (status `drawn`, label `icons.easyRead`), mirror list if needed, `pnpm generate`, five locale labels and `types.ts`, run the icon and i18n tests
- [x] 3. lead: move `easy-read` out of the cut lists (`icon-catalog.md:444,448`, `icon-wanted.md:134`, `icon-municipal-candidates.md:19,290,299`), fix the drifting counts (`icons.stories.tsx:137`, `icon-library.md:335`, `roadmap.md:42`), update 0124 and the README row, `docs/roadmap.md`
- [x] 4. Gates, then accessibility-reviewer on the diff
- [x] 5. iconographer: draw `easy-read-thumbs-up` (our page outline plus a thumbs-up), prove it at 16px, distinct from `easy-read`, `document-check` and `document`; record it in `icon-catalog.md` and `icon-library.md`
- [x] 6. component-engineer: catalog entry (label `icons.easyRead` shared if the label tests allow, else `icons.easyReadThumbsUp` in 5 locales), mirror list per the drawing, generate, tests
- [x] 7. lead: counts, docs note on which easy-read icon to choose, gates, accessibility-reviewer

## Decisions

- 2026-10-18, **maintainer (user):** reopen `easy-read`; add it, with a per-language icon if needed. Reverses the 0124 cut.
- **Lead:** ship one language-neutral generic drawing and a per-locale label. Per-language drawings would be a new icon API and are not needed yet. Per-language variants, if ever, are our own generic drawings, never the registered marks.
- **Lead:** the drawing carries no letters, which keeps the 0124 rule intact and avoids a per-script design.
- 2026-10-18, **maintainer (user):** add a second easy-read icon, a document with a thumbs-up, against the lead's recommendation (a thumb on a page is also how the Inclusion Europe mark is built, so it can read as an imitation, and the pair makes `easy-read` ambiguous). Mitigation: our own page outline and thumb part, not a hand over an open book; the catalog meaning says it is not a national mark; the docs say to pick one of the two per site.

## Risks & open questions

- Reads as `document` at 16px: the iconographer must prove the difference on a contact sheet.
- `easy-read-thumbs-up` may be read as the Inclusion Europe mark or as "approved document" (`document-check`): the iconographer must prove both differences.
- Users may expect the official mark. The Docs page and the catalog entry say the generic icon is not a national mark and that a consumer who needs the official one supplies it.

## Testing strategy

Existing icon tests (generated files match, catalogue and svg agree, mirror list) and the label parity test. No new test layer.

## Done when

- [x] Gates pass: `vp check`, `vp test run` for `packages/icons` and `packages/i18n`, `vp run i18n:check`
- [x] Plan ticked, cut lists and counts updated, `docs/roadmap.md` updated
- [x] `accessibility-reviewer` APPROVE (2026-10-18; five non-blocking findings, four fixed)

## Implementation notes

- 2026-10-18, **iconographer:** drawn as a rounded page, two short start-aligned lines and a picture peak at the foot (`svg/easy-read.svg`); distinct from `document` at 16px; `mirrorInRtl: true` (start-aligned lines); recognition test `pending`.
- **Lead:** label key is `icons.easyRead` (camelCase, as every other catalog label). `nn` uses "Lettlesen", to be confirmed by a native reader. `docs/design/README.md` has a row reorder (Map row) that this plan did not make; left alone.
- **Reviewer fixes:** dropped the `plain-language` and `simple-language` alias and tag (klarspråk is a different thing from lättläst, and a wrong alias could pick a wrong label); the meaning now says a consumer who needs the official mark supplies it; RTL mirror count 24.
- **Open for people:** recognition test, AT matrix, native review of `nn` "Lettlesen" (nb "Lettlest" may be used in Nynorsk too).
- **Task 5 (iconographer):** `easy-read-thumbs-up` drawn: a closed fist with a raised thumb in front of the page's start edge, two finger lines, no letters; does not mirror (a held object); 16px fill-in passes and it is distinct from `easy-read`, `document-check`, `document`. Weak spot: at 16px the page reads only as a bracket; the thumb reads at every size. A smaller page behind the thumb would need a keyline exception: not taken.
- **Lead:** the iconography skill rule 3 (no hand gestures) now names this one exception, same change. Label: a shared key failed `icon-labels.test.ts` (it compares the catalogue label list exactly), so the icon has its own `icons.easyReadThumbsUp`, same text as `icons.easyRead` in all five locales. Recognition test and sensitivity review (a raised thumb is rude in some cultures) are `pending`.
- **Reviewer, thumbs-up (2026-10-18, APPROVE, no blocking):** fixed the doc label, the "left edge" wording (it doesn't mirror) and added "show it with the visible term beside it". Open for people: the recognition test (does the thumb read as "easy to read" or "like"), the sensitivity review, and a legal glance at the resemblance to the Inclusion Europe mark.
