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

describe('toAriaKeyShortcuts', () => {
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
