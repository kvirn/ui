import type {
  MenuCheckboxItemProps,
  MenuGroupLabelProps,
  MenuGroupProps,
  MenuItemProps,
  MenuPopupProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuRootProps,
  MenuSeparatorProps,
  MenuTriggerProps,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const menuRootRows = propRows<MenuRootProps>({
  open: {
    type: 'boolean',
    default: '–',
    description: 'Controlled: whether the menu is open. Pair it with onOpenChange.',
  },
  defaultOpen: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether the menu starts open.',
  },
  onOpenChange: {
    type: '(open: boolean, details: MenuChangeDetails) => void',
    default: '–',
    description:
      'Called when the user opens or closes it. It only reports: with open set, you change open yourself. details.reason is trigger-press, key, item-press, escape, outside-press, light-dismiss, tab or focus-out, and details.event is the native event.',
  },
  placement: {
    type: 'Placement',
    default: "'bottom-start'",
    description:
      'Where the popup goes when there is room: top, bottom, start or end, with -start, -center or -end. It flips when it does not fit, and start and end follow the reading direction.',
  },
  offset: {
    type: 'number',
    default: '4',
    description: 'The gap between the trigger and the popup, in pixels.',
  },
  padding: {
    type: 'number',
    default: '8',
    description: 'The space kept to the edge of the viewport, in pixels.',
  },
  children: {
    type: 'ReactNode',
    default: '–',
    description: 'The Trigger and the Popup. Root renders no element.',
  },
})

const renderRow = (element: string, state: string) =>
  ({
    render: {
      type: `RenderProp<ComponentPropsWithRef<"${element}">, ${state}>`,
      default: '–',
      description: `Changes the element, which must still be a <${element}>. A function receives the props and the state: { isOpen }, and on an item also isChecked, isDisabled and isHighlighted.`,
    },
  }) as const

export const menuTriggerRows = propRows<Pick<MenuTriggerProps, 'render'>>(
  renderRow('button', 'MenuState'),
)

export const menuPopupRows = propRows<Pick<MenuPopupProps, 'render'>>(renderRow('div', 'MenuState'))

const itemOptionRows = {
  onSelect: {
    type: '(event: Event) => void',
    default: '–',
    description:
      'Runs when the item is chosen by Enter, Space or a press. It does not run on a disabled item. Call event.preventDefault() to keep the menu open and skip the toggle of a checkbox or radio item.',
  },
  closeOnSelect: {
    type: 'boolean',
    default: 'true',
    description: 'Closes the menu after the item is chosen. Set false to keep it open.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Sets aria-disabled and data-disabled. The item stays focusable, so the arrows and typeahead reach it, but it cannot be chosen.',
  },
  textValue: {
    type: 'string',
    default: 'the item’s trimmed text',
    description:
      'The text typeahead matches against, when the visible text is not the right label.',
  },
} as const

export const menuItemRows = propRows<
  Pick<MenuItemProps, 'onSelect' | 'closeOnSelect' | 'disabled' | 'textValue' | 'render'>
>({ ...itemOptionRows, ...renderRow('button', 'MenuState') })

export const menuCheckboxItemRows = propRows<
  Pick<
    MenuCheckboxItemProps,
    | 'checked'
    | 'defaultChecked'
    | 'onCheckedChange'
    | 'onSelect'
    | 'closeOnSelect'
    | 'disabled'
    | 'textValue'
    | 'render'
  >
>({
  checked: {
    type: 'boolean',
    default: '–',
    description: 'Controlled: whether the item is checked. Pair it with onCheckedChange.',
  },
  defaultChecked: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether the item starts checked.',
  },
  onCheckedChange: {
    type: '(checked: boolean) => void',
    default: '–',
    description: 'Called with the new value when the item is chosen.',
  },
  ...itemOptionRows,
  ...renderRow('button', 'MenuState'),
})

export const menuRadioGroupRows = propRows<
  Pick<MenuRadioGroupProps, 'value' | 'defaultValue' | 'onValueChange' | 'render'>
>({
  value: {
    type: 'string',
    default: '–',
    description: 'Controlled: the value of the chosen item. Pair it with onValueChange.',
  },
  defaultValue: {
    type: 'string',
    default: '–',
    description: 'Uncontrolled: the value of the item that starts chosen.',
  },
  onValueChange: {
    type: '(value: string) => void',
    default: '–',
    description: 'Called with the value of the item that was chosen.',
  },
  ...renderRow('div', 'MenuState'),
})

