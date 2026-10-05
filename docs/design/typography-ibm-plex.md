# Design spec: Typography in IBM Plex Sans and IBM Plex Serif

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-01
- **Plan:** [0011](../plans/0011-ibm-plex-typography.md)
- **Type:** theme/token change

The maintainer has decided (2026-10-01): IBM Plex Sans for body text, labels and controls, and IBM Plex Serif for headings. This spec says how. Figures marked _measured_ come from fontTools on the committed woff2 files in `apps/docs/fonts/ibm-plex/`, or from a Playwright render of them, both run here on 2026-10-01.

## 1. Brief

- **Users:** both. Hardest case: a resident reading a case number (`BAB-2026-004512`) aloud to a phone helpdesk in their second language, with low vision at 200% zoom. Also a Northern Sámi reader whose name contains ŋ or ŧ.
- **Job:** read headings, labels and identifiers correctly the first time, on any OS, whether or not the font loads.
- **Constraints:** the theme loads no font, and no telemetry (hard rule 7). The files must stay unmodified (OFL Reserved Font Name "Plex"). Sizes stay in rem, `body` stays at 16px or more, and there's no 12px or 13px.
- **Success:** button labels look centred in Brave on Ubuntu (the maintainer's check). Every Nordic and Sámi letter comes from Plex. l/I/1 and O/0 can be told apart. No new 1.4.10 or 1.4.12 failures.
- **Assumption:** the smaller x-height doesn't hurt reading at 16px. → Research question in §8.

## 2. Prior art

| Source                           | We reuse                                                                        | We change, and why                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| IBM Carbon type tokens           | Plex at 0 tracking for most sizes. Carbon doesn't use negative tracking on Plex | Display gets a slight −0.01em, because our display is set in the serif at weight 600 (§3.3)                |
| KvirnUI today (`theme.css`)      | Every size, the role names, and the rem scale                                   | Families, heading tracking, display line height and feature settings                                       |
| GOV.UK, Designsystemet, Suomi.fi | One family for text and controls, and headings set apart by size and weight     | We add a serif for headings (the maintainer's decision). Hierarchy still never depends on the family alone |

## 3. Visual specification

### 3.1 Family tokens

| Token                           | Value                                                                         | Status               |
| ------------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| `--kv-font-family-system`       | unchanged (`system-ui, -apple-system, 'Segoe UI', Roboto, …, sans-serif`)     | –                    |
| `--kv-font-family-sans`         | `'IBM Plex Sans', var(--kv-font-family-system)`                               | changed              |
| `--kv-font-family-system-serif` | `ui-serif, Cambria, 'Noto Serif', Georgia, serif`                             | **new** (proposed)   |
| `--kv-font-family-serif`        | `'IBM Plex Serif', var(--kv-font-family-system-serif)`                        | **new**              |
| `--kv-font-family-mono`         | unchanged                                                                     | –                    |
| `--kv-font-family-body`         | not set. Read as `var(--kv-font-family-body, var(--kv-font-family-sans))`     | unchanged            |
| `--kv-font-family-heading`      | not set. Read as `var(--kv-font-family-heading, var(--kv-font-family-serif))` | **fallback changed** |

- **How the serif becomes the default.** Only the fallback changes, from `sans` to `serif`. `--kv-font-family-heading` stays unset in `:root`, so it still works on `:root` or on any container, the same as the other site-wide defaults (DESIGN.md Theming).
- **The serif fallback,** used when Plex Serif isn't self-hosted or hasn't loaded yet. `ui-serif` gives New York in Safari. Cambria is on Windows. Noto Serif is on Android and most Linux desktops. Georgia covers macOS in Chrome and Firefox. Each is expected to cover å ä ö æ ø and the Sámi letters, but this must be checked in the Glyphs story (§4). Cambria and Noto come before Georgia because Georgia draws old-style figures, which matters for headings with dates or case numbers. A sans fallback (`var(--kv-font-family-system)`) was rejected: headings would change their character depending on whether the font loaded. The new `system-serif` token is the serif twin of `system`. Adopters end their own serif stack with it, and the Glyphs story renders it. This adds a token that plan 0011 doesn't list (see §9).
- **Loading (docs site and Storybook, `ibm-plex.css`):** use the family names `'IBM Plex Sans'` and `'IBM Plex Serif'` exactly, give each weight and subset its own `@font-face` with IBM's `unicode-range`, add `font-display: swap`, and use `url()` only, with no `local()`. A locally installed Plex may be an older version without the Latin2 letters.

### 3.2 Which surfaces use the serif

| Serif (`--kv-font-family-heading` → serif)                                                                                                                                        | Sans (`--kv-font-family-body` → sans)                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Prose `h1`–`h6` (`theme.css`, the existing heading rule, new fallback only)                                                                                                       | Body, lead and all body roles, links in body text, `strong`                                                        |
| The `display` role, including the docs home page's `.docs-display`. It's an `h1` inside `.docs-article.kv-prose`, so it inherits the family from prose. Check it renders in serif | Buttons, labels, form legends, navigation (`.kv-nav`), the docs header and its controls                            |
| Docs-site page headings (`PageHeading`, `.docs-article > h2/h3`), through prose                                                                                                   | Tables (`th`, `td`, which use `numeric`), `caption`, `figcaption`                                                  |
| Storybook Foundation page headings (`.kv-story-foundation.kv-prose`), and the Type roles specimens for display and heading-1 to heading-6                                         | Storybook swatch titles (`.kv-story-card-title` is a `<p>`), badges and tags, metadata                             |
| Card titles where they are headings inside `kv-prose` (card.md: `h2`, and `h3 > Link`). A link keeps the serif of its heading                                                     | A card header outside `kv-prose` isn't styled by the theme. The consumer uses the heading family if it's a heading |

**Rule:** the serif is for document headings, meaning real `h1`–`h6` elements and the `display` role. Anything users operate or scan as data stays sans. Future component titles (Dialog, Alert, ErrorSummary) follow this rule in their own specs: a heading element gets the serif, and an inline status title stays sans.

### 3.3 Role tokens

Sizes and weights stay as they are. Changed values are in **bold**.

| Role          | Family | Size     | Weight | Line height        | Letter spacing           | Feature settings                  |
| ------------- | ------ | -------- | ------ | ------------------ | ------------------------ | --------------------------------- |
| display       | serif  | 2.5rem   | 600    | **1.2** (was 1.15) | **−0.01em** (was −0.025) | normal                            |
| heading-1     | serif  | 1.75rem  | 600    | 1.2                | **0em** (was −0.021)     | normal                            |
| heading-2     | serif  | 1.375rem | 500    | 1.25               | **0em** (was −0.018)     | normal                            |
| heading-3     | serif  | 1.125rem | 600    | 1.4                | 0em                      | normal                            |
| heading-4     | serif  | 1rem     | 600    | 1.4                | 0em                      | normal                            |
| heading-5     | serif  | 1rem     | 500    | 1.5                | 0em                      | normal                            |
| heading-6     | serif  | 1rem     | 500    | 1.5                | 0.03em                   | normal                            |
| lead          | sans   | 1.25rem  | 400    | 1.5                | 0em                      | **normal** (was cv05, cv08)       |
| body-large    | sans   | 1.125rem | 400    | 1.6                | 0em                      | **normal**                        |
| body          | sans   | 1rem     | 400    | 1.5                | 0em                      | **normal**                        |
| body-small    | sans   | 0.875rem | 400    | 1.5                | 0em                      | **normal**                        |
| label         | sans   | 1rem     | 500    | 1.4                | 0em                      | normal                            |
| label-compact | sans   | 0.875rem | 500    | 1.3                | 0em                      | normal                            |
| numeric       | sans   | 1rem     | 400    | 1.5                | 0em                      | **'tnum'** (was tnum, cv05, cv08) |
| code          | mono   | 0.875rem | 400    | 1.6                | 0em                      | normal                            |

- **Weights in use:** Sans 400 (text), 500 (labels), 600 (`strong`, the current navigation item, and the adopter `--kv-button-font-weight` example). Serif 500 (heading-2) and 600 (the others). Nothing asks for 700, so no bold is synthesised. Italics are synthesised in both families, as with Inter today.
- **Tracking.** Inter's negative tracking was tuned for a tight grotesque. In a serif it pushes the serifs together. In the _measured_ render, −0.025em at 40px crowded "bostadsbidrag", while −0.01em kept the serifs apart and still closed up the display size. From 28px down, 0 reads best, and that matches IBM's own use of Plex.
- **Display line height 1.15 → 1.2.** _Measured_ in Plex Serif SemiBold: the top of Å is at 0.994em and the bottom of g, j and y is at −0.212em, 1.206em together. At 1.15, a wrapped display heading's Å ring cuts 0.056em (about 2px) into the descender above it. At 1.2 that's 0.006em, and the ring doesn't visibly touch. 1.2 × 40px is 48px, which is on the 4px grid (46px wasn't). heading-1 is already 1.2. No other line height changes.
- **No size change for the smaller x-height.** Plex Sans's x-height is 0.516em, against Inter's 0.546em (8.3px against 8.7px at 16px). Matching it would take 16.9px, an off-scale size that would change control heights, the measure and every layout. The next step up (18px, `body-large`) is already the default for long resident-facing text. The 16px floor protects users' own settings, and rem keeps zoom working (1.4.4). Plex Sans is also narrower (_measured_: lowercase averages 0.505em at 400, against Inter's 0.536em), so it adds no wrapping risk. We keep the sizes and test the assumption (§8).
- **Centring (the reason for the change), _measured_:** the content area is (1025 + 275) / 1000 = 1.3em. Its middle is 0.375em above the baseline, and the middle of the capitals is 0.349em, so caps sit 0.026em (0.4px at 16px) below the middle. `hhea` equals `win`, so every OS gets the same box. Acceptance is the maintainer's screenshot in Brave on Ubuntu, not this arithmetic.

