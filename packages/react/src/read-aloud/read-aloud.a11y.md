# Accessibility contract: ReadAloud

- **APG pattern:** none for the group. Buttons follow [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), the media-button naming practice for Play and Pause.
- **Deviations:** none from the APG. Previous, Next and Stop stay focusable and `aria-disabled` while idle (`focusableWhenDisabled`, as CopyButton) so the keyboard path doesn't jump.
- **Native elements used:** `<button type="button">`, `<select>` with a `<label>`, a plain `<span>` for the status.
- **Status:** in-planning. **Blocked: waiting for an npm package update and a re-test.** (Plan 0088, T5a.) Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `read-aloud.test.tsx` next to this file (a fake engine, nothing speaks).

ReadAloud reads a region of the page aloud for people who benefit from hearing it. It is not a screen reader substitute and never starts by itself.

## Roles, states, properties

| Part             | Element / role          | ARIA                                                     | Notes                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | ----------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root             | `<div>` → `group`       | `aria-label` = `readAloud.label`                         | `data-status` (`idle`, `playing`, `paused`, `unsupported`), `data-source` (`content`, `selection`), `data-kv-read-aloud-skip` (its own words are never read)                                                                                                                                                                                                         |
| Play             | `<button>` → `button`   | none                                                     | `data-playing` while reading. Pressing it while paused starts the sentence again                                                                                                                                                                                                                                                                                     |
| Previous         | `<button>`              | `aria-disabled="true"` while idle                        | Focusable, activation blocked                                                                                                                                                                                                                                                                                                                                        |
| Next             | `<button>`              | `aria-disabled="true"` while idle                        | As Previous                                                                                                                                                                                                                                                                                                                                                          |
| Stop             | `<button>`              | `aria-disabled="true"` while idle                        | As Previous                                                                                                                                                                                                                                                                                                                                                          |
| Rate             | `<select>` → `combobox` | visible `<label>`                                        | Options `0.75×` … `2×`, formatted with the provider locale                                                                                                                                                                                                                                                                                                           |
| Voice            | `<select>` → `combobox` | visible `<label>`                                        | Only voices for the content language. Not rendered with fewer than two                                                                                                                                                                                                                                                                                               |
| SelectionTrigger | `<button>` → `button`   | `popover="manual"`, `tabindex="-1"`, not `aria-hidden`   | Pointer-only convenience (plan Q1 stays open: the reviewer decides). Name and text `readAloud.playSelection`. Shown below the end of a selection finished with a pointer; never after a keyboard selection. Never takes focus: `pointerdown` is prevented, so the selection survives. Dismissed on collapse, any key (Escape included), scroll, resize, Stop and use |
| Status           | `<span>`                | `role="status"` with `aria-live="off"`: findable, silent | `Sentence {current} of {total}` while reading, or `noVoice`, `speechError` or `unsupported`. `data-error` carries the cause                                                                                                                                                                                                                                          |

### Read aloud

| State or action              | Expected phrase(s) as read aloud                                                                                                                                     | Live region politeness | Test                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Idle, read top to bottom     | `group, Listen to this text` → `button, Listen` → `button, Previous sentence, disabled` → `button, Next sentence, disabled` → `button, Stop, disabled` → the content | none                   | `read-aloud.test.tsx › read aloud › idle reading order: the group, Listen, the three disabled buttons, then the content` |
| Play pressed, then paused    | `button, Listen` → `button, Pause` + `Sentence 1 of 2` → `button, Listen` + `Paused at sentence 1 of 2`                                                              | none                   | `read-aloud.test.tsx › read aloud › the Play name reads Listen, then Pause, then Listen after pause`                     |
| A selection is captured      | `button, Listen to selected text`                                                                                                                                    | none                   | `read-aloud.test.tsx › read aloud › the Play name reads Listen to selected text while a selection is captured`           |
| No voice for the language    | `polite: This device has no voice for English. You can add one in the device’s speech settings.` (on every press)                                                    | polite                 | `read-aloud.test.tsx › read aloud › no voice is announced politely with the language and the next step`                  |
| The speech engine fails      | `polite: The text could not be read aloud. Try again.`                                                                                                               | polite                 | `read-aloud.test.tsx › read aloud › a speech error is announced politely`                                                |
| Play, pause, next, stop, end | nothing                                                                                                                                                              | none                   | `read-aloud.test.tsx › read aloud › play, pause and stop announce nothing`                                               |
| Browser without speech       | `This browser can’t read text aloud.` as Status text only                                                                                                            | none                   | `read-aloud.test.tsx › errors and announcements › an unsupported browser shows only the group and the status text`       |

Other texts: Speed and Voice labels (`readAloud.rate`, `readAloud.voice`), the speed options (`readAloud.rateOption`, `1.5×`).

The phrases are the virtual screen reader's approximation, not NVDA or JAWS wording.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1, 4.1.2). `as` is a string, so it works from a Server Component.

| Part                                                            | `as`                         | Why                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status                                                          | `span` (default), `p`, `div` | Visible text of the position or the reason nothing is read, with `role="status"` and `aria-live="off"` kept. A value outside the list is a type error and, in JS, warns once (`as-not-allowed:ReadAloud.Status:<tag>`) and renders the default element. |
| Root, Play, Previous, Next, Stop, Rate, Voice, SelectionTrigger | none                         | A `role="group"` `<div>`, native `<button>`s and `<select>`s: no other element keeps the keyboard and name contract (4.1.2)                                                                                                                             |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Native controls in DOM order, no `tabindex`. Disabled controls stay in the Tab order (`aria-disabled`) while idle. With no speech support only the group and the status exist, so nothing is focusable.

