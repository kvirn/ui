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

export interface TableAction {
  label: string
  isAvailable: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

export interface TableToggleAction extends TableAction {
  isPressed: (editor: Editor) => boolean
}

/**
 * The table actions, as data: the seven actions in the group's order, then the header row toggle.
 * The Table group renders them as toolbar buttons and the compact toolbar's menu as items, so what
 * each does, says and announces is written once.
 */
export function useTableActions(): { actions: TableAction[]; headerRow: TableToggleAction } {
  const { announce, focusText, isMac, messageOverrides } = useRichTextEditorContext(
    'RichTextEditor.TableControls',
  )
  const messages = useMessages('richText', messageOverrides)
  const undoKey = describeShortcut(['Mod-z'], isMac).text
  return {
    actions: [
      {
        label: messages.addRowAbove,
        isAvailable: (current) => current.can().addRowBefore(),
        run: (current) => {
          current.chain().addRowBefore().run()
          announce(messages.rowAdded)
        },
      },
      {
        label: messages.addRowBelow,
        isAvailable: (current) => current.can().addRowAfter(),
        run: (current) => {
          current.chain().addRowAfter().run()
          announce(messages.rowAdded)
        },
      },
      {
        label: messages.addColumnLeft,
        isAvailable: (current) => current.can().addColumnBefore(),
        run: (current) => {
          const chain = current.chain()
          // What the user sees on the left is the "after" side when the text runs right to left.
          ;(isRightToLeft(current) ? chain.addColumnAfter() : chain.addColumnBefore()).run()
          announce(messages.columnAdded)
        },
      },
      {
        label: messages.addColumnRight,
        isAvailable: (current) => current.can().addColumnAfter(),
        run: (current) => {
          const chain = current.chain()
          ;(isRightToLeft(current) ? chain.addColumnBefore() : chain.addColumnAfter()).run()
          announce(messages.columnAdded)
        },
      },
      {
        label: messages.deleteRow,
        // Unavailable with one row: a table is deleted as a whole.
        isAvailable: canDeleteRow,
        run: (current) => {
          current.chain().deleteRow().run()
          announce(messages.rowDeleted)
        },
      },
      {
        label: messages.deleteColumn,
        isAvailable: canDeleteColumn,
        run: (current) => {
          current.chain().deleteColumn().run()
          announce(messages.columnDeleted)
        },
      },
      {
        label: messages.deleteTable,
        isAvailable: (current) => current.can().deleteTable(),
        run: (current) => {
          current.chain().deleteTable().run()
          // The focused button may go with the group: put focus in the text first, never on body.
          focusText()
          announce(messages.tableDeleted({ shortcut: undoKey }))
        },
      },
    ],
    headerRow: {
      label: messages.headerRow,
      isAvailable: (current) => current.can().toggleHeaderRow(),
      isPressed: isHeaderRowOn,
      run: (current) => {
        current.chain().toggleHeaderRow().run()
      },
    },
  }
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
  const { editor, messageOverrides } = useRichTextEditorContext('RichTextEditor.TableControls')
  const messages = useMessages('richText', messageOverrides)
  const { actions, headerRow } = useTableActions()
  const hasTable = useEditorSelector(editor, documentHasTable, false)
  if (!hasTable) {
    return null
  }
  return (
    <Toolbar.Group aria-label={messages.groupTable}>
      {actions.map((action) => (
        <CommandButton
          key={action.label}
          label={action.label}
          isAvailable={action.isAvailable}
          onPress={action.run}
        />
      ))}
      <CommandToggle
        label={headerRow.label}
        isAvailable={headerRow.isAvailable}
        isPressed={headerRow.isPressed}
        onPress={headerRow.run}
      />
    </Toolbar.Group>
  )
}
TableControls.displayName = 'RichTextEditor.TableControls'
