import type {
  ComboboxClearProps,
  ComboboxControlProps,
  ComboboxInputProps,
  ComboboxRootProps,
  ComboboxToggleProps,
  ComboboxValueListProps,
  ComboboxValueProps,
  UseComboboxOptions,
  UseComboboxResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow, PropRow } from '../components/api-block.tsx'
import { classRow, dataRow, renderRow, rootRows as listboxRootRows } from './listbox.api.ts'

/**
 * The popup parts are the Listbox's, so their rows are too: only the state types carry the
 * component's own name (`ComboboxPartState`, `AutocompleteOptionState`).
 */
export function renamed<Rows extends Readonly<Record<string, PropRow>>>(
  rows: Rows,
  component: string,
): Rows {
  const rename = (text: string) =>
    text.replace(/Listbox(?=PartState|OptionState|OptionPartState)/g, component)
  return Object.fromEntries(
    Object.entries(rows).map(([prop, row]) => [
      prop,
      { ...row, type: rename(row.type), description: rename(row.description) },
    ]),
  ) as Rows
}

export const comboboxRootRows = propRows<Omit<ComboboxRootProps<unknown>, 'children'>>({
  items: listboxRootRows.items,
  groups: listboxRootRows.groups,
  itemToString: {
    type: '(item: TItem) => string',
    default: 'String(item)',
    description:
      'The text of an item: shown in the list, matched by the filter, and put in the input when it is chosen.',
  },
  itemToKey: {
    type: '(item: TItem) => string',
    default: 'itemToString',
    description: 'A stable, unique key for an item. The value holds keys, not items.',
  },
  isItemDisabled: listboxRootRows.isItemDisabled,
  filter: {
    type: '((item: TItem, query: string) => boolean) | false',
    default: 'Matches the query anywhere in the text',
    description:
      'Replaces the default filter, which uses the provider’s locale (å, ä and ö are not a and o in Swedish). false turns filtering off, for results your server has already filtered: pass isLoading while it works.',
  },
  isLoading: {
    type: 'boolean',
    default: 'false',
    description:
      'The options are being fetched. The popup shows and announces “loading”, and sets data-loading. items may still hold the last result.',
  },
  multiple: {
    type: 'boolean',
    default: 'false',
    description:
      'Several choices. Chosen values go into a list before the input, and the popup stays open after a choice.',
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
    type: "(value, { reason: 'option-press' | 'key' | 'input' | 'remove' | 'clear' }) => void",
    default: '–',
    description:
      'Called with the chosen key (an array with multiple). It is called with null when the text no longer names the chosen option (input). It only reports: apply it when value is controlled.',
  },
  name: {
    type: 'string',
    default: '–',
    description:
      'A hidden input per chosen key for a plain form. The text in the input is never sent.',
  },
  inputValue: {
    type: 'string',
    default: '–',
    description:
      'Controlled: the text in the input. Give the chosen option’s text while a value is chosen.',
  },
  defaultInputValue: {
    type: 'string',
    default: 'The chosen option’s text',
    description: 'Uncontrolled: the text to begin with.',
  },
  onInputValueChange: {
    type: "(inputValue: string, { reason: 'input' | 'selection' | 'clear' }) => void",
    default: '–',
    description:
      'Called with the text when the user types, chooses an option (it fills or empties the text) or clears. It only reports.',
  },
  disabled: listboxRootRows.disabled,
  id: {
    type: 'string',
    default: '–',
    description: 'The input’s id, outside a Field. Inside one, the Field’s id is used.',
  },
  open: listboxRootRows.open,
  defaultOpen: listboxRootRows.defaultOpen,
  onOpenChange: {
    type: '(open: boolean, { reason }) => void',
    default: '–',
    description:
      'Called when the user opens or closes the popup. reason is input, key, escape, toggle-press, option-press, outside-press, blur, light-dismiss or clear. It only reports.',
  },
  placement: listboxRootRows.placement,
  offset: {
    type: 'number',
    default: '4',
    description: 'The gap between the field and the popup, in pixels.',
  },
  padding: listboxRootRows.padding,
  announcementDebounceMilliseconds: {
    type: 'number',
    default: '500',
    description:
      'How long to wait after the last change before the result count is announced. Nothing is announced while the user types.',
  },
  messages: {
    type: "Partial<KvirnMessages['combobox']>",
    default: '–',
    description:
      'Per-instance text: the result count, “no results”, “loading” and the names of the buttons.',
  },
  virtualize: {
    type: 'boolean | { estimateSize?: number; overscan?: number }',
    default: 'false',
    description:
      'Renders only the options in view, plus the active and the chosen one, for a flat list of thousands. estimateSize defaults to 44 pixels and overscan to 5. Not with groups. Let the user filter first.',
  },
})

