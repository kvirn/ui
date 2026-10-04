'use client'
import type { RovingOrientation } from '@kvirn-ui/core'
import { useContext, useEffect, useId, useRef } from 'react'
import type {
  ComponentPropsWithRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  RefCallback,
} from 'react'
import { Button } from '../button/button.tsx'
import type { ButtonProps } from '../button/button.tsx'
import { ButtonGroup } from '../button-group/button-group.tsx'
import type { ButtonGroupProps } from '../button-group/button-group.tsx'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { Toggle } from '../toggle/toggle.tsx'
import type { ToggleProps } from '../toggle/toggle.tsx'
import { ToolbarContext } from './toolbar-context.ts'
import { useToolbar } from './use-toolbar.ts'
import type { ToolbarItemPartProps, UseToolbarOptions } from './use-toolbar.ts'

/** What `render` receives as its second argument, for `Toolbar.Root`. */
export interface ToolbarState {
  orientation: RovingOrientation
}

/** What `render` receives as its second argument, for `Toolbar.Item`. */
export interface ToolbarItemState {
  /** This item is the one the Tab key reaches (`tabindex="0"`). */
  isTabStop: boolean
}

/** `role` and `aria-orientation` are left out: the hook sets them. */
export interface ToolbarRootProps
  extends Omit<ComponentPropsWithRef<'div'>, 'role' | 'aria-orientation'>, UseToolbarOptions {
  /** Change the element. It gets the role, the class and the keys. */
  render?: RenderProp<ComponentPropsWithRef<'div'>, ToolbarState> | undefined
}

/** A `Button` that is a toolbar item. `focusableWhenDisabled` defaults to `true` here. */
export type ToolbarButtonProps = ButtonProps
/** A `Toggle` that is a toolbar item. `focusableWhenDisabled` defaults to `true` here. */
export type ToolbarToggleProps = ToggleProps
/** A `ButtonGroup` inside a toolbar. Give it a name. */
export type ToolbarGroupProps = ButtonGroupProps

export interface ToolbarItemProps extends ComponentPropsWithRef<'button'> {
  /**
   * The control that becomes an item: `render={<Listbox.Trigger aria-label="Texttyp" />}`,
   * `render={<Popover.Trigger />}`, or `render={<Link.Root href="…" />}`. It must be focusable by
   * itself. Without `render` it is a `<button type="button">`. The toolbar's `tabindex` wins over the
   * element's own. A Listbox in a toolbar needs `native="never"` on its `Listbox.Root`: the native
   * `<select>` that `native="auto"` renders on a touch device replaces this item.
   * With `disabled`, a text `<input>` stays editable: make it `readOnly` instead.
   */
  render?: RenderProp<ComponentPropsWithRef<'button'>, ToolbarItemState> | undefined
  /**
   * With `disabled`: keep the item focusable, with `aria-disabled="true"`, so the arrows reach it
   * and a screen reader says it is unavailable. Activation (click, Enter and Space) is blocked.
   * Default `true`, as for `Toolbar.Button`. `false` makes `disabled` native: the item can't take
   * focus, so the arrows skip it and it is never the Tab stop.
   */
  focusableWhenDisabled?: boolean | undefined
}

function warnOutsideRoot(part: string): void {
  warnOnce(
    `toolbar-${part.toLowerCase()}-outside-root`,
    `A Toolbar.${part} is outside a Toolbar.Root, so it is an ordinary control with no roving tabindex and no arrow keys. Put it inside <Toolbar.Root>.`,
  )
}

interface ToolbarItemRegistration {
  /** Registers the element. `null` outside a toolbar. */
  itemRef: RefCallback<HTMLElement> | null
  /** The roving props to merge over the part's own. Empty outside a toolbar. */
  itemProps: Partial<Omit<ToolbarItemPartProps, 'ref'>>
}

/**
 * Internal. Registers a part as an item of the nearest toolbar. The ref is stable and the key is
 * the part's own `useId()`, so React never re-registers it.
 */
function useToolbarItem(part: string): ToolbarItemRegistration {
  const toolbar = useContext(ToolbarContext)
  const key = useId()
  const isInToolbar = toolbar !== null
  useEffect(() => {
    if (!isInToolbar) {
      warnOutsideRoot(part)
    }
  }, [isInToolbar, part])
  if (toolbar === null) {
    return { itemRef: null, itemProps: {} }
  }
  const { ref, ...itemProps } = toolbar.getItemProps(key)
  return { itemRef: ref, itemProps }
}

