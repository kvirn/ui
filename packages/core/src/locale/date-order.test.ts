import { describe, expect, it } from 'vite-plus/test'
import { dateInputOrder, dateSeparator } from './date-order.ts'

describe('dateInputOrder', () => {
  it.each([
    ['sv-SE', ['year', 'month', 'day']],
    ['sv', ['year', 'month', 'day']],
    ['sv-FI', ['day', 'month', 'year']],
    ['fi', ['day', 'month', 'year']],
    ['nb', ['day', 'month', 'year']],
    ['nn', ['day', 'month', 'year']],
    ['en-GB', ['day', 'month', 'year']],
  ])('%s is %j', (locale, expected) => {
    expect(dateInputOrder(locale)).toEqual(expected)
  })

  it.each(['en', 'en-US'])('%s starts with the month in Intl, and becomes day first', (locale) => {
    expect(dateInputOrder(locale)).toEqual(['day', 'month', 'year'])
  })

  it('gives day, month, year for a locale Intl rejects', () => {
    expect(dateInputOrder('not a locale!')).toEqual(['day', 'month', 'year'])
  })
})

describe('dateSeparator', () => {
  it.each([
    ['sv-SE', '-'],
    ['fi', '.'],
    ['nb', '.'],
    ['nn', '.'],
    ['en-GB', '/'],
  ])('%s writes %s', (locale, expected) => {
    expect(dateSeparator(locale)).toBe(expected)
  })

  it('falls back to a point for a locale Intl rejects', () => {
    expect(dateSeparator('not a locale!')).toBe('.')
  })
})