### 3.4 Modes

- **Themes and contrast:** no colour changes, so `theme:check` only has to stay green.
- **Forced colours:** no change. Fonts aren't affected by forced colours.
- **RTL:** no change. There are no RTL locales, and the samples are Latin script.
- **Motion:** none. `font-display: swap` reflows once, the first time the page loads.
- **Reflow and text spacing (1.4.10, 1.4.12):** the 1.3em content area is taller than the line box at display, heading-1 and heading-2 (line heights 1.2 to 1.25). Glyph boxes overhang by up to 0.05em, and that's normal. It means no text container may clip with `overflow: hidden` (that rule already exists in DESIGN.md). Under the 1.4.12 overrides, letter spacing 0.12em replaces −0.01em, and line height 1.5 is above 1.3. No fixed heights change.

## 4. Accessibility checks

- **l, I and 1** (_measured_, rendered from the files with no features on). In Plex Sans, `I` has slab serifs at the top and bottom, `l` has a tail, and `1` has a flag and a foot. In Plex Serif, `I` has serifs on both sides, `l` has a serif on the left at the top and a foot, and `1` has a flag and a foot. They're distinct by default, so we **enable no stylistic set**. `cv05` and `cv08` are removed because Plex doesn't have them.
- **O and 0.** In Plex, `O` is round and wide (Sans 708 units) and `0` is a narrow oval (600 units). They're distinct side by side, but not in isolation. Both fonts have a slashed zero (`zero` and `ss03`) and a dotted zero (`ss04`), with the same meaning in Sans and Serif (_measured_ from GSUB). **We use neither by default.** A slashed zero looks like Ø to Danish and Norwegian readers, and a dotted zero adds noise to tables of amounts. Alphanumeric identifiers where O/0 matters already use the `code` role (mono), and the Storybook case-number sample does too. If a product sets such identifiers in Plex Sans, the guidance is `font-feature-settings: 'tnum', 'ss04'` (the dotted zero, never the slashed one).
- **Figures.** Plex has only tabular figures (no `pnum` or `tnum` feature). `numeric` keeps `'tnum'` for the fallback and for brand fonts.
- **Sámi and Nordic glyphs** (_measured_): all five weights cover Å Ä Ö Æ Ø, Á Č Đ Ŋ Š Ŧ Ž in both cases, € – — ‘ ’ “ ”, ✓ and →. In the Glyphs story, the rows become: Body (Plex Sans), Heading (Plex Serif), System fallback, **System serif fallback (new)** and Mono. The look-alikes stay `Il1 0O`. Check the system serif row on Windows, macOS and Linux: `pending`.
- **Fallback limitation (not new):** the system sans fonts (Segoe UI, Roboto, San Francisco) draw I and l almost alike, and no feature can fix that. The Glyphs page should say so.

