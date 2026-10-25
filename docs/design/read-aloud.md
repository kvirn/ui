# Design spec: ReadAloud player and selection trigger

<!-- kv-lang-ok-file: the content table gives each string in Swedish and names the Finnish length check -->

- **Status:** Draft (revision 2) · **Designer:** ux-designer agent · **Date:** 2026-10-25 · supersedes the 2026-10-07 draft
- **Plan:** [0153](plans/0153-read-aloud-kvirn-only.md) (T1), revising [0088](plans/0088-read-aloud.md) (T1) and [0151](plans/0151-read-aloud-service.md) (T4) · **Type:** component default styling, states and copy
- **What changed in this revision:** the browser's `speechSynthesis` and every remote third-party voice are gone (0153 D1). `voice.kvirn.com` is the only engine, so there is **no local fallback**: waiting and failure states are the whole safety net. Four voices exist (sv, nb, en-GB, en-US), so **fi and nn pages have no voice**. One sentence per request, no streaming, so the first press always costs a network round trip (budget 10 s, 0153). Speed is `audio.playbackRate`, so it is instant and free, and Pause is now a real mid-sentence pause (0153 D7, retiring 0088 D4). No new token, no new colour pair.
- **Unchanged and kept:** no auto-start, no floating or sticky player, worded buttons in the page flow, one sentence highlight, errors announced and nothing else, the selection trigger.

## 1. Brief

- **Users:** residents reading an article, decision or letter. **Hardest case:** a resident with dyslexia or low literacy, reading in their second language on a 320px phone over a slow mobile connection, who has never used a read-aloud tool; second, a magnifier user at 400% who sees only part of the player.
- **Job:** "When a page is long or hard, I want to hear it while I follow the words, so I understand it without asking someone."
- **Context:** once per visit, often on a phone, usually while also reading. It must not fight a screen reader: screen-reader users already have a better reader and are **not** the audience (0088, Non-goals).
- **Constraints:** WCAG 2.2 AA; GDPR art. 25 (the sentence leaves the browser, so the resident is told in words who makes the audio and that nothing is stored); AGENTS.md rule 7 exception D5 (0151): the text goes to `voice.kvirn.com` only after a press. The service is a single EU host, is CPU-bound and can be busy.
- **Success:** the resident starts, pauses and finishes listening without help; can say which sentence is being read; and when the service is slow or down, knows it is the service and what to do next.
- **Evidence:** text-to-speech gives readers with reading disabilities a small-to-moderate comprehension gain (meta-analyses: Wood et al. 2018, d = 0.35, n = 2,942; Perelmutter et al. 2017, g = 0.445) and measurably less mind-wandering (Bonifacci 2022). Benefit is uneven: some readers do worse with it, so it is always optional and never on by default. Everything about **our** players is an assumption (A) until the sessions in §8.
- **Assumption → research question:** (A) residents look for Listen under the `h1` → do they find it there, or at the top of the page chrome, where Swedish municipalities put it? (A) a 1–3 s wait before the first word is tolerable with a word of feedback → at what wait do residents press again or leave?

## 2. Prior art

