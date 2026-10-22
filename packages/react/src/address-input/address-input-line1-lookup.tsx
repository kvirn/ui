'use client'
import type { AddressResult, GeocoderProvider } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { check, error as errorIcon, info as infoIcon } from '@kvirn-ui/icons'
import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_DEBOUNCE_MILLISECONDS,
  DEFAULT_TIMEOUT_MILLISECONDS,
  useAddressLookupEngine,
  useAddressLookupField,
} from '../address-lookup/use-address-lookup.ts'
import type {
  AddressLookupEngine,
  AddressLookupMessages,
  AddressLookupPickOutcome,
  UseAddressLookupOptions,
} from '../address-lookup/use-address-lookup.ts'
import { Autocomplete } from '../autocomplete/autocomplete.tsx'
import { ComboboxProviders } from '../combobox/combobox.tsx'
import { Field } from '../field/field.tsx'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { countryName } from '../phone-input/country-options.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'
import type { TextInputProps } from '../text-input/text-input.tsx'
import { writeInputValue } from './use-address-fill.ts'
import type { AddressInputContextValue } from './address-input-context.ts'

// A house number after the street: digits and an optional letter, as in "12" or "12 B".
const houseNumber = /^\s+(\d+(?:\s?\p{L})?)$/u

type ReusedSearchMessage =
  | 'submit'
  | 'privacy'
  | 'privacyUnnamed'
  | 'tooShort'
  | 'searching'
  | 'resultCount'
  | 'pickedFilled'

/** The `addressInput` messages, and the `addressSearch` ones the street lookup reuses. */
export type AddressInputLine1Messages = Partial<KvirnMessages['addressInput']> &
  Partial<Pick<KvirnMessages['addressSearch'], ReusedSearchMessage>>

export interface AddressInputLine1LookupProps extends Omit<
  TextInputProps,
  'type' | 'mask' | 'announceRejections' | 'messages' | 'id'
> {
  root: AddressInputContextValue
  geocoder: GeocoderProvider
  messages?: AddressInputLine1Messages | undefined
  minLength?: UseAddressLookupOptions['minLength']
  debounce?: UseAddressLookupOptions['debounce']
  timeoutMilliseconds?: UseAddressLookupOptions['timeoutMilliseconds']
  privacyNotice?: boolean | undefined
}

/**
 * Line 1 with a geocoder: the ARIA 1.2 combobox of AddressSearch on the street box (contract:
 * address-input.a11y.md). It keeps its label, `name` and `autocomplete="address-line1"` and stays
 * free text. A pick puts the street in it and fills the postal code and the city.
 */
