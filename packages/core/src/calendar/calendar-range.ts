import {
  addDays,
  clampIsoDate,
  getDaysBetween,
  isValidIsoDate,
} from '../calendar-date/calendar-date.ts'
import type { IsoDate } from '../calendar-date/calendar-date.ts'

/** `''` is "none": a start only and an end only are valid, partial ranges. */
export interface DateRange {
  start: IsoDate
  end: IsoDate
}

/** Which end a press sets: `both` is start then end, the others are one end of a from/to pair. */
export type RangeSelects = 'both' | 'start' | 'end'

/** What the next press does: set the `start`, set the `end`, or (`complete`) begin a new range. */
export type RangeStep = 'start' | 'end' | 'complete'

export interface DateRangeRules {
  /** Fewest days, counting both ends: a one-day range is 1. */
  minimumDays?: number | undefined
  maximumDays?: number | undefined
  /** Default `false`: an unavailable day between the ends blocks the range. */
  allowUnavailableInRange?: boolean | undefined
  minimum?: IsoDate | undefined
  maximum?: IsoDate | undefined
  isDateUnavailable?: ((date: IsoDate) => boolean) | undefined
}

export type RangeSpanStatus = 'available' | 'before-start' | 'too-short' | 'too-long' | 'blocked'

export type RangeEndAvailability = RangeSpanStatus | 'unavailable' | 'outside-range'

/** `started` and `completed` are the normal steps; `restarted-*` is a day that can't be the end becoming the new start. */
export type RangeChoiceReason =
  | 'started'
  | 'completed'
  | 'restarted-before-start'
  | 'restarted-too-short'
  | 'restarted-too-long'
  | 'restarted-blocked'
  | 'start-set'
  | 'end-set'
  | 'ignored'

export interface RangeChoice {
  range: DateRange
  /** The step after this press. */
  step: RangeStep
  reason: RangeChoiceReason
  /** `selects` start or end only: the other end was dropped because the new one can't pair with it. */
  endCleared: boolean
}

export type RangePosition = 'start' | 'end' | 'start-end' | 'in-range' | 'preview' | 'preview-end'

export type CalendarDayAvailability = 'available' | 'unavailable' | 'outside-range'

export function getDayAvailability(
  date: IsoDate,
  settings: Pick<DateRangeRules, 'minimum' | 'maximum' | 'isDateUnavailable'>,
): CalendarDayAvailability {
  if (clampIsoDate(date, settings.minimum, settings.maximum) !== date) return 'outside-range'
  return settings.isDateUnavailable?.(date) === true ? 'unavailable' : 'available'
}

function validOrEmpty(date: string): IsoDate {
  return isValidIsoDate(date) ? date : ''
}

/**
 * The range as shown: invalid dates are none, and an end before the start is ignored (the start
 * shows alone). The value itself is never rewritten.
 */
export function getVisibleRange(range: DateRange): DateRange {
  const start = validOrEmpty(range.start)
  const end = validOrEmpty(range.end)
  return start !== '' && end !== '' && end < start ? { start, end: '' } : { start, end }
}

/** Days from `start` to `end`, counting both (a one-day range is 1). Zero or less when `end` is before `start`. */
export function countDays(start: IsoDate, end: IsoDate): number {
  return getDaysBetween(start, end) + 1
}

export function getRangeStep(range: DateRange): RangeStep {
  const { start, end } = getVisibleRange(range)
  if (start === '') return 'start'
  return end === '' ? 'end' : 'complete'
}

/**
 * The first unavailable day after `start`, up to and including `last`. The scan never goes past
 * `last`, so a caller passes the last day it needs (the last visible one, or a candidate end).
 */
export function findBlockingDay(
  start: IsoDate,
  last: IsoDate,
  isDateUnavailable: ((date: IsoDate) => boolean) | undefined,
): IsoDate | undefined {
  if (isDateUnavailable === undefined) return undefined
  for (let day = addDays(start, 1); day <= last; day = addDays(day, 1)) {
    if (isDateUnavailable(day)) return day
    if (day === '9999-12-31') break
  }
  return undefined
}

