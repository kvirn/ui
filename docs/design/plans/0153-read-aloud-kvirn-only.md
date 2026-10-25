# Plan 0153: ReadAloud on the Kvirn voice service only

- **Status:** In progress · **Owner:** lead → component-engineer, ux-designer, accessibility-reviewer
- **Created:** 2026-10-25 · **Target:** 1.2
- **Related:** [0088](0088-read-aloud.md) (the player; this plan changes its engine and D4), [0151](0151-read-aloud-service.md) (the service and `kvirnSpeechEngine`; this plan supersedes its "second engine" design), spec `docs/design/read-aloud.md`

## Goal

ReadAloud speaks with **one engine: Kvirn's own voice service**. The browser's `speechSynthesis` and every
remote third-party voice are removed. A resident hears the same natural Nordic voice in every browser and
OS, from an EU host that stores no text and sets no cookies.

## Non-goals

- Languages beyond **sv, nb, en**. fi and nn have no voice and must degrade honestly (0151 §Gaps).
- Word-level highlighting, PDF reading, MP3 download, API keys (0151 Non-goals stand).
- A browser-voice fallback of any kind (D1).
- Full test coverage in pass one (D5): the MVP is proved first, then tests and the review.

## Background

- **The service is live and verified** (2026-10-25, dev edge `http://localhost:8080`):
  `GET /health` → `{"languages":["sv","nb","en"]}`; `GET /v1/voices` → 4 voices; `POST /v1/speech` → 200
  `audio/mpeg`, 15 987 bytes for one Swedish sentence, `cache-control: no-store`, `x-kvirn-cached: off`,
  CORS `Access-Control-Allow-Origin` echoed for any `localhost:<port>`. The edge is the only CORS host, so
  the library points at `:8080`, never `:4000`.
- **Voices** (`lang` is mixed granularity, so matching must handle both): `sv_SE-male-0-medium` (`sv`),
  `nb_NO-male-0-medium` (`nb`), `en_GB-female-0-high` (`en-GB`), `en_US-female-0-high` (`en-US`).
- **Bounds:** 300 graphemes _and_ 1 200 bytes raw per request. Our `maxChunkLength` of 200 stays inside both.
- **No streaming.** One sentence per request, so time-to-first-audio _is_ synthesis time. Only prefetching
  sentence N+1 while N plays makes it feel instant (0151 D6).
- **Error shapes verified live, correcting the README** (2026-10-25): a missing `voice` returns
  `unknown_voice`, not `invalid_request`; the nginx edge can answer **before the app with an HTML body**, so
  parsing must tolerate a non-JSON error body and fall back to the HTTP status; content type is
  `application/problem+json; charset=utf-8` (match on a prefix).
- **The existing library code** is a good base and mostly survives: `createReadAloud`
  (`packages/core/src/read-aloud/create-read-aloud.ts`, 302 lines) is pure and engine-injected,
  `splitSentences` and `collectText` are engine-agnostic, and `packages/read-aloud` (670-line hook + 10 parts)
  already ships the player, its contract and a docs page.
- **The mismatch to fix:** today's `ReadAloudEngine` is **synchronous** — `getVoices()` returns an array and
  `speak()` "must start speaking before it returns" for iOS. The service is **asynchronous**. Resolving that
  is the heart of this plan (D2, D3).

## Design

### The iOS unlock, and why the interface can go async

`speak()` was synchronous only to satisfy iOS, which allows `play()` only inside a user gesture. With one
reused `HTMLAudioElement` **unlocked once inside the Play gesture** (`play()` then `pause()` on a silent
source), later `src` swaps play without a gesture. So `unlock()` is the only call that must be synchronous.

### API sketch

```ts
// @kvirn-ui/core — the shipped shape is packages/core/src/read-aloud/read-aloud-engine.ts (the code is truth)
interface ReadAloudEngine {
  unlock: () => void                                  // synchronous, inside the gesture: the iOS unlock
  getDefaultVoiceId: (language: string) => string | undefined   // synchronous, no network (D14/D15)
  getVoices: (signal) => Promise<readonly ReadAloudVoice[]>     // only a Voice picker needs this
  load: (utterance, signal) => Promise<SpeechHandle>  // prefetch calls it for N+1
  speak, pause, resume, cancel, setRate, destroy
}
kvirnSpeechEngine({ url, name?, store?, timeout?, voices? })
// voices is the language→voice-id map, resolved over the engine's default map (D15)
```

`@kvirn-ui/read-aloud`'s part names and `useReadAloud` options are unchanged except that `engine` is now
required and `allowRemoteVoices` is gone (D4).

### State machine

