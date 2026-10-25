// kv-lang-ok-file: the language runs are proven with English text and a Swedish (sv) utterance language taken from the voice
import { describe, expect, test } from 'vite-plus/test'
import { createReadAloud } from './create-read-aloud.ts'
import type {
  ReadAloudEngine,
  ReadAloudError,
  ReadAloudHandlers,
  ReadAloudUtterance,
  ReadAloudVoice,
  SpeechHandle,
} from './read-aloud-engine.ts'

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

const swedishVoice: ReadAloudVoice = {
  id: 'sv-1',
  name: 'Sven',
  lang: 'sv',
  quality: 'medium',
  gender: 'male',
  licence: 'CC0',
  attribution: 'Kvirn',
}
const finnishVoice: ReadAloudVoice = {
  id: 'fi-1',
  name: 'Fiia',
  lang: 'fi',
  quality: 'medium',
  gender: 'female',
  licence: 'CC0',
  attribution: 'Kvirn',
}

interface Spoken {
  handle: SpeechHandle
  handlers: ReadAloudHandlers
}

const fakeEnginePrimarySubtag = (tag: string) =>
  tag.toLowerCase().replaceAll('_', '-').split('-')[0]

/**
 * An engine whose `load` resolves (or rejects, via `loadError`) immediately: every chunk that
 * starts playing shows up in `spoken`, and a chunk the machine only prefetched shows up in
 * `loaded` but never in `spoken` unless it is actually played.
 */
function createFakeEngine({
  voices = [swedishVoice, finnishVoice],
  loadError,
  defaultVoiceIds,
}: {
  voices?: ReadAloudVoice[]
  loadError?: (utterance: ReadAloudUtterance) => ReadAloudError | undefined
  /** Overrides what `getDefaultVoiceId` answers for a language, so a test can make it disagree with `voices`. */
  defaultVoiceIds?: Readonly<Record<string, string>>
} = {}) {
  const calls = { unlock: 0, pause: 0, resume: 0, cancel: 0, setRate: 0, destroy: 0 }
  const loaded: ReadAloudUtterance[] = []
  const released: ReadAloudUtterance[] = []
  const spoken: Spoken[] = []
  const engine: ReadAloudEngine = {
    getDefaultVoiceId: (language) =>
      defaultVoiceIds?.[language] ??
      voices.find(
        (voice) => fakeEnginePrimarySubtag(voice.lang) === fakeEnginePrimarySubtag(language),
      )?.id,
    unlock: () => {
      calls.unlock += 1
    },
    getVoices: async () => voices,
    load: async (utterance) => {
      loaded.push(utterance)
      const error = loadError?.(utterance)
      if (error !== undefined) {
        throw { error }
      }
      return { utterance, release: () => released.push(utterance) }
    },
    speak: (handle, handlers) => {
      spoken.push({ handle, handlers })
    },
    pause: () => {
      calls.pause += 1
    },
    resume: () => {
      calls.resume += 1
    },
    cancel: () => {
      calls.cancel += 1
    },
    setRate: () => {
      calls.setRate += 1
    },
    destroy: () => {
      calls.destroy += 1
    },
  }
  return {
    engine,
    calls,
    loaded,
    released,
    spoken,
    playedTexts: () => spoken.map((item) => item.handle.utterance.text),
    last: () => spoken.at(-1)!,
  }
}

const text = 'First sentence. Second sentence. Third sentence.'

function start(options: Parameters<typeof createFakeEngine>[0] = {}) {
  const fake = createFakeEngine(options)
  const readAloud = createReadAloud({ engine: fake.engine, getLanguage: () => 'sv' })
  return { fake, readAloud, state: () => readAloud.getState() }
}

