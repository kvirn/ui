import { describe, expect, test } from 'vite-plus/test'
import { createReadAloud } from './create-read-aloud.ts'
import type {
  ReadAloudEngine,
  ReadAloudHandlers,
  ReadAloudUtterance,
  ReadAloudVoice,
} from './read-aloud-engine.ts'

const swedishVoice: ReadAloudVoice = {
  voiceURI: 'sv-1',
  name: 'Sven',
  lang: 'sv-SE',
  localService: true,
}
const finnishVoice: ReadAloudVoice = {
  voiceURI: 'fi-1',
  name: 'Fiia',
  lang: 'fi-FI',
  localService: true,
}

function createFakeEngine({ supported = true, voices = [swedishVoice, finnishVoice] } = {}) {
  let currentVoices = voices
  const listeners = new Set<() => void>()
  const spoken: Array<{ utterance: ReadAloudUtterance; handlers: ReadAloudHandlers }> = []
  let cancelCount = 0
  const engine: ReadAloudEngine = {
    isSupported: () => supported,
    getVoices: () => currentVoices,
    onVoicesChanged(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    speak: (utterance, handlers) => {
      spoken.push({ utterance, handlers })
    },
    cancel: () => {
      cancelCount += 1
    },
  }
  return {
    engine,
    spoken,
    texts: () => spoken.map((item) => item.utterance.text),
    last: () => spoken.at(-1)!,
    cancelCount: () => cancelCount,
    listenerCount: () => listeners.size,
    setVoices(next: ReadAloudVoice[]) {
      currentVoices = next
      for (const listener of listeners) {
        listener()
      }
    },
  }
}

const text = 'Första meningen. Andra meningen. Tredje meningen.'

function start(options: Parameters<typeof createFakeEngine>[0] = {}) {
  const fake = createFakeEngine(options)
  const readAloud = createReadAloud({ engine: fake.engine, getLanguage: () => 'sv' })
  return { fake, readAloud, state: () => readAloud.getState() }
}

describe('createReadAloud', () => {
  test('never speaks before play', () => {
    const { fake, state } = start()
    expect(state().status).toBe('idle')
    expect(fake.spoken).toHaveLength(0)
  })

  test('play speaks the first chunk synchronously', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'selection' })
    expect(fake.texts()).toEqual(['Första meningen.'])
    expect(fake.last().utterance).toMatchObject({ language: 'sv', voiceURI: 'sv-1', rate: 1 })
    expect(state()).toMatchObject({ status: 'playing', index: 0, source: 'selection', error: null })
    expect(state().chunks).toHaveLength(3)
  })

  test('the end of a chunk starts the next one', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    fake.last().handlers.onEnd()
    expect(fake.texts()).toEqual(['Första meningen.', 'Andra meningen.'])
    expect(state().index).toBe(1)
  })

  test('the last end goes idle and resets the index', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    fake.last().handlers.onEnd()
    fake.last().handlers.onEnd()
    fake.last().handlers.onEnd()
    expect(state()).toMatchObject({ status: 'idle', index: 0, chunks: [], error: null })
  })

  test('pause cancels and resume restarts the same chunk', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    fake.last().handlers.onEnd()
    const cancelsBefore = fake.cancelCount()
    readAloud.actions.pause()
    expect(fake.cancelCount()).toBeGreaterThan(cancelsBefore)
    expect(state()).toMatchObject({ status: 'paused', index: 1 })
    readAloud.actions.resume()
    expect(fake.texts().at(-1)).toBe('Andra meningen.')
    expect(state().status).toBe('playing')
  })

  test('an end from a cancelled utterance is ignored', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    const stale = fake.last().handlers
    readAloud.actions.pause()
    stale.onEnd()
    expect(state()).toMatchObject({ status: 'paused', index: 0 })
    expect(fake.spoken).toHaveLength(1)
  })

  test('stop goes idle and cancels', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    const stale = fake.last().handlers
    readAloud.actions.stop()
    stale.onEnd()
    expect(state()).toMatchObject({ status: 'idle', index: 0, chunks: [] })
    expect(fake.spoken).toHaveLength(1)
  })

  test('next and previous while playing speak the neighbouring chunk', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    readAloud.actions.next()
    expect(fake.texts().at(-1)).toBe('Andra meningen.')
    readAloud.actions.previous()
    expect(fake.texts().at(-1)).toBe('Första meningen.')
    expect(state().index).toBe(0)
  })

  test('next and previous while paused move the index without speaking', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    readAloud.actions.pause()
    readAloud.actions.next()
    expect(state()).toMatchObject({ status: 'paused', index: 1 })
    readAloud.actions.previous()
    readAloud.actions.previous()
    expect(state().index).toBe(0)
    expect(fake.spoken).toHaveLength(1)
  })

  test('next past the last chunk ends the reading', () => {
    const { readAloud, state } = start()
    readAloud.actions.play({ text: 'Bara en.', source: 'content' })
    readAloud.actions.next()
    expect(state().status).toBe('idle')
  })

  test('setRate while playing restarts the current chunk at the new rate', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    readAloud.actions.setRate(1.5)
    expect(fake.spoken).toHaveLength(2)
    expect(fake.last().utterance).toMatchObject({ text: 'Första meningen.', rate: 1.5 })
    expect(state().rate).toBe(1.5)
  })

  test('setRate ignores a rate that is not offered and does not speak while idle', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.setRate(3)
    expect(state().rate).toBe(1)
    readAloud.actions.setRate(2)
    expect(state().rate).toBe(2)
    expect(fake.spoken).toHaveLength(0)
  })

  test('setVoice while playing restarts the current chunk with that voice', () => {
    const second: ReadAloudVoice = {
      voiceURI: 'sv-2',
      name: 'Sara',
      lang: 'sv-SE',
      localService: true,
    }
    const { fake, readAloud } = start({ voices: [swedishVoice, second] })
    readAloud.actions.play({ text, source: 'content' })
    readAloud.actions.setVoice('sv-2')
    expect(fake.last().utterance.voiceURI).toBe('sv-2')
  })

  test('a language with no voice sets no-voice and speaks nothing', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content', language: 'de' })
    expect(state()).toMatchObject({ status: 'idle', error: 'no-voice' })
    expect(fake.spoken).toHaveLength(0)
  })

  test('a voice matches by primary subtag', () => {
    const { fake, readAloud } = start({ voices: [{ ...swedishVoice, lang: 'sv' }] })
    readAloud.actions.play({ text, source: 'content', language: 'sv-FI' })
    expect(fake.last().utterance.voiceURI).toBe('sv-1')
  })

  test('the exact tag wins over the primary subtag', () => {
    const finland: ReadAloudVoice = {
      voiceURI: 'sv-fi',
      name: 'Sixten',
      lang: 'sv-FI',
      localService: true,
    }
    const { fake, readAloud } = start({ voices: [swedishVoice, finland] })
    readAloud.actions.play({ text, source: 'content', language: 'sv-FI' })
    expect(fake.last().utterance.voiceURI).toBe('sv-fi')
  })

  test('an explicit voice that disappeared falls back to the best voice for the language', () => {
    const { fake, readAloud } = start()
    readAloud.actions.setVoice('gone')
    readAloud.actions.play({ text, source: 'content' })
    expect(fake.last().utterance.voiceURI).toBe('sv-1')
  })

  test('voices that arrive later are used by the next play', () => {
    const { fake, readAloud, state } = start({ voices: [] })
    readAloud.actions.play({ text, source: 'content' })
    expect(state().error).toBe('no-voice')
    fake.setVoices([swedishVoice])
    expect(state().voices).toEqual([swedishVoice])
    readAloud.actions.play({ text, source: 'content' })
    expect(state()).toMatchObject({ status: 'playing', error: null })
  })

  test('a speech error goes idle with speech-error', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    fake.last().handlers.onError()
    expect(state()).toMatchObject({ status: 'idle', error: 'speech-error' })
  })

  test('an unsupported engine is unsupported and every action does nothing', () => {
    const { fake, readAloud, state } = start({ supported: false })
    expect(state().status).toBe('unsupported')
    readAloud.actions.play({ text, source: 'content' })
    readAloud.actions.resume()
    readAloud.actions.setRate(2)
    readAloud.actions.next()
    expect(state()).toMatchObject({ status: 'unsupported', rate: 1 })
    expect(fake.spoken).toHaveLength(0)
    expect(fake.listenerCount()).toBe(0)
  })

  test('destroy cancels, stops listening for voices and ignores later actions', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({ text, source: 'content' })
    const stale = fake.last().handlers
    const cancelsBefore = fake.cancelCount()
    readAloud.actions.destroy()
    expect(fake.cancelCount()).toBeGreaterThan(cancelsBefore)
    expect(fake.listenerCount()).toBe(0)
    stale.onEnd()
    readAloud.actions.play({ text, source: 'content' })
    expect(state().status).toBe('idle')
    expect(fake.spoken).toHaveLength(1)
  })

  test('a chosen voice of another language is not used: the best voice for the language is', () => {
    const english: ReadAloudVoice = {
      voiceURI: 'en-1',
      name: 'Eve',
      lang: 'en-GB',
      localService: true,
    }
    const { fake, readAloud, state } = start({ voices: [swedishVoice, english] })
    readAloud.actions.setVoice('sv-1')
    readAloud.actions.play({ text: 'Hello there.', source: 'content', language: 'en' })
    expect(fake.last().utterance).toMatchObject({ language: 'en', voiceURI: 'en-1' })
    expect(state().voiceURI).toBe('en-1')
  })

  test('a chosen voice of another language with no voice for the language gives no-voice', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.setVoice('sv-1')
    readAloud.actions.play({ text: 'Hello there.', source: 'content', language: 'en' })
    expect(fake.spoken).toHaveLength(0)
    expect(state()).toMatchObject({ error: 'no-voice', errorLanguage: 'en', voiceURI: null })
  })

  test('each chunk is spoken with a voice for its own language', () => {
    const english: ReadAloudVoice = {
      voiceURI: 'en-1',
      name: 'Eve',
      lang: 'en-GB',
      localService: true,
    }
    const { fake, readAloud } = start({ voices: [swedishVoice, english] })
    const source = 'Hej där. Hello there. Hej igen.'
    readAloud.actions.play({
      text: source,
      source: 'content',
      languageRuns: [{ start: 9, end: 21, language: 'en' }],
    })
    fake.last().handlers.onEnd()
    fake.last().handlers.onEnd()
    expect(
      fake.spoken.map((item) => [
        item.utterance.text,
        item.utterance.language,
        item.utterance.voiceURI,
      ]),
    ).toEqual([
      ['Hej där.', 'sv', 'sv-1'],
      ['Hello there.', 'en', 'en-1'],
      ['Hej igen.', 'sv', 'sv-1'],
    ])
  })

  test('a chunk in a language with no voice stops there and names the language', () => {
    const { fake, readAloud, state } = start()
    readAloud.actions.play({
      text: 'Hej där. Hallo da.',
      source: 'content',
      languageRuns: [{ start: 9, end: 18, language: 'de' }],
    })
    fake.last().handlers.onEnd()
    expect(fake.spoken).toHaveLength(1)
    expect(state()).toMatchObject({ status: 'idle', error: 'no-voice', errorLanguage: 'de' })
  })
})
