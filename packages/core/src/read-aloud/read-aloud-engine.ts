export interface ReadAloudVoice {
  id: string
  name: string
  /** BCP 47 tag. The service mixes granularity: some voices carry a bare primary subtag (`sv`), others a full tag (`en-GB`). */
  lang: string
  quality: 'medium' | 'high'
  gender: 'male' | 'female'
  licence: string
  /** Shown as the credit. */
  attribution: string
}

export interface ReadAloudUtterance {
  text: string
  voiceId: string
}

export interface ReadAloudHandlers {
  onEnd: () => void
  onError: (error: ReadAloudError) => void
}

/**
 * A language (BCP 47, or its bare primary subtag) to the id of the voice that reads it. The
 * engine owns its own map of defaults; a consumer's map resolves over it, language by language
 * (Plan 0153 D14) — this is one map, not a built-in map with an occasional patch.
 */
export type ReadAloudVoiceMap = Readonly<Record<string, string>>

/** What can stop playback, and why. The service's problem+json `type` maps to these in the engine. */
export type ReadAloudError =
  | 'no-voice'
  | 'speech-error'
  | 'service-unavailable'
  | 'service-busy'
  | 'text-too-long'

/** What a loaded chunk's audio needs to be played, paused, resumed and released. Opaque to the machine: only the engine that created it reads its shape. */
export interface SpeechHandle {
  readonly utterance: ReadAloudUtterance
  /** Frees whatever the handle holds (an object URL, a buffer). Safe to call more than once. */
  release: () => void
}

/**
 * What reading aloud needs from a speech engine. `kvirnSpeechEngine` is the only one that ships;
 * the interface exists for tests and stays async because the service is a network call.
 *
 * `unlock` is the one synchronous member: iOS allows `play()` only inside a user gesture, so the
 * machine calls it synchronously from `play`/`resume`, before any `await`, every other member may
 * be awaited freely.
 */
export interface ReadAloudEngine {
  /**
   * Whether this engine was configured to ask the service to cache its audio (`store: true`),
   * so the privacy note (`readAloud.note` / `readAloud.noteStored`) can say so accurately (rule
   * 8): the sentence is false for a resident when the service actually retains the audio.
   * Default (and a test fake's default) is `false`, the service's own default.
   */
  stores?: boolean | undefined
  /** Called synchronously inside the user's gesture, before any await. The iOS unlock. */
  unlock: () => void
  /**
   * Looks `language` up in the engine's own voice map (`undefined` for one with no voice, `fi`
   * and `nn`). Synchronous and must never touch the network (Plan 0153 D14): `hasVoice` is this
   * lookup, resolved on first render before any voice list has loaded, so a language with none
   * renders no player immediately instead of showing one that then vanishes.
   */
  getDefaultVoiceId: (language: string) => string | undefined
  getVoices: (signal: AbortSignal) => Promise<readonly ReadAloudVoice[]>
  /** Resolves when one chunk's audio is ready. Prefetch calls it for the next chunk while the current one plays. */
  load: (utterance: ReadAloudUtterance, signal: AbortSignal) => Promise<SpeechHandle>
  /** Starts playback of a loaded handle. */
  speak: (handle: SpeechHandle, handlers: ReadAloudHandlers) => void
  pause: () => void
  resume: () => void
  cancel: () => void
  setRate: (rate: number) => void
  destroy: () => void
}
