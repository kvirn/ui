'use client'
import { Menu, Popover, Toolbar } from '@kvirn-ui/react'
import { useMessages } from '@kvirn-ui/react/internal'
import type { Editor } from '@tiptap/core'
import { Fragment, useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import {
  canIndentListItem,
  canOutdentListItem,
  indentListItem,
  outdentListItem,
} from '../extensions/kvirn-keymap.ts'
import { applyBlockKey, blockIconName, getBlockKey, useBlockOptions } from './block-format.tsx'
import type { BlockKey } from './block-format.tsx'
import { useToolbarSettings } from './command-controls.tsx'
import { DefaultControls, hasFormatting, isProvided } from './default-controls.tsx'
import type { DefaultControlName, DefaultControlsProps } from './default-controls.tsx'
import { ToolbarIcon } from './icons.tsx'
import { ImageForm } from './image-control.tsx'
import { LinkForm } from './link-control.tsx'
import { useRichTextEditorContext } from './rich-text-editor-context.ts'
import { describeShortcut } from './shortcuts.ts'
import { documentHasTable, useTableActions } from './table-controls.tsx'
import { useEditorSelector } from './use-editor-selector.ts'

/** What stays on the bar, in the default toolbar's order. */
const barControls: readonly DefaultControlName[] = ['bold', 'italic', 'bulletList', 'orderedList']

/** What goes in the menu when it is provided, in the default toolbar's order. */
const menuControls: readonly DefaultControlName[] = [
  'undo',
  'redo',
  'blockFormat',
  'underline',
  'strike',
  'code',
  'indent',
  'outdent',
  'link',
  'image',
  'table',
  'clearFormatting',
]

type MoreTriggerProps = Pick<ComponentPropsWithRef<'button'>, 'ref'> & {
  label: string
  isDisabled: boolean
}

/**
 * The "More" button. A `Popover.Trigger` renders it only to hand it the popover's anchor ref (the
 * link and image forms open under "More"); every other prop of the popover trigger is dropped, so
 * the button is exactly a menu button and a toolbar item.
 */
function MoreTrigger({ ref, label, isDisabled }: MoreTriggerProps): ReactElement {
  return (
    <Toolbar.Item
      as={Menu.Trigger}
      ref={ref}
      className="kv-button kv-rich-text-more"
      disabled={isDisabled}
      focusableWhenDisabled={false}
    >
      <span className="kv-rich-text-control-label">{label}</span>
    </Toolbar.Item>
  )
}

/** The keys of an item's shortcut, drawn after its name. The name and `aria-keyshortcuts` say it to a screen reader. */
function ShortcutHint({ keys }: { keys: readonly string[] | undefined }): ReactElement | null {
  return keys === undefined || keys.length === 0 ? null : (
    <span aria-hidden="true" className="kv-rich-text-menu-shortcut">
      {keys.join('+')}
    </span>
  )
}

interface MenuCommandProps {
  label: string
  shortcut?: readonly string[] | undefined
  isAvailable?: ((editor: Editor) => boolean) | undefined
  onPress: (editor: Editor) => void
}

/** A command as a menu item: unavailable while it can't run, and focus follows the editor's rules. */
function MenuCommand({ label, shortcut, isAvailable, onPress }: MenuCommandProps): ReactElement {
  const { editor, focusText, isMac } = useRichTextEditorContext('RichTextEditor.CompactControls')
  const available = useEditorSelector(editor, (current) => isAvailable?.(current) ?? true, false)
  const described = shortcut === undefined ? undefined : describeShortcut(shortcut, isMac)
  return (
    <Menu.Item
      disabled={!available}
      textValue={label}
      aria-keyshortcuts={described?.ariaKeyShortcuts || undefined}
      onSelect={(event) => {
        if (editor !== null) {
          onPress(editor)
        }
        // A pointer press leaves focus in the text, as a bar button does. The menu returns focus to
        // "More" as it closes: take it back after that. A key leaves it on "More".
        if (event.detail > 0) {
          setTimeout(focusText, 0)
        }
      }}
    >
      <span>{label}</span>
      <ShortcutHint keys={described?.keys} />
    </Menu.Item>
  )
}

interface MenuToggleProps {
  label: string
  shortcut?: readonly string[] | undefined
  isAvailable?: ((editor: Editor) => boolean) | undefined
  isPressed: (editor: Editor) => boolean
  onPress: (editor: Editor) => void
}

/**
 * A format as a checkbox item, `aria-checked` following the caret. The control that showed its state
 * has gone, so it announces the new state (a bar toggle's `aria-pressed` says it on its own).
 */
function MenuToggle({
  label,
  shortcut,
  isAvailable,
  isPressed,
  onPress,
}: MenuToggleProps): ReactElement {
  const { editor, announce, focusText, isMac, messageOverrides } = useRichTextEditorContext(
    'RichTextEditor.CompactControls',
  )
  const messages = useMessages('richText', messageOverrides)
  const available = useEditorSelector(editor, (current) => isAvailable?.(current) ?? true, false)
  const checked = useEditorSelector(editor, isPressed, false)
  const described = shortcut === undefined ? undefined : describeShortcut(shortcut, isMac)
  return (
    <Menu.CheckboxItem
      checked={checked}
      disabled={!available}
      textValue={label}
      aria-keyshortcuts={described?.ariaKeyShortcuts || undefined}
      onSelect={(event) => {
        if (event.detail > 0) {
          setTimeout(focusText, 0)
        }
      }}
      onCheckedChange={(next) => {
        if (editor === null) {
          return
        }
        onPress(editor)
        announce(next ? messages.formatOn({ name: label }) : messages.formatOff({ name: label }))
      }}
    >
      <span>{label}</span>
      <ShortcutHint keys={described?.keys} />
    </Menu.CheckboxItem>
  )
}

function TextTypeGroup(): ReactElement {
  const { editor, focusText, messageOverrides } = useRichTextEditorContext(
    'RichTextEditor.CompactControls',
  )
  const messages = useMessages('richText', messageOverrides)
  const options = useBlockOptions()
  const labelId = useId()
  const blockKey = useEditorSelector<BlockKey | 'mixed'>(editor, getBlockKey, 'paragraph')
  return (
    <>
      <Menu.GroupLabel id={labelId}>{messages.blockType}</Menu.GroupLabel>
      {/* No item is checked when the selection spans several types. */}
      <Menu.RadioGroup
        aria-labelledby={labelId}
        value={blockKey === 'mixed' ? '' : blockKey}
        onValueChange={(key) => {
          if (editor !== null) {
            applyBlockKey(editor, key as BlockKey)
            // A text type always returns to the text, by key too, as the picker does.
            setTimeout(focusText, 0)
          }
        }}
      >
        {options.map((option) => {
          const iconName = blockIconName(option.key)
          return (
            <Menu.RadioItem key={option.key} value={option.key}>
              {iconName === undefined ? null : <ToolbarIcon name={iconName} />}
              {option.label}
            </Menu.RadioItem>
          )
        })}
      </Menu.RadioGroup>
    </>
  )
}

function TableMenuItems(): ReactElement {
  const { actions, headerRow } = useTableActions()
  return (
    <>
      {actions.map((action) => (
        <MenuCommand
          key={action.label}
          label={action.label}
          isAvailable={action.isAvailable}
          onPress={action.run}
        />
      ))}
      <MenuToggle
        label={headerRow.label}
        isAvailable={headerRow.isAvailable}
        isPressed={headerRow.isPressed}
        onPress={headerRow.run}
      />
    </>
  )
}

interface CompactMenuProps {
  has: (name: DefaultControlName) => boolean
}

function CompactMenu({ has }: CompactMenuProps): ReactElement {
  const { editor, announce, focusText, isMac, registerLinkForm, messageOverrides, state } =
    useRichTextEditorContext('RichTextEditor.CompactControls')
  const messages = useMessages('richText', messageOverrides)
  const { popupSlot } = useToolbarSettings()
  const titleId = useId()
  const [openForm, setOpenForm] = useState<'link' | 'image' | null>(null)
  const isOnLink = useEditorSelector(editor, (current) => current.isActive('link'), false)
  const isOnImage = useEditorSelector(editor, (current) => current.isActive('image'), false)
  const hasTable = useEditorSelector(editor, documentHasTable, false)
  const hasLink = has('link')
  const linkShortcut = describeShortcut(['Mod-k'], isMac)

  useEffect(() => {
    if (!hasLink) {
      return undefined
    }
    return registerLinkForm(() => setOpenForm('link'))
  }, [hasLink, registerLinkForm])

  const sections: ReactNode[] = []
  if (has('undo') || has('redo')) {
    sections.push(
      <Menu.Group key="history">
        <Menu.GroupLabel>{messages.groupHistory}</Menu.GroupLabel>
        {has('undo') ? (
          <MenuCommand
            label={messages.undo}
            shortcut={['Mod-z']}
            isAvailable={(current) => current.can().undo()}
            onPress={(current) => {
              current.chain().undo().run()
              announce(messages.undone)
            }}
          />
        ) : null}
        {has('redo') ? (
          <MenuCommand
            label={messages.redo}
            shortcut={['Mod-Shift-z', 'Ctrl-y']}
            isAvailable={(current) => current.can().redo()}
            onPress={(current) => {
              current.chain().redo().run()
              announce(messages.redone)
            }}
          />
        ) : null}
      </Menu.Group>,
    )
  }
  if (has('blockFormat')) {
    sections.push(
      // One named group: the label and the radio group are siblings, not inside a Menu.Group.
      <TextTypeGroup key="blockFormat" />,
    )
  }
  if (has('underline') || has('strike') || has('code')) {
    sections.push(
      <Menu.Group key="textStyle">
        <Menu.GroupLabel>{messages.groupTextStyle}</Menu.GroupLabel>
        {has('underline') ? (
          <MenuToggle
            label={messages.underline}
            shortcut={['Mod-u']}
            isPressed={(current) => current.isActive('underline')}
            onPress={(current) => {
              current.chain().toggleMark('underline').run()
            }}
          />
        ) : null}
        {has('strike') ? (
          <MenuToggle
            label={messages.strike}
            isPressed={(current) => current.isActive('strike')}
            onPress={(current) => {
              current.chain().toggleMark('strike').run()
            }}
          />
        ) : null}
        {has('code') ? (
          <MenuToggle
            label={messages.code}
            isPressed={(current) => current.isActive('code')}
            onPress={(current) => {
              current.chain().toggleMark('code').run()
            }}
          />
        ) : null}
      </Menu.Group>,
    )
  }
  if (has('indent') || has('outdent')) {
    sections.push(
      <Menu.Group key="lists">
        <Menu.GroupLabel>{messages.groupLists}</Menu.GroupLabel>
        {has('indent') ? (
          <MenuCommand
            label={messages.indent}
            isAvailable={canIndentListItem}
            onPress={(current) => {
              const level = indentListItem(current)
              if (level !== undefined) {
                announce(messages.listLevel({ level }))
              }
            }}
          />
        ) : null}
        {has('outdent') ? (
          <MenuCommand
            label={messages.outdent}
            isAvailable={canOutdentListItem}
            onPress={(current) => {
              const level = outdentListItem(current)
              if (level !== undefined) {
                announce(messages.listLevel({ level }))
              }
            }}
          />
        ) : null}
      </Menu.Group>,
    )
  }
  if (has('link') || has('image') || has('table')) {
    sections.push(
      <Menu.Group key="insert">
        <Menu.GroupLabel>{messages.groupInsert}</Menu.GroupLabel>
        {has('link') ? (
          <Menu.Item
            aria-haspopup="dialog"
            textValue={isOnLink ? messages.linkEditTitle : messages.linkAddTitle}
            aria-keyshortcuts={linkShortcut.ariaKeyShortcuts}
            onSelect={() => setOpenForm('link')}
          >
            <span>{isOnLink ? messages.linkEditTitle : messages.linkAddTitle}</span>
            <ShortcutHint keys={linkShortcut.keys} />
          </Menu.Item>
        ) : null}
        {has('image') ? (
          <Menu.Item aria-haspopup="dialog" onSelect={() => setOpenForm('image')}>
            <span>{isOnImage ? messages.imageEditTitle : messages.imageAddTitle}</span>
          </Menu.Item>
        ) : null}
        {has('table') ? (
          <MenuCommand
            label={messages.insertTable}
            isAvailable={(current) => current.can().insertTable()}
            onPress={(current) => {
              current.chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              // Focus goes to the new table's first cell, and the Table group appears.
              current.view.focus()
              announce(messages.tableInserted({ columns: 3, rows: 3 }))
            }}
          />
        ) : null}
      </Menu.Group>,
    )
  }
  if (has('clearFormatting')) {
    sections.push(
      <MenuCommand
        key="clearFormatting"
        label={messages.clearFormatting}
        isAvailable={hasFormatting}
        onPress={(current) => {
          current.chain().unsetAllMarks().clearNodes().run()
          announce(messages.formattingCleared)
        }}
      />,
    )
  }
  if (has('tableControls') && hasTable) {
    sections.push(
      <Menu.Group key="table">
        <Menu.GroupLabel>{messages.groupTable}</Menu.GroupLabel>
        <TableMenuItems />
      </Menu.Group>,
    )
  }

  return (
    <Menu.Root placement="bottom-end">
      <Popover.Root
        open={openForm !== null && editor !== null}
        placement="bottom-start"
        onOpenChange={(open, details) => {
          if (open) {
            return
          }
          setOpenForm(null)
          // Escape and Cancel put the user back in the text. A press elsewhere leaves focus there.
          if (details.reason === 'escape' || details.reason === 'close-press') {
            focusText()
          }
        }}
      >
        <Popover.Trigger as={MoreTrigger} label={messages.more} isDisabled={state.isDisabled} />
        <Menu.Popup>
          {sections.map((section, index) => (
            <Fragment key={index}>
              {index === 0 ? null : <Menu.Separator />}
              {section}
            </Fragment>
          ))}
        </Menu.Popup>
        {popupSlot === null
          ? null
          : createPortal(
              <Popover.Popup aria-labelledby={titleId} className="kv-rich-text-popover">
                <p id={titleId} className="kv-rich-text-popover-title">
                  {openForm === 'image'
                    ? isOnImage
                      ? messages.imageEditTitle
                      : messages.imageAddTitle
                    : isOnLink
                      ? messages.linkEditTitle
                      : messages.linkAddTitle}
                </p>
                {editor !== null && openForm === 'link' ? (
                  <LinkForm
                    editor={editor}
                    onClose={() => {
                      setOpenForm(null)
                      focusText()
                    }}
                  />
                ) : null}
                {editor !== null && openForm === 'image' ? (
                  <ImageForm
                    editor={editor}
                    onClose={() => {
                      setOpenForm(null)
                      focusText()
                    }}
                  />
                ) : null}
              </Popover.Popup>,
              popupSlot,
            )}
      </Popover.Root>
    </Menu.Root>
  )
}

/**
 * The compact toolbar's controls: Bold, Italic, Bulleted list and Numbered list on the bar, then
 * a "More" menu button holding every other control once, in the default toolbar's order and groups
 * (Underline, Strikethrough, Code and Header row as checkbox items, the text types as radio items,
 * Link and Image opening their forms under "More"). The split is fixed, not measured, so the arrow
 * keys reach the same controls at every width. One left-over control stays on the bar and there is
 * no "More"; none, no "More". `include` and `exclude` work as on `DefaultControls`.
 *
 * Opt in with it as the toolbar's children. The default toolbar wraps and hides nothing.
 *
 * @example
 * <RichTextEditor.Toolbar>
 *   <RichTextEditor.CompactControls exclude={['table']} />
 * </RichTextEditor.Toolbar>
 */
export function CompactControls({ include, exclude }: DefaultControlsProps): ReactElement {
  const { editor, features } = useRichTextEditorContext('RichTextEditor.CompactControls')
  const hasTable = useEditorSelector(editor, documentHasTable, false)
  const has = (name: DefaultControlName): boolean =>
    isProvided(name, features) &&
    (include === undefined || include.includes(name)) &&
    !(exclude?.includes(name) ?? false)

  const onBar = barControls.filter(has)
  const inMenu = menuControls.filter(has)
  const hasTableCommands = has('tableControls') && hasTable
  // One command is not a menu: it joins the bar, in its own group. The Table group is eight.
  const lone = !hasTableCommands && inMenu.length === 1 ? inMenu : []
  const hasMenu = lone.length === 0 && (inMenu.length > 0 || hasTableCommands)

  return (
    <>
      <DefaultControls include={[...onBar, ...lone]} />
      {hasMenu ? <CompactMenu has={has} /> : null}
    </>
  )
}
CompactControls.displayName = 'RichTextEditor.CompactControls'
