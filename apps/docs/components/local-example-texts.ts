import { getLanguage } from '@kvirn-ui/core'
import type { LocaleCode } from '@kvirn-ui/i18n'
import { useLocale } from '@kvirn-ui/react'

export interface LocalExampleTexts<T> {
  texts: T
  /** True when the texts fell back to English: wrap the example in `InEnglishWhenFallback`. */
  isFallback: boolean
}

/**
 * Example text for one page's examples, kept beside them (examples/<name>/texts.ts). `en` is
 * required, other locales are optional and fall back to English.
 */
export function defineExampleTexts<T>(byLocale: Partial<Record<LocaleCode, T>> & { en: T }) {
  return function useLocalExampleTexts(): LocalExampleTexts<T> {
    const language = getLanguage(useLocale().locale)
    const texts = (byLocale as Record<string, T | undefined>)[language]
    return texts === undefined
      ? { texts: byLocale.en, isFallback: language !== 'en' }
      : { texts, isFallback: false }
  }
}
