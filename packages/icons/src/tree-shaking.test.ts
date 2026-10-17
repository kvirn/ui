import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite-plus'
import { describe, expect, it } from 'vite-plus/test'
import * as everyIcon from './all.ts'
import { add, arrowEast, bold, building } from './index.ts'

const indexPath = fileURLToPath(new URL('./index.ts', import.meta.url))
const reactPath = fileURLToPath(new URL('./react.ts', import.meta.url))

const bundleEntryOf = async (source: string) => {
  const directory = await mkdtemp(join(tmpdir(), 'kvirn-icons-'))
  try {
    const entry = join(directory, 'entry.ts')
    await writeFile(entry, source)
    const output = await build({
      configFile: false,
      logLevel: 'silent',
      build: {
        write: false,
        minify: false,
        lib: { entry, formats: ['es'] },
        rollupOptions: { external: ['react'] },
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

const bundleImportOf = (name: string) =>
  bundleEntryOf(`import { ${name} } from ${JSON.stringify(indexPath)}\nconsole.log(${name})\n`)

const shapeValues = (icon: typeof add) =>
  icon.shapes.flatMap(([, attributes]) => Object.values(attributes).map(String))

describe('tree-shaking', () => {
  it('importing one icon bundles one icon', async () => {
    const code = await bundleImportOf('add')
    const kept = shapeValues(add)
    const others = [arrowEast, bold, building]
      .flatMap(shapeValues)
      .filter((value) => !kept.includes(value))
    const everything = JSON.stringify(Object.values(everyIcon))

    for (const value of kept) expect(code).toContain(value)
    expect(others.length).toBeGreaterThan(0)
    for (const value of others) expect(code).not.toContain(value)
    expect(code.length).toBeLessThan(everything.length / 20)
  })

  it('importing SvgIcon with one icon bundles one icon', async () => {
    const code = await bundleEntryOf(
      `import { add } from ${JSON.stringify(indexPath)}\nimport { SvgIcon } from ${JSON.stringify(reactPath)}\nconsole.log(SvgIcon, add)\n`,
    )
    const others = [arrowEast, bold, building]
      .flatMap(shapeValues)
      .filter((value) => !shapeValues(add).includes(value))

    for (const value of shapeValues(add)) expect(code).toContain(value)
    for (const value of others) expect(code).not.toContain(value)
  })
})
