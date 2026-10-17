# Design spec: SkipPanel, a skip panel with optional keyboard shortcuts

- **Status:** Approved (maintainer decisions 2026-10-17; 2026-10-18: renamed SkipPanel, no inline variant)
- **Designer:** ux-designer agent · **Date:** 2026-10-18
- **Plan:** `docs/design/plans/0132-skip-panel.md`
- **Type:** component default styling and behaviour (extends `SkipLink`, `packages/react/src/skip-link/`)

## 1. Brief

- **Users:** residents on large portal sites, and staff in daily tools. Hardest case: a resident using a screen magnifier at 400% and the keyboard, on a municipality portal with a long header, who lands on the site once from a search engine. Also: switch users (every Tab stop costs a scan step), screen reader users reading from the top, second-language readers.
- **Job:** "When I arrive on a page, I want to jump straight to the part I need (the content, the search, the navigation), so I don't have to Tab through the whole header first."
- **Context:** first Tab on any page. Keyboard, switch or AT. Often once per visit; staff many times a day. **Constraints:** WAD (EN 301 549 = WCAG 2.2 AA). No storage, so nothing to consent to (GDPR). Must work before hydration (links are native).
- **Success:** time and Tab presses from page load to the main content, search and navigation; no lost focus; no "what is this box" confusion. **Evidence:** none from our users. Prior art only (§2). Everything below on user behaviour is an assumption.
- **Assumptions → research questions:** (1) a visible list of 2–3 targets helps more than its Tab stops cost → do keyboard users on a long-header site reach search faster than with one SkipLink plus Tab? (2) residents ignore the shortcuts, staff use them → does anyone outside staff tools use a shortcut after seeing it? (3) screen reader users accept hearing the panel before the header → is the extra reading on every page tolerated?

### Panel or single SkipLink

- **Use the single `SkipLink`** for an e-service flow, a form or a short header (about 5 Tab stops or fewer before main), with no site-wide shortcuts, when one target is all anyone needs, and **whenever the skip must sit in the flow** and push the page down rather than float: it is the in-flow skip, and the panel has no in-flow variant.
- **Use `SkipPanel`** on a portal with a long header or mega navigation, a search or several landmarks people go to, or in staff tools with real shortcuts (each with a visible equivalent), when two or three targets are each a common first move.

Each panel item is a Tab stop, so a panel with N items costs N−1 extra Tabs for someone who wants the header. **Cap: 3 skip targets, 5 shortcuts, 6 Tab stops in total** (guidance, not enforced).

## 2. Prior art

| Source                                | What we reuse                                                                        | What we change and why                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| amazon.se skip panel                  | A card at top-start on the first Tab, "Skip to" group, shortcut rows with key caps   | Floating card kept; Escape collapses it to the focused item (1.4.13). No arrow keys or hint. Consistent key casing |
| KvirnUI `SkipLink`                    | Clip-until-focus, same-page `#id`, focus the target with `tabindex=-1`               | Many links, grouped, plus an optional shortcuts group                                                              |
| KvirnUI `Kbd` (`kbd.md`), docs search | The key cap look, a nested `kbd` combination, Ctrl/Cmd+K detection, text-entry guard | Key names from i18n per platform                                                                                   |
| WCAG G1 + C7, GOV.UK skip link        | First in the body, hidden until focus, plain words                                   | Several targets; GOV.UK has one                                                                                    |
| APG                                   | No pattern applies. Native links and buttons, native Tab order                       | Not a menu, not a dialog, not a toolbar (no composite, so no arrow keys)                                           |

## 3. Flow

One look, a floating card, with no `variant`: an in-flow skip is the plain `SkipLink`. Order in the body: QuickExit (if any), then SkipPanel, then the header.

1. Tab (after QuickExit) → the panel shows; focus on "Main content" with the ring, in a card at the top inline-start, over the header.
2. Enter on a skip link → focus moves to the target (SkipLink behaviour); the panel hides because focus left Root.
3. Tab → the next item. Tab past the last → the first header stop; the panel hides.
4. Enter (Space on a button) on a shortcut row, or its chord anywhere → the consumer's action runs and must move focus or navigate. Both ways run the same action.
5. Reached by Tab: Escape → `data-collapsed` on Root; only the focused item stays visible, the rest is clipped but focusable. Tab and Shift+Tab show each newly focused item alone. Focus leaving Root resets the collapse.
6. The reopen chord (shown in the Hint only, never a row) → the panel shows and focus moves to the first link. Escape → the panel closes and focus returns to the element that had it.

Unhappy paths:

