import type { AddressResult, GeocoderProvider } from '@kvirn-ui/core'
import { createContext } from 'react'
import type { AddressFill } from './use-address-fill.ts'
import type { UseAddressInputResult } from './use-address-input.ts'

export interface AddressInputContextValue extends Pick<
  UseAddressInputResult,
  'getInputProps' | 'postalCodeMask'
> {
  /** The country that applies: the Country part's, else the Root's, else the provider's. */
  country: string | undefined
  /** The Root's own country, which the Country part lists first. */
  defaultCountry: string | undefined
  geocoder: GeocoderProvider | undefined
  onLookupResult: ((result: AddressResult) => void) | undefined
  hasCountryPart: boolean
  registerCountryPart: () => () => void
  selectCountry: (country: string) => void
  fill: AddressFill
}

export const AddressInputContext = createContext<AddressInputContextValue | null>(null)
