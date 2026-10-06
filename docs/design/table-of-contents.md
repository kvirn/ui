# Design spec: TableOfContents

- **Status:** Draft, for the maintainer's approval round with Plan 0049.
- **Designer:** ux-designer agent · **Date:** 2026-10-05
- **Plan:** Plan 0049
- **Type:** component default styling. The API and behaviour are the plan's. This spec decides the look and the content rules.
- **Prototype:** [prototypes/table-of-contents.html](prototypes/table-of-contents.html). Open it from disk. It links the real `packages/theme/theme.css` and IBM Plex files, makes no network request and runs no script. Each layout has an article beside its contents list, with an active state forced (no scroll-spy). The designer couldn't render it (the subagent guard blocks Playwright).

**The result.**

- **The same item rules as Navigation** ([navigation-link-options.md](navigation-link-options.md), C with T3), shared, not redefined:
  - links at weight 400, no fill, underlined on hover;
  - the heading being read is a solid `primary` row (`aria-current="location"`);
  - the headings above it are the quiet trail at weight 600.
- **Levels** indent 16px each.
- **The title** is the consumer's own heading.
- **Q-C1 (the active item):** the solid fill (§6.3).

## 1. Brief

- **Users:** both.
  - **The hardest case** is a resident reading a long guidance page ("Bygglov: så går det till", eight sections) on a phone at 200% text. They lose their place and want to jump to "Avgifter".
  - **Also hard:**
    - a screen-reader user who wants the sections as a list of links;
    - a reader with attention difficulties, for whom a highlight that jumps beside the text can pull them away from reading.
  - **Staff and editors** read long manuals and docs every day, in compact density.
- **Job to be done:** When I'm on a long page, I want to see its sections and which one I'm in, so I can jump to what I need and find my way back.
- **Context:** residents once, on a phone or a desktop. Staff daily on a desktop, often with the list in a side column.
- **Constraints:**
  - WCAG 2.2 AA.
  - DESIGN.md.
  - From Plan 0049:
    - plain `#id` links;
    - one `aria-current="location"`;
    - the T3 trail through `:has()`;
    - nothing sticky in the component;
    - no smooth scroll, no focus movement and no announcements;
    - empty `items` render nothing.
  - No new token or contrast pair.
  - One new message, `tableOfContents.label`.
- **Success criteria:**
  - Users jump to a named section on the first try.
  - After scrolling, they can say which section they're in.
  - No participant says the list distracted them while reading (§8).
- **Evidence:** none of our own. Prior art is in §2.
- **Assumptions and research questions:**
  - Assumption: a strong mark on the current section helps readers who lose their place more than it distracts others. → With the list in a sticky side column, do readers with attention difficulties report it as distracting?
  - Assumption: residents read a contents list at the top of a page and use its links. → Do they use it, or scroll?

## 2. Prior art

