# Design spec: Prose content types: figure, inset text ("Viktigt") and steps ("Så här går det till")

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** to be written (task split in §9)
- **Type:** component default styling (two `kv-*` classes) + authoring guidance
- **Extends:** [foundations-and-prose.md](foundations-and-prose.md). Its element table (§6.3), boundary and modes still hold; this file adds only what's new.

## 1. Brief

- **Users:** residents reading a municipality guidance page (CMS content); editors writing it. Hardest case: a resident on a phone at 320px, Finnish or Northern Sámi as a second language, using VoiceOver on iOS, reading about a deadline that costs them money if missed.
- **Job:** "When I read how to apply for something, I want to see what I must not miss and what happens in which order, so I can do it right the first time."
- **Context:** once a year or once in a lifetime; often on a phone; some print the page to bring to an appointment.
- **Constraints:** WAD/EN 301 549 via WCAG 2.2 AA; no third-party embeds or network calls (AGENTS rule 7, GDPR); CMS output is plain HTML, so editors can set a class on a block at most, never ARIA on inner elements.
- **Success:** residents find the deadline and the step order in a test task without help; editors pick inset vs Alert correctly from the docs alone.
- **Evidence:** none for KvirnUI users. Assumptions below.
  - Assumption: residents notice a neutral inset box without an icon → RQ: do they find the "Viktigt" text as fast as with an Alert.Warning?
  - Assumption: heading navigation without the step number is enough → RQ: do screen-reader users who jump by `H` lose their place in the steps?

## 2. Prior art

