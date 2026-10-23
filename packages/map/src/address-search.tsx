import type { AddressSuggestion } from '@kvirn-ui/core'
import { error as errorIcon, info as infoIcon } from '@kvirn-ui/icons'
import { Autocomplete, Field, Icon } from '@kvirn-ui/react'
import type {
  AutocompleteClearProps,
  AutocompleteControlProps,
  AutocompleteInputProps,
  AutocompleteListProps,
  AutocompleteOptionProps,
  AutocompletePopupProps,
  FieldHelpTextProps,
  FieldLabelProps,
  FieldRootProps,
} from '@kvirn-ui/react'
import {
  ComboboxProviders,
  useAddressLookupEngine,
  useAddressLookupField,
} from '@kvirn-ui/react/internal'
import type { AddressLookupEngine } from '@kvirn-ui/react/internal'
import { createContext, useContext } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { joinClassNames } from './class-names.ts'
import type { UseAddressSearchOptions, UseAddressSearchResult } from './use-address-search.ts'

const AddressSearchContext = createContext<UseAddressSearchResult | null>(null)

function useAddressSearchContext(partName: string): UseAddressSearchResult {
  const search = useContext(AddressSearchContext)
  if (search === null) {
    throw new Error(`AddressSearch.${partName} must be rendered inside AddressSearch.Root.`)
  }
  return search
}

function AddressSearchField({
  engine,
  children,
}: {
  engine: AddressLookupEngine
  children?: ReactNode
}): ReactElement {
  const search = useAddressLookupField(engine)
  return (
    <AddressSearchContext.Provider value={search}>
      <ComboboxProviders combobox={search}>{children}</ComboboxProviders>
    </AddressSearchContext.Provider>
  )
}

export interface AddressSearchRootProps
  extends Omit<FieldRootProps, 'messages' | 'controlId' | 'disabled'>, UseAddressSearchOptions {}

/**
 * Owns an address search: a `Field` whose control is an Autocomplete over the geocoder's answers.
 * Put `AddressSearch.Label`, `AddressSearch.Control` (with `Input`, `Clear` and `Submit`),
 * `HelpText`, `Notice` and `AddressSearch.Popup` inside it, in this order. The consumer wraps it in
 * `<search>` beside a map, and not inside a form.
 */
export function AddressSearchRoot({
  geocoder,
  onResult,
  minLength,
  debounce,
  timeoutMilliseconds,
  country,
  limitToCountry,
  describePick,
  initialText,
  disabled,
  id,
  messages,
  className,
  children,
  ...fieldProps
}: AddressSearchRootProps): ReactElement {
  const engine = useAddressLookupEngine({
    geocoder,
    onResult,
    minLength,
    debounce,
    timeoutMilliseconds,
    country,
    limitToCountry,
    describePick,
    initialText,
    disabled,
    id,
    messages,
  })
  return (
    <Field.Root
      {...fieldProps}
      controlId={id}
      disabled={disabled}
      className={joinClassNames('kv-address-search', className)}
      data-status={engine.status}
    >
      <AddressSearchField engine={engine}>{children}</AddressSearchField>
    </Field.Root>
  )
}
AddressSearchRoot.displayName = 'AddressSearch.Root'

/** The visible label, a `<label for>`. Default text: `addressSearch.label`. */
export function AddressSearchLabel({ children, ...props }: FieldLabelProps): ReactElement {
  const search = useAddressSearchContext('Label')
  return (
    <Field.Label marker="none" {...props}>
      {children ?? search.labelText}
    </Field.Label>
  )
}
AddressSearchLabel.displayName = 'AddressSearch.Label'

export type AddressSearchControlProps = AutocompleteControlProps

/** The box around the input, Clear and Submit; the popup is placed against it. */
export function AddressSearchControl(props: AddressSearchControlProps): ReactElement {
  return <Autocomplete.Control {...props} />
}
AddressSearchControl.displayName = 'AddressSearch.Control'

export type AddressSearchInputProps = AutocompleteInputProps

/** The `role="combobox"` text field. Enter with no suggestion active searches and never submits a form. */
export function AddressSearchInput(props: AddressSearchInputProps): ReactElement {
  return <Autocomplete.Input {...props} />
}
AddressSearchInput.displayName = 'AddressSearch.Input'

export type AddressSearchClearProps = AutocompleteClearProps

/** Empties the text and calls `onResult(null)`. Not a tab stop. */
export function AddressSearchClear(props: AddressSearchClearProps): ReactElement {
  return <Autocomplete.Clear {...props} />
}
AddressSearchClear.displayName = 'AddressSearch.Clear'

export type AddressSearchSubmitProps = ComponentPropsWithRef<'button'>

/** The Search button, a native `type="button"`. Rendered only when the search is on request. */
export function AddressSearchSubmit({
  children,
  onClick,
  ...otherProps
}: AddressSearchSubmitProps): ReactElement | null {
  const search = useAddressSearchContext('Submit')
  if (!search.isOnRequest) {
    return null
  }
  const { onClick: runSearch, ...submitProps } = search.submitProps
  return (
    <button
      {...otherProps}
      {...submitProps}
      className={joinClassNames(submitProps.className, otherProps.className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          runSearch()
        }
      }}
    >
      {children ?? search.submitText}
    </button>
  )
}
AddressSearchSubmit.displayName = 'AddressSearch.Submit'

