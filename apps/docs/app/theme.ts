import type { ThemeOptions } from '@kvirn-ui/react'

// One object for KvirnThemeScript (layout.tsx) and AppKvirnProvider (layout.tsx), so the first
// paint and the hydrated theme can't disagree. Every axis follows the device.
export const theme = {
  defaultColorScheme: 'system',
  defaultContrast: 'system',
  defaultMotion: 'system',
} as const satisfies ThemeOptions