| Source                                                                                                                                            | Reuse                                                                               | Change and why                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Prose (`kv-prose`), [foundations-and-prose.md](foundations-and-prose.md) §6.3                                                                     | `figure`, `figcaption`, `img`/`video`, `ol` and `::marker` rules, the boundary list | Nothing restyled; two classes added                                                                          |
| Alert, [alert.md](alert.md); bare `kv-alert` = `surface` + `border-control` bar                                                                   | The neutral bar box as a look family: "neutral means not a status"                  | Inset is not a prose boundary, has no grid, icon, close or announce                                          |
| [GOV.UK Inset text](https://design-system.service.gov.uk/components/inset-text/)                                                                  | A block set apart from the text around it, no role                                  | We add a fill and a leading word, because a bar alone reads as a quote here (`blockquote` already has a bar) |
| [GOV.UK Warning text](https://design-system.service.gov.uk/components/warning-text/)                                                              | Legal or money consequences need a stronger signal                                  | We route those to `Alert.Warning`, not a second inset style                                                  |
| [GOV.UK Step by step navigation](https://design-system.service.gov.uk/patterns/step-by-step-navigation/)                                          | Steps as numbered, ordered content                                                  | Not reused: it's interactive (show/hide) and multi-page. Ours is a static `<ol>`                             |
| [WAI Images tutorial](https://www.w3.org/WAI/tutorials/images/decision-tree/), [complex images](https://www.w3.org/WAI/tutorials/images/complex/) | The alt decision tree, long descriptions                                            | Condensed to the table in §7.1                                                                               |
| [Lists and Safari](https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html)                                                               | `list-style: none` drops list semantics in WebKit                                   | Why steps keep the native marker (§6.4)                                                                      |

## 3. Flow

Reading, not a task flow: h1 → lead → content → inset (if any) → h2 "Så här går det till" → steps → figure → contact.

Unhappy paths, and what the design does:

| Case                                              | Behaviour                                                                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Image fails to load                               | Browser shows `alt`; `figcaption` still names the figure. Never put the only copy of a fact in an image                    |
| Editor leaves `alt` empty on an informative image | Not catchable by CSS. Docs and the CMS guidance say so; axe flags a missing `alt`, not a bad one                           |
| CMS strips the class                              | Inset falls back to plain paragraphs (still starts with "Viktigt:"); steps fall back to the prose `ol`. Both stay readable |
| 12+ steps, or a step with a nested list           | Native counter keeps counting; nested `ol` uses prose's `lower-alpha`                                                      |
| Long Finnish/Sámi words at 320px                  | Hyphenation + `overflow-wrap: break-word` (§6.6)                                                                           |
| Printed page                                      | §8.2 (maintainer decision)                                                                                                 |
| Content changes after load                        | Nothing is announced: inset is static content, not a status                                                                |

## 4. Content

The classes ship **no strings**, so `packages/i18n` gets no key. The words are the editor's. Storybook fixture fields (added to `articleFor` in `apps/storybook/src/foundation/foundations.fixture.tsx`, all six fixture locales):

| Fixture field                     | en                                                                                    | sv                                                                                | longest fi                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `inset.lead`                      | Important:                                                                            | Viktigt:                                                                          | Tärkeää:                                                                            |
| `inset.text`                      | Apply by 30 April. We can't process applications that arrive later.                   | Ansök senast den 30 april. Ansökningar som kommer in senare kan vi inte behandla. | Hae viimeistään 30. huhtikuuta. Myöhemmin saapuneita hakemuksia emme voi käsitellä. |
| `steps.heading`                   | How it works                                                                          | Så här går det till                                                               | Näin hakeminen etenee                                                               |
| `steps.items[0..3]` (h3 + p each) | Apply in the e-service · We check your application · You get a decision · Pay the fee | Ansök i e-tjänsten · Vi går igenom ansökan · Du får ett beslut · Betala avgiften  | Hae sähköisessä asiointipalvelussa · …                                              |
| `figure.longDescription`          | text paragraph after the figure (see §7.1)                                            |                                                                                   |                                                                                     |

Writing rules for the docs page: the inset starts with a word that says why it's set apart ("Viktigt:", "Tänk på:", "Bra att veta:"), or a heading that states the point ("Ansök senast 30 april"), never a bare "Viktigt" heading (heading lists fill up with identical entries). Step headings start with a verb and don't repeat the number.

## 5. Structure

Same at 320px, 40rem and 64rem (one column, 70ch measure); only the inset's inline padding changes.

```
[main] article.kv-prose
  h1 · p.kv-lead
  div.kv-inset        → p "Viktigt: …"              (no role, no landmark)
  h2 "Så här går det till"
  ol.kv-steps         → li (h3 + p) × n             (native list, n items)
  figure              → img[alt] · figcaption (credit, source)
  p                   → long description, if the image is complex
```

## 6. Visual specification

### 6.1 Decision: classes, not components

Class-only, per AGENTS "classes are for parts and choices" and theme-css "one import styles everything". No behaviour needs code: nothing is focusable, nothing changes state, nothing is announced. CMS HTML can carry a class, not a React component. A future `Prose`-style wrapper component is out of scope.

| Content | Class                       | Element                                                 | Why                                               |
| ------- | --------------------------- | ------------------------------------------------------- | ------------------------------------------------- |
| Figure  | none (existing prose rules) | `figure` > `img`/`picture`/`svg`/`video` + `figcaption` | Already styled; the gap is guidance, not CSS      |
| Inset   | `kv-inset`                  | `div` (any block element)                               | Set-apart content that stays prose inside         |
| Steps   | `kv-steps`                  | `ol` only                                               | Bigger, bolder native numbers, room between steps |

### 6.2 Figure

No CSS change. `figcaption` stays `body-small`, `text-muted`, metadata (credit, source, date), as §6.3 of the prose spec decided. Explanation goes in the body text. A figure outside prose: wrap it in `kv-prose` (or a `Prose`) rather than adding a `kv-figure` class.

### 6.3 Inset (`kv-inset`)

| Property   | Value (tokens)                                                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background | `surface`                                                                                                                                                                                                                                                   |
| Edge       | 1px `transparent` on block-start, block-end, inline-end (drawn in forced colours); inline-start `--kv-indicator-width` `border-control` bar. Same construction as the bare `kv-alert`: the `sm` radius has no inner curve at 4px, so the bar stays straight |
| Radius     | `radius-sm` (the alert radius)                                                                                                                                                                                                                              |
| Padding    | `space-4` block and inline; inline `space-6` from `40rem`                                                                                                                                                                                                   |
| Text       | `text`, prose sizes inherited; links `link` (prose rules, the inset is not a boundary)                                                                                                                                                                      |
| Children   | first child no block-start margin, last child no block-end margin (class rule, so it works in and out of prose)                                                                                                                                             |
| Margin     | in prose: `--kv-prose-space-block` (via the margin list, §6.5); outside prose: 0, the layout gap spaces it                                                                                                                                                  |
| Long words | `hyphens: auto`, `hyphenate-limit-chars: 10 4 4`, `overflow-wrap: break-word`                                                                                                                                                                               |
| No         | icon, shadow, hover, `overflow`, fixed size, status colour, `primary-subtle`                                                                                                                                                                                |

**Inset or Alert** (goes in DESIGN.md Content and status):

| The content…                                                                     | Use                                                                           |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| is part of the article and must not be missed (a condition, an exception, a tip) | `kv-inset`, starting with "Viktigt:" or a stating heading                     |
| warns of a legal or money consequence, or a deadline you lose rights by missing  | `Alert.Warning` (static, no `announce`): colour + triangle icon + status word |
| reports the state of something (saved, failed, service down)                     | an Alert, announced only when it appears after an action                      |
| is a quotation                                                                   | `blockquote` (bar, no fill)                                                   |

The brief's example "Ansök senast 30 april, annars behandlas ansökan inte" sits on the line: it's a lost-rights deadline, so the guidance points to `Alert.Warning`. "Ta med legitimation till mötet" is an inset.

### 6.4 Steps (`kv-steps`)

**Counter approach: the native `::marker`, never `list-style: none`.** A drawn circle badge needs `list-style: none` + a `::before` counter, which removes the list role in WebKit unless the `ol` gets `role="list"`. CMS editors can't add that role, and `<ol role="list">` fails our lint (the relaxation covers `ul` only). The native marker also keeps `start`, `reversed`, `li[value]` and `type` working. Trade-off: a large bold number, not a circle; accepted for semantics.

| Part                     | Value (tokens)                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ol.kv-steps`            | `list-style-type: decimal` set explicitly (beats a reset), `list-style-position: outside`, `padding-inline-start: space-8` (room for "10."), margin 0 outside prose                  |
| `.kv-steps > li`         | `padding-inline-start: space-2`; `margin-block: 0`; `li + li`: `margin-block-start: space-6`; first/last child margins trimmed                                                       |
| `.kv-steps > li::marker` | body font family, `--kv-font-heading-3-size`, weight 600, `--kv-font-numeric-feature-settings` (tabular), colour `heading`. All `::marker`-allowed properties (colour and font only) |
| Nested lists in a step   | unchanged prose rules (`lower-alpha`, normal markers)                                                                                                                                |
| `ol.kv-steps[type]`      | keeps its type, like prose                                                                                                                                                           |

When to use: `kv-steps` for a process of about 3–8 steps where steps take time or happen apart ("vi skickar ett beslut"), each step often a heading plus text. A plain prose `ol` for short instructions of one line each. Either every step has a heading or none.

**Steps vs Stepper (Plan 0053, narrowed).** They share no markup, class, token or string.

|         | `kv-steps` (this spec)                   | Stepper / step indicator                                             |
| ------- | ---------------------------------------- | -------------------------------------------------------------------- |
| Is      | content describing a whole process       | the user's position in a multi-page form                             |
| Element | `ol` of all steps                        | a text caption above the question `h1`: "Steg 2 av 5" + section name |
| State   | none; no current step, no `aria-current` | the current step only                                                |
| Where   | inside prose, on guidance pages          | e-service question pages, never in prose                             |
| Strings | editor's                                 | `stepIndicator.status` (i18n, ICU)                                   |
| Links   | optional, in the text                    | never a link list                                                    |

Don't use `kv-steps` as a progress indicator, and don't put Stepper on a guidance page.

### 6.5 Prose boundary: how the lists in section 9 of `theme.css` grow

Both classes keep their content prose-styled (paragraphs, links, nested lists), so they are **not** boundaries.

| List in `theme.css` §9                                                         | Add                      | Why                                                                     |
| ------------------------------------------------------------------------------ | ------------------------ | ----------------------------------------------------------------------- |
| Root-only list (`&:not(:where(.kv-not-prose, … .kv-section …))`)               | `.kv-inset`, `.kv-steps` | Prose leaves the root alone; its content stays prose, like `kv-section` |
| Margin list ("Embedded components … only its own margin")                      | `.kv-inset`, `.kv-steps` | They take `--kv-prose-space-block` in prose                             |
| Part list (first `:is(...)`)                                                   | nothing                  | Not a component part                                                    |
| Descendant list (`:is(.kv-not-prose …) *`)                                     | nothing                  | Content must stay prose                                                 |
| Boundary list (`.kv-card, .kv-alert, …`)                                       | nothing                  | Not a boundary                                                          |
| Hyphenation set (`kv-prose`, `kv-card`, `kv-alert`, `kv-field`, `kv-fieldset`) | `.kv-inset`, `.kv-steps` | They also work outside prose                                            |

### 6.6 States and modes

- **States:** static. No hover, focus, active or selected; only links inside have states (prose rules).
- **Dark, contrast themes:** semantic tokens only. Pairs used: `text`, `heading`, `link`, `text-muted` on `surface` and `canvas`; `border-control` on `surface`. All are already in `contrast-requirements.ts` as floors, so **no new pair**. The bar is decoration (the leading word is the cue), so 1.4.11 doesn't require it; it is 3:1 anyway.
- **On a Section (`surface`):** the inset fill matches the section; the bar and the leading word remain. See Open question 1.
- **Forced colours:** fill disappears; the three transparent 1px edges draw in `CanvasText`, so the box survives. The bar is `border-control` → `ButtonBorder`, which reads as a control: set it to `CanvasText` in forced colours (as the shared `kbd` rule does). Markers and captions are `CanvasText`. Inline SVG charts drawn in `currentColor` follow; meaning must not rest on colour (labels or patterns). No `forced-color-adjust: none`.
- **RTL:** logical properties only. Bar, marker and indent move to the right with `dir="rtl"`. Digits stay Latin in all six locales.
- **Motion:** none.
- **320px, 400% zoom, 1.4.12:** no heights, no `overflow`. Indents in rem; total step indent 2.5rem. With text-spacing overrides nothing clips: the marker sits on the first line's baseline.

### 6.7 Tokens

None new. Reused: `surface`, `text`, `heading`, `link`, `border-control`, `space-2/4/6/8`, `radius-sm`, `--kv-indicator-width`, `--kv-border-width`, `--kv-font-heading-3-size`, `--kv-font-numeric-feature-settings`, `--kv-prose-space-block`. Two new public **class names** (`kv-inset`, `kv-steps`): public API, needs a changeset and the maintainer's approval as a DESIGN.md change.

## 7. Accessibility annotations

No focusable part is added, so no Tab stops, no keys and no `Keyboard` story. Rows go into `packages/react/src/prose/prose.a11y.md`. SCs of note: 1.1.1, 1.2.1–1.2.5 (§8.1), 1.3.1, 1.4.1, 1.4.3, 1.4.5, 1.4.10, 1.4.12, 2.2.2, 2.4.6, 3.1.2, 4.1.3 (deliberately not used).

### 7.1 Figure and alt text (1.1.1, 1.4.5)

| Image                                 | `alt`                                                   | `figcaption`         | Elsewhere                                                                                                     |
| ------------------------------------- | ------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Informative photo                     | what it shows that matters here, ≤ about 150 characters | credit, source, date | –                                                                                                             |
| Map, chart, plan                      | short: what and where ("Karta över zon B")              | source               | the facts in body text or a table right after the figure (addresses, figures). Not only in `title` or a hover |
| Image of text (poster, opening hours) | avoid; if unavoidable, all the text                     | –                    | the text in HTML (1.4.5)                                                                                      |
| Decorative                            | `alt=""`, and no `figure` or caption                    | –                    | –                                                                                                             |
| Linked image                          | the link's destination                                  | –                    | –                                                                                                             |

- `figure` is native role `figure`; `figcaption` gives it its name. Alt and caption are both read, so they never repeat each other.
- Alt text is translated with the page; text in another language gets `lang` on the `img` (3.1.2).

### 7.2 Inset

- `div`, no role. Not `aside` (a complementary landmark at top level, and this is main content), not `role="note"` (ancillary content, uneven support), not `role="status"`/`alert` (not a status, never announced, 4.1.3 doesn't apply).
- The visual set-apart is conveyed in text by the leading word or heading (1.3.1, 1.4.1). This is a docs rule, not enforceable by CSS.
- A heading inside keeps the page's heading order (2.4.6, 1.3.1).

### 7.3 Steps

- Native `ol`/`li`: "list, 4 items" and the position. The number is the native marker, so it is in the accessibility tree in Chromium and Firefox and read by VoiceOver: **AT verification `pending`** (NVDA, JAWS, VoiceOver macOS and iOS, TalkBack).
- No `aria-current`, no `role`, no `tabindex`.
- A browser test can prove `ol.kv-steps` keeps role `list` with n `listitem`s (Chromium only; the WebKit row stays manual).

## 8. Maintainer decisions

### 8.1 Audio and video: guidance only, no component (recommended)

- Native `<video controls preload="metadata" playsinline>`, self-hosted, with `<track kind="captions" srclang default>` per language (1.2.2) and a `poster`. Never `autoplay` (1.4.2, 2.2.2). No YouTube, Vimeo or other iframe (rule 7, GDPR).
- Visual-only information is spoken in the narration, or an audio-described version or a transcript with descriptions sits next to the video (1.2.3, 1.2.5). `<audio controls>` gets a transcript (1.2.1).
- Prose already styles `video` (block, max 100%, `radius-md`). `audio` is unstyled; one rule (`display: block; max-inline-size: 100%`) would be the only CSS.
- Why no component: a custom player is a large keyboard and AT surface; native controls are better supported than anything we'd build. Native control keyboard support differs per browser: **AT verification `pending`**.

### 8.2 Print stylesheet: guidance + a scoped `@media print` in `theme.css` (recommended)

Today `theme.css` only hides `kv-alert-close` and the toast region in print. What it would need:

| Need                                                                                              | Rule (proposal)                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dark theme printed on white paper (backgrounds don't print, `neutral-50` text would be invisible) | under `@media print`, the light theme's semantic values. **Risk:** `theme:check` reads `@media` blocks; the plan must confirm the checker ignores or verifies `print`, and a checker change is a gate change (maintainer) |
| Inset without its fill                                                                            | 1px `border-control` on all edges in print                                                                                                                                                                                |
| Broken blocks                                                                                     | `break-inside: avoid` on `figure`, `.kv-inset`, `.kv-steps > li`, `pre`, `tr`; `break-after: avoid` on prose headings                                                                                                     |
| Links on paper                                                                                    | in prose only, external `a[href^="http"]::after` with the URL, `overflow-wrap: anywhere`                                                                                                                                  |
| Interactive-only parts                                                                            | theme hides only its own (as now). Site chrome is the consumer's `@media print`; no `kv-print-hidden` class                                                                                                               |

Guidance: closed `details`/Disclosure content doesn't print; don't put the only copy of a fact there.

## 9. Task split for the plan

1. **DESIGN.md** (maintainer approval): Prose gets inset, steps and figure guidance; Content and status gets "Inset or Alert"; Patterns notes Steps vs Stepper.
2. **theme.css §9:** the list growth in §6.5; new rules for `kv-inset` and `kv-steps` (§6.3, §6.4); forced colours (§6.6); the §9 header comment and DESIGN.md Prose "Boundary" bullet. Then `theme:check`.
3. **Print** (only if §8.2 is approved): the `@media print` block and the checker question.
4. **Fixture and stories:** `articleFor` fields (§4) in all six locales; Prose stories gain the inset, steps and a complex figure, and show them in RTL, Text spacing and On surfaces.
5. **Tests:** `prose.test.tsx`: `ol.kv-steps` exposes `list` with n `listitem`s; the inset adds no role or Tab stop. Axe runs on the stories. No CSS assertions (rule 13).
6. **Docs:** Prose docs page and `prose.md`: alt table (§7.1), inset vs Alert, steps vs Stepper, video guidance (§8.1). `prose.a11y.md` rows.
7. **Record:** changeset (`@kvirn-ui/theme` minor: two classes), theme-css skill boundary paragraph, roadmap row.

## 10. Validation

- [x] Self-review against the review checklist: no open blockers; colour is never the only cue (leading word, number).
- [x] No new colour pair (all pairs are existing floors). Orchestrator to confirm with `vp run theme:check` after the CSS lands.
- [ ] Usability test plan written. Result: `pending`

**Usability test plan (`pending`):** 6–8 residents incl. VoiceOver iOS, NVDA, screen magnification at 400%, a cognitive disability, low digital confidence, and Finnish- and Arabic-first speakers; 2 editors. Tasks: find the deadline on the page; say what happens after you apply; tell what the map shows (screen reader); editors: choose inset or Alert for three sample texts. Measure: success without help, time, wrong choices, whether `H`-key users know which step they're on.

## 11. Open questions

1. Inset on a `surface` Section: keep `surface` (the bar carries it, like the bare Alert) or switch to `surface-raised` there with a Section-aware selector?
2. Is the "Viktigt: deadline" example an inset or `Alert.Warning`? This spec says Alert for lost rights.
3. §8.1 and §8.2 recommendations: approve, change or drop?
4. Should prose style native `details`/`summary` (unstyled today) for long descriptions written in a CMS?
