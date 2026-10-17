# Plan 0133: Heading icons H1–H6 and levels 2–6 in the text type picker

- **Status:** Done (agents)
- **Owner:** lead / iconographer / component-engineer
- **Created:** 2026-10-17 · **Target:** alpha
- **Related:** [0131](0131-letterform-text-style-icons.md), [0129](0129-map-richtext-library-icons.md), `iconography`, `overlays-and-lists`, `api-conventions` skills

## Goal

`@kvirn-ui/icons` has `heading-1` … `heading-6`, and the rich text editor's text type picker offers Heading 2 to Heading 6 by default, each with its icon, so authors can build a deep document outline.

## Non-goals

- Heading 1 in the editor: the page owns its h1 (unchanged; the `heading-1` icon exists for apps).
- Icons for Normal text, Quote and Code block options.
- Any other toolbar control, or a new public prop (levels stay configured through `defaultExtensions({ heading })`).

## Decisions

- **Icons:** H + numeral, the letterform exception of Plan 0131 extended to these six (requested by the maintainer 2026-10-17). Latin H and Western digits in every locale; `mirrorInRtl: false`; catalog `label: null` (the option's text is the name). Ink +43–66% over the open median, in the `lines` band, accepted as recorded in `icon-library.md` §7 (warning, not a gate).
- **Default levels `[2, 3, 4, 5, 6]`** (was `[2, 3]`), as the maintainer asked for H2–H6 in the picker. Apps narrow with `defaultExtensions({ heading: { levels } })`. Public default change: docs updated (rule 9).
- **Icons in the picker on heading options only**, decorative (`aria-hidden`, inside the option, before its text). The option's accessible name stays the `richText.blockHeadingN` text. Both the Listbox picker (`block-format.tsx`) and the compact Menu (`compact-controls.tsx`).
- **Strings:** add `richText.blockHeading5`, `blockHeading6` in all 5 locales, following `blockHeading2–4`.
- **Docs site:** it consumes built `dist/`, so the icons, i18n and rich-text packages are rebuilt after the change for `localhost:3000/components/rich-text-editor`.

### Accessibility contract (delta)

No key changes. Options keep role `option` (Listbox) / `menuitemradio` (Menu) with the text as name; the icon is `aria-hidden="true"` and adds nothing to the name (1.1.1, 2.5.3, 4.1.2). Selecting H5/H6 sets the heading level (`aria-selected` / `aria-checked` follow the caret).

### i18n strings

| Key                      | en        | sv       |
| ------------------------ | --------- | -------- |
| `richText.blockHeading5` | Heading 5 | Rubrik 5 |
| `richText.blockHeading6` | Heading 6 | Rubrik 6 |

## Tasks

- [x] T1 `iconographer`: `heading-1…6` SVGs, catalog, `icon-library.md`, `icon-catalog.md`, exception in the skill
- [x] T2 `lead`: generate modules; `vp test run packages/icons/src` 39/39 ✓
- [x] T3 `component-engineer`: strings, default levels, labels for 5–6, icons in both pickers, tests, package + docs-site docs
- [x] T4 `lead`: gates; rebuild icons, i18n, rich-text dist for the docs site
- [x] T5 `accessibility-reviewer` on the diff: APPROVE on re-review
- [x] T6 `lead`: roadmap, `vp fmt`, commit message

## Implementation notes

- Renumbered from 0132: a parallel session took 0132 for SkipLinks.
- Listbox heading options use `Listbox.OptionIcon` + `Listbox.OptionText`; menu items put `ToolbarIcon` before the label; `blockIconName(key)` is internal to `block-format.tsx`. No theme change: both option classes already lay out an icon with a gap.
- Built `dist/` of icons, i18n and rich-text rebuilt; `localhost:3000/components/rich-text-editor` serves H2–H6.
- Review 1 (CHANGES REQUIRED): a11y.md Read aloud set size 5 → 8; "headings 2 and 3" left in rich-text-editor.md and the JSDoc; the aria-hidden assertions duplicated SvgIcon's test (replaced by one `readAloud` row). DESIGN.md:174 keeps resident-facing text to h3, so rich-text-editor.md tells consumers to narrow to `[2, 3]` for resident-facing text; the default stays 2–6 as the maintainer asked.
- Open, out of scope: no story opens the BlockFormat Listbox, so its options have no axe run (gap existed before).
