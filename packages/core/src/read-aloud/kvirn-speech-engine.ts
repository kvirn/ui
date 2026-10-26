import type {
  ReadAloudEngine,
  ReadAloudError,
  ReadAloudHandlers,
  ReadAloudUtterance,
  ReadAloudVoice,
  ReadAloudVoiceMap,
  SpeechHandle,
} from './read-aloud-engine.ts'

const DEFAULT_TIMEOUT = 10_000
// `synth_busy`/`queue_full` get exactly one retry (never a loop). ~1s when `Retry-After` is
// absent or not delta-seconds (an HTTP-date, say); capped at 2s regardless, because a resident
// won't wait out a `Retry-After: 300` and `timeout` is the overall budget, not this wait alone.
const FALLBACK_RETRY_DELAY = 1_000
const MAX_RETRY_DELAY = 2_000

export interface KvirnSpeechEngineOptions {
  /** The service's base URL: an origin, or a path on your own proxy. The library names none. */
  url: string | URL
  /** Who receives the text, named in the privacy notice. Default: the host name. */
  name?: string | undefined
  /** Asks the service to cache the audio. Only for public page text. Default `false`. */
  store?: boolean | undefined
  /** Total budget per request. Default 10000 ms. */
  timeout?: number | undefined
  /**
   * The language-to-voice map, resolved over the service's own (D14): your entry for a language
   * wins, any language you don't name keeps the service's voice (or its absence, for `fi`/`nn`),
   * e.g. `{ sv: 'sv_SE-male-0-medium' }`.
   */
  voices?: ReadAloudVoiceMap | undefined
}

/** The service's own map (Plan 0153 §Background), keyed by exact tag and by primary subtag. `fi` and `nn` have no entry. */
const defaultVoiceIds: ReadAloudVoiceMap = {
  sv: 'sv_SE-male-0-medium',
  nb: 'nb_NO-male-0-medium',
  en: 'en_GB-female-0-high',
  'en-gb': 'en_GB-female-0-high',
  'en-us': 'en_US-female-0-high',
}

const normalizeVoiceTag = (tag: string) => tag.toLowerCase().replaceAll('_', '-')
const voicePrimarySubtag = (tag: string): string => normalizeVoiceTag(tag).split('-')[0] ?? tag

interface VoicesResponseEntry {
  id: string
  name: string
  lang: string
  quality: 'medium' | 'high'
  gender: 'male' | 'female'
  licence: string
  attribution: string
}

interface SpeechProblem {
  type: string
}

const problemTypes: Record<string, ReadAloudError> = {
  text_too_long: 'text-too-long',
  normalised_text_too_long: 'text-too-long',
  unknown_voice: 'no-voice',
  synth_busy: 'service-busy',
  queue_full: 'service-busy',
}

/** Thrown by a failed request. `error` is the mapped `ReadAloudError`; unmapped problem types default to `service-unavailable`, the safest "stop and say so". */
export class KvirnSpeechError extends Error {
  constructor(
    readonly error: ReadAloudError,
    readonly retryAfter?: number,
  ) {
    super(error)
  }
}

interface KvirnSpeechHandle extends SpeechHandle {
  objectUrl: () => string
}

function isVoicesResponseEntry(value: unknown): value is VoicesResponseEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { lang?: unknown }).lang === 'string'
  )
}

async function readProblem(response: Response): Promise<KvirnSpeechError> {
  const retryAfterHeader = response.headers.get('retry-after')
  const retryAfter = retryAfterHeader === null ? undefined : Number(retryAfterHeader)
  try {
    const body = (await response.json()) as SpeechProblem
    return new KvirnSpeechError(problemTypes[body.type] ?? 'service-unavailable', retryAfter)
  } catch {
    return new KvirnSpeechError('service-unavailable', retryAfter)
  }
}

