# Design spec: RichTextEditor compact toolbar

- **Status:** Accepted (2026-10-15) · **Designer:** ux-designer agent · **Date:** 2026-10-15
- **Plan:** 0114 (done) §Design 2
- **Type:** component default styling and composition (a second control preset)
- **Builds on:** [rich-text-editor.md](rich-text-editor.md) (§5.3, §6.5, §6.6.4–§6.6.7, §7.4), [menu.md](menu.md), `toolbar.a11y.md`, `menu.a11y.md`

## 1. Brief

- **Users:** both. **Hardest case:** a resident on a phone at 320px, with a tremor or low vision (400% zoom = 320 CSS px), Swedish or Finnish as a second language, writing a description in a form once. Second: a screen-reader user who must find every command a sighted user has.
- **Job:** _When I write a short text in a form on my phone, I want the formatting I need in one row above the text, so I can see what I type and still find the rest when I need it._
- **Context:** today the full toolbar wraps to about four rows (≈200px) at 320px icon-only, ten with names (§5.3–5.4 of the editor spec). On a phone with the on-screen keyboard open, that leaves almost no text visible.
- **Constraints:** 44px targets stay (2.5.8; DESIGN.md Density); one Tab stop with roving focus; every control keeps its name; every command stays reachable by keyboard; rule 14 (no presentation prop beyond `variant`, `size`, `orientation`, each only a class); APG Toolbar + Menu Button.
- **Success:** at 320px the compact toolbar is one row in a plain form (two at most inside a Card); 0 axe violations in every story state and theme; in testing (`pending`) participants find a command in "More" first time.
- **Evidence:** none from our users. **Assumptions → research questions:**
  - Residents use bold and lists most, and rarely headings, tables or images → Which formats do residents use in free-text fields? (support logs, `pending`)
  - A visible word "Mer" plus a chevron tells low-confidence users there is more → Do they open it when the task needs Underline? (`pending`)

## 2. Prior art

