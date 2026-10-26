# Plan 0155: Kvirn AI (ai.kvirn.com) and `@kvirn-ui/ai`: Klarspråk, Chat and Search

- **Status:** Draft
- **Owner:** lead (orchestrator) → component-engineer, ux-designer, accessibility-reviewer; user for the service repo, the server and the model choice
- **Created:** 2026-10-25 · **Target:** after 1.2 (ReadAloud), no milestone yet
- **Related:** [0151](0151-read-aloud-service.md) (voice.kvirn.com, the service pattern copied), [0117](0117-map-and-address-search.md) (`kvirnGeocoder`, the factory pattern), [0153](0153-read-aloud-kvirn-only.md) (Kvirn-only engine), skills `regulations`, `forms`, `overlays-and-lists`, `accessibility`

## Goal

A municipality can (1) rewrite its pages into klarspråk or lättläst, (2) embed a chat assistant that answers only from its own content, with sources, and (3) offer site search that finds "avfallskärl" when a resident types "soptunna". All three come from one Kvirn-run, EU-hosted service that sends nothing to third parties and keeps no chats by default.

## Non-goals

- General-purpose chat ("ask me anything"). The assistant answers from its context or says it doesn't know.
- Acting on the resident's behalf (filling e-service forms, booking, payments) or reading logged-in case data. v1 is public content only.
- Personal data in the context: no case files, no personnummer, no logged-in sessions.
- Fine-tuning or training on customer data.
- Image or document understanding (photographed letters, scanned PDFs without a text layer).
- Voice chat. Dictation (0152) and ReadAloud (0088) can be added once text chat works.
- An on-prem image in v1 (depends on model licences, §D4).

## Background

- **Legal hooks:**
  - Språklagen (2009:600) 11 §: public-sector language must be "vårdat, enkelt och begripligt". This is the reason to buy Klarspråk.
  - EU AI Act Art. 50: people must be told they are talking to an AI. The chat must say so before the first message. T1 confirms which obligations apply and from when, using the `regulations` skill.
  - GDPR: residents type personal data into chat boxes whatever we say, so input is masked before it reaches the model (§Privacy).
- **Prior art to beat:** Swedish municipal chatbots built on US platforms or SaaS bots that call US model APIs. ReadSpeaker and Funka sell readability and listening tools. None is open, EU-only and accessible by contract.
- **Service stack copied from `kvirn-map-provider` / `kvirn-voice-provider`:** Elixir/Phoenix on Bandit, nginx edge (TLS, CORS allow-list, rate limits, no IP or text in logs), Hetzner, no cookies. **New:** the model needs a GPU, so hosting is an open question (§Risks).
- **Unmeasured:** no model or GPU host is chosen yet. T1 is a spike: one open-weight chat model and one multilingual embedding model, scored on Swedish, Norwegian, English and the largest immigrant languages, with licences cleared for commercial use.

## Design

### Service (new repo `kvirn-ai-provider`, host `ai.kvirn.com`)

That repo owns the architecture. This plan relies on:

- `POST /v1/rewrite` `{ text, level: 'klarsprak' | 'lattlast', lang }` → `{ text, lix: { before, after }, changes[] }`
- `POST /v1/chat` `{ profile, context[], messages[], lang }` → a stream (SSE) of tokens, then `{ sources: [{ title, url, excerpt }] }`
- `GET /v1/search?q=&context=&lang=` → `{ results: [{ title, url, excerpt, score }], synonyms[] }`
- `GET /v1/profiles/:id` → the public part of a profile (name, intro, disclosure, languages, handoff)
- Ingest (admin only, API key): a sitemap or URL crawl, PDF upload with a text layer, and a CMS webhook (Optimizely, Sitevision) that upserts or deletes one page.
- Storage: Postgres with pgvector plus Swedish full-text search. Hybrid ranking: semantic and keyword, then a site's synonym list.
- Keys: a public **site key** per domain (CORS-bound, rate-limited) for the browser; a secret **admin key** for ingest and profile edits.