| Case                                                     | Behaviour                                                                                                                  |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Target id missing or hidden                              | Dev warning, as SkipLink (`skip-link-target-missing:<id>`); point at an always-rendered wrapper                            |
| Chord pressed in a text field, select or contenteditable | Ignored; the character is typed                                                                                            |
| Chord taken first by AT, browser or OS                   | The row still works: every chord has its visible row                                                                       |
| Before hydration or no JS                                | Links work, the panel shows on focus (CSS only). Chords, the reopen chord and Escape do nothing                            |
| `shortcutsEnabled={false}`                               | Chords unbound, key caps and the Hint not rendered, `aria-keyshortcuts` and descriptions removed. Rows stay Tab stops (Q2) |
| Escape after reopen, previous element gone               | Focus goes to the first link's target (main content), never `body`                                                         |
| Touch only; dismissed                                    | Never seen by touch. Hidden when focus leaves, or by Escape after a reopen; nothing stored across pages                    |

## 4. Content

| i18n key                        | en                                    | Notes                                                                                  |
| ------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| `skipPanel.skipToLabel`         | Skip to                               | Group label. Not a heading (see §7)                                                    |
| `skipPanel.mainContent`         | Main content                          | Default label of the first target. `skipLink.label` stays for the single SkipLink      |
| `skipPanel.navigation`          | Site navigation                       | Optional default; any other target is the consumer's text                              |
| `skipPanel.search`              | Search                                | Optional default, for a skip target or a shortcut row                                  |
| `skipPanel.shortcutsLabel`      | Keyboard shortcuts                    | Group label                                                                            |
| `skipPanel.reopenHint`          | Press {keys} to open this list again. | `{keys}` renders as a Kbd combination. Only with a reopen chord and `shortcutsEnabled` |
| `keys.shift`                    | Shift                                 | Shared key names (new namespace; Kbd and the rich text tooltips could reuse it)        |
| `keys.alt` / `keys.option`      | Alt / Option                          | Option on Apple platforms                                                              |
| `keys.control` / `keys.command` | Ctrl / Command                        | Command on Apple platforms. "Ctrl" is what the Windows key cap prints                  |
| `keys.joiner`                   | +                                     | Between keys; a key so a locale can change it                                          |

Shortcut row labels are the consumer's (`Search`, `Basket`…), short verbs or nouns. Length stress: fi "Pikanäppäimet" and "Siirry pääsisältöön"-length labels fit a two-column row at 24rem; at 320px the combo wraps under the label. <!-- kv-lang-ok: Finnish length-stress examples -->

