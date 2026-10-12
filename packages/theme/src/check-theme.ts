import { checkButtonEdges, parseButtonEdgeTint } from './button-edge.ts'
import { contrastRatio } from './contrast.ts'
import { colorTokenNames, contrastRequirements, themeNames } from './contrast-requirements.ts'
import type { ContrastRequirement, ThemeName } from './contrast-requirements.ts'
import { readRootProperties, resolveThemeColors, themeEnvironment } from './read-theme.ts'

const hexColor = /^#(?:[\da-f]{3}|[\da-f]{6})$/i

/** The button edge tints: a hex colour and a percentage, in every theme. */
const buttonEdgeTokens = ['--kv-button-edge-shade', '--kv-button-edge-highlight'] as const

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
 * - the button edge tints are `<#rgb or #rrggbb> <percentage>`, and
 *   every tinted edge keeps 3:1 on `canvas`, `surface` and `surface-raised`
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
    const properties = readRootProperties(css, themeEnvironment(themeName))
    const valueProblems = [
      ...colorTokenNames.flatMap((name) => {
        const value = colors[name]
        if (value === undefined) {
          return [`${themeName}: --kv-color-${name} is not defined`]
        }
        if (!hexColor.test(value)) {
          return [`${themeName}: --kv-color-${name} is "${value}", not a #rgb or #rrggbb colour`]
        }
        return []
      }),
      ...buttonEdgeTokens.flatMap((name) => {
        const value = properties[name]
        if (value === undefined) {
          return [`${themeName}: ${name} is not defined`]
        }
        if (parseButtonEdgeTint(value) === undefined) {
          return [
            `${themeName}: ${name} is "${value}", not a "#rgb or #rrggbb" colour and a percentage`,
          ]
        }
        return []
      }),
    ]
    if (valueProblems.length > 0) {
      return valueProblems
    }
    const shade = parseButtonEdgeTint(properties['--kv-button-edge-shade'])
    const highlight = parseButtonEdgeTint(properties['--kv-button-edge-highlight'])
    return [
      ...checkTheme(themeName, colors, contrastRequirements[themeName]),
      ...(shade === undefined || highlight === undefined
        ? []
        : checkButtonEdges(themeName, colors, shade, highlight)),
    ]
  })
}
