'use client'
import { Kbd, Listbox, Popover, Toolbar, Tooltip } from '@kvirn-ui/react'
import type { ToolbarButtonProps, ToolbarItemProps, ToolbarToggleProps } from '@kvirn-ui/react'
import { createElement, useContext } from 'react'
import type { Editor } from '@tiptap/core'
import type { ComponentPropsWithRef, ElementType, MouseEvent, ReactElement, ReactNode } from 'react'
import { RichTextToolbarContext, useRichTextEditorContext } from './rich-text-editor-context.ts'
import { useEditorSelector } from './use-editor-selector.ts'
import type { RichTextLabels } from './rich-text-editor-context.ts'
import { describeShortcut } from './shortcuts.ts'

/** What every toolbar control takes: its name, an icon, a shortcut, and when it is available. */
export interface CommandControlOptions {
  /**
   * The control's name, in the page's language. With `labels="icon"` it is the `aria-label` and
   * the tooltip's first line, and with `labels="icon-and-text"` it is the visible text. A control
   * with no `icon` always shows it as text.
   */
  label: string
  /** The icon, shown in both label modes: a `<ToolbarIcon name="bold" />`, or your own. */
  icon?: ReactNode
  /**
   * The shortcut, written as Tiptap writes it: `['Mod-b']`. `Mod` is Command on macOS and Control
   * elsewhere. It sets `aria-keyshortcuts`, and is shown in the tooltip. The first is the one shown.
   * It does not bind the key: bind it in the extension.
   */
  shortcut?: readonly string[] | undefined
  /**
   * Whether the command can run now, read from the editor on every change. When it can't, the
   * control is unavailable: `aria-disabled`, still focusable, and pressing it does nothing.
   * Default: always.
   */
  isAvailable?: ((editor: Editor) => boolean) | undefined
}

export interface CommandButtonProps
  extends
    CommandControlOptions,
    Omit<ToolbarButtonProps, 'children' | 'onClick' | 'aria-label' | 'aria-keyshortcuts'> {
  /**
   * Runs the command, with the Tiptap editor. For a keyboard user focus stays on the button, so
   * several commands can run in a row: chain `.focus()` only if the command should move focus into
   * the text.
   */
  onPress: (editor: Editor) => void
}

export interface CommandToggleProps
  extends
    CommandControlOptions,
    Omit<
      ToolbarToggleProps,
      | 'children'
      | 'pressed'
      | 'defaultPressed'
      | 'onPressedChange'
      | 'aria-label'
      | 'aria-keyshortcuts'
    > {
  /** Whether the format is on at the caret or in the selection, read from the editor on every change. */
  isPressed: (editor: Editor) => boolean
  /** Runs the command, with the Tiptap editor. See `CommandButton`. */
  onPress: (editor: Editor) => void
}

/** The label mode, tooltips and popup slot a control sees: the toolbar's own, else the editor's. */
export function useToolbarSettings(): {
  labels: RichTextLabels
  tooltips: boolean
  popupSlot: HTMLElement | null
} {
  const editorContext = useRichTextEditorContext('RichTextEditor controls')
  const toolbar = useContext(RichTextToolbarContext)
  return {
    labels: toolbar?.labels ?? editorContext.labels,
    tooltips: toolbar?.tooltips ?? editorContext.tooltips,
    popupSlot: toolbar?.popupSlot ?? null,
  }
}

/** A pointer press keeps focus, and so the selection, in the text. */
export function keepFocusInText(event: MouseEvent<HTMLElement>): void {
  event.preventDefault()
}

/** Internal. A Popover trigger that is a toolbar item, so a Tooltip.Trigger can take it as `as`. */
export function PopoverToolbarItem(
  props: Omit<ToolbarItemProps<typeof Popover.Trigger>, 'as'>,
): ReactElement {
  return <Toolbar.Item as={Popover.Trigger} {...props} />
}

