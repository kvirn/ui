# Accessibility contract: ReadAloud

- **APG pattern:** none for the group. Buttons follow [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), the naming practice for media buttons such as Play and Pause.
- **Deviations:** none from the APG. Previous, Next and Stop stay focusable while unavailable (`aria-disabled`) while idle, so their names can be found and the keyboard path doesn't jump.
- **Native elements used:** `<button type="button">`, `<select>` with a `<label>`, a plain `<span>` for the status, a plain `<p>` for the privacy note.
- **Tests:** `read-aloud.test.tsx` next to this file (a fake engine, nothing speaks over the network).
- **Status:** Planning

ReadAloud reads a region of the page aloud for people who benefit from hearing it, on Kvirn's own voice service (Plan 0153). It is not a screen reader substitute and never starts by itself.

## Roles, states, properties

| Part             | Element / role          | ARIA                                                     | Notes                                                                                                                                                                                                                                                                                                                                                         |
| ---------------- | ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root             | `<div>` → `group`       | `aria-label` = `readAloud.label`                         | `data-status` (`idle`, `preparing`, `playing`, `paused`), `data-error` (one of the five below, while an error is current), `data-source` (`content`, `selection`), `data-kv-read-aloud-skip` (its own words are never read). Renders nothing once `hasVoice` is `false` (D9, D14): no voice for the resolved content language, or no engine configured at all |
| Play             | `<button>` → `button`   | none                                                     | `data-playing` while reading; `data-busy` once a wait (first chunk or a later one) has passed 300 ms. Never disabled: it is the way to cancel the wait. Pause is real: pressing it while paused resumes the same point, never restarting the sentence (D7)                                                                                                    |
| Previous         | `<button>`              | `aria-disabled="true"` while idle                        | Focusable, activation blocked                                                                                                                                                                                                                                                                                                                                 |
| Next             | `<button>`              | `aria-disabled="true"` while idle                        | As Previous                                                                                                                                                                                                                                                                                                                                                   |
| Stop             | `<button>`              | `aria-disabled="true"` while idle                        | As Previous. Reachable during `preparing`, so a slow service can always be cancelled                                                                                                                                                                                                                                                                          |
| Rate             | `<select>` → `combobox` | visible `<label>`                                        | Options `0.75×` … `2×`, formatted with the provider locale                                                                                                                                                                                                                                                                                                    |
| Voice            | `<select>` → `combobox` | visible `<label>`                                        | Only voices for the content language. Not rendered with fewer than two. Not part of the default composition (D8): the list arrives only after the first press, and only `en` currently has a real choice                                                                                                                                                      |
| Note             | `<p>`                   | none                                                     | The privacy affordance (D11): names who receives the text and that nothing is stored, with an optional link. Renders nothing without `name`. No consent gate: nothing leaves the browser before Play is pressed regardless                                                                                                                                    |
| SelectionTrigger | `<button>` → `button`   | `popover="manual"`, `tabindex="-1"`, not `aria-hidden`   | Pointer-only convenience. Name and text `readAloud.playSelection`. Shown below the end of a selection finished with a pointer; never after a keyboard selection. Never takes focus: `pointerdown` is prevented, so the selection survives. Dismissed on collapse, any key (Escape included), scroll, resize, Stop and use                                     |
| Status           | `<span>`                | `role="status"` with `aria-live="off"`: findable, silent | `Sentence {current} of {total}` while reading, `Paused at sentence {current} of {total}`, `Getting the audio…` once a wait is visible, `One part of the text was skipped` after a skip, or the current error's text. `data-error` carries the cause                                                                                                           |

### Read aloud

