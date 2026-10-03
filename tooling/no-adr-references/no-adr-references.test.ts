import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'

// The ADRs were folded into the skills and docs, and the ADR folder is gone. A rule lives in its
// home (AGENTS.md, the skills, docs/), so nothing in the repository points at an ADR number or
// at the ADR folder any more. This test lists every such reference as file:line.
const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

const adrReference = /\bADR[- ]?\d{4}\b|docs\/adr|\.\.\/adr\//

// The plan and inventory that record the fold, the ADR folder itself while it still exists,
// pending and released changesets (a changelog may keep its history) and this file.
const exempt = [
  /^docs\/plans\/0027-fold-adrs-into-skills\.md$/,
  /^docs\/plans\/0027-adr-fold-inventory\.md$/,
  /^docs\/adr\//,
  /^\.changeset\//,
  /(^|\/)CHANGELOG\.md$/,
  /^tooling\/no-adr-references\/no-adr-references\.test\.ts$/,
]

function listFiles(): string[] {
  const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  return output
    .split('\n')
    .filter((file) => file !== '' && !exempt.some((pattern) => pattern.test(file)))
}

function findReferences(files: string[]): string[] {
  const found: string[] = []
  for (const file of files) {
    // A file that is staged for deletion is still listed but no longer on disk.
    if (!existsSync(`${repositoryRoot}/${file}`)) continue
    const text = readFileSync(`${repositoryRoot}/${file}`, 'utf8')
    if (text.includes('\0')) continue
    text.split('\n').forEach((line, index) => {
      if (adrReference.test(line)) found.push(`${file}:${index + 1}: ${line.trim().slice(0, 100)}`)
    })
  }
  return found
}

describe('no ADR references', () => {
  it('matches ADR numbers and the ADR folder, and nothing else', () => {
    // Built from parts, so this file carries no reference of its own.
    const number = '0016'
    expect(adrReference.test(`see ADR-${number}`)).toBe(true)
    expect(adrReference.test(`ADR ${number}`)).toBe(true)
    expect(adrReference.test(`ADR${number}.`)).toBe(true)
    expect(adrReference.test(`docs/${'adr'}/${number}-x.md`)).toBe(true)
    expect(adrReference.test(`../${'adr'}/README.md`)).toBe(true)
    expect(adrReference.test('an ADR for it')).toBe(false)
  })

  it('has no ADR number or ADR folder path in any file of the repository', () => {
    expect(findReferences(listFiles())).toEqual([])
  })
})
