import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, test } from 'vite-plus/test'
import { parseContract } from './contract-parser.ts'

const repositoryRoot = join(import.meta.dirname, '../../..')
const sourceRoot = join(repositoryRoot, 'packages/react/src')

const contractFiles = readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((entry) =>
    readdirSync(join(sourceRoot, entry.name))
      .filter((file) => file.endsWith('.a11y.md'))
      .map((file) => join(sourceRoot, entry.name, file)),
  )

describe('parseContract', () => {
  test('every accessibility contract parses, so the page can render it', () => {
    expect(contractFiles.length).toBeGreaterThan(0)
    const problems = contractFiles.flatMap((path) => {
      try {
        parseContract(readFileSync(path, 'utf8'), relative(repositoryRoot, path))
        return []
      } catch (error) {
        return [error instanceof Error ? error.message : String(error)]
      }
    })
    expect(problems).toEqual([])
  })
})