export const menuRadioItemRows = propRows<
  Pick<
    MenuRadioItemProps,
    'value' | 'onSelect' | 'closeOnSelect' | 'disabled' | 'textValue' | 'render'
  >
>({
  value: {
    type: 'string',
    description: 'The value this item stands for inside its RadioGroup.',
  },
  ...itemOptionRows,
  ...renderRow('button', 'MenuState'),
})

export const menuGroupRows = propRows<Pick<MenuGroupProps, 'render'>>(renderRow('div', 'MenuState'))

export const menuGroupLabelRows = propRows<Pick<MenuGroupLabelProps, 'render'>>(
  renderRow('div', 'MenuState'),
)

export const menuSeparatorRows = propRows<Pick<MenuSeparatorProps, 'render'>>(
  renderRow('div', 'MenuState'),
)

export const menuTriggerAttributes: readonly AttributeRow[] = [
  { name: 'kv-menu-trigger', values: 'always', meaning: 'The part class.' },
  { name: 'aria-haspopup', values: '"menu"', meaning: 'The trigger opens a menu.' },
  { name: 'aria-expanded', values: '"true" or "false"', meaning: 'Whether the popup is open.' },
  {
    name: 'aria-controls',
    values: 'the popup’s id',
    meaning: 'Points at the popup, which stays in the page while closed.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The popup is open.' },
]

export const menuPopupAttributes: readonly AttributeRow[] = [
  { name: 'kv-menu-popup', values: 'always', meaning: 'The part class.' },
  {
    name: 'popover',
    values: '"auto"',
    meaning: 'Puts the popup in the top layer. The browser hides it while closed.',
  },
  {
    name: 'role',
    values: '"menu"',
    meaning: 'Named by the trigger unless you give it aria-label or aria-labelledby.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The popup is open.' },
  {
    name: 'data-placement',
    values: 'a Placement, such as bottom-start',
    meaning: 'The side the popup is on now, after it flipped.',
  },
  {
    name: 'data-detached',
    values: 'present or absent',
    meaning: 'The trigger is scrolled out of view. The popup is hidden until it comes back.',
  },
]

export const menuItemAttributes: readonly AttributeRow[] = [
  { name: 'kv-menu-item', values: 'always', meaning: 'The part class.' },
  {
    name: 'role',
    values: '"menuitem"',
    meaning: 'A checkbox item is "menuitemcheckbox" and a radio item "menuitemradio".',
  },
  { name: 'aria-disabled', values: '"true" or absent', meaning: 'The item cannot be chosen.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The item cannot be chosen.' },
  { name: 'data-highlighted', values: 'present or absent', meaning: 'The item has focus.' },
]

export const menuCheckableAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-menu-checkbox-item, kv-menu-radio-item',
    values: 'always',
    meaning: 'The part class.',
  },
  {
    name: 'aria-checked',
    values: '"true" or "false"',
    meaning: 'Whether it is checked or chosen.',
  },
  {
    name: 'data-checked',
    values: 'present or absent',
    meaning: 'Whether it is checked or chosen.',
  },
  { name: 'data-disabled, data-highlighted', values: 'present or absent', meaning: 'As on Item.' },
]

export const menuRadioGroupAttributes: readonly AttributeRow[] = [
  { name: 'kv-menu-radio-group', values: 'always', meaning: 'The part class.' },
  {
    name: 'role',
    values: '"group"',
    meaning: 'Name it with aria-label or aria-labelledby.',
  },
]

export const menuGroupAttributes: readonly AttributeRow[] = [
  { name: 'kv-menu-group', values: 'always', meaning: 'The part class.' },
  { name: 'role', values: '"group"', meaning: 'Named by the GroupLabel inside it.' },
]

export const menuGroupLabelAttributes: readonly AttributeRow[] = [
  { name: 'kv-menu-group-label', values: 'always', meaning: 'The part class.' },
]

export const menuSeparatorAttributes: readonly AttributeRow[] = [
  { name: 'kv-menu-separator', values: 'always', meaning: 'The part class.' },
  { name: 'role', values: '"separator"', meaning: 'A divider between items.' },
]
