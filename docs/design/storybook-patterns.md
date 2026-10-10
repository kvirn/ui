# Design spec: Storybook Patterns and Content types, the shell of the reference site

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-09
- **Plan:** [0095](../plans/0095-storybook-patterns-and-content-types.md) (T0). Builds on [municipality-reference-site.md](municipality-reference-site.md) (inventory, T1–T6, B1–B29), [docs-site.md](docs-site.md), [docs-landing-and-header.md](docs-landing-and-header.md), [docs-component-page.md](docs-component-page.md)
- **Type:** blocks, page templates and a fixture world. Neutral on the code home (plan D2): "the pattern" means the composition, wherever it lives.

> **Composition rule (maintainer, 2026-10-10; Plan 0095 D9). It overrides every "props" and "fixture object" reading in this spec.** A pattern is a compound component that wraps shipped components into a feature. Its parts are children: `SiteHeader.Root` > `.Topbar` (`.Brand`, `.Service`, language links, utility links), `.Search`, `.Menu` > main menu > topics > links. Text and links are JSX children, not data props; props are for behaviour and state; DOM order is children order. Where this spec lists "props" for a pattern, read "parts and children". Fixed strings the pattern renders (names of landmarks, "Meny") stay in `@kvirn-ui/i18n`. The Kvirnby example is literal JSX in the stories.
>
> **Amended 2026-10-10 (D10).** Example text is English ("Kvirnby municipality"); every Swedish copy line in this spec is a draft of the municipality's own content, not a library string. Patterns hold no text: visible text is a child, a landmark or control name is a `label` prop, and §9 "Strings the patterns render themselves" is void except what the shipped parts own. Tests only for behaviour a pattern adds.

## 1. Brief

- **Users.** Residents of a municipality site (the docs app later renders these as Kvirnby kommun); integrators and evaluators judging KvirnUI in Storybook. **Hardest case:** a resident on a 320px phone, Swedish as a second language, looking for one task (a preschool place) under time pressure, with a screen reader or 400% zoom; and an evaluator tabbing the header to see whether the mega menu is a real APG pattern.
- **Job.** "When I land on the municipality's site, I want to reach my task or a human in one or two steps, so I can get it done and leave." Evaluator: "When I open a pattern, I want to see every state and which parts it uses, so I can copy it."
- **Context.** Residents: once a year, mobile first, often stressed. Staff and integrators: daily, desktop.
- **Constraints.** No third-party request (rule 7: no maps, embeds, share widgets, fonts, analytics); no compliance claim (rule 8, "designed and tested to meet WCAG 2.2 AA"); WAD footer links on every page; GDPR (Kvirnby sets no cookies, so consent is story-only, reference §10 Q9).
- **Success.** Every content type: one `banner`, `main`, `contentinfo`, one `h1`, named navs, 0 axe violations in four themes, no sideways scroll at 320px; a first-time resident finds "Ansök om förskoleplats" from the start page in ≤ 2 activations (`pending`).
- **Evidence.** The kommunwebb survey (25 Swedish municipalities, ~150 pages each, heuristic classification of `<main>` blocks; `tiers.csv`, `composition.csv`, read 2026-10-09). A sample, not a crawl (plan D5). Header and footer features are counted per site, blocks per page.
- **Assumptions → research questions** (`pending`): residents use top tasks before the mega menu → do they? · a click-only mega menu is not slower for mouse users than hover → measure · the start page hero does not push top tasks out of first view at 320 × 640 → check.

## 2. Prior art (cited for this spec only; never named or compared in site copy)

| Source                                                                                                                      | Reused                                                                                                                                                | Changed and why                                                    |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| APG Disclosure Navigation example (w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation, read 2026-10-09) | Buttons toggle link lists; Tab moves through buttons and open lists; Escape closes and returns focus; focus leaving the nav closes; not `role="menu"` | Optional arrows, Home, End not adopted (§5.2)                      |
| `Disclosure`, `Navigation`, `Breadcrumb`, `Alert`, `Card`, `Columns`, `SidebarLayout`, `ReadAloud`, `CopyButton` (shipped)  | All behaviour; no new part                                                                                                                            | Compositions only (plan non-goal)                                  |
| Docs shell (`apps/docs/components/site-shell.tsx`)                                                                          | Menu disclosure below 64rem, panel shown by CSS from 64rem, menu closes on navigation                                                                 | The docs' own disclosure wrapper is replaced by `Disclosure`       |
| Docs hero (`apps/docs/components/home/hero.tsx`)                                                                            | Band, display `h1`, lead, service link + one link                                                                                                     | No kicker before `h1`, no viewport min-height, no raw sizes (§6.1) |
| Reference Storybook (opti-react, internal)                                                                                  | Fixed fixture clock; topic sub-links feed the mega menu; chrome as one frame around a page                                                            | Not copied: different parts, different names                       |
| GOV.UK header and service navigation; Designsystemet header                                                                 | "Meny" with the word visible; header pushed down, not covered                                                                                         | –                                                                  |

## 3. Information architecture

Top level (plan D1): Foundation · Components · Patterns · Content types. Pattern titles: `Patterns/<Group>/<Name>`. One-line jobs; survey coverage in brackets (sites of 25).

