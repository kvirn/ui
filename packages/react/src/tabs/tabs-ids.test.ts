import { describe, expect, test } from 'vite-plus/test'
import { escapeTabValue, getPanelId, getTabId } from './tabs-ids.ts'

// The ids that tie a tab to its panel (aria-controls and aria-labelledby, 4.1.2). Contract:
// tabs.a11y.md, Roles, states, properties.

describe('escapeTabValue', () => {
  test('keeps letters, digits and hyphens as they are', () => {
    expect(escapeTabValue('uppgifter')).toBe('uppgifter')
    expect(escapeTabValue('steg-2')).toBe('steg-2')
    expect(escapeTabValue('')).toBe('')
  })

  test('escapes a space, so an IDREF never holds one', () => {
    expect(escapeTabValue('Bygga och bo')).toBe('Bygga_20_och_20_bo')
  })

  test('escapes punctuation by its hex code point', () => {
    expect(escapeTabValue("a:b'c")).toBe('a_3a_b_27_c')
    expect(escapeTabValue('a.b#c')).toBe('a_2e_b_23_c')
  })

  test('escapes letters outside ASCII, and characters outside the basic plane as one code point', () => {
    expect(escapeTabValue('Åre')).toBe('_c5_re')
    expect(escapeTabValue('😀')).toBe('_1f600_')
  })

  test('escapes the underscore too, so two different values never give one id', () => {
    expect(escapeTabValue('a_b')).toBe('a_5f_b')
    expect(escapeTabValue('a_20_b')).not.toBe(escapeTabValue('a b'))
    expect(escapeTabValue('a_5f_b')).not.toBe(escapeTabValue('a_b'))
  })

  test('only gives characters that are safe in an id', () => {
    for (const value of ['Bygga och bo', "a:b'c", 'a b\tc\nd', 'Åre 😀', '_', '<>&"']) {
      expect(escapeTabValue(value)).toMatch(/^[A-Za-z0-9_-]*$/)
    }
  })

  test('gives a different id for every different value', () => {
    const values = [
      'a',
      'A',
      'a b',
      'a_b',
      'a-b',
      'a_20_b',
      'a b ',
      ' a b',
      'a:b',
      'a_3a_b',
      'å',
      '',
    ]
    const escaped = values.map((value) => escapeTabValue(value))
    expect(new Set(escaped).size).toBe(values.length)
  })
})

describe('getTabId and getPanelId', () => {
  test('join the root id, the part and the escaped value', () => {
    expect(getTabId('root', 'Bygga och bo')).toBe('root-tab-Bygga_20_och_20_bo')
    expect(getPanelId('root', 'Bygga och bo')).toBe('root-panel-Bygga_20_och_20_bo')
  })

  test('a tab and its panel never share an id, and one value always gives the same ids', () => {
    expect(getTabId('root', 'a')).not.toBe(getPanelId('root', 'a'))
    expect(getTabId('root', 'a')).toBe(getTabId('root', 'a'))
    expect(getPanelId('root', 'a')).toBe(getPanelId('root', 'a'))
  })

  test('two roots never share an id for the same value', () => {
    expect(getTabId('first', 'a')).not.toBe(getTabId('second', 'a'))
    expect(getPanelId('first', 'a')).not.toBe(getPanelId('second', 'a'))
  })
})