### Profile = who the agent is

```json
{
  "id": "kontaktcenter",
  "name": "<Kommun>s digitala assistent",
  "intro": "Jag svarar på frågor om innehållet på den här webbplatsen.",
  "tone": "klarsprak",
  "languages": ["sv", "en", "ar", "so", "uk"],
  "scope": "Only answer from the context. Never give legal or medical advice.",
  "handoff": { "label": "Kontakta kontaktcenter", "url": "/kontakt", "phone": "<number>" },
  "context": ["webb", "avfall", "bygglov"]
}
```

- Presets ship with the service: `kontaktcenter`, `lattlast-guide`, `foretagslots` (business support).
- `tone` reuses Klarspråk's levels, so every answer comes out in plain language.
- The site can't override `scope` from the browser. Profiles are server-side, and the browser only names one.

### Context = what the agent knows

- A **collection** is a named set of documents (`webb`, `avfall`). A profile lists the collections it may use, and the embed can narrow them per page (`context={['avfall']}` on the waste pages).
- Every answer cites at least one source. If retrieval finds nothing above a threshold, the assistant says it doesn't know and shows the handoff. It never answers from the model's own knowledge.
- Queries with no results are logged (query text only, masked), so editors can see which content is missing.

### Library (`@kvirn-ui/ai`, private until approved)

```tsx
import { kvirnAi } from '@kvirn-ui/ai'

const ai = kvirnAi({ url: 'https://ai.kvirn.com', siteKey, name: 'Kvirn' })

<KvirnProvider ai={ai}>
  <Chat.Root profile="kontaktcenter" context={['avfall']}>
    <Chat.Disclosure />  {/* "Du chattar med en AI-assistent…" (AI Act Art. 50) */}
    <Chat.Log />          {/* role="log" */}
    <Chat.Sources />
    <Chat.Handoff />
    <Chat.Composer />     {/* Field + TextArea + Button */}
  </Chat.Root>
  <Search.Root context={['webb']} />  {/* Combobox + Listbox, shared core */}
</KvirnProvider>

const { rewrite } = useKlarsprak()  // for CMS editor plugins and the rich-text package
```

- Hooks first: `useChat`, `useAiSearch`, `useKlarsprak`. Compound parts are built on them (vision principle 3).
- `kvirnAi` follows `kvirnGeocoder` and `kvirnSpeechEngine`: the consumer passes the URL, the library names none, and nothing touches `window` at import.
- Search reuses the Combobox/Listbox core (`overlays-and-lists`). Chat reuses Field, TextArea, Button and Progress.

### Embed (separate distribution, §D1)

```html
<script src="https://ai.kvirn.com/embed.js" data-site="<site-key>" data-profile="kontaktcenter" async></script>
```

A prebuilt Web Component wrapping the React package, with a default theme from `@kvirn-ui/theme`. It is for sites that can't install npm packages (Sitevision, older CMSs). It's served from `ai.kvirn.com`, so no other third party is involved.

### Privacy

- Before anything leaves the browser, personnummer, phone numbers, email addresses and IBANs are masked using the `forms` mask patterns. The service runs the same masking again.
- Chats are not stored by default (`store: false`, as in voice). If a site turns on storage for improvement, it's masked, kept 30 days and shown in the Disclosure.
- No cookies. Conversation state lives in memory on the page.

### Accessibility contract (draft, Chat)

| Key                  | Action                                                        |
| -------------------- | ------------------------------------------------------------- |
| Tab / Shift+Tab      | Composer → Send → Sources → Handoff; the log is not a tab stop |
| Enter (in composer)  | Sends                                                         |
| Shift+Enter          | New line                                                      |
| Escape               | Stops a streaming answer (embed: then closes the launcher)    |

