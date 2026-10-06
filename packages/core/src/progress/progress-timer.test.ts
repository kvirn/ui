import { describe, expect, test } from 'vite-plus/test'
import { createProgressTimer } from './progress-timer.ts'
import type { ProgressTimerEnv } from './progress-timer.ts'

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
  const env: ProgressTimerEnv = {
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
    pendingTimers: () => timers.length,
    advance(milliseconds: number) {
      const target = now + milliseconds
      for (;;) {
        const due = timers.filter((timer) => timer.at <= target).toSorted((a, b) => a.at - b.at)[0]
        if (due === undefined) {
          break
        }
        now = due.at
        timers = timers.filter((timer) => timer.id !== due.id)
        due.run()
      }
      now = target
    },
  }
}

describe('createProgressTimer', () => {
  test('stays waiting inside the show delay, so a quick wait never shows', () => {
    const clock = createFakeEnv()
    const timer = createProgressTimer(clock.env)
    timer.actions.start()
    clock.advance(999)
    expect(timer.getState().phase).toBe('waiting')
    timer.actions.stop()
    clock.advance(20_000)
    expect(timer.getState().phase).toBe('waiting')
    expect(clock.pendingTimers()).toBe(0)
  })

  test('is shown after 1000 ms and slow after 10000 ms by default', () => {
    const clock = createFakeEnv()
    const timer = createProgressTimer(clock.env)
    timer.actions.start()
    clock.advance(1000)
    expect(timer.getState().phase).toBe('shown')
    clock.advance(8999)
    expect(timer.getState().phase).toBe('shown')
    clock.advance(1)
    expect(timer.getState().phase).toBe('slow')
    expect(clock.pendingTimers()).toBe(0)
  })

  test('takes both limits from the options, and false turns slow off', () => {
    const clock = createFakeEnv()
    const timer = createProgressTimer(clock.env, {
      delayMilliseconds: 200,
      slowAfterMilliseconds: 500,
    })
    timer.actions.start()
    clock.advance(200)
    expect(timer.getState().phase).toBe('shown')
    clock.advance(300)
    expect(timer.getState().phase).toBe('slow')

    const never = createProgressTimer(clock.env, { slowAfterMilliseconds: false })
    never.actions.start()
    clock.advance(60_000)
    expect(never.getState().phase).toBe('shown')
  })

  test('a slow limit inside the delay still passes through shown first', () => {
    const clock = createFakeEnv()
    const timer = createProgressTimer(clock.env, {
      delayMilliseconds: 1000,
      slowAfterMilliseconds: 500,
    })
    const phases: string[] = []
    timer.subscribe(() => phases.push(timer.getState().phase))
    timer.actions.start()
    clock.advance(5000)
    expect(phases).toEqual(['shown', 'slow'])
  })

  test('start again begins a new wait', () => {
    const clock = createFakeEnv()
    const timer = createProgressTimer(clock.env)
    timer.actions.start()
    clock.advance(5000)
    timer.actions.start()
    expect(timer.getState().phase).toBe('waiting')
    clock.advance(999)
    expect(timer.getState().phase).toBe('waiting')
    clock.advance(1)
    expect(timer.getState().phase).toBe('shown')
  })

  test('uses the defaults for a limit that is not a usable number', () => {
    const clock = createFakeEnv()
    const timer = createProgressTimer(clock.env, {
      delayMilliseconds: Number.NaN,
      slowAfterMilliseconds: -5,
    })
    timer.actions.start()
    clock.advance(1000)
    expect(timer.getState().phase).toBe('shown')
    clock.advance(9000)
    expect(timer.getState().phase).toBe('slow')
  })

  test('without a page (server rendering) it stays waiting and sets no timer', () => {
    const timer = createProgressTimer(undefined)
    timer.actions.start()
    expect(timer.getState().phase).toBe('waiting')
  })
})
