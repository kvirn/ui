import { describe, expect, test } from 'vite-plus/test'
import { matchShortcut, shortcutKeys, toAriaKeyShortcuts } from './shortcut.ts'
import type { Shortcut, ShortcutKeyEvent } from './shortcut.ts'

const altShiftS: Shortcut = { key: 's', alt: true, shift: true }

function keydown(overrides: Partial<ShortcutKeyEvent> = {}): ShortcutKeyEvent {
  return {
    key: 'S',
    code: 'KeyS',
    altKey: true,
    shiftKey: true,
    ctrlKey: false,
    metaKey: false,
    altGraph: false,
    editable: false,
    ...overrides,
  }
}

describe('matchShortcut', () => {
  test('matches the chord, ignoring the case of a letter', () => {
    expect(matchShortcut(keydown(), altShiftS)).toBe(true)
    expect(matchShortcut(keydown({ key: 's' }), { ...altShiftS, key: 'S' })).toBe(true)
  })

  test('matches a letter by its physical key when Alt rewrites the character', () => {
    expect(matchShortcut(keydown({ key: 'Í', code: 'KeyS' }), altShiftS)).toBe(true)
  })

  test('does not match the physical key when the layout puts another letter there', () => {
    expect(matchShortcut(keydown({ key: 'o', code: 'KeyS' }), altShiftS)).toBe(false)
  })

  test('matches the physical key when Option rewrote the character', () => {
    expect(matchShortcut(keydown({ key: 'ß', code: 'KeyS' }), altShiftS)).toBe(true) // kv-lang-ok: the macOS Option+S character
  })

  test('does not match another key', () => {
    expect(matchShortcut(keydown({ key: 'D', code: 'KeyD' }), altShiftS)).toBe(false)
  })

  test('does not match when a modifier is missing or extra', () => {
    expect(matchShortcut(keydown({ shiftKey: false }), altShiftS)).toBe(false)
    expect(matchShortcut(keydown({ altKey: false }), altShiftS)).toBe(false)
    expect(matchShortcut(keydown({ ctrlKey: true }), altShiftS)).toBe(false)
    expect(matchShortcut(keydown({ metaKey: true }), altShiftS)).toBe(false)
  })

  test('matches Ctrl or Meta when the chord asks for them', () => {
    expect(matchShortcut(keydown({ ctrlKey: true }), { ...altShiftS, ctrl: true })).toBe(true)
    expect(matchShortcut(keydown({ metaKey: true }), { ...altShiftS, meta: true })).toBe(true)
  })

  test('rejects an editable target', () => {
    expect(matchShortcut(keydown({ editable: true }), altShiftS)).toBe(false)
  })

  test('rejects AltGraph', () => {
    expect(matchShortcut(keydown({ altGraph: true, ctrlKey: true }), altShiftS)).toBe(false)
    expect(
      matchShortcut(keydown({ altGraph: true, ctrlKey: true }), { ...altShiftS, ctrl: true }),
    ).toBe(false)
  })

  test('matches a named key by its name', () => {
    expect(
      matchShortcut(keydown({ key: 'F2', code: 'F2', altKey: false, shiftKey: false }), {
        key: 'F2',
      }),
    ).toBe(true)
  })

  test('matches a digit by its physical key when Alt rewrites the character', () => {
    expect(
      matchShortcut(keydown({ key: '¡', code: 'Digit1' }), { key: '1', alt: true, shift: true }),
    ).toBe(true)
  })
})

