# Design spec: ReadAloud player and selection trigger

- **Status:** Draft · **Designer:** ux-designer agent · **Date:** 2026-10-07
- **Plan:** [0088](../plans/0088-read-aloud.md) (T1) · **Type:** component default styling and copy. No new token, no new colour pair

## 1. Brief

- **Users:** residents reading a municipality article or decision. **Hardest case:** a resident with dyslexia or low literacy, reading in their second language on a 320px phone, who has never used a read-aloud tool; second, a screen-magnifier user at 400% who sees only part of the player.
- **Job:** "When a page is long or hard, I want to hear it while I follow the words, so I understand it without asking someone."
- **Context:** used once per visit, often on a phone, while also reading. Must not fight a screen reader (plan, Non-goals).
- **Success:** the user starts, pauses and stops reading without help, and can say which sentence is being read. **Evidence:** none. Assumptions are marked (A) and become research questions in §8.

## 2. Prior art

| Source                                   | Reused                                                        | Changed, and why                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ReadSpeaker webReader (plan inspiration) | "Listen" at the top of the content; sentence highlight        | No collapsed icon bar, no floating player: every control is a worded button in the flow (L2 and cognitive users) |
| APG media controls, `copy-button.md` §2  | Play's name is the action; status as visible text, not live   | Play keeps one width for all its labels, so a second press never lands on Previous (§6)                          |
| `stepper.md`, pagination narrow row      | "Sentence 3 of 12" as plain text with tabular figures         | –                                                                                                                |
| Navigation current item, Toggle pressed  | A solid `primary` fill with `on-primary` text means "current" | Applied to the sentence being read (§6, highlight)                                                               |

## 3. Flow

1. The resident lands on the article. The player sits under the `h1` (§5). Nothing plays (no auto-play).
2. Presses **Listen**. Reading starts at sentence 1; the sentence is highlighted; Status shows "Sentence 1 of 12"; the button says **Pause**.
3. Presses **Pause**. Speech stops; the highlight stays on the sentence; Status keeps the position; the button says **Listen**. Listen restarts that sentence (D4).
4. **Previous / Next sentence** move one sentence and keep playing or paused. **Stop** clears the highlight and Status, back to idle at sentence 1.
5. The end of the content: back to idle, silently. Focus never moves.
6. **Selection:** the resident selects text. Play becomes **Listen to selected text**; with a mouse or touch a floating button with the same words appears by the selection (§6). Either reads only the selection.

**Unhappy paths**

| Case                                | What the user sees                                                                                               | Announced (polite)                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Browser can't speak (`unsupported`) | Only the group and the Status message. Buttons and selects are not rendered (see Q3)                             | No (shown on load, not user-initiated) |
| No voice for the content language   | Status: `noVoice`. Play stays enabled (voices can arrive late), Voice select is `disabled` when it has no option | Yes, on the Play press                 |
| Speech error mid-text               | Back to paused at that sentence; Status: `speechError`                                                           | Yes                                    |
| User scrolls away while playing     | Scroll-follow stops until the user next presses Listen, Previous or Next (§6, motion)                            | No                                     |
| Route change, tab closed            | Speech is cancelled (plan); nothing is shown                                                                     | No                                     |
| Selection collapses or Escape       | The floating button goes; Play's name returns to Listen                                                          | No                                     |

## 4. Content

Every string is in `readAloud`, in all six locales. Proposed changes in **bold**; the plan's wording otherwise. `fi` is the length check (A: machine draft, Q2 in the plan).

| Key                  | en                                                                                            | sv                                                                                                   | Note                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `label`              | Listen to this text                                                                           | Lyssna på texten                                                                                     | Group name, not visible                                                                      |
| `play`               | Listen                                                                                        | Lyssna                                                                                               |                                                                                              |
| `playSelection`      | **Listen to selected text**                                                                   | **Lyssna på markerad text**                                                                          | "Selection" is jargon for L2 readers. Also the floating button's text                        |
| `pause`              | Pause                                                                                         | Pausa                                                                                                |                                                                                              |
| `previous` / `next`  | Previous sentence / Next sentence                                                             | Föregående mening / Nästa mening                                                                     | fi "Edellinen virke" / "Seuraava virke"                                                      |
| `stop`               | Stop                                                                                          | Stoppa                                                                                               |                                                                                              |
| `rate` / `voice`     | Speed / Voice                                                                                 | Hastighet / Röst                                                                                     | Visible labels of the selects                                                                |
| `position`           | Sentence {current} of {total}                                                                 | Mening {current} av {total}                                                                          | Numbers through `useFormat`                                                                  |
| **`positionPaused`** | **Paused at sentence {current} of {total}**                                                   | **Pausad vid mening {current} av {total}**                                                           | New key: after Pause the button says "Listen", so Status says where it will continue         |
| `noVoice`            | **This device has no voice for {language}. You can add one in the device's speech settings.** | **Den här enheten har ingen röst för {language}. Du kan lägga till en i enhetens talinställningar.** | `{language}` from `Intl.DisplayNames` in the UI locale. Names the language and the next step |
| `speechError`        | The text could not be read aloud. **Try again.**                                              | Texten kunde inte läsas upp. **Försök igen.**                                                        | A next step                                                                                  |
| `unsupported`        | **This browser can't read text aloud.**                                                       | **Den här webbläsaren kan inte läsa upp text.**                                                      | "This", not "Your": no blame                                                                 |

