import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'

// The Foundation page "Dev warnings" lists every developer warning, and it is the one place that
// list lives. This test keeps it true (Plan 0017): every `warnOnce('<code>', …)` call in a
// package's source needs a row on the page, and every row needs a call. A code that has a
// variable part is written the same way in both places, with `${…}` in the source and `<name>` on
// the page, such as `toggle-not-a-button:${rendered}` and `toggle-not-a-button:<element>`. Like
// raw-colours: assert the walk found the files and rows first, so an empty walk can't pass.

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))
const pagePath = join(repositoryRoot, 'apps/storybook/src/foundation/dev-warnings.mdx')

/** A string or template literal at `start` (after any whitespace), without its quotes. */
function literalAt(source: string, start: number): { text: string; end: number } | undefined {
  let index = start
  while (/\s/.test(source.charAt(index))) {
    index += 1
  }
  const quote = source.charAt(index)
  if (quote !== "'" && quote !== '"' && quote !== '`') {
    return undefined
  }
  let depth = 0
  for (let cursor = index + 1; cursor < source.length; cursor += 1) {
    const character = source.charAt(cursor)
    if (character === '\\') {
      cursor += 1
    } else if (quote !== '`') {
      if (character === quote) {
        return { text: source.slice(index + 1, cursor), end: cursor + 1 }
      }
    } else if (depth === 0 && character === '`') {
      return { text: source.slice(index + 1, cursor), end: cursor + 1 }
    } else if (character === '$' && source.charAt(cursor + 1) === '{') {
      depth += 1
      cursor += 1
    } else if (depth > 0 && character === '{') {
      depth += 1
    } else if (depth > 0 && character === '}') {
      depth -= 1
    }
  }
  return undefined
}

/** `a-${part.toLowerCase()}-b` as `a-*-b`: each `${…}`, nested braces included, is one `*`. */
function starPlaceholders(code: string): string {
  let result = ''
  let depth = 0
  for (let index = 0; index < code.length; index += 1) {
    const character = code.charAt(index)
    if (depth === 0 && character === '$' && code.charAt(index + 1) === '{') {
      depth = 1
      index += 1
      result += '*'
    } else if (depth > 0 && character === '{') {
      depth += 1
    } else if (depth > 0 && character === '}') {
      depth -= 1
    } else if (depth === 0) {
      result += character
    }
  }
  return result
}

interface SourceKey {
  /** `packages/react/src/button/button.tsx:99`. */
  where: string
  /** The first argument as a literal, or `undefined` when it isn't one. */
  code: string | undefined
}

/** Every `warnOnce(` call's key in a source text. */
function warnOnceKeys(source: string, file: string): SourceKey[] {
  const keys: SourceKey[] = []
  let from = 0
  for (;;) {
    const call = source.indexOf('warnOnce(', from)
    if (call === -1) {
      return keys
    }
    const literal = literalAt(source, call + 'warnOnce('.length)
    const line = source.slice(0, call).split('\n').length
    keys.push({ where: `${file}:${line}`, code: literal?.text })
    from = call + 'warnOnce('.length
  }
}

function sourceFiles(directory: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
      continue
    }
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      found.push(...sourceFiles(path))
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.(test|stories)\.tsx?$/.test(entry.name) &&
      // The definition of `warnOnce` itself, whose parameter is not a code.
      entry.name !== 'dev-warning.ts'
    ) {
      found.push(path)
    }
  }
  return found
}

/** Every package that has a `src` folder, as `@kvirn-ui/react` and `@kvirn-ui/rich-text` do. */
function packageSourceDirectories(): string[] {
  const packages = join(repositoryRoot, 'packages')
  return readdirSync(packages)
    .map((name) => join(packages, name, 'src'))
    .filter((directory) => existsSync(directory))
}

function codesInSource(): SourceKey[] {
  return packageSourceDirectories().flatMap((directory) =>
    sourceFiles(directory).flatMap((file) =>
      warnOnceKeys(readFileSync(file, 'utf8'), relative(repositoryRoot, file)),
    ),
  )
}

