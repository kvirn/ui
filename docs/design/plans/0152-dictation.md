# Plan 0152: Dictation (speak a short query into a text field)

- **Status:** Approved (maintainer, 2026-10-23); work starts after the voice service's phase 2 spike meets its latency budget. Target: 1.2, with ReadAloud, behind the voice service's phase 2.
- **Owner:** lead (orchestrator) → component-engineer, accessibility-reviewer; user for the manual AT and usability checks
- **Created:** 2026-10-23 · **Target:** 1.2
- **Related:**
  - Design spec [`docs/design/dictation.md`](../dictation.md) (the draft contract, states, copy, layout).
  - [0151](0151-read-aloud-service.md) (the sister engine for read aloud).
  - Service: `kvirn-voice-provider/docs/plans/0002-phase-2-speech-input.md`; research: `kvirn-voice-provider/docs/reports/Nordic speech to text for search.md`.

## Goal

A visitor presses **Speak** next to a search field, says a short query, and sees it written in the field for review. It works in every current browser and sends audio only to the service the site configured, and only after the visitor has seen who receives it. Typing always works.

## Non-goals

- The Web Speech API (it sends audio to Google or Apple, Firefox stable lacks it, and no browser has a Nordic language on-device).
- Long dictation (textareas, forms), partial results, voice commands, language detection, in-browser recognition.
- Altering the transcript in any way (spec §7).
- Fields other than a single-line `<input>` in v1, though nothing prevents it later.

## Design

Spec: `docs/design/dictation.md`. Read it for the states (§6), the copy (§4, namespace `dictation`, 24 keys), the layout (§5) and the contract (§7). This plan adds the layers and the API.

### Layers

| Layer                   | Where                                         | What                                                                                                                                                                         |
| ----------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| core (pure at import)   | `packages/core/src/dictation/`                | `create-dictation.ts` (machine), `dictation-recorder.ts` (capture), `encode-wav.ts`, `detect-silence.ts`, `kvirn-transcriber.ts`, `dictation-transcriber.ts` (the interface) |
| react (private package) | `packages/dictation/` → `@kvirn-ui/dictation` | `useDictation`, `Dictation.Button`, `Dictation.Notice`, `Dictation.Status`; scaffolded like `packages/read-aloud`                                                            |
| i18n                    | `packages/i18n/src/*.ts`                      | `dictation` in every locale                                                                                                                                                  |
| theme                   | `packages/theme/theme.css`                    | `kv-dictation-notice`, `kv-dictation-status`, the listening fill on the group button, the container query to icon-only (all approved 2026-10-23)                             |
| stories                 | `apps/storybook/src/components/dictation/`    | every state, Keyboard, RTL, ForcedColors, Narrow; a fake recorder and a fake transcriber, so CI never records                                                                |

### API sketch

```tsx
const transcriber = kvirnTranscriber({ url: 'https://voice.kvirn.com', name: 'Kvirn' })

<Field.Root>
  <Field.Label>Search this site</Field.Label>
  <InputGroup.Root>
    <InputGroup.Input ref={inputRef} type="search" />
    <Dictation.Root inputRef={inputRef} transcriber={transcriber}>
      <Dictation.Button />
    </Dictation.Root>
  </InputGroup.Root>
  {/* Notice and Status render after the group via the same Root context: placement in T4 */}
</Field.Root>
```

```ts
interface DictationTranscriber {
  /** Languages it accepts (BCP 47). Speak is not rendered for others. */
  getLanguages: () => Promise<readonly string[]>
  transcribe: (audio: Blob, options: { language: string; signal: AbortSignal }) => Promise<string>
  /** Who receives the audio, named in the notice. */
  name?: string
}
```

- `useDictation({ inputRef, transcriber, language?, maxDuration = 10_000, silence = 2_000, messages })` returns `buttonProps`, `noticeProps`, `statusProps`, `continueProps`, `undoProps` and `state` (api-conventions). `language` defaults to the input's resolved `lang`, then the provider's.
- **Capture** is built in, not pluggable in v1: `getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })` → an AudioWorklet → 16 kHz mono PCM → a WAV `Blob`.
  - That is 320 KB for 10 s, under the service's 1 MB cap.
  - Every browser plays it, and it needs no codec and no dependency.
  - The worklet's source is a string, loaded from a `Blob` URL at call time (rule 3).
- **Silence:** an RMS energy threshold with a hangover in the worklet, after speech has started. No Silero (D3).
- Writing to the field uses the native value setter and dispatches `input`, so controlled React inputs and form libraries see the change. Undo restores the previous value the same way.

### Accessibility contract (draft)

The spec's §7 is the contract. Keyboard (`keyboard` skill; every row gets a named test in `dictation.test.tsx`):

| Key             | Action                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | input → Clear → Speak/Stop → (notice) Start speaking → Cancel → (done) Continue speaking → Undo          |
| Enter, Space    | Activate the focused button (native)                                                                     |
| Escape          | While listening: cancel, send nothing, focus stays on Speak. With the notice open: close it, focus Speak |

- **Roles / ARIA:**
  - Native buttons.
  - Speak/Stop is `aria-labelledby` [its own text, the field label], with no `aria-pressed`.
  - `aria-expanded` on Speak while the notice is open, and `aria-disabled` while working.
