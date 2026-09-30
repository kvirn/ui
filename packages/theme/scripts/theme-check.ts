// `vp run theme:check`: every declared token pair meets its WCAG contrast minimum in all four themes.
import { checkTheme } from '../src/check-theme.ts'
import { colorTokens, contrastRequirements, themeNames } from '../src/tokens.ts'

const problems = themeNames.flatMap((themeName) =>
  checkTheme(themeName, colorTokens[themeName], contrastRequirements[themeName]),
)
const pairCount = themeNames.reduce(
  (total, themeName) => total + contrastRequirements[themeName].length,
  0,
)

if (problems.length > 0) {
  console.error(
    `theme:check failed with ${problems.length} problem(s):\n${problems.map((problem) => `  ${problem}`).join('\n')}`,
  )
  process.exit(1)
}
console.log(`theme:check passed: ${pairCount} contrast pair(s) in ${themeNames.length} themes.`)