/** `| `code` | From | What is wrong | Fix |`: the rows whose first cell is code. */
const codeRow = /^\|\s*`([^`]+)`\s*\|(.*)\|\s*$/

function rowsInPage() {
  return readFileSync(pagePath, 'utf8')
    .split('\n')
    .flatMap((line, index) => {
      const match = codeRow.exec(line)
      if (match === null) {
        return []
      }
      const cells = (match[2] ?? '').split('|').map((cell) => cell.trim())
      return [{ line: index + 1, code: match[1] ?? '', cells }]
    })
}

const pageCode = (code: string) => code.replaceAll(/<[^>]*>/g, '*')

describe('the code parser', () => {
  it('reads plain, template and nested template keys', () => {
    expect(warnOnceKeys(`warnOnce('plain-key', 'Message.')`, 'a.ts')[0]?.code).toBe('plain-key')
    expect(
      warnOnceKeys('warnOnce(\n  `a-${part.toLowerCase()}-b`,\n  `m`,\n)', 'a.ts')[0]?.code,
    ).toBe('a-${part.toLowerCase()}-b')
    expect(
      warnOnceKeys("warnOnce(`x:${ids.join(',')}`, `m ${a ? '{' : '}'}`)", 'a.ts')[0]?.code,
    ).toBe("x:${ids.join(',')}")
  })

  it('reports a key that is not a literal, so it can be listed', () => {
    expect(warnOnceKeys('warnOnce(key, message)', 'a.ts')[0]?.code).toBeUndefined()
  })

  it('turns each placeholder into one star', () => {
    expect(starPlaceholders('a-${part.toLowerCase()}-b')).toBe('a-*-b')
    expect(starPlaceholders("x:${ids.join(',')}:${{ a: 1 }.a}")).toBe('x:*:*')
    expect(pageCode('toggle-not-a-button:<element>')).toBe('toggle-not-a-button:*')
  })
})

describe('Foundation/Dev warnings', () => {
  const calls = codesInSource()
  const rows = rowsInPage()

  it('finds the calls and the rows', () => {
    expect(calls.length).toBeGreaterThan(90)
    expect(rows.length).toBeGreaterThan(90)
  })

  it('has a literal key at every warnOnce call, so it can be listed', () => {
    expect(calls.filter(({ code }) => code === undefined).map(({ where }) => where)).toEqual([])
  })

  it('has a row for every warning code in the source', () => {
    const listed = new Set(rows.map(({ code }) => pageCode(code)))
    const missing = calls.flatMap(({ where, code }) =>
      code !== undefined && !listed.has(starPlaceholders(code)) ? [`${where}: ${code}`] : [],
    )
    expect(missing).toEqual([])
  })

  it('has no row for a code that is not in the source', () => {
    const logged = new Set(
      calls.flatMap(({ code }) => (code === undefined ? [] : [starPlaceholders(code)])),
    )
    const stale = rows.filter(({ code }) => !logged.has(pageCode(code)))
    expect(stale.map(({ line, code }) => `dev-warnings.mdx:${line}: ${code}`)).toEqual([])
  })

  it('lists each code once', () => {
    const seen = new Set<string>()
    const repeated = rows.flatMap(({ line, code }) => {
      const key = pageCode(code)
      const isRepeat = seen.has(key)
      seen.add(key)
      return isRepeat ? [`dev-warnings.mdx:${line}: ${code}`] : []
    })
    expect(repeated).toEqual([])
  })

  it('says where it comes from, what is wrong and the fix in every row', () => {
    const incomplete = rows.filter(
      ({ cells }) => cells.length !== 3 || cells.some((cell) => cell === ''),
    )
    expect(incomplete.map(({ line, code }) => `dev-warnings.mdx:${line}: ${code}`)).toEqual([])
  })
})
