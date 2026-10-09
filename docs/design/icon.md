# Design spec: Icon and the built-in icon set

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-01
- **Plan:** [Plan 0009](../plans/0009-icon.md)
- **Type:** component default styling + built-in asset set + DESIGN.md rule change

The API is decided in the Icon API decision and Plan 0009: a typed name registry in `KvirnProvider`, attributes on the root `<svg>`, a size scale (changed 2026-10-04, see the note below), and decorative by default. The maintainer has also decided (2026-10-01) that `@kvirn-ui/react` ships a **built-in set** as the registry's base layer. It's drawn in the Heroicons outline style, but every drawing is original. An app that registers the same name replaces the built-in.

> **Size scale (maintainer, 2026-10-04, Plan 0044).** The `sm`/`md`/`lg` steps are gone. `size` is a step of Tailwind's `size-*` scale (`0`, `0.5`, `1` … `12`, `14`, `16`, … `96`), and a step is `step × 0.25em`, so `4` is 1em, `5` (the default) 1.25em and `6` 1.5em: the old `sm`, `md` and `lg`. It is em and not Tailwind's rem on purpose: an icon follows the text size (1.4.4) and keeps the behaviour it had. A string is an explicit CSS length (`'48px'`, `'2rem'`), and a bare number is a step, no longer pixels. The svg carries `data-size="<step>"` for a number. In the text below, read `sm` as step 4, `md` as step 5 and `lg` as step 6. Why: one scale that adopters of Tailwind already know, with room for large illustrations and small marks, instead of three steps and a pixel escape hatch.

This spec decides:

1. the built-in names and their metaphors (§4.1);
2. the drawing rules (§6.1);
3. the theme rules (§6.2);
4. the content and accessibility rules (§7);
5. the stories (§6.6);
6. the DESIGN.md text (§6.7).

## 1. Brief

- **Users:** both residents and staff, through the components that render icons (Select, Accordion, Dialog, the error summary, DatePicker, FileUpload, the site header). Adopters' developers register and draw icons.
- **Hardest-case users:**
  - A resident with low vision at 200% text size in Windows Contrast Themes. They need to tell an error from a warning without colour, at 16px, with 1px strokes.
  - An Arabic-reading resident of a Swedish municipality using an RTL page. A "next" chevron that points the wrong way sends them backwards.
- **Job to be done:** When a component or page needs an icon, I want one that means the same thing everywhere and follows my app's icon library, so users learn it once and never have to decode it.
- **Context:** every device. Residents meet these icons once, under stress (errors, deadlines). Staff see them all day in compact density.
- **Constraints:**
  - No runtime dependency (hard rule 6), and no third-party requests (hard rule 7).
  - The theme never sets size, stroke, fill or colour (the Icon API decision).
  - The headless package ships no CSS (hard rule 5). The built-ins are React components with SVG attributes only.
  - Original drawings: we don't copy Heroicons' path data.
- **Success criteria:**
  - Every built-in passes the 16px legibility check in §6.1.
  - The four status icons can be told apart in greyscale and in forced colours (1.4.1).
  - Directional icons point the right way in RTL (e2e).
  - 0 axe violations in every story.
  - An icon-only button is a square of at least 44×44px in comfortable density and 24×24px in compact.
- **Evidence:** none from users. The metaphors are conventions from the prior art in §2.
- **Assumptions and research questions:**
  - Assumption: older and second-language residents recognise close (×), search (magnifier) and menu (three lines) without a label. → RQ: icon recognition task in §8.
  - Assumption: the container shape plus the glyph (square "i", circle check, triangle "!", octagon "×") separates the four statuses at 16px without colour. → RQ: a greyscale recognition task in §8.
  - Assumption: RTL readers expect "forward" chevrons and arrows, and the external-link arrow, to point left. → RQ: test with Arabic-reading participants.

## 2. Prior art

