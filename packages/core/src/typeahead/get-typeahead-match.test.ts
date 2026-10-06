import { describe, expect, test } from 'vite-plus/test'
import { getTypeaheadMatch } from './get-typeahead-match.ts'

const labels = ['Apple', 'Apricot', 'Banana', 'Cherry']

describe('getTypeaheadMatch', () => {
  test('finds the first item that starts with a character, ignoring case', () => {
    expect(getTypeaheadMatch({ word: 'B', labels, currentIndex: -1 })).toBe(2)
  })

  test('a single character starts after the current item and wraps', () => {
    expect(getTypeaheadMatch({ word: 'a', labels, currentIndex: 0 })).toBe(1)
    expect(getTypeaheadMatch({ word: 'a', labels, currentIndex: 1 })).toBe(0)
  })

  test('a repeated character cycles through the items that start with it', () => {
    expect(getTypeaheadMatch({ word: 'aa', labels, currentIndex: 0 })).toBe(1)
    expect(getTypeaheadMatch({ word: 'aaa', labels, currentIndex: 1 })).toBe(0)
  })

  test('a longer word stays on the current item while it still matches', () => {
    expect(getTypeaheadMatch({ word: 'ap', labels, currentIndex: 0 })).toBe(0)
    expect(getTypeaheadMatch({ word: 'apr', labels, currentIndex: 0 })).toBe(1)
  })

  test('returns undefined when nothing matches, the word is empty or there are no items', () => {
    expect(getTypeaheadMatch({ word: 'z', labels, currentIndex: 0 })).toBeUndefined()
    expect(getTypeaheadMatch({ word: '', labels, currentIndex: 0 })).toBeUndefined()
    expect(getTypeaheadMatch({ word: 'a', labels: [], currentIndex: -1 })).toBeUndefined()
  })

  test('keeps å, ä and ö apart from a and o in Swedish', () => {
    const swedish = ['Aka', 'Åka', 'Äta', 'Öppna', 'Olle']
    expect(getTypeaheadMatch({ word: 'å', labels: swedish, currentIndex: -1, locale: 'sv' })).toBe(
      1,
    )
    expect(getTypeaheadMatch({ word: 'ä', labels: swedish, currentIndex: -1, locale: 'sv' })).toBe(
      2,
    )
    expect(getTypeaheadMatch({ word: 'ö', labels: swedish, currentIndex: -1, locale: 'sv' })).toBe(
      3,
    )
  })

  test('matches a word with a space in it', () => {
    expect(
      getTypeaheadMatch({ word: 'skriv u', labels: ['Dela', 'Skriv ut'], currentIndex: -1 }),
    ).toBe(1)
  })
})
