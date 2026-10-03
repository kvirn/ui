# Design spec: Listbox, Combobox and Autocomplete (and the Popover popup), default theme

- **Status:** In review (a design review of the built parts, with the target spec)
- **Designer:** ux-designer agent · **Date:** 2026-10-02
- **Plan:** [Plan 0022](../plans/0022-listbox-combobox-autocomplete.md)
- **Type:** component default styling (+ a design review, + proposed DESIGN.md wording)

The parts and behaviour are decided in the Listbox, overlay and Combobox decisions, and specified in `listbox.a11y.md`, `combobox.a11y.md`, `autocomplete.a11y.md` and `popover.a11y.md`. This spec covers **what they look like** in the default theme (`packages/theme/theme.css`, the `kv-listbox-*`, `kv-combobox-*` and `kv-autocomplete-*` rules), and records the review of the built parts. The parts were built before this spec (Plan 0022, "Design spec: none yet"), so §6 describes the target and marks every difference from the build with **→ change** and a finding id from §8.

**How the review was done:** by reading `theme.css`, the stories, the fixtures, the package docs and the contracts, and by looking at six screenshots in light theme at desktop width and at 320px (`listbox-keyboard`, `listbox-groups`, `combobox-keyboard`, `combobox-multiple`, `autocomplete`, `combobox-320`), plus an older native-select screenshot. Nothing was run. Dark, the contrast themes, forced colours and RTL were reviewed **from the CSS only**: they need screenshots before this spec is approved (§8, Validation).

## 1. Brief

- **Users:** both.
  - Residents pick their municipality, a school, a country or a street once, often on a phone and under stress.
  - Staff pick codes (occupation, case type, unit) many times a day on a desktop, often in compact density, often with the keyboard only.
- **Hardest-case users:**
  1. A resident with low digital confidence, reading Swedish as a second language, on a laptop with a mouse. They click into a box labelled "Kommuner" and expect a list. If nothing happens and the box looks like a plain text field, they're stuck.
  2. A screen-magnifier user at 400% (320 CSS px) who sees about one field at a time. They must be able to see the field they're typing in while the list is open, and see what they chose afterwards without opening the list again.
  3. A user with a hand tremor choosing several values with the mouse. Targets must not move between two presses.
  4. A Windows Contrast Themes user who must see which option is highlighted and which are chosen, without the theme's colours.
  5. A staff member who uses only the keyboard, 50 times a day: one Tab stop, APG keys, nothing that slows them down.
- **Job to be done:** When a service asks me to choose from a long list, I want to find my answer quickly by typing or scrolling, and see clearly what I've chosen, so I can move on with confidence.
- **Context:** residents: rare, stressed, any device. On touch, a single-choice Listbox is the platform's own picker, and Combobox and Autocomplete stay custom. Staff: daily, desktop, keyboard.
- **Constraints:** headless packages ship no CSS (hard rule 5). Only DESIGN.md tokens. Every visible or announced string from `@kvirn-ui/i18n` in all six locales (hard rule 4).
- **Success criteria:** the user completes the choice on the first try, sees the field while typing, can confirm their choice without reopening the list, and removes a single chosen value without losing the others.
- **Evidence:** none from KvirnUI users yet. Prior art is cited in §2. Everything else is an assumption.
- **Assumptions and research questions:**
  - Assumption: a visible chevron is what tells residents "there's a list here". → Does a participant find the list in a Combobox without a Toggle?
  - Assumption: the chosen-values chips are understood as "chosen, press × to remove". → Do participants try to press the chip's text?
  - Assumption: ticks in the open list are enough to show what's chosen while the chips are out of sight (decision D2). → Do participants lose track of their choices?

## 2. Prior art

