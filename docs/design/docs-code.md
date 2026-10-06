# Design spec: docs code blocks, the example's code disclosure and a docs-only highlighter

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** to be written (closes the docs side of G7 in [docs-site-components.md](docs-site-components.md); amends [docs-site.md](docs-site.md) §6 "Code block" row and Open question 4, and [docs-component-page.md](docs-component-page.md) "Example Card")
- **Type:** docs page parts (`apps/docs` only). No change to `packages/`, `theme.css` or any token value.

## 1. Brief

- **Users:** integrators and evaluators (docs-site.md §1). **Hardest cases:** a Finnish accessibility specialist with NVDA at 200% zoom; an integrator on a 320px phone copying one use case between meetings; a keyboard-only or voice-control user ("click Copy code").
- **Job:** "When I find the case like mine, I want to see it work, read its code and copy it in one action, so I can paste it into my app and get the same result."
- **Context:** often, quickly, desktop and phone. Copying is the end of the task; reading code is the middle.
- **Constraints:** no new dependency (AGENTS.md rule 6), so the highlighter is hand-written; no network calls (rule 7); every string keyed (rule 4); the Announcer exists (`useAnnouncer`).
- **Success:** task "copy the code for use case X" completed without a wrong turn; copied text pastes and runs (no line numbers, no prompts); a screen reader user hears the copy confirmed.
- **Assumptions** (no evidence yet): A1 most visitors copy rather than read the whole code; A2 a collapsed code area shortens pages enough at 320px to matter. Research questions: do NVDA users find the code when it's collapsed? Do they understand the line count? (`pending`)

## 2. Prior art

