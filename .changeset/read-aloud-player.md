---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
---

New `ReadAloud`: a text-to-speech player and selection reader on the browser's own `speechSynthesis`, with no dependency and no server. `useReadAloud` and `ReadAloud.Root/Play/Previous/Next/Stop/Rate/Voice/Status/SelectionTrigger` read a content region (or the selected text) sentence by sentence, with pause, previous and next sentence, speed, voice, a current-sentence highlight (CSS Custom Highlight API) and scroll-follow. Only local voices are used by default, so text never leaves the device; `allowRemoteVoices` is an explicit opt-in. The voice follows the content's `lang`, and nothing is spoken in another language. Nothing starts by itself, normal playback is not announced (only errors are), and Escape inside the player stops reading. `@kvirn-ui/core` adds `createReadAloud`, `createSpeechEngine`, `splitSentences`, `collectText` and the `ReadAloudEngine` interface (advanced and unstable: for tests or a self-hosted engine). `@kvirn-ui/i18n` adds the `readAloud` namespace in all six locales (fi, nb, nn and se are drafts that need a native review). The manual AT matrix is `pending`.
