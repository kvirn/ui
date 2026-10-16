import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vite-plus/test'
import { findGaps } from '../scripts/check-gaps.mjs'

const icon = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`

const joinedLegs = (spacing: number) =>
  icon(`<path d="M6 6h${spacing}M6 6v12M${6 + spacing} 6v12"/><path d="M6 18h${spacing}"/>`)

describe('findGaps', () => {
  it('reports strokes 2.5 apart that are joined at one end and passes strokes 3.5 apart', () => {
    const narrow = findGaps('narrow.svg', joinedLegs(2.5))
    expect(narrow.length).toBeGreaterThan(0)
    expect(narrow[0]?.distance).toBeCloseTo(2.5, 1)
    expect(findGaps('wide.svg', joinedLegs(3.5))).toEqual([])
  })

  it('passes a stroke ending 0.5 from another and reports one ending 1.5 away', () => {
    const across = (gap: number) => icon(`<path d="M4 12h16"/><path d="M12 ${12 - gap}v-8"/>`)
    expect(findGaps('joined.svg', across(0.5))).toEqual([])
    expect(findGaps('apart.svg', across(1.5)).length).toBeGreaterThan(0)
  })

  it('passes strokes near a join that leaves at 45 degrees and reports one that leaves at 37', () => {
    const head = (tail: string) => icon(`<path d="M14.5 9.5h7"/><path d="M16 6.5h1${tail}"/>`)
    expect(findGaps('diverging.svg', head('l2.5 2.5'))).toEqual([])
    expect(findGaps('shallow.svg', head('l4 3')).length).toBeGreaterThan(0)
  })

  it('allows a listed pair only for its icon, its strokes and its distance', () => {
    const slot = (gap: number) => icon(`<path d="M10 8.5h4M14 ${8.5 + gap}h-4"/>`)
    expect(findGaps('train.svg', slot(3))).toEqual([])
    expect(findGaps('ferry.svg', slot(3)).length).toBeGreaterThan(0)
    expect(findGaps('train.svg', slot(2.5)).length).toBeGreaterThan(0)
  })

  it('allows the 3.0 to 3.5 centre-line gap of the five listed icons and no other pair in them', () => {
    const slot = icon('<path d="M10 8.5h4M14 11.5h-4"/>')
    for (const name of ['ambulance', 'signature', 'warning', 'quick-exit', 'bike']) {
      const drawn = readFileSync(new URL(`../svg/${name}.svg`, import.meta.url), 'utf8')
      expect(findGaps(`${name}.svg`, drawn)).toEqual([])
      expect(findGaps(`${name}.svg`, slot).length).toBeGreaterThan(0)
    }
  })
})
