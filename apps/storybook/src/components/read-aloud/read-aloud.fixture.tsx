import type { ReadAloudEngine, ReadAloudError, ReadAloudVoice } from '@kvirn-ui/core'
import { KvirnProvider } from '@kvirn-ui/react'
import { ReadAloud } from '@kvirn-ui/read-aloud'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import type { Decorator } from '@storybook/react-vite'
import { useMemo, useRef } from 'react'

// Story fixture for Components/ReadAloud. The stories never speak: a fake engine stands in for
// the Kvirn voice service, so the audio, the voices and the timing are the same in every browser
// and in CI, and nothing ever reaches the network (D6).
const catalogs = { sv, fi, en }

export const withReadAloudMessages: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'sv')
  const catalog = locale === 'fi' ? fi : locale === 'en' ? en : sv
  return (
    <KvirnProvider locale={locale in catalogs ? locale : 'sv'} messages={catalog}>
      <Story />
    </KvirnProvider>
  )
}

/** The four voices the live service offers (plan 0153 §Background), so voice matching is exercised honestly, `en` included, matching `en-GB` first. */
export const serviceVoices: ReadAloudVoice[] = [
  {
    id: 'sv_SE-male-0-medium',
    name: 'Svenska',
    lang: 'sv',
    quality: 'medium',
    gender: 'male',
    licence: 'CC0',
    attribution: 'Kvirn voice service',
  },
  {
    id: 'nb_NO-male-0-medium',
    name: 'Norsk',
    lang: 'nb',
    quality: 'medium',
    gender: 'male',
    licence: 'CC0',
    attribution: 'Kvirn voice service',
  },
  {
    id: 'en_GB-female-0-high',
    name: 'English (UK)',
    lang: 'en-GB',
    quality: 'high',
    gender: 'female',
    licence: 'CC0',
    attribution: 'Kvirn voice service',
  },
  {
    id: 'en_US-female-0-high',
    name: 'English (US)',
    lang: 'en-US',
    quality: 'high',
    gender: 'female',
    licence: 'CC0',
    attribution: 'Kvirn voice service',
  },
]

/**
 * The service's own default voice per language (plan 0153 D14), static and synchronous like the
 * real `kvirnSpeechEngine`: matched by exact tag, then by primary subtag. `fi` and `nn` have none.
 */
const defaultVoiceIdByTag: Record<string, string> = {
  sv: 'sv_SE-male-0-medium',
  nb: 'nb_NO-male-0-medium',
  en: 'en_GB-female-0-high',
  'en-gb': 'en_GB-female-0-high',
  'en-us': 'en_US-female-0-high',
}

function defaultVoiceIdFor(language: string): string | undefined {
  const tag = language.toLowerCase().replaceAll('_', '-')
  return defaultVoiceIdByTag[tag] ?? defaultVoiceIdByTag[tag.split('-')[0] ?? tag]
}

export interface FakeEngineOptions {
  /** The voices `getVoices` resolves with. Default the four real service voices. For the Voice-picker example; it no longer decides `hasVoice` (D14). */
  voices?: ReadAloudVoice[]
  /** Milliseconds `load` takes to resolve. Default short. Raise it past 300ms to show `preparing`. */
  loadDelay?: number
  /** Milliseconds `speak` takes before `onEnd` fires. Default short. Raise it to hold a story on `playing`. */
  speakDuration?: number
  /**
   * Every `load` rejects with this error, unless `failChunkIndex` names one sentence only. Models
   * a request the service refused (`service-busy`, `service-unavailable`, `text-too-long`).
   */
  failWith?: ReadAloudError
  /**
   * Only the sentence at this position (0-based, in reading order, counted once per sentence even
   * though prefetch may call `load` for it twice) fails, with `failWith` (default `'text-too-long'`).
   * The rest read normally, so the skip, `partSkipped` and reading on can be shown together (D10).
   */
  failChunkIndex?: number
  /** `speak` calls `onError('speech-error')` instead of `onEnd`: a playback failure after a successful load. */
  failPlayback?: boolean
}

/** Resolves after `ms`, or rejects with an `AbortError` the moment `signal` fires. Never a real timer leak: the listener is always removed. */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'))
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export function createFakeEngine({
  voices = serviceVoices,
  loadDelay = 20,
  speakDuration = 40,
  failChunkIndex,
  // `failChunkIndex` alone means "skip this one sentence", so it needs a cause: text-too-long.
  failWith = failChunkIndex === undefined ? undefined : 'text-too-long',
  failPlayback = false,
}: FakeEngineOptions = {}): ReadAloudEngine {
  // Assigns each sentence's text a stable position the first time it is seen, so `failChunkIndex`
  // means "this sentence", not "this `load` call": prefetch and a retry can both call `load` for
  // the same sentence.
  const chunkIndexByText = new Map<string, number>()
  let nextChunkIndex = 0
  const chunkIndexOf = (text: string): number => {
    let index = chunkIndexByText.get(text)
    if (index === undefined) {
      index = nextChunkIndex
      nextChunkIndex += 1
      chunkIndexByText.set(text, index)
    }
    return index
  }

  let lastHandlers: { onEnd: () => void; onError: (error: ReadAloudError) => void } | undefined
  let speakTimer: ReturnType<typeof setTimeout> | undefined
  const finishSpeaking = () => {
    if (failPlayback) {
      lastHandlers?.onError('speech-error')
    } else {
      lastHandlers?.onEnd()
    }
  }

  return {
    unlock: () => {},
    getDefaultVoiceId: defaultVoiceIdFor,
    getVoices: async () => voices,
    async load(utterance, signal) {
      const index = chunkIndexOf(utterance.text)
      await delay(loadDelay, signal)
      if (failWith !== undefined && (failChunkIndex === undefined || failChunkIndex === index)) {
        throw { error: failWith }
      }
      return { utterance, release: () => {} }
    },
    speak(_handle, handlers) {
      lastHandlers = handlers
      clearTimeout(speakTimer)
      speakTimer = setTimeout(finishSpeaking, speakDuration)
    },
    pause: () => clearTimeout(speakTimer),
    resume: () => {
      clearTimeout(speakTimer)
      speakTimer = setTimeout(finishSpeaking, speakDuration)
    },
    cancel: () => {
      clearTimeout(speakTimer)
      lastHandlers = undefined
    },
    setRate: () => {},
    destroy: () => clearTimeout(speakTimer),
  }
}

