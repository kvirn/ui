import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import {
  keyboardRowProblems,
  parseKeyboardSection,
  parseTestCell,
} from './parse-keyboard-section.ts'

// Plan 0015: every component's Docs page shows its contract's Keyboard section. The
// page reads the contract the stories file imports (`?raw`) and passes as `a11yContract`, so the
// check walks the stories files and the contracts, and reports every gap.

function walk(directory: string, keep: (name: string) => boolean): string[] {
  let entries
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return []
  }
  return entries.flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      return []
    }
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      return walk(path, keep)
    }
    return keep(entry.name) ? [path] : []
  })
}

/**
 * `packages/<name>/src` for every package that has one. Contracts and component tests live in the
 * package that owns the component (`@kvirn-ui/react`, and `@kvirn-ui/rich-text` since Plan 0036).
 */
export function listPackageSourceDirectories(repositoryRoot: string): string[] {
  const packagesDirectory = join(repositoryRoot, 'packages')
  let entries
  try {
    entries = readdirSync(packagesDirectory, { withFileTypes: true })
  } catch {
    return []
  }
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packagesDirectory, entry.name, 'src'))
    .filter((directory) => {
      try {
        return readdirSync(directory).length > 0
      } catch {
        return false
      }
    })
    .toSorted()
}

/** `apps/storybook/src/components/<name>/<name>.stories.tsx` */
export function listStoriesFiles(repositoryRoot: string): string[] {
  return walk(join(repositoryRoot, 'apps/storybook/src/components'), (name) =>
    name.endsWith('.stories.tsx'),
  ).toSorted()
}

/** `packages/*\/src/**\/*.a11y.md` */
export function listContracts(repositoryRoot: string): string[] {
  return listPackageSourceDirectories(repositoryRoot)
    .flatMap((directory) => walk(directory, (name) => name.endsWith('.a11y.md')))
    .toSorted()
}

const rawContractImport = /^import\s+(\w+)\s+from\s+'([^']+\.a11y\.md)\?raw'/m

/** The contract a stories file imports with `?raw`, as an absolute path, and its local name. */
export function importedContract(
  storiesFile: string,
  source: string,
): { name: string; path: string } | undefined {
  const match = rawContractImport.exec(source)
  return match === null
    ? undefined
    : { name: match[1] ?? '', path: resolve(dirname(storiesFile), match[2] ?? '') }
}

/** Every test file a Test cell can name, by file name. */
function listTestFiles(repositoryRoot: string): Map<string, string> {
  const files = [
    ...walk(join(repositoryRoot, 'apps/storybook/src/components'), (name) =>
      name.endsWith('.e2e.ts'),
    ),
    ...listPackageSourceDirectories(repositoryRoot).flatMap((directory) =>
      walk(directory, (name) => name.endsWith('.test.tsx')),
    ),
  ].toSorted()
  const byName = new Map<string, string>()
  for (const file of files) {
    const name = file.slice(file.lastIndexOf('/') + 1)
    if (!byName.has(name)) {
      byName.set(name, file)
    }
  }
  return byName
}

/** Source text as a test title appears in it: `\'` and `\"` unescaped. */
const unescaped = (source: string) => source.replaceAll(/\\(['"`])/g, '$1')

/** Problems with the Test cells: the file must exist, and the test's name must be in it. */
function testReferenceProblems(
  testCell: string,
  testFiles: Map<string, string>,
  sources: Map<string, string>,
): string[] {
  const problems: string[] = []
  for (const { file, path } of parseTestCell(testCell).references) {
    const location = testFiles.get(file)
    if (location === undefined) {
      problems.push(`test file "${file}" doesn't exist`)
      continue
    }
    const name = path.at(-1) ?? ''
    // A name ending in "…" is shortened on purpose: only the file is checked.
    if (name.includes('…')) {
      continue
    }
    let source = sources.get(location)
    if (source === undefined) {
      source = unescaped(readFileSync(location, 'utf8'))
      sources.set(location, source)
    }
    if (!source.includes(name)) {
      problems.push(`"${file} › ${name}" isn't a test title in ${file}`)
    }
  }
  return problems
}

/** Every gap between the stories files, the contracts and the Keyboard sections. */
export function findKeyboardDocsProblems(repositoryRoot: string): string[] {
  const problems: string[] = []
  const at = (file: string) => relative(repositoryRoot, file)
  const contracts = listContracts(repositoryRoot)
  const testFiles = listTestFiles(repositoryRoot)
  const sources = new Map<string, string>()
  const usedContracts = new Set<string>()
  const storiesByContract = new Map<string, string[]>()

  for (const storiesFile of listStoriesFiles(repositoryRoot)) {
    const source = readFileSync(storiesFile, 'utf8')
    const contract = importedContract(storiesFile, source)
    if (contract === undefined) {
      problems.push(`${at(storiesFile)}: no \`import … from '….a11y.md?raw'\``)
      continue
    }
    if (!contracts.includes(contract.path)) {
      problems.push(`${at(storiesFile)}: imports ${at(contract.path)}, which isn't a contract`)
      continue
    }
    if (!new RegExp(String.raw`a11yContract:\s*${contract.name}\b`).test(source)) {
      problems.push(`${at(storiesFile)}: doesn't set parameters.a11yContract to ${contract.name}`)
    }
    usedContracts.add(contract.path)
    storiesByContract.set(contract.path, [
      ...(storiesByContract.get(contract.path) ?? []),
      storiesFile,
    ])
  }

  for (const contractFile of contracts) {
    if (!usedContracts.has(contractFile)) {
      problems.push(`${at(contractFile)}: no stories file imports it`)
    }
    const { section, problems: formatProblems } = parseKeyboardSection(
      readFileSync(contractFile, 'utf8'),
    )
    problems.push(...formatProblems.map((problem) => `${at(contractFile)}: ${problem}`))
    if (section === undefined) {
      continue
    }
    problems.push(
      ...keyboardRowProblems(section).map((problem) => `${at(contractFile)}: ${problem}`),
    )
    for (const row of section.rows) {
      problems.push(
        ...testReferenceProblems(row.test, testFiles, sources).map(
          (problem) => `${at(contractFile)}: row "${row.key}": ${problem}`,
        ),
      )
    }
    if (!section.noKeys) {
      for (const storiesFile of storiesByContract.get(contractFile) ?? []) {
        if (!/^export const Keyboard\b/m.test(readFileSync(storiesFile, 'utf8'))) {
          problems.push(
            `${at(storiesFile)}: no \`Keyboard\` story, but ${at(contractFile)} has focus lines`,
          )
        }
      }
    }
  }
  return problems
}
