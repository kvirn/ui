# Design spec: Navigation, and the service link

- **Status:** Approved (the maintainer accepted Plan 0043, 2026-10-04)
- **Designer:** ux-designer agent · **Date:** 2026-10-04
- **Plan:** [0043](../plans/0043-navigation-and-service-link.md)
- **Type:** component default styling

## 1. Brief

- **Users:** both. Hardest case: a resident on a 320px phone with 200% text, in Finnish, who has to find the one link that starts the e-service ("Ansök om bygglov"), and a screen-reader user who lists landmarks and links to find the same thing.
- **Job to be done:** When I land on a service page, I want to see where I am in the site and which link starts the e-service, so I can begin without hunting.
- **Context:** once a year, often under time pressure. Staff see the same navigation every day in compact density.
- **Constraints:** WAD (EN 301 549). A link is a link: it navigates, so it is never a Button (Plan 0043). No new colours.
- **Success criteria:** users find and start the e-service on the first try. Screen-reader users reach the navigation by its landmark name.
- **Evidence:** none of our own. The service-link look is the "Länk till e-tjänst" of Stockholm stad's webbmanual (named in the plan).
- **Assumptions and research questions:**
  - Assumption: a filled icon block plus an outline makes the e-service link findable among plain links, without reading as a button. → Do residents recognise it as a link, and do they expect it to open a new place (it does)?
  - Assumption: two nesting levels are enough on resident pages. → Do any customers need three?

## 2. Prior art

| Source                                          | What we reuse                                                                  | What we change and why                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `.kv-nav` (`theme.css` §8 today)                | Every item rule: 44px rows, `nav-item`, the current bar, weight and background | Moves to part classes the component renders. Adds a nested indent, which `.kv-nav` never had                         |
| `.kv-button` and `.kv-button--primary`          | The choice is a class the consumer adds; hover darkens a fill; focus ring      | No depth: DESIGN.md forbids button depth on links ("Depth means press me")                                           |
| APG Disclosure Navigation (site nav example)    | A `<nav>` landmark with a list of links, Tab between links, no arrow keys      | No disclosure here: that is NavigationMenu (M4)                                                                      |
| GOV.UK start button                             | A distinct, single "start this service" link with an arrow                     | GOV.UK adds `role="button"`. We keep the native link role: it navigates, and a screen reader must say "link" (4.1.2) |
| Stockholm stad webbmanual, "Länk till e-tjänst" | Filled square icon block at the start, outlined label                          | Our tokens: `primary` block, `on-primary` icon, `link` text. The label text is `link`, not `primary` (see §6.4)      |

## 3. Flow

Navigation: land on page → (optional) skip link → Tab through the nav links in DOM order, nested ones included → Enter follows. The current page is marked visually and announced ("current page").

Service link: read the page → Tab to the service link → Enter → the e-service (often another origin).

Unhappy paths:

