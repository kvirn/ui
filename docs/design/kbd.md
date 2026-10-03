# Design spec: Kbd, the default look of a key (revision)

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-03
- **Plan:** [0024](../plans/0024-kbd.md) · **Related ADRs:** [ADR-0053](../adr/0053-kbd.md) (Proposed, decision 3 and its Consequences need amending, see §8), ADR-0026 (button depth), ADR-0013
- **Type:** component default styling (`kv-kbd` and prose `kbd`)
- **Revises:** the `kbd` row in [foundations-and-prose.md §6.3](foundations-and-prose.md) and ADR-0053 decision 3

## 1. Brief

- **Users:** residents reading keyboard help in guidance ("Du kan flytta mellan fälten i formuläret med Tab"), and staff reading shortcut help in tools.
- **Hardest-case user:** a resident with low vision at 200% text size, reading in their second language. They must see that "Tab" is the name of a key, not a word in the sentence, and must not mistake it for a button they can press on the screen.
- **Job:** when I read an instruction that names a key, I want to recognise the key at a glance, so I can find it on my keyboard and carry on with the form.
- **Trigger for this revision:** the maintainer found the current default look "a bit ugly". This spec turns that into concrete findings and a replacement.
- **Evidence:** none from users. The findings below come from screenshots of `Components/Kbd` (Storybook, 3× scale, all four themes and forced colours, captured into `/tmp`, not the repo) and from measured layout values.
- **Assumption:** a sans key label is at least as easy to recognise as a mono one. → Research question: in the test below, do participants identify the key names equally well in both looks?

## 2. Review of the current look (2026-10-03)

The current rule (`theme.css` §9b `kv-kbd`, and prose `kbd`): mono at `--kv-prose-code-size`, `surface-raised` fill, 1px `border-control` edge with a 2px bottom edge, `radius-sm`, `padding-inline: space-1`, `nowrap`.

Measured in `Components/Kbd › Default` (light, 16px body text, 24px line): the key box is 19px high and 35px wide, 4px from the top of the line. The `Combination` paragraph is **25px** high instead of 24px.

| Severity | Location                                                   | Finding                                                                                                                                                                                                                                                                                                                                                        | Rule                                                                                                                             | Who it affects                                                                     |
| -------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Major    | 2px bottom edge in `border-control`, `surface-raised` fill | This is button depth on something that isn't a button. On a white page the key is a white box with a mid-grey control edge and a heavy bottom, which is exactly how the secondary button reads. The thicker bottom also pulls the rounded corners into a lopsided "bucket" shape at 4px radius, and that is most of the "ugly".                                | DESIGN.md Button depth: "Depth means press me, so nothing else gets it". Don'ts: no button depth on anything that isn't a button | Low digital confidence users who click it. Everyone: visual weight in running text |
| Major    | Outer group `kbd` in a combination                         | The outer `kbd` is left completely unstyled, so it keeps the browser's `font-family: monospace`. That font's metrics push the line box from 24px to 25px, which breaks the vertical rhythm of the paragraph. The `+` between the keys is drawn in the system monospace, not in Plex.                                                                           | DESIGN.md Typography (one sans family for text). Line rhythm                                                                     | Everyone. Most visible in lists of shortcuts                                       |
| Minor    | Font family `--kv-font-family-mono`                        | `ui-monospace` resolves to a different face on each OS (SF Mono, Cascadia, DejaVu Sans Mono on Linux), and none of them matches Plex. The Linux screenshot shows wide, codey glyphs that look like inline code, not like a key. Physical keycaps are printed in sans, and DESIGN.md keeps mono for "reference numbers and code". `Shift` is 52px wide in mono. | DESIGN.md Typography: families                                                                                                   | Everyone. It also blurs `kbd` with `code`                                          |
| Minor    | Combination spacing                                        | `Ctrl`, `+` and `C` touch each other (`[Ctrl]+[C]`), so the plus is hard to see between two boxes. A grouped combination can also break across a line at its `+`.                                                                                                                                                                                              | –                                                                                                                                | Low vision, magnification                                                          |
| Minor    | Forced colours                                             | The edge is `border-control`, which forced colours maps to `ButtonBorder`, the colour for buttons. A key isn't a button. `kbd.a11y.md` and foundations §6.5 both say the edge is `CanvasText`, which is not what the CSS does.                                                                                                                                 | DESIGN.md: forced colours use the system colour for the role                                                                     | Windows contrast-theme users (low risk: ButtonBorder is usually the text colour)   |
| Minor    | Docs and ADR text                                          | `kbd.a11y.md` gives 1.4.11 as the reason for `border-control`. A key's edge isn't a UI component and isn't needed to understand the content (the key name is text), so 1.4.11 doesn't require 3:1. We keep `border-control` for a different reason (see §5), and the docs shouldn't claim a requirement that doesn't apply.                                    | Accuracy of claims (AGENTS.md hard rule 8 spirit)                                                                                | Adopters reading the contract                                                      |
| Minor    | Duplication                                                | The prose `kbd` and `kv-kbd` rules repeat the same 8 declarations, so they will drift apart (ADR-0053 Consequences already says so).                                                                                                                                                                                                                           | –                                                                                                                                | Maintainers                                                                        |
| Minor    | `kbd.stories.tsx › InProse`                                | `Shift+Tab` is written as two separate keys with a loose `+`, not as a group, so the story doesn't show the recommended markup. It's also allowed to break between `+` and `Tab` at 320px. Engineering change, out of this spec's write scope.                                                                                                                 | –                                                                                                                                | Adopters copying the example                                                       |
| Polish   | Vertical position                                          | The box (19px) nearly fills the 24px line and drops about 5px below the baseline, so it looks lower than the text around it. This comes from the mono font's metrics. With the inherited sans the box is 20px, is symmetric around the label, and its label sits on the sentence's baseline.                                                                   | –                                                                                                                                | –                                                                                  |

