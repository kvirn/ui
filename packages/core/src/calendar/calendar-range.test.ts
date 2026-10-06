import { describe, expect, test } from 'vite-plus/test'
import {
  chooseRangeDate,
  countDays,
  findBlockingDay,
  getRangeEndAvailability,
  getRangePosition,
  getRangeSpanStatus,
  getRangeStep,
  getVisibleRange,
} from './calendar-range.ts'
import type { DateRange, DateRangeRules } from './calendar-range.ts'

const none: DateRange = { start: '', end: '' }
const closedOn = (...days: string[]) => ({
  isDateUnavailable: (date: string) => days.includes(date),
})

describe('countDays', () => {
  test('counts both ends: a one-day range is 1', () => {
    expect(countDays('2026-10-16', '2026-10-16')).toBe(1)
    expect(countDays('2026-10-16', '2026-10-23')).toBe(8)
  })

  test('is zero or less for an end before the start', () => {
    expect(countDays('2026-10-16', '2026-10-15')).toBe(0)
  })
})

describe('the visible range', () => {
  test('an end before the start shows only the start and the value is not rewritten', () => {
    const value = { start: '2026-10-16', end: '2026-10-10' }
    expect(getVisibleRange(value)).toEqual({ start: '2026-10-16', end: '' })
    expect(value).toEqual({ start: '2026-10-16', end: '2026-10-10' })
  })

  test('start-only and end-only partials are kept', () => {
    expect(getVisibleRange({ start: '2026-10-16', end: '' })).toEqual({
      start: '2026-10-16',
      end: '',
    })
    expect(getVisibleRange({ start: '', end: '2026-10-16' })).toEqual({
      start: '',
      end: '2026-10-16',
    })
  })

  test('an invalid date is none', () => {
    expect(getVisibleRange({ start: '2026-02-30', end: 'nope' })).toEqual(none)
  })

  test('the step: start, then end, then complete; an end-only range waits for the start', () => {
    expect(getRangeStep(none)).toBe('start')
    expect(getRangeStep({ start: '2026-10-16', end: '' })).toBe('end')
    expect(getRangeStep({ start: '', end: '2026-10-16' })).toBe('start')
    expect(getRangeStep({ start: '2026-10-16', end: '2026-10-23' })).toBe('complete')
    expect(getRangeStep({ start: '2026-10-16', end: '2026-10-01' })).toBe('end')
  })
})

describe('the blocked scan', () => {
  test('finds the first unavailable day after the start, up to the last day asked for', () => {
    const { isDateUnavailable } = closedOn('2026-10-20', '2026-10-22')
    expect(findBlockingDay('2026-10-16', '2026-10-25', isDateUnavailable)).toBe('2026-10-20')
    expect(findBlockingDay('2026-10-16', '2026-10-19', isDateUnavailable)).toBeUndefined()
  })

  test('does not look at the start itself or past the last day', () => {
    const { isDateUnavailable } = closedOn('2026-10-16', '2026-10-26')
    expect(findBlockingDay('2026-10-16', '2026-10-25', isDateUnavailable)).toBeUndefined()
  })

  test('finds a day across a year end, and stops at the last possible day', () => {
    const { isDateUnavailable } = closedOn('2027-01-01')
    expect(findBlockingDay('2026-12-30', '2027-01-05', isDateUnavailable)).toBe('2027-01-01')
    expect(findBlockingDay('9999-12-30', '9999-12-31', () => false)).toBeUndefined()
  })

  test('without a predicate there is nothing to find', () => {
    expect(findBlockingDay('2026-10-16', '2026-12-31', undefined)).toBeUndefined()
  })
})

