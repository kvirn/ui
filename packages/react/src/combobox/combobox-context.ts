import { createContext } from 'react'
import type {
  ComboboxClearPartProps,
  ComboboxControlPartProps,
  ComboboxInputPartProps,
  ComboboxRemoveButtonPartProps,
  ComboboxSelectedValue,
  ComboboxTogglePartProps,
  ComboboxValueListPartProps,
  ComboboxValuePartProps,
  ComboboxVariant,
} from './use-combobox.ts'

// Internal. How the parts of a Combobox or an Autocomplete find each other, without DOM queries
// (ADR-0037, item 7). The popup parts (`Popup`, `List`, `Option`, `Group`, `GroupLabel` and
// `Empty`) are the Listbox's, and read `ListboxListContext`, which each Root also provides. This
// context holds what only the field needs: the input, its box and buttons, and the value list.
//
// The values are untyped in the item (`unknown`), because a context can't be generic. Methods
// are declared as methods, so a `ComboboxSelectedValue<Municipality>` still fits where a
// `ComboboxSelectedValue<unknown>` is asked for.

export interface ComboboxContextValue {
  variant: ComboboxVariant
  isOpen: boolean
  isMultiple: boolean
  isDisabled: boolean
  /** There is text or a chosen value, so a Clear button has something to clear. */
  hasClearableValue: boolean
  controlProps: ComboboxControlPartProps
  inputProps: ComboboxInputPartProps
  toggleProps: ComboboxTogglePartProps
  clearProps: ComboboxClearPartProps
  valueListProps: ComboboxValueListPartProps
  /** The chosen values, in the order chosen. */
  selectedValues: readonly ComboboxSelectedValue<unknown>[]
  getValueProps(value: { key: string }): ComboboxValuePartProps
  getRemoveButtonProps(value: ComboboxSelectedValue<unknown>): ComboboxRemoveButtonPartProps
}

export const ComboboxContext = createContext<ComboboxContextValue | null>(null)
