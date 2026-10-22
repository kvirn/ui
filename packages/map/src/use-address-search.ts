import { useAddressLookup } from '@kvirn-ui/react/internal'
import type {
  AddressLookupState,
  AddressLookupStatusPartProps,
  AddressLookupSubmitPartProps,
  UseAddressLookupOptions,
  UseAddressLookupResult,
} from '@kvirn-ui/react/internal'

export type AddressSearchState = AddressLookupState
export type UseAddressSearchOptions = UseAddressLookupOptions
export type AddressSearchSubmitPartProps = AddressLookupSubmitPartProps
export type AddressSearchStatusPartProps = AddressLookupStatusPartProps
export type UseAddressSearchResult = UseAddressLookupResult

/**
 * The state and props of an address search (contract: address-search.a11y.md): an Autocomplete
 * over a geocoder's answers. It searches on request (Enter or the Search button) unless the
 * geocoder declares `suggest: true`, never sends before the visitor types, cancels the request in
 * flight on each new one, and says what it does through the Announcer (needs a `KvirnProvider`).
 * Enter with no suggestion active searches and never submits a form.
 *
 * @example
 * const search = useAddressSearch({ geocoder, onResult: (result) => map.show(result) })
 * <input {...search.inputProps} />
 * <button {...search.submitProps}>{search.submitText}</button>
 */
export const useAddressSearch = useAddressLookup
