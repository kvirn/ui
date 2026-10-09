# Design spec: Tag, TagGroup and the list filter pattern

- **Status:** Approved (maintainer, 2026-10-06)
- **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** 0075 (done, in git history) (roadmap rows "Tag or Chip" and "Filter and sort controls for lists")
- **Type:** component default styling + block (a documented composition of existing parts)

## 1. Brief

- **Users:** both. Residents filter news, events, services or search results; staff filter case lists. Hardest case: a resident on a 320px phone with a screen reader and Swedish as a second language, removing one of three filters and needing to know that it worked and how many results are left.
- **Job to be done:** When a list is too long to scan, I want to narrow it by a few facts and see what I have narrowed by, so I can find the item and undo a filter that hid it.
- **Context:** phone first; once or rarely for residents, daily for staff; low stress, but "no results" is a dead end that ends the visit.
- **Constraints:** filters live in the URL (GET), so Back, sharing and no-JS work. No data leaves the page (rule 7).
- **Success criteria:** a filter added and removed without help; after "no results" the user recovers without a new search; screen-reader users report the count after every change.
- **Evidence:** none of our own. Prior art below.
- **Assumptions and research questions:**
  - Assumption: a whole-chip remove button is not pressed by accident. → Do participants remove a tag they meant to read or copy?
  - Assumption: results updating in place (no Apply button) is expected. → Do participants look for a button after ticking a box?
  - Assumption: focus on the "Applied filters" label after the last tag is removed is understood. → Do screen-reader users know where they are?
  - Assumption: holding Enter on a remove button does not auto-repeat onto the next remove button and remove several tags. → Do users with a tremor or a held key lose tags they meant to keep?

## 2. Prior art

