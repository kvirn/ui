import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import { findNonEnglish, type SourceFile } from './find-non-english.ts'

// Authored text is English. Swedish, Finnish and Norwegian prose lives in packages/i18n, or carries
// a `kv-lang-ok: <reason>` marker. See plan 0123.
const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

// Paths that still hold unswept text, as file paths or directory prefixes (ending in "/"). Each
// sweep batch removes its entry, and an entry that no longer matches an offender fails the test,
// so the list only shrinks. It is empty when plan 0123 is done.
const pending = []

function isPending(file: string): boolean {
  return pending.some((entry) => file === entry || (entry.endsWith('/') && file.startsWith(entry)))
}

function readRepositoryFiles(): SourceFile[] {
  const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  return (
    output
      .split('\n')
      // A file that is staged for deletion is still listed but no longer on disk.
      .filter((path) => path !== '' && existsSync(`${repositoryRoot}/${path}`))
      .map((path) => ({ path, text: readFileSync(`${repositoryRoot}/${path}`, 'utf8') }))
  )
}

function offendingPaths(offences: string[]): string[] {
  return [...new Set(offences.map((offence) => offence.replace(/:\d+: .*$/s, '')))]
}

describe('english-only detector', () => {
  it('flags a Swedish sentence', () => {
    expect(findNonEnglish('Vi svarar inom två arbetsdagar och skickar beslutet.')).toHaveLength(1)
    expect(findNonEnglish('Hur ska vi kontakta dig?')).toHaveLength(1)
  })

  it('flags a Finnish sentence', () => {
    expect(findNonEnglish('Voit vastata ruotsiksi, suomeksi tai englanniksi.')).toHaveLength(1)
    expect(findNonEnglish('Rakentaminen ja asuminen')).toHaveLength(1)
  })

  it('flags a Norwegian sentence', () => {
    expect(findNonEnglish('Vi ringer bare hvis noe er feil.')).toHaveLength(1)
    expect(findNonEnglish('Skriv adressen uten land og postnummer.')).toHaveLength(1)
    expect(findNonEnglish('Han har ikke svart ennå.')).toHaveLength(1)
  })

  it('flags a plain Swedish noun that has no Nordic letter or stop-word', () => {
    expect(findNonEnglish('<Button>Spara</Button>')).toHaveLength(1)
    expect(findNonEnglish("const label = 'Adress'")).toHaveLength(1)
    expect(findNonEnglish('const telefon = 1')).toHaveLength(1)
  })

  it('flags a plain Finnish and Norwegian noun', () => {
    expect(findNonEnglish('<h2>Rakennus</h2>')).toHaveLength(1)
    expect(findNonEnglish('<Link>Sivut</Link>')).toHaveLength(1)
    expect(findNonEnglish('<Link>Søknad</Link>')).toHaveLength(1)
  })

  it('does not flag an English word a catalog also spells, or a word inside a URL', () => {
    expect(
      findNonEnglish(
        [
          'Put it under the heading, over the fold, to the side.',
          'The marker is bare; send it just once.',
          'See https://bilder.example.se/kontakt for the image.',
        ].join('\n'),
      ),
    ).toEqual([])
  })

  it('flags a Nordic letter in either case', () => {
    expect(findNonEnglish('Ä')).toHaveLength(1)
    expect(findNonEnglish('æ')).toHaveLength(1)
    expect(findNonEnglish('Ø')).toHaveLength(1)
  })

  it('does not flag plain English or place names without diacritics', () => {
    expect(
      findNonEnglish(
        [
          'The municipality of Kvirnby answers within two working days.',
          'Offices in Stockholm, Helsinki and Oslo; the code is for everyone.',
          'Use e.g. a button, or an anchor for navigation.',
          'const country = { EG: 20 }',
        ].join('\n'),
      ),
    ).toEqual([])
  })

  it('reports file:line: text for files', () => {
    const report = findNonEnglish([
      { path: 'docs/a.md', text: 'Fine line\nVi är här' },
      { path: 'docs/b.md', text: 'All English' },
    ])
    expect(report).toEqual(['docs/a.md:2: Vi är här'])
  })

  it('is silenced by a marker with a reason on the line', () => {
    expect(findNonEnglish("const label = 'Svenska' // kv-lang-ok: a language's own name")).toEqual(
      [],
    )
  })

  it('is silenced by a marker with a reason on the line above', () => {
    expect(
      findNonEnglish('// kv-lang-ok: collation fixture\nconst names = ["Åsa", "Örjan"]'),
    ).toEqual([])
    expect(
      findNonEnglish('// kv-lang-ok: collation fixture\n\nconst names = ["Åsa"]'),
    ).toHaveLength(1)
  })

  it('is silenced by a file marker in the first 10 lines', () => {
    const head = '<!-- kv-lang-ok-file: locale behaviour fixture -->\n'
    expect(findNonEnglish(`${head}Vi svarar inom två dagar.\nOch här är mer.`)).toEqual([])
    const late = `${'x\n'.repeat(10)}<!-- kv-lang-ok-file: too late -->\nVi svarar inom två dagar.`
    expect(findNonEnglish(late)).toEqual(['12: Vi svarar inom två dagar.'])
  })

  it('flags a marker without a reason', () => {
    expect(findNonEnglish('// kv-lang-ok:\nconst name = "Åsa"')).toEqual([
      '1: // kv-lang-ok:',
      '2: const name = "Åsa"',
    ])
    expect(findNonEnglish('<!-- kv-lang-ok -->\nHej och välkommen')).toHaveLength(2)
    expect(findNonEnglish('<!-- kv-lang-ok-file: -->\nHej och välkommen')).toHaveLength(2)
  })

  it('exempts packages/i18n, changesets, changelogs and lockfiles', () => {
    const text = 'Vi svarar inom två dagar.'
    expect(
      findNonEnglish([
        { path: 'packages/i18n/src/locales/sv.ts', text },
        { path: '.changeset/brave-lions.md', text },
        { path: 'packages/react/CHANGELOG.md', text },
        { path: 'pnpm-lock.yaml', text },
      ]),
    ).toEqual([])
  })

  it('skips binary content', () => {
    expect(findNonEnglish([{ path: 'a.bin', text: 'Vi är\0här' }])).toEqual([])
  })
})

describe('english-only repository', () => {
  const offences = findNonEnglish(readRepositoryFiles())
  const outsidePending = offences.filter((offence) => !isPending(offence.replace(/:\d+: .*$/s, '')))

  it('has no unmarked Nordic prose outside the pending list', () => {
    expect(outsidePending).toEqual([])
  })

  it('keeps every pending entry matched by at least one offender', () => {
    const paths = offendingPaths(offences)
    const stale = pending.filter(
      (entry) =>
        !paths.some((path) => path === entry || (entry.endsWith('/') && path.startsWith(entry))),
    )
    expect(stale).toEqual([])
  })
})
