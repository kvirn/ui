import { maskCountryFromLocale } from '@kvirn-ui/core'
import type { Direction, MaskCountry } from '@kvirn-ui/core'
import { useContext, useMemo } from 'react'
import { KvirnConfigContext } from './provider-context.ts'

/** Spread on the element that starts a section in another language (WCAG 3.1.2). */
export interface LocaleProps {
  lang: string
  dir: Direction
}

export interface UseLocaleResult {
  /** BCP 47 locale, for `Intl.*` and catalog lookup. */
  locale: string
  dir: Direction
  /**
   * The country the country masks use (`SE`, `FI` or `NO`): the nearest provider's `country`, else
   * the region of the locale (`sv-FI` is `FI`), else its language (`sv` is `SE`). `undefined`
   * when neither says (`en`).
   */
  country: MaskCountry | undefined
  localeProps: LocaleProps
}

/** The nearest provider's locale, text direction and mask country. `en` and `ltr` without a provider. */
export function useLocale(): UseLocaleResult {
  const { locale, dir, country: providerCountry } = useContext(KvirnConfigContext)
  return useMemo(
    () => ({
      locale,
      dir,
      country: providerCountry ?? maskCountryFromLocale(locale),
      localeProps: { lang: locale, dir },
    }),
    [locale, dir, providerCountry],
  )
}
