import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'
import { currentBlockText, focusEnd, mountEditor, placeCaret } from '../test-utils.ts'
import type { EditorFixture } from '../test-utils.ts'
import { defaultExtensions } from './default-extensions.ts'
import { isNeverShortcut } from './kvirn-keymap.ts'

// Plan 0036, design spec §6.6.6 and §7.4: the keys of the editable text. Every row of the
// contract's Keyboard table that the text itself decides is proved here with real key presses
// (the toolbar's rows follow with the toolbar). Real Tiptap, in a real browser.

let fixture: EditorFixture | undefined

function create(content: string): EditorFixture {
  fixture = mountEditor(defaultExtensions(), content)
  return fixture
}

afterEach(() => {
  fixture?.destroy()
  fixture = undefined
})

const list = '<ul><li><p>Ett</p></li><li><p>Två</p></li></ul>'
const nestedList = '<ul><li><p>Ett</p><ul><li><p>Två</p></li></ul></li></ul>'
const table =
  '<table><tbody><tr><th><p>A1</p></th><th><p>B1</p></th></tr><tr><td><p>A2</p></td><td><p>B2</p></td></tr></tbody></table>'

describe('Tab and Shift+Tab in a list item', () => {
  test('Tab nests an item that has an item above it, and focus stays in the text', async () => {
    const { editor } = create(list)
    placeCaret(editor, 'Två')
    await userEvent.keyboard('{Tab}')
    expect(editor.view.dom.querySelectorAll('ul ul li')).toHaveLength(1)
    expect(document.activeElement).toBe(editor.view.dom)
  })

  test('Tab on the first item of a list leaves the editor, and nests nothing', async () => {
    const { editor, after } = create(list)
    placeCaret(editor, 'Ett')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(after)
    expect(editor.view.dom.querySelectorAll('ul ul')).toHaveLength(0)
  })

  test('Shift+Tab outdents a nested item one level, and focus stays in the text', async () => {
    const { editor } = create(nestedList)
    placeCaret(editor, 'Två')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(editor.view.dom.querySelectorAll('ul ul')).toHaveLength(0)
    expect(editor.view.dom.querySelectorAll('li')).toHaveLength(2)
    expect(document.activeElement).toBe(editor.view.dom)
  })

  test('Shift+Tab in a top-level item leaves backwards, and never lifts it out of its list', async () => {
    const { editor, before } = create('<p>Före</p><ul><li><p>Ett</p></li></ul>')
    placeCaret(editor, 'Ett')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(document.activeElement).toBe(before)
    expect(editor.view.dom.querySelectorAll('ul > li')).toHaveLength(1)
  })

  test('Tab and Shift+Tab report the new level, from 1', async () => {
    const { editor } = create(list)
    const levels: number[] = []
    editor.storage.kvirnKeymap.onListLevelChange = (level) => levels.push(level)
    placeCaret(editor, 'Två')
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(levels).toEqual([2, 1])
  })

  test('Tab at the start of a paragraph after a list leaves, and pulls nothing into the list', async () => {
    const { editor, after } = create('<ul><li><p>Ett</p></li></ul><p>Efter</p>')
    placeCaret(editor, 'Efter', 'start')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(after)
    expect(editor.view.dom.querySelectorAll('li p')).toHaveLength(1)
  })
})

describe('Tab and Shift+Tab in a table', () => {
  test('Tab moves to the next cell and selects its text, focus staying in the text', async () => {
    const { editor } = create(table)
    placeCaret(editor, 'A1')
    await userEvent.keyboard('{Tab}')
    expect(currentBlockText(editor)).toBe('B1')
    expect(document.activeElement).toBe(editor.view.dom)
    await userEvent.keyboard('{Tab}')
    expect(currentBlockText(editor)).toBe('A2')
  })

  test('Shift+Tab moves to the previous cell', async () => {
    const { editor } = create(table)
    placeCaret(editor, 'B2')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(currentBlockText(editor)).toBe('A2')
  })

  test('Tab in the last cell leaves the editor, and never adds a row', async () => {
    const { editor, after } = create(table)
    placeCaret(editor, 'B2')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(after)
    expect(editor.view.dom.querySelectorAll('tr')).toHaveLength(2)
  })

  test('Shift+Tab in the first cell leaves backwards', async () => {
    const { editor, before } = create(table)
    placeCaret(editor, 'A1')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(document.activeElement).toBe(before)
  })

  test('a list in a cell: the list rule wins where the item can nest, and the cell rule where it cannot', async () => {
    const { editor } = create(
      '<table><tbody><tr><td><ul><li><p>Ett</p></li><li><p>Två</p></li></ul></td><td><p>B1</p></td></tr></tbody></table>',
    )
    placeCaret(editor, 'Två')
    await userEvent.keyboard('{Tab}')
    expect(editor.view.dom.querySelectorAll('td ul ul li')).toHaveLength(1)
    // Nothing is left to nest the item under: the cell rule moves to the next cell.
    await userEvent.keyboard('{Tab}')
    expect(currentBlockText(editor)).toBe('B1')
  })
})

