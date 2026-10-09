import type {
  ListboxGroupProps,
  ListboxListProps,
  ListboxOptionProps,
  ListboxRootProps,
  ListboxValueProps,
  UseListboxOptions,
  UseListboxResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const rootRows = propRows<Omit<ListboxRootProps<unknown>, 'children'>>({
  items: {
    type: 'readonly TItem[]',
    default: '–',
    description:
      'A flat list of any item type. Memoize a list you build in render: items are compared by identity. Ignored when groups is given.',
  },
  groups: {
    type: 'readonly { key: string; label: string; items: readonly TItem[] }[]',
    default: '–',
    description: 'Items in named groups, instead of items. Groups do not nest.',
  },
  itemToString: {
    type: '(item: TItem) => string',
    default: 'String(item)',
    description:
      'The text of an item: shown in the trigger, read by typeahead, and the label of the native option.',
  },
  itemToLang: {
    type: '(item: TItem) => string | undefined',
    default: '–',
    description:
      'The language of an item’s text, as a BCP 47 code such as fi, or undefined for the page’s language. Sets lang on each native option, each popup option and each chosen text in the trigger’s value (WCAG 3.1.2). Not on Combobox or Autocomplete yet.',
  },
  itemToKey: {
    type: '(item: TItem) => string',
    default: 'itemToString',
    description: 'A stable, unique key for an item. The value holds keys, not items.',
  },
  isItemDisabled: {
    type: '(item: TItem) => boolean',
    default: '–',
    description: 'A disabled option stays reachable with the arrow keys and cannot be chosen.',
  },
  multiple: {
    type: 'boolean',
    default: 'false',
    description:
      'Several choices. The popup stays open after a choice and each option toggles. Always the popup, never the native select.',
  },
  value: {
    type: 'string | null, or readonly string[] with multiple',
    default: '–',
    description: 'Controlled: the chosen key, or the chosen keys. null means nothing is chosen.',
  },
  defaultValue: {
    type: 'string | null, or readonly string[] with multiple',
    default: '–',
    description: 'Uncontrolled: the key or keys chosen to begin with.',
  },
  onValueChange: {
    type: "(value, { reason: 'option-press' | 'key' | 'native' }) => void",
    default: '–',
    description:
      'Called with the chosen key (an array with multiple) when the user chooses. It only reports: update value yourself when it is controlled.',
  },
  native: {
    type: "'auto' | 'always' | 'never'",
    default: "'auto'",
    description:
      'When the browser’s own <select> renders instead of the popup. auto: on a touch device, for one choice. always and never force it. multiple is always the popup.',
  },
  name: {
    type: 'string',
    default: '–',
    description:
      'A hidden input per chosen key for a plain form (the native select carries the name itself).',
  },
  placeholder: {
    type: 'string',
    default: '–',
    description:
      'Shown while nothing is chosen, and the label of the native select’s empty option. Never the only label.',
  },
  autoComplete: {
    type: 'string',
    default: '–',
    description:
      'The autocomplete attribute of the native select, such as address-level2 (WCAG 1.3.5).',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Disables it. A disabled Field disables it too.',
  },
  id: {
    type: 'string',
    default: '–',
    description: 'The trigger’s id, outside a Field. Inside one, the Field’s id is used.',
  },
  open: {
    type: 'boolean',
    default: '–',
    description: 'Controlled: whether the popup is open. Pair it with onOpenChange.',
  },
  defaultOpen: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether the popup starts open.',
  },
  onOpenChange: {
    type: '(open: boolean, { reason }) => void',
    default: '–',
    description:
      'Called when the user opens or closes the popup. reason is trigger-press, option-press, key, escape, outside-press, blur or light-dismiss. It only reports.',
  },
  placement: {
    type: 'Placement',
    default: "'bottom-start'",
    description: 'Where the popup goes when there is room. It flips when it does not fit.',
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
  messages: {
    type: "Partial<KvirnMessages['combobox']>",
    default: '–',
    description: 'Per-instance text. noResults is the default text of Listbox.Empty.',
  },
  virtualize: {
    type: 'boolean | { estimateSize?: number; overscan?: number }',
    default: 'false',
    description:
      'Renders only the options in view, plus the active and the chosen one, for a flat list of thousands. estimateSize defaults to 44 pixels and overscan to 5. Not with groups. The native select ignores it.',
  },
})

export const useListboxHook: ApiHook = {
  name: 'useListbox',
  options: propRows<UseListboxOptions<unknown>>(rootRows),
  result: propRows<UseListboxResult<unknown>>({
    isNative: {
      type: 'boolean',
      default: '–',
      description: 'The native <select> renders instead of the popup. Listbox.Root checks this.',
    },
    isOpen: { type: 'boolean', default: '–', description: 'Whether the popup is open.' },
    isMultiple: { type: 'boolean', default: '–', description: 'Whether several can be chosen.' },
    isDisabled: { type: 'boolean', default: '–', description: 'From disabled or the Field.' },
    isInvalid: { type: 'boolean', default: '–', description: 'From the Field.' },
    isRequired: { type: 'boolean', default: '–', description: 'From the Field.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the trigger has keyboard (:focus-visible) focus.',
    },
    entries: {
      type: 'readonly ListboxEntry<TItem>[]',
      default: '–',
      description: 'Every option, in order. index counts across groups.',
    },
    sections: {
      type: 'readonly ListboxSection<TItem>[] | undefined',
      default: '–',
      description: 'The groups with their entries, or undefined for a flat list.',
    },
    size: { type: 'number', default: '–', description: 'The number of options.' },
    activeKey: {
      type: 'string | undefined',
      default: '–',
      description: 'The active option’s key. Undefined while closed and until the user moves.',
    },
    selectedKeys: {
      type: 'readonly string[]',
      default: '–',
      description: 'The chosen keys.',
    },
    selectedItems: {
      type: 'readonly TItem[]',
      default: '–',
      description: 'The chosen items, in the order chosen.',
    },
    selectedLabels: {
      type: 'readonly string[]',
      default: '–',
      description: 'The chosen items’ texts, in the same order.',
    },
    placeholder: {
      type: 'string | undefined',
      default: '–',
      description: 'The placeholder from the options.',
    },
    emptyText: {
      type: 'string',
      default: '–',
      description: 'The text of Listbox.Empty unless you give it children: combobox.noResults.',
    },
    triggerProps: {
      type: 'ListboxTriggerPartProps',
      default: '–',
      description: 'Spread on a <div>: role combobox, tabIndex, ARIA, handlers and a ref.',
    },
    valueProps: {
      type: 'ListboxValuePartProps',
      default: '–',
      description: 'Spread on the element that shows the chosen text.',
    },
    popupProps: {
      type: 'ListboxPopupPartProps',
      default: '–',
      description: 'Spread on the popup: popover="manual", its id and ref.',
    },
    listProps: {
      type: 'ListboxListPartProps',
      default: '–',
      description: 'Spread on the role="listbox" element inside the popup.',
    },
    emptyProps: {
      type: 'ListboxEmptyPartProps',
      default: '–',
      description: 'Spread on the empty-state text.',
    },
    getOptionProps: {
      type: '(entry: ListboxOptionEntry) => ListboxOptionPartProps',
      default: '–',
      description: 'The props of one option, from its entry.',
    },
    getGroupProps: {
      type: '(section: { key: string }) => ListboxGroupPartProps',
      default: '–',
      description: 'The props of one group.',
    },
    getGroupLabelProps: {
      type: '(section: { key: string }) => ListboxGroupLabelPartProps',
      default: '–',
      description: 'The props of one group’s label.',
    },
    getEntry: {
      type: '(item: unknown) => ListboxEntry<unknown> | undefined',
      default: '–',
      description: 'The entry of an item that the list rendered, found by identity.',
    },
    shouldScrollToActive: {
      type: '() => boolean',
      default: '–',
      description: 'False while the pointer moved the active option: it is already under it.',
    },
    virtualization: {
      type: 'ListboxVirtualization | undefined',
      default: '–',
      description: 'Set while virtualize is on, the popup is open and the list is flat.',
    },
    hiddenInputs: {
      type: 'readonly { name: string; value: string }[]',
      default: '–',
      description: 'The hidden inputs of a plain form. Empty with the native rendering.',
    },
    nativeValue: {
      type: 'string',
      default: '–',
      description: 'For the native rendering: the chosen key, or an empty string.',
    },
    selectFromNative: {
      type: '(value: string) => void',
      default: '–',
      description:
        'For the native rendering: the user chose value (an empty string is the empty option).',
    },
  }),
}

export const valueRows = propRows<Pick<ListboxValueProps, 'placeholder' | 'children'>>({
  placeholder: {
    type: 'string',
    default: 'The Root’s placeholder',
    description: 'Shown while nothing is chosen. Never the only label.',
  },
  children: {
    type: 'ReactNode | (selectedItems: readonly TItem[]) => ReactNode',
    default: 'The chosen texts, joined with a comma',
    description: 'What shows when something is chosen. A function gets the chosen items.',
  },
})

export const listRows = propRows<Pick<ListboxListProps, 'children'>>({
  children: {
    type: 'ReactNode | (item: TItem, entry: ListboxEntry<TItem>) => ReactNode',
    default: '–',
    description:
      'A function that renders one Option per item (or a Group per group). Options render only while the popup is open.',
  },
})

export const optionRows = propRows<Pick<ListboxOptionProps, 'item' | 'children'>>({
  item: {
    type: 'TItem',
    description: 'One of the Root’s items, as List hands it to you.',
  },
  children: {
    type: 'ReactNode',
    default: 'The item’s text',
    description: 'Your own content for a rich option. Its name is then its text content.',
  },
})

export const groupRows = propRows<Pick<ListboxGroupProps, 'section' | 'children'>>({
  section: {
    type: 'ListboxSection<TItem>',
    description: 'The group, as the Root hands it out. List passes it for you.',
  },
  children: {
    type: 'ReactNode | (item: TItem, entry: ListboxEntry<TItem>) => ReactNode',
    default: '–',
    description: 'A function renders the label, then one child per option.',
  },
})

export const dataRow = (name: string, meaning: string): AttributeRow => ({
  name,
  values: 'present or absent',
  meaning,
})
export const classRow = (name: string, meaning: string): AttributeRow => ({
  name,
  values: 'always',
  meaning,
})

export const triggerAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-trigger', 'The part class. The default theme styles it.'),
  dataRow('data-open', 'The popup is open.'),
  dataRow('data-focus-visible', 'The trigger has keyboard focus (:focus-visible).'),
  dataRow('data-invalid', 'The Field is invalid.'),
  dataRow('data-required', 'The Field is required.'),
  dataRow('data-disabled', 'The Listbox is disabled.'),
]