| Source                                                                                             | What we reuse                                                                                                                                                       | What we change and why                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KvirnUI Navigation, C with T3 ([navigation-link-options.md](navigation-link-options.md) §12–§13)   | Every item rule: weight, hover underline, the solid current item, the quiet trail, forced colours, the nested indent                                                | Nothing: §8's selectors become lists that include the TOC's parts. The active heading uses `aria-current="location"`, not `page`                                                                                                                                                  |
| [docs-site.md](docs-site.md) line 456, the "Contents nav"                                          | A real `h2` "On this page" in `text`, never a muted label, and a list of links                                                                                      | The docs site underlines its contents links. TableOfContents follows Navigation instead (§6.4). The docs site's row changes when it adopts the component, which is a follow-up in the plan                                                                                        |
| [USWDS in-page navigation](https://designsystem.digital.gov/components/in-page-navigation/)        | Scroll-spy with IntersectionObserver; `h2` and `h3` by default; it needs at least two headings by default                                                           | USWDS underlines its active link, smooth-scrolls, sits in a sticky container, and moves focus to the section. We keep the hover underline for hover, so the active mark is the shared fill. We never smooth-scroll, aren't sticky, and leave focus where the browser puts it (§7) |
| [GOV.UK contents list](https://components.publishing.service.gov.uk/component-guide/contents_list) | A titled list of in-page links. "By default we do not underline links in this component even though this is the general approach on GOV.UK." Nesting one level deep | GOV.UK has no scroll-spy. Its nested top-level items are always bold, while ours are bold only on the trail                                                                                                                                                                       |
| APG                                                                                                | None needed: a labelled `<nav>` around a list of links                                                                                                              | –                                                                                                                                                                                                                                                                                 |

## 3. Flow

1. The reader arrives. The contents list shows its title and the section links, and nothing is current until they scroll past the first heading.
2. **They follow a link** (pointer, or Enter):
   - The browser jumps to the heading, with the page's own `scroll-padding-top`, so a sticky header doesn't cover it.
   - Focus stays on the link, and the browser moves its sequential focus starting point, so the next Tab continues inside the section.
   - The heading's link becomes current once the scroll settles.
   - Back returns to the previous position, through the browser's history.
3. **They read and scroll.** The current item follows the last heading above the `offset` line, and its parent headings take the trail.

Unhappy paths:

- **No headings** (empty `items`): nothing renders, so there's no empty landmark. Render the title inside the Root with the function child, so it disappears with the list (§6.5).
- **One heading:** the list renders one link, because the component doesn't count. A list helps from three sections, and below that the consumer leaves it out.
- **A heading id that doesn't exist:** a development warning, and the link goes nowhere. The consumer has to fix the id.
- **No JavaScript, or before hydration:** a plain list of working links, with nothing current.
- **A sticky header covers the heading:** the consumer sets `html { scroll-padding-top }` to the header's height (C43, which also covers a focused element), and passes the same value as `offset`. If they differ, the heading above stays current after a jump.
- **`<base href>` on the page:** `#id` links resolve against it and leave the page. The docs say so.
- **Reduced motion:** the component never scrolls by itself. The browser's jump honours the page's `scroll-behavior` and the user's setting.

## 4. Content

| i18n key                | en           | sv               | fi            | nb             | nn            | se                         | Notes                                                                                                  |
| ----------------------- | ------------ | ---------------- | ------------- | -------------- | ------------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `tableOfContents.label` | On this page | På den här sidan | Tällä sivulla | På denne siden | På denne sida | On this page (placeholder) | The landmark's name when there's no `aria-labelledby`. Northern Sámi needs a native review (`pending`) |

Content rules for consumers:

- **The title** uses the same words as the label ("På den här sidan"), from the consumer's translations, and names the `<nav>` with `aria-labelledby`.
- **Each link's text is its heading's text.** Then a link and its heading have the same name (2.4.4, 2.4.6), and the list reads as the page's outline.
- **Headings are unique and say what the section is about,** for example "Avgifter för bygglov", not "Mer information".
- **No numbering** unless the headings are numbered.

## 5. Structure

The component isn't sticky and has no layout of its own: placement is the page's.

```
320px and 40rem (one column)          64rem and wider (the consumer may add a side column)
[main]                                 [main]
  h1 Bygglov: så går det till             h1 …              ┌ side column ─────────────┐
  lead                                    lead              │ h2 På den här sidan      │
  h2 På den här sidan   (the title)       h2 Vem behöver …  │ [nav aria-labelledby]    │
  [nav aria-labelledby → title]           …                 │   Vem behöver bygglov?   │
    ul                                                      │   Så ansöker du          │
      Vem behöver bygglov?                                  │     Ritningar   (trail)  │
      Så ansöker du                                         │     Avgifter  (current)  │
        Ritningar                                           │   Efter beslutet         │
        Avgifter                                            └──────────────────────────┘
      Efter beslutet
  h2 Vem behöver bygglov? …
```

- **Landmarks:** a `<nav>` named by its title, inside `main` or in an `aside`. One contents list per page.
- **The heading outline:** `h1` (the page), then `h2` "På den här sidan" (the list's title), then the article's `h2` and `h3` sections. The docs site uses the same outline.
- **Reading order is focus order:** the title, then the links in the order of the headings.
- **The list comes first in the DOM,** right after the page's `h1` and lead, so keyboard and screen-reader users meet it before the article (USWDS gives the same advice).
  - In a side column, the inline start keeps the DOM order and the visual order the same.
  - A column at the inline end is acceptable only if it stays first in the DOM, because both start at the top of the article. Never move it after the article to make the visual order match: a keyboard user would then have to pass the whole article to reach it.
- **Below 64rem the list stays in the column above the article, never sticky.** A sticky list on a phone covers the content.

## 6. Visual specification

### 6.1 Parts and the shared rules

| Part                   | Element and class                           | Look                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TableOfContents.Root` | `<nav class="kv-table-of-contents">`        | None. It's a prose boundary: `kv-table-of-contents` joins prose's not-prose lists (Plan 0049)                                                                                                        |
| `.List`                | `<ul class="kv-table-of-contents-list">`    | As `.kv-navigation-list`: a column with a `space-1` gap. A nested list is indented `space-4` (16px), with `space-1` above it                                                                         |
| `.Item`                | `<li class="kv-table-of-contents-item">`    | None                                                                                                                                                                                                 |
| `.Link`                | `<a class="kv-link" href="#id">` in an item | The navigation item rules (`nav-item`): `text` at weight 400, no fill, 16px start and 12px end padding, `radius-md`, `--kv-control-min-block-size`, the control type size, `overflow-wrap: anywhere` |
| The heading being read | `aria-current="location"` on its link       | `nav-item-current`: a solid `primary` fill, an `on-primary` label, weight 600                                                                                                                        |
| The headings above it  | the trail, through `:has()`                 | `nav-item-trail`: `primary-subtle`, weight 600                                                                                                                                                       |
| The title              | The consumer's heading, not a part          | §6.5                                                                                                                                                                                                 |

**Sharing, not redefining.** Each Navigation selector in §8 that styles a list, an item or the trail becomes a list with the TOC's part beside it, for example:

```css
:is(.kv-navigation-item, .kv-table-of-contents-item) > .kv-link:not(.kv-link--service) { … }

:is(.kv-navigation-item, .kv-table-of-contents-item):has(
    > :is(.kv-navigation-list, .kv-table-of-contents-list) CURRENT-LINK
  )
  > .kv-link:not(.kv-link--service) { … }
```

- `CURRENT-LINK` is §12.3's selector. `aria-current="location"` isn't `false`, so it matches.
- There's no horizontal TOC, so the `kv-navigation--horizontal` rules don't take the TOC's classes.
- That's a few selector lists and no new declarations, so it adds no new token or pair, and `theme:check` stays the same.

### 6.2 States

| State                            | Look                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                          | `text`, 400, no fill, no underline                                                                                                                   |
| Hover, active                    | A 2px underline in `text`                                                                                                                            |
| Focus-visible                    | The `.kv-link` ring: 2px `focus-ring`, 2px offset, following the 8px radius. Against the solid fill it's separated by the offset band, as everywhere |
| Current (the heading being read) | The solid `primary` row, `on-primary`, 600                                                                                                           |
| Trail (its parent headings)      | `primary-subtle`, 600                                                                                                                                |
| Nothing current yet              | Every item at rest. That's the state at load, and above the first heading                                                                            |
| Disabled, invalid, loading, open | Not applicable: they're plain links with no states of their own                                                                                      |
| Empty                            | Nothing renders                                                                                                                                      |

### 6.3 Q-C1: the solid fill or the quiet fill for the heading being read

**Decision: the solid fill, shared with Navigation.**

1. **The trail decides it.** The headings above the current one take T3's quiet fill and weight 600. A quiet current item would look the same as its own parent heading: the "B with T3" failure in navigation-link-options.md §12.5. Then current and trail differ only by a faint tint. The solid fill is the only one of the two that stays above its trail without colour, because it's a shape at 3:1 or more.
2. **One language for "you are here".** Solid means "here" and the quiet fill means "on the way", in a navigation and in a contents list alike. A reader learns it once, and the theme shares its rules instead of adding a second current style.
3. **It's a jump, not motion.** The current item changes only when a heading crosses the `offset` line, not continuously.
   - The fill fades in over 120ms only under `prefers-reduced-motion: no-preference`, through the existing `.kv-link` transition. Otherwise it changes at once.
   - Nothing is current until the reader passes the first heading.
4. **Mostly it isn't moving in view.** The component isn't sticky. Above the article, or in a column that scrolls away, the reader mostly sees the current item when they come back to the list, which is when a strong mark helps most.

**The risk.**

- In a sticky side column (the consumer's layout), the block jumps beside the text being read, and the page may already show a solid current page in its Navigation. The public-sector prior art is quieter: USWDS underlines its active link, and GOV.UK has no scroll-spy.
- Test it (§8, task 3). If readers find it distracting, the fallback is the quiet fill for the TOC's current item **with no trail in the TOC**. The TOC's selectors would leave the trail rule, and weight 600 would be the only cue that isn't colour, as B was. That's a maintainer decision after the test, not now.

### 6.4 Levels, indent and the underline

- **The indent is 16px per level at every width,** the shared nested-list rule, and never capped, because the indent is how the level shows without colour. Plan 0049's core nests a skipped level one step, so the indent never jumps two steps.
- **How many levels.** Resident pages list `h2` and `h3`, two levels, because DESIGN.md says resident-facing text stops at `h3`. `h4` is a third level at most. A deeper page should be split, not given a longer list.
- **At 320px past two levels nothing changes.** Each level costs 16px, so a third-level label still has about 228px, or about 25 characters at 16px, before it wraps, and a fourth about 212px. Long Finnish headings wrap through `overflow-wrap: anywhere`, for example "Rakennus- ja toimenpidelupahakemuksen käsittelyaika ja maksut". So the limit is a content rule, not a CSS cap.
- **No underline at rest, and the underline on hover,** as Navigation (S2). Position in a labelled `<nav>` list is the cue (DESIGN.md, Colors), and GOV.UK's contents list doesn't underline its links either. docs-site.md line 456 ("Underlined links") describes the docs site's own list today, and changes when the site adopts TableOfContents.

### 6.5 The title

- **It's a real heading the consumer renders,** at the outline's level, normally `h2`, with the same words as the label: "På den här sidan".
  - **Beside an article** (a side column), use the `heading-4` look: `<Heading level={2} className="kv-heading--heading-4">`, which is 16px, weight 600, serif and `text`. Then it doesn't compete with the article's own `h2` headings.
  - **Above the article,** its level's own look is fine, as with the docs site's 18px "On this page".
- **It's never muted.** It's a heading, not a label (docs-site.md line 456).
- **Spacing:** `space-2` (8px) below it, before the list. `kv-heading` sets no margin, so that's the consumer's.
- **Placement:** directly before the `<nav>`, or inside it through the function child, so they move together. `aria-labelledby` points at its id, and the Root then drops its own `aria-label`.
- **When the item count can be zero** (a CMS page), put the title inside with the function child. An empty list renders nothing, and the title goes with it.

### 6.6 Modes

- **Dark and the contrast themes:** the tokens remap, with the same pairs as Navigation.
- **Forced colours** (shared S4):
  - Fills drop, and labels are `LinkText`.
  - The current link gets a straight `LinkText` bar at the inline start (`::before`, `forced-color-adjust: none`), and the trail keeps weight 600.
  - The ring is `Highlight` and the hover underline stays.
- **RTL:** logical properties, so the indent and the forced-colours bar sit on the right.
- **Compact density** (`kv-compact` from 64rem, for docs and staff manuals): 32px rows with 14px labels. Comfortable is 44px below 64rem and everywhere else.
- **320px, 400% zoom and 1.4.12 text spacing:** rows grow and nothing has a fixed width or is clipped. A long heading wraps (§6.4).
- **Motion:**
  - The component never scrolls the page, and never sets `scroll-behavior`. If the page sets `smooth`, it does so only under `prefers-reduced-motion: no-preference`.
  - The current fill fades over 120ms only under `no-preference`.
- **A sticky column** is the consumer's layout. If they make one:
  - only from 64rem;
  - `offset` equals `scroll-padding-top` on `html`, which equals any sticky header's height;
  - the column must never cover the focused element (2.4.11);
  - a list that can be taller than the viewport gets its own scroll region, focusable and named only while it overflows (DESIGN.md), or the column isn't sticky.

### 6.7 Tokens and contrast

No new token or pair. The pairs are Navigation's, all already in `theme:check`. Ratios are light / dark / light-contrast / dark-contrast:

- `on-primary` on `primary`: 4.70 / 4.70 / 9.89 / 11.14. That's the lowest text pair, and at 14px and weight 600 in compact it is Plan 0047's approval item 3.
- `text` on `primary-subtle`: 16.80 / 14.66 / 18.41 / 15.59.
- `primary` on the plain backgrounds: 3.75:1 or more.
- `focus-ring` on the plain backgrounds.

## 7. Accessibility annotations

Draft input for `table-of-contents.a11y.md` (Plan 0049).

- **Name:**
  - `aria-labelledby` points at the visible title, which is preferred.
  - Otherwise `aria-label` comes from `tableOfContents.label` ("På den här sidan").
  - Never both.
- **Roles:** a `navigation` landmark, native nested lists (the level comes from the nesting), and native links. No `role`, no `tabindex`.
- **State:**
  - `aria-current="location"` sits on exactly one link, the heading being read, and on none before the first heading is passed.
  - The parent headings get no attribute: the trail is visual only.
  - A screen reader says "current location" when it reaches that link. The change isn't announced, because there's no live region and the plan rules one out.
- **Focus:**
  - The component never moves focus.
  - Enter follows the hash natively. The browser scrolls, keeps focus on the link and moves the sequential focus starting point, so the next Tab goes into the section. USWDS moves focus to the section instead. We rely on the native behaviour, and the AT matrix (`pending`) checks it in each browser and screen-reader pair.
- **Keyboard** (from the plan; native focus, no arrows, no shortcuts):

  | Key               | Context               | Action                                                                           |
  | ----------------- | --------------------- | -------------------------------------------------------------------------------- |
  | Tab               | before or in the list | Moves to the next link, nested ones in DOM order included                        |
  | Shift+Tab         | on a link             | Moves to the previous link, then out of the contents                             |
  | Enter             | on a link             | Follows the hash: the page scrolls, and the next Tab continues after the heading |
  | Arrows, Home, End | on a link             | Not handled                                                                      |

- **Targets:** rows are 44px (32px in compact) and full width: at least 24 × 24px (2.5.8), and 2.5.5 in comfortable.
- **WCAG SCs:** 1.3.1, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 1.4.12, 2.4.1, 2.4.3, 2.4.4, 2.4.5, 2.4.6, 2.4.7, 2.4.11, 2.5.8, 3.2.1, 4.1.2. The component is designed to meet WCAG 2.2 AA. Nothing has been tested yet, and the manual AT matrix is `pending`.

## 8. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`. No blocker. Q-C1's distraction risk goes to the usability test.
- [x] Contrast: no new pair, and Navigation's pairs are already in `theme:check`.
- [x] Usability test plan written. Result: `pending`.

### Usability test plan (pending)

- **Participants:**
  - 6 to 8 residents, including:
    - readers with attention difficulties (ADHD) and with dyslexia;
    - someone using a screen magnifier at 200–400%;
    - a screen-reader user (NVDA or VoiceOver);
    - a Windows contrast-theme user;
    - people with low digital confidence;
    - second-language readers of Finnish and Swedish.
  - 3 staff in compact density.
- **Tasks:**
  1. "Go to the part about the fees." Measure first-click success, and whether they used the list or scrolled.
  2. After scrolling: "Which part are you reading now?"
  3. Read a long section with the list in a sticky side column (64rem), then "Did anything on the page pull your attention while you read?" This is Q-C1's risk. Run it with the solid fill, then with the quiet fallback.
  4. Keyboard: Tab into the list, Enter on a link, then Tab again. Where does focus go?
  5. With a screen reader: find the contents by landmark, and say which section is current.
  6. Tasks 1 and 2 again in forced colours.
- **Measure:** success, time, wrong answers about the current section, distraction reports, and a preference question only at the end.

## 9. DESIGN.md wording (for engineering, on top of Plan 0047's)

Apply these after 0047's wording (navigation-link-options.md §14).

**Front matter, `nav-item`.** Add one comment line under 0047's comment:

```yaml
# A table of contents (kv-table-of-contents) uses the same item, current and trail looks.
```

**The semantic token table: the "Use" cells.**

- `primary`: "Primary button background, selected state, the current navigation item's fill and the table of contents' current heading, info alert bar and icon"
- `primary-subtle`: "The navigation and table-of-contents trail (the current item's ancestors), secondary button hover, selected rows, info alerts"

**Colors, the Navigation rule (0047's text).** Change the opening "**Navigation** (`Navigation.Root`) may drop the underline" to "**Navigation** (`Navigation.Root`, and `TableOfContents`) may drop the underline".

**Components.** A new bullet after "The service link":

> - **Table of contents** (`TableOfContents`) lists the headings of a long page as plain `#id` links in a named `<nav>`, and uses the navigation item rules: `nav-item` at rest, `nav-item-current` for the heading being read (`aria-current="location"`), and `nav-item-trail` for the headings above it. Nothing is current until the reader passes the first heading. It is never sticky, never smooth-scrolls and never moves focus: where it sits is the page's layout. Its title is a real heading the consumer renders, in `text` and never muted (the `heading-4` look beside an article), and it names the `<nav>` with `aria-labelledby`. Levels indent 16px. Resident pages list `h2` and `h3`, and `h4` at most.

**Components, Prose, line 540.** In "anything inside `kv-not-prose`, `kv-navigation`, `kv-button-group`", insert `kv-table-of-contents` after `kv-navigation`.

**Theming, the parts sentence, line 549.** After "and a navigation `kv-navigation`, `kv-navigation-list` and `kv-navigation-item`", add ", and a table of contents `kv-table-of-contents`, `kv-table-of-contents-list` and `kv-table-of-contents-item`, with `kv-link` on its links".

## 10. Open questions

1. **Q-C1 (§6.3):** the solid fill. It needs the maintainer's approval, with the quiet fill and no trail as the fallback if the test shows distraction.
2. **Should the theme ever style a TOC title?** Not now: the plan rules out a title part. If consumers keep writing the same heading, a `kv-table-of-contents-title` class could follow.
3. **A "back to contents" link after each section** (long resident guidance): out of scope. The browser's Back already returns to the list after a jump.
4. **Northern Sámi:** `se` uses the English placeholder until a native review (`pending`).
5. **The docs site's adoption** (a follow-up in the plan): docs-site.md lines 408 (nothing sticky) and 456 (underlined links) then change.
