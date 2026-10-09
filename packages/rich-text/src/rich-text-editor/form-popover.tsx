'use client'
import { Popover } from '@kvirn-ui/react'
import type { PopoverChangeDetails } from '@kvirn-ui/react'
import { useId } from 'react'
import { createPortal } from 'react-dom'
import type { ReactElement, ReactNode } from 'react'
import {
  ControlTooltip,
  keepFocusInText,
  PopoverToolbarItem,
  useToolbarSettings,
} from './command-controls.tsx'
import { useRichTextEditorContext } from './rich-text-editor-context.ts'
import { describeShortcut } from './shortcuts.ts'

export interface FormPopoverProps {
  /** The trigger's name, in the page's language. */
  label: string
  /** The trigger's icon. */
  icon: ReactNode
  /** The trigger's shortcut, as Tiptap writes it. */
  shortcut?: readonly string[] | undefined
  /** The popup's name: its heading. */
  title: string
  isOpen: boolean
  onOpenChange: (open: boolean, details: PopoverChangeDetails) => void
  /** The form, rendered only while the popup is open, so every opening starts from the document. */
  children: ReactNode
}

/**
 * Internal. A toolbar button that opens a small form in a non-modal Popover (Link, Image). The
 * trigger is a toolbar item. The popup is rendered into the slot after the toolbar, so it is a
 * sibling of the toolbar, not inside it, and Tab from its last control goes to the text (design spec
 * §5.5). `aria-haspopup`, `aria-expanded` and `aria-controls` come from the Popover.
 */
export function FormPopover({
  label,
  icon,
  shortcut,
  title,
  isOpen,
  onOpenChange,
  children,
}: FormPopoverProps): ReactElement {
  const context = useRichTextEditorContext('RichTextEditor controls')
  const { labels, tooltips, popupSlot } = useToolbarSettings()
  const titleId = useId()
  const described = shortcut === undefined ? undefined : describeShortcut(shortcut, context.isMac)
  const isNameShown = labels === 'icon-and-text'
  const isDisabled = context.state.isDisabled

  const trigger = (
    <ControlTooltip
      label={label}
      shortcutKeys={described?.keys}
      isNameShown={isNameShown}
      hasTooltip={tooltips && !isDisabled && (!isNameShown || described !== undefined)}
      control={PopoverToolbarItem}
      controlProps={{
        className: isNameShown ? 'kv-button' : 'kv-button kv-button--icon-only',
        'aria-label': isNameShown ? undefined : label,
        'aria-keyshortcuts': described?.ariaKeyShortcuts || undefined,
        onMouseDown: keepFocusInText,
        disabled: isDisabled,
        focusableWhenDisabled: !isDisabled,
        children: isNameShown ? (
          <>
            {icon}
            <span className="kv-rich-text-control-label">{label}</span>
          </>
        ) : (
          icon
        ),
      }}
    />
  )

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange} placement="bottom-start">
      {trigger}
      {popupSlot === null
        ? null
        : createPortal(
            <Popover.Popup aria-labelledby={titleId} className="kv-rich-text-popover">
              <p id={titleId} className="kv-rich-text-popover-title">
                {title}
              </p>
              {isOpen ? children : null}
            </Popover.Popup>,
            popupSlot,
          )}
    </Popover.Root>
  )
}
