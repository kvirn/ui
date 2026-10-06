import { describe, expect, test } from 'vite-plus/test'
import { createToastQueue, toastMinimumDuration } from './toast-queue.ts'
import type { ToastQueueEnv, ToastQueueOptions } from './toast-queue.ts'

interface Timer {
  id: number
  at: number
  run: () => void
}

function createFakeEnv() {
  let now = 0
  let nextId = 1
  let timers: Timer[] = []
  const env: ToastQueueEnv = {
    window: {
      performance: { now: () => now },
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
        timers = timers.filter((timer) => timer !== due)
        now = due.at
        due.run()
      }
      now = target
    },
  }
}

function setup(options?: ToastQueueOptions) {
  const clock = createFakeEnv()
  const queue = createToastQueue(clock.env, options)
  const ids = () => queue.getState().visible.map((entry) => entry.id)
  return { clock, queue, ids }
}

describe('toastMinimumDuration', () => {
  test('is 10 seconds for short text and 100 ms per character for long text', () => {
    expect(toastMinimumDuration('Saved')).toBe(10_000)
    expect(toastMinimumDuration('x'.repeat(250))).toBe(25_000)
  })

  test('the number setting scales it from 1 to 10 and is clamped', () => {
    expect(toastMinimumDuration('Saved', 3)).toBe(30_000)
    expect(toastMinimumDuration('Saved', 50)).toBe(100_000)
    expect(toastMinimumDuration('Saved', 0)).toBe(10_000)
  })
})

describe('rule 1: persistent by default', () => {
  test('autoDismiss false sets no timer and the toast stays', () => {
    const { clock, queue, ids } = setup()
    queue.actions.show({ id: 'a', text: 'Saved' })

    expect(clock.pendingTimers()).toBe(0)
    clock.advance(10 * 60_000)
    expect(ids()).toEqual(['a'])
  })
})

describe('rule 2: timers only for toasts without an action', () => {
  test('a toast without an action times out after autoDismiss is on', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    const result = queue.actions.show({ id: 'a', variant: 'success', text: 'Saved' })

    expect(result.timerDropped).toBe(false)
    clock.advance(10_000)
    expect(ids()).toEqual([])
  })

  test('a toast with an action stays and reports the dropped timer', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    const result = queue.actions.show({ id: 'a', text: 'Deleted', hasAction: true })

    expect(result.timerDropped).toBe(true)
    expect(clock.pendingTimers()).toBe(0)
    clock.advance(10 * 60_000)
    expect(ids()).toEqual(['a'])
  })

  test('no dropped timer is reported while autoDismiss is off', () => {
    const { queue } = setup()
    expect(queue.actions.show({ text: 'Deleted', hasAction: true }).timerDropped).toBe(false)
  })
})

describe('rule 3: reading time', () => {
  test('a timer is never shorter than the minimum and grows with the text', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'long', text: 'x'.repeat(300) })

    clock.advance(29_999)
    expect(ids()).toEqual(['long'])
    clock.advance(1)
    expect(ids()).toEqual([])
  })

  test('the number setting multiplies the time', () => {
    const { clock, queue, ids } = setup({ autoDismiss: 3 })
    queue.actions.show({ id: 'a', text: 'Saved' })

    clock.advance(29_999)
    expect(ids()).toEqual(['a'])
    clock.advance(1)
    expect(ids()).toEqual([])
  })
})

describe('rule 4: pause and resume', () => {
  test('pausing stops the timer and resuming gives back the time that was left', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'Saved' })

    clock.advance(2000)
    queue.actions.pause('hover')
    clock.advance(60_000)
    expect(ids()).toEqual(['a'])

    queue.actions.resume('hover')
    clock.advance(7999)
    expect(ids()).toEqual(['a'])
    clock.advance(1)
    expect(ids()).toEqual([])
  })

  test('at least 5 seconds remain after a resume', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'Saved' })

    clock.advance(9000)
    queue.actions.pause('focus')
    queue.actions.resume('focus')

    clock.advance(4999)
    expect(ids()).toEqual(['a'])
    clock.advance(1)
    expect(ids()).toEqual([])
  })

  test('the timers run again only after every reason has resumed', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'Saved' })

    queue.actions.pause('hover')
    queue.actions.pause('hidden')
    queue.actions.resume('hover')
    clock.advance(60_000)
    expect(ids()).toEqual(['a'])

    queue.actions.resume('hidden')
    clock.advance(10_000)
    expect(ids()).toEqual([])
  })

  test('a toast shown while paused starts its timer on resume', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    queue.actions.pause('focus')
    queue.actions.show({ id: 'a', text: 'Saved' })
    clock.advance(60_000)
    expect(ids()).toEqual(['a'])

    queue.actions.resume('focus')
    clock.advance(10_000)
    expect(ids()).toEqual([])
  })

  test('resume without a matching pause does nothing', () => {
    const { clock, queue } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'Saved' })
    queue.actions.resume('hover')
    expect(clock.pendingTimers()).toBe(1)
  })
})

