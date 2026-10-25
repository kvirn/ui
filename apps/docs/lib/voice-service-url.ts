/**
 * The Kvirn voice service's base URL for the ReadAloud example and page (Plan 0153 D6). Unlike
 * `geo.kvirn.com` in `map-page.tsx`, which is a deployed host named in code, `voice.kvirn.com` is
 * not deployed yet: the default must be the local dev edge, and switching to the real host must
 * not need a code change. `NEXT_PUBLIC_*` so the client component passing it to
 * `kvirnSpeechEngine` can read it.
 */
export const voiceServiceUrl = process.env.NEXT_PUBLIC_KVIRN_VOICE_URL ?? 'http://localhost:8080'
