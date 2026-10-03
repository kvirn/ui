'use client'
import type { ReactElement, ReactNode } from 'react'
import {
  ComboboxClear,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopup,
  ComboboxProviders,
  ComboboxToggle,
} from '../combobox/combobox.tsx'
import type {
  ComboboxClearProps,
  ComboboxControlProps,
  ComboboxEmptyProps,
  ComboboxGroupLabelProps,
  ComboboxGroupProps,
  ComboboxInputProps,
  ComboboxItemRenderer,
  ComboboxListProps,
  ComboboxOptionProps,
  ComboboxOptionState,
  ComboboxPartState,
  ComboboxPopupProps,
  ComboboxToggleProps,
} from '../combobox/combobox.tsx'
import { useAutocomplete } from './use-autocomplete.ts'
import type { UseAutocompleteOptions } from './use-autocomplete.ts'

export type AutocompleteRootProps<TItem> = UseAutocompleteOptions<TItem> & {
  children?: ReactNode
}

/**
 * Owns the state of an Autocomplete: the suggestions and the text (ADR-0037, item 5; contract:
 * autocomplete.a11y.md). It renders no element of its own: put an `Autocomplete.Input` and an
 * `Autocomplete.Popup` inside it, in a `Field`, the popup right after the input.
 *
 * The value is the text, which may match nothing: it is controlled with `value` and
 * `onValueChange`, or uncontrolled with `defaultValue`, and with `name` the input carries it in a
 * plain `<form>`. Picking a suggestion fills the input and closes the popup. Suggestions never
 * block other text: Enter with no active suggestion is the browser's own, so a form can submit
 * what was typed.
 *
 * @example
 * <Field>
 *   <Label>Gatuadress</Label>
 *   <Autocomplete.Root items={streets} value={street} onValueChange={setStreet} name="street">
 *     <Autocomplete.Input />
 *     <Autocomplete.Popup>
 *       <Autocomplete.List>{(street) => <Autocomplete.Option item={street} />}</Autocomplete.List>
 *     </Autocomplete.Popup>
 *   </Autocomplete.Root>
 * </Field>
 */
export function AutocompleteRoot<TItem>(props: AutocompleteRootProps<TItem>): ReactElement {
  const autocomplete = useAutocomplete(props)
  return <ComboboxProviders combobox={autocomplete}>{props.children}</ComboboxProviders>
}
AutocompleteRoot.displayName = 'Autocomplete.Root'

// The field's parts and the popup parts are the Combobox's: the Root decides how they behave.
export {
  ComboboxClear as AutocompleteClear,
  ComboboxControl as AutocompleteControl,
  ComboboxEmpty as AutocompleteEmpty,
  ComboboxGroup as AutocompleteGroup,
  ComboboxGroupLabel as AutocompleteGroupLabel,
  ComboboxInput as AutocompleteInput,
  ComboboxList as AutocompleteList,
  ComboboxOption as AutocompleteOption,
  ComboboxPopup as AutocompletePopup,
  ComboboxToggle as AutocompleteToggle,
}
export type AutocompleteClearProps = ComboboxClearProps
export type AutocompleteControlProps = ComboboxControlProps
export type AutocompleteEmptyProps = ComboboxEmptyProps
export type AutocompleteGroupLabelProps = ComboboxGroupLabelProps
export type AutocompleteGroupProps<TItem = unknown> = ComboboxGroupProps<TItem>
export type AutocompleteInputProps = ComboboxInputProps
export type AutocompleteItemRenderer<TItem> = ComboboxItemRenderer<TItem>
export type AutocompleteListProps<TItem = unknown> = ComboboxListProps<TItem>
export type AutocompleteOptionProps<TItem = unknown> = ComboboxOptionProps<TItem>
export type AutocompleteOptionState<TItem = unknown> = ComboboxOptionState<TItem>
export type AutocompletePartState = ComboboxPartState
export type AutocompletePopupProps = ComboboxPopupProps
export type AutocompleteToggleProps = ComboboxToggleProps

/**
 * The Autocomplete's parts (ADR-0037). `Root` with `Input` and `Popup` is the editable combobox
 * for free text with suggestions (the APG combobox with list autocomplete): the value is the
 * text. `Control`, `Toggle` and `Clear` are optional. The parts are the Combobox's, so a Combobox
 * and an Autocomplete are built the same way.
 */
export const Autocomplete = {
  Root: AutocompleteRoot,
  Control: ComboboxControl,
  Input: ComboboxInput,
  Toggle: ComboboxToggle,
  Clear: ComboboxClear,
  Popup: ComboboxPopup,
  List: ComboboxList,
  Option: ComboboxOption,
  Group: ComboboxGroup,
  GroupLabel: ComboboxGroupLabel,
  Empty: ComboboxEmpty,
} as const