**Platform naming.** Apple (macOS, iPadOS with a keyboard): Option, Command, Control, Shift. Elsewhere: Alt, Ctrl, Shift. Order: Ctrl, Alt, Shift, key elsewhere; Control, Option, Shift, Command, key on Apple (the platforms' own orders). The letter key is a capital, as printed. Words, never ⌥ ⌘ ⇧ symbols (unknown to novices, read inconsistently). `aria-keyshortcuts` uses the spec tokens (`Alt+Shift+S`) and matches the platform. Detection runs in an effect like the docs search; the server renders the non-Apple names.

**The arrow-key hint: restored 2026-10-18 (see §7 note).** Earlier: We have no arrow keys (§7), so the note would describe nothing; a screen reader's browse-mode arrows work without it; and every keyboard user would read it on every page. The Hint shows the reopen chord instead; it is never a row.

## 5. Structure

```
[body]
  [QuickExit row, if any: Tab 1]
  ┌ SkipPanel.Root: fixed at the top inline-start ─────────────────────────┐
  │ Skip to                                     Label                      │
  │ • [Main content]      ← Item > Link, Tab 2, focus ring                 │
  │ • [Site navigation]                                                    │
  │ ─────────────────────────── divider (border-subtle)                    │
  │ Keyboard shortcuts                          Label                      │
  │ • Search .................. [Alt] + [Shift] + [S]   ← Item > Shortcut   │
  │ (i) Press [Alt] + [Shift] + [K] to open this list again.   ← Hint      │
  └────────────────────────────────────────────────────────────────────────┘
  [header: banner] [main] [footer]

Collapsed (after Escape):  ┌ • [Site navigation] ┐  ← the focused Item only
```

| Width / height                                                          | Card                                                                                                                                                                         |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥ 40rem wide and ≥ 36rem high                                           | `position: fixed`, `space-2` from the top and inline-start edges, sized to content, at most the viewport less `space-2` each side                                            |
| < 40rem wide, or < 36rem high (320px, 400% zoom, 200% zoom on a laptop) | `position: absolute` at the document's top, full width less `space-2` each side, so page scroll reaches every item and the card never has its own scrollbar (1.4.10, 2.4.11) |
| Rows below 40rem                                                        | The combo wraps under its label, start-aligned                                                                                                                               |

36rem fits the 6-stop cap with 1.4.12 spacing (theme.css 8d2). Reading order = focus order = DOM order. No headings.

## 6. Visual specification

No new token, colour pair, radius or space. Stacking is a literal z-index (DESIGN.md; Q1 settled).

| Part                 | Tokens / style (DESIGN.md)                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root                 | Level 3 popup: `surface-raised`, 1px `border-subtle`, `--kv-shadow-popup`, `radius-xl`, padding `space-2` (popup rule), literal z-index                          |
| Group label, divider | Label: `label` role (Sans 500, 1rem), `text`, inset to the item text, `space-2` below. Divider: 1px `border-subtle` (decoration only), `space-3` above and below |
| Link (skip item)     | `link`, underlined at rest (as `kv-skip-link`), at least the control height, `space-2` inline padding                                                            |
| Shortcut             | `<button>` in the `kv-button--link` look (acts in place); with `as` a link, styled as Link                                                                       |
| Combo                | `kv-kbd` combination (`kbd.md`), `text`, `nowrap`, never hyphenated; label at start, combo at end, `space-4` gap                                                 |
| Hint                 | `body-small`, `text` (instructions, never `text-muted`), decorative `info` icon, `space-3` above                                                                 |
| Focus                | Token ring (`focus-ring`, width, offset); the `space-2` padding holds the 4px ring and offset inside the card                                                    |

### States

| Part                         | hidden                                                                      | shown (focus inside) | collapsed (Escape)                                           | reopened (chord)               | hover / active                  | focus-visible |
| ---------------------------- | --------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------ | ------------------------------ | ------------------------------- | ------------- |
| Root                         | Clipped (`kv-visually-hidden` rule, never `display:none`), in the a11y tree | Card shown           | `data-collapsed`: the card frame wraps the focused Item only | Card shown, first link focused | –                               | –             |
| Item (Link, Shortcut, combo) | Clipped, focusable                                                          | Shown                | Focused Item shown; others clipped, focusable                | Shown                          | `link-hover`, thicker underline | Token ring    |
| Labels, divider, Hint        | Clipped                                                                     | Shown                | Clipped                                                      | Shown                          | –                               | –             |

No disabled, invalid, loading or selected states: an unavailable target or action is not rendered.

### Modes

- **Dark:** no shadow (`--kv-shadow-popup` is light only); the lighter `surface-raised` and the hairline carry the edge. **Contrast themes:** shadow `none`, underline at rest, the stronger `border-subtle` step.
- **Forced colours:** the shadow is gone, so the 1px border is `CanvasText` on `Canvas` (collapsed too); links and button rows `LinkText`, underlined; kbd edge and divider `CanvasText`; ring `Highlight`.
- **RTL:** top right; columns mirror; logical properties only.
- **Motion:** none, a deliberate exception to the popup fade: the card appears with focus, and a fade would delay the visible focus (2.4.7). **Reflow, zoom, text spacing:** the absolute layout above; no fixed heights, so 1.4.12 spacing grows the card.

## 7. Accessibility annotations

> Changed 2026-10-18 (maintainer, Plan 0132): the panel is one Tab stop. Up/Down/Home/End move between all items (no wrap), and the arrow hint is back as the Hint's first sentence and the first link's `aria-describedby`. Rows below that say arrows are not handled, or that every item is a Tab stop, are superseded; `skip-panel.a11y.md` is the contract.

- **Names:** each Link and Shortcut is named by its visible text (2.5.3). A Shortcut's combo is part of its accessible name, after the label ("Search Alt+Shift+S", nested `Kbd`, no `aria-label`), plus `aria-keyshortcuts="Alt+Shift+S"`; both removed when `shortcutsEnabled` is false.
- **Roles:** Root a `<div>`, no landmark. Each Group `role="group"`, `aria-labelledby` its Label (a `<div>`, not a heading). List `<ul role="list">`, Item `<li>`. Link `<a href="#id">`; Shortcut `<button type="button">`, or a link via `as`. Never `menu`, `toolbar` or `dialog`.
- **Tab stops:** Links (1–3), then Shortcuts (0–5). Tab past the last → the header; Shift+Tab from the first → QuickExit or the browser.
- **2.4.11:** only Root's own items have focus while it shows, so it never covers a focused element; it stacks above sticky layers; the absolute layout keeps the focused item scrollable into view. Collapsed shrinks it to the focused item.

| Key             | Context                                | Action                                                                                        |
| --------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | page or Root                           | Native order; Root shows while focus is inside; collapsed shows only the focused item         |
| Enter           | Link                                   | Focuses the target (`tabindex=-1` added if needed); Root hides                                |
| Enter / Space   | Shortcut button (Enter only on a link) | Runs the action                                                                               |
| A row's chord   | anywhere but text entry                | Runs that row's action (`shortcutsEnabled`)                                                   |
| Reopen chord    | anywhere but text entry                | Shows Root, focuses the first Link, remembers the previous focus                              |
| Escape          | reached by Tab                         | Sets `data-collapsed` (1.4.13 dismissible); focus does not move. Reset when focus leaves Root |
| Escape          | after the reopen chord                 | Closes; focus back to the remembered element (fallback: the main target)                      |
| Arrows          | in Root                                | Not handled (browser and screen reader defaults). No arrow hint                               |

- **Announcements:** none. The collapse is visual only, and focus moves speak for themselves. **Read aloud (draft):** "Skip to, group; link, Main content" … "Keyboard shortcuts, group; button, Search, Alt plus Shift plus S".
- **To verify (`pending`):** chord conflicts: never Ctrl+Alt (AltGr on Nordic layouts), Insert or Caps Lock; Alt+Shift switches input language on Windows; Alt+Shift+letter is Firefox's access key; Chrome takes Alt+Shift+I and T; Option+Shift+letter types characters on macOS (the text-entry guard); VoiceOver owns Control+Option. Match by `event.code` for non-Latin layouts. No chords ship; the docs list these.

## 8. Validation

- [x] Self-review against the review checklist (no open blockers; AT and chord conflicts `pending`). [x] No new colour pair or token. [x] Usability test plan below. Result: `pending`
- **Participants:** 2 screen reader (NVDA, VoiceOver), 2 magnifier at 400%, 1 switch, 2 keyboard-only, 2 low digital confidence, 2 second-language (sv/fi), 2 municipal staff.
- **Tasks:** from load, get to the search; to the main content; to the site navigation. Dismiss the card with Escape and carry on. Staff: use a shortcut, then reopen the panel and go back.
- **Measure:** Tab presses and time to target, errors, whether the panel was noticed and understood, whether it got in the way of reaching the header, preference against one SkipLink.

## 9. Open questions (maintainer)

- Q2. **Group label with `shortcutsEnabled={false}`:** the rows stay but "Keyboard shortcuts" is then wrong. Recommend switching to a new `skipPanel.actionsLabel` ("Quick links").
- Q4. **New shared `keys.*` messages** in all 5 locales, with a native review of the key-cap names ("Shift"/"Skift"/"Vaihto"). <!-- kv-lang-ok: key-cap names in sv and fi -->
- Q5. **Below 40rem the absolute card covers QuickExit's full-width row** while focus is in the panel (Shift ×3 still works, and QuickExit is one Shift+Tab away). Accept, or offset the card below the row.
- Q7. **Story viewports (§10):** the `wide` and `narrow` globals must apply in the `storybook` Vitest project (the site-chrome pattern stories rely on them); if not, `Default` and `Narrow` can't prove which layout (fixed or absolute) they ran in.

## 10. Stories

> Superseded 2026-10-18 by maintainer decision. The stories use one small fixture (the panel, a "Home" link and a short `main`), with no frame (the card is fixed to the window as on a real site), not the MunicipalityPage frame below. The visible-state proofs below still apply.

- `Components/Navigation/SkipPanel`: every story shows the card over a real page, in English. Parameters: `layout: 'fullscreen'`; Docs `story: { inline: false, iframeHeight: 640 }`, so each story has its own frame (a fixed card can't escape into the Docs page, and 640px is past the 36rem fixed layout). Viewports `wide` 1280×800 and `narrow` 320×640 (as `chromeViewports`); default `wide`, so the fixed layout applies.
- **`MunicipalityPage` fixture** (`{ prefix, children }`, the panel passed as `children` and rendered first). Built from `@kvirn-ui/react` parts and theme classes only (`Container`, `Stack`, `Link`, `Field`, `Button`, `kv-heading`): no patterns, no inline style. Ids start with `prefix`.
  - `header` (banner): wordmark link "Lakeside Municipality" (`/`), first and at the top inline-start, where the floating card lands. `nav` "Main" (`#<prefix>-navigation`): Housing and building, Schools, Health and care, Contact us (`#<prefix>-contact`). A `search` form: label "Search the site", input `#<prefix>-search`, button "Search".
  - `main` `#<prefix>-main`: h1 "Apply for a building permit". "You need a building permit to build a new house, extend one or change how a building is used. A decision usually takes 4 to 8 weeks." Links "Check what you need before you apply", "Start your application".
  - `footer`: "Lakeside Municipality, Town Hall, 1 Harbour Street". Links "Accessibility statement", "Privacy".
- **`PanelFixture`** (`{ prefix, withShortcuts, ...rootProps }`; not named `SkipPanel`, which is the component): Skip to: Main content, Site navigation. Shortcuts (`withShortcuts`): "Search" Alt+Shift+S (focuses the search input), "Contact us" Alt+Shift+C (focuses the nav link). `SkipPanel.Hint` last. `reopenShortcut` is Alt+Shift+K where listed. Plays query rows `within(panel)`, since the header also has a "Search" button. `keepFrameStill` stays where a play presses Enter on a link.
- **Visible-state helpers** (a reviewer requires them; they assert WCAG thresholds, never theme values, AGENTS.md rule 13): `expectHidden(el)`: box ≤ 1×1px. `expectShown(el)`: box ≥ 24×24px (2.5.8) and `elementFromPoint` at its centre is inside it, scrolled into view (2.4.7, 2.4.11). `expectUncovered(el)`: the same `elementFromPoint` check. "Tab-out" below means: the panel `expectHidden`, the newly focused element `expectUncovered` (the wordmark, at its centre).

| Story               | Shows                                                                                                                                        | Fixture                                       | Play proves                                                                                                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Default`           | The floating card over the header's wordmark                                                                                                 | links only                                    | Before Tab: panel hidden. Tab: Main content focused and shown. Tab ×2: wordmark focused; Tab-out                                                                                                                  |
| `WithShortcuts`     | Shortcut rows with key caps and the reopen hint                                                                                              | shortcuts, reopen                             | Row and chord run one action: Tab ×3 to the Search row, Enter: the search input focused, panel hidden, input `expectUncovered`. Then focus the wordmark; Alt+Shift+S: the input focused again, panel still hidden |
| `Reopened`          | The reopen chord and Escape returning focus                                                                                                  | shortcuts, reopen                             | From the wordmark, Alt+Shift+K: Main content focused and shown, `data-reopened`. Escape: wordmark focused; Tab-out                                                                                                |
| `Collapsed`         | Escape shrinking the card to the focused row                                                                                                 | shortcuts, reopen                             | Tab ×2, Escape: `data-collapsed`; Site navigation shown; the Main content item, both labels and the hint hidden. Tab: Search row shown alone, Site navigation hidden. Tab ×2: no `data-collapsed`; Tab-out        |
| `Narrow`            | The card at 320px: absolute at the top of the document, full width less the margins, combos under their labels                               | shortcuts, reopen; `narrow` viewport          | Tab: shown; the panel's top is above the banner's bottom (document coordinates) and `expectNoHorizontalOverflow` (1.4.10). Tab ×3: each row `expectShown`, so page scroll reaches every item. Tab: Tab-out        |
| `ShortcutsDisabled` | Plain rows, no key caps, no hint                                                                                                             | shortcuts, reopen, `shortcutsEnabled={false}` | No `.kv-kbd`, no `aria-keyshortcuts`, no hint. From the wordmark, Alt+Shift+S and Alt+Shift+K leave focus on it and the panel hidden. The Search row still runs on Enter                                          |
| `Keyboard`          | Every key, one per line in the description: Tab, Shift+Tab, Enter, Space, Alt+Shift+S and C, Escape (collapse), Alt+Shift+K, Escape (return) | shortcuts, reopen                             | Enter on Main content: `main` focused, panel hidden, the h1 `expectUncovered`. Reopen and Escape rows are by hand here, proved in `Reopened` and `Collapsed`                                                      |
| `RTL`               | The card at the top right, key caps at the left end of rows                                                                                  | shortcuts, reopen; `dir: 'rtl'`               | Tab: shown; the panel's centre is in the right half of the viewport; in the Search row the key caps' centre is left of the row's centre. Tab ×4: Tab-out                                                          |
| `ForcedColors`      | `Canvas`, `CanvasText` edges, `LinkText` rows, `Highlight` ring                                                                              | shortcuts, reopen; `forcedColors: 'active'`   | The visible-state cycle under forced colours (shown on Tab, Tab-out). Colours are checked by eye in `storybook-forced-colors`, never by computed style                                                            |
