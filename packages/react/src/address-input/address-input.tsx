'use client'
import type { AddressResult, GeocoderProvider, MaskInput } from '@kvirn-ui/core'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldGroupContext, FieldTextHostContext } from '../field/field-context.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useLocale } from '../provider/use-locale.ts'
import { TextInput } from '../text-input/text-input.tsx'
import type { TextInputProps } from '../text-input/text-input.tsx'
import { AddressInputContext } from './address-input-context.ts'
import type { AddressInputContextValue } from './address-input-context.ts'
import { AddressInputCountry } from './address-input-country.tsx'
import { AddressInputLine1Lookup } from './address-input-line1-lookup.tsx'
import type { AddressInputLine1Messages } from './address-input-line1-lookup.tsx'
import { useAddressFill } from './use-address-fill.ts'
import { useAddressInput } from './use-address-input.ts'
import type { AddressInputPart } from './use-address-input.ts'

export type { AddressInputPart, UseAddressInputOptions } from './use-address-input.ts'
export { AddressInputCountry } from './address-input-country.tsx'
export type { AddressInputCountryProps } from './address-input-country.tsx'
export type { AddressInputLine1Messages } from './address-input-line1-lookup.tsx'

export interface AddressInputRootProps extends ComponentPropsWithRef<'div'> {
  /**
   * The address's country, as an ISO 3166-1 alpha-2 code. It picks the postal code's mask and
   * width: `SE`, `FI` and `NO` have a mask, any other country takes letters and digits.
   * Default: the provider's `country`, else the one the locale implies.
   */
  country?: string | undefined
  /**
   * `'off'` turns every part off (someone else's address). Anything else, such as
   * `'section-postal'` or `'shipping'`, goes before each part's token. A part's own
   * `autoComplete` wins.
   */
  autoComplete?: string | undefined
  /**
   * Turns on the address lookup: `AddressInput.Line1` becomes a combobox that suggests addresses
   * from this geocoder as the visitor types, and stays free text. What is typed in Line 1 is sent
   * to it. Geocoders live in `@kvirn-ui/map` (`kvirnGeocoder`, `nominatim`, `googlePlaces`).
   */
  geocoder?: GeocoderProvider | undefined
  /** A pick that filled the boxes, with its position and id. Nothing is called when the text is cleared. */
  onLookupResult?: ((result: AddressResult) => void) | undefined
}

export interface AddressInputLineProps extends Omit<
  TextInputProps,
  'type' | 'mask' | 'announceRejections' | 'messages'
> {}

export interface AddressInputLine1Props extends AddressInputLineProps {
  /** With a `geocoder` on the Root: per-instance overrides for the lookup's strings. */
  messages?: AddressInputLine1Messages | undefined
  /** With a `geocoder`: the fewest characters, trimmed, before a search is sent. Default 3. */
  minLength?: number | undefined
  /** With a `geocoder`: milliseconds of no typing before a search as you type, default 400; `false` searches on request. */
  debounce?: number | false | undefined
  /** With a `geocoder`: how long to wait for an answer, in milliseconds. Default 10 000. */
  timeoutMilliseconds?: number | undefined
  /** With a `geocoder`: `false` leaves out the privacy notice above Line 1. Say where the text goes in the Field's help text instead. Default `true`. */
  privacyNotice?: boolean | undefined
}
export type AddressInputLine2Props = AddressInputLineProps
export type AddressInputCityProps = AddressInputLineProps

export interface AddressInputPostalCodeProps extends Omit<TextInputProps, 'type' | 'mask'> {
  /**
   * Replaces the country's mask. `false`: no mask, the box takes what is typed. Your own mask's
   * `inputMode` and `dir` win over the country's.
   */
  mask?: MaskInput | false | undefined
}

