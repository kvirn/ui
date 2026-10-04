'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useMessages } from '@kvirn-ui/react/internal'
import type { Editor } from '@tiptap/core'
import type { ReactElement } from 'react'
import {
  canIndentListItem,
  canOutdentListItem,
  indentListItem,
  outdentListItem,
} from '../extensions/kvirn-keymap.ts'
import { BlockFormat } from './block-format.tsx'
import { CommandButton, CommandToggle } from './command-controls.tsx'
import { ImageControl } from './image-control.tsx'
import { ToolbarIcon } from './icons.tsx'
import { LinkControl } from './link-control.tsx'
import { useRichTextEditorContext } from './rich-text-editor-context.ts'
import type { RichTextFeatures } from './use-rich-text-editor.ts'
import { TableControls } from './table-controls.tsx'

/** The controls of the default toolbar, by name: for `include` and `exclude`. */
export type DefaultControlName =
  | 'undo'
  | 'redo'
  | 'blockFormat'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'bulletList'
  | 'orderedList'
  | 'indent'
  | 'outdent'
  | 'link'
  | 'image'
  | 'table'
  | 'clearFormatting'
  /** The contextual Table group: present while the document has a table. */
  | 'tableControls'

export interface DefaultControlsProps {
  /** Only these controls. Default: all of them. A control the extensions don't provide is left out anyway. */
  include?: readonly DefaultControlName[] | undefined
  /** All of them except these. */
  exclude?: readonly DefaultControlName[] | undefined
}

/** Whether the extensions provide what a control acts on: no bold mark, no Bold button. */
function isProvided(name: DefaultControlName, features: RichTextFeatures): boolean {
  switch (name) {
    case 'undo':
    case 'redo':
      return features.history
    case 'blockFormat':
      return features.headingLevels.length > 0 || features.blockquote || features.codeBlock
    case 'bold':
    case 'italic':
    case 'underline':
    case 'strike':
    case 'code':
    case 'bulletList':
    case 'orderedList':
      return features[name]
    case 'indent':
    case 'outdent':
      return features.lists
    case 'link':
      return features.links
    case 'image':
      return features.images
    case 'table':
    case 'tableControls':
      return features.tables
    case 'clearFormatting':
      return true
  }
}

/** Whether there is anything the Clear formatting button would remove at the selection. */
function hasFormatting(editor: Editor): boolean {
  const { selection, doc } = editor.state
  if ((editor.state.storedMarks?.length ?? 0) > 0) {
    return true
  }
  let found = false
  doc.nodesBetween(selection.from, selection.to, (node) => {
    if (found) {
      return false
    }
    if (node.marks.length > 0 || (node.isTextblock && node.type.name !== 'paragraph')) {
      found = true
    }
    return !found
  })
  if (found) {
    return true
  }
  const { $from } = selection
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const name = $from.node(depth).type.name
    if (name === 'listItem' || name === 'blockquote') {
      return true
    }
  }
  return false
}

/**
 * The default toolbar's controls, in the order and groups of the design spec: Undo and Redo, the
 * block type picker, the text styles (bold, italic, underline, strikethrough, code), the lists
 * (bulleted, numbered, increase and decrease indent), Link, Image and Table, Clear formatting,
 * and the Table group while the document has a table. A control is left out when the extensions
 * don't provide it (no `Underline`, no Underline button), and `include` and `exclude` choose among
 * the rest. The order inside a group and of the groups doesn't change.
 *
 * @example
 * <RichTextEditor.Toolbar>
 *   <RichTextEditor.DefaultControls exclude={['table', 'image']} />
 *   <RichTextEditor.Group aria-label="Markering">…</RichTextEditor.Group>
 * </RichTextEditor.Toolbar>
 */
