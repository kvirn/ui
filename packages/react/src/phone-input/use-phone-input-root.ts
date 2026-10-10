import { callingCodeFor } from '@kvirn-ui/core'
import { useCallback, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useLocale } from '../provider/use-locale.ts'

export interface PhoneInputCountryChangeDetails {
  reason: 'input'
  event: ChangeEvent<HTMLSelectElement>
  /** The new country's calling code, digits only (`46`), or `undefined` for an unknown code. */
  callingCode: string | undefined
}

export interface UsePhoneInputRootOptions {
  /**
   * Controlled: the country as an ISO 3166-1 alpha-2 code (`SE`). Pair it with `onCountryChange`,
   * or the select can't be changed. Default: `defaultCountry`, the user's choice, the provider's
   * `country`, then the one the locale implies.
   */
  country?: string | undefined
  /** Uncontrolled: the country the select starts on, before the user changes it. */
  defaultCountry?: string | undefined
  /** Called when the user picks another country. It only reports: it never rewrites the number. */
  onCountryChange?: ((country: string, details: PhoneInputCountryChangeDetails) => void) | undefined
}

/** Spread on the `<div>` that holds the parts. */
export interface PhoneInputRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-phone-input-group`. Add your
   * own class next to it with `mergeProps`: class names join.
   */
  className: 'kv-phone-input-group'
}

export interface UsePhoneInputRootResult {
  /** The country that applies, upper case, or `undefined` when none of the sources says. */
  country: string | undefined
  /** Its calling code, digits only (`46`), or `undefined`. */
  callingCode: string | undefined
  /** Call with the change event of the select: it reports and, uncontrolled, remembers. */
  selectCountry: (country: string, event: ChangeEvent<HTMLSelectElement>) => void
  rootProps: PhoneInputRootPartProps
}

const rootProps: PhoneInputRootPartProps = Object.freeze({ className: 'kv-phone-input-group' })

/**
 * The country of a phone number: the option, then `defaultCountry` and the user's choice, then the
 * provider's `country`, then the one the locale implies (the country the masks resolve). It holds
 * no number and never rewrites one: changing the country changes nothing that was typed.
 *
 * @example
 * const root = usePhoneInputRoot({ defaultCountry: 'FI' })
 * <div {...root.rootProps}>…</div>
 */
export function usePhoneInputRoot({
  country: controlledCountry,
  defaultCountry,
  onCountryChange,
}: UsePhoneInputRootOptions = {}): UsePhoneInputRootResult {
  const { country: localeCountry } = useLocale()
  const [chosenCountry, setChosenCountry] = useState(defaultCountry?.toUpperCase())
  const isControlled = controlledCountry !== undefined
  const country = controlledCountry?.toUpperCase() ?? chosenCountry ?? localeCountry

  const selectCountry = useCallback(
    (next: string, event: ChangeEvent<HTMLSelectElement>) => {
      if (!isControlled) {
        setChosenCountry(next)
      }
      onCountryChange?.(next, { reason: 'input', event, callingCode: callingCodeFor(next) })
    },
    [isControlled, onCountryChange],
  )

  return {
    country,
    callingCode: country === undefined ? undefined : callingCodeFor(country),
    selectCountry,
    rootProps,
  }
}