export const comboboxResultRows = propRows<UseComboboxResult<unknown>>({
  variant: {
    type: "'combobox' | 'autocomplete'",
    default: '–',
    description: 'Which of the two this is.',
  },
  isOpen: { type: 'boolean', default: '–', description: 'Whether the popup is open.' },
  isMultiple: { type: 'boolean', default: '–', description: 'Whether several can be chosen.' },
  isDisabled: { type: 'boolean', default: '–', description: 'From disabled or the Field.' },
  isInvalid: { type: 'boolean', default: '–', description: 'From the Field.' },
  isRequired: { type: 'boolean', default: '–', description: 'From the Field.' },
  isFocusVisible: {
    type: 'boolean',
    default: '–',
    description: 'Whether the input has keyboard (:focus-visible) focus.',
  },
  isLoading: { type: 'boolean', default: '–', description: 'Whether the options are loading.' },
  inputValue: { type: 'string', default: '–', description: 'What the input shows.' },
  hasClearableValue: {
    type: 'boolean',
    default: '–',
    description:
      'There is text, or a chosen value (one choice only), so Clear has something to clear.',
  },
  entries: {
    type: 'readonly ListboxEntry<TItem>[]',
    default: '–',
    description: 'Every option the filter lets through, in order. index counts across groups.',
  },
  sections: {
    type: 'readonly ListboxSection<TItem>[] | undefined',
    default: '–',
    description: 'The groups with their entries, or undefined for a flat list.',
  },
  size: { type: 'number', default: '–', description: 'The number of options after filtering.' },
  activeKey: {
    type: 'string | undefined',
    default: '–',
    description: 'The active option’s key. Undefined while closed and until the user moves.',
  },
  selectedKeys: { type: 'readonly string[]', default: '–', description: 'The chosen keys.' },
  selectedValues: {
    type: 'readonly ComboboxSelectedValue<TItem>[]',
    default: '–',
    description:
      'The chosen values in the order chosen, including ones the filter hides now. Each has key, item and label.',
  },
  emptyText: {
    type: 'string',
    default: '–',
    description: 'The text of Combobox.Empty unless you give it children: combobox.noResults.',
  },
  loadingText: {
    type: 'string',
    default: '–',
    description: 'The text of the loading state: combobox.loading.',
  },
  controlProps: {
    type: 'ComboboxControlPartProps',
    default: '–',
    description: 'Spread on the box around the input. It anchors the popup when present.',
  },
  inputProps: {
    type: 'ComboboxInputPartProps',
    default: '–',
    description: 'Spread on an <input>: role combobox, ARIA, value and handlers.',
  },
  toggleProps: {
    type: 'ComboboxTogglePartProps',
    default: '–',
    description: 'Spread on a <button> that opens and closes the popup. Not a tab stop.',
  },
  clearProps: {
    type: 'ComboboxClearPartProps',
    default: '–',
    description: 'Spread on a <button> that empties the text and the value. Not a tab stop.',
  },
  valueListProps: {
    type: 'ComboboxValueListPartProps',
    default: '–',
    description: 'Spread on the <ul> of the chosen values (multiple).',
  },
  getValueProps: {
    type: '(value: { key: string }) => ComboboxValuePartProps',
    default: '–',
    description: 'The props of one chosen value’s <li>.',
  },
  getRemoveButtonProps: {
    type: '(value: ComboboxSelectedValue<TItem>) => ComboboxRemoveButtonPartProps',
    default: '–',
    description: 'The props of a chosen value’s remove button.',
  },
  popupProps: {
    type: 'ListboxPopupPartProps & { "data-loading"?: "" }',
    default: '–',
    description:
      'Spread on the popup: popover="manual", its id and ref. data-loading while loading.',
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
    description: 'The hidden inputs of a plain form (Combobox only).',
  },
})

export const useComboboxHook: ApiHook = {
  name: 'useCombobox',
  options: propRows<UseComboboxOptions<unknown>>(comboboxRootRows),
  result: comboboxResultRows,
}

