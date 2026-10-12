# Design spec: Accessibility settings page (docs site)

- **Status:** Approved · **Designer:** ux-designer agent · **Date:** 2026-10-12
- **Plan:** [0107](../plans/0107-accessibility-settings-page.md) · **Type:** docs page + site chrome change (apps/docs only)
- **Amends:** [docs-header-bands.md](docs-header-bands.md) §7 Tab order (:148-149) and [docs-shell-mega-menu.md](docs-shell-mega-menu.md) §7 Tab order (:168-170): "Display settings" becomes the "Accessibility settings" link, and the second skip link is added. Those lines change when this is approved.
- **Includes:** the accessibility reviewer's advice (P1–P3). Where it and this design differ, §9 records the decision.

## 1. Brief

- **Users:** developers, designers and testers in municipalities and agencies who read the docs, some of them using AT themselves. Hardest case: a low-vision developer with photophobia on a shared work PC where they can't change the OS settings, zoomed to 300%, using a keyboard, reading in their second language.
- **Job:** "When the site is too bright, too small or hard to get around, I want one place that fixes it and tells me how, so I can keep reading."
- **Context:** set once and kept (localStorage). Visited again rarely: to change it back, or to look up a key.
- **Constraints:** no package changes ("don't touch the original components"). Compose from `DisplaySettings.Panel`, `SkipLink`, `Kbd`, `Table`, `Accordion`, `Card`, `Link` and `PageWithContents`. No telemetry, no third-party calls. Never claim compliance (`regulations` skill).
- **Success:** a first-time visitor makes the site dark in under 30 s from any page; nobody mistakes the page for an accessibility statement; zero questions on "what does Same as my device mean".
- **Evidence:** none. Assumptions:
  - Users find a top-bar link called "Accessibility settings" as fast as the old icon button → RQ: time on "Make the site dark" (§8), compared with the docs-header-bands.md §8 task.
  - "Accessibility" alone reads as the accessibility statement to Nordic users (reviewer P1.3) → RQ: first-click test, link text vs expectation.

**Out of scope (P3):** an overlay or widget, floating icon, dyslexia font, colour inversion, cursor enlarger, AT detection, an "accessibility mode", an in-page text-size control, and font-size or density settings (DisplaySettings has none).

## 2. Prior art

