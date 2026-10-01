// `vp run theme:check`: theme.css defines every colour token in all four themes, its OS
// fallbacks match, and every declared pair meets its WCAG contrast minimum (ADR-0013).
import { readFileSync } from 'node:fs'
import { checkThemeCss } from '../src/check-theme.ts'
import { contrastRequirements, themeNames } from '../src/contrast-requirements.ts'

const themeCss = readFileSync(new URL('../theme.css', import.meta.url), 'utf8')
const problems = checkThemeCss(themeCss)
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
console.log(
  `theme:check passed: theme.css, ${pairCount} contrast pair(s) in ${themeNames.length} themes.`,
)
