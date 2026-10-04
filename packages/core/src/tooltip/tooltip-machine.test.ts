import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import {
  createTooltipGroup,
  createTooltipMachine,
  defaultTooltipCloseDelay,
  defaultTooltipDelay,
  defaultTooltipSkipDelay,
  getTooltipGroup,
} from './tooltip-machine.ts'
import type { TooltipChangeReason, TooltipGroup, TooltipMachine } from './tooltip-machine.ts'

// Contract: packages/react/src/tooltip/tooltip.a11y.md (WCAG 1.4.13: dismissable, hoverable,
// persistent) and docs/design/tooltip.md, Timing. The machine holds no DOM, so every test drives it
// with events and fake time.

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

interface Setup {
  machine: TooltipMachine
  changes: Array<[boolean, TooltipChangeReason]>
  group: TooltipGroup
}

/** A machine that follows what it asks for, like an uncontrolled owner does. */
function setup(options: { delay?: number; closeDelay?: number; group?: TooltipGroup } = {}): Setup {
  const group = options.group ?? createTooltipGroup()
  const changes: Setup['changes'] = []
  const machine = createTooltipMachine({
    delay: options.delay,
    closeDelay: options.closeDelay,
    group,
    onOpenChange: (open, reason) => changes.push([open, reason]),
  })
  return { machine, changes, group }
}

describe('defaults', () => {
  test('open after 500ms of hover, close after a 100ms grace, skip the delay for 300ms', () => {
    expect(defaultTooltipDelay).toBe(500)
    expect(defaultTooltipCloseDelay).toBe(100)
    expect(defaultTooltipSkipDelay).toBe(300)
  })
})

describe('hover', () => {
  test('opens after the delay, not before', () => {
    const { machine, changes } = setup()
    machine.pointerEnter()
    vi.advanceTimersByTime(499)
    expect(changes).toEqual([])
    vi.advanceTimersByTime(1)
    expect(changes).toEqual([[true, 'hover']])
    expect(machine.isOpen()).toBe(true)
  })

  test('a pointer that leaves before the delay opens nothing', () => {
    const { machine, changes } = setup()
    machine.pointerEnter()
    vi.advanceTimersByTime(300)
    machine.pointerLeave()
    vi.advanceTimersByTime(1000)
    expect(changes).toEqual([])
  })

  test('the delay option is used, and 0 opens at once', () => {
    const slow = setup({ delay: 1000 })
    slow.machine.pointerEnter()
    vi.advanceTimersByTime(999)
    expect(slow.changes).toEqual([])
    vi.advanceTimersByTime(1)
    expect(slow.changes).toEqual([[true, 'hover']])

    const instant = setup({ delay: 0 })
    instant.machine.pointerEnter()
    expect(instant.changes).toEqual([[true, 'hover']])
  })

  test('stays open until the pointer has been away for the grace period (persistent)', () => {
    const { machine, changes } = setup({ delay: 0 })
    machine.pointerEnter()
    machine.pointerLeave()
    vi.advanceTimersByTime(99)
    expect(machine.isOpen()).toBe(true)
    vi.advanceTimersByTime(1)
    expect(changes).toEqual([
      [true, 'hover'],
      [false, 'pointer-leave'],
    ])
  })

  test('there is no timeout: an open tooltip never closes on its own while the pointer stays', () => {
    const { machine } = setup({ delay: 0 })
    machine.pointerEnter()
    vi.advanceTimersByTime(10 * 60 * 1000)
    expect(machine.isOpen()).toBe(true)
  })

  test('the pointer can cross onto the tooltip: leaving the trigger and entering the popup within the grace keeps it open (hoverable)', () => {
    const { machine, changes } = setup({ delay: 0 })
    machine.pointerEnter()
    machine.pointerLeave()
    vi.advanceTimersByTime(60)
    machine.pointerEnter()
    vi.advanceTimersByTime(1000)
    expect(machine.isOpen()).toBe(true)
    expect(changes).toEqual([[true, 'hover']])
    machine.pointerLeave()
    vi.advanceTimersByTime(100)
    expect(machine.isOpen()).toBe(false)
  })

  test('a closeDelay of 0 closes at once', () => {
    const { machine } = setup({ delay: 0, closeDelay: 0 })
    machine.pointerEnter()
    machine.pointerLeave()
    expect(machine.isOpen()).toBe(false)
  })
})

