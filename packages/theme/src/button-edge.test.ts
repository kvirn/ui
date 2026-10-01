import { describe, expect, it } from 'vite-plus/test'
import {
  buttonEdgeBases,
  buttonEdgePairsPerTheme,
  checkButtonEdges,
  mixButtonEdge,
  parseButtonEdgeTint,
} from './button-edge.ts'

describe('parseButtonEdgeTint', () => {
  it('reads a hex colour and a percentage', () => {
    expect(parseButtonEdgeTint('#0f1011 35%')).toEqual({ color: '#0f1011', percent: 35 })
    expect(parseButtonEdgeTint('#fff 0%')).toEqual({ color: '#fff', percent: 0 })
    expect(parseButtonEdgeTint('#ffffff 12.5%')).toEqual({ color: '#ffffff', percent: 12.5 })
  })

  it.each([
    undefined,
    '',
    '#0f1011',
    '35%',
    'black 35%',
    'var(--kv-neutral-950) 35%',
    '#0f1011 35',
    '#0f1011 135%',
    '#0f1011 -5%',
    'rgb(0 0 0) 35%',
  ])('rejects %j', (value) => {
    expect(parseButtonEdgeTint(value)).toBeUndefined()
  })
})

describe('mixButtonEdge', () => {
  it('mixes per channel in sRGB, rounded, like color-mix(in srgb, base, partner N%)', () => {
    expect(mixButtonEdge('#000000', { color: '#ffffff', percent: 50 })).toBe('#808080')
    expect(mixButtonEdge('#ff0000', { color: '#0000ff', percent: 25 })).toBe('#bf0040')
  })

  it('returns the base unchanged at 0%, and the partner at 100%', () => {
    expect(mixButtonEdge('#6f737b', { color: '#0f1011', percent: 0 })).toBe('#6f737b')
    expect(mixButtonEdge('#6f737b', { color: '#0f1011', percent: 100 })).toBe('#0f1011')
  })

  it('reads three-digit colours', () => {
    expect(mixButtonEdge('#fff', { color: '#000', percent: 50 })).toBe('#808080')
  })
})

describe('checkButtonEdges', () => {
  const colors = {
    canvas: '#ffffff',
    surface: '#f7f8f8',
    'surface-raised': '#ffffff',
    secondary: '#6f737b',
    primary: '#5e6ad2',
    danger: '#c53d4f',
    'danger-hover': '#a32b3c',
  }
  const shade = { color: '#0f1011', percent: 35 }
  const highlight = { color: '#ffffff', percent: 0 }

  it('measures every base, tinted by both partners, on every plain background', () => {
    expect(buttonEdgeBases).toEqual(['secondary', 'primary', 'danger', 'danger-hover'])
    expect(buttonEdgePairsPerTheme).toBe(24)
  })

  it('passes tints that only raise the boundary', () => {
    expect(checkButtonEdges('light', colors, shade, highlight)).toEqual([])
  })

  it('reports a tint that lowers a boundary under 3:1, with the mixed colour', () => {
    const problems = checkButtonEdges('light', colors, { color: '#ffffff', percent: 90 }, highlight)
    expect(problems.length).toBeGreaterThan(0)
    expect(problems).toContainEqual(
      expect.stringMatching(
        /^light: secondary edge mixed with the shade \(#[\da-f]{6}\) on canvas is \d\.\d\d:1, needs 3:1$/,
      ),
    )
  })

  it('reports a missing colour token instead of skipping it', () => {
    const { primary: _primary, ...withoutPrimary } = colors
    expect(checkButtonEdges('dark', withoutPrimary, shade, highlight)).toContain(
      'dark: unknown token "primary"',
    )
  })
})