describe('Tab and Shift+Tab outside lists and tables', () => {
  test('Tab leaves forwards, and Shift+Tab leaves backwards', async () => {
    const { editor, before, after } = create(
      '<p>Ett stycke</p><blockquote><p>Citat</p></blockquote>',
    )
    placeCaret(editor, 'Ett stycke')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(after)
    placeCaret(editor, 'Citat')
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(document.activeElement).toBe(before)
  })
})

describe('Escape', () => {
  test('Escape is not a way out: Tab after it still nests a list item', async () => {
    const { editor } = create(list)
    placeCaret(editor, 'Två')
    await userEvent.keyboard('{Escape}{Tab}')
    expect(editor.view.dom.querySelectorAll('ul ul li')).toHaveLength(1)
    expect(document.activeElement).toBe(editor.view.dom)
  })

  test('the first Escape is not passed on, so a Dialog around the editor stays open; a second one is', async () => {
    const { editor, container } = create(list)
    const escapes = vi.fn<() => void>()
    container.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        escapes()
      }
    })
    placeCaret(editor, 'Två')
    await userEvent.keyboard('{Escape}')
    expect(escapes).not.toHaveBeenCalled()
    await userEvent.keyboard('{Escape}')
    expect(escapes).toHaveBeenCalledTimes(1)
  })

  test('clicking in the text starts over: the next Escape is consumed again', async () => {
    const { editor } = create(list)
    placeCaret(editor, 'Två')
    await userEvent.keyboard('{Escape}')
    expect(editor.storage.kvirnKeymap.isEscapeConsumed).toBe(true)
    editor.view.dom.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(editor.storage.kvirnKeymap.isEscapeConsumed).toBe(false)
  })
})

describe('Alt+F10 and Mod-k', () => {
  test('Alt+F10 asks for the toolbar, and focus goes where the owner takes it', async () => {
    const { editor, before } = create('<p>Text</p>')
    editor.storage.kvirnKeymap.onFocusToolbar = () => {
      before.focus()
      return true
    }
    placeCaret(editor, 'Text')
    await userEvent.keyboard('{Alt>}{F10}{/Alt}')
    expect(document.activeElement).toBe(before)
  })

  test('Mod-k asks for the link form', async () => {
    const { editor } = create('<p>Text</p>')
    const openLinkForm = vi.fn<() => boolean>(() => true)
    editor.storage.kvirnKeymap.onOpenLinkForm = openLinkForm
    placeCaret(editor, 'Text')
    await userEvent.keyboard('{Control>}k{/Control}')
    expect(openLinkForm).toHaveBeenCalledTimes(1)
  })
})

describe('shortcuts that are kept', () => {
  test('Mod-b, Mod-i and Mod-u toggle bold, italic and underline, and report whether each is on', async () => {
    const { editor } = create('<p>Text</p>')
    const toggles: Array<[string, boolean]> = []
    editor.storage.kvirnKeymap.onFormatToggle = (format, isOn) => toggles.push([format, isOn])
    placeCaret(editor, 'Text')
    editor.commands.selectAll()
    await userEvent.keyboard('{Control>}b{/Control}')
    await userEvent.keyboard('{Control>}i{/Control}')
    await userEvent.keyboard('{Control>}u{/Control}')
    expect(editor.getHTML()).toContain('<strong>')
    expect(editor.getHTML()).toContain('<em>')
    expect(editor.getHTML()).toContain('<u>')
    await userEvent.keyboard('{Control>}b{/Control}')
    expect(editor.getHTML()).not.toContain('<strong>')
    expect(toggles).toEqual([
      ['bold', true],
      ['italic', true],
      ['underline', true],
      ['bold', false],
    ])
  })

  test('Mod-z undoes, and Mod-Shift-z and Ctrl-y redo', async () => {
    const { editor } = create('<p>Hej</p>')
    focusEnd(editor)
    await userEvent.keyboard('a')
    expect(editor.getText()).toBe('Heja')
    await userEvent.keyboard('{Control>}z{/Control}')
    expect(editor.getText()).toBe('Hej')
    await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
    expect(editor.getText()).toBe('Heja')
    await userEvent.keyboard('{Control>}z{/Control}')
    expect(editor.getText()).toBe('Hej')
    await userEvent.keyboard('{Control>}y{/Control}')
    expect(editor.getText()).toBe('Heja')
  })
})

