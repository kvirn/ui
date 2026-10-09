'use client'
import { useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import type {
  ComponentPropsWithRef,
  ElementType,
  FocusEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsComponent, AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { ToolbarContext } from '../toolbar/toolbar-context.ts'
import { MenuContext, MenuGroupContext, MenuRadioGroupContext } from './menu-context.ts'
import { useMenu } from './use-menu.ts'
import type { MenuItemKind, UseMenuOptions } from './use-menu.ts'

export type { MenuChangeDetails, MenuChangeReason } from './use-menu.ts'

const sectionTags = ['div', 'section'] as const
const groupLabelTags = ['div', 'span', 'p'] as const

export interface MenuRootProps extends UseMenuOptions {
  children?: ReactNode
}

/**
 * `as` is a component that renders a button, such as `as={Button}`: its props are plain props of
 * the trigger. Without `as` it is a `<button type="button">`.
 */
export type MenuTriggerProps<Component extends ElementType = 'button'> = AsComponent<Component>

/** `as` is `div` (default) or `section`. The role is `menu` either way. */
export type MenuPopupProps = AsTag<(typeof sectionTags)[number], 'div'>

/** An item is a `<button>` with a role: it has no `as`, because an action is a button. */
export interface MenuItemProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'onSelect' | 'disabled' | 'type' | 'role'
> {
  /** Runs when the item is activated, with the click that did it. `event.preventDefault()` keeps the menu open. */
  onSelect?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined
  /** Whether running the item closes the menu. Default `true`. */
  closeOnSelect?: boolean | undefined
  /** Focusable and reachable by keys, but it cannot run. */
  disabled?: boolean | undefined
  /** The label typeahead matches. Default: the item's trimmed text. */
  textValue?: string | undefined
}

export interface MenuCheckboxItemProps extends MenuItemProps {
  /** Controlled: whether the item is checked. Pair it with `onCheckedChange`. */
  checked?: boolean | undefined
  /** Uncontrolled: whether the item starts checked. */
  defaultChecked?: boolean | undefined
  onCheckedChange?: ((checked: boolean) => void) | undefined
}

/** `as` is `div` (default) or `section`. The role is `group` either way. */
export type MenuRadioGroupProps = AsTag<
  (typeof sectionTags)[number],
  'div',
  {
    /** Controlled: the chosen value. Pair it with `onValueChange`. */
    value?: string | undefined
    /** Uncontrolled: the value that starts chosen. */
    defaultValue?: string | undefined
    onValueChange?: ((value: string) => void) | undefined
  }
>

export interface MenuRadioItemProps extends MenuItemProps {
  /** What the group's value becomes when this item is chosen. */
  value: string
}

/** `as` is `div` (default) or `section`. The role is `group` either way. */
export type MenuGroupProps = AsTag<(typeof sectionTags)[number], 'div'>

/** `as` is `div` (default), `span` or `p`. */
export type MenuGroupLabelProps = AsTag<(typeof groupLabelTags)[number], 'div'>

export type MenuSeparatorProps = ComponentPropsWithRef<'div'>

function warnOutsideRoot(part: string): void {
  warnOnce(
    `menu-${part.toLowerCase()}-outside-root`,
    `A Menu.${part} is outside a Menu.Root, so it opens, closes and runs nothing. Put it inside <Menu.Root>.`,
  )
}

/** Warns, in an effect, that a part is outside a Root. */
function useWarnOutsideRoot(part: string, isOutside: boolean): void {
  useEffect(() => {
    if (isOutside) {
      warnOutsideRoot(part)
    }
  }, [part, isOutside])
}

const hasName = (element: Element | null) =>
  element !== null &&
  (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'))

/**
 * Owns the open state of a menu (contract: menu.a11y.md). It renders no element: put a
 * `Menu.Trigger` and a `Menu.Popup` inside it, the popup right after the trigger. For actions,
 * never for navigation. Open it from state with `open` and `onOpenChange`, or let it keep its own
 * with `defaultOpen`.
 *
 * @example
 * <Menu.Root>
 *   <Menu.Trigger>Åtgärder</Menu.Trigger>
 *   <Menu.Popup>
 *     <Menu.Item onSelect={print}>Skriv ut</Menu.Item>
 *   </Menu.Popup>
 * </Menu.Root>
 */
export function MenuRoot({ children, ...options }: MenuRootProps): ReactElement {
  const menu = useMenu(options)
  return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
}
MenuRoot.displayName = 'Menu.Root'

/**
 * The `<button>` that opens and closes the menu: `aria-haspopup="menu"`, `aria-expanded` and
 * `aria-controls`, and the anchor the popup is placed against. A press, Enter, Space or ArrowDown
 * opens the menu on its first item, ArrowUp on its last. The popup is named by this button.
 */
export function MenuTrigger<Component extends ElementType = 'button'>(
  props: MenuTriggerProps<Component>,
): ReactElement
export function MenuTrigger({ as, ref, ...otherProps }: MenuTriggerProps<'button'>): ReactElement {
  const menu = useContext(MenuContext)
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef(useMergedRef(ref, menu?.triggerProps.ref ?? null), elementRef)
  useWarnOutsideRoot('Trigger', menu === null)
  useEffect(() => {
    const element = elementRef.current
    if (element !== null && element.tagName !== 'BUTTON') {
      const rendered = element.tagName.toLowerCase()
      warnOnce(
        `menu-trigger-not-a-button:${rendered}`,
        `A Menu.Trigger rendered a <${rendered}>, not a <button>. Enter and Space then do not open the menu unless you add them, and it is not announced as a button (WCAG 2.1.1, 4.1.2). Use a <button>.`,
      )
    }
  })
  return renderPart({
    as,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, menu?.triggerProps ?? { type: 'button' as const }),
      ref: mergedRef,
    },
  })
}
MenuTrigger.displayName = 'Menu.Trigger'

/**
 * The popup: a `<div popover="auto" role="menu">` in the top layer, so no z-index and no clipping
 * by an ancestor. It is named by the trigger unless you pass `aria-label` or `aria-labelledby`.
 * It is always in the page, with its items, and hidden by the browser while closed. It is placed next to the trigger, flips when there is no room and
 * scrolls inside when it is too tall (`--kv-popup-max-height`). Escape and a press outside close it.
 */
export function MenuPopup({
  as,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...otherProps
}: MenuPopupProps): ReactElement {
  const menu = useContext(MenuContext)
  useWarnOutsideRoot('Popup', menu === null)
  const mergedRef = useMergedRef(ref, menu?.popupProps.ref ?? null)
  const { 'aria-labelledby': triggerLabel, ...popupProps } = menu?.popupProps ?? {}
  const isNamedByConsumer = ariaLabel !== undefined || ariaLabelledBy !== undefined
  // The popup holds items, never toolbar items. A Menu trigger can be a Toolbar.Item, so the popup
  // sits in the toolbar's React tree: leave it, as Popover does (Plan 0036).
  return (
    <ToolbarContext.Provider value={null}>
      {renderPart({
        as: resolveAsTag({ part: 'Menu.Popup', as, allowedTags: sectionTags }),
        defaultElement: 'div',
        partProps: {
          ...mergeProps(otherProps, popupProps),
          'aria-label': ariaLabel,
          'aria-labelledby': isNamedByConsumer ? ariaLabelledBy : triggerLabel,
          ref: mergedRef,
        },
      })}
    </ToolbarContext.Provider>
  )
}
MenuPopup.displayName = 'Menu.Popup'

interface ItemPartOptions {
  kind: MenuItemKind
  part: string
  checked: boolean
  /** Runs after the consumer's `onSelect`, unless that prevented the default. */
  onActivate?: (() => void) | undefined
}

function useMenuItemElement(
  {
    ref,
    disabled = false,
    closeOnSelect,
    onSelect,
    textValue,
    onClick,
    onFocus,
    onBlur,
    ...otherProps
  }: MenuItemProps,
  { kind, part, checked, onActivate }: ItemPartOptions,
): ReactElement {
  const menu = useContext(MenuContext)
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const [isHighlighted, setIsHighlighted] = useState(false)
  useWarnOutsideRoot(part, menu === null)
  const itemProps = menu?.getItemProps(kind, {
    disabled,
    closeOnSelect,
    textValue,
    checked,
    isCurrent: isHighlighted,
    onSelect: (event) => {
      onSelect?.(event)
      if (!event.defaultPrevented) {
        onActivate?.()
      }
    },
  })
  return renderPart({
    as: undefined,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(
        {
          ...otherProps,
          onClick: disabled ? undefined : onClick,
          onFocus: (event: FocusEvent<HTMLButtonElement>) => {
            setIsHighlighted(true)
            onFocus?.(event)
          },
          onBlur: (event: FocusEvent<HTMLButtonElement>) => {
            setIsHighlighted(false)
            onBlur?.(event)
          },
        },
        itemProps ?? { type: 'button' as const },
      ),
      ref: mergedRef,
    },
  })
}

