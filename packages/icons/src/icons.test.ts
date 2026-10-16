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

const catalog: {
  categories: { id: string }[]
  icons: {
    name: string
    category: string
    aliases: string[]
    tags: string[]
    meaning: string
    status: string
    mirrorInRtl: boolean
  }[]
} = JSON.parse(readFileSync(join(packageRoot, 'catalog.json'), 'utf8'))
const mirrorList: string[] = JSON.parse(
  readFileSync(join(packageRoot, 'mirror-in-rtl.json'), 'utf8'),
)

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

  it('accepts the dash attributes on a path only', () => {
    expect(
      parseIcon('dash.svg', svgWith('<path d="M1 1" pathLength="100" stroke-dasharray="75 25"/>')),
    ).toEqual([['path', { d: 'M1 1', pathLength: '100', 'stroke-dasharray': '75 25' }]])
    expect(() =>
      parseIcon('bad.svg', svgWith('<circle cx="1" cy="1" r="1" pathLength="100"/>')),
    ).toThrow(/^bad\.svg: /)
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

  it('has a catalogue entry for every svg and an svg for every entry', () => {
    expect(catalog.icons.map((icon) => icon.name).sort(byName)).toEqual(sourceNames)
  })

  it('gives no two icons the same name or alias, and no alias that is another icon name', () => {
    const words = catalog.icons.flatMap((icon) => [icon.name, ...icon.aliases])
    expect(words.filter((word, index) => words.indexOf(word) !== index)).toEqual([])
  })

  it('puts every icon in a listed category', () => {
    const ids = catalog.categories.map((category) => category.id)
    expect(catalog.icons.filter((icon) => !ids.includes(icon.category))).toEqual([])
  })

  it('has only drawn icons', () => {
    expect(catalog.icons.filter((icon) => icon.status !== 'drawn')).toEqual([])
  })

  it('marks mirrorInRtl exactly for the icons in mirror-in-rtl.json', () => {
    const flagged = catalog.icons.filter((icon) => icon.mirrorInRtl).map((icon) => icon.name)
    expect(flagged.sort(byName)).toEqual([...mirrorList].sort(byName))
  })

  it('never mirrors an icon that is badged, slashed or a status container', () => {
    expect(mirrorList.filter((name) => /-(add|remove|off|check)$/.test(name))).toEqual([])
  })

  it('does not describe a non-mirrored icon by inline start or inline end', () => {
    const wrong = catalog.icons.filter(
      (icon) => !icon.mirrorInRtl && /inline (start|end)/i.test(icon.meaning),
    )
    expect(wrong.map((icon) => icon.name)).toEqual([])
  })

  it('writes aliases and tags in ASCII letters only', () => {
    const words = catalog.icons.flatMap((icon) => [...icon.aliases, ...icon.tags])
    expect(words.filter((word) => /[^ -~]/.test(word))).toEqual([])
  })
})