/**
 * The toolbar: a `<div role="toolbar">` with one Tab stop and the arrow keys between its controls
 * (APG Toolbar, contract: toolbar.a11y.md). Put `Toolbar.Button`, `Toolbar.Toggle` and
 * `Toolbar.Item` in it, grouped with `Toolbar.Group`.
 *
 * **Name it** with `aria-label` or `aria-labelledby`, and use it for three or more controls. Set
 * `aria-controls` to the element it acts on, when there is one. Left and Right move between the
 * controls (Down and Up when `orientation="vertical"`), Home and End go to the ends, and the arrows
 * wrap unless `loop` is `false`. Tab returns to the control that last had focus.
 *
 * @example
 * <Toolbar.Root aria-label="Formatering" aria-controls={editorId}>
 *   <Toolbar.Group aria-label="Textstil">
 *     <Toolbar.Toggle aria-label="Fetstil" pressed={isBold} onPressedChange={setIsBold}>
 *       <Icon name="bold" />
 *     </Toolbar.Toggle>
 *   </Toolbar.Group>
 * </Toolbar.Root>
 */
export function ToolbarRoot({
  orientation,
  loop,
  render,
  ref,
  ...otherProps
}: ToolbarRootProps): ReactElement {
  const toolbar = useToolbar({ orientation, loop })
  const elementRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef(
    useMergedRef<HTMLDivElement>(ref, toolbar.toolbarProps.ref),
    elementRef,
  )
  const { itemCount } = toolbar

  useEffect(() => {
    const element = elementRef.current
    if (
      element !== null &&
      !(element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'))
    ) {
      warnOnce(
        'toolbar-without-name',
        'A <Toolbar.Root> has no name, so a screen reader user hears "toolbar" and nothing else. Give it aria-label from your translations, or aria-labelledby (WCAG 4.1.2).',
      )
    }
  })

  useEffect(() => {
    // Zero is the first commit: the items register after it.
    if (itemCount > 0 && itemCount < 3) {
      warnOnce(
        'toolbar-with-few-controls',
        `A <Toolbar.Root> has ${itemCount} control${itemCount === 1 ? '' : 's'}. APG says to use a toolbar for three or more: with fewer, separate buttons are easier to find. Use Button or ButtonGroup instead.`,
      )
    }
  }, [itemCount])

  return (
    <ToolbarContext.Provider value={toolbar}>
      {renderPart({
        render,
        defaultElement: 'div',
        partProps: { ...mergeProps(otherProps, toolbar.toolbarProps), ref: mergedRef },
        state: { orientation: toolbar.orientation },
      })}
    </ToolbarContext.Provider>
  )
}
ToolbarRoot.displayName = 'Toolbar.Root'

/**
 * A `Button` that is one of the toolbar's items. Same props as Button, and a disabled one stays
 * focusable with `aria-disabled` (`focusableWhenDisabled` defaults to `true`), so the arrows
 * reach it and a screen reader says it is unavailable. Pressing it does nothing.
 */
export function ToolbarButton({
  focusableWhenDisabled = true,
  ref,
  ...otherProps
}: ToolbarButtonProps): ReactElement {
  const { itemRef, itemProps } = useToolbarItem('Button')
  const mergedRef = useMergedRef<HTMLButtonElement>(ref, itemRef)
  return (
    <Button
      focusableWhenDisabled={focusableWhenDisabled}
      {...mergeProps(otherProps, itemProps)}
      ref={mergedRef}
    />
  )
}
ToolbarButton.displayName = 'Toolbar.Button'

/**
 * A `Toggle` that is one of the toolbar's items: `aria-pressed`, and the name never changes with
 * the state. Same props as Toggle, and a disabled one stays focusable with `aria-disabled`.
 */
export function ToolbarToggle({
  focusableWhenDisabled = true,
  ref,
  ...otherProps
}: ToolbarToggleProps): ReactElement {
  const { itemRef, itemProps } = useToolbarItem('Toggle')
  const mergedRef = useMergedRef<HTMLButtonElement>(ref, itemRef)
  return (
    <Toggle
      focusableWhenDisabled={focusableWhenDisabled}
      {...mergeProps(otherProps, itemProps)}
      ref={mergedRef}
    />
  )
}
ToolbarToggle.displayName = 'Toolbar.Toggle'

const interactiveRoles = new Set([
  'button',
  'checkbox',
  'combobox',
  'link',
  'menuitem',
  'radio',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
])

/** Whether the element can take focus by itself, not because a `tabindex` was put on it. */
function isFocusableByItself(element: HTMLElement): boolean {
  if (element.isContentEditable) {
    return true
  }
  const tag = element.tagName
  if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY'].includes(tag)) {
    return true
  }
  if (tag === 'A' && element.hasAttribute('href')) {
    return true
  }
  return interactiveRoles.has(element.getAttribute('role') ?? '')
}

