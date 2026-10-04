import { describe, expect, test } from 'vite-plus/test'
import {
  countCharacters,
  defaultCharacterCountAnnounceFrom,
  getCharacterCount,
} from './character-count.ts'

// The maths behind a character count (Plan 0034, design spec §6.3). What the user sees is what is
// counted, so a letter built from two code points, an emoji and a line break are one each.

describe('countCharacters', () => {
  test.each([
    ['', 0],
    ['Hej', 3],
    ['Hej på dig', 10],
    // a decomposed å: a, then a combining ring above
    ['å', 1],
    ['å', 1],
    // an emoji, one with a skin tone, and a family joined with zero-width joiners
    ['\u{1F44D}', 1],
    ['\u{1F44D}\u{1F3FD}', 1],
    ['\u{1F468}‍\u{1F469}‍\u{1F467}', 1],
    // a flag is two regional indicators
    ['\u{1F1F8}\u{1F1EA}', 1],
  ])('%j counts %i, as the user sees it', (value, expected) => {
    expect(countCharacters(value)).toBe(expected)
  })

  test('a line break counts as one, whether it is written \\n or \\r\\n', () => {
    expect(countCharacters('a\nb')).toBe(3)
    expect(countCharacters('a\r\nb')).toBe(3)
  })
})

describe('getCharacterCount', () => {
  test('under the limit: the length and how many are left', () => {
    const count = getCharacterCount({ value: 'abcdefgh', limit: 10 })
    expect(count).toMatchObject({
      length: 8,
      limit: 10,
      remaining: 2,
      excess: 0,
      isEmpty: false,
      isOver: false,
    })
  })

  test('empty is its own state: the message names the limit', () => {
    expect(getCharacterCount({ value: '', limit: 10 })).toMatchObject({
      length: 0,
      remaining: 10,
      isEmpty: true,
      isOver: false,
    })
  })

  test('exactly at the limit is not over', () => {
    const count = getCharacterCount({ value: 'abcdefghij', limit: 10 })
    expect(count).toMatchObject({ length: 10, remaining: 0, excess: 0, isOver: false })
  })

  test('over the limit: how many too many, and nothing remains', () => {
    const count = getCharacterCount({ value: 'abcdefghijkl', limit: 10 })
    expect(count).toMatchObject({ length: 12, remaining: 0, excess: 2, isOver: true })
  })

  test('counts the way the user sees it, not in UTF-16 code units', () => {
    // 5 code units each, but 1 and 3 characters.
    expect(getCharacterCount({ value: '\u{1F468}‍\u{1F469}‍\u{1F467}', limit: 3 }).length).toBe(1)
    expect(getCharacterCount({ value: 'åb̊c̊', limit: 3 })).toMatchObject({
      length: 3,
      isOver: false,
    })
  })

  test('countCharacters replaces the default, so the count can match the server', () => {
    const count = getCharacterCount({
      value: 'abc',
      limit: 5,
      countCharacters: (value) => value.length * 2,
    })
    expect(count).toMatchObject({ length: 6, remaining: 0, excess: 1, isOver: true })
  })
})

describe('when to announce', () => {
  test('the default threshold is 80% of the limit', () => {
    expect(defaultCharacterCountAnnounceFrom).toBe(0.8)
  })

  test('below the threshold nothing is announced', () => {
    const count = getCharacterCount({ value: 'a'.repeat(79), limit: 100 })
    expect(count).toMatchObject({ isNear: false, announce: 'none' })
  })

  test('at the threshold it is announced when typing pauses', () => {
    const count = getCharacterCount({ value: 'a'.repeat(80), limit: 100 })
    expect(count).toMatchObject({ isNear: true, announce: 'afterPause' })
  })

  test('the threshold is rounded up, so 80% of 15 is 12', () => {
    expect(getCharacterCount({ value: 'a'.repeat(11), limit: 15 }).isNear).toBe(false)
    expect(getCharacterCount({ value: 'a'.repeat(12), limit: 15 }).isNear).toBe(true)
  })

  test('announceFrom moves the threshold', () => {
    expect(
      getCharacterCount({ value: 'a'.repeat(50), limit: 100, announceFrom: 0.5 }).announce,
    ).toBe('afterPause')
    expect(
      getCharacterCount({ value: 'a'.repeat(49), limit: 100, announceFrom: 0.5 }).announce,
    ).toBe('none')
  })

  test('crossing the limit is announced at once, and only on the crossing', () => {
    const crossing = getCharacterCount({
      value: 'a'.repeat(101),
      limit: 100,
      previousLength: 100,
    })
    expect(crossing).toMatchObject({ isOver: true, crossedOver: true, announce: 'now' })

    const stillOver = getCharacterCount({
      value: 'a'.repeat(102),
      limit: 100,
      previousLength: 101,
    })
    expect(stillOver).toMatchObject({ isOver: true, crossedOver: false, announce: 'afterPause' })
  })

  test('a paste that jumps from far below to over the limit is a crossing too', () => {
    const count = getCharacterCount({ value: 'a'.repeat(300), limit: 100, previousLength: 5 })
    expect(count).toMatchObject({ crossedOver: true, announce: 'now' })
  })

  test('without a previous length, being over is not a crossing', () => {
    expect(getCharacterCount({ value: 'a'.repeat(101), limit: 100 })).toMatchObject({
      isOver: true,
      crossedOver: false,
      announce: 'afterPause',
    })
  })

  test('shortening back under the limit is not a crossing, and is announced after a pause while near', () => {
    const count = getCharacterCount({ value: 'a'.repeat(95), limit: 100, previousLength: 101 })
    expect(count).toMatchObject({ isOver: false, crossedOver: false, announce: 'afterPause' })
  })

  test('announceFrom is kept between 0 and 1', () => {
    expect(getCharacterCount({ value: 'a', limit: 100, announceFrom: 5 }).isNear).toBe(false)
    expect(getCharacterCount({ value: 'a'.repeat(100), limit: 100, announceFrom: 5 }).isNear).toBe(
      true,
    )
    expect(getCharacterCount({ value: 'a', limit: 100, announceFrom: -1 }).isNear).toBe(true)
  })
})

describe('an unusable limit', () => {
  test.each([0, -3, Number.NaN])('limit %s leaves any text over it and never throws', (limit) => {
    expect(getCharacterCount({ value: '', limit }).isOver).toBe(false)
    expect(getCharacterCount({ value: 'a', limit })).toMatchObject({ isOver: true, remaining: 0 })
  })
})