describe('the span of a range', () => {
  test('an end before the start is rejected', () => {
    expect(getRangeSpanStatus('2026-10-16', '2026-10-15', {})).toBe('before-start')
  })

  test('minimumDays and maximumDays count inclusive days, and the boundaries are allowed', () => {
    const rules: DateRangeRules = { minimumDays: 3, maximumDays: 5 }
    expect(getRangeSpanStatus('2026-10-16', '2026-10-17', rules)).toBe('too-short')
    expect(getRangeSpanStatus('2026-10-16', '2026-10-18', rules)).toBe('available')
    expect(getRangeSpanStatus('2026-10-16', '2026-10-20', rules)).toBe('available')
    expect(getRangeSpanStatus('2026-10-16', '2026-10-21', rules)).toBe('too-long')
  })

  test('a one-day range is allowed unless minimumDays is above 1', () => {
    expect(getRangeSpanStatus('2026-10-16', '2026-10-16', {})).toBe('available')
    expect(getRangeSpanStatus('2026-10-16', '2026-10-16', { minimumDays: 1 })).toBe('available')
    expect(getRangeSpanStatus('2026-10-16', '2026-10-16', { minimumDays: 2 })).toBe('too-short')
    expect(getRangeSpanStatus('2026-10-16', '2026-10-16', { maximumDays: 1 })).toBe('available')
  })

  test('an unavailable day between the ends blocks by default and passes when allowed', () => {
    const rules = closedOn('2026-10-20')
    expect(getRangeSpanStatus('2026-10-16', '2026-10-23', rules)).toBe('blocked')
    expect(
      getRangeSpanStatus('2026-10-16', '2026-10-23', { ...rules, allowUnavailableInRange: true }),
    ).toBe('available')
  })

  test('the ends themselves are not scanned', () => {
    const rules = closedOn('2026-10-16', '2026-10-23')
    expect(getRangeSpanStatus('2026-10-16', '2026-10-23', rules)).toBe('available')
  })

  test('blocked comes before too-short', () => {
    expect(
      getRangeSpanStatus('2026-10-16', '2026-10-18', { ...closedOn('2026-10-17'), minimumDays: 5 }),
    ).toBe('blocked')
  })

  test('blocked comes before the span limits', () => {
    expect(
      getRangeSpanStatus('2026-10-16', '2026-10-30', { ...closedOn('2026-10-18'), maximumDays: 3 }),
    ).toBe('blocked')
  })
})

describe('the end availability of a day', () => {
  test('an unavailable day or one outside the range is not an end, whatever the start', () => {
    const rules: DateRangeRules = {
      ...closedOn('2026-10-20'),
      minimum: '2026-10-01',
      maximum: '2026-10-31',
    }
    expect(getRangeEndAvailability('2026-10-20', '', rules)).toBe('unavailable')
    expect(getRangeEndAvailability('2026-11-02', '2026-10-16', rules)).toBe('outside-range')
    expect(getRangeEndAvailability('2026-10-21', '', rules)).toBe('available')
  })

  test('with a start, the reason is the span status', () => {
    const rules: DateRangeRules = { maximumDays: 3 }
    expect(getRangeEndAvailability('2026-10-15', '2026-10-16', rules)).toBe('before-start')
    expect(getRangeEndAvailability('2026-10-18', '2026-10-16', rules)).toBe('available')
    expect(getRangeEndAvailability('2026-10-19', '2026-10-16', rules)).toBe('too-long')
  })
})