describe('matchShortcut with mod', () => {
  const modK: Shortcut = { key: 'k', mod: true }
  const press = (overrides: Partial<ShortcutKeyEvent>) =>
    keydown({ key: 'k', code: 'KeyK', altKey: false, shiftKey: false, ...overrides })

  test('mod is Command on Apple platforms', () => {
    expect(matchShortcut(press({ metaKey: true }), modK, { apple: true })).toBe(true)
  })

  test('mod is Ctrl outside Apple platforms', () => {
    expect(matchShortcut(press({ ctrlKey: true }), modK, { apple: false })).toBe(true)
  })

  test('mod is Ctrl when no platform is given', () => {
    expect(matchShortcut(press({ ctrlKey: true }), modK)).toBe(true)
  })

  test('mod does not match the other platform’s modifier', () => {
    expect(matchShortcut(press({ ctrlKey: true }), modK, { apple: true })).toBe(false)
    expect(matchShortcut(press({ metaKey: true }), modK, { apple: false })).toBe(false)
  })

  test('mod matches the physical key on a non-Latin layout', () => {
    const cyrillic = press({ key: 'л', code: 'KeyK', ctrlKey: true }) // kv-lang-ok: the Cyrillic layout character
    expect(matchShortcut(cyrillic, modK, { apple: false })).toBe(true)
  })

  test('mod does not match the physical key when a Latin layout puts another letter there', () => {
    const dvorak = press({ key: 'v', code: 'KeyK', ctrlKey: true })
    expect(matchShortcut(dvorak, modK, { apple: false })).toBe(false)
  })

  test('mod does not match with both modifiers, Alt or Shift', () => {
    for (const apple of [true, false]) {
      const both = press({ ctrlKey: true, metaKey: true })
      expect(matchShortcut(both, modK, { apple })).toBe(false)
      const modifier = apple ? { metaKey: true } : { ctrlKey: true }
      expect(matchShortcut(press({ ...modifier, altKey: true }), modK, { apple })).toBe(false)
      expect(matchShortcut(press({ ...modifier, shiftKey: true }), modK, { apple })).toBe(false)
    }
  })
})

describe('toAriaKeyShortcuts', () => {
  test('writes a mod chord as Meta+K on Apple platforms and Control+K elsewhere', () => {
    expect(toAriaKeyShortcuts({ key: 'k', mod: true }, { apple: true })).toBe('Meta+K')
    expect(toAriaKeyShortcuts({ key: 'k', mod: true }, { apple: false })).toBe('Control+K')
  })

  test('writes Alt+Shift+S', () => {
    expect(toAriaKeyShortcuts(altShiftS)).toBe('Alt+Shift+S')
  })

  test('orders Control, Alt, Shift, Meta and then the key', () => {
    expect(toAriaKeyShortcuts({ key: 'k', meta: true, shift: true, alt: true, ctrl: true })).toBe(
      'Control+Alt+Shift+Meta+K',
    )
  })

  test('keeps a named key as written', () => {
    expect(toAriaKeyShortcuts({ key: 'F2' })).toBe('F2')
  })
})

describe('shortcutKeys', () => {
  test('names a mod chord Command on Apple platforms and Ctrl elsewhere', () => {
    expect(shortcutKeys({ key: 'k', mod: true }, { apple: true })).toEqual([
      { type: 'modifier', name: 'command' },
      { type: 'key', label: 'K' },
    ])
    expect(shortcutKeys({ key: 'k', mod: true }, { apple: false })).toEqual([
      { type: 'modifier', name: 'control' },
      { type: 'key', label: 'K' },
    ])
  })

  const full: Shortcut = { key: 'k', meta: true, shift: true, alt: true, ctrl: true }

  test('orders the key caps Ctrl, Alt, Shift, Meta, key outside Apple platforms', () => {
    expect(shortcutKeys(full, { apple: false })).toEqual([
      { type: 'modifier', name: 'control' },
      { type: 'modifier', name: 'alt' },
      { type: 'modifier', name: 'shift' },
      { type: 'modifier', name: 'meta' },
      { type: 'key', label: 'K' },
    ])
  })

  test('names Meta Command on Apple platforms', () => {
    expect(shortcutKeys({ key: 'k', meta: true }, { apple: true })).toEqual([
      { type: 'modifier', name: 'command' },
      { type: 'key', label: 'K' },
    ])
  })

  test('names Alt Option on Apple platforms', () => {
    expect(shortcutKeys(altShiftS, { apple: true })).toEqual([
      { type: 'modifier', name: 'option' },
      { type: 'modifier', name: 'shift' },
      { type: 'key', label: 'S' },
    ])
  })
})
