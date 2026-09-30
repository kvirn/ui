import type { Direction } from '@kvirn-ui/core'
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
  localeProps: LocaleProps
}

/** The nearest provider's locale and text direction. `en` and `ltr` without a provider. */
export function useLocale(): UseLocaleResult {
  const { locale, dir } = useContext(KvirnConfigContext)
  return useMemo(() => ({ locale, dir, localeProps: { lang: locale, dir } }), [locale, dir])
}