| Source                                                                                                                           | Reuse                                                       | Change and why                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `DisplaySettings.Panel` (Plan 0099)                                                                                              | The three fieldsets, native radios, the forced-colours note | Our notes passed as children. No container of its own, so it goes in a Card              |
| `SkipLink` (Plan 0054)                                                                                                           | Clipped until focused, in flow, focus moves to the target   | A second instance with a docs label (children from apps/docs messages)                   |
| [BBC Accessibility help](https://www.bbc.co.uk/accessibility/), [AbilityNet My Computer My Way](https://mcmw.abilitynet.org.uk/) | Explain browser and device settings in plain steps          | Four devices only, in an Accordion, linking out for the rest                             |
| [GOV.UK skip link](https://design-system.service.gov.uk/components/skip-link/)                                                   | First Tab stop, goes to main                                | We add a second link: the user asked for it, and the header has 4+ stops before the menu |
| [WCAG 2.1.4 Understanding](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html), keyboard skill rule 7      | No single-key shortcuts                                     | Only a modifier chord (Ctrl/Cmd+K, Q4); we document the keys that already work           |

## 3. Flow

1. Any page → Tab or point to **Accessibility settings** (top bar, Tools nav; also the footer's Project list) → the page, focus on `h1` (existing `useRouteFocus`).
2. Display first: pick a radio → the whole page changes at once (the page is the preview). Nothing is announced, focus stays.
3. Read on, or jump with "On this page".

| Unhappy path                   | What happens                                                                                                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript off                 | Light, standard theme (commit 1205fd8). The Panel is hidden; a note says the choices need JavaScript and points to §Zoom and §Device settings. Link works (unlike the old popover) |
| Forced colours on              | The Panel shows its own forced-colours note; our Display intro says contrast themes replace these choices                                                                          |
| localStorage blocked / private | Choices apply until the tab closes. The storage note covers it ("in this browser only")                                                                                            |
| Can't change OS settings       | Light/Dark/High on this page work without the OS; that is why the page exists                                                                                                      |
| Something doesn't work         | §Report a problem                                                                                                                                                                  |
| Deep link `#display` etc.      | Browser jump to the `h2`                                                                                                                                                           |

## 4. Content

The docs catalog is en-only (`apps/docs/messages/en.ts`). sv and fi are given for labels where length matters; nb "Tilgjengelighetsinnstillinger" (29 chars) is the longest and must hyphenate in the top bar. Device menu names, when translated, use each OS's own localised names.

| Key (`docs.*`)                                     | en                                                                                                                                                                                                                           | sv / fi                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `header.accessibilitySettings`                     | Accessibility settings (top-bar link, footer link and `h1`)                                                                                                                                                                  | Tillgänglighetsinställningar / Saavutettavuusasetukset            |
| `meta.title({ page })`                             | Accessibility settings – KvirnUI (existing helper)                                                                                                                                                                           | –                                                                 |
| `skipLinks.navigation`                             | Skip to site navigation (§7, option A)                                                                                                                                                                                       | Hoppa till webbplatsens navigering / Siirry sivuston navigaatioon |
| `accessibility.lead`                               | Choose how this site looks, and find the keys and browser settings that make it easier to read and use.                                                                                                                      |                                                                   |
| `accessibility.display.heading`                    | Display                                                                                                                                                                                                                      | Visning / Näyttö                                                  |
| `accessibility.display.intro`                      | Your choice changes this page straight away, so you can see it before you go on.                                                                                                                                             |                                                                   |
| `accessibility.display.system`                     | **Same as my device** follows the setting on your phone or computer, and changes when it does. Where to find it: Settings on your device.                                                                                    | link text = `device.heading`                                      |
| `accessibility.display.contrast`                   | **High** contrast makes text, borders and focus rings stronger.                                                                                                                                                              |                                                                   |
| `accessibility.display.motion`                     | **Less motion** turns off animations and moving transitions on this site.                                                                                                                                                    |                                                                   |
| `accessibility.display.contrastThemes`             | If you use a contrast theme in Windows, your device's colours replace the choices here.                                                                                                                                      |                                                                   |
| `display.storageNote` (exists)                     | We save your choice in this browser only. We don't use cookies or send it anywhere.                                                                                                                                          |                                                                   |
| `accessibility.display.noScript`                   | These choices need JavaScript, which is off in your browser. The site is shown light, with standard contrast. You can still zoom, and a Windows contrast theme replaces the site's colours: see Zoom and text size (linked). |                                                                   |
| `accessibility.keyboard.heading`                   | Keyboard                                                                                                                                                                                                                     | Tangentbord / Näppäimistö                                         |
| `accessibility.keyboard.intro`                     | You can use the whole site with a keyboard. These keys work on every page.                                                                                                                                                   |                                                                   |
| `accessibility.keyboard.rows.*`                    | Tab rows, see §6 Keyboard table                                                                                                                                                                                              |                                                                   |
| `accessibility.keyboard.noShortcuts`               | This site has no single-key shortcuts, so typing, speech input and screen reader keys never set anything off by accident.                                                                                                    |                                                                   |
| `accessibility.keyboard.components`                | Each component page has a Keyboard section with every key that component uses. Start at Components.                                                                                                                          | link → `/components`                                              |
| `accessibility.skip.heading`                       | Skip links                                                                                                                                                                                                                   | Snabblänkar / Ohituslinkit                                        |
| `accessibility.skip.body`                          | Press Tab once when a page opens. A link appears at the top: Skip to main content. Press Tab again for Skip to site navigation. Press Enter to jump.                                                                         |                                                                   |
| `accessibility.zoom.heading`                       | Zoom and text size                                                                                                                                                                                                           | Zoom och textstorlek / Zoomaus ja tekstin koko                    |
| `accessibility.zoom.intro`                         | Your browser can make every page bigger. The content moves into fewer columns as you zoom in. If you have to scroll sideways to read a sentence, or something is cut off, please tell us.                                    | no "works at 400%" promise (sweep not gated, Plan 0051)           |
| `accessibility.zoom.page` / `.textOnly` / `.touch` | h3s: Zoom the whole page · Make only the text bigger · On a phone or tablet                                                                                                                                                  |                                                                   |
| `accessibility.zoom.usKeyboard`                    | On a US keyboard, use the = key for +.                                                                                                                                                                                       |                                                                   |
| `accessibility.zoom.wheel`                         | You can also hold Ctrl (Command on a Mac) and turn the mouse wheel, or pinch on a trackpad.                                                                                                                                  |                                                                   |
| `accessibility.zoom.firefox`                       | Firefox: open **View**, then **Zoom**, then turn on **Zoom Text Only**. Press Alt to show the menu on Windows.                                                                                                               |                                                                   |
| `accessibility.zoom.defaultSize`                   | Every browser: change the default font size in its settings, under **Appearance** or **Fonts**. This site follows it.                                                                                                        | engineer to verify the theme sizes text in rem                    |
| `accessibility.zoom.safari`                        | Safari on a Mac: Option, Command and + makes only the text bigger.                                                                                                                                                           |                                                                   |
| `accessibility.zoom.ios`                           | iPhone and iPad: in Safari, tap the page menu (**aA**) beside the address, then the bigger A. For every app: **Settings**, then **Accessibility**, then **Display & Text Size**.                                             |                                                                   |
| `accessibility.zoom.android`                       | Android: pinch with two fingers, or open **Settings**, then **Accessibility**, then **Font size**. Names differ between phone makers.                                                                                        |                                                                   |
| `accessibility.device.heading`                     | Settings on your device                                                                                                                                                                                                      | Inställningar på din enhet / Laitteesi asetukset                  |
| `accessibility.device.intro`                       | Change these once and every site that follows your device changes too. Menu names change between versions: if you can't find one, search your settings for "dark", "contrast" or "animation".                                |                                                                   |
| `accessibility.device.{windows,mac,ios,android}`   | Accordion items (h3): Windows · Mac · iPhone and iPad · Android. Each: dark mode, contrast, less motion, text size, as "Open **Settings**, then **Accessibility**, then **Contrast themes**."                                | no version numbers                                                |
| `accessibility.report.heading`                     | Report a problem                                                                                                                                                                                                             | Rapportera ett problem / Ilmoita ongelmasta                       |
| `accessibility.report.body`                        | KvirnUI is designed and tested to meet WCAG 2.2 AA. Testing by people with assistive technology is still pending, so you may find problems. See the project status.                                                          | link → `/docs#status` (evidence and known issues)                 |
| `accessibility.report.action`                      | Report a problem on GitHub · then: GitHub issues are public, so don't include personal information.                                                                                                                          | same tab, no new-tab notice                                       |
| `accessibility.report.email`                       | No GitHub account, or want to write privately? Email support@kvirn.com (Q5).                                                                                                                                                 | `mailto:` link, address as its visible text                       |

Menu paths are written with "then", never "›": screen readers read "›" as a symbol, and words survive translation and RTL. Menu names are `<strong>`.

## 5. Structure

Route `/accessibility-settings` (Q3), layout `article`, built with `PageWithContents`: no section, so no breadcrumb, sidebar or pager (like `/search`). Add it to the search index.

```
[skip: Skip to main content] [skip: Skip to site navigation]        ← every page, site-shell.tsx, before the header
[banner] TopBar: Latest · nav "Tools" › Accessibility settings (aria-current=page here) │ Masthead …
[main #main]
  PageHeader: h1 Accessibility settings · lead
  nav "On this page" (existing contents)
  h2 Display        → Card › [noscript note] DisplaySettings.Panel › children: system · contrast · motion · contrastThemes · storageNote
  h2 Keyboard       → intro · table "Keys that work on every page" · noShortcuts · components link
  h2 Skip links     → body
  h2 Zoom and text size → intro · h3 page (table + usKeyboard + wheel) · h3 text only (firefox, safari, defaultSize) · h3 touch (ios, android)
  h2 Settings on your device → intro · Accordion (4 items, h3 triggers)
  h2 Report a problem → body · link · privacy note
[contentinfo] … nav "Project" › Status · GitHub · Accessibility settings
```

| Width  | Layout                                                                                                                                                                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320px  | One column. Contents nav is inline before the article. Display h2 and at least the Colour scheme fieldset are within the first 800px at 100% zoom (reviewer P1.4). Tables in `Table.ScrollRegion` (2D-scroll exception, 1.4.10). Top bar wraps; the link may hyphenate |
| 40rem  | Same column; Panel fieldsets as the theme lays them out                                                                                                                                                                                                                |
| 64rem+ | Prose measure; contents column from 80rem (existing)                                                                                                                                                                                                                   |

## 6. Visual specification

No new tokens, colours or pairs. Everything is an existing class.

| Part                     | Style (DESIGN.md)                                                                                                                                                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top-bar link             | Bar item in the Tools nav (Site chrome patterns › top bar): `on-primary`, underline on hover, ≥24px tall; current = weight 600 + straight `on-primary` bar. **No icon**: the built-in set has no accessibility glyph, and text is the name          |
| Skip links               | `kv-skip-link` ×2 (Skip link rule): each clipped until focused, then in flow; never both shown at once                                                                                                                                              |
| Display Card             | `Card`, level 2, default padding; holds the Panel; its notes are `body` text, never `body-small`, because they are essential                                                                                                                        |
| Keyboard and zoom tables | `kv-table` inside Prose; keys as `Kbd`, a combination nested (`<Kbd><Kbd>Ctrl</Kbd> and <Kbd>+</Kbd></Kbd>`) with the word "and" from i18n (`accessibility.keys.and`) instead of "+", because "Ctrl + +" is ambiguous to eyes and to screen readers |
| Device settings          | `kv-accordion`, h3 triggers                                                                                                                                                                                                                         |
| Report link              | Plain `Link` (not the service link: it isn't an e-service)                                                                                                                                                                                          |
| No-JS note               | `kv-alert kv-alert--info` (as the site's existing `noScript` note), inside the Card in place of the Panel                                                                                                                                           |

**Keyboard table** (Key · What it does), rows in this order: Tab / Shift and Tab — next / previous link, button or field · Enter — follow a link, press a button · Space — press a button, choose an option; scroll down elsewhere · Arrow keys — move and choose in a group of options such as Display; scroll elsewhere · Enter or Space on Menu and "Pages in Get started" — open and close (they open in the page) · Escape — close an open menu topic and go back to its button · Ctrl and F (Command and F) — find on this page · Ctrl and L (Command and L) — go to the address bar. Key names come from i18n (`accessibility.keys.*`: Ctrl, Command, Option, Shift, Tab, Enter, Space, Escape, arrows) because macOS sv says "Kommando".

**Zoom table** (Action · Windows, Linux and ChromeOS · Mac): Zoom in — Ctrl and + · Command and + / Zoom out — Ctrl and − · Command and − / Back to 100% — Ctrl and 0 · Command and 0. Both OS columns always shown: no OS detection, works without JS, and helpers explaining it to someone else see both.

### States

| Part         | default           | hover     | focus-visible                 | current / selected                      | open       | no JS                               |
| ------------ | ----------------- | --------- | ----------------------------- | --------------------------------------- | ---------- | ----------------------------------- |
| Top-bar link | `on-primary` text | underline | on-primary ring (header rule) | weight 600 + bar, `aria-current="page"` | –          | works (plain link)                  |
| Skip link    | clipped           | underline | visible, token ring           | –                                       | –          | works (native jump)                 |
| Panel radios | existing contract | existing  | existing                      | checked radio                           | –          | hidden; note instead                |
| Accordion    | existing          | existing  | existing                      | –                                       | chevron up | engineer to confirm SSR open/closed |

### Modes

- **Dark, contrast themes:** existing tokens; switching on this page re-themes it live.
- **Forced colours:** Panel's own note appears; Card keeps its border (`CanvasText`); Kbd and table rules existing; current top-bar item keeps its bar (`LinkText`).
- **RTL:** logical properties throughout; key combinations keep Latin order (Kbd open question stands); paths in words, so no arrow glyph flips.
- **Motion:** none added. **Reduced motion:** n/a.
- **320px / zoom / 1.4.12:** single column, no fixed heights, tables scroll in their region only. Engineer checks the viewport meta has no `maximum-scale` or `user-scalable=no`.

## 7. Accessibility annotations

- **Skip links** (site-shell.tsx, before `SiteHeader.Root`, every page; reviewer P1.1): 1. "Skip to main content" → `#main` (unchanged). 2. Second link, **option A (recommended):** "Skip to site navigation" → an always-rendered element that holds the Menu button and the Site nav (visible at every width; a hidden target does nothing on `focus()`). ≥64rem the next Tab is the first topic; <64rem it is Menu. Engineer confirms `SiteHeader.Menu` forwards `id`, else an apps/docs wrapper that doesn't change the masthead layout. **Option B (reviewer):** "Skip to section navigation" → a wrapper around `DocsDisclosure` + `SiteNavigation` (site-shell.tsx:74-87), rendered only when `sidebarSection` exists (Get started only). See Q2.
- **Entry link:** a `<a>` in the Tools nav, visible text = name (2.5.3), same text and place on every page (3.2.3, 3.2.4, 3.2.6), `aria-current="page"` on this page only, ≥24×24 (2.5.8). Footer Project list: same text and target. One `aria-current` per nav.
- **Landmarks:** unchanged; no new `nav`. Each h2 section is plain headings in the article (no extra regions). The Display Card is a `<section aria-labelledby>` its h2 (reviewer P2.6) only if `PageWithContents` allows; otherwise the h2 alone (no unnamed region).
- **Headings:** h1 → h2 ×6 → h3 (zoom subsections, accordion triggers). Panel uses fieldset/legend, no headings.
- **Tab order (≥64rem, JS on):** skip main → skip nav → Latest → Accessibility settings → KvirnUI → topics → search → Search → contents links → Colour scheme (1 stop) → Contrast (1) → Motion (1) → "Settings on your device" link → Components link → table scroll regions (only while they overflow) → 4 accordion triggers → Project status → Report a problem on GitHub → footer. <64rem: Menu replaces the topics.
- **Keys:** links Enter; radios native arrows (wrap, flip in RTL); Accordion: Enter/Space. Plus, by the Q4 revision, Ctrl+K (Cmd+K on Apple) to the search box (`aria-keyshortcuts` on the search input).
- **Focus moves:** route change → h1 (existing). Choosing a radio: focus stays, nothing announced (DisplaySettings contract; accessibility skill §9). No toast, no live region.
- **SCs of note:** 1.3.1, 1.4.1, 1.4.4, 1.4.10, 2.1.1, 2.1.4 (no single-key shortcuts), 2.4.1, 2.4.3, 2.4.4/2.4.6 (skip link names its target), 2.4.11, 2.5.3, 2.5.8, 3.2.3, 3.2.4, 3.2.6.

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blockers (no colour-only state, text names, no hover-only, every string keyed, no claim, unhappy paths covered).
- [x] Contrast: no new pair.
- [ ] Usability test plan. Result: `pending`.

**Test plan (`pending`):** 6 participants: 2 keyboard-only (1 at 300% zoom), 1 NVDA, 1 VoiceOver iOS, 1 photophobic user on a locked-down PC, 1 second-language reader (fi). Tasks: (1) From a component page, make the site dark (compare with docs-header-bands.md §8). (2) Make the text bigger without changing the layout. (3) From the top of a page, get to the site menu without the mouse. (4) Where would you report that a page doesn't work at your zoom level? Measure: time to dark, first click (statement vs settings), wrong turns in the device accordion, use of "Same as my device".

## 9. Decisions (maintainer, 2026-10-12)

| #   | Decision                                 | Chosen                                                                                                                                            |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Replace the top-bar dropdown, or keep it | **Link only.** Display goes first on the page, above the fold at 320px; rerun test task 1. Reviewer's option B (keep Compact) recorded, not taken |
| Q2  | Second skip link target                  | **Site navigation, every page** ("Skip to site navigation")                                                                                       |
| Q3  | Route slug                               | `/accessibility-settings` (default; keeps `/accessibility` free for a statement)                                                                  |
| Q4  | Shortcuts                                | **Revised 2026-10-12:** Ctrl/Cmd+K focuses the search box (modifier chord, 2.1.4 n/a); access keys tried and removed; no single-key shortcuts     |
| Q5  | Feedback channel                         | **GitHub and email:** support@kvirn.com                                                                                                           |
| Q6  | DESIGN.md top-bar example                | Update the wording with this change (no token)                                                                                                    |
| Q7  | Optional extras                          | (c) AbilityNet link yes; (a) Screen readers section later; (b) no                                                                                 |
| Q8  | Translate the new keys now               | en-only, as docs-site.md §4                                                                                                                       |