- Rate options: `0.75×`, `1×` … `2×` via `useFormat` (sv `0,75×`). Default `1×` selected.
- Voice options: the OS voice name as given (not translated). Content `lang` decides the list.
- Longest strings: `noVoice` (sv 101 characters) wraps in Status at 320px; `playSelection` fi "Kuuntele valittu teksti" wraps inside its button.

## 5. Structure

**Where it sits.** Inside `main`, in the article, after the `h1` and its date line and before the lead. Outside `contentRef`, or skipped by it: Root sets `data-kv-read-aloud-skip` on itself so its own words are never read. Never sticky, never floating (DESIGN.md Layout, 2.4.11, 400% zoom). One player per `contentRef`.

```
main
  h1  Bygglov för altan
  p   Uppdaterad 3 oktober 2026
  div.kv-read-aloud  role=group "Lyssna på texten"   data-status data-source   ← Root
    button.kv-button.kv-read-aloud-button  Lyssna        data-playing           ← Play
    button …  ‹ Föregående mening                         aria-disabled (idle)   ← Previous
    button …  Nästa mening ›                              aria-disabled (idle)   ← Next
    button …  Stoppa                                      aria-disabled (idle)   ← Stop
    div.kv-field  label.kv-field-label Hastighet  select.kv-listbox-native.kv-read-aloud-select   ← Rate
    div.kv-field  label.kv-field-label Röst       select.kv-listbox-native.kv-read-aloud-select   ← Voice
    p.kv-read-aloud-status  Mening 3 av 12                                         ← Status
  div (contentRef)  p.lead … article text …
button.kv-button.kv-read-aloud-selection-trigger  popover=manual   (top layer, by the selection)
```

DOM order = visual order = Tab order. No `order`, no reversing.

| Width                       | Layout                                                                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320px (288px column)        | Buttons wrap by content, start-aligned: `Lyssna`, `‹ Föregående mening` / `Nästa mening ›`, `Stoppa`. Each select is its own row at full width, label above. Status is the last row |
| 40rem and up (45rem column) | Buttons on one row (en, sv; fi may wrap). Rate (auto width, `1×` fits) and Voice (auto, at most 100%) share the next row. Status the last row                                       |
| RTL                         | Logical properties only: Listen at the inline start (right). `chevron-back` / `chevron-forward` mirror (built-in `mirrorInRtl`). Status figures stay in reading order               |

Recommended composition for resident pages: Play, Previous, Next, Stop, Rate, Status. Voice is optional (most devices have one voice per language; see Q4).

## 6. Visual specification

Existing tokens only.