/**
 * An address of one text box per line (contract: address-input.a11y.md). Put it in a plain
 * `Fieldset.Root` whose `Fieldset.Legend` names the address, and each part in its own
 * `Field.Root` with a `Field.Label`, so a line has its own help text and error. It holds no form
 * state, never moves focus when a box is full and never rewrites a typed value when `country`
 * changes. It looks an address up only when you give the Root a `geocoder`: `AddressInput.Line1` then suggests addresses.
 * The boxes have no text of its own: every label, help text and error is yours.
 *
 * @example
 * <Fieldset.Root>
 *   <Fieldset.Legend>Your address</Fieldset.Legend>
 *   <AddressInput.Root country="SE">
 *     <Field.Root required>
 *       <Field.Label>Gatuadress</Field.Label>
 *       <AddressInput.Line1 name="line1" />
 *     </Field.Root>
 *     <Field.Root required>
 *       <Field.Label>Postal code</Field.Label>
 *       <AddressInput.PostalCode name="postalCode" />
 *       <Field.HelpText>For example 123 45</Field.HelpText>
 *     </Field.Root>
 *   </AddressInput.Root>
 * </Fieldset.Root>
 */
export function AddressInputRoot({
  country,
  autoComplete,
  geocoder,
  onLookupResult,
  children,
  ref,
  ...otherProps
}: AddressInputRootProps): ReactElement {
  const { country: providerCountry } = useLocale()
  const [chosenCountry, setChosenCountry] = useState<string | undefined>(undefined)
  const [countryPartCount, setCountryPartCount] = useState(0)
  const hasCountryPart = countryPartCount > 0
  const address = useAddressInput({
    country: hasCountryPart ? (chosenCountry ?? country) : country,
    autoComplete,
  })
  const fill = useAddressFill()
  const registerCountryPart = useCallback(() => {
    setCountryPartCount((count) => count + 1)
    return () => setCountryPartCount((count) => count - 1)
  }, [])
  const selectCountry = useCallback((next: string) => setChosenCountry(next.toUpperCase()), [])
  const host = useContext(FieldTextHostContext)
  const isInGroup = useContext(FieldGroupContext)
  const elementRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)

  useEffect(() => {
    if (elementRef.current?.closest('fieldset, [role="group"], [role="radiogroup"]') === null) {
      warnOnce(
        'address-input-outside-fieldset',
        'An AddressInput.Root is not inside a group, so its boxes have no shared name (WCAG 1.3.1, 3.3.2). Put it in <Fieldset.Root> with a <Fieldset.Legend> such as "Your address".',
      )
    }
  })

  const isInGroupFieldset = host !== null && isInGroup
  useEffect(() => {
    if (isInGroupFieldset) {
      warnOnce(
        'address-input-in-group-fieldset',
        'An AddressInput.Root is in a `group` Fieldset, so no box can show "(optional)" (WCAG 3.3.2). An address is four answers: use a plain <Fieldset.Root> and one Field per line.',
      )
    }
  }, [isInGroupFieldset])

  const contextValue: AddressInputContextValue = {
    getInputProps: address.getInputProps,
    postalCodeMask: address.postalCodeMask,
    country: address.country,
    defaultCountry: country?.toUpperCase() ?? providerCountry,
    geocoder,
    onLookupResult,
    hasCountryPart,
    registerCountryPart,
    selectCountry,
    fill,
  }

  return (
    <AddressInputContext.Provider value={contextValue}>
      <div {...mergeProps(otherProps, address.rootProps)} ref={mergedRef}>
        {children}
      </div>
    </AddressInputContext.Provider>
  )
}
AddressInputRoot.displayName = 'AddressInput.Root'

interface AddressInputBoxProps extends Omit<TextInputProps, 'type' | 'mask'> {
  part: Exclude<AddressInputPart, 'country'>
  mask?: MaskInput | false | undefined
}

