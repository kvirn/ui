import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import { findRawColours, listCheckedCssFiles, withoutPaletteBlock } from './find-raw-colours.ts'

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

describe('findRawColours', () => {
  it('finds hex colours in declarations', () => {
    expect(findRawColours('.a { color: #5e6ad2; background: #fff }')).toEqual(['#5e6ad2', '#fff'])
  })

  it('finds colour functions', () => {
    expect(
      findRawColours(
        '.a { color: rgb(0 0 0); background: hsl(200 50% 50% / 0.5); border-color: oklch(0.5 0.1 200) }',
      ),
    ).toEqual(['rgb(0 0 0)', 'hsl(200 50% 50% / 0.5)', 'oklch(0.5 0.1 200)'])
  })

  it('finds named colours, but not keywords or system colours', () => {
    expect(
      findRawColours(
        '.a { color: rebeccapurple; background: transparent; border-color: currentColor; outline-color: Highlight; fill: inherit }',
      ),
    ).toEqual(['rebeccapurple'])
  })

  it('allows var(--kv-*) and ignores comments, class names and selectors', () => {
    expect(
      findRawColours(
        '/* was #fff, a red button */ .red-button[data-tone="blue"] { color: var(--kv-color-danger) }',
      ),
    ).toEqual([])
  })
})

describe('withoutPaletteBlock', () => {
  it('drops the first :root block when it only defines palette steps', () => {
    const css = `@layer kv {
  /* Palette */
  :root { --kv-white: #ffffff; --kv-neutral-50: #f7f8f8; }
  :root { --kv-color-canvas: var(--kv-white); }
}`
    expect(findRawColours(withoutPaletteBlock(css))).toEqual([])
  })

  it('keeps a first block that sets anything other than palette steps', () => {
    const css = ':root { --kv-neutral-50: #f7f8f8; --kv-color-canvas: #ffffff; }'
    expect(findRawColours(withoutPaletteBlock(css))).toEqual(['#f7f8f8', '#ffffff'])
  })

  it('finds raw colours after the palette block', () => {
    const css = ':root { --kv-neutral-50: #f7f8f8; } .kv-button { color: #000; }'
    expect(findRawColours(withoutPaletteBlock(css))).toEqual(['#000'])
  })
})

describe('theme.css and app CSS (ADR-0013)', () => {
  it('finds the files it checks', () => {
    const files = listCheckedCssFiles(repositoryRoot).map((file) => relative(repositoryRoot, file))
    expect(files).toEqual(
      expect.arrayContaining([
        'packages/theme/theme.css',
        'apps/docs/app/docs.css',
        'apps/storybook/.storybook/preview.css',
      ]),
    )
  })

  it('use only var(--kv-*) and system colours; hex only in the theme.css palette', () => {
    const problems = listCheckedCssFiles(repositoryRoot).flatMap((file) =>
      findRawColours(withoutPaletteBlock(readFileSync(file, 'utf8'))).map(
        (colour) => `${relative(repositoryRoot, file)}: ${colour}`,
      ),
    )
    expect(problems).toEqual([])
  })
})