export type AddressSearchHelpTextProps = FieldHelpTextProps

/** The instruction under the field. Default text: `addressSearch.helpRequest` or `helpSuggest`. */
export function AddressSearchHelpText({
  children,
  ...props
}: AddressSearchHelpTextProps): ReactElement {
  const search = useAddressSearchContext('HelpText')
  return <Field.HelpText {...props}>{children ?? search.helpText}</Field.HelpText>
}
AddressSearchHelpText.displayName = 'AddressSearch.HelpText'

export type AddressSearchNoticeProps = FieldHelpTextProps

/**
 * Says where the typed text goes (`addressSearch.privacy`, with the geocoder's `name`), then the
 * geocoder's `attribution`. It is part of the input's description.
 */
export function AddressSearchNotice({
  children,
  className,
  ...props
}: AddressSearchNoticeProps): ReactElement {
  const search = useAddressSearchContext('Notice')
  return (
    <Field.HelpText {...props} className={joinClassNames('kv-address-lookup-notice', className)}>
      {children ?? (
        <>
          {search.noticeText}
          {search.attribution === undefined ? null : ` ${search.attribution}`}
        </>
      )}
    </Field.HelpText>
  )
}
AddressSearchNotice.displayName = 'AddressSearch.Notice'

export type AddressSearchPopupProps = AutocompletePopupProps

/** The popup: the status line, then the suggestions. */
export function AddressSearchPopup(props: AddressSearchPopupProps): ReactElement {
  return <Autocomplete.Popup {...props} />
}
AddressSearchPopup.displayName = 'AddressSearch.Popup'

export type AddressSearchStatusProps = Omit<ComponentPropsWithRef<'div'>, 'children'>

/**
 * The line above the suggestions: searching, too short, no result, error, offline or a pick that `describePick` rejected. Plain text
 * with an icon, never a live region: the same words are announced through the Announcer.
 */
export function AddressSearchStatus({
  className,
  ...otherProps
}: AddressSearchStatusProps): ReactElement | null {
  const search = useAddressSearchContext('Status')
  if (!search.isOpen || search.statusText === undefined) {
    return null
  }
  const { className: statusClassName, ...statusProps } = search.statusProps
  return (
    <div {...otherProps} {...statusProps} className={joinClassNames(statusClassName, className)}>
      {search.status === 'searching' ? (
        <span className="kv-spinner" aria-hidden="true" />
      ) : search.status === 'error' ? (
        <Icon icon={errorIcon} size="16" />
      ) : search.status === 'offline' ? (
        <Icon icon={infoIcon} size="16" />
      ) : null}
      {search.statusText}
    </div>
  )
}
AddressSearchStatus.displayName = 'AddressSearch.Status'

export type AddressSearchListProps = AutocompleteListProps<AddressSuggestion>

/** The suggestions' `listbox`, named by the label. */
export function AddressSearchList(props: AddressSearchListProps): ReactElement {
  return <Autocomplete.List<AddressSuggestion> {...props} />
}
AddressSearchList.displayName = 'AddressSearch.List'

export type AddressSearchOptionProps = AutocompleteOptionProps<AddressSuggestion>

/** One suggestion. Its text is the geocoder's `label`. */
export function AddressSearchOption(props: AddressSearchOptionProps): ReactElement {
  return <Autocomplete.Option<AddressSuggestion> {...props} />
}
AddressSearchOption.displayName = 'AddressSearch.Option'

export interface AddressSearchProps extends Omit<AddressSearchRootProps, 'children'> {
  /** The visible label. Default: `addressSearch.label`. */
  label?: ReactNode
}

/**
 * An address search: a label, a field with Clear and a Search button, help text, a privacy
 * notice and the suggestions. `onResult` gets the picked address with its position; nothing
 * moves focus or submits a form. Build your own order from the parts.
 *
 * @example
 * <search>
 *   <AddressSearch geocoder={geocoder} onResult={(result) => (result ? map.show(result) : map.clearResult())} />
 * </search>
 */
export function AddressSearch({ label, ...rootProps }: AddressSearchProps): ReactElement {
  return (
    <AddressSearchRoot {...rootProps}>
      <AddressSearchLabel>{label}</AddressSearchLabel>
      <AddressSearchControl>
        <AddressSearchInput />
        <AddressSearchClear />
        <AddressSearchSubmit />
      </AddressSearchControl>
      <AddressSearchHelpText />
      <AddressSearchNotice />
      <AddressSearchPopup>
        <AddressSearchStatus />
        <AddressSearchList>{(item) => <AddressSearchOption item={item} />}</AddressSearchList>
      </AddressSearchPopup>
    </AddressSearchRoot>
  )
}
AddressSearch.displayName = 'AddressSearch'
AddressSearch.Root = AddressSearchRoot
AddressSearch.Label = AddressSearchLabel
AddressSearch.Control = AddressSearchControl
AddressSearch.Input = AddressSearchInput
AddressSearch.Clear = AddressSearchClear
AddressSearch.Submit = AddressSearchSubmit
AddressSearch.HelpText = AddressSearchHelpText
AddressSearch.Notice = AddressSearchNotice
AddressSearch.Popup = AddressSearchPopup
AddressSearch.Status = AddressSearchStatus
AddressSearch.List = AddressSearchList
AddressSearch.Option = AddressSearchOption
