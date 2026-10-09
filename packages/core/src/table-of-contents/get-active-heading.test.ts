import { describe, expect, test } from 'vite-plus/test'
import { getActiveHeading } from './get-active-heading.ts'
import type { HeadingPosition } from './get-active-heading.ts'

// Plan 0049: which heading a reader is in, from where the headings sit. Pure: no DOM.
// `top` is the distance of a heading's top edge from the top of the viewport, in document order.

const headings: HeadingPosition[] = [
  { id: 'a', top: -900 },
  { id: 'b', top: -300 },
  { id: 'c', top: 200 },
  { id: 'd', top: 900 },
]

describe('getActiveHeading', () => {
  test('the last heading above the line is the active one', () => {
    expect(getActiveHeading({ headings, offset: 0 })).toBe('b')
  })

  test('nothing is active while every heading is below the line', () => {
    expect(
      getActiveHeading({
        headings: [
          { id: 'a', top: 300 },
          { id: 'b', top: 900 },
        ],
        offset: 0,
      }),
    ).toBeUndefined()
  })

  test('no headings give no active heading', () => {
    expect(getActiveHeading({ headings: [], offset: 0 })).toBeUndefined()
  })

  test('a heading exactly on the line is active', () => {
    expect(getActiveHeading({ headings: [{ id: 'a', top: 64 }], offset: 64 })).toBe('a')
  })

  test('one pixel below the line still counts, because layout is sub-pixel', () => {
    expect(getActiveHeading({ headings: [{ id: 'a', top: 65 }], offset: 64 })).toBe('a')
    expect(getActiveHeading({ headings: [{ id: 'a', top: 65.01 }], offset: 64 })).toBeUndefined()
  })

  test('offset moves the line down, below a sticky header', () => {
    expect(getActiveHeading({ headings, offset: 0 })).toBe('b')
    expect(getActiveHeading({ headings, offset: 200 })).toBe('c')
    expect(getActiveHeading({ headings, offset: 900 })).toBe('d')
  })

  test('document order decides, not position: the last heading above the line wins', () => {
    expect(
      getActiveHeading({
        headings: [
          { id: 'a', top: -10 },
          { id: 'b', top: 500 },
          { id: 'c', top: -5 },
        ],
        offset: 0,
      }),
    ).toBe('c')
  })

  test('at the end of the page the last heading is active, even below the line', () => {
    expect(getActiveHeading({ headings, offset: 0, isAtEnd: true })).toBe('d')
  })

  test('at the end of the page a heading sitting on the line is active: the reader jumped to it', () => {
    expect(
      getActiveHeading({
        headings: [
          { id: 'a', top: -400 },
          { id: 'b', top: 24 },
          { id: 'c', top: 300 },
        ],
        offset: 24,
        isAtEnd: true,
      }),
    ).toBe('b')
    expect(
      getActiveHeading({
        headings: [
          { id: 'a', top: -400 },
          { id: 'b', top: 60 },
          { id: 'c', top: 300 },
        ],
        offset: 24,
        isAtEnd: true,
      }),
    ).toBe('c')
  })

  test('isAtEnd off, or left out, changes nothing', () => {
    expect(getActiveHeading({ headings, offset: 0, isAtEnd: false })).toBe('b')
    expect(getActiveHeading({ headings, offset: 0, isAtEnd: undefined })).toBe('b')
  })

  test('with a viewport height, the first heading that is visible below the line is active', () => {
    expect(
      getActiveHeading({
        headings: [
          { id: 'a', top: 350 },
          { id: 'b', top: 700 },
        ],
        offset: 40,
        viewportHeight: 1000,
      }),
    ).toBe('a')
  })

  test('with a viewport height, nothing is active while no heading is visible', () => {
    expect(
      getActiveHeading({
        headings: [
          { id: 'a', top: 1000 },
          { id: 'b', top: 1400 },
        ],
        offset: 40,
        viewportHeight: 1000,
      }),
    ).toBeUndefined()
  })

  test('with a viewport height, the line is the top 20% band, so a heading switches before it reaches the offset', () => {
    const bandHeadings = [
      { id: 'a', top: -500 },
      { id: 'b', top: 200 },
    ]
    expect(getActiveHeading({ headings: bandHeadings, offset: 0, viewportHeight: 1000 })).toBe('b')
    expect(getActiveHeading({ headings: bandHeadings, offset: 0 })).toBe('a')
    expect(
      getActiveHeading({
        headings: [
          { id: 'a', top: -500 },
          { id: 'b', top: 201.5 },
        ],
        offset: 0,
        viewportHeight: 1000,
      }),
    ).toBe('a')
  })

  test('without a viewport height the line is the offset and there is no fallback', () => {
    expect(
      getActiveHeading({
        headings: [
          { id: 'a', top: 350 },
          { id: 'b', top: 700 },
        ],
        offset: 40,
      }),
    ).toBeUndefined()
  })

  test('at the end of a page with no headings nothing is active', () => {
    expect(getActiveHeading({ headings: [], offset: 0, isAtEnd: true })).toBeUndefined()
  })
})
