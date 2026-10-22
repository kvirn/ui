'use client'
import { createElement, useContext, useEffect, useMemo, useRef } from 'react'
import type { ChangeEvent, ComponentPropsWithRef, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useListboxNative } from '../listbox/use-listbox-native.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { countryNameOptions } from '../phone-input/country-options.ts'
import { useLocale } from '../provider/use-locale.ts'
import { AddressInputContext } from './address-input-context.ts'
import { useAddressInput } from './use-address-input.ts'

export interface AddressInputCountryProps extends Omit<
  ComponentPropsWithRef<'select'>,
  'children' | 'value' | 'defaultValue'
> {
  /** Controlled: the ISO 3166-1 alpha-2 code from your form state. Pair it with `onChange`. */
  value?: string | undefined
  /** Uncontrolled: the starting country. Default: the Root's `country`, else the provider's. */
  defaultValue?: string | undefined
}

/**
 * The address's country, a native `<select>` of every country, named in the page's language, the
 * Root's country first. Put it first in the Root, in its own `Field.Root` with a `Field.Label`.
 * It sets the country the street lookup searches in and the postal code's mask and width, and a
 * pick in another country sets it. It changes nothing the user typed. `autocomplete="country"`.
 *
 * @example
 * <Field.Root>
 *   <Field.Label>Country</Field.Label>
 *   <AddressInput.Country name="country" />
 * </Field.Root>
 */
export function AddressInputCountry({
  value,
  defaultValue,
  onChange,
  ref,
  ...otherProps
}: AddressInputCountryProps): ReactElement {
  const context = useContext(AddressInputContext)
  const fallback = useAddressInput()
  const { locale } = useLocale()
  const native = useListboxNative({ disabled: otherProps.disabled })
  const elementRef = useRef<HTMLSelectElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const registerCountryPart = context?.registerCountryPart
  const registerCountry = context?.fill.registerCountry
  const selectCountry = context?.selectCountry
  const country = context?.country
  const defaultCountry = context?.defaultCountry

  useEffect(() => registerCountryPart?.(), [registerCountryPart])
  useEffect(() => {
    const element = elementRef.current
    return element === null ? undefined : registerCountry?.(element)
  }, [registerCountry])
  // The Root follows a country that is controlled or given at the start; the mask and the Lookup read it.
  useEffect(() => {
    const own = value ?? defaultValue
    if (own !== undefined) {
      selectCountry?.(own)
    }
  }, [value, defaultValue, selectCountry])
  useEffect(() => {
    if (context === null) {
      warnOnce(
        'address-input-country-outside-root',
        'An AddressInput.Country is outside an AddressInput.Root, so the postal code and the street lookup can’t read its country. Put it first in <AddressInput.Root>.',
      )
    }
  }, [context])
  useEffect(() => {
    const element = elementRef.current
    if (element === null) {
      return
    }
    const hasName =
      element.hasAttribute('aria-label') ||
      element.hasAttribute('aria-labelledby') ||
      element.hasAttribute('title') ||
      (element.labels?.length ?? 0) > 0
    if (!hasName) {
      warnOnce(
        'address-input-country-without-name',
        'An AddressInput.Country has no accessible name (WCAG 1.3.1, 4.1.2). Put it in its own <Field.Root> with a <Field.Label>, or give it aria-label.',
      )
    }
    const group = element.closest('.kv-address-input')
    if (group !== null && group.querySelector('input, select') !== element) {
      warnOnce(
        'address-input-country-not-first',
        'An AddressInput.Country is not the first control in its AddressInput.Root. Put it before the boxes, so the Tab order is country, then address (WCAG 2.4.3, 3.3.2).',
      )
    }
  })

  const shown = (value ?? country ?? '').toUpperCase()
  const options = useMemo(
    () => countryNameOptions(locale, defaultCountry ?? fallback.country),
    [locale, defaultCountry, fallback.country],
  )
  const hasShown = options.some((option) => option.country === shown)
  const { className, autoComplete } = (context ?? fallback).getInputProps('country')

  return createElement(
    'select',
    {
      ...mergeProps({ className, autoComplete }, otherProps, native.nativeProps, {
        onChange: (event: ChangeEvent<HTMLSelectElement>) => {
          onChange?.(event)
          if (value === undefined) {
            selectCountry?.(event.currentTarget.value)
          }
        },
      }),
      value: hasShown ? shown : '',
      ref: mergedRef,
    },
    hasShown ? null : createElement('option', { value: '', disabled: true }),
    // Server and browser ICU can name a country differently; the server's name stays until the next render.
    options.map((option) =>
      createElement(
        'option',
        { key: option.country, value: option.country, suppressHydrationWarning: true },
        option.label,
      ),
    ),
  )
}
AddressInputCountry.displayName = 'AddressInput.Country'