| Source                                                                                                                                                                    | What we reuse                                                                                                                                                                                              | What we change and why                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Heroicons](https://github.com/tailwindlabs/heroicons) outline (MIT)                                                                                                      | The style: 24 grid, 1.5 stroke, round caps and joins, `fill="none"`, `stroke="currentColor"`. Dots drawn as near-zero-length round-capped strokes                                                          | Original geometry from our own keylines (§6.1). Semantic names, not shape names. Status icons get four different containers                                                |
| [Aksel](https://aksel.nav.no/) (NAV, NO), used by [Designsystemet](https://designsystemet.no/en/fundamentals/theme/icons/) (Digdir)                                       | Status icons that differ in container shape as well as colour: InformationSquare, CheckmarkCircle, ExclamationmarkTriangle, XMarkOctagon. "Choose your icon library" like our registry                     | Outline instead of filled, to match the set                                                                                                                                |
| [Wikimedia Codex bidirectionality](https://doc.wikimedia.org/codex/latest/style-guide/bidirectionality.html) and [Codex icons](https://github.com/wikimedia/design-codex) | Mirror what shows horizontal direction. Don't mirror check marks, calendars, or objects held in the right hand (edit). `linkExternal` and `next` flip, `search`, `download`, `upload` and `language` don't | We flip with `scale: -1 1` on the root, like Codex's CSS flip. We don't need per-language exceptions (Codex's `help` exceptions for `he`, `yi`), because we dropped `help` |
| [Melanie Richards: currentColor SVG in forced colours](https://melanie-richards.com/blog/currentcolor-svg-hcm/), Chromium `forced-color-adjust: preserve-parent-color`    | SVG keeps its author colours in forced colours, and only `currentColor` follows the system colour. So an icon must end up on `currentColor`                                                                | The theme turns explicit root `color`, `fill` and `stroke` into the inherited colour in forced colours (§6.2)                                                              |
| GOV.UK Design System (header "Menu" button, password input "Show" button, warning text)                                                                                   | Text next to the menu and password toggles. A status word in the warning text                                                                                                                              | We allow an icon next to the text, never instead of it                                                                                                                     |
| `theme.css` Button (`gap: space-2`, `align-items: center`, line height 1.25)                                                                                              | Step 5 (1.25em) equals the button's line height, so an icon never makes a button taller                                                                                                                    | New `kv-button--icon-only` class (§6.2)                                                                                                                                    |

No APG pattern applies: an icon isn't a widget. Icon-only buttons follow the Button pattern.

## 3. Flow

An icon has no flow. Its unhappy paths:

| Condition                                      | What the user gets                                                                                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unknown name (typo, icon not registered)       | An empty, sized, hidden `<svg>`, so the layout doesn't jump, plus a dev warning. The placeholder needs `viewBox="0 0 24 24"` (see §6.2, card rule)        |
| App overrides a built-in with a library icon   | Kvirn's components show the app's icon. Mirroring follows the name, not the drawing (§4.2)                                                                |
| Hard-coded colour in forced colours            | Turned into the inherited system colour by the theme (§6.2)                                                                                               |
| Without the theme                              | Icons still size, colour and hide correctly (attributes). No RTL flip, no alignment rule, no icon-only square. The consumer styles `[data-mirror-in-rtl]` |
| 200% text and 400% zoom                        | `em` sizes grow with the text (1.4.4). Icon-only buttons grow with their `rem` minimum                                                                    |
| Long Finnish label next to an icon in a Button | The label wraps, and the icon keeps its size (`flex-shrink: 0`) and stays centred on the label block                                                      |

## 4. Content

### 4.1 The built-in set (24 icons)

Names describe meaning, not shape. Directional names use `back`/`forward` (inline start and end), never `left`/`right`. Every drawing is made LTR. "Mirrors" means the registry entry sets `mirrorInRtl: true`.

| #   | Name              | Metaphor (what it depicts)                                       | Intended uses                                                                                                                         | Mirrors in RTL |
| --- | ----------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | `chevron-down`    | A chevron pointing down                                          | Select, Combobox and MenuButton triggers. Disclosure, Accordion, NavigationMenu (the component rotates it when open). Sort descending | No             |
| 2   | `chevron-up`      | A chevron pointing up                                            | Sort ascending. An open disclosure, where a component swaps icons instead of rotating                                                 | No             |
| 3   | `chevron-back`    | A chevron pointing to the inline start                           | Pagination "Previous", Calendar previous month                                                                                        | **Yes**        |
| 4   | `chevron-forward` | A chevron pointing to the inline end                             | Pagination "Next", Calendar next month, Breadcrumb separator, NavigationMenu sub-level                                                | **Yes**        |
| 5   | `arrow-back`      | An arrow with a shaft, pointing to the inline start              | The form wizard's "Back" link (M4 block)                                                                                              | **Yes**        |
| 6   | `arrow-forward`   | An arrow with a shaft, pointing to the inline end                | A start button ("Start now"), "Continue", task-list links                                                                             | **Yes**        |
| 7   | `external`        | An arrow leaving an open frame towards its top inline-end corner | Link with `target="_blank"`, after the new-tab notice text                                                                            | **Yes**        |
| 8   | `close`           | Two crossed diagonal strokes (×)                                 | Dialog, Popover, Toast, the consent banner's dialog variant, clearing a search field                                                  | No             |
| 9   | `menu`            | Three equal horizontal lines                                     | The site header's navigation toggle (NavigationMenu, M4)                                                                              | No             |
| 10  | `search`          | A magnifying glass, handle to the lower inline-end side (in LTR) | The site header search, the Search block's submit button                                                                              | No             |
| 11  | `add`             | A plus                                                           | "Add another" in the form wizard, FileUpload "Add files"                                                                              | No             |
| 12  | `check`           | A check mark                                                     | Selected option in Listbox and Select, checked Menu item, completed Stepper step                                                      | No             |
| 13  | `info`            | A rounded square with a lower-case "i"                           | Alert (info), hint panels                                                                                                             | No             |
| 14  | `success`         | A circle with a check mark                                       | Alert (success), confirmation page, Toast                                                                                             | No             |
| 15  | `warning`         | A triangle with an exclamation mark                              | Alert (warning), deadlines, the session-timeout warning (2.2.1)                                                                       | No             |
| 16  | `error`           | An octagon with a "×"                                            | Error summary, ErrorMessage, Alert (error)                                                                                            | No             |
| 17  | `calendar`        | A page with two binding rings, a header line and a row of dots   | DatePicker trigger                                                                                                                    | No             |
| 18  | `upload`          | An arrow rising out of an open tray                              | FileUpload                                                                                                                            | No             |
| 19  | `download`        | An arrow descending into an open tray                            | Links to decisions, forms and exports                                                                                                 | No             |
| 20  | `document`        | A page with a folded top corner and two text lines               | FileUpload's file list, attachment links                                                                                              | No             |
| 21  | `delete`          | A waste bin with a lid and handle                                | FileUpload "Remove file", row actions in staff tools                                                                                  | No             |
| 22  | `language`        | A globe with a meridian and two latitude lines                   | The site header's language switcher. Always next to the language name. Never a flag                                                   | No             |
| 23  | `eye`             | An open eye                                                      | Password field "Show password"                                                                                                        | No             |
| 24  | `eye-off`         | An open eye with a diagonal slash                                | Password field "Hide password"                                                                                                        | No             |

**Mirroring rule:** mirror only icons whose meaning is a horizontal direction in reading order, which are 3–7. Don't mirror vertical direction, symmetric shapes, check marks, status glyphs, calendars, objects, or `search` (Codex doesn't flip it). The `eye-off` slash and the `document` fold are object details, not direction.

**Cut from the candidate list:**

| Cut               | Why                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `remove` (minus)  | No roadmap component needs it. GOV.UK-style "Remove" in add-another is a text button. Apps can register it                                                                                                                     |
| `help`            | It invites a "?" button that opens a tooltip with essential information (DESIGN.md Don'ts). The header's consistent help (3.2.6) is a text link. It also needs per-language mirroring (Codex flips it except in `he` and `yi`) |
| `user`, `log-out` | Login entry uses the identity providers' own marks (BankID, Suomi.fi, ID-porten), and "Log in", "My pages" and "Log out" are text. `log-out` would also need mirroring                                                         |
| `edit`            | "Change" in a summary list is a text link (GOV.UK). Staff tools register their own                                                                                                                                             |
| `mail`, `phone`   | Contact details are text and links. Pure decoration that apps can register                                                                                                                                                     |
| `home`            | The logo is the home link, and breadcrumbs use text. A home icon in a breadcrumb would be icon-only navigation                                                                                                                 |

That leaves one slot under the 25 cap, held for a table sort indicator (`sort`, both chevrons) when Table is planned. That's open question 4.

### 4.2 Registry behaviour that affects users

- **Built-ins are the lowest layer.** Merge order: built-ins, then each `KvirnProvider`'s `icons` from outer to inner, then instance props (the Icon API decision's precedence, with the built-ins below the library defaults).
- **Mirroring belongs to the name, not to the drawing.** When an app registers a plain component under a built-in name, for example `'arrow-forward': ArrowRight`, the built-in's `mirrorInRtl: true` still applies. Otherwise an override silently breaks RTL. An entry that sets `mirrorInRtl` explicitly wins. Recommended, and needs an amendment to the Icon API decision (open question 2).
- **The built-ins use `stroke-width="1.5"` as their own default.** `iconDefaults.strokeWidth` and the `strokeWidth` prop override it. The drawing rules hold from 1 to 2 (§6.1).

### 4.3 Strings

Icon and the built-ins render no text, and have no `<title>` or i18n keys. A label always comes from the caller: a Kvirn component's own messages (for example a future `dialog.close`), or the app's translations.

**Story fixture strings** go in `apps/storybook/src/components/icon/icon.fixture.tsx`, in all six locales. Agents write `fi`, `nb` and `nn`; `se` falls back to `en` with `lang="en"`.

| Key                   | en                                      | sv                                 | longest: fi (draft)                      | Used as                                               |
| --------------------- | --------------------------------------- | ---------------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `button.addChild`     | Add another child                       | Lägg till ett barn till            | Lisää toinen lapsi                       | Button, `add` at start                                |
| `button.continue`     | Continue                                | Fortsätt                           | Jatka                                    | Primary, `arrow-forward` at end                       |
| `button.download`     | Download the decision as a PDF          | Ladda ner beslutet som pdf         | Lataa päätös PDF-tiedostona              | Button, `download`, wraps at 320px                    |
| `button.close`        | Close                                   | Stäng                              | Sulje                                    | Icon-only `aria-label`                                |
| `button.search`       | Search                                  | Sök                                | Hae                                      | Icon-only `aria-label`                                |
| `button.menu`         | Menu                                    | Meny                               | Valikko                                  | Visible text with `menu`                              |
| `button.removeFile`   | Remove {fileName}                       | Ta bort {fileName}                 | Poista tiedosto {fileName}               | Button, `delete` at start                             |
| `button.showPassword` | Show password                           | Visa lösenord                      | Näytä salasana                           | Button, `eye` at start                                |
| `button.hidePassword` | Hide password                           | Dölj lösenord                      | Piilota salasana                         | Button, `eye-off` at start                            |
| `status.errorWord`    | Error                                   | Fel                                | Virhe                                    | Visible status word                                   |
| `status.error`        | Enter the date in the format {example}. | Ange datumet i formatet {example}. | Anna päivämäärä muodossa {example}.      | Status line                                           |
| `status.warningWord`  | Warning                                 | Varning                            | Varoitus                                 | Visible status word                                   |
| `status.warning`      | Your session ends in 5 minutes.         | Din session avslutas om 5 minuter. | Istuntosi päättyy 5 minuutin kuluttua.   | Status line                                           |
| `status.successWord`  | Done                                    | Klart                              | Valmis                                   | Visible status word                                   |
| `status.success`      | Your application has been sent.         | Din ansökan har skickats.          | Hakemuksesi on lähetetty.                | Status line                                           |
| `status.infoWord`     | Good to know                            | Bra att veta                       | Hyvä tietää                              | Visible status word                                   |
| `status.info`         | We answer within 2 working days.        | Vi svarar inom 2 arbetsdagar.      | Vastaamme kahden arkipäivän kuluessa.    | Status line                                           |
| `text.collection`     | Your next collection is on {date}.      | Nästa tömning är {date}.           | Seuraava tyhjennys on {date}.            | Running text, `calendar`                              |
| `text.guide`          | Read the guide                          | Läs guiden                         | Lue ohje                                 | Link text, then `link.newTabNotice`, then `external`  |
| `label.logo`          | Exempelby municipality                  | Exempelby kommun                   | Exempelbyn kunta                         | `label` on a meaningful icon                          |
| `language.current`    | Svenska                                 | Svenska                            | Svenska                                  | Language switcher text (the name in its own language) |
| `gallery.mirrors`     | Mirrors in RTL                          | Speglas vid RTL                    | Peilataan oikealta vasemmalle -suunnassa | Gallery cell note                                     |

`{example}` is formatted with `Intl` for the locale (`31.12.2026` in fi, `2026-12-31` in sv). Icon names in the gallery are code (`<code>`), not translated.

## 5. Structure

Icon adds no landmark, heading or focus stop. Reading order equals DOM order, so put the icon in the DOM where it appears: before the label for a start icon, after it for an end icon. RTL then works without code.

```
Button, icon at start:     button.kv-button > svg.kv-icon[aria-hidden] + "Add another child"
Button, icon at end:       button.kv-button.kv-button--primary > "Continue" + svg.kv-icon[data-mirror-in-rtl]
Icon-only:                 button.kv-button.kv-button--icon-only[aria-label="Close"] > svg.kv-icon[aria-hidden]
Status line:               p > svg.kv-icon[aria-hidden] + strong "Warning:" + " Your session ends in 5 minutes."
Link, new tab:             a.kv-link[target=_blank] > "Read the guide" + span.kv-link-new-tab-notice + svg.kv-icon
```

Per breakpoint: icons don't change size with the viewport, only with the text. At 320px an icon-only button stays square, also in a `kv-button-group` that stacks (§6.2). A gallery story uses `grid-template-columns: repeat(auto-fill, minmax(min(100%, 9rem), 1fr))`, which gives 2 columns at 320px and 6 at 64rem.

## 6. Visual specification

### 6.1 Drawing rules for the built-ins

**Root and markup**

- `viewBox="0 0 24 24"`. The root carries `fill="none"`, `stroke="currentColor"`, `stroke-width="1.5"`, `stroke-linecap="round"` and `stroke-linejoin="round"`.
- **Shapes set none of these.** They inherit them, so the `strokeWidth`, `color`, `fill` and `stroke` props, and the forced-colours rule, reach every stroke.
- Allowed elements: `path`, `line`, `polyline`, `circle`, `ellipse` and `rect`.
- Not allowed:
  - `defs`, `id`, `use`, `mask` or `clip-path` (repeated ids break when the same icon renders twice);
  - `transform`;
  - `style`;
  - `opacity`;
  - `text`;
  - `<title>` (the name comes from `label`);
  - filled shapes;
  - more than one colour.
- **Dots** (in "i" and "!", and the calendar dots) are a 0.01-unit round-capped segment, for example `M12 7.75h.01`. They're as wide as the stroke and scale with `strokeWidth`. Draw them as strokes, not filled circles: a filled shape ignores `fill="none"`, and they need to change with the stroke.

**Grid**

| Rule          | Value                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live area     | 20×20, from 2 to 22. Every painted edge, including the half stroke (0.75) and the round caps and joins, stays inside it. So stroke centrelines stay within 2.75–21.25 |
| Coordinates   | On a 0.25 grid. Horizontal and vertical centrelines on whole or half units                                                                                            |
| Centre        | Centre the painted bounding box on 12,12. Optical nudges of up to 0.5 are allowed, and are noted in the table below                                                   |
| Angles        | 45° and 90°. Chevron and arrow heads are 90° (arms at 45°)                                                                                                            |
| Corner radius | 2 on containers (squares, pages, frames, trays). 1 on small inner corners (bin handle, bin foot)                                                                      |
| Open ends     | Always round caps. No flat ends                                                                                                                                       |

**Keylines** (stroke centrelines, outer painted size in brackets). The circle is largest because it covers the least area, and the triangle uses the full width because its area is the smallest. That gives equal optical weight.

| Keyline  | Centrelines                                                                                      | Outer       | Used by                   |
| -------- | ------------------------------------------------------------------------------------------------ | ----------- | ------------------------- |
| Circle   | Centre 12,12, r 9                                                                                | 19.5        | `success`, `language`     |
| Square   | 4–20 on both axes, radius 2                                                                      | 17.5        | `info`, `calendar` (body) |
| Octagon  | Vertices (8.5,3.5) (15.5,3.5) (20.5,8.5) (20.5,15.5) (15.5,20.5) (8.5,20.5) (3.5,15.5) (3.5,8.5) | 18.5        | `error`                   |
| Triangle | Apex 12,3.25. Base y 20.25, from x 2.75 to 21.25                                                 | 20 × 18.5   | `warning`                 |
| Portrait | x 5.5–18.5, y 3–21, radius 2                                                                     | 14.5 × 19.5 | `document`                |

**Gaps** (the acceptance test at 16px, where 1 unit is 0.67px):

| Between                                | Clear gap (edge to edge)                | At 16px | At stroke 2 |
| -------------------------------------- | --------------------------------------- | ------- | ----------- |
| Two strokes that don't touch           | ≥ 2 units                               | 1.33px  | ≥ 1.5 units |
| A dot and a stroke                     | ≥ 1.5 units                             | 1px     | ≥ 1 unit    |
| A glyph and its container's inner edge | ≥ 2 units. ≥ 1.5 at the triangle's apex | 1.33px  | ≥ 1.5 units |

- Strokes either **join** (meet at a shared point, or cross) or **keep the gap**. No near-misses, because they fill in at 16px.
- The set is designed for stroke 1.5, and holds from 1 to 2. Lucide's default of 2 fits. Outside that range it's the adopter's choice.

**Construction** (starting coordinates; the gap rules above are the test):

| Icon            | Construction                                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chevron-down`  | (5,8.5) → (12,15.5) → (19,8.5): 14 wide, 7 deep, arms at 45°. `chevron-up`, `chevron-back` (points to x 8.5) and `chevron-forward` (points to x 15.5) are the same points rotated about 12,12 |
| `arrow-forward` | Shaft (4.5,12) → (19.5,12). Head (13,5.5) → (19.5,12) → (13,18.5). `arrow-back` is its mirror image, drawn pointing left                                                                      |
| `external`      | Open frame x 4–17, y 7–20, radius 2. The top edge stops at x 11, and the inline-end edge starts at y 13. Arrow (10,14) → (20,4) through the opening. Head (14,4) → (20,4) → (20,10)           |
| `close`         | (6,6) → (18,18) and (18,6) → (6,18)                                                                                                                                                           |
| `add`           | (12,5) → (12,19) and (5,12) → (19,12). The × of `close` is 12 across but 17 diagonally, so the plus is 14 to match                                                                            |
| `menu`          | Three lines x 4 → 20, at y 6, 12 and 18. Equal lengths, so there's no direction                                                                                                               |
| `search`        | Circle centre 10.5,10.5, r 6.5. Handle (15.25,15.25) → (20.25,20.25)                                                                                                                          |
| `check`         | (4.5,12.5) → (9.5,17.5) → (19.5,6.5)                                                                                                                                                          |
| `info`          | Square. Dot at (12,7.75). Stem (12,10.75) → (12,16.5)                                                                                                                                         |
| `success`       | Circle. Check (8.25,12.25) → (11,15) → (15.75,9)                                                                                                                                              |
| `warning`       | Triangle. Stem (12,10.25) → (12,13.5). Dot at (12,16.5). The glyph sits slightly above the centroid (y 14.6), which reads as centred                                                          |
| `error`         | Octagon. × from (9,9) → (15,15) and (15,9) → (9,15), 6 across: half the size of `close`, so the two never read as the same                                                                    |
| `calendar`      | Body: the square keyline from y 5.5 (x 4–20, y 5.5–20, radius 2). Header line y 10.25, x 4 → 20. Rings x 8 and x 16, y 3 → 6.75. Dots at (8,15), (12,15) and (16,15)                          |
| `upload`        | Open tray: sides x 4 and x 20 from y 15 down to a bottom at y 20, radius 2. Shaft (12,15.5) → (12,4). Head (7.5,8.5) → (12,4) → (16.5,8.5)                                                    |
| `download`      | The same tray. Shaft (12,4) → (12,15.5). Head (7.5,11) → (12,15.5) → (16.5,11). It differs from `upload` only in the head, which must be visible at 16px                                      |
| `document`      | Portrait, with the top inline-end corner cut from (13.5,3) to (18.5,8). Fold (13.5,3) → (13.5,8) → (18.5,8). Text lines at y 13 and y 16.5, x 9 → 15                                          |
| `delete`        | Lid x 4 → 20 at y 6.5. Handle x 9.5–14.5, up to y 4, radius 1. Body (6,6.5) → (7,20) → (17,20) → (18,6.5), tapering inwards, foot radius 1. Ribs x 10 and x 14, y 10 → 16.5                   |
| `language`      | Circle. Meridian ellipse rx 4, ry 9. Latitude lines at y 9 and y 15, joining the circle                                                                                                       |
| `eye`           | An almond from (3,12) to (21,12), through (12,5.25) above and (12,18.75) below. Pupil circle r 3                                                                                              |
| `eye-off`       | `eye`, plus a slash (4.5,4.5) → (19.5,19.5). The almond and the pupil break 2 units clear on each side of the slash, drawn as separate open paths, not with a mask                            |

**Pairs that must be told apart at 16px** (design review, on a screenshot at 16, 20 and 24px in light and dark): `upload`/`download`, `chevron-up`/`chevron-down`, `eye`/`eye-off`, `close`/`error`/`add`, and `info`/`success`/`warning`/`error` in greyscale.

**Originality:** draw from the keylines and the construction table, not by tracing another set. Before merge, the engineer checks that no path string equals a Heroicons path. The docs say "in the style of Heroicons outline".

### 6.2 Theme rules (`theme.css`, `@layer kv`)

The theme never sets an icon's size, stroke, fill or colour. The only exception is forced colours, where it forces the inherited colour so an icon can't disappear.

**`.kv-icon`**

| Property                                           | Value      | Why                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flex-shrink`                                      | `0`        | A wrapping Finnish label can't squash the icon in a Button or another flex row                                                                                                                                                                                                                             |
| `vertical-align`                                   | `middle`   | For every other step and for length sizes in running text                                                                                                                                                                                                                                                  |
| `vertical-align` on `[data-size='4']`              | `-0.15em`  | Centres the icon on the capital height (IBM Plex 0.698em), not the x-height: (0.7em − size) ÷ 2. Ignored in flex containers, where `align-items: center` does the job                                                                                                                                      |
| `vertical-align` on `[data-size='5']`              | `-0.275em` | Same formula. In headings with line height 1.25 or less it reaches 0.025em below the line box (under 1px). Accepted                                                                                                                                                                                        |
| `vertical-align` on `[data-size='6']`              | `-0.375em` | The formula gives −0.4em, but that is 0.025em below the line box at line height 1.5 (Plex: half-leading 0.1em), which would make lines uneven. At −0.375em it is 0.026em above centre, which can't be seen. At line height 1.5 it fits the line box. Don't use step 6 in text with a line height below 1.5 |
| No `display`, `margin`, `width`, `height`, `color` | –          | It stays inline in text. In text, a normal space separates the icon from the word (it grows with 1.4.12 word spacing). In flex parents, the parent's `gap` does                                                                                                                                            |

**RTL**

```
.kv-icon[data-mirror-in-rtl]:dir(rtl) { scale: -1 1; }
```

- Use `scale`, not `transform`, so it combines with a component's own `rotate` (an open Accordion chevron) instead of replacing it.
- The outer `<svg>` is a CSS box, so the origin is its centre.
- `:dir()` is supported in the browser range (`docs/architecture.md`: Safari 17+).

**Icon-only button**

```
.kv-button.kv-button--icon-only {
  min-inline-size: var(--kv-button-min-block-size, var(--kv-control-min-block-size));
  padding-inline: var(--kv-space-2);
}

/* Stays square when a group stacks below 40rem, and sits at the inline start. */
.kv-button-group > .kv-button.kv-button--icon-only {
  inline-size: auto;
  align-self: flex-start;
}
```

- Padding is `space-2` (8px) on all four sides. The base already sets `padding-block: var(--kv-space-2)`.
- Both axes are max(min size, icon + 2 × 8px + 2 × 1px border), so the button is square by construction:
  - comfortable: max(44, 20 + 18) = **44×44px**;
  - compact from 64rem: max(32, 17.5 + 18) = **35.5×35.5px**, at least 24px (2.5.8);
  - step 6 icon in comfortable: 24 + 18 = 42, so 44×44px.
- No `aspect-ratio` (it fights the minimum sizes) and no fixed `inline-size` (content must never overflow at 200% text).
- The icon inherits the variant's colour: `text`, `on-primary`, `on-danger`, and `text-muted` when disabled.
- It's a class and not `:has(> .kv-icon:only-child)`, because `:only-child` ignores text nodes (Plan 0009).

**Forced colours**

```
@media (forced-colors: active) {
  .kv-icon { color: inherit; }
  .kv-icon[fill]:not([fill='none' i], [fill='transparent' i]) { fill: currentColor; }
  .kv-icon[stroke]:not([stroke='none' i], [stroke='transparent' i]) { stroke: currentColor; }
}
```

- SVG defaults to `forced-color-adjust: preserve-parent-color`, so an explicit hex colour on the root survives forced colours and can vanish. `inherit` resolves to the parent's system colour: `CanvasText` in text, `ButtonText` in a button, `LinkText` in a link, `GrayText` when disabled, and `HighlightText` in a selected option.
- A token colour (`color="var(--kv-color-danger)"`) is already `CanvasText` through the theme's forced-colours tokens. The rules make hex values and library defaults (Phosphor sets `fill` from its `color` prop) behave the same.
- **Root only.** Colours hard-coded on child shapes aren't touched, because flattening a two-tone logo would fill it into a blob. The docs tell adopters to use `currentColor` in their own SVGs.
- Unlayered consumer CSS that colours an icon wins over these rules (`@layer kv`). The docs say to use tokens, or to add a forced-colours rule.
- **Not colour alone:** the status icons differ in shape (§6.1), so they stay distinct when all four are `CanvasText`.

**Exclude icons from media rules** (existing rules that would catch an Icon):

- Prose: `.kv-prose > svg` and `figure > svg` make an svg a block picture with margins and a radius. Change them to `svg:not(.kv-icon)`.
- Card: the two card media rules (`:is(.kv-card, .kv-card-header, .kv-card-body, .kv-card-footer) > :is(img, video, svg)`, and the full-bleed rule) would make an icon that is a direct child of a part `block-size: auto`, or 100% wide. Change them to `svg:not(.kv-icon)`. Keep the current specificity, for example by wrapping the `:not()` in `:where()`.
- The unknown-name placeholder `<svg>` carries `viewBox="0 0 24 24"`. Without it, `block-size: auto` gives it a 150px default height.

### 6.3 Colour

An icon is `currentColor` by default, so it matches its text. With a colour, use semantic tokens only:

| Token                                       | Use for an icon                                                    | 3:1 against its background (1.4.11)                                                         |
| ------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| inherited (`text`)                          | The default, everywhere                                            | ≥ 4.5:1 on every surface and `-subtle` background (text pairs in `theme:check`)             |
| `text-muted`                                | A decorative icon next to metadata                                 | ≥ 4.5:1 on canvas, surfaces, `primary-subtle` and the status backgrounds                    |
| `danger`, `success`, `warning`              | Status icons, always with the status in words                      | ≥ 4.5:1 on canvas, surfaces and their own `-subtle` background (text pairs)                 |
| `primary`                                   | Selected or current indicators only (a check in a selected option) | ≥ 3:1 on canvas, surfaces and `primary-subtle` (non-text pairs, lowest 3.75:1 dark)         |
| `on-primary`, `on-danger`                   | Inherited inside filled buttons. Never set by hand                 | ≥ 4.70:1                                                                                    |
| Never: `border-subtle`, `secondary`, `link` | –                                                                  | A hairline fails 3:1. `link` means "this is a link". `secondary` is the button edge's token |

- `info` takes the inherited text colour until the Alert spec gives info a colour (open question 5).
- **No new tokens and no new colour pairs.** Every pair above is already in `contrast-requirements.ts`.

### 6.4 States

Icon has no states of its own. It inherits `color` from its parent:

| Context          | default                                  | hover        | focus-visible      | active       | disabled     | selected                              |
| ---------------- | ---------------------------------------- | ------------ | ------------------ | ------------ | ------------ | ------------------------------------- |
| Secondary button | `text`                                   | `text`       | Ring on the button | `text`       | `text-muted` | –                                     |
| Primary button   | `on-primary`                             | `on-primary` | Ring on the button | `on-primary` | `text-muted` | –                                     |
| Danger button    | `on-danger`                              | `on-danger`  | Ring on the button | `on-danger`  | `text-muted` | –                                     |
| Link             | `link`                                   | `link-hover` | Ring on the link   | `link-hover` | –            | –                                     |
| Forced colours   | `ButtonText`, `LinkText` or `CanvasText` | Same         | `Highlight` ring   | Same         | `GrayText`   | `HighlightText` (in a future listbox) |

### 6.5 Modes

- **Dark and contrast themes:** only the tokens change. Icons follow `currentColor`.
- **Forced colours:** §6.2. Status icons differ in shape. An icon-only button keeps the Button's `ButtonText` border, so the target stays visible.
- **RTL:** icons 3–7 mirror. DOM order gives start and end positions in a Button. Chevrons in Pagination and Calendar point the right way.
- **Motion:** none. A component that rotates an icon (Accordion) animates it only under `prefers-reduced-motion: no-preference`, in its own spec.
- **320px, 400% zoom, 1.4.12:** `em` sizes scale with the text. No fixed sizes in the theme. Text spacing widens the gap in running text, and nothing is clipped.

### 6.6 Stories (`Components/Icon`)

Every story runs axe. Strings come from the fixture (§4.3).

| Story                              | Shows                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Built-in set**                   | A `ul role="list"` grid of all 24. Each cell has the icon at steps 4, 5 and 6 in a row, its name as `<code>`, and "Mirrors in RTL" as text for icons 3–7. Decorative icons, so the name is the text. The reviewer's sheet for §6.1                                                                                                                                        |
| **Sizes next to text**             | Steps 4, 5, 6 and `'32px'` inline in `body`, `body-large` and `heading-2` text (`text.collection`), plus a capital-height guide line. Also a 200% text variant                                                                                                                                                                                                            |
| **In buttons**                     | Icon at the start (`button.addChild` with `add`), at the end (primary, `button.continue` with `arrow-forward`), and icon-only (`close`, `search`, with `aria-label`). Each in secondary, primary, danger and disabled. Comfortable and `kv-compact`. `button.download` wraps at 320px in `fi` with its icon intact. A `kv-button-group` with an icon-only button at 320px |
| **Status with text**               | The four status icons, each with its visible status word and line (`status.*`), on `canvas` and on its `-subtle` background with the panel's inline-start bar. Plus a greyscale (CSS filter) copy, to show the shapes alone carry the difference                                                                                                                          |
| **Colours**                        | Inherited colour, then `color` set to each allowed token from §6.3, with the token name as `<code>`                                                                                                                                                                                                                                                                       |
| **Decorative and meaningful**      | A decorative icon next to text, and an icon with `label` (`label.logo`) with its accessible name printed below it from the accessibility tree (play function)                                                                                                                                                                                                             |
| **Stroke widths**                  | `iconDefaults.strokeWidth` 1, 1.5 (default) and 2 on the full set at 16px, to check the gap rules                                                                                                                                                                                                                                                                         |
| **Right to left**                  | `dir="rtl"`: icons 3–7 next to `check`, `search` and `chevron-down`, labelled "mirrors" and "doesn't mirror". Button with `arrow-forward` at the end. `chevron-back` and `chevron-forward` in a Pagination-like row                                                                                                                                                       |
| **Forced colours**                 | Icons with `color="#c00"`, `fill="#c00"` and `stroke="#c00"` and a token colour, in text, a Button and a Link. The e2e project checks they render as the system colour                                                                                                                                                                                                    |
| **Your own SVG**                   | Children (`viewBox` and paths), and `as` with an imported `.svg` component                                                                                                                                                                                                                                                                                                |
| **Library icons via the registry** | A provider that registers Lucide `close`, Heroicons `delete` and Phosphor `warning` over the built-ins. The built-in and the override side by side, the same `size` and `color` on each, and `arrow-forward` overridden with a plain component still mirroring in RTL (§4.2)                                                                                              |
| **In running text and links**      | `text.collection` with `calendar`, and a Link `text.guide` + `link.newTabNotice` + `external`, wrapping at 320px                                                                                                                                                                                                                                                          |
| **Unstyled**                       | Theme toolbar "None": sizes and colours still work (attributes), and alignment, mirroring and the icon-only square don't                                                                                                                                                                                                                                                  |

Button stories gain "Icon at start", "Icon at end" and "Icon only" rows, as in the plan.

### 6.7 DESIGN.md Iconography: proposed replacement text

The maintainer applies this as a DESIGN.md rule change. It replaces the **Icons** bullet under Shapes:

> - **Icons**: outline style, a 1.5 stroke on a 24 grid with round caps and joins, in `currentColor`. `@kvirn-ui/react` ships 24 built-in icons with semantic names, in the style of Heroicons outline but drawn from our own keylines (`docs/design/icon.md`). An app that registers the same name in `KvirnProvider` replaces a built-in, and Kvirn's components follow it.
>   - **Sizes** are a step of Tailwind's `size-*` scale (`size={4}`), and a step is 0.25em, so an icon grows with the text. Step 4 is 1em, 5 (default) 1.25em and 6 1.5em: 16, 20 and 24px next to 16px text. Use 5 in buttons, because it equals their line height. A string is a CSS length (`size="48px"`). Size, stroke and colour are SVG attributes. The theme never sets them, except in forced colours, where an icon takes its parent's system colour.
>   - **Meaning.** An icon is decorative (`aria-hidden`) unless it has a `label` from i18n. A status icon always comes with the status in words, and the four statuses differ in shape as well as colour: info a square, success a circle, warning a triangle, error an octagon. A meaningful icon has 3:1 contrast against its background.
>   - **Direction.** Name by meaning (`chevron-forward`, `arrow-back`). Only icons that show horizontal direction mirror in RTL (`mirrorInRtl`). Check marks, status icons, objects and `search` never mirror.
>   - **Icon-only buttons** (`kv-button--icon-only`) are square, at least the button's minimum height, with 8px padding. Use them only for close and search, with an accessible name from i18n and, from M2, a visible tooltip with the same text. The menu toggle on resident-facing pages shows the word "Menu" too.
>   - Icons are inline SVG. No icon fonts, and no icons from third-party servers.

Front matter addition, under `components`:

```yaml
button-icon-only:
  padding: 8px
  width: 44px # minimum, equal to the button's minimum height; 32px in compact density
```

## 7. Accessibility annotations

Draft input for `packages/react/src/icon/icon.a11y.md` and a new row in `button.a11y.md`. The plan's contract table stands.

**When an icon needs a `label`**

- Only when the icon is the **only** carrier of its meaning in the content: a logo, or a status icon in a dense table cell whose column header doesn't say it. Prefer adding words instead.
- **Never when nearby text says the same thing.** A label there makes screen readers read it twice ("Warning, Warning: your session ends…").
- The label is a noun phrase from i18n ("Exempelby municipality", "Error"), not a description of the drawing ("red octagon").
- Never put a `label` on an icon inside a button or link that already has a name. The icon stays decorative.

**Status icons (1.4.1, 1.3.3)**

- Always next to text that states the status in words: a visible status word ("Warning:") or a heading ("There is a problem"). Colour and shape are additional cues.
- The four statuses use four shapes. Never recolour one status icon to stand for another.
- Errors are still linked to their field with `aria-describedby` and listed in the error summary. The icon adds nothing to the accessibility tree.

**Icon-only buttons (4.1.2, 2.5.3, 2.5.8)**

- Allowed only for universally known actions: `close` and `search`. The menu toggle shows "Menu"/"Meny" as text on resident-facing pages, and may be icon-only in staff tools. Every other icon-only use needs its own spec to justify it, for example Calendar's month navigation inside the DatePicker dialog.
- The name goes on the Button (`aria-label` or `aria-labelledby`) from i18n: the component's own messages, or the app's translations. The icon stays decorative. In development, Button warns if it has no name (Plan 0009).
- The name is a verb or a recognisable action: "Close", "Search". Use "Close", not "Close dialog", unless several close buttons are on the page.
- The visible tooltip (DESIGN.md) comes with Tooltip in M2. It shows the same string as the accessible name, so they match (2.5.3). Until then, keep icon-only buttons to the allowed list.
- Size: 44×44px in comfortable and at least 24×24px in compact (§6.2). The focus ring is the Button's.
- The icon is the control's only visual identifier, so it needs 3:1 against the button's fill (1.4.11). It inherits `text`, `on-primary` or `on-danger`, which are all at least 4.5:1.

**Paired icons**

- `eye` and `eye-off` show the **action**, matching the text: "Show password" with `eye`, "Hide password" with `eye-off`. Always with the text. State goes in the text, and in `aria-pressed` if the component uses a toggle (the password field's spec decides).
- `external` never replaces the new-tab notice text, which is part of the link's name (G201, Link). It comes after the notice and is decorative. Never use `white-space: nowrap` to keep it with the last word: at 320px an icon on its own line is better than a horizontal scroll.
- `language` is always next to the language's name in its own language ("Svenska", "Suomi", "Davvisámegiella"), with `lang` on the name. Never a flag.

**Everything else**

- **Keyboard and focus:** none. An icon is never focusable, and never gets `tabindex`.
- **Announcements:** none.
- **Text alternatives in forced colours:** the forced-colours rules keep every icon visible. Shapes, not colours, carry status.
- **WCAG SCs of note:** 1.1.1, 1.3.1, 1.3.3, 1.4.1, 1.4.4, 1.4.10, 1.4.11, 1.4.12, 2.5.3, 2.5.8, 4.1.2.

## 8. Validation

- [x] Self-review against `.claude/skills/design/references/review-checklist.md`. No open blockers. No hard-coded strings: icon names are code, and every story string has a fixture key. No colour-only status. Targets are 44px and 24px+. There are no tooltips holding essential information (Tooltip is M2, and icon-only use is limited to close and search until then).
- [x] Contrast: no new colour or pair. Every icon colour in §6.3 is an existing pair in `contrast-requirements.ts`.
- [ ] Design review of the drawn set against §6.1, from a screenshot of "Built-in set" and "Stroke widths" at 16, 20 and 24px in light and dark: `pending` (after implementation).
- [x] Usability test plan written. Result: `pending`.

### Usability test plan

- **Participants (6–8):**
  - a screen-reader user (NVDA or VoiceOver);
  - a screen-magnifier user at 200–400%;
  - a Windows Contrast Themes user;
  - a person with colour vision deficiency;
  - an older resident with low digital confidence;
  - a second-language reader;
  - two Arabic-reading residents (for RTL);
  - one staff user in compact density.
- **Tasks:**
  1. Icon recognition without labels: name what `close`, `search`, `menu`, `download`, `upload`, `delete`, `calendar`, `language` and `external` do. This checks which icons are universal enough for the icon-only list.
  2. On a form with an error summary, a warning and a hint, in greyscale or forced colours, say which message is an error. This checks the shape difference.
  3. In a password field, show the password, then hide it again.
  4. Change the language from the site header.
  5. RTL: go to the next page of search results, and go back one step in a form.
  6. Close a dialog with the icon-only close button, using touch and the keyboard.
- **What we measure:**
  - Recognition rate per icon. An icon below about 80% isn't universal.
  - Errors between statuses, and wrong-direction taps in RTL.
  - Task completion, and missed taps on the icon-only button.
  - Whether screen-reader users hear any icon (they shouldn't, except a labelled one).
- **Result:** `pending`. Assistive-technology testing is also `pending`.

## 9. Open questions

1. **Plan and decision updates.** Plan 0009 still lists "Shipping an icon set" as a non-goal, with open question 3 unresolved, and the Icon API decision lists the built-in set as open. Record the maintainer's decision as an amendment to the Icon API decision, and update the plan.
2. **Mirroring belongs to the name.** Should an app's plain-component override of a built-in name keep the built-in's `mirrorInRtl` (recommended, §4.2)? It changes the Icon API decision's precedence ("the entry's" value).
3. **Stroke at step 4.** At 16px the 1.5 stroke renders as 1px. That's fine for decorative icons, but thin for a meaningful icon. Keep it, or let `iconDefaults` take a per-size stroke later? This spec keeps it.
4. **Slot 25.** Hold it for `sort` (Table) or `help`, or confirm the cuts in §4.1 (`remove`, `help`, `user`, `log-out`, `edit`, `mail`, `phone`, `home`).
5. **Info colour.** `info` inherits the text colour here. The Alert spec should decide whether info gets a status colour token (none exists in DESIGN.md today).
6. **Navigation items with icons.** `.kv-nav .kv-link` has no `gap`. Decide in the NavigationMenu or site header spec.
7. **Capital-height alignment** assumes IBM Plex's metrics (cap 0.698em, for Sans and Serif). A brand font with a very different capital height is off by about 1px. Acceptable, or add an override property later (that would need a new token)?
8. **Bundle cost.** The 24 built-ins are always in the provider's bundle. Confirm the size budget in the plan (an engineering estimate, not measured here).