| State or action                     | Expected phrase(s) as read aloud                                                                                                                                     | Live region politeness | Test                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Idle, read top to bottom            | `group, Listen to this text` → `button, Listen` → `button, Previous sentence, disabled` → `button, Next sentence, disabled` → `button, Stop, disabled` → the content | none                   | `read-aloud.test.tsx › read aloud › idle reading order: the group, Listen, the three disabled buttons, then the content` |
| Play pressed, a slow first chunk    | `button, Pause`, then, once `preparing` has shown for 1 second, `polite: Getting the audio…` (once per press, never once per sentence)                               | polite                 | `read-aloud.test.tsx › read aloud › a slow first chunk announces "Getting the audio…" once, past one second`             |
| Buffering mid-reading               | nothing: a later chunk still loading never re-announces `preparing`                                                                                                  | none                   | `read-aloud.test.tsx › read aloud › buffering mid-reading announces nothing`                                             |
| Play pressed, then paused           | `button, Listen` → `button, Pause` + `Sentence 1 of 2` → `button, Listen` + `Paused at sentence 1 of 2`                                                              | none                   | `read-aloud.test.tsx › read aloud › the Play name reads Listen, then Pause, then Listen after pause`                     |
| A selection is captured             | `button, Listen to selected text`                                                                                                                                    | none                   | `read-aloud.test.tsx › read aloud › the Play name reads Listen to selected text while a selection is captured`           |
| No voice for the content's language | `polite: There is no voice for Finnish yet, so this page can't be read aloud.`                                                                                       | polite                 | `read-aloud.test.tsx › read aloud › no voice is announced politely, naming the content's language`                       |
| The voice service is busy           | `polite: The listening service is busy. Press Listen to try again.`                                                                                                  | polite                 | `read-aloud.test.tsx › read aloud › a busy service is announced politely, after its one retry`                           |
| The voice service is unavailable    | `polite: The text can't be read aloud right now. Press Listen to try again, or read on.`                                                                             | polite                 | `read-aloud.test.tsx › read aloud › a service failure is announced politely`                                             |
| The browser couldn't play the audio | `polite: This browser couldn't play the audio.`                                                                                                                      | polite                 | `read-aloud.test.tsx › read aloud › a playback error is announced politely`                                              |
| A part of the text is skipped       | nothing: `One part of the text was skipped` is shown in Status, never announced (D10)                                                                                | none                   | `read-aloud.test.tsx › read aloud › a skipped part is shown but never announced`                                         |
| Play, pause, next, stop, end        | nothing                                                                                                                                                              | none                   | `read-aloud.test.tsx › read aloud › play, pause and stop announce nothing`                                               |

Other texts: Speed and Voice labels (`readAloud.rate`, `readAloud.voice`), the speed options (`readAloud.rateOption`, `1.5×`), the Note text (`readAloud.note`) and its `howItWorks` link, read in the normal reading order like any other static text — not announced.

The phrases are the approximation of a virtual screen reader (software that imitates one for tests), not NVDA or JAWS wording.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1 Info and Relationships, level A; 4.1.2 Name, Role, Value, level A). `as` is a string, so it works from a Server Component.

| Part                                                                  | `as`                         | Why                                                                                                                                                                                                                         |
| --------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status                                                                | `span` (default), `p`, `div` | Visible text of the position or the reason nothing is read, with `role="status"` and `aria-live="off"` kept. A value outside the list is a type error and, in plain JavaScript, warns once and renders the default element. |
| Root, Play, Previous, Next, Stop, Rate, Voice, Note, SelectionTrigger | none                         | A `role="group"` `<div>`, native `<button>`s, `<select>`s and a plain `<p>`: no other element keeps the keyboard and name contract (4.1.2 Name, Role, Value, level A)                                                       |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Native controls in DOM order, no `tabindex`. Disabled controls stay in the Tab order (`aria-disabled`) while idle. `Note` is static text, never a Tab stop.

| Key               | Context                    | Action                                                      | Test                                                                                                        |
| ----------------- | -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tab               | Player                     | Moves through Play, Previous, Next, Stop, Speed (and Voice) | `read-aloud.test.tsx › keyboard › Tab moves through Play, Previous, Next, Stop and Speed`                   |
| Tab               | Player, two voices         | Reaches the Voice select                                    | `read-aloud.test.tsx › keyboard › Tab also reaches the voice select when there are two voices`              |
| Shift+Tab         | Player                     | Moves to the previous control                               | `read-aloud.test.tsx › keyboard › Shift+Tab moves focus back to the previous control`                       |
| Enter             | Play                       | Reads. Focus stays on Play                                  | `read-aloud.test.tsx › keyboard › Enter on Play starts reading and keeps focus`                             |
| Space             | Play                       | Reads. Focus stays on Play                                  | `read-aloud.test.tsx › keyboard › Space on Play starts reading and keeps focus`                             |
| Escape            | Inside the player          | Stops reading. Focus stays where it is                      | `read-aloud.test.tsx › keyboard › Escape inside the player stops reading and keeps focus`                   |
| Escape            | Inside the player, idle    | Not handled, not prevented                                  | `read-aloud.test.tsx › keyboard › Escape while idle is not prevented`                                       |
| Enter             | Previous, Next, Stop, idle | Does nothing                                                | `read-aloud.test.tsx › keyboard › Enter on Previous, Next and Stop while idle does nothing and keeps focus` |
| Escape            | Anywhere, trigger shown    | Dismisses the selection trigger                             | `read-aloud.test.tsx › selection trigger › is dismissed by Escape`                                          |
| Arrows, typeahead | Speed, Voice               | Native `<select>` behaviour                                 | `read-aloud.test.tsx › keyboard › arrow keys on the speed select are not handled or prevented`              |

## Focus management

- Initial focus: not moved. Focus never leaves the control that was used, including after stop and at the end of the content.
- Trap: no. Restore to: not applicable.
- Never obscured by: the player is in the page flow, never sticky. The selection trigger is placed below the selection, beside it when there is no room, and never over the selected text (2.4.11 Focus Not Obscured (Minimum), level AA).
- SelectionTrigger: never takes focus. Any key, Tab included, dismisses it before focus moves, so it never covers a focused element (2.4.11 Focus Not Obscured (Minimum) (AA)). It is not in the Tab order, and it is not hidden from assistive technology. The identical action, and the whole keyboard path, is Play.
- Selection: a selection made in the content is captured, so Tab to Play doesn't lose it. Reading it collapses the selection.

## Announcements

| Event                                 | Message key (i18n)                  | Politeness |
| ------------------------------------- | ----------------------------------- | ---------- |
| A wait past 1 second (once per press) | `readAloud.preparing`               | polite     |
| No voice for the content's language   | `readAloud.errorNoVoice`            | polite     |
| The voice service is busy             | `readAloud.errorServiceBusy`        | polite     |
| The voice service is unavailable      | `readAloud.errorServiceUnavailable` | polite     |
| The browser couldn't play the audio   | `readAloud.errorPlayback`           | polite     |

Nothing else is announced: not play, pause, next, stop, the end, or a skipped part (`readAloud.partSkipped`, shown in Status but never announced, D10) — a resident who is listening does not need every gap or skip narrated, and a live region would talk over the speech itself and over a screen reader.

## Consumer responsibilities

- Set `lang` on the content, not just the page: the voice follows the content's own declared language, never the UI's `locale` (3.1.2). Offer the player to everyone: don't auto-start and don't hide it from assistive technology.
- Give the engine a `url` (directly, or once via `<KvirnProvider readAloud>`) and a `name`: `Note` needs it to tell residents who the text is sent to.
- Wrap the app in `KvirnProvider`: errors are announced through it.
- Mark what must not be read with `data-kv-read-aloud-skip`.

## Visual / modes

Headless: no CSS. Classes `kv-read-aloud`, `kv-read-aloud-button`, `kv-read-aloud-select`, `kv-read-aloud-label`, `kv-read-aloud-status`, `kv-read-aloud-note`, `kv-read-aloud-selection-trigger`, and the highlight `::highlight(kv-read-aloud)` are for the theme. The highlight is not the only cue: Status shows the sentence position, and a `data-busy`/`data-error` icon on Status, in text colour, backs up the spinner and the error text (1.4.1 Use of Color, level A).

- Focus indicator: the Button's (`data-focus-visible`); the selects use the browser's focus ring.
- Target size: buttons and selects are native controls at least 24 × 24 CSS px (2.5.8 Target Size (Minimum), level AA), set by the theme.
- Forced colours: `::highlight` maps to `Highlight`/`HighlightText`; Status is the position cue either way.
- Reduced motion: the sentence scrolls into view only when it is out of view and `prefers-reduced-motion` is not set; the `preparing` spinner animation is suppressed (the theme's job).

## WCAG SCs covered

- 2.2.2 Pause, Stop, Hide (A) and 1.4.2 Audio Control (A) do not apply: speech and the highlight start only when the user presses Play. Pause and Stop are offered anyway, reachable during `preparing` too, and the highlight is cleared on stop and unmount.
- 2.1.1 Keyboard (A): every control works from the keyboard.
- 2.4.11 Focus Not Obscured (Minimum) (AA): the SelectionTrigger never takes focus and any key dismisses it before focus moves.
- 3.1.1 Language of Page (A) and 3.1.2 Language of Parts (AA): each chunk is spoken with a voice for its own `lang`, never another language's and never the UI's `locale`. Unmarked text takes the closest `[lang]` above it, then the provider's `locale`, then `en`; an inner `lang` attribute wins. A chunk with no voice either stops the reading (the content's own language) with a message naming it, or is skipped and read past (an inline, differently-languaged chunk, D10).
- 4.1.2 Name, Role, Value (A): the controls have names and roles, and axe finds no violation.
- 4.1.3 Status Messages (AA): `preparing` (once per press), the five errors, and nothing per sentence or per skip.
- 3.3.1 Error Identification (A): each error says what happened and, where there is one, what to do next (`errorServiceBusy`, `errorNoVoice`).
- 2.5.8 Target Size (Minimum) (AA), 1.4.11 Non-text Contrast (AA): the default theme's job.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                       |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                             |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pending     | n/a         | pending | read-aloud.stories.tsx, every story state, 4 themes (T7)                                    |
| Markup and ARIA (roles, names, ids, states)                                | pending     | n/a         | pending | read-aloud.test.tsx (T7)                                                                    |
| Keyboard contract rows (Vitest browser)                                    | pending     | n/a         | pending | the 10 rows above, each its own named test (T7)                                             |
| Focus order and management                                                 | pending     | n/a         | pending | read-aloud.test.tsx (T7)                                                                    |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pending     | n/a         | pending | the four sweep projects, run in CI once ReadAloud is added to `sweepComponents` (T7)        |
| **Core (required for beta)**                                               |             |             |         |                                                                                             |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                             |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending | the iOS unlock (the reused `<audio>` element) is unverified on a real device (plan, §Risks) |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                             |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                             |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                             |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                             |

### What to check

- Tab through the player: each control is named. Previous, Next and Stop are read as unavailable while idle.
- Press Enter or Space on Listen: speech starts and focus stays on the button.
- Press Escape while it reads: reading stops and focus stays.
- Select text with Shift and the arrow keys, then Tab to Listen: only the selection is read.
- With no voice for the content's language, Listen announces and shows the "no voice" message naming it, and the Root doesn't render on a later visit (`hasVoice` resolves before the first press).
- Pause mid-sentence, then resume: the audio continues from the same point, not the start of the sentence.
- Unplug the network (or point `url` at nothing): a press ends in the "service unavailable" message, not silence.

## Known issues

- **Real speech is manual only.** Tests use a fake engine; the docs site and Storybook never call the live voice service in CI. The iOS unlock, real voices and the Kvirn service's actual latency need a check with your own users and assistive technology.
- **Highlight** needs the CSS Custom Highlight API. Without it, Status's position text is the only position cue, which is by design, not a gap.
- **fi, nb and nn strings:** have a native speaker review them before you launch (plan §i18n strings).
- **voice.kvirn.com is not deployed yet.** Until it is, every environment but a local dev edge sees the "service unavailable" state.
