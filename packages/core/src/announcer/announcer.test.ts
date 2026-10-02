import { describe, expect, test } from 'vite-plus/test'
import { createAnnouncer } from './announcer.ts'
import type { AnnouncerEnv } from './announcer.ts'

interface Timer {
  id: number
  at: number
  run: () => void
}

/** A hand-driven clock and timers. No DOM and no real waiting in Node. */
function createFakeEnv() {
  let now = 0
  let nextId = 1
  let timers: Timer[] = []
  const env: AnnouncerEnv = {
    window: {
      performance: { now: () => now },
      setTimeout: (handler, milliseconds) => {
        const id = nextId++
        timers.push({
          id,
          at: now + milliseconds,
          run: handler,
        })
        return id
      },
      clearTimeout: (id) => {
        timers = timers.filter((timer) => timer.id !== id)
      },
    },
  }
  return {
    env,
    pendingTimers: () => timers.length,
    /** Moves time forward, running every timer that falls due, in order. */
    advance(milliseconds: number) {
      const target = now + milliseconds
      for (;;) {
        const due = timers.filter((timer) => timer.at <= target).toSorted((a, b) => a.at - b.at)[0]
        if (due === undefined) {
          break
        }
        timers = timers.filter((timer) => timer !== due)
        now = due.at
        due.run()
      }
      now = target
    },
  }
}

describe('announce', () => {
  test('puts the message in the polite region after a short delay, never in the same turn', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    expect(announcer.actions.announce('Saved')).toBe(true)
    expect(announcer.getState()).toEqual({ polite: '', assertive: '' })

    clock.advance(100)
    expect(announcer.getState()).toEqual({ polite: 'Saved', assertive: '' })
  })

  test('starts with both regions empty', () => {
    expect(createAnnouncer(createFakeEnv().env).getState()).toEqual({ polite: '', assertive: '' })
  })

  test('politeness "assertive" uses the assertive region and leaves the polite one alone', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)
    announcer.actions.announce('Saved')
    clock.advance(100)

    announcer.actions.announce('Session expired', { politeness: 'assertive' })
    clock.advance(100)

    expect(announcer.getState()).toEqual({ polite: 'Saved', assertive: 'Session expired' })
  })

  test('an empty or blank message is ignored', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    expect(announcer.actions.announce('')).toBe(false)
    expect(announcer.actions.announce('   ')).toBe(false)
    expect(clock.pendingTimers()).toBe(0)
  })

  test('without an env (server rendering) it does nothing and reports false', () => {
    const announcer = createAnnouncer(undefined)

    expect(announcer.actions.announce('Saved')).toBe(false)
    expect(announcer.getState()).toEqual({ polite: '', assertive: '' })
  })
})

describe('clear, then set', () => {
  test('the same message again empties the region first, so it is read again', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)
    const seen: string[] = []
    announcer.subscribe(() => seen.push(announcer.getState().polite))

    announcer.actions.announce('Saved')
    clock.advance(100)
    announcer.actions.announce('Saved')
    expect(announcer.getState().polite).toBe('')
    clock.advance(100)

    expect(seen).toEqual(['Saved', '', 'Saved'])
  })

  test('a second message in the same delay replaces the first instead of queueing', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    announcer.actions.announce('First')
    clock.advance(40)
    announcer.actions.announce('Second')
    clock.advance(100)

    expect(announcer.getState().polite).toBe('Second')
  })

  test('the text is removed after a while, so it is not left for browse mode', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    announcer.actions.announce('Saved')
    clock.advance(100)
    expect(announcer.getState().polite).toBe('Saved')
    clock.advance(4999)
    expect(announcer.getState().polite).toBe('Saved')
    clock.advance(1)
    expect(announcer.getState().polite).toBe('')
    expect(clock.pendingTimers()).toBe(0)
  })

  test('a new message cancels the removal of the old one', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    announcer.actions.announce('One')
    clock.advance(100)
    clock.advance(4000)
    announcer.actions.announce('Two')
    clock.advance(100)
    clock.advance(4000)

    expect(announcer.getState().polite).toBe('Two')
  })
})

