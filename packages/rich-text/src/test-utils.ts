import { Editor } from '@tiptap/core'
import type { Extensions } from '@tiptap/core'
import { Selection } from '@tiptap/pm/state'

/** Tests only (not exported): a real Tiptap editor between two buttons, so focus can be followed. */
export interface EditorFixture {
  editor: Editor
  /** The focusable element before the editor: what Shift+Tab leaves to. */
  before: HTMLButtonElement
  /** The focusable element after it: what Tab leaves to. */
  after: HTMLButtonElement
  /** Where the editor is mounted: events that bubble out of the editor reach it. */
  container: HTMLElement
  destroy: () => void
}

export function mountEditor(extensions: Extensions, content: string): EditorFixture {
  const container = document.createElement('div')
  const before = document.createElement('button')
  before.type = 'button'
  before.textContent = 'Före'
  const host = document.createElement('div')
  const after = document.createElement('button')
  after.type = 'button'
  after.textContent = 'Efter'
  container.append(before, host, after)
  document.body.append(container)
  const editor = new Editor({ element: host, extensions, content })
  return {
    editor,
    before,
    after,
    container,
    destroy: () => {
      editor.destroy()
      container.remove()
    },
  }
}

/**
 * Focuses the editor and puts the caret at the start or the end of the first text that contains
 * `text`.
 */
export function placeCaret(editor: Editor, text: string, edge: 'start' | 'end' = 'end'): void {
  let position: number | undefined
  editor.state.doc.descendants((node, nodePosition) => {
    if (position === undefined && node.isText && node.text?.includes(text) === true) {
      position = edge === 'start' ? nodePosition : nodePosition + node.nodeSize
    }
    return position === undefined
  })
  if (position === undefined) {
    throw new Error(`No text "${text}" in the document.`)
  }
  editor.commands.setTextSelection(position)
  editor.view.focus()
}

/** The text of the block the caret is in. */
export function currentBlockText(editor: Editor): string {
  return editor.state.selection.$from.parent.textContent
}

/** Focuses the editor with the caret at the end of the document. */
export function focusEnd(editor: Editor): void {
  editor.view.dispatch(editor.state.tr.setSelection(Selection.atEnd(editor.state.doc)))
  editor.view.focus()
}
