import { describe, expect, test } from 'vite-plus/test'
import { filterItems, matchesText, startsWithText } from './filter-items.ts'

const places = ['Älmhult', 'Alvesta', 'Örebro', 'Orsa', 'Åre', 'Arvika']

describe('matchesText', () => {
  test('finds the query anywhere in the label', () => {
    expect(matchesText('Älmhult', 'hult', 'sv')).toBe(true)
    expect(matchesText('Älmhult', 'älm', 'sv')).toBe(true)
    expect(matchesText('Älmhult', 'mh', 'sv')).toBe(true)
    expect(matchesText('Älmhult', 'xyz', 'sv')).toBe(false)
  })

  test('ignores case', () => {
    expect(matchesText('Åre', 'ÅRE', 'sv')).toBe(true)
    expect(matchesText('Åre', 'åre', 'sv')).toBe(true)
  })

  test('a blank query matches everything, and white space around a query is ignored', () => {
    expect(matchesText('Åre', '', 'sv')).toBe(true)
    expect(matchesText('Åre', '   ', 'sv')).toBe(true)
    expect(matchesText('Alvesta', ' alv ', 'sv')).toBe(true)
  })

  test('a query longer than the label does not match', () => {
    expect(matchesText('Åre', 'åreskutan', 'sv')).toBe(false)
  })

  test('a decomposed å equals a composed å', () => {
    expect(matchesText('Åre', 'å', 'sv')).toBe(true)
    expect(matchesText('Åre', 'åre', 'sv')).toBe(true)
  })

  test('does not treat the query as a pattern', () => {
    expect(matchesText('a.b', '.', 'en')).toBe(true)
    expect(matchesText('ab', '.', 'en')).toBe(false)
    expect(matchesText('a(b', '(', 'en')).toBe(true)
  })
})

describe('startsWithText', () => {
  test('matches the start of the label only', () => {
    expect(startsWithText('Stockholm', 'sto', 'sv')).toBe(true)
    expect(startsWithText('Stockholm', 'kho', 'sv')).toBe(false)
  })

  test('keeps å, ä and ö apart from a and o in Swedish', () => {
    expect(startsWithText('Åre', 'a', 'sv')).toBe(false)
    expect(startsWithText('Åre', 'å', 'sv')).toBe(true)
    expect(startsWithText('Älmhult', 'a', 'sv')).toBe(false)
    expect(startsWithText('Örebro', 'o', 'sv')).toBe(false)
  })

  test('a space is a character, not white space to trim', () => {
    expect(startsWithText('New York', 'new ', 'en')).toBe(true)
    expect(startsWithText('Newark', 'new ', 'en')).toBe(false)
  })

  test('an empty query matches everything', () => {
    expect(startsWithText('Åre', '', 'sv')).toBe(true)
  })
})

describe('filterItems', () => {
  test('keeps å, ä and ö distinct in Swedish', () => {
    expect(filterItems(places, 'ä', { locale: 'sv' })).toEqual(['Älmhult'])
    expect(filterItems(places, 'ö', { locale: 'sv' })).toEqual(['Örebro'])
    expect(filterItems(places, 'å', { locale: 'sv' })).toEqual(['Åre'])
    expect(filterItems(places, 'a', { locale: 'sv' })).toEqual(['Alvesta', 'Orsa', 'Arvika'])
    expect(filterItems(places, 'o', { locale: 'sv' })).toEqual(['Örebro', 'Orsa'])
  })

  test('keeps ä and ö distinct in Finnish', () => {
    expect(filterItems(places, 'ä', { locale: 'fi' })).toEqual(['Älmhult'])
    expect(filterItems(places, 'ö', { locale: 'fi' })).toEqual(['Örebro'])
    expect(filterItems(places, 'a', { locale: 'fi' })).not.toContain('Älmhult')
    expect(filterItems(['Örebro', 'Orsa'], 'ö', { locale: 'fi' })).toEqual(['Örebro'])
  })

  test('ignores accents in English', () => {
    expect(filterItems(places, 'a', { locale: 'en' })).toEqual([
      'Älmhult',
      'Alvesta',
      'Orsa',
      'Åre',
      'Arvika',
    ])
    expect(filterItems(['Café', 'Cafe', 'Cake'], 'cafe', { locale: 'en' })).toEqual([
      'Café',
      'Cafe',
    ])
  })

  test('a blank query returns every item, as a copy, in order', () => {
    const result = filterItems(places, '', { locale: 'sv' })
    expect(result).toEqual(places)
    expect(result).not.toBe(places)
  })

  test('uses itemToString for objects', () => {
    const municipalities = [
      { code: '0114', name: 'Upplands Väsby' },
      { code: '0115', name: 'Vallentuna' },
      { code: '0180', name: 'Stockholm' },
    ]
    expect(
      filterItems(municipalities, 'väs', {
        locale: 'sv',
        itemToString: (municipality) => municipality.name,
      }),
    ).toEqual([{ code: '0114', name: 'Upplands Väsby' }])
  })

  test('does not change the input', () => {
    const input = [...places]
    filterItems(input, 'ö', { locale: 'sv' })
    expect(input).toEqual(places)
  })
})