Final shape: `status: 'idle' | 'preparing' | 'playing' | 'paused'` (`'unsupported'` is gone — support is a
network call); `error: 'no-voice' | 'speech-error' | 'service-unavailable' | 'service-busy' | 'text-too-long'`;
`voiceId` (was `voiceURI`); plus `voicesStatus`, `hasVoice` and `skippedCount`.

- **`preparing`** is on the critical path of every first press, since there is no streaming.
- **Pause really pauses** mid-sentence (`audio.pause()`), where `speechSynthesis.pause()` was unreliable. 0088
  D4 (restart the sentence) is retired.

`no-voice`'s cause changes: the **service** has no voice for the content's language (fi, nn), not the
browser. We never read Finnish with a Swedish voice.

### Error mapping

| HTTP / `type`                                                        | `error`               | Behaviour                                                                  |
| -------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------- |
| `text_too_long`, `normalised_text_too_long`                          | `text-too-long`       | Skip the chunk, carry on, and surface `partSkipped` (D10). Never silently. |
| `unknown_voice`                                                      | `no-voice`            | Stop; the picker falls back to the default for the language.               |
| `synth_busy`, `queue_full`                                           | `service-busy`        | Honour `Retry-After`, retry once, then stop.                               |
| `synth_unavailable`, `synth_timeout`, `synth_error`, network failure | `service-unavailable` | Stop and say so.                                                           |

### Accessibility contract (draft)

0088's roles, names, keyboard and focus behaviour stand. This plan changes:

- **Preparing (4.1.3):** Play becomes busy while the first sentence is fetched. The status text changes, and
  it is the _existing_ polite status region that carries it — no new live region, and never one announcement
  per sentence. Mid-sentence buffering must **not** announce (it would narrate every gap).
- **Errors (3.3.1):** each `error` above has copy in all 5 locales that says what happened and what to do.
  Playback stops; nothing fails silently.
- **Language (3.1.2):** each chunk's language picks a voice of that language; `en` matches `en-GB`/`en-US`.
  No voice for the language → `no-voice`, and the control says so rather than reading it wrong.
- **Audio Control (1.4.2) / Pause Stop Hide (2.2.2):** nothing auto-plays; Pause and Stop stay reachable
  during `preparing`, so a slow service can always be cancelled.
- **SCs:** 1.4.2, 2.1.1, 2.2.2, 2.5.8, 3.1.2, 3.3.1, 4.1.3.

### i18n strings (all 5 locales: en, fi, nb, nn, sv)

Retire `unsupported` and `speechError`; rename `noVoice` → `errorNoVoice`; add `preparing`,
`errorServiceBusy`, `errorServiceUnavailable`, `errorPlayback`, `partSkipped`, `voicesLoading`, `note`,
`howItWorks`. Wording is §4 of `docs/design/read-aloud.md` (English approved; **fi/nb/nn need a native
review — mark it pending, never claim it done**).

### Theming surface

`data-status="preparing"` on Root and `data-busy` on Play, styled in **`packages/theme/read-aloud.css`** (the
player has its own file; `theme.css` only holds the shared recipes) with the
existing tokens. No new token, no new colour pair. Reduced motion: no spinner animation.

## Tasks

- [x] T1 `ux-designer`: market research; revised `docs/design/read-aloud.md` (rev 2) — states, copy, the
      privacy affordance, open questions. Its §9 is answered by D8–D11.
- [x] T2 `component-engineer` (core): new async `read-aloud-engine.ts`; `kvirn-speech-engine.ts`;
      `create-speech-engine.ts` deleted; `create-read-aloud.ts` for `preparing`, prefetch, real pause, async
      voices, the error map, `hasVoice` and `skippedCount`; `core/src/index.ts`. 45/45 green.
- [x] T3 `component-engineer` (react + i18n): the hook and parts for the new state and `data-*`;
      `allowRemoteVoices` dropped; the new `Note` part; 8 keys × 5 locales.
- [x] T3b `component-engineer` (theme): `read-aloud.css` — preparing spinner, one error treatment,
      `kv-read-aloud-note`, 320px rows, and `::highlight(kv-read-aloud)` per D12. No new token.
- [x] T4a `component-engineer`: Storybook fixture + stories on a fake engine (CI never speaks). 13
      stories, 4 themes green.
- [x] T4b `component-engineer`: the docs page, examples and API table. `apps/docs/lib/voice-service-url.ts`
      resolves `NEXT_PUBLIC_KVIRN_VOICE_URL`, default `http://localhost:8080`; `.env.example` documents it.
      Example composition Play/Previous/Next/Stop/Rate/Status/Note, `howItWorksHref="/privacy#voice"`.
- [x] T4c `component-engineer`: D13 + D14 + D15 — the provider `readAloud` config, the memoised engine, the
      hook's resolution order, the synchronous `getDefaultVoiceId`, the content-language-not-locale fix, and
      the `content lang → provider locale → 'en'` fallback chain.
