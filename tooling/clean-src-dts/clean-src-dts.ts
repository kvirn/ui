import { readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

// `vp pack`'s tsgo declaration step leaves .d.ts files next to the sources (git-ignored). A later
// build can bundle those stale declarations instead of the sources and miss new exports, so each
// package that builds with tsgo removes them first. Run from the package directory.
const source = join(process.cwd(), 'src')
let removed = 0
for (const entry of readdirSync(source, { recursive: true, withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.d.ts')) {
    rmSync(join(entry.parentPath, entry.name))
    removed++
  }
}
if (removed > 0) console.log(`clean-src-dts: removed ${removed} stale declaration files from src`)