- Roles/ARIA: the log is `role="log"`. A streamed answer is announced **once, when it's complete** (not token by token) through a polite live region. "Assistant is writing…" is announced once after 1 s.
- Focus stays in the composer after sending. A source link opens in the same tab.
- WCAG SCs: 1.3.1, 2.1.1, 2.2.1 (no time limit), 2.4.3, 3.3.2, 4.1.3. AT questions go to the roadmap's AT matrix.

### i18n strings (first cut)

| Key                     | en                                   | sv                                      |
| ----------------------- | ------------------------------------ | --------------------------------------- |
| `ai.chat.disclosure`    | You are chatting with an AI assistant | Du chattar med en AI-assistent          |
| `ai.chat.send`          | Send                                 | Skicka                                  |
| `ai.chat.stop`          | Stop                                 | Stoppa                                  |
| `ai.chat.writing`       | The assistant is writing…            | Assistenten skriver…                    |
| `ai.chat.noAnswer`      | I can't find that on this website.   | Jag hittar inte det på den här webbplatsen. |
| `ai.chat.sources`       | Sources                              | Källor                                  |
| `ai.search.synonymHint` | Also showing results for {term}      | Visar även resultat för {term}          |

## Tasks

- [ ] T1 Spike (service repo): choose a chat model, an embedding model and a GPU host; measure Swedish quality, cost per 1 000 answers and latency; clear licences
- [ ] T2 Service: ingest, collections, hybrid search, `/v1/search`, smoke test as in 0150
- [ ] T3 Service: `/v1/rewrite` with LIX before and after; listening/reading panel on 20 real municipal pages
- [ ] T4 Service: profiles, `/v1/chat` with sources, refusal threshold, handoff, masking
- [ ] T5 Library: `kvirnAi`, `useKlarsprak`, `useAiSearch` + `Search` parts, unit and browser tests
- [ ] T6 Library: `useChat` + `Chat` parts, keyboard rows, axe in every state, stories × 4 themes
- [ ] T7 i18n (5 locales), docs pages (`docs-pages`), compliance copy (`regulations`)
- [ ] T8 Embed bundle (`embed.js`), only after §D1 is approved
- [ ] T9 Changeset; `docs/roadmap.md` row

## Decisions

- **D1 (maintainer):** the script-tag embed ships styled, React-bundled code. That breaks "headless, React only" (vision principles 2 and Non-goals), so it would ship as a separate product (`kvirn-ai-embed`), not as part of `@kvirn-ui/*`. **Open.**
- **D2:** one service, three features over one index. Search and chat share retrieval, so search can ship first and chat follows.
- **D3:** profiles live on the server and the browser only names one, so a page can't jailbreak the scope through props.
- **D4 (maintainer):** model licence and hosting decide whether an on-prem image is possible later. **Open until T1.**
- **D5:** answers only from the context with at least one source; otherwise the assistant refuses and shows the handoff.

## Risks & open questions

- **Employer overlap:** chat and klarspråk sold to the public sector may compete with Vivicta's offering. Check before any sales work.
- **GPU hosting:** Hetzner GPU capacity, price and EU location; an EU GPU cloud is the fallback. Cost per answer decides pricing.
- **Wrong answers:** a confident wrong answer about rules or fees is the main harm. Mitigations: D5, the refusal threshold, visible sources and a feedback button per answer. Measured in T4 with a test set of real questions.
- **Lättläst:** easy-to-read Swedish has its own conventions; machine output needs review by an expert before we claim it.
- **Languages:** Somali, Tigrinya and Dari quality is unknown; v1 may limit chat languages to what T1 shows works.
- **AI Act:** confirm which obligations apply to us as provider and to the municipality as deployer.

## Testing strategy

- Golden sets per feature: 50 rewrite pairs, 100 search queries with expected top-3, 100 chat questions with expected source and expected refusals. They run in the service repo's CI.
- Library: mocked service (MSW) for unit and browser tests; a live smoke test skips until `KVIRN_AI_URL` is set (as 0150/0151).

## Rollout

Private `@kvirn-ui/ai` until T6 and accessibility review pass. Search first, then Klarspråk, then Chat. The embed comes after D1.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
