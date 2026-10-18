/** A chord the page offers: `{ key: 's', alt: true, shift: true }` is Alt+Shift+S. */
export interface Shortcut {
  /** One character (`s`, `1`) or a `KeyboardEvent.key` name (`Enter`, `F2`). Letters ignore case. */
  key: string
  alt?: boolean | undefined
  shift?: boolean | undefined
  ctrl?: boolean | undefined
  meta?: boolean | undefined
  /** Command on Apple platforms, Ctrl elsewhere. The other platform's modifier does not match. */
  mod?: boolean | undefined
}

/** The parts of a `keydown` that matching reads, as a plain object. */
export interface ShortcutKeyEvent {
  key: string
  code: string
  altKey: boolean
  shiftKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  /** `getModifierState('AltGraph')`: AltGr types characters on many layouts (Nordic `@`, `{`). */
  altGraph: boolean
  /** The target takes text: a text field, a textarea, a select or an editable region. */
  editable: boolean
}

export type ShortcutModifierName = 'control' | 'alt' | 'option' | 'shift' | 'command' | 'meta'

/** One key cap: a modifier (a message key of the `keys` namespace) or the chord's own key. */
export type ShortcutKey =
  | { type: 'modifier'; name: ShortcutModifierName }
  | { type: 'key'; label: string }

export interface ShortcutKeysOptions {
  /** macOS and iOS name Alt `option` and Meta `command`; elsewhere Meta is `meta`, and put Ctrl first. */
  apple: boolean
}

const nonApple: ShortcutKeysOptions = { apple: false }

const isSingleCharacter = (key: string) => key.length === 1

// macOS Option rewrites `key` (Option+S types ß), so a chord with Alt matches the physical key.
function codeOf(key: string): string | undefined {
  if (/^[a-z]$/i.test(key)) {
    return `Key${key.toUpperCase()}`
  }
  return /^[0-9]$/.test(key) ? `Digit${key}` : undefined
}

/**
 * Whether a keydown is the chord. The modifiers must match exactly, so Alt+Shift+S never fires
 * on Ctrl+Alt+Shift+S, and an editable target or AltGr (a typed character) is never a chord.
 */
export function matchShortcut(
  event: ShortcutKeyEvent,
  shortcut: Shortcut,
  { apple }: ShortcutKeysOptions = nonApple,
): boolean {
  if (event.editable || event.altGraph) {
    return false
  }
  const mod = shortcut.mod === true
  if (
    event.altKey !== (shortcut.alt === true) ||
    event.shiftKey !== (shortcut.shift === true) ||
    event.ctrlKey !== (shortcut.ctrl === true || (mod && !apple)) ||
    event.metaKey !== (shortcut.meta === true || (mod && apple))
  ) {
    return false
  }
  if (event.key.toLowerCase() === shortcut.key.toLowerCase()) {
    return true
  }
  // Only when Option rewrote the character, or a non-Latin layout (Cyrillic, Greek) types a letter
  // that is not ASCII under Ctrl or Command: on Dvorak the key is still a Latin letter, and it wins.
  return (event.altKey || mod) && !/^[a-z]$/i.test(event.key) && event.code === codeOf(shortcut.key)
}

/** The `aria-keyshortcuts` value: `Alt+Shift+S`. A `mod` chord is `Meta+K` on Apple, `Control+K` elsewhere. */
export function toAriaKeyShortcuts(
  shortcut: Shortcut,
  { apple }: ShortcutKeysOptions = nonApple,
): string {
  const mod = shortcut.mod === true
  const parts: string[] = []
  if (shortcut.ctrl === true || (mod && !apple)) parts.push('Control')
  if (shortcut.alt === true) parts.push('Alt')
  if (shortcut.shift === true) parts.push('Shift')
  if (shortcut.meta === true || (mod && apple)) parts.push('Meta')
  parts.push(isSingleCharacter(shortcut.key) ? shortcut.key.toUpperCase() : shortcut.key)
  return parts.join('+')
}

/** The key caps in reading order: Ctrl, Alt (Option), Shift, Meta (Command), then the key. */
export function shortcutKeys(
  shortcut: Shortcut,
  { apple }: ShortcutKeysOptions,
): readonly ShortcutKey[] {
  const mod = shortcut.mod === true
  const keys: ShortcutKey[] = []
  if (shortcut.ctrl === true || (mod && !apple)) keys.push({ type: 'modifier', name: 'control' })
  if (shortcut.alt === true) keys.push({ type: 'modifier', name: apple ? 'option' : 'alt' })
  if (shortcut.shift === true) keys.push({ type: 'modifier', name: 'shift' })
  if (shortcut.meta === true || (mod && apple))
    keys.push({ type: 'modifier', name: apple ? 'command' : 'meta' })
  keys.push({
    type: 'key',
    label: isSingleCharacter(shortcut.key) ? shortcut.key.toUpperCase() : shortcut.key,
  })
  return keys
}
