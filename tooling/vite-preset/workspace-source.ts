import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')

type Condition = string | { default?: string }

/**
 * Aliases `@kvirn-ui/<package>` imports to the package's TypeScript source, so Storybook and the
 * tests need no build. A package's `exports` point to `dist`, exactly as an adopter gets them;
 * `./dist/x.mjs` is built from `./src/x.ts`. The docs site gets no alias: it reads the built `dist`.
 */
export function workspaceSourceAlias() {
  const aliases: { find: RegExp; replacement: string }[] = []
  for (const directory of readdirSync(join(root, 'packages'))) {
    const pkgPath = join(root, 'packages', directory, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      name: string
      exports: Record<string, string | { import?: Condition }>
    }
    for (const [subpath, target] of Object.entries(pkg.exports)) {
      if (typeof target === 'string' || !target.import) continue
      const dist = typeof target.import === 'string' ? target.import : target.import.default
      if (!dist?.startsWith('./dist/')) continue
      const source = join(
        root,
        'packages',
        directory,
        dist.replace('./dist/', 'src/').replace(/\.mjs$/, '.ts'),
      )
      const name = subpath === '.' ? pkg.name : `${pkg.name}/${subpath.slice(2)}`
      aliases.push({ find: new RegExp(`^${name.replace(/[/@.]/g, '\\$&')}$`), replacement: source })
    }
  }
  return aliases
}
