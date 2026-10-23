# Plan 0151: Kvirn read-aloud service (voice.kvirn.com) and its engine

- **Status:** Approved (maintainer, 2026-10-23). The service is phase 1 of `kvirn-voice-provider` (spike first); this plan is the KvirnUI side.
- **Owner:** lead (orchestrator) → component-engineer, ux-designer, accessibility-reviewer; user for the repo, the server and the listening panel
- **Created:** 2026-10-23 · **Target:** 1.2, with ReadAloud (Plan 0088)
- **Related:** [0088](0088-read-aloud.md) (the player and its `ReadAloudEngine`), [0150](0150-geocoder-country-and-smoke-tests.md) (smoke tests for geo.kvirn.com), research report `kvirn-voice-provider/docs/reports/Nordic TTS engines for read aloud.md` (2026-10-23), `kvirn-map-provider` (the stack copied)

## Goal

A public-sector site can offer **Listen** with the same natural Nordic voice in every browser and OS. It works where the browser has no voice for the language (Firefox on Linux, many Android phones). The voice comes from a Kvirn-run, EU-hosted service that keeps no text and sets no cookies. This is the open, self-hostable alternative to ReadSpeaker webReader and Texthelp ReachDeck (which Funka's "talande webb" appears to use).

## Non-goals

- v1 languages beyond **sv, nb, en**: fi, nn, Finland-Swedish, se, da and is are separate workstreams (§Gaps).
- Word highlighting. The player already highlights the current sentence (0088). Word timings from Piper's experimental alignments are a later step, and only if the evaluation shows they track the audio.
- PDF or document reading, translation, a dictionary, MP3 download, API keys and billing (all later).
- Shipping the engine to customers: no on-prem image in v1 (§D3, GPL).
- Voices with an unclear licence or a research-only lineage, even if they sound better (maintainer, 2026-10-23).

## Background

- **Research (2026-10-23):** Piper (`OHF-Voice/piper1-gpl` v1.8.0, 2026-09-04, GPL-3.0-or-later, embeds espeak-ng) is the only open engine that passes all four filters: commercial-use licence, Nordic coverage, CPU-only and per-sentence streaming. Chatterbox Multilingual (MIT) skips and repeats words. Supertonic 3 has no Norwegian and its repo is archived. MMS, XTTS, F5, Fish and Voxtral are non-commercial. The Azure TTS container needs x86 AVX2 and calls Azure for billing.
- **Voices cleared for v1 (CC0 or public domain, per the model cards):** sv `nst` medium, nb `nvcc` medium, en_GB `cori` high or en_US `ljspeech` high. **Not cleared:**
  - fi `harri`, nb/da `talesyntese` and sv `lisa` come from Lessac (licence says research only) or Ryan (CC BY-NC).
  - The `nst` cards disagree (CC0 vs CC BY 4.0). Either allows our use; T1 checks the source, and we credit it in `/v1/voices` either way.
- **Unmeasured:** no Piper speed figure on arm64 (only a stale Pi 4 table: RTF about 0.35 on 4 threads), and no published listening test for any Nordic Piper voice. T1 measures both.
- **The stack copied** (`kvirn-map-provider`):
  - Elixir 1.18 / OTP 27, Phoenix 1.8 on Bandit, Docker Compose.
  - nginx 1.27 edge as the only public host: TLS via certbot, CORS allow-list, rate limits keyed on an IP prefix, no IP or query in the logs.
  - Hetzner CAX in Helsinki, deployed by git tag over ssh, no cookies.
  - Its gaps carry over: no CI, no backups, no metrics, no log rotation.
- **The library side exists:**
  - `ReadAloudEngine` (`packages/core/src/read-aloud/read-aloud-engine.ts:28`) has `speak`, `cancel`, `getVoices`, `onVoicesChanged` and `isSupported`. Voices carry `localService`.
  - 0088 D14 already refuses a non-local voice unless `allowRemoteVoices`.
  - The precedent for a Kvirn service factory is `kvirnGeocoder({ url, name })` (`packages/map/src/kvirn.ts:10-79`): the consumer passes the URL and the library names none.

## Design

### Service (repo `kvirn-voice-provider`, host `voice.kvirn.com`)

Owned by that repo: `kvirn-voice-provider/docs/plan.md` (architecture, API, privacy) and `docs/plans/0001-phase-1-read-aloud.md` (spike, build, exit gate). What this plan relies on:

- `GET /v1/voices` returns `[{ id, lang, name, quality, licence, attribution }]`.
- `POST /v1/speech` takes `{ text, voice, store }` (at most 300 chars, in the body, never the URL) and returns one sentence as `audio/mpeg`.
- `GET /health` lists the languages, for the smoke test.
- `store` defaults to `false`. No cookies, and no IP or text in logs.

### Library (`kvirn-ui`)

```ts
const engine = kvirnSpeechEngine({ url: 'https://voice.kvirn.com', name: 'Kvirn', store: true })
const reader = useReadAloud({ contentRef, engine, allowRemoteVoices: true })
```

- `kvirnSpeechEngine` lives in `packages/core/src/read-aloud/kvirn-voice-provider-engine.ts`. It touches no `window` at import (rule 3); `fetch` and `Audio` are used only at call time.
- Voices are `localService: false`, so 0088 D14 applies: nothing is sent until the consumer sets `allowRemoteVoices` and the reader presses Play. `name` is the recipient named in the privacy notice, as in `kvirnGeocoder`.
- **One reused `HTMLAudioElement`, unlocked inside the Play gesture.** iOS allows `play()` only in a gesture, and `speak` must start before it returns (`read-aloud-engine.ts:35`). The next sentence is fetched while the current one plays.
- **Rate:** `audio.playbackRate` with `preservesPitch`, so one cached file per sentence serves every rate.
- **Errors:** a failed request or a failed decode calls `onError`. The existing `speech-error` status (0088) covers it, so no new string is needed unless T4 asks for a loading state.

### Accessibility contract (draft)

No keyboard, role or focus change: 0088's contract stands. This plan adds:

- **Loading:** time to first audio is expected to stay under 1 s (to be measured in T1). Whether Play needs a visible and announced "loading" state is T4's question. A new string would go into all 6 locales.
- **Failure:** service unreachable, a timeout (8 s) or a bad response all end in `speech-error`, announced as 0088 does. Playback stops and nothing fails silently.
- **Language (3.1.2):** each chunk's language picks a voice of that language. With no voice for the language (fi in v1), the existing `no-voice` status applies. We never read Finnish with a Swedish voice.
- **Pause, Stop, Hide (2.2.2):** unchanged.
- **WCAG SCs:** 1.4.2, 2.1.1, 2.2.2, 3.1.2 and 4.1.3, as in 0088.

## Gaps (separate workstreams, not v1)

| Language          | State (2026-10-23)                                                                      | Options                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| fi                | Only `harri`, which is Lessac- or Ryan-derived                                          | Train Piper from scratch on CSS10 Finnish (CC0); or license Acapela/ReadSpeaker on-prem           |
| nn                | No open voice, and espeak-ng has no `nn`                                                | License CereProc "Hulda"; ask NB AI-lab; record 15–20 h and fine-tune (estimate)                  |
| sv-FI             | No open voice                                                                           | License one (Acapela, ReadSpeaker); test whether `nst` is acceptable to Finland-Swedish listeners |
| se (and smj, sma) | Divvun has voices; no licence is stated                                                 | Ask UiT/Divvun for a hosted agreement                                                             |
| da, is            | Clean data exists (CoRal CC0; Talrómur CC BY 4.0); the Piper da voice is Lessac-derived | Later; the is voices need an attribution check                                                    |

## Tasks

- [ ] T0–T3, T7 (the service, its spike and the listening panel) live in `kvirn-voice-provider/docs/plans/0001-phase-1-read-aloud.md`. This plan starts T5 when that phase has a staging URL, and T2 there updates this plan.
- [ ] T4 `ux-designer`: does Play need a loading state; error copy when the service is down; how the docs example names the recipient. Updates the ReadAloud design spec.
- [ ] T5 `component-engineer` in `kvirn-ui` (after T3 has a staging URL): `kvirnSpeechEngine` + browser-mode tests with a fake `fetch` and `Audio`, covering request shape, voices, prefetch, cancel, rate, timeout → `onError`, and nothing sent before Play. Export from `core`.
- [ ] T6 `component-engineer` in `kvirn-ui`:
  - Rule 7 text in `AGENTS.md`, the `regulations` skill, `docs/compliance.md` and the docs-site privacy page.
  - A smoke test for `voice.kvirn.com` (HTTP 200, voices parse, each voice's `lang` is in the list).
  - The Storybook story and docs example on Play.
  - `architecture.md` names the factory.
- [ ] T8 `lead`: gates, `accessibility-reviewer` on the T5 + T6 diff, roadmap line, tick the plan.

## Decisions

- **D1 Server voices, not only the browser's (maintainer, 2026-10-23).** Browser voices are missing or differ per OS. MP3 from a server plays in every current browser.
- **D2 Its own repo, the map service's stack (maintainer, 2026-10-23).** The new repo is `kvirn-voice-provider` on Elixir/Phoenix, nginx, Compose and Hetzner Helsinki. It runs on its own host so speech never competes with the tile builds. Infra code is copied, not shared.
- **D3 Piper, server-only (maintainer, 2026-10-23, after the research).**
  - GPL-3.0 needs no source offer for a hosted service that never conveys a copy (GPLv3 §0). The `synth` container is a separate program and is never handed to customers.
  - Counsel has not reviewed this. Revisit before any on-prem offer.
- **D4 v1 = sv, nb, en, CC0 or public-domain voices only (maintainer, 2026-10-23).** The licence questions for other voices are deferred, not delegated to counsel.
- **D5 Rule 7 exception (maintainer, 2026-10-23).** The docs site and Storybook may send text to `voice.kvirn.com`, only after a visitor presses Play. Lands with T6, together with its docs.
- **D6 One sentence per request, MP3, client-side rate.** These keep caching simple and work in every browser. Streaming inside a sentence buys little at about 200 chars. Opus is smaller, but older Safari can't play it.
- **D7 Text in the POST body, no store by default.** URLs get logged, bodies don't. Under privacy by default (GDPR art. 25) the consumer opts in to caching for public text.
- **D8 The factory in `core`.** Like `createSpeechEngine`, it uses browser APIs only at call time. Its name follows `kvirnGeocoder`. `@kvirn-ui/read-aloud` stays React-only (0088).

## Risks & open questions

- **Quality is unmeasured.** If T1 or T7 fails for a voice, that language leaves v1. We don't switch to a voice that isn't cleared.
- **Piper's maintenance.** OHF is "looking for maintainers". We pin the version, and the sidecar API hides the engine, so sherpa-onnx or another engine can replace it.
- **The iOS audio unlock.** If T1 shows the reused element fails, fall back to `GET` with the text in a short-lived signed token. That fallback reopens D7.
- **Abuse and cost.** An open endpoint is a free TTS API. v1 has the CORS allow-list, rate limits and a 300-char cap. API keys come later, as in the map repo's phase 4.
- **The 0088 non-goal** "no second engine ships" changes with this plan (rule 10); 0088 is updated in the same change.

## Testing strategy

- **kvirn-ui:** `kvirnSpeechEngine` gets browser-mode unit tests with fakes, plus the smoke project for the live host only (never in `vp run test`). Stories use the fake engine, so CI never speaks. The live example is the docs site's.
- **kvirn-voice-provider:** its own conventions (ExUnit, golden normaliser files, a load test).

## Rollout

1.2, behind `allowRemoteVoices` (already 0088's opt-in). The engine is marked "not stable yet" until the service has real customers. No migration.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] The service phase 1 exit gate met (its T1 report and T7 panel recorded); plan tasks ticked, `docs/roadmap.md` updated
