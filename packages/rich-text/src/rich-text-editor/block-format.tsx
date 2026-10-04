'use client'
import { Listbox, Toolbar } from '@kvirn-ui/react'
import { FieldContext, useMessages, warnOnce } from '@kvirn-ui/react/internal'
import type { Editor } from '@tiptap/core'
import { useEffect, useMemo } from 'react'
import type { ReactElement } from 'react'
import { ControlTooltip, keepFocusInText, useToolbarSettings } from './command-controls.tsx'
import { useRichTextEditorContext } from './rich-text-editor-context.ts'
import { useEditorSelector } from './use-editor-selector.ts'

/** One kind of block the picker offers: normal text, a heading level, a quote or a code block. */
export type BlockKey = 'paragraph' | 'quote' | 'code' | `heading-${number}`

interface BlockOption {
  key: BlockKey
  label: string
}

/** The kind of block a textblock is in, or `undefined` for one the picker doesn't know. */
function blockKeyAt(editor: Editor, position: number): BlockKey | undefined {
  const $position = editor.state.doc.resolve(position)
  const block = $position.parent
  if (block.type.name === 'heading') {
    return `heading-${Number(block.attrs['level'])}`
  }
  if (block.type.name === 'codeBlock') {
    return 'code'
  }
  if (block.type.name !== 'paragraph') {
    return undefined
  }
  for (let depth = $position.depth; depth > 0; depth -= 1) {
    if ($position.node(depth).type.name === 'blockquote') {
      return 'quote'
    }
  }
  return 'paragraph'
}

/**
 * The block type at the selection, or `'mixed'` when it spans different types: choosing an option
 * then applies it to all of them. Flat text: the picker re-renders only when the type changes.
 */
export function getBlockKey(editor: Editor): BlockKey | 'mixed' {
  const { from, to } = editor.state.selection
  const keys = new Set<BlockKey>()
  editor.state.doc.nodesBetween(from, to, (node, position) => {
    if (node.isTextblock) {
      const key = blockKeyAt(editor, position + 1)
      if (key !== undefined) {
        keys.add(key)
      }
      return false
    }
    return true
  })
  if (keys.size === 0) {
    return blockKeyAt(editor, from) ?? 'paragraph'
  }
  if (keys.size > 1) {
    return 'mixed'
  }
  return [...keys][0] ?? 'paragraph'
}

/** Turns the selected blocks into the chosen kind. */
export function applyBlockKey(editor: Editor, key: BlockKey): void {
  const chain = editor.chain()
  if (editor.isActive('blockquote') && key !== 'quote') {
    chain.lift('blockquote')
  }
  if (key === 'paragraph') {
    chain.setParagraph()
  } else if (key === 'quote') {
    if (!editor.isActive('blockquote')) {
      chain.setParagraph().setBlockquote()
    }
  } else if (key === 'code') {
    chain.setCodeBlock()
  } else {
    chain.setHeading({ level: Number(key.slice('heading-'.length)) as 1 | 2 | 3 | 4 | 5 | 6 })
  }
  chain.run()
}

/**
 * The block type picker: a Listbox (`native="never"`, so it stays a toolbar item on touch screens)
 * for Normal text, the configured heading levels, Quote and Code block. It shows the type at the
 * caret, or "Several types" when the selection spans more than one, and choosing an option applies
 * it and puts focus back in the text. Its name, "Texttyp", is its `aria-label` and its tooltip.
 */
export function BlockFormat(): ReactElement {
  const context = useRichTextEditorContext('RichTextEditor.BlockFormat')
  const { editor, features, focusText, messageOverrides, state } = context
  const messages = useMessages('richText', messageOverrides)
  const { tooltips } = useToolbarSettings()
  const blockKey = useEditorSelector<BlockKey | 'mixed'>(editor, getBlockKey, 'paragraph')

  const headingLabels: Record<number, string | undefined> = {
    2: messages.blockHeading2,
    3: messages.blockHeading3,
    4: messages.blockHeading4,
  }
  const unlabelled = features.headingLevels.filter((level) => headingLabels[level] === undefined)
  const unlabelledLevels = unlabelled.join(', ')
  useEffect(() => {
    if (unlabelledLevels !== '') {
      warnOnce(
        'rich-text-editor-heading-level-without-name',
        `The block picker has no name for heading level ${unlabelledLevels}: it names levels 2 to 4. Use levels 2, 3 and 4 (the page owns the H1, and DESIGN.md stops resident text at h3), or build the picker yourself.`,
      )
    }
  }, [unlabelledLevels])

  const labels = [
    messages.blockParagraph,
    ...features.headingLevels.map((level) => headingLabels[level] ?? ''),
    messages.blockQuote,
    messages.blockCode,
  ]
  const levels = features.headingLevels.filter((level) => headingLabels[level] !== undefined)
  const labelsKey = labels.join('\n')
  const levelsKey = levels.join(',')
  const { blockquote, codeBlock } = features
  const options = useMemo<BlockOption[]>(
    () => [
      { key: 'paragraph', label: messages.blockParagraph },
      ...levels.map((level) => ({
        key: `heading-${level}` as const,
        label: headingLabels[level] ?? '',
      })),
      ...(blockquote ? [{ key: 'quote' as const, label: messages.blockQuote }] : []),
      ...(codeBlock ? [{ key: 'code' as const, label: messages.blockCode }] : []),
    ],
    // The labels and what is offered are the only inputs: `messages` is rebuilt on every render.
    [labelsKey, levelsKey, blockquote, codeBlock],
  )

  const isDisabled = state.isDisabled || editor === null
  // A disabled picker is not a toolbar item: a Listbox is never natively disabled, so as an item it
  // would stay the toolbar's Tab stop, and a disabled editor has none.
  const trigger = isDisabled ? (
    <Listbox.Trigger aria-label={messages.blockType} tabIndex={-1}>
      <Listbox.Value placeholder={messages.blockMixed} />
    </Listbox.Trigger>
  ) : (
    <Toolbar.Item
      render={
        <Listbox.Trigger aria-label={messages.blockType} onMouseDown={keepFocusInText}>
          <Listbox.Value placeholder={messages.blockMixed} />
        </Listbox.Trigger>
      }
    />
  )
  // The picker is a toolbar control, not the Field's control: without this it would take the
  // Field's id, description and state, which belong to the editable text.
  return (
    <FieldContext value={null}>
      <Listbox.Root
        native="never"
        items={options}
        itemToString={(option: BlockOption) => option.label}
        itemToKey={(option: BlockOption) => option.key}
        value={blockKey === 'mixed' ? null : blockKey}
        disabled={isDisabled}
        onValueChange={(key) => {
          if (editor !== null && key !== null) {
            applyBlockKey(editor, key as BlockKey)
            // The listbox returns focus to its trigger as it closes: take it back after that.
            setTimeout(focusText, 0)
          }
        }}
      >
        {tooltips && !isDisabled ? (
          <ControlTooltip
            label={messages.blockType}
            shortcutKeys={undefined}
            isNameShown={false}
            control={trigger}
          />
        ) : (
          trigger
        )}
        <Listbox.Popup>
          <Listbox.List>{(option: BlockOption) => <Listbox.Option item={option} />}</Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </FieldContext>
  )
}
BlockFormat.displayName = 'RichTextEditor.BlockFormat'
