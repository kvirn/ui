import { describe, expect, test, vi } from 'vite-plus/test'
import { createCalendar } from './calendar.ts'
import type { CalendarMonthChange, CalendarOptions, CalendarRangeChange } from './calendar.ts'
import type { DateRange } from './calendar-range.ts'

function setup(options: Partial<CalendarOptions> = {}) {
  const onVisibleMonthChange = vi.fn<(change: CalendarMonthChange) => void>()
  const onRangeChange = vi.fn<(range: DateRange, change: CalendarRangeChange) => void>()
  const onSelect = vi.fn<(date: string) => void>()
  const calendar = createCalendar({
    today: '2026-10-14',
    mode: 'range',
    onVisibleMonthChange,
    onRangeChange,
    onSelect,
    ...options,
  })
  return { calendar, onVisibleMonthChange, onRangeChange, onSelect }
}

describe('range state', () => {
  test('focus starts on the start, else the end, else the focus request, else today', () => {
    const range = (start: string, end: string) => setup({ range: { start, end } })
    expect(range('2026-03-05', '2026-03-09').calendar.getState().focusedDate).toBe('2026-03-05')
    expect(range('', '2026-03-09').calendar.getState().focusedDate).toBe('2026-03-09')
    expect(setup({ focused: '2026-04-01' }).calendar.getState().focusedDate).toBe('2026-04-01')
    expect(setup().calendar.getState().focusedDate).toBe('2026-10-14')
  })

  test('the focused start is clamped to the range', () => {
    const { calendar } = setup({
      range: { start: '2026-01-05', end: '' },
      minimum: '2026-02-01',
    })
    expect(calendar.getState().focusedDate).toBe('2026-02-01')
  })

  test('the value is stored as given and read back without an end before the start', () => {
    const { calendar } = setup({ range: { start: '2026-10-16', end: '2026-10-10' } })
    expect(calendar.getState()).toMatchObject({ rangeStart: '2026-10-16', rangeEnd: '2026-10-10' })
    expect(calendar.getRange()).toEqual({ start: '2026-10-16', end: '' })
    expect(calendar.getRangeStep()).toBe('end')
  })

  test('invalid dates are none', () => {
    const { calendar } = setup({ range: { start: '2026-02-30', end: 'x' } })
    expect(calendar.getRange()).toEqual({ start: '', end: '' })
  })

  test('setRange replaces the value without a callback', () => {
    const { calendar, onRangeChange } = setup()
    calendar.actions.setRange({ start: '2026-10-16', end: '2026-10-23' })
    expect(calendar.getRange()).toEqual({ start: '2026-10-16', end: '2026-10-23' })
    expect(onRangeChange).not.toHaveBeenCalled()
  })
})

describe('pressing days', () => {
  test('two presses set the start, then the end, each reported with its reason and step', () => {
    const { calendar, onRangeChange, onSelect } = setup()
    calendar.actions.select('2026-10-16')
    expect(onRangeChange).toHaveBeenLastCalledWith(
      { start: '2026-10-16', end: '' },
      { reason: 'started', step: 'end', endCleared: false },
    )
    calendar.actions.select('2026-10-23')
    expect(onRangeChange).toHaveBeenLastCalledWith(
      { start: '2026-10-16', end: '2026-10-23' },
      { reason: 'completed', step: 'complete', endCleared: false },
    )
    expect(calendar.getState()).toMatchObject({ rangeStart: '2026-10-16', rangeEnd: '2026-10-23' })
    expect(onSelect).not.toHaveBeenCalled()
  })

  test('a day that cannot be the end becomes the new start', () => {
    const { calendar, onRangeChange } = setup({
      range: { start: '2026-10-16', end: '' },
      maximumDays: 5,
    })
    calendar.actions.select('2026-10-30')
    expect(calendar.getRange()).toEqual({ start: '2026-10-30', end: '' })
    expect(onRangeChange).toHaveBeenCalledWith(
      { start: '2026-10-30', end: '' },
      { reason: 'restarted-too-long', step: 'end', endCleared: false },
    )
  })

  test('an unavailable day reports nothing and keeps the range', () => {
    const { calendar, onRangeChange } = setup({
      range: { start: '2026-10-16', end: '' },
      isDateUnavailable: (date) => date === '2026-10-20',
    })
    calendar.actions.select('2026-10-20')
    expect(onRangeChange).not.toHaveBeenCalled()
    expect(calendar.getRange()).toEqual({ start: '2026-10-16', end: '' })
  })

  test('selects start clears an end it cannot pair with, and says so', () => {
    const { calendar, onRangeChange } = setup({
      range: { start: '2026-10-16', end: '2026-10-23' },
      selects: 'start',
    })
    calendar.actions.select('2026-10-25')
    expect(onRangeChange).toHaveBeenCalledWith(
      { start: '2026-10-25', end: '' },
      { reason: 'start-set', step: 'end', endCleared: true },
    )
  })

  test('selects end ignores a day before the start', () => {
    const { calendar, onRangeChange } = setup({
      range: { start: '2026-10-16', end: '' },
      selects: 'end',
    })
    calendar.actions.select('2026-10-10')
    expect(onRangeChange).not.toHaveBeenCalled()
  })

  test('an ignored press leaves the selected day and onSelect alone', () => {
    const { calendar, onSelect, onRangeChange } = setup({
      selected: '2026-10-01',
      isDateUnavailable: (date) => date === '2026-10-20',
    })
    calendar.actions.select('2026-10-20')
    expect(calendar.getState().selectedDate).toBe('2026-10-01')
    expect(onSelect).not.toHaveBeenCalled()
    expect(onRangeChange).not.toHaveBeenCalled()
  })

  test('minimumDays and maximumDays must be 1 or more and in order', () => {
    expect(() => setup({ minimumDays: 0 })).toThrow(RangeError)
    expect(() => setup({ maximumDays: 0 })).toThrow(RangeError)
    expect(() => setup({ minimumDays: 5, maximumDays: 3 })).toThrow(RangeError)
    expect(() => setup({ minimumDays: 3, maximumDays: 3 })).not.toThrow()
    const { calendar } = setup()
    expect(() => calendar.actions.configure({ minimumDays: 5, maximumDays: 3 })).toThrow(RangeError)
  })

  test('configure changes the rules for the next press', () => {
    const { calendar } = setup({ range: { start: '2026-10-16', end: '' } })
    calendar.actions.configure({ maximumDays: 3, allowUnavailableInRange: true })
    expect(calendar.getEndAvailability('2026-10-19')).toBe('too-long')
    calendar.actions.configure({ maximumDays: undefined })
    expect(calendar.getEndAvailability('2026-10-19')).toBe('available')
  })
})