- [x] T4d (folded into T4c): `read-aloud.a11y.md`, `read-aloud.md` and the package `description`.
- [x] T5 `component-engineer` (compliance): rule 7, the `regulations` skill, `docs/compliance.md`,
      `docs/architecture.md`, the privacy page; `tooling/geo-smoke/voice.smoke.ts` reads `KVIRN_VOICE_URL`
      and skips when unset (6 passed, 2 skipped).
- [ ] T6 **user**: listen to the MVP in the docs site and approve it.
- [ ] T7 `component-engineer`: the full suite — contract rows, axe in every story state, every error-map row,
      and the `Retry-After` retry (a `queue_full` then `200` succeeds; two end in `service-busy`).
- [ ] T8 `lead`: gates, `accessibility-reviewer` on the diff, `docs/roadmap.md`, tick 0088/0151, commit.

## Decisions

- **D1 No fallback engine (maintainer, 2026-10-25).** `createSpeechEngine` and the browser voice path are
  deleted. One engine means one voice per language on every OS; a silent switch to a robotic OS voice
  mid-article is worse than an honest error. Offline, the player says the service is unavailable.
- **D2 The engine interface goes async (lead, 2026-10-25).** Only `unlock()` stays synchronous, because only
  the iOS gesture needs it. `getVoices` and `load` return promises and take an `AbortSignal`.
- **D3 Prefetch N+1 in the machine, not the engine (lead, 2026-10-25).** The machine knows the chunk order,
  so it owns the lookahead and the engine stays a dumb fetch-and-play. Keeps `core` testable with a fake.
- **D4 `allowRemoteVoices` is removed (maintainer, 2026-10-25).** Passing `url` and `name` to
  `kvirnSpeechEngine` _is_ the opt-in, exactly as `kvirnGeocoder` works, and `name` is the recipient named in
  the privacy notice. A flag with no second path to opt out to is ceremony. **Breaking**, and 0088 D14 is retired.
- **D5 MVP before tests (maintainer, 2026-10-25).** Pass one ships types-green and demonstrably working;
  existing tests are updated only enough to pass. T7 restores full coverage, T8 the review. A deliberate,
  time-boxed reordering, **not** a weakened gate: nothing is disabled and nothing is done until T7 and T8 pass.
- **D6 Storybook fakes, docs site talks to the real service (maintainer, 2026-10-25).** Stories inject a
  canned engine so CI never touches the network. The docs site reads `NEXT_PUBLIC_KVIRN_VOICE_URL`
  (default `http://localhost:8080`) and shows the unavailable state when nothing answers.
- **D7 Real pause replaces restart-the-sentence (lead, 2026-10-25).** `audio.pause()` is reliable, so 0088 D4
  (Listen restarts the sentence) is retired. Resume continues mid-sentence.

- **D8 Full transport, no voice picker (maintainer, 2026-10-25).** The default composition is Play/Pause,
  Previous, Next, Stop, Speed, Status and Note — what residents already know from webReader. The `Voice` part
  stays exported but is **not** in the recommended composition for v1: the voice list arrives only after the
  first press, so a select appearing mid-task shifts the layout, and only English has two voices.
- **D9 No voice for the page's language → render nothing (maintainer, 2026-10-25).** The hook exposes
  `hasVoice: boolean | null` (`null` while voices are unknown — idle, loading or errored) and the Root renders
  nothing only once it is `false`, so fi and nn pages get no player rather than a Listen button that errors on
  press. The consumer decides whether to say anything. (The original
  "appears then vanishes" limitation is **retired by D14**: `hasVoice` now resolves synchronously.)
- **D10 A skipped part is skipped, read on, and shown (maintainer, 2026-10-25).** An inline language with no
  voice or a chunk the service refuses does not stop the read, and is not silent either: `partSkipped` says so.
  Silently dropping a sentence a resident needed is a 3.3.1 defect; stopping the whole read for one bad chunk
  is a worse trade on a long page. Supersedes this plan's original "skip silently" error-map row.
- **D11 The privacy Note is a default part (maintainer, 2026-10-25).** Help text names the recipient and says
  nothing is stored, with a `howItWorks` link. **No consent gate, no checkbox, no dialog in front of Listen** —
  it would stop exactly the readers who need this most, and nothing leaves the browser before the press.
  `name` is strongly recommended in the docs, and still defaults to the URL's host as `kvirnGeocoder` does.
