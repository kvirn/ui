# Design spec: Navigation links: the current page, the active trail and the horizontal bar

- **Status:** Approved (maintainer, 2026-10-05).
  - **Chosen:** C, Solid fill, with T3, Marked path, and the trail found with CSS `:has()` (M1).
  - **Also accepted:**
    - S1, weight 400 at rest and 600 when current;
    - S2, a hover underline instead of a fill;
    - the DESIGN.md navigation rules rewritten (§14);
    - exactly one `aria-current` per navigation;
    - orientation as the class `kv-navigation--horizontal`, not a prop (§13).
  - **Not chosen, kept for the record with their numbers:** A, B and D (§5), and T1 and T2 (§12.5).
  - **Still open:** Q-N1 and Q-N2 (§13.8).
- **Designer:** ux-designer agent · **Date:** 2026-10-05
- **Plan:** Plan 0047. It replaces the navigation-item rows of [navigation.md](navigation.md) §6.2, §6.3 and §6.5 (Plan 0043). The service link (`kv-link--service`) doesn't change.
- **Type:** component default styling
- **Prototypes:**
  - [prototypes/navigation-link-options.html](prototypes/navigation-link-options.html): the options, §2 to §12.
  - [prototypes/navigation-horizontal.html](prototypes/navigation-horizontal.html): the chosen look, horizontal and vertical, §13.

  Open them from disk. They link the real `packages/theme/theme.css` and the docs site's IBM Plex files, make no network request and run no script. The designer couldn't render them (the subagent guard blocks Playwright), so neither has been checked by eye yet.

**The result.**

- The current page is a solid `primary` row with an `on-primary` label at weight 600.
- Every ancestor of the current page is `primary-subtle` at weight 600.
- Every other item is `text` at weight 400, with no fill and an underline on hover.
- In forced colours the current item gets a straight `LinkText` bar.
- `kv-navigation--horizontal` puts the same items in a row that wraps (§13).

Engineering applies the DESIGN.md wording in §14 verbatim. The Storybook surface is §15, and the usability test plan §16.

The maintainer isn't happy with how navigation links look in the default theme, and didn't say why. §2 names what looks off, checked against `theme.css`. Every option in §5 fixes named issues.

## 1. Brief