describe('choosing a day, selects both', () => {
  const rules: DateRangeRules = {}

  test('the first press sets the start and asks for the end', () => {
    expect(chooseRangeDate(none, '2026-10-16', 'both', rules)).toEqual({
      range: { start: '2026-10-16', end: '' },
      step: 'end',
      reason: 'started',
      endCleared: false,
    })
  })

  test('the second press on a later day sets the end', () => {
    expect(chooseRangeDate({ start: '2026-10-16', end: '' }, '2026-10-23', 'both', rules)).toEqual({
      range: { start: '2026-10-16', end: '2026-10-23' },
      step: 'complete',
      reason: 'completed',
      endCleared: false,
    })
  })

  test('the start again is a one-day range when minimumDays allows it', () => {
    const result = chooseRangeDate({ start: '2026-10-16', end: '' }, '2026-10-16', 'both', {
      minimumDays: 1,
    })
    expect(result.range).toEqual({ start: '2026-10-16', end: '2026-10-16' })
    expect(result.reason).toBe('completed')
  })

  test('the start again is a new start (the same day) when minimumDays is above 1', () => {
    const result = chooseRangeDate({ start: '2026-10-16', end: '' }, '2026-10-16', 'both', {
      minimumDays: 2,
    })
    expect(result.range).toEqual({ start: '2026-10-16', end: '' })
    expect(result.reason).toBe('restarted-too-short')
    expect(result.step).toBe('end')
  })

  test('a day before the start becomes the new start, never a swap', () => {
    const result = chooseRangeDate({ start: '2026-10-16', end: '' }, '2026-10-10', 'both', rules)
    expect(result.range).toEqual({ start: '2026-10-10', end: '' })
    expect(result.reason).toBe('restarted-before-start')
    expect(result.step).toBe('end')
  })

  test('a day too far becomes the new start', () => {
    const result = chooseRangeDate({ start: '2026-10-16', end: '' }, '2026-10-30', 'both', {
      maximumDays: 7,
    })
    expect(result.range).toEqual({ start: '2026-10-30', end: '' })
    expect(result.reason).toBe('restarted-too-long')
  })

  test('a day past an unavailable day becomes the new start', () => {
    const result = chooseRangeDate(
      { start: '2026-10-16', end: '' },
      '2026-10-23',
      'both',
      closedOn('2026-10-20'),
    )
    expect(result.range).toEqual({ start: '2026-10-23', end: '' })
    expect(result.reason).toBe('restarted-blocked')
  })

  test('past an unavailable day it completes when unavailable days are allowed in a range', () => {
    const result = chooseRangeDate({ start: '2026-10-16', end: '' }, '2026-10-23', 'both', {
      ...closedOn('2026-10-20'),
      allowUnavailableInRange: true,
    })
    expect(result.reason).toBe('completed')
  })

  test('a press after a complete range starts a new one and drops the end', () => {
    const result = chooseRangeDate(
      { start: '2026-10-16', end: '2026-10-23' },
      '2026-11-02',
      'both',
      rules,
    )
    expect(result.range).toEqual({ start: '2026-11-02', end: '' })
    expect(result.reason).toBe('started')
  })

  test('a stored end before the start counts as no end: the second press completes it', () => {
    const result = chooseRangeDate(
      { start: '2026-10-16', end: '2026-10-01' },
      '2026-10-20',
      'both',
      rules,
    )
    expect(result.range).toEqual({ start: '2026-10-16', end: '2026-10-20' })
  })

  test('an end-only range: a start on or before it completes the range', () => {
    const result = chooseRangeDate({ start: '', end: '2026-10-23' }, '2026-10-16', 'both', rules)
    expect(result.range).toEqual({ start: '2026-10-16', end: '2026-10-23' })
    expect(result.reason).toBe('completed')
  })

  test('an end-only range: a later start, or one that breaks a limit, clears the end', () => {
    const later = chooseRangeDate({ start: '', end: '2026-10-23' }, '2026-10-25', 'both', rules)
    expect(later.range).toEqual({ start: '2026-10-25', end: '' })
    expect(later.endCleared).toBe(true)
    const tooLong = chooseRangeDate({ start: '', end: '2026-10-23' }, '2026-10-01', 'both', {
      maximumDays: 5,
    })
    expect(tooLong.range).toEqual({ start: '2026-10-01', end: '' })
    expect(tooLong.endCleared).toBe(true)
  })

  test('an unavailable day or one outside the range changes nothing and gives the range back', () => {
    const value = { start: '2026-10-16', end: '' }
    const blocked = chooseRangeDate(value, '2026-10-20', 'both', closedOn('2026-10-20'))
    expect(blocked.reason).toBe('ignored')
    expect(blocked.range).toBe(value)
    expect(blocked.step).toBe('end')
    const outside = chooseRangeDate(value, '2026-11-20', 'both', { maximum: '2026-10-31' })
    expect(outside.reason).toBe('ignored')
  })

  test('an invalid date changes nothing', () => {
    expect(chooseRangeDate(none, '2026-02-30', 'both', rules).reason).toBe('ignored')
  })
})