- **E-service closed or unavailable.** No disabled link (Link has no `disabled`, link.md). Render no link: a sentence and, when it reopens, a date, in an Alert (`warning`). A dimmed link that screen-reader users find but can't use is worse.
- **E-service opens in a new tab.** `<Link.NewTabNotice />` inside the label, as for any Link. It wraps with the label.
- **Two navs with the same name.** Dev warning (plan's risk).
- **No JavaScript.** All of it is plain HTML links and lists: works.

## 4. Content

No new i18n keys. Navigation.Root's name is the consumer's string from their own translations. Examples:

| Use              | en                             | sv                    | fi (longest)                   |
| ---------------- | ------------------------------ | --------------------- | ------------------------------ |
| Navigation label | Main menu                      | Huvudmeny             | Päävalikko                     |
| Sub-navigation   | In this section                | I det här avsnittet   | Tässä osiossa                  |
| Service link     | Apply for building permit      | Ansök om bygglov      | Hae rakennuslupaa sähköisesti  |
| New-tab notice   | `link.newTabNotice` (existing) | (öppnas i en ny flik) | (avautuu uudessa välilehdessä) |

Copy rules: the service link label starts with the verb and names the service ("Ansök om bygglov"), never "Klicka här" or "E-tjänst" alone (2.4.4). Don't put "länk" in the label: the role says it.

## 5. Structure

All breakpoints (320px · 40rem · 64rem) are the same: Navigation is a vertical list by default, at every width (as `.kv-nav` was), and a row that wraps with `kv-navigation--horizontal` on the root. A bar of plain links is Navigation; flyouts and collapsing are NavigationMenu (M4), or the consumer's layout.

> **Replaced in part (Plan 0047).** The horizontal bar is [navigation-link-options.md](navigation-link-options.md) §13, and the current-page and trail look is its §12. This section's structure (the three parts and the nested list) stands.

```
[nav aria-label="Huvudmeny"]        Navigation.Root   .kv-navigation
  [ul]                              Navigation.List   .kv-navigation-list
    [li] link "Start"               Navigation.Item   .kv-navigation-item > .kv-link
    [li] link "Bygga och bo" (current="page")
      [ul]  indented 16px           nested Navigation.List
        [li] link "Bygglov"
    [li] link "Om oss"
```

Service link, inline-level, in a paragraph or on its own line:

```
┌────┬──────────────────────────────┐
│ ▶  │ Ansök om bygglov             │   1px primary edge, 8px radius
└────┴──────────────────────────────┘
 block: primary fill, on-primary icon, square at one line, full height when the label wraps
```

## 6. Visual specification

### 6.1 Parts and classes

| Part                   | Element and class                                  | Tokens                                                                                                 |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Navigation.Root`      | `<nav class="kv-navigation">`                      | none (a prose boundary)                                                                                |
| `Navigation.List`      | `<ul class="kv-navigation-list">`                  | `space-1` gap; nested: `space-4` inline-start indent, `space-1` above                                  |
| `Navigation.Item`      | `<li class="kv-navigation-item">`                  | none                                                                                                   |
| Navigation item link   | `.kv-navigation-item > .kv-link` (not `--service`) | `nav-item`: `text`, `label` / `label-compact`, `radius-md`, `0 space-3`, `control-min-block-size`      |
| Service link (choice)  | `<a class="kv-link kv-link--service">`             | `link` text, 1px `primary` edge, transparent fill, `radius-md`, control type, `space-4` inline padding |
| `Link.Icon` (new part) | `<span class="kv-link-icon" aria-hidden="true">`   | in a service link: `primary` fill, `on-primary` icon, inner radius at the inline start                 |

`Link.Icon` works in any Link (a plain inline icon in the link colour). Only inside `kv-link--service` does it become the filled block. Put it first in the link. Recommended icon: the built-in `arrow-forward` at `size={6}` (it already mirrors in RTL).

### 6.2 States

> **The Navigation item row is replaced by [navigation-link-options.md](navigation-link-options.md) §12** (Plan 0047): weight 400 at rest with no fill, an underline on hover, the current page as a solid fill, and its ancestors as the trail. The `nav-item` tokens in §6.1 follow it. The service link and icon block rows stand.

| Part               | default                                            | hover / active                                                                   | focus-visible                                        | current (`aria-current`)                                                | disabled                          |
| ------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------- |
| Navigation item    | `text`, no underline, transparent inline-start bar | `surface-raised` background                                                      | 2px `focus-ring`, 2px offset (`.kv-link`)            | `primary-subtle` background, 4px `primary` inline-start bar, weight 600 | n/a: no disabled link             |
| Service link       | `link` text, 1px `primary` edge, no underline      | `primary-subtle` background, `link-hover` text, underline at the hover thickness | 2px `focus-ring`, 2px offset, follows the 8px radius | weight 600 and `primary-subtle` background                              | n/a: render text, not a link (§3) |
| Service icon block | `primary` fill, `on-primary` icon                  | `primary-hover` fill (darker in light and dark)                                  | unchanged                                            | unchanged                                                               | n/a                               |

The underline on hover keeps a link's own cue; the weight keeps current from relying on colour. The service link never gets a shadow or a tinted edge.

### 6.3 Modes

> **Navigation's forced-colours, RTL and 320px rules are replaced by [navigation-link-options.md](navigation-link-options.md) §12 and §13** (Plan 0047): the fills drop, the current item gets a straight `LinkText` bar (at the block end in a horizontal bar), the trail keeps its weight, and the nested indent and the bar sit at the inline start. The service link bullets stand.

- **Dark, light-contrast, dark-contrast:** the tokens remap; nothing theme-specific. In dark-contrast `on-primary` is black on a light `primary-200` block.
- **Forced colours:** navigation as today (`LinkText`, only the current item keeps its bar, in `LinkText`). Service link: `LinkText` text and 1px `LinkText` edge on `Canvas`, no underline; hover and active turn the edge `Highlight` and add the underline; focus ring `Highlight`. The block is not filled: `Canvas` with a 1px `LinkText` inline-end divider and a `LinkText` icon (`.kv-icon` inherits). Current keeps weight 600.
- **RTL:** logical properties only. The block and the current bar sit at the inline end in RTL; the indent too.
- **Motion:** the existing `.kv-link` transitions (colour, thickness, background, border) plus the block's `background-color`, under `prefers-reduced-motion: no-preference` only.
- **320px, 400% zoom, text spacing:** the service link is `inline-block` with `max-inline-size: 100%`; the label (and the notice) wraps beside the block, which stretches to the full height. Long Finnish words break (`overflow-wrap: break-word`). Vertical padding comes from `1lh`, so 1.4.12 line height grows the box instead of clipping.

### 6.4 Contrast pairs (`theme:check`)

No new tokens and no new pairs: every pair used is already required in `packages/theme/src/contrast-requirements.ts`. Engineering only adds a comment there naming the service link next to the existing pairs.

| Pair                                                                | Where                               | Required by                                          |
| ------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| `link` on `canvas`, `surface`, `surface-raised`, status `-subtle`s  | service link label                  | `textPairs` (4.5:1, 7:1 in the contrast themes)      |
| `link-hover` on `primary-subtle`                                    | hovered or current service link     | `textPairs`                                          |
| `on-primary` on `primary` and on `primary-hover`                    | the icon block, at rest and hovered | `textPairs` (4.70:1 lowest, above the 3:1 for icons) |
| `primary` on plain backgrounds, `primary-subtle`, status `-subtle`s | service link edge, current nav bar  | `nonTextPairs` (3:1)                                 |
| `focus-ring` on plain backgrounds                                   | focus ring (offset from the edge)   | `nonTextPairs`                                       |
| `text` on `surface-raised` and `primary-subtle`                     | nav item hovered and current        | `textPairs`                                          |

Why the label is `link` and not `primary` (the plan's "primary text"): `primary` as text is 4.44:1 on the dark canvas (DESIGN.md, Colors). `link` is the same scale, a step that passes.

### 6.5 theme.css changes (section 8, "Link and navigation lists")

> **The navigation item rules (steps 2 and 3) are replaced by [navigation-link-options.md](navigation-link-options.md) §12 and §13** (Plan 0047; `theme.css` §8 holds the result). The service link and icon rules stand.

1. Rename the section to "Link, service link and Navigation". Replace the `kv-nav` example in its comment with `<Navigation.Root label=…>` and add the service link example. In the file header (lines 9–11) drop `kv-nav` from the context classes and add `kv-link--service` to the choices.
2. Replace `.kv-nav` with:

```css
.kv-navigation-list {
  display: flex;
  flex-direction: column;
  gap: var(--kv-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* A nested list: indented, so the level shows without colour. */
.kv-navigation-list .kv-navigation-list {
  margin-block-start: var(--kv-space-1);
  padding-inline-start: var(--kv-space-4);
}
```

3. Rename `.kv-nav .kv-link` to `.kv-navigation-item > .kv-link:not(.kv-link--service)` in the item, hover, current and both forced-colours rules. The declarations stay exactly as today.
4. Add after the navigation rules:

```css
/* <Link.Icon>: a decorative slot. In a plain link it's inline, in the link colour. */
.kv-link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* <Link.Root className="kv-link--service">: the one link that starts an e-service. */
.kv-link.kv-link--service {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  min-block-size: var(--kv-control-min-block-size);
  max-inline-size: 100%;
  padding-block: max(
    0px,
    calc((var(--kv-control-min-block-size) - 1lh) / 2 - var(--kv-border-width))
  );
  padding-inline: var(--kv-space-4);
  border: var(--kv-border-width) solid var(--kv-color-primary);
  border-radius: var(--kv-radius-md);
  background-color: transparent;
  color: var(--kv-color-link);
  font-family: var(--kv-font-family-body, var(--kv-font-family-sans));
  font-size: var(--kv-control-font-size);
  font-weight: var(--kv-control-font-weight);
  line-height: var(--kv-control-line-height);
  text-decoration-line: none;
  overflow-wrap: break-word;
  vertical-align: middle;
}

.kv-link.kv-link--service:has(> .kv-link-icon) {
  padding-inline-start: calc(
    var(--kv-control-min-block-size) - 2 * var(--kv-border-width) + var(--kv-space-3)
  );
}

.kv-link.kv-link--service:is(:hover, :active) {
  background-color: var(--kv-color-primary-subtle);
  color: var(--kv-color-link-hover);
  text-decoration-line: underline;
  text-decoration-thickness: var(--kv-link-underline-thickness-hover);
}

.kv-link.kv-link--service:is([data-current], [aria-current]:not([aria-current='false'])) {
  background-color: var(--kv-color-primary-subtle);
}

/* Square at one line, the full height when the label wraps. */
.kv-link--service > .kv-link-icon {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  inline-size: calc(var(--kv-control-min-block-size) - 2 * var(--kv-border-width));
  border-start-start-radius: calc(var(--kv-radius-md) - var(--kv-border-width));
  border-end-start-radius: calc(var(--kv-radius-md) - var(--kv-border-width));
  background-color: var(--kv-color-primary);
  color: var(--kv-color-on-primary);
}

.kv-link--service:is(:hover, :active) > .kv-link-icon {
  background-color: var(--kv-color-primary-hover);
}
```

5. Add `.kv-link-icon` to the reduced-motion transition (`background-color`), and in the forced-colours block:

```css
.kv-link.kv-link--service {
  border-color: LinkText;
  background-color: Canvas;
  color: LinkText;
  text-decoration-line: none;
}
.kv-link.kv-link--service:is(:hover, :active) {
  border-color: Highlight;
  text-decoration-line: underline;
}
.kv-link--service > .kv-link-icon {
  border-inline-end: var(--kv-border-width) solid LinkText;
  background-color: Canvas;
  color: LinkText;
}
```

6. Prose (section 9): replace `.kv-nav` with `.kv-navigation` in both boundary lists and the comment, and add `.kv-link-icon` to the component-part list next to `.kv-link-new-tab-notice`.

No `[data-disabled]` rule for links. The theme never styles a disabled link.

### 6.6 DESIGN.md changes (same change as theme.css)

- Front matter: add `link-service` (`textColor: '{colors.link}'`, `rounded: '{rounded.md}'`, `padding: 0 16px`, `height: 44px`) and `link-service-icon` (`backgroundColor: '{colors.primary}'`, `textColor: '{colors.on-primary}'`). Keep `nav-item` and `nav-item-current`.
- Colors rules (line 311) and Components (line 496): say "Navigation (`Navigation.Root`)" instead of "navigation lists", and add a nested-list line (indented 16px, two levels on resident pages).
- Components: one bullet for the service link: one per view, for starting an e-service, flat (no button depth), `link` label, `primary` block, no disabled state.
- Prose (line 512) and Theming (line 521): `kv-nav` → `kv-navigation`; add `kv-link--service` to the choices and `kv-navigation`, `kv-navigation-list`, `kv-navigation-item`, `kv-link-icon` to the part classes.

## 7. Accessibility annotations

- **Roles:** `Navigation.Root` is a native `<nav>` (landmark), `List` a `<ul>`, `Item` an `<li>`. Nesting is native lists, so the level is announced (1.3.1). WebKit keeps list semantics inside `<nav>` despite `list-style: none`, so no `role="list"`.
- **Names:** `label` sets `aria-label`; `aria-labelledby` (a visible heading) is accepted instead and preferred where a heading exists. Dev warning when neither, and when two navs share a name (2.4.1, 2.4.6). The service link's name is its text (plus the new-tab notice); the icon block is `aria-hidden` (Link.Icon renders it), so visible label = name (2.5.3).
- **Current:** `current` on Link sets `aria-current="page"`. One per navigation. Visual cue never by colour alone: a solid fill and weight in navigation ([navigation-link-options.md](navigation-link-options.md) §12), weight in the service link (1.4.1).
- **Keyboard:** Navigation has no focusable part of its own; the links own the keys (`link.a11y.md`). It is not a composite: each link is a Tab stop, and there are no arrow keys (it is not a menu).

  | Key       | Context                      | Action                                                     |
  | --------- | ---------------------------- | ---------------------------------------------------------- |
  | Tab       | before or in the nav         | Moves to the next link, nested links in DOM order included |
  | Shift+Tab | on a link                    | Moves to the previous link, then out of the nav            |
  | Enter     | on a link (service included) | Follows the link                                           |

  Focus is never moved by the component. Focus order = visual order (2.4.3).

- **Target size (2.5.8):** nav items and the service link are `control-min-block-size` high (44px, 32px compact), never under 24px; assert the 24px threshold, not the theme value.
- **Focus visible (2.4.7):** the `.kv-link` ring; assert it exists and is at least 2px.
- **Contrast (1.4.3, 1.4.11):** §6.4; all already in `theme:check`.
- **WCAG SCs:** 1.3.1, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 1.4.12, 2.4.1, 2.4.3, 2.4.4, 2.4.7, 2.5.3, 2.5.8, 4.1.2.

## 8. Decisions

- **Variant prop or class only: class only.** `<Link.Root className="kv-link--service">`, exactly as Button exposes `kv-button--primary` and `kv-button--danger` (button.md: "add `className=…` for a variant"; `useButton` has no variant). Headless packages ship zero CSS, and a look is a class the consumer adds (DESIGN.md, Theming). The plan's sketch `variant="service"` becomes `className="kv-link--service"`; no prop, no type change on Link.
- **No disabled service link.** Link has no `disabled`. An unavailable e-service is text plus a notice (§3), so the plan's "`data-disabled` follows Button's" is dropped.
- **Flat, not button depth.** DESIGN.md reserves depth for buttons.
- **Label colour `link`, not `primary`**, for 4.5:1 in dark (§6.4).
- **Vertical by default, `kv-navigation--horizontal` on the root, no prop** (Plan 0047, [navigation-link-options.md](navigation-link-options.md) §13). This replaces "vertical only, no `orientation` prop". The links are plain Tab stops, so orientation is a look and not behaviour: it is a class, as options are in `architecture.md`.
- **Navigation item selector excludes `kv-link--service`,** so a service link inside a navigation keeps its look.

## 9. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`: no open blockers.
- [x] No new colour pair; all pairs already in `theme:check` (orchestrator runs `vp run theme:check` after the theme.css change).
- [x] Usability test plan written. Result: `pending`.

### Usability test plan (pending)

- **Participants:** 6–8 residents: screen-reader (NVDA, VoiceOver iOS), screen magnifier at 400%, Windows high contrast, low digital confidence, a Finnish and a Swedish second-language reader. 3 staff in compact density.
- **Tasks:** on a municipal service page, start the building-permit e-service; tell us which page you are on; with a screen reader, find the main menu by landmarks and the service link by the links list.
- **Measure:** first-click success on the service link, whether it is read as a link or a button, time to find the current page, errors.

## 10. Open questions

- Should an ancestor of the current page (the parent section in a nested list) get a cue, and `aria-current="true"`? Answered by Plan 0047: every ancestor gets a visual trail (CSS `:has()`), and `aria-current` stays on the page only ([navigation-link-options.md](navigation-link-options.md) §12).
- A group label inside a navigation (the docs site's `docs-nav-group-label`, a non-link heading for a nested list): a `Navigation.Group` part later, or stays consumer CSS?
- One service link per view as a rule, like one primary button? The spec says so in DESIGN.md; confirm.
