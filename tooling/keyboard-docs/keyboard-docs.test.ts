import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  findKeyboardDocsProblems,
  importedContract,
  listContracts,
  listStoriesFiles,
} from './check-keyboard-docs.ts'

// Plan 0015: every component's Docs page shows its contract's Keyboard section, and
// every key in it names a test. Like raw-colours: assert the walk found the files first, so an
// empty walk can't pass.

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

describe('importedContract', () => {
  it('finds the ?raw contract import and resolves it from the stories file', () => {
    const contract = importedContract(
      '/repo/apps/storybook/src/components/input/input.stories.tsx',
      `import contract from '../../../../../packages/react/src/input/input.a11y.md?raw'\n`,
    )
    expect(contract).toEqual({
      name: 'contract',
      path: '/repo/packages/react/src/input/input.a11y.md',
    })
  })

  it('finds nothing when a stories file imports no contract', () => {
    expect(
      importedContract('/a/b.stories.tsx', `import { Button } from '@kvirn-ui/react'`),
    ).toBeUndefined()
  })
})

describe('Keyboard sections', () => {
  it('finds the stories files and the contracts it checks', () => {
    const stories = listStoriesFiles(repositoryRoot).map((file) => relative(repositoryRoot, file))
    expect(stories).toEqual(
      expect.arrayContaining([
        'apps/storybook/src/components/button/button.stories.tsx',
        'apps/storybook/src/components/input/input.stories.tsx',
        'apps/storybook/src/components/provider/kvirn-provider.stories.tsx',
      ]),
    )
    const contracts = listContracts(repositoryRoot).map((file) => relative(repositoryRoot, file))
    expect(contracts).toEqual(
      expect.arrayContaining([
        'packages/react/src/button/button.a11y.md',
        'packages/react/src/input/input.a11y.md',
        'packages/react/src/provider/kvirn-provider.a11y.md',
      ]),
    )
  })

  it('every stories file passes its contract, and every contract has a valid Keyboard section whose rows name tests', () => {
    expect(findKeyboardDocsProblems(repositoryRoot)).toEqual([])
  })
})
