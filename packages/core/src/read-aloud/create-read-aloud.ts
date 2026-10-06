import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'
import type { ReadAloudEngine, ReadAloudVoice } from './read-aloud-engine.ts'
import { splitSentences } from './split-sentences.ts'
import type { LanguageRun, SentenceChunk } from './split-sentences.ts'

export type ReadAloudStatus = 'idle' | 'playing' | 'paused' | 'unsupported'
export type ReadAloudSource = 'content' | 'selection'
export type ReadAloudError = 'no-voice' | 'speech-error'

export const readAloudRates = [0.75, 1, 1.25, 1.5, 2] as const
export type ReadAloudRate = (typeof readAloudRates)[number]

export interface ReadAloudOptions {
  engine: ReadAloudEngine
  /** The language when `play` isn't given one: the content's `lang`. Default `'en'`. */
  getLanguage?: (() => string) | undefined
  /** Longest chunk in characters. Default 200. */
  maxChunkLength?: number | undefined
}

export interface ReadAloudInput {
  text: string
  source: ReadAloudSource
  /** BCP 47 tag of the text: picks the voice. Default: `getLanguage()`. */
  language?: string | undefined
  /** Where the text names another language (`collectText().languageRuns`): each such chunk gets a voice of its own. */
  languageRuns?: readonly LanguageRun[] | undefined
}

export interface ReadAloudState {
  status: ReadAloudStatus
  /** What is being read, empty while idle. */
  chunks: SentenceChunk[]
  /** The chunk being read, or the one that `resume` restarts. */
  index: number
  rate: ReadAloudRate
  /**
   * The voice the user chose, or `null` for the best one for `language`. A chosen voice of another
   * language than `language` is replaced by the best one for it, or by `null` when there is none.
   */
  voiceURI: string | null
  language: string
  error: ReadAloudError | null
  /** For `no-voice`: the language that no voice was found for. */
  errorLanguage: string | null
  source: ReadAloudSource
  /** The voices the engine offers. */
  voices: ReadAloudVoice[]
}

export interface ReadAloudActions {
  /** Starts reading, calling `engine.speak` before it returns. */
  play: (input: ReadAloudInput) => void
  /** Stops speaking and remembers the chunk: `resume` restarts it, since native pause is unreliable. */
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  previous: () => void
  setRate: (rate: number) => void
  setVoice: (voiceURI: string | null) => void
  destroy: () => void
}

export type ReadAloud = ComponentStore<ReadAloudState, ReadAloudActions>

const normalizeTag = (tag: string) => tag.toLowerCase().replaceAll('_', '-')
const primarySubtag = (tag: string) => normalizeTag(tag).split('-')[0]

/**
 * The voice for a language: the chosen one if it speaks that language, else the exact tag, then
 * the same primary subtag. Never a voice of another language.
 */
export function pickVoice(
  voices: readonly ReadAloudVoice[],
  language: string,
  voiceURI: string | null,
): ReadAloudVoice | undefined {
  const chosen =
    voiceURI === null
      ? undefined
      : voices.find(
          (voice) =>
            voice.voiceURI === voiceURI && primarySubtag(voice.lang) === primarySubtag(language),
        )
  if (chosen !== undefined) {
    return chosen
  }
  const tag = normalizeTag(language)
  return (
    voices.find((voice) => normalizeTag(voice.lang) === tag) ??
    voices.find((voice) => primarySubtag(voice.lang) === primarySubtag(language))
  )
}

/**
 * The state behind ReadAloud (Plan 0088): one utterance per sentence, the next starting when one
 * ends. Pause cancels and remembers the sentence. Speech only starts from `play` and `resume`, never
 * by itself. Pure: the engine is injected.
 */