export function DefaultControls({ include, exclude }: DefaultControlsProps): ReactElement {
  const { features, announce, messageOverrides } = useRichTextEditorContext(
    'RichTextEditor.DefaultControls',
  )
  const messages = useMessages('richText', messageOverrides)
  const has = (name: DefaultControlName): boolean =>
    isProvided(name, features) &&
    (include === undefined || include.includes(name)) &&
    !(exclude?.includes(name) ?? false)

  const hasHistory = has('undo') || has('redo')
  const hasTextStyle =
    has('bold') || has('italic') || has('underline') || has('strike') || has('code')
  const hasLists = has('bulletList') || has('orderedList') || has('indent') || has('outdent')
  const hasInsert = has('link') || has('image') || has('table')

  return (
    <>
      {hasHistory ? (
        <Toolbar.Group aria-label={messages.groupHistory}>
          {has('undo') ? (
            <CommandButton
              label={messages.undo}
              icon={<ToolbarIcon name="undo" />}
              shortcut={['Mod-z']}
              isAvailable={(editor) => editor.can().undo()}
              onPress={(editor) => {
                editor.chain().undo().run()
                announce(messages.undone)
              }}
            />
          ) : null}
          {has('redo') ? (
            <CommandButton
              label={messages.redo}
              icon={<ToolbarIcon name="redo" />}
              shortcut={['Mod-Shift-z', 'Ctrl-y']}
              isAvailable={(editor) => editor.can().redo()}
              onPress={(editor) => {
                editor.chain().redo().run()
                announce(messages.redone)
              }}
            />
          ) : null}
        </Toolbar.Group>
      ) : null}
      {has('blockFormat') ? <BlockFormat /> : null}
      {hasTextStyle ? (
        <Toolbar.Group aria-label={messages.groupTextStyle}>
          {has('bold') ? (
            <CommandToggle
              label={messages.bold}
              icon={<ToolbarIcon name="bold" />}
              shortcut={['Mod-b']}
              isPressed={(editor) => editor.isActive('bold')}
              onPress={(editor) => {
                editor.chain().toggleMark('bold').run()
              }}
            />
          ) : null}
          {has('italic') ? (
            <CommandToggle
              label={messages.italic}
              icon={<ToolbarIcon name="italic" />}
              shortcut={['Mod-i']}
              isPressed={(editor) => editor.isActive('italic')}
              onPress={(editor) => {
                editor.chain().toggleMark('italic').run()
              }}
            />
          ) : null}
          {has('underline') ? (
            <CommandToggle
              label={messages.underline}
              icon={<ToolbarIcon name="underline" />}
              shortcut={['Mod-u']}
              isPressed={(editor) => editor.isActive('underline')}
              onPress={(editor) => {
                editor.chain().toggleMark('underline').run()
              }}
            />
          ) : null}
          {has('strike') ? (
            <CommandToggle
              label={messages.strike}
              icon={<ToolbarIcon name="strike" />}
              isPressed={(editor) => editor.isActive('strike')}
              onPress={(editor) => {
                editor.chain().toggleMark('strike').run()
              }}
            />
          ) : null}
          {has('code') ? (
            <CommandToggle
              label={messages.code}
              icon={<ToolbarIcon name="code" />}
              isPressed={(editor) => editor.isActive('code')}
              onPress={(editor) => {
                editor.chain().toggleMark('code').run()
              }}
            />
          ) : null}
        </Toolbar.Group>
      ) : null}
      {hasLists ? (
        <Toolbar.Group aria-label={messages.groupLists}>
          {has('bulletList') ? (
            <CommandToggle
              label={messages.bulletList}
              icon={<ToolbarIcon name="bullet-list" />}
              isPressed={(editor) => editor.isActive('bulletList')}
              onPress={(editor) => {
                editor.chain().toggleList('bulletList', 'listItem').run()
              }}
            />
          ) : null}
          {has('orderedList') ? (
            <CommandToggle
              label={messages.orderedList}
              icon={<ToolbarIcon name="numbered-list" />}
              isPressed={(editor) => editor.isActive('orderedList')}
              onPress={(editor) => {
                editor.chain().toggleList('orderedList', 'listItem').run()
              }}
            />
          ) : null}
          {has('indent') ? (
            <CommandButton
              label={messages.indent}
              icon={<ToolbarIcon name="indent" />}
              isAvailable={canIndentListItem}
              onPress={(editor) => {
                const level = indentListItem(editor)
                if (level !== undefined) {
                  announce(messages.listLevel({ level }))
                }
              }}
            />
          ) : null}
          {has('outdent') ? (
            <CommandButton
              label={messages.outdent}
              icon={<ToolbarIcon name="outdent" />}
              isAvailable={canOutdentListItem}
              onPress={(editor) => {
                const level = outdentListItem(editor)
                if (level !== undefined) {
                  announce(messages.listLevel({ level }))
                }
              }}
            />
          ) : null}
        </Toolbar.Group>
      ) : null}
      {hasInsert ? (
        <Toolbar.Group aria-label={messages.groupInsert}>
          {has('link') ? <LinkControl /> : null}
          {has('image') ? <ImageControl /> : null}
          {has('table') ? (
            <CommandButton
              label={messages.table}
              icon={<ToolbarIcon name="table" />}
              isAvailable={(editor) => editor.can().insertTable()}
              onPress={(editor) => {
                editor.chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                // Focus goes to the new table's first cell, and the Table group appears.
                editor.view.focus()
                announce(messages.tableInserted({ columns: 3, rows: 3 }))
              }}
            />
          ) : null}
        </Toolbar.Group>
      ) : null}
      {has('clearFormatting') ? (
        <CommandButton
          label={messages.clearFormatting}
          icon={<ToolbarIcon name="clear-formatting" />}
          isAvailable={hasFormatting}
          onPress={(editor) => {
            editor.chain().unsetAllMarks().clearNodes().run()
            announce(messages.formattingCleared)
          }}
        />
      ) : null}
      {has('tableControls') ? <TableControls /> : null}
    </>
  )
}
DefaultControls.displayName = 'RichTextEditor.DefaultControls'
