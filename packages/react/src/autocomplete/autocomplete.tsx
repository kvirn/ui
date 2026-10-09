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
  ComboboxOptionDescription,
  ComboboxOptionIcon,
  ComboboxOptionIndicator,
  ComboboxOptionText,
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
  ComboboxOptionDescriptionProps,
  ComboboxOptionIconProps,
  ComboboxOptionIndicatorProps,
  ComboboxOptionProps,
  ComboboxOptionTextProps,
  ComboboxPopupProps,
  ComboboxToggleProps,
} from '../combobox/combobox.tsx'
import { useAutocomplete } from './use-autocomplete.ts'
import type { UseAutocompleteOptions } from './use-autocomplete.ts'

export type AutocompleteRootProps<TItem> = UseAutocompleteOptions<TItem> & {
  children?: ReactNode
}

/**
 * Owns the state of an Autocomplete: the suggestions and the text (contract:
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
 * <Field.Root>
 *   <Field.Label>Gatuadress</Field.Label>
 *   <Autocomplete.Root items={streets} value={street} onValueChange={setStreet} name="street">
 *     <Autocomplete.Input />
 *     <Autocomplete.Popup>
 *       <Autocomplete.List>{(street) => <Autocomplete.Option item={street} />}</Autocomplete.List>
 *     </Autocomplete.Popup>
 *   </Autocomplete.Root>
 * </Field.Root>
 */
export function AutocompleteRoot<TItem>(props: AutocompleteRootProps<TItem>): ReactElement {
  const autocomplete = useAutocomplete(props)
  return <ComboboxProviders combobox={autocomplete}>{props.children}</ComboboxProviders>
}
AutocompleteRoot.displayName = 'Autocomplete.Root'

// The field's parts and the popup parts are the Combobox's: the Root decides how they behave. Each
// is a thin wrapper that renders the Combobox part with all its props (ref included), so it has
// the display name an adopter writes, and a generic `TItem` flows through.

export type AutocompleteClearProps = ComboboxClearProps
export type AutocompleteControlProps = ComboboxControlProps
export type AutocompleteEmptyProps = ComboboxEmptyProps
export type AutocompleteGroupLabelProps = ComboboxGroupLabelProps
export type AutocompleteGroupProps<TItem = unknown> = ComboboxGroupProps<TItem>
export type AutocompleteInputProps = ComboboxInputProps
export type AutocompleteItemRenderer<TItem> = ComboboxItemRenderer<TItem>
export type AutocompleteListProps<TItem = unknown> = ComboboxListProps<TItem>
export type AutocompleteOptionProps<TItem = unknown> = ComboboxOptionProps<TItem>
export type AutocompleteOptionDescriptionProps = ComboboxOptionDescriptionProps
export type AutocompleteOptionIconProps = ComboboxOptionIconProps
export type AutocompleteOptionIndicatorProps = ComboboxOptionIndicatorProps
export type AutocompleteOptionTextProps = ComboboxOptionTextProps
export type AutocompletePopupProps = ComboboxPopupProps
export type AutocompleteToggleProps = ComboboxToggleProps

/** The control's box: the `Combobox.Control` under the Autocomplete's name. */
export function AutocompleteControl(props: AutocompleteControlProps): ReactElement {
  return <ComboboxControl {...props} />
}
AutocompleteControl.displayName = 'Autocomplete.Control'

/** The text input: the `Combobox.Input` under the Autocomplete's name. */
export function AutocompleteInput(props: AutocompleteInputProps): ReactElement {
  return <ComboboxInput {...props} />
}
AutocompleteInput.displayName = 'Autocomplete.Input'

/** The button that opens the suggestions: the `Combobox.Toggle` under the Autocomplete's name. */
export function AutocompleteToggle(props: AutocompleteToggleProps): ReactElement {
  return <ComboboxToggle {...props} />
}
AutocompleteToggle.displayName = 'Autocomplete.Toggle'

/** The button that clears the text: the `Combobox.Clear` under the Autocomplete's name. */
export function AutocompleteClear(props: AutocompleteClearProps): ReactElement {
  return <ComboboxClear {...props} />
}
AutocompleteClear.displayName = 'Autocomplete.Clear'

