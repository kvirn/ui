# Plan 0114: RichTextEditor, announce a refused pasted image, and a compact toolbar

<!-- Under 250 lines. Link prior art, don't paste it. -->

- **Status:** Draft
- **Owner:** lead / component-engineer
- **Created:** 2026-10-14 · **Target:** alpha candidate → beta
- **Related:** [rich-text-editor.md](../rich-text-editor.md) §announcements (~268) · `packages/rich-text/src/rich-text-editor.a11y.md` (Known issues) · [Plan 0113](0113-docs-rich-text-editor-page.md)

## Goal

1. A pasted or dropped image that the editor refuses is announced, so nobody loses it silently (WCAG 3.3.1).
2. The toolbar has a compact form for narrow and touch screens, instead of a full toolbar that wraps to many lines.

## Non-goals

- Image upload (a separate follow-up with FileUpload's validation).
- A `lang` mark for passages. Language is the provider's (rule 14).
- Changing the keyboard contract, unless the compact toolbar needs a row (then the `keyboard` skill and the maintainer).

## Background

- Both keys already exist in the five locales and in the types: `richText.imagePasteNotSupported` ("Images can't be pasted. Use the Image button.") and `richText.imageSourceNotAllowed`. Nothing calls them; `parseHTML` in `extensions/default-extensions.ts` (~147–160) returns `false` and the package has no `handlePaste`, `handleDrop` or `transformPasted`.
- Until this plan is done, the refusal is a Known issue in the contract, and the contract's Announcements table no longer lists the row.
- Today the toolbar wraps group by group (about 200px wide it is several lines). The docs page advises `labels="icon-and-text"` choices and own groups for touch screens.

## Design

### 1. Announce a refused pasted image

- Detect image files in `clipboardData` / `dataTransfer` on paste and drop, and `<img>` elements that `parseHTML` drops, in a ProseMirror plugin on the editor. Announce through the existing `useQuietAnnouncer`, polite.
- Only for paste and drop, never for `setContent` or stored content.
- File → `imagePasteNotSupported`. Address outside `imageSources` → `imageSourceNotAllowed`.
- One announcement per paste, however many images.

### 2. Compact toolbar (to be designed)

- Open: a `size` of the toolbar (rule 14 allows `size`, picking a `kv-<part>--<option>` class) that shows the groups most used and moves the rest into one menu or popover button, vs. only a smaller target size. A `ux-designer` spec in `docs/design/` comes first; this plan links it.
- Constraints: 44px targets stay (2.5.8), the toolbar remains one tab stop with roving focus, every control keeps its name, and the same commands are reachable by keyboard.

### Accessibility contract (draft)

- Announcements: polite, "Images can't be pasted. Use the Image button." and the source-not-allowed text, on paste or drop only.
- Compact toolbar: no key changes; the overflow control is a toolbar item with `aria-haspopup`/`aria-expanded` per the APG toolbar pattern. Finalise with the design spec.
- WCAG SCs: 3.3.1, 4.1.3, 2.5.8, 1.4.10.

## Tasks

- [ ] `ux-designer` spec for the compact toolbar, linked here
- [ ] Tests first: a `readAnnouncements` test per key in `rich-text-editor.test.tsx` (file paste, disallowed-source paste, drop, `setContent` silent)
- [ ] Paste/drop plugin and announcement
- [ ] Compact toolbar: tests for every key row it adds, then the part and `theme.css` classes
- [ ] Stories: refused paste, compact toolbar (all states, RTL, forced-colors, `Keyboard`)
- [ ] Contract: restore the Announcements row, remove the Known issue; docs page `imageSources` row and the toolbar tips updated
- [ ] `docs/roadmap.md`

## Decisions

- **Known issue now, fix here** (maintainer, 2026-10-14): the page and contract state the silent drop until this lands.

## Risks & open questions

- Which commands stay visible in the compact form? Decided by the design spec.
- Does a screen reader announce a paste result over its own paste feedback? Needs the AT matrix run, `pending`.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] `accessibility-reviewer` APPROVE, plan deleted in the finishing change, roadmap updated
