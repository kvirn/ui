'use client'

// Public API. The whole entry is client code (ADR-0010). `useStoreSelector`, `useMessages`,
// `useEnv` and `useLinkComponent` are internal by design (ADR-0003, Plan 0002).
export { KvirnProvider } from './provider/kvirn-provider.tsx'
export type { KvirnProviderProps } from './provider/kvirn-provider.tsx'
export type { WeekStart } from './provider/provider-context.ts'
export { KvirnThemeScript } from './provider/kvirn-theme-script.tsx'
export type { KvirnThemeScriptProps } from './provider/kvirn-theme-script.tsx'
export { useLocale } from './provider/use-locale.ts'
export type { LocaleProps, UseLocaleResult } from './provider/use-locale.ts'
export { useDateSettings } from './provider/use-date-settings.ts'
export type { UseDateSettingsResult } from './provider/use-date-settings.ts'
export { useTheme } from './provider/use-theme.ts'
export type { UseThemeResult } from './provider/use-theme.ts'
export type { Register, RegisteredLinkComponent } from './provider/register.ts'
export { mergeProps } from './merge-props/merge-props.ts'
export type { MergedProps } from './merge-props/merge-props.ts'
export type { RenderProp } from './render/render-part.ts'
export { Button } from './button/button.tsx'
export type { ButtonProps, ButtonState } from './button/button.tsx'
export { useButton } from './button/use-button.ts'
export type { ButtonPartProps, UseButtonOptions, UseButtonResult } from './button/use-button.ts'
export { Link, LinkNewTabNotice } from './link/link.tsx'
export type { LinkElementProps, LinkNewTabNoticeProps, LinkProps, LinkState } from './link/link.tsx'
export { useLink } from './link/use-link.ts'
export type { LinkCurrent, LinkPartProps, UseLinkOptions, UseLinkResult } from './link/use-link.ts'
export type {
  ColorSchemePreference,
  ContrastPreference,
  Direction,
  Env,
  ResolvedColorScheme,
  ResolvedContrast,
  StoredThemePreference,
  ThemeOptions,
  ThemeStorage,
  ThemeStorageAdapter,
} from '@kvirn-ui/core'
