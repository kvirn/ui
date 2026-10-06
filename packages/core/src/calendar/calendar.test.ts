import { describe, expect, test, vi } from 'vite-plus/test'
import { createCalendar, getTodayIsoDate } from './calendar.ts'
import type { CalendarMonthChange, CalendarOptions } from './calendar.ts'

function setup(options: Partial<CalendarOptions> = {}) {
  const onVisibleMonthChange = vi.fn<(change: CalendarMonthChange) => void>()
  const onSelect = vi.fn<(date: string) => void>()
  const calendar = createCalendar({
    today: '2026-10-14',
    onVisibleMonthChange,
    onSelect,
    ...options,
  })
  return { calendar, onVisibleMonthChange, onSelect }
}

describe('initial state', () => {
  test('focus starts on the selected day, else the requested day, else today', () => {
    expect(
      setup({ selected: '2026-03-05', focused: '2026-04-01' }).calendar.getState().focusedDate,
    ).toBe('2026-03-05')
    expect(setup({ focused: '2026-04-01' }).calendar.getState().focusedDate).toBe('2026-04-01')
    expect(setup().calendar.getState().focusedDate).toBe('2026-10-14')
  })

  test('the focused day is clamped to the range, and the month follows it', () => {
    const { calendar } = setup({ minimum: '2026-11-03', maximum: '2026-12-31' })
    expect(calendar.getState().focusedDate).toBe('2026-11-03')
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 11 })
  })

  test('an invalid selected day or range bound is ignored', () => {
    const { calendar } = setup({ selected: '2026-02-30', minimum: 'nope' })
    expect(calendar.getState().selectedDate).toBeUndefined()
    expect(calendar.getState().minimum).toBeUndefined()
  })
})

describe('keys', () => {
  test('a move key moves focus and returns true; others return false', () => {
    const { calendar } = setup()
    expect(calendar.actions.handleKey('ArrowRight', false)).toBe(true)
    expect(calendar.getState().focusedDate).toBe('2026-10-15')
    expect(calendar.actions.handleKey('Enter', false)).toBe(false)
    expect(calendar.getState().focusedDate).toBe('2026-10-15')
  })

  test('crossing into the next month shows it and reports one month change', () => {
    const { calendar, onVisibleMonthChange } = setup({ focused: '2026-10-31' })
    calendar.actions.handleKey('ArrowRight', false)
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 11 })
    expect(onVisibleMonthChange).toHaveBeenCalledExactlyOnceWith({
      year: 2026,
      month: 11,
      reason: 'key',
    })
  })

  test('a move inside the month reports no month change', () => {
    const { calendar, onVisibleMonthChange } = setup()
    calendar.actions.handleKey('ArrowDown', false)
    expect(onVisibleMonthChange).not.toHaveBeenCalled()
  })

  test('RTL flips ArrowRight, and Home and End follow the week start', () => {
    const { calendar } = setup({ direction: 'rtl', weekStart: 7 })
    calendar.actions.handleKey('ArrowRight', false)
    expect(calendar.getState().focusedDate).toBe('2026-10-13')
    calendar.actions.handleKey('Home', false)
    expect(calendar.getState().focusedDate).toBe('2026-10-11')
    calendar.actions.handleKey('End', false)
    expect(calendar.getState().focusedDate).toBe('2026-10-17')
  })

  test('PageDown, then Shift+PageUp', () => {
    const { calendar } = setup({ focused: '2026-01-31' })
    calendar.actions.handleKey('PageDown', false)
    expect(calendar.getState().focusedDate).toBe('2026-02-28')
    calendar.actions.handleKey('PageUp', true)
    expect(calendar.getState().focusedDate).toBe('2025-02-28')
    expect(calendar.getState().visibleMonth).toEqual({ year: 2025, month: 2 })
  })

  test('at the maximum focus stays and no month change is reported', () => {
    const { calendar, onVisibleMonthChange } = setup({ maximum: '2026-10-14' })
    expect(calendar.actions.handleKey('ArrowRight', false)).toBe(true)
    expect(calendar.getState().focusedDate).toBe('2026-10-14')
    expect(calendar.actions.handleKey('PageDown', false)).toBe(true)
    expect(onVisibleMonthChange).not.toHaveBeenCalled()
  })
})

describe('month buttons', () => {
  test('showing the next month moves the focused day to the same day, cut to the length', () => {
    const { calendar, onVisibleMonthChange } = setup({ focused: '2026-01-31' })
    calendar.actions.showMonth(1)
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 2 })
    expect(calendar.getState().focusedDate).toBe('2026-02-28')
    expect(onVisibleMonthChange).toHaveBeenCalledWith({ year: 2026, month: 2, reason: 'button' })
  })

  test('the year buttons move twelve months', () => {
    const { calendar } = setup()
    calendar.actions.showMonth(-12)
    expect(calendar.getState().focusedDate).toBe('2025-10-14')
  })

  test('canShowMonth is false at the edge of the range, true elsewhere', () => {
    const { calendar } = setup({ minimum: '2026-10-01', maximum: '2026-12-31' })
    expect(calendar.canShowMonth(-1)).toBe(false)
    expect(calendar.canShowMonth(-12)).toBe(false)
    expect(calendar.canShowMonth(1)).toBe(true)
    calendar.actions.showMonth(2)
    expect(calendar.canShowMonth(1)).toBe(false)
    expect(calendar.canShowMonth(-1)).toBe(true)
  })

  test('showing a month beyond the range is clamped to the range', () => {
    const { calendar } = setup({ minimum: '2026-10-10', maximum: '2026-12-20' })
    calendar.actions.showMonth(12)
    expect(calendar.getState().focusedDate).toBe('2026-12-20')
  })

  test('canShowMonth stays true when a year step still lands on another allowed month', () => {
    const { calendar } = setup({ minimum: '2026-01-01', maximum: '2027-06-30' })
    expect(calendar.canShowMonth(12)).toBe(true)
  })
})

