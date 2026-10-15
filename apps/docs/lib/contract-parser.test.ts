import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, test } from 'vite-plus/test'
import { parseContract } from './contract-parser.ts'

const repositoryRoot = join(import.meta.dirname, '../../..')
const sourceRoot = join(repositoryRoot, 'packages/react/src')

const contractsIn = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return contractsIn(path)
    return entry.name.endsWith('.a11y.md') ? [path] : []
  })

// page-tools has an Announcements table with a column set the parser doesn't know yet.
const knownUnparsed = ['page-tools.a11y.md']

const contractFiles = ['react', 'rich-text', 'patterns', 'map']
  .flatMap((name) => contractsIn(join(repositoryRoot, 'packages', name, 'src')))
  .filter((path) => !knownUnparsed.some((name) => path.endsWith(`/${name}`)))

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

  const buttonContract = () =>
    readFileSync(join(sourceRoot, 'button/button.a11y.md'), 'utf8').replaceAll('\r', '')
  const noKnownIssues = (markdown: string) =>
    markdown.replace(/## Known issues[\s\S]*$/, '## Known issues\n\n- none\n')

  test('the accessibility sections follow the template order, with Testing last', () => {
    const contract = parseContract(buttonContract(), 'button.a11y.md')
    expect(contract.accessibility.map((section) => section.id)).toEqual([
      'what-it-does-for-you',
      'what-you-need-to-do',
      'visual-and-modes',
      'focus',
      'wcag-success-criteria',
      'testing',
    ])
    expect(contract.accessibility.at(-1)?.title).toBe('Testing')
  })

  test('the AT record has the columns AT, Agent check, Human check, Result and Notes', () => {
    const contract = parseContract(buttonContract(), 'button.a11y.md')
    const testing = contract.accessibility.find((section) => section.id === 'testing')
    const table = testing?.body.find((block) => block.type === 'table')
    expect(table?.type === 'table' ? table.columns : []).toEqual([
      'AT + browser + OS',
      'Agent check',
      'Human check',
      'Result',
      'Notes',
    ])
  })

  test('the old AT record columns (Date, Tester) are rejected', () => {
    const old = buttonContract().replace(
      '| Agent check | Human check | Result  | Notes |',
      '| Date | Tester | Result | Notes |',
    )
    expect(() => parseContract(old, 'button.a11y.md')).toThrow(/unknown column set/)
  })

  test('Known issues is its own section, and a contract that says none has no issues', () => {
    const contract = parseContract(buttonContract(), 'button.a11y.md')
    expect(contract.knownIssues.length).toBeGreaterThan(0)
    expect(contract.accessibility.some((section) => section.id === 'known-issues')).toBe(false)
    const none = parseContract(noKnownIssues(buttonContract()), 'button.a11y.md')
    expect(none.knownIssues).toEqual([])
    const noneSentence = parseContract(
      buttonContract().replace(/## Known issues[\s\S]*$/, '## Known issues\n\nNone.\n'),
      'button.a11y.md',
    )
    expect(noneSentence.knownIssues).toEqual([])
  })

  test('a Read aloud table under Announcements is parsed even when the section says None', () => {
    const markdown = buttonContract().replace(
      /## Announcements[\s\S]*?(?=\n## )/,
      [
        '## Announcements',
        '',
        'None. The role and name are the announcement.',
        '',
        '### Read aloud',
        '',
        '| State or action | Expected phrase(s) as read aloud | Live region politeness | Test |',
        '| --- | --- | --- | --- |',
        '| The content overflows | `region, <name>` | none | none yet |',
        '',
      ].join('\n'),
    )
    const contract = parseContract(markdown, 'button.a11y.md')
    expect(contract.announcements).toEqual({ kind: 'none' })
    expect(contract.readAloud).toEqual([
      {
        state: 'The content overflows',
        phrases: '`region, <name>`',
        politeness: 'none',
        test: 'none yet',
      },
    ])
  })

  test('the Grid and ScrollArea contracts keep their Read aloud rows', () => {
    for (const name of ['grid', 'scroll-area']) {
      const markdown = readFileSync(join(sourceRoot, name, `${name}.a11y.md`), 'utf8')
      const contract = parseContract(markdown, `${name}.a11y.md`)
      expect(contract.announcements).toEqual({ kind: 'none' })
      expect(contract.readAloud.length).toBeGreaterThan(0)
    }
  })
})
