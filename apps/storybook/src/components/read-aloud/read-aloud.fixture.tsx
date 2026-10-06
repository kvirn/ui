import type { ReadAloudEngine, ReadAloudVoice } from '@kvirn-ui/core'
import { KvirnProvider, ReadAloud } from '@kvirn-ui/react'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import type { Decorator } from '@storybook/react-vite'
import { useEffect, useMemo, useRef, useState } from 'react'

// Story fixture for Components/ReadAloud. The stories never speak: a fake engine stands in for
// `speechSynthesis`, so the sound, the installed voices and the timing are the same in every
// browser and in CI.
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

export const englishVoices: ReadAloudVoice[] = [
  { voiceURI: 'fake-en-one', name: 'English One', lang: 'en-GB', localService: true },
  { voiceURI: 'fake-en-two', name: 'English Two', lang: 'en-US', localService: true },
]
export const swedishVoice: ReadAloudVoice = {
  voiceURI: 'fake-sv-one',
  name: 'Svenska',
  lang: 'sv-SE',
  localService: true,
}

export interface FakeEngineOptions {
  isSupported?: boolean
  voices?: ReadAloudVoice[]
  /** Milliseconds a sentence "takes". `null` never ends: the reader stays on one sentence. */
  sentenceDuration?: number | null
}

export function createFakeEngine({
  isSupported = true,
  voices = [...englishVoices, swedishVoice],
  sentenceDuration = 600,
}: FakeEngineOptions = {}): ReadAloudEngine {
  let timer: ReturnType<typeof setTimeout> | undefined
  return {
    isSupported: () => isSupported,
    getVoices: () => voices,
    onVoicesChanged: () => () => {},
    speak: (_utterance, { onEnd }) => {
      clearTimeout(timer)
      if (sentenceDuration !== null) {
        timer = setTimeout(onEnd, sentenceDuration)
      }
    },
    cancel: () => clearTimeout(timer),
  }
}

export function useFakeEngine(options: FakeEngineOptions = {}): ReadAloudEngine {
  const { isSupported, sentenceDuration } = options
  const voiceCount = options.voices?.length
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the options are plain values, so their parts are the keys
  return useMemo(() => createFakeEngine(options), [isSupported, sentenceDuration, voiceCount])
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
        Du kan följa ärendet under Mina sidor. Där ser du också vilka handlingar som saknas.
      </p>
      <p>
        A decision comes by post and in your digital mailbox. You can appeal within three weeks.
      </p>
    </article>
  )
}

export function ArticleWithPlayer({
  engine,
  lang,
  allowRemoteVoices,
}: {
  engine?: ReadAloudEngine | undefined
  lang?: string | undefined
  allowRemoteVoices?: boolean | undefined
}) {
  const articleRef = useRef<HTMLElement>(null)
  return (
    <>
      <ReadAloud.Root
        contentRef={articleRef}
        engine={engine}
        lang={lang}
        allowRemoteVoices={allowRemoteVoices}
      >
        <ReadAloud.Play />
        <ReadAloud.Previous />
        <ReadAloud.Next />
        <ReadAloud.Stop />
        <ReadAloud.Rate />
        <ReadAloud.Voice />
        <ReadAloud.Status />
        <ReadAloud.SelectionTrigger />
      </ReadAloud.Root>
      <Article ref={articleRef} />
    </>
  )
}

export function SpeechDiagnostics() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const isSupported = typeof speechSynthesis !== 'undefined'
  useEffect(() => {
    if (!isSupported) {
      return undefined
    }
    const update = () => setVoices(speechSynthesis.getVoices())
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [isSupported])
  const localCount = voices.filter((voice) => voice.localService).length
  return (
    <div data-testid="diagnostics">
      <p>
        speechSynthesis supported: {isSupported ? 'yes' : 'no'}. Voices: {voices.length}, local:{' '}
        {localCount}.
      </p>
      <ul>
        {voices.map((voice) => (
          <li key={voice.voiceURI}>
            {voice.name} ({voice.lang}, {voice.localService ? 'local' : 'remote'})
          </li>
        ))}
      </ul>
    </div>
  )
}
