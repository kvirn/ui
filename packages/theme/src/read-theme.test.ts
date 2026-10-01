import { describe, expect, it } from 'vite-plus/test'
import { parseCssRules, readRootProperties, themeEnvironment } from './read-theme.ts'

const css = `
/* A comment with { braces } and ; */
@layer kv {
  :root {
    --kv-white: #ffffff;
    --kv-black: #010102;
    --kv-color-canvas: var(--kv-white);
    --kv-color-text: var(--kv-black);
    --kv-font: 'Inter Variable', system-ui;
  }
  /* More specific, so it wins although it comes first. */
  :root[data-kv-color-scheme='dark'][data-kv-contrast='more'] {
    --kv-color-text: var(--kv-white);
  }
  :root[data-kv-color-scheme='dark'] {
    --kv-color-canvas: var(--kv-black);
    --kv-color-text: var(--kv-neutral-50, #f7f8f8);
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-kv-color-scheme]) {
      --kv-color-canvas: var(--kv-black);
    }
  }
  @media (width >= 64rem) {
    :root { --kv-color-canvas: red; }
  }
  [data-kv='button'] { color: var(--kv-color-text); }
  :root [data-kv='link'] { color: blue; }
}
`

describe('parseCssRules', () => {
  it('finds rules inside @layer and @media, without comments', () => {
    const rules = parseCssRules(css)
    expect(rules.map((rule) => rule.selectors.join(', '))).toEqual([
      ':root',
      ":root[data-kv-color-scheme='dark'][data-kv-contrast='more']",
      ":root[data-kv-color-scheme='dark']",
      ':root:not([data-kv-color-scheme])',
      ':root',
      "[data-kv='button']",
      ":root [data-kv='link']",
    ])
    expect(rules[3]?.media).toEqual(['(prefers-color-scheme: dark)'])
    expect(rules[0]?.declarations).toContainEqual(['--kv-font', "'Inter Variable', system-ui"])
  })

  it('resolves nested rules and nested @media to full selectors, in source order', () => {
    const rules = parseCssRules(`
@layer kv {
  :where([data-kv-prose]) :where(*) {
    &:where(p) { margin: 0; }
    :where(code) { content: '{;}'; }
    @media (forced-colors: active) {
      &:where(mark) { outline: 1px solid CanvasText; }
    }
  }
  :root { --kv-after: 1; }
}`)
    const parent = ':is(:where([data-kv-prose]) :where(*))'
    expect(rules).toEqual([
      { selectors: [`${parent}:where(p)`], media: [], declarations: [['margin', '0']] },
      { selectors: [`${parent} :where(code)`], media: [], declarations: [['content', "'{;}'"]] },
      {
        selectors: [`${parent}:where(mark)`],
        media: ['(forced-colors: active)'],
        declarations: [['outline', '1px solid CanvasText']],
      },
      { selectors: [':root'], media: [], declarations: [['--kv-after', '1']] },
    ])
  })
})

describe('readRootProperties', () => {
  it('resolves var() chains for the light theme', () => {
    const properties = readRootProperties(css, themeEnvironment('light'))
    expect(properties['--kv-color-canvas']).toBe('#ffffff')
    expect(properties['--kv-color-text']).toBe('#010102')
  })

  it('uses a var() fallback when the variable is not defined', () => {
    expect(readRootProperties(css, themeEnvironment('dark'))['--kv-color-text']).toBe('#f7f8f8')
  })

  it('lets specificity beat source order', () => {
    expect(readRootProperties(css, themeEnvironment('dark-contrast'))['--kv-color-text']).toBe(
      '#ffffff',
    )
  })

  it('applies a system fallback only without the attribute', () => {
    expect(readRootProperties(css, themeEnvironment('dark', 'system'))['--kv-color-canvas']).toBe(
      '#010102',
    )
    expect(readRootProperties(css, themeEnvironment('light', 'system'))['--kv-color-canvas']).toBe(
      '#ffffff',
    )
  })

  it('ignores range queries and rules for elements other than <html>', () => {
    const properties = readRootProperties(css, themeEnvironment('light'))
    expect(properties['--kv-color-canvas']).not.toBe('red')
    expect(properties['color']).toBeUndefined()
  })
})