export const comboboxControlRows = propRows<Pick<ComboboxControlProps, 'render'>>({
  render: renderRow('div', 'ComboboxPartState'),
})
export const comboboxInputRows = propRows<Pick<ComboboxInputProps, 'render'>>({
  render: renderRow('input', 'ComboboxPartState'),
})
export const comboboxToggleRows = propRows<Pick<ComboboxToggleProps, 'render'>>({
  render: renderRow('button', 'ComboboxPartState'),
})
export const comboboxClearRows = propRows<Pick<ComboboxClearProps, 'render'>>({
  render: renderRow('button', 'ComboboxPartState'),
})
export const valueListRows = propRows<Pick<ComboboxValueListProps, 'children' | 'render'>>({
  children: {
    type: 'ReactNode | (item: TItem, value: ComboboxSelectedValue<TItem>) => ReactNode',
    default: 'One Combobox.Value per chosen value',
    description: 'A function that renders one Combobox.Value per chosen value.',
  },
  render: renderRow('ul', 'ComboboxPartState'),
})
export const valueRows = propRows<
  Pick<ComboboxValueProps, 'item' | 'children' | 'removeIcon' | 'render'>
>({
  item: {
    type: 'TItem',
    description: 'One of the chosen items, as ValueList hands it to you, unchanged.',
  },
  children: {
    type: 'ReactNode',
    default: 'The item’s text',
    description:
      'The visible text. The remove button’s name uses the item’s text (itemToString), so these children must show it (2.5.3).',
  },
  removeIcon: {
    type: 'ReactNode',
    default: 'A cross drawn by the theme',
    description: 'Replaces the cross at the end of the chip, inside the remove button.',
  },
  render: renderRow('li', 'ComboboxValueState<TItem>'),
})

/** The state attributes the Control and the Input share, with the Field's. */
const fieldStateAttributes: readonly AttributeRow[] = [
  dataRow('data-invalid', 'The Field is invalid.'),
  dataRow('data-required', 'The Field is required.'),
  dataRow('data-disabled', 'The Combobox is disabled.'),
]

/** The field parts' attributes, for `kv-combobox-*` or `kv-autocomplete-*`. */
export function fieldAttributes(prefix: 'combobox' | 'autocomplete') {
  return {
    control: [
      classRow(
        `kv-${prefix}-control`,
        'The part class. The default theme draws the field’s edge on it.',
      ),
      dataRow('data-open', 'The popup is open.'),
      dataRow('data-focus-visible', 'The input has keyboard focus (:focus-visible).'),
      ...fieldStateAttributes,
    ],
    input: [
      classRow(`kv-${prefix}-input`, 'The part class.'),
      dataRow('data-open', 'The popup is open.'),
      dataRow('data-focused', 'The input has focus, however it got it.'),
      dataRow('data-focus-visible', 'The input has keyboard focus (:focus-visible).'),
      ...fieldStateAttributes,
    ],
    toggle: [
      classRow(`kv-${prefix}-toggle`, 'The part class. The default theme draws a chevron.'),
      dataRow('data-open', 'The popup is open.'),
      dataRow('data-disabled', 'The Toggle is disabled.'),
    ],
    clear: [
      classRow(`kv-${prefix}-clear`, 'The part class.'),
      dataRow('data-disabled', 'The Clear button is disabled.'),
    ],
  } satisfies Record<string, readonly AttributeRow[]>
}

export const valueListAttributes: readonly AttributeRow[] = [
  classRow(
    'kv-tag-group-list',
    'The part class. kv-combobox-value-list stays as an alias for one minor version.',
  ),
]
export const valueAttributes: readonly AttributeRow[] = [
  classRow(
    'kv-tag',
    'The part class on the <li>. kv-combobox-value stays as an alias for one minor version.',
  ),
  classRow(
    'kv-combobox-value-label',
    'The class of the text inside the button (an alias, no styles).',
  ),
  classRow(
    'kv-tag-remove',
    'The class of the button inside it, the whole chip. kv-combobox-value-remove stays as an alias for one minor version.',
  ),
  dataRow('data-disabled', 'The Combobox is disabled.'),
]

/** The popup's attributes, plus the one only Combobox and Autocomplete set. */
export const popupWithLoadingAttributes = (
  popup: readonly AttributeRow[],
): readonly AttributeRow[] => [
  ...popup,
  dataRow('data-loading', 'The popup is open and isLoading is on.'),
]