/** Whether `start` to `end` is a range the rules allow. The ends' own availability is not checked. */
export function getRangeSpanStatus(
  start: IsoDate,
  end: IsoDate,
  rules: DateRangeRules,
): RangeSpanStatus {
  if (end < start) return 'before-start'
  if (
    rules.allowUnavailableInRange !== true &&
    end > start &&
    findBlockingDay(start, addDays(end, -1), rules.isDateUnavailable) !== undefined
  ) {
    return 'blocked'
  }
  const days = countDays(start, end)
  if (rules.minimumDays !== undefined && days < rules.minimumDays) return 'too-short'
  if (rules.maximumDays !== undefined && days > rules.maximumDays) return 'too-long'
  return 'available'
}

/** Whether `date` can be the end for `start` (`''` for none, then only its own availability counts). */
export function getRangeEndAvailability(
  date: IsoDate,
  start: IsoDate,
  rules: DateRangeRules,
): RangeEndAvailability {
  const availability = getDayAvailability(date, rules)
  if (availability !== 'available') return availability
  return start === '' ? 'available' : getRangeSpanStatus(start, date, rules)
}

function restartReason(status: Exclude<RangeSpanStatus, 'available'>): RangeChoiceReason {
  return `restarted-${status}`
}

/**
 * A press on `date`. A day that can't be the end becomes the new start (`restarted-*`), so there is
 * no dead end; an unavailable day or one outside the range changes nothing (`ignored`, and
 * `range` comes back as it was).
 */
export function chooseRangeDate(
  range: DateRange,
  date: IsoDate,
  selects: RangeSelects,
  rules: DateRangeRules,
): RangeChoice {
  const current = getVisibleRange(range)
  const result = (next: DateRange, reason: RangeChoiceReason, endCleared = false): RangeChoice => ({
    range: next,
    step: getRangeStep(next),
    reason,
    endCleared,
  })

  if (!isValidIsoDate(date) || getDayAvailability(date, rules) !== 'available') {
    return { range, step: getRangeStep(range), reason: 'ignored', endCleared: false }
  }

  if (selects === 'start') {
    const storedEnd = validOrEmpty(range.end)
    const keepsEnd = storedEnd !== '' && getRangeSpanStatus(date, storedEnd, rules) === 'available'
    return result(
      { start: date, end: keepsEnd ? storedEnd : '' },
      'start-set',
      storedEnd !== '' && !keepsEnd,
    )
  }

  if (selects === 'end') {
    if (current.start !== '' && getRangeSpanStatus(current.start, date, rules) !== 'available') {
      return { range, step: getRangeStep(range), reason: 'ignored', endCleared: false }
    }
    return result({ start: current.start, end: date }, 'end-set')
  }

  if (current.start !== '' && current.end === '') {
    const status = getRangeSpanStatus(current.start, date, rules)
    return status === 'available'
      ? result({ start: current.start, end: date }, 'completed')
      : result({ start: date, end: '' }, restartReason(status))
  }

  if (current.start === '' && current.end !== '') {
    return getRangeSpanStatus(date, current.end, rules) === 'available'
      ? result({ start: date, end: current.end }, 'completed')
      : result({ start: date, end: '' }, 'started', true)
  }

  return result({ start: date, end: '' }, 'started')
}

/**
 * How `date` is drawn. `preview` is the candidate end under the pointer or focus while the end is
 * pending; the caller passes it only when it could be the end.
 */
export function getRangePosition(
  date: IsoDate,
  range: DateRange,
  preview?: IsoDate,
): RangePosition | undefined {
  const { start, end } = getVisibleRange(range)
  if (start !== '' && end !== '') {
    if (date === start && date === end) return 'start-end'
    if (date === start) return 'start'
    if (date === end) return 'end'
    return date > start && date < end ? 'in-range' : undefined
  }
  if (start !== '') {
    if (date === start) return 'start'
    if (preview !== undefined && preview > start && date > start && date <= preview) {
      return date === preview ? 'preview-end' : 'preview'
    }
    return undefined
  }
  return end !== '' && date === end ? 'end' : undefined
}