export function useFakeEngine(options: FakeEngineOptions = {}): ReadAloudEngine {
  const { loadDelay, speakDuration, failWith, failChunkIndex, failPlayback } = options
  const voiceCount = options.voices?.length
  return useMemo(
    () => createFakeEngine(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the options are plain values, so their parts are the keys
    [loadDelay, speakDuration, failWith, failChunkIndex, failPlayback, voiceCount],
  )
}

export function Article({ ref }: { ref: React.Ref<HTMLElement> }) {
  return (
    <article ref={ref} lang="en" data-testid="article">
      <h1>Applying for a building permit</h1>
      <p>
        You apply for a building permit in the municipality where the building will stand. Start
        with the property designation and a short description of the work. Attach a site plan.
      </p>
      <p>
        The case officer reviews the application within ten weeks. If something is missing you are
        told what, and the time stops until you reply.
      </p>
      <p lang="sv">
        {/* kv-lang-ok: a passage in another language, marked with lang (3.1.2) */}
        Du kan följa ärendet under Mina sidor. Där ser du också vilka handlingar som saknas.
      </p>
      <p>
        A decision comes by post and in your digital mailbox. You can appeal within three weeks.
      </p>
    </article>
  )
}

/** A Finnish page: the service has no voice for `fi` (plan 0153 §Background), so `hasVoice` is `false`. */
export function FinnishArticle({ ref }: { ref: React.Ref<HTMLElement> }) {
  return (
    <article ref={ref} lang="fi" data-testid="article">
      {/* kv-lang-ok: proves the no-voice case (D9) for a language the service doesn't support */}
      <h1>Rakennusluvan hakeminen</h1>
      <p>Haet rakennuslupaa siitä kunnasta, johon rakennus tulee.</p>
      <p>Liitä hakemukseen asemapiirros ja lyhyt kuvaus työstä.</p>
    </article>
  )
}

/**
 * No voice serves the page's language (D9, D14): the Root renders nothing, not a dead Listen
 * button, from the very first render.
 */
export function ArticleWithPlayerInFinnish({ engine }: { engine: ReadAloudEngine }) {
  const articleRef = useRef<HTMLElement>(null)
  return (
    <>
      <ReadAloud.Root contentRef={articleRef} engine={engine}>
        <ReadAloud.Play />
        <ReadAloud.Previous />
        <ReadAloud.Next />
        <ReadAloud.Stop />
        <ReadAloud.Rate />
        <ReadAloud.Status />
      </ReadAloud.Root>
      <FinnishArticle ref={articleRef} />
    </>
  )
}

/**
 * The recommended composition (design spec §5): Play, Previous, Next, Stop, Rate, Status, Note.
 * `Voice` is deliberately left out (D8); see `ArticleWithVoice` for it on its own.
 */
export function ArticleWithPlayer({
  engine,
  name = 'Kvirn',
}: {
  engine: ReadAloudEngine
  name?: string | undefined
}) {
  const articleRef = useRef<HTMLElement>(null)
  return (
    <>
      <ReadAloud.Root contentRef={articleRef} engine={engine} name={name}>
        <ReadAloud.Play />
        <ReadAloud.Previous />
        <ReadAloud.Next />
        <ReadAloud.Stop />
        <ReadAloud.Rate />
        <ReadAloud.Status />
        <ReadAloud.Note howItWorksHref="#how-listening-works" />
        <ReadAloud.SelectionTrigger />
      </ReadAloud.Root>
      <Article ref={articleRef} />
    </>
  )
}

/** `Voice` added to the composition, as its own labelled example: not the recommendation (D8). */
export function ArticleWithVoice({ engine }: { engine: ReadAloudEngine }) {
  const articleRef = useRef<HTMLElement>(null)
  return (
    <>
      <ReadAloud.Root contentRef={articleRef} engine={engine}>
        <ReadAloud.Play />
        <ReadAloud.Previous />
        <ReadAloud.Next />
        <ReadAloud.Stop />
        <ReadAloud.Rate />
        <ReadAloud.Voice />
        <ReadAloud.Status />
      </ReadAloud.Root>
      <Article ref={articleRef} />
    </>
  )
}
