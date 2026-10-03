# Design spec: Card

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-01
- **Plan:** [Plan 0007](../plans/0007-card.md)
- **Type:** component default styling (+ component tokens, + one prose change)
- **Revised 2026-10-02 ([Section](section.md), the Section decision, Plan 0018):** Card is elevation level 2 only. `kv-card--surface` and `kv-card--canvas` are removed, so a card is always `surface-raised`. Example A (a text block in a sidebar, and its `contact.*` strings) moved to a `Section`, Example D's nested card is `kv-card--radius-md` only, and the `Surfaces` and `SidebarTextBlock` stories are gone (`SurfaceLayers` moved to Section). Where §4, §5 (Example A and D), §6.1 (the surface row), §6.4, §6.5, §6.8, §7 and §9 (open question 4) of this spec mention a surface choice for a card, the Section spec wins. A card on a Section keeps its default look.

The component is decided in the Card decision: `Card.Root`, `Header`, `Body` and `Footer`, each one `<div>` with its class, `kv-card`, `kv-card-header`, `kv-card-body` or `kv-card-footer`. There's no Title part, no clickable card, and no behaviour, ARIA or strings. This spec decides the **default theme's modifier classes and look**, how prose and Button behave inside a card, and the stories.

## 1. Brief

- **Users:** both.
  - Residents read cards on service pages ("Contact us" beside the text) and on My pages (one card per service).
  - Staff scan cards in dashboards every day.
  - Adopters' developers compose cards.
- **Hardest-case user:** a resident at 400% zoom (320 CSS px) in Finnish, using a screen magnifier, with a footer of two long button labels. Second: a Windows Contrast Themes user who has to see where one card ends and the next begins.
- **Job to be done:** When I put related content on a surface, I want one container that looks right in every theme and at every width, so I don't hand-roll padding, radii and surfaces outside `theme:check`.
- **Context:** any device. Resident use is infrequent and often stressed. Staff use is daily on a desktop, often in compact density.
- **Constraints:** headless parts ship no CSS (hard rule 5). Choices are modifier classes, and `data-*` is only state. Only DESIGN.md tokens. No third-party images (hard rule 7).
- **Success criteria:**
  - 0 axe violations in every story, in all four themes and RTL.
  - No horizontal scroll at 320px with the Finnish fixture.
  - Nothing is clipped under the 1.4.12 overrides.
  - A footer Button's focus ring is fully visible (e2e).
  - The card boundary is visible in forced colours.
- **Evidence:** none from users.
- **Assumptions and research questions:**
  - Assumption: residents read a card's boundary as "these things belong together", but don't need it to find the action. → RQ: do magnifier users at 400% lose the card boundary (1.15–1.36:1 hairline) and mis-associate a footer button with the next card?
  - Assumption: start-aligned footer actions are found faster than end-aligned ones at high zoom. → RQ: tested in the usability plan (§8).

## 2. Prior art