describe('the preview', () => {
  const pending: Partial<CalendarOptions> = { range: { start: '2026-10-16', end: '' } }

  test('draws from the start to the preview day while the end is pending', () => {
    const { calendar } = setup(pending)
    calendar.actions.setPreviewDate('2026-10-19')
    expect(calendar.getDayRangePosition('2026-10-17')).toBe('preview')
    expect(calendar.getDayRangePosition('2026-10-19')).toBe('preview-end')
    expect(calendar.getDayRangePosition('2026-10-20')).toBeUndefined()
  })

  test('a day that could not be the end draws no preview', () => {
    const { calendar } = setup({ ...pending, maximumDays: 3 })
    calendar.actions.setPreviewDate('2026-10-25')
    expect(calendar.getDayRangePosition('2026-10-17')).toBeUndefined()
  })

  test('no preview once the range is complete, in selects start, or after it is cleared', () => {
    const complete = setup({ range: { start: '2026-10-16', end: '2026-10-18' } }).calendar
    complete.actions.setPreviewDate('2026-10-25')
    expect(complete.getDayRangePosition('2026-10-21')).toBeUndefined()
    const startOnly = setup({ ...pending, selects: 'start' }).calendar
    startOnly.actions.setPreviewDate('2026-10-19')
    expect(startOnly.getDayRangePosition('2026-10-17')).toBeUndefined()
    const { calendar } = setup(pending)
    calendar.actions.setPreviewDate('2026-10-19')
    calendar.actions.setPreviewDate(undefined)
    expect(calendar.getDayRangePosition('2026-10-17')).toBeUndefined()
  })

  test('an invalid preview day is none', () => {
    const { calendar } = setup(pending)
    calendar.actions.setPreviewDate('2026-02-30')
    expect(calendar.getState().previewDate).toBeUndefined()
  })
})