| Part                              | Specification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kv-read-aloud` (Root)            | `display: flex`, `flex-wrap: wrap`, `align-items: flex-end` (selects' boxes line up with the buttons), gap `--kv-space-2` inline, `--kv-space-3` block. No fill, edge or shadow: it is controls in the flow, not a surface. `margin-block: --kv-space-4` is the consumer's (layout is theirs)                                                                                                                                                                                                                                   |
| `kv-read-aloud-button`            | The secondary Button recipe unchanged (surface-raised, `secondary` edge, depth, ring, 44px comfortable / density sizes). Never primary: the page's primary action is not "Listen". Text always visible; icons only on Previous (`chevron-back`, start) and Next (`chevron-forward`, end), size 5, decorative                                                                                                                                                                                                                    |
| Play's width                      | Play never changes width with its label. Its labels (`play`, `playSelection`, `pause`) share one grid cell; the inactive ones are `visibility: hidden`, so they are out of the accessibility tree and the name stays the visible label (2.5.3). Without this, "Lyssna på markerad text" → "Pausa" shrinks and a second press lands on Previous. Markup change: see Q5                                                                                                                                                           |
| Idle Previous / Next / Stop       | `aria-disabled` with `data-disabled`: the Button's disabled look (dashed `border-control`, label readable). Still focusable (plan contract)                                                                                                                                                                                                                                                                                                                                                                                     |
| Rate, Voice                       | `kv-field` + `kv-field-label` + `kv-listbox-native` as they are (label type, `border-control` edge, chevron). `kv-read-aloud-select`: `inline-size: auto`, `max-inline-size: 100%` from `40rem`; full width below. Voice with no option: native `disabled` (dashed)                                                                                                                                                                                                                                                             |
| `kv-read-aloud-status`            | `flex-basis: 100%`, `body` role in `text` (never `text-muted`: errors are instructions), tabular figures (`numeric` tokens). `min-block-size: 1lh` so starting playback doesn't shift the article down. Errors: built-in `warning` icon, size 5, decorative, `text` colour, first line, `--kv-space-2` gap (the CopyButton status recipe)                                                                                                                                                                                       |
| `kv-read-aloud-selection-trigger` | A secondary `kv-button` in the top layer: Button recipe plus `--kv-shadow-popup` (Level 3; none in dark and contrast themes), 44px min height, wraps at most `20rem` (`--kv-popup-width-limit`) and the viewport less `--kv-space-2` each side. Placed by `computePlacement`: below the selection's last line, `--kv-space-2` away, its inline start at the selection's inline end (left in RTL), flipped above when there is no room. Never covers the selected text. Below, because phones put their own selection menu above |

### States

| `data-status` / source          | Play label (= name)     | Prev / Next / Stop | Status                         | Highlight         | Trigger         |
| ------------------------------- | ----------------------- | ------------------ | ------------------------------ | ----------------- | --------------- |
| idle                            | Listen                  | `aria-disabled`    | empty (1 line reserved)        | none              | –               |
| idle + selection                | Listen to selected text | `aria-disabled`    | empty                          | none              | shown (pointer) |
| playing                         | Pause, `data-playing`   | enabled            | `position`                     | current sentence  | hidden          |
| paused                          | Listen                  | enabled            | `positionPaused`               | stays on sentence | –               |
| error `noVoice` / `speechError` | Listen                  | as before          | message + `warning` icon       | none / stays      | –               |
| unsupported                     | not rendered            | not rendered       | `unsupported` + `warning` icon | none              | never           |

Hover, focus-visible, pressed and disabled are the Button's and the select's own states; nothing new.

### Current-sentence highlight `::highlight(kv-read-aloud)`

`::highlight()` takes only colour, background and decoration, so the look is one fill.

| Theme          | Look                                   | Fill vs surroundings (≥ 3:1, 1.4.11)                                | Text on fill (≥ 4.5:1 / 7:1) |
| -------------- | -------------------------------------- | ------------------------------------------------------------------- | ---------------------------- |
| light          | `primary` fill, `on-primary` text      | canvas 4.70, surface 4.42, primary-subtle 4.15                      | 4.70                         |
| dark           | the same tokens                        | canvas 4.44, surface 4.05, surface-raised 3.75, primary-subtle 3.32 | 4.70                         |
| light-contrast | the same tokens (`primary-800`, white) | canvas 9.89, surface 9.29                                           | 9.89                         |
| dark-contrast  | the same tokens (`primary-200`, black) | canvas 11.14, surface 10.17, surface-raised 9.40                    | 11.14                        |
| forced colours | `Highlight` fill, `HighlightText` text | system pair                                                         | system pair                  |

- Both pairs are already in `theme:check` (`primary` as a current marker on the surfaces; `on-primary` on `primary`). Measured here with the WCAG formula on palette values; `theme:check` stays the source.
- **Rejected:** a soft `primary-subtle` tint (calmer to read, A) is 1.13:1 on canvas in light and 1.34:1 in dark, so the sentence isn't told from its neighbours at low vision.
- `color: on-primary` recolours links in the sentence too, so a link never sits at ~1.2:1 on the fill. The link is still a link outside the highlight. Story check: a sentence with a link, in all four themes.
- Not measured: content inside an Alert (`*-subtle` backgrounds). Q6.
- **Selection overlap.** `::selection` paints above custom highlights, so a sentence inside a still-painted selection shows no highlight. Recommended: collapse the document selection when reading starts from it (the range is captured; focus doesn't move). In forced colours this also keeps `Highlight` from meaning two things. Q7.
- 1.4.1: the fill is a luminance change, not only hue, and Status shows the position in words.

### Modes

- **Forced colours:** buttons and selects keep their forced rules. Status `CanvasText`. Trigger `ButtonText` edge on `Canvas`, no shadow. Highlight as above (author system colours survive forcing; verify in the forced-colours story, manual `pending`).
- **Scroll-follow (motion):** only when the current sentence leaves the visible area (inside `scroll-padding`, so a sticky header never covers it), scroll so its first line sits a third down the viewport. `smooth` under `prefers-reduced-motion: no-preference`; **instant under `reduce`, not off**: off would lose a reduced-motion reader's place on every page turn. A jump is not animation. If the user scrolls during playback, follow stops until their next Listen, Previous or Next. Focus never moves. This changes the plan's "off under reduced motion": Q8.
- **Trigger and highlight:** appear and go instantly in every setting.
- **320px, 400%, 1.4.12:** no fixed widths or heights on text; buttons and Status wrap; selects full width below `40rem`.

## 7. Accessibility annotations

- **Tab stops, in order:** Play → Previous sentence → Next sentence → Stop → Speed → Voice. Status and the highlight are never focusable. Unsupported: none.
- **Keys** (`keyboard` skill, plan contract): Enter / Space on buttons (native); native `<select>` keys; Escape inside Root or on the trigger stops and dismisses, focus stays. No page-level shortcut.
- **Focus moves:** none, on any state change, at the end, or on error.
- **Names:** group `label`; buttons by visible text (the chevrons are `aria-hidden`); selects by their `<label for>`. Play's name follows its visible label (2.5.3).
- **Selection trigger (pointer only, why):** a keyboard user selecting with Shift+Arrows would lose the selection, or get a Tab stop in the top layer away from the text, if it took focus. The same action is Play, named "Listen to selected text" while a selection is captured, so nothing is keyboard-only lost. **Design recommendation for plan Q1:** a real `<button>` with its name, `tabindex="-1"`, its `pointerdown` default prevented so the selection and focus stay, **not** `aria-hidden` (a touch screen-reader user who finds it can use it; hiding an operable button is worse than a redundant one). The reviewer decides.
- **Announcements:** errors only, polite (plan D6). Status is not a live region.
- **SCs of note:** 1.4.1, 1.4.2, 1.4.10, 1.4.11, 1.4.12, 2.1.1, 2.2.2, 2.4.11, 2.5.3, 2.5.8 (44px comfortable, 24px compact minimum), 3.1.2, 4.1.2, 4.1.3.

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blocker. Text on every button; no colour-only cue; no new token or pair; no sticky or modal part.
- [ ] `theme:check` green after T7 (orchestrator).
- **Usability test plan** (`pending`; no sessions held). Participants: a resident with dyslexia, a second-language reader, a low-digital-confidence resident on a phone, a magnifier user at 400%, an NVDA user and a VoiceOver iOS user (to see that the player doesn't get in their way), a Windows contrast-theme user. Tasks: (1) Listen to the article and pause at the second heading. (2) Hear only the paragraph about fees (select it). (3) Slow the reading down. (4) On a device with no Swedish voice, find out why nothing plays. Measure: completion, whether they followed the highlight, mis-presses near Play, whether the error's next step was understood. **Research questions:** solid fill vs tint for reading comfort (A); do residents look for the player under the `h1`; do pointer users miss a player they scrolled past (Q9).

## 9. Open questions

1. Proposed copy changes in §4 (`playSelection`, `noVoice` with `{language}`, `speechError`, `unsupported`): approve?
2. New key `positionPaused`: approve, or keep `position` while paused?
3. Unsupported: controls not rendered (recommended: six dead controls are noise) vs the plan's "disabled, out of the Tab order".
4. Voice part: hide it when fewer than two voices exist, or leave it to the consumer?
5. Play's fixed width needs all three labels in the markup (two `visibility: hidden`): approve this headless markup change?
6. Highlight inside an Alert: measure `primary` on the four `-subtle` backgrounds (new pairs), or document "not measured"?
7. Collapse the user's selection when reading it starts (recommended), so the highlight is visible?
8. Scroll-follow instant under reduced motion (recommended) instead of off, and stop following after a manual scroll?
9. Long pages: a later plan for a pause control that stays in reach (not in v1: sticky bars fail at 400% zoom)?
10. Icons for Listen, Pause, Stop: none exist (24 built-ins, the last slot is held for `sort`). Text only in v1 (recommended); adding three needs the icon cap raised.