| Source                                                                                                                                          | Reuse                                                                                     | Change and why                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CKEditor 5 toolbar grouping](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html) ("Show more items", on by default) | One overflow button at the end                                                            | CKEditor measures and moves buttons as the width changes, so ArrowRight lands on different buttons at different widths. We use a fixed split (§6.2) |
| [TinyMCE `toolbar_mode`](https://www.tiny.cloud/docs/tinymce/latest/toolbar-configuration-options/) (`floating`, `sliding`, `wrap`)             | `wrap` stays our default; an explicit opt-in for the overflow form                        | Its "More" is icon-only (⋯); ours shows a word (menu.md, DESIGN.md Icons)                                                                           |
| KvirnUI Menu, `Toolbar.Item as={Menu.Trigger}` (`menu.a11y.md` Composition)                                                                     | Roles, keys, checkbox and radio items, group labels, the open trigger, placement at 320px | No new component                                                                                                                                    |
| KvirnUI editor D5 "wrap, no More" (§6.5.4)                                                                                                      | Stays the default: `DefaultControls` is unchanged                                         | This spec adds an **opt-in** preset; D5's reasons are answered by the fixed split (§6.2)                                                            |
| GOV.UK, Designsystemet                                                                                                                          | Neither ships a rich text editor; GOV.UK advises plain text for residents                 | The docs keep saying: a Textarea first, the editor only when formatting is part of the task                                                         |

## 3. Flow

1. The resident types. Bold, Italic and the two lists are on the bar and act as today (a press keeps focus in the text).
2. They need Underline: tap **Mer ⌄**. The menu opens under it, focus on its first item.
3. Tap **Understrykning**: it toggles, the menu closes, focus is back in the text at the caret, "Understrykning på" is announced, and the next letters are underlined.

Unhappy and other paths: **Escape** in the menu closes it, nothing runs, focus on "Mer". **Tap outside** closes it, nothing runs. **Unavailable item** (Ångra with nothing to undo, indent outside a list, a table action outside a table): reachable, read as unavailable, nothing runs, the menu stays open. **Lägg till länk / bild:** the menu closes and the form opens under "Mer", focus in its first field; Avbryt or Escape puts focus back in the text. **Infoga tabell:** focus goes into the new first cell; the Table group appears inside the menu, never as a new toolbar row. **Ta bort tabellen** (the last): focus to the text, the group leaves the menu. **Editor disabled:** "Mer" natively disabled, out of the Tab order. **Read-only:** no toolbar. **Overflow would hold one command:** that command is on the bar and there is no "Mer". **None:** no "Mer". **On-screen keyboard closes** when focus enters the menu: the menu is placed after the viewport settles (Menu's own placement).

## 4. Content

Every other string is an existing `richText` key. Menu items use the menu rule "verb + object" for actions and the option name for checkbox and radio items.

| i18n key                                                                                 | en                     | sv                          | nb / nn                          | fi (longest, length check) | Notes                                                                                                                           |
| ---------------------------------------------------------------------------------------- | ---------------------- | --------------------------- | -------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `richText.more` (new)                                                                    | More                   | Mer                         | Mer / Meir                       | Muut                       | Visible text and name of the trigger, and the menu's name. fi avoids "Lisää", which is already `groupInsert`: translator review |
| `richText.insertTable` (new)                                                             | Insert table           | Infoga tabell               | Sett inn tabell / Set inn tabell | Lisää taulukko             | The Table item in the menu ("Tabell" is a bare noun)                                                                            |
| `linkAddTitle` / `linkEditTitle`                                                         | Add link / Edit link   | Lägg till länk / Ändra länk | (existing)                       | (existing)                 | The Link item, by whether the caret is on a link                                                                                |
| `imageAddTitle` / `imageEditTitle`                                                       | Add image / Edit image | Lägg till bild / Ändra bild | (existing)                       | (existing)                 | The Image item, by whether an image is selected                                                                                 |
| `groupHistory`, `blockType`, `groupTextStyle`, `groupLists`, `groupInsert`, `groupTable` | (existing)             |                             |                                  |                            | Group labels in the menu                                                                                                        |
| `formatOn` / `formatOff`                                                                 | Underline on / off     | Understrykning på / av      |                                  |                            | Announced after a checkbox item (§7)                                                                                            |

Both new keys in all five locales, typed, overridable per provider and per instance (`messages` on Root), as every `richText` key.

## 5. Structure

The same DOM and order at every width: the split never changes with the viewport.

**320px, plain form (≈278px inside the toolbar's padding), icon-only:**

```
┌──────────────────────────────────┐
│ (B)(I)  (•≡)(1≡)  [Mer ⌄]        │  one row: 87 + 8 + 87 + 8 + 78 ≈ 268px
│──────────────────────────────────│
│ text …                           │
```

Inside a Card at 320px, or with 1.4.12 spacing or 200% text, "Mer" wraps to row 2 as a whole item. Nothing scrolls sideways or truncates.

**Menu open (sv, every group present):**

```
│ (B)(I)  (•≡)(1≡)  [Mer ⌄]        │  "Mer": primary edge + primary-subtle (open)
│      ┌───────────────────────────┐   kv-menu-popup, aligned to the trigger's inline end,
│      │ Ångra och gör om          │   8px inside the viewport, scrolls inside
│      │   Ångra           Ctrl+Z  │   menuitem, hint at inline end (with tooltips on)
│      │   Gör om   Ctrl+Shift+Z  │
│      │ ───────────────────────── │
│      │ Texttyp                   │   group of menuitemradio
│      │ (•) Vanlig text           │   checked = the type at the caret; none when mixed
│      │ ( ) Rubrik 2 · 3 · 4      │
│      │ ( ) Citat · Kodblock      │
│      │ Textstil                  │   menuitemcheckbox: Understrykning, Genomstrykning, Kod
│      │ Listor                    │   Öka indrag, Minska indrag
│      │ Infoga                    │   Lägg till länk, Lägg till bild, Infoga tabell
│      │   Ta bort formatering     │   alone, after a separator
│      │ Tabell (while a table)    │   the 7 table actions, then the Rubrikrad checkbox
│      └───────────────────────────┘
```

Order inside the menu is the full toolbar's order minus what is on the bar. **40rem and 64rem:** identical. In `kv-compact` from 64rem, bar buttons and menu items are 32px (DESIGN.md Density); below 64rem 44px again.

## 6. Visual specification

### 6.1 API (rule 14) — decided here, maintainer to approve

| Option                                                    | Verdict                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size="compact"` on Toolbar                               | **Rejected.** Rule 14: `size` may only pick a class; this changes the DOM (commands move into a menu). And "size" would promise smaller targets, which don't change                                                                                                                   |
| Smaller targets only (32px)                               | **Rejected.** 44px stays for resident-facing (DESIGN.md Density); 32px still needs about three rows at 320px                                                                                                                                                                          |
| Measured auto-overflow                                    | **Rejected.** Order under the arrows changes with width (D5), measuring and moving items with roving focus is fragile, and it differs per locale                                                                                                                                      |
| CSS container-query swap of two control sets              | **Rejected for now.** Both sets in the DOM needs the Toolbar to skip hidden items (a Toolbar contract change). Open question 4                                                                                                                                                        |
| **A second preset part `RichTextEditor.CompactControls`** | **Chosen.** Composition, not a presentation prop: `<RichTextEditor.Toolbar><RichTextEditor.CompactControls /></RichTextEditor.Toolbar>`. Same `include` / `exclude` (`DefaultControlName`) as `DefaultControls`. No new class choice: it renders existing classes plus one part class |

### 6.2 The fixed split

- **On the bar** (when provided and included): Bold, Italic (group `groupTextStyle`), Bulleted list, Numbered list (group `groupLists`), then **Mer**. Chosen as the most recognisable icons and the formats a resident most likely needs (assumption §1); they fit one row at 320px with "Mer" in every locale.
- **In the menu:** every other provided and included control, each exactly once, in the full toolbar's order and groups.
- Overflow of one command → it goes on the bar, no "Mer" (menu.md: one action is not a menu). None → no "Mer".
- A consumer wanting another split composes `DefaultControls include={…}` with their own `Toolbar.Item as={Menu.Trigger}` (open question 3).

### 6.3 Parts

| Part                                                          | Tokens / style                                                                                                                                                                                                                                        | Notes                                                                                                                                                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bar buttons                                                   | Unchanged: flat attached-toolbar buttons (§6.5.1), 44px, icons `md`, tooltips                                                                                                                                                                         | `labels="icon-and-text"` applies to them as today (wraps to about three rows at 320px)                                                                                                        |
| "Mer" trigger: `kv-button kv-rich-text-more` (new part class) | Flat toolbar button. Word in `label` type (`label-compact` in compact), then `chevron-down` size 20, decorative. `padding-inline: space-2`, `gap: space-1` (≈78px). `min-block-size` = density. Not in a group, last item                             | Visible text in every `labels` mode (no icon-only "⋯": menu.md, touch has no tooltip). No tooltip: its name is visible and it has no shortcut. Chevron never flips                            |
| Menu                                                          | Exactly `kv-menu-*` (menu.md §6): level 3, `xl`, `space-2` padding, 44px items, group labels, separators. `placement` bottom, aligned to the trigger's inline end, flip above when short, scroll inside, at most `min(menu max, 100vw − 2 × space-2)` | Text items, no icons (checkbox and radio indicators take the slot). Shortcut hints as Menu's `kv-menu-item-shortcut`, shown while `tooltips` is on (they replace the tooltips' shortcut line) |
| Link / Image form                                             | Unchanged `kv-rich-text-popover`, anchored to "Mer"                                                                                                                                                                                                   | Never covers "Mer" (2.4.11)                                                                                                                                                                   |

### 6.4 States

| Part      | default      | hover                         | focus-visible        | active    | disabled (editor)               | unavailable item                                         | open / checked                                                                                                       |
| --------- | ------------ | ----------------------------- | -------------------- | --------- | ------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| "Mer"     | flat, `text` | `primary-subtle`              | 2px ring, 2px offset | as Button | native `disabled`, `text-muted` | –                                                        | `aria-expanded`: 1px `primary` edge + `primary-subtle` fill (existing open rule); no ring while focus is in the menu |
| Menu item | menu.md §6.1 | solid `primary`, `on-primary` | = highlight          | –         | –                               | `aria-disabled`, `text-muted`; highlighted: outlined row | checkbox tick / radio dot (shape, not tint)                                                                          |

"Mer" shows no indicator for an active hidden format: the text itself shows underline, strikethrough, code and the block type, and the menu's checked items say it in words.

### 6.5 Modes

- **Dark, contrast themes:** tokens only. Every pair already measured (menu.md §6.2; editor §6.5). **No new colour pair, no `theme:check` change.**
- **Forced colours:** as Menu: popup `Canvas` + `CanvasText` edge, highlight `Highlight`/`HighlightText`, disabled `GrayText`, open trigger `Highlight` edge. Checked state is the tick and dot shapes.
- **RTL:** logical properties; "Mer" is at the inline end (left); the menu aligns to its inline end and shifts inside the viewport; toolbar arrows flip; menu arrows are vertical and never flip; the chevron and ticks don't mirror.
- **Motion:** Menu's (DESIGN.md Motion: a fast opacity fade on open under `no-preference` only, no exit). Nothing on the bar moves: no item ever slides between bar and menu.
- **320px, 400%, 1.4.12:** one row in a plain form, wrapping as whole items otherwise; no fixed widths; menu rows grow and the popup scrolls inside with the highlighted item in view.

### 6.6 Tokens

None. One new part class, `kv-rich-text-more` (spacing from existing `space-*`), documented in DESIGN.md's class contract with the change.

## 7. Accessibility annotations (draft rows for `rich-text-editor.a11y.md`)

- **Roles:** "Mer" is `Toolbar.Item as={Menu.Trigger}`: `<button aria-haspopup="menu" aria-expanded aria-controls>`, name = visible text (2.5.3). Popup `role="menu"` `aria-labelledby` → trigger. Groups `role="group"` labelled by their visible group label. Underline, Strikethrough, Code, Rubrikrad: `menuitemcheckbox` `aria-checked` following the caret. Text types: `menuitemradio` in a group, `aria-checked` on the current one (none when mixed). Link and Image items: `menuitem` `aria-haspopup="dialog"`. Unavailable: `aria-disabled="true"`, focusable. Shortcuts: `aria-keyshortcuts` per platform.
- **Tab stops:** unchanged: the toolbar (one stop, roving; "Mer" can be it), the text. Menu items are never toolbar items (Menu.Popup clears the toolbar context).
- **Focus after a menu item** (the editor's existing rules, carried over): keyboard command → "Mer" (as a toolbar button keeps focus); text type → the text (as the picker); Link/Image → the form's first field; Infoga tabell → the new first cell; Ta bort tabellen → the text. **Pointer press on any item → the text, at the selection** (as a bar button keeps focus in the text), so stored marks survive and the on-screen keyboard returns. Needs maintainer approval (§9).
- **Implementation hazard:** the toolbar's `onKeyDownCapture` Escape handler sees keys from the menu popup (it is in the toolbar's DOM). It must ignore events from inside `[role="menu"]`, or Escape in the menu would jump to the text.
- **Announcements (polite, existing keys):** a checkbox item announces `formatOn` / `formatOff` by keyboard and pointer, because the control that showed its state has gone; other commands announce exactly what their bar button does (`undone`, `redone`, `listLevel`, `formattingCleared`, `tableInserted`, `rowAdded`, …). A text type announces nothing (as the picker).
- **SCs of note:** 1.3.1, 1.4.1, 1.4.10, 1.4.11, 1.4.12, 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 2.5.3, 2.5.8, 3.2.1, 4.1.2, 4.1.3.

### 7.1 Keyboard rows to add, with their tests (`rich-text-toolbar.test.tsx › the compact toolbar › …`)

No new key: each row is an APG Toolbar or Menu Button key in this composition.

| Key                                         | Context                  | Action                                                                     | Test                                                                                                                                                 |
| ------------------------------------------- | ------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ArrowRight / ArrowLeft, End                 | compact toolbar          | "Mer" is the last control; the arrows reach it and wrap. Flip in RTL       | `"More" is the last toolbar item, reached by ArrowRight and End, and the arrows wrap` · `right to left: ArrowLeft goes from Numbered list to "More"` |
| Enter / Space / ArrowDown                   | on "Mer"                 | Opens the menu, focus on the first item                                    | `Enter, Space and ArrowDown on "More" open the menu on its first item, and ArrowUp on its last`                                                      |
| ArrowUp                                     | on "Mer"                 | Opens the menu, focus on the last item                                     | (same test)                                                                                                                                          |
| ArrowDown / ArrowUp, Home / End, characters | in the menu              | The Menu's keys: move, wrap, ends, typeahead                               | `ArrowDown, ArrowUp, Home, End and typeahead move in the "More" menu`                                                                                |
| Enter / Space                               | on a command item        | Runs it, closes, focus on "Mer", announced as its bar button               | `Enter on a command item runs it, closes the menu, keeps focus on "More", and announces it`                                                          |
| Enter / Space                               | on a checkbox item       | Toggles the format, closes, focus on "Mer", "Understrykning på"            | `Enter on Underline toggles it, closes the menu and announces "Understrykning på"`                                                                   |
| Enter / Space                               | on a text type           | Applies it, closes, focus back in the text                                 | `choosing a text type in the menu applies it and puts focus back in the text`                                                                        |
| Enter / Space                               | on an unavailable item   | Nothing; the menu stays open                                               | `an unavailable item is focusable, read as unavailable, and Enter does nothing`                                                                      |
| Enter / Space                               | on Lägg till länk / bild | Closes the menu, opens the form under "Mer", focus in its first field      | `"Add link" in the menu opens the link form with focus in "Web address", and Escape puts focus in the text`                                          |
| Enter / Space                               | on Infoga tabell         | Inserts, focus in the first cell; the Table group is then in the menu      | `"Insert table" moves focus into the new table, and the Table group is in the menu, unavailable outside a table`                                     |
| Escape                                      | in the menu              | Closes it, focus on "Mer" (not the text). A second Escape goes to the text | `Escape in the menu closes it and focus goes to "More"; a second Escape goes to the text`                                                            |
| Tab / Shift+Tab                             | in the menu              | Tab closes it and moves to the text; Shift+Tab closes it, focus on "Mer"   | `Tab in the menu closes it and moves to the text; Shift+Tab closes it onto "More"`                                                                   |
| Control/Command+K                           | in the text, compact     | Opens the link form under "Mer", focus in "Webbadress"                     | `Mod-k opens the link form in the compact toolbar too`                                                                                               |

Non-key tests in the same `describe`: `CompactControls shows Bold, Italic and the two lists, then "More", and every other control once, in the menu, in the default order` · `with one control left over it is on the bar and there is no "More"` · `include and exclude choose the controls of the compact toolbar` · `a pointer press on a menu item puts focus back in the text at the selection, and the next letters get the format` · `disabled with the editor: "More" is natively disabled and out of the Tab order` · `the menu's items follow the caret: checked text styles and the current text type`. Stories (axe in every theme): Compact, menu open, with a table, `icon-and-text`, disabled, RTL, ForcedColors, and the compact form in the `Keyboard` story.

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blocker. Targets 44px; one row at 320px plain; no colour-only state; every string keyed; no new colour.
- [x] Contrast: no new pair (all in menu.md §6.2 and the editor spec).
- [x] Usability test plan written. Result: `pending`. AT matrix rows: `pending`.

**Usability test plan (`pending`).** Participants: NVDA + Chrome, VoiceOver iOS, TalkBack users; a magnifier user at 400%; a tremor user on a phone; a Windows Contrast Themes user; two second-language Swedish and two Finnish readers; two low-confidence residents; two staff. Tasks on a phone form: 1. Write three bullet points. 2. Underline one word (in "Mer"). 3. Add a link to a web page. 4. Undo a mistake. 5. Keyboard only (desktop): make a heading and a numbered list. Measure: first-time discovery of "Mer", wrong-item taps, lost formatting after a menu tap, rows of text visible with the keyboard open, whether "Muut" is understood.

## 9. Open questions

**Needs maintainer approval**

1. **Supersede D5 for an opt-in preset** (`CompactControls`); `DefaultControls` and its wrapping stay the default. Then the editor spec §6.5.4, `toolbar.tsx`'s JSDoc ("nothing is hidden behind a More button") and the docs tips change in the same PR.
2. **The API:** a preset part instead of a `size` (§6.1).
3. **Focus after a menu item** (§7): a pointer press returns focus to the text, not to the trigger as Menu does by default; a text type returns to the text by keyboard too. Both mirror the editor's existing rules. If `Menu` has no way to skip its focus return, that is a Menu API addition (its contract and tests).
4. **A width-responsive form** (full at wide, compact at narrow) needs the Toolbar to skip hidden items: a Toolbar contract change. Not in this plan.
5. **The visible set:** Bold, Italic, lists (proposed) or Bold, lists, Link (GOV.UK advises against italics; Link is then one tap and Ctrl+K). Only one fits with "Mer" at 320px.

**Other**

6. `richText.more` in Finnish ("Muut"): translator review.
7. `imagePasteNotSupported` says "Use the Image button"; in the compact toolbar it is "Lägg till bild" in "Mer". Reword in Plan 0114 §1 ("Use Add image")?
8. A consumer's own split (`Toolbar.Item as={Menu.Trigger}` with editor commands as menu items) needs exported menu-item commands: a later plan.