/**
 * An action: a `<button role="menuitem">`. Enter, Space or a press runs `onSelect` and closes the
 * menu, and focus returns to the trigger (`closeOnSelect={false}` keeps it open). `disabled` keeps
 * it focusable with `aria-disabled`, so it can be found, and it cannot run. An action, never a link.
 */
export function MenuItem(props: MenuItemProps): ReactElement {
  return useMenuItemElement(props, { kind: 'item', part: 'Item', checked: false })
}
MenuItem.displayName = 'Menu.Item'

/**
 * An on/off choice: `role="menuitemcheckbox"` with `aria-checked`. Controlled with `checked` and
 * `onCheckedChange`, or uncontrolled with `defaultChecked`. It closes the menu by default.
 */
export function MenuCheckboxItem({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  ...itemProps
}: MenuCheckboxItemProps): ReactElement {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked)
  const checked = checkedProp ?? uncontrolledChecked
  return useMenuItemElement(itemProps, {
    kind: 'checkbox',
    part: 'CheckboxItem',
    checked,
    onActivate: () => {
      if (checkedProp === undefined) {
        setUncontrolledChecked(!checked)
      }
      onCheckedChange?.(!checked)
    },
  })
}
MenuCheckboxItem.displayName = 'Menu.CheckboxItem'