| Source (checked 2026-10-06)                                                                                                         | What we take                                                                | What we leave                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Reference image 1 (line numbers, copy)                                                                                              | Muted line numbers outside the copied text, a calm 4-colour palette         | The icon-only copy button floating over the code (not universal, can cover a long line)             |
| Reference image 2 (file-name header, language)                                                                                      | A header with the file name and language                                    | The language label floating inside the code area                                                    |
| Reference image 3 (shadcn preview, "View Code")                                                                                     | Preview above, code below and collapsed, copy without opening               | The faded 3-line peek under an overlay button: faded code text fails 1.4.3 and the button covers it |
| [GOV.UK Design System](https://design-system.service.gov.uk/components/button/) examples                                            | Code under each example, all code visible without JavaScript                | Tabs for one view only (we have one language of code per example)                                   |
| [APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) · [APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | Disclosure for show/hide code (see §7 for why not Tabs)                     | –                                                                                                   |
| [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden)                                | Collapsed code is still found by the browser's find in page, which opens it | –                                                                                                   |

## 3. Flow

1. Reader reaches an example: the preview, then a **code bar**: `Code, 24 lines ▾` · `TSX` · `Copy code`.
2. **Copy without reading:** activates Copy code → text copied → visible "Code copied" with a check icon in the bar, polite announcement "Code copied". Focus stays on the button.
3. **Read first:** activates the Code button → the code opens below the bar, focus stays on the button; Tab moves to the scroll region (only if it overflows), then on.
4. **Find in page** (Ctrl+F) for a word in collapsed code → the browser opens it (`until-found`), the button's state follows.
5. **Change the example language** → only the preview changes; the code doesn't (it shows `t('…')`, docs-component-page.md §6).

**Unhappy paths**

| Case                                                          | What happens                                                                                                                                                                                                     |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clipboard refused (insecure context, permission, old browser) | The code opens if collapsed, its text is selected, the bar shows "Couldn't copy…" with a warning icon, and the same text is announced politely. Focus stays on Copy code, so Ctrl+C / Cmd+C copies the selection |
| Copy pressed again                                            | Copies again, re-announces (the Announcer repeats identical text), the status stays                                                                                                                              |
| JavaScript off or failed                                      | Code is open and plain (highlighting is server-rendered, so colours stay). The Code and Copy buttons are hidden (the existing `:root:not([data-kv-color-scheme])` rule in `docs.css`)                            |
| Unknown language, or the tokenizer meets text it can't read   | That text is plain `text` colour. The tokenizer never throws; highlighting is decoration                                                                                                                         |
| Empty code                                                    | Build fails for an example source (docs-site.md §3, "a section that can't be derived fails the build"). A hand-written empty `CodeBlock` shows `docs.code.empty`, with no Copy, toggle or region                 |
| Example throws                                                | Existing `docs.example.error` in the stage; the code bar and code still work                                                                                                                                     |

## 4. Content

Site copy is en (`apps/docs/messages/en.ts`); sv is given for the planned translation (docs-site.md Open question 7) and to size the layout. Language names are technical names and the same in both.

| Key                                               | en                                                                       | sv                                                                                 | Use                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `docs.code.label`                                 | Code                                                                     | Kod                                                                                | Scroll region name when there's no file name. Replaces `docs.example.codeHeading` |
| `docs.code.toggle({ count })`                     | Code, 1 line / Code, {count} lines                                       | Kod, 1 rad / Kod, {count} rader                                                    | The disclosure button's visible label (constant: state is `aria-expanded`)        |
| `docs.code.copy`                                  | Copy code                                                                | Kopiera koden                                                                      | Copy button label, never changes                                                  |
| `docs.code.copied`                                | Code copied                                                              | Koden är kopierad                                                                  | Visible status and the announcement (one string)                                  |
| `docs.code.copyFailed`                            | Couldn't copy. The code is selected, so press Ctrl+C, or Cmd+C on a Mac. | Det gick inte att kopiera. Koden är markerad, så tryck Ctrl+C, eller Cmd+C på Mac. | Visible status and the announcement                                               |
| `docs.code.empty`                                 | No code to show.                                                         | Det finns ingen kod att visa.                                                      | Empty state                                                                       |
| `docs.code.languages.{tsx,ts,json,css,bash,html}` | TSX, TypeScript, JSON, CSS, Bash, HTML                                   | same                                                                               | Language label                                                                    |

Longest fi-like length check: the sv `copyFailed` is the longest; it wraps under the buttons at 320px (§5). Code shown never includes a `$` prompt or line numbers in its text, so a paste runs.

## 5. Structure

**CodeBlock** (code only)

```
div.docs-code [data-language]                      surface, 1px border-subtle, radius md
  div.docs-code-header                             only if fileName, language or copy
    span.docs-code-file (mono)  span.docs-code-language   ……   Button "Copy code"
    p.docs-code-status (when present, wraps to its own row)
  div.docs-code-scroll  [role=region tabindex=0 aria-labelledby only while overflowing]
    pre > code > span.docs-code-line* > (span.docs-code-number[aria-hidden]) + tokens
```

**ExampleFrame** (keeps its name: every page already uses it)

```
figure (Card.Root, kv-card--dividers, aria-labelledby = section h2 or own h3)
  Card.Header   [h3 caption?]  ……  Example language (label + select, as today)
  Card.Body     nested KvirnProvider: Sámi note, stage
  div.docs-code-bar   Button "Code, 24 lines ▾" [aria-expanded aria-controls]  ·  TSX  ……  Button "Copy code"
                      p.docs-code-status
  div#…-code [hidden=until-found when collapsed]   CodeBlock without its own header
```

The bar sits **outside** the nested provider, so its strings, `lang` and announcement are the site's (en). One Copy per example: the bar's, never a second one in the panel.

| Width  | Layout                                                                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 320px  | Header/bar wrap: Code button and language on row 1, Copy code on row 2 at inline start, status on row 3. **Lines wrap** (§6). Comfortable 44px |
| 40rem+ | One row: toggle and language at inline start, Copy at inline end, status below. **Long lines scroll** horizontally                             |
| 64rem+ | As 40rem; buttons compact (32px), as the docs chrome                                                                                           |

DOM order = visual order = focus order: Code toggle → Copy code → (scroll region) → next content.

## 6. Visual specification

| Part                                   | Specification                                                                                                                                                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container                              | `surface` bg, 1px `border-subtle`, radius `md` (8px). In ExampleFrame: no own border/radius; the Card's `kv-card--dividers` hairline separates bar and code                                                             |
| Header / bar                           | `surface` bg, bottom 1px `border-subtle` (bar: only when open), padding `space-2` `space-3`, flex wrap, gap `space-2` `space-3`, items centred                                                                          |
| File name                              | `--kv-font-family-mono`, `code` role (14px), `text`. Long names `overflow-wrap: anywhere`                                                                                                                               |
| Language                               | `body-small` (14px), `text-muted` (metadata)                                                                                                                                                                            |
| Code toggle                            | `DocsDisclosure` (KvirnUI `Button`, secondary) with `chevron-down`/`chevron-up`, as Menu and Display settings                                                                                                           |
| Copy code                              | KvirnUI `Button`, secondary, text only (the built-in set has no copy icon; an icon would not be universal anyway)                                                                                                       |
| Status                                 | `body-small`, `text`, 16px icon (`aria-hidden`): `check` for copied, `warning` (in `warning` colour) for failed. Words carry the meaning. Copied clears after 4 s or on the next copy; failed stays until the next copy |
| Code area                              | padding `space-4`, `code` role: 14px, line height 1.6, `--kv-font-family-mono`, `tab-size: 2`. Native scrollbar, never hidden or thinned                                                                                |
| Line                                   | `display: grid; grid-template-columns: auto 1fr` when numbered. One row per source line                                                                                                                                 |
| Line number (optional, off by default) | `text-muted`, `font-variant-numeric: tabular-nums`, `text-align: end`, padding-inline-end `space-4`, `user-select: none`, `aria-hidden`. Sticky at inline start with `surface` bg while scrolling                       |
| Long lines, 40rem+                     | `white-space: pre`, the scroll div `overflow-x: auto`                                                                                                                                                                   |
| Long lines, < 40rem                    | `white-space: pre-wrap`, `overflow-wrap: anywhere`; a wrapped line hangs under its own text, its number stays on the first row                                                                                          |
| Focus ring                             | Buttons: the theme ring. Scroll region: `--kv-focus-ring-width` `focus-ring`, offset negated (`calc(-1 * var(--kv-focus-ring-offset))`) so it isn't clipped by the container                                            |

### Highlighter (docs-only)

A small tokenizer in `apps/docs` (no dependency), run on the server, emitting `<span class="docs-code-<role>">`. Plain text has no span. **Five roles, four colours,** each mapped to a semantic text token that `theme:check` already holds to 4.5:1 (standard) and 7:1 (contrast) on `surface` and `surface-raised` (`contrast-requirements.ts`, `textPairs`). No new colour pair.

| Docs token (`docs.css`, `--docs-code-*`) | Value                        | tsx / ts                                                             | json                           | css                                         | bash                               | html             |
| ---------------------------------------- | ---------------------------- | -------------------------------------------------------------------- | ------------------------------ | ------------------------------------------- | ---------------------------------- | ---------------- |
| `--docs-code-keyword`                    | `var(--kv-color-link)`       | reserved words (`import`, `const`, `return`, `type`…), JSX tag names | –                              | at-rules (`@layer`, `@media`), `!important` | the command (first word of a line) | tag names        |
| `--docs-code-string`                     | `var(--kv-color-success)`    | `'…'` `"…"` `` `…` ``                                                | values that are strings        | strings, `url()`                            | quoted strings                     | attribute values |
| `--docs-code-literal`                    | `var(--kv-color-warning)`    | numbers, `true` `false` `null` `undefined`                           | numbers, `true` `false` `null` | numbers with units, `#hex`                  | flags (`--save`, `-D`)             | –                |
| `--docs-code-comment`                    | `var(--kv-color-text-muted)` | `//` `/* */`                                                         | –                              | `/* */`                                     | `#` comments                       | `<!-- -->`       |
| (plain)                                  | `var(--kv-color-text)`       | everything else: names, punctuation, JSON keys, CSS properties       |                                |                                             |                                    |                  |

- **Not colour alone (1.4.1):** the colours add nothing the text doesn't say. A comment starts with `//`, a string has quotes, so the code reads the same in forced colours, greyscale or a screen reader. No weight or italic changes (Plex is upright only; mono widths must not shift).
- **Measured pairs** (theme:check floors; numbers from docs-site.md §6 where already recorded): `text` on `surface` 17.75 / 17.90 / 19.57 / 19.05; `text-muted` 5.79 / 5.86 / 11.27 / 13.04; `link` 4.94 / 6.64 / 9.21 / 10.17. `success` and `warning` on `surface`: gated by the same floors, **numbers to record from `vp run theme:check`** (orchestrator).
- Selection uses the browser's own `::selection`.

### States

| Part        | default                 | hover  | focus-visible      | active / open                                                                           | copied / failed                                  | long line                                          | empty                                                 |
| ----------- | ----------------------- | ------ | ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------- |
| Code toggle | collapsed, chevron down | recipe | ring               | open: `aria-expanded=true`, chevron up, `primary-subtle` bg, `primary` border (as Menu) | –                                                | –                                                  | not rendered                                          |
| Copy code   | secondary button        | recipe | ring               | recipe                                                                                  | label unchanged; status row shows                | –                                                  | not rendered                                          |
| Status      | absent                  | –      | –                  | –                                                                                       | `check` + "Code copied" / `warning` + copyFailed | –                                                  | –                                                     |
| Scroll area | plain div               | –      | ring (region only) | –                                                                                       | failed: code text selected                       | 40rem+: region, Tab stop, scrollbar; <40rem: wraps | `docs.code.empty` in `text` (a message, not metadata) |
| Line number | `text-muted`            | –      | –                  | –                                                                                       | –                                                | sticky                                             | –                                                     |

### Modes

- **Four themes:** tokens only; no theme rules.
- **Forced colours:** code text, numbers and status become `CanvasText`; the container, bar and buttons keep 1px borders; the open toggle keeps its chevron and `aria-expanded`; the status keeps its words and icon. `forced-color-adjust` is never set.
- **Reduced motion:** nothing moves; the open/close is instant. Chevron rotation only under `no-preference` (none here: the icon swaps).
- **RTL:** logical properties throughout (`inset-inline-start`, `padding-inline-end`). Code itself is always `dir="ltr"` with `unicode-bidi: isolate` on `pre`, so an RTL page doesn't reorder code; the bar follows the site's direction.
- **320px / 400% zoom / 1.4.12:** lines wrap, bar wraps, no fixed heights; under 1.4.12 overrides number and line stay in one grid row, so they never drift.

### New or changed tokens

None in `theme.css` or `DESIGN.md`. Four docs-only custom properties in `apps/docs/app/docs.css` (`--docs-code-keyword|string|literal|comment`), each an alias of an existing semantic text token (table above). They follow the `--docs-*` layout-constant precedent (docs-site.md §6) and add no raw colour, so the raw-colour check stays green. **Maintainer approval needed** (D3).

## 7. Accessibility annotations (draft contract)

**Pattern choice: Disclosure, not Tabs, not a toggle button.**

- Tabs say "pick one of several mutually exclusive views". Preview and code are two parts of one example that people want together (look, then read). Tabs would hide the preview while reading the code, add an arrow-key model for two items, and a Tab-stop rule readers don't expect in a page.
- A toggle button (`aria-pressed`) is for an on/off setting; showing and hiding a region is APG Disclosure (`aria-expanded` + `aria-controls`).
- Tabs are right later for real alternatives (pnpm / npm / yarn, or `tsx` / `css` files of one example): KvirnUI `Tabs` then (Open question 3).

| Element       | Role / name                                                                                                                          | State                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| Example       | `figure`, named by the section h2 or its own h3 (as today)                                                                           | –                                        |
| Code toggle   | native `button`, name = visible `docs.code.toggle` ("Code, 24 lines")                                                                | `aria-expanded`, `aria-controls` → panel |
| Copy code     | native `button`, name = visible "Copy code" (2.5.3). Context comes from the figure or file name around it                            | –                                        |
| Scroll region | `role=region`, `aria-labelledby` the file name, else `aria-label` `docs.code.label`; only while overflowing (accessibility skill §8) | `tabindex=0` only while overflowing      |
| Code          | `pre > code`, `lang` not set (code isn't a human language), `dir=ltr`                                                                | –                                        |
| Line numbers  | `aria-hidden="true"`, excluded from selection and from the copied text                                                               | –                                        |
| Status        | plain `p` (not a live region); the Announcer speaks                                                                                  | –                                        |

**Keyboard** (native elements only; no custom key handlers)

| Key                | Where               | What happens                                                                            |
| ------------------ | ------------------- | --------------------------------------------------------------------------------------- |
| Tab / Shift+Tab    | example             | Language select → Code toggle → Copy code → scroll region (only if it overflows) → next |
| Enter, Space       | Code toggle         | Opens or closes the code. Focus stays on the toggle                                     |
| Enter, Space       | Copy code           | Copies; focus stays; status shown and announced                                         |
| Arrow Left / Right | scroll region       | Scrolls horizontally (native)                                                           |
| Home / End         | scroll region       | Native scroll to start or end                                                           |
| Ctrl+C / Cmd+C     | after a failed copy | Copies the selected code (native)                                                       |

- **Focus moves:** none. Opening, closing, copying and failing all keep focus on the control. Closing while focus is in the region can't happen (focus is on the toggle to close). Nothing is obscured (2.4.11): no sticky parts except the line-number gutter inside the region.
- **Announcements (4.1.3):** through `useAnnouncer()` of the site's provider, **polite**: `docs.code.copied` or `docs.code.copyFailed`. Opening or closing announces nothing (`aria-expanded` does). Changing the example language announces nothing (as today).
- **Find in page:** the collapsed panel is `hidden="until-found"`; on `beforematch` the toggle sets open so `aria-expanded` matches. Browsers without it: plain `hidden`.
- **Targets:** 44px below 64rem, 32px from 64rem (docs chrome rule, 2.5.8).
- **SCs of note:** 1.3.1, 1.3.2, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 1.4.12, 2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.5.3, 2.5.8, 3.2.2, 4.1.2, 4.1.3.
- **Test rows** (cheapest layer, `testing` skill): toggle `aria-expanded` + Enter/Space; copy announces `copied`; refused clipboard announces `copyFailed` and selects the code; region role/tabindex only when overflowing; line numbers absent from the copied text and `aria-hidden`; tokenizer unit tests per language (node), including "never throws". axe on a docs page in four themes when the docs harness exists (docs-site.md Open question 6).

## 8. Validation

- [x] Self-review against `review-checklist.md`: no blockers open. Faded "peek" rejected (1.4.3); icon-only copy rejected; colour-only cues none; no new colour pair.
- [ ] `vp run theme:check` numbers for `success` and `warning` on `surface` recorded (orchestrator).
- [x] Usability test plan written. **Status: `pending`.** No sessions have taken place.

**Usability test plan.** 6 participants as docs-site.md §8: NVDA + Firefox at 200%, VoiceOver iOS, a Windows Contrast Themes user, a voice-control user, a 320px phone user, a second-language reader. Tasks: (1) Copy the code for "Disabled with a reason" and paste it into a file. (2) Find which line sets `aria-describedby`. (3) Use find in page for `useField` on the Field page. (4) With the clipboard blocked, copy the code anyway. Measure: completion, wrong turns, whether the collapsed code was found unprompted, whether the announcement was heard once (not twice).

## 9. Decisions for the maintainer and open questions

**Decisions (approval needed):**

- **D1. Code collapsed by default** behind a Disclosure, Copy available while collapsed. This reverses docs-site.md "no tabs for code, code always visible". Why: page length at 320px, and copy, the main task, is one action either way. Mitigations: line count in the label, find in page opens it, no-JS shows it. Alternative: open by default on the page's main Example, collapsed on use cases (two rules).
- **D2. Long lines scroll horizontally from 40rem, wrap below.** Amends docs-site.md "No 2D scrolling". Why: line structure is meaning in code; 320px still reflows (1.4.10). Alternative: always wrap (today).
- **D3. Syntax roles reuse status and link tokens:** keyword = `link`, string = `success`, literal = `warning`, comment = `text-muted`, via four `--docs-code-*` aliases. Gated already, no new pair, no hue names. The cost: `success`/`warning` carry no status meaning here, and `link` colours non-links. Alternative: new docs tokens on the `accent` scale per theme, which need new measured pairs and four theme mappings.

**Open questions:**

1. The example language select: the brief says "Swedish/English". Today it offers all six locales. Recommendation: keep six (Finnish and Sámi break layouts first); confirm.
2. A `copy` icon in the built-in Icon set (a `packages/react` change, icon.md) or text-only Copy (recommended now).
3. Package-manager tabs (reference image 3) for install commands: out of scope; KvirnUI `Tabs` when wanted.
4. When G7's library `CopyButton` ships, the docs swap to it and its `@kvirn-ui/i18n` keys; `docs.code.copy*` then retire.
5. One-line blocks (image 3, "Usage"): same header rule (a bar with only Copy), or Copy inline at the line's end? Recommendation: same rule (fewer ceremonies).

## 10. Handoff: text for the plan's Design section

> Spec: [docs/design/docs-code.md](../design/docs-code.md). `CodeBlock` (code only: optional file name, language, line numbers; Copy code with a polite announcement and a select-on-failure fallback; horizontal scroll region from 40rem, wrap below) and `ExampleFrame` (preview, then a code bar with a Disclosure "Code, n lines" and Copy code; panel `hidden="until-found"`). A server-side tokenizer in `apps/docs` for tsx/ts, json, css, bash and html emits four role classes aliased to `link`, `success`, `warning` and `text-muted`. Keys `docs.code.*`; `docs.example.codeHeading` retires. Needs D1–D3 approved. No `packages/` or `theme.css` change.
