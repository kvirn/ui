import { describe, expect, it, vi } from 'vite-plus/test'
import { splitSentences } from './split-sentences.ts'

const swedish = 'Hej och välkommen! Hur mår du idag? Det är en fin dag. Vi ses snart…'
const finnish = 'Hyvää päivää! Mitä kuuluu? Tänään on kaunis päivä. Nähdään pian.'

describe('splitSentences', () => {
  it.each([swedish, finnish, '  Första.\nAndra raden utan punkt\n\nTredje!  '])(
    'gives offsets that slice back to the chunk text',
    (source) => {
      const chunks = splitSentences(source, { language: 'sv' })
      expect(chunks.length).toBeGreaterThan(1)
      for (const chunk of chunks) {
        expect(source.slice(chunk.start, chunk.end)).toBe(chunk.text)
        expect(chunk.text).toBe(chunk.text.trim())
      }
    },
  )

  it('splits Swedish sentences', () => {
    expect(splitSentences(swedish, { language: 'sv' }).map((chunk) => chunk.text)).toEqual([
      'Hej och välkommen!',
      'Hur mår du idag?',
      'Det är en fin dag.',
      'Vi ses snart…',
    ])
  })

  it('splits Finnish sentences', () => {
    expect(splitSentences(finnish, { language: 'fi' }).map((chunk) => chunk.text)).toEqual([
      'Hyvää päivää!',
      'Mitä kuuluu?',
      'Tänään on kaunis päivä.',
      'Nähdään pian.',
    ])
  })

  it('splits without Intl.Segmenter on . ! ? … and newlines, and keeps 3.5 whole', () => {
    vi.stubGlobal('Intl', { ...Intl, Segmenter: undefined })
    try {
      const source = 'Det kostar 3.5 kr. Är det dyrt? Nej!\nRad två utan punkt'
      const chunks = splitSentences(source, { language: 'sv' })
      expect(chunks.map((chunk) => chunk.text)).toEqual([
        'Det kostar 3.5 kr.',
        'Är det dyrt?',
        'Nej!',
        'Rad två utan punkt',
      ])
      for (const chunk of chunks) {
        expect(source.slice(chunk.start, chunk.end)).toBe(chunk.text)
      }
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('splits a long sentence on a comma before it splits on a word', () => {
    const source = 'aaaa bbbb cccc, dddd eeee ffff gggg'
    expect(splitSentences(source, { language: 'en', maxLength: 20 }).map((c) => c.text)).toEqual([
      'aaaa bbbb cccc,',
      'dddd eeee ffff gggg',
    ])
  })

  it('splits long text without punctuation by maxLength and loses no characters', () => {
    const source = Array.from({ length: 120 }, (_, index) => `ord${index}`).join(' ')
    const chunks = splitSentences(source, { language: 'sv', maxLength: 50 })
    expect(chunks.length).toBeGreaterThan(5)
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(50)
      expect(source.slice(chunk.start, chunk.end)).toBe(chunk.text)
    }
    expect(chunks.map((chunk) => chunk.text).join(' ')).toBe(source)
  })

  it('never cuts mid-word when a word fits', () => {
    const source = 'abcdefghij klmnopqrst uvwxyz abcdefghij'
    const words = new Set(source.split(' '))
    for (const chunk of splitSentences(source, { language: 'en', maxLength: 15 })) {
      for (const word of chunk.text.split(' ')) {
        expect(words.has(word)).toBe(true)
      }
    }
  })

  it('cuts a single word longer than maxLength and still loses nothing', () => {
    const source = 'x'.repeat(95)
    const chunks = splitSentences(source, { language: 'en', maxLength: 40 })
    expect(chunks.map((chunk) => chunk.text).join('')).toBe(source)
    expect(chunks.every((chunk) => chunk.text.length <= 40)).toBe(true)
  })

  it.each(['', '   ', '\n\t '])('returns no chunks for empty or blank input', (source) => {
    expect(splitSentences(source, { language: 'sv' })).toEqual([])
  })

  it('falls back to default rules for an invalid language tag', () => {
    expect(splitSentences('Ett. Två.', { language: 'not a tag' })).toHaveLength(2)
  })

  it('splits at language run edges and gives each chunk its language', () => {
    const source = 'Hej där. Hello there my friend. Hej igen.'
    const chunks = splitSentences(source, {
      language: 'sv',
      languageRuns: [{ start: 9, end: 31, language: 'en' }],
    })
    expect(chunks.map((chunk) => [chunk.text, chunk.language])).toEqual([
      ['Hej där.', undefined],
      ['Hello there my friend.', 'en'],
      ['Hej igen.', undefined],
    ])
  })

  it('splits a sentence in the middle where a language run starts and ends', () => {
    const source = 'Jag sa hello world och gick.'
    const chunks = splitSentences(source, {
      language: 'sv',
      languageRuns: [{ start: 7, end: 18, language: 'en' }],
    })
    expect(chunks.map((chunk) => [chunk.text, chunk.language])).toEqual([
      ['Jag sa', undefined],
      ['hello world', 'en'],
      ['och gick.', undefined],
    ])
    for (const chunk of chunks) {
      expect(source.slice(chunk.start, chunk.end)).toBe(chunk.text)
    }
  })
})
