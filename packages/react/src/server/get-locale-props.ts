import { resolveDirection } from '@kvirn/core'
import type { Direction } from '@kvirn/core'

export interface LocaleProps {
  lang: string
  dir: Direction
}

/** The `lang` and `dir` for `<html>`, the same pair `KvirnProvider` derives for `locale` (WCAG 3.1.1). */
export function getLocaleProps(locale: string): LocaleProps {
  return { lang: locale, dir: resolveDirection(locale) }
}
