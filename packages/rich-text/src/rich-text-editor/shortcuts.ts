/** One shortcut, ready for `aria-keyshortcuts` and for the tooltip. */
export interface DescribedShortcut {
  /** For `aria-keyshortcuts`: `Control+B`, or `Meta+B` on macOS. Alternatives are space-separated. */
  ariaKeyShortcuts: string
  /** The preferred chord as separate keys for a tooltip: `['Ctrl', 'B']`, or `['⌘', 'B']` on macOS. */
  keys: readonly string[]
  /** The preferred chord as text, for an announcement: `Ctrl+B`, or `⌘B` on macOS. */
  text: string
}

/** Whether the page runs on an Apple platform: `Mod` is Command there, and Control elsewhere. */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform
  return /mac|iphone|ipad|ipod/i.test(platform)
}

const ariaModifier = (isMac: boolean) => ({
  Mod: isMac ? 'Meta' : 'Control',
  Ctrl: 'Control',
  Shift: 'Shift',
  Alt: 'Alt',
})
const displayModifier = (isMac: boolean) => ({
  Mod: isMac ? '⌘' : 'Ctrl',
  Ctrl: isMac ? '⌃' : 'Ctrl',
  Shift: isMac ? '⇧' : 'Shift',
  Alt: isMac ? '⌥' : 'Alt',
})

/**
 * Describes shortcuts written as Tiptap writes them (`Mod-b`, `Mod-Shift-z`, `Ctrl-y`): `Mod` is
 * Command on macOS and Control elsewhere. The first chord is the one shown. A chord that starts with
 * `Ctrl-` is a Windows and Linux alternative, and is left out on macOS, where Control is another key.
 * Key names in shortcuts are not translated (they are what is printed on the keys).
 */
export function describeShortcut(chords: readonly string[], isMac: boolean): DescribedShortcut {
  const aria = ariaModifier(isMac)
  const display = displayModifier(isMac)
  const usable = chords.filter((chord) => !(isMac && chord.startsWith('Ctrl-')))
  const toKeys = (chord: string, names: Record<string, string>) =>
    chord
      .split('-')
      .map((part, index, parts) =>
        index === parts.length - 1 ? part.toUpperCase() : (names[part] ?? part),
      )
  const first = usable[0] ?? chords[0] ?? ''
  const keys = toKeys(first, display)
  return {
    ariaKeyShortcuts: usable.map((chord) => toKeys(chord, aria).join('+')).join(' '),
    keys,
    text: isMac ? keys.join('') : keys.join('+'),
  }
}
