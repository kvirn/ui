import type { ListboxEntry, ListboxSection } from '@kvirn-ui/core'
import { createContext } from 'react'
import type {
  ListboxEmptyPartProps,
  ListboxGroupLabelPartProps,
  ListboxGroupPartProps,
  ListboxListPartProps,
  ListboxOptionEntry,
  ListboxOptionPartProps,
  ListboxPopupPartProps,
  ListboxTriggerPartProps,
  ListboxValuePartProps,
} from './use-listbox.ts'
import type { ListboxVirtualization } from './use-list-virtualization.ts'

// Internal. How the parts of a Listbox find each other, without DOM queries.
//
// - ListboxListContext: what the popup and the options need. Listbox, Combobox and Autocomplete
//   share the popup parts (`Listbox.Popup`, `List`, `Option`, `Group`, `GroupLabel` and `Empty`),
//   and each Root provides this context, so those parts work under any of them.
// - ListboxTriggerContext: what the trigger and the value need. Only the Listbox has them: a
//   Combobox has an input instead.
//
// The values are untyped in the item (`unknown`), because a context can't be generic. Methods
// are declared as methods, so a `ListboxEntry<Municipality>` still fits where a
// `ListboxEntry<unknown>` is asked for.

export interface ListboxListContextValue {
  isOpen: boolean
  entries: readonly ListboxEntry<unknown>[]
  sections: readonly ListboxSection<unknown>[] | undefined
  size: number
  /** The active option's key. `undefined` while closed and until the user moves. */
  activeKey: string | undefined
  popupProps: ListboxPopupPartProps
  listProps: ListboxListPartProps
  emptyProps: ListboxEmptyPartProps
  /** The default text of `Listbox.Empty`: `combobox.noResults`. */
  emptyText: string
  getOptionProps(entry: ListboxOptionEntry): ListboxOptionPartProps
  getGroupProps(section: { key: string }): ListboxGroupPartProps
  getGroupLabelProps(section: { key: string }): ListboxGroupLabelPartProps
  /** The entry of an item the list rendered, found by identity. */
  getEntry(item: unknown): ListboxEntry<unknown> | undefined
  /** `false` while the pointer moved the active option: it is already under the pointer. */
  shouldScrollToActive(): boolean
  /** Set while the list is virtualized: the options to render, the sizer and each option's place. */
  virtualization: ListboxVirtualization | undefined
}

export const ListboxListContext = createContext<ListboxListContextValue | null>(null)

/**
 * `true` inside the virtualized list's sizer: the options `Listbox.List` renders there get their
 * place and `aria-setsize`. An option you render yourself, outside it, gets neither.
 */
export const ListboxVirtualContext = createContext(false)

export interface ListboxTriggerContextValue {
  isOpen: boolean
  triggerProps: ListboxTriggerPartProps
  valueProps: ListboxValuePartProps
  /** The chosen items, in the order chosen. */
  selectedItems: readonly unknown[]
  /** The chosen items' texts. */
  selectedLabels: readonly string[]
  /** `Listbox.Root`'s `placeholder`: what `Listbox.Value` shows while nothing is chosen. */
  placeholder: string | undefined
}

export const ListboxTriggerContext = createContext<ListboxTriggerContextValue | null>(null)

/** The group a `Listbox.GroupLabel` is in. */
export interface ListboxGroupContextValue {
  section: ListboxSection<unknown>
}

export const ListboxGroupContext = createContext<ListboxGroupContextValue | null>(null)
