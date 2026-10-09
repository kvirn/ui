import type {
  AutocompleteRootProps,
  UseAutocompleteOptions,
  UseAutocompleteResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook } from '../components/api-block.tsx'
import { comboboxResultRows, comboboxRootRows } from './combobox.api.ts'

export const autocompleteRootRows = propRows<Omit<AutocompleteRootProps<unknown>, 'children'>>({
  items: comboboxRootRows.items,
  groups: comboboxRootRows.groups,
  itemToString: {
    type: '(item: TItem) => string',
    default: 'String(item)',
    description:
      'The text of an item: shown in the list, matched by the filter, and put in the input when it is picked.',
  },
  itemToKey: {
    type: '(item: TItem) => string',
    default: 'itemToString',
    description:
      'A stable, unique key that identifies an option in the list. The default is its text, so give one only when two items share a text.',
  },
  isItemDisabled: comboboxRootRows.isItemDisabled,
  filter: comboboxRootRows.filter,
  isLoading: comboboxRootRows.isLoading,
  value: {
    type: 'string',
    default: '–',
    description: 'Controlled: the text. It may match no suggestion.',
  },
  defaultValue: {
    type: 'string',
    default: '–',
    description: 'Uncontrolled: the text to begin with.',
  },
  onValueChange: {
    type: "(value: string, { reason: 'input' | 'selection' | 'clear' }) => void",
    default: '–',
    description:
      'Called with the text when the user types, picks a suggestion (it fills the input) or clears. It only reports: update value yourself when it is controlled.',
  },
  name: {
    type: 'string',
    default: '–',
    description: 'Put on the input itself, so a plain form sends the text.',
  },
  disabled: comboboxRootRows.disabled,
  id: comboboxRootRows.id,
  open: comboboxRootRows.open,
  defaultOpen: comboboxRootRows.defaultOpen,
  onOpenChange: comboboxRootRows.onOpenChange,
  placement: comboboxRootRows.placement,
  offset: comboboxRootRows.offset,
  padding: comboboxRootRows.padding,
  announcementDebounceMilliseconds: comboboxRootRows.announcementDebounceMilliseconds,
  messages: comboboxRootRows.messages,
  virtualize: comboboxRootRows.virtualize,
})

export const autocompleteResultRows = propRows<UseAutocompleteResult<unknown>>({
  ...comboboxResultRows,
  variant: {
    type: "'autocomplete'",
    default: '–',
    description: 'Always autocomplete here.',
  },
  isMultiple: {
    type: 'boolean',
    default: '–',
    description: 'Always false: an Autocomplete takes one text.',
  },
  selectedKeys: {
    type: 'readonly string[]',
    default: '–',
    description: 'Not used: no suggestion is ever chosen. Picking one fills the input.',
  },
  selectedValues: {
    type: 'readonly ComboboxSelectedValue<TItem>[]',
    default: '–',
    description: 'Not used: no suggestion is ever chosen.',
  },
  hasClearableValue: {
    type: 'boolean',
    default: '–',
    description: 'There is text, so Clear has something to clear.',
  },
  valueListProps: {
    type: 'ComboboxValueListPartProps',
    default: '–',
    description: 'Not used: an Autocomplete has no list of chosen values.',
  },
  getValueProps: {
    type: '(value: { key: string }) => ComboboxValuePartProps',
    default: '–',
    description: 'Not used.',
  },
  getRemoveButtonProps: {
    type: '(value: ComboboxSelectedValue<TItem>) => ComboboxRemoveButtonPartProps',
    default: '–',
    description: 'Not used.',
  },
  hiddenInputs: {
    type: 'readonly { name: string; value: string }[]',
    default: '–',
    description: 'Always empty: the input carries the name.',
  },
})

export const useAutocompleteHook: ApiHook = {
  name: 'useAutocomplete',
  options: propRows<UseAutocompleteOptions<unknown>>(autocompleteRootRows),
  result: autocompleteResultRows,
}