describe('keyboard focus', () => {
  test('keyboard focus opens at once, and blur closes at once', () => {
    const { machine, changes } = setup()
    machine.focus(true)
    expect(changes).toEqual([[true, 'focus']])
    machine.blur()
    expect(changes).toEqual([
      [true, 'focus'],
      [false, 'blur'],
    ])
  })

  test('focus from a pointer press does not open it', () => {
    const { machine, changes } = setup()
    machine.focus(false)
    vi.advanceTimersByTime(1000)
    expect(changes).toEqual([])
  })

  test('it stays open while the trigger has focus, even after the pointer left', () => {
    const { machine } = setup({ delay: 0 })
    machine.focus(true)
    machine.pointerEnter()
    machine.pointerLeave()
    vi.advanceTimersByTime(1000)
    expect(machine.isOpen()).toBe(true)
  })

  test('blur does not close it while the pointer is still on the trigger', () => {
    const { machine } = setup({ delay: 0 })
    machine.pointerEnter()
    machine.focus(true)
    machine.blur()
    expect(machine.isOpen()).toBe(true)
    machine.pointerLeave()
    vi.advanceTimersByTime(100)
    expect(machine.isOpen()).toBe(false)
  })

  test('keyboard activation does not close it: the machine has no event for it (persistent)', () => {
    const { machine } = setup()
    machine.focus(true)
    vi.advanceTimersByTime(5000)
    expect(machine.isOpen()).toBe(true)
  })
})

describe('Escape and press (dismissable)', () => {
  test('Escape closes an open tooltip with the reason escape', () => {
    const { machine, changes } = setup()
    machine.focus(true)
    machine.escape()
    expect(changes.at(-1)).toEqual([false, 'escape'])
  })

  test('after Escape it stays hidden while the pointer stays, until the pointer leaves and comes back', () => {
    const { machine, changes } = setup({ delay: 0 })
    machine.pointerEnter()
    machine.escape()
    vi.advanceTimersByTime(1000)
    expect(machine.isOpen()).toBe(false)
    // Another move inside the trigger is not a new enter.
    machine.pointerLeave()
    vi.advanceTimersByTime(1000)
    machine.pointerEnter()
    expect(machine.isOpen()).toBe(true)
    expect(changes.filter(([open]) => open)).toHaveLength(2)
  })

  test('after Escape it stays hidden while focus stays, until focus leaves and comes back', () => {
    const { machine } = setup()
    machine.focus(true)
    machine.escape()
    machine.focus(true)
    expect(machine.isOpen()).toBe(false)
    machine.blur()
    machine.focus(true)
    expect(machine.isOpen()).toBe(true)
  })

  test('Escape on focus does not dismiss the hover, and hovering opens it again after the pointer comes back', () => {
    const { machine } = setup({ delay: 0 })
    machine.focus(true)
    machine.escape()
    machine.pointerEnter()
    // Both sources were dismissed together only when they were both active. Hover came later.
    expect(machine.isOpen()).toBe(true)
  })

  test('Escape while the hover delay is waiting cancels the opening', () => {
    const { machine, changes } = setup()
    machine.pointerEnter()
    machine.escape()
    vi.advanceTimersByTime(1000)
    expect(changes).toEqual([])
  })

  test('a press on the trigger closes it with the reason trigger-press, and it stays closed while the pointer rests', () => {
    const { machine, changes } = setup({ delay: 0 })
    machine.pointerEnter()
    machine.press()
    vi.advanceTimersByTime(2000)
    expect(changes).toEqual([
      [true, 'hover'],
      [false, 'trigger-press'],
    ])
  })

  test('a press during the hover delay cancels the opening', () => {
    const { machine, changes } = setup()
    machine.pointerEnter()
    machine.press()
    vi.advanceTimersByTime(2000)
    expect(changes).toEqual([])
  })
})

describe('suppress (the trigger opened its own popup)', () => {
  test('closes an open tooltip and keeps it closed while suppressed', () => {
    const { machine, changes } = setup({ delay: 0 })
    machine.focus(true)
    machine.suppress(true)
    expect(changes.at(-1)).toEqual([false, 'trigger-press'])
    machine.pointerEnter()
    machine.focus(true)
    vi.advanceTimersByTime(2000)
    expect(machine.isOpen()).toBe(false)
  })

  test('it does not reopen by itself when the suppression ends: the next hover or focus does', () => {
    const { machine } = setup({ delay: 0 })
    machine.focus(true)
    machine.suppress(true)
    machine.suppress(false)
    expect(machine.isOpen()).toBe(false)
    machine.blur()
    machine.focus(true)
    expect(machine.isOpen()).toBe(true)
  })
})