describe('rule 6: limit and eviction', () => {
  test('the default limit is 10 and the 11th toast is ignored, not queued', () => {
    const { queue, ids } = setup()
    for (let index = 1; index <= 10; index += 1) {
      queue.actions.show({ id: `t${index}`, text: 'a' })
    }

    expect(queue.actions.show({ id: 'eleventh', text: 'b' })).toMatchObject({
      placement: 'ignored',
      updated: false,
    })
    expect(ids()).toHaveLength(10)
    expect(ids()).not.toContain('eleventh')
    queue.actions.dismiss('t1')
    expect(ids()).not.toContain('eleventh')
  })

  test('a persistent toast is never evicted', () => {
    const { queue, ids } = setup({ limit: 2 })
    queue.actions.show({ id: 'a', text: 'a' })
    queue.actions.show({ id: 'b', text: 'b' })

    expect(queue.actions.show({ id: 'c', text: 'c' }).placement).toBe('ignored')
    expect(ids()).toEqual(['a', 'b'])
  })

  test('when full the oldest timed toast is evicted for the new one', () => {
    const { clock, queue, ids } = setup({ limit: 2, autoDismiss: true })
    queue.actions.show({ id: 'action', text: 'a', hasAction: true })
    queue.actions.show({ id: 'timed-old', text: 'b' })

    expect(queue.actions.show({ id: 'new', text: 'c' }).placement).toBe('visible')
    expect(ids()).toEqual(['action', 'new'])

    clock.advance(10_000)
    expect(ids()).toEqual(['action'])
  })

  test('the oldest timed toast goes first, not the oldest toast', () => {
    const { queue, ids } = setup({ limit: 3, autoDismiss: true })
    queue.actions.show({ id: 'first-action', text: 'a', hasAction: true })
    queue.actions.show({ id: 'timed-1', text: 'b' })
    queue.actions.show({ id: 'timed-2', text: 'c' })
    queue.actions.show({ id: 'new', text: 'd' })

    expect(ids()).toEqual(['first-action', 'timed-2', 'new'])
  })

  test('a limit below 1 is raised to 1', () => {
    const { queue, ids } = setup({ limit: 0 })
    queue.actions.show({ id: 'a', text: 'a' })
    queue.actions.show({ id: 'b', text: 'b' })
    expect(ids()).toEqual(['a'])
  })
})

describe('rule 4 and eviction: a toast the user is on is never evicted', () => {
  test.each(['focus', 'hover'] as const)(
    'while %s is paused the new toast is ignored',
    (reason) => {
      const { queue, ids } = setup({ limit: 1, autoDismiss: true })
      queue.actions.show({ id: 'old', text: 'a' })
      queue.actions.pause(reason)

      expect(queue.actions.show({ id: 'new', text: 'b' }).placement).toBe('ignored')
      expect(ids()).toEqual(['old'])

      queue.actions.resume(reason)
      expect(queue.actions.show({ id: 'newer', text: 'c' }).placement).toBe('visible')
      expect(ids()).toEqual(['newer'])
    },
  )
})

describe('setAutoDismiss', () => {
  test('turning timers off stops those of the toasts that show, and on arms them again', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'a' })
    queue.actions.setAutoDismiss(false)

    expect(clock.pendingTimers()).toBe(0)
    clock.advance(600_000)
    expect(ids()).toEqual(['a'])

    queue.actions.setAutoDismiss(true)
    expect(clock.pendingTimers()).toBe(1)
    clock.advance(10_000)
    expect(ids()).toEqual([])
  })

  test('a number scales the reading time of the toasts that show', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'a' })
    queue.actions.setAutoDismiss(2)

    clock.advance(19_999)
    expect(ids()).toEqual(['a'])
    clock.advance(1)
    expect(ids()).toEqual([])
  })

  test('a toast with an action stays without a timer', () => {
    const { clock, queue } = setup()
    queue.actions.show({ id: 'a', text: 'a', hasAction: true })
    queue.actions.setAutoDismiss(true)

    expect(clock.pendingTimers()).toBe(0)
  })
})