export function AddressInputLine1Lookup({
  root,
  geocoder,
  messages,
  minLength,
  debounce,
  timeoutMilliseconds,
  privacyNotice = true,
  disabled,
  value,
  defaultValue,
  ...inputProps
}: AddressInputLine1LookupProps) {
  const { locale } = useLocale()
  const text = useMessages('addressInput', messages)
  const [note, setNote] = useState<string | undefined>(undefined)
  const { country, hasCountryPart, fill } = root
  // The street a `street` pick left in Line 1, while the visitor may still type its number after it.
  const pickedStreet = useRef<string | undefined>(undefined)
  const lookedUp = useRef<string | undefined>(undefined)
  const structuredTimer = useRef<number | undefined>(undefined)
  const structuredController = useRef<AbortController | undefined>(undefined)
  const countryLabel = country === undefined ? undefined : countryName(locale, country)
  const scope = countryLabel === undefined ? '' : ` ${text.lookupScope({ country: countryLabel })}`

  // What a pick adds to the note and to the announcement, read before the boxes change.
  const sentencesOf = (result: AddressResult): string[] => {
    const { address } = result
    if (address === undefined) {
      return []
    }
    const gaps = fill.gaps(address)
    return [
      ...(hasCountryPart && address.country !== country
        ? [text.countryChanged({ country: countryName(locale, address.country) })]
        : []),
      ...(gaps.postalCode ? [text.missingPostalCode] : []),
      ...(gaps.city ? [text.missingCity] : []),
      ...(result.precision === 'street' ? [text.missingHouseNumber] : []),
    ]
  }

  const describePick = (
    result: AddressResult,
    searchMessages: AddressLookupMessages,
  ): AddressLookupPickOutcome =>
    result.address === undefined
      ? { rejected: text.noAddressDetails }
      : {
          announcement: [
            searchMessages.pickedFilled({ label: result.label }),
            ...sentencesOf(result),
          ].join(' '),
        }

  const filledMessage = (written: { postalCode: boolean; city: boolean }) =>
    written.postalCode && written.city
      ? text.filledPostalCodeAndCity
      : written.postalCode
        ? text.filledPostalCode
        : written.city
          ? text.filledCity
          : undefined

  const cancelStructured = () => {
    window.clearTimeout(structuredTimer.current)
    structuredController.current?.abort()
    structuredController.current = undefined
  }
  useEffect(() => cancelStructured, [])

  const lookUpHouseNumber = (street: string, number: string, typed: string) => {
    const { structured } = geocoder
    if (structured === undefined) {
      return
    }
    const controller = new AbortController()
    structuredController.current = controller
    const timeout = window.setTimeout(
      () => controller.abort(),
      timeoutMilliseconds ?? DEFAULT_TIMEOUT_MILLISECONDS,
    )
    const postalCode = fill.valueOf('postalCode')
    const city = fill.valueOf('city')
    structured(
      {
        street,
        number,
        ...(postalCode === '' ? {} : { postalCode }),
        ...(city === '' ? {} : { city }),
        ...(country === undefined ? {} : { country }),
      },
      { signal: controller.signal, locale },
    ).then(
      (result) => {
        window.clearTimeout(timeout)
        if (controller.signal.aborted || result?.precision !== 'address') {
          return
        }
        const { address } = result
        if (address === undefined) {
          return
        }
        const written = fill.fillBlanks(address)
        lookedUp.current = typed
        const message = filledMessage(written)
        if (message !== undefined) {
          setNote(message)
          engine.announceInstead(message, typed)
        }
      },
      () => window.clearTimeout(timeout),
    )
  }

  const handleTyped = (typed: string) => {
    cancelStructured()
    const street = pickedStreet.current
    if (street === undefined || geocoder.structured === undefined) {
      return
    }
    if (!typed.startsWith(street)) {
      pickedStreet.current = undefined
      return
    }
    const number = houseNumber.exec(typed.slice(street.length).trimEnd())?.[1]
    if (number === undefined || typed === lookedUp.current) {
      return
    }
    const wait = debounce ?? DEFAULT_DEBOUNCE_MILLISECONDS
    structuredTimer.current = window.setTimeout(
      () => lookUpHouseNumber(street, number, typed),
      wait === false ? 0 : wait,
    )
  }

  const engine = useAddressLookupEngine({
    geocoder,
    narrowing: () => ({ city: fill.valueOf('city'), postalCode: fill.valueOf('postalCode') }),
    onResult: (result) => {
      pickedStreet.current = undefined
      if (result?.address === undefined) {
        return
      }
      if (result.precision === 'street') {
        pickedStreet.current = result.address.line1
        lookedUp.current = undefined
      }
      setNote([text.filledNote, ...sentencesOf(result)].join(' '))
      fill.fill(result.address)
      root.onLookupResult?.(result)
    },
    ...(minLength === undefined ? {} : { minLength }),
    ...(debounce === undefined ? {} : { debounce }),
    ...(timeoutMilliseconds === undefined ? {} : { timeoutMilliseconds }),
    ...(country === undefined ? {} : { country }),
    limitToCountry: !hasCountryPart,
    describePick,
    initialText: value ?? defaultValue ?? '',
    disabled,
    messages: {
      ...messages,
      helpSuggest: ({ min }) => `${text.lookupHelpSuggest({ min })}${scope}`,
      helpRequest: `${text.lookupHelpRequest}${scope}`,
      noResults: text.lookupNoResults,
      error: text.lookupError,
      offline: text.lookupOffline,
    },
  })

  return (
    <AddressInputLine1Field
      engine={engine}
      root={root}
      note={note}
      privacyNotice={privacyNotice}
      onTyped={handleTyped}
      value={value}
      inputProps={inputProps}
    />
  )
}

