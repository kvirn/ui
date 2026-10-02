# Design spec: Panel

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-02
- **Plan:** to be written (links this spec in its Design section) · **Related ADRs:** ADR-0013, ADR-0015, ADR-0018, ADR-0020 (amended by the new ADR below), ADR-0022, ADR-0028, ADR-0039. **New ADR to draft** (main session, status _Proposed_, next free number, likely ADR-0044): "Panel is the level 1 container, and Card is level 2 only"
- **Type:** new component (headless, no behaviour) + default-theme styling + a breaking change to Card's modifier classes + DESIGN.md changes

The component is decided by the maintainer, and this spec doesn't reopen it:

- `Panel` (also `Panel.Root`) and `usePanel()`, which returns `rootProps`. One part.
- It renders `<div class="kv-panel">` by default. `render` changes the element (`<section aria-labelledby>`, `<aside aria-labelledby>`, `<nav aria-labelledby>`, `<li>` …). Children pass through.
- No Header, Body or Footer, no title, no behaviour, no role, no ARIA and no strings.
- Choices are modifier classes on the Root (ADR-0013), not props.
- A Panel is a **region** of the page, elevation level 1. A Card is an **object** on the page, elevation level 2. Card loses `kv-card--surface` and `kv-card--canvas`.

This spec decides the **default theme's look and classes**, the change to Card, the contrast coverage, the "which one" guidance, the stories, and every reference that has to change.

## 1. Brief

- **Users:** both.
  - Residents see panels as sidebars ("Contact us" next to a service page), as bands of related content ("News" under the main text), and as header and footer bands.
  - Staff see panels every day as the sidebar and the work area of a case tool, in compact density.
  - Adopters' developers choose between Panel, Card and a raw token. They've had one container (Card) for two jobs, and a sidebar drawn as a "card on `surface`" looked like an object.
- **Hardest-case users:**
  1. A screen-reader user who navigates by landmarks. A `Panel` must never add a landmark they didn't ask for, and a named one must be worth jumping to.
  2. A Windows Contrast Themes user, who has to see where the sidebar ends and the main content starts when every surface becomes `Canvas`.
  3. A resident at 400% zoom (320 CSS px) in Finnish, for whom the sidebar stacks under the main content and the padding eats the line length.
- **Job to be done:** When I lay out a page, I want one container that sets a region apart (a sidebar, a band) without making it look like a clickable box, so the page's structure is clear and the colours stay inside `theme:check`.
- **Context:** any device. Residents: rare, often stressed visits. Staff: daily, desktop, often `kv-compact`.
- **Constraints:** headless parts ship no CSS (hard rule 5). Choices are classes and `data-*` is only state (ADR-0013). Only DESIGN.md tokens. Breaking change to Card while the packages are unreleased (`0.0.0`, and `.changeset/card.md` is still pending).
- **Success criteria:**
  - 0 axe violations in every Panel story, in all four themes, RTL and forced colours.
  - No horizontal scroll at 320px with the Finnish fixture. Nothing is clipped under the 1.4.12 overrides.
  - The Panel's edge is visible on all four sides in forced colours (e2e).
  - A default `Panel` exposes no role in the accessibility tree (a11y snapshot).
  - Docs, stories and DESIGN.md use one decision table (§6.9), word for word.
- **Evidence:** none from users.
- **Assumptions and research questions:**
  - Assumption: users read a square region with no edge as "part of the page" and a rounded card with an edge as "a thing", and nobody tries to click a panel. → RQ: in the usability test (§8), does anyone try to click or select a Panel?
  - Assumption: a sidebar that's only 1.06:1 from the page in the light themes (and in light-contrast) is still found, because of its position, its heading and its landmark. → RQ: do light-contrast users notice where the sidebar ends, without an edge? (Open question 1.)

## 2. Prior art

