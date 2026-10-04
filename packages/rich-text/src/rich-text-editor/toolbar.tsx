'use client'
import { Toolbar } from '@kvirn-ui/react'
import type { ToolbarGroupProps, ToolbarRootProps } from '@kvirn-ui/react'
import { FieldContext, useMergedRef, useMessages, warnOnce } from '@kvirn-ui/react/internal'
import { useContext, useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactElement, ReactNode } from 'react'
import { DefaultControls } from './default-controls.tsx'
import { RichTextToolbarContext, useRichTextEditorContext } from './rich-text-editor-context.ts'
import type { RichTextLabels } from './rich-text-editor-context.ts'

export interface RichTextEditorToolbarProps extends Omit<
  ToolbarRootProps,
  'aria-controls' | 'children'
> {
  /**
   * How the icon controls show their names, for this toolbar. Default: the Root's `labels`
   * (`'icon'`). `'icon-and-text'` adds `kv-toolbar--labels`.
   */
  labels?: RichTextLabels | undefined
  /** Whether icon-only controls get a tooltip, for this toolbar. Default: the Root's `tooltips`. */
  tooltips?: boolean | undefined
  /** Your controls. Without any, the toolbar is `<RichTextEditor.DefaultControls />`. */
  children?: ReactNode
}

/** Moves focus to the toolbar's Tab stop: the control that last had focus, else the first. */
function focusToolbarStop(toolbar: HTMLElement | null): boolean {
  if (toolbar === null) {
    return false
  }
  const target =
    toolbar.querySelector<HTMLElement>('[tabindex="0"]') ??
    toolbar.querySelector<HTMLElement>('button, [role="combobox"]')
  target?.focus()
  return target !== null
}

/**
 * The formatting toolbar (APG Toolbar, contract: rich-text-editor.a11y.md): a `Toolbar.Root` with
 * one Tab stop and the arrow keys between its controls, attached to the top of the editor's box.
 *
 * - **Named** "Formatering" plus the Field's label ("Formatering Beskrivning"), so two editors on
 *   a page have different toolbars. It has `aria-controls` pointing at the editable text, and
 *   `aria-keyshortcuts="Alt+F10"`.
 * - **Alt+F10** (Option+F10) in the text moves focus to it, and **Escape** in it moves focus back
 *   to the text, at the selection, unless a popup or tooltip is open and takes the Escape first.
 * - **Wraps** group by group: nothing is hidden behind a "More" button.
 * - A pointer press on a control keeps focus in the text. After a keyboard command focus stays on
 *   the control, so several formats can be set in a row.
 * - Not rendered while the editor is read-only, where there is nothing to format. While it is
 *   disabled the controls are natively disabled and out of the Tab order.
 * - Link and Image popovers render into a slot **after** the toolbar, as its siblings.
 *
 * @example
 * <RichTextEditor.Root name="description" labels="icon-and-text">
 *   <RichTextEditor.Toolbar />
 *   <RichTextEditor.Content />
 * </RichTextEditor.Root>
 */
export function RichTextEditorToolbar({
  labels,
  tooltips,
  children,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ref,
  ...otherProps
}: RichTextEditorToolbarProps): ReactElement | null {
  const context = useRichTextEditorContext('RichTextEditor.Toolbar')
  const messages = useMessages('richText', context.messageOverrides)
  const field = useContext(FieldContext)
  const nameId = useId()
  const [popupSlot, setPopupSlot] = useState<HTMLElement | null>(null)
  const toolbarElement = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef<HTMLDivElement>(ref, toolbarElement)
  const effectiveLabels = labels ?? context.labels
  const effectiveTooltips = tooltips ?? context.tooltips
  const { registerToolbar, focusText } = context

  useEffect(
    () => registerToolbar(() => focusToolbarStop(toolbarElement.current)),
    [registerToolbar],
  )
  useEffect(() => {
    if (!effectiveTooltips && effectiveLabels === 'icon') {
      warnOnce(
        'rich-text-editor-icon-only-without-tooltips',
        'A RichTextEditor toolbar has icon-only controls and no tooltips, so nothing shows their names (DESIGN.md allows icon-only buttons in a formatting toolbar only with tooltips). Keep tooltips on, or set labels="icon-and-text". Touch screens have no tooltips either, which is one more reason to show the names.',
      )
    }
  }, [effectiveTooltips, effectiveLabels])

  // Read-only text has nothing to format: no toolbar, and Tab goes straight to the text.
  if (context.state.isReadOnly) {
    return null
  }

  // "Formatering Beskrivning": the toolbar's own name, then the Field's label, so two editors on a
  // page have different names. Outside a Field the name stands alone.
  const hasOwnName = ariaLabel !== undefined || ariaLabelledBy !== undefined
  const nameProps = hasOwnName
    ? { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy }
    : field === null
      ? { 'aria-label': messages.toolbar }
      : { 'aria-labelledby': `${nameId} ${field.labelId}` }

  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    otherProps.onKeyDownCapture?.(event)
    if (
      event.key !== 'Escape' ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return
    }
    // React events bubble out of a portal, so a key in a popover's form (rendered after the
    // toolbar, but in its React tree) arrives here too: it is the popover's, not the toolbar's.
    const target = event.target
    if (!(target instanceof Node) || !(toolbarElement.current?.contains(target) ?? false)) {
      return
    }
    // A control that has its popup open (the picker) closes it first, and a tooltip takes the
    // Escape to hide itself. Only a bare Escape on the toolbar goes back to the text.
    if (target instanceof Element && target.getAttribute('aria-expanded') === 'true') {
      return
    }
    if (toolbarElement.current?.querySelector('[role="tooltip"]:popover-open') != null) {
      return
    }
    event.preventDefault()
    focusText()
  }

  return (
    <RichTextToolbarContext
      value={{ labels: effectiveLabels, tooltips: effectiveTooltips, popupSlot }}
    >
      {!hasOwnName && field !== null ? (
        <span id={nameId} className="kv-rich-text-toolbar-name">
          {messages.toolbar}
        </span>
      ) : null}
      <Toolbar.Root
        {...otherProps}
        {...nameProps}
        ref={mergedRef}
        className={[
          'kv-toolbar--attached',
          effectiveLabels === 'icon-and-text' ? 'kv-toolbar--labels' : undefined,
          className,
        ]
          .filter((name) => name !== undefined && name !== '')
          .join(' ')}
        aria-controls={context.contentId}
        aria-keyshortcuts="Alt+F10"
        onKeyDownCapture={onKeyDownCapture}
      >
        {children ?? <DefaultControls />}
      </Toolbar.Root>
      <div ref={setPopupSlot} className="kv-rich-text-popups" />
    </RichTextToolbarContext>
  )
}
RichTextEditorToolbar.displayName = 'RichTextEditor.Toolbar'

/**
 * A named group of toolbar controls (`Toolbar.Group`, a `ButtonGroup`): a screen reader says its
 * name as focus enters it. A group in a toolbar needs a name.
 */
export function RichTextEditorGroup(props: ToolbarGroupProps): ReactElement {
  return <Toolbar.Group {...props} />
}
RichTextEditorGroup.displayName = 'RichTextEditor.Group'
