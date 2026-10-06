# Design spec: the visible result of CopyButton and CodeBlock.Copy

- **Status:** Accepted (maintainer, 2026-10-06) · **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** Plan 0060 · **Type:** component default styling (amends the DESIGN.md "Code block and copy button" subsection, under maintainer review)

## 1. Brief

- **Users:** both. **Hardest cases:** a resident on P8 (municipality-reference-site.md) on a 320px phone at 200% text, copying a case or OCR number under stress; a screen-magnifier user whose viewport shows only the button; a voice-control user who says "click Copy" twice; an integrator copying a code sample.
- **Job:** "When I've been given a number or a snippet, I want to copy it and _see_ that it worked, so I can paste it elsewhere without retyping or doubting."
- **Today:** the result is announced (polite / assertive) and exposed as `data-status`, but nothing is drawn. A sighted user gets no feedback, and on failure no visible instruction.
- **Success:** a sighted user can say whether the copy worked without pasting; after a refusal the user copies by hand. **Evidence:** none. Assumption: users re-press or paste-test when no cue shows → Research question in §8.

## 2. The 2.5.3 decision

| Option                                                          | Result                                                                                                                                                                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Visible label becomes "Copied", `aria-label` stays "Copy"    | **Fails 2.5.3:** the visible text "Copied" is not in the name "Copy" ("Kopierat" / "Kopiera", "Kopioitu" / "Kopioi"). "Click Copied" does nothing for a voice user                                              |
| B. Label and name both become "Copied" for 5 s                  | Passes 2.5.3 but breaks the contract (name never changes, 4.1.2 stability); "click Copy" fails for 5 s; the button changes width under the pointer; screen readers may re-read the name on focus                |
| C. Icon swap inside the button (decorative, `aria-hidden`)      | Name unchanged, but a check mark alone is a symbol, not words (cognitive and second-language users); the built-in set has no `copy` icon to swap from                                                           |
| **D. Label never changes; a status text sits after the button** | **Chosen.** Name = visible label at all times (2.5.3). The status is words plus a decorative icon (1.4.1). The button keeps its width, so nothing moves under the pointer. Same as docs-code.md §6 (status row) |

## 3. States and content

No new i18n key: the visible status reuses the announced string, so what is seen is what is heard.

| `data-status` | Button (name = visible)                              | Status text (`kv-copy-status`)                                                                                                                       | Icon (`aria-hidden`) | Shown until                                          |
| ------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------- |
| `idle`        | `copyButton.label` "Copy" / "Kopiera", or `children` | not rendered                                                                                                                                         | –                    | –                                                    |
| `copied`      | unchanged                                            | `copyButton.copied`: "Copied" / "Kopierat" / fi "Kopioitu"                                                                                           | `check`              | 5 s, or the next activation (re-shown at once)       |
| `failed`      | unchanged                                            | `copyButton.failed`: "Could not copy. Select the text and copy it yourself." / sv "Det gick inte att kopiera. Markera texten och kopiera den själv." | `warning`            | **The next activation.** Never timed out (see below) |
| disabled      | Button's disabled look                               | not rendered (a status from before disabling is removed)                                                                                             | –                    | –                                                    |

- **Why failed persists:** it is an instruction the user follows _after_ reading it (selecting, Ctrl+C, a long-press on a phone). At 5 s a magnifier, low-vision or slow reader loses it mid-task (3.3.1, and the spirit of 2.2.1). **Engineering change:** the hook's 5 s reset applies to `copied` only; `failed` stays until the next activation. Contract rows in both `.a11y.md` files change.
- **Why copied may time out:** it confirms, it doesn't instruct; it was also announced; pressing again copies, re-shows and re-announces, so nothing is lost (no trap).
- **Length:** the sv `failed` (64 characters) is the longest; fi is 56, en 53. It wraps under the button at 320px (§4).

## 4. Structure and placement

DOM order = visual order = reading order: button, then status. The status is never inside the button (it would join the name).

**Standalone** (P8 reference number):

```
p        Ditt ärendenummer är <span class="kv-numeric">PK-2026-004217</span>.     ← textRef
div      [button.kv-button "Kopiera ärendenumret"] [span.kv-copy-status ✓ Kopierat]
```

**CodeBlock:** `kv-code-block` (Label, Code, Copy, Status)

```
p.kv-code-block-label      Install
pre.kv-code-block-code     pnpm add @kvirn-ui/react
[button.kv-button.kv-code-block-copy "Copy"]  [span.kv-copy-status ✓ Copied]
```

| Width        | Layout                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320px        | "Copied" fits beside the button. The failure text doesn't, so its whole box moves to the next row at the inline start and wraps there (never a narrow column beside the button) |
| 40rem, 64rem | One row: button, `--kv-space-2` gap, status. The failure text wraps within the measure                                                                                          |

**API shape (for the plan; see Q1):** `CopyButton` renders the button followed by the status `span` as a sibling (a fragment). `render`, `ref` and `className` stay on the button. `CodeBlock.Copy` inherits it, so CodeBlock gets no new part.

## 5. Visual specification