/** Internal. A Listbox trigger that is a toolbar item, so a Tooltip.Trigger can take it as `as`. */
export function ListboxToolbarItem(
  props: Omit<ToolbarItemProps<typeof Listbox.Trigger>, 'as'>,
): ReactElement {
  return <Toolbar.Item as={Listbox.Trigger} {...props} />
}

interface ControlTooltipProps<Component extends ElementType> {
  label: string
  shortcutKeys: readonly string[] | undefined
  isNameShown: boolean
  /** Whether the control gets a tooltip at all. */
  hasTooltip: boolean
  /** The control's component, which becomes the tooltip's trigger. */
  control: Component
  controlProps: ComponentPropsWithRef<Component>
}

/**
 * Wraps a control in a Tooltip: its name and shortcut when the name isn't visible, only its
 * shortcut when it is. The name line is hidden from assistive technology (the control has that
 * name), and the shortcut line is the control's description.
 */
export function ControlTooltip<Component extends ElementType>({
  label,
  shortcutKeys,
  isNameShown,
  hasTooltip,
  control,
  controlProps,
}: ControlTooltipProps<Component>): ReactElement {
  if (!hasTooltip) {
    return createElement(control, controlProps)
  }
  return (
    <Tooltip.Root>
      {createElement(Tooltip.Trigger, { as: control, ...controlProps })}
      <Tooltip.Popup>
        {isNameShown ? null : <Tooltip.Name>{label}</Tooltip.Name>}
        {shortcutKeys === undefined ? null : (
          <Tooltip.Shortcut>
            {shortcutKeys.map((key, index) => (
              <Kbd key={`${index}:${key}`}>{key}</Kbd>
            ))}
          </Tooltip.Shortcut>
        )}
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}

/** What a control needs from the editor, read as flat values so typing re-renders only what changed. */
function useControlState(
  isAvailable: CommandControlOptions['isAvailable'],
  isPressed: ((editor: Editor) => boolean) | undefined,
): { isAvailable: boolean; isPressed: boolean } {
  const { editor } = useRichTextEditorContext('RichTextEditor controls')
  const available = useEditorSelector(editor, (current) => isAvailable?.(current) ?? true, false)
  const pressed = useEditorSelector(editor, (current) => isPressed?.(current) ?? false, false)
  return { isAvailable: available, isPressed: pressed }
}

/** Shared by the button and the toggle: the content, the name, the shortcut and the tooltip. */
function usePresentation({
  label,
  icon,
  shortcut,
}: Pick<CommandControlOptions, 'label' | 'icon' | 'shortcut'>) {
  const context = useRichTextEditorContext('RichTextEditor controls')
  const { labels, tooltips } = useToolbarSettings()
  const described = shortcut === undefined ? undefined : describeShortcut(shortcut, context.isMac)
  // A control with no icon is a text button in both modes (the table actions).
  const isNameShown = icon === undefined || labels === 'icon-and-text'
  const children =
    icon === undefined ? (
      label
    ) : isNameShown ? (
      <>
        {icon}
        <span className="kv-rich-text-control-label">{label}</span>
      </>
    ) : (
      icon
    )
  return {
    isDisabled: context.state.isDisabled,
    isNameShown,
    children,
    ariaLabel: isNameShown ? undefined : label,
    ariaKeyShortcuts: described?.ariaKeyShortcuts || undefined,
    shortcutKeys: described?.keys,
    hasTooltip: tooltips && !context.state.isDisabled && (!isNameShown || described !== undefined),
  }
}

/**
 * A toolbar button that runs a command on the Tiptap editor: undo, clear formatting, or your own.
 * It is a `Toolbar.Button`, so it is one of the toolbar's roving items, and it is unavailable
 * (`aria-disabled`, still focusable) while `isAvailable` says it can't run. A pointer press keeps
 * focus and the selection in the text. Icon-only controls get a tooltip with their name and shortcut.
 *
 * @example
 * <RichTextEditor.CommandButton
 *   label="Ångra"
 *   icon={<RichTextEditor.Icon name="undo" />}
 *   shortcut={['Mod-z']}
 *   isAvailable={(editor) => editor.can().undo()}
 *   onPress={(editor) => editor.chain().undo().run()}
 * />
 */
export function CommandButton({
  label,
  icon,
  shortcut,
  isAvailable,
  onPress,
  disabled = false,
  className,
  ...otherProps
}: CommandButtonProps): ReactElement {
  const { editor } = useRichTextEditorContext('RichTextEditor.CommandButton')
  const state = useControlState(isAvailable, undefined)
  const presentation = usePresentation({ label, icon, shortcut })
  const isUnavailable = disabled || !state.isAvailable
  return (
    <ControlTooltip
      label={label}
      shortcutKeys={presentation.shortcutKeys}
      isNameShown={presentation.isNameShown}
      hasTooltip={presentation.hasTooltip}
      control={Toolbar.Button}
      controlProps={{
        ...otherProps,
        className: [presentation.isNameShown ? undefined : 'kv-button--icon-only', className]
          .filter((name) => name !== undefined && name !== '')
          .join(' '),
        ...(presentation.isNameShown ? {} : { 'aria-label': presentation.ariaLabel }),
        'aria-keyshortcuts': presentation.ariaKeyShortcuts,
        disabled: isUnavailable || presentation.isDisabled,
        focusableWhenDisabled: !presentation.isDisabled,
        onMouseDown: keepFocusInText,
        onClick: () => {
          if (editor !== null && !isUnavailable) {
            onPress(editor)
          }
        },
        children: presentation.children,
      }}
    />
  )
}
CommandButton.displayName = 'RichTextEditor.CommandButton'

/**
 * A toolbar toggle for a format that is on or off at the caret: bold, a list, or your own. It is a
 * `Toolbar.Toggle` (`aria-pressed`, and the name never changes with the state), so it is one of
 * the toolbar's roving items. `isPressed` is read from the editor on every change, so the button
 * follows the caret. Nothing is announced for a press: `aria-pressed` on the focused button says it.
 *
 * @example
 * <RichTextEditor.CommandToggle
 *   label="Markera"
 *   icon={<RichTextEditor.Icon paths={highlightPaths} />}
 *   isPressed={(editor) => editor.isActive('highlight')}
 *   onPress={(editor) => editor.chain().toggleHighlight().run()}
 * />
 */
export function CommandToggle({
  label,
  icon,
  shortcut,
  isAvailable,
  isPressed,
  onPress,
  disabled = false,
  className,
  ...otherProps
}: CommandToggleProps): ReactElement {
  const { editor } = useRichTextEditorContext('RichTextEditor.CommandToggle')
  const state = useControlState(isAvailable, isPressed)
  const presentation = usePresentation({ label, icon, shortcut })
  const isUnavailable = disabled || !state.isAvailable
  return (
    <ControlTooltip
      label={label}
      shortcutKeys={presentation.shortcutKeys}
      isNameShown={presentation.isNameShown}
      hasTooltip={presentation.hasTooltip}
      control={Toolbar.Toggle}
      controlProps={{
        ...otherProps,
        className: [presentation.isNameShown ? undefined : 'kv-button--icon-only', className]
          .filter((name) => name !== undefined && name !== '')
          .join(' '),
        ...(presentation.isNameShown ? {} : { 'aria-label': presentation.ariaLabel }),
        'aria-keyshortcuts': presentation.ariaKeyShortcuts,
        pressed: state.isPressed,
        disabled: isUnavailable || presentation.isDisabled,
        focusableWhenDisabled: !presentation.isDisabled,
        onMouseDown: keepFocusInText,
        onPressedChange: () => {
          if (editor !== null && !isUnavailable) {
            onPress(editor)
          }
        },
        children: presentation.children,
      }}
    />
  )
}
CommandToggle.displayName = 'RichTextEditor.CommandToggle'
