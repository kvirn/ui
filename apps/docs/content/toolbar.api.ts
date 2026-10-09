import type {
  ToolbarButtonProps,
  ToolbarItemProps,
  ToolbarRootProps,
  ToolbarToggleProps,
  UseToolbarOptions,
  UseToolbarResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type ToolbarRootDocumentedProps = Pick<ToolbarRootProps, 'orientation' | 'loop' | 'as'>
export type ToolbarButtonDocumentedProps = Pick<
  ToolbarButtonProps,
  'disabled' | 'focusableWhenDisabled' | 'type' | 'onClick'
>
export type ToolbarToggleDocumentedProps = Pick<
  ToolbarToggleProps,
  | 'pressed'
  | 'defaultPressed'
  | 'onPressedChange'
  | 'disabled'
  | 'focusableWhenDisabled'
  | 'onClick'
>
export type ToolbarItemDocumentedProps = Pick<
  ToolbarItemProps,
  'as' | 'disabled' | 'focusableWhenDisabled'
>

export const toolbarRootRows = propRows<ToolbarRootDocumentedProps>({
  orientation: {
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description:
      'The axis of the arrow keys. Vertical uses Down and Up and sets aria-orientation="vertical". Horizontal uses Left and Right, which flip in right-to-left text.',
  },
  loop: {
    type: 'boolean',
    default: 'true',
    description: 'Whether the arrows wrap from the last control to the first, and back.',
  },
  as: {
    type: "'div' | 'section'",
    default: "'div'",
    description:
      'Changes the element: a section with aria-labelledby is a named region. It still gets the role, the class and the keys.',
  },
})

export const toolbarButtonRows = propRows<ToolbarButtonDocumentedProps>({
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Blocks activation. The button stays focusable, with aria-disabled="true".',
  },
  focusableWhenDisabled: {
    type: 'boolean',
    default: 'true',
    description:
      'With disabled, keeps the button reachable by the arrows. false makes disabled native: the arrows skip the button and it is never the Tab stop.',
  },
  type: {
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: 'The button type.',
  },
  onClick: {
    type: 'MouseEventHandler<HTMLButtonElement>',
    default: '–',
    description: 'Called on click, Enter and Space, and never while the button is disabled.',
  },
})

export const toolbarToggleRows = propRows<ToolbarToggleDocumentedProps>({
  pressed: {
    type: 'boolean',
    default: '–',
    description: 'Controlled: whether the toggle is on. Pair it with onPressedChange.',
  },
  defaultPressed: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether the toggle starts on.',
  },
  onPressedChange: {
    type: '(pressed: boolean, details: TogglePressedChangeDetails) => void',
    default: '–',
    description:
      'Called with the new value and { event } when the user switches the toggle, and never while it is disabled. It only reports: with pressed set, you change pressed yourself.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Blocks switching. The toggle stays focusable, with aria-disabled="true".',
  },
  focusableWhenDisabled: {
    type: 'boolean',
    default: 'true',
    description:
      'With disabled, keeps the toggle reachable by the arrows. false makes disabled native: the arrows skip it.',
  },
  onClick: {
    type: 'MouseEventHandler<HTMLButtonElement>',
    default: '–',
    description: 'Called on click, Enter and Space, and never while the toggle is disabled.',
  },
})

export const toolbarItemRows = propRows<ToolbarItemDocumentedProps>({
  as: {
    type: 'ElementType',
    default: "'button'",
    description:
      'The component that becomes an item: Link.Root, Popover.Trigger, Listbox.Trigger or an input of your own, with its props set on the Item: as={Link.Root} href="#guide". It must be focusable by itself, forward its ref and spread its props on a DOM node. Without as the item is a <button type="button">.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Blocks click, Enter and Space, also for the rendered element’s own handlers. A text input stays editable: make it readOnly instead.',
  },
  focusableWhenDisabled: {
    type: 'boolean',
    default: 'true',
    description:
      'With disabled, keeps the item focusable with aria-disabled="true" and data-disabled. false makes disabled native: the arrows skip the item.',
  },
})

export const toolbarRootAttributes: readonly AttributeRow[] = [
  { name: 'kv-toolbar', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'aria-orientation',
    values: '"vertical" or absent',
    meaning: 'Set when orientation is vertical. Horizontal is the default of the role.',
  },
]

export const toolbarGroupAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button-group',
    values: 'always',
    meaning: 'The part class. The default theme draws a hairline between groups.',
  },
]

export const toolbarButtonAttributes: readonly AttributeRow[] = [
  { name: 'kv-button', values: 'always', meaning: 'The Button part class, and its variants.' },
  {
    name: 'tabindex',
    values: '"0" or "-1"',
    meaning: 'Roving: "0" on the one item the Tab key reaches, "-1" on the others.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The button is disabled, natively or focusable.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The button has keyboard focus (:focus-visible).',
  },
]

export const toolbarToggleAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button kv-toggle',
    values: 'always',
    meaning: 'The Toggle part classes. The default theme fills a pressed toggle.',
  },
  { name: 'aria-pressed', values: '"true" or "false"', meaning: 'Whether the toggle is on.' },
  { name: 'data-pressed', values: 'present or absent', meaning: 'The toggle is on.' },
  {
    name: 'tabindex',
    values: '"0" or "-1"',
    meaning: 'Roving: "0" on the one item the Tab key reaches, "-1" on the others.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The toggle is disabled, natively or focusable.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The toggle has keyboard focus (:focus-visible).',
  },
]

export const toolbarItemAttributes: readonly AttributeRow[] = [
  {
    name: 'tabindex',
    values: '"0" or "-1"',
    meaning:
      'Roving: "0" on the one item the Tab key reaches, "-1" on the others. It wins over the rendered element’s own.',
  },
  {
    name: 'aria-disabled',
    values: '"true" or absent',
    meaning: 'Set when disabled and focusableWhenDisabled are both on.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The item is disabled, natively or focusable.',
  },
]

export const useToolbarHook: ApiHook = {
  name: 'useToolbar',
  options: propRows<UseToolbarOptions>({
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'The axis of the arrow keys.',
    },
    loop: {
      type: 'boolean',
      default: 'true',
      description: 'Whether the arrows wrap from the last control to the first, and back.',
    },
  }),
  result: propRows<UseToolbarResult>({
    toolbarProps: {
      type: 'ToolbarRootPartProps',
      default: '–',
      description: 'Spread on a <div>: class, role, aria-orientation, ref and the key handler.',
    },
    getItemProps: {
      type: '(key: string) => ToolbarItemPartProps',
      default: '–',
      description:
        'The roving tabindex, ref and focus handlers of one control. The key names the item and is the same on every render, such as a useId().',
    },
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: '–',
      description: 'The orientation in use.',
    },
    itemCount: {
      type: 'number',
      default: '–',
      description:
        'How many items are mounted. It lags the first render by one commit, because items register after it.',
    },
  }),
}