- **Users:** both. The hardest case is a resident with low vision at 200% zoom, on a 320px phone, reading Finnish, who has to see which page of a section they're on. The second hardest is a Windows contrast-theme user, for whom every fill disappears. Staff see the same list all day, in compact density.
- **Job to be done:** When I land on a page inside a section, I want to see at a glance where I am and what else is there, so I can move on without reading the whole list again.
- **Context:** residents once, often on a phone, sometimes stressed. Staff every day, on a desktop, with `kv-compact`.
- **Constraints:** WCAG 2.2 AA (1.4.1, 1.4.3, 1.4.11, 2.4.7 and the theme's 2.4.13 ring, 2.5.8, and 2.5.5 in comfortable density, 1.4.10, 1.4.12). DESIGN.md: one accent used sparingly, depth only on buttons, links look like links, colours named by role. The headless packages don't change: no new prop, class or `data-*`.
- **Success criteria:** in a five-second test, participants name the current page on the first try in every theme and in forced colours. Nobody takes the current item for a button or for keyboard focus. No contrast pair falls below its floor in `theme:check`.
- **Evidence:** none of our own. The critique is the designer's reading of the code and of the maintainer's screenshot, and the maintainer should confirm it.
- **Assumptions and research questions:**
  - Assumption: a shape (a bar or a segment) helps low-vision users find the current page faster than a tint and weight. → At 200–400% zoom, is B as fast as A or D?
  - Assumption: a solid accent row reads as keyboard focus or as a button. → With C, where do keyboard users say focus is?

## 2. Critique of today

The screenshot is Components/Link › Current Page. Each point is checked against `packages/theme/theme.css` §8: the items at lines 1113–1162, and the forced-colours rules at 1252–1264.

1. **The bar is a crescent, not a bar.** The bar is a 4px `border-inline-start` on a box with an 8px `border-radius` (lines 1136–1137 and 1159). That makes the inner corner radius 4 × 8px, so the bar follows both rounded corners and tapers to nothing at the top and bottom. It looks like a "(" stuck to the pill. It stays inside the box: it doesn't pass the pill's edge. But its dark, curved outer edge makes the pill look lopsided. In light, the focus ring is the same lavender (`focus-ring` and `primary` are both `primary-500`). On current + focus-visible, the ring runs 2px outside the bar, so that edge turns into a double line. Forced colours draws the same crescent in `LinkText`.
2. **The weight barely marks the current page.** Items at rest use the control weight 500, and the current item 600 (lines 1141 and 1161). That's one step of IBM Plex Sans, which is hard to see at 16px and harder at 14px in compact. All three labels look equally heavy, so the cue that isn't colour (1.4.1) rests on the crescent.
3. **Three surfaces, and the outer one isn't Navigation's.** The tinted, rounded box with a border is Storybook's `.kv-story-surface` wrapper (the rule of that name in `apps/storybook/.storybook/preview.css`), used by Link › Current Page and by every Navigation story. A 12px radius and a hairline on all four sides make it look like a card. DESIGN.md says a sidebar is a Section: square, with at most one hairline where it meets the content. The docs sidebar follows that rule (`apps/docs/app/docs.css` lines 230–235 and 302–305). Navigation's own share is two shapes for one state (the pill and the crescent), plus another pill on hover.
4. **You can't see hover, and the rows look like slabs.** Hover fills the row with `surface-raised`. On the light canvas that's 1.00:1 (white on white), 1.06:1 on `surface`, and 1.08–1.19:1 in dark, so a pointer user gets no feedback. Hover and current both draw 44px pills the full width of the list, so a short list looks like a stack of buttons. The 44px height is required (comfortable density, 2.5.5) and stays. The fix is to draw less, not to make the rows shorter.

## 3. Prior art

| Source                                                                                                                                                                                                                                                                                                          | What we reuse                                                                                                                                                                                                                                                 | What we change and why                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KvirnUI `theme.css` §8 and [navigation.md](navigation.md)                                                                                                                                                                                                                                                       | The rows, the radius, the `.kv-link` focus ring, the nested indent, `overflow-wrap: anywhere`, the `aria-current` and `data-current` selectors, and `primary` as the indicator, already held to 3:1 by `theme:check`                                          | How the indicator is drawn (never as a border on a rounded box), the weight at rest, and hover                                                                                                                       |
| KvirnUI Listbox active option and pressed Toggle (`theme.css` lines 4397–4401 and 960–966, forced colours at 4592–4597 and 1026–1036)                                                                                                                                                                           | Nothing. They show what a solid `primary` fill already means in this library                                                                                                                                                                                  | A solid `primary` fill means "the option the keyboard is on" (`aria-activedescendant`) or "on". In forced colours both become `Highlight`. A current page drawn the same way would be misread: that is C's main risk |
| [GOV.UK Service navigation](https://design-system.service.gov.uk/components/service-navigation/) ([`_mixin.scss`](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/components/service-navigation/_mixin.scss))                                                            | The active item has a 5px bar in the link colour. On narrow screens it's at the inline start, hung in the gutter with a negative margin. `aria-current` marks it, and a `<strong>` fallback makes it bold when CSS doesn't load                               | GOV.UK's items are square, so a border bar never curves. Ours are rounded, so the bar has to be its own element (A) or sit outside the rounded box (D)                                                               |
| [USWDS Side navigation](https://designsystem.digital.gov/components/side-navigation/) (`usa-current`; uswds 2.14 [`_nav-list.scss`](https://unpkg.com/uswds@2.14.0/src/stylesheets/core/mixins/_nav-list.scss) and [`_add-bar.scss`](https://unpkg.com/uswds@2.14.0/src/stylesheets/core/mixins/_add-bar.scss)) | The current item is bold, with a pill-shaped `::after` bar inset from its top and bottom. In forced colours the bar gets a system colour (`ButtonText`)                                                                                                       | We use `primary` for the bar, and `LinkText` in forced colours, because `Highlight` is the focus ring there. The label stays `text`, not the link colour                                                             |
| [WCAG 2.2 Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)                                                                                                                                                                                                             | "Any visual information necessary to indicate state … must also ensure that the information used to identify the control in that state has a minimum 3:1 contrast ratio." It sets no contrast between two states, and a change of hue alone is a 1.4.1 matter | Every option below names the indicator it relies on, and its ratio                                                                                                                                                   |
| [WCAG technique G182](https://www.w3.org/WAI/WCAG22/Techniques/general/G182)                                                                                                                                                                                                                                    | Bold is an accepted extra visual cue next to a colour difference                                                                                                                                                                                              | B relies on it alone, so its weight change has to be large (400 to 600)                                                                                                                                              |
| Linear, the reference look ("Linear-inspired", DESIGN.md)                                                                                                                                                                                                                                                       | A quiet sidebar where the current item is a soft filled row                                                                                                                                                                                                   | This is the maintainer's reference, not a public-sector source, and it wasn't checked again in this session. B is its closest translation                                                                            |

Designsystemet (NO) and the Suomi.fi design system weren't checked: their pages didn't load in this session (see §11).

## 4. Shared by every option

The options differ in how the current page is drawn. These five changes come with all of them. Each fixes a named issue, and S1 and S2 can be decided separately.

- **S1. Weight 400 at rest, 600 when current, in both densities.** At rest the item uses `--kv-font-body-weight`. Two steps of weight is a cue G182 accepts, and the list looks lighter (issue 2). DESIGN.md then gives navigation items the text weight instead of the control weight, which needs the maintainer's approval. A, C and D have a shape cue, so they could keep 500 at rest. B can't.
- **S2. Hover and press show the link's underline, not a fill.** The underline is 2px (`--kv-link-underline-thickness-hover`) in the `text` colour. It's the cue every link already has ("Links look like links"). It shows on every surface, in every theme and in forced colours (issue 4), and it frees the pill for the current page alone (issue 3). If the maintainer prefers a hover fill, no existing token shows on both `canvas` and `surface` in light, so it would need a new neutral token (§11).
- **S3. The item has no border.** The indicator is a `::before` pseudo-element, never a border on a rounded box (issue 1). Every item has the same padding, so a label doesn't move when it becomes current. In A, B and C the label starts 16px from the item's edge, as it does today (a 4px border plus 12px padding).
- **S4. In forced colours, the current page always has a straight `LinkText` bar.** Fills drop to `Canvas`, labels are `LinkText`, and weight 600 stays. The ring is `Highlight`, so the ring and the current indicator never share a colour. The pseudo-element sets `forced-color-adjust: none`, as the theme's Listbox and Toggle do. Today's trick of painting transparent borders `Canvas` goes away, because no item has a border.
- **S5. Unchanged:** `min-block-size: var(--kv-control-min-block-size)` (44px, 32px in `kv-compact` from 64rem, never under 24 × 24px), a full-width target, the 8px radius the ring follows, the `.kv-link` ring (2px `focus-ring`, 2px offset), the 16px nested indent (except in D), `display: flex` with `overflow-wrap: anywhere`, logical properties only, the `aria-current` and `data-current` selectors, one import, and no new class, prop, `data-*` attribute or token. No motion is added: the existing `.kv-link` transitions stay under `prefers-reduced-motion: no-preference`, and the indicator arrives with the page.
- **Content:** no strings and no i18n keys. The labels and the navigation's name belong to the consumer.
- **Flow:** not applicable.

## 5. The options

The four options cover the space between "a mark" and "a surface". A draws a mark on a pill, B a pill only, C a solid pill, and D a mark with no pill.

Ratios are given as light / dark / light-contrast / dark-contrast. They were computed with the `contrast.ts` formula and the `theme.css` palette. They are not `theme:check` output.

No option uses `primary` as text, because it's only 4.44:1 on the dark canvas (the comment at `theme.css` line 461). `primary` is only ever a bar, a fill or a segment, which need 3:1. The labels are `text`, or `on-primary` on the fill in C.

|                                          | A. Straight bar                                                   | B. Quiet fill                                                                                | C. Solid fill                                                                                                   | D. Rail                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Idea                                     | Today's tint, with the bar drawn as a straight mark inside it     | Linear's way: a soft tinted row and weight, no bar                                           | Invert the current row: a `primary` fill and an `on-primary` label                                              | No pills: a hairline rail along each list, and a `primary` segment next to the current item |
| Fixes                                    | 1, 2 and 4, and 3 in part                                         | 1, 2, 3 and 4                                                                                | 1, 2, 3 and 4                                                                                                   | 1, 2, 3 and 4. Nested lists also read as a tree                                             |
| Current page without colour (1.4.1)      | The bar (a shape) and weight                                      | Weight only                                                                                  | The filled shape and weight                                                                                     | The segment (a shape) and weight                                                            |
| The indicator it relies on (1.4.11, 3:1) | The bar, `primary` on `primary-subtle`: 4.15 / 3.32 / 8.72 / 8.33 | The bold label, which is text at 4.5:1 or more. The tint is decoration: 1.07–1.34:1          | The fill, `primary` on `canvas`, `surface` and `surface-raised`: 4.42–4.70 / 3.75–4.44 / 9.29–9.89 / 9.40–11.14 | The segment, with the same pairs as C                                                       |
| Surfaces for one state                   | 1 (a pill with a mark)                                            | 1                                                                                            | 1                                                                                                               | 0 (a line)                                                                                  |
| Main risk                                | The least change to the look                                      | The weakest cue: on a light `surface` sidebar the tint is 1.07:1, so weight carries it alone | It reads as the Listbox's keyboard-active option, a pressed Toggle or a primary button                          | The biggest change to the look, and a deeper nested indent                                  |
| `theme.css` §8                           | About 25 lines                                                    | About 25                                                                                     | About 25                                                                                                        | About 40                                                                                    |

`ITEM` below is `.kv-navigation-item > .kv-link:not(.kv-link--service)`, and `CURRENT` is `ITEM:is([data-current], [aria-current]:not([aria-current='false']))`. Write them out in `theme.css`.

### A. Straight bar (not chosen)

Keep today's tint, and draw the bar as a straight 4px mark inside it, so the pill and its mark read as one shape. It fixes issues 1, 2 and 4, and issue 3 in part: the pill appears only on the current page.

| State                   | Look                                                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                 | `text`, weight 400, no fill, no underline. Padding is 16px at the start and 12px at the end                                                                                                  |
| Hover, active           | Default plus a 2px underline in `text`                                                                                                                                                       |
| Focus-visible           | The `.kv-link` ring: 2px `focus-ring`, 2px offset, following the 8px radius                                                                                                                  |
| Current                 | A `primary-subtle` fill, weight 600, and a `primary` bar 4px wide with round ends (`radius-full`), 4px in from the inline start and 8px from the top and bottom. It never enters the corners |
| Current + hover         | Current plus the underline                                                                                                                                                                   |
| Current + focus-visible | The ring is 2px outside the pill and the bar is 4px inside it: 6px apart, with the tint between them. A closed ring and a short stroke can't be confused                                     |

- **Not by colour alone:** the bar is a shape, the weight is a second cue, and `aria-current="page"` tells assistive technology.
- **3:1:** the bar against the tint around it is 4.15 / 3.32 / 8.72 / 8.33. The ring is unchanged.
- **Tokens:** `primary`, `primary-subtle`, `text`, `focus-ring`, `--kv-indicator-width`, `--kv-radius-full`, `--kv-space-1`, `--kv-space-2`, `--kv-space-3` and `--kv-space-4`, and `--kv-font-body-weight`. No new token. **Pairs** (all already in `theme:check`): `primary` on `primary-subtle` (non-text), `text` on `primary-subtle` (text, at 16.80 / 14.66 / 18.41 / 15.59), `focus-ring` on the plain backgrounds, and `text` on the plain backgrounds for the underline.
- **Modes:**
  - In dark the tokens remap, with no rule of their own. In the contrast themes the bar is `primary-800` or `primary-200`.
  - Forced colours follow S4: the tint drops, and the bar is `LinkText`.
  - At 320px, with long words and 1.4.12 text spacing, the bar is absolutely positioned. It never takes part in the flex layout or the min-content width. A label that wraps makes the item taller, and the bar grows with it.
  - In RTL, `inset-inline-start` and `padding-inline` put the bar on the right.
  - A nested list keeps its 16px indent, and a nested current item has its bar at its own start.
  - In compact density the rows are 32px and the bar 16px.
- **Cost:** about 25 lines in §8. Remove the item's `border-inline-start`, the hover fill, the current bar colour and both forced-colours bar rules, and add one `::before` rule. It stays one import, with no new class.

```css
ITEM {
  position: relative;
  /* …display, min-block-size, padding-block, radius, font family and size, line height,
   * text-decoration: none and overflow-wrap: anywhere as today. No border-inline-start. */
  padding-inline: var(--kv-space-4) var(--kv-space-3);
  font-weight: var(--kv-font-body-weight);
}

ITEM:is(:hover, :active) {
  text-decoration-line: underline;
  text-decoration-thickness: var(--kv-link-underline-thickness-hover);
}

CURRENT {
  background-color: var(--kv-color-primary-subtle);
  font-weight: 600;
}

/* A straight bar inside the tint. Never a border: on a rounded box it follows the corners. */
CURRENT::before {
  content: '';
  position: absolute;
  inset-block: var(--kv-space-2);
  inset-inline-start: var(--kv-space-1);
  inline-size: var(--kv-indicator-width);
  border-radius: var(--kv-radius-full);
  background-color: var(--kv-color-primary);
}

@media (forced-colors: active) {
  ITEM {
    color: LinkText;
    text-decoration-line: none;
  }

  CURRENT::before {
    forced-color-adjust: none;
    background-color: LinkText;
  }
}
```

### B. Quiet fill (not chosen)

Linear's way: the current page is a soft tinted row and a heavier label, with no bar. It fixes issues 1, 2, 3 and 4.

| State                                 | Look                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Default, hover, active, focus-visible | As in A                                                                    |
| Current                               | A `primary-subtle` fill, weight 600, `text` label. No bar                  |
| Current + hover                       | Current plus the underline                                                 |
| Current + focus-visible               | The ring around the pill. Nothing else on the row could be mistaken for it |

- **Not by colour alone:** the weight change (G182) is the only cue that isn't colour. The label stays `text` on purpose. A label in `link` (3.23 / 3.10:1 against `text`) would add a colour cue, but it makes the one link you don't need to follow look the most like a link, and the difference falls to 2.11 / 1.87:1 in the contrast themes.
- **3:1:** the necessary information is the bold label, which is text (16.80 / 14.66 / 18.41 / 15.59). The tint is decoration and doesn't reach 3:1 anywhere: 1.13 / 1.34:1 on `canvas` and 1.07 / 1.22:1 on `surface`. On a light `surface` sidebar, like the docs site, it's almost invisible, and weight carries the current page alone.
- **Tokens and pairs:** as in A, without the bar.
- **Modes:**
  - Forced colours follow S4. The tint drops, so the bar is added there only, and B looks different in forced colours than in the other themes.
  - At 14px in compact, the step from 400 to 600 is the whole cue, so test it with staff.
  - A brand font set with `--kv-font-family-body` may have a weak 600, which would weaken the cue further.
  - Everything else is as in A.
- **Cost:** as in A, except that the `::before` rule exists only inside the forced-colours block, with its full geometry there. DESIGN.md drops the bar from the navigation rule.

### C. Solid fill (chosen, with T3)

Invert the current row: a `primary` fill with an `on-primary` label. It fixes issues 1, 2, 3 and 4.

| State                                 | Look                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Default, hover, active, focus-visible | As in A                                                                                                                              |
| Current                               | A `primary` fill, an `on-primary` label, weight 600                                                                                  |
| Current + hover                       | Current plus the underline in `on-primary`. The fill doesn't darken: `primary-hover` is 2.98:1 on `surface-raised` in dark           |
| Current + focus-visible               | The ring sits 2px outside the fill. Ring against fill is 1.00:1 in light, so only the 2px gap separates them, as on a primary button |

- **Not by colour alone:** the filled shape and the weight.
- **3:1:** the fill against the sidebar is 4.42–4.70 / 3.75–4.44 / 9.29–9.89 / 9.40–11.14. The label (`on-primary` on `primary`) is 4.70 / 4.70 / 9.89 / 11.14. Both pairs are already in `theme:check`.
- **Risks:**
  - In this library a solid `primary` row means "the option the keyboard is on" (the Listbox's active option), and a solid `primary` tile means "on" (a pressed Toggle). A keyboard user who Tabs into the sidebar sees two things that look like focus: the fill and the ring.
  - A filled accent row next to the one primary button makes the accent loud, against DESIGN.md's "used sparingly", and it looks like a button, against "Links look like links".
- **Modes:**
  - In forced colours, `primary` maps to `Highlight`, so without a rule the fill would turn into the user's selection colour, the same as a pressed Toggle and the Listbox's active option. So C drops the fill there (`Canvas` with a `LinkText` label) and takes the S4 bar.
  - Everything else is as in A.
- **Cost:** about 25 lines. In `CURRENT`, the tint becomes `background-color: var(--kv-color-primary); color: var(--kv-color-on-primary)`. There's no `::before` outside forced colours. In forced colours, `CURRENT { background-color: Canvas; color: LinkText }` plus the bar. The front matter `nav-item-current` becomes `primary` and `on-primary`.

### D. Rail (not chosen)

No pills at all. Each list has a 1px hairline rail at its inline start, and the current item has a straight 4px `primary` segment on the rail. It fixes issues 1, 2, 3 and 4, and the nesting reads as a tree.

| State                   | Look                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Default                 | `text`, weight 400, no fill. The list's rail is a 1px `border-subtle` line. The link starts 12px from the rail, with 8px padding |
| Hover, active           | The underline. No fill, and the rail doesn't change, so hover never looks like current                                           |
| Focus-visible           | The ring around the link (8px radius), 8px clear of the rail                                                                     |
| Current                 | A `primary` segment as tall as the item and 4px wide, with square ends, laid over the rail. Weight 600                           |
| Current + hover         | Current plus the underline                                                                                                       |
| Current + focus-visible | The ring around the link, with the segment 5px outside it                                                                        |

- **Not by colour alone:** the segment is a shape, and the weight is a second cue.
- **3:1:** the segment against the sidebar uses the same pairs as C's fill. The rail is decoration: `border-subtle` at 1.18–1.36:1, as DESIGN.md allows for hairlines. It identifies nothing a user must operate.
- **Tokens:** `primary`, `border-subtle`, `text`, `focus-ring`, `--kv-indicator-width`, `--kv-border-width`, `--kv-space-2`, `--kv-space-3` and `--kv-space-5`, and `--kv-font-body-weight`. No new token. **Pairs:** `primary` on the plain backgrounds, already in `theme:check`.
- **Modes:**
  - Forced colours: the rail becomes `CanvasText` on its own (`border-subtle` maps to it), and the segment is `LinkText`. That's 4px against 1px, and a different colour.
  - Nested lists: the nested list has its own rail, 20px in, under the parent's label. Nested labels start 41px from the outer rail, compared with 32px today.
  - At 320px each level costs 13px of width (the rail and the gap). `overflow-wrap: anywhere` still wraps the Finnish compound.
  - In RTL the rails and segments sit on the right.
  - The segment sits outside the link box but belongs to the link, so a click on it follows the link.
- **Cost:** about 40 lines. The rail goes on `.kv-navigation-list`, the nested list's indent becomes a margin, and the item gets a margin and new padding. The `::before` segment uses `inset-block: 0; inset-inline-start: calc(-1 * (var(--kv-space-3) + var(--kv-border-width)))`, with forced colours as in S4. Consumer CSS that lines up with the items has to be checked: the docs site's group label (`docs-nav-group-label`) is 12px in, and the links' labels would be 20px in.

## 6. Considered and discarded

- **A bar from an inset `box-shadow`.** An inset shadow is clipped to the rounded padding box, so it curves just like the border does. Forced colours also removes `box-shadow`, so the indicator would vanish there.
- **An underline as the current-page marker.** It collides with the hover underline (S2), and with the underline links get at rest in the contrast themes and in forced colours. Current and hover would look the same.
- **A leading marker or chevron.** A chevron means "opens" or "goes on": NavigationMenu (M4) will use one for its disclosures, and the service link uses `arrow-forward`. A dot reads as a list bullet or an "unread" badge. Either one shifts the label of the current item unless every item reserves the room.
- **Shorter rows.** 44px is the comfortable target size (2.5.5) and the DESIGN.md minimum for resident-facing controls. Issue 4 is solved by drawing less.

## 7. Recommendation

> Superseded by the maintainer's shortlist on 2026-10-05: A and D are out, and §12.7 recommends between B and C. This section is the record of the first round.

**A, Straight bar.** It keeps the look the maintainer approved in Plan 0043, a lavender tint with a bar, and changes only what fails: the bar's shape, the weight and the hover. That is DESIGN.md's own rule, "keep the look, change the value". It fixes issues 1, 2 and 4 outright, and 3 in part: the tint and the bar remain two layers, but of one shape, and only on the current page. The cue that doesn't rely on colour is a shape held at 3:1 by a pair `theme:check` already measures (`primary` on `primary-subtle`, 3.32:1 at its lowest), plus a two-step weight change. It's the smallest change to `theme.css`, with no new token, class or contrast pair. It matches the public-sector prior art: USWDS draws its current bar exactly this way, as an inset pseudo-element with a system colour in forced colours.

D is the runner-up, if the maintainer wants no pills at all. It suits deep staff and docs sidebars best, at the cost of a bigger change to the look. B is the most Linear-like, but it leaves residents with weight as the only cue. C isn't recommended: a solid accent row already means "the keyboard is here" in this library.

## 8. What needs the maintainer's approval

Every option changes DESIGN.md rules, so it needs the maintainer's approval, with `theme.css` §8 updated in the same change and `theme:check` run by the orchestrator. No option adds a token, a contrast pair, a class or a dependency, and none is an accessibility trade-off or an APG deviation.

1. **The option itself.** It changes the DESIGN.md Colors rule for navigation ("an inline-start bar and weight 600"), the Shapes line on the 4px indicator bar, the Components line "Navigation items", and the semantic table's use of `surface-raised` for "hovered navigation items". For C and D it also changes the front matter `nav-item-current` (C: `primary` and `on-primary`; D: no background).
2. **S1, weight 400 at rest:** the DESIGN.md Typography line "Weights", and the front matter `nav-item` typography.
3. **S2, the hover underline instead of a fill.**
4. In the same change, engineering also updates:
   - `docs/design/navigation.md` §6.2, §6.3 and §6.5: mark the item rows as replaced by this spec.
   - `navigation.a11y.md`, "Visual / modes".
   - `link.a11y.md`, the forced-colours line.
   - The comment in `contrast-requirements.ts` that names the use of `primary` on `primary-subtle`.
   - The story JSDoc for Link › Current Page and Navigation › RTL, which mention "a background, a bar and weight" and "the current bar".
   - A changeset for `@kvirn-ui/theme`.

## 9. Accessibility annotations

Nothing changes in roles, names, keys or focus. This is a visual change, so the contract keeps its rows.

- **Roles and names:** `<nav>` with `label` or `aria-labelledby`, native lists, native links. The current page is `aria-current="page"` from `current` on Link, and `data-current` is the styling hook.
- **Keyboard:** native focus. Every link is its own Tab stop in DOM order, which is the visual order. There are no arrow keys (it isn't a menu), and Navigation never moves focus.

  | Key       | Context                     | Action                                                                          |
  | --------- | --------------------------- | ------------------------------------------------------------------------------- |
  | Tab       | before or in the navigation | Moves to the next link, nested links in DOM order included, then out of the nav |
  | Shift+Tab | on a link                   | Moves to the previous link, then out of the navigation                          |
  | Enter     | on a link                   | Follows the link                                                                |

- **Focus visible (2.4.7, 2.4.13):** the `.kv-link` ring, unchanged. In every option it keeps a different shape and position from the current indicator. In forced colours they also differ in colour (`Highlight` and `LinkText`).
- **Tests (engineering's call, `testing` skill):** the existing rows stay green. There's a gap: no test proves the current page has a cue other than colour in forced colours. A test in `chromium-forced-colors` could assert that a non-colour cue exists, not its value (hard rule 13).
- **WCAG SCs:** 1.3.1, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 1.4.12, 2.4.7, 2.5.8, 4.1.2. These options are designed to meet WCAG 2.2 AA. Nothing has been tested yet: the gates run when the chosen option is implemented, and manual AT is `pending`.

## 10. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`. No blocker in A, C or D. B meets 1.4.1 by weight alone (G182), which is the weakest cue of the four. C fails no criterion, but carries the risk of being mistaken for focus.
- [x] Contrast of every pair the options use is computed with the `contrast.ts` formula, and every pair is already in `theme:check`. The orchestrator runs `vp run theme:check` after the `theme.css` change.
- [x] Usability test plan written. Result: `pending`.

### Usability test plan (pending)

- **Participants:** 6 to 8 residents. They include someone using a screen magnifier at 200–400%, a Windows contrast-theme user, a screen-reader user (to confirm nothing changes for them), people with low digital confidence, and second-language readers of Finnish and Swedish. Add 3 staff in compact density.
- **Tasks:** a five-second test of each option in random order: "Which page are you on?" Then "Point to where you'd go for Bygga om". With focus on a link that isn't current: "Where is the keyboard focus?" (C's risk). Ask for a preference only at the end.
- **Measure:** correct first answers for the current page, time to answer, wrong answers about where focus is, and whether anyone reads the current item as a button.

## 11. Open questions

1. S1 and S2 can be decided separately from the option. Is weight 400 at rest acceptable for navigation items? Is the hover underline acceptable, or should hover stay a fill? A fill would need a new neutral token, such as a hover surface one step past `surface`, with the maintainer's approval.
2. Follow-up for `component-engineer`, outside this spec's scope: should `.kv-story-surface` (rounded, with a hairline on all four sides) follow DESIGN.md's Section, square with one inline-end hairline like the docs sidebar? Today it makes Navigation look like it sits in a card.
3. The DESIGN.md front matter documents `nav-item` as 32px with `label-compact`, which is compact density, while `theme.css` is 44px with 16px labels by default. Align it when the option lands.
4. A cue for the parent of the current page (`aria-current="true"`) is still open from navigation.md §10. D would make a grey segment on the parent's rail natural.
5. Should D ship later as a choice class (`kv-navigation--rail`) for docs and staff sidebars? This spec doesn't recommend it now (fewer ceremonies).
6. Designsystemet (NO) and the Suomi.fi design system weren't checked. Someone with access could add how they mark the current page.

## 12. Active trail

The maintainer, on 2026-10-05: "Quiet/Solid fill fits our theme the best, but in navigation, especially cms i want to see active trail to, either by lines or arrows marking "path" or just by indicating the path ending up to the current active item". A and D are out. B and C both stay in play, and this section recommends one of them.

The prototype has an "Active trail" part: each treatment drawn with B and with C, four levels deep with the current page at level 3, in light and dark. It also has stress cases: 320px with a long Finnish label, right to left, compact density, a collapsed sibling group in every tree, and a trail branch that is itself collapsed. Emulate forced colours in DevTools.

### 12.1 What a trail must tell the user

In order of emphasis:

1. **Where am I.** The current page, always the strongest mark.
2. **Which branch I'm in.** Every ancestor from the top level down to the current page, marked on its own row. A user scanning a long CMS menu should find "the section I'm in" without counting indents. The trail has to differ from a group someone opened that isn't on the path, and from a collapsed group.
3. **How deep.** The 16px indent per level already shows the level without colour. The trail must step with the indent, not flatten it.

**Emphasis order: current > trail > the rest.**

- Under B the current page is quiet: a tint of 1.07–1.34:1 and weight 600. A trail drawn with the tint or with weight would equal or outshine it, so under B the trail needs another channel: a line or a mark.
- Under C the current page is loud: a fill of 3.75:1 or more. The trail may use weight or the quiet tint, and must stay quieter than the fill.

The indent already makes the trail derivable: the parent is the nearest less-indented row above. So the trail is an at-a-glance aid on top of a structure that is already there. Even so, it's held to the same rules as any other information. It never relies on colour alone (1.4.1), and any mark a user needs to read it reaches 3:1 (1.4.11).

### 12.2 What's missing today

1. **There is no trail.** Ancestors look like every other item. Only the indent ties the current page to its section, so in a tree with ten or more siblings per level, a user traces upward row by row.
2. **Every `aria-current` value looks current.** The theme's selector matches any value. A CMS that follows GOV.UK and marks the section `aria-current="true"` next to the page's `aria-current="page"` gets two items that both look like the current page.
3. **A collapsed group rendered with `hidden` comes back.** `.kv-navigation-list { display: flex }` beats the browser's own `[hidden]` rule. Only the opt-in `reset.css` restores it (`[hidden] { display: none !important }`). This is out of scope here: see §12.9.
4. **B has no shape for the current page,** so a trail drawn in B's own language (tint, weight) would make the current page look like its ancestors.

### 12.3 How the trail is known (question 1)

`CURRENT-LINK` below is today's `.kv-link:is([data-current], [aria-current]:not([aria-current='false']))`.

|                                                        | How                                                                                                                                                                                                                                                                                                               | API change                                                                                           | When the current link isn't in the DOM                                                                                         |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **M1. CSS `:has()` (recommended)**                     | The theme finds every item whose nested list contains the current link: `.kv-navigation-item:has(> .kv-navigation-list CURRENT-LINK)`. T1 also uses `:has(CURRENT-LINK)` and `:has(~ .kv-navigation-item CURRENT-LINK)`. None of them nests a `:has()`                                                            | None                                                                                                 | Two ways, both with today's API (below)                                                                                        |
| M2. A `Navigation.Item` prop that renders `data-trail` | The consumer passes a boolean (the name is open, for example `trail`), and the component renders the state, as Link turns `current` into `data-current`. The architecture doc says state is "set by the components and never by the consumer", so a bare `data-trail` the consumer writes by hand isn't an option | Yes: a prop, `NavigationItemPartProps`, docs, a changeset and tests. Needs the maintainer's approval | Works: the CMS marks the ancestors, rendered or not                                                                            |
| M3. Navigation works the trail out itself              | Link reports `current` to a Navigation context, or an effect reads the DOM after commit                                                                                                                                                                                                                           | Yes, and it ties Link to Navigation                                                                  | Doesn't help: it can't see an unrendered link either. An effect also means no trail at first paint and none without JavaScript |

**Recommendation: M1.**

- `theme.css` already uses `:has()` 141 times, including the later-sibling form `:has(~ …)` that T1 needs (InputGroup, Kbd). The trail adds no requirement the theme doesn't already have. This spec makes no claim about browser support.
- `:has()` matches the DOM, not what's rendered, so the trail is right at first paint, without JavaScript, and when the current link sits inside a group hidden with `hidden`.
- When the current link isn't in the DOM, the consumer uses today's API:
  - **A collapsed group:** render it with `hidden` instead of unmounting it. APG's disclosure navigation example keeps its sub-lists in the DOM too.
  - **A navigation that stops above the current page** (a lazy tree, or a menu with fewer levels than the site): mark the deepest item shown with `current={true}`, which renders `aria-current="true"` and `data-current`. That is GOV.UK's `active` item: "the user is within this group of pages in the navigation hierarchy". The theme draws it as the end of the trail, and `:has()` marks its ancestors.
- Either way, a navigation keeps exactly one current item, which the contract already asks for.

M2 is the fallback if a CMS team can do neither. It needs the maintainer's approval.

### 12.4 What assistive technology gets (question 2)

- **Unchanged:** `aria-current="page"` on the current link only.
- **What conveys the trail:**
  - **List nesting.** The current link sits inside the nested lists of its ancestors, and screen readers announce entering a nested list. How much they say (item counts, level) varies by screen reader, and it's part of the AT matrix, which is `pending`. APG's disclosure navigation example relies on the same thing: "The semantics of the list structure communicates the hierarchy of the navigation system to assistive technology users."
  - **In NavigationMenu (M4), `aria-expanded="true"`** on each open toggle. When only the trail is open, the open toggles are the trail.
- **What doesn't:** the lines, arrows, weight and tint. They're CSS: a pseudo-element with `content: ''` adds nothing to the accessibility tree, and font weight isn't announced. A screen-reader user isn't told "this item is on your path".
- **`aria-current` on ancestors is justified in one case only.** When the current page isn't in the navigation, `aria-current="true"` on the deepest item shown is GOV.UK's pattern, and the navigation still has one current item.
- **When the current page is listed, it's harmful.** ARIA asks authors to mark only one element in a set as current. Screen-reader users would hear "current" on two or three links and "current page" on one. In a links list they couldn't tell which one is "here", and they might follow the parent thinking it's the page.
- **No new strings.** Visually hidden text such as "on your path" would need a message in all six locales, with per-provider and per-instance overrides (hard rule 4). The hierarchy is already in the structure, and an announced path is the Breadcrumb's job (planned, M3). A CMS page with a deep tree should pair Navigation with a Breadcrumb.

### 12.5 The three treatments

Each treatment is drawn with B and with C. The trail colour is `primary` under B, because the trail is B's only shape and it ends at the current page. It's `secondary` under C, because the trail must stay quieter than the fill. `secondary` is a role token, so a brand can tint it.

Ratios are light / dark / light-contrast / dark-contrast, computed with the `contrast.ts` formula, and every pair is already in `theme:check`:

- `primary` on `canvas`, `surface` and `surface-raised`: 4.42–4.70 / 3.75–4.44 / 9.29–9.89 / 9.40–11.14
- `secondary` on the same: 4.68–4.98 / 3.54–4.19 / 10.21–10.86 / 12.05–14.28

|                                   | T1. Connector line                                                                                                                                                  | T2. Signpost arrows                                                                                               | T3. Marked path                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Seed                              | "lines", and "an elbow connector that ends at the current item"                                                                                                     | "arrows marking path"                                                                                             | "just by indicating the path ending up to the current active item"                                        |
| Idea                              | A 1px line runs down each sub-list on the trail, past the siblings above the trail item, and turns into it with an elbow. The last elbow points at the current page | A small down arrow (a shaft and a head) at the start of every ancestor row: "the way to your page goes down here" | Every ancestor row gets a lighter version of the current page's look                                      |
| Channel                           | A shape (a line)                                                                                                                                                    | A shape (an arrow)                                                                                                | Weight, plus the quiet tint under C                                                                       |
| With B                            | A `primary` line. The current page stays tint and 600, and the elbow ends at it                                                                                     | `primary` arrows. The current page stays tint and 600                                                             | Ancestors at 600: **not viable**. The current page then differs from its ancestors by a 1.07:1 tint alone |
| With C                            | A `secondary` line, and the solid current page                                                                                                                      | `secondary` arrows, and the solid current page                                                                    | Ancestors in the quiet tint (`primary-subtle`) at 600, and the solid current page                         |
| Many siblings                     | The best: the line visibly joins each ancestor to its trail item, past every sibling                                                                                | Each ancestor is marked. The indent does the joining                                                              | Each ancestor is marked. The indent does the joining                                                      |
| Trail branch collapsed (`hidden`) | The line is gone: it lives in the hidden sub-list                                                                                                                   | The arrow stays on the collapsed ancestor                                                                         | The ancestor stays marked                                                                                 |
| Forced colours                    | `CanvasText` lines                                                                                                                                                  | `CanvasText` arrows                                                                                               | Weight only (the tint drops)                                                                              |
| `theme.css`                       | About 35 lines                                                                                                                                                      | About 30 lines                                                                                                    | About 8 lines                                                                                             |

#### T1. Connector line (not chosen)

- **Geometry.** In each sub-list on the trail, a 1px line runs 4px in from the sub-list's start, inside the 16px indent and under the parent row's start padding.
  - An item above the trail item (a "passing" item) draws the line for its full height, plus the 4px gap above it, so the segments join.
  - The trail item draws the turn: down to the middle of its first row (22px, or 16px in compact density), then an elbow with the `radius-sm` corner towards the item.
  - The elbow stops 6px short of the item. The focus ring reaches 4px out, so the two never touch, and a closed ring and an open line can't be confused.
  - Items below the trail item, and the current page's own children, have no line.
- **States.** Hover underlines the label, and focus draws the ring around the row. Neither touches the line, which lives in the indent. The current page keeps B's or C's look.
- **Not by colour alone.** The line is a shape at 3:1 or more. Under B, the elbow at the end gives the current page a shape it otherwise lacks.
- **Modes:**
  - Dark and the contrast themes remap the tokens.
  - Forced colours: the lines are `CanvasText`, the current page's S4 bar is `LinkText`, and the ring is `Highlight`, so the three never share a colour.
  - RTL: `border-inline-start`, `border-block-end`, `border-end-start-radius` and `inset-inline-start` mirror it.
  - Compact density: the elbow sits at 16px.
  - A long label that wraps leaves the elbow at its first line.
  - At 320px the line costs no width: it lives inside the existing indent.
  - Nothing moves, so reduced motion has nothing to stop.
- **Limits:** the line disappears when the trail branch is collapsed, and a 1px line is the thinnest mark of the three. A 2px line would need DESIGN.md's "Lines are 1px" changed.

```css
/* T1. A passing item: the line runs past it, through the gap above it. */
.kv-navigation-list
  .kv-navigation-list
  > .kv-navigation-item:has(~ .kv-navigation-item CURRENT-LINK)::before {
  content: '';
  position: absolute; /* the nested item is position: relative */
  inset-block: calc(-1 * var(--kv-space-1)) 0;
  inset-inline-start: calc(var(--kv-space-1) - var(--kv-space-4));
  border-inline-start: var(--kv-border-width) solid var(--kv-color-secondary); /* primary with B */
}

/* T1. The trail item: down to the middle of its first row, then an elbow towards it. */
.kv-navigation-list .kv-navigation-list > .kv-navigation-item:has(CURRENT-LINK)::before {
  content: '';
  position: absolute;
  box-sizing: border-box;
  inset-block-start: calc(-1 * var(--kv-space-1));
  inset-inline-start: calc(var(--kv-space-1) - var(--kv-space-4));
  inline-size: calc(var(--kv-space-2) - 2 * var(--kv-border-width));
  block-size: calc(var(--kv-control-min-block-size) / 2 + var(--kv-space-1));
  border-inline-start: var(--kv-border-width) solid var(--kv-color-secondary);
  border-block-end: var(--kv-border-width) solid var(--kv-color-secondary);
  border-end-start-radius: var(--kv-radius-sm);
}

@media (forced-colors: active) {
  .kv-navigation-list
    .kv-navigation-list
    > .kv-navigation-item:is(:has(CURRENT-LINK), :has(~ .kv-navigation-item CURRENT-LINK))::before {
    border-color: CanvasText;
  }
}
```

#### T2. Signpost arrows (not chosen)

- **Geometry.** Every ancestor row draws a down arrow centred in its 16px start padding, on its first line. It's a 12px shaft (`::before`) and a 90° head with 45° arms (`::after`, two 1px borders turned 45°), in the outline style of the built-in icons. It's about 12px tall at 16px text and scales with `rem`.
  - The built-in icons themselves can't be used. They're React components a consumer renders, and the theme never sets an icon's size, stroke or colour (icon.md §6.2).
  - The current page gets no arrow: it's where the arrows lead.
- **Why a down arrow, and not a chevron or a sideways arrow.**
  - `chevron-down` already means "open" (Disclosure, NavigationMenu), and `chevron-forward` is the breadcrumb separator and NavigationMenu's sub-level mark (icon.md §4.1).
  - A sideways arrow before a label reads as "go" (`arrow-forward`, the service link) or as "child of the row above" (the hook convention in CMS admin lists).
  - The current page is always below its ancestors, so a down arrow points along the path. It's vertical, so it doesn't mirror (DESIGN.md, Icons). Only its position moves, through `inset-inline-start`.
  - NavigationMenu (M4) should keep its disclosure chevron at the inline end, so the two never sit in the same place (§12.9).
- **States.** The arrow sits inside the row's start padding. Hover underlines the label, not the arrow, and the ring goes around the row.
- **Not by colour alone.** The arrow is a shape at 3:1 or more.
- **Modes:**
  - Forced colours: the arrows are `CanvasText`.
  - RTL: the arrow moves to the right, and still points down.
  - Compact density: centred on a 32px row.
  - A long label that wraps leaves the arrow at its first line.
  - At 320px the arrow costs no width (the padding is already there).
- **Limits:** a small mark that some may read as "expand". It marks the ancestors, but not the join between an ancestor and its trail item across many siblings.

#### T3. Marked path (chosen, with C)

- **Under C:** every ancestor row gets the quiet tint (`primary-subtle`) and weight 600, and the current page is the solid fill. It uses both fills the maintainer shortlisted as one system: the quiet fill marks the way, and the solid fill marks the end.
- **Under B: not viable.** Ancestors at 600 and the current page at 600 plus the tint differ by 1.07–1.34:1 only, so the current page and its ancestors look the same. The prototype shows it so the failure can be seen.
- **Not by colour alone (C).**
  - The trail is told from the rest by weight: 600 against 400, two steps (G182).
  - The current page is told from the trail by a fill that reaches 3:1 against the surface. The ancestors' tint doesn't (1.13 / 1.34:1 on `canvas`). The label colour changes too.
  - The marks a user needs are text (`text` on `primary-subtle`, 16.80 / 14.66 / 18.41 / 15.59) and the 3:1 fill.
- **Modes:**
  - Forced colours: the tint drops, so the ancestors keep weight 600, and the current page has the S4 bar and 600. That's the weakest trail of the three, but still not colour alone.
  - Everything else is unchanged: nothing is added to the geometry, so 320px, long words, RTL, compact density and 1.4.12 text spacing behave as in C.
  - A collapsed trail branch keeps its ancestor marked, because `:has()` sees links under `hidden`.

```css
/* T3. An ancestor of the current page: the quiet fill and weight. */
.kv-navigation-item:has(> .kv-navigation-list CURRENT-LINK) > .kv-link:not(.kv-link--service) {
  background-color: var(--kv-color-primary-subtle); /* C only */
  font-weight: 600;
}
```

### 12.6 Checks shared by the three

- **Focus ring:** unchanged, and in every treatment it differs in shape and place from the trail. In forced colours it also differs in colour (`Highlight` against `CanvasText`).
- **Hover:** the underline stays readable on every row: `text` on a tinted ancestor (16.80:1 or more), and `on-primary` on C's fill (4.70:1 or more).
- **Target size:** rows are unchanged (44px, 32px in compact density, never under 24 × 24px, 2.5.8). The marks are decorative and add no target.
- **Nested indent:** 16px per level, unchanged, so the level shows without colour.
- **Reduced motion:** nothing animates. The trail arrives with the page.
- **Contrast pairs:** none new. `primary` and `secondary` on the plain backgrounds, `text` on `primary-subtle` and `on-primary` on `primary` are all already in `theme:check`.

### 12.7 Recommended pairing: C with T3 (chosen)

**C, Solid fill, with T3, Marked path.** The current page is a solid `primary` row, every ancestor row is the quiet tint and bold, and the rest is plain. The reasons:

1. **It serves the hardest case.**
   - The current page is the one shape in the list at 3:1 or more (3.75:1 at its lowest), so a low-vision user at 200% finds "where am I" at once.
   - The trail is two steps of weight, which is readable at 14px in compact density and survives forced colours.
   - B can't give that: its current page is weight alone, and every trail under B has to borrow a line or an arrow to rank below it.
2. **It's the clearest ranking:** solid, then quiet fill and bold, then plain.
3. **It's the most robust.** It adds no geometry, so long labels, 320px, RTL, compact density and text spacing can't break it, and a collapsed trail branch stays marked.
4. **It's the cheapest:** about 8 lines on top of C, with no new token, class, pair or API.
5. **It fits the theme.** It uses both fills the maintainer shortlisted, each for one job.

**Risks:**

- In forced colours, the trail falls back to weight alone.
- C's solid row is the same as the Listbox's keyboard-active option (§5, C). The usability test checks whether keyboard users mistake it for focus.
- If they do, the fallback is **B with T1**: the line gives B's quiet current page a shape at its end, without competing on tint or weight.
- For staff trees with many siblings per level, T1's line can later be added on top of C with T3 (about 35 more lines), if testing shows the join across siblings is missed.

### 12.8 Cost in `theme.css`

On top of the chosen current-page option (§5), in §8:

| Pairing                 | Lines    | What changes                                                                                                  |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| C with T3 (recommended) | About 8  | One rule for ancestor rows. Forced colours need nothing more                                                  |
| B with T1               | About 35 | `position: relative` on nested items, two `::before` rules (passing and turning), and a forced-colours colour |
| C with T1               | About 35 | As B with T1, with `secondary`                                                                                |
| B or C with T2          | About 30 | Two pseudo-elements on ancestor rows, and a forced-colours colour                                             |

All of them stay one import, with no new class or `data-*` (with M1), and no change to `@kvirn-ui/react`.

### 12.9 Decisions for the maintainer

> Decided on 2026-10-05: C with T3, M1, and the consumer rule (item 3). The follow-ups in item 4 are in Plan 0047 (the `[hidden]` rule) or stay on the roadmap (NavigationMenu, Breadcrumb). §13.6 refines item 3 for links inside a `hidden` group.

1. **B or C, and the trail.** Recommended: C with T3. It changes:
   - the DESIGN.md navigation rule (Colors, Shapes, Components), to add the trail;
   - the semantic table's use of `primary-subtle`, which gains "trail ancestors";
   - the front matter `nav-item-current` (C).

   T1 or T2 under C would instead give `secondary` a new use, "the navigation trail", next to the secondary button's edge. No new token is needed in any case.

2. **The mechanism:** M1, CSS `:has()`, with no API change. M2, a `Navigation.Item` prop that renders `data-trail`, needs approval, a plan, a changeset and docs, and is only worth it if a CMS team can neither render collapsed groups with `hidden` nor mark the deepest item shown with `current={true}`.
3. **The consumer rule for AT:** exactly one `aria-current` per navigation. It's `"page"` when the page is listed. Otherwise it's `true` on the deepest item shown (GOV.UK's `active`). Never `aria-current` on ancestors when the page is listed. This goes in navigation.md and in the contract's consumer responsibilities.
4. **Follow-ups outside this spec:**
   - `theme.css` needs `.kv-navigation-list[hidden] { display: none }` (or `:where([hidden])`), so a collapsed group stays collapsed without `reset.css`. That's a bug fix for `component-engineer`.
   - NavigationMenu (M4) should put its disclosure chevron at the inline end.
   - Breadcrumb (M3) is the announced path for deep CMS pages.
5. **Usability test (pending), added to §10's plan:**
   - "Which section is this page in?"
   - "Point to the page above this one", in a tree with ten or more siblings per level.
   - Focus placed on a link that isn't current, then "Where is the keyboard focus?" (C's risk).
   - Run them in forced colours too. Measure correct answers and time.

   §16 replaces this list.

## 13. Horizontal: a bar of plain links in a row

`kv-navigation--horizontal` on `Navigation.Root` lays the top-level list out as a row that wraps. It's a choice class the consumer adds, not a prop, because nothing about the keys or the roles changes. Every link is a Tab stop in DOM order, and there are no arrow keys and no `aria-orientation`: it's a list of links, not a composite.

Use it for a short set of sections in a page header or above the content: "Start, Bygga och bo, Trafik, Uppleva, Om kommunen". It's not Tabs, which switch panels on one page (Plan 0048), and not a menu: flyouts and collapsing are NavigationMenu (M4).

### 13.1 Layout

| Property       | Value                                                                                                                                                                                                                         | Why                                                                                                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top-level list | `flex-direction: row`, `flex-wrap: wrap`, `align-items: flex-start`, `gap: space-2` (8px across and down)                                                                                                                     | A row that wraps and never scrolls (1.4.10). 8px both ways keeps a focus ring, which reaches 4px out, 4px clear of a neighbour's fill on every side. With the vertical list's 4px gap, a ring would touch a solid item below it           |
| Item (`li`)    | Content-sized. `max-inline-size: 100%` and `min-inline-size: min(var(--kv-control-min-block-size), 100%)`                                                                                                                     | A short label still gets a target at least as wide as it is high: 44px, or 32px in compact (2.5.5 in comfortable, 2.5.8 always). A label wider than the row is capped and wraps inside its pill                                           |
| Link           | `padding-inline: space-3` (12px each side). Everything else as the vertical item: `padding-block: space-1`, `min-block-size: var(--kv-control-min-block-size)`, `radius-md`, the control type size, `overflow-wrap: anywhere` | The vertical item has 16px at the start to make room for the forced-colours bar. In a row that bar moves to the bottom (§13.4), so both sides are equal and the label sits in the middle of its pill. Labels are 12 + 8 + 12 = 32px apart |
| Height         | 44px with 16px labels. In `kv-compact` from 64rem, 32px with 14px labels. 44px below 64rem                                                                                                                                    | The same density rule as every control                                                                                                                                                                                                    |
| Weight         | 400 at rest, 600 for the current item and the trail (S1)                                                                                                                                                                      | As vertical                                                                                                                                                                                                                               |
| A nested list  | Stays a column, indented 16px, under its item (the vertical rules)                                                                                                                                                            | One level per bar. The item grows taller, and the row's other items stay at the top. Q-N1 recommends a second navigation instead                                                                                                          |

The first label sits 12px in from the bar's start, because the pill needs that room. To line labels up with the page grid, the consumer can pull the list out by 12px. The theme doesn't do that, because it doesn't know the grid.

### 13.2 States in a row (C with T3)

| State                        | Look                                                                                                                                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                      | `text`, weight 400, no fill, no underline                                                                                                                                                                                                                  |
| Hover, active                | A 2px underline in `text` (S2)                                                                                                                                                                                                                             |
| Focus-visible                | The `.kv-link` ring: 2px `focus-ring`, 2px offset, following the 8px radius. Against its own solid fill the ring is 1.00:1 in light, so the 2px offset band is what separates them, as on a primary button. The 8px gaps keep the ring off every neighbour |
| Current                      | A solid `primary` pill with an `on-primary` label at 600                                                                                                                                                                                                   |
| Trail                        | `primary-subtle` with 600 (§13.3 says when an item in a bar is on the trail)                                                                                                                                                                               |
| Current or trail, with focus | The ring outside the pill                                                                                                                                                                                                                                  |

### 13.3 The trail in a row, and an ancestor whose children aren't shown

Items in one bar are siblings, never each other's ancestors. So a bar item is on the trail only when the current page sits inside its own nested list.

| Case                                                                                                          | What the bar shows                                                                                                                                                       | Who carries `aria-current`      |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| The current page is in the bar                                                                                | Its solid pill                                                                                                                                                           | That link: `page`               |
| The current page is in an item's nested list, shown stacked under it                                          | The item is on the trail (quiet fill, 600), and the page inside it is solid                                                                                              | The page's link: `page`         |
| The current page isn't in the bar at all. This is the usual header bar: sections only, and the page is deeper | The section is the deepest item shown, so it carries `current={true}` (GOV.UK's "active" section). It's drawn solid under the approved rule, and as the trail under Q-N2 | The section: `true`             |
| The section's children are rendered with `hidden`                                                             | `:has()` sees the hidden page link and draws the section as the trail. A screen reader finds no current item in the bar, because a hidden link isn't exposed             | Not allowed: see the rule below |

**Rule (refines §12.9 item 3):** a link inside a `hidden` group never carries `current`. When the current page is inside one, the deepest item that is shown takes `current={true}`.

- Everyone then sees exactly one current item in each navigation.
- The plan's warning `navigation-multiple-current` stays correct as specified. It counts every `aria-current`, hidden ones included, so a consumer who leaves `current` on the hidden link as well is warned.
- §12's "trail branch collapsed" stress case shows the pattern this rule replaces.

### 13.4 Wrap, density, RTL and forced colours

- **320px:**
  - The bar wraps onto as many rows as it needs, starting at the inline start. It never scrolls, and never collapses (collapsing is NavigationMenu).
  - Each item keeps its own width.
  - "Rakentaminen ja asuminen" fits a row as one pill. "Rakennus- ja toimenpidelupahakemuksen liitteet" is wider than the row, so its pill is capped at 100% and the label wraps inside it. `overflow-wrap: anywhere` breaks a compound only where no space fits.
  - 400% zoom on a 1280px window is the same case.
- **40rem:** four to six short sections fit one row, and longer sets wrap.
- **1.4.12 text spacing:** the items grow, nothing has a fixed width, and nothing is clipped.
- **Compact density** (`kv-compact` from 64rem): 32px items, 14px labels, the same 12px padding and 8px gaps.
- **RTL:** the row starts on the right. The padding is the same on both sides and the forced-colours bar is inset on both sides, so nothing needs mirroring. Logical properties throughout.
- **Forced colours:**
  - Fills drop and labels are `LinkText`.
  - The current item gets a straight `LinkText` bar at its block end: 4px high (`--kv-indicator-width`), inset 12px from each side, so it sits under the label and inside the straight part of the bottom edge, never in the rounded corners. It has `forced-color-adjust: none`. This is the horizontal form of S4, and GOV.UK's service navigation draws its active link's border at the bottom on wide screens in the same way.
  - The trail keeps weight 600, the hover underline stays above the bar, and the ring is `Highlight`, so the ring, the bar and the trail never share a colour or a place.
- **Motion:** none added. The existing `.kv-link` transitions stay under `prefers-reduced-motion: no-preference`.

### 13.5 Theme sketch (`theme.css` §8)

`CURRENT-LINK` is as in §12.3.

```css
/* A horizontal bar: the top level in a row that wraps. A nested list stays a column. */
.kv-navigation--horizontal > .kv-navigation-list {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--kv-space-2);
}

.kv-navigation--horizontal > .kv-navigation-list > .kv-navigation-item {
  min-inline-size: min(var(--kv-control-min-block-size), 100%);
  max-inline-size: 100%;
}

.kv-navigation--horizontal
  > .kv-navigation-list
  > .kv-navigation-item
  > .kv-link:not(.kv-link--service) {
  padding-inline: var(--kv-space-3);
}

@media (forced-colors: active) {
  /* The current item's bar moves to the bottom in a row. */
  .kv-navigation--horizontal > .kv-navigation-list > .kv-navigation-item > CURRENT-LINK::before {
    inset-block: auto 0;
    inset-inline: var(--kv-space-3);
    inline-size: auto;
    block-size: var(--kv-indicator-width);
  }
}
```

That's about 25 lines on top of the vertical rules, with no new token, pair or class beyond `kv-navigation--horizontal`.

### 13.6 A bar next to a vertical navigation

A municipal page often has both: a horizontal bar in the header (the sections) and a vertical navigation in a sidebar (the pages of one section).

- **Two `Navigation.Root`s, each named,** for example "Huvudmeny" and "I det här avsnittet", and each with exactly one `aria-current`.
- **The same tokens, heights, type, weights, hover and focus.** Only three things differ: the row layout, the symmetric padding, and where the forced-colours bar sits.
- **The surfaces:**
  - The bar sits in the page header: `canvas` with a block-end `border-subtle` hairline, as the docs site's header does.
  - The sidebar sits in a `surface` Section with an inline-end hairline.
  - Both fills keep their measured pairs on either surface (`primary` 3.75:1 or more, and the trail's label 14.66:1 or more on `primary-subtle`).
- **Two solid fills at once.** Under the approved rule, the bar's section (`aria-current="true"`) and the sidebar's page (`"page"`) are both solid. That's Q-N2.

### 13.7 What changes in other docs

- **`docs/design/navigation.md`:**
  - §5 says "a bar of plain links is Navigation with `kv-navigation--horizontal`; flyouts and collapsing are NavigationMenu".
  - §8 says "vertical by default, `kv-navigation--horizontal` on the root, no prop".
  - These edits are in the plan.
- **The contract** (`navigation.a11y.md`) gets the §13.3 rule about `hidden` groups, next to the plan's "one `aria-current` per navigation".

### 13.8 Open questions for the maintainer

**Q-N1: should the trail branch show as a second row?** Recommendation: **no, not inside one navigation.** Render the branch as a second `Navigation.Root` instead: a second bar right under the first, or a sidebar, named "I det här avsnittet". It looks like a second row, needs nothing built, and wraps on its own at 320px. The reasons:

1. **Focus order would jump** (2.4.3).
   - The branch is a nested list inside the section's `li`, so in the DOM it comes straight after the section's link.
   - Drawn as a second row under the whole bar, Tab would go from the section to the branch's links, then back up to the next section, and a screen reader would read it in that order too.
   - A second navigation keeps DOM order and visual order the same.
2. **It breaks the layout.** Drawing a nested list as a full-width row means taking it out of its item, with absolute positioning or `display: contents`. That breaks wrapping at 320px and the 1.4.12 text spacing, and a long Finnish label would push the rows over each other.
3. **Two landmarks are clearer than one.** Screen-reader users get two landmarks, each with its own name and its own `aria-current` ("Bygga och bo" as `true` in the bar, the page as `page` in the branch), instead of one list whose second level has no name.

A branch that opens on hover or click (a flyout) is NavigationMenu (M4).

**Q-N2: should `aria-current="true"` draw the trail look instead of the solid fill?**

- **The problem.** Under the approved rule, every `aria-current` value except `false` is solid. When a header bar marks its section with `current={true}` and the sidebar marks the page, two solid fills compete. The section, which is on the way to the page and not the page itself, then looks like the page.
- **Recommendation: yes.** Keep the solid fill for `page` (and for `location`, which TableOfContents uses, and `step`, `date` and `time`), and give `true` the trail look.
  - That keeps T3's meaning across navigations: the quiet fill means "you're inside this", the solid fill "you're here".
  - In a single navigation whose current page isn't shown, the deepest item shown then gets the quiet fill and weight 600, and nothing is solid. That's accurate, because the reader isn't on that page.
- **Cost:** two selectors in §8.
  - The solid rule keys on `aria-current` only, `[aria-current]:not([aria-current='false'], [aria-current='true'])`, because Link sets `data-current` for every value.
  - The trail rule adds `.kv-link[aria-current='true']`.
  - There's no new token, pair, prop or string, and the contract, the dev warning and AT behaviour don't change.
- **If it's not accepted,** engineering builds the approved rule as written, and §14's wording stands without the Q-N2 sentences.

## 14. DESIGN.md changes (verbatim, for engineering)

Apply these in the same change as `theme.css` §8 (Plan 0047). Line numbers are DESIGN.md's on 2026-10-05.

**Front matter, lines 186–195** (`nav-item`, `nav-item-current`). Replace with:

```yaml
nav-item:
  # Comfortable. In kv-compact from 64rem: 32px high, 14px type. Start 16px and end 12px in a
  # list; 12px on both sides in a horizontal bar (kv-navigation--horizontal).
  backgroundColor: transparent
  textColor: '{colors.text}'
  typography: '{typography.body}'
  rounded: '{rounded.md}'
  padding: 0 12px 0 16px
  height: 44px
nav-item-current:
  # Weight 600. In forced colours: a straight LinkText bar, at the inline start in a list and
  # at the block end in a horizontal bar.
  backgroundColor: '{colors.primary}'
  textColor: '{colors.on-primary}'
nav-item-trail:
  # Every ancestor of the current item. Weight 600.
  backgroundColor: '{colors.primary-subtle}'
  textColor: '{colors.text}'
```

**The semantic token table: only the "Use" cell of each row changes.**

- Line 298, `surface-raised`: "Cards, popups and dialogs"
- Line 306, `primary`: "Primary button background, selected state, the current navigation item's fill, info alert bar and icon"
- Line 309, `primary-subtle`: "The navigation trail (the current item's ancestors), secondary button hover, selected rows, info alerts"

**Colors, line 337.** Replace the bullet with:

> - **Navigation** (`Navigation.Root`) may drop the underline and use the `text` colour, because position in a labelled `<nav>` list is the cue, and it underlines on hover like any link. The current item is a solid `primary` fill with an `on-primary` label at weight 600, a shape at 3:1 or more against the surface, plus `aria-current`. Every ancestor of it, the trail, gets `primary-subtle` and weight 600, so the trail differs from the other items in weight, not in colour alone. In forced colours the fills drop: the current item gets a straight `LinkText` bar and the trail keeps its weight.

If Q-N2 is accepted, add: "A link marked `aria-current="true"`, the deepest item shown when the page itself isn't, gets the trail look, not the fill."

**Typography, Weights, line 357.** Replace with:

> - **Weights.** Sans 400 (text, and navigation items at rest), 500 (labels and controls) and 600 (`strong`, and the current navigation item and its trail). Serif 500 (`heading-2`, `heading-5` and `heading-6`) and 600 (the other headings). Upright only: italics are synthesised. Nothing uses 700.

**Typography, `label-compact`, line 366.** Replace with:

> - `label-compact` (14px, weight 500) is only for control labels in compact density: staff tools and the docs site's header controls. Navigation items in compact density are 14px at weight 400, and 600 when current or on the trail.

**Shapes, Lines, line 471.** Replace with:

> - **Lines** are 1px. The 4px indicator bar (`--kv-indicator-width`) marks a blockquote and an alert, and, in forced colours only, the current navigation item. That bar is a straight `::before`, never a border on a rounded box, which would follow the corners. Control borders are 1px `border-control`, and invalid inputs switch to 2px `danger` plus an error message, never colour alone.

**Components, line 522.** Replace the bullet with:

> - **Navigation items** use `nav-item`: `text` at weight 400, no fill, and the link underline on hover. The current item is `nav-item-current` at weight 600, and every ancestor of it is `nav-item-trail` at weight 600. The theme finds the trail with `:has()`, so it needs no prop. Exactly one link per navigation has `aria-current`: `page` when the page is listed, otherwise `true` on the deepest item shown. Never put it on an ancestor of a listed page or on a link inside a `hidden` group. A nested list is indented 16px, with two levels on resident pages. A collapsed group is rendered with `hidden`, never unmounted. `kv-navigation--horizontal` lays the top level out as a row that wraps: items sized to their labels, 12px on each side, 8px apart, with the same heights, fills and weights, and one level per bar. A second level is a second, separately named navigation, not a second row.

If Q-N2 is accepted, replace "The current item is `nav-item-current`" with "The current page (`aria-current="page"`) is `nav-item-current`, and an item marked `true` is `nav-item-trail`".

**Theming, the choices list, line 549.** In "`kv-link--service`, `kv-compact`,", insert `kv-navigation--horizontal`: "`kv-link--service`, `kv-navigation--horizontal`, `kv-compact`,". The parts sentence ("a navigation `kv-navigation`, `kv-navigation-list` and `kv-navigation-item`") doesn't change.

**No change:**

- line 327 (`primary` "used as a selected or current indicator" is still held to 3:1);
- line 394 (the density table's label column describes control labels);
- line 464 (`md` for navigation items);
- line 540 (`kv-navigation` stays a prose boundary);
- line 587 (no depth on navigation items).

## 15. The Storybook surface (`.kv-story-surface`)

**Confirmed, with one refinement.**

- **`.kv-story-surface`** (`apps/storybook/.storybook/preview.css`):
  - `box-sizing: border-box`, `max-inline-size: 15rem`, and padding `space-4` `space-3`, as `.docs-sidebar` has;
  - a `surface` fill;
  - no `border-radius`;
  - one hairline only, `border-inline-end: var(--kv-border-width) solid var(--kv-color-border-subtle)`.

  That's DESIGN.md's Section look (square, an edge only where it meets the content), so a vertical navigation is shown where it really sits, not in a card. It also puts the quiet trail on `surface`, its hardest case at 1.07:1 in light, so the stories show the worst case.

- **`.kv-story-surface--wide`** (new) is for horizontal bars, so it should look like a header band, not a sidebar:
  - `max-inline-size: none`;
  - the hairline moves to the block end, `border-inline-end-width: 0` and `border-block-end: var(--kv-border-width) solid var(--kv-color-border-subtle)`;
  - the same `surface` fill, so both orientations are judged on the same surface.

  Nothing else changes.

## 16. Usability test plan (pending)

This replaces §10's plan and §12.9 item 5. The result is `pending`: nothing has been tested.

- **Participants:**
  - 6 to 8 residents: someone using a screen magnifier at 200–400%, a Windows contrast-theme user, a screen-reader user (NVDA or VoiceOver, to confirm nothing changes for them), people with low digital confidence, and second-language readers of Finnish and Swedish.
  - 3 staff in compact density.
- **Tasks:**
  1. **Find the current page.** A five-second test on a vertical tree four levels deep, and on a horizontal bar: "Which page are you on?"
  2. **Read the trail.** "Which section is this page in?" and "Point to the page above this one", in a tree with ten or more siblings per level.
  3. **Where is the keyboard focus?** With focus on a link that isn't current, next to the current one: "Where is the keyboard focus now?" This is C's risk, and the fallback is B with T1.
  4. **Forced colours.** Tasks 1 and 2 again with a Windows contrast theme.
  5. **A bar and a sidebar** (Q-N2). "Which section are you in, and which page?", first with both solid, then with the section in the trail look.
  6. **320px at 200% text.** Find the current item in a bar that wraps to three rows.
- **Measure:** correct first answers, time to answer, wrong answers about where focus is, whether anyone reads the current item as a button, and a preference question only at the end.
