import { contrastRatio } from './contrast.ts'
import type { ContrastRequirement, ThemeName } from './tokens.ts'

/** Returns one message per unmet contrast requirement or unknown token. */
export function checkTheme(
  themeName: ThemeName,
  tokens: Record<string, string>,
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
