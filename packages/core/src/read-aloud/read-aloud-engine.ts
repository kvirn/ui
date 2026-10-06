export interface ReadAloudVoice {
  voiceURI: string
  name: string
  /** BCP 47 tag, such as `sv-SE`. */
  lang: string
  /** `false`: the engine may send the text to a remote service. */
  localService: boolean
}

export interface ReadAloudUtterance {
  text: string
  language: string
  /** `null`: the engine's default voice for `language`. */
  voiceURI: string | null
  rate: number
}

export interface ReadAloudHandlers {
  onEnd: () => void
  onError: () => void
}

/**
 * What reading aloud needs from a speech engine. The browser's `speechSynthesis` is the only one
 * that ships (`createSpeechEngine`); the interface exists for tests and a later self-hosted engine,
 * and is not stable yet.
 */
export interface ReadAloudEngine {
  isSupported: () => boolean
  getVoices: () => ReadAloudVoice[]
  /** How many voices the platform reports, before any is filtered out. For developer warnings only. */
  getAllVoiceCount?: () => number
  /** Returns the function that removes the listener. */
  onVoicesChanged: (listener: () => void) => () => void
  /** Must start speaking before it returns: iOS needs `speak` inside the user's gesture. */
  speak: (utterance: ReadAloudUtterance, handlers: ReadAloudHandlers) => void
  /** Stops speaking. The handlers of the cancelled utterance are never called. */
  cancel: () => void
}
