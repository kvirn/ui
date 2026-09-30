/**
 * Default theme source of truth. The two preference axes (ADR-0006) give four themes.
 * Every pair listed in `contrastRequirements` is enforced by `vp run theme:check`.
 * The palette itself is designed in a later plan; add tokens and requirements together.
 */
export const themeNames = ['light', 'dark', 'light-contrast', 'dark-contrast'] as const
export type ThemeName = (typeof themeNames)[number]

/** Text 4.5:1 (1.4.3), UI and focus 3:1 (1.4.11, 2.4.13), high-contrast text 7:1 (1.4.6). */
export type ContrastMinimum = 3 | 4.5 | 7

export interface ContrastRequirement {
  foreground: string
  background: string
  minimum: ContrastMinimum
}

export const colorTokens: Record<ThemeName, Record<string, string>> = {
  light: {},
  dark: {},
  'light-contrast': {},
  'dark-contrast': {},
}

export const contrastRequirements: Record<ThemeName, ContrastRequirement[]> = {
  light: [],
  dark: [],
  'light-contrast': [],
  'dark-contrast': [],
}