describe('shortcuts that are removed', () => {
  // Each key is a Tiptap default that clashes with AltGr, a browser or a Nordic keyboard.
  const removed: Array<[name: string, keys: string]> = [
    ['Control+Alt+1 (heading)', '{Control>}{Alt>}1{/Alt}{/Control}'],
    ['Control+Alt+2 (heading)', '{Control>}{Alt>}2{/Alt}{/Control}'],
    ['Control+Alt+3 (heading)', '{Control>}{Alt>}3{/Alt}{/Control}'],
    ['Control+Alt+4 (heading)', '{Control>}{Alt>}4{/Alt}{/Control}'],
    ['Control+Alt+5 (heading)', '{Control>}{Alt>}5{/Alt}{/Control}'],
    ['Control+Alt+6 (heading)', '{Control>}{Alt>}6{/Alt}{/Control}'],
    ['Control+Alt+C (code block)', '{Control>}{Alt>}c{/Alt}{/Control}'],
    ['Control+Shift+S (strikethrough)', '{Control>}{Shift>}s{/Shift}{/Control}'],
    ['Control+E (code)', '{Control>}e{/Control}'],
    ['Control+Shift+B (quote)', '{Control>}{Shift>}b{/Shift}{/Control}'],
    ['Control+Shift+7 (numbered list)', '{Control>}{Shift>}7{/Shift}{/Control}'],
    ['Control+Shift+8 (bulleted list)', '{Control>}{Shift>}8{/Shift}{/Control}'],
  ]
  test.each(removed)('%s does nothing to the text', async (_name, keys) => {
    const { editor } = create('<p>Hej</p>')
    placeCaret(editor, 'Hej')
    editor.commands.selectAll()
    await userEvent.keyboard(keys)
    expect(editor.getHTML()).toBe('<p>Hej</p>')
  })
})

describe('AltGr', () => {
  // Windows reports AltGr as Control+Alt. Swedish, Finnish and Norwegian layouts type these with
  // it. ProseMirror matches a key such as `@` by its key code (`2`), which Tiptap binds to a
  // heading, so the keydown must reach the browser untouched for the character to be typed.
  const characters: Array<[character: string, code: string, keyCode: number]> = [
    ['@', 'Digit2', 50],
    ['£', 'Digit3', 51],
    ['$', 'Digit4', 52],
    ['€', 'Digit5', 53],
    ['{', 'Digit7', 55],
    ['[', 'Digit8', 56],
    [']', 'Digit9', 57],
    ['}', 'Digit0', 48],
    ['\\', 'Minus', 187],
  ]

  test.each(characters)(
    'Control+Alt with %s is typed as text: the keydown is not handled or cancelled',
    (character, code, keyCode) => {
      const { editor } = create('<p>Hej</p>')
      placeCaret(editor, 'Hej')
      const prevented: Record<string, boolean> = {}
      for (const key of [character, code.replace('Digit', '')]) {
        const event = new KeyboardEvent('keydown', {
          key,
          code,
          keyCode,
          ctrlKey: true,
          altKey: true,
          bubbles: true,
          cancelable: true,
        })
        editor.view.dom.dispatchEvent(event)
        prevented[key] = event.defaultPrevented
      }
      expect(Object.values(prevented)).toEqual([false, false])
      expect(editor.getHTML()).toBe('<p>Hej</p>')
    },
  )

  test('isNeverShortcut: Control+Alt and Command+Option chords, and only those Mod chords', () => {
    const chord = (init: KeyboardEventInit) => isNeverShortcut(new KeyboardEvent('keydown', init))
    expect(chord({ key: '@', ctrlKey: true, altKey: true })).toBe(true)
    expect(chord({ key: 'c', metaKey: true, altKey: true })).toBe(true)
    expect(chord({ key: 'b', ctrlKey: true })).toBe(false)
    expect(chord({ key: 'k', ctrlKey: true })).toBe(false)
    expect(chord({ key: 'F10', altKey: true })).toBe(false)
    // Option alone types characters on macOS.
    expect(chord({ key: '€', altKey: true })).toBe(false)
  })
})

describe('the keys the text leaves to the browser and Tiptap', () => {
  test('the arrow keys, Home and End move the caret in the text', async () => {
    const { editor } = create('<p>Biblioteket har öppet på torsdagar.</p>')
    placeCaret(editor, 'Biblioteket')
    await userEvent.keyboard('{Home}{ArrowRight}{ArrowRight}{ArrowRight}X')
    expect(editor.view.dom.textContent).toContain('BibXlioteket')
    await userEvent.keyboard('{End}Y')
    expect(editor.view.dom.textContent).toContain('torsdagar.Y')
  })

  test('Enter starts a new paragraph and Shift+Enter a line break', async () => {
    const { editor } = create('<p>Välkommen in.</p>')
    placeCaret(editor, 'Välkommen in.')
    await userEvent.keyboard('{Enter}Ny{Shift>}{Enter}{/Shift}Rad')
    expect(editor.view.dom.querySelectorAll(':scope > p')).toHaveLength(2)
    expect(editor.view.dom.querySelectorAll('p br:not(.ProseMirror-trailingBreak)')).toHaveLength(1)
  })
})
