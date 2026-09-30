import { getThemeStore } from '@kvirn-ui/core'
import type {
  ColorSchemePreference,
  ContrastPreference,
  ResolvedColorScheme,
  ResolvedContrast,
  ThemeState,
  ThemeStore,
} from '@kvirn-ui/core'
import { useContext, useEffect, useMemo } from 'react'
import { useStoreSelector } from '../store/use-store-selector.ts'
import { ThemeStoreContext } from './provider-context.ts'
import { useEnv } from './use-env.ts'

export interface UseThemeResult {
  /** The user's preference, or the app default until they choose. */
  colorScheme: ColorSchemePreference
  contrast: ContrastPreference
  /** After `system` is replaced by the OS setting. The values on `<html>`. */
  resolvedColorScheme: ResolvedColorScheme
  resolvedContrast: ResolvedContrast
  /**
   * The OS forces its own colours (`forced-colors: active`, e.g. Windows Contrast Themes).
   * They win over any choice, so a switcher should say so instead of claiming a theme is in use.
   */
  isForcedColors: boolean
  /** Persists the choice (ADR-0006). `system` removes it from storage. */
  selectColorScheme: (colorScheme: ColorSchemePreference) => void
  selectContrast: (contrast: ContrastPreference) => void
}

interface ThemeSelection {
  colorScheme: ColorSchemePreference
  contrast: ContrastPreference
  resolvedColorScheme: ResolvedColorScheme
  resolvedContrast: ResolvedContrast
  isForcedColors: boolean
}

const selectTheme = (state: ThemeState): ThemeSelection => ({
  colorScheme: state.preference.colorScheme,
  contrast: state.preference.contrast,
  resolvedColorScheme: state.resolved.colorScheme,
  resolvedContrast: state.resolved.contrast,
  isForcedColors: state.system.isForcedColors,
})

const isSameSelection = (previous: ThemeSelection, next: ThemeSelection) =>
  previous.colorScheme === next.colorScheme &&
  previous.contrast === next.contrast &&
  previous.resolvedColorScheme === next.resolvedColorScheme &&
  previous.resolvedContrast === next.resolvedContrast &&
  previous.isForcedColors === next.isForcedColors

/** Internal. The provider's theme store, or the document's own store without a provider. */
export function useThemeStore(): ThemeStore {
  const providedStore = useContext(ThemeStoreContext)
  const env = useEnv()
  return useMemo(() => providedStore ?? getThemeStore(env), [providedStore, env])
}

/**
 * The document's theme preference, for a theme switcher (ADR-0006). Works without a
 * provider, with the defaults and `localStorage`. Only theme consumers re-render.
 */
export function useTheme(): UseThemeResult {
  const themeStore = useThemeStore()
  const selection = useStoreSelector(themeStore, selectTheme, isSameSelection)

  // Ref-counted: with a provider this only adds a reference; without one it makes the
  // first consumer follow the OS and write `<html>`.
  useEffect(() => themeStore.connect(), [themeStore])

  const { selectColorScheme, selectContrast } = themeStore.actions
  return useMemo(
    () => ({ ...selection, selectColorScheme, selectContrast }),
    [selection, selectColorScheme, selectContrast],
  )
}
