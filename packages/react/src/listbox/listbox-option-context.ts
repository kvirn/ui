import { createContext } from 'react'

// Internal. How the parts inside a `Listbox.Option` (`OptionText`, `OptionDescription`,
// `OptionIndicator`) find their option, and how the option learns which of them rendered, so it
// can point `aria-labelledby` and `aria-describedby` at them and mark `data-has-indicator`.
// Listbox, Combobox and Autocomplete share it: the Combobox and Autocomplete parts are wrappers
// around the Listbox's.

/** The parts of an option that register themselves with it. `OptionIcon` needs nothing from it. */
export type ListboxOptionPartKind = 'text' | 'description' | 'indicator'

/** What `render` receives as its second argument, for the option's parts. */
export interface ListboxOptionPartState {
  isActive: boolean
  isSelected: boolean
  isDisabled: boolean
}

export interface ListboxOptionContextValue extends ListboxOptionPartState {
  /** The id of the `OptionText`, the option's `aria-labelledby` target. */
  textId: string
  /** The id of the `OptionDescription`, the option's `aria-describedby` target. */
  descriptionId: string
  /** The option's text (`itemToString`), which `OptionText` should match. */
  label: string
  /** Registers a part while it is mounted. Returns the function that unregisters it. */
  registerPart: (kind: ListboxOptionPartKind) => () => void
}

export const ListboxOptionContext = createContext<ListboxOptionContextValue | null>(null)

/** The ids of an option's text and description, derived from the option's own id. */
export function getListboxOptionPartIds(optionId: string): {
  textId: string
  descriptionId: string
} {
  return { textId: `${optionId}-text`, descriptionId: `${optionId}-description` }
}
