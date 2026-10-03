import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import { readRootProperties, themeEnvironment } from '../../packages/theme/src/index.ts'

// The Foundation reference pages are MDX with static tables, so a token that's
// renamed or changed in theme.css must fail here, not drift silently. In a `## Tokens`
// section, every table row that starts with a `--kv-*` token must name a token theme.css
// defines on :root, and its first code cell must be that token's value (a `var()` is resolved
// first). Other sections, such as the properties an app sets itself, aren't checked. Like
// raw-colours: assert the walk found the files and rows first, so an empty walk can't pass.

const foundationDirectory = fileURLToPath(
  new URL('../../apps/storybook/src/foundation/', import.meta.url),
)
const themeCss = readFileSync(
  fileURLToPath(new URL('../../packages/theme/theme.css', import.meta.url)),
  'utf8',
)
const rootProperties = readRootProperties(themeCss, themeEnvironment('light'))

/** `| `--kv-space-4` | `1rem` | 16px |`: the token, then the first cell, when it's code. */
const tokenRow = /^\|\s*`(--kv-[a-z0-9-]+)`\s*\|\s*(?:`([^`]+)`)?/

const pages = readdirSync(foundationDirectory).filter((file) => file.endsWith('.mdx'))

/** `var(--kv-space-5)` as `1.25rem`, as theme.css computes it. */
const resolved = (value: string): string =>
  value.replace(
    /var\((--[a-z0-9-]+)\)/g,
    (variable, name: string) => rootProperties[name] ?? variable,
  )

const rowsOf = (page: string) => {
  let isTokensSection = false
  return readFileSync(`${foundationDirectory}${page}`, 'utf8')
    .split('\n')
    .flatMap((line) => {
      if (line.startsWith('## ')) {
        isTokensSection = line === '## Tokens'
      }
      const match = isTokensSection ? tokenRow.exec(line) : null
      return match === null ? [] : [{ token: match[1] ?? '', value: match[2] }]
    })
}

describe('Foundation MDX pages', () => {
  it('finds the pages and their token rows', () => {
    expect(pages).toEqual(
      expect.arrayContaining([
        'borders-elevation.mdx',
        'density.mdx',
        'focus-ring.mdx',
        'layout.mdx',
        'motion.mdx',
        'overview.mdx',
        'radius.mdx',
        'spacing.mdx',
        'theming.mdx',
      ]),
    )
    expect(pages.flatMap(rowsOf).length).toBeGreaterThan(30)
  })

  for (const page of pages.filter((candidate) => rowsOf(candidate).length > 0)) {
    const rows = rowsOf(page)
    it(`${page}: every documented token exists in theme.css`, () => {
      const unknown = rows.filter(({ token }) => rootProperties[token] === undefined)
      expect(unknown.map(({ token }) => token)).toEqual([])
    })

    it(`${page}: every documented value is theme.css's`, () => {
      const wrong = rows.flatMap(({ token, value }) => {
        const actual = rootProperties[token]
        return value === undefined || actual === undefined || resolved(value) === actual
          ? []
          : [`${token}: documented \`${value}\`, theme.css has \`${actual}\``]
      })
      expect(wrong).toEqual([])
    })
  }
})
