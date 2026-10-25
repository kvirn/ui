import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'
import type {
  ReadAloudEngine,
  ReadAloudError,
  ReadAloudVoice,
  SpeechHandle,
} from './read-aloud-engine.ts'
import { splitSentences } from './split-sentences.ts'
import type { LanguageRun, SentenceChunk } from './split-sentences.ts'

export type { ReadAloudError } from './read-aloud-engine.ts'

export type ReadAloudStatus = 'idle' | 'preparing' | 'playing' | 'paused'
export type ReadAloudSource = 'content' | 'selection'
export type ReadAloudVoicesStatus = 'idle' | 'loading' | 'ready' | 'error'

export const readAloudRates = [0.75, 1, 1.25, 1.5, 2] as const
export type ReadAloudRate = (typeof readAloudRates)[number]

export interface ReadAloudOptions {
  engine: ReadAloudEngine
  /**
   * The language when `play` isn't given one: the content's own declared `lang`, never the UI's
   * (3.1.2). `@kvirn-ui/read-aloud` resolves it as content's `lang` → the provider's `locale` →
   * `'en'`; `core` applies only the final `'en'`, for a caller with no locale of its own.
   */
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
  voiceId: string | null
  language: string
  error: ReadAloudError | null
  /** For `no-voice`: the language that no voice was found for. */
  errorLanguage: string | null
  source: ReadAloudSource
  voicesStatus: ReadAloudVoicesStatus
  /** The voices the service offers, once `voicesStatus` is `'ready'`. */
  voices: ReadAloudVoice[]
  /**
   * Whether `language` has a voice, so the consumer can render no player at all for one that
   * doesn't (D9). Resolves synchronously from `engine.getDefaultVoiceId` (D14): a chosen `voiceId`
   * or a voice the fetched list carries wins once that list is `'ready'`. The type keeps `null`
   * only for React's "no machine yet" moment before mount, never produced by `core` itself.
   */
  hasVoice: boolean | null
  /** How many chunks were skipped this reading: too long for the service, or an inline language with no voice (D10). Reset by `play` and `stop`. */
  skippedCount: number
}

export interface ReadAloudActions {
  /** Starts reading: calls `engine.unlock()` before anything else. */
  play: (input: ReadAloudInput) => void
  /** Pauses the audio in place, or aborts the in-flight request while `preparing`. */
  pause: () => void
  /** Resumes mid-sentence, or restarts the request that was aborted. */
  resume: () => void
  stop: () => void
  next: () => void
  previous: () => void
  setRate: (rate: number) => void
  setVoice: (voiceId: string | null) => void
  /**
   * Fetches the voice list without playing, so `hasVoice` can resolve before the first press.
   * Independent of `play`; idempotent while a request is already in flight or has already
   * succeeded.
   */
  loadVoices: () => void
  destroy: () => void
}

export type ReadAloud = ComponentStore<ReadAloudState, ReadAloudActions>

const normalizeTag = (tag: string) => tag.toLowerCase().replaceAll('_', '-')
const primarySubtag = (tag: string) => normalizeTag(tag).split('-')[0]

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

const readAloudErrors = [
  'no-voice',
  'speech-error',
  'service-unavailable',
  'service-busy',
  'text-too-long',
] as const satisfies readonly ReadAloudError[]

function toReadAloudError(error: unknown): ReadAloudError {
  const candidate = (error as { error?: unknown } | null)?.error
  return (readAloudErrors as readonly unknown[]).includes(candidate)
    ? (candidate as ReadAloudError)
    : 'speech-error'
}

/**
 * The voice for a language: the chosen one if it speaks that language, else the exact tag, then
 * the same primary subtag. Never a voice of another language. The service mixes granularity
 * (`sv`, `en-GB`), so both the exact tag and the primary subtag are tried on each side.
 */