| Source                                                                                                                                                        | What we reuse                                                                                                                 | What we change and why                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| DESIGN.md Elevation, level 1 (`surface`, `border-subtle`, no shadow, "Panels, sidebars")                                                                      | `surface` as the default, no shadow, square                                                                                   | The edge is a 1px **transparent** border, `CanvasText` in forced colours (§6.4). The Elevation table changes to say so                            |
| KvirnUI Card (`docs/design/card.md`, ADR-0020, ADR-0022)                                                                                                      | One part with `render`, class-based choices, the padding steps and their responsive and compact behaviour, never clipping     | No radius, no parts, no padding model for parts, no full-bleed corners. Not a prose boundary (§6.6)                                               |
| [Aksel (NAV, NO) `Box` primitive](https://aksel.nav.no/komponenter/primitives/box)                                                                            | A plain layout container whose background and padding come from tokens                                                        | Named steps instead of raw spacing steps, and only two surfaces, both in `theme:check`. No border, radius or shadow choices, which belong to Card |
| [HTML-AAM: `section`](https://www.w3.org/TR/html-aam-1.0/#el-section) and [APG Landmark Regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/) | A `<section>` without an accessible name maps to `generic`, not `region`. Landmarks should be few, named and worth jumping to | The default element is a `<div>`, so `Panel` never pretends to be a landmark. The consumer opts in with a named `panel`, `aside` or `nav`         |
| Docs site sidebar (`docs/design/docs-site.md`)                                                                                                                | A `surface` sidebar with one hairline on the edge that meets the content                                                      | The theme draws no hairline. The consumer colours one edge of the transparent border if they want it (§6.4)                                       |

No APG pattern: a panel isn't a widget.

## 3. Flow

A panel has no flow. Its "unhappy paths" are layout conditions:

- **Narrow viewport:** a sidebar stacks after the main content in DOM order, so reading order equals visual order at 320px (1.3.2). The layout grid is the consumer's.
- **Long content:** Finnish compounds wrap (`overflow-wrap: break-word`), and prose inside hyphenates (§6.3).
- **Empty:** the consumer doesn't render the Panel. An empty Panel still has padding and a surface, which is a consumer bug the docs warn about.
- **Panel on the same surface:** a `surface` Panel on a `surface` parent draws nothing but padding. That's allowed, and it's what makes the colour survive if the Panel is moved.

## 4. Content

**Component strings:** none. Panel renders no text.

**Docs copy** (the first sentence of `panel.md` and the Storybook Docs page, so nobody expects a `<section>` element):

> A plain container for a region of the page, such as a sidebar or a band of content. It renders a `<div>`. To make it a landmark, render it as a `<section>`, `<aside>` or `<nav>` with a name.

**Story fixture strings** go in `apps/storybook/src/components/panel/panel.fixture.tsx`, with keys local to the file and a value in all six locales (storybook-presentation.md §4). `fi` here is a designer draft for length checks only. `fi`, `nb`, `nn` and `se` need a translator, and `se` falls back to `en` with `lang="en"` until it's reviewed.

- The `contact.*` strings **move** from `card.fixture.tsx` to the Panel fixture unchanged (`contact.heading`, `contact.phone`, `contact.hours`, `contact.email`, values as in `card.md` §4).
- Example B reuses the Card fixture's `NewsList` (its strings stay in `card.fixture.tsx`).
- Example C reuses the Card fixture's `CaseCard`, and adds:

| Key                     | en                       | sv                       | longest: fi (draft)     | Element                      |
| ----------------------- | ------------------------ | ------------------------ | ----------------------- | ---------------------------- |
| `caseDetails.heading`   | Case details             | Ärendeuppgifter          | Asian tiedot            | h2                           |
| `caseDetails.number`    | Case number              | Ärendenummer             | Asianumero              | dt (value `BAB-2026-004512`) |
| `caseDetails.received`  | Received                 | Inkom                    | Vastaanotettu           | dt (value: `<time>`, `Intl`) |
| `caseDetails.type`      | Type of grant            | Typ av bidrag            | Avustuslaji             | dt                           |
| `caseDetails.typeValue` | Housing adaptation grant | Bostadsanpassningsbidrag | Asunnonmuutostyöavustus | dd                           |
| `caseDetails.officer`   | Case officer             | Handläggare              | Asian käsittelijä       | dt (value: a fixture name)   |

## 5. Structure

Reading order equals DOM order equals visual order. Panel adds no landmark and no heading.

**Example A, sidebar text block** (moved from Card's Example A):

```
main
  h1 …, the service's own content
aside.kv-panel.kv-prose[aria-labelledby=contact-heading]   (complementary "Contact us")
  h2#contact-heading  Contact us
  p  Call the customer centre on …
  p  We answer Monday to Friday, …
  p > Link  Email the customer centre
```

**Example B, a band of cards** (a Card on a Panel keeps its default look):

```
div.kv-panel                       (no landmark: a visual band only)
  h2  News
  ul[role=list]  (story CSS grid, as in card.md Example C)
    li.kv-card …  ×3                 (default surface-raised, border, lg radius)
```

**Example C, staff case view** (`kv-compact`; the tool's frame is `surface` and the work area is `canvas`):

```
div.kv-panel.kv-panel--padding-none.kv-compact      (frame; story grid: 1 column, from 64rem 15rem + 1fr)
  aside.kv-panel.kv-prose[aria-labelledby=case-details-heading]   (complementary "Case details")
    h2  Case details
    dl  Case number / Received / Type of grant / Case officer
  div.kv-panel.kv-panel--canvas                     (work area, no landmark)
    CaseCard: div.kv-card > h2 "Case BAB-2026-004512", p, nested div.kv-card.kv-card--radius-md
```

The sidebar and the frame share `surface`, so the sidebar draws only its padding. The canvas work area is what shows the split.

**Per breakpoint:**

| Width | Panel padding (`md`) | Example A sidebar                                    | Example C                                                  |
| ----- | -------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| 320px | 16px                 | Under the main content, full width                   | Sidebar above the work area (DOM order), both full width   |
| 40rem | 24px                 | Same                                                 | Same                                                       |
| 64rem | 24px (16px compact)  | Beside the content on the inline end (consumer grid) | Sidebar 15rem on the inline start, work area fills the row |

At 320px, a Panel inside a 16px page gutter has a text column of 320 − 32 − 2 − 32 = **254px**, the same as a card. A full-bleed Panel (no gutter) has 320 − 2 − 32 = **286px**.

## 6. Visual specification

### 6.1 Class API

The Root renders `kv-panel`. Every choice is a modifier class next to it (ADR-0013). Without one, the default (**bold**) applies. A panel has no state, so no `data-*`.

| Classes                                                        | Values (default **bold**)    | Why                                                                                                                                                                                                                       |
| -------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kv-panel--surface`, `kv-panel--canvas`                        | **`surface`**, `canvas`      | `surface` is level 1 by definition. `canvas` is level 0: a region that reads as the page inside a `surface` frame or band. `kv-panel--surface` sets the default explicitly, so markup can say it and a CMS can offer both |
| `kv-panel--padding-none`, `kv-panel--padding-sm`, `-md`, `-lg` | **`md`**, `none`, `sm`, `lg` | Card's named steps (§6.2), so a panel's content edge and a card's line up. `none` is for a frame whose children pad themselves, or for full-bleed media                                                                   |

**Not panel surfaces:** `surface-raised` (that's level 2, a card: a raised, square box with no edge would read as a broken card), `primary-subtle` and the status `-subtle` backgrounds (status belongs to a future Notification with a bar, an icon and a heading, never colour alone, 1.4.1).

**No site-wide default properties** in this version (Card has `--kv-card-padding-default` and `--kv-card-radius-default`). The explicit `--surface` and `--padding-md` classes leave room to add one later without new classes (open question 4).

### 6.2 Padding

The same steps as Card, as panel tokens (aliases of spacing steps, no new values):

| Step     | Below `40rem`    | From `40rem`     | `kv-compact` from `64rem` |
| -------- | ---------------- | ---------------- | ------------------------- |
| `none`   | 0                | 0                | 0                         |
| `sm`     | `space-3` (12px) | `space-3` (12px) | `space-3` (12px)          |
| **`md`** | `space-4` (16px) | `space-6` (24px) | `space-4` (16px)          |
| `lg`     | `space-6` (24px) | `space-8` (32px) | `space-6` (24px)          |

- Tokens: `--kv-panel-padding-sm`, `--kv-panel-padding-md` and `--kv-panel-padding-lg` on `:root`, redefined in the `40rem` media query and in the compact rule at `64rem`, exactly as `--kv-card-padding-*` are. Separate names, so a site can change one container's steps without the other (open question 3).
- Per panel: `--kv-panel-padding`, set by the Root from the class. The Root always sets it, so a nested panel never inherits its parent's step.
- `kv-compact` works on any ancestor or on the Panel itself.
- Padding is on all four sides. Panel never centres its content or limits its width: a band that holds a reading column puts the column inside (`max-inline-size: 45rem` or prose's `70ch`) in the consumer's layout.

### 6.3 Root

| Property       | Value                                                                                                                                                                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout         | `display: block` (so a Panel rendered as `<li>` draws no marker), `box-sizing: border-box`, `min-inline-size: 0`, `max-inline-size: 100%`. No width, no height, no margin, no `gap`, no grid or flex                                                                              |
| Surface        | `background-color: var(--kv-color-surface)`, or `canvas` with the class. `color: var(--kv-color-text)`, set together, so text always pairs with the surface                                                                                                                       |
| Edge           | `border: var(--kv-border-width) solid transparent` on all four sides (§6.4). The background paints under it (`background-clip` stays `border-box`), so there's no 1px gap between stacked panels                                                                                  |
| Corners, depth | `border-radius: 0`. No shadow. No transition                                                                                                                                                                                                                                      |
| Padding        | `padding: var(--kv-panel-padding)`                                                                                                                                                                                                                                                |
| Text           | `overflow-wrap: break-word` (inherited, and it doesn't change a table's min-content width). **No `hyphens`**: a panel can hold navigation, forms and tables, and hyphenation stays a prose and card feature (ADR-0028). Put `kv-prose` on the Panel or inside it for running text |
| Overflow       | Never set. No `overflow`, `clip-path` or fixed size, so a child's focus ring is never clipped (2.4.11, 2.4.13) and text spacing never cuts text (1.4.12)                                                                                                                          |
| Child margins  | `margin-block-start: 0` on the first child and `margin-block-end: 0` on the last, at zero specificity (`:where()`), so the padding is the real edge and the consumer's CSS still wins                                                                                             |
| Media          | Direct `img`, `video`, `svg` (not `.kv-icon`) and `picture > img` children: `max-inline-size: 100%`, `block-size: auto`, at zero specificity, so a wide image never scrolls the page at 320px (1.4.10). No radius                                                                 |

### 6.4 The edge: transparent, and why

**Decision: the 1px border is `transparent` in all four themes and `CanvasText` in forced colours.** No hairline at level 1 by default. DESIGN.md's Elevation table changes to match (§9).

Why not the `border-subtle` hairline the Elevation table lists today:

- **Region versus object.** A square box with a hairline on four sides reads as a card without corners. The point of splitting Panel from Card is that a region doesn't look like a thing you can pick up or click.
- **Bands and sidebars meet edges.** A full-bleed band would draw lines along the viewport's sides, and stacked panels would draw a 2px line between them. A sidebar only needs a line where it meets the content, if anywhere.
- **It doesn't carry meaning anyway.** The hairline is decorative (1.18–1.36:1 in the standard themes) and 1.4.11 doesn't apply to a region. The region is identified by its position, its heading and, where it's worth it, its landmark.

What we keep and how it degrades:

- **Forced colours:** every surface becomes `Canvas`, so `surface` and `canvas` look the same. The explicit rule `@media (forced-colors: active) { .kv-panel { border-color: CanvasText } }` draws the edge on all four sides (DESIGN.md: every surface keeps a 1px border). The rule is explicit instead of relying on the browser forcing `transparent`, so the e2e test can assert it.
- **One edge, by the consumer:** because the transparent border is already there, a consumer colours one side without moving anything: `border-inline-end-color: var(--kv-color-border-subtle)` for a sidebar next to the content (like the docs site). That's a semantic token, so it follows every theme, it's 4.68–6.42:1 in the contrast themes, and `CanvasText` in forced colours. The docs show it. There's no class for it in this version (open question 2).
- **Contrast themes, the cost:** `surface` on `canvas` is 1.06:1 in light-contrast and 1.10:1 in dark-contrast, the same as the standard themes, so a sidebar there has no visible edge unless the consumer adds one. Cards there have a 4.68–6.42:1 edge. That's acceptable for WCAG (decorative), but a user who asked for more contrast may expect more edges. Open question 1 proposes a fix and asks the maintainer.

### 6.5 Contrast and `theme:check`

A Panel is drawn on `surface` or `canvas`. Everything a user reads or operates on it is already in `contrast-requirements.ts` through `plainBackgrounds` (`canvas`, `surface`, `surface-raised`). **No new pair is needed, and none of these may be removed.** The comment above `plainBackgrounds` should name panels (pages, panels, cards, popups, dialogs).

| Pair (foreground on `surface` / `canvas`)                  | Minimum              | light                                                    | dark        | light-contrast | dark-contrast | In `contrast-requirements.ts` |
| ---------------------------------------------------------- | -------------------- | -------------------------------------------------------- | ----------- | -------------- | ------------- | ----------------------------- |
| `text`, `heading`                                          | 4.5:1 (7:1 contrast) | 17.90/19.05                                              | 17.90/19.61 | 19.61/20.86    | 19.05/20.86   | Yes (`textPairs`)             |
| `text-muted`                                               | 4.5:1 (7:1)          | 5.84/6.21                                                | 5.86/6.42   | 10.21/10.86    | 13.04/14.28   | Yes                           |
| `link`                                                     | 4.5:1 (7:1)          | 5.55/5.91                                                | 6.64/7.27   | 9.29/9.89      | 10.17/11.14   | Yes                           |
| `link-hover`                                               | 4.5:1 (7:1)          | 6.69/7.12                                                | 8.98/9.84   | 11.89/12.65    | 12.75/13.97   | Yes                           |
| `danger`, `success`, `warning` (text, lowest on `surface`) | 4.5:1 (7:1)          | 5.70                                                     | 8.48        | 7.73           | 11.28         | Yes                           |
| `border-control`, `secondary`                              | 3:1                  | 4.68/4.98                                                | 3.83/4.19   | 10.21/10.86    | 13.04/14.28   | Yes (`nonTextPairs`)          |
| `focus-ring`                                               | 3:1                  | 4.42/4.70                                                | 6.64/7.27   | 9.29/9.89      | 10.17/11.14   | Yes                           |
| `primary` (fill, selected and current indicators)          | 3:1                  | 4.42/4.70                                                | 4.05/4.44   | 9.29/9.89      | 10.17/11.14   | Yes                           |
| `primary-hover` (hovered primary fill)                     | 3:1                  | 5.55/5.91                                                | 3.23/3.53   | 11.89/12.65    | 12.75/13.97   | Yes (`canvas`, `surface`)     |
| `danger-hover` (hovered danger fill)                       | 3:1                  | 7.73/8.23                                                | 11.28/12.35 | 11.28/12.00    | 14.21/15.57   | Yes                           |
| Tinted button edges (ADR-0026)                             | 3:1                  | measured by `theme:check` on all three plain backgrounds |             |                |               | Yes (button-edge check)       |

Measured on 2026-10-02 with `resolveThemeColors()` and `contrastRatio()` from `packages/theme/src` against the current `theme.css`. Lowest on a Panel: `primary-hover` on `surface` in dark (3.23:1), and `border-control`/`secondary` on `surface` in dark (3.83:1).

**`surface-raised` pairs stay required.** After Card loses its surface classes, `surface-raised` is still the background of every card, popup, dialog and secondary button.

**Decorative, not enforced** (for the docs and the research question, not for `theme:check`):

| Boundary                                                             | light       | dark        | light-contrast | dark-contrast |
| -------------------------------------------------------------------- | ----------- | ----------- | -------------- | ------------- |
| `surface` on `canvas` (a panel on the page)                          | 1.06        | 1.10        | 1.06           | 1.10          |
| `surface-raised` on `surface` (a card on a panel)                    | 1.06        | 1.08        | 1.06           | 1.08          |
| `border-subtle` on `surface` / `canvas` (an edge a consumer colours) | 1.18 / 1.26 | 1.24 / 1.36 | 4.68 / 4.98    | 5.86 / 6.42   |

### 6.6 Prose and panels

A Panel is **not a prose boundary**. It's a region of the page, so its content is the page's content.

| Case                               | Result                                                                                                                                                                                                                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kv-prose` on a Panel (Example A)  | Its content is prose. Fine for a sidebar. The Panel keeps its full width (its `max-inline-size: 100%` wins over prose's `70ch`). **For a 70ch reading column in a band, put `kv-prose` on an element inside**                                                                                        |
| A Panel inside prose               | Its descendants stay prose-styled. Its own element gets prose's block margins only: **`.kv-panel` joins the "margins only" list** in `theme.css` (next to `kv-card`, `kv-field`, `kv-fieldset`), not the boundary list. So a Panel rendered as `<li>` or `<aside>` isn't styled as a prose list item |
| A Card inside a Panel inside prose | The card is a boundary, as today                                                                                                                                                                                                                                                                     |

### 6.7 What changes in Card

Card is level 2 only.

| Card                                                                                          | Before                                                             | After                                                                                                                                                         |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surface                                                                                       | `surface-raised` by default, `kv-card--surface`, `kv-card--canvas` | **Always `surface-raised`.** Both classes and their two rules in `theme.css` are removed. No replacement class                                                |
| Radius (`kv-card--radius-lg                                                                   | md                                                                 | none`), padding (Root and per part), `kv-card--dividers`, `--kv-card-padding-default`, `--kv-card-radius-default`                                             | as today | **Unchanged** |
| Border, never interactive, never clips, full-bleed corners, prose boundary, compact step-down | as today                                                           | **Unchanged**                                                                                                                                                 |
| A card on a Panel (`surface` or `canvas`)                                                     | –                                                                  | The default raised look. Nothing to add                                                                                                                       |
| A card nested in a card (Example D in `card.md`)                                              | `kv-card--surface kv-card--radius-md`                              | `kv-card--radius-md` only. The inner card is `surface-raised` like the outer one, and its edge is the hairline. Grouping comes from its `h3`, as before       |
| "A text block on a surface in a sidebar" (`card.md` Example A)                                | `Card.Root` with `kv-card--surface`                                | **`Panel`** rendered as a named `<aside>`. It loses the `lg` radius and the hairline. A consumer who wants a rounded raised block uses a default Card instead |
| "A card that looks part of the page on a `surface` panel" (`kv-card--canvas`)                 | `Card.Root` with `kv-card--canvas`                                 | `Panel` with `kv-panel--canvas` if it's a region, or a default Card if it's an object                                                                         |

**Release:** nothing is published (`0.0.0`), and `.changeset/card.md` is still pending. So amend `.changeset/card.md` (remove the two classes from its theme bullet) and add `.changeset/panel.md` (`@kvirn-ui/react` minor: Panel and `usePanel`; `@kvirn-ui/theme` minor: Panel styles and tokens). Whether the commit is marked `!` is the main session's call: there's no published API to break.

### 6.8 States

| Part | default | hover | focus-visible | active | disabled | invalid | loading | selected / open | empty                          |
| ---- | ------- | ----- | ------------- | ------ | -------- | ------- | ------- | --------------- | ------------------------------ |
| Root | §6.3    | none  | none          | none   | none     | none    | none    | none            | The consumer doesn't render it |

A panel is never interactive: no hover, no pointer cursor, no shadow. Children keep their own states.

### 6.9 Panel, Card or a surface token: when to use which

This table is written to be reused **word for word** in `panel.md`, `card.md`, the Panel and Card Docs pages, Foundation/Borders and elevation, and DESIGN.md (Components).

| You're building                                                                                                   | Use                                                                                                    | Why                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| A region of the page next to or between other content: a sidebar, a filter panel, a band of related content       | `Panel`. It's `surface`, square, with no visible edge                                                  | It's part of the page's layout, not a thing on the page (elevation level 1)                              |
| A region that should look like the page again inside a `surface` region: the work area next to a staff sidebar    | `Panel` with `kv-panel--canvas`                                                                        | It goes back to the page colour without drawing a box (level 0)                                          |
| One self-contained thing people read, compare or act on as a unit: a service, a news item, a case, a contact card | `Card`. It's `surface-raised`, with a hairline edge and rounded corners                                | The edge and the corners say "these belong together" (level 2)                                           |
| Several of those things                                                                                           | Cards in a list (`<ul>`, each card `render={<li />}`), on the page or on a Panel                       | One thing per card. A Panel around them is optional                                                      |
| A background inside your own component: a table header row, a code block, a read-only field                       | The token in your CSS, `var(--kv-color-surface)`, with the `text` tokens on it                         | It isn't a region or a thing, so it isn't a container. The `text` tokens keep `theme:check`'s pairs true |
| One thing with several independent actions: a user with Edit and Delete, a settings block                         | `Panel`. A Card has one primary destination, and here the controls are the reason the container exists | If you can't name one destination, it isn't a card                                                       |
| A form section or a group of fields                                                                               | Neither. A heading or a `<fieldset>` with a legend, on the page or in a Panel                          | A card would make "Account" look like an entity and add a level of hierarchy                             |
| A status message: an error, a warning, a confirmation                                                             | Neither. A notification, with a `-subtle` background, a bar, an icon and a heading                     | Status is never shown by a surface colour alone (1.4.1)                                                  |

Rules that go with it: a Card on a Panel keeps its default look. Don't put a Panel inside a Card (a region inside a thing turns the ladder upside down). Nest Panels only to switch between `surface` and `canvas`.

**When unsure, use the simpler container.** A Card is for one identifiable thing, not a box with a border, a background or padding. Before using Card, ask in order:

1. Can you name the thing it represents (a product, a person, an article, a case, a search result)? If not, use a Panel or plain HTML.
2. Does the content represent exactly one thing? If not, use a Panel.
3. Is there one primary destination or action? If the controls are the reason the container exists, use a Panel.
4. Is it a form section, a field group, a toolbar, a button group or a layout wrapper? Never a Card.
5. Don't nest Cards unless the inner one is a thing in its own right. Don't use Cards to create visual hierarchy.

These are guidance in the docs. They don't change what Card does: a clickable whole card, and a choice of border, shadow or flat, stay out of scope (ADR-0020, DESIGN.md: a card is never interactive and has no shadow).

### 6.10 Modes

- **Dark, light-contrast, dark-contrast:** only the tokens change. In dark, `surface` (`neutral-950`) is a step lighter than `canvas` (`black`), and a card on it a step lighter again (`neutral-900`).
- **Forced colours:** `surface` and `canvas` both become `Canvas`. The Panel's border is `CanvasText` on all four sides (explicit rule, §6.4). A Card inside keeps its own `CanvasText` border, so nested boxes are told apart by their edges. No `forced-color-adjust: none`.
- **RTL:** logical properties only (`padding`, `border`, and a consumer's `border-inline-end-color`). A sidebar placed on the inline start or end flips with `dir`. Nothing to mirror.
- **Motion:** none.
- **320px, 400% zoom, 1.4.12:** no fixed sizes, no overflow, `min-inline-size: 0` so a panel in a grid can shrink, `overflow-wrap: break-word`, and media capped at 100%. Text spacing grows the height. `padding-none` with a focusable child flush to a viewport edge would push the ring's outer 4px off-screen: the docs say `none` is for frames whose children pad themselves, and for media.
- **Density:** `md` and `lg` step down in `kv-compact` from `64rem` (§6.2).
- **Sticky or scrolling sidebars** are the consumer's. A sticky one needs `scroll-padding` (2.4.11). One that scrolls on its own goes in a `kv-scroll-region` with a name and `tabindex="0"` (keyboard scrolling), never `overflow` on the Panel.

### 6.11 New or changed tokens

| Token                            | Value per theme                                                      | Contrast           | ADR                              |
| -------------------------------- | -------------------------------------------------------------------- | ------------------ | -------------------------------- |
| `--kv-panel-padding-sm`          | `space-3` (all)                                                      | n/a                | New ADR (aliases, no new values) |
| `--kv-panel-padding-md`          | `space-4`; `space-6` from `40rem`; `space-4` in compact from `64rem` | n/a                | New ADR                          |
| `--kv-panel-padding-lg`          | `space-6`; `space-8` from `40rem`; `space-6` in compact from `64rem` | n/a                | New ADR                          |
| `--kv-panel-padding` (per panel) | From the padding class                                               | n/a                | New ADR                          |
| Colour tokens                    | none new                                                             | §6.5: no new pairs | –                                |

## 7. Accessibility annotations

Draft input for `packages/react/src/panel/panel.a11y.md`.

- **APG pattern:** none. A panel isn't a widget. **Deviations:** none.
- **Element and role:** `<div>` → `generic` by default. No `role`, `aria-*`, `tabindex`, `inert`, `aria-hidden`, click handler, heading, live region or text, ever. Attributes (`id`, `lang`, `aria-*`, `data-*`) pass through. `className` joins `kv-panel` (ADR-0015).
- **Landmarks are opt-in, and named.**
  - `render={<aside aria-labelledby={headingId} />}`: complementary content (Example A, contact; Example C, case details).
  - `render={<section aria-labelledby={headingId} />}`: a region worth jumping to. A `<section>` without a name is `generic` (HTML-AAM), so it's useless as a landmark.
  - `render={<nav aria-labelledby={headingId} />}`: a sidebar of navigation.
  - The default `<div>`: a purely visual band (Example B).
  - Keep landmarks few. Never make every band a landmark. `header` and `footer` at the top level become `banner` and `contentinfo`, so only one of each.
- **Headings are the consumer's.** `h2` for a sidebar or a band under the page's `h1`. Panel can't know the level (1.3.1, 2.4.6).
- **Nesting:** a Card on a Panel, yes. A Panel inside a Card, no. A Panel inside a Panel only to switch surface. Landmarks shouldn't nest more than the page outline needs.
- **Reading and focus order:** the children's DOM order. A sidebar that sits on the inline end at `64rem` comes after the main content in the DOM (1.3.2, 2.4.3). Never reorder with `order` or grid placement against the DOM.
- **Focus:** Panel never moves focus, never traps it and never clips a ring (no `overflow`, §6.3).
- **Announcements:** none.
- **Language:** `lang` on any panel in another language (3.1.2).
- **Visual:** text and control pairs on both surfaces are in `theme:check` (§6.5). The region's own boundary is decorative. Forced colours draw it. Reflow and text spacing as in §6.10.
- **WCAG SCs of note:** 1.3.1, 1.3.2, 1.4.1, 1.4.3, 1.4.6 (contrast themes), 1.4.10, 1.4.11, 1.4.12, 2.4.1 (named landmarks help bypass), 2.4.3, 2.4.11, 2.4.13, 4.1.2.

**Keyboard panel** (ADR-0039):

```md
This component has no focusable parts and handles no keys.

Panel is never a Tab stop and never changes the Tab order. Its children handle their own keys.

| Key       | Context                       | Action                                                        | Test                                                          |
| --------- | ----------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| Tab       | Panel with focusable children | Moves through the children in DOM order. The panel is skipped | `panel.e2e.ts › Tab moves through the children in DOM order`  |
| Shift+Tab | Panel with focusable children | Moves back through the children in reverse DOM order          | `panel.e2e.ts › Shift+Tab moves back through the children`    |
| –         | Root                          | No `tabindex` is rendered, so the panel never receives focus  | `panel.test.tsx › rendering › adds no role, ARIA or tabindex` |
```

**Stories** (`Components/Panel`, all with axe, the contract passed as `a11yContract`; no `Keyboard` story, because there's no focusable part):

- `Default`: a Panel with an `h2` and a paragraph.
- `SidebarTextBlock` (Example A), `CardsOnAPanel` (Example B), `StaffCaseView` (Example C, `kv-compact`).
- `Surfaces`: `surface` and `kv-panel--canvas`, each on the page and inside a `surface` frame, labelled with the class as `<code>`.
- `Padding`: `none`, `sm`, `md`, `lg`.
- `OneEdge`: a sidebar with the consumer's `border-inline-end-color: var(--kv-color-border-subtle)` (the documented recipe), in RTL too.
- `SurfaceLayers`: **moved from Card**, with level 1 drawn by a Panel and level 2 by a Card on it.
- `ProseAndPanels`: `kv-prose` on a Panel, a Panel in prose, and a band with `kv-prose` on an inner element.
- `ImageInPanel`: a 640px image fits at 320px.
- `LongFinnishText`, `AllExamples`, `RTL` (en), `ForcedColors`.

**Tests the plan should list:**

- `panel.test.tsx`: one `<div class="kv-panel">`; `className` and a `render` element's class join it; `render` changes the element (`aside`, `section`, `li`); refs reach any element; `usePanel()` returns `{ rootProps: { className: 'kv-panel' } }`; no role, ARIA or `tabindex`; server rendering.
- `theme-css.test.ts`: the Panel rules never set `overflow`, `clip-path`, a fixed height, a radius other than 0 or a shadow; the Root always has a 1px border; the forced-colours rule sets `border-color: CanvasText`; Card has no surface rules left.
- `panel.e2e.ts`: the two keyboard rows; the border is drawn on all four sides in a colour other than the background in forced colours; a11y snapshots (Example A is a named `complementary`; `Default` exposes no landmark); no horizontal scroll at 320px with `fi`; text spacing clips nothing at 320px; a link's focus ring at the edge of a `padding-sm` Panel isn't clipped; axe and overflow in every story and the four themes.

## 8. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`. No blockers. Not applicable: flow, timeouts, announcements, targets (Panel has no controls of its own). Open trade-off: no region edge in the contrast themes (§6.4, open question 1).
- [x] Contrast of every pair a Panel uses measured (§6.5). No new colour and no new pair.
- [x] Usability test plan written. Result: `pending`.

### Usability test plan

- **Participants (6–8):** a screen-reader user (NVDA or VoiceOver), a screen-magnifier user at 400%, a Windows Contrast Themes user, a light-contrast theme user with low vision, a person with a cognitive disability, a second-language reader (Finnish or Swedish), and one or two staff users in compact density.
- **Tasks:**
  1. On a service page (Example A next to the main text), find out when the customer centre answers the phone.
  2. Screen-reader users: get to the contact information without reading the whole page.
  3. In a staff case view (Example C), say who the case officer is, then what happened last in the case.
  4. On a page with a band of news cards (Example B), open the news item about snow clearing.
- **What we measure:**
  - Task completion and time on task.
  - Whether screen-reader users find the named `aside` by landmark, and whether anyone reports noise from landmarks.
  - Whether light-contrast and magnifier users can say where the sidebar ends (RQ, §1).
  - Whether anyone tries to click a panel (it should read as page, not as an object).
- **Result:** `pending`. Assistive-technology testing is also `pending`.

## 9. Every reference that must change

Found with `grep -rn` for `kv-card--surface`, `kv-card--canvas`, `sidebar`, `level 1` and `surface-layers` on 2026-10-02. `borders-elevation.stories.tsx` no longer exists: it's `apps/storybook/src/foundation/borders-elevation.mdx` now (ADR-0041).

**DESIGN.md** (with the new ADR):

- Front matter `components`: add `panel` (`backgroundColor: '{colors.surface}'`, `textColor: '{colors.text}'`, `rounded: '{rounded.none}'`, `padding: 24px`, with the comment "16px below 40rem, and in compact density from 64rem").
- Colors table, Use column: `canvas` "Page background, and a canvas panel (`kv-panel--canvas`)"; `surface` "Panels (`Panel`), sidebars, table headers, code".
- Elevation table: level 1 Border "1px `transparent` (`CanvasText` in forced colours)", Use "Panels, sidebars (`Panel`)"; level 2 Use "Cards (`Card`)". Add a bullet: level 1 has no visible edge, and a consumer may colour the one edge that meets content with `border-subtle`.
- Layout: "Staff tools and the docs site may use a sidebar" gets "(a `Panel`)".
- Components: the intro sentence lists Panel and `docs/design/panel.md`. A new **Panels** bullet (§6.1–6.4 in short, plus the §6.9 table). **Cards** bullet: remove the surface choice ("`kv-card--surface` for a block in a sidebar, `kv-card--canvas` on a `surface` panel"), and "`surface` and `md` for the inner card" becomes "`md` for the inner card". Add "A card on a panel keeps its default look".
- Prose bullet: "A panel in prose gets prose's block margins on its own element, and its content stays prose."
- Theming class list: remove `kv-card--surface`, `kv-card--canvas`; add the part class `kv-panel` and `kv-panel--surface|canvas`, `kv-panel--padding-none|sm|md|lg`.

**Theme package:**

- `packages/theme/theme.css`: header comment line 10 (`kv-card--surface` example → `kv-panel--canvas`); Card section comment line 1473 and the `.kv-card.kv-card--surface` and `.kv-card.kv-card--canvas` rules (lines 1548–1554) removed; a new Panel section with tokens, Root, forced-colours rule; `.kv-panel` in prose's "margins only" list (line 1089).
- `packages/theme/src/contrast-requirements.ts`: no new pairs; the comment on the hovered-button pairs and `plainBackgrounds` names panels.
- `packages/theme/src/theme-css.test.ts`: Panel tests (§7), and Card has no surface rules.
- `packages/theme/README.md` line 22 (part class list: add `kv-panel`), line 29 (`kv-compact`: "less padding in cards and panels"), line 30 (Card bullet: drop the two surface classes), and a new Panel bullet.

**React package:**

- New `packages/react/src/panel/` (`panel.tsx`, `use-panel.ts`, `panel.test.tsx`, `panel.a11y.md`, `panel.md`) and the exports in `packages/react/src/index.ts`.
- `packages/react/src/card/card.tsx` line 81 (JSDoc class list: drop `kv-card--surface`).
- `packages/react/src/card/card.md` line 5 ("a text block in a sidebar" → "an object on the page: …", with a link to Panel), line 10 (class list), lines 17–21 (the `aside` text block example → point to Panel), line 66 (table row removed), line 103 (`mergeProps` example → `kv-card--radius-md`). Add the §6.9 table.
- `packages/react/src/card/card.a11y.md` line 56 ("`h2` for a card in a sidebar" → "on My pages"), and Visual/modes "every card surface (`surface-raised`, `surface`, `canvas`)" → "`surface-raised`, and the surfaces a card sits on".
- `packages/react/src/card/card.test.tsx` lines 373 and 380 (the server-rendering test's class → `kv-card--radius-md`).

**Storybook:**

- `apps/storybook/src/components/card/card.stories.tsx`: line 52 (argTypes description); remove `SidebarTextBlock` (97) and `Surfaces` (133–165); move `SurfaceLayers` (167–237) to Panel; line 383 (`kv-card--surface kv-card--radius-md` → `kv-card--radius-md`); `LongFinnishText` (469, 477), `AllExamplesPage` (488) and `RTL` (511) drop `ContactCard`.
- `apps/storybook/src/components/card/card.fixture.tsx`: `ContactCard` (272–294) and its `contact.*` strings move to `panel.fixture.tsx` as a Panel; `CaseCard`'s nested card (368) → `kv-card--radius-md kv-prose`.
- `apps/storybook/src/components/card/card.e2e.ts`: the "sidebar text block" a11y test (245–259) moves to `panel.e2e.ts`; `sidebar-text-block`, `surfaces` and `surface-layers` leave the story list (271–275).
- `apps/storybook/src/components/button/button.stories.tsx` line 546: the "surface" row of `DepthMatrix` becomes a `Panel` (no `Card.Body`).
- New `apps/storybook/src/components/panel/` (`panel.stories.tsx`, `panel.fixture.tsx`, `panel.e2e.ts`).
- `apps/storybook/src/foundation/borders-elevation.mdx`: the level 1 row (33), the links to `components-card--surface-layers` (38, 75) → `components-panel--surface-layers`, the "Which level to use" table (49: "a block of related cards" stays, add "a `Panel`"), "Give every level from 1 up a border" (56) → "Every level from 1 up has a 1px border: transparent at level 1, except in forced colours", and the §6.9 table.
- `apps/storybook/src/foundation/colors-semantic.tsx` line 53: `surface` "Panels, sidebars, table headers, code" (add `Panel` if the page lists components).
- Optional, not required: `.kv-story-surface` in `preview.css` (66–74), used by `link.stories.tsx` 44 and 159, could become a Panel. It has a radius and a hairline, so it's a look of its own; leave it unless the plan wants it.

**Docs, ADRs, changesets:**

- `docs/design/card.md`: §4 (`contact.*` rows move), §5 Example A (→ Panel) and Example D (nested card class), §6.1 (surface row removed), §6.4–6.5 (the cell headings: a card's own surface is `surface-raised`, and `surface`/`canvas` are where it sits), §6.8 nested cards, §7 stories, §9 open question 4 (answered). A status note that this spec supersedes those parts.
- `docs/adr/0020-card-container.md` Context (line 11) and Decision 5 (line 48): a revision note pointing to the new ADR. ADR-0020 is still _Proposed_, so a "Revised" line is enough.
- `docs/architecture.md` line 105: the example `<Card.Root className="kv-card--surface">` → `<Panel className="kv-panel--canvas">`.
- `.changeset/card.md` line 9: drop `kv-card--surface` and `kv-card--canvas`. New `.changeset/panel.md`.
- `docs/roadmap.md`: a Panel row. `docs/design/README.md`: this spec's row (not added here: the brief limited edits to this file).
- `docs/plans/0007-card.md`: a historical record, left as is.

## 10. Open questions

1. **Region edges in the contrast themes.** With a transparent border, a sidebar is 1.06–1.10:1 from the page in light-contrast and dark-contrast too, while cards there have a 4.68–6.42:1 edge. Option: a semantic token, `--kv-color-border-region`: `transparent` in light and dark, `border-subtle` in the contrast themes, `CanvasText` in forced colours. It's decorative, so not a `theme:check` pair, but it's a new token (ADR, DESIGN.md, and a check that `transparent` passes the raw-colour lint). Recommended if the research question in §1 shows light-contrast users miss the edge. Ship without it now?
2. **A class for one edge** (for example `kv-panel--edge-inline-end`) instead of the documented consumer CSS? It would make the docs site's sidebar a Panel without custom CSS.
3. **Shared padding steps.** `--kv-panel-padding-*` and `--kv-card-padding-*` have the same values. Keep two sets (chosen: a site can change one without the other), or merge into `--kv-container-padding-*` later?
4. **A site-wide default** (`--kv-panel-padding-default`), like Card's? Left out until an adopter asks.
5. **The docs site sidebar** (`apps/docs`, `.docs-sidebar`, padding `space-4 space-3`) is a hand-rolled panel. Move it to `Panel` in a later plan? Its padding doesn't match a step.
6. Noticed, outside the brief: DESIGN.md Colors says hairlines are "1.36–1.96:1", but the measured `border-subtle` in the standard themes is 1.15–1.36:1 (`card.md` §6.5 and §6.5 here). The sentence should be corrected with the next DESIGN.md change.