**Works well, keep it:**

- Native `<kbd>` with no role or ARIA, and key names that aren't translated, with `lang` set by the consumer.
- One key per element, with an outer element to group a combination.
- `nowrap` and `hyphens: manual`, so a key is never split or hyphenated.
- The relative `0.875em` size, so a key scales inside headings and with `kv-prose--large`.
- Zero specificity.
- Contrast is already fine in every theme: text is at least 17.9:1 and the edge at least 3.54:1.

## 3. Flow and content

A key is static text, so there's no flow, no state and no strings. Key names are content the consumer writes, and they aren't translated (ADR-0053 decision 4). No i18n keys are needed.

## 4. Structure

```
<p>… med <kbd class="kv-kbd" lang="en">Tab</kbd>.</p>                              one key
<p>… med <kbd class="kv-kbd"><kbd class="kv-kbd">Ctrl</kbd>+<kbd class="kv-kbd">C</kbd></kbd>.</p>   combination
```

The same applies to a bare `kbd` inside `kv-prose`.

## 5. Visual specification

**Direction:** a flat key that belongs to the same family as inline code. It uses the same size, fill, radius and padding as `code`, and two differences tell it apart: a sans label instead of mono, and a `border-control` edge instead of a hairline. There's no depth.

| Part                                     | Tokens                                                                                                                                                                                                                                                           | Notes                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Key (innermost `kv-kbd`, or prose `kbd`) | `font-family: inherit` (body sans), `font-size: var(--kv-prose-code-size)`, colour inherited (`text`), `background-color: var(--kv-color-surface)`, 1px `var(--kv-color-border-control)` on **all four sides**, `radius-sm`, `padding-inline: var(--kv-space-1)` | Flat (DESIGN.md: depth only for buttons). The `surface` fill is the same as inline code: a faint tint in light, and close to `canvas` in dark, where the edge carries the shape. `border-control` is kept even though 1.4.11 doesn't require it: at 200% and in forced colours, the edge is what tells a low-vision reader that "Tab" is a key and not a word. Measured box: 20 × 32px in the `Default` story |
| Group (outer `kv-kbd` holding keys)      | `font-family: inherit`, `white-space: nowrap`. No edge, fill or padding                                                                                                                                                                                          | Removes the browser's monospace, which restores the 24px line. The `+` is in Plex. A combination never wraps (Ctrl+Alt+Delete is about 170px, which fits at 320px)                                                                                                                                                                                                                                            |
| Key inside a group                       | `margin-inline-end: var(--kv-space-1)` on every key that has a later key, and `margin-inline-start: var(--kv-space-1)` on every key after the first                                                                                                              | 4px each side of the `+`, which is a Plex word space at 16px, so it reads "Ctrl + C". Logical properties, so it mirrors in RTL                                                                                                                                                                                                                                                                                |

**Weight:** inherited (400). 500 (the label weight) made the short labels look bold in the prototype for no gain.

**States:** static. No hover, focus or pointer style, because it isn't interactive.