describe('throttle per key', () => {
  test('a second message with the same key inside 3000 ms is dropped', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    expect(announcer.actions.announce('Only digits', { key: 'phone' })).toBe(true)
    clock.advance(100)
    clock.advance(2000)
    expect(announcer.actions.announce('Only digits', { key: 'phone' })).toBe(false)
    expect(announcer.actions.announce('Something else', { key: 'phone' })).toBe(false)
    clock.advance(100)

    expect(announcer.getState().polite).toBe('Only digits')
  })

  test('the same key is announced again once 3000 ms have passed since the last announcement', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    announcer.actions.announce('Only digits', { key: 'phone' })
    clock.advance(2999)
    expect(announcer.actions.announce('Only digits', { key: 'phone' })).toBe(false)
    clock.advance(1)
    expect(announcer.actions.announce('Only digits', { key: 'phone' })).toBe(true)
  })

  test('a dropped message does not extend the throttle, so holding a key still gets through', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)
    let announced = 0

    for (let pressed = 0; pressed < 100; pressed += 1) {
      if (announcer.actions.announce('Only digits', { key: 'phone' })) {
        announced += 1
      }
      clock.advance(100)
    }

    expect(announced).toBe(4)
  })

  test('different keys are throttled separately', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    expect(announcer.actions.announce('One', { key: 'a' })).toBe(true)
    expect(announcer.actions.announce('Two', { key: 'b' })).toBe(true)
  })

  test('throttleMilliseconds sets the window for that call', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    announcer.actions.announce('Full', { key: 'code', throttleMilliseconds: 500 })
    clock.advance(499)
    expect(announcer.actions.announce('Full', { key: 'code', throttleMilliseconds: 500 })).toBe(
      false,
    )
    clock.advance(1)
    expect(announcer.actions.announce('Full', { key: 'code', throttleMilliseconds: 500 })).toBe(
      true,
    )
  })

  test('throttleMilliseconds 0 turns the throttle off', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    expect(announcer.actions.announce('Ping', { key: 'x', throttleMilliseconds: 0 })).toBe(true)
    expect(announcer.actions.announce('Ping', { key: 'x', throttleMilliseconds: 0 })).toBe(true)
  })

  test('an invalid throttleMilliseconds falls back to 3000', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    announcer.actions.announce('Ping', { key: 'x', throttleMilliseconds: -5 })
    expect(announcer.actions.announce('Ping', { key: 'x', throttleMilliseconds: Number.NaN })).toBe(
      false,
    )
  })

  test('without a key nothing is throttled', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    expect(announcer.actions.announce('Saved')).toBe(true)
    expect(announcer.actions.announce('Saved')).toBe(true)
  })

  test('the key is shared by both politeness levels', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)

    announcer.actions.announce('Careful', { key: 'form', politeness: 'assertive' })
    expect(announcer.actions.announce('Careful', { key: 'form' })).toBe(false)
  })
})

describe('clear', () => {
  test('empties both regions and cancels every pending timer', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)
    announcer.actions.announce('Saved')
    clock.advance(100)
    announcer.actions.announce('Careful', { politeness: 'assertive' })

    announcer.actions.clear()

    expect(announcer.getState()).toEqual({ polite: '', assertive: '' })
    expect(clock.pendingTimers()).toBe(0)
    clock.advance(10000)
    expect(announcer.getState()).toEqual({ polite: '', assertive: '' })
  })

  test('forgets the throttle and stays usable afterwards', () => {
    const clock = createFakeEnv()
    const announcer = createAnnouncer(clock.env)
    announcer.actions.announce('Only digits', { key: 'phone' })

    announcer.actions.clear()

    expect(announcer.actions.announce('Only digits', { key: 'phone' })).toBe(true)
    clock.advance(100)
    expect(announcer.getState().polite).toBe('Only digits')
  })
})
