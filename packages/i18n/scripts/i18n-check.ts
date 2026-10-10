// `vp run i18n:check`: every locale has exactly the keys of `en`, with matching
// kinds and parameter counts, and no empty strings (AGENTS.md, hard rule 4).
import { compareCatalogs, describeCatalog } from '../src/catalog-shape.ts'
import { en } from '../src/locales/en.ts'
import { fi } from '../src/locales/fi.ts'
import { nb } from '../src/locales/nb.ts'
import { nn } from '../src/locales/nn.ts'
import { sv } from '../src/locales/sv.ts'

const catalogs = { sv, fi, nb, nn }
const emptyEnglishKeys = [...describeCatalog(en)]
  .filter(([, kind]) => kind === 'empty string')
  .map(([path]) => `en: "${path}" is empty`)
const problems = [
  ...emptyEnglishKeys,
  ...Object.entries(catalogs).flatMap(([code, catalog]) =>
    compareCatalogs('en', en, code, catalog),
  ),
]

if (problems.length > 0) {
  console.error(
    `i18n:check failed with ${problems.length} problem(s):\n${problems.map((problem) => `  ${problem}`).join('\n')}`,
  )
  process.exit(1)
}
console.log(
  `i18n:check passed: ${describeCatalog(en).size} key(s) in ${Object.keys(catalogs).length + 1} locales.`,
)
