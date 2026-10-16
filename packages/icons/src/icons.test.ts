import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { buildOutputs, camelCase, parseIcon, readMirrorList } from '../scripts/generate.mjs'

const byName = (left: string, right: string) => left.localeCompare(right)
const packageRoot = join(import.meta.dirname, '..')
const sourceNames = readdirSync(join(packageRoot, 'svg'))
  .filter((file) => file.endsWith('.svg'))
  .map((file) => file.slice(0, -'.svg'.length))
  .sort(byName)

const svgWith = (body: string, rootExtra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"${rootExtra}>${body}</svg>`

describe('@kvirn-ui/icons', () => {
  it('has generated files that match what the generator writes from the svg files', () => {
    for (const [path, text] of buildOutputs(join(packageRoot, 'svg'), readMirrorList())) {
      expect(readFileSync(join(packageRoot, path), 'utf8')).toBe(text)
    }
  })

  it('has no stale generated module', () => {
    const modules = readdirSync(join(packageRoot, 'src/icons'))
      .map((file) => file.slice(0, -'.ts'.length))
      .sort(byName)
    expect(modules).toEqual(sourceNames)
  })

  it('gives no two icons the same export name', () => {
    expect(new Set(sourceNames.map(camelCase)).size).toBe(sourceNames.length)
  })

  it('accepts a valid icon', () => {
    expect(parseIcon('ok.svg', svgWith('<path d="M1 1"/>'))).toEqual([['path', { d: 'M1 1' }]])
  })

  it.each([
    ['a shape with fill', svgWith('<path d="M1 1" fill="red"/>')],
    ['a shape with transform', svgWith('<path d="M1 1" transform="scale(2)"/>')],
    ['a shape with style', svgWith('<path d="M1 1" style="stroke:red"/>')],
    ['an element off the allow-list', svgWith('<g><path d="M1 1"/></g>')],
    ['a text element', svgWith('<text>x</text>')],
    ['an extra root attribute', svgWith('<path d="M1 1"/>', ' width="24"')],
    ['a single-quoted attribute', svgWith("<path d='M1 1'/>")],
    ['an unquoted attribute', svgWith('<path d=M1/>')],
  ])('rejects %s', (_, source) => {
    expect(() => parseIcon('bad.svg', source)).toThrow(/^bad\.svg: /)
  })
})
