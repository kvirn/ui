import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import { findPropsUsedProblems, listUseCases } from './check-props-used.ts'

// "Props in this example" names only props the example's own source passes on that part. Like
// keyboard-docs: assert the walk found the use cases first, so an empty walk can't pass.

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

/** A docs site with one page, `demo`, whose single use case lists `propsUsed` for `example`. */
function problemsFor(
  propsUsed: string,
  example: string,
  pageHeader = '',
  extraFiles: Record<string, string> = {},
): string[] {
  const directory = mkdtempSync(join(tmpdir(), 'props-used-'))
  const write = (file: string, text: string) => {
    mkdirSync(dirname(join(directory, file)), { recursive: true })
    writeFileSync(join(directory, file), text)
  }
  try {
    write(
      'apps/docs/app/(docs)/components/demo/page.tsx',
      `import { DemoPage } from '../../../../components/demo-page.tsx'
export default function Page() {
  return <DemoPage sources={{ 'one': readExampleSource('demo/one.tsx') }} />
}`,
    )
    write(
      'apps/docs/components/demo-page.tsx',
      `${pageHeader}
export function DemoPage({ sources }) {
  return (
    <UseCase id="one" title="One" why="Why" code={sources['one']} propsUsed={${propsUsed}}>
      <One />
    </UseCase>
  )
}`,
    )
    write('apps/docs/examples/demo/one.tsx', example)
    for (const [file, text] of Object.entries(extraFiles)) {
      write(file, text)
    }
    return findPropsUsedProblems(directory)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('component parts', () => {
  it('accepts a prop written on the named part', () => {
    expect(
      problemsFor(
        `[{ part: 'Tabs.Root', prop: 'defaultValue' }, { part: 'Tabs.Root', prop: 'ready' }]`,
        `<Tabs.Root defaultValue="a" ready />`,
      ),
    ).toEqual([])
  })

  it('reports a prop that only a different part passes', () => {
    const problems = problemsFor(
      `[{ part: 'InputGroup.Root', prop: 'invalid' }]`,
      `<Field.Root invalid><InputGroup.Root></InputGroup.Root></Field.Root>`,
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('components/demo-page.tsx › one')
    expect(problems[0]).toContain('part InputGroup.Root, prop invalid')
  })

  it('does not count a spread as passing the prop', () => {
    expect(
      problemsFor(`[{ part: 'Button', prop: 'disabled' }]`, `<Button {...rest} />`),
    ).toHaveLength(1)
  })

  it('does not take a longer name for the part', () => {
    expect(
      problemsFor(`[{ part: 'Button', prop: 'variant' }]`, `<ButtonGroup variant="a" />`),
    ).toHaveLength(1)
  })

  it('accepts any name of a joined part', () => {
    expect(
      problemsFor(
        `[{ part: 'Table.SelectCheckbox, Table.SelectAllCheckbox', prop: 'row' }]`,
        `<Table.SelectCheckbox row={row} />`,
      ),
    ).toEqual([])
  })

  it('finds the end of a tag past an arrow function in an attribute', () => {
    expect(
      problemsFor(
        `[{ part: 'Button', prop: 'onClick' }, { part: 'Button', prop: 'disabled' }]`,
        `<Button onClick={() => save()} disabled>Save</Button>`,
      ),
    ).toEqual([])
    expect(
      problemsFor(
        `[{ part: 'Button', prop: 'disabled' }]`,
        `<Button onClick={() => save()}>disabled</Button>`,
      ),
    ).toHaveLength(1)
  })

  it('counts children only when the tag has content', () => {
    expect(
      problemsFor(`[{ part: 'Link.NewTabNotice', prop: 'children' }]`, `<Link.NewTabNotice />`),
    ).toHaveLength(1)
    expect(
      problemsFor(
        `[{ part: 'Link.NewTabNotice', prop: 'children' }]`,
        `<Link.NewTabNotice>x</Link.NewTabNotice>`,
      ),
    ).toEqual([])
  })
})

describe('data-type parts', () => {
  const entry = `[{ part: 'MapPlace', prop: 'image' }]`

  it('accepts a part with no tag when the prop is an object key in the example', () => {
    expect(problemsFor(entry, `const places = [{ id: 'a', image: 'a.jpg' }]`)).toEqual([])
  })

  it('reports a part with no tag when no object has the key', () => {
    expect(problemsFor(entry, `const places = [{ id: 'a' }]`)).toHaveLength(1)
  })

  it('finds the key in a file the example imports from its own directory', () => {
    expect(
      problemsFor(entry, `import { places } from './texts.ts'`, '', {
        'apps/docs/examples/demo/texts.ts': `export const places = [{ image: 'a.jpg' }]`,
      }),
    ).toEqual([])
  })

  it('does not look in a file imported from outside the example directory', () => {
    expect(
      problemsFor(entry, `import { places } from '../other/texts.ts'`, '', {
        'apps/docs/examples/other/texts.ts': `export const places = [{ image: 'a.jpg' }]`,
      }),
    ).toHaveLength(1)
  })

  it('still needs the attribute when the part has a tag', () => {
    expect(problemsFor(entry, `<MapPlace />\nconst places = [{ image: 'a.jpg' }]`)).toHaveLength(1)
  })
})

describe('hooks', () => {
  const header = `const useTabsOptions = apiHookPart('useTabs', 'options')`

  it('accepts an option that is a key of the first argument', () => {
    expect(
      problemsFor(
        `[{ part: apiHookPart('useTabs', 'options'), label: 'useTabs (options)', prop: 'orientation' }]`,
        `const tabs = useTabs({ orientation: 'vertical', onChange })`,
      ),
    ).toEqual([])
  })

  it('reports an option the call does not pass, and a hook the example never calls', () => {
    const entry = `[{ part: apiHookPart('useTabs', 'options'), label: 'useTabs (options)', prop: 'orientation' }]`
    expect(problemsFor(entry, `const tabs = useTabs({ onChange })`)).toHaveLength(1)
    expect(problemsFor(entry, `const tabs = other({ orientation: 'x' })`)).toHaveLength(1)
  })

  it('resolves a part held in a constant', () => {
    expect(
      problemsFor(
        `[{ part: useTabsOptions, label: 'useTabs', prop: 'orientation' }]`,
        `useTabs({ orientation: 'vertical' })`,
        header,
      ),
    ).toEqual([])
  })

  it('reads the options of a function such as announce(message, options)', () => {
    expect(
      problemsFor(
        `[{ part: apiHookPart('announce', 'options'), label: 'announce', prop: 'politeness' }]`,
        `announce(text, { politeness: 'assertive' })`,
      ),
    ).toEqual([])
  })
})

describe('what it cannot read', () => {
  it('reports an unparsable part with the page, use case, part and prop', () => {
    const problems = problemsFor(`[{ part: makePart(), prop: 'x' }]`, `<A x />`)
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('components/demo-page.tsx › one')
    expect(problems[0]).toContain('prop x')
  })

  it('reports a propsUsed list that is not an array literal', () => {
    expect(problemsFor(`entries`, `<A x />`)[0]).toContain("can't read propsUsed")
  })

  it('reports an entry whose prop is not a string literal', () => {
    expect(problemsFor(`[{ part: 'A', prop: name }]`, `<A x />`)).toHaveLength(1)
  })
})

describe('the docs site', () => {
  it('finds the use cases it checks', () => {
    expect(listUseCases(repositoryRoot).length).toBeGreaterThan(100)
  })

  it('every use case lists only props its example passes on that part', () => {
    expect(findPropsUsedProblems(repositoryRoot)).toEqual([])
  })
})