describe('selecting', () => {
  test('an available day is selected and reported', () => {
    const { calendar, onSelect } = setup()
    calendar.actions.select('2026-10-20')
    expect(calendar.getState().selectedDate).toBe('2026-10-20')
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('2026-10-20')
  })

  test('an unavailable day or one outside the range is not selected', () => {
    const { calendar, onSelect } = setup({
      minimum: '2026-10-10',
      isDateUnavailable: (date) => date === '2026-10-20',
    })
    calendar.actions.select('2026-10-20')
    calendar.actions.select('2026-10-09')
    expect(calendar.getState().selectedDate).toBeUndefined()
    expect(onSelect).not.toHaveBeenCalled()
  })

  test('availability tells unavailable from outside the range', () => {
    const { calendar } = setup({
      minimum: '2026-10-10',
      isDateUnavailable: (date) => date === '2026-10-20',
    })
    expect(calendar.getDayAvailability('2026-10-20')).toBe('unavailable')
    expect(calendar.getDayAvailability('2026-10-09')).toBe('outside-range')
    expect(calendar.getDayAvailability('2026-10-21')).toBe('available')
  })

  test('an unavailable day stays focusable', () => {
    const { calendar } = setup({ isDateUnavailable: (date) => date === '2026-10-15' })
    calendar.actions.handleKey('ArrowRight', false)
    expect(calendar.getState().focusedDate).toBe('2026-10-15')
  })
})

describe('configure', () => {
  test('a new range pulls the focused day inside it and reports the month change', () => {
    const { calendar, onVisibleMonthChange } = setup()
    calendar.actions.configure({ minimum: '2026-12-01' })
    expect(calendar.getState().focusedDate).toBe('2026-12-01')
    expect(onVisibleMonthChange).toHaveBeenCalledWith({
      year: 2026,
      month: 12,
      reason: 'configure',
    })
  })

  test('a new week start applies to the next Home', () => {
    const { calendar } = setup()
    calendar.actions.configure({ weekStart: 7 })
    calendar.actions.handleKey('Home', false)
    expect(calendar.getState().focusedDate).toBe('2026-10-11')
  })

  test('setSelected changes only the selection', () => {
    const { calendar, onSelect } = setup()
    calendar.actions.setSelected('2026-05-05')
    expect(calendar.getState().selectedDate).toBe('2026-05-05')
    expect(calendar.getState().focusedDate).toBe('2026-10-14')
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('focusDate and configure', () => {
  test('focusDate clamps to the range and reports reason focus', () => {
    const { calendar, onVisibleMonthChange } = setup({ maximum: '2026-12-31' })
    calendar.actions.focusDate('2027-03-01')
    expect(calendar.getState().focusedDate).toBe('2026-12-31')
    expect(onVisibleMonthChange).toHaveBeenCalledWith({ year: 2026, month: 12, reason: 'focus' })
  })

  test('configure changes the direction', () => {
    const { calendar } = setup()
    calendar.actions.configure({ direction: 'rtl' })
    calendar.actions.handleKey('ArrowRight', false)
    expect(calendar.getState().focusedDate).toBe('2026-10-13')
  })

  test('configure replaces the unavailable predicate', () => {
    const { calendar } = setup()
    calendar.actions.configure({ isDateUnavailable: (date) => date === '2026-10-20' })
    expect(calendar.getDayAvailability('2026-10-20')).toBe('unavailable')
    calendar.actions.configure({ isDateUnavailable: undefined })
    expect(calendar.getDayAvailability('2026-10-20')).toBe('available')
  })

  test('a minimum after the maximum throws a RangeError, at creation and in configure', () => {
    expect(() => setup({ minimum: '2026-12-01', maximum: '2026-11-01' })).toThrow(RangeError)
    const { calendar } = setup()
    expect(() =>
      calendar.actions.configure({ minimum: '2027-01-01', maximum: '2026-01-01' }),
    ).toThrow(RangeError)
  })
})

describe('today', () => {
  test('is the date in the given zone, not the machine zone', () => {
    const instant = new Date(Date.UTC(2026, 9, 6, 23, 30))
    expect(getTodayIsoDate('UTC', instant)).toBe('2026-10-06')
    expect(getTodayIsoDate('Europe/Helsinki', instant)).toBe('2026-10-07')
    expect(getTodayIsoDate('America/Los_Angeles', instant)).toBe('2026-10-06')
  })
})