- **D12 The sentence highlight ships; its build warnings are accepted (maintainer, 2026-10-25).** The CSS
  Custom Highlight API is allowed, so `::highlight(kv-read-aloud)` lands in `packages/theme/read-aloud.css`
  with `primary`/`on-primary` and a forced-colours mapping. lightningcss 1.33.0 warns on the unrecognised
  pseudo-element; **that noise is expected and must not be suppressed** (rule 1). Retires 0088's highlight
  blocker. The hook half already worked, feature-detected; without the API, Status is the position cue.
- **D13 Config reaches ReadAloud through a provider config object (maintainer, 2026-10-25).**
  `<KvirnProvider readAloud={{ url, name, store, timeout, voices }}>`; the provider builds and **memoises** one
  engine, so the single unlocked `<audio>` element is shared by every player in the tree. Resolution order is
  **hook option → provider `readAloud` → nothing** (no player, plus a dev warning). For standalone use the hook
  takes the same options directly (`useReadAloud({ contentRef, url })`) or a whole custom `engine` — so
  `@kvirn-ui/read-aloud` needs no provider, which is what the Storybook fake and any non-KvirnUI consumer use.
- **D14 The default voice per language lives in `kvirnSpeechEngine` (maintainer, 2026-10-25).** The engine
  knows its own service, so `ReadAloudEngine` gains a **synchronous** `getDefaultVoiceId(language)` over the
  four known ids. **This retires D9's known limitation:** `hasVoice` now resolves on first render with no
  network call, so an fi or nn page renders no player immediately instead of showing one that then vanishes.
  `getVoices()` stays async and is needed only for a Voice picker. A `voices` option overrides the map per
  language, and a consumer injecting another engine brings its own.
- **D15 The voice follows the content's language; `voices` is a map (maintainer, 2026-10-25).** Refines
  D13/D14. `readAloud.voices` **is** the language→voice-id map, resolved over the engine's default map — not a
  patch on hidden defaults. The voice is picked from the **content's** declared `lang`, **never** from
  `KvirnProvider locale`, which is the _UI_ language: the two differ in practice (a Finnish municipality runs a
  Finnish UI around Swedish content), and letting `locale` win would both strip that site's player and read
  Swedish aloud with an English voice — a 3.1.2 failure. The provider's `locale` is used only as the
  **fallback when content declares no language** (`content lang → provider locale → 'en'`), replacing a
  hard-coded `'en'` that read a Swedish page in English. `hasVoice` stays public and is one sync lookup.

## Risks & open questions

- **voice.kvirn.com is not deployed.** The docs site defaults to a localhost URL, so a public visitor sees the
  unavailable state until the host ships. T5's smoke test stays skipped until then. The env var is the switch.
- **The iOS unlock is unverified on a real device** (the service repo says the same about its MP3s). If the
  reused element fails there, 0151's signed-GET fallback reopens, and with it D7 of that plan.
- **Latency is unmeasured from a browser.** If the first sentence regularly takes seconds, the `preparing`
  state carries the whole experience and T1's design of it decides whether this is usable.
- **Chunking vs. the service's bounds.** 200 chars is inside 300 graphemes for Latin text, but the normaliser
  expands heavily (a personnummer becomes ~48 characters). `text-too-long` must degrade, never crash.

## Testing strategy

- **Pass one, gates run 2026-10-25 (lead), all four green:** `vp check` 0 errors / 1 deliberate warning (the
  announce-once effect's `exhaustive-deps`, commented); `vp test run` on core, i18n, react, read-aloud and
  storybook → **13 198 passed, 11 failed, none touching ReadAloud** (Combobox click timeout, Map
  reflow/text-spacing, two browser-connection drops, and dynamic-import failures in the `storybook-reflow` and
  `storybook-text-spacing` projects — **all in files unmodified by this plan**, and `read-aloud` is not in
  `sweepComponents`, so it is not swept); `i18n:check` 506 keys × 5 locales; `theme:check` 690 pairs × 4 themes.
  One red turned green: the docs-props tooling caught `readAloud`, `url`/`store`/`timeout`/`voices` and
  `voices` missing from the API tables (T4b wrote them before T4c added the options) — rows added.
- **Pass two (T7):** browser-mode tests with a fake `fetch` and `Audio` — request shape, voice matching
  including `en`→`en-GB`, prefetch, cancel, rate, the unlock order, every error-map row, and that nothing is
  sent before Play. Stories cover every state in every theme with axe.
- **Live:** the `smoke` project only, never part of `vp run test`.

## Rollout

1.2, with 0088 and 0151. Breaking for anyone on the 0088 alpha: `createSpeechEngine` and `allowRemoteVoices`
are gone and `voiceURI` is `voiceId`. No migration shim — the package is private and pre-alpha.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] The user has heard it work in the docs site (T6)
- [ ] `accessibility-reviewer` returns APPROVE; plan tasks ticked; `docs/roadmap.md` updated
