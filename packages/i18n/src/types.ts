/** The locales KvirnUI ships. All are first-class; `en` is the fallback (ADR-0003). */
export const localeCodes = ['sv', 'fi', 'nb', 'nn', 'se', 'en'] as const
export type LocaleCode = (typeof localeCodes)[number]

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
 * The locale-aware helper that parameterised messages receive (ADR-0007). Built on `Intl`
 * for the active locale; `date` uses the provider's `timeZone`.
 */
export interface MessageFormat {
  /** Picks a form by the locale's plural rules. `zero` is used for exactly 0 when given. */
  plural: (count: number, forms: PluralForms) => string
  number: (value: number, options?: Intl.NumberFormatOptions) => string
  date: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string
  list: (items: readonly string[], options?: Intl.ListFormatOptions) => string
}

/**
 * A key without parameters. Catalogs use strings; a function lets an app route the string
 * through its own i18n system, for example `() => t('kvirn.link.newTabNotice')` (ADR-0007).
 */
export type TextMessage = string | (() => string)

/** A key with parameters: it receives its values and the locale's format helper. */
export type MessageFunction<Values extends object> = (
  values: Values,
  format: MessageFormat,
) => string

/**
 * Every visible or announced string, namespaced per component (ADR-0007). The depth is
 * fixed at `namespace.key`. Components add their namespace here as they are built.
 */
export interface KvirnMessages {
  link: {
    /** Tells users a link opens in a new tab (WCAG 3.2.5, G201). Owned by Link (Plan 0003). */
    newTabNotice: TextMessage
  }
}

/** Any subset of namespaces and keys, for provider and `defineMessages` overrides. */
export type PartialMessages = {
  [Namespace in keyof KvirnMessages]?: Partial<KvirnMessages[Namespace]>
}
