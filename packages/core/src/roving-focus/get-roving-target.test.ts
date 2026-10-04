import { describe, expect, test } from 'vite-plus/test'
import { getRovingTarget } from './get-roving-target.ts'
import type { RovingTargetInput } from './get-roving-target.ts'

// Plan 0035: the index maths behind a roving tabindex (APG Toolbar). Pure: no DOM.

const base: RovingTargetInput = {
  key: 'ArrowRight',
  currentIndex: 1,
  count: 4,
  orientation: 'horizontal',
  direction: 'ltr',
  loop: true,
}

const target = (overrides: Partial<RovingTargetInput>) => getRovingTarget({ ...base, ...overrides })

describe('horizontal, left to right', () => {
  test('ArrowRight goes to the next item and ArrowLeft to the previous', () => {
    expect(target({ key: 'ArrowRight' })).toBe(2)
    expect(target({ key: 'ArrowLeft' })).toBe(0)
  })

  test('ArrowRight on the last item wraps to the first, and ArrowLeft on the first to the last', () => {
    expect(target({ key: 'ArrowRight', currentIndex: 3 })).toBe(0)
    expect(target({ key: 'ArrowLeft', currentIndex: 0 })).toBe(3)
  })

  test('without loop the ends stay where they are', () => {
    expect(target({ key: 'ArrowRight', currentIndex: 3, loop: false })).toBe(3)
    expect(target({ key: 'ArrowLeft', currentIndex: 0, loop: false })).toBe(0)
  })

  test('ArrowUp and ArrowDown are not owned', () => {
    expect(target({ key: 'ArrowUp' })).toBeNull()
    expect(target({ key: 'ArrowDown' })).toBeNull()
  })
})

describe('horizontal, right to left', () => {
  test('the arrows flip: ArrowLeft goes to the next item and ArrowRight to the previous', () => {
    expect(target({ key: 'ArrowLeft', direction: 'rtl' })).toBe(2)
    expect(target({ key: 'ArrowRight', direction: 'rtl' })).toBe(0)
  })

  test('wraps the flipped way', () => {
    expect(target({ key: 'ArrowLeft', direction: 'rtl', currentIndex: 3 })).toBe(0)
    expect(target({ key: 'ArrowRight', direction: 'rtl', currentIndex: 0 })).toBe(3)
  })

  test('without loop the ends stay where they are', () => {
    expect(target({ key: 'ArrowLeft', direction: 'rtl', currentIndex: 3, loop: false })).toBe(3)
    expect(target({ key: 'ArrowRight', direction: 'rtl', currentIndex: 0, loop: false })).toBe(0)
  })
})

describe('vertical', () => {
  test('ArrowDown goes to the next item and ArrowUp to the previous', () => {
    expect(target({ key: 'ArrowDown', orientation: 'vertical' })).toBe(2)
    expect(target({ key: 'ArrowUp', orientation: 'vertical' })).toBe(0)
  })

  test('wraps, and stays at the ends without loop', () => {
    expect(target({ key: 'ArrowDown', orientation: 'vertical', currentIndex: 3 })).toBe(0)
    expect(target({ key: 'ArrowUp', orientation: 'vertical', currentIndex: 0 })).toBe(3)
    expect(
      target({ key: 'ArrowDown', orientation: 'vertical', currentIndex: 3, loop: false }),
    ).toBe(3)
    expect(target({ key: 'ArrowUp', orientation: 'vertical', currentIndex: 0, loop: false })).toBe(
      0,
    )
  })

  test('does not flip in right to left: down is still next', () => {
    expect(target({ key: 'ArrowDown', orientation: 'vertical', direction: 'rtl' })).toBe(2)
    expect(target({ key: 'ArrowUp', orientation: 'vertical', direction: 'rtl' })).toBe(0)
  })

  test('ArrowLeft and ArrowRight are not owned', () => {
    expect(target({ key: 'ArrowLeft', orientation: 'vertical' })).toBeNull()
    expect(target({ key: 'ArrowRight', orientation: 'vertical' })).toBeNull()
  })
})

describe('Home and End', () => {
  test('go to the first and the last item in either orientation and direction', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      for (const direction of ['ltr', 'rtl'] as const) {
        expect(target({ key: 'Home', orientation, direction })).toBe(0)
        expect(target({ key: 'End', orientation, direction })).toBe(3)
      }
    }
  })

  test('do not depend on loop', () => {
    expect(target({ key: 'Home', loop: false, currentIndex: 3 })).toBe(0)
    expect(target({ key: 'End', loop: false, currentIndex: 0 })).toBe(3)
  })
})

describe('keys it does not own', () => {
  test.each(['Tab', 'Enter', ' ', 'Escape', 'PageDown', 'a'])('%j gives null', (key) => {
    expect(target({ key })).toBeNull()
  })
})

describe('edges', () => {
  test('no items gives null for every key', () => {
    expect(target({ key: 'ArrowRight', count: 0, currentIndex: -1 })).toBeNull()
    expect(target({ key: 'Home', count: 0, currentIndex: -1 })).toBeNull()
  })

  test('one item stays on it', () => {
    expect(target({ key: 'ArrowRight', count: 1, currentIndex: 0 })).toBe(0)
    expect(target({ key: 'ArrowLeft', count: 1, currentIndex: 0 })).toBe(0)
    expect(target({ key: 'End', count: 1, currentIndex: 0 })).toBe(0)
  })

  test('with no current item (-1), forward goes to the first and backward to the last', () => {
    expect(target({ key: 'ArrowRight', currentIndex: -1 })).toBe(0)
    expect(target({ key: 'ArrowLeft', currentIndex: -1 })).toBe(3)
    expect(target({ key: 'ArrowLeft', currentIndex: -1, loop: false })).toBe(0)
  })

  test('a current index past the end counts as the last item', () => {
    expect(target({ key: 'ArrowLeft', currentIndex: 9 })).toBe(2)
    expect(target({ key: 'ArrowRight', currentIndex: 9 })).toBe(0)
  })
})