## 5. Corrections to other files

**`apps/storybook/.storybook/preview.css`, text guide (~566–572).** The constants are the same for Sans and Serif:

- Comment: "the baseline and the capital height (IBM Plex, 0.698em). The content area is 1.3em (ascent 1.025 + descent 0.275), centred in the line box."
- `--kv-story-baseline: calc(((var(--kv-story-guide-line-height) - 1.3) / 2 + 1.025) * 1em)`
- `--kv-story-cap-height: calc(var(--kv-story-baseline) - 0.698em)`

**`docs/design/icon.md`.** Line 262 and the rows after it use the formula (cap − size) ÷ 2 with cap at 0.7em:

| Size (em) | Was      | New             | Note                                                                                                                                                                                                     |
| --------- | -------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sm` 1    | −0.125em | **−0.15em**     | "Centres the icon on the capital height (IBM Plex 0.698em): (0.7em − size) ÷ 2"                                                                                                                          |
| `md` 1.25 | −0.25em  | **−0.275em**    | In headings with line height 1.25 or less, it reaches 0.025em below the line box (under 1px). Accepted                                                                                                   |
| `lg` 1.5  | −0.375em | −0.375em (keep) | The formula gives −0.4em, but that's 0.025em below the line box at line height 1.5 (Plex: half-leading 0.1em), which would make lines uneven. At −0.375em it's 0.026em above centre, which can't be seen |

Open question 7 (line 479): "Capital-height alignment assumes IBM Plex's metrics (cap 0.698em, for Sans and Serif)…". The rest stays.

**Storybook `typography.stories.tsx`** (maintainer copy, not i18n):

- `familyValue('heading')` → `var(--kv-font-family-heading, var(--kv-font-family-serif))`.
- Font families table: add `--kv-font-family-serif` ("IBM Plex Serif, then the system serif stack. Headings") and `--kv-font-family-system-serif`. Sans becomes "IBM Plex Sans, then the system stack". The heading row's fallback becomes `--kv-font-family-serif`.
- Glyphs page copy: "IBM Plex tells l, I and 1, and O and 0, apart without features. A replacement font that can't needs its own feature settings (Inter: `cv05`, `cv08`) in the body role tokens. The system fonts can't."
- Tabular figures: the body column header becomes "body: the font's default figures", plus one sentence: "Plex has only tabular figures, so both columns line up here. In most system fonts body figures are proportional."

**`theme.css` comments** (lines 236–240 and 30): name Plex, and say that headings fall back to the serif. The header example still shows a brand pair.

## 6. DESIGN.md replacement text

**Line 4 (description):** replace "tight Inter typography" with "IBM Plex typography (Plex Sans for text, Plex Serif for headings)".
**Line 216:** "- IBM Plex Sans for text and controls, and IBM Plex Serif for headings, with no negative tracking below the display size".
**Front matter:** display to heading-3 `fontFamily: 'IBM Plex Serif, ui-serif, Cambria, Noto Serif, Georgia, serif'`. The other roles except code: `fontFamily: 'IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Arial, sans-serif'`. Display `lineHeight: 1.2`, `letterSpacing: -0.01em`. heading-1 and heading-2 `letterSpacing: 0em`. Remove `fontFeature` from the body roles, and numeric gets `fontFeature: '"tnum"'`.

**Typography section (replace the intro line and lines 315–318 and 326):**

> One sans-serif family for text and controls, one serif family for headings, each with a system fallback, and one monospace family for reference numbers and code.
>
> - **Families.** Body text and controls (prose, buttons, labels, navigation, tables and captions) use `--kv-font-family-body`, which falls back to `--kv-font-family-sans`. Headings (prose `h1`–`h6` and the `display` role) use `--kv-font-family-heading`, which falls back to `--kv-font-family-serif`. The theme sets neither override. A link keeps the font around it, and code stays `--kv-font-family-mono`. The serif is only for real headings: anything users operate or scan as data stays sans, and hierarchy never depends on the family alone.
> - **Why IBM Plex.** Plex Sans's capitals sit in the middle of the line box, and its vertical metrics are the same on every OS (`hhea` = `win`, 1025/275), so button labels look centred on Windows, macOS and Linux. It tells l, I and 1 apart without features, and it covers every Northern Sámi letter. Plex Serif shares its metrics and gives headings a distinct, calm voice. Both are SIL OFL 1.1, with "Plex" a Reserved Font Name: use IBM's files unmodified, and never subset or rename them.
> - **Weights.** Sans 400 (text), 500 (labels and controls) and 600 (`strong`, the current item). Serif 500 (`heading-2`) and 600 (the other headings). Upright only: italics are synthesised. Nothing uses 700.
> - **System stacks.** `--kv-font-family-system` is `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif`, and `--kv-font-family-sans` is `'IBM Plex Sans'` in front of it. `--kv-font-family-system-serif` is `ui-serif, Cambria, 'Noto Serif', Georgia, serif`, and `--kv-font-family-serif` is `'IBM Plex Serif'` in front of it. End a brand stack with the matching system stack, and check the Glyphs story in Foundation/Typography.
> - **Loading.** The theme never loads a font (GDPR, AGENTS.md hard rule 7). The docs site and Storybook self-host IBM's split woff2 files (Latin1, Latin2, Pi). Adopters either self-host the same files, from [IBM Plex's GitHub releases](https://github.com/IBM/plex/releases) or copied from `apps/docs/fonts/ibm-plex/` with `OFL.txt`, or rely on the system fallback. The `@ibm/plex-sans` and `@ibm/plex-serif` npm packages send IBM telemetry from a `postinstall` script. Don't install them as dependencies: fetch them with `npm pack`, or set `IBM_TELEMETRY_DISABLED=true` if you must install them. A replacement brand font must cover the Sámi letters as well as å ä ö æ ø.
> - **Disambiguation.** No feature settings are needed: Plex's `I` has serifs, its `l` a tail and its `1` a flag and a foot. Don't turn on the slashed zero (`zero`, `ss03`), which reads as Ø in Danish and Norwegian. Set codes where O and 0 matter in `code` (mono), or add `'ss04'` (the dotted zero). A brand font that needs features for l, I and 1 sets them in the `--kv-font-*-feature-settings` tokens (Inter: `'cv05', 'cv08'`).
> - **Headings.** Weight 600 (500 for `heading-2`). `display` has −0.01em tracking and line height 1.2, so the ring on Å clears the descenders above it. Below 40px there is no tracking: negative tracking crowds the serifs, and it reverses under the 1.4.12 overrides anyway.
> - **One family, or keep Inter.** For a single family, set `--kv-font-family-heading: var(--kv-font-family-sans)`. To keep Inter, set both family tokens and the body feature settings.

Lines 319–325 and 327–330 (numbers, scale, measure, sentence case, text spacing, rem) are unchanged.

## 7. Accessibility annotations

No roles, names, focus or announcements change. The relevant SCs: 1.4.4 (rem), 1.4.10 and 1.4.12 (§3.4), 1.4.8 is advisory (line length, see §9), and 3.1 (readability of identifiers, §4). No new strings, so no i18n keys.

## 8. Validation

- [x] Self-review against `review-checklist.md`: no colour, target or focus changes. Families, glyphs, metrics and features were measured from the shipped files.
- [x] Contrast: no new colour pairs. `theme:check` must stay green.
- [ ] Engineering checks (plan 0011): the computed font is Plex for body, buttons and prose headings. Display wraps cleanly at 320px in `fi`. The 1.4.12 e2e project passes. Screenshot of a Button in Brave on Ubuntu (maintainer).
- [ ] Usability test plan. Result: `pending`.

**Usability test plan (`pending`):** 6–8 participants: a screen magnifier user at 200–400%, dyslexia, low digital confidence, a second-language Swedish or Finnish reader, and a Northern Sámi reader. Tasks: (1) read a case number and a reference code aloud from a card heading and from a table; (2) find and name the section about who can apply, from a long prose page; (3) read a Sámi personal name in a heading and in a label. We measure misread characters (l/I/1, O/0, ŋ/n, ŧ/t), time to find the section, and comments on text size. The x-height assumption fails if more than one participant asks for bigger body text, unprompted.

## 9. Open questions

1. **New token `--kv-font-family-system-serif`.** It isn't in plan 0011 or the IBM Plex decision. Accept it (recommended), or write the serif fallback inline in `--kv-font-family-serif` and drop the Glyphs row.
2. **Adopter upgrade.** Every adopter who sets only `--kv-font-family-body` will now get serif headings. Plan 0011 says minor (pre-1.0). The changeset should lead with the one-line opt-out.
3. **Georgia's old-style figures** in Chrome and Firefox on macOS without Plex. Acceptable for a fallback?
4. **Out of scope:** `--kv-prose-measure: 70ch` comes to about 92 characters a line (_measured_ estimate, the same in Inter and Plex, because `ch` is the zero's width), above DESIGN.md's 60–75. That needs its own change.