| Key               | Context                    | Action                                                      | Test                                                                                                  |
| ----------------- | -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Tab               | Player                     | Moves through Play, Previous, Next, Stop, Speed (and Voice) | `read-aloud.test.tsx › keyboard › Tab moves through Play, Previous, Next, Stop and Speed`             |
| Tab               | Player, two voices         | Reaches the Voice select                                    | `read-aloud.test.tsx › keyboard › Tab also reaches the voice select when there are two voices`        |
| Shift+Tab         | Player                     | Moves to the previous control                               | `read-aloud.test.tsx › keyboard › Shift+Tab moves focus back to the previous control`                 |
| Enter             | Play                       | Reads. Focus stays on Play                                  | `read-aloud.test.tsx › keyboard › Enter on Play starts reading and keeps focus`                       |
| Space             | Play                       | Reads. Focus stays on Play                                  | `read-aloud.test.tsx › keyboard › Space on Play starts reading and keeps focus`                       |
| Escape            | Inside the player          | Stops reading. Focus stays where it is                      | `read-aloud.test.tsx › keyboard › Escape inside the player stops reading and keeps focus`             |
| Escape            | Inside the player, idle    | Not handled, not prevented                                  | `read-aloud.test.tsx › keyboard › Escape while idle is not prevented`                                 |
| Enter             | Previous, Next, Stop, idle | Does nothing                                                | `read-aloud.test.tsx › controls › Previous, Next and Stop are aria-disabled but focusable while idle` |
| Escape            | Anywhere, trigger shown    | Dismisses the selection trigger                             | `read-aloud.test.tsx › selection trigger › is dismissed by Escape`                                    |
| Arrows, typeahead | Speed, Voice               | Native `<select>` behaviour                                 | not handled: the browser's own                                                                        |

## Focus management

- Initial focus: not moved. Focus never leaves the control that was used, including after stop and at the end of the content.
- Trap: no. Restore to: not applicable.
- Never obscured by: the player is in the page flow, never sticky. The selection trigger is placed below the selection, beside it when there is no room, and never over the selected text (2.4.11).
- SelectionTrigger: not in the Tab order, exposed to AT. The identical action, and the whole keyboard path, is Play (`selection trigger › is not in the Tab order and is not hidden from assistive technology`).
- Selection: a selection made in the content is captured, so Tab to Play doesn't lose it (`selection › the selection survives Tab to Play`). Reading it collapses the selection.

## Announcements

| Event                     | Message key (i18n)      | Politeness |
| ------------------------- | ----------------------- | ---------- |
| No voice for the language | `readAloud.noVoice`     | polite     |
| The speech engine failed  | `readAloud.speechError` | polite     |

Nothing else is announced: not play, pause, next, stop or the end (`errors and announcements › announces nothing on play, pause, next, stop or the end of the content`). The speech is the feedback, and a live region would talk over it and over a screen reader. An unsupported browser is shown as Status text only, since no control exists to attempt.

## Consumer responsibilities

- Set `lang` on the content, and offer the player to everyone: don't auto-start and don't hide it from assistive technology.
- Wrap the app in `KvirnProvider`: errors are announced through it.
- Mark what must not be read with `data-kv-read-aloud-skip`.
- `allowRemoteVoices` may send the text to a third party. Leave it off for personal data.

## Visual / modes

Headless: no CSS. Classes `kv-read-aloud`, `kv-read-aloud-button`, `kv-read-aloud-select`, `kv-read-aloud-label`, `kv-read-aloud-status`, `kv-read-aloud-selection-trigger`, and the highlight `::highlight(kv-read-aloud)` are for the theme (Plan 0088 T7). The highlight is not the only cue: Status shows the sentence position (1.4.1).

- Focus indicator: the Button's (`data-focus-visible`); the selects use the browser's focus ring.
- Target size: buttons and selects are native controls at least 24px (2.5.8), set by the theme (T7).
- Forced colours: the theme maps the highlight to `Highlight` / `HighlightText` (T7).
- Reduced motion: the sentence scrolls into view only when it is out of view and `prefers-reduced-motion` is not set (`read-aloud.test.tsx › scroll`).

## WCAG SCs covered

- 1.4.2 Audio Control: Pause and Stop (`controls`, `names and roles`).
- 2.1.1 Keyboard: the Keyboard rows.
- 2.2.2 Pause, Stop, Hide: the highlight follows the speech and is cleared on stop and unmount (`highlight`).
- 3.1.1 / 3.1.2 Language: each sentence is spoken with a voice for its own `lang`, never another language's. Unmarked text takes the closest `[lang]` above it, then the document's, then the provider's locale; an inner `lang` attribute wins, and a sentence with no voice stops the reading with `noVoice` naming that language (`languages inside the content`, `controls › the content’s lang picks the voice`).
- 4.1.2 Name, Role, Value: `names and roles`, `accessibility` (axe).
- 4.1.3 Status Messages: errors only (`errors and announcements`).
- 2.5.8 Target size, 1.4.11 Non-text contrast: theme task (T7).

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

## Known issues

- **Real speech is manual only.** Tests use a fake engine. Voices, `pause` and the first-gesture rule on iOS are covered by the AT matrix.
- **Pause restarts the sentence** (cancel and remember), since native `pause()` is unreliable.
- **Highlight** needs the CSS Custom Highlight API. Without it the Status text is the only position cue.
- **fi, nb and nn strings** are drafts for native review.
