import { describe, expect, it } from 'vite-plus/test'
import { contrastRatio, relativeLuminance } from './contrast.ts'

describe('contrastRatio', () => {
  it('is 21:1 for black on white, in either order', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
  })

  it('is 1:1 for identical colours', () => {
    expect(contrastRatio('#767676', '#767676')).toBe(1)
  })

  it('matches the known 4.54:1 of #767676 on white', () => {
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })

  it('rejects colour formats it cannot check', () => {
    expect(() => relativeLuminance('rebeccapurple')).toThrow(/Unsupported colour/)
  })
})