describe('createReadAloud', () => {
  test('never speaks before play', () => {
    const { fake, state } = start()
    expect(state().status).toBe('idle')
    expect(fake.loaded).toHaveLength(0)
  })

  test('play calls unlock synchronously, before any load', () => {
    const { fake, readAloud } = start()
    readAloud.actions.play({ text, source: 'selection' })
    expect(fake.calls.unlock).toBe(1)
    expect(fake.loaded).toHaveLength(0)
  })

  test('play goes through preparing, then loads and speaks the first chunk', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'selection' })
    expect(state().status).toBe('preparing')
    await flush()
    expect(fake.playedTexts()).toEqual(['First sentence.'])
    expect(fake.last().handle.utterance).toMatchObject({ text: 'First sentence.', voiceId: 'sv-1' })
    expect(state()).toMatchObject({ status: 'playing', index: 0, source: 'selection', error: null })
    expect(state().chunks).toHaveLength(3)
  })

  test('the end of a chunk starts the next one', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    fake.last().handlers.onEnd()
    await flush()
    expect(fake.playedTexts()).toEqual(['First sentence.', 'Second sentence.'])
    expect(state().index).toBe(1)
  })

  test('the last end goes idle and resets the index', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    fake.last().handlers.onEnd()
    await flush()
    fake.last().handlers.onEnd()
    await flush()
    fake.last().handlers.onEnd()
    await flush()
    expect(state()).toMatchObject({ status: 'idle', index: 0, chunks: [], error: null })
  })

  test('pause keeps the position and resume continues the same chunk without loading it again', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    fake.last().handlers.onEnd()
    await flush()
    readAloud.actions.pause()
    expect(fake.calls.pause).toBe(1)
    expect(state()).toMatchObject({ status: 'paused', index: 1 })
    readAloud.actions.resume()
    expect(fake.calls.resume).toBe(1)
    expect(state().status).toBe('playing')
    expect(fake.playedTexts()).toEqual(['First sentence.', 'Second sentence.'])
  })

  test('pause during preparing aborts, and resume redoes the request', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    expect(state().status).toBe('preparing')
    readAloud.actions.pause()
    expect(state().status).toBe('paused')
    await flush()
    expect(fake.spoken).toHaveLength(0)
    readAloud.actions.resume()
    expect(state().status).toBe('preparing')
    await flush()
    expect(state().status).toBe('playing')
    expect(fake.playedTexts()).toEqual(['First sentence.'])
  })

  test('stop goes idle, cancels playback and releases the loaded handle', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    readAloud.actions.stop()
    expect(state()).toMatchObject({ status: 'idle', index: 0, chunks: [] })
    expect(fake.calls.cancel).toBe(1)
    expect(fake.released.map((item) => item.text)).toContain('First sentence.')
  })

  test('next and previous while playing speak the neighbouring chunk', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    readAloud.actions.next()
    await flush()
    expect(fake.playedTexts().at(-1)).toBe('Second sentence.')
    readAloud.actions.previous()
    await flush()
    expect(fake.playedTexts().at(-1)).toBe('First sentence.')
    expect(state().index).toBe(0)
  })

  test('next and previous while paused move the index without speaking again', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    readAloud.actions.pause()
    readAloud.actions.next()
    expect(state()).toMatchObject({ status: 'paused', index: 1 })
    readAloud.actions.previous()
    readAloud.actions.previous()
    expect(state().index).toBe(0)
    expect(fake.spoken).toHaveLength(1)
  })

  test('next past the last chunk ends the reading', async () => {
    const { readAloud, state } = start()
    readAloud.actions.play({ text: 'Bara en.', source: 'content' })
    await flush()
    readAloud.actions.next()
    expect(state().status).toBe('idle')
  })

  test('setRate calls the engine directly, without restarting the chunk', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    readAloud.actions.setRate(1.5)
    expect(fake.calls.setRate).toBe(1)
    expect(fake.spoken).toHaveLength(1)
    expect(state().rate).toBe(1.5)
  })

  test('setRate ignores a rate that is not offered and does not load while idle', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.setRate(3)
    expect(state().rate).toBe(1)
    readAloud.actions.setRate(2)
    expect(state().rate).toBe(2)
    expect(fake.loaded).toHaveLength(0)
  })

  test('setVoice while playing restarts the current chunk with that voice', async () => {
    const second: ReadAloudVoice = { ...swedishVoice, id: 'sv-2', name: 'Sara' }
    const { fake, readAloud } = start({ voices: [swedishVoice, second] })
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    readAloud.actions.setVoice('sv-2')
    await flush()
    expect(fake.last().handle.utterance.voiceId).toBe('sv-2')
  })

  test('a language with no voice sets no-voice and loads nothing', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content', language: 'de' })
    await flush()
    expect(state()).toMatchObject({ status: 'idle', error: 'no-voice' })
    expect(fake.loaded).toHaveLength(0)
  })

  test('a voice matches by primary subtag', async () => {
    const { fake, readAloud } = start({ voices: [{ ...swedishVoice, lang: 'sv' }] })
    readAloud.actions.play({ text, source: 'content', language: 'sv-FI' })
    await flush()
    expect(fake.last().handle.utterance.voiceId).toBe('sv-1')
  })

  test('the exact tag wins over the primary subtag', async () => {
    const finland: ReadAloudVoice = { ...swedishVoice, id: 'sv-fi', name: 'Sixten', lang: 'sv-FI' }
    const { fake, readAloud } = start({ voices: [swedishVoice, finland] })
    readAloud.actions.play({ text, source: 'content', language: 'sv-FI' })
    await flush()
    expect(fake.last().handle.utterance.voiceId).toBe('sv-fi')
  })

  test('an explicit voice that disappeared falls back to the best voice for the language', async () => {
    const { fake, readAloud } = start()
    readAloud.actions.setVoice('gone')
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    expect(fake.last().handle.utterance.voiceId).toBe('sv-1')
  })

  test('a speech error goes idle with speech-error', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    fake.last().handlers.onError('speech-error')
    expect(state()).toMatchObject({ status: 'idle', error: 'speech-error' })
  })

  test('text-too-long skips the chunk, counts it and keeps reading (D10)', async () => {
    const { fake, readAloud, state } = start({
      loadError: (utterance) =>
        utterance.text === 'First sentence.' ? 'text-too-long' : undefined,
    })
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    expect(state()).toMatchObject({ status: 'playing', index: 1, skippedCount: 1 })
    expect(fake.playedTexts()).toEqual(['Second sentence.'])
  })

  test('service-unavailable stops playback and sets the error', async () => {
    const { fake, readAloud, state } = start({ loadError: () => 'service-unavailable' })
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    expect(state()).toMatchObject({ status: 'idle', error: 'service-unavailable' })
    expect(fake.spoken).toHaveLength(0)
  })

  test('destroy aborts, releases and ignores later actions', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    await flush()
    const loadedBeforeDestroy = fake.loaded.length
    readAloud.actions.destroy()
    expect(fake.calls.destroy).toBe(1)
    readAloud.actions.play({ text, source: 'content' })
    expect(state().status).toBe('idle')
    expect(fake.loaded).toHaveLength(loadedBeforeDestroy)
  })

  test('a chosen voice of another language is not used: the best voice for the language is', async () => {
    const english: ReadAloudVoice = {
      id: 'en-1',
      name: 'Eve',
      lang: 'en-GB',
      quality: 'high',
      gender: 'female',
      licence: 'CC0',
      attribution: 'Kvirn',
    }
    const { fake, readAloud, state } = start({ voices: [swedishVoice, english] })
    readAloud.actions.setVoice('sv-1')
    readAloud.actions.play({ text: 'Hello there.', source: 'content', language: 'en' })
    await flush()
    expect(fake.last().handle.utterance.voiceId).toBe('en-1')
    expect(state().voiceId).toBe('en-1')
  })

  test('a chosen voice of another language with no voice for the language gives no-voice', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.setVoice('sv-1')
    readAloud.actions.play({ text: 'Hello there.', source: 'content', language: 'en' })
    await flush()
    expect(fake.loaded).toHaveLength(0)
    expect(state()).toMatchObject({ error: 'no-voice', errorLanguage: 'en', voiceId: null })
  })

  test('each chunk is spoken with a voice for its own language', async () => {
    const english: ReadAloudVoice = {
      id: 'en-1',
      name: 'Eve',
      lang: 'en-GB',
      quality: 'high',
      gender: 'female',
      licence: 'CC0',
      attribution: 'Kvirn',
    }
    const { fake, readAloud } = start({ voices: [swedishVoice, english] })
    const source = 'Hej där. Hello there. Hej igen.'
    readAloud.actions.play({
      text: source,
      source: 'content',
      languageRuns: [{ start: 9, end: 21, language: 'en' }],
    })
    await flush()
    fake.last().handlers.onEnd()
    await flush()
    fake.last().handlers.onEnd()
    await flush()
    expect(
      fake.spoken.map((item) => [item.handle.utterance.text, item.handle.utterance.voiceId]),
    ).toEqual([
      ['Hej där.', 'sv-1'],
      ['Hello there.', 'en-1'],
      ['Hej igen.', 'sv-1'],
    ])
  })

  test('an inline chunk in a language with no voice is skipped, counted, and reading continues (D10)', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({
      text: 'Hej där. Hallo da. Hej igen.',
      source: 'content',
      languageRuns: [{ start: 9, end: 18, language: 'de' }],
    })
    await flush()
    fake.last().handlers.onEnd()
    await flush()
    expect(state()).toMatchObject({ status: 'playing', index: 2, skippedCount: 1 })
    expect(fake.playedTexts()).toEqual(['Hej där.', 'Hej igen.'])
  })

  test('hasVoice resolves synchronously from the engine, before any voice list loads (D14)', async () => {
    const { readAloud, state } = start()
    expect(state().hasVoice).toBe(true)
    readAloud.actions.loadVoices()
    expect(state().voicesStatus).toBe('loading')
    expect(state().hasVoice).toBe(true)
    await flush()
    expect(state()).toMatchObject({ voicesStatus: 'ready', hasVoice: true })
  })

  test('hasVoice is false synchronously for a language the engine has no voice for, fi and nn (D14)', () => {
    const fake = createFakeEngine({ voices: [swedishVoice] })
    const readAloud = createReadAloud({ engine: fake.engine, getLanguage: () => 'nn' })
    expect(readAloud.getState().hasVoice).toBe(false)
  })

  test('a fetched voice list that disagrees with the synchronous default corrects hasVoice (D14)', async () => {
    const fake = createFakeEngine({
      voices: [swedishVoice],
      defaultVoiceIds: { fi: 'fi-ghost' },
    })
    const readAloud = createReadAloud({ engine: fake.engine, getLanguage: () => 'fi' })
    expect(readAloud.getState().hasVoice).toBe(true)
    readAloud.actions.loadVoices()
    await flush()
    expect(readAloud.getState()).toMatchObject({ voicesStatus: 'ready', hasVoice: false })
  })

  test('loadVoices is idempotent and callable without play', async () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.loadVoices()
    readAloud.actions.loadVoices()
    await flush()
    const voicesLoaded = fake.loaded.length
    readAloud.actions.loadVoices()
    await flush()
    expect(state().voicesStatus).toBe('ready')
    expect(fake.loaded).toHaveLength(voicesLoaded)
  })
})
