import { describe, expect, test } from 'vite-plus/test'
import { createShiftSequence } from './shift-sequence.ts'

describe('createShiftSequence', () => {
  test('completes on the third press inside the window', () => {
    const sequence = createShiftSequence()
    expect(sequence.press(0)).toEqual({ pressed: 1, remaining: 2, complete: false })
    expect(sequence.press(400)).toEqual({ pressed: 2, remaining: 1, complete: false })
    expect(sequence.press(800)).toEqual({ pressed: 0, remaining: 0, complete: true })
  })

  test('the default window is five seconds', () => {
    const sequence = createShiftSequence()
    sequence.press(0)
    expect(sequence.press(5000).pressed).toBe(2)
    expect(sequence.press(10001).pressed).toBe(1)
  })

  test('a gap over the window starts again at one', () => {
    const sequence = createShiftSequence()
    sequence.press(0)
    sequence.press(500)
    expect(sequence.press(5501)).toEqual({ pressed: 1, remaining: 2, complete: false })
  })

  test('a gap of exactly the window still counts', () => {
    const sequence = createShiftSequence()
    sequence.press(0)
    expect(sequence.press(5000).pressed).toBe(2)
  })

  test('reset forgets the count', () => {
    const sequence = createShiftSequence()
    sequence.press(0)
    sequence.press(100)
    sequence.reset()
    expect(sequence.press(200)).toEqual({ pressed: 1, remaining: 2, complete: false })
  })

  test('starts again after completing', () => {
    const sequence = createShiftSequence()
    sequence.press(0)
    sequence.press(100)
    sequence.press(200)
    expect(sequence.press(300).pressed).toBe(1)
  })

  test('count and window are options', () => {
    const sequence = createShiftSequence({ count: 2, windowMs: 100 })
    sequence.press(0)
    expect(sequence.press(100).complete).toBe(true)
    sequence.press(1000)
    expect(sequence.press(1200).complete).toBe(false)
  })
})