| Source                                                                                       | What we reuse                                                                                       | What we change and why                                                                                                                     |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| DESIGN.md `card`, Elevation level 2, Shapes                                                  | `surface-raised`, 1px `border-subtle`, no shadow, `lg` radius, 24px padding                         | 16px padding below `40rem` and in compact density (§6.2)                                                                                   |
| `theme.css` Button, `kv-button-group`, prose, `kv-compact`                                   | Button group layout in the footer. The density switch. Prose for text in the body                   | Prose stops at a card boundary unless it's turned on inside the card (§6.6)                                                                |
| [Designsystemet Card](https://designsystemet.no/en/components/docs/card/overview) (NO)       | Sections inside the card (`Card.Block`), dividers between sections, media that "extend to the edge" | No `data-color` or tinted variant: status and colour belong to a future Notification. Dividers are opt-in, not default. No whole-card link |
| [GOV.UK responsive spacing](https://design-system.service.gov.uk/styles/spacing/)            | Padding steps that are smaller on small screens                                                     | Our 4px grid tokens and a `40rem` reference point                                                                                          |
| [GOV.UK summary card](https://design-system.service.gov.uk/components/summary-list/)         | A card is plain grouping. Actions are real buttons and links with their own names                   | No grey title bar. Our card has no title part                                                                                              |
| [Inclusive Components: Cards](https://inclusive-components.design/cards/) (Heydon Pickering) | One link per card, in the heading. Decorative images get `alt=""`. Lists of cards are `<ul>`        | No stretched link in this version                                                                                                          |

No APG pattern: a card isn't a widget.

## 3. Flow

A card has no flow of its own. Its "unhappy paths" are content and layout conditions:

- **Long content:** Finnish compounds and long button labels wrap (§6.5).
- **Missing image:** if the image fails to load, the header is empty space only for the image's own `block-size`. The theme sets no fixed height, so nothing reserves a blank box. The consumer's `alt` text shows instead.
- **Empty body:** the consumer doesn't render the part. An empty part still has padding, which is a consumer bug that the docs warn about.
- **Equal-height grids:** footers line up because the body grows (§6.3).

## 4. Content

**Component strings:** none. Card renders no text (Plan 0007 "i18n strings").

**Story fixture strings** go in `apps/storybook/src/components/card/card.fixture.tsx`, with keys local to the file and a value in all six locales (storybook-presentation.md §4). The `fi` strings below are designer drafts for length checks only. `fi`, `nb`, `nn` and `se` need a translator, and `se` falls back to `en` with `lang="en"` until it's reviewed. Times, dates and phone numbers are formatted with `Intl` where they're values.

| Key                      | en                                                                    | sv                                                                       | longest: fi (draft)                                                    | Element                |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------- |
| `contact.heading`        | Contact us                                                            | Kontakta oss                                                             | Ota yhteyttä                                                           | h2                     |
| `contact.phone`          | Call the customer centre on {phone}.                                  | Ring kundcenter på {phone}.                                              | Soita asiakaspalvelukeskukseen numeroon {phone}.                       | p                      |
| `contact.hours`          | We answer Monday to Friday, {open}–{close}.                           | Vi svarar måndag–fredag kl. {open}–{close}.                              | Vastaamme maanantaista perjantaihin klo {open}–{close}.                | p                      |
| `contact.email`          | Email the customer centre                                             | Mejla kundcenter                                                         | Lähetä sähköpostia asiakaspalvelukeskukseen                            | Link (`mailto:`)       |
| `waste.heading`          | Waste collection at Storgatan 12                                      | Sophämtning vid Storgatan 12                                             | Jäteastioiden tyhjennys osoitteessa Storgatan 12                       | h2                     |
| `waste.next`             | Your next collection is on {date}.                                    | Nästa tömning är {date}.                                                 | Seuraava tyhjennys on {date}.                                          | p (`<time>`)           |
| `waste.plan`             | Food waste and residual waste are collected every other week.         | Matavfall och restavfall töms varannan vecka.                            | Biojäte ja sekajäte tyhjennetään joka toinen viikko.                   | p                      |
| `waste.orderExtra`       | Order an extra collection                                             | Beställ extra tömning                                                    | Tilaa ylimääräinen tyhjennys                                           | Button, primary        |
| `waste.pause`            | Pause collection                                                      | Pausa hämtningen                                                         | Keskeytä jäteastioiden tyhjennykset                                    | Button                 |
| `news.heading`           | News                                                                  | Nyheter                                                                  | Ajankohtaista                                                          | h2 above the list      |
| `news.recycling.title`   | New opening hours at the recycling centre                             | Nya öppettider på återvinningscentralen                                  | Kierrätyskeskuksen uudet aukioloajat                                   | h3 > Link              |
| `news.recycling.excerpt` | From 1 November the recycling centre is open until 19:00 on weekdays. | Från 1 november har återvinningscentralen öppet till kl. 19 på vardagar. | Kierrätyskeskus on 1. marraskuuta alkaen auki arkisin kello 19:ään.    | p                      |
| `news.snow.title`        | Winter road maintenance: how we clear snow                            | Vinterväghållning: så plogar vi                                          | Talvikunnossapito: näin aurausjärjestys toimii                         | h3 > Link              |
| `news.snow.excerpt`      | We clear main roads and bus routes first, then residential streets.   | Vi plogar huvudgator och busslinjer först, sedan bostadsgator.           | Auraamme ensin pääkadut ja bussireitit, sen jälkeen asuinkadut.        | p                      |
| `news.grants.title`      | Apply for association grants by 1 December                            | Ansök om föreningsbidrag senast 1 december                               | Hae yhdistysavustusta viimeistään 1. joulukuuta                        | h3 > Link              |
| `news.grants.excerpt`    | Sports and culture associations can apply for grants for next year.   | Idrotts- och kulturföreningar kan söka bidrag för nästa år.              | Urheilu- ja kulttuuriyhdistykset voivat hakea avustusta ensi vuodelle. | p                      |
| `news.published`         | Published {date}                                                      | Publicerad {date}                                                        | Julkaistu {date}                                                       | p > small (`<time>`)   |
| `case.heading`           | Case {caseNumber}                                                     | Ärende {caseNumber}                                                      | Asia {caseNumber}                                                      | h2 (`BAB-2026-004512`) |
| `case.status`            | Housing adaptation grant. Waiting for a decision.                     | Bostadsanpassningsbidrag. Väntar på beslut.                              | Asunnonmuutostyöavustus. Odottaa päätöstä.                             | p                      |
| `case.latest.heading`    | Latest event                                                          | Senaste händelse                                                         | Viimeisin tapahtuma                                                    | h3 (nested card)       |
| `case.latest.text`       | The occupational therapist's certificate arrived on {date}.           | Arbetsterapeutens intyg kom in {date}.                                   | Toimintaterapeutin lausunto saapui {date}.                             | p (nested card)        |

The images are local fixture files (hard rule 7): an illustration of two bins for `waste`, and a photo-like illustration of the recycling centre for `news.recycling`. Both are decorative (`alt=""`) because the heading says what the card is about.

## 5. Structure

Reading order equals DOM order equals visual order. Card adds no landmark or heading.

**Example A, sidebar text block** (Root with plain children, rendered as a labelled `aside`):

```
aside.kv-card.kv-card--surface.kv-prose[aria-labelledby=contact-heading]   (complementary "Contact us")
  h2#contact-heading  Contact us
  p  Call the customer centre on …
  p  We answer Monday to Friday, …
  p > Link  Email the customer centre
```

**Example B, service card on My pages** (parts, full-bleed image, two actions):

```
div.kv-card
  div.kv-card-header.kv-card-header--padding-none > img alt=""
  div.kv-card-body.kv-prose
    h2  Waste collection at Storgatan 12
    p   Your next collection is on <time>…</time>.
    p   Food waste and residual waste …
  div.kv-card-footer.kv-button-group
    Button.kv-button--primary     Order an extra collection
    Button                        Pause collection
```

**Example C, list of news cards:**

```
h2  News
ul[role=list]   (grid: repeat(auto-fill, minmax(min(100%, 18rem), 1fr)), gap space-6; story CSS)
  li.kv-card   (Card.Root render={<li />})
    div.kv-card-header.kv-card-header--padding-none > img alt=""     (first card only)
    div.kv-card-body.kv-prose
      h3 > Link  New opening hours at the recycling centre
      p          From 1 November …
      p > small  Published <time>…</time>
  li.kv-card …  (×2, no image)
```

`role="list"` is there because Safari drops list semantics when the markers are removed. The list layout is story CSS, not a theme class (open question 3).

**Example D, nested card (staff, `kv-compact`):** an outer default card with `h2` "Case BAB-2026-004512" and a status line, and inside its body a card with `kv-card--surface` and `kv-card--radius-md` holding `h3` "Latest event" and one sentence.

**Per breakpoint:**

| Width | Card padding (default) | Footer buttons                                                   | News list |
| ----- | ---------------------- | ---------------------------------------------------------------- | --------- |
| 320px | 16px                   | Stacked, full width, primary on top (`kv-button-group`)          | 1 column  |
| 40rem | 24px                   | In a row, start-aligned, primary first. Long labels wrap the row | 2 columns |
| 64rem | 24px (16px in compact) | Same                                                             | 3 columns |

At 320px with a 16px page gutter, the default card's text column is 320 − 32 − 2 − 32 = **254px**. With 24px padding it would be 238px.

## 6. Visual specification

### 6.1 Class API

Every choice is a modifier class the consumer adds next to the part's own class: `kv-<part>--<option>`. A card without one gets the default (**bold** below). `data-*` stays for state, and a card has none.

| Classes                                                                                                                                                      | On                  | Values (default **bold**)                 | Why                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kv-card--surface`, `kv-card--canvas`                                                                                                                        | Root                | **`surface-raised`**, `surface`, `canvas` | The token names from DESIGN.md Colors and Elevation, so there's one vocabulary. `surface` is level 1 (a block in a sidebar). `canvas` makes a card look like part of the page on a `surface` section (in light it equals `surface-raised`) |
| `kv-card--radius-lg`, `kv-card--radius-md`, `kv-card--radius-none`                                                                                           | Root                | **`lg`**, `md`, `none`                    | DESIGN.md Shapes ties radius to element type: `lg` for cards, `md` for a card nested in a card, `none` for a card flush with an edge (phone-width lists, table cells). `sm`, `xl` and `full` belong to other elements                      |
| `kv-card--padding-none`, `-sm`, `-md`, `-lg`; `kv-card-header--padding-*`, `kv-card-body--padding-*`, `kv-card-footer--padding-*` (`none`, `sm`, `md`, `lg`) | Root, and each part | **`md`**, `none`, `sm`, `lg`              | Named steps, not raw spacing steps, so cards stay consistent. On the Root it's the default for every part. On a part it overrides the Root. `none` is for full-bleed media                                                                 |
| `kv-card--dividers`                                                                                                                                          | Root                | present or absent (**absent**)            | A 1px `border-subtle` line between parts                                                                                                                                                                                                   |

A site can change the defaults for every card without classes, with `--kv-card-padding-default` and `--kv-card-radius-default` (`theme.css` section 10). `kv-card--padding-md` and `kv-card--radius-lg` on the Root then take one card back to the theme's step.

Also used, existing: `kv-button-group` on `Card.Footer` (§6.4), `kv-prose` on any card part or the Root (§6.6), and `kv-compact` on any ancestor or the Root (§6.2).

**Not card surfaces:** `primary-subtle` and the status `-subtle` backgrounds.

- Status messages need an inline-start bar, an icon and a status word (DESIGN.md Components). As a card surface they'd invite colour-only status (1.4.1). They belong to the Notification component ([notification.md](notification.md), the Notification decision, the Card decision follow-up).
- `primary-subtle` is the secondary button's hover fill. On a `primary-subtle` card the hover fill would be invisible (1:1).

### 6.2 Padding

| Step     | Below `40rem`    | From `40rem`     | `kv-compact` from `64rem` |
| -------- | ---------------- | ---------------- | ------------------------- |
| `none`   | 0                | 0                | 0                         |
| `sm`     | `space-3` (12px) | `space-3` (12px) | `space-3` (12px)          |
| **`md`** | `space-4` (16px) | `space-6` (24px) | `space-4` (16px)          |
| `lg`     | `space-6` (24px) | `space-8` (32px) | `space-6` (24px)          |

- **Narrow viewports step down** (like GOV.UK's responsive spacing). At 320px and at 400% zoom, line length is what magnifier users lose first. `sm` is the floor and doesn't shrink.
- **Compact density steps down** from `64rem`, the same switch as compact controls (DESIGN.md Density). Between `40rem` and `64rem` compact cards are comfortable, as compact controls are.
- **Component tokens** (aliases only, no new values), on `:root` and redefined in the media query and the compact rule:
  - `--kv-card-padding-sm`, `--kv-card-padding-md` and `--kv-card-padding-lg`.
  - Per card: `--kv-card-padding` (from the padding classes) and `--kv-card-radius` (from the radius classes). The Root always sets both, so a nested card never inherits its parent's values. A part with its own padding class sets `--kv-card-padding` on itself.

**Padding model:**

1. **A Root without parts pads itself** with `--kv-card-padding`. "Without parts" means no direct child is a `kv-card-header`, `kv-card-body` or `kv-card-footer` (`:not(:has(> …))`, within the browser support in `docs/architecture.md`).
2. **A Root with parts has no padding.** Each part pads itself on all four sides. Parts must be direct children of the Root. A wrapper between them breaks the model (documented, tested in stories).
3. **Adjacent padded parts share one padding.** A part directly after a part without its `--padding-none` class has `padding-block-start: 0`. So the space between header, body and footer equals the earlier part's padding (24px by default), not double. After a `none` part (an image), the next part keeps its top padding.
4. **With `kv-card--dividers`, nothing collapses.** Each part keeps its full padding, and every part after the first gets `border-block-start: 1px solid border-subtle`. There's no divider directly after a `--padding-none` part, because the image edge is already a boundary.
5. **Block margins of the first and last child** of the Root and of each part are 0, at zero specificity (`:where()`), so the padding is the real edge and consumer CSS still wins. Spacing between children is the consumer's, or prose's.
6. **The Root with parts is a column** (`display: flex; flex-direction: column`). `Card.Body` grows (`flex-grow: 1`), so in a stretched grid row the footers line up. A Root without parts stays `display: block`, so inline children (text with a link in it) aren't turned into flex items.

**Guidance for the docs:** put the heading at the top of `Card.Body`. A Header is for media, or for a title row that needs a divider. Mixing non-`none` steps on parts misaligns their inline edges (DESIGN.md: aligned edges), so per-part values are normally `none` only.

### 6.3 Root and parts

| Part                 | Style                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root                 | `box-sizing: border-box`. `background-color` from the surface class. `border: var(--kv-border-width) solid var(--kv-color-border-subtle)` on every surface. `border-radius: var(--kv-card-radius)`. `color: var(--kv-color-text)` (set with the background, so text always pairs with the surface). `min-inline-size: 0` and `max-inline-size: 100%` (grid and flex items can shrink at 320px). `hyphens: auto` and `hyphenate-limit-chars: 10 4 4` (never in code), then `overflow-wrap: break-word`. No shadow, no `overflow`, no fixed size, no font change (the font inherits). |
| Header, Body, Footer | `padding: var(--kv-card-padding)`, and the collapse and divider rules above. No background of their own, no `display` on Header or Footer (so `kv-button-group` on the Footer works). Body: `flex-grow: 1`                                                                                                                                                                                                                                                                                                                                                                          |

**Full-bleed media without clipping.** The Root never sets `overflow: hidden` or `clip`, so a child's focus ring (2px plus a 2px offset) is never cut off (2.4.11, 2.4.13) and text spacing overrides never clip text (1.4.12). Instead, media that touches a rounded corner gets that corner's radius itself:

- Applies to direct `img`, `video` and `svg` children, and `picture > img`, of a box with zero padding: a part with its `--padding-none` class, a part without a padding class in a Root with `kv-card--padding-none`, or a Root without parts and with `kv-card--padding-none`.
- Those media are `display: block`, `inline-size: 100%`, `block-size: auto` and `margin: 0`.
- In the first part (or as the Root's first child) they get `border-start-start-radius` and `border-start-end-radius`. In the last part (or as the last child) they get `border-end-start-radius` and `border-end-end-radius`. A part that's both gets all four.
- The radius is the card's inner radius: `max(0px, var(--kv-card-radius) - var(--kv-border-width))`, so 11px by default. The `max()` keeps `kv-card--radius-none` at 0.
- Logical corners, so RTL needs nothing extra.
- An image wrapped in a link isn't recommended (a duplicate link, Inclusive Components). If a consumer does it anyway, the ring draws outside the card's edge and stays visible.

### 6.4 Footer and buttons

- Put **`kv-button-group` on `Card.Footer`**, with no extra wrapper. It's the existing layout: a wrapping row with a 12px gap, and from below `40rem` a column of full-width buttons. Buttons are **start-aligned**, in DOM order, primary first. At 400% zoom a magnifier user follows the inline-start edge, and end-aligned buttons drift out of view.
- The breakpoint is the viewport, not the card. In a narrow card on a wide screen, long labels wrap the row instead of stacking. No container queries: `container-type: inline-size` would collapse a card that sizes to its content.
- **One primary per view** (DESIGN.md). In a list of cards, footer buttons are secondary. A card gets a primary only when it holds the view's main action (Example B, alone on its page).
- **Navigation is a Link, not a Button** (DESIGN.md). "Show on map" or "Read more" are Links. A card's one link goes in the heading (Example C). Plan 0007's sketch (`<Button>Visa karta</Button>`, buttons directly in the footer) should be updated to match.

**Buttons on each surface** (measured with `packages/theme/src/contrast.ts` against `theme.css`, 2026-10-01; cells are `surface-raised` / `surface` / `canvas`):

| Edge or fill                                | light              | dark                   | light-contrast        | dark-contrast         | In `contrast-requirements.ts`?                                    |
| ------------------------------------------- | ------------------ | ---------------------- | --------------------- | --------------------- | ----------------------------------------------------------------- |
| `secondary` (secondary button edge)         | 4.98 / 4.68 / 4.98 | 3.54 / 3.83 / 4.19     | 10.86 / 10.21 / 10.86 | 12.05 / 13.04 / 14.28 | Yes, all three                                                    |
| `primary` (primary fill, hovered secondary) | 4.70 / 4.42 / 4.70 | 3.75 / 4.05 / 4.44     | 9.89 / 9.29 / 9.89    | 9.40 / 10.17 / 11.14  | Yes, all three                                                    |
| `focus-ring`                                | 4.70 / 4.42 / 4.70 | 6.14 / 6.64 / 7.27     | 9.89 / 9.29 / 9.89    | 9.40 / 10.17 / 11.14  | Yes, all three                                                    |
| `primary-hover` (hovered primary fill)      | 5.91 / 5.55 / 5.91 | **2.98** / 3.23 / 3.53 | 12.65 / 11.89 / 12.65 | 11.79 / 12.75 / 13.97 | `canvas`, `surface` only. **Add `surface-raised`: fails in dark** |
| `danger-hover` (hovered danger fill)        | 8.23 / 7.73 / 8.23 | 10.42 / 11.28 / 12.35  | 12.00 / 11.28 / 12.00 | 13.14 / 14.21 / 15.57 | No. **Add all three** (they pass)                                 |

`danger` as a fill is covered by its 4.5:1 text pairs. A disabled button's `border-control` dashed edge is covered (lowest 3.54:1, dark on `surface-raised`).

**The dark hovered primary button on a card fails the project's own 3:1 rule** (2.98:1). It's a Button issue that a card exposes first, and it will also affect dialogs and popups, which are `surface-raised` too. A lighter hover isn't allowed (white text), and a darker one lowers the edge further. Recommended fix, for the maintainer to decide (Button style, needs the maintainer's approval, open question 1): **a hovered primary button keeps a 1px `primary` border** instead of `transparent`, so its edge is `primary` on the surface (3.75:1 lowest, already required). Then `primary` replaces `primary-hover` in the "hovered primary edge" pairs. Until it's decided, the dark Example B story shows the gap.

### 6.5 Text on each surface

All pairs below are in `contrast-requirements.ts` already. Cells are `surface-raised` / `surface` / `canvas`.

| Token        | light (4.5:1)         | dark (4.5:1)          | light-contrast (7:1)  | dark-contrast (7:1)   |
| ------------ | --------------------- | --------------------- | --------------------- | --------------------- |
| `text`       | 19.05 / 17.90 / 19.05 | 16.55 / 17.90 / 19.61 | 20.86 / 19.61 / 20.86 | 17.61 / 19.05 / 20.86 |
| `text-muted` | 6.21 / 5.84 / 6.21    | 5.42 / 5.86 / 6.42    | 10.86 / 10.21 / 10.86 | 12.05 / 13.04 / 14.28 |
| `link`       | 5.91 / 5.55 / 5.91    | 6.14 / 6.64 / 7.27    | 9.89 / 9.29 / 9.89    | 9.40 / 10.17 / 11.14  |
| `link-hover` | 7.12 / 6.69 / 7.12    | 8.30 / 8.98 / 9.84    | 12.65 / 11.89 / 12.65 | 11.79 / 12.75 / 13.97 |

- `text-muted` is for metadata only ("Published …"), never for what the user must read to act.
- **The card boundary is decorative:** `border-subtle` is 1.15–1.36:1 against the surfaces in the standard themes, and 4.68–6.42:1 in the contrast themes. A card isn't a control, so 1.4.11 doesn't require 3:1. Grouping comes from structure (heading, list item) and spacing, never from the edge alone. In light, `surface-raised` on `canvas` is 1.00:1, so the hairline is the only visual edge. That's acceptable for the same reason, and it's what the research question in §1 checks.

### 6.6 Prose and cards

Prose skips component parts but **not their descendants**, so without a boundary a card inside `kv-prose` would get prose margins on its heading (32px above an `h3`), its image (32px margins, `md` radius) and its lists. A card must look the same inside and outside prose, so:

| Case                                                                           | Result                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card inside prose                                                              | Nothing inside the card is prose-styled. **`.kv-card` is on the not-prose list** in `theme.css`, the one place it's written. The card Root gets prose block spacing (`--kv-prose-space-block`), like `kv-not-prose` |
| `kv-prose` on the card Root, on a part, or on an element inside a card         | Prose is on for what's inside it, also when the card is inside other prose. Unlike `kv-not-prose`, a card is a component boundary, not an opt-out, so prose can be turned on again inside it                        |
| Prose inside a card inside `kv-not-prose`, or `kv-not-prose` inside card prose | Off. The existing not-prose rule and its known limitation stay as they are                                                                                                                                          |

- Recommended: `kv-prose` on `Card.Body`, or on the Root of a card without parts (Example A). Prose's first-child and last-child margin trimming then works inside the part.
- Prose's `max-inline-size: 70ch` also applies there. It only matters on very wide cards, and it keeps the line length right.
- A list of cards inside prose: the `ul` itself is prose-styled (markers, indent). Wrap it in `kv-not-prose`, or see open question 3.
- The selector mechanics are the engineer's (zero specificity, one list). Stories must cover the first two rows.

### 6.7 States

| Part      | default | hover | focus-visible | active | disabled | invalid | loading | selected / open | empty                            |
| --------- | ------- | ----- | ------------- | ------ | -------- | ------- | ------- | --------------- | -------------------------------- |
| All parts | as §6.3 | none  | none          | none   | none     | none    | none    | none            | Consumer doesn't render the part |

A card is never interactive. No hover change, shadow or pointer cursor, because those suggest that the whole card is clickable. Children keep their own states. A loading card (skeleton) is out of scope.

### 6.8 Modes

- **Dark, light-contrast, dark-contrast:** only the tokens change. In dark, `surface-raised` (`neutral-900`) is lighter than `surface` and `canvas`, so a raised card is lighter, not shadowed (DESIGN.md). In the contrast themes `border-subtle` is `neutral-500` or `neutral-400`, so the edge is clearly visible.
- **Forced colours:** the tokens already map `border-subtle` to `CanvasText` and every surface to `Canvas`. Every card variant keeps its 1px solid border, so the boundary survives, and dividers do too. No `border: none` or transparent border on any variant. No extra forced-colours rules are needed. Nested cards are told apart by their borders. The e2e test checks the border is visible.
- **RTL:** logical properties only (`padding`, `border-block-start`, `border-start-start-radius` and so on). Footer buttons follow the inline direction. Nothing to mirror.
- **Motion:** none. No transitions on the card.
- **320px, 400% zoom, 1.4.12:** no fixed heights, no `overflow`, no line clamping, and `overflow-wrap: break-word` on the Root. `min-inline-size: 0` lets a card shrink inside a grid, so a long Finnish compound wraps instead of forcing a horizontal scroll. Card lists use `minmax(min(100%, 18rem), 1fr)`. Text spacing grows the card's height.
- **Nested cards:** one level for resident-facing pages. The inner card uses `kv-card--surface` (one step down from the default) and `kv-card--radius-md`, so its corners read as concentric. Padding resets per card.

### 6.9 New or changed tokens and pairs

| Token or pair                                                       | Value per theme                                                      | Contrast                        | Decision                                                |
| ------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------- |
| `--kv-card-padding-sm`                                              | `space-3` (all)                                                      | n/a                             | The Card decision (component tokens, no new values)     |
| `--kv-card-padding-md`                                              | `space-4`; `space-6` from `40rem`; `space-4` in compact from `64rem` | n/a                             | The Card decision                                       |
| `--kv-card-padding-lg`                                              | `space-6`; `space-8` from `40rem`; `space-6` in compact from `64rem` | n/a                             | The Card decision                                       |
| `--kv-card-padding`, `--kv-card-radius`                             | Per card, from the modifier classes                                  | n/a                             | The Card decision                                       |
| Pair `primary-hover` on `surface-raised` (3:1)                      | –                                                                    | 5.91 / **2.98** / 12.65 / 11.79 | New decision for the Button hover fix (open question 1) |
| Pairs `danger-hover` on `canvas`, `surface`, `surface-raised` (3:1) | –                                                                    | lowest 7.73 (light, `surface`)  | Plan 0007 task (completeness, passes)                   |

**DESIGN.md changes** for the maintainer: the Components entry for cards (modifier classes, padding model, footer, one-link rule), `card` padding "24px, 16px below 40rem and in compact", the Theming class list, and `kv-card` in the Prose entry's not-prose list.

## 7. Accessibility annotations

Draft input for `packages/react/src/card/card.a11y.md`. The plan's contract table (Plan 0007) stands as written.

- **Card never:**
  - adds a role, `aria-*`, `tabindex`, a click handler, a heading, a live region or text;
  - renders `<header>`, `<footer>`, `<section>` or `<article>` by default;
  - sets `aria-hidden` or `inert`;
  - clips its children (`overflow`), which would hide focus rings (2.4.11, 2.4.13) or text under 1.4.12;
  - has a hover or pointer style that suggests it's clickable.
- **The consumer is responsible for:**
  - **The heading level**, which follows the page outline (`h2` in a sidebar or on My pages, `h3` for cards under an `h2` list heading). Card can't know it.
  - **Alt text:** `alt=""` for a decorative image, which is most card images when the heading names the topic. An informative image gets real alt text. DOM order stays equal to visual order (1.3.2), so the image comes first. No text in images.
  - **Links:** one link per card, in the heading, with text that makes sense on its own (2.4.4). No "Read more", and no second link on the image.
  - **Buttons:** verbs, one primary per view, and Links for navigation.
  - **Landmarks:** `render={<section aria-labelledby={headingId} />}` or `<aside aria-labelledby>` only for a region a user would want to jump to (Example A). A `section` without a name isn't a landmark, so it's no use. Never make every card in a list a landmark. `<article>` is for a self-contained item such as a news story, and is optional.
  - **Lists:** a list of cards is a `<ul role="list">` with each card rendered as `<li>` (or a `<li>` around each card), so screen readers announce "list, 3 items".
  - **Language:** `lang` on any card text in another language (3.1.2).
- **Focus order:** the children's DOM order. Card never moves focus.
- **Announcements:** none.
- **WCAG SCs of note:** 1.3.1, 1.3.2, 1.4.1 (no status surfaces), 1.4.3, 1.4.10, 1.4.11, 1.4.12, 2.4.4, 2.4.6, 2.4.11, 2.4.13, 2.5.8 (footer buttons keep their own sizes).

**Stories** (`Components/Card`), all with axe:

- Examples A–D with the fixture text.
- Every surface, radius and padding class, labelled with the class as `<code>`, plus `kv-card--dividers`.
- Card inside prose, and prose inside a card body.
- A Root with plain children.
- The four fixed themes, RTL (`dir="rtl"` with the en fixture), and forced colours.
- e2e: reflow at 320px with the `fi` fixture. The focus ring of a footer Button is unclipped (screenshot or bounding-box check). The card border is visible in forced colours.

## 8. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`. No open blockers in the card's own design. One finding is outside it: the dark hovered primary button on `surface-raised` (§6.4), which needs a decision before Example B ships in dark.
- [x] Contrast of every pair a card uses measured (§6.4, §6.5). No new colour.
- [x] Usability test plan written. Result: `pending`.

### Usability test plan

- **Participants (6–8):** a screen-reader user (NVDA or VoiceOver), a screen-magnifier user at 400%, a Windows Contrast Themes user, a person with a cognitive disability, a person with low digital confidence, a second-language reader (Finnish or Swedish), and one or two staff users in compact density.
- **Tasks:**
  1. On My pages (Example B), order an extra waste collection.
  2. Find out when the customer centre answers the phone (Example A, next to a service page).
  3. Find and open the news item about snow clearing (Example C).
  4. In a staff dashboard (Example D), say what happened last in the case.
- **What we measure:**
  - Task completion, and time on task.
  - Whether magnifier users associate the footer buttons with the right card.
  - Whether anyone tries to click the whole card.
  - Whether screen-reader users understand the list and its headings.
- **Result:** `pending`. Assistive-technology testing is also `pending`.

## 9. Open questions

1. **Dark hovered primary button on cards (2.98:1).** Accept the recommended Button fix (a 1px `primary` border on hover, needs the maintainer's approval), or choose another? It's outside Card's scope but blocks a clean dark Example B.
2. **Prose re-enabled inside cards** (§6.6) makes cards differ from `kv-not-prose`, where prose can't be turned back on. Is that difference acceptable, or should a later prose change let the nearest `kv-prose` win everywhere (for example with `@scope`, once Safari 17.0–17.3 drop out of the support range)?
3. **Card lists:** should the theme ship a list layout class (for example `kv-card-list` on a `ul`: grid, no markers, and a not-prose boundary), instead of story CSS and a `kv-not-prose` wrapper?
4. **Surface names:** token names (`kv-card--surface`, `surface-raised` for the default) were chosen over shorter ones (`raised`) for one vocabulary. Confirm.
5. **Per-part padding:** allow all four steps (chosen, documented as "normally `none`"), or only `none`, to protect aligned edges?
