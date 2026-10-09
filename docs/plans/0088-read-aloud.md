# Plan 0088: ReadAloud (text to speech player and selection reader)

- **Status:** Blocked (2026-10-09, maintainer): in-planning, waiting for an npm package update and a re-test; the `::highlight(kv-read-aloud)` CSS was removed from `theme.css`. Was: Approved (scope and voice policy answered by the maintainer 2026-10-07)
- **Owner:** lead (orchestrator) → component-engineer, ux-designer, accessibility-reviewer
- **Created:** 2026-10-07 · **Target:** M3 component set
- **Related:** inspiration [ReadSpeaker webReader](https://www.readspeaker.com/products/webreader/); skills `api-conventions`, `accessibility`, `keyboard`, `testing`, `theme-css`, `overlays-and-lists` (selection popup); `core/announcer`; `@kvirn-ui/testing/read-aloud` is an unrelated test helper (a virtual screen reader), don't confuse the two

## Goal

A reader can press **Listen** to hear a region of the page read aloud, pause, resume, stop, skip a sentence back or forward, change the speed and voice, see the sentence being read, and select any text to have just that read. All in-house, on the browser's own `speechSynthesis`, with no dependency and no server.

## Non-goals

- Remote or neural voices, a self-hosted TTS server, audio file output (the engine is injectable, see Decisions D3, but no second engine ships).
- Word-level highlight, a persisted settings panel, reading several regions in sequence, click-to-read paragraphs (WebReader parity: later plans).
- Replacing a screen reader. This is for sighted users with reading difficulties, not an AT substitute, and must not fight one (see contract).
- A claim that this satisfies any legal requirement.

## Background

- Web Speech API, `SpeechSynthesis` / `SpeechSynthesisUtterance`: universal in current browsers, but voices vary by OS, `getVoices()` loads async (`voiceschanged`), Chrome stops an utterance after ~15 s so text must be chunked, `pause()` is unreliable on Android and some desktop voices, `boundary` events are missing on many voices, and `speechSynthesis` keeps speaking after SPA route changes or unmount unless cancelled.
- **Privacy:** Chrome/Edge "network" voices (`localService === false`) send the text to a third party. Rule 7 forbids that, so v1 offers **local voices only** by default (D2).
- WCAG: 1.4.2 Audio Control (audio over 3 s needs pause/stop, independent of system volume), 2.1.1 Keyboard, 2.2.2 Pause/Stop/Hide (the moving highlight follows the speech and stops with it), 2.5.8 Target size, 3.1.1 / 3.1.2 Language (voice follows `lang`), 4.1.2 name/role/value, 4.1.3 status messages (only for errors, see below), 1.4.11 non-text contrast (highlight and controls), 1.4.1 (the highlight is not the only cue: the player shows `playing` and the sentence counter).
- Existing patterns reused: `useButton`, `useMessages`, `useAnnouncer`, `useEnv`, `createComponentStore`, `computePlacement` + native `popover` (overlays-and-lists skill), `CopyButton` as the nearest small reference (`packages/react/src/copy-button/`).

## Design

### Layers

| Layer                         | Files (new)                                 | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| core (pure, no DOM at import) | `packages/core/src/read-aloud/`             | `split-sentences.ts` (text to chunks with offsets; `Intl.Segmenter` by granularity `sentence`, regex fallback; hard max ~200 chars, split on clause then word), `collect-text.ts` (walk an `Element` at call time: text nodes with offsets, skipping `[hidden]`, `aria-hidden="true"`, `script/style/template`, `[data-kv-read-aloud-skip]` and nodes not rendered; returns the string and a way to map offsets back to a `Range`), `create-speech-engine.ts` (adapter over `env.window.speechSynthesis`: local-voice filter, `voiceschanged`, `speak/cancel`, `isSupported`), `create-read-aloud.ts` (the machine, on `createComponentStore`) and tests beside each |
| react                         | `packages/react/src/read-aloud/`            | `use-read-aloud.ts`, `read-aloud.tsx` (compound), `read-aloud-context.ts`, `read-aloud.md`, `read-aloud.a11y.md`, `read-aloud.test.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| i18n                          | `packages/i18n/src/locales/*`               | `readAloud` namespace in all 6 locales                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| theme                         | `packages/theme/theme.css`                  | `kv-read-aloud*` classes, `::highlight(kv-read-aloud)` incl. forced colours (only after the ux spec)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| stories                       | `apps/storybook/src/components/read-aloud/` | stories + fixture (fake engine, so CI never speaks)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### Machine (`create-read-aloud.ts`)

State: `status: 'idle' | 'playing' | 'paused' | 'unsupported'`, `chunks`, `index`, `rate` (0.75 · 1 · 1.25 · 1.5 · 2, default 1), `voiceURI | null`, `language`, `error: null | 'no-voice' | 'speech-error'`, `source: 'content' | 'selection'`.
Actions: `play(source)`, `pause()`, `resume()`, `stop()`, `next()`, `previous()`, `setRate`, `setVoice`, `destroy()`.
Rules:

- One utterance per chunk; the next starts on `end`. A changed rate or voice applies from the **next** chunk, and restarts the current one if playing (cheap, and it avoids Chrome ignoring live changes).
- **Pause is cancel and remember the chunk; resume restarts that chunk.** Native `pause()` is unreliable across engines; losing at most one sentence is the price (D4).
- `stop()` and `destroy()` call `cancel()`. `pagehide` and unmount cancel, so speech never outlives the page or component.
- Voice choice: explicit `voiceURI`, else best local voice for the content `lang` (exact tag, then primary subtag), else `error: 'no-voice'` and nothing is spoken. Never falls back to a voice of another language.
- No auto-play on mount, ever.

### API sketch

```tsx
<ReadAloud.Root contentRef={articleRef} lang="sv">   {/* lang optional: read from the content element */}
  <ReadAloud.Play />            {/* Listen / Pause; reads the captured selection first, else the content */}
  <ReadAloud.Previous />
  <ReadAloud.Next />
  <ReadAloud.Stop />
  <ReadAloud.Rate />            {/* native <select> */}
  <ReadAloud.Voice />           {/* native <select>, local voices for the language */}
  <ReadAloud.Status />          {/* "Sentence 3 of 12" and errors, visible text */}
