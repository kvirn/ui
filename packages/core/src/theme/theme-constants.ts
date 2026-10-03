/**
 * Shared by the theme store and `createThemeScriptSource`, so the blocking script and
 * the store can't drift apart on names.
 */
export const themeStorageKey = 'kvirn-ui:theme'
export const colorSchemeAttribute = 'data-kv-color-scheme'
export const contrastAttribute = 'data-kv-contrast'

export const colorSchemeQuery = '(prefers-color-scheme: dark)'
/** Only `more` resolves to high contrast. `less`, `custom` and `no-preference` are `standard`. */
export const contrastQuery = '(prefers-contrast: more)'
export const forcedColorsQuery = '(forced-colors: active)'

export const colorSchemePreferences = ['light', 'dark', 'system'] as const
export const contrastPreferences = ['standard', 'more', 'system'] as const
