import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as everyIcon from '../../packages/icons/src/all.ts'
import type { IconData } from '../../packages/icons/src/icon-data.ts'
import {
  arrowEast,
  arrowNorth,
  arrowSouth,
  arrowWest,
  bold,
  building,
  clearFormatting,
  code,
  home,
  image,
  indent,
  italic,
  link,
  locate,
  mail,
  numberedList,
  outdent,
  pin,
  redo,
  remove,
  strike,
  table,
  undo,
  underline,
  bulletList,
} from '../../packages/icons/src/index.ts'
import { build } from 'vite-plus'
import { describe, expect, it } from 'vite-plus/test'
import { workspaceSourceAlias } from '../vite-preset/workspace-source.ts'

const mapIconsPath = fileURLToPath(new URL('../../packages/map/src/map-icons.ts', import.meta.url))
const richTextIconsPath = fileURLToPath(
  new URL('../../packages/rich-text/src/rich-text-editor/icons.tsx', import.meta.url),
)

const bundleOf = async (source: string) => {
  const directory = await mkdtemp(join(tmpdir(), 'kvirn-package-icons-'))
  try {
    const entry = join(directory, 'entry.ts')
    await writeFile(entry, source)
    const output = await build({
      configFile: false,
      logLevel: 'silent',
      resolve: { alias: workspaceSourceAlias() },
      build: {
        write: false,
        minify: false,
        lib: { entry, formats: ['es'] },
        rollupOptions: { external: ['react', 'react/jsx-runtime'] },
      },
    })
    return (Array.isArray(output) ? output : [output])
      .flatMap((result) => ('output' in result ? result.output : []))
      .map((chunk) => ('code' in chunk ? chunk.code : ''))
      .join('\n')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

const shapeValues = (icon: IconData) =>
  icon.shapes.flatMap(([, attributes]: IconData['shapes'][number]) =>
    Object.values(attributes).map(String),
  )

const everything = JSON.stringify(Object.values(everyIcon))

describe('package icon bundles', () => {
  it('the map bundles the icons it names and no others', async () => {
    const bundle = await bundleOf(
      `import { mapIcons } from ${JSON.stringify(mapIconsPath)}\nconsole.log(mapIcons)\n`,
    )
    const kept = [pin, locate, remove, arrowNorth, arrowSouth, arrowWest, arrowEast].flatMap(
      shapeValues,
    )
    const others = [bold, building, home, mail]
      .flatMap(shapeValues)
      .filter((v) => !kept.includes(v))

    for (const value of kept) expect(bundle).toContain(value)
    expect(others.length).toBeGreaterThan(0)
    for (const value of others) expect(bundle).not.toContain(value)
    expect(bundle.length).toBeLessThan(everything.length / 10)
  })

  it('the rich text editor bundles the icons it names and no others', async () => {
    const bundle = await bundleOf(
      `import { richTextIconNames, ToolbarIcon } from ${JSON.stringify(richTextIconsPath)}\nconsole.log(richTextIconNames, ToolbarIcon)\n`,
    )
    const kept = [
      undo,
      redo,
      bold,
      italic,
      underline,
      strike,
      code,
      bulletList,
      numberedList,
      indent,
      outdent,
      link,
      image,
      table,
      clearFormatting,
    ].flatMap(shapeValues)
    const others = [building, home, mail].flatMap(shapeValues).filter((v) => !kept.includes(v))

    for (const value of kept) expect(bundle).toContain(value)
    expect(others.length).toBeGreaterThan(0)
    for (const value of others) expect(bundle).not.toContain(value)
    expect(bundle.length).toBeLessThan(everything.length / 2)
  })
})