function AddressInputBox({ part, mask, ref, ...inputProps }: AddressInputBoxProps): ReactElement {
  const root = useContext(AddressInputContext)
  // Outside a Root the part still has its token and keyboard, with the locale's country.
  const fallback = useAddressInput()
  const address = root ?? fallback
  const elementRef = useRef<HTMLInputElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const registerBox = root?.fill.registerBox

  useEffect(() => {
    const element = elementRef.current
    if (part === 'line2' || registerBox === undefined || element === null) {
      return undefined
    }
    return registerBox(part, element)
  }, [part, registerBox])

  useEffect(() => {
    if (root === null) {
      warnOnce(
        'address-input-part-outside-root',
        'An AddressInput.Line1, .Line2, .PostalCode or .City is outside an AddressInput.Root, so it has no country or autocomplete prefix from it. Put the parts in <AddressInput.Root> inside a <Fieldset.Root> (WCAG 1.3.1, 1.3.5).',
      )
    }
  }, [root])

  const { className, autoComplete, spellCheck, autoCorrect, inputMode, autoCapitalize, dir } =
    address.getInputProps(part)
  const hasOwnMask = mask !== undefined && mask !== false
  // The country's attributes yield to your own mask's, which TextInput sets from the mask.
  const ownProps = hasOwnMask
    ? { className, autoComplete }
    : { className, autoComplete, spellCheck, autoCorrect, inputMode, autoCapitalize, dir }
  const resolvedMask =
    part !== 'postalCode' || mask === false ? undefined : (mask ?? address.postalCodeMask)

  return <TextInput {...mergeProps(ownProps, inputProps)} mask={resolvedMask} ref={mergedRef} />
}

/**
 * The street address: `autocomplete="address-line1"`, no spell-check and no autocorrect. With a
 * `geocoder` on the Root it is also the address lookup: a combobox that suggests addresses as the
 * visitor types, still free text. A pick puts the street here and fills the postal code and the
 * city; focus stays here, so a missing house number is typed straight after.
 */
export function AddressInputLine1({
  messages,
  minLength,
  debounce,
  timeoutMilliseconds,
  privacyNotice,
  ...boxProps
}: AddressInputLine1Props): ReactElement {
  const root = useContext(AddressInputContext)
  if (root?.geocoder !== undefined) {
    return (
      <AddressInputLine1Lookup
        {...boxProps}
        root={root}
        geocoder={root.geocoder}
        messages={messages}
        minLength={minLength}
        debounce={debounce}
        timeoutMilliseconds={timeoutMilliseconds}
        privacyNotice={privacyNotice}
      />
    )
  }
  return <AddressInputBox {...boxProps} part="line1" />
}
AddressInputLine1.displayName = 'AddressInput.Line1'

/** The second line (c/o, a flat): `autocomplete="address-line2"`. Optional in most services. */
export function AddressInputLine2(props: AddressInputLine2Props): ReactElement {
  return <AddressInputBox {...props} part="line2" />
}
AddressInputLine2.displayName = 'AddressInput.Line2'

/**
 * The postal code: `autocomplete="postal-code"`, the Root's country's mask, width and keyboard.
 * A country without a mask takes letters and digits, in upper case, ten characters wide.
 */
export function AddressInputPostalCode(props: AddressInputPostalCodeProps): ReactElement {
  return <AddressInputBox {...props} part="postalCode" />
}
AddressInputPostalCode.displayName = 'AddressInput.PostalCode'

/** The town or city: `autocomplete="address-level2"`. Never derived from the postal code. */
export function AddressInputCity(props: AddressInputCityProps): ReactElement {
  return <AddressInputBox {...props} part="city" />
}
AddressInputCity.displayName = 'AddressInput.City'

/**
 * An address of one text box per line: `AddressInput.Root` is the layout, with `.Line1`, `.Line2`,
 * `.PostalCode` and `.City` inside it, each in your own Field. `.Country` (first) is optional;
 * `geocoder` on the Root turns `.Line1` into an address lookup.
 */
export const AddressInput = {
  Root: AddressInputRoot,
  Country: AddressInputCountry,
  Line1: AddressInputLine1,
  Line2: AddressInputLine2,
  PostalCode: AddressInputPostalCode,
  City: AddressInputCity,
} as const