### Modes

| Theme          | Text on `surface` | `border-control` on `surface` (inside the key) | `border-control` on `canvas` / `surface-raised` (outside the key) |
| -------------- | ----------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| Light          | 17.90:1           | 4.68:1                                         | 4.98:1 / 4.98:1                                                   |
| Dark           | 17.90:1           | 3.83:1                                         | 4.19:1 / 3.54:1                                                   |
| Light contrast | 19.61:1           | 10.21:1                                        | 10.86:1 / 10.86:1                                                 |
| Dark contrast  | 19.05:1           | 13.04:1                                        | 14.28:1 / 12.05:1                                                 |

- **About the numbers:** computed on 2026-10-03 from the palette hex values in `theme.css`, using the WCAG relative-luminance formula in a scratch script. They aren't `theme:check` output. These pairs are already covered by DESIGN.md's guarantees: `text` is at least 4.5:1 on `surface`, and `border-control` at least 3:1 on `canvas`, `surface` and `surface-raised`. There's no new pair, so `theme:check` needs no new requirement. The orchestrator should still run it after the change.
- **Forced colours:** the fill becomes Canvas. Add an override that sets the key's edge to `CanvasText` instead of `ButtonBorder`, because the key is text, not a button. The shape and edge carry the meaning, and colour doesn't. Never use `forced-color-adjust: none`.
- **RTL:** only logical properties are used. A key name in Latin script keeps its own direction (`lang="en"`). Combination order in RTL text is an open question.
- **Motion:** none.
- **Reflow, zoom and text spacing:**
  - There are no fixed sizes. The label inherits the paragraph's font at 0.875em, so its line-height box is always smaller than the line's, and the key never grows the line. Measured: 24px for `Default` and for `Combination` (was 25px).
  - At 320px, two lines that both hold keys keep a 4px gap between the boxes.
  - With the 1.4.12 overrides a key only gets wider, and `nowrap` keeps it whole.

### New or changed tokens

None.

## 6. CSS to apply (one shared rule, replaces both current rules)

This goes in `theme.css` §9b, inside `@layer kv`. **Delete** the prose block's `&:where(kbd):not(:where(:has(kbd)))` rule (around line 1313). The selector covers both a `kv-kbd` anywhere and a bare `kbd` in prose. A bare `kbd` inside `kv-not-prose` stays untouched, which keeps the not-prose contract.

```css
/* 9b. Kbd: one key. kv-kbd anywhere, or a bare kbd in prose (not inside kv-not-prose). A
 * flat key in the inline-code family: the body font, the code size, a surface fill and a
 * border-control edge. No depth, because depth means "press me" (DESIGN.md). An outer kbd that
 * groups keys only resets the browser's monospace and keeps the combination on one line. */
:where(.kv-kbd, .kv-prose kbd:not(.kv-not-prose kbd)):not(:where(:has(.kv-kbd, kbd))) {
  padding-inline: var(--kv-space-1);
  border: var(--kv-border-width) solid var(--kv-color-border-control);
  border-radius: var(--kv-radius-sm);
  background-color: var(--kv-color-surface);
  font-family: inherit;
  font-size: var(--kv-prose-code-size);
  white-space: nowrap;
  hyphens: manual;
}

:where(.kv-kbd, .kv-prose kbd:not(.kv-not-prose kbd)):where(:has(.kv-kbd, kbd)) {
  font-family: inherit;
  white-space: nowrap;
}

/* The gap around the + between keys: a word space. */
:where(.kv-kbd, .kv-prose kbd:not(.kv-not-prose kbd)):where(:has(.kv-kbd, kbd))
  > :where(.kv-kbd, kbd):where(:has(~ :is(.kv-kbd, kbd))) {
  margin-inline-end: var(--kv-space-1);
}

:where(.kv-kbd, .kv-prose kbd:not(.kv-not-prose kbd)):where(:has(.kv-kbd, kbd))
  > :where(.kv-kbd, kbd)
  ~ :where(.kv-kbd, kbd) {
  margin-inline-start: var(--kv-space-1);
}

@media (forced-colors: active) {
  :where(.kv-kbd, .kv-prose kbd:not(.kv-not-prose kbd)):not(:where(:has(.kv-kbd, kbd))) {
    border-color: CanvasText;
  }
}
```

### Unification: yes

There is now one rule, so a change goes in one place. Things to check during the change:

1. **Specificity stays zero.** Everything is inside `:where()`, including the complex `:not(.kv-not-prose kbd)`, which is Selectors 4 and is supported wherever `:has` is.
2. **Scope changes slightly, on purpose.** The prose arm doesn't repeat the full not-prose list (fields, nav, button groups) or the card boundary, so a bare `kbd` in a field hint or a non-prose card inside `kv-prose` now looks like a key. A key looks the same wherever it appears, and it adds no margins or block typography, so nothing leaks. That's the reason for the not-prose list. Only the explicit `kv-not-prose` opt-out is kept. A bare `kbd` in a `kv-card` without prose stays unstyled, as today: use `Kbd` there.
3. **The no-hyphen rule** at about line 1045 (`:where(.kv-prose, .kv-card) :where(code, kbd, samp, pre)`) can stay. `hyphens: manual` on the key is now in the shared rule too.
4. **Group rule:** the outer element is matched with `:has(.kv-kbd, kbd)`, so a key rendered as another element through `render` is still recognised.

### Engineering follow-ups (component-engineer, not this spec)

- `kbd.stories.tsx`:
  - `Default` asserts `borderBlockEndWidth` `2px`. It becomes `1px`, plus `fontFamily` equal to the paragraph's.
  - `Combination` asserts the outer element isn't `2px`. It becomes: the outer element has no border, its `fontFamily` is the paragraph's, and the paragraph is one line high (24px).
  - `InProse` should group `Shift+Tab` in an outer `Kbd`.
- `kbd.a11y.md` § visual: describe the new look. The edge maps to `CanvasText` in forced colours. Change the 1.4.11 wording to: "the edge is `border-control` (at least 3:1) so the key stays distinct at high zoom, though 1.4.11 doesn't require it."
- `kbd.md`: "drawn like inline code, in the body font, with a control-coloured edge".
- ADR-0053 (still Proposed): amend decision 3 and the Consequences (text in the hand-off).
- `theme.css` header comment for section 9b (line 70) if its wording changes.

## 7. Accessibility annotations

- **Role:** native `kbd`, no ARIA. It isn't focusable and handles no keys, so the contract keeps "This component has no focusable parts and handles no keys."
- **Name:** n/a. Screen readers read the key name as text. `lang` is the consumer's (3.1.2).
- **Distinguishable:** shape and edge, not colour (1.4.1). Text contrast is at least 17.9:1 (1.4.3). The edge is at least 3.54:1 but isn't a 1.4.11 requirement.
- **Reflow and text spacing:** 1.4.10 and 1.4.12, see §5 Modes.
- **No affordance confusion:** flat, no pointer cursor, no hover. It shouldn't look pressable on screen (3.2.4 spirit: consistent identification of controls).

## 8. Validation

- [x] Self-review against the review checklist: no blockers. Two Majors found, both fixed by §6.
- [x] Contrast computed. No new pair (§5). `vp run theme:check`: to be run by the orchestrator.
- [x] Prototype: the §6 rules were injected into the running Storybook (`/tmp` only, no repo change). Light, dark, dark contrast, forced colours and 320px were screenshotted and look right. The line height is unchanged (24px).
- [ ] Usability test: `pending`.

### Usability test plan (`pending`)

- **Participants:** 6. At least 1 screen magnifier user at 200% or more, 1 screen reader user, 2 with low digital confidence, 2 reading Swedish or Finnish as a second language.
- **Tasks:**
  1. Read "Du kan flytta mellan fälten i formuläret med Tab" and move to the next field.
  2. Read "Kopiera med Ctrl + C" and copy a reference number.
  3. Answer: "Is there anything on this page you can click?" with a key in view.
- **What we measure:** whether they identify the key correctly the first time, any attempt to click a key, and how sure they say they are (old look vs new look, in counterbalanced order).

## 9. Open questions

1. **Combination in RTL text.** Should a group get `dir="ltr"` so `Ctrl + C` keeps its order in Arabic or Hebrew text? That's the consumer's markup today. This needs a decision, and a note in `kbd.md` if yes.
2. **External prior art wasn't verified.** The SF.gov design system has a `kbd` component (design-system.sf.gov/components/kbd), but its page returned 503. Check whether GOV.UK, Designsystemet or Suomi.fi style `kbd` before this is approved.
3. **Mono or sans:** this spec picks sans (§2). If the maintainer prefers mono, keep everything else in §6 and set `font-family: var(--kv-font-family-mono)` on the key only. The depth and the group fix are the main part of the improvement either way.