/**
 * Groups `Menu.RadioItem`s: `role="group"`, which you name with `aria-label` or `aria-labelledby`.
 * Controlled with `value` and `onValueChange`, or uncontrolled with `defaultValue`. Not the
 * form control `RadioGroup`.
 */
export function MenuRadioGroup({
  as,
  ref,
  value: valueProp,
  defaultValue,
  onValueChange,
  ...otherProps
}: MenuRadioGroupProps): ReactElement {
  const menu = useContext(MenuContext)
  const elementRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const value = valueProp ?? uncontrolledValue
  useWarnOutsideRoot('RadioGroup', menu === null)
  useEffect(() => {
    if (!hasName(elementRef.current)) {
      warnOnce(
        'menu-radio-group-without-name',
        'A Menu.RadioGroup has no accessible name. Its role is "group", and a screen reader reads the choices without saying what they choose between (WCAG 1.3.1, 4.1.2): give it aria-label or aria-labelledby.',
      )
    }
  })
  return (
    <MenuRadioGroupContext.Provider
      value={{
        value,
        select: (next) => {
          if (valueProp === undefined) {
            setUncontrolledValue(next)
          }
          onValueChange?.(next)
        },
      }}
    >
      {renderPart({
        as: resolveAsTag({ part: 'Menu.RadioGroup', as, allowedTags: sectionTags }),
        defaultElement: 'div',
        partProps: {
          ...mergeProps(otherProps, { className: 'kv-menu-radio-group', role: 'group' }),
          ref: mergedRef,
        },
      })}
    </MenuRadioGroupContext.Provider>
  )
}
MenuRadioGroup.displayName = 'Menu.RadioGroup'

