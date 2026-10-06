import { describe, expect, test } from 'vite-plus/test'
import { getCalendarKeyTarget } from './calendar-keys.ts'
import type { CalendarKeyTargetInput } from './calendar-keys.ts'

function target(input: Partial<CalendarKeyTargetInput> & { key: string }) {
  return getCalendarKeyTarget({
    shiftKey: false,
    date: '2026-10-14',
    weekStart: 1,
    direction: 'ltr',
    ...input,
  })
}

describe('calendar keys', () => {
  test('ArrowRight and ArrowLeft move a day, and cross months', () => {
    expect(target({ key: 'ArrowRight' })).toBe('2026-10-15')
    expect(target({ key: 'ArrowLeft' })).toBe('2026-10-13')
    expect(target({ key: 'ArrowRight', date: '2026-10-31' })).toBe('2026-11-01')
    expect(target({ key: 'ArrowLeft', date: '2026-11-01' })).toBe('2026-10-31')
  })

  test('ArrowRight and ArrowLeft flip in rtl', () => {
    expect(target({ key: 'ArrowRight', direction: 'rtl' })).toBe('2026-10-13')
    expect(target({ key: 'ArrowLeft', direction: 'rtl' })).toBe('2026-10-15')
  })

  test('ArrowDown and ArrowUp move a week, and do not flip in rtl', () => {
    expect(target({ key: 'ArrowDown' })).toBe('2026-10-21')
    expect(target({ key: 'ArrowUp' })).toBe('2026-10-07')
    expect(target({ key: 'ArrowDown', direction: 'rtl' })).toBe('2026-10-21')
    expect(target({ key: 'ArrowUp', date: '2026-10-03' })).toBe('2026-09-26')
    expect(target({ key: 'ArrowDown', date: '2026-10-28' })).toBe('2026-11-04')
  })

  test('Home and End go to the start and end of the week, by the week start', () => {
    expect(target({ key: 'Home' })).toBe('2026-10-12')
    expect(target({ key: 'End' })).toBe('2026-10-18')
    expect(target({ key: 'Home', weekStart: 7 })).toBe('2026-10-11')
    expect(target({ key: 'End', weekStart: 7 })).toBe('2026-10-17')
  })

  test('Home and End do not flip in rtl', () => {
    expect(target({ key: 'Home', direction: 'rtl' })).toBe('2026-10-12')
  })

  test('PageDown and PageUp move a month and cut to its length', () => {
    expect(target({ key: 'PageDown' })).toBe('2026-11-14')
    expect(target({ key: 'PageUp' })).toBe('2026-09-14')
    expect(target({ key: 'PageDown', date: '2026-01-31' })).toBe('2026-02-28')
    expect(target({ key: 'PageUp', date: '2026-03-31' })).toBe('2026-02-28')
  })

  test('Shift+PageDown and Shift+PageUp move a year, and 29 Feb becomes 28 Feb', () => {
    expect(target({ key: 'PageDown', shiftKey: true })).toBe('2027-10-14')
    expect(target({ key: 'PageUp', shiftKey: true })).toBe('2025-10-14')
    expect(target({ key: 'PageDown', shiftKey: true, date: '2024-02-29' })).toBe('2025-02-28')
  })

  test('every move is clamped to the minimum and maximum', () => {
    const range = { minimum: '2026-10-10', maximum: '2026-10-20' }
    expect(target({ key: 'PageDown', ...range })).toBe('2026-10-20')
    expect(target({ key: 'PageUp', ...range })).toBe('2026-10-10')
    expect(target({ key: 'Home', ...range })).toBe('2026-10-12')
    expect(target({ key: 'Home', date: '2026-10-11', weekStart: 7, ...range })).toBe('2026-10-11')
    expect(target({ key: 'End', date: '2026-10-19', ...range })).toBe('2026-10-20')
    expect(target({ key: 'PageDown', shiftKey: true, ...range })).toBe('2026-10-20')
  })

  test('at the edge focus stays', () => {
    const range = { minimum: '2026-10-14', maximum: '2026-10-14' }
    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']) {
      expect(target({ key, ...range })).toBe('2026-10-14')
    }
  })

  test('other keys and Shift with an arrow or Home are not calendar moves', () => {
    for (const key of ['Enter', ' ', 'Tab', 'Escape', 'a', 'Shift']) {
      expect(target({ key })).toBeUndefined()
    }
    expect(target({ key: 'ArrowRight', shiftKey: true })).toBeUndefined()
    expect(target({ key: 'Home', shiftKey: true })).toBeUndefined()
  })

  test('the first and last day of the supported years are the limit', () => {
    expect(target({ key: 'ArrowLeft', date: '0001-01-01' })).toBe('0001-01-01')
    expect(target({ key: 'PageDown', shiftKey: true, date: '9999-06-01' })).toBe('9999-12-31')
  })
})