describe('the shared delay (a group)', () => {
  test('moving to the next tooltip while one is open opens it at once, and closes the first', () => {
    const group = createTooltipGroup()
    const first = setup({ group, delay: 500 })
    const second = setup({ group, delay: 500 })
    first.machine.pointerEnter()
    vi.advanceTimersByTime(500)
    expect(first.machine.isOpen()).toBe(true)

    first.machine.pointerLeave()
    second.machine.pointerEnter()
    expect(second.changes).toEqual([[true, 'hover']])
    expect(first.machine.isOpen()).toBe(false)
    expect(first.changes.at(-1)).toEqual([false, 'pointer-leave'])
    // The first one's own grace timer finds nothing left to close.
    vi.advanceTimersByTime(1000)
    expect(first.changes.filter(([open]) => !open)).toHaveLength(1)
  })

  test('within 300ms of a close the next one opens at once, after that it waits for its delay', () => {
    const group = createTooltipGroup()
    const first = setup({ group, delay: 0, closeDelay: 0 })
    first.machine.pointerEnter()
    first.machine.pointerLeave()

    const quick = setup({ group, delay: 500 })
    vi.advanceTimersByTime(299)
    quick.machine.pointerEnter()
    expect(quick.changes).toEqual([[true, 'hover']])
    quick.machine.destroy()

    const late = setup({ group, delay: 500 })
    vi.advanceTimersByTime(1000)
    late.machine.pointerEnter()
    expect(late.changes).toEqual([])
    vi.advanceTimersByTime(500)
    expect(late.changes).toEqual([[true, 'hover']])
  })

  test('tooltips in different groups do not share the delay', () => {
    const first = setup({ delay: 0, closeDelay: 0 })
    const other = setup({ delay: 500 })
    first.machine.pointerEnter()
    other.machine.pointerEnter()
    expect(other.changes).toEqual([])
    expect(first.machine.isOpen()).toBe(true)
  })

  test('the page has one group, created on first use', () => {
    expect(getTooltipGroup()).toBe(getTooltipGroup())
  })

  test('machines with no group of their own share the page-wide skip window', () => {
    const first = createTooltipMachine({ delay: 0, closeDelay: 0, onOpenChange: () => {} })
    const changes: Array<[boolean, TooltipChangeReason]> = []
    const second = createTooltipMachine({
      delay: 500,
      onOpenChange: (open, reason) => changes.push([open, reason]),
    })
    first.pointerEnter()
    first.pointerLeave()
    vi.advanceTimersByTime(299)
    second.pointerEnter()
    expect(changes).toEqual([[true, 'hover']])
    // Leave the page group cold for the other tests.
    second.destroy()
    first.destroy()
    vi.advanceTimersByTime(1000)
  })

  test('an owner that keeps a controlled tooltip open does not evict the tooltip that is open now', () => {
    const group = createTooltipGroup()
    const owner = setup({ group, delay: 0 })
    const other = setup({ group, delay: 0 })
    owner.machine.sync(true)
    other.machine.pointerEnter()
    // The group closed the owner's tooltip. The owner refuses, and the machine follows the state again.
    expect(owner.changes).toEqual([[false, 'pointer-leave']])
    owner.machine.sync(true)
    expect(other.machine.isOpen()).toBe(true)
    expect(other.changes).toEqual([[true, 'hover']])
    // No fight: the refusal is not repeated.
    owner.machine.sync(true)
    expect(owner.changes).toEqual([[false, 'pointer-leave']])
  })

  test('a tooltip pushed out while its trigger still has keyboard focus opens again when the other closes', () => {
    const group = createTooltipGroup()
    const focused = setup({ group })
    const hovered = setup({ group, delay: 0, closeDelay: 0 })
    focused.machine.focus(true)
    hovered.machine.pointerEnter()
    expect(focused.machine.isOpen()).toBe(false)
    hovered.machine.pointerLeave()
    expect(hovered.machine.isOpen()).toBe(false)
    expect(focused.machine.isOpen()).toBe(true)
    expect(focused.changes).toEqual([
      [true, 'focus'],
      [false, 'pointer-leave'],
      [true, 'focus'],
    ])
  })

  test('a pushed-out tooltip does not come back when focus has left, or Escape hid it', () => {
    const group = createTooltipGroup()
    const left = setup({ group })
    const other = setup({ group, delay: 0, closeDelay: 0 })
    left.machine.focus(true)
    other.machine.pointerEnter()
    left.machine.blur()
    other.machine.pointerLeave()
    expect(left.machine.isOpen()).toBe(false)
    expect(left.changes.filter(([open]) => open)).toHaveLength(1)
  })
})

describe('following the owner', () => {
  test('sync follows a controlled open without asking for anything', () => {
    const { machine, changes } = setup()
    machine.sync(true)
    expect(machine.isOpen()).toBe(true)
    machine.sync(false)
    expect(machine.isOpen()).toBe(false)
    expect(changes).toEqual([])
  })

  test('an owner that refuses an opening can sync back, so the next hover asks again', () => {
    const { machine, changes } = setup({ delay: 0 })
    machine.pointerEnter()
    machine.sync(false)
    machine.pointerLeave()
    machine.pointerEnter()
    expect(changes).toEqual([
      [true, 'hover'],
      [true, 'hover'],
    ])
  })

  test('configure changes the delays for the next event', () => {
    const { machine, changes, group } = setup({ delay: 500 })
    machine.configure({ delay: 50, closeDelay: 10, group })
    machine.pointerEnter()
    vi.advanceTimersByTime(50)
    expect(changes).toEqual([[true, 'hover']])
  })

  test('destroy clears pending timers', () => {
    const { machine, changes } = setup()
    machine.pointerEnter()
    machine.destroy()
    vi.advanceTimersByTime(2000)
    expect(changes).toEqual([])
  })
})