| Source                                                                                                                                               | Reused                                                                               | Rejected, and why                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ReadSpeaker webReader](https://www.readspeaker.com/solutions/text-to-speech-online/readspeaker-webreader/), the Nordic incumbent                   | "Listen" at the top of the content; sentence highlight; speed control; click-to-read | Its pop-up control panel, text mode, page mask and MP3 download. A second settings layer is a second thing to learn for the readers who need the least                                              |
| A Swedish kommun's webReader install ([Mora](https://morakommun.se/ovrigt/om-webbplatsen/sa-anvander-du-lyssnafunktionen-readspeaker.html), [Falun](https://www.falun.se/om-falun.se/om-lyssnafunktionen-readspeaker.html)) | The word "Lyssna" and a help page explaining it                                      | **Listen hidden inside the mobile menu** (Mora: "press Menu, then it is at the bottom of the list"). The resident who needs it least likely finds it. Ours is in the content at every width       |
| [Texthelp ReachDeck / BrowseAloud](https://www.texthelp.com/products/reachdeck/browsealoud-is-now-the-reachdeck-toolbar/)                            | Nothing                                                                              | A floating toolbar over the page, and [the documented criticism](https://en.wikipedia.org/wiki/BrowseAloud) that it needs a mouse selection, so it excludes the motor- and vision-impaired readers |
| Accessibility overlays ([Overlay Fact Sheet](https://overlayfactsheet.com/), [FTC v. accessiBe, final order 2025-04](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million)) | The warning                                                                          | Overlay widgets that inject ARIA, trap focus and claim conformance. ReadAloud adds **one group of real buttons** in the flow, claims nothing, and changes no other element of the page            |
| [GDS on accessibility](https://gds.blog.gov.uk/2011/05/06/accessibility/): a "half-hearted gesture (such as including text resizing or contrast options)" | The stance                                                                           | GOV.UK ships no listen control: the OS and browser do it. We ship one because fi/sv/nb OS voices are missing or poor and residents here expect "Lyssna", but it is opt-in per site, not a badge   |
| [Immersive Reader](https://support.microsoft.com/en-us/accessibility/word/use-immersive-reader-in-word): read aloud + line focus                      | Highlight as a reading aid, not a status display                                     | Word-level highlight and line focus. Word timings need alignments the service does not return (0151, Non-goals); a sentence highlight needs no timing and never reflows text                        |
| [Speechify](https://oae.stanford.edu/resources/speechify-tips-tricks), [NaturalReader](https://help.naturalreaders.com/en/articles/11511510-voice-and-playback-settings-personal-version) | Sentence skip; pitch-preserving speed                                                | A draggable floating pill, and a 0.28×–5× range. Four to five speed steps are enough; a pill over the text covers content and fails 2.4.11 at 400%                                                 |
| [Android Select to Speak](https://support.google.com/accessibility/android/answer/7349565), [Apple Speak Screen](https://www.apple.com/accessibility/features/) | The expectation of a transport (play, pause, skip, speed)                             | Nothing: these stay the better tool for a resident who has set them up. The site help page says so                                                                                                 |
| [Nielsen, response time limits](https://www.nngroup.com/articles/response-times-3-important-limits/)                                                  | 1 s = keep the flow of thought; 10 s = attention lost. Drives §3 and §6              | A percent-done bar: synthesis time is unknown, so there is nothing honest to fill                                                                                                                   |
| KvirnUI: Button busy + Progress (`loading-indicators.md`), `copy-button.md` status row, Navigation current item                                       | `kv-spinner` after a delay, always with words; status as visible text, not live      | –                                                                                                                                                                                                   |

## 3. Flow

1. The resident lands on the article. The player sits under the `h1` (§5). Nothing plays and nothing is fetched: the voice list and the first sentence are requested only by a press (0151 D5, 1.4.2).
2. Presses **Listen**. The audio element is unlocked inside that gesture (iOS), sentence 1 is requested. Play becomes **Pause** at once; the resident can stop the wait at any moment.
3. Under ~300 ms nothing else changes. Past 300 ms a spinner and `preparing` appear in Status; past ~1 s `preparing` is announced once (politely).
4. Audio starts: the highlight lands on sentence 1, Status shows "Sentence 1 of 12", and sentence 2 is fetched while 1 plays. Nothing is announced.
5. **Pause** pauses the audio where it is and keeps the highlight and the position. Listen resumes mid-sentence (0153 D7). **Previous / Next** move one sentence, playing or paused. **Stop** clears the highlight and Status, back to idle at sentence 1.
6. **Speed** applies to the sentence already playing (`playbackRate`, pitch preserved): no refetch, no gap. **Voice** (where rendered) restarts the current sentence in the new voice.
7. End of the content: back to idle, silently. Focus never moves.
8. **Selection:** the resident selects text. Play becomes **Listen to selected text**; with a pointer, a button with the same words appears by the selection (§6). Either reads only the selection.

**Unhappy paths.** Every one of them keeps the player where it is, keeps the position, and offers the same next step: press Listen again.

| Case                                                   | `error` (0153 map)                       | What the user sees                                                                                        | Announced (polite) |
| ------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| Still synthesising sentence 1                          | – (`status: preparing`)                  | Play = Pause; from 300 ms spinner + `preparing` in Status                                                | once, past 1 s     |
| Prefetch missed: N finished, N+1 not ready             | – (`status: preparing`, position kept)   | Playback holds. Highlight and position **stay on N**; spinner joins Status. No label change               | no                 |
| Service busy, and the one automatic retry also fails   | `service-busy` (`synth_busy`/`queue_full`) | `preparing` throughout the Retry-After wait, then Status: `errorServiceBusy`. Play returns to Listen    | yes, once          |
| Service down, 10 s timeout, bad response, no voice list | `service-unavailable`                    | Status: `errorServiceUnavailable`. Paused at the current sentence, highlight kept                         | yes, once          |
| Audio cannot be decoded or played                      | `speech-error`                           | Status: `errorPlayback`                                                                                   | yes, once          |
| **Page language has no Kvirn voice (fi, nn)**           | `no-voice`                               | **No player at all** (§5). The hook reports it so the site can show its own line                          | no                 |
| One passage marked in a language with no voice         | per chunk                                | That sentence is skipped, never read in another language (3.1.2). Status: `partSkipped` (Q7)              | no                 |
| A normalised chunk overflows the service's bounds      | `text-too-long`                          | The chunk is skipped and reading carries on (0153). Status: `partSkipped`, so nothing vanishes in silence | no                 |
| Route change, tab closed, Escape                       | –                                        | The request is aborted (`AbortSignal`) and the audio stops. Nothing is shown                              | no                 |

## 4. Content

Every string is in `readAloud`, in all five locales. The UI locale is the provider's, not the content language: a Finnish municipality can run a Finnish UI around Swedish content, so `fi` strings still exist and stay the length check (A: machine draft; needs a native review before launch).

| Key                      | en                                                                                               | sv                                                                                                   | Note                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                  | Listen to this text                                                                              | Lyssna på texten                                                                                     | Group name, not visible                                                                                                                         |
| `play` / `pause`         | Listen / Pause                                                                                   | Lyssna / Pausa                                                                                       | Unchanged                                                                                                                                       |
| `playSelection`          | Listen to selected text                                                                          | Lyssna på markerad text                                                                              | Unchanged                                                                                                                                       |
| `previous` / `next`      | Previous sentence / Next sentence                                                                | Föregående mening / Nästa mening                                                                     | fi `Edellinen virke` / `Seuraava virke`                                                                                                         |
| `stop`                   | Stop                                                                                             | Stoppa                                                                                               |                                                                                                                                                 |
| `rate` / `voice`         | Speed / Voice                                                                                    | Hastighet / Röst                                                                                     | Visible labels                                                                                                                                  |
| `position`               | Sentence {current} of {total}                                                                    | Mening {current} av {total}                                                                          | `useFormat` numbers                                                                                                                             |
| `positionPaused`         | Paused at sentence {current} of {total}                                                          | Pausad vid mening {current} av {total}                                                               | Kept: after Pause the button says "Listen"                                                                                                      |
| **`preparing`** (new)    | **Getting the audio…**                                                                           | **Hämtar ljudet …**                                                                                  | Not "Loading": it names what is happening. One string for the first press, a Retry-After wait and a mid-text gap, so no wait reads as an error  |
| **`errorServiceBusy`**   | **The listening service is busy. Press Listen to try again.**                                    | **Uppläsningstjänsten är upptagen. Tryck på Lyssna för att försöka igen.**                           | Shown only after the one automatic retry fails. Names the service, not the device, and names the next step. No countdown: a ticking number is noise |
| **`errorServiceUnavailable`** | **The text can't be read aloud right now. Press Listen to try again, or read on.**          | **Texten kan inte läsas upp just nu. Tryck på Lyssna för att försöka igen, eller fortsätt läsa.**    | The second clause matters: there is no fallback engine, and the article itself is still readable                                                 |
| **`errorPlayback`**      | **This browser couldn't play the audio.**                                                        | **Den här webbläsaren kunde inte spela upp ljudet.**                                                 | Renames and rewords `speechError` (`error: speech-error`): the next step differs (another browser, not another try)                             |
| **`errorNoVoice`**       | **There is no voice for {language} yet, so this page can't be read aloud.**                      | **Det finns ännu ingen röst för {language}, så den här sidan kan inte läsas upp.**                    | Renames and rewords `noVoice`: no longer about the device. Rendered only where the consumer chooses to (§5); `{language}` from `Intl.DisplayNames` |
| **`partSkipped`** (new)  | **One part of the text was skipped.**                                                            | **En del av texten hoppades över.**                                                                  | Covers both a passage with no voice and a chunk the service refuses. Visible only, never announced (Q7)                                        |
| **`voicesLoading`** (new) | **Loading voices…**                                                                             | **Hämtar röster …**                                                                                  | Only where the Voice picker is rendered (`voicesStatus: 'loading'`); not in the recommended composition                                         |
| **`note`** (new)         | **Listening sends this text to {name} to make the audio. The text and the audio are not saved.** | **Uppläsningen skickar texten till {name} för att skapa ljudet. Texten och ljudet sparas inte.**     | The privacy affordance, as help text under the control. `{name}` is the engine's `name` (as `kvirnGeocoder`), so the recipient is always named  |
| **`howItWorks`** (new)   | **How listening works**                                                                          | **Så fungerar uppläsningen**                                                                         | Link text to the site's own page. Makes sense out of context (2.4.4)                                                                            |
| Retired                  | `unsupported`, `speechError`, `noVoice`                                                          | –                                                                                                    | There is no browser-support axis left (support is a network call). Pre-1.0, so the keys are removed or renamed, not aliased                      |

- Speed options `0.75×`, `1×`, `1.25×`, `1.5×`, `2×` via `useFormat` (sv `0,75×`), default `1×`.
- Voice option labels are the service's `name` as given, never translated.
- Longest strings: `errorServiceUnavailable` (sv 105 characters, fi longer) wraps in Status at 320px; `note` runs to three lines at 320px; `playSelection` fi "Kuuntele valittu teksti" wraps inside its button.

## 5. Structure

**Where it sits.** Inside `main`, in the article, after the `h1` and its date line and before the lead. Outside `contentRef`, or skipped by it (`data-kv-read-aloud-skip`), so the player never reads its own words. Never sticky, never floating, never in the mobile menu (DESIGN.md Layout; 2.4.11; 400% zoom). One player per `contentRef`.

```
main
  h1  Building permit for a deck
  p   Updated 3 October 2026
  div.kv-read-aloud  role=group "Listen to this text"   data-status data-error data-source   ← Root
    button.kv-button.kv-read-aloud-button  Listen        data-playing data-busy            ← Play
    button …  ‹ Previous sentence                        aria-disabled (idle)               ← Previous
    button …  Next sentence ›                            aria-disabled (idle)               ← Next
    button …  Stop                                       aria-disabled (idle)               ← Stop
    div.kv-field  label.kv-field-label Speed  select.kv-listbox-native.kv-read-aloud-select ← Rate
    p.kv-read-aloud-status  [spinner] Sentence 3 of 12                                      ← Status
    p.kv-read-aloud-note  Listening sends this text to Kvirn … a.kv-link How listening works ← Note (optional)
  div (contentRef)  p.lead … article text …
button.kv-button.kv-read-aloud-selection-trigger  popover=manual   (top layer, by the selection)
```

DOM order = visual order = Tab order. No `order`, no reversing. **Recommended composition (resident pages):** Play, Previous, Next, Stop, Rate, Status, Note. **Voice is not in it** (one voice per language today; see Q2), and no second settings layer.

| Width                       | Layout                                                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320px (288px column)        | Buttons wrap by content, start-aligned: `Listen`, `‹ Previous sentence` / `Next sentence ›`, `Stop`. Speed is its own full-width row, label above. Status, then Note, last       |
| 40rem and up (45rem column) | Buttons on one row (en, sv; fi may wrap). Speed on the next row (auto width). Status, then Note                                                                                   |
| RTL                         | Logical properties only. `chevron-back` / `chevron-forward` mirror (`mirrorInRtl`); the spinner does not. Status figures stay in reading order                                    |

**No voice for the page's language.** The player renders nothing: no group, no buttons, no message. A dead Listen button that always fails is worse than none, and a permanent "no Finnish voice" line on every page of a Finnish site is an apology on every page. The hook already knows (`error: 'no-voice'`, `voicesStatus: 'ready'`) and should expose it as one flag, so the site can say it once where it chooses — in its accessibility statement, or as `errorNoVoice` beside the article. Recommendation and Q3. The voice list only arrives after the first press (0151 D5), so until then the player renders in full and the first press is where this is discovered; a consumer that knows its content language can pass it and avoid even that.

## 6. Visual specification

Existing tokens only.

| Part                              | Specification                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kv-read-aloud` (Root)            | `display: flex`, `flex-wrap: wrap`, `align-items: flex-end`, gap `--kv-space-2` inline and `--kv-space-3` block. No fill, edge or shadow: controls in the flow, not a surface. Outer margin is the consumer's                                                                                                                                         |
| `kv-read-aloud-button`            | The secondary Button recipe unchanged (surface-raised, `secondary` edge, depth, ring, 44px comfortable). Never primary: the page's primary action is not "Listen". Text always visible; icons only on Previous and Next, size 5, decorative                                                                                                             |
| Play's width                      | Play never changes width with its label: `play`, `playSelection` and `pause` share one grid cell and the inactive ones are `visibility: hidden`, out of the accessibility tree (2.5.3). Otherwise "Listen to selected text" → "Pause" shrinks and a second press lands on Previous                                                                     |
| Play while `preparing` (first press or a mid-text gap) | The Button busy recipe (`loading-indicators.md` §busy): `kv-spinner` as the first child at the inline start, `currentColor`, with `data-busy`. **Never disabled and never `aria-busy` on the button**: it is the one way to stop the wait (2.2.2). The spinner appears at 300 ms, not at once, so a fast press doesn't flash                          |
| Idle Previous / Next / Stop       | `aria-disabled` + `data-disabled`: the Button's disabled look (dashed `border-control`, label readable), still focusable                                                                                                                                                                                                                                |
| Rate (and Voice)                  | `kv-field` + `kv-field-label` + `kv-listbox-native` unchanged. `kv-read-aloud-select`: `inline-size: auto`, `max-inline-size: 100%` from `40rem`, full width below                                                                                                                                                                                      |
| `kv-read-aloud-status`            | `flex-basis: 100%`, `body` in `text` (never `text-muted`: these are instructions), tabular figures, `min-block-size: 1lh` so starting playback shifts nothing. A spinner or a decorative `warning` icon (size 5, `text` colour) sits first, `--kv-space-2` away: the CopyButton status row                                                             |
| `kv-read-aloud-note` (new class)  | `flex-basis: 100%`, `body-small` in `text` (help text under a control, never `text-muted`), a `kv-link` at the end. Nothing needed to operate the player lives here                                                                                                                                                                                     |
| `kv-read-aloud-selection-trigger` | Unchanged: a secondary `kv-button` in the top layer with `--kv-shadow-popup`, 44px min height, at most `20rem` wide, placed below the selection's last line and flipped above when there is no room. Never covers the selected text                                                                                                                     |

### States

There are four statuses (0153): `idle`, `preparing`, `playing`, `paused`. A mid-text gap is `preparing` with the position kept, so no new status and no new copy are needed for buffering. An error is `data-error` on top of `paused` or `idle`.

| `data-status` (+`data-error`)    | Play label (= name)     | Spinner     | Prev / Next / Stop | Status                                  | Highlight         |
| -------------------------------- | ----------------------- | ----------- | ------------------ | --------------------------------------- | ----------------- |
| `idle`                           | Listen                  | –           | `aria-disabled`    | empty (1 line reserved)                 | none              |
| `idle` + selection               | Listen to selected text | –           | `aria-disabled`    | empty                                   | none              |
| `preparing`, first press         | Pause                   | from 300 ms | enabled            | `preparing` from 300 ms                 | none yet          |
| `preparing`, mid-text            | Pause                   | from 300 ms | enabled            | `preparing`, the position line kept     | stays on the last |
| `playing`                        | Pause (`data-playing`)  | –           | enabled            | `position`                              | current sentence  |
| `paused`                         | Listen                  | –           | enabled            | `positionPaused`                        | stays             |
| `service-busy`                   | Listen                  | –           | as before          | `errorServiceBusy` + `warning` icon     | stays             |
| `service-unavailable`            | Listen                  | –           | as before          | `errorServiceUnavailable` + icon        | stays             |
| `speech-error`                   | Listen                  | –           | as before          | `errorPlayback` + `warning` icon        | stays             |
| `text-too-long` or a skipped part | unchanged              | –           | enabled            | `partSkipped`, then back to `position`  | continues         |

Hover, focus-visible, pressed and disabled are the Button's and the select's own states; nothing new. An error never empties Status before the next press, and never moves focus.

### Current-sentence highlight `::highlight(kv-read-aloud)` — unchanged from revision 1

`::highlight()` takes only colour, background and decoration, so the look is one fill: `primary` with `on-primary` text in all four themes, `Highlight` / `HighlightText` in forced colours. Measured (WCAG formula on palette values; `theme:check` stays the source): fill vs surroundings 4.70 canvas / 4.42 surface (light), 4.44 / 4.05 / 3.75 (dark), 9.89 (light-contrast), 11.14 (dark-contrast); text on fill 4.70 and up. Both pairs are already in `theme:check`.

- **Rejected:** a soft `primary-subtle` tint (calmer to read, A) is 1.13:1 on canvas in light, so the sentence isn't told from its neighbours at low vision.
- `color: on-primary` recolours a link inside the sentence too, so no link sits at ~1.2:1 on the fill. Story check: a sentence with a link, four themes.
- It is **a reading aid, not a status**: a highlight only ever appears while audio for that sentence is playing or paused, never on a buffer gap, an error, `:hover` or **`:focus`**. Position in words is in Status (1.4.1).
- It paints a range, so no element is wrapped, nothing reflows and the consumer's own styles are untouched. `::selection` paints above it, so reading a selection collapses that selection first (focus does not move).
- Not measured: a highlight inside an Alert's `-subtle` background (Q6 in revision 1 stands).

### Modes

- **Forced colours:** buttons, selects and the spinner keep their forced rules (`CanvasText` text, `Highlight` value). Status and Note `CanvasText`; the `warning` icon takes `CanvasText`, and the words carry the status.
- **Reduced motion** (`prefers-reduced-motion: reduce` or `data-kv-motion="reduce"`): the spinner shows its rest arc and does not turn; the words still appear. Scroll-follow is **instant, not off**: a jump is not animation, and turning it off loses a reduced-motion reader's place on every sentence. Follow stops after a manual scroll until the next Listen, Previous or Next.
- **2.2.2:** the only looping thing is the spinner, and a wait is bounded by the 10 s request budget; Pause stops both the wait and the spinner at any moment, which is the mechanism 2.2.2 asks for.
- **320px, 400%, 1.4.12:** no fixed widths or heights on text; buttons, Status and Note wrap and hyphenate; Speed is full width below `40rem`.

## 7. Accessibility annotations

Draft input for `read-aloud.a11y.md`.

- **Tab stops, in order:** Play → Previous → Next → Stop → Speed (→ Voice, where rendered) → the Note's link. Status, the spinner and the highlight are never focusable. No player rendered = no Tab stops.
- **Keys** (`keyboard` skill): Enter and Space on the buttons (native), native `<select>` keys, Escape inside Root stops the audio and aborts the request with focus unmoved, Escape dismisses the selection trigger. No page-level shortcut.
- **Roles and names:** Root `role="group"` named by `readAloud.label`; buttons named by their visible text (chevrons `aria-hidden`); selects by their `<label for>`; Status a `<p role="status" aria-live="off">` — findable, silent; the spinner `aria-hidden`; Note plain text plus a `kv-link`.
- **Play's name follows its visible label** (2.5.3), and the busy spinner never replaces or hides the label.
- **Focus:** never moves — not on start, pause, stop, the end of the text, a state change or an error. Never trapped. The selection trigger never takes focus (`tabindex="-1"`, `pointerdown` prevented, not `aria-hidden`) and any key dismisses it before focus moves (2.4.11).
- **Announcements** (Announcer, polite, each at most once per press): `preparing` only when the wait passes 1 s; `errorServiceBusy`; `errorServiceUnavailable`; `errorPlayback`. **Nothing else.** Not play, pause, next, stop, the end, each sentence, a position change, a mid-text gap, a skipped part or a speed change. A live region that narrates sentences talks over both the audio and a screen reader and is a defect.
- **Colour independence:** every state is in words in Status; the spinner is shape, the `warning` icon is an octagon-free triangle with words beside it; the highlight is a luminance change plus the position in text (1.4.1).
- **Target size:** native controls at `--kv-control-min-block-size` (44px comfortable, 32px compact, never under 24×24, 2.5.8); the selection trigger 44px.
- **Language (3.1.2):** each chunk is read by a voice for its own `lang`, or skipped. Never Finnish in a Swedish voice.
- **SCs of note:** 1.4.1, **1.4.2** (nothing starts without a press, and Pause and Stop exist anyway), 1.4.10, 1.4.11, 1.4.12, 2.1.1, **2.2.2** (Pause stops the only loop), 2.4.4, 2.4.11, 2.5.3, 2.5.8, 3.1.2, 4.1.2, 4.1.3.

## 8. Validation

- [x] Self-review against `review-checklist.md`: no open blocker. Words on every control; no colour-only cue; no new token or pair; nothing sticky, floating or modal; every state has copy.
- [ ] `theme:check` green after the theme task (orchestrator; no new pair expected).
- **Usability test plan** (`pending`; no sessions held, no AT testing done). Participants: a resident with dyslexia, a second-language reader, a resident with low digital confidence on a phone, a magnifier user at 400%, an NVDA user and a VoiceOver iOS user (to check the player stays out of their way), a Windows contrast-theme user. Tasks: (1) listen to the article and pause at the second heading; (2) hear only the paragraph about fees; (3) slow the reading down; (4) on a throttled connection, start listening and say what is happening; (5) with the service returning `queue_full`, say what you would do next. Measure: completion, whether the wait was understood as the service and not the device, mis-presses near Play, whether anyone looked for the Note before pressing.

## 9. Open questions for the maintainer

> **Resolved 2026-10-25** (maintainer), recorded as D8–D11 in
> [plan 0153](plans/0153-read-aloud-kvirn-only.md): **Q1** full transport (Play, Previous, Next, Stop, Speed,
> Status, Note) — **Q2** no Voice picker in v1, the part stays exported — **Q3** render nothing and expose
> `hasVoice: false` — **Q4** highlight on by default — **Q5** the Note is a default part, no consent gate,
> `name` still defaults to the host — **Q6** `preparing` announced once past 1 s — **Q7** skip, read on, and
> show `partSkipped` — **Q8** English wording approved; **fi/nb/nn await a native review (pending)** —
> **Q9** no sticky bar in v1 — **Q10** text only, no icons. The questions are kept below for the reasoning.

1. **Default set of controls.** Recommended: Play, Previous, Next, Stop, Speed, Status, Note. Smaller (Play + Stop + Status) is fewer things to learn; a full transport is what residents know from webReader. Decide the one shown in the docs example and the municipal reference site.
2. **Voice picker.** Recommended: not rendered in v1. The list can only be fetched after a press (0151 D5), so a select that appears mid-task shifts the layout, and today only English has two voices. Alternative: the consumer passes a fixed voice id per language.
3. **Unsupported-language page (fi, nn).** Recommended: render nothing and expose `hasVoice: false`. Alternatives: always render `noVoice` beside the article, or let the consumer choose with a class. This is the most visible consequence of dropping local voices.
4. **Highlight on by default?** Recommended: yes, on, with the consumer able to turn it off, because following the words is the main reason residents use this. It needs the CSS Custom Highlight API; without it Status is the only position cue.
5. **The privacy affordance, now that `allowRemoteVoices` is gone** (0153 D4, already decided). Design recommendation: no checkbox and no dialog in front of Listen — a consent gate would stop the readers who need this most, and nothing leaves the browser before the press. Instead the **Note is part of the recommended composition** (it names the recipient and says nothing is stored), `name` is strongly recommended rather than left to default to the host name, and `howItWorks` links to the site's own page. Approve the Note as a default, or leave it to each consumer?
6. **`preparing` announced after 1 s:** accept, or announce nothing at all and rely on the focused button's name changing to Pause?
7. **A skipped part** (a passage in a language with no voice, or a chunk the service refuses as too long). Recommended: skip it, carry on, and show `partSkipped` so nothing disappears in silence. Alternatives: stop the reading there and say why (revision 1), or skip it with no sign at all (0153's error map, which says nothing about telling the resident).
8. **Copy and keys in §4:** retire `unsupported` and `speechError`, rename `noVoice` → `errorNoVoice`, add `preparing`, `errorServiceBusy`, `errorServiceUnavailable`, `errorPlayback`, `partSkipped`, `voicesLoading`, `note`, `howItWorks` (8 new keys × 5 locales, and `fi`/`nb`/`nn` need a native review). Approve the wording?
9. **Long pages:** a pause control that stays in reach is still not in v1 (sticky bars fail at 400% zoom). Revisit when a session shows residents losing the player?
10. **Icons for Listen, Pause and Stop:** still none, and the built-in cap is full. Text only (recommended).
