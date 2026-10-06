import { describe, expect, test } from 'vite-plus/test'
import type { Env } from '../env/env.ts'
import { createSpeechEngine } from './create-speech-engine.ts'

const voices = [
  { voiceURI: 'local', name: 'Local', lang: 'sv-SE', localService: true },
  { voiceURI: 'remote', name: 'Remote', lang: 'sv-SE', localService: false },
]

class FakeUtterance {
  lang = ''
  rate = 1
  voice: unknown = null
  onend: (() => void) | null = null
  onerror: ((event: { error: string }) => void) | null = null
  constructor(readonly text: string) {}
}

function createFakeEnv() {
  const target = new EventTarget()
  const utterances: FakeUtterance[] = []
  const synthesis = {
    getVoices: () => voices,
    speak: (utterance: FakeUtterance) => utterances.push(utterance),
    cancel: () => {},
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
  }
  const env = {
    window: { speechSynthesis: synthesis, SpeechSynthesisUtterance: FakeUtterance },
  } as unknown as Env
  return {
    env,
    utterances,
    emitVoicesChanged: () => target.dispatchEvent(new Event('voiceschanged')),
  }
}

const handlers = () => {
  const calls = { end: 0, error: 0 }
  return { calls, handlers: { onEnd: () => (calls.end += 1), onError: () => (calls.error += 1) } }
}

describe('createSpeechEngine', () => {
  test('is unsupported without an env or without speechSynthesis', () => {
    expect(createSpeechEngine(undefined).isSupported()).toBe(false)
    expect(createSpeechEngine({ window: {} } as unknown as Env).isSupported()).toBe(false)
    expect(createSpeechEngine(createFakeEnv().env).isSupported()).toBe(true)
  })

  test('offers local voices only by default', () => {
    const engine = createSpeechEngine(createFakeEnv().env)
    expect(engine.getVoices().map((voice) => voice.voiceURI)).toEqual(['local'])
  })

  test('counts every voice the platform reports, filtered or not', () => {
    const { env } = createFakeEnv()
    expect(createSpeechEngine(env).getAllVoiceCount?.()).toBe(2)
    expect(createSpeechEngine(env).getVoices()).toHaveLength(1)
  })

  test('offers remote voices only with allowRemoteVoices', () => {
    const engine = createSpeechEngine(createFakeEnv().env, { allowRemoteVoices: true })
    expect(engine.getVoices().map((voice) => voice.voiceURI)).toEqual(['local', 'remote'])
  })

  test('tells a listener when the voices change, until it is removed', () => {
    const { env, emitVoicesChanged } = createFakeEnv()
    const engine = createSpeechEngine(env)
    let count = 0
    const remove = engine.onVoicesChanged(() => (count += 1))
    emitVoicesChanged()
    remove()
    emitVoicesChanged()
    expect(count).toBe(1)
  })

  test('speak starts the utterance before it returns', () => {
    const { env, utterances } = createFakeEnv()
    createSpeechEngine(env).speak(
      { text: 'Hej', language: 'sv', voiceURI: 'local', rate: 1.25 },
      handlers().handlers,
    )
    expect(utterances).toHaveLength(1)
    expect(utterances[0]).toMatchObject({ text: 'Hej', lang: 'sv', rate: 1.25 })
  })

  test('speak with a remote voice that is not allowed reports an error and speaks nothing', () => {
    const { env, utterances } = createFakeEnv()
    const { calls, handlers: callbacks } = handlers()
    createSpeechEngine(env).speak(
      { text: 'Hej', language: 'sv', voiceURI: 'remote', rate: 1 },
      callbacks,
    )
    expect(utterances).toHaveLength(0)
    expect(calls.error).toBe(1)
  })

  test('the end of the active utterance calls onEnd', () => {
    const { env, utterances } = createFakeEnv()
    const { calls, handlers: callbacks } = handlers()
    createSpeechEngine(env).speak(
      { text: 'Hej', language: 'sv', voiceURI: 'local', rate: 1 },
      callbacks,
    )
    utterances[0]?.onend?.()
    expect(calls.end).toBe(1)
  })

  test('a cancelled utterance calls neither onEnd nor onError', () => {
    const { env, utterances } = createFakeEnv()
    const { calls, handlers: callbacks } = handlers()
    const engine = createSpeechEngine(env)
    engine.speak({ text: 'Hej', language: 'sv', voiceURI: 'local', rate: 1 }, callbacks)
    engine.cancel()
    utterances[0]?.onerror?.({ error: 'interrupted' })
    utterances[0]?.onend?.()
    expect(calls).toEqual({ end: 0, error: 0 })
  })

  test('a real speech error calls onError, and interrupted never does', () => {
    const { env, utterances } = createFakeEnv()
    const { calls, handlers: callbacks } = handlers()
    const engine = createSpeechEngine(env)
    engine.speak({ text: 'Hej', language: 'sv', voiceURI: 'local', rate: 1 }, callbacks)
    utterances[0]?.onerror?.({ error: 'canceled' })
    expect(calls.error).toBe(0)
    utterances[0]?.onerror?.({ error: 'synthesis-failed' })
    expect(calls.error).toBe(1)
  })

  test('speak without a named voice is refused unless remote voices are allowed', () => {
    const refused = createFakeEnv()
    const { calls, handlers: callbacks } = handlers()
    createSpeechEngine(refused.env).speak(
      { text: 'Hej', language: 'sv', voiceURI: null, rate: 1 },
      callbacks,
    )
    expect(refused.utterances).toHaveLength(0)
    expect(calls.error).toBe(1)

    const allowed = createFakeEnv()
    createSpeechEngine(allowed.env, { allowRemoteVoices: true }).speak(
      { text: 'Hej', language: 'sv', voiceURI: null, rate: 1 },
      handlers().handlers,
    )
    expect(allowed.utterances).toHaveLength(1)
  })
})
