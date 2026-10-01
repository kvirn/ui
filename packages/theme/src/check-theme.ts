import { contrastRatio } from './contrast.ts'
import { colorTokenNames, contrastRequirements, themeNames } from './contrast-requirements.ts'
import type { ContrastRequirement, ThemeName } from './contrast-requirements.ts'
import { resolveThemeColors } from './read-theme.ts'

const hexColor = /^#(?:[\da-f]{3}|[\da-f]{6})$/i

/** Returns one message per unmet contrast requirement or unknown token. */
export function checkTheme(
  themeName: ThemeName,
  tokens: Readonly<Record<string, string>>,
  requirements: readonly ContrastRequirement[],
): string[] {
  return requirements.flatMap((requirement) => {
    const foregroundColor = tokens[requirement.foreground]
    const backgroundColor = tokens[requirement.background]
    if (foregroundColor === undefined || backgroundColor === undefined) {
      const missingToken =
        foregroundColor === undefined ? requirement.foreground : requirement.background
      return [`${themeName}: unknown token "${missingToken}"`]
    }
    const ratio = contrastRatio(foregroundColor, backgroundColor)
    return ratio >= requirement.minimum
      ? []
      : [
          `${themeName}: ${requirement.foreground} on ${requirement.background} is ${ratio.toFixed(2)}:1, needs ${requirement.minimum}:1`,
        ]
  })
}

/**
 * Checks a theme file, the default `theme.css` or your own copy, in all four themes:
 * - every `--kv-color-*` token is defined and resolves to a hex colour
 * - every contrast pair meets its minimum
 * - each OS fallback (`prefers-color-scheme`, `prefers-contrast`) equals its theme
 *
 * Returns one message per problem, so `[]` means it passes.
 *
 * @example
 * import { readFileSync } from 'node:fs'
 * checkThemeCss(readFileSync('src/my-theme.css', 'utf8')) // []
 */
export function checkThemeCss(css: string): string[] {
  return themeNames.flatMap((themeName) => {
    const colors = resolveThemeColors(css, themeName)
    const systemColors = resolveThemeColors(css, themeName, 'system')
    const valueProblems = colorTokenNames.flatMap((name) => {
      const value = colors[name]
      if (value === undefined) {
        return [`${themeName}: --kv-color-${name} is not defined`]
      }
      if (!hexColor.test(value)) {
        return [`${themeName}: --kv-color-${name} is "${value}", not a #rgb or #rrggbb colour`]
      }
      return systemColors[name] === value
        ? []
        : [
            `${themeName}: --kv-color-${name} is ${value}, but ${systemColors[name] ?? 'not defined'} in the system fallback`,
          ]
    })
    if (valueProblems.length > 0) {
      return valueProblems
    }
    return checkTheme(themeName, colors, contrastRequirements[themeName])
  })
}