describe('choosing a day, selects start or end', () => {
  test('start: sets the start and keeps an end that still pairs with it', () => {
    const result = chooseRangeDate(
      { start: '2026-10-16', end: '2026-10-23' },
      '2026-10-18',
      'start',
      {},
    )
    expect(result).toEqual({
      range: { start: '2026-10-18', end: '2026-10-23' },
      step: 'complete',
      reason: 'start-set',
      endCleared: false,
    })
  })

  test('start: a start after the end clears the end', () => {
    const result = chooseRangeDate(
      { start: '2026-10-16', end: '2026-10-23' },
      '2026-10-25',
      'start',
      {},
    )
    expect(result.range).toEqual({ start: '2026-10-25', end: '' })
    expect(result.endCleared).toBe(true)
    expect(result.step).toBe('end')
  })

  test('start: a start that makes the span too long clears the end', () => {
    const result = chooseRangeDate(
      { start: '2026-10-16', end: '2026-10-23' },
      '2026-10-01',
      'start',
      { maximumDays: 7 },
    )
    expect(result.endCleared).toBe(true)
  })

  test('start: a stored end before the start is a valid pair for an earlier new start', () => {
    const result = chooseRangeDate(
      { start: '2026-10-20', end: '2026-10-10' },
      '2026-10-05',
      'start',
      {},
    )
    expect(result.range).toEqual({ start: '2026-10-05', end: '2026-10-10' })
    expect(result.endCleared).toBe(false)
  })

  test('start: a stored end before the start that still cannot pair is reported as cleared', () => {
    const result = chooseRangeDate(
      { start: '2026-10-20', end: '2026-10-10' },
      '2026-10-12',
      'start',
      {},
    )
    expect(result.range).toEqual({ start: '2026-10-12', end: '' })
    expect(result.endCleared).toBe(true)
  })

  test('start: with no end there is nothing to clear', () => {
    const result = chooseRangeDate(none, '2026-10-16', 'start', {})
    expect(result.endCleared).toBe(false)
    expect(result.range).toEqual({ start: '2026-10-16', end: '' })
  })

  test('end: sets the end when it pairs with the start', () => {
    const result = chooseRangeDate({ start: '2026-10-16', end: '' }, '2026-10-23', 'end', {})
    expect(result.range).toEqual({ start: '2026-10-16', end: '2026-10-23' })
    expect(result.reason).toBe('end-set')
  })

  test('end: a day that can not be the end changes nothing, whatever the reason', () => {
    const value = { start: '2026-10-16', end: '' }
    expect(chooseRangeDate(value, '2026-10-10', 'end', {}).reason).toBe('ignored')
    expect(chooseRangeDate(value, '2026-10-30', 'end', { maximumDays: 5 }).reason).toBe('ignored')
    expect(chooseRangeDate(value, '2026-10-23', 'end', closedOn('2026-10-20')).reason).toBe(
      'ignored',
    )
  })

  test('end: with no start any available day is an end-only range', () => {
    const result = chooseRangeDate(none, '2026-10-23', 'end', { maximumDays: 5 })
    expect(result.range).toEqual({ start: '', end: '2026-10-23' })
    expect(result.step).toBe('start')
  })
})

describe('the position of a day', () => {
  const range = { start: '2026-10-30', end: '2026-11-02' }

  test('start, the days between (across a month end), end', () => {
    expect(getRangePosition('2026-10-30', range)).toBe('start')
    expect(getRangePosition('2026-10-31', range)).toBe('in-range')
    expect(getRangePosition('2026-11-01', range)).toBe('in-range')
    expect(getRangePosition('2026-11-02', range)).toBe('end')
    expect(getRangePosition('2026-10-29', range)).toBeUndefined()
    expect(getRangePosition('2026-11-03', range)).toBeUndefined()
  })

  test('a one-day range is both ends', () => {
    expect(getRangePosition('2026-10-16', { start: '2026-10-16', end: '2026-10-16' })).toBe(
      'start-end',
    )
  })

  test('a start alone, an end alone', () => {
    expect(getRangePosition('2026-10-16', { start: '2026-10-16', end: '' })).toBe('start')
    expect(getRangePosition('2026-10-17', { start: '2026-10-16', end: '' })).toBeUndefined()
    expect(getRangePosition('2026-10-16', { start: '', end: '2026-10-16' })).toBe('end')
  })

  test('an end before the start shows only the start', () => {
    const reversed = { start: '2026-10-16', end: '2026-10-10' }
    expect(getRangePosition('2026-10-16', reversed)).toBe('start')
    expect(getRangePosition('2026-10-10', reversed)).toBeUndefined()
    expect(getRangePosition('2026-10-13', reversed)).toBeUndefined()
  })

  test('the preview runs from the start to the candidate while the end is pending', () => {
    const pending = { start: '2026-12-30', end: '' }
    expect(getRangePosition('2026-12-30', pending, '2027-01-02')).toBe('start')
    expect(getRangePosition('2026-12-31', pending, '2027-01-02')).toBe('preview')
    expect(getRangePosition('2027-01-01', pending, '2027-01-02')).toBe('preview')
    expect(getRangePosition('2027-01-02', pending, '2027-01-02')).toBe('preview-end')
    expect(getRangePosition('2027-01-03', pending, '2027-01-02')).toBeUndefined()
  })

  test('no preview for a day on or before the start, or once the range is complete', () => {
    const pending = { start: '2026-10-16', end: '' }
    expect(getRangePosition('2026-10-14', pending, '2026-10-14')).toBeUndefined()
    expect(getRangePosition('2026-10-16', pending, '2026-10-16')).toBe('start')
    expect(getRangePosition('2026-10-19', range, '2026-11-20')).toBeUndefined()
  })
})
