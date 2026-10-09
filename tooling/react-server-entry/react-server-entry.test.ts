import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vite-plus/test'

// `@kvirn-ui/react/server` is imported by Server Components, so neither it nor a chunk it imports
// may start with `'use client'`; the client entries must (Plan 0094). The dist is not committed,
// so this test builds it first with `vp pack` in packages/react (a few seconds).

const reactPackage = fileURLToPath(new URL('../../packages/react', import.meta.url))
const distribution = join(reactPackage, 'dist')

const read = (file: string) => readFileSync(join(distribution, file), 'utf8')
const startsWithClientDirective = (file: string) => /^\s*(['"])use client\1/.test(read(file))

/** Relative files a built file imports or requires, followed transitively. */
function reachableFiles(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry)) {
    return seen
  }
  seen.add(entry)
  const source = read(entry)
  for (const match of source.matchAll(/(?:from|require\()\s*['"]\.\/([^'"]+)['"]/g)) {
    reachableFiles(match[1] as string, seen)
  }
  return seen
}

beforeAll(() => {
  execFileSync('pnpm', ['exec', 'vp', 'pack'], { cwd: reactPackage, stdio: 'pipe' })
}, 180_000)

describe('@kvirn-ui/react/server build', () => {
  for (const file of ['server.mjs', 'server.cjs']) {
    it(`${file} and every chunk it imports carry no 'use client'`, () => {
      const files = reachableFiles(file)
      expect(files.has(file)).toBe(true)
      for (const reached of files) {
        expect(`${reached}: ${startsWithClientDirective(reached)}`).toBe(`${reached}: false`)
      }
    })

    it(`${file} imports nothing from the client entries`, () => {
      for (const reached of reachableFiles(file)) {
        expect(reached).not.toMatch(/^(index|internal)\./)
      }
    })
  }

  for (const file of ['index.mjs', 'index.cjs', 'internal.mjs', 'internal.cjs']) {
    it(`${file} still starts with 'use client'`, () => {
      expect(startsWithClientDirective(file)).toBe(true)
    })
  }
})