| Group                        | Pattern: job                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Site chrome**              | Site header [24]: who runs the site, help, language, search, topics · Mega menu [15] (header variant): every topic's sub-pages one press away · Transaction header: identity and help during a form, nothing to wander off to · Site footer [25]: contact, statement, feedback, privacy on every page · Language links [25]: the same page in another language **or format** (Lättläst [14], Teckenspråk [10]) · Site alert [15]: one disruption, on every page · Cookie consent [25, story only]: an equal yes or no · Page tools: listen (read aloud [23]) at the top; last updated [24], copy link (share [24]) and print [21] at the end |
| **Navigation and promotion** | Hero [19]: the page's title and one next step · Top tasks: the six most-done tasks in one list · Nav tiles [24]: choose a sub-topic · Teaser [24]: promote one page · Card grid [16]: several teasers with pictures · Link list [24]: a short set of related links under a heading · Service link [25]: start one e-service · Related links [22]: where to go next · Breadcrumb and section nav [25, 11]: where am I, go up or sideways                                                                                                                                                                                                      |
| Content and media            | Preamble [24] · Fact box [12] · FAQ [24] · Table [21] · Contents [21] · Figure [24] · Document list [18] · Video [15] (native only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| News, events and notices     | News list [23] · Event list [16] · Notice [13] · Subscribe [25]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Search and forms             | Search box [19; header search 22] · Search results [18] · Filter [23] · Pagination [16] · Form with error summary [21] · Login entry [24] · Page feedback [5]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Places and contacts          | Contact card [24] · Opening hours [20] · Address and visit [19] · Unit finder [17]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

**Proposed changes to the plan's table** (survey-led; the orchestrator decides):

1. **Page tools gains page meta** ("Senast uppdaterad"): `last_updated` is on 24 sites and the survey's `page_meta` block groups last-updated, share and print (34 % of content pages).
2. **Language links include Lättläst and Teckenspråk** links when the site has them (14, 10 sites): residents who need them look in the same row.
3. **The header's search is part of Site header in S1** (Q12: always visible at 320px). Search box (later) reuses it; until then it's a local composition naming the Search block gap.
4. **E-services and report-a-fault are chrome, not patterns:** "E-tjänster" in the header (25), "Felanmälan" in the footer and top tasks (25).
5. **Pull Contact card forward into T3** (or build it inside T4): the content page has it on 37 % of pages, the subpage on 26 %.

## 4. The page frame (every content type)

DOM order = reading order = focus order at every width. Nothing sticky (2.4.11). No CSS `order` (1.3.2). `lang` on the page root is the fixture's language.

```
SkipLink "Hoppa till huvudinnehållet" → #main
[header: banner]       Site header (or Transaction header)
[section: region "<alert title>"]   Site alert, when on
[nav "Du är här"]      Breadcrumb, not on the start page
SidebarLayout.Root     (content page and documentation page only)
  .Sidebar as nav      section nav, behind "I det här avsnittet" below 64rem
  .Content as main#main
[main#main]            (other types: Container as main)
[footer: contentinfo]  Site footer
```

| Width | Frame                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------- |
| 320px | One column; `Container` padding `space-4`; header in rows (§5.1); sidebar stacks above `main`, collapsed |
| 40rem | Padding `space-6`; columns of tiles become 2                                                             |
| 64rem | Header: nav row shown, Meny gone; sidebar beside `main` (`sm` 16rem); 3 tile columns                     |
| 80rem | Container stops at `80rem`, centred; prose stays at `45rem` (`Container size="reading"`)                 |

Storybook: content types are `layout: 'fullscreen'`, wrapped by a `KvirnProvider` that sets the locale to the fixture's (§8.1).

## 5. Site chrome (slice T2)

### 5.1 Site header

Parts: `SkipLink`, `Section as="header"` (`kv-section--canvas`, padding `sm`), `Container`, `Link` (brand, `current`), `Navigation.Root/List/Item` (three navs), `Disclosure.Root/Trigger/Panel`, `Field.Root/Label`, `TextInput`, `Button`, `VisuallyHidden`, `Icon` (`search`). **Gaps:** Site header block (G9); Search block (`<search>` composition); brand link look (reference §4 B2).

| #   | Region (DOM order)                          | Content                                                                                                                     | Name                 |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | Notice row (reference pages only, optional) | `reference.notice` + two links                                                                                              | – (text in `banner`) |
| 2   | Brand                                       | `Link href="/"`: inline SVG mark (`alt=""`) + "Kvirnby kommun" as text                                                      | the text             |
| 3   | Language links (§5.4)                       | Svenska · English · Lättläst · Teckenspråk                                                                                  | nav "Språk"          |
| 4   | Utility links                               | Kontakta oss · E-tjänster · Mina sidor (same order on every page, 3.2.6)                                                    | nav "Genvägar"       |
| 5   | Search                                      | `<search>`: label "Sök på webbplatsen" (visually hidden), `TextInput type="search"`, `Button` "Sök" (word, never icon-only) | landmark `search`    |
| 6   | Meny trigger                                | `Disclosure.Trigger` "Meny" (word + chevron); hidden from 64rem by `display: none`                                          | its text             |
| 7   | Main nav, in the Meny panel                 | plain links (default) or the mega menu (§5.2), up to 7 topics                                                               | nav "Huvudmeny"      |

| Width | Layout                                                                                                                                                                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320px | Row 1: brand, then language links wrapping after it. Row 2: utility links (wrap). Row 3: search, full width, button beside the field (wraps under it at 1.4.12). Row 4: "Meny", full-width quiet row. Panel in flow below, pushing `main` down |
| 40rem | Rows 1 and 2 join where they fit; search max `form` width (40rem)                                                                                                                                                                              |
| 64rem | Row 1: brand at start; language then utility links clustered at the inline end. Row 2: search at start. Row 3: the main nav row (horizontal, wraps). Compact chrome allowed (`kv-compact`, 32px), per DESIGN.md Density                        |
| 80rem | Same, inside the `80rem` container                                                                                                                                                                                                             |

**States (stories):** Default · MenuOpen (320) · CurrentSection (topic trail) · English · WithNotice · MegaMenu (§5.2) · Transaction · LongFinnishLabels (fi brand and labels for length) · ForcedColors · RTL.

**Transaction header** (T4 pages): rows 1–3 only, with the service name as text after the brand ("Parkeringstillstånd"), language links and "Kontakta oss"; no search, no main nav, no Meny.

**Annotations.** Tab stops: skip link → (notice links) → brand → 4 language links → 3 utility links → search field → Sök → Meny (<64rem) → nav links or topic buttons. The three navs have distinct names. The current topic's link gets `aria-current="true"` (deepest item shown; the page itself is not in the bar). Header search label stays visible to AT, hidden visually only in the header (2.5.3 holds: the button's name "Sök" is its text). Forced colours: the section's 1px border is `CanvasText`; links `LinkText`.