/** `retryAfter` is delta-seconds, the common form; an HTTP-date parses to `NaN` and falls back. */
function retryDelayMs(retryAfter: number | undefined): number {
  if (retryAfter === undefined || !Number.isFinite(retryAfter) || retryAfter < 0) {
    return FALLBACK_RETRY_DELAY
  }
  return Math.min(MAX_RETRY_DELAY, retryAfter * 1000)
}

/** Resolves `'ready'` after `ms`, or `'aborted'` the moment `signal` fires, leaving no pending timer either way. */
function delay(ms: number, signal: AbortSignal): Promise<'ready' | 'aborted'> {
  if (signal.aborted) {
    return Promise.resolve('aborted')
  }
  return new Promise((resolve) => {
    const onAbort = () => {
      clearTimeout(timer)
      resolve('aborted')
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve('ready')
    }, ms)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * A `ReadAloudEngine` over the Kvirn voice service (Plan 0153): one sentence per request, no
 * streaming. The library names no URL: you pass your own service or proxy.
 *
 * @example
 * createReadAloud({ engine: kvirnSpeechEngine({ url: '/voice' }), ... })
 */
export function kvirnSpeechEngine({
  url,
  // `name` defaults to the host, matching `kvirnGeocoder`: it names the recipient in the consumer's
  // own privacy notice. `ReadAloudEngine` has nothing to carry it on, so it is accepted and
  // resolved for that documentation purpose only, and sent nowhere.
  name: _name,
  store = false,
  timeout = DEFAULT_TIMEOUT,
  voices,
}: KvirnSpeechEngineOptions): ReadAloudEngine {
  const base = new URL(url, typeof location === 'undefined' ? undefined : location.href)
  const basePath = base.pathname.replace(/\/+$/, '')
  // The resolved map: the consumer's `voices` resolves over the service's own, language by
  // language, never the other way round.
  const voiceIdsByTag: ReadAloudVoiceMap = {
    ...defaultVoiceIds,
    ...Object.fromEntries(
      Object.entries(voices ?? {}).map(([tag, id]) => [normalizeVoiceTag(tag), id]),
    ),
  }

  let audio: HTMLAudioElement | undefined
  let unlocked = false
  let destroyed = false
  let detachPlayback: (() => void) | undefined
  let voicesPromise: Promise<readonly ReadAloudVoice[]> | undefined
  const objectUrls = new Set<string>()
  // `setRate` can run before `unlock` ever creates `audio` (Settings is chosen before the first
  // Play): kept here and applied whenever an `<audio>` element exists or is created, so a rate
  // chosen ahead of the first press is never silently dropped.
  let currentRate = 1

  const endpoint = (path: string) => {
    const target = new URL(base)
    target.pathname = `${basePath}${path}`
    return target
  }

  const withTimeout = (signal: AbortSignal) => {
    const controller = new AbortController()
    const forward = () => controller.abort()
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', forward)
    }
    const timer = setTimeout(() => controller.abort(), timeout)
    return {
      signal: controller.signal,
      release: () => {
        clearTimeout(timer)
        signal.removeEventListener('abort', forward)
      },
    }
  }

  return {
    stores: store,

    getDefaultVoiceId(language) {
      const tag = normalizeVoiceTag(language)
      return voiceIdsByTag[tag] ?? voiceIdsByTag[voicePrimarySubtag(language)]
    },

    unlock() {
      if (destroyed) {
        return
      }
      audio ??= new Audio()
      audio.preload = 'auto'
      audio.preservesPitch = true
      if (!unlocked) {
        unlocked = true
        // iOS allows `play()` only inside a user gesture: this silent call, synchronous and
        // inside the gesture, marks the element as user-initiated so a later `src` swap can play
        // without one. The promise it may reject with is never the caller's problem.
        audio.play().catch(() => {})
        audio.pause()
      }
    },

    async getVoices(signal) {
      voicesPromise ??= (async () => {
        try {
          const response = await fetch(endpoint('/v1/voices'), { signal, credentials: 'omit' })
          if (!response.ok) {
            throw await readProblem(response)
          }
          const body = (await response.json()) as unknown[]
          return body.filter(isVoicesResponseEntry).map((voice) => ({ ...voice }))
        } catch (error) {
          voicesPromise = undefined
          throw error
        }
      })()
      return voicesPromise
    },

    async load(utterance: ReadAloudUtterance, signal) {
      const budget = withTimeout(signal)
      const attempt = async (): Promise<Response> => {
        try {
          return await fetch(endpoint('/v1/speech'), {
            method: 'POST',
            signal: budget.signal,
            credentials: 'omit',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text: utterance.text, voice: utterance.voiceId, store }),
          })
        } catch (cause) {
          // The caller's own signal aborting is a cancellation, not a service failure: let it
          // propagate as-is so the machine can tell the two apart.
          if (signal.aborted) {
            throw cause
          }
          throw new KvirnSpeechError('service-unavailable')
        }
      }
      try {
        let response = await attempt()
        if (!response.ok) {
          const problem = await readProblem(response)
          // `synth_busy`/`queue_full` get exactly one retry, honouring `Retry-After`; anything
          // else, or a second failure, stops the read and says so.
          if (problem.error !== 'service-busy') {
            throw problem
          }
          const waited = await delay(retryDelayMs(problem.retryAfter), budget.signal)
          if (waited === 'aborted') {
            throw problem
          }
          response = await attempt()
          if (!response.ok) {
            throw await readProblem(response)
          }
        }
        const blob = await response.blob()
        let objectUrl: string | undefined
        const handle: KvirnSpeechHandle = {
          utterance,
          objectUrl: () => {
            if (objectUrl === undefined) {
              objectUrl = URL.createObjectURL(blob)
              objectUrls.add(objectUrl)
            }
            return objectUrl
          },
          release: () => {
            if (objectUrl !== undefined) {
              URL.revokeObjectURL(objectUrl)
              objectUrls.delete(objectUrl)
              objectUrl = undefined
            }
          },
        }
        return handle
      } finally {
        budget.release()
      }
    },

    speak(handle: SpeechHandle, handlers: ReadAloudHandlers) {
      if (destroyed) {
        return
      }
      const kvirnHandle = handle as KvirnSpeechHandle
      audio ??= new Audio()
      audio.preload = 'auto'
      audio.preservesPitch = true
      // A rate chosen before the first press, or while paused with no `<audio>` yet, is applied
      // the moment there is one to speak with it.
      audio.playbackRate = currentRate
      const element = audio
      detachPlayback?.()
      // A stale `ended`/`error` from a cancelled sentence must never reach a later one's handlers.
      const onEnded = () => {
        detachPlayback = undefined
        handlers.onEnd()
      }
      const onError = () => {
        detachPlayback = undefined
        handlers.onError('speech-error')
      }
      element.addEventListener('ended', onEnded)
      element.addEventListener('error', onError)
      detachPlayback = () => {
        element.removeEventListener('ended', onEnded)
        element.removeEventListener('error', onError)
      }
      element.src = kvirnHandle.objectUrl()
      element.play().catch(() => {
        detachPlayback?.()
        detachPlayback = undefined
        handlers.onError('speech-error')
      })
    },

    pause() {
      audio?.pause()
    },

    resume() {
      audio?.play().catch(() => {})
    },

    cancel() {
      detachPlayback?.()
      detachPlayback = undefined
      if (audio !== undefined) {
        audio.pause()
        audio.removeAttribute('src')
      }
    },

    setRate(rate) {
      currentRate = rate
      if (audio !== undefined) {
        audio.playbackRate = rate
        audio.preservesPitch = true
      }
    },

    destroy() {
      if (destroyed) {
        return
      }
      destroyed = true
      detachPlayback?.()
      detachPlayback = undefined
      audio?.pause()
      for (const objectUrl of objectUrls) {
        URL.revokeObjectURL(objectUrl)
      }
      objectUrls.clear()
    },
  }
}
