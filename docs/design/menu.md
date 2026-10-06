# Design spec: Menu and MenuButton

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** to be written (roadmap: Menu, MenuButton, M2; the RichTextEditor and staff tools need it)
- **Type:** component default styling (`kv-menu-*`) and usage rules

## 1. Brief

- **Users:** mainly staff (row actions in a case list, an editor's "More" overflow), many times a day, often keyboard-only, desktop, compact density. Residents rarely (a "Mina sidor" document row), once, on a phone.
- **Hardest cases:** 1. A resident with low digital confidence, Swedish as a second language, who doesn't know a button can hold hidden actions. 2. A magnifier user at 400% (320 × ~256 CSS px) who must see the whole menu and its highlighted item. 3. A tremor user on a phone, where a slip lands on the next item. 4. A Windows Contrast Themes user who must see the highlighted, checked and disabled items without the theme's colours.
- **Job:** _When I need an action that isn't on screen, I want to open one labelled button, see every action in plain words, and pick one, so I can act without searching._
- **Constraints:** APG Menu Button + Menu; DESIGN.md Overlays (level 3, `xl`, `space-2` padding, items at control height); existing tokens only; strings in six locales.
- **Success:** 0 axe violations in every story state and theme; in the usability test (`pending`) participants find a menu action first time, and nobody triggers a destructive item by mistake.
- **Evidence:** none from our users. Assumption: a visible word plus a chevron tells residents the button opens a list. → RQ: do low-confidence participants open "Åtgärder ˅" when the task needs it?

## 2. Prior art

| Source                                                                                                                              | Reuse                                                                                                                                                     | Change and why                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| APG [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) | Roles, keys, `menuitemcheckbox`/`menuitemradio`, groups, separators, focus on open and close                                                              | No submenus in v1 (§9)                                                                                                   |
| [Designsystemet Dropdown](https://designsystemet.no/no/components/docs/dropdown/overview)                                           | "A primary action or frequently used: use a visible button instead"; one choice isn't a menu; headings group items                                        | We ship real menu semantics; Designsystemet leaves them to the app                                                       |
| GOV.UK Design System                                                                                                                | No action menu: actions are visible buttons and links                                                                                                     | Our default advice for resident services (§3.1)                                                                          |
| KvirnUI Listbox (`theme.css` `kv-listbox-*`), Toolbar (`kv-toolbar--attached [aria-expanded]`)                                      | The solid highlighted row, the outlined disabled highlighted row, the group label and divider; the open button's `primary` edge and `primary-subtle` fill | Menu popup follows DESIGN.md (`xl`, 8px padding, inset `md` items); the built Listbox popup is `md` with no padding (Q5) |
| `combobox.md` m10, `tooltip.md`                                                                                                     | The chevron never flips; shortcuts formatted per platform, `aria-keyshortcuts`                                                                            | –                                                                                                                        |

## 3. Flow

1. Staff see "Åtgärder ˅" in a case row. Click, Enter, Space or ArrowDown opens the menu below it; focus moves to the first item (ArrowUp: the last).
2. Arrows or typeahead move the highlight. Enter, or a click, runs the item: the menu closes and focus returns to the trigger.
3. An item that opens a Dialog moves focus into it; when the dialog closes, focus returns to the trigger.

Unhappy paths: **Escape** closes, nothing runs, focus on the trigger. **Tab** closes and moves on. **Outside click or tap** closes, nothing runs. **Disabled item:** reachable, read as unavailable, nothing runs; the reason in words (item description line). **Destructive item:** opens an AlertDialog (`dialog.md`, focus on the safe action); cancel returns focus to the trigger. **Action fails:** the menu is already closed; an Alert in the page explains it, announced by the Announcer; focus stays on the trigger. **The action removes the trigger** (row deleted): focus goes to a documented fallback (the list's heading), never `body`. **No room below:** flips above; if neither fits, the side with more room, scrolling inside.

### 3.1 When not to use a menu

- **The task's main action, or anything a resident needs to finish:** a visible button or link. A menu hides actions, and the hardest-case users don't look inside.
- **One or two actions:** visible buttons (`kv-button-group`). **Site or page navigation:** `Navigation` or links, never `role="menu"`. **Choosing a value in a form:** RadioGroup, Listbox, Combobox. **Language switch:** links (`municipality-reference-site.md`).
- **Use it for:** secondary actions in staff tools, per-row actions in tables, an editor toolbar's overflow, view options (sort, show).

## 4. Content

Menu ships **no component strings**: the trigger, items and group labels are the consumer's keys. Examples (longest is `fi`):

| Key                                     | en                                | sv                                 | fi                               |
| --------------------------------------- | --------------------------------- | ---------------------------------- | -------------------------------- |
| `caseActions.trigger`                   | Actions                           | Åtgärder                           | Toiminnot                        |
| `caseActions.assign`                    | Assign a case officer             | Tilldela handläggare               | Määritä käsittelijä              |
| `caseActions.transfer`                  | Move the case to another unit     | Flytta ärendet till en annan enhet | Siirrä asia toiselle yksikölle   |
| `caseActions.print`                     | Print the decision                | Skriv ut beslutet                  | Tulosta päätös                   |
| `caseActions.delete`                    | Delete the draft                  | Ta bort utkastet                   | Poista luonnos                   |
| `caseList.viewTrigger`                  | View options                      | Visningsval                        | Näkymän asetukset                |
| `caseList.sortLabel` (group label)      | Sort by                           | Sortera efter                      | Lajitteluperuste                 |
| `caseList.sortNewest` / `.sortOldest`   | Newest first / Oldest first       | Senaste först / Äldsta först       | Uusin ensin / Vanhin ensin       |
| `caseList.showClosed` (checkbox)        | Show closed cases                 | Visa avslutade ärenden             | Näytä päättyneet asiat           |
| `caseActions.unavailable` (description) | Only the case officer can do this | Bara handläggaren kan göra detta   | Vain käsittelijä voi tehdä tämän |

**Rules (docs page):** action items are verb + object ("Skriv ut beslutet"), never "OK" or a bare noun; checkbox and radio items name the option. Sentence case, no ellipsis. The trigger says what's inside ("Åtgärder", "Visningsval"), never only "…". **No icon-only items**, and no icon-only trigger (DESIGN.md Icons). At most about 7 items; more get group labels and separators. The destructive item is last, after a separator. Items keep their order: never sort by use. Shortcut hints only in staff tools, opt-in, keys untranslated and formatted per platform (Plan 0037's formatter).

## 5. Structure

```
[ Åtgärder  ˅ ]                       ← kv-button (secondary) + chevron-down, aria-haspopup=menu
┌──────────────────────────────────┐  ← kv-menu-popup, 4px below, level 3, xl, 8px padding
│ ▓ Tilldela handläggare  {keys}  ▓│  ← kv-menu-item, highlighted; hint at inline end
│   Flytta ärendet till en annan   │     long labels wrap, the row grows
│   enhet                          │
│   Skriv ut beslutet              │
│ ──────────────────────────────── │  ← kv-menu-separator
│ Sortera efter                    │  ← kv-menu-group-label (inside role=group)
│ (•) Senaste först                │  ← kv-menu-item--radio, checked
│ ( ) Äldsta först                 │
│ [✓] Visa avslutade ärenden       │  ← kv-menu-item--checkbox, checked
│ ──────────────────────────────── │
│ [i] Ta bort utkastet             │  ← kv-menu-item--danger (delete icon), last
└──────────────────────────────────┘
```

Same at every breakpoint. Placement: below the trigger, aligned to its inline start; shifts to stay 8px (`space-2`) inside the viewport; flips above when below is too short. Width: at least the trigger's, from content up to `min(--kv-menu-max-inline-size, 100% of the viewport − 2 × space-2)`; never wider than the viewport, labels wrap (`overflow-wrap: anywhere`), never truncate. Height: `max-block-size: var(--kv-popup-max-height)` (the measured room), no fixed limit, `overflow-y: auto`, `overscroll-behavior: contain`, native scrollbar, `scroll-padding-block: space-2`. At 400% zoom and 320px a 7-item menu scrolls inside, and the highlighted item is scrolled into view.

## 6. Visual specification

| Part (class)                                        | Tokens and style                                                                                                                                                                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger `kv-button` (+ `--primary` allowed, rarely) | Button and its depth unchanged. Label, then `chevron-down` (size 5, decorative) at inline end, `space-2` gap. The chevron never flips or mirrors                                                                                        |
| Popup `kv-menu-popup`                               | Level 3: `surface-raised`, 1px `border-subtle`, `--kv-shadow-popup` (none in dark and contrast themes), `--kv-radius-xl`, padding `space-2`, `body`, `text`. Gap to trigger `space-1`. Top layer, no z-index                            |
| Item `kv-menu-item`                                 | Grid: [indicator or icon] [label + description] [hint]. Min `--kv-control-min-block-size` (44px; 32px compact from 64rem), padding `space-1` `space-3`, gap `space-3`, `--kv-radius-md` (concentric: 16 − 8), `body`, `cursor: pointer` |
| Description (optional)                              | Second line, `body`, `text-muted` at rest (used only for a disabled reason or a short consequence)                                                                                                                                      |
| Icon (optional)                                     | Size 5, decorative, `currentColor`, before the label. Never alone                                                                                                                                                                       |
| Shortcut hint `kv-menu-item-shortcut`               | Plain text, `body`, `--kv-menu-item-hint` (`text-muted`; `on-primary` or `on-danger` when highlighted), at inline end, `dir="ltr"`, wraps under the label when narrow                                                                   |
| Checkbox indicator                                  | A 1em rounded square (`sm`), 1px `border-control`; checked: a 2px tick in `currentColor` inside (the Listbox tick's geometry, not mirrored)                                                                                             |
| Radio indicator                                     | A 1em circle, 1px `border-control`; checked: a 0.5em dot in `currentColor`. Shape tells radio from checkbox (DESIGN.md Radii)                                                                                                           |
| Group label `kv-menu-group-label`                   | `label` in `text`, padding `space-2` `space-3` `space-1`; not focusable                                                                                                                                                                 |
| Separator `kv-menu-separator`                       | 1px `border-subtle`, margin-block `space-2`. Decorative: the group label and order carry grouping                                                                                                                                       |
| Destructive `kv-menu-item--danger`                  | `danger` text and icon (`delete`); the words say it ("Ta bort …"), so never colour alone                                                                                                                                                |

### 6.1 States

| Part             | Rest                | Highlighted (hover or keyboard focus)                 | Disabled (`aria-disabled`)          | Highlighted + disabled                                           | Checked            |
| ---------------- | ------------------- | ----------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- | ------------------ |
| Item             | transparent, `text` | **solid `primary` fill, `on-primary` text and marks** | `text-muted`, `cursor: not-allowed` | `primary-subtle` fill, 2px `primary` outline inset, `text-muted` | –                  |
| Danger item      | `danger` text       | solid `danger` fill, `on-danger`                      | as Item                             | as Item                                                          | –                  |
| Checkbox / radio | empty square / ring | marks in `on-primary`                                 | `text-muted` marks                  | as Item                                                          | tick / dot appears |

- **Not colour alone (1.4.1, 1.4.11):** the highlight is a solid rounded block that appears or doesn't, at ≥ 3:1 against the popup (`primary` 3.75:1 lowest, `danger` 6.40:1), and the text inverts. Checked is a mark's shape, never a tint. Disabled keeps a reason in words where it matters.
- **The highlight is the focus indicator** (items take DOM focus): no ring on items. It meets 2.4.13's area and 3:1 change. Pointer hover moves focus, so hover and keyboard look the same, and only one item is ever highlighted. After a pointer open, the first item has focus but no highlight until a key or hover (`data-highlighted`).
- **Trigger:** rest, hover, pressed, focus-visible ring, disabled (dashed): as Button. **Open (`aria-expanded="true"`):** 1px `primary` edge on all sides, `primary-subtle` fill, no shadow (the Toolbar's open rule), so the user sees which button the menu belongs to; not a toggle fill. No ring while focus is in the menu.

### 6.2 Contrast (existing pairs, all in `theme:check`; light / dark / light-contrast / dark-contrast)

| Pair                                                                         | Values                        | Source                                     |
| ---------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------ |
| `text` on `surface-raised` (label)                                           | 19.05 / 16.55 / 20.86 / 17.61 | `card.md` §6.5                             |
| `text-muted` on `surface-raised` (hint, description, disabled)               | 6.21 / 5.42 / 10.86 / 12.05   | `card.md` §6.5                             |
| `on-primary` on `primary` (highlighted)                                      | 4.70 / 4.70 / 9.89 / 11.14    | `switch.md`                                |
| `primary` on `surface-raised` (highlight block, open trigger edge on raised) | 4.70 / 3.75 / 9.89 / 9.40     | `card.md` §6.4                             |
| `danger` on `surface-raised` (danger label; its highlight block)             | 6.40 / 7.84 / 8.23 / 10.42    | `form-fields.md`                           |
| `on-danger` on `danger` (highlighted danger)                                 | 6.40 / 9.29 / 9.47 / 12.35    | `default-theme-button-link.md`             |
| `border-control` on `surface-raised` (empty square, ring)                    | 4.98 / 3.54 / 10.86 / 12.05   | `card.md` (`secondary` = `border-control`) |
| `primary` on `primary-subtle` (disabled highlight outline; open trigger)     | 4.15 / 3.32 / 8.72 / 8.33     | `default-theme-button-link.md`             |
| `text` on `primary-subtle` (open trigger label)                              | 16.80 / 14.66 / 18.52 / 15.59 | `default-theme-button-link.md`             |
| `text-muted` on `primary-subtle` (highlighted disabled)                      | ≥ 4.80                        | `combobox.md` §6.2                         |

### 6.3 Modes

- **Dark:** no shadow; the popup's hairline is ~1.2:1 on a Card, the open trigger and the 4px gap tie it to its button (the dark popup edge is `combobox.md` D4, shared).
- **Contrast themes:** tokens only; `border-subtle` reaches 4.68–6.42:1, so the popup edge is visible.
- **Forced colours:** popup `Canvas`, 1px `CanvasText` edge; highlighted item `Highlight` / `HighlightText` (`forced-color-adjust: none`); highlighted disabled `Canvas`, `Highlight` outline, `GrayText`; disabled `GrayText`; indicators and ticks in `currentColor` borders; destructive is `CanvasText` (the word and icon carry it); open trigger `Highlight` edge.
- **RTL:** logical properties; the popup aligns to the trigger's inline start (right); indicator at inline start, hint at inline end; the chevron and tick never mirror; arrows are vertical, so no key flips.
- **Motion:** no popup animation in any setting; highlight changes instantly (it follows fast keys). Only the trigger's own Button transitions, under `no-preference`.
- **1.4.12 and 400%:** no fixed heights; rows grow, the popup scrolls inside.
- **Touch:** items 44px tall at full popup width (compact returns to 44px below 64rem); opens on tap, never on hover; tapping the trigger again closes.

### 6.4 Tokens

No new colour. One maintainer decision: **`--kv-menu-max-inline-size`** (a component custom property, proposed `20rem`, the Popover width proposed in `combobox.md` D5). Without it the width rule needs a literal.

## 7. Accessibility annotations (draft for `menu.a11y.md`)

- **Roles:** trigger `<button type="button" aria-haspopup="menu" aria-expanded aria-controls>`; popup `role="menu"` `aria-labelledby` → trigger; items `menuitem`, `menuitemcheckbox`, `menuitemradio` with `aria-checked`; `role="group"` `aria-labelledby` → group label; `role="separator"`. Disabled: `aria-disabled="true"`, focusable, activation blocked.
- **Names:** the trigger's visible text (2.5.3). In a table row, `aria-labelledby` = trigger, then the row's key cell ("Åtgärder, Ärende 2026-0142"). An item's name is its label; a description via `aria-describedby`; a shortcut via `aria-keyshortcuts`, its hint hidden from the name.
- **Tab stops:** one, the trigger. Items use a roving tabindex (the focused item `0`, the others `-1`; the popup has none), and DOM focus moves.
- **Keys (keyboard skill, Menu button and Menu rows):** Enter / Space / ArrowDown open on the first item, ArrowUp on the last; ArrowDown / ArrowUp next and previous, wrapping; Home / End; typeahead; Enter activates and closes; Escape closes, focus to the trigger; Tab closes and moves on. **Proposed (APG optional):** Space on a checkbox or radio item toggles and keeps the menu open; Enter toggles and closes (Q2; updates the key table).
- **Focus on close:** the trigger; a Dialog's own focus when an item opens one; a documented fallback when the trigger is gone. Never `body`.
- **Announcements:** none of its own; open, items, state and position come from roles. A failed action's message goes through the page's Announcer.
- **Targets:** 44 × 44px comfortable (2.5.5), 32px compact from 64rem (2.5.8).
- **SCs of note:** 1.3.1, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 1.4.12, 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 2.5.3, 2.5.8, 4.1.2.

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blocker; every pair is an existing, measured one; no colour-only state; 320px and 400% covered.
- [ ] `theme:check` needs no new pair. `--kv-menu-max-inline-size` is a size, not a colour.
- [x] Usability test plan written. Result: `pending`. AT matrix: `pending`.

**Usability test plan (`pending`).** Participants: NVDA, JAWS and VoiceOver (iOS) users; a magnifier user at 400%; a tremor user on a phone; a Windows Contrast Themes user; two second-language Swedish readers; two residents with low digital confidence; three staff. Tasks: 1. Print the decision for case 2026-0142 (row menu). 2. Show closed cases, newest first. 3. Delete a draft, then cancel. 4. Resident, phone: download a letter from "Mina sidor" with the actions visible, then in a menu (compare). 5. Keyboard only: assign a case officer in five rows. Measure: first-time discovery of the menu, wrong-item activations, accidental destructive starts, whether checked and highlighted items are told apart in Contrast Themes.

## 9. Open questions

1. **(maintainer) D1** `--kv-menu-max-inline-size` (§6.4). **D2** a DESIGN.md Overlays line for Menu (the highlighted row, the open trigger, "prefer visible buttons") and the index row.
2. **Checkbox and radio items:** keep the menu open on Space and on click (see the result), close on Enter? APG allows it; confirm, then update the keyboard skill's Menu rows.
3. **Submenus:** out of v1. Staff tools may ask; they'd need ArrowRight/Left (flipping in RTL) and hover intent. A plan of their own.
4. **Dense tables:** staff may want an icon-only "⋯" trigger per row. DESIGN.md allows icon-only only for close and search, and there's no such icon. Keep "Åtgärder" in text, or a DESIGN.md change?
5. **Popup consistency:** the built Listbox popup is `md` with no padding and edge-to-edge rows; this spec follows DESIGN.md (`xl`, `space-2`, inset rows). Align Listbox to DESIGN.md, or amend DESIGN.md for list popups?
6. **Outside tap on touch:** close only, or close and pass the tap to what's under it? Recommend close only, so a stray tap never activates a page control.