describe('revision', () => {
  const revisionOf = (queue: ReturnType<typeof setup>['queue']) =>
    queue.getState().visible.map((entry) => entry.revision)

  test('changes when a toast is shown again, and not when the timing options change', () => {
    const { queue } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'a' })
    queue.actions.show({ id: 'b', text: 'b' })
    const [first, second] = revisionOf(queue)

    queue.actions.setAutoDismiss(2)
    queue.actions.setAutoDismiss(false)
    queue.actions.setLimit(5)
    expect(revisionOf(queue)).toEqual([first, second])

    queue.actions.show({ id: 'a', text: 'a again' })
    expect(revisionOf(queue)[0]).not.toBe(first)
    expect(revisionOf(queue)[1]).toBe(second)
  })
})

describe('the modal pause reason', () => {
  test('stops every timer while a modal is open, and resumes with at least five seconds left', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'a' })
    clock.advance(8000)
    queue.actions.pause('modal')

    clock.advance(600_000)
    expect(ids()).toEqual(['a'])

    queue.actions.resume('modal')
    clock.advance(4999)
    expect(ids()).toEqual(['a'])
    clock.advance(1)
    expect(ids()).toEqual([])
  })
})

describe('setLimit', () => {
  test('a lower limit removes nothing that shows and ignores later toasts', () => {
    const { queue, ids } = setup({ limit: 3 })
    queue.actions.show({ id: 'a', text: 'a' })
    queue.actions.show({ id: 'b', text: 'b' })
    queue.actions.setLimit(1)

    expect(ids()).toEqual(['a', 'b'])
    expect(queue.actions.show({ id: 'c', text: 'c' }).placement).toBe('ignored')
  })

  test('a higher limit lets later toasts in', () => {
    const { queue, ids } = setup({ limit: 1 })
    queue.actions.show({ id: 'a', text: 'a' })
    queue.actions.setLimit(2)
    queue.actions.show({ id: 'b', text: 'b' })

    expect(ids()).toEqual(['a', 'b'])
  })

  test('a limit below 1 is raised to 1', () => {
    const { queue, ids } = setup({ limit: 3 })
    queue.actions.setLimit(0)
    queue.actions.show({ id: 'a', text: 'a' })
    queue.actions.show({ id: 'b', text: 'b' })

    expect(ids()).toEqual(['a'])
  })
})

describe('rule 7: the same id updates in place', () => {
  test('the text changes, the position stays and the timer restarts', () => {
    const { clock, queue, ids } = setup({ autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'one' })
    queue.actions.show({ id: 'b', text: 'two' })
    clock.advance(8000)

    const result = queue.actions.show({ id: 'a', text: 'updated' })

    expect(result.updated).toBe(true)
    expect(ids()).toEqual(['a', 'b'])
    expect(queue.getState().visible[0]?.text).toBe('updated')
    clock.advance(5000)
    expect(ids()).toEqual(['a'])
    clock.advance(5000)
    expect(ids()).toEqual([])
  })

  test('an id is generated when none is given', () => {
    const { queue } = setup()
    const first = queue.actions.show({ text: 'a' }).id
    const second = queue.actions.show({ text: 'b' }).id
    expect(first).not.toBe(second)
  })
})

describe('rule 8: dismissal', () => {
  test('an unknown id returns false', () => {
    expect(setup().queue.actions.dismiss('nope')).toBe(false)
  })

  test('dismissAll empties the region and cancels every timer', () => {
    const { clock, queue } = setup({ limit: 2, autoDismiss: true })
    queue.actions.show({ text: 'a' })
    queue.actions.show({ text: 'b' })

    queue.actions.dismissAll()

    expect(queue.getState()).toEqual({ visible: [] })
    expect(clock.pendingTimers()).toBe(0)
  })
})

describe('server rendering', () => {
  test('without an env toasts show and never time out', () => {
    const queue = createToastQueue(undefined, { autoDismiss: true })
    queue.actions.show({ id: 'a', text: 'Saved' })
    queue.actions.pause('hover')
    queue.actions.resume('hover')
    expect(queue.getState().visible.map((entry) => entry.id)).toEqual(['a'])
  })
})