### 5.2 Mega menu (header variant; plan D3)

APG Disclosure Navigation built from `Navigation` + `Disclosure`. **Never** `role="menu"`, `menubar`, `menuitem` or `aria-haspopup`: these are page links. Roadmap's "NavigationMenu: not planned" stays true; this is a composition.

```
nav "Huvudmeny" > ul (Navigation.List)
  li (Navigation.Item)
    button "Barn och utbildning" aria-expanded aria-controls=p1   ← Disclosure.Trigger
    div#p1 [hidden]                                                 ← Disclosure.Panel
      ul (Navigation.List): "Allt om barn och utbildning" (overview link, first) · Förskola · Grundskola · …
```

- **The topic page stays one step away:** each panel starts with its overview link, because the trigger is a button and not a link. No split "link + chevron button" (two stops per topic, an icon-only button).
- **Current page.** The link to the page carries `current="page"` only while its panel is shown (Navigation rule: never inside a `hidden` group). The trigger of the section holding the page gets the trail look (weight 600, `primary-subtle`), visual only, like every trail; the Breadcrumb is the announced path.
- **Wide (≥ 64rem).** Triggers sit in the nav row. An open panel is a full-width band directly under the header (level 3: `surface-raised`, `border-subtle`, `--kv-shadow-popup`), positioned in the document (not `fixed`), over the top of the page. Inside: the overview link, then the children in `Columns` (`sm`), `nav-item` look. One panel open at a time.
- **Narrow (< 64rem).** Everything is inside the "Meny" panel, in flow. Topic triggers are full-width rows with the Accordion look (hairlines, chevron at the inline end, weight 600); panels open in flow under their trigger and are independent (closing one never moves the trigger you just pressed).

**Keyboard** (focus strategy native; no arrows; no shortcuts):

| Key                    | Context                                         | Action                                                                                                                                |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab        | header                                          | Moves through the topic buttons and, when a panel is open, into and through its links (DOM order)                                     |
| Enter / Space          | topic button                                    | Opens its panel, or closes it. Focus stays on the button. Wide: opening one closes any other                                          |
| Enter                  | link in a panel                                 | Follows the link; navigation closes every panel and the Meny                                                                          |
| Escape                 | in an open topic panel or on its button         | Closes that panel; focus to its button                                                                                                |
| Escape                 | in the open Meny panel, no topic open (< 64rem) | Closes the Meny; focus to "Meny"                                                                                                      |
| Escape                 | nothing open                                    | Nothing; not prevented                                                                                                                |
| Tab                    | from the last link of an open panel, wide       | Next topic button; the panel stays open until another opens or focus leaves the nav                                                   |
| (focus leaves the nav) | wide, a panel open                              | The panel closes, so it never covers the element that has focus (2.4.11). Below 64rem nothing closes on focus-out: panels are in flow |
| Arrows, Home, End      | anywhere                                        | Not handled: they scroll the page                                                                                                     |

**Why no arrow keys.** APG marks them optional. `Disclosure` and `Navigation` contracts handle none, so the composition adds no untested key model; a list of links is learned with Tab; arrows on a link scroll the page, which a zoomed keyboard user needs; screen readers in browse mode own the arrows. Adding them later is additive; removing them would break users.

**Pointer intent.** Opens and closes on activation only (click, tap, Enter, Space). **No hover-open, no focus-open, no delay, no animation.** Reasons: a tremor or a path to the search field would open panels by accident; touch has no hover; a panel that closes on pointer exit punishes slow pointers. Hover shows only the trigger's hover underline. Wide only: a press outside the nav closes the open panel and leaves focus where the user pressed. Scrolling never closes. Resizing across 64rem keeps the state. Since nothing appears on hover or focus, 1.4.13 does not apply; a later hover-open option would need dismiss (Escape, no pointer move), hoverable, persistent, and click still pinning it (maintainer decision; not in v1).

**Annotations.** Trigger: `button`, `aria-expanded`, `aria-controls`, visible topic name (never changes with state), decorative chevron. Panel: `div`, no role, `hidden` when closed (not `until-found`: find-in-page in a nav panel is noise). Forced colours: panel 1px `CanvasText` border (shadow drops), chevron `currentColor`, trail weight 600. Reduced motion: nothing animates anyway. RTL: row starts at the right; chevrons are vertical, no mirroring. Escape and focus-out are the composition's handlers, tested in the pattern's test; the `keyboard` skill's Disclosure-navigation row is updated to "Escape: yes; arrows: no".

### 5.3 Site footer

Parts: `Section as="footer"` (`surface`), `Container`, `Columns` (`sm`, gap 8), `Heading` h2 (`heading-4` size), `Navigation.Root aria-labelledby` (one per link group), `Link`, `<address>`.

