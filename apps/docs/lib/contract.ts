import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { parseContract } from './contract-parser.ts'
import type { Contract } from './contract-parser.ts'

// Server only: reads the contract with `node:fs` at build time. The browser gets the parsed data
// from a server component, never this module (docs/design/docs-component-page.md §6).
export * from './contract-parser.ts'

function findRepositoryRoot(): string {
  let directory = process.cwd()
  while (!existsSync(join(directory, 'pnpm-workspace.yaml'))) {
    const parent = dirname(directory)
    if (parent === directory) {
      throw new Error(
        'Could not find the repository root (pnpm-workspace.yaml) from the docs build.',
      )
    }
    directory = parent
  }
  return directory
}

/** `packages/react/src/<name>/<name>.a11y.md`, or the folder's one contract (`provider/`). */
export function contractPath(name: string, root = findRepositoryRoot()): string {
  const directory = join(root, 'packages/react/src', name)
  const own = join(directory, `${name}.a11y.md`)
  if (existsSync(own)) {
    return own
  }
  const contracts = existsSync(directory)
    ? readdirSync(directory).filter((file) => file.endsWith('.a11y.md'))
    : []
  if (contracts.length !== 1) {
    throw new Error(`No accessibility contract for "${name}": expected ${relative(root, own)}.`)
  }
  return join(directory, contracts[0] ?? '')
}

export function readContract(name: string): Contract {
  const root = findRepositoryRoot()
  const path = contractPath(name, root)
  return parseContract(readFileSync(path, 'utf8'), relative(root, path))
}
