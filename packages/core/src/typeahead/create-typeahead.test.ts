import { describe, expect, test } from 'vite-plus/test'
import { createTypeahead } from './create-typeahead.ts'
import type { TypeaheadEnv } from './create-typeahead.ts'

interface Timer {
  id: number
  at: number
  run: () => void
}

function createFakeEnv() {
  let now = 0
  let nextId = 1
  let timers: Timer[] = []
  const env: TypeaheadEnv = {
    window: {
      setTimeout: (handler, milliseconds) => {
        const id = nextId++
        timers.push({ id, at: now + milliseconds, run: handler })
        return id
      },
      clearTimeout: (id) => {
        timers = timers.filter((timer) => timer.id !== id)
      },
    },
  }
  return {
    env,
    advance: (milliseconds: number) => {
      now += milliseconds
      const due = timers.filter((timer) => timer.at <= now)
      timers = timers.filter((timer) => timer.at > now)
      for (const timer of due) {
        timer.run()
      }
    },
  }
}

const labels = ['Apple', 'Apricot', 'Banana', 'Cherry']

describe('createTypeahead', () => {
  test('builds a word from the characters and matches it', () => {
    const { env } = createFakeEnv()
    const typeahead = createTypeahead({ env })
    expect(typeahead.type('a', labels, -1)).toBe(0)
    expect(typeahead.type('p', labels, 0)).toBe(0)
    expect(typeahead.type('r', labels, 0)).toBe(1)
    expect(typeahead.hasWord()).toBe(true)
  })

  test('cycles with a repeated character', () => {
    const { env } = createFakeEnv()
    const typeahead = createTypeahead({ env })
    expect(typeahead.type('a', labels, -1)).toBe(0)
    expect(typeahead.type('a', labels, 0)).toBe(1)
    expect(typeahead.type('a', labels, 1)).toBe(0)
  })

  test('a pause of 500 milliseconds ends the word', () => {
    const { env, advance } = createFakeEnv()
    const typeahead = createTypeahead({ env })
    typeahead.type('b', labels, -1)
    advance(499)
    expect(typeahead.hasWord()).toBe(true)
    advance(1)
    expect(typeahead.hasWord()).toBe(false)
    expect(typeahead.type('c', labels, 2)).toBe(3)
  })

  test('each character restarts the pause', () => {
    const { env, advance } = createFakeEnv()
    const typeahead = createTypeahead({ env })
    typeahead.type('a', labels, -1)
    advance(400)
    typeahead.type('p', labels, 0)
    advance(400)
    expect(typeahead.hasWord()).toBe(true)
  })

  test('the pause is configurable', () => {
    const { env, advance } = createFakeEnv()
    const typeahead = createTypeahead({ env, resetMilliseconds: 100 })
    typeahead.type('a', labels, -1)
    advance(100)
    expect(typeahead.hasWord()).toBe(false)
  })

  test('reset ends the word and cancels the timer', () => {
    const { env } = createFakeEnv()
    const typeahead = createTypeahead({ env })
    typeahead.type('a', labels, -1)
    typeahead.reset()
    expect(typeahead.hasWord()).toBe(false)
  })

  test('without an env the word only ends with reset', () => {
    const typeahead = createTypeahead()
    typeahead.type('a', labels, -1)
    expect(typeahead.hasWord()).toBe(true)
    typeahead.reset()
    expect(typeahead.hasWord()).toBe(false)
  })

  test('finds å, ä and ö in Swedish', () => {
    const { env, advance } = createFakeEnv()
    const typeahead = createTypeahead({ env, locale: 'sv' })
    const swedish = ['Aka', 'Åka', 'Äta', 'Öppna']
    expect(typeahead.type('å', swedish, -1)).toBe(1)
    advance(500)
    expect(typeahead.type('ä', swedish, 1)).toBe(2)
    advance(500)
    expect(typeahead.type('ö', swedish, 2)).toBe(3)
  })

  test('ignores an empty character', () => {
    const typeahead = createTypeahead()
    expect(typeahead.type('', labels, -1)).toBeUndefined()
    expect(typeahead.hasWord()).toBe(false)
  })
})