| Region (DOM order)        | Content (sv · en)                                                                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contact (h2, not a nav)   | "Kontakta oss" · "Contact us": `<address>` with Kontaktcenter, phone (`tel:`), e-mail (`mailto:`), phone hours, visiting address; link "Felanmälan" · "Report a fault" |
| nav "Om webbplatsen" (h2) | Tillgänglighetsredogörelse · Rapportera brist i tillgängligheten · Personuppgifter · Kakor                                                                             |
| nav "Följ Kvirnby" (h2)   | Nyhetsbrev · Kvirnby i sociala medier (a page on `.example`; no platform logos, no feed)                                                                               |
| Organisation line         | "Kvirnby kommun, Storgatan 1, 123 45 Kvirnby" (text)                                                                                                                   |

320px: one column, groups stacked in DOM order. 40rem: 2 columns. 64rem: 3 columns plus the line under them. No back-to-top link (nothing is sticky, and Home scrolls up). Tab stops: links in DOM order. Forced colours: border `CanvasText`.

### 5.4 Language links

`Navigation.Root label` "Språk" · "Language", class `kv-navigation--horizontal`. Each language in itself ("Svenska", "English") with `lang` and `hrefLang`; the current one `current` (gives `aria-current="true"`). Then "Lättläst" (`lang="sv"`) and "Teckenspråk". No flags, no select, no auto-redirect, no machine translation (third-party). **State:** page not translated: the "English" link goes to the English start page and its text says so in English ("English (start page)"; fixture). 320px: wraps after the brand; 64rem: in the end cluster.

### 5.5 Site alert

`Alert.Warning as="section" aria-labelledby=<title id>` (a named region, so landmark navigation finds it), `Alert.Title as="p"` (no heading before the `h1`), `Alert.Body`, one `Link`, optional `Alert.Close` ("Stäng meddelandet", existing key). Placement: after `banner`, before the breadcrumb and `main` (reference B7). One at most. Never announced on load. **States:** on · `Info` · dismissed (gone for the session; Storybook keeps it in state) · long Finnish title. On close, focus moves to `main` (`#main`, the skip target), never `body`. Full width at every size; text at the prose measure.

### 5.6 Cookie consent (story only)

`Section as="section" aria-labelledby` named "Kakor på webbplatsen", first after the skip link, in flow, not a dialog, not a trap, nothing `inert`. `Heading` h2, `Prose` text, `ButtonGroup` with two **secondary** `Button`s of equal look ("Godkänn statistikkakor", "Avvisa statistikkakor"; no primary), a link "Läs mer om kakor och ändra ditt val". Nothing pre-ticked; no settings dialog in v1 (the link goes to the Cookies page). **After a choice:** the region shows "Du har avvisat statistikkakor. Du kan ändra ditt val på sidan Kakor." (or "godkänt"), and focus moves to that text (`tabindex="-1"`), never `body`; not announced (focus reads it). ePrivacy note in the text: `TODO(legal-verify)`. The story says plainly that Kvirnby sets no cookies.

### 5.7 Page tools

- **Top:** `ReadAloud` controls under the `h1` (read-aloud.md), reading the lead and the prose.
- **End of `main`:** a row: "Senast uppdaterad: 2 oktober 2026" (`<time datetime>`, `useFormat`), `CopyButton` "Kopiera länk" (its status beside it, copy-button.md), `Button` "Skriv ut" (`window.print()`; print styles are a 1.0 item, so the story notes it). No third-party share links.
- Wraps at 320px (each tool its own line); one row from 40rem.

## 6. Navigation and promotion (slice T3)

