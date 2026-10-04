'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useMessages } from '@kvirn-ui/react/internal'
import type { Editor } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { ReactElement } from 'react'
import { CommandButton, CommandToggle } from './command-controls.tsx'
import { useRichTextEditorContext } from './rich-text-editor-context.ts'
import { useEditorSelector } from './use-editor-selector.ts'
import { describeShortcut } from './shortcuts.ts'

/** Whether the document has at least one table: the group is there, with or without the caret in it. */
export function documentHasTable(editor: Editor): boolean {
  let hasTable = false
  editor.state.doc.descendants((node) => {
    if (node.type.spec['tableRole'] === 'table') {
      hasTable = true
    }
    return !hasTable
  })
  return hasTable
}

/** Whether the table at the caret starts with a row of header cells. */
export function isHeaderRowOn(editor: Editor): boolean {
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const table = $from.node(depth)
    if (table.type.spec['tableRole'] === 'table') {
      return table.firstChild?.firstChild?.type.name === 'tableHeader'
    }
  }
  return false
}

/** The table the caret is in, if any. */
function tableAtCaret(editor: Editor): ProseMirrorNode | null {
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (node.type.spec['tableRole'] === 'table') {
      return node
    }
  }
  return null
}

/**
 * Whether the row can be deleted: the caret is in a table that has another row. The command itself
 * only checks that on dispatch, so `can()` alone says yes for a table of one row, where a table is
 * deleted as a whole.
 */
export function canDeleteRow(editor: Editor): boolean {
  const table = tableAtCaret(editor)
  return table !== null && table.childCount > 1 && editor.can().deleteRow()
}

/** Whether the column can be deleted: the caret is in a table of more than one column. */
export function canDeleteColumn(editor: Editor): boolean {
  const table = tableAtCaret(editor)
  return (table?.firstChild?.childCount ?? 0) > 1 && editor.can().deleteColumn()
}

/**
 * Whether the table at the caret runs right to left, as the user sees it: the column buttons then
 * swap. The direction comes from the provider and the page, so this reads the table's own computed direction.
 */
function isRightToLeft(editor: Editor): boolean {
  const { node } = editor.view.domAtPos(editor.state.selection.from)
  const element = node instanceof Element ? node : node.parentElement
  const table = element?.closest('table') ?? element ?? editor.view.dom
  return getComputedStyle(table).direction === 'rtl'
}

/**
 * The Table group: the table actions as text buttons, in a named group. It is in the toolbar
 * **while the document has a table**, and its buttons are unavailable (`aria-disabled`, still
 * focusable) while the caret is outside every table, so moving the caret never makes the toolbar
 * jump (WCAG 3.2.1, 3.2.2). It appears when the user inserts or pastes a table, and goes when the
 * last one is deleted, with focus back in the text. "Add column to the left" always means the left
 * of what the user sees: it swaps in right-to-left text. Every action is announced politely.
 */
export function TableControls(): ReactElement | null {
  const { editor, announce, focusText, isMac, messageOverrides } = useRichTextEditorContext(
    'RichTextEditor.TableControls',
  )
  const messages = useMessages('richText', messageOverrides)
  const hasTable = useEditorSelector(editor, documentHasTable, false)
  if (!hasTable) {
    return null
  }
  const undoKey = describeShortcut(['Mod-z'], isMac).text
  return (
    <Toolbar.Group aria-label={messages.groupTable}>
      <CommandButton
        label={messages.addRowAbove}
        isAvailable={(current) => current.can().addRowBefore()}
        onPress={(current) => {
          current.chain().addRowBefore().run()
          announce(messages.rowAdded)
        }}
      />
      <CommandButton
        label={messages.addRowBelow}
        isAvailable={(current) => current.can().addRowAfter()}
        onPress={(current) => {
          current.chain().addRowAfter().run()
          announce(messages.rowAdded)
        }}
      />
      <CommandButton
        label={messages.addColumnLeft}
        isAvailable={(current) => current.can().addColumnBefore()}
        onPress={(current) => {
          const chain = current.chain()
          // What the user sees on the left is the "after" side when the text runs right to left.
          ;(isRightToLeft(current) ? chain.addColumnAfter() : chain.addColumnBefore()).run()
          announce(messages.columnAdded)
        }}
      />
      <CommandButton
        label={messages.addColumnRight}
        isAvailable={(current) => current.can().addColumnAfter()}
        onPress={(current) => {
          const chain = current.chain()
          ;(isRightToLeft(current) ? chain.addColumnBefore() : chain.addColumnAfter()).run()
          announce(messages.columnAdded)
        }}
      />
      <CommandButton
        label={messages.deleteRow}
        // Unavailable with one row: a table is deleted as a whole.
        isAvailable={canDeleteRow}
        onPress={(current) => {
          current.chain().deleteRow().run()
          announce(messages.rowDeleted)
        }}
      />
      <CommandButton
        label={messages.deleteColumn}
        isAvailable={canDeleteColumn}
        onPress={(current) => {
          current.chain().deleteColumn().run()
          announce(messages.columnDeleted)
        }}
      />
      <CommandButton
        label={messages.deleteTable}
        isAvailable={(current) => current.can().deleteTable()}
        onPress={(current) => {
          current.chain().deleteTable().run()
          // The focused button may go with the group: put focus in the text first, never on body.
          focusText()
          announce(messages.tableDeleted({ shortcut: undoKey }))
        }}
      />
      <CommandToggle
        label={messages.headerRow}
        isAvailable={(current) => current.can().toggleHeaderRow()}
        isPressed={isHeaderRowOn}
        onPress={(current) => {
          current.chain().toggleHeaderRow().run()
        }}
      />
    </Toolbar.Group>
  )
}
TableControls.displayName = 'RichTextEditor.TableControls'