/** The suggestions popup: the `Combobox.Popup` under the Autocomplete's name. */
export function AutocompletePopup(props: AutocompletePopupProps): ReactElement {
  return <ComboboxPopup {...props} />
}
AutocompletePopup.displayName = 'Autocomplete.Popup'

/** The suggestions list inside the popup: the `Combobox.List` under the Autocomplete's name. */
export function AutocompleteList<TItem = unknown>(
  props: AutocompleteListProps<TItem>,
): ReactElement {
  return <ComboboxList<TItem> {...props} />
}
AutocompleteList.displayName = 'Autocomplete.List'

/** One suggestion: the `Combobox.Option` under the Autocomplete's name. */
export function AutocompleteOption<TItem = unknown>(
  props: AutocompleteOptionProps<TItem>,
): ReactElement {
  return <ComboboxOption<TItem> {...props} />
}
AutocompleteOption.displayName = 'Autocomplete.Option'

/** A decorative icon, flag or avatar at the start of a suggestion: the `Combobox.OptionIcon` under the Autocomplete's name. */
export function AutocompleteOptionIcon(props: AutocompleteOptionIconProps): ReactElement {
  return <ComboboxOptionIcon {...props} />
}
AutocompleteOptionIcon.displayName = 'Autocomplete.OptionIcon'

/** The text that names a rich suggestion: the `Combobox.OptionText` under the Autocomplete's name. */
export function AutocompleteOptionText(props: AutocompleteOptionTextProps): ReactElement {
  return <ComboboxOptionText {...props} />
}
AutocompleteOptionText.displayName = 'Autocomplete.OptionText'

/** The second line that describes a rich suggestion: the `Combobox.OptionDescription` under the Autocomplete's name. */
export function AutocompleteOptionDescription(
  props: AutocompleteOptionDescriptionProps,
): ReactElement {
  return <ComboboxOptionDescription {...props} />
}
AutocompleteOptionDescription.displayName = 'Autocomplete.OptionDescription'

/** The selection mark at the end of a suggestion: the `Combobox.OptionIndicator` under the Autocomplete's name. */
export function AutocompleteOptionIndicator(props: AutocompleteOptionIndicatorProps): ReactElement {
  return <ComboboxOptionIndicator {...props} />
}
AutocompleteOptionIndicator.displayName = 'Autocomplete.OptionIndicator'

/** A group of suggestions: the `Combobox.Group` under the Autocomplete's name. */
export function AutocompleteGroup<TItem = unknown>(
  props: AutocompleteGroupProps<TItem>,
): ReactElement {
  return <ComboboxGroup<TItem> {...props} />
}
AutocompleteGroup.displayName = 'Autocomplete.Group'

/** A group's label: the `Combobox.GroupLabel` under the Autocomplete's name. */
export function AutocompleteGroupLabel(props: AutocompleteGroupLabelProps): ReactElement {
  return <ComboboxGroupLabel {...props} />
}
AutocompleteGroupLabel.displayName = 'Autocomplete.GroupLabel'

/** The no-results text: the `Combobox.Empty` under the Autocomplete's name. */
export function AutocompleteEmpty(props: AutocompleteEmptyProps): ReactElement {
  return <ComboboxEmpty {...props} />
}
AutocompleteEmpty.displayName = 'Autocomplete.Empty'

/**
 * The Autocomplete's parts. `Root` with `Input` and `Popup` is the editable combobox
 * for free text with suggestions (the APG combobox with list autocomplete): the value is the
 * text. `Control`, `Toggle` and `Clear` are optional. The parts are the Combobox's, so a Combobox
 * and an Autocomplete are built the same way.
 */
export const Autocomplete = {
  Root: AutocompleteRoot,
  Control: AutocompleteControl,
  Input: AutocompleteInput,
  Toggle: AutocompleteToggle,
  Clear: AutocompleteClear,
  Popup: AutocompletePopup,
  List: AutocompleteList,
  Option: AutocompleteOption,
  OptionIcon: AutocompleteOptionIcon,
  OptionText: AutocompleteOptionText,
  OptionDescription: AutocompleteOptionDescription,
  OptionIndicator: AutocompleteOptionIndicator,
  Group: AutocompleteGroup,
  GroupLabel: AutocompleteGroupLabel,
  Empty: AutocompleteEmpty,
} as const