| Source                                                                                               | What we reuse                                                                                                         | What we change and why                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Combobox `multiple` (`combobox.a11y.md:27`, `theme.css` `kv-combobox-value*`, `use-combobox.ts:809`) | `<ul role="list">` of chips; `Remove {label}`; focus to next, else previous, else fallback; Backspace removes nothing | The whole chip becomes the button (resolves `combobox.md` m4: users pressing the text get nothing). The focus logic is extracted, not copied                     |
| APG [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)                                       | Native buttons, Enter and Space                                                                                       | APG has no chip or tag pattern; we invent no keys (no Delete/Backspace)                                                                                          |
| Designsystemet [Chip](https://designsystemet.no/en/components/docs/chip/overview)                    | Removable chip as one button named "Slett Norge"; Checkbox chips for filters; a "clear all" button                    | We keep the checkbox box visible in the chip look, so selection isn't fill alone                                                                                 |
| MOJ [Filter](https://design-patterns.service.justice.gov.uk/components/filter/)                      | "Selected filters" as tags above the results, "Clear filters", an Apply button                                        | Their Apply button sits above the options (a keyboard problem they document). Ours: results update in place with JS; the no-JS submit sits after the last option |

## 3. Decisions

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Why                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | **One shared `Tag` + `TagGroup`.** Static (text only) or removable (one `<button>`). The focus-after-removal code in `use-combobox.ts:809` moves to an internal helper both use, in the Tag plan. Combobox adopts the Tag parts in a later, separate plan                                                                                                                                                                                                                                              | Least duplication: one chip look, one focus rule, one remove key. Leaving Combobox alone means two chip stylesheets and two focus implementations that drift |
| D1a | **Combobox migration cost** (later plan, ~5 files): `Combobox.Value` renders `Tag.Root` + `Tag.Remove`; the label moves inside the button (name "Remove Stockholm" unchanged); classes `kv-combobox-value*` become `kv-tag*` (breaking for consumer CSS: changeset, old classes kept as aliases for one minor); `ComboboxValuePartProps.className` type changes; ~70 lines of `theme.css` go; `removeIcon` maps to Tag's icon; contract Value rows updated; focus and Backspace tests stay as they are | Behaviour and names don't change, so AT users notice nothing; sighted users gain a bigger target                                                             |
| D2  | **Selectable tags are Checkboxes,** not a Tag state: a choice class `kv-checkbox-group--chips` on `CheckboxGroup.Root` (phase 2, optional). No `aria-pressed` tags                                                                                                                                                                                                                                                                                                                                     | Filters are form values: native checkboxes submit, group under a legend and are known to residents. Toggle stays for instant view switches in toolbars       |
| D3  | **Badge stays static** and is never put in a TagGroup. A locked filter is a static Tag (no button), never a disabled one                                                                                                                                                                                                                                                                                                                                                                               | A disabled remove button can't be explained or discovered                                                                                                    |
| D4  | **Every remove button is its own Tab stop;** no composite, no roving tabindex, no Delete/Backspace                                                                                                                                                                                                                                                                                                                                                                                                     | Same as Combobox; a list of buttons needs no instructions. Delete on a button is undiscoverable and risks removal by a stray key. "Clear all" covers bulk    |
| D5  | **Results update in place with JS; no Apply button.** Without JS a "Show results" submit follows the filters                                                                                                                                                                                                                                                                                                                                                                                           | No change of context (3.2.2); MOJ's documented keyboard problem avoided                                                                                      |
| D6  | **One combined announcement per change** (removal + count), polite, after results settle                                                                                                                                                                                                                                                                                                                                                                                                               | The Announcer's region is atomic: a second message replaces the first                                                                                        |
| D7  | Long facets (over ~10 options) use **Combobox `multiple`**; short ones a **CheckboxGroup**; one-of-many a **RadioGroup**. A standalone **Listbox** only in staff tools                                                                                                                                                                                                                                                                                                                                 | An inline listbox needs instructions for residents; checkboxes don't                                                                                         |

## 4. Flow

1. Arrive at the list (URL may carry filters). Count is visible in the results heading.
2. Tick a checkbox → results update (no focus move) → announce `filters.resultCount`. A Tag appears in the applied row.
3. Remove a Tag → filter's checkbox unticks → focus to next remove button / previous / the row's label → announce `filters.removedResultCount`.
4. "Clear all filters" → every tag goes → focus to the row's label → announce `filters.clearedResultCount`.
5. Change sort → list reorders, page 1, no announcement (the select shows the choice; count unchanged).

Unhappy paths: **no results** → `filters.noResults` + `filters.noResultsHint`, and the applied row with "Clear all" stays in view; **loading over 1s** → visible `filters.loading`, `aria-busy="true"` on the results list, announce only when settled; **update failed** → inline `Alert.Danger` (`filters.loadFailed`) with `filters.retry`, the filters and old results kept, focus not moved; **no JS** → GET form with `filters.apply`; **Back** → the URL restores filters and results; **any filter change** → pagination resets to page 1; **long label** → the tag wraps, never truncates.

## 5. Content (en only, per brief; sv/fi/nb/nn/se in the plan's i18n task)

| i18n key                                                            | en                                                                 | Notes                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `tag.remove`                                                        | `Remove {label}`                                                   | Remove button's name. Contains the visible text (2.5.3)                           |
| `tag.removed`                                                       | `{label} removed.`                                                 | TagGroup's default announcement; off when the caller announces a combined message |
| `filters.heading`                                                   | `Filter`                                                           | Heading of the filter form                                                        |
| `filters.disclosure`                                                | `Filters` · `Filters, 1 applied` · `Filters, {count} applied`      | Plural. Disclosure trigger below 64rem                                            |
| `filters.applied`                                                   | `Applied filters`                                                  | TagGroup.Label of the row; focus fallback                                         |
| `filters.none`                                                      | `No filters applied`                                               | Row's empty text                                                                  |
| `filters.appliedValue`                                              | `{group}: {value}`                                                 | Tag text, so "2025" isn't ambiguous out of context                                |
| `filters.clearAll`                                                  | `Clear all filters`                                                |                                                                                   |
| `filters.apply`                                                     | `Show results`                                                     | No-JS submit only                                                                 |
| `filters.sortLabel`                                                 | `Sort by`                                                          | Field label of the native `<select>`                                              |
| `filters.sort.relevance` / `.newest` / `.oldest` / `.nameAscending` | `Most relevant` / `Newest first` / `Oldest first` / `Name, A to Z` | Common options; a consumer adds its own                                           |
| `filters.resultCount`                                               | `No results` · `1 result` · `{count} results`                      | Plural; visible in the results heading and announced                              |
| `filters.removedResultCount`                                        | `{label} removed. {count} results.`                                | Plural on count                                                                   |
| `filters.clearedResultCount`                                        | `All filters cleared. {count} results.`                            | Plural on count                                                                   |
| `filters.noResults`                                                 | `No results match these filters.`                                  |                                                                                   |
| `filters.noResultsHint`                                             | `Try removing a filter, or clear all filters.`                     | Never blames the user                                                             |
| `filters.loading`                                                   | `Updating results`                                                 | Visible, not announced                                                            |
| `filters.loadFailed`                                                | `The results couldn’t be updated.`                                 |                                                                                   |
| `filters.retry`                                                     | `Try again`                                                        |                                                                                   |

Length: Finnish compounds ("Käytössä olevat suodattimet") wrap; tags hyphenate and `overflow-wrap: anywhere`.

## 6. Structure

```
320px and 40rem                         64rem
[main]                                  [main]
  h1 News                                 h1 News
  [Disclosure button "Filters, 2 applied"]  ┌ form "Filter" (h2) ┐ ┌ results column ─────────────┐
   [form aria-labelledby=h2 "Filter"]      │ fieldset Category   │ │ Applied filters: [tag][tag] │
     fieldset+legend: checkboxes           │ fieldset Year       │ │   [Clear all filters]       │
     Combobox multiple: Municipality       │ Combobox Municip.   │ │ Sort by [select]            │
     [Show results] (no JS)                │ [Show results]      │ │ h2 "24 results" (count)     │
  Applied filters: ul[tag][tag] [Clear all]└─────────────────────┘ │ ol results · Pagination     │
  Sort by [select]                                                 └─────────────────────────────┘
  h2 "24 results" · ol results · Pagination
```

- Reading order = Tab order: filters, applied row, sort, results, pagination. The applied row sits between the filters and the results, so a new tag never moves the checkbox under the pointer.
- The form is a named `form` landmark. No `<aside>`: filters are part of main content. Below 64rem the Disclosure is closed by default; at 64rem the panel is always shown and the trigger hidden.

## 7. Visual specification

All existing tokens. Comfortable 44px, compact 32px (2.5.8 only, documented).

| Part                                       | Tokens / style                                                                                                                                                                                                                                             | Notes                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `kv-tag-group`                             | flex row, wrap, `gap: space-2`; label then list then Clear all                                                                                                                                                                                             | Label `label` type, `text` colour                                                                         |
| `kv-tag-group-list`                        | `ul`, no markers, flex wrap, `gap: space-2`, no margin or padding                                                                                                                                                                                          | `role="list"` kept (Safari)                                                                               |
| `kv-tag` (static)                          | `surface` fill, 1px `border-subtle` (decorative), `sm` radius, `body` text in `text`, padding `space-1` × `space-3`                                                                                                                                        | No cross, no hover, no focus. Not a control, so the hairline is allowed                                   |
| `kv-tag-remove` (the whole removable chip) | `surface` fill, 1px `border-control`, `sm` radius, `body`, padding-inline `space-3`, `gap: space-2` to a 0.875rem cross drawn with 2px `currentColor` borders (Combobox technique), min block size `--kv-control-min-block-size`, min inline size the same | Flat: no button depth, so "Clear all" stays the one button that looks like an action. Cross at inline end |
| Clear all                                  | `kv-button` (secondary, depth per DESIGN.md)                                                                                                                                                                                                               |                                                                                                           |
| `kv-checkbox-group--chips` (phase 2)       | each option: `surface`, 1px `border-control`, `sm` radius, the native 24px box kept inside, min block size control height                                                                                                                                  | Wraps; whole label clickable                                                                              |
| Results count                              | `h2` (`heading` role per DESIGN.md), `tabindex` none                                                                                                                                                                                                       |                                                                                                           |

### States

| Part          | default                     | hover                                 | focus-visible                                 | active           | disabled                              | selected                                                     | empty                    |
| ------------- | --------------------------- | ------------------------------------- | --------------------------------------------- | ---------------- | ------------------------------------- | ------------------------------------------------------------ | ------------------------ |
| Remove tag    | `surface`, `border-control` | `primary-subtle` fill, `primary` edge | `focus-ring` 2px, offset `focus-ring-offset`  | `primary-subtle` | n/a (D3)                              | n/a                                                          | row shows `filters.none` |
| Static tag    | `surface`, `border-subtle`  | none                                  | n/a                                           | n/a              | n/a                                   | n/a                                                          | —                        |
| Checkbox chip | `surface`, `border-control` | `primary-subtle`                      | ring around the chip (`:has(:focus-visible)`) | —                | dashed `border-control`, `text-muted` | `primary-subtle` fill, `primary` edge, check mark in the box | —                        |

### Modes

- **Dark and contrast themes:** the same tokens remap. The tag on `surface` sections keeps a `border-control` edge, so its boundary is 3:1.
- **Forced colours:** removable tag `ButtonText` edge and text, `Highlight` edge on hover; static tag `CanvasText` 1px edge; the cross is borders, so it shows; checked chip: `Highlight` edge plus the native check mark. Nothing is fill only.
- **RTL:** logical properties; the cross sits at the inline end and does not mirror (symmetric).
- **Motion:** none; tags appear and go without animation.
- **320px, 400%, 1.4.12:** tags wrap to full width; the label wraps anywhere and hyphenates; min height grows with text.

### New or changed tokens

None. Pairs used are already measured: `text` on `surface` and `primary-subtle`; `border-control` and `primary` (marker) on `canvas`, `surface`, `surface-raised`, `primary-subtle`; `focus-ring`. DESIGN.md "Badges and tags" gets a Tag paragraph (maintainer approval).

## 8. Accessibility annotations (draft contract)

| Part           | Element / role                                                   | ARIA                                                      | Notes                                                                         |
| -------------- | ---------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| TagGroup.Root  | `<div>`                                                          | none                                                      | Option `announceRemoval` (default true), `focusFallback` (default: the Label) |
| TagGroup.Label | `<span>` (a heading: the hook and your own element)              | `id`; `tabindex="-1"` only while it is the focus fallback | `filters.applied` in the filter block                                         |
| TagGroup.List  | `<ul role="list">`                                               | `aria-labelledby` the Label                               | "Applied filters, list, 2 items". Not rendered while empty                    |
| TagGroup.Empty | `<p>`                                                            | none                                                      | Shown while the list is empty. Not announced                                  |
| Tag.Root       | `<li>`                                                           | none                                                      |                                                                               |
| Tag.Label      | `<span>`                                                         | none                                                      | Static tag text                                                               |
| Tag.Remove     | `<button type="button">` holding the text and a decorative cross | `aria-label` = `tag.remove` with the text                 | Name contains the visible text (2.5.3). Dev warning if `label` is missing     |
| Clear all      | `Button`                                                         | none                                                      | Rendered while the list has a removable tag                                   |
| Filter form    | `<form aria-labelledby>`                                         |                                                           | Fieldsets with legends, Combobox, native `<select>` in a Field                |
| Results list   | `<ol>`                                                           | `aria-busy="true"` while updating                         |                                                                               |

### Keyboard

- **Focus strategy:** native. **Selection follows focus:** n/a. **Arrows wrap:** n/a. **Shortcuts:** none.

| Key                | Context                   | Action                                                                                        | Test (`tag.test.tsx`)                                             |
| ------------------ | ------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Tab                | before the group          | Moves to the first remove button, then each in order, then Clear all. Static tags are skipped | `Tab reaches every remove button in order, then Clear all`        |
| Shift+Tab          | in the group              | The same, backwards                                                                           | `Shift+Tab goes back through the remove buttons`                  |
| Enter / Space      | on a remove button        | Removes the tag; focus moves to the next remove button                                        | `Enter and Space remove the tag and focus the next remove button` |
| Enter / Space      | on the last remove button | Removes it; focus moves to the previous remove button                                         | `removing the last tag focuses the previous remove button`        |
| Enter / Space      | on the only remove button | Removes it; focus moves to the fallback (the Label, or `focusFallback`)                       | `removing the only tag focuses the fallback, never body`          |
| Enter / Space      | on Clear all              | Removes every tag; focus moves to the fallback                                                | `Clear all focuses the fallback`                                  |
| Delete / Backspace | on a remove button        | Nothing: not taken                                                                            | `Delete and Backspace on a remove button remove nothing`          |
| Space              | on a checkbox chip        | Native toggle                                                                                 | `CheckboxGroup` contract                                          |

### Focus and announcements

- Focus never lands on `body` (2.4.3): every removal path ends on a button or the fallback. Ticking a box or changing sort never moves focus (3.2.2).
- TagGroup announces `tag.removed` (polite) unless `announceRemoval={false}`. The filter block sets it false and announces once, after results settle, debounced like Combobox: `filters.removedResultCount`, `filters.clearedResultCount` or `filters.resultCount` (4.1.3). Errors: the inline Alert, not announced separately.
- SCs of note: 1.3.1, 1.4.1, 1.4.10, 1.4.11, 2.4.3, 2.4.7, 2.5.3, 2.5.8, 3.2.2, 4.1.2, 4.1.3.

## 9. Task split for the plan

1. Extract the focus-after-removal helper from `use-combobox.ts:809` into `packages/react/src/internal`; Combobox calls it, its tests unchanged.
2. i18n: `tag.*` and `filters.*` in all 6 locales.
3. `useTagGroup`, `TagGroup.*`, `Tag.*`, `tag.a11y.md`, `tag.test.tsx` (one test per row above).
4. `theme.css`: `kv-tag*`, `kv-tag-group*`; DESIGN.md Tag paragraph (maintainer approval).
5. Stories: Tag (static, removable, empty, long Finnish label, RTL, forced colours, compact, `Keyboard`); a "Filter a list" pattern story with announcements.
6. Docs: Tag page, "Filter a list" recipe (D5, D7).
7. Phase 2: `kv-checkbox-group--chips`. Later plan: Combobox adopts Tag (D1a).

## 10. Validation

- [x] Self-review against `review-checklist.md` (no open blockers)
- [x] No new colour pair
- [ ] Usability test plan. Result: `pending`

**Usability test plan** (`pending`). Participants: 6–8 residents incl. 2 screen-reader users (NVDA, VoiceOver iOS), 1 magnifier user, 1 with a tremor, 2 second-language speakers, 1 with low digital confidence; 3 staff. Tasks: find this year's building-permit news; remove the year filter; recover from "no results"; share the filtered list. Measure: completion, wrong removals (and a held Enter that auto-repeats onto the next remove button), whether the count is heard after each change, whether anyone looks for an Apply button.

## 11. Open questions

- Q1 (maintainer): approve D1 (whole-chip button, shared Tag, Combobox migrates later with old classes as aliases for one minor)?
- Q2 (maintainer): approve D4 (no Delete/Backspace on tags), recorded in the `keyboard` skill?
- Q3: ship `filters.*` as library messages, or keep the filter block as a docs recipe whose strings the consumer owns?
- Q4: the Disclosure-below-64rem panel needs a media-query open state; Disclosure has no such option today.
