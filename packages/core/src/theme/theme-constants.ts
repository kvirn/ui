/**
 * Shared by the theme store and `createThemeScriptSource`, so the blocking script and
 * the store can't drift apart on names.
 */
export const themeStorageKey = 'kvirn-ui:theme'
export const colorSchemeAttribute = 'data-kv-color-scheme'
export const contrastAttribute = 'data-kv-contrast'
export const motionAttribute = 'data-kv-motion'

export const colorSchemeQuery = '(prefers-color-scheme: dark)'
/** Only `more` resolves to high contrast. `less`, `custom` and `no-preference` are `standard`. */
export const contrastQuery = '(prefers-contrast: more)'
export const forcedColorsQuery = '(forced-colors: active)'
/** `reduce` resolves to less motion. `no-preference` is `full`. */
export const motionQuery = '(prefers-reduced-motion: reduce)'

export const colorSchemePreferences = ['light', 'dark', 'system'] as const
export const contrastPreferences = ['standard', 'more', 'system'] as const
export const motionPreferences = ['full', 'reduce', 'system'] as const