/**
 * A one-of-many choice: `role="menuitemradio"` with `aria-checked`, checked while its `value` is
 * the group's. It closes the menu by default.
 */
export function MenuRadioItem({ value, ...itemProps }: MenuRadioItemProps): ReactElement {
  const group = useContext(MenuRadioGroupContext)
  return useMenuItemElement(itemProps, {
    kind: 'radio',
    part: 'RadioItem',
    checked: group !== null && group.value === value,
    onActivate: () => group?.select(value),
  })
}
MenuRadioItem.displayName = 'Menu.RadioItem'

/**
 * A group of items: `role="group"`, named by its `Menu.GroupLabel`, or by `aria-label` or
 * `aria-labelledby` when you pass one.
 */
export function MenuGroup({ as, ref, ...otherProps }: MenuGroupProps): ReactElement {
  const menu = useContext(MenuContext)
  const labelId = useId()
  const elementRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const labelCountRef = useRef(0)
  const [hasLabel, setHasLabel] = useState(false)
  const registerLabel = useCallback(() => {
    labelCountRef.current += 1
    setHasLabel(true)
    return () => {
      labelCountRef.current -= 1
      setHasLabel(labelCountRef.current > 0)
    }
  }, [])
  useWarnOutsideRoot('Group', menu === null)
  useEffect(() => {
    if (labelCountRef.current === 0 && !hasName(elementRef.current)) {
      warnOnce(
        'menu-group-without-name',
        'A Menu.Group has no accessible name. Its role is "group": add a Menu.GroupLabel inside it, or give it aria-label or aria-labelledby (WCAG 1.3.1, 4.1.2).',
      )
    }
  })
  return (
    <MenuGroupContext.Provider value={{ labelId, registerLabel }}>
      {renderPart({
        as: resolveAsTag({ part: 'Menu.Group', as, allowedTags: sectionTags }),
        defaultElement: 'div',
        partProps: {
          ...mergeProps(otherProps, {
            className: 'kv-menu-group',
            role: 'group',
            'aria-labelledby': hasLabel ? labelId : undefined,
          }),
          ref: mergedRef,
        },
      })}
    </MenuGroupContext.Provider>
  )
}
MenuGroup.displayName = 'Menu.Group'

/** The visible name of a `Menu.Group`. It is not an item: arrows and typeahead skip it. */
export function MenuGroupLabel({ as, ref, ...otherProps }: MenuGroupLabelProps): ReactElement {
  const mergedRef = useMergedRef(ref, null)
  const group = useContext(MenuGroupContext)
  const registerLabel = group?.registerLabel
  useEffect(() => registerLabel?.(), [registerLabel])
  return renderPart({
    as: resolveAsTag({ part: 'Menu.GroupLabel', as, allowedTags: groupLabelTags }),
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, { className: 'kv-menu-group-label', id: group?.labelId }),
      ref: mergedRef,
    },
  })
}
MenuGroupLabel.displayName = 'Menu.GroupLabel'

/** A dividing line between items: `role="separator"`. Not an item. */
export function MenuSeparator({ ref, ...otherProps }: MenuSeparatorProps): ReactElement {
  const mergedRef = useMergedRef(ref, null)
  return renderPart({
    as: undefined,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, { className: 'kv-menu-separator', role: 'separator' }),
      ref: mergedRef,
    },
  })
}
MenuSeparator.displayName = 'Menu.Separator'

/** A menu: a trigger button that opens a list of actions in the top layer. For actions, not navigation. */
export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Popup: MenuPopup,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Separator: MenuSeparator,
} as const
