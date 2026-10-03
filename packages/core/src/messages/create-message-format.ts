/** Plural forms keyed by `Intl.PluralRules` category. `other` is always required. */
export interface PluralForms {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

/**
 * The locale-aware helper passed to parameterised messages. Built on `Intl`
 * only, with no ICU runtime. `@kvirn-ui/i18n`'s `MessageFormat` type describes the same
 * shape; a type test in `@kvirn-ui/react` keeps the two in step.
 */
export interface MessageFormatter {
  /**
   * Picks a form by the locale's plural rules. `zero` is used for exactly 0 when given,
   * because most locales have no `zero` category.
   */
  plural: (count: number, forms: PluralForms) => string
  number: (value: number, options?: Intl.NumberFormatOptions) => string
  /** Formats in the configured time zone unless `options.timeZone` says otherwise. */
  date: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string
  list: (items: readonly string[], options?: Intl.ListFormatOptions) => string
}

export interface CreateMessageFormatOptions {
  /** BCP 47 locale. */
  locale: string
  /** IANA time zone. `undefined` uses the runtime's zone. */
  timeZone: string | undefined
}

export function createMessageFormat({
  locale,
  timeZone,
}: CreateMessageFormatOptions): MessageFormatter {
  let pluralRules: Intl.PluralRules | undefined

  return {
    plural: (count, forms) => {
      if (count === 0 && forms.zero !== undefined) {
        return forms.zero
      }
      pluralRules ??= new Intl.PluralRules(locale)
      return forms[pluralRules.select(count)] ?? forms.other
    },
    number: (value, options) => new Intl.NumberFormat(locale, options).format(value),
    date: (value, options) =>
      new Intl.DateTimeFormat(locale, {
        ...(timeZone === undefined ? {} : { timeZone }),
        ...options,
      }).format(value),
    list: (items, options) => new Intl.ListFormat(locale, options).format(items),
  }
}