| Source                                                              | What we reuse                                                                                                                                                                  | What we change and why                                                                                                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KvirnUI `kv-input`, `kv-input-group` (`form-fields.md` §6.3, §6.13) | The box: 1px `border-control`, `md` radius, 44px, hover to `text`, 2px `danger` invalid with padding compensation, dashed disabled on `surface`, the ring around the whole box | The Combobox Control's buttons have no divider (the input group's button has one so it isn't mistaken for an Addon; a Control has no Addons). Record it in DESIGN.md (D9) |
| KvirnUI `kv-listbox-native` (the native select's look)              | The trigger's box and chevron, so touch and desktop look like the same field                                                                                                   | One chevron geometry for all three (P1)                                                                                                                                   |
| APG Select-Only Combobox, Editable Combobox With List Autocomplete  | Structure, keys, `aria-activedescendant`, the visible active option                                                                                                            | None                                                                                                                                                                      |
| GOV.UK Design System: Select, and `accessible-autocomplete`         | No dropdown arrow on a free-text autocomplete by default (`showAllValues` adds one), a "No results found" message, hint text over placeholders                                 | We keep a chevron on Combobox (closed list) and drop it from Autocomplete's default (m3, D6)                                                                              |
| Designsystemet (NO): Combobox                                       | Chips for several values, a clear button                                                                                                                                       | Designsystemet puts chips inside the field. We keep them outside the box, so each chip can be a 44px target and wraps on its own line                                     |
| React Aria: ComboBox, Select                                        | The trigger named by label plus value. Buttons labelled with their own text plus the field's label                                                                             | Applied to Toggle and Clear names (m2)                                                                                                                                    |

## 3. Flow

Choosing in a Combobox, one value:

1. Tab or click into the input (a click doesn't open). The hint says "Börja skriva och välj sedan i listan."
2. Type → the list filters and opens under the box. About 500 ms after typing stops, the count is announced.
3. ArrowDown → the first option is active (bar and fill). Or press an option.
4. Enter or press → its text fills the input, the popup closes, focus stays.
5. Submit.

Several values: the same, but after step 4 the value becomes a chip, the text empties and the popup stays open for the next choice.

Unhappy paths:

- **No match:** the popup shows "Inga resultat" (in `text`, M6), "Inga resultat" is announced, and the text stays. On submit the consumer's error says "Välj en kommun i listan".
- **Loading:** "Laddar resultat" in the popup and announced. Options already shown stay.
- **Disabled option:** reachable, read as unavailable, can't be chosen. The reason is shown in words (m5).
- **Typed text that names no option, then Tab:** the text stays, the value is `null`, and validation explains it. Nothing is cleared silently.
- **Wrong value chosen (several):** the user removes one chip with its × (focus moves to the next ×). Clear must not remove every value (M2).
- **No room below:** the popup flips above, and never covers the box (B1 is where it currently does).
- **Phone, on-screen keyboard open:** the popup must fit in the visible part of the screen (open question 3).

## 4. Content

### 4.1 Component strings (`combobox` namespace, all six locales)

| i18n key                                                                             | en                         | sv                            | fi                        | Notes                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------ | -------------------------- | ----------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `combobox.resultCount`                                                               | 1 result / {count} results | 1 resultat / {count} resultat | 1 tulos / {count} tulosta | Announced only. Fine                                                                                                                                                                                |
| `combobox.noResults`                                                                 | No results                 | Inga resultat                 | Ei tuloksia               | Shown and announced. Fine as a default. Recommend contextual text in the docs (4.2)                                                                                                                 |
| `combobox.loading`                                                                   | Loading results            | Laddar resultat               | Ladataan tuloksia         | Fine                                                                                                                                                                                                |
| `combobox.removeValue`                                                               | Remove {label}             | Ta bort {label}               | Poista {label}            | The remove button's name. Fine                                                                                                                                                                      |
| `combobox.clear`                                                                     | Clear                      | Rensa                         | Tyhjennä                  | Name only. Out of context it's ambiguous when there are several fields: name the button "Rensa, Kommun" with `aria-labelledby` (its own text, then the Field label). The string doesn't change (m2) |
| `combobox.showOptions`                                                               | Show options               | Visa alternativ               | Näytä vaihtoehdot         | Name only. Same `aria-labelledby` treatment. The name stays when open, `aria-expanded` carries the state. Fine                                                                                      |
| `autocomplete.showSuggestions` (proposed, only if D6 keeps a Toggle in Autocomplete) | Show suggestions           | Visa förslag                  | Näytä ehdotukset          | "Options" implies a closed list, which an Autocomplete isn't                                                                                                                                        |

### 4.2 Consumer copy the docs and stories should model

| Where                        | sv                                                                                     | en                                                                                | Notes                                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Combobox hint                | Börja skriva och välj sedan i listan.                                                  | Start typing, then choose from the list.                                          | Already in the fixture. Make it the documented default: a click doesn't open the list, so the hint says what to do |
| Several values hint          | Du kan välja flera.                                                                    | You can choose several.                                                           | Already in the fixture                                                                                             |
| Not in the list (error)      | Välj en kommun i listan                                                                | Choose a municipality from the list                                               | Already in the fixture. Good: says what to do                                                                      |
| `Combobox.Empty`, contextual | Ingen kommun matchar det du skrev. Kontrollera stavningen eller skriv färre bokstäver. | No municipality matches what you typed. Check the spelling or type fewer letters. | Recommend in `combobox.md` as an example child of `Combobox.Empty`. Long: it wraps, so check it at 320px           |
| Autocomplete hint            | Börja skriva så föreslår vi gator. Du kan också skriva en egen adress.                 | Start typing and we'll suggest streets. You can also type your own address.       | Good. Put the example ("Till exempel Storgatan") here, not in a placeholder (m9)                                   |
| Listbox placeholder          | Välj kommun                                                                            | Choose a municipality                                                             | Never the label. Fine                                                                                              |
| Disabled option reason       | Stockholm – stängd för ansökningar                                                     | Stockholm – closed for applications                                               | As a rich option's second line (m5)                                                                                |

## 5. Structure

The same at every breakpoint: the control is as wide as its column (the 40rem form column for residents, full width at 320px), and the popup is as wide as its anchor and never wider than the viewport minus 8px each side. Compact density applies from 64rem in staff tools.

```
Listbox (custom)                      Combobox, one value
Label                                 Label
Hint                                  Hint
[ Value or placeholder        ˅ ]     [ typed text          ×   ˅ ]   ← Control: input, Clear, Toggle
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ Group label                  │      │ ▌Option (active)          ✓ │   ← bar + fill, tick = chosen
│ ▌Option (active)          ✓ │      │  Option                      │
│  Option                      │      │  Option (half a row shows)   │
│ ───────────────────────────  │      └──────────────────────────────┘
│ Group label                  │      Hint under the box, Error
│  Option                      │
└──────────────────────────────┘

Combobox, several values (target, D2)  Autocomplete
Label                                  Label (valfritt)
Hint                                   Hint
[ typed text                   ˅ ]     [ typed text              × ]   ← no Toggle by default (D6)
[Malmö | ×] [Uppsala | ×]              suggestions popup
Error
```

Reading order and Tab order are the same as the visual order. In the built version (and the Listbox decision) the chips come **before** the input. D2 recommends after.

## 6. Visual specification

### 6.1 Parts, tokens and metrics

| Part (class)                                             | Tokens / metrics                                                                                                                                                                                                                                                                                                                                      | Density         | Notes                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------- |
| Trigger `kv-listbox-trigger`                             | As `input`: `canvas`, 1px `border-control`, `md`, `body`, min 44px, padding-inline 12px. **→ change (P1):** padding-inline-end `--kv-control-min-block-size`, the chevron centred in it                                                                                                                                                               | 32px            | `cursor: pointer`                                                             |
| Value `kv-listbox-value`                                 | `body` in `text`. Placeholder `text-muted` (6.3:1 on `canvas`). **→ change (M4):** wraps (`white-space: normal`, `overflow-wrap: anywhere`), no ellipsis. The trigger grows                                                                                                                                                                           |                 | The native select still truncates: a platform limit, documented               |
| Input `kv-combobox-input`, `kv-autocomplete-input`       | Exactly `input`. Inside a Control: no edge, fill or ring, padding 11px                                                                                                                                                                                                                                                                                | 32px            |                                                                               |
| Control `kv-combobox-control`, `kv-autocomplete-control` | Exactly `input-group`: edge plus padding always 2px                                                                                                                                                                                                                                                                                                   | 32px            |                                                                               |
| Toggle, Clear `kv-*-toggle`, `kv-*-clear`                | Full box height, min 44px wide, transparent, mark in `text`. **→ change (m1):** hover `primary-subtle` inside the box's edge (`background-clip: padding-box`), as the input group's button. **→ change (P3):** margin-inline-end −2px on the last button                                                                                              | 32px            | No divider (D9). Clear before Toggle                                          |
| Chevron (all three)                                      | A 7px square, 2px borders in `currentColor`, turned 45°, physical borders (not mirrored). **→ change (P1, P5):** centred `calc(var(--kv-control-min-block-size) / 2)` from the box's outer inline-end edge in all three (now 18px native, 20px Listbox, 24px Combobox). **→ change (m10):** never flips                                               |                 |                                                                               |
| Cross (Clear, remove)                                    | Two 14px lines, 2px, `currentColor`                                                                                                                                                                                                                                                                                                                   |                 |                                                                               |
| Popup `kv-listbox-popup`                                 | Level 3: `surface-raised`, 1px edge, `--kv-shadow-popup`, `xl` radius, 8px padding. Gap to the anchor 4px. **→ change (m8):** height limit `calc(6.5 * var(--kv-control-min-block-size) + 2 * var(--kv-space-2) + 2 * var(--kv-border-width))` (304px, 226px compact) instead of 20rem, so half a row always shows. **→ open (D4):** the edge in dark | 8px padding     | Concentric: 16px − 8px = the option's 8px                                     |
| Option `kv-listbox-option`                               | Min 44px, padding 4px 12px, 4px transparent inline-start border, `md` radius, `body`, wraps anywhere                                                                                                                                                                                                                                                  | 32px            |                                                                               |
| Active option `[data-active]`                            | 4px `primary` bar + `primary-subtle` fill. `primary` on `primary-subtle` is held to 3:1 by `theme:check`                                                                                                                                                                                                                                              |                 | Shape plus fill, never colour alone                                           |
| Chosen option `[data-selected]`                          | A tick at the inline end, 2px, `currentColor`, not mirrored                                                                                                                                                                                                                                                                                           |                 | Several: every chosen option has a tick                                       |
| Disabled option `[aria-disabled]`                        | `text-muted`, `cursor: not-allowed`. **→ change (m5):** the reason in words, in the content                                                                                                                                                                                                                                                           |                 | Disabled controls are exempt from 1.4.3, so muted is allowed                  |
| Group label `kv-listbox-group-label`                     | **→ change (M5):** `label` (16px, 500) in `text`, padding 8px 12px 4px 16px. Groups after the first get a 1px `border-subtle` line above, with 8px around it                                                                                                                                                                                          | `label-compact` | It's the group's name (`aria-labelledby`), so it is read and must be readable |
| Empty `kv-listbox-empty`                                 | **→ change (M6):** `body` in `text`, padding 12px                                                                                                                                                                                                                                                                                                     |                 | It explains why there is nothing to choose                                    |
| Value list `kv-combobox-value-list`                      | Flex, wrap, gap 8px, 8px from the input                                                                                                                                                                                                                                                                                                               |                 | **→ open (D2):** after the Control                                            |
| Chip `kv-combobox-value`                                 | `surface`, 1px `border-control`, `body`. Min height 44px + 2px edge. **→ change (m4):** `sm` radius (DESIGN.md Shapes: tags), and a 1px `border-control` divider between the label and the remove button                                                                                                                                              | 32px + 2px      | The label isn't pressable: `cursor: default`                                  |
| Remove `kv-combobox-value-remove`                        | 44px square, hover `primary-subtle`, ring 2px outside. **→ change (P4):** inner radius `calc(var(--kv-radius-sm) - var(--kv-border-width))`                                                                                                                                                                                                           | 32px            |                                                                               |
| Popover popup `kv-popover-popup`                         | **Not styled by the theme yet (m7).** Target (D5): level 3, `xl`, 16px padding (12px compact), `body`, `max-inline-size: min(20rem, var(--kv-popup-width))`                                                                                                                                                                                           | 12px padding    | The story's inline style uses `border-control`, which is not level 3          |

### 6.2 States

| Part            | default              | hover                         | focus-visible                     | active (option) | disabled                                                                                                                   | invalid                                                    | loading                          | selected / open                                      | empty                                                                  |
| --------------- | -------------------- | ----------------------------- | --------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Trigger         | 1px `border-control` | edge `text`                   | 2px ring, 2px offset              | n/a             | dashed, `surface`, `text-muted`, not focusable                                                                             | 2px `danger`, padding −1px. **→ P2:** chevron mustn't move | n/a                              | Open: no change of its own (focus ring if from keys) | Placeholder in `text-muted`                                            |
| Control / input | as trigger           | edge `text`, on the whole box | ring around the Control           | n/a             | dashed, `surface`; Toggle muted; **→ m6:** Clear hidden                                                                    | 2px `danger`                                               | n/a                              | Toggle `[data-open]`: **→ m10** no flip              | Clear hidden                                                           |
| Option          | transparent bar      | becomes active (pointer move) | n/a (focus stays on the combobox) | bar + fill      | `text-muted`, cursor not-allowed. Active and disabled: bar + fill + muted text (`text-muted` on `primary-subtle` ≥ 4.80:1) | n/a                                                        | n/a                              | tick                                                 | n/a                                                                    |
| Popup           | level 3              | n/a                           | n/a                               | n/a             | n/a                                                                                                                        | n/a                                                        | "Laddar resultat" in `text` (M6) | open                                                 | "Inga resultat" in `text` (M6), or nothing drawn when there's no Empty |
| Chip            | `surface`, edge      | remove: `primary-subtle`      | remove: ring                      | n/a             | dashed edge, `text-muted`                                                                                                  | n/a                                                        | n/a                              | n/a                                                  | the list isn't rendered                                                |

### 6.3 Modes (from the CSS, not yet screenshotted)

- **Dark:** popups lose their shadow and keep a 1px `border-subtle` edge (neutral-800 on neutral-900, about 1.2:1). On a Card (also `surface-raised`) the popup has almost no visible boundary, and the card's content below can read as more options (M7, D4).
- **Light-contrast, dark-contrast:** `border-subtle` is 4.68–6.42:1 there, so the popup edge is fine. Bars and edges are the measured tokens.
- **Forced colours:** boxes `ButtonBorder` on `Field`, invalid `CanvasText` at 2px (width carries it), disabled `GrayText` dashed, the active option `Highlight`/`HighlightText` with `forced-color-adjust: none`, ticks, chevrons and crosses in `currentColor` borders, the popup edge `CanvasText`, chips `ButtonBorder`. Nothing relies on a background alone. Good.
- **RTL:** logical properties throughout. The chevron and tick aren't mirrored (correct). The Listbox chevron uses logical borders with a counter-rotation in `:dir(rtl)`, and the Combobox chevron physical borders: same result, two methods (P5).
- **Motion:** only `background-color` and `border-color` transitions on the boxes, under `no-preference`. No popup animation. Good.
- **320px, 400%, 1.4.12:** the popup matches the anchor width and long Finnish options wrap (`combobox-320.png`). Truncated trigger values get shorter still under 1.4.12 letter spacing (M4). A long chosen value in a Combobox input shows its end, not its start (P6).

### 6.4 New or changed tokens

No new colour and no new palette step. Proposed (needs the maintainer's approval and `theme:check`, decision D4):

| Token                                                              | Value per theme                                                                                               | Contrast pair                                                                                                                                                                                                                                                            | Decision                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `--kv-popup-edge` (a component alias, like `form-fields.md` §6.11) | light, light-contrast, dark-contrast: `var(--kv-color-border-subtle)`. dark: `var(--kv-color-border-control)` | In dark, `border-control` on `canvas`, `surface` and `surface-raised` is already held to ≥ 3:1 by `theme:check` (DESIGN.md, Colors). Add the alias to the measured pairs so a rebrand can't break it. Ratio to be measured with `vp run theme:check` by the main session | to be drafted if D4 is accepted |

`--kv-popup-height-limit` already exists as a public custom property (`popover.md`). Document it in DESIGN.md, Theming (D9).

## 7. Accessibility annotations

The contracts are the source (`listbox.a11y.md`, `combobox.a11y.md`, `autocomplete.a11y.md`, `popover.a11y.md`). Design-relevant points:

- **Names:** the trigger is named by the label then the value. Inputs by `<label for>`. Toggle and Clear have no visible text: **→ m2** name them with their own text plus the label.
- **Tab stops:** Listbox: the trigger (1). Combobox: the remove buttons (several), then the input; Toggle and Clear are not tab stops. D2 would move the remove buttons after the input.
- **Focus:** DOM focus stays on the trigger or input (`aria-activedescendant`). The active option is always visible: bar and fill, scrolled into view.
- **Never obscured (2.4.11):** the popup must never cover its anchor. **It currently does in multiple mode (B1).**
- **Announcements:** count, no results, loading, debounced, through the Announcer. Not the active option.
- **Target size:** 44px everything (32px compact, never under 24px).

## 8. Review findings

Severity follows the `design` skill. Each finding: location, issue, rule, who it affects, fix.

### Blocker

- **B1. The popup covers its own input after the first choice in a Combobox with several values.** `combobox-multiple.png`: the popup's top (y≈127) sits just under the new "Malmö" chip, and the focused input (its ring shows at x≈13 and x≈657, y≈140–185) is entirely under the popup. The cause: `usePopup` places again on scroll, on window resize and when the anchor or popup **changes size** (`packages/react/src/popup/use-popup.ts:238–262`). When the value list appears or wraps to a new row, the Control **moves** without resizing, and the Combobox never calls `reposition`. — WCAG 2.4.11 Focus Not Obscured (Minimum), the Listbox decision, `combobox.a11y.md` "the popup never covers the input". — Every sighted user choosing several values: they can't see what they type; magnifier users lose the field. — Fix: place again whenever the value list changes (observe the value list's size as well, or call `reposition` in a layout effect after the chosen values change), and add an e2e check that after the first choice the popup's top is at or below the Control's bottom. D2 removes the cause altogether.

### Major

- **M1. Options move under the pointer in multiple mode.** The first chip row (≈54px) is inserted above the input while the popup stays open, and again whenever the chips wrap. Once B1 is fixed the popup moves with the input, so the next press lands on a different option. — No SC, but it causes wrong choices. — Tremor and magnifier users, fast mouse users. — Fix: D2 (the value list after the Control).
- **M2. Clear removes every chosen value in multiple mode.** `hasClearableValue` counts chosen keys (`use-combobox.ts:834`), so one press on a 44px target next to the Toggle, named only "Rensa", empties the whole choice with no undo. — DESIGN.md (destructive actions need a confirmation step). — Anyone who misses the Toggle, especially on touch. — Fix: in multiple, Clear empties the text only and shows only while there is text (D3).
- **M3. Nothing shows there's a list.** The docs' first example (`combobox.md`, "How it works"), `MultipleExample` and `MunicipalitiesCombobox` render a bare `Combobox.Input`, and a click doesn't open the list. In `combobox-keyboard.png` the "Kommuner" input looks like any text field. — Clarity first (DESIGN.md principle 1). — Residents with low digital confidence, mouse and touch users. — Fix: make `Control` + `Clear` + `Toggle` the documented default for Combobox (one and several values). Keep the bare input as the `Minimal` story. Keep the hint "Börja skriva och välj sedan i listan." in every example (D1).
- **M4. The Listbox trigger truncates its value.** `.kv-listbox-value` is `nowrap` with an ellipsis (`theme.css` 3359–3365). With `multiple`, `Listbox.Value` joins every chosen text with commas, so chosen values disappear behind "…". At 320px a long Finnish name is cut, and more under 1.4.12. — DESIGN.md Layout ("use `overflow-wrap: anywhere` as a last resort, not truncation"). — Magnifier users who need to confirm their choice without reopening, anyone choosing several. — Fix: wrap the value, and let the trigger grow (§6.1).
- **M5. Group labels are 14px `text-muted`** (`theme.css` 3480–3487, `listbox-groups.png`). — DESIGN.md Typography (`label-compact` is only for control labels in compact density) and Don'ts (no `text-muted` for what the user must read). A group name can be what tells two options apart (the same street name in two municipalities). — Low-vision users, second-language readers. — Fix: `label` in `text`, a `border-subtle` line between groups (§6.1).
- **M6. "Inga resultat" and "Laddar resultat" are `text-muted`** (`theme.css` 3489–3492). — DESIGN.md Don'ts. It's the only explanation of an empty list. — Low-vision users. — Fix: `text`.
- **M7. In dark, a popup on a Card has almost no edge** (§6.3). From the tokens, not yet screenshotted. — 1.4.11 doesn't strictly require a popup boundary, but the list's end isn't perceivable. — Low-vision users in dark mode. — Fix: D4. Also make the Popover story match whatever is decided (it uses `border-control` now).

### Minor

- **m1.** Toggle and Clear have no hover state, unlike the input group's button (`primary-subtle`, DESIGN.md Text inputs). Fix: §6.1.
- **m2.** Toggle and Clear names are the same on every field ("Rensa", "Visa alternativ"). With three Comboboxes, a screen reader's button list has three "Rensa" and voice control needs to show numbers. Fix: `aria-labelledby` = the button's own text, then the Field label ("Rensa, Kommun"). No new string.
- **m3.** The Autocomplete fixture has a Toggle (`autocomplete.fixture.tsx` 124–128, `autocomplete.png`). A chevron says "choose from a closed list", which contradicts "Du kan också skriva en egen adress". GOV.UK's autocomplete has no arrow by default. Fix: D6.
- **m4.** Chips look like buttons: 46px, `md` radius and a `border-control` edge, next to the "Före" button in `combobox-keyboard.png`. Users may press the text. Fix: `sm` radius (DESIGN.md Shapes: tags), and a divider before the ×, so the target is visibly the × only.
- **m5.** A disabled option is told apart by colour only. Fix: show the reason in words in the option (the `DisabledOption` stories should show "stängd för ansökningar"). No strike-through, which hurts reading.
- **m6.** A disabled Combobox with a value renders a disabled Clear (`hasClearableValue` ignores `disabled`). It's noise. Fix: don't render Clear while disabled (verify in the `ComboboxStates` disabled field).
- **m7.** Popover has no default-theme styles (`popover.md`: "The default theme doesn't style Popover yet"). The stories draw it with inline styles, a `border-control` edge and hard-coded fallbacks. Fix: D5.
- **m8.** The 20rem height limit shows 6.9 options in comfortable density. The 7th row is cut by about 4px and looks complete (`combobox-multiple.png`, `autocomplete.png`), so there's no hint that the list scrolls, and macOS hides scrollbars. Fix: the 6.5-row limit in §6.1.
- **m9.** The Autocomplete placeholder "Till exempel Storgatan" repeats the hint and disappears on typing. Fix: the example goes in the hint.
- **m10.** The Combobox Toggle's chevron flips when open, the Listbox's and the native select's don't. Fix: no flip anywhere. The open popup is the cue.

### Polish

- **P1.** Three chevron positions: centred 18px (native), 20px (Listbox) and 24px (Combobox Toggle) from the outer inline-end edge (measured in the screenshots). Fix: §6.1, one geometry, scaling with density.
- **P2.** The Listbox chevron moves 1px inward when invalid (it's placed from the padding edge, and the edge grows to 2px). Fix: subtract `(edge width − 1px)`, as the padding does.
- **P3.** Toggle and Clear reach over the box's padding at the top and bottom only, so the last button stops 1px short of the end edge and its inset ring is lopsided. Fix: margin-inline-end −2px on the last button, as `.kv-input-group > .kv-input ~ .kv-button`.
- **P4.** The remove button's corner radius equals the chip's outer radius. Fix: the inner radius (§6.1).
- **P5.** Two ways to keep a chevron unmirrored (logical borders with an RTL counter-rotation, and physical borders). Fix: physical borders in both, no `:dir()` rule.
- **P6.** A long chosen value in a Combobox input shows its end ("nhoitopiirin kuntayhtymä", `combobox-320.png`). Fix: show the start of the text when the input isn't focused (`scrollLeft = 0` on blur).
- **P7.** The native select's placeholder is `text`, the custom trigger's `text-muted`. A platform limit: document it, don't fight it.

### Works well (keep)

- One box everywhere: the trigger, the input and the Control share `kv-input`'s edge, hover, ring, 2px invalid (text doesn't move) and dashed disabled. The Listbox and the native select look like the same field.
- Concentric radii: popup `xl` (16px) minus 8px padding is exactly the option's `md` (8px).
- The active option is a 4px bar plus a fill, `Highlight` in forced colours. The chosen option is a tick that isn't mirrored. Neither is colour alone.
- 44px options, Toggle, Clear and remove buttons (32px compact). The input fills the whole box, so the click target is the whole field.
- At 320px the popup is exactly as wide as the Control and long Finnish options wrap (`combobox-320.png`).
- A popup with nothing to show draws nothing.
- Marks drawn with borders in `currentColor`, which survive forced colours.
- No popup animation. Transitions only under `no-preference`.
- Content: the hints, the "Välj en kommun i listan" error and the Autocomplete hint are plain and say what to do. å, ä and ö filtering is visible in `autocomplete.png` ("ä" finds Järnvägsgatan and Älvgatan, not "a").

**VERDICT: CHANGES REQUIRED** (B1, plus M1 to M7).

## 9. Validation

- [x] Self-review against `review-checklist.md`. Open blocker: B1 (2.4.11). Every string has a key. No colour-only state once m5 is done. Targets are 44px. Focus ring on every focusable part. No compliance claim.
- [ ] Screenshots of dark, light-contrast, dark-contrast, forced colours and RTL, with a popup open on a Card, at 1280px and 320px (the e2e projects). Not done in this review.
- [ ] Contrast: no new colour. The D4 alias needs `vp run theme:check` (main session).
- [x] Usability test plan written. Result: `pending`.

### Usability test plan

- **Participants (8):** a screen-reader user (NVDA, and VoiceOver on iOS), a magnifier user at 400%, a Windows Contrast Themes user, a person with a tremor, an older person with low digital confidence, a second-language reader (Swedish or Finnish), and two staff users in compact density.
- **Tasks:**
  1. Choose your municipality (Listbox on desktop, then on a phone, where it's the native picker).
  2. Choose "Pohjois-Pohjanmaan sairaanhoitopiirin kuntayhtymä" by typing (Combobox, fi), then tell the moderator what you chose without opening the list.
  3. Choose three municipalities, then remove one (several values).
  4. Type a street that isn't in the suggestions and continue (Autocomplete).
  5. Type "Xyz" in the Combobox and recover.
  6. Staff: choose a code in five records in a row with the keyboard only.
- **What we measure:** completion and errors; whether participants find the list without a Toggle (M3, D1); whether they press the chip's text (m4); whether any choice lands on the wrong option after the chips appear (M1); whether they think they must choose a suggestion in the Autocomplete (m3); whether "Inga resultat" helps them recover; whether screen-reader users hear the count once, and the group names.
- **Result:** `pending`. Assistive-technology testing is also `pending`.

## 10. Open decisions for the maintainer

1. **D1. Open the list on a click in the input?** The Combobox decision says no. **Recommendation:** keep it, and make the Toggle the documented default (M3). A click that only places the caret is right for editing, and the chevron is the visible way in.
2. **D2. Where the chosen values go.** The Listbox decision puts the chips before the input, which moves the input and the open popup on the first choice and every new chip row (B1, M1). **Recommendation:** after the Control, in the DOM and on screen, so the input and the popup never move while choosing. The ticks in the open list show what's chosen meanwhile, and the Tab order becomes input, then remove buttons. The focus rule after a removal is unchanged. Needs an amendment to the Listbox decision. Alternative: keep them before and fix only B1, accepting M1.
3. **D3. Clear with several values.** **Recommendation:** text only. If a "remove all" is wanted later, make it a visible text button ("Ta bort alla val") with its own key, never the × in the box.
4. **D4. The popup edge in dark.** **Recommendation:** the `--kv-popup-edge` alias (§6.4): `border-control` in dark, `border-subtle` elsewhere, with the maintainer's approval and `theme:check` pairs. Alternative: `border-control` in every theme (what the Popover story does today), simpler but heavier in light.
5. **D5. The Popover's default look.** **Recommendation:** level 3, `xl`, 16px padding (12px compact), `body`, at most 20rem wide, and DESIGN.md's Popups line reworded: "list popups (listboxes, menus) 8px padding with 44px items; content popovers 16px padding". Needs the maintainer's approval for the wording.
6. **D6. A Toggle in Autocomplete.** **Recommendation:** not in the default composition or the docs' first example; opt-in for a short, fixed suggestion list, then named "Visa förslag" (`autocomplete.showSuggestions`, proposed).
7. **D7. Group label weight.** **Recommendation:** `label` (500) with the divider line. Alternative: 600, which sets groups apart more strongly but adds a weight use DESIGN.md reserves for `strong` and the current item.
8. **D8. Truncation in the native select.** A closed `<select>` can't wrap. **Recommendation:** accept and document it in `listbox.md`: services with very long option names use `native="never"`.
9. **D9. DESIGN.md wording** (one decision with D4 and D5): add Listbox, Combobox and Autocomplete to Components (the box is `input`'s; Toggle and Clear are full-height marks with no divider because a Control has no Addons; the active option is a bar plus a fill; the chosen one a tick; chips use `sm`), and add `--kv-popup-height-limit` to Theming.

### Further questions

1. Is the 4px gap between the anchor and the popup (`offset = 4`, `use-listbox.ts`, `use-combobox.ts`) meant to be `--kv-space-1`? It matches. Say so in the docs, so a rebrand doesn't have to guess.
2. The popup covers a hint or error under the box while open (`combobox-320.png` shows a fragment of the next line under the popup). It's expected for a dismissible popup, but an error under the box goes out of sight while the user fixes it. Research question for the usability run.
3. On phones, does the placement use the visual viewport, so the on-screen keyboard doesn't hide the lower options of a Combobox? Check on iOS Safari and Android Chrome.
4. Many chosen values (20 or more) push the input far down. Is a count summary ("12 valda") needed for staff tools? Out of scope here.
