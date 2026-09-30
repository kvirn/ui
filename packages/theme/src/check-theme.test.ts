import { describe, expect, it } from 'vite-plus/test'
import { checkTheme } from './check-theme.ts'

const tokens = { text: '#1a1a1a', faintText: '#999999', background: '#ffffff' }

describe('checkTheme', () => {
  it('passes pairs that meet their minimum', () => {
    expect(
      checkTheme('light', tokens, [{ foreground: 'text', background: 'background', minimum: 7 }]),
    ).toEqual([])
  })

  it('reports pairs below their minimum with the actual ratio', () => {
    expect(
      checkTheme('light', tokens, [
        { foreground: 'faintText', background: 'background', minimum: 4.5 },
      ]),
    ).toEqual(['light: faintText on background is 2.85:1, needs 4.5:1'])
  })

  it('reports unknown tokens instead of skipping them', () => {
    expect(
      checkTheme('dark', tokens, [{ foreground: 'accent', background: 'background', minimum: 3 }]),
    ).toEqual(['dark: unknown token "accent"'])
  })
})