describe('two months', () => {
  const two = (options: Partial<CalendarOptions> = {}) =>
    setup({ mode: 'single', visibleMonths: 2, ...options })

  test('the second grid is the month after the first', () => {
    const { calendar } = two({ focused: '2026-12-10' })
    expect(calendar.getShownMonths()).toEqual([
      { year: 2026, month: 12 },
      { year: 2027, month: 1 },
    ])
  })

  test('one month shows one', () => {
    expect(setup({ mode: 'single' }).calendar.getShownMonths()).toEqual([{ year: 2026, month: 10 }])
  })

  test('an arrow from the last day of the first grid goes into the second without moving the view', () => {
    const { calendar, onVisibleMonthChange } = two({ focused: '2026-10-31' })
    calendar.actions.handleKey('ArrowRight', false)
    expect(calendar.getState().focusedDate).toBe('2026-11-01')
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 10 })
    expect(onVisibleMonthChange).not.toHaveBeenCalled()
  })

  test('an arrow from the first day of the second grid goes back without moving the view', () => {
    const { calendar, onVisibleMonthChange } = two()
    calendar.actions.focusDate('2026-11-01')
    calendar.actions.handleKey('ArrowLeft', false)
    expect(calendar.getState().focusedDate).toBe('2026-10-31')
    expect(onVisibleMonthChange).not.toHaveBeenCalled()
  })

  test('an arrow out of the second grid moves the view by one month, with reason key', () => {
    const { calendar, onVisibleMonthChange } = two()
    calendar.actions.focusDate('2026-11-30')
    calendar.actions.handleKey('ArrowRight', false)
    expect(calendar.getState().focusedDate).toBe('2026-12-01')
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 11 })
    expect(onVisibleMonthChange).toHaveBeenCalledExactlyOnceWith({
      year: 2026,
      month: 11,
      reason: 'key',
    })
  })

  test('an arrow out of the first grid moves the view back by one month', () => {
    const { calendar, onVisibleMonthChange } = two({ focused: '2026-10-01' })
    calendar.actions.handleKey('ArrowLeft', false)
    expect(calendar.getState().focusedDate).toBe('2026-09-30')
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 9 })
    expect(onVisibleMonthChange).toHaveBeenCalledExactlyOnceWith({
      year: 2026,
      month: 9,
      reason: 'key',
    })
  })

  test('in rtl the arrows flip, and the view still moves only when the day leaves both grids', () => {
    const { calendar, onVisibleMonthChange } = two({ focused: '2026-10-31', direction: 'rtl' })
    calendar.actions.handleKey('ArrowLeft', false)
    expect(calendar.getState().focusedDate).toBe('2026-11-01')
    expect(onVisibleMonthChange).not.toHaveBeenCalled()
    calendar.actions.focusDate('2026-11-30')
    calendar.actions.handleKey('ArrowLeft', false)
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 11 })
  })

  test('PageDown keeps the day and moves the view only when it leaves it', () => {
    const { calendar, onVisibleMonthChange } = two()
    calendar.actions.handleKey('PageDown', false)
    expect(calendar.getState().focusedDate).toBe('2026-11-14')
    expect(onVisibleMonthChange).not.toHaveBeenCalled()
    calendar.actions.handleKey('PageDown', false)
    expect(calendar.getState().focusedDate).toBe('2026-12-14')
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 11 })
    calendar.actions.handleKey('PageUp', false)
    calendar.actions.handleKey('PageUp', false)
    expect(calendar.getState().focusedDate).toBe('2026-10-14')
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 10 })
  })

  test('a year jump with a maximum keeps the second grid inside it', () => {
    const { calendar } = two({ maximum: '2027-11-30' })
    calendar.actions.handleKey('PageDown', true)
    expect(calendar.getState().focusedDate).toBe('2027-10-14')
    expect(calendar.getShownMonths()).toEqual([
      { year: 2027, month: 10 },
      { year: 2027, month: 11 },
    ])
  })

  test('the view stays inside years 1 to 9999 with no minimum or maximum', () => {
    const late = two({ focused: '9999-12-10' }).calendar
    expect(late.getShownMonths()).toEqual([
      { year: 9999, month: 11 },
      { year: 9999, month: 12 },
    ])
    const single = setup({ mode: 'single', focused: '9999-12-10' }).calendar
    expect(single.canShowMonth(1)).toBe(false)
    expect(setup({ mode: 'single', focused: '0001-01-10' }).calendar.canShowMonth(-1)).toBe(false)
  })

  test('a year jump puts the day in the first grid', () => {
    const { calendar } = two()
    calendar.actions.handleKey('PageDown', true)
    expect(calendar.getState().focusedDate).toBe('2027-10-14')
    expect(calendar.getState().visibleMonth).toEqual({ year: 2027, month: 10 })
  })

  test('a move across a year end shows December and January together', () => {
    const { calendar } = two({ focused: '2026-12-31' })
    calendar.actions.handleKey('ArrowRight', false)
    expect(calendar.getState().focusedDate).toBe('2027-01-01')
    expect(calendar.getShownMonths()).toEqual([
      { year: 2026, month: 12 },
      { year: 2027, month: 1 },
    ])
  })

  test('the month buttons move the view by one month and the day with it, reason button', () => {
    const { calendar, onVisibleMonthChange } = two()
    calendar.actions.showMonth(1)
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 11 })
    expect(calendar.getState().focusedDate).toBe('2026-11-14')
    expect(onVisibleMonthChange).toHaveBeenCalledExactlyOnceWith({
      year: 2026,
      month: 11,
      reason: 'button',
    })
    calendar.actions.showMonth(-1)
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 10 })
    expect(calendar.getState().focusedDate).toBe('2026-10-14')
  })

  test('the last allowed view ends on the maximum month, so no empty grid follows', () => {
    const { calendar } = two({ maximum: '2026-12-31', focused: '2026-12-20' })
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 11 })
    expect(calendar.canShowMonth(1)).toBe(false)
    expect(calendar.canShowMonth(-1)).toBe(true)
  })

  test('the first view starts on the minimum month', () => {
    const { calendar } = two({ minimum: '2026-10-01', focused: '2026-10-05' })
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 10 })
    expect(calendar.canShowMonth(-1)).toBe(false)
    expect(calendar.canShowMonth(1)).toBe(true)
  })

  test('configure to two months keeps the focused day in view and reports the change', () => {
    const { calendar, onVisibleMonthChange } = setup({ mode: 'single', maximum: '2026-10-31' })
    calendar.actions.configure({ visibleMonths: 2 })
    expect(calendar.getState().visibleMonth).toEqual({ year: 2026, month: 9 })
    expect(onVisibleMonthChange).toHaveBeenCalledExactlyOnceWith({
      year: 2026,
      month: 9,
      reason: 'configure',
    })
  })
})
