# Design spec: icon gallery cards (docs site `/icons`)

**Status:** Direction A chosen by the maintainer (2026-10-18), revised with their three changes; ready for a plan. Gallery controls: three prototypes, F3 chosen and built (§12) · **Amends:** the `IconTile` in `apps/docs/components/icon-library.tsx` · **Usability test:** pending

## 1. Problem

Developers and designers at municipalities scan 263 icons to find one, check what it means, and copy the import. Today's tile (maintainer screenshot, 2026-10-18) has several problems:

- A 24px glyph sits beside the name, with everything else indented under it.
- `Import:` + code + Copy reads like a form.
- Copy wraps to its own line on some cards (`arrowForward`, `chevronForward`) and not others.
- Aliases, meaning and the RTL note run together as same-weight body text.
- Cards in a row differ in content height, so nothing lines up.

Hardest cases: a keyboard or screen-reader user going through one category, and a phone user at 320px. Search and the category filter don't change.

**Prior art** (the common pattern in icon sites, not fetched for this spec): Heroicons and Material Symbols put a large glyph on a tinted tile, with the name under it and a copy action on the tile. We keep that, but show every fact as text (never on hover only). The icon-only Copy follows the docs site's own Copy code (`docs-code.md` D8, D9).

## 2. Anatomy (from 40rem of the `kv-grid` container: 2 and 4 columns)

```
┌ li.kv-card.docs-icon-item ─────────────┐  surface-raised, border-subtle, lg radius; padding space-6 block, space-5 inline
│ ┌ div.docs-icon-preview ───────[⧉]───┐ │  surface tile, md radius, no edge; 8rem (icon + space-8 block padding)
│ │                 ←                  │ │  Icon size="64", `text` colour, decorative
│ └────────────────────────────────────┘ │  [⧉] CopyButton, icon-only, 44×44, space-2 from the top inline-end corner
│ arrow-back                             │  hgroup > h3: mono, code size (14px), weight 600, text (the name `<Icon name>` takes)
│ arrowBack                              │  hgroup > p: mono, code size (14px), weight 400, text-muted (the import name)
│ Go back: an arrow with a shaft         │  p meaning: body (16px), text
│ pointing to the inline start.          │
│ Also called: back                      │  div.docs-icon-meta: body-small (14px), text-muted
│ Translated label: “Back”               │
│ (Flips in right-to-left text)          │  Badge (neutral kv-badge), only if mirrorInRtl
│                                        │  ← the free space collects here (equal heights per row)
└────────────────────────────────────────┘
```

Each name once: the kebab-case name is the title (h3), and the camelCase import name is the muted line under it (`hgroup`). Copy's accessible name and tooltip ("Copy import arrowBack") and the clipboard use the import name. There is no action row: the metadata and the badge end the card.

**Type (maintainer, 2026-10-18), existing tokens only.**

| Part        | Style                                                       |
| ----------- | ----------------------------------------------------------- |
| Name        | `--kv-font-code-size` (14px) in the mono family, weight 600 |
| Import name | the same size, weight 400, `text-muted`                     |
| Meaning     | `--kv-font-body-size` (16px)                                |
| Metadata    | `--kv-font-body-small-size` (14px), `text-muted`            |

The mono family draws larger than IBM Plex Sans at the same size, so 14px mono sits optically beside 16px sans. 14px is the smallest step in the system, so the import name is set apart by weight and colour, not size.

## 3. Content (docs app catalog `apps/docs/messages/en.ts`, `docs.icons`; the docs site is English only)

| Key                                       | Today                          | New                                                                                                                 |
| ----------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `importLabel`                             | `Import:`                      | **removed** (the import name is shown under the title as data, with no label)                                       |
| `copy`                                    | `Copy`                         | `Copy import`: the start of the name; shown beside the icon on touch                                                |
| `copyHidden`                              | `` ` import ${importName}` ``  | `` ` ${importName}` `` (VisuallyHidden), so the name and the tooltip are "Copy import arrowBack"                    |
| `flips`                                   | `Flips in right-to-left text.` | `Flips in right-to-left text` (a badge: no full stop)                                                               |
| `aliases`, `label`                        | as today                       | unchanged                                                                                                           |
| (library) `copyButton.copied` / `.failed` | –                              | reused, no new key: "Copied" in the tooltip and touch chip; "Could not copy. Select the text and copy it yourself." |