export function createReadAloud({
  engine,
  getLanguage,
  maxChunkLength,
}: ReadAloudOptions): ReadAloud {
  const supported = engine.isSupported()
  const initialState: ReadAloudState = {
    status: supported ? 'idle' : 'unsupported',
    chunks: [],
    index: 0,
    rate: 1,
    voiceURI: null,
    language: getLanguage?.() ?? 'en',
    error: null,
    errorLanguage: null,
    source: 'content',
    voices: supported ? engine.getVoices() : [],
  }

  return createComponentStore<ReadAloudState, ReadAloudActions>(
    initialState,
    ({ getState, update }) => {
      let generation = 0
      let destroyed = false
      const unsubscribeVoices = supported
        ? engine.onVoicesChanged(() => {
            update((state) => ({ ...state, voices: engine.getVoices() }))
          })
        : () => {}

      const active = () => supported && !destroyed
      const finish = (error: ReadAloudError | null, errorLanguage: string | null = null) => {
        update((state) => ({
          ...state,
          status: 'idle',
          chunks: [],
          index: 0,
          error,
          errorLanguage,
        }))
      }

      const speakCurrent = () => {
        const state = getState()
        const chunk = state.chunks[state.index]
        if (chunk === undefined) {
          finish(null)
          return
        }
        const language = chunk.language ?? state.language
        const voice = pickVoice(state.voices, language, state.voiceURI)
        const isContentLanguage = primarySubtag(language) === primarySubtag(state.language)
        if (voice === undefined) {
          engine.cancel()
          if (isContentLanguage && state.voiceURI !== null) {
            update((current) => ({ ...current, voiceURI: null }))
          }
          finish('no-voice', language)
          return
        }
        if (isContentLanguage && state.voiceURI !== null && state.voiceURI !== voice.voiceURI) {
          update((current) => ({ ...current, voiceURI: voice.voiceURI }))
        }
        generation += 1
        const token = generation
        engine.cancel()
        engine.speak(
          {
            text: chunk.text,
            language,
            voiceURI: voice.voiceURI,
            rate: state.rate,
          },
          {
            onEnd: () => {
              if (token !== generation) {
                return
              }
              const { index, chunks } = getState()
              if (index + 1 < chunks.length) {
                update((current) => ({ ...current, index: index + 1 }))
                speakCurrent()
              } else {
                finish(null)
              }
            },
            onError: () => {
              if (token === generation) {
                engine.cancel()
                finish('speech-error')
              }
            },
          },
        )
      }

      const silence = () => {
        generation += 1
        engine.cancel()
      }

      return {
        play({ text, source, language, languageRuns }) {
          if (!active()) {
            return
          }
          silence()
          update((state) => ({
            ...state,
            status: 'playing',
            chunks: splitSentences(text, {
              language: language ?? getLanguage?.() ?? state.language,
              maxLength: maxChunkLength,
              languageRuns,
            }),
            index: 0,
            error: null,
            errorLanguage: null,
            source,
            language: language ?? getLanguage?.() ?? state.language,
            voices: engine.getVoices(),
          }))
          speakCurrent()
        },
        pause() {
          if (active() && getState().status === 'playing') {
            silence()
            update((state) => ({ ...state, status: 'paused' }))
          }
        },
        resume() {
          if (active() && getState().status === 'paused') {
            update((state) => ({ ...state, status: 'playing' }))
            speakCurrent()
          }
        },
        stop() {
          if (active()) {
            silence()
            finish(null)
          }
        },
        next() {
          const { status, index, chunks } = getState()
          if (!active() || status === 'idle') {
            return
          }
          if (index + 1 >= chunks.length) {
            silence()
            finish(null)
            return
          }
          update((state) => ({ ...state, index: index + 1 }))
          if (status === 'playing') {
            speakCurrent()
          }
        },
        previous() {
          const { status, index } = getState()
          if (!active() || status === 'idle') {
            return
          }
          update((state) => ({ ...state, index: Math.max(0, index - 1) }))
          if (status === 'playing') {
            speakCurrent()
          }
        },
        setRate(rate) {
          const allowed = readAloudRates.find((item) => item === rate)
          if (!active() || allowed === undefined) {
            return
          }
          update((state) => ({ ...state, rate: allowed }))
          if (getState().status === 'playing') {
            speakCurrent()
          }
        },
        setVoice(voiceURI) {
          if (!active()) {
            return
          }
          update((state) => ({ ...state, voiceURI }))
          if (getState().status === 'playing') {
            speakCurrent()
          }
        },
        destroy() {
          if (destroyed) {
            return
          }
          destroyed = true
          unsubscribeVoices()
          if (supported) {
            silence()
            finish(null)
          }
        },
      }
    },
  )
}