/** Enter and Space, the keys that activate a control. */
const activationKeys = new Set(['Enter', ' '])

/**
 * Makes any focusable control a toolbar item: a Listbox trigger, a Popover trigger, a Link or an
 * `<input>`. Without `render` it is a `<button type="button">`. The toolbar's roving `tabindex`
 * wins over the element's own (`Listbox.Trigger` honours a `tabIndex` it is given).
 * Its keys stay its own: a key it handles is not taken, and a text field keeps the arrows, Home and
 * End.
 *
 * **`disabled`** works as for `Toolbar.Button`: the item stays focusable with `aria-disabled="true"`
 * and `data-disabled`, and a click, Enter or Space does nothing, also for the rendered element's own
 * handlers. `focusableWhenDisabled={false}` makes it natively disabled instead, so the arrows skip
 * it. A Listbox is disabled on its own Root, not here. It only blocks activation: a text `<input>`
 * stays editable, so make a field `readOnly`.
 *
 * @example
 * <Toolbar.Item render={<Popover.Trigger />}>Länk</Toolbar.Item>
 * // A Listbox in a toolbar: <Listbox.Root native="never" …><Toolbar.Item render={<Listbox.Trigger aria-label="Texttyp" />} /> …
 */
export function ToolbarItem({
  render,
  ref,
  disabled = false,
  focusableWhenDisabled = true,
  ...otherProps
}: ToolbarItemProps): ReactElement {
  const { itemRef, itemProps } = useToolbarItem('Item')
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef<HTMLButtonElement>(
    useMergedRef<HTMLButtonElement>(ref, itemRef),
    elementRef,
  )
  const wantedTabIndex = itemProps.tabIndex

  useEffect(() => {
    const element = elementRef.current
    if (element !== null && !isFocusableByItself(element)) {
      warnOnce(
        `toolbar-item-not-focusable:${element.tagName.toLowerCase()}`,
        `A <Toolbar.Item> rendered a <${element.tagName.toLowerCase()}>, which isn't focusable by itself, so keyboard users can't operate it (WCAG 2.1.1). Render a button, a link, an input or an element with an interactive role.`,
      )
    }
    if (
      element !== null &&
      focusableWhenDisabled &&
      element.hasAttribute('disabled') &&
      isFocusableByItself(element)
    ) {
      warnOnce(
        `toolbar-item-natively-disabled:${element.tagName.toLowerCase()}`,
        `A <Toolbar.Item> rendered a natively disabled <${element.tagName.toLowerCase()}>, which can't take focus: the arrows skip it, keyboard and screen reader users can't find it, and if it is the first control the Tab stop has to move on (WCAG 2.1.1, 2.4.3). Pass disabled to the Toolbar.Item instead: it stays focusable with aria-disabled and does nothing when pressed. Use focusableWhenDisabled={false} only when the whole toolbar is disabled.`,
      )
    }
  })

  const isFocusableDisabled = disabled && focusableWhenDisabled
  const disabledProps = isFocusableDisabled
    ? {
        'aria-disabled': 'true' as const,
        'data-disabled': '' as const,
        // Capture, so the rendered element's own handlers (a Popover trigger's) never run.
        onClickCapture: (event: MouseEvent<HTMLElement>) => {
          event.preventDefault()
          event.stopPropagation()
        },
        onKeyDownCapture: (event: KeyboardEvent<HTMLElement>) => {
          if (activationKeys.has(event.key)) {
            event.preventDefault()
            event.stopPropagation()
          }
        },
      }
    : disabled
      ? { disabled: true, 'data-disabled': '' as const }
      : {}

  return renderPart({
    render,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(
        render === undefined ? { type: 'button' as const } : {},
        otherProps,
        disabledProps,
        itemProps,
      ),
      ref: mergedRef,
    },
    state: { isTabStop: wantedTabIndex === 0 },
  })
}
ToolbarItem.displayName = 'Toolbar.Item'

/**
 * A `ButtonGroup` in the toolbar: a `role="group"` that needs a name, so a screen reader says
 * "Textstil, group" as focus enters it. The theme draws a hairline between groups.
 */
export function ToolbarGroup(props: ToolbarGroupProps): ReactElement {
  return <ButtonGroup {...props} />
}
ToolbarGroup.displayName = 'Toolbar.Group'

/** A toolbar: one Tab stop, and the arrow keys between its controls. */
export const Toolbar = {
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Toggle: ToolbarToggle,
  Item: ToolbarItem,
  Group: ToolbarGroup,
} as const