function AddressInputLine1Field({
  engine,
  root,
  note,
  privacyNotice,
  onTyped,
  value,
  inputProps,
}: {
  engine: AddressLookupEngine
  root: AddressInputContextValue
  note: string | undefined
  privacyNotice: boolean
  onTyped: (value: string) => void
  value: string | undefined
  inputProps: Omit<
    AddressInputLine1LookupProps,
    | 'root'
    | 'geocoder'
    | 'messages'
    | 'minLength'
    | 'debounce'
    | 'timeoutMilliseconds'
    | 'privacyNotice'
    | 'disabled'
    | 'value'
    | 'defaultValue'
  >
}) {
  const lookup = useAddressLookupField(engine)
  const { onValueChange, onInput, onChange, ref, ...otherProps } = inputProps
  const elementRef = useRef<HTMLInputElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const { registerBox } = root.fill
  const { syncText, text } = engine

  useEffect(() => {
    const element = elementRef.current
    return element === null ? undefined : registerBox('line1', element)
  }, [registerBox])
  // A controlled `value` that changes from outside (a reset) is text, not typing.
  useEffect(() => {
    if (value !== undefined && value !== text) {
      syncText(value)
    }
  }, [value, text, syncText])

  const { className, autoComplete, spellCheck, autoCorrect } = root.getInputProps('line1')
  const { className: statusClassName, ...statusProps } = lookup.statusProps
  const { onClick: runSearch, ...submitProps } = lookup.submitProps

  return (
    <ComboboxProviders combobox={lookup}>
      {privacyNotice ? (
        <Field.Prose className="kv-address-lookup-notice">{lookup.noticeText}</Field.Prose>
      ) : null}
      {lookup.attribution === undefined ? null : (
        <p className="kv-address-lookup-notice">{lookup.attribution}</p>
      )}
      <Autocomplete.Control>
        <Autocomplete.Input
          {...mergeProps({ className, autoComplete, spellCheck, autoCorrect }, otherProps)}
          ref={mergedRef}
          onInput={(event) => {
            onInput?.(event)
            const { nativeEvent } = event
            const inputType = 'inputType' in nativeEvent ? nativeEvent.inputType : undefined
            // Autofill and the form fill send an input event without a typing inputType.
            if (inputType === undefined || inputType === 'insertReplacementText') {
              engine.markProgrammatic(event.currentTarget.value)
            }
          }}
          onChange={(event) => {
            onChange?.(event)
            onTyped(event.currentTarget.value)
            onValueChange?.(event.currentTarget.value, { reason: 'input', event })
          }}
        />
        <Autocomplete.Clear
          onClick={() => {
            const element = elementRef.current
            if (element !== null && element.value !== '') {
              writeInputValue(element, '')
            }
          }}
        />
        {lookup.isOnRequest ? (
          <button {...submitProps} onClick={runSearch}>
            {lookup.submitText}
          </button>
        ) : null}
      </Autocomplete.Control>
      <Field.HelpText>{lookup.helpText}</Field.HelpText>
      {note === undefined ? null : (
        <Field.HelpText className="kv-address-input-lookup-note">
          <Icon icon={check} size="16" />
          {note}
        </Field.HelpText>
      )}
      <Autocomplete.Popup>
        {lookup.isOpen && lookup.statusText !== undefined ? (
          <div {...statusProps} className={statusClassName}>
            {lookup.status === 'searching' ? (
              <span className="kv-spinner" aria-hidden="true" />
            ) : lookup.status === 'error' ? (
              <Icon icon={errorIcon} size="16" />
            ) : lookup.status === 'offline' || lookup.status === 'rejected' ? (
              <Icon icon={infoIcon} size="16" />
            ) : null}
            {lookup.statusText}
          </div>
        ) : null}
        <Autocomplete.List>{(item) => <Autocomplete.Option item={item} />}</Autocomplete.List>
      </Autocomplete.Popup>
    </ComboboxProviders>
  )
}