| Pattern                        | Parts (shipped)                                                                                                                                             | Regions (DOM order)                                                                              | 320 · 40rem · 64rem · 80rem                                               | States                                                                                                | Annotations                                                                                                                                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hero**                       | `Section` band (`canvas` or `surface`, padding `lg`), `Container`, `Stack`, `Heading as="h1" size="display"`, `Link` `kv-link--service` + `LinkIcon`, `img` | `h1` → lead (`body-large`, `text`) → one action (service link or link) → optional decorative SVG | stacked · stacked · image beside text (text first in DOM) · same          | with / without image, with / without action, long fi title                                            | One `h1` per page. Image `alt=""` (decorative). No min-height, no text over images, no carousel. `display` steps down below 40rem (DESIGN.md)                                                                                      |
| **Top tasks**                  | `Heading` h2, `Columns as="ul"` (`sm`), `Link`                                                                                                              | h2 "Vanliga ärenden" → 6–8 links                                                                 | 1 · 2 · 3 · 3 columns                                                     | 6 items, 8 items                                                                                      | A list (count announced). Link text is the task as a verb phrase ("Ansök om förskoleplats")                                                                                                                                        |
| **Nav tiles**                  | `Columns as="ul"` (`md`), `Card.Root as="li"`, `Heading` h2/h3, `Link`, `Prose`                                                                             | per tile: heading holding the one link → one sentence                                            | 1 · 2 · 3 · 3                                                             | 3, 7 tiles; long fi heading                                                                           | The link is in the heading (Card rule, no clickable card). Heading level follows the page: h2 on a subpage, h3 under a "Kommunens service" h2 on the start page                                                                    |
| **Teaser**                     | `Card.Root` (`as="li"` in a list, `as="article"` alone), `Card.Body` (padding `none` for the image), `img`, `Heading`, `Link`                               | heading with link → text → image (DOM order = visual order)                                      | image below the text at every width                                       | with / without image, with date                                                                       | One link (in the heading). Image `alt` describes it, or `""` if it repeats the heading                                                                                                                                             |
| **Card grid**                  | `Columns as="ul"` of Teasers                                                                                                                                | –                                                                                                | 1 · 2 · 3 · 4 (80rem, `sm`)                                               | 2, 4, 7 items                                                                                         | Entry points only, never search results (DESIGN.md Layout)                                                                                                                                                                         |
| **Link list**                  | `Heading` h2, `ul role="list"` if unstyled, `Link`                                                                                                          | h2 → list                                                                                        | one column always                                                         | 3, 8 links; one external (`LinkNewTabNotice` not used: same tab)                                      | Link text makes sense alone (2.4.4)                                                                                                                                                                                                |
| **Service link**               | `Link` `kv-link--service` + `LinkIcon` + `Icon arrow-forward` (mirrors in RTL)                                                                              | the link → optional "Andra sätt att ansöka" text                                                 | full width at 320, content width from 40rem                               | available; **closed** (text "E-tjänsten är stängd 1–3 november. Ring Kontaktcenter.", no dimmed link) | One per view. A link, never a button                                                                                                                                                                                               |
| **Related links**              | `Heading` h2, list of `Link`                                                                                                                                | h2 "Relaterade sidor" → list                                                                     | one column                                                                | 2–5 links                                                                                             | Not a `nav` (would add landmark noise on every page)                                                                                                                                                                               |
| **Breadcrumb and section nav** | `Breadcrumb.*`; `Navigation.*` nested; `Disclosure` (< 64rem); `SidebarLayout.Sidebar as="nav"`                                                             | breadcrumb (outside `main`) → section nav                                                        | breadcrumb wraps, never "…" · same · section nav in sidebar, always shown | 2 and 4 levels; current page in a nested group                                                        | Navs "Du är här", "I det här avsnittet". Below 64rem a `Disclosure` "I det här avsnittet" holds the section nav; from 64rem the trigger is `display: none` and the panel shown (the docs shell's rule). Exactly one `aria-current` |

Teaser order: heading with link, text, then image, in DOM and on screen at every width, so a screen reader and a zoomed reader meet the same thing first.

## 7. Content types (slice T4)

Shares are "% of pages of that type with the block" from `composition.csv` (start page n = 25, landing n = 378, content n = 2207). Breadcrumbs inside `main` read low (57–62 %) because many sites put them outside it; the feature is on 25 of 25 sites.

| Block              | Start                                       | Subpage (landing) | Content |
| ------------------ | ------------------------------------------- | ----------------- | ------- |
| Page header / `h1` | 40 (often hidden: we require a visible one) | 80                | 81      |
| Preamble           | 32                                          | 63                | 59      |
| Rich text          | 72                                          | 60                | 77      |
| Link list          | 52                                          | 45                | 16      |
| News list / events | 52 / 24                                     | 10 / 7            | 4 / –   |
| CTA (service link) | 44                                          | 37                | 45      |
| Hero               | 40                                          | 16                | 6       |
| Nav tiles          | 32                                          | 37                | 7       |
| Teaser / image     | 28 / 28                                     | 39 / 14           | 22 / 19 |
| Contact card       | 24                                          | 26                | 37      |
| Search box         | 20                                          | –                 | –       |
| Page meta          | –                                           | 35                | 34      |
| Accordion (FAQ)    | 16                                          | 32                | 17      |
| TOC (contents)     | 8                                           | 14                | 17      |
| Alert in content   | 8                                           | 8                 | 9       |

**Start page** (T1 + T2). `main`: Hero (`h1` "Kvirnby kommun", lead, no action: the header search is the page's search, so no second search field) → h2 Vanliga ärenden (Top tasks) → h2 Kommunens service (7 Nav tiles, h3) → h2 Nyheter (3 Teasers with `<time>`, link "Alla nyheter") → h2 Evenemang (3 Teasers with date and place, "Alla evenemang") → h2 Aktuellt (one Teaser with image) → h2 Kontakta oss (Contact card band). News and events use Teaser until News list / Event list exist (T5). States: site alert on / off; English.

**Subpage** ("Barn och utbildning", T1 + T2, no sidebar). Breadcrumb → `main`: `h1` → preamble (`kv-lead`) → Nav tiles of the 5 children (h2 each) → h2 Genvägar (Link list) → h2 Aktuellt (one Teaser) → h2 Kontakta oss (Contact card: Förskoleexpeditionen) → Page tools end row. States: 3 and 7 children.

**Content page** ("Förskola", T1 + T3). Breadcrumb → section nav (Barn och utbildning's children, Förskola current) → `main`: `h1` → ReadAloud → preamble → Contents (`TableOfContents`, shown with ≥ 3 h2) → prose: h2 Vem kan få förskoleplats? · h2 Så ansöker du (`kv-steps`, then the Service link) · h2 Avgift · h2 Vanliga frågor (`Accordion`, h3 triggers) · h2 Kontakta oss (Contact card) · h2 Relaterade sidor → Page tools end row. States: e-service closed; section nav open / closed below 64rem; English.

**Documentation page** (docs article; not in the survey). Defined from docs-site.md §5 and docs-component-page.md §2, in the same frame: banner (docs fixture: "KvirnUI", sections Home · Docs · Components · Patterns · Content types · Theming as plain nav links, no mega menu) → `SidebarLayout`: `.Sidebar as="nav"` "Dokumentation" · "Documentation" (the section's pages in groups, `Navigation.Label`; behind "Meny" below 64rem) → `.Content as="main"`: `h1` (component name) → lead → status line (`Badge`) → "On this page" (`Heading` h2 `heading-4` + `TableOfContents`) → h2 When to use it → h2 Example (example `Card` + `CodeBlock`) → h2 Use cases (h3 each) → h2 Accessibility (h3s) → h2 Keyboard (`Table` + `Kbd`) → h2 API reference (h3 per part, `Table`) → **Previous / next** → footer. Prose at `45rem`; at 80rem the contents list may sit beside the article (docs-site-components §9.4), never sticky. Content is English only, `lang="en"` whatever the toolbar says (the docs are `en`).

**Previous / next** (new composition): `Navigation.Root` "Föregående och nästa sida" · "Previous and next page", horizontal, two `Link`s, each "Föregående: Breadcrumb" / "Nästa: ButtonGroup" with `arrow-back` / `arrow-forward` (mirrored in RTL); a missing side is not rendered. Stacked at 320px, start and end of one row from 40rem. Not `Pagination` (that names numbered pages).

## 8. Fixture world: Kvirnby kommun

Fictional, labelled as such (reference §6): `.example` domains, no real organisation numbers, coat of arms or e-ID marks; images are inline SVG data URIs; no request leaves Storybook. **Clock:** fixed "now" Monday 12 October 2026, 10.00 Europe/Stockholm, so dates and "Senast uppdaterad" never depend on the real clock. Every string is `{ sv, en }`, written once.

### 8.1 Locale rule

The toolbar's `en` picks `en`; every other locale picks `sv` (fi, nb, nn, se fixtures are later, plan D4). The story wraps the `PageFrame` in a `KvirnProvider` with the chosen fixture locale and its catalog, and the toolbar sets `lang`, so library strings and content never mix languages on one page (3.1.1, 3.1.2).

### 8.2 Data sketch

| Item                    | sv                                                                                                                                                                                                            | en                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name, contact centre    | Kvirnby kommun; Kontaktcenter, 0000-00 00 00 (`TODO(legal-verify)`: a PTS range for fiction, or show no number), kontaktcenter@kvirnby.example, vardagar 8.00–17.00, Kommunhuset, Storgatan 1, 123 45 Kvirnby | Kvirnby Municipality; Contact centre, weekdays 8.00–17.00, Town hall                                                                                                 |
| Topic 1 + children      | Barn och utbildning: Förskola, Grundskola, Gymnasieskola, Fritidshem, Vuxenutbildning                                                                                                                         | Children and education: Preschool, Compulsory school, Upper secondary school, After-school care, Adult education                                                     |
| Topic 2                 | Omsorg och stöd: Äldreomsorg, Stöd vid funktionsnedsättning, Ekonomiskt bistånd, Stöd till anhöriga                                                                                                           | Care and support: Elderly care, Disability support, Financial assistance, Support for family carers                                                                  |
| Topic 3                 | Bygga, bo och miljö: Bygglov, Avfall och återvinning, Vatten och avlopp, Energi- och klimatrådgivning                                                                                                         | Housing, building and environment: Building permits, Waste and recycling, Water and sewage, Energy and climate advice                                                |
| Topic 4                 | Trafik och resor: Parkering, Gator och vägar, Kollektivtrafik, Färdtjänst                                                                                                                                     | Transport and travel: Parking, Streets and roads, Public transport, Mobility service                                                                                 |
| Topic 5                 | Kultur och fritid: Bibliotek, Idrott och motion, Badhuset, Kulturskolan                                                                                                                                       | Culture and leisure: Libraries, Sport and exercise, The swimming baths, School of arts                                                                               |
| Topic 6                 | Arbete och näringsliv: Lediga jobb, Starta företag, Tillstånd för företag, Upphandling                                                                                                                        | Work and business: Jobs, Starting a business, Business permits, Procurement                                                                                          |
| Topic 7                 | Kommun och politik: Kommunfullmäktige, Sammanträden och protokoll, Allmänna handlingar, Synpunkter och klagomål                                                                                               | Municipality and politics: Municipal council, Meetings and minutes, Official documents, Comments and complaints                                                      |
| Overview link per topic | "Allt om barn och utbildning" (each topic its own string, no template)                                                                                                                                        | "All about children and education"                                                                                                                                   |
| Top tasks               | Ansök om förskoleplats · Sök bygglov · Felanmälan gata och park · Se när soporna hämtas · Parkeringstillstånd för rörelsehindrade · Lediga jobb                                                               | Apply for a preschool place · Apply for a building permit · Report a fault in a street or park · See when your rubbish is collected · Disabled parking permit · Jobs |
| News (date)             | 9 okt: Nya öppettider på biblioteket från 1 november · 6 okt: Ansök om förskoleplats inför våren · 1 okt: Torget byggs om – så påverkas du                                                                    | New library opening hours from 1 November · Apply now for a preschool place for the spring · The square is being rebuilt: how it affects you                         |
| Events                  | 17 okt 10–14 Höstmarknad på Torget · 21 okt 18–20 Öppet möte om nya skolan i Norra Kvirnby, Kvirnby skola · 24 okt 11.00 Sagostund för barn 3–6 år, biblioteket                                               | Autumn market on the square · Open meeting about the new school in North Kvirnby · Story time for children aged 3–6                                                  |
| Contacts                | Förskoleexpeditionen, forskola@kvirnby.example, telefontid mån–tors 9.00–11.00                                                                                                                                | Preschool office, phone hours Mon–Thu 9.00–11.00                                                                                                                     |
| Opening hours           | Kommunhusets reception: mån–tors 8–17, fre 8–15, lör–sön stängt. Avvikelse: fre 30 okt stänger 12.00                                                                                                          | Town hall reception; exception: closes at 12.00 on Fri 30 Oct                                                                                                        |
| Site alert              | Vattenavstängning i Norra Kvirnby onsdag 14 oktober. Vattnet stängs av kl. 9–15 på grund av ledningsarbete. Fyll vatten i förväg. Länk: Se vilka gator som berörs                                             | Water shut off in North Kvirnby on Wednesday 14 October. 9.00–15.00, pipe work. Fill water in advance. Link: See which streets are affected                          |
| Hero                    | h1 Kvirnby kommun; lead "Service, nyheter och kontakt för dig som bor, arbetar eller driver företag i Kvirnby." Image: hills and a river, abstract SVG, `alt=""`                                              | Kvirnby Municipality; "Services, news and contact for everyone who lives, works or runs a business in Kvirnby."                                                      |
| Teaser (Aktuellt)       | Tyck till om nya Torget: lämna dina synpunkter senast 30 oktober                                                                                                                                              | Have your say on the new square by 30 October                                                                                                                        |
| Docs fixture            | –                                                                                                                                                                                                             | KvirnUI, the six sections, one page "Breadcrumb" with previous "Badge" and next "Button"                                                                             |

## 9. Strings the patterns render themselves

Fixture content is data. These are the patterns' own words: keys proposed for `@kvirn-ui/i18n` when a pattern is promoted (rule 4); fi is the length check, a draft for native review (`pending`).

| Key                                           | sv                                                                             | en                                                                                               | fi (length)                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `skipLink.label` (exists)                     | Hoppa till huvudinnehållet                                                     | Skip to main content                                                                             | Siirry pääsisältöön                              |
| `siteHeader.menu`                             | Meny                                                                           | Menu                                                                                             | Valikko                                          |
| `siteHeader.navigationLabel`                  | Huvudmeny                                                                      | Main menu                                                                                        | Päävalikko                                       |
| `siteHeader.utilityLabel`                     | Genvägar                                                                       | Shortcuts                                                                                        | Pikalinkit                                       |
| `languageLinks.label`                         | Språk                                                                          | Language                                                                                         | Kieli                                            |
| `search.label` / `search.submit`              | Sök på webbplatsen / Sök                                                       | Search the site / Search                                                                         | Hae sivustolta / Hae                             |
| `sectionNavigation.label`                     | I det här avsnittet                                                            | In this section                                                                                  | Tässä osiossa                                    |
| `breadcrumb.label` (exists)                   | Du är här                                                                      | You are here                                                                                     | Olet tässä                                       |
| `alert.close` (exists)                        | Stäng meddelandet                                                              | Close the message                                                                                | (exists)                                         |
| `siteFooter.contact` / `siteFooter.aboutSite` | Kontakta oss / Om webbplatsen                                                  | Contact us / About the website                                                                   | Ota yhteyttä / Tietoa verkkosivustosta           |
| `pageTools.lastUpdated`                       | Senast uppdaterad: {date}                                                      | Last updated: {date}                                                                             | Viimeksi päivitetty: {date}                      |
| `pageTools.copyLink`                          | Kopiera länk                                                                   | Copy link                                                                                        | Kopioi linkki                                    |
| `pageTools.print`                             | Skriv ut                                                                       | Print                                                                                            | Tulosta                                          |
| `pager.label`                                 | Föregående och nästa sida                                                      | Previous and next page                                                                           | Edellinen ja seuraava sivu                       |
| `pager.previous` / `pager.next`               | Föregående: {title} / Nästa: {title}                                           | Previous: {title} / Next: {title}                                                                | Edellinen: {title} / Seuraava: {title}           |
| `consent.accept` / `consent.reject`           | Godkänn statistikkakor / Avvisa statistikkakor                                 | Accept statistics cookies / Reject statistics cookies                                            | Hyväksy tilastoevästeet / Hylkää tilastoevästeet |
| `consent.accepted` / `consent.rejected`       | Du har godkänt / avvisat statistikkakor. Du kan ändra ditt val på sidan Kakor. | You have accepted / rejected statistics cookies. You can change your choice on the Cookies page. | –                                                |
| `serviceLink.closed`                          | E-tjänsten är stängd {period}.                                                 | The e-service is closed {period}.                                                                | Sähköinen palvelu on suljettu {period}.          |

## 10. Visual specification (shared)

Only existing tokens and looks. No new colour pair.

| Part                       | Look (DESIGN.md)                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header, footer             | `Section` level 1: header `canvas`, footer `surface`; padding `sm`/`md`; header compact from 64rem only                                            |
| Brand                      | `Link` with `text` colour and weight 600 at `heading-4` size, underline on hover (gap: brand look, B2)                                             |
| Utility and language links | `nav-item` look, horizontal; current language = `nav-item-current`                                                                                 |
| Meny and topic triggers    | `kv-disclosure-trigger` (quiet text button, chevron); wide topic triggers at the nav-item height and padding (gap §12); narrow: Accordion row look |
| Mega panel                 | Level 3; children `nav-item`; overview link weight 600                                                                                             |
| Hero                       | `Section` band; `display` `h1`; lead `body-large` in `text`; `kv-link--service`                                                                    |
| Tiles, teasers             | `Card` level 2, `lg` radius, link in heading                                                                                                       |
| Site alert                 | `Alert.Warning` / `.Info` look, full width                                                                                                         |
| Page tools                 | `body` text; `CopyButton` status; secondary `Button`                                                                                               |

**State matrix.** Triggers: rest · hover (underline) · focus-visible (ring) · open (chevron up, `aria-expanded`) · trail (weight 600 + `primary-subtle`). Links: rest · hover · focus · current. Alert: shown · dismissed. Consent: unanswered · answered. Service link: available · closed (text). No disabled, invalid or loading state in these slices; the header search's submit has no client validation (an empty query goes to the search page, which handles it, reference P15).

**Modes.** Four themes via tokens. Forced colours: every section and card keeps its 1px border (`CanvasText`); the mega panel's border replaces its shadow; current = `LinkText` bar; trail = weight. RTL: logical properties; `arrow-*` and `chevron-forward/back` mirror. Motion: none. 320px, 400 % zoom, 1.4.12: everything wraps; nothing has a fixed height; the hero has no min-height; hyphenation on headings and cards (`lang` set).

## 11. Accessibility annotations (shell; each pattern's contract completes its own)

- **Landmarks:** one `banner`, `main`, `contentinfo`; navs named and distinct: Språk, Genvägar, Huvudmeny, Du är här, I det här avsnittet, Om webbplatsen, Följ Kvirnby, (Föregående och nästa sida); `search`; the site alert and the consent are named regions.
- **Headings:** one `h1` in `main`; no heading in the header; the alert's title is a `p`; footer h2s come after `main`'s outline; resident pages stop at h3.
- **Focus moves:** skip link → `main`; alert closed → `main`; consent answered → its confirmation; Escape → the trigger; link followed → closes menus, then route focus to the `h1` (`useRouteFocus`, docs app). Never `body`.
- **Announcements:** none on load; CopyButton's own; nothing else.
- **SCs of note:** 1.3.1, 1.3.2, 1.4.1, 1.4.10, 1.4.11, 1.4.12, 1.4.13, 2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.4, 2.4.5, 2.4.11, 2.5.3, 2.5.8, 3.1.1, 3.1.2, 3.2.3, 3.2.6, 4.1.2.

## 12. Library parts, gaps and maintainer asks

Verified in `packages/react/src` (2026-10-09): Accordion, Alert, Badge, Breadcrumb, Button, ButtonGroup, Card, CodeBlock, Columns, Container, CopyButton, Disclosure, Field, Heading, Icon (incl. `menu`, `search`, `arrow-*`, `chevron-*`, `language`, `external`), Kbd, Link (+ `LinkIcon`, `current`), Navigation (+ Label), Pagination, Prose, ReadAloud, Section (`as` header/footer), SidebarLayout, SkipLink, Stack, SummaryList, Table, TableOfContents, TextInput, VisuallyHidden. **Not shipped:** Site header/footer block (G9), Search block, brand link look, NavigationMenu (not planned), Hero block, Contact card (composition of Card + SummaryList).

**Maintainer asks** (none added by this spec):

1. **Pattern CSS home.** Header rows, the mega panel position, the "shown from 64rem" rule and the hero layout need CSS the theme doesn't have; the plan forbids `theme.css` changes. A pattern stylesheet in semantic tokens only, beside the compositions (like `home.css`), wherever D2 lands?
2. **DESIGN.md text, no new token:** (a) a disclosure trigger inside a horizontal navigation takes the nav-item height, padding and trail look; (b) the mega panel is level 3 as a full-width band (square, no `xl` radius); (c) the brand link look; (d) the site alert is a named region.
3. **Hero type.** The docs hero uses raw `4rem` / `5.25rem` and negative tracking; the pattern uses `display` only. A larger hero size would be a `--kv-font-*` token (proposal, measured nothing: size only).
4. **Hero wash.** The docs hero's `color-mix` gradient of `primary` and `accent` sits behind text unmeasured; the pattern ships without it. Keep it docs-only, or measure text on its lightest and darkest point in four themes (`theme:check`) before it becomes a choice.
5. **Trail on a button.** The current-section trigger needs a state hook for the trail look (`data-*`, since it's state); `:has()` can't see a link that is not current while hidden.

## 13. Validation

- [x] Self-review against `review-checklist.md`: no open blocker. Watch items: the header's height at 320px (four rows, ~230px before the menu; measure in the story), the site alert being skipped by the skip link (Q2).
- [x] No new colour pair or token.
- [ ] Usability test plan, result **`pending`**:
  - Participants: 6 residents (a screen reader user, a magnifier user at 400 %, a person with a tremor using a mouse, a person with low digital confidence, two second-language Swedish readers, one of them Finnish-first); 2 integrators; 1 evaluator with NVDA.
  - Tasks: "Find how to apply for a preschool place" (from the start page, then from a news article); "Find when the town hall reception closes on 30 October"; "Is the water off at your address on Wednesday?"; "Switch the page to English"; integrator: "Copy the mega menu and list its keys".
  - Measure: completion, activations to the task, use of top tasks vs mega menu vs search, accidental opens, wrong-language moments, keyboard path length, comments on wording.

## 14. Open questions (one list)

1. **Mega panel at 64rem: overlay (specified) or push-down?** Overlay closes on focus-out, Escape and outside press, so focus is never covered; push-down never covers anything but shifts the page under the pointer and needs a different DOM.
2. **Site alert vs the skip link.** "Hoppa till huvudinnehållet" jumps over it (reference B7 placement). Keep it as a named region before `main`, or move it to the top of `main`?
3. **Documentation page chrome:** the docs fixture (KvirnUI header, specified) or Kvirnby's chrome around a docs article?
4. **Plan IA changes** in §3 (page meta in Page tools; Lättläst and Teckenspråk in Language links; header search in S1; e-services and fault reporting as chrome; Contact card into T3).
5. **Start page news and events** use Teaser until News list and Event list exist (T5): acceptable for the T4 review?
6. **Share = copy link only** (no third-party share links, rule 7), though 24 sites have share buttons: agreed?
7. **Print button** before print styles exist (a 1.0 item): show it now, or leave it out until `print.css`?
8. **Fixture phone number:** a PTS range for fiction (`TODO(legal-verify)`) or no number at all?
9. **Hover-open for the mega menu** stays out of v1 (§5.2): confirm, since 15 surveyed sites may train mouse users to hover.
10. Maintainer asks 1–5 in §12, and the D2 code home, which several of them depend on.