- **Announcements:** one polite Announcer.
  - `listeningShort` on every start (required row).
  - `working` once.
  - The result says the text (`doneAnnounce`, `doneAtLimit`, `donePaused`).
  - Errors are announced in words.
- **Never altered:** the field gets the service's text exactly, plus only the joining space of a Continue.
- **Known limit:** the Announcer has no per-message `lang`.
- **Pending human checks:** screen reader speech picked up by the mic; Voice Control matching the name; the 2 s pause; focus after a result (spec §9 Open 1–4). Agents never write or claim them.

## Tasks

- [ ] T1 `component-engineer`: core `dictation-transcriber`, `kvirn-transcriber` (POST `/v1/transcribe`, `lang`, abort, 8 s timeout, `GET /health` for the languages), `encode-wav`, `detect-silence` + node tests.
- [ ] T2 `component-engineer`: core `dictation-recorder` (AudioWorklet capture, cap, silence, cancel, track stop on every exit) + browser-mode tests with Chromium's fake audio device. Then `create-dictation` (the §6 states, replace vs append, undo, notice once per page load) + node tests with a fake recorder and transcriber.
- [ ] T3 `component-engineer`: i18n `dictation` in every locale + `vp run i18n:check`. fi, nb and nn are drafts, marked for a native check.
- [ ] T4 `component-engineer`: `packages/dictation` (scaffold from `packages/read-aloud`), `useDictation`, the parts, `dictation.test.tsx` (every keyboard row, ARIA state and announcement, axe), `dictation.a11y.md`, `dictation.md`.
- [ ] T5 `component-engineer`: theme classes (theme-css skill; `theme:check`), and stories with every state, Keyboard, RTL, ForcedColors and Narrow (the icon-only mic). Add to `sweepComponents`.
- [ ] T6 `component-engineer`: docs.
  - The rule 7 line for dictation on the docs site, only after Start speaking (D6).
  - The `regulations` skill and `docs/compliance.md`.
  - `architecture.md` names `kvirnTranscriber`.
  - The smoke test checks that `/health` lists the asr languages.
- [ ] T7 `lead`: gates, `accessibility-reviewer` on the diff, roadmap line, tick the plan.
- [ ] T8 `user`: the usability test (spec §8) and the manual AT checks before beta.

T1 and T3 can run in parallel. T2 comes after T1, T4 after T2 and T3, and T5 and T6 after T4. T4 needs the voice service's staging URL only for the docs example, not for tests.

## Decisions

- **D1 Package `@kvirn-ui/dictation`, private until 1.2; the machine in core** (maintainer, 2026-10-23).
- **D2 Spec decisions** (maintainer and accessibility review, 2026-10-23): the icon-only mic below 20rem; the notice on the first press of each page load; the new classes and the listening fill; Continue speaking for 2.2.1; the transcript never altered. All of these are recorded in the spec's §9.
- **D3 Silence by an energy threshold, no Silero VAD** (lead). Silero would bring onnxruntime-web, a new dependency of several MB. The service runs its own VAD anyway (0002). Revisit if T8 shows cut-offs.
- **D4 Capture PCM to WAV in the browser, no `MediaRecorder`** (lead). It is the same in every browser, needs no format sniffing or codec, and is small enough at 10 s. Risk: a strict CSP that blocks `blob:` worklets (see risks).
- **D5 `kvirnTranscriber` names no URL** and follows `kvirnGeocoder` (`url`, `name`). Nothing is sent before Start speaking.
- **D6 Rule 7 for dictation** (maintainer, 2026-10-23): the docs site and Storybook may send a visitor's recorded voice to voice.kvirn.com, only after Start speaking. It lands with T6, with AGENTS.md, the `regulations` skill and the privacy page.
- **D7 Start after the phase 2 spike** (maintainer, 2026-10-23): no task starts until `kvirn-voice-provider` 0002 T2 records the engines and the latency budget.

## Risks & open questions

- **CSP.** A site whose CSP blocks `blob:` in `worklet-src`/`script-src` can't load the worklet. Fallback options: a consumer-hosted worklet URL option, or `ScriptProcessorNode` (deprecated). T2 picks one, after reading current browser docs.
- **The service isn't built yet** (0002 spike first). The library is tested with fakes, so only the live docs example waits for it.
- **Safari:** that `getUserMedia` must run inside the press is checked in T2. iOS Home Screen apps prompt for the microphone every visit (WebKit 215884); this goes in the docs.
- Spec §9 Open 1–4 are human checks (T8). Open 5 (the notice wording, children, personal identity numbers) is for counsel, before launch.

## Testing strategy

Each row is proved once, in the cheapest layer (`testing` skill):

- **node:** the machine, WAV encoding, silence detection and the transcriber.
- **Chromium browser mode:** capture, the keyboard rows, ARIA, announcements and axe.
- **storybook projects:** every state in every theme.

No test speaks to the live service; the smoke project only checks `/health`.

## Rollout

Private until 1.2, then minor changesets for `core`, `i18n`, `theme` and `@kvirn-ui/dictation`. AT status `pending` in the roadmap.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` updated