- The clipboard gets the whole line: `import { arrowBack } from '@kvirn-ui/icons'`.
- `meaning` is shown whole. Nothing is truncated, line-clamped or shown only on hover.
- Optional parts render nothing when empty: no meta block without aliases or a label, and no badge without `mirrorInRtl`.

## 4. Tokens and classes per element

| Element                                     | Built from                                                                                                      | Style (`docs.css` unless named)                                                                                                                                                                                                                                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List `ul.docs-icon-list`                    | as today                                                                                                        | gap `--kv-space-6`; `--kv-card-padding-default: var(--kv-space-5)`                                                                                                                                                                                                                                                      |
| Card                                        | `Card.Root as="li" className="docs-icon-item"`                                                                  | `display: flex; flex-direction: column; gap: --kv-space-4; padding-block: --kv-space-6`. Grid items stretch, so a row's cards are equally tall                                                                                                                                                                          |
| Preview `div.docs-icon-preview`             | `<Icon icon={…} size="64" />`, no `label`                                                                       | `position: relative`; `surface` fill, `--kv-radius-md`, **no border** (decorative: in forced colours an edge made it look like a button); `min-block-size: --kv-space-24`, `padding-block: --kv-space-8` (8rem tall with the 64px icon), icon centred (`place-items: center`), `text` colour                            |
| Tools `div.docs-icon-tools`                 | wraps CopyButton and the touch chip                                                                             | `position: absolute; inset-block-start: --kv-space-2; inset-inline-end: --kv-space-2`; `display: flex; flex-direction: row-reverse; gap: --kv-space-2` (the chip sits at the button's inline start, as in Copy code)                                                                                                    |
| Copy                                        | `CopyButton className="kv-button--icon-only docs-icon-copy" status={false}` in `Tooltip`, the same as Copy code | 44×44 at every width (the docs site isn't `kv-compact`); `copy` Icon `'20'` while `data-status` is `idle` or `failed`, `check` while `copied` (both decorative); `span.docs-icon-copy-label` ("Copy import") visually hidden, then VisuallyHidden `copyHidden`                                                          |
| Tooltip                                     | `Tooltip.Popup > Tooltip.Name` as shipped                                                                       | the name ("Copy import arrowBack"); `copyButton.copied` while `data-status="copied"`. Above the button, inline-end aligned                                                                                                                                                                                              |
| Touch `(hover: none) and (pointer: coarse)` | no tooltip                                                                                                      | the label shows beside the icon (button `inline-size: auto`, `padding-inline: --kv-space-3`); the tile gets `padding-block-start: calc(--kv-control-min-block-size + --kv-space-4)` so the drawing sits below the button; `span.docs-icon-copy-status` ("Copied", `body-small`, `text` on `surface`) shows while copied |
| Failure `div.docs-icon-copy-failed`         | after the tile, only while `data-status="failed"`                                                               | decorative `warning` Icon in `text` + `copyButton.failed`, then the line in `code` (mono, `body-small`, `surface`, `border-subtle` edge, `--kv-radius-sm`, `--kv-space-2` padding), the CopyButton's `textRef`, so it is selected                                                                                       |
| Title `hgroup.docs-icon-title`              | `h3 > code` (name), `p > code` (import name)                                                                    | grid, gap `--kv-space-1`; both margin 0, `--kv-font-family-mono` at `--kv-font-code-size`, `body` line height, `hyphens: none; overflow-wrap: anywhere`, the `code` without the prose chip; h3 weight 600 `text`, p weight 400 `text-muted`                                                                             |
| Meaning `p`                                 | `p`                                                                                                             | margin 0, `body`, `text` (a description: never muted or small)                                                                                                                                                                                                                                                          |
| Meta `div.docs-icon-meta`                   | one `p` per line (aliases, then label)                                                                          | `body-small`, `text-muted`; gap `--kv-space-1`                                                                                                                                                                                                                                                                          |
| RTL `p.docs-icon-flags`                     | `<Badge>{text.flips}</Badge>` (neutral)                                                                         | margin 0                                                                                                                                                                                                                                                                                                                |

No new token, colour pair or radius. Every pair is an existing measured one: `text`/`text-muted` on `surface-raised`, `text` on `surface`, the secondary button on `surface`, the badge and tooltip pairs.

## 5. States

| Part | Idle                                     | Hover / focus-visible                                                                                                               | Copied                                                                                                                                                                                          | Failed                                                                                                                          | Before hydration                   |
| ---- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Copy | `copy` icon, secondary `kv-button` depth | `kv-button` hover or the 2px `focus-ring` (2px offset, inside the tile's 8px inset, never clipped); the Tooltip opens with the name | `check` icon. The tooltip says "Copied" if it is open (a press re-opens it under hover or keyboard focus). On touch, the "Copied" chip shows. Announced politely. Back to idle (see decision 1) | `copy` icon; the failure block appears under the tile with the line selected; announced assertively; stays until the next press | no button; the tile keeps its size |
| Card | as §4; never interactive (no hover)      | none                                                                                                                                | none                                                                                                                                                                                            | grows by the failure block                                                                                                      | as idle                            |

The name never changes with the state. The state is the icon's shape plus the words "Copied" (tooltip, chip, announcement), never colour.

**Modes.** The four themes come through tokens only. RTL: logical properties only, and the button sits at the top-left. A preview with `mirrorInRtl` flips there, as the Icon does. No motion beyond the Tooltip's own fade.

**Forced colours.** The card edge is `CanvasText`, the tile has no edge, and the icon is `CanvasText`. The button is `ButtonText` with a `Highlight` ring, the tooltip is `Canvas`/`CanvasText`, and the badge has a `CanvasText` edge. The chip and the failure code get a 1px `CanvasText` edge.

## 6. Responsive (container widths of `kv-grid`; the icons page is `wide`, so at 1280 and 1440 the container is 75rem)

| Width    | Columns | Measured in the prototype                                                                                                    |
| -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| < 40rem  | 1       | Stacked like the wider widths. Cards are 280–436px tall at 360, and 280–460px at 320. Touch adds the button row to the tile  |
| 40–64rem | 2       | Cards are 414px wide at a 900px window, and about 500px at 1100 (container 63.75rem); 342–412px tall                         |
| ≥ 64rem  | 4       | Cards are 282px wide and 388–460px tall at 1280 and 1440. `table-column-remove` and `tableColumnRemove` each fit on one line |

320px, 400% zoom and 1.4.12: no fixed heights on text (the tile only has a minimum), identifiers wrap anywhere, and the badge fits.

## 7. Accessibility annotations

- **Structure:** `ul role="list"` → `li` per icon. Outline h1 Icons → h2 category → **h3 icon name**, with the import name as the `hgroup`'s `p` right after it. Heading navigation goes icon to icon.
- **Image:** the preview is decorative (`aria-hidden`). Never pass `label` here, even when `hasLabel`.
- **Tab stops:** one per card, Copy. Enter and Space activate it (native `button`, CopyButton's contract). No focus moves. Escape closes the tooltip.
- **Name (2.5.3):** "Copy import arrowBack". The visible words on touch and the tooltip text start it. The icons inside are decorative.
- **Tooltip (1.4.13):** as shipped: hoverable (100ms grace), dismissible (Escape), persistent; never the only place a fact lives, because the name also has it and the clipboard gets the whole line.
- **Announcement (4.1.3):** CopyButton's own: polite `copyButton.copied`, assertive `copyButton.failed`.
- **Targets (2.5.8):** 44×44 at every width, wider on touch.
- **Not colour alone (1.4.1):** the RTL fact is the badge's words; Copied is a shape plus words.
- **Reading order = visual order:** tile (Copy), name, import name, meaning, meta, badge. The touch chip sits visually before the button but is read after it, as in Copy code.

## 8. Build

| File                                    | Change                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/docs/components/icon-library.tsx` | `IconTile` renders §2: `Card.Root as="li"`; the preview `div` with `Icon size="64"`, then `div.docs-icon-tools` with `Tooltip` + `CopyButton` (`status={false}`, `textRef` on the failure `code`, icons by `data-status`) and the touch chip; `hgroup` (`h3` + `p`); meaning; meta (if any); flags (if `mirrorInRtl`); the failure block while failed. Drop `docs-icon-details` and the `Import:` span |
| `apps/docs/app/(docs)/docs.css`         | Replace `.docs-icon-item` … `.docs-icon-import` (~:645–671) with §4 and the touch rules. Keep the list's column queries and its `.docs-article` measure override. Add the override for the card's `p` (`max-inline-size: none`), and reset the article's `h3` margins and type on `.docs-article .docs-icon-title h3`                                                                                  |
| `apps/docs/messages/en.ts`              | §3 keys                                                                                                                                                                                                                                                                                                                                                                                                |

Verify at 320, 900, 1100 and 1440, in light and dark, with touch emulation and forced colours: rows equal, no sideways scroll, the tooltip never covers the button, and focus rings unclipped.

## 9. Usability test plan (pending)

Tasks: find the icon for "go back" and copy its import (sighted mouse, keyboard-only, NVDA + Firefox, VoiceOver iOS); tell which arrow icons flip in RTL; at 320px, copy `calendar`'s import. Participants: 5 developers, 2 using a screen reader, 1 with low vision at 200% zoom. Measure: time to copy, wrong copies, whether people find the icon-only Copy without help, and whether the name and import name under it are told apart. Status: **pending**, nothing run.

## 10. Open questions and decisions for the maintainer

1. **Copied lasts 5 s, not 2 s.** CopyButton holds `copied` for 5 s (its contract). 2 s needs a new CopyButton option, which is a public API change. Recommendation: keep 5 s, the same as the library and CodeBlock. The prototype shows 2 s, as asked.
2. **Column counts.** At 1280 and 1440 four columns work (282px cards). At 1024–1103px windows the container is just under 64rem, so the cards are about 500px wide in two columns and look sparse. Option: three columns from 48rem (`kv-grid--md-cols-3`), with cards about 240px wide, where `table-column-remove` would wrap at its hyphen. I've left it at 1/2/4, as the maintainer set it.
3. **Failure needs the line on screen.** The card no longer prints the import, so a refused clipboard shows the line under the tile and selects it. The engineer checks that CopyButton's `textRef` element exists when the failure selection runs.
4. A second, real-size (20px) sample in the tile? Left out.
5. Meanings carry a drawing description after the colon. Shorter meanings would cut card height; that's a catalogue change, out of scope.

## 11. Prototypes (2026-10-18)

Five static prototypes on the real theme were built to compare directions. The maintainer chose A; the prototype files and screenshots were deleted after the choice (2026-10-18), and the built component is the reference.

- **Chosen: A, the preview tile (revised as above).** It has the docs shell's measure (80rem page, 2.5rem edges). Measured in Chromium (Playwright):
  - no sideways scroll at 320, 360, 900, 1100, 1280 and 1440
  - equal heights in every row
  - Copy is 44×44, and 143×44 on touch
  - the tooltip opens on keyboard focus and closes on Escape
  - a press copies the whole line, shows a check and "Copied" for 2 s, and announces it
  - a refused copy shows and selects the line
  - axe (WCAG 2.2 AA tags) is clean at 320, 360 RTL, 900, 1440, 1440 dark and in the failed state

  Shots: 1440, 1280, 1100, 900, 360, 360 RTL, 360 touch, 1440 dark, 1440 tooltip on focus, 1440 copied, 1440 failed, and 1440 in forced colours.

- Considered and not chosen (unchanged since the first round):
  - B, compact tile: a text "Copy" on the import line (24px link look)
  - C, icon first: details behind "More"
  - D, tile as button: the tile is the button
  - E, rows: one row per icon

## 12. Gallery controls (2026-10-18, for the maintainer's choice)

**Brief.** Today Search and Category are stacked above the list. The maintainer wants them inline, plus a preview part (`variant`, `size`, stroke), as either a toolbar or a sidebar. The users are the same as in §1. The hardest cases:

- a keyboard user who must get past the controls to the cards
- a phone user who only wants to search
- someone in forced colours, where a colour can't be shown

**Prototypes** (deleted after the choice, 2026-10-18). They use the theme and card A as built, with 39 icons in 11 categories. The search, category and preview controls all work, and the settings are kept in the address.

| Option                     | Idea                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| F1, toolbar                | One row (Search, Category, Show icons), then the preview radios always shown in the same band                                          |
| F2, sidebar                | From 64rem, a 15rem sidebar at the inline start (the shell's Get started width) with everything open; below 64rem it is the same as F3 |
| F3, toolbar and disclosure | F1's row, plus a closed "Customize the preview" disclosure whose label gives the current settings                                      |

Measured at a 1440×900 window on the 75rem grid:

| Layout | Controls            | First card | Columns, card width | At 360px                        |
| ------ | ------------------- | ---------- | ------------------- | ------------------------------- |
| F1     | 444px               | 850px      | 4, 282px            | 949px of controls before a card |
| F2     | 1361px tall sidebar | 446px      | 3, 291px            | same as F3                      |
| F3     | 222px (475px open)  | 652px      | 4, 282px            | 439px of controls before a card |

**Recommendation: F3.**

- It keeps card A's 4 columns at 1280 and 1440, which means about a third fewer rows than F2's 3 for 263 icons.
- With the settings closed, a keyboard user passes 4 Tab stops before the first card.
- The settings cost one row until someone wants them, and the label still says what they are.
- F2's sidebar is 1361px tall. It can't stay in view without a nested scroll area, and after the first screen it leaves an empty 15rem column beside the list.
- F1 pushes the first card below the fold.
- Worth taking from F2: the narrow layout, where Search, Category and Show icons always stay visible. All three share it.

**Settled in the prototypes:**

| Question                 | Decision                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What the settings change | The drawings on this page only. Copy still copies the import line, and CopyButton is unchanged. A "Props for these settings" line shows `size="32" variant="primary" className="kv-icon--stroke-2"` as text, so there is no second copy action and each card keeps one button                                                              |
| Size                     | The tile stays 8rem (`2 × --kv-space-16`, its padding included), and the drawing changes size within it. Steps: 16, 20, 24, 32, 48 and 64 (default, the gallery size; the largest that fits). 20 is the size in a button. The other seven steps are left out: 12 and 14 are too small to judge, and 80 and 96 don't fit                    |
| Stroke                   | 1, 1.5 (default, no class) and 2, as `kv-icon--stroke-*`                                                                                                                                                                                                                                                                                   |
| Colour                   | Nine radios: "Text (default)" and the eight variants. Each has a decorative 16px swatch in its own `kv-icon--<variant>` before the name, because the name carries it (1.4.1). In forced colours every drawing is `CanvasText`, and the trigger's label still names the colour                                                              |
| Radios, not selects      | A native option can't show a swatch, and all choices stay visible to compare. Each group is a `fieldset` with a `legend`: one Tab stop, and the arrow keys move (native radios). The theme's option rows, 44px targets                                                                                                                     |
| Address                  | One GET `form` holds everything: `?q=…&category=…&variant=primary&size=32&stroke=2`, with defaults left out. It survives a search, a category change, a reload and a shared link, with or without JavaScript. "Clear the search" keeps the settings. "Reset the preview" shows only when a setting isn't the default, and keeps the search |
| Columns                  | 1, 2, 3 and 4 at 0, 40, 48 and 64rem of the list's own container (`kv-grid--sm-cols-2 kv-grid--md-cols-3 kv-grid--lg-cols-4`). That gives 3 columns of 324px at 1100 and 268px at 900, and replaces §10, question 2                                                                                                                        |
| Count and empty state    | Unchanged: the "N icons match …" line, announced politely after the 500ms pause, with "Clear the search" beside it when the list is filtered. With no match, the `kv-empty-state` (heading, help, links) takes the list's place                                                                                                            |
| Sticky                   | Nothing is sticky. A sticky toolbar would cover focused cards (2.4.11), and the sidebar is too tall                                                                                                                                                                                                                                        |

**Accessibility (F3).**

- The controls sit in `search aria-label={searchRegion}`.
- Tab order: Search, Category, Show icons, Customize (native `details`/`summary`; `Disclosure` in the build), then the first card's Copy. When open, the three radio groups come after Customize.
- The trigger's name includes the current settings, and its text never changes with open or closed.
- Changing a setting moves no focus and announces nothing beyond the radio's own state.
- No sideways scroll at 320, 360, 900, 1100, 1280 or 1440, and equal rows everywhere.
- axe (WCAG 2.2 AA tags) is clean in light, dark, RTL, filtered, empty and open states, for all three layouts. Forced colours were looked at.

**Content (`docs.icons`, new keys):**

| Key              | Text                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| `customize`      | "Customize the preview"                                                      |
| `customizeNow`   | "(now: {settings})"                                                          |
| `previewLegend`  | "Preview"                                                                    |
| `previewNote`    | "Changes the drawings on this page only. Copy still copies the import line." |
| `variantLegend`  | "Colour"                                                                     |
| `variantDefault` | "Text (default)"                                                             |
| `variant.<name>` | the eight names                                                              |
| `sizeLegend`     | "Size in pixels"                                                             |
| `strokeLegend`   | "Stroke width"                                                               |
| `strokeDefault`  | "1.5 (default)"                                                              |
| `props`          | "Props for these settings:"                                                  |
| `resetPreview`   | "Reset the preview"                                                          |

**Build (after the choice).** All in `icon-library.tsx` and `docs.css`:

- the existing form in a row
- a `Disclosure` holding three `RadioGroup`s
- the settings in the `keepUrl` state and the reset links
- the preview `Icon` taking `size`, `variant` and the stroke class

`IconTile` gets them as props. No `packages/` change.

**Not verified:** real AT, a real touch device, a no-JavaScript submit (a static file can't answer a GET; loading with the parameters was tested), Safari and Firefox. Usability testing is **pending**.

**Decisions for the maintainer:**

1. F3, F2 or F1.
2. The default preview size: 64 (the gallery look) or 24 (closer to real use).
3. The 1/2/3/4 column breakpoints.
4. Keeping the settings in the address.

**Chosen and built (2026-10-18): F3.** The maintainer chose F3; the four decisions above were taken as recommended (default preview size 64; 1/2/3/4 columns at 0/40/48/64rem of the list's width; settings in the address). Built in `apps/docs/components/icon-library.tsx`, `docs.css` and `messages/en.ts`. Deviations from the prototype, found while building:

- The disclosure is a native `<details>`, not the library `Disclosure`, so the settings work without JavaScript.
- The preview tile sets `box-sizing: border-box`: the docs site renders it content-box, which turned the prototype's 8rem into 12rem.
- The "Preview" note comes after the three groups, because before them it triggers the HelpText-before-control development warning.
- `variant`, `size` and `stroke` are validated in `icon-library.tsx`, because a server file can't import values from a `'use client'` module. `page.tsx` only passes the raw strings.
- The colour swatch is a CSS dot (`span.docs-icon-swatch`, `currentColor` fill, 1px border so forced colours still show it), coloured by `kv-icon--<variant>`.
- Without JavaScript the default radios submit `variant=` and `stroke=`, which the page reads as the defaults.

Not yet checked: forced colours, touch emulation, a no-JavaScript submit, and a look at the 1440 dark screenshot.
