/** The locales KvirnUI ships. All are first-class; `en` is the fallback (ADR-0007). */
export const localeCodes = ['sv', 'fi', 'nb', 'nn', 'se', 'en'] as const
export type LocaleCode = (typeof localeCodes)[number]

/**
 * Every visible or announced string, namespaced per component (ADR-0008).
 * Keys without parameters are strings; keys with parameters are functions.
 * Components add their namespace here as they are built.
 */
export interface KvirnMessages {}