| Part                       | Specification (existing tokens only)                                                                                                                                                                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kv-copy-status`           | `display: inline-flex`, `align-items: flex-start`, gap `--kv-space-2`, `vertical-align: middle`, `margin-inline-start: --kv-space-2` (0 inside the CodeBlock row, which uses `gap`). `body` role (16px, not `body-small`: the failure is an instruction), `text` colour. `max-inline-size: 100%`, `overflow-wrap: anywhere` |
| Icon                       | Built-in `check` / `warning`, size step 5 (1.25em), `currentColor` (= `text`), on the first line. Check marks and status icons never mirror                                                                                                                                                                                 |
| `.kv-code-block` (changed) | The column becomes `flex-flow: row wrap` with `align-items: center`; Label and Code get `flex-basis: 100%`, so Copy and Status share the last row. Gap `--kv-space-2` unchanged                                                                                                                                             |
| Button                     | Unchanged: the Button recipe (depth, ring, 44px resident / density sizes). No colour, fill or width change with the status                                                                                                                                                                                                  |

- **Colour is never the cue:** the status is words; the icon adds shape. Icons stay `text` because `success`/`warning` are not measured on every background a CopyButton can sit on (e.g. `warning` on `success-subtle`, inside Alert.Success on P8). See Q3.
- **Four themes:** tokens only, no theme rule. **Forced colours:** words and icon are `CanvasText` (the icon takes its parent's system colour, DESIGN.md Icons); no border needed (it is text, not a surface); `forced-color-adjust` is never set.
- **RTL:** logical properties; the status sits at the inline end (left). The reference number itself is the consumer's (`dir="ltr"` on a Latin number in an RTL page).
- **Motion:** none. The status appears and goes instantly under every preference (feedback must be immediate; nothing to reduce).
- **320px / 400% zoom / 1.4.12:** no fixed widths or heights; the row wraps; the button never shrinks below its label.

**New or changed tokens:** none. **New class:** `kv-copy-status` (a class-contract addition in DESIGN.md Theming; maintainer approval with the subsection). **New pairs:** none (`text` on `canvas`, `surface`, `surface-raised` and the four alert backgrounds is measured).

## 6. Accessibility annotations

- **Name:** the button's visible label, always (2.5.3); never changed by the result (4.1.2). Many buttons on a page: `children` names what is copied ("Copy reference number").
- **Status element:** a plain `span`, **not** a live region and not `aria-describedby` on the button: the Announcer already speaks, and a second region would double the message. It stays in the accessibility tree (browse mode reads the same words a sighted user sees, 1.3.1). `data-status` mirrors the button's.
- **Announcements:** unchanged: `copyButton.copied` polite, `copyButton.failed` assertive.
- **Tab stops:** one, the button. The status is never focusable. **Focus moves:** none, after copy, failure or selection.
- **Keys:** native Enter and Space (unchanged contract rows).
- **Test rows to add** (cheapest layer): the status shows `copied` text after a copy and is gone after 5 s; the `failed` text stays past 5 s and is replaced on the next activation; the button's name is identical in all three states; the status is outside the button and has no `aria-live`/`role`.
- **SCs of note:** 1.3.1, 1.4.1, 1.4.10, 1.4.12, 2.5.3, 3.3.1, 4.1.2, 4.1.3.

## 7. Prior art

| Source                          | Reused                                       | Changed, and why                                                          |
| ------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| docs-code.md §6 (status row)    | Status text beside Copy, `check` / `warning` | Failed persists here; the library strings replace `docs.code.*` (its Q4)  |
| GitHub copy buttons (icon swap) | Instant, local confirmation                  | Not an icon-only swap: words carry the meaning for cognitive and L2 users |

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blocker. 2.5.3 kept (§2); no colour-only cue; status is 16px `text`; no new pair.
- [ ] Contract and DESIGN.md subsection updated by the plan (orchestrator).
- **Usability test plan** (`pending`; no sessions held). Participants: a resident with low digital confidence on a phone, a magnifier user at 400%, an NVDA user, a voice-control user, a second-language reader, a Windows Contrast Themes user. Tasks: (1) Copy your case number and paste it into a message. (2) With the clipboard blocked, copy it anyway. (3) Copy the install command from a CodeBlock. Measure: completion; whether the user noticed "Copied" without prompting; paste-tests or repeated presses (a sign of doubt); whether the failure text was read and followed.

## 9. Open questions

1. **API: sibling or part?** (a) `CopyButton` renders the status span after the button (recommended: one import, the cue works with no extra markup; `CodeBlock.Copy` inherits it), with `status={false}` to draw your own; (b) separate `CopyButton.Status` / `CodeBlock.Status` parts the consumer places (more headless, but every adopter must remember it). Plan decides.
2. **Failed persists until the next activation** (recommended, §3) vs the current 5 s reset. A contract change: approve?
3. **Tint the icons** `success` / `warning`? Recommended no: needs `success`/`warning` on every alert background measured (`theme:check`, new pairs).
4. **Failure copy when the text is already selected:** keep one string (recommended; correct with or without `textRef`, and on phones where Ctrl+C means nothing) vs a second "The text is selected" variant.
5. **Copied lifetime:** 5 s (recommended, the hook's value) vs until the button loses focus. Revisit if testing (§8) shows magnifier users miss it.
