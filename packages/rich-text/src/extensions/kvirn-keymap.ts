import { Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import type { ResolvedPos } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/** The marks the formatting shortcuts toggle and announce. */
export type FormatShortcutName = 'bold' | 'italic' | 'underline'

export interface KvirnKeymapOptions {
  /**
   * Whether typing rules such as `# ` (a heading), `* ` (a list) and `**x**` (bold) are on.
   * Default `false`: they change the text without telling a screen reader user. This sets the
   * editor's `enableInputRules`.
   */
  inputRules: boolean
}

/**
 * What the editor's owner (the `Root`) hooks into. Set on `editor.storage.kvirnKeymap` after the
 * editor is created, so the extension list stays plain data.
 */
export interface KvirnKeymapStorage {
  /**
   * Alt+F10 (Option+F10 on macOS): move focus to the toolbar. Return `false` when there is no
   * toolbar to go to, so the key passes through.
   */
  onFocusToolbar: (() => boolean | void) | undefined
  /** Mod-k: open the link form. Return `false` to let the key pass through. */
  onOpenLinkForm: (() => boolean | void) | undefined
  /** After Mod-b, Mod-i or Mod-u: which format, and whether it is now on. */
  onFormatToggle: ((format: FormatShortcutName, isOn: boolean) => void) | undefined
  /** After Tab or Shift+Tab indented or outdented a list item: the item's new level, from 1. */
  onListLevelChange: ((level: number) => void) | undefined
  /** Escape was pressed in the text and consumed; the next Escape passes on. */
  isEscapeConsumed: boolean
}

declare module '@tiptap/core' {
  interface Storage {
    kvirnKeymap: KvirnKeymapStorage
  }
}

const modifierKeys = new Set(['Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock'])

/** The marks with a Kvirn shortcut, and the shortcut keys that toggle them. */
const formatShortcuts: ReadonlyArray<{ name: FormatShortcutName; keys: readonly string[] }> = [
  { name: 'bold', keys: ['Mod-b', 'Mod-B'] },
  { name: 'italic', keys: ['Mod-i', 'Mod-I'] },
  { name: 'underline', keys: ['Mod-u', 'Mod-U'] },
]

/**
 * Whether a key event is a chord the editor never treats as a shortcut (design spec §6.6.6).
 *
 * - **Control+Alt (and Command+Option) with any key.** On Windows, Control+Alt is AltGr, which
 *   Swedish, Finnish and Norwegian layouts use for `@ £ $ € { [ ] } \`. Tiptap binds
 *   Control+Alt+1 to 6 (headings) and Control+Alt+C (code block), and ProseMirror matches a key
 *   such as `@` by its key code (`2`), so AltGr+2 would make a heading instead of an `@`.
 * - **Mod+Shift+S, Mod+E, Mod+Shift+B, Mod+Shift+7 and Mod+Shift+8.** Strikethrough, code,
 *   quote and the two lists. They clash with browser keys (Firefox's screenshot, Chrome's search,
 *   the bookmarks bar) and with `/` on Nordic keyboards, and each has a toolbar button.
 */
export function isNeverShortcut(event: KeyboardEvent): boolean {
  const hasMod = event.ctrlKey || event.metaKey
  if (!hasMod) {
    return false
  }
  if (event.altKey) {
    return true
  }
  const key = event.key.toLowerCase()
  if (event.shiftKey) {
    return key === 's' || key === 'b' || event.code === 'Digit7' || event.code === 'Digit8'
  }
  return key === 'e'
}

/** Whether a callback exists and didn't answer `false`: `false` lets the key pass through. */
function wasHandled(handler: (() => boolean | void) | undefined): boolean {
  return handler !== undefined && handler() !== false
}

function findListItemDepth($position: ResolvedPos): number | undefined {
  for (let depth = $position.depth; depth > 0; depth -= 1) {
    if ($position.node(depth).type.name === 'listItem') {
      return depth
    }
  }
  return undefined
}

/** The list depth at a position: how many list items it is inside (1 for a top-level item). */
function getListLevel($position: ResolvedPos): number {
  let level = 0
  for (let depth = $position.depth; depth > 0; depth -= 1) {
    if ($position.node(depth).type.name === 'listItem') {
      level += 1
    }
  }
  return level
}

function isInTableCell($position: ResolvedPos): boolean {
  for (let depth = $position.depth; depth > 0; depth -= 1) {
    const role: unknown = $position.node(depth).type.spec['tableRole']
    if (role === 'cell' || role === 'header_cell') {
      return true
    }
  }
  return false
}

/** Whether the caret's list item is nested inside another list item. */
function isNestedListItem($position: ResolvedPos): boolean {
  const depth = findListItemDepth($position)
  return depth !== undefined && depth >= 2 && $position.node(depth - 2).type.name === 'listItem'
}

/** Whether the caret is in a list item that has an item above it at its level: it can be nested. */
export function canIndentListItem(editor: Editor): boolean {
  return (
    findListItemDepth(editor.state.selection.$from) !== undefined &&
    editor.can().sinkListItem('listItem')
  )
}

/** Whether the caret is in a nested list item: it can be moved out one level. */
export function canOutdentListItem(editor: Editor): boolean {
  return isNestedListItem(editor.state.selection.$from) && editor.can().liftListItem('listItem')
}

/**
 * Nests the caret's list item under the one above it, as Tab does. Returns the item's new level
 * (from 1), or `undefined` when it can't be nested.
 */
export function indentListItem(editor: Editor): number | undefined {
  return editor.commands.sinkListItem('listItem')
    ? getListLevel(editor.state.selection.$from)
    : undefined
}

/**
 * Moves a nested list item out one level, as Shift+Tab does. It never lifts a top-level item out
 * of its list. Returns the item's new level, or `undefined` when it can't move.
 */
export function outdentListItem(editor: Editor): number | undefined {
  if (!isNestedListItem(editor.state.selection.$from)) {
    return undefined
  }
  return editor.commands.liftListItem('listItem')
    ? getListLevel(editor.state.selection.$from)
    : undefined
}

/**
 * What Tab or Shift+Tab does in the text (design spec §6.6.6): indent or outdent a list item, or
 * move to the next or previous table cell, and only where that is possible. Otherwise `'leave'`:
 * the browser moves focus as it does everywhere else.
 */
function runTab(editor: Editor, storage: KvirnKeymapStorage, isShift: boolean): 'acted' | 'leave' {
  const { $from } = editor.state.selection
  if (findListItemDepth($from) !== undefined) {
    // A list item acts when it can be nested (Tab) or is nested (Shift+Tab). A top-level item
    // is never lifted out of its list by Shift+Tab: that is the list button's job.
    const level = isShift ? outdentListItem(editor) : indentListItem(editor)
    if (level !== undefined) {
      storage.onListLevelChange?.(level)
      return 'acted'
    }
  }
  if (isInTableCell($from)) {
    // Tiptap's own Tab in the last cell adds a row. Here it leaves: a row is a button's job.
    const hasMoved = isShift ? editor.commands.goToPreviousCell() : editor.commands.goToNextCell()
    if (hasMoved) {
      return 'acted'
    }
  }
  return 'leave'
}

/**
 * The Kvirn keymap (design spec §6.6.6, Plan 0036). It is the one place the editor decides what
 * keys do, so a keyboard user is never trapped and AltGr always types.
 *
 * - **Tab and Shift+Tab** indent or outdent a list item, or move between table cells, only where
 *   that is possible. Elsewhere they leave the editor, and Tab in a table's last cell never adds
 *   a row. Every other Tab binding in Tiptap is skipped, so none acts behind this one.
 * - **Escape** in the text is consumed once, so a Dialog around the editor doesn't close and lose
 *   the text, and the next Escape passes on. Any other key, a click or leaving the text starts
 *   over. It is not a way out: Tab leaves on its own, where it doesn't act (Plan 0045). While an IME composition is open, Escape belongs to the IME.
 * - **Alt+F10** (Option+F10) goes to the toolbar, **Mod-k** opens the link form, and **Mod-b,
 *   Mod-i and Mod-u** toggle a mark and report it, so it can be announced.
 * - **Never shortcuts:** Control+Alt chords (AltGr) and the Tiptap shortcuts that clash with
 *   browsers: see `isNeverShortcut`.
 * - Typing rules are off unless `inputRules` is set.
 */
export const KvirnKeymap = Extension.create<KvirnKeymapOptions, KvirnKeymapStorage>({
  name: 'kvirnKeymap',
  // Ahead of every other extension's keys and DOM handlers.
  priority: 1000,

  addOptions() {
    return { inputRules: false }
  },

  addStorage() {
    return {
      onFocusToolbar: undefined,
      onOpenLinkForm: undefined,
      onFormatToggle: undefined,
      onListLevelChange: undefined,
      isEscapeConsumed: false,
    }
  },

  onBeforeCreate() {
    // The editor builds its typing rules from this, after this hook and before its view.
    this.editor.options.enableInputRules = this.options.inputRules
  },

  addKeyboardShortcuts() {
    const storage = this.storage
    const shortcuts: Record<string, (props: { editor: Editor }) => boolean> = {
      'Alt-F10': () => wasHandled(storage.onFocusToolbar),
      'Mod-k': ({ editor }) =>
        editor.schema.marks['link'] !== undefined && wasHandled(storage.onOpenLinkForm),
    }
    for (const { name, keys } of formatShortcuts) {
      for (const key of keys) {
        shortcuts[key] = ({ editor }) => {
          if (editor.schema.marks[name] === undefined || !editor.isEditable) {
            return false
          }
          editor.commands.toggleMark(name)
          storage.onFormatToggle?.(name, editor.isActive(name))
          return true
        }
      }
    }
    return shortcuts
  },

  addProseMirrorPlugins() {
    const storage = this.storage
    const editor = this.editor
    const resetEscape = () => {
      storage.isEscapeConsumed = false
      return false
    }
    return [
      new Plugin({
        key: new PluginKey('kvirnKeymap'),
        props: {
          // ProseMirror runs a plugin's `handleDOMEvents` before its own key handling, and skips
          // that handling when one returns true. That is how Tab can leave without any other
          // extension's Tab binding acting, and without stopping the event's propagation: a
          // Dialog's own Tab handling still sees it.
          handleDOMEvents: {
            keydown: (_view, event) => {
              // Escape belongs to the IME while it composes.
              if (event.isComposing || !editor.isEditable) {
                return false
              }
              if (modifierKeys.has(event.key)) {
                return false
              }
              const hasNoModifier = !event.ctrlKey && !event.altKey && !event.metaKey
              if (event.key === 'Escape' && hasNoModifier && !event.shiftKey) {
                if (storage.isEscapeConsumed) {
                  // A second Escape passes on.
                  return resetEscape()
                }
                storage.isEscapeConsumed = true
                // The first Escape is consumed, so a Dialog around the editor doesn't close
                // and lose the text.
                event.preventDefault()
                event.stopPropagation()
                return true
              }
              if (event.key === 'Tab' && hasNoModifier) {
                if (runTab(editor, storage, event.shiftKey) === 'acted') {
                  event.preventDefault()
                }
                return true
              }
              resetEscape()
              // Not a shortcut: ProseMirror never sees the key, so the browser types the character.
              return isNeverShortcut(event)
            },
            blur: resetEscape,
            mousedown: resetEscape,
          },
        },
      }),
    ]
  },
})
