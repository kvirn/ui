import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  findKeyboardDocsProblems,
  importedContract,
  listContracts,
  listPackageSourceDirectories,
  listStoriesFiles,
} from './check-keyboard-docs.ts'

// every component's Docs page shows its contract's Keyboard section, and
// every key in it names a test. Like raw-colours: assert the walk found the files first, so an
// empty walk can't pass.

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

describe('importedContract', () => {
  it('finds the ?raw contract import and resolves it from the stories file', () => {
    const contract = importedContract(
      '/repo/apps/storybook/src/components/text-input/text-input.stories.tsx',
      `import contract from '../../../../../packages/react/src/text-input/text-input.a11y.md?raw'\n`,
    )
    expect(contract).toEqual({
      name: 'contract',
      path: '/repo/packages/react/src/text-input/text-input.a11y.md',
    })
  })

  it('finds nothing when a stories file imports no contract', () => {
    expect(
      importedContract('/a/b.stories.tsx', `import { Button } from '@kvirn-ui/react'`),
    ).toBeUndefined()
  })
})

describe('listPackageSourceDirectories', () => {
  it('scans every package that has a src folder, not only @kvirn-ui/react', () => {
    const directories = listPackageSourceDirectories(repositoryRoot).map((directory) =>
      relative(repositoryRoot, directory),
    )
    expect(directories).toEqual(
      expect.arrayContaining(['packages/react/src', 'packages/rich-text/src']),
    )
  })

  it('finds a contract in another package than react', () => {
    const directory = mkdtempSync(join(tmpdir(), 'keyboard-docs-'))
    try {
      mkdirSync(join(directory, 'packages/rich-text/src/editor'), { recursive: true })
      writeFileSync(join(directory, 'packages/rich-text/src/editor/editor.a11y.md'), '# Editor\n')
      expect(listContracts(directory).map((file) => relative(directory, file))).toEqual([
        'packages/rich-text/src/editor/editor.a11y.md',
      ])
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})

describe('Keyboard sections', () => {
  it('finds the stories files and the contracts it checks', () => {
    const stories = listStoriesFiles(repositoryRoot).map((file) => relative(repositoryRoot, file))
    expect(stories).toEqual(
      expect.arrayContaining([
        'apps/storybook/src/components/button/button.stories.tsx',
        'apps/storybook/src/components/text-input/text-input.stories.tsx',
        'apps/storybook/src/components/provider/kvirn-provider.stories.tsx',
      ]),
    )
    const contracts = listContracts(repositoryRoot).map((file) => relative(repositoryRoot, file))
    expect(contracts).toEqual(
      expect.arrayContaining([
        'packages/react/src/button/button.a11y.md',
        'packages/react/src/text-input/text-input.a11y.md',
        'packages/react/src/provider/kvirn-provider.a11y.md',
      ]),
    )
  })

  it('every stories file passes its contract, and every contract has a valid Keyboard section whose rows name tests', () => {
    expect(findKeyboardDocsProblems(repositoryRoot)).toEqual([])
  })
})