export function pickVoice(
  voices: readonly ReadAloudVoice[],
  language: string,
  voiceId: string | null,
): ReadAloudVoice | undefined {
  const chosen =
    voiceId === null
      ? undefined
      : voices.find(
          (voice) => voice.id === voiceId && primarySubtag(voice.lang) === primarySubtag(language),
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
 * Resolves synchronously from `engine.getDefaultVoiceId` (D14), so `fi`/`nn` render no player from
 * the first render rather than appearing then vanishing once the voice list arrives. Once the list
 * is `'ready'` it takes over, since a chosen `voiceId` or a voice the list actually carries is the
 * more precise answer.
 */
function computeHasVoice(
  engine: ReadAloudEngine,
  state: Pick<ReadAloudState, 'voicesStatus' | 'voices' | 'language' | 'voiceId'>,
): boolean | null {
  if (state.voicesStatus === 'ready') {
    return pickVoice(state.voices, state.language, state.voiceId) !== undefined
  }
  // A chosen voice not yet validated against the fetched list is assumed to win, as it does once
  // the list is ready: the list's arrival corrects this if it turns out not to speak `language`.
  if (state.voiceId !== null) {
    return true
  }
  return engine.getDefaultVoiceId(state.language) !== undefined
}

/**
 * The state behind ReadAloud (Plan 0088, async per Plan 0153): one utterance per sentence, loaded
 * then spoken, the next prefetched while the current one plays. Pause is real: `engine.pause()`
 * keeps the position; resume continues it. Speech only starts from `play` and `resume`, never by
 * itself. Pure: the engine is injected.
 */
export function createReadAloud({
  engine,
  getLanguage,
  maxChunkLength,
}: ReadAloudOptions): ReadAloud {
  const initialLanguage = getLanguage?.() ?? 'en'
  const initialState: ReadAloudState = {
    status: 'idle',
    chunks: [],
    index: 0,
    rate: 1,
    voiceId: null,
    language: initialLanguage,
    error: null,
    errorLanguage: null,
    source: 'content',
    voicesStatus: 'idle',
    voices: [],
    // Synchronous from the first render (D14): no network call.
    hasVoice: engine.getDefaultVoiceId(initialLanguage) !== undefined,
    skippedCount: 0,
  }

  return createComponentStore<ReadAloudState, ReadAloudActions>(
    initialState,
    ({ getState, update }) => {
      let generation = 0
      let destroyed = false
      let currentController: AbortController | undefined
      let currentHandle: SpeechHandle | undefined
      let prefetch:
        | { index: number; controller: AbortController; promise: Promise<SpeechHandle | undefined> }
        | undefined
      let voicesPromise: Promise<readonly ReadAloudVoice[]> | undefined

      const withHasVoice = (state: ReadAloudState): ReadAloudState => ({
        ...state,
        hasVoice: computeHasVoice(engine, state),
      })

      const active = () => !destroyed

      const releasePrefetch = () => {
        if (prefetch === undefined) {
          return
        }
        const stale = prefetch
        prefetch = undefined
        stale.controller.abort()
        void stale.promise.then((handle) => handle?.release())
      }

      const dropCurrent = () => {
        currentController?.abort()
        currentController = undefined
        if (currentHandle !== undefined) {
          engine.cancel()
          currentHandle.release()
          currentHandle = undefined
        }
      }

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

      const ensureVoices = (): Promise<readonly ReadAloudVoice[]> => {
        const ready = getState()
        if (ready.voicesStatus === 'ready') {
          return Promise.resolve(ready.voices)
        }
        voicesPromise ??= (async () => {
          update((state) => withHasVoice({ ...state, voicesStatus: 'loading' }))
          try {
            const controller = new AbortController()
            const voices = await engine.getVoices(controller.signal)
            update((state) =>
              withHasVoice({ ...state, voices: [...voices], voicesStatus: 'ready' }),
            )
            return voices
          } catch (error) {
            // `hasVoice` still answers from `engine.getDefaultVoiceId` (D14), not from this
            // failed list: a Voice picker has nothing to offer, but the player itself still shows.
            update((state) => withHasVoice({ ...state, voicesStatus: 'error' }))
            throw error
          } finally {
            voicesPromise = undefined
          }
        })()
        return voicesPromise
      }

      const skipChunk = (index: number) => {
        update((current) => ({ ...current, skippedCount: current.skippedCount + 1 }))
        const { chunks } = getState()
        if (index + 1 < chunks.length) {
          update((current) => ({ ...current, index: index + 1 }))
          playChunk(index + 1)
        } else {
          releasePrefetch()
          finish(null)
        }
      }

      const prefetchNext = (currentIndex: number) => {
        const state = getState()
        const nextIndex = currentIndex + 1
        const nextChunk = state.chunks[nextIndex]
        if (nextChunk === undefined || (prefetch !== undefined && prefetch.index === nextIndex)) {
          return
        }
        releasePrefetch()
        const language = nextChunk.language ?? state.language
        const voice = pickVoice(state.voices, language, state.voiceId)
        if (voice === undefined) {
          return
        }
        const controller = new AbortController()
        const promise = engine
          .load({ text: nextChunk.text, voiceId: voice.id }, controller.signal)
          .catch(() => undefined)
        prefetch = { index: nextIndex, controller, promise }
      }

      const handleChunkError = (error: ReadAloudError, index: number, language: string) => {
        // A chunking bug, not the resident's problem (D10): skip the chunk and keep reading.
        if (error === 'text-too-long') {
          skipChunk(index)
          return
        }
        releasePrefetch()
        finish(error, error === 'no-voice' ? language : null)
      }

      function playChunk(index: number): void {
        const token = generation
        // A newer attempt (token !== generation) or a pause taken before any request existed to
        // abort (status turned 'paused' while still resolving the voice list) both mean: stop here
        // without touching state again.
        const cancelled = () => token !== generation || getState().status === 'paused'
        void (async () => {
          let voices: readonly ReadAloudVoice[]
          try {
            voices = await ensureVoices()
          } catch {
            if (cancelled()) {
              return
            }
            finish('service-unavailable')
            return
          }
          if (cancelled()) {
            return
          }
          const state = getState()
          const chunk = state.chunks[index]
          if (chunk === undefined) {
            finish(null)
            return
          }
          const language = chunk.language ?? state.language
          const voice = pickVoice(voices, language, state.voiceId)
          const isContentLanguage = primarySubtag(language) === primarySubtag(state.language)
          if (voice === undefined) {
            if (isContentLanguage) {
              // The reading's own language has no voice: a page-level problem, not one chunk's.
              if (state.voiceId !== null) {
                update((current) => ({ ...current, voiceId: null }))
              }
              releasePrefetch()
              finish('no-voice', language)
              return
            }
            // An inline, differently-languaged chunk with no voice: skip it, not the rest (D10).
            skipChunk(index)
            return
          }
          if (isContentLanguage && state.voiceId !== null && state.voiceId !== voice.id) {
            update((current) => ({ ...current, voiceId: voice.id }))
          }
          update((current) => ({ ...current, status: 'preparing' }))

          const loadFresh = async (): Promise<SpeechHandle | 'stale' | 'failed'> => {
            const controller = new AbortController()
            currentController = controller
            try {
              const loaded = await engine.load(
                { text: chunk.text, voiceId: voice.id },
                controller.signal,
              )
              currentController = undefined
              return loaded
            } catch (error) {
              currentController = undefined
              if (cancelled() || isAbortError(error)) {
                return 'stale'
              }
              handleChunkError(toReadAloudError(error), index, language)
              return 'failed'
            }
          }

          let handle: SpeechHandle
          if (prefetch !== undefined && prefetch.index === index) {
            const pending = prefetch
            prefetch = undefined
            const prefetched = await pending.promise
            if (cancelled()) {
              prefetched?.release()
              return
            }
            if (prefetched !== undefined) {
              handle = prefetched
            } else {
              // The prefetch swallowed its own error so a fresh request can surface the real one.
              const loaded = await loadFresh()
              if (loaded === 'stale' || loaded === 'failed') {
                return
              }
              handle = loaded
            }
          } else {
            const loaded = await loadFresh()
            if (loaded === 'stale' || loaded === 'failed') {
              return
            }
            handle = loaded
          }

          if (cancelled()) {
            handle.release()
            return
          }
          currentHandle = handle
          update((current) => ({ ...current, status: 'playing' }))
          engine.speak(handle, {
            onEnd: () => {
              if (token !== generation) {
                return
              }
              currentHandle = undefined
              const { index: current, chunks } = getState()
              if (current + 1 < chunks.length) {
                update((state) => ({ ...state, index: current + 1 }))
                playChunk(current + 1)
              } else {
                releasePrefetch()
                finish(null)
              }
            },
            onError: (error) => {
              if (token !== generation) {
                return
              }
              currentHandle = undefined
              handleChunkError(error, index, language)
            },
          })
          prefetchNext(index)
        })()
      }

      const jumpTo = (newIndex: number, status: ReadAloudStatus) => {
        generation += 1
        dropCurrent()
        if (prefetch !== undefined && prefetch.index !== newIndex) {
          releasePrefetch()
        }
        update((state) => ({ ...state, index: newIndex }))
        if (status === 'playing' || status === 'preparing') {
          playChunk(newIndex)
        }
      }

      return {
        play({ text, source, language, languageRuns }) {
          if (!active()) {
            return
          }
          generation += 1
          dropCurrent()
          releasePrefetch()
          // Synchronous, first, before any await: iOS allows `play()` only inside this call's user
          // gesture, so the unlock must happen before the machine does anything that awaits.
          engine.unlock()
          const resolvedLanguage = language ?? getLanguage?.() ?? getState().language
          const chunks = splitSentences(text, {
            language: resolvedLanguage,
            maxLength: maxChunkLength,
            languageRuns,
          })
          update((state) =>
            withHasVoice({
              ...state,
              status: 'preparing',
              chunks,
              index: 0,
              error: null,
              errorLanguage: null,
              source,
              language: resolvedLanguage,
              skippedCount: 0,
            }),
          )
          playChunk(0)
        },
        pause() {
          const { status } = getState()
          if (!active() || (status !== 'playing' && status !== 'preparing')) {
            return
          }
          if (status === 'preparing') {
            currentController?.abort()
            currentController = undefined
          } else {
            engine.pause()
          }
          update((state) => ({ ...state, status: 'paused' }))
        },
        resume() {
          const { status, index } = getState()
          if (!active() || status !== 'paused') {
            return
          }
          engine.unlock()
          if (currentHandle !== undefined) {
            update((state) => ({ ...state, status: 'playing' }))
            engine.resume()
          } else {
            update((state) => ({ ...state, status: 'preparing' }))
            playChunk(index)
          }
        },
        stop() {
          if (!active()) {
            return
          }
          generation += 1
          dropCurrent()
          releasePrefetch()
          update((state) => ({ ...state, skippedCount: 0 }))
          finish(null)
        },
        next() {
          const { status, index, chunks } = getState()
          if (!active() || status === 'idle') {
            return
          }
          if (index + 1 >= chunks.length) {
            generation += 1
            dropCurrent()
            releasePrefetch()
            finish(null)
            return
          }
          jumpTo(index + 1, status)
        },
        previous() {
          const { status, index } = getState()
          if (!active() || status === 'idle') {
            return
          }
          jumpTo(Math.max(0, index - 1), status)
        },
        setRate(rate) {
          const allowed = readAloudRates.find((item) => item === rate)
          if (!active() || allowed === undefined) {
            return
          }
          update((state) => ({ ...state, rate: allowed }))
          engine.setRate(allowed)
        },
        setVoice(voiceId) {
          if (!active()) {
            return
          }
          update((state) => withHasVoice({ ...state, voiceId }))
          releasePrefetch()
          const { status, index } = getState()
          if (status === 'playing' || status === 'preparing') {
            generation += 1
            dropCurrent()
            update((state) => ({ ...state, status: 'preparing' }))
            playChunk(index)
          }
        },
        loadVoices() {
          if (!active()) {
            return
          }
          void ensureVoices().catch(() => {})
        },
        destroy() {
          if (destroyed) {
            return
          }
          destroyed = true
          generation += 1
          dropCurrent()
          releasePrefetch()
          engine.destroy()
          finish(null)
        },
      }
    },
  )
}
