export type Direction = 'ltr' | 'rtl'

/**
 * Languages written right to left. Used when the runtime has no `Intl.Locale` text info
 * (Plan 0002). Compared against the language subtag only.
 */
export const rightToLeftLanguages: readonly string[] = [
  'ar',
  'he',
  'fa',
  'ur',
  'ps',
  'sd',
  'ug',
  'yi',
  'dv',
  'ckb',
]

interface TextInfo {
  direction?: string
}

/** `Intl.Locale` text info is newer than our TypeScript lib, and exposed two ways across engines. */
interface LocaleWithTextInfo extends Intl.Locale {
  getTextInfo?: () => TextInfo
  textInfo?: TextInfo
}

function readTextInfoDirection(intlLocale: LocaleWithTextInfo): Direction | undefined {
  const textInfo =
    typeof intlLocale.getTextInfo === 'function' ? intlLocale.getTextInfo() : intlLocale.textInfo
  const direction = textInfo?.direction
  return direction === 'rtl' || direction === 'ltr' ? direction : undefined
}

/** The language subtag of a BCP 47 tag, lower-cased (`sv-SE` → `sv`). */
export function getLanguage(locale: string): string {
  try {
    return new Intl.Locale(locale).language
  } catch {
    return locale.split(/[-_]/)[0]?.toLowerCase() ?? ''
  }
}

/** Direction from the language alone, using the fallback list. */
export function resolveDirectionFromLanguage(locale: string): Direction {
  return rightToLeftLanguages.includes(getLanguage(locale)) ? 'rtl' : 'ltr'
}

/**
 * Text direction for a BCP 47 locale: `Intl.Locale` text info when the runtime has it,
 * otherwise the fallback list of right-to-left languages. Invalid tags resolve to `ltr`.
 */
export function resolveDirection(locale: string): Direction {
  let intlLocale: LocaleWithTextInfo
  try {
    intlLocale = new Intl.Locale(locale)
  } catch {
    return resolveDirectionFromLanguage(locale)
  }
  return readTextInfoDirection(intlLocale) ?? resolveDirectionFromLanguage(locale)
}