</ReadAloud.Root>
<ReadAloud.SelectionTrigger />  {/* pointer convenience: "Listen" next to selected text */}
const reader = useReadAloud({ contentRef, lang, engine, messages, onStatusChange })
```

`Root` renders `role="group"` named by `readAloud.label`, exposes `data-status`, and provides context; each part is also reachable as `reader.playProps`, `reader.rateProps` … (api-conventions). `engine` (type `ReadAloudEngine`) is optional and documented as advanced: it exists for tests and a future self-hosted engine (D3). Options also: `highlight` (default `true`), `scroll` (follow the sentence, default `true`, off under `prefers-reduced-motion`), `allowRemoteVoices` (default `false`, D2).

Highlight: `CSS.highlights.set('kv-read-aloud', new Highlight(range))` for the current chunk and nothing else, cleared on stop and unmount. Feature-detected; where unsupported there is no highlight, and the Status text still shows the position. No DOM is mutated, so the author's markup and the reading order stay intact.

### Selection

`selectionchange` (on `document`, throttled by the store) captures the last non-collapsed selection **inside `contentRef`** as text plus its range. Why capture: moving focus to a button must not lose it. `Play` reads the captured selection when it exists (its name becomes `readAloud.playSelection`), otherwise the whole content. `SelectionTrigger` is a `popover="manual"` button placed by `computePlacement` at the end of the selection rect; it appears only for a pointer-made selection, never steals focus, and leaves on collapse, Escape, scroll or `stop`. **The keyboard path never depends on it:** select with Shift+Arrows, Tab to Play.

### Accessibility contract (draft)

| Key                      | Action                                                                                                                                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab          | Moves through Play, Previous, Next, Stop, Rate, Voice. Disabled controls leave the Tab order only when `unsupported`; otherwise they stay and are `aria-disabled` while idle (Previous, Next, Stop) so the layout and the keyboard path don't jump |
| Enter / Space            | Activate the focused button (native)                                                                                                                                                                                                               |
| Escape                   | While focus is inside Root or the SelectionTrigger: stop reading and dismiss the trigger. Focus stays where it is                                                                                                                                  |
| Arrow Up/Down, typeahead | Native `<select>` behaviour on Rate and Voice, untouched                                                                                                                                                                                           |

No custom shortcuts in v1 (Space is not hijacked outside the controls). `SelectionTrigger` is not in the Tab order (`tabindex="-1"` is not used either: it is a pointer-only convenience, and the identical action is `Play`), is not announced, and sets `aria-hidden` only if it is not focusable; the reviewer decides if that form is acceptable (Open question Q1).

- **Roles / ARIA:** Root `role="group"` + name. Native `<button>`s and `<select>`s with visible labels. `Play`'s name is the action (`Listen`, `Listen to selection`, `Pause`), the same pattern as the APG media buttons; `Resume` is `Listen` again. Status is visible text, not a live region.
- **Focus management:** none moved. Focus never leaves the control that was used, including after stop and when the content ends.
- **Announcements:** deliberately silent on play, pause, next and end, since the speech is the feedback and a live region would talk over it and over a screen reader. Only failures announce (`polite` via `useAnnouncer`): no voice for the language, speech error, unsupported browser.
- **Screen reader users:** the component never speaks while the page's own screen reader is the only intended reader; documented as: offer it to everyone, do not auto-start, do not hide it from AT.
- **Language:** `lang` of the content (or the prop) selects the voice; a mismatch shows `noVoice`, never a wrong-language read.
- **Read aloud table** (for `*.a11y.md`): the group name, each button name, `Listen` → `Pause` → `Listen` after pause, `Sentence {current} of {total}`, the error texts.
- **WCAG SCs:** 1.4.2, 2.1.1, 2.2.2, 2.5.8, 3.1.1, 3.1.2, 4.1.2, 4.1.3, 1.4.11.

### i18n strings (namespace `readAloud`, all six locales, overridable per provider and per instance)

| Key           | en                                       | sv                                        |
| ------------- | ---------------------------------------- | ----------------------------------------- |
| label         | Listen to this text                      | Lyssna på texten                          |
| play          | Listen                                   | Lyssna                                    |
| playSelection | Listen to selection                      | Lyssna på markeringen                     |
| pause         | Pause                                    | Pausa                                     |
| previous      | Previous sentence                        | Föregående mening                         |
| next          | Next sentence                            | Nästa mening                              |
| stop          | Stop                                     | Stoppa                                    |
| rate          | Speed                                    | Hastighet                                 |
| voice         | Voice                                    | Röst                                      |
| position      | Sentence {current} of {total}            | Mening {current} av {total}               |
| noVoice       | No voice is installed for this language. | Det finns ingen röst för det här språket. |
| speechError   | The text could not be read aloud.        | Texten kunde inte läsas upp.              |
| unsupported   | Your browser can't read text aloud.      | Din webbläsare kan inte läsa upp text.    |

`rate` option labels are numbers formatted with `useFormat` (`1×`), not strings. fi, nb, nn, en are written by the engineer; **se (Northern Sami) needs a native check**, marked `pending` in the PR (Q2).

### Theming surface

`data-status` on Root (`idle|playing|paused|unsupported`), `data-source` (`content|selection`), `data-playing` on Play. Classes `kv-read-aloud`, `kv-read-aloud-button`, `kv-read-aloud-select`, `kv-read-aloud-status`, `kv-read-aloud-selection-trigger`, and the highlight `::highlight(kv-read-aloud)` with a forced-colours fallback (`Highlight`/`HighlightText`). Values come from the ux spec and `DESIGN.md`; no new token unless the spec shows a gap, and that needs the maintainer.

## Tasks

- [x] T1 `ux-designer`: spec [`docs/design/read-aloud.md`](../design/read-aloud.md) (no new tokens; highlight is solid `primary` with `on-primary`, forced colours `Highlight`/`HighlightText`). Gate for T7 only
- [x] T4b (55 tests, `i18n:check` 255 keys; `noVoice` is now `({language})`, language name via `Intl.DisplayNames`) `component-engineer` (after T5a): copy changes from the spec: `playSelection` "Listen to selected text", `noVoice` names `{language}` and the next step, `speechError` adds "Try again.", `unsupported` "This browser…", new key `positionPaused`; all 6 locales
- [x] T2 `component-engineer`: core `split-sentences`, `collect-text` + tests (node + browser-mode where the DOM is needed)
- [x] T3 `component-engineer`: core `create-speech-engine`, `create-read-aloud` + tests with a fake engine; export from `core/src/index.ts` (no `window` at import, rule 3)
- [x] T4 `component-engineer`: i18n `readAloud` in 6 locales + `vp run i18n:check` (green; `position` is a function `({current,total}, format)`; fi, nb, nn and se are drafts, se `unsupported` uses a doubtful word for "browser": native review pending, Q2)
- [x] T5 (54 tests green; split: T5a hook, parts, highlight, selection capture, docs; T5b `SelectionTrigger`, after T5a, same dir) `component-engineer`: react `useReadAloud`, compound parts, selection capture, highlight, `read-aloud.md`, `read-aloud.a11y.md`, tests: a named test per contract row, axe in every state (`unsupported`, `idle`, `playing`, `paused`, `selection`, error)
- [x] T6 (11 stories incl. Keyboard, RTL, ForcedColors, Narrow, a fake-engine fixture; passes axe in all 4 storybook projects) `component-engineer`: stories, fixture (fake engine), `Keyboard` story, RTL, forced colours, Docs page (storybook-docs skill)
- [x] T7 (theme.css §9k; `theme:check` green, 646 pairs, no new pairs or tokens; native-select rules extended with `.kv-read-aloud-select`; popup max width is a literal `20rem`) `component-engineer`: theme classes + `::highlight`, after T1; `vp run theme:check`
- [x] T10 `component-engineer`: docs note (read-aloud.md and the RealVoices story): how to get local voices on Linux (`speech-dispatcher`, `espeak-ng`), macOS and Windows, and that Chrome's network voices are off by default
- [ ] T8 `lead`: gates, `accessibility-reviewer`, changeset (`@kvirn-ui/core`, `react`, `i18n` minor), `docs/roadmap.md`, README row, `docs/architecture.md` mention that `speechSynthesis` is a browser API and Chrome network voices are filtered
- [ ] T9 AT matrix row (`pending`, never claimed): NVDA/JAWS/VoiceOver with the player present; TalkBack/VoiceOver iOS speech behaviour

Order: T1 ∥ T2 → T3 → T4 ∥ T5 (needs T3, T4) → T6 → T7 → T8. Parallel briefs never share a file: T2/T3 own `core/src/read-aloud/*` and the index line (T3 only); T4 owns `i18n`; T5 owns `react/src/read-aloud/*`.

## Decisions

- **D1 Where:** a `read-aloud` module in `core` + `react`, not a new package. No new dependency, no new sanctioned import: `speechSynthesis`, `Intl.Segmenter` and the CSS Custom Highlight API are browser built-ins, reached through `Env` so core stays pure. Chosen over a new package because the layering in `docs/architecture.md` already fits.
- **D2 Voices (maintainer, 2026-10-07):** local voices only by default (`localService === true`), so text never leaves the device (rule 7, GDPR). `allowRemoteVoices` exists as an explicit opt-in for the consumer, documented with the privacy consequence; the docs site does not enable it.
- **D3 Engine:** a small `ReadAloudEngine` interface (`speak`, `cancel`, `getVoices`, `onVoicesChanged`, `isSupported`). Needed anyway to test without sound; kept public and "advanced" so a self-hosted TTS can come later. The maintainer chose the browser engine and did not choose the adapter option, so v1 ships no second engine and the interface is flagged unstable in the docs.
- **D4 Pause:** cancel and restart the current sentence instead of `speechSynthesis.pause()`, which is unreliable on Android and some voices. Documented trade-off.
- **D5 Scope (maintainer, 2026-10-07):** player + selection. Word highlight, saved settings, multi-region and click-to-read are separate plans.
- **D6 Silent by design:** no live announcements for normal playback (the speech is the output; a live region would collide with it and with a screen reader). Errors announce.
- **D7 Capture selection:** keyboard users reach the selection through `Play`, so the floating trigger is a convenience only (no keyboard-only dead end).
- **D9 DOM test location (T2):** no core project runs DOM tests (`node` covers core, `browser` covers react/testing/rich-text). Adding a project include is a gate change, so it is not done: `collect-text.test.ts` lives in `packages/react/src/read-aloud/` and imports the core helper. `collectText` collapses whitespace to single spaces (offsets map per character), treats a change of the nearest non-inline ancestor as a block boundary, and hard-cuts only a single word longer than `maxLength`.
- **D10 Machine details (T3):** `play({ text, source, language? })` takes the language, else `getLanguage()`, else `en`. `setRate` ignores values outside `readAloudRates` (0.75 · 1 · 1.25 · 1.5 · 2). `next` on the last chunk ends the reading; `previous` at index 0 while playing restarts that chunk. `createSpeechEngine.speak` with a voice URI that isn't allowed (remote while `allowRemoteVoices` is off) calls `onError` and speaks nothing. A speech error clears `chunks` and sets `error: 'speech-error'`.
- **D11 From the ux spec (lead's calls):** (a) `unsupported` renders only Root and Status, no disabled controls. (b) Voice select only when the language has two or more voices. (c) Starting a selection read copies the range, then collapses the user's selection so the highlight shows. (d) Play keeps one width in CSS (`min-inline-size`), not with hidden extra labels in the markup. (e) Player is in the page flow after the h1, never sticky; Root is `data-kv-read-aloud-skip` so its own words aren't read. (f) The reworded copy and `positionPaused` are T4b. (g) Contrast pairs for the highlight inside Alerts: T7 adds them only if `theme:check` already models those surfaces. (h) A pause control that stays in reach on long pages: a later plan, noted not built.
- **D12 React details (T5a):** the machine is created in an effect (no `env` during SSR/hydration), with an idle placeholder state before. `collect-range-text.ts` maps highlight offsets for a cloned selection range (core `collectText` takes an element only) and mirrors its skip rules. `unsupported` is shown but not announced (no Play to attach it to). Rate and Voice are plain `<label htmlFor>` + `<select>` (Field didn't fit). Escape stops (preventDefault) only while playing or paused. A paused Play with a captured selection plays the selection, otherwise resumes.
- **D13 Language per sentence (review fix):** `collectText` returns `languageRuns` (nearest non-empty `[lang]` up to the root); chunks never span a run edge and carry `language`; each chunk is spoken with a voice for its own language, never another (primary-subtag match, case-insensitive). A chosen voice of another language is ignored. A chunk with no voice stops reading with `no-voice` and `errorLanguage`, announced once. An inner `lang` attribute beats the `lang` option; the option beats the content element's own `lang` and is the default for unmarked text. Only content-language chunks update `state.voiceURI`. Known edge: with the option set, an inner run of the same language as the content element's merges with it and is dropped (falls back to the option language); fixing it needs core to flag the root run.
- **D14 Privacy and feature checks:** `createSpeechEngine.speak` refuses `voiceURI: null` unless `allowRemoteVoices` (the browser default voice may be remote). The engine is recreated when `allowRemoteVoices` changes (a bug where the new engine read the old value is fixed, with a regression test). Dev-only `warnOnce` warnings (never in production, no telemetry): unsupported, no usable voice (raw vs offered counts, `allowRemoteVoices` and `speech-dispatcher`/`espeak-ng` hints), no voice for a language. Nothing logs on the happy path. `ReadAloudEngine.getAllVoiceCount?` is optional. Found by the maintainer: Chrome on Linux has only remote Google voices (none for sv, fi or nb) and Brave has none, so local-only means silence there until `espeak-ng` is installed: the docs must say so (open task T10).
- **D6 status (open):** silent playback is the lead's call and an accessibility trade-off (4.1.3), so it needs the maintainer's approval, which has **not** been given. Status is `role="status"` with `aria-live="off"` (findable, silent) provisionally. Reviewer: errors announce, nothing else does.
- **Q1 status:** reviewer ruled SelectionTrigger (pointer-only, exposed, `tabindex="-1"`, Play as keyboard path) APPROVE; the maintainer's confirmation is still open. The draft contract text above ("not in the Tab order … aria-hidden") is superseded by that: the trigger is exposed with a name.
- **D8 Pure DOM-free text:** highlight uses a `Range` over the original text nodes, never wrapping words in `<span>`s, so markup, find-in-page and AT are untouched.

## Risks & open questions

- **Q1** `SelectionTrigger` as a non-focusable pointer button: is `aria-hidden` and no Tab stop acceptable, or must it be reachable (then it needs a keyboard way to appear)? Reviewer rules; the keyboard path via `Play` exists either way. Any a11y trade-off is the maintainer's call.
- **Q2** Northern Sami text needs a native check; fi, nb, nn quality is machine-draft level until reviewed.
- Voices may be absent in CI and on Linux (no `espeak`): all tests use the fake engine; real-engine behaviour is covered only by the manual matrix (T9).
- Chrome `localService` flag is not always accurate (Android); treat unknown as remote.
- iOS Safari needs the first `speak()` inside a user gesture: `play` must call `speak` synchronously from the click, before any `await`. A test asserts it.
- Highlight support (`CSS.highlights`) is missing in older Firefox: the Status text is the fallback and is tested.
- Reading hidden or decorative content: `collect-text` skip rules need tests for each; a table cell or list structure read as flowing text is acceptable in v1.

## Testing strategy

Per `testing` skill, each row once in the cheapest layer: sentence splitting, offsets, skip rules and the machine (state transitions, chunk advance, pause/resume, rate and voice change, language voice choice, local-only filter, cancel on destroy) in `core` with a fake engine; keys, names, states, axe, selection capture, highlight set and cleared, errors announced and nothing else announced, `play` calling `speak` synchronously, in browser mode. Stories run axe in every theme. No CSS assertions (rule 13): the contrast threshold of the highlight is a `theme:check` pair. No test makes sound.

## Rollout

Minor changeset for `core`, `react`, `i18n`. Status `alpha` in the roadmap with AT `pending`. No migration.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] `accessibility-reviewer` APPROVE
- [ ] Plan tasks ticked, `docs/roadmap.md` and `docs/plans/README.md` updated
