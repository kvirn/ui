import type { Env } from '../env/env.ts'
import type { ReadAloudEngine, ReadAloudVoice } from './read-aloud-engine.ts'

export interface SpeechEngineOptions {
  /**
   * Offer voices that may send the text to a remote service (`localService === false`). Default
   * `false`: the text stays on the device.
   */
  allowRemoteVoices?: boolean | undefined
}

/**
 * `ReadAloudEngine` over the browser's `speechSynthesis` (Plan 0088). `env` is `undefined` while
 * server rendering, when nothing can be spoken.
 */
export function createSpeechEngine(
  env: Env | undefined,
  { allowRemoteVoices = false }: SpeechEngineOptions = {},
): ReadAloudEngine {
  const synthesis = env?.window.speechSynthesis as SpeechSynthesis | undefined
  const Utterance = env?.window.SpeechSynthesisUtterance as
    | typeof SpeechSynthesisUtterance
    | undefined
  // Chrome drops an utterance that nothing references before it ends, and never fires `end`.
  let active: SpeechSynthesisUtterance | undefined

  const allowedVoices = () =>
    (synthesis?.getVoices() ?? []).filter((voice) => allowRemoteVoices || voice.localService)

  return {
    isSupported: () => synthesis !== undefined && Utterance !== undefined,
    getVoices: (): ReadAloudVoice[] =>
      allowedVoices().map(({ voiceURI, name, lang, localService }) => ({
        voiceURI,
        name,
        lang,
        localService,
      })),
    getAllVoiceCount: () => synthesis?.getVoices().length ?? 0,
    onVoicesChanged(listener) {
      synthesis?.addEventListener('voiceschanged', listener)
      return () => synthesis?.removeEventListener('voiceschanged', listener)
    },
    speak({ text, language, voiceURI, rate }, { onEnd, onError }) {
      if (synthesis === undefined || Utterance === undefined) {
        onError()
        return
      }
      // The browser's default voice may be remote, so without a named local voice there is no safe one.
      if (voiceURI === null && !allowRemoteVoices) {
        onError()
        return
      }
      const voice =
        voiceURI === null ? undefined : allowedVoices().find((item) => item.voiceURI === voiceURI)
      if (voiceURI !== null && voice === undefined) {
        onError()
        return
      }
      const utterance = new Utterance(text)
      utterance.lang = language
      utterance.rate = rate
      if (voice !== undefined) {
        utterance.voice = voice
      }
      utterance.onend = () => {
        if (active === utterance) {
          active = undefined
          onEnd()
        }
      }
      utterance.onerror = (event) => {
        // `cancel()` fires `interrupted` or `canceled`: that is us stopping, not a failure.
        if (active === utterance && event.error !== 'interrupted' && event.error !== 'canceled') {
          active = undefined
          onError()
        }
      }
      active = utterance
      synthesis.speak(utterance)
    },
    cancel() {
      active = undefined
      synthesis?.cancel()
    },
  }
}
