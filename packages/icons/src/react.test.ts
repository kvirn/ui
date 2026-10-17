import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vite-plus/test'
import { add } from './icons/add.ts'
import { spinner } from './icons/spinner.ts'
import { createIconComponent, SvgIcon } from './react.ts'

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sourceFiles(join(directory, entry.name))
      : entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')
        ? [join(directory, entry.name)]
        : [],
  )

const render = (props: Record<string, unknown> = {}) =>
  renderToStaticMarkup(createElement(SvgIcon, { icon: add, ...props }))

describe('@kvirn-ui/icons standalone', () => {
  it('imports no package but itself, and react only from react.ts', () => {
    const offenders = sourceFiles(import.meta.dirname).filter((file) => {
      const text = readFileSync(file, 'utf8')
      return (
        /from ['"]@kvirn-ui\//.test(text) ||
        (!file.endsWith('react.ts') && /from ['"]react/.test(text))
      )
    })
    expect(offenders).toEqual([])
  })

  it('declares no dependencies and no @kvirn-ui package', () => {
    const manifest = JSON.parse(readFileSync(join(import.meta.dirname, '../package.json'), 'utf8'))
    expect(manifest.dependencies).toBeUndefined()
    expect(JSON.stringify(manifest)).not.toMatch(/"@kvirn-ui\/(?!icons")/)
    expect(manifest.peerDependenciesMeta.react.optional).toBe(true)
  })
})

describe('SvgIcon', () => {
  it('is hidden from assistive technology by default', () => {
    const markup = render()
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('focusable="false"')
    expect(markup).not.toContain('role=')
  })

  it('is an image with a name when it has an aria-label', () => {
    const markup = render({ 'aria-label': 'Add' })
    expect(markup).toContain('role="img"')
    expect(markup).toContain('aria-label="Add"')
    expect(markup).not.toContain('aria-hidden')
  })

  it('is an image named by aria-labelledby', () => {
    const markup = render({ 'aria-labelledby': 'caption' })
    expect(markup).toContain('role="img"')
    expect(markup).not.toContain('aria-hidden')
  })

  it('is an image named by its title', () => {
    const markup = render({ title: 'Add' })
    expect(markup).toContain('role="img"')
    expect(markup).toContain('<title>Add</title>')
    expect(markup).not.toContain('aria-hidden')
  })

  it('stays decorative when the aria-label, aria-labelledby or title is an empty string', () => {
    for (const props of [{ 'aria-label': '' }, { 'aria-labelledby': '' }, { title: '' }]) {
      const markup = render(props)
      expect(markup).toContain('aria-hidden="true"')
      expect(markup).not.toContain('role=')
    }
  })

  it('sizes width and height, 24 by default', () => {
    expect(render()).toContain('width="24" height="24"')
    expect(render({ size: 16 })).toContain('width="16" height="16"')
    expect(render({ size: '1.5rem' })).toContain('width="1.5rem" height="1.5rem"')
  })

  it('keeps the dash attributes of the spinner as SVG attributes', () => {
    const markup = render({ icon: spinner })
    expect(markup).toMatch(/stroke-dasharray="[^"]+"/)
    expect(markup).toContain('pathLength=')
  })

  it('gives the same component for the same data', () => {
    expect(createIconComponent(add)).toBe(createIconComponent(add))
    expect(createIconComponent(add)).not.toBe(createIconComponent(spinner))
    expect(renderToStaticMarkup(createElement(createIconComponent(add)))).toBe(render())
  })
})