export const valueAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-value', 'The part class.'),
  {
    name: 'lang',
    values: 'a language code, or absent',
    meaning:
      'On a span around each chosen text, when you give itemToLang and Value has no children of its own.',
  },
  dataRow('data-placeholder', 'Nothing is chosen, so the placeholder shows.'),
]

export const popupAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-popup', 'The part class. Combobox and Autocomplete keep it.'),
  dataRow('data-open', 'The popup is open.'),
  {
    name: 'data-placement',
    values: 'a placement, such as bottom-start',
    meaning: 'The side the popup is on now, after it flipped.',
  },
  dataRow('data-detached', 'The anchor is scrolled out of view, so the popup is hidden.'),
]

export const listAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-list', 'The part class. This is the part that scrolls.'),
  dataRow('data-empty', 'The popup is open and there is no option, so the list is hidden.'),
  dataRow('data-virtualized', 'Only some options are rendered.'),
  classRow(
    'kv-listbox-virtual-sizer',
    'Inside a virtualized list: one element with the height of the whole list.',
  ),
]

export const optionAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-option', 'The part class.'),
  {
    name: 'lang',
    values: 'a language code, or absent',
    meaning: 'From itemToLang. A lang you pass yourself wins.',
  },
  dataRow('data-active', 'The option the arrow keys are on (aria-activedescendant).'),
  dataRow('data-selected', 'The option is chosen.'),
  dataRow('data-disabled', 'The option cannot be chosen.'),
  dataRow('data-has-indicator', 'The option holds an OptionIndicator.'),
  {
    name: 'data-index',
    values: 'a number',
    meaning: 'In a virtualized list: the option’s place in the whole list.',
  },
]

export const optionIconAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-option-icon', 'The part class.'),
]
export const optionTextAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-option-text', 'The part class.'),
]
export const optionDescriptionAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-option-description', 'The part class.'),
]
export const optionIndicatorAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-option-indicator', 'The part class.'),
  dataRow('data-selected', 'The option is chosen.'),
]
export const groupAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-group', 'The part class.'),
]
export const groupLabelAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-group-label', 'The part class.'),
]
export const emptyAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-empty', 'The part class.'),
]

export const nativeAttributes: readonly AttributeRow[] = [
  classRow('kv-listbox-native', 'The class of the native <select> that native renders.'),
]
